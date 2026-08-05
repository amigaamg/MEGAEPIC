// ═══════════════════════════════════════════════════════════════════════════════
// CONSTITUTIONAL RIGHTS MATRIX (BOOK IX · UPLE) — Verification
//
// Proves the constitutional claim: every journey activity maps to exactly the
// professions the constitution authorizes — reception registers, nurses triage,
// doctors diagnose/prescribe/discharge, lab performs tests, radiology reports,
// pharmacy dispenses. Nobody outside the matrix may act, and conditional cells
// require explicit legal allowance.
//
//   RUN:  node --import tsx --test lib/amexan/lifecycle/__tests__/rights-matrix.test.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  RIGHTS_MATRIX, RIGHTS_ACTIVITIES, RIGHTS_ACTOR_FAMILIES,
  ROLE_TO_RIGHTS_FAMILY, rightsFor, roleMayPerform, mayPerform,
  assertRights, enforceRights, primaryOwner, allowedActors,
  type RightsActivity,
} from '@/lib/amexan/lifecycle';
import type { AmxUid } from '@/lib/amexan/constitution/types';

const uid = (id: string) => id as AmxUid;

test('every activity is declared in the matrix with an owner', () => {
  for (const activity of RIGHTS_ACTIVITIES) {
    const row = RIGHTS_MATRIX[activity];
    assert.ok(row, `activity ${activity} must have a row`);
    const eligible = RIGHTS_ACTOR_FAMILIES.filter(f => rightsFor(f, activity).verdict !== 'denied');
    assert.ok(eligible.length >= 1, `activity ${activity} must have at least one eligible actor`);
  }
  assert.ok(RIGHTS_ACTIVITIES.length >= 19, 'the full constitutional journey is covered');
});

test('reception owns identity steps; nobody else registers or verifies', () => {
  assert.equal(mayPerform('receptionist', 'register_patient'), true);
  assert.equal(mayPerform('receptionist', 'verify_identity'), true);
  assert.equal(mayPerform('receptionist', 'create_encounter'), true);
  for (const role of ['staff_nurse', 'medical_officer', 'consultant', 'radiographer', 'pharmacist']) {
    assert.equal(mayPerform(role, 'register_patient'), false, `${role} must not register`);
  }
});

test('nurses triage and record vitals but never diagnose or discharge', () => {
  assert.equal(mayPerform('staff_nurse', 'triage'), true);
  assert.equal(mayPerform('staff_nurse', 'record_vitals'), true);
  assert.equal(mayPerform('staff_nurse', 'administer_medication'), true);
  assert.equal(mayPerform('staff_nurse', 'write_nursing_notes'), true);
  assert.equal(mayPerform('staff_nurse', 'diagnose'), false);
  assert.equal(mayPerform('staff_nurse', 'prescribe_medication'), false);
  assert.equal(mayPerform('staff_nurse', 'discharge_patient'), false);
});

test('the doctor line owns medicine: history, exam, diagnosis, orders, discharge', () => {
  for (const role of ['medical_officer', 'resident', 'consultant']) {
    assert.equal(mayPerform(role, 'take_history'), true, `${role} history`);
    assert.equal(mayPerform(role, 'perform_examination'), true);
    assert.equal(mayPerform(role, 'diagnose'), true);
    assert.equal(mayPerform(role, 'order_labs_imaging'), true);
    assert.equal(mayPerform(role, 'prescribe_medication'), true);
    assert.equal(mayPerform(role, 'admit_patient'), true);
    assert.equal(mayPerform(role, 'discharge_patient'), true);
    assert.equal(mayPerform(role, 'register_patient'), false, `${role} must not register`);
    assert.equal(mayPerform(role, 'perform_lab_test'), false, `${role} must not run labs`);
  }
});

test('clinical officers carry doctor-line privileges within their scope', () => {
  assert.equal(mayPerform('clinical_officer', 'triage'), true);
  assert.equal(mayPerform('clinical_officer', 'diagnose'), true);
  assert.equal(mayPerform('clinical_officer', 'prescribe_medication'), true);
  assert.equal(mayPerform('clinical_officer', 'admit_patient'), true);
  assert.equal(mayPerform('clinical_officer', 'discharge_patient'), true);
  assert.equal(mayPerform('clinical_officer', 'register_patient'), false);
  assert.equal(mayPerform('clinical_officer', 'dispense_medication'), false);
});

