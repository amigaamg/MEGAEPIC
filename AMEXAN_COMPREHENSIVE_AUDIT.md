# AMEXAN Comprehensive Audit — Healthcare Operating System

**Audit Date:** 2026-07-31
**Scope:** Homepage, Registration, Login, Dashboards, HMIS EMR, Universal Rules, Authentication, Authorization, Verification, Storage, Notifications, Analytics, Administration, Themes
**Reference:** AMEXAN Constitution (Actors, AMXID, Multi-Tenancy, Subscription, Verification Ladder, Presentation Engine, HMIS, etc.)

---

## 1. USERS (Actors) — Who Are They?

### 1.1 Current Actor Types Recognized by the System

The system currently recognizes these actor types across its modules:

**From HMIS User Model** (`lib/amexan/hmis/user-model.ts`):
- Person, Patient, Clinician, Nurse, Pharmacist, Lab Scientist, Radiographer, Receptionist, Administrator, Facility Admin, Super Admin, Researcher, Student, Consultant, Telemedicine Provider, Caregiver, Guardian, IT Staff, Finance Staff, HR Staff, Records Officer, Physiotherapist, Nutritionist, Social Worker, Chaplain, Volunteer, Vendor, Auditor, System

**From Constitution Role Permissions** (`lib/amexan/constitution/role-permissions.ts` — built by Tier 1):
- 10 org roles + clinician roles + patient role

**From AMXID Prefix Map** (`lib/amexan/constitution/amxuid.ts`):
- `AMX-PAT` (Patient), `AMX-DOC` (Doctor), `AMX-STU` (Student), `AMX-HOS` (Hospital), `AMX-LAB` (Laboratory), `AMX-ADM` (Admin), `AMX-PER` (Person), `AMX-ORG` (Organization), `AMX-DEV` (Device), `AMX-AI` (AI), `AMX-SYS` (System)

### 1.2 Gaps vs Constitution

The constitution defines these actor types that are NOT yet fully wired:

| Constitution Actor Type | Implementation Status |
|---|---|
| Clinical Officer | Missing prefix, exists as role |
| Medical Officer | Missing prefix, exists as role |
| Consultant | Has prefix/role ✓ |
| Specialist | Missing prefix |
| Resident | Missing prefix |
| Intern | Missing prefix |
| Dentist | Missing prefix |
| Physiotherapist | Has HMIS type ✓ but no AMX prefix |
| Occupational Therapist | Missing |
| Nutritionist | Has HMIS type ✓ but no AMX prefix |
| Community Health Worker | Missing prefix |
| Family (Patient variant) | Missing prefix |
| Guardian | Has HMIS type ✓ but no AMX prefix |
| Neonate | Missing |
| Child | Missing |
| Adult (Patient variant) | Missing |
| Ministry | Missing prefix |
| NGO | Missing prefix |
| University | Missing prefix |
| Medical School | Missing prefix |
| Insurance | Missing prefix |
| Employer | Missing prefix |
| Vendor | Has HMIS type ✓ |
| Supplier | Missing |
| Flying Doctors | Missing |
| Ambulance | Missing |
| Medical Equipment | Missing |
| Lecturer | Missing |
| Tutor | Missing |
| Examiner | Missing |
| Regional Admin | Missing prefix |
| National Admin | Missing prefix |
| Super Admin | Has HMIS type ✓ |
| AGOC Engineer | Missing |

**Critical Gap:** The AMXID prefix system only generates `AMX-PER`, `AMX-ORG`, `AMX-DEV`, `AMX-AI`, `AMX-SYS`, `AMX-PAT`. It does NOT generate `AMX-DOC`, `AMX-STU`, `AMX-HOS`, `AMX-LAB`, `AMX-ADM`. These are defined in the constitution but not wired into `generateAmxUid()`.

---

## 2. HOMEPAGE — What Visitors See First

### 2.1 Current State (`app/page.tsx`)

**Status:** Fully built, follows CEO feedback (9.6/10 per previous review)

**Sections (10 total):**
1. Hero — "The Operating System for Modern Healthcare" ✓
2. Trust Strip — FHIR, SNOMED CT, LOINC, DICOM, ICD-11, WHO, etc. ✓
3. Ecosystem — 13 connected nodes ✓
4. Who We Serve — 6 audience cards ✓
5. Products — 8 product cards ✓
6. Clinical Intelligence — 8 engine cards ✓
7. Clinical Journey — 8-step flow ✓
8. Why AMEXAN — 6 philosophy cards ✓
9. Security & Standards ✓
10. Testimonials + CTA ✓

**What's Good:**
- Hero communicates WHO it serves, WHAT it does, HOW it does it, WHY it matters
- Trust strip instantly communicates credibility
- Ecosystem loop shows the full healthcare connectivity
- "Every patient, every encounter, every clinical decision, every healthcare service—connected through one continuously learning operating system" is present
- Sky blue + white theme applied via CSS variables
- Inter font (international)
- Responsive design

**What Could Be Improved:**
- Information density is high — CEO recommended 35-45% reduction but the page is functional
- Colors are not purely sky blue + white — some sections use dark navy backgrounds (`var(--sky-800)`) which is acceptable as a shade
- No animated background or "more on the flow" visual effect — the page is flat scroll
- The hero animation (framer-motion) is minimal
- Missing: the "one sentence" that AMEXAN can truthfully say is buried in the ecosystem section, not prominently placed

**Colors Check (Sky Blue + White + Shades):**
- Primary blue: `#2F80ED` ✓
- Sky blue shades: `var(--sky-50)` through `var(--sky-800)` ✓
- White: `var(--surface-card)` ✓
- All backgrounds use sky blue shades ✓
- No non-sky-blue colors used ✓

