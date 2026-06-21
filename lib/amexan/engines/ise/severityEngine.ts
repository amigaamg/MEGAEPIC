import type { FeatureRegistry } from '../../core/types';

export interface SeverityGrade {
  level: 'mild' | 'moderate' | 'severe' | 'critical';
  score: number;
  triggers: string[];
  action: string;
}

export interface SeverityConfig {
  diseaseId: string;
  name: string;
  criteria: SeverityCriterion[];
}

export interface SeverityCriterion {
  sign: string;
  label: string;
  mildWeight?: number;
  moderateWeight?: number;
  severeWeight?: number;
  criticalWeight?: number;
  boost?: number;
}

const APPENDICITIS_SEVERITY: SeverityConfig = {
  diseaseId: 'appendicitis',
  name: 'Acute Appendicitis Severity Assessment',
  criteria: [
    { sign: 'localized_rlq_pain', label: 'Localized RLQ pain only', mildWeight: 1, moderateWeight: 2 },
    { sign: 'generalized_pain', label: 'Generalized abdominal pain', moderateWeight: 3, severeWeight: 5, criticalWeight: 8 },
    { sign: 'rigidity', label: 'Abdominal rigidity', severeWeight: 8, criticalWeight: 10 },
    { sign: 'generalized_guarding', label: 'Generalized guarding', severeWeight: 7, criticalWeight: 10 },
    { sign: 'high_fever', label: 'High-grade fever >38.5°C', moderateWeight: 3, severeWeight: 5, criticalWeight: 7 },
    { sign: 'tachycardia', label: 'Tachycardia >100 bpm', moderateWeight: 2, severeWeight: 4, criticalWeight: 6 },
    { sign: 'tachycardia_gt_120', label: 'Tachycardia >120 bpm', severeWeight: 6, criticalWeight: 8 },
    { sign: 'hypotension', label: 'Hypotension (SBP <90)', criticalWeight: 10 },
    { sign: 'oliguria', label: 'Oliguria (<0.5 mL/kg/h)', severeWeight: 5, criticalWeight: 8 },
    { sign: 'altered_consciousness', label: 'Altered mental status', criticalWeight: 10 },
    { sign: 'septic_appearance', label: 'Septic/toxic appearance', severeWeight: 7, criticalWeight: 10 },
    { sign: 'lactate_elevated', label: 'Lactate >2 mmol/L', severeWeight: 6, criticalWeight: 8 },
    { sign: 'lactate_gt_4', label: 'Lactate >4 mmol/L', criticalWeight: 10 },
    { sign: 'wbc_gt_15', label: 'WBC >15,000', moderateWeight: 3, severeWeight: 4 },
    { sign: 'crp_gt_50', label: 'CRP >50 mg/L', moderateWeight: 2, severeWeight: 3 },
    { sign: 'symptoms_over_48h', label: 'Symptoms >48 hours', moderateWeight: 2, severeWeight: 4 },
    { sign: 'appendicolith_imaging', label: 'Appendicolith on imaging', moderateWeight: 3, severeWeight: 4 },
    { sign: 'free_air', label: 'Free air under diaphragm', criticalWeight: 10 },
    { sign: 'abscess_on_imaging', label: 'Intra-abdominal abscess', severeWeight: 7, criticalWeight: 9 },
  ],
};

