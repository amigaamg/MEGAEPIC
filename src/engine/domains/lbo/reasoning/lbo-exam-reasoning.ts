/**
 * LBO Examination Reasoning Engine — Consultant-Grade
 *
 * Produces:
 *   1. Narrative exam summary (general + systemic)
 *   2. Clinical impression linking history + exam
 *   3. Key positive and negative findings
 *   4. DDX refinement based on exam
 *   5. Urgency assessment
 */

import type { RegistrationData, HistoryData, ExamData } from '../lbo-records';
import type { HistoryReasoningOutput } from './lbo-history-reasoning';

// ── Output Types ───────────────────────────────────────────────────────────

export interface ExamReasoningOutput {
  narrativeSummary: string[];
  impression: string;
  keyPositiveFindings: { finding: string; significance: 'major' | 'minor' | 'critical' }[];
  keyNegativeFindings: { finding: string; significance: 'major' | 'minor' }[];
  ddxRefinement: {
    diagnosis: string;
    inFavor: { finding: string; reasoning: string }[];
    against: { finding: string; reasoning: string }[];
    shift: 'up' | 'down' | 'unchanged';
  }[];
  urgencyAssessment: {
    level: 'routine' | 'urgent' | 'emergency' | 'immediate';
    rationale: string[];
    timeToIntervention: string;
  };
  peritonismAssessment: {
    present: boolean;
    pattern: 'none' | 'localised' | 'generalised';
    likelyAetiology: string;
  };
}

type G = { sub: string; obj: string; pos: string };

function g(reg: RegistrationData): G {
  return reg.sex === 'female' ? { sub: 'She', obj: 'her', pos: 'her' } : { sub: 'He', obj: 'him', pos: 'his' };
}

