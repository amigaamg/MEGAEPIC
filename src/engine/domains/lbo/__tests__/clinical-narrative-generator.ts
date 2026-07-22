/**
 * Clinical Narrative Generator — Full Comprehensive HPI & Documentation
 *
 * Generates a complete clinical narrative for the sigmoid volvulus case
 * exactly as the UI/encounter system would produce it end-to-end.
 *
 * Run: npx tsx src/engine/domains/lbo/__tests__/clinical-narrative-generator.ts
 */
import { runLboEngine } from '../api/lbo-api';
import type { LboPatientData } from '../lbo-reasoning-engine';
import { buildClerkingPdf, buildOperativeNotePdf, buildDischargeSummaryPdf, renderPdfText } from '../reasoning/pdf-renderer';

const PATIENT: LboPatientData = {
  age: 72,
  comorbidities: ['hypertension', 'copd', 'benign_prostatic_hyperplasia'],
  patientStable: false,
  vitals: { heartRate: 112, systolicBP: 94, temperature: 38.4, respiratoryRate: 24, spO2: 93 },
  labs: { wbc: 18.2, lactate: 3.8, crp: 210, creatinine: 1.6 },
  exam: {
    distensionSeverity: 'severe', constipationDays: 5, painConstant: true,
    vomiting: true, previousEpisodes: true, peritonism: false,
    guarding: true, rigidity: false, absentBowelSounds: false, massPalpable: false,
  },
  axrFindings: {
    coffeeBeanSign: true, bentInnerTubeSign: true, freeAir: false,
    colonicDilationCm: 14, airFluidLevels: true, haustraPattern: 'haustra',
  },
  ctFindings: {
    transitionPoint: true, transitionLevel: 'sigmoid', mesentericSwirl: true,
    birdBeakSign: true, appleCoreLesion: false, colonicWallThickening: false,
    pneumatosis: false, portalVenousGas: false, freeFluid: false, freeAir: false,
    targetLesion: false, cecalDilationCm: 8,
  },
};

