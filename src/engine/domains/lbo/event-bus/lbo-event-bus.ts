export type LboEventType =
  | 'patient_registered'
  | 'symptom_added'
  | 'exam_finding_added'
  | 'vital_updated'
  | 'lab_result_received'
  | 'imaging_result_received'
  | 'diagnosis_updated'
  | 'red_flag_triggered'
  | 'sepsis_alert'
  | 'ischemia_alert'
  | 'state_transition'
  | 'management_decision'
  | 'operative_decision'
  | 'postop_complication'
  | 'discharge_ordered'
  | 'followup_scheduled';

export interface LboEvent {
  type: LboEventType;
  timestamp: string;
  data: Record<string, unknown>;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type EventHandler = (event: LboEvent) => void;

export interface EventSubscription {
  eventType: LboEventType | '*';
  handler: EventHandler;
  id: string;
}

export class LboEventBus {
  private static instance: LboEventBus;
  private subscriptions: EventSubscription[] = [];
  private eventHistory: LboEvent[] = [];
  private maxHistory = 500;

  static getInstance(): LboEventBus {
    if (!LboEventBus.instance) {
      LboEventBus.instance = new LboEventBus();
    }
    return LboEventBus.instance;
  }

  subscribe(eventType: LboEventType | '*', handler: EventHandler, id: string): () => void {
    const sub: EventSubscription = { eventType, handler, id };
    this.subscriptions.push(sub);
    return () => {
      this.subscriptions = this.subscriptions.filter(s => s.id !== id);
    };
  }

  emit(event: LboEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    for (const sub of this.subscriptions) {
      if (sub.eventType === '*' || sub.eventType === event.type) {
        try {
          sub.handler(event);
        } catch (err) {
          console.error(`[LBO EventBus] Handler ${sub.id} failed for ${event.type}:`, err);
        }
      }
    }
  }

  getHistory(): LboEvent[] {
    return [...this.eventHistory];
  }

  getHistoryByType(type: LboEventType): LboEvent[] {
    return this.eventHistory.filter(e => e.type === type);
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  getLastEvent(): LboEvent | undefined {
    return this.eventHistory[this.eventHistory.length - 1];
  }
}

// ── Convenience creators ────────────────────────────────────────────────────

export function createLboEvent(
  type: LboEventType,
  data: Record<string, unknown>,
  source: string,
  priority: LboEvent['priority'] = 'medium',
): LboEvent {
  return {
    type,
    timestamp: new Date().toISOString(),
    data,
    source,
    priority,
  };
}

export function emitLabResult(lactate: number, lactateTrend: string, source: string): void {
  LboEventBus.getInstance().emit(createLboEvent(
    'lab_result_received',
    { lactate, lactateTrend, testName: 'Lactate', value: lactate, flag: lactate > 4 ? 'critical' : lactate > 2 ? 'abnormal' : 'normal' },
    source,
    lactate > 4 ? 'critical' : lactate > 2 ? 'high' : 'medium',
  ));
}

export function emitImagingResult(ctFindings: string[], subtype: string, source: string): void {
  LboEventBus.getInstance().emit(createLboEvent(
    'imaging_result_received',
    { ctFindings, subtype, modality: 'CT Abdomen + Pelvis' },
    source,
    'high',
  ));
}

export function emitStateTransition(from: string, to: string, source: string): void {
  LboEventBus.getInstance().emit(createLboEvent(
    'state_transition',
    { from, to },
    source,
    'medium',
  ));
}

export function emitRedFlag(flagName: string, severity: string, source: string): void {
  LboEventBus.getInstance().emit(createLboEvent(
    'red_flag_triggered',
    { flagName, severity, timestamp: new Date().toISOString() },
    source,
    severity === 'critical' ? 'critical' : 'high',
  ));
}
