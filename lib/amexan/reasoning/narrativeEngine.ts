// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Narrative Engine
// Generates a structured, well-phrased HPI from the EncounterState.
// Important negatives are included automatically by reading LR− values.
// No question is asked twice — CC-sourced features appear only in narrative.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, CandidateDiseaseState, AnswerRecord } from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { ABDOMINAL_PAIN_DISEASE_MAP } from '../knowbase/diseases/abdominalPainNodes';

export interface HpiNarrative {
  introduction: string;
  painHistory: string;               // Onset, location, character, timing
  progression: string;               // How it evolved over time
  associatedSymptoms: string;        // Nausea, vomiting, fever, bowel habits
  importantNegatives: string;        // Features whose absence rules out key diagnoses
  riskFactors: string;               // Relevant risk factors
  differentialSummary: string;       // Ranked DDx
  redFlags: string;                  // Any triggered red flags
  fullNarrative: string;             // Combined clinical prose
}

/** Convert an answer to narrative text */
function describeAnswer(answer: AnswerRecord): string {
  const feature = FEATURES[answer.featureId];
  const value = String(answer.value);

  if (!feature) return `${answer.featureId}: ${value}`;

  if (answer.polarity === 'present') {
    if (feature.type === 'select') {
      return value;
    }
    if (feature.type === 'boolean') {
      return `positive for ${feature.shortLabel}`;
    }
    return value;
  }
  return `no ${feature.shortLabel}`;
}

/** Generate the pain history section */
function generatePainHistory(state: EncounterState): string {
  const onset = state.answers.find(a => a.featureId === 'pain_onset');
  const initLoc = state.answers.find(a => a.featureId === 'pain_initial_location');
  const currLoc = state.answers.find(a => a.featureId === 'pain_location_now');
  const migration = state.answers.find(a => a.featureId === 'pain_migration');
  const character = state.answers.find(a => a.featureId === 'pain_character');
  const radiation = state.answers.find(a => a.featureId === 'pain_radiation');
  const severity = state.answers.find(a => a.featureId === 'pain_severity');

  const parts: string[] = [];

  // Onset
  if (onset) {
    parts.push(`The pain began ${onset.value as string}.`);
  } else {
    parts.push('The onset of pain has not been characterised.');
  }

  // Initial location
  if (initLoc) {
    parts.push(`It was initially felt in the ${(initLoc.value as string).toLowerCase()}.`);
  }

  // Migration
  if (migration) {
    parts.push(`The pain ${(migration.value as string).toLowerCase()}.`);
  }

  // Current location
  if (currLoc) {
    parts.push(`It is now located in the ${(currLoc.value as string).toLowerCase()}.`);
  }

  // Character
  if (character) {
    const val = (character.value as string).toLowerCase();
    if (val.includes('colicky') || val.includes('cramp')) {
      parts.push(`The pain is colicky (wavelike), consistent with hollow viscus obstruction.`);
    } else if (val.includes('tearing') || val.includes('ripping')) {
      parts.push(`The pain is tearing in nature, raising concern for a vascular catastrophe.`);
    } else if (val.includes('sharp') || val.includes('stabb')) {
      parts.push(`The pain is sharp and constant, suggesting inflammation or ischaemia.`);
    } else if (val.includes('burn')) {
      parts.push(`The pain is burning in quality, suggestive of peptic or mucosal inflammation.`);
    } else {
      parts.push(`The pain is described as ${val}.`);
    }
  }

  // Radiation
  if (radiation) {
    const radVal = (radiation.value as string).toLowerCase();
    if (radVal.includes('back')) {
      parts.push(`It radiates to the back, characteristic of pancreatic or retroperitoneal pathology.`);
    } else if (radVal.includes('shoulder')) {
      parts.push(`It radiates to the shoulder, suggesting diaphragmatic irritation (biliary or subphrenic).`);
    } else if (radVal.includes('groin')) {
      parts.push(`It radiates to the groin, typical of ureteric colic.`);
    } else {
      parts.push(`It radiates ${radVal}.`);
    }
  }

  // Severity
  if (severity) {
    const s = typeof severity.value === 'number' ? severity.value : parseInt(severity.value as string);
    if (s >= 8) {
      parts.push(`The pain is severe (${s}/10), out of proportion to clinical findings in some contexts.`);
    } else if (s >= 5) {
      parts.push(`The pain is moderate to severe (${s}/10).`);
    } else {
      parts.push(`The pain is mild (${s}/10).`);
    }
  }

  return parts.join(' ');
}

