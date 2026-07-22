// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Constitution — Firestore Persistence Layer
// CRUD for all clinical constitution types: ClinicalFact, EpisodeOfCare,
// PatientJourney, Encounter, WorkflowInstance, ClinicalQueue, ClinicalTask, etc.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc,
  collection, collectionGroup, query, where, orderBy, limit,
  type DocumentReference, type CollectionReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

import type {
  ClinicalFact, EpisodeOfCare, PatientJourney,
  CareNetwork, ConsentDirective, CareGap,
  Encounter, EncounterTimelineEvent,
  WorkflowInstance, ClinicalQueue, ClinicalTask,
  DoctorContext, WardRound, HandoverNote,
  CareTeamContext, CareTeamProfession, CareTeamWorkspace,
  CareTeamHandoverNote, CareTeamNotification,
} from './types';

// ── Helper: doc-to-type with id injection ─────────────────────────────────────

function docTo<T>(snap: any): T | null {
  return snap.exists() ? { id: snap.id, ...snap.data() } as T : null;
}

function docsTo<T>(snap: any): T[] {
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as T);
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOK II VOL I: PATIENT JOURNEY
// ═════════════════════════════════════════════════════════════════════════════

// ── Patient Journey ───────────────────────────────────────────────────────────

export function journeyRef(patientId: string): DocumentReference {
  return doc(db, 'patient_journeys', patientId);
}

export async function createPatientJourney(patientId: string): Promise<void> {
  await setDoc(journeyRef(patientId), { patientId, createdAt: Date.now(), updatedAt: Date.now(), factCount: 0, episodeIds: [], careNetworkIds: [], consentIds: [] });
}

export async function getPatientJourney(patientId: string): Promise<PatientJourney | null> {
  const snap = await getDoc(journeyRef(patientId));
  return docTo<PatientJourney>(snap);
}

// ── Clinical Facts ────────────────────────────────────────────────────────────

export function factRef(patientId: string, factId: string): DocumentReference {
  return doc(db, 'patient_journeys', patientId, 'facts', factId);
}

export function factsCol(patientId: string): CollectionReference {
  return collection(db, 'patient_journeys', patientId, 'facts');
}

export async function createFact(patientId: string, fact: ClinicalFact): Promise<void> {
  await setDoc(factRef(patientId, fact.id), fact);
  const jRef = journeyRef(patientId);
  const snap = await getDoc(jRef);
  if (snap.exists()) {
    await updateDoc(jRef, { factCount: (snap.data().factCount ?? 0) + 1, updatedAt: Date.now() });
  }
}

export async function getFact(patientId: string, factId: string): Promise<ClinicalFact | null> {
  const snap = await getDoc(factRef(patientId, factId));
  return docTo<ClinicalFact>(snap);
}

export async function listFacts(
  patientId: string,
  options?: { trustLayer?: number; episodeId?: string; maxResults?: number },
): Promise<ClinicalFact[]> {
  const constraints: any[] = [orderBy('timestamp', 'desc')];
  if (options?.trustLayer) constraints.unshift(where('trustLayer', '==', options.trustLayer));
  if (options?.episodeId) constraints.unshift(where('episodeId', '==', options.episodeId));
  if (options?.maxResults) constraints.push(limit(options.maxResults));

  const q = query(factsCol(patientId), ...constraints);
  const snap = await getDocs(q);
  return docsTo<ClinicalFact>(snap);
}

// ── Episodes of Care ──────────────────────────────────────────────────────────

export function episodeRef(patientId: string, episodeId: string): DocumentReference {
  return doc(db, 'patient_journeys', patientId, 'episodes', episodeId);
}

export function episodesCol(patientId: string): CollectionReference {
  return collection(db, 'patient_journeys', patientId, 'episodes');
}

export async function createEpisode(patientId: string, episode: EpisodeOfCare): Promise<void> {
  await setDoc(episodeRef(patientId, episode.id), episode);
  const jRef = journeyRef(patientId);
  await updateDoc(jRef, { episodeIds: [...(await getDoc(jRef)).data()?.episodeIds ?? [], episode.id], updatedAt: Date.now() });
}

export async function getEpisode(patientId: string, episodeId: string): Promise<EpisodeOfCare | null> {
  const snap = await getDoc(episodeRef(patientId, episodeId));
  return docTo<EpisodeOfCare>(snap);
}

export async function updateEpisode(patientId: string, episodeId: string, data: Partial<EpisodeOfCare>): Promise<void> {
  await updateDoc(episodeRef(patientId, episodeId), { ...data, updatedAt: Date.now() });
}

