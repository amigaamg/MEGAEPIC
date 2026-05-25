import { PatientForm } from '../../types';
import { ConsultantDiagnosis } from './scorer';
import { runHPIEngine, buildImpactOnLife } from './hpiEngine';
import { ClinicalInterpretation, interpretForm } from './clinicalInterpreter';
import { formatAge } from '../knowledge-graph/reference';

function label(id: string): string {
  const labels: Record<string, string> = {
    cough: 'Cough', fever: 'Fever', wheeze: 'Wheeze',
    difficulty_breathing: 'Difficulty Breathing', stridor: 'Stridor',
    chest_pain: 'Chest Pain', hemoptysis: 'Coughing Blood',
    noisy_breathing: 'Noisy Breathing', reduced_feeding: 'Reduced Feeding',
    lethargy: 'Lethargy', cyanosis: 'Cyanosis', night_sweats: 'Night Sweats',
    weight_loss: 'Weight Loss', nasal_discharge: 'Nasal Discharge',
    sore_throat: 'Sore Throat', chest_tightness: 'Chest Tightness',
    rash: 'Rash', ear_pain: 'Ear Pain', abdominal_pain: 'Abdominal Pain',
    fast_breathing: 'Fast Breathing', poor_feeding: 'Poor Feeding',
    difficulty_feeding: 'Difficult Feeding',
  };
  return labels[id] || id.replace(/_/g, ' ');
}

