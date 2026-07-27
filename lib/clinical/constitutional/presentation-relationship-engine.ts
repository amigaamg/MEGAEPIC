// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK V
// PRESENTATION RELATIONSHIP ENGINE
// Clusters, orders, and links multiple complaints into syndromes.
// Enforces: chronological order (oldest→newest), max 3-4 complaints.
// ═══════════════════════════════════════════════════════════════

import type { ClinicalPresentationObject, ClinicalSyndrome, BodySystem, MechanismCategory } from './clinical-presentation-constitution';
import { CLINICAL_PRESENTATIONS } from './clinical-presentation-constitution';

export interface PatientPresentationInput {
  id: string;
  originalWording: string;
  chronology: number;
  duration?: string;
  severity?: number;
  resolved?: boolean;
}

export interface ResolvedPresentation extends PatientPresentationInput {
  object: ClinicalPresentationObject;
  matchedBy: 'id' | 'synonym' | 'patient_language' | 'unknown';
}

export interface PresentationRelationship {
  type: 'causal' | 'associative' | 'consequence' | 'complication' | 'independent' | 'same_illness';
  confidence: number;
  rationale: string;
}

export interface PresentationCluster {
  id: string;
  label: string;
  presentations: ResolvedPresentation[];
  syndrome: ClinicalSyndrome | null;
  primarySystem: BodySystem | null;
  sharedMechanisms: MechanismCategory[];
  relationships: { from: string; to: string; relationship: PresentationRelationship }[];
  mergedRedFlags: string[];
}

export interface RelationshipEngineInput {
  presentations: PatientPresentationInput[];
}