export async function listEpisodes(patientId: string): Promise<EpisodeOfCare[]> {
  const q = query(episodesCol(patientId), orderBy('startDate', 'desc'));
  const snap = await getDocs(q);
  return docsTo<EpisodeOfCare>(snap);
}

// ── Care Network ──────────────────────────────────────────────────────────────

export function careNetworkRef(patientId: string, networkId: string): DocumentReference {
  return doc(db, 'patient_journeys', patientId, 'care_networks', networkId);
}

export async function getCareNetwork(patientId: string, networkId: string): Promise<CareNetwork | null> {
  const snap = await getDoc(careNetworkRef(patientId, networkId));
  return docTo<CareNetwork>(snap);
}

export async function saveCareNetwork(patientId: string, network: CareNetwork): Promise<void> {
  await setDoc(careNetworkRef(patientId, network.id), network);
}

// ── Consent Directives ────────────────────────────────────────────────────────

export function consentRef(patientId: string, consentId: string): DocumentReference {
  return doc(db, 'patient_journeys', patientId, 'consents', consentId);
}

export async function saveConsent(patientId: string, consent: ConsentDirective): Promise<void> {
  await setDoc(consentRef(patientId, consent.id), consent);
}

export async function listConsents(patientId: string): Promise<ConsentDirective[]> {
  const snap = await getDocs(collection(db, 'patient_journeys', patientId, 'consents'));
  return docsTo<ConsentDirective>(snap);
}

// ── Care Gaps ─────────────────────────────────────────────────────────────────

export function careGapRef(patientId: string, gapId: string): DocumentReference {
  return doc(db, 'patient_journeys', patientId, 'care_gaps', gapId);
}

export async function saveCareGap(patientId: string, gap: CareGap): Promise<void> {
  await setDoc(careGapRef(patientId, gap.id), gap);
}

export async function listCareGaps(patientId: string): Promise<CareGap[]> {
  const snap = await getDocs(collection(db, 'patient_journeys', patientId, 'care_gaps'));
  return docsTo<CareGap>(snap);
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOK II VOL II: ENCOUNTERS
// ═════════════════════════════════════════════════════════════════════════════

// Encounters stored under organizations for operational access
// and under patient journeys for longitudinal access.

export function orgEncounterRef(orgId: string, encounterId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'encounters', encounterId);
}

export function orgEncountersCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'encounters');
}

export function patientEncounterRef(patientId: string, encounterId: string): DocumentReference {
  return doc(db, 'patient_journeys', patientId, 'encounters', encounterId);
}

export function patientEncountersCol(patientId: string): CollectionReference {
  return collection(db, 'patient_journeys', patientId, 'encounters');
}

export async function createEncounter(orgId: string, patientId: string, encounter: Encounter): Promise<void> {
  await Promise.all([
    setDoc(orgEncounterRef(orgId, encounter.id), encounter),
    setDoc(patientEncounterRef(patientId, encounter.id), encounter),
  ]);
}

export async function getEncounter(orgId: string, encounterId: string): Promise<Encounter | null> {
  const snap = await getDoc(orgEncounterRef(orgId, encounterId));
  return docTo<Encounter>(snap);
}

export async function updateEncounter(orgId: string, patientId: string, encounterId: string, data: Partial<Encounter>): Promise<void> {
  await Promise.all([
    updateDoc(orgEncounterRef(orgId, encounterId), { ...data, updatedAt: Date.now() }),
    updateDoc(patientEncounterRef(patientId, encounterId), { ...data, updatedAt: Date.now() }),
  ]);
}

export async function listEncounters(orgId: string, options?: { departmentId?: string; state?: string; maxResults?: number }): Promise<Encounter[]> {
  const constraints: any[] = [orderBy('startTime', 'desc')];
  if (options?.departmentId) constraints.unshift(where('departmentId', '==', options.departmentId));
  if (options?.state) constraints.unshift(where('currentState', '==', options.state));
  if (options?.maxResults) constraints.push(limit(options.maxResults));

  const q = query(orgEncountersCol(orgId), ...constraints);
  const snap = await getDocs(q);
  return docsTo<Encounter>(snap);
}

export async function listPatientEncounters(patientId: string): Promise<Encounter[]> {
  const q = query(patientEncountersCol(patientId), orderBy('startTime', 'desc'));
  const snap = await getDocs(q);
  return docsTo<Encounter>(snap);
}

// ── Encounter Timeline Events ─────────────────────────────────────────────────

