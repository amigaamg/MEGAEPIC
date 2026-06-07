export type ExplainableDecision =
  | 'diagnosis' | 'urgency' | 'management' | 'operative_approach' | 'stoma_formation'
  | 'discharge' | 'followup' | 'icu_admission';

export interface DecisionStep {
  step: number;
  premise: string;
  evidence: string;
  rule: string;
  conclusion: string;
  confidence: 'low' | 'medium' | 'high';
  alternatives: string[];
}

export interface DecisionExplanation {
  decision: ExplainableDecision;
  title: string;
  finalDecision: string;
  steps: DecisionStep[];
  evidenceSummary: string[];
  guidelinesReferenced: string[];
  auditTrail: string;
}

export interface ExplainInput {
  subtype: string;
  volvulusScore: number;
  ischemiaScore: number;
  perforationScore: number;
  lactate: number;
  freeAir: boolean;
  peritonism: boolean;
  age: number;
  comorbidities: string[];
  ctFindings: string[];
  previousEpisodes: boolean;
}

function buildDiagnosisSteps(input: ExplainInput): DecisionStep[] {
  const steps: DecisionStep[] = [];
  let s = 0;

  if (input.ctFindings.includes('mesenteric_swirl') || input.ctFindings.includes('bird_beak')) {
    steps.push({
      step: ++s, premise: 'CT findings show mesenteric swirl/bird beak sign',
      evidence: 'Classic CT signs for sigmoid volvulus with >95% specificity',
      rule: 'IF mesenteric swirl OR bird beak sign THEN diagnosis = sigmoid volvulus (specificity 0.97)',
      conclusion: 'Diagnosis: Sigmoid Volvulus', confidence: 'high',
      alternatives: ['Consider synchronous pathology (e.g., cancer at twist point)'],
    });
  } else if (input.ctFindings.includes('apple_core')) {
    steps.push({
      step: ++s, premise: 'CT shows apple core (napkin ring) lesion',
      evidence: 'Characteristic appearance of obstructing colorectal carcinoma',
      rule: 'IF apple core lesion on CT THEN diagnosis = obstructing colorectal cancer',
      conclusion: 'Diagnosis: Obstructing Colorectal Carcinoma', confidence: 'high',
      alternatives: ['Consider benign stricture if IBD history; consider extrinsic compression'],
    });
  } else if (!input.ctFindings.includes('transition_point')) {
    steps.push({
      step: ++s, premise: 'No transition point identified on CT',
      evidence: 'Absence of mechanical obstruction point on gold-standard imaging',
      rule: 'IF no transition point on CT THEN diagnosis = pseudo-obstruction (Ogilvie\'s)',
      conclusion: 'Diagnosis: Pseudo-obstruction (Ogilvie\'s Syndrome)', confidence: 'high',
      alternatives: ['Consider early mechanical obstruction not yet visible; repeat imaging if clinical deterioration'],
    });
  } else {
    steps.push({
      step: ++s, premise: 'Transition point identified on CT without pathognomonic volvulus or cancer signs',
      evidence: 'Mechanical obstruction confirmed at specific colonic segment',
      rule: 'IF transition point present AND no pathognomonic signs THEN diagnosis = mechanical LBO, subtype undetermined',
      conclusion: 'Diagnosis: Large Bowel Obstruction — aetiology to be confirmed', confidence: 'medium',
      alternatives: ['Consider colonoscopy for tissue diagnosis if stable; consider diagnostic laparoscopy'],
    });
  }

  steps.push({
    step: ++s, premise: `Ischemia assessment: Lactate ${input.lactate}, CT findings: ${input.ctFindings.join(', ')}`,
    evidence: input.lactate > 4 ? 'Lactate >4 strongly suggests bowel gangrene. Sensitivity 0.85 for transmural necrosis.'
      : input.lactate > 2 ? 'Lactate 2-4 suggests early ischaemia. Repeat in 2h.'
      : 'Lactate normal — low likelihood of ischaemia (NPV 0.95 for transmural ischaemia)',
    rule: 'IF lactate >4 OR (lactate >2 + peritonism) THEN ischaemia likely; IF pneumatosis THEN transmural ischaemia',
    conclusion: input.lactate > 4 ? 'Bowel ischaemia/gangrene likely — emergency laparotomy indicated'
      : input.peritonism ? 'Peritonism present — concern for perforation or ischaemia'
      : 'No evidence of ischaemia at this time', confidence: 'high',
    alternatives: ['Consider diagnostic laparoscopy if uncertainty persists'],
  });

  return steps;
}

