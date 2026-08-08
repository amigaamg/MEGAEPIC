// Encounter persistence — localStorage + Firestore full-state dual persistence.
// The Complete orchestrator working-state (answers, problems, differentials,
// orders, phase) is stored to a Firestore `states/main` doc so an encounter can
// be resumed across devices, while localStorage+IndexedDB keeps it working offline.
import { saveEncounter as localSave, loadEncounter as localLoad, listRecentEncounters as localList, completeEncounter as localComplete } from '@/lib/amexan/persistence/localStorage';
import type { SavedEncounter as LocalSavedEncounter } from '@/lib/amexan/persistence/localStorage';
import type { EncounterOrchestratorState } from '../encounter-engine/engines/orchestrator';
import { createEncounter, updateEncounter, getEncounter, saveEncounterState, getEncounterState } from '@/lib/firebase/encounterService';

export type SavedEncounter = LocalSavedEncounter;

const DEFAULT_DEPT = 'OUTPATIENT';
const DEFAULT_UNIT = 'general';

export async function saveEncounter(
  orgId: string,
  encounterId: string,
  state: EncounterOrchestratorState,
): Promise<void> {
  localSave(orgId, encounterId, state);
  try {
    await saveEncounterState(DEFAULT_DEPT, DEFAULT_UNIT, encounterId, state as unknown as Record<string, unknown>, orgId);
    const existing = await getEncounter(DEFAULT_DEPT, DEFAULT_UNIT, encounterId, orgId).catch(() => null);
    if (existing) {
      await updateEncounter(DEFAULT_DEPT, DEFAULT_UNIT, encounterId, {
        status: 'active',
        activePhase: state.currentPhase || 'triage',
        completedPhases: state.completedPhases || [],
        diagnosis: state.differentials?.map((d: any) => d.diseaseName || d.diseaseId) || [],
        clinicianNotes: state.hpiNarrative || '',
      }, orgId);
    } else {
      await createEncounter({
        patientId: state.biodata?.hospitalNumber || 'new',
        patientName: state.biodata?.patientName || 'Unknown',
        departmentId: DEFAULT_DEPT,
        unitId: DEFAULT_UNIT,
        encounterType: (state.biodata?.encounterType as any) || 'outpatient',
        status: 'active',
        createdBy: state.biodata?.clinician || 'system',
        activePhase: state.currentPhase || 'triage',
        completedPhases: state.completedPhases || [],
        diagnosis: [],
        clinicianNotes: '',
      }, orgId, encounterId);
    }
  } catch {
    // Firestore save is best-effort; localStorage always works
  }
}

/**
 * Reconstruct the full orchestrator working-state. Prefers the Firestore
 * `states/main` blob (cross-device), falls back to localStorage.
 */
export async function loadEncounter(
  orgId: string,
  encounterId: string,
): Promise<{ state: any; answers: Record<string, any> } | null> {
  try {
    const remoteState = await getEncounterState(DEFAULT_DEPT, DEFAULT_UNIT, encounterId, orgId);
    if (remoteState && (remoteState.biodata || remoteState.questionEngine || Object.keys(remoteState).length > 0)) {
      const answers = (remoteState as any).questionEngine?.answers
        || (remoteState as any).answers
        || {};
      return { state: remoteState, answers };
    }
  } catch { }
  const local = await localLoad(orgId, encounterId);
  if (local) return local;
  try {
    const remote = await getEncounter(DEFAULT_DEPT, DEFAULT_UNIT, encounterId, orgId);
    if (remote) {
      return {
        state: { biodata: { patientName: remote.patientName, hospitalNumber: remote.patientId } },
        answers: {},
      };
    }
  } catch { }
  return null;
}

export async function listRecentEncounters(
  orgId: string,
  maxResults: number = 20,
): Promise<SavedEncounter[]> {
  const local = localList(orgId, maxResults);
  try {
    const { collectionGroup, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');
    const q = query(
      collectionGroup(db, 'encounters'),
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    );
    const snap = await getDocs(q);
    const remote: SavedEncounter[] = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        encounterId: d.id,
        patientName: data.patientName || 'Unknown',
        hospitalNumber: data.patientId || '',
        status: data.status === 'active' ? 'active' as const : 'completed' as const,
        currentPhase: data.activePhase || 'unknown',
        updatedAt: data.updatedAt || data.createdAt || 0,
        createdAt: data.createdAt || 0,
      };
    });
    if (remote.length > 0) return remote;
  } catch { }
  return local;
}

export async function completeEncounter(
  orgId: string,
  encounterId: string,
): Promise<void> {
  localComplete(orgId, encounterId);
  try {
    await updateEncounter(DEFAULT_DEPT, DEFAULT_UNIT, encounterId, { status: 'completed' }, orgId);
  } catch { }
}