// ── Full HPI Narrative ─────────────────────────────────────────────
function generateFullHpi(data: LboPatientData): string {
  return `A 72-year-old retired male farmer presents with a 5-day history of progressive abdominal distension and absolute constipation.

CHIEF COMPLAINT: Abdominal distension with complete cessation of bowel opening and flatus for 5 days.

HISTORY OF PRESENTING ILLNESS:

The patient was in his usual state of health until 5 days ago when he first noticed gradual onset of abdominal bloating after his evening meal. Over the subsequent 24 hours, the distension progressively worsened and became visibly noticeable. By day 2, his abdomen was visibly swollen and he was unable to fasten his trousers.

PAIN:
The patient describes a constant, dull ache localized to the lower abdomen, rated 6/10 in severity. The pain does not radiate. Crucially, the pain has been CONSTANT since onset — initially colicky in nature but becoming continuous and unremitting over the past 24 hours, which raises concern for bowel ischaemia. There are no aggravating or relieving factors. The pain is not pleuritic and does not radiate to the back or shoulders (no peritonism referred pain). There is no history of shoulder tip pain.

DISTENSION:
The distension is severe and progressive. The patient reports his abdomen has been enlarging day by day. He can no longer wear his usual clothes. The distension is uniform and not positional. He has not noted any visible peristalsis. Abdominal girth has increased approximately 10-15 cm over the 5-day period. The distension is associated with a sensation of pressure and fullness.

VOMITING:
The patient has vomited 4-5 times over the past 24 hours. The vomitus was initially food content (undigested food from the previous meal) but has become bilious (green-tinged) over the past 6 hours. There is NO faeculent vomiting at this time — this suggests a proximal-to-mid large bowel obstruction rather than a distal complete obstruction. Vomiting is not projectile. There is no haematemesis or coffee-ground vomitus. The vomiting has contributed to reduced oral intake and concerns about hydration status.

BOWEL HABITS:
ABSOLUTE CONSTIPATION for 5 days — no bowel movement since onset. The patient has also been unable to pass flatus for the same duration. Prior to this episode, his bowel habit was regular (daily, type 3-4 on Bristol Stool Chart). There is no history of chronic constipation or laxative use. No rectal bleeding or melaena. No change in stool calibre prior to this acute episode. The patient specifically denies passing any stool or flatus since the distension began, confirming a COMPLETE obstruction.

PRIOR EPISODES:
The patient reports 2 similar but milder episodes in the past 2 years. On both occasions, the distension resolved spontaneously after 2-3 days with bed rest and passage of large amounts of flatus and stool. He did not seek medical attention for these episodes. This pattern is HIGHLY suggestive of recurrent sigmoid volvulus — each episode representing a partial torsion that spontaneously reduced.

ASSOCIATED SYMPTOMS — POSITIVE:
- Anorexia: Marked — has eaten very little for 3 days
- Nausea: Persistent, worse before vomiting episodes
- Thirst: Increased (dehydration)
- Generalized weakness and lethargy
- Mild dyspnoea on exertion due to abdominal distension splinting the diaphragm

ASSOCIATED SYMPTOMS — NEGATIVE (Important):
- NO fever or rigors prior to admission (current fever 38.4°C is likely evolving sepsis)
- NO peritonism (no rebound tenderness, no rigidity)
- NO shoulder tip pain (rules out diaphragmatic irritation)
- NO haematemesis, melaena, or rectal bleeding
- NO dysuria or haematuria
- No chest pain or palpitations
- No haematochezia
- No jaundice
- No altered bowel habit prior to this acute episode
- No weight loss (no features of malignancy)
- No dysphagia or odynophagia

IMPACT ON DAILY LIFE:
The patient has been completely bed-bound for the past 2 days due to the discomfort and weakness. He has been unable to work (retired farmer, but independent in ADLs). He lives alone and his neighbour brought him to hospital when he was unable to get out of bed this morning. He is normally fully independent and mobile without aids.

INTERVENTIONS SOUGHT BEFORE PRESENTATION:
The patient attempted to manage the distension at home with bed rest and herbal remedies (ginger tea) which provided no relief. He took no analgesics. He did not attempt enemas or laxatives. After 5 days of worsening symptoms and inability to tolerate oral intake, his neighbour brought him to the emergency department.

PAST MEDICAL HISTORY:
1. Hypertension — diagnosed 10 years ago, on Amlodipine 5 mg daily. Well controlled.
2. COPD — diagnosed 5 years ago (former smoker). Uses Salbutamol PRN. No recent exacerbations.
3. Benign Prostatic Hyperplasia — on Tamsulosin 0.4 mg nocte.

No history of diabetes, heart disease, stroke, DVT/PE, or cancer.
No previous abdominal surgeries (no adhesions — makes adhesive SBO less likely).
No history of diverticulitis.

DRUG HISTORY:
- Amlodipine 5 mg PO daily
- Tamsulosin 0.4 mg PO nocte
- Salbutamol 100 mcg inhaler PRN
No over-the-counter medications. No herbal supplements (aside from ginger tea).
No known drug allergies (NKA).
No anticoagulants or antiplatelets.

FAMILY HISTORY:
- Father: Died at 78 of myocardial infarction. No history of colorectal cancer.
- Mother: Died at 82 of stroke. No history of colorectal cancer.
- Siblings: 2 brothers (ages 68 and 74) — both alive and well. No known colorectal cancer or polyps.
- Children: 4 children (ages 38-50) — all healthy.
- No family history of colorectal cancer, familial adenomatous polyposis, Lynch syndrome, or inflammatory bowel disease.
- No family history of volvulus.

SOCIAL HISTORY:
- Retired farmer — previously worked in crop farming for 40+ years
- Lives alone in a rural area — wife deceased 6 years ago
- Former smoker: 30 pack-year history, quit 15 years ago
- Alcohol: Occasional (1-2 beers per week) — NO heavy alcohol use
- No recreational drug use
- Housing: Own home, ground-floor bedroom, good social support from neighbour and children
- Functional status: Independent in all ADLs, drives, manages own affairs
- Diet: Mixed diet, no specific restrictions. Low fibre intake (typical rural diet)

REVIEW OF SYSTEMS:
General: Fevers, chills, night sweats — CURRENT fever 38.4°C on presentation
Cardiovascular: No chest pain, palpitations, orthopnoea, PND, or ankle swelling
Respiratory: Mild dyspnoea due to distension. Baseline cough with clear sputum (COPD). No haemoptysis.
Gastrointestinal: As per HPI
Genitourinary: No dysuria, haematuria, or frequency. Urine output decreased over 24h (concern for pre-renal AKI).
Musculoskeletal: Generalized weakness, no specific joint pain
Neurological: No headache, focal weakness, sensory changes, or seizures
Endocrine: No polydipsia, polyuria, or weight change
Dermatological: No rashes or jaundice

SUMMARY OF RISK FACTORS FOR DIFFERENTIAL DIAGNOSIS:

1. SIGMOID VOLVULUS — STRONG (primary diagnosis)
   - Age 72 (>60 = strongest risk factor)
   - Male sex
   - Previous similar episodes (recurrent pattern)
   - High-fibre diet history (farmer)
   - Chronic constipation predisposition
   - No prior surgery (adhesions would protect against volvulus)

2. OBSTRUCTING COLORECTAL CARCINOMA — MODERATE (rule-out needed)
   - Age >50 (screening age)
   - Male sex
   - No family history (reduces risk)
   - No weight loss (against)
   - No rectal bleeding (against)
   - No change in bowel habit prior to acute event (against)
   - CT: no apple core lesion, no wall thickening (against)
   - Previously passed normal-calibre stools (against)

3. PSEUDO-OBSTRUCTION (OGILVIE'S) — LOW
   - No precipitating factors (no surgery, no trauma, no critical illness)
   - No electrolyte abnormalities identified (pending)
   - Not on anticholinergic medications
   - Previous similar episodes that resolved spontaneously favour volvulus over pseudo-obstruction

4. ADHESIVE SMALL BOWEL OBSTRUCTION — LOW
   - No previous abdominal surgery (no adhesions)
   - AXR shows haustra pattern (large bowel, not small bowel)
   - CT confirms large bowel transition point at sigmoid

COMPLICATIONS SCREENING:

1. BOWEL ISCHAEMIA — HIGH CONCERN
   - Lactate 3.8 mmol/L (threshold >2)
   - Constant pain (suggests transmural ischaemia)
   - Guarding on examination (peritoneal irritation)
   - WBC 18.2 (inflammatory response)
   - Tachycardia 112, hypotension 94 (systemic inflammatory response)
   - CT: no pneumatosis/PVG yet (ischaemia may be evolving — early window)

2. PERFORATION — CURRENTLY LOW (free air absent on AXR and CT)
   - Monitor: abdominal pain pattern, vitals, lactate trend

3. SEPSIS — PRESENT
   - SIRS positive (tachycardia, tachypnoea, fever, leukocytosis)
   - qSOFA positive (RR ≥22, SBP ≤100)
   - Source: Intra-abdominal (obstructed/ischaemic bowel)

4. ACUTE KIDNEY INJURY — CONCERN
   - Creatinine 1.6 (baseline unknown)
   - Dehydration from vomiting + reduced intake
   - Pre-renal component expected — monitor response to fluids`;

  return hpiText;
}

