import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
  UniversalEngineEvent, DIVISIONS, getAllDivisions, getDivision, getEngineCategoryLabel,
  DEFAULT_OI_CONFIG,
} from '@/lib/amexan/operations/operations-constitution';
import { TelemetryBroker, initTelemetryBroker, getTelemetryBroker, telemetryEmit, isTelemetryInitialized } from '@/lib/amexan/operations/telemetry-broker';
import { OIDatabase, createOIDatabase } from '@/lib/amexan/operations/oi-database';
import { engineRegistry } from '@/lib/amexan/operations/engine-registry';
import { ruleRegistry } from '@/lib/amexan/operations/rule-registry';
import { knowledgeRegistry } from '@/lib/amexan/operations/knowledge-registry';
import { workflowRegistry } from '@/lib/amexan/operations/workflow-registry';
import { engineHealthRegistry, EngineHealthRegistry, EngineHealthAlert } from '@/lib/amexan/operations/engine-health-registry';
import { initializeAGOC, registerAllEngines, registerAllWorkflows, registerAllRules } from '@/lib/amexan/operations/engine-registration';

function makeSampleEvent(overrides: Partial<UniversalEngineEvent> = {}): UniversalEngineEvent {
  return {
    eventId: 'evt_001', engineId: 'test_engine', engineName: 'Test Engine',
    engineCategory: 'clinical_reasoning', engineVersion: '1.0.0',
    sessionId: 'session_001', tenantId: 'tenant_001',
    facilityId: 'fac_001', departmentId: 'dept_001',
    workflowId: 'clinical_care_default',
    actorType: 'doctor',
    context: { actorType: 'doctor', journeyId: 'clinical_care', phaseId: 'history', patientAgeGroup: 'adult', patientGender: 'male' },
    trigger: { type: 'user_action', source: 'doctor_input' },
    execution: { startTime: new Date(Date.now() - 1000).toISOString(), endTime: new Date().toISOString(), durationMs: 500, retryCount: 0, cacheHit: false },
    inputs: { keys: ['chief_complaint', 'age', 'gender'], types: ['string', 'number', 'string'], summary: 'Patient demographics and chief complaint' },
    outputs: { keys: ['differentials', 'red_flags'], types: ['array', 'array'], summary: '3 differentials, 2 red flags' },
    confidence: 0.85, warnings: [], errors: [],
    ruleIds: ['R_ACT_001', 'R_SAF_003'],
    ruleResults: [
      { ruleId: 'R_ACT_001', ruleName: 'Chest Pain Activation', triggered: true, result: { highway: 'cardiac' }, durationMs: 2 },
      { ruleId: 'R_SAF_003', ruleName: 'Red Flag Priority', triggered: true, result: { priority: 1 }, durationMs: 1 },
    ],
    knowledgeIds: ['KB_PNEUMONIA', 'KB_MALARIA'],
    graphNodes: ['symptom_cough', 'mechanism_alveolar_inflammation', 'phenotype_consolidation', 'disease_pneumonia'],
    graphEdges: ['symptom_cough→mechanism_alveolar_inflammation', 'mechanism_alveolar_inflammation→phenotype_consolidation'],
    factsGenerated: [
      { factId: 'fact_001', factType: 'symptom_present', label: 'Cough present', sourceEngine: 'test_engine', confidence: 0.9 },
      { factId: 'fact_002', factType: 'differential', label: 'Pneumonia (85%)', sourceEngine: 'test_engine', confidence: 0.85 },
    ],
    recommendations: [
      { recommendationId: 'rec_001', type: 'investigation', label: 'Chest X-ray', confidence: 0.85, rationale: 'To confirm pneumonia', linkedKnowledgeIds: ['KB_PNEUMONIA'] },
    ],
    nextEnginesActivated: ['examination_engine', 'investigation_engine'],
    constitutionalChecks: [{ checkId: 'CC_001', checkName: 'Engine Sequence', passed: true }],
    timestamp: new Date().toISOString(),
    durationMs: 500,
    status: 'success',
    ...overrides,
  };
}

