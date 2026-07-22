import neo4j, { Driver, Session, Result } from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'amexan_secret';

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  }
  return driver;
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export async function runQuery(query: string, params: Record<string, unknown> = {}): Promise<Result> {
  const session: Session = getDriver().session();
  try {
    return await session.run(query, params);
  } finally {
    await session.close();
  }
}

/**
 * Initialize the knowledge graph with constraints and indexes
 */
export async function initializeKnowledgeGraph(): Promise<void> {
  const queries = [
    'CREATE CONSTRAINT IF NOT EXISTS FOR (p:Patient) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (e:Encounter) REQUIRE e.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (d:Disease) REQUIRE d.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (s:Symptom) REQUIRE s.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (f:Finding) REQUIRE f.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (m:Medication) REQUIRE m.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (o:Order) REQUIRE o.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (r:Reference) REQUIRE r.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (g:Guideline) REQUIRE g.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (db:BodySystem) REQUIRE db.id IS UNIQUE',
    'CREATE INDEX IF NOT EXISTS FOR (e:Encounter) ON (e.patientId)',
    'CREATE INDEX IF NOT EXISTS FOR (e:Encounter) ON (e.hospitalId)',
    'CREATE INDEX IF NOT EXISTS FOR (d:Disease) ON (d.icdCode)',
    'CREATE INDEX IF NOT EXISTS FOR (s:Symptom) ON (s.name)',
  ];
  for (const query of queries) {
    await runQuery(query);
  }
}

/**
 * ============================================================
 * AMEXAN CONSTITUTION KNOWLEDGE GRAPH — UNIVERSAL DATA MODEL
 * ============================================================
 *
 * Every clinical entity is a node. Every relationship is typed.
 * No disease-modules — just connected knowledge.
 */

// ─── PATIENT ─────────────────────────────────────────────────
export async function createPatientNode(data: {
  id: string; name: string; age: number; gender: string;
  bloodGroup?: string; genotype?: string; allergies?: string[];
}) {
  return runQuery(`
    MERGE (p:Patient {id: $id})
    SET p.name = $name, p.age = $age, p.gender = $gender,
        p.bloodGroup = $bloodGroup, p.genotype = $genotype,
        p.allergies = $allergies, p.updatedAt = datetime()
  `, data);
}

// ─── ENCOUNTER ───────────────────────────────────────────────
export async function createEncounter(data: {
  id: string; patientId: string; hospitalId: string;
  department: string; bedNumber?: number; admittedAt: string;
  chiefComplaint: string; acuity: string; status: string;
}) {
  await runQuery(`
    MERGE (e:Encounter {id: $id})
    SET e.hospitalId = $hospitalId, e.department = $department,
        e.bedNumber = $bedNumber, e.admittedAt = datetime($admittedAt),
        e.chiefComplaint = $chiefComplaint, e.acuity = $acuity,
        e.status = $status, e.updatedAt = datetime()
  `, data);
  await runQuery(`
    MATCH (p:Patient {id: $patientId})
    MATCH (e:Encounter {id: $id})
    MERGE (p)-[:HAS_ENCOUNTER]->(e)
  `, { patientId: data.patientId, id: data.id });
}

// ─── EVIDENCE GRAPH ──────────────────────────────────────────
export async function addEvidence(data: {
  encounterId: string; evidenceId: string; type: string;
  category: string; name: string; value: string; timestamp: string;
  source: string; confidence: number;
}) {
  await runQuery(`
    MERGE (ev:Evidence {id: $evidenceId})
    SET ev.type = $type, ev.category = $category, ev.name = $name,
        ev.value = $value, ev.timestamp = datetime($timestamp),
        ev.source = $source, ev.confidence = $confidence
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (ev:Evidence {id: $evidenceId})
    MERGE (e)-[:HAS_EVIDENCE]->(ev)
  `, { encounterId: data.encounterId, evidenceId: data.evidenceId });
}

// ─── PROBLEMS (Problem-Oriented Medical Record) ───────────────
export async function addProblem(data: {
  id: string; encounterId: string; name: string;
  status: 'active' | 'resolved' | 'monitoring';
  severity: string; onsetAt: string; source: string;
}) {
  await runQuery(`
    MERGE (pb:Problem {id: $id})
    SET pb.name = $name, pb.status = $status,
        pb.severity = $severity, pb.onset = datetime($onset),
        pb.source = $source
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (pb:Problem {id: $id})
    MERGE (e)-[:HAS_PROBLEM]->(pb)
  `, { encounterId: data.encounterId, id: data.id });
}

export async function resolveProblem(problemId: string) {
  return runQuery(`
    MATCH (pb:Problem {id: $problemId})
    SET pb.status = 'resolved', pb.resolvedAt = datetime()
  `, { problemId });
}

// ─── ORDERS (Universal Orders Engine) ──────────────────────────
export async function createOrder(data: {
  id: string; encounterId: string; type: string; subtype: string;
  description: string; status: string; urgency: string;
  orderedBy: string; orderedAt: string; clinicalQuestion?: string;
}) {
  await runQuery(`
    MERGE (o:Order {id: $id})
    SET o.type = $type, o.subtype = $subtype, o.description = $description,
        o.status = $status, o.urgency = $urgency,
        o.orderedBy = $orderedBy, o.orderedAt = datetime($orderedAt),
        o.clinicalQuestion = $clinicalQuestion
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (o:Order {id: $id})
    MERGE (e)-[:HAS_ORDER]->(o)
  `, { encounterId: data.encounterId, id: data.id });
}

export async function createMedicationOrder(data: {
  id: string; orderId: string; drugName: string; dose: string;
  doseValue: number; doseUnit: string; route: string;
  frequency: string; duration: string; indication: string;
  weightBased: boolean; monitoring: string[];
}) {
  await runQuery(`
    MATCH (o:Order {id: $orderId})
    MERGE (m:Medication {id: $id})
    SET m.drugName = $drugName, m.dose = $dose, m.doseValue = $doseValue,
        m.doseUnit = $doseUnit, m.route = $route, m.frequency = $frequency,
        m.duration = $duration, m.indication = $indication,
        m.weightBased = $weight, m.monitoring = $monitoring
    MERGE (o)-[:PRESCRIBES]->(m)
  `, { ...data, orderId: data.orderId });
}

export async function createBloodProductOrder(data: {
  id: string; orderId: string; product: string; volume: string;
  indication: string; crossmatchRequired: boolean;
  monitoring: string[];
}) {
  await runQuery(`
    MATCH (o:Order {id: $orderId})
    MERGE (b:BloodProduct {id: $id})
    SET b.product = $product, b.volume = $volume, b.indication = $indication,
        b.crossmatch = $crossmatch, b.monitoring = $monitoring
    MERGE (o)-[:REQUESTS]->(b)
  `, { ...data, crossmatch: data.crossmatchRequired });
}

export async function createImagingOrder(data: {
  id: string; orderId: string; study: string; bodyPart: string;
  clinicalQuestion: string; urgency: string; contrast: boolean;
  reason: string; previousImaging: string; expectedFinding: string;
}) {
  await runQuery(`
    MATCH (o:Order {id: $orderId})
    MERGE (img:Imaging {id: $id})
    SET img.study = $study, img.bodyPart = $bodyPart,
        img.clinicalQuestion = $clinicalQuestion, img.urgency = $urgency,
        img.contrast = $contrast, img.reason = $reason,
        img.previousImaging = $previousImaging,
        img.expectedFinding = $expectedFinding
    MERGE (o)-[:REQUESTS_IMAGING]->(img)
  `, { ...data, orderId: data.orderId });
}

