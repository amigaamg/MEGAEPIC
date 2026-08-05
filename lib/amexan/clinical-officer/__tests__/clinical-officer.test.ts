// ═══════════════════════════════════════════════════════════════════════════════
// CLINICAL OFFICER ENGINE (BOOK VI-I) — Verification (Engine No. 19)
//
// Proves the constitutional claim: the Clinical Officer (CO) and Senior Clinical
// Officer (SCO) operate as frontline licensed clinicians — triaging, assessing,
// prescribing, ordering investigations, admitting, discharging, referring, and
// escalating — while being strictly bounded by grade scope (no surgery/supervision
// for CO; approved surgery + supervision for SCO).
//
//   RUN:  node --import tsx --test lib/amexan/clinical-officer/__tests__/clinical-officer.test.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ClinicalOfficerEngine, CLINICAL_OFFICER_GRADES,
  APPROVED_CO_PROCEDURES, SCO_ONLY_PROCEDURES,
  CLINICAL_OFFICER_AUTHORITY, SCO_AUTHORITY_EXTENSION, CLINICAL_OFFICER_RESTRICTIONS,
  type ClinicalOfficerModel,
} from '@/lib/amexan/clinical-officer';
import type { AmxUid } from '@/lib/amexan/constitution/types';

const uid = (id: string) => id as AmxUid;

function create(grade: 'clinical_officer' | 'senior_clinical_officer' = 'clinical_officer'): ClinicalOfficerModel {
  return ClinicalOfficerEngine.create({
    organizationId: uid('org-1'),
    facilityId: uid('fac-1'),
    grade,
    departmentId: 'outpatient_primary_care',
    specialties: ['general_practice', 'other'],
    officerId: uid('co-1'),
  });
}

const PATIENT = { patientId: 'p-1', name: 'Jane Doe', group: 'new_assessment' as const, site: 'District Clinic' };

test('create builds a CO with full frontline scope and an audit trail', () => {
  const model = create();
  assert.equal(model.grade, 'clinical_officer');
  assert.equal(model.officerId, uid('co-1'));
  assert.equal(model.workload.opdPatients, 0);
  assert.equal(model.auditLog[0].action, 'clinical_officer_registered');
  assert.deepEqual(CLINICAL_OFFICER_GRADES.map(g => g.grade), ['clinical_officer', 'senior_clinical_officer']);
});

test('CO grade: prescribes, orders, admits, discharges — but no surgery and no supervision', () => {
  const co = create('clinical_officer');
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(co.grade, 'prescribe_medications').allowed, true);
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(co.grade, 'request_imaging').allowed, true);
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(co.grade, 'admit_patients').allowed, true);
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(co.grade, 'discharge_appropriate_patients').allowed, true);

  assert.equal(ClinicalOfficerEngine.canOfficerPerform(co.grade, 'perform_sco_only_procedures').allowed, false);
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(co.grade, 'supervise_clinical_officers').allowed, false);
  assert.equal(ClinicalOfficerEngine.canPerformProcedure(co.grade, 'lumbar_puncture').allowed, false);
  assert.equal(ClinicalOfficerEngine.canPerformProcedure(co.grade, 'suturing').allowed, true);
});

test('SCO grade: adds approved surgery and supervision; still no consultant scope', () => {
  const sco = create('senior_clinical_officer');
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(sco.grade, 'perform_sco_only_procedures').allowed, true);
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(sco.grade, 'supervise_interns').allowed, true);
  assert.equal(ClinicalOfficerEngine.canPerformProcedure(sco.grade, 'lumbar_puncture').allowed, true);
  assert.equal(ClinicalOfficerEngine.canPerformProcedure(sco.grade, 'abscess_drainage').allowed, true);

  assert.equal(ClinicalOfficerEngine.canOfficerPerform(sco.grade, 'approve_consultant_only_procedures').allowed, false);
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(sco.grade, 'manage_departments').allowed, false);
  assert.equal(ClinicalOfficerEngine.canOfficerPerform(sco.grade, 'override_patient_consent').allowed, false);
});

