export type MissingDataCategory =
  | 'history' | 'exam' | 'vitals' | 'labs' | 'imaging' | 'risk_factor' | 'social';

export interface MissingDataItem {
  field: string;
  label: string;
  category: MissingDataCategory;
  urgency: 'routine' | 'important' | 'critical';
  reason: string;
  differentialImpact: string;
  suggestedQuestion?: string;
}

export interface MissingDataResult {
  missingItems: MissingDataItem[];
  criticalCount: number;
  totalMissing: number;
  completenessPercent: number;
  blockingItems: string[];
}

export interface PatientDataPresence {
  history: {
    presentingComplaint: boolean;
    onset: boolean;
    duration: boolean;
    progression: boolean;
    painCharacter: boolean;
    painSeverity: boolean;
    vomiting: boolean;
    vomitingType: boolean;
    flatusStatus: boolean;
    bowelMovementStatus: boolean;
    previousEpisodes: boolean;
    weightLoss: boolean;
    rectalBleeding: boolean;
    chronicConstipation: boolean;
    pastMedicalHistory: boolean;
    pastSurgicalHistory: boolean;
    drugHistory: boolean;
    allergies: boolean;
    familyHistory: boolean;
    socialHistory: boolean;
    smoking: boolean;
    alcohol: boolean;
  };
  exam: {
    generalAppearance: boolean;
    hydrationStatus: boolean;
    vitalsComplete: boolean;
    abdominalInspection: boolean;
    abdominalPalpation: boolean;
    abdominalPercussion: boolean;
    abdominalAuscultation: boolean;
    digitalRectalExam: boolean;
    herniaOrifices: boolean;
    systemicCvs: boolean;
    systemicRs: boolean;
    systemicCns: boolean;
  };
  labs: {
    fbc: boolean;
    ue: boolean;
    crp: boolean;
    lactate: boolean;
    abg: boolean;
    crossmatch: boolean;
    coagulation: boolean;
    bloodCultures: boolean;
  };
  imaging: {
    axr: boolean;
    ctAbdomen: boolean;
  };
  riskFactors: {
    ageAbove60: boolean;
    chronicConstipation: boolean;
    previousVolvulus: boolean;
    colorectalCancerHistory: boolean;
    familyHistoryCrc: boolean;
    previousAbdominalSurgery: boolean;
    parkinsons: boolean;
    anticholinergics: boolean;
  };
}

