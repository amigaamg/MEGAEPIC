-- ============================================================================
-- AMEXAN Clinical OS - Canonical Clinical Observation (CCO) Schema
-- Version: 2.0.0
--
-- This schema implements the clinical facts and events model.
-- NO document-centric storage. Everything is observations + events.
-- Complaints, HPI, PMH, ROS, exam findings, investigations = all observations.
-- ============================================================================

-- ============================================================================
-- SCHEMA ORGANIZATION
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS rules;
CREATE SCHEMA IF NOT EXISTS reasoning;
CREATE SCHEMA IF NOT EXISTS knowledge;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS documentation;
CREATE SCHEMA IF NOT EXISTS analytics;

-- ============================================================================
-- COMPLAINT TIMELINE (replaces chief_complaints table)
-- ============================================================================
CREATE TABLE core.complaint_timelines (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    parent_complaint_id UUID REFERENCES core.complaint_timelines(id),
    timeline_position   INTEGER NOT NULL DEFAULT 0,
    onset_datetime      TIMESTAMPTZ NOT NULL,
    onset_precision     VARCHAR(20) NOT NULL DEFAULT 'exact',
    duration_value      INTEGER,
    duration_unit       VARCHAR(10),
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    reporter            VARCHAR(100) DEFAULT 'patient',
    patient_priority    INTEGER DEFAULT 5,
    doctor_priority     INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_onset_precision CHECK (onset_precision IN (
        'exact', 'approximate', 'estimated', 'unknown'
    )),
    CONSTRAINT chk_complaint_status CHECK (status IN (
        'active', 'resolved', 'recurrent', 'intermittent', 'unknown'
    )),
    CONSTRAINT chk_duration_unit CHECK (duration_unit IN (
        'minutes', 'hours', 'days', 'weeks', 'months', 'years'
    ))
);

CREATE INDEX idx_complaint_timeline_encounter ON core.complaint_timelines(encounter_id);
CREATE INDEX idx_complaint_timeline_onset ON core.complaint_timelines(onset_datetime);
CREATE INDEX idx_complaint_timeline_order ON core.complaint_timelines(encounter_id, timeline_position);

-- ============================================================================
-- COMPLAINT CONCEPTS (normalized complaint data)
-- ============================================================================
CREATE TABLE core.complaint_concepts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_timeline_id UUID NOT NULL REFERENCES core.complaint_timelines(id),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    patient_statement   TEXT NOT NULL,
    normalized_concept  VARCHAR(200) NOT NULL,
    body_system         VARCHAR(50),
    severity            INTEGER CHECK (severity BETWEEN 0 AND 10),
    is_primary          BOOLEAN DEFAULT FALSE,
    confidence          DECIMAL(3,2) DEFAULT 1.0,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_body_system CHECK (body_system IN (
        'cardiovascular', 'respiratory', 'gastrointestinal', 'neurological',
        'musculoskeletal', 'genitourinary', 'endocrine', 'dermatological',
        'psychiatric', 'ent', 'ophthalmological', 'hematological',
        'infectious', 'systemic', 'unknown'
    ))
);

CREATE INDEX idx_complaint_concept_encounter ON core.complaint_concepts(encounter_id);
CREATE INDEX idx_complaint_concept_normalized ON core.complaint_concepts(normalized_concept);
CREATE INDEX idx_complaint_concept_timeline ON core.complaint_concepts(complaint_timeline_id);

-- ============================================================================
-- HPI OBSERVATIONS (NOT an "hpi" table — HPI is rendered, not stored)
-- ============================================================================
CREATE TABLE core.hpi_observations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    complaint_id         UUID REFERENCES core.complaint_concepts(id),
    concept_id          VARCHAR(200) NOT NULL,
    value               JSONB NOT NULL,
    unit                VARCHAR(50),
    value_type          VARCHAR(30) NOT NULL DEFAULT 'text',
    observation_time    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    certainty           DECIMAL(3,2) DEFAULT 1.0,
    source              VARCHAR(30) NOT NULL DEFAULT 'patient',
    entered_by          UUID REFERENCES clinicians(id),
    version             INTEGER NOT NULL DEFAULT 1,
    superseded_by       UUID REFERENCES core.hpi_observations(id),

    CONSTRAINT chk_hpi_value_type CHECK (value_type IN (
        'text', 'number', 'boolean', 'date', 'select', 'multiselect', 'json'
    )),
    CONSTRAINT chk_hpi_source CHECK (source IN (
        'patient', 'clinician', 'system', 'referral', 'family'
    ))
);