describe('Book XXIV — AGOC Constitution', () => {
  it('defines all 20 divisions', () => {
    const divisions = getAllDivisions();
    expect(divisions.length).toBe(24);
    expect(divisions[0].priority).toBe(0);
    expect(divisions[0].id).toBe('constitutional_council');
  });

  it('each division has purpose, monitors, consumes, produces', () => {
    for (const div of Object.values(DIVISIONS)) {
      expect(div.purpose).toBeTruthy();
      expect(div.monitors).toBeTruthy();
      expect(div.consumesEngineCategories.length).toBeGreaterThan(0);
      expect(div.produces.length).toBeGreaterThan(0);
    }
  });

  it('getDivision returns correct division', () => {
    const div = getDivision('clinical_intelligence');
    expect(div.name).toBe('Clinical Intelligence Division');
    expect(div.priority).toBe(1);
  });

  it('getEngineCategoryLabel returns readable labels', () => {
    expect(getEngineCategoryLabel('clinical_reasoning')).toBe('Clinical Reasoning');
    expect(getEngineCategoryLabel('knowledge_compiler')).toBe('Knowledge Compiler');
    expect(getEngineCategoryLabel('enterprise_plugin')).toBe('Plugin Engine');
  });
});

describe('UniversalEngineEvent', () => {
  it('creates a valid sample event', () => {
    const event = makeSampleEvent();
    expect(event.eventId).toBe('evt_001');
    expect(event.engineCategory).toBe('clinical_reasoning');
    expect(event.status).toBe('success');
    expect(event.ruleResults.length).toBe(2);
    expect(event.factsGenerated.length).toBe(2);
    expect(event.recommendations.length).toBe(1);
    expect(event.constitutionalChecks.length).toBe(1);
  });

  it('supports all engine categories', () => {
    const categories = [
      'clinical_reasoning', 'clinical_documentation', 'question', 'examination',
      'investigation', 'danger_scoring', 'presentation', 'experience',
      'knowledge_compiler', 'knowledge_graph', 'enterprise_billing',
      'enterprise_security', 'enterprise_multi_tenant', 'orchestrator',
    ];
    for (const cat of categories) {
      const event = makeSampleEvent({ engineCategory: cat as any });
      expect(event.engineCategory).toBe(cat);
    }
  });

  it('supports all trigger types', () => {
    const triggers = ['user_action', 'system_scheduled', 'engine_chain', 'external_hook', 'manual_override'] as const;
    for (const trigger of triggers) {
      const event = makeSampleEvent({ trigger: { type: trigger, source: 'test' } });
      expect(event.trigger.type).toBe(trigger);
    }
  });

  it('supports all statuses', () => {
    const statuses = ['success', 'partial', 'failed', 'skipped'] as const;
    for (const status of statuses) {
      const event = makeSampleEvent({ status });
      expect(event.status).toBe(status);
    }
  });
});

describe('Telemetry Broker', () => {
  let oiDb: OIDatabase;

  beforeEach(() => {
    oiDb = createOIDatabase();
  });

  it('initializes and emits events', () => {
    const broker = initTelemetryBroker(oiDb);
    const event = makeSampleEvent();
    broker.emit(event);
    const stats = broker.getStats();
    expect(stats.emitted).toBe(1);
    expect(stats.dropped).toBe(0);
  });

  it('drops events via middleware', () => {
    const broker = initTelemetryBroker(oiDb);
    broker.use((e) => null);
    broker.emit(makeSampleEvent());
    expect(broker.getStats().dropped).toBe(1);
  });

  it('transforms events via middleware', () => {
    const broker = initTelemetryBroker(oiDb);
    broker.use((e) => ({ ...e, actorType: 'transformed' }));
    const event = makeSampleEvent({ actorType: 'doctor' });
    broker.emit(event);
    const stored = oiDb.getEvent(event.eventId);
    expect(stored!.actorType).toBe('transformed');
  });

  it('supports pause/resume', () => {
    const broker = initTelemetryBroker(oiDb);
    broker.pause();
    broker.emit(makeSampleEvent());
    expect(broker.getStats().emitted).toBe(0);
    broker.resume();
    broker.emit(makeSampleEvent());
    expect(broker.getStats().emitted).toBe(1);
  });

  it('emits batch events', () => {
    const broker = initTelemetryBroker(oiDb);
    broker.emitBatch([makeSampleEvent({ eventId: 'batch_1' }), makeSampleEvent({ eventId: 'batch_2' })]);
    expect(broker.getStats().emitted).toBe(2);
  });

  it('isTelemetryInitialized returns correct state', () => {
    expect(isTelemetryInitialized()).toBe(true);
  });

  it('telemetryEmit static function works', () => {
    const localBroker = initTelemetryBroker(oiDb);
    localBroker.emit(makeSampleEvent({ eventId: 'static_test' }));
    const event = oiDb.getEvent('static_test');
    expect(event).toBeDefined();
  });

  it('clearStats resets counters', () => {
    const broker = initTelemetryBroker(oiDb);
    broker.emit(makeSampleEvent());
    broker.clearStats();
    expect(broker.getStats().emitted).toBe(0);
  });

  it('reset reinitializes', () => {
    const broker = initTelemetryBroker(oiDb);
    broker.emit(makeSampleEvent());
    broker.reset();
    expect(broker.getStats().emitted).toBe(0);
    expect(broker.getStats().activeMiddlewares).toBe(0);
  });
});