export function detectMissingData(data: PatientDataPresence): MissingDataResult {
  const missing: MissingDataItem[] = [];

  // ── History ─────────────────────────────────────────────────────────────
  if (!data.history.presentingComplaint) {
    missing.push({
      field: 'presenting_complaint', label: 'Presenting Complaint', category: 'history',
      urgency: 'critical', reason: 'Required to initiate diagnostic pathway',
      differentialImpact: 'Unable to start differential diagnosis',
      suggestedQuestion: 'What is the main problem that brought you to hospital?',
    });
  }

  if (!data.history.onset) {
    missing.push({
      field: 'symptom_onset', label: 'Symptom Onset (sudden vs gradual)', category: 'history',
      urgency: 'critical', reason: 'Sudden onset strongly favours volvulus vs gradual onset favours cancer',
      differentialImpact: 'Cannot distinguish volvulus from obstructing cancer',
      suggestedQuestion: 'Did the distension start suddenly or gradually?',
    });
  }

  if (!data.history.duration) {
    missing.push({
      field: 'symptom_duration', label: 'Symptom Duration (days)', category: 'history',
      urgency: 'critical', reason: 'Duration correlates with ischemia risk',
      differentialImpact: 'Cannot assess urgency or ischemia timeline',
    });
  }

  if (!data.history.flatusStatus) {
    missing.push({
      field: 'flatus_status', label: 'Flatus Status', category: 'history',
      urgency: 'critical', reason: 'Failure to pass flatus confirms complete obstruction',
      differentialImpact: 'Cannot confirm complete vs partial obstruction',
      suggestedQuestion: 'When did you last pass gas?',
    });
  }

  if (!data.history.bowelMovementStatus) {
    missing.push({
      field: 'bowel_movement_status', label: 'Last Bowel Movement', category: 'history',
      urgency: 'critical', reason: 'Constipation duration is key diagnostic feature',
      differentialImpact: 'Cannot confirm absolute constipation',
      suggestedQuestion: 'When did you last open your bowels?',
    });
  }

  if (!data.history.painCharacter) {
    missing.push({
      field: 'pain_character', label: 'Pain Character (colicky vs constant)', category: 'history',
      urgency: 'important', reason: 'Colicky suggests mechanical obstruction; constant suggests ischemia',
      differentialImpact: 'Cannot assess ischemia risk from history',
      suggestedQuestion: 'Describe the pain — does it come and go in waves or is it constant?',
    });
  }

  if (!data.history.vomiting) {
    missing.push({
      field: 'vomiting', label: 'Vomiting', category: 'history',
      urgency: 'important', reason: 'Bilious/faeculent vomiting suggests late/complete obstruction',
      differentialImpact: 'Cannot assess obstruction completeness',
    });
  }

  if (!data.history.previousEpisodes) {
    missing.push({
      field: 'previous_episodes', label: 'Previous Similar Episodes', category: 'history',
      urgency: 'important', reason: 'Prior episodes strongly favour recurrent volvulus',
      differentialImpact: 'Cannot differentiate volvulus from other causes',
      suggestedQuestion: 'Have you ever had this happen before?',
    });
  }

  if (!data.history.rectalBleeding) {
    missing.push({
      field: 'rectal_bleeding', label: 'Rectal Bleeding', category: 'history',
      urgency: 'important', reason: 'Presence favours colorectal cancer',
      differentialImpact: 'Cannot differentiate cancer from volvulus',
    });
  }

  if (!data.history.weightLoss) {
    missing.push({
      field: 'weight_loss', label: 'Unintentional Weight Loss', category: 'history',
      urgency: 'important', reason: 'Significant weight loss suggests underlying malignancy',
      differentialImpact: 'Cannot assess cancer probability',
    });
  }

  if (!data.history.pastSurgicalHistory) {
    missing.push({
      field: 'past_surgical_history', label: 'Past Surgical History', category: 'history',
      urgency: 'important', reason: 'Previous surgery increases adhesive obstruction risk',
      differentialImpact: 'Cannot assess adhesive SBO contribution',
    });
  }

  // ── Exam ─────────────────────────────────────────────────────────────────
  if (!data.exam.vitalsComplete) {
    missing.push({
      field: 'complete_vitals', label: 'Complete Vital Signs', category: 'vitals',
      urgency: 'critical', reason: 'Tachycardia + hypotension suggests ischaemic bowel or septic shock',
      differentialImpact: 'Cannot assess haemodynamic stability',
    });
  }

  if (!data.exam.abdominalPalpation) {
    missing.push({
      field: 'abdominal_palpation', label: 'Abdominal Palpation', category: 'exam',
      urgency: 'critical', reason: 'Tenderness, guarding, rigidity guide urgency and ischemia suspicion',
      differentialImpact: 'Cannot assess peritonism or ischemia risk',
    });
  }

  if (!data.exam.abdominalAuscultation) {
    missing.push({
      field: 'abdominal_auscultation', label: 'Bowel Sounds', category: 'exam',
      urgency: 'important', reason: 'High-pitch suggests mechanical obstruction; absent suggests ileus/peritonitis',
      differentialImpact: 'Cannot differentiate mechanical vs pseudo-obstruction',
    });
  }

  if (!data.exam.digitalRectalExam) {
    missing.push({
      field: 'digital_rectal_exam', label: 'Digital Rectal Examination', category: 'exam',
      urgency: 'critical', reason: 'Empty rectum suggests sigmoid volvulus; mass/melaena suggests cancer',
      differentialImpact: 'Cannot differentiate key causes',
    });
  }

  if (!data.exam.herniaOrifices) {
    missing.push({
      field: 'hernia_orifices', label: 'Hernia Orifice Examination', category: 'exam',
      urgency: 'important', reason: 'Obstructed hernia is a surgical cause of obstruction',
      differentialImpact: 'Cannot rule out hernia as cause',
    });
  }

  // ── Labs ─────────────────────────────────────────────────────────────────
  if (!data.labs.lactate) {
    missing.push({
      field: 'serum_lactate', label: 'Serum Lactate', category: 'labs',
      urgency: 'critical', reason: 'Lactate >2 suggests bowel ischemia; >4 mandates emergency surgery',
      differentialImpact: 'Cannot stratify ischemia risk — core safety parameter',
    });
  }

  if (!data.labs.fbc) {
    missing.push({
      field: 'full_blood_count', label: 'Full Blood Count', category: 'labs',
      urgency: 'important', reason: 'Leukocytosis suggests inflammation/ischemia; anaemia suggests cancer',
      differentialImpact: 'Cannot assess infection or anaemia',
    });
  }

  if (!data.labs.ue) {
    missing.push({
      field: 'urea_electrolytes', label: 'Urea & Electrolytes', category: 'labs',
      urgency: 'important', reason: 'Prerenal AKI from dehydration common; electrolytes needed for resuscitation',
      differentialImpact: 'Cannot assess AKI or guide fluid therapy',
    });
  }

  if (!data.labs.crp) {
    missing.push({
      field: 'crp', label: 'C-Reactive Protein', category: 'labs',
      urgency: 'important', reason: 'Elevated CRP indicates systemic inflammation',
      differentialImpact: 'Cannot assess inflammatory response',
    });
  }

  if (!data.labs.crossmatch) {
    missing.push({
      field: 'crossmatch', label: 'Crossmatch (Group & Save)', category: 'labs',
      urgency: 'important', reason: 'Essential pre-operative preparation for potential emergency surgery',
      differentialImpact: 'Cannot proceed safely to emergency surgery',
    });
  }

  // ── Imaging ──────────────────────────────────────────────────────────────
  if (!data.imaging.axr) {
    missing.push({
      field: 'abdominal_xray', label: 'Abdominal X-ray (erect + supine)', category: 'imaging',
      urgency: 'critical', reason: 'First-line imaging — coffee bean sign is pathognomonic for volvulus',
      differentialImpact: 'Cannot diagnose or rule out perforation (free air)',
    });
  }

  if (!data.imaging.ctAbdomen) {
    missing.push({
      field: 'ct_abdomen', label: 'CT Abdomen + Pelvis with IV contrast', category: 'imaging',
      urgency: 'critical', reason: 'Gold standard — confirms cause, assesses ischemia, guides surgical planning',
      differentialImpact: 'Cannot confirm subtype or assess ischemia',
    });
  }

  // ── Risk Factors ─────────────────────────────────────────────────────────
  if (!data.riskFactors.ageAbove60) {
    missing.push({
      field: 'age_risk', label: 'Age >60 Assessment', category: 'risk_factor',
      urgency: 'routine', reason: 'Age is the strongest risk factor for both volvulus and colorectal cancer',
      differentialImpact: 'Cannot apply age-adjusted probability',
    });
  }

  if (!data.riskFactors.familyHistoryCrc) {
    missing.push({
      field: 'family_history_crc', label: 'Family History of Colorectal Cancer', category: 'risk_factor',
      urgency: 'routine', reason: 'Family history significantly raises cancer probability',
      differentialImpact: 'Underestimates cancer risk',
    });
  }

  const criticalCount = missing.filter(m => m.urgency === 'critical').length;
  const totalFields = Object.values(data.history).length +
    Object.values(data.exam).length +
    Object.values(data.labs).length +
    Object.values(data.imaging).length +
    Object.values(data.riskFactors).length;

  const presentFields = countPresent(data);
  const completenessPercent = Math.round((presentFields / totalFields) * 100);

  const blockingItems = missing
    .filter(m => m.urgency === 'critical')
    .map(m => m.label);

  return {
    missingItems: missing,
    criticalCount,
    totalMissing: missing.length,
    completenessPercent,
    blockingItems,
  };
}

function countPresent(data: PatientDataPresence): number {
  let count = 0;
  for (const group of [data.history, data.exam, data.labs, data.imaging, data.riskFactors] as const) {
    for (const key of Object.keys(group) as (keyof typeof group)[]) {
      if (group[key]) count++;
    }
  }
  return count;
}

export function isDataSufficientForDiagnosis(missing: MissingDataResult): boolean {
  return missing.criticalCount === 0;
}

export function isDataSufficientForSurgery(missing: MissingDataResult): boolean {
  const surgeryBlocking = missing.missingItems.filter(m =>
    m.urgency === 'critical' &&
    ['labs', 'imaging'].includes(m.category)
  );
  return surgeryBlocking.length === 0;
}