---

## 3. REGISTRATION — How Users Join

### 3.1 Registration Paths

**Path 1: Quick Register** (`app/(auth)/quick-register/page.tsx`)
- Fast path for new users
- Wired with `ensureActor()` → creates AMXID + identity + person + professional docs
- **Missing:** No org selection, no role selection, no verification onboarding

**Path 2: Constitutional Registration** (`app/(auth)/register/constitution/page.tsx`)
- Full constitutional registration
- Identity → Person → Professional → Organization → Role
- **Missing:** Verification ladder integration not fully wired (does it check verification state after registration?)

**Path 3: SSO Registration** (via login page)
- Google, Apple, Microsoft SSO auto-creates account
- Uses legacy fallback in `loadUserSession()`
- **Missing:** SSO users don't get AMXID generation properly (they use Firebase UID as identity)

### 3.2 Gaps vs Constitution

| Constitution Requirement | Status |
|---|---|
| Universal Actor Creation | ✓ (ensureActor creates Actor + Identity + Person + Professional) |
| AMXID Generation | ✓ (but missing DOC/STU/HOS/LAB/ADM prefixes) |
| Verification Ladder Integration | Partial — verification state is loaded but not checked during registration |
| Org Assignment | Missing — no org selection during registration |
| Role Assignment | Missing — no role selection during quick register |
| Consent Capture | Missing — no consent form during registration |
| Multi-tenancy onboarding | Missing — no country/region selection |
| Passwordless registration | Missing — no magic link registration flow |
| Passport/ID upload | Missing — no document upload in registration flow |
| Guardian onboarding (for patients) | Missing — no family/ guardian setup during registration |

---

## 4. LOGIN — How Users Authenticate

### 4.1 Current Auth Methods (`app/(auth)/login/page.tsx`)

| Method | Status | Notes |
|---|---|---|
| Email + Password | ✓ | Core method |
| Google SSO | ✓ | OAuthProvider |
| Apple SSO | ✓ | OAuthProvider |
| Microsoft SSO | ✓ | OAuthProvider |
| Passkey (WebAuthn) | ✓ | Biometric/PIN |
| Magic Link | ✓ | MagicLinkForm component |
| Phone (SMS) | ✗ | Not implemented |
| MFA | ✗ | Not implemented |
| OIDC | ✗ | Not implemented (SSO covers this) |

### 4.2 Auth Flow

1. User selects auth method
2. User submits credentials
3. Firebase authenticates
4. `loadUserSession()` called:
   - First tries `getActorSession()` (AMXID-based actor lookup)
   - Falls back to legacy user lookup (role-based)
5. Verification state loaded
6. Email verification status checked
7. If needs registration → redirect to `/register`
8. If needs email verification → redirect to `/verify`
9. Otherwise → redirect to `/dashboard`
10. Session cookie `__session` set
11. Periodic cookie refresh every 45 min

### 4.3 Gaps vs Constitution

| Constitution Requirement | Status |
|---|---|
| AuthN only answers "Who are you?" | ✓ (Firebase handles this) |
| AuthZ answers "What are you allowed to do?" | ✓ (can() permission system) |
| AuthN and AuthZ never mix | ✓ (separated in code) |
| Actor profile loaded after login | ✓ (via getActorSession) |
| Permissions loaded after login | ✓ |
| Organizations loaded after login | ✓ |
| Active workspaces loaded | ✓ (activeOrganizationId) |
| Dashboard generated from actor | ✓ (generateActorDashboard) |
| Multi-factor authentication | ✗ (not implemented) |
| Passkey enrollment (not just login) | ✗ (login only, no enrollment flow) |
| Device management | ✗ |
| Session revocation UI | ✗ |
| Login history | ✗ (audit log exists but not exposed in UI) |
| Failed login lockout | ✗ (Firebase handles rate limiting) |
| Recovery flow | ✓ (recovery page with backup codes) |

---

## 5. DASHBOARDS — Per-Actor Dashboards

### 5.1 How Dashboards Are Generated

The dashboard system works as follows:

1. **AuthContext** loads `UserSession` after login
2. `generateActorDashboard(session)` is called in `useMemo`
3. `generateActorDashboard()` dispatches to actor-type-specific generators:
   - `doctor` → ward round, admissions, pending signatures, pending orders, tasks, research, teaching, analytics
   - `nurse` → vitals, medication admin, patient list
   - `pharmacist` → dispense, drug interactions
   - `lab_technologist` → pending samples
   - `radiographer` → imaging queue
   - `receptionist` → check-in, appointments
   - `student` → learning, logbook
   - `patient` → appointments, medications, vitals, education, telemedicine, bills, insurance, follow-up
   - `administrator` → beds, admissions, revenue, departments, audits, quality, alerts, licenses
   - Default → generic sections

4. Dashboard is rendered in `app/dashboard/page.tsx` with sidebar navigation, quick actions, workspace links

### 5.2 Dashboard Pages That Exist