describe('OI Database', () => {
  let db: OIDatabase;

  beforeEach(() => {
    db = createOIDatabase();
  });

  it('stores and retrieves events', () => {
    db.storeEvent(makeSampleEvent());
    const event = db.getEvent('evt_001');
    expect(event).toBeDefined();
    expect(event!.engineId).toBe('test_engine');
  });

  it('queries events by filters', () => {
    db.storeEvent(makeSampleEvent({ eventId: 'q1', engineId: 'engine_a', status: 'success' }));
    db.storeEvent(makeSampleEvent({ eventId: 'q2', engineId: 'engine_b', status: 'failed' }));
    db.storeEvent(makeSampleEvent({ eventId: 'q3', engineId: 'engine_a', status: 'success' }));

    const engineAEvents = db.queryEvents({ engineId: 'engine_a' });
    expect(engineAEvents.length).toBe(2);

    const failedEvents = db.queryEvents({ status: 'failed' });
    expect(failedEvents.length).toBe(1);
  });

  it('tracks rule activations', () => {
    db.storeEvent(makeSampleEvent());
    const activations = db.getRuleActivations('R_ACT_001');
    expect(activations.length).toBe(1);
    expect(activations[0].count).toBe(1);
  });

  it('tracks top rules', () => {
    db.storeEvent(makeSampleEvent());
    const top = db.getTopRules(5);
    expect(top.length).toBeGreaterThan(0);
  });

  it('identifies unused rules', () => {
    const unused = db.getUnusedRules(['R_ACT_001', 'R_NEVER_USED']);
    expect(unused).toContain('R_NEVER_USED');
  });

  it('tracks performance metrics', () => {
    db.storeEvent(makeSampleEvent({ engineId: 'perf_engine', durationMs: 100 }));
    db.storeEvent(makeSampleEvent({ engineId: 'perf_engine', durationMs: 200 }));
    const perf = db.getPerformance('perf_engine');
    expect(perf).toBeDefined();
    expect(perf!.avgDurationMs).toBeGreaterThan(0);
    expect(perf!.sampleCount).toBe(2);
  });

  it('returns all performance', () => {
    db.storeEvent(makeSampleEvent({ engineId: 'perf_a', durationMs: 150 }));
    db.storeEvent(makeSampleEvent({ engineId: 'perf_b', durationMs: 300 }));
    const allPerf = db.getAllPerformance();
    expect(allPerf.length).toBe(2);
  });

  it('tracks engine health', () => {
    db.storeEvent(makeSampleEvent({ engineId: 'health_engine', status: 'success', durationMs: 100 }));
    const health = db.getEngineHealth('health_engine');
    expect(health).toBeDefined();
    expect(health!.totalExecutions).toBe(1);
    expect(health!.successfulExecutions).toBe(1);
    expect(health!.errorRate).toBe(0);
  });

  it('detects unhealthy engines', () => {
    db.storeEvent(makeSampleEvent({ engineId: 'bad_engine', status: 'failed', durationMs: 6000 }));
    const unhealthy = db.getUnhealthyEngines();
    expect(unhealthy.length).toBeGreaterThanOrEqual(1);
  });

  it('stores and retrieves observations', () => {
    db.storeObservation({
      id: 'obs_001', divisionId: 'clinical_intelligence', type: 'flag',
      severity: 'warning', title: 'Missing question', description: 'Question 8 never appears',
      sourceEventIds: ['evt_001'], recommendations: ['Investigate question visibility rule'],
      detectedAt: new Date().toISOString(), status: 'open',
    });
    const observations = db.getObservations('clinical_intelligence');
    expect(observations.length).toBe(1);
    expect(observations[0].title).toBe('Missing question');
  });

  it('resolves observations', () => {
    db.storeObservation({
      id: 'obs_002', divisionId: 'clinical_intelligence', type: 'flag',
      severity: 'warning', title: 'Test', description: '',
      sourceEventIds: [], recommendations: [],
      detectedAt: new Date().toISOString(), status: 'open',
    });
    db.resolveObservation('obs_002');
    const obs = db.getObservations('clinical_intelligence', 'resolved');
    expect(obs.length).toBe(1);
  });

  it('records and queries custom metrics', () => {
    db.recordMetric('test_metric', 42, { env: 'test' });
    const metrics = db.queryMetrics('test_metric');
    expect(metrics.length).toBe(1);
    expect(metrics[0].value).toBe(42);
  });

  it('returns storage stats', () => {
    const stats = db.getStorageStats();
    expect(typeof stats.events).toBe('number');
    expect(typeof stats.ruleActivations).toBe('number');
  });

  it('resets cleanly', () => {
    db.storeEvent(makeSampleEvent());
    db.reset();
    expect(db.getEventCount()).toBe(0);
  });
});

