// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ENGINE REGISTRATION — Book XXIV
// Registers every engine in the system into the Engine Registry.
// No imports from engine implementations — only constitutional metadata.
// ═══════════════════════════════════════════════════════════════════════════════

import { engineRegistry } from './engine-registry';
import { ruleRegistry } from './rule-registry';
import { knowledgeRegistry } from './knowledge-registry';
import { workflowRegistry } from './workflow-registry';

export function registerAllEngines(): void {
  engineRegistry.registerBatch([
    // ── Clinical Reasoning ──────────────────────────────────────────────────────
    { engineId: 'encounter_orchestrator', engineName: 'Encounter Orchestrator', category: 'orchestrator', version: '2.0.0', description: '8-State Clinical Interview OS — manages encounter lifecycle from registration through discharge', inputs: ['EncounterState', 'Answer'], outputs: ['AmexanSession', 'NextQuestion', 'HpiNarrative'], dependencies: ['question_engine', 'bayesian_engine', 'narrative_engine'], constitutionalLaws: [1, 2, 3, 4], status: 'active' },
    { engineId: 'bayesian_engine', engineName: 'Bayesian Reasoning Engine', category: 'clinical_reasoning', version: '1.0.0', description: 'Computes differential probability updates from clinical findings using naive Bayes', inputs: ['AnswerPolarity', 'FeatureId'], outputs: ['DdxUpdateResult', 'CandidateDiseaseState'], dependencies: ['knowledge_graph'], constitutionalLaws: [1, 2, 3], status: 'active' },
    { engineId: 'question_engine', engineName: 'Question Engine', category: 'question', version: '1.0.0', description: 'Selects next clinical question based on information gain, safety priority, and clinical round', inputs: ['EncounterState', 'DdxUpdateResult'], outputs: ['NextQuestion'], dependencies: ['bayesian_engine', 'clinical_reasoning_engine'], constitutionalLaws: [1, 2, 3, 4], status: 'active' },
    { engineId: 'clinical_reasoning_engine', engineName: 'Clinical Reasoning Engine', category: 'clinical_reasoning', version: '1.0.0', description: 'Filters differentials by biodata, detects symptom constellations, provides reasoning path', inputs: ['EncounterState', 'DdxUpdateResult'], outputs: ['ClinicalReasoningPath', 'FilteredDifferential', 'SymptomCluster'], dependencies: ['knowledge_graph', 'geographic_priors'], constitutionalLaws: [1, 2, 3], status: 'active' },
    { engineId: 'narrative_engine', engineName: 'Narrative Engine', category: 'clinical_documentation', version: '1.0.0', description: 'Generates HPI narrative from structured clinical data using constitutional templates', inputs: ['EncounterState', 'Answer[]'], outputs: ['HpiNarrative'], dependencies: [], constitutionalLaws: [1, 3, 4], status: 'active' },
    { engineId: 'contradiction_engine', engineName: 'Contradiction Engine', category: 'contradiction', version: '1.0.0', description: 'Detects temporal, anatomical, logical, and severity contradictions in clinical data', inputs: ['EncounterState'], outputs: ['Contradiction[]'], dependencies: [], constitutionalLaws: [1, 2, 3], status: 'active' },
    { engineId: 'clinical_scoring_engine', engineName: 'Clinical Scoring Engine', category: 'clinical_scoring', version: '1.0.0', description: 'Computes clinical scores (CURB-65, Wells, PERC, etc.) from available data', inputs: ['EncounterState', 'FeatureId'], outputs: ['ScoreComputationResult'], dependencies: [], constitutionalLaws: [1, 3], status: 'active' },
    { engineId: 'completeness_engine', engineName: 'Completeness Engine', category: 'completeness', version: '1.0.0', description: 'Measures history completeness across 14 clinical domains', inputs: ['EncounterState'], outputs: ['DomainCompleteness'], dependencies: [], constitutionalLaws: [1, 3], status: 'active' },
    { engineId: 'danger_scoring_engine', engineName: 'Danger Scoring Engine', category: 'danger_scoring', version: '1.0.0', description: 'Ranks differentials by danger level and identifies must-not-miss diagnoses', inputs: ['EncounterState', 'DdxUpdateResult'], outputs: ['DangerRankedDisease[]'], dependencies: ['bayesian_engine', 'knowledge_graph'], constitutionalLaws: [1, 2, 3], status: 'active' },
    { engineId: 'examination_engine', engineName: 'Examination Engine', category: 'examination', version: '1.0.0', description: 'Builds examination plans based on differentials — region-based and systemic signs', inputs: ['FilteredDifferential[]'], outputs: ['ExaminationPlan', 'ExamSign'], dependencies: ['clinical_reasoning_engine', 'knowledge_graph'], constitutionalLaws: [1, 3, 4], status: 'active' },
    { engineId: 'investigation_engine', engineName: 'Investigation Engine', category: 'investigation', version: '1.0.0', description: 'Suggests investigations based on differentials with facility tier awareness', inputs: ['FilteredDifferential[]', 'FacilityTier'], outputs: ['InvestigationPlan', 'SuggestedInvestigation'], dependencies: ['clinical_reasoning_engine', 'knowledge_graph'], constitutionalLaws: [1, 3, 4], status: 'active' },
    { engineId: 'geographic_priors', engineName: 'Geographic Priors Engine', category: 'geographic_prior', version: '1.0.0', description: 'Adjusts disease priors based on geographic region and endemicity', inputs: ['Region', 'DiseaseId'], outputs: ['number'], dependencies: [], constitutionalLaws: [1, 3], status: 'active' },
    { engineId: 'priority_scorer', engineName: 'Priority Scorer', category: 'clinical_scoring', version: '1.0.0', description: 'Computes composite priority scores for questions: diagnostic + safety + documentation value', inputs: ['FeatureId', 'EncounterState'], outputs: ['PriorityScore'], dependencies: [], constitutionalLaws: [1, 3], status: 'active' },

    // ── Presentation ────────────────────────────────────────────────────────────
    { engineId: 'presentation_engine', engineName: 'Presentation Engine', category: 'presentation', version: '1.0.0', description: 'Converts EngineState into declarative PresentationScreen with sections, cards, navigation, warnings', inputs: ['EngineState'], outputs: ['PresentationOutput', 'PresentationScreen'], dependencies: ['experience_engine'], constitutionalLaws: [1, 4], status: 'active' },
    { engineId: 'experience_engine', engineName: 'Experience Engine', category: 'experience', version: '1.0.0', description: 'Per-actor journey routing — same reasoning, different experience per role', inputs: ['ExperienceRequest'], outputs: ['ExperienceOutput', 'RoutingDecision'], dependencies: ['constitution_book_ii'], constitutionalLaws: [1, 4], status: 'active' },
    { engineId: 'theme_engine', engineName: 'Theme Engine', category: 'theme', version: '1.0.0', description: 'Role-specific color themes, branding, CSS variable generation', inputs: ['BrandConfig', 'ActorId'], outputs: ['ThemeContext'], dependencies: [], constitutionalLaws: [4], status: 'active' },

    // ── Knowledge ───────────────────────────────────────────────────────────────
    { engineId: 'knowledge_yaml_parser', engineName: 'Knowledge YAML Parser', category: 'knowledge_compiler', version: '1.0.0', description: 'Parses YAML medical knowledge packages into typed KnowledgePackage objects', inputs: ['string (YAML)'], outputs: ['KnowledgePackage'], dependencies: [], constitutionalLaws: [3, 4], status: 'active' },
    { engineId: 'knowledge_package_registry', engineName: 'Knowledge Package Registry', category: 'knowledge_compiler', version: '1.0.0', description: 'Multi-index registry for searching knowledge by ID, disease, symptom, object type, free text', inputs: ['KnowledgePackage'], outputs: ['CompilationResult'], dependencies: ['knowledge_yaml_parser'], constitutionalLaws: [3, 4], status: 'active' },
    { engineId: 'knowledge_graph', engineName: 'Knowledge Graph', category: 'knowledge_graph', version: '1.0.0', description: 'Queryable graph with 3-path traversal for differentials, investigations, treatments, complications', inputs: ['KnowledgePackage[]'], outputs: ['GraphNode[]', 'KnowledgePath'], dependencies: ['knowledge_package_registry'], constitutionalLaws: [3, 4], status: 'active' },
    { engineId: 'knowledge_integration', engineName: 'Knowledge Integration', category: 'knowledge_integration', version: '1.0.0', description: 'Returns full clinical context: differentials, red flags, investigations, treatments, teaching from symptoms+diagnoses', inputs: ['string[] (symptoms)', 'string[] (diagnoses)'], outputs: ['FullContext'], dependencies: ['knowledge_graph'], constitutionalLaws: [3, 4], status: 'active' },

    // ── Enterprise ──────────────────────────────────────────────────────────────
    { engineId: 'business_constitution', engineName: 'Business Constitution', category: 'business_constitution', version: '1.0.0', description: 'Business Constitution — customers, products, plans, pricing, regions, taxes, discounts', inputs: ['PlanId', 'ProductId[]', 'RegionCode'], outputs: ['PriceQuote'], dependencies: [], constitutionalLaws: [4], status: 'active' },
    { engineId: 'licensing_engine', engineName: 'Licensing Engine', category: 'enterprise_licensing', version: '1.0.0', description: 'License generation, validation, module access control, API metering', inputs: ['Subscription'], outputs: ['License', 'LicenseValidation'], dependencies: ['business_constitution'], constitutionalLaws: [4], status: 'active' },
    { engineId: 'billing_engine', engineName: 'Billing Engine', category: 'enterprise_billing', version: '1.0.0', description: 'Invoice creation, subscription lifecycle, MRR/ARR estimation', inputs: ['Subscription', 'Date'], outputs: ['Invoice', 'Subscription'], dependencies: ['business_constitution'], constitutionalLaws: [4], status: 'active' },
    { engineId: 'marketplace_engine', engineName: 'Marketplace Engine', category: 'enterprise_marketplace', version: '1.0.0', description: 'Extension registry, search, install/uninstall/config/usage tracking, catalog stats', inputs: ['MarketplaceExtension'], outputs: ['InstalledExtension'], dependencies: [], constitutionalLaws: [4], status: 'active' },
    { engineId: 'customer_success_engine', engineName: 'Customer Success Engine', category: 'enterprise_customer_success', version: '1.0.0', description: 'Health scores, feature adoption, deployment progress, churn prediction', inputs: ['Organization', 'Subscription'], outputs: ['CustomerHealthScore', 'FeatureAdoption[]', 'DeploymentProgress'], dependencies: ['business_constitution'], constitutionalLaws: [4], status: 'active' },
    { engineId: 'admin_dashboard_engine', engineName: 'Admin Dashboard Engine', category: 'enterprise_admin', version: '1.0.0', description: 'Sales, financial, infrastructure, growth dashboards, at-risk customer identification', inputs: ['Subscription[]', 'Organization[]'], outputs: ['SalesDashboard', 'FinancialDashboard', 'InfrastructureDashboard', 'GrowthMetrics'], dependencies: [], constitutionalLaws: [4], status: 'active' },
    { engineId: 'white_label_engine', engineName: 'White Label Engine', category: 'enterprise_white_label', version: '1.0.0', description: 'Tenant branding, CSS variables, domain config, language packs, locale formatting', inputs: ['TenantSettings'], outputs: ['BrandingPackage', 'Record<string,string>'], dependencies: [], constitutionalLaws: [4], status: 'active' },
    { engineId: 'security_engine', engineName: 'Security & Compliance Engine', category: 'enterprise_security', version: '1.0.0', description: 'Audit logging, enterprise RBAC, compliance frameworks (HIPAA/GDPR/Kenya), security policies', inputs: ['AuditLogEntry'], outputs: ['AuditLogEntry', 'ComplianceReport'], dependencies: ['business_constitution'], constitutionalLaws: [4], status: 'active' },
    { engineId: 'multi_tenant_engine', engineName: 'Multi-Tenant Engine', category: 'enterprise_multi_tenant', version: '1.0.0', description: 'Tenant provisioning, domain routing, isolation models, resource quotas', inputs: ['Organization', 'RegionCode'], outputs: ['Tenant', 'TenantResourceQuota'], dependencies: ['business_constitution'], constitutionalLaws: [4], status: 'active' },
    { engineId: 'support_engine', engineName: 'Support Engine', category: 'enterprise_support', version: '1.0.0', description: 'Ticket system, SLA definitions, knowledge base, escalation management', inputs: ['SupportTicket'], outputs: ['SupportTicket', 'SLADefinition'], dependencies: ['business_constitution'], constitutionalLaws: [4], status: 'active' },
    { engineId: 'growth_engine', engineName: 'Growth & Partner Engine', category: 'enterprise_growth', version: '1.0.0', description: 'Partner tiers, commissions, referral pipeline, partner metrics dashboard', inputs: ['Partner'], outputs: ['Partner', 'PartnerMetrics'], dependencies: [], constitutionalLaws: [4], status: 'active' },
    { engineId: 'plugin_engine', engineName: 'Plugin Engine', category: 'enterprise_plugin', version: '1.0.0', description: 'Developer registration, plugin manifest management, versioning, marketplace stats', inputs: ['PluginManifest'], outputs: ['PluginManifest', 'DeveloperRegistration'], dependencies: [], constitutionalLaws: [4], status: 'active' },
    { engineId: 'deployment_engine', engineName: 'Deployment Engine', category: 'enterprise_deployment', version: '1.0.0', description: 'Implementation project workflow: 8 phases with tasks, blockers, milestones, health tracking', inputs: ['Organization', 'Facility[]'], outputs: ['ImplementationProject'], dependencies: ['business_constitution'], constitutionalLaws: [4], status: 'active' },
    { engineId: 'analytics_engine', engineName: 'Analytics Engine', category: 'enterprise_analytics', version: '1.0.0', description: 'Cross-customer medical analytics, disease trends, outbreak detection, benchmarking', inputs: ['DiseaseTrend', 'OutbreakAlert'], outputs: ['AnalyticsReport', 'OutbreakAlert[]'], dependencies: [], constitutionalLaws: [4], status: 'active' },

    // ── AGOC Infrastructure ────────────────────────────────────────────────────
    { engineId: 'telemetry_broker', engineName: 'Telemetry Broker', category: 'constitutional_validation', version: '1.0.0', description: 'Universal Engine Event bus — engines emit without knowing AGOC exists', inputs: ['UniversalEngineEvent'], outputs: ['UniversalEngineEvent'], dependencies: [], constitutionalLaws: [1, 2, 3, 4, 5], status: 'active' },
    { engineId: 'oi_database', engineName: 'Operating Intelligence Database', category: 'constitutional_validation', version: '1.0.0', description: 'Separate database for engine events, rule activations, performance, health — no patient data', inputs: ['UniversalEngineEvent'], outputs: ['OIStore'], dependencies: ['telemetry_broker'], constitutionalLaws: [1, 2, 4], status: 'active' },
    { engineId: 'engine_registry', engineName: 'Engine Registry', category: 'constitutional_validation', version: '1.0.0', description: 'Constitutional catalog of every engine: versions, inputs, outputs, dependencies', inputs: ['EngineRegistration'], outputs: ['EngineRegistration[]'], dependencies: [], constitutionalLaws: [3, 4], status: 'active' },
    { engineId: 'rule_registry', engineName: 'Rule Registry', category: 'constitutional_validation', version: '1.0.0', description: 'Central catalog of every rule: visibility, activation, priority, safety, contraindication', inputs: ['RuleRegistration'], outputs: ['RuleRegistration[]'], dependencies: [], constitutionalLaws: [3, 4], status: 'active' },
    { engineId: 'knowledge_registry_agoc', engineName: 'Knowledge Registry (AGOC)', category: 'constitutional_validation', version: '1.0.0', description: 'Versioned knowledge package tracking with approval gates and supersession', inputs: ['KnowledgePackageRecord'], outputs: ['KnowledgePackageRecord[]'], dependencies: ['knowledge_package_registry'], constitutionalLaws: [3, 4], status: 'active' },
    { engineId: 'workflow_registry', engineName: 'Workflow Registry', category: 'constitutional_validation', version: '1.0.0', description: 'Catalog of all workflows with expected phases, durations, analytics, bottleneck detection', inputs: ['WorkflowRegistration'], outputs: ['WorkflowAnalytics'], dependencies: [], constitutionalLaws: [3, 4], status: 'active' },
    { engineId: 'engine_health_registry', engineName: 'Engine Health Registry', category: 'constitutional_validation', version: '1.0.0', description: 'Health tracking: execution stats, error rates, latency, status monitoring, alerts', inputs: ['EngineExecution'], outputs: ['EngineHealthRecord', 'EngineHealthAlert'], dependencies: ['oi_database'], constitutionalLaws: [1, 2, 4], status: 'active' },
  ]);
}

