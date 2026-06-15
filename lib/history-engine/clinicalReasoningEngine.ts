// ── CLINICAL REASONING ENGINE ──
// Combines history (featureRegistry) + examination findings to produce
// supporting/opposing features per differential diagnosis.

import type {
  DdxResult, ClinicalReasoningEntry, FeatureRegistry,
  GeneralExamination, SystemExaminations, ChiefComplaint,
} from './types';
import HISTORY_FEATURE_REGISTRY from './historyFeatureRegistry';

export interface ClinicalReasoningInput {
  complaints: ChiefComplaint[];
  featureRegistry: FeatureRegistry;
  ddx: DdxResult;
  generalExamination: GeneralExamination;
  systemExaminations: SystemExaminations;
}

// ── Auto-interpretation of vitals ──
export interface VitalInterpretation {
  finding: string;
  isAbnormal: boolean;
}

export function interpretVitals(ge: GeneralExamination): VitalInterpretation[] {
  const interpretations: VitalInterpretation[] = [];
  const v = ge.vitals;

  if (v.temperature !== null) {
    if (v.temperature > 37.5) interpretations.push({ finding: `Temperature ${v.temperature}°C — Pyrexia present.`, isAbnormal: true });
    else if (v.temperature < 36.0) interpretations.push({ finding: `Temperature ${v.temperature}°C — Hypothermia.`, isAbnormal: true });
    else interpretations.push({ finding: `Temperature ${v.temperature}°C — Normothermic.`, isAbnormal: false });
  }

  if (v.heartRate !== null) {
    if (v.heartRate > 100) interpretations.push({ finding: `Pulse ${v.heartRate}/min — Tachycardia.`, isAbnormal: true });
    else if (v.heartRate < 60) interpretations.push({ finding: `Pulse ${v.heartRate}/min — Bradycardia.`, isAbnormal: true });
    else interpretations.push({ finding: `Pulse ${v.heartRate}/min — Normal rate.`, isAbnormal: false });
  }

  if (v.bloodPressureSystolic !== null) {
    const sys = v.bloodPressureSystolic;
    const dia = v.bloodPressureDiastolic;
    if (sys >= 140 || (dia && dia >= 90)) {
      interpretations.push({ finding: `BP ${sys}/${dia || '?'} mmHg — Hypertension.`, isAbnormal: true });
    } else if (sys < 90) {
      interpretations.push({ finding: `BP ${sys}/${dia || '?'} mmHg — Hypotension.`, isAbnormal: true });
    } else {
      interpretations.push({ finding: `BP ${sys}/${dia || '?'} mmHg — Normotensive.`, isAbnormal: false });
    }
  }

  if (v.respiratoryRate !== null) {
    if (v.respiratoryRate > 20) interpretations.push({ finding: `RR ${v.respiratoryRate}/min — Tachypnea.`, isAbnormal: true });
    else if (v.respiratoryRate < 12) interpretations.push({ finding: `RR ${v.respiratoryRate}/min — Bradypnea.`, isAbnormal: true });
    else interpretations.push({ finding: `RR ${v.respiratoryRate}/min — Normal rate.`, isAbnormal: false });
  }

  if (v.oxygenSaturation !== null) {
    if (v.oxygenSaturation < 92) interpretations.push({ finding: `SpO₂ ${v.oxygenSaturation}% — Hypoxemia. Requires oxygen.`, isAbnormal: true });
    else if (v.oxygenSaturation < 95) interpretations.push({ finding: `SpO₂ ${v.oxygenSaturation}% — Borderline low.`, isAbnormal: true });
    else interpretations.push({ finding: `SpO₂ ${v.oxygenSaturation}% — Normal oxygenation.`, isAbnormal: false });
  }

  if (v.bloodSugar !== null) {
    if (v.bloodSugar > 11.1) interpretations.push({ finding: `RBS ${v.bloodSugar} mmol/L — Hyperglycemia.`, isAbnormal: true });
    else if (v.bloodSugar < 3.9) interpretations.push({ finding: `RBS ${v.bloodSugar} mmol/L — Hypoglycemia.`, isAbnormal: true });
    else interpretations.push({ finding: `RBS ${v.bloodSugar} mmol/L — Normal range.`, isAbnormal: false });
  }

  return interpretations;
}

// ── Extract exam supporting features per disease ──
export interface ExamFeatureForDisease {
  diseaseId: string;
  supporting: string[];
  supportingFromVitals: string[];
  supportingFromGeneralSigns: string[];
  supportingFromSystemic: string[];
}

