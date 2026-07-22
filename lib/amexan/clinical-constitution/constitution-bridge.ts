import { generateAmxUid, type UserSession, type WorkspaceContext, type Assignment as KernelAssignment, type Shift, type AmxUid as KernelAmxUid } from '../constitution';
import { generateWorkspace as kernelGenerateWorkspace, type WorkspaceLayout } from '../constitution';
import { buildDoctorContext as clinicalBuildDoctorContext } from './doctor-context-engine';
import { buildCareTeamContext as clinicalBuildCareTeamContext } from './care-team-context-engine';
import { createEncounter as clinicalCreateEncounter } from './encounter-engine';
import { createClinicalFact as clinicalCreateClinicalFact, createPatientJourney as clinicalCreatePatientJourney } from './patient-journey-engine';
import type { DoctorContext, DoctorShift, DoctorAssignment, DoctorWorkspace, CareTeamContext, CareTeamWorkspace, Encounter, EncounterClass, ClinicalFact, PatientJourney, TrustLayer, ClinicalObservation, CareTeamProfession } from './types';

export function generateKernelAmxUid(type: 'person' | 'organization' | 'device' | 'ai' | 'system' | 'patient'): KernelAmxUid {
  return generateAmxUid(type);
}

export function doctorContextFromSession(session: UserSession): DoctorContext {
  const assignment = session.currentAssignments?.[0];
  return clinicalBuildDoctorContext({
    doctorId: session.identity.uid,
    doctorName: session.person.fullName,
    organizationId: session.currentOrganization?.id ?? '',
    organizationName: session.currentOrganization?.name ?? '',
    departmentId: session.currentDepartment?.id,
    departmentName: session.currentDepartment?.name,
    shift: {
      type: 'morning',
      startTime: Date.now(),
      endTime: Date.now() + 12 * 60 * 60 * 1000,
      isActive: session.onDuty ?? false,
    } as DoctorShift,
    assignment: {
      type: (assignment?.type ?? 'ward_round') as any,
      location: typeof assignment?.location === 'string' ? assignment.location : 'ward',
      startTime: assignment?.startTime ?? Date.now(),
      endTime: assignment?.endTime ?? Date.now() + 12 * 60 * 60 * 1000,
      description: assignment?.title ?? 'General Duty',
    } as DoctorAssignment,
    currentLocation: {
      departmentId: session.currentDepartment?.id ?? '',
      departmentName: session.currentDepartment?.name ?? '',
    },
    activePatients: session.activePatientIds?.map(id => ({ patientId: id, name: '', age: 0, sex: '', bed: '', diagnosis: '', status: 'stable', alerts: [], updatedAt: Date.now() })) ?? [],
    patientQueue: [],
    pendingTasks: [],
    notifications: [],
  });
}

export function careTeamContextFromSession(session: UserSession, careTeamType: CareTeamProfession): CareTeamContext {
  return clinicalBuildCareTeamContext({
    clinicianId: session.professional?.uid ?? session.identity.uid,
    clinicianName: session.person.fullName,
    profession: careTeamType,
    organizationId: session.currentOrganization?.id ?? '',
    organizationName: session.currentOrganization?.name ?? '',
    departmentId: session.currentDepartment?.id,
    departmentName: session.currentDepartment?.name,
    shift: {
      type: 'morning',
      startTime: Date.now(),
      endTime: Date.now() + 12 * 60 * 60 * 1000,
      isActive: session.onDuty ?? false,
    },
    assignment: {
      type: 'ward_round',
      location: 'ward',
      startTime: Date.now(),
      endTime: Date.now() + 12 * 60 * 60 * 1000,
      description: 'General duty',
    },
    currentLocation: {
      departmentId: session.currentDepartment?.id ?? '',
      departmentName: session.currentDepartment?.name ?? '',
    },
    activePatients: session.activePatientIds?.map(id => ({ patientId: id, name: '', age: 0, sex: '', bed: '', diagnosis: '', status: 'stable', alerts: [], updatedAt: Date.now() })) ?? [],
    patientQueue: [],
    pendingTasks: [],
    notifications: [],
  });
}

export function generateDoctorWorkspaceFromKernel(context: WorkspaceContext): DoctorWorkspace {
  const layout = kernelGenerateWorkspace(context);
  const workspace: any = {
    id: `ws-${Date.now()}`,
    type: layout.centerPane.id,
    title: layout.centerPane.title,
    sections: [],
    quickActions: [],
    rightPanel: { enabled: true, width: 320, component: layout.rightPane.component },
    patients: [],
    notifications: [],
    aiAssistant: { suggestions: [], actions: [], isLoading: false },
  };
  return workspace as DoctorWorkspace;
}

export function generateCareTeamWorkspaceFromKernel(context: WorkspaceContext): CareTeamWorkspace {
  const layout = kernelGenerateWorkspace(context);
  return {
    type: 'ward_round',
    profession: 'nurse',
    title: layout.centerPane.title,
    sections: layout.leftPane.id === 'patient-queue'
      ? [{ id: 'queue', title: 'Patient Queue', items: [], priority: 1 }]
      : [],
    quickActions: [],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  };
}

export function bridgeCreateFact(
  session: UserSession,
  patientId: string,
  trustLayer: TrustLayer,
  category: string,
  observations: ClinicalObservation[],
): ClinicalFact {
  return clinicalCreateClinicalFact({
    patientId,
    trustLayer,
    category,
    observations,
    recordedBy: {
      id: session.identity.uid,
      name: session.person.fullName,
      role: session.professional?.primaryCategory ?? 'clinician',
      type: trustLayer === 1 ? 'patient' : 'clinician',
    },
    source: trustLayer === 1 ? 'direct_entry' : 'direct_entry',
    organizationId: session.currentOrganization?.id,
    organizationName: session.currentOrganization?.name,
    departmentId: session.currentDepartment?.id,
    departmentName: session.currentDepartment?.name,
  });
}

export function bridgeCreateEncounter(session: UserSession, patientId: string, encounterType: string): Encounter {
  return clinicalCreateEncounter({
    patientId,
    encounterType: encounterType as Encounter['encounterType'],
    encounterClass: 'clinical' as EncounterClass,
    organizationId: session.currentOrganization?.id ?? '',
    organizationName: session.currentOrganization?.name ?? '',
    departmentId: session.currentDepartment?.id,
    departmentName: session.currentDepartment?.name,
    location: { type: 'clinic' },
    trigger: {
      type: 'walk_in',
      reason: 'Clinical encounter',
      urgency: 'routine',
      initiatedBy: session.identity.uid,
      initiatedAt: Date.now(),
    },
  });
}
