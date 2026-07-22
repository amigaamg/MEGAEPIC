import type { HpiState, SymptomInstance, TimelineEvent } from './types';
import type { TimelineEntry } from './timeline-engine';
import { buildTimeline, sortSymptomsByOnset } from './timeline-engine';
import { getTemplate } from './question-engine';

function buildPainNarrative(symptom: SymptomInstance): string[] {
  const data = symptom.coreData;
  const paragraphs: string[] = [];

  const isSudden = data.pain_onset === 'sudden' || data.pain_onset === 'acute_on_chronic';
  const onsetWord = isSudden ? 'sudden' : 'gradual';
  const duration = data.pain_duration || '';
  const location = data.pain_location || '';
  const character = data.pain_character || '';
  const severity = data.pain_severity !== undefined ? data.pain_severity : '';
  const timing = data.pain_timing || '';
  const course = data.pain_course || '';
  const radiation = data.pain_radiation || '';
  const aggravating = data.pain_aggravating || '';
  const relieving = data.pain_relieving || '';
  const trend = data.pain_24h_trend || '';

  const introParts = [`The patient was previously well until approximately ${duration || 'several days'} prior to presentation when she developed ${symptom.label.toLowerCase()}.`];
  if (onsetWord) introParts.push(`The pain started ${onsetWord}ly`);
  if (course) introParts.push(`and has ${course.replace(/_/g, ' ')} since onset`);
  const intro = introParts.join(' ') + '. It began before the onset of all other symptoms and remains the principal reason for seeking medical attention.';
  paragraphs.push(intro);

  const details: string[] = [];
  if (location) details.push(`The pain is located in the ${location}`);
  if (timing) details.push(`is ${timing.replace(/_/g, ' ')} in nature`);
  if (severity !== '') details.push(`${timing === 'intermittent' || timing === 'colicky' ? 'and is' : 'is'} severe in intensity`);
  if (radiation && radiation !== 'none' && radiation !== 'no_radiation' && radiation !== 'None') details.push(`It radiates to ${radiation}`);
  if (aggravating) details.push(`It is aggravated by ${aggravating}`);
  if (relieving) details.push(`It does not significantly improve with ${relieving === 'nothing' || relieving === 'none' ? 'rest or medications' : relieving}`);
  if (trend) {
    if (trend === 'worse') details.push('The pain has been getting progressively worse');
    else if (trend === 'better') details.push('The pain has been improving');
    else if (trend === 'same') details.push('The pain has remained unchanged');
    else if (trend === 'fluctuating') details.push('The pain has been fluctuating in intensity');
  }
  if (!radiation || radiation === 'none' || radiation === 'no_radiation' || radiation === 'None') {
    details.push('There is no radiation of the pain');
  }

  if (details.length > 0) {
    paragraphs.push(details.join('. ') + '.');
  }

  if (character) {
    paragraphs.push(`The patient describes the pain as ${character.replace(/_/g, ' ')} in nature.`);
  }

  return paragraphs;
}

