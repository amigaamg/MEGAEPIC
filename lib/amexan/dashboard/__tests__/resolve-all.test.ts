// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD CONSTITUTION — Verification (BOOK VIII · Volume VIII-A)
//
// Proves the constitutional claim: every actor resolves into one of the 18 master
// dashboard families and receives a generated live operating environment.
//
//   RUN:  node --import tsx --test lib/amexan/dashboard/__tests__/resolve-all.test.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DASHBOARD_FAMILIES, DASHBOARD_LAYERS, FAMILY_NAVIGATION, FAMILY_QUICK_ACTIONS,
  PresentationEngine, resolveFamily, familyLabel,
  type ActorObject, type AuthResult, type EmploymentProfile, type ResolutionInput,
  type UniversalIdentity, type DashboardFamilyId,
} from '@/lib/amexan/dashboard';
import type { AmxUid } from '@/lib/amexan/constitution/types';

const uid = (id: string) => id as AmxUid;

const AUTH: AuthResult = { uid: uid('usr-1'), sessionId: 's', token: 't', authenticatedAt: 0 };

function identity(actorId: string): UniversalIdentity {
  return { personId: uid(actorId), actorId: uid(actorId), amxPer: `AMX-${actorId}`, name: 'Test', identities: [], licenses: [], capabilities: [], preferences: {} };
}

function employment(roles: string[]): EmploymentProfile {
  return { organizationId: 'org-1', roles, reportingStructure: [], employmentType: 'permanent', status: 'active' };
}

function input(actor: ActorObject, roles: string[]): ResolutionInput {
  return {
    auth: AUTH,
    identity: identity(actor.actorId),
    actor,
    organizationChoices: [{ organizationId: 'org-1', name: 'Teaching Hospital', type: 'hospital', isActive: true, context: 'morning' }],
    employments: [employment(roles)],
    hospitalStatus: { occupancy: 56, revenue: 1234500, staff: 320, alerts: [], critical: 3 },
  };
}

function actor(id: string, capabilities: string[]): ActorObject {
  return { actorId: uid(id), personId: uid(id), name: 'Test Clinician', amxid: `AMX-${id}`, capabilities, organizations: [] };
}

test('every role resolves to a family that declares it', () => {
  for (const family of DASHBOARD_FAMILIES) {
    for (const role of family.roles) {
      const resolved = resolveFamily([role]);
      const declaring = DASHBOARD_FAMILIES.find(f => f.familyId === resolved);
      assert.ok(declaring, `role ${role} must resolve to some family`);
      assert.ok(declaring!.roles.includes(role), `role ${role} resolves to ${resolved} which must declare it`);
    }
  }
});

test('roles that belong to multiple families resolve to the most specific operating system', () => {
  // chief_pharmacist is both Clinical Leadership and Pharmacy; constitutionally the
  // pharmacist's primary workspace is the Pharmacy operating system.
  assert.equal(resolveFamily(['chief_pharmacist']), 'pharmacy');
  // a medical_director belongs only to clinical_leadership.
  assert.equal(resolveFamily(['medical_director']), 'clinical_leadership');
});

test('a patient resolves to the Citizen Health Operating System', () => {
  assert.equal(resolveFamily(['patient']), 'patient');
  assert.equal(resolveFamily(['guardian']), 'patient');
});

test('every family generates a full dashboard for a representative role', () => {
  const engine = new PresentationEngine();
  for (const family of DASHBOARD_FAMILIES) {
    const role = family.roles[0];
    const caps = new Set(['clinical', 'administration', 'research', 'teaching', 'prescribe', 'order_lab']);
    const dashboard = engine.generate(input(actor(`usr-${family.familyId}`, [...caps]), [role]));

    assert.equal(dashboard.familyId, family.familyId, `${role} should get ${family.familyId} family`);
    assert.equal(dashboard.familyLabel, family.label);
    assert.ok(dashboard.navigation.length > 0, `${family.familyId} navigation must not be empty`);
    assert.ok(dashboard.workspace.widgets.length > 0, `${family.familyId} workspace must not be empty`);
    assert.equal(dashboard.layers.length, 5, `${family.familyId} must expose all five layers`);
    assert.ok(dashboard.quickActions.length > 0, `${family.familyId} must expose quick actions`);
    assert.equal(dashboard.offlineRecoverable, true);
    assert.ok(dashboard.generatedAt > 0);
    const layerIds = dashboard.layers.map(l => l.id).sort();
    assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  }
});

