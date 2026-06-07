export interface VitalsInput {
  heartRate?: number;
  systolicBP?: number;
  temperature?: number;
  respiratoryRate?: number;
  spO2?: number;
}

export interface LabInput {
  lactate?: number;
  wbc?: number;
  crp?: number;
  creatinine?: number;
  bicarbonate?: number;
}

export interface ExamInput {
  peritonism: boolean;
  guarding: boolean;
  rigidity: boolean;
  absentBowelSounds: boolean;
  massPalpable: boolean;
}

export interface RedFlagResult {
  triggered: boolean;
  flags: RedFlagItem[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendedActions: string[];
}

export interface RedFlagItem {
  name: string;
  severity: 'warning' | 'critical';
  finding: string;
  action: string;
}

export function checkLboRedFlags(
  vitals: VitalsInput,
  labs: LabInput,
  exam: ExamInput,
): RedFlagResult {
  const flags: RedFlagItem[] = [];
  let maxUrgency: string = 'low';

  // Ischemia red flags
  if (labs.lactate !== undefined && labs.lactate > 4) {
    flags.push({
      name: 'Critical Lactate',
      severity: 'critical',
      finding: `Lactate ${labs.lactate} mmol/L — strongly suggests bowel ischemia or gangrene`,
      action: 'Emergency laparotomy within 1 hour. Resuscitate. Inform consultant and anaesthetist.',
    });
    maxUrgency = 'critical';
  } else if (labs.lactate !== undefined && labs.lactate > 2) {
    flags.push({
      name: 'Elevated Lactate',
      severity: 'warning',
      finding: `Lactate ${labs.lactate} mmol/L — suggests early ischemia`,
      action: 'Urgent CT abdomen. Repeat lactate in 2 hours. Prepare for potential surgery.',
    });
    if (maxUrgency !== 'critical') maxUrgency = 'high';
  }

  // Peritonism red flag
  if (exam.peritonism || exam.guarding || exam.rigidity) {
    flags.push({
      name: 'Peritonitis',
      severity: 'critical',
      finding: 'Signs of peritonitis present — suggests perforation or gangrene',
      action: 'Emergency laparotomy within 1 hour. IV antibiotics. Resuscitation.',
    });
    if (maxUrgency !== 'critical') maxUrgency = 'critical';
  }

  // Shock red flags
  if (vitals.systolicBP !== undefined && vitals.systolicBP < 90 && vitals.heartRate !== undefined && vitals.heartRate > 100) {
    flags.push({
      name: 'Septic/Hypovolaemic Shock',
      severity: 'critical',
      finding: `Hypotension (${vitals.systolicBP} mmHg) with tachycardia (${vitals.heartRate} bpm)`,
      action: 'Resuscitate with IV fluids. Vasopressors if refractory. Emergency laparotomy. ICU admission.',
    });
    if (maxUrgency !== 'critical') maxUrgency = 'critical';
  }

  // Tachycardia red flag (pain out of proportion)
  if (vitals.heartRate !== undefined && vitals.heartRate > 120) {
    flags.push({
      name: 'Severe Tachycardia',
      severity: 'warning',
      finding: `HR ${vitals.heartRate} bpm — pain out of proportion, may indicate ischemia`,
      action: 'Analgesia. Assess for ischaemic bowel. Urgent CT. Fluid resuscitation.',
    });
    if (maxUrgency !== 'critical' && maxUrgency !== 'high') maxUrgency = 'high';
  }

  // Fever red flag
  if (vitals.temperature !== undefined && vitals.temperature > 38.5) {
    flags.push({
      name: 'High Fever',
      severity: 'warning',
      finding: `Temperature ${vitals.temperature}°C — suggests sepsis or perforation`,
      action: 'Blood cultures. IV broad-spectrum antibiotics. Urgent imaging.',
    });
    if (maxUrgency === 'low') maxUrgency = 'high';
  }

  // Absent bowel sounds — late sign
  if (exam.absentBowelSounds) {
    flags.push({
      name: 'Absent Bowel Sounds',
      severity: 'warning',
      finding: 'Absent bowel sounds — indicates ileus or peritonitis',
      action: 'Assess for peritonitis. Urgent surgical review. CT abdomen.',
    });
    if (maxUrgency !== 'critical' && maxUrgency !== 'high') maxUrgency = 'high';
  }

  // Leukocytosis
  if (labs.wbc !== undefined && labs.wbc > 20) {
    flags.push({
      name: 'Marked Leukocytosis',
      severity: 'warning',
      finding: `WBC ${labs.wbc} — severe inflammation, concern for ischaemia`,
      action: 'Urgent CT. Broad-spectrum antibiotics. Surgical review.',
    });
    if (maxUrgency !== 'critical' && maxUrgency !== 'high') maxUrgency = 'high';
  }

  // AKI
  if (labs.creatinine !== undefined && labs.creatinine > 150) {
    flags.push({
      name: 'Acute Kidney Injury',
      severity: 'warning',
      finding: `Creatinine ${labs.creatinine} μmol/L — prerenal AKI from dehydration/sepsis`,
      action: 'IV fluid resuscitation. Monitor urine output. Stop nephrotoxics.',
    });
    if (maxUrgency === 'low') maxUrgency = 'medium';
  }

  // Acidosis
  if (labs.bicarbonate !== undefined && labs.bicarbonate < 18) {
    flags.push({
      name: 'Metabolic Acidosis',
      severity: 'warning',
      finding: `Bicarbonate ${labs.bicarbonate} mmol/L — suggests ischaemia or sepsis`,
      action: 'ABG. Lactate. Assess need for ICU. Urgent surgical review.',
    });
    if (maxUrgency !== 'critical' && maxUrgency !== 'high') maxUrgency = 'high';
  }

  // Critically elevated CRP
  if (labs.crp !== undefined && labs.crp > 200) {
    flags.push({
      name: 'Markedly Elevated CRP',
      severity: 'warning',
      finding: `CRP ${labs.crp} mg/L — severe systemic inflammation`,
      action: 'Broad-spectrum antibiotics. Source control. Assess for abscess/perforation.',
    });
    if (maxUrgency === 'low') maxUrgency = 'medium';
  }

  return {
    triggered: flags.length > 0,
    flags,
    urgency: maxUrgency as RedFlagResult['urgency'],
    message: flags.length > 0
      ? `${flags.length} red flag(s) detected. ${flags.map(f => f.name).join(', ')}. ${maxUrgency === 'critical' ? 'IMMEDIATE ACTION REQUIRED.' : 'Urgent surgical review indicated.'}`
      : 'No red flags detected',
    recommendedActions: [...new Set(flags.map(f => f.action))],
  };
}
