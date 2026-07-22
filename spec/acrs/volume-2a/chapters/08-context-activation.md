# Chapter 8: Context Activation Engine

## 8.1 Overview

The **Context Activation Engine** is the core of AMEXAN's adaptive behavior. It takes patient, encounter, and environmental inputs and produces a **Clinical Context** — a set of activated modules, required fields, recommended questions, and blocked pathways.

This engine ensures the system shows only what is relevant: a neonate gets birth history, a reproductive-age female gets menstrual history, a geriatric patient gets falls assessment — all automatically, without manual configuration.

### 8.1.1 Activation Logic Flow

```
INPUTS:
  - Patient age → age_category
  - Patient sex → sex-based flags
  - Pregnancy status → obstetric activation
  - Visit type → workflow selection
  - Chief complaint → specialty routing
  - Known PMH → chronic disease pathways

ENGINE:
  For each CTX rule (sorted by priority):
    Evaluate conditions against current state
    If ALL conditions met → execute actions
    Actions modify: visible_sections, required_fields, recommendations, warnings

OUTPUT:
  - Visible sections (shown in UI)
  - Hidden sections (suppressed from UI)
  - Required fields (must be completed)
  - Recommended questions (adaptive questioning)
  - Activated pathways (clinical pathways to follow)
  - Triggered alerts (safety warnings)
```

---

## 8.2 Context Activation Rules

### RULE CTX-001 — Age Category Activates Core Modules
```
Name:        Age Category Activates Core History Modules
Description: History modules are selected based on age category
Category:    CTX
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  patient.clinical_context.age_category ≠ null

THEN
  IF age_category = "neonate":
    Show → "birth_history"
    Show → "maternal_antenatal_history"
    Show → "perinatal_history"
    Show → "feeding_history"
    Show → "neonatal_examination"
    Show → "immunization_history"
    Show → "neonatal_screening"
    Hide → "adult_history"
    Hide → "occupational_history"
    Hide → "sexual_history"
    Hide → "reproductive_history"
    Hide → "geriatric_assessment"

  IF age_category = "infant":
    Show → "birth_history" (abbreviated)
    Show → "developmental_history"
    Show → "feeding_history"
    Show → "immunization_history"
    Show → "growth_history"
    Show → "nutritional_history"
    Hide → "adult_history"
    Hide → "occupational_history"
    Hide → "sexual_history"

  IF age_category = "child" (2–9 years):
    Show → "developmental_history"
    Show → "immunization_history"
    Show → "growth_history"
    Show → "school_history"
    Show → "nutritional_history"
    Hide → "adult_history"
    Hide → "occupational_history"
    Hide → "sexual_history" (default; shown if clinically indicated)

  IF age_category = "adolescent" (10–19 years):
    Show → "developmental_history"
    Show → "immunization_history"
    Show → "growth_history"
    Show → "school_history"
    Show → "sexual_history" (confidential)
    Show → "mental_health_screening"
    Show → "substance_use_screening"
    Hide → "geriatric_assessment"

  IF age_category = "adult" (20–64 years):
    Show → "adult_history"
    Show → "occupational_history"
    Show → "sexual_history"
    Show → "reproductive_history"
    Show → "psychosocial_history"
    Hide → "neonatal_history"
    Hide → "geriatric_assessment"

  IF age_category = "older_adult" (65+):
    Show → "adult_history"
    Show → "geriatric_assessment"
    Show → "functional_status"
    Show → "falls_assessment"
    Show → "cognitive_assessment"
    Show → "polypharmacy_review"
    Show → "social_support_assessment"
    Show → "advanced_care_planning"
    Hide → "neonatal_history"
    Hide → "pediatric_history"

CLINICAL RATIONALE:
  Age is the primary determinant of clinical approach.
  A neonate's history is entirely different from an adult's.
  Automating this prevents inappropriate questions and ensures
  age-appropriate care.

EVIDENCE:
  Hutchison's Clinical Methods organizes history by age group.
  WHO guidelines for age-specific clinical assessment.

TEST:
  Given: { age_category: "neonate" }
  → birth_history visible, adult_history hidden

TEST:
  Given: { age_category: "older_adult" }
  → geriatric_assessment visible, falls_assessment required
```