function listEn(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pron(form: PatientForm) {
  return form.biodata.sex === 'Female'
    ? { sub: 'She', obj: 'her', pos: 'her', ref: 'herself' }
    : { sub: 'He', obj: 'him', pos: 'his', ref: 'himself' };
}

// ── CHIEF COMPLAINTS (chronological, numbered) ─────────────────────────────

function buildChiefComplaints(form: PatientForm): string[] {
  const lines: string[] = [];
  const durations = form.complaintDurations || {};
  const unique = [...new Set(form.complaints)];
  const sorted = [...unique].sort((a, b) => {
    const da = parseInt(durations[a] || '999');
    const db = parseInt(durations[b] || '999');
    return db - da;
  });
  for (let i = 0; i < sorted.length; i++) {
    const cid = sorted[i];
    const dur = durations[cid] ? ` ${durations[cid]} days` : '';
    lines.push(`${i + 1}. ${label(cid)} —${dur}`);
  }
  return lines;
}

// ═════════════════════════════════════════════════════════════════════════════
// CONSULTANT-LEVEL HPI BUILDER
// Structure:
//   1. Opening sentence — age, sex, previously well, first symptom
//   2. Chronological symptom descriptions — each symptom with full SOCRATES
//   3. Pertinent negatives — compressed, consultant-level language, no exam signs
//   4. Healthcare-seeking behaviour
//   5. Impact on daily life
// ═════════════════════════════════════════════════════════════════════════════

export function buildHPI(form: PatientForm, differentials?: ConsultantDiagnosis[]): string {
  const parts: string[] = [];
  const durations = form.complaintDurations || {};
  const unique = [...new Set(form.complaints)];
  const sorted = [...unique].sort((a, b) => {
    const da = parseInt(durations[a] || '999');
    const db = parseInt(durations[b] || '999');
    return db - da;
  });

  if (sorted.length === 0) return 'History of presenting illness not elicited.';

  const p = pron(form);
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;
  const ageStr = ageMonths >= 12 ? `${Math.floor(ageMonths / 12)}-year-old` : `${ageMonths}-month-old`;
  const sex = form.biodata.sex?.toLowerCase() === 'female' ? 'female' : 'male';
  const totalDuration = durations[sorted[0]] || 'several';
  const firstSymptomLabel = label(sorted[0]).toLowerCase();

  // ── 1. OPENING ──────────────────────────────────────────────────────────
  const wellClause = form.hpi.onsetType === 'sudden'
    ? `who was apparently well until ${totalDuration} days prior to admission when ${p.sub.toLowerCase()} developed ${firstSymptomLabel}`
    : form.hpi.onsetType === 'gradual'
    ? `who was previously well until ${totalDuration} days prior to admission when ${p.sub.toLowerCase()} developed ${firstSymptomLabel}`
    : `presented with ${firstSymptomLabel} of ${totalDuration} days duration`;
  parts.push(`The child is a ${ageStr} ${sex} ${wellClause}.`);

  // ── 2. CHRONOLOGICAL SYMPTOM DESCRIPTIONS ──────────────────────────────
  let prevDuration = totalDuration;
  for (const cid of sorted) {
    const desc = describeSymptom(cid, form, durations, prevDuration, p);
    if (desc) {
      parts.push(desc);
      if (durations[cid]) prevDuration = durations[cid];
    }
  }

  // ── ADDITIONAL SYMPTOMS FROM HPI FIELDS (not in chief complaints) ──
  // Fever may be documented in HPI fields even if not a presenting complaint
  if (!sorted.includes('fever') && (form.hpi.highFever || form.hpi.feverPattern || form.hpi.seizureHPI || form.hpi.nightSweats)) {
    const feverDesc = describeFever(form, durations, prevDuration, p);
    if (feverDesc) parts.push(feverDesc);
  }

  // ── 3. PERTINENT NEGATIVES (compressed, consultant-level) ───────────
  if (differentials && differentials.length > 0) {
    const exclusion = buildPertinentNegatives(form, differentials);
    if (exclusion) parts.push(exclusion);
  }

  // ── 4. HEALTHCARE-SEEKING BEHAVIOUR ────────────────────────────────
  const hcs = buildHealthcareSeeking(form, p);
  if (hcs) parts.push(hcs);

  // ── 5. IMPACT ON DAILY LIFE ────────────────────────────────────────
  const impact = buildLifeImpact(form, p);
  if (impact) parts.push(impact);

  return parts.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// PER-SYMPTOM DESCRIPTIONS (concise, 2-4 sentences each)
// ═══════════════════════════════════════════════════════════════════════════

function describeSymptom(
  symptomId: string, form: PatientForm,
  durations: Record<string, string>, prevDuration: string,
  p: ReturnType<typeof pron>,
): string | null {
  switch (symptomId) {
    case 'fever': return describeFever(form, durations, prevDuration, p);
    case 'cough': return describeCough(form, durations, prevDuration, p);
    case 'difficulty_breathing': return describeDyspnea(form, durations, prevDuration, p);
    case 'wheeze': return describeWheeze(form, durations, prevDuration, p);
    case 'stridor': return describeStridor(form, durations, prevDuration, p);
    case 'chest_pain': return describeChestPain(form, durations, prevDuration, p);
    case 'nasal_discharge': return describeNasalDischarge(form, durations, prevDuration, p);
    case 'fast_breathing': return describeFastBreathing(form, durations, prevDuration, p);
    case 'hemoptysis': return describeHemoptysis(form, durations, prevDuration, p);
    case 'noisy_breathing': return describeNoisyBreathing(form, durations, prevDuration, p);
    case 'lethargy': return null; // handled in impact section
    case 'cyanosis': return describeCyanosis(form, durations, prevDuration, p);
    case 'night_sweats': return describeNightSweats(form, durations, prevDuration, p);
    case 'weight_loss': return describeWeightLoss(form, durations, prevDuration, p);
    case 'sore_throat': return describeSoreThroat(form, durations, prevDuration, p);
    case 'chest_tightness': return describeChestTightness(form, durations, prevDuration, p);
    case 'rash': return describeRash(form, durations, prevDuration, p);
    case 'ear_pain': return describeEarPain(form, durations, prevDuration, p);
    case 'abdominal_pain': return describeAbdominalPain(form, durations, prevDuration, p);
    case 'reduced_feeding': return describeReducedFeeding(form, durations, prevDuration, p);
    default: return null;
  }
}

function temporalTransition(dur: string, prevDuration: string): string {
  const durNum = parseInt(dur);
  const prevNum = parseInt(prevDuration);
  if (!isNaN(durNum) && !isNaN(prevNum) && durNum < prevNum) {
    const diff = prevNum - durNum;
    return diff === 1 ? 'The following day' : `${diff} days later`;
  }
  return '';
}

// ── FEVER ─── Full SOCRATES++ characterisation ─────────────────────────────

function describeFever(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['fever'] || '';
  const trans = temporalTransition(dur, prevDuration);
  const pattern = form.hpi.feverPattern?.toLowerCase() || 'continuous';
  const response = form.hpi.txResponse?.includes('good')
    ? 'and was well relieved by antipyretics'
    : (form.hpi.txResponse?.includes('partial') || form.hpi.txResponse?.includes('no change'))
    ? 'and was only partially relieved by antipyretics'
    : '';

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, ${p.sub.toLowerCase()} developed fever which gradually increased in severity and was ${pattern} in pattern${response ? ', ' + response : ''}.`);
  } else {
    parts.push(`Fever was noted, which gradually increased in severity and was ${pattern} in pattern${response ? ', ' + response : ''}.`);
  }

  // Associated symptoms
  const associated: string[] = [];
  if (form.hpi.irritability) associated.push('irritability');
  if (form.ros.lethargyRos) associated.push('reduced playfulness');
  if (form.hpi.seizureHPI) associated.push('convulsions');
  if (form.hpi.sickContact) associated.push('rigors');
  if (associated.length > 0) {
    parts.push(`This was accompanied by ${listEn(associated)}.`);
  }

  return parts.join(' ');
}

// ── COUGH ─── Full SOCRATES++ characterisation ─────────────────────────────

function describeCough(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['cough'] || '';
  const trans = temporalTransition(dur, prevDuration);
  const char = form.hpi.coughChar?.toLowerCase() || '';

  const parts: string[] = [];

  // Onset
  if (trans) {
    parts.push(`${trans}, ${p.sub.toLowerCase()} developed an acute onset cough.`);
  } else {
    parts.push(`An acute onset cough developed.`);
  }

  // Character & progression
  if (char === 'barking') {
    parts.push(`The cough had a barking seal-like quality with associated hoarseness.`);
  } else if (char === 'whooping') {
    parts.push(`The cough occurred in paroxysms with a whooping quality and post-tussive vomiting.`);
  } else if (char === 'productive' || char === 'wet') {
    parts.push(`Initially mild and intermittent, the cough progressively became frequent and distressing, with the caregiver describing a "wet chest" sound though the child was unable to expectorate sputum due to age.`);
  } else {
    parts.push(`Initially mild and intermittent, the cough progressively became frequent and distressing.`);
  }

  // Nocturnal pattern
  if (form.hpi.nocturnalCough) {
    parts.push(`It was notably worse at night, disturbing sleep.`);
  }

  // Post-tussive vomiting
  if (form.hpi.postTussiveVomiting && char !== 'whooping') {
    parts.push(`Post-tussive vomiting was also noted.`);
  }

  return parts.join(' ');
}

// ── DIFFICULTY BREATHING ───────────────────────────────────────────────────

function describeDyspnea(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['difficulty_breathing'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, the caregiver noted progressive difficulty in breathing.`);
  } else {
    parts.push(`Around the same period, ${p.sub.toLowerCase()} developed progressive difficulty in breathing with fast breathing and increasing breathing effort.`);
  }

  if (form.hpi.orthopnea) {
    parts.push(`The breathing difficulty was worse when lying flat, requiring propping up with pillows.`);
  }

  if (form.hpi.feedingDiff) {
    parts.push(`Feeding sessions became shorter than usual as the child fatigued easily and frequently paused to breathe, although ${p.sub.toLowerCase()} remained able to take small amounts of fluids.`);
  }

  return parts.join(' ');
}