export function registerAllWorkflows(): void {
  workflowRegistry.registerBatch([
    {
      workflowId: 'clinical_care_default', workflowName: 'Clinical Care — Default', journeyId: 'clinical_care',
      expectedPhases: ['registration', 'triage', 'history', 'examination', 'investigation', 'diagnosis', 'management', 'discharge'],
      expectedDurationPerPhase: { registration: 120000, triage: 180000, history: 600000, examination: 300000, investigation: 300000, diagnosis: 120000, management: 240000, discharge: 180000 },
      expectedTotalDuration: 2040000, actorTypes: ['doctor', 'resident', 'consultant', 'nurse'], version: '1.0.0', status: 'active',
    },
    {
      workflowId: 'nursing_care_default', workflowName: 'Nursing Care — Default', journeyId: 'nursing_care',
      expectedPhases: ['shift_handover', 'patient_round', 'medication_admin', 'vital_signs', 'fluid_chart', 'care_plan', 'documentation', 'handover'],
      expectedDurationPerPhase: { shift_handover: 600000, patient_round: 1200000, medication_admin: 600000, vital_signs: 180000, fluid_chart: 120000, care_plan: 180000, documentation: 300000, handover: 600000 },
      expectedTotalDuration: 3780000, actorTypes: ['nurse', 'midwife', 'student'], version: '1.0.0', status: 'active',
    },
    {
      workflowId: 'patient_portal_default', workflowName: 'Patient Portal', journeyId: 'patient_portal',
      expectedPhases: ['dashboard', 'appointments', 'medications', 'results', 'billing', 'messages', 'education'],
      expectedDurationPerPhase: { dashboard: 60000, appointments: 120000, medications: 60000, results: 120000, billing: 120000, messages: 180000, education: 300000 },
      expectedTotalDuration: 960000, actorTypes: ['patient', 'family_member'], version: '1.0.0', status: 'active',
    },
    {
      workflowId: 'telemedicine_default', workflowName: 'Telemedicine Encounter', journeyId: 'telemedicine',
      expectedPhases: ['waiting_room', 'video_consult', 'history', 'examination', 'prescription', 'follow_up', 'documentation'],
      expectedDurationPerPhase: { waiting_room: 120000, video_consult: 900000, history: 300000, examination: 120000, prescription: 120000, follow_up: 60000, documentation: 240000 },
      expectedTotalDuration: 1860000, actorTypes: ['doctor', 'patient'], version: '1.0.0', status: 'active',
    },
    {
      workflowId: 'pharmacy_default', workflowName: 'Pharmacy Workflow', journeyId: 'pharmacy',
      expectedPhases: ['prescription_review', 'dispensing', 'counselling', 'documentation', 'inventory_check'],
      expectedDurationPerPhase: { prescription_review: 120000, dispensing: 180000, counselling: 300000, documentation: 120000, inventory_check: 60000 },
      expectedTotalDuration: 780000, actorTypes: ['pharmacist'], version: '1.0.0', status: 'active',
    },
    {
      workflowId: 'laboratory_default', workflowName: 'Laboratory Workflow', journeyId: 'laboratory',
      expectedPhases: ['order_receipt', 'sample_collection', 'sample_processing', 'analysis', 'validation', 'result_reporting'],
      expectedDurationPerPhase: { order_receipt: 60000, sample_collection: 300000, sample_processing: 600000, analysis: 1200000, validation: 120000, result_reporting: 60000 },
      expectedTotalDuration: 2340000, actorTypes: ['lab_technician'], version: '1.0.0', status: 'active',
    },
    {
      workflowId: 'radiology_default', workflowName: 'Radiology Workflow', journeyId: 'radiology',
      expectedPhases: ['order_review', 'scheduling', 'imaging', 'interpretation', 'reporting', 'consultation'],
      expectedDurationPerPhase: { order_review: 60000, scheduling: 120000, imaging: 600000, interpretation: 600000, reporting: 300000, consultation: 180000 },
      expectedTotalDuration: 1860000, actorTypes: ['radiologist'], version: '1.0.0', status: 'active',
    },
    {
      workflowId: 'learning_default', workflowName: 'Clinical Learning Workflow', journeyId: 'learning',
      expectedPhases: ['case_assignment', 'history_review', 'differential_formulation', 'reasoning_comparison', 'feedback', 'knowledge_review', 'quiz'],
      expectedDurationPerPhase: { case_assignment: 30000, history_review: 300000, differential_formulation: 300000, reasoning_comparison: 180000, feedback: 300000, knowledge_review: 600000, quiz: 300000 },
      expectedTotalDuration: 2010000, actorTypes: ['student', 'educator'], version: '1.0.0', status: 'active',
    },
  ]);
}

