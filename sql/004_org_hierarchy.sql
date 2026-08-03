-- ============================================================================
-- AMEXAN Organizational Constitution (OOC)
-- Version: 1.0.0
--
-- This schema implements the full organizational hierarchy for AMEXAN:
--   Country → Region → Network → Hospital → Department → Ward → Team → Actor
--
-- Every healthcare organization — from a solo practice to a national referral
-- center — fits this model. Smaller organizations simply use a subset.
--
-- HMIS ↔ EMR Integration: All clinical data flows through the encounter
-- engine and attaches to the patient timeline. Departments never own data;
-- they contribute to it.
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ORGANIZATION LEVELS
-- ============================================================================
CREATE TYPE org_level AS ENUM (
    'level_0_amexan',
    'level_1_country',
    'level_2_organization',
    'level_3_campus_branch',
    'level_4_department',
    'level_5_unit_ward',
    'level_6_team',
    'level_7_actor'
);

-- ============================================================================
-- ORGANIZATION TYPES
-- ============================================================================
CREATE TYPE org_type AS ENUM (
    'hospital',
    'clinic',
    'laboratory',
    'pharmacy',
    'insurance',
    'training',
    'ministry',
    'ngo',
    'university',
    'research_institute',
    'individual_practice',
    'telemedicine_provider'
);

-- ============================================================================
-- COUNTRIES
-- ============================================================================
CREATE TABLE countries (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(3) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL,
    region      VARCHAR(100),
    continent   VARCHAR(50),
    currency    VARCHAR(3) DEFAULT 'KES',
    language    VARCHAR(10) DEFAULT 'en',
    timezone    VARCHAR(50) DEFAULT 'Africa/Nairobi',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_countries_name ON countries(name);

-- ============================================================================
-- REGIONS (within a country)
-- ============================================================================
CREATE TABLE regions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id  UUID NOT NULL REFERENCES countries(id),
    code        VARCHAR(10) NOT NULL,
    name        VARCHAR(200) NOT NULL,
    type        VARCHAR(50) DEFAULT 'county',
    population  BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_region_country_code UNIQUE (country_id, code)
);

CREATE INDEX idx_regions_country ON regions(country_id);
CREATE INDEX idx_regions_name ON regions(name);

-- ============================================================================
-- NETWORKS (optional — for multi-facility organizations)
-- ============================================================================
CREATE TABLE networks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id  UUID NOT NULL REFERENCES countries(id),
    region_id   UUID REFERENCES regions(id),
    name        VARCHAR(300) NOT NULL,
    type        VARCHAR(50) DEFAULT 'hospital_network',
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_networks_country ON networks(country_id);
CREATE INDEX idx_networks_region ON networks(region_id);

-- ============================================================================
-- ORGANIZATIONS (Hospitals, Clinics, Universities, etc.)
-- ============================================================================
CREATE TABLE organizations (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amx_uid           VARCHAR(50) NOT NULL UNIQUE,
    parent_org_id     UUID REFERENCES organizations(id),
    country_id        UUID NOT NULL REFERENCES countries(id),
    region_id         UUID REFERENCES regions(id),
    network_id        UUID REFERENCES networks(id),
    name              VARCHAR(300) NOT NULL,
    legal_name        VARCHAR(300),
    type              org_type NOT NULL,
    registration_no   VARCHAR(100),
    tax_id            VARCHAR(50),
    license_no        VARCHAR(100),
    status            VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed', 'pending')),
    level             org_level NOT NULL DEFAULT 'level_2_organization',
    description       TEXT,
    website           VARCHAR(500),
    phone             VARCHAR(50),
    email             VARCHAR(200),
    address           JSONB DEFAULT '{}'::jsonb,
    branding          JSONB DEFAULT '{}'::jsonb,
    subscription_tier VARCHAR(20) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise', 'national')),
    max_users         INTEGER DEFAULT 10,
    max_storage_gb    INTEGER DEFAULT 10,
    config            JSONB DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_org_status CHECK (status IN ('active', 'suspended', 'closed', 'pending')),
    CONSTRAINT chk_org_tier CHECK (subscription_tier IN ('starter', 'professional', 'enterprise', 'national'))
);

CREATE INDEX idx_orgs_country ON organizations(country_id);
CREATE INDEX idx_orgs_region ON organizations(region_id);
CREATE INDEX idx_orgs_network ON organizations(network_id);
CREATE INDEX idx_orgs_parent ON organizations(parent_org_id);
CREATE INDEX idx_orgs_type ON organizations(type);
CREATE INDEX idx_orgs_status ON organizations(status);
CREATE INDEX idx_orgs_tier ON organizations(subscription_tier);
CREATE INDEX idx_orgs_amx_uid ON organizations(amx_uid);
CREATE INDEX idx_orgs_name ON organizations USING gin(name gin_trgm_ops);

