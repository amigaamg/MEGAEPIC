# Chapter 2: Universal Patient Identity Model

## 2.1 Core Patient Object

Every patient in AMEXAN is represented by a single, universal object. There is no separation between "outpatient", "inpatient", or "emergency" patient records — the same object serves all contexts.

### 2.1.1 Patient Object Schema

```json
{
  "id": "uuid",
  "hospital_number": "HN-2024-00001",
  "national_id": "ID-12345678",
  "identity": {
    "given_name": "John",
    "middle_name": "Michael",
    "family_name": "Kamau",
    "full_name": "Kamau, John Michael",
    "preferred_name": "John"
  },
  "demographics": {
    "date_of_birth": "1990-03-15",
    "age": 34,
    "age_unit": "years",
    "sex_at_birth": "male",
    "gender_identity": "male",
    "place_of_birth": "Nairobi",
    "nationality": "Kenyan",
    "residence": "Nairobi, Kenya",
    "occupation": "Teacher",
    "marital_status": "married",
    "religion": "Christian",
    "preferred_language": "English",
    "interpreter_required": false
  },
  "contact": {
    "phone": "+254712345678",
    "email": "john.kamau@email.com",
    "emergency_contact": {
      "name": "Mary Kamau",
      "relationship": "spouse",
      "phone": "+254712345679"
    }
  },
  "clinical_context": {
    "age_category": "adult",
    "is_pregnant": false,
    "pregnancy_status": "not_pregnant",
    "has_uterus": false,
    "is_postpartum": false,
    "is_breastfeeding": false,
    "is_menstruating": false,
    "requires_guardian": false,
    "weight_kg": 75.0,
    "height_cm": 175.0,
    "bmi": 24.5
  },
  "audit": {
    "created_at": "2024-01-01T08:00:00Z",
    "created_by": "clinician-uuid",
    "updated_at": "2024-06-01T10:00:00Z",
    "updated_by": "clinician-uuid",
    "merged_from": null,
    "merge_history": []
  },
  "version": 5,
  "deleted": false,
  "metadata": {}
}
```

---

## 2.2 Patient Identity Rules

### RULE PAT-001 — Minimum Identity Requirement
```
Name:        Minimum Identity Requirement
Description: Every patient must have sufficient identity to uniquely identify them
Category:    PAT
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  patient.create = true

THEN
  Require → patient.identity.given_name         [non-empty string]
  Require → patient.identity.family_name         [non-empty string]
  Require → patient.hospital_number              [auto-generated if not provided]
  Require → patient.demographics.sex_at_birth    [male | female | intersex]
  Require → patient.demographics.date_of_birth   [valid date] OR patient.demographics.age [integer]

UNLESS
  patient.merge = true  (during patient merge operations)

CLINICAL RATIONALE:
  Without a minimum identity, a patient cannot be uniquely identified across encounters,
  leading to duplicate records and potential medical errors.

EVIDENCE:
  Hutchison's Clinical Methods, Chapter 1: "Accurate patient identification is the
  foundation of all clinical records." WHO Patient Safety Guidelines.

TEST:
  Given: { given_name: "John", family_name: "Kamau", sex_at_birth: "male", date_of_birth: "1990-03-15" }
  → PASS: Minimum identity satisfied

TEST:
  Given: { given_name: "", family_name: "Kamau", sex_at_birth: "male" }
  → FAIL: given_name is required
```

---

### RULE PAT-002 — Hospital Number Auto-Generation
```
Name:        Hospital Number Auto-Generation
Description: If no hospital number provided, auto-generate in format HN-YYYY-NNNNN
Category:    PAT
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  patient.hospital_number = null OR patient.hospital_number = ""

THEN
  Set → patient.hospital_number = "HN-{year}-{sequential:05d}"
  Where:
    year = current_year (4 digits)
    sequential = facility-wide auto-incrementing number, zero-padded to 5 digits

CLINICAL RATIONALE:
  Every patient must have a unique identifier for the healthcare system.
  The HN format is standard across most East African health facilities.

TEST:
  Given: { facility: "Nairobi Teaching Hospital", year: 2024, next_sequence: 42 }
  → patient.hospital_number = "HN-2024-00042"
```

---

### RULE PAT-003 — Age Calculation from DOB
```
Name:        Age Calculation from Date of Birth
Description: If date_of_birth is provided, calculate age automatically
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.date_of_birth ≠ null

THEN
  Set → patient.demographics.age = calculated_age_in_years
  Set → patient.demographics.age_unit = "years"
  
  IF age < 1 year:
    Set → age = age_in_months
    Set → age_unit = "months"
    
    IF age < 1 month:
      Set → age = age_in_days
      Set → age_unit = "days"

CLINICAL RATIONALE:
  Age is the single most important patient characteristic determining
  clinical approach, drug dosing, and differential diagnosis.

TEST:
  Given: { date_of_birth: "2020-01-15", encounter_date: "2024-06-28" }
  → age = 4, age_unit = "years"

TEST:
  Given: { date_of_birth: "2024-03-01", encounter_date: "2024-06-28" }
  → age = 3, age_unit = "months"

TEST:
  Given: { date_of_birth: "2024-06-20", encounter_date: "2024-06-28" }
  → age = 8, age_unit = "days"
```

---

