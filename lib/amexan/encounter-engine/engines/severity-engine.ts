import type { Answer } from '../types/ces';
import type { SeverityScores } from './clinical-reasoning-types';

export function getVital(answers: Record<string, Answer>, key: string): number | null {
  const a = answers[key];
  if (!a) return null;
  const val = Number(a.value);
  return isNaN(val) ? null : val;
}

export function getConsciousness(answers: Record<string, Answer>): string {
  const a = answers['exam_consciousness']?.value || answers['exam_gcs']?.value;
  if (!a) return 'alert';
  return String(a).toLowerCase();
}

export function calculateNEWS(answers: Record<string, Answer>): SeverityScores['news'] {
  const rr = getVital(answers, 'exam_rr');
  const spo2 = getVital(answers, 'exam_spo2');
  const temp = getVital(answers, 'exam_temp');
  const sbp = getVital(answers, 'exam_bp_systolic');
  const hr = getVital(answers, 'exam_hr');
  const conscious = getConsciousness(answers);

  if (rr === null && spo2 === null && temp === null && sbp === null && hr === null) return null;

  let score = 0;

  // RR
  if (rr !== null) {
    if (rr <= 8) score += 3;
    else if (rr <= 11) score += 1;
    else if (rr <= 20) score += 0;
    else if (rr <= 24) score += 2;
    else score += 3;
  }

  // SpO2
  if (spo2 !== null) {
    if (spo2 <= 83) score += 3;
    else if (spo2 <= 85) score += 2;
    else if (spo2 <= 87) score += 1;
    else if (spo2 <= 92) score += 0;
    else if (spo2 <= 94) score += 1;
    else score += 2;
  }

  // Temperature
  if (temp !== null) {
    if (temp <= 35) score += 3;
    else if (temp <= 36) score += 1;
    else if (temp <= 38) score += 0;
    else if (temp <= 39) score += 1;
    else score += 2;
  }

  // SBP
  if (sbp !== null) {
    if (sbp <= 90) score += 3;
    else if (sbp <= 100) score += 2;
    else if (sbp <= 110) score += 1;
    else if (sbp <= 219) score += 0;
    else score += 3;
  }

  // HR
  if (hr !== null) {
    if (hr <= 40) score += 3;
    else if (hr <= 50) score += 1;
    else if (hr <= 90) score += 0;
    else if (hr <= 110) score += 1;
    else if (hr <= 130) score += 2;
    else score += 3;
  }

  // Consciousness
  if (conscious !== 'alert' && conscious !== '') {
    score += 3;
  }

  const risk = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
  const interpretations: Record<string, string> = {
    low: 'Low clinical risk. Routine monitoring.',
    medium: 'Medium risk. Consider escalation review within 1 hour.',
    high: 'HIGH RISK — Urgent clinical review required. Consider ICU transfer.',
  };

  return { value: score, risk, interpretation: interpretations[risk] };
}

export function calculateCURB65(answers: Record<string, Answer>): SeverityScores['curb65'] {
  const confusion = getConsciousness(answers) !== 'alert';
  const bun = getVital(answers, 'exam_bun') ?? getVital(answers, 'q_lab_bun') ?? getVital(answers, 'q_lab_urea');
  const rr = getVital(answers, 'exam_rr');
  const sbp = getVital(answers, 'exam_bp_systolic');
  const age = getVital(answers, 'q_patient_age');
  const ageAnswer = answers['q_patient_age']?.value || answers['q_age']?.value;

  if (rr === null && sbp === null && age === null && !confusion) return null;

  let score = 0;

  // Confusion
  if (confusion) score += 1;

  // BUN > 19 mg/dL (7 mmol/L)
  if (bun !== null && bun > 19) score += 1;
  if (bun !== null && bun > 7) score += 1;

  // RR >= 30
  if (rr !== null && rr >= 30) score += 1;

  // SBP < 90 or DBP <= 60
  if (sbp !== null && sbp < 90) score += 1;

  // Age >= 65
  const numericAge = age ?? (ageAnswer ? Number(ageAnswer) : null);
  if (numericAge !== null && numericAge >= 65) score += 1;

  const risk = score >= 3 ? 'high' : score >= 2 ? 'medium' : 'low';
  const interpretations: Record<string, string> = {
    low: 'Low severity. Consider outpatient management.',
    medium: 'Moderate severity. Consider short inpatient stay or close observation.',
    high: 'HIGH severity. Urgent inpatient admission. Consider ICU.',
  };

  return { value: score, risk, interpretation: interpretations[risk] };
}

