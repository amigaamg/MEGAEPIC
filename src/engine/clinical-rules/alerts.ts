import type { VitalsData } from '../ddx-engine';

export type AlertType = 'deterioration' | 'abnormal_lab' | 'medication_error' | 'fall_risk' | 'sepsis_screen';

export interface ClinicalAlert {
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  source: string;
  recommendedAction: string;
}

function now(): string {
  return new Date().toISOString();
}

export function checkVitalAlerts(vitals: VitalsData): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation < 85) {
    alerts.push({
      type: 'deterioration',
      severity: 'critical',
      message: `Critical hypoxia: SpO₂ ${vitals.oxygenSaturation}%`,
      timestamp: now(),
      source: 'vitals',
      recommendedAction: 'Administer high-flow oxygen, assess airway, prepare for ventilation support',
    });
  } else if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation < 92) {
    alerts.push({
      type: 'deterioration',
      severity: 'warning',
      message: `Hypoxia: SpO₂ ${vitals.oxygenSaturation}%`,
      timestamp: now(),
      source: 'vitals',
      recommendedAction: 'Start oxygen therapy, monitor saturation continuously',
    });
  }

  if (vitals.temperature !== undefined && vitals.temperature > 39.5) {
    alerts.push({
      type: 'deterioration',
      severity: 'warning',
      message: `High fever: ${vitals.temperature}°C`,
      timestamp: now(),
      source: 'vitals',
      recommendedAction: 'Administer antipyretics, perform septic workup if indicated',
    });
  } else if (vitals.temperature !== undefined && vitals.temperature < 35) {
    alerts.push({
      type: 'deterioration',
      severity: 'critical',
      message: `Hypothermia: ${vitals.temperature}°C`,
      timestamp: now(),
      source: 'vitals',
      recommendedAction: 'Warm patient, check blood glucose, sepsis evaluation',
    });
  }

  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate > 180) {
      alerts.push({
        type: 'deterioration',
        severity: 'critical',
        message: `Severe tachycardia: HR ${vitals.heartRate} bpm`,
        timestamp: now(),
        source: 'vitals',
        recommendedAction: 'Assess for shock, arrhythmia, fever, or pain; obtain ECG',
      });
    } else if (vitals.heartRate < 60) {
      alerts.push({
        type: 'deterioration',
        severity: 'critical',
        message: `Bradycardia: HR ${vitals.heartRate} bpm`,
        timestamp: now(),
        source: 'vitals',
        recommendedAction: 'Assess for heart block, increased ICP, hypoxia; obtain ECG',
      });
    }
  }

  if (vitals.bloodPressureSystolic !== undefined && vitals.bloodPressureSystolic < 80) {
    alerts.push({
      type: 'deterioration',
      severity: 'critical',
      message: `Hypotension: BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`,
      timestamp: now(),
      source: 'vitals',
      recommendedAction: 'IV fluid bolus, consider vasopressors, identify source of shock',
    });
  }

  if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate > 60) {
    alerts.push({
      type: 'deterioration',
      severity: 'critical',
      message: `Severe tachypnoea: RR ${vitals.respiratoryRate}/min`,
      timestamp: now(),
      source: 'vitals',
      recommendedAction: 'Assess for respiratory distress, check gas exchange, prepare respiratory support',
    });
  }

  return alerts;
}

export function checkLabAlerts(labs: Record<string, number>): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  if (labs['creatinine'] !== undefined && labs['creatinine'] > 1.5) {
    alerts.push({
      type: 'abnormal_lab',
      severity: 'warning',
      message: `Elevated creatinine: ${labs['creatinine']} mg/dL`,
      timestamp: now(),
      source: 'laboratory',
      recommendedAction: 'Assess renal function, adjust nephrotoxic medications, consider hydration',
    });
  }

  if (labs['potassium'] !== undefined && (labs['potassium'] < 3.0 || labs['potassium'] > 5.5)) {
    alerts.push({
      type: 'abnormal_lab',
      severity: 'critical',
      message: `Critical potassium: ${labs['potassium']} mmol/L`,
      timestamp: now(),
      source: 'laboratory',
      recommendedAction: 'Obtain ECG, correct potassium urgently, identify underlying cause',
    });
  }

  if (labs['wbc'] !== undefined && labs['wbc'] > 15000) {
    alerts.push({
      type: 'abnormal_lab',
      severity: 'warning',
      message: `Leukocytosis: WBC ${labs['wbc']} /μL`,
      timestamp: now(),
      source: 'laboratory',
      recommendedAction: 'Evaluate for infection, obtain cultures, consider empiric antibiotics',
    });
  }

  if (labs['hb'] !== undefined && labs['hb'] < 7) {
    alerts.push({
      type: 'abnormal_lab',
      severity: 'critical',
      message: `Severe anaemia: Hb ${labs['hb']} g/dL`,
      timestamp: now(),
      source: 'laboratory',
      recommendedAction: 'Cross-match blood, prepare for transfusion, identify bleeding source',
    });
  }

  if (labs['glucose'] !== undefined && labs['glucose'] < 3.0) {
    alerts.push({
      type: 'abnormal_lab',
      severity: 'critical',
      message: `Hypoglycaemia: Glucose ${labs['glucose']} mmol/L`,
      timestamp: now(),
      source: 'laboratory',
      recommendedAction: 'Administer IV dextrose, monitor closely, identify cause',
    });
  }

  if (labs['crp'] !== undefined && labs['crp'] > 100) {
    alerts.push({
      type: 'abnormal_lab',
      severity: 'warning',
      message: `Markedly elevated CRP: ${labs['crp']} mg/L`,
      timestamp: now(),
      source: 'laboratory',
      recommendedAction: 'Indicates significant inflammation/infection; review antibiotics',
    });
  }

  if (labs['lactate'] !== undefined && labs['lactate'] > 2.0) {
    alerts.push({
      type: 'abnormal_lab',
      severity: 'warning',
      message: `Elevated lactate: ${labs['lactate']} mmol/L`,
      timestamp: now(),
      source: 'laboratory',
      recommendedAction: 'Assess for tissue hypoperfusion, sepsis, or ischaemia',
    });
  }

  return alerts;
}

