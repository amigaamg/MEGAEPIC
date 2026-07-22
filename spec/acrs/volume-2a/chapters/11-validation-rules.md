# Chapter 11: Validation Rules

## 11.1 Field Validation Rules

### RULE VAL-001 — Required Field Validation
```
Name:        Required Field Validation
Description: All required fields must have non-null, non-empty values before progression
Category:    VAL
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  form.submit = true OR encounter.clinical_state change requested

THEN
  For each field marked as "required" in current section:
    IF field.value = null OR field.value = "":
      RAISE → ValidationError(field_name, "This field is required")
      BLOCK → form submission or state transition

  For each field marked as "recommended":
    IF field.value = null OR field.value = "":
      RAISE → ValidationWarning(field_name, "This field is recommended")
      ALLOW → form submission with warning

TEST:
  Given: { required_field: null }
  → ERROR: "This field is required"
```

### RULE VAL-002 — Value Range Validation
```
Name:        Value Range Validation
Description: Numeric values must be within clinically plausible ranges
Category:    VAL
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  numerical observation recorded

THEN
  Validate range:

  temperature_celsius:       [32.0, 43.0]    → Outside range: confirm
  heart_rate:               [20, 280]        → Outside range: confirm
  respiratory_rate:          [2, 80]          → Outside range: confirm
  systolic_bp:              [50, 280]         → Outside range: confirm
  diastolic_bp:             [30, 160]         → Outside range: confirm
  oxygen_saturation:         [50, 100]         → Outside range: confirm
  gcs:                      [3, 15]           → Outside range: error
  blood_glucose:            [0.5, 55.0]       → Outside range: confirm
  weight_kg_adult:          [20, 300]         → Outside range: confirm
  weight_kg_child:           [0.5, 150]        → Outside range: confirm
  height_cm:               [20, 250]          → Outside range: confirm
  bmi:                     [10, 60]           → Outside range: confirm
  urine_output_ml_hr:       [0, 500]          → Outside range: confirm

  IF outside plausible range:
    Warning → "Value {value} is outside the expected range for {field}. Please confirm."
    Require → clinician confirmation

  IF outside survival range:
    Error → "Value {value} is not compatible with life. Please verify urgently."

TEST:
  Given: { gcs: 16 } → ERROR: GCS must be 3-15
  Given: { temperature: 44 } → WARNING: Confirm value
```

### RULE VAL-003 — Date Logic Validation
```
Name:        Date Logic Validation
Description: Dates must follow logical clinical sequences
Category:    VAL
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  two or more related dates recorded

THEN
  Validate:
    date_of_birth ≤ admission_date   [person born before admission]
    admission_date ≤ discharge_date  [admitted before discharged]
    lmp_date ≤ edd                   [LMP before EDD]
    edd ≥ current_date               [EDD should be in the future for ongoing pregnancy]
    symptom_onset ≤ encounter_date   [symptom started before visit]
    death_date ≥ date_of_birth       [died after being born]

  IF logical violation:
    Error → "{date1} cannot be after {date2}"

TEST:
  Given: { admission_date: "2024-06-28", discharge_date: "2024-06-25" }
  → ERROR: Discharge cannot be before admission
```

### RULE VAL-004 — Unique Patient Check
```
Name:        Duplicate Patient Detection
Description: Check for potential duplicate patients on registration
Category:    VAL
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  patient.create = true

THEN
  Search existing patients for:
    Exact match: given + family + DOB → likely duplicate
    Fuzzy match: same family + similar given + same sex → possible duplicate
    Phone match: same phone → possible duplicate

  IF potential duplicate found:
    Warn → "A patient with similar details already exists"
    Show → existing patient details
    Option → "Merge with existing"
    Option → "Register as new patient (reason required)"

TEST:
  Given: { given_name: "John", family_name: "Kamau", dob: "1990-03-15" }
  → If existing match found: Warning + merge option
```
