# Chapter 7: Encounter Lifecycle & Workflow

## 7.1 Universal State Machine

Every encounter is a finite state machine. The encounter moves through states, and each transition must be valid.

### 7.1.1 State Diagram

```
                    ┌──────────┐
                    │REGISTERED│
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  TRIAGE  │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼───┐ ┌───▼────┐ ┌───▼───┐
         │ABCDE   │ │HISTORY │ │SCREEN │
         └────┬───┘ └───┬────┘ └───┬───┘
              │          │          │
              └──────────┼──────────┘
                         │
                    ┌────▼────┐
                    │EXAMINATION│
                    └────┬─────┘
                         │
                    ┌────▼────────┐
                    │INVESTIGATION│
                    └────┬────────┘
                         │
                    ┌────▼──────┐
                    │ DIAGNOSIS │
                    └────┬──────┘
                         │
                    ┌────▼──────┐
                    │ TREATMENT │
                    └────┬──────┘
                         │
                    ┌────▼────────┐
                    │ MONITORING │
                    └────┬────────┘
                         │
                    ┌────▼──────────┐
                    │ DISPOSITION  │
                    └────┬──────────┘
                         │
                    ┌────▼──────┐
                    │ FOLLOW-UP │
                    └────┬──────┘
                         │
                    ┌────▼─────┐
                    │COMPLETED│
                    └─────────┘
```

### 7.1.2 Allowed Transitions

| From | To | Conditions | Auto |
|------|----|------------|------|
| `registered` | `triage` | Always allowed | Auto (emergency) |
| `registered` | `history` | Non-emergency | Auto (outpatient) |
| `registered` | `cancelled` | Clinician override | No |
| `triage` | `abcde` | Emergency only | No |
| `triage` | `history` | Non-emergency, stable | Auto |
| `triage` | `cancelled` | Administration | No |
| `abcde` | `history` | ABCDE complete | No |
| `abcde` | `examination` | Emergency, history deferred | No |
| `history` | `examination` | History complete | No |
| `history` | `investigation` | History + exam deferred | No |
| `examination` | `investigation` | Exam complete | No |
| `examination` | `diagnosis` | Exam complete, no tests needed | No |
| `investigation` | `diagnosis` | Results reviewed | No |
| `diagnosis` | `treatment` | Diagnosis established | No |
| `treatment` | `monitoring` | Treatment started | Auto |
| `monitoring` | `disposition` | Clinically ready | No |
| `disposition` | `follow_up` | Discharge planned | No |
| `disposition` | `completed` | No follow-up needed | No |
| `follow_up` | `completed` | Follow-up arranged | No |
| `*` | `cancelled` | Clinician/admin override | No |

---

## 7.2 Workflow Rules

### RULE ENC-0100 — Workflow State Tracking
```
Name:        Workflow State Must Be Tracked
Description: Every state transition must be recorded as an event
Category:    ENC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.clinical_state changes

THEN
  Record → event: "encounter.state_changed"
  Record → event.from_state = previous state
  Record → event.to_state = new state
  Record → event.timestamp = current time
  Record → event.user_id = current user
  
  Set → encounter.entered_state_at = current time

CLINICAL RATIONALE:
  Workflow tracking is essential for audit, quality improvement,
  and understanding clinical flow.

TEST:
  Given: { encounter transitions from "history" to "examination" }
  → Event recorded with from_state="history", to_state="examination"
```

---

### RULE ENC-0101 — History Cannot Be Skipped in Non-Emergency
```
Name:        History Required in Non-Emergency Encounters
Description: History section must be completed before exam in non-emergency
Category:    ENC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.clinical_state ∈ ["examination", "investigation", "diagnosis", "treatment"]
  AND encounter.visit_type ∉ ["emergency", "ward_round"]

THEN
  IF encounter.clinical_state.previous ≠ "history":
    IF history_substantially_complete ≠ true:
      Block → "Clinical history must be completed before proceeding"
      Option → "Override (emergency exception, requires audit)"

CLINICAL RATIONALE:
  History drives the examination. Hutchison's: "The history gives the diagnosis;
  the examination confirms it."

TEST:
  Given: { visit_type: "outpatient", clinical_state: "examination", history_complete: false }
  → BLOCKED: Cannot proceed

TEST:
  Given: { visit_type: "emergency", clinical_state: "examination", history_complete: false }
  → ALLOWED: Emergency exception
```

