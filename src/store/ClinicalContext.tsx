// ═══════════════════════════════════════════════════════════════════════════════
// DEPRECATED — replaced by lib/amexan/encounter/EncounterContext.tsx
// ═══════════════════════════════════════════════════════════════════════════════
// This file re-exports from the new unified EncounterContext.
// Import useEncounter() directly for new code.
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React from 'react';
import { EncounterProvider as NewEncounterProvider } from '@/lib/amexan/encounter';

// Re-export the new Provider under the old name for backward compatibility
export function ClinicalProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(NewEncounterProvider, null, children);
}

// Re-export useEncounter as useClinical for backward compatibility
export { useEncounter as useClinical } from '@/lib/amexan/encounter';

// Re-export types
export type {
  EncounterState as ClinicalState,
  WorkflowStep as ClinicalInterviewPhase,
} from '@/lib/amexan/encounter';
