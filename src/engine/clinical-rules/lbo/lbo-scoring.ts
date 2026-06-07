export interface LboScoringInput {
  distensionSeverity: 'none' | 'mild' | 'moderate' | 'severe';
  constipationDays: number;
  painConstant: boolean;
  vomiting: boolean;
  fever: boolean;
  tachycardia: boolean;
  hypotension: boolean;
  peritonism: boolean;
  lactate: number | undefined;
  wbc: number | undefined;
  previousEpisodes: boolean;
  age: number;
}

export interface LboScoreResult {
  volvulusScore: number;
  ischemiaScore: number;
  perforationScore: number;
  urgencyLevel: 'elective' | 'urgent' | 'emergency' | 'immediate';
  riskStratification: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
}

export function calculateLboScore(input: LboScoringInput): LboScoreResult {
  let volvulusScore = 0;
  let ischemiaScore = 0;
  let perforationScore = 0;

  // Volvulus scoring
  if (input.distensionSeverity === 'severe') volvulusScore += 30;
  else if (input.distensionSeverity === 'moderate') volvulusScore += 20;
  else if (input.distensionSeverity === 'mild') volvulusScore += 10;

  if (input.constipationDays >= 3) volvulusScore += 20;
  else if (input.constipationDays >= 1) volvulusScore += 10;

  if (input.previousEpisodes) volvulusScore += 25;
  if (input.age > 60) volvulusScore += 10;
  if (input.age > 80) volvulusScore += 5;

  if (input.vomiting) volvulusScore += 10;

  // Ischemia scoring
  if (input.painConstant) ischemiaScore += 25;
  if (input.lactate !== undefined && input.lactate > 4) ischemiaScore += 35;
  else if (input.lactate !== undefined && input.lactate > 2) ischemiaScore += 20;
  if (input.tachycardia) ischemiaScore += 15;
  if (input.peritonism) ischemiaScore += 25;
  if (input.fever) ischemiaScore += 10;
  if (input.wbc !== undefined && input.wbc > 15) ischemiaScore += 15;
  else if (input.wbc !== undefined && input.wbc > 12) ischemiaScore += 10;

  // Perforation scoring
  if (input.peritonism) perforationScore += 35;
  if (input.hypotension) perforationScore += 25;
  if (input.lactate !== undefined && input.lactate > 6) perforationScore += 30;
  else if (input.lactate !== undefined && input.lactate > 4) perforationScore += 20;
  if (input.fever) perforationScore += 10;

  // Determine urgency
  let urgencyLevel: LboScoreResult['urgencyLevel'] = 'elective';
  if (perforationScore >= 50 || ischemiaScore >= 60) urgencyLevel = 'immediate';
  else if (ischemiaScore >= 40) urgencyLevel = 'emergency';
  else if (volvulusScore >= 40 || ischemiaScore >= 20) urgencyLevel = 'urgent';

  // Risk stratification
  let riskStratification: LboScoreResult['riskStratification'] = 'low';
  if (perforationScore >= 50) riskStratification = 'critical';
  else if (ischemiaScore >= 50) riskStratification = 'critical';
  else if (ischemiaScore >= 30 || perforationScore >= 20) riskStratification = 'high';
  else if (ischemiaScore >= 10 || volvulusScore >= 40) riskStratification = 'moderate';

  const recommendations: string[] = [];

  if (urgencyLevel === 'immediate') {
    recommendations.push('Emergency laparotomy — within 1 hour');
    recommendations.push('Resuscitate with IV fluids, blood cultures, broad-spectrum IV antibiotics');
    recommendations.push('ICU bed required post-operatively');
    recommendations.push('Type and crossmatch — 4 units PRBC');
  } else if (urgencyLevel === 'emergency') {
    recommendations.push('Urgent laparotomy — within 2-6 hours');
    recommendations.push('CT abdomen with IV contrast if not already done');
    recommendations.push('Resuscitation and broad-spectrum IV antibiotics');
    recommendations.push('Prepare for potential stoma formation');
  } else if (urgencyLevel === 'urgent') {
    recommendations.push('CT abdomen with IV contrast to confirm cause');
    recommendations.push('Consider endoscopic detorsion if sigmoid volvulus confirmed');
    recommendations.push('Same-admission elective resection after decompression');
    recommendations.push('NBM, IV fluids, NG tube, catheter');
  } else {
    recommendations.push('Elective surgical review');
    recommendations.push('May be managed conservatively initially');
    recommendations.push('Outpatient CT colonography or colonoscopy if indicated');
  }

  if (input.lactate !== undefined && input.lactate > 2) {
    recommendations.push(`Repeat lactate in 2 hours (current: ${input.lactate})`);
  }

  return {
    volvulusScore,
    ischemiaScore,
    perforationScore,
    urgencyLevel,
    riskStratification,
    recommendations,
  };
}
