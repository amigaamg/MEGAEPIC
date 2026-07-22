# Chapter 10: Specialty Activation Rules

## 10.1 Overview

Specialty Activation Rules determine which **department-specific history, examination, investigation, and management modules** are loaded when a patient is routed to a particular specialty.

Unlike the universal rules that apply to all patients, these rules **extend** the universal model with specialty-specific content.

---

## 10.2 Specialty Activation Rules

### RULE SPC-001 — Internal Medicine Activation
```
Name:        Internal Medicine Module Activation
Description: Activate internal medicine modules for adult medical patients
Category:    SPC
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "internal_medicine"

THEN
  Show → "full_systemic_review"
  Show → "chronic_disease_summary"
  Show → "medication_list"
  Show → "allergy_list"
  Show → "immunization_history" (adult)
  
  Show → "cardiovascular_system_review"
  Show → "respiratory_system_review"
  Show → "gastrointestinal_system_review"
  Show → "renal_system_review"
  Show → "endocrine_system_review"
  Show → "neurological_system_review"
  Show → "musculoskeletal_system_review"
  Show → "dermatological_system_review"

  Show → "comprehensive_examination"
  Show → "internal_medicine_investigations_panel"
  Show → "internal_medicine_management_templates"
```

---

### RULE SPC-002 — General Surgery Activation
```
Name:        General Surgery Module Activation
Description: Activate surgical modules for surgical patients
Category:    SPC
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "general_surgery"

THEN
  Show → "surgical_history"
  Show → "anaesthetic_history"
  Show → "nil_by_mouth_status"
  Show → "surgical_site_marking"

  Show → "surgical_abdomen_examination"
  Require → "guarding"
  Require → "rebound_tenderness"
  Require → "bowel_sounds"
  Require → "hernial_orifices"
  Require → "digital_rectal_examination" (if indicated)
  Show → "alvarado_score"
  Show → "surgical_scores" (CR-POSSUM, ASA)

  Show → "preoperative_checklist"
  Require → "asa_grade"
  Require → "informed_consent"
  Require → "nil_by_mouth_duration"

  Show → "postoperative_monitoring"
  Show → "wound_care_plan"
  Show → "drain_management"
  Show → "thromboprophylaxis_plan"

  Show → "surgical_investigations_panel" (imaging, labs, crossmatch)
  Show → "operative_note_template"
  Show → "discharge_planning_surgical"
```

---

### RULE SPC-003 — Obstetrics & Gynecology Activation
```
Name:        Obstetrics & Gynecology Module Activation
Description: Activate OBGYN modules for pregnant and gynecologic patients
Category:    SPC
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "obstetrics_gynecology"

THEN
  Show → "obstetric_history"
  Require → "gravida"
  Require → "para"
  Require → "lmp"
  Require → "edd"
  Show → "antenatal_visits_summary"
  Show → "gestational_age_calculation"

  Show → "menstrual_history"
  Require → "menstrual_pattern"
  Require → "last_menstrual_period"
  Require → "contraception_use"
  Show → "cervical_screening"
  Show → "breast_examination"

  Show → "obstetric_examination"
  Require → "fundal_height"
  Require → "fetal_heart_rate"
  Require → "presentation"
  Require → "engagement"
  Show → "partograph" (if in labour)

  Show → "pregnancy_monitoring"
  Show → "danger_signs"
  Require → "bp"
  Require → "urine_protein"
  Require → "fetal_movements"

  Show → "obstetric_investigations_panel"
  Show → "obstetric_ultrasound_requests"
  Show → "gynaecology_investigations_panel"
```

---

### RULE SPC-004 — Pediatrics Activation
```
Name:        Pediatric Module Activation
Description: Activate pediatric modules for children
Category:    SPC
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "pediatrics"

THEN
  Show → "pediatric_history"
  Show → "birth_history" (for children < 5 years)
  Show → "feeding_history"
  Show → "developmental_history"
  Require → "age_appropriate_milestones"
  Show → "immunization_history"
  Require → "vaccination_status"
  Show → "growth_chart"
  Require → "weight"
  Require → "height_length"
  Require → "head_circumference" (if < 2 years)
  Require → "weight_for_age_z_score"
  Show → "nutritional_assessment"
  Show → "mid_upper_arm_circumference" (MUAC)
  Show → "pediatric_early_warning_score" (PEWS)
  Show → "pediatric_medication_calculator" (weight-based dosing)
  Show → "pediatric_rehydration_calculator"
  Show → "pediatric_investigations_panel"
```

---

### RULE SPC-005 — Neonatology Activation
```
Name:        Neonatology Module Activation
Description: Activate neonatology modules for neonates
Category:    SPC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "neonatology"

THEN
  Hide → "adult_history"
  Hide → "adult_examination"
  Show → "neonatal_history"
  Show → "maternal_antenatal_history"
  Require → "maternal_conditions" (diabetes, hypertension, infections)
  Require → "antenatal_complications"
  Show → "perinatal_history"
  Require → "gestational_age_at_birth"
  Require → "mode_of_delivery"
  Require → "place_of_delivery"
  Require → "attendant_at_delivery"
  Show → "delivery_details"
  Require → "apgar_score_1min"
  Require → "apgar_score_5min"
  Require → "need_for_resuscitation"
  Require → "birth_weight"
  Require → "birth_length"
  Require → "birth_head_circumference"
  Show → "neonatal_examination"
  Require → "temperature"
  Require → "heart_rate"
  Require → "respiratory_rate"
  Require → "oxygen_saturation"
  Require → "blood_glucose"
  Show → "congenital_anomaly_screening"
  Show → "neonatal_jaundice_assessment"
  Require → "bilirubin_level"
  Show → "feeding_assessment"
  Require → "feeding_method"
  Require → "feed_tolerance"
  Show → "neonatal_immunizations"
  Show → "neonatal_investigations_panel"
  Show → "neonatal_medication_calculator"
  Show → "neonatal_monitoring_chart"
```

