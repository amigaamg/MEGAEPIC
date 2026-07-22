# Chapter 9: Department Routing Rules

## 9.1 Department Object

```json
{
  "id": "uuid",
  "facility_id": "uuid",
  "name": "Emergency Department",
  "code": "ED",
  "specialty": "emergency_medicine",
  "specialty_group": "medical",
  "description": "24-hour emergency care",
  "requires_referral": false,
  "available_visit_types": ["emergency"],
  "age_restriction": null,
  "sex_restriction": null,
  "order": 1,
  "is_active": true
}
```

---

## 9.2 Department Routing Rules

### RULE DEP-001 — Emergency Routing
```
Name:        Emergency Department Routing
Description: All emergency visit types go to Emergency Department
Category:    DEP
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  encounter.visit_type = "emergency"

THEN
  Set → encounter.department_id = Emergency Department
  Lock → department (cannot be changed while emergency visit is active)
  
  IF patient arrives by ambulance:
    Set → encounter.source = "ambulance"
    Pre-notify → Emergency Department team
    Activate → trauma_team OR medical_team based on chief complaint

CLINICAL RATIONALE:
  Emergency patients always go to the Emergency Department.
  This is non-negotiable for patient safety.

TEST:
  Given: { visit_type: "emergency" }
  → Department = "Emergency Department"
```

---

### RULE DEP-002 — Obstetric Routing
```
Name:        Obstetric Department Routing
Description: Pregnant patients or obstetric complaints route to OBGYN
Category:    DEP
Priority:    100 (Critical)
Status:      Active
Version:     1.0.0

WHEN
  pregnancy_status = "pregnant"
  OR encounter.visit_type = "antenatal"
  OR encounter.visit_type = "postnatal"
  OR reason_for_visit CONTAINS ("pregnant", "labour", "contraction", "antenatal", "postnatal", "breastfeeding")

THEN
  IF gestation < 20 weeks AND emergency:
    Route → "Obstetrics & Gynecology" (ED overflow)
  
  IF gestation ≥ 20 weeks AND emergency:
    Route → "Obstetrics & Gynecology" (Labour Ward)
  
  IF non-emergency:
    Route → "Obstetrics & Gynecology" (Antenatal Clinic)

CLINICAL RATIONALE:
  Obstetric patients need specialized care. Pregnant patients
  should never be routed to general medical/surgical wards
  unless explicitly indicated.

TEST:
  Given: { visit_type: "antenatal" }
  → Department = "Obstetrics & Gynecology"
```

---

### RULE DEP-003 — Pediatric Routing
```
Name:        Pediatric Department Routing
Description: Children route to pediatrics unless surgical emergency
Category:    DEP
Priority:    80 (High)
Status:      Active
Version:     1.0.0

WHEN
  age_category ∈ ["neonate", "infant", "child"]
  AND encounter.visit_type ≠ "emergency"

THEN
  Route → "Pediatrics"
  
  IF age_category = "neonate":
    Route → "Neonatology" or "Pediatrics" (Neonatal Unit)

  IF surgical condition identified:
    Route → "Pediatric Surgery" (if available) or "General Surgery"

CLINICAL RATIONALE:
  Children have different physiology, drug metabolism, and
  common conditions than adults. They need pediatric specialists.

TEST:
  Given: { age_category: "neonate", visit_type: "ward_round" }
  → Department = "Neonatology" or special care baby unit
```

---

### RULE DEP-004 — Complaint-Based Subspecialty Routing
```
Name:        Complaint-Based Subspecialty Routing
Description: Within adult medicine, route based on complaint to appropriate subspecialty
Category:    DEP
Priority:    50 (Normal)
Status:      Active
Version:     1.0.0

WHEN
  age_category ∈ ["adult", "older_adult"]
  AND encounter.visit_type = "outpatient"
  AND facility has subspecialty departments

THEN
  Route based on complaint:

  Respiratory: ("cough", "breathless", "wheeze", "sputum", "haemoptysis")
    → "Respiratory Medicine"

  Cardiovascular: ("chest", "palpitation", "leg swelling", "syncope", "hypertension")
    → "Cardiology"

  Gastrointestinal: ("abdominal", "vomit", "diarrhoea", "constipation", "jaundice")
    → "Gastroenterology"

  Renal: ("urine", "kidney", "dialysis", "flank")
    → "Nephrology"

  Endocrine: ("diabetes", "thyroid", "weight loss", "hormone")
    → "Endocrinology"

  Neurological: ("headache", "seizure", "weakness", "numbness", "dizzy")
    → "Neurology"

  Musculoskeletal: ("joint", "back", "muscle", "bone", "fracture")
    → "Rheumatology" or "Orthopedics"

  Mental Health: ("depressed", "anxiety", "hallucination", "suicidal")
    → "Psychiatry"

  If no clear match:
    → "General Internal Medicine"

CLINICAL RATIONALE:
  Subspecialty routing ensures patients see the most appropriate specialist.

TEST:
  Given: { reason_for_visit: "Persistent cough with sputum for 3 weeks" }
  → Suggest: Respiratory Medicine
```