// ─── MONITORING ENGINE ────────────────────────────────────────
export async function createMonitoring(data: {
  id: string; encounterId: string; problemId: string;
  parameter: string; frequency: string; targetRange: string;
  alertThreshold: string; escalationRule: string; status: string;
}) {
  await runQuery(`
    MERGE (m:Monitoring {id: $id})
    SET m.parameter = $parameter, m.frequency = $frequency,
        m.targetRange = $targetRange, m.alertLevel = $alertLevel,
        m.escalationRule = $escalationRule, m.status = $status
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (m:Monitoring {id: $id})
    MERGE (e)-[:MONITORS]->(m)
  `, { encounterId: data.encounterId, id: data.id });
  await runQuery(`
    MATCH (pb:Problem {id: $problemId})
    MATCH (m:Monitoring {id: $id})
    MERGE (pb)-[:TRIGGERS_MONITORING]->(m)
  `, { problemId: data.problemId, id: data.id });
}

// ─── TIMELINE ENGINE ──────────────────────────────────────────────────
export async function addTimelineEvent(data: {
  id: string; encounterId: string; timestamp: string;
  eventType: string; title: string; description: string;
  category: 'arrival' | 'vitals' | 'history' | 'exam' | 'lab' |
    'imaging' | 'diagnosis' | 'medication' | 'order' | 'procedure' |
    'monitoring' | 'decision' | 'outcome' | 'discharge';
  severity?: string; actor?: string;
}) {
  await runQuery(`
    MERGE (tl:TimelineEvent {id: $id})
    SET tl.timestamp = datetime($timestamp), tl.eventType = $eventType,
        tl.title = $title, tl.description = $description,
        tl.category = $category, tl.severity = $severity,
        tl.actor = $actor
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (tl:TimelineEvent {id: $id})
    MERGE (e)-[:TIMELINE]->(tl)
  `, { encounterId: data.encounterId, id: data.id });
  await runQuery(`
    MATCH (tl:TimelineEvent {id: $id})
    MATCH (prev:TimelineEvent)
    WHERE prev.id < $id AND prev.encounterId = $encounterId
    WITH tl, prev ORDER BY prev.timestamp DESC LIMIT 1
    MERGE (prev)-[:NEXT]->(tl)
  `, { id: data.id, encounterId: data.encounterId });
}

// ─── DIAGNOSIS ──────────────────────────────────────────────────
export async function addDiagnosis(data: {
  id: string; encounterId: string; diseaseId: string;
  name: string; icdCode: string; confidence: number;
  isPrimary: boolean; status: string; madeAt: string;
}) {
  await runQuery(`
    MERGE (d:Diagnosis {id: $id})
    SET d.diseaseId = $diseaseId, d.name = $name, d.icdCode = $icdCode,
        d.confidence = $confidence, d.isPrimary = $isPrimary,
        d.status = $status, d.madeAt = datetime($madeAt)
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (d:Diagnosis {id: $id})
    MERGE (e)-[:DIAGNOSED]->(d)
  `, { encounterId: data.encounterId, id: data.id });
}

// ─── MANAGEMENT ────────────────────────────────────────────────
export async function addManagementPlan(data: {
  id: string; encounterId: string; diagnosisId: string;
  plan: string; goals: string[]; instructions: string;
  reviewedBy: string; createdAt: string;
}) {
  await runQuery(`
    MERGE (mp:ManagementPlan {id: $id})
    SET mp.plan = $plan, mp.goals = $goals, mp.instructions = $instructions,
        mp.reviewedBy = $reviewedBy, mp.createdAt = datetime($createdAt)
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (mp:ManagementPlan {id: $id})
    MERGE (e)-[:MANAGED_BY]->(mp)
  `, { encounterId: data.encounterId, id: data.id });
}

// ─── DISPOSITION ────────────────────────────────────────────────
export async function setDisposition(data: {
  id: string; encounterId: string; type: string;
  destination: string; reason: string; criteria: string[];
  scheduledDate: string; status: string;
}) {
  await runQuery(`
    MERGE (dp:Disposition {id: $id})
    SET dp.type = $type, dp.destination = $destination,
        dp.reason = $reason, dp.criteria = $criteria,
        dp.scheduledDate = datetime($scheduledDate), dp.status = $status
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (dp:Disposition {id: $id})
    MERGE (e)-[:DISPOSITION]->(dp)
  `, { encounterId: data.encounterId, id: data.id });
}

// ============================================================
// KNOWLEDGE GRAPH — UNIVERSAL MEDICAL KNOWLEDGE
// ============================================================

// ─── DISEASE NODES ──────────────────────────────────────────────
export async function createDiseaseNode(data: {
  id: string; name: string; icdCode: string; system: string;
  organSystem: string; acuity: string; acuityTier: number;
  description: string; epidemiology: string;
  averageDurationDays: number; mortalityRate: number;
}) {
  return runQuery(`
    MERGE (d:Disease {id: $id})
    SET d.name = $name, d.icdCode = $icdCode, d.system = $system,
        d.organSystem = $organSystem, d.acuity = $acuity,
        d.acuityTier = $acuityTier, d.description = $description,
        d.epidemiology = $epidemiology,
        d.averageDurationDays = $averageDurationDays,
        d.mortalityRate = $mortalityRate
  `, data);
}

// ─── SYMPTOM RELATIONSHIPS ──────────────────────────────────────
export async function linkSymptomToDisease(data: {
  diseaseId: string; symptomId: string; label: string;
  sensitivity: number; specificity: number;
  stageRelevance: number; isRedFlag: boolean;
}) {
  await runQuery(`
    MERGE (s:Symptom {id: $symptomId})
    SET s.label = $label
  `, data);
  await runQuery(`
    MATCH (d:Disease {id: $diseaseId})
    MATCH (s:Symptom {id: $symptomId})
    MERGE (d)-[:HAS_SYMPTOM {
      sensitivity: $sensitivity, specificity: $specificity,
      stageRelevance: $stageRelevance, isRedFlag: $isRedFlag
    }]->(s)
  `, data);
}

// ─── MEDICATION ― DRUG ─────────────────────────────────────────────
export async function createDrugNode(data: {
  id: string; name: string; genericName: string; mechanism: string;
  indications: string[]; contraindications: string[];
  interactions: string[]; dose: string; monitoring: string[];
  pregnancyCategory: string; pediatricDose: string; renalDose: string;
  liverDose: string; alternatives: string[];
}) {
  return runQuery(`
    MERGE (dr:Drug {id: $id})
    SET dr.name = $name, dr.genericName = $genericName,
        dr.mechanism = $mechanism, dr.indications = $indications,
        dr.contraindications = $contraindications,
        dr.interactions = $interactions, dr.dose = $dose,
        dr.monitoring = $monitoring,
        dr.pregnancyCategory = $pregnancyCategory,
        dr.pediatricDose = $pediatricDose, dr.renalDose = $renalDose,
        dr.liverDose = $liverDose, dr.alternatives = $alternatives
  `, data);
}

export async function linkDrugToDisease(data: {
  drugId: string; diseaseId: string; indication: string;
  isFirstLine: boolean; evidenceLevel: string;
}) {
  return runQuery(`
    MATCH (drug:Drug {id: $drugId})
    MATCH (d:Disease {id: $diseaseId})
    MERGE (drug)-[:TREATS {
      indication: $indication, isFirstLine: $isFirstLine,
      evidenceLevel: $evidenceLevel
    }]->(d)
  `, data);
}