---

### RULE CTX-002 — Sex Activates Reproductive Modules
```
Name:        Sex-Based Reproductive Module Activation
Description: Female patients get OBGYN modules; male patients get urology
Category:    CTX
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  patient.demographics.sex_at_birth ≠ null

THEN
  IF sex_at_birth = "female" AND age ≥ 10:
    Show → "menstrual_history"
    Show → "obstetric_history"
    Show → "gynecologic_history"
    Show → "contraception_history"
    Show → "pregnancy_screening"
    Show → "cervical_screening" (if age ≥ 25)
    Show → "breast_examination" (if age ≥ 20)
    Hide → "prostate_examination"
    Hide → "testicular_examination"
    Hide → "urological_history" (base level; shown if urological complaint)

  IF sex_at_birth = "female" AND age < 10:
    Show → "prepubescent_gynecologic_history" (as needed)
    Hide → "menstrual_history"
    Hide → "obstetric_history"

  IF sex_at_birth = "male":
    Show → "urological_history"
    Show → "prostate_screening" (if age ≥ 40)
    Show → "testicular_examination"
    Hide → "menstrual_history"
    Hide → "obstetric_history"
    Hide → "gynecologic_history"
    Hide → "pregnancy_screening"
    Hide → "contraception_history"
    Hide → "cervical_screening"

CLINICAL RATIONALE:
  Sex-specific modules should be automatically shown or hidden
  to avoid confusing or irrelevant questions. Asking a male patient
  about pregnancy is not just confusing—it's clinically inappropriate.

EVIDENCE:
  Hutchison's Clinical Methods: Reproductive system examination differs by sex.

TEST:
  Given: { sex_at_birth: "male", age: 45 }
  → menstrual_history HIDDEN, prostate_screening VISIBLE

TEST:
  Given: { sex_at_birth: "female", age: 30 }
  → menstrual_history VISIBLE, pregnancy_screening VISIBLE

TEST:
  Given: { sex_at_birth: "female", age: 8 }
  → menstrual_history HIDDEN, obstetric_history HIDDEN
```

---

### RULE CTX-003 — Pregnancy Activates Obstetric Pathway
```
Name:        Pregnancy Activates Full Obstetric Pathway
Description: If pregnant, activate obstetric care modules
Category:    CTX
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  patient.clinical_context.pregnancy_status = "pregnant"

THEN
  Show → "antenatal_history"
  Show → "obstetric_examination"
  Show → "fetal_assessment"
  Show → "contraction_monitoring"
  Show → "pregnancy_vitals" (BP, urine protein, weight)
  Show → "danger_signs_screening"
  Hide → "gynecologic_examination" (non-obstetric)
  Hide → "contraception_discussion"

  Require → gestational_age
  Require → gravida_para
  Require → edd (estimated delivery date)
  Require → lmp_date
  Require → bp_measurement
  Require → urine_protein
  Require → fetal_heart_rate
  Require → presentation (if ≥ 36 weeks)

  Auto-populate:
    edd = calculate_naegele(lmp_date)
    gestational_age = calculate_gestational_age(lmp_date, current_date)

  Recommend questions:
    "Any vaginal bleeding?"
    "Any lower abdominal pain?"
    "Any leaking of fluid?"
    "Decreased fetal movements?"
    "Any swelling of face or hands?"
    "Any headache or visual changes?"
    "Any burning with urination?"

CLINICAL RATIONALE:
  Pregnancy radically changes clinical approach. Obstetric history,
  examination, and monitoring differ from standard adult care.
  Naegele's rule: EDD = LMP + 280 days (40 weeks).

EVIDENCE:
  Naegele's rule for EDD calculation. WHO antenatal care guidelines.
  Hutchison's Clinical Methods: Obstetric history section.

TEST:
  Given: { pregnancy_status: "pregnant", lmp: "2024-01-15" }
  → EDD = "2024-10-21" (LMP + 280 days)
  → gestational_age calculated from LMP to current date
  → Antenatal modules activated
```

---

