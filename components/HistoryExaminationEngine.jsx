// ═══════════════════════════════════════════════════════════════════════════
// AMEXAN — COMPREHENSIVE CLINICAL HISTORY & EXAMINATION ENGINE v5.0
// FULLY SCROLLABLE — NO SIDEBAR — ALL DEPARTMENTS
// Features: Department‑aware dynamic sections · Editable biodata · Auto‑detect
//           All specialty forms (IMED, PEDS, NEO, OBGYN, SURG, ORTHO, PSYCH)
// ═══════════════════════════════════════════════════════════════════════════
"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AMEXANPDFGenerator from "@/components/AMEXANPDFGenerator";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const DS = {
  navy: "#07111c", navyMid: "#0c1e2d", navyCard: "#0f2236",
  navyDeep: "#091828", navyBorder: "#1a3549",
  teal: "#0ed2c0", tealDim: "rgba(14,210,192,0.10)", tealBorder: "rgba(14,210,192,0.3)",
  red: "#f05252", redDim: "rgba(240,82,82,0.13)",
  green: "#22d36f", greenDim: "rgba(34,211,111,0.12)",
  amber: "#f6c231", amberDim: "rgba(246,194,49,0.12)",
  blue: "#4da6ff", blueDim: "rgba(77,166,255,0.12)",
  purple: "#a78bfa", purpleDim: "rgba(167,139,250,0.12)",
  white: "#e8f2fa", silver: "#b0c6d8", muted: "#6a8499",
  fontMono: "'DM Mono','Fira Code',monospace",
  fontBody: "'DM Sans','Segoe UI',system-ui,sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// CLINICAL DATA DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { id: "imed", label: "Internal Medicine", short: "IMED", icon: "🫀" },
  { id: "peds", label: "Pediatrics", short: "PEDS", icon: "👶" },
  { id: "neo", label: "Neonatology", short: "NEON", icon: "🍼" },
  { id: "obgyn", label: "Obstetrics & Gynecology", short: "OBGYN", icon: "🌸" },
  { id: "surg", label: "Surgery", short: "SURG", icon: "🔪" },
  { id: "psych", label: "Psychiatry", short: "PSYCH", icon: "🧠" },
  { id: "ortho", label: "Orthopedics", short: "ORTHO", icon: "🦴" },
];

const ROS_SYSTEMS_FULL = [
  {
    id: "general",
    label: "General",
    symptoms: ["Fever", "Chills", "Night sweats", "Weight loss/gain", "Fatigue", "Malaise", "Appetite changes"]
  },
  {
    id: "skin",
    label: "Skin",
    symptoms: ["Rash", "Itching (pruritus)", "Ulcers", "Pigmentation changes", "Hair loss", "Nail changes", "Easy bruising"]
  },
  {
    id: "heent",
    label: "HEENT",
    symptoms: [
      "Headache", "Head trauma",
      "Vision loss/blurring", "Diplopia", "Eye pain", "Redness", "Discharge", "Photophobia",
      "Hearing loss", "Tinnitus", "Ear pain", "Ear discharge",
      "Nasal congestion", "Rhinorrhea", "Epistaxis", "Sinus pain",
      "Sore throat", "Dysphagia", "Odynophagia", "Hoarseness"
    ]
  },
  {
    id: "cvs",
    label: "Cardiovascular",
    symptoms: ["Chest pain", "Palpitations", "Orthopnea", "Paroxysmal nocturnal dyspnea", "Edema", "Syncope"]
  },
  {
    id: "resp",
    label: "Respiratory",
    symptoms: ["Cough", "Sputum", "Hemoptysis", "Dyspnea (rest/exertion)", "Wheeze", "Chest tightness"]
  },
  {
    id: "gi",
    label: "Gastrointestinal",
    symptoms: ["Nausea/vomiting", "Abdominal pain", "Diarrhea", "Constipation", "Hematemesis", "Melena/hematochezia", "Jaundice", "Abdominal distension"]
  },
  {
    id: "gu",
    label: "Genitourinary",
    symptoms: ["Dysuria", "Frequency", "Urgency", "Hematuria", "Incontinence", "Flank pain", "Erectile dysfunction (male)", "Testicular pain (male)", "Vaginal discharge (female)", "Abnormal bleeding (female)", "Menstrual changes (female)"]
  },
  {
    id: "msk",
    label: "Musculoskeletal",
    symptoms: ["Joint pain", "Swelling", "Stiffness", "Back pain", "Muscle pain", "Deformities"]
  },
  {
    id: "neuro",
    label: "Neurological",
    symptoms: ["Headache", "Seizures", "Weakness", "Numbness", "Dizziness", "Syncope", "Gait disturbance"]
  },
  {
    id: "psych",
    label: "Psychiatric",
    symptoms: ["Depression", "Anxiety", "Hallucinations", "Delusions", "Sleep disturbance", "Suicidal ideation"]
  },
  {
    id: "endocrine",
    label: "Endocrine",
    symptoms: ["Polyuria", "Polydipsia", "Heat/cold intolerance", "Weight changes"]
  },
  {
    id: "hematologic",
    label: "Hematologic",
    symptoms: ["Easy bruising", "Bleeding", "Lymphadenopathy"]
  },
  {
    id: "immune",
    label: "Allergic/Immunologic",
    symptoms: ["Allergies", "Recurrent infections"]
  }
];
const SYSTEMIC_EXAM = [
  { id: "cvs", label: "Cardiovascular System", ippa: ["Inspection","Palpation","Percussion","Auscultation"], extras: ["JVP","Apex Beat","Heart Sounds","Murmurs","Peripheral Pulses"] },
  { id: "resp", label: "Respiratory System", ippa: ["Inspection","Palpation","Percussion","Auscultation"], extras: ["Chest Shape","Expansion","Vocal Resonance","Added Sounds"] },
  { id: "git", label: "Abdomen / GIT", ippa: ["Inspection","Palpation","Percussion","Auscultation"], extras: ["Organomegaly","Tenderness Site","DRE (if indicated)","Hernial Orifices"] },
  { id: "cns", label: "CNS / Neurological", ippa: ["Inspection","Tone","Power","Reflexes"], extras: ["Sensation","Coordination","Cranial Nerves","Meningism"] },
  { id: "msk_e", label: "Musculoskeletal", ippa: ["Inspection","Palpation","Range of Motion","Special Tests"], extras: ["Joints Examined","Deformity","Swelling"] },
];

const MSE_DOMAINS = [
  { id: "appearance", label: "Appearance & Behaviour", placeholder: "Dress, grooming, eye contact, rapport, psychomotor activity…" },
  { id: "speech", label: "Speech", placeholder: "Rate, volume, tone, fluency, spontaneity, dysarthria…" },
  { id: "mood", label: "Mood (Subjective)", placeholder: 'In their own words – "How do you feel inside?"…' },
  { id: "affect", label: "Affect (Objective)", placeholder: "Range, reactivity, appropriateness, lability, dysphoric…" },
  { id: "thought_form", label: "Thought Form", placeholder: "Logical, goal-directed; OR tangential, circumstantial, flight of ideas…" },
  { id: "thought_content", label: "Thought Content", placeholder: "Themes of hopelessness, suicidal/homicidal ideation, delusions…" },
  { id: "perception", label: "Perceptual Disturbances", placeholder: "Hallucinations, illusions, depersonalization, derealization…" },
  { id: "cognition", label: "Cognition", placeholder: "Orientation, attention, memory, abstract reasoning…" },
  { id: "insight", label: "Insight", placeholder: "Grade 1-6: unaware → aware and accepts treatment…" },
  { id: "judgment", label: "Judgment", placeholder: "Social judgment, decision-making capacity…" },
];

const DEPT_SECTIONS = {
  imed: [
    { id:"biodata", nav:"Patient Biodata", icon:"🪪", required:true },
    { id:"cc", nav:"Chief Complaint", icon:"💢", required:true },
    { id:"hpi", nav:"HPI", icon:"📖" },
    { id:"pmh", nav:"Past Medical Hx", icon:"📋" },
    { id:"psh", nav:"Past Surgical Hx", icon:"🔪" },
    { id:"drugs", nav:"Drugs & Allergies", icon:"💊" },
    { id:"family", nav:"Family History", icon:"👨‍👩‍👧" },
    { id:"social", nav:"Social History", icon:"🏠" },
    { id:"ros", nav:"Review of Systems", icon:"🔄" },
    { id:"sumhist", nav:"History Summary", icon:"📝" },
    { id:"genexam", nav:"General Exam", icon:"📏", section:"exam" },
    { id:"systemic", nav:"Systemic Exam", icon:"🩺", section:"exam" },
    { id:"assessment", nav:"Assessment", icon:"🎯", section:"assess" },
    { id:"plan", nav:"Management Plan", icon:"⚙️", section:"assess" },
  ],
  peds: [
    { id:"biodata", nav:"Patient Biodata", icon:"🪪", required:true },
    { id:"cc", nav:"Chief Complaint", icon:"💢", required:true },
    { id:"hpi", nav:"HPI", icon:"📖" },
    { id:"birth", nav:"Birth & Perinatal Hx", icon:"🐣" },
    { id:"devlp", nav:"Development & Nutrition", icon:"📈" },
    { id:"pmh", nav:"Past Medical/Surgical", icon:"📋" },
    { id:"drugs", nav:"Drugs & Allergies", icon:"💊" },
    { id:"family", nav:"Family History", icon:"👨‍👩‍👧" },
    { id:"social", nav:"Social/Env History", icon:"🏠" },
    { id:"ros", nav:"Review of Systems", icon:"🔄" },
    { id:"sumhist", nav:"History Summary", icon:"📝" },
    { id:"genexam", nav:"General Exam", icon:"📏", section:"exam" },
    { id:"systemic", nav:"Systemic Exam", icon:"🩺", section:"exam" },
    { id:"assessment", nav:"Assessment", icon:"🎯", section:"assess" },
    { id:"plan", nav:"Management Plan", icon:"⚙️", section:"assess" },
  ],
  neo: [
    { id:"biodata", nav:"Neonate Biodata", icon:"🪪", required:true },
    { id:"cc", nav:"Chief Complaint", icon:"💢", required:true },
    { id:"maternal", nav:"Maternal/Antenatal Hx", icon:"🤱" },
    { id:"labour", nav:"Labour & Delivery", icon:"🏥" },
    { id:"neonatal", nav:"Neonatal Course", icon:"🍼" },
    { id:"family", nav:"Family History", icon:"👨‍👩‍👧" },
    { id:"sumhist", nav:"History Summary", icon:"📝" },
    { id:"genexam", nav:"General Exam", icon:"📏", section:"exam" },
    { id:"systemic", nav:"Systemic Exam", icon:"🩺", section:"exam" },
    { id:"assessment", nav:"Assessment", icon:"🎯", section:"assess" },
    { id:"plan", nav:"Management Plan", icon:"⚙️", section:"assess" },
  ],
  obgyn: [
    { id:"biodata", nav:"Patient Biodata", icon:"🪪", required:true },
    { id:"obgyn_tab", nav:"Consultation Mode", icon:"🌸" },
    { id:"cc", nav:"Chief Complaint", icon:"💢", required:true },
    { id:"hpi", nav:"HPI", icon:"📖" },
    { id:"obstetric", nav:"Obstetric History", icon:"🤰" },
      { id:"menstrual", nav:"Menstrual History", icon:"🗓" },
    { id:"gynhx", nav:"Gynaecological Hx", icon:"🔬" },
    { id:"pmh", nav:"Past Medical/Surgical", icon:"📋" },
    { id:"drugs", nav:"Drugs & Allergies", icon:"💊" },
    { id:"family", nav:"Family History", icon:"👨‍👩‍👧" },
    { id:"social", nav:"Social History", icon:"🏠" },
    { id:"ros", nav:"Review of Systems", icon:"🔄" },
    { id:"sumhist", nav:"History Summary", icon:"📝" },
    { id:"genexam", nav:"General Exam", icon:"📏", section:"exam" },
    { id:"abdexam", nav:"Abdominal Exam", icon:"🤰", section:"exam" },
    { id:"pelvic", nav:"Pelvic Examination", icon:"🔬", section:"exam" },
    { id:"assessment", nav:"Assessment", icon:"🎯", section:"assess" },
    { id:"plan", nav:"Management Plan", icon:"⚙️", section:"assess" },
  ],
  surg: [
    { id:"biodata", nav:"Patient Biodata", icon:"🪪", required:true },
    { id:"cc", nav:"Chief Complaint", icon:"💢", required:true },
    { id:"hpi", nav:"HPI", icon:"📖" },
    { id:"pmh", nav:"Past Medical Hx", icon:"📋" },
    { id:"psh", nav:"Past Surgical Hx", icon:"🔪" },
    { id:"drugs", nav:"Drugs & Allergies", icon:"💊" },
    { id:"family", nav:"Family History", icon:"👨‍👩‍👧" },
    { id:"social", nav:"Social History", icon:"🏠" },
    { id:"ros", nav:"Review of Systems", icon:"🔄" },
    { id:"sumhist", nav:"History Summary", icon:"📝" },
    { id:"genexam", nav:"General Exam", icon:"📏", section:"exam" },
    { id:"local", nav:"Local Examination", icon:"🔍", section:"exam" },
    { id:"systemic", nav:"Systemic Exam", icon:"🩺", section:"exam" },
    { id:"assessment", nav:"Assessment", icon:"🎯", section:"assess" },
    { id:"plan", nav:"Management Plan", icon:"⚙️", section:"assess" },
  ],
  psych: [
    { id:"biodata", nav:"Patient Biodata", icon:"🪪", required:true },
    { id:"cc", nav:"Chief Complaint", icon:"💢", required:true },
    { id:"hpi", nav:"HPI", icon:"📖" },
    { id:"past_psych", nav:"Past Psychiatric Hx", icon:"🧠" },
    { id:"pmh", nav:"Past Medical/Surgical", icon:"📋" },
    { id:"substance", nav:"Drug & Substance Use", icon:"🚬" },
    { id:"personal", nav:"Personal History", icon:"👤" },
    { id:"premorbid", nav:"Premorbid Personality", icon:"🧩" },
    { id:"family", nav:"Family History", icon:"👨‍👩‍👧" },
    { id:"sumhist", nav:"History Summary", icon:"📝" },
    { id:"mse", nav:"Mental State Exam", icon:"🔬", section:"exam" },
    { id:"risk", nav:"Risk Assessment", icon:"⚠️", section:"exam" },
    { id:"physexam", nav:"Physical Examination", icon:"📏", section:"exam" },
    { id:"assessment", nav:"Diagnosis & Differentials", icon:"🎯", section:"assess" },
    { id:"plan", nav:"Management Plan", icon:"⚙️", section:"assess" },
  ],
  ortho: [
    { id:"biodata", nav:"Patient Biodata", icon:"🪪", required:true },
    { id:"cc", nav:"Chief Complaint", icon:"💢", required:true },
    { id:"hpi", nav:"HPI / Mechanism", icon:"📖" },
    { id:"pmh", nav:"Past Medical Hx", icon:"📋" },
    { id:"psh", nav:"Past Surgical/Ortho Hx", icon:"🔪" },
    { id:"drugs", nav:"Drugs & Allergies", icon:"💊" },
    { id:"family", nav:"Family History", icon:"👨‍👩‍👧" },
    { id:"social", nav:"Social History", icon:"🏠" },
    { id:"ros", nav:"Review of Systems", icon:"🔄" },
    { id:"sumhist", nav:"History Summary", icon:"📝" },
    { id:"genexam", nav:"General Exam", icon:"📏", section:"exam" },
    { id:"local", nav:"Local Exam (Look/Feel/Move)", icon:"🦴", section:"exam" },
    { id:"neurovasc", nav:"Neurovascular Status", icon:"⚡", section:"exam" },
    { id:"systemic", nav:"Systemic Exam", icon:"🩺", section:"exam" },
    { id:"assessment", nav:"Assessment", icon:"🎯", section:"assess" },
    { id:"plan", nav:"Investigations & Plan", icon:"⚙️", section:"assess" },
  ],
};
const EXAM_MODULES = [
  {
    id: "cvs",
    label: "Cardiovascular",
    ippa: ["Inspection", "Palpation", "Percussion", "Auscultation"],
    extras: [
      "JVP (height)",
      "Apex beat (location/character)",
      "Heart sounds (S1/S2, splitting)",
      "Added sounds (S3, S4, clicks)",
      "Murmurs (timing, grade, site, radiation)",
      "Pericardial rub"
    ]
  },
  {
    id: "resp",
    label: "Respiratory",
    ippa: ["Inspection", "Palpation", "Percussion", "Auscultation"],
    extras: [
      "Chest shape (barrel, pectus)",
      "Respiratory rate/pattern",
      "Use of accessory muscles",
      "Tracheal position",
      "Chest expansion (bilateral)",
      "Tactile fremitus",
      "Breath sounds (vesicular/bronchial)",
      "Added sounds (crackles, wheeze, rhonchi, pleural rub)"
    ]
  },
  {
    id: "abdomen",
    label: "Abdominal / GIT",
    ippa: ["Inspection", "Auscultation", "Palpation", "Percussion"],
    extras: [
      "Contour (flat, distended)",
      "Scars / dilated veins",
      "Bowel sounds (present/absent, tinkling)",
      "Bruits (aortic, renal)",
      "Tenderness (light/deep, rebound)",
      "Organomegaly (liver, spleen, kidneys)",
      "Ascites (shifting dullness, fluid thrill)"
    ]
  },
  {
    id: "msk",
    label: "Musculoskeletal",
    ippa: ["Inspection", "Palpation", "Range of Motion", "Special Tests"],
    extras: [
      "Joints examined (list)",
      "Deformities / swelling",
      "Muscle wasting / weakness",
      "Crepitus",
      "Gait analysis"
    ]
  },
  {
    id: "neuro",
    label: "Neurological (Full)",
    ippa: [], // Handled separately
    extras: [],
    isComplex: true
  },
  {
    id: "gu",
    label: "Genitourinary",
    ippa: ["Inspection", "Palpation"],
    extras: [
      "External genitalia (lesions, discharge)",
      "Bladder distension",
      "Kidney ballotment",
      "Digital rectal exam (prostate)",
      "Pelvic exam (female) – speculum/bimanual"
    ]
  },
  {
    id: "endocrine",
    label: "Endocrine",
    ippa: ["Inspection", "Palpation", "Auscultation"],
    extras: [
      "Thyroid (size, nodules, bruit)",
      "Tremor (outstretched hands)",
      "Eye signs (exophthalmos, lid lag)",
      "Skin/hair changes (dryness, acanthosis)"
    ]
  },
  {
    id: "skin",
    label: "Skin",
    ippa: ["Inspection", "Palpation"],
    extras: [
      "Color (pallor, jaundice, cyanosis)",
      "Lesions (type: macule/papule/vesicle/ulcer)",
      "Distribution (localized / generalised)",
      "Temperature (warm/cool)",
      "Turgor (dehydrated/normal)"
    ]
  },
  {
    id: "lymph",
    label: "Lymphatic",
    ippa: ["Inspection", "Palpation"],
    extras: [
      "Cervical nodes (size, tender, mobile)",
      "Axillary nodes",
      "Inguinal nodes",
      "Generalised lymphadenopathy (yes/no)"
    ]
  }
];
// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function calcBMI(w, h) {
  if (!w || !h || parseFloat(h) <= 0) return null;
  return (parseFloat(w) / ((parseFloat(h) / 100) ** 2)).toFixed(1);
}
function bmiClass(bmi) {
  const b = parseFloat(bmi);
  if (b < 18.5) return { bg: DS.blueDim, color: DS.blue, label: "Underweight" };
  if (b < 25) return { bg: DS.greenDim, color: DS.green, label: "Normal weight" };
  if (b < 30) return { bg: DS.amberDim, color: DS.amber, label: "Overweight" };
  return { bg: DS.redDim, color: DS.red, label: b < 35 ? "Obese Class I" : b < 40 ? "Obese Class II" : "Obese Class III" };
}
function bpLabel(bp) {
  if (!bp) return null;
  const sys = parseFloat(bp.split("/")[0]);
  if (!sys) return null;
  if (sys < 90) return { color: DS.blue, label: "Hypotension" };
  if (sys < 120) return { color: DS.green, label: "Normal" };
  if (sys < 140) return { color: DS.amber, label: "Elevated / Stage 1 HTN" };
  if (sys < 160) return { color: DS.red, label: "Stage 2 HTN" };
  return { color: DS.red, label: "Hypertensive urgency/emergency" };
}
function calcEGA(lmpDate) {
  if (!lmpDate) return "";
  const lmp = new Date(lmpDate), now = new Date();
  const days = Math.floor((now - lmp) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Future date";
  return `${Math.floor(days / 7)}+${days % 7} weeks`;
}
function detectDept(age, ageUnit, gender) {
  if (ageUnit === "hours" || (ageUnit === "days" && parseFloat(age) < 28) || (ageUnit === "weeks" && parseFloat(age) < 4)) return "neo";
  const ageYrs = ageUnit === "years" ? parseFloat(age) : ageUnit === "months" ? parseFloat(age) / 12 : ageUnit === "weeks" ? parseFloat(age) / 52 : ageUnit === "days" ? parseFloat(age) / 365 : parseFloat(age) / 8760;
  if (!isNaN(ageYrs)) {
    if (ageUnit !== "years" && ageYrs < 1) return "neo";
    if (ageYrs < 13) return "peds";
    if (gender === "Female" && ageYrs >= 10 && ageYrs <= 55) return "obgyn";
  }
  return "imed";
}
function isSectionDone(id, f) {
  switch (id) {
    case "cc": return (f.cc_list || []).some(c => c.symptom);
    case "hpi": return !!(f.hpi_text || f.socrates_onset_detail);
    case "pmh": return !!(f.pmh_other || Object.keys(f).some(k => k.startsWith("pmh_") && k.endsWith("_yn") && f[k] === "yes"));
    case "psh": return (f.psh_list || []).some(s => s.procedure);
    case "drugs": return (f.med_list || []).some(m => m.drug);
    case "family": return !!(f.fhx_notes || Object.keys(f).some(k => k.startsWith("fhx_") && k.endsWith("_yn") && f[k] === "yes"));
    case "social": return !!(f.soc_smoke || f.soc_alc || f.soc_marital);
    case "ros": return Object.keys(f).some(k => k.startsWith("ros_") && k.endsWith("_positive") && f[k] === "yes");
    case "sumhist": return !!f.sumhist;
    case "genexam":
    case "physexam": return !!(f.vitals?.pulse || f.vitals?.bp || f.vitals?.temp);
    case "systemic": return Object.keys(f).some(k => k.startsWith("sysex_") && f[k]);
    case "assessment": return (f.imp_list || []).some(i => i);
    case "plan": return !!(f.plan_invx_urgent || f.plan_meds || f.plan_bio || f.plan_conservative);
    case "mse": return !!(f.mse_appearance || f.mse_mood);
    case "risk": return !!(f.risk_si || f.risk_overall);
    case "menstrual": return !!(f.gyn_lmp || f.gyn_cycle);
    case "obstetric": return !!(f.obs_grav);
    case "birth": return !!(f.peds_ga || f.peds_mod);
    case "devlp": return !!(f.imm_status || f.peds_feed_method);
    case "maternal": return !!(f.neo_mat_age || f.neo_anc);
    case "labour": return !!(f.neo_ga || f.neo_mod);
    case "neonatal": return !!(f.neo_apgar1 || f.neo_bwt);
    default: return false;
  }
}
// OBSTETRIC HELPER FUNCTIONS
// ==================== FIXED OBSTETRIC HELPER FUNCTIONS ====================
function calculateEDD(lmpStr) {
  if (!lmpStr) return null;
  const lmp = new Date(lmpStr);
  if (isNaN(lmp)) return null;
  // Naegele's rule: LMP + 7 days, - 3 months, + 1 year
  // Safe approach: work in absolute days (LMP + 280 days)
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return edd;
}

function calculateGA(lmpStr) {
  if (!lmpStr) return null;
  const lmp = new Date(lmpStr);
  if (isNaN(lmp)) return null;
  const today = new Date();
  const diffMs = today - lmp;
  if (diffMs < 0) return null; // future date
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return { weeks, days, totalDays };
}

function getTrimester(weeks) {
  if (weeks < 13) return "1st Trimester";
  if (weeks < 28) return "2nd Trimester";
  if (weeks <= 42) return "3rd Trimester";
  return "Post-term";
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS (Primitives)
// ─────────────────────────────────────────────────────────────────────────────
const inputBase = {
  background: DS.navyDeep, border: `1px solid ${DS.navyBorder}`,
  borderRadius: 6, color: DS.white, fontSize: 13,
  padding: "7px 10px", width: "100%", outline: "none",
  fontFamily: DS.fontBody, transition: "border-color .15s", lineHeight: 1.5,
};
function Input({ value, onChange, placeholder, type = "text", disabled, style, step, min, max }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value ?? ""} onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder} disabled={disabled} step={step} min={min} max={max}
      style={{ ...inputBase, borderColor: focused ? DS.teal : DS.navyBorder, opacity: disabled ? 0.5 : 1, ...style }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}
function Textarea({ value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea value={value ?? ""} onChange={e => onChange?.(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ ...inputBase, resize: "vertical", minHeight: 60, borderColor: focused ? DS.teal : DS.navyBorder }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}
function Select({ value, onChange, options, style }) {
  const [focused, setFocused] = useState(false);
  return (
    <select value={value ?? ""} onChange={e => onChange(e.target.value)}
      style={{ ...inputBase, borderColor: focused ? DS.teal : DS.navyBorder, appearance: "none", paddingRight: 26,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236a8499' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center", ...style }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      {options.map(o => typeof o === "string"
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Tgl({ label, active, onClick, color }) {
  const c = color === "amber" ? DS.amber : color === "red" ? DS.red : color === "green" ? DS.green : DS.teal;
  return (
    <button onClick={onClick} style={{
      padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
      fontFamily: DS.fontBody, transition: "all .15s",
      background: active ? c : "transparent", color: active ? (color === "red" ? "#fff" : "#07111c") : DS.silver,
      border: `1px solid ${active ? c : DS.navyBorder}`,
    }}>{label}</button>
  );
}
function TglGroup({ options, value, onChange, color }) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {options.map(o => <Tgl key={o} label={o} active={value === o} onClick={() => onChange(value === o ? "" : o)} color={color} />)}
    </div>
  );
}
function Card({ children, glow, warn, danger }) {
  return (
    <div style={{
      background: danger ? "rgba(240,82,82,0.04)" : warn ? "rgba(246,194,49,0.03)" : DS.navyCard,
      border: `1px solid ${glow ? DS.teal : danger ? "rgba(240,82,82,0.35)" : warn ? DS.amberDim : DS.navyBorder}`,
      borderRadius: 12, padding: "18px 20px", marginBottom: 16,
      boxShadow: glow ? `0 0 0 1px rgba(14,210,192,0.08)` : "none",
    }}>{children}</div>
  );
}
function SectionHeader({ icon, title, sub, badge }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <div>
            <div style={{ fontFamily: DS.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", color: DS.white, letterSpacing: ".5px" }}>
              {title} {badge && <span style={{ background: `rgba(240,82,82,0.13)`, color: DS.red, borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700, border: "1px solid rgba(240,82,82,0.4)", marginLeft: 4 }}>{badge}</span>}
            </div>
            {sub && <div style={{ fontSize: 10, color: DS.muted, marginTop: 3 }}>{sub}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
function FieldLabel({ children, flag }) {
  return (
    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: flag ? DS.amber : DS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".3px" }}>
      {flag && "⚑ "}{children}
    </label>
  );
}
function SubSec({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: DS.teal, margin: "14px 0 8px", textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 6 }}>
      {children}
      <div style={{ flex: 1, height: 1, background: "rgba(14,210,192,0.2)" }} />
    </div>
  );
}
function AlertBox({ type = "teal", icon, children }) {
  const map = { teal: [DS.tealDim, DS.teal, DS.tealBorder], amber: [DS.amberDim, DS.amber, "rgba(246,194,49,0.35)"], red: [DS.redDim, DS.red, "rgba(240,82,82,0.35)"], blue: [DS.blueDim, DS.blue, "rgba(77,166,255,0.35)"] };
  const [bg, fg, br] = map[type] || map.teal;
  return (
    <div style={{ borderRadius: 8, padding: "9px 13px", fontSize: 12, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 8, background: bg, border: `1px solid ${br}`, color: fg }}>
      <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <div>{children}</div>
    </div>
  );
}
function AddBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", border: `1px dashed ${DS.navyBorder}`, borderRadius: 6, color: DS.teal, fontSize: 11, fontWeight: 700, padding: "5px 12px", cursor: "pointer", fontFamily: DS.fontBody, transition: "all .15s", marginTop: 8 }}>
      {children}
    </button>
  );
}
function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0" }}>
      <div style={{ flex: 1, height: 1, background: DS.navyBorder }} />
      {label && <span style={{ fontSize: 9, fontWeight: 700, color: DS.muted }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: DS.navyBorder }} />
    </div>
  );
}
function Grid({ cols = 2, gap = 12, children }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>{children}</div>;
}
function AutoGrid({ min = 175, gap = 10, children }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COMPONENTS (All specialty sections from original AMEXAN)
// ─── BIODATA / CC / HPI ─────────────────────────────────────────────────────
function BiodataSection({ f, sf, name, dob, age, ageUnit, gender, hospitalNum, phone, occupation, autoDept, manualDept, dept, ageYears,
  onNameChange, onDobChange, onAgeChange, onAgeUnitChange, onGenderChange, onSetDept }) {
  return (
    <>
      <Card>
        <SectionHeader icon="🪪" title="Patient Biodata" sub="Editable demographics — saved with clinical record" />
        <AutoGrid min={175} gap={12}>
          <div><FieldLabel>Full Name *</FieldLabel><Input value={name} onChange={onNameChange} placeholder="Patient's full name" /></div>
          <div><FieldLabel>Date of Birth</FieldLabel><Input type="date" value={dob} onChange={onDobChange} /></div>
          <div>
            <FieldLabel>Age</FieldLabel>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Input type="number" min="0" value={age} onChange={onAgeChange} placeholder="e.g. 3" style={{ flex: 1, minWidth: 60 }} />
              <Select value={ageUnit} onChange={onAgeUnitChange} options={["years","months","weeks","days","hours"]} style={{ width: 90 }} />
            </div>
          </div>
          <div>
            <FieldLabel>Gender *</FieldLabel>
            <Select value={gender} onChange={onGenderChange} options={["", "Male", "Female", "Other"]} />
          </div>
          <div><FieldLabel>Blood Group</FieldLabel><Select value={f.bloodGroup||""} onChange={v=>sf("bloodGroup",v)} options={["","A+","A−","B+","B−","O+","O−","AB+","AB−"]} /></div>
          <div><FieldLabel>Hospital / File Number</FieldLabel><Input value={hospitalNum} onChange={v=>sf("hospitalNum",v)} placeholder="e.g. UHID-001234" /></div>
          <div><FieldLabel>Phone / Contact</FieldLabel><Input value={phone} onChange={v=>sf("phone",v)} placeholder="Primary contact number" /></div>
          <div><FieldLabel>Occupation</FieldLabel><Input value={occupation} onChange={v=>sf("occupation",v)} placeholder="Current occupation" /></div>
          <div><FieldLabel>Religion / Ethnicity</FieldLabel><Input value={f.religion_eth||""} onChange={v=>sf("religion_eth",v)} placeholder="Optional" /></div>
          <div><FieldLabel>Residential Address</FieldLabel><Input value={f.address||""} onChange={v=>sf("address",v)} placeholder="Town / area" /></div>
          <div><FieldLabel>Informant *</FieldLabel><Input value={f.informant||""} onChange={v=>sf("informant",v)} placeholder="Self, parent, relative, friend…" /></div>
          <div><FieldLabel>Reliability of History</FieldLabel><Select value={f.reliability||""} onChange={v=>sf("reliability",v)} options={["","Reliable","Fairly reliable","Unreliable","Unable to assess"]} /></div>
        </AutoGrid>
        {ageYears !== null && (
          <AlertBox type="teal" icon="⚡">
            <strong>Auto-detected:</strong> {DEPARTMENTS.find(d=>d.id===autoDept)?.label} based on age{gender ? " & gender" : ""}
            {manualDept && manualDept !== autoDept ? ` — overridden to ${DEPARTMENTS.find(d=>d.id===manualDept)?.label}` : ""}
          </AlertBox>
        )}
      </Card>
      <Card>
        <SectionHeader icon="🏥" title="Department / Specialty" sub="Auto-selected based on demographics — click to override" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {DEPARTMENTS.map(d => {
            const isAuto = d.id === autoDept && !manualDept;
            const isActive = d.id === dept;
            return (
              <button key={d.id} onClick={() => onSetDept(d.id)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                fontSize: 12, fontWeight: 700, fontFamily: DS.fontBody, transition: "all .15s", border: "1px solid",
                background: isActive ? DS.teal : DS.navyDeep, color: isActive ? "#07111c" : DS.silver,
                borderColor: isActive ? DS.teal : DS.navyBorder,
              }}>
                <span style={{ fontSize: 16 }}>{d.icon}</span> {d.label}
                {isAuto && <span style={{ fontSize: 9, background: "rgba(0,0,0,0.2)", padding: "1px 5px", borderRadius: 10 }}>AUTO</span>}
              </button>
            );
          })}
        </div>
      </Card>
    </>
  );
}

function CCSection({ f, sf }) {
  const list = f.cc_list || [{ symptom: "", duration: "" }];
  const update = (i, field, v) => { const l = [...list]; l[i][field] = v; sf("cc_list", l); };
  const add = () => sf("cc_list", [...list, { symptom: "", duration: "" }]);
  const remove = i => sf("cc_list", list.filter((_, idx) => idx !== i));
  return (
    <Card glow>
      <SectionHeader icon="💢" title="Chief Complaint(s)" badge="Required" sub="State each symptom and its duration" />
      {list.map((cc, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: DS.muted }}>{i + 1}.</span>
          <Input value={cc.symptom} onChange={v => update(i, "symptom", v)} placeholder="Symptom / complaint" style={{ flex: 3 }} />
          <Input value={cc.duration} onChange={v => update(i, "duration", v)} placeholder="Duration (e.g. 3 days)" style={{ flex: 2 }} />
          {list.length > 1 && <button onClick={() => remove(i)} style={{ background: DS.redDim, border: `1px solid rgba(240,82,82,0.3)`, borderRadius: 6, color: DS.red, width: 26, height: 26, cursor: "pointer" }}>✕</button>}
        </div>
      ))}
      <AddBtn onClick={add}>+ Add Complaint</AddBtn>
    </Card>
  );
}

