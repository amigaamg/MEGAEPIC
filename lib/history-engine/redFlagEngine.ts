import type { RedFlag, FeatureRegistry, ChiefComplaint, Biodata } from './types';
import HISTORY_FEATURE_REGISTRY from './historyFeatureRegistry';

export interface RedFlagResult {
  redFlags: RedFlag[];
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  hasCritical: boolean;
  summary: string;
}

const RED_FLAG_RULES: Omit<RedFlag, 'triggered'>[] = [
  {
    id: 'rf_acs_crushing',
    rule: 'Crushing chest pain + radiation to arm/jaw + sweating',
    severity: 'critical',
    message: 'HIGH RISK ACS — Immediate ECG and cardiac workup required',
    diseases: ['chest_pain', 'myocardial_infarction'],
  },
  {
    id: 'rf_acs_exertional',
    rule: 'Exertional chest pain + dyspnea + diaphoresis',
    severity: 'critical',
    message: 'HIGH RISK ACS — Unstable angina equivalent, urgent assessment',
    diseases: ['chest_pain'],
  },
  {
    id: 'rf_meningitis_triad',
    rule: 'Headache + fever + neck stiffness',
    severity: 'critical',
    message: 'Meningeal irritation — possible meningitis, urgent LP and antibiotics',
    diseases: ['meningitis'],
  },
  {
    id: 'rf_meningitis_rash',
    rule: 'Fever + headache + petechial/purpuric rash',
    severity: 'critical',
    message: 'Meningococcal meningitis possible — urgent IV antibiotics',
    diseases: ['meningitis', 'meningococcal_sepsis'],
  },
  {
    id: 'rf_sepsis_qsofa',
    rule: 'Altered mental status + RR >= 22 + SBP <= 100',
    severity: 'critical',
    message: 'qSOFA >= 2 — HIGH RISK SEPSIS, initiate sepsis protocol immediately',
    diseases: ['sepsis', 'septic_shock'],
  },
  {
    id: 'rf_airway_stridor',
    rule: 'Stridor + respiratory distress',
    severity: 'critical',
    message: 'Upper airway obstruction — emergency airway assessment needed',
    diseases: ['croup', 'epiglottitis', 'foreign_body_aspiration', 'anaphylaxis'],
  },
  {
    id: 'rf_airway_silent_chest',
    rule: 'Severe respiratory distress + silent chest',
    severity: 'critical',
    message: 'Silent chest — life-threatening asthma exacerbation',
    diseases: ['asthma_pulm'],
  },
  {
    id: 'rf_sah_thunderclap',
    rule: 'Thunderclap headache worst of life',
    severity: 'critical',
    message: 'Thunderclap headache — rule out subarachnoid hemorrhage with urgent CT head',
    diseases: ['subarachnoid_hemorrhage'],
  },
  {
    id: 'rf_pe_triad',
    rule: 'Sudden dyspnea + pleuritic chest pain + hemoptysis',
    severity: 'high',
    message: 'Classic PE triad — urgent CTPA or V/Q scan needed',
    diseases: ['pulmonary_embolism'],
  },
  {
    id: 'rf_pe_unilateral',
    rule: 'Unilateral leg swelling + dyspnea + chest pain',
    severity: 'high',
    message: 'DVT + respiratory symptoms — HIGH suspicion for PE',
    diseases: ['pulmonary_embolism', 'dvt'],
  },
  {
    id: 'rf_abdomen_peritonitis',
    rule: 'Abdominal pain + guarding rigidity + fever',
    severity: 'critical',
    message: 'Peritonitis — likely surgical abdomen, immediate surgical review',
    diseases: ['appendicitis', 'cholecystitis', 'bowel_obstruction', 'pancreatitis', 'typhoid'],
  },
  {
    id: 'rf_abdomen_gi_bleed',
    rule: 'Hematemesis or melena + hypotension + tachycardia',
    severity: 'critical',
    message: 'Active GI bleeding — urgent resuscitation and endoscopy needed',
    diseases: ['peptic_ulcer', 'esophageal_varices', 'gastritis'],
  },
  {
    id: 'rf_stroke_befast',
    rule: 'Sudden onset focal neurological deficit face arm speech',
    severity: 'critical',
    message: 'Acute stroke — urgent CT head and stroke team activation',
    diseases: ['ischaemic_stroke', 'haemorrhagic_stroke'],
  },
  {
    id: 'rf_cauda_equina',
    rule: 'Back pain + saddle anesthesia + urinary retention',
    severity: 'critical',
    message: 'Cauda equina syndrome — emergency surgical decompression needed',
    diseases: ['cauda_equina_syndrome'],
  },
  {
    id: 'rf_tb_classic',
    rule: 'Cough more than 2 weeks + weight loss + night sweats + fever',
    severity: 'high',
    message: 'Classic TB symptoms — sputum AFB, GeneXpert, and CXR needed',
    diseases: ['tb_pulm'],
  },
  {
    id: 'rf_tb_hemoptysis',
    rule: 'Hemoptysis + weight loss + night sweats',
    severity: 'high',
    message: 'Hemoptysis with constitutional symptoms — high suspicion for TB or lung cancer',
    diseases: ['tb_pulm', 'lung_cancer', 'bronchiectasis'],
  },
  {
    id: 'rf_dka',
    rule: 'Polyuria + polydipsia + weight loss + altered consciousness',
    severity: 'critical',
    message: 'Possible DKA — urgent blood glucose and ketones needed',
    diseases: ['diabetes_t1', 'dka'],
  },
  {
    id: 'rf_htn_emergency',
    rule: 'Severe headache + BP more than 180/120 + visual disturbance',
    severity: 'critical',
    message: 'Hypertensive emergency — urgent BP lowering needed',
    diseases: ['hypertension'],
  },
  {
    id: 'rf_aortic_dissection',
    rule: 'Tearing chest pain radiating to back + hypertension',
    severity: 'critical',
    message: 'Aortic dissection — urgent CT aortogram',
    diseases: ['aortic_dissection'],
  },
  {
    id: 'rf_anaphylaxis',
    rule: 'Sudden onset + urticaria + wheeze + hypotension after exposure',
    severity: 'critical',
    message: 'Anaphylaxis — immediate IM adrenaline',
    diseases: ['anaphylaxis'],
  },
];