CREATE INDEX idx_hpi_encounter ON core.hpi_observations(encounter_id);
CREATE INDEX idx_hpi_complaint ON core.hpi_observations(complaint_id);
CREATE INDEX idx_hpi_concept ON core.hpi_observations(concept_id);
CREATE INDEX idx_hpi_time ON core.hpi_observations(observation_time DESC);

-- ============================================================================
-- CLINICAL TIMELINE (chronological event log for each encounter)
-- ============================================================================
CREATE TABLE core.clinical_timelines (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    event_type          VARCHAR(50) NOT NULL,
    reference_table     VARCHAR(50),
    reference_id        UUID,
    timeline_date       TIMESTAMPTZ NOT NULL,
    timeline_order      INTEGER NOT NULL DEFAULT 0,
    certainty           DECIMAL(3,2) DEFAULT 1.0,
    source              VARCHAR(30) DEFAULT 'system',
    summary             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_timeline_event_type CHECK (event_type IN (
        'symptom_onset', 'symptom_change', 'investigation', 'diagnosis',
        'treatment', 'admission', 'discharge', 'referral', 'procedure',
        'outcome', 'follow_up', 'milestone', 'alert', 'observation'
    ))
);

CREATE INDEX idx_clinical_timeline_encounter ON core.clinical_timelines(encounter_id, timeline_order);
CREATE INDEX idx_clinical_timeline_date ON core.clinical_timelines(encounter_id, timeline_date);

-- ============================================================================
-- CLINICAL RELATIONSHIPS (connections between observations)
-- ============================================================================
CREATE TABLE core.clinical_relationships (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_observation  UUID NOT NULL REFERENCES core.hpi_observations(id),
    target_observation  UUID NOT NULL REFERENCES core.hpi_observations(id),
    relationship_type   VARCHAR(30) NOT NULL,
    confidence          DECIMAL(3,2) DEFAULT 1.0,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_relationship_type CHECK (relationship_type IN (
        'precedes', 'follows', 'causes', 'associated', 'contradicts',
        'supports', 'excludes', 'temporal', 'conditional', 'aggravates',
        'relieves', 'independent', 'unknown'
    )),
    UNIQUE(source_observation, target_observation, relationship_type)
);

CREATE INDEX idx_clinical_relationships_source ON core.clinical_relationships(source_observation);
CREATE INDEX idx_clinical_relationships_target ON core.clinical_relationships(target_observation);

-- ============================================================================
-- CLINICAL CONTEXT (runtime cache — never recalculated from scratch)
-- ============================================================================
CREATE TABLE core.clinical_context (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID UNIQUE NOT NULL REFERENCES encounters(id),
    patient_id          UUID NOT NULL REFERENCES patients(id),
    age_group           VARCHAR(20),
    sex                 VARCHAR(10),
    pregnancy_status    VARCHAR(20),
    specialty           VARCHAR(100),
    acuity              VARCHAR(20),
    current_phase       VARCHAR(30),
    workflow_state      VARCHAR(30),
    risk_level          VARCHAR(20) DEFAULT 'low',
    active_pathways     TEXT[] DEFAULT '{}',
    active_rules        TEXT[] DEFAULT '{}',
    derived_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_age_group CHECK (age_group IN (
        'neonate', 'infant', 'child', 'adolescent', 'adult', 'older_adult'
    )),
    CONSTRAINT chk_acuity CHECK (acuity IN (
        'immediate', 'emergency', 'urgent', 'semi_urgent', 'routine', 'elective'
    )),
    CONSTRAINT chk_risk_level CHECK (risk_level IN (
        'low', 'moderate', 'high', 'critical'
    ))
);

CREATE INDEX idx_clinical_context_patient ON core.clinical_context(patient_id);
CREATE INDEX idx_clinical_context_active ON core.clinical_context(risk_level) WHERE risk_level IN ('high', 'critical');