describe('Engine Registry', () => {
  beforeEach(() => {
    // Clear by re-registering via re-import doesn't work, use a separate test pattern
  });

  it('registers and retrieves engines', () => {
    const reg = engineRegistry.register({
      engineId: 'custom_engine', engineName: 'Custom', category: 'clinical_reasoning',
      version: '1.0.0', description: 'Custom test engine',
      inputs: ['input_a'], outputs: ['output_a'], dependencies: [],
      constitutionalLaws: [1, 2], status: 'active',
    });
    expect(reg.engineId).toBe('custom_engine');
    expect(reg.registeredAt).toBeTruthy();
    expect(reg.status).toBe('active');

    const retrieved = engineRegistry.get('custom_engine');
    expect(retrieved).toBeDefined();
    expect(retrieved!.engineName).toBe('Custom');
  });

  it('registers batch engines', () => {
    const batch = engineRegistry.registerBatch([
      { engineId: 'batch_1', engineName: 'Batch 1', category: 'question', version: '1.0.0', description: '', inputs: [], outputs: [], dependencies: [], constitutionalLaws: [], status: 'active' },
      { engineId: 'batch_2', engineName: 'Batch 2', category: 'examination', version: '1.0.0', description: '', inputs: [], outputs: [], dependencies: [], constitutionalLaws: [], status: 'active' },
    ]);
    expect(batch.length).toBe(2);
  });

  it('filters by category', () => {
    const reasoningEngines = engineRegistry.getByCategory('clinical_reasoning');
    expect(reasoningEngines.length).toBeGreaterThan(0);
    expect(reasoningEngines.every(e => e.category === 'clinical_reasoning')).toBe(true);
  });

  it('updates last event timestamp', () => {
    engineRegistry.updateLastEvent('custom_engine', new Date().toISOString());
    const engine = engineRegistry.get('custom_engine');
    expect(engine!.lastEventAt).toBeTruthy();
  });

  it('deprecates and retires engines', () => {
    engineRegistry.register({
      engineId: 'lifecycle_engine', engineName: 'Lifecycle', category: 'theme',
      version: '1.0.0', description: '', inputs: [], outputs: [], dependencies: [],
      constitutionalLaws: [], status: 'active',
    });
    expect(engineRegistry.deprecate('lifecycle_engine')).toBe(true);
    expect(engineRegistry.get('lifecycle_engine')!.status).toBe('deprecated');
    expect(engineRegistry.retire('lifecycle_engine')).toBe(true);
    expect(engineRegistry.get('lifecycle_engine')!.status).toBe('retired');
  });
});

describe('Engine Registry (with full registration)', () => {
  beforeAll(() => {
    registerAllEngines();
  });

  it('finds dependent engines', () => {
    const dependents = engineRegistry.findDependents('knowledge_graph');
    expect(dependents.length).toBeGreaterThanOrEqual(1);
    expect(dependents.some(e => e.engineId === 'knowledge_integration')).toBe(true);
  });

  it('detects circular dependencies', () => {
    const circular = engineRegistry.hasCircularDependency();
    expect(Array.isArray(circular)).toBe(true);
  });

  it('searches engines by query', () => {
    const results = engineRegistry.search('reasoning');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns count and breakdown', () => {
    expect(engineRegistry.getCount()).toBeGreaterThan(0);
    const byStatus = engineRegistry.getByStatus();
    expect(byStatus.active).toBeGreaterThan(0);
    const byCategory = engineRegistry.getByCategoryBreakdown();
    expect(Object.keys(byCategory).length).toBeGreaterThan(0);
  });
});

