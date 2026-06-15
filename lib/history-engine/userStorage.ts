// ── USER STORAGE SYSTEM ──
// Anonymous user ID + encounter persistence in localStorage

import type { HistoryState } from './types';

const USER_ID_KEY = 'amexan_user_id';
const ENCOUNTERS_KEY = 'amexan_encounters';
const CURRENT_KEY = 'amexan_current_state';

// ── Generate anonymous user ID ──
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server';
  let uid = localStorage.getItem(USER_ID_KEY);
  if (!uid) {
    uid = crypto.randomUUID?.() ?? `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

// ── Encounter record ──
export interface EncounterRecord {
  id: string;
  userId: string;
  patientName: string;
  patientAge: number;
  profile: string;
  chiefComplaints: string;
  provisionalDiagnosis: string;
  dateCreated: string;
  dateModified: string;
  state: HistoryState;
  followUp: FollowUpRecord[];
  completed: boolean;
}

export interface FollowUpRecord {
  id: string;
  encounterId: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  type?: string;
  notes: string;
  findings: string;
  outcome: string;
}

// ── Save current encounter ──
export function saveEncounter(state: HistoryState): string {
  const userId = getUserId();
  const encounters = loadAllEncounters();
  const existing = encounters.find(e => e.id === state.activeSection); // won't match; use explicit id

  const record: EncounterRecord = {
    id: `enc_${Date.now()}`,
    userId,
    patientName: state.biodata.name || 'Unnamed',
    patientAge: state.biodata.age || 0,
    profile: state.biodata.profile,
    chiefComplaints: state.chiefComplaints.map(c => c.label).join(', ') || 'None',
    provisionalDiagnosis: state.provisionalDiagnosis?.diagnosis || 'Pending',
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    state,
    followUp: [],
    completed: state.completedSections.includes('summary'),
  };

  const updated = [record, ...encounters.filter(e => e.id !== record.id)];
  localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(updated));
  localStorage.setItem(CURRENT_KEY, JSON.stringify(state));
  return record.id;
}

// ── Auto-save current state (debounced) ──
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
export function autoSaveState(state: HistoryState): void {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(state));
  }, 2000);
}

// ── Load all encounters for current user ──
export function loadAllEncounters(): EncounterRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ENCOUNTERS_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as EncounterRecord[];
    const userId = getUserId();
    return all.filter(e => e.userId === userId).sort((a, b) =>
      new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
    );
  } catch { return []; }
}

// ── Load specific encounter ──
export function loadEncounter(encounterId: string): EncounterRecord | null {
  const all = loadAllEncounters();
  return all.find(e => e.id === encounterId) || null;
}

// ── Delete encounter ──
export function deleteEncounter(encounterId: string): void {
  const all = loadAllEncounters();
  const updated = all.filter(e => e.id !== encounterId);
  localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(updated));
}

// ── Update encounter (save changes) ──
export function updateEncounter(encounterId: string, updates: Partial<EncounterRecord>): void {
  const all = loadAllEncounters();
  const updated = all.map(e =>
    e.id === encounterId ? { ...e, ...updates, dateModified: new Date().toISOString() } : e
  );
  localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(updated));
}

// ── Add follow-up to encounter ──
export function addFollowUp(encounterId: string, followUp: FollowUpRecord): void {
  const all = loadAllEncounters();
  const updated = all.map(e =>
    e.id === encounterId ? { ...e, followUp: [...e.followUp, followUp] } : e
  );
  localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(updated));
}

// ── Restore last auto-saved state ──
export function loadLastState(): HistoryState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) as HistoryState : null;
  } catch { return null; }
}

// ── Clear all data for current user ──
export function clearAllData(): void {
  localStorage.removeItem(ENCOUNTERS_KEY);
  localStorage.removeItem(CURRENT_KEY);
}
