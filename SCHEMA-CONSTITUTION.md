# AMEXAN Storage Schema Constitution

Constitutional storage layer for the Universal Actor, Identity, Organization, Capability,
Presentation, Consent & Delegation, Preference, Marketplace, Protocol Version, and Learning
& Competency engines — mapped onto the three stores:

- **Cloud Firestore** — actor/clinical/domain state, collections + subcollections.
- **PostgreSQL** — transactional, relational truth: identity, memberships, workflows, audit.
- **Neo4j** — graph knowledge: relationships, reasoning, competence, referrals.

**Grounding rule (UPE/UCE):** interfaces never query stores directly. Engines resolve
the Actor → Identity → Organization → Capability → Workspace chain, and stores are written
**by engines only**. Every object carries `constitutionVersion`, `createdAt`, `updatedAt`,
and an audit pointer.

---

## 0. Canonical identity key

| Key | Usage | Notes |
|----|----|----|
| `actorId` (UUIDv7/ULID) | primary key everywhere | internal, immutable, never reused |
| `amxid` (display) | secondary index | e.g. `AMX-8F32A91B`; derived from actorId, never stored as identity |
| `firebaseUid` | link only | authentication proof, **never** an identity |
| `orgId` | UUID | org canonical id; `AMXORG-…` is display only |

One Actor → one actorId → many contexts (roles). Contexts create Roles, never Actors (UAE-002/003).

---

## 2. Cloud Firestore (operational + domain state)

Design: top-level **root collections** for things that exist globally and independently;
**subcollections** under the object that owns them. Deep subcollection nesting ≤ 3.

### 2.1 Actor core

```
actors/{actorId}                      # Actor object (the root — everything derives)
  { actorId, amxid, actorType, status, displayName, createdAt, updatedAt,
    lastVerifiedAt, constitutionVersion, context: { ... } }

actors/{actorId}/memberships/{orgId}  # Membership (UOE-003)
  { organizationId, organizationName, organizationType,
    roles[], startDate, endDate, status, verification, contracts[] }

actors/{actorId}/capabilities/{capId}# Capability instance (UCE)
  { capabilityId, source, scope, verifiedUntil, status, issuedBy }

actors/{actorId}/consents/{consentId}# Grantor-side consent (UCDE)
  { grantorActorId, recipientActorId, resource, purpose, scope,
    validity, revokedAt, digitalSignature }

actors/{actorId}/delegations/{delId}   # Grantor-side delegation (UCDE)
  { delegateActorId, authority, scope, limitations, startAt, endAt, status }

actors/{actorId}/preferences/{prefKey} # Preference (UPrE)
  { category, scope, value, priority, source, inheritedFrom }

actors/{actorId}/sessions/{sessionId}  # Session identity (UIE)
  { device, browser, country, ipHash, riskScore, expiresAt, authMethod }

actors/{actorId}/security/{infoId}     # security (UIE)
  { authMethods[], trustScore, mfaEnabled, accountStatus }

actors/{actorId}/timeline/{eventId}    # actor audit/timeline (UAE)
  { type, at, metadata, actor }

actors/{actorId}/verifications/{mId}   # Verification (UIE/UCE)
  { level, council, reference, verified, grantedAt, expiresAt }
```

### 2.2 Identity (globally owned by the Actor, not any hospital)

```
identities/{actorId}
  { amxid, legalName, preferredName, dateOfBirth, sex, gender,
    nationality, languages, privacyProfile, consentProfile, verificationLevel }

identities/{actorId}/references/{refId}   # Identity reference (UIE-002)
  { type, country, issuer, number, verified, expiry, status }

identities/{actorId}/biometrics/{bioId}   # optional, never mandatory
  { type, metadata, verified, capturedAt }
```

### 2.3 Person / Professional / Patient — specializations of Actor

For hot domains, key by actorId (partition key). These are **extensions**, never identities.

