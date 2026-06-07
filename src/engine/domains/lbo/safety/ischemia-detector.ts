export interface IschemiaInput {
  lactate: number | undefined;
  lactateTrend: 'rising' | 'stable' | 'falling' | 'unknown';
  painPattern: 'colicky' | 'constant_since_onset' | 'colicky_then_constant' | 'none';
  heartRate: number | undefined;
  systolicBP: number | undefined;
  temperature: number | undefined;
  wbc: number | undefined;
  ctPneumatosis: boolean;
  ctPortalVenousGas: boolean;
  ctBowelWallEnhancement: 'normal' | 'reduced' | 'absent' | 'unknown';
  ctFreeFluid: boolean;
  peritonism: boolean;
  guarding: boolean;
  rigidity: boolean;
  timeSinceOnsetHours: number;
  diabetes: boolean;
  age: number;
}

export interface IschemiaResult {
  probability: number;
  likelihood: 'low' | 'moderate' | 'high' | 'very_high';
  definitiveSigns: string[];
  suggestiveSigns: string[];
  riskFactors: string[];
  triggers: { trigger: string; severity: number }[];
  action: string;
  timeframe: string;
}

export function assessIschemia(input: IschemiaInput): IschemiaResult {
  let score = 0;
  const definitiveSigns: string[] = [];
  const suggestiveSigns: string[] = [];
  const riskFactors: string[] = [];
  const triggers: { trigger: string; severity: number }[] = [];

  // Definitive CT signs
  if (input.ctPneumatosis) {
    definitiveSigns.push('Pneumatosis intestinalis on CT (transmural ischaemia/infarction)');
    score += 50;
    triggers.push({ trigger: 'CT: pneumatosis intestinalis', severity: 50 });
  }

  if (input.ctPortalVenousGas) {
    definitiveSigns.push('Portal venous gas on CT (mesenteric infarction)');
    score += 55;
    triggers.push({ trigger: 'CT: portal venous gas', severity: 55 });
  }

  if (input.ctBowelWallEnhancement === 'absent') {
    definitiveSigns.push('Absent bowel wall enhancement on CT (transmural ischaemia)');
    score += 45;
    triggers.push({ trigger: 'CT: absent bowel wall enhancement', severity: 45 });
  }

  // Suggestive CT signs
  if (input.ctBowelWallEnhancement === 'reduced') {
    suggestiveSigns.push('Reduced bowel wall enhancement (early ischaemia)');
    score += 25;
    triggers.push({ trigger: 'CT: reduced bowel wall enhancement', severity: 25 });
  }

  if (input.ctFreeFluid) {
    suggestiveSigns.push('Free fluid on CT without visible perforation');
    score += 10;
    triggers.push({ trigger: 'CT: free fluid (suggestive)', severity: 10 });
  }

  // Pain pattern (very important)
  if (input.painPattern === 'colicky_then_constant') {
    suggestiveSigns.push('Pain progression from colicky to constant — classic for ischaemia');
    score += 30;
    triggers.push({ trigger: 'Pain progression: colicky → constant', severity: 30 });
  } else if (input.painPattern === 'constant_since_onset') {
    suggestiveSigns.push('Constant pain since onset — may indicate early ischaemia');
    score += 20;
    triggers.push({ trigger: 'Constant pain since onset', severity: 20 });
  }

  // Lactate
  if (input.lactate !== undefined) {
    if (input.lactate > 6) {
      definitiveSigns.push(`Lactate ${input.lactate} mmol/L — severe lactic acidosis, strongly suggests gangrene`);
      score += 40;
      triggers.push({ trigger: `Lactate >6: ${input.lactate}`, severity: 40 });
    } else if (input.lactate > 4) {
      definitiveSigns.push(`Lactate ${input.lactate} mmol/L — significantly elevated, suggests ischaemia`);
      score += 30;
      triggers.push({ trigger: `Lactate 4-6: ${input.lactate}`, severity: 30 });
    } else if (input.lactate > 2) {
      suggestiveSigns.push(`Lactate ${input.lactate} mmol/L — borderline elevated, early ischaemia`);
      score += 15;
      triggers.push({ trigger: `Lactate 2-4: ${input.lactate}`, severity: 15 });
    }

    if (input.lactateTrend === 'rising') {
      suggestiveSigns.push('Lactate rising on serial measurements — worsening ischaemia');
      score += 15;
      triggers.push({ trigger: 'Lactate trend: rising', severity: 15 });
    }
  }

  // Haemodynamics
  if (input.heartRate !== undefined && input.heartRate > 120) {
    suggestiveSigns.push(`Tachycardia (${input.heartRate} bpm) — pain out of proportion, suggests ischaemia`);
    score += 15;
    triggers.push({ trigger: 'Tachycardia >120', severity: 15 });
  } else if (input.heartRate !== undefined && input.heartRate > 100) {
    score += 8;
    triggers.push({ trigger: 'Tachycardia >100', severity: 8 });
  }

  if (input.systolicBP !== undefined && input.systolicBP < 90) {
    suggestiveSigns.push(`Hypotension (${input.systolicBP} mmHg) — late sign of ischaemic shock`);
    score += 20;
    triggers.push({ trigger: 'Hypotension <90', severity: 20 });
  }

  // Peritonism
  if (input.rigidity) {
    definitiveSigns.push('Rigidity — suggests perforation or transmural ischaemia');
    score += 35;
    triggers.push({ trigger: 'Rigidity', severity: 35 });
  } else if (input.guarding) {
    suggestiveSigns.push('Guarding — peritoneal irritation, may indicate ischaemia');
    score += 20;
    triggers.push({ trigger: 'Guarding', severity: 20 });
  } else if (input.peritonism) {
    suggestiveSigns.push('Peritonism — peritoneal irritation');
    score += 15;
    triggers.push({ trigger: 'Peritonism', severity: 15 });
  }

  // Fever
  if (input.temperature !== undefined && input.temperature > 38.5) {
    suggestiveSigns.push(`Fever (${input.temperature}°C) — suggests inflammatory/ischaemic process`);
    score += 10;
    triggers.push({ trigger: 'Fever >38.5', severity: 10 });
  }

  // WBC
  if (input.wbc !== undefined && input.wbc > 15) {
    suggestiveSigns.push(`Leukocytosis (WBC ${input.wbc}) — inflammation, may indicate ischaemia`);
    score += 10;
    triggers.push({ trigger: 'WBC >15', severity: 10 });
  }

  // Risk factors
  if (input.diabetes) {
    riskFactors.push('Diabetes — increased risk of bowel ischaemia due to microvascular disease');
    score += 5;
  }
  if (input.age > 70) {
    riskFactors.push(`Age ${input.age} — increased ischaemia risk`);
    score += 3;
  }
  if (input.timeSinceOnsetHours > 48) {
    riskFactors.push(`Duration ${Math.round(input.timeSinceOnsetHours / 24)} days — prolonged obstruction increases ischaemia risk`);
    score += 5;
  }

  // Determine likelihood
  let likelihood: IschemiaResult['likelihood'] = 'low';
  if (score >= 70) likelihood = 'very_high';
  else if (score >= 40) likelihood = 'high';
  else if (score >= 20) likelihood = 'moderate';

  // Action and timeframe
  let action: string;
  let timeframe: string;

  if (likelihood === 'very_high') {
    action = 'Emergency laparotomy — transmural ischaemia/infarction likely. Immediate surgical exploration. No role for endoscopic or conservative management.';
    timeframe = 'Within 1 hour — life-threatening';
  } else if (likelihood === 'high') {
    action = 'Urgent laparotomy — high concern for ischaemia. Surgical exploration warranted. CT reviewed by consultant surgeon.';
    timeframe = 'Within 2 hours';
  } else if (likelihood === 'moderate') {
    action = 'Urgent CT with IV contrast (if not done). Repeat lactate in 2 hours. Senior surgical review. Prepare for potential laparotomy.';
    timeframe = 'Within 4-6 hours — re-evaluate';
  } else {
    action = 'No immediate ischaemia concern. Continue observation. Serial abdominal examinations. CT if clinical deterioration.';
    timeframe = 'Routine — no urgency from ischaemia perspective';
  }

  return {
    probability: Math.min(99, score),
    likelihood,
    definitiveSigns,
    suggestiveSigns,
    riskFactors,
    triggers: triggers.sort((a, b) => b.severity - a.severity),
    action,
    timeframe,
  };
}