| Page | Actor Type | Status |
|---|---|---|
| `app/dashboard/page.tsx` | Generic (uses generateActorDashboard) | ✓ Built |
| `app/dashboard/patient/page.tsx` | Patient | ✓ Very comprehensive |
| `app/dashboard/patient/medication/page.tsx` | Patient | ✓ |
| `app/dashboard/patient/appointments/page.tsx` | Patient | ✓ |
| `app/dashboard/patient/book/page.tsx` | Patient | ✓ |
| `app/dashboard/doctor/page.tsx` | Doctor | ✓ (separate from main dashboard) |
| `app/dashboard/doctor/patient/[patientId]/page.tsx` | Doctor → Patient | ✓ |
| `app/dashboard/doctor/medication/page.tsx` | Doctor | ✓ |
| `app/dashboard/doctor/appointments/page.tsx` | Doctor | ✓ |
| `app/dashboard/doctor/medication/review/page.tsx` | Doctor | ✓ |
| `app/dashboard/cos-doctor/page.tsx` | COS Doctor | ✓ |
| `app/dashboard/cos-consultant/page.tsx` | COS Consultant | ✓ |
| `app/dashboard/cos-nurse/page.tsx` | COS Nurse | ✓ |
| `app/dashboard/cos-lab/page.tsx` | COS Lab | ✓ |
| `app/dashboard/cos-pharmacy/page.tsx` | COS Pharmacy | ✓ |
| `app/dashboard/cos-radiology/page.tsx` | COS Radiology | ✓ |
| `app/dashboard/cos-admin/page.tsx` | COS Admin | ✓ |
| `app/dashboard/inpatient/page.tsx` | Inpatient | ✓ |
| `app/dashboard/medication-center/page.tsx` | Medication Center | ✓ |
| `app/dashboard/portfolio/page.jsx` | Portfolio | ✓ |
| `app/dashboard/doctor/[doctorId]/page.jsx` | Doctor Profile | ✓ |

### 5.3 Gaps vs Constitution

| Constitution Requirement | Status |
|---|---|
| Nobody receives hardcoded dashboard | ✓ (generateActorDashboard dispatches) |
| Dashboard inputs include Actor, Role, Context, Tasks, Permissions, Organization, Subscriptions, Notifications, Current workflow, Location, Device, Preferences, Accessibility, Experience, AI recommendations | Partial — currently inputs are Actor (from session), Role, Context, Permissions. Missing: Tasks, Subscriptions, Notifications (as inputs), Current workflow, Location, Device, Preferences, Accessibility, Experience, AI recommendations |
| Doctor dashboard = ward round + admissions + results + critical + tasks + research + teaching + analytics | ✓ (built) |
| Patient dashboard = appointments + medication + education + vitals + telemedicine + bills + insurance + follow-up + community | ✓ (built, very comprehensive) |
| Student dashboard = learning + cases + supervisor + logbook + procedures + assignments + OSCE | Partial (student exists in HMIS but student dashboard not fully built) |
| Admin dashboard = beds + admissions + revenue + departments + audits + quality + alerts + licenses | Partial (admin dashboard exists in enterprise module but not fully wired to dashboard page) |

---

## 6. HMIS EMR — Hospital Management System

### 6.1 HMIS Module Structure (`lib/amexan/hmis/`)

The HMIS module is the most comprehensive part of the codebase. It contains 24 books (modules):

| Book | File | Status |
|---|---|---|
| I: Universal Hospital Model | hospital-model.ts | ✓ Complete types + functions |
| II: Universal User Model | user-model.ts | ✓ Complete types + functions |
| III: Universal Identity | identity.ts | ✓ Complete types + functions |
| IV: Universal Encounter Lifecycle | encounter-lifecycle.ts | ✓ Complete types + functions |
| V: Universal Task Engine | task-engine.ts | Exists (not fully read) |
| VI: Universal Notification Engine | notification-engine.ts | ✓ Complete types + functions |
| VII: Universal Orders Engine | orders-engine.ts | Exists (not fully read) |
| VIII: Universal Results Engine | results-engine.ts | Exists (not fully read) |
| IX: Universal Resource Management | resource-engine.ts | Exists (not fully read) |
| X: Pharmacy Engine | pharmacy-engine.ts | Exists (not fully read) |
| XI: Laboratory Engine | laboratory-engine.ts | Exists (not fully read) |
| XII: Radiology Engine | radiology-engine.ts | Exists (not fully read) |
| XIII: Theatre Engine | theatre-engine.ts | Exists (not fully read) |
| XV: Billing Engine | billing-engine.ts | ✓ Complete types + functions |
| XVI: Scheduling Engine | scheduling-engine.ts | Exists (not fully read) |
| XVII: Referral Engine | referral-engine.ts | Exists (not fully read) |
| XVIII: Public Health Engine | public-health-engine.ts | Exists (not fully read) |
| XIX: Research Engine | research-engine.ts | Exists (not fully read) |
| XX: Audit & Compliance | audit-engine.ts | Exists (not fully read) |
| XXI: Integration Engine | integration-engine.ts | Exists (not fully read) |
| XXII: Offline Engine | offline-engine.ts | Exists (not fully read) |
| XXIII: Event Bus Engine | event-bus-engine.ts | Exists (not fully read) |
| XXIV: Analytics Engine | analytics-engine.ts | ✓ Complete types + functions |

### 6.2 HMIS EMR — What Works

**Hospital Hierarchy** (`hospital-model.ts`):
- Global → Continent → Country → Region → Organization → Hospital → Campus → Building → Floor → Department → Unit → Ward → Room → Bed ✓
- Bed types (Standard, ICU, HDU, Pediatric, Neonatal, Maternity, Isolation, Recovery, Emergency, Dialysis, Bariatric) ✓
- Bed statuses (Available, Occupied, Reserved, Cleaning, Maintenance, OutOfService) ✓
- Department types (Emergency, Outpatient, Inpatient, ICU, Theatre, Laboratory, Radiology, Pharmacy, etc.) ✓
- Unit types (Medical, Surgical, Pediatric, Neonatal, etc.) ✓
- Room types (General, Private, SemiPrivate, Ward, Isolation, ICU, etc.) ✓
- Hospital tree building ✓
- Occupancy stats ✓