function HPISection({ f, sf, deptId }) {
  const sk = k => `socrates_${k}`;
  const isSurg = deptId === "surg", isOrtho = deptId === "ortho", isPsych = deptId === "psych";
  const charOpts = ["Sharp","Dull","Burning","Throbbing","Colicky","Pressure","Cramping","Stabbing"];
  const timingOpts = ["Constant","Intermittent","Episodic","Progressive","Worsening","Improving"];
  return (
    <Card>
      <SectionHeader icon="📖" title="History of Presenting Illness" sub="Use SOCRATES framework + system-specific elaboration" />
      <SubSec>SOCRATES Framework</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Site / Location</FieldLabel><Input value={f[sk("site")]||""} onChange={v=>sf(sk("site"),v)} placeholder="Where is the symptom? Does it move?" /></div>
        <div>
          <FieldLabel>Onset</FieldLabel>
          <TglGroup options={["Sudden","Gradual","Insidious"]} value={f[sk("onset_type")]||""} onChange={v=>sf(sk("onset_type"),v)} />
          <Input value={f[sk("onset_detail")]||""} onChange={v=>sf(sk("onset_detail"),v)} placeholder="What were you doing when it started?" style={{ marginTop: 6 }} />
        </div>
        <div>
          <FieldLabel>Character / Quality</FieldLabel>
          <div style={{ marginBottom: 6 }}><TglGroup options={charOpts} value={f[sk("char")]||""} onChange={v=>sf(sk("char"),v)} /></div>
          <Input value={f[sk("char_other")]||""} onChange={v=>sf(sk("char_other"),v)} placeholder="Other description…" />
        </div>
        <div><FieldLabel>Radiation / Spread</FieldLabel><Input value={f[sk("radiation")]||""} onChange={v=>sf(sk("radiation"),v)} placeholder="Does it radiate anywhere?" /></div>
        <div><FieldLabel flag>Associated Symptoms</FieldLabel><Textarea value={f[sk("associated")]||""} onChange={v=>sf(sk("associated"),v)} rows={2} placeholder="Fever, vomiting, diarrhoea, weight loss, night sweats…" /></div>
        <div>
          <FieldLabel>Timing / Pattern</FieldLabel>
          <div style={{ marginBottom: 5 }}><TglGroup options={timingOpts} value={f[sk("timing")]||""} onChange={v=>sf(sk("timing"),v)} /></div>
          <Input value={f[sk("timing_detail")]||""} onChange={v=>sf(sk("timing_detail"),v)} placeholder="How long does each episode last?" />
        </div>
        <div><FieldLabel>Exacerbating Factors</FieldLabel><Input value={f[sk("exacerb")]||""} onChange={v=>sf(sk("exacerb"),v)} placeholder="What makes it worse?" /></div>
        <div><FieldLabel>Relieving Factors</FieldLabel><Input value={f[sk("relieve")]||""} onChange={v=>sf(sk("relieve"),v)} placeholder="What makes it better?" /></div>
        <div>
          <FieldLabel>Severity (Pain Scale 0–10)</FieldLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 10, color: DS.muted }}>0</span>
            <input type="range" min="0" max="10" value={f[sk("severity")]??5} onChange={e=>sf(sk("severity"),e.target.value)} style={{ flex: 1, accentColor: DS.teal }} />
            <span style={{ fontSize: 10, color: DS.muted }}>10</span>
            <span style={{ fontFamily: DS.fontMono, fontSize: 15, fontWeight: 500, color: DS.teal, minWidth: 24 }}>{f[sk("severity")]??5}</span>
          </div>
        </div>
      </AutoGrid>
      {isSurg && <>
        <SubSec>Surgical Context</SubSec>
        <AutoGrid min={220} gap={12}>
          <div><FieldLabel flag>Obstruction Symptoms</FieldLabel><Textarea value={f.hpi_obstruction||""} onChange={v=>sf("hpi_obstruction",v)} rows={2} placeholder="Absolute constipation, distension, vomiting…" /></div>
          <div><FieldLabel flag>Peritonism Signs</FieldLabel><Textarea value={f.hpi_peritonism||""} onChange={v=>sf("hpi_peritonism",v)} rows={2} placeholder="Rebound tenderness, guarding, rigidity, fever…" /></div>
          <div><FieldLabel>Surgical History of Symptom</FieldLabel><Textarea value={f.hpi_surgprev||""} onChange={v=>sf("hpi_surgprev",v)} rows={2} placeholder="Has this happened before?" /></div>
          <div><FieldLabel>Bleeding / Wound Details</FieldLabel><Textarea value={f.hpi_bleed||""} onChange={v=>sf("hpi_bleed",v)} rows={2} placeholder="Amount, colour, duration…" /></div>
        </AutoGrid>
      </>}
      {isOrtho && <>
        <SubSec>Mechanism & Functional Impact</SubSec>
        <AutoGrid min={220} gap={12}>
          <div><FieldLabel flag>Mechanism of Injury</FieldLabel><Textarea value={f.hpi_mechanism||""} onChange={v=>sf("hpi_mechanism",v)} rows={2} placeholder="How did the injury occur? Force direction, speed…" /></div>
          <div><FieldLabel>Functional Limitation</FieldLabel><Textarea value={f.hpi_function||""} onChange={v=>sf("hpi_function",v)} rows={2} placeholder="Weight bearing status, range of motion, ADLs…" /></div>
          <div>
            <FieldLabel>Swelling / Deformity</FieldLabel>
            <TglGroup options={["Swelling","Deformity","Bruising","Locking","Clicking","Giving Way"]} value={f.hpi_ortho_sym||""} onChange={v=>sf("hpi_ortho_sym",v)} />
          </div>
          <div><FieldLabel>Neurovascular Symptoms</FieldLabel><Textarea value={f.hpi_neuro||""} onChange={v=>sf("hpi_neuro",v)} rows={2} placeholder="Paraesthesia, numbness, weakness distal to injury…" /></div>
        </AutoGrid>
      </>}
      {isPsych && <>
        <SubSec>Psychiatric Context</SubSec>
        <AutoGrid min={220} gap={12}>
          <div><FieldLabel>Nature of Symptoms</FieldLabel><Textarea value={f.hpi_psych_nature||""} onChange={v=>sf("hpi_psych_nature",v)} rows={2} placeholder="Mood, psychotic, anxiety, dissociative…" /></div>
          <div><FieldLabel>Precipitating Factors</FieldLabel><Textarea value={f.hpi_psych_precip||""} onChange={v=>sf("hpi_psych_precip",v)} rows={2} placeholder="Stressful life events, losses, trauma…" /></div>
          <div>
            <FieldLabel>Course of Illness</FieldLabel>
            <TglGroup options={["Episodic","Chronic","Progressive","Fluctuating","First episode"]} value={f.hpi_psych_course||""} onChange={v=>sf("hpi_psych_course",v)} />
          </div>
          <div><FieldLabel>Impact on Functioning</FieldLabel><Textarea value={f.hpi_psych_impact||""} onChange={v=>sf("hpi_psych_impact",v)} rows={2} placeholder="Work, school, relationships, self-care…" /></div>
        </AutoGrid>
      </>}
      <Divider label="Additional Narrative" />
      <Textarea value={f.hpi_text||""} onChange={v=>sf("hpi_text",v)} rows={5} placeholder="Full HPI narrative — onset, progression, associated symptoms, severity, treatment tried, timeline…" />
      <div style={{ marginTop: 10 }}>
        <FieldLabel>Treatment Tried Before This Visit</FieldLabel>
        <Textarea value={f.hpi_prev_tx||""} onChange={v=>sf("hpi_prev_tx",v)} rows={2} placeholder="Self-medication, previous consultations, prescriptions — include response to treatment…" />
      </div>
    </Card>
  );
}

// ── PAST MEDICAL HISTORY ──────────────────────────────────────
function PMHSection({ f, sf }) {
  const conditions = [
    {id:"htn",label:"Hypertension"},{id:"dm",label:"Diabetes Mellitus"},{id:"asthma",label:"Asthma"},
    {id:"tb",label:"Tuberculosis"},{id:"hiv",label:"HIV/AIDS"},{id:"sickle",label:"Sickle Cell Disease"},
    {id:"cardiac",label:"Cardiac Disease"},{id:"renal",label:"Renal Disease"},{id:"hepatic",label:"Liver Disease"},
    {id:"malignancy",label:"Malignancy"},{id:"thyroid",label:"Thyroid Disease"},{id:"epilepsy",label:"Epilepsy"},
    {id:"peptic",label:"Peptic Ulcer Disease"},{id:"rheum",label:"Rheumatological Conditions"},{id:"covid",label:"COVID-19"},
  ];
  return (
    <Card>
      <SectionHeader icon="📋" title="Past Medical History" sub="Tick each applicable condition and add details" />
      <AutoGrid min={175} gap={10} style={{ marginBottom: 14 }}>
        {conditions.map(c => {
          const checked = f[`pmh_${c.id}_yn`] === "yes";
          return (
            <div key={c.id} style={{ background: checked ? "rgba(14,210,192,0.06)" : DS.navyDeep, border: `1px solid ${checked ? "rgba(14,210,192,0.25)" : DS.navyBorder}`, borderRadius: 8, padding: "8px 10px", transition: "all .15s" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: checked ? DS.teal : DS.silver }}>
                <input type="checkbox" checked={checked} onChange={e => sf(`pmh_${c.id}_yn`, e.target.checked ? "yes" : "")} style={{ width: "auto", accentColor: DS.teal }} />
                {c.label}
              </label>
              {checked && <Input value={f[`pmh_${c.id}_detail`]||""} onChange={v=>sf(`pmh_${c.id}_detail`,v)} placeholder="Year, severity, medications…" style={{ marginTop: 6, fontSize: 12 }} />}
            </div>
          );
        })}
      </AutoGrid>
      <FieldLabel>Other Medical Conditions / Notes</FieldLabel>
      <Textarea value={f.pmh_other||""} onChange={v=>sf("pmh_other",v)} rows={3} placeholder="Any other significant medical conditions…" />
      <div style={{ marginTop: 10 }}>
        <FieldLabel>Blood Transfusion History</FieldLabel>
        <TglGroup options={["Yes","No","Unknown"]} value={f.pmh_transfusion||""} onChange={v=>sf("pmh_transfusion",v)} />
        {f.pmh_transfusion === "Yes" && <Input value={f.pmh_transfusion_detail||""} onChange={v=>sf("pmh_transfusion_detail",v)} placeholder="When, how many units, reason, reaction…" style={{ marginTop: 6 }} />}
      </div>
      <div style={{ marginTop: 10 }}>
        <FieldLabel>Previous Hospitalisations</FieldLabel>
        <Textarea value={f.pmh_hosp||""} onChange={v=>sf("pmh_hosp",v)} rows={2} placeholder="Dates, reasons, hospitals, outcomes…" />
      </div>
    </Card>
  );
}

