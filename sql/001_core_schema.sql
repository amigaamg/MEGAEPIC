-- ============================================================================
-- AMEXAN Clinical OS - PostgreSQL Schema
-- Version: 1.0.0
-- 
-- This schema implements the seven-layer clinical object model:
--   1. ENTITIES - Core domain nouns
--   2. OBSERVATIONS - All clinical data as structured observations
--   3. EVENTS - Immutable state transitions
--   4. RULES - Clinical Rules Language repository
--   5. INFERENCES - Bayesian evidence relationships
--   6. WORKFLOWS - Encounter state machines
--   7. DOCUMENTS - Rendered views of observations
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- ENTITIES - All domain nouns
-- ============================================================================
CREATE TABLE entities (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type   VARCHAR(50) NOT NULL,
    version       INTEGER NOT NULL DEFAULT 1,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted       BOOLEAN NOT NULL DEFAULT FALSE,
    metadata      JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT chk_entity_type CHECK (entity_type IN (
        'patient', 'encounter', 'clinician', 'facility', 'department',
        'disease', 'symptom', 'sign', 'drug', 'procedure',
        'investigation', 'diagnosis', 'allergy', 'document'
    ))
);

CREATE INDEX idx_entities_type ON entities(entity_type) WHERE NOT deleted;
CREATE INDEX idx_entities_created ON entities(created_at DESC);

-- ============================================================================
-- PATIENTS (extends entities)
-- ============================================================================
CREATE TABLE patients (
    id               UUID PRIMARY KEY REFERENCES entities(id),
    hospital_number  VARCHAR(50) UNIQUE NOT NULL,
    national_id      VARCHAR(50),
    given_name       VARCHAR(200) NOT NULL,
    middle_name      VARCHAR(200),
    family_name      VARCHAR(200) NOT NULL,
    date_of_birth    DATE,
    age              INTEGER,
    age_unit         VARCHAR(10) DEFAULT 'years',
    sex_at_birth     VARCHAR(20) NOT NULL,
    gender_identity  VARCHAR(50),
    residence        TEXT,
    occupation       VARCHAR(200),
    phone            VARCHAR(50),
    email            VARCHAR(200),
    next_of_kin_name VARCHAR(200),
    next_of_kin_phone VARCHAR(50),
    next_of_kin_relation VARCHAR(100),
    informant        VARCHAR(200),
    informant_relation VARCHAR(100),
    reliability      VARCHAR(50) DEFAULT 'reliable',
    religion         VARCHAR(100),
    preferred_language VARCHAR(100),
    interpreter_required BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_sex CHECK (sex_at_birth IN ('male', 'female', 'intersex')),
    CONSTRAINT chk_reliability CHECK (reliability IN ('reliable', 'partially_reliable', 'unreliable')),
    CONSTRAINT chk_age_unit CHECK (age_unit IN ('days', 'months', 'years'))
);

CREATE INDEX idx_patients_name ON patients USING gin (given_name gin_trgm_ops, family_name gin_trgm_ops);
CREATE INDEX idx_patients_hospital_number ON patients(hospital_number);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);

-- ============================================================================
-- PATIENT CONTEXT (derived clinical context)
-- ============================================================================
CREATE TABLE patient_contexts (
    patient_id         UUID PRIMARY KEY REFERENCES patients(id),
    age_category       VARCHAR(20) NOT NULL,
    is_pregnant        BOOLEAN DEFAULT FALSE,
    pregnancy_status   VARCHAR(20),
    has_uterus         BOOLEAN DEFAULT TRUE,
    is_postpartum      BOOLEAN DEFAULT FALSE,
    is_breastfeeding   BOOLEAN DEFAULT FALSE,
    is_menstruating    BOOLEAN DEFAULT FALSE,
    lmp                DATE,
    weight_kg          DECIMAL(5,2),
    height_cm          DECIMAL(5,2),
    bmi                DECIMAL(4,1),
    requires_guardian  BOOLEAN DEFAULT FALSE,
    derived_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_age_category CHECK (age_category IN (
        'neonate', 'infant', 'child', 'adolescent', 'adult', 'older_adult'
    )),
    CONSTRAINT chk_pregnancy CHECK (pregnancy_status IN (
        'pregnant', 'not_pregnant', 'unknown', 'postpartum', 'post_abortion'
    ))
);