// ─── GUIDELINE OBJECTS ──────────────────────────────────────────
export async function createGuideline(data: {
  id: string; name: string; organization: string; year: number;
  diseaseId: string; eligibility: string; diagnosisCriteria: string;
  recommendations: string; evidence: string; exceptions: string;
}) {
  await runQuery(`
    MERGE (g:Guideline {id: $id})
    SET g.name = $name, g.organization = $organization, g.year = $year,
        g.eligibility = $eligibility, g.diagnosisCriteria = $diagnosisCriteria,
        g.recommendations = $recommendations, g.evidence = $evidence,
        g.exceptions = $exceptions
  `, data);
  await runQuery(`
    MATCH (d:Disease {id: $diseaseId})
    MATCH (g:Guideline {id: $id})
    MERGE (d)-[:HAS_GUIDELINE]->(g)
  `, { diseaseId: data.diseaseId, id: data.id });
}

// ─── ANATOMY ───────────────────────────────────────────────────
export async function createAnatomyNode(data: {
  id: string; name: string; parentStructure?: string;
  bodySystem: string; function: string; commonPathologies: string[];
}) {
  await runQuery(`
    MERGE (a:Anatomy {id: $id})
    SET a.name = $name, a.bodySystem = $bodySystem,
        a.function = $function, a.commonPathologies = $commonPathologies
  `, data);
  if (data.parentStructure) {
    await runQuery(`
      MATCH (parent:Anatomy {id: $parentStructure})
      MATCH (child:Anatomy {id: $id})
      MERGE (parent)-[:CONTAINS]->(child)
    `, { parentStructure: data.parentStructure, id: data.id });
  }
}

// ─── SCORES (Reusable clinical scoring systems) ─────────────────
export async function createScore(data: {
  id: string; name: string; type: string; inputs: string[];
  calculation: string; interpretation: string; meaning: string;
  managementImplications: string;
}) {
  return runQuery(`
    MERGE (s:Score {id: $id})
    SET s.name = $name, s.type = $type, s.inputs = $inputs,
        s.calculation = $calculation, s.interpretation = $interpretation,
        s.meaning = $meaning, s.managementImplications = $managementImplications
  `, data);
}

export async function linkScoreToDisease(data: {
  scoreId: string; diseaseId: string; role: string;
}) {
  return runQuery(`
    MATCH (s:Score {id: $scoreId})
    MATCH (d:Disease {id: $diseaseId})
    MERGE (d)-[:HAS_SCORE {role: $role}]->(s)
  `, data);
}

// ─── REFERENCE OBJECTS (Normal values) ──────────────────────────
export async function createReference(data: {
  id: string; parameter: string; ageMin: number; ageMax: number;
  sex: string; pregnancyStatus: string; altitude: string;
  rangeLow: number; rangeHigh: number; units: string;
  evidence: string;
}) {
  return runQuery(`
    MERGE (r:Reference {id: $id})
    SET r.parameter = $parameter, r.ageMin = $ageMin, r.ageMax = $ageMax,
        r.sex = $sex, r.pregnancyStatus = $pregnancyStatus,
        r.altitude = $altitude, r.rangeLow = $rangeLow,
        r.rangeHigh = $rangeHigh, r.units = $units, r.evidence = $evidence
  `, data);
}

// ─── PROCEDURES ───────────────────────────────────────────────
export async function createProcedure(data: {
  id: string; name: string; category: string;
  indications: string[]; contraindications: string[];
  steps: string[]; complications: string[];
  averageDuration: number; recoveryTime: string;
}) {
  return runQuery(`
    MERGE (p:Procedure {id: $id})
    SET p.name = $name, p.category = $category,
        p.indications = $indications, p.contraindications = $contraindications,
        p.steps = $steps, p.complications = $complications,
        p.averageDuration = $averageDuration, p.recoveryTime = $recoveryTime
  `, data);
}

// ============================================================
// QUERY FUNCTIONS
// ============================================================

export async function getEncounterTimeline(encounterId: string) {
  const result = await runQuery(`
    MATCH (e:Encounter {id: $encounterId})-[:TIMELINE]->(tl:TimelineEvent)
    RETURN tl ORDER BY tl.timestamp ASC
  `, { encounterId });
  return result.records.map(r => r.get('tl').properties);
}

export async function getPatientProblems(encounterId: string) {
  const result = await runQuery(`
    MATCH (e:Encounter {id: $encounterId})-[:HAS_PROBLEM]->(pb:Problem)
    RETURN pb ORDER BY pb.status
  `, { encounterId });
  return result.records.map(r => r.get('pb').properties);
}

export async function getActiveMonitoring(encounterId: string) {
  const result = await runQuery(`
    MATCH (e:Encounter {id: $encounterId})-[:MONITORS]->(m:Monitoring)
    WHERE m.status = 'active'
    RETURN m
  `, { encounterId });
  return result.records.map(r => r.get('m').properties);
}

export async function getDiseaseDdx(encounterId: string) {
  const result = await runQuery(`
    MATCH (e:Encounter {id: $encounterId})-[:HAS_EVIDENCE]->(ev:Evidence)
    MATCH (d:Disease)
    MATCH (d)-[:HAS_SYMPTOM]->(s:Symptom)
    WHERE s.label CONTAINS ev.value
    RETURN d, count(s) as matchCount
    ORDER BY matchCount DESC LIMIT 10
  `, { encounterId });
  return result.records.map(r => ({
    disease: r.get('d').properties,
    matchCount: r.get('matchCount').toNumber(),
  }));
}

export async function getKnowledgeGraphStats() {
  const counts = await Promise.all([
    runQuery('MATCH (n) RETURN count(n) as total'),
    runQuery('MATCH ()-[r]->() RETURN count(r) as total'),
    runQuery('MATCH (d:Disease) RETURN count(d) as count'),
    runQuery('MATCH (s:Symptom) RETURN count(s) as count'),
    runQuery('MATCH (drug:Drug) RETURN count(drug) as count'),
    runQuery('MATCH (g:Guideline) RETURN count(g) as count'),
  ]);
  return {
    totalNodes: counts[0].records[0].get('total').toNumber(),
    totalRelationships: counts[1].records[0].get('total').toNumber(),
    diseases: counts[2].records[0].get('count').toNumber(),
    symptoms: counts[3].records[0].get('count').toNumber(),
    drugs: counts[4].records[0].get('count').toNumber(),
    guidelines: counts[5].records[0].get('count').toNumber(),
  };
}

export async function getWardRoundData(hospitalId: string, department: string) {
  const result = await runQuery(`
    MATCH (p:Patient)-[:HAS_ENCOUNTER]->(e:Encounter)
    WHERE e.hospitalId = $hospitalId AND e.department = $department
      AND e.status = 'active'
    OPTIONAL MATCH (e)-[:HAS_PROBLEM]->(pb:Problem)
    OPTIONAL MATCH (e)-[:MONITORS]->(m:Monitoring)
    RETURN p, e,
      collect(DISTINCT pb) as problems,
      collect(DISTINCT m) as monitoring
    ORDER BY e.bedNumber
  `, { hospitalId, department });
  return result.records.map(r => ({
    patient: r.get('p').properties,
    encounter: r.get('e').properties,
    problems: r.get('problems').map((n: any) => n.properties),
    monitoring: r.get('monitoring').map((n: any) => n.properties),
  }));
}