-- ============================================================================
-- ORGANIZATION HIERARCHY PATH (Materialized Path for fast queries)
-- ============================================================================
CREATE TABLE org_hierarchy (
    org_id        UUID PRIMARY KEY REFERENCES organizations(id),
    path          TEXT NOT NULL,
    depth         INTEGER NOT NULL DEFAULT 0,
    ancestor_ids  UUID[] NOT NULL DEFAULT '{}',
    descendant_ids UUID[] NOT NULL DEFAULT '{}',
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_hierarchy_path ON org_hierarchy USING gin(path);
CREATE INDEX idx_org_hierarchy_depth ON org_hierarchy(depth);

-- ============================================================================
-- DEPARTMENTS (Level 4)
-- ============================================================================
CREATE TABLE departments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    parent_dept_id  UUID REFERENCES departments(id),
    name            VARCHAR(300) NOT NULL,
    type            VARCHAR(50) NOT NULL CHECK (type IN (
        'medical', 'surgical', 'diagnostic', 'support', 'administration', 'education', 'research'
    )),
    specialty       VARCHAR(200),
    head_id         UUID,
    description     TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_depts_org ON departments(org_id);
CREATE INDEX idx_depts_parent ON departments(parent_dept_id);
CREATE INDEX idx_depts_type ON departments(type);
CREATE INDEX idx_depts_active ON departments(active);

-- ============================================================================
-- UNITS / WARDS (Level 5)
-- ============================================================================
CREATE TABLE units (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    dept_id         UUID NOT NULL REFERENCES departments(id),
    name            VARCHAR(300) NOT NULL,
    type            VARCHAR(50) NOT NULL CHECK (type IN (
        'ward', 'icu', 'hdu', 'nicu', 'picu', 'theatre', 'clinic',
        'lab_unit', 'pharmacy_unit', 'radiology_unit', 'emergency',
        'outpatient', 'day_surgery', 'recovery'
    )),
    lead_id         UUID,
    capacity        INTEGER DEFAULT 0,
    current_occupancy INTEGER DEFAULT 0,
    description     TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_units_org ON units(org_id);
CREATE INDEX idx_units_dept ON units(dept_id);
CREATE INDEX idx_units_type ON units(type);

-- ============================================================================
-- TEAMS (Level 6)
-- ============================================================================
CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    dept_id         UUID REFERENCES departments(id),
    unit_id         UUID REFERENCES units(id),
    name            VARCHAR(300) NOT NULL,
    type            VARCHAR(50) NOT NULL CHECK (type IN (
        'ward_round', 'night_shift', 'call_team', 'emergency_team',
        'research_team', 'teaching_team', 'quality_team', 'it_team'
    )),
    lead_id         UUID,
    description     TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_org ON teams(org_id);
CREATE INDEX idx_teams_dept ON teams(dept_id);
CREATE INDEX idx_teams_unit ON teams(unit_id);

-- ============================================================================
-- ORGANIZATIONAL ACTORS (Level 7 — the people)
-- ============================================================================
CREATE TABLE org_actors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    amx_uid         VARCHAR(50) NOT NULL UNIQUE,
    identity_id     UUID,
    user_id         UUID,
    department_id   UUID REFERENCES departments(id),
    unit_id         UUID REFERENCES units(id),
    team_id         UUID REFERENCES teams(id),
    role            VARCHAR(100) NOT NULL,
    title           VARCHAR(200),
    specialty       VARCHAR(200),
    license_no      VARCHAR(100),
    employment_type VARCHAR(50) DEFAULT 'permanent' CHECK (employment_type IN (
        'permanent', 'contract', 'locum', 'part_time', 'intern', 'volunteer', 'consultant'
    )),
    status          VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'inactive', 'suspended', 'terminated', 'on_leave'
    )),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_actors_org ON org_actors(org_id);
CREATE INDEX idx_org_actors_dept ON org_actors(department_id);
CREATE INDEX idx_org_actors_unit ON org_actors(unit_id);
CREATE INDEX idx_org_actors_team ON org_actors(team_id);
CREATE INDEX idx_org_actors_role ON org_actors(role);
CREATE INDEX idx_org_actors_status ON org_actors(status);
CREATE INDEX idx_org_actors_amx ON org_actors(amx_uid);

-- ============================================================================
-- ROLES & PERMISSIONS (Organization-scoped)
-- ============================================================================
CREATE TABLE org_roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    type            VARCHAR(50) NOT NULL CHECK (type IN (
        'system', 'organization', 'department', 'unit', 'team', 'custom'
    )),
    permissions     JSONB NOT NULL DEFAULT '[]'::jsonb,
    inherits_from   UUID REFERENCES org_roles(id),
    max_assignments INTEGER,
    is_assignable   BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_roles_org ON org_roles(org_id);
CREATE INDEX idx_org_roles_type ON org_roles(type);

-- ============================================================================
-- ROLE ASSIGNMENTS
-- ============================================================================
CREATE TABLE org_role_assignments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    actor_id        UUID NOT NULL REFERENCES org_actors(id),
    role_id         UUID NOT NULL REFERENCES org_roles(id),
    department_id   UUID REFERENCES departments(id),
    unit_id         UUID REFERENCES units(id),
    team_id         UUID REFERENCES teams(id),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_role_assignments_org ON org_role_assignments(org_id);
CREATE INDEX idx_role_assignments_actor ON org_role_assignments(actor_id);
CREATE INDEX idx_role_assignments_role ON org_role_assignments(role_id);

