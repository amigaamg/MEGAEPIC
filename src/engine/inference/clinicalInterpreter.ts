import { PatientForm } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface InterpretedVitals {
  tachypnea: boolean;
  tachypneaSeverity: 'none' | 'mild' | 'moderate' | 'severe';
  tachypneaThreshold: number;          // actual threshold used (for UI display)
  hypoxia: boolean;
  hypoxiaSeverity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
  tachycardia: boolean;
  bradycardia: boolean;                // new: bradycardia is ominous in children
  fever: boolean;
  feverGrade: 'none' | 'low' | 'moderate' | 'high' | 'hyperpyrexia';
  hypothermia: boolean;                // new: important in neonates & sepsis
  hypotension: boolean;
  shockIndex: number | null;           // HR / SBP — >1 suggests shock
}

export interface InterpretedRespiratory {
  respiratoryDistress: boolean;
  distressSeverity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
  distressScore: number;               // 0–10 composite score for trending

  // Distress signs (inspection)
  indrawing: boolean;
  subcostalIndrawing: boolean;
  intercostalIndrawing: boolean;
  suprasternalIndrawing: boolean;
  grunting: boolean;
  nasalFlaring: boolean;
  headBobbing: boolean;
  cyanosis: boolean;
  accessoryMuscleUse: boolean;

  // Auscultation
  breathSounds: 'normal' | 'wheeze' | 'crackles' | 'bronchial' | 'reduced' | 'absent' | 'pleural_rub';
  addedSounds: string[];
  wheezePhase: 'none' | 'expiratory' | 'inspiratory' | 'biphasic';
  crackleType: 'none' | 'fine' | 'coarse';
  stridorPresent: boolean;
  stridorPhase: 'none' | 'inspiratory' | 'biphasic';

  // Percussion & palpation
  percussion: 'resonant' | 'dull' | 'stony_dull' | 'hyperresonant';
  chestSymmetry: 'normal' | 'reduced_left' | 'reduced_right' | 'reduced_bilateral';
  trachea: 'central' | 'deviated_left' | 'deviated_right';
  tactileFremitus: 'normal' | 'increased' | 'decreased';

  // Physiological patterns — key clinical syndromes
  clinicalSyndrome: string;
  syndromeConfidence: 'high' | 'moderate' | 'low';
  syndromeRationale: string[];

  // Work of breathing
  workOfBreathing: 'normal' | 'increased' | 'markedly_increased' | 'exhaustion';
}

export type RespiratorysSyndrome =
  | 'normal'
  | 'upper_airway_obstruction'       // croup, epiglottitis, FB
  | 'lower_airway_obstruction'       // asthma, bronchiolitis
  | 'consolidation'                  // lobar pneumonia
  | 'bronchopneumonia'               // patchy consolidation
  | 'pleural_effusion'               // dullness + ↓ BS
  | 'pneumothorax'                   // hyperresonance + ↓ BS ± deviation
  | 'tension_pneumothorax'           // hyperresonance + ↓ BS + deviation + shock
  | 'respiratory_failure'            // critical signs + exhaustion
  | 'mixed';

// Alias for backward compat
export type RespiratoryySyndrome = RespiratorysSyndrome;
export type RespiratorysSyndrome2 = RespiratorysSyndrome;
export type RespiratorysSyndromeType = RespiratorysSyndrome;

// Unified export name
export type RespiratorysSyndromeUnion = RespiratorysSyndrome;

// ← fix: single consistent export used below
type RespSyndrome =
  | 'normal'
  | 'upper_airway_obstruction'
  | 'lower_airway_obstruction'
  | 'consolidation'
  | 'bronchopneumonia'
  | 'pleural_effusion'
  | 'pneumothorax'
  | 'tension_pneumothorax'
  | 'respiratory_failure'
  | 'mixed';

export interface InterpretedDangerSigns {
  // WHO IMCI Danger Signs (any = admit immediately)
  whoDangerSigns: WHODangerSign[];

  // Immediate life threats
  immediateDangerSigns: string[];

  // Severity indicators (not immediately life-threatening but warrant urgent action)
  severityIndicators: string[];

  // Pertinent negatives (reassuring absent signs)
  pertinentNegatives: string[];

  // Composite danger score 0–10
  dangerScore: number;
}

export interface WHODangerSign {
  sign: string;
  present: boolean;
  source: 'history' | 'exam' | 'both';
  urgency: 'immediate' | 'urgent' | 'monitor';
}

export interface RespiratoryPattern {
  syndrome: RespSyndrome;
  confidence: 'high' | 'moderate' | 'low';
  rationale: string[];
  ddxHints: string[];                  // differential diagnosis clues
  examPattern: string;                 // one-line exam description
}

