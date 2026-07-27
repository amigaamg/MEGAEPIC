// ─────────────────────────────────────────────────────────────────
// AMEXAN Safety & Contraindications Engine
// Per-card safety warnings, contraindications, critical alerts
// ─────────────────────────────────────────────────────────────────

export interface SafetyWarning {
  cardId: string;
  cardLabel: string;
  warningType: 'contraindication' | 'caution' | 'critical_alert' | 'precaution';
  message: string;
  condition: string;
  severity: 'high' | 'medium' | 'low';
  action?: string;
}

export interface ExamSafetyReport {
  warnings: SafetyWarning[];
  contraindications: SafetyWarning[];
  criticalAlerts: SafetyWarning[];
  precautions: SafetyWarning[];
  hasContraindications: boolean;
  hasCriticalAlerts: boolean;
}

const SAFETY_RULES: SafetyWarning[] = [
  // Cervical spine
  { cardId: 'neuro_meningeal_kernig', cardLabel: 'Kernig\'s Sign', warningType: 'contraindication', message: 'Do not perform Kernig\'s sign if cervical spine injury is suspected.', condition: 'suspected_cervical_spine_injury', severity: 'high', action: 'Obtain cervical spine imaging before proceeding.' },
  { cardId: 'neuro_meningeal_brudzinski', cardLabel: 'Brudzinski\'s Sign', warningType: 'contraindication', message: 'Do not perform if cervical spine injury is suspected.', condition: 'suspected_cervical_spine_injury', severity: 'high' },

  // Abdominal
  { cardId: 'abd_palp_deep', cardLabel: 'Deep Palpation', warningType: 'caution', message: 'Avoid deep palpation in suspected aortic aneurysm, recent abdominal surgery, or known abdominal aortic aneurysm.', condition: 'aaa_or_recent_surgery', severity: 'high', action: 'Consider ultrasound first if AAA suspected.' },
  { cardId: 'abd_palp_splenomegaly', cardLabel: 'Splenomegaly', warningType: 'caution', message: 'Gentle palpation only — vigorous palpation can rupture a soft/splenic spleen in infectious mononucleosis.', condition: 'suspected_splenomegaly', severity: 'medium' },

  // Breast
  { cardId: 'breast_palp_mass', cardLabel: 'Breast Mass Palpation', warningType: 'precaution', message: 'Gentle palpation — avoid firm compression of a suspected inflammatory breast cancer or abscess.', condition: 'suspected_breast_abscess', severity: 'medium' },
  { cardId: 'breast_lactation_latch', cardLabel: 'Infant Latch Assessment', warningType: 'precaution', message: 'Ensure privacy and warmth. May need lactation consultant support. Do not force infant attachment.', condition: 'lactation_assessment', severity: 'low' },

  // Neurological
  { cardId: 'neuro_sensory_pinprick', cardLabel: 'Pinprick Sensation', warningType: 'caution', message: 'Use a clean, single-use pin. Do not draw blood. Explain to the patient before starting.', condition: 'sensory_testing', severity: 'low' },
  { cardId: 'neuro_gait_assessment', cardLabel: 'Gait Assessment', warningType: 'precaution', message: 'Ensure the patient is stable before asking them to walk. Have a chair or wall nearby. Do not leave the patient unsupervised.', condition: 'mobility_impaired', severity: 'high', action: 'Stay within arm\'s reach.' },

  // Cardiovascular
  { cardId: 'cvs_carotid_palpation', cardLabel: 'Carotid Palpation', warningType: 'caution', message: 'Never palpate both carotids simultaneously. Avoid vigorous massage — may precipitate bradycardia or embolisation.', condition: 'carotid_exam', severity: 'high', action: 'Palpate one side at a time gently.' },
  { cardId: 'cvs_jvp', cardLabel: 'JVP Assessment', warningType: 'precaution', message: 'If central line is present, do not occlude the vein — risk of line displacement or infection.', condition: 'central_line_present', severity: 'medium' },

  // General
  { cardId: 'ge_fundoscopy', cardLabel: 'Fundoscopy', warningType: 'precaution', message: 'Dim the lights. Warn the patient about the bright light. Do not perform if patient has had recent eye surgery.', condition: 'ophthalmic_exam', severity: 'low' },
  { cardId: 'ge_oral_cavity', cardLabel: 'Oral Cavity Examination', warningType: 'precaution', message: 'Wear gloves. Use a tongue depressor. Be aware of the gag reflex. Do not force if patient is unable to cooperate.', condition: 'oral_exam', severity: 'low' },

  // Neonatal
  { cardId: 'neuro_neonatal_moro', cardLabel: 'Moro Reflex', warningType: 'caution', message: 'Support the head and neck at all times. The Moro reflex is a primitive reflex — do not startle the infant excessively.', condition: 'neonatal_exam', severity: 'medium' },
];

export function getSafetyWarningsForCards(cardIds: string[], activeConditions: string[]): ExamSafetyReport {
  const warnings: SafetyWarning[] = [];
  const contraindications: SafetyWarning[] = [];
  const criticalAlerts: SafetyWarning[] = [];
  const precautions: SafetyWarning[] = [];

  for (const rule of SAFETY_RULES) {
    if (!cardIds.includes(rule.cardId)) continue;
    switch (rule.warningType) {
      case 'contraindication': contraindications.push(rule); break;
      case 'critical_alert': criticalAlerts.push(rule); break;
      case 'precaution': precautions.push(rule); break;
      default: warnings.push(rule);
    }
  }

  return {
    warnings,
    contraindications,
    criticalAlerts,
    precautions,
    hasContraindications: contraindications.length > 0,
    hasCriticalAlerts: criticalAlerts.length > 0,
  };
}

export function getContraindications(activeCardIds: string[]): SafetyWarning[] {
  return SAFETY_RULES.filter(r => activeCardIds.includes(r.cardId) && r.warningType === 'contraindication');
}

export function generateSafetyBanner(warnings: SafetyWarning[]): string {
  if (warnings.length === 0) return '';
  const parts = warnings.map(w => {
    const icon = w.warningType === 'contraindication' ? '🚫' : w.warningType === 'critical_alert' ? '⚠️' : '💡';
    return `${icon} ${w.message}${w.action ? ` (Action: ${w.action})` : ''}`;
  });
  return parts.join('\n');
}
