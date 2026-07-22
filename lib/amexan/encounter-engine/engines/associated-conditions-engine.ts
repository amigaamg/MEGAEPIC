import type { Answer, Biodata, ChiefComplaint } from '../types/ces';
import type { AssociatedCondition } from './clinical-reasoning-types';

export function getAnswerValue(answers: Record<string, Answer>, key: string): string {
  const a = answers[key];
  if (!a) return '';
  if (Array.isArray(a.value)) return (a.value as string[]).join(', ');
  return String(a.value);
}

export function getNumeric(answers: Record<string, Answer>, key: string): number | null {
  const a = answers[key];
  if (!a) return null;
  const val = Number(a.value);
  return isNaN(val) ? null : val;
}

export function generateAssociatedConditions(
  answers: Record<string, Answer>,
  biodata: Biodata | null,
  chiefComplaints: ChiefComplaint[],
  diagnosisName: string | null,
): AssociatedCondition[] {
  const conditions: AssociatedCondition[] = [];

  const spo2 = getNumeric(answers, 'exam_spo2');
  const rr = getNumeric(answers, 'exam_rr');
  const hr = getNumeric(answers, 'exam_hr');
  const sbp = getNumeric(answers, 'exam_bp_systolic');
  const temp = getNumeric(answers, 'exam_temp');
  const conscious = getAnswerValue(answers, 'exam_consciousness').toLowerCase();
  const height = getNumeric(answers, 'exam_height');
  const weight = getNumeric(answers, 'exam_weight');
  const tempValue = getAnswerValue(answers, 'exam_temp');
  const oralIntake = getAnswerValue(answers, 'q_hpi_appetite').toLowerCase();
  const mucousMembranes = getAnswerValue(answers, 'exam_mucous_membranes').toLowerCase();
  const crt = getNumeric(answers, 'exam_crt');
  const urineOutput = getAnswerValue(answers, 'exam_urine_output').toLowerCase();
  const hb = getNumeric(answers, 'q_lab_hb');
  const pmh = getAnswerValue(answers, 'q_pmh_conditions').toLowerCase();
  const medications = getAnswerValue(answers, 'q_medications').toLowerCase();
  const allergies = getAnswerValue(answers, 'q_all_known');

  // ── 1. Hypoxaemic Respiratory Failure ──
  if (spo2 !== null) {
    const evidence: string[] = [`SpO₂ ${spo2}%`];
    if (rr !== null && rr > 24) evidence.push(`Tachypnoea (RR ${rr}/min)`);
    if (conscious === 'confused' || conscious === 'unresponsive') evidence.push(`Altered consciousness (${conscious})`);

    if (spo2 < 90) {
      conditions.push({
        id: 'cond_resp_failure', condition: 'Acute Hypoxaemic Respiratory Failure',
        confidence: spo2 < 85 ? 96 : spo2 < 88 ? 88 : 72,
        mechanism: 'Alveolar ventilation-perfusion mismatch or shunt',
        evidence,
        pendingEvidence: ['Arterial blood gas for PaO₂/FiO₂ ratio'],
        managementPreview: ['Oxygen therapy — target SpO₂ ≥94%', 'Monitor respiratory rate and effort', 'Consider ABG for PaCO₂ and pH', 'Assess for NIV/mechanical ventilation if refractory'],
        severity: spo2 < 85 ? 'severe' : spo2 < 88 ? 'moderate' : 'mild',
      });
    }
  }

  // ── 2. Sepsis / Systemic Inflammatory Response ──
  if (temp !== null) {
    const evidence: string[] = [`Temperature ${temp}°C`];
    let infectionSource = '';
    if (chiefComplaints.some(c => c.complaint.toLowerCase().includes('cough') || c.complaint.toLowerCase().includes('sputum'))) {
      infectionSource = 'Respiratory source suspected';
      evidence.push('Respiratory focus');
    }
    if (rr !== null && rr > 22) evidence.push(`Tachypnoea (RR ${rr}/min)`);
    if (hr !== null && hr > 90) evidence.push(`Tachycardia (HR ${hr}/min)`);
    if (temp >= 38 || temp <= 36) {
      conditions.push({
        id: 'cond_sepsis', condition: 'Sepsis (SIRS + Suspected Infection)',
        confidence: (temp > 38.5 ? 88 : 72) + (rr !== null && rr > 22 ? 8 : 0) + (hr !== null && hr > 90 ? 4 : 0),
        mechanism: infectionSource || 'Systemic inflammatory response to infection',
        evidence,
        pendingEvidence: ['Blood cultures (x2) before antibiotics', 'Lactate', 'CBC with differential', 'CRP / Procalcitonin', 'Chest X-ray to identify source'],
        managementPreview: ['Sepsis six: oxygen, blood cultures, antibiotics, fluids, lactate, monitoring', 'IV broad-spectrum antibiotics (within 1 hour)', 'IV fluid resuscitation (30 mL/kg crystalloid)', 'Monitor qSOFA/NEWS hourly'],
        severity: (hr !== null && hr > 120) || (sbp !== null && sbp < 90) ? 'severe' : temp > 39 ? 'moderate' : 'mild',
      });
    }
  }

  // ── 3. Dehydration / Hypovolaemia ──
  {
    const evidence: string[] = [];
    if (oralIntake.includes('poor') || oralIntake.includes('reduced') || oralIntake.includes('none')) evidence.push('Poor oral intake');
    if (mucousMembranes.includes('dry')) evidence.push('Dry mucous membranes');
    if (crt !== null && crt > 2) evidence.push(`Delayed capillary refill (>${crt}s)`);
    if (urineOutput.includes('low') || urineOutput.includes('reduced') || urineOutput.includes('dark')) evidence.push('Reduced urine output');
    if (hr !== null && hr > 100 && sbp !== null && sbp < 100) evidence.push(`Tachycardia with low-normal BP (HR ${hr}, BP ${sbp})`);
    if (tempValue && parseFloat(tempValue) > 38) evidence.push('Fever contributing to fluid loss');

    if (evidence.length >= 2) {
      const dehydrationScore = evidence.length;
      conditions.push({
        id: 'cond_dehydration', condition: 'Dehydration / Hypovolaemia',
        confidence: Math.min(dehydrationScore * 16 + 45, 95),
        mechanism: 'Reduced intake ± increased losses (fever, tachypnoea)',
        evidence,
        pendingEvidence: ['Urea/Creatinine ratio', 'Serum electrolytes', 'Urine specific gravity', 'Fluid balance chart'],
        managementPreview: ['IV fluids: 30 mL/kg crystalloid bolus if hypovolaemic', 'Maintenance fluids (4:2:1 rule or Holliday-Segar)', 'Monitor urine output (target ≥0.5 mL/kg/h)', 'Daily weight'],
        severity: (sbp !== null && sbp < 90) || (hr !== null && hr > 120) ? 'severe' : evidence.length >= 3 ? 'moderate' : 'mild',
      });
    }
  }

  // ── 4. Acute Kidney Injury (risk/established) ──
  {
    const riskFactors: string[] = [];
    if (sbp !== null && sbp < 90) riskFactors.push('Hypotension (SBP <90)');
    if (diabetesCheck(pmh)) riskFactors.push('Diabetes');
    if (heartFailureCheck(pmh)) riskFactors.push('Heart failure');
    if (ckdCheck(pmh)) riskFactors.push('CKD');
    if (ageCheck(biodata) >= 65) riskFactors.push('Age ≥65');
    if (dehydrationPresent(conditions)) riskFactors.push('Dehydration');
    if (sepsisPresent(conditions)) riskFactors.push('Sepsis');
    if (medications.includes('nsaid') || medications.includes('ace') || medications.includes('contrast')) riskFactors.push('Nephrotoxic exposure');

    if (riskFactors.length >= 2 || (riskFactors.length >= 1 && (sbp !== null && sbp < 90))) {
      conditions.push({
        id: 'cond_aki', condition: 'Acute Kidney Injury (at risk)',
        confidence: Math.min(riskFactors.length * 10 + 50, 92),
        mechanism: 'Prerenal hypoperfusion ± nephrotoxic exposure',
        evidence: riskFactors,
        pendingEvidence: ['Serum creatinine (baseline)', 'BUN', 'Urine output monitoring', 'Urinalysis', 'Renal ultrasound if no cause found'],
        managementPreview: ['Optimise intravascular volume', 'Hold nephrotoxic medications', 'Monitor urine output (target ≥0.5 mL/kg/h)', 'Monitor creatinine daily', 'Avoid contrast if possible'],
        severity: riskFactors.length >= 4 && (sbp !== null && sbp < 90) ? 'severe' : riskFactors.length >= 3 ? 'moderate' : 'mild',
      });
    }
  }

  // ── 5. Anaemia ──
  if (hb !== null) {
    if (hb < 13 || (biodata?.sex === 'female' && hb < 12) || hb < 11) {
      const isLow = hb < 9;
      conditions.push({
        id: 'cond_anaemia', condition: isLow ? 'Moderate-Severe Anaemia' : 'Mild Anaemia',
        confidence: hb < 7 ? 98 : hb < 9 ? 92 : hb < 11 ? 80 : 60,
        mechanism: 'Possible nutritional deficiency, chronic disease, or acute blood loss',
        evidence: [`Haemoglobin ${hb} g/dL`],
        pendingEvidence: ['Peripheral blood film', 'Iron studies (ferritin, TIBC, transferrin)', 'B12, folate', 'Reticulocyte count', 'CRP (for anaemia of chronic disease)'],
        managementPreview: isLow
          ? ['Consider blood transfusion if Hb <7 or symptomatic', 'Investigate aetiology before transfusion if stable']
          : ['Oral iron supplementation', 'Dietary counselling', 'Monitor Hb in 4-6 weeks'],
        severity: hb < 8 ? 'severe' : hb < 10 ? 'moderate' : 'mild',
      });
    }
  }

  // ── 6. Malnutrition / Poor Nutritional Status ──
  if (weight !== null && height !== null && height > 0) {
    const bmi = weight / ((height / 100) * (height / 100));
    if (bmi < 18.5) {
      conditions.push({
        id: 'cond_malnutrition', condition: bmi < 16 ? 'Severe Malnutrition' : 'Underweight / Malnutrition Risk',
        confidence: bmi < 16 ? 96 : 84,
        mechanism: 'Inadequate caloric intake ± increased metabolic demand (infection)',
        evidence: [`BMI ${bmi.toFixed(1)} (${bmi < 16 ? 'severely underweight' : 'underweight'})`],
        pendingEvidence: ['Albumin', 'Prealbumin', 'Vitamin D, B12 levels', 'Dietician assessment'],
        managementPreview: ['Nutritional assessment by dietician', 'High-protein, high-calorie diet', 'Consider nutritional supplements', 'Treat underlying infection to reduce catabolism'],
        severity: bmi < 16 ? 'severe' : 'moderate',
      });
    }
  }

  // ── 7. Electrolyte Imbalance ──
  {
    const na = getNumeric(answers, 'q_lab_na');
    const k = getNumeric(answers, 'q_lab_k');

    if (k !== null && (k < 3.5 || k > 5.5)) {
      const isLow = k < 3.5;
      conditions.push({
        id: 'cond_k_imbalance', condition: isLow ? 'Hypokalaemia' : 'Hyperkalaemia',
        confidence: (k < 3 || k > 6) ? 96 : 88,
        mechanism: isLow
          ? 'GI losses, diuretics, poor intake, or transcellular shift'
          : 'Renal impairment, medications (ACEi, spironolactone), or cell lysis',
        evidence: [`Serum K⁺ ${k} mmol/L`],
        pendingEvidence: ['Repeat K⁺ to confirm', 'ECG for cardiac effects', 'Magnesium level (if hypokalaemic)'],
        managementPreview: isLow
          ? ['Oral/IV potassium replacement', 'Check magnesium (correct if low)', 'Hold potassium-wasting diuretics']
          : ['Hold K⁺-sparing drugs', 'Calcium gluconate IV if ECG changes', 'Insulin + dextrose if severe', 'Consider calcium resonium'],
        severity: (k < 2.5 || k > 6.5) ? 'severe' : (k < 3 || k > 6) ? 'moderate' : 'mild',
      });
    }
  }

  // ── 8. Tachyarrhythmia ──
  if (hr !== null && hr > 110) {
    const evidence: string[] = [`Heart rate ${hr}/min`];
    if (sbp !== null && sbp < 90) evidence.push('Hypotension');
    conditions.push({
      id: 'cond_tachyarrhythmia', condition: 'Sinus Tachycardia / Possible Arrhythmia',
      confidence: hr > 140 ? 72 : 55,
      mechanism: 'Physiological response to fever, hypovolaemia, pain, anxiety, or primary cardiac',
      evidence,
      pendingEvidence: ['ECG to confirm rhythm', 'Cardiac monitoring if symptomatic', 'Electrolytes'],
      managementPreview: ['Treat underlying cause (fever, pain, hypovolaemia)', 'Continuous cardiac monitoring', 'ECG to exclude atrial fibrillation/flutter', 'Avoid rate control until cause addressed'],
      severity: (hr > 140 && sbp !== null && sbp < 90) ? 'severe' : hr > 130 && sbp !== null && sbp < 100 ? 'moderate' : 'mild',
    });
  }

  return conditions;
}

function diabetesCheck(pmh: string): boolean {
  return pmh.includes('diabetes') || pmh.includes('dm');
}

function heartFailureCheck(pmh: string): boolean {
  return pmh.includes('heart failure') || pmh.includes('chf') || pmh.includes('cardiomyopathy');
}

function ckdCheck(pmh: string): boolean {
  return pmh.includes('ckd') || pmh.includes('chronic kidney') || pmh.includes('renal failure');
}

function ageCheck(biodata: Biodata | null): number {
  return biodata?.age || 0;
}

function dehydrationPresent(conditions: AssociatedCondition[]): boolean {
  return conditions.some(c => c.id === 'cond_dehydration');
}

function sepsisPresent(conditions: AssociatedCondition[]): boolean {
  return conditions.some(c => c.id === 'cond_sepsis');
}
