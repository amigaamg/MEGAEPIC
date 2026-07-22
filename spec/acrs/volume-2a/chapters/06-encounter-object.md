# Chapter 6: Universal Encounter Object

## 6.1 Core Encounter Schema

Every clinical interaction in AMEXAN is an **Encounter**. There is no distinction between "visit", "admission", "consultation", or "procedure" at the data model level—they are all encounters differentiated by the `visit_type` field.

### 6.1.1 Encounter Object

```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "provider_id": "uuid",
  "department_id": "uuid",
  "facility_id": "uuid",
  "visit_type": "outpatient",
  "priority": "routine",
  "status": "active",
  "clinical_state": "registered",
  "reason_for_visit": "Chest pain for 2 days",
  "source": "self_referral",
  "referral_source": null,
  "informant": {
    "type": "self",
    "name": "John Kamau",
    "relationship": "self",
    "reliability": "reliable",
    "phone": "+254712345678"
  },
  "time": {
    "started_at": "2024-06-28T08:00:00Z",
    "completed_at": null,
    "expected_duration_minutes": 30
  },
  "location": {
    "department": "Emergency Department",
    "unit": "Resuscitation Bay 3",
    "bed": null
  },
  "audit": {
    "created_at": "2024-06-28T08:00:00Z",
    "created_by": "clinician-uuid",
    "updated_at": "2024-06-28T08:00:00Z",
    "updated_by": "clinician-uuid"
  },
  "version": 1,
  "metadata": {}
}
```

---

### 6.1.2 Visit Types

| Code | Description | Typical Duration | Typical Workflow |
|------|-------------|-----------------|------------------|
| `outpatient` | Routine clinic visit | 15-30 min | History → Exam → Plan |
| `emergency` | Emergency department | Variable | ABCDE → History → Investigations |
| `inpatient` | Hospital admission | Days to weeks | Full admission workup |
| `ward_round` | Daily ward review | 5-15 min | Progress → Exam → Updated Plan |
| `follow_up` | Return visit | 10-20 min | Interval history → Review → Plan |
| `procedure` | Surgical/therapeutic procedure | Variable | Pre-op → Procedure → Post-op |
| `telemedicine` | Remote consultation | 15-30 min | History → Remote exam → Plan |
| `antenatal` | Pregnancy visit | 15-20 min | Obstetric review → Exam → Plan |
| `postnatal` | Post-delivery visit | 15-20 min | Maternal + neonatal review |
| `home_visit` | Community visit | 20-40 min | Adapted history + exam |
| `referral` | Specialist referral | 20-30 min | Focused history + exam |
| `mdt` | Multi-disciplinary team | 30-60 min | Case review + discussion |

---

## 6.2 Encounter Rules

### RULE ENC-001 — Encounter Creation Requires Minimum Context
```
Name:        Minimum Encounter Creation Requirements
Description: An encounter cannot exist without minimum patient and context
Category:    ENC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.create = true

THEN
  Require → encounter.patient_id        [must reference existing patient]
  Require → encounter.provider_id       [must reference existing clinician]
  Require → encounter.visit_type        [must be valid visit type]
  Require → encounter.priority          [must be valid priority]
  
  IF encounter.visit_type = "emergency":
    Set → priority = "emergency" (override any lower priority)

CLINICAL RATIONALE:
  Every encounter must be traceable to a patient, provider, and type.

TEST:
  Given: { patient_id: valid, provider_id: valid, visit_type: "emergency", priority: "routine" }
  → priority overridden to "emergency"
```

---

### RULE ENC-002 — Priority Escalation Rules
```
Name:        Clinical Priority Escalation
Description: Certain conditions automatically escalate encounter priority
Category:    ENC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.visit_type = "emergency"

THEN
  IF any red_flag_present:
    Set → priority = "immediate"
  
  IF any of:
    airway_compromised
    breathing_rate < 8 OR > 30
    systolic_bp < 90
    heart_rate > 130
    gcs < 13
    active_hemorrhage:
    Set → priority = "immediate"

  IF none of the above AND stable vitals:
    Set → priority based on triage assessment

CLINICAL RATIONALE:
  Priority must reflect clinical urgency, not administrative convenience.

TEST:
  Given: { gcs: 12 } → priority = "immediate"
  Given: { gcs: 15, rr: 16, bp: "120/80", hr: 76 } → priority from triage
```

---

### RULE ENC-003 — Visit Type Determines Workflow
```
Name:        Visit Type Workflow Selection
Description: Each visit type activates a specific workflow sequence
Category:    ENC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.visit_type ≠ null

THEN
  IF visit_type = "emergency":
    Activate → emergency_workflow
    Workflow: [triage → abcde → focused_history → exam → investigations → disposition]
    
  IF visit_type = "outpatient":
    Activate → outpatient_workflow
    Workflow: [registration → history → exam → investigations → diagnosis → plan]
    
  IF visit_type = "inpatient":
    Activate → inpatient_workflow
    Workflow: [admission → full_history → full_exam → investigations → diagnosis → treatment → monitoring → discharge]
    
  IF visit_type = "ward_round":
    Activate → ward_round_workflow
    Workflow: [review_overnight → vitals → exam → update_plan → documentation]
    
  IF visit_type = "antenatal":
    Activate → antenatal_workflow
    Workflow: [registration → obstetric_history → exam → investigations → plan]
    
  IF visit_type = "telemedicine":
    Activate → telemedicine_workflow
    Workflow: [registration → history → limited_exam → plan → prescription]

CLINICAL RATIONALE:
  Different clinical contexts require different workflows.
  Emergency patients need ABCDE first; outpatients start with history.

TEST:
  Given: { visit_type: "emergency" }
  → workflow_states = ["triage", "abcde", "focused_history", "exam", "investigations", "disposition"]

TEST:
  Given: { visit_type: "outpatient" }
  → workflow_states = ["registration", "history", "exam", "investigations", "diagnosis", "plan"]
```

---

### RULE ENC-004 — Encounter Cannot Be Duplicated
```
Name:        Active Encounter Check
Description: Prevent duplicate active encounters for the same patient
Category:    ENC
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.create = true

THEN
  IF patient already has an ACTIVE encounter with SAME visit_type:
    Warn → "Patient already has an active {visit_type} encounter"
    Option → "Reopen existing encounter"
    Option → "Create new encounter anyway (override)"
    
  IF patient already has an ACTIVE encounter with "emergency" visit_type:
    Block → "Patient is currently in Emergency. Cannot create new encounter."
    Option → "Transfer from Emergency"
    Option → "Discharge from Emergency first"

CLINICAL RATIONALE:
  A patient should not have two simultaneous encounters of the same type
  to avoid conflicting clinical records.

TEST:
  Given: { patient: active_encounter_exists, visit_type: "outpatient" }
  → Warning displayed; user can choose to proceed

TEST:
  Given: { patient: in_emergency, visit_type: "outpatient" }
  → Emergency encounter must be resolved first
```
