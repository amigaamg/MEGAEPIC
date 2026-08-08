# Chapter 08: Knowledge Graph — The Clinical Context Engine

**Engine 8**

---

## 8.1 Constitutional Purpose

Connect everything the clinician already knows about the patient so the clinician does not
have to mentally assemble it from twenty screens. This is where AMEXAN's Neo4j layer
becomes genuinely useful.

> **The Knowledge Graph is not a decorative AI map. It is the connective tissue that lets
> the clinician traverse *why* this patient is where they are.**

It answers: **What is every piece of this patient's story, and how are the pieces related?**

---

## 8.2 The Graph Is Not a New Store

Everything in Engines 1–7 already produces graph-shaped data (patient → encounter →
problem → order → result → document → outcome). The Knowledge Graph makes those
relationships **first-class and traversable** — it is *derived* from PostgreSQL facts, never a
separate source of truth.

---

## 8.3 Knowledge Graph UI

The screen begins with the **patient**, not with a generic graph.

```text
KNOWLEDGE GRAPH

Patient: Mary A.
Encounter: ENC-20481
Current problem: Severe pneumonia

[Clinical Context] [Problems] [Investigations]
[Medications] [Procedures] [Risks] [History]
```

Central relationship view:

```text
                         Risk Factors
                              │
                              ▼
Patient ───────► Pneumonia ◄────── Symptoms
   │                │
   │                ├────► Investigations
   │                │
   │                ├────► Results
   │                │
   │                ├────► Medications
   │                │
   │                ├────► Procedures
   │                │
   │                └────► Outcomes
   │
   ├──── Previous admissions
   ├──── Allergies
   ├──── Chronic conditions
   └──── Previous medications
```

A proper graph visualization library renders this; relationships are drawn, not manually
placed.

### UI principles

- No more than **6–7 visible nodes** per surface — avoid clutter.
- Every edge is a **typed relationship with an edge label**, never a bare line.
- Every node is **click-open** without losing patient context.
- Views are **persona-filtered** (doctor / nurse / lab see role-appropriate surfaces).

---

## 8.4 The Graph Must Answer Clinical Questions

Clicking **Problem → Pneumonia** reveals:

```text
symptoms supporting it
observations
examination findings
investigations
results
treatment
clinical response
complications
previous episodes
```

Clicking **Medication → Ceftriaxone** reveals the full chain:

```text
Prescription
      ↓
Order
      ↓
Dispensing
      ↓
Administration
      ↓
Indication
      ↓
Relevant diagnosis
      ↓
Clinical response
```

This is far more useful than a medication list.

---

## 8.5 Typed Nodes and Edges

**Node types (structural facts):**

```text
PATIENT, ENCOUNTER, PROBLEM, SYMPTOM, OBSERVATION, ORDER,
RESULT, MEDICATION, PROCEDURE, OUTCOME, PRACTITIONER,
FACILITY, LOCATION
```

**Edge types (typed, named relationships):**

```text
HAS_PROBLEM, TREATED_BY, EXPLAINED_BY, INDICATES_CHANGE,
REQUIRED_BY, PRODUCED_BY, INTERACTS_WITH, COMPLICATES,
ASSOCIATED_WITH, AUTHORED, DESCRIBES, FOLLOWED_BY, PRECEDED
```

Example:

```text
(Mary A.)        -[:HAS_PROBLEM]->      (CAP)
(CAP)            -[:TREATED_BY]->       (Ceftriaxone)
(CAP)            -[:EXPLAINED_BY]->     (CXR consolidation)
(Ceftriaxone)    -[:INDICATED_FOR]->    (CAP)
```

Typed edges are what make reasoning and reconstruction possible.

---

## 8.6 Provenance on Every Node and Edge

The graph must never let an **inferred** relationship look like an **established fact**.

```text
PATIENT —[:HAS_ALLERGY]-> Penicillin

Source:        Patient history
Recorded by:   Dr X
Encounter:     Enc-20461
Date:          2026-08-07
Evidence:      Patient-reported
Status:        Active
```

Every edge records: edge type, source object, target object, sourceId, evidenceId[],
clinicalAuthority, setBy, at, supersedesWhen.

---

## 8.7 Graph Modes

- **Clinical** — problems, symptoms, signs, investigations, treatment, outcomes
- **Medication** — indication, dose, interactions, administration, response
- **Investigation** — test, reason, result, trend, interpretation, related problem
- **Longitudinal** — previous episodes, current episode, recurrences, complications,
  outcomes
- **Family / risk** — only where appropriately documented and authorized

---

## 8.8 Graph Search

Search understands clinical objects:

```text
"all previous admissions"
"all antibiotics"
"all Hb results"
"all previous breast biopsies"
"medications stopped"
"unresolved problems"
```

The result takes the clinician directly to the relevant subgraph, in patient context.

---

## 8.9 Cross-Cutting Rules

### KG-001 — Derived, never authoritative
```
Rule:      The Knowledge Graph always derives from PostgreSQL facts
Behavior:  A graph relationship or edge cannot change clinical truth
Status:    Active
```

### KG-002 — Typed but always typed
```
Rule:      No free-text relationships on edges
Behavior:  All edges use typed edge names; free text not allowed as an edge
Status:    Active
```

### KG-003 — Provenance required
```
Rule:      Every node/edge records provenance
Behavior:  Missing provenance → mark as inferred, not established
Status:    Active
```

### KG-004 — No orphan or zombie entities
```
Rule:      No orphaned or zombie entities may exist
Behavior:  A result without an order, or an inferred relationship,
           is blocked or clearly flagged
Status:    Active
```

### KG-005 — Context preserved on navigation
```
Rule:      Opening from a patient source preserves patient context
Behavior:  Navigating from any node keeps the patient, encounter, and
           relevant problem accessible in few clicks
Status:    Active
```

---

## 8.10 Database Mapping

- **PostgreSQL**: nodes & facts (authoritative)
- **Neo4j**: derived relationships and traversable context
- **Firestore**: reversible but live selection, open node state, search state