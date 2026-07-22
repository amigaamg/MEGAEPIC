import { PatientState, type Workflow } from './types'

const VALID_TRANSITIONS: Record<PatientState, PatientState[]> = {
  [PatientState.SelfCare]: [PatientState.Appointment, PatientState.Telemedicine],
  [PatientState.Appointment]: [PatientState.Waiting, PatientState.SelfCare],
  [PatientState.Waiting]: [PatientState.Triage, PatientState.Consultation, PatientState.SelfCare],
  [PatientState.Triage]: [PatientState.Consultation, PatientState.Escalation],
  [PatientState.Consultation]: [PatientState.Laboratory, PatientState.Radiology, PatientState.Pharmacy, PatientState.Observation, PatientState.Admission, PatientState.Discharge, PatientState.Referral, PatientState.Physiotherapy],
  [PatientState.Laboratory]: [PatientState.Consultation, PatientState.Waiting],
  [PatientState.Radiology]: [PatientState.Consultation, PatientState.Waiting],
  [PatientState.Pharmacy]: [PatientState.Consultation, PatientState.Discharge, PatientState.SelfCare],
  [PatientState.Observation]: [PatientState.Admission, PatientState.Ward, PatientState.ICU, PatientState.Discharge, PatientState.Consultation],
  [PatientState.Admission]: [PatientState.Ward, PatientState.ICU, PatientState.Theatre, PatientState.Discharge],
  [PatientState.Ward]: [PatientState.ICU, PatientState.Theatre, PatientState.Laboratory, PatientState.Radiology, PatientState.Pharmacy, PatientState.Physiotherapy, PatientState.Discharge, PatientState.Transfer, PatientState.Deceased],
  [PatientState.ICU]: [PatientState.Ward, PatientState.Theatre, PatientState.Discharge, PatientState.Deceased],
  [PatientState.Theatre]: [PatientState.Recovery, PatientState.ICU, PatientState.Deceased],
  [PatientState.Recovery]: [PatientState.Ward, PatientState.ICU, PatientState.Deceased],
  [PatientState.Discharge]: [PatientState.FollowUp, PatientState.SelfCare, PatientState.LongTermMonitoring, PatientState.CommunityCare, PatientState.HomeCare],
  [PatientState.FollowUp]: [PatientState.SelfCare, PatientState.Appointment, PatientState.LongTermMonitoring],
  [PatientState.LongTermMonitoring]: [PatientState.SelfCare, PatientState.Appointment, PatientState.CommunityCare],
  [PatientState.CommunityCare]: [PatientState.SelfCare, PatientState.HomeCare, PatientState.Appointment],
  [PatientState.HomeCare]: [PatientState.SelfCare, PatientState.CommunityCare, PatientState.Appointment],
  [PatientState.Deceased]: [],
  [PatientState.Transfer]: [PatientState.Admission, PatientState.Ward],
  [PatientState.Referral]: [PatientState.Appointment, PatientState.Consultation, PatientState.Admission],
  [PatientState.Escalation]: [PatientState.ICU, PatientState.Theatre, PatientState.Consultation, PatientState.Deceased],
  [PatientState.Telemedicine]: [PatientState.Consultation, PatientState.Pharmacy, PatientState.FollowUp, PatientState.SelfCare],
  [PatientState.Physiotherapy]: [PatientState.Consultation, PatientState.Ward, PatientState.Discharge, PatientState.SelfCare],
}

export function getValidTransitions(currentState: PatientState): PatientState[] {
  return VALID_TRANSITIONS[currentState] ?? []
}

export function canTransition(from: PatientState, to: PatientState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export function transitionPatient(workflow: Workflow, newState: PatientState): { workflow?: Workflow; error?: string } {
  if (!canTransition(workflow.currentState, newState)) {
    return { error: `Cannot transition from ${workflow.currentState} to ${newState}` }
  }
  workflow.previousStates.push(workflow.currentState)
  workflow.currentState = newState
  return { workflow }
}

export function getPatientState(workflow: Workflow): PatientState {
  return workflow.currentState
}

export function getStateLabel(state: PatientState): string {
  return state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