const DISEASE_VITAL_PATTERNS: Record<string, { finding: string; vitalKey: string; abnormalCondition: (v: any) => boolean }[]> = {
  pneumonia_pulm: [
    { finding: 'Fever', vitalKey: 'temperature', abnormalCondition: (v) => v.temperature !== null && v.temperature > 37.5 },
    { finding: 'Tachypnea', vitalKey: 'respiratoryRate', abnormalCondition: (v) => v.respiratoryRate !== null && v.respiratoryRate > 20 },
    { finding: 'Hypoxemia', vitalKey: 'oxygenSaturation', abnormalCondition: (v) => v.oxygenSaturation !== null && v.oxygenSaturation < 92 },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
  ],
  sepsis: [
    { finding: 'Fever/Hypothermia', vitalKey: 'temperature', abnormalCondition: (v) => v.temperature !== null && (v.temperature > 37.5 || v.temperature < 36) },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
    { finding: 'Tachypnea', vitalKey: 'respiratoryRate', abnormalCondition: (v) => v.respiratoryRate !== null && v.respiratoryRate > 20 },
    { finding: 'Hypotension', vitalKey: 'bloodPressureSystolic', abnormalCondition: (v) => v.bloodPressureSystolic !== null && v.bloodPressureSystolic < 90 },
  ],
  heart_failure_card: [
    { finding: 'Tachypnea', vitalKey: 'respiratoryRate', abnormalCondition: (v) => v.respiratoryRate !== null && v.respiratoryRate > 20 },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
    { finding: 'Hypoxemia', vitalKey: 'oxygenSaturation', abnormalCondition: (v) => v.oxygenSaturation !== null && v.oxygenSaturation < 92 },
    { finding: 'Hypertension/ Hypotension', vitalKey: 'bloodPressureSystolic', abnormalCondition: (v) => v.bloodPressureSystolic !== null && v.bloodPressureSystolic > 140 },
  ],
  asthma_pulm: [
    { finding: 'Tachypnea', vitalKey: 'respiratoryRate', abnormalCondition: (v) => v.respiratoryRate !== null && v.respiratoryRate > 20 },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
    { finding: 'Hypoxemia', vitalKey: 'oxygenSaturation', abnormalCondition: (v) => v.oxygenSaturation !== null && v.oxygenSaturation < 92 },
  ],
  malaria: [
    { finding: 'Fever', vitalKey: 'temperature', abnormalCondition: (v) => v.temperature !== null && v.temperature > 37.5 },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
  ],
  meningitis: [
    { finding: 'Fever', vitalKey: 'temperature', abnormalCondition: (v) => v.temperature !== null && v.temperature > 37.5 },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
  ],
  appendicitis: [
    { finding: 'Fever', vitalKey: 'temperature', abnormalCondition: (v) => v.temperature !== null && v.temperature > 37.5 },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
  ],
  dvt: [
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
  ],
  pulmonary_embolism: [
    { finding: 'Tachypnea', vitalKey: 'respiratoryRate', abnormalCondition: (v) => v.respiratoryRate !== null && v.respiratoryRate > 20 },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
    { finding: 'Hypoxemia', vitalKey: 'oxygenSaturation', abnormalCondition: (v) => v.oxygenSaturation !== null && v.oxygenSaturation < 92 },
  ],
  diabetic_ketoacidosis: [
    { finding: 'Tachypnea (Kussmaul)', vitalKey: 'respiratoryRate', abnormalCondition: (v) => v.respiratoryRate !== null && v.respiratoryRate > 24 },
    { finding: 'Tachycardia', vitalKey: 'heartRate', abnormalCondition: (v) => v.heartRate !== null && v.heartRate > 100 },
    { finding: 'Hyperglycemia', vitalKey: 'bloodSugar', abnormalCondition: (v) => v.bloodSugar !== null && v.bloodSugar > 11.1 },
  ],
};

