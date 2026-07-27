// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK V
// DOCUMENTATION ENGINE — implementation
// Live clinical writing, clause merging, SOCRATES expansion,
// real-time pipeline. Narrative evolves, never regenerates.
// ═══════════════════════════════════════════════════════════════

import type {
  FactObject, SymptomObject, SymptomTimeline, SymptomSeverity,
  SymptomLocation, SymptomContext, MechanismCategoryUniversal,
} from './hpi-constitution';
import type {
  ClinicalClause, ClauseType, ClinicalSentence, ClinicalParagraph,
  DocumentObject, PatientGender, PatientAgeCategory, PronounSet,
} from './documentation-constitution';
import {
  CLAUSE_ORDER, PAIN_ORDER, applyTerminologyRules,
  selectPronouns, getAgeReference, STYLE_RULES,
} from './documentation-constitution';

// ─────────────────────────────────────────────────────────────────
// CLAUSE BUILDER — convert facts into clinical clauses
// ─────────────────────────────────────────────────────────────────

export interface ClauseBuilderInput {
  fact: FactObject;
  symptom: SymptomObject | null;
  pronouns: PronounSet;
  ageReference: string;
  clauseType?: ClauseType;
}

let clauseCounter = 0;
function nextClauseId(): string { return `clause_${++clauseCounter}`; }

export function factToClause(input: ClauseBuilderInput): ClinicalClause | null {
  const { fact, symptom, pronouns, ageReference } = input;
  const text = buildClauseText(fact, symptom, pronouns, ageReference);
  if (!text) return null;

  return {
    id: nextClauseId(),
    text,
    factIds: [fact.id],
    symptomId: symptom?.id ?? null,
    clauseType: input.clauseType ?? inferClauseType(fact),
    temporalOrder: 0,
    isNegation: fact.value === false || fact.value === 'no' || fact.value === 'absent',
    confidence: fact.confidence,
  };
}

function inferClauseType(fact: FactObject): ClauseType {
  const attr = fact.attribute;
  if (['onset', 'duration', 'first_onset', 'mode_of_onset', 'timeline'].includes(attr)) return 'temporal';
  if (['severity', 'score', 'pain_severity'].includes(attr)) return 'severity';
  if (['location', 'site', 'primary_location'].includes(attr)) return 'location';
  if (['radiation', 'radiates'].includes(attr)) return 'radiation';
  if (['character', 'quality', 'type'].includes(attr)) return 'characterization';
  if (['progression', 'trend', 'worsening'].includes(attr)) return 'progression';
  if (['aggravating', 'worse_with'].includes(attr)) return 'aggravating';
  if (['relieving', 'better_with'].includes(attr)) return 'relieving';
  if (['previous_episode', 'recurrence'].includes(attr)) return 'previous_episode';
  if (['treatment', 'medication', 'action_taken'].includes(attr)) return 'treatment_tried';
  if (['impact', 'functional_impact'].includes(attr)) return 'impact';
  if (['current_state', 'current_status'].includes(attr)) return 'current_state';
  if (['symptom', 'complaint'].includes(attr)) return 'symptom_introduction';
  if (['negative', 'denies', 'no'].includes(attr)) return 'important_negative';
  return 'associated_feature';
}