-- ============================================================================
-- RULES: CONDITIONS (separated from JSONB in rules table for queryability)
-- ============================================================================
CREATE TABLE rules.rule_conditions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id             UUID NOT NULL REFERENCES rules(id),
    field               VARCHAR(200) NOT NULL,
    operator            VARCHAR(20) NOT NULL,
    value               TEXT,
    join_operator       VARCHAR(10) DEFAULT 'AND',
    group_number        INTEGER DEFAULT 0,
    weight              DECIMAL(5,2) DEFAULT 1.0,
    negate              BOOLEAN DEFAULT FALSE,

    CONSTRAINT chk_condition_operator CHECK (operator IN (
        'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'in', 'not_in',
        'exists', 'not_exists', 'contains', 'matches', 'between'
    )),
    CONSTRAINT chk_join_operator CHECK (join_operator IN ('AND', 'OR'))
);

CREATE INDEX idx_rule_conditions_rule ON rules.rule_conditions(rule_id);
CREATE INDEX idx_rule_conditions_field ON rules.rule_conditions(field);

-- ============================================================================
-- RULES: ACTIONS (separated from JSONB)
-- ============================================================================
CREATE TABLE rules.rule_actions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id             UUID NOT NULL REFERENCES rules(id),
    action_type         VARCHAR(50) NOT NULL,
    target              VARCHAR(300),
    parameters          JSONB DEFAULT '{}'::jsonb,
    priority            INTEGER DEFAULT 0,

    CONSTRAINT chk_action_type CHECK (action_type IN (
        'show_section', 'hide_section', 'require_field', 'recommend_question',
        'recommend_exam', 'recommend_investigation', 'calculate_score',
        'trigger_alert', 'update_probability', 'generate_summary',
        'lock_workflow', 'unlock_workflow', 'raise_warning', 'request_review',
        'activate_pathway', 'deactivate_pathway', 'insert_section',
        'set_default', 'filter_differential', 'add_differential',
        'remove_differential', 'recommend_referral', 'show_education',
        'auto_populate'
    ))
);

CREATE INDEX idx_rule_actions_rule ON rules.rule_actions(rule_id);

-- ============================================================================
-- RULES: VERSIONS (immutable rule history)
-- ============================================================================
CREATE TABLE rules.rule_versions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id             UUID NOT NULL REFERENCES rules(id),
    version             VARCHAR(20) NOT NULL,
    code                VARCHAR(20) NOT NULL,
    name                VARCHAR(300) NOT NULL,
    description         TEXT,
    category            VARCHAR(10) NOT NULL,
    priority            INTEGER NOT NULL,
    status              VARCHAR(20) NOT NULL,
    conditions_snapshot JSONB NOT NULL,
    actions_snapshot    JSONB NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    superseded_by       UUID REFERENCES rules.rule_versions(id)
);

CREATE INDEX idx_rule_versions_rule ON rules.rule_versions(rule_id, version);

-- ============================================================================
-- RULES: SETS (group rules into deployable units)
-- ============================================================================
CREATE TABLE rules.rule_sets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(300) NOT NULL,
    description         TEXT,
    version             VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    status              VARCHAR(20) DEFAULT 'draft',
    enabled             BOOLEAN DEFAULT FALSE,
    effective_from      TIMESTAMPTZ,
    effective_to        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID REFERENCES clinicians(id)
);

CREATE TABLE rules.rule_set_members (
    rule_set_id         UUID NOT NULL REFERENCES rules.rule_sets(id),
    rule_id             UUID NOT NULL REFERENCES rules(id),
    sort_order          INTEGER DEFAULT 0,
    PRIMARY KEY (rule_set_id, rule_id)
);

-- ============================================================================
-- RULES: EXECUTION LOG (detailed per-execution record)
-- ============================================================================
CREATE TABLE rules.rule_executions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id             UUID NOT NULL REFERENCES rules(id),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    patient_id          UUID NOT NULL REFERENCES patients(id),
    trigger_event       VARCHAR(50),
    status              VARCHAR(20) NOT NULL DEFAULT 'completed',
    execution_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_ms         INTEGER,
    conditions_met      BOOLEAN NOT NULL,
    actions_executed    INTEGER DEFAULT 0,
    result              JSONB DEFAULT '{}'::jsonb,
    error               TEXT,
    version             VARCHAR(20)
);