export function reasonExam(
  exam: ExamData,
  history: HistoryData,
  reg: RegistrationData,
  historyReasoning?: HistoryReasoningOutput,
): ExamReasoningOutput {
  const p = g(reg);
  const v = exam.vitals;
  const tachycardia = v.heartRate > 100;
  const hypotensive = v.systolicBP < 90;
  const febrile = v.temperature > 38;
  const tachypnoea = v.respiratoryRate > 20;
  const hypoxic = v.spO2 < 95;

  // ── 1. NARRATIVE EXAM SUMMARY ────────────────────────────────────────────
  const narrative: string[] = [];

  narrative.push('--- GENERAL EXAMINATION ---');
  const genObs: string[] = [];
  if (exam.generalAppearance) genObs.push(exam.generalAppearance);
  if (exam.distressLevel) genObs.push(`appears ${exam.distressLevel}ly distressed`);
  if (genObs.length > 0) {
    narrative.push(`${p.sub} is ${genObs.join(' and ')}.`);
  } else {
    narrative.push(`${p.sub} appears uncomfortable but is alert and oriented.`);
  }
  if (exam.hydrationStatus) {
    const hydMap: Record<string, string> = {
      well_hydrated: 'Mucous membranes are moist; skin turgor is normal.',
      dry: 'There are signs of dehydration — dry mucous membranes and reduced skin turgor.',
      dehydrated: 'Clinically dehydrated.',
    };
    narrative.push(hydMap[exam.hydrationStatus] || `Hydration: ${exam.hydrationStatus}.`);
  }
  if (exam.jaundice) narrative.push('There is clinical jaundice.');
  if (exam.anaemia) narrative.push('Conjunctival pallor is present, suggesting anaemia.');
  if (exam.lymphadenopathy) narrative.push('Palpable lymphadenopathy is noted.');

  // ── Systemic Examination (CVS, RS, CNS, MSK) ────────────────────────────
  if (exam.systemic) {
    const sys = exam.systemic;

    narrative.push('');
    narrative.push('--- CARDIOVASCULAR SYSTEM ---');
    const cvsParts: string[] = [];
    if (sys.cvs.jvp) cvsParts.push(`JVP is ${sys.cvs.jvp}.`);
    if (sys.cvs.heartSounds) cvsParts.push(`Heart sounds: ${sys.cvs.heartSounds}.`);
    if (sys.cvs.murmurs) cvsParts.push(`Murmurs: ${sys.cvs.murmurs}.`);
    else cvsParts.push(`No audible murmurs.`);
    if (sys.cvs.capillaryRefill) cvsParts.push(`Capillary refill time is ${sys.cvs.capillaryRefill}.`);
    if (sys.cvs.peripheralPulses) cvsParts.push(`Peripheral pulses: ${sys.cvs.peripheralPulses}.`);
    if (sys.cvs.peripheralOedema !== 'none') cvsParts.push(`There is ${sys.cvs.peripheralOedema} peripheral oedema.`);
    else cvsParts.push('No peripheral oedema.');
    narrative.push(cvsParts.join(' '));

    narrative.push('');
    narrative.push('--- RESPIRATORY SYSTEM ---');
    const rsParts: string[] = [];
    if (sys.respiratory.chestWall) rsParts.push(`Chest wall: ${sys.respiratory.chestWall}.`);
    if (sys.respiratory.breathSounds) rsParts.push(`Breath sounds: ${sys.respiratory.breathSounds}.`);
    if (sys.respiratory.addedSounds) rsParts.push(`Added sounds: ${sys.respiratory.addedSounds}.`);
    else rsParts.push('No added sounds.');
    if (sys.respiratory.percussion) rsParts.push(`Percussion: ${sys.respiratory.percussion}.`);
    if (sys.respiratory.accessoryMuscleUse) rsParts.push('Accessory muscle use is noted, suggesting respiratory distress.');
    narrative.push(rsParts.join(' '));

    narrative.push('');
    narrative.push('--- CENTRAL NERVOUS SYSTEM ---');
    const cnsParts: string[] = [];
    cnsParts.push(`The patient is ${sys.cns.alertness} and oriented.`);
    if (sys.cns.gcs) cnsParts.push(`GCS ${sys.cns.gcs}/15.`);
    if (sys.cns.power) cnsParts.push(`Motor power: ${sys.cns.power}.`);
    if (sys.cns.sensation) cnsParts.push(`Sensation: ${sys.cns.sensation}.`);
    if (sys.cns.speech) cnsParts.push(`Speech: ${sys.cns.speech}.`);
    else cnsParts.push('Speech is normal.');
    narrative.push(cnsParts.join(' '));

    narrative.push('');
    narrative.push('--- MUSCULOSKELETAL SYSTEM ---');
    const mskParts: string[] = [];
    if (sys.msk.spineTenderness) mskParts.push('Spinal tenderness is present.');
    if (sys.msk.jointSwelling) mskParts.push(`Joint swelling: ${sys.msk.jointSwelling}.`);
    if (sys.msk.deformity) mskParts.push(`Deformity: ${sys.msk.deformity}.`);
    mskParts.push(`Mobility: ${sys.msk.mobility === 'independent' ? 'independently mobile' : sys.msk.mobility === 'assisted' ? 'mobilises with assistance' : 'bedridden'}.`);
    narrative.push(mskParts.join(' '));
  }

  narrative.push('');
  narrative.push('--- VITAL SIGNS ---');
  const vitalsLine = `Blood pressure ${v.systolicBP}/${v.diastolicBP} mmHg, heart rate ${v.heartRate} bpm${tachycardia ? ' (tachycardic)' : ' (regular)'}, respiratory rate ${v.respiratoryRate}/min${tachypnoea ? ' (tachypnoeic)' : ''}, temperature ${v.temperature}°C${febrile ? ' (febrile)' : ''}, SpO₂ ${v.spO2}%${hypoxic ? ' — hypoxic' : ''} on room air. GCS ${v.gcs || 15}/15.`;
  narrative.push(vitalsLine);

  narrative.push('');
  narrative.push('--- ABDOMINAL EXAMINATION ---');

  // Inspection
  const inspParts: string[] = [];
  const distMap: Record<string, string> = {
    none: 'not distended',
    mild: 'mildly distended',
    moderate: 'moderately distended',
    severe: 'severely (tense) distended',
  };
  const distStr = distMap[exam.distensionSeverity] || exam.distensionSeverity;
  const symm = exam.distensionSeverity !== 'none' ? 'The distension is generalised and symmetrical' : '';
  inspParts.push(`Abdomen is ${distStr}.${symm ? ` ${symm}.` : ''}`);
  if (exam.scars) inspParts.push(`Surgical scars: ${exam.scars}.`);
  else if (exam.distensionSeverity !== 'none') inspParts.push('No surgical scars are visible.');
  if (exam.hernialOrifices) inspParts.push(`Hernial orifices: ${exam.hernialOrifices}.`);
  if (exam.abdominalMass) inspParts.push(`A visible mass is noted${exam.massLocation ? ` in the ${exam.massLocation}` : ''}.`);
  narrative.push(inspParts.join(' '));

  // Palpation
  const palpParts: string[] = [];
  if (exam.abdominalTenderness === 'none') {
    palpParts.push('There is no abdominal tenderness on palpation.');
  } else {
    palpParts.push(`There is ${exam.abdominalTenderness} tenderness${exam.tendernessLocation ? ` in the ${exam.tendernessLocation}` : ''}.`);
  }
  if (exam.guarding) palpParts.push('Voluntary guarding is present.');
  if (exam.rigidity) palpParts.push('There is involuntary rigidity — highly concerning for perforation.');
  if (exam.reboundTenderness) palpParts.push('Rebound tenderness is elicited.');
  if (exam.peritonism) palpParts.push('Frank peritoneal signs are present.');
  if (exam.abdominalMass && !exam.massLocation) palpParts.push('A palpable abdominal mass is noted.');
  if (!exam.abdominalMass) palpParts.push('No abdominal masses are palpated.');
  if (exam.murphySign) palpParts.push("Murphy's sign is positive — suggests gallbladder pathology.");
  if (exam.rovsingSign) palpParts.push("Rovsing's sign is positive — suggests right iliac fossa pathology.");
  narrative.push(palpParts.join(' '));

  // Percussion
  const percParts: string[] = [];
  percParts.push(exam.percussionTympanic ? 'Percussion is tympanic throughout, consistent with gas-filled distended bowel.' : 'Percussion is resonant.');
  percParts.push(exam.percussionDull ? 'Dullness is noted in the flanks, suggesting free fluid/ascites.' : 'No dullness is detected.');
  narrative.push(percParts.join(' '));

  // Auscultation
  const bsMap: Record<string, string> = {
    normal: 'Bowel sounds are normal.',
    reduced: 'Bowel sounds are reduced.',
    absent: 'Bowel sounds are absent — concerning for ileus or advanced ischaemia.',
    high_pitched: 'Bowel sounds are high-pitched and tinkling — characteristic of mechanical obstruction with hyperperistalsis proximal to the obstruction site.',
    tinkling: 'Tinkling bowel sounds are heard, consistent with mechanical obstruction and distended bowel loops.',
  };
  narrative.push(bsMap[exam.bowelSounds] || `Bowel sounds: ${exam.bowelSounds}.`);

  // DRE
  if (exam.drePerformed) {
    narrative.push('');
    narrative.push('--- DIGITAL RECTAL EXAMINATION ---');
    const dreParts: string[] = [];
    dreParts.push(`DRE was performed. Sphincter tone is ${exam.dreSphincterTone || 'normal'}.`);
    dreParts.push(exam.dreFinding ? `Finding: ${exam.dreFinding}.` : 'The rectum was empty.');
    if (exam.dreStoolColour) dreParts.push(`Stool colour: ${exam.dreStoolColour}.`);
    if (exam.dreMass) dreParts.push('A palpable mass is noted in the rectum — suspicious for rectal carcinoma.');
    else dreParts.push('No rectal masses are palpable.');
    if (exam.dreBlood) dreParts.push('Blood is noted on the examining finger.');
    else dreParts.push('No blood is noted on the examining finger.');
    narrative.push(dreParts.join(' '));
  } else {
    narrative.push('');
    narrative.push('--- DIGITAL RECTAL EXAMINATION ---');
    narrative.push('DRE has not yet been performed. This should be completed as it provides critical diagnostic information.');
  }

  // ── 2. KEY POSITIVE & NEGATIVE FINDINGS ────────────────────────────────
  const positiveFindings: ExamReasoningOutput['keyPositiveFindings'] = [];
  const negativeFindings: ExamReasoningOutput['keyNegativeFindings'] = [];

  if (exam.distensionSeverity === 'severe') positiveFindings.push({ finding: 'Severe/tense abdominal distension', significance: 'major' });
  else if (exam.distensionSeverity === 'moderate') positiveFindings.push({ finding: 'Moderate abdominal distension', significance: 'major' });

  if (exam.peritonism || exam.guarding || exam.rigidity || exam.reboundTenderness) {
    const pList: string[] = [];
    if (exam.peritonism) pList.push('peritoneal signs');
    if (exam.guarding) pList.push('guarding');
    if (exam.rigidity) pList.push('rigidity');
    if (exam.reboundTenderness) pList.push('rebound tenderness');
    positiveFindings.push({ finding: pList.join(', '), significance: 'critical' });
  } else {
    negativeFindings.push({ finding: 'No peritoneal signs', significance: 'major' });
  }

  if (tachycardia) positiveFindings.push({ finding: `Tachycardia (HR ${v.heartRate} bpm)`, significance: 'major' });
  else negativeFindings.push({ finding: 'Heart rate normal', significance: 'minor' });

  if (febrile) positiveFindings.push({ finding: `Fever (${v.temperature}°C)`, significance: 'critical' });
  if (hypotensive) positiveFindings.push({ finding: `Hypotension (BP ${v.systolicBP}/${v.diastolicBP})`, significance: 'critical' });
  if (hypoxic) positiveFindings.push({ finding: `Hypoxia (SpO₂ ${v.spO2}%)`, significance: 'critical' });

  if (exam.bowelSounds === 'high_pitched' || exam.bowelSounds === 'tinkling') {
    positiveFindings.push({ finding: 'High-pitched/tinkling bowel sounds', significance: 'major' });
  } else if (exam.bowelSounds === 'absent') {
    positiveFindings.push({ finding: 'Absent bowel sounds', significance: 'major' });
  }

  if (exam.dreMass || exam.abdominalMass) positiveFindings.push({ finding: 'Palpable mass (abdominal or rectal)', significance: 'major' });
  if (exam.percussionTympanic) positiveFindings.push({ finding: 'Tympanic percussion — gas-filled distended bowel', significance: 'minor' });

  if (exam.drePerformed) {
    if (exam.dreMass) positiveFindings.push({ finding: 'Rectal mass on DRE', significance: 'major' });
    if (exam.dreBlood) positiveFindings.push({ finding: 'Blood on DRE', significance: 'major' });
    const emptyRectum = (exam.dreFinding || '').toLowerCase().includes('empty') || !exam.dreStoolColour;
    if (emptyRectum) positiveFindings.push({ finding: 'Empty rectum on DRE — typical of sigmoid volvulus', significance: 'major' });
  }

  if (exam.jaundice) positiveFindings.push({ finding: 'Jaundice', significance: 'major' });
  if (exam.anaemia) positiveFindings.push({ finding: 'Conjunctival pallor/anaemia', significance: 'major' });
  if (exam.lymphadenopathy) positiveFindings.push({ finding: 'Lymphadenopathy', significance: 'minor' });

  // Systemic exam findings
  if (exam.systemic) {
    const sys = exam.systemic;
    if (sys.cvs.jvp && (sys.cvs.jvp.includes('raised') || sys.cvs.jvp.includes('elevated'))) positiveFindings.push({ finding: 'Raised JVP — fluid overload or right heart strain', significance: 'major' });
    if (sys.cvs.murmurs) positiveFindings.push({ finding: `Cardiac murmur: ${sys.cvs.murmurs}`, significance: 'minor' });
    if (sys.cvs.peripheralOedema !== 'none') positiveFindings.push({ finding: `Peripheral oedema (${sys.cvs.peripheralOedema})`, significance: 'minor' });
    if (sys.respiratory.addedSounds) positiveFindings.push({ finding: `Added breath sounds: ${sys.respiratory.addedSounds}`, significance: 'major' });
    if (sys.respiratory.accessoryMuscleUse) positiveFindings.push({ finding: 'Accessory muscle use — respiratory distress', significance: 'critical' });
    if (sys.cns.alertness !== 'alert') positiveFindings.push({ finding: `Reduced consciousness (${sys.cns.alertness})`, significance: 'critical' });
    if (sys.msk.mobility === 'bedridden') positiveFindings.push({ finding: 'Bedridden — poor functional status', significance: 'major' });

    if (!sys.cvs.murmurs) negativeFindings.push({ finding: 'No cardiac murmurs', significance: 'minor' });
    if (sys.cvs.peripheralOedema === 'none') negativeFindings.push({ finding: 'No peripheral oedema', significance: 'minor' });
    if (!sys.respiratory.addedSounds) negativeFindings.push({ finding: 'Clear lung fields', significance: 'minor' });
    if (sys.cns.alertness === 'alert') negativeFindings.push({ finding: 'Alert and oriented', significance: 'minor' });
  }

  // ── 3. PERITONISM ASSESSMENT ────────────────────────────────────────────
  let peritonismPattern: 'none' | 'localised' | 'generalised' = 'none';
  if (exam.rigidity) peritonismPattern = 'generalised';
  else if (exam.guarding && exam.tendernessLocation) peritonismPattern = 'localised';
  else if (exam.peritonism || exam.reboundTenderness) peritonismPattern = 'generalised';

  let likelyAetiology = 'No peritonism detected.';
  if (peritonismPattern === 'generalised') {
    if (exam.rigidity) {
      likelyAetiology = 'Generalised peritonism with rigidity — highly suggestive of perforation with faecal peritonitis until proven otherwise. Emergency laparotomy indicated.';
    } else {
      likelyAetiology = 'Generalised peritonism — concern for bowel ischaemia, perforation, or advanced intra-abdominal inflammation.';
    }
  } else if (peritonismPattern === 'localised') {
    likelyAetiology = `Localised peritonism at ${exam.tendernessLocation} — suggests contained pathology such as diverticulitis, localised abscess, or a sealed perforation.`;
  }

  // ── 4. DDX REFINEMENT FROM EXAM ─────────────────────────────────────────
  const ddxRefinement: ExamReasoningOutput['ddxRefinement'] = [];

  // Sigmoid Volvulus
  const volvInFavor: { finding: string; reasoning: string }[] = [];
  const volvAgainst: { finding: string; reasoning: string }[] = [];
  if (exam.distensionSeverity === 'severe') {
    volvInFavor.push({ finding: 'Severe/tense distension', reasoning: 'Massive distension out of proportion to pain is pathognomonic of sigmoid volvulus' });
  }
  if (exam.bowelSounds === 'high_pitched' || exam.bowelSounds === 'tinkling') {
    volvInFavor.push({ finding: 'High-pitched bowel sounds', reasoning: 'Characteristic of mechanical obstruction with hyperperistalsis proximal to the twist' });
  }
  if (exam.drePerformed && ((exam.dreFinding || '').toLowerCase().includes('empty') || !exam.dreStoolColour)) {
    volvInFavor.push({ finding: 'Empty rectum on DRE', reasoning: 'Classic finding in sigmoid volvulus — the twisted segment lies proximal to the rectum' });
  }
  if (exam.percussionTympanic) {
    volvInFavor.push({ finding: 'Tympanic percussion', reasoning: 'Gas-filled distended sigmoid loop produces tympany' });
  }
  if (exam.abdominalMass && !exam.dreMass) {
    volvAgainst.push({ finding: 'Palpable abdominal mass', reasoning: 'A distinct mass suggests alternative pathology such as carcinoma rather than simple volvulus' });
  }
  ddxRefinement.push({
    diagnosis: 'Sigmoid Volvulus',
    inFavor: volvInFavor,
    against: volvAgainst,
    shift: volvInFavor.length > volvAgainst.length ? 'up' : volvAgainst.length > volvInFavor.length ? 'down' : 'unchanged',
  });

  // Colorectal Cancer
  const caInFavor: { finding: string; reasoning: string }[] = [];
  const caAgainst: { finding: string; reasoning: string }[] = [];
  if (exam.dreMass) caInFavor.push({ finding: 'Palpable rectal mass on DRE', reasoning: 'A mass in the rectum is highly suspicious for rectal carcinoma until proven otherwise' });
  if (exam.abdominalMass) caInFavor.push({ finding: 'Palpable abdominal mass', reasoning: 'A mass in the left iliac fossa may represent a sigmoid or descending colon cancer' });
  if (exam.dreBlood) caInFavor.push({ finding: 'Blood on DRE', reasoning: 'Blood from a proximal lesion may track downward; also suspicious for rectal cancer' });
  ddxRefinement.push({
    diagnosis: 'Obstructing Colorectal Carcinoma',
    inFavor: caInFavor,
    against: caAgainst,
    shift: caInFavor.length > caAgainst.length ? 'up' : 'unchanged',
  });

  // Pseudo-obstruction
  const pseudoInFavor: { finding: string; reasoning: string }[] = [];
  const pseudoAgainst: { finding: string; reasoning: string }[] = [];
  if ((exam.distensionSeverity === 'moderate' || exam.distensionSeverity === 'severe') &&
      !exam.peritonism && !exam.guarding && !exam.rigidity && exam.abdominalTenderness === 'none') {
    pseudoInFavor.push({ finding: 'Painless distension without peritonism', reasoning: 'Pseudo-obstruction typically presents with massive distension but minimal pain and no peritonism' });
  }
  if (exam.bowelSounds === 'absent' || exam.bowelSounds === 'reduced') {
    pseudoInFavor.push({ finding: 'Reduced or absent bowel sounds', reasoning: 'In pseudo-obstruction, bowel sounds are often reduced or absent due to adynamic ileus' });
  }
  ddxRefinement.push({
    diagnosis: "Pseudo-obstruction (Ogilvie's Syndrome)",
    inFavor: pseudoInFavor,
    against: pseudoAgainst,
    shift: pseudoInFavor.length > pseudoAgainst.length ? 'up' : 'unchanged',
  });

  // ── 5. CLINICAL IMPRESSION ──────────────────────────────────────────────
  const impressionParts: string[] = [];

  impressionParts.push(
    `This ${reg.age}-year-old ${reg.sex} presents with clinical features consistent with large bowel obstruction.`
  );

  // Severity
  if (exam.rigidity || exam.peritonism) {
    impressionParts.push('There are frank peritoneal signs raising concern for perforation or advanced ischaemia — this constitutes a surgical emergency requiring immediate exploration.');
  } else if (exam.guarding) {
    impressionParts.push('There is guarding which may indicate peritoneal irritation. Close monitoring for deterioration is essential.');
  } else if (tachycardia && febrile) {
    impressionParts.push('The presence of tachycardia and fever suggests a systemic inflammatory response — concern for ischaemia or sepsis.');
  } else if (tachycardia) {
    impressionParts.push('Tachycardia may reflect dehydration from third-spacing or early systemic stress response.');
  } else {
    impressionParts.push('Vital signs are currently stable.');
  }

  // Distension & bowel sounds
  const distAdj = exam.distensionSeverity === 'severe' ? 'severely' : exam.distensionSeverity === 'moderate' ? 'moderately' : 'mildly';
  const bsNote = exam.bowelSounds === 'high_pitched' || exam.bowelSounds === 'tinkling'
    ? 'with high-pitched bowel sounds suggesting mechanical obstruction'
    : exam.bowelSounds === 'absent' ? 'with absent bowel sounds — concerning for ileus or ischaemia' : '';
  impressionParts.push(`The abdomen is ${distAdj} distended${exam.percussionTympanic ? ' and tympanic' : ''} ${bsNote}.`);

  // DRE findings
  if (exam.drePerformed) {
    if ((exam.dreFinding || '').toLowerCase().includes('empty') || !exam.dreStoolColour) {
      impressionParts.push('The empty rectum on DRE is classically associated with sigmoid volvulus.');
    }
    if (exam.dreMass) impressionParts.push('A rectal mass has been identified — obstructive rectal or colonic carcinoma must be excluded.');
    if (exam.dreBlood) impressionParts.push('Blood on DRE mandates that colorectal cancer be considered as a leading differential.');
  }

  // Peritonism
  if (peritonismPattern !== 'none') {
    impressionParts.push(`⚠️ ${likelyAetiology}`);
  }

  // History linkage
  if (history.hpiPreviousEpisodes) {
    impressionParts.push('The history of previous similar episodes strongly favours recurrent sigmoid volvulus.');
  }
  if (history.hpiWeightLoss && exam.distensionSeverity !== 'severe') {
    impressionParts.push('The presence of weight loss with obstructive symptoms raises concern for colorectal malignancy.');
  }

  if (!exam.drePerformed) {
    impressionParts.push('Note: DRE was not performed — this should be completed as a priority as it provides critical diagnostic information (empty rectum in volvulus, mass in carcinoma, blood).');
  }

  const impression = impressionParts.join(' ');

  // ── 6. URGENCY ASSESSMENT ───────────────────────────────────────────────
  let urgencyLevel: ExamReasoningOutput['urgencyAssessment']['level'] = 'routine';
  const urgencyRationale: string[] = [];
  let timeToIntervention = '';

  if (exam.rigidity || exam.peritonism) {
    urgencyLevel = 'immediate';
    urgencyRationale.push('Rigidity and peritonism suggest perforation — emergency laparotomy within 1 hour');
    timeToIntervention = 'Within 1 hour';
  } else if (exam.guarding || (tachycardia && febrile && exam.distensionSeverity === 'severe')) {
    urgencyLevel = 'emergency';
    urgencyRationale.push(`Guarding${tachycardia && febrile ? ', tachycardia, and fever' : ''} suggest possible ischaemia — urgent laparotomy within 2-6 hours`);
    timeToIntervention = 'Within 2-6 hours';
  } else if (tachycardia || febrile || exam.distensionSeverity === 'severe') {
    urgencyLevel = 'urgent';
    const parts: string[] = [];
    if (tachycardia) parts.push('Tachycardia');
    if (febrile) parts.push('Fever');
    if (exam.distensionSeverity === 'severe') parts.push('Severe distension');
    urgencyRationale.push(`${parts.join(' and ')} — needs urgent assessment and intervention`);
    timeToIntervention = 'Within 6-12 hours';
  } else {
    urgencyLevel = 'urgent';
    urgencyRationale.push('Large bowel obstruction requires admission and intervention, though there are no immediately life-threatening signs');
    timeToIntervention = 'Within 12-24 hours';
  }

  return {
    narrativeSummary: narrative,
    impression,
    keyPositiveFindings: positiveFindings,
    keyNegativeFindings: negativeFindings,
    ddxRefinement,
    urgencyAssessment: { level: urgencyLevel, rationale: urgencyRationale, timeToIntervention },
    peritonismAssessment: { present: peritonismPattern !== 'none', pattern: peritonismPattern, likelyAetiology },
  };
}