const BOWEL_OBSTRUCTION_SEVERITY: SeverityConfig = {
  diseaseId: 'intestinal_obstruction',
  name: 'Bowel Obstruction Severity Assessment',
  criteria: [
    { sign: 'abdominal_distension', label: 'Abdominal distension', mildWeight: 1, moderateWeight: 2, severeWeight: 4 },
    { sign: 'high_pitched_bowel_sounds', label: 'High-pitched bowel sounds', mildWeight: 1, moderateWeight: 2 },
    { sign: 'absent_bowel_sounds', label: 'Absent bowel sounds', moderateWeight: 3, severeWeight: 5, criticalWeight: 8 },
    { sign: 'colicky_to_constant_pain_transition', label: 'Pain changing from colicky to constant', severeWeight: 7, criticalWeight: 10 },
    { sign: 'guarding_rigidity', label: 'Abdominal guarding or rigidity', moderateWeight: 4, severeWeight: 6, criticalWeight: 9 },
    { sign: 'fever_high', label: 'High fever >38.5°C', moderateWeight: 3, severeWeight: 5, criticalWeight: 7 },
    { sign: 'tachycardia', label: 'Tachycardia >100 bpm', moderateWeight: 2, severeWeight: 4, criticalWeight: 6 },
    { sign: 'hypotension', label: 'Hypotension (SBP <90)', severeWeight: 6, criticalWeight: 9 },
    { sign: 'lactate_elevated', label: 'Lactate >2 mmol/L', moderateWeight: 3, severeWeight: 6, criticalWeight: 8 },
    { sign: 'lactate_gt_4', label: 'Lactate >4 mmol/L', severeWeight: 7, criticalWeight: 10 },
    { sign: 'wbc_gt_15', label: 'WBC >15,000', moderateWeight: 2, severeWeight: 4 },
    { sign: 'oliguria', label: 'Oliguria (<0.5 mL/kg/h)', severeWeight: 5, criticalWeight: 8 },
    { sign: 'free_air', label: 'Free air on imaging', criticalWeight: 10 },
    { sign: 'closed_loop_ct', label: 'Closed-loop configuration on CT', severeWeight: 7, criticalWeight: 10 },
    { sign: 'pneumatosis', label: 'Pneumatosis intestinalis on CT', criticalWeight: 10 },
    { sign: 'symptoms_over_72h', label: 'Symptoms >72 hours', moderateWeight: 2, severeWeight: 3 },
    { sign: 'no_flatus_gt_24h', label: 'No flatus or stool >24h', moderateWeight: 3, severeWeight: 4 },
    { sign: 'visible_hernia_irreducible', label: 'Irreducible tender hernia', moderateWeight: 4, severeWeight: 6, criticalWeight: 8 },
  ],
};

const CHOLECYSTITIS_SEVERITY: SeverityConfig = {
  diseaseId: 'cholecystitis',
  name: 'Acute Cholecystitis Severity Assessment (TG18)',
  criteria: [
    { sign: 'murphy_sign', label: 'Positive Murphy\'s sign', mildWeight: 2, moderateWeight: 3 },
    { sign: 'ruq_tenderness', label: 'RUQ tenderness', mildWeight: 1, moderateWeight: 2 },
    { sign: 'guarding_ruq', label: 'Guarding in RUQ', moderateWeight: 3, severeWeight: 5, criticalWeight: 8 },
    { sign: 'fever_high', label: 'High fever >38.5°C', moderateWeight: 3, severeWeight: 5, criticalWeight: 7 },
    { sign: 'rigors', label: 'Rigors', severeWeight: 5, criticalWeight: 7 },
    { sign: 'jaundice', label: 'Jaundice', moderateWeight: 3, severeWeight: 5, criticalWeight: 6 },
    { sign: 'palpable_gallbladder_mass', label: 'Palpable gallbladder mass', moderateWeight: 4, severeWeight: 6 },
    { sign: 'generalized_peritonitis', label: 'Generalized peritonitis', severeWeight: 7, criticalWeight: 10 },
    { sign: 'tachycardia', label: 'Tachycardia >100 bpm', moderateWeight: 2, severeWeight: 4, criticalWeight: 6 },
    { sign: 'hypotension', label: 'Hypotension (SBP <90)', severeWeight: 6, criticalWeight: 9 },
    { sign: 'wbc_gt_18', label: 'WBC >18,000 (TG18 Grade II)', moderateWeight: 3, severeWeight: 5 },
    { sign: 'crp_gt_200', label: 'CRP >200 mg/L', moderateWeight: 3, severeWeight: 4 },
    { sign: 'symptoms_over_72h', label: 'Symptoms >72 hours', moderateWeight: 2, severeWeight: 4 },
    { sign: 'organ_dysfunction', label: 'Organ dysfunction (CV/Resp/Renal/Hepatic)', severeWeight: 7, criticalWeight: 10 },
    { sign: 'gallbladder_perfusion_deficit', label: 'Gallbladder wall perfusion deficit on CT', moderateWeight: 4, severeWeight: 6 },
    { sign: 'gas_in_gallbladder_wall', label: 'Gas in gallbladder wall (emphysematous)', severeWeight: 7, criticalWeight: 10 },
    { sign: 'free_air', label: 'Free air on imaging', criticalWeight: 10 },
    { sign: 'abscess_on_imaging', label: 'Pericholecystic abscess', severeWeight: 6, criticalWeight: 9 },
  ],
};

