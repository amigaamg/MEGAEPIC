# Chapter 1: Design Principles & Object Model

## 1.1 Clinical Philosophy

The AMEXAN Clinical OS is built on the principle that **clinical software should mirror clinical thinking**, not paper forms.

### 1.1.1 Seven-Layer Object Model

All data in AMEXAN is one of seven types:

```
ENTITY        → Nouns (patient, encounter, clinician, disease, drug)
OBSERVATION   → All clinical data points
EVENT         → Immutable state transitions
RULE          → CRL behavior rules
INFERENCE     → Bayesian evidence relationships
WORKFLOW      → State machines
DOCUMENT      → Rendered views of observations
```

### 1.1.2 Separation of Concerns

```
Medical Knowledge (what is true)
        ↓
Clinical Rules (what to do)
        ↓
Reasoning Engine (what is likely)
        ↓
Workflow Engine (what happens next)
        ↓
UI + Documentation (how to present)
```

**Rule**: Never hardcode clinical logic in UI components or database triggers.

### 1.1.3 Observations Store Truth

Documents are **views**, not storage. The same observation renders differently in a progress note, discharge summary, or referral letter—without data duplication.

## 1.2 Core Design Rules

### DSN-001: Context Before Content

Before any clinical data is collected, the system must know:
- Who the patient is (identity)
- What type of encounter this is
- What the patient's clinical context is (age, sex, pregnancy, etc.)

Only then are clinical modules activated.

### DSN-002: Rules Before Code

Every behavioral decision must be traceable to a CRL rule. If a UI element appears, hides, requires input, or validates, there must be a rule ID documenting why.

### DSN-003: Explicit Over Implicit

No magic. All derived fields must have a rule ID. All workflow transitions must have a rule ID. All specialty activations must have a rule ID.

### DSN-004: Version Everything

Rules, schemas, and API contracts are versioned. Historic encounters use the rules that were active at the time of the encounter—never current rules.

### DSN-005: Test Every Rule

Each rule must have at least one test case that can be executed automatically. The test specification is part of the rule definition.

## 1.3 Data Flow: New Patient Arrival

```
PATIENT ARRIVES
      ↓
[PAT-001] Minimum identity collected
      ↓
[PAT-002] Age classification derived
      ↓
[PAT-003] Sex-based pathway activated
      ↓
[PAT-004] Pregnancy screening (if female, 10-55)
      ↓
[CTX-001] Full clinical context derived
      ↓
[DEP-001] Department routing
      ↓
[ENC-001] Encounter created
      ↓
[CTX-010] History modules activated based on context
```

## 1.4 Object Schema Conventions

All JSON entities follow this base:

```json
{
  "id": "uuid",
  "type": "entity_type",
  "version": 1,
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "deleted": false,
  "metadata": {}
}
```

## 1.5 Rule Evaluation Flow

```
Rule Engine receives:
  - Patient context (age, sex, pregnancy, etc.)
  - Encounter context (visit type, priority, etc.)
  - Clinical state (what's been done so far)
  - Existing observations (what's already known)

For each ACTIVE rule (sorted by priority DESC):

  1. Check dependencies → all must be completed
  2. Check exceptions → if any match, skip
  3. Evaluate conditions → ALL must match
  4. Execute actions → if triggered
  5. Record event → for audit trail
  6. Return result → to caller

Rules with same priority are evaluated in rule ID order.
```

## 1.6 Priority Guidelines

| Priority | Value | Used For |
|----------|-------|----------|
| Critical | 100 | Safety rules, mandatory workflows, emergency protocols |
| High | 80 | Clinical necessity, regulatory requirements |
| Normal | 50 | Standard workflows, optional enhancements |
| Low | 20 | Convenience features, UI preferences |
| Optional | 10 | Non-clinical, configurable |
