# Chapter 5: Administrative & Demographics Rules

## 5.1 Administrative Data Model

Administrative fields support operations, billing, public health, and research—they are not directly clinical but may affect clinical context.

---

## 5.2 Administrative Rules

### RULE PAT-0300 — Residence Completeness
```
Name:        Residence Address Completeness
Description: Residence information requirements based on encounter type
Category:    PAT
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.residence ≠ null

THEN
  Require → residence (at minimum: village/estate + town/city)
  Recommend → complete postal address

  IF encounter.visit_type ∈ ["inpatient", "ward_round", "icu"]:
    Require → full residence details (estate, town, county, country)
    Require → alternative_contact

CLINICAL RATIONALE:
  Residence information is needed for:
  - Contact tracing (infectious diseases)
  - Home visits and community follow-up
  - Epidemiology and public health reporting
  - Billing and insurance verification

TEST:
  Given: { visit_type: "inpatient", residence: "Nairobi" }
  → Partial: recommend more detail

TEST:
  Given: { visit_type: "inpatient", residence: "Westlands, Nairobi, Kenya" }
  → Complete
```

---

### RULE PAT-0301 — Occupation Collection
```
Name:        Occupation Information
Description: Occupation is a clinical risk factor
Category:    PAT
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.occupation ≠ null

THEN
  Validate → occupation is a recognized occupation
  Store → occupation_category derived from occupation

  Occupation categories:
    "healthcare_worker"           → TB, COVID, needle-stick risk
    "farmer_agriculture"          → Pesticide exposure, zoonoses, heat illness
    "mining_construction"         → Silicosis, trauma, hearing loss
    "teacher_education"           → Voice disorders, stress
    "driver_transport"            → Accident risk, sedentary lifestyle
    "office_administrative"       → Sedentary, ergonomic issues
    "student"                     → Stress, infectious diseases (dormitories)
    "retired"                     → Age-related conditions
    "unemployed"                  → Mental health, nutrition concerns
    "child"                       → N/A (not applicable)
    "other"                       → Specify free text
    "unknown"                     → Not provided

CLINICAL RATIONALE:
  Occupation is a critical risk factor for many diseases.
  Hutchison's: "Occupation may provide the clue to diagnosis."

TEST:
  Given: { occupation: "farmer" }
  → occupation_category = "farmer_agriculture"
  → Risk factors: pesticide exposure, zoonoses
```

---

### RULE PAT-0302 — Emergency Contact Requirement
```
Name:        Emergency Contact Information
Description: At least one emergency contact should be recorded
Category:    PAT
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  patient.contact.emergency_contact ≠ null

THEN
  IF encounter.visit_type ∈ ["inpatient", "emergency", "icu", "procedure"]:
    Require → emergency_contact.name
    Require → emergency_contact.relationship
    Require → emergency_contact.phone
    Recommend → alternative_emergency_contact

  IF encounter.visit_type ∈ ["outpatient", "follow_up", "telemedicine"]:
    Recommend → emergency_contact.name
    Recommend → emergency_contact.phone

CLINICAL RATIONALE:
  Emergency contact is essential for inpatients and emergencies
  but optional for routine outpatient visits.

TEST:
  Given: { visit_type: "inpatient" }
  → Emergency contact required (name, relationship, phone)
```

---

### RULE PAT-0303 — Language & Interpreter
```
Name:        Language Preference and Interpreter Needs
Description: Document language preference and interpreter requirement
Category:    PAT
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.preferred_language ≠ null

THEN
  If preferred_language ≠ facility_default_language:
    Recommend → interpreter_required screening question
    If interpreter_required = true:
      Require → interpreter_language
      Require → interpreter_arranged
      Auto-populate → informant.reliability = "partially_reliable"
        (communication through interpreter reduces reliability)
    
    If interpreter_required = false:
      Document → patient declined interpreter
      Document → language_proficiency_level

CLINICAL RATIONALE:
  Language barriers affect history reliability and informed consent.
  Hutchison's: "If the patient does not speak your language, use an interpreter."

TEST:
  Given: { preferred_language: "Somali", facility_language: "English", interpreter_required: true }
  → Informant = "interpreter"; reliability = "partially_reliable"
```