### RULE CTX-004 — Postpartum Context
```
Name:        Postpartum Clinical Context
Description: Postpartum patients require maternal and neonatal assessment
Category:    CTX
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  patient.clinical_context.pregnancy_status = "postpartum"
  AND patient.clinical_context.is_postpartum = true

THEN
  Show → "postnatal_history"
  Show → "breastfeeding_assessment"
  Show → "lochia_assessment"
  Show → "perineal_wound_assessment" (if vaginal delivery)
  Show → "caesarean_wound_assessment" (if C-section)
  Show → "postpartum_depression_screening" (EPDS)
  Show → "neonatal_feeding_status"
  Show → "neonatal_wellbeing"
  Show → "contraception_discussion"

  Require → delivery_date
  Require → mode_of_delivery
  Require → delivery_complications
  Require → baby_status

CLINICAL RATIONALE:
  The postpartum period has specific risks: hemorrhage, infection,
  thrombosis, and postpartum depression. Both mother and baby need assessment.

TEST:
  Given: { pregnancy_status: "postpartum", delivery_date: "2024-06-14" }
  → Postnatal modules activated; PPD screening shown
```

---

### RULE CTX-005 — Chief Complaint Activates System-Specific Modules
```
Name:        Chief Complaint Activates Relevant System Modules
Description: The presenting complaint determines which system reviews and exams are needed
Category:    CTX
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  encounter.reason_for_visit ≠ null

THEN
  IF complaint CONTAINS "chest" OR "cardiac" OR "heart" OR "palpitation":
    Show → "cardiovascular_examination"
    Show → "cardiac_investigations_panel"
    Show → "ecg_required"
    Require → bp_both_arms
    Require → heart_auscultation
    Recommended → troponin, CXR

  IF complaint CONTAINS "abdominal" OR "stomach" OR "belly" OR "vomit" OR "diarrhoea":
    Show → "abdominal_examination"
    Show → "gi_investigations_panel"
    Require → abdominal_palpation
    Require → bowel_sounds
    If female AND age 10-55:
      Show → "pelvic_history"
      Require → pregnancy_status

  IF complaint CONTAINS "head" OR "headache" OR "dizzy" OR "syncope":
    Show → "neurological_examination"
    Show → "neuro_investigations_panel"
    Require → gcs
    Require → cranial_nerve_exam
    Require → fundoscopy

  IF complaint CONTAINS "fever" OR "temperature" OR "hot":
    Show → "infectious_disease_screening"
    Show → "sepsis_screening"
    Require → temperature
    Require → heart_rate
    Require → respiratory_rate
    Recommended → FBC, CRP, blood_cultures, malaria_smear

  IF complaint CONTAINS "cough" OR "breathless" OR "sob" OR "dyspnoea":
    Show → "respiratory_examination"
    Show → "respiratory_investigations_panel"
    Require → respiratory_rate
    Require → oxygen_saturation
    Require → chest_auscultation
    Recommended → CXR, sputum_culture

  IF complaint CONTAINS "foot" OR "ulcer" OR "wound":
    Show → "wound_assessment"
    Show → "vascular_examination"
    Show → "neurological_examination" (peripheral)
    If pmh CONTAINS "diabetes":
      Show → "diabetic_foot_pathway"
      Require → monofilament_test
      Require → foot_pulses
      Required → hba1c

  IF complaint CONTAINS "pregnant" OR "contraction" OR "labour" OR "antenatal":
    Show → "obstetric_triage"
    Require → gestational_age
    Require → contraction_frequency
    Require → fetal_movements
    Require → membrane_status

  IF complaint CONTAINS "fall" OR "frail" OR "memory" OR "confused":
    If age_category = "older_adult":
      Show → "falls_assessment"
      Show → "cognitive_assessment"
      Show → "delirium_screening"

CLINICAL RATIONALE:
  The chief complaint is the entry point to clinical reasoning.
  It determines which body systems need detailed investigation.
  Hutchison's: "The presenting symptom directs the entire clinical examination."

TEST:
  Given: { reason_for_visit: "Chest pain for 2 hours" }
  → cardiovascular_examination VISIBLE, ECG required

TEST:
  Given: { reason_for_visit: "Diabetic foot ulcer right foot", pmh: ["diabetes"] }
  → diabetic_foot_pathway ACTIVATED, hba1c required, wound_assessment VISIBLE
```

