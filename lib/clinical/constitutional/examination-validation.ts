// ─────────────────────────────────────────────────────────────────
// AMEXAN Examination Validation Engine
// Cross-checks history against examination, suggests missing elements
// ─────────────────────────────────────────────────────────────────

export interface ValidationSuggestion {
  type: 'info' | 'warning' | 'critical' | 'teaching';
  message: string;
  reason: string;
  relatedHistory: string[];
  suggestedCards: string[];
  system: string;
}

export interface ValidationReport {
  suggestions: ValidationSuggestion[];
  completeness: number;
  criticalAlerts: string[];
  teachingPoints: string[];
}

type HistoryFactMap = Record<string, string | string[]>;

// Complaint-to-required-exam mappings
const COMPLAINT_EXAM_MAP: Record<string, { system: string; requiredCards: string[]; reason: string }[]> = {
  chest_pain: [
    { system: 'cardiovascular', requiredCards: ['cvs_pulse_character', 'cvs_heart_sounds', 'cvs_jvp', 'cvs_oedema', 'cvs_perfusion'], reason: 'Chest pain requires full cardiovascular assessment including JVP, heart sounds, and perfusion status.' },
    { system: 'respiratory', requiredCards: ['resp_ausc_breath_sounds', 'resp_perc_note'], reason: 'Chest pain may have respiratory causes (pneumothorax, pleurisy, PE).' },
  ],
  dyspnoea: [
    { system: 'respiratory', requiredCards: ['resp_ausc_breath_sounds', 'resp_perc_note', 'resp_insp_trachea', 'resp_ausc_wheeze'], reason: 'Dyspnoea requires complete respiratory assessment.' },
    { system: 'cardiovascular', requiredCards: ['cvs_jvp', 'cvs_heart_sounds', 'cvs_oedema', 'cvs_pulse_character'], reason: 'Cardiac causes of dyspnoea must be excluded.' },
  ],
  hemoptysis: [
    { system: 'respiratory', requiredCards: ['resp_ausc_breath_sounds', 'resp_perc_note', 'resp_ausc_crackles'], reason: 'Hemoptysis requires detailed respiratory examination.' },
    { system: 'respiratory', requiredCards: ['breast_insp_skin', 'breast_palp_mass'], reason: 'Consider ENT/oral source - examine oral cavity and neck.' },
  ],
  abdominal_pain: [
    { system: 'abdominal', requiredCards: ['abd_palp_tenderness', 'abd_palp_guarding', 'abd_palp_mass', 'abd_ausc_bowel_sounds'], reason: 'Abdominal pain requires complete abdominal examination.' },
  ],
  breast_lump: [
    { system: 'breast', requiredCards: ['breast_palp_mass', 'breast_axillary_nodes', 'breast_insp_skin', 'breast_insp_nipple', 'breast_supraclavicular_nodes'], reason: 'Breast lump requires full breast and nodal assessment.' },
  ],
  headache: [
    { system: 'neurological', requiredCards: ['neuro_consciousness_avpu', 'neuro_pupils_size', 'neuro_pupils_reaction'], reason: 'Headache requires neurological assessment including consciousness and pupils.' },
  ],
  fever: [
    { system: 'general_examination', requiredCards: ['ge_temp'], reason: 'Fever requires temperature documentation.' },
    { system: 'respiratory', requiredCards: ['resp_ausc_breath_sounds'], reason: 'Fever may indicate respiratory infection.' },
  ],
  cough: [
    { system: 'respiratory', requiredCards: ['resp_ausc_breath_sounds', 'resp_ausc_crackles', 'resp_ausc_wheeze'], reason: 'Cough requires respiratory examination.' },
  ],
  weight_loss: [
    { system: 'general_examination', requiredCards: ['ge_bmi', 'ge_nutrition'], reason: 'Weight loss requires nutritional assessment.' },
    { system: 'abdominal', requiredCards: ['abd_palp_mass'], reason: 'Weight loss may indicate abdominal pathology.' },
  ],
  nipple_discharge: [
    { system: 'breast', requiredCards: ['breast_nipple_discharge', 'breast_insp_nipple', 'breast_axillary_nodes'], reason: 'Nipple discharge requires full breast examination.' },
  ],
};

const DISEASE_EXAM_MAP: Record<string, { system: string; requiredCards: string[]; reason: string }[]> = {
  breast_cancer: [
    { system: 'breast', requiredCards: ['breast_palp_mass', 'breast_axillary_nodes', 'breast_supraclavicular_nodes', 'breast_cancer_contralateral', 'breast_cancer_skin_changes'], reason: 'Breast cancer requires complete local and nodal staging examination.' },
    { system: 'general_examination', requiredCards: ['ge_lymphadenopathy', 'ge_hepatomegaly'], reason: 'Assess for metastatic spread.' },
  ],
  heart_failure: [
    { system: 'cardiovascular', requiredCards: ['cvs_jvp', 'cvs_oedema', 'cvs_heart_sounds', 'cvs_pulse_character', 'cvs_ausc_lung_bases'], reason: 'Heart failure requires assessment of fluid status.' },
    { system: 'respiratory', requiredCards: ['resp_ausc_crackles'], reason: 'Assess for pulmonary oedema.' },
  ],
  pneumonia: [
    { system: 'respiratory', requiredCards: ['resp_ausc_breath_sounds', 'resp_perc_note', 'resp_ausc_crackles', 'resp_insp_trachea'], reason: 'Pneumonia requires full respiratory examination.' },
  ],
  asthma: [
    { system: 'respiratory', requiredCards: ['resp_ausc_wheeze', 'resp_ausc_breath_sounds', 'resp_insp_accessory'], reason: 'Asthma requires assessment of wheeze and accessory muscle use.' },
  ],
  copd: [
    { system: 'respiratory', requiredCards: ['resp_insp_chest_shape', 'resp_perc_note', 'resp_ausc_breath_sounds'], reason: 'COPD requires assessment of hyperinflation and air entry.' },
  ],
  meningitis: [
    { system: 'neurological', requiredCards: ['neuro_consciousness_avpu', 'neuro_meningeal_kernig', 'neuro_meningeal_brudzinski', 'neuro_pupils_size'], reason: 'Meningitis requires assessment of consciousness and meningeal signs.' },
  ],
  stroke: [
    { system: 'neurological', requiredCards: ['neuro_consciousness_avpu', 'neuro_motor_power_arms', 'neuro_motor_power_legs', 'neuro_pupils_size', 'neuro_speech'], reason: 'Stroke requires full neurological assessment including motor and speech.' },
  ],
  mastitis: [
    { system: 'breast', requiredCards: ['breast_insp_skin', 'breast_palp_tenderness', 'breast_palp_temperature', 'breast_axillary_nodes'], reason: 'Mastitis requires assessment of inflammation and nodes.' },
  ],
  pneumothorax: [
    { system: 'respiratory', requiredCards: ['resp_insp_trachea', 'resp_perc_note', 'resp_ausc_breath_sounds'], reason: 'Pneumothorax requires assessment of trachea, percussion, and breath sounds.' },
  ],
};