const PANCREATITIS_SEVERITY: SeverityConfig = {
  diseaseId: 'pancreatitis',
  name: 'Acute Pancreatitis Severity Assessment',
  criteria: [
    { sign: 'epigastric_tenderness', label: 'Epigastric tenderness', mildWeight: 1, moderateWeight: 2 },
    { sign: 'guarding', label: 'Epigastric guarding', moderateWeight: 3, severeWeight: 5 },
    { sign: 'absent_bowel_sounds_ileus', label: 'Paralytic ileus', moderateWeight: 3, severeWeight: 5, criticalWeight: 7 },
    { sign: 'grey_turner_sign_flank_ecchymosis', label: 'Grey-Turner\'s sign', severeWeight: 6, criticalWeight: 9 },
    { sign: 'cullen_sign_periumbilical_ecchymosis', label: 'Cullen\'s sign', severeWeight: 6, criticalWeight: 9 },
    { sign: 'hypotension', label: 'Hypotension (SBP <90)', severeWeight: 6, criticalWeight: 9 },
    { sign: 'tachycardia', label: 'Tachycardia >100 bpm', moderateWeight: 2, severeWeight: 4, criticalWeight: 6 },
    { sign: 'high_fever', label: 'Fever >38.5°C', moderateWeight: 3, severeWeight: 5, criticalWeight: 7 },
    { sign: 'tachypnea_hypoxia', label: 'Tachypnea / Hypoxia (RR >20, SpO2 <90%)', moderateWeight: 4, severeWeight: 6, criticalWeight: 8 },
    { sign: 'oliguria', label: 'Oliguria (<0.5 mL/kg/h)', moderateWeight: 4, severeWeight: 6, criticalWeight: 8 },
    { sign: 'altered_consciousness', label: 'Altered mental status', severeWeight: 6, criticalWeight: 10 },
    { sign: 'pleural_effusion_left', label: 'Left pleural effusion', moderateWeight: 3, severeWeight: 5 },
    { sign: 'epigastric_mass', label: 'Palpable epigastric mass (pseudocyst)', moderateWeight: 3, severeWeight: 4 },
    { sign: 'wbc_gt_15', label: 'WBC >15,000', moderateWeight: 2, severeWeight: 4 },
    { sign: 'crp_gt_150', label: 'CRP >150 mg/L at 48h', moderateWeight: 3, severeWeight: 5 },
    { sign: 'lactate_elevated', label: 'Lactate >2 mmol/L', moderateWeight: 3, severeWeight: 5, criticalWeight: 8 },
    { sign: 'lactate_gt_4', label: 'Lactate >4 mmol/L', severeWeight: 7, criticalWeight: 10 },
    { sign: 'glucose_gt_10', label: 'Glucose >10 mmol/L (non-diabetic)', moderateWeight: 2, severeWeight: 4 },
    { sign: 'calcium_lt_2', label: 'Calcium <2.0 mmol/L', moderateWeight: 3, severeWeight: 5 },
    { sign: 'pancreatic_necrosis_gt_30', label: 'Pancreatic necrosis >30% on CT', severeWeight: 6, criticalWeight: 9 },
    { sign: 'gas_in_necrosis', label: 'Gas bubbles in necrosis on CT', severeWeight: 7, criticalWeight: 10 },
    { sign: 'organ_failure_persistent', label: 'Persistent organ failure >48h', severeWeight: 7, criticalWeight: 10 },
  ],
};