// ─── LEARNING ENGINE ──────────────────────────────────────────
export async function addEncounterToLearning(data: {
  diseaseId: string; age: number; gender: string;
  lengthOfStay: number; outcome: string;
  hemoglobinAtAdmission: number; treatmentTiming: string;
  complications: string[]; recovered: boolean;
}) {
  return runQuery(`
    MATCH (d:Disease {id: $diseaseId})
    CREATE (l:LearningRecord {
      age: $age, gender: $gender, lengthOfStay: $lengthOfStay,
      outcome: $outcome, hemoglobinAtAdmission: $hemoglobinAtAdmission,
      treatmentTiming: $treatmentTiming, complications: $complications,
      recovered: $recovered, recordedAt: datetime()
    })
    MERGE (d)-[:LEARNING_FROM]->(l)
  `, data);
}

export async function getDiseaseAnalytics(diseaseId: string) {
  const result = await runQuery(`
    MATCH (d:Disease {id: $diseaseId})-[:LEARNING_FROM]->(l:Learning)
    RETURN
      count(l) as totalCases,
      avg(l.lengthOfStay) as avgLos,
      avg(l.hemoglobinAtAdmission) as avgHb,
      sum(CASE WHEN l.recovered THEN 1 ELSE 0 END) * 1.0 / count(l) as recoveryRate,
      l.age, l.complications
  `, { diseaseId });
  if (!result.records.length) return null;
  const r = result.records[0];
  return {
    totalCases: r.get('totalCases').toNumber(),
    avgLos: r.get('avgLos')?.toNumber() || 0,
    avgHb: r.get('avgHb')?.toNumber() || 0,
    recoveryRate: r.get('recoveryRate')?.toNumber() || 0,
  };
}

// ─── DOCUMENTATION ENGINE ──────────────────────────────────────
export async function generateDocument(encounterId: string, type: string) {
  const result = await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    OPTIONAL MATCH (e)-[:HAS_PROBLEM]->(pb:Problem)
    OPTIONAL MATCH (e)-[:DIAGNOSED]->(d:Diagnosis)
    OPTIONAL MATCH (e)-[:HAS_ORDER]->(o:Order)-[:PRESCRIBES]->(m:Medication)
    OPTIONAL MATCH (e)-[:TIMELINE]->(tl:TimelineEvent)
    OPTIONAL MATCH (e)-[:MANAGED_BY]->(mp:ManagementPlan)
    RETURN e, collect(DISTINCT pb) as problems,
           collect(DISTINCT d) as diagnoses,
           collect(DISTINCT o) as orders,
           collect(DISTINCT m) as medications,
           collect(DISTINCT tl) as timeline,
           mp
  `, { encounterId });
  return result.records[0];
}

/**
 * CRITICAL: Get all relationships for the clinical reasoning engine
 */
export async function getEvidenceGraphForReasoning(encounterId: string) {
  const result = await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    OPTIONAL MATCH (e)-[:HAS_EVIDENCE]->(ev:Evidence)
    OPTIONAL MATCH (e)-[:HAS_PROBLEM]->(pb:Problem)
    OPTIONAL MATCH (e)-[:DIAGNOSED]->(dg:Diagnosis)
    OPTIONAL MATCH (e)-[:HAS_ORDER]->(o:Order)
    OPTIONAL MATCH (dg)-[:DIFFERENTIAL]->(other:Diagnosis)

    // Knowledge graph links
    OPTIONAL MATCH (d:Disease)-[:HAS_GUIDELINE]->(g:Guideline)
    OPTIONAL MATCH (drug:Drug)-[:TREATS]->(d)
    OPTIONAL MATCH (s:Score)-[:USED_IN]->(e)

    RETURN e, collect(DISTINCT ev) as evidence,
           collect(DISTINCT pb) as problems,
           collect(DISTINCT dg) as diagnoses,
           collect(DISTINCT o) as orders,
           collect(DISTINCT d) as diseases,
           collect(DISTINCT g) as guidelines,
           collect(DISTINCT drug) as drugs
  `, { encounterId });
  return result.records[0];
}

// ─── DEPARTMENT AND HOSPITAL ──────────────────────────────────
export async function getDepartmentSummary(hospitalId: string, department: string) {
  const result = await runQuery(`
    MATCH (e:Encounter {hospitalId: $hospitalId, department: $department})
    WHERE e.status = 'active'
    OPTIONAL MATCH (e)-[:HAS_PROBLEM]->(pb:Problem)
    OPTIONAL MATCH (e)-[:MONITORS]->(m:Monitoring)
    RETURN count(e) as total,
           sum(CASE WHEN e.acuity = 'critical' THEN 1 ELSE 0 END) as critical,
           sum(CASE WHEN e.acuity = 'urgent' THEN 1 ELSE 0 END) as urgent,
           sum(CASE WHEN e.acuity = 'routine' THEN 1 ELSE 0 END) as routine,
           collect(DISTINCT pb.name) as problemTypes
  `, { hospitalId, department });
  return result.records[0];
}

