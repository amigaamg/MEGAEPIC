import type { WorkspaceLayout, AssignmentType } from './types'
import { ASSIGNMENT_LAYOUTS as CONSTITUTION_LAYOUTS } from '../constitution/workspace-engine'

const EXTRA_LAYOUTS: Record<string, WorkspaceLayout> = {
  admission: {
    leftPane: { id: 'admission-queue', title: 'Admission Queue', type: 'queue', component: 'AdmissionQueue', config: {}, width: 320 },
    centerPane: { id: 'admission-form', title: 'Admission Form', type: 'detail', component: 'AdmissionForm', config: {} },
    rightPane: { id: 'beds', title: 'Bed Availability', type: 'context', component: 'BedAvailability', config: {} },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
  discharge: {
    leftPane: { id: 'discharge-list', title: 'Discharge List', type: 'tasks', component: 'DischargeList', config: {}, width: 320 },
    centerPane: { id: 'discharge-summary', title: 'Discharge Summary', type: 'detail', component: 'DischargeSummary', config: {} },
    rightPane: { id: 'checklist', title: 'Discharge Checklist', type: 'context', component: 'DischargeChecklist', config: {} },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
  consultation: {
    leftPane: { id: 'referrals', title: 'Referrals', type: 'list', component: 'ReferralList', config: {}, width: 300 },
    centerPane: { id: 'consultation-note', title: 'Consultation', type: 'detail', component: 'ConsultationNote', config: {} },
    rightPane: { id: 'patient-summary', title: 'Patient Summary', type: 'context', component: 'PatientSummary', config: {} },
    responsive: { mobile: 'single', tablet: 'left_center', desktop: 'three_column' },
  },
}

const ALL_LAYOUTS: Record<string, WorkspaceLayout> = {
  ...CONSTITUTION_LAYOUTS,
  ...EXTRA_LAYOUTS,
}

export function getLayout(assignmentType: string): WorkspaceLayout {
  return ALL_LAYOUTS[assignmentType] ?? ALL_LAYOUTS.administration
}

export function getAssignmentTypes(): AssignmentType[] {
  return Object.keys(ALL_LAYOUTS) as AssignmentType[]
}

export function getLayoutForAssignment(assignmentType: string): WorkspaceLayout {
  return ALL_LAYOUTS[assignmentType] ?? ALL_LAYOUTS.administration
}
