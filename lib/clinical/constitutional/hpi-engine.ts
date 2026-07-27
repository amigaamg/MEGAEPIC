// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK IV
// HPI ENGINE — implementation of constitutional principles
// Fact creation, mechanism activation, phenotype recognition,
// question selection, uncertainty calculation, stopping rules.
// ═══════════════════════════════════════════════════════════════

import type {
  SymptomObject, SymptomTimeline, SymptomSeverity, SymptomLocation,
  SymptomContext, SymptomAssociatedFeatures, SymptomRiskFactors,
  SymptomActions, SymptomImportantNegatives, SymptomEvidence,
  SymptomSummary, SymptomRelationship,
  FactObject, FactCategory, FactSource, FactRelationship, FactGraph,
  MechanismActivation, MechanismCategoryUniversal,
  PhenotypeActivation,
  QuestionObject, QuestionAnswer, QuestionTreeNode, QuestionBranch, QuestionPriority,
  DiagnosticHypothesis, UncertaintyState, StoppingCriteriaMet,
  ClinicalConfidence,
} from './hpi-constitution';
import { MECHANISM_TO_SYMPTOM_MAP } from './hpi-constitution';

// ─────────────────────────────────────────────────────────────────
// FACT ENGINE — facts are the single source of truth
// ─────────────────────────────────────────────────────────────────

export interface CreateFactInput {
  encounterId: string;
  patientId: string;
  category: FactCategory;
  attribute: string;
  value: unknown;
  source: FactSource;
  symptomId?: string;
  confidence?: number;
  unit?: string;
}