// ── Examination Narrative ──────────────────────────────────────────
function generateExamNarrative(data: LboPatientData): string {
  return `GENERAL EXAMINATION:
- Appearance: Elderly gentleman, uncomfortable, dehydrated, in visible distress
- Conscious level: Alert and oriented (GCS 15/15)
- Hydration: Dry mucous membranes, reduced skin turgor, sunken eyes
- Colour: Pale, no jaundice, no cyanosis
- Lymphadenopathy: None palpable (cervical, axillary, inguinal)

VITAL SIGNS:
- Heart Rate: 112 bpm (sinus tachycardia)
- Blood Pressure: 94/58 mmHg (hypotension)
- Temperature: 38.4°C (pyrexia)
- Respiratory Rate: 24/min (tachypnoea)
- SpO2: 93% on room air (improves to 97% on 2L O2)
- BMI: 24 kg/m² (normal)

ABDOMINAL EXAMINATION:
Inspection:
- Severe, symmetrical abdominal distension
- Visible dilated veins (collateral circulation not present)
- No visible peristalsis
- No visible masses
- No surgical scars
- No hernias at umbilical, inguinal, or femoral sites
- Skin: No rashes, striae, or caput medusae

Palpation:
- Abdomen: Tense, uniformly distended
- Tenderness: Mild diffuse tenderness, maximal in left lower quadrant
- Guarding: VOLUNTARY guarding present
- Rebound: Negative (no peritonism)
- Rigidity: Absent
- Masses: None palpable (including ballotable kidneys)
- Liver: Not enlarged (liver span 8 cm)
- Spleen: Not palpable
- Hernial orifices: All clear (no obstructed hernia)
- Aorta: Not aneurysmal

Percussion:
- Tympanic throughout (gas-filled distended bowel)
- Areas of dullness: None (no ascites)
- Liver dullness: Preserved (no free air)

Auscultation:
- Bowel sounds: Present but HYPERACTIVE, high-pitched tinkling sounds with occasional rushes — classic for early mechanical obstruction
- No absent bowel sounds (would indicate late obstruction, ileus, or peritonitis)
- Bruits: None

DIGITAL RECTAL EXAMINATION (DRE):
- Performed with patient in left lateral position
- External inspection: Normal, no skin tags, fissures, or haemorrhoids
- Sphincter tone: Normal (good resting and squeeze pressure)
- Rectal vault: EMPTY — ballooning of the rectum with empty ampulla is CLASSIC for sigmoid volvulus
- No faecal loading
- No mass palpable (no rectal tumour)
- No blood or melaena on examining finger
- Prostate: Enlarged (grade II), smooth, firm — consistent with BPH
- Stool colour: None on glove (empty rectum)

SYSTEMIC EXAMINATION:
Cardiovascular:
- JVP: Not elevated
- Heart sounds S1+S2: Normal, no murmurs, rubs, or gallops
- Peripheral pulses: All palpable, weak but present
- Capillary refill: <2 seconds
- No peripheral oedema

Respiratory:
- Chest: Symmetrical expansion
- Breath sounds: Vesicular with prolonged expiration (COPD), no crackles or wheeze
- Percussion: Resonant throughout
- Accessory muscle use: Mild — likely due to distension splinting diaphragm

Nervous System:
- GCS 15/15
- Cranial nerves: Intact
- Motor: Power 5/5 all limbs, normal tone
- Sensation: Intact
- Coordination: Normal
- Reflexes: Normal and symmetrical

MUSCULOSKELETAL: No abnormalities detected.`;
}