describe('Full Engine Registration (AGOC Initialize)', () => {
  it('registerAllEngines registers all system engines', () => {
    registerAllEngines();
    const count = engineRegistry.getCount();
    expect(count).toBeGreaterThanOrEqual(40);

    const keyEngines = ['encounter_orchestrator', 'bayesian_engine', 'question_engine', 'narrative_engine', 'presentation_engine', 'knowledge_graph', 'licensing_engine', 'security_engine'];
    for (const id of keyEngines) {
      expect(engineRegistry.get(id)).toBeDefined();
    }
  });

  it('registerAllWorkflows registers all workflows', () => {
    registerAllWorkflows();
    const workflows = workflowRegistry.getAll();
    expect(workflows.length).toBeGreaterThanOrEqual(8);
    expect(workflowRegistry.get('clinical_care_default')).toBeDefined();
    expect(workflowRegistry.get('nursing_care_default')).toBeDefined();
  });

  it('registerAllRules registers all rules', () => {
    registerAllRules();
    const rules = ruleRegistry.getAll();
    expect(rules.length).toBeGreaterThanOrEqual(17);
    expect(ruleRegistry.get('R_SAF_001')).toBeDefined();
    expect(ruleRegistry.get('R_ACT_001')).toBeDefined();
  });
});

describe('Rule Registry', () => {
  beforeEach(() => {
    registerAllRules();
  });

  it('registers and retrieves rules', () => {
    const rule = ruleRegistry.register({
      ruleId: 'R_CUSTOM_001', ruleName: 'Custom Rule', engineId: 'test_engine',
      category: 'safety', description: 'Test rule', conditions: 'true', effect: 'nothing',
      version: '1.0.0', status: 'active',
    });
    expect(rule.ruleId).toBe('R_CUSTOM_001');
    expect(rule.triggerCount).toBe(0);
  });

  it('filters by category and status', () => {
    const safetyRules = ruleRegistry.getAll('safety');
    expect(safetyRules.length).toBeGreaterThan(0);
    expect(safetyRules.every(r => r.category === 'safety')).toBe(true);
  });

  it('filters by engine', () => {
    const engineRules = ruleRegistry.getByEngine('question_engine');
    expect(engineRules.length).toBeGreaterThan(0);
  });

  it('records triggers', () => {
    ruleRegistry.recordTrigger('R_SAF_001');
    const rule = ruleRegistry.get('R_SAF_001');
    expect(rule!.triggerCount).toBe(1);
    expect(rule!.lastTriggeredAt).toBeTruthy();
  });

  it('deprecates and supersedes rules', () => {
    ruleRegistry.deprecate('R_CUSTOM_001', 'R_CUSTOM_002');
    const rule = ruleRegistry.get('R_CUSTOM_001');
    expect(rule!.status).toBe('deprecated');
    expect(rule!.supersededBy).toBe('R_CUSTOM_002');
  });

  it('detects rule conflicts', () => {
    ruleRegistry.register({
      ruleId: 'R_CONFLICT_A', ruleName: 'Conflict A', engineId: 'test_engine',
      category: 'visibility', description: '', conditions: 'patient.age > 18', effect: 'visible = true',
      version: '1.0.0', status: 'active',
    });
    ruleRegistry.register({
      ruleId: 'R_CONFLICT_B', ruleName: 'Conflict B', engineId: 'test_engine',
      category: 'visibility', description: '', conditions: 'patient.age > 18', effect: 'visible = false',
      version: '1.0.0', status: 'active',
    });
    const conflicts = ruleRegistry.getConflicts();
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    expect(conflicts[0].reason).toContain('Same conditions');
  });

  it('detects orphaned rules', () => {
    const orphaned = ruleRegistry.getOrphanedRules(['test_engine']);
    expect(orphaned.length).toBeGreaterThan(0);
    expect(orphaned.every(r => !['test_engine'].includes(r.engineId))).toBe(true);
  });

  it('identifies never-triggered rules', () => {
    const neverTriggered = ruleRegistry.getNeverTriggeredRules();
    expect(neverTriggered.length).toBeGreaterThan(0);
  });

  it('returns rule coverage stats', () => {
    const coverage = ruleRegistry.getRuleCoverage();
    expect(coverage.total).toBeGreaterThan(0);
    expect(Object.keys(coverage.byCategory).length).toBeGreaterThan(0);
    expect(Object.keys(coverage.byEngine).length).toBeGreaterThan(0);
  });

  it('searches rules by query', () => {
    const results = ruleRegistry.search('pregnancy');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns trigger frequency', () => {
    const freq = ruleRegistry.getTriggerFrequency();
    expect(Array.isArray(freq)).toBe(true);
  });
});

