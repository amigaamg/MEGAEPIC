import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT || '5432'),
      database: process.env.PG_DATABASE || 'amexan_clinical_os',
      user: process.env.PG_USER || 'amexan',
      password: process.env.PG_PASSWORD || 'amexan',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query(text: string, params?: unknown[]): Promise<unknown[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function queryOne(text: string, params?: unknown[]): Promise<unknown | null> {
  const rows = await query(text, params);
  return rows[0] || null;
}

export async function execute(text: string, params?: unknown[]): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (e) {
    console.error('[DB health]', e);
    return false;
  }
}

// ── Patient queries ──────────────────────────────────────────

export async function getPatients(search?: string, department?: string) {
  let sql = `
    SELECT p.id, p.given_name, p.family_name, p.date_of_birth,
           p.sex_at_birth as sex, p.age, p.residence, p.occupation,
           p.hospital_number
    FROM patients p
    WHERE 1=1
  `;
  const params: unknown[] = [];
  if (search) {
    sql += ` AND (LOWER(p.given_name) LIKE LOWER($${params.length + 1}) OR LOWER(p.family_name) LIKE LOWER($${params.length + 1}) OR p.hospital_number ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }
  if (department) {
    sql += ` AND p.id IN (SELECT DISTINCT patient_id FROM encounters e JOIN departments d ON d.id = e.department_id WHERE LOWER(d.name) = LOWER($${params.length + 1}))`;
    params.push(department);
  }
  sql += ' ORDER BY p.created_at DESC LIMIT 50';
  return query(sql, params);
}

export async function getPatientById(id: string) {
  return queryOne(
    `  SELECT p.*, pc.age_category, pc.is_pregnant as pregnant, pc.has_uterus
     FROM patients p
     LEFT JOIN patient_contexts pc ON pc.patient_id = p.id
     WHERE p.id = $1`,
    [id],
  );
}

export async function createPatient(data: {
  given_name: string;
  family_name: string;
  sex_at_birth: string;
  date_of_birth?: string;
  age?: number;
  residence?: string;
  occupation?: string;
  phone?: string;
  hospital_number?: string;
}) {
  const id = crypto.randomUUID();
  const hn = data.hospital_number || `HN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

  await execute(
    `INSERT INTO entities (id, entity_type) VALUES ($1, 'patient')`,
    [id],
  );

  await execute(
    `INSERT INTO patients (id, hospital_number, given_name, family_name,
      date_of_birth, age, sex_at_birth, residence, occupation, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, hn, data.given_name, data.family_name,
     data.date_of_birth || null, data.age || null, data.sex_at_birth,
     data.residence || '', data.occupation || '', data.phone || ''],
  );
  return id;
}

// ── Encounter queries ────────────────────────────────────────

export async function getEncounters(department?: string, phase?: string) {
  let sql = `
    SELECT e.id, e.patient_id,
           p.given_name || ' ' || p.family_name as patient_name,
           d.name as department, e.clinical_state as phase,
           e.priority, e.created_at as opened_at
    FROM encounters e
    JOIN patients p ON p.id = e.patient_id
    JOIN departments d ON d.id = e.department_id
    WHERE 1=1
  `;
  const params: unknown[] = [];
  if (department) {
    sql += ` AND LOWER(d.name) = LOWER($${params.length + 1})`;
    params.push(department);
  }
  if (phase) {
    sql += ` AND e.clinical_state = $${params.length + 1}`;
    params.push(phase);
  }
  sql += ' ORDER BY e.created_at DESC LIMIT 50';
  return query(sql, params);
}

export async function createEncounter(data: {
  patientId: string;
  providerId: string;
  departmentId: string;
  facilityId: string;
  visitType?: string;
  priority?: string;
  reasonForVisit?: string;
}) {
  const id = crypto.randomUUID();
  await execute(
    `INSERT INTO encounters (id, patient_id, provider_id, department_id, facility_id,
      visit_type, priority, status, clinical_state, reason_for_visit, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', 'registered', $8, NOW(), NOW())`,
    [id, data.patientId, data.providerId, data.departmentId, data.facilityId,
     data.visitType || 'outpatient', data.priority || 'routine', data.reasonForVisit || ''],
  );
  return id;
}

// ── Observation queries ──────────────────────────────────────

export async function getObservations(encounterId: string) {
  return query(
    `SELECT * FROM observations WHERE encounter_id = $1 AND status != 'withdrawn' ORDER BY time_observed ASC`,
    [encounterId],
  );
}

export async function createObservation(data: {
  encounterId: string;
  entityId: string;
  conceptId: string;
  value: unknown;
  unit?: string;
  observerId: string;
}) {
  const id = crypto.randomUUID();
  await execute(
    `INSERT INTO observations (id, encounter_id, entity_id, concept_id, value, unit,
      source, observer_id, time_observed, status, version)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, 'direct', $7, NOW(), 'preliminary', 1)`,
    [id, data.encounterId, data.entityId, data.conceptId, JSON.stringify(data.value),
     data.unit || '', data.observerId],
  );
  return id;
}

// ── Clinical events ──────────────────────────────────────────

export async function recordClinicalEvent(data: {
  encounterId: string;
  userId: string;
  eventType: string;
  details?: Record<string, unknown>;
}) {
  const id = crypto.randomUUID();
  await execute(
    `INSERT INTO clinical_events (id, encounter_id, user_id, event_type, details, created_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
    [id, data.encounterId, data.userId, data.eventType, JSON.stringify(data.details || {})],
  );
  return id;
}

// ── Dashboard / Stats ────────────────────────────────────────

export async function getDashboardStats() {
  const activeEncounters = await queryOne(
    `SELECT COUNT(*) as count FROM encounters WHERE status = 'active'`,
  );
  const totalPatients = await queryOne(
    `SELECT COUNT(*) as count FROM patients`,
  );
  const totalClinicians = await queryOne(
    `SELECT COUNT(*) as count FROM clinicians`,
  );
  const todayEncounters = await queryOne(
    `SELECT COUNT(*) as count FROM encounters WHERE created_at >= CURRENT_DATE`,
  );
  return {
    activeEncounters: Number((activeEncounters as Record<string, unknown>)?.count || 0),
    totalPatients: Number((totalPatients as Record<string, unknown>)?.count || 0),
    totalClinicians: Number((totalClinicians as Record<string, unknown>)?.count || 0),
    todayEncounters: Number((todayEncounters as Record<string, unknown>)?.count || 0),
  };
}
