# Chapter 4: Informant & Reliability Rules

## 4.1 Clinical Rationale

The **informant** is the person providing the history. The **reliability** of the history determines how much clinical weight the clinician can place on the information. This is a fundamental clinical concept that most EMRs ignore.

Hutchison's Clinical Methods states: *"Always record who gave the history and how reliable they appeared."*

---

## 4.2 Informant Rules

### RULE PAT-0200 — Informant Required
```
Name:        Informant Must Be Recorded
Description: Every encounter requires documentation of who provided the history
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.clinical_state ≥ "history" OR encounter.clinical_state = "registered"

THEN
  Require → encounter.informant
  Require → encounter.informant.relationship  (if informant ≠ "self")
  Require → encounter.informant.reliability

CLINICAL RATIONALE:
  The source of clinical information directly affects its reliability.
  A history from a confused elderly patient with no relative present
  has different weight than a history from a lucid adult.

EVIDENCE:
  Hutchison's Clinical Methods, Chapter 1: "Record who gave the history
  and how reliable they appeared."

TEST:
  Given: { encounter_created: true }
  → informant field required
```

---

### RULE PAT-0201 — Informant Options
```
Name:        Informant Identification
Description: Available informant types and their properties
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.informant ≠ null

THEN
  Available options:
    "self"                    → Patient provided own history
    "parent"                  → Parent/step-parent
    "guardian"                → Legal guardian
    "spouse"                  → Husband/wife/partner
    "child"                   → Adult child
    "sibling"                 → Brother/sister
    "other_relative"          → Extended family
    "neighbor"                → Neighbor/bystander
    "police"                  → Law enforcement
    "referring_doctor"        → Referring clinician
    "accompanying_person"     → Friend/colleague
    "caregiver"               → Professional caregiver
    "interpreter"             → Medical interpreter

  Each selection determines:
    - Whether consent is needed
    - Whether legal guardian rights apply
    - Documentation format in the history

CLINICAL RATIONALE:
  The relationship of informant to patient affects legal consent,
  confidentiality, and history reliability.

TEST:
  Given: { informant: "self" }
  → No additional consent needed; history documented as "patient reports"

TEST:
  Given: { informant: "parent", age_category: "child" }
  → Guardian consent valid; history documented as "mother/father reports"
```

---

### RULE PAT-0202 — Reliability Classification
```
Name:        History Reliability Classification
Description: Classify reliability of the history provided
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.informant ≠ null

THEN
  Require → informant.reliability ∈ ["reliable", "partially_reliable", "unreliable"]

  "reliable":
    → Informant is lucid, consistent, and able to provide clear history
    → History can be used for clinical decision-making without reservation

  "partially_reliable":
    → Some inconsistency or uncertainty in history
    → Important details may need verification
    → Flag key history elements for verification

  "unreliable":
    → Informant is confused, intoxicated, inconsistent, or unable to communicate
    → History must be verified from other sources
    → Physical examination and investigations become more important

CLINICAL RATIONALE:
  Reliability affects how much weight the clinician places on history
  versus examination and investigations.

TEST:
  Given: { informant: "self", reliability: "reliable" }
  → History accepted for clinical decisions

TEST:
  Given: { informant: "self", reliability: "unreliable" }
  → Warning: "This history may be unreliable. Verify key details."
```

---

### RULE PAT-0203 — Reliability-Dependent Workflow
```
Name:        Reliability Affects Workflow
Description: Unreliable history triggers additional verification requirements
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.informant.reliability = "unreliable"

THEN
  Block → diagnosis until examination performed
  Require → additional_verification_source
  Recommend → collateral_history
  Recommend → extended_observation_period
  Auto-populate → hpi_confidence = "low"

CLINICAL RATIONALE:
  An unreliable history requires more objective data before
  clinical decisions can be made confidently.

TEST:
  Given: { reliability: "unreliable" }
  → Diagnosis requires examination first
```

---

### RULE PAT-0204 — Reliability Inheritance
```
Name:        Reliability Inherits Across Encounter
Description: Once reliability is set, it applies to all history in the encounter
Category:    PAT
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  encounter.informant.reliability ≠ null

THEN
  All subsequent history observations inherit:
    observation.confidence = map_reliability_to_confidence(encounter.informant.reliability)
    
    "reliable"            → confidence = 1.0
    "partially_reliable"  → confidence = 0.6
    "unreliable"          → confidence = 0.3

  This confidence value is used by the Bayesian reasoning engine
  to weight evidence appropriately.

CLINICAL RATIONALE:
  The reliability of the source affects the weight of all clinical
  information obtained during that encounter.

TEST:
  Given: { reliability: "unreliable" }
  → All observations: confidence = 0.3
```