// ── PAST SURGICAL HISTORY ─────────────────────────────────────
function PSHSection({ f, sf }) {
  const list = f.psh_list || [{ procedure: "", date: "", hospital: "", complication: "" }];
  const update = (i, field, v) => { const l = [...list]; l[i][field] = v; sf("psh_list", l); };
  const add = () => sf("psh_list", [...list, { procedure: "", date: "", hospital: "", complication: "" }]);
  const remove = i => sf("psh_list", list.filter((_, idx) => idx !== i));
  return (
    <Card>
      <SectionHeader icon="🔪" title="Past Surgical History" sub="List all previous operations and procedures" />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Procedure / Operation","Date / Year","Hospital / Facility","Complications"].map(h =>
            <th key={h} style={{ textAlign:"left", fontSize:10, fontWeight:700, color:DS.muted, textTransform:"uppercase", padding:"0 8px 8px 0", borderBottom:`1px solid ${DS.navyBorder}` }}>{h}</th>)}
            <th></th></tr></thead>
          <tbody>{list.map((s, i) => (
            <tr key={i}>
              <td style={{ padding:"4px 8px 4px 0" }}><Input value={s.procedure} onChange={v=>update(i,"procedure",v)} placeholder="e.g. Appendectomy" /></td>
              <td style={{ padding:"4px 8px" }}><Input value={s.date} onChange={v=>update(i,"date",v)} placeholder="2019" style={{ width: 80 }} /></td>
              <td style={{ padding:"4px 8px" }}><Input value={s.hospital} onChange={v=>update(i,"hospital",v)} placeholder="Hospital name" /></td>
              <td style={{ padding:"4px 8px" }}><Input value={s.complication} onChange={v=>update(i,"complication",v)} placeholder="None / specify" /></td>
              <td style={{ padding:"4px 0 4px 8px" }}>{list.length > 1 && <button onClick={()=>remove(i)} style={{ background:DS.redDim, border:`1px solid rgba(240,82,82,0.3)`, borderRadius:6, color:DS.red, width:26, height:26, cursor:"pointer" }}>✕</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <AddBtn onClick={add}>+ Add Operation</AddBtn>
      <div style={{ marginTop: 12 }}>
        <FieldLabel>Anaesthetic Issues / Complications</FieldLabel>
        <Input value={f.psh_anaesth||""} onChange={v=>sf("psh_anaesth",v)} placeholder="Difficult intubation, malignant hyperthermia…" />
      </div>
    </Card>
  );
}

// ── DRUGS & ALLERGIES ────────────────────────────────────────
function DrugsSection({ f, sf }) {
  const meds = f.med_list || [{ drug:"", dose:"", freq:"", route:"", duration:"" }];
  const allergies = f.allergy_list || [{ allergen:"", type:"", reaction:"", severity:"" }];
  const updateMed = (i,k,v) => { const l=[...meds]; l[i][k]=v; sf("med_list",l); };
  const addMed = () => sf("med_list",[...meds,{drug:"",dose:"",freq:"",route:"",duration:""}]);
  const removeMed = i => sf("med_list",meds.filter((_,idx)=>idx!==i));
  const updateAl = (i,k,v) => { const l=[...allergies]; l[i][k]=v; sf("allergy_list",l); };
  const addAl = () => sf("allergy_list",[...allergies,{allergen:"",type:"",reaction:"",severity:""}]);
  const removeAl = i => sf("allergy_list",allergies.filter((_,idx)=>idx!==i));
  return (
    <Card>
      <SectionHeader icon="💊" title="Drug History & Allergies" sub="All current medications including OTC, herbal, and supplements" />
      <SubSec>Current Medications</SubSec>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Drug Name","Dose","Frequency","Route","Duration"].map(h =>
                <th key={h} style={{ textAlign:"left", fontSize:10, fontWeight:700, color:DS.muted, textTransform:"uppercase", padding:"0 6px 8px 0", borderBottom:`1px solid ${DS.navyBorder}` }}>{h}</th>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {meds.map((m,i)=>(
              <tr key={i}>
                <td style={{ padding:"4px 6px 4px 0" }}><Input value={m.drug} onChange={v=>updateMed(i,"drug",v)} placeholder="Drug name" /></td>
                <td style={{ padding:"4px 6px" }}><Input value={m.dose} onChange={v=>updateMed(i,"dose",v)} placeholder="e.g. 500mg" style={{ width:90 }} /></td>
                <td style={{ padding:"4px 6px" }}><Input value={m.freq} onChange={v=>updateMed(i,"freq",v)} placeholder="e.g. BD" style={{ width:70 }} /></td>
                <td style={{ padding:"4px 6px" }}><Input value={m.route} onChange={v=>updateMed(i,"route",v)} placeholder="PO/IV" style={{ width:60 }} /></td>
                <td style={{ padding:"4px 6px" }}><Input value={m.duration} onChange={v=>updateMed(i,"duration",v)} placeholder="How long?" style={{ width:80 }} /></td>
                <td style={{ padding:"4px 0 4px 6px" }}>{meds.length>1&&<button onClick={()=>removeMed(i)} style={{ background:DS.redDim, border:`1px solid rgba(240,82,82,0.3)`, borderRadius:6, color:DS.red, width:26, height:26, cursor:"pointer" }}>✕</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddBtn onClick={addMed}>+ Add Medication</AddBtn>
      <SubSec>Allergies & Adverse Reactions</SubSec>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Allergen","Type","Reaction","Severity"].map(h =>
                <th key={h} style={{ textAlign:"left", fontSize:10, fontWeight:700, color:DS.muted, textTransform:"uppercase", padding:"0 6px 8px 0", borderBottom:`1px solid ${DS.navyBorder}` }}>{h}</th>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allergies.map((a,i)=>(
              <tr key={i}>
                <td style={{ padding:"4px 6px 4px 0" }}><Input value={a.allergen} onChange={v=>updateAl(i,"allergen",v)} placeholder="Drug / food / latex…" /></td>
                <td style={{ padding:"4px 6px" }}><Select value={a.type} onChange={v=>updateAl(i,"type",v)} options={["","Drug","Food","Environmental","Latex","Contrast","Other"]} style={{ width:110 }} /></td>
                <td style={{ padding:"4px 6px" }}><Input value={a.reaction} onChange={v=>updateAl(i,"reaction",v)} placeholder="Rash, anaphylaxis…" /></td>
                <td style={{ padding:"4px 6px" }}><Select value={a.severity} onChange={v=>updateAl(i,"severity",v)} options={["","Mild","Moderate","Severe","Anaphylactic"]} style={{ width:110 }} /></td>
                <td style={{ padding:"4px 0 4px 6px" }}>{allergies.length>1&&<button onClick={()=>removeAl(i)} style={{ background:DS.redDim, border:`1px solid rgba(240,82,82,0.3)`, borderRadius:6, color:DS.red, width:26, height:26, cursor:"pointer" }}>✕</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddBtn onClick={addAl}>+ Add Allergy</AddBtn>
      <div style={{ marginTop:10 }}>
        <FieldLabel>Traditional / Herbal Medicines</FieldLabel>
        <Input value={f.med_herbal||""} onChange={v=>sf("med_herbal",v)} placeholder="Specify type, frequency…" />
      </div>
    </Card>
  );
}

// ── FAMILY HISTORY ───────────────────────────────────────────
function FamilySection({ f, sf }) {
  const conditions = ["Hypertension","Diabetes Mellitus","Cardiac Disease","Stroke/CVA","Malignancy","TB","HIV","Sickle Cell Disease","Asthma","Mental Illness","Sudden Death <50yrs","Genetic/Congenital Conditions"];
  return (
    <Card>
      <SectionHeader icon="👨‍👩‍👧" title="Family History" sub="First-degree relatives (parents, siblings, children)" />
      <AutoGrid min={175} gap={10}>
        {conditions.map(c => {
          const k = `fhx_${c.replace(/[^a-z]/gi,"_").toLowerCase()}`;
          const checked = f[k+"_yn"] === "yes";
          return (
            <div key={c} style={{ background: checked?"rgba(240,82,82,0.06)":DS.navyDeep, border:`1px solid ${checked?"rgba(240,82,82,0.25)":DS.navyBorder}`, borderRadius:8, padding:"8px 10px", transition:"all .15s" }}>
              <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:12, fontWeight:600, color:checked?DS.red:DS.silver }}>
                <input type="checkbox" checked={checked} onChange={e=>sf(k+"_yn",e.target.checked?"yes":"")} style={{ width:"auto", accentColor:DS.red }} />
                {c}
              </label>
              {checked && <Input value={f[k+"_detail"]||""} onChange={v=>sf(k+"_detail",v)} placeholder="Who? Relationship…" style={{ marginTop:6, fontSize:12 }} />}
            </div>
          );
        })}
      </AutoGrid>
      <div style={{ marginTop:12 }}>
        <FieldLabel>Consanguinity</FieldLabel>
        <TglGroup options={["Yes","No","Unknown"]} value={f.fhx_consang||""} onChange={v=>sf("fhx_consang",v)} />
        {f.fhx_consang==="Yes" && <Input value={f.fhx_consang_detail||""} onChange={v=>sf("fhx_consang_detail",v)} placeholder="Degree of relation…" style={{ marginTop:6 }} />}
      </div>
      <div style={{ marginTop:10 }}>
        <FieldLabel>Additional Family History Notes</FieldLabel>
        <Textarea value={f.fhx_notes||""} onChange={v=>sf("fhx_notes",v)} rows={2} placeholder="Any other significant family medical history…" />
      </div>
    </Card>
  );
}

// ── SOCIAL HISTORY ────────────────────────────────────────────
function SocialSection({ f, sf, deptId }) {
  const isSurg = deptId === "surg";
  return (
    <Card>
      <SectionHeader icon="🏠" title="Social History" sub="Lifestyle, substance use, occupation, and living circumstances" />
      <AutoGrid min={220} gap={12}>
        <div>
          <FieldLabel flag>Smoking Status</FieldLabel>
          <TglGroup options={["Current smoker","Ex-smoker","Never smoked","Passive smoker"]} value={f.soc_smoke||""} onChange={v=>sf("soc_smoke",v)} />
          {(f.soc_smoke==="Current smoker"||f.soc_smoke==="Ex-smoker") && (
            <Grid cols={2} gap={8} style={{ marginTop:6 }}>
              <div><FieldLabel>Type</FieldLabel><Input value={f.soc_smoke_type||""} onChange={v=>sf("soc_smoke_type",v)} placeholder="Cigarettes, pipe…" /></div>
              <div><FieldLabel>Pack-years</FieldLabel><Input type="number" value={f.soc_smoke_packyrs||""} onChange={v=>sf("soc_smoke_packyrs",v)} placeholder="e.g. 10" /></div>
            </Grid>
          )}
        </div>
        <div>
          <FieldLabel flag>Alcohol Use</FieldLabel>
          <TglGroup options={["None","Social/Occasional","Regular","Heavy/Dependent","Ex-drinker"]} value={f.soc_alc||""} onChange={v=>sf("soc_alc",v)} />
          {f.soc_alc && f.soc_alc!=="None" && (
            <Grid cols={2} gap={8} style={{ marginTop:6 }}>
              <div><FieldLabel>Type / Brand</FieldLabel><Input value={f.soc_alc_type||""} onChange={v=>sf("soc_alc_type",v)} placeholder="Beer, spirits…" /></div>
              <div><FieldLabel>Units / Week</FieldLabel><Input type="number" value={f.soc_alc_units||""} onChange={v=>sf("soc_alc_units",v)} placeholder="Approx. units" /></div>
            </Grid>
          )}
        </div>
        <div>
          <FieldLabel>Recreational Drug Use</FieldLabel>
          <TglGroup options={["None","Cannabis","Opioids","Stimulants","Inhalants","Multiple"]} value={f.soc_rec_drug||""} onChange={v=>sf("soc_rec_drug",v)} />
          {f.soc_rec_drug && f.soc_rec_drug!=="None" && <Input value={f.soc_rec_drug_detail||""} onChange={v=>sf("soc_rec_drug_detail",v)} placeholder="Frequency, route, duration…" style={{ marginTop:5 }} />}
        </div>
        <div><FieldLabel>Marital Status</FieldLabel><TglGroup options={["Single","Married","Divorced","Widowed","Cohabiting"]} value={f.soc_marital||""} onChange={v=>sf("soc_marital",v)} /></div>
        <div><FieldLabel>Living Situation</FieldLabel><Input value={f.soc_living||""} onChange={v=>sf("soc_living",v)} placeholder="Lives alone, with family, hostel…" /></div>
        <div><FieldLabel>Highest Level of Education</FieldLabel><Select value={f.soc_edu||""} onChange={v=>sf("soc_edu",v)} options={["","None","Primary","Secondary","Tertiary/University","Post-graduate"]} /></div>
        <div><FieldLabel>Sexual History (if relevant)</FieldLabel><Textarea value={f.soc_sexual||""} onChange={v=>sf("soc_sexual",v)} rows={2} placeholder="Sexually active, number of partners, STI screen, contraception use…" /></div>
        <div>
          <FieldLabel>Domestic Violence / IPV Screening</FieldLabel>
          <TglGroup options={["Not screened","Screened — negative","Screened — positive","Declined to answer"]} value={f.soc_ipv||""} onChange={v=>sf("soc_ipv",v)} />
        </div>
        <div><FieldLabel>Travel History (recent)</FieldLabel><Input value={f.soc_travel||""} onChange={v=>sf("soc_travel",v)} placeholder="Regions visited in past 6 months, malaria risk areas…" /></div>
        <div><FieldLabel>Diet / Nutrition</FieldLabel><Input value={f.soc_diet||""} onChange={v=>sf("soc_diet",v)} placeholder="Balanced, vegetarian, special diet…" /></div>
        {isSurg && <div><FieldLabel>Exercise Tolerance / Functional Status</FieldLabel><Input value={f.soc_exercise||""} onChange={v=>sf("soc_exercise",v)} placeholder="METs, flights of stairs, NYHA class…" /></div>}
      </AutoGrid>
    </Card>
  );
}

// ── REVIEW OF SYSTEMS ─────────────────────────────────────────
function ROSSection({ f, sf }) {
  // Helper to update positive symptoms array for a system
  const toggleSymptom = (sysId, symptom, checked) => {
    const key = `ros_${sysId}_symptoms`;
    const current = f[key] || [];
    const updated = checked
      ? [...current, symptom]
      : current.filter(s => s !== symptom);
    sf(key, updated);
  };

  return (
    <Card>
      <SectionHeader icon="🔄" title="Review of Systems" sub="Mark each system as Unremarkable or document positive findings with specific symptoms" />
      {ROS_SYSTEMS_FULL.map(sys => {
        const positive = f[`ros_${sys.id}_positive`] === "yes";
        const positiveSymptoms = f[`ros_${sys.id}_symptoms`] || [];
        return (
          <div key={sys.id} style={{
            background: positive ? "rgba(14,210,192,0.04)" : DS.navyMid,
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 10,
            border: `1px solid ${positive ? "rgba(14,210,192,0.2)" : "transparent"}`,
            transition: "all .15s"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: positive ? 12 : 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", minWidth: 100, color: DS.silver }}>{sys.label}</span>
              <TglGroup
                options={["Unremarkable", "Positive Finding"]}
                value={positive ? "Positive Finding" : "Unremarkable"}
                onChange={val => sf(`ros_${sys.id}_positive`, val === "Positive Finding" ? "yes" : "no")}
                color={positive ? "amber" : undefined}
              />
            </div>
            {positive && (
              <div style={{ marginTop: 8 }}>
                <AutoGrid min={180} gap={8}>
                  {sys.symptoms.map(symptom => {
                    const checked = positiveSymptoms.includes(symptom);
                    return (
                      <label key={symptom} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => toggleSymptom(sys.id, symptom, e.target.checked)}
                          style={{ accentColor: DS.teal, width: 14, height: 14 }}
                        />
                        <span style={{ color: DS.white }}>{symptom}</span>
                      </label>
                    );
                  })}
                </AutoGrid>
                <FieldLabel style={{ marginTop: 12 }}>Other ROS findings (free text)</FieldLabel>
                <Input
                  value={f[`ros_${sys.id}_notes`] || ""}
                  onChange={v => sf(`ros_${sys.id}_notes`, v)}
                  placeholder="e.g. additional details not listed above…"
                />
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

// ── SUMMARY HISTORY ───────────────────────────────────────────
function SumHistSection({ f, sf }) {
  return (
    <Card glow>
      <SectionHeader icon="📝" title="Summary of History" sub="Integrate key positives and negatives leading to the provisional diagnosis" />
      <Textarea value={f.sumhist||""} onChange={v=>sf("sumhist",v)} rows={5} placeholder="In summary, [patient name] is a [age]/[gender] who presented with [CC] of [duration]. History reveals [key positives]. Notable negatives include [pertinent negatives]. Past history significant for [PMH]. On [medications]…" />
    </Card>
  );
}

// ── GENERAL EXAM ──────────────────────────────────────────────
function GenExamSection({ f, sf, deptId }) {
  const isNeo = deptId==="neo", isPeds = deptId==="peds", isPsych = deptId==="psych";
  const v = f.vitals || {};
  const updateV = (k, val) => {
    const nv = { ...v, [k]: val };
    const bmi = calcBMI(nv.weight, nv.height);
    if (bmi) nv.bmi = bmi;
    sf("vitals", nv);
  };
  const bmi = v.bmi || calcBMI(v.weight, v.height);
  const bmiInfo = bmi ? bmiClass(bmi) : null;
  const alerts = [];
  if (v.spo2 && parseFloat(v.spo2) < 90) alerts.push("⚠ SpO₂ critically low ("+v.spo2+"%) — immediate O₂ therapy required");
  else if (v.spo2 && parseFloat(v.spo2) < 94) alerts.push("SpO₂ low ("+v.spo2+"%) — supplemental oxygen indicated");
  if (v.pulse && parseFloat(v.pulse) > 150) alerts.push("⚠ Extreme tachycardia ("+v.pulse+" bpm)");
  if (v.rr && parseFloat(v.rr) > 30) alerts.push("⚠ Severe tachypnoea (RR "+v.rr+")");
  if (v.temp && parseFloat(v.temp) > 40) alerts.push("⚠ High fever ("+v.temp+"°C) — assess for sepsis");
  if (v.temp && parseFloat(v.temp) < 35) alerts.push("⚠ Hypothermia ("+v.temp+"°C)");
  return (
    <Card>
      <SectionHeader icon="📏" title="General Examination & Vital Signs" sub="Anthropometry and haemodynamic parameters" />
      {alerts.map((a,i) => <AlertBox key={i} type="red" icon="⚠">{a}</AlertBox>)}
      <SubSec>General Appearance</SubSec>
      <AutoGrid min={220} gap={12}>
        <div>
          <FieldLabel>General Appearance</FieldLabel>
          <Select value={v.appearance||""} onChange={val=>updateV("appearance",val)} options={["","Well-looking, comfortable","Ill-looking, in distress","Moderately ill","Acutely ill / toxic / shocked","Cachexic / wasted","Confused / delirious"]} />
        </div>
        <div>
          <FieldLabel>Consciousness / GCS</FieldLabel>
          <TglGroup options={["Alert","Confused","Drowsy","Obtunded","Stuporous","Comatose"]} value={v.consciousness||""} onChange={val=>updateV("consciousness",val)} />
        </div>
        <div><FieldLabel>Pallor</FieldLabel><TglGroup options={["None","Mild","Moderate","Severe","Conjunctival pallor"]} value={v.pallor||""} onChange={val=>updateV("pallor",val)} /></div>
        <div><FieldLabel>Jaundice</FieldLabel><TglGroup options={["None","Mild scleral icterus","Moderate jaundice","Deep jaundice"]} value={v.jaundice||""} onChange={val=>updateV("jaundice",val)} /></div>
        <div><FieldLabel>Cyanosis</FieldLabel><TglGroup options={["None","Peripheral only","Central (tongue/lips)","Both peripheral & central"]} value={v.cyanosis||""} onChange={val=>updateV("cyanosis",val)} /></div>
        <div><FieldLabel>Oedema</FieldLabel><TglGroup options={["None","Pedal (+)","Bilateral leg (++)","Up to knee (+++)","Anasarca (++++)","Facial/periorbital"]} value={v.oedema||""} onChange={val=>updateV("oedema",val)} /></div>
        <div><FieldLabel>Lymphadenopathy</FieldLabel><TglGroup options={["None","Cervical","Axillary","Inguinal","Generalised"]} value={v.lymph||""} onChange={val=>updateV("lymph",val)} /></div>
        <div><FieldLabel>Clubbing</FieldLabel><TglGroup options={["None","Grade I","Grade II","Grade III","Grade IV"]} value={v.clubbing||""} onChange={val=>updateV("clubbing",val)} /></div>
      </AutoGrid>
      <SubSec>Anthropometry</SubSec>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(135px,1fr))", gap:10 }}>
        <div><FieldLabel>Weight (kg)</FieldLabel><Input type="number" step="0.1" value={v.weight||""} onChange={val=>updateV("weight",val)} placeholder="e.g. 70.0" /></div>
        <div><FieldLabel>{isNeo?"Length":"Height"} (cm)</FieldLabel><Input type="number" step="0.1" value={v.height||""} onChange={val=>updateV("height",val)} placeholder="e.g. 170" /></div>
        <div>
          <FieldLabel>BMI (auto)</FieldLabel>
          <Input value={bmi||""} disabled placeholder="Auto-calculated" />
          {bmiInfo && <span style={{ background:bmiInfo.bg, color:bmiInfo.color, fontFamily:DS.fontMono, fontSize:12, padding:"3px 8px", borderRadius:6, display:"inline-block", marginTop:4 }}>{bmiInfo.label}</span>}
        </div>
        <div><FieldLabel>MUAC (cm)</FieldLabel><Input type="number" step="0.1" value={v.muac||""} onChange={val=>updateV("muac",val)} placeholder="Mid-upper arm" /></div>
        {(isPeds||isNeo) && <div><FieldLabel>Head Circumference (cm)</FieldLabel><Input type="number" step="0.1" value={v.hc||""} onChange={val=>updateV("hc",val)} placeholder="OFC measurement" /></div>}
        {isNeo && <div><FieldLabel>Current Weight (g)</FieldLabel><Input type="number" value={v.current_wt||""} onChange={val=>updateV("current_wt",val)} placeholder="Current weight in grams" /></div>}
      </div>
      <SubSec>Vital Signs</SubSec>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(135px,1fr))", gap:10 }}>
        <div>
          <FieldLabel flag>Heart Rate / Pulse (bpm)</FieldLabel>
          <Input type="number" value={v.pulse||""} onChange={val=>updateV("pulse",val)} placeholder="Normal: 60-100" />
          {v.pulse && <span style={{ fontSize:10, color:parseFloat(v.pulse)<60?DS.blue:parseFloat(v.pulse)>100?DS.red:DS.green, marginTop:2, display:"block" }}>{parseFloat(v.pulse)<60?"Bradycardia":parseFloat(v.pulse)>100?"Tachycardia":"Normal range"}</span>}
        </div>
        <div>
          <FieldLabel>Blood Pressure (mmHg)</FieldLabel>
          <Input value={v.bp||""} onChange={val=>updateV("bp",val)} placeholder="e.g. 120/80" />
          {v.bp && bpLabel(v.bp) && <span style={{ fontSize:10, color:bpLabel(v.bp).color, marginTop:2, display:"block" }}>{bpLabel(v.bp).label}</span>}
        </div>
        <div>
          <FieldLabel flag>Respiratory Rate (/min)</FieldLabel>
          <Input type="number" value={v.rr||""} onChange={val=>updateV("rr",val)} placeholder="Normal: 12-20" />
          {v.rr && <span style={{ fontSize:10, color:parseFloat(v.rr)<12?DS.blue:parseFloat(v.rr)>20?DS.red:DS.green, marginTop:2, display:"block" }}>{parseFloat(v.rr)<12?"Bradypnoea":parseFloat(v.rr)>20?"Tachypnoea":"Normal range"}</span>}
        </div>
        <div>
          <FieldLabel flag>SpO₂ (%)</FieldLabel>
          <Input type="number" value={v.spo2||""} onChange={val=>updateV("spo2",val)} placeholder="Normal: ≥95%" />
          {v.spo2 && <span style={{ fontSize:10, color:parseFloat(v.spo2)<90?DS.red:parseFloat(v.spo2)<94?DS.amber:DS.green, marginTop:2, display:"block" }}>{parseFloat(v.spo2)<90?"Critical hypoxia":parseFloat(v.spo2)<94?"Low — needs oxygen":"Normal range"}</span>}
        </div>
        <div>
          <FieldLabel flag>Temperature (°C)</FieldLabel>
          <Input type="number" step="0.1" value={v.temp||""} onChange={val=>updateV("temp",val)} placeholder="Normal: 36.5-37.5" />
          {v.temp && <span style={{ fontSize:10, color:parseFloat(v.temp)<35?DS.blue:parseFloat(v.temp)>38?DS.red:DS.green, marginTop:2, display:"block" }}>{parseFloat(v.temp)<35?"Hypothermia":parseFloat(v.temp)>38?parseFloat(v.temp)>39?"High fever":"Fever":"Normal range"}</span>}
        </div>
        <div><FieldLabel>Oxygen Requirement</FieldLabel><TglGroup options={["Room air","Nasal cannula","Face mask","High-flow","NIV","Intubated/ventilated"]} value={v.o2_req||""} onChange={val=>updateV("o2_req",val)} /></div>
        {isNeo && <>
          <div><FieldLabel>Capillary Refill Time</FieldLabel><TglGroup options={["<2 seconds (normal)",">2 seconds (delayed)"]} value={v.crt||""} onChange={val=>updateV("crt",val)} /></div>
          <div>
            <FieldLabel>Silverman-Anderson Score</FieldLabel>
            <Input type="number" min="0" max="10" value={v.silverman||""} onChange={val=>updateV("silverman",val)} placeholder="0-10" />
            {v.silverman && <span style={{ fontSize:10, color:parseFloat(v.silverman)===0?DS.green:parseFloat(v.silverman)<4?DS.amber:DS.red, marginTop:2, display:"block" }}>{parseFloat(v.silverman)===0?"No distress":parseFloat(v.silverman)<4?"Mild distress":parseFloat(v.silverman)<7?"Moderate distress":"Severe distress"}</span>}
          </div>
        </>}
        <div>
          <FieldLabel>Pain Score (0-10)</FieldLabel>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:10, color:DS.muted }}>0</span>
            <input type="range" min="0" max="10" value={v.pain_score||0} onChange={e=>updateV("pain_score",e.target.value)} style={{ flex:1, accentColor:DS.teal }} />
            <span style={{ fontSize:10, color:DS.muted }}>10</span>
            <span style={{ fontFamily:DS.fontMono, fontSize:15, fontWeight:500, color:DS.teal, minWidth:24 }}>{v.pain_score||0}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── SYSTEMIC EXAM ────────────────────────────────────────────
function SystemicSection({ f, sf }) {
  // Neurological exam sub‑sections (to keep code manageable)
  const renderNeuroExam = () => {
    const neuro = f.neuro_exam || {};
    const setNeuro = (key, val) => sf("neuro_exam", { ...neuro, [key]: val });

    return (
      <div style={{ marginTop: 12 }}>
        <SubSec>Level of Consciousness & Mental Status</SubSec>
        <AutoGrid min={180} gap={10}>
          <div><FieldLabel>GCS (Eye/Verbal/Motor)</FieldLabel><Input value={neuro.gcs||""} onChange={v=>setNeuro("gcs",v)} placeholder="e.g. E4V5M6" /></div>
          <div><FieldLabel>Orientation</FieldLabel><TglGroup options={["Fully oriented","Disoriented to time","Disoriented to place","Disoriented to person"]} value={neuro.orientation||""} onChange={v=>setNeuro("orientation",v)} /></div>
          <div><FieldLabel>Memory (immediate/recent)</FieldLabel><Input value={neuro.memory||""} onChange={v=>setNeuro("memory",v)} placeholder="Intact / impaired – specify" /></div>
          <div><FieldLabel>Speech (fluency/coherence)</FieldLabel><Input value={neuro.speech||""} onChange={v=>setNeuro("speech",v)} placeholder="Normal / dysarthria / aphasia" /></div>
          <div><FieldLabel>Mood & Affect</FieldLabel><Input value={neuro.mood||""} onChange={v=>setNeuro("mood",v)} placeholder="Euthymic, depressed, anxious, flat" /></div>
          <div><FieldLabel>Thought form/content</FieldLabel><Input value={neuro.Thought||""} onChange={v=>setNeuro("thought",v)} placeholder="Logical, goal‑directed / delusions, hallucinations" /></div>
        </AutoGrid>

        <SubSec>Cranial Nerves (I–XII)</SubSec>
        <AutoGrid min={150} gap={10}>
          <div><FieldLabel>CN I (Smell)</FieldLabel><Input value={neuro.cn1||""} onChange={v=>setNeuro("cn1",v)} placeholder="Intact / not tested" /></div>
          <div><FieldLabel>CN II (Vision)</FieldLabel><Input value={neuro.cn2||""} onChange={v=>setNeuro("cn2",v)} placeholder="VA, visual fields, fundoscopy" /></div>
          <div><FieldLabel>CN III,IV,VI (EOM)</FieldLabel><Input value={neuro.cn346||""} onChange={v=>setNeuro("cn346",v)} placeholder="Full / nystagmus / ptosis" /></div>
          <div><FieldLabel>CN V (Facial sensation/mastication)</FieldLabel><Input value={neuro.cn5||""} onChange={v=>setNeuro("cn5",v)} placeholder="Intact / diminished" /></div>
          <div><FieldLabel>CN VII (Facial movement)</FieldLabel><Input value={neuro.cn7||""} onChange={v=>setNeuro("cn7",v)} placeholder="Symmetrical / upper/lower motor neuron" /></div>
          <div><FieldLabel>CN VIII (Hearing)</FieldLabel><Input value={neuro.cn8||""} onChange={v=>setNeuro("cn8",v)} placeholder="Rinne/Weber: normal / conductive / sensorineural" /></div>
          <div><FieldLabel>CN IX,X (Gag, palate)</FieldLabel><Input value={neuro.cn9_10||""} onChange={v=>setNeuro("cn9_10",v)} placeholder="Present / absent / uvula deviates" /></div>
          <div><FieldLabel>CN XI (Shoulder shrug, head turn)</FieldLabel><Input value={neuro.cn11||""} onChange={v=>setNeuro("cn11",v)} placeholder="Full strength / weakness" /></div>
          <div><FieldLabel>CN XII (Tongue movement)</FieldLabel><Input value={neuro.cn12||""} onChange={v=>setNeuro("cn12",v)} placeholder="Protrudes midline / deviates" /></div>
        </AutoGrid>

        <SubSec>Motor System</SubSec>
        <AutoGrid min={180} gap={10}>
          <div><FieldLabel>Muscle bulk & tone (UL/LL)</FieldLabel><Input value={neuro.motor_tone||""} onChange={v=>setNeuro("motor_tone",v)} placeholder="Normal / spastic / rigid / flaccid" /></div>
          <div><FieldLabel>Power (MRC grading)</FieldLabel><Input value={neuro.motor_power||""} onChange={v=>setNeuro("motor_power",v)} placeholder="Proximal/distal, right vs left (e.g. 5/5 all)" /></div>
          <div><FieldLabel>Involuntary movements</FieldLabel><Input value={neuro.involuntary||""} onChange={v=>setNeuro("involuntary",v)} placeholder="None / tremor, chorea, tics" /></div>
        </AutoGrid>

        <SubSec>Reflexes & Plantar Response</SubSec>
        <AutoGrid min={180} gap={10}>
          <div><FieldLabel>Deep tendon reflexes (biceps, triceps, knee, ankle)</FieldLabel><Input value={neuro.dtr||""} onChange={v=>setNeuro("dtr",v)} placeholder="2+ symmetrical / hyperreflexic / hyporeflexic" /></div>
          <div><FieldLabel>Plantar response (Babinski)</FieldLabel><TglGroup options={["Flexor (normal)","Extensor (abnormal)"]} value={neuro.plantar||""} onChange={v=>setNeuro("plantar",v)} /></div>
          <div><FieldLabel>Clonus</FieldLabel><TglGroup options={["None","Sustained","Unsustained"]} value={neuro.clonus||""} onChange={v=>setNeuro("clonus",v)} /></div>
        </AutoGrid>

        <SubSec>Sensory System</SubSec>
        <AutoGrid min={180} gap={10}>
          <div><FieldLabel>Pinprick / temperature</FieldLabel><Input value={neuro.sens_pain||""} onChange={v=>setNeuro("sens_pain",v)} placeholder="Intact / reduced / absent – specify distribution" /></div>
          <div><FieldLabel>Light touch & vibration</FieldLabel><Input value={neuro.sens_touch||""} onChange={v=>setNeuro("sens_touch",v)} placeholder="Normal / impaired – glove & stocking or dermatomal" /></div>
          <div><FieldLabel>Proprioception (joint position)</FieldLabel><Input value={neuro.sens_proprio||""} onChange={v=>setNeuro("sens_proprio",v)} placeholder="Intact / impaired" /></div>
        </AutoGrid>

        <SubSec>Coordination & Gait</SubSec>
        <AutoGrid min={180} gap={10}>
          <div><FieldLabel>Cerebellar tests (finger‑nose, heel‑shin)</FieldLabel><Input value={neuro.cerebellar||""} onChange={v=>setNeuro("cerebellar",v)} placeholder="Normal / dysmetria / intention tremor / dysdiadochokinesia" /></div>
          <div><FieldLabel>Gait</FieldLabel><TglGroup options={["Normal","Antalgic","Ataxic","Parkinsonian","Hemiplegic","Waddling","Scissors"]} value={neuro.gait||""} onChange={v=>setNeuro("gait",v)} /></div>
          <div><FieldLabel>Romberg test</FieldLabel><TglGroup options={["Negative (steady)","Positive (falls)"]} value={neuro.romberg||""} onChange={v=>setNeuro("romberg",v)} /></div>
        </AutoGrid>

        <SubSec>Meningeal Signs</SubSec>
        <AutoGrid min={180} gap={10}>
          <div><FieldLabel>Neck stiffness</FieldLabel><TglGroup options={["None","Mild","Severe"]} value={neuro.neck_stiff||""} onChange={v=>setNeuro("neck_stiff",v)} /></div>
          <div><FieldLabel>Kernig's sign</FieldLabel><TglGroup options={["Negative","Positive"]} value={neuro.kernig||""} onChange={v=>setNeuro("kernig",v)} /></div>
          <div><FieldLabel>Brudzinski's sign</FieldLabel><TglGroup options={["Negative","Positive"]} value={neuro.brudzinski||""} onChange={v=>setNeuro("brudzinski",v)} /></div>
        </AutoGrid>
      </div>
    );
  };

  return (
    <Card>
      <SectionHeader icon="🩺" title="Systemic Examination" sub="IPPA for each major system – document all relevant findings" />
      {EXAM_MODULES.map(mod => {
        if (mod.isComplex && mod.id === "neuro") {
          return (
            <div key={mod.id} style={{ marginBottom: 24 }}>
              <SubSec>{mod.label}</SubSec>
              {renderNeuroExam()}
            </div>
          );
        }
        return (
          <div key={mod.id} style={{ marginBottom: 24 }}>
            <SubSec>{mod.label}</SubSec>
            {mod.ippa.length > 0 && (
              <Grid cols={2} gap={10}>
                {mod.ippa.map(m => {
                  const k = `sysex_${mod.id}_${m.toLowerCase().replace(/\//g,"_").replace(/ /g,"_")}`;
                  return (
                    <div key={m}>
                      <FieldLabel>{m}</FieldLabel>
                      <Textarea value={f[k]||""} onChange={v=>sf(k,v)} rows={2} placeholder={`${m} findings…`} />
                    </div>
                  );
                })}
              </Grid>
            )}
            {mod.extras.length > 0 && (
              <AutoGrid min={175} gap={10} style={{ marginTop: 12 }}>
                {mod.extras.map(extra => {
                  const k = `sysex_${mod.id}_extra_${extra.toLowerCase().replace(/[^a-z]/gi,"_")}`;
                  return (
                    <div key={extra}>
                      <FieldLabel>{extra}</FieldLabel>
                      <Input value={f[k]||""} onChange={v=>sf(k,v)} placeholder="Findings…" />
                    </div>
                  );
                })}
              </AutoGrid>
            )}
          </div>
        );
      })}
      <Divider label="Other / Miscellaneous Findings" />
      <Textarea value={f.sysex_other||""} onChange={v=>sf("sysex_other",v)} rows={2} placeholder="Any additional examination findings not captured above…" />
    </Card>
  );
}

// ── LOCAL EXAM — SURGERY ──────────────────────────────────────
function LocalExamSurgSection({ f, sf }) {
  return (
    <Card glow>
      <SectionHeader icon="🔍" title="Local Examination" sub="Detailed description of the local surgical finding" />
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Site / Location</FieldLabel><Input value={f.local_site||""} onChange={v=>sf("local_site",v)} placeholder="Precise anatomical location…" /></div>
        <div><FieldLabel>Size</FieldLabel><Input value={f.local_size||""} onChange={v=>sf("local_size",v)} placeholder="Dimensions in cm (L × W × H)…" /></div>
        <div><FieldLabel>Shape</FieldLabel><TglGroup options={["Round","Oval","Irregular","Elongated","Lobulated"]} value={f.local_shape||""} onChange={v=>sf("local_shape",v)} /></div>
        <div><FieldLabel>Surface</FieldLabel><TglGroup options={["Smooth","Irregular","Nodular","Bosselated"]} value={f.local_surface||""} onChange={v=>sf("local_surface",v)} /></div>
        <div><FieldLabel>Edge / Margin</FieldLabel><TglGroup options={["Well-defined","Ill-defined","Irregular","Rolled edge","Everted","Inverted"]} value={f.local_edge||""} onChange={v=>sf("local_edge",v)} /></div>
        <div><FieldLabel>Consistency</FieldLabel><TglGroup options={["Soft","Firm","Hard","Rubbery","Stony hard","Fluctuant","Cystic"]} value={f.local_consistency||""} onChange={v=>sf("local_consistency",v)} /></div>
        <div><FieldLabel>Tenderness</FieldLabel><TglGroup options={["Non-tender","Mildly tender","Moderately tender","Exquisitely tender","Rebound tender"]} value={f.local_tenderness||""} onChange={v=>sf("local_tenderness",v)} /></div>
        <div><FieldLabel>Mobility / Fixity</FieldLabel><TglGroup options={["Freely mobile","Mobile in one plane","Fixed to skin","Fixed to deep structures","Attached to bone"]} value={f.local_mobility||""} onChange={v=>sf("local_mobility",v)} /></div>
        <div><FieldLabel>Transillumination</FieldLabel><TglGroup options={["Not tested","Positive","Negative","Not applicable"]} value={f.local_transill||""} onChange={v=>sf("local_transill",v)} /></div>
        <div><FieldLabel>Pulsatility</FieldLabel><TglGroup options={["Non-pulsatile","Expansile pulsation","Transmitted pulsation"]} value={f.local_pulsatile||""} onChange={v=>sf("local_pulsatile",v)} /></div>
        <div><FieldLabel>Reducibility (hernias)</FieldLabel><TglGroup options={["Not applicable","Fully reducible","Partially reducible","Irreducible"]} value={f.local_reducible||""} onChange={v=>sf("local_reducible",v)} /></div>
        <div><FieldLabel>Cough Impulse</FieldLabel><TglGroup options={["Not applicable","Present","Absent"]} value={f.local_cough||""} onChange={v=>sf("local_cough",v)} /></div>
        <div><FieldLabel>Colour / Skin Overlying</FieldLabel><Input value={f.local_color||""} onChange={v=>sf("local_color",v)} placeholder="Normal, erythematous, punctum, sinus…" /></div>
        <div><FieldLabel>Discharge / Secretions</FieldLabel><Input value={f.local_discharge||""} onChange={v=>sf("local_discharge",v)} placeholder="None / purulent / serous — amount, colour, odour…" /></div>
        <div><FieldLabel>Regional Lymph Nodes</FieldLabel><Input value={f.local_lymph||""} onChange={v=>sf("local_lymph",v)} placeholder="Draining lymph nodes — palpable? Tender? Size?" /></div>
        <div><FieldLabel>Surrounding Tissues</FieldLabel><Textarea value={f.local_surrounding||""} onChange={v=>sf("local_surrounding",v)} rows={2} placeholder="Inflammation, induration, oedema…" /></div>
      </AutoGrid>
      <div style={{ marginTop:12 }}>
        <FieldLabel>Summary of Local Finding</FieldLabel>
        <Textarea value={f.local_summary||""} onChange={v=>sf("local_summary",v)} rows={3} placeholder="A [size] × [size] cm, [shape], [surface], [consistency], [mobile/fixed] [lump/wound/ulcer] at the [site]…" />
      </div>
    </Card>
  );
}

// ── LOCAL EXAM — ORTHO ────────────────────────────────────────
function LocalExamOrthoSection({ f, sf }) {
  return (
    <Card glow>
      <SectionHeader icon="🦴" title="Local Examination — Look, Feel, Move" sub="Systematic orthopaedic examination of the affected region" />
      <SubSec>1. Look (Inspection)</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Deformity</FieldLabel><TglGroup options={["None","Varus","Valgus","Rotational","Angular","Shortening","Fixed flexion"]} value={f.ortho_deformity||""} onChange={v=>sf("ortho_deformity",v)} /></div>
        <div><FieldLabel>Swelling</FieldLabel><TglGroup options={["None","Soft tissue","Bony","Joint effusion","Pitting oedema"]} value={f.ortho_swelling||""} onChange={v=>sf("ortho_swelling",v)} /></div>
        <div><FieldLabel>Bruising / Ecchymosis</FieldLabel><TglGroup options={["None","Local bruising","Extensive bruising","Tracking bruise"]} value={f.ortho_bruise||""} onChange={v=>sf("ortho_bruise",v)} /></div>
        <div><FieldLabel>Muscle Wasting</FieldLabel><TglGroup options={["None","Mild","Moderate","Severe"]} value={f.ortho_wasting||""} onChange={v=>sf("ortho_wasting",v)} /></div>
        <div><FieldLabel>Scars / Wounds</FieldLabel><Input value={f.ortho_scars||""} onChange={v=>sf("ortho_scars",v)} placeholder="Previous surgical scars, open wounds…" /></div>
        <div><FieldLabel>Gait (if weight-bearing)</FieldLabel><TglGroup options={["Normal","Antalgic","Trendelenburg","Steppage","Scissors","Waddling","Spastic","Non-weight-bearing"]} value={f.ortho_gait||""} onChange={v=>sf("ortho_gait",v)} /></div>
      </AutoGrid>
      <SubSec>2. Feel (Palpation)</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Warmth</FieldLabel><TglGroup options={["Normal temperature","Warm","Hot","Cool"]} value={f.ortho_warmth||""} onChange={v=>sf("ortho_warmth",v)} /></div>
        <div><FieldLabel>Point of Maximum Tenderness</FieldLabel><Input value={f.ortho_pmt||""} onChange={v=>sf("ortho_pmt",v)} placeholder="Specific landmark, bone, joint line, tendon…" /></div>
        <div><FieldLabel>Crepitus</FieldLabel><TglGroup options={["None","Bony crepitus","Fine crepitus","Coarse crepitus"]} value={f.ortho_crepitus||""} onChange={v=>sf("ortho_crepitus",v)} /></div>
        <div><FieldLabel>Joint Effusion Test</FieldLabel><TglGroup options={["Not applicable","Negative","Ballottement positive","Bulge sign positive","Fluctuant"]} value={f.ortho_effusion||""} onChange={v=>sf("ortho_effusion",v)} /></div>
        <div><FieldLabel>Muscle Spasm</FieldLabel><TglGroup options={["None","Mild","Moderate","Severe spasm"]} value={f.ortho_spasm||""} onChange={v=>sf("ortho_spasm",v)} /></div>
      </AutoGrid>
      <SubSec>3. Move (Range of Motion)</SubSec>
      <Grid cols={2} gap={10}>
        <div><FieldLabel>Active Range of Motion</FieldLabel><Textarea value={f.ortho_active_rom||""} onChange={v=>sf("ortho_active_rom",v)} rows={3} placeholder="Flexion _°, Extension _°, Abduction _°, Adduction _°…" /></div>
        <div><FieldLabel>Passive Range of Motion</FieldLabel><Textarea value={f.ortho_passive_rom||""} onChange={v=>sf("ortho_passive_rom",v)} rows={3} placeholder="Passive ROM — note if greater than active…" /></div>
      </Grid>
      <div style={{ marginTop:10 }}>
        <FieldLabel>Special Orthopaedic Tests</FieldLabel>
        <Textarea value={f.ortho_special_tests||""} onChange={v=>sf("ortho_special_tests",v)} rows={3} placeholder="McMurray test, Lachman, anterior drawer, SLRT, Finkelstein, Tinel, Phalen, Thomas, FABER…" />
      </div>
      <div style={{ marginTop:10 }}>
        <FieldLabel>Comparison with Contralateral Side</FieldLabel>
        <Textarea value={f.ortho_contralateral||""} onChange={v=>sf("ortho_contralateral",v)} rows={2} placeholder="Findings on the opposite side — symmetry, wasting, deformity…" />
      </div>
    </Card>
  );
}

// ── NEUROVASCULAR ─────────────────────────────────────────────
function NeurovascSection({ f, sf }) {
  const suspected = f.nv_compartment?.includes("Suspected");
  return (
    <Card>
      <SectionHeader icon="⚡" title="Neurovascular Status" sub="Distal to the injury — critical to document before any intervention" />
      <AutoGrid min={220} gap={12}>
        <div>
          <FieldLabel>Sensation (Distal)</FieldLabel>
          <TglGroup options={["Intact","Reduced — specify dermatome","Absent","Paraesthesia / tingling","Hyperalgesia"]} value={f.nv_sensation||""} onChange={v=>sf("nv_sensation",v)} />
          <Input value={f.nv_sensation_detail||""} onChange={v=>sf("nv_sensation_detail",v)} placeholder="Dermatomes tested, side, modalities…" style={{ marginTop:5 }} />
        </div>
        <div>
          <FieldLabel>Motor Power (Distal)</FieldLabel>
          <TglGroup options={["MRC 5/5 (normal)","MRC 4/5 (antigravity+)","MRC 3/5 (antigravity)","MRC 2/5 (no gravity)","MRC 1/5 (flicker)","MRC 0/5 (none)"]} value={f.nv_power||""} onChange={v=>sf("nv_power",v)} />
          <Input value={f.nv_power_detail||""} onChange={v=>sf("nv_power_detail",v)} placeholder="Myotomes tested, side, specific muscles…" style={{ marginTop:5 }} />
        </div>
        <div>
          <FieldLabel>Peripheral Pulses (Distal)</FieldLabel>
          <TglGroup options={["Full and bounding","Normal","Weak","Diminished","Absent"]} value={f.nv_pulses||""} onChange={v=>sf("nv_pulses",v)} />
          <Input value={f.nv_pulses_detail||""} onChange={v=>sf("nv_pulses_detail",v)} placeholder="Radial, ulnar, dorsalis pedis, posterior tibial…" style={{ marginTop:5 }} />
        </div>
        <div><FieldLabel>Capillary Refill Time</FieldLabel><TglGroup options={["<2 seconds (normal)","2-3 seconds (borderline)",">3 seconds (delayed)"]} value={f.nv_crt||""} onChange={v=>sf("nv_crt",v)} /></div>
        <div><FieldLabel>Skin Colour (Distal)</FieldLabel><TglGroup options={["Pink / normal","Pale","Mottled","Cyanotic","Dusky"]} value={f.nv_colour||""} onChange={v=>sf("nv_colour",v)} /></div>
        <div><FieldLabel>Compartment Syndrome Screen</FieldLabel><TglGroup options={["No features","Pain on passive stretch","Tensely swollen compartment","Suspected — urgent assessment"]} value={f.nv_compartment||""} onChange={v=>sf("nv_compartment",v)} /></div>
      </AutoGrid>
      {suspected && (
        <AlertBox type="red" icon="🚨">
          <strong>ALERT:</strong> Suspected compartment syndrome — requires urgent surgical assessment. Do NOT elevate limb above heart level. Consider immediate fasciotomy.
        </AlertBox>
      )}
    </Card>
  );
}

// ── ASSESSMENT ────────────────────────────────────────────────
function AssessmentSection({ f, sf, deptId, name }) {
  const isPsych = deptId === "psych";
  const impList = f.imp_list || [];
  const ddxList = f.ddx_list || [];
  return (
    <>
      <Card glow>
        <SectionHeader icon="📝" title="Assessment Summary" sub="Integrate history, examination, and working diagnosis" />
        <Textarea value={f.assessment_summary||""} onChange={v=>sf("assessment_summary",v)} rows={4} placeholder={`In summary, ${name||"the patient"} is a [age]/[gender] presenting with [CC]…`} />
      </Card>
      <Grid cols={2} gap={14}>
        <Card glow>
          <SectionHeader icon="🎯" title={isPsych?"Diagnosis (DSM-5 / ICD-11)":"Impression / Diagnosis"} badge="Required" />
          {impList.map((d,i)=>(
            <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
              <Input value={d} onChange={v=>{const l=[...impList];l[i]=v;sf("imp_list",l);}} placeholder={`${isPsych?"Diagnosis":"Impression"} ${i+1}`} />
              <button onClick={()=>sf("imp_list",impList.filter((_,idx)=>idx!==i))} style={{ background:DS.redDim, border:`1px solid rgba(240,82,82,0.3)`, borderRadius:6, color:DS.red, width:26, height:26, cursor:"pointer" }}>✕</button>
            </div>
          ))}
          <AddBtn onClick={()=>sf("imp_list",[...impList,""])}>+ Add {isPsych?"Diagnosis":"Impression"}</AddBtn>
        </Card>
        <Card>
          <SectionHeader icon="🔀" title="Differential Diagnoses" />
          {ddxList.map((d,i)=>(
            <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
              <Input value={d} onChange={v=>{const l=[...ddxList];l[i]=v;sf("ddx_list",l);}} placeholder={`Differential ${i+1}`} />
              <button onClick={()=>sf("ddx_list",ddxList.filter((_,idx)=>idx!==i))} style={{ background:DS.redDim, border:`1px solid rgba(240,82,82,0.3)`, borderRadius:6, color:DS.red, width:26, height:26, cursor:"pointer" }}>✕</button>
            </div>
          ))}
          <AddBtn onClick={()=>sf("ddx_list",[...ddxList,""])}>+ Add Differential</AddBtn>
        </Card>
      </Grid>
    </>
  );
}

// ── MANAGEMENT PLAN ───────────────────────────────────────────
function PlanSection({ f, sf, deptId }) {
  const isPsych = deptId==="psych", isOrtho = deptId==="ortho", isSurg = deptId==="surg";
  return (
    <Card>
      <SectionHeader icon="⚙️" title="Management Plan" sub={isPsych?"Biological · Psychological · Social":"Investigations · Medications · Procedures · Referrals · Follow-up"} />
      <SubSec>Investigations</SubSec>
      <Grid cols={2} gap={12}>
        <div>
          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, fontWeight:700, color:DS.red, marginBottom:4 }}>URGENT <span style={{ background:DS.redDim, color:DS.red, borderRadius:20, padding:"2px 8px", fontSize:9, fontWeight:700, border:"1px solid rgba(240,82,82,0.4)" }}>Same day</span></label>
          <Textarea value={f.plan_invx_urgent||""} onChange={v=>sf("plan_invx_urgent",v)} rows={3} placeholder="FBC, RFTs, LFTs, blood cultures, ABG, BMs, ECG, imaging if critical…" />
        </div>
        <div><FieldLabel>Routine / Elective</FieldLabel><Textarea value={f.plan_invx_routine||""} onChange={v=>sf("plan_invx_routine",v)} rows={3} placeholder="ESR, TFTs, lipids, HbA1c, urine MC&S, imaging studies, biopsies…" /></div>
      </Grid>

      {isPsych ? <>
        <SubSec>Biological Management</SubSec>
        <Textarea value={f.plan_bio||""} onChange={v=>sf("plan_bio",v)} rows={3} placeholder="Medications: drug, dose, route, frequency, duration. ECT if indicated. Admit vs. community care decision…" />
        <SubSec>Psychological Interventions</SubSec>
        <Textarea value={f.plan_psych_tx||""} onChange={v=>sf("plan_psych_tx",v)} rows={2} placeholder="CBT, DBT, EMDR, supportive psychotherapy, group therapy, family therapy…" />
        <SubSec>Social Interventions</SubSec>
        <Textarea value={f.plan_social||""} onChange={v=>sf("plan_social",v)} rows={2} placeholder="Housing, employment support, social worker, community mental health team, CMHT…" />
      </> : isOrtho ? <>
        <SubSec>Conservative Management</SubSec>
        <Textarea value={f.plan_conservative||""} onChange={v=>sf("plan_conservative",v)} rows={3} placeholder="Immobilisation (cast/splint/brace): type, duration, weight-bearing status&#10;Analgesia: paracetamol / NSAIDs / opioids&#10;Physiotherapy: referral, goals, timeline&#10;DVT prophylaxis" />
        <SubSec>Operative Management</SubSec>
        <Textarea value={f.plan_operative||""} onChange={v=>sf("plan_operative",v)} rows={3} placeholder="Procedure planned: [open reduction/internal fixation / arthroplasty / arthroscopy]&#10;Side / site / approach&#10;Timing: emergency / urgent / elective&#10;Consent: risks, alternatives, expected outcomes discussed" />
      </> : isSurg ? <>
        <SubSec>Non-operative Management</SubSec>
        <Textarea value={f.plan_nonop||""} onChange={v=>sf("plan_nonop",v)} rows={3} placeholder="Conservative measures, drainage, antibiotics, supportive care, monitoring criteria…" />
        <SubSec>Operative Plan (if applicable)</SubSec>
        <Textarea value={f.plan_op||""} onChange={v=>sf("plan_op",v)} rows={3} placeholder="Operation planned: [procedure]&#10;Timing: emergency / urgent / elective&#10;Approach / technique&#10;Consent obtained: risks, alternatives, expected outcomes" />
      </> : <>
        <SubSec>Medications / Prescriptions</SubSec>
        <Textarea value={f.plan_meds||""} onChange={v=>sf("plan_meds",v)} rows={3} placeholder="Drug name | dose | route | frequency | duration&#10;e.g. Amoxicillin 500mg PO TDS × 5 days" />
      </>}

      <SubSec>Referrals & Consults</SubSec>
      <Grid cols={2} gap={12}>
        <div><FieldLabel>Internal Referrals</FieldLabel><Textarea value={f.plan_ref_internal||""} onChange={v=>sf("plan_ref_internal",v)} rows={2} placeholder="Cardiology, nephrology, dietitian, wound care team, social work…" /></div>
        <div><FieldLabel>External / Community Referrals</FieldLabel><Textarea value={f.plan_ref_external||""} onChange={v=>sf("plan_ref_external",v)} rows={2} placeholder="Specialist clinic, physiotherapy, community services, palliative care…" /></div>
      </Grid>
      <SubSec>Patient Education & Discharge Counselling</SubSec>
      <Textarea value={f.plan_edu||""} onChange={v=>sf("plan_edu",v)} rows={2} placeholder="Diagnosis explained: Yes/No&#10;Medication counselling&#10;Red flag symptoms to watch for&#10;Diet and lifestyle modifications" />
      <SubSec>Follow-up Plan</SubSec>
      <Grid cols={2} gap={12}>
        <div>
          <FieldLabel>Follow-up Appointment</FieldLabel>
          <TglGroup options={["1 week","2 weeks","1 month","3 months","6 months","PRN","Not required"]} value={f.plan_followup||""} onChange={v=>sf("plan_followup",v)} />
          <Input value={f.plan_followup_detail||""} onChange={v=>sf("plan_followup_detail",v)} placeholder="Specific clinic, with whom, what to review…" style={{ marginTop:5 }} />
        </div>
        <div>
          <FieldLabel>Disposition</FieldLabel>
          <TglGroup options={["Discharge home","Day case / same-day surgery","Ward admission","ICU / HDU admission","Transfer to another facility"]} value={f.plan_disposition||""} onChange={v=>sf("plan_disposition",v)} />
        </div>
      </Grid>
      <Divider label="Clinician Signature" />
      <Grid cols={3} gap={12}>
        <div><FieldLabel>Assessing Clinician</FieldLabel><Input value={f.sign_doctor||""} onChange={v=>sf("sign_doctor",v)} placeholder="Full name" /></div>
        <div><FieldLabel>Designation / Level</FieldLabel><Input value={f.sign_designation||""} onChange={v=>sf("sign_designation",v)} placeholder="e.g. House Officer, Registrar, Consultant…" /></div>
        <div><FieldLabel>Date & Time</FieldLabel><Input type="datetime-local" value={f.sign_datetime||""} onChange={v=>sf("sign_datetime",v)} /></div>
      </Grid>
      <div style={{ marginTop:10 }}>
        <FieldLabel>Countersigning Consultant (if applicable)</FieldLabel>
        <Input value={f.sign_consultant||""} onChange={v=>sf("sign_consultant",v)} placeholder="Supervising consultant name and signature…" />
      </div>
    </Card>
  );
}

// ── OBGYN SECTIONS (additional) ──────────────────────────────
function ObgynTabSection({ obgynMode, setObgynMode }) {
  return (
    <Card>
      <SectionHeader icon="🌸" title="Consultation Mode" sub="Choose between Obstetrics (pregnancy) or Gynaecology" />
      <div style={{ display:"flex", background:DS.navyMid, borderRadius:8, border:`1px solid ${DS.navyBorder}`, overflow:"hidden", marginBottom:14 }}>
        {["Gynecology","Obstetrics"].map(m => (
          <button key={m} onClick={()=>setObgynMode(m)} style={{ flex:1, padding:"7px 12px", background:obgynMode===m?DS.teal:"transparent", border:"none", color:obgynMode===m?"#07111c":DS.muted, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:DS.fontBody, transition:"all .15s" }}>
            {m==="Gynecology"?"🔬 Gynecology":"🤰 Obstetrics"}
          </button>
        ))}
      </div>
    </Card>
  );
}

function ObstetricSection({ f, sf, obgynMode }) {
  const isObs = obgynMode === "Obstetrics";
  if (!isObs) return null;

  const updateGravPara = (field, val) => sf(field, val);

  return (
    <Card>
      <SectionHeader icon="🤰" title="Obstetric History" sub="Gravidity, parity, LMP, antenatal details" />
      <SubSec>Gravidity & Parity</SubSec>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        <div><FieldLabel>Gravida (total pregnancies)</FieldLabel><Input type="number" value={f.obs_grav||""} onChange={v=>updateGravPara("obs_grav",v)} placeholder="e.g. 3" /></div>
        <div><FieldLabel>Para (28+ weeks)</FieldLabel><Input type="number" value={f.obs_para||""} onChange={v=>updateGravPara("obs_para",v)} placeholder="e.g. 2" /></div>
        <div><FieldLabel>Abortions (under 28w)</FieldLabel><Input type="number" value={f.obs_abort||""} onChange={v=>updateGravPara("obs_abort",v)} placeholder="e.g. 1" /></div>
        <div><FieldLabel>Living children</FieldLabel><Input type="number" value={f.obs_living||""} onChange={v=>updateGravPara("obs_living",v)} placeholder="e.g. 2" /></div>
      </div>

      <SubSec>Current Pregnancy</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Last Menstrual Period (LMP)</FieldLabel><Input type="date" value={f.obs_lmp||""} onChange={v=>sf("obs_lmp",v)} /></div>
        <div><FieldLabel>Gestational Age by Scan (if available)</FieldLabel><Input value={f.obs_ga_scan||""} onChange={v=>sf("obs_ga_scan",v)} placeholder="e.g. 32+4 weeks" /></div>
        <div><FieldLabel>Expected Date of Delivery (EDD) – manual override</FieldLabel><Input type="date" value={f.obs_edd_manual||""} onChange={v=>sf("obs_edd_manual",v)} /></div>
        <div><FieldLabel>Number of ANC visits so far</FieldLabel><Input type="number" value={f.obs_anc_visits||""} onChange={v=>sf("obs_anc_visits",v)} /></div>
        <div><FieldLabel>Booking status</FieldLabel><TglGroup options={["Booked","Unbooked"]} value={f.obs_booking||""} onChange={v=>sf("obs_booking",v)} /></div>
      </AutoGrid>

      <SubSec>Previous Obstetric History</SubSec>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        <div><FieldLabel>Previous caesarean section?</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_previous_cs||""} onChange={v=>sf("obs_previous_cs",v)} /></div>
        <div><FieldLabel>Previous postpartum haemorrhage?</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_previous_pph||""} onChange={v=>sf("obs_previous_pph",v)} /></div>
        <div><FieldLabel>Previous preterm labour?</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_previous_preterm||""} onChange={v=>sf("obs_previous_preterm",v)} /></div>
        <div><FieldLabel>Previous stillbirth / neonatal death?</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_previous_stillbirth||""} onChange={v=>sf("obs_previous_stillbirth",v)} /></div>
      </div>

      <SubSec>Risk Factors in Current Pregnancy</SubSec>
      <AutoGrid min={180} gap={10}>
        <div><FieldLabel>Hypertension / Pre‑eclampsia</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_hypertension||""} onChange={v=>sf("obs_hypertension",v)} /></div>
        <div><FieldLabel>Diabetes (GDM / pre‑existing)</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_diabetes||""} onChange={v=>sf("obs_diabetes",v)} /></div>
        <div><FieldLabel>HIV status</FieldLabel><TglGroup options={["Negative","Positive on ART","Positive not on ART","Unknown"]} value={f.obs_hiv||""} onChange={v=>sf("obs_hiv",v)} /></div>
        <div><FieldLabel>Anaemia (Hb &lt;11)</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_anaemia||""} onChange={v=>sf("obs_anaemia",v)} /></div>
        <div><FieldLabel>Bleeding in this pregnancy (APH)</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_bleeding||""} onChange={v=>sf("obs_bleeding",v)} /></div>
        <div><FieldLabel>Preterm labour symptoms</FieldLabel><TglGroup options={["No","Yes"]} value={f.obs_preterm_symptoms||""} onChange={v=>sf("obs_preterm_symptoms",v)} /></div>
      </AutoGrid>

      <SubSec>Medications & Supplements</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Folic acid / iron</FieldLabel><Input value={f.obs_supplements||""} onChange={v=>sf("obs_supplements",v)} placeholder="e.g. folic acid 5mg daily" /></div>
        <div><FieldLabel>Other prenatal medications</FieldLabel><Input value={f.obs_meds||""} onChange={v=>sf("obs_meds",v)} placeholder="e.g. aspirin, anti‑hypertensives" /></div>
      </AutoGrid>

      <div style={{ marginTop: 12 }}>
        <FieldLabel>Additional notes / complications</FieldLabel>
        <Textarea value={f.obs_notes||""} onChange={v=>sf("obs_notes",v)} rows={3} placeholder="Any other pregnancy‑related issues…" />
      </div>
    </Card>
  );
}
// ==================== OBSTETRIC SUMMARY PANEL ====================
// Shown just above CC when dept=obgyn & mode=Obstetrics
function ObstetricSummaryPanel({ f }) {
  const lmp = f.obs_lmp;
  const ga = lmp ? calculateGA(lmp) : null;
  const edd = lmp ? calculateEDD(lmp) : null;
  const weeks = ga?.weeks ?? 0;
  const trimester = weeks > 0 ? getTrimester(weeks) : null;

  const grav = f.obs_grav ? `G${f.obs_grav}` : "G?";
  const para = f.obs_para !== undefined && f.obs_para !== "" ? `P${f.obs_para}` : "P?";
  const abort = f.obs_abort !== undefined && f.obs_abort !== "" ? `+${f.obs_abort}` : "+0";
  const living = f.obs_living !== undefined && f.obs_living !== "" ? `L${f.obs_living}` : "";

  const alerts = [];
  if (ga && ga.weeks > 41) alerts.push({ type: "red", icon: "🚨", msg: "Post-term (>42 wks) — induction assessment required" });
  if (ga && ga.weeks < 37 && ga.weeks > 0) alerts.push({ type: "amber", icon: "⚠️", msg: `Preterm (${ga.weeks}+${ga.days} wks) — assess for preterm labour` });
  if (parseInt(f.obs_para) >= 5) alerts.push({ type: "amber", icon: "⚠️", msg: "Grand multipara (P≥5) — increased obstetric risk" });
  if (f.obs_bleeding === "Yes") alerts.push({ type: "red", icon: "🚨", msg: "APH reported — exclude placenta praevia / abruption" });
  if (f.obs_previous_cs === "Yes") alerts.push({ type: "amber", icon: "⚠️", msg: "Previous LSCS — VBAC vs repeat CS counselling needed" });
  if (f.obs_hypertension === "Yes") alerts.push({ type: "amber", icon: "⚠️", msg: "Hypertension in pregnancy — monitor for pre-eclampsia" });

  return (
    <Card glow>
      <SectionHeader icon="🤰" title="Obstetric Summary" sub="Auto-calculated from LMP (Naegele's rule) · Updates in real-time" />
      
      {/* Parity Banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
        background: DS.navyMid, borderRadius: 8, padding: "10px 14px",
        border: `1px solid ${DS.navyBorder}`,
      }}>
        <span style={{ fontFamily: DS.fontMono, fontSize: 18, fontWeight: 700, color: DS.teal }}>
          {grav} {para}{abort} {living}
        </span>
        {trimester && (
          <span style={{
            background: weeks < 13 ? DS.blueDim : weeks < 28 ? DS.amberDim : DS.greenDim,
            color: weeks < 13 ? DS.blue : weeks < 28 ? DS.amber : DS.green,
            border: `1px solid ${weeks < 13 ? "rgba(77,166,255,0.35)" : weeks < 28 ? "rgba(246,194,49,0.35)" : "rgba(34,211,111,0.35)"}`,
            borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px",
          }}>{trimester}</span>
        )}
      </div>

      {/* Key Dates Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10, marginBottom: 12,
      }}>
        {[
          {
            label: "LMP",
            value: lmp ? new Date(lmp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
            color: DS.silver,
          },
          {
            label: "EDD (Naegele's)",
            value: edd ? edd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
            color: DS.teal,
            highlight: true,
          },
          {
            label: "Gestational Age",
            value: ga ? `${ga.weeks} wks + ${ga.days} days` : "—",
            color: ga ? (ga.weeks < 37 ? DS.amber : ga.weeks > 41 ? DS.red : DS.green) : DS.silver,
          },
          {
            label: "EDD by Scan",
            value: f.obs_edd_manual
              ? new Date(f.obs_edd_manual).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : "Not entered",
            color: f.obs_edd_manual ? DS.purple : DS.muted,
          },
          {
            label: "ANC Visits",
            value: f.obs_anc_visits || "—",
            color: DS.silver,
          },
          {
            label: "Booking Status",
            value: f.obs_booking || "—",
            color: f.obs_booking === "Unbooked" ? DS.red : DS.green,
          },
        ].map(item => (
          <div key={item.label} style={{
            background: item.highlight ? "rgba(14,210,192,0.07)" : DS.navyDeep,
            border: `1px solid ${item.highlight ? DS.tealBorder : DS.navyBorder}`,
            borderRadius: 8, padding: "10px 12px",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: DS.muted, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: DS.fontMono, fontSize: 13, fontWeight: 600, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {alerts.map((a, i) => (
            <AlertBox key={i} type={a.type} icon={a.icon}>{a.msg}</AlertBox>
          ))}
        </div>
      )}

      {!lmp && (
        <AlertBox type="blue" icon="ℹ️">
          Enter LMP in the <strong>Obstetric History</strong> section to auto-calculate EDD and gestational age.
        </AlertBox>
      )}
    </Card>
  );
}

// ==================== GYNAECOLOGY SUMMARY PANEL ====================
// Shown just above CC when dept=obgyn & mode=Gynecology
function GynecologySummaryPanel({ f }) {
  const lmp = f.gyn_lmp;
  const cycleLen = f.gyn_cycle_len ? parseInt(f.gyn_cycle_len) : null;
  const flowDays = f.gyn_flow_days ? parseInt(f.gyn_flow_days) : null;

  // Days since LMP
  const daysSinceLMP = lmp ? Math.floor((new Date() - new Date(lmp)) / (1000 * 60 * 60 * 24)) : null;

  // Next expected period
  const nextPeriod = (lmp && cycleLen)
    ? new Date(new Date(lmp).getTime() + cycleLen * 24 * 60 * 60 * 1000)
    : null;

  const isPostmenopausal = f.gyn_menopause_status === "Postmenopausal";
  const hasRedFlags = f.gyn_postmenopausal_bleeding === "yes"
    || f.gyn_postcoital_bleeding === "Yes"
    || f.gyn_imb === "Yes";

  const parity = f.obs_para !== undefined && f.obs_para !== "" ? `P${f.obs_para}` : null;
  const gravidity = f.obs_grav ? `G${f.obs_grav}` : null;

  return (
    <Card glow>
      <SectionHeader icon="🌸" title="Gynaecology Summary" sub="Menstrual & reproductive status at a glance" />

      {/* Parity / Status Banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        background: DS.navyMid, borderRadius: 8, padding: "10px 14px",
        border: `1px solid ${DS.navyBorder}`, marginBottom: 12,
      }}>
        {(gravidity || parity) && (
          <span style={{ fontFamily: DS.fontMono, fontSize: 16, fontWeight: 700, color: DS.teal }}>
            {[gravidity, parity].filter(Boolean).join(" ")}
          </span>
        )}
        {f.gyn_menopause_status && (
          <span style={{
            background: isPostmenopausal ? DS.amberDim : DS.greenDim,
            color: isPostmenopausal ? DS.amber : DS.green,
            border: `1px solid ${isPostmenopausal ? "rgba(246,194,49,0.35)" : "rgba(34,211,111,0.35)"}`,
            borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px",
          }}>{f.gyn_menopause_status}</span>
        )}
        {f.gyn_regular && (
          <span style={{
            background: DS.blueDim, color: DS.blue,
            border: "1px solid rgba(77,166,255,0.35)",
            borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px",
          }}>{f.gyn_regular} cycles</span>
        )}
      </div>

      {/* Key Data Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
        gap: 10, marginBottom: 12,
      }}>
        {[
          {
            label: "LMP",
            value: lmp
              ? new Date(lmp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : "—",
            sub: daysSinceLMP !== null ? `${daysSinceLMP} days ago` : null,
            color: DS.teal,
          },
          {
            label: "Cycle Length",
            value: cycleLen ? `${cycleLen} days` : "—",
            color: DS.silver,
          },
          {
            label: "Flow Duration",
            value: flowDays ? `${flowDays} days` : "—",
            color: DS.silver,
          },
          {
            label: "Next Period (est.)",
            value: nextPeriod
              ? nextPeriod.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : "—",
            sub: nextPeriod ? `in ${Math.max(0, Math.ceil((nextPeriod - new Date()) / (1000 * 60 * 60 * 24)))} days` : null,
            color: DS.purple,
          },
          {
            label: "Age at Menarche",
            value: f.gyn_menarche ? `${f.gyn_menarche} yrs` : "—",
            color: DS.silver,
          },
          {
            label: "Menopause Age",
            value: isPostmenopausal && f.gyn_menopause_age ? `${f.gyn_menopause_age} yrs` : "—",
            color: isPostmenopausal ? DS.amber : DS.muted,
          },
          {
            label: "Contraception",
            value: f.gyn_contraception || "—",
            color: DS.silver,
          },
          {
            label: "Dysmenorrhoea",
            value: f.gyn_dysmenorrhoea || "—",
            color: f.gyn_dysmenorrhoea === "Severe" ? DS.red : f.gyn_dysmenorrhoea === "Moderate" ? DS.amber : DS.silver,
          },
        ].map(item => (
          <div key={item.label} style={{
            background: DS.navyDeep,
            border: `1px solid ${DS.navyBorder}`,
            borderRadius: 8, padding: "10px 12px",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: DS.muted, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: DS.fontMono, fontSize: 13, fontWeight: 600, color: item.color }}>
              {item.value}
            </div>
            {item.sub && (
              <div style={{ fontSize: 10, color: DS.muted, marginTop: 2 }}>{item.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Red Flags */}
      {f.gyn_postmenopausal_bleeding === "yes" && (
        <AlertBox type="red" icon="🚨">
          <strong>RED FLAG:</strong> Postmenopausal bleeding — endometrial biopsy and pelvic USS required
        </AlertBox>
      )}
      {f.gyn_postcoital_bleeding === "Yes" && (
        <AlertBox type="red" icon="🚨">
          <strong>RED FLAG:</strong> Postcoital bleeding — cervical examination and smear required
        </AlertBox>
      )}
      {f.gyn_imb === "Yes" && (
        <AlertBox type="amber" icon="⚠️">
          Intermenstrual bleeding noted — consider further investigation
        </AlertBox>
      )}
      {isPostmenopausal && f.gyn_postmenopausal_bleeding !== "yes" && !hasRedFlags && (
        <AlertBox type="teal" icon="ℹ️">
          Postmenopausal — confirm no bleeding, discharge, or pelvic mass
        </AlertBox>
      )}

      {!lmp && !isPostmenopausal && (
        <AlertBox type="blue" icon="ℹ️">
          Enter LMP in the <strong>Menstrual History</strong> section to populate this summary.
        </AlertBox>
      )}
    </Card>
  );
}
 

function MenstrualSection({ f, sf }) {
  const isPostmenopausal = f.gyn_menopause_status === "Postmenopausal";
  const postmenopausalBleeding = f.gyn_postmenopausal_bleeding === "yes";

  return (
    <Card>
      <SectionHeader icon="🗓" title="Menstrual & Reproductive History" sub="For gynecological assessment" />

      <SubSec>Menstrual Pattern</SubSec>
      <AutoGrid min={200} gap={12}>
        <div><FieldLabel>Age at menarche (years)</FieldLabel><Input type="number" value={f.gyn_menarche||""} onChange={v=>sf("gyn_menarche",v)} placeholder="e.g. 13" /></div>
        <div><FieldLabel>Cycle length (days)</FieldLabel><Input type="number" value={f.gyn_cycle_len||""} onChange={v=>sf("gyn_cycle_len",v)} placeholder="e.g. 28" /></div>
        <div><FieldLabel>Duration of flow (days)</FieldLabel><Input type="number" value={f.gyn_flow_days||""} onChange={v=>sf("gyn_flow_days",v)} placeholder="e.g. 5" /></div>
        <div><FieldLabel>Regularity</FieldLabel><TglGroup options={["Regular","Irregular"]} value={f.gyn_regular||""} onChange={v=>sf("gyn_regular",v)} /></div>
        <div><FieldLabel>Last Menstrual Period (LMP)</FieldLabel><Input type="date" value={f.gyn_lmp||""} onChange={v=>sf("gyn_lmp",v)} /></div>
      </AutoGrid>

      <SubSec>Menstrual Symptoms</SubSec>
      <AutoGrid min={180} gap={12}>
        <div><FieldLabel>Dysmenorrhoea</FieldLabel><TglGroup options={["None","Mild","Moderate","Severe"]} value={f.gyn_dysmenorrhoea||""} onChange={v=>sf("gyn_dysmenorrhoea",v)} /></div>
        <div><FieldLabel>Menorrhagia (heavy bleeding)</FieldLabel><TglGroup options={["No","Yes"]} value={f.gyn_menorrhagia||""} onChange={v=>sf("gyn_menorrhagia",v)} /></div>
        <div><FieldLabel>Intermenstrual bleeding</FieldLabel><TglGroup options={["No","Yes"]} value={f.gyn_imb||""} onChange={v=>sf("gyn_imb",v)} /></div>
        <div><FieldLabel>Postcoital bleeding</FieldLabel><TglGroup options={["No","Yes"]} value={f.gyn_postcoital_bleeding||""} onChange={v=>sf("gyn_postcoital_bleeding",v)} /></div>
      </AutoGrid>

      <SubSec>Menopause Status</SubSec>
      <AutoGrid min={200} gap={12}>
        <div><FieldLabel>Menopausal status</FieldLabel><TglGroup options={["Premenopausal","Perimenopausal","Postmenopausal","Surgical menopause"]} value={f.gyn_menopause_status||""} onChange={v=>sf("gyn_menopause_status",v)} /></div>
        {f.gyn_menopause_status === "Postmenopausal" && (
          <>
            <div><FieldLabel>Age at menopause</FieldLabel><Input type="number" value={f.gyn_menopause_age||""} onChange={v=>sf("gyn_menopause_age",v)} placeholder="e.g. 51" /></div>
            <div><FieldLabel flag>Postmenopausal bleeding?</FieldLabel><TglGroup options={["No","Yes"]} value={f.gyn_postmenopausal_bleeding||""} onChange={v=>sf("gyn_postmenopausal_bleeding",v)} /></div>
          </>
        )}
      </AutoGrid>

      {postmenopausalBleeding && (
        <AlertBox type="red" icon="🚨">
          <strong>RED FLAG:</strong> Postmenopausal bleeding requires investigation (endometrial biopsy / ultrasound).
        </AlertBox>
      )}

      <SubSec>Sexual & Contraceptive History</SubSec>
      <AutoGrid min={200} gap={12}>
        <div><FieldLabel>Currently sexually active</FieldLabel><TglGroup options={["No","Yes"]} value={f.gyn_sexually_active||""} onChange={v=>sf("gyn_sexually_active",v)} /></div>
        <div><FieldLabel>Contraceptive method (current)</FieldLabel><Select value={f.gyn_contraception||""} onChange={v=>sf("gyn_contraception",v)} options={["None","COC","POP","IUD","Implant","DMPA","Barrier","Sterilised","Withdrawal","Natural"]} /></div>
        <div><FieldLabel>Past contraceptive methods</FieldLabel><Input value={f.gyn_contraception_past||""} onChange={v=>sf("gyn_contraception_past",v)} placeholder="e.g. COC 2015-2020" /></div>
        <div><FieldLabel>Dyspareunia (pain with intercourse)</FieldLabel><TglGroup options={["No","Yes – superficial","Yes – deep"]} value={f.gyn_dyspareunia||""} onChange={v=>sf("gyn_dyspareunia",v)} /></div>
      </AutoGrid>

      <SubSec>Fertility & Gynaecological History</SubSec>
      <AutoGrid min={200} gap={12}>
        <div><FieldLabel>Infertility (primary/secondary)</FieldLabel><TglGroup options={["None","Primary","Secondary"]} value={f.gyn_infertility||""} onChange={v=>sf("gyn_infertility",v)} /></div>
        <div><FieldLabel>Previous gynaecological surgeries</FieldLabel><Input value={f.gyn_prev_surgery||""} onChange={v=>sf("gyn_prev_surgery",v)} placeholder="e.g. D&C, hysteroscopy, myomectomy" /></div>
        <div><FieldLabel>History of STIs / pelvic inflammatory disease</FieldLabel><TglGroup options={["No","Yes"]} value={f.gyn_sti||""} onChange={v=>sf("gyn_sti",v)} /></div>
      </AutoGrid>

      <div style={{ marginTop: 12 }}>
        <FieldLabel>Other gynaecological symptoms / notes</FieldLabel>
        <Textarea value={f.gyn_notes||""} onChange={v=>sf("gyn_notes",v)} rows={3} placeholder="Pelvic pain, uterine mass, abnormal smears, etc…" />
      </div>
    </Card>
  );
}

function GynHxSection({ f, sf }) {
  return (
    <Card>
      <SectionHeader icon="🔬" title="Gynaecological History" sub="Previous gynaecological conditions, procedures, and sexual health" />
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Previous Gynaecological Conditions</FieldLabel><Textarea value={f.gyn_prev_conditions||""} onChange={v=>sf("gyn_prev_conditions",v)} rows={2} placeholder="Fibroids, ovarian cysts, endometriosis, PCOS, PID…" /></div>
        <div><FieldLabel>Previous Gynaecological Procedures</FieldLabel><Textarea value={f.gyn_prev_procedures||""} onChange={v=>sf("gyn_prev_procedures",v)} rows={2} placeholder="LLETZ, D&C, hysteroscopy, laparoscopy, myomectomy…" /></div>
        <div><FieldLabel>Cervical Smear / HPV Screening</FieldLabel><TglGroup options={["Never done","Up to date","Overdue","Abnormal result"]} value={f.gyn_smear||""} onChange={v=>sf("gyn_smear",v)} />{f.gyn_smear==="Abnormal result"&&<Input value={f.gyn_smear_detail||""} onChange={v=>sf("gyn_smear_detail",v)} placeholder="CIN grade, management…" style={{ marginTop:5 }} />}</div>
        <div><FieldLabel>STIs</FieldLabel><Textarea value={f.gyn_sti||""} onChange={v=>sf("gyn_sti",v)} rows={2} placeholder="Chlamydia, gonorrhoea, syphilis, herpes, HPV — past or current, treatment…" /></div>
        <div><FieldLabel>Vaginal Discharge</FieldLabel><TglGroup options={["None","Normal (physiological)","Abnormal"]} value={f.gyn_discharge||""} onChange={v=>sf("gyn_discharge",v)} />{f.gyn_discharge==="Abnormal"&&<Input value={f.gyn_discharge_detail||""} onChange={v=>sf("gyn_discharge_detail",v)} placeholder="Colour, odour, consistency, itching…" style={{ marginTop:5 }} />}</div>
        <div><FieldLabel>Dyspareunia</FieldLabel><TglGroup options={["None","Superficial","Deep","Both","Not sexually active"]} value={f.gyn_dyspareunia||""} onChange={v=>sf("gyn_dyspareunia",v)} /></div>
        <div><FieldLabel>Urinary Symptoms</FieldLabel><Textarea value={f.gyn_urinary||""} onChange={v=>sf("gyn_urinary",v)} rows={2} placeholder="Dysuria, frequency, urgency, stress incontinence, prolapse symptoms…" /></div>
      </AutoGrid>
    </Card>
  );
}

function AbdExamObgynSection({ f, sf, obgynMode }) {
  const isObs = obgynMode === "Obstetrics";
  return (
    <Card>
      <SectionHeader icon="🤰" title="Abdominal Examination" sub={isObs?"Obstetric abdominal examination with fundal height and fetal assessment":"Gynaecological abdominal examination"} />
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Inspection</FieldLabel><Textarea value={f.obgyn_abdo_inspection||""} onChange={v=>sf("obgyn_abdo_inspection",v)} rows={2} placeholder={isObs?"Fundal height visible, linea nigra, striae gravidarum…":"Distension, scars, visible masses…"} /></div>
        <div><FieldLabel>Palpation — General</FieldLabel><Textarea value={f.obgyn_abdo_palpation||""} onChange={v=>sf("obgyn_abdo_palpation",v)} rows={2} placeholder="Tenderness, organomegaly, masses…" /></div>
        {isObs && <>
          <div><FieldLabel>Fundal Height (SFH)</FieldLabel><div style={{ display:"flex", gap:6, alignItems:"center" }}><Input type="number" value={f.obgyn_sfh||""} onChange={v=>sf("obgyn_sfh",v)} placeholder="e.g. 32" /><span style={{ fontSize:11,color:DS.muted }}>cm</span></div></div>
          <div><FieldLabel>Lie of Fetus</FieldLabel><TglGroup options={["Longitudinal","Transverse","Oblique"]} value={f.obgyn_lie||""} onChange={v=>sf("obgyn_lie",v)} /></div>
          <div><FieldLabel>Presentation</FieldLabel><TglGroup options={["Cephalic","Breech","Shoulder","Face","Brow"]} value={f.obgyn_presentation||""} onChange={v=>sf("obgyn_presentation",v)} /></div>
          <div><FieldLabel>Engagement</FieldLabel><TglGroup options={["Free (5/5 palpable)","4/5 palpable","3/5 palpable (engaging)","2/5 palpable","1/5 palpable","0/5 (fully engaged)"]} value={f.obgyn_engagement||""} onChange={v=>sf("obgyn_engagement",v)} /></div>
          <div><FieldLabel>Uterine Contractions</FieldLabel><TglGroup options={["None","Braxton Hicks","Irregular labour","Regular labour"]} value={f.obgyn_contractions||""} onChange={v=>sf("obgyn_contractions",v)} /></div>
          <div><FieldLabel>Fetal Heart Rate (FHR)</FieldLabel><div style={{ display:"flex", gap:6, alignItems:"center" }}><Input type="number" value={f.obgyn_fhr||""} onChange={v=>sf("obgyn_fhr",v)} placeholder="e.g. 140" /><span style={{ fontSize:11,color:DS.muted }}>bpm (normal 110-160)</span></div></div>
          <div><FieldLabel>Liquor Volume</FieldLabel><TglGroup options={["Normal","Polyhydramnios","Oligohydramnios","Absent liquor"]} value={f.obgyn_liquor||""} onChange={v=>sf("obgyn_liquor",v)} /></div>
        </>}
        <div><FieldLabel>Percussion</FieldLabel><Input value={f.obgyn_abdo_percussion||""} onChange={v=>sf("obgyn_abdo_percussion",v)} placeholder="Dullness, resonance, shifting dullness…" /></div>
        <div><FieldLabel>Auscultation</FieldLabel><Input value={f.obgyn_abdo_auscultation||""} onChange={v=>sf("obgyn_abdo_auscultation",v)} placeholder={isObs?"FHR (Doppler/Pinard), bowel sounds…":"Bowel sounds, bruits…"} /></div>
      </AutoGrid>
    </Card>
  );
}

function PelvicSection({ f, sf, obgynMode }) {
  return (
    <Card>
      <SectionHeader icon="🔬" title="Pelvic Examination" sub="Document consent obtained before this section. Speculum and bimanual." />
      <AlertBox type="amber" icon="⚑">Ensure chaperone is present and consent documented before performing pelvic examination.</AlertBox>
      <Grid cols={2} gap={14}>
        <div>
          <SubSec>Speculum Examination</SubSec>
          {[{k:"pelvic_spec_vulva",l:"Vulva & Vaginal Introitus",p:"Normal, erythema, lesions, discharge…"},{k:"pelvic_spec_vagina",l:"Vaginal Walls",p:"Rugae, discharge, prolapse…"},{k:"pelvic_spec_cervix",l:"Cervix",p:"Appearance, os (closed/open), ectropion, lesions…"},{k:"pelvic_spec_bleeding",l:"Active Bleeding",p:"None / spotting / active bleeding — source…"}].map(x=>(
            <div key={x.k} style={{ marginBottom:10 }}><FieldLabel>{x.l}</FieldLabel><Textarea value={f[x.k]||""} onChange={v=>sf(x.k,v)} rows={2} placeholder={x.p} /></div>
          ))}
        </div>
        <div>
          <SubSec>Bimanual Examination</SubSec>
          {[{k:"pelvic_bim_cervix",l:"Cervical Motion / OS",p:"Cervical motion tenderness (CMT), os open/closed…"},{k:"pelvic_bim_uterus",l:"Uterus",p:"Size, position, mobility, consistency, masses, tenderness…"},{k:"pelvic_bim_adnexae",l:"Adnexae (Right)",p:"Right ovary/tube — size, tenderness, masses…"},{k:"pelvic_bim_adnexae_l",l:"Adnexae (Left)",p:"Left ovary/tube — size, tenderness, masses…"},{k:"pelvic_bim_pod",l:"Pouch of Douglas",p:"Fullness, tenderness, masses in POD (fluid/blood/pus)…"}].map(x=>(
            <div key={x.k} style={{ marginBottom:10 }}><FieldLabel>{x.l}</FieldLabel><Textarea value={f[x.k]||""} onChange={v=>sf(x.k,v)} rows={2} placeholder={x.p} /></div>
          ))}
        </div>
      </Grid>
    </Card>
  );
}
function GynecologySummary({ f }) {
  const isPostmenopausal = f.gyn_menopause_status === "Postmenopausal";
  const menopauseAge = f.gyn_menopause_age;
  const hasParity = f.obs_para; // you can reuse obstetric parity here
  const lmp = f.gyn_lmp;
  const cycle = f.gyn_cycle_len;
  const flowDays = f.gyn_flow_days;

  return (
    <Card glow>
      <SectionHeader icon="🌸" title="Gynecology Summary" sub="Current menstrual & reproductive status" />
      <div style={{ background: DS.navyMid, borderRadius: 8, padding: "12px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 8 }}>
          <div><strong>Menopausal status:</strong> {f.gyn_menopause_status || "—"}</div>
          {isPostmenopausal && <div><strong>Age at menopause:</strong> {menopauseAge ? `${menopauseAge} years` : "—"}</div>}
          <div><strong>Parity (if available):</strong> {hasParity ? `P${hasParity}` : "—"}</div>
          <div><strong>LMP:</strong> {lmp ? new Date(lmp).toLocaleDateString() : "—"}</div>
          <div><strong>Cycle length:</strong> {cycle ? `${cycle} days` : "—"}</div>
          <div><strong>Flow duration:</strong> {flowDays ? `${flowDays} days` : "—"}</div>
        </div>
      </div>
      {isPostmenopausal && f.gyn_postmenopausal_bleeding === "yes" && (
        <AlertBox type="red" icon="🚨">
          <strong>RED FLAG:</strong> Postmenopausal bleeding requires investigation.
        </AlertBox>
      )}
    </Card>
  );
}
// ── NEONATOLOGY / PEDIATRICS SPECIFIC SECTIONS ────────────────
function MaternalSection({ f, sf }) {
  return (
    <Card>
      <SectionHeader icon="🤱" title="Maternal & Antenatal History" sub="Full maternal profile from conception to delivery" />
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Maternal Age</FieldLabel><div style={{ display:"flex",gap:6,alignItems:"center" }}><Input type="number" value={f.neo_mat_age||""} onChange={v=>sf("neo_mat_age",v)} placeholder="e.g. 28" /><span style={{ fontSize:11,color:DS.muted }}>years</span></div></div>
        <div><FieldLabel>Gravidity & Parity</FieldLabel><div style={{ display:"flex",gap:4,alignItems:"center" }}><span style={{ fontSize:11,color:DS.muted }}>G</span><Input type="number" value={f.neo_grav||""} onChange={v=>sf("neo_grav",v)} style={{ flex:1 }} /><span style={{ fontSize:11,color:DS.muted }}>P</span><Input type="number" value={f.neo_para||""} onChange={v=>sf("neo_para",v)} style={{ flex:1 }} /><span style={{ fontSize:11,color:DS.muted }}>A</span><Input type="number" value={f.neo_abort||""} onChange={v=>sf("neo_abort",v)} style={{ flex:1 }} /></div></div>
        <div><FieldLabel>Blood Group / Rhesus</FieldLabel><Select value={f.neo_mat_bg||""} onChange={v=>sf("neo_mat_bg",v)} options={["","A+","A−","B+","B−","O+","O−","AB+","AB−"]} /></div>
        <div><FieldLabel>ANC Bookings</FieldLabel><TglGroup options={["Booked (adequate visits)","Booked (few visits)","Unbooked"]} value={f.neo_anc||""} onChange={v=>sf("neo_anc",v)} /></div>
        <div><FieldLabel>Maternal Illnesses in Pregnancy</FieldLabel><Textarea value={f.neo_mat_illness||""} onChange={v=>sf("neo_mat_illness",v)} rows={2} placeholder="GDM, pre-eclampsia, PIH, anaemia, infections, thyroid disease…" /></div>
        <div><FieldLabel>Infections / TORCH Screen</FieldLabel><Textarea value={f.neo_torch||""} onChange={v=>sf("neo_torch",v)} rows={2} placeholder="Syphilis VDRL, HIV, HBsAg, rubella, CMV, toxoplasma…" /></div>
        <div><FieldLabel>Maternal Drug & Medication Exposure</FieldLabel><Textarea value={f.neo_mat_drugs||""} onChange={v=>sf("neo_mat_drugs",v)} rows={2} placeholder="Folic acid, iron, ARVs (PMTCT regimen), steroids…" /></div>
        <div><FieldLabel>Previous Neonatal Deaths / Adverse Outcomes</FieldLabel><Textarea value={f.neo_prev_deaths||""} onChange={v=>sf("neo_prev_deaths",v)} rows={2} placeholder="Previous babies — any deaths, congenital conditions, jaundice, sepsis…" /></div>
      </AutoGrid>
    </Card>
  );
}

function LabourSection({ f, sf }) {
  const ga = parseFloat(f.neo_ga);
  const gaLabel = !isNaN(ga) ? (ga<34?"Very preterm":ga<37?"Preterm":ga<42?"Term":"Post-term") : null;
  const gaColor = !isNaN(ga) ? (ga<34?DS.red:ga<37?DS.amber:DS.green) : null;
  return (
    <Card>
      <SectionHeader icon="🏥" title="Labour & Delivery History" sub="Intrapartum details critical for neonatal assessment" />
      <AutoGrid min={220} gap={12}>
        <div>
          <FieldLabel>Gestational Age at Delivery</FieldLabel>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}><Input type="number" value={f.neo_ga||""} onChange={v=>sf("neo_ga",v)} placeholder="e.g. 37" /><span style={{ fontSize:11,color:DS.muted }}>weeks</span></div>
          {gaLabel && <span style={{ background:gaColor+"22",color:gaColor,fontFamily:DS.fontMono,fontSize:12,padding:"3px 8px",borderRadius:6,display:"inline-block",marginTop:4 }}>{gaLabel}</span>}
        </div>
        <div><FieldLabel>Mode of Delivery</FieldLabel><TglGroup options={["SVD","Emergency LSCS","Elective LSCS","Vacuum","Forceps","Breech"]} value={f.neo_mod||""} onChange={v=>sf("neo_mod",v)} /></div>
        <div><FieldLabel>Duration of Rupture of Membranes</FieldLabel><TglGroup options={["<18 hours","18-24 hours",">24 hours (PROM)","Unknown"]} value={f.neo_prom||""} onChange={v=>sf("neo_prom",v)} /></div>
        <div><FieldLabel>Liquor Colour</FieldLabel><TglGroup options={["Clear","Blood-stained","Meconium-stained (thin)","Meconium-stained (thick)","Not assessed"]} value={f.neo_liquor||""} onChange={v=>sf("neo_liquor",v)} /></div>
        <div><FieldLabel>Maternal Fever in Labour</FieldLabel><TglGroup options={["Yes","No","Unknown"]} value={f.neo_mat_fever||""} onChange={v=>sf("neo_mat_fever",v)} /></div>
        <div><FieldLabel>Fetal Distress in Labour</FieldLabel><TglGroup options={["No","Fetal bradycardia","Late decelerations","Absent variability","Meconium + CTG changes"]} value={f.neo_fetal_distress||""} onChange={v=>sf("neo_fetal_distress",v)} /></div>
        <div><FieldLabel>Oxytocin Use</FieldLabel><TglGroup options={["None","Induction","Augmentation"]} value={f.neo_oxytocin||""} onChange={v=>sf("neo_oxytocin",v)} /></div>
        <div><FieldLabel>Antenatal Corticosteroids Given</FieldLabel><TglGroup options={["Yes (complete)","Yes (incomplete)","No","Unknown"]} value={f.neo_steroids||""} onChange={v=>sf("neo_steroids",v)} /></div>
      </AutoGrid>
    </Card>
  );
}

function NeonatalSection({ f, sf }) {
  const bwt = parseFloat(f.neo_bwt);
  const bwtLabel = !isNaN(bwt) ? (bwt<1.0?"ELBW (<1kg)":bwt<1.5?"VLBW (<1.5kg)":bwt<2.5?"LBW (<2.5kg)":"Normal birth weight") : null;
  const bwtColor = !isNaN(bwt) ? (bwt<1.0?DS.red:bwt<1.5?DS.amber:bwt<2.5?DS.blue:DS.green) : null;
  return (
    <Card>
      <SectionHeader icon="🍼" title="Neonatal Course & Presenting Problem" sub="Immediate post-birth events and current illness" />
      <AutoGrid min={220} gap={12}>
        <div>
          <FieldLabel>Birth Weight</FieldLabel>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}><Input type="number" step="0.01" value={f.neo_bwt||""} onChange={v=>sf("neo_bwt",v)} placeholder="e.g. 2.8" /><span style={{ fontSize:11,color:DS.muted }}>kg</span></div>
          {bwtLabel && <span style={{ background:bwtColor+"22",color:bwtColor,fontFamily:DS.fontMono,fontSize:12,padding:"3px 8px",borderRadius:6,display:"inline-block",marginTop:4 }}>{bwtLabel}</span>}
        </div>
        <div>
          <FieldLabel>APGAR Scores</FieldLabel>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6 }}>
            {["1","5","10"].map(t=><div key={t}><FieldLabel>{t} min</FieldLabel><Input type="number" min="0" max="10" value={f[`neo_apgar${t}`]||""} onChange={v=>sf(`neo_apgar${t}`,v)} /></div>)}
          </div>
        </div>
        <div><FieldLabel>Resuscitation at Birth</FieldLabel><TglGroup options={["None required","Stimulation/drying","Oxygen","Bag-mask ventilation","Intubation + PPV","Chest compressions","Adrenaline given"]} value={f.neo_resus||""} onChange={v=>sf("neo_resus",v)} /></div>
        <div><FieldLabel>Feeding History</FieldLabel><TglGroup options={["Breastfeeding well","Breastfeeding poorly","EBM via NGT","Formula","TPN","Nil by mouth"]} value={f.neo_feed||""} onChange={v=>sf("neo_feed",v)} /><Input value={f.neo_feed_detail||""} onChange={v=>sf("neo_feed_detail",v)} placeholder="Volumes, tolerance, vomiting…" style={{ marginTop:5 }} /></div>
        <div><FieldLabel>First Passage of Urine</FieldLabel><TglGroup options={["Within 24h","24-48h","After 48h","Not yet","Unknown"]} value={f.neo_urine||""} onChange={v=>sf("neo_urine",v)} /></div>
        <div><FieldLabel flag>Jaundice</FieldLabel><TglGroup options={["None","Yes — currently","Resolved","On phototherapy"]} value={f.neo_jaundice||""} onChange={v=>sf("neo_jaundice",v)} />{f.neo_jaundice&&f.neo_jaundice!=="None"&&<Input value={f.neo_jaundice_detail||""} onChange={v=>sf("neo_jaundice_detail",v)} placeholder="Onset age, SBR level, Coombs, treatment…" style={{ marginTop:5 }} />}</div>
        <div><FieldLabel flag>Respiratory Distress</FieldLabel><TglGroup options={["None","Mild (Silverman <3)","Moderate (Silverman 3-6)","Severe (Silverman >6)"]} value={f.neo_resp_distress||""} onChange={v=>sf("neo_resp_distress",v)} /></div>
        <div><FieldLabel flag>Sepsis Features</FieldLabel><TglGroup options={["None suspected","Early-onset (<72h)","Late-onset (>72h)","Culture confirmed"]} value={f.neo_sepsis||""} onChange={v=>sf("neo_sepsis",v)} /></div>
        <div><FieldLabel flag>Seizures</FieldLabel><TglGroup options={["None","Suspected","Confirmed (clinical)","Confirmed (EEG)"]} value={f.neo_seizures||""} onChange={v=>sf("neo_seizures",v)} /></div>
        <div><FieldLabel>Presenting Illness (current)</FieldLabel><Textarea value={f.neo_presenting||""} onChange={v=>sf("neo_presenting",v)} rows={3} placeholder="Describe the current problem — onset, progression, severity, associated features…" /></div>
      </AutoGrid>
    </Card>
  );
}

function BirthSection({ f, sf }) {
  return (
    <Card>
      <SectionHeader icon="🐣" title="Birth & Perinatal History" sub="Comprehensive maternal-fetal-neonatal history" />
      <SubSec>Antenatal History</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>ANC Attendance</FieldLabel><TglGroup options={["Booked","Unbooked","Partial"]} value={f.peds_anc_book||""} onChange={v=>sf("peds_anc_book",v)} /></div>
        <div><FieldLabel>Gestational Age at Birth</FieldLabel><div style={{ display:"flex",gap:6,alignItems:"center" }}><Input type="number" value={f.peds_ga||""} onChange={v=>sf("peds_ga",v)} placeholder="e.g. 38" /><span style={{ fontSize:11,color:DS.muted }}>weeks</span></div></div>
        <div><FieldLabel>Maternal Illness in Pregnancy</FieldLabel><Textarea value={f.peds_mat_illness||""} onChange={v=>sf("peds_mat_illness",v)} rows={2} placeholder="HTN, DM, infections, anaemia, thyroid, epilepsy…" /></div>
        <div><FieldLabel>Maternal Infections (TORCH)</FieldLabel><Textarea value={f.peds_torch||""} onChange={v=>sf("peds_torch",v)} rows={2} placeholder="Toxoplasma, Rubella, CMV, HSV, Syphilis, HIV — screened?" /></div>
      </AutoGrid>
      <SubSec>Labour & Delivery</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Mode of Delivery</FieldLabel><TglGroup options={["SVD","Emergency LSCS","Elective LSCS","Instrumental (Vacuum)","Instrumental (Forceps)","Breech"]} value={f.peds_mod||""} onChange={v=>sf("peds_mod",v)} /></div>
        <div><FieldLabel>Complications in Labour</FieldLabel><Input value={f.peds_labour_comp||""} onChange={v=>sf("peds_labour_comp",v)} placeholder="PROM, fetal distress, malpresentation, cord prolapse…" /></div>
      </AutoGrid>
      <SubSec>Postnatal History</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Birth Weight</FieldLabel><div style={{ display:"flex",gap:6,alignItems:"center" }}><Input type="number" step="0.01" value={f.peds_bwt||""} onChange={v=>sf("peds_bwt",v)} placeholder="e.g. 3.2" /><span style={{ fontSize:11,color:DS.muted }}>kg</span></div></div>
        <div>
          <FieldLabel>APGAR Scores</FieldLabel>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6 }}>
            {["1","5"].map(t=><div key={t}><FieldLabel>{t} min</FieldLabel><Input type="number" min="0" max="10" value={f[`peds_apgar${t}`]||""} onChange={v=>sf(`peds_apgar${t}`,v)} /></div>)}
          </div>
        </div>
        <div><FieldLabel>Resuscitation at Birth</FieldLabel><TglGroup options={["None required","Stimulation only","Oxygen given","Bag-mask ventilation","Intubation","CPR required"]} value={f.peds_resus||""} onChange={v=>sf("peds_resus",v)} /></div>
        <div><FieldLabel>Neonatal Jaundice</FieldLabel><TglGroup options={["None","Physiological","Pathological (treated)"]} value={f.peds_jaundice||""} onChange={v=>sf("peds_jaundice",v)} /></div>
      </AutoGrid>
    </Card>
  );
}

