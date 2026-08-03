# AMEXAN Storage Matrix — All 10 Engines, All 3 Stores

> **This is the canonical map.** Every engine, every collection/table/node, and every
> existing console collection is assigned a constitutional home. Anything unmapped below
> is either legacy (**deprecated**) or a **TO BUILD** gap.

Stores:
- **FS** = Cloud Firestore (operational/domain state; collections + subcollections)
- **PG** = PostgreSQL (transactional truth + audit)
- **NX** = Neo4j (graph/reasoning/knowledge)
- **OBJ/RED/SRC** = Object storage / Redis / OpenSearch (materialized by engines)

Ownership rule (UPE/UCE): engines write stores; interfaces query engines, never stores.
Every object carries `constitutionVersion, createdAt, updatedAt`.

---

## 0. Canonical keys

| Key | Usage |
|----|----|
| `actorId` (UUIDv7/ULID) | primary key everywhere, immutable |
| `amxid` (`AMX-…`) | display secondary index, never identity |
| `firebaseUid` | auth proof only, never identity |
| `orgId`, `organizationId` | org canonical id |

One Actor → one `actorId` → many contexts/roles. Contexts create Roles, never Actors (UAE-002/003).

---

## ENGINE 1 — Universal Actor Engine (UAE)

| Engine | Firestore (collections + subcollections) | PostgreSQL (PG) | Neo4j (NX) |
|---|---|---|---|
| Actor core | `actors/{actorId}` `{actorId, amxid, actorType, status, lifecycle, createdAt, updatedAt, lastVerifiedAt, constitutionVersion, context}` | `actor`  (§3.1, done 005) | `(:Actor)` `HAS_*` |
| Memberships | `actors/{actorId}/memberships/{orgId}` | `membership`, `employment`, `assignment` (§3.2, pg 004/org) | `MEMBER_OF`, `WORKS_FOR` |
| Actor timeline | `actors/{actorId}/timeline/{eventId}` | `audit_log` | timeline events |
| Actor security | `actors/{actorId}/security/{infoId}`, `actors/{actorId}/sessions/{sessionId}` | `actor_summary` | — |
| Actor relationships | — | `identity_reference` | TREATS/WORKS_FOR/SUPERVISES/REFERRED_TO/PARENT_OF/CAREGIVER_OF/INSURED_BY |

**Status:** PG `actor` done (005). FS `actors/{actorId}` rule added. NX `Actor` node seeded.

---

## 2. Universal Identity Engine (UIE)

| Firestore | PG | NX |
|---|---|---|
| `identities/{actorId}` | `identity` (005) | `(:Identity)` `HAS_IDENTITY` |
| `identities/{actorId}/references/{refId}`; `/biometrics/{bioId}` | `identity_reference`, `auth_method` (005) | `HAS_REFERENCE` |
| `actors/{actorId}/sessions`, `actors/{actorId}/security` | `auth_method`, `actor_summary` (005) | — |

**Status:** done (005 + existing rules).

---

## 3. Universal Organization Engine (UOE)

| `organizations/{orgId}` (top-level) + subcols | PG | NX |
|---|---|---|
| `organizations/{orgId}` | `organizations` (004) | `Organization`, `CONTAINS` |
| `/structure/{nodeId}` (facility…bed) | `org_structure`, `departments`, `units`, `org_hierarchy` (004) | `CONTAINS`, `HAS_DEPARTMENT`, `CONTAINS_WARD` |
| `/members/{actorId}`, `/employments`, `/assignments`, `/roles`, `/services`, `/integrations`, `/subscriptions`, `/capabilities` | `membership`,`employment`,`assignment`,`role`,`capability` | `MEMBER_OF`,`HAS_MEMBER` |

**Status:** done (004 + rules).

---

## 4. Universal Capability Engine (UCE)

| FS | PG | NX |
|---|---|---|
| `actors/{actorId}/capabilities/{capId}` | `capability`, `capability_grant`, `capability_dependency` (005) | `(:Actor)-[:HAS_CAPABILITY]->(:Capability)`, `REQUIRES` |
| `organizations/{orgId}/capabilities/{capId}` | `capability.owner_kind=organization` (005) | `ORG_CAPABILITY` |

** done (005 + seed_constitution.cypher + rules).

---

## 5. Universal Presentation Engine (UPE)

Dashboards are **stateless, generated**. No persistent collection. Computed from Actor/Org/Capabilities/Tasks/Preferences.

| FS | PG | NX |
|---|---|---|
| (none — stateless) | `workspace` snapshots (deprecated/alias) | — |

** Presentation `DashboardResolver` already generates from context.

---

## 6. Universal Consent & Delegation Engine (UCDE)

