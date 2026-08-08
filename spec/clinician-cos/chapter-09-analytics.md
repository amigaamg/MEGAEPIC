# Chapter 09: Analytics — The Clinician's Decision & Performance Layer

**Engine 9**

---

## 9.1 Constitutional Purpose

Analytics must not become a miniature CEO dashboard. The doctor's analytics answer:

> **What is happening with my patients, my workload, my outcomes, and my clinical
> processes?**

---

## 9.2 Clinician Analytics Landing

```text
CLINICAL ANALYTICS

MY PATIENTS
────────────────────────
Active patients             42
Patients requiring review    7
Critical                     2
Pending results              5

CLINICAL TODAY
────────────────────────
Encounters                   18
Orders                       46
Results reviewed             31
Notes completed              14
Pending documentation         2
```

Followed by trends.

---

## 9.3 Patient Analytics

Selectable scope:

```text
[My Patients] [My Department] [My Clinic] [My Ward] [Date Range]
```

**Caseload** — active patients, admissions, discharges, transfers, follow-ups,
readmissions.

**Clinical workload** — encounters, ward rounds, procedures, orders, prescriptions,
documentation.

**Results** — pending investigations, critical results, overdue reviews, unresolved
abnormalities.

---

## 9.4 Clinical Trend Analytics

Use Recharts where it genuinely aids interpretation, not for decoration.

```text
Hb trend
12 ┤ ●
11 ┤   ●
10 ┤      ●
 9 ┤         ●
 8 ┤            ●
   └────────────────
     Day1 Day2 Day3 Day4
```

Overlay clinically meaningful events on the same axis:

```text
Medication start · Procedure · Transfusion · Discharge
```

---

## 9.5 Outcome Analytics

For appropriately authorized and sufficiently mature datasets:

```text
MY PATIENT OUTCOMES
────────────────────────
Average LOS
Readmission rate
Complication rate
Treatment response
Follow-up completion
Mortality
```

**Never** become a naive clinician ranking. A raw mortality number without case-mix,
severity, referral patterns, and population is clinically misleading — the system always
shows the surrounding context.

---

## 9.6 Workload Intelligence

One of the great clinician problems is invisible workload. AMEXAN calculates:

```text
Patients under active care
Encounters per day
Documentation time
Order volume
Results requiring review
Pending tasks
After-hours activity
```

And reports a single signal: **Current workload: high**.

---

## 9.7 Cognitive-Load Dashboard

```text
COGNITIVE ATTENTION LOAD
────────────────────────
Critical issues              2
Results awaiting review      5
Unsigned documentation       2
Medication actions           3
Pending follow-ups           4
────────────────────────
TOTAL ACTIONABLE ITEMS      16
```

Then prioritize:

```text
NOW    1. Critical patient deterioration
NEXT   2. Critical laboratory result
       3. Medication review
LATER  4. Routine documentation
       5. Follow-up planning
```

---

## 9.8 Drill-Down: No Dead Statistics

Every number is clickable and resolves to the underlying items:

```text
Pending results = 5   → opens the 5 results
Active patients = 42  → opens the patient list
Unsigned notes = 2    → opens those documents
```

---

## 9.9 Analytics → Intelligence

Analytics surfaces operational patterns that reduce cognitive load:

```text
You have 12 patients with pending laboratory results.
3 are clinically significant.
2 relate to patients with active treatment decisions.

[Review significant results]
```

---

## 9.10 Cross-Cutting Rules

### ANL-001 — No dead statistics
```
Rule:      Every analytic number is clickable
Behavior:  Clicking a metric opens its underlying cases
Status:    Active
```

### ANL-002 — Context not punitive
```
Rule:      Outcome and workload figures show contextual factors
Behavior:  No raw clinician ranking without case-mix context
Status:    Active
```

### ANL-003 — Patient-first scope
```
Rule:      Analytics default to the patient list/cohort scope
Behavior:  Open from a patient → preserve patient context
Status:    Active
```

### ANL-004 — Charts are functional
```
Rule:      Recharts used for trends, not decoration
Behavior:  Every chart supports overlay, time range, drill-down
Status:    Active
```

---

## 9.11 Database Mapping

- **PostgreSQL**: authoritative counts, outcomes, workload facts
- **Neo4j**: pattern/relationship queries across connected patients
- **Firestore**: live counters, real-time refresh state