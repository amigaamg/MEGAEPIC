-- ============================================================================
-- AMEXAN Universal Actor & Identity Constitution (UAE/U?E/UIE/UCE/UCDE/UPrE)
-- Version: 1.0.0
--
-- Transactional relational truth for the actor-centric engines:
--   Actor -> Identity -> Org membership -> Capability -> Consent/Delegation.
--
-- Grounding (UPE/UCE): no engine touches another engine's tables directly.
-- Every object sits behind its owning engine. Stores are written BY engines ONLY.
--
-- Implements SCHEMA-CONSTITUTION.md section 3.1 - 3.4 (PostgreSQL).
-- Volumes 1-3 of the spec: actor, identity, capability, consent, delegation,
-- audit, protocol version. Organization hierarchy lives in 004_org_hierarchy.sql.
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE actor_lifecycle AS ENUM (
    'provisional',      -- registered; identity not yet verified (partial)
    'verified',         -- identity verified to enrolled level
    'frozen',           -- suspended, held
    'dormant',          -- long-inactive
    'closed'            -- de-registered (row kept, audit preserved)
);

CREATE TYPE actor_kind AS ENUM (
    'person', 'organization', 'device', 'system', 'ai_agent'
);

CREATE TYPE identity_ref_type AS ENUM (
    'national_id', 'passport', 'driving_license', 'council_number',
    'license_number', 'voter_id', 'vital', 'other'
);

CREATE TYPE verification_level AS ENUM (
    'l0_unverified', 'l1_self_declared', 'l2_document', 'l3_council', 'l4_biometric'
);

CREATE TYPE consent_status AS ENUM (
    'active', 'withdrawn', 'expired', 'revoked'
);

CREATE TYPE delegation_status AS ENUM (
    'pending', 'active', 'expired', 'revoked', 'terminated'
);

CREATE TYPE capability_type AS ENUM (
    'license', 'certification', 'authorization', 'subscription', 'credential'
);

-- ============================================================================
-- 3.1  ACTOR + IDENTITY
-- ============================================================================

