// @ts-nocheck
import { DiseaseNode } from '../knowbase/diseaseNode';
import {
  createDiseaseNode, linkSymptomToDisease, createScore,
  linkScoreToDisease, createDrugNode, linkDrugToDisease,
  createGuideline, createReference, runQuery,
} from './neo4jService';

/**
 * AMEXAN Knowledge Graph Bridge
 *
 * Migrates in-memory DiseaseNode definitions into Neo4j,
 * and maps between the two representation systems.
 *
 * The key insight: Neo4j stores RELATIONSHIPS.
 * DiseaseNode stores FEATURE PROBABILITIES.
 * The bridge makes them work together.
 */

export async function syncDiseaseNodeToGraph(node: DiseaseNode): Promise<void> {
  // 1. Create the Disease node itself
  await createDiseaseNode({
    id: node.id,
    name: node.name,
    icdCode: node.icdCode || 'UNKNOWN',
    system: node.system,
    organSystem: node.organSystem,
    acuity: node.acuity,
    acuityTier: node.acuityTier,
    description: `${node.name} — ${node.pathophysiology?.mechanism || ''}`,
    epidemiology: JSON.stringify(node.epidemiology),
    averageDurationDays: 0,
    mortalityRate: 0,
  });

  // 2. Link symptoms with LR values
  const allFeatures = [
    ...(node.features?.symptoms || []),
    ...(node.features?.signs || []),
    ...(node.features?.investigations || []),
  ];

  for (const feat of allFeatures) {
    await linkSymptomToDisease({
      diseaseId: node.id,
      symptomId: feat.featureId,
      label: feat.shortLabel || feat.label,
      sensitivity: feat.sensitivity || 0.5,
      specificity: feat.specificity || 0.5,
      stageRelevance: feat.stageRelevance?.[0] || 1,
      isRedFlag: node.redFlagFeatureIds?.includes(feat.featureId) || false,
    });
  }

  // 3. Sync clinical scores
  for (const score of node.clinicalScores || []) {
    await createScore({
      id: `${node.id}_${score.name}`,
      name: score.name,
      type: 'clinical',
      inputs: score.items.map(i => i.label),
      calculation: score.items.map(i => `${i.label}:${i.pointsWhenPresent}pts`).join(' + '),
      interpretation: score.interpretationThresholds
        .map(t => `≤${t.maxScore}: ${t.label}`).join('; '),
      meaning: `Risk stratification for ${node.name}`,
      managementImplications: `Score guides management decisions for ${node.name}`,
    });
    await linkScoreToDisease({
      scoreId: `${node.id}_${score.name}`,
      diseaseId: node.id,
      role: `prognostic_${score.name.toLowerCase()}`,
    });
  }
}

export async function buildKnowledgeGraph(
  diseaseNodes: Record<string, DiseaseNode>
): Promise<{ synced: number; errors: string[] }> {
  let synced = 0;
  const errors: string[] = [];

  for (const [key, node] of Object.entries(diseaseNodes)) {
    try {
      await syncDiseaseNodeToGraph(node);
      synced++;
    } catch (e) {
      errors.push(`Failed to sync ${key}: ${e}`);
    }
  }

  return { synced, errors };
}

/**
 * Query the graph using feature vectors
 * Returns diseases ranked by matching symptom profile
 */
export async function queryByFeatureMatch(
  featureIds: string[],
  limit = 10
): Promise<{ diseaseId: string; name: string; score: number; matchDetails: string[] }[]> {
  if (!featureIds.length) return [];

  const result = await runQuery(`
    MATCH (d:Disease)-[r:HAS_SYMPTOM]->(s:Symptom)
    WHERE s.id IN $featureIds
    WITH d, s, r.sensitivity as sens, r.specificity as spec
    WITH d,
         collect(s.id) as matchedFeatures,
         sum(sens * 2 + spec) as likelihoodScore
    ORDER BY likelihoodScore DESC
    LIMIT $limit
    RETURN d.id as diseaseId, d.name as name, likelihoodScore as score,
           matchedFeatures
  `, { featureIds, limit });

  return result.records.map(r => ({
    diseaseId: r.get('diseaseId'),
    name: r.get('name'),
    score: r.get('score').toNumber(),
    matchDetails: r.get('matchedFeatures'),
  }));
}

/**
 * Get drug recommendations for a diagnosis
 */
export async function queryDrugsForDiagnosis(
  diseaseId: string
): Promise<{ drugId: string; name: string; indication: string; isFirstLine: boolean }[]> {
  const result = await runQuery(`
    MATCH (drug:Drug)-[r:TREATS]->(d:Disease {id: $diseaseId})
    RETURN drug.id as drugId, drug.name as name,
           r.indication as indication, r.isFirstLine as isFirstLine
    ORDER BY r.isFirstLine DESC, r.evidenceLevel ASC
  `, { diseaseId });

  return result.records.map(r => ({
    drugId: r.get('drugId'),
    name: r.get('name'),
    indication: r.get('indication'),
    isFirstLine: r.get('isFirstLine'),
  }));
}