test('constitutional tables are coherent: CO cannot supervise peers or perform complex surgery', () => {
  const reason = (action: string) => ClinicalOfficerEngine.canOfficerPerform('clinical_officer', action).reason;
  assert.match(reason('supervise_peers')!, /same grade/);
  assert.match(reason('perform_complex_surgery')!, /surgeon or Consultant/);
  assert.match(reason('modify_hospital_protocols')!, /department and facility level/);
});

test('guard rejects a non-officer actor and the officer cannot exceed scope', () => {
  const co = create('clinical_officer');
  assert.throws(() => ClinicalOfficerEngine.guard(co, uid('stranger'), 'prescribe_medications'), /Only the Clinical Officer/);
  assert.throws(() => ClinicalOfficerEngine.guard(co, uid('co-1'), 'perform_complex_surgery'), /surgeon or Consultant/);
});

test('triage, assessment, and prescription flow with workload tracking', () => {
  let model = create();

  const t1 = ClinicalOfficerEngine.performTriage(model, uid('co-1'), {
    patientId: PATIENT.patientId, acuity: 'urgent', redFlags: ['chest pain'],
    immediateActions: ['ECG', 'aspirin'], disposition: 'emergency room',
  });
  model = t1.model;
  assert.equal(model.workload.triageAssessments, 1);
  assert.equal(t1.triage.acuity, 'urgent');

  const a1 = ClinicalOfficerEngine.recordAssessment(model, uid('co-1'), {
    patientId: PATIENT.patientId, complaint: 'chest pain', history: '2h onset', examination: 'diaphoretic',
    problemList: ['ACS?'], differentials: [{ diagnosis: 'MI', evidencePercent: 70 }],
    workingDiagnosis: 'ACS', management: ['admit'], disposition: 'admit',
  });
  model = a1.model;
  assert.equal(model.workload.opdPatients, 1);

  const r1 = ClinicalOfficerEngine.prescribe(model, uid('co-1'), {
    patientId: PATIENT.patientId, medication: 'Aspirin', dose: '300mg', frequency: 'stat',
    route: 'oral', durationDays: 1,
  });
  model = r1.model;
  assert.equal(r1.prescription.status, 'active');
  assert.equal(model.prescriptions.length, 1);
});

test('CO admits and discharges; discharge requires appropriate scope', () => {
  let model = create();
  model = ClinicalOfficerEngine.assignPatient(model, uid('co-1'), PATIENT).model;
  assert.equal(model.patients[0].status, 'active');

  const adm = ClinicalOfficerEngine.admitPatient(model, uid('co-1'), {
    patientId: PATIENT.patientId, reason: 'ACS monitoring', ward: 'Medical Ward',
  });
  model = adm.model;
  assert.equal(model.workload.admissions, 1);
  assert.equal(adm.admission.ward, 'Medical Ward');

  const dis = ClinicalOfficerEngine.dischargePatient(model, uid('co-1'), {
    patientId: PATIENT.patientId, summary: 'Stable, discharged on aspirin', medications: ['Aspirin 100mg od'],
  });
  model = dis.model;
  assert.equal(model.workload.discharges, 1);
  assert.equal(dis.discharge.summary.length > 0, true);
  assert.equal(model.patients[0].status, 'discharged');
});

test('investigations: imaging and lab orders route to correct authority; results recorded', () => {
  let model = create();
  const lab = ClinicalOfficerEngine.orderInvestigation(model, uid('co-1'), {
    patientId: PATIENT.patientId, kind: 'laboratory', order: 'Troponin', indication: 'ACS',
  });
  model = lab.model;
  assert.equal(lab.order.status, 'requested');

  const img = ClinicalOfficerEngine.orderInvestigation(model, uid('co-1'), {
    patientId: PATIENT.patientId, kind: 'imaging', order: 'Chest X-ray', indication: 'Pneumonia',
  });
  model = img.model;
  assert.equal(img.order.kind, 'imaging');

  model = ClinicalOfficerEngine.recordResult(model, uid('co-1'), lab.order.id, 'Troponin negative');
  const resulted = model.investigations.find(o => o.id === lab.order.id);
  assert.equal(resulted?.status, 'resulted');
  assert.equal(resulted?.result, 'Troponin negative');
});

