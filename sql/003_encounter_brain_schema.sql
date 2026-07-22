-- ============================================================================
-- AMEXAN Clinical OS - Encounter Brain Architecture
-- Version: 1.0.0
--
-- This schema adds the Encounter Graph, Disease State Objects, Master Timeline,
-- Health Seeking Journey, Chronic Disease Objects, Documentation Graph, and
-- Workflow Engine tables to support the Encounter Brain architecture.
-- ============================================================================

-- ============================================================================
-- WORKFLOW: Encounter State Machine (28-step workflow)
-- ============================================================================
CREATE TABLE workflow.workflow_states (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    current_step        VARCHAR(50) NOT NULL,
    completed_steps     TEXT[] DEFAULT '{}',
    skipped_steps       TEXT[] DEFAULT '{}',
    step_metadata       JSONB DEFAULT '{}',
    started_at          TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ,

    CONSTRAINT chk_workflow_step CHECK (current_step IN (
        'registration', 'triage', 'waiting',
        'consultation_start',
        'history_chief_complaint', 'history_hpi', 'history_pmh',
        'history_medication', 'history_allergy',
        'history_ros', 'history_social', 'history_family',
        'examination_general', 'examination_vitals', 'examination_systemic',
        'examination_focused',
        'assessment_summary', 'differential_list',
        'investigation_plan', 'investigation_results',
        'diagnosis_final', 'treatment_plan', 'prescription',
        'patient_education', 'disposition', 'follow_up',
        'documentation', 'encounter_complete'
    ))
);

CREATE INDEX idx_workflow_encounter_step ON workflow.workflow_states(encounter_id);
CREATE INDEX idx_workflow_current_step ON workflow.workflow_states(current_step) WHERE current_step NOT IN ('encounter_complete');

-- ============================================================================
-- CORE: Structured Symptom Objects
-- ============================================================================
CREATE TABLE core.symptom_objects (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    symptom_id          VARCHAR(100) NOT NULL,
    label               VARCHAR(300),
    present             BOOLEAN,
    is_primary          BOOLEAN DEFAULT FALSE,
    attributes          JSONB DEFAULT '{}',
    relationships       JSONB DEFAULT '[]',
    onset_event_id      UUID REFERENCES core.clinical_timelines(id),
    resolved_event_id   UUID REFERENCES core.clinical_timelines(id),
    owner               VARCHAR(50) NOT NULL,
    created_at          TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_symptom_objects_encounter ON core.symptom_objects(encounter_id);
CREATE INDEX idx_symptom_objects_symptom ON core.symptom_objects(symptom_id);
CREATE INDEX idx_symptom_objects_primary ON core.symptom_objects(encounter_id) WHERE is_primary = TRUE;

-- ============================================================================
-- CORE: Symptom Relationships
-- ============================================================================
CREATE TABLE core.symptom_relationships (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    source_symptom_id   UUID NOT NULL REFERENCES core.symptom_objects(id),
    target_symptom_id   UUID NOT NULL REFERENCES core.symptom_objects(id),
    relationship_type   VARCHAR(30) NOT NULL,
    description         TEXT,
    certainty           VARCHAR(20),
    created_at          TIMESTAMPTZ
);

CREATE INDEX idx_symptom_relationships_encounter ON core.symptom_relationships(encounter_id);
CREATE INDEX idx_symptom_relationships_source ON core.symptom_relationships(source_symptom_id);
CREATE INDEX idx_symptom_relationships_target ON core.symptom_relationships(target_symptom_id);
CREATE INDEX idx_symptom_relationships_type ON core.symptom_relationships(relationship_type);

-- ============================================================================
-- REASONING: Disease State Objects (live Bayesian disease states)
-- ============================================================================
CREATE TABLE reasoning.disease_states (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    disease_id          VARCHAR(100) NOT NULL,
    disease_name        VARCHAR(300),
    icd_code            VARCHAR(20),
    prior_prob          DECIMAL(5,4),
    current_prob        DECIMAL(5,4),
    previous_prob       DECIMAL(5,4),
    probability_history JSONB DEFAULT '[]',
    supporting_evidence JSONB DEFAULT '[]',
    against_evidence    JSONB DEFAULT '[]',
    unknown_evidence    JSONB DEFAULT '[]',
    critical_unknowns   TEXT[] DEFAULT '{}',
    scores              JSONB DEFAULT '{}',
    red_flag_triggered  BOOLEAN DEFAULT FALSE,
    red_flag_features   TEXT[] DEFAULT '{}',
    danger_level        VARCHAR(20),
    must_not_miss       BOOLEAN DEFAULT FALSE,
    current_stage_index INTEGER DEFAULT 0,
    last_updated        TIMESTAMPTZ
);

CREATE INDEX idx_disease_states_encounter ON reasoning.disease_states(encounter_id);
CREATE INDEX idx_disease_states_disease ON reasoning.disease_states(disease_id);
CREATE INDEX idx_disease_states_red_flag ON reasoning.disease_states(encounter_id) WHERE red_flag_triggered = TRUE;
CREATE INDEX idx_disease_states_must_not_miss ON reasoning.disease_states(encounter_id) WHERE must_not_miss = TRUE;

-- ============================================================================
-- CORE: Health Seeking Journeys
-- ============================================================================
CREATE TABLE core.health_seeking_journeys (
    id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id                    UUID UNIQUE NOT NULL REFERENCES encounters(id),
    steps                           JSONB DEFAULT '[]',
    total_days_before_presentation  DECIMAL(6,1),
    number_of_facilities            INTEGER DEFAULT 0,
    had_self_medication             BOOLEAN DEFAULT FALSE,
    had_previous_admission          BOOLEAN DEFAULT FALSE,
    had_similar_episodes            BOOLEAN DEFAULT FALSE,
    previous_admission_details      TEXT,
    similar_episode_details         TEXT,
    created_at                      TIMESTAMPTZ
);

CREATE INDEX idx_health_seeking_journeys_encounter ON core.health_seeking_journeys(encounter_id);

-- ============================================================================
-- CORE: Chronic Disease Objects
-- ============================================================================
CREATE TABLE core.chronic_disease_objects (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id          UUID NOT NULL REFERENCES patients(id),
    disease_id          VARCHAR(100) NOT NULL,
    disease_name        VARCHAR(300),
    diagnosis_year      INTEGER,
    diagnosis_facility  VARCHAR(300),
    current_clinic      VARCHAR(300),
    medications         JSONB DEFAULT '[]',
    compliance          VARCHAR(20),
    monitoring          JSONB DEFAULT '[]',
    last_review_date    DATE,
    complications       JSONB DEFAULT '[]',
    admissions          JSONB DEFAULT '[]',
    current_control     VARCHAR(30),
    created_at          TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_chronic_disease_patient ON core.chronic_disease_objects(patient_id);
CREATE INDEX idx_chronic_disease_disease ON core.chronic_disease_objects(disease_id);
CREATE INDEX idx_chronic_disease_patient_disease ON core.chronic_disease_objects(patient_id, disease_id);

-- ============================================================================
-- CORE: Surgical Contexts
-- ============================================================================
CREATE TABLE core.surgical_contexts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    previous_surgeries  JSONB DEFAULT '[]',
    is_postoperative    BOOLEAN DEFAULT FALSE,
    post_op_day         INTEGER,
    operation_performed VARCHAR(300),
    operation_date      DATE,
    wound_status        VARCHAR(30),
    pain_control        VARCHAR(30),
    ambulation          VARCHAR(30),
    feeding             VARCHAR(30),
    urination           VARCHAR(30),
    flatus_passed       BOOLEAN,
    bowel_motion        BOOLEAN,
    dvt_prophylaxis     BOOLEAN,
    antibiotics         BOOLEAN,
    complications       TEXT[] DEFAULT '{}',
    created_at          TIMESTAMPTZ
);

CREATE INDEX idx_surgical_contexts_encounter ON core.surgical_contexts(encounter_id);

-- ============================================================================
-- DOCUMENTATION: Documentation Graphs
-- ============================================================================
CREATE TABLE documentation.documentation_graphs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID UNIQUE NOT NULL REFERENCES encounters(id),
    nodes               JSONB DEFAULT '[]',
    root_ids            TEXT[] DEFAULT '{}',
    rendered_formats    JSONB DEFAULT '{}',
    last_rendered       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ
);