export function createFact(input: CreateFactInput): FactObject {
  return {
    id: `fact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    encounterId: input.encounterId,
    patientId: input.patientId,
    category: input.category,
    symptomId: input.symptomId || null,
    attribute: input.attribute,
    value: input.value,
    unit: input.unit || null,
    confidence: input.confidence ?? 1.0,
    source: input.source,
    authorId: null,
    timestamp: new Date().toISOString(),
    isActive: true,
    isStale: false,
    previousValue: null,
    replacedByFactId: null,
    relationships: [],
    metadata: {},
  };
}

export function addFactToGraph(graph: FactGraph, fact: FactObject): FactGraph {
  const newFacts = new Map(graph.facts);
  newFacts.set(fact.id, fact);
  return { ...graph, facts: newFacts, lastUpdated: new Date().toISOString() };
}

export function createFactGraph(patientId: string, encounterId: string): FactGraph {
  return {
    patientId, encounterId,
    facts: new Map(),
    relationships: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function getFactsBySymptom(graph: FactGraph, symptomId: string): FactObject[] {
  return Array.from(graph.facts.values()).filter(f => f.symptomId === symptomId && f.isActive && !f.isStale);
}

export function getFactByAttribute(graph: FactGraph, symptomId: string | null, attribute: string): FactObject | undefined {
  return Array.from(graph.facts.values()).find(
    f => f.symptomId === symptomId && f.attribute === attribute && f.isActive && !f.isStale,
  );
}

export function updateFact(graph: FactGraph, factId: string, newValue: unknown, newConfidence?: number): FactGraph {
  const oldFact = graph.facts.get(factId);
  if (!oldFact) return graph;
  const updatedFact: FactObject = {
    ...oldFact,
    previousValue: oldFact.value,
    value: newValue,
    confidence: newConfidence ?? oldFact.confidence,
    timestamp: new Date().toISOString(),
  };
  const newFacts = new Map(graph.facts);
  newFacts.set(factId, updatedFact);
  return { ...graph, facts: newFacts, lastUpdated: new Date().toISOString() };
}

export function staleFact(graph: FactGraph, factId: string): FactGraph {
  return updateFact(graph, factId, null, 0);
}

export function relateFacts(graph: FactGraph, sourceId: string, targetId: string, type: FactRelationship['type'], strength: number): FactGraph {
  const source = graph.facts.get(sourceId);
  const target = graph.facts.get(targetId);
  if (!source || !target) return graph;
  const relationship: FactRelationship = { targetFactId: targetId, type, strength };
  const updatedSource: FactObject = {
    ...source,
    relationships: [...source.relationships, relationship],
  };
  const newFacts = new Map(graph.facts);
  newFacts.set(sourceId, updatedSource);
  return { ...graph, facts: newFacts, lastUpdated: new Date().toISOString() };
}

// ─────────────────────────────────────────────────────────────────
// MECHANISM ENGINE — activate mechanisms from symptom data
// ─────────────────────────────────────────────────────────────────

export interface MechanismEngineInput {
  symptomId: string;
  symptomIdentity: string;
  characterization: Record<string, unknown>;
  timeline: SymptomTimeline;
  severity: SymptomSeverity;
  context: SymptomContext;
  existingFacts: FactObject[];
}

export function activateMechanisms(input: MechanismEngineInput): MechanismActivation[] {
  const activations: MechanismActivation[] = [];
  const symptomName = input.symptomIdentity.toLowerCase();
  const possibleMechanisms = Object.entries(MECHANISM_TO_SYMPTOM_MAP)
    .filter(([, symptoms]) => symptoms.some(s => symptomName.includes(s) || s.includes(symptomName)))
    .map(([mech]) => mech as MechanismCategoryUniversal);

  if (possibleMechanisms.length === 0) return [];

  const totalEvidence = Math.max(input.existingFacts.length, 1);

  for (const mechanism of possibleMechanisms) {
    let probability = 0.2;
    const supportingFacts: string[] = [];

    for (const fact of input.existingFacts) {
      const factValue = fact.value;
      if (typeof factValue === 'string') {
        if (mechanism === 'infectious' && ['fever', 'chills', 'rigors'].some(k => fact.attribute.includes(k))) {
          probability += 0.15; supportingFacts.push(fact.id);
        }
        if (mechanism === 'inflammatory' && ['pain', 'swelling', 'redness'].some(k => fact.attribute.includes(k))) {
          probability += 0.12; supportingFacts.push(fact.id);
        }
        if (mechanism === 'obstructive' && ['vomiting', 'constipation', 'distension'].some(k => fact.attribute.includes(k))) {
          probability += 0.15; supportingFacts.push(fact.id);
        }
        if (mechanism === 'vascular' && ['sudden', 'tearing', 'radiation'].some(k => fact.attribute.includes(k))) {
          probability += 0.18; supportingFacts.push(fact.id);
        }
        if (mechanism === 'traumatic' && ['injury', 'fall', 'accident'].some(k => fact.attribute.includes(k))) {
          probability += 0.2; supportingFacts.push(fact.id);
        }
        if (mechanism === 'neoplastic' && ['weight_loss', 'night_sweats', 'mass'].some(k => fact.attribute.includes(k))) {
          probability += 0.15; supportingFacts.push(fact.id);
        }
        if (mechanism === 'cardiac' && ['exertional', 'chest', 'palpitations'].some(k => fact.attribute.includes(k))) {
          probability += 0.15; supportingFacts.push(fact.id);
        }
        if (mechanism === 'neurological' && ['headache', 'seizure', 'weakness', 'numbness'].some(k => fact.attribute.includes(k))) {
          probability += 0.15; supportingFacts.push(fact.id);
        }
      }
    }

    if (input.timeline.modeOfOnset === 'sudden') {
      if (['vascular', 'traumatic', 'obstructive'].includes(mechanism)) probability += 0.1;
    }
    if (input.timeline.progression === 'worsening') {
      if (['infectious', 'neoplastic', 'inflammatory'].includes(mechanism)) probability += 0.08;
    }
    if (input.severity.score !== null && input.severity.score >= 7) {
      if (['vascular', 'obstructive', 'infectious'].includes(mechanism)) probability += 0.08;
    }

    probability = Math.min(probability, 0.95);

    const confidence: ClinicalConfidence =
      probability >= 0.7 ? 'high' :
      probability >= 0.4 ? 'moderate' :
      probability >= 0.2 ? 'low' : 'suspected';

    activations.push({
      mechanism,
      probability: Math.round(probability * 100) / 100,
      evidenceFactIds: supportingFacts,
      confidence,
      isActive: probability > 0.15,
      supportingSymptoms: [input.symptomId],
      competingMechanisms: possibleMechanisms.filter(m => m !== mechanism),
      informationGainPotential: calculateInformationGain(mechanism, activations),
    });
  }

  return activations.sort((a, b) => b.probability - a.probability);
}

function calculateInformationGain(mechanism: string, existing: MechanismActivation[]): number {
  const existingProb = existing.find(e => e.mechanism === mechanism)?.probability ?? 0.2;
  return Math.round((1 - existingProb) * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────
// PHENOTYPE ENGINE — mechanisms → phenotypes
// ─────────────────────────────────────────────────────────────────

const PHENOTYPE_REGISTRY: Record<string, { mechanism: MechanismCategoryUniversal; requiredFeatures: string[]; label: string }> = {
  sepsis_phenotype: { mechanism: 'infectious', requiredFeatures: ['fever', 'tachycardia', 'tachypnea'], label: 'Sepsis Syndrome' },
  asthma_phenotype: { mechanism: 'obstructive', requiredFeatures: ['wheeze', 'cough', 'dyspnea'], label: 'Asthma Phenotype' },
  copd_phenotype: { mechanism: 'obstructive', requiredFeatures: ['cough', 'sputum', 'dyspnea_exertional'], label: 'COPD Phenotype' },
  pneumonia_phenotype: { mechanism: 'infectious', requiredFeatures: ['cough', 'fever', 'sputum'], label: 'Pneumonia Phenotype' },
  acs_phenotype: { mechanism: 'cardiac', requiredFeatures: ['chest_pain', 'exertional', 'radiation'], label: 'ACS Phenotype' },
  pulmonary_embolism_phenotype: { mechanism: 'vascular', requiredFeatures: ['dyspnea_sudden', 'chest_pain_pleuritic', 'tachycardia'], label: 'PE Phenotype' },
  acute_abdomen_phenotype: { mechanism: 'inflammatory', requiredFeatures: ['abdominal_pain', 'peritonism', 'fever'], label: 'Acute Abdomen Phenotype' },
  bowel_obstruction_phenotype: { mechanism: 'obstructive', requiredFeatures: ['vomiting', 'constipation', 'distension', 'abdominal_pain'], label: 'Bowel Obstruction Phenotype' },
  meningitis_phenotype: { mechanism: 'infectious', requiredFeatures: ['headache', 'fever', 'neck_stiffness'], label: 'Meningitis Phenotype' },
  stroke_phenotype: { mechanism: 'neurological', requiredFeatures: ['headache_sudden', 'neurological_deficit', 'weakness'], label: 'Stroke Phenotype' },
  hemorrhagic_shock_phenotype: { mechanism: 'vascular', requiredFeatures: ['bleeding', 'hypotension', 'tachycardia'], label: 'Hemorrhagic Shock Phenotype' },
  anaphylaxis_phenotype: { mechanism: 'allergic', requiredFeatures: ['dyspnea', 'rash', 'hypotension'], label: 'Anaphylaxis Phenotype' },
  diabetic_ketoacidosis_phenotype: { mechanism: 'metabolic', requiredFeatures: ['polyuria', 'vomiting', 'altered_consciousness'], label: 'DKA Phenotype' },
  thyroid_storm_phenotype: { mechanism: 'endocrine', requiredFeatures: ['palpitations', 'fever', 'weight_loss'], label: 'Thyroid Storm Phenotype' },
  preeclampsia_phenotype: { mechanism: 'vascular', requiredFeatures: ['hypertension', 'headache', 'visual_disturbance'], label: 'Preeclampsia Phenotype' },
};

export function recognizePhenotypes(mechanisms: MechanismActivation[], facts: FactObject[]): PhenotypeActivation[] {
  const activations: PhenotypeActivation[] = [];

  for (const [phenotypeId, def] of Object.entries(PHENOTYPE_REGISTRY)) {
    const activeMechanism = mechanisms.find(m => m.mechanism === def.mechanism && m.isActive);
    if (!activeMechanism) continue;

    const observedFeatures: string[] = [];
    const absentFeatures: string[] = [];

    for (const feature of def.requiredFeatures) {
      const fact = facts.find(f => f.attribute === feature && f.isActive && !f.isStale);
      if (fact && fact.value === true) observedFeatures.push(feature);
      else if (fact && fact.value === false) absentFeatures.push(feature);
    }

    if (observedFeatures.length === 0) continue;

    const evidenceFactIds = observedFeatures
      .map(f => facts.find(fact => fact.attribute === f)?.id)
      .filter((id): id is string => !!id);

    const probability = observedFeatures.length / Math.max(def.requiredFeatures.length, 1);
    const confidence: ClinicalConfidence =
      probability >= 0.8 ? 'high' :
      probability >= 0.5 ? 'moderate' :
      probability >= 0.3 ? 'low' : 'suspected';

    activations.push({
      phenotypeId,
      label: def.label,
      mechanism: def.mechanism,
      probability: Math.round(probability * 100) / 100,
      evidenceFactIds,
      requiredFeatures: def.requiredFeatures,
      observedFeatures,
      absentFeatures,
      confidence,
      isActive: probability > 0.3,
    });
  }

  return activations.sort((a, b) => b.probability - a.probability);
}

// ─────────────────────────────────────────────────────────────────
// EVIDENCE ENGINE — facts change diagnostic evidence
// ─────────────────────────────────────────────────────────────────

export function updateEvidence(symptom: SymptomObject, facts: FactObject[], mechanisms: MechanismActivation[], phenotypes: PhenotypeActivation[]): SymptomEvidence {
  const supportingMechanisms = mechanisms.filter(m => m.isActive && m.confidence !== 'low').map(m => m.mechanism);
  const supportingPhenotypes = phenotypes.filter(p => p.isActive).map(p => p.phenotypeId);
  const contradictingMechanisms = mechanisms.filter(m => !m.isActive).map(m => m.mechanism);
  const factIds = facts.filter(f => f.isActive && !f.isStale).map(f => f.id);
  const totalConfidence = mechanisms.reduce((sum, m) => sum + m.probability, 0) / Math.max(mechanisms.length, 1);

  const confidence: ClinicalConfidence =
    totalConfidence >= 0.7 ? 'high' :
    totalConfidence >= 0.4 ? 'moderate' :
    totalConfidence >= 0.2 ? 'low' : 'suspected';

  return {
    factIds,
    confidence,
    supportingMechanisms,
    supportingPhenotypes,
    contradictingMechanisms,
    informationGainScore: mechanisms.reduce((sum, m) => sum + m.informationGainPotential, 0),
  };
}

// ─────────────────────────────────────────────────────────────────
// UNCERTAINTY ENGINE — information gain and stopping rules
// ─────────────────────────────────────────────────────────────────

export function calculateUncertainty(mechanisms: MechanismActivation[], phenotypes: PhenotypeActivation[]): number {
  if (mechanisms.length === 0) return 1.0;
  const topMechanismProb = Math.max(...mechanisms.filter(m => m.isActive).map(m => m.probability), 0);
  return Math.round((1 - topMechanismProb) * 100) / 100;
}

export function evaluateStoppingCriteria(
  mechanisms: MechanismActivation[],
  phenotypes: PhenotypeActivation[],
  uncertainty: number,
  factsCount: number,
): StoppingCriteriaMet[] {
  return [
    {
      criterion: 'mechanisms_resolved',
      met: mechanisms.filter(m => m.isActive).length <= 2,
      threshold: 2,
      currentValue: mechanisms.filter(m => m.isActive).length,
    },
    {
      criterion: 'phenotypes_resolved',
      met: phenotypes.filter(p => p.isActive && p.confidence !== 'low').length >= 1,
      threshold: 1,
      currentValue: phenotypes.filter(p => p.isActive && p.confidence !== 'low').length,
    },
    {
      criterion: 'uncertainty_acceptable',
      met: uncertainty < 0.3,
      threshold: 0.3,
      currentValue: uncertainty,
    },
    {
      criterion: 'evidence_sufficient',
      met: factsCount >= 10,
      threshold: 10,
      currentValue: factsCount,
    },
    {
      criterion: 'danger_excluded',
      met: mechanisms.filter(m => m.mechanism === 'vascular' && m.isActive).length === 0,
      threshold: 0,
      currentValue: mechanisms.filter(m => m.mechanism === 'vascular' && m.isActive).length,
    },
  ];
}

export function shouldStopQuestioning(criteria: StoppingCriteriaMet[]): boolean {
  const mechanismsMet = criteria.find(c => c.criterion === 'mechanisms_resolved')?.met ?? false;
  const uncertaintyMet = criteria.find(c => c.criterion === 'uncertainty_acceptable')?.met ?? false;
  const dangerExcluded = criteria.find(c => c.criterion === 'danger_excluded')?.met ?? true;
  return (mechanismsMet && uncertaintyMet) || (mechanismsMet && dangerExcluded);
}

export function findNextBestQuestion(
  mechanisms: MechanismActivation[],
  phenotypes: PhenotypeActivation[],
  availableQuestions: QuestionObject[],
  answeredQuestionIds: Set<string>,
): QuestionObject | null {
  const activeMechanisms = mechanisms.filter(m => m.isActive);
  const unresolvedPhenotypes = phenotypes.filter(p => p.isActive && p.confidence !== 'high');

  let bestQuestion: QuestionObject | null = null;
  let bestGain = -1;

  for (const q of availableQuestions) {
    if (answeredQuestionIds.has(q.id)) continue;
    if (q.priority === 'never_ask') continue;

    let gain = q.informationGainWeight;

    const mechanismOverlap = q.mechanismSupported.filter(m =>
      activeMechanisms.some(am => am.mechanism === m && am.confidence !== 'high'),
    );
    gain += mechanismOverlap.length * q.confidenceGain;

    const phenotypeOverlap = q.phenotypeSupported.filter(p =>
      unresolvedPhenotypes.some(up => up.phenotypeId === p),
    );
    gain += phenotypeOverlap.length * (q.confidenceGain * 0.5);

    if (q.priority === 'critical') gain += 0.5;
    if (q.priority === 'essential') gain += 0.3;

    if (gain > bestGain) {
      bestGain = gain;
      bestQuestion = q;
    }
  }

  return bestQuestion;
}

export function buildUncertaintyState(
  mechanisms: MechanismActivation[],
  phenotypes: PhenotypeActivation[],
  hypotheses: DiagnosticHypothesis[],
  availableQuestions: QuestionObject[],
  answeredQuestionIds: Set<string>,
): UncertaintyState {
  const uncertainty = calculateUncertainty(mechanisms, phenotypes);
  const stoppingCriteria = evaluateStoppingCriteria(mechanisms, phenotypes, uncertainty, 0);
  const isClinicallyAcceptable = shouldStopQuestioning(stoppingCriteria);

  return {
    hypotheses,
    totalHypotheses: hypotheses.length,
    activeMechanisms: mechanisms.filter(m => m.isActive),
    activePhenotypes: phenotypes.filter(p => p.isActive),
    resolvedMechanisms: mechanisms.filter(m => !m.isActive).map(m => m.mechanism),
    resolvedPhenotypes: phenotypes.filter(p => !p.isActive).map(p => p.phenotypeId),
    remainingUncertainty: uncertainty,
    diagnosticConfidence: 1 - uncertainty,
    isClinicallyAcceptable,
    nextBestQuestion: isClinicallyAcceptable
      ? null
      : findNextBestQuestion(mechanisms, phenotypes, availableQuestions, answeredQuestionIds),
    stoppingCriteria,
  };
}

// ─────────────────────────────────────────────────────────────────
// SYMPTOM UPDATE PIPELINE
// ─────────────────────────────────────────────────────────────────

export interface SymptomUpdateOutput {
  symptom: SymptomObject;
  mechanisms: MechanismActivation[];
  phenotypes: PhenotypeActivation[];
  evidence: SymptomEvidence;
  uncertainty: UncertaintyState;
}

export function processSymptomUpdate(
  symptom: SymptomObject,
  factGraph: FactGraph,
  availableQuestions: QuestionObject[],
  answeredQuestionIds: Set<string>,
): SymptomUpdateOutput {
  const facts = getFactsBySymptom(factGraph, symptom.id);
  const mechanisms = activateMechanisms({
    symptomId: symptom.id,
    symptomIdentity: symptom.identity.canonicalName || symptom.identity.patientWording,
    characterization: symptom.characterization,
    timeline: symptom.timeline,
    severity: symptom.severity,
    context: symptom.context,
    existingFacts: facts,
  });
  const phenotypes = recognizePhenotypes(mechanisms, facts);
  const evidence = updateEvidence(symptom, facts, mechanisms, phenotypes);
  const uncertainty = buildUncertaintyState(mechanisms, phenotypes, [], availableQuestions, answeredQuestionIds);

  const updatedSymptom: SymptomObject = {
    ...symptom,
    mechanisms,
    phenotypes,
    evidence,
    updatedAt: new Date().toISOString(),
  };

  return { symptom: updatedSymptom, mechanisms, phenotypes, evidence, uncertainty };
}
