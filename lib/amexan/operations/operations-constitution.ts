// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AMEXAN GLOBAL OPERATIONS CONSTITUTION â€” Book XXIV
// The Operating Intelligence Layer: monitors engines, not patients.
// Five Fundamental Laws. 20 Divisions. One standardized event format.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ Five Fundamental Laws â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// Law 1 â€” AGOC never alters clinical data. It observes, analyzes, recommends,
//          flags, approves. It never edits patient care.
// Law 2 â€” AGOC monitors engines, not users. Doctors are not evaluated.
//          Reasoning engines, question engines, documentation engines are.
// Law 3 â€” Every engine explains itself. Nothing is a black box.
//          Every decision is reconstructable from events.
// Law 4 â€” Everything is versioned. Questions, protocols, documentation,
//          rules, knowledge, reasoning â€” all carry version provenance.
// Law 5 â€” Every improvement is evidence-based. Nothing changes because
//          someone "felt like it."

// â”€â”€ Engine Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type EngineCategory =
  | 'clinical_reasoning' | 'clinical_scoring' | 'clinical_documentation'
  | 'question' | 'examination' | 'investigation' | 'danger_scoring'
  | 'completeness' | 'contradiction' | 'geographic_prior'
  | 'presentation' | 'experience' | 'theme'
  | 'knowledge_compiler' | 'knowledge_graph' | 'knowledge_integration'
  | 'enterprise_billing' | 'enterprise_licensing' | 'enterprise_marketplace'
  | 'enterprise_customer_success' | 'enterprise_admin' | 'enterprise_white_label'
  | 'enterprise_security' | 'enterprise_multi_tenant' | 'enterprise_support'
  | 'enterprise_growth' | 'enterprise_plugin' | 'enterprise_deployment'
  | 'enterprise_analytics' | 'business_constitution'
  | 'constitutional_validation' | 'workflow_engine' | 'orchestrator'
  | 'workspace_resolution' | 'software_engineering' | 'knowledge_intelligence'
  | 'knowledge_ecosystem' | 'healthcare_community';

// â”€â”€ Universal Engine Event â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// Every engine in AMEXAN emits ONE standardized event type.
// No engine-specific logging. No patient data. No UI data.
// Only engine behavior, decisions, rules, and metadata.

export interface UniversalEngineEvent {
  eventId: string;
  engineId: string;
  engineName: string;
  engineCategory: EngineCategory;
  engineVersion: string;
  sessionId: string;
  tenantId: string;
  facilityId?: string;
  departmentId?: string;
  workflowId?: string;
  actorType: string;
  context: EngineContext;
  trigger: EngineTrigger;
  execution: EngineExecution;
  inputs: EngineIO;
  outputs: EngineIO;
  confidence?: number;
  warnings: string[];
  errors: string[];
  ruleIds: string[];
  ruleResults: RuleResult[];
  knowledgeIds: string[];
  graphNodes: string[];
  graphEdges: string[];
  factsGenerated: FactRecord[];
  recommendations: Recommendation[];
  nextEnginesActivated: string[];
  constitutionalChecks: ConstitutionalCheck[];
  timestamp: string;
  durationMs: number;
  status: 'success' | 'partial' | 'failed' | 'skipped';
}

export interface EngineContext {
  actorType: string;
  journeyId?: string;
  phaseId?: string;
  encounterType?: string;
  patientAgeGroup?: string;
  patientGender?: string;
  facilityTier?: number;
  region?: string;
  tenantTier?: string;
}

export interface EngineTrigger {
  type: 'user_action' | 'system_scheduled' | 'engine_chain' | 'external_hook' | 'manual_override';
  source: string;
  detail?: string;
}

export interface EngineExecution {
  startTime: string;
  endTime: string;
  durationMs: number;
  retryCount: number;
  cacheHit: boolean;
}

export interface EngineIO {
  keys: string[];
  types: string[];
  summary: string;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  result: unknown;
  durationMs: number;
}

export interface FactRecord {
  factId: string;
  factType: string;
  label: string;
  sourceEngine: string;
  confidence: number;
}

export interface Recommendation {
  recommendationId: string;
  type: 'differential' | 'investigation' | 'treatment' | 'red_flag' | 'referral' | 'safety_alert' | 'workflow' | 'documentation';
  label: string;
  confidence: number;
  rationale: string;
  linkedKnowledgeIds: string[];
}