// ── WHEEZE ─────────────────────────────────────────────────────────────────

function describeWheeze(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['wheeze'] || '';
  const trans = temporalTransition(dur, prevDuration);
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;
  const isFirst = form.hpi.wheezePattern === 'first' || !form.hpi.wheezePattern;
  const isRecurrent = form.hpi.wheezePattern === 'recurrent';

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, wheeze was noted.`);
  } else {
    parts.push(`Wheeze was noted.`);
  }

  if (isFirst) {
    parts.push(`This is a first wheezing episode.`);
  } else if (isRecurrent) {
    parts.push(`The wheeze is recurrent in nature with previous similar episodes.`);
  }

  if (form.hpi.unilateralWheeze) {
    parts.push(`The wheeze was unilateral.`);
  }

  return parts.join(' ');
}

// ── STRIDOR ─────────────────────────────────────────────────────────────────

function describeStridor(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['stridor'] || '';
  const trans = temporalTransition(dur, prevDuration);
  const phase = form.hpi.stridorType === 'biphasic' ? 'biphasic' : 'predominantly inspiratory';
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, stridor was noted.`);
  } else {
    parts.push(`Stridor was noted.`);
  }

  parts.push(`The stridor was ${phase} in nature.`);

  if (form.hpi.coughChar === 'barking') {
    parts.push(`An associated barking cough was also noted.`);
  }

  if (form.hpi.drooling) {
    parts.push(`Drooling was also noted.`);
  }

  return parts.join(' ');
}