export function registerAllRules(): void {
  ruleRegistry.registerBatch([
    // Safety rules
    { ruleId: 'R_SAF_001', ruleName: 'Pregnancy ACE Inhibitor Contraindication', engineId: 'clinical_reasoning_engine', category: 'safety', description: 'Block ACE inhibitors in pregnant patients', conditions: 'patient.gender === female && patient.ageGroup === adult && encounter.pregnancy === true && featureId === ACE_INHIBITOR', effect: 'visibility = false; warning = "Contraindicated in pregnancy"', version: '1.0.0', status: 'active' },
    { ruleId: 'R_SAF_002', ruleName: 'Pediatric Aspirin Contraindication', engineId: 'clinical_reasoning_engine', category: 'safety', description: 'Block aspirin in pediatric patients due to Reye syndrome risk', conditions: 'patient.ageGroup === child && featureId === ASPIRIN', effect: 'visibility = false; warning = "Contraindicated in children (Reye syndrome risk)"', version: '1.0.0', status: 'active' },
    { ruleId: 'R_SAF_003', ruleName: 'Red Flag Critical Prioritization', engineId: 'question_engine', category: 'priority', description: 'Red flag questions always get priority 1 regardless of information gain', conditions: 'feature.tags includes "red_flag"', effect: 'priority = 1', version: '1.0.0', status: 'active' },
    { ruleId: 'R_SAF_004', ruleName: 'Danger Score Immediate Action', engineId: 'danger_scoring_engine', category: 'safety', description: 'Any disease with dangerScore > 90 triggers immediate action alert', conditions: 'candidate.dangerScore > 90', effect: 'alert = "immediate"; actionMessage = "URGENT: Immediate clinical evaluation required"', version: '1.0.0', status: 'active' },
    { ruleId: 'R_SAF_005', ruleName: 'Must-Not-Miss Never Hidden', engineId: 'presentation_engine', category: 'visibility', description: 'Must-not-miss diagnoses cannot be hidden from the differential list', conditions: 'card.type === differential_list && disease.tags includes "must_not_miss"', effect: 'visible = true; enabled = true', version: '1.0.0', status: 'active' },
    { ruleId: 'R_SAF_006', ruleName: 'Investigation Urgency Override', engineId: 'investigation_engine', category: 'priority', description: 'Immediate investigations always appear before routine ones', conditions: 'investigation.urgency === immediate', effect: 'priority = 1', version: '1.0.0', status: 'active' },
    
    // Visibility rules
    { ruleId: 'R_VIS_001', ruleName: 'Gender-Specific Examination Visibility', engineId: 'examination_engine', category: 'visibility', description: 'Show gender-specific exams only for matching patient gender', conditions: 'exam.genderRestricted && exam.genderRestricted !== patient.gender', effect: 'visible = false', version: '1.0.0', status: 'active' },
    { ruleId: 'R_VIS_002', ruleName: 'Pediatric Examination Modification', engineId: 'examination_engine', category: 'context', description: 'Modify examination plan for pediatric patients', conditions: 'patient.ageGroup === child || patient.ageGroup === infant', effect: 'include pediatric-specific signs; exclude invasive exams', version: '1.0.0', status: 'active' },
    { ruleId: 'R_VIS_003', ruleName: 'Facility Tier Investigation Filter', engineId: 'investigation_engine', category: 'context', description: 'Only show investigations available at the facility\'s tier', conditions: 'investigation.tier > facility.tier', effect: 'visible = false; note = "Refer to higher facility"', version: '1.0.0', status: 'active' },
    
    // Activation rules
    { ruleId: 'R_ACT_001', ruleName: 'Chest Pain Activates Cardiac Workflow', engineId: 'encounter_orchestrator', category: 'activation', description: 'Chest pain chief complaint activates cardiac reasoning highway', conditions: 'chiefComplaint includes "chest" && chiefComplaint includes "pain"', effect: 'activateHighway("cardiac"); setConvergencePhase("acs_rule_out")', version: '1.0.0', status: 'active' },
    { ruleId: 'R_ACT_002', ruleName: 'Fever Activates Infection Workflow', engineId: 'encounter_orchestrator', category: 'activation', description: 'Fever as presenting symptom activates infection highway', conditions: 'chiefComplaint includes "fever"', effect: 'activateHighway("infection")', version: '1.0.0', status: 'active' },
    { ruleId: 'R_ACT_003', ruleName: 'Trauma Activates Trauma Workflow', engineId: 'encounter_orchestrator', category: 'activation', description: 'Trauma chief complaint activates trauma highway with primary/secondary survey', conditions: 'chiefComplaint includes "trauma" || chiefComplaint includes "injury" || chiefComplaint includes "accident"', effect: 'activateHighway("trauma"); setPhase("primary_survey")', version: '1.0.0', status: 'active' },
    
    // Ordering rules
    { ruleId: 'R_ORD_001', ruleName: 'History Before Examination', engineId: 'encounter_orchestrator', category: 'ordering', description: 'History questions must precede examination in clinical sequence', conditions: 'currentPhase === examination && any(historyCompleteness.domains, d => d < 0.5)', effect: 'block = true; redirect = "Complete history first"', version: '1.0.0', status: 'active' },
    { ruleId: 'R_ORD_002', ruleName: 'Examination Before Investigation', engineId: 'encounter_orchestrator', category: 'ordering', description: 'Physical examination should precede investigations in non-emergency', conditions: 'currentPhase === investigation && encounter.isEmergency === false && examinationCompletion < 0.3', effect: 'warning = "Consider completing examination first"; softBlock = true', version: '1.0.0', status: 'active' },
    { ruleId: 'R_ORD_003', ruleName: 'Red Flags Before Routine Questions', engineId: 'question_engine', category: 'ordering', description: 'Red flag questions must be asked before routine clinical questions', conditions: 'hasOutstandingRedFlags() && current priority === 3', effect: 'override = true; inject red flag questions at priority 1', version: '1.0.0', status: 'active' },
    { ruleId: 'R_ORD_004', ruleName: 'Pediatric Fever Sepsis Screening', engineId: 'question_engine', category: 'ordering', description: 'In pediatric fever, sepsis red flags must be assessed first', conditions: 'patient.ageGroup === child && feature === FEVER && hasOutstandingRedFlags("sepsis")', effect: 'injectFeature("SEPSIS_RED_FLAGS", 0)', version: '1.0.0', status: 'active' },
    
    // Contraindication rules
    { ruleId: 'R_CTX_001', ruleName: 'Metformin Contrast Contraindication', engineId: 'clinical_reasoning_engine', category: 'contraindication', description: 'Check metformin use before ordering contrast imaging', conditions: 'investigation.type === imaging && investigation.contrast === true && medication.includes("metformin")', effect: 'warning = "Hold metformin 48h before contrast"; safetyCheck = true', version: '1.0.0', status: 'active' },
    { ruleId: 'R_CTX_002', ruleName: 'Pregnancy Imaging Radiation Caution', engineId: 'clinical_reasoning_engine', category: 'contraindication', description: 'Caution for radiation-based imaging in pregnancy', conditions: 'patient.gender === female && encounter.pregnancy === true && investigation.radiation === true', effect: 'warning = "Consider non-radiation alternative"; addCheck("beta_hcg")', version: '1.0.0', status: 'active' },
  ]);
}

export function initializeAGOC(): void {
  registerAllEngines();
  registerAllWorkflows();
  registerAllRules();
}