function DevSection({ f, sf }) {
  const vaccines = [{l:"BCG",k:"bcg"},{l:"OPV (0-3)",k:"opv"},{l:"DPT / Pentavalent",k:"dpt"},{l:"Hepatitis B",k:"hepb"},{l:"Rotavirus",k:"rota"},{l:"PCV / Pneumococcal",k:"pcv"},{l:"MMR / MR",k:"mmr"},{l:"Meningococcal",k:"mening"},{l:"Typhoid",k:"typhoid"},{l:"Yellow Fever",k:"yf"},{l:"COVID-19",k:"covid_vac"},{l:"Influenza",k:"flu"}];
  return (
    <Card>
      <SectionHeader icon="📈" title="Developmental, Immunization & Nutritional History" sub="Milestones, vaccine status, and feeding history" />
      <SubSec>Immunization History</SubSec>
      <AlertBox type="blue" icon="ℹ">Verify immunization card where possible. Ask specifically about each antigen.</AlertBox>
      <AutoGrid min={175} gap={10}>
        {vaccines.map(v=>(
          <div key={v.k}><FieldLabel>{v.l}</FieldLabel><TglGroup options={["Given","Not given","Unknown"]} value={f[`imm_${v.k}`]||""} onChange={val=>sf(`imm_${v.k}`,val)} /></div>
        ))}
      </AutoGrid>
      <div style={{ marginTop:10 }}><FieldLabel>Immunization Schedule Status</FieldLabel><TglGroup options={["Up to date","Behind schedule","Not immunized","Unknown"]} value={f.imm_status||""} onChange={v=>sf("imm_status",v)} /></div>
      <SubSec>Nutritional / Feeding History</SubSec>
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Feeding Method</FieldLabel><TglGroup options={["Exclusively breastfed","Mixed (breast + formula)","Exclusively formula","Complementary foods (>6mo)","Tube fed"]} value={f.peds_feed_method||""} onChange={v=>sf("peds_feed_method",v)} /></div>
        <div><FieldLabel>Duration of Breastfeeding</FieldLabel><Input value={f.peds_bf_duration||""} onChange={v=>sf("peds_bf_duration",v)} placeholder="e.g. Still breastfeeding, stopped at 12 months…" /></div>
        <div><FieldLabel>Current Diet</FieldLabel><Textarea value={f.peds_current_diet||""} onChange={v=>sf("peds_current_diet",v)} rows={2} placeholder="Balanced diet? Food variety, main staples, protein sources…" /></div>
        <div><FieldLabel>Signs of Malnutrition</FieldLabel><TglGroup options={["None suspected","Underweight","Wasting (acute)","Stunting (chronic)","Oedematous malnutrition (Kwashiorkor)"]} value={f.peds_malnut||""} onChange={v=>sf("peds_malnut",v)} /></div>
      </AutoGrid>
      <SubSec>Developmental Milestones</SubSec>
      <Grid cols={2} gap={12}>
        {[{d:"Gross Motor",k:"dev_gross",p:"Rolling, sitting, standing, walking, running…"},{d:"Fine Motor / Vision",k:"dev_fine",p:"Palmar grasp, pincer, scribbling, drawing…"},{d:"Speech / Language",k:"dev_speech",p:"Cooing, babbling, first words, two-word phrases…"},{d:"Social / Personal",k:"dev_social",p:"Social smile, stranger anxiety, parallel play…"}].map(x=>(
          <div key={x.k} style={{ background:DS.navyMid, border:`1px solid ${DS.navyBorder}`, borderRadius:8, padding:"13px 15px" }}>
            <div style={{ fontSize:10, fontWeight:700, color:DS.teal, textTransform:"uppercase", marginBottom:6 }}>{x.d}</div>
            <Textarea value={f[x.k]||""} onChange={v=>sf(x.k,v)} rows={2} placeholder={x.p} />
          </div>
        ))}
      </Grid>
    </Card>
  );
}