// ── CHEST PAIN ─────────────────────────────────────────────────────────────

function describeChestPain(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['chest_pain'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, chest pain was reported.`);
  } else {
    parts.push(`Chest pain was reported.`);
  }

  if (form.hpi.pleuriticPain) {
    parts.push(`The pain was pleuritic in nature, sharp and aggravated by deep breathing and coughing.`);
  }
  if (form.hpi.suddenOnset) {
    parts.push(`The onset was sudden.`);
  }

  return parts.join(' ');
}

// ── NASAL DISCHARGE ────────────────────────────────────────────────────────

function describeNasalDischarge(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['nasal_discharge'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, mild rhinorrhea was noted.`);
  } else {
    parts.push(`Mild nasal discharge was noted.`);
  }
  if (form.hpi.recentURTI) {
    parts.push(`This preceded the lower respiratory symptoms.`);
  }

  return parts.join(' ');
}

// ── FAST BREATHING ─────────────────────────────────────────────────────────

function describeFastBreathing(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['fast_breathing'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, fast breathing was noted.`);
  } else {
    parts.push(`Fast breathing was noted, persistent and associated with increased work of breathing.`);
  }

  return parts.join(' ');
}

// ── HEMOPTYSIS ─────────────────────────────────────────────────────────────

function describeHemoptysis(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['hemoptysis'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, haemoptysis was noted.`);
  } else {
    parts.push(`Haemoptysis was reported.`);
  }
  parts.push(`The caregiver noted blood-tinged sputum on several occasions.`);

  return parts.join(' ');
}

// ── NOISY BREATHING ────────────────────────────────────────────────────────

function describeNoisyBreathing(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['noisy_breathing'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, noisy breathing was noted.`);
  } else {
    parts.push(`Noisy breathing was reported by the caregiver.`);
  }

  return parts.join(' ');
}

// ── CYANOSIS ───────────────────────────────────────────────────────────────

function describeCyanosis(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['cyanosis'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, cyanotic episodes were noted.`);
  } else {
    parts.push(`Cyanotic episodes were reported.`);
  }
  parts.push(`The caregiver describes ${p.obj.toLowerCase()} turning blue around the lips and face, particularly during crying or feeding.`);

  return parts.join(' ');
}

// ── NIGHT SWEATS ───────────────────────────────────────────────────────────

function describeNightSweats(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const parts: string[] = [];
  parts.push(`There were notable night sweats with ${p.obj.toLowerCase()} waking up drenched.`);
  return parts.join(' ');
}

// ── WEIGHT LOSS ────────────────────────────────────────────────────────────

function describeWeightLoss(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const parts: string[] = [];
  parts.push(`There has been reported weight loss with poor appetite over the course of the illness.`);
  return parts.join(' ');
}

// ── SORE THROAT ────────────────────────────────────────────────────────────