test('assignment overrides the base family (emergency_call → emergency)', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'administration']);
  const context = engine.resolve(input(actor('usr-em', [...caps]), ['consultant']));
  assert.equal(context.employments[0].roles[0], 'consultant');

  const emergency = engine.switchWorkspace(context, { id: 'c1', kind: 'emergency_call', label: 'Emergency Call' });
  assert.equal(emergency.familyId, 'emergency', 'an emergency call must hand the actor the Emergency operating system');
  assert.equal(emergency.context.kind, 'emergency_call');

  const wardRound = engine.switchWorkspace(context, { id: 'w1', kind: 'ward_round', label: 'Ward Round' });
  assert.equal(wardRound.familyId, 'clinician', 'returning to ward round restores the clinician operating system');
});

test('capabilities override generic role behavior (no prescribe → no prescribe actions)', () => {
  const engine = new PresentationEngine();
  const noRx = engine.generate(input(actor('usr-norx', ['clinical']), ['medical_officer']));
  assert.ok(!noRx.quickActions.some(a => a.key === 'prescribe'), 'prescribe action must be hidden without prescribe capability');

  const withRx = engine.generate(input(actor('usr-rx', ['clinical', 'prescribe']), ['medical_officer']));
  assert.ok(withRx.quickActions.some(a => a.key === 'prescribe'), 'prescribe action must appear with prescribe capability');
});

test('a Facility Administrator lands in the executive operating system', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['administration', 'clinical']);
  const dash = engine.generate(input(actor('usr-admin', [...caps]), ['facility_administrator']));
  assert.equal(dash.familyId, 'executive');
  assert.ok(dash.navigation.some(n => n.key === 'overview'));
  assert.ok(dash.navigation.some(n => n.key === 'finance'));
});

// ── BOOK VI · PHASE II — DEPARTMENT HEAD OPERATING SYSTEM (DHOS) ──────────────
// Concept DH-001. The Department Head is the operating authority of ONE clinical
// department. The department family must yield the entire 18-module operating
// system described in Book VI, not a generic page.

const DHOS_MODULES = [
  'overview', 'operations', 'patients', 'admissions', 'wards', 'clinics',
  'theatre', 'staff', 'education', 'research', 'quality', 'resources',
  'intelligence', 'analytics', 'communications', 'reports', 'protocols', 'settings',
];

const DHOS_ROLES = ['department_head', 'unit_head', 'section_lead'];

test('BOOK VI · DHOS roles resolve to the department operating system', () => {
  for (const role of DHOS_ROLES) {
    assert.equal(resolveFamily([role]), 'department', `${role} must resolve to department`);
  }
});

test('BOOK VI · the department family exposes all 18 DHOS modules as navigation', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).department as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of DHOS_MODULES) {
    assert.ok(keys.includes(module), `department navigation missing module: ${module}`);
  }
});

test('BOOK VI · the department family offers command-center quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.department;
  const keys = actions.map(a => a.key);
  // Open Ward, new encounters/studies/audits, protocol control and reporting —
  // the concrete levers a Department Head pulls daily.
  for (const required of ['open_ward', 'new_encounter', 'new_study', 'new_audit', 'protocol_update', 'generate_report']) {
    assert.ok(keys.includes(required), `department quick actions missing: ${required}`);
  }
});

test('BOOK VI · the DHOS dashboard spans all five layers with live widgets', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'administration', 'research', 'teaching', 'order_lab', 'prescribe']);
  const dash = engine.generate(input(actor('usr-dept-head', [...caps]), ['department_head']));
  assert.equal(dash.familyId, 'department');
  assert.equal(dash.familyLabel, familyLabel('department'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'operational widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VI · PHASE 3 — WARD IN-CHARGE OPERATING SYSTEM (WARD COMMAND CENTER) ─
// The Ward In-Charge governs the day-to-day functioning of a single ward. The
// ward family must yield the complete Ward Command Center, not a generic page.

const WARD_MODULES = [
  'home', 'patient_flow', 'bed_management', 'nursing_operations',
  'medical_operations', 'ward_round', 'medications', 'investigations',
  'procedures', 'equipment', 'infection', 'clinical_intelligence',
  'emergency', 'communication', 'teaching', 'quality', 'analytics', 'reports',
];

const WARD_ROLES = ['ward_in_charge', 'charge_nurse', 'ward_consultant'];

test('BOOK VI PHASE 3 · ward roles resolve to the ward operating system', () => {
  for (const role of WARD_ROLES) {
    assert.equal(resolveFamily([role]), 'ward', `${role} must resolve to ward`);
  }
});

test('BOOK VI PHASE 3 · the ward family exposes all Ward Command Center modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).ward as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of WARD_MODULES) {
    assert.ok(keys.includes(module), `ward navigation missing module: ${module}`);
  }
});