CREATE INDEX idx_rule_exec_encounter_rules ON rules.rule_executions(encounter_id);
CREATE INDEX idx_rule_exec_rule ON rules.rule_executions(rule_id);
CREATE INDEX idx_rule_exec_patient ON rules.rule_executions(patient_id);
CREATE INDEX idx_rule_exec_time ON rules.rule_executions(execution_time DESC);

-- ============================================================================
-- REASONING: SESSIONS (group inferences by reasoning cycle)
-- ============================================================================
CREATE TABLE reasoning.reasoning_sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    trigger_event       VARCHAR(50) NOT NULL,
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    hypotheses_count    INTEGER DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'active',

    CONSTRAINT chk_reasoning_status CHECK (status IN ('active', 'completed', 'failed'))
);

CREATE INDEX idx_reasoning_sessions_encounter ON reasoning.reasoning_sessions(encounter_id);

-- ============================================================================
-- REASONING: DIFFERENTIAL DIAGNOSES (ranked hypotheses)
-- ============================================================================
CREATE TABLE reasoning.differential_diagnoses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    session_id          UUID REFERENCES reasoning.reasoning_sessions(id),
    disease_id          VARCHAR(200) NOT NULL,
    disease_name        VARCHAR(300) NOT NULL,
    probability         DECIMAL(5,2) DEFAULT 0,
    confidence          DECIMAL(3,2) DEFAULT 0.5,
    supporting_score    DECIMAL(8,2) DEFAULT 0,
    opposing_score      DECIMAL(8,2) DEFAULT 0,
    rank                INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    is_confirmed        BOOLEAN DEFAULT FALSE,
    is_excluded         BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_differential_encounter ON reasoning.differential_diagnoses(encounter_id, rank);
CREATE INDEX idx_differential_active ON reasoning.differential_diagnoses(encounter_id) WHERE is_active;

-- ============================================================================
-- REASONING: EVIDENCE (links observations to inferences)
-- ============================================================================
CREATE TABLE reasoning.reasoning_evidence (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inference_id        UUID NOT NULL REFERENCES reasoning.differential_diagnoses(id),
    observation_id      UUID NOT NULL REFERENCES core.hpi_observations(id),
    weight              DECIMAL(5,2) DEFAULT 0,
    likelihood_ratio    DECIMAL(8,2),
    direction           VARCHAR(20) NOT NULL,
    source              VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_evidence_direction CHECK (direction IN (
        'supports', 'against', 'strongly_supports', 'excludes', 'rules_out', 'rules_in'
    ))
);

CREATE INDEX idx_evidence_inference ON reasoning.reasoning_evidence(inference_id);
CREATE INDEX idx_evidence_observation ON reasoning.reasoning_evidence(observation_id);

-- ============================================================================
-- KNOWLEDGE: MEDICAL CONCEPTS (standardized vocabulary)
-- ============================================================================
CREATE TABLE knowledge.medical_concepts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id          VARCHAR(100) UNIQUE NOT NULL,
    name                VARCHAR(300) NOT NULL,
    aliases             TEXT[] DEFAULT '{}',
    category            VARCHAR(50) NOT NULL,
    body_system         VARCHAR(50),
    description         TEXT,
    meta                JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_concept_category CHECK (category IN (
        'symptom', 'sign', 'disease', 'drug', 'investigation', 'procedure',
        'anatomy', 'finding', 'risk_factor', 'complication', 'management'
    ))
);

CREATE INDEX idx_concepts_id ON knowledge.medical_concepts(concept_id);
CREATE INDEX idx_concepts_category ON knowledge.medical_concepts(category);

-- ============================================================================
-- KNOWLEDGE: CONCEPT RELATIONSHIPS
-- ============================================================================
CREATE TABLE knowledge.concept_relationships (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_concept      VARCHAR(100) NOT NULL REFERENCES knowledge.medical_concepts(concept_id),
    target_concept      VARCHAR(100) NOT NULL REFERENCES knowledge.medical_concepts(concept_id),
    relationship        VARCHAR(50) NOT NULL,
    strength            DECIMAL(5,2) DEFAULT 1.0,
    evidence_level      VARCHAR(20),
    source              TEXT,

    CONSTRAINT chk_knowledge_relationship CHECK (relationship IN (
        'causes', 'associated_with', 'risk_factor_for', 'manifestation_of',
        'diagnosed_by', 'treated_by', 'complication_of', 'differential_of',
        'contraindicated_in', 'indicated_for', 'precedes', 'follows',
        'similar_to', 'maps_to'
    ))
);