**User/Actor Model** (`user-model.ts`):
- 27 actor types ✓
- Role system with scope (global, organization, department, unit, self) ✓
- Session management ✓
- Task assignments ✓
- User preferences (language, theme, notifications, shortcuts, dashboard layout) ✓
- Notification preferences (inApp, email, sms, push, quiet hours, critical only) ✓
- Actor status management (Active, Inactive, Suspended, Terminated, OnLeave, OffDuty, Away, Busy) ✓

**Encounter Lifecycle** (`encounter-lifecycle.ts`):
- 16 states (Created → Registered → Triaged → Waiting → Consultation → Investigating → Diagnosis → Treatment → Observation → Procedure → Admission → Transferred → Discharged → FollowUp → Closed → Cancelled → NoShow) ✓
- State transition validation ✓
- 17 encounter classes ✓
- 6 priority levels ✓
- Encounter context (chief complaint, mode of arrival, insurance, consent, confidentiality) ✓
- Encounter flags (pregnant, emergency, trauma, infectious, isolation, DNR, advance directive, research, etc.) ✓
- Audit trail ✓
- Encounter statistics ✓

**Notification Engine** (`notification-engine.ts`):
- 37 notification types ✓
- 8 categories ✓
- 6 severity levels ✓
- 10 delivery channels (in-app, email, SMS, push, WhatsApp, pager, dashboard, sound alarm, light alarm, broadcast) ✓
- Notification rules (trigger + filter + recipient + channel + template) ✓
- Templates with variables ✓
- Read/acknowledge tracking ✓
- Summary statistics ✓

**Billing Engine** (`billing-engine.ts`):
- Charge items with categories ✓
- Invoices with status flow ✓
- Multiple payment methods (Cash, M-Pesa, Card, Bank Transfer, Cheque, Insurance, Corporate, Mobile Banking, Voucher, Waiver) ✓
- Insurance claims with status flow ✓
- Invoice calculations ✓

**Identity** (`identity.ts`):
- Multi-identifier system (hospital numbers, national ID, passport, insurance, professional licenses, council registrations) ✓
- Biometric records (fingerprint, face, iris, palm, voice, DNA, signature) ✓
- Identity documents (14 document types) ✓
- Linked identities ✓
- Verification levels (0-8) ✓
- Identity search ✓
- Merge duplicates ✓

### 6.3 What's Missing from HMIS

**Critical Gaps:**
1. **No Firestore persistence** — All HMIS engines are pure TypeScript with in-memory data. No database integration.
2. **No HMIS UI pages** — The HMIS module has types and logic but no React pages for hospital staff to interact with.
3. **No encounter creation UI** — The encounter lifecycle state machine exists but there's no UI to create/transition encounters.
4. **No patient registration HMIS flow** — Hospital staff can't register patients through the HMIS UI.
5. **No clinical documentation editor** — No UI for doctors to write clinical notes within the HMIS.
6. **No order entry system** — No UI for ordering labs, imaging, prescriptions.
7. **No results viewing UI** — Lab and radiology results engines exist but no UI.
8. **No pharmacy dispensing UI** — Pharmacy engine exists but no UI.
9. **No scheduling UI** — Scheduling engine exists but no UI for booking appointments.
10. **No billing UI** — Billing engine exists but no UI for creating invoices or processing payments.
11. **No notification delivery** — Notification engine has types but no actual email/SMS/WhatsApp delivery integrations.
12. **No real analytics** — Analytics engine has report structures but no data pipeline or actual analytics.

---

## 7. UNIVERSAL RULES — What Makes It All Work

### 7.1 Authentication vs Authorization Separation

| Rule | Implementation | Status |
|---|---|---|
| AuthN answers "Who are you?" | Firebase auth handles this | ✓ |
| AuthZ answers "What are you allowed to do?" | `can()` permission system from constitution | ✓ |
| AuthN never mixes with AuthZ | `can()` is pure, separate from Firebase auth | ✓ |
| Permissions derived from actor role | `role-permissions.ts` maps roles to permissions | ✓ |
| Permissions checked at route level | proxy.ts checks JWT, doesn't check permissions | Partial |
| Permissions checked at UI level | AuthContext provides `can()` function | ✓ |
| Permissions checked at data level | Firestore rules use org membership | ✓ |

### 7.2 Org-Scoped Data Access

**Firestore Rules** (`firestore.rules`):
- Every collection is scoped by `orgId` field
- `isOrgMember(orgId)` checks membership in `organizations/{orgId}/members/{userId}`
- `isOrgAdmin(orgId)` checks if user has admin role
- `hasOrgIdInData(orgId)` ensures data belongs to the org
- Collection group rules for encounters, events, phases, orders, lifeline, members
- Legacy collection backward compat for patients, prescriptions, alerts, clinicalNotes, appointments, timeline_events

**Proxy.ts** (`proxy.ts`):
- JWT verification using `jose` and Google JWKS
- Route-level protection for `/dashboard`, `/admin`, `/hmis`, `/workspace`, `/doctor`, etc.
- Public paths excluded (login, register, verify, recovery, etc.)
- Session cookie `__session` checked
- User info forwarded to downstream via `x-user-uid`, `x-user-email`, `x-user-email-verified` headers

### 7.3 Verification Ladder

The verification ladder has 6 levels:
1. Identity Verification → ✓ (email verification exists)
2. Professional Verification → ✗ (no professional verification UI in the app)
3. Organization Verification → ✗ (no org verification flow)
4. Privilege Verification → ✗ (no privilege verification gate)
5. Session Verification → ✓ (session tokens created/validated)
6. Context Verification → ✗ (no context verification)