/**
 * Get the guideline tree for a clinical question
 */
export async function queryGuidelines(
  diseaseId: string
): Promise<{ name: string; organization: string; recommendations: string }[]> {
  const result = await runQuery(`
    MATCH (d:Disease {id: $diseaseId})-[:HAS_GUIDELINE]->(g:Guideline)
    RETURN g.name as name, g.organization as organization,
           g.recommendations as recommendations
    ORDER BY g.year DESC
  `, { diseaseId });

  return result.records.map(r => ({
    name: r.get('name'),
    organization: r.get('organization'),
    recommendations: r.get('recommendations'),
  }));
}

/**
 * Get differential diagnosis based on the encounter's evidence graph
 */
export async function queryDifferentialFromEvidence(encounterId: string): Promise<{
  diseases: { diseaseId: string; name: string; confidence: number; matchedFeatures: number; totalFeatures: number }[]
}> {
  const result = await runQuery(`
    MATCH (e:Encounter {id: $encounterId})-[:HAS_EVIDENCE]->(ev:Evidence)
    MATCH (d:Disease)-[r:HAS_SYMPTOM]->(s:Symptom)
    WHERE s.id = ev.id OR s.label CONTAINS ev.value
    WITH d, count(DISTINCT s.id) as matched,
         d.name as name, d.id as diseaseId
    OPTIONAL MATCH (d)-[:HAS_SYMPTOM]->(allS:Symptom)
    WITH d, diseaseId, name, matched,
         count(DISTINCT allS) as total
    RETURN diseaseId, name, matched, total,
           (matched * 1.0 / CASE WHEN total = 0 THEN 1 ELSE total END) as confidence
    ORDER BY matched DESC LIMIT 15
  `, { encounterId });

  return {
    diseases: result.records.map(r => ({
      diseaseId: r.get('diseaseId'),
      name: r.get('name'),
      confidence: r.get('confidence').toNumber(),
      matchedFeatures: r.get('matched').toNumber(),
      totalFeatures: r.get('total').toNumber(),
    })),
  };
}

/**
 * Create monitoring rules from a Problem node
 * PROBLEM-DRIVEN monitoring (not disease-driven)
 */
export async function createMonitoringFromProblem(problemName: string, encounterId: string): Promise<void> {
  const monitoringMap: Record<string, { parameters: string[]; frequency: string; alertConcept: string }> = {
    'Dehydration': {
      parameters: ['Urine output', 'CRT', 'Pulse', 'Weight', 'Intake', 'Output'],
      frequency: 'hourly',
      alertConcept: 'Urine <0.5ml/kg/hr',
    },
    'Severe Anemia': {
      parameters: ['Hemoglobin', 'Pulse', 'Peripheral perfusion', 'Bleeding signs'],
      frequency: 'daily',
      alertConcept: 'Hb <5g/dL or active bleeding',
    },
    'Neurological deficit': {
      parameters: ['GCS', 'Pupils', 'Seizure activity', 'Motor deficit', 'AVPU'],
      frequency: '4hrly',
      alertConcept: 'GCS drop >2 points',
    },
    'Fever': {
      parameters: ['Temperature', 'Pulse', 'CRP', 'Blood culture'],
      frequency: '4hrly',
      alertConcept: 'Temp >40°C or septic shock signs',
    },
  };

  const found = Object.entries(monitoringMap).find(([key]) =>
    problemName.toLowerCase().includes(key.toLowerCase())
  );

  if (!found) return;

  const [name, config] = found;

  // Get the problem ID from the encounter
  const probResult = await runQuery(`
    MATCH (e:Encounter {id: $encounterId})-[:HAS_PROBLEM]->(pb:Problem)
    WHERE pb.name CONTAINS $problemName
    RETURN pb.id as problemId LIMIT 1
  `, { encounterId, problemName });

  if (!probResult.records.length) return;

  const problemId = probResult.records[0].get('problemId');

  const { v4: uuidv4 } = await import('uuid');
  for (const param of config.parameters) {
    await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MERGE (m:Monitoring {id: $monitoringId})
    SET m.parameter = $param, m.frequency = $frequency,
        m.status = 'active', m.createdAt = datetime()
    MERGE (e)-[:MONITORS]->(m)
  `, {
    encounterId,
    monitoringId: `mon_${uuidv4()}`,
    param,
    frequency: config.frequency,
    problemId,
  });
    await runQuery(`
      MATCH (pb:Problem {id: $problemId})
      MATCH (m:Monitoring {parameter: $param})
      WHERE (m)-[:MONITORS_FOR]->(pb) IS NULL
      MERGE (pb)-[:TRIGGERS_MONITORING]->(m)
    `, { problemId, param });
  }
}

export default {
  syncDiseaseNodeToGraph,
  buildKnowledgeGraph,
  queryByFeatureMatch,
  queryDrugsForDiagnosis,
  queryGuideline: queryGuidelines,
  queryDifferentialFromEvidence,
  createMonitoringFromProblem,
};