export interface RelationshipEngineResult {
  sorted: ResolvedPresentation[];
  clusters: PresentationCluster[];
  syndrome: ClinicalSyndrome | null;
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════════
// RESOLVE PRESENTATIONS
// ═══════════════════════════════════════════════════════════════

function resolvePresentation(input: PatientPresentationInput): ResolvedPresentation {
  let object: ClinicalPresentationObject | undefined = CLINICAL_PRESENTATIONS[input.id];
  let matchedBy: ResolvedPresentation['matchedBy'] = 'id';

  if (!object) {
    const lowerId = input.id.toLowerCase();
    object = Object.values(CLINICAL_PRESENTATIONS).find(p =>
      p.synonyms.some(s => s.toLowerCase() === lowerId) ||
      p.synonyms.some(s => s.toLowerCase().includes(lowerId))
    );
    if (object) {
      matchedBy = 'synonym';
    }
  }

  if (!object) {
    const lowerWording = input.originalWording.toLowerCase();
    object = Object.values(CLINICAL_PRESENTATIONS).find(p =>
      p.patientLanguage.some(l => l.toLowerCase() === lowerWording) ||
      p.displayName.toLowerCase() === lowerWording
    );
    if (object) {
      matchedBy = 'patient_language';
    }
  }

  const finalObject = object || createFallbackPresentation(input);
  return {
    ...input,
    object: finalObject,
    matchedBy: object ? matchedBy : 'unknown',
  };
}

function createFallbackPresentation(input: PatientPresentationInput): ClinicalPresentationObject {
  return {
    id: input.id, displayName: input.originalWording, synonyms: [input.id],
    patientLanguage: [input.originalWording],
    presentationType: 'symptom', bodySystems: ['general'],
    ageRules: {}, genderRules: [], pregnancyRules: [], activationRules: [],
    mechanisms: [], phenotypes: [], syndromes: [], redFlags: [],
    timeCategories: [], emergencyLevel: 'green',
    visibility: { showSections: [], hideSections: [], showTabs: [], hideTabs: [], showCards: [], hideCards: [], showButtons: [], hideButtons: [] },
    history: { requiredQuestions: [], optionalQuestions: [], conditionalQuestions: [], negativeQuestions: [], sequence: [], stoppingRules: [] },
    ros: { primarySystems: ['general'], secondarySystems: [], optionalSystems: [], hiddenSystems: [], crossSystemLinks: [] },
    examination: { generalExam: ['vital_signs'], focusedExam: [], mandatoryExam: ['vital_signs'], optionalExam: [], hiddenExam: [], specialTests: [], scoringSystems: [] },
    reasoning: { excludeDiagnoses: [], mechanisms: [], syndromes: [], reasoningStage: 'history_only', minimumDataFields: [] },
    investigationReadiness: { potentialTests: [], conditions: [], urgency: [], dependencies: [] },
    managementReadiness: { domains: ['supportive'], emergencyActions: [], monitoringRequired: [], referralCriteria: [] },
    monitoring: { vitalsFrequency: 'routine', requiredScores: [], observationCharts: [], alerts: [], escalationThresholds: [] },
    workflow: { isolationRequired: false, pathways: [], teamActivation: [], admissionCriteria: [], dischargeCriteria: [] },
    documentation: { narrativeTemplate: 'general_hpi', summaryTemplate: 'general_summary', problemRepresentation: '', timelineRequired: false, soapFormat: 'subjective_objective' },
    ai: { confidenceThreshold: 0.5, missingDataThreshold: 0.5, reasoningThreshold: 0.5, unsafeThreshold: 0.9, escalationThreshold: 0.8, humanConfirmationRequired: [], neverInfer: [], canAutoComplete: [], cannotAutoComplete: [] },
  };
}

// ═══════════════════════════════════════════════════════════════
// RELATIONSHIP DETECTION
// ═══════════════════════════════════════════════════════════════

function detectRelationship(a: ResolvedPresentation, b: ResolvedPresentation): PresentationRelationship {
  const sharedSystems = a.object.bodySystems.filter(s => b.object.bodySystems.includes(s));
  const sharedMechanisms = a.object.mechanisms.filter(m => b.object.mechanisms.includes(m));
  const sharedSyndromes = a.object.syndromes.filter(s => b.object.syndromes.includes(s));

  if (sharedSyndromes.length > 0) {
    return { type: 'same_illness', confidence: 0.9, rationale: `Both present in ${sharedSyndromes[0]} syndrome` };
  }
  if (sharedSystems.length > 0 && sharedMechanisms.length > 0) {
    return { type: 'associative', confidence: 0.7, rationale: `Share ${sharedSystems.join(',')} system and ${sharedMechanisms.join(',')} mechanism` };
  }
  if (sharedSystems.length > 0) {
    return { type: 'associative', confidence: 0.5, rationale: `Share ${sharedSystems.join(',')} body system` };
  }
  return { type: 'independent', confidence: 0.3, rationale: 'No shared system or mechanism detected' };
}

// ═══════════════════════════════════════════════════════════════
// CLUSTERING
// ═══════════════════════════════════════════════════════════════

function clusterPresentations(resolved: ResolvedPresentation[]): PresentationCluster[] {
  const clusters: PresentationCluster[] = [];
  const used = new Set<string>();

  for (let i = 0; i < resolved.length; i++) {
    if (used.has(resolved[i].id)) continue;
    const cluster: ResolvedPresentation[] = [resolved[i]];
    used.add(resolved[i].id);

    for (let j = i + 1; j < resolved.length; j++) {
      if (used.has(resolved[j].id)) continue;
      const rel = detectRelationship(resolved[i], resolved[j]);
      if (rel.type !== 'independent' || rel.confidence > 0.5) {
        cluster.push(resolved[j]);
        used.add(resolved[j].id);
      }
    }

    const syndromeCounts = new Map<ClinicalSyndrome, number>();
    for (const p of cluster) {
      for (const s of p.object.syndromes) {
        syndromeCounts.set(s, (syndromeCounts.get(s) || 0) + 1);
      }
    }
    let dominantSyndrome: ClinicalSyndrome | null = null;
    let maxCount = 0;
    for (const [s, count] of syndromeCounts) {
      if (count > maxCount) { dominantSyndrome = s; maxCount = count; }
    }

    const allSystems = [...new Set(cluster.flatMap(p => p.object.bodySystems))];
    const primarySystem = allSystems.length > 0 ? allSystems[0] : null;

    const allMechanisms = [...new Set(cluster.flatMap(p => p.object.mechanisms))];

    const relationships: { from: string; to: string; relationship: PresentationRelationship }[] = [];
    for (let x = 0; x < cluster.length; x++) {
      for (let y = x + 1; y < cluster.length; y++) {
        relationships.push({ from: cluster[x].id, to: cluster[y].id, relationship: detectRelationship(cluster[x], cluster[y]) });
      }
    }

    const mergedRedFlags = [...new Set(cluster.flatMap(p => p.object.redFlags))];

    clusters.push({
      id: `cluster_${dominantSyndrome || cluster[0].id}`,
      label: dominantSyndrome ? dominantSyndrome.replace(/_/g, ' ') : cluster.map(p => p.object.displayName).join(' + '),
      presentations: cluster,
      syndrome: dominantSyndrome,
      primarySystem,
      sharedMechanisms: allMechanisms,
      relationships,
      mergedRedFlags,
    });
  }

  return clusters;
}

// ═══════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════

export function processPresentations(input: RelationshipEngineInput): RelationshipEngineResult {
  const warnings: string[] = [];

  if (input.presentations.length > 4) {
    warnings.push(`Maximum 3-4 chief complaints allowed. Received ${input.presentations.length}. Additional complaints moved to associated symptoms.`);
  }

  const capped = input.presentations.slice(0, 4);

  const resolved = capped.map(p => resolvePresentation(p));

  resolved.sort((a, b) => a.chronology - b.chronology);

  const unresolved = resolved.filter(p => p.matchedBy === 'unknown');
  for (const u of unresolved) {
    warnings.push(`"${u.originalWording}" did not match any known presentation. Using generic presentation object.`);
  }

  const clusters = clusterPresentations(resolved);

  const dominantCluster = clusters.length > 0 ? clusters[0] : null;

  return {
    sorted: resolved,
    clusters,
    syndrome: dominantCluster?.syndrome || null,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════════
// LEGACY SYNDROME FUSION
// ═══════════════════════════════════════════════════════════════

export function fuseToSyndrome(presentations: string[]): ClinicalSyndrome | null {
  const resolved = presentations.map(id => CLINICAL_PRESENTATIONS[id]).filter(Boolean);
  if (resolved.length === 0) return null;

  const syndromeCounts = new Map<ClinicalSyndrome, number>();
  for (const p of resolved) {
    for (const s of p.syndromes) {
      syndromeCounts.set(s, (syndromeCounts.get(s) || 0) + 1);
    }
  }

  let best: ClinicalSyndrome | null = null;
  let bestCount = 0;
  for (const [s, count] of syndromeCounts) {
    if (count > bestCount) { best = s; bestCount = count; }
  }
  return best;
}

export const SYNDROME_CLUSTERS: Record<ClinicalSyndrome, string[]> = {
  respiratory_syndrome: ['cough', 'difficulty_breathing', 'wheeze', 'hemoptysis', 'chest_pain'],
  cardiovascular_syndrome: ['chest_pain', 'palpitations', 'syncope', 'difficulty_breathing'],
  acute_abdomen: ['abdominal_pain', 'vomiting', 'diarrhea', 'constipation'],
  neurological_syndrome: ['headache', 'seizure', 'dizziness', 'weakness', 'altered_consciousness'],
  hemorrhagic_shock: ['bleeding', 'vaginal_bleeding', 'hematemesis', 'hemoptysis'],
  sepsis_syndrome: ['fever', 'rigors', 'altered_consciousness', 'difficulty_breathing'],
  obstructive_airway: ['difficulty_breathing', 'stridor', 'wheeze', 'cough'],
  head_trauma: ['trauma', 'headache', 'vomiting', 'altered_consciousness'],
  obstetric_emergency: ['vaginal_bleeding', 'abdominal_pain', 'reduced_fetal_movement', 'seizure'],
  neonatal_sepsis: ['fever', 'poor_feeding', 'irritability', 'difficulty_breathing'],
  anaphylaxis: ['difficulty_breathing', 'rash', 'swelling', 'hypotension'],
  toxic_ingestion: ['vomiting', 'altered_consciousness', 'seizure'],
};