function buildUrgencySteps(input: ExplainInput): DecisionStep[] {
  const steps: DecisionStep[] = [];
  let s = 0;

  if (input.freeAir || input.perforationScore >= 50) {
    steps.push({
      step: ++s, premise: 'Free air on imaging OR clinical peritonism + high perforation score',
      evidence: 'Free air has 100% specificity for perforation; peritonism with high score strongly suggests perforation',
      rule: 'IF free air THEN emergency laparotomy within 1 hour (WSES Level 1 recommendation)',
      conclusion: 'URGENCY: IMMEDIATE — surgery within 1 hour', confidence: 'high',
      alternatives: ['If peritonism without free air: CT to confirm before laparotomy'],
    });
  } else if (input.ischemiaScore >= 50) {
    steps.push({
      step: ++s, premise: `Ischemia score ${input.ischemiaScore} (threshold >50 for critical)`,
      evidence: 'High ischaemia score correlates with need for emergency intervention',
      rule: 'IF ischaemia score >=50 THEN emergency laparotomy within 2 hours',
      conclusion: 'URGENCY: IMMEDIATE — surgery within 2 hours', confidence: 'high',
      alternatives: ['CT if not already done to confirm ischaemia'],
    });
  } else if (input.ischemiaScore >= 30) {
    steps.push({
      step: ++s, premise: `Ischemia score ${input.ischemiaScore} (threshold 30-49 for high risk)`,
      evidence: 'Moderate-high ischaemia score warrants urgent intervention',
      rule: 'IF ischaemia score 30-49 THEN urgent laparotomy within 6 hours',
      conclusion: 'URGENCY: EMERGENCY — surgery within 6 hours', confidence: 'medium',
      alternatives: ['CT + lactate repeat; if stable, attempt endoscopic detorsion first'],
    });
  } else {
    steps.push({
      step: ++s, premise: 'No evidence of ischaemia or perforation',
      evidence: 'Low ischaemia score with normal lactate and no peritonism',
      rule: 'IF no ischaemia AND no perforation THEN attempt endoscopic detorsion; elective resection same admission',
      conclusion: 'URGENCY: URGENT (non-emergency) — decompress within 12h, resect electively',
      confidence: 'high', alternatives: ['Gastrografin enema if endoscopy unavailable'],
    });
  }

  return steps;
}

function buildManagementSteps(input: ExplainInput): DecisionStep[] {
  const steps: DecisionStep[] = [];
  let s = 0;

  steps.push({
    step: ++s, premise: 'Initial management of large bowel obstruction',
    evidence: 'WSES guidelines: NBM, IV fluids, NG tube, catheter, antibiotics, analgesia as first steps',
    rule: 'Protocol: resuscitation bundle for all LBO patients within 1 hour of presentation',
    conclusion: 'Resuscitation phase: NBM, IV access x2, IV fluids 30 mL/kg, NG tube, catheter, Ceftriaxone + Metronidazole, analgesia',
    confidence: 'high', alternatives: ['Alternate antibiotics per local protocol if allergies'],
  });

  if (input.subtype === 'sigmoid_volvulus' && input.ischemiaScore < 30 && !input.peritonism) {
    steps.push({
      step: ++s, premise: 'Non-ischaemic sigmoid volvulus confirmed',
      evidence: 'Lactate normal/low, no peritonism, CT shows no pneumatosis or free fluid',
      rule: 'IF non-ischaemic sigmoid volvulus THEN flexible sigmoidoscopy + detorsion + rectal tube x 48h + elective sigmoid resection same admission',
      conclusion: 'Plan: endoscopic detorsion now; elective laparoscopic sigmoid colectomy with primary anastomosis in 2-5 days',
      confidence: 'high', alternatives: ['Gastrografin enema (diagnostic + therapeutic)', 'Emergency resection if detorsion fails'],
    });
  } else if (input.ischemiaScore >= 30 || input.peritonism || input.freeAir) {
    steps.push({
      step: ++s, premise: 'Ischaemic/perforated bowel — operative management indicated',
      evidence: `Ischemia score ${input.ischemiaScore}, peritonism: ${input.peritonism}, free air: ${input.freeAir}`,
      rule: 'IF ischaemia OR perforation THEN emergency laparotomy, sigmoid resection, Hartmann\'s procedure if gangrenous',
      conclusion: 'Plan: emergency midline laparotomy, sigmoid colectomy + Hartmann\'s procedure (end colostomy), abdominal lavage, pelvic drain. ICU post-op.',
      confidence: 'high', alternatives: ['Primary anastomosis if bowel viable and patient stable; damage control surgery if unstable'],
    });
    steps.push({
      step: ++s, premise: `Age ${input.age} with comorbidities: ${input.comorbidities.join(', ') || 'none'}`,
      evidence: 'Age >70 and comorbidities increase peri-operative mortality (POSSUM score)',
      rule: 'Comprehensive pre-operative optimisation: Hb optimisation, antibiotic prophylaxis, DVT prophylaxis, cardiac risk assessment',
      conclusion: 'Optimisation: crossmatch 2-4 units, pre-op antibiotics at induction, enoxaparin 40mg SC, cardiac monitoring',
      confidence: 'high', alternatives: ['Regional anaesthesia if general contraindicated'],
    });
  }

  return steps;
}

