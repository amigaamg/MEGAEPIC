// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 13 — Research Context Resolver
// Determines the research context for actors involved in clinical
// trials, studies, and data capture. Governs what research tools
// and data the actor can access.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { ResearchContext } from '../types';

export function resolveResearchContext(workspace: ResolvedWorkspace): ResearchContext {
  const category = workspace.professional?.primaryCategory || '';
  const isResearchRole = category === 'researcher' || (category as string) === 'clinical_research_coordinator';
  const org = workspace.organization;
  const orgType = org?.type || '';

  // Research context is relevant for research labs, universities, and research roles
  const hasResearchContext = isResearchRole || orgType === 'research_institute' || orgType === 'university';

  if (!hasResearchContext) {
    return {
      activeStudies: [],
      enrolledPatients: 0,
      pendingApprovals: 0,
      ethicsApprovals: [],
      dataCaptureActive: false,
    };
  }

  const meta = workspace.activeMembership?.metadata || {};

  const activeStudies = (meta.activeStudies as string[]) || [];
  const enrolledPatients = (meta.enrolledPatients as number) || 0;
  const pendingApprovals = (meta.pendingApprovals as number) || 0;
  const ethicsApprovals = (meta.ethicsApprovals as string[]) || [];
  const dataCaptureActive = (meta.dataCaptureActive as boolean) ?? false;

  return {
    activeStudies,
    enrolledPatients,
    pendingApprovals,
    ethicsApprovals,
    dataCaptureActive,
  };
}