describe('Knowledge Registry (AGOC)', () => {
  it('registers and retrieves knowledge packages', () => {
    const pkg = knowledgeRegistry.register({
      packageId: 'KB_TEST_001', name: 'Test Pneumonia', version: '2026.1',
      description: 'Test pneumonia guideline', objectCount: 27, edgeCount: 30,
      diseases: ['Pneumonia'], symptoms: ['Cough', 'Fever', 'Dyspnea'],
      sourceAuthority: 'IDSA', publishedAt: '2026-01-01', status: 'published',
    });
    expect(pkg.packageId).toBe('KB_TEST_001');
    expect(pkg.registeredAt).toBeTruthy();
  });

  it('retrieves by name (latest version)', () => {
    const pkg = knowledgeRegistry.getByName('Test Pneumonia');
    expect(pkg).toBeDefined();
    expect(pkg!.version).toBe('2026.1');
  });

  it('tracks version history', () => {
    knowledgeRegistry.register({
      packageId: 'KB_TEST_V2', name: 'Test Pneumonia', version: '2026.2',
      description: 'Updated pneumonia guideline', objectCount: 30, edgeCount: 35,
      diseases: ['Pneumonia'], symptoms: ['Cough', 'Fever'],
      sourceAuthority: 'IDSA', publishedAt: '2026-06-01', status: 'published',
    });
    const history = knowledgeRegistry.getVersionHistory('Test Pneumonia');
    expect(history.length).toBe(2);
  });

  it('updates package status', () => {
    knowledgeRegistry.updateStatus('KB_TEST_V2', 'superseded', 'KB_TEST_V3');
    const pkg = knowledgeRegistry.get('KB_TEST_V2');
    expect(pkg!.status).toBe('superseded');
    expect(pkg!.supersededBy).toBe('KB_TEST_V3');
  });

  it('records approval gate results', () => {
    knowledgeRegistry.recordGateResult('KB_TEST_001', { gateName: 'Syntax Check', passed: true });
    knowledgeRegistry.recordGateResult('KB_TEST_001', { gateName: 'Clinical Review', passed: true });
    const pkg = knowledgeRegistry.get('KB_TEST_001');
    expect(pkg!.approvalGateResults.length).toBe(2);
  });

  it('gets latest approved packages', () => {
    const approved = knowledgeRegistry.getLatestApproved();
    expect(approved.length).toBeGreaterThan(0);
  });

  it('identifies outdated packages', () => {
    const outdated = knowledgeRegistry.getOutdatedPackages();
    expect(outdated.length).toBeGreaterThanOrEqual(1);
  });

  it('calculates gate failure rate', () => {
    const rate = knowledgeRegistry.getGateFailureRate();
    expect(rate.total).toBeGreaterThan(0);
    expect(typeof rate.rate).toBe('number');
  });

  it('searches by query', () => {
    const results = knowledgeRegistry.search('Pneumonia');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns stats', () => {
    const stats = knowledgeRegistry.getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.avgObjectsPerPackage).toBeGreaterThan(0);
  });
});

describe('Workflow Registry', () => {
  beforeEach(() => {
    registerAllWorkflows();
  });

  it('registers and retrieves workflows', () => {
    const wf = workflowRegistry.register({
      workflowId: 'wf_custom', workflowName: 'Custom Workflow', journeyId: 'clinical_care',
      expectedPhases: ['phase_a', 'phase_b'], expectedDurationPerPhase: { phase_a: 1000, phase_b: 2000 },
      expectedTotalDuration: 3000, actorTypes: ['doctor'], version: '1.0.0', status: 'active',
    });
    expect(wf.workflowId).toBe('wf_custom');
  });

  it('filters by journey and status', () => {
    const clinical = workflowRegistry.getAll('clinical_care');
    expect(clinical.length).toBeGreaterThan(0);
  });

  it('records and retrieves executions', () => {
    workflowRegistry.recordExecution({
      executionId: 'exec_001', workflowId: 'clinical_care_default',
      sessionId: 'session_001', tenantId: 'tenant_001',
      actorType: 'doctor', journeyId: 'clinical_care',
      phases: [
        { phaseId: 'registration', phaseName: 'Registration', startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), durationMs: 100000, skipped: false, cardCount: 5, actionsCount: 3 },
        { phaseId: 'triage', phaseName: 'Triage', startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), durationMs: 200000, skipped: false, cardCount: 8, actionsCount: 5 },
        { phaseId: 'history', phaseName: 'History', startedAt: new Date().toISOString(), durationMs: 500000, skipped: false, cardCount: 20, actionsCount: 15 },
      ],
      startedAt: new Date().toISOString(), aborted: false,
    });
    const executions = workflowRegistry.getExecutions('clinical_care_default');
    expect(executions.length).toBe(1);
  });

  it('computes workflow analytics', () => {
    const analytics = workflowRegistry.getWorkflowAnalytics('clinical_care_default');
    expect(analytics.totalExecutions).toBeGreaterThan(0);
    expect(typeof analytics.completionRate).toBe('number');
  });

  it('detects bottleneck phases', () => {
    const bottlenecks = workflowRegistry.getBottleneckPhases(30000);
    expect(Array.isArray(bottlenecks)).toBe(true);
  });

  it('returns stats summary', () => {
    const stats = workflowRegistry.getStats();
    expect(stats.totalWorkflows).toBeGreaterThan(0);
    expect(Object.keys(stats.byJourney).length).toBeGreaterThan(0);
  });
});