export function encounterTimelineRef(encounterId: string, eventId: string): DocumentReference {
  return doc(db, 'encounter_timelines', encounterId, 'events', eventId);
}

export async function addEncounterTimelineEvent(event: EncounterTimelineEvent): Promise<void> {
  await setDoc(encounterTimelineRef(event.encounterId, event.id), event);
}

export async function getEncounterTimeline(encounterId: string): Promise<EncounterTimelineEvent[]> {
  const q = query(collection(db, 'encounter_timelines', encounterId, 'events'), orderBy('timestamp', 'asc'));
  const snap = await getDocs(q);
  return docsTo<EncounterTimelineEvent>(snap);
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOK II VOL III: WORKFLOWS & QUEUES
// ═════════════════════════════════════════════════════════════════════════════

// ── Workflow Instances ────────────────────────────────────────────────────────

export function workflowRef(orgId: string, workflowId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'workflows', workflowId);
}

export function workflowsCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'workflows');
}

export async function createWorkflow(orgId: string, workflow: WorkflowInstance): Promise<void> {
  await setDoc(workflowRef(orgId, workflow.id), workflow);
}

export async function updateWorkflow(orgId: string, workflowId: string, data: Partial<WorkflowInstance>): Promise<void> {
  await updateDoc(workflowRef(orgId, workflowId), data);
}

export async function getWorkflow(orgId: string, workflowId: string): Promise<WorkflowInstance | null> {
  const snap = await getDoc(workflowRef(orgId, workflowId));
  return docTo<WorkflowInstance>(snap);
}

export async function listActiveWorkflows(orgId: string): Promise<WorkflowInstance[]> {
  const q = query(workflowsCol(orgId), where('status', '==', 'active'), orderBy('priority'));
  const snap = await getDocs(q);
  return docsTo<WorkflowInstance>(snap);
}

export async function listWorkflowsByState(orgId: string, state: string): Promise<WorkflowInstance[]> {
  const q = query(workflowsCol(orgId), where('currentState', '==', state), orderBy('startedAt', 'desc'));
  const snap = await getDocs(q);
  return docsTo<WorkflowInstance>(snap);
}

// ── Clinical Queues ───────────────────────────────────────────────────────────

export function queueRef(orgId: string, queueId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'queues', queueId);
}

export function queuesCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'queues');
}

export async function saveQueue(orgId: string, queue: ClinicalQueue): Promise<void> {
  await setDoc(queueRef(orgId, queue.id), queue);
}

export async function getQueue(orgId: string, queueId: string): Promise<ClinicalQueue | null> {
  const snap = await getDoc(queueRef(orgId, queueId));
  return docTo<ClinicalQueue>(snap);
}

export async function listQueues(orgId: string): Promise<ClinicalQueue[]> {
  const snap = await getDocs(queuesCol(orgId));
  return docsTo<ClinicalQueue>(snap);
}

// ── Clinical Tasks ────────────────────────────────────────────────────────────

export function taskRef(orgId: string, taskId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'tasks', taskId);
}

export function tasksCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'tasks');
}

export async function createTask(orgId: string, task: ClinicalTask): Promise<void> {
  await setDoc(taskRef(orgId, task.id), task);
}

export async function updateTask(orgId: string, taskId: string, data: Partial<ClinicalTask>): Promise<void> {
  await updateDoc(taskRef(orgId, taskId), data);
}

export async function getTask(orgId: string, taskId: string): Promise<ClinicalTask | null> {
  const snap = await getDoc(taskRef(orgId, taskId));
  return docTo<ClinicalTask>(snap);
}

export async function listTasksByAssignee(orgId: string, assigneeId: string): Promise<ClinicalTask[]> {
  const q = query(tasksCol(orgId), where('assignedTo', '==', assigneeId), where('status', 'in', ['pending', 'in_progress']));
  const snap = await getDocs(q);
  return docsTo<ClinicalTask>(snap);
}

export async function listEscalatedTasks(orgId: string): Promise<ClinicalTask[]> {
  const q = query(tasksCol(orgId), where('status', '==', 'escalated'), orderBy('escalationLevel', 'desc'));
  const snap = await getDocs(q);
  return docsTo<ClinicalTask>(snap);
}

// ── Patient State Query (the Golden Rule) ─────────────────────────────────────
// Answers: "Where is this patient right now?"