function buildVomitingNarrative(symptom: SymptomInstance): string[] {
  const data = symptom.coreData;
  const paragraphs: string[] = [];

  const onset = data.vomiting_onset || '';
  const frequency = data.vomiting_frequency || '';
  const content = data.vomiting_content || '';
  const relation = data.vomiting_relation_to_food ? data.vomiting_relation_to_food.replace(/_/g, ' ') : '';
  const nausea = data.vomiting_nausea_precedes;
  const hematemesis = data.vomiting_hematemesis;
  const bilious = data.vomiting_bilious;
  const faeculent = data.vomiting_faeculent;
  const tolerability = data.vomiting_ability_to_tolerate;

  const detailParts: string[] = [];
  if (onset) detailParts.push(`The vomiting started ${onset}`);
  else detailParts.push('She began experiencing repeated episodes of vomiting');
  if (frequency) detailParts.push(`occurring ${typeof frequency === 'string' ? frequency : `${frequency} times per day`}`);
  const intro = detailParts.join(', ').replace(/^She /, 'she ');
  paragraphs.push(`On the second day of illness, she began experiencing repeated episodes of vomiting. ${intro.charAt(0).toUpperCase() + intro.slice(1)}.`);

  const charParts: string[] = [];
  if (content) {
    if (content === 'bilious') charParts.push('the vomitus became bilious');
    else if (content === 'faeculent') charParts.push('the vomitus became foul-smelling/faeculent');
    else if (content === 'blood' || content === 'coffee_ground') charParts.push('blood was present in the vomitus');
    else if (content === 'undigested_food') charParts.push('the vomitus initially contained recently ingested food and later became bilious');
    else charParts.push(`the vomitus was ${content.replace(/_/g, ' ')}`);
  }
  if (relation) charParts.push(`occurring ${relation}`);
  if (nausea === false) charParts.push('there was no preceding nausea');
  if (hematemesis === true) charParts.push('there was blood in the vomitus');
  if (hematemesis === false) charParts.push('there has been no blood in the vomitus');
  if (bilious === true) charParts.push('the vomitus was bilious (green-tinged)');
  if (faeculent === true) charParts.push('the vomitus was foul-smelling/faeculent suggesting distal obstruction');
  if (tolerability !== undefined && tolerability !== null) {
    if (tolerability === false || tolerability === 'no' || tolerability === 'nothing') charParts.push('she has been unable to keep anything down');
    else if (tolerability === 'orally_only_fluids') charParts.push('she can only tolerate oral fluids');
    else if (typeof tolerability === 'string' && tolerability !== 'yes') charParts.push(`she can tolerate ${tolerability.replace(/_/g, ' ')}`);
  }

  if (charParts.length > 0) {
    paragraphs.push(`She reports that ${charParts.join('; ')}.`);
  }

  return paragraphs;
}

function buildDistensionNarrative(symptom: SymptomInstance): string[] {
  const data = symptom.coreData;
  const paragraphs: string[] = [];

  const course = data.distension_course ? data.distension_course.replace(/_/g, ' ') : '';
  const rate = data.distension_rate ? data.distension_rate.replace(/_/g, ' ') : '';
  const flatus = data.distension_flatus;
  const lastBM = data.distension_bowel_movement || '';
  const peristalsis = data.distension_visible_peristalsis;
  const previous = data.distension_previous_similar;
  const painRel = data.distension_pain_relation ? data.distension_pain_relation.replace(/_/g, ' ') : '';

  const parts: string[] = [];
  parts.push('Approximately one day before presentation, she noticed progressive abdominal distension');
  if (course) parts.push(`which has been ${course}`);
  if (rate) parts.push(`over ${rate}`);

  const first = parts.join(' ');
  paragraphs.push(first.charAt(0).toUpperCase() + first.slice(1) + '.');

  const extra: string[] = [];
  if (peristalsis === true) extra.push('Visible peristalsis has been noted');
  if (flatus === false) extra.push('She has been unable to pass flatus');
  if (flatus === true) extra.push('She has been passing flatus');
  if (lastBM) extra.push(`Her last bowel movement was ${lastBM}`);
  if (painRel) extra.push(`The distension started ${painRel}`);
  if (previous === true) extra.push('She reports similar episodes previously');

  if (extra.length > 0) {
    paragraphs.push(extra.join('. ') + '.');
  }

  return paragraphs;
}

function buildConstipationNarrative(symptom: SymptomInstance): string[] {
  const data = symptom.coreData;
  const paragraphs: string[] = [];

  const lastBM = data.constipation_last_bm || '';
  const completeness = data.constipation_completeness || '';
  const prior = data.constipation_prior_habit ? data.constipation_prior_habit.replace(/_/g, ' ') : '';
  const blood = data.constipation_blood;
  const straining = data.constipation_straining;
  const tenesmus = data.constipation_tenesmus;
  const previous = data.constipation_previous_similar;
  const mucus = data.constipation_mucus;
  const caliber = data.constipation_stool_caliber ? data.constipation_stool_caliber.replace(/_/g, ' ') : '';

  const parts: string[] = [];
  parts.push('Since the onset of abdominal pain, she has been unable to open her bowels');
  if (lastBM) parts.push(`since ${lastBM}`);
  if (completeness) parts.push(`with ${completeness.replace(/_/g, ' ')}`);
  paragraphs.push(parts.join(' ') + '.');

  const extra: string[] = [];
  if (straining === true) extra.push('She has been straining to pass stool');
  if (tenesmus === true) extra.push('She reports a sensation of incomplete evacuation');
  if (blood === true) extra.push('There has been rectal bleeding');
  if (blood === false) extra.push('There has been no rectal bleeding');
  if (mucus === true) extra.push('Mucus has been present with stool');
  if (caliber && caliber !== 'normal' && caliber !== 'not_applicable') extra.push(`The stool caliber has changed — ${caliber}`);
  if (previous === true) extra.push('She has experienced similar episodes previously');
  if (prior) extra.push(`Her usual bowel habit is ${prior}`);

  if (extra.length > 0) {
    paragraphs.push(extra.join('. ') + '.');
  }

  return paragraphs;
}

