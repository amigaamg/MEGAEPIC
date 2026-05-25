// ═══════════════════════════════════════════════════════════════════════════
// AMEXAN — NOTE REGISTRY & CLINICAL CONSTANTS  noteRegistry.js
// ═══════════════════════════════════════════════════════════════════════════
import { DS } from "./ds";

export const NOTE_REGISTRY = [
  // ── INPATIENT ──────────────────────────────────────────────────────────────
  { id:"initial_clerking",   label:"Initial Clerking",       icon:"📋", group:"Inpatient", color:DS.teal,
    engine:"HISTORY",   description:"Full structured admission history & examination" },
  { id:"progress_note",      label:"Progress Note",          icon:"✍",  group:"Inpatient", color:DS.indigo,
    engine:"SOAP",      description:"SOAP / SOAPIER / Narrative progress documentation" },
  { id:"ward_round",         label:"Ward Round",             icon:"🏃", group:"Inpatient", color:DS.amber,
    engine:"WARD",      description:"Fast ward round entry — Day N flowsheet" },
  { id:"discharge_summary",  label:"Discharge Summary",      icon:"🚪", group:"Inpatient", color:DS.green,
    engine:"DISCHARGE", description:"Auto-compiled from admission timeline" },
  { id:"procedure_note",     label:"Procedure Note",         icon:"🔧", group:"Inpatient", color:DS.purple,
    engine:"PROCEDURE", description:"Structured procedural checklist with consent" },
  { id:"pre_op_note",        label:"Pre-Op Note",            icon:"✅", group:"Inpatient", color:DS.amber,
    engine:"SOAP",      description:"Pre-operative assessment and consent" },
  { id:"post_op_note",       label:"Post-Op Note",           icon:"🩹", group:"Inpatient", color:DS.amber,
    engine:"SOAP",      description:"Post-operative review and orders" },
  { id:"consultation_note",  label:"Consultation Note",      icon:"🤝", group:"Inpatient", color:DS.indigo,
    engine:"SOAP",      description:"Specialist consultation response" },
  { id:"transfer_note",      label:"Transfer / ISBAR",       icon:"🚑", group:"Inpatient", color:DS.red,
    engine:"ISBAR",     description:"Structured ISBAR handover and transfer documentation" },
  { id:"referral_note",      label:"Referral Note",          icon:"📨", group:"Inpatient", color:DS.teal,
    engine:"REFERRAL",  description:"Referral letter with summary and specific request" },
  { id:"icu_review",         label:"ICU Review",             icon:"🫀", group:"Inpatient", color:DS.red,
    engine:"ICU",       description:"Intensive care unit daily review" },
  { id:"nursing_note",       label:"Nursing Note",           icon:"👩‍⚕️", group:"Inpatient", color:DS.green,
    engine:"NURSING",   description:"Nursing assessment and care note" },
  { id:"mdt_review",         label:"MDT Review",             icon:"👥", group:"Inpatient", color:DS.purple,
    engine:"MDT",       description:"Multidisciplinary team review summary" },
  // ── OUTPATIENT ─────────────────────────────────────────────────────────────
  { id:"new_clinic_visit",   label:"New Clinic Visit",       icon:"🆕", group:"Outpatient", color:DS.teal,
    engine:"CLINIC",    description:"New outpatient presentation — full history" },
  { id:"clinic_followup",    label:"Clinic Follow-up",       icon:"🔄", group:"Outpatient", color:DS.indigo,
    engine:"CLINIC_FU", description:"Continuity follow-up with last-visit recall" },
  { id:"chronic_care_review",label:"Chronic Care Review",    icon:"📈", group:"Outpatient", color:DS.green,
    engine:"CHRONIC",   description:"DM / HTN / Asthma / HIV / TB / Epilepsy management" },
  { id:"telemedicine_note",  label:"Telemedicine Note",      icon:"💻", group:"Outpatient", color:DS.purple,
    engine:"CLINIC",    description:"Remote consultation documentation" },
  // ── SPECIALTY ──────────────────────────────────────────────────────────────
  { id:"antenatal_review",   label:"Antenatal Review",       icon:"🤰", group:"Specialty",  color:"#f472b6",
    engine:"SOAP",      description:"Antenatal visit with EGA and risk assessment" },
  { id:"death_summary",      label:"Death Summary",          icon:"📜", group:"Specialty",  color:DS.muted,
    engine:"SOAP",      description:"Formal death documentation and cause of death" },
  { id:"morbidity_review",   label:"Morbidity / M&M",        icon:"📊", group:"Specialty",  color:DS.amber,
    engine:"SOAP",      description:"Morbidity and mortality review note" },
];