CREATE INDEX idx_documentation_graphs_encounter ON documentation.documentation_graphs(encounter_id);

-- ============================================================================
-- WORKFLOW: Adaptive Question Groups
-- ============================================================================
CREATE TABLE workflow.question_groups (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID NOT NULL REFERENCES encounters(id),
    group_id            VARCHAR(100) NOT NULL,
    label               VARCHAR(300),
    description         TEXT,
    questions           TEXT[] DEFAULT '{}',
    display_order       INTEGER DEFAULT 0,
    min_required        INTEGER DEFAULT 1,
    condition           TEXT,
    created_at          TIMESTAMPTZ
);

CREATE INDEX idx_question_groups_encounter ON workflow.question_groups(encounter_id);
CREATE INDEX idx_question_groups_group ON workflow.question_groups(group_id);

-- ============================================================================
-- CORE: Functional Statuses and Frailty
-- ============================================================================
CREATE TABLE core.functional_statuses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id        UUID UNIQUE NOT NULL REFERENCES encounters(id),
    occupation          VARCHAR(200),
    work_impact         TEXT,
    school_attendance   TEXT,
    daily_activities    JSONB DEFAULT '[]',
    overall_impact      VARCHAR(30),
    caregiver_available BOOLEAN,
    caregiver_name      VARCHAR(200),
    frailty_assessed    BOOLEAN DEFAULT FALSE,
    frailty_data        JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_functional_statuses_encounter ON core.functional_statuses(encounter_id);

-- ============================================================================
-- TRIGGER: Auto-create workflow state on encounter creation
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_create_workflow_state()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workflow.workflow_states (
        encounter_id, current_step, completed_steps,
        skipped_steps, step_metadata, started_at, updated_at
    ) VALUES (
        NEW.id, 'registration', '{}', '{}',
        jsonb_build_object(
            'registration', jsonb_build_object('status', 'active', 'entered_at', NOW())
        ),
        NOW(), NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_workflow_state
    AFTER INSERT ON encounters
    FOR EACH ROW
    EXECUTE FUNCTION fn_create_workflow_state();