function buildFeverNarrative(symptom: SymptomInstance): string[] {
  const data = symptom.coreData;
  const paragraphs: string[] = [];

  const onset = data.fever_onset || '';
  const pattern = data.fever_pattern ? data.fever_pattern.replace(/_/g, ' ') : '';
  const chills = data.fever_chills;
  const sweats = data.fever_sweats;
  const temp = data.fever_documented_temp;
  const source = data.fever_source_hint;

  const parts: string[] = [];
  if (onset) parts.push(`Fever started ${onset}`);
  else parts.push('Fever developed');
  if (temp) parts.push(`with a documented temperature of ${temp}°C`);
  if (pattern) parts.push(`with a ${pattern} pattern`);
  if (chills === true) parts.push('associated with chills/rigors');
  paragraphs.push(parts.join(', ') + '.');

  const extra: string[] = [];
  if (sweats === true) extra.push('Night sweats are present');
  if (source && Array.isArray(source) && !source.includes('none')) {
    extra.push(`Localizing symptoms include: ${source.join(', ')}`);
  }
  if (extra.length > 0) paragraphs.push(extra.join('. ') + '.');

  return paragraphs;
}

function buildOtherNarrative(symptom: SymptomInstance): string[] {
  const data = symptom.coreData;
  const paragraphs: string[] = [];

  const onset = data[`${symptom.category}_onset`] || '';
  const duration = data[`${symptom.category}_duration`] || '';

  const parts: string[] = [];
  if (onset) parts.push(`started ${onset}`);
  if (duration) parts.push(`over ${duration}`);
  const suffix = parts.length > 0 ? ` which ${parts.join(' ')}` : '';

  paragraphs.push(`The patient also reports ${symptom.label.toLowerCase()}${suffix}.`);

  const posFields = Object.entries(data).filter(([k, v]) =>
    v === true || (typeof v === 'string' && v.length > 0 && v !== 'none' && v !== 'not_applicable')
  );
  const negFields = Object.entries(data).filter(([k, v]) =>
    v === false || v === 'none' || v === 'not_applicable'
  );

  if (posFields.length > 0) {
    const posStr = posFields.map(([k]) => k.replace(/_/g, ' ').replace(symptom.category + '_ ', '')).join(', ');
    paragraphs.push(`Positive findings include: ${posStr}.`);
  }
  if (negFields.length > 0) {
    const negStr = negFields.map(([k]) => k.replace(/_/g, ' ').replace(symptom.category + '_ ', '')).join(', ');
    paragraphs.push(`Negative for: ${negStr}.`);
  }

  return paragraphs;
}

function symptomToNarrative(symptom: SymptomInstance): string[] {
  switch (symptom.category) {
    case 'pain': return buildPainNarrative(symptom);
    case 'vomiting': return buildVomitingNarrative(symptom);
    case 'distension': return buildDistensionNarrative(symptom);
    case 'constipation': return buildConstipationNarrative(symptom);
    case 'fever': return buildFeverNarrative(symptom);
    default: return buildOtherNarrative(symptom);
  }
}

function buildNegativesSection(state: HpiState): string[] {
  const paragraphs: string[] = [];
  const negGroups: Record<string, string[]> = {};

  for (const symptom of state.symptoms) {
    const data = symptom.coreData;
    const category = symptom.category;
    for (const [key, value] of Object.entries(data)) {
      if (value === false || value === 'none' || value === 'not_applicable' || value === 'none_identified') {
        const label = key.replace(category + '_', '').replace(/_/g, ' ');
        if (!negGroups[category]) negGroups[category] = [];
        negGroups[category].push(label);
      }
    }
  }

  if (Object.keys(negGroups).length > 0) {
    const lines: string[] = [];
    for (const [cat, items] of Object.entries(negGroups)) {
      if (items.length > 0) {
        const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
        lines.push(`${catLabel}: ${items.join(', ')}.`);
      }
    }
    if (lines.length > 0) {
      paragraphs.push('She denies ' + lines.join(' She denies ').toLowerCase().replace(/^s/, 'S'));
    }
  }

  return paragraphs;
}