const PERFORATED_ULCER_SEVERITY: SeverityConfig = {
  diseaseId: 'perforated_ulcer',
  name: 'Perforated Peptic Ulcer Severity Assessment (Boey Score)',
  criteria: [
    { sign: 'board_like_rigidity', label: 'Board-like rigidity', moderateWeight: 3, severeWeight: 6, criticalWeight: 9 },
    { sign: 'generalized_guarding', label: 'Generalized guarding', moderateWeight: 3, severeWeight: 5, criticalWeight: 8 },
    { sign: 'generalized_rigidity', label: 'Generalized rigidity', severeWeight: 7, criticalWeight: 10 },
    { sign: 'rebound_tenderness', label: 'Rebound tenderness', moderateWeight: 2, severeWeight: 4 },
    { sign: 'absent_bowel_sounds', label: 'Silent abdomen', moderateWeight: 3, severeWeight: 5, criticalWeight: 8 },
    { sign: 'liver_dullness_obliteration', label: 'Liver dullness obliteration', moderateWeight: 3, severeWeight: 5, criticalWeight: 7 },
    { sign: 'free_air', label: 'Free air on imaging', severeWeight: 6, criticalWeight: 9 },
    { sign: 'hypotension', label: 'Hypotension (SBP <90 — Boey 1 point)', severeWeight: 6, criticalWeight: 9 },
    { sign: 'tachycardia', label: 'Tachycardia >100 bpm', moderateWeight: 2, severeWeight: 4, criticalWeight: 6 },
    { sign: 'high_fever', label: 'High fever >38.5°C', moderateWeight: 3, severeWeight: 5, criticalWeight: 7 },
    { sign: 'symptoms_over_24h', label: 'Symptoms >24 hours (Boey 1 point)', moderateWeight: 2, severeWeight: 4, criticalWeight: 6 },
    { sign: 'age_over_65', label: 'Age >65 years', moderateWeight: 2, severeWeight: 3 },
    { sign: 'comorbidity_asa_3', label: 'Significant comorbidity (Boey 1 point)', moderateWeight: 2, severeWeight: 4, criticalWeight: 6 },
    { sign: 'oliguria', label: 'Oliguria (<0.5 mL/kg/h)', moderateWeight: 4, severeWeight: 6, criticalWeight: 8 },
    { sign: 'lactate_elevated', label: 'Lactate >2 mmol/L', moderateWeight: 3, severeWeight: 5, criticalWeight: 8 },
    { sign: 'lactate_gt_4', label: 'Lactate >4 mmol/L', severeWeight: 7, criticalWeight: 10 },
    { sign: 'wbc_gt_15', label: 'WBC >15,000', moderateWeight: 2, severeWeight: 4 },
    { sign: 'altered_consciousness', label: 'Altered mental status', severeWeight: 6, criticalWeight: 10 },
    { sign: 'perforation_large', label: 'Large perforation (>2 cm on imaging/surgery)', severeWeight: 5, criticalWeight: 8 },
    { sign: 'contamination_severe', label: 'Gross peritoneal contamination', severeWeight: 6, criticalWeight: 10 },
  ],
};