/** Get a single answer value helper */
function ans(state: EncounterState, fid: string): AnswerRecord | undefined {
  return state.answers.find(a => a.featureId === fid);
}
function isPresent(a: AnswerRecord | undefined): boolean {
  if (!a) return false;
  return a.polarity === 'present' || String(a.value).toLowerCase() === 'true' || String(a.value).startsWith('Yes');
}

/** Generate associated symptoms section with full characterization */
function generateAssociatedSymptoms(state: EncounterState): string {
  const symptoms: string[] = [];
  const a = (fid: string) => ans(state, fid);

  const nausea = a('nausea');
  const vomiting = a('vomiting');
  const vomitTiming = a('vomiting_timing');
  const vomitDesc = a('vomiting_description');
  const vomitFreq = a('vomiting_frequency');
  const vomitBilious = a('vomiting_bilious');
  const vomitProjectile = a('vomiting_projectile');
  const vomitRelief = a('vomiting_relief');
  const vomitEating = a('vomiting_relation_to_eating');
  const vomitingForce = a('vomiting_force');
  const anorexia = a('anorexia');
  const anorexiaSev = a('anorexia_severity');
  const fever = a('fever');
  const chills = a('fever_chills');
  const feverPattern = a('fever_pattern');
  const feverTemp = a('fever_temperature');
  const feverDuration = a('fever_duration_days');
  const bowel = a('bowel_habits');
  const obstipation = a('obstipation');
  const constipation = a('constipation');
  const constDur = a('constipation_duration_days');
  const constStool = a('constipation_stool_consistency');
  const constStrain = a('constipation_straining');
  const diarrhea = a('diarrhea');
  const diarrheaFreq = a('diarrhea_frequency');
  const diarrheaConsist = a('diarrhea_consistency');
  const diarrheaNoct = a('diarrhea_nocturnal');
  const diarrheaVolume = a('diarrhea_volume');
  const jaundice = a('jaundice');
  const jaundOnset = a('jaundice_onset');
  const jaundProg = a('jaundice_progression');
  const jaundItch = a('jaundice_pruritus');
  const jaundUrine = a('jaundice_dark_urine');
  const jaundStool = a('jaundice_pale_stool');
  const distension = a('abdominal_distension');
  const distOnset = a('distension_onset');
  const distProg = a('distension_progression');
  const distGas = a('distension_gas_passage_relief');
  const distPain = a('distension_pain_relation');
  const dysphagia = a('dysphagia');
  const dysphSolLiq = a('dysphagia_solids_liquids');
  const dysphProg = a('dysphagia_progressive');
  const dysphOdyn = a('dysphagia_odynophagia');
  const dysphLevel = a('dysphagia_level');
  const dysphRegurg = a('dysphagia_regurgitation');
  const hematemesis = a('hematemesis');
  const hemVol = a('hematemesis_volume');
  const hemColor = a('hematemesis_color');
  const hemFreq = a('hematemesis_frequency');
  const melena = a('melena');
  const melFreq = a('melena_frequency');
  const melVol = a('melena_volume');
  const melDur = a('melena_duration_days');
  const melHemat = a('melena_hematemesis_association');
  const hemato = a('hematochezia');
  const hVol = a('hematochezia_volume');
  const hColor = a('hematochezia_color');
  const hRel = a('hematochezia_relation_to_stool');
  const hFreq = a('hematochezia_frequency');
  const heartburn = a('heartburn');
  const hbFreq = a('heartburn_frequency');
  const hbMeals = a('heartburn_relation_to_meals');
  const hbNoct = a('heartburn_nocturnal');
  const hbRegurg = a('heartburn_regurgitation');
  const dysuria = a('dysuria');
  const dysChar = a('dysuria_character');
  const dysTiming = a('dysuria_timing');
  const hematuria = a('hematuria');
  const hemVis = a('hematuria_visible');
  const hemPain = a('hematuria_painful');
  const hemTiming = a('hematuria_timing');
  const hemClots = a('hematuria_clots');
  const vagBleed = a('vaginal_bleeding');
  const vagVol = a('vaginal_bleeding_volume');
  const vagPeriod = a('vaginal_bleeding_relation_to_period');
  const vagDur = a('vaginal_bleeding_duration_days');
  const vagColor = a('vaginal_bleeding_color');
  const vagDisc = a('vaginal_discharge');
  const vdColor = a('vaginal_discharge_color');
  const vdOdor = a('vaginal_discharge_odor');
  const vdConsist = a('vaginal_discharge_consistency');
  const vdItch = a('vaginal_discharge_itching');
  const bladder = a('urinary_retention');
  const blAcuity = a('urinary_retention_acuity');
  const blPain = a('urinary_retention_painful');
  const blHes = a('urinary_retention_hesitancy');
  const blWeak = a('urinary_retention_weak_stream');
  const bloating = a('bloating');
  const blMeals = a('bloating_relation_to_meals');
  const blTiming = a('bloating_timing');
  const blGas = a('bloating_relief_gas');
  const nauseaSev = a('nausea_severity');
  const nauseEating = a('nausea_relation_to_eating');
  const wl = a('weight_loss');
  const wlKg = a('weight_loss_amount_kg');
  const wlWks = a('weight_loss_period_weeks');
  const wlIntent = a('weight_loss_intentional');

  // ── Nausea/vomiting (fully characterized) ──────────────────
  if (isPresent(nausea) || isPresent(vomiting)) {
    let nvDesc = 'The patient has';
    if (isPresent(nausea) && !isPresent(vomiting)) {
      nvDesc += ' nausea';
    } else if (isPresent(vomiting) && !isPresent(nausea)) {
      nvDesc += ' vomiting';
    } else if (isPresent(nausea) && isPresent(vomiting)) {
      nvDesc += ' both nausea and vomiting';
    }

    if (nauseaSev) nvDesc += ` (nausea severity: ${(nauseaSev.value as string).toLowerCase()})`;
    if (nauseEating) nvDesc += `, worse ${(nauseEating.value as string).toLowerCase()}`;

    if (vomitTiming) {
      nvDesc += `, with vomiting occurring ${(vomitTiming.value as string).toLowerCase()}`;
    }
    if (vomitFreq) {
      nvDesc += ` (${(vomitFreq.value as string).toLowerCase()})`;
    }
    if (vomitDesc) {
      nvDesc += `. The vomitus consisted of ${(vomitDesc.value as string).toLowerCase()}`;
    }
    if (isPresent(vomitBilious)) {
      nvDesc += ', and was bilious (yellow-green)';
    }
    if (vomitingForce) {
      nvDesc += `. Vomiting was ${(vomitingForce.value as string).toLowerCase()}`;
    }
    if (isPresent(vomitProjectile)) {
      nvDesc += ' and projectile in nature';
    }
    if (vomitEating) {
      nvDesc += `. It relates to meals: ${(vomitEating.value as string).toLowerCase()}`;
    }
    if (isPresent(vomitRelief)) {
      nvDesc += '. Vomiting provides some relief of symptoms';
    }
    nvDesc += '.';
    symptoms.push(nvDesc);
  }

  // ── Anorexia ─────────────────────────────────────────────
  if (isPresent(anorexia)) {
    let desc = 'Appetite is significantly reduced';
    if (anorexiaSev) desc += ` (${(anorexiaSev.value as string).toLowerCase()})`;
    if (a('anorexia_duration_days')) desc += ` for ${a('anorexia_duration_days')!.value} days`;
    desc += ' — this raises concern for surgical pathology.';
    symptoms.push(desc);
  } else if (anorexia?.polarity === 'absent') {
    symptoms.push('Appetite is preserved, which slightly reduces the likelihood of acute appendicitis.');
  }

  // ── Fever ─────────────────────────────────────────────────
  if (isPresent(fever)) {
    let feverDesc = 'The patient reports fever';
    if (feverTemp) feverDesc += ` (documented to ${feverTemp.value}°C)`;
    if (feverDuration) feverDesc += ` for ${feverDuration.value} days`;
    if (feverPattern) feverDesc += `, with a ${(feverPattern.value as string).toLowerCase()} pattern`;
    if (isPresent(chills)) {
      feverDesc += ', accompanied by rigors (shaking chills), suggesting systemic infection or abscess formation';
    }
    feverDesc += '.';
    symptoms.push(feverDesc);
  } else if (fever?.polarity === 'absent') {
    symptoms.push('There is no fever.');
  }

  // ── Bowel habits ──────────────────────────────────────────
  if (bowel) {
    const bv = (bowel.value as string).toLowerCase();
    if (bv.includes('obstip')) {
      symptoms.push('The patient has not passed gas or stool (obstipation), strongly suggesting intestinal obstruction.');
    } else if (bv.includes('diarrhoea') || bv.includes('diarrhea')) {
      symptoms.push('Bowel habit is loose/watery.');
    } else if (bv.includes('constip')) {
      symptoms.push('The patient reports constipation.');
    } else if (bv.includes('blood')) {
      symptoms.push('Blood has been noted in the stool, raising concern for inflammatory bowel disease, ischaemia, or malignancy.');
    } else if (bv.includes('normal')) {
      symptoms.push('Bowel habit is reportedly normal — against complete obstruction.');
    }
  }

  // ── Diarrhea characterization ────────────────────────────
  if (isPresent(diarrhea)) {
    let dd = 'The patient has diarrhoea';
    if (a('diarrhea_duration_days')) dd += ` for ${a('diarrhea_duration_days')!.value} days`;
    if (diarrheaFreq) dd += `, occurring ${(diarrheaFreq.value as string).toLowerCase()}`;
    if (diarrheaConsist) dd += ` (${(diarrheaConsist.value as string).toLowerCase()})`;
    if (diarrheaVolume) dd += `, ${(diarrheaVolume.value as string).toLowerCase()}`;
    if (isPresent(diarrheaNoct)) dd += ', including at night (nocturnal)';
    dd += '.';
    symptoms.push(dd);
  }

  if (obstipation?.polarity === 'present' && !bowel) {
    symptoms.push('The patient has not passed gas or stool (obstipation), strongly suggesting intestinal obstruction.');
  }

  // ── Constipation characterization ────────────────────────
  if (isPresent(constipation)) {
    let cd = 'The patient is constipated';
    if (constDur) cd += ` for ${constDur.value} days`;
    if (constStool) cd += `, with stool described as ${(constStool.value as string).toLowerCase()}`;
    if (isPresent(constStrain)) cd += ', requiring straining';
    if (isPresent(a('constipation_incomplete_evacuation'))) cd += ', with sensation of incomplete evacuation';
    cd += '.';
    symptoms.push(cd);
  }

  // ── Abdominal distension characterization ────────────────
  if (isPresent(distension)) {
    let dd = 'Abdominal distension was noted';
    if (distOnset) dd += `, developing ${(distOnset.value as string).toLowerCase()}`;
    if (distProg) dd += ` and ${(distProg.value as string).toLowerCase()}`;
    if (isPresent(distGas)) dd += '. It is relieved by passing flatus';
    if (distPain) dd += `. Relation to pain: ${(distPain.value as string).toLowerCase()}`;
    dd += '.';
    symptoms.push(dd);
  }

  // ── Dysphagia characterization ───────────────────────────
  if (isPresent(dysphagia)) {
    let dd = 'The patient reports difficulty swallowing';
    if (dysphSolLiq) dd += ` (${(dysphSolLiq.value as string).toLowerCase()})`;
    if (isPresent(dysphProg)) dd += ', which is progressively worsening';
    if (isPresent(dysphOdyn)) dd += ', with painful swallowing (odynophagia)';
    if (dysphLevel) dd += `. Food gets stuck at ${(dysphLevel.value as string).toLowerCase()}`;
    if (isPresent(dysphRegurg)) dd += '. Food regurgitates back up after swallowing';
    dd += '.';
    symptoms.push(dd);
  }

  // ── Haematemesis characterization ────────────────────────
  if (isPresent(hematemesis)) {
    let hd = 'The patient has vomited blood';
    if (hemColor) hd += ` (${(hemColor.value as string).toLowerCase()})`;
    if (hemVol) hd += `, with ${(hemVol.value as string).toLowerCase()}`;
    if (hemFreq) hd += ` occurring ${(hemFreq.value as string).toLowerCase()}`;
    hd += '.';
    symptoms.push(hd);
  }

  // ── Melena characterization ──────────────────────────────
  if (isPresent(melena)) {
    let md = 'The patient is passing black, tarry stool (melena)';
    if (melFreq) md += ` ${(melFreq.value as string).toLowerCase()}`;
    if (melVol) md += `, ${(melVol.value as string).toLowerCase()}`;
    if (melDur) md += ` for ${melDur.value} days`;
    if (isPresent(melHemat)) md += ', also with haematemesis';
    md += '.';
    symptoms.push(md);
  }

  // ── Haematochezia characterization ───────────────────────
  if (isPresent(hemato)) {
    let hd = 'The patient has rectal bleeding';
    if (hColor) hd += ` (${(hColor.value as string).toLowerCase()})`;
    if (hVol) hd += `, ${(hVol.value as string).toLowerCase()}`;
    if (hRel) hd += `. Blood is ${(hRel.value as string).toLowerCase()}`;
    if (hFreq) hd += `, ${(hFreq.value as string).toLowerCase()}`;
    hd += '.';
    symptoms.push(hd);
  }

  // ── Jaundice characterization ────────────────────────────
  if (isPresent(jaundice)) {
    let jd = 'Jaundice is present';
    if (jaundOnset) jd += `, developing ${(jaundOnset.value as string).toLowerCase()}`;
    if (jaundProg) jd += ` and ${(jaundProg.value as string).toLowerCase()}`;
    if (isPresent(jaundItch)) jd += ', with associated pruritus (itching)';
    if (isPresent(jaundUrine)) jd += '. Urine is dark (tea-coloured)';
    if (isPresent(jaundStool)) jd += ' and stool is pale (clay-coloured)';
    jd += '.';
    symptoms.push(jd);
  }

  // ── Heartburn characterization ───────────────────────────
  if (isPresent(heartburn)) {
    let hd = 'The patient experiences heartburn';
    if (hbFreq) hd += ` ${(hbFreq.value as string).toLowerCase()}`;
    if (hbMeals) hd += `, occurring ${(hbMeals.value as string).toLowerCase()}`;
    if (isPresent(hbNoct)) hd += ', including at night';
    if (isPresent(hbRegurg)) hd += ', with acid regurgitation';
    hd += '.';
    symptoms.push(hd);
  }

  // ── Dysuria characterization ─────────────────────────────
  if (isPresent(dysuria)) {
    let dd = 'The patient reports pain on urination (dysuria)';
    if (dysChar) dd += `, described as ${(dysChar.value as string).toLowerCase()}`;
    if (dysTiming) dd += ` occurring ${(dysTiming.value as string).toLowerCase()}`;
    dd += '.';
    symptoms.push(dd);
  }

  // ── Haematuria characterization ──────────────────────────
  if (isPresent(hematuria)) {
    let hd = 'The patient has blood in the urine (haematuria)';
    if (isPresent(hemVis)) hd += ' — visible to the naked eye (gross)';
    if (isPresent(hemPain)) hd += ', which is painful';
    if (hemTiming) hd += `. Blood appears ${(hemTiming.value as string).toLowerCase()}`;
    if (isPresent(hemClots)) hd += '. Clots are present';
    hd += '.';
    symptoms.push(hd);
  }

  // ── Vaginal bleeding characterization ────────────────────
  if (isPresent(vagBleed)) {
    let vd = 'The patient has vaginal bleeding';
    if (vagVol) vd += ` (${(vagVol.value as string).toLowerCase()})`;
    if (vagPeriod) vd += `, occurring ${(vagPeriod.value as string).toLowerCase()}`;
    if (vagColor) vd += `. Blood is ${(vagColor.value as string).toLowerCase()}`;
    if (vagDur) vd += ` for ${vagDur.value} days`;
    vd += '.';
    symptoms.push(vd);
  }

  // ── Vaginal discharge characterization ───────────────────
  if (isPresent(vagDisc)) {
    let vd = 'The patient has vaginal discharge';
    if (vdColor) vd += ` (${(vdColor.value as string).toLowerCase()})`;
    if (vdConsist) vd += `, ${(vdConsist.value as string).toLowerCase()}`;
    if (vdOdor) {
      const odor = (vdOdor.value as string).toLowerCase();
      if (odor !== 'no smell') vd += ` with ${odor} odour`;
    }
    if (isPresent(vdItch)) vd += ', associated with itching';
    vd += '.';
    symptoms.push(vd);
  }

  // ── Urinary retention characterization ───────────────────
  if (isPresent(bladder)) {
    let bd = 'The patient has difficulty passing urine (urinary retention)';
    if (blAcuity) bd += ` — ${(blAcuity.value as string).toLowerCase()}`;
    if (isPresent(blPain)) bd += ', which is painful';
    if (isPresent(blHes)) bd += ', with hesitancy starting the stream';
    if (isPresent(blWeak)) bd += ', and a weak urinary stream';
    bd += '.';
    symptoms.push(bd);
  }

  // ── Bloating characterization ────────────────────────────
  if (isPresent(bloating)) {
    let bd = 'The patient reports bloating';
    if (isPresent(blMeals)) bd += ' after meals';
    if (blTiming) bd += `, worst ${(blTiming.value as string).toLowerCase()}`;
    if (isPresent(blGas)) bd += '. Passing flatus provides relief';
    bd += '.';
    symptoms.push(bd);
  }

  // ── Weight loss ──────────────────────────────────────────
  if (isPresent(wl)) {
    let wd = 'The patient has lost weight';
    if (wlKg) wd += ` (${wlKg.value} kg)`;
    if (wlWks) wd += ` over ${wlWks.value} weeks`;
    if (!isPresent(wlIntent)) wd += ' unintentionally';
    wd += '.';
    symptoms.push(wd);
  }

  return symptoms.length > 0 ? symptoms.join(' ') : 'No associated symptoms have been recorded.';
}