export interface ClinicalInterpretation {
  vitals: InterpretedVitals;
  respiratory: InterpretedRespiratory;
  respiratoryPattern: RespiratoryPattern;
  dangerSigns: InterpretedDangerSigns;
  perfusion: 'normal' | 'prolonged_crt' | 'shock' | 'decompensated_shock';
  hydration: 'normal' | 'some_dehydration' | 'severe_dehydration';
  nutrition: 'normal' | 'MAM' | 'SAM';
  anemia: 'none' | 'mild' | 'moderate' | 'severe';
  avpu: string;
  ageMonths: number;

  // New: overall clinical severity for triage
  overallSeverity: 'stable' | 'mild' | 'moderate' | 'severe' | 'critical';
  overallSeverityRationale: string[];

  // New: actionable summary for the management plan
  keyFindings: string[];
  actionPriority: 'routine' | 'urgent' | 'emergency';
}


// ─────────────────────────────────────────────────────────────────────────────
// VITALS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getTachypneaThreshold(ageMonths: number): number {
  if (ageMonths < 2)  return 60;   // WHO: neonates
  if (ageMonths < 12) return 50;   // WHO: infants
  if (ageMonths < 60) return 40;   // WHO: 1-5 years
  return 30;                        // WHO: 5+ years
}

function assessTachypnea(rr: number, ageMonths: number): InterpretedVitals['tachypneaSeverity'] {
  const t = getTachypneaThreshold(ageMonths);
  if (rr > t + 20) return 'severe';
  if (rr > t + 10) return 'moderate';
  if (rr > t)      return 'mild';
  return 'none';
}

function assessHypoxia(spo2: number): InterpretedVitals['hypoxiaSeverity'] {
  if (spo2 < 80)  return 'critical'; // immediate airway threat
  if (spo2 < 85)  return 'severe';
  if (spo2 < 92)  return 'moderate';
  if (spo2 < 95)  return 'mild';
  return 'none';
}

function assessFever(temp: number): InterpretedVitals['feverGrade'] {
  if (temp >= 41.5) return 'hyperpyrexia'; // new: distinct from 'high'
  if (temp >= 40)   return 'high';
  if (temp >= 38.5) return 'moderate';
  if (temp >= 37.5) return 'low';
  return 'none';
}

function getTachycardiaThreshold(ageMonths: number): number {
  if (ageMonths < 3)  return 180;
  if (ageMonths < 12) return 160;
  if (ageMonths < 24) return 150;
  if (ageMonths < 60) return 140;
  return 120;
}

function getHypotensionThreshold(ageMonths: number): number {
  // 5th percentile SBP (WHO/AHA approximation)
  if (ageMonths < 12) return 70;
  if (ageMonths < 60) return 80;
  if (ageMonths < 120) return 90;
  return 90;
}


// ─────────────────────────────────────────────────────────────────────────────
// RESPIRATORY DISTRESS SCORE  (0–10)
// Based on modified Tal/DERS scoring adapted for IMCI
// ─────────────────────────────────────────────────────────────────────────────

function computeDistressScore(
  rr: number,
  spo2: number,
  ageMonths: number,
  grunting: boolean,
  indrawing: boolean,
  nasalFlaring: boolean,
  headBobbing: boolean,
  stridor: boolean,
  breathSounds: InterpretedRespiratory['breathSounds'],
  cyanosis: boolean
): number {
  let score = 0;

  // RR component (0-2)
  const rrSev = isNaN(rr) ? 'none' : assessTachypnea(rr, ageMonths);
  if (rrSev === 'mild')     score += 1;
  if (rrSev === 'moderate') score += 1.5;
  if (rrSev === 'severe')   score += 2;

  // SpO2 component (0-3)
  const hypSev = isNaN(spo2) ? 'none' : assessHypoxia(spo2);
  if (hypSev === 'mild')     score += 0.5;
  if (hypSev === 'moderate') score += 1.5;
  if (hypSev === 'severe')   score += 2.5;
  if (hypSev === 'critical') score += 3;

  // Signs component (0-5)
  if (grunting)     score += 2;    // single most dangerous sign
  if (indrawing)    score += 1.5;
  if (nasalFlaring) score += 0.5;
  if (headBobbing)  score += 1;
  if (stridor)      score += 1.5;
  if (cyanosis)     score += 2;
  if (breathSounds === 'absent') score += 2;

  return Math.min(Math.round(score * 10) / 10, 10);
}

function scoreToSeverity(score: number): InterpretedRespiratory['distressSeverity'] {
  if (score === 0)   return 'none';
  if (score <= 2)    return 'mild';
  if (score <= 4.5)  return 'moderate';
  if (score <= 7)    return 'severe';
  return 'critical';
}


// ─────────────────────────────────────────────────────────────────────────────
// RESPIRATORY SYNDROME CLASSIFIER
// Implements classic IPPA pattern recognition
// ─────────────────────────────────────────────────────────────────────────────

