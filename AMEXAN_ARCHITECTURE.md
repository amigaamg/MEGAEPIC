# AMEXAN Clinical OS - Architecture & Rules

## Overview

AMEXAN is a **Clinical Operating System** built around a **Clinical Rules Language (CRL)**. Unlike traditional EMRs organized by pages (history, exam, investigations), AMEXAN is organized by **clinical state** and driven by **explicit, versioned rules**.

### The Seven-Layer Object Model

```
1. ENTITY       - Nouns (patient, encounter, clinician, disease, drug, etc.)
2. OBSERVATION  - All clinical data as structured observations
3. EVENT        - Immutable state transitions (audit trail)
4. RULE         - CRL rules controlling behavior
5. INFERENCE    - Bayesian evidence relationships
6. WORKFLOW     - Encounter state machines
7. DOCUMENT     - Rendered views of observations (never duplicate storage)
```

### The Five-Layer Architecture

```
Medical Knowledge
        |
        v
Clinical Rules Layer (CRL)
        |
        v
Reasoning Engine
        |
        v
Workflow Engine
        |
        v
UI + Documentation Engine
```

---

## Clinical Rules Language (CRL)

Every rule follows this structure:

```
WHEN [conditions]
THEN [actions]
UNLESS [exceptions]
```

### Rule Categories

| Code | Category | Priority | Example |
|------|----------|----------|---------|
| SYS | System | 100 | Auth, autosave, audit |
| PAT | Patient | 100 | Age classification, sex-based pathways |
| ENC | Encounter | 100 | Emergency ABCDE, outpatient workflow |
| CLI | History | 80 | PMH significance, surgical history for abd pain |
| HPI | HPI | 80 | Each symptom gets own HPI, chronological display |
| EXM | Examination | 80 | History-driven exam selection, IPPA sequence |
| INV | Investigation | 80 | Differential-driven investigations |
| DX | Diagnosis | 80 | Red flags first, Bayesian probability |
| MGT | Management | 80 | Treatment linked to diagnosis, evidence-based |
| DOC | Document | 100 | SOAP format, discharge summary structure |
| AI | AI | 50 | AI assistant behavior |
| QLY | Quality | 100 | Allergy check, drug interactions |

---

## Key Clinical Rules (Numbered)

### PAT-0001: Age Classification
- **When**: patient.age exists
- **Action**: Derive age_category (neonate/infant/child/adolescent/adult/older_adult)

### PAT-0002: Sex-Based Pathway
- **When**: patient.sex = male
- **Action**: Hide menstrual_history, obstetric_history; Show urological_history

### PAT-0003: Female Reproductive Pathway
- **When**: patient.sex = female AND age >= 10 AND age <= 55
- **Action**: Show menstrual_history, obstetric_history, pregnancy_screening

### PAT-0004: Pregnancy Gateway
- **When**: pregnancy_status = pregnant AND sex = female
- **Action**: Activate obstetric_care pathway; Show antenatal_history; Hide gynecologic_exam

### PAT-0005: Non-Pregnant Female
- **When**: pregnancy_status = not_pregnant AND sex = female
- **Action**: Show gynecologic_history

### PAT-0006: Neonate Activation
- **When**: age_category = neonate
- **Action**: Show birth_history, maternal_history, feeding_history, neonatal_examination
- **Action**: Hide adult_history, geriatric_history, occupational_history

### PAT-0007: Pediatric Activation
- **When**: age_category IN (infant, child, adolescent)
- **Action**: Show developmental_history, immunization_history, growth_history, nutritional_history
- **Action**: Hide adult_pmh, occupational_history

### PAT-0008: Geriatric Activation
- **When**: age_category = older_adult
- **Action**: Show functional_status, falls_assessment, cognitive_assessment, polypharmacy_review

### ENC-0001: Emergency Protocol
- **When**: visit_type = emergency
- **Action**: Activate emergency_care pathway; Show abcde_assessment; Require airway_patent, breathing_rate, circulation_status, gcs

### ENC-0002: Outpatient Protocol
- **When**: visit_type = outpatient
- **Action**: Show chief_complaint, hpi_full, past_medical_history, examination_standard, assessment_plan

### ENC-0003: Inpatient Protocol
- **When**: visit_type IN (inpatient, ward_round)
- **Action**: Require admission_notes, progress_notes, monitoring_plan

### CLI-2000: Store Complaints Individually
- **When**: chief_complaint exists
- **Action**: Require complaint_onset, complaint_duration, complaint_severity, complaint_status

### CLI-2001: Display Chronologically
- **When**: chief_complaint exists
- **Action**: Sort complaints by onset (oldest first), not entry order

