import type { AmxUid } from '../constitution/types'

export type PaneType = 'list' | 'detail' | 'context' | 'assistant' | 'queue' | 'tasks' | 'timeline' | 'search' | 'metrics'

export interface PaneConfig {
  id: string
  title: string
  type: PaneType
  component: string
  config: Record<string, unknown>
  width?: number
  minWidth?: number
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export interface WorkspaceLayout {
  leftPane: PaneConfig
  centerPane: PaneConfig
  rightPane: PaneConfig
  responsive: {
    mobile: 'single' | 'overlay'
    tablet: 'left_center' | 'single'
    desktop: 'three_column'
  }
}

export interface WorkspaceSession {
  identity: AmxUid
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  shiftType: string
  assignmentType: string
  assignmentTitle: string
  location: string
  activePatientId?: string
  activeEncounterId?: string
  activeWorkflowId?: string
  role: string
  position: string
  permissions: string[]
}

export type AssignmentType =
  | 'ward_round' | 'clinic' | 'theatre' | 'emergency_call'
  | 'icu_duty' | 'consultation' | 'admission' | 'discharge'
  | 'procedure' | 'home_visit' | 'teleconsultation'
  | 'lecture' | 'research' | 'administration'
  | 'supervision' | 'on_call' | 'standby'
  | 'outreach' | 'other'

export interface PaneProps {
  session: WorkspaceSession
  onNavigate: (path: string) => void
  onAction: (action: string, payload?: unknown) => void
}
