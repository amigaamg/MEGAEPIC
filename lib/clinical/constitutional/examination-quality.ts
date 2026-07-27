// ─────────────────────────────────────────────────────────────────
// AMEXAN Examination Quality Engine
// Completeness scoring, section coverage, suggestions
// ─────────────────────────────────────────────────────────────────

export interface SectionCompleteness {
  section: string;
  sectionLabel: string;
  totalCards: number;
  answeredCards: number;
  completenessPct: number;
  status: 'complete' | 'partial' | 'missing' | 'not_applicable';
}

export interface ExamQualityReport {
  overallCompleteness: number;
  sections: SectionCompleteness[];
  missingSections: string[];
  suggestions: string[];
  criticalFindingsPresent: boolean;
  documentationReady: boolean;
}

export function computeSectionCompleteness(
  cards: { id: string; section: string; label: string }[],
  findings: Record<string, unknown>,
  sectionLabels: Record<string, string>,
): SectionCompleteness[] {
  const sectionCards = new Map<string, { id: string; label: string }[]>();
  for (const card of cards) {
    const existing = sectionCards.get(card.section) || [];
    existing.push({ id: card.id, label: card.label });
    sectionCards.set(card.section, existing);
  }

  const results: SectionCompleteness[] = [];
  for (const [section, secCards] of sectionCards) {
    let answered = 0;
    for (const card of secCards) {
      const v = findings[card.id];
      if (v != null && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0)) {
        answered++;
      }
    }
    const total = secCards.length;
    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
    const status = pct === 0 ? 'missing' : pct >= 80 ? 'complete' : 'partial';
    results.push({
      section,
      sectionLabel: sectionLabels[section] || section,
      totalCards: total,
      answeredCards: answered,
      completenessPct: pct,
      status,
    });
  }
  return results;
}

export function generateExamQualityReport(
  cards: { id: string; section: string; label: string }[],
  findings: Record<string, unknown>,
  sectionLabels: Record<string, string>,
  criticalCardIds: string[],
): ExamQualityReport {
  const sections = computeSectionCompleteness(cards, findings, sectionLabels);
  const answered = sections.reduce((sum, s) => sum + s.answeredCards, 0);
  const total = sections.reduce((sum, s) => sum + s.totalCards, 0);
  const overallCompleteness = total > 0 ? Math.round((answered / total) * 100) : 0;

  const missingSections = sections.filter(s => s.status === 'missing').map(s => s.sectionLabel);
  const partialSections = sections.filter(s => s.status === 'partial');
  const suggestions: string[] = [];

  for (const sec of missingSections) {
    suggestions.push(`${sec} section has not been started.`);
  }
  for (const sec of partialSections) {
    suggestions.push(`${sec} section is ${sec.completenessPct}% complete (${sec.answeredCards}/${sec.totalCards}).`);
  }

  for (const cardId of criticalCardIds) {
    if (findings[cardId] == null || findings[cardId] === '' || findings[cardId] === false) {
      const card = cards.find(c => c.id === cardId);
      if (card) {
        suggestions.push(`${card.label} (critical) has not been assessed.`);
      }
    }
  }

  const criticalFindingsPresent = Object.entries(findings).some(([_id, v]) => {
    if (v == null) return false;
    const str = String(v);
    return str.includes('critical') || str.includes('severe') || str === 'absent';
  });

  return {
    overallCompleteness,
    sections,
    missingSections,
    suggestions,
    criticalFindingsPresent,
    documentationReady: overallCompleteness >= 80,
  };
}

export function getCriticalCardIds(system: string): string[] {
  const map: Record<string, string[]> = {
    respiratory: ['resp_ausc_breath_sounds', 'resp_ausc_wheeze', 'resp_perc_note', 'resp_insp_trachea'],
    cardiovascular: ['cvs_pulse_character', 'cvs_heart_sounds', 'cvs_jvp', 'cvs_oedema'],
    abdominal: ['abd_palp_tenderness', 'abd_palp_guarding', 'abd_palp_mass'],
    neurological: ['neuro_consciousness_avpu', 'neuro_pupils_size', 'neuro_motor_power_arms', 'neuro_motor_power_legs'],
    breast: ['breast_palp_mass', 'breast_axillary_nodes', 'breast_insp_skin'],
  };
  return map[system] || [];
}

export interface ExaminationCoverage {
  respiratory: number;
  cardiovascular: number;
  abdominal: number;
  neurological: number;
  breast: number;
  general: number;
  ueo: number;
  overall: number;
}

export function computeCoverage(
  systemCards: Record<string, { id: string }[]>,
  findings: Record<string, unknown>,
): ExaminationCoverage {
  const coverage: Record<string, number> = {};
  let totalAnswered = 0;
  let totalCards = 0;

  for (const [system, cards] of Object.entries(systemCards)) {
    let answered = 0;
    for (const card of cards) {
      const v = findings[card.id];
      if (v != null && v !== '' && v !== false) answered++;
    }
    const pct = cards.length > 0 ? Math.round((answered / cards.length) * 100) : 0;
    coverage[system] = pct;
    totalAnswered += answered;
    totalCards += cards.length;
  }

  return {
    respiratory: coverage['respiratory'] || 0,
    cardiovascular: coverage['cardiovascular'] || 0,
    abdominal: coverage['abdominal'] || 0,
    neurological: coverage['neurological'] || 0,
    breast: coverage['breast'] || 0,
    general: coverage['general'] || 0,
    ueo: coverage['ueo'] || 0,
    overall: totalCards > 0 ? Math.round((totalAnswered / totalCards) * 100) : 0,
  };
}