export interface ConstitutionalCheck {
  checkId: string;
  checkName: string;
  passed: boolean;
  detail?: string;
}

// â”€â”€ AGOC Divisions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// Each division is defined constitutionally: its purpose, what it monitors,
// the engine events it consumes, and the recommendations it produces.

export type DivisionId =
  | 'clinical_intelligence' | 'knowledge_intelligence' | 'reasoning_intelligence'
  | 'question_intelligence' | 'documentation_intelligence' | 'workflow_intelligence'
  | 'performance_intelligence' | 'knowledge_compiler_intelligence'
  | 'protocol_intelligence' | 'customer_intelligence'
  | 'rules_engineering' | 'quality_assurance' | 'knowledge_graph_division'
  | 'postgresql_intelligence' | 'integration_division' | 'infrastructure_division'
  | 'customer_success_division' | 'business_intelligence' | 'education_division'
  | 'research_division' | 'ai_oversight' | 'global_protocol'
  | 'marketplace_division' | 'constitutional_council';

export interface DivisionDefinition {
  id: DivisionId;
  name: string;
  purpose: string;
  monitors: string[];
  consumesEngineCategories: EngineCategory[];
  produces: DivisionOutput[];
  priority: number;
}

export interface DivisionOutput {
  type: 'observation' | 'flag' | 'recommendation' | 'issue' | 'approval' | 'report';
  label: string;
  description: string;
}