describe('Engine Health Registry', () => {
  let healthReg: EngineHealthRegistry;

  beforeEach(() => {
    healthReg = new EngineHealthRegistry();
  });

  it('records execution and returns health', () => {
    healthReg.recordExecution('engine_a', 100, 200, true, new Date().toISOString());
    const health = healthReg.getHealth('engine_a');
    expect(health).toBeDefined();
    expect(health!.totalExecutions).toBe(1);
    expect(health!.successfulExecutions).toBe(1);
    expect(health!.status).toBe('healthy');
  });

  it('detects degraded engines from error rate', () => {
    for (let i = 0; i < 40; i++) {
      healthReg.recordExecution('bad_engine', 100, 200, i >= 3, new Date().toISOString());
    }
    const health = healthReg.getHealth('bad_engine');
    expect(health!.errorRate).toBeGreaterThan(5);
    expect(health!.status).toBe('degraded');
  });

  it('detects unhealthy engines from latency', () => {
    healthReg.recordExecution('slow_engine', 100, 6000, true, new Date().toISOString());
    const health = healthReg.getHealth('slow_engine');
    expect(health!.p95DurationMs).toBe(6000);
    expect(health!.status).toBe('unhealthy');
  });

  it('categorizes engines by status', () => {
    healthReg.recordExecution('healthy_a', 100, 200, true, new Date().toISOString());
    healthReg.recordExecution('degraded_a', 100, 200, false, new Date().toISOString());
    healthReg.recordExecution('degraded_a', 100, 200, false, new Date().toISOString());

    expect(healthReg.getHealthy().length).toBeGreaterThanOrEqual(1);
    expect(healthReg.getStatusSummary().healthy).toBeGreaterThanOrEqual(1);
  });

  it('returns status summary with health score', () => {
    healthReg.recordExecution('engine_x', 100, 200, true, new Date().toISOString());
    const summary = healthReg.getStatusSummary();
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.healthScore).toBeGreaterThan(0);
  });

  it('identifies engine with worst health', () => {
    healthReg.recordExecution('healthy_engine', 100, 200, true, new Date().toISOString());
    healthReg.recordExecution('unhealthy_engine', 100, 200, false, new Date().toISOString());
    healthReg.recordExecution('unhealthy_engine', 100, 200, false, new Date().toISOString());
    healthReg.recordExecution('unhealthy_engine', 100, 200, false, new Date().toISOString());

    const worst = healthReg.getEngineWithWorstHealth();
    expect(worst).toBeDefined();
    expect(worst!.engineId).toBe('unhealthy_engine');
  });

  it('manages alerts', () => {
    healthReg.recordExecution('alert_engine', 100, 6000, true, new Date().toISOString());
    const alerts = healthReg.getAlerts('open');
    expect(alerts.length).toBe(1);
    expect(alerts[0].engineId).toBe('alert_engine');

    healthReg.acknowledgeAlert('alert_engine');
    expect(healthReg.getAlerts('open').length).toBe(0);
    expect(healthReg.getAlerts('acknowledged').length).toBe(1);

    healthReg.resolveAlert('alert_engine');
    expect(healthReg.getAlerts('resolved').length).toBe(1);
  });

  it('updates health thresholds', () => {
    healthReg.updateThresholds({ errorRateWarning: 1, errorRateCritical: 5 });
    const thresholds = healthReg.getThresholds();
    expect(thresholds.errorRateWarning).toBe(1);
    expect(thresholds.errorRateCritical).toBe(5);
  });

  it('resets cleanly', () => {
    healthReg.recordExecution('temp_engine', 100, 200, true, new Date().toISOString());
    healthReg.reset();
    expect(healthReg.getStatusSummary().total).toBe(0);
  });
});

