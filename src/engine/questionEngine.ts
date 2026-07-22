// ═══════════════════════════════════════════════════════════════════════════════
// LEGACY — delegates to new architecture
// New code should use '@/lib/amexan/encounter' directly.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ConsultationContext, QuestionNode } from '@/src/types';

export function getNextQuestion(ctx: ConsultationContext): QuestionNode | null {
  return null;
}
