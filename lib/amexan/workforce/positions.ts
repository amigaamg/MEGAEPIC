import { SeniorityLevel } from './types'

export function getPositionAuthority(level: SeniorityLevel): string[] {
  const authorities: Record<SeniorityLevel, string[]> = {
    [SeniorityLevel.Intern]: ['view_patient', 'write_notes_under_supervision'],
    [SeniorityLevel.MedicalOfficer]: ['view_patient', 'write_notes', 'order_labs', 'order_imaging', 'prescribe'],
    [SeniorityLevel.Registrar]: ['view_patient', 'write_notes', 'order_labs', 'order_imaging', 'prescribe', 'refer', 'admit'],
    [SeniorityLevel.Consultant]: ['view_patient', 'write_notes', 'order_labs', 'order_imaging', 'prescribe', 'refer', 'admit', 'discharge', 'supervise', 'sign_off'],
    [SeniorityLevel.HeadOfDepartment]: ['all_clinical', 'manage_department', 'approve_policy'],
    [SeniorityLevel.Director]: ['all_clinical', 'all_admin', 'all_system'],
  }
  return authorities[level] ?? []
}

export function getSupervisorChain(workerId: string): string[] {
  return [workerId]
}

export function formatSeniority(level: SeniorityLevel): string {
  const labels: Record<SeniorityLevel, string> = {
    [SeniorityLevel.Intern]: 'Intern',
    [SeniorityLevel.MedicalOfficer]: 'Medical Officer',
    [SeniorityLevel.Registrar]: 'Registrar',
    [SeniorityLevel.Consultant]: 'Consultant',
    [SeniorityLevel.HeadOfDepartment]: 'Head of Department',
    [SeniorityLevel.Director]: 'Director',
  }
  return labels[level]
}

export function canSupervise(supervisorLevel: SeniorityLevel, superviseeLevel: SeniorityLevel): boolean {
  return supervisorLevel > superviseeLevel
}