export const DIVISIONS: Record<DivisionId, DivisionDefinition> = {
  clinical_intelligence: {
    id: 'clinical_intelligence', name: 'Clinical Intelligence Division',
    purpose: 'Ensure AMEXAN reasons correctly. Monitor engine behavior â€” history, questions, reasoning, diagnostics, management. Never watch patients, only engines.',
    monitors: ['History engine activation order, question coverage, reasoning paths, differential evolution, investigation timing, red flag detection, safety rule firing'],
    consumesEngineCategories: ['clinical_reasoning', 'question', 'clinical_documentation', 'danger_scoring', 'contradiction'],
    produces: [{ type: 'observation', label: 'Engine Behavior Observation', description: 'Observed deviation from expected engine activation sequence' }, { type: 'flag', label: 'Reasoning Anomaly', description: 'Engine confidence thresholds, missing question chains, premature conclusions' }, { type: 'issue', label: 'Clinical Engine Defect', description: 'Bug or missing rule in clinical reasoning pipeline' }],
    priority: 1,
  },
  knowledge_intelligence: {
    id: 'knowledge_intelligence', name: 'Knowledge Intelligence Division',
    purpose: 'Own medicine â€” diseases, symptoms, mechanisms, phenotypes, protocols, guidelines. Version everything. Never overwrite.',
    monitors: ['Knowledge graph completeness, missing diseases, broken relationships, duplicate mechanisms, unreachable phenotypes, outdated guidelines, conflicting protocols'],
    consumesEngineCategories: ['knowledge_compiler', 'knowledge_graph', 'knowledge_integration'],
    produces: [{ type: 'flag', label: 'Knowledge Gap', description: 'Missing or incomplete medical knowledge' }, { type: 'flag', label: 'Graph Anomaly', description: 'Broken relationship or unreachable node' }, { type: 'recommendation', label: 'Knowledge Update', description: 'New guideline or protocol version available' }],
    priority: 2,
  },
  reasoning_intelligence: {
    id: 'reasoning_intelligence', name: 'Reasoning Intelligence Division',
    purpose: 'Compare expected reasoning vs actual reasoning. Detect when engines diverge from intended clinical logic.',
    monitors: ['Expected reasoning paths, actual reasoning paths, differential ordering, investigation sequencing, question priority adherence, confidence calibration'],
    consumesEngineCategories: ['clinical_reasoning', 'question', 'investigation', 'danger_scoring', 'completeness'],
    produces: [{ type: 'flag', label: 'Reasoning Divergence', description: 'Actual reasoning path differs from expected' }, { type: 'recommendation', label: 'Rule Adjustment', description: 'Confidence threshold or priority requires tuning' }],
    priority: 3,
  },
  question_intelligence: {
    id: 'question_intelligence', name: 'Question Intelligence Division',
    purpose: 'Observe question coverage, fatigue, clinical usefulness. Improve question ordering and relevance.',
    monitors: ['Questions shown, skipped, repeated, never used, fatigue metrics, clinical usefulness scores, user hesitation patterns'],
    consumesEngineCategories: ['question', 'clinical_reasoning', 'completeness'],
    produces: [{ type: 'observation', label: 'Question Coverage Report', description: 'Which questions are shown/hidden across encounters' }, { type: 'flag', label: 'Question Fatigue', description: 'Users consistently ignoring or skipping specific questions' }, { type: 'recommendation', label: 'Question Reorder', description: 'Priority or placement change recommended' }],
    priority: 4,
  },
  documentation_intelligence: {
    id: 'documentation_intelligence', name: 'Documentation Intelligence Division',
    purpose: 'Read documentation. Measure grammar, flow, repetition, contradictions, language quality, narrative consistency.',
    monitors: ['Narrative grammar, sentence repetition, tense/gender correctness, timeline coherence, missing findings, robot language, flow quality'],
    consumesEngineCategories: ['clinical_documentation', 'contradiction'],
    produces: [{ type: 'observation', label: 'Narrative Quality Score', description: 'Grammar, flow, consistency metrics' }, { type: 'flag', label: 'Documentation Anomaly', description: 'Contradiction, repetition, or missing finding detected' }],
    priority: 5,
  },
  workflow_intelligence: {
    id: 'workflow_intelligence', name: 'Workflow Intelligence Division',
    purpose: 'Monitor clinical workflows â€” where clinicians stop, how long phases take, where delays occur.',
    monitors: ['Phase completion rates, phase durations, user drop-off points, navigation patterns, bottleneck detection, discharge delays, ICU hold times'],
    consumesEngineCategories: ['workflow_engine', 'experience', 'orchestrator', 'enterprise_deployment'],
    produces: [{ type: 'observation', label: 'Workflow Completion Report', description: 'Per-phase completion and duration metrics' }, { type: 'flag', label: 'Workflow Bottleneck', description: 'Phase consistently exceeding expected duration' }, { type: 'recommendation', label: 'Workflow Redesign', description: 'Suggested workflow adjustment based on telemetry' }],
    priority: 6,
  },
  performance_intelligence: {
    id: 'performance_intelligence', name: 'Performance Intelligence Division',
    purpose: 'Monitor system latency â€” Neo4j, PostgreSQL, cache, API, FHIR, imaging. Ensure responsive operation.',
    monitors: ['Engine execution duration, database query latency, API response times, cache hit rates, imaging load times, FHIR transaction speed'],
    consumesEngineCategories: ['knowledge_graph', 'enterprise_security', 'orchestrator'],
    produces: [{ type: 'flag', label: 'Performance Degradation', description: 'Engine or database latency exceeding threshold' }, { type: 'report', label: 'Performance Benchmarks', description: 'Weekly/monthly performance trend analysis' }],
    priority: 7,
  },
  knowledge_compiler_intelligence: {
    id: 'knowledge_compiler_intelligence', name: 'Knowledge Compiler Intelligence Division',
    purpose: 'Every YAML package passes through syntax, schema, relationship, knowledge, protocol, graph, simulation, and approval gates before reaching hospitals.',
    monitors: ['Package syntax validity, schema compliance, relationship completeness, clinical accuracy, protocol consistency, graph connectivity, simulation results, approval status'],
    consumesEngineCategories: ['knowledge_compiler', 'knowledge_graph', 'knowledge_integration'],
    produces: [{ type: 'approval', label: 'Package Approval', description: 'Knowledge package passed all gates' }, { type: 'flag', label: 'Package Rejection', description: 'Package failed one or more gates' }],
    priority: 8,
  },
  protocol_intelligence: {
    id: 'protocol_intelligence', name: 'Protocol Intelligence Division',
    purpose: 'Monitor WHO, Kenya, CDC, NICE, hospital, and department protocol overrides. Detect protocol conflicts.',
    monitors: ['Global protocol versions, national adaptations, hospital overrides, department overrides, conflicting protocol rules, outdated protocol warnings'],
    consumesEngineCategories: ['knowledge_compiler', 'knowledge_graph', 'clinical_reasoning'],
    produces: [{ type: 'flag', label: 'Protocol Conflict', description: 'Two active protocols provide contradictory guidance' }, { type: 'recommendation', label: 'Protocol Update', description: 'National or international guideline updated' }],
    priority: 9,
  },
  customer_intelligence: {
    id: 'customer_intelligence', name: 'Customer Intelligence Division',
    purpose: 'Observe hospital adoption, unused features, training gaps, requests, pain points, deployment quality.',
    monitors: ['Feature adoption rates, training completion, support ticket trends, deployment progress, license utilization, user activity patterns'],
    consumesEngineCategories: ['enterprise_customer_success', 'enterprise_support', 'enterprise_deployment', 'enterprise_admin'],
    produces: [{ type: 'observation', label: 'Customer Health Report', description: 'Adoption, engagement, and deployment metrics' }, { type: 'flag', label: 'At-Risk Customer', description: 'Low health score or feature adoption detected' }],
    priority: 10,
  },
  rules_engineering: {
    id: 'rules_engineering', name: 'Rules Engineering Division',
    purpose: 'Own all rules â€” visibility, activation, priority, context, ordering, safety. No duplication. No conflicts.',
    monitors: ['Rule registry completeness, rule duplication, conflicting rules, orphaned rules, unexercised rules, rule coverage across engines'],
    consumesEngineCategories: ['clinical_reasoning', 'question', 'experience', 'presentation', 'orchestrator'],
    produces: [{ type: 'flag', label: 'Rule Conflict', description: 'Two rules produce contradictory outcomes' }, { type: 'flag', label: 'Orphaned Rule', description: 'Rule references non-existent feature or engine' }, { type: 'recommendation', label: 'Rule Optimization', description: 'Redundant or unexercised rules identified' }],
    priority: 11,
  },
  quality_assurance: {
    id: 'quality_assurance', name: 'Quality Assurance Division',
    purpose: 'Medical QA â€” documentation, reasoning, protocols, question sequences, examinations, drug safety, clinical alerts every release.',
    monitors: ['Documentation quality, reasoning correctness, protocol adherence, question sequence validity, examination completeness, drug safety rule coverage, clinical alert accuracy'],
    consumesEngineCategories: ['clinical_reasoning', 'clinical_documentation', 'question', 'examination', 'investigation', 'danger_scoring', 'contradiction'],
    produces: [{ type: 'report', label: 'Clinical QA Report', description: 'Pre-release clinical quality assessment' }, { type: 'approval', label: 'Release Approval', description: 'Clinical quality gates passed' }],
    priority: 12,
  },
  knowledge_graph_division: {
    id: 'knowledge_graph_division', name: 'Knowledge Graph Division',
    purpose: 'Own the graph â€” nodes, relationships, inheritance, ontology, optimization, validation, broken link detection.',
    monitors: ['Node count, relationship density, inheritance depth, graph connectivity, orphaned nodes, duplicate entities, traversal performance, relationship validation'],
    consumesEngineCategories: ['knowledge_graph', 'knowledge_compiler'],
    produces: [{ type: 'observation', label: 'Graph Health Report', description: 'Node/edge counts, connectivity, orphan detection' }, { type: 'flag', label: 'Graph Anomaly', description: 'Broken link, duplicate node, or unreachable entity' }],
    priority: 13,
  },
  postgresql_intelligence: {
    id: 'postgresql_intelligence', name: 'PostgreSQL Intelligence Division',
    purpose: 'Own facts, events, encounters â€” storage, performance, query speed, indexing, backup, recovery, audit.',
    monitors: ['Query performance, index usage, storage utilization, backup freshness, recovery time, audit log completeness'],
    consumesEngineCategories: ['enterprise_security', 'enterprise_admin'],
    produces: [{ type: 'flag', label: 'Database Anomaly', description: 'Query degradation, storage warning, or backup failure' }, { type: 'report', label: 'Database Health Report', description: 'Weekly performance and storage report' }],
    priority: 14,
  },
  integration_division: {
    id: 'integration_division', name: 'Integration Division',
    purpose: 'Own FHIR, HL7, DICOM, PACS, LIS, insurance, payments, government, wearables, IoT, AI APIs. No one else touches integrations.',
    monitors: ['Integration health, sync latency, error rates, transformation quality, protocol compliance, connection status'],
    consumesEngineCategories: ['enterprise_security', 'orchestrator'],
    produces: [{ type: 'flag', label: 'Integration Failure', description: 'Sync failure or protocol error detected' }, { type: 'report', label: 'Integration Health Report', description: 'Per-integration health and error metrics' }],
    priority: 15,
  },
  infrastructure_division: {
    id: 'infrastructure_division', name: 'Infrastructure Division',
    purpose: 'Own cloud, servers, scaling, Redis, caching, security, encryption, monitoring, performance, disaster recovery.',
    monitors: ['Server health, scaling events, cache hit rates, security incidents, encryption status, monitoring coverage, backup integrity, disaster recovery readiness'],
    consumesEngineCategories: ['enterprise_security', 'enterprise_admin'],
    produces: [{ type: 'flag', label: 'Infrastructure Alert', description: 'Server, security, or disaster recovery issue' }, { type: 'report', label: 'Infrastructure Report', description: 'Weekly infrastructure status' }],
    priority: 16,
  },
  customer_success_division: {
    id: 'customer_success_division', name: 'Customer Success Division',
    purpose: 'Own hospitals, clinics, doctors â€” training, deployment, onboarding, migration, support, renewals.',
    monitors: ['Deployment progress, training completion, support ticket volume, renewal risk, health scores, feature adoption'],
    consumesEngineCategories: ['enterprise_customer_success', 'enterprise_support', 'enterprise_deployment'],
    produces: [{ type: 'observation', label: 'Customer Success Report', description: 'Deployment, training, and health summary' }, { type: 'flag', label: 'Renewal Risk', description: 'Subscription at risk of non-renewal' }],
    priority: 17,
  },
  business_intelligence: {
    id: 'business_intelligence', name: 'Business Intelligence Division',
    purpose: 'See revenue, subscriptions, usage, growth, retention, license utilization, unused features, predictions.',
    monitors: ['MRR/ARR trends, subscription distribution, feature usage patterns, growth rate, retention rate, license utilization, segment breakdown'],
    consumesEngineCategories: ['enterprise_admin', 'enterprise_billing', 'enterprise_growth'],
    produces: [{ type: 'report', label: 'Business Intelligence Report', description: 'Monthly revenue, growth, and utilization report' }, { type: 'recommendation', label: 'Growth Opportunity', description: 'Upsell, cross-sell, or expansion identified' }],
    priority: 18,
  },
  education_division: {
    id: 'education_division', name: 'Education Division',
    purpose: 'Monitor learning, case reviews, CPD, student progress, teaching hospitals, AI tutor, clinical simulations.',
    monitors: ['Learning path completion, case review frequency, CPD credit accrual, student assessment scores, simulation engagement, AI tutor interaction quality'],
    consumesEngineCategories: ['knowledge_integration', 'clinical_reasoning'],
    produces: [{ type: 'observation', label: 'Education Report', description: 'Learning activity and completion metrics' }, { type: 'recommendation', label: 'Learning Gap', description: 'Knowledge area with low engagement or completion' }],
    priority: 19,
  },
  research_division: {
    id: 'research_division', name: 'Research Division',
    purpose: 'Create datasets, registries, studies, analytics, outcome research, clinical trials, quality improvement.',
    monitors: ['Cohort availability, registry completeness, study enrollment, outcome data quality, research output, quality improvement initiative effectiveness'],
    consumesEngineCategories: ['knowledge_integration', 'clinical_reasoning', 'enterprise_analytics'],
    produces: [{ type: 'report', label: 'Research Report', description: 'Cohort, registry, and study metrics' }, { type: 'recommendation', label: 'Research Opportunity', description: 'Trend or cohort suitable for study' }],
    priority: 20,
  },
  ai_oversight: {
    id: 'ai_oversight', name: 'AI Oversight Division',
    purpose: 'Never let AI replace medicine. Check hallucinations, unsafe advice, bias, guideline conflicts, prompt quality, reasoning quality, confidence calibration.',
    monitors: ['AI suggestion accuracy, hallucination rate, safety check coverage, bias detection, guideline adherence, prompt consistency, confidence calibration'],
    consumesEngineCategories: ['clinical_reasoning', 'knowledge_integration', 'question'],
    produces: [{ type: 'flag', label: 'AI Safety Alert', description: 'Unsafe or hallucinated AI output detected' }, { type: 'report', label: 'AI Quality Report', description: 'Accuracy, bias, and safety metrics' }],
    priority: 21,
  },
  global_protocol: {
    id: 'global_protocol', name: 'Global Protocol Division',
    purpose: 'Version protocols per country â€” WHO, Kenya, NICE, NHS, CDC, South Africa, India, UAE. Hospital-specific adaptations.',
    monitors: ['Protocol versions per country, national adaptations, hospital overrides, protocol conflicts, protocol recency, guideline update frequency'],
    consumesEngineCategories: ['knowledge_compiler', 'knowledge_graph'],
    produces: [{ type: 'flag', label: 'Protocol Outdated', description: 'Active protocol version superseded by newer guideline' }, { type: 'recommendation', label: 'Protocol Migration', description: 'Protocol update recommended for specific region' }],
    priority: 22,
  },
  marketplace_division: {
    id: 'marketplace_division', name: 'Marketplace Division',
    purpose: 'Own plugins â€” verify quality, security, clinical safety before publication.',
    monitors: ['Plugin quality scores, security review status, clinical safety validation, download trends, developer compliance, rating trends'],
    consumesEngineCategories: ['enterprise_plugin', 'enterprise_marketplace'],
    produces: [{ type: 'approval', label: 'Plugin Approval', description: 'Plugin passed quality, security, and clinical safety gates' }, { type: 'flag', label: 'Plugin Risk', description: 'Plugin with declining quality or safety metrics' }],
    priority: 23,
  },
  constitutional_council: {
    id: 'constitutional_council', name: 'Constitutional Council',
    purpose: 'Highest authority. Nothing changes without constitutional review. Every proposed change must answer: does it break Book I? Does it break reasoning? Does it violate graph relationships? Is it backward compatible?',
    monitors: ['All proposed engine changes, rule changes, knowledge updates, protocol changes — evaluated against all constitutional books'],
    consumesEngineCategories: ['clinical_reasoning', 'knowledge_compiler', 'knowledge_graph', 'experience', 'presentation', 'orchestrator', 'business_constitution'],
    produces: [{ type: 'approval', label: 'Constitutional Approval', description: 'Change passed constitutional review' }, { type: 'flag', label: 'Constitutional Violation', description: 'Change violates one or more constitutional books' }],
    priority: 0,
  },
};