| Owner-side FS | PG | NX |
|---|---|---|
| `actors/{actorId}/consents/{consentId}` | `consent` (005) | `CONSENTS_ACCESS`, `FOR_GUARDE` |
| `actors/{actorId}/delegations/{delegationId}` | `delegation` (005) | `GRANTS` → `TO` |
| `actors/{actorId}/preferences` (Preference, actually UPrE) | `preference` | `PREFERS` |

** done:** `consent`, `delegation` (005). NX consent/delegation seeded.

---

## 7. Universal Preference Engine (UPrE)

| FS | PG | NX |
|---|---|---|
| `actors/{actorId}/preferences/{prefKey}` | `preference` (NEW — not yet added to 005) | `PREFERS` |

** Gap:** Preference engine has PG table to add; rules already added.

---

## 8. Universal Marketplace Engine (UME)

| FS | PG | NX |
|---|---|---|
| `marketplace/modules/{moduleId}` (read-most, engine-write) | `marketplace_module` (NOT yet in 005), `extension_install` | `INSTALLED_BY`, `EXTENDS` (not yet seeded) |

** Gap: ** PG `marketplace_module` table and marketplace FS rules are missing.

---

## 9. Universal Protocol Version Engine (UPVE)

| FS | PG | NX |
|---|---|---|
| `protocolVersions/{versionId}` (read-only) | `protocol_version` (005) | `Protocol`, `HAS_PHASE`, `SUPERSEDES` |
| `protocolVersions}/versionGuidelines` | `protocol_version` supersedes | — |

** done:** `protocol_version` (005) + seed.

---

## 10. Universal Learning & Competency Engine (ULCE)

| FS | PG | NX |
|---|---|---|
| `competencies/{actorId}/…`, `learningObjects/{id}`, `learningLogs/{id}` | `competency`, `audit_log` | `DEMONSTRATED`, `VALIDATED_BY`, `SUPERVISES` |

** 005/graph cover competency; PG `competency` + FS `learningLogs`/`learningObjects` rules partially (competencies read-only added).

---

## Full Firestore collection inventory — console vs constitutional home

Every collection currently in the console, mapped:

### Constitutional root (first-class)
- `organizations` ✓ (top-level, done)
- `identities`, `persons`, `professional_identities`, `workspaces` ✓
- `users` (legacy alias → should become `actors` root)

### Actor/registry/marketplace — **build**
- `actors` (missing; this is the one that makes every registrar write an Actor first)
- `marketplace` — missing
- `competencyConstructs`, `learningLogs`, `protocolVersions` — rules added; perspective creators write-only

### Clinical / Encounter-owned (legacy should be RMS to organization/)
- `clinicalNotes`/`clinical_notes`, `consultations`, `labOrders`, `prescriptions`, `referrals`, `services`, `alerts`, `appointments` → owned by `organizations/{org}/encounters/{id}/` or `_orders`/`_notes`
- `patients`, `patientProfiles`, `patientTools` → split ownership patient identity vs org encounter

### Communication/education (actor-to-actor)
- `messages`, `conversations`, `chatSessions`, `calls`, `doctorMessages`, `doctorConversations`, `workspaceMessages`, `typing`, `posts` → actor communicator (Neo4j `Actor-Actor`)

### Dedicated/history
- `histories`, `timeline_events`, `dockets`, `education_logs`, `education_questions`, `disease_enrollments`, `disease_readings`, `toolReadings`, `tool_assignments`, `mergAdherence`, `medicationSchedules`, `medicationAdministrations`

### Clinical/clinical_audits etc. — legacy aliases "deprecated"
- `clinical_records`, `clinical_audits`, `care_pathways`, `investigationWorkspaces` → converges to encounter+knowledge objects

**Conclusion: only `actors` root, `marketplace`, and entity->encounter ownership are the missing FS images; the rest are legacy aliases that can be gated behind `deprecated:true` once engines flip.**

---

## Readiness summary

| Store | Done | Still to build |
|---|---|---|
| Firestore rules/collections | `actors/*` subcols, `organizations/*`, `identities`, `persons`, `protocolVersions`, `competencyConstructs`, workspace, encounter + nested | `marketplace` collection+rules; `learningLogs` |
| PostgreSQL | `actor`,`identity`,`identity_reference`,`auth_method`,`actor_summary`,`capability*`,`consent`,`delegation`,`audit_log`,`protocol_version` (005) + org/encounter (001-004) | `preference`, `marketplace_module`, `competency`,`learning_log` |
| Neo4j | `Actor`,`Organization`,`Capability`,`Consent`,`Delegation`,`Protocol`,`Phase`,`Competency`,`Preference`,`Encounter` + relationships (seed_constitution + seed_kg) | `Marketplace` INSTALLED_BY/EXTENDS; link capability-aware referral query with domain names |