const SEVERITY_REGISTRY = new Map<string, SeverityConfig>();
SEVERITY_REGISTRY.set('appendicitis', APPENDICITIS_SEVERITY);
SEVERITY_REGISTRY.set('intestinal_obstruction', BOWEL_OBSTRUCTION_SEVERITY);
SEVERITY_REGISTRY.set('cholecystitis', CHOLECYSTITIS_SEVERITY);
SEVERITY_REGISTRY.set('pancreatitis', PANCREATITIS_SEVERITY);
SEVERITY_REGISTRY.set('perforated_ulcer', PERFORATED_ULCER_SEVERITY);

const THRESHOLDS = {
  mild: { min: 0, max: 3 },
  moderate: { min: 4, max: 7 },
  severe: { min: 8, max: 12 },
  critical: { min: 13, max: Infinity },
};

export function registerSeverityConfig(config: SeverityConfig): void {
  SEVERITY_REGISTRY.set(config.diseaseId, config);
}

export function getSeverityConfig(diseaseId: string): SeverityConfig | undefined {
  return SEVERITY_REGISTRY.get(diseaseId);
}

export function calculateSeverity(
  diseaseId: string,
  featureRegistry: FeatureRegistry,
): SeverityGrade {
  const config = SEVERITY_REGISTRY.get(diseaseId);
  if (!config) {
    return { level: 'mild', score: 0, triggers: [], action: 'No severity config registered.' };
  }

  let totalScore = 0;
  const triggers: string[] = [];

  for (const criterion of config.criteria) {
    const entry = featureRegistry[criterion.sign];
    if (!entry || entry.present !== true) continue;

    let signScore = 0;
    if (criterion.criticalWeight) {
      if (totalScore >= 8) signScore = criterion.criticalWeight;
      else if (criterion.severeWeight) signScore = criterion.severeWeight;
      else if (criterion.moderateWeight) signScore = criterion.moderateWeight;
      else if (criterion.mildWeight) signScore = criterion.mildWeight;
      else signScore = criterion.criticalWeight;
    } else if (criterion.severeWeight) {
      if (totalScore >= 5) signScore = criterion.severeWeight;
      else if (criterion.moderateWeight) signScore = criterion.moderateWeight;
      else if (criterion.mildWeight) signScore = criterion.mildWeight;
      else signScore = criterion.severeWeight;
    } else if (criterion.moderateWeight) {
      signScore = criterion.moderateWeight;
    } else if (criterion.mildWeight) {
      signScore = criterion.mildWeight;
    }

    if (signScore > 0) {
      totalScore += signScore;
      if (criterion.criticalWeight && signScore === criterion.criticalWeight) triggers.push(`${criterion.label} (critical)`);
      else if (criterion.severeWeight && signScore === criterion.severeWeight) triggers.push(`${criterion.label} (severe)`);
      else if (criterion.moderateWeight && signScore === criterion.moderateWeight) triggers.push(`${criterion.label} (moderate)`);
      else triggers.push(`${criterion.label} (mild)`);
    }
  }

  let level: SeverityGrade['level'];
  let action: string;

  if (totalScore >= THRESHOLDS.critical.min) {
    level = 'critical';
    action = 'EMERGENCY: Immediate laparotomy, ICU, IV antibiotics, resuscitation. Notify senior surgeon and anaesthetist.';
  } else if (totalScore >= THRESHOLDS.severe.min) {
    level = 'severe';
    action = 'URGENT: Prepare for emergency appendicectomy within 2h. IV antibiotics, fluids, crossmatch. High risk of perforation.';
  } else if (totalScore >= THRESHOLDS.moderate.min) {
    level = 'moderate';
    action = 'Admit for observation. IV antibiotics, NBM, serial examinations. Consider CT/US if diagnosis uncertain. Appendicectomy within 12-24h if confirmed.';
  } else {
    level = 'mild';
    action = 'Low suspicion. Observe, reassess in 6-12h. Consider alternative diagnoses. Discharge with safety netting if improving.';
  }

  return { level, score: totalScore, triggers, action };
}