export function evaluateRedFlags(
  featureRegistry: FeatureRegistry,
  complaints: ChiefComplaint[],
  biodata: Biodata
): RedFlagResult {
  const triggered: RedFlag[] = [];
  const presentIds = new Set(
    Object.entries(featureRegistry)
      .filter(([, e]) => e.present === true)
      .map(([id]) => id)
  );
  const presentLabels = new Set(
    Object.entries(featureRegistry)
      .filter(([, e]) => e.present === true)
      .map(([, e]) => e.id.replace(/_/g, ' ').toLowerCase())
  );

  const symptomLabels = new Set(complaints.map(c => c.label.toLowerCase()));

  for (const rule of RED_FLAG_RULES) {
    const conditions = rule.rule.toLowerCase().split(/[+]/).map(s => s.trim());
    const allMet = conditions.every(cond => {
      const words = cond.split(/\s+/);
      const anyFeature = Array.from(presentLabels).some(l => words.some(w => l.includes(w)));
      const anySymptom = Array.from(symptomLabels).some(l => words.some(w => l.includes(w)));
      return anyFeature || anySymptom;
    });
    if (allMet) {
      triggered.push({ ...rule, triggered: true });
    }
  }

  for (const [, entry] of Object.entries(featureRegistry)) {
    if (entry.present === true) {
      const featureDef = HISTORY_FEATURE_REGISTRY[entry.id];
      if (featureDef?.isRedFlag) {
        triggered.push({
          id: `rf_feature_${entry.id}`,
          rule: featureDef.label,
          severity: featureDef.redFlagSeverity || 'moderate',
          message: featureDef.redFlagMessage || `${featureDef.label} — clinically significant`,
          diseases: Object.keys(entry.diseaseWeights),
          triggered: true,
        });
      }
    }
  }

  const criticalCount = triggered.filter(r => r.severity === 'critical').length;
  const highCount = triggered.filter(r => r.severity === 'high').length;
  const moderateCount = triggered.filter(r => r.severity === 'moderate').length;

  let summary = '';
  if (criticalCount > 0) {
    summary = `CRITICAL: ${criticalCount} red flag(s) detected — immediate action required`;
  } else if (highCount > 0) {
    summary = `WARNING: ${highCount} high-priority red flag(s) — urgent assessment needed`;
  } else if (moderateCount > 0) {
    summary = `NOTE: ${moderateCount} red flag(s) — clinical attention recommended`;
  } else {
    summary = 'No red flags detected';
  }

  return { redFlags: triggered, criticalCount, highCount, moderateCount, hasCritical: criticalCount > 0, summary };
}