function buildAssociatedSymptomsNarrative(state: HpiState): string[] {
  const paragraphs: string[] = [];
  const nonPrimary = state.symptoms.filter(s => !s.isPrimary && s.category !== 'pain' && s.category !== 'vomiting' && s.category !== 'distension' && s.category !== 'constipation' && s.category !== 'fever');

  if (nonPrimary.length > 0) {
    const labels = nonPrimary.map(s => s.label.toLowerCase());
    paragraphs.push(`Additional reported symptoms include ${labels.join(', ')}.`);
    for (const sym of nonPrimary) {
      const narr = symptomToNarrative(sym);
      paragraphs.push(...narr);
    }
  }

  return paragraphs;
}

function buildRiskFactorSection(state: HpiState): string[] {
  const paragraphs: string[] = [];
  const rf = state.riskFactors;
  if (Object.keys(rf).length > 0) {
    const present = Object.entries(rf).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '));
    if (present.length > 0) {
      paragraphs.push(`Relevant risk factors include: ${present.join(', ')}.`);
    }
  }
  return paragraphs;
}

function buildCareBeforePresentation(state: HpiState): string[] {
  const paragraphs: string[] = [];
  const care = state.careBeforePresentation;
  if (care.firstSought) {
    const parts: string[] = [`She initially sought care ${care.firstSought}`];
    if (care.whereSought) parts.push(`at ${care.whereSought}`);
    if (care.treatments && care.treatments.length > 0) parts.push(`where she received ${care.treatments.join(', ')}`);
    if (care.medications && care.medications.length > 0) parts.push(`She was given ${care.medications.join(', ')}`);
    if (care.homeRemedies && care.homeRemedies.length > 0) parts.push(`She tried home remedies including ${care.homeRemedies.join(', ')}`);
    if (care.response) parts.push(`; there was ${care.response}`);
    else parts.push(' without significant improvement');
    paragraphs.push(parts.join(' ').replace(/^She /, 'she ').replace(/; /, '') + '.');
    paragraphs.push('She therefore presented to the Emergency Department because of progressive worsening of symptoms.');
  }
  return paragraphs;
}

function buildImpactNarrative(state: HpiState): string[] {
  const paragraphs: string[] = [];
  const impact = state.impactOnLife;
  if (Object.keys(impact).length > 0) {
    const impaired = Object.entries(impact)
      .filter(([, level]) => level === 'impaired' || level === 'severely_impaired' || level === 'unable')
      .map(([activity]) => activity.replace(/_/g, ' '));
    if (impaired.length > 0) {
      paragraphs.push(`The illness has significantly affected her daily activities. She has been ${impaired.map(a => `unable to ${a}`).join(', ')} due to the persistent symptoms and associated discomfort.`);
    }
  }
  return paragraphs;
}

function buildConstitutionalNarrative(state: HpiState): string[] {
  const paragraphs: string[] = [];
  if (state.symptoms.some(s => s.coreData.appetite || s.coreData.constipation_blood !== undefined)) {
    const appetiteLoss = state.symptoms.some(s => s.coreData.appetite === 'reduced' || s.coreData.appetite === 'absent');
    if (appetiteLoss) paragraphs.push('She reports loss of appetite and reduced oral intake due to worsening abdominal discomfort and repeated vomiting.');
  }
  return paragraphs;
}

