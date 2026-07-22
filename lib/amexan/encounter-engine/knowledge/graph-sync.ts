// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Symptom Knowledge Graph Sync
// Bridges the SYMPTOM_REGISTRY (TypeScript) → Neo4j (graph database).
// Every SymptomNode.relationship becomes a Neo4j edge.
// ═══════════════════════════════════════════════════════════════════════════════

import type { SymptomNode } from './symptom-types';

// Known symptom IDs from the SYMPTOM_REGISTRY
const SYMPTOM_IDS = ['SX000001', 'SX000002', 'SX000003', 'SX000004', 'SX000005', 'SX000006', 'SX000007', 'SX000008'];

// Lazy import for Neo4j — fails gracefully if unavailable
let neo4jService: any = null;
async function getNeo4j() {
  if (neo4jService === undefined) {
    try {
      neo4jService = await import('../../knowledge-graph/neo4jService');
    } catch {
      neo4jService = null;
    }
  }
  return neo4jService;
}

async function runNeo4jQuery(
  query: string,
  params: Record<string, unknown> = {},
): Promise<{ records: any[] } | null> {
  const neo = await getNeo4j();
  if (!neo) return null;
  try {
    const result = await neo.runQuery(query, params);
    return { records: result.records };
  } catch {
    return null;
  }
}

function getNodeById(id: string): SymptomNode | undefined {
  try {
    const { getSymptomNode } = require('./symptomKnowledge');
    return getSymptomNode(id);
  } catch {
    return undefined;
  }
}

// ─── Sync a single SymptomNode to Neo4j ─────────────────────────────────────

export async function syncSymptomNodeToGraph(node: SymptomNode): Promise<void> {
  const query = `
    MERGE (s:Symptom { id: $id })
    SET
      s.name = $name,
      s.synonyms = $synonyms,
      s.layTerms = $layTerms,
      s.bodySystem = $bodySystem,
      s.specialty = $specialty,
      s.emergencyWeight = $emergencyWeight,
      s.snomed = $snomed,
      s.icd10 = $icd10,
      s.updatedAt = timestamp()
    RETURN s
  `;

  await runNeo4jQuery(query, {
    id: node.identity.id,
    name: node.identity.canonicalName,
    synonyms: node.identity.synonyms,
    layTerms: node.identity.layTerms,
    bodySystem: node.identity.bodySystem,
    specialty: node.identity.primarySpecialty,
    emergencyWeight: node.identity.emergencyWeight,
    snomed: node.identity.snomed || '',
    icd10: node.identity.icd10 || '',
  });
}

// ─── Sync relationships between symptom nodes ───────────────────────────────

export async function syncSymptomRelationshipsToGraph(node: SymptomNode): Promise<void> {
  for (const rel of node.relationships) {
    const query = `
      MATCH (a:Symptom { id: $sourceId })
      MATCH (b:Symptom { id: $targetId })
      MERGE (a)-[r:SYMPTOM_RELATIONSHIP { type: $relType }]->(b)
      SET
        r.strength = $strength,
        r.description = $description,
        r.updatedAt = timestamp()
      RETURN r
    `;

    await runNeo4jQuery(query, {
      sourceId: node.identity.id,
      targetId: rel.targetSymptomId,
      relType: rel.type,
      strength: rel.strength,
      description: rel.description,
    });
  }
}

// ─── Full graph sync — all registered symptom nodes ────────────────────────

export async function syncAllSymptomsToGraph(): Promise<{
  synced: number
  relationships: number
  errors: string[]
}> {
  let synced = 0;
  let relationships = 0;
  const errors: string[] = [];

  for (const id of SYMPTOM_IDS) {
    const node = getNodeById(id);
    if (!node) { errors.push(`Node not found: ${id}`); continue; }

    try {
      await syncSymptomNodeToGraph(node);
      synced++;
      await syncSymptomRelationshipsToGraph(node);
      relationships += node.relationships.length;
    } catch (e) {
      errors.push(`Failed to sync ${node.identity.canonicalName}: ${e}`);
    }
  }

  return { synced, relationships, errors };
}

// ─── Query related symptoms from Neo4j (with static fallback) ──────────────

export async function getRelatedSymptomsFromGraph(
  symptomId: string,
  relationshipType?: string,
): Promise<{ targetId: string; type: string; strength: number; description: string }[]> {
  let query = `
    MATCH (a:Symptom { id: $symptomId })-[r:SYMPTOM_RELATIONSHIP]->(b:Symptom)
  `;
  if (relationshipType) {
    query += ` WHERE r.type = $relType`;
  }
  query += `
    RETURN b.id AS targetId, r.type AS type, r.strength AS strength, r.description AS description
    ORDER BY r.strength DESC
  `;

  const result = await runNeo4jQuery(query, { symptomId, relType: relationshipType || '' });

  if (!result) {
    // Fallback to static relationships from SymptomNode
    return getStaticRelatedSymptoms(symptomId, relationshipType);
  }

  return result.records.map((r: any) => ({
    targetId: r.get('targetId'),
    type: r.get('type'),
    strength: r.get('strength'),
    description: r.get('description'),
  }));
}

function getStaticRelatedSymptoms(
  symptomId: string,
  relationshipType?: string,
): { targetId: string; type: string; strength: number; description: string }[] {
  const node = getNodeById(symptomId);
  if (!node) return [];
  return node.relationships
    .filter(r => !relationshipType || r.type === relationshipType)
    .map(r => ({
      targetId: r.targetSymptomId,
      type: r.type,
      strength: r.strength,
      description: r.description,
    }))
    .sort((a, b) => b.strength - a.strength);
}