---

### RULE SPC-006 — Orthopedics Activation
```
Name:        Orthopedic Module Activation
Description: Activate orthopedic modules for musculoskeletal complaints
Category:    SPC
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "orthopedics"

THEN
  Show → "orthopedic_history"
  Show → "mechanism_of_injury"
  Require → "injury_date"
  Require → "injury_mechanism"
  Require → "energy_level" (high/low)
  Show → "orthopedic_examination"
  Show → "look_feel_move_special_tests" (universal orthopedic exam)
  Require → "inspection" (deformity, swelling, bruising, wounds)
  Require → "palpation" (tenderness, crepitus, warmth)
  Require → "range_of_motion" (active/passive)
  Require → "neurovascular_status" (distal to injury)
  Require → "special_tests" (specific to joint)
  Show → "fracture_assessment"
  Show → "open_fracture_grade" (Gustilo-Anderson)
  Show → "fracture_classification_tools"
  Show → "cast_application_guide"
  Show → "traction_guidelines"
  Show → "orthopedic_investigations_panel" (X-ray, CT, MRI protocols)
  Show → "preop_orthopedic_checklist"
  Show → "postop_orthopedic_monitoring"
  Show → "rehabilitation_plan"
  Show → "dvt_prophylaxis"
  Show → "orthopedic_outcome_scores"
```

---

### RULE SPC-007 — Psychiatry Activation
```
Name:        Psychiatry Module Activation
Description: Activate psychiatric modules for mental health patients
Category:    SPC
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "psychiatry"

THEN
  Show → "psychiatric_history"
  Show → "mental_state_examination"
  Require → "appearance_and_behavior"
  Require → "speech"
  Require → "mood_and_affect"
  Require → "thought_form_and_content"
  Require → "perception" (hallucinations)
  Require → "cognition"
  Require → "insight"
  Require → "judgment"
  Show → "suicide_risk_assessment"
  Require → "suicidal_ideation"
  Require → "suicide_plan"
  Require → "suicide_means"
  Require → "suicide_intent"
  Require → "protective_factors"
  Show → "risk_assessment" (self-harm, violence, neglect)
  Show → "substance_use_history"
  Show → "forensic_history"
  Show → "psychiatric_diagnostic_tools"
  Show → "phq9"
  Show → "gad7"
  Show → "moca"
  Show → "psychiatric_medication_monitoring"
  Show → "sectioning_orders" (if applicable)
  Show → "mental_health_act_compliance"
```

---

### RULE SPC-008 — Emergency Medicine Activation
```
Name:        Emergency Medicine Module Activation
Description: Activate emergency modules for emergency department
Category:    SPC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "emergency_medicine"

THEN
  Show → "triage_assessment"
  Hide → "comprehensive_history" (deferred)
  Show → "abcde_assessment"
  Require → "airway_patent"
  Require → "breathing"
  Require → "circulation"
  Require → "disability" (GCS)
  Require → "exposure"
  Show → "emergency_vitals"
  Require → "heart_rate"
  Require → "blood_pressure"
  Require → "respiratory_rate"
  Require → "oxygen_saturation"
  Require → "temperature"
  Require → "gcs"
  Require → "capillary_blood_glucose"
  Show → "resuscitation_chart"
  Show → "emergency_investigations_panel"
  Show → "emergency_medication_formulary"
  Show → "intubation_equipment_checklist"
  Show → "defibrillation_protocol"
  Show → "trauma_team_activation"
  Show → "sepsis_protocol"
  Show → "acute_coronary_syndrome_protocol"
  Show → "stroke_protocol"
  Show → "poisoning_antidote_guide"
  Show → "emergency_disposition_checklist"
```

---

### RULE SPC-009 — ICU Activation
```
Name:        ICU Module Activation
Description: Activate ICU modules for critically ill patients
Category:    SPC
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.department.specialty = "icu"
  OR encounter.visit_type = "icu"

THEN
  Show → "icu_admission_assessment"
  Show → "organ_support_assessment"
  Show → "ventilator_settings"
  Require → "ventilation_mode"
  Require → "fio2"
  Require → "peep"
  Require → "tidal_volume"
  Require → "minute_ventilation"
  Show → "hemodynamic_monitoring"
  Require → "mean_arterial_pressure"
  Require → "central_venous_pressure"
  Require → "vasopressor_dose"
  Show → "sedation_assessment" (RASS score)
  Show → "delirium_screening" (CAM-ICU)
  Show → "organ_failure_scoring" (SOFA, APACHE)
  Show → "daily_goals_checklist"
  Show → "infection_monitoring"
  Show → "nutritional_support"
  Show → "mobilisation_plan"
  Show → "icu_daily_review_template"
  Show → "icu_handover_tool"
  Show → "icu_exit_criteria"
```