test('BOOK VI PHASE 3 · the ward family offers live shift & safety quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.ward;
  const keys = actions.map(a => a.key);
  for (const required of ['handover', 'record_vitals', 'medication_round', 'admit', 'transfer', 'escalate', 'discharge']) {
    assert.ok(keys.includes(required), `ward quick actions missing: ${required}`);
  }
});

test('BOOK VI PHASE 3 · the Ward Command Center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'administration']);
  const dash = engine.generate(input(actor('usr-ward-incharge', [...caps]), ['ward_in_charge']));
  assert.equal(dash.familyId, 'ward');
  assert.equal(dash.familyLabel, familyLabel('ward'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'operational widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VI · PHASE 4 — CONSULTANT PHYSICIAN / SURGEON OPERATING SYSTEM ───────
// The Consultant is the highest clinical decision authority in routine care. The
// clinician family is its operating system: almost entirely clinical thinking,
// never administration.

const CONSULTANT_MODULES = [
  'patients', 'admissions', 'ward_round', 'operating_list', 'clinics',
  'emergency_referrals', 'critical_alerts', 'clinical_intelligence', 'orders',
  'results', 'investigations', 'imaging', 'procedures', 'decision_support',
  'protocols', 'education', 'research', 'quality', 'reports', 'preferences',
];

const CONSULTANT_ROLES = ['consultant', 'specialist', 'medical_officer', 'clinical_officer', 'dentist'];

test('BOOK VI PHASE 4 · consultant roles resolve to the clinician operating system', () => {
  for (const role of CONSULTANT_ROLES) {
    assert.equal(resolveFamily([role]), 'clinician', `${role} must resolve to clinician`);
  }
});

test('BOOK VI PHASE 4 · the consultant operating system exposes the clinical command modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).clinician as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of CONSULTANT_MODULES) {
    assert.ok(keys.includes(module), `clinician navigation missing consultant module: ${module}`);
  }
  // No administrative levers on the consultant command layer.
  assert.ok(!keys.includes('finance'), 'consultant must not see finance');
  assert.ok(!keys.includes('hr'), 'consultant must not see HR');
});

test('BOOK VI PHASE 4 · the consultant offers clinical-decision quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.clinician;
  const keys = actions.map(a => a.key);
  for (const required of ['new_encounter', 'prescribe', 'request_lab', 'request_ct', 'refer', 'discharge']) {
    assert.ok(keys.includes(required), `clinician quick actions missing: ${required}`);
  }
});