/** Generate important negatives section */
function generateImportantNegatives(
  state: EncounterState,
  topCandidates: CandidateDiseaseState[],
): string {
  if (topCandidates.length === 0) return '';

  const lines: string[] = [];

  for (const c of topCandidates.slice(0, 3)) {
    if (c.importantNegativesFound.length > 0) {
      const diseaseName = c.diseaseName;
      for (const negId of c.importantNegativesFound) {
        const feature = FEATURES[negId];
        if (feature) {
          lines.push(
            `Absence of ${feature.shortLabel.toLowerCase()} makes ${diseaseName} significantly less likely.`
          );
        }
      }
    }
  }

  // Also check for distinguishing negatives
  const no_migration = state.answers.find(a => a.featureId === 'pain_migration' && a.polarity === 'absent');
  const no_diarrhea = state.answers.find(a => a.featureId === 'diarrhea' && a.polarity === 'absent');
  const normal_bowel = state.answers.find(a =>
    a.featureId === 'bowel_habits' && (a.value as string)?.toLowerCase().includes('normal')
  );
  const no_vomiting = state.answers.find(a => a.featureId === 'vomiting' && a.polarity === 'absent');

  if (no_migration && !lines.some(l => l.includes('migration'))) {
    lines.push('The pain has not migrated — this argues against the classic appendicitis story.');
  }
  if (no_diarrhea && no_vomiting && !lines.some(l => l.includes('gastroenteritis'))) {
    lines.push('The absence of both diarrhoea and vomiting makes gastroenteritis less likely.');
  }

  return lines.length > 0 ? lines.join(' ') : '';
}