const DISEASE_GENERAL_SIGN_PATTERNS: Record<string, { signId: string; description: string }[]> = {
  pneumonia_pulm: [
    { signId: 'gs_cyanosis', description: 'Cyanosis (hypoxemia)' },
    { signId: 'gs_lymphadenopathy', description: 'Lymphadenopathy' },
  ],
  tb_pulm: [
    { signId: 'gs_clubbing', description: 'Clubbing (chronic disease)' },
    { signId: 'gs_lymphadenopathy', description: 'Cervical lymphadenopathy' },
    { signId: 'gs_pallor', description: 'Pallor (chronic disease/anemia)' },
  ],
  heart_failure_card: [
    { signId: 'gs_cyanosis', description: 'Cyanosis' },
    { signId: 'gs_edema', description: 'Peripheral edema' },
    { signId: 'gs_lymphadenopathy', description: 'Lymphadenopathy' },
  ],
  cirrhosis: [
    { signId: 'gs_jaundice', description: 'Jaundice' },
    { signId: 'gs_edema', description: 'Peripheral edema' },
    { signId: 'gs_scratch_marks', description: 'Scratch marks (pruritus)' },
    { signId: 'gs_spider_nevi', description: 'Spider nevi' },
    { signId: 'gs_palmar_erythema', description: 'Palmar erythema' },
    { signId: 'gs_gynecomastia', description: 'Gynecomastia' },
  ],
  anemia: [
    { signId: 'gs_pallor', description: 'Pallor' },
    { signId: 'gs_nail_changes', description: 'Koilonychia (iron deficiency)' },
  ],
  malaria: [
    { signId: 'gs_pallor', description: 'Pallor (hemolysis)' },
    { signId: 'gs_jaundice', description: 'Jaundice (hemolysis)' },
  ],
  infective_endocarditis: [
    { signId: 'gs_clubbing', description: 'Clubbing' },
    { signId: 'gs_nail_changes', description: 'Splinter hemorrhages' },
  ],
  hyperthyroidism: [
    { signId: 'gs_goiter', description: 'Goiter' },
    { signId: 'gs_exophthalmos', description: 'Exophthalmos' },
  ],
  rheumatic_fever: [
    { signId: 'gs_nail_changes', description: 'Splinter hemorrhages' },
  ],
};

const DISEASE_SYSTEMIC_EXAM_PATTERNS: Record<string, { systemId: string; findingLabel: string; description: string }[]> = {
  pneumonia_pulm: [
    { systemId: 'respiratory', findingLabel: 'Crackles', description: 'Crackles/crepitations on auscultation' },
    { systemId: 'respiratory', findingLabel: 'Bronchial breathing', description: 'Bronchial breathing' },
    { systemId: 'respiratory', findingLabel: 'Dull percussion', description: 'Dull percussion note' },
    { systemId: 'respiratory', findingLabel: 'Increased vocal resonance', description: 'Increased vocal resonance' },
  ],
  pleural_effusion: [
    { systemId: 'respiratory', findingLabel: 'Stony dull percussion', description: 'Stony dull percussion note' },
    { systemId: 'respiratory', findingLabel: 'Reduced breath sounds', description: 'Reduced/absent breath sounds' },
    { systemId: 'respiratory', findingLabel: 'Decreased vocal resonance', description: 'Decreased vocal resonance' },
    { systemId: 'respiratory', findingLabel: 'Tracheal deviation', description: 'Tracheal deviation away from effusion (if large)' },
  ],
  pneumothorax: [
    { systemId: 'respiratory', findingLabel: 'Hyperresonant percussion', description: 'Hyperresonant percussion note' },
    { systemId: 'respiratory', findingLabel: 'Reduced breath sounds', description: 'Reduced/absent breath sounds' },
    { systemId: 'respiratory', findingLabel: 'Tracheal deviation', description: 'Tracheal deviation away from pneumothorax' },
  ],
  asthma_pulm: [
    { systemId: 'respiratory', findingLabel: 'Wheeze', description: 'Expiratory wheeze' },
    { systemId: 'respiratory', findingLabel: 'Accessory muscles', description: 'Use of accessory muscles' },
    { systemId: 'respiratory', findingLabel: 'Hyperresonant', description: 'Hyperresonant percussion (hyperinflation)' },
  ],
  copd_pulm: [
    { systemId: 'respiratory', findingLabel: 'Wheeze', description: 'Wheeze — biphasic' },
    { systemId: 'respiratory', findingLabel: 'Reduced breath sounds', description: 'Reduced breath sounds' },
    { systemId: 'respiratory', findingLabel: 'Hyperresonant', description: 'Hyperresonant percussion' },
  ],
  heart_failure_card: [
    { systemId: 'cardiovascular', findingLabel: 'S3 gallop', description: 'S3 gallop rhythm' },
    { systemId: 'cardiovascular', findingLabel: 'Raised JVP', description: 'Raised jugular venous pressure' },
    { systemId: 'cardiovascular', findingLabel: 'Peripheral edema', description: 'Peripheral edema' },
    { systemId: 'cardiovascular', findingLabel: 'Murmur', description: 'Heart murmur (functional/structural)' },
    { systemId: 'respiratory', findingLabel: 'Crackles', description: 'Bibasal crackles (pulmonary congestion)' },
  ],
  appendicitis: [
    { systemId: 'gastrointestinal', findingLabel: 'RIF tenderness', description: 'Right iliac fossa tenderness' },
    { systemId: 'gastrointestinal', findingLabel: 'Guarding', description: 'Guarding/rigidity' },
    { systemId: 'gastrointestinal', findingLabel: 'Rebound tenderness', description: 'Rebound tenderness' },
    { systemId: 'gastrointestinal', findingLabel: 'Murphy sign', description: 'Murphy sign' },
  ],
  cholecystitis: [
    { systemId: 'gastrointestinal', findingLabel: 'RUQ tenderness', description: 'Right upper quadrant tenderness' },
    { systemId: 'gastrointestinal', findingLabel: 'Murphy sign', description: 'Murphy sign positive' },
  ],
  meningitis: [
    { systemId: 'neurological', findingLabel: 'Neck stiffness', description: 'Neck stiffness' },
    { systemId: 'neurological', findingLabel: 'Kernig sign', description: 'Kernig sign positive' },
    { systemId: 'neurological', findingLabel: 'Brudzinski sign', description: 'Brudzinski sign positive' },
  ],
  stroke_tia: [
    { systemId: 'neurological', findingLabel: 'Hemiparesis', description: 'Hemiparesis/hemiplegia' },
    { systemId: 'neurological', findingLabel: 'CN deficit', description: 'Cranial nerve deficit' },
    { systemId: 'neurological', findingLabel: 'Sensory loss', description: 'Sensory loss on affected side' },
  ],
  bowel_obstruction: [
    { systemId: 'gastrointestinal', findingLabel: 'Distension', description: 'Abdominal distension' },
    { systemId: 'gastrointestinal', findingLabel: 'Tinkling sounds', description: 'Tinkling/high-pitched bowel sounds' },
    { systemId: 'gastrointestinal', findingLabel: 'Tenderness', description: 'Generalized tenderness' },
  ],
  abscess: [
    { systemId: 'gastrointestinal', findingLabel: 'Mass', description: 'Palpable mass/tenderness over affected area' },
  ],
};