```
persons/{actorId}                  # Person extension
  { identityId, givenName, familyName, dateOfBirth, gender, nationality,
    address, emergencyContact }

professional_identities/{actorId}  # Professional extension (verifiable)
  { personId, categories, primaryCategory, specialties,
    qualifications[], yearsOfExperience, licenseNumber, councilNumber,
    verified, verificationDocuments[] }

patients/{actorId}/journey/{encounterId}  # Patient longitudinal view (AMEXAN-owned)
patients/{actorId}/consents/{granteeId}   # patient consent shortcuts
patients/{actorId}/records/{docId}        # patient-owned documents
```

### 2.4 Organizations + structure

```
organizations/{orgId}
  { amxorgid, type, name, legalIdentity, governance, branding,
    statusVerified, verified, licensing, capabilities[], subscriptionTier }

organizations/{orgId}/structure/{nodeId}  # generic entity tree
  { nodeType: facility|campus|building|floor|department|unit|ward|clinic|room|bed,
    parentId, name, code, orderIndex }

organizations/{orgId}/members/{actorId}   # Organization view of membership (UOE-005)
  { actorId, roleIds[], startDate, isActive, joinedAt }
organizations/{orgId}/employments/{empId} # UOE
organizations/{orgId}/assignments/{assignId} # shifts, ward rounds
organizations/{orgId}/roles/{roleId}
organizations/{orgId}/capabilities/{capId} # organization capabilities (UCE-002)
organizations/{orgId}/services/{svcId}
organizations/{orgId}/subscriptions/{subId}
organizations/{orgId}/integrations/{intId}
```

### 2.5 Encounter (owned by hospital / local workflow), Patient journey (owned by patient)

**Deployment POV:** encounter lives under a hospital; patient owns identity + consent;
hospital owns documentation + billing; longitudinal **journey** is AMEXAN-owned.

```
organizations/{orgId}/encounters/{encounterId}   # recommended (preferred)
  + _events   (timeline / phase)
  + _orders   (labs, imaging, prescriptions)
  + _notes    (clinical notes)
  + _documents
```

Flat alternative (if queries across organizations are dominant):

```
encounters/{encounterId}
  { orgId, patientId, actorId, type, phase, status, orgIdOnData: orgId, startedAt }
encounters/{encounterId}/events/{eventId}     # timeline
encounters/{encounterId}/phases/{phaseId}
encounters/{encounterId}/orders/{orderId}
encounters/{encounterId}/diagnoses/{dxId}
encounters/{encounterId}/measures/{mId}
encounters/{encounterId}/documents/{docId}
```

### 2.6 Cross-org referential indexes

```
registry/actors       # amxid → actorId (lookup)
registry/external     # nationalId / passport / council → actorId (references)
index/patient_{actorId}  # derived snapshot collections for the read path (denormalized)
```

### 2.7 Legacy / compatibility (existing console collections)

Keep as-is for now to avoid data loss **until** engines own these; then migrate reads to the
canonical shape and keep these as deprecated aliases:

```
users, patients, prescriptions, alerts, clinicalNotes, appointments, timeline_events,
doctors, consultations, referrals, labOrders, services, messages, posts,
patientProfiles, patientTools, chatSessions, clinical_audits, clinical_notes,
conversations, dockets, histories, education_logs, investigationWorkspaces, …
```

Migration plan (single step, once engines are in place): **FREEZE** legacy writes →
**backfill** canonical from legacy → **flip** engines to canonical → **gate** legacy behind
`deprecated:true`.

---

## 3. PostgreSQL (transactional relational truth — plus audit)

Tables keyed by `actor_id uuid`, all with `created_at`, `updated_at`, `version`, `created_by`.