CREATE INDEX idx_concept_rel_source ON knowledge.concept_relationships(source_concept);
CREATE INDEX idx_concept_rel_target ON knowledge.concept_relationships(target_concept);

-- ============================================================================
-- KNOWLEDGE: SYMPTOM SCHEMAS
-- ============================================================================
CREATE TABLE knowledge.symptom_schemas (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id          VARCHAR(100) UNIQUE NOT NULL REFERENCES knowledge.medical_concepts(concept_id),
    label               VARCHAR(300) NOT NULL,
    body_system         VARCHAR(50),
    attributes          JSONB NOT NULL DEFAULT '[]'::jsonb,
    red_flags           JSONB DEFAULT '[]'::jsonb,
    differentials       JSONB DEFAULT '[]'::jsonb,
    question_template   JSONB DEFAULT '[]'::jsonb,
    version             VARCHAR(20) DEFAULT '1.0.0',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- KNOWLEDGE: DISEASE PROFILES
-- ============================================================================
CREATE TABLE knowledge.disease_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id          VARCHAR(100) UNIQUE NOT NULL REFERENCES knowledge.medical_concepts(concept_id),
    name                VARCHAR(300) NOT NULL,
    icd_code            VARCHAR(20),
    body_system         VARCHAR(50),
    typical_presentation TEXT,
    risk_factors        JSONB DEFAULT '[]'::jsonb,
    red_flags           JSONB DEFAULT '[]'::jsonb,
    prevalence          DECIMAL(5,2),
    urgency             VARCHAR(20),
    requires_referral   BOOLEAN DEFAULT FALSE,
    referral_specialty  VARCHAR(100),
    meta                JSONB DEFAULT '{}'::jsonb,
    version             VARCHAR(20) DEFAULT '1.0.0',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- KNOWLEDGE: INVESTIGATION PROFILES
-- ============================================================================
CREATE TABLE knowledge.investigation_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id          VARCHAR(100) UNIQUE NOT NULL REFERENCES knowledge.medical_concepts(concept_id),
    name                VARCHAR(300) NOT NULL,
    category            VARCHAR(50) NOT NULL,
    is_bedside          BOOLEAN DEFAULT FALSE,
    turnaround_hours    INTEGER,
    preparation         TEXT,
    interpretation      TEXT,
    contraindications   JSONB DEFAULT '[]'::jsonb,
    cost_band           VARCHAR(20),
    meta                JSONB DEFAULT '{}'::jsonb,
    version             VARCHAR(20) DEFAULT '1.0.0',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_investigation_category CHECK (category IN (
        'laboratory', 'imaging', 'pathology', 'microbiology',
        'cardiac', 'neurological', 'respiratory', 'endoscopic',
        'genetic', 'point_of_care', 'other'
    ))
);

-- ============================================================================
-- KNOWLEDGE: TREATMENT PROFILES
-- ============================================================================
CREATE TABLE knowledge.treatment_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id          VARCHAR(100) UNIQUE NOT NULL REFERENCES knowledge.medical_concepts(concept_id),
    name                VARCHAR(300) NOT NULL,
    category            VARCHAR(50) NOT NULL,
    indications         JSONB DEFAULT '[]'::jsonb,
    contraindications   JSONB DEFAULT '[]'::jsonb,
    dosages             JSONB DEFAULT '[]'::jsonb,
    side_effects        JSONB DEFAULT '[]'::jsonb,
    interactions        JSONB DEFAULT '[]'::jsonb,
    monitoring          JSONB DEFAULT '[]'::jsonb,
    meta                JSONB DEFAULT '{}'::jsonb,
    version             VARCHAR(20) DEFAULT '1.0.0',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_treatment_category CHECK (category IN (
        'medication', 'procedure', 'surgery', 'therapy',
        'conservative', 'supportive', 'preventive', 'palliative'
    ))
);