export function checkSepsisScreen(vitals: VitalsData, symptoms: string[]): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const symptomSet = new Set(symptoms.map(s => s.toLowerCase()));

  const sirsCriteria: { name: string; met: boolean }[] = [];
  let criteriaCount = 0;

  if (vitals.temperature !== undefined && (vitals.temperature > 38.5 || vitals.temperature < 36)) {
    sirsCriteria.push({ name: `Temperature ${vitals.temperature}°C`, met: true });
    criteriaCount++;
  } else {
    sirsCriteria.push({ name: 'Temperature abnormal', met: false });
  }

  if (vitals.heartRate !== undefined && vitals.heartRate > 140) {
    sirsCriteria.push({ name: `Tachycardia: HR ${vitals.heartRate}`, met: true });
    criteriaCount++;
  } else {
    sirsCriteria.push({ name: 'Tachycardia', met: false });
  }

  if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate > 40) {
    sirsCriteria.push({ name: `Tachypnoea: RR ${vitals.respiratoryRate}`, met: true });
    criteriaCount++;
  } else {
    sirsCriteria.push({ name: 'Tachypnoea', met: false });
  }

  if (symptomSet.has('lethargy') || symptomSet.has('altered_consciousness')) {
    sirsCriteria.push({ name: 'Altered mental state', met: true });
    criteriaCount++;
  } else {
    sirsCriteria.push({ name: 'Altered mental state', met: false });
  }

  if (criteriaCount >= 2) {
    const infectionClues = ['fever', 'cough', 'abdominal_pain', 'rash', 'dysuria'].some(s => symptomSet.has(s));
    if (infectionClues) {
      alerts.push({
        type: 'sepsis_screen',
        severity: 'critical',
        message: `Sepsis suspected: ${criteriaCount}/4 SIRS criteria met with infection source`,
        timestamp: now(),
        source: 'sepsis_screen',
        recommendedAction: 'START SEPSIS PROTOCOL: blood cultures, lactate, IV antibiotics, IV fluids, monitor end-organ function',
      });
    } else {
      alerts.push({
        type: 'sepsis_screen',
        severity: 'warning',
        message: `SIRS criteria met (${criteriaCount}/4) but no clear infection source documented`,
        timestamp: now(),
        source: 'sepsis_screen',
        recommendedAction: 'Broad sepsis workup including cultures, consider empiric antibiotics',
      });
    }
  }

  return alerts;
}

export function checkDeterioration(previousVitals: VitalsData, currentVitals: VitalsData): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  if (
    previousVitals.oxygenSaturation !== undefined &&
    currentVitals.oxygenSaturation !== undefined &&
    currentVitals.oxygenSaturation < previousVitals.oxygenSaturation - 3
  ) {
    alerts.push({
      type: 'deterioration',
      severity: 'critical',
      message: `Oxygen saturation dropped from ${previousVitals.oxygenSaturation}% to ${currentVitals.oxygenSaturation}%`,
      timestamp: now(),
      source: 'vitals_trend',
      recommendedAction: 'Escalate oxygen therapy, reassess respiratory status, consider arterial blood gas',
    });
  }

  if (
    previousVitals.heartRate !== undefined &&
    currentVitals.heartRate !== undefined &&
    currentVitals.heartRate > previousVitals.heartRate + 30
  ) {
    alerts.push({
      type: 'deterioration',
      severity: 'warning',
      message: `Heart rate increased from ${previousVitals.heartRate} to ${currentVitals.heartRate} bpm`,
      timestamp: now(),
      source: 'vitals_trend',
      recommendedAction: 'Assess for pain, fever, hypovolaemia, or deterioration',
    });
  }

  if (
    previousVitals.bloodPressureSystolic !== undefined &&
    currentVitals.bloodPressureSystolic !== undefined &&
    currentVitals.bloodPressureSystolic < previousVitals.bloodPressureSystolic - 20
  ) {
    alerts.push({
      type: 'deterioration',
      severity: 'critical',
      message: `Systolic BP dropped from ${previousVitals.bloodPressureSystolic} to ${currentVitals.bloodPressureSystolic} mmHg`,
      timestamp: now(),
      source: 'vitals_trend',
      recommendedAction: 'IV fluid bolus, assess for shock, notify senior clinician',
    });
  }

  if (
    previousVitals.respiratoryRate !== undefined &&
    currentVitals.respiratoryRate !== undefined &&
    currentVitals.respiratoryRate > previousVitals.respiratoryRate + 15
  ) {
    alerts.push({
      type: 'deterioration',
      severity: 'warning',
      message: `Respiratory rate increased from ${previousVitals.respiratoryRate} to ${currentVitals.respiratoryRate}/min`,
      timestamp: now(),
      source: 'vitals_trend',
      recommendedAction: 'Reassess respiratory status, consider worsening respiratory distress',
    });
  }

  return alerts;
}