export function computeClinicalReasoning(input: ClinicalReasoningInput): ClinicalReasoningEntry[] {
  const { ddx, generalExamination, systemExaminations } = input;
  const vitals = generalExamination.vitals;
  const generalSigns = generalExamination.generalSigns;

  return ddx.probabilities.map(p => {
    const supportingFromHistory: string[] = [];
    const supportingFromExamination: string[] = [];
    const opposing: string[] = [];

    // History-based supporting features
    for (const [, fe] of Object.entries(input.featureRegistry)) {
      if (fe.present === true) {
        const featureDef = HISTORY_FEATURE_REGISTRY[fe.id];
        const weight = fe.diseaseWeights[p.diseaseId];
        if (weight && weight > 0) {
          supportingFromHistory.push(featureDef?.label || fe.id.replace(/_/g, ' '));
        }
      }
      if (fe.present === false) {
        const featureDef = HISTORY_FEATURE_REGISTRY[fe.id];
        const weight = fe.diseaseWeights[p.diseaseId];
        if (weight && weight > 0) {
          opposing.push(`Absence of ${featureDef?.label || fe.id.replace(/_/g, ' ')} (negative predictor)`);
        }
      }
    }

    // Vitals-based supporting features
    const vitalPatterns = DISEASE_VITAL_PATTERNS[p.diseaseId] || [];
    for (const pattern of vitalPatterns) {
      if (pattern.abnormalCondition(vitals)) {
        supportingFromExamination.push(pattern.finding);
      }
    }

    // General sign-based supporting features
    const signPatterns = DISEASE_GENERAL_SIGN_PATTERNS[p.diseaseId] || [];
    for (const pattern of signPatterns) {
      const sign = generalSigns.find(s => s.id === pattern.signId);
      if (sign?.present) {
        supportingFromExamination.push(pattern.description);
      }
    }

    // Systemic exam-based supporting features
    const examPatterns = DISEASE_SYSTEMIC_EXAM_PATTERNS[p.diseaseId] || [];
    for (const pattern of examPatterns) {
      const system = systemExaminations.find(s => s.systemId === pattern.systemId);
      if (system) {
        const abnormal = system.findings.filter(f => f.finding === 'abnormal');
        for (const f of abnormal) {
          // Check if description mentions the pattern finding
          if (f.description.toLowerCase().includes(pattern.findingLabel.toLowerCase())) {
            supportingFromExamination.push(pattern.description);
          }
        }
      }
    }

    // Generate overall assessment
    const totalSupporting = supportingFromHistory.length + supportingFromExamination.length;
    const assessment = totalSupporting > 3
      ? 'Strong clinical correlation — history and examination findings align with this diagnosis.'
      : totalSupporting > 1
        ? 'Moderate clinical correlation — some findings support this diagnosis.'
        : 'Weak clinical correlation — limited findings for this diagnosis.';

    return {
      diseaseId: p.diseaseId,
      diseaseName: p.diseaseName,
      probability: p.probability,
      supportingFromHistory,
      supportingFromExamination,
      opposing,
      keyFindings: [...supportingFromHistory, ...supportingFromExamination],
      overallAssessment: assessment,
    };
  });
}