-- ============================================================================
-- QUESTIONS: Clinical Question Engine
-- ============================================================================
CREATE TABLE knowledge.clinical_questions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id          VARCHAR(100) NOT NULL,
    question            TEXT NOT NULL,
    reason              VARCHAR(100),
    priority            INTEGER DEFAULT 5,
    information_gain    DECIMAL(5,2) DEFAULT 0,
    is_required         BOOLEAN DEFAULT FALSE,
    input_type          VARCHAR(30) DEFAULT 'text',
    options             JSONB DEFAULT '[]'::jsonb,
    conditional_on      VARCHAR(100),
    terminates_on       VARCHAR(100),
    documentation_field VARCHAR(200),
    depends_on          TEXT[] DEFAULT '{}',
    schema              JSONB DEFAULT '{}'::jsonb,
    version             VARCHAR(20) DEFAULT '1.0.0',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_input_type CHECK (input_type IN (
        'text', 'number', 'boolean', 'date', 'datetime',
        'select', 'multiselect', 'textarea', 'slider'
    ))
);

CREATE INDEX idx_questions_concept ON knowledge.clinical_questions(concept_id);
CREATE INDEX idx_questions_priority ON knowledge.clinical_questions(priority, information_gain DESC);

-- ============================================================================
-- QUESTIONS: Question Sessions (per-encounter question state)
-- ============================================================================
CREATE TABLE workflow.question_sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    question_id         UUID NOT NULL REFERENCES knowledge.clinical_questions(id),
    shown_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    answered_at         TIMESTAMPTZ,
    answer_observation  UUID REFERENCES core.hpi_observations(id),
    answer_value        JSONB,
    was_skipped         BOOLEAN DEFAULT FALSE,
    skip_reason         VARCHAR(100),
    information_gain_realized DECIMAL(5,2),

    UNIQUE(encounter_id, question_id)
);

CREATE INDEX idx_question_sessions_encounter ON workflow.question_sessions(encounter_id);
CREATE INDEX idx_question_sessions_unanswered ON workflow.question_sessions(encounter_id) WHERE answered_at IS NULL AND NOT was_skipped;

-- ============================================================================
-- DOCUMENTATION: Templates
-- ============================================================================
CREATE TABLE documentation.document_templates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type       VARCHAR(50) NOT NULL,
    name                VARCHAR(300) NOT NULL,
    specialty           VARCHAR(100),
    sections            JSONB NOT NULL DEFAULT '[]'::jsonb,
    rules               JSONB DEFAULT '[]'::jsonb,
    version             VARCHAR(20) DEFAULT '1.0.0',
    is_default          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTATION: Generated Summaries (cached renders)
-- ============================================================================
CREATE TABLE documentation.generated_summaries (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    document_type       VARCHAR(50) NOT NULL,
    template_id         UUID REFERENCES documentation.document_templates(id),
    content             JSONB NOT NULL,
    narrative           TEXT,
    observation_count   INTEGER DEFAULT 0,
    rule_count          INTEGER DEFAULT 0,
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by        UUID REFERENCES clinicians(id),
    version             INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_summary_type CHECK (document_type IN (
        'hpi', 'soap_note', 'progress_note', 'discharge_summary',
        'referral_letter', 'clinic_note', 'operative_note',
        'consultation_note', 'death_summary', 'prescription', 'certificate'
    ))
);

CREATE INDEX idx_summaries_encounter ON documentation.generated_summaries(encounter_id, document_type);

-- ============================================================================
-- ANALYTICS: Decision Audit Trail
-- ============================================================================
CREATE TABLE analytics.clinical_decisions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    decision_type       VARCHAR(50) NOT NULL,
    decision            TEXT NOT NULL,
    supporting_evidence TEXT[] DEFAULT '{}',
    opposing_evidence   TEXT[] DEFAULT '{}',
    rules_triggered     TEXT[] DEFAULT '{}',
    confidence          DECIMAL(3,2),
    made_by             VARCHAR(30) NOT NULL DEFAULT 'clinician',
    made_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_decision_type CHECK (decision_type IN (
        'diagnosis', 'investigation', 'treatment', 'referral',
        'admission', 'discharge', 'procedure', 'prescription'
    )),
    CONSTRAINT chk_decision_made_by CHECK (made_by IN (
        'clinician', 'system', 'rule', 'ai', 'patient'
    ))
);

CREATE INDEX idx_decisions_encounter ON analytics.clinical_decisions(encounter_id);
CREATE INDEX idx_decisions_type ON analytics.clinical_decisions(decision_type);