/** Generate risk factors section */
function generateRiskFactors(state: EncounterState): string {
  const riskAnswers = state.answers.filter(a =>
    ['prior_abdominal_surgery', 'smoking', 'nsaid_use', 'steroid_use',
      'known_gallstones', 'diabetes', 'htn_cad', 'anticoagulant_use',
      'alcohol_use', 'recent_travel', 'family_history_gi_cancer',
    ].includes(a.featureId)
  );

  if (riskAnswers.length === 0) return '';

  const parts: string[] = [];
  for (const a of riskAnswers) {
    const feature = FEATURES[a.featureId];
    if (!feature) continue;
    if (a.polarity === 'present') {
      if (a.featureId === 'prior_abdominal_surgery') parts.push('prior abdominal surgery');
      else if (a.featureId === 'smoking') parts.push('smoking');
      else if (a.featureId === 'nsaid_use') parts.push('NSAID use');
      else if (a.featureId === 'steroid_use') parts.push('steroid use');
      else if (a.featureId === 'known_gallstones') parts.push('known gallstones');
      else if (a.featureId === 'diabetes') parts.push('diabetes');
      else if (a.featureId === 'htn_cad') parts.push('vascular disease');
      else if (a.featureId === 'anticoagulant_use') parts.push('anticoagulant therapy');
      else if (a.featureId === 'alcohol_use') {
        const av = (a.value as string).toLowerCase();
        if (av.includes('heavy') || av.includes('daily')) parts.push('regular alcohol use');
      } else if (a.featureId === 'recent_travel') parts.push('recent travel');
      else if (a.featureId === 'family_history_gi_cancer') parts.push('family history of GI malignancy');
    }
  }

  if (parts.length === 0) return '';
  return `Relevant risk factors include ${parts.join(', ')}.`;
}

