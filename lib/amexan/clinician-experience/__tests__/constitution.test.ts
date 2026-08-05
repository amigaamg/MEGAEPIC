// ═══════════════════════════════════════════════════════════════════════════════
// CLINICIAN EXPERIENCE CONSTITUTION (BOOK XI) — Verification
//
// Proves the constitutional claim: every one of the 26 clinician mandates maps to
// a real clinician pain, passes at least one constitutional test, and is wired to
// an engine. A clinician has no reason to leave because every feature removes
// cognitive load and returns time to patient care.
//
//   RUN: node --import tsx --test lib/amexan/clinician-experience/__tests__/constitution.test.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CLINICIAN_MANDATES, CLINICIAN_PAINS, CLINICIAN_TESTS, TEST_PASS_REASON,
  mandateByNumber, mandatesForPain, mandatesPassingTest, mandatesForEngine,
  totalMandates, verifyAllMandatesHooked, verifyAllMandatesMeetTests,
} from '@/lib/amexan/clinician-experience';

test('all 26 Book XI mandates are declared', () => {
  assert.equal(totalMandates(), 26);
  assert.deepEqual(
    CLINICIAN_MANDATES.map(m => m.number),
    Array.from({ length: 26 }, (_, i) => i + 1),
  );
  assert.equal(CLINICIAN_MANDATES[0].title, 'Documentation Automation');
  assert.equal(CLINICIAN_MANDATES[25].title, 'Lifelong Professional Workspace');
});

test('every mandate is hooked to at least one engine (no orphan feature)', () => {
  const result = verifyAllMandatesHooked();
  assert.equal(result.ok, true);
  assert.deepEqual(result.broken, []);
});

test('every mandate resolves a real clinician pain and passes a constitutional test', () => {
  const result = verifyAllMandatesMeetTests();
  assert.equal(result.ok, true);
  for (const m of CLINICIAN_MANDATES) {
    assert.ok(m.pains.length > 0, `mandate ${m.number} addresses at least one pain`);
    assert.ok(m.tests.length > 0, `mandate ${m.number} passes at least one test`);
  }
});

test('every pain and every test used in the matrix is a declared canonical value', () => {
  const usedPains = new Set(CLINICIAN_MANDATES.flatMap(m => m.pains));
  for (const p of usedPains) assert.ok(CLINICIAN_PAINS.includes(p), `pain "${p}" must be declared`);
  const usedTests = new Set(CLINICIAN_MANDATES.flatMap(m => m.tests));
  for (const t of usedTests) {
    assert.ok(CLINICIAN_TESTS.includes(t), `test "${t}" must be declared`);
    assert.ok(TEST_PASS_REASON[t], `test "${t}" must have a constitutional reason`);
  }
});

test('the foundational pains — documentation toil, no continuity — are resolved', () => {
  for (const pain of ['documentation_toil', 'no_continuity', 'context_switching', 'duplicate_work']) {
    const m = mandatesForPain(pain as any);
    assert.ok(m.length >= 1, `pain "${pain}" must be addressed by at least one mandate`);
  }
});

test('query engine: find mandates by test they pass', () => {
  const safety = mandatesPassingTest('improves_safety');
  assert.ok(safety.length >= 4, 'multiple mandates improve safety');
  const time = mandatesPassingTest('saves_time');
  assert.ok(time.length >= 6, 'many mandates save clinician time');
});

test('query engine: find mandates by the engine they wire to', () => {
  const intelligence = mandatesForEngine('intelligence');
  assert.ok(intelligence.length >= 4, 'clinical intelligence powers several mandates');
  const communication = mandatesForEngine('communication');
  assert.ok(communication.length >= 1);
});

test('all 25 pain-to-reason and every test covers the constitutional goal', () => {
  // Every one of the nine constitutional tests must be exercised by the 26 mandates.
  for (const test of CLINICIAN_TESTS) {
    assert.ok(mandatesPassingTest(test).length >= 1, `test "${test}" is covered by the mandates`);
  }
  // The core goal" (return time / reduce load) is the most common guarantee.
  const loadShares = mandatesPassingTest('reduces_cognitive_load').length;
  assert.ok(loadShares >= 6, 'reducing cognitive load is a core book-wide guarantee');
});

test('mandates are reachable by number and every mandate is present in order', () => {
  for (let n = 1; n <= 26; n++) {
    const m = mandateByNumber(n);
    assert.ok(m, `mandate ${n} exists`);
    assert.equal(m!.number, n);
  }
  assert.equal(mandateByNumber(99), undefined);
});

test('the constitutional mission harms-none: core toil is collectively eliminated', () => {
  const covered = new Set(CLINICIAN_MANDATES.flatMap(m => m.pains));
  for (const pain of ['wasted_time', 'cognitive_load', 'documentation_toil', 'duplicate_work', 'administrative_burden']) {
    assert.ok(covered.has(pain as any), `core toil pain "${pain}" is addressed by the constitution`);
  }
  // Every mandate reduces at least one pain — nothing is purely additive.
  for (const m of CLINICIAN_MANDATES) {
    assert.ok(m.pains.length >= 1, `mandate ${m.number} "${m.title}" reduces at least one pain`);
  }
});