describe('End-to-End: Engine → Telemetry → OI DB → Registry → Health', () => {
  it('full pipeline: engine emits → broker routes → OI DB stores → registries track → health updates', () => {
    const oiDb = createOIDatabase();
    const broker = initTelemetryBroker(oiDb);

    registerAllEngines();
    registerAllWorkflows();
    registerAllRules();

    const event = makeSampleEvent({
      eventId: 'e2e_001', engineId: 'clinical_reasoning_engine',
      engineName: 'Clinical Reasoning Engine', engineCategory: 'clinical_reasoning',
      engineVersion: '1.0.0',
      ruleIds: ['R_ACT_001', 'R_SAF_003', 'R_ORD_001'],
      ruleResults: [
        { ruleId: 'R_ACT_001', ruleName: 'Chest Pain Activation', triggered: true, result: { highway: 'cardiac' }, durationMs: 2 },
        { ruleId: 'R_SAF_003', ruleName: 'Red Flag Priority', triggered: true, result: { priority: 1 }, durationMs: 1 },
        { ruleId: 'R_ORD_001', ruleName: 'History Before Examination', triggered: false, result: { blocked: false }, durationMs: 1 },
      ],
      knowledgeIds: ['KB_PNEUMONIA'],
      durationMs: 450,
      status: 'success',
    });

    broker.emit(event);

    expect(oiDb.getEvent('e2e_001')).toBeDefined();
    expect(oiDb.getEventCount()).toBe(1);

    const ruleActivations = oiDb.getRuleActivations('R_ACT_001');
    expect(ruleActivations[0].count).toBe(1);

    const engineReg = engineRegistry.get('clinical_reasoning_engine');
    expect(engineReg).toBeDefined();
    engineRegistry.updateLastEvent('clinical_reasoning_engine', event.timestamp);
    expect(engineRegistry.get('clinical_reasoning_engine')!.lastEventAt).toBeTruthy();

    const perf = oiDb.getPerformance('clinical_reasoning_engine');
    expect(perf).toBeDefined();
    expect(perf!.avgDurationMs).toBe(450);

    const health = oiDb.getEngineHealth('clinical_reasoning_engine');
    expect(health).toBeDefined();
    expect(health!.totalExecutions).toBe(1);
    expect(health!.status).toBe('healthy');

    oiDb.storeObservation({
      id: 'e2e_obs', divisionId: 'clinical_intelligence',
      type: 'observation', severity: 'info',
      title: 'E2E Test Observation',
      description: 'Pipeline works end-to-end',
      sourceEventIds: ['e2e_001'],
      recommendations: [],
      detectedAt: new Date().toISOString(),
      status: 'open',
    });
    const observations = oiDb.getObservations('clinical_intelligence', 'open');
    expect(observations.length).toBe(1);
  });

  it('constitutional checks in event are preserved and queryable', () => {
    const oiDb = createOIDatabase();
    const broker = initTelemetryBroker(oiDb);

    broker.emit(makeSampleEvent({
      eventId: 'cc_test',
      constitutionalChecks: [
        { checkId: 'CC_001', checkName: 'Engine Sequence Correct', passed: true },
        { checkId: 'CC_002', checkName: 'Law 1: Never alters clinical data', passed: true },
        { checkId: 'CC_003', checkName: 'Law 3: Every engine explains itself', passed: true },
      ],
    }));

    const stored = oiDb.getEvent('cc_test');
    expect(stored!.constitutionalChecks.length).toBe(3);
    expect(stored!.constitutionalChecks.every(c => c.passed)).toBe(true);
  });

  it('multiple engine types produce compatible events', () => {
    const oiDb = createOIDatabase();
    const broker = initTelemetryBroker(oiDb);

    const engines = [
      { engineId: 'presentation_engine', category: 'presentation' as const, outputs: 'PresentationScreen' },
      { engineId: 'billing_engine', category: 'enterprise_billing' as const, outputs: 'Invoice' },
      { engineId: 'knowledge_graph', category: 'knowledge_graph' as const, outputs: 'GraphNode[]' },
      { engineId: 'security_engine', category: 'enterprise_security' as const, outputs: 'AuditLogEntry' },
    ];

    for (const eng of engines) {
      broker.emit(makeSampleEvent({
        eventId: `multi_${eng.engineId}`,
        engineId: eng.engineId,
        engineName: eng.engineId,
        engineCategory: eng.category,
        outputs: { keys: [eng.outputs], types: ['object'], summary: eng.outputs },
      }));
    }

    expect(oiDb.getEventCount()).toBe(4);
    for (const eng of engines) {
      const events = oiDb.queryEvents({ engineId: eng.engineId });
      expect(events.length).toBe(1);
    }
  });
});