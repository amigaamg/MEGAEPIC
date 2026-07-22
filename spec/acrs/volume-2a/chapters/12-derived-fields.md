# Chapter 12: Derived Fields

## 12.1 Overview

Derived fields are automatically calculated from existing data. They must never be stored independently — they are computed on read.

---

## 12.2 Derivation Rules

### RULE DER-001 — BMI Calculation
```
Name:        Body Mass Index Calculation
Description: BMI = weight(kg) / height(m)²
Category:    DER
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  weight_kg ≠ null AND height_cm ≠ null

THEN
  height_m = height_cm / 100
  bmi = weight_kg / (height_m * height_m)
  bmi = ROUND(bmi, 1)

  Classification:
    bmi < 18.5    → "underweight"
    bmi 18.5-24.9 → "normal"
    bmi 25.0-29.9 → "overweight"
    bmi 30.0-34.9 → "obese_class_1"
    bmi 35.0-39.9 → "obese_class_2"
    bmi ≥ 40.0    → "obese_class_3"

TEST:
  Given: { weight_kg: 75, height_cm: 175 }
  → bmi = 24.5, classification = "normal"
```

### RULE DER-002 — EDD by Naegele's Rule
```
Name:        Estimated Delivery Date (Naegele's Rule)
Description: EDD = LMP + 280 days (40 weeks)
Category:    DER
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  pregnancy_status = "pregnant" AND lmp_date ≠ null

THEN
  edd = lmp_date + 280 days
  gestational_age_weeks = FLOOR((current_date - lmp_date) / 7)
  gestational_age_days = (current_date - lmp_date) % 7

  Display → "EDD: {edd} (Gestational age: {weeks}+{days})"

TEST:
  Given: { lmp: "2024-01-15", current: "2024-06-28" }
  → EDD = "2024-10-21", GA = 23+4 weeks
```

### RULE DER-003 — Age in Appropriate Unit
```
Name:        Age Display
Description: Display age in most clinically appropriate unit
Category:    DER
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  age ≠ null

THEN
  IF age < 1 year:
    Display age_in_months = "X months"
    IF age < 1 month:
      Display age_in_days = "X days"
      IF age < 1 day:
        Display age_in_hours = "X hours"

  IF age ≥ 1 year:
    Display age_in_years = "X years"
    IF age ≥ 65:
      Also display "X years (Older Adult)"

TEST:
  Given: { age: 0, age_unit: "days" } → Display: "2 days old"
  Given: { age: 6, age_unit: "months" } → Display: "6 months old"
  Given: { age: 70, age_unit: "years" } → Display: "70 years (Older Adult)"
```

### RULE DER-004 — Clinical Frailty Score
```
Name:        Clinical Frailty Scale (from functional status)
Description: Derive frailty from functional assessment responses
Category:    DER
Priority:    20 (Low)
Status:      Active
Version:     1.0.0

WHEN
  age_category = "older_adult" AND functional_status_questions completed

THEN
  Score based on:
    Independent in all activities     → 1 (Very fit)
    Minor limitations                 → 3 (Managing well)
    Needs help with shopping/walking  → 5 (Mildly frail)
    Needs help with all activities    → 7 (Severely frail)
    Terminally ill                    → 9 (Terminally ill)

TEST:
  Given: { independent_adl: true, independent_iadl: true, no_comorbidities: true }
  → Frailty score: 1 (Very fit)
```