// â”€â”€ Operating Intelligence Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// The OI Database stores these â€” separate from clinical and business databases.

export type OIEntityType =
  | 'engine_event' | 'rule_activation' | 'workflow_event'
  | 'performance_sample' | 'knowledge_event' | 'integration_event'
  | 'security_event' | 'business_event' | 'recommendation'
  | 'quality_score' | 'hospital_metric' | 'engine_health'
  | 'knowledge_version' | 'protocol_version' | 'release_note'
  | 'benchmark';

export interface OIStoreConfig {
  maxEventsPerEngine: number;
  retentionDays: number;
  enableAggregation: boolean;
  enableAnomalyDetection: boolean;
}

export const DEFAULT_OI_CONFIG: OIStoreConfig = {
  maxEventsPerEngine: 100000,
  retentionDays: 365,
  enableAggregation: true,
  enableAnomalyDetection: true,
};

// â”€â”€ Registry Entry Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface EngineRegistration {
  engineId: string;
  engineName: string;
  category: EngineCategory;
  version: string;
  description: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  constitutionalLaws: number[];
  registeredAt: string;
  lastEventAt?: string;
  status: 'active' | 'deprecated' | 'retired';
}

export interface RuleRegistration {
  ruleId: string;
  ruleName: string;
  engineId: string;
category: 'visibility' | 'activation' | 'priority' | 'context' | 'ordering' | 'safety' | 'contraindication' | 'security' | 'architecture' | 'ownership' | 'quality' | 'ui' | 'operations' | 'data' | 'workflow' | 'reporting' | 'governance' | 'privacy';
  description: string;
  conditions: string;
  effect: string;
  version: string;
  status: 'active' | 'deprecated' | 'superseded';
  supersededBy?: string;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface WorkflowRegistration {
  workflowId: string;
  workflowName: string;
  journeyId: string;
  expectedPhases: string[];
  expectedDurationPerPhase: Record<string, number>;
  expectedTotalDuration: number;
  actorTypes: string[];
  version: string;
  status: 'active' | 'deprecated';
}

export interface EngineHealthRecord {
  engineId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDurationMs: number;
  p95DurationMs: number;
  errorRate: number;
  lastExecutionAt: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  warnings: string[];
  lastCheckedAt: string;
}

// â”€â”€ Expected vs Actual Reasoning â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ExpectedReasoningPath {
  pathId: string;
  name: string;
  description: string;
  triggeringSymptoms: string[];
  expectedSequence: ExpectedReasoningStep[];
}