export const SOAP_FIELDS = {
  S: { label:"S – Subjective",     hint:"Patient's complaints, symptoms, history as reported", rows:4 },
  O: { label:"O – Objective",      hint:"Examination findings, vitals, investigations, results", rows:4 },
  A: { label:"A – Assessment",     hint:"Impression, diagnosis, differentials, severity grading", rows:3 },
  P: { label:"P – Plan",           hint:"Investigations, treatment, referrals, counselling, follow-up", rows:4 },
  I: { label:"I – Implementation", hint:"Actions carried out during this encounter", rows:3 },
  E: { label:"E – Evaluation",     hint:"Response to treatment and changes observed", rows:3 },
  R: { label:"R – Revision",       hint:"Revised plan based on evaluation", rows:3 },
};

export const QUICK_PHRASES = [
  "No acute events overnight.",
  "Patient hemodynamically stable.",
  "Afebrile — temperature settling.",
  "Tolerating oral feeds/fluids well.",
  "Passing stool — bowel sounds present.",
  "Improved respiratory distress.",
  "Plan to step down oxygen supplementation.",
  "For discharge if clinically stable tomorrow.",
  "Wound healing well — no signs of infection.",
  "Pain adequately controlled on current regimen.",
  "Family counselled regarding diagnosis and plan.",
  "Awaiting laboratory results before escalating.",
  "Reviewed with consultant — plan unchanged.",
  "Chest clear on auscultation today.",
  "Urine output adequate — diuresis maintained.",
];

// ── Context-dependent clinical intelligence ───────────────────────────────────
// Returns smart prompts/hints based on impression/context