// ── PSYCHIATRY SECTIONS ──────────────────────────────────────
function PastPsychSection({ f, sf }) {
  return (
    <Card>
      <SectionHeader icon="🧠" title="Past Psychiatric History" sub="Previous episodes, diagnoses, admissions, and treatment" />
      <AutoGrid min={220} gap={12}>
        <div><FieldLabel>Previous Psychiatric Diagnoses</FieldLabel><Textarea value={f.psych_prev_dx||""} onChange={v=>sf("psych_prev_dx",v)} rows={2} placeholder="Depression, bipolar disorder, schizophrenia, anxiety disorder, PTSD, OCD…" /></div>
        <div><FieldLabel>Previous Psychiatric Admissions</FieldLabel><Textarea value={f.psych_admissions||""} onChange={v=>sf("psych_admissions",v)} rows={2} placeholder="Number, dates, facility, duration, voluntary/involuntary, reason…" /></div>
        <div><FieldLabel>Previous Medications Tried</FieldLabel><Textarea value={f.psych_prev_meds||""} onChange={v=>sf("psych_prev_meds",v)} rows={2} placeholder="Antidepressants, antipsychotics, mood stabilisers — response, side effects…" /></div>
        <div><FieldLabel>Psychotherapy / Talking Therapies</FieldLabel><Textarea value={f.psych_therapy||""} onChange={v=>sf("psych_therapy",v)} rows={2} placeholder="CBT, DBT, IPT, supportive therapy, family therapy…" /></div>
        <div><FieldLabel>Compliance with Treatment</FieldLabel><TglGroup options={["Good","Partial","Poor","Refused treatment"]} value={f.psych_compliance||""} onChange={v=>sf("psych_compliance",v)} /></div>
        <div>
          <FieldLabel>Suicide Attempts / Self-Harm History</FieldLabel>
          <TglGroup options={["None","Ideation only (past)","Deliberate self-harm","1 attempt","Multiple attempts"]} value={f.psych_prev_attempt||""} onChange={v=>sf("psych_prev_attempt",v)} />
          {f.psych_prev_attempt && f.psych_prev_attempt !== "None" && <Textarea value={f.psych_prev_attempt_detail||""} onChange={v=>sf("psych_prev_attempt_detail",v)} rows={2} placeholder="Method, circumstances, medical intervention required, precipitants…" />}
        </div>
      </AutoGrid>
    </Card>
  );
}

