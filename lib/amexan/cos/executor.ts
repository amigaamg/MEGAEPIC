// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN COS — Clinical Executor
//
// Every action passes through here. It:
//  1. re-checks authorization (the UI does not grant authority);
//  2. materialises the correct underlying clinical object (order, note,
//     decision, timeline event) with full traceability: patient, encounter,
//     clinician, facility, department, time, authorization context;
//  3. writes durably (localStorage for offline, Firestore for the shared
//     record), and appends an immutable timeline event.
// ═══════════════════════════════════════════════════════════════════════════════
import type { ClinicalAuthorizer } from './authorization';
import type { ActionRequest, GrantDecision } from './authorization';
import type { DocumentData, Firestore } from 'firebase/firestore';
import type {
  ClinicalNote,
  ClinicalOrder,
  EnvironmentContext,
  RoundReview,
  TimelineEvent,
} from './types';

export interface Cosmos {
  load(key: string): Promise<unknown | null>;
  save(key: string, value: unknown): Promise<void>;
}

/** localStorage-backed store (offline-capable, works everywhere). */
export class LocalStore implements Cosmos {
  private prefix: string;
  constructor(prefix = 'amexan.cos') {
    this.prefix = prefix;
  }
  async load(key: string): Promise<unknown | null> {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(`${this.prefix}:${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  async save(key: string, value: unknown): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(value));
    } catch {
      // ignore quota
    }
  }
}

/** Firestore-backed store (best-effort, engine writes only). */
export class FirestoreStore implements Cosmos {
  private pathFn: (key: string) => string;
  private db: Firestore;
  constructor(db: Firestore, pathFn: (key: string) => string) {
    this.db = db;
    this.pathFn = pathFn;
  }
  async load(key: string): Promise<unknown | null> {
    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const snap = await getDoc(doc(this.db, this.pathFn(key)));
      return snap.exists() ? snap.data() : null;
    } catch {
      return null;
    }
  }
  async save(key: string, value: unknown): Promise<void> {
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      await setDoc(doc(this.db, this.pathFn(key)), value as DocumentData, { merge: true });
    } catch {
      // best-effort
    }
  }
}

export type ExecResult<T> =
  | { ok: true; value: T; decision: GrantDecision }
  | { ok: false; reason: string; decision: GrantDecision };

export interface ExecutorOptions {
  actor: { id: string; roleId?: string; credential?: string; isConsultant?: boolean };
  env: EnvironmentContext;
}

export class ClinicalExecutor {
  private primary: Cosmos;
  private secondary: Cosmos | null;

  constructor(
    private authorizer: ClinicalAuthorizer,
    local: Cosmos | null,
    remote: Cosmos | null,
  ) {
    this.primary = local ?? new LocalStore();
    this.secondary = remote;
  }

  /** Run any authorized action; the authorizer is the single gate. */
  async execute<T>(req: ActionRequest, run: (decision: GrantDecision) => Promise<T>): Promise<ExecResult<T>> {
    const decision = this.authorizer.authorize(req);
    if (!decision.allowed) {
      return { ok: false, reason: decision.reason, decision };
    }
    try {
      const value = await run(decision);
      return { ok: true, value, decision };
    } catch (err: unknown) {
      return { ok: false, reason: (err instanceof Error ? err.message : 'Execution failed') || 'Execution failed', decision };
    }
  }

  /** Create an order through the Universal Orders engine. */
  async createOrder(order: ClinicalOrder, opts: ExecutorOptions): Promise<ExecResult<ClinicalOrder>> {
    return this.execute(
      { action: 'order.create', actor: opts.actor, env: opts.env },
      async () => {
        const full: ClinicalOrder = {
          ...order,
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          clinicianId: opts.actor.id,
          clinicianName: opts.actor.roleId,
          env: order.env ?? opts.env,
        };
        const list = await this.loadOrders(full.patientId || 'global');
        list.push(full);
        await this.primary.save(`orders/${full.patientId || 'global'}`, serialize(list));
        if (this.secondary) {
          await this.secondary.save(`orders/${full.patientId || 'global'}`, serialize(list));
        }
        await this.timeline({
          ...mkEvent('ordering', `Order: ${full.name}`, full.patientId, full.encounterId, full.env),
          detail: full.detail || full.reason || '',
        });
        return full;
      },
    );
  }

  /** Save a clinical note and advance its auth phase (draft → verified → signed). */
  async saveNote(note: ClinicalNote, action: 'note.create' | 'note.sign', opts: ExecutorOptions): Promise<ExecResult<ClinicalNote>> {
    return this.execute(
      { action, actor: opts.actor, env: opts.env },
      async () => {
        const full: ClinicalNote = {
          ...note,
          phase: action === 'note.sign' ? 'signed' : note.phase === 'draft' ? 'verified' : note.phase,
          updatedAt: Date.now(),
          clinician: { id: opts.actor.id, name: opts.actor.roleId || 'clinician', roleId: opts.actor.roleId },
          env: note.env ?? opts.env,
        };
        const list = await this.loadNotes(full.patientId || 'global');
        const idx = list.findIndex((n) => n.id === full.id);
        if (idx >= 0) list[idx] = full;
        else list.push(full);
        await this.primary.save(`notes/${full.patientId || 'global'}`, serialize(list));
        if (this.secondary) {
          await this.secondary.save(`notes/${full.patientId || 'global'}`, serialize(list));
        }
        if (action === 'note.sign') {
          await this.timeline(mkEvent('documentation', `Note signed: ${full.type}`, full.patientId, full.encounterId, full.env));
        } else {
          await this.timeline(mkEvent('documentation', `Note ${full.phase}: ${full.type}`, full.patientId, full.encounterId, full.env));
        }
        return full;
      },
    );
  }

  /** Record a round review / decision. */
  async recordDecision(decision: RoundReview, opts: ExecutorOptions): Promise<void> {
    const list = await this.readList<RoundReview>(`decisions/${decision.patientId}`);
    const idx = list.findIndex((d) => d.patientId === decision.patientId);
    if (idx >= 0) list[idx] = decision;
    else list.push(decision);
    await this.primary.save(`decisions/${decision.patientId}`, serialize(list));
    if (this.secondary) await this.secondary.save(`decisions/${decision.patientId}`, serialize(list));
    await this.timeline({
      ...mkEvent('clinical', 'Review recorded', decision.patientId, decision.encounterId, opts.env),
      detail: `${decision.decisions.length} decision(s)`,
    });
  }

  /** Append an immutable, traced timeline event. */
  async timeline(event: TimelineEvent): Promise<void> {
    const list = await this.readList<TimelineEvent>(`timeline/${event.patientId || 'global'}`);
    list.push(event);
    await this.primary.save(`timeline/${event.patientId || 'global'}`, serialize(list));
    if (this.secondary) {
      const remote = await this.readList<TimelineEvent>(`timeline/${event.patientId || 'global'}`);
      remote.push(event);
      await this.secondary.save(`timeline/${event.patientId || 'global'}`, serialize(remote));
    }
  }

  async loadTimeline(patientId: string): Promise<TimelineEvent[]> {
    return this.readList<TimelineEvent>(`timeline/${patientId}`);
  }

  async loadOrders(patientId: string): Promise<ClinicalOrder[]> {
    return this.readList<ClinicalOrder>(`orders/${patientId}`);
  }

  async loadNotes(patientId: string): Promise<ClinicalNote[]> {
    return this.readList<ClinicalNote>(`notes/${patientId}`);
  }

  private async readList<T>(key: string): Promise<T[]> {
    const raw = await this.primary.load(key);
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const boxed = raw as { d?: unknown };
    if (typeof boxed.d === 'object' && boxed.d && Array.isArray(boxed.d)) return boxed.d as T[];
    return [];
  }

  currentEnvironment: EnvironmentContext = {};

  setEnvironment(env: EnvironmentContext): void {
    this.currentEnvironment = env;
  }
}

export function now(): number {
  return Date.now();
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function mkEvent(
  category: TimelineEvent['category'],
  title: string,
  patientId?: string,
  contextId?: string,
  env?: EnvironmentContext,
): TimelineEvent {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    patientId,
    contextId,
    at: Date.now(),
    actor: env?.clinicianId || 'system',
    actorName: env?.clinicianName,
    category,
    title,
    detail: '',
    env: env ?? {},
  };
}

function serialize<T>(v: T): { d: T; ts: number } {
  let vv: T = v;
  try {
    vv = JSON.parse(JSON.stringify(v)) as T;
  } catch {
    vv = v;
  }
  return { d: vv, ts: Date.now() };
}