export const CLINICAL_CONTEXT_RULES = {
  infection: {
    keywords: ["sepsis","pneumonia","meningitis","UTI","cellulitis","malaria","typhoid","TB","abscess"],
    requiredLabs: [
      { name:"FBC/CBC", reason:"WBC with differential — leukocytosis, neutrophilia, left shift, lymphocytopenia" },
      { name:"Blood culture", reason:"Before antibiotics — identify organism and sensitivities" },
      { name:"CRP / ESR", reason:"Inflammatory markers — severity and treatment response" },
      { name:"Procalcitonin", reason:"Bacterial vs viral — antibiotic stewardship" },
      { name:"Urine MCS", reason:"Urinary source / exclude UTI" },
      { name:"Malaria RDT / thick & thin film", reason:"Endemic area — exclude malaria" },
    ],
    labInterpretation: {
      WBC: { high:">11 ×10⁹/L: bacterial infection likely; >30: ?leukaemia — refer haem", low:"<4 ×10⁹/L: viral / overwhelm sepsis / HIV" },
      Neutrophils: { high:">7.5: bacterial; left shift = immature neutrophils — severe infection", low:"<1.5: neutropenia — high infection risk" },
      Lymphocytes: { low:"<1.0: HIV, viral, TB, steroid use — check CD4" },
      CRP: { high:">100: likely bacterial; >200: severe infection / sepsis" },
      Hb: { low:"Haemolytic anaemia in malaria / haemolytic sepsis — comment on MCV & reticulocytes" },
      Platelets: { low:"DIC in sepsis, malaria thrombocytopenia — coag screen", high:">450 reactive thrombocytosis — iron deficiency?" },
    },
    hints: [
      "Document fever pattern (intermittent/continuous/remittent) and response to antipyretics.",
      "Comment on ALL cell lines in FBC — anaemia in infection, thrombocytopenia in sepsis.",
      "Fluid balance critical — sepsis causes distributive shock.",
    ],
  },
  paediatric: {
    keywords: ["child","infant","neonate","newborn","paediatric","pediatric"],
    requiredLabs: [
      { name:"Blood sugar (CBG)", reason:"Hypoglycaemia common in sick children — check immediately" },
      { name:"FBC with differential", reason:"Age-specific normal ranges — WBC higher in young children" },
      { name:"Malaria RDT", reason:"Any febrile child in endemic area" },
    ],
    medicationRules: [
      "WEIGHT-BASED DOSING — document weight in kg on every note.",
      "Paracetamol: 15 mg/kg/dose every 6–8h (max 60 mg/kg/day).",
      "Amoxicillin: 25–50 mg/kg/day ÷ TDS.",
      "Gentamicin: 7.5 mg/kg once daily (neonates 5 mg/kg).",
      "Ampicillin: 50 mg/kg/dose Q6h IV.",
      "Avoid aspirin — Reye syndrome risk.",
      "Avoid fluoroquinolones in children < 12 years unless specialist advice.",
    ],
    hints: [
      "Document immunisation status on every paediatric admission note.",
      "Birth history relevant for neonates and young infants.",
      "Nutritional status — document weight, height, MUAC, z-scores for children under 5.",
      "Developmental milestones for children < 5 years.",
      "Nutritional assessment: Kwashiorkor vs Marasmus criteria.",
    ],
  },
  obstetric: {
    keywords: ["pregnant","antenatal","obstetric","gravida","para","gestation","trimester","eclampsia","APH","PPH","labour"],
    requiredLabs: [
      { name:"Urinalysis / dipstick", reason:"Proteinuria — pre-eclampsia screening; nitrites — UTI" },
      { name:"FBC", reason:"Anaemia in pregnancy (Hb < 11 g/dL); platelet count — HELLP" },
      { name:"LFTs + urea & creatinine", reason:"HELLP syndrome; pre-eclampsia end-organ damage" },
      { name:"Group & crossmatch", reason:"Obstetric emergency — blood readily available" },
      { name:"HIV / VDRL / Hep B", reason:"Antenatal booking screens — PMTCT" },
      { name:"Random blood sugar / OGTT", reason:"Gestational diabetes screening (24–28 weeks)" },
    ],
    hints: [
      "Document EGA (gestational age) on EVERY obstetric note — always.",
      "Gravida/Para status required.",
      "Always document BP — pre-eclampsia silent until late.",
      "Fetal heart rate and fetal movement on every antenatal note.",
      "Safe medications in pregnancy: paracetamol, amoxicillin, methyldopa for HTN.",
      "Avoid NSAIDs after 28 weeks — premature duct closure.",
      "Avoid ACE inhibitors in pregnancy — teratogenic.",
    ],
  },
  postOperative: {
    keywords: ["post-op","post op","postoperative","post operative","post-surgical","operation","surgical","laparotomy","appendicectomy","caesarean","cs delivery"],
    requiredLabs: [
      { name:"FBC (Day 1 & Day 3 post-op)", reason:"Hb drop — bleeding; WBC — infection" },
      { name:"Urea & Electrolytes", reason:"Fluid shifts, AKI post-op" },
      { name:"Blood glucose", reason:"Surgical stress hyperglycaemia — especially in DM" },
      { name:"CXR (if respiratory concern)", reason:"Atelectasis, aspiration, pleural effusion" },
    ],
    hints: [
      "Document day post-op on every post-operative note (e.g. Day 2 post laparotomy).",
      "Return of bowel function — flatus, stool, bowel sounds — document daily.",
      "Wound inspection — note site, length, healing, any discharge.",
      "DVT prophylaxis — LMWH and TED stockings — documented?",
      "Urinary catheter status — remove ASAP (Day 1–2 for CS, Day 2–3 laparotomy).",
      "Early mobilisation — document physiotherapy.",
      "Drain output — colour, volume — document daily.",
      "IV to oral analgesia step-down when tolerating feeds.",
    ],
  },
  cardiovascular: {
    keywords: ["heart failure","cardiac","CCF","MI","ACS","hypertension","arrhythmia","pericarditis","valve"],
    requiredLabs: [
      { name:"ECG", reason:"Rhythm, ischaemia, LVH, electrolyte effect" },
      { name:"Troponin I or T", reason:"ACS — serial at 0 and 3–6 hours" },
      { name:"BNP / NT-proBNP", reason:"Heart failure severity and prognosis" },
      { name:"FBC", reason:"Anaemia exacerbating cardiac failure" },
      { name:"U&E", reason:"Electrolytes in heart failure / diuretic use; renal function" },
      { name:"CXR", reason:"Cardiomegaly, pulmonary oedema, pleural effusions" },
      { name:"Echocardiogram", reason:"EF assessment, wall motion, valve function, pericardial effusion" },
    ],
    hints: [
      "Daily weight in heart failure — best marker of fluid status.",
      "Strict fluid restriction and fluid balance in decompensated heart failure.",
      "BP — target and current — document on every review.",
      "Medication: ACE inhibitor, beta-blocker, spironolactone, diuretic doses.",
    ],
  },
  diabetes: {
    keywords: ["diabetes","DM","DKA","hypoglycaemia","hyperglycaemia","T2DM","T1DM","insulin","HbA1c"],
    requiredLabs: [
      { name:"Blood glucose (fasting & 2h post-prandial)", reason:"Glycaemic control" },
      { name:"HbA1c", reason:"3-month glycaemic control — target < 7% (53 mmol/mol)" },
      { name:"U&E + Creatinine", reason:"Diabetic nephropathy monitoring" },
      { name:"Urine ACR (albumin:creatinine ratio)", reason:"Microalbuminuria — earliest nephropathy marker" },
      { name:"Lipid profile", reason:"Cardiovascular risk reduction" },
      { name:"eGFR", reason:"CKD staging in diabetic nephropathy" },
      { name:"ECG", reason:"Silent MI common in DM — annual screen" },
      { name:"Foot examination", reason:"Peripheral neuropathy and vasculopathy" },
    ],
    hints: [
      "DKA: pH < 7.3, bicarbonate < 15, ketonaemia — treat with IV fluids + insulin infusion + K+ replacement.",
      "Document HbA1c target and current value.",
      "Medication review: metformin dose based on eGFR (hold if < 30); insulin doses.",
      "Annual review: eyes (ophthalmologist), feet (podiatry), kidneys (ACR), BP, lipids.",
    ],
  },
  respiratory: {
    keywords: ["asthma","COPD","pneumonia","TB","pleural effusion","pneumothorax","respiratory failure","bronchitis"],
    requiredLabs: [
      { name:"ABG (Arterial Blood Gas)", reason:"Type I vs Type II respiratory failure; pH, pCO₂, pO₂, bicarbonate" },
      { name:"SpO₂ continuous monitoring", reason:"Trend more important than single value" },
      { name:"CXR", reason:"All respiratory admissions — consolidation, effusion, pneumothorax, cardiomegaly" },
      { name:"Sputum MCS + AFB × 3", reason:"Community pneumonia, TB screening" },
      { name:"Peak Flow", reason:"Asthma severity (% predicted) — pre and post bronchodilator" },
      { name:"FBC", reason:"Eosinophilia in asthma/parasitic; neutrophilia in bacterial" },
      { name:"CRP + procalcitonin", reason:"Bacterial vs viral — antibiotic decision support" },
    ],
    hints: [
      "Document O₂ delivery device and flow rate on every note.",
      "Asthma severity: mild (SpO₂ > 95%, speaks in sentences) / moderate / severe (SpO₂ < 92%, unable to complete sentences) / life-threatening.",
      "COPD: target SpO₂ 88–92% — risk of CO₂ retention with high-flow O₂.",
    ],
  },
};