function SubstanceSection({ f, sf }) {
  const substances = [{id:"alcohol",label:"Alcohol"},{id:"cannabis",label:"Cannabis / Marijuana"},{id:"opioids",label:"Opioids (heroin, codeine)"},{id:"stimulants",label:"Stimulants (cocaine, khat, amphetamines)"},{id:"benzodiaz",label:"Benzodiazepines / Sedatives"},{id:"inhalants",label:"Inhalants / Solvents"},{id:"tobacco",label:"Tobacco / Nicotine"},{id:"other_sub",label:"Other Substances"}];
  return (
    <Card>
      <SectionHeader icon="🚬" title="Drug & Substance Use History" sub="Current and past use — for each: frequency, amount, duration, dependence features, last use" />
      {substances.map(s=>{
        const used = f[`sub_${s.id}_use`]==="yes";
        return (
          <div key={s.id} style={{ background:used?"rgba(240,82,82,0.05)":DS.navyDeep, border:`1px solid ${used?"rgba(240,82,82,0.2)":DS.navyBorder}`, borderRadius:8, padding:"10px 12px", marginBottom:6, transition:"all .15s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:12, fontWeight:700, color:used?DS.amber:DS.silver, minWidth:180 }}>
                <input type="checkbox" checked={used} onChange={e=>sf(`sub_${s.id}_use`,e.target.checked?"yes":"")} style={{ width:"auto", accentColor:DS.amber }} />
                {s.label}
              </label>
              {used && <TglGroup options={["Current","Past (<12mo)","Remote (>12mo)"]} value={f[`sub_${s.id}_when`]||""} onChange={v=>sf(`sub_${s.id}_when`,v)} />}
            </div>
            {used && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:8 }}>
                <div><FieldLabel>Frequency / Amount</FieldLabel><Input value={f[`sub_${s.id}_freq`]||""} onChange={v=>sf(`sub_${s.id}_freq`,v)} placeholder="Daily, weekly, amount…" /></div>
                <div><FieldLabel>Duration of Use</FieldLabel><Input value={f[`sub_${s.id}_dur`]||""} onChange={v=>sf(`sub_${s.id}_dur`,v)} placeholder="e.g. 5 years" /></div>
                <div><FieldLabel>Dependence Features</FieldLabel><TglGroup options={["Yes","No"]} value={f[`sub_${s.id}_dep`]||""} onChange={v=>sf(`sub_${s.id}_dep`,v)} /></div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ marginTop:10 }}><FieldLabel>Impact of Substance Use on Functioning</FieldLabel><Textarea value={f.sub_impact||""} onChange={v=>sf("sub_impact",v)} rows={2} placeholder="Work, relationships, finances, legal issues, health consequences…" /></div>
    </Card>
  );
}

function PersonalSection({ f, sf }) {
  const fields = [
    {l:"Birth & Early Development",k:"pers_birth",p:"Birth complications, early separations, developmental delays…"},
    {l:"Childhood & Family of Origin",k:"pers_childhood",p:"Parental relationship, siblings, significant losses, trauma, abuse…"},
    {l:"Education",k:"pers_edu",p:"Highest level, academic performance, learning difficulties…"},
    {l:"Occupational History",k:"pers_work",p:"Jobs held, performance, dismissals, unemployment…"},
    {l:"Relationships & Marital History",k:"pers_relation",p:"Significant relationships, marriage, divorce, children…"},
    {l:"Sexual History & Identity",k:"pers_sexual",p:"Orientation, identity, sexual problems, trauma…"},
    {l:"Forensic History",k:"pers_forensic",p:"Arrests, convictions, current legal proceedings, violence…"},
    {l:"Religious / Spiritual Background",k:"pers_religion",p:"Beliefs, community, role of faith in coping…"},
  ];
  return (
    <Card>
      <SectionHeader icon="👤" title="Personal History" sub="Biographical information from birth to present" />
      <Grid cols={2} gap={12}>
        {fields.map(x=>(
          <div key={x.k} style={{ background:DS.navyMid, border:`1px solid ${DS.navyBorder}`, borderRadius:8, padding:"13px 15px" }}>
            <div style={{ fontSize:10, fontWeight:700, color:DS.teal, textTransform:"uppercase", marginBottom:6 }}>{x.l}</div>
            <Textarea value={f[x.k]||""} onChange={v=>sf(x.k,v)} rows={2} placeholder={x.p} />
          </div>
        ))}
      </Grid>
      <div style={{ marginTop:10 }}>
        <FieldLabel>Premorbid Personality</FieldLabel>
        <Textarea value={f.pers_premorbid||""} onChange={v=>sf("pers_premorbid",v)} rows={3} placeholder="How was the patient before they became unwell? Describe their usual character, coping style, relationships, temperament, strengths, vulnerabilities…" />
      </div>
    </Card>
  );
}

function PremorbidSection({ f, sf }) {
  return (
    <Card>
      <SectionHeader icon="🧩" title="Premorbid Personality" sub="Character before illness — collateral history valuable here" />
      <Textarea value={f.premorbid||""} onChange={v=>sf("premorbid",v)} rows={5} placeholder="Describe the patient's personality before the current illness: character traits, temperament, coping style, quality of relationships, hobbies/interests, work ethic, emotional regulation, resilience. Ask a collateral informant if possible." />
    </Card>
  );
}

function MSESection({ f, sf }) {
  return (
    <Card glow>
      <SectionHeader icon="🔬" title="Mental State Examination (MSE)" sub="Systematic assessment of current mental state" />
      {MSE_DOMAINS.map(d => (
        <div key={d.id} style={{ background:DS.navyMid, border:`1px solid ${DS.navyBorder}`, borderRadius:8, padding:"13px 15px", marginBottom:10 }}>
          <div style={{ fontSize:10, fontWeight:700, color:DS.purple, textTransform:"uppercase", marginBottom:6 }}>{d.label}</div>
          <Textarea value={f[`mse_${d.id}`]||""} onChange={v=>sf(`mse_${d.id}`,v)} rows={2} placeholder={d.placeholder} />
        </div>
      ))}
      <SubSec>Cognitive Screening Scores</SubSec>
      <AutoGrid min={175} gap={10}>
        {[{k:"cog_mmse",l:"MMSE Score",p:"/30 score…"},{k:"cog_moca",l:"MoCA Score",p:"/30 score…"},{k:"cog_ace",l:"ACE-III Score",p:"/100 score…"},{k:"cog_orientation",l:"Orientation",p:"Person / Place / Time…"}].map(x =>
          <div key={x.k}><FieldLabel>{x.l}</FieldLabel><Input value={f[x.k]||""} onChange={v=>sf(x.k,v)} placeholder={x.p} /></div>
        )}
      </AutoGrid>
    </Card>
  );
}

function RiskSection({ f, sf }) {
  return (
    <Card danger>
      <SectionHeader icon="⚠️" title="Risk Assessment" badge="Critical" sub="Structured risk assessment — must be completed for all psychiatric patients" />
      <AlertBox type="red" icon="🚨">If immediate risk is identified — activate emergency protocols, do not leave patient alone, alert senior.</AlertBox>
      <SubSec>Suicidal Ideation & Intent</SubSec>
      {[
        {label:"Current suicidal ideation", k:"risk_si", opts:["None","Passive ideation","Active ideation without plan","Active ideation with plan","Active ideation with intent","Imminent risk"]},
        {label:"Means / access to method", k:"risk_si_access", opts:["No access","Limited access","Access available","Immediate access"]},
      ].map(row => (
        <div key={row.k} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:`1px solid ${DS.navyBorder}`, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:DS.silver, minWidth:180 }}>{row.label}</span>
          <TglGroup options={row.opts} value={f[row.k]||""} onChange={v=>sf(row.k,v)} />
        </div>
      ))}
      <div style={{ padding:"6px 0", borderBottom:`1px solid ${DS.navyBorder}` }}>
        <span style={{ fontSize:11, color:DS.silver, display:"block", marginBottom:4 }}>Method / plan described</span>
        <Input value={f.risk_si_plan||""} onChange={v=>sf("risk_si_plan",v)} placeholder="Specific method mentioned — assess lethality and access…" />
      </div>
      <div style={{ padding:"6px 0", borderBottom:`1px solid ${DS.navyBorder}` }}>
        <span style={{ fontSize:11, color:DS.silver, display:"block", marginBottom:4 }}>Deterrents from acting</span>
        <Input value={f.risk_si_deterrent||""} onChange={v=>sf("risk_si_deterrent",v)} placeholder="Children, family, religious beliefs, fear of pain…" />
      </div>
      <SubSec>Self-Harm & Violence</SubSec>
      {[
        {label:"Current self-harm behaviour",k:"risk_sh",opts:["None","Urges only","Active self-harm","Escalating self-harm"]},
        {label:"Risk of harm to others",k:"risk_harm_others",opts:["None identified","Low","Moderate","High — specify"]},
        {label:"Identified potential victim(s)",k:"risk_victim",opts:["No","Yes (duty to warn)"]},
      ].map(row => (
        <div key={row.k} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:`1px solid ${DS.navyBorder}`, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:DS.silver, minWidth:180 }}>{row.label}</span>
          <TglGroup options={row.opts} value={f[row.k]||""} onChange={v=>sf(row.k,v)} />
        </div>
      ))}
      <SubSec>Protective Factors & Vulnerability</SubSec>
      {[
        {label:"Social support",k:"risk_support",opts:["Strong support network","Moderate","Minimal","Socially isolated"]},
        {label:"Insight into illness",k:"risk_insight",opts:["Good insight","Partial insight","Poor insight","No insight"]},
        {label:"Safeguarding concerns",k:"risk_safeguard",opts:["None","Yes — children in household","Yes — vulnerable adult","Reported to safeguarding"]},
      ].map(row => (
        <div key={row.k} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:`1px solid ${DS.navyBorder}`, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:DS.silver, minWidth:180 }}>{row.label}</span>
          <TglGroup options={row.opts} value={f[row.k]||""} onChange={v=>sf(row.k,v)} />
        </div>
      ))}
      <SubSec>Overall Risk Rating</SubSec>
      <div style={{ display:"flex", gap:10 }}>
        {[{l:"Low",d:"No current intent, protective factors present",c:DS.green},{l:"Moderate",d:"Ideation present, some plan, monitoring needed",c:DS.amber},{l:"High",d:"Active intent/plan, requires immediate action",c:DS.red},{l:"Imminent",d:"Requires emergency intervention now",c:"#ff3b30"}].map(r => (
          <button key={r.l} onClick={()=>sf("risk_overall",r.l)} style={{ flex:1, padding:10, borderRadius:8, border:`2px solid ${f.risk_overall===r.l?r.c:DS.navyBorder}`, background:f.risk_overall===r.l?r.c+"22":"transparent", color:f.risk_overall===r.l?r.c:DS.silver, cursor:"pointer", fontFamily:DS.fontBody, fontWeight:700, textAlign:"center", transition:"all .15s" }}>
            <div style={{ fontSize:13 }}>{r.l}</div>
            <div style={{ fontSize:10, opacity:.7, marginTop:3 }}>{r.d}</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop:12 }}>
        <FieldLabel>Risk Formulation & Safety Plan</FieldLabel>
        <Textarea value={f.risk_formulation||""} onChange={v=>sf("risk_formulation",v)} rows={4} placeholder="Risk formulation: [patient name] is at [low/moderate/high] risk of [suicide/self-harm/harm to others] because [predisposing, precipitating, perpetuating factors]…" />
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ROUTER
// ─────────────────────────────────────────────────────────────────────────────
function SectionRouter({ sectionId, deptId, f, sf, name, obgynMode, setObgynMode }) {
  switch (sectionId) {
  case"cc":
  if (deptId === "obgyn") {
    return (
      <>
        {obgynMode === "Obstetrics"
          ? <ObstetricSummaryPanel f={f} />
          : <GynecologySummaryPanel f={f} />
        }
        <CCSection f={f} sf={sf} />
      </>
    );
  }
  return <CCSection f={f} sf={sf} />;
    case "hpi": return <HPISection f={f} sf={sf} deptId={deptId} />;
    case "pmh": return <PMHSection f={f} sf={sf} />;
    case "psh": return <PSHSection f={f} sf={sf} />;
    case "drugs": return <DrugsSection f={f} sf={sf} />;
    case "family": return <FamilySection f={f} sf={sf} />;
    case "social": return <SocialSection f={f} sf={sf} deptId={deptId} />;
    case "ros": return <ROSSection f={f} sf={sf} />;
    case "sumhist": return <SumHistSection f={f} sf={sf} />;
    case "genexam":
    case "physexam": return <GenExamSection f={f} sf={sf} deptId={deptId} />;
    case "systemic": return <SystemicSection f={f} sf={sf} />;
    case "assessment": return <AssessmentSection f={f} sf={sf} deptId={deptId} name={name} />;
    case "plan": return <PlanSection f={f} sf={sf} deptId={deptId} />;
    case "obgyn_tab": return <ObgynTabSection obgynMode={obgynMode} setObgynMode={setObgynMode} />;
    case "obstetric": return <ObstetricSection f={f} sf={sf} obgynMode={obgynMode} />;
case "menstrual": return <MenstrualSection f={f} sf={sf} />;
    case "gynhx": return <GynHxSection f={f} sf={sf} />;
    case "abdexam": return <AbdExamObgynSection f={f} sf={sf} obgynMode={obgynMode} />;
    case "pelvic": return <PelvicSection f={f} sf={sf} obgynMode={obgynMode} />;
    case "local": return deptId === "ortho" ? <LocalExamOrthoSection f={f} sf={sf} /> : <LocalExamSurgSection f={f} sf={sf} />;
    case "neurovasc": return <NeurovascSection f={f} sf={sf} />;
    case "birth": return <BirthSection f={f} sf={sf} />;
    case "devlp": return <DevSection f={f} sf={sf} />;
    case "maternal": return <MaternalSection f={f} sf={sf} />;
    case "labour": return <LabourSection f={f} sf={sf} />;
    case "neonatal": return <NeonatalSection f={f} sf={sf} />;
    case "past_psych": return <PastPsychSection f={f} sf={sf} />;
    case "substance": return <SubstanceSection f={f} sf={sf} />;
    case "personal": return <PersonalSection f={f} sf={sf} />;
    case "premorbid": return <PremorbidSection f={f} sf={sf} />;
    case "mse": return <MSESection f={f} sf={sf} />;
    case "risk": return <RiskSection f={f} sf={sf} />;
    default: return <Card><p style={{ color: DS.muted }}>Section: {sectionId} (coming soon)</p></Card>;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT – FULLY SCROLLABLE (NO SIDEBAR)
// ─────────────────────────────────────────────────────────────────────────────
export default function HistoryExaminationEngine({ patient, doctorId, doctorName, onSave, onClinicalDataUpdate }) {
  // Biodata state
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [ageUnit, setAgeUnit] = useState("years");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [hospitalNum, setHospitalNum] = useState("");
  const [manualDept, setManualDept] = useState(null);
  const [obgynMode, setObgynMode] = useState("Gynecology");
   const [showPDF, setShowPDF] = useState(false); 

  // Form data object
  const [f, setF] = useState({});
  const sf = useCallback((k, v) => setF(prev => ({ ...prev, [k]: v })), []);

  // Compute age in years for department detection
  const ageYears = useMemo(() => {
    if (dob) {
      const d = new Date(dob), n = new Date();
      let a = n.getFullYear() - d.getFullYear();
      const m = n.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
      return a;
    }
    const a = parseFloat(age);
    if (isNaN(a)) return null;
    if (ageUnit === "years") return a;
    if (ageUnit === "months") return a / 12;
    if (ageUnit === "weeks") return a / 52;
    if (ageUnit === "days") return a / 365;
    if (ageUnit === "hours") return a / 8760;
    return a;
  }, [dob, age, ageUnit]);

  const autoDept = useMemo(() => detectDept(age || (ageYears !== null ? String(ageYears) : ""), ageUnit, gender), [age, ageUnit, gender, ageYears]);
  const dept = manualDept || autoDept;
  const sections = DEPT_SECTIONS[dept] || DEPT_SECTIONS.imed;

  const handleSetDept = (id) => {
    if (id === autoDept) setManualDept(null);
    else setManualDept(id);
  };

  // Completion progress
  const totalDone = sections.filter(s => {
    if (s.id === "biodata") return !!(name && gender);
    return isSectionDone(s.id, f);
  }).length;
  const pct = Math.round((totalDone / sections.length) * 100);

  // Save simulation (replace with Firestore)
  const [saveStatus, setSaveStatus] = useState("");
  const handleSave = () => {
    setSaveStatus("Saved ✓");
    setTimeout(() => setSaveStatus(""), 3000);
    if (onSave) onSave();
  };

  // Format age display
  const formatAge = () => {
    if (ageYears === null) return "";
    if (ageUnit === "hours") return `${age} hours old`;
    if (ageUnit === "days") return `${age} days old`;
    if (ageUnit === "weeks") return `${age} weeks old`;
    if (ageUnit === "months") return `${age} months old`;
    if (ageYears < 1) return `${Math.round(ageYears * 12)} months old`;
    return `${Math.round(ageYears)} years old`;
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: DS.navy, padding: "20px 24px 100px", fontFamily: DS.fontBody }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DS.navyBorder}; border-radius: 4px; }
        input[type=range] { accent-color: ${DS.teal}; }
        input[type=checkbox] { accent-color: ${DS.teal}; }
      `}</style>

      {/* Header with progress */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${DS.navyBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{DEPARTMENTS.find(d=>d.id===dept)?.icon}</span>
          <div>
            <div style={{ fontFamily: DS.fontMono, fontSize: 17, fontWeight: 500, color: DS.teal }}>{DEPARTMENTS.find(d=>d.id===dept)?.label}</div>
            <div style={{ fontSize: 11, color: DS.muted }}>{name || "New Patient"}{ageYears !== null ? ` · ${formatAge()}` : ""}</div>
          </div>
          {!manualDept && ageYears !== null && (
            <span style={{ background: DS.amberDim, color: DS.amber, border: `1px solid rgba(246,194,49,0.35)`, borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 8px" }}>⚡ Auto-detected</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: DS.muted }}>{totalDone}/{sections.length} sections completed</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: DS.navyBorder, borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: "100%", background: DS.teal, borderRadius: 2, width: `${pct}%`, transition: "width .3s ease" }} />
      </div>

      {/* Render all sections in order (no sidebar) */}
      {sections.map(section => (
        <div key={section.id} style={{ marginBottom: 16 }}>
          {section.id === "biodata" ? (
            <BiodataSection
              f={f} sf={sf}
              name={name} dob={dob} age={age} ageUnit={ageUnit} gender={gender}
              hospitalNum={hospitalNum} phone={phone} occupation={occupation}
              autoDept={autoDept} manualDept={manualDept} dept={dept} ageYears={ageYears}
              onNameChange={setName} onDobChange={v=>{setDob(v);setAge("");}} onAgeChange={v=>{setAge(v);setDob("");}}
              onAgeUnitChange={setAgeUnit} onGenderChange={setGender} onSetDept={handleSetDept}
            />
          ) : (
            <SectionRouter
              sectionId={section.id}
              deptId={dept}
              f={f}
              sf={sf}
              name={name}
              obgynMode={obgynMode}
              setObgynMode={setObgynMode}
            />
          )}
        </div>
      ))}
{/* Fixed Save Bar */}
       <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(12,30,45,0.97)", backdropFilter: "blur(14px)",
        borderTop: `1px solid ${DS.navyBorder}`, padding: "10px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: (f.cc_list||[]).some(c=>c.symptom) ? DS.teal : DS.muted }}><span>{(f.cc_list||[]).some(c=>c.symptom) ? "✓" : "○"}</span><span>Chief Complaint</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: (f.vitals?.pulse || f.vitals?.bp) ? DS.teal : DS.muted }}><span>{(f.vitals?.pulse || f.vitals?.bp) ? "✓" : "○"}</span><span>Vitals</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: (f.imp_list||[]).some(i=>i) ? DS.teal : DS.muted }}><span>{(f.imp_list||[]).some(i=>i) ? "✓" : "○"}</span><span>Impression</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: (f.plan_invx_urgent || f.plan_meds || f.plan_bio) ? DS.teal : DS.muted }}><span>{(f.plan_invx_urgent || f.plan_meds || f.plan_bio) ? "✓" : "○"}</span><span>Plan</span></div>
          {saveStatus && <span style={{ fontSize: 10, color: DS.teal }}>{saveStatus}</span>}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => window.print()} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: DS.fontBody, background: "transparent", color: DS.teal, border: `1px solid ${DS.navyBorder}` }}>🖨 Print</button>
          <button onClick={() => setShowPDF(true)} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: DS.fontBody, background: DS.purple, color: "#07111c", border: "none" }}>📄 Generate PDF</button>
          <button onClick={handleSave} style={{ padding: "9px 22px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: DS.fontBody, background: DS.green, color: "#07111c", border: "none" }}>✓ Save & Sign Assessment</button>
        </div>
      </div>
  

      {/* PDF OVERLAY — ADD THIS BLOCK RIGHT HERE, after the save bar div, before the closing </div> of the main return */}
      {showPDF && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#0a1929", overflowY: "auto" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #1a3549", display: "flex", alignItems: "center", gap: 12, background: "rgba(12,30,45,0.98)" }}>
            <button onClick={() => setShowPDF(false)} style={{ padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: "transparent", color: "#0ed2c0", border: "1px solid #1a3549" }}>← Back to Form</button>
            <span style={{ fontSize: 13, color: "#6a8499" }}>Clinical PDF Generator — {name || "Patient"}</span>
          </div>
          <AMEXANPDFGenerator
            patientData={{ ...f, name, age, ageUnit, gender, hospitalNum, phone, occupation, dept }}
          />
        </div>
      )}

    </div> 
  ) 
}