---

### RULE ENC-0102 — Diagnosis Required Before Treatment
```
Name:        Working Diagnosis Required for Treatment
Description: Cannot start treatment without at least a working diagnosis
Category:    ENC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  clinical_state = "treatment"
  AND encounter.visit_type ∉ ["emergency"]

THEN
  IF working_diagnosis = null:
    Block → "A working diagnosis is required before treatment can start"
    Option → "Record working diagnosis now"
    Option → "Override (requires audit trail)"
    
  IF working_diagnosis ≠ null:
    Allow → treatment phase
    Auto-populate → treatment_rationale based on diagnosis

CLINICAL RATIONALE:
  Treatment without a diagnosis is unsafe. At minimum, a working
  diagnosis (or differential) must guide management.

TEST:
  Given: { clinical_state: "treatment", working_diagnosis: "Community-acquired pneumonia" }
  → ALLOWED: Treatment can proceed

TEST:
  Given: { clinical_state: "treatment", working_diagnosis: null }
  → BLOCKED
```

---

### RULE ENC-0103 — Encounter Completeness Validation
```
Name:        Encounter Completeness Check
Description: Before completing an encounter, validate required sections
Category:    ENC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.status = "completed" OR encounter.clinical_state = "completed"

THEN
  For visit_type = "outpatient":
    Require → chief_complaint documented
    Require → hpi documented
    Require → examination documented
    Require → diagnosis documented (working or final)
    Require → management_plan documented
    Recommend → follow_up_plan documented
  
  For visit_type = "inpatient":
    Require → admission_summary
    Require → discharge_summary (if discharge)
    Require → diagnosis documented
    Require → discharge_medications
    Require → follow_up_arranged
  
  For visit_type = "emergency":
    Require → disposition documented
    Require → discharge_instructions
    Require → follow_up_arranged

  If any required item missing:
    Warn → "Encounter is incomplete: {list of missing items}"
    Allow → complete anyway (audit trail)

CLINICAL RATIONALE:
  An incomplete encounter is a medicolegal risk and compromises
  continuity of care.

TEST:
  Given: { visit_type: "outpatient", status: "completed" }
  → Validate chief_complaint, hpi, exam, diagnosis, management
```

---

### RULE ENC-0104 — Encounter Timeout
```
Name:        Encounter Timeout Warning
Description: Warning if encounter remains in same state too long
Category:    ENC
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  encounter.clinical_state ≠ "completed"
  AND encounter.clinical_state ≠ "cancelled"

THEN
  IF time_in_current_state > threshold (by visit_type):
    "outpatient"    → threshold = 60 minutes → Warning
    "emergency"     → threshold = 120 minutes → Warning
    "inpatient"     → threshold = 24 hours → Info
    "telemedicine"  → threshold = 30 minutes → Warning
    "ward_round"    → threshold = 120 minutes → Info

  Display → "This encounter has been in {state} for {duration}"

CLINICAL RATIONALE:
  Prolonged time in a clinical state may indicate a problem
  (e.g., patient waiting for review, results pending).

TEST:
  Given: { visit_type: "outpatient", state: "examination", duration: 75 minutes }
  → Warning displayed
```

---

### RULE ENC-0105 — Emergency Workflow Shortcut
```
Name:        Emergency Workflow Shortcut
Description: Emergency encounters allow skipping non-essential states
Category:    ENC
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.visit_type = "emergency"

THEN
  Allow → skip directly from "triage" to "treatment" (e.g., cardiac arrest)
  Allow → skip from "abcde" to "disposition" (e.g., minor injury)
  Allow → defer "history" until after "examination" or "treatment"
  
  Each shortcut MUST:
    Record → "workflow_shortcut" event
    Record → reason_for_shortcut
    Record → clinician_id
    Auto-populate → "This workflow was abbreviated due to clinical urgency"

CLINICAL RATIONALE:
  In emergencies, clinical priorities override workflow completeness.
  ATLS: "Treat the greatest threat to life first."

TEST:
  Given: { visit_type: "emergency", clinical_state: "triage", action: "direct_to_treatment" }
  → Allowed with audit trail
```