CREATE TABLE actor (
    actor_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amxid               VARCHAR(40) NOT NULL UNIQUE,          -- display id, derived, never identity
    actor_kind          actor_kind NOT NULL DEFAULT 'person',
    lifecycle           actor_lifecycle NOT NULL DEFAULT 'applied',
    status              VARCHAR(50) NOT NULL DEFAULT 'provisional',
    display_name        VARCHAR(300) NOT NULL,
    avatar_uri          TEXT,
    firebase_uid        VARCHAR(200),                         -- auth proof only, not identity
    verification_level  verification_level NOT NULL DEFAULT 'l0_unverified',
    last_verified_at    TIMESTAMPTZ,
    context             JSONB NOT NULL DEFAULT '{}',
    constitution_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    version             INTEGER NOT NULL DEFAULT 1,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_actor_kind     ON actor(actor_kind);
CREATE INDEX idx_actor_life     ON actor(lifecycle);
CREATE INDEX idx_actor_fb_uid   ON actor(firebase_uid) WHERE firebase_uid IS NOT NULL;
CREATE INDEX idx_actor_name     ON actor USING gin (display_name gin_trgm_ops);

CREATE TABLE identity (
    actor_id            UUID PRIMARY KEY REFERENCES actor(actor_id),
    amxid               VARCHAR(32),
    legal_name          VARCHAR(400) NOT NULL,
    preferred_name      VARCHAR(400),
    date_of_birth       DATE,
    sex                 VARCHAR(20),
    gender              VARCHAR(40),
    nationality         VARCHAR(5),
    languages           TEXT[] NOT NULL DEFAULT '{}',
    privacy_profile     JSONB NOT NULL DEFAULT '{}',
    consent_profile     JSONB NOT NULL DEFAULT '{}',
    verification_level  verification_level NOT NULL DEFAULT 'l1_unverified',
    version             INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_identity_nationality ON identity(nationality);

CREATE TABLE identity_reference (
    ref_id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id            UUID NOT NULL REFERENCES actor(actor_id),
    ref_type            identity_ref_type NOT NULL,
    country             VARCHAR(2),
    issuer              VARCHAR(200),
    ref_number          VARCHAR(200) NOT NULL,
    verified            BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at         TIMESTAMPTZ,
    expiry              DATE,
    status              VARCHAR(30) NOT NULL DEFAULT 'pending',
    version             INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (ref_type, country, ref_number)
);

CREATE INDEX idx_ref_actor ON identity_reference(actor_id);
CREATE INDEX idx_ref_verified ON identity_reference(actor_id, verified);

CREATE TABLE auth_method (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id            UUID NOT NULL REFERENCES actor(actor_id),
    provider            VARCHAR(60) NOT NULL,   -- firebase_email, phone, oauth2, passkey
    issuer              VARCHAR(120),
    subject             VARCHAR(300),
    verified            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_actor ON auth_method(actor_id);
CREATE INDEX idx_auth_provider ON auth_method(provider, issuer);

CREATE TABLE actor_summary (
    actor_id            UUID PRIMARY KEY REFERENCES actor(actor_id),
    trust_score         NUMERIC(5,2) NOT NULL DEFAULT 0,
    last_session_at     TIMESTAMPTZ,
    last_seen_ip_hash   VARCHAR(64),
    active_sessions     INTEGER NOT NULL DEFAULT 0,
    mfa_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_language  VARCHAR(10),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3.3  CAPABILITY  (Capability Engine — UCE)
-- ============================================================================

CREATE TABLE capability (
    capability_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    capability_type     capability_type NOT NULL DEFAULT 'credential',
    owner_kind           VARCHAR(20) NOT NULL DEFAULT 'actor',  -- actor | organization
    owner_id            UUID NOT NULL,
    version             VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    validity_days       INTEGER,
    scope               JSONB NOT NULL DEFAULT '{}',
    category            VARCHAR(60),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cap_owner ON capability(owner_kind, owner_id);
CREATE INDEX idx_cap_name  ON capability(name);

CREATE TABLE capability_grant (
    grant_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capability_id       UUID NOT NULL REFERENCES capability(capability_id),
    grantee_kind        VARCHAR(20) NOT NULL DEFAULT 'actor',   -- actor | organization
    grantee_id          UUID NOT NULL,
    source              JSONB,
    granted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_until      TIMESTAMPTZ,
    status              VARCHAR(30) NOT NULL DEFAULT 'active',
    issued_by           UUID,
    version             INTEGER NOT NULL DEFAULT 1,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grant_cap    ON capability_grant(capability_id);
CREATE INDEX idx_grant_grantee ON capability_grant(grantee_kind, grantee_id);
CREATE INDEX idx_grant_status ON capability_grant(grantee_kind, grantee_id, status);

CREATE TABLE capability_dependency (
    capability_id           UUID NOT NULL REFERENCES capability(capability_id),
    requires_capability_id  UUID NOT NULL REFERENCES capability(capability_id),
    PRIMARY KEY (capability_id, requires_capability_id)
);

-- ============================================================================
-- 3.4  CONSENT & DELEGATION  (Consent & Delegation Engine — UCDE)
-- ============================================================================

CREATE TABLE consent (
    consent_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grantor_actor_id    UUID NOT NULL REFERENCES actor(actor_id),
    recipient_actor_id  UUID REFERENCES actor(actor_id),
    organization_id     UUID REFERENCES organizations(id),
    resource            VARCHAR(300) NOT NULL,       -- e.g. 'medical-record'
    purpose             VARCHAR(400) NOT NULL,
    scope               JSONB NOT NULL DEFAULT '{}',
    validity            JSONB,
    digital_signature   TEXT,                          -- verified reference
    status              consent_status NOT NULL DEFAULT 'active',
    granted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at          TIMESTAMPTZ,
    version             INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_grantor    ON consent(grantor_actor_id);
CREATE INDEX idx_consent_recipient  ON consent(recipient_actor_id);
CREATE INDEX idx_consent_resource   ON consent(resource);
CREATE INDEX idx_consent_status     ON consent(status);

CREATE TABLE delegation (
    delegation_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegator_actor_id     UUID NOT NULL REFERENCES actor(actor_id),
    delegate_actor_id      UUID NOT NULL REFERENCES actor(actor_id),
    authority              VARCHAR(300) NOT NULL,
    scope                  JSONB NOT NULL DEFAULT '{}',
    limitations            JSONB NOT NULL DEFAULT '{}',
    start_time             TIMESTAMPTZ NOT NULL,
    end_time               TIMESTAMPTZ,
    status                 delegation_status NOT NULL DEFAULT 'pending',
    version                INTEGER NOT NULL DEFAULT 1,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_del_delegator ON delegation(delegator_actor_id);
CREATE INDEX idx_del_delegate  ON delegation(delegate_actor_id);
CREATE INDEX idx_del_status    ON delegation(status);

-- ============================================================================
-- AUDIT  (append-only for UCDE + UAE)
-- ============================================================================
CREATE TABLE audit_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id            UUID REFERENCES actor(actor_id),
    entity              VARCHAR(100) NOT NULL,
    entity_id           UUID,
    event               VARCHAR(200) NOT NULL,
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash             VARCHAR(64),
    device              VARCHAR(300),
    metadata            JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_audit_actor   ON audit_log(actor_id, occurred_at);
CREATE INDEX idx_audit_entity  ON audit_log(entity, entity_id);
CREATE INDEX idx_audit_event   ON audit_log(event, occurred_at);

-- ============================================================================
-- PROTOCOL VERSION  (Protocol Version — UPVE)
-- ============================================================================
CREATE TABLE protocol_version (
    protocol_version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease             VARCHAR(200) NOT NULL,
    country             VARCHAR(2) NOT NULL,
    org_id              UUID REFERENCES organizations(id),
    version             VARCHAR(32) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    effective_date      DATE,
    expired_date        DATE,
    supersedes          UUID REFERENCES protocol_version(protocol_version_id),
    superseded_by       UUID REFERENCES protocol_version(protocol_version_id),
    definition          JSONB NOT NULL DEFAULT '{}',
    published_by        UUID REFERENCES actor(actor_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_protocol_version ON protocol_version(disease, country, org_id, status);
CREATE INDEX idx_protocol_supersedes ON protocol_version(superseded_by);

-- ============================================================================
-- PREFERENCE  (Universal Preference Engine — UPrE)
-- ============================================================================
CREATE TABLE preference (
    preference_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id            UUID NOT NULL REFERENCES actor(actor_id),
    category            VARCHAR(60) NOT NULL,        -- theme, layout, language, units, documentation_style, accessibility, notification
    preference_key      VARCHAR(120) NOT NULL,
    scope               VARCHAR(40) NOT NULL DEFAULT 'actor',  -- system | country | region | organization | actor | session
    value               JSONB NOT NULL,
    priority            INTEGER NOT NULL DEFAULT 0,
    source              VARCHAR(40) NOT NULL DEFAULT 'actor',
    inherited_from      UUID,
    version             INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (actor_id, category, preference_key)
);

CREATE INDEX idx_pref_actor ON preference(actor_id);
CREATE INDEX idx_pref_scope ON preference(scope);

-- ============================================================================
-- MARKETPLACE  (Universal Marketplace Engine — UME)
-- ============================================================================
CREATE TABLE marketplace_module (
    module_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publisher_id        UUID REFERENCES actor(actor_id),
    publisher_org_id    UUID REFERENCES organizations(id),
    name                VARCHAR(200) NOT NULL,
    category            VARCHAR(60) NOT NULL,
    module_type         VARCHAR(40) NOT NULL DEFAULT 'capability_pack',
    version             VARCHAR(32) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'draft',
    dependencies        JSONB NOT NULL DEFAULT '[]',
    capabilities        JSONB NOT NULL DEFAULT '[]',
    permissions         JSONB NOT NULL DEFAULT '[]',
    knowledge           JSONB NOT NULL DEFAULT '[]',
    requires_consent    BOOLEAN NOT NULL DEFAULT FALSE,
    digital_signature   TEXT,
    license             JSONB,
    pricing             JSONB NOT NULL DEFAULT '{}',
    verified_at         TIMESTAMPTZ,
    published_at        TIMESTAMPTZ,
    constitution_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mp_category ON marketplace_module(category);
CREATE INDEX idx_mp_status   ON marketplace_module(status);

-- ============================================================================
-- COMPETENCY + LEARNING  (Universal Learning & Competency Engine — ULCE)
-- ============================================================================
CREATE TABLE competency (
    capability_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id              UUID NOT NULL REFERENCES actor(actor_id),
    domain_id              VARCHAR(60) NOT NULL,     -- clinical | surgery | research | education | digital
    level_id                VARCHAR(20) NOT NULL DEFAULT 'novice',
    evidence              JSONB NOT NULL DEFAULT '{}',
    cases_completed        INTEGER NOT NULL DEFAULT 0,
    procedures             JSONB NOT NULL DEFAULT '{}',
    assessments            JSONB NOT NULL DEFAULT '{}',
    mentor_validation       BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comp_actor ON competency(actor_id);

CREATE TABLE learning_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id             UUID NOT NULL REFERENCES actor(actor_id),
    encounter_id         UUID,
    competency_id        UUID REFERENCES competency(capability_id),
    kind                 VARCHAR(40) NOT NULL,      -- case | reflection | cpd | simulation | teaching | research
    learning_goal        JSONB NOT NULL DEFAULT '{}',
    reflection           JSONB NOT NULL DEFAULT '{}',
    mentor_review        JSONB NOT NULL DEFAULT '{}',
    status               VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learn_actor ON learning_log(actor_id);
CREATE INDEX idx_learn_encounter ON learning_log(encounter_id);