export function validateExamination(
  chiefComplaints: string[],
  knownDiseases: string[],
  findings: Record<string, unknown>,
  activeCardIds: string[],
): ValidationReport {
  const suggestions: ValidationSuggestion[] = [];
  const criticalAlerts: string[] = [];
  const teachingPoints: string[] = [];

  const checkedSystems = new Set<string>();

  for (const complaint of chiefComplaints) {
    const required = COMPLAINT_EXAM_MAP[complaint];
    if (!required) continue;

    for (const req of required) {
      checkedSystems.add(req.system);
      const anyMissing = req.requiredCards.some(cardId =>
        !activeCardIds.includes(cardId) || findings[cardId] == null
      );
      if (anyMissing) {
        const presentCards = req.requiredCards.filter(c => activeCardIds.includes(c) && findings[c] != null && findings[c] !== '' && findings[c] !== false);
        const missingCards = req.requiredCards.filter(c => !presentCards.includes(c));

        let type: ValidationSuggestion['type'] = req.system === 'neurological' || req.system === 'cardiovascular' ? 'warning' : 'info';
        suggestions.push({
          type,
          message: `Based on "${complaint}", ${req.system} examination may need completion.`,
          reason: req.reason,
          relatedHistory: [complaint],
          suggestedCards: missingCards,
          system: req.system,
        });

        if (complaint === 'hemoptysis' && req.requiredCards.includes('breast_insp_skin')) {
          teachingPoints.push('Hemoptysis: Always examine the upper airway, oral cavity, and neck even when a respiratory cause seems likely.');
        }
      }
    }
  }

  for (const disease of knownDiseases) {
    const required = DISEASE_EXAM_MAP[disease];
    if (!required) continue;

    for (const req of required) {
      checkedSystems.add(req.system);
      const anyMissing = req.requiredCards.some(cardId =>
        !activeCardIds.includes(cardId) || findings[cardId] == null
      );
      if (anyMissing) {
        const missingCards = req.requiredCards.filter(c => !activeCardIds.includes(c) || findings[c] == null);
        suggestions.push({
          type: 'teaching',
          message: `${disease.replace(/_/g, ' ')}: ${req.reason}`,
          reason: req.reason,
          relatedHistory: [disease],
          suggestedCards: missingCards,
          system: req.system,
        });
      }
    }

    if (disease === 'breast_cancer') {
      teachingPoints.push('Breast cancer: T4 staging requires assessment of skin involvement (peau d\'orange, ulceration, satellite nodules) and chest wall fixation.');
      teachingPoints.push('Breast cancer: Always examine contralateral breast and all nodal basins (axillary, supraclavicular, infraclavicular, cervical).');
    }
    if (disease === 'heart_failure') {
      teachingPoints.push('Heart failure: JVP, peripheral oedema, and basal crackles are essential for fluid status assessment.');
    }
  }

  return { suggestions, completeness: suggestions.length === 0 ? 100 : Math.max(0, 100 - suggestions.length * 15), criticalAlerts, teachingPoints };
}

export function validateCommonMissing(
  complaint: string,
  findings: Record<string, unknown>,
  activeCards: { id: string; section: string; label: string }[],
): string[] {
  const extras: string[] = [];

  if (['hemoptysis', 'cough', 'dyspnoea'].includes(complaint)) {
    const hasNodes = findings['ge_lymphadenopathy'] != null;
    if (!hasNodes) extras.push('Consider examining cervical/supraclavicular lymph nodes.');
    const hasOral = activeCards.some(c => c.id === 'ge_oral_cavity');
    if (!hasOral) extras.push('Consider examining the oral cavity.');
  }

  if (['chest_pain', 'dyspnoea'].includes(complaint)) {
    const hasLegs = findings['cvs_oedema'] != null || findings['cvs_peripheral_pulses'] != null;
    if (!hasLegs) extras.push('Consider examining lower limbs for oedema and peripheral pulses.');
  }

  if (complaint === 'abdominal_pain') {
    const hasHernia = findings['ge_hernia'] != null;
    const hasGenital = findings['ge_genitalia'] != null;
    if (!hasHernia && !hasGenital) extras.push('Consider examining for hernia and external genitalia in appropriate context.');
  }

  if (complaint === 'breast_lump') {
    const hasContralateral = findings['breast_cancer_contralateral'] != null;
    if (!hasContralateral) extras.push('Contralateral breast examination is recommended for comparison.');
  }

  return extras;
}
