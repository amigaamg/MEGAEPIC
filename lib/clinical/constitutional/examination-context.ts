// ─────────────────────────────────────────────────────────────────
// AMEXAN Modern Context Engine
// Encounter type, department, working syndrome, goals, specialty
// ─────────────────────────────────────────────────────────────────

export type EncounterType = 'outpatient' | 'inpatient' | 'emergency' | 'icu' | 'ward_review' | 'home_visit' | 'telemedicine' | 'screening' | 'preoperative' | 'postoperative' | 'follow_up';

export type Department = 'cardiology' | 'respiratory' | 'neurology' | 'neurosurgery' | 'general_surgery' | 'breast_surgery' | 'orthopaedics' | 'obstetrics' | 'gynaecology' | 'paediatrics' | 'neonatology' | 'emergency' | 'icu' | 'primary_care' | 'geriatrics' | 'psychiatry' | 'oncology' | 'endocrinology' | 'rheumatology' | 'nephrology' | 'gastroenterology' | 'urology' | 'ent' | 'ophthalmology' | 'dermatology' | 'general_medicine';

export type ExamGoal = 'diagnostic' | 'screening' | 'monitoring' | 'preoperative' | 'follow_up' | 'discharge_assessment' | 'emergency_triage' | 'research' | 'teaching';

export interface ExaminationContext {
  // Patient
  ageBand: string;
  sex: 'male' | 'female';
  pregnant: boolean;
  lactating: boolean;

  // Encounter
  encounterType: EncounterType;
  department: Department;
  specialty: string;
  examGoal: ExamGoal;
  encounterId: string;

  // Clinical
  chiefComplaints: string[];
  knownDiseases: string[];
  activeModules: string[];
  workingSyndrome?: string;
  emergencyStatus: boolean;

  // History
  previousBreastSurgery: boolean;
  breastCancerHistory: boolean;
  brcaMutation: boolean;
  implantHistory: boolean;
  breastfeedingIssues: boolean;
  postpartum: boolean;

  // Findings (current)
  findings: Record<string, unknown>;

  // Temporal
  isFollowUp: boolean;
  daysSincePreviousExam?: number;
}

export function createExaminationContext(
  ageBand: string,
  sex: 'male' | 'female',
  pregnant: boolean,
  encounterType: EncounterType,
  department: Department,
  chiefComplaints: string[],
  knownDiseases: string[],
  activeModules: string[],
  encounterId: string,
  lactating = false,
  examGoal: ExamGoal = 'diagnostic',
): ExaminationContext {
  const emergencyStatus = encounterType === 'emergency'
    || chiefComplaints.some(c => ['trauma', 'arrest', 'stroke_alert', 'sepsis', 'haemorrhage'].includes(c));
  return {
    ageBand, sex, pregnant, lactating,
    encounterType, department, specialty: department,
    examGoal, encounterId,
    chiefComplaints, knownDiseases, activeModules,
    emergencyStatus,
    workingSyndrome: undefined,
    previousBreastSurgery: false, breastCancerHistory: false,
    brcaMutation: false, implantHistory: false,
    breastfeedingIssues: false, postpartum: lactating,
    findings: {},
    isFollowUp: encounterType === 'follow_up',
  };
}

// ─────────────────────────────────────────────────────────────────
// EXAMINATION APPROPRIATENESS ENGINE
// ─────────────────────────────────────────────────────────────────

export interface ExamAppropriateness {
  system: string;
  label: string;
  appropriate: boolean;
  reason: string;
  priority: 'essential' | 'recommended' | 'optional' | 'contraindicated';
}