// ── Smart investigation prompt engine ───────────────────────────────────────
export function getContextualHints(impressions = [], noteType = "", patient = {}) {
  const impText = impressions.join(" ").toLowerCase();
  const hints = [];
  const requiredLabs = [];
  const medRules = [];
  const labInterpretation = {};

  // Age-based context
  const age = parseInt(patient?.age) || 0;
  const isPaediatric = age < 18 || impText.includes("child") || impText.includes("infant") || impText.includes("neonat");
  const isNeonate = age < 28/365 || impText.includes("neonate") || impText.includes("newborn");

  // Pregnancy context
  const isObstetric = patient?.gender === "Female" &&
    (impText.includes("pregnant") || impText.includes("antenatal") || impText.includes("gravida") ||
     impText.includes("gestation") || impText.includes("trimester") || impText.includes("eclampsia") ||
     noteType === "antenatal_review");

  // Post-op context
  const isPostOp = noteType === "post_op_note" || impText.includes("post-op") || impText.includes("postoperative");

  // Match clinical context rules
  Object.values(CLINICAL_CONTEXT_RULES).forEach(rule => {
    const matched = rule.keywords.some(k => impText.includes(k));
    if (matched) {
      if (rule.requiredLabs) requiredLabs.push(...rule.requiredLabs);
      if (rule.hints) hints.push(...rule.hints);
      if (rule.medicationRules) medRules.push(...rule.medicationRules);
      if (rule.labInterpretation) Object.assign(labInterpretation, rule.labInterpretation);
    }
  });

  // Always add paediatric rules if child
  if (isPaediatric) {
    const pr = CLINICAL_CONTEXT_RULES.paediatric;
    pr.requiredLabs.forEach(l => { if (!requiredLabs.find(r=>r.name===l.name)) requiredLabs.push(l); });
    medRules.push(...pr.medicationRules);
    hints.push(...pr.hints);
    if (isNeonate) hints.push("NEONATE: GBS prophylaxis, vitamin K, Hep B vaccine, jaundice monitoring (Kramer zones / bilirubin levels).");
  }

  if (isObstetric) {
    const or = CLINICAL_CONTEXT_RULES.obstetric;
    or.requiredLabs.forEach(l => { if (!requiredLabs.find(r=>r.name===l.name)) requiredLabs.push(l); });
    hints.push(...or.hints);
  }

  if (isPostOp) {
    const por = CLINICAL_CONTEXT_RULES.postOperative;
    por.requiredLabs.forEach(l => { if (!requiredLabs.find(r=>r.name===l.name)) requiredLabs.push(l); });
    hints.push(...por.hints);
  }

  return { hints: [...new Set(hints)], requiredLabs, medRules, labInterpretation };
}