### 3.1 Identity & Actor
- `actor` (actor_id PK, amxid UNIQUE, actor_type, lifecycle, status, created_at)
- `identity` (actor_id FK, legal_name, preferred_name, dob, sex, gender, nationality, languages, verification_level)
- `identity_reference` (actor_id FK, type, country, issuer, number, verified, expiry)
- `auth_method` (actor_id FK, provider, issuer, verified, created_at)
- `actor_summary` (actor_id FK, trust_score, last_session)

### 3.2 Organization & membership
- `organization` (org_id PK, amxorgid, type, name, legal_name, status)
- `org_structure` (org_id FK, parent_id FK, node_type, name, code)
- `membership` (actor_id FK, org_id FK, roles, start, end, status, verification)
- `employment` (org_id FK, actor_id FK, job_title, employment_type, start, end, status)
- `assignment` (org_id, actor_id, department_id, type, start_time, end_time, status)
- `role` (org_id, id, name, type, permissions jsonb)

### 3.3 Capability
- `capability` (id, name, description, type, owner_kind, owner_id, version, validity, scope, expiry)
- `capability_grant` (actor_id/org_id, capability_id, source, granted_at, verified_until, status)
- `capability_dependency` (capability_id, requires_capability_id)

### 3.4 Consent & Delegation
- `consent` (grantor_actor, recipient_actor, resource, scope, purpose, validity, revoked, signature)
- `delegation` (delegator_actor, delegate_actor, authority, scope, start_time, end_time, status)
- `audit_log` (actor_id, entity, entity_id, event, occurred_at, ip_hash, device, metadata jsonb) — append-only
- `protocol_version` (id, disease, country, org, version, status, effective_date, expired_date, supersedes, superseded_by, definition jsonb)

### 3.5 Encounter (workflow)
- `encounters` (id, org_id, patient_actor_id, actor_id, type, status, started_at)
- `encounter_order`, `encounter_event`, `encounter_diagnosis`, `encounter_measure`, `encounter_prescription`, `encounter_document` — follow `org_id`/`patient_actor_id` as query keys.

`org_id` always present (multi-tenant); `patient_actor_id` links the longitudinal owner;
`actor_id` is the treating clinician.

---

## 4. Neo4j (graph / reasoning / knowledge & competency)

Nodes (labels) & relationships (types) — the "live knowledge" layer used by Capability,
Consent delegation, Protocol, Learning/Competency engines for reasoning (UCE/UPVE/ULCE).

### 4.1 Core nodes

```
(:Actor {actorId, amxid, actorType})          — person / org / device / AI
(:Organization {orgId})
(:Capability {capabilityId, name})
(:Consent {consentId, resource, purpose, scope})
(:Delegation {delId})
(:Encounter {encounterId, orgId, patientId})
(:Identity {actorId})
(:Reference {type, country, issuer})
(:Competency {competencyId, domain, level})
(:Protocol {protocolId, version, disease})
```

### 4.2 Relationship types

```
(:Actor)-[:HAS_IDENTITY]->(:Identity)
(:Actor)-[:HAS_REFERENCE]->(:Reference)
(:Actor)-[:MEMBER_OF]->(:Organization)
(:Actor)-[:WORKS_FOR {jobTitle, department}]->(:Organization)
(:Organization)-[:CONTAINS]->(:Department)-[:CONTAINS]->(:Ward)     # structure tree
(:Actor)-[:HAS_CAPABILITY]->(:Capability)
(:Capability)-[:REQUIRES]->(:Capability)                            # dependency (UCE)
(:Actor)-[:PREFERS]->(:Preference)
(grantor:Actor)-[:GRANTS]->(:Delegation)-[:TO]->(:Actor)            # delegation
(grantor:Actor)-[:CONSENTS_ACCESS]->(:Consent)-[:FOR_GUARDE]->(resourceActor)
(:Patient)-[:REFERRED_TO]->(org|provider)                           # referral
(:Actor)-[:SUPERVISES]->(:Actor)                                    # education
(:doctor)-[:TREATS]->(:patient)                                     # care
(:actor)-[:OWNS]->(:Encounter) / (:patient)-[:HAS]->(:Encounter)
(:encounter)-[:HAS_PHASE]->(:Phase)
(:actor)-[:DEMONSTRATED]->(:Competency)
(:Competency)-[:VALIDATED_BY]->(:Mentor)                            # ULCE
```

