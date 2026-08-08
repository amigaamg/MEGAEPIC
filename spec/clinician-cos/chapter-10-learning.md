# Chapter 10: Learning — The Continuous Clinical Improvement Engine

**Engine 10**

---

## 10.1 Constitutional Purpose

Not a school dashboard. This is the clinician's professional learning loop embedded directly
into clinical work.

**Every clinical encounter can become an opportunity to improve knowledge, skills, safety,
and system performance — without disrupting care.**

---

## 10.2 Learning Center

```text
LEARNING
────────────────────────
Clinical Learning
Cases
Guidelines
Feedback
Reflection
Competencies
CME
Research
```

---

## 10.3 Case-Based Learning

After an encounter, AMEXAN may optionally offer a case review:

```text
CASE REVIEW
You managed:
Severe community-acquired pneumonia

[Review Case]
```

A case review draws on already-recorded data:

```text
Clinical presentation
Investigations
Management
Response
Outcome
```

The clinician reviews without recreating the case by hand.

---

## 10.4 Point-of-Care Learning

Opening a topic (e.g., hyperkalemia) surfaces knowledge inline:

```text
KNOWLEDGE
────────────────────────
Hyperkalemia
[Guideline] [Hospital Protocol] [Quick Reference]
[Calculator] [Related Cases]
```

The clinician never leaves the patient workspace to search externally.

---

## 10.5 Guideline Learning

Connect hospital protocols to current knowledge and flag updates:

```text
SEPSIS
Hospital pathway
Current guideline
Key changes
Clinical application
```

```text
Knowledge update available
```

Updates are surfaced, never silently applied.

---

## 10.6 CME

Facility administrators configure institutional CME; the clinician sees a personal view:

```text
MY CME
────────────────────────
Completed              18 hrs
Required               20 hrs
Remaining               2 hrs

UPCOMING
Sepsis Update                 Thursday 14:00
Mortality & Morbidity          Friday 08:00
Antimicrobial Stewardship      Monday 13:00
```

---

## 10.7 Morbidity & Mortality Learning

A case can move through a learning pipeline:

```text
Clinical Event
      ↓
Quality Review
      ↓
M&M Meeting
      ↓
Learning Point
      ↓
Protocol / Workflow Change
      ↓
Future Clinical Practice
```

Answer: **What did the hospital learn from this event?**

---

## 10.8 Feedback

Structured and contextual:

```text
FEEDBACK
────────────────────────
Clinical documentation    ████████░░
Protocol adherence        █████████░
Communication             ███████░░░
Patient follow-up         ████████░░
```

Feedback must be fair and contextual, never crude surveillance.

---

## 10.9 Competencies

For clinicians under supervised development:

```text
COMPETENCIES
────────────────────────
Central line        ✓ Observed · Assisted · Performed under supervision
Lumbar puncture     ✓ Observed · ⚠ Requires supervised attempt
Airway management   ✓ Competent
```

Linked to credentials, privileges, procedures, supervision, and training.

---

## 10.10 Learning → Clinical Intelligence

Institutional learning must carry governance:

```text
Repeated clinical problem
        ↓
Multiple cases
        ↓
Outcome analysis
        ↓
Quality review
        ↓
Knowledge update
        ↓
Protocol review
```

The system never silently rewrites a protocol because an algorithm noticed a pattern.
There must always be:

**Evidence → Review → Governance → Approval → Publication**

---

## 10.11 Cross-Cutting Rules

```text
### L-001 — Embedded, not separate
Rule:      Learning lives inside the clinical workspace
Behavior:  Offer options at the appropriate moment without disrupting the workflow
Status:    Active
```

### L-002 — Governed knowledge
```
Rule:      Protocol/behavioral changes require approval
Behavior:  No silent protocol modification by any model
Status:    Active
```

### L-003 — Consent-aware case sharing
```
Rule:      Cases shared only with appropriate authorization
Behavior:  Optional, de-identified, ethics-compliant
Status:    Active
```

### L-004 — Context preserved
```
Rule:      Opening Learning from any screen keeps the current scenario in context
Status:    Active
```

---

## 10.12 Database Mapping

- **PostgreSQL**: courses, sessions, competencies, credential records
- **Neo4j**: progression graphs, prerequisites, learning paths
- **Firestore**: live progress, attendance, real-time notifications