### CLI-2002: SOCRATES for Pain
- **When**: complaint_type = pain
- **Action**: Require: Site, Onset, Character, Radiation, Associations, Time, Exacerbating, Relieving, Severity

### HPI-0001: HPI Opens with Significant PMH
- **When**: pmh.significant exists
- **Action**: Auto-populate HPI opening: "This is a known [condition] patient diagnosed in [year], on [medications]..."

### HPI-0002: Each Symptom Independent HPI
- **When**: chief_complaint.count > 1
- **Action**: Warning: "Explore each symptom independently before chronological integration"

### HPI-0003: No Duplicate Questions
- **When**: smoking_status exists
- **Action**: Hide smoking_questions

### CLI-4001: Chronic Disease Association
- **When**: complaint contains "foot" OR "ulcer"
- **Action**: Ask about diabetes, peripheral vascular disease, smoking; Show diabetes_screening, vascular_assessment

### CLI-4010: Obstetric History for Reproductive Age
- **When**: sex = female AND age 10-55
- **Action**: Require gravida, para, live_children, miscarriages, LMP, menstrual_cycle, contraception

### CLI-4020: Pediatric Growth Parameters
- **When**: age_category IN (neonate, infant, child, adolescent)
- **Action**: Require weight, height, head_circumference, percentiles

### EXM-0001: Universal IPPA Structure
- **When**: examination exists
- **Action**: Require inspection, palpation, percussion, auscultation, interpretation, summary

### EXM-0002: History-Driven Exam - Respiratory
- **When**: complaint contains "chest" OR "breathless" OR "cough"
- **Action**: Activate respiratory_examination; Require RR, SpO2, auscultation

### EXM-0003: History-Driven Exam - Cardiovascular
- **When**: complaint contains "chest" OR "palpitation" OR pmh contains "hypertension"
- **Action**: Show cardiovascular_examination; Require HR, BP, heart sounds, murmurs, JVP, pulses

### EXM-0004: History-Driven Exam - Abdominal
- **When**: complaint contains "abdominal" OR "vomit" OR "diarrhoea"
- **Action**: Show abdominal_examination; Require inspection, palpation, percussion, auscultation, bowel sounds

### EXM-0005: History-Driven Exam - Neurological
- **When**: complaint contains "headache" OR "dizzy" OR "weakness" OR "seizure"
- **Action**: Show neurological_examination; Require GCS, cranial nerves, motor, sensory, reflexes, coordination, gait

### INV-0002: Chest Pain Investigations
- **When**: complaint = "chest pain"
- **Action**: Recommend ECG (immediate), Troponin (immediate), CXR, D-dimer (if low-moderate PE probability)

### INV-0003: Diabetic Foot Investigations
- **When**: complaint contains "foot" AND pmh contains "diabetes"
- **Action**: Recommend HbA1c, foot doppler, monofilament test, wound swab, X-ray foot, CRP/ESR

### DX-0001: Red Flags First
- **When**: complaint exists
- **Action**: Show red_flag_screening; Require red_flags_screened

### MGT-0001: Universal Management Structure
- **When**: management_plan exists
- **Action**: Require immediate_stabilization, definitive_treatment, medication_plan, monitoring_plan, follow_up_plan, patient_education

### MGT-0003: Diabetic Foot Management
- **When**: diagnosis contains "diabetic foot"
- **Action**: Require Wagner grade, wound care plan, offloading, infection management, glycemic target, vascular surgery referral

### CLI-5001: Surgical Abdomen
- **When**: complaint contains "acute abdomen" OR exam.rebound_tenderness = true
- **Action**: Activate surgical_abdomen pathway; Require Alvarado score, last meal time; Recommend CT abdomen, erect CXR

### CLI-6001: Mental State Examination
- **When**: encounter_type = psychiatric OR complaint contains "depressed" OR "suicidal"
- **Action**: Show mental_state_examination; Require appearance, behavior, speech, mood, affect, thought, perception, cognition, insight

### WRK-0001: Diagnosis Before Treatment
- **When**: state = treatment AND working_diagnosis NOT exists
- **Action**: Lock treatment workflow; Warning: "Cannot proceed without working diagnosis"

### WRK-0002: Emergency Override Audit
- **When**: override_workflow = true
- **Action**: Require override_reason, override_clinician; Raise audit alert

---

## Data Flow: How Rules Drive the System

### Example: 20-year-old Female with Diabetic Foot Ulcer

