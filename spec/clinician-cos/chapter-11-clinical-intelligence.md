# Chapter 11: Clinical Intelligence — The Reasoning Layer

**Engine 11**

---

## 11.1 Constitutional Purpose

Ten engines produce rich, structured, connected data. Clinical Intelligence converts that data
into **clinical knowledge and decision support** — without ever confusing assistance with
decision-making.

> **The system makes the clinician aware. It never makes the decision for the clinician.**

---

## 11.2 The Guiding Boundary

Every intelligence output passes a constitutional test:

```text
"Does this help the clinician reach a MORE INFORMED decision,
 while preserving clinical responsibility?"
```

AMEXAN generates three kinds of outputs:

```text
SIGNALS        something worth noticing
SUGGESTIONS    something the clinician may consider
CONTEXTS       something the workflow requires attention for
```

It never issues **silent conclusions**.

```text
✓ "SpO₂ has fallen 8% in 25 min; RR and HR are rising. Review suggested."
✗ "This is pneumonia."
```

---

## 11.3 Intelligence Modes

| Mode | Behavior | Example |
|------|----------|---------|
| LAB | Responds to a clinical action | Validates a medication dose |
| SUGGESTIVE | Surfaces something needing attention | Deteriorating trend flag |
| PREDICTIVE | Anticipates trajectory | Readmission risk estimate |
| PREVENTIVE | Nudges a safety-critical check | Renal–drug interaction |

---

## 11.4 Intelligence Surfaces

### Order intelligence (at order time)

```text
Ceftriaxone
⚠ Allergy check: no penicillin allergy on file
⚠ Renal dose: eGFR 30 — consider adjustment
⚠ Duplicate: Ceftriaxone ordered 2 hours ago
⚠ Interaction: concurrent nephrotoxicity agent
[Review] [Proceed]
```

### Investigation intelligence

```text
CBC ordered
Recent result available (20 min ago).
Repeat recommended only under specific circumstances.
[View prior result]
```

### Result intelligence (on review)

```text
Hb 8.4 → 8.7 → 9.1
Trend: improving, consistent with treatment.
MCV 72 : microcytic picture.
```

### Monitoring intelligence

As defined in Engine 5 — change detection, trend, escalation.

---

## 11.5 Risk Modeling

Risk is **decision support**, never a verdict label:

```text
SEPSIS RISK (derived)
• suspected infection
• RR 32
• HR 118
• BP 104/68

Derived risk cannot substitute clinical judgment.
[Review] [Document decision]
```

Every derived risk shows the **contributing features** and an **[Explain]** action.

---

## 11.6 Explainability

```text
WHY did the intelligence fire?
SpO₂ 89% — across the last 3 values, change ≥ 10 pts
vs baseline → triggered High-priority change alert.
```

No black-box assertions. **Everything scrutable.**

---

## 11.7 Provenance & Acknowledgement

Each suggestion records:

```text
Triggered by      rule / observation / model
Evidence          underlying cause observations
Clinical basis    pathway or rule id
Presented         when, to whom
Action taken / dismissed
```

Enables interception, auditability, and guarantees intelligence never becomes
silent policy.

---

## 11.8 Intelligence Loop

```text
Monitor → Detect → Propose → Review → Decision → New Order → Back to Monitor
```

---

## 11.9 Safety Boundary (Constitutional)

```text
AMEXAN MAY:    surface, prompt, explain, recommend
AMEXAN MAY NOT: silently diagnose, silently change orders,
                overrule a clinician, or present a derived
                suggestion as established fact.
```

---

## 11.10 Cross-Cutting Rules

### CI-001 — Suggest, never conclude
```
Rule:      Intelligence never issues closed conclusions
Behavior:  Outputs are signals, suggestions, contexts only
Status:    Active
```

### CI-002 — Always explainable
```
Rule:      Every derived statement has an explanation path
Behavior:  [Explain] leads to evidence-based reasoning and sources
Status:    Active
```

### CI-003 — Traceable provenance
```
Rule:      Every suggestion records trigger, basis, presentation, action
Status:    Active
```

### CI-004 — Clinician responsibility preserved
```
Rule:      No silent changes to orders, protocols, or workflows
Status:    Active
```

### CI-005 — Context maintained
```
Rule:      Intelligence surfaces remain in patient/encounter context
Status:    Active
```

---

## 11.11 Database Mapping

- **PostgreSQL**: rules, decision logs, audit, suggestions
- **Neo4j**: reasoning over connected patient context
- **Firestore**: live delivery and acknowledgement state