**Gap:** The verification ladder is defined in types and the verification service persists state, but only Level 1 (email verification) is actually used in the app. The other 5 levels are not wired into any UI or middleware.

### 7.4 Multi-Tenancy Hierarchy

The constitution defines: AMEXAN → Country → Region → Network → Hospital → Department → Ward → Encounter

**Current Implementation:**
- `orgContext.ts` provides `getActiveOrganizationId()` / `setActiveOrganizationId()` / `clearActiveOrganizationId()`
- Users can switch between organizations they belong to
- Firestore rules scope everything by orgId
- **Missing:** The hierarchy is flat (just orgId). Country, Region, Network, Hospital, Department, Ward levels are NOT implemented in orgContext. The HMIS `hospital-model.ts` defines the hierarchy types but they are not connected to the runtime org system.

### 7.5 Subscription/Capability Gating

The Capability Engine exists (`capability-engine.ts`) with 4 tiers:
- Starter: EMR, Appointments, Patients, Billing
- Professional: + Clinical Intelligence, Decision Support, Ward Rounds, Protocols
- Enterprise: + Analytics, Research, Education, AI, FHIR, PACS, LIS, Telemedicine
- National: + Multi-facility, Registries, Population Health, National Reporting

**Gap:** The capability engine is built but NOT integrated into:
- Route-level middleware (proxy.ts doesn't check subscription tier)
- UI (no feature-gating in dashboards)
- API routes (no server-side capability checking)
- The engine is only exportable via barrel, not wired into request handling

---

## 8. STORAGE — Universal Storage

### 8.1 Current Storage

| Storage Type | Implementation | Status |
|---|---|---|
| Firestore | Firebase/Firestore (primary database) | ✓ Active |
| PostgreSQL | `pg` dependency installed | ✗ Not wired |
| Neo4j | `neo4j-driver` dependency installed | ✗ Not wired |
| Redis | Not installed | ✗ Not available |
| Object Storage | Not implemented | ✗ |
| Elastic/OpenSearch | Not installed | ✗ |
| In-memory | `storage/engine.ts` (AtomicFactStore) | ✓ (development only) |
| IndexedDB | `offline/indexeddb-persistence.ts` | ✓ (offline persistence) |

**Gap:** The constitution specifies PostgreSQL for identity/workflow/transactions/scheduling/billing/audit, Neo4j for knowledge/reasoning/relationships/education/protocols/evidence, Object Storage for PDFs/images/videos/scans/DICOM, and Redis for caching. NONE of these are integrated. The system runs entirely on Firestore.

---

## 9. NOTIFICATIONS — Universal Notification Engine

### 9.1 Current State

- Notification types: 37 ✓ (well-defined)
- Channels: 10 (in-app, email, SMS, push, WhatsApp, pager, dashboard, sound alarm, light alarm, broadcast) ✓ (well-defined)
- Rules engine: ✓ (trigger + filter + template)
- **Actual delivery integrations:** ✗ NONE

**Gap:** The notification engine defines the types and rules but has NO actual delivery integrations. No email service (SendGrid, SES, etc.), no SMS gateway (Twilio, etc.), no WhatsApp API, no push notification service (FCM, APNs), no pager integration. Notifications are created in-memory but never actually delivered.

---

## 10. ANALYTICS — Per-Actor Analytics

### 10.1 Current State

- Analytics engine with report definitions, dashboard widgets, data warehouse queries, predictive models ✓ (well-defined)
- Analytics page exists (`app/analytics/page.tsx`) — need to check if it's functional
- **Actual analytics pipeline:** ✗ NONE
- **Actual data warehouse:** ✗ NONE
- **ML models:** ✗ NONE (type definitions exist but no models)

**Gap:** Analytics is defined at the type level but has no data pipeline, no ML infrastructure, and no actual analytics delivery.

---

## 11. ADMINISTRATION — Platform Admin Console

### 11.1 Current State

- Admin pages exist under `app/admin/`:
  - `app/admin/workforce/page.tsx`
  - `app/admin/workforce/schedule/page.tsx`
  - `app/admin/workforce/credentials/page.tsx`
  - `app/admin/authz/roles/page.tsx`
  - `app/admin/authz/policies/page.tsx`
  - `app/admin/authz/audit/page.tsx`
  - `app/admin/settings/page.tsx`
  - `app/admin/organization/page.tsx`
  - `app/admin/staff/page.tsx`

- Enterprise module has AdminDashboardEngine, MultiTenantEngine, AnalyticsEngine
- These are pure business logic, not wired into the admin UI

### 11.2 What's Missing

- **AMEXAN Admin Console** (platform-level, not hospital-level):
  - No user management across all tenants
  - No subscription management
  - No verification management
  - No marketplace management
  - No education management
  - No research management
  - No integration management
  - No deployment monitoring
  - No AI model management
  - No constitution management
  - No customer management
  - No support tickets
  - No telemetry dashboard
  - No performance monitoring

The constitution says "AMEXAN Admin never edits patient notes. AMEXAN monitors Platform, Rules, Knowledge, Quality, Telemetry, Performance, Security, Customers, Subscriptions, Verification, Marketplace, Education, Research, Integrations, Support, Deployment, AI, Constitution." This admin console does NOT exist.

---

## 12. THEMES & CUSTOMIZATION — Preference Engine

### 12.1 Current State

- Theme engine (`theme-engine.ts`) has role-based color schemes
- 8 role themes defined (doctor, nurse, student, patient, pharmacist, administrator, community_health_worker, researcher)
- Each has: primaryColor, secondaryColor, accentColor, iconSet, layout, showPatientList, showSearch, showNotifications
- Brand config with facility name, colors, logo, font
- CSS variable generation ✓
- Accessibility rules (font size, reduced motion, focus ring, touch target) ✓
- Device-aware layout (sidebar, topbar, combined, minimal) ✓

### 12.2 What's Missing

- **No hospital customization UI** — Hospitals can't customize their theme through the app
- **No theme persistence per org** — Themes are hardcoded, not stored per organization
- **No white-label admin** — No admin panel for hospitals to manage their branding
- **No language customization** — Only English supported
- **No terminology customization** — No way to change department names, protocol names, etc.
- **No layout customization** — Layout is role-based, not user-customizable
- **No shortcut customization** — Not implemented
- **No dashboard layout persistence** — Not implemented

The constitution says hospitals should customize "Logo, Colors, Fonts, Layout, Landing pages, Menus, Terminology, Departments, Protocols, Languages, Insurance, Reports, Branding" WITHOUT changing engines. This is not implemented.

---

## 13. IDENTITY — AMXID System

### 13.1 Current State

- `lib/amexan/constitution/amxuid.ts` generates AMXIDs with prefixes: PER, ORG, DEV, AI, SYS, PAT
- `lib/amexan/identity/amxuid.ts` (identity module) uses prefixes: PER, ORG, DEV, AI, SYS (PLUS PAT in a separate file)
- Checksum validation ✓
- Parse/validate/getType functions ✓
- `lib/amexan/identity/types.ts` has IdentityType: Human, Organization, Device, AI, System

### 13.2 Gaps vs Constitution

The constitution specifies these AMXID prefixes that DO NOT EXIST:
- `AMX-DOC` (Doctor) — MISSING
- `AMX-STU` (Student) — MISSING
- `AMX-HOS` (Hospital) — MISSING
- `AMX-LAB` (Laboratory) — MISSING
- `AMX-ADM` (Admin) — MISSING

The current system only generates AMX-PER, AMX-ORG, AMX-DEV, AMX-AI, AMX-SYS, AMX-PAT. Every clinician, student, hospital, lab, and admin gets the wrong prefix or falls back to PER/ORG instead of their constitutional prefix.

---

## 14. SUMMARY — What Works vs What Doesn't

### What Works Well
1. **Constitutional architecture** — Well-designed separation of concerns
2. **Actor model** — Clean concept of Actor extending to all user types
3. **AuthN / AuthZ separation** — Firebase for identity, `can()` for authorization
4. **Firestore rules** — Comprehensive org-scoped rules
5. **Proxy.ts JWT verification** — Proper RS256 verification with Google JWKS
6. **Session management** — Cookie-based with 45-min refresh
7. **Verification ladder types** — Well-defined staged verification
8. **Presentation engine config** — Good device/role/accessibility awareness
9. **HMIS type definitions** — Comprehensive and well-structured
10. **Enterprise module** — Good business logic structures for admin, multi-tenant, analytics
11. **Storage engine** — Clean query interface (even if in-memory)
12. **Notification engine** — Comprehensive types and rules
13. **Analytics engine** — Good report/query/model type definitions
14. **Homepage** — Follows CEO feedback well
15. **Login page** — Multiple auth methods with good UX
16. **Patient dashboard** — Very comprehensive for patient use
17. **Recovery page** — Real backup code generation/verification
18. **All 44 tests pass** — No regressions

### Critical Gaps (Would Block Production)
1. **No PostgreSQL/Neo4j/Redis/Object Storage** — System runs entirely on Firestore
2. **No actual notification delivery** — Types exist but no actual sending
3. **No HMIS UI pages** — Hospital staff have no interface to use HMIS
4. **No encounter creation/transition UI** — State machine exists but no UI
5. **No subscription/capability gating in runtime** — Engine exists but not wired
6. **No verification gating in runtime** — Ladder exists but doesn't gate features
7. **No AMX-DOC/AMX-STU/AMX-HOS/AMX-LAB/AMX-ADM prefixes** — Identity system incomplete
8. **No AMEXAN admin console** — Platform admin doesn't exist
9. **No multi-tenancy hierarchy** — Country/Region/Network/Dept/Ward not implemented in runtime
10. **All HMIS engines are pure TypeScript** — No persistence, no real data

### Medium Gaps (Would Limit Capabilities)
11. **No actual analytics pipeline** — Types exist but no data/ML
12. **No theme customization UI** — Hospitals can't brand their instance
13. **No consent/delegation UI** — Engine exists but not in the app
14. **No learning/competency UI** — Engine exists but not in the app
15. **No marketplace UI** — Engine exists but not in the app
16. **No protocol version management UI** — Engine exists but not in the app
17. **No FHIR/DICOM/LIS/PACS/HL7 real integrations** — Adapters exist but no endpoints
18. **No AI reasoning integration in dashboard** — Clinical reasoning engines exist but not in dashboard
19. **No research module UI** — Engine exists but not in the app
20. **No education module UI** — Engine exists but not in the app

---

## 15. RECOMMENDED PRIORITY ACTIONS

### P0 — Must Have (Blocks Production)
1. Wire Capability Engine into proxy.ts middleware for route-level gating
2. Wire Verification Ladder into middleware (level gates access to features)
3. Add AMX-DOC, AMX-STU, AMX-HOS, AMX-LAB, AMX-ADM prefixes to amxuid.ts
4. Build HMIS UI pages for hospital staff (encounter flow, patient registration, order entry)
5. Build AMEXAN admin console (platform-level monitoring, user management, subscription management)
6. Integrate notification delivery (at minimum email via SendGrid/SES)
7. Wire subscription tiers into UI (hide/disable features based on tier)
8. Wire consent/delegation engine into AuthContext

### P1 — Should Have (Core Healthcare OS Capabilities)
9. Implement multi-tenancy hierarchy in orgContext (Country→Region→Network→Hospital→Dept→Ward)
10. Build PostgreSQL storage adapter for identity/workflow/transactions
11. Build Neo4j knowledge graph service for clinical reasoning
12. Build Redis cache for session/notification/analytics
13. Build theme customization UI for hospitals
14. Build learning/competency UI for students
15. Build marketplace UI for module management
16. Wire FHIR adapter to real FHIR server endpoint
17. Wire DICOM adapter to real PACS endpoint
18. Wire LIS adapter to real lab system endpoint

### P2 — Nice to Have (Advanced Capabilities)
19. Build analytics data pipeline with real ML models
20. Build research module UI
21. Build education module UI
22. Build telemedicine module with real video integration
23. Build AI reasoning integration into dashboard
24. Build protocol version management UI
25. Build patient portal with guardian/consent management
26. Build biometric enrollment and verification
27. Build offline sync for HMIS
28. Build internationalization (multiple languages)

---

## 16. FILES INVENTORY — Key System Files

### Authentication & Authorization
- `context/AuthContext.tsx` — Auth state, session loading, dashboard generation
- `proxy.ts` — JWT verification, route protection
- `lib/firebase/authService.ts` — Firebase auth integration
- `lib/firebase/actorService.ts` — Actor session composition
- `lib/firebase/verificationService.ts` — Verification ladder persistence
- `lib/firebase/orgContext.ts` — Active org context (localStorage)
- `lib/client/session.ts` — __session cookie helper
- `app/(auth)/login/page.tsx` — Login page (email, SSO, passkey, magic link)
- `app/(auth)/register/constitution/page.tsx` — Constitutional registration
- `app/(auth)/quick-register/page.tsx` — Quick registration
- `app/(auth)/recovery/page.tsx` — Password recovery with backup codes
- `app/verify/page.tsx` — Verification ladder UI
- `firestore.rules` — Org-scoped Firestore rules

### Dashboards
- `app/dashboard/page.tsx` — Main dashboard (actor-aware)
- `app/dashboard/patient/page.tsx` — Patient dashboard
- `app/dashboard/patient/medication/page.tsx` — Patient medication
- `app/dashboard/patient/appointments/page.tsx` — Patient appointments
- `app/dashboard/patient/book/page.tsx` — Patient booking
- `app/dashboard/doctor/page.tsx` — Doctor dashboard
- `app/dashboard/doctor/patient/[patientId]/page.tsx` — Doctor → Patient
- `app/dashboard/cos-*.page.tsx` — COS (Clinical Operating System) dashboards

### HMIS EMR
- `lib/amexan/hmis/hospital-model.ts` — Hospital hierarchy (14 levels)
- `lib/amexan/hmis/user-model.ts` — Actor model, roles, sessions, tasks
- `lib/amexan/hmis/identity.ts` — Universal identity, multi-identifier system
- `lib/amexan/hmis/encounter-lifecycle.ts` — 16-state encounter state machine
- `lib/amexan/hmis/task-engine.ts` — Task assignment engine
- `lib/amexan/hmis/notification-engine.ts` — 37 notification types, 10 channels
- `lib/amexan/hmis/orders-engine.ts` — Order management
- `lib/amexan/hmis/results-engine.ts` — Lab/radiology results
- `lib/amexan/hmis/pharmacy-engine.ts` — Pharmacy management
- `lib/amexan/hmis/laboratory-engine.ts` — LIS integration types
- `lib/amexan/hmis/radiology-engine.ts` — PACS integration types
- `lib/amexan/hmis/theatre-engine.ts` — Operating theatre management
- `lib/amexan/hmis/billing-engine.ts` — Invoices, payments, insurance claims
- `lib/amexan/hmis/scheduling-engine.ts` — Appointment scheduling
- `lib/amexan/hmis/referral-engine.ts` — Referral management
- `lib/amexan/hmis/public-health-engine.ts` — Public health reporting
- `lib/amexan/hmis/research-engine.ts` — Research data management
- `lib/amexan/hmis/audit-engine.ts` — Audit logging
- `lib/amexan/hmis/integration-engine.ts` — External system integration
- `lib/amexan/hmis/offline-engine.ts` — Offline capability
- `lib/amexan/hmis/event-bus-engine.ts` — Event-driven architecture
- `lib/amexan/hmis/analytics-engine.ts` — Analytics, reports, ML models
- `lib/amexan/hmis/resource-engine.ts` — Resource management
- `lib/amexan/hmis/index.ts` — HMIS barrel export (24 books)

### Constitution Engines (Built in Tiers 1-3)
- `lib/amexan/constitution/amxuid.ts` — AMXID generation (missing DOC/STU/HOS/LAB/ADM)
- `lib/amexan/constitution/auth.ts` — Dashboard generation, session management
- `lib/amexan/constitution/verification.ts` — Verification ladder (6 levels)
- `lib/amexan/constitution/role-permissions.ts` — Permission map for all actor types
- `lib/amexan/constitution/capability-engine.ts` — 4 subscription tiers
- `lib/amexan/constitution/consent-engine.ts` — Consent grants + delegation
- `lib/amexan/constitution/protocol-version-engine.ts` — Country/hospital overrides
- `lib/amexan/constitution/learning-engine.ts` — Competency tracking + case diary
- `lib/amexan/constitution/marketplace-engine.ts` — 10 pre-registered modules
- `lib/amexan/constitution/types.ts` — All constitutional types
- `lib/amexan/constitution/index.ts` — Constitution barrel export

### Presentation Engine
- `lib/amexan/presentation/theme-engine.ts` — Role-based themes, CSS vars
- `lib/amexan/presentation/presentation-engine.ts` — Config layer for rendering
- `lib/amexan/presentation/dashboard-generators.ts` — Actor-aware dashboard generation
- `lib/amexan/presentation/types.ts` — Dashboard template types
- `lib/amexan/presentation/index.ts` — Presentation barrel export

### Storage & Integration
- `lib/amexan/storage/engine.ts` — In-memory fact store (dev only)
- `lib/amexan/integration/adapters/fhir-adapter.ts` — FHIR R4 adapter
- `lib/amexan/integration/adapters/dicom-adapter.ts` — DICOM adapter
- `lib/amexan/integration/adapters/hl7-adapter.ts` — HL7 adapter
- `lib/amexan/integration/adapters/lis-adapter.ts` — LIS adapter
- `lib/amexan/integration/adapters/pacs-adapter.ts` — PACS adapter
- `lib/amexan/integration/adapters/national-registry-adapter.ts` — National registry

### Enterprise
- `lib/amexan/enterprise/admin-dashboard-engine.ts` — Admin dashboards
- `lib/amexan/enterprise/multi-tenant-engine.ts` — Multi-tenancy
- `lib/amexan/enterprise/analytics-engine.ts` — Analytics pipeline
- `lib/amexan/enterprise/business-constitution.ts` — Business types
- `lib/amexan/enterprise/marketplace-engine.ts` — Enterprise marketplace

### Identity
- `lib/amexan/identity/amxuid.ts` — AMXID generation (PER/ORG/DEV/AI/SYS/PAT)
- `lib/amexan/identity/types.ts` — Identity types (AmxUid, Identity, Session, etc.)
- `lib/amexan/identity/auth.ts` — Identity authentication
- `lib/amexan/identity/verification.ts` — Identity verification
- `lib/amexan/identity/session.ts` — Session management
- `lib/amexan/identity/recovery.ts` — Identity recovery
- `lib/amexan/identity/digital-signature.ts` — Digital signatures

### Patient Constitution
- `lib/amexan/patient-constitution/` — APOS (AMEXAN Patient Operating System), 5 volumes

### Clinical Constitutions
- `lib/amexan/clinical-constitution/` — Book II (Patient Journey, Encounter, Workflow) + Book III (Doctor ADOS)

### HMIS HMIS (duplicate module)
- `lib/amexan/hmis/` — Universal Hospital Information Management System, 24 books

### Enterprise (duplicate module)
- `lib/amexan/enterprise/` — Business constitution, admin, multi-tenant, analytics

---

## 17. COMPLETE USER JOURNEY AUDIT

### Journey 1: Patient Registration → Dashboard

1. Patient visits homepage → sees hero, ecosystem, "Get Started" CTA ✓
2. Patient clicks "Get Started" → `/register` ✓
3. Patient fills registration form → creates identity + person ✓
4. **Missing:** No org selection, no role assignment, no verification step
5. Patient redirected to `/quick-register` → `ensureActor()` creates Actor with AMXID ✓
6. Patient logs in → `loadUserSession()` loads actor session ✓
7. Verification state checked → if email not verified, redirect to `/verify` ✓
8. Patient reaches `/dashboard` → `generateActorDashboard(session)` generates patient dashboard ✓
9. Patient dashboard shows: appointments, medications, vitals, education, telemedicine, bills, insurance, follow-up ✓
10. **Missing:** No consent management, no guardian setup, no family member management

### Journey 2: Doctor Registration → Dashboard

1. Doctor visits homepage → sees hero ✓
2. Doctor clicks "Get Started" → `/register` ✓
3. Doctor fills constitutional registration → identity + person + professional ✓
4. **Missing:** No org selection, no department assignment, no specialty assignment
5. Doctor logs in → `loadUserSession()` tries `getActorSession()` first ✓
6. Falls back to legacy if actor not found ✓
7. Doctor reaches `/dashboard` → `generateActorDashboard(session)` generates doctor dashboard ✓
8. Doctor dashboard shows: ward round, admissions, pending signatures, pending orders, tasks, research, teaching, analytics ✓
9. **Missing:** No verification step for professional license, no hospital affiliation confirmation

### Journey 3: Hospital Admin Registration → HMIS

1. **Missing:** No hospital registration flow exists
2. **Missing:** No HMIS admin dashboard for hospital management
3. **Missing:** No encounter creation workflow
4. **Missing:** No patient registration within HMIS
5. **Missing:** No bed management UI
6. **Missing:** No order entry UI
7. **Missing:** No results viewing UI
8. **Missing:** No billing UI

### Journey 4: Student Registration → Dashboard

1. Student visits homepage ✓
2. Student registers ✓
3. Student logs in ✓
4. Student dashboard should show: learning, cases, supervisor feedback, logbook, procedures, assignments, OSCE
5. **Partially built** — student dashboard sections exist in dashboard-generators.ts but the student dashboard page (`app/dashboard/page.tsx`) doesn't have a dedicated student view yet
6. **Missing:** No learning path UI, no case diary UI, no rotation management UI, no competency tracking UI

### Journey 5: Admin Logs In → Platform Admin Console

1. **Missing:** No AMEXAN admin login exists
2. **Missing:** No admin console for platform-level operations
3. Enterprise module has AdminDashboardEngine but it's not wired to any page
4. `app/admin/` pages exist but are hospital-level admin, not platform-level AMEXAN admin
5. **Missing:** AMEXAN admin console that monitors Platform, Rules, Knowledge, Quality, Telemetry, Performance, Security, Customers, Subscriptions, Verification, Marketplace, Education, Research, Integrations, Support, Deployment, AI, Constitution

---

## END OF AUDIT