Cypher — capability reasoning:

```cypher
MATCH (a:Actor {actorId:$actorId})-[:MEMBER_OF]->(org:Organization)
OPTIONAL MATCH (a)-[:HAS_CAPABILITY]->(c:Capability)
RETURN org, collect(c.name) AS capabilities;
```

Cypher — referral candidate (capability-aware):

```cypher
MATCH (:Encounter {encounterId:$encounterId})-[:LOCATED_IN]->(org:Organization {orgId:$orgId})
MATCH (provider:Actor)-[:MEMBER_OF]->(org)
WHERE (provider)-[:HAS_CAPABILITY]->(:Capability {name:$service})
RETURN provider AS candidate;
```

---

## 5. Cross-store responsibilities

| Concern | Firestore (operational) | PostgreSQL (truth txn) | Neo4j (graph) |
|---|---|---|---|
| Actor core | actors, profiles | actor | actor + HAS_… |
| Identity | identities / refs | identity, identity_reference | identity nodes/rels |
| Membership / employment | subcollections | membership, employment | MEMBER_OF / WORKS_FOR |
| Capabilities | capability subcollections | capability + grants/deps | HAS_CAPABILITY / REQUIRES |
| Consent / Delegation | consent/delegation subcols | consent, delegation, audit | GRANTS / CONSENTS_ACCESS |
| Encounter | encounter collections | encounters + orders/events | encounter nodes & referrals |
| Protocol / knowledge | protocol_version docs | protocol versions | Protocol / HAS_PHASE |
| Competency / CPD | learning objects | competency, audit | DEMONSTRATED / VALIDATED_BY |
| Org structure tree | structure subcollection | org_structure | CONTAINS |
| Dashboards / presentation | (generated, stateless) | — | — |

---

## 6. Write-ownership rules

| Object | Owner |
|---|---|
| actor identity references | Identity Engine only |
| membership / employment / assignment | Organization / Workspace Engine only |
| capability grants | Capability Engine only |
| consent / delegation / audit | Consent & Delegation Engine only |
| encounter + subdocs | Encounter / hospital scoped |
| patient longitudinal journey | AMEXAN (patient-owned) |
| preferences | Preference Engine; never device |
| protocol version | Protocol Version Engine |

No engine touches another engine's table directly — every object sits behind its owning engine.

---

## 7. Recommended first increment (actor → correct dashboard, zero errors)

1. `identities`, `persons`, `professional_identities`, `workspaces`, `organizations` (+ `members`, `employments`) are already rule-backed; add `actors` as a thin root so **every** registrar writes an Actor row first.
2. Add `actors/{actorId}/preferences` rule (owner-only) so the Preference engine is ready.
3. Add `protocolVersions` and `competencyConstructs` collection specs for the protocol + competency engines.
4. Migration engine: backfill legacy collections → canonical under `registry` index; keep legacy aliases gated.
5. Document the migration runbook before code.

---

## Open design questions (confirm before I implement storage)

- **Patient longitudinal:** `patients/{actorId}/…` partition vs single `patients/{actorId}` — recommend the partition + `organizations/{orgId}/encounters/…`.
- **Org-scoped encounters:** `organizations/{orgId}/encounters/…` vs flat `encounters/{id}` with `orgId+patientId` — recommend **flat for cross-org queries** + explicit org/patient fields, with subcollections `_events/_orders/_notes`.
- **Neo4j relationship naming:** standardize on the canonical names above (HAS_CAPABILITY, MEMBER_OF, TREATS, etc.) — confirm alignment with existing `seed_kg.cypher`.