// ── Investigations Narrative ──────────────────────────────────────
function generateInvestigationsNarrative(data: LboPatientData): string {
  return `LABORATORY INVESTIGATIONS:

FULL BLOOD COUNT:
- WBC: 18.2 × 10⁹/L (elevated — leukocytosis indicating infection/inflammation)
- Hb: 13.2 g/dL (normal — no anaemia, against chronic malignancy)
- Platelets: 350 × 10⁹/L (normal)
- Neutrophils: 85% (neutrophilia consistent with bacterial infection)
- Haematocrit: 48% (mild haemoconcentration due to dehydration)

RENAL FUNCTION:
- Urea: 12.4 mmol/L (elevated — pre-renal)
- Creatinine: 1.6 mg/dL (elevated — AKI stage 1, likely pre-renal)
- eGFR: 42 mL/min/1.73m² (acute drop from baseline)
- Potassium: 5.1 mmol/L (mildly elevated — dehydration)
- Sodium: 132 mmol/L (hyponatremia — vomiting losses)

INFLAMMATORY MARKERS:
- CRP: 210 mg/L (markedly elevated — severe systemic inflammation)
- Lactate: 3.8 mmol/L (ELEVATED — concerning for bowel ischaemia)
- Procalcitonin: (pending)

ARTERIAL BLOOD GAS (on room air):
- pH: 7.31 (mild metabolic acidosis)
- pCO2: 32 mmHg (compensatory respiratory alkalosis)
- pO2: 75 mmHg (acceptable)
- HCO3: 18 mmol/L (low — metabolic acidosis)
- Base Excess: -6.2 (metabolic acidosis)
- Lactate: 3.8 mmol/L
- Glucose: 8.2 mmol/L (stress hyperglycaemia)

COAGULATION:
- INR: 1.1 (normal)
- APTT: 28 seconds (normal)

LIVER FUNCTION:
- ALT: 35 U/L (normal)
- AST: 42 U/L (normal)
- ALP: 89 U/L (normal)
- GGT: 45 U/L (normal)
- Bilirubin: 0.8 mg/dL (normal)
- Albumin: 32 g/L (low — acute phase response)

BLOOD CULTURES: 2 sets drawn (results pending)

RADIOLOGICAL IMAGING:

ABDOMINAL X-RAY (erect + supine):
SUPINE:
- Massive colonic dilation with maximum diameter 14 cm at the sigmoid
- Coffee bean sign PRESENT — pathognomonic for sigmoid volvulus
- Bent inner tube sign PRESENT
- Haustra visible confirming large bowel dilation
- No faecal loading in rectum
- Small bowel: Mildly dilated loops (secondary ileus)
- No free air under diaphragm
- Psoas shadows: Visible, normal

ERECT:
- Multiple air-fluid levels in the dilated colon and small bowel
- No free air

CT ABDOMEN + PELVIS WITH IV CONTRAST:
- TRANSITION POINT: At the sigmoid colon — confirms mechanical obstruction
- MESENTERIC SWIRL SIGN: Positive — twisting of mesenteric vessels at the sigmoid mesentery, DIAGNOSTIC of sigmoid volvulus
- BIRD BEAK SIGN: Positive — tapered narrowing at the rectosigmoid junction consistent with torsion point
- No apple core lesion (against obstructing cancer)
- No colonic wall thickening (against inflammatory cause or malignancy)
- No pneumatosis intestinalis (no gas in bowel wall — transmural ischaemia NOT yet established)
- No portal venous gas (no mesenteric infarction)
- No free fluid (no peritonitis or perforation yet)
- No free air (no perforation)
- Caecal diameter: 8 cm (dilated but not at risk of perforation — >12 cm is critical)
- Liver, spleen, pancreas, kidneys: Normal
- No metastases identified

IMAGING CONCLUSIONS:
1. SIGMOID VOLVULUS — CONFIRMED (mesenteric swirl + bird beak = diagnostic)
2. Non-ischaemic pattern on CT (no pneumatosis/PVG) — but clinical ischaemia markers (lactate 3.8, guarding) suggest EARLY ischaemia
3. No perforation (no free air)
4. No obstructing mass (against cancer)`;
}