test('lab, radiology, pharmacy, finance are exclusive to their profession', () => {
  assert.equal(mayPerform('lab_technologist', 'perform_lab_test'), true);
  assert.equal(mayPerform('radiologist', 'report_imaging'), true);
  assert.equal(mayPerform('pharmacist', 'dispense_medication'), true);
  assert.equal(roleMayPerform('lab_technologist', 'diagnose').verdict, 'denied');
  assert.equal(roleMayPerform('radiographer', 'prescribe_medication').verdict, 'denied');
  assert.equal(roleMayPerform('pharmacist', 'admit_patient').verdict, 'denied');
  assert.equal(roleMayPerform('finance_officer', 'triage').verdict, 'denied');
});

test('conditional cells carry the constitutional reason and default to denied', () => {
  const nurseOrder = rightsFor('nurse', 'order_labs_imaging');
  assert.equal(nurseOrder.verdict, 'conditional');
  assert.match(nurseOrder.reason!, /protocol/i);

  assert.equal(mayPerform('staff_nurse', 'order_labs_imaging'), false, 'conditional is denied by default');
  assert.equal(mayPerform('staff_nurse', 'order_labs_imaging', { allowConditional: true }), true);

  const bed = rightsFor('nurse', 'allocate_bed');
  assert.equal(bed.verdict, 'conditional');
  assert.match(bed.reason!, /Ward In-Charge/);

  const vitals = rightsFor('doctor', 'record_vitals');
  assert.equal(vitals.verdict, 'conditional');
});

test('role mapping resolves positions onto families for all matrix columns', () => {
  for (const family of RIGHTS_ACTOR_FAMILIES) {
    const roles = Object.entries(ROLE_TO_RIGHTS_FAMILY).filter(([, f]) => f === family).map(([r]) => r);
    assert.ok(roles.length >= 1, `family ${family} must map at least one role`);
  }
  assert.equal(ROLE_TO_RIGHTS_FAMILY.consultant, 'doctor');
  assert.equal(ROLE_TO_RIGHTS_FAMILY.receptionist, 'reception');
  assert.equal(ROLE_TO_RIGHTS_FAMILY.medical_director, 'doctor');
});

test('assertRights throws for denied and unmapped roles; passes for allowed', () => {
  assert.doesNotThrow(() => assertRights('medical_officer', 'discharge_patient'));
  assert.doesNotThrow(() => assertRights('staff_nurse', 'triage'));
  assert.throws(() => assertRights('staff_nurse', 'diagnose'), /may not diagnose/);
  assert.throws(() => assertRights('receptionist', 'prescribe_medication'), /may not prescribe_medication/);
  assert.throws(() => assertRights('unmapped_role', 'triage'), /not mapped/);
});

test('enforceRights returns audit provenance for every allowed action', () => {
  const rec = enforceRights(uid('usr-9'), 'consultant', 'diagnose');
  assert.equal(rec.allowed, true);
  assert.equal(rec.family, 'doctor');
  assert.equal(rec.activity, 'diagnose');
  assert.equal(typeof rec.at, 'number');
  assert.throws(() => enforceRights(uid('usr-9'), 'lab_technologist', 'prescribe_medication'), /may not prescribe_medication/);
});

test('primaryOwner is single for exclusive activities and undefined for shared ones', () => {
  assert.equal(primaryOwner('perform_lab_test'), 'laboratory');
  assert.equal(primaryOwner('report_imaging'), 'radiology');
  assert.equal(primaryOwner('dispense_medication'), 'pharmacy');
  assert.equal(primaryOwner('verify_identity'), 'reception');
  assert.equal(primaryOwner('diagnose'), undefined, 'doctor + clinical officer share diagnosis');
  assert.equal(primaryOwner('triage'), undefined, 'nurse + CO share triage');
});

test('the full journey is one continuous graph — every step has an owner', () => {
  const journey: RightsActivity[] = [
    'register_patient', 'verify_identity', 'create_encounter', 'triage',
    'take_history', 'perform_examination', 'order_labs_imaging',
    'perform_lab_test', 'report_imaging', 'diagnose', 'prescribe_medication',
    'dispense_medication', 'administer_medication', 'admit_patient',
    'allocate_bed', 'write_medical_progress_notes', 'write_nursing_notes',
    'discharge_patient',
  ];
  for (const step of journey) {
    const eligible = RIGHTS_ACTOR_FAMILIES.filter(f => rightsFor(f, step).verdict !== 'denied');
    assert.ok(eligible.length >= 1, `journey step ${step} needs an eligible actor`);
  }
});