export interface ExpectedReasoningStep {
  order: number;
  engineId: string;
  action: string;
  expectedOutput: string;
  maxDurationMs: number;
  required: boolean;
}

// â”€â”€ Constitutional Review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ConstitutionalReviewRequest {
  requestId: string;
  changeType: 'engine_update' | 'rule_change' | 'knowledge_update' | 'protocol_change' | 'workflow_change' | 'constitutional_amendment';
  description: string;
  affectedBooks: number[];
  affectedEngines: string[];
  affectedRules: string[];
  affectedKnowledge: string[];
  simulationResults?: unknown;
  regressionResults?: unknown;
  submittedBy: string;
  submittedAt: string;
  status: 'pending_review' | 'clinical_review' | 'knowledge_review' | 'constitution_review' | 'release_candidate' | 'piloting' | 'approved' | 'rejected';
  reviews: ConstitutionalReview[];
}

export interface ConstitutionalReview {
  reviewerId: string;
  reviewerRole: string;
  divisionId: DivisionId;
  verdict: 'approve' | 'reject' | 'changes_requested';
  comments: string;
  reviewedAt: string;
}

// â”€â”€ Division Observation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DivisionObservation {
  id: string;
  divisionId: DivisionId;
  type: DivisionOutput['type'];
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  sourceEventIds: string[];
  recommendations: string[];
  detectedAt: string;
  resolvedAt?: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