export async function runCypherQuery(query: string, params: Record<string, unknown> = {}) {
  return runQuery(query, params);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLINICAL CONSTITUTION — Neo4j Extensions
// Book II Vol I: Patient Journey Graph
// Book II Vol II: Encounter Graph
// Book II Vol III: Workflow Graph
// Book III Vol I: Doctor ADOS Graph
// ═══════════════════════════════════════════════════════════════════════════════

// ── Extended Initialization ──────────────────────────────────────────────────

export async function initializeClinicalConstitutionGraph(): Promise<void> {
  const queries = [
    'CREATE CONSTRAINT IF NOT EXISTS FOR (cf:ClinicalFact) REQUIRE cf.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (ep:EpisodeOfCare) REQUIRE ep.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (wf:WorkflowInstance) REQUIRE wf.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (t:ClinicalTask) REQUIRE t.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (q:ClinicalQueue) REQUIRE q.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (wr:WardRound) REQUIRE wr.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (ho:HandoverNote) REQUIRE ho.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (cg:CareGap) REQUIRE cg.id IS UNIQUE',
    'CREATE INDEX IF NOT EXISTS FOR (cf:ClinicalFact) ON (cf.patientId)',
    'CREATE INDEX IF NOT EXISTS FOR (cf:ClinicalFact) ON (cf.trustLayer)',
    'CREATE INDEX IF NOT EXISTS FOR (wf:WorkflowInstance) ON (wf.patientId)',
    'CREATE INDEX IF NOT EXISTS FOR (wf:WorkflowInstance) ON (wf.currentState)',
    'CREATE INDEX IF NOT EXISTS FOR (t:ClinicalTask) ON (t.assignedTo)',
    'CREATE INDEX IF NOT EXISTS FOR (t:ClinicalTask) ON (t.status)',
    'CREATE INDEX IF NOT EXISTS FOR (q:ClinicalQueue) ON (q.departmentId)',
  ];
  for (const query of queries) {
    await runQuery(query);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// BOOK II VOL I: PATIENT JOURNEY GRAPH
// ══════════════════════════════════════════════════════════════════════════════

// ── ClinicalFact Node ────────────────────────────────────────────────────────

export async function createClinicalFactNode(data: {
  id: string; patientId: string; trustLayer: number;
  category: string; timestamp: string; recordedAt: string;
  observations: string; provenance: string;
  episodeId?: string; encounterId?: string;
  status: string;
}) {
  await runQuery(`
    MERGE (cf:ClinicalFact {id: $id})
    SET cf.patientId = $patientId, cf.trustLayer = $trustLayer,
        cf.category = $category, cf.timestamp = datetime($timestamp),
        cf.recordedAt = datetime($recordedAt),
        cf.observations = $observations,
        cf.provenance = $provenance,
        cf.status = $status, cf.updatedAt = datetime()
  `, data);
  await runQuery(`
    MATCH (p:Patient {id: $patientId})
    MATCH (cf:ClinicalFact {id: $id})
    MERGE (p)-[:HAS_FACT]->(cf)
  `, { patientId: data.patientId, id: data.id });
  if (data.episodeId) {
    await runQuery(`
      MATCH (ep:EpisodeOfCare {id: $episodeId})
      MATCH (cf:ClinicalFact {id: $id})
      MERGE (ep)-[:CONTAINS_FACT]->(cf)
    `, { episodeId: data.episodeId, id: data.id });
  }
}

// ── EpisodeOfCare Node ───────────────────────────────────────────────────────

export async function createEpisodeOfCareNode(data: {
  id: string; patientId: string; name: string; type: string;
  status: string; startDate: string; endDate?: string;
  leadClinicianId?: string; primaryOrganizationId?: string;
}) {
  await runQuery(`
    MERGE (ep:EpisodeOfCare {id: $id})
    SET ep.patientId = $patientId, ep.name = $name, ep.type = $type,
        ep.status = $status, ep.startDate = datetime($startDate),
        ep.leadClinicianId = $leadClinicianId,
        ep.primaryOrganizationId = $primaryOrganizationId,
        ep.updatedAt = datetime()
  `, data);
  if (data.endDate) {
    await runQuery(`MATCH (ep:EpisodeOfCare {id: $id}) SET ep.endDate = datetime($endDate)`, { id: data.id, endDate: data.endDate });
  }
  await runQuery(`
    MATCH (p:Patient {id: $patientId})
    MATCH (ep:EpisodeOfCare {id: $id})
    MERGE (p)-[:HAS_EPISODE]->(ep)
  `, { patientId: data.patientId, id: data.id });
}

// ── CareNetwork Node ─────────────────────────────────────────────────────────

export async function createCareNetworkNode(data: {
  id: string; patientId: string;
}) {
  await runQuery(`
    MERGE (cn:CareNetwork {id: $id})
    SET cn.patientId = $patientId, cn.createdAt = datetime()
  `, data);
  await runQuery(`
    MATCH (p:Patient {id: $patientId})
    MATCH (cn:CareNetwork {id: $id})
    MERGE (p)-[:HAS_CARE_NETWORK]->(cn)
  `, { patientId: data.patientId, id: data.id });
}

// ── ConsentDirective Node ────────────────────────────────────────────────────

export async function createConsentNode(data: {
  id: string; patientId: string; granteeId: string;
  granteeName: string; scope: string; validFrom: string;
  validUntil?: string; revoked: boolean;
}) {
  await runQuery(`
    MERGE (c:ConsentDirective {id: $id})
    SET c.patientId = $patientId, c.granteeId = $granteeId,
        c.granteeName = $granteeName, c.scope = $scope,
        c.validFrom = datetime($validFrom), c.revoked = $revoked
  `, data);
  if (data.validUntil) {
    await runQuery(`MATCH (c:ConsentDirective {id: $id}) SET c.validUntil = datetime($validUntil)`, { id: data.id, validUntil: data.validUntil });
  }
  await runQuery(`
    MATCH (p:Patient {id: $patientId})
    MATCH (c:ConsentDirective {id: $id})
    MERGE (p)-[:HAS_CONSENT]->(c)
  `, { patientId: data.patientId, id: data.id });
}

// ── CareGap Node ─────────────────────────────────────────────────────────────

export async function createCareGapNode(data: {
  id: string; patientId: string; type: string;
  description: string; status: string;
  episodeId?: string; dueDate?: string;
}) {
  await runQuery(`
    MERGE (cg:CareGap {id: $id})
    SET cg.patientId = $patientId, cg.type = $type,
        cg.description = $description, cg.status = $status,
        cg.detectedAt = datetime()
  `, data);
  if (data.dueDate) {
    await runQuery(`MATCH (cg:CareGap {id: $id}) SET cg.dueDate = datetime($dueDate)`, { id: data.id, dueDate: data.dueDate });
  }
  await runQuery(`
    MATCH (p:Patient {id: $patientId})
    MATCH (cg:CareGap {id: $id})
    MERGE (p)-[:HAS_CARE_GAP]->(cg)
  `, { patientId: data.patientId, id: data.id });
}

// ── Patient Journey Timeline Query ───────────────────────────────────────────

export async function getPatientTimeline(patientId: string, trustLayer?: number) {
  let query = `
    MATCH (p:Patient {id: $patientId})-[:HAS_FACT]->(cf:ClinicalFact)
  `;
  if (trustLayer) {
    query += `WHERE cf.trustLayer = $trustLayer `;
  }
  query += `
    OPTIONAL MATCH (cf)-[:BELONGS_TO_EPISODE]->(ep:EpisodeOfCare)
    RETURN cf, ep
    ORDER BY cf.timestamp ASC
  `;
  const result = await runQuery(query, { patientId, trustLayer });
  return result.records.map(r => ({
    fact: r.get('cf').properties,
    episode: r.get('ep')?.properties ?? null,
  }));
}

export async function getPatientFactsByLayer(patientId: string, trustLayer: number) {
  return getPatientTimeline(patientId, trustLayer);
}

// ── Patient Journey Summary ──────────────────────────────────────────────────

export async function getPatientJourneySummary(patientId: string) {
  const result = await runQuery(`
    MATCH (p:Patient {id: $patientId})
    OPTIONAL MATCH (p)-[:HAS_FACT]->(cf:ClinicalFact)
    OPTIONAL MATCH (p)-[:HAS_EPISODE]->(ep:EpisodeOfCare)
    OPTIONAL MATCH (p)-[:HAS_CARE_GAP]->(cg:CareGap)
    OPTIONAL MATCH (p)-[:HAS_CONSENT]->(c:ConsentDirective)
    RETURN
      count(DISTINCT cf) as factCount,
      count(DISTINCT ep) as episodeCount,
      count(DISTINCT cg) as openGapCount,
      count(DISTINCT c) as consentCount,
      collect(DISTINCT {id: ep.id, name: ep.name, type: ep.type, status: ep.status}) as episodes
  `, { patientId });
  if (!result.records.length) return null;
  const r = result.records[0];
  return {
    factCount: r.get('factCount').toNumber(),
    episodeCount: r.get('episodeCount').toNumber(),
    openGapCount: r.get('openGapCount').toNumber(),
    consentCount: r.get('consentCount').toNumber(),
    episodes: r.get('episodes'),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// BOOK II VOL II: ENCOUNTER GRAPH
// ══════════════════════════════════════════════════════════════════════════════

// ── Encounter Node (Enhanced with 7-component lifecycle) ────────────────────

export async function createEncounterNode(data: {
  id: string; patientId: string; encounterClass: string;
  encounterType: string; organizationId: string; departmentId?: string;
  currentState: string; startTime: string;
  trigger: string; location: string;
  episodeId?: string;
}) {
  await runQuery(`
    MERGE (e:Encounter {id: $id})
    SET e.patientId = $patientId, e.encounterClass = $encounterClass,
        e.encounterType = $encounterType,
        e.organizationId = $organizationId,
        e.departmentId = $departmentId,
        e.currentState = $currentState,
        e.startTime = datetime($startTime),
        e.trigger = $trigger, e.location = $location,
        e.updatedAt = datetime()
  `, data);
  await runQuery(`
    MATCH (p:Patient {id: $patientId})
    MATCH (e:Encounter {id: $id})
    MERGE (p)-[:HAS_ENCOUNTER]->(e)
  `, { patientId: data.patientId, id: data.id });
  if (data.episodeId) {
    await runQuery(`
      MATCH (ep:EpisodeOfCare {id: $episodeId})
      MATCH (e:Encounter {id: $id})
      MERGE (ep)-[:CONTAINS_ENCOUNTER]->(e)
    `, { episodeId: data.episodeId, id: data.id });
  }
}

export async function updateEncounterState(encounterId: string, newState: string) {
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    SET e.currentState = $newState, e.updatedAt = datetime()
  `, { encounterId, newState });
}

// ── Encounter Decision Node ──────────────────────────────────────────────────

export async function createEncounterDecisionNode(data: {
  id: string; encounterId: string; type: string;
  rationale: string; madeBy: string; madeAt: string;
}) {
  await runQuery(`
    MERGE (ed:EncounterDecision {id: $id})
    SET ed.type = $type, ed.rationale = $rationale,
        ed.madeBy = $madeBy, ed.madeAt = datetime($madeAt)
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (ed:EncounterDecision {id: $id})
    MERGE (e)-[:RESULTED_IN]->(ed)
  `, { encounterId: data.encounterId, id: data.id });
}

// ── FollowUpPlan Node ────────────────────────────────────────────────────────

export async function createFollowUpPlanNode(data: {
  id: string; encounterId: string; instructions: string;
  appointments: string; createdBy: string;
}) {
  await runQuery(`
    MERGE (fp:FollowUpPlan {id: $id})
    SET fp.instructions = $instructions, fp.appointments = $appointments,
        fp.createdBy = $createdBy, fp.createdAt = datetime()
  `, data);
  await runQuery(`
    MATCH (e:Encounter {id: $encounterId})
    MATCH (fp:FollowUpPlan {id: $id})
    MERGE (e)-[:FOLLOWS_UP_WITH]->(fp)
  `, { encounterId: data.encounterId, id: data.id });
}

// ══════════════════════════════════════════════════════════════════════════════
// BOOK II VOL III: WORKFLOW GRAPH
// ══════════════════════════════════════════════════════════════════════════════

// ── WorkflowInstance Node ────────────────────────────────────────────────────

export async function createWorkflowInstanceNode(data: {
  id: string; patientId: string; type: string;
  currentState: string; priority: number;
  startedAt: string; expectedCompletionAt?: string;
  organizationId: string; encounterId?: string;
}) {
  await runQuery(`
    MERGE (wf:WorkflowInstance {id: $id})
    SET wf.patientId = $patientId, wf.type = $type,
        wf.currentState = $currentState, wf.priority = $priority,
        wf.startedAt = datetime($startedAt),
        wf.organizationId = $organizationId,
        wf.status = 'active', wf.escalationLevel = 0,
        wf.updatedAt = datetime()
  `, data);
  if (data.expectedCompletionAt) {
    await runQuery(`MATCH (wf:WorkflowInstance {id: $id}) SET wf.expectedCompletionAt = datetime($expectedCompletionAt)`, { id: data.id, expectedCompletionAt: data.expectedCompletionAt });
  }
  await runQuery(`
    MATCH (p:Patient {id: $patientId})
    MATCH (wf:WorkflowInstance {id: $id})
    MERGE (p)-[:HAS_WORKFLOW]->(wf)
  `, { patientId: data.patientId, id: data.id });
  if (data.encounterId) {
    await runQuery(`
      MATCH (e:Encounter {id: $encounterId})
      MATCH (wf:WorkflowInstance {id: $id})
      MERGE (e)-[:TRIGGERS_WORKFLOW]->(wf)
    `, { encounterId: data.encounterId, id: data.id });
  }
}

export async function updateWorkflowState(workflowId: string, newState: string) {
  await runQuery(`
    MATCH (wf:WorkflowInstance {id: $workflowId})
    SET wf.previousState = wf.currentState,
        wf.currentState = $newState,
        wf.updatedAt = datetime()
  `, { workflowId, newState });
}

// ── OwnershipTransfer Node ───────────────────────────────────────────────────

export async function createOwnershipTransferNode(data: {
  id: string; workflowId: string; fromOwner: string;
  fromName: string; toOwner: string; toName: string;
  transferType: string; accepted: boolean;
}) {
  await runQuery(`
    MERGE (ot:OwnershipTransfer {id: $id})
    SET ot.fromOwner = $fromOwner, ot.fromName = $fromName,
        ot.toOwner = $toOwner, ot.toName = $toName,
        ot.transferType = $transferType,
        ot.accepted = $accepted,
        ot.transferredAt = datetime()
  `, data);
  await runQuery(`
    MATCH (wf:WorkflowInstance {id: $workflowId})
    MATCH (ot:OwnershipTransfer {id: $id})
    MERGE (wf)-[:HAS_TRANSFER]->(ot)
  `, { workflowId: data.workflowId, id: data.id });
}

// ── ClinicalTask Node ────────────────────────────────────────────────────────

export async function createClinicalTaskNode(data: {
  id: string; workflowId: string; patientId: string;
  title: string; type: string; priority: number;
  assignedTo?: string; assignedToName?: string;
  assignedBy: string; dueAt?: string;
  clinicalClockTarget?: number;
  encounterId?: string;
}) {
  await runQuery(`
    MERGE (t:ClinicalTask {id: $id})
    SET t.workflowId = $workflowId, t.patientId = $patientId,
        t.title = $title, t.type = $type, t.priority = $priority,
        t.assignedTo = $assignedTo, t.assignedToName = $assignedToName,
        t.assignedBy = $assignedBy,
        t.status = 'pending', t.escalationLevel = 0,
        t.createdAt = datetime()
  `, data);
  if (data.dueAt) {
    await runQuery(`MATCH (t:ClinicalTask {id: $id}) SET t.dueAt = datetime($dueAt)`, { id: data.id, dueAt: data.dueAt });
  }
  if (data.clinicalClockTarget) {
    await runQuery(`MATCH (t:ClinicalTask {id: $id}) SET t.clinicalClockTarget = $clinicalClockTarget`, { id: data.id, clinicalClockTarget: data.clinicalClockTarget });
  }
  await runQuery(`
    MATCH (wf:WorkflowInstance {id: $workflowId})
    MATCH (t:ClinicalTask {id: $id})
    MERGE (wf)-[:HAS_TASK]->(t)
  `, { workflowId: data.workflowId, id: data.id });
}

export async function updateTaskStatus(taskId: string, status: string, assignedTo?: string) {
  const updates: Record<string, any> = { status };
  if (status === 'completed') updates.completedAt = 'datetime()';
  if (assignedTo) updates.assignedTo = assignedTo;
  const setClauses = Object.entries(updates).map(([k, v]) =>
    v === 'datetime()' ? `t.${k} = datetime()` : `t.${k} = $${k}`
  ).join(', ');
  await runQuery(`
    MATCH (t:ClinicalTask {id: $taskId})
    SET ${setClauses}
  `, { taskId, ...updates });
}

// ── Task Escalation ──────────────────────────────────────────────────────────

export async function escalateTaskNode(taskId: string, escalatedTo: string, escalatedToName: string, reason: string, level: number) {
  await runQuery(`
    MATCH (t:ClinicalTask {id: $taskId})
    SET t.status = 'escalated', t.escalationLevel = $level,
        t.updatedAt = datetime()
    MERGE (t)-[:ESCALATED_TO]->(es:Escalation {
      id: $taskId + '_esc_' + $level,
      escalatedTo: $escalatedTo, escalatedToName: $escalatedToName,
      reason: $reason, level: $level,
      escalatedAt: datetime()
    })
  `, { taskId, escalatedTo, escalatedToName, reason, level });
}

// ── ClinicalQueue Node ───────────────────────────────────────────────────────

export async function createClinicalQueueNode(data: {
  id: string; name: string; departmentId: string;
  departmentName: string; organizationId: string; type: string;
}) {
  await runQuery(`
    MERGE (q:ClinicalQueue {id: $id})
    SET q.name = $name, q.departmentId = $departmentId,
        q.departmentName = $departmentName,
        q.organizationId = $organizationId,
        q.type = $type, q.createdAt = datetime()
  `, data);
}

export async function addPatientToQueue(queueId: string, patientId: string, priority: number) {
  await runQuery(`
    MATCH (q:ClinicalQueue {id: $queueId})
    MATCH (p:Patient {id: $patientId})
    MERGE (q)-[:CONTAINS_PATIENT {priority: $priority, addedAt: datetime()}]->(p)
  `, { queueId, patientId, priority });
}

export async function getQueueByPriority(queueId: string) {
  const result = await runQuery(`
    MATCH (q:ClinicalQueue {id: $queueId})-[r:CONTAINS_PATIENT]->(p:Patient)
    RETURN p, r.priority as priority, r.addedAt as addedAt
    ORDER BY r.priority ASC, r.addedAt ASC
  `, { queueId });
  return result.records.map(r => ({
    patient: r.get('p').properties,
    priority: r.get('priority').toNumber(),
    addedAt: r.get('addedAt'),
  }));
}

// ── Workflow Path Query (The Golden Rule) ────────────────────────────────────

export async function getPatientCurrentWorkflow(patientId: string) {
  const result = await runQuery(`
    MATCH (p:Patient {id: $patientId})-[:HAS_WORKFLOW]->(wf:WorkflowInstance)
    WHERE wf.status = 'active'
    OPTIONAL MATCH (wf)-[:HAS_TASK]->(t:ClinicalTask)
    WHERE t.status IN ['pending', 'in_progress', 'overdue', 'escalated']
    OPTIONAL MATCH (wf)-[:HAS_TRANSFER]->(ot:OwnershipTransfer)
    WHERE ot.accepted = false
    RETURN wf,
      collect(DISTINCT {id: t.id, title: t.title, status: t.status, priority: t.priority}) as tasks,
      collect(DISTINCT ot) as pendingTransfers
    ORDER BY wf.priority ASC
    LIMIT 1
  `, { patientId });
  if (!result.records.length) return null;
  const r = result.records[0];
  return {
    workflow: r.get('wf').properties,
    tasks: r.get('tasks'),
    pendingTransfers: r.get('pendingTransfers').map((n: any) => n.properties),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// BOOK III VOL I: DOCTOR ADOS GRAPH
// ══════════════════════════════════════════════════════════════════════════════

// ── WardRound Node ───────────────────────────────────────────────────────────

export async function createWardRoundNode(data: {
  id: string; doctorId: string; wardId: string; wardName: string;
  status: string; startedAt: string;
}) {
  await runQuery(`
    MERGE (wr:WardRound {id: $id})
    SET wr.doctorId = $doctorId, wr.wardId = $wardId,
        wr.wardName = $wardName, wr.status = $status,
        wr.startedAt = datetime($startedAt)
  `, data);
}

export async function addPatientToWardRound(roundId: string, patientId: string, bed: string, order: number) {
  await runQuery(`
    MATCH (wr:WardRound {id: $roundId})
    MATCH (p:Patient {id: $patientId})
    MERGE (wr)-[:INCLUDES_PATIENT {bed: $bed, order: $order, reviewed: false}]->(p)
  `, { roundId, patientId, bed, order });
}

export async function markPatientReviewed(roundId: string, patientId: string) {
  await runQuery(`
    MATCH (wr:WardRound {id: $roundId})-[r:INCLUDES_PATIENT]->(p:Patient {id: $patientId})
    SET r.reviewed = true
  `, { roundId, patientId });
}

// ── HandoverNote Node ────────────────────────────────────────────────────────

export async function createHandoverNoteNode(data: {
  id: string; fromClinicianId: string; fromClinicianName: string;
  toClinicianId: string; toClinicianName: string;
  shift: string; summary: string;
}) {
  await runQuery(`
    MERGE (ho:HandoverNote {id: $id})
    SET ho.fromClinicianId = $fromClinicianId,
        ho.fromClinicianName = $fromClinicianName,
        ho.toClinicianId = $toClinicianId,
        ho.toClinicianName = $toClinicianName,
        ho.shift = $shift, ho.summary = $summary,
        ho.createdAt = datetime()
  `, data);
}

export async function acknowledgeHandoverNode(handoverId: string) {
  await runQuery(`
    MATCH (ho:HandoverNote {id: $handoverId})
    SET ho.acknowledgedAt = datetime()
  `, { handoverId });
}

// ── ADOS Doctor Queries ──────────────────────────────────────────────────────

export async function getDoctorTodayContext(doctorId: string) {
  const result = await runQuery(`
    MATCH (t:ClinicalTask {assignedTo: $doctorId})
    WHERE t.status IN ['pending', 'in_progress', 'overdue', 'escalated']
    OPTIONAL MATCH (t)<-[:HAS_TASK]-(wf:WorkflowInstance)
    OPTIONAL MATCH (wf)-[:BELONGS_TO_PATIENT]->(p:Patient)
    RETURN
      collect(DISTINCT {
        id: t.id, title: t.title, type: t.type,
        priority: t.priority, status: t.status,
        clinicalClockTarget: t.clinicalClockTarget,
        createdAt: t.createdAt
      }) as tasks,
      collect(DISTINCT wf.id) as workflowIds
    ORDER BY t.priority ASC, t.createdAt ASC
  `, { doctorId });
  if (!result.records.length) return null;
  const r = result.records[0];
  return {
    tasks: r.get('tasks'),
    activeWorkflowIds: r.get('workflowIds'),
  };
}

export async function getDecisionsWaiting(doctorId: string) {
  const result = await runQuery(`
    MATCH (t:ClinicalTask {assignedTo: $doctorId})
    WHERE t.type = 'review' AND t.status IN ['pending', 'overdue']
    OPTIONAL MATCH (t)<-[:HAS_TASK]-(wf:WorkflowInstance)
    OPTIONAL MATCH (wf)-[:BELONGS_TO_PATIENT]->(p:Patient)
    RETURN collect(DISTINCT {
      taskId: t.id, title: t.title, status: t.status,
      priority: t.priority, clinicalClockTarget: t.clinicalClockTarget,
      createdAt: t.createdAt
    }) as decisions
    ORDER BY t.priority ASC, t.createdAt ASC
  `, { doctorId });
  return result.records[0]?.get('decisions') ?? [];
}

export async function getWhoNeedsMeFirst(doctorId: string) {
  const result = await runQuery(`
    MATCH (t:ClinicalTask {assignedTo: $doctorId})
    WHERE t.status IN ['pending', 'overdue', 'escalated']
    OPTIONAL MATCH (t)<-[:HAS_TASK]-(wf:WorkflowInstance)
    OPTIONAL MATCH (p:Patient {id: wf.patientId})
    RETURN t, wf, p
    ORDER BY t.priority ASC, t.createdAt ASC
    LIMIT 10
  `, { doctorId });
  return result.records.map(r => ({
    task: r.get('t').properties,
    workflow: r.get('wf')?.properties ?? null,
    patient: r.get('p')?.properties ?? null,
  }));
}

// ── Department Workflow Health ────────────────────────────────────────────────

export async function getDepartmentWorkflowHealth(organizationId: string, departmentId: string) {
  const result = await runQuery(`
    MATCH (wf:WorkflowInstance {organizationId: $organizationId})
    WHERE wf.departmentId = $departmentId OR wf.departmentId IS NULL
    OPTIONAL MATCH (wf)-[:HAS_TASK]->(t:ClinicalTask)
    RETURN
      count(DISTINCT wf) as activeWorkflows,
      count(DISTINCT CASE WHEN wf.status = 'active' THEN wf END) as active,
      count(DISTINCT CASE WHEN wf.priority <= 2 AND wf.status = 'active' THEN wf END) as highRisk,
      count(DISTINCT CASE WHEN t.status = 'pending' AND t.type = 'review' THEN t END) as waitingReviews,
      count(DISTINCT CASE WHEN t.status IN ('overdue', 'escalated') THEN t END) as overdueTasks
  `, { organizationId, departmentId });
  if (!result.records.length) return null;
  const r = result.records[0];
  return {
    activeWorkflows: r.get('activeWorkflows').toNumber(),
    active: r.get('active').toNumber(),
    highRisk: r.get('highRisk').toNumber(),
    waitingReviews: r.get('waitingReviews').toNumber(),
    overdueTasks: r.get('overdueTasks').toNumber(),
  };
}

// ── Care Gap Graph Detection ─────────────────────────────────────────────────
// Uses graph patterns to find missing care relationships

export async function detectCareGapsViaGraph(patientId: string) {
  // Find active episodes and check for missing guideline-recommended actions
  const result = await runQuery(`
    MATCH (p:Patient {id: $patientId})-[:HAS_EPISODE]->(ep:EpisodeOfCare)
    WHERE ep.status IN ['active', 'ongoing_chronic']
    OPTIONAL MATCH (ep)-[:CONTAINS_FACT]->(cf:ClinicalFact)
    WITH ep, collect(DISTINCT cf.category) as factCategories
    RETURN ep.id as episodeId, ep.name as episodeName,
           ep.type as episodeType, factCategories
  `, { patientId });
  return result.records.map(r => ({
    episodeId: r.get('episodeId'),
    episodeName: r.get('episodeName'),
    episodeType: r.get('episodeType'),
    factCategories: r.get('factCategories'),
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// HIGH-LEVEL CONSTITUTION QUERIES
// ══════════════════════════════════════════════════════════════════════════════

// ── Answer ADOS 6 Questions ─────────────────────────────────────────────────

export async function answerADOSQuestionsFromGraph(doctorId: string) {
  const context = await getDoctorTodayContext(doctorId);
  const decisions = await getDecisionsWaiting(doctorId);
  const priorityPatient = await getWhoNeedsMeFirst(doctorId);

  return {
    whereAmI: 'Resolved from schedule + current location',
    myPatients: context?.activeWorkflowIds ?? [],
    whoNeedsMeFirst: priorityPatient[0] ?? null,
    decisionsWaiting: decisions,
    whatHappensNext: [],
    safeHandover: (context?.tasks ?? []).filter((t: any) => t.status !== 'completed').length === 0,
  };
}

// ── Full Patient Journey (all facts, episodes, encounters) ───────────────────

export async function getFullPatientJourney(patientId: string) {
  const result = await runQuery(`
    MATCH (p:Patient {id: $patientId})
    OPTIONAL MATCH (p)-[:HAS_FACT]->(cf:ClinicalFact)
    OPTIONAL MATCH (p)-[:HAS_EPISODE]->(ep:EpisodeOfCare)
    OPTIONAL MATCH (p)-[:HAS_ENCOUNTER]->(e:Encounter)
    OPTIONAL MATCH (e)-[:RESULTED_IN]->(ed:EncounterDecision)
    OPTIONAL MATCH (e)-[:FOLLOWS_UP_WITH]->(fp:FollowUpPlan)
    OPTIONAL MATCH (e)-[:TRIGGERS_WORKFLOW]->(wf:WorkflowInstance)
    OPTIONAL MATCH (p)-[:HAS_CARE_GAP]->(cg:CareGap)
    RETURN
      collect(DISTINCT {id: cf.id, trustLayer: cf.trustLayer,
        category: cf.category, timestamp: cf.timestamp,
        status: cf.status}) as facts,
      collect(DISTINCT {id: ep.id, name: ep.name, type: ep.type,
        status: ep.status, startDate: ep.startDate}) as episodes,
      collect(DISTINCT {id: e.id, type: e.encounterType,
        state: e.currentState, startTime: e.startTime}) as encounters,
      collect(DISTINCT cg) as careGaps
  `, { patientId });
  if (!result.records.length) return null;
  const r = result.records[0];
  return {
    facts: r.get('facts'),
    episodes: r.get('episodes'),
    encounters: r.get('encounters'),
    careGaps: r.get('careGaps').map((n: any) => n.properties),
  };
}

export default {
  // Original exports
  initializeKnowledgeGraph, createPatientNode, createEncounter, addEvidence,
  addProblem, resolveProblem, createOrder, createMedicationOrder,
  createBloodProductOrder, createImagingOrder, createMonitoring,
  addTimelineEvent, addDiagnosis, addManagementPlan, setDisposition,
  createDiseaseNode, linkSymptomToDisease, createDrugNode,
  linkDrugToDisease, createGuideline, createAnatomyNode, createScore,
  linkScoreToDisease, createReference, createProcedure,
  getEncounterTimeline, getPatientProblems, getActiveMonitoring,
  getDiseaseDdx, getKnowledgeGraphStats, getWardRoundData,
  addEncounterToLearning, getDiseaseAnalytics, generateDocument,
  getEvidenceGraphForReasoning, getDepartmentSummary, runCypherQuery,

  // Clinical Constitution extensions
  initializeClinicalConstitutionGraph,
  createClinicalFactNode, createEpisodeOfCareNode,
  createCareNetworkNode, createConsentNode, createCareGapNode,
  getPatientTimeline, getPatientFactsByLayer, getPatientJourneySummary,
  createEncounterNode, updateEncounterState,
  createEncounterDecisionNode, createFollowUpPlanNode,
  createWorkflowInstanceNode, updateWorkflowState,
  createOwnershipTransferNode,
  createClinicalTaskNode, updateTaskStatus, escalateTaskNode,
  createClinicalQueueNode, addPatientToQueue, getQueueByPriority,
  getPatientCurrentWorkflow,
  createWardRoundNode, addPatientToWardRound, markPatientReviewed,
  createHandoverNoteNode, acknowledgeHandoverNode,
  getDoctorTodayContext, getDecisionsWaiting, getWhoNeedsMeFirst,
  getDepartmentWorkflowHealth, detectCareGapsViaGraph,
  answerADOSQuestionsFromGraph, getFullPatientJourney,
};