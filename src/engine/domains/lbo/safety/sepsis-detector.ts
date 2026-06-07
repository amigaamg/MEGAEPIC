export interface SepsisInput {
  temperature: number | undefined;
  heartRate: number | undefined;
  respiratoryRate: number | undefined;
  systolicBP: number | undefined;
  wbc: number | undefined;
  lactate: number | undefined;
  gcs: number | undefined;
  creatinine: number | undefined;
  bilirubin: number | undefined;
  platelets: number | undefined;
  infectionSource: string | undefined;
  onInotropes: boolean;
  mechanicalVentilation: boolean;
}

export interface SepsisResult {
  sirsPositive: boolean;
  sirsCriteria: { name: string; met: boolean; value: string }[];
  qsofaPositive: boolean;
  qsofaCriteria: { name: string; met: boolean; value: string }[];
  sofaScore: number;
  sofaCriteria: { name: string; met: boolean; value: string; score: number }[];
  sepsisPresent: boolean;
  septicShockPresent: boolean;
  severity: 'none' | 'sepsis' | 'severe_sepsis' | 'septic_shock';
  action: string;
  antibioticRecommendation: string;
}

export function assessSepsis(input: SepsisInput): SepsisResult {
  // SIRS criteria
  const sirsCriteria = [
    { name: 'Temperature >38°C or <36°C', met: input.temperature !== undefined && (input.temperature > 38 || input.temperature < 36), value: input.temperature !== undefined ? `${input.temperature}°C` : 'Unknown' },
    { name: 'Heart rate >90 bpm', met: input.heartRate !== undefined && input.heartRate > 90, value: input.heartRate !== undefined ? `${input.heartRate} bpm` : 'Unknown' },
    { name: 'Respiratory rate >20 or PaCO2 <32', met: input.respiratoryRate !== undefined && input.respiratoryRate > 20, value: input.respiratoryRate !== undefined ? `${input.respiratoryRate}/min` : 'Unknown' },
    { name: 'WBC >12 or <4 or >10% bands', met: input.wbc !== undefined && (input.wbc > 12 || input.wbc < 4), value: input.wbc !== undefined ? `${input.wbc}` : 'Unknown' },
  ];
  const sirsPositive = sirsCriteria.filter(c => c.met).length >= 2;

  // qSOFA
  const qsofaCriteria = [
    { name: 'Altered mental status (GCS <15)', met: input.gcs !== undefined && input.gcs < 15, value: input.gcs !== undefined ? `GCS ${input.gcs}` : 'Unknown' },
    { name: 'Systolic BP <=100 mmHg', met: input.systolicBP !== undefined && input.systolicBP <= 100, value: input.systolicBP !== undefined ? `${input.systolicBP} mmHg` : 'Unknown' },
    { name: 'Respiratory rate >=22', met: input.respiratoryRate !== undefined && input.respiratoryRate >= 22, value: input.respiratoryRate !== undefined ? `${input.respiratoryRate}/min` : 'Unknown' },
  ];
  const qsofaPositive = qsofaCriteria.filter(c => c.met).length >= 2;

  // SOFA score (simplified for LBO context)
  const sofaCriteria = [
    { name: 'PaO2/FiO2 (respiratory)', met: input.mechanicalVentilation, value: input.mechanicalVentilation ? 'On ventilator' : 'Spontaneous breathing', score: input.mechanicalVentilation ? 2 : 0 },
    { name: 'Platelets <150', met: input.platelets !== undefined && input.platelets < 150, value: input.platelets !== undefined ? `${input.platelets}` : 'Unknown', score: input.platelets !== undefined && input.platelets < 150 ? 2 : 0 },
    { name: 'Bilirubin >20 (liver)', met: input.bilirubin !== undefined && input.bilirubin > 20, value: input.bilirubin !== undefined ? `${input.bilirubin} μmol/L` : 'Unknown', score: input.bilirubin !== undefined && input.bilirubin > 20 ? 1 : 0 },
    { name: 'Hypotension (CVS)', met: input.systolicBP !== undefined && input.systolicBP < 90, value: input.systolicBP !== undefined ? `${input.systolicBP} mmHg` : 'Unknown', score: input.onInotropes ? 4 : input.systolicBP !== undefined && input.systolicBP < 90 ? 2 : 0 },
    { name: 'GCS <15 (CNS)', met: input.gcs !== undefined && input.gcs < 15, value: input.gcs !== undefined ? `GCS ${input.gcs}` : 'Unknown', score: input.gcs !== undefined && input.gcs < 15 ? 1 : input.gcs !== undefined && input.gcs < 13 ? 2 : 0 },
    { name: 'Creatinine >110 or oliguria (renal)', met: input.creatinine !== undefined && input.creatinine > 110, value: input.creatinine !== undefined ? `${input.creatinine} μmol/L` : 'Unknown', score: input.creatinine !== undefined && input.creatinine > 110 ? 1 : input.creatinine !== undefined && input.creatinine > 170 ? 2 : 0 },
  ];
  const sofaScore = sofaCriteria.reduce((sum, c) => sum + c.score, 0);

  // Determine sepsis state
  const infectionPresent = input.infectionSource !== undefined;
  const lactateElevated = input.lactate !== undefined && input.lactate > 2;
  const hypotensionRefractory = input.systolicBP !== undefined && input.systolicBP < 65;

  let sepsisPresent = false;
  let septicShockPresent = false;
  let severity: SepsisResult['severity'] = 'none';
  let action = '';
  let antibioticRecommendation = '';

  if (infectionPresent && qsofaPositive) {
    sepsisPresent = true;
    severity = 'sepsis';
    action = 'Sepsis suspected (qSOFA >=2). Start sepsis protocol within 1 hour.';
  }

  if (sepsisPresent && (input.lactate !== undefined && input.lactate > 2) && sofaScore >= 2) {
    severity = 'severe_sepsis';
    action = 'Severe sepsis with organ dysfunction. ICU admission recommended.';
  }

  if (sepsisPresent && input.onInotropes && (input.lactate ?? 0) > 2) {
    septicShockPresent = true;
    severity = 'septic_shock';
    action = 'SEPTIC SHOCK. Emergency ICU admission. Vasopressors, fluids, broad-spectrum antibiotics within 1 hour. Source control: emergency laparotomy.';
  }

  antibioticRecommendation = severity === 'none'
    ? 'Prophylactic antibiotics as per LBO protocol: Ceftriaxone 2g IV + Metronidazole 500mg IV'
    : 'Broad-spectrum IV antibiotics: Piperacillin-Tazobactam 4.5g IV q6h + Gentamicin 5mg/kg IV + Metronidazole 500mg IV q8h. De-escalate based on cultures.';

  return {
    sirsPositive,
    sirsCriteria,
    qsofaPositive,
    qsofaCriteria,
    sofaScore,
    sofaCriteria,
    sepsisPresent,
    septicShockPresent,
    severity,
    action,
    antibioticRecommendation,
  };
}