function describeSoreThroat(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['sore_throat'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, sore throat was reported.`);
  } else {
    parts.push(`Sore throat was reported.`);
  }

  return parts.join(' ');
}

// ── CHEST TIGHTNESS ────────────────────────────────────────────────────────

function describeChestTightness(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['chest_tightness'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, chest tightness was reported.`);
  } else {
    parts.push(`Chest tightness was reported.`);
  }

  return parts.join(' ');
}

// ── RASH ───────────────────────────────────────────────────────────────────

function describeRash(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['rash'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, a rash was noted.`);
  } else {
    parts.push(`A rash was reported.`);
  }

  return parts.join(' ');
}

// ── EAR PAIN ────────────────────────────────────────────────────────────────

function describeEarPain(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['ear_pain'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, ear pain was reported.`);
  } else {
    parts.push(`Ear pain was reported.`);
  }

  return parts.join(' ');
}

// ── ABDOMINAL PAIN ─────────────────────────────────────────────────────────

function describeAbdominalPain(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const dur = durations['abdominal_pain'] || '';
  const trans = temporalTransition(dur, prevDuration);

  const parts: string[] = [];
  if (trans) {
    parts.push(`${trans}, abdominal pain was reported.`);
  } else {
    parts.push(`Abdominal pain was reported.`);
  }

  return parts.join(' ');
}

// ── REDUCED FEEDING ─────────────────────────────────────────────────────────