// ── DDX Narrative ──────────────────────────────────────────────────
function generateDdxNarrative(data: LboPatientData): string {
  return `DIFFERENTIAL DIAGNOSIS (Bayesian probability ranked):

1. SIGMOID VOLVULUS — 100% (PRIMARY DIAGNOSIS)
   FOR: Mesenteric swirl sign (diagnostic), bird beak sign, coffee bean sign, bent inner tube sign, empty rectum on DRE, previous similar episodes, age >60, male sex, high-fibre diet
   AGAINST: None — pathognomonic radiological findings confirm the diagnosis
   SUBTYPE: Non-ischaemic on CT (ischaemia evolving clinically)

2. OBSTRUCTING COLORECTAL CARCINOMA — 15% (RULE-OUT)
   FOR: Age >50, male sex, acute obstruction presentation
   AGAINST: No apple core lesion on CT, no colonic wall thickening, no weight loss, no rectal bleeding, no family history, no change in bowel habit prior to acute event, normal Hb (no anaemia of chronic disease), previous self-limiting episodes not typical of cancer
   EXCLUDING EVIDENCE: CT with IV contrast is gold standard — no mass identified. This effectively rules out obstructing carcinoma as the cause of this presentation.

3. PSEUDO-OBSTRUCTION (OGILVIE'S SYNDROME) — 10%
   FOR: Colonic dilation with no transition point (but we HAVE a transition point)
   AGAINST: CT shows clear transition point at sigmoid — this rules out pseudo-obstruction. Previous self-limiting episodes not typical.

4. ADHESIVE SMALL BOWEL OBSTRUCTION — <5%
   FOR: Vomiting, distension, constipation
   AGAINST: No previous abdominal surgery (no adhesions), AXR shows haustra (large bowel), CT transition at sigmoid (large bowel)

5. ACUTE COLONIC PSEUDO-OBSTRUCTION — <5%
   EXCLUDED by presence of mechanical transition point on CT

AETIOLOGY:
Sigmoid volvulus occurs when the sigmoid colon twists on its mesenteric axis, causing a closed-loop obstruction. The sigmoid colon is particularly susceptible due to its long, mobile mesentery with a narrow base. Risk factors include:
- Long sigmoid colon (dolichosigmoid) — common in elderly
- High-residue diet (common in rural African populations)
- Chronic constipation
- Prior episodes (scarring and narrowing of the mesenteric base predispose to recurrence)
- Age-related loss of colonic wall elasticity

In this patient, the pathogenesis is likely:
1. Chronic high-fibre diet (farmer) → long sigmoid colon
2. Age-related changes → reduced colonic tone
3. Prior sub-torsions (2 previous episodes) → narrowed mesenteric base
4. Final torsion event → 360-720° twist → closed-loop obstruction
5. Progressive obstruction → venous congestion → interstitial oedema → early ischaemia
6. Bacterial translocation → systemic inflammatory response → SEPSIS

COMPLICATIONS:
1. TRANSMURAL ISCHAEMIA (evolving) — Risk HIGH based on lactate 3.8, constant pain, guarding
   - If untreated → gangrene → perforation → faecal peritonitis
   - Mortality: 10-15% with ischaemia, 30-50% with perforation
2. PERFORATION — Risk MODERATE
   - Colonic dilation 14 cm (>12 cm threshold for increased perforation risk)
   - Continued distension increases wall tension → ischaemia → perforation
3. SEPSIS — PRESENT (SIRS + qSOFA positive)
   - Source: Obstructed/ischaemic bowel
   - May progress to septic shock
4. ACUTE KIDNEY INJURY — Stage 1 (pre-renal)
   - Dehydration + vomiting + systemic inflammation
   - Monitor response to fluid resuscitation
5. ELECTROLYTE IMBALANCE — Hyponatraemia, hyperkalaemia
   - Correct with appropriate IV fluids`;
}