export function determineAppropriateExams(ctx: ExaminationContext): ExamAppropriateness[] {
  const results: ExamAppropriateness[] = [];
  const addResult = (system: string, label: string, appropriate: boolean, reason: string, priority: ExamAppropriateness['priority']) => {
    results.push({ system, label, appropriate, reason, priority });
  };

  const generalSystems = ['general', 'vitals'];
  for (const s of generalSystems) {
    addResult(s, s === 'general' ? 'General Examination' : 'Vital Signs', true, 'Always appropriate for all patients.', 'essential');
  }

  const neuroComplaints = ['headache', 'dizziness', 'seizure', 'stroke', 'weakness', 'numbness', 'syncope', 'head_injury', 'confusion', 'memory_loss'];
  const hasNeuroComplaint = ctx.chiefComplaints.some(c => neuroComplaints.includes(c));
  const neuroDiseases = ['stroke', 'tia', 'multiple_sclerosis', 'parkinsons', 'dementia', 'epilepsy', 'meningitis', 'brain_tumour', 'neuropathy'];
  const hasNeuroDisease = ctx.knownDiseases.some(d => neuroDiseases.includes(d));
  const isNeuroDept = ctx.department === 'neurology' || ctx.department === 'neurosurgery' || ctx.department === 'general_medicine';
  addResult('neurological', 'Neurological Examination',
    hasNeuroComplaint || hasNeuroDisease || isNeuroDept || ctx.emergencyStatus,
    hasNeuroComplaint ? `Indicated for ${ctx.chiefComplaints.filter(c => neuroComplaints.includes(c)).join(', ')}` : isNeuroDept ? 'Routine in neurology department' : ctx.emergencyStatus ? 'Essential in emergency assessment' : 'Not indicated without neurological symptoms or history.',
    hasNeuroComplaint && ctx.emergencyStatus ? 'essential' : isNeuroDept ? 'essential' : hasNeuroComplaint || hasNeuroDisease ? 'recommended' : 'optional',
  );

  const respComplaints = ['cough', 'dyspnoea', 'chest_pain', 'haemoptysis', 'wheeze', 'fever', 'sore_throat'];
  const hasRespComplaint = ctx.chiefComplaints.some(c => respComplaints.includes(c));
  const isRespDept = ctx.department === 'respiratory' || ctx.department === 'emergency';
  addResult('respiratory', 'Respiratory Examination',
    hasRespComplaint || isRespDept || ctx.emergencyStatus,
    hasRespComplaint ? `Indicated for respiratory symptoms` : isRespDept ? 'Routine' : ctx.emergencyStatus ? 'Part of emergency assessment' : 'Not indicated without respiratory symptoms.',
    ctx.emergencyStatus ? 'essential' : ['respiratory', 'emergency'].includes(ctx.department) ? 'essential' : hasRespComplaint ? 'recommended' : 'optional',
  );

  const cvsComplaints = ['chest_pain', 'palpitations', 'dyspnoea', 'syncope', 'oedema', 'cyanosis'];
  const hasCvsComplaint = ctx.chiefComplaints.some(c => cvsComplaints.includes(c));
  const isCvsDept = ctx.department === 'cardiology' || ctx.department === 'emergency';
  addResult('cardiovascular', 'Cardiovascular Examination',
    hasCvsComplaint || isCvsDept || ctx.emergencyStatus,
    hasCvsComplaint ? `Indicated for cardiovascular symptoms` : isCvsDept ? 'Routine' : ctx.emergencyStatus ? 'Essential in emergency assessment' : 'Not indicated without cardiovascular symptoms.',
    ctx.emergencyStatus ? 'essential' : ['cardiology', 'emergency'].includes(ctx.department) ? 'essential' : hasCvsComplaint ? 'recommended' : 'optional',
  );

  const abdComplaints = ['abdominal_pain', 'nausea', 'vomiting', 'diarrhoea', 'constipation', 'distension', 'dysphagia', 'weight_loss', 'jaundice', 'mass', 'bleeding_pr', 'haematemesis', 'melena'];
  const hasAbdComplaint = ctx.chiefComplaints.some(c => abdComplaints.includes(c));
  addResult('abdominal', 'Abdominal Examination',
    hasAbdComplaint || ctx.department === 'gastroenterology' || ctx.department === 'general_surgery' || ctx.department === 'emergency',
    hasAbdComplaint ? `Indicated for abdominal/GI symptoms` : 'Routine in GI/surgical departments',
    hasAbdComplaint || ctx.emergencyStatus ? 'recommended' : 'optional',
  );

  const breastComplaints = ['breast_lump', 'breast_pain', 'nipple_discharge', 'breast_swelling', 'breast_redness', 'male_breast_enlargement'];
  const hasBreastComplaint = ctx.chiefComplaints.some(c => breastComplaints.includes(c));
  const isBreastDept = ctx.department === 'breast_surgery' || ctx.department === 'general_surgery';
  const breastDiseases = ['breast_cancer', 'mastitis', 'fibroadenoma', 'gynecomastia'];
  const hasBreastDisease = ctx.knownDiseases.some(d => breastDiseases.includes(d));
  addResult('breast', 'Breast Examination',
    hasBreastComplaint || isBreastDept || hasBreastDisease || ctx.pregnant || ctx.lactating,
    hasBreastComplaint ? `Indicated for breast symptoms` : isBreastDept ? 'Routine in breast surgery' : ctx.pregnant || ctx.lactating ? 'Consider if symptoms present' : 'Not indicated without breast symptoms or risk factors.',
    hasBreastComplaint || hasBreastDisease ? 'essential' : isBreastDept ? 'essential' : ctx.pregnant || ctx.lactating ? 'recommended' : 'optional',
  );

  const hasObstetricNeeds = ctx.pregnant && ['obstetrics', 'maternity', 'emergency'].includes(ctx.department);
  addResult('obstetric', 'Obstetric Abdominal Examination (Leopold)',
    hasObstetricNeeds,
    hasObstetricNeeds ? 'Routine in obstetric care' : 'Not indicated in non-pregnant patients.',
    hasObstetricNeeds ? 'essential' : 'contraindicated',
  );

  const neonatalComplaints = ['neonatal_jaundice', 'poor_feeding', 'neonatal_sepsis', 'birth_trauma'];
  const isNeonatal = ctx.ageBand === 'neonate' || ctx.ageBand === 'infant';
  addResult('neonatal', 'Neonatal Examination',
    isNeonatal && ['paediatrics', 'neonatology', 'emergency'].includes(ctx.department),
    isNeonatal ? 'Appropriate for neonatal patients' : 'Not indicated in non-neonatal patients.',
    isNeonatal ? 'essential' : 'contraindicated',
  );

  return results;
}