export async function getPatientCurrentState(orgId: string, patientId: string): Promise<{
  workflow: WorkflowInstance | null;
  state: string;
  owner: string;
  pendingTasks: ClinicalTask[];
} | null> {
  const workflows = await getDocs(query(
    workflowsCol(orgId),
    where('patientId', '==', patientId),
    where('status', '==', 'active'),
    limit(1),
  ));

  if (workflows.empty) return null;
  const wf = { id: workflows.docs[0].id, ...workflows.docs[0].data() } as WorkflowInstance;

  const tasks = await getDocs(query(
    tasksCol(orgId),
    where('workflowId', '==', wf.id),
    where('status', 'in', ['pending', 'in_progress', 'overdue', 'escalated']),
  ));

  return {
    workflow: wf,
    state: wf.currentState,
    owner: wf.ownership.workflowOwner.ownerName || wf.ownership.patientOwner.ownerName,
    pendingTasks: docsTo<ClinicalTask>(tasks),
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOK III VOL I: DOCTOR OPERATIONAL CONTEXT
// ═════════════════════════════════════════════════════════════════════════════

// Ward rounds stored per clinician for accessibility

export function wardRoundRef(clinicianId: string, roundId: string): DocumentReference {
  return doc(db, 'clinicians', clinicianId, 'ward_rounds', roundId);
}

export async function saveWardRound(clinicianId: string, round: WardRound): Promise<void> {
  await setDoc(wardRoundRef(clinicianId, round.id), round);
}

export async function getActiveWardRound(clinicianId: string): Promise<WardRound | null> {
  const q = query(collection(db, 'clinicians', clinicianId, 'ward_rounds'), where('status', '==', 'in_progress'), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : docsTo<WardRound>(snap)[0];
}

// ── Handover Notes ────────────────────────────────────────────────────────────

export function handoverRef(orgId: string, handoverId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'handovers', handoverId);
}

export async function saveHandover(orgId: string, handover: HandoverNote): Promise<void> {
  await setDoc(handoverRef(orgId, handover.id), handover);
}

export async function getPendingHandovers(orgId: string, clinicianId: string): Promise<HandoverNote[]> {
  const q = query(
    collection(db, 'organizations', orgId, 'handovers'),
    where('toClinicianId', '==', clinicianId),
    where('acknowledgedAt', '==', null),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return docsTo<HandoverNote>(snap);
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOK II VOL IV: CARE TEAM OPERATIONAL CONTEXT
// ═════════════════════════════════════════════════════════════════════════════

// Care Team workspaces stored per clinician for active sessions

export function careTeamWorkspaceRef(clinicianId: string): DocumentReference {
  return doc(db, 'care_team_workspaces', clinicianId);
}

export async function saveCareTeamWorkspace(clinicianId: string, workspace: CareTeamWorkspace): Promise<void> {
  await setDoc(careTeamWorkspaceRef(clinicianId), { workspace, updatedAt: Date.now() });
}

export async function getCareTeamWorkspace(clinicianId: string): Promise<CareTeamWorkspace | null> {
  const snap = await getDoc(careTeamWorkspaceRef(clinicianId));
  if (!snap.exists()) return null;
  return (snap.data() as any).workspace as CareTeamWorkspace;
}

// Care Team handovers stored per organization

export async function saveCareTeamHandover(orgId: string, handover: CareTeamHandoverNote): Promise<void> {
  await setDoc(doc(db, 'organizations', orgId, 'care_team_handovers', handover.id), handover);
}

export async function getPendingCareTeamHandovers(orgId: string, clinicianId: string): Promise<CareTeamHandoverNote[]> {
  const q = query(
    collection(db, 'organizations', orgId, 'care_team_handovers'),
    where('toClinicianId', '==', clinicianId),
    where('acknowledgedAt', '==', null),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return docsTo<CareTeamHandoverNote>(snap);
}

// Care Team notifications stored per clinician

export async function saveCareTeamNotifications(clinicianId: string, notifications: CareTeamNotification[]): Promise<void> {
  await setDoc(doc(db, 'care_team_notifications', clinicianId), { notifications, updatedAt: Date.now() });
}

export async function getCareTeamNotifications(clinicianId: string): Promise<CareTeamNotification[]> {
  const snap = await getDoc(doc(db, 'care_team_notifications', clinicianId));
  if (!snap.exists()) return [];
  return (snap.data() as any).notifications as CareTeamNotification[];
}

// List all clinicians of a given profession on shift

export async function listCareTeamByProfession(orgId: string, profession: CareTeamProfession): Promise<{ clinicianId: string; clinicianName: string }[]> {
  const q = query(
    collection(db, 'organizations', orgId, 'staff_on_shift'),
    where('profession', '==', profession),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    clinicianId: d.id,
    clinicianName: (d.data() as any).clinicianName ?? 'Unknown',
  }));
}
