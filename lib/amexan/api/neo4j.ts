import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;
let driverFailed = false;

function getDriver(): Driver | null {
  if (driverFailed) return null;
  if (!driver) {
    try {
      const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
      const user = process.env.NEO4J_USER || 'neo4j';
      const password = process.env.NEO4J_PASSWORD || 'neo4j';
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        connectionTimeout: 3000,
      });
    } catch {
      driverFailed = true;
      return null;
    }
  }
  return driver;
}

function getSession(): Session | null {
  const d = getDriver();
  if (!d) return null;
  return d.session();
}

async function runQuery(cypher: string, params?: Record<string, unknown>) {
  const session = getSession();
  if (!session) return [];
  try {
    const result = await session.run(cypher, params);
    return result.records.map(r => {
      const keys = r.keys;
      const entry: Record<string, unknown> = {};
      for (const key of keys) {
        try {
          const val = r.get(key);
          if (val && typeof val === 'object' && 'properties' in (val as Record<string, unknown>)) {
            const node = val as Record<string, unknown>;
            entry.id = (node.identity as { toString?: () => string })?.toString?.() || null;
            entry.labels = node.labels;
            entry.properties = node.properties;
            Object.assign(entry, node.properties as Record<string, unknown>);
          } else {
            entry[key] = val;
          }
        } catch { /* skip bad key */ }
      }
      return entry;
    });
  } catch (e) {
    console.error('[Neo4j] Query error:', e);
    return [];
  } finally {
    await session.close();
  }
}

// ── Knowledge Graph ──────────────────────────────────────────

export async function getKnowledgeGraphStats() {
  const nodes = await runQuery('MATCH (n) RETURN count(n) as count');
  const rels = await runQuery('MATCH ()-[r]->() RETURN count(r) as count');
  return {
    nodes: (nodes[0] as Record<string, unknown>)?.count || 0,
    relationships: (rels[0] as Record<string, unknown>)?.count || 0,
  };
}

export async function getSymptomDiseases(symptomName: string) {
  return runQuery(
    `MATCH (s:Symptom {name: $name})-[:SUGGESTS]->(d:Disease)
     RETURN d.name as disease, d.description as description`,
    { name: symptomName },
  );
}

export async function getDiseaseDetails(diseaseName: string) {
  return runQuery(
    `MATCH (d:Disease {name: $name})
     OPTIONAL MATCH (d)-[:HAS_SYMPTOM]->(s:Symptom)
     OPTIONAL MATCH (d)-[:INVESTIGATE_WITH]->(i:Investigation)
     OPTIONAL MATCH (d)-[:TREATED_BY]->(dr:Drug)
     OPTIONAL MATCH (d)-[:PART_OF]->(bs:BodySystem)
     RETURN d.name as name, d.description as description,
            collect(DISTINCT s.name) as symptoms,
            collect(DISTINCT i.name) as investigations,
            collect(DISTINCT dr.name) as treatments,
            collect(DISTINCT bs.name) as bodySystems`,
    { name: diseaseName },
  );
}

export async function searchKnowledgeGraph(query_str: string) {
  return runQuery(
    `MATCH (n) WHERE n.name CONTAINS $query OR n.description CONTAINS $query
     RETURN n, labels(n) as labels
     LIMIT 20`,
    { query: query_str },
  );
}

export async function getAllNodes() {
  return runQuery(
    `MATCH (n) RETURN n, labels(n) as labels LIMIT 100`,
  );
}

export async function getNodeRelationships(nodeId: number) {
  return runQuery(
    `MATCH (n)-[r]->(m) WHERE id(n) = $id
     RETURN type(r) as relationship, m, labels(m) as targetLabels
     UNION
     MATCH (n)<-[r]-(m) WHERE id(n) = $id
     RETURN type(r) as relationship, m, labels(m) as targetLabels`,
    { id: nodeId },
  );
}

// ── Patient Journey ──────────────────────────────────────────

export async function getPatientJourney(patientId: string) {
  return runQuery(
    `MATCH (p:Patient {id: $patientId})
     OPTIONAL MATCH (p)-[:HAS_ENCOUNTER]->(e:Encounter)
     OPTIONAL MATCH (e)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
     OPTIONAL MATCH (e)-[:HAS_SYMPTOM]->(s:Symptom)
     OPTIONAL MATCH (e)-[:HAS_MEDICATION]->(m:Medication)
     RETURN p.id as patientId,
            collect(DISTINCT {encounterId: e.id, diagnosis: d.name, symptom: s.name, medication: m.name}) as journey`,
    { patientId },
  );
}

// ── Health check ─────────────────────────────────────────────

export async function healthCheck(): Promise<boolean> {
  try {
    const result = await runQuery('RETURN 1 as ok');
    return result.length > 0;
  } catch {
    return false;
  }
}