```
1. BIODATA ENTRY
   Age: 20 | Sex: Female
   
   → PAT-0001: age_category = adult
   → PAT-0003: Female 10-55 → Show menstrual_history, obstetric_history, pregnancy_screening
   → PAT-0002: NOT male → Don't show urological_history

2. CHIEF COMPLAINT
   "Foot ulcer for 3 months"
   "Fever for 5 days"
   
   → CLI-2000: Store each complaint individually with onset/duration
   → CLI-2001: Display chronologically: Foot ulcer (3mo) → Fever (5d)
   → CLI-4001: Foot complaint + diabetes PMH → Show diabetes_screening, vascular_assessment

3. HPI
   → HPI-0001: "This is a known type 1 diabetes patient diagnosed in 2008..."
   → HPI-0002: Explore foot ulcer independently, fever independently

4. EXAMINATION
   → EXM-0004: Not abdominal → Don't activate abdominal exam
   → EXM-0002: Not respiratory → Don't activate respiratory exam
   → Special: Diabetic foot exam activated by CLI-4001

5. INVESTIGATIONS
   → INV-0003 (diabetic foot): HbA1c, doppler, monofilament, wound swab, X-ray foot

6. DIAGNOSIS
   → DX-0001: Red flags screened
   → DX-0002: Generate differential from history + exam

7. MANAGEMENT
   → MGT-0001: Immediate → definitive → medication → monitoring → follow-up
   → MGT-0003: Wagner grade, wound care, offloading, glycemic control, vascular referral

8. DOCUMENTATION
   → DOC-0001: SOAP format
   → DOC-0003: All data rendered from observations, never duplicated
```

---

## Microservice Architecture

```
                         ┌─────────────┐
                         │   Gateway    │ :8080
                         └──────┬──────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    ┌────┴─────┐         ┌─────┴──────┐         ┌─────┴──────┐
    │ Encounter│ :8081   │  Patient   │ :8082   │  History   │ :8083
    └──────────┘         └────────────┘         └────────────┘
    ┌──────────┐         ┌────────────┐         ┌────────────┐
    │Examination│ :8084  │  Diagnosis │ :8085   │ Management │ :8086
    └──────────┘         └────────────┘         └────────────┘
    ┌──────────┐         ┌────────────┐         ┌────────────┐
    │Documents │ :8087   │   Orders   │ :8088   │   Rules    │ :8089
    └──────────┘         └────────────┘         └────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              ┌─────┴─────┐          ┌──────┴──────┐
              │ PostgreSQL│          │    Redis    │
              └───────────┘          └─────────────┘
```

---

## Universal Encounter Center

The main entry point replaces traditional pages with a **clinical command center**:

```
┌──────────────────────────────────────────────────────────┐
│  AMEXAN Clinical OS v2           [Search] [New] [Emergency] │
├──────────────────────────────────────────────────────────┤
│  Stats: Waiting(8) InProgress(12) Admitted(24) ICU(4)   │
├──────────────────────────────────────────────────────────┤
│  Queue: [Emergency][Outpatient][Ward][Clinic][ICU][Theatre][Tele] │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Priority │ Patient           │ Complaint      │time│  │
│  │ 🔴       │ John K. HN-8941  │ Chest pain     │ 5m │  │
│  │ 🟡       │ Mary W. HN-8912  │ Abdominal pain │ 12m│  │
│  │ 🔴       │ Baby M. HN-8956  │ Fever, no feed │ 3m │  │
│  └────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│  Quick Actions: [New Encounter][Labs][Prescribe][Refer]  │
│  Recent Activity: Critical lab result Hb 4.2 (2min ago)  │
│  CRL Status: 47 rules loaded, 12 categories, v1.0.0      │
└──────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **Observations store truth; documents render views**: Never duplicate data
2. **Rules are versioned and testable**: Historical encounters use old rules
3. **Specialties are plug-ins**: They extend, never modify, the universal engine
4. **Context is derived, not entered**: Age, sex, pregnancy status activate modules automatically
5. **Rules are stored in PostgreSQL**: Loaded into the CRL engine at startup
6. **All encounters are state machines**: Cannot skip diagnosis before treatment
7. **Emergency overrides are audited**: Can skip workflow but must document why
8. **Bayesian updates are continuous**: Every new observation updates disease probabilities

---

## CRL Rule ID Convention

```
Categories:  SYS, PAT, ENC, CLI, HPI, EXM, INV, DX, MGT, DOC, AI, QLY
Numbering:   4 digits per category

SYS-0001     System rules
PAT-0001     Patient classification
ENC-0001     Encounter workflow
CLI-0001     Clinical history (general)
CLI-1000     Biodata
CLI-2000     Chief Complaint
CLI-3000     HPI
CLI-4000     Past Medical History
CLI-5000     Surgical
CLI-6000     Psychiatric
HPI-0001     HPI rules
EXM-0001     Examination rules
INV-0001     Investigation rules
DX-0001      Diagnostic rules
MGT-0001     Management rules
DOC-0001     Documentation rules
QLY-0001     Quality/Safety rules
```