export function explainDecision(decision: ExplainableDecision, input: ExplainInput): DecisionExplanation {
  let steps: DecisionStep[] = [];
  let title = '';
  let finalDecision = '';
  const evidenceSummary: string[] = [];

  switch (decision) {
    case 'diagnosis':
      steps = buildDiagnosisSteps(input);
      title = 'Diagnosis Determination';
      finalDecision = steps[0]?.conclusion || 'Unable to determine diagnosis';
      break;
    case 'urgency':
      steps = buildUrgencySteps(input);
      title = 'Urgency Stratification';
      finalDecision = steps[0]?.conclusion || 'Urgency undetermined';
      break;
    case 'management':
      steps = buildManagementSteps(input);
      title = 'Management Plan Decision';
      finalDecision = steps[steps.length - 1]?.conclusion || 'Standard LBO management';
      break;
    case 'operative_approach':
      steps = [
        {
          step: 1, premise: input.ischemiaScore >= 30 || input.peritonism ? 'Ischaemic/perforated bowel' : 'Non-ischaemic volvulus',
          evidence: input.ischemiaScore >= 30 ? `Ischaemia score ${input.ischemiaScore}` : 'No ischaemia markers',
          rule: input.ischemiaScore >= 30
            ? 'IF ischaemia THEN midline laparotomy (open) — allows thorough abdominal lavage and assessment of bowel viability'
            : 'IF non-ischaemic AND endoscopic detorsion successful THEN laparoscopic approach preferred',
          conclusion: input.ischemiaScore >= 30 ? 'Approach: Midline laparotomy (open)' : 'Approach: Laparoscopic sigmoid colectomy',
          confidence: 'high',
          alternatives: ['Hand-assisted laparoscopic surgery (HALS)', 'Laparoscopic with small incision for extraction'],
        },
      ];
      title = 'Operative Approach Selection';
      finalDecision = steps[0]?.conclusion || 'Open approach';
      break;
    case 'stoma_formation':
      steps = [
        {
          step: 1, premise: `ischaemiaScore=${input.ischemiaScore} freeAir=${input.freeAir} lactate=${input.lactate} peritonism=${input.peritonism}`,
          evidence: input.ischemiaScore >= 30 ? `Ischaemia score: ${input.ischemiaScore}` : 'No ischaemia',
          rule: 'IF ischaemic/gangrenous bowel OR perforation OR faecal peritonitis THEN Hartmann\'s procedure (end colostomy) — safest option in emergency setting',
          conclusion: input.ischemiaScore >= 30 || input.freeAir || input.lactate > 4
            ? 'Stoma: Hartmann\'s procedure (end colostomy) — high likelihood (bowel not safe for anastomosis)'
            : 'Stoma: Unlikely — primary anastomosis feasible',
          confidence: 'high',
          alternatives: ['Primary anastomosis + defunctioning loop colostomy', 'Primary anastomosis + intra-colonic bypass tube'],
        },
      ];
      title = 'Stoma Decision';
      finalDecision = steps[0]?.conclusion || 'No stoma';
      break;
    case 'icu_admission':
      steps = [
        {
          step: 1, premise: `${input.ischemiaScore >= 30 ? 'Emergency laparotomy for ischaemia' : 'Elective surgery'}, age ${input.age}, comorbidities: ${input.comorbidities.join(', ') || 'none'}`,
          evidence: 'ICU admission criteria: emergency laparotomy, lactate >4, age >70, significant comorbidities, haemodynamic instability',
          rule: 'IF emergency laparotomy for ischaemia OR lactate >4 OR age >70 with comorbidities THEN ICU admission recommended',
          conclusion: input.ischemiaScore >= 30 || input.lactate > 4 || input.age > 70
            ? 'ICU admission recommended for post-operative monitoring'
            : 'Ward-level care appropriate if haemodynamically stable',
          confidence: 'high',
          alternatives: ['HDU if intermediate care available', 'Ward with enhanced monitoring if ICU bed unavailable'],
        },
      ];
      title = 'ICU Admission Decision';
      finalDecision = steps[0]?.conclusion || 'Ward care';
      break;
    default:
      steps = [];
      title = 'Decision';
      finalDecision = 'Not implemented';
  }

  for (const step of steps) {
    evidenceSummary.push(step.evidence);
  }

  return {
    decision,
    title,
    finalDecision,
    steps,
    evidenceSummary: [...new Set(evidenceSummary)],
    guidelinesReferenced: [
      'WSES Guidelines for Large Bowel Obstruction 2024',
      'Surviving Sepsis Campaign Bundle 2024',
      'ASGBI Emergency Surgery Guidelines',
      'NICE Guideline NG12: Suspected Cancer (CRC)',
    ],
    auditTrail: [
      `=== AUDIT TRAIL: ${title.toUpperCase()} ===`,
      `Time: ${new Date().toISOString()}`,
      `Decision: ${finalDecision}`,
      ...steps.map(s => `  Step ${s.step}: ${s.premise} → ${s.conclusion}`),
      `Evidence reviewed: ${[...new Set(steps.map(s => s.evidence))].join('; ')}`,
      `Guidelines consulted: WSES 2024, SSC 2024, NICE NG12`,
      `Alternatives considered: ${[...new Set(steps.flatMap(s => s.alternatives))].join('; ')}`,
      '=== END AUDIT TRAIL ===',
    ].join('\n'),
  };
}
