import { generateWorkspace as constitutionGenerate } from '../constitution/workspace-engine'
import { getLayoutForAssignment } from './layouts'
import type { WorkspaceSession, WorkspaceLayout, PaneConfig, AssignmentType } from './types'

export function generateWorkspace(session: WorkspaceSession): WorkspaceLayout {
  return getLayoutForAssignment(session.assignmentType)
}

export function getVisiblePanes(session: WorkspaceSession, viewport: { width: number }): {
  left: boolean
  center: boolean
  right: boolean
} {
  const layout = generateWorkspace(session)

  if (viewport.width < 640) {
    if (layout.responsive.mobile === 'single') {
      return { left: false, center: true, right: false }
    }
    return { left: false, center: true, right: false }
  }

  if (viewport.width < 1024) {
    if (layout.responsive.tablet === 'left_center') {
      return { left: true, center: true, right: false }
    }
    return { left: false, center: true, right: false }
  }

  return { left: true, center: true, right: true }
}

export function getWorkspaceTitle(assignmentType: string): string {
  const titles: Record<string, string> = {
    ward_round: 'Ward Round',
    clinic: 'Clinic',
    theatre: 'Theatre',
    emergency_call: 'Emergency',
    icu_duty: 'ICU',
    consultation: 'Consultation',
    admission: 'Admission',
    discharge: 'Discharge',
    teleconsultation: 'Telemedicine',
    administration: 'Administration',
  }
  return titles[assignmentType] ?? assignmentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function getQuickActions(assignmentType: string): { label: string; action: string; shortcut?: string }[] {
  const actions: Record<string, { label: string; action: string; shortcut?: string }[]> = {
    ward_round: [
      { label: 'Next Patient', action: 'next_patient', shortcut: 'n' },
      { label: 'Write Note', action: 'write_note', shortcut: 'w' },
      { label: 'Order Lab', action: 'order_lab', shortcut: 'l' },
      { label: 'Prescribe', action: 'prescribe', shortcut: 'p' },
    ],
    clinic: [
      { label: 'Next Patient', action: 'next_patient', shortcut: 'n' },
      { label: 'Write Prescription', action: 'prescribe', shortcut: 'p' },
      { label: 'Order Lab', action: 'order_lab', shortcut: 'l' },
      { label: 'Refer', action: 'refer', shortcut: 'r' },
    ],
    emergency_call: [
      { label: 'Alert Team', action: 'alert_team', shortcut: 'a' },
      { label: 'Order Stat Lab', action: 'stat_lab', shortcut: 'l' },
      { label: 'Call Consultant', action: 'call_consultant', shortcut: 'c' },
      { label: 'Document', action: 'document', shortcut: 'd' },
    ],
    icu_duty: [
      { label: 'Vitals Check', action: 'vitals', shortcut: 'v' },
      { label: 'Ventilator Settings', action: 'ventilator', shortcut: 'e' },
      { label: 'ABG', action: 'abg', shortcut: 'a' },
      { label: 'Sedation Review', action: 'sedation', shortcut: 's' },
    ],
  }
  return actions[assignmentType] ?? [
    { label: 'Refresh', action: 'refresh', shortcut: 'r' },
    { label: 'Search', action: 'search', shortcut: '/' },
  ]
}