// ─────────────────────────────────────────────────────────────────
// WORKING SYNDROME → EXPECTED FINDINGS
// ─────────────────────────────────────────────────────────────────

export interface SyndromeExpectedFindings {
  syndrome: string;
  expectedFindings: string[];
  expectedDiseases: string[];
  systems: string[];
}

export const SYNDROME_EXPECTATIONS: Record<string, SyndromeExpectedFindings> = {
  pleural_syndrome: {
    syndrome: 'Pleural Syndrome',
    expectedFindings: ['reduced_expansion', 'dull_percussion', 'reduced_breath_sounds', 'reduced_vocal_resonance'],
    expectedDiseases: ['pleural_effusion', 'pleural_thickening', 'mesothelioma'],
    systems: ['respiratory'],
  },
  consolidation_syndrome: {
    syndrome: 'Consolidation Syndrome',
    expectedFindings: ['reduced_expansion', 'dull_percussion', 'bronchial_breathing', 'increased_vocal_resonance', 'crackles'],
    expectedDiseases: ['pneumonia', 'tuberculosis', 'lung_cancer'],
    systems: ['respiratory'],
  },
  pneumothorax_syndrome: {
    syndrome: 'Pneumothorax Syndrome',
    expectedFindings: ['tracheal_deviation', 'hyperresonant_percussion', 'absent_breath_sounds', 'reduced_expansion'],
    expectedDiseases: ['pneumothorax', 'tension_pneumothorax'],
    systems: ['respiratory'],
  },
  heart_failure_syndrome: {
    syndrome: 'Heart Failure Syndrome',
    expectedFindings: ['elevated_jvp', 'basal_crackles', 'peripheral_oedema', 'displaced_apex', 's3_gallop'],
    expectedDiseases: ['heart_failure', 'cardiomyopathy'],
    systems: ['cardiovascular', 'respiratory'],
  },
  aortic_stenosis_syndrome: {
    syndrome: 'Aortic Stenosis Syndrome',
    expectedFindings: ['slow_rising_pulse', 'ejection_systolic_murmur', 'thrill', 'displaced_apex'],
    expectedDiseases: ['aortic_stenosis'],
    systems: ['cardiovascular'],
  },
  breast_mass_syndrome: {
    syndrome: 'Breast Mass Syndrome',
    expectedFindings: ['palpable_mass', 'axillary_lymphadenopathy', 'skin_changes', 'nipple_retraction'],
    expectedDiseases: ['breast_cancer', 'fibroadenoma', 'fibrocystic_change', 'breast_abscess'],
    systems: ['breast'],
  },
  mastitis_syndrome: {
    syndrome: 'Mastitis Syndrome',
    expectedFindings: ['erythema', 'warmth', 'tenderness', 'axillary_tenderness'],
    expectedDiseases: ['mastitis', 'breast_abscess'],
    systems: ['breast'],
  },
  stroke_syndrome: {
    syndrome: 'Stroke Syndrome',
    expectedFindings: ['facial_weakness', 'arm_weakness', 'leg_weakness', 'speech_disturbance', 'sensory_loss'],
    expectedDiseases: ['stroke', 'tia'],
    systems: ['neurological'],
  },
  meningitis_syndrome: {
    syndrome: 'Meningitis Syndrome',
    expectedFindings: ['neck_stiffness', 'kernig_positive', 'brudzinski_positive', 'photophobia', 'altered_consciousness'],
    expectedDiseases: ['meningitis', 'meningoencephalitis'],
    systems: ['neurological'],
  },
};

export function getSyndromeExpectations(syndrome: string): SyndromeExpectedFindings | undefined {
  return SYNDROME_EXPECTATIONS[syndrome];
}

export function findMatchingSyndromes(findings: Record<string, unknown>): string[] {
  const matched: string[] = [];
  for (const [syndrome, exp] of Object.entries(SYNDROME_EXPECTATIONS)) {
    const found = exp.expectedFindings.filter(f => {
      const val = findings[f];
      return val != null && val !== '' && val !== false;
    });
    if (found.length >= 2) matched.push(syndrome);
  }
  return matched;
}