export function generateFullNarrative(state: HpiState): string {
  const sections: string[] = [];
  const sorted = sortSymptomsByOnset(state.symptoms);
  const primary = state.symptoms.find(s => s.id === state.primarySymptomId);

  if (!primary) return '';

  const blocks: string[][] = [];
  blocks.push(buildPainNarrative(primary));
  blocks.push(buildConstitutionalNarrative(state));

  const vomitingSym = state.symptoms.find(s => s.category === 'vomiting');
  if (vomitingSym) blocks.push(buildVomitingNarrative(vomitingSym));

  const distensionSym = state.symptoms.find(s => s.category === 'distension');
  if (distensionSym) blocks.push(buildDistensionNarrative(distensionSym));

  const constipationSym = state.symptoms.find(s => s.category === 'constipation');
  if (constipationSym) blocks.push(buildConstipationNarrative(constipationSym));

  const negSection = buildNegativesSection(state);
  if (negSection.length > 0) blocks.push(negSection);

  const assocSection = buildAssociatedSymptomsNarrative(state);
  if (assocSection.length > 0) blocks.push(assocSection);

  const rfSection = buildRiskFactorSection(state);
  if (rfSection.length > 0) blocks.push(rfSection);

  const careSection = buildCareBeforePresentation(state);
  if (careSection.length > 0) blocks.push(careSection);

  const impactSection = buildImpactNarrative(state);
  if (impactSection.length > 0) blocks.push(impactSection);

  const joinedBlocks = blocks.map(block => block.join('\n\n')).filter(b => b.length > 0);
  sections.push('HISTORY OF PRESENTING ILLNESS');
  sections.push('');
  sections.push(...joinedBlocks);
  sections.push('');

  const entries = buildTimeline(state.symptoms, state.sharedData);
  if (entries.length > 0) {
    sections.push('CHRONOLOGICAL TIMELINE:');
    let currentDay = -999;
    for (const entry of entries) {
      if (entry.relativeDay !== currentDay) {
        currentDay = entry.relativeDay;
        sections.push(`\n${entry.relativeLabel}:`);
      }
      sections.push(`  • ${entry.label}`);
      if (entry.detail && entry.detail !== entry.label) sections.push(`    ${entry.detail}`);
    }
    sections.push('');
  }

  sections.push('PRIMARY SYMPTOM EXPLORATION');
  sections.push('');
  const painSym = state.symptoms.find(s => s.category === 'pain');
  if (painSym) {
    const fields = getTemplate('pain').coreFields;
    for (const field of fields) {
      const val = painSym.coreData[field.id];
      if (val !== undefined && val !== null && val !== '') {
        const displayVal = typeof val === 'string' ? val.replace(/_/g, ' ') : String(val);
        sections.push(`${field.label}: ${displayVal.charAt(0).toUpperCase() + displayVal.slice(1)}`);
      }
    }
  }

  const activeDxs = state.differentials.filter(d => d.isActive && !d.isExcluded);
  if (activeDxs.length > 0) {
    sections.push('');
    sections.push('DIFFERENTIAL DIAGNOSIS SUMMARY:');
    for (const dx of activeDxs) {
      const status = dx.probability > 50 ? 'LEADING' : dx.probability > 20 ? 'POSSIBLE' : 'UNLIKELY';
      sections.push(`  • ${dx.name} (${status}, ${dx.probability}% probability)`);
      if (dx.supporting.length > 0) sections.push(`    Supporting: ${dx.supporting.slice(0, 3).join(', ')}${dx.supporting.length > 3 ? '...' : ''}`);
      if (dx.opposing.length > 0) sections.push(`    Opposing: ${dx.opposing.slice(0, 2).join(', ')}${dx.opposing.length > 2 ? '...' : ''}`);
    }
  }

  const missing = state.missingMandatory;
  if (missing.length > 0) {
    sections.push('');
    sections.push('MISSING INFORMATION:');
    for (const m of missing) sections.push(`  ⚠ ${m}`);
  }

  return sections.join('\n');
}

export function generateRealtimeDocumentation(state: HpiState): string {
  return generateFullNarrative(state);
}

export function generateStructuredSummary(state: HpiState): {
  primaryComplaint: string;
  symptomCount: number;
  timelineLength: number;
  activeDifferentials: number;
  questionsRemaining: number;
  completenessPercent: number;
  careSought: string;
  impactRecorded: boolean;
  safetyAlerts: string[];
} {
  const entries = buildTimeline(state.symptoms, state.sharedData);
  const unanswered = state.questions.filter(q => !q.answered && !q.skipped);
  const totalRules = Object.keys(state.completeness).length;
  const passedRules = Object.values(state.completeness).filter(Boolean).length;
  const primary = state.symptoms.find(s => s.id === state.primarySymptomId);
  return {
    primaryComplaint: primary ? primary.label : 'None selected',
    symptomCount: state.symptoms.length,
    timelineLength: entries.length,
    activeDifferentials: state.differentials.filter(d => d.isActive && !d.isExcluded).length,
    questionsRemaining: unanswered.length,
    completenessPercent: totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 0,
    careSought: state.careBeforePresentation.firstSought || 'Not yet recorded',
    impactRecorded: Object.keys(state.impactOnLife).length > 0,
    safetyAlerts: state.unresolvedAlerts,
  };
}
