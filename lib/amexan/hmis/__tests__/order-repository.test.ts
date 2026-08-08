/**
 * Universal Orders — Engine↔Firestore bridge mapper tests (Node test runner)
 *
 * Run: node --import tsx --test lib/amexan/hmis/__tests__/order-repository.test.ts
 *
 * Tests the pure mappers that convert encounter-generated orders
 * (lab / imaging / prescription) into Universal Order documents.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createEncounterOrchestrator, requestLabOrder, requestImagingOrder, prescribeMedication } from '@/lib/amexan/encounter-engine/engines/orchestrator';
import { OrderCategory, OrderPriority, OrderStatus } from '@/lib/amexan/hmis/orders-engine';
import { buildLabOrderData, buildImagingOrderData, buildRxOrderData } from '@/lib/amexan/hmis/orderRepository';

const ORG = 'telemed-a98cf';
const DEPT = 'OUTPATIENT';
const UNIT = 'general';
const ENC = 'enc-test-001';

function stateWithLab(): any {
  let s = createEncounterOrchestrator();
  // Simulate an ordered CBC produced by the orchestrator.
  s = { ...s, labOrders: [{ id: 'L1', testName: 'Full Blood Count', method: 'blood_work', category: 'diagnostic', reason: 'Rule out sepsis', priority: 'stat' as const, status: 'ordered' as const }] };
  return s;
}

describe('buildLabOrderData', () => {
  it('maps an ordered CBC into a Universal Order with stable id and category', () => {
    const state = stateWithLab();
    const order = buildLabOrderData(ORG, DEPT, UNIT, ENC, state, 'L1');
    assert.ok(order, 'order should exist');
    assert.strictEqual(order.orderCategory, OrderCategory.Laboratory);
    assert.strictEqual(order.orderType, 'lab_hematology');
    assert.strictEqual(order.status, OrderStatus.Ordered);
    assert.strictEqual(order.priority, OrderPriority.STAT);
    assert.strictEqual(order.encounterId, ENC);
    assert.ok(order.id.startsWith(`lab-${ENC}-`));
    assert.strictEqual(order.clinicalIndication, 'Rule out sepsis');
  });

  it('marks suggested orders as unmapped (returns null)', () => {
    const state = stateWithLab();
    state.labOrders[0].status = 'suggested';
    assert.strictEqual(buildLabOrderData(ORG, DEPT, UNIT, ENC, state, 'L1'), null);
  });
});

describe('buildImagingOrderData', () => {
  it('maps a CT request onto the imaging category with modality-derived type', () => {
    const state = createEncounterOrchestrator();
    state.imagingOrders = [{ id: 'I1', studyName: 'Chest CT', method: 'imaging', category: 'diagnostic', reason: 'Rule out PE', priority: 'urgent' as const, status: 'ordered' as const, modality: 'CT' as any, bodyRegion: 'chest' }];
    const order = buildImagingOrderData(ORG, DEPT, UNIT, ENC, state, 'I1');
    assert.ok(order);
    assert.strictEqual(order.orderCategory, OrderCategory.Imaging);
    assert.strictEqual(order.orderType, 'imaging_ct');
    assert.strictEqual(order.priority, OrderPriority.Urgent);
  });
});

describe('buildRxOrderData', () => {
  it('maps a prescribed medication onto the medication category', () => {
    const state = createEncounterOrchestrator();
    state.prescriptionOrders = [{ id: 'R1', drugName: 'Ceftriaxone', genericName: 'ceftriaxone', dose: '2', doseUnit: 'g', route: 'IV', frequency: 'OD', duration: '7', durationUnit: 'days', category: 'definitive', indication: 'CAP', reason: 'Severe pneumonia', priority: 'routine' as const, status: 'prescribed' as const, allergies: [], contraindications: [], interactions: [], warnings: [], patientInstructions: '', alternativeMeds: [], requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe' as const }];
    const order = buildRxOrderData(ORG, DEPT, UNIT, ENC, state, 'R1');
    assert.ok(order);
    assert.strictEqual(order.orderCategory, OrderCategory.Medication);
    assert.strictEqual(order.status, OrderStatus.Ordered);
    assert.strictEqual(order.metadata.drugName, 'Ceftriaxone');
  });
});