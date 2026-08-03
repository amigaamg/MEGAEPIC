// AMEXAN Workspace Builder
// Constitutional Principle: Workspaces are assembled, never coded.
// Identity -> Organization -> Role -> Context -> Theme.

import type { WorkspaceSession, WorkspaceLayout } from '../types';
import { getLayoutForAssignment } from '../layouts';
import { effectiveTheme } from '../../presentation/engine/branding-engine';
import type { ThemeId } from '../../presentation/registry/theme-registry';

export interface WorkspaceBuildRequest {
  session: WorkspaceSession;
  themePreference?: ThemeId;
  organizationType?: 'hospital' | 'university' | 'research' | 'government';
}

export interface BuiltWorkspace {
  layout: WorkspaceLayout;
  themeId: ThemeId;
  title: string;
  quickActions: { label: string; action: string; shortcut?: string }[];
  role: string;
  context: {
    patientId?: string;
    encounterId?: string;
    workflowId?: string;
  };
}

export function buildWorkspace(request: WorkspaceBuildRequest): BuiltWorkspace {
  const { session } = request;
  const themeId = effectiveTheme({
    organizationType: request.organizationType,
    themePreference: request.themePreference,
  });

  const layout = getLayoutForAssignment(session.assignmentType);
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
  };
  const title = titles[session.assignmentType] ?? session.assignmentTitle;

  return {
    layout,
    themeId,
    title,
    quickActions: quickActionsFor(session.assignmentType),
    role: session.role,
    context: {
      patientId: session.activePatientId,
      encounterId: session.activeEncounterId,
      workflowId: session.activeWorkflowId,
    },
  };
}

function quickActionsFor(assignmentType: string): { label: string; action: string; shortcut?: string }[] {
  const actions: Record<string, { label: string; action: string; shortcut?: string }[]> = {
    ward_round: [
      { label: 'Next Patient', action: 'next_patient', shortcut: 'n' },
      { label: 'Write Note', action: 'write_note', shortcut: 'w' },
      { label: 'Order Lab', action: 'order_lab', shortcut: 'l' },
    ],
    clinic: [
      { label: 'Next Patient', action: 'next_patient', shortcut: 'n' },
      { label: 'Prescribe', action: 'prescribe', shortcut: 'p' },
    ],
    emergency_call: [
      { label: 'Alert Team', action: 'alert_team', shortcut: 'a' },
      { label: 'Stat Lab', action: 'stat_lab', shortcut: 'l' },
    ],
  };
  return actions[assignmentType] ?? [
    { label: 'Refresh', action: 'refresh', shortcut: 'r' },
    { label: 'Search', action: 'search', shortcut: '/' },
  ];
}

export const workspaceBuilder = {
  build: buildWorkspace,
};

export type WorkspaceBuilder = typeof workspaceBuilder;
