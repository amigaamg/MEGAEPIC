import type { AmxUid, UserSession } from './types';

export interface WorkspaceLayout {
  leftPane: WorkspacePane;
  centerPane: WorkspacePane;
  rightPane: WorkspacePane;
  responsive: {
    mobile: 'single' | 'overlay';
    tablet: 'left_center' | 'single';
    desktop: 'three_column';
  };
}

export interface WorkspacePane {
  id: string;
  title: string;
  type: 'list' | 'detail' | 'context' | 'assistant' | 'queue' | 'tasks' | 'timeline' | 'search' | 'metrics';
  component: string;
  config: Record<string, any>;
  width?: number;
  minWidth?: number;
}

export interface WorkspaceContext {
  identity: AmxUid;
  organizationId: string;
  organizationName: string;
  departmentId: string;
  departmentName: string;
  shiftType: string;
  assignmentType: string;
  assignmentTitle: string;
  location: string;
  activePatientId?: string;
  activeEncounterId?: string;
  activeWorkflowId?: string;
  role: string;
  position: string;
}

export const ASSIGNMENT_LAYOUTS: Record<string, WorkspaceLayout> = {
  ward_round: {
    leftPane: { id: 'patient-queue', title: 'Ward Patients', type: 'queue', component: 'PatientQueue', config: { sortBy: 'priority', filter: 'ward' }, width: 320 },
    centerPane: { id: 'patient-detail', title: 'Active Patient', type: 'detail', component: 'PatientDetail', config: {} },
    rightPane: { id: 'context', title: 'AI Assistant', type: 'assistant', component: 'AIAssistant', config: { mode: 'ward_round' } },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
  clinic: {
    leftPane: { id: 'clinic-queue', title: 'Clinic Queue', type: 'queue', component: 'ClinicQueue', config: { sortBy: 'arrival' }, width: 320 },
    centerPane: { id: 'consultation', title: 'Consultation', type: 'detail', component: 'Consultation', config: {} },
    rightPane: { id: 'context', title: 'Resources', type: 'context', component: 'ClinicalResources', config: {} },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
  theatre: {
    leftPane: { id: 'theatre-list', title: 'Theatre List', type: 'list', component: 'TheatreList', config: {}, width: 320 },
    centerPane: { id: 'procedure', title: 'Procedure', type: 'detail', component: 'Procedure', config: {} },
    rightPane: { id: 'anaesthesia', title: 'Anaesthesia', type: 'context', component: 'AnaesthesiaContext', config: {} },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
  emergency_call: {
    leftPane: { id: 'resus-bay', title: 'Resus Bay', type: 'list', component: 'ResusBay', config: {}, width: 240 },
    centerPane: { id: 'emergency-care', title: 'Emergency Care', type: 'detail', component: 'EmergencyCare', config: {} },
    rightPane: { id: 'vitals', title: 'Vitals Monitor', type: 'metrics', component: 'VitalsMonitor', config: { realtime: true } },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
  icu_duty: {
    leftPane: { id: 'icu-beds', title: 'ICU Beds', type: 'list', component: 'ICUBedList', config: {}, width: 280 },
    centerPane: { id: 'icu-patient', title: 'Patient Monitor', type: 'detail', component: 'ICUPatient', config: {} },
    rightPane: { id: 'ventilator', title: 'Ventilator', type: 'metrics', component: 'VentilatorMonitor', config: { realtime: true } },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
  administration: {
    leftPane: { id: 'tasks', title: 'Tasks', type: 'tasks', component: 'AdminTasks', config: {}, width: 320 },
    centerPane: { id: 'detail', title: 'Details', type: 'detail', component: 'AdminDetail', config: {} },
    rightPane: { id: 'metrics', title: 'Metrics', type: 'metrics', component: 'AdminMetrics', config: {} },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
  teleconsultation: {
    leftPane: { id: 'queue', title: 'Virtual Queue', type: 'queue', component: 'VirtualQueue', config: {}, width: 300 },
    centerPane: { id: 'video', title: 'Video Call', type: 'detail', component: 'VideoCall', config: {} },
    rightPane: { id: 'notes', title: 'Quick Notes', type: 'context', component: 'QuickNotes', config: {} },
    responsive: { mobile: 'overlay', tablet: 'single', desktop: 'three_column' },
  },
};

export function generateWorkspace(context: WorkspaceContext): WorkspaceLayout {
  const layout = ASSIGNMENT_LAYOUTS[context.assignmentType];
  if (layout) return layout;
  return ASSIGNMENT_LAYOUTS.administration;
}

export function getWorkspaceModules(context: WorkspaceContext): string[] {
  const layout = generateWorkspace(context);
  return [layout.leftPane.component, layout.centerPane.component, layout.rightPane.component];
}