export function calculateQSOFA(answers: Record<string, Answer>): SeverityScores['qsofa'] {
  const conscious = getConsciousness(answers);
  const sbp = getVital(answers, 'exam_bp_systolic');
  const rr = getVital(answers, 'exam_rr');

  if (conscious === '' && sbp === null && rr === null) return null;

  let score = 0;

  // Altered mental status
  if (conscious !== 'alert' && conscious !== '') score += 1;

  // SBP <= 100
  if (sbp !== null && sbp <= 100) score += 1;

  // RR >= 22
  if (rr !== null && rr >= 22) score += 1;

  const risk = score >= 2 ? 'high' : 'low';
  const interpretation = score >= 2
    ? 'qSOFA ≥ 2 — HIGH risk of in-hospital mortality. Monitor organ function closely.'
    : 'qSOFA < 2 — Lower risk of sepsis-related deterioration.';

  return { value: score, risk, interpretation };
}

export function calculateMEWS(answers: Record<string, Answer>): SeverityScores['mews'] {
  const rr = getVital(answers, 'exam_rr');
  const hr = getVital(answers, 'exam_hr');
  const sbp = getVital(answers, 'exam_bp_systolic');
  const temp = getVital(answers, 'exam_temp');
  const conscious = getConsciousness(answers);

  if (rr === null && hr === null && sbp === null && temp === null) return null;

  let score = 0;

  // RR
  if (rr !== null) {
    if (rr <= 8) score += 2;
    else if (rr <= 14) score += 0;
    else if (rr <= 20) score += 1;
    else if (rr <= 29) score += 2;
    else score += 3;
  }

  // HR
  if (hr !== null) {
    if (hr <= 40) score += 2;
    else if (hr <= 50) score += 1;
    else if (hr <= 100) score += 0;
    else if (hr <= 110) score += 1;
    else if (hr <= 129) score += 2;
    else score += 3;
  }

  // SBP
  if (sbp !== null) {
    if (sbp <= 70) score += 3;
    else if (sbp <= 80) score += 2;
    else if (sbp <= 100) score += 1;
    else if (sbp <= 199) score += 0;
    else score += 2;
  }

  // Temperature
  if (temp !== null) {
    if (temp <= 35) score += 2;
    else if (temp <= 38.4) score += 0;
    else score += 2;
  }

  // Consciousness
  if (conscious !== 'alert' && conscious !== '') score += 2;

  const risk = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
  const interpretations: Record<string, string> = {
    low: 'Low risk. Continue routine monitoring.',
    medium: 'Moderate risk. Increase monitoring frequency.',
    high: 'HIGH risk — Urgent medical review required.',
  };

  return { value: score, risk, interpretation: interpretations[risk] };
}

export function calculateShockIndex(answers: Record<string, Answer>): SeverityScores['shockIndex'] {
  const hr = getVital(answers, 'exam_hr');
  const sbp = getVital(answers, 'exam_bp_systolic');

  if (hr === null || sbp === null || sbp === 0) return null;

  const index = hr / sbp;

  const risk = index >= 1.3 ? 'critical' : index >= 0.9 ? 'elevated' : 'normal';
  const interpretations: Record<string, string> = {
    normal: 'Shock index normal. Haemodynamically stable.',
    elevated: 'Elevated shock index. Occult hypoperfusion possible. Assess for early shock.',
    critical: 'CRITICAL shock index. Overt shock. Immediate resuscitation required.',
  };

  return { value: Math.round(index * 100) / 100, risk, interpretation: interpretations[risk] };
}

export function calculateAllSeverityScores(answers: Record<string, Answer>): SeverityScores {
  return {
    news: calculateNEWS(answers),
    curb65: calculateCURB65(answers),
    qsofa: calculateQSOFA(answers),
    mews: calculateMEWS(answers),
    shockIndex: calculateShockIndex(answers),
  };
}
