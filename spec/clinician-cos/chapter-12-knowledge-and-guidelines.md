# Chapter 12: Knowledge & Guidelines — The Governed Truth

**Engine 12**

---

## 12.1 Constitutional Purpose

Knowledge must be:

- **Governed** — approved and versioned
- **Contextualized** — matched to specialty, problem, setting, and patient
- **Point-of-care** — available inside the patient workspace
- **Traceable** — the clinician can see which guideline informed a recommendation

---

## 12.2 Knowledge Objects

```text
Guidelines
Protocols
Clinical pathways
Formularies
Reference ranges
Quick references
Calculators (eGFR, GCS, sepsis score, PRISM)
Evidence summaries
Drug references
Local policies
External / global knowledge
```

---

## 12.3 Governance Through Publication

```text
EVIDENCE
   ↓
REVIEW (draft)
   ↓
APPROVAL (authorized committee)
   ↓
VERSION CONTROL
   ↓
PUBLICATION (active)
   ↓
RETIREMENT (superseded)
```

Every guideline carries metadata:

```text
Version
Status (draft / under-review / active / superseded / retired)
Authoring body / committee
Approved date
Effective date
Supersedes
```

**No silent obsoletion.**

---

## 12.4 Point-of-Care Delivery

Inside the encounter (doctor opens "hyperkalemia"):

```text
KNOWLEDGE
────────────────────────
[Guideline] [Hospital Protocol] [Quick Reference]
[Calculator] [Related Cases]
```

No leaving the patient context.

---

## 12.5 Guideline → Decision-Support Binding

Guidelines can carry computable parameters:

```text
Protocol: Sepsis bundle
When suspicion: lactate, cultures, fluids < 1 hr
IF threshold reached → surface recommendation
```

Each suggestion is traced back to the supporting protocol line so the clinician can
always verify the reasoning.

---

## 12.6 Institutional Adoption Loop

New content flows into care with governance:

```text
New evidence published
   ↓
Local approval
   ↓
Versioning
   ↓
Deployed to care
   ↓
Usage & feedback tracked
   ↓
Periodic review
```

Never auto-overwriting existing care.

---

## 12.7 Cross-Cutting Rules

### KN-001 — Governed and versioned
```
Rule:      No knowledge is live without approval and versioning
Status:    Active
```

### KN-002 — Point-of-care delivery
```
Rule:      Knowledge is available inside the patient workspace
Status:    Active
```

### KN-003 — Traceable recommendations
```
Rule:      Every guideline-driven suggestion cites its source
Status:    Active
```

### KN-004 — Contextualized
```
Rule:      Content adapts to specialty, setting, and patient
Status:    Active
```

---

## 12.8 Database Mapping

- **PostgreSQL**: guidelines, versions, approvals, publications
- **Neo4j**: relationships between-related topics, bundles, prerequisite
- **Firestore**: point-of-care lookup and live cache