/** Generate the differential summary */
function generateDifferential(state: EncounterState): string {
  const candidates = state.ddx.activeCandidates.slice(0, 5);
  if (candidates.length === 0) return '';

  const lines: string[] = ['Differential diagnosis, ranked by probability:'];
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const prob = Math.round(c.currentProb * 100);
    const flags: string[] = [];
    if (c.evidenceFor.length > 0) flags.push('supported');
    if (c.evidenceAgainst.length > 0) flags.push('evidence against');
    if (c.isRedFlagTriggered) flags.push('RED FLAG');
    lines.push(
      `  ${i + 1}. ${c.diseaseName} (${prob}%) — ${flags.join(', ') || 'under evaluation'}`
    );
  }

  return lines.join('\n');
}

/** Generate the HPI narrative */
export function generateHpiNarrative(state: EncounterState): HpiNarrative {
  const painHistory = generatePainHistory(state);
  const associatedSymptoms = generateAssociatedSymptoms(state);
  const importantNegatives = generateImportantNegatives(
    state, state.ddx.activeCandidates,
  );
  const riskFactors = generateRiskFactors(state);
  const differentialSummary = generateDifferential(state);

  // Introduction
  const age = state.patient.age;
  const sex = state.patient.sex;
  const cc = state.chiefComplaint.text;
  const duration = state.chiefComplaint.duration
    ? ` for ${state.chiefComplaint.duration}`
    : '';
  const introduction = `A ${age}-year-old ${sex} presents with ${cc}${duration}.`;

  // Progression
  const progression = state.ddx.convergenceState === 'confirming'
    ? `The clinical picture is converging on ${state.ddx.leadingDiagnosis?.diseaseName || 'a leading diagnosis'} at ${Math.round((state.ddx.leadingDiagnosis?.currentProb || 0) * 100)}% probability.`
    : state.ddx.convergenceState === 'converging'
      ? `The differential is narrowing, with ${state.ddx.leadingDiagnosis?.diseaseName || 'a leading diagnosis'} emerging as the most likely cause.`
      : 'The presentation is still evolving; further characterisation is needed.';

  // Red flags
  const redFlagIds = new Set<string>();
  for (const a of state.answers) {
    if (a.polarity === 'present' && FEATURES[a.featureId]) {
      for (const c of state.ddx.activeCandidates) {
        const d = ABDOMINAL_PAIN_DISEASE_MAP.get(c.diseaseId);
        if (d?.redFlagFeatureIds.includes(a.featureId)) {
          redFlagIds.add(a.featureId);
        }
      }
    }
  }
  const redFlags = redFlagIds.size > 0
    ? `RED FLAGS IDENTIFIED: ${Array.from(redFlagIds).map(id => FEATURES[id]?.shortLabel || id).join(', ')}. Immediate clinical attention required.`
    : 'No red flags identified.';

  // Build full narrative
  const parts = [
    introduction,
    painHistory,
    progression,
    associatedSymptoms,
    importantNegatives ? `Important negatives: ${importantNegatives}` : '',
    riskFactors,
    redFlags,
    differentialSummary,
  ].filter(Boolean);

  return {
    introduction,
    painHistory,
    progression,
    associatedSymptoms,
    importantNegatives,
    riskFactors,
    differentialSummary,
    redFlags,
    fullNarrative: parts.join('\n\n'),
  };
}