-- ============================================================================
-- FACILITY ADMINISTRATION TREE
-- ============================================================================
CREATE TABLE facility_admin (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    actor_id        UUID NOT NULL REFERENCES org_actors(id),
    scope           VARCHAR(50) NOT NULL CHECK (scope IN (
        'organization', 'department', 'unit', 'ward', 'theatre',
        'pharmacy', 'laboratory', 'radiology', 'billing', 'hr',
        'ict', 'procurement', 'stores', 'maintenance', 'security',
        'records', 'mortuary', 'research', 'education'
    )),
    can_create      BOOLEAN NOT NULL DEFAULT FALSE,
    can_read        BOOLEAN NOT NULL DEFAULT TRUE,
    can_update      BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete      BOOLEAN NOT NULL DEFAULT FALSE,
    can_admin       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facility_admin_org ON facility_admin(org_id);
CREATE INDEX idx_facility_admin_actor ON facility_admin(actor_id);
CREATE INDEX idx_facility_admin_scope ON facility_admin(scope);

-- ============================================================================
-- HMIS ↔ EMR INTEGRATION: Encounter Bridge
-- ============================================================================
-- This table bridges HMIS operational data with EMR clinical data
-- Every encounter in HMIS maps to an encounter in EMR

CREATE TABLE encounter_bridge (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id              UUID NOT NULL REFERENCES organizations(id),
    hmis_encounter_id   VARCHAR(100) NOT NULL,
    emr_encounter_id    UUID NOT NULL REFERENCES encounters(id),
    patient_id          UUID NOT NULL REFERENCES patients(id),
    department_id       UUID REFERENCES departments(id),
    unit_id             UUID REFERENCES units(id),
    visit_type          VARCHAR(50) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'synced',
    sync_direction      VARCHAR(20) NOT NULL DEFAULT 'bidirectional' CHECK (sync_direction IN (
        'hmis_to_emr', 'emr_to_hmis', 'bidirectional'
    )),
    last_synced_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sync_version        INTEGER NOT NULL DEFAULT 1,
    conflict_resolution VARCHAR(50) DEFAULT 'emr_wins',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_bridge_hmis UNIQUE (hmis_encounter_id),
    CONSTRAINT uq_bridge_emr UNIQUE (emr_encounter_id)
);

CREATE INDEX idx_bridge_org ON encounter_bridge(org_id);
CREATE INDEX idx_bridge_patient ON encounter_bridge(patient_id);
CREATE INDEX idx_bridge_status ON encounter_bridge(status);
CREATE INDEX idx_bridge_department ON encounter_bridge(department_id);

-- ============================================================================
-- HMIS ↔ EMR INTEGRATION: Department Sync Map
-- ============================================================================
CREATE TABLE department_sync_map (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id              UUID NOT NULL REFERENCES organizations(id),
    hmis_department_id  VARCHAR(100) NOT NULL,
    emr_department_id   UUID NOT NULL REFERENCES departments(id),
    hmis_department_name VARCHAR(300) NOT NULL,
    emr_department_name VARCHAR(300) NOT NULL,
    sync_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
    sync_direction      VARCHAR(20) NOT NULL DEFAULT 'bidirectional',
    last_synced_at      TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_map_org ON department_sync_map(org_id);
CREATE INDEX idx_sync_map_hmis ON department_sync_map(hmis_department_id);

-- ============================================================================
-- HMIS ↔ EMR INTEGRATION: Patient Merge Log
-- ============================================================================
CREATE TABLE patient_merge_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    hmis_patient_id VARCHAR(100) NOT NULL,
    emr_patient_id  UUID NOT NULL REFERENCES patients(id),
    merge_strategy  VARCHAR(50) NOT NULL DEFAULT 'emr_primary' CHECK (merge_strategy IN (
        'hmis_primary', 'emr_primary', 'manual_review', 'auto_merge'
    )),
    merged_by       UUID,
    merged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes           TEXT
);

CREATE INDEX idx_merge_org ON patient_merge_log(org_id);
CREATE INDEX idx_merge_hmis ON patient_merge_log(hmis_patient_id);

-- ============================================================================
-- FUNCTION: Rebuild org hierarchy path
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_rebuild_org_hierarchy()
RETURNS VOID AS $$
DECLARE
    org RECORD;
    path_text TEXT;
    depth_val INTEGER;
    ancestors UUID[];
BEGIN
    FOR org IN
        SELECT id, parent_org_id, name, level
        FROM organizations
        WHERE parent_org_id IS NULL
        ORDER BY created_at
    LOOP
        -- Root organization
        path_text := org.id::TEXT;
        depth_val := 0;
        ancestors := ARRAY[org.id];

        UPDATE org_hierarchy
        SET path = path_text, depth = depth_val, ancestor_ids = ancestors
        WHERE org_id = org.id;

        IF NOT FOUND THEN
            INSERT INTO org_hierarchy (org_id, path, depth, ancestor_ids)
            VALUES (org.id, path_text, depth_val, ancestors);
        END IF;

        -- Recursively build children
        PERFORM fn_build_org_children(org.id, path_text, depth_val, ancestors);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_build_org_children(
    p_parent_id UUID,
    p_path TEXT,
    p_depth INTEGER,
    p_ancestors UUID[]
)
RETURNS VOID AS $$
DECLARE
    child RECORD;
    child_path TEXT;
    child_depth INTEGER;
    child_ancestors UUID[];
BEGIN
    FOR child IN
        SELECT id, name, level
        FROM organizations
        WHERE parent_org_id = p_parent_id
        ORDER BY created_at
    LOOP
        child_path := p_path || '/' || child.id::TEXT;
        child_depth := p_depth + 1;
        child_ancestors := p_ancestors || child.id;

        INSERT INTO org_hierarchy (org_id, path, depth, ancestor_ids)
        VALUES (child.id, child_path, child_depth, child_ancestors)
        ON CONFLICT (org_id) DO UPDATE
        SET path = EXCLUDED.path,
            depth = EXCLUDED.depth,
            ancestor_ids = EXCLUDED.ancestor_ids,
            updated_at = NOW();

        -- Update descendant_ids of ancestors
        UPDATE org_hierarchy
        SET descendant_ids = array_append(descendant_ids, child.id)
        WHERE org_id = ANY(p_ancestors);

        -- Recurse
        PERFORM fn_build_org_children(child.id, child_path, child_depth, child_ancestors);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get full org path for an organization
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_org_path(p_org_id UUID)
RETURNS TABLE (org_id UUID, org_name TEXT, level org_level, depth INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        o.level,
        oh.depth
    FROM organizations o
    JOIN org_hierarchy oh ON oh.org_id = o.id
    WHERE oh.org_id = p_org_id
    ORDER BY oh.depth;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get all descendants of an organization
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_org_descendants(p_org_id UUID)
RETURNS TABLE (org_id UUID, org_name TEXT, type org_type, level org_level) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        o.type,
        o.level
    FROM organizations o
    JOIN org_hierarchy oh ON oh.org_id = o.id
    WHERE oh.ancestor_ids @> ARRAY[p_org_id]::UUID[]
      AND o.id != p_org_id
    ORDER BY oh.depth;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get all actors in an organization (including sub-orgs)
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_org_actors(p_org_id UUID)
RETURNS TABLE (
    actor_id UUID,
    amx_uid VARCHAR,
    role VARCHAR,
    department VARCHAR,
    unit VARCHAR,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        oa.id,
        oa.amx_uid,
        oa.role,
        d.name AS department,
        u.name AS unit,
        oa.status
    FROM org_actors oa
    LEFT JOIN departments d ON d.id = oa.department_id
    LEFT JOIN units u ON u.id = oa.unit_id
    WHERE oa.org_id = p_org_id
       OR oa.org_id IN (
           SELECT org_id FROM org_hierarchy
           WHERE ancestor_ids @> ARRAY[p_org_id]::UUID[]
       );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Check if actor can access a resource within an org
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_can_access(
    p_actor_id UUID,
    p_org_id UUID,
    p_resource VARCHAR,
    p_action VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM org_role_assignments ora
        JOIN org_roles orole ON orole.id = ora.role_id
        WHERE ora.actor_id = p_actor_id
          AND ora.org_id = p_org_id
          AND ora.ended_at IS NULL
          AND orole.permissions @> jsonb_build_array(
              jsonb_build_object('resource', p_resource, 'action', p_action)
          )
    ) INTO has_access;

    RETURN has_access;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Sync HMIS encounter to EMR
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_sync_hmis_to_emr(
    p_hmis_encounter_id VARCHAR,
    p_org_id UUID,
    p_patient_id UUID,
    p_department_id UUID,
    p_unit_id UUID,
    p_visit_type VARCHAR
)
RETURNS UUID AS $$
DECLARE
    v_emr_encounter_id UUID;
    v_bridge_id UUID;
BEGIN
    -- Check if bridge already exists
    SELECT id, emr_encounter_id INTO v_bridge_id, v_emr_encounter_id
    FROM encounter_bridge
    WHERE hmis_encounter_id = p_hmis_encounter_id AND org_id = p_org_id;

    IF v_bridge_id IS NOT NULL AND v_emr_encounter_id IS NOT NULL THEN
        -- Update existing bridge
        UPDATE encounter_bridge
        SET last_synced_at = NOW(), sync_version = sync_version + 1
        WHERE id = v_bridge_id;
        RETURN v_emr_encounter_id;
    END IF;

    -- Create new EMR encounter
    INSERT INTO encounters (
        patient_id, provider_id, department_id, facility_id,
        visit_type, priority, status, clinical_state, reason_for_visit
    )
    SELECT
        p_patient_id,
        NULL, -- provider will be set on first clinical action
        p_department_id,
        p_org_id,
        p_visit_type,
        'routine',
        'active',
        'registered',
        'HMIS-synced encounter'
    INTO v_emr_encounter_id;

    -- Create bridge record
    INSERT INTO encounter_bridge (
        org_id, hmis_encounter_id, emr_encounter_id, patient_id,
        department_id, unit_id, visit_type
    ) VALUES (
        p_org_id, p_hmis_encounter_id, v_emr_encounter_id, p_patient_id,
        p_department_id, p_unit_id, p_visit_type
    );

    RETURN v_emr_encounter_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Auto-rebuild hierarchy on org insert/update
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_org_hierarchy_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark hierarchy as stale
    UPDATE org_hierarchy SET updated_at = NOW() WHERE org_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_org_hierarchy_update
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION fn_org_hierarchy_trigger();

-- ============================================================================
-- SEED: AMEXAN Platform (Level 0)
-- ============================================================================
INSERT INTO organizations (id, amx_uid, name, type, level, subscription_tier, max_users, max_storage_gb)
VALUES ('00000000-0000-0000-0000-000000000000', 'AMX-SYS-00000001', 'AMEXAN Platform', 'ministry', 'level_0_amexan', 'national', 9999, 10000);

-- ============================================================================
-- SEED: Kenya (Level 1)
-- ============================================================================
INSERT INTO countries (code, name, region, continent, currency, language, timezone)
VALUES ('KE', 'Kenya', 'East Africa', 'Africa', 'KES', 'en', 'Africa/Nairobi');

INSERT INTO regions (country_id, code, name, type)
SELECT c.id, '01', 'Nairobi', 'county' FROM countries c WHERE c.code = 'KE';

-- ============================================================================
-- SEED: Sample Hospital (Level 2)
-- ============================================================================
INSERT INTO organizations (amx_uid, parent_org_id, country_id, region_id, name, type, level, subscription_tier, max_users, max_storage_gb, config)
VALUES (
    'AMX-HOS-00000001',
    '00000000-0000-0000-0000-000000000000',
    (SELECT id FROM countries WHERE code = 'KE'),
    (SELECT id FROM regions WHERE code = '01'),
    'Kisii Teaching and Referral Hospital',
    'hospital',
    'level_2_organization',
    'enterprise',
    500,
    500,
    '{"features": ["emr", "hmis", "laboratory", "pharmacy", "radiology", "theatre", "billing", "telemedicine", "research", "education"], "document_header": {"logoUrl": "", "facilityName": "Kisii Teaching and Referral Hospital", "facilityAddress": "", "facilityPhone": "", "facilityEmail": "", "headerTemplate": "", "footerTemplate": ""}, "branding": {"primaryColor": "#2563EB", "secondaryColor": "#1D4ED8", "accentColor": "#06B6D4", "fontFamily": "Inter"}, "clinical": {"defaultWards": [], "defaultClinics": [], "defaultTheatres": [], "diagnosisCodeSystem": "icd_10", "medicationCodeSystem": "local", "labCodeSystem": "local", "imagingCodeSystem": "local", "enableTelemedicine": true, "enableAI": true, "enableResearch": true}, "billing": {"currency": "KES", "taxRate": 0, "consultationFees": {}, "bedCharges": {}, "pharmacyMarkup": 0, "labMarkup": 0, "imagingMarkup": 0, "insuranceAccepted": [], "paymentMethods": ["cash", "card", "mobile_money"]}, "integrations": {"fhirEnabled": true, "hl7Enabled": true, "externalHmisEnabled": true, "aiServicesEnabled": true, "apiEnabled": true}}'
);

-- ============================================================================
-- SEED: Departments (Level 4)
-- ============================================================================
INSERT INTO departments (org_id, name, type, specialty)
SELECT o.id, name, type, specialty FROM (
    SELECT 'Medicine' AS name, 'medical' AS type, 'Internal Medicine' AS specialty UNION ALL
    SELECT 'Surgery', 'surgical', 'General Surgery' UNION ALL
    SELECT 'Pediatrics', 'medical', 'Pediatrics' UNION ALL
    SELECT 'Obstetrics & Gynecology', 'medical', 'OBG' UNION ALL
    SELECT 'Emergency', 'medical', 'Emergency Medicine' UNION ALL
    SELECT 'ICU', 'medical', 'Critical Care' UNION ALL
    SELECT 'HDU', 'medical', 'High Dependency' UNION ALL
    SELECT 'Radiology', 'diagnostic', 'Radiology' UNION ALL
    SELECT 'Laboratory', 'diagnostic', 'Clinical Pathology' UNION ALL
    SELECT 'Pharmacy', 'support', 'Pharmacy' UNION ALL
    SELECT 'Theatre', 'surgical', 'Operating Theatre' UNION ALL
    SELECT 'Administration', 'administration', 'Hospital Administration' UNION ALL
    SELECT 'Finance', 'administration', 'Financial Management' UNION ALL
    SELECT 'HR', 'administration', 'Human Resources' UNION ALL
    SELECT 'ICT', 'administration', 'Information Technology' UNION ALL
    SELECT 'Research', 'research', 'Clinical Research' UNION ALL
    SELECT 'Education', 'education', 'Medical Education' UNION ALL
    SELECT 'Outpatient', 'medical', 'Outpatient Department' UNION ALL
    SELECT 'Nutrition', 'support', 'Clinical Nutrition' UNION ALL
    SELECT 'Physiotherapy', 'support', 'Physiotherapy' UNION ALL
    SELECT 'Mental Health', 'medical', 'Psychiatry' UNION ALL
    SELECT 'Dermatology', 'medical', 'Dermatology' UNION ALL
    SELECT 'Ophthalmology', 'medical', 'Ophthalmology' UNION ALL
    SELECT 'ENT', 'medical', 'Otolaryngology' UNION ALL
    SELECT 'Orthopedics', 'surgical', 'Orthopedic Surgery' UNION ALL
    SELECT 'Neurology', 'medical', 'Neurology' UNION ALL
    SELECT 'Cardiology', 'medical', 'Cardiology' UNION ALL
    SELECT 'Nephrology', 'medical', 'Nephrology' UNION ALL
    SELECT 'Oncology', 'medical', 'Oncology' UNION ALL
    SELECT 'Pulmonology', 'medical', 'Pulmonology' UNION ALL
    SELECT 'Rheumatology', 'medical', 'Rheumatology' UNION ALL
    SELECT 'Gastroenterology', 'medical', 'Gastroenterology' UNION ALL
    SELECT 'Endocrinology', 'medical', 'Endocrinology' UNION ALL
    SELECT 'Infectious Diseases', 'medical', 'Infectious Diseases' UNION ALL
    SELECT 'Neonatology', 'medical', 'Neonatology' UNION ALL
    SELECT 'Anesthesia', 'surgical', 'Anesthesiology'
) AS depts, organizations o
WHERE o.amx_uid = 'AMX-HOS-00000001';

-- ============================================================================
-- SEED: Wards/Units (Level 5)
-- ============================================================================
INSERT INTO units (org_id, dept_id, name, type, capacity)
SELECT o.id, d.id, name, type, capacity FROM (
    SELECT 'Medical Ward I' AS name, 'ward' AS type, 30 AS capacity UNION ALL
    SELECT 'Medical Ward II', 'ward', 25 UNION ALL
    SELECT 'Surgical Ward', 'ward', 20 UNION ALL
    SELECT 'Pediatric Ward', 'ward', 15 UNION ALL
    SELECT 'OBG Ward', 'ward', 12 UNION ALL
    SELECT 'ICU', 'icu', 10 UNION ALL
    SELECT 'HDU', 'hdu', 8 UNION ALL
    SELECT 'NICU', 'nicu', 6 UNION ALL
    SELECT 'Emergency Bay', 'emergency', 5 UNION ALL
    SELECT 'Outpatient Clinic', 'outpatient', 20 UNION ALL
    SELECT 'Day Surgery', 'day_surgery', 4 UNION ALL
    SELECT 'Recovery Room', 'recovery', 6 UNION ALL
    SELECT 'Main Theatre', 'theatre', 3 UNION ALL
    SELECT 'Lab Unit', 'lab_unit', 0 UNION ALL
    SELECT 'Pharmacy Unit', 'pharmacy_unit', 0 UNION ALL
    SELECT 'Radiology Unit', 'radiology_unit', 0 UNION ALL
    SELECT 'CT Scan', 'radiology_unit', 0 UNION ALL
    SELECT 'MRI', 'radiology_unit', 0 UNION ALL
    SELECT 'Blood Bank', 'lab_unit', 0 UNION ALL
    SELECT 'Hematology', 'lab_unit', 0 UNION ALL
    SELECT 'Microbiology', 'lab_unit', 0 UNION ALL
    SELECT 'Chemistry', 'lab_unit', 0 UNION ALL
    SELECT 'Pharmacy', 'pharmacy_unit', 0 UNION ALL
    SELECT 'Physiotherapy Unit', 'clinic', 0 UNION ALL
    SELECT 'Nutrition Unit', 'clinic', 0 UNION ALL
    SELECT 'Social Work Unit', 'clinic', 0 UNION ALL
    SELECT 'Records', 'clinic', 0 UNION ALL
    SELECT 'Mortuary', 'clinic', 0 UNION ALL
    SELECT 'IT Office', 'clinic', 0 UNION ALL
    SELECT 'Security Office', 'clinic', 0 UNION ALL
    SELECT 'Procurement', 'clinic', 0 UNION ALL
    SELECT 'Stores', 'clinic', 0 UNION ALL
    SELECT 'Maintenance', 'clinic', 0 UNION ALL
    SELECT 'Transport', 'clinic', 0 UNION ALL
    SELECT 'Reception', 'clinic', 0 UNION ALL
    SELECT 'Research Office', 'clinic', 0 UNION ALL
    SELECT 'Education Office', 'clinic', 0 UNION ALL
    SELECT 'Quality Assurance', 'clinic', 0 UNION ALL
    SELECT 'Infection Prevention', 'clinic', 0 UNION ALL
    SELECT 'Finance Office', 'clinic', 0 UNION ALL
    SELECT 'HR Office', 'clinic', 0 UNION ALL
    SELECT 'ICT Office', 'clinic', 0
) AS units_data, organizations o, departments d
WHERE o.amx_uid = 'AMX-HOS-00000001'
  AND d.org_id = o.id
  AND (
    (units_data.name = 'Medical Ward I' AND d.name = 'Medicine') OR
    (units_data.name = 'Medical Ward II' AND d.name = 'Medicine') OR
    (units_data.name = 'Surgical Ward' AND d.name = 'Surgery') OR
    (units_data.name = 'Pediatric Ward' AND d.name = 'Pediatrics') OR
    (units_data.name = 'OBG Ward' AND d.name = 'Obstetrics & Gynecology') OR
    (units_data.name = 'ICU' AND d.name = 'ICU') OR
    (units_data.name = 'HDU' AND d.name = 'ICU') OR
    (units_data.name = 'NICU' AND d.name = 'Pediatrics') OR
    (units_data.name = 'Emergency Bay' AND d.name = 'Emergency') OR
    (units_data.name = 'Outpatient Clinic' AND d.name = 'Outpatient') OR
    (units_data.name = 'Day Surgery' AND d.name = 'Surgery') OR
    (units_data.name = 'Recovery Room' AND d.name = 'Surgery') OR
    (units_data.name = 'Main Theatre' AND d.name = 'Theatre') OR
    (units_data.name = 'Lab Unit' AND d.name = 'Laboratory') OR
    (units_data.name = 'Pharmacy Unit' AND d.name = 'Pharmacy') OR
    (units_data.name = 'Radiology Unit' AND d.name = 'Radiology') OR
    (units_data.name = 'CT Scan' AND d.name = 'Radiology') OR
    (units_data.name = 'MRI' AND d.name = 'Radiology') OR
    (units_data.name = 'Blood Bank' AND d.name = 'Laboratory') OR
    (units_data.name = 'Hematology' AND d.name = 'Laboratory') OR
    (units_data.name = 'Microbiology' AND d.name = 'Laboratory') OR
    (units_data.name = 'Chemistry' AND d.name = 'Laboratory') OR
    (units_data.name = 'Pharmacy' AND d.name = 'Pharmacy') OR
    (units_data.name = 'Physiotherapy Unit' AND d.name = 'Physiotherapy') OR
    (units_data.name = 'Nutrition Unit' AND d.name = 'Nutrition') OR
    (units_data.name = 'Social Work Unit' AND d.name = 'Social Work') OR
    (units_data.name = 'Records' AND d.name = 'Administration') OR
    (units_data.name = 'Mortuary' AND d.name = 'Administration') OR
    (units_data.name = 'IT Office' AND d.name = 'ICT') OR
    (units_data.name = 'Security Office' AND d.name = 'Administration') OR
    (units_data.name = 'Procurement' AND d.name = 'Administration') OR
    (units_data.name = 'Stores' AND d.name = 'Administration') OR
    (units_data.name = 'Maintenance' AND d.name = 'Administration') OR
    (units_data.name = 'Transport' AND d.name = 'Administration') OR
    (units_data.name = 'Reception' AND d.name = 'Administration') OR
    (units_data.name = 'Research Office' AND d.name = 'Research') OR
    (units_data.name = 'Education Office' AND d.name = 'Education') OR
    (units_data.name = 'Quality Assurance' AND d.name = 'Administration') OR
    (units_data.name = 'Infection Prevention' AND d.name = 'Administration') OR
    (units_data.name = 'Finance Office' AND d.name = 'Finance') OR
    (units_data.name = 'HR Office' AND d.name = 'HR') OR
    (units_data.name = 'ICT Office' AND d.name = 'ICT')
  );

-- ============================================================================
-- SEED: Teams (Level 6)
-- ============================================================================
INSERT INTO teams (org_id, dept_id, name, type)
SELECT o.id, d.id, name, type FROM (
    SELECT 'Morning Round Team' AS name, 'ward_round' AS type UNION ALL
    SELECT 'Night Shift Team', 'night_shift' UNION ALL
    SELECT 'Emergency Team', 'emergency_team' UNION ALL
    SELECT 'Surgical Team A', 'ward_round' UNION ALL
    SELECT 'Surgical Team B', 'ward_round' UNION ALL
    SELECT 'Research Team', 'research_team' UNION ALL
    SELECT 'Teaching Team', 'teaching_team' UNION ALL
    SELECT 'Quality Team', 'quality_team' UNION ALL
    SELECT 'IT Support Team', 'it_team' UNION ALL
    SELECT 'Pharmacy Team', 'it_team' UNION ALL
    SELECT 'Lab Team', 'it_team' UNION ALL
    SELECT 'Radiology Team', 'it_team' UNION ALL
    SELECT 'Blood Bank Team', 'it_team'
) AS teams_data, organizations o, departments d
WHERE o.amx_uid = 'AMX-HOS-00000001'
  AND d.org_id = o.id
  AND (
    (teams_data.name = 'Morning Round Team' AND d.name IN ('Medicine', 'Surgery', 'Pediatrics', 'OBG')) OR
    (teams_data.name = 'Night Shift Team' AND d.name IN ('Medicine', 'Surgery', 'Emergency', 'ICU')) OR
    (teams_data.name = 'Emergency Team' AND d.name = 'Emergency') OR
    (teams_data.name = 'Surgical Team A' AND d.name = 'Surgery') OR
    (teams_data.name = 'Surgical Team B' AND d.name = 'Surgery') OR
    (teams_data.name = 'Research Team' AND d.name = 'Research') OR
    (teams_data.name = 'Teaching Team' AND d.name IN ('Medicine', 'Surgery', 'Pediatrics', 'OBG')) OR
    (teams_data.name = 'Quality Team' AND d.name = 'Administration') OR
    (teams_data.name = 'IT Support Team' AND d.name = 'ICT') OR
    (teams_data.name = 'Pharmacy Team' AND d.name = 'Pharmacy') OR
    (teams_data.name = 'Lab Team' AND d.name = 'Laboratory') OR
    (teams_data.name = 'Radiology Team' AND d.name = 'Radiology') OR
    (teams_data.name = 'Blood Bank Team' AND d.name = 'Laboratory')
  );

-- ============================================================================
-- SEED: Org Hierarchy
-- ============================================================================
SELECT fn_rebuild_org_hierarchy();

-- ============================================================================
-- SEED: Default Roles
-- ============================================================================
INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Organization Admin', 'Full organization access', 'organization',
    '[{"resource": "*", "actions": ["create", "read", "update", "delete", "admin"], "scope": {"type": "organization"}}]',
    TRUE, 10
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Department Head', 'Department administration', 'department',
    '[{"resource": "department", "actions": ["create", "read", "update", "delete"], "scope": {"type": "department"}}, {"resource": "patient", "actions": ["create", "read", "update"], "scope": {"type": "department"}}, {"resource": "encounter", "actions": ["create", "read", "update"], "scope": {"type": "department"}}]',
    TRUE, 5
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Ward In-charge', 'Ward-level administration', 'unit',
    '[{"resource": "unit", "actions": ["create", "read", "update"], "scope": {"type": "unit"}}, {"resource": "patient", "actions": ["read", "update"], "scope": {"type": "unit"}}, {"resource": "encounter", "actions": ["create", "read", "update"], "scope": {"type": "unit"}}]',
    TRUE, 10
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Clinician', 'Clinical care and documentation', 'department',
    '[{"resource": "patient", "actions": ["create", "read", "update"], "scope": {"type": "department"}}, {"resource": "encounter", "actions": ["create", "read", "update"], "scope": {"type": "department"}}, {"resource": "clinical_note", "actions": ["create", "read", "update"], "scope": {"type": "department"}}, {"resource": "prescription", "actions": ["create", "read", "update"], "scope": {"type": "department"}}, {"resource": "lab_order", "actions": ["create", "read"], "scope": {"type": "department"}}, {"resource": "imaging_order", "actions": ["create", "read"], "scope": {"type": "department"}}]',
    TRUE, 50
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Nurse', 'Nursing care and medication administration', 'unit',
    '[{"resource": "patient", "actions": ["read", "update"], "scope": {"type": "unit"}}, {"resource": "vitals", "actions": ["create", "read", "update"], "scope": {"type": "unit"}}, {"resource": "medication", "actions": ["read", "administer"], "scope": {"type": "unit"}}, {"resource": "clinical_note", "actions": ["create", "read"], "scope": {"type": "unit"}}]',
    TRUE, 20
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Receptionist', 'Front desk and registration', 'organization',
    '[{"resource": "patient", "actions": ["create", "read"], "scope": {"type": "organization"}}, {"resource": "encounter", "actions": ["create", "read"], "scope": {"type": "organization"}}, {"resource": "schedule", "actions": ["create", "read", "update"], "scope": {"type": "organization"}}]',
    TRUE, 10
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Laboratory Technologist', 'Laboratory operations', 'department',
    '[{"resource": "lab_order", "actions": ["read", "update"], "scope": {"type": "department"}}, {"resource": "lab_result", "actions": ["create", "read", "update"], "scope": {"type": "department"}}, {"resource": "patient", "actions": ["read"], "scope": {"type": "department"}}]',
    TRUE, 10
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Pharmacist', 'Pharmacy dispensing and review', 'department',
    '[{"resource": "prescription", "actions": ["read", "update", "approve"], "scope": {"type": "department"}}, {"resource": "pharmacy", "actions": ["create", "read", "update"], "scope": {"type": "department"}}, {"resource": "patient", "actions": ["read"], "scope": {"type": "department"}}]',
    TRUE, 10
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

INSERT INTO org_roles (org_id, name, description, type, permissions, is_assignable, max_assignments)
SELECT o.id, 'Radiographer', 'Imaging operations', 'department',
    '[{"resource": "imaging_order", "actions": ["read", "update"], "scope": {"type": "department"}}, {"resource": "imaging_result", "actions": ["create", "read", "update"], "scope": {"type": "department"}}, {"resource": "patient", "actions": ["read"], "scope": {"type": "department"}}]',
    TRUE, 10
FROM organizations o WHERE o.amx_uid = 'AMX-HOS-00000001';

-- ============================================================================
-- SEED: Facility Admin Scopes
-- ============================================================================
INSERT INTO facility_admin (org_id, actor_id, scope, can_create, can_read, can_update, can_delete, can_admin)
SELECT o.id, NULL, scope, true, true, true, true, true
FROM organizations o, (VALUES
    ('organization'), ('department'), ('unit'), ('ward'), ('theatre'),
    ('pharmacy'), ('laboratory'), ('radiology'), ('billing'), ('hr'),
    ('ict'), ('procurement'), ('stores'), ('maintenance'), ('security'),
    ('records'), ('mortuary'), ('research'), ('education')
) AS scopes(scope)
WHERE o.amx_uid = 'AMX-HOS-00000001';