-- ============================================================================
-- FACILITIES & DEPARTMENTS
-- ============================================================================
CREATE TABLE facilities (
    id          UUID PRIMARY KEY,
    name        VARCHAR(300) NOT NULL,
    type        VARCHAR(50),
    region      VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
    id           UUID PRIMARY KEY,
    facility_id  UUID NOT NULL REFERENCES facilities(id),
    name         VARCHAR(300) NOT NULL,
    specialty    VARCHAR(100),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CLINICIANS
-- ============================================================================
CREATE TABLE clinicians (
    id              UUID PRIMARY KEY,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    given_name      VARCHAR(200) NOT NULL,
    family_name     VARCHAR(200) NOT NULL,
    title           VARCHAR(50),
    specialization  VARCHAR(200),
    license_number  VARCHAR(100),
    department_id   UUID REFERENCES departments(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ENCOUNTERS - The universal encounter object
-- ============================================================================
CREATE TABLE encounters (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id        UUID NOT NULL REFERENCES patients(id),
    provider_id       UUID NOT NULL REFERENCES clinicians(id),
    department_id     UUID NOT NULL REFERENCES departments(id),
    facility_id       UUID NOT NULL REFERENCES facilities(id),
    visit_type        VARCHAR(50) NOT NULL,
    priority          VARCHAR(20) NOT NULL DEFAULT 'routine',
    status            VARCHAR(20) NOT NULL DEFAULT 'active',
    clinical_state    VARCHAR(30) NOT NULL DEFAULT 'registered',
    reason_for_visit  TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata          JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT chk_visit_type CHECK (visit_type IN (
        'outpatient', 'emergency', 'inpatient', 'ward_round', 'follow_up',
        'procedure', 'telemedicine', 'antenatal', 'postnatal',
        'home_visit', 'referral', 'mdt'
    )),
    CONSTRAINT chk_priority CHECK (priority IN (
        'immediate', 'emergency', 'urgent', 'semi_urgent', 'routine', 'elective'
    )),
    CONSTRAINT chk_encounter_status CHECK (status IN (
        'active', 'paused', 'completed', 'cancelled'
    )),
    CONSTRAINT chk_clinical_state CHECK (clinical_state IN (
        'registered', 'triage', 'history', 'examination', 'investigation',
        'diagnosis', 'treatment', 'monitoring', 'disposition',
        'follow_up', 'completed', 'cancelled'
    ))
);

CREATE INDEX idx_encounters_patient ON encounters(patient_id, created_at DESC);
CREATE INDEX idx_encounters_provider ON encounters(provider_id, created_at DESC);
CREATE INDEX idx_encounters_status ON encounters(status) WHERE status = 'active';
CREATE INDEX idx_encounters_department ON encounters(department_id, created_at DESC);
CREATE INDEX idx_encounters_date ON encounters(created_at DESC);

-- ============================================================================
-- OBSERVATIONS - EVERYTHING is an observation
-- ============================================================================
CREATE TABLE observations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id    UUID NOT NULL REFERENCES encounters(id),
    entity_id       UUID,
    concept_id      VARCHAR(100) NOT NULL,
    value           JSONB NOT NULL,
    unit            VARCHAR(50),
    source          VARCHAR(30) NOT NULL DEFAULT 'clinician',
    confidence      DECIMAL(3,2) DEFAULT 1.0,
    observer_id     UUID REFERENCES clinicians(id),
    time_observed   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    version         INTEGER NOT NULL DEFAULT 1,
    metadata        JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT chk_observation_source CHECK (source IN (
        'patient', 'clinician', 'device', 'lab', 'referral', 'system'
    )),
    CONSTRAINT chk_observation_status CHECK (status IN (
        'active', 'resolved', 'unknown', 'withdrawn'
    ))
);

CREATE INDEX idx_observations_encounter ON observations(encounter_id);
CREATE INDEX idx_observations_concept ON observations(concept_id);
CREATE INDEX idx_observations_time ON observations(time_observed DESC);
CREATE INDEX idx_observations_encounter_concept ON observations(encounter_id, concept_id);
CREATE INDEX idx_observations_value ON observations USING gin(value jsonb_path_ops);

-- ============================================================================
-- CLINICAL EVENTS - Immutable audit trail
-- ============================================================================
CREATE TABLE clinical_events (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id  UUID NOT NULL REFERENCES encounters(id),
    event_type    VARCHAR(50) NOT NULL,
    payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id       UUID REFERENCES clinicians(id),
    version       INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_events_encounter ON clinical_events(encounter_id, timestamp);
CREATE INDEX idx_events_type ON clinical_events(event_type);
CREATE INDEX idx_events_timestamp ON clinical_events(timestamp DESC);

-- ============================================================================
-- = RULES REPOSITORY - CRL Rules Storage
-- ============================================================================
CREATE TABLE rules (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          VARCHAR(20) UNIQUE NOT NULL,
    name          VARCHAR(300) NOT NULL,
    description   TEXT,
    category      VARCHAR(10) NOT NULL,
    priority      INTEGER NOT NULL DEFAULT 50,
    status        VARCHAR(20) NOT NULL DEFAULT 'active',
    version       VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    conditions    JSONB NOT NULL DEFAULT '[]'::jsonb,
    actions       JSONB NOT NULL DEFAULT '[]'::jsonb,
    exceptions    JSONB DEFAULT '[]'::jsonb,
    dependencies  TEXT[] DEFAULT '{}',
    outputs       TEXT[] DEFAULT '{}',
    evidence      TEXT,
    tests         JSONB DEFAULT '[]'::jsonb,
    metadata      JSONB DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_rule_category CHECK (category IN (
        'SYS', 'PAT', 'ENC', 'CLI', 'HPI', 'EXM', 'INV', 'DX', 'MGT', 'DOC', 'AI', 'QLY'
    )),
    CONSTRAINT chk_rule_priority CHECK (priority BETWEEN 0 AND 100),
    CONSTRAINT chk_rule_status CHECK (status IN (
        'active', 'inactive', 'deprecated', 'test_mode'
    ))
);

CREATE INDEX idx_rules_category ON rules(category, priority DESC);
CREATE INDEX idx_rules_status ON rules(status) WHERE status = 'active';
CREATE INDEX idx_rules_code ON rules(code);

-- ============================================================================
-- RULE EXECUTION LOG - Audit of rule triggers
-- ============================================================================
CREATE TABLE rule_executions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id       UUID NOT NULL REFERENCES rules(id),
    encounter_id  UUID NOT NULL REFERENCES encounters(id),
    triggered     BOOLEAN NOT NULL,
    actions_count INTEGER DEFAULT 0,
    error         TEXT,
    executed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rule_exec_encounter ON rule_executions(encounter_id);
CREATE INDEX idx_rule_exec_rule ON rule_executions(rule_id);

-- ============================================================================
-- INFERENCES - Bayesian evidence relationships
-- ============================================================================
CREATE TABLE clinical_inferences (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id      VARCHAR(100) NOT NULL,
    disease_name    VARCHAR(300) NOT NULL,
    observation_concept VARCHAR(100) NOT NULL,
    observation_text    TEXT,
    likelihood_ratio    DECIMAL(8,2),
    weight              DECIMAL(5,2) DEFAULT 0,
    confidence          DECIMAL(3,2) DEFAULT 0.5,
    direction           VARCHAR(20) NOT NULL,
    source              TEXT,
    evidence_level      VARCHAR(20),
    
    CONSTRAINT chk_inference_direction CHECK (direction IN (
        'supports', 'against', 'strongly_supports', 'excludes', 'rules_out', 'rules_in'
    ))
);

CREATE INDEX idx_inferences_disease ON clinical_inferences(disease_id);
CREATE INDEX idx_inferences_observation ON clinical_inferences(observation_concept);

-- ============================================================================
-- WORKFLOW STATES - Encounter state machines
-- ============================================================================
CREATE TABLE workflow_states (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id  UUID NOT NULL REFERENCES encounters(id),
    state         VARCHAR(30) NOT NULL,
    entered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    exited_at     TIMESTAMPTZ,
    entered_by    UUID REFERENCES clinicians(id),
    metadata      JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_workflow_encounter ON workflow_states(encounter_id, entered_at);

-- ============================================================================
-- STATE TRANSITIONS - Allowed paths
-- ============================================================================
CREATE TABLE state_transitions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_state    VARCHAR(30) NOT NULL,
    to_state      VARCHAR(30) NOT NULL,
    required_checks TEXT[] DEFAULT '{}',
    blocking_checks TEXT[] DEFAULT '{}',
    auto_trigger  BOOLEAN DEFAULT FALSE,
    
    UNIQUE(from_state, to_state)
);

-- ============================================================================
-- DOCUMENTS - Rendered views
-- ============================================================================
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id    UUID NOT NULL REFERENCES encounters(id),
    document_type   VARCHAR(50) NOT NULL,
    content         JSONB NOT NULL,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by    UUID REFERENCES clinicians(id),
    status          VARCHAR(20) DEFAULT 'draft',
    version         INTEGER NOT NULL DEFAULT 1,
    signed_at       TIMESTAMPTZ,
    signed_by       UUID REFERENCES clinicians(id),
    
    CONSTRAINT chk_document_type CHECK (document_type IN (
        'soap_note', 'progress_note', 'discharge_summary', 'referral_letter',
        'clinic_note', 'operative_note', 'consultation_note', 'death_summary',
        'prescription', 'certificate'
    )),
    CONSTRAINT chk_document_status CHECK (status IN ('draft', 'final', 'signed', 'amended'))
);

CREATE INDEX idx_documents_encounter ON documents(encounter_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- ============================================================================
-- DOCUMENT SECTIONS
-- ============================================================================
CREATE TABLE document_sections (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id   UUID NOT NULL REFERENCES documents(id),
    section_id    VARCHAR(100) NOT NULL,
    title         VARCHAR(300) NOT NULL,
    content       TEXT,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    required      BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_doc_sections_document ON document_sections(document_id, sort_order);

-- ============================================================================
-- QUEUE SYSTEM
-- ============================================================================
CREATE TABLE encounter_queues (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id  UUID UNIQUE NOT NULL REFERENCES encounters(id),
    queue_type    VARCHAR(50) NOT NULL,
    department_id UUID REFERENCES departments(id),
    priority      INTEGER NOT NULL DEFAULT 0,
    status        VARCHAR(20) NOT NULL DEFAULT 'waiting',
    entered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at    TIMESTAMPTZ,
    completed_at  TIMESTAMPTZ,
    
    CONSTRAINT chk_queue_type CHECK (queue_type IN (
        'emergency', 'outpatient', 'ward', 'clinic', 'icu', 'theatre', 'telemedicine'
    )),
    CONSTRAINT chk_queue_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_queues_type_status ON encounter_queues(queue_type, status, priority DESC);

-- ============================================================================
= PATIENT LIFELINE - Longitudinal timeline
-- ============================================================================
CREATE TABLE patient_lifeline (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id    UUID NOT NULL REFERENCES patients(id),
    event_type    VARCHAR(50) NOT NULL,
    encounter_id  UUID REFERENCES encounters(id),
    payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_lifeline_event CHECK (event_type IN (
        'registration', 'encounter', 'admission', 'discharge', 'transfer',
        'diagnosis', 'procedure', 'lab_result', 'imaging_result',
        'prescription', 'allergy', 'follow_up', 'outcome', 'death'
    ))
);

CREATE INDEX idx_lifeline_patient ON patient_lifeline(patient_id, occurred_at DESC);

-- ============================================================================
-- INSERT DEFAULT STATE TRANSITIONS
-- ============================================================================
INSERT INTO state_transitions (from_state, to_state) VALUES
    ('registered', 'triage'),
    ('triage', 'history'),
    ('history', 'examination'),
    ('examination', 'investigation'),
    ('investigation', 'diagnosis'),
    ('diagnosis', 'treatment'),
    ('treatment', 'monitoring'),
    ('monitoring', 'disposition'),
    ('disposition', 'follow_up'),
    ('follow_up', 'completed'),
    ('registered', 'history'),
    ('registered', 'cancelled'),
    ('triage', 'diagnosis'),
    ('history', 'diagnosis'),
    ('examination', 'diagnosis'),
    ('examination', 'treatment'),
    ('diagnosis', 'completed');

-- ============================================================================
-- VIOLATIONS - Clinical safety violations log
-- ============================================================================
CREATE TABLE clinical_violations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id  UUID NOT NULL REFERENCES encounters(id),
    rule_id       UUID REFERENCES rules(id),
    violation_type VARCHAR(50) NOT NULL,
    description   TEXT NOT NULL,
    severity      VARCHAR(20) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at   TIMESTAMPTZ,
    resolved_by   UUID REFERENCES clinicians(id),
    
    CONSTRAINT chk_violation_severity CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

CREATE INDEX idx_violations_encounter ON clinical_violations(encounter_id);
CREATE INDEX idx_violations_severity ON clinical_violations(severity) WHERE resolved_at IS NULL;

-- ============================================================================
-- MATERIALIZED VIEW: Active Encounters Summary
-- ============================================================================
CREATE MATERIALIZED VIEW mv_active_encounters AS
SELECT 
    e.id AS encounter_id,
    p.hospital_number,
    p.given_name || ' ' || p.family_name AS patient_name,
    p.sex_at_birth,
    pc.age_category,
    pc.is_pregnant,
    e.visit_type,
    e.priority,
    e.clinical_state,
    e.created_at AS encounter_started,
    c.given_name || ' ' || c.family_name AS provider_name,
    d.name AS department_name,
    f.name AS facility_name
FROM encounters e
JOIN patients p ON p.id = e.patient_id
LEFT JOIN patient_contexts pc ON pc.patient_id = e.patient_id
JOIN clinicians c ON c.id = e.provider_id
JOIN departments d ON d.id = e.department_id
JOIN facilities f ON f.id = e.facility_id
WHERE e.status = 'active'
ORDER BY e.priority DESC, e.created_at ASC;

CREATE UNIQUE INDEX idx_mv_active_enc ON mv_active_encounters(encounter_id);

-- ============================================================================
-- FUNCTION: Update patient context on registration
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_update_patient_context()
RETURNS TRIGGER AS $$
DECLARE
    v_age_days INTEGER;
    v_age_cat VARCHAR(20);
BEGIN
    -- Calculate age in days if DOB available
    IF NEW.date_of_birth IS NOT NULL THEN
        v_age_days := EXTRACT(DAY FROM (CURRENT_DATE - NEW.date_of_birth));
        
        -- Determine age category
        IF v_age_days < 28 THEN
            v_age_cat := 'neonate';
        ELSIF v_age_days < 365 THEN
            v_age_cat := 'infant';
        ELSIF v_age_days < 3653 THEN
            v_age_cat := 'child';
        ELSIF v_age_days < 6935 THEN
            v_age_cat := 'adolescent';
        ELSIF v_age_days < 23741 THEN
            v_age_cat := 'adult';
        ELSE
            v_age_cat := 'older_adult';
        END IF;
    ELSE
        -- Fall back to age field
        v_age_cat := CASE 
            WHEN NEW.age <= 0 THEN 'neonate'
            WHEN NEW.age <= 1 THEN 'infant'
            WHEN NEW.age <= 9 THEN 'child'
            WHEN NEW.age <= 19 THEN 'adolescent'
            WHEN NEW.age <= 64 THEN 'adult'
            ELSE 'older_adult'
        END;
    END IF;
    
    -- Upsert patient context
    INSERT INTO patient_contexts (patient_id, age_category)
    VALUES (NEW.id, v_age_cat)
    ON CONFLICT (patient_id) 
    DO UPDATE SET age_category = v_age_cat, derived_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_patient_context
    AFTER INSERT OR UPDATE OF date_of_birth, age ON patients
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_patient_context();

-- ============================================================================
-- FUNCTION: Record encounter events
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_record_encounter_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO clinical_events (encounter_id, event_type, payload, user_id)
    VALUES (
        NEW.id,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'encounter.started'
            WHEN NEW.status = 'completed' THEN 'encounter.completed'
            WHEN NEW.status = 'cancelled' THEN 'encounter.cancelled'
            ELSE 'encounter.updated'
        END,
        jsonb_build_object(
            'from_status', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
            'to_status', NEW.status,
            'from_state', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.clinical_state END,
            'to_state', NEW.clinical_state
        ),
        NEW.provider_id
    );
    
    -- Update lifeline
    INSERT INTO patient_lifeline (patient_id, event_type, encounter_id, occurred_at)
    VALUES (
        NEW.patient_id,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'encounter'
            WHEN NEW.status = 'completed' THEN 'encounter'
            ELSE 'encounter'
        END,
        NEW.id,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_encounter_event
    AFTER INSERT OR UPDATE OF status, clinical_state ON encounters
    FOR EACH ROW
    EXECUTE FUNCTION fn_record_encounter_event();