test('referrals escalate up the cadre and emergencies are flagged', () => {
  let model = create();
  const ref = ClinicalOfficerEngine.referPatient(model, uid('co-1'), {
    patientId: PATIENT.patientId, target: 'consultant', reason: 'Unstable angina', urgency: 'urgent',
  });
  model = ref.model;
  assert.equal(ref.referral.status, 'pending');
  assert.equal(model.workload.referrals, 1);

  model = ClinicalOfficerEngine.escalateEmergency(model, uid('co-1'), PATIENT.patientId, 'Ongoing chest pain', 'consultant');
  assert.equal(model.workload.emergencyCases, 1);
  assert.match(model.auditLog.at(-1)!.detail!, /consultant/);
});

test('CO anchors community health; only SCO supervises learners', () => {
  let model = create('senior_clinical_officer');
  const com = ClinicalOfficerEngine.recordCommunitySession(model, uid('co-1'), {
    kind: 'outreach', site: 'Village B', patientsSeen: 42, notes: 'HTN screening',
  });
  model = com.model;
  assert.equal(model.community.length, 1);

  const teach = ClinicalOfficerEngine.superviseLearner(model, uid('co-1'), {
    kind: 'skill_demonstration', topic: 'IV cannulation', learnerId: uid('intern-1'),
  });
  model = teach.model;
  assert.equal(model.teaching.length, 1);

  const coOnly = create('clinical_officer');
  assert.throws(() => ClinicalOfficerEngine.superviseLearner(coOnly, uid('co-1'), {
    kind: 'bedside', topic: 'HTN', learnerId: uid('student-1'),
  }), /Senior Clinical Officer scope/);
});

test('audit trail is append-only and every action is recorded', () => {
  let model = create();
  const before = model.auditLog.length;
  model = ClinicalOfficerEngine.addLearning(model, uid('co-1'), {
    topic: 'HTN guidelines', triggeredBy: 'chronic clinic', guidelines: ['WHO 2023'],
  }).model;
  assert.equal(model.auditLog.length, before + 1);
  assert.equal(model.auditLog.at(-1)!.action, 'learning_recorded');

  model = ClinicalOfficerEngine.updateBenchmark(model, uid('co-1'), 'consultations', { self: 15, facility: 12 });
  assert.equal(model.analytics.consultations.self, 15);
  assert.ok(ClinicalOfficerEngine.getAuditLog(model).every(e => typeof e.at === 'number' && e.actorId));
});

test('grade capability helper is exhaustive for both grades', () => {
  for (const g of CLINICAL_OFFICER_GRADES) {
    const caps = ClinicalOfficerEngine.canPerformProcedure(g.grade, 'wound_dressing');
    assert.equal(caps.allowed, true);
  }
  const denied = ClinicalOfficerEngine.canPerformProcedure('clinical_officer', 'craniotomy');
  assert.equal(denied.allowed, false);
  assert.match(denied.reason!, /outside Clinical Officer scope/);
});

test('authority tables cover all CO actions; restrictions are never allowed', () => {
  for (const action of CLINICAL_OFFICER_AUTHORITY) {
    assert.equal(ClinicalOfficerEngine.canOfficerPerform('clinical_officer', action).allowed, true, `${action} allowed`);
  }
  for (const action of SCO_AUTHORITY_EXTENSION) {
    assert.equal(ClinicalOfficerEngine.canOfficerPerform('senior_clinical_officer', action).allowed, true, `${action} SCO allowed`);
  }
  for (const action of CLINICAL_OFFICER_RESTRICTIONS) {
    assert.equal(ClinicalOfficerEngine.canOfficerPerform('clinical_officer', action).allowed, false, `${action} denied`);
    assert.equal(ClinicalOfficerEngine.canOfficerPerform('senior_clinical_officer', action).allowed, false, `${action} denied even for SCO`);
  }
  assert.equal(APPROVED_CO_PROCEDURES.length > 0, true);
  assert.equal(SCO_ONLY_PROCEDURES.length > 0, true);
});
