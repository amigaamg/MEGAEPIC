export interface PatientBaseline {
  age: number;
  diabetes: boolean;
  hba1c?: number;
  ckd: boolean;
  egfr?: number;
  creatinine?: number;
  anaemia: boolean;
  hb?: number;
  hiv: boolean;
  onArt: boolean;
  hypertension: boolean;
  heartFailure: boolean;
  liverDisease: boolean;
  obesity: boolean;
  bmi?: number;
  malnutrition: boolean;
  albumin?: number;
  steroids: boolean;
  anticoagulants: boolean;
  smoking: boolean;
  copd: boolean;
}

export interface SystemicAlert {
  system: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  finding: string;
  action: string;
  modifiesManagement: boolean;
}

export interface SystemicOverlayResult {
  alerts: SystemicAlert[];
  criticalCount: number;
  managementModifications: string[];
  perioperativeRisk: 'low' | 'moderate' | 'high' | 'very_high';
}

export function assessSystemicRisks(baseline: PatientBaseline, creatinine?: number): SystemicOverlayResult {
  const alerts: SystemicAlert[] = [];
  const managementModifications: string[] = [];

  // ── Diabetes ─────────────────────────────────────────────────────────────
  if (baseline.diabetes) {
    alerts.push({
      system: 'Endocrine', condition: 'Diabetes Mellitus',
      severity: baseline.hba1c !== undefined && baseline.hba1c > 8 ? 'warning' : 'info',
      finding: baseline.hba1c !== undefined ? `HbA1c ${baseline.hba1c}%` : 'Diabetes (HbA1c unknown)',
      action: 'Check peri-operative glucose q4h. Sliding scale insulin. Aim glucose 6-10 mmol/L. Wound infection risk increased 2-3x.',
      modifiesManagement: true,
    });
    managementModifications.push('Sliding scale insulin peri-operatively; strict glucose monitoring q4h');
    managementModifications.push('Increased surveillance for wound infection (diabetes doubles risk)');
  }

  // ── CKD ──────────────────────────────────────────────────────────────────
  if (baseline.ckd) {
    const egfr = baseline.egfr;
    alerts.push({
      system: 'Renal', condition: 'Chronic Kidney Disease',
      severity: egfr !== undefined && egfr < 30 ? 'critical' : egfr !== undefined && egfr < 60 ? 'warning' : 'info',
      finding: egfr !== undefined ? `eGFR ${egfr} mL/min` : 'CKD stage unknown',
      action: egfr !== undefined && egfr < 30
        ? 'Contrast contraindicated. Nephrology consult. Dose-adjust all renally cleared medications. Avoid NSAIDs.'
        : 'Monitor creatinine peri-operatively. Avoid nephrotoxics. Hydrate adequately.',
      modifiesManagement: true,
    });
    if (egfr !== undefined && egfr < 30) {
      managementModifications.push('CT without contrast (nephrotoxicity risk) — use AXR + clinical assessment');
      managementModifications.push('Dose-adjust antibiotics per renal protocol (Ceftriaxone, Gentamicin)');
    }
    if (egfr !== undefined && egfr < 60) {
      managementModifications.push('Avoid NSAIDs for analgesia — use paracetamol + opioid PCA');
    }
  }

  // ── Anaemia ──────────────────────────────────────────────────────────────
  if (baseline.anaemia) {
    const hb = baseline.hb;
    alerts.push({
      system: 'Haematology', condition: 'Anaemia',
      severity: hb !== undefined && hb < 8 ? 'critical' : hb !== undefined && hb < 11 ? 'warning' : 'info',
      finding: hb !== undefined ? `Hb ${hb} g/dL` : 'Anaemia (Hb unknown)',
      action: hb !== undefined && hb < 8
        ? 'Transfuse pre-operatively to Hb >9. Type and crossmatch 2 units PRBC. Consider iron infusion.'
        : 'Monitor Hb peri-operatively. Crossmatch pre-operatively. Consider iron studies.',
      modifiesManagement: true,
    });
    if (hb !== undefined && hb < 10) {
      managementModifications.push('Pre-operative transfusion threshold Hb <8; crossmatch 2-4 units PRBC');
    }
  }

  // ── HIV ──────────────────────────────────────────────────────────────────
  if (baseline.hiv) {
    alerts.push({
      system: 'Infectious Disease', condition: 'HIV',
      severity: baseline.onArt ? 'info' : 'warning',
      finding: baseline.onArt ? 'On ART' : 'Not on ART',
      action: baseline.onArt
        ? 'Continue ART. Check CD4 within 2 weeks. Prophylactic antibiotics if CD4 <200.'
        : 'Start ART if not contra-indicated by acute illness. ID consult.',
      modifiesManagement: true,
    });
    if (!baseline.onArt) managementModifications.push('ID consultation for ART initiation; check CD4 count pre-operatively');
  }

  // ── Heart Failure ────────────────────────────────────────────────────────
  if (baseline.heartFailure) {
    alerts.push({
      system: 'Cardiovascular', condition: 'Heart Failure',
      severity: 'warning',
      finding: 'History of heart failure',
      action: 'Optimise fluid balance (TPW/catheter monitoring). Avoid fluid overload. Pre-op echo if not done in 6 months. Continue beta-blocker.',
      modifiesManagement: true,
    });
    managementModifications.push('Restrict maintenance fluids to 1 mL/kg/h; daily weight; strict I/O chart');
    managementModifications.push('Monitor for pulmonary oedema during resuscitation (CXR if concerned)');
  }

  // ── Liver Disease ────────────────────────────────────────────────────────
  if (baseline.liverDisease) {
    alerts.push({
      system: 'Hepatic', condition: 'Liver Disease',
      severity: 'info',
      finding: 'History of liver disease — check INR, albumin, bilirubin',
      action: 'Check coagulation profile. Vitamin K if INR elevated. Avoid hepatotoxic drugs (paracetamol max 2g/day).',
      modifiesManagement: true,
    });
    managementModifications.push('Check Child-Pugh score; vitamin K 10mg IV if INR >1.5');
  }

  // ── Malnutrition ─────────────────────────────────────────────────────────
  if (baseline.malnutrition || (baseline.albumin !== undefined && baseline.albumin < 30)) {
    alerts.push({
      system: 'Nutrition', condition: 'Malnutrition',
      severity: 'warning',
      finding: baseline.albumin !== undefined ? `Albumin ${baseline.albumin} g/L` : 'Malnutrition suspected',
      action: 'Nutritional assessment. Consider NG/Tube feeding or TPN if prolonged ileus expected. Wound healing and immune function impaired.',
      modifiesManagement: true,
    });
    managementModifications.push('Nutrition consult; low threshold for TPN if NBM >5 days');
    managementModifications.push('Wound care: increased surveillance for dehiscence; consider delayed primary closure');
  }

  // ── Obesity ──────────────────────────────────────────────────────────────
  if (baseline.obesity) {
    alerts.push({
      system: 'Metabolic', condition: 'Obesity',
      severity: 'info',
      finding: baseline.bmi !== undefined ? `BMI ${baseline.bmi}` : 'Obesity noted',
      action: 'Increased VTE risk — ensure VTE prophylaxis. Increased wound complication risk. Consider higher antibiotic dosing. Anaesthetic review.',
      modifiesManagement: true,
    });
    managementModifications.push('VTE prophylaxis: Enoxaparin 40mg SC BD (higher dosing for BMI >35)');
    managementModifications.push('Consider higher antibiotic dosing (Ceftriaxone 2g IV)');
  }

  // ── Steroids ─────────────────────────────────────────────────────────────
  if (baseline.steroids) {
    alerts.push({
      system: 'Endocrine', condition: 'Chronic Steroid Use',
      severity: 'warning',
      finding: 'On corticosteroids — risk of adrenal insufficiency',
      action: 'Peri-operative stress-dose hydrocortisone. Continue maintenance steroids.',
      modifiesManagement: true,
    });
    managementModifications.push('Stress-dose hydrocortisone 100mg IV q8h peri-operatively, taper post-op');
  }

  // ── COPD / Smoking ───────────────────────────────────────────────────────
  if (baseline.copd || baseline.smoking) {
    alerts.push({
      system: 'Respiratory', condition: baseline.copd ? 'COPD' : 'Smoking',
      severity: 'info',
      finding: baseline.copd ? 'COPD — respiratory complication risk' : `${baseline.smoking ? 'Smoker' : ''}`,
      action: 'Pre-op chest physiotherapy. Incentive spirometry post-op. Avoid high-dose opiates. Early mobilisation.',
      modifiesManagement: true,
    });
    managementModifications.push('Chest physiotherapy pre- and post-operatively; incentive spirometry q1h');
    managementModifications.push('Low threshold for CXR if respiratory deterioration; avoid NG oversedation');
  }

  // ── Summary / Peri-operative Risk ────────────────────────────────────────
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const totalRiskScore = alerts.filter(a => a.severity === 'critical').length * 3 +
    alerts.filter(a => a.severity === 'warning').length * 2 +
    alerts.filter(a => a.severity === 'info').length;

  let perioperativeRisk: SystemicOverlayResult['perioperativeRisk'] = 'low';
  if (totalRiskScore >= 10) perioperativeRisk = 'very_high';
  else if (totalRiskScore >= 6) perioperativeRisk = 'high';
  else if (totalRiskScore >= 3) perioperativeRisk = 'moderate';

  return {
    alerts,
    criticalCount,
    managementModifications: [...new Set(managementModifications)],
    perioperativeRisk,
  };
}
