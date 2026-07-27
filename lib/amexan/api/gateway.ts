const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const FALLBACK_TO_DIRECT_DB = true;

async function fetchApi(path: string, options?: RequestInit) {
  const url = `${GATEWAY_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      if (FALLBACK_TO_DIRECT_DB) return null;
      throw new Error(`Gateway error: ${res.status}`);
    }
    return res.json();
  } catch {
    if (FALLBACK_TO_DIRECT_DB) return null;
    throw new Error(`Gateway unavailable at ${GATEWAY_URL}`);
  }
}

export async function healthCheck() {
  return fetchApi('/api/health');
}

export async function getPatient(id: string) {
  const result = await fetchApi(`/api/patients/${id}`);
  if (result) return result;
  const { getPatientById } = await import('./db');
  return getPatientById(id);
}

export async function registerPatient(data: Record<string, unknown>) {
  const result = await fetchApi('/api/patients/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (result) return result;
  const { query, execute } = await import('./db');
  const id = crypto.randomUUID();
  await execute(
    `INSERT INTO patients (id, given_name, family_name, date_of_birth, sex, residence, occupation)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, data.given_name, data.family_name, data.date_of_birth, data.sex, data.residence, data.occupation],
  );
  return { patient_id: id };
}

export async function startEncounter(data: Record<string, unknown>) {
  const result = await fetchApi('/api/encounters/start', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (result) return result;
  const { createEncounter } = await import('./db');
  const id = await createEncounter({
    patientId: data.patient_id as string,
    providerId: data.provider_id as string,
    departmentId: data.department_id as string,
    facilityId: data.facility_id as string,
    visitType: data.visit_type as string,
    priority: data.priority as string,
    reasonForVisit: data.reason_for_visit as string,
  });
  return { encounter_id: id };
}
