# Chapter 3: Biodata Rules

## 3.1 Biodata Collection Phases

Biodata collection occurs in three phases:

```
PHASE 1: Emergency Minimum
  Fields required to create any encounter
  
PHASE 2: Standard Registration
  Fields required for a complete outpatient registration
  
PHASE 3: Full Registration
  Fields required for admission or complex encounters
```

---

## 3.2 Biodata Rules

### RULE PAT-0100 — Phase 1: Emergency Minimum
```
Name:        Emergency Minimum Biodata
Description: Absolute minimum fields to start an emergency encounter
Category:    PAT
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.visit_type = "emergency"

THEN
  Require → patient.identity.given_name            [string, may be "Unknown"]
  Require → patient.identity.family_name            [string, may be "Unknown"]
  Require → patient.demographics.sex_at_birth       [male | female | intersex]
  Recommend → patient.demographics.age              [integer, estimated if unknown]

  All other biodata fields: OPTIONAL (can be completed later)

CLINICAL RATIONALE:
  In emergencies, life-saving treatment cannot wait for complete registration.
  The minimum needed is a temporary identity and sex.

TEST:
  Given: { visit_type: "emergency", given_name: "Unknown", family_name: "Trauma-001", sex_at_birth: "male" }
  → PASS: Emergency encounter can be created
```

---

### RULE PAT-0101 — Phase 2: Standard Registration
```
Name:        Standard Registration Biodata
Description: Complete biodata for outpatient/clinic encounters
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.visit_type ∈ ["outpatient", "clinic", "follow_up", "telemedicine", "antenatal", "postnatal"]

THEN
  Require → patient.identity.given_name
  Require → patient.identity.family_name
  Require → patient.hospital_number
  Require → patient.demographics.date_of_birth OR patient.demographics.age
  Require → patient.demographics.sex_at_birth
  Require → patient.demographics.residence
  Require → patient.demographics.occupation
  Recommend → patient.contact.phone
  Recommend → patient.contact.emergency_contact.name
  Recommend → patient.contact.emergency_contact.phone

CLINICAL RATIONALE:
  Standard outpatient registration requires enough information for
  identification, contact tracing, and basic demographic analysis.

TEST:
  Given: { visit_type: "outpatient" } with all required fields present
  → PASS

TEST:
  Given: { visit_type: "outpatient" } with missing occupation
  → Warning, but encounter can proceed
```

---

### RULE PAT-0102 — Phase 3: Full Registration
```
Name:        Full Admission Biodata
Description: Complete biodata for inpatient admission
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.visit_type ∈ ["inpatient", "ward_round", "icu", "procedure"]

THEN
  Require → ALL Phase 2 fields
  Require → patient.identity.middle_name           [complete legal name]
  Require → patient.demographics.place_of_birth
  Require → patient.demographics.nationality
  Require → patient.demographics.marital_status
  Require → patient.demographics.religion
  Require → patient.contact.phone
  Require → patient.contact.email                 [if available]
  Require → patient.contact.emergency_contact.name
  Require → patient.contact.emergency_contact.relationship
  Require → patient.contact.emergency_contact.phone
  Require → patient.demographics.national_id      [if available]
  Require → informant (see Chapter 4)

CLINICAL RATIONALE:
  Admission requires complete patient identification for legal,
  billing, and clinical purposes. Religion may affect treatment
  decisions (e.g., blood products, dietary requirements).

TEST:
  Given: { visit_type: "inpatient", all Phase 3 fields complete }
  → PASS
```

---

### RULE PAT-0103 — Name Validation
```
Name:        Patient Name Validation
Description: Validate patient name components
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  patient.identity.given_name ≠ null OR patient.identity.family_name ≠ null

THEN
  Validate:
    given_name:   2-100 characters, letters and hyphens only
    family_name:  2-100 characters, letters and hyphens only
    middle_name:  0-100 characters, letters and hyphens only
    
  Reject:
    Numeric characters in names
    Special characters except hyphen and apostrophe
    Single-character names (unless valid abbreviation)

  Auto-format:
    patient.identity.full_name = "family_name, given_name [middle_name]"
    patient.identity.preferred_name = given_name

CLINICAL RATIONALE:
  Name standardization prevents duplicate records and ensures
  correct identification across the healthcare system.

TEST:
  Given: { given_name: "John123" } → FAIL: numbers in name
  Given: { given_name: "J", family_name: "K" } → Warning: short name
  Given: { given_name: "John", family_name: "Kamau" } → full_name = "Kamau, John"
```

---

### RULE PAT-0104 — Date of Birth Validation
```
Name:        Date of Birth Validation
Description: Validate DOB is reasonable and not in the future
Category:    PAT
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.date_of_birth ≠ null

THEN
  Validate:
    date_of_birth ≤ current_date
    date_of_birth ≥ current_date - 120 years  (maximum verified lifespan)
    date components are valid (month 1-12, day valid for month)

  IF date_of_birth > current_date:
    RAISE ERROR: "Date of birth cannot be in the future"
    BLOCK: Patient cannot be saved

  IF date_of_birth < current_date - 120 years:
    RAISE WARNING: "Date of birth is more than 120 years ago. Please verify."

CLINICAL RATIONALE:
  An incorrect DOB affects all age-based calculations including
  drug dosing, growth assessment, and clinical decision support.

TEST:
  Given: { date_of_birth: "2099-01-01", current_date: "2024-06-28" }
  → ERROR: date in future

TEST:
  Given: { date_of_birth: "1900-01-01", current_date: "2024-06-28" }
  → WARNING: >120 years ago
```

---

### RULE PAT-0105 — Age-Based Field Requirements
```
Name:        Age-Based Field Requirements
Description: Additional required fields based on age
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  patient.clinical_context.age_category ≠ null

THEN
  IF age_category = "neonate":
    Require → birth_weight
    Require → gestational_age
    Require → mode_of_delivery
    Require → apgar_scores (1 min, 5 min)

  IF age_category ∈ ["infant", "child", "adolescent"]:
    Require → birth_history (summary)
    Require → immunization_status
    Require → guardian_name
    Require → guardian_relationship

  IF age_category ∈ ["adult", "older_adult"]:
    Require → occupation
    Recommend → next_of_kin
    Recommend → advanced_directive_status

CLINICAL RATIONALE:
  Different age groups require different baseline information.
  Neonates need birth details; children need immunization records;
  adults need occupational history.

TEST:
  Given: { age_category: "neonate" }
  → birth_weight, gestational_age, mode_of_delivery required

TEST:
  Given: { age_category: "adult" }
  → occupation required, birth_weight NOT required
```