-- ============================================================================
-- ANALYTICS: Encounter Performance Metrics
-- ============================================================================
CREATE TABLE analytics.encounter_metrics (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID UNIQUE NOT NULL REFERENCES encounters(id),
    total_observations  INTEGER DEFAULT 0,
    total_events        INTEGER DEFAULT 0,
    rules_evaluated     INTEGER DEFAULT 0,
    rules_triggered     INTEGER DEFAULT 0,
    questions_asked     INTEGER DEFAULT 0,
    questions_answered  INTEGER DEFAULT 0,
    diagnoses_considered INTEGER DEFAULT 0,
    diagnoses_confirmed  INTEGER DEFAULT 0,
    investigations_ordered INTEGER DEFAULT 0,
    total_duration_minutes INTEGER,
    time_in_history_minutes INTEGER,
    time_in_exam_minutes    INTEGER,
    documentation_time_minutes INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TRIGGER: Auto-create clinical context on encounter creation
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_create_clinical_context()
RETURNS TRIGGER AS $$
DECLARE
    v_patient RECORD;
    v_context RECORD;
BEGIN
    -- Get patient info
    SELECT * INTO v_patient FROM patients WHERE id = NEW.patient_id;
    
    -- Get or derive context
    SELECT * INTO v_context FROM patient_contexts WHERE patient_id = NEW.patient_id;
    
    -- Create clinical context
    INSERT INTO core.clinical_context (
        encounter_id, patient_id, age_group, sex,
        pregnancy_status, acuity, current_phase, workflow_state, risk_level
    ) VALUES (
        NEW.id,
        NEW.patient_id,
        COALESCE(v_context.age_category, 'adult'),
        v_patient.sex_at_birth,
        COALESCE(v_context.pregnancy_status, 'unknown'),
        NEW.priority,
        NEW.clinical_state,
        NEW.clinical_state,
        CASE WHEN NEW.priority IN ('immediate', 'emergency') THEN 'critical'
             WHEN NEW.priority = 'urgent' THEN 'high'
             ELSE 'low'
        END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_clinical_context
    AFTER INSERT ON encounters
    FOR EACH ROW
    EXECUTE FUNCTION fn_create_clinical_context();

-- ============================================================================
-- TRIGGER: Record clinical timeline entry on observation
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_record_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO core.clinical_timelines (
        encounter_id, event_type, reference_table, reference_id,
        timeline_date, timeline_order, source, summary
    ) VALUES (
        NEW.encounter_id,
        CASE 
            WHEN NEW.source = 'patient' THEN 'symptom_onset'
            WHEN NEW.source = 'lab' THEN 'investigation'
            WHEN NEW.source = 'device' THEN 'observation'
            ELSE 'observation'
        END,
        'hpi_observations',
        NEW.id,
        NEW.time_observed,
        EXTRACT(EPOCH FROM (NEW.time_observed - NOW()))::INTEGER,
        NEW.source,
        NEW.concept_id || ': ' || NEW.value::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_timeline_event
    AFTER INSERT ON core.hpi_observations
    FOR EACH ROW
    EXECUTE FUNCTION fn_record_timeline_event();

-- ============================================================================
-- VIEW: Active Complaint Timeline (rendered view)
-- ============================================================================
CREATE OR REPLACE VIEW v_complaint_timeline AS
SELECT 
    ct.encounter_id,
    ct.id AS timeline_id,
    ct.timeline_position,
    ct.onset_datetime,
    ct.onset_precision,
    ct.duration_value,
    ct.duration_unit,
    ct.status AS complaint_status,
    cc.patient_statement,
    cc.normalized_concept,
    cc.body_system,
    cc.severity,
    cc.is_primary,
    cc.confidence
FROM core.complaint_timelines ct
JOIN core.complaint_concepts cc ON cc.complaint_timeline_id = ct.id
WHERE cc.is_active = true
ORDER BY ct.onset_datetime ASC;

-- ============================================================================
-- VIEW: Differential Summary
-- ============================================================================
CREATE OR REPLACE VIEW v_differential_summary AS
SELECT 
    dd.encounter_id,
    dd.disease_name,
    dd.probability,
    dd.confidence,
    dd.supporting_score,
    dd.opposing_score,
    dd.rank,
    dd.is_confirmed,
    dd.is_excluded,
    COUNT(re.id) AS evidence_count
FROM reasoning.differential_diagnoses dd
LEFT JOIN reasoning.reasoning_evidence re ON re.inference_id = dd.id
WHERE dd.is_active = true
GROUP BY dd.id, dd.encounter_id, dd.disease_name, dd.probability, 
         dd.confidence, dd.supporting_score, dd.opposing_score, 
         dd.rank, dd.is_confirmed, dd.is_excluded
ORDER BY dd.encounter_id, dd.rank;

-- ============================================================================
-- VIEW: Encounter Clinical Summary (one-stop-shop for all clinical data)
-- ============================================================================
CREATE OR REPLACE VIEW v_encounter_clinical_summary AS
SELECT 
    e.id AS encounter_id,
    e.patient_id,
    e.visit_type,
    e.priority,
    e.clinical_state,
    e.created_at AS encounter_started,
    cc.age_group,
    cc.sex,
    cc.pregnancy_status,
    cc.acuity,
    cc.risk_level,
    cc.active_pathways,
    (SELECT jsonb_agg(jsonb_build_object(
        'concept', cp.normalized_concept,
        'statement', cp.patient_statement,
        'severity', cp.severity,
        'body_system', cp.body_system,
        'onset', ct.onset_datetime,
        'status', ct.status
    ) ORDER BY ct.onset_datetime)
    FROM core.complaint_timelines ct
    JOIN core.complaint_concepts cp ON cp.complaint_timeline_id = ct.id
    WHERE ct.encounter_id = e.id AND cp.is_active = true) AS complaints,
    
    (SELECT jsonb_agg(jsonb_build_object(
        'concept', ho.concept_id,
        'value', ho.value,
        'certainty', ho.certainty,
        'source', ho.source
    ))
    FROM core.hpi_observations ho
    WHERE ho.encounter_id = e.id) AS observations,
    
    (SELECT jsonb_agg(jsonb_build_object(
        'disease', dd.disease_name,
        'probability', dd.probability,
        'rank', dd.rank,
        'confirmed', dd.is_confirmed,
        'excluded', dd.is_excluded
    ) ORDER BY dd.rank)
    FROM reasoning.differential_diagnoses dd
    WHERE dd.encounter_id = e.id AND dd.is_active = true) AS differentials

FROM encounters e
JOIN core.clinical_context cc ON cc.encounter_id = e.id
WHERE e.status = 'active';

-- ============================================================================
-- FUNCTION: Evaluate clinical context risk level
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_update_risk_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Update risk level based on active differentials
    UPDATE core.clinical_context cc
    SET risk_level = CASE
        WHEN EXISTS (
            SELECT 1 FROM reasoning.differential_diagnoses dd
            WHERE dd.encounter_id = cc.encounter_id
            AND dd.is_active = true AND dd.probability > 0.3
            AND dd.disease_id IN ('sepsis', 'acute_coronary_syndrome', 'aortic_dissection',
                                  'pulmonary_embolism', 'meningitis', 'necrotizing_fasciitis',
                                  'subarachnoid_haemorrhage', 'epiglottitis', 'tension_pneumothorax')
        ) THEN 'critical'
        WHEN EXISTS (
            SELECT 1 FROM reasoning.differential_diagnoses dd
            WHERE dd.encounter_id = cc.encounter_id
            AND dd.is_active = true AND dd.probability > 0.5
        ) THEN 'high'
        WHEN cc.acuity IN ('urgent', 'semi_urgent') THEN 'moderate'
        ELSE 'low'
    END,
    updated_at = NOW()
    WHERE cc.encounter_id = NEW.encounter_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_risk_level
    AFTER INSERT OR UPDATE OF probability ON reasoning.differential_diagnoses
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_risk_level();

-- ============================================================================
-- MATERIALIZED VIEW: Clinical Timeline for display
-- ============================================================================
CREATE MATERIALIZED VIEW mv_clinical_timeline AS
SELECT 
    ct.encounter_id,
    ct.timeline_date,
    ct.timeline_order,
    ct.event_type,
    ct.summary,
    ct.certainty,
    ct.source
FROM core.clinical_timelines ct
ORDER BY ct.encounter_id, ct.timeline_date ASC, ct.timeline_order ASC;

CREATE UNIQUE INDEX idx_mv_timeline ON mv_clinical_timeline(encounter_id, timeline_date, timeline_order);