---

### RULE CTX-006 — Known Chronic Disease Activates Relevant Pathways
```
Name:        Chronic Disease Activates Management Pathways
Description: Known chronic conditions activate disease-specific modules
Category:    CTX
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  patient has known chronic disease (from PMH)

THEN
  IF pmh CONTAINS "diabetes":
    Show → "diabetes_history"
    Show → "diabetes_complication_screening"
    Show → "glycemic_monitoring"
    Show → "foot_care_pathway"
    Require → last_hba1c
    Require → current_medications
    Recommend → annual_complication_screening

  IF pmh CONTAINS "hypertension":
    Show → "hypertension_history"
    Show → "target_organ_assessment"
    Show → "bp_measurement_protocol"
    Require → current_bp
    Require → current_medications
    Require → medication_adherence

  IF pmh CONTAINS "asthma":
    Show → "asthma_history"
    Show → "peak_flow_monitoring"
    Show → "inhaler_technique_check"
    Require → exacerbation_frequency
    Require → current_medications

  IF pmh CONTAINS "hiv":
    Show → "hiv_history"
    Show → "art_adherence_check"
    Show → "opportunistic_infection_screening"
    Show → "cd4_viral_load_check"
    Show → "who_staging"
    Require → last_cd4
    Require → last_viral_load
    Require → current_art_regimen

  IF pmh CONTAINS "tuberculosis":
    Show → "tb_history"
    Show → "tb_treatment_monitoring"
    Show → "contact_tracing"
    Require → treatment_start_date
    Require → current_phase
    Require → sputum_status

  IF pmh CONTAINS "epilepsy":
    Show → "seizure_history"
    Show → "seizure_diary"
    Show → "medication_levels"
    Show → "driving_advice"
    Require → seizure_frequency
    Require → current_medications

  IF MULTIPLE chronic diseases:
    Show → "polypharmacy_review"
    Show → "drug_interaction_check"
    Show → "medication_reconciliation"

CLINICAL RATIONALE:
  Chronic diseases require ongoing structured monitoring and
  complication screening. The system should automatically surface
  relevant modules based on known conditions.

TEST:
  Given: { pmh: ["diabetes", "hypertension"] }
  → diabetes_history VISIBLE, hypertension_history VISIBLE
  → polypharmacy_review VISIBLE
  → foot_care_pathway VISIBLE
```

---

### RULE CTX-007 — Visit Type + Complaint Determine Department
```
Name:        Department Routing from Context
Description: Suggest department based on visit type and complaint
Category:    CTX
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  encounter.visit_type ≠ null AND encounter.reason_for_visit ≠ null

THEN
  IF visit_type = "emergency":
    Suggest → "Emergency Department" (fixed)
  
  IF visit_type = "antenatal":
    Suggest → "Obstetrics & Gynecology"
  
  IF visit_type = "outpatient":
    IF complaint CONTAINS any surgical keyword ("abdomen", "mass", "lump", "wound", "fracture"):
      Suggest → "General Surgery"
    ELIF complaint CONTAINS any obstetric keyword ("pregnant", "labour", "antenatal"):
      Suggest → "Obstetrics & Gynecology"
    ELIF complaint CONTAINS any pediatric keyword ("child", "baby", "growth", "vaccination"):
      Suggest → "Pediatrics"
    ELIF complaint CONTAINS any cardiac keyword ("chest", "heart", "bp", "hypertension"):
      Suggest → "Internal Medicine" or "Cardiology"
    ELIF complaint CONTAINS any orthopedic keyword ("pain", "swelling", "limb", "joint"):
      Suggest → "Orthopedics"
    ELSE:
      Suggest → "General Medicine" (default)

  Department suggestion can be overridden by clinician.

CLINICAL RATIONALE:
  Automatically routing patients to the correct department reduces
  wait times and ensures appropriate specialist care.

TEST:
  Given: { visit_type: "emergency" }
  → Department: Emergency Department

TEST:
  Given: { visit_type: "outpatient", reason_for_visit: "Abdominal pain, vomiting" }
  → Department: General Surgery (suggested)
```