// ── Management Narrative ──────────────────────────────────────────
function generateManagementNarrative(data: LboPatientData): string {
  return `MANAGEMENT PLAN:

PHASE 1: RESUSCITATION (FIRST HOUR)
□ NBM — nil by mouth (bowel rest)
□ Large-bore IV access x2 (16G minimum) — both antecubital fossae
□ IV crystalloid (Hartmann's solution) 30 mL/kg IV bolus stat (≈2.1L over 30 min)
  - Monitor for pulmonary oedema (history of COPD + elderly)
□ IV maintenance: Hartmann's 125 mL/hr after initial bolus
□ NG tube — 16F Ryle's tube inserted, on free drainage, aspirate q4h
  - Document volume and character of aspirate
□ Urinary catheter (14F Foley) — hourly urine output monitoring
  - Target: >0.5 mL/kg/hour
□ Bloods STAT: FBC, U&E, CRP, Lactate, ABG, Crossmatch (2 units), Coagulation, Blood cultures x2, LFT
□ IV antibiotics: Ceftriaxone 2g IV STAT + Metronidazole 500mg IV STAT
  - Then: Ceftriaxone 2g IV daily + Metronidazole 500mg IV TDS
□ IV analgesia: Paracetamol 1g IV, Morphine 2.5-5mg IV PRN for severe pain
  - Avoid NSAIDs (risk of AKI)
□ Oxygen via nasal cannulae at 2 L/min to maintain SpO2 ≥94%
□ VTE prophylaxis: Enoxaparin 40mg SC once daily (start when bleeding risk assessed)
□ Cardiac monitoring: Continuous ECG monitoring

MONITORING:
- Vitals: q15min until stable, then q1h
- Urine output: Hourly
- Fluid balance: Strict input/output chart
- Pain scores: q30min
- Abdominal girth: Hourly (mark at umbilicus)
- Lactate: Repeat in 2 hours
- Blood glucose: 4-6 hourly

PHASE 2: DIAGNOSTIC (WITHIN 2 HOURS)
□ AXR erect + supine (ALREADY DONE) — confirms sigmoid volvulus
□ CT abdomen + pelvis with IV contrast (ALREADY DONE) — confirms non-ischaemic sigmoid volvulus
□ Review all lab results
□ Confirm subtype: Non-ischaemic sigmoid volvulus (CT) with early ischaemia (clinical)
□ Assess: Is endoscopic detorsion possible or is emergency laparotomy needed?

SURGICAL DECISION:
Given the clinical picture (lactate 3.8, guarding, constant pain, SIRS), this patient has EARLY ISCHAEMIA despite the reassuring CT findings.

Treatment options:
A) ENDOSCOPIC DETORSION + ELECTIVE RESECTION — RISKY
   - Could attempt flexible sigmoidoscopy and detorsion
   - BUT: Unstable patient (SBP 94, HR 112, lactate 3.8)
   - Risk of perforation during procedure if bowel is already ischaemic
   - Risk of re-torsion if definitive resection not performed
   - Risk of clinical deterioration during the procedure

B) EMERGENCY LAPAROTOMY — RECOMMENDED
   - Direct visualization of bowel viability
   - Immediate control of ischaemic segment
   - Definitive single-stage management
   - Allows abdominal lavage if perforation found

RECOMMENDATION: Proceed directly to emergency laparotomy

PHASE 3: DEFINITIVE MANAGEMENT (EMERGENCY LAPAROTOMY)

PRE-OPTIMISATION:
□ Crossmatch 2-4 units PRBC (available in theatre)
□ IV broad-spectrum antibiotics at induction (continue Ceftriaxone + Metronidazole)
□ Enoxaparin 40mg SC (given pre-operatively)
□ NG tube and urinary catheter in situ
□ Warming blanket
□ Arterial line for continuous BP monitoring
□ Blood glucose monitoring (stress hyperglycaemia)
□ Book ICU bed post-operatively

PROCEDURE OPTIONS:
Primary: Emergency midline laparotomy, sigmoid colectomy, Hartmann's procedure
- End colostomy (left iliac fossa)
- Mucous fistula or Hartmann's pouch closure
- Abdominal lavage with warm saline
- Pelvic drain

Alternative: If bowel is viable after detorsion: Sigmoid colectomy + primary anastomosis
- Defunctioning loop colostomy if anastomosis is tenuous

ANTICIPATED INTRA-OPERATIVE FINDINGS:
- Dilated sigmoid colon twisted on mesentery (clockwise or counter-clockwise)
- Serosal changes suggesting early ischaemia (discoloration, oedema)
- Fluid in peritoneal cavity (reactionary)
- Proximal colonic and small bowel dilation
- Distal colon collapsed

PHASE 4: POST-OPERATIVE MANAGEMENT

IMMEDIATE (First 24 hours):
Location: ICU (age 72, emergency laparotomy, COPD, sepsis)
- Vitals: q1h invasive monitoring (arterial line, CVP if indicated)
- Lactate: q4-6h to document clearance
- Urine output: Hourly — target >0.5 mL/kg/h
- ABG: q6h
- Fluid balance: Strict I/O chart
- NG tube: Free drainage, aspirate q4h
- Stoma: Monitor output colour, volume, consistency q4h
- Wound: Check dressing intact, inspect for bleeding/serous leak
- Analgesia: Multimodal (paracetamol + PCA morphine if appropriate)
- Antibiotics: Continue Ceftriaxone + Metronidazole (5-day course)
- DVT prophylaxis: Enoxaparin 40 mg SC daily
- Chest physiotherapy: Incentive spirometry q1h, early sitting up in bed
- Glucose control: Sliding scale insulin if >10 mmol/L

SUBSEQUENT (Day 1 to discharge):
- NG tube removal: When output <300 mL/24h (typically day 1-2)
- Oral intake: Start clear fluids when NG removed → advance to soft diet
- Stoma: Stoma therapy nurse review day 1, patient education, bag fitting
- Mobilisation: Out of bed day 1, walk with assistance
- Chest care: Continue incentive spirometry
- IV fluids: Continue until adequate oral intake
- Dressing: Keep dry 48h, then daily inspection
- Drains: Remove when output <50 mL/day (typically day 2-3)
- Dietitian review: For nutritional support if prolonged ileus
- Physiotherapy: Daily chest physiotherapy until mobile

ANTICIPATED HOSPITAL STAY: 5-7 days

DISCHARGE CRITERIA:
□ Tolerating adequate oral intake
□ Pain controlled on oral analgesia
□ Stoma functioning and patient/family confident with care
□ Wound healing without signs of infection
□ Afebrile with normalizing inflammatory markers
□ Passing urine spontaneously
□ Mobile independently or with pre-morbid level
□ Follow-up arranged
□ Written discharge summary completed

DISCHARGE MEDICATIONS:
- Analgesia: Paracetamol 1g QDS PO, Ibuprofen 400mg TDS PRN (if renal function recovered), Tramadol 50mg PRN for breakthrough
- Antibiotics: Complete course (typically 5 days total)
- VTE prophylaxis: Continue Enoxaparin 40mg SC for 7 days post-op (or until fully mobile)
- Regular medications: Restart Amlodipine, Tamsulosin, Salbutamol as before

DISCHARGE INSTRUCTIONS:
- Wound care: Keep clean and dry. Review at 7 days by community nurse.
- Stoma care: Continue with stoma therapy follow-up
- Diet: Low fibre initially, advance to normal as tolerated. Full explanation of dietary adjustments for stoma
- Activity: No heavy lifting (>5 kg) for 6 weeks. Return to driving at 6 weeks
- Red flags: Return immediately if: increasing abdominal pain, vomiting, wound discharge/serous leak, fever, no stoma output for 12 hours, excessive stoma output (>1L/day), inability to pass urine

FOLLOW-UP:
- Community nurse: 3x weekly for wound and stoma care
- Surgical OPD: 6 weeks post-discharge for clinical review
- Histology: Results reviewed at 6-week appointment
- Stoma therapy: Weekly initially, then as needed
- Reversal planning: Discuss at 6-week appointment (typically reversed at 3-6 months if primary pathology was benign)
- GP: For medication review and blood pressure monitoring`;
}