export function getDivision(id: DivisionId): DivisionDefinition {
  return DIVISIONS[id];
}

export function getAllDivisions(): DivisionDefinition[] {
  return Object.values(DIVISIONS).sort((a, b) => a.priority - b.priority);
}

export function getEngineCategoryLabel(cat: EngineCategory): string {
  const labels: Record<EngineCategory, string> = {
    clinical_reasoning: 'Clinical Reasoning', clinical_scoring: 'Clinical Scoring',
    clinical_documentation: 'Clinical Documentation', question: 'Question Engine',
    examination: 'Examination Engine', investigation: 'Investigation Engine',
    danger_scoring: 'Danger Scoring', completeness: 'Completeness Engine',
    contradiction: 'Contradiction Engine', geographic_prior: 'Geographic Priors',
    presentation: 'Presentation Engine', experience: 'Experience Engine', theme: 'Theme Engine',
    knowledge_compiler: 'Knowledge Compiler', knowledge_graph: 'Knowledge Graph',
    knowledge_integration: 'Knowledge Integration',
    enterprise_billing: 'Billing Engine', enterprise_licensing: 'Licensing Engine',
    enterprise_marketplace: 'Marketplace Engine', enterprise_customer_success: 'Customer Success',
    enterprise_admin: 'Admin Dashboard', enterprise_white_label: 'White Label',
    enterprise_security: 'Security Engine', enterprise_multi_tenant: 'Multi-Tenant',
    enterprise_support: 'Support Engine', enterprise_growth: 'Growth Engine',
    enterprise_plugin: 'Plugin Engine', enterprise_deployment: 'Deployment Engine',
    enterprise_analytics: 'Analytics Engine', business_constitution: 'Business Constitution',
    constitutional_validation: 'Constitutional Validation', workflow_engine: 'Workflow Engine',
    orchestrator: 'Orchestrator',
    workspace_resolution: 'Workspace Resolution', software_engineering: 'Software Engineering',
    knowledge_intelligence: 'Knowledge Intelligence', knowledge_ecosystem: 'Knowledge Ecosystem',
    healthcare_community: 'Healthcare Community',
  };
  return labels[cat] || cat;
}
