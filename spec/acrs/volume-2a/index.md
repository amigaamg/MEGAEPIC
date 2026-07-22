# AMEXAN Clinical Rule Specification (ACRS)

## Volume 2A — Patient & Encounter Core

**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** 2026-06-28  
**Editor:** AMEXAN Clinical OS  
**License:** Proprietary — AMEXAN Internal

---

### Scope

This volume defines the **core patient identity model, biodata rules, encounter lifecycle, context activation engine, department routing, validation rules, derived fields, and UI contracts** for the AMEXAN Clinical Operating System.

Every rule, schema, and workflow in this document is **implementation-grade**: a Go backend developer, React frontend developer, or CRL engine should be able to implement directly from this specification without ambiguity.

---

### Volumes

| Volume | Title | Status |
|--------|-------|--------|
| 1 | CRL Core Language Specification | Draft |
| **2A** | **Patient & Encounter Core** | **Active** |
| 2B | Department-Specific Biodata | Planned |
| 2C | Cross-Specialty Rules | Planned |
| 3 | History Engine Specification | Planned |
| 4 | Examination Engine Specification | Planned |
| 5 | Investigation Engine Specification | Planned |
| 6 | Diagnostic & Reasoning Engine | Planned |
| 7 | Management & Treatment Engine | Planned |
| 8 | Documentation Engine | Planned |
| 9 | AI Integration Specification | Planned |
| 10 | Quality & Safety Specification | Planned |

---

### Chapter Index

| Chapter | Title | Rule ID Range |
|---------|-------|---------------|
| 1 | Design Principles & Object Model | — |
| 2 | Universal Patient Identity Model | PAT-0001 – PAT-0020 |
| 3 | Biodata Rules | PAT-0100 – PAT-0199 |
| 4 | Informant & Reliability Rules | PAT-0200 – PAT-0299 |
| 5 | Administrative & Demographics | PAT-0300 – PAT-0399 |
| 6 | Universal Encounter Object | ENC-0001 – ENC-0020 |
| 7 | Encounter Lifecycle & Workflow | ENC-0100 – ENC-0199 |
| 8 | Context Activation Engine | CTX-0001 – CTX-0099 |
| 9 | Department Routing Rules | DEP-0001 – DEP-0099 |
| 10 | Specialty Activation Rules | SPC-0001 – SPC-0099 |
| 11 | Validation Rules | VAL-0001 – VAL-0099 |
| 12 | Derived Fields | DER-0001 – DER-0099 |
| 13 | Event Model | EVT-0001 – EVT-0099 |
| 14 | UI Contracts | UI-0001 – UI-0099 |
| 15 | PostgreSQL Schema | — |
| 16 | Go Interfaces | — |
| 17 | API Contracts | — |
| 18 | Test Specification | — |

---

### Rule ID Convention

```
CAT-NNNN
│    └─── 4-digit sequential number
└──────── 3-letter category code
```

Categories in Volume 2A:

| Category | Prefix | Chapter |
|----------|--------|---------|
| Patient | PAT | 2–5 |
| Encounter | ENC | 6–7 |
| Context | CTX | 8 |
| Department | DEP | 9 |
| Specialty | SPC | 10 |
| Validation | VAL | 11 |
| Derived | DER | 12 |
| Event | EVT | 13 |
| UI Contract | UI | 14 |

---

### How to Read a Rule

Each rule in this specification follows a standard template:

```text
RULE PAT-0001
─────────────────────────────────────────────────────────
Name:        [Human-readable name]
Description: [What the rule does and why]
Category:    [PAT|ENC|CTX|DEP|SPC|VAL|DER|EVT|UI]
Priority:    [100=Critical | 80=High | 50=Normal | 20=Low]
Status:      [Active | Draft | Deprecated]
Version:     [Semantic version]

WHEN
  [condition] AND/OR
  [condition]

THEN
  [action] → [target] [parameters?]

UNLESS
  [exception condition]

CLINICAL RATIONALE:
  [Why this rule exists medically]

EVIDENCE:
  [Reference to Hutchison's, guidelines, etc.]

TEST:
  Given [context] → Expected [outcome]
```

---

### Conventions

1. **Field names** use `snake_case` and dot-notation for nesting: `patient.age`, `encounter.visit_type`
2. **Values** are lowercase strings unless otherwise specified
3. **Boolean fields** use `true`/`false`
4. **Dates** use ISO 8601 (`YYYY-MM-DD`)
5. **Timestamps** use ISO 8601 with timezone (`YYYY-MM-DDTHH:mm:ssZ`)
6. **Rule IDs** are permanent — never reassigned
7. **Deprecated rules** are marked `deprecated` and replaced by a new ID
8. **Every rule must have at least one test case**