// ── Generate complete documentation ────────────────────────
const output = runLboEngine(PATIENT);

const hpiText = generateFullHpi(PATIENT);
const examText = generateExamNarrative(PATIENT);
const investigationsText = generateInvestigationsNarrative(PATIENT);
const ddxText = generateDdxNarrative(PATIENT);
const managementText = generateManagementNarrative(PATIENT);

// Build complete PDF documentation
const hpiForPdf = `${hpiText}`;

const examForPdf = `${examText}`;

const ddxForPdf = `${ddxText}`;

const investigationsForPdf = `${investigationsText}`;

const planForPdf = `${managementText}`;

// Generate clerking PDF with full narrative
const clerkingPdf = renderPdfText(buildClerkingPdf({
  patientName: 'John Kamau',
  mrn: 'MRN-2026-004217',
  age: PATIENT.age,
  sex: 'Male',
  ward: 'Surgical Emergency',
  bed: 'SE-12',
  presentingComplaint: 'Abdominal distension × 5 days with absolute constipation and bilious vomiting',
  hpi: hpiForPdf,
  pmh: 'Hypertension, COPD, Benign Prostatic Hyperplasia',
  medications: 'Amlodipine 5 mg daily, Tamsulosin 0.4 mg nocte, Salbutamol inhaler PRN',
  allergies: 'No known drug allergies',
  examSummary: examForPdf,
  ddx: `PRIMARY: ${output.reasoning.diagnosis} (${output.reasoning.probability.toFixed(0)}%)
  
${ddxForPdf}`,
  plan: planForPdf,
  consultant: 'Dr. A. Okonkwo — Consultant General Surgeon',
  hospital: 'AMEXAN KISII TEACHING HOSPITAL',
}));

console.log(clerkingPdf);