function describeReducedFeeding(
  form: PatientForm, durations: Record<string, string>,
  prevDuration: string, p: ReturnType<typeof pron>,
): string {
  const parts: string[] = [];
  if (form.hpi.feedingDiff) {
    parts.push(`${p.sub} has been feeding poorly, tiring easily during breastfeeding with frequent pauses due to breathlessness.`);
  } else {
    parts.push(`Appetite has been markedly reduced, though ${p.sub.toLowerCase()} was still able to take small amounts of fluids.`);
  }
  return parts.join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════
// CLINICAL PICTURE SUMMARY (dominant features only, no diagnostic conclusion)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// PERTINENT NEGATIVES — Only explicitly documented negatives are included.
// Fields set to `undefined` (not asked) are SKIPPED — silence is not absence.
// ═══════════════════════════════════════════════════════════════════════════

function buildPertinentNegatives(form: PatientForm, _differentials: ConsultantDiagnosis[]): string {
  const paragraphs: string[] = [];
  const denied = (v: boolean | undefined): v is false => v === false;

  // ── Paragraph 1: Prior episodes, triggers, reactive airway ──
  const prior: string[] = [];
  const hasWheezeComplaint = form.complaints.includes('wheeze');
  if (!hasWheezeComplaint && !form.pmh.asthmaDx) {
    if (denied(form.hpi.nocturnalCough)) prior.push('recurrent nocturnal cough');
    if (denied(form.hpi.exerciseTriggered) && denied(form.hpi.allergenTrigger)) {
      prior.push('symptoms triggered by cold exposure, dust, or exertion');
    }
  }
  if (prior.length > 0) {
    paragraphs.push('There is no history of ' + prior.join(', ') + '.');
  }

  // ── Paragraph 2: Cough character, stridor, drooling ──
  const coughNegs: string[] = [];
  const coughCharSet = form.hpi.coughChar && form.hpi.coughChar.length > 0;

  if (coughCharSet) {
    if (form.hpi.coughChar !== 'barking') {
      coughNegs.push('the cough was not barking in quality with no associated hoarseness or stridor');
    }
    if (form.hpi.coughChar !== 'whooping' && denied(form.hpi.postTussiveVomiting)) {
      coughNegs.push('the cough was not paroxysmal with no post-tussive vomiting, inspiratory whoop, or cyanotic spells');
    }
  }
  if (denied(form.hpi.drooling) && denied(form.hpi.tripodPosition)) {
    coughNegs.push('no drooling or tripod posture');
  }
  if (denied(form.hpi.suddenOnset)) {
    coughNegs.push('no preceding choking episode or abrupt onset');
  }
  if (coughNegs.length >= 2) {
    paragraphs.push(coughNegs.join(' and ') + '.');
  }

  // ── Paragraph 3: Chronic/TB pattern ──
  const coughDurSet = form.hpi.coughDuration && form.hpi.coughDuration.length > 0;
  const isChronic = coughDurSet && (form.hpi.coughDuration === 'chronic' || form.hpi.coughDuration === '>=14_days' || form.hpi.coughDuration === 'over_2_weeks');
  if (coughDurSet && !isChronic && denied(form.hpi.tbContact) && denied(form.hpi.weightLoss) && denied(form.hpi.nightSweats)) {
    paragraphs.push('There is no history of chronic cough, prolonged fever, night sweats, or known tuberculosis exposure.');
  }

  // ── Paragraph 4: Cardiac/baseline ──
  const cardiacNegs: string[] = [];
  if (denied(form.hpi.sweatingFeeds)) {
    cardiacNegs.push('excessive sweating during feeds prior to this illness');
  }
  if (denied(form.hpi.cyanoticEpisodes)) {
    cardiacNegs.push('bluish discoloration of the lips');
  }
  if (denied(form.hpi.feedingDiff)) {
    cardiacNegs.push('feeding difficulties prior to this illness');
  }
  if (cardiacNegs.length >= 2) {
    paragraphs.push('There is no background history of ' + cardiacNegs.join(', ') + '.');
  }

  if (paragraphs.length === 0) return '';

  return paragraphs.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTHCARE-SEEKING BEHAVIOUR
// ═══════════════════════════════════════════════════════════════════════════

function buildHealthcareSeeking(form: PatientForm, p: ReturnType<typeof pron>): string {
  const parts: string[] = [];
  if (form.hpi.prevTx) {
    const resp = form.hpi.txResponse || '';
    let responseStr = '';
    if (resp === 'improved' || resp === 'improved_fully') responseStr = 'with initial improvement followed by recurrence of symptoms';
    else if (resp === 'worsened') responseStr = 'but there was no improvement — the symptoms progressively worsened';
    else if (resp === 'not given' || resp === 'not_yet_given') responseStr = 'with uncertain response';
    else if (resp === 'partial' || resp === 'partially_improved') responseStr = 'with partial response';
    else if (resp === 'none' || resp === 'no_change') responseStr = 'with no significant change';
    const respClause = responseStr ? `, ${responseStr}` : '';
    parts.push(`Before presentation, ${p.sub.toLowerCase()} received ${form.hpi.prevTx}${respClause}.`);
  }
  if (form.hpi.sickContactDetail) {
    parts.push(form.hpi.sickContactDetail.endsWith('.') ? form.hpi.sickContactDetail : form.hpi.sickContactDetail + '.');
  }
  return parts.join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPACT ON DAILY LIFE
// ═══════════════════════════════════════════════════════════════════════════

function buildLifeImpact(form: PatientForm, p: ReturnType<typeof pron>): string {
  const impacts: string[] = [];

  if (form.hpi.feedingDiff) {
    impacts.push(`${p.sub.toLowerCase()} has been feeding poorly, tiring easily and stopping frequently`);
  }

  if (form.hpi.nocturnalCough) {
    impacts.push(`sleep is disturbed by the cough, with frequent night-time waking`);
  }

  if (form.ros.lethargyRos || form.complaints.includes('lethargy')) {
    impacts.push(`${p.sub.toLowerCase()} is less active than usual, preferring to be held rather than play`);
  }

  if (form.nutrition.appetite?.toLowerCase().includes('poor') || form.nutrition.appetite?.toLowerCase().includes('decreased')) {
    impacts.push(`overall appetite is poor`);
  }

  if (form.family.schoolAttendance?.toLowerCase().includes('miss') || form.family.schoolAttendance?.toLowerCase().includes('absent')) {
    impacts.push(`school or daycare attendance has been affected`);
  }

  if (impacts.length === 0) return '';

  const name = form.biodata.patientName || 'The child';
  return `The current illness has impacted ${p.pos.toLowerCase()} daily life: ${listEn(impacts)}.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// NEGATIVES (per-symptom, used for ROS, not included in HPI narrative)
// ═══════════════════════════════════════════════════════════════════════════

// ── SYSTEMS REVIEW ───────────────────────────────────────────────────────────

function buildSystemsReview(form: PatientForm): string {
  const rosFields: string[] = [];
  const ros = form.ros || {} as any;

  if (ros.lethargyRos) rosFields.push('lethargy');
  if (ros.vomiting) rosFields.push('vomiting');
  if (ros.diarrhea) rosFields.push('diarrhoea');
  if (ros.rash) rosFields.push('rash');
  if (ros.seizures) rosFields.push('seizures');
  if (ros.headache) rosFields.push('headache');
  if (ros.abdominalPain) rosFields.push('abdominal pain');
  if (ros.earPain) rosFields.push('ear pain');
  if (ros.soreThroatRos) rosFields.push('sore throat');
  if (ros.nasalDischargeRos) rosFields.push('nasal congestion');
  if ((ros as any).neckStiffnessRos) rosFields.push('neck stiffness');

  if (rosFields.length > 0) {
    return `Positive findings on review of systems: ${listEn(rosFields)}.`;
  }
  return 'Review of systems not documented.';
}

// ── MAIN ENTRY ──────────────────────────────────────────────────────────────

export function buildClinicalNote(
  form: PatientForm,
  differentials: ConsultantDiagnosis[],
): string {
  const interpretation = interpretForm(form);
  const hpiOut = runHPIEngine(form, differentials);

  const ageMonths = parseInt(form.biodata.ageMonths);
  const ageStr = isNaN(ageMonths) ? '' : formatAge(ageMonths);
  const sex = form.biodata.sex?.toLowerCase() === 'male' ? 'Male' : form.biodata.sex?.toLowerCase() === 'female' ? 'Female' : '';
  const name = form.biodata.patientName || 'Unknown';
  const ident = [name, ageStr, sex].filter(Boolean).join(', ');

  const lines: string[] = [];

  // ── HEADER ────────────────────────────────────────────────────────────────
  lines.push('\u2500'.repeat(60));
  lines.push(`AMEXAN CLINICAL NOTE`);
  lines.push(ident);
  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  lines.push('\u2500'.repeat(60));
  lines.push('');

  // ── CHIEF COMPLAINTS ──────────────────────────────────────────────────────
  if (form.complaints.length > 0) {
    lines.push('CHIEF COMPLAINTS');
    lines.push(...buildChiefComplaints(form));
    lines.push('');
  }

  // ── HISTORY OF PRESENTING ILLNESS ─────────────────────────────────────────
  lines.push('HISTORY OF PRESENTING ILLNESS');
  lines.push(buildHPI(form, differentials));

  const hasSufficientData = form.complaints.length > 0;

  // Missing critical questions — only if clinical data exists
  if (hasSufficientData && hpiOut.missingCriticalQuestions.length > 0) {
    lines.push('');
    lines.push('Missing critical questions:');
    for (const q of hpiOut.missingCriticalQuestions) {
      lines.push(`  - ${q}`);
    }
  }
  lines.push('');

  // ── SYSTEMS REVIEW ────────────────────────────────────────────────────────
  lines.push('REVIEW OF SYSTEMS');
  lines.push(buildSystemsReview(form));
  lines.push('');

  // ── CLINICAL INTERPRETATION ──────────────────────────────────────────────
  const interpSummary = interpretation ? buildInterpretationSummary(interpretation, form).trim() : '';
  if (interpSummary) {
    lines.push('CLINICAL INTERPRETATION');
    lines.push(interpSummary);
    lines.push('');
  }

  // ── DIFFERENTIAL DIAGNOSES — only if sufficient clinical data ──────────
  if (hasSufficientData && differentials.length > 0) {
    lines.push('DIFFERENTIAL DIAGNOSES');
    lines.push(`  Primary: ${differentials[0].disease.name} (${(differentials[0].probability * 100).toFixed(0)}%)`);
    for (let i = 1; i < Math.min(differentials.length, 4); i++) {
      lines.push(`  ${i + 1}. ${differentials[i].disease.name} (${(differentials[i].probability * 100).toFixed(0)}%)`);
    }
    lines.push('');

    lines.push('DDX DISCUSSION');
    lines.push(hpiOut.ddxDiscussion || 'No differential discussion available.');
    lines.push('');

    if (hpiOut.complicationsDiscussion) {
      lines.push('COMPLICATIONS');
      lines.push(hpiOut.complicationsDiscussion);
      lines.push('');
    }
  }

  // ── SUMMARY — only if sufficient clinical data ─────────────────────────
  if (hasSufficientData) {
    lines.push('SUMMARY');
    lines.push(hpiOut.summaryStatement || buildFallbackSummary(form, differentials));
    lines.push('');
  }

  // ── IMPACT ON LIFE ────────────────────────────────────────────────────────
  const impact = buildImpactOnLife(form);
  if (impact) {
    lines.push('IMPACT ON LIFE');
    lines.push(impact);
    lines.push('');
  }

  lines.push('\u2500'.repeat(60));
  lines.push('Generated by AMEXAN Paediatric Clinical Decision Support System');
  lines.push('Based on Kenyan Paediatric Management Guidelines.');

  return lines.join('\n');
}

// ── CLINICAL INTERPRETATION SUMMARY ─────────────────────────────────────────

function buildInterpretationSummary(interp: ClinicalInterpretation, form: PatientForm): string {
  const lines: string[] = [];

  const v = interp.vitals;
  const vitalsStr: string[] = [];
  if (v.fever) vitalsStr.push(`Fever: ${v.feverGrade}`);
  if (v.tachypnea) vitalsStr.push(`Tachypnea: ${v.tachypneaSeverity}`);
  if (v.hypoxia) vitalsStr.push(`Hypoxia: ${v.hypoxiaSeverity}`);
  if (v.tachycardia) vitalsStr.push('Tachycardia');
  if (v.hypotension) vitalsStr.push('Hypotension');
  if (vitalsStr.length > 0) lines.push(`  Vitals: ${vitalsStr.join(', ')}.`);

  const r = interp.respiratory;
  if (r.respiratoryDistress) {
    lines.push(`  Respiratory distress: ${r.distressSeverity} (score ${r.distressScore}/10).`);
  }

  const ds = interp.dangerSigns;
  const whoDangerSignsStr = ds.whoDangerSigns.filter(d => d.present).map(d => d.sign);
  if (whoDangerSignsStr.length > 0) {
    lines.push(`  WHO danger signs: ${listEn(whoDangerSignsStr)}.`);
  }
  if (ds.immediateDangerSigns.length > 0) {
    lines.push(`  Immediate danger signs: ${listEn(ds.immediateDangerSigns)}.`);
  }

  // Only assert perfusion/nutrition if there is source data
  const hasCapRefill = form.vitals.capRefill && form.vitals.capRefill.length > 0;
  if (hasCapRefill || interp.perfusion !== 'normal') {
    lines.push(`  Perfusion: ${interp.perfusion}.`);
  }
  const hasMuac = (form.vitals.muac && form.vitals.muac.length > 0) || (form.nutrition?.muac && form.nutrition.muac.length > 0);
  if (hasMuac || interp.nutrition !== 'normal') {
    lines.push(`  Nutrition: ${interp.nutrition}.`);
  }

  return lines.join('\n');
}

function buildFallbackSummary(form: PatientForm, _differentials: ConsultantDiagnosis[]): string {
  const ageMonths = parseInt(form.biodata.ageMonths);
  const ageStr = isNaN(ageMonths) ? '' : formatAge(ageMonths).replace(/^a\s+/i, '');
  const sex = form.biodata.sex?.toLowerCase() === 'male' ? 'male' : form.biodata.sex?.toLowerCase() === 'female' ? 'female' : '';
  const complaints = form.complaints.map(c => label(c).toLowerCase());
  const ccStr = complaints.length > 0 ? listEn(complaints) : 'respiratory symptoms';
  const ident = [ageStr, sex].filter(Boolean).join(' ');
  const prefix = ident ? `A ${ident} child presenting with` : 'Presenting with';
  return `${prefix} ${ccStr}.`;
}