function classifyRespiratorySyndrome(
  form: PatientForm,
  ageMonths: number
): RespiratoryPattern {
  const v = form.vitals;
  const hpi = form.hpi;

  const wheeze       = !!v.examWheeze;
  const crackles     = !!v.examCrackles;
  const bronchial    = !!v.examBronchial;
  const dullness     = !!v.examDullness;
  const stonyDull    = !!(v as any).examStonyDull;
  const hyperres     = !!v.examHyperResonance;
  const reducedBS    = !!v.examReducedBS;
  const absentBS     = (v.airEntry === 'absent');
  const stridor      = !!v.examStridor || !!hpi.stridor;
  const barkingCough = hpi.coughChar === 'barking';
  const drooling     = !!hpi.drooling;
  const tripod       = !!hpi.tripodPosition;
  const deviation    = !!(v as any).examTrachealDeviation;
  const trachea      = (v as any).examTrachea || 'central';
  const unilateralW  = !!hpi.unilateralWheeze;
  const suddenOnset  = !!hpi.suddenOnset;
  const shock        = !!(form as any).perfusion_shock; // computed below

  // SpO2 / BP
  const spo2 = parseFloat(v.spo2);
  const bpSys = parseInt(v.bpSystolic || (v.bp?.split('/')[0] ?? ''));
  const hypotension = !isNaN(bpSys) && bpSys < getHypotensionThreshold(ageMonths);
  const crtVal = parseFloat(v.capRefill);
  const poorPerfusion = (!isNaN(crtVal) && crtVal >= 3) || hypotension;

  const rationale: string[] = [];
  const ddxHints: string[] = [];
  let syndrome: RespSyndrome = 'normal';
  let confidence: RespiratoryPattern['confidence'] = 'low';

  // ── TENSION PNEUMOTHORAX (must-not-miss — check first) ────────────────
  if (hyperres && (trachea !== 'central' || deviation) && poorPerfusion) {
    syndrome = 'tension_pneumothorax';
    confidence = 'high';
    rationale.push('Hyperresonance + tracheal deviation + haemodynamic compromise');
    ddxHints.push('Tension pneumothorax until proven otherwise — needle decompression may be required');
    return {
      syndrome, confidence, rationale, ddxHints,
      examPattern: 'Hyperresonance | Tracheal deviation | ↓ breath sounds | Shock',
    };
  }

  // ── PNEUMOTHORAX ─────────────────────────────────────────────────────────
  if (hyperres && (reducedBS || absentBS)) {
    syndrome = 'pneumothorax';
    confidence = trachea !== 'central' ? 'high' : 'moderate';
    rationale.push('Hyperresonance + reduced/absent breath sounds');
    if (trachea !== 'central') rationale.push('Tracheal deviation supports tension if haemodynamically unstable');
    if (suddenOnset) rationale.push('Sudden onset consistent with pneumothorax');
    ddxHints.push('Request urgent CXR; rule out tension pneumothorax');
    return {
      syndrome, confidence, rationale, ddxHints,
      examPattern: 'Hyperresonance | ↓/absent BS | ± tracheal deviation',
    };
  }

  // ── PLEURAL EFFUSION ────────────────────────────────────────────────────
  if (stonyDull && (reducedBS || absentBS)) {
    syndrome = 'pleural_effusion';
    confidence = 'high';
    rationale.push('Stony dullness + reduced/absent breath sounds = fluid');
    if ((v as any).examFremitus === 'decreased') rationale.push('Decreased tactile fremitus supports effusion');
    ddxHints.push('Consider parapneumonic effusion, empyema, TB — urgent CXR + USS');
    return {
      syndrome, confidence, rationale, ddxHints,
      examPattern: 'Stony dull | ↓ BS | ↓ fremitus',
    };
  }

  // ── CONSOLIDATION (lobar) ───────────────────────────────────────────────
  if (bronchial && (dullness || stonyDull)) {
    syndrome = 'consolidation';
    confidence = 'high';
    rationale.push('Bronchial breathing + dullness = airless but patent bronchus in consolidated lung');
    if ((v as any).examFremitus === 'increased') rationale.push('Increased fremitus confirms consolidation');
    if (crackles) rationale.push('Coarse crackles at periphery of consolidation');
    ddxHints.push('Lobar pneumonia (pneumococcal); request CXR — look for lobar opacity');
    return {
      syndrome, confidence, rationale, ddxHints,
      examPattern: 'Dullness | Bronchial breathing | ↑ fremitus | ± crackles',
    };
  }

  // ── BRONCHOPNEUMONIA (patchy) ────────────────────────────────────────────
  if (crackles && !bronchial) {
    const hasOtherSigns = dullness || (v as any).examReducedBS;
    syndrome = 'bronchopneumonia';
    confidence = hasOtherSigns ? 'moderate' : 'low';
    rationale.push('Bilateral/patchy crackles without bronchial breathing = bronchopneumonia pattern');
    if (dullness) rationale.push('Focal dullness suggests area of dense consolidation');
    ddxHints.push('Bronchopneumonia (Hib, S. aureus, atypicals); fine crackles → interstitial; coarse → consolidation/secretions');
    if (ageMonths < 24) ddxHints.push('Also consider RSV bronchiolitis in <2 yr');
    return {
      syndrome, confidence, rationale, ddxHints,
      examPattern: `Crackles${dullness ? ' | focal dullness' : ''} | ± tachypnoea`,
    };
  }

  // ── UPPER AIRWAY OBSTRUCTION ─────────────────────────────────────────────
  if (stridor || barkingCough || drooling || tripod) {
    syndrome = 'upper_airway_obstruction';
    const signs = [stridor, barkingCough, drooling, tripod].filter(Boolean).length;
    confidence = signs >= 2 ? 'high' : 'moderate';
    if (stridor)      rationale.push('Stridor = upper airway turbulence (supra/subglottic)');
    if (barkingCough) rationale.push('Barking cough = subglottic inflammation (croup)');
    if (drooling && tripod) {
      rationale.push('Drooling + tripod + toxic = EPIGLOTTITIS until proven otherwise');
      ddxHints.push('⚠ DO NOT examine throat — risk of complete obstruction');
    }
    if (unilateralW && suddenOnset) {
      rationale.push('Unilateral wheeze + sudden onset = foreign body aspiration excluded');
      ddxHints.push('Arrange urgent CXR (inspiratory + expiratory) ± bronchoscopy');
    }
    ddxHints.push('Croup, epiglottitis, foreign body, anaphylaxis, retropharyngeal abscess');
    return {
      syndrome, confidence, rationale, ddxHints,
      examPattern: `${stridor ? 'Stridor' : ''}${barkingCough ? ' | barking cough' : ''}${drooling ? ' | drooling' : ''}`,
    };
  }

  // ── LOWER AIRWAY OBSTRUCTION (asthma / bronchiolitis) ───────────────────
  if (wheeze) {
    syndrome = 'lower_airway_obstruction';
    confidence = 'high';
    rationale.push('Wheeze = reversible lower airway obstruction (bronchospasm / oedema / secretions)');
    if (ageMonths < 24 && hpi.wheezePattern !== 'recurrent') {
      rationale.push('First wheeze <24 months → bronchiolitis more likely than asthma');
      ddxHints.push('RSV bronchiolitis — supportive care; avoid routine bronchodilators');
    } else {
      rationale.push('Recurrent wheeze / >24 months → asthma pattern');
      ddxHints.push('Asthma — salbutamol trial, ± prednisolone; check PEFR if able');
    }
    if (unilateralW) {
      ddxHints.push('⚠ Unilateral wheeze — must exclude foreign body aspiration');
    }
    return {
      syndrome, confidence, rationale, ddxHints,
      examPattern: `Expiratory wheeze${crackles ? ' | crackles' : ''} | ± hyperinflation`,
    };
  }

  // ── RESPIRATORY FAILURE (signs present but no clear localising pattern) ──
  const spo2Crit = !isNaN(spo2) && spo2 < 85;
  const gruntingPresent = !!v.examGrunting || !!hpi.grunting;
  if (spo2Crit || (gruntingPresent && (v as any).examIndrawing)) {
    syndrome = 'respiratory_failure';
    confidence = 'high';
    rationale.push('Severe hypoxia and/or grunting with indrawing = impending respiratory failure');
    ddxHints.push('Requires urgent stabilisation regardless of underlying cause');
    return {
      syndrome, confidence, rationale, ddxHints,
      examPattern: `SpO₂ ${isNaN(spo2) ? '?' : spo2}% | grunting | indrawing`,
    };
  }

  // ── NORMAL / INSUFFICIENT DATA ───────────────────────────────────────────
  return {
    syndrome: 'normal',
    confidence: 'low',
    rationale: ['No specific respiratory syndrome pattern identified from available data'],
    ddxHints: [],
    examPattern: 'Within normal limits',
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// DANGER SIGNS (WHO IMCI + red flags)
// ─────────────────────────────────────────────────────────────────────────────

function assessDangerSigns(form: PatientForm, ageMonths: number): InterpretedDangerSigns {
  const v = form.vitals;
  const hpi = form.hpi;
  const ros = form.ros;
  const spo2 = parseFloat(v.spo2);

  const whoDangerSigns: WHODangerSign[] = [
    {
      sign: 'Unable to drink or breastfeed',
      present: !!hpi.feedingDiff || form.nutrition?.appetite === 'anorexic',
      source: 'history',
      urgency: 'immediate',
    },
    {
      sign: 'Vomits everything',
      present: !!hpi.vomitingHPI && (hpi as any).vomitsEverything,
      source: 'history',
      urgency: 'immediate',
    },
    {
      sign: 'Convulsions',
      present: !!hpi.seizureHPI || !!ros.seizures,
      source: 'both',
      urgency: 'immediate',
    },
    {
      sign: 'Lethargic or unconscious',
      present: !!ros.lethargyRos || v.avpu === 'unresponsive' || v.examConsciousLevel === 'comatose',
      source: 'both',
      urgency: 'immediate',
    },
    {
      sign: 'Central cyanosis',
      present: !!v.cyanosisExam || !!ros.cyanosisRos || (!isNaN(spo2) && spo2 < 85),
      source: 'both',
      urgency: 'immediate',
    },
    {
      sign: 'Stridor at rest',
      present: !!v.examStridor && (!!v.examIndrawing || !!(v as any).examHeadBobbing),
      source: 'exam',
      urgency: 'immediate',
    },
    {
      sign: 'Severe respiratory distress',
      present: !!v.examGrunting || (!!v.examIndrawing && (!isNaN(spo2) && spo2 < 92)),
      source: 'exam',
      urgency: 'immediate',
    },
    {
      sign: 'Severe pallor',
      present: !!v.pallorExam && !!ros.pallor,
      source: 'both',
      urgency: 'urgent',
    },
    {
      sign: 'Neck stiffness',
      present: !!v.examNeckStiffness,
      source: 'exam',
      urgency: 'immediate',
    },
    {
      sign: 'Bulging fontanelle',
      present: v.examFontanelle === 'bulging' && ageMonths <= 18,
      source: 'exam',
      urgency: 'immediate',
    },
  ];

  const immediateDangerSigns: string[] = [];

  // Airway emergencies
  if (!!hpi.drooling && !!hpi.tripodPosition) {
    immediateDangerSigns.push('⚠ Epiglottitis suspected (drooling + tripod posture) — DO NOT examine throat');
  }
  if (!!v.examStridor && !!hpi.drooling) {
    immediateDangerSigns.push('⚠ Stridor + drooling — upper airway obstruction, call anaesthesia/ENT');
  }
  if (!isNaN(spo2) && spo2 < 80) {
    immediateDangerSigns.push(`⚠ Critical hypoxaemia — SpO₂ ${spo2}% (start oxygen IMMEDIATELY, prepare for escalation)`);
  } else if (!isNaN(spo2) && spo2 < 85) {
    immediateDangerSigns.push(`⚠ Severe hypoxaemia — SpO₂ ${spo2}% (give oxygen now)`);
  }
  if (!!v.examGrunting) {
    immediateDangerSigns.push('⚠ Expiratory grunting — impending respiratory failure');
  }
  if (!!(v as any).examTrachealDeviation && !!v.examHyperResonance) {
    immediateDangerSigns.push('⚠ Tension pneumothorax suspected — needle decompression may be required');
  }
  if (v.avpu !== 'alert' && v.avpu) {
    immediateDangerSigns.push(`⚠ Reduced consciousness (AVPU: ${v.avpu}) — check glucose, secure airway`);
  }
  if (!!ros.seizures && !!v.examNeckStiffness) {
    immediateDangerSigns.push('⚠ Seizures + neck stiffness — bacterial meningitis until proven otherwise');
  }
  if (!!v.examSkinPetechiae && (parseFloat(v.temp) >= 38.5 || !isNaN(parseFloat(v.temp)))) {
    immediateDangerSigns.push('⚠ Petechiae + fever — meningococcal sepsis until proven otherwise');
  }

  const severityIndicators: string[] = [];
  if (!!hpi.chestIndrawing || !!v.examIndrawing) severityIndicators.push('Chest indrawing');
  if (!!hpi.nasalFlaring   || !!v.examNasalFlaring) severityIndicators.push('Nasal flaring');
  if (!!hpi.headBobbing)    severityIndicators.push('Head bobbing');
  if (!isNaN(spo2) && spo2 < 92 && spo2 >= 85) severityIndicators.push(`Hypoxia (SpO₂ ${spo2}%)`);
  if (!!hpi.orthopnea)      severityIndicators.push('Orthopnoea');
  if (!!hpi.sweatingFeeds)  severityIndicators.push('Diaphoresis during feeds (cardiac)');
  if (!!ros.pallor)         severityIndicators.push('Pallor');
  if (!!hpi.weightLoss)     severityIndicators.push('Weight loss');
  if (!!hpi.nightSweats)    severityIndicators.push('Night sweats');
  if (!!hpi.tbContact)      severityIndicators.push('TB household contact');

  // Pertinent negatives (reassuring signs)
  const pertinentNegatives: string[] = [];
  if (!v.examGrunting && !hpi.grunting)          pertinentNegatives.push('No grunting');
  if (!hpi.cyanoticEpisodes && !v.cyanosisExam)  pertinentNegatives.push('No cyanosis');
  if (!hpi.feedingDiff)                           pertinentNegatives.push('Feeding maintained');
  if (!hpi.seizureHPI && !ros.seizures)           pertinentNegatives.push('No convulsions');
  if (v.avpu === 'alert' || !v.avpu)              pertinentNegatives.push('Alert');

  // Composite danger score (0–10)
  const presentWHO = whoDangerSigns.filter(s => s.present).length;
  const immScore   = immediateDangerSigns.length;
  const dangerScore = Math.min(presentWHO * 1.5 + immScore * 1.5, 10);

  return {
    whoDangerSigns,
    immediateDangerSigns,
    severityIndicators,
    pertinentNegatives,
    dangerScore: Math.round(dangerScore * 10) / 10,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// OVERALL SEVERITY CLASSIFIER
// ─────────────────────────────────────────────────────────────────────────────

function classifyOverallSeverity(
  distressScore: number,
  dangerScore: number,
  hypoxiaSeverity: InterpretedVitals['hypoxiaSeverity'],
  perfusion: ClinicalInterpretation['perfusion'],
  avpu: string
): { severity: ClinicalInterpretation['overallSeverity']; rationale: string[]; priority: ClinicalInterpretation['actionPriority'] } {
  const reasons: string[] = [];

  // Critical triggers (any one = critical)
  if (
    hypoxiaSeverity === 'critical' ||
    hypoxiaSeverity === 'severe' ||
    perfusion === 'decompensated_shock' ||
    avpu === 'unresponsive' ||
    distressScore >= 7 ||
    dangerScore >= 7
  ) {
    if (hypoxiaSeverity === 'critical' || hypoxiaSeverity === 'severe') reasons.push('Severe/critical hypoxaemia');
    if (distressScore >= 7) reasons.push('Critical respiratory distress score');
    if (dangerScore >= 7) reasons.push('Multiple WHO danger signs');
    if (perfusion === 'decompensated_shock') reasons.push('Decompensated shock');
    if (avpu !== 'alert' && avpu) reasons.push('Altered consciousness');
    return { severity: 'critical', rationale: reasons, priority: 'emergency' };
  }

  // Severe triggers
  if (distressScore >= 4.5 || dangerScore >= 4 || perfusion === 'shock' || avpu === 'pain') {
    if (distressScore >= 4.5) reasons.push('Severe respiratory distress');
    if (dangerScore >= 4)    reasons.push('Multiple danger signs');
    if (perfusion === 'shock') reasons.push('Shock');
    return { severity: 'severe', rationale: reasons, priority: 'emergency' };
  }

  // Moderate triggers
  if (distressScore >= 2 || dangerScore >= 2 || hypoxiaSeverity === 'moderate') {
    if (distressScore >= 2)             reasons.push('Moderate respiratory distress');
    if (hypoxiaSeverity === 'moderate') reasons.push('Hypoxia (SpO₂ <92%)');
    if (dangerScore >= 2)               reasons.push('Some danger signs');
    return { severity: 'moderate', rationale: reasons, priority: 'urgent' };
  }

  // Mild
  if (distressScore > 0 || dangerScore > 0 || hypoxiaSeverity === 'mild') {
    reasons.push('Mild symptoms without danger signs');
    return { severity: 'mild', rationale: reasons, priority: 'urgent' };
  }

  return { severity: 'stable', rationale: ['No significant danger signs identified'], priority: 'routine' };
}


// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function interpretForm(form: PatientForm): ClinicalInterpretation {
  const ageMonths = parseInt(form.biodata?.ageMonths) || 0;
  const v = form.vitals;
  const hpi = form.hpi;
  const ros = form.ros;

  // ── Parse vitals ──────────────────────────────────────────────────────────
  const rr        = parseFloat(v.rr);
  const spo2      = parseFloat(v.spo2);
  const hr        = parseFloat(v.hr);
  const temp      = parseFloat(v.temp);
  const bpRaw     = v.bpSystolic || (v.bp?.split('/')[0] ?? '');
  const bpSystolic = parseInt(bpRaw);
  const muac      = parseFloat(v.muac || form.nutrition?.muac);
  const crt       = parseFloat(v.capRefill);

  const rrValid   = !isNaN(rr);
  const spo2Valid = !isNaN(spo2);
  const hrValid   = !isNaN(hr);
  const tempValid = !isNaN(temp);
  const bpValid   = !isNaN(bpSystolic);
  const muacValid = !isNaN(muac);
  const crtValid  = !isNaN(crt);

  // ── Vitals interpretation ─────────────────────────────────────────────────
  const tachypneaSeverity = rrValid ? assessTachypnea(rr, ageMonths) : 'none';
  const hypoxiaSeverity   = spo2Valid ? assessHypoxia(spo2) : 'none';
  const feverGrade        = tempValid ? assessFever(temp) : 'none';
  const tachycardiaThres  = getTachycardiaThreshold(ageMonths);
  const hypotensionThres  = getHypotensionThreshold(ageMonths);
  const tachypneaThreshold = getTachypneaThreshold(ageMonths);

  const tachycardia  = hrValid && hr > tachycardiaThres;
  const bradycardia  = hrValid && hr < 60;                // ominous — pre-arrest
  const hypotension  = bpValid && bpSystolic < hypotensionThres;
  const hypothermia  = tempValid && temp < 36;
  const shockIndex   = (hrValid && bpValid) ? Math.round((hr / bpSystolic) * 100) / 100 : null;

  const vitals: InterpretedVitals = {
    tachypnea: tachypneaSeverity !== 'none',
    tachypneaSeverity,
    tachypneaThreshold,
    hypoxia: hypoxiaSeverity !== 'none',
    hypoxiaSeverity,
    tachycardia,
    bradycardia,
    fever: feverGrade !== 'none',
    feverGrade,
    hypothermia,
    hypotension,
    shockIndex,
  };

  // ── Respiratory signs ─────────────────────────────────────────────────────
  const indrawing             = !!v.examIndrawing   || !!hpi.chestIndrawing;
  const subcostalIndrawing    = !!(v as any).examSubcostalIndrawing;
  const intercostalIndrawing  = !!(v as any).examIntercostalIndrawing;
  const suprasternalIndrawing = !!(v as any).examSuprasternalIndrawing;
  const grunting              = !!v.examGrunting    || !!hpi.grunting;
  const nasalFlaring          = !!v.examNasalFlaring || !!hpi.nasalFlaring;
  const headBobbing           = !!(v as any).examHeadBobbing || !!hpi.headBobbing;
  const cyanosis              = !!v.cyanosisExam    || !!hpi.cyanoticEpisodes;
  const stridorPresent        = !!v.examStridor     || !!hpi.stridor;
  const accessoryMuscleUse    = !!(v as any).examAccessoryMuscles;

  // Wheeze phase
  let wheezePhase: InterpretedRespiratory['wheezePhase'] = 'none';
  if (v.examWheeze) {
    wheezePhase = (v as any).examWheezePhase || 'expiratory';
  }

  // Stridor phase
  let stridorPhase: InterpretedRespiratory['stridorPhase'] = 'none';
  if (stridorPresent) {
    stridorPhase = hpi.stridorType === 'biphasic' ? 'biphasic' : 'inspiratory';
  }

  // Crackle type
  let crackleType: InterpretedRespiratory['crackleType'] = 'none';
  if (v.examCrackles) {
    crackleType = (v as any).examCrackleType || 'coarse';
  }

  // Breath sounds
  let breathSounds: InterpretedRespiratory['breathSounds'] = 'normal';
  if (v.airEntry === 'absent') breathSounds = 'absent';
  else if (v.examWheeze && v.examCrackles && v.examBronchial) breathSounds = 'bronchial';
  else if (v.examBronchial)  breathSounds = 'bronchial';
  else if (v.examWheeze)     breathSounds = 'wheeze';
  else if (v.examCrackles)   breathSounds = 'crackles';
  else if (v.airEntry?.startsWith('reduced')) breathSounds = 'reduced';
  else if ((v as any).examPleuralRub) breathSounds = 'pleural_rub';

  const addedSounds: string[] = [];
  if (v.examWheeze)            addedSounds.push('wheeze');
  if (v.examCrackles)          addedSounds.push('crackles');
  if (v.examStridor)           addedSounds.push('stridor');
  if (v.examBronchial)         addedSounds.push('bronchial breathing');
  if ((v as any).examPleuralRub) addedSounds.push('pleural rub');

  // Percussion
  let percussion: InterpretedRespiratory['percussion'] = 'resonant';
  if ((v as any).examStonyDull) percussion = 'stony_dull';
  else if (v.examDullness)      percussion = 'dull';
  else if (v.examHyperResonance) percussion = 'hyperresonant';

  // Chest symmetry
  const expansion = (v as any).examChestExpansion || 'symmetrical';
  let chestSymmetry: InterpretedRespiratory['chestSymmetry'] = 'normal';
  if (expansion === 'reduced_left')  chestSymmetry = 'reduced_left';
  else if (expansion === 'reduced_right') chestSymmetry = 'reduced_right';
  else if (v.airEntry === 'reduced_both') chestSymmetry = 'reduced_bilateral';

  // Trachea
  const trachea = ((v as any).examTrachea || 'central') as InterpretedRespiratory['trachea'];
  const tactileFremitus = ((v as any).examFremitus || 'normal') as InterpretedRespiratory['tactileFremitus'];

  // ── Distress composite score ───────────────────────────────────────────────
  const distressScore = computeDistressScore(
    rr, spo2, ageMonths,
    grunting, indrawing, nasalFlaring, headBobbing,
    stridorPresent, breathSounds, cyanosis
  );
  const distressSeverity = scoreToSeverity(distressScore);
  const respiratoryDistress = distressSeverity !== 'none';

  // Work of breathing
  let workOfBreathing: InterpretedRespiratory['workOfBreathing'] = 'normal';
  if (bradycardia && grunting && distressScore >= 7) workOfBreathing = 'exhaustion';
  else if (distressScore >= 4.5) workOfBreathing = 'markedly_increased';
  else if (distressScore >= 2)   workOfBreathing = 'increased';

  // ── Respiratory syndrome ───────────────────────────────────────────────────
  const respiratoryPattern = classifyRespiratorySyndrome(form, ageMonths);

  const respiratory: InterpretedRespiratory = {
    respiratoryDistress,
    distressSeverity,
    distressScore,
    indrawing,
    subcostalIndrawing,
    intercostalIndrawing,
    suprasternalIndrawing,
    grunting,
    nasalFlaring,
    headBobbing,
    cyanosis,
    accessoryMuscleUse,
    breathSounds,
    addedSounds,
    wheezePhase,
    crackleType,
    stridorPresent,
    stridorPhase,
    percussion,
    chestSymmetry,
    trachea,
    tactileFremitus,
    clinicalSyndrome: respiratoryPattern.syndrome,
    syndromeConfidence: respiratoryPattern.confidence,
    syndromeRationale: respiratoryPattern.rationale,
    workOfBreathing,
  };

  // ── Danger signs ───────────────────────────────────────────────────────────
  const dangerSigns = assessDangerSigns(form, ageMonths);

  // ── Perfusion ──────────────────────────────────────────────────────────────
  let perfusion: ClinicalInterpretation['perfusion'] = 'normal';
  if (crtValid && crt >= 3) perfusion = 'prolonged_crt';
  if (hypotension && crtValid && crt >= 3) perfusion = 'shock';
  if (
    (v.avpu && v.avpu !== 'alert' && hypotension) ||
    (bradycardia && hypotension)
  ) {
    perfusion = 'decompensated_shock';
  }

  // ── Hydration ─────────────────────────────────────────────────────────────
  let hydration: ClinicalInterpretation['hydration'] = 'normal';
  if (v.hydration) {
    const h = v.hydration.toLowerCase();
    if (h.includes('severe') || h.includes('>10')) hydration = 'severe_dehydration';
    else if (h.includes('moderate') || h.includes('some') || h.includes('dehydrated') || h.includes('10%') || h.includes('5%')) hydration = 'some_dehydration';
  }

  // ── Nutrition ─────────────────────────────────────────────────────────────
  let nutrition: ClinicalInterpretation['nutrition'] = 'normal';
  if (muacValid) {
    if (muac < 11.5) nutrition = 'SAM';
    else if (muac < 12.5) nutrition = 'MAM';
  }
  if (form.nutrition?.malnutritionSigns?.includes('Bilateral pitting oedema')) {
    nutrition = 'SAM'; // oedema = SAM regardless of MUAC
  }

  // ── Anaemia ───────────────────────────────────────────────────────────────
  let anemia: ClinicalInterpretation['anemia'] = 'none';
  if (v.pallorExam && ros.pallor)     anemia = 'severe';
  else if (v.pallorExam)              anemia = 'moderate';
  else if (ros.pallor)                anemia = 'mild';

  // ── AVPU ──────────────────────────────────────────────────────────────────
  const avpu = v.examConsciousLevel || v.avpu || 'alert';

  // ── Overall severity ──────────────────────────────────────────────────────
  const { severity: overallSeverity, rationale: overallSeverityRationale, priority: actionPriority } =
    classifyOverallSeverity(distressScore, dangerSigns.dangerScore, hypoxiaSeverity, perfusion, avpu);

  // ── Key findings for management note ──────────────────────────────────────
  const keyFindings: string[] = [];
  if (dangerSigns.immediateDangerSigns.length > 0) {
    keyFindings.push(...dangerSigns.immediateDangerSigns);
  }
  if (respiratoryPattern.syndrome !== 'normal') {
    keyFindings.push(`${respiratoryPattern.syndrome.replace(/_/g, ' ')} pattern (${respiratoryPattern.confidence} confidence): ${respiratoryPattern.examPattern}`);
  }
  if (respiratoryPattern.ddxHints.length > 0) {
    keyFindings.push(...respiratoryPattern.ddxHints);
  }
  if (nutrition === 'SAM') keyFindings.push('SAM identified — modify fluid management');
  if (perfusion === 'decompensated_shock' || perfusion === 'shock') keyFindings.push('Circulatory compromise — assess for shock');
  if (bradycardia) keyFindings.push('Bradycardia — pre-arrest sign, escalate immediately');

  return {
    vitals,
    respiratory,
    respiratoryPattern,
    dangerSigns,
    perfusion,
    hydration,
    nutrition,
    anemia,
    avpu,
    ageMonths,
    overallSeverity,
    overallSeverityRationale,
    keyFindings,
    actionPriority,
  };
}