test('BOOK VI PHASE 4 · the Consultant command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'prescribe', 'order_lab', 'order_imaging', 'discharge', 'research', 'teaching']);
  const dash = engine.generate(input(actor('usr-consultant', [...caps]), ['consultant']));
  assert.equal(dash.familyId, 'clinician');
  assert.equal(dash.familyLabel, familyLabel('clinician'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'operational widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 5 — MEDICAL OFFICER / RESIDENT (CLINICAL OPERATIONS) ────
// Constitution ID AMX-BOOK-VIII-PHASE-05. The MO/Resident is the primary
// execution engine of clinical care: execution, documentation, reassessment,
// escalation and supervised reasoning — never administration.

const RESIDENT_MODULES = [
  'my_patients', 'shift', 'ward_round', 'admissions', 'history', 'examination',
  'clinical_reasoning', 'orders', 'investigations', 'results', 'medications',
  'procedures', 'escalation', 'handover', 'theatre', 'clinic', 'emergency',
  'communication', 'learning', 'competencies', 'supervisor', 'logbook', 'analytics',
];

const RESIDENT_ROLES = ['resident', 'registrar', 'senior_registrar'];

test('BOOK VIII PHASE 5 · resident-grade roles resolve to the resident operating system', () => {
  for (const role of RESIDENT_ROLES) {
    assert.equal(resolveFamily([role]), 'resident', `${role} must resolve to resident`);
  }
});

test('BOOK VIII PHASE 5 · the resident operating system exposes the clinical operations modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).resident as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of RESIDENT_MODULES) {
    assert.ok(keys.includes(module), `resident navigation missing module: ${module}`);
  }
  // No administrative levers on the execution layer.
  assert.ok(!keys.includes('finance'), 'resident must not see finance');
  assert.ok(!keys.includes('hr'), 'resident must not see HR');
  assert.ok(!keys.includes('ict'), 'resident must not see ICT');
});

test('BOOK VIII PHASE 5 · the resident offers execution & escalation quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.resident;
  const keys = actions.map(a => a.key);
  for (const required of ['new_admission', 'new_encounter', 'request_lab', 'escalate', 'handover', 'log_procedure', 'prepare_theatre', 'discharge_summary']) {
    assert.ok(keys.includes(required), `resident quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 5 · the resident command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'prescribe', 'order_lab']);
  const dash = engine.generate(input(actor('usr-resident', [...caps]), ['resident']));
  assert.equal(dash.familyId, 'resident');
  assert.equal(dash.familyLabel, familyLabel('resident'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'operational widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 6 — NURSING (PATIENT CARE EXECUTION OS) ─────────────────
// Constitution ID AMX-BOOK-VIII-PHASE-06. Not a simplified doctor dashboard: the
// nurse ensures the patient survives, recovers, is monitored, receives treatment
// correctly and is cared for holistically.

const NURSING_MODULES = [
  'home', 'my_patients', 'medication_schedule', 'medication_administration',
  'observations', 'care_plans', 'ward_board', 'ward_census', 'admissions',
  'discharges', 'procedures', 'wounds', 'fluid_balance', 'infusions', 'tasks',
  'handover', 'vitals', 'safety', 'staffing', 'communication',
  'patient_education', 'education', 'reports', 'analytics', 'settings',
];

const NURSING_ROLES = ['registered_nurse', 'senior_nurse', 'midwife', 'enrolled_nurse', 'nurse_educator'];

test('BOOK VIII PHASE 6 · nursing-grade roles resolve to the nursing operating system', () => {
  for (const role of NURSING_ROLES) {
    assert.equal(resolveFamily([role]), 'nursing', `${role} must resolve to nursing`);
  }
});

test('BOOK VIII PHASE 6 · the nursing OS exposes the patient-care execution modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).nursing as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of NURSING_MODULES) {
    assert.ok(keys.includes(module), `nursing navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('finance'), 'nurse must not see finance');
  assert.ok(!keys.includes('hr'), 'nurse must not see HR');
});

test('BOOK VIII PHASE 6 · the nurse offers bedside & safety quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.nursing;
  const keys = actions.map(a => a.key);
  for (const required of ['record_vitals', 'medication_round', 'administer_medication', 'scan_patient', 'care_plan', 'handover', 'observation', 'wound_care', 'fluid_balance']) {
    assert.ok(keys.includes(required), `nursing quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 6 · the Nursing command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'prescribe']);
  const dash = engine.generate(input(actor('usr-reg-nurse', [...caps]), ['registered_nurse']));
  assert.equal(dash.familyId, 'nursing');
  assert.equal(dash.familyLabel, familyLabel('nursing'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'bedside widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 7 — PHARMACY (MEDICATION INTELLIGENCE ENGINE) ───────────
// Constitution ID AMX-BOOK-VIII-PHASE-07. Not an inventory system: the pharmacy
// is the authoritative medication lifecycle & safety engine of the OS.

const PHARMACY_MODULES = [
  'dashboard', 'prescriptions', 'dispensing', 'medication_review', 'inventory',
  'procurement', 'compounding', 'controlled_drugs', 'ward_supply',
  'clinical_pharmacy', 'drug_information', 'pharmacovigilance', 'interactions',
  'antibiotic_stewardship', 'insurance', 'reports', 'analytics', 'settings',
];

const PHARMACY_ROLES = ['pharmacist', 'pharmacy_technologist', 'chief_pharmacist'];

test('BOOK VIII PHASE 7 · pharmacy-grade roles resolve to the pharmacy operating system', () => {
  for (const role of PHARMACY_ROLES) {
    assert.equal(resolveFamily([role]), 'pharmacy', `${role} must resolve to pharmacy`);
  }
});

test('BOOK VIII PHASE 7 · the pharmacy OS exposes the medication-lifecycle modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).pharmacy as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of PHARMACY_MODULES) {
    assert.ok(keys.includes(module), `pharmacy navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('wards'), 'pharmacist must not own ward management');
  assert.ok(!keys.includes('theatre'), 'pharmacist must not own theatre');
});

test('BOOK VIII PHASE 7 · the pharmacist offers dispensing-safety quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.pharmacy;
  const keys = actions.map(a => a.key);
  for (const required of ['verify_prescription', 'dispense', 'barcode_verify', 'clinical_check', 'counsel_patient', 'restock', 'purchase_order', 'report_adr', 'controlled_drug_log']) {
    assert.ok(keys.includes(required), `pharmacy quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 7 · the Pharmacy command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'pharmacy']);
  const dash = engine.generate(input(actor('usr-chief-pharmacist', [...caps]), ['chief_pharmacist']));
  assert.equal(dash.familyId, 'pharmacy');
  assert.equal(dash.familyLabel, familyLabel('pharmacy'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'pharmacy widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 8 — LABORATORY (DIAGNOSTIC INTELLIGENCE ENGINE) ─────────
// Constitution ID AMX-BOOK-VIII-PHASE-08. Not merely an LIS: the laboratory is
// the traceable specimen → verified-result → clinical-intelligence engine.

const LABORATORY_MODULES = [
  'dashboard', 'specimens', 'workbench', 'accessions', 'requests', 'sections',
  'analyzers', 'quality_control', 'blood_bank', 'histopathology', 'microbiology',
  'molecular', 'poct', 'results', 'critical_values', 'reporting', 'surveillance',
  'research', 'reagents', 'analytics', 'settings',
];

const LABORATORY_ROLES = ['laboratory_scientist', 'laboratory_technologist', 'pathologist'];

test('BOOK VIII PHASE 8 · laboratory roles resolve to the laboratory operating system', () => {
  for (const role of LABORATORY_ROLES) {
    assert.equal(resolveFamily([role]), 'laboratory', `${role} must resolve to laboratory`);
  }
});

test('BOOK VIII PHASE 8 · the laboratory OS exposes the specimen-to-result modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).laboratory as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of LABORATORY_MODULES) {
    assert.ok(keys.includes(module), `laboratory navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('wards'), 'lab scientist must not own wards');
  assert.ok(!keys.includes('theatre'), 'lab scientist must not own theatre');
});

test('BOOK VIII PHASE 8 · the scientist offers specimen-lifecycle quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.laboratory;
  const keys = actions.map(a => a.key);
  for (const required of ['receive_specimen', 'accept_specimen', 'label_verify', 'process_sample', 'enter_results', 'verify_results', 'release_results', 'critical_call', 'qc_check', 'analyzer_monitor', 'reflex_test']) {
    assert.ok(keys.includes(required), `laboratory quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 8 · the Laboratory command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'laboratory']);
  const dash = engine.generate(input(actor('usr-lab-scientist', [...caps]), ['laboratory_scientist']));
  assert.equal(dash.familyId, 'laboratory');
  assert.equal(dash.familyLabel, familyLabel('laboratory'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'laboratory widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 9 — RADIOLOGY (IMAGING INTELLIGENCE ENGINE) ─────────────
// Constitution ID AMX-BOOK-VIII-PHASE-09. Not a PACS viewer: the imaging
// request → DICOM acquisition → structured report → clinical-intelligence engine.

const RADIOLOGY_MODULES = [
  'dashboard', 'requests', 'scheduling', 'modalities', 'worklist', 'studies',
  'image_acquisition', 'reporting', 'pacs', 'ai_review', 'interventional',
  'critical_findings', 'radiation_safety', 'equipment', 'teaching_files',
  'research', 'analytics', 'settings',
];

const RADIOLOGY_ROLES = ['radiologist', 'radiographer', 'sonographer'];

test('BOOK VIII PHASE 9 · radiology roles resolve to the radiology operating system', () => {
  for (const role of RADIOLOGY_ROLES) {
    assert.equal(resolveFamily([role]), 'radiology', `${role} must resolve to radiology`);
  }
});

test('BOOK VIII PHASE 9 · the radiology OS exposes the request-to-report modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).radiology as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of RADIOLOGY_MODULES) {
    assert.ok(keys.includes(module), `radiology navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('wards'), 'radiologist must not own wards');
  assert.ok(!keys.includes('theatre'), 'radiologist must not own theatre');
});

test('BOOK VIII PHASE 9 · the radiologist offers imaging-workflow quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.radiology;
  const keys = actions.map(a => a.key);
  for (const required of ['accept_request', 'schedule_study', 'safety_screen', 'protocol', 'acquire_study', 'upload_images', 'ai_review', 'report_study', 'critical_call', 'check_queue']) {
    assert.ok(keys.includes(required), `radiology quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 9 · the Radiology command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'radiology']);
  const dash = engine.generate(input(actor('usr-radiologist', [...caps]), ['radiologist']));
  assert.equal(dash.familyId, 'radiology');
  assert.equal(dash.familyLabel, familyLabel('radiology'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'radiology widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 10 — FINANCE (FINANCIAL INTELLIGENCE ENGINE) ────────────
// Constitution ID AMX-BOOK-VIII-PHASE-10. Not an accounting package: the
// financial accountability layer that follows every clinical act automatically.

const FINANCE_MODULES = [
  'dashboard', 'revenue', 'billing', 'patients', 'insurance', 'claims',
  'payments', 'payroll', 'budgets', 'procurement', 'suppliers', 'accounting',
  'assets', 'reports', 'analytics', 'settings',
];

const FINANCE_ROLES = ['finance_officer', 'insurance_officer', 'billing_officer', 'revenue_officer'];

test('BOOK VIII PHASE 10 · finance roles resolve to the finance operating system', () => {
  for (const role of FINANCE_ROLES) {
    assert.equal(resolveFamily([role]), 'finance', `${role} must resolve to finance`);
  }
});

test('BOOK VIII PHASE 10 · the finance OS exposes the revenue-cycle modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).finance as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of FINANCE_MODULES) {
    assert.ok(keys.includes(module), `finance navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('wards'), 'finance must not own ward management');
  assert.ok(!keys.includes('theatre'), 'finance must not own theatre');
});

test('BOOK VIII PHASE 10 · the finance officer offers revenue-cycle quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.finance;
  const keys = actions.map(a => a.key);
  for (const required of ['new_bill', 'cashier', 'payment', 'claim', 'validate_claim', 'reconciliation', 'purchase_order', 'payroll_run', 'report']) {
    assert.ok(keys.includes(required), `finance quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 10 · the Finance command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['administration', 'finance']);
  const dash = engine.generate(input(actor('usr-finance-officer', [...caps]), ['finance_officer']));
  assert.equal(dash.familyId, 'finance');
  assert.equal(dash.familyLabel, familyLabel('finance'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'finance widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 11 — HUMAN RESOURCES (WORKFORCE INTELLIGENCE ENGINE) ────
// Constitution ID AMX-BOOK-VIII-PHASE-11. Not an employee registry: the guardian
// of the full healthcare-worker lifecycle from recruitment through retirement.

const HR_MODULES = [
  'dashboard', 'employees', 'recruitment', 'credentialing', 'onboarding',
  'departments', 'assignments', 'scheduling', 'performance', 'competencies',
  'training', 'leave', 'payroll', 'succession', 'reports', 'analytics', 'settings',
];

const HR_ROLES = ['hr_officer', 'recruitment_officer', 'training_officer', 'payroll_officer'];

test('BOOK VIII PHASE 11 · hr roles resolve to the workforce operating system', () => {
  for (const role of HR_ROLES) {
    assert.equal(resolveFamily([role]), 'hr', `${role} must resolve to hr`);
  }
});

test('BOOK VIII PHASE 11 · the workforce OS exposes the employee-lifecycle modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).hr as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of HR_MODULES) {
    assert.ok(keys.includes(module), `hr navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('claims'), 'hr must not manage insurance claims');
  assert.ok(!keys.includes('procurement'), 'hr must not own procurement');
});

test('BOOK VIII PHASE 11 · the hr officer steers the workforce quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.hr;
  const keys = actions.map(a => a.key);
  for (const required of ['vacancy', 'verify_credentials', 'onboard', 'assign', 'roster', 'leave_request', 'appraisal', 'promote', 'payroll']) {
    assert.ok(keys.includes(required), `hr quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 11 · the Workforce command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['administration', 'hr']);
  const dash = engine.generate(input(actor('usr-hr-officer', [...caps]), ['hr_officer']));
  assert.equal(dash.familyId, 'hr');
  assert.equal(dash.familyLabel, familyLabel('hr'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'hr widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 12 — ICT (DIGITAL INFRASTRUCTURE INTELLIGENCE ENGINE) ───
// Constitution ID AMX-BOOK-VIII-PHASE-12. Not an IT helpdesk: the guard of the
// digital hospital — availability, security, interoperability, resilience.

const ICT_MODULES = [
  'dashboard', 'infrastructure', 'servers', 'cloud', 'networks', 'devices',
  'biomedical', 'integrations', 'cybersecurity', 'identity', 'backups',
  'disaster_recovery', 'deployments', 'monitoring', 'support', 'analytics', 'settings',
];

const ICT_ROLES = ['ict_officer', 'infrastructure_engineer', 'cybersecurity_officer', 'support_engineer', 'developer'];

test('BOOK VIII PHASE 12 · ict roles resolve to the digital infrastructure operating system', () => {
  for (const role of ICT_ROLES) {
    assert.equal(resolveFamily([role]), 'ict', `${role} must resolve to ict`);
  }
});

test('BOOK VIII PHASE 12 · the digital OS exposes the infrastructure modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).ict as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of ICT_MODULES) {
    assert.ok(keys.includes(module), `ict navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('claims'), 'ict must not manage insurance claims');
  assert.ok(!keys.includes('payroll'), 'ict must not own payroll records');
});

test('BOOK VIII PHASE 12 · the ict engineer steers the infrastructure quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.ict;
  const keys = actions.map(a => a.key);
  for (const required of ['ticket', 'incident', 'deploy', 'backup', 'failover', 'integration', 'enroll_device', 'security_scan', 'monitor']) {
    assert.ok(keys.includes(required), `ict quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 12 · the Digital Infrastructure command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['administration', 'ict']);
  const dash = engine.generate(input(actor('usr-ict-officer', [...caps]), ['ict_officer']));
  assert.equal(dash.familyId, 'ict');
  assert.equal(dash.familyLabel, familyLabel('ict'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'ict widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 13 — RESEARCH (KNOWLEDGE GENERATION ENGINE) ─────────────
// Constitution ID AMX-BOOK-VIII-PHASE-13. Not a paper management system: the
// clinical knowledge engine that turns every hospital into a learning system.

const RESEARCH_MODULES = [
  'dashboard', 'studies', 'protocols', 'ethics', 'participants', 'recruitment',
  'crfs', 'datasets', 'biobank', 'statistics', 'ai_datasets', 'publications',
  'grants', 'teaching', 'collaborations', 'analytics', 'settings',
];

const RESEARCH_ROLES = ['researcher', 'biostatistician', 'study_coordinator'];

test('BOOK VIII PHASE 13 · research roles resolve to the knowledge operating system', () => {
  for (const role of RESEARCH_ROLES) {
    assert.equal(resolveFamily([role]), 'research', `${role} must resolve to research`);
  }
});

test('BOOK VIII PHASE 13 · the knowledge OS exposes the study-lifecycle modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).research as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of RESEARCH_MODULES) {
    assert.ok(keys.includes(module), `research navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('payroll'), 'research must not manage payroll');
  assert.ok(!keys.includes('claims'), 'research must not manage insurance claims');
});

test('BOOK VIII PHASE 13 · the researcher steers the study-lifecycle quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.research;
  const keys = actions.map(a => a.key);
  for (const required of ['new_study', 'protocol', 'ethics_submit', 'consent', 'recruit', 'crf', 'dataset', 'analyze', 'publish']) {
    assert.ok(keys.includes(required), `research quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 13 · the Knowledge command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'research']);
  const dash = engine.generate(input(actor('usr-researcher', [...caps]), ['researcher']));
  assert.equal(dash.familyId, 'research');
  assert.equal(dash.familyLabel, familyLabel('research'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'research widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 14 — TELEMEDICINE (DISTRIBUTED CARE ENGINE) ─────────────
// Constitution ID AMX-BOOK-VIII-PHASE-14. Not video conferencing: another
// clinical environment with the same constitutional standards as physical care.

const TELEMEDICINE_MODULES = [
  'dashboard', 'virtual_clinics', 'appointments', 'waiting_room',
  'live_consultations', 'messages', 'remote_monitoring', 'home_care',
  'community_health', 'referrals', 'tele_mdt', 'patient_education',
  'analytics', 'reports', 'settings',
];

const TELEMEDICINE_ROLES = ['remote_clinician', 'virtual_nurse', 'telehealth_coordinator'];

test('BOOK VIII PHASE 14 · telemedicine roles resolve to the distributed care operating system', () => {
  for (const role of TELEMEDICINE_ROLES) {
    assert.equal(resolveFamily([role]), 'telemedicine', `${role} must resolve to telemedicine`);
  }
});

test('BOOK VIII PHASE 14 · the distributed care OS exposes the virtual-clinic modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).telemedicine as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of TELEMEDICINE_MODULES) {
    assert.ok(keys.includes(module), `telemedicine navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('payroll'), 'telemedicine must not manage payroll');
  assert.ok(!keys.includes('claims'), 'telemedicine must not manage insurance claims');
});

test('BOOK VIII PHASE 14 · the telemedicine clinician steers the virtual-care quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.telemedicine;
  const keys = actions.map(a => a.key);
  for (const required of ['start_consultation', 'monitoring', 'referral', 'asynchronous', 'home_care', 'tele_icu', 'escalate', 'patient_education']) {
    assert.ok(keys.includes(required), `telemedicine quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 14 · the Distributed Care command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinical', 'telemedicine']);
  const dash = engine.generate(input(actor('usr-remote-clinician', [...caps]), ['remote_clinician']));
  assert.equal(dash.familyId, 'telemedicine');
  assert.equal(dash.familyLabel, familyLabel('telemedicine'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'telemedicine widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 15 — STUDENT, INTERN & EDUCATION (CLINICAL COMPETENCY) ──
// Constitution ID AMX-BOOK-VIII-PHASE-15. Not an LMS: supervised learning inside
// the live clinical ecosystem, closing the competency loop with patient care.

const STUDENT_MODULES = [
  'dashboard', 'today_patients', 'logbook', 'competencies', 'ward_rounds',
  'clinics', 'theatre', 'procedures', 'simulation', 'assignments', 'research',
  'portfolio', 'assessments', 'feedback', 'learning_resources', 'analytics', 'settings',
];

const STUDENT_ROLES = ['medical_student', 'nursing_student', 'pharmacy_student', 'resident_in_training', 'intern'];

test('BOOK VIII PHASE 15 · student, intern and residency roles resolve to the competency operating system', () => {
  for (const role of STUDENT_ROLES) {
    assert.equal(resolveFamily([role]), 'student', `${role} must resolve to student`);
  }
});

test('BOOK VIII PHASE 15 · the competency OS exposes the educational-lifecycle modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).student as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of STUDENT_MODULES) {
    assert.ok(keys.includes(module), `student navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('payroll'), 'student must not manage payroll');
  assert.ok(!keys.includes('claims'), 'student must not manage insurance claims');
});

test('BOOK VIII PHASE 15 · the learner steers the supervised clinical quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.student;
  const keys = actions.map(a => a.key);
  for (const required of ['new_case', 'draft_note', 'log_procedure', 'submit_logbook', 'request_assessment', 'ward_round', 'simulation', 'tutor']) {
    assert.ok(keys.includes(required), `student quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 15 · the Clinical Competency command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['learning', 'clinical']);
  const dash = engine.generate(input(actor('usr-medical-student', [...caps]), ['medical_student']));
  assert.equal(dash.familyId, 'student');
  assert.equal(dash.familyLabel, familyLabel('student'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'student widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});

// ── BOOK VIII · PHASE 16 — PATIENT & GUARDIAN (CITIZEN HEALTH OPERATING SYSTEM) ─
// Constitution ID AMX-BOOK-VIII-PHASE-16. Not a patient portal: the lifelong,
// organization-independent health journey that sits at the center of AMEXAN.

const PATIENT_MODULES = [
  'dashboard', 'timeline', 'appointments', 'telemedicine', 'records',
  'medications', 'laboratory', 'imaging', 'procedures', 'admissions',
  'vaccinations', 'pregnancy', 'chronic', 'insurance', 'billing', 'family',
  'consent', 'education', 'community', 'emergency_card', 'settings',
];

const PATIENT_ROLES = ['patient', 'guardian'];

test('BOOK VIII PHASE 16 · patient and guardian resolve to the citizen health operating system', () => {
  for (const role of PATIENT_ROLES) {
    assert.equal(resolveFamily([role]), 'patient', `${role} must resolve to patient`);
  }
});

test('BOOK VIII PHASE 16 · the citizen OS exposes the lifelong-journey modules', () => {
  const nav = (FAMILY_NAVIGATION as Record<string, unknown>).patient as Array<{ key: string }>;
  const keys = nav.map(n => n.key);
  for (const module of PATIENT_MODULES) {
    assert.ok(keys.includes(module), `patient navigation missing module: ${module}`);
  }
  assert.ok(!keys.includes('payroll'), 'patient must not manage payroll');
  assert.ok(!keys.includes('procurement'), 'patient must not own procurement');
});

test('BOOK VIII PHASE 16 · the citizen steers the self-management quick actions', () => {
  const actions = FAMILY_QUICK_ACTIONS.patient;
  const keys = actions.map(a => a.key);
  for (const required of ['book_appointment', 'teleconsult', 'refill', 'upload', 'symptom', 'home_reading', 'consent', 'pay']) {
    assert.ok(keys.includes(required), `patient quick actions missing: ${required}`);
  }
});

test('BOOK VIII PHASE 16 · the Citizen Health command center spans all five layers live', () => {
  const engine = new PresentationEngine();
  const caps = new Set(['clinic', 'records']);
  const dash = engine.generate(input(actor('usr-patient', [...caps]), ['patient']));
  assert.equal(dash.familyId, 'patient');
  assert.equal(dash.familyLabel, familyLabel('patient'));
  assert.equal(dash.layers.length, 5);
  const layerIds = dash.layers.map(l => l.id).sort();
  assert.deepEqual(layerIds, DASHBOARD_LAYERS.map(l => l.id).sort());
  assert.ok(dash.workspace.widgets.length > 0, 'patient widgets required');
  assert.ok(dash.navigation.length > 0, 'navigation required');
  assert.ok(dash.quickActions.length > 0, 'quick actions required');
  assert.equal(dash.offlineRecoverable, true);
});