function buildClauseText(fact: FactObject, symptom: SymptomObject | null, pronouns: PronounSet, ageReference: string): string | null {
  const val = fact.value;
  if (val === null || val === undefined) return null;

  const subject = ageReference;
  const subjPro = pronouns.subject;

  if (fact.attribute === 'symptom' || fact.attribute === 'complaint') {
    if (typeof val === 'string') {
      const { clinical } = applyTerminologyRules(val);
      return `${subjPro} developed ${clinical}`;
    }
    return null;
  }

  if (fact.attribute === 'duration' || fact.attribute === 'duration_days') {
    if (typeof val === 'number') return `of ${val} days' duration`;
    if (typeof val === 'string') return `of ${val}`;
    return null;
  }

  if (fact.attribute === 'onset' || fact.attribute === 'first_onset') {
    if (typeof val === 'string') return `which began ${val}`;
    return null;
  }

  if (fact.attribute === 'mode_of_onset') {
    if (val === 'sudden') return 'of sudden onset';
    if (val === 'gradual') return 'which developed gradually';
    return null;
  }

  if (fact.attribute === 'severity' || fact.attribute === 'pain_severity') {
    if (typeof val === 'number') {
      if (val >= 7) return 'of severe intensity';
      if (val >= 4) return 'of moderate intensity';
      return 'of mild intensity';
    }
    if (typeof val === 'string') return `of ${val} severity`;
    return null;
  }

  if (fact.attribute === 'character' || fact.attribute === 'pain_character') {
    if (typeof val === 'string') return `described as ${val}`;
    return null;
  }

  if (fact.attribute === 'location' || fact.attribute === 'pain_location') {
    if (typeof val === 'string') return `located in the ${val}`;
    return null;
  }

  if (fact.attribute === 'radiation') {
    if (typeof val === 'string') return `radiating to ${val}`;
    if (Array.isArray(val)) return `radiating to ${val.join(' and ')}`;
    return null;
  }

  if (fact.attribute === 'progression' || fact.attribute === 'trend') {
    if (val === 'worsening') return 'which has progressively worsened';
    if (val === 'improving') return 'which has been improving';
    if (val === 'static') return 'which remains unchanged';
    return null;
  }

  if (fact.attribute === 'pattern') {
    if (val === 'continuous') return 'continuous';
    if (val === 'intermittent') return 'intermittent';
    if (val === 'nocturnal') return 'which occurs at night';
    return null;
  }

  if (fact.attribute === 'aggravating' || fact.attribute === 'aggravated_by') {
    if (typeof val === 'string') return `aggravated by ${val}`;
    if (Array.isArray(val)) return `aggravated by ${val.join(' and ')}`;
    return null;
  }

  if (fact.attribute === 'relieving' || fact.attribute === 'relieved_by') {
    if (typeof val === 'string') return `relieved by ${val}`;
    if (Array.isArray(val)) return `relieved by ${val.join(' and ')}`;
    return null;
  }

  if (fact.attribute === 'associated') {
    if (typeof val === 'string') return `associated with ${val}`;
    if (Array.isArray(val)) return `associated with ${val.join(' and ')}`;
    return null;
  }

  if (fact.attribute === 'previous_episode') {
    if (val === true || val === 'yes') return 'She has experienced similar episodes previously';
    if (val === false || val === 'no') return 'She has no prior history of similar episodes';
    return null;
  }

  if (fact.attribute === 'treatment' || fact.attribute === 'treatment_tried') {
    if (typeof val === 'string') return `She has tried ${val}`;
    return null;
  }

  if (fact.attribute === 'current_state') {
    if (typeof val === 'string') return `At presentation, ${val}`;
    return null;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────
// SENTENCE BUILDER — merge clauses into natural sentences
// ─────────────────────────────────────────────────────────────────

export function buildSentence(clauses: ClinicalClause[], symptom: SymptomObject | null, pronouns: PronounSet, ageReference: string): ClinicalSentence {
  const orderedClauses = clauses.sort((a, b) => {
    const aOrder = CLAUSE_ORDER.indexOf(a.clauseType);
    const bOrder = CLAUSE_ORDER.indexOf(b.clauseType);
    return aOrder - bOrder;
  });

  const nonNegationClauses = orderedClauses.filter(c => !c.isNegation);
  const negationClauses = orderedClauses.filter(c => c.isNegation);

  let sentenceText = '';
  const subject = ageReference;
  const subjPro = pronouns.subject;

  if (nonNegationClauses.length > 0) {
    const firstClause = nonNegationClauses[0];
    if (firstClause.clauseType === 'symptom_introduction') {
      sentenceText = firstClause.text;
      const restTexts = nonNegationClauses.slice(1).map(c => c.text).filter(Boolean);
      if (restTexts.length > 0) {
        const merged = mergeClauseTexts(restTexts);
        sentenceText = `${sentenceText} ${merged}`;
      }
    } else {
      const texts = nonNegationClauses.map(c => c.text).filter(Boolean);
      sentenceText = mergeClauseTexts(texts);
    }
  }

  if (negationClauses.length > 0 && STYLE_RULES.maxConsecutiveNegativeSentences >= 1) {
    const negatedTexts = negationClauses.map(c => c.text).filter(Boolean);
    if (negatedTexts.length > 0) {
      const groupedNegation = `She denied ${negatedTexts.join(', ')}`;
      sentenceText = sentenceText ? `${sentenceText}. ${groupedNegation}` : groupedNegation;
    }
  }

  if (sentenceText && !sentenceText.endsWith('.')) {
    sentenceText += '.';
  }

  return {
    id: `sent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    text: sentenceText,
    clauses: orderedClauses,
    symptomId: symptom?.id ?? null,
    order: 0,
    isComplete: true,
  };
}

function mergeClauseTexts(texts: string[]): string {
  if (texts.length === 0) return '';
  if (texts.length === 1) return texts[0];

  let merged = texts[0];
  for (let i = 1; i < texts.length; i++) {
    const current = texts[i];
    if (/^(of|which|located|radiating|described|associated|aggravated|relieved)/i.test(current)) {
      merged += ` ${current}`;
    } else if (/^(continuous|intermittent|of|with)/i.test(current)) {
      merged += ` ${current}`;
    } else {
      merged += ` and ${current}`;
    }
  }
  return merged;
}

// ─────────────────────────────────────────────────────────────────
// SOCRATES EXPANSION — convert structured pain facts into prose
// ─────────────────────────────────────────────────────────────────

export interface SocratesInput {
  site: string | null;
  onset: string | null;
  character: string | null;
  radiation: string | string[] | null;
  associated: string | string[] | null;
  timing: string | null;
  exacerbating: string | string[] | null;
  relieving: string | string[] | null;
  severity: number | string | null;
  duration: string | number | null;
  progression: string | null;
}

export function expandSocratesToProse(input: SocratesInput, pronouns: PronounSet, ageReference: string): string {
  const subjPro = pronouns.subject;
  const parts: string[] = [];

  const durationClause = input.duration
    ? (typeof input.duration === 'number' ? `of ${input.duration} days'` : `of ${input.duration}`)
    : '';

  const onsetClause = input.onset === 'sudden' ? 'sudden-onset' : '';

  const severityClause = input.severity
    ? (typeof input.severity === 'number'
      ? (input.severity >= 7 ? 'severe' : input.severity >= 4 ? 'moderate' : 'mild')
      : input.severity)
    : '';

  const characterClause = input.character || '';

  const siteClause = input.site ? `in the ${input.site}` : '';

  const radiationClause = input.radiation
    ? (Array.isArray(input.radiation) ? `radiating to ${input.radiation.join(' and ')}` : `radiating to ${input.radiation}`)
    : '';

  const timingClause = input.timing || '';

  const intro = [
    `${subjPro} presented with`,
    severityClause,
    onsetClause,
    characterClause,
    siteClause,
    durationClause ? `${durationClause}` : '',
    'pain',
  ].filter(Boolean).join(' ');

  parts.push(intro);

  if (radiationClause) parts.push(radiationClause);
  if (timingClause) parts.push(`which is ${timingClause}`);

  if (input.progression === 'worsening') parts.push('and has progressively worsened');
  else if (input.progression === 'improving') parts.push('and has been improving');
  else if (input.progression === 'static') parts.push('and remains unchanged');

  if (input.exacerbating) {
    const ex = Array.isArray(input.exacerbating) ? input.exacerbating.join(' and ') : input.exacerbating;
    parts.push(`aggravated by ${ex}`);
  }

  if (input.relieving) {
    const rel = Array.isArray(input.relieving) ? input.relieving.join(' and ') : input.relieving;
    parts.push(`relieved by ${rel}`);
  }

  if (input.associated) {
    const assoc = Array.isArray(input.associated) ? input.associated.join(' and ') : input.associated;
    parts.push(`associated with ${assoc}`);
  }

  let result = parts.join(', ');
  if (result.endsWith(',')) result = result.slice(0, -1);
  if (!result.endsWith('.')) result += '.';
  return result;
}

// ─────────────────────────────────────────────────────────────────
// PARAGRAPH BUILDER — group sentences by symptom
// ─────────────────────────────────────────────────────────────────

export function buildSymptomParagraph(
  symptom: SymptomObject,
  facts: FactObject[],
  pronouns: PronounSet,
  ageReference: string,
): ClinicalParagraph {
  const clauses: ClinicalClause[] = [];
  const usedFactIds = new Set<string>();

  const symptomFact = facts.find(f => f.attribute === 'symptom' || f.attribute === 'complaint');
  if (symptomFact && !usedFactIds.has(symptomFact.id)) {
    const clause = factToClause({
      fact: symptomFact, symptom, pronouns, ageReference,
      clauseType: 'symptom_introduction',
    });
    if (clause) { clauses.push(clause); usedFactIds.add(symptomFact.id); }
  }

  const orderPriority: ClauseType[] = ['temporal', 'characterization', 'severity', 'location', 'radiation',
    'progression', 'context', 'aggravating', 'relieving', 'associated_feature',
    'treatment_tried', 'previous_episode', 'impact', 'current_state'];

  for (const clauseType of orderPriority) {
    for (const fact of facts) {
      if (usedFactIds.has(fact.id)) continue;
      if (fact.attribute === 'symptom' || fact.attribute === 'complaint') continue;
      if (inferClauseType(fact) !== clauseType) continue;
      const clause = factToClause({ fact, symptom, pronouns, ageReference, clauseType });
      if (clause) { clauses.push(clause); usedFactIds.add(fact.id); }
    }
  }

  for (const fact of facts) {
    if (usedFactIds.has(fact.id)) continue;
    if (fact.attribute === 'symptom' || fact.attribute === 'complaint') continue;
    const clause = factToClause({ fact, symptom, pronouns, ageReference });
    if (clause) { clauses.push(clause); usedFactIds.add(fact.id); }
  }

  const sentence = buildSentence(clauses, symptom, pronouns, ageReference);

  return {
    id: `para_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    heading: symptom.identity.canonicalName
      ? `${symptom.identity.canonicalName.charAt(0).toUpperCase()}${symptom.identity.canonicalName.slice(1)}`
      : null,
    sentences: [sentence],
    symptomId: symptom.id,
    order: 0,
    isComplete: sentence.isComplete,
    factIdsReferenced: Array.from(usedFactIds),
  };
}

// ─────────────────────────────────────────────────────────────────
// DOCUMENT UPDATER — live document evolution
// ─────────────────────────────────────────────────────────────────

export function createEmptyDocument(encounterId: string, patientId: string): DocumentObject {
  return {
    id: `doc_${encounterId}`,
    encounterId,
    patientId,
    paragraphs: [],
    summary: '',
    lastUpdated: new Date().toISOString(),
    version: 1,
  };
}

export function addParagraphToDocument(doc: DocumentObject, paragraph: ClinicalParagraph): DocumentObject {
  return {
    ...doc,
    paragraphs: [...doc.paragraphs, paragraph],
    lastUpdated: new Date().toISOString(),
    version: doc.version + 1,
  };
}

export function updateParagraphInDocument(doc: DocumentObject, paragraphId: string, updated: ClinicalParagraph): DocumentObject {
  return {
    ...doc,
    paragraphs: doc.paragraphs.map(p => p.id === paragraphId ? updated : p),
    lastUpdated: new Date().toISOString(),
    version: doc.version + 1,
  };
}

export function generateSummary(doc: DocumentObject): string {
  if (doc.paragraphs.length === 0) return 'No history recorded.';
  const sentences = doc.paragraphs.flatMap(p => p.sentences.map(s => s.text)).filter(Boolean);
  return sentences.join(' ');
}

// ─────────────────────────────────────────────────────────────────
// REAL-TIME WRITING PIPELINE
// Fact captured → clause updated → sentence reassembled → paragraph updated
// ─────────────────────────────────────────────────────────────────

export interface WritingPipelineInput {
  fact: FactObject;
  symptom: SymptomObject | null;
  document: DocumentObject;
  pronouns: PronounSet;
  ageCategory: PatientAgeCategory;
  gender: PatientGender;
}

export function processFactForDocumentation(input: WritingPipelineInput): DocumentObject {
  const { fact, symptom, document: doc, pronouns, ageCategory, gender } = input;
  const ageReference = getAgeReference(ageCategory);

  const existingParagraph = symptom
    ? doc.paragraphs.find(p => p.symptomId === symptom.id)
    : null;

  const clause = factToClause({
    fact, symptom, pronouns, ageReference,
    clauseType: inferClauseType(fact),
  });

  if (!clause) return doc;

  if (existingParagraph) {
    const existingSentence = existingParagraph.sentences[existingParagraph.sentences.length - 1];
    const updatedClauses = [...existingSentence.clauses, clause];
    const updatedSentence = buildSentence(updatedClauses, symptom, pronouns, ageReference);
    updatedSentence.order = existingSentence.order;

    const updatedParagraph: ClinicalParagraph = {
      ...existingParagraph,
      sentences: existingParagraph.sentences.map(s =>
        s.id === existingSentence.id ? updatedSentence : s,
      ),
      factIdsReferenced: [...existingParagraph.factIdsReferenced, fact.id],
    };

    return updateParagraphInDocument(doc, existingParagraph.id, updatedParagraph);
  }

  if (symptom) {
    const newParagraph = buildSymptomParagraph(symptom, [fact], pronouns, ageReference);
    return addParagraphToDocument(doc, newParagraph);
  }

  const sentenceText = clause.text;
  const sentence: ClinicalSentence = {
    id: `sent_${Date.now()}`,
    text: sentenceText.endsWith('.') ? sentenceText : `${sentenceText}.`,
    clauses: [clause],
    symptomId: null,
    order: doc.paragraphs.length,
    isComplete: true,
  };
  const paragraph: ClinicalParagraph = {
    id: `para_${Date.now()}`,
    heading: null,
    sentences: [sentence],
    symptomId: null,
    order: doc.paragraphs.length,
    isComplete: true,
    factIdsReferenced: [fact.id],
  };
  return addParagraphToDocument(doc, paragraph);
}

// ─────────────────────────────────────────────────────────────────
// DOCUMENTATION QUALITY CHECK
// ─────────────────────────────────────────────────────────────────

export function checkDocumentationQuality(doc: DocumentObject): {
  score: number;
  checks: Record<string, boolean>;
  suggestions: string[];
} {
  const checks: Record<string, boolean> = {
    completeness: doc.paragraphs.length > 0,
    chronology: checkChronology(doc),
    noRepetition: checkNoRepetition(doc),
    hasPronouns: checkHasPronouns(doc),
    noRoboticPhrasing: checkNoRoboticPhrasing(doc),
    sentencesMerged: checkSentencesMerged(doc),
  };

  const suggestions: string[] = [];
  if (!checks.completeness) suggestions.push('No paragraphs have been generated yet.');
  if (!checks.chronology) suggestions.push('Timeline may not be chronological.');
  if (!checks.noRepetition) suggestions.push('Some symptoms may be repeated unnecessarily.');
  if (!checks.hasPronouns) suggestions.push('Use pronouns instead of repeating "the patient".');
  if (!checks.noRoboticPhrasing) suggestions.push('Merge short consecutive sentences.');
  if (!checks.sentencesMerged) suggestions.push('Consider merging related clauses into single sentences.');

  const score = Object.values(checks).filter(Boolean).length / Object.values(checks).length;

  return { score: Math.round(score * 100) / 100, checks, suggestions };
}

function checkChronology(doc: DocumentObject): boolean {
  return doc.paragraphs.length <= 1 || doc.paragraphs.every((p, i) => i === 0 || p.order >= doc.paragraphs[i - 1].order);
}

function checkNoRepetition(doc: DocumentObject): boolean {
  const texts = new Set<string>();
  for (const p of doc.paragraphs) {
    for (const s of p.sentences) {
      if (texts.has(s.text)) return false;
      texts.add(s.text);
    }
  }
  return true;
}

function checkHasPronouns(doc: DocumentObject): boolean {
  const full = doc.paragraphs.map(p => p.sentences.map(s => s.text).join(' ')).join(' ');
  return /\b(He|She|They|his|her|their)\b/.test(full);
}

function checkNoRoboticPhrasing(doc: DocumentObject): boolean {
  const full = doc.paragraphs.map(p => p.sentences.map(s => s.text).join(' ')).join(' ');
  const roboticPatterns = [
    /The patient.*The patient/,
    /reports.*reports/,
    /complains of.*complains of/,
  ];
  return !roboticPatterns.some(p => p.test(full));
}

function checkSentencesMerged(doc: DocumentObject): boolean {
  for (const p of doc.paragraphs) {
    const shortSentences = p.sentences.filter(s => s.text.split(' ').length < 5);
    if (shortSentences.length > 2) return false;
  }
  return true;
}