### RULE PAT-004 — Age Classification
```
Name:        Age Classification
Description: Derive standardized age category from age
Category:    PAT
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.age ≠ null

THEN
  IF age ≤ 0 AND age_unit = "years":
    Set → clinical_context.age_category = "neonate"
  ELIF age < 28 AND age_unit = "days":
    Set → clinical_context.age_category = "neonate"
  ELIF age < 12 AND age_unit = "months":
    Set → clinical_context.age_category = "infant"
  ELIF age < 2 AND age_unit = "years":
    Set → clinical_context.age_category = "infant"
  ELIF age ≥ 2 AND age ≤ 9:
    Set → clinical_context.age_category = "child"
  ELIF age ≥ 10 AND age ≤ 19:
    Set → clinical_context.age_category = "adolescent"
  ELIF age ≥ 20 AND age ≤ 64:
    Set → clinical_context.age_category = "adult"
  ELIF age ≥ 65:
    Set → clinical_context.age_category = "older_adult"

CLINICAL RATIONALE:
  Age category determines which clinical modules, drug dosing formularies,
  growth charts, and normal ranges to use. This is fundamental to all
  downstream clinical decision support.

EVIDENCE:
  WHO age categorization standards. Hutchison's Clinical Methods organizes
  clinical practice into neonate, infant, child, adolescent, adult, and elderly.

TEST:
  Given: { age: 0, age_unit: "days" }       → age_category = "neonate"
  Given: { age: 10, age_unit: "days" }      → age_category = "neonate"
  Given: { age: 6, age_unit: "months" }     → age_category = "infant"
  Given: { age: 5, age_unit: "years" }      → age_category = "child"
  Given: { age: 15, age_unit: "years" }     → age_category = "adolescent"
  Given: { age: 30, age_unit: "years" }     → age_category = "adult"
  Given: { age: 70, age_unit: "years" }     → age_category = "older_adult"
```

---

### RULE PAT-005 — Sex-Based Context Initialization
```
Name:        Sex-Based Clinical Context Initialization
Description: Initialize clinical context fields based on sex_at_birth
Category:    PAT
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.sex_at_birth ≠ null

THEN
  IF sex_at_birth = "female":
    Set → clinical_context.has_uterus = true
    Set → clinical_context.is_menstruating = (age ≥ 10 AND age ≤ 55)
    Set → clinical_context.pregnancy_status = "unknown"
    
  IF sex_at_birth = "male":
    Set → clinical_context.has_uterus = false
    Set → clinical_context.is_menstruating = false
    Set → clinical_context.pregnancy_status = "not_pregnant"
    Set → clinical_context.is_pregnant = false
    Set → clinical_context.is_breastfeeding = false
    Set → clinical_context.is_postpartum = false

CLINICAL RATIONALE:
  Many clinical pathways depend on sex and reproductive status.
  Initializing these fields prevents inappropriate questions (e.g.,
  asking a male patient about pregnancy) and ensures appropriate
  screening (e.g., menstrual history for reproductive-age females).

TEST:
  Given: { sex_at_birth: "male", age: 30 }
  → has_uterus = false, is_menstruating = false, pregnancy_status = "not_pregnant"

TEST:
  Given: { sex_at_birth: "female", age: 25 }
  → has_uterus = true, is_menstruating = true, pregnancy_status = "unknown"

TEST:
  Given: { sex_at_birth: "female", age: 8 }
  → has_uterus = true, is_menstruating = false, pregnancy_status = "unknown"
```

---

### RULE PAT-006 — Guardian Requirement
```
Name:        Guardian Requirement Determination
Description: Determine if patient requires a guardian for consent and history
Category:    PAT
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.age ≠ null

THEN
  IF age_category = "neonate" OR age_category = "infant" OR age_category = "child":
    Set → clinical_context.requires_guardian = true
    Require → guardian fields in encounter
  
  IF age_category = "adolescent":
    Set → clinical_context.requires_guardian = false
    (Adolescent may consent independently per local laws; guardian still recommended)
  
  IF age_category = "adult" OR age_category = "older_adult":
    Set → clinical_context.requires_guardian = false

CLINICAL RATIONALE:
  Minors and incapacitated adults require a guardian for medical consent.
  This determines who provides the history and signs consent forms.

TEST:
  Given: { age_category: "neonate" } → requires_guardian = true
  Given: { age_category: "adult" }   → requires_guardian = false
```

---

### RULE PAT-007 — Patient Search Key Generation
```
Name:        Patient Search Key Generation
Description: Generate searchable keys from patient identity
Category:    PAT
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  patient.identity.family_name ≠ null AND patient.identity.given_name ≠ null

THEN
  Generate → search_keys = [
    "given_name family_name",
    "family_name, given_name",
    "family_name",
    "hospital_number",
    "national_id",
    "phone"
  ]
  
  For each key:
    Store → trigram index for fuzzy matching
    Store → soundex for phonetic matching

CLINICAL RATIONALE:
  Efficient patient lookup requires multiple search strategies.
  Phonetic matching handles name variations and typos.

TEST:
  Given: { given_name: "John", family_name: "Kamau", hospital_number: "HN-2024-00042" }
  → Search "Kamau" returns match
  → Search "HN-2024" returns match
  → Search "Johan Kamau" (typo) returns match via phonetic
```
