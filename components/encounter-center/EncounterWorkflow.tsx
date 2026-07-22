"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import "../../app/encounter-center/clinical-design.css"
import { evaluateAllRules, toActivatedContext, createDefaultRuleRegistry, buildRuleContext } from "@/lib/amexan/crl"
import type { ActivatedContext } from "@/lib/amexan/crl/types"
import { computeDdxUpdate } from "@/lib/amexan/reasoning/bayesianEngine"
import { ABDOMINAL_PAIN_DISEASE_MAP } from "@/lib/amexan/knowbase/diseases/abdominalPainNodes"
import { EXTENDED_DISEASE_MAP } from "@/lib/amexan/knowbase/diseases/nodes/index"
import { FEATURES } from "@/lib/amexan/knowbase/features/featureLibrary"
import type { AnswerRecord, CandidateDiseaseState } from "@/lib/amexan/knowbase/diseaseNode"
import { encounterApi, sessionApi, CLINICIAN_ROLES, ROLE_PERMISSIONS, DEPARTMENTS, FACILITIES } from "@/lib/api/encounterApi"
import type { ClinicianRoleId } from "@/lib/api/encounterApi"
import {
  createHpiEngine, addChiefComplaint, addAssociatedSymptom,
  recordAnswerAndAdvance, advanceStage, getEngineOutput, getTemplate,
} from "@/lib/history-engine/hpi-engine"
import type { HpiState, HpiEngineOutput, SymptomCategory, DifferentialDiagnosis, TimelineEvent } from "@/lib/history-engine/hpi-engine"

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Universal Encounter Workflow — Complete Clinical Data Entry
// ═══════════════════════════════════════════════════════════════════════════════
// Zero mock data. Every entry begins with the user. Full workflow from
// registration through to documentation generation.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Workflow Definition ────────────────────────────────────────────────────

type WorkflowStep =
  | "registration" | "chief_complaint" | "hpi" | "pmh" | "drug_history"
  | "social_history" | "ros" | "examination" | "investigations" | "diagnosis"
  | "management" | "documentation" | "complete"

const WORKFLOW: { id: WorkflowStep; label: string; icon: string }[] = [
  { id: "registration", label: "Registration", icon: "📋" },
  { id: "chief_complaint", label: "Chief Complaint", icon: "💬" },
  { id: "hpi", label: "HPI", icon: "🔍" },
  { id: "pmh", label: "Past History", icon: "📜" },
  { id: "drug_history", label: "Medications", icon: "💊" },
  { id: "social_history", label: "Social", icon: "👤" },
  { id: "ros", label: "ROS", icon: "🔄" },
  { id: "examination", label: "Examination", icon: "🩺" },
  { id: "investigations", label: "Investigations", icon: "🔬" },
  { id: "diagnosis", label: "Diagnosis", icon: "🎯" },
  { id: "management", label: "Management", icon: "📋" },
  { id: "documentation", label: "Documentation", icon: "📄" },
]

function generateId(): string { return `${Date.now()}-${Math.random().toString(36).slice(2,8)}` }

// ── Patient Biodata ──────────────────────────────────────────────────────

interface Biodata {
  name: string; age: string; ageUnit: "years" | "months" | "days"
  sex: "" | "male" | "female"; residence: string; occupation: string
  informant: string; informantRelation: string; phone: string; nextOfKin: string
}

// ── Chief Complaint ──────────────────────────────────────────────────────

interface Complaint {
  id: string; text: string; concept: string; bodySystem: string
  onset: string; duration: string; severity: number; durationUnit: string
  createdAt: number
}

// ── HPI Fields ──────────────────────────────────────────────────────────

interface HpiField {
  id: string; label: string; type: "text" | "select" | "boolean" | "number"
  options?: string[]; condition?: string; tier?: 1 | 2 | 3 | 4
}

// ── Abdominal Pain HPI Schema (SOCRATES + associated) ───────────────────

const ABD_PAIN_HPI: HpiField[] = [
  { id: "red_flag_syncope", label: "Has the patient collapsed or fainted?", type: "boolean", tier: 1 },
  { id: "red_flag_bleeding", label: "Any GI bleeding (hematemesis/melena)?", type: "boolean", tier: 1 },
  { id: "red_flag_peritonitis", label: "Is the abdomen rigid or board-like?", type: "boolean", tier: 1 },
  { id: "pain_location", label: "Where is the pain?", type: "select", options: ["Right upper quadrant","Left upper quadrant","Right lower quadrant","Left lower quadrant","Epigastric","Periumbilical","Suprapubic","Generalized"], tier: 2 },
  { id: "pain_onset", label: "When did the pain start?", type: "select", options: ["Sudden (<1 hr)","Gradual (hours)","Gradual (days)","Intermittent weeks"], tier: 2 },
  { id: "pain_duration", label: "How long has the pain lasted?", type: "text", tier: 2 },
  { id: "pain_character", label: "Character of the pain?", type: "select", options: ["Dull ache","Sharp/stabbing","Colicky","Burning","Cramping","Tearing"], tier: 2 },
  { id: "pain_severity", label: "Severity (0-10)", type: "number", tier: 2 },
  { id: "pain_radiation", label: "Does the pain radiate?", type: "select", options: ["No radiation","To back","To right shoulder","To groin","To chest"], tier: 2 },
  { id: "pain_progression", label: "How has it progressed?", type: "select", options: ["Worsening","Improving","Constant","Waxing/waning","Migrating"], tier: 2 },
  { id: "pain_timing", label: "Constant or intermittent?", type: "select", options: ["Constant","Intermittent","Colicky"], tier: 2 },
  { id: "pain_aggravating", label: "What makes it worse?", type: "select", options: ["Movement","Eating","Deep breathing","Coughing","Nothing specific"], tier: 3 },
  { id: "pain_relieving", label: "What makes it better?", type: "select", options: ["Rest","Knees to chest","Passing stool","Medication","Nothing"], tier: 3 },
  { id: "nausea_vomiting", label: "Nausea or vomiting?", type: "boolean", tier: 3 },
  { id: "vomit_character", label: "If vomiting: character?", type: "select", options: ["Undigested food","Bilious","Bloody","Feculent","Projectile","N/A"], tier: 3 },
  { id: "appetite", label: "Appetite change?", type: "select", options: ["Normal","Reduced","Absent","Increased"], tier: 3 },
  { id: "bowel_habits", label: "Change in bowel habits?", type: "select", options: ["No change","Constipation","Diarrhea","Blood in stool","Mucous"], tier: 3 },
  { id: "urinary_symptoms", label: "Urinary symptoms?", type: "select", options: ["None","Dysuria","Frequency","Hematuria","Retention"], tier: 3 },
  { id: "gynecological", label: "(If female) Vaginal bleeding or discharge?", type: "boolean", tier: 3 },
  { id: "fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "previous_episodes", label: "Happened before?", type: "boolean", tier: 3 },
  { id: "previous_treatment", label: "Treatment tried so far?", type: "text", tier: 4 },
  { id: "functional_impact", label: "Impact on daily activities?", type: "text", tier: 4 },
  { id: "patient_concerns", label: "Patient's main concern?", type: "text", tier: 4 },
]

// ── Chest Pain HPI Schema ───────────────────────────────────────────────

const CHEST_PAIN_HPI: HpiField[] = [
  { id: "red_flag_collapse", label: "Collapse/syncope?", type: "boolean", tier: 1 },
  { id: "red_flag_hypoxia", label: "Oxygen saturation <94%?", type: "boolean", tier: 1 },
  { id: "red_flag_ecg", label: "ECG changes known?", type: "boolean", tier: 1 },
  { id: "cp_location", label: "Location?", type: "select", options: ["Central chest","Left chest","Right chest","Retrosternal","Left arm","Epigastric"], tier: 2 },
  { id: "cp_onset", label: "Onset?", type: "select", options: ["Sudden","Gradual","Exertional","At rest"], tier: 2 },
  { id: "cp_character", label: "Character?", type: "select", options: ["Crushing","Sharp","Burning","Tightness","Stabbing","Dull"], tier: 2 },
  { id: "cp_severity", label: "Severity (0-10)", type: "number", tier: 2 },
  { id: "cp_radiation", label: "Radiation?", type: "select", options: ["No radiation","Left arm","Jaw","Back","Right arm","Epigastric"], tier: 2 },
  { id: "cp_exertional", label: "Brought on by exertion?", type: "boolean", tier: 2 },
  { id: "cp_pleuritic", label: "Worse with breathing/cough?", type: "boolean", tier: 2 },
  { id: "cp_positional", label: "Worse lying flat?", type: "boolean", tier: 3 },
  { id: "cp_relieved_gtn", label: "Relieved by GTN?", type: "boolean", tier: 3 },
  { id: "cp_associated", label: "Associated symptoms?", type: "select", options: ["None","Nausea","Sweating","SOB","Palpitations","Dizziness"], tier: 3 },
  { id: "cp_previous", label: "Similar episodes before?", type: "boolean", tier: 3 },
  { id: "cp_history_ihd", label: "Known IHD/angina/MI?", type: "boolean", tier: 3 },
]

// ── Headache HPI Schema ─────────────────────────────────────────────────

const HEADACHE_HPI: HpiField[] = [
  { id: "red_flag_thunderclap", label: "Thunderclap onset (worst ever)?", type: "boolean", tier: 1 },
  { id: "red_flag_neck_stiffness", label: "Neck stiffness?", type: "boolean", tier: 1 },
  { id: "red_flag_focal_neuro", label: "Focal neurological symptoms?", type: "boolean", tier: 1 },
  { id: "red_flag_head_injury", label: "Recent head injury?", type: "boolean", tier: 1 },
  { id: "ha_location", label: "Location?", type: "select", options: ["Unilateral","Bilateral","Frontal","Temporal","Occipital","Generalized","Behind eye"], tier: 2 },
  { id: "ha_onset", label: "Onset?", type: "select", options: ["Sudden","Gradual","Over minutes","On waking"], tier: 2 },
  { id: "ha_character", label: "Character?", type: "select", options: ["Throbbing/pulsating","Tension/pressing","Sharp/stabbing","Dull ache","Band-like"], tier: 2 },
  { id: "ha_severity", label: "Severity (0-10)", type: "number", tier: 2 },
  { id: "ha_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "ha_aura", label: "Aura (visual/other)?", type: "boolean", tier: 3 },
  { id: "ha_photophobia", label: "Photophobia?", type: "boolean", tier: 3 },
  { id: "ha_phonophobia", label: "Phonophobia?", type: "boolean", tier: 3 },
  { id: "ha_nausea", label: "Nausea/vomiting?", type: "boolean", tier: 3 },
  { id: "ha_aggravating", label: "Aggravating factors?", type: "select", options: ["Movement","Light","Sound","Coughing","Straining"], tier: 3 },
  { id: "ha_relieving", label: "Relieving factors?", type: "select", options: ["Rest","Dark room","Sleep","Medication"], tier: 3 },
  { id: "ha_frequency", label: "Frequency?", type: "select", options: ["First episode","Daily","Weekly","Monthly","Few per year"], tier: 3 },
  { id: "ha_medication", label: "Medication use for headache?", type: "text", tier: 4 },
]

// ── Cough HPI Schema ────────────────────────────────────────────────────

const COUGH_HPI: HpiField[] = [
  { id: "red_flag_hemoptysis", label: "Hemoptysis (coughing blood)?", type: "boolean", tier: 1 },
  { id: "red_flag_stridor", label: "Stridor?", type: "boolean", tier: 1 },
  { id: "red_flag_cyanosis", label: "Cyanosis?", type: "boolean", tier: 1 },
  { id: "cough_duration", label: "Duration?", type: "select", options: ["<1 week","1-3 weeks",">3 weeks","Chronic"] , tier: 2 },
  { id: "cough_character", label: "Character?", type: "select", options: ["Dry","Productive","Barking","Paroxysmal","Whooping"], tier: 2 },
  { id: "cough_sputum_color", label: "Sputum color?", type: "select", options: ["None","Clear","White","Yellow","Green","Rusty","Blood-stained"], tier: 2 },
  { id: "cough_sputum_volume", label: "Sputum volume?", type: "select", options: ["Minimal","Moderate","Profuse"], tier: 2 },
  { id: "cough_timing", label: "When does it occur?", type: "select", options: ["Throughout day","Night only","Morning only","After meals","On exertion"], tier: 2 },
  { id: "cough_fever", label: "Associated fever?", type: "boolean", tier: 3 },
  { id: "cough_sob", label: "Shortness of breath?", type: "boolean", tier: 3 },
  { id: "cough_wheeze", label: "Wheezing?", type: "boolean", tier: 3 },
  { id: "cough_chest_pain", label: "Chest pain?", type: "boolean", tier: 3 },
  { id: "cough_nasal", label: "Nasal congestion/runny nose?", type: "boolean", tier: 3 },
  { id: "cough_sore_throat", label: "Sore throat?", type: "boolean", tier: 3 },
  { id: "cough_previous_tx", label: "Treatment tried?", type: "text", tier: 4 },
]

// ── Fever HPI Schema ────────────────────────────────────────────────────

const FEVER_HPI: HpiField[] = [
  { id: "red_flag_rigors", label: "Rigors (severe shaking chills)?", type: "boolean", tier: 1 },
  { id: "red_flag_altered_consciousness", label: "Altered consciousness?", type: "boolean", tier: 1 },
  { id: "red_flag_petechiae", label: "Petechiae/purpura?", type: "boolean", tier: 1 },
  { id: "fever_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "fever_pattern", label: "Pattern?", type: "select", options: ["Continuous","Intermittent","Remittent","Relapsing","Undulant"], tier: 2 },
  { id: "fever_highest_temp", label: "Highest temperature recorded?", type: "text", tier: 2 },
  { id: "fever_measured", label: "How was temperature measured?", type: "select", options: ["Oral","Axillary","Tympanic","Forehead","Not measured"], tier: 2 },
  { id: "fever_night_sweats", label: "Night sweats?", type: "boolean", tier: 3 },
  { id: "fever_response", label: "Response to antipyretics?", type: "select", options: ["Good","Partial","None","Not tried"], tier: 3 },
  { id: "fever_source", label: "Any localizing symptoms?", type: "select", options: ["None","Cough","Dysuria","Diarrhea","Sore throat","Joint pain","Headache","Rash"], tier: 3 },
  { id: "fever_travel", label: "Recent travel?", type: "text", tier: 3 },
  { id: "fever_exposure", label: "Sick contacts/exposure?", type: "text", tier: 4 },
  { id: "fever_medication", label: "Medication taken?", type: "text", tier: 4 },
]

// ── Dyspnea HPI Schema ──────────────────────────────────────────────────

const DYSPNEA_HPI: HpiField[] = [
  { id: "red_flag_stridor", label: "Stridor?", type: "boolean", tier: 1 },
  { id: "red_flag_cyanosis", label: "Cyanosis?", type: "boolean", tier: 1 },
  { id: "red_flag_silent_chest", label: "Silent chest?", type: "boolean", tier: 1 },
  { id: "dyspnea_onset", label: "Onset?", type: "select", options: ["Sudden","Over hours","Over days","Gradual weeks/months"], tier: 2 },
  { id: "dyspnea_severity", label: "Severity?", type: "select", options: ["Mild exertion","Moderate exertion","Minimal exertion","At rest","Unable to complete sentences"], tier: 2 },
  { id: "dyspnea_at_rest", label: "Present at rest?", type: "boolean", tier: 2 },
  { id: "dyspnea_orthopnea", label: "Orthopnea (SOB lying flat)?", type: "boolean", tier: 2 },
  { id: "dyspnea_pnd", label: "Paroxysmal nocturnal dyspnea?", type: "boolean", tier: 2 },
  { id: "dyspnea_wheeze", label: "Wheezing?", type: "boolean", tier: 3 },
  { id: "dyspnea_cough", label: "Cough?", type: "boolean", tier: 3 },
  { id: "dyspnea_chest_pain", label: "Chest pain?", type: "boolean", tier: 3 },
  { id: "dyspnea_palpitations", label: "Palpitations?", type: "boolean", tier: 3 },
  { id: "dyspnea_triggers", label: "Triggers?", type: "select", options: ["None","Exercise","Allergens","Cold air","Emotion","Infection"], tier: 3 },
  { id: "dyspnea_previous", label: "Previous episodes?", type: "boolean", tier: 3 },
]

// ── Nausea/Vomiting HPI Schema ──────────────────────────────────────────

const N_V_HPI: HpiField[] = [
  { id: "red_flag_hematemesis", label: "Hematemesis (vomiting blood)?", type: "boolean", tier: 1 },
  { id: "red_flag_feculent", label: "Feculent vomitus?", type: "boolean", tier: 1 },
  { id: "nv_frequency", label: "Frequency?", type: "select", options: ["Once","2-3 times",">5 times","Continuous"], tier: 2 },
  { id: "nv_timing", label: "Timing relative to meals?", type: "select", options: ["Before meals","After meals","On empty stomach","Unrelated"], tier: 2 },
  { id: "nv_bilious", label: "Bilious (green/yellow)?", type: "boolean", tier: 2 },
  { id: "nv_projectile", label: "Projectile?", type: "boolean", tier: 2 },
  { id: "nv_relief", label: "Relieved by vomiting?", type: "boolean", tier: 3 },
  { id: "nv_abdominal_pain", label: "Associated abdominal pain?", type: "boolean", tier: 3 },
  { id: "nv_fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "nv_diarrhea", label: "Diarrhea?", type: "boolean", tier: 3 },
  { id: "nv_headache", label: "Headache?", type: "boolean", tier: 3 },
  { id: "nv_dizziness", label: "Dizziness/vertigo?", type: "boolean", tier: 3 },
]

// ── Diarrhea HPI Schema ─────────────────────────────────────────────────

const DIARRHEA_HPI: HpiField[] = [
  { id: "red_flag_bloody", label: "Bloody diarrhea?", type: "boolean", tier: 1 },
  { id: "red_flag_dehydration", label: "Signs of severe dehydration?", type: "boolean", tier: 1 },
  { id: "diarrhea_duration", label: "Duration?", type: "select", options: ["<24 hours","1-3 days","3-7 days",">1 week","Chronic"], tier: 2 },
  { id: "diarrhea_frequency", label: "Frequency per day?", type: "text", tier: 2 },
  { id: "diarrhea_character", label: "Character?", type: "select", options: ["Watery","Bloody","Mucoid","Fatty/greasy","Rice water"], tier: 2 },
  { id: "diarrhea_volume", label: "Volume?", type: "select", options: ["Small","Moderate","Large","Profuse"], tier: 2 },
  { id: "diarrhea_nocturnal", label: "Nocturnal diarrhea?", type: "boolean", tier: 3 },
  { id: "diarrhea_abdominal_pain", label: "Abdominal pain?", type: "boolean", tier: 3 },
  { id: "diarrhea_fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "diarrhea_vomiting", label: "Vomiting?", type: "boolean", tier: 3 },
  { id: "diarrhea_travel", label: "Recent travel?", type: "text", tier: 3 },
  { id: "diarrhea_food", label: "Suspected food?", type: "text", tier: 4 },
  { id: "diarrhea_contacts", label: "Similar illness in contacts?", type: "boolean", tier: 3 },
]

// ── Back Pain HPI Schema ────────────────────────────────────────────────

const BACK_PAIN_HPI: HpiField[] = [
  { id: "red_flag_cauda_equina", label: "Cauda equina (saddle anesthesia/retention)?", type: "boolean", tier: 1 },
  { id: "red_flag_trauma", label: "Recent trauma?", type: "boolean", tier: 1 },
  { id: "red_flag_fever_back", label: "Fever with back pain?", type: "boolean", tier: 1 },
  { id: "red_flag_cancer_back", label: "History of cancer?", type: "boolean", tier: 1 },
  { id: "bp_location", label: "Location?", type: "select", options: ["Cervical","Thoracic","Lumbar","Sacral","Generalized"], tier: 2 },
  { id: "bp_onset", label: "Onset?", type: "select", options: ["Sudden","Gradual","After injury","Gradual worsening"], tier: 2 },
  { id: "bp_character", label: "Character?", type: "select", options: ["Dull ache","Sharp","Stabbing","Burning","Aching"], tier: 2 },
  { id: "bp_severity", label: "Severity (0-10)", type: "number", tier: 2 },
  { id: "bp_radiation", label: "Radiation?", type: "select", options: ["No radiation","Down leg(s)","To buttock","To groin"], tier: 2 },
  { id: "bp_movement", label: "Worse with movement?", type: "boolean", tier: 3 },
  { id: "bp_night_pain", label: "Night pain?", type: "boolean", tier: 3 },
  { id: "bp_weakness", label: "Leg weakness/numbness?", type: "boolean", tier: 3 },
  { id: "bp_previous", label: "Previous episodes?", type: "boolean", tier: 3 },
]

// ── Abdominal Distension HPI Schema ─────────────────────────────────────

const DISTENSION_HPI: HpiField[] = [
  { id: "dist_red_flag_perforation", label: "Sudden severe pain with collapse?", type: "boolean", tier: 1 },
  { id: "dist_red_flag_obstruction", label: "Complete constipation + vomiting?", type: "boolean", tier: 1 },
  { id: "dist_onset", label: "Onset?", type: "select", options: ["Sudden (hours)","Gradual (days)","Chronic (weeks)","Intermittent"], tier: 2 },
  { id: "dist_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "dist_progression", label: "Progression?", type: "select", options: ["Worsening","Constant","Waxing/waning","Improving"], tier: 2 },
  { id: "dist_severity", label: "Severity of discomfort (0-10)", type: "number", tier: 2 },
  { id: "dist_location", label: "Location of distension?", type: "select", options: ["Generalized","Upper abdomen","Lower abdomen","Unilateral"], tier: 2 },
  { id: "dist_timing", label: "Timing?", type: "select", options: ["Constant","After meals","Worse in evening","Better after passing stool/flatus"], tier: 2 },
  { id: "dist_pain", label: "Associated abdominal pain?", type: "boolean", tier: 3 },
  { id: "dist_vomiting", label: "Vomiting?", type: "boolean", tier: 3 },
  { id: "dist_constipation", label: "Constipation?", type: "boolean", tier: 3 },
  { id: "dist_flatus", label: "Passing flatus?", type: "select", options: ["Normal","Reduced","Absent","Excessive"], tier: 3 },
  { id: "dist_bowel_sounds", label: "Bowel sounds?", type: "select", options: ["Normal","Increased/tinkling","Reduced","Absent"], tier: 3 },
  { id: "dist_weight_loss", label: "Weight loss?", type: "boolean", tier: 3 },
  { id: "dist_fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "dist_previous", label: "Previous episodes?", type: "boolean", tier: 3 },
  { id: "dist_surgery", label: "Previous abdominal surgery?", type: "boolean", tier: 3 },
  { id: "dist_functional", label: "Impact on daily activities?", type: "text", tier: 4 },
]

// ── Constipation HPI Schema ──────────────────────────────────────────────

const CONSTIPATION_HPI: HpiField[] = [
  { id: "const_red_flag_bleeding", label: "Rectal bleeding?", type: "boolean", tier: 1 },
  { id: "const_red_flag_weight_loss", label: "Unexplained weight loss?", type: "boolean", tier: 1 },
  { id: "const_duration", label: "Duration?", type: "select", options: ["<1 week","1-4 weeks",">1 month","Chronic (>3 months)","Lifelong"], tier: 2 },
  { id: "const_frequency", label: "Bowel frequency?", type: "select", options: ["Daily","Every 2-3 days","Weekly","<1/week","With laxatives only"], tier: 2 },
  { id: "const_stool", label: "Stool consistency?", type: "select", options: ["Hard pellets","Lumpy","Cracked","Soft but infrequent","Normal consistency but strained"], tier: 2 },
  { id: "const_strain", label: "Straining?", type: "boolean", tier: 2 },
  { id: "const_incomplete", label: "Feeling of incomplete evacuation?", type: "boolean", tier: 2 },
  { id: "const_manual", label: "Manual maneuvers needed?", type: "boolean", tier: 2 },
  { id: "const_abdominal_pain", label: "Abdominal pain?", type: "boolean", tier: 3 },
  { id: "const_bloating", label: "Bloating/distension?", type: "boolean", tier: 3 },
  { id: "const_nausea", label: "Nausea?", type: "boolean", tier: 3 },
  { id: "const_laxatives", label: "Laxative use?", type: "text", tier: 3 },
  { id: "const_diet", label: "Dietary fiber intake?", type: "select", options: ["Adequate","Low","Very low","High fiber","Uncertain"], tier: 3 },
  { id: "const_fluid", label: "Fluid intake?", type: "select", options: ["Adequate","Low","Very low"], tier: 3 },
  { id: "const_medications", label: "Constipating medications?", type: "text", tier: 4 },
  { id: "const_previous", label: "Previous investigations?", type: "text", tier: 4 },
]

// ── GI Bleeding HPI Schema ───────────────────────────────────────────────

const GI_BLEEDING_HPI: HpiField[] = [
  { id: "gib_red_flag_massive", label: "Massive hemorrhage (hemodynamic instability)?", type: "boolean", tier: 1 },
  { id: "gib_red_flag_varices", label: "Known varices/cirrhosis?", type: "boolean", tier: 1 },
  { id: "gib_type", label: "Type?", type: "select", options: ["Hematemesis","Melena","Hematochezia","Occult blood","Multiple"], tier: 2 },
  { id: "gib_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "gib_frequency", label: "Frequency?", type: "select", options: ["Single episode","Multiple/day","Daily","Recurrent"], tier: 2 },
  { id: "gib_volume", label: "Estimated volume?", type: "select", options: ["Small streaks","Moderate (<1 cup)","Large (>1 cup)","Profuse"], tier: 2 },
  { id: "gib_hematemesis", label: "Hematemesis character?", type: "select", options: ["Fresh red","Coffee ground","Clots","N/A"], tier: 2 },
  { id: "gib_melena", label: "Melena (black tarry stool)?", type: "boolean", tier: 2 },
  { id: "gib_dizziness", label: "Dizziness/syncope?", type: "boolean", tier: 2 },
  { id: "gib_abdominal_pain", label: "Abdominal pain?", type: "boolean", tier: 3 },
  { id: "gib_nausea", label: "Nausea/vomiting prior to bleed?", type: "boolean", tier: 3 },
  { id: "gib_nsaid", label: "NSAID/aspirin use?", type: "boolean", tier: 3 },
  { id: "gib_alcohol", label: "Alcohol use?", type: "boolean", tier: 3 },
  { id: "gib_anticoagulants", label: "Anticoagulants?", type: "boolean", tier: 3 },
  { id: "gib_previous_bleed", label: "Previous GI bleeding?", type: "boolean", tier: 3 },
  { id: "gib_known_ulcer", label: "Known PUD?", type: "boolean", tier: 3 },
  { id: "gib_dysphagia", label: "Dysphagia?", type: "boolean", tier: 3 },
]

// ── Jaundice HPI Schema ──────────────────────────────────────────────────

const JAUNDICE_HPI: HpiField[] = [
  { id: "j_red_flag_encephalopathy", label: "Hepatic encephalopathy (confusion/coma)?", type: "boolean", tier: 1 },
  { id: "j_red_flag_varices", label: "Variceal bleeding?", type: "boolean", tier: 1 },
  { id: "j_duration", label: "Duration?", type: "select", options: ["<1 week","1-4 weeks",">1 month","Intermittent"], tier: 2 },
  { id: "j_progression", label: "Progression?", type: "select", options: ["Worsening","Stable","Fluctuating","Improving"], tier: 2 },
  { id: "j_color", label: "Severity?", type: "select", options: ["Mild (scleral)","Moderate","Severe","Greenish tinge"], tier: 2 },
  { id: "j_itching", label: "Pruritus?", type: "boolean", tier: 2 },
  { id: "j_urine", label: "Dark urine?", type: "boolean", tier: 2 },
  { id: "j_stool", label: "Pale/clay stool?", type: "boolean", tier: 2 },
  { id: "j_fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "j_abdominal_pain", label: "Abdominal pain?", type: "boolean", tier: 3 },
  { id: "j_nausea", label: "Nausea/vomiting?", type: "boolean", tier: 3 },
  { id: "j_weight_loss", label: "Weight loss?", type: "boolean", tier: 3 },
  { id: "j_alcohol", label: "Alcohol use?", type: "text", tier: 3 },
  { id: "j_medications", label: "Medications (hepatotoxic)?", type: "text", tier: 3 },
  { id: "j_travel", label: "Recent travel?", type: "text", tier: 3 },
  { id: "j_transfusion", label: "Blood transfusion?", type: "boolean", tier: 3 },
  { id: "j_tattoo", label: "Tattoos/piercings?", type: "boolean", tier: 3 },
  { id: "j_jaundice_family", label: "Family history of jaundice?", type: "boolean", tier: 3 },
  { id: "j_pregnancy", label: "Pregnant?", type: "boolean", tier: 3 },
  { id: "j_previous", label: "Previous jaundice episodes?", type: "boolean", tier: 3 },
]

// ── Dysphagia HPI Schema ─────────────────────────────────────────────────

const DYSPHAGIA_HPI: HpiField[] = [
  { id: "dys_red_flag_complete", label: "Complete inability to swallow (including saliva)?", type: "boolean", tier: 1 },
  { id: "dys_red_flag_weight_loss", label: "Significant weight loss?", type: "boolean", tier: 1 },
  { id: "dys_onset", label: "Onset?", type: "select", options: ["Sudden","Gradual","Intermittent","Progressive"], tier: 2 },
  { id: "dys_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "dys_level", label: "Level of obstruction?", type: "select", options: ["Oropharyngeal","Cervical (throat)","Retrosternal","Epigastric","Uncertain"], tier: 2 },
  { id: "dys_solids", label: "Difficulty with solids?", type: "boolean", tier: 2 },
  { id: "dys_liquids", label: "Difficulty with liquids?", type: "boolean", tier: 2 },
  { id: "dys_progression_type", label: "Progression pattern?", type: "select", options: ["Solids > liquids (progressive)","Liquids > solids","Both equally","Intermittent","Paradoxical (liquids worse)"], tier: 2 },
  { id: "dys_pain", label: "Pain on swallowing (odynophagia)?", type: "boolean", tier: 3 },
  { id: "dys_regurgitation", label: "Regurgitation?", type: "boolean", tier: 3 },
  { id: "dys_heartburn", label: "Heartburn?", type: "boolean", tier: 3 },
  { id: "dys_cough", label: "Coughing/choking on swallowing?", type: "boolean", tier: 3 },
  { id: "dys_voice", label: "Voice change?", type: "boolean", tier: 3 },
  { id: "dys_nasal", label: "Nasal regurgitation?", type: "boolean", tier: 3 },
  { id: "dys_globus", label: "Globus sensation?", type: "boolean", tier: 3 },
  { id: "dys_previous", label: "Previous endoscopy?", type: "text", tier: 4 },
]

// ── Dysuria HPI Schema ───────────────────────────────────────────────────

const DYSURIA_HPI: HpiField[] = [
  { id: "dy_red_flag_fever", label: "Fever with rigors?", type: "boolean", tier: 1 },
  { id: "dy_red_flag_flank_pain", label: "Flank pain?", type: "boolean", tier: 1 },
  { id: "dy_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "dy_burning", label: "Burning sensation?", type: "boolean", tier: 2 },
  { id: "dy_frequency", label: "Urinary frequency?", type: "boolean", tier: 2 },
  { id: "dy_urgency", label: "Urgency?", type: "boolean", tier: 2 },
  { id: "dy_hesitancy", label: "Hesitancy?", type: "boolean", tier: 2 },
  { id: "dy_hematuria", label: "Blood in urine?", type: "boolean", tier: 2 },
  { id: "dy_discharge", label: "Urethral discharge?", type: "boolean", tier: 3 },
  { id: "dy_incontinence", label: "Incontinence?", type: "boolean", tier: 3 },
  { id: "dy_nocturia", label: "Nocturia?", type: "text", tier: 3 },
  { id: "dy_previous_uti", label: "Previous UTIs?", type: "boolean", tier: 3 },
  { id: "dy_pregnancy", label: "Pregnant?", type: "boolean", tier: 3 },
  { id: "dy_sexual_history", label: "Recent sexual activity?", type: "boolean", tier: 3 },
  { id: "dy_diabetes", label: "Known diabetes?", type: "boolean", tier: 3 },
]

// ── Vaginal Bleeding HPI Schema ──────────────────────────────────────────

const VAGINAL_BLEEDING_HPI: HpiField[] = [
  { id: "vb_red_flag_shock", label: "Hypovolemic shock (pale, sweaty, dizzy)?", type: "boolean", tier: 1 },
  { id: "vb_red_flag_pregnancy", label: "Known or possible pregnancy?", type: "boolean", tier: 1 },
  { id: "vb_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "vb_amount", label: "Amount?", type: "select", options: ["Spotting","Light (< pad/day)","Moderate (soaking pad)","Heavy (changing hourly)","Profuse"], tier: 2 },
  { id: "vb_timing", label: "Timing?", type: "select", options: ["Related to menses","Intermenstrual","Post-coital","Post-menopausal","During pregnancy","Post-partum"], tier: 2 },
  { id: "vb_clots", label: "Clots?", type: "boolean", tier: 2 },
  { id: "vb_pain", label: "Abdominal/pelvic pain?", type: "boolean", tier: 3 },
  { id: "vb_discharge", label: "Vaginal discharge?", type: "boolean", tier: 3 },
  { id: "vb_itching", label: "Itching?", type: "boolean", tier: 3 },
  { id: "vb_lmp", label: "Last menstrual period?", type: "text", tier: 3 },
  { id: "vb_cycle", label: "Cycle regularity?", type: "select", options: ["Regular","Irregular","Amenorrhea","Post-menopausal"], tier: 3 },
  { id: "vb_pregnancy_test", label: "Pregnancy test done?", type: "boolean", tier: 3 },
  { id: "vb_trauma", label: "Recent trauma?", type: "boolean", tier: 3 },
  { id: "vb_pap_smear", label: "Last pap smear?", type: "text", tier: 4 },
]

// ── Foot/Leg Ulcer (Wound) HPI Schema ────────────────────────────────────

const FOOT_ULCER_HPI: HpiField[] = [
  { id: "fu_red_flag_necrosis", label: "Necrosis/gangrene?", type: "boolean", tier: 1 },
  { id: "fu_red_flag_sepsis", label: "Systemic sepsis (fever, chills)?", type: "boolean", tier: 1 },
  { id: "fu_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "fu_onset", label: "Onset?", type: "select", options: ["After minor injury","Spontaneous","Pressure area","Surgical wound"], tier: 2 },
  { id: "fu_size", label: "Size?", type: "text", tier: 2 },
  { id: "fu_depth", label: "Depth?", type: "select", options: ["Superficial","Deep","To bone","Cavity"], tier: 2 },
  { id: "fu_discharge", label: "Discharge?", type: "select", options: ["None","Serous","Purulent","Bloody","Foul-smelling"], tier: 2 },
  { id: "fu_color", label: "Wound bed color?", type: "select", options: ["Red (granulating)","Yellow (slough)","Black (necrotic)","Mixed"], tier: 2 },
  { id: "fu_pain", label: "Pain?", type: "boolean", tier: 3 },
  { id: "fu_swelling", label: "Surrounding swelling?", type: "boolean", tier: 3 },
  { id: "fu_erythema", label: "Erythema?", type: "boolean", tier: 3 },
  { id: "fu_warmth", label: "Warmth?", type: "boolean", tier: 3 },
  { id: "fu_odor", label: "Odor?", type: "boolean", tier: 3 },
  { id: "fu_diabetes", label: "Known diabetes?", type: "boolean", tier: 3 },
  { id: "fu_pvd", label: "Known peripheral vascular disease?", type: "boolean", tier: 3 },
  { id: "fu_neuropathy", label: "Known neuropathy?", type: "boolean", tier: 3 },
  { id: "fu_sensation", label: "Loss of sensation?", type: "boolean", tier: 3 },
  { id: "fu_pulses", label: "Pedal pulses present?", type: "boolean", tier: 3 },
  { id: "fu_smoking", label: "Smoking?", type: "boolean", tier: 3 },
  { id: "fu_previous_treatment", label: "Previous treatments tried?", type: "text", tier: 4 },
]

// ── Dizziness/Vertigo HPI Schema ─────────────────────────────────────────

const DIZZINESS_HPI: HpiField[] = [
  { id: "dz_red_flag_stroke", label: "Focal neurological deficit (slurred speech, facial droop, weakness)?", type: "boolean", tier: 1 },
  { id: "dz_red_flag_syncope", label: "Syncope/collapse?", type: "boolean", tier: 1 },
  { id: "dz_red_flag_chest_pain", label: "Associated chest pain or palpitations?", type: "boolean", tier: 1 },
  { id: "dz_type", label: "Type of dizziness?", type: "select", options: ["Vertigo (spinning)","Lightheadedness","Imbalance","Presyncope (near-faint)","Uncertain"], tier: 2 },
  { id: "dz_onset", label: "Onset?", type: "select", options: ["Sudden","Gradual","Positional","After head injury"], tier: 2 },
  { id: "dz_duration", label: "Duration of episodes?", type: "select", options: ["Seconds","Minutes","Hours","Days","Continuous"], tier: 2 },
  { id: "dz_frequency", label: "Frequency?", type: "select", options: ["Single episode","Daily","Weekly","Monthly"], tier: 2 },
  { id: "dz_triggers", label: "Triggers?", type: "select", options: ["Position change","Head movement","Standing up","Exercise","Stress","Spontaneous"], tier: 3 },
  { id: "dz_nausea", label: "Nausea/vomiting?", type: "boolean", tier: 3 },
  { id: "dz_nystagmus", label: "Nystagmus?", type: "boolean", tier: 3 },
  { id: "dz_tinnitus", label: "Tinnitus?", type: "boolean", tier: 3 },
  { id: "dz_hearing_loss", label: "Hearing loss?", type: "boolean", tier: 3 },
  { id: "dz_headache", label: "Headache?", type: "boolean", tier: 3 },
  { id: "dz_palpitations", label: "Palpitations?", type: "boolean", tier: 3 },
  { id: "dz_medications", label: "Medications causing dizziness?", type: "text", tier: 4 },
  { id: "dz_previous", label: "Previous evaluation?", type: "text", tier: 4 },
]

// ── Weakness/Fatigue HPI Schema ──────────────────────────────────────────

const WEAKNESS_HPI: HpiField[] = [
  { id: "wk_red_flag_stroke", label: "Sudden unilateral weakness (stroke)?", type: "boolean", tier: 1 },
  { id: "wk_red_flag_guillain", label: "Ascending paralysis?", type: "boolean", tier: 1 },
  { id: "wk_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "wk_onset", label: "Onset?", type: "select", options: ["Sudden","Gradual over days","Gradual over weeks","Progressive months"], tier: 2 },
  { id: "wk_pattern", label: "Pattern?", type: "select", options: ["Generalized","Unilateral","Lower limbs","Upper limbs","Proximal","Distal","Hemiparesis","Paraplegia","Quadriplegia"], tier: 2 },
  { id: "wk_progression", label: "Progression?", type: "select", options: ["Worsening","Improving","Fluctuating","Static"], tier: 2 },
  { id: "wk_associated_symptoms", label: "Associated symptoms?", type: "text", tier: 3 },
  { id: "wk_fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "wk_weight_loss", label: "Weight loss?", type: "boolean", tier: 3 },
  { id: "wk_fatigue", label: "Fatigue?", type: "boolean", tier: 3 },
  { id: "wk_anemia", label: "Known anemia?", type: "boolean", tier: 3 },
  { id: "wk_chronic_disease", label: "Chronic disease (DM, CKD, COPD, HF)?", type: "boolean", tier: 3 },
  { id: "wk_medications", label: "Sedating medications?", type: "text", tier: 4 },
  { id: "wk_sleep", label: "Sleep quality?", type: "select", options: ["Good","Poor","Insomnia","Excessive sleepiness"], tier: 4 },
  { id: "wk_mood", label: "Mood/depression?", type: "boolean", tier: 4 },
]

// ── Skin Rash HPI Schema ─────────────────────────────────────────────────

const RASH_HPI: HpiField[] = [
  { id: "rash_red_flag_stevens_johnson", label: "Blistering, mucosal involvement, fever (SJS/TEN)?", type: "boolean", tier: 1 },
  { id: "rash_red_flag_meningococcal", label: "Non-blanching purpuric rash with fever?", type: "boolean", tier: 1 },
  { id: "rash_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "rash_onset", label: "Onset?", type: "select", options: ["Sudden (hours)","Over days","Gradual weeks","Recurrent"], tier: 2 },
  { id: "rash_location", label: "Location?", type: "select", options: ["Face","Trunk","Limbs","Flexures","Extensors","Generalized","Palms/soles"], tier: 2 },
  { id: "rash_type", label: "Type?", type: "select", options: ["Macular","Papular","Maculopapular","Vesicular","Pustular","Urticarial","Purpuric","Scaling","Erythematous"], tier: 2 },
  { id: "rash_shape", label: "Shape/distribution?", type: "select", options: ["Diffuse","Annular","Linear","Grouped","Confluent","Discrete"], tier: 2 },
  { id: "rash_itching", label: "Itching?", type: "boolean", tier: 3 },
  { id: "rash_pain", label: "Pain/burning?", type: "boolean", tier: 3 },
  { id: "rash_fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "rash_medications", label: "New medications?", type: "text", tier: 3 },
  { id: "rash_allergies", label: "Known allergies?", type: "text", tier: 3 },
  { id: "rash_infectious_contacts", label: "Infectious contacts?", type: "boolean", tier: 3 },
  { id: "rash_travel", label: "Recent travel?", type: "text", tier: 3 },
  { id: "rash_joint_pain", label: "Joint pain?", type: "boolean", tier: 3 },
  { id: "rash_previous", label: "Previous similar rash?", type: "boolean", tier: 3 },
  { id: "rash_treatment", label: "Treatments tried?", type: "text", tier: 4 },
]

// ── Joint Pain HPI Schema ────────────────────────────────────────────────

const JOINT_PAIN_HPI: HpiField[] = [
  { id: "jp_red_flag_septic", label: "Hot, swollen, red single joint with fever (septic arthritis)?", type: "boolean", tier: 1 },
  { id: "jp_red_flag_trauma", label: "Recent trauma with inability to bear weight?", type: "boolean", tier: 1 },
  { id: "jp_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "jp_onset", label: "Onset?", type: "select", options: ["Sudden","Gradual","After injury","Recurrent"], tier: 2 },
  { id: "jp_location", label: "Joints affected?", type: "select", options: ["Single joint","Small joints (hands/feet)","Large joints (knees/hips)","Polyarticular","Axial (spine/SI)"], tier: 2 },
  { id: "jp_distribution", label: "Distribution?", type: "select", options: ["Symmetric","Asymmetric","Migratory","Additive"], tier: 2 },
  { id: "jp_morning_stiffness", label: "Morning stiffness?", type: "select", options: ["None","<30 min",">30 min",">1 hour","All day"], tier: 2 },
  { id: "jp_swelling", label: "Joint swelling?", type: "boolean", tier: 3 },
  { id: "jp_redness", label: "Joint redness/warmth?", type: "boolean", tier: 3 },
  { id: "jp_fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "jp_rash", label: "Rash?", type: "boolean", tier: 3 },
  { id: "jp_eye", label: "Eye symptoms (redness, pain, dryness)?", type: "boolean", tier: 3 },
  { id: "jp_back_pain", label: "Back pain?", type: "boolean", tier: 3 },
  { id: "jp_psoriasis", label: "Psoriasis?", type: "boolean", tier: 3 },
  { id: "jp_gout", label: "Previous gout?", type: "boolean", tier: 3 },
  { id: "jp_functional", label: "Impact on daily activities?", type: "text", tier: 4 },
]

// ── Seizure HPI Schema ───────────────────────────────────────────────────

const SEIZURE_HPI: HpiField[] = [
  { id: "sz_red_flag_status", label: "Prolonged seizure (>5 min) or multiple without recovery?", type: "boolean", tier: 1 },
  { id: "sz_red_flag_head_injury", label: "Head injury with loss of consciousness?", type: "boolean", tier: 1 },
  { id: "sz_type", label: "Seizure type?", type: "select", options: ["Generalized tonic-clonic","Absence","Focal aware","Focal impaired awareness","Myoclonic","Uncertain"], tier: 2 },
  { id: "sz_first", label: "First seizure or recurrent?", type: "select", options: ["First ever","Recurrent","Breakthrough on meds"], tier: 2 },
  { id: "sz_last_seizure", label: "Last seizure?", type: "text", tier: 2 },
  { id: "sz_frequency", label: "Frequency?", type: "text", tier: 2 },
  { id: "sz_triggers", label: "Triggers?", type: "select", options: ["None identified","Sleep deprivation","Fever/illness","Flashing lights","Alcohol withdrawal","Missed medications"], tier: 3 },
  { id: "sz_aura", label: "Aura?", type: "text", tier: 3 },
  { id: "sz_duration", label: "Duration of typical seizure?", type: "text", tier: 3 },
  { id: "sz_post_ictal", label: "Post-ictal state?", type: "select", options: ["Confusion","Sleep","Headache","Focal deficit","None"], tier: 3 },
  { id: "sz_incontinence", label: "Incontinence during seizure?", type: "boolean", tier: 3 },
  { id: "sz_tongue_bite", label: "Tongue biting?", type: "boolean", tier: 3 },
  { id: "sz_medications", label: "Anti-epileptic medications?", type: "text", tier: 3 },
  { id: "sz_compliance", label: "Medication compliance?", type: "select", options: ["Good","Poor","Not on meds"], tier: 3 },
  { id: "sz_driving", label: "Driving?", type: "boolean", tier: 4 },
]

// ── Palpitations HPI Schema ───────────────────────────────────────────────

const PALPITATIONS_HPI: HpiField[] = [
  { id: "pal_red_flag_syncope", label: "Syncope during palpitations?", type: "boolean", tier: 1 },
  { id: "pal_red_flag_chest_pain", label: "Associated chest pain or dyspnea?", type: "boolean", tier: 1 },
  { id: "pal_red_flag_hcm", label: "Family history of sudden cardiac death?", type: "boolean", tier: 1 },
  { id: "pal_duration", label: "Duration?", type: "text", tier: 2 },
  { id: "pal_frequency", label: "Frequency?", type: "select", options: ["Single episode","Daily","Weekly","Monthly","Continuous"], tier: 2 },
  { id: "pal_onset", label: "Onset/offset?", type: "select", options: ["Sudden onset/offset","Gradual onset","Gradual offset","Constant"], tier: 2 },
  { id: "pal_pattern", label: "Pattern?", type: "select", options: ["Regular pounding","Irregular","Rapid fluttering","Skipped beats","Pause sensation"], tier: 2 },
  { id: "pal_triggers", label: "Triggers?", type: "select", options: ["Exercise","Stress/anxiety","Caffeine","Alcohol","Sleep","Rest","Spontaneous"], tier: 3 },
  { id: "pal_dizziness", label: "Dizziness?", type: "boolean", tier: 3 },
  { id: "pal_shortness_breath", label: "Shortness of breath?", type: "boolean", tier: 3 },
  { id: "pal_chest_discomfort", label: "Chest discomfort?", type: "boolean", tier: 3 },
  { id: "pal_thyroid", label: "Thyroid disease?", type: "boolean", tier: 3 },
  { id: "pal_anemia", label: "Anemia?", type: "boolean", tier: 3 },
  { id: "pal_medications", label: "Medications (stimulants, asthma drugs)?", type: "text", tier: 4 },
  { id: "pal_ecg", label: "Previous ECG/rhythm monitoring?", type: "text", tier: 4 },
]

// ── Weight Loss HPI Schema ───────────────────────────────────────────────

const WEIGHT_LOSS_HPI: HpiField[] = [
  { id: "wl_red_flag_malignancy", label: "Rapid weight loss with night sweats, fever (<1yr)?", type: "boolean", tier: 1 },
  { id: "wl_red_flag_dysphagia", label: "Associated dysphagia?", type: "boolean", tier: 1 },
  { id: "wl_amount", label: "Amount lost?", type: "text", tier: 2 },
  { id: "wl_period", label: "Over what period?", type: "text", tier: 2 },
  { id: "wl_intentional", label: "Intentional?", type: "boolean", tier: 2 },
  { id: "wl_appetite", label: "Appetite?", type: "select", options: ["Normal","Reduced","Increased","Erratic"], tier: 2 },
  { id: "wl_diet", label: "Dietary changes?", type: "text", tier: 3 },
  { id: "wl_fever", label: "Fever?", type: "boolean", tier: 3 },
  { id: "wl_night_sweats", label: "Night sweats?", type: "boolean", tier: 3 },
  { id: "wl_diarrhea", label: "Diarrhea/malabsorption?", type: "boolean", tier: 3 },
  { id: "wl_vomiting", label: "Vomiting?", type: "boolean", tier: 3 },
  { id: "wl_dysphagia", label: "Dysphagia?", type: "boolean", tier: 3 },
  { id: "wl_abdominal_pain", label: "Abdominal pain?", type: "boolean", tier: 3 },
  { id: "wl_diabetes", label: "Known diabetes?", type: "boolean", tier: 3 },
  { id: "wl_thyroid", label: "Hyperthyroid symptoms?", type: "boolean", tier: 3 },
  { id: "wl_depression", label: "Depression/anxiety?", type: "boolean", tier: 3 },
  { id: "wl_smoking", label: "Smoking?", type: "boolean", tier: 3 },
  { id: "wl_alcohol", label: "Alcohol?", type: "text", tier: 3 },
]

// ── Trauma HPI Schema ────────────────────────────────────────────────────

const TRAUMA_HPI: HpiField[] = [
  { id: "tr_red_flag_airway", label: "Airway compromise?", type: "boolean", tier: 1 },
  { id: "tr_red_flag_breathing", label: "Breathing difficulty?", type: "boolean", tier: 1 },
  { id: "tr_red_flag_circulation", label: "Signs of shock?", type: "boolean", tier: 1 },
  { id: "tr_red_flag_neuro", label: "GCS < 15 or focal deficit?", type: "boolean", tier: 1 },
  { id: "tr_mechanism", label: "Mechanism of injury?", type: "select", options: ["Blunt","Penetrating","Fall from height","MVC","Stabbing","GSW","Crush","Burn"], tier: 2 },
  { id: "tr_time", label: "Time of injury?", type: "text", tier: 2 },
  { id: "tr_location", label: "Body region affected?", type: "select", options: ["Head","Face","Neck","Chest","Abdomen","Pelvis","Spine","Upper limb","Lower limb","Multiple"], tier: 2 },
  { id: "tr_loss_consciousness", label: "Loss of consciousness?", type: "boolean", tier: 2 },
  { id: "tr_bleeding", label: "External bleeding?", type: "boolean", tier: 2 },
  { id: "tr_pain_location", label: "Pain location?", type: "text", tier: 3 },
  { id: "tr_deformity", label: "Deformity?", type: "boolean", tier: 3 },
  { id: "tr_swelling", label: "Swelling?", type: "boolean", tier: 3 },
  { id: "tr_neurovascular", label: "Neurovascular deficit distal to injury?", type: "boolean", tier: 3 },
  { id: "tr_medications", label: "Anticoagulants?", type: "boolean", tier: 3 },
  { id: "tr_tetanus", label: "Tetanus status?", type: "text", tier: 3 },
  { id: "tr_nil_by_mouth", label: "Last meal/time?", type: "text", tier: 4 },
]

// ── Symptom Schema Registry ─────────────────────────────────────────────

interface SymptomSchema { concept: string; label: string; fields: HpiField[]; bodySystem: string }

const SYMPTOM_SCHEMAS: SymptomSchema[] = [
  { concept: "abdominal_pain", label: "Abdominal Pain", fields: ABD_PAIN_HPI, bodySystem: "digestive" },
  { concept: "chest_pain", label: "Chest Pain", fields: CHEST_PAIN_HPI, bodySystem: "cardiovascular" },
  { concept: "headache", label: "Headache", fields: HEADACHE_HPI, bodySystem: "neurological" },
  { concept: "cough", label: "Cough", fields: COUGH_HPI, bodySystem: "respiratory" },
  { concept: "fever", label: "Fever", fields: FEVER_HPI, bodySystem: "general" },
  { concept: "dyspnea", label: "Shortness of Breath", fields: DYSPNEA_HPI, bodySystem: "respiratory" },
  { concept: "nausea_vomiting", label: "Nausea & Vomiting", fields: N_V_HPI, bodySystem: "digestive" },
  { concept: "diarrhea", label: "Diarrhea", fields: DIARRHEA_HPI, bodySystem: "digestive" },
  { concept: "back_pain", label: "Back Pain", fields: BACK_PAIN_HPI, bodySystem: "musculoskeletal" },
  { concept: "distension", label: "Abdominal Distension", fields: DISTENSION_HPI, bodySystem: "digestive" },
  { concept: "constipation", label: "Constipation", fields: CONSTIPATION_HPI, bodySystem: "digestive" },
  { concept: "gi_bleeding", label: "GI Bleeding", fields: GI_BLEEDING_HPI, bodySystem: "digestive" },
  { concept: "jaundice", label: "Jaundice", fields: JAUNDICE_HPI, bodySystem: "hepatobiliary" },
  { concept: "dysphagia", label: "Dysphagia", fields: DYSPHAGIA_HPI, bodySystem: "digestive" },
  { concept: "dysuria", label: "Dysuria", fields: DYSURIA_HPI, bodySystem: "urinary" },
  { concept: "vaginal_bleeding", label: "Vaginal Bleeding", fields: VAGINAL_BLEEDING_HPI, bodySystem: "reproductive" },
  { concept: "foot_ulcer", label: "Foot/Leg Ulcer", fields: FOOT_ULCER_HPI, bodySystem: "integumentary" },
  { concept: "dizziness", label: "Dizziness/Vertigo", fields: DIZZINESS_HPI, bodySystem: "neurological" },
  { concept: "weakness", label: "Weakness/Fatigue", fields: WEAKNESS_HPI, bodySystem: "general" },
  { concept: "rash", label: "Skin Rash", fields: RASH_HPI, bodySystem: "integumentary" },
  { concept: "joint_pain", label: "Joint Pain", fields: JOINT_PAIN_HPI, bodySystem: "musculoskeletal" },
  { concept: "seizure", label: "Seizure", fields: SEIZURE_HPI, bodySystem: "neurological" },
  { concept: "palpitations", label: "Palpitations", fields: PALPITATIONS_HPI, bodySystem: "cardiovascular" },
  { concept: "weight_loss", label: "Weight Loss", fields: WEIGHT_LOSS_HPI, bodySystem: "general" },
  { concept: "trauma", label: "Trauma/Injury", fields: TRAUMA_HPI, bodySystem: "musculoskeletal" },
]

const CONCEPT_MAP: Record<string, string> = {
  "abdominal pain":"abdominal_pain","stomach pain":"abdominal_pain","belly pain":"abdominal_pain","abdominal cramp":"abdominal_pain",
  "chest pain":"chest_pain","chest discomfort":"chest_pain","retrosternal pain":"chest_pain",
  "headache":"headache","migraine":"headache","head ache":"headache",
  "fever":"fever","hot":"fever","temperature":"fever","pyrexia":"fever","chills":"fever","rigors":"fever",
  "cough":"cough","dry cough":"cough","productive cough":"cough","coughing":"cough",
  "vomiting":"nausea_vomiting","nausea":"nausea_vomiting","sick":"nausea_vomiting","vomit":"nausea_vomiting","throwing up":"nausea_vomiting",
  "diarrhea":"diarrhea","diarrhoea":"diarrhea","loose stools":"diarrhea","watery stool":"diarrhea",
  "rash":"rash","skin rash":"rash","spots":"rash","hives":"rash","blisters":"rash",
  "shortness of breath":"dyspnea","difficulty breathing":"dyspnea","sob":"dyspnea","breathless":"dyspnea","cannot breathe":"dyspnea",
  "dizziness":"dizziness","vertigo":"dizziness","lightheaded":"dizziness","giddiness":"dizziness","spinning":"dizziness",
  "weakness":"weakness","fatigue":"fatigue","tired":"fatigue","lethargy":"weakness","exhausted":"fatigue","malaise":"weakness",
  "weight loss":"weight_loss","losing weight":"weight_loss","lost weight":"weight_loss",
  "back pain":"back_pain","backache":"back_pain","lower back pain":"back_pain",
  "joint pain":"joint_pain","joint ache":"joint_pain","arthritis":"joint_pain","knee pain":"joint_pain",
  "constipation":"constipation","difficulty passing stool":"constipation","hard stool":"constipation",
  "foot ulcer":"foot_ulcer","leg ulcer":"foot_ulcer","wound":"foot_ulcer","sore foot":"foot_ulcer","diabetic foot":"foot_ulcer","pressure sore":"foot_ulcer",
  "injury":"trauma","fall":"trauma","accident":"trauma","hit":"trauma","assault":"trauma","motor vehicle":"trauma","mva":"trauma",
  "bleeding":"gi_bleeding","blood in stool":"gi_bleeding","hematemesis":"gi_bleeding","melena":"gi_bleeding","bloody vomit":"gi_bleeding","black stool":"gi_bleeding",
  "jaundice":"jaundice","yellow":"jaundice","yellow eyes":"jaundice",
  "seizure":"seizure","fit":"seizure","convulsion":"seizure","epilepsy":"seizure","jerking":"seizure",
  "palpitations":"palpitations","heart racing":"palpitations","pounding heart":"palpitations","irregular heartbeat":"palpitations",
  "swollen abdomen":"distension","abdominal distension":"distension","bloating":"distension","belly swelling":"distension","distended":"distension",
  "vaginal bleeding":"vaginal_bleeding","spotting":"vaginal_bleeding","heavy periods":"vaginal_bleeding",
  "dysuria":"dysuria","pain passing urine":"dysuria","burning urine":"dysuria","uti":"dysuria","urinary frequency":"dysuria",
  "dysphagia":"dysphagia","difficulty swallowing":"dysphagia","swallowing problem":"dysphagia","food stuck":"dysphagia","odynophagia":"dysphagia",
  "neck swelling":"neck_swelling","lump in neck":"neck_swelling","goiter":"neck_swelling",
  "ear pain":"ear_pain","ear discharge":"ear_discharge","hearing loss":"hearing_loss",
  "eye pain":"eye_pain","red eye":"red_eye","vision loss":"vision_loss","blurry vision":"vision_loss",
  "sore throat":"sore_throat","throat pain":"sore_throat",
  "runny nose":"runny_nose","nasal congestion":"runny_nose",
  "leg swelling":"leg_swelling","ankle swelling":"leg_swelling","oedema":"leg_swelling",
  "insomnia":"insomnia","difficulty sleeping":"insomnia",
  "crying":"excessive_crying","fussiness":"excessive_crying","irritable":"irritability",
}

function conceptToSymptomCategory(concept: string): SymptomCategory {
  const map: Record<string, SymptomCategory> = {
    abdominal_pain: 'pain', chest_pain: 'cardiac', headache: 'neurological',
    fever: 'fever', cough: 'cough', nausea_vomiting: 'vomiting', diarrhea: 'diarrhea',
    dyspnea: 'dyspnea', rash: 'skin', dizziness: 'neurological', weakness: 'weakness',
    fatigue: 'weakness', weight_loss: 'constitutional', back_pain: 'pain',
    joint_pain: 'pain', constipation: 'constipation', foot_ulcer: 'skin',
    trauma: 'trauma', gi_bleeding: 'bleeding', jaundice: 'other',
    seizure: 'neurological', palpitations: 'cardiac', distension: 'distension',
    vaginal_bleeding: 'bleeding', dysuria: 'urinary', dysphagia: 'other',
  }
  return map[concept] || 'other'
}

const BODY_SYSTEMS: Record<string, string> = {
  abdominal_pain:"digestive", chest_pain:"cardiovascular", headache:"neurological",
  fever:"general", cough:"respiratory", nausea_vomiting:"digestive", diarrhea:"digestive",
  dyspnea:"respiratory", rash:"integumentary", dizziness:"neurological", weakness:"general",
  fatigue:"general", weight_loss:"general", back_pain:"musculoskeletal", joint_pain:"musculoskeletal",
  distension:"digestive", constipation:"digestive", foot_ulcer:"integumentary", wound:"integumentary",
  trauma:"musculoskeletal", vaginal_bleeding:"reproductive", bleeding:"digestive", gi_bleeding:"digestive",
  jaundice:"hepatobiliary", seizure:"neurological", palpitations:"cardiovascular",
  dysuria:"urinary", dysphagia:"digestive", ear_pain:"ent", ear_discharge:"ent",
  hearing_loss:"ent", eye_pain:"ophthalmology", red_eye:"ophthalmology",
  vision_loss:"ophthalmology", sore_throat:"ent", runny_nose:"respiratory",
  leg_swelling:"cardiovascular", neck_swelling:"endocrine",
  insomnia:"psychiatric", excessive_crying:"pediatric", irritability:"neurological",
  odynophagia:"digestive",
}

// ── Data Types for History Steps ────────────────────────────────────────

interface PmhCondition { name: string; year: string; notes: string }
interface Medication { name: string; dose: string; frequency: string; route: string; indication: string }
interface Allergy { allergen: string; reaction: string }
interface RosEntry { system: string; symptom: string; present: boolean | null }
interface Vitals { systolic: string; diastolic: string; heartRate: string; respiratoryRate: string; temperature: string; oxygenSaturation: string; weight: string; height: string; painScore: string }
interface ExamFinding { system: string; finding: string; normal: boolean | null }
interface Investigation { test: string; rationale: string; priority: "routine" | "urgent" | "emergency" }
interface Diagnosis { name: string; type: "working" | "differential" | "danger" | "cannot_miss"; probability: string; evidence: string }
interface ManagementItem { type: "immediate" | "definitive" | "disposition"; action: string }
interface Documentation { hpi: string; soap: string; admissionNote: string; dischargeSummary: string }

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function EncounterWorkflow() {
  const [step, setStep] = useState<WorkflowStep>("registration")
  const [clinicianRole, setClinicianRole] = useState<ClinicianRoleId>("doctor")
  const [selectedFacility, setSelectedFacility] = useState("main-hospital")
  const [selectedDepartment, setSelectedDepartment] = useState("emergency")
  const [showRoleSelector, setShowRoleSelector] = useState(true)
  const [encounterId, setEncounterId] = useState<string | null>(null)
  const lockedRef = useRef<string[]>([])

  // Data stores — all initially empty, no mock data
  const [biodata, setBiodata] = useState<Biodata>({ name:"", age:"", ageUnit:"years", sex:"", residence:"", occupation:"", informant:"", informantRelation:"", phone:"", nextOfKin:"" })
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [complaintInput, setComplaintInput] = useState("")
  const [hpiData, setHpiData] = useState<Record<string,Record<string,string|boolean|number>>>({})
  const [pmh, setPmh] = useState<{ conditions: PmhCondition[]; surgeries: PmhCondition[]; isPregnant: boolean }>({ conditions:[], surgeries:[], isPregnant: false })
  const [drugs, setDrugs] = useState<{ medications: Medication[]; allergies: Allergy[] }>({ medications:[], allergies:[] })
  const [social, setSocial] = useState({ smoking:"", alcohol:"", occupation:"", travel:"", familyHistory:"" })
  const [ros, setRos] = useState<RosEntry[]>([])
  const [vitals, setVitals] = useState<Vitals>({ systolic:"", diastolic:"", heartRate:"", respiratoryRate:"", temperature:"", oxygenSaturation:"", weight:"", height:"", painScore:"" })
  const [examFindings, setExamFindings] = useState<ExamFinding[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [management, setManagement] = useState<ManagementItem[]>([])
  const [documentation, setDocumentation] = useState<Documentation>({ hpi:"", soap:"", admissionNote:"", dischargeSummary:"" })

  // ── HPI Rules Engine ────────────────────────────────────────────
  const hpiEngineRef = useRef<HpiState | null>(null)
  const [hpiOutput, setHpiOutput] = useState<HpiEngineOutput | null>(null)
  const [hpiEngineReady, setHpiEngineReady] = useState(false)

  const stepIndex = WORKFLOW.findIndex(s => s.id === step)

  const canAdvance = useMemo(() => {
    const idx = WORKFLOW.findIndex(s => s.id === step)
    const nextStep = idx < WORKFLOW.length - 1 ? WORKFLOW[idx + 1].id : null
    if (nextStep && lockedRef.current.includes(nextStep)) return false
    switch (step) {
      case "registration": return !!biodata.name && !!biodata.age && !!biodata.sex
      case "chief_complaint": return complaints.length > 0
      case "diagnosis": return diagnoses.some(d => d.type === "working")
      case "management": return management.length > 0
      default: return true
    }
  }, [step, biodata, complaints, diagnoses, management])

  const advance = useCallback(() => {
    const idx = WORKFLOW.findIndex(s => s.id === step)
    if (idx < WORKFLOW.length - 1) {
      const nextStep = WORKFLOW[idx + 1].id
      if (!lockedRef.current.includes(nextStep)) {
        setStep(nextStep)
      }
    }
  }, [step])

  const goBack = useCallback(() => {
    const idx = WORKFLOW.findIndex(s => s.id === step)
    if (idx > 0) setStep(WORKFLOW[idx - 1].id)
  }, [step])

  const skippedRef = useRef<string[]>([])

  // ── Complaints ─────────────────────────────────────────────────────

  const addComplaint = useCallback(() => {
    const text = complaintInput.trim()
    if (!text) return
    const lower = text.toLowerCase()
    let concept = "other"
    for (const [key,val] of Object.entries(CONCEPT_MAP)) { if (lower.includes(key)) { concept = val; break } }
    setComplaints(prev => [...prev, {
      id: generateId(), text, concept,
      bodySystem: BODY_SYSTEMS[concept] || "general",
      onset: "", duration: "", severity: 5, durationUnit: "days",
      createdAt: Date.now(),
    }])
    setComplaintInput("")
  }, [complaintInput])

  const removeComplaint = useCallback((id: string) => {
    setComplaints(prev => prev.filter(c => c.id !== id))
    setHpiData(prev => { const n = {...prev}; delete n[id]; return n })
  }, [])

  const updateHpiField = useCallback((cid: string, fid: string, val: string | boolean | number) => {
    setHpiData(prev => ({ ...prev, [cid]: { ...(prev[cid] || {}), [fid]: val } }))
  }, [])

  // ── Generate Documentation ─────────────────────────────────────────

  const generateDocs = useCallback(() => {
    const ageStr = `${biodata.age} ${biodata.ageUnit}`
    const ccList = complaints.map(c => c.text).join(" and ")

    // ── HPI Narrative ──
    const hpiParts: string[] = []
    const demoLine = `${biodata.name} is a ${ageStr}-old ${biodata.sex}${biodata.occupation ? ` ${biodata.occupation}` : ""} presenting with ${ccList}.`
    hpiParts.push(demoLine)

    for (const complaint of complaints) {
      const d = hpiData[complaint.id]
      if (!d) continue
      const schema = SYMPTOM_SCHEMAS.find(s => s.concept === complaint.concept)
      if (!schema) { hpiParts.push(`\n${complaint.text}: ${d.free_text || 'No details recorded.'}`); continue }

      const parts: string[] = []
      // Build from schema fields
      const loc = d.pain_location as string; if (loc) parts.push(`located in the ${loc.toLowerCase()}`)
      const onset = d.pain_onset as string; if (onset) parts.push(`${onset.toLowerCase()} onset`)
      const dur = d.pain_duration as string; if (dur) parts.push(`lasting ${dur}`)
      const char = d.pain_character as string; if (char) parts.push(`described as ${char.toLowerCase()}`)
      const sev = d.pain_severity as string; if (sev) parts.push(`rated ${sev}/10 in severity`)
      const rad = d.pain_radiation as string; if (rad && !['No radiation','None'].includes(rad)) parts.push(`radiating to ${rad.toLowerCase()}`)
      const prog = d.pain_progression as string; if (prog) parts.push(`and is ${prog.toLowerCase()}`)

      const symptomLine = parts.length > 0 ? `The ${schema.label.toLowerCase()} ${parts.join(', ')}.` : `The patient reports ${complaint.text}.`
      let fullDesc = symptomLine

      // Red flags
      schema.fields.filter(f => f.tier === 1).forEach(rf => {
        if (d[rf.id] === 'yes') fullDesc += `\n  ⚠ RED FLAG: ${rf.label}`
      })
      // Associated symptoms (tier 3)
      schema.fields.filter(f => f.tier === 3).forEach(f => {
        const val = d[f.id]
        if (val && val !== '' && val !== 'None' && val !== 'No' && val !== 'N/A' && val !== 'Unknown' && val !== 'No change' && val !== 'Nothing specific' && val !== 'Nothing') {
          fullDesc += `\n  • ${f.label}: ${val}`
        }
      })

      hpiParts.push(fullDesc)
    }

    const hpiNarrative = hpiParts.join('\n\n')

    // ── PMH ──
    const pmhLines = pmh.conditions.map(c => `  • ${c.name}${c.year ? ` (diagnosed ${c.year})` : ''}${c.notes ? ` — ${c.notes}` : ''}`)
    const surgLines = pmh.surgeries.map(s => `  • ${s.name}${s.year ? ` (${s.year})` : ''}${s.notes ? ` — ${s.notes}` : ''}`)

    // ── ROS ──
    const rosPositives = ros.filter(r => r.present === true)
    const rosNegatives = ros.filter(r => r.present === false)
    const rosText = rosPositives.length > 0
      ? `Positive: ${rosPositives.map(r => r.symptom).join(', ')}.`
      : 'No significant positive findings.'
      + (rosNegatives.length > 0 ? ` Negative for: ${rosNegatives.map(r => r.symptom).join(', ')}.` : '')

    // ── Examination ──
    const examLines = examFindings.map(f => `  • ${f.finding.replace(/_/g, ' ')}`).join('\n') || '  • No examination findings recorded.'
    const vitalsText = [
      vitals.systolic && `BP: ${vitals.systolic}/${vitals.diastolic} mmHg`,
      vitals.heartRate && `HR: ${vitals.heartRate} bpm`,
      vitals.respiratoryRate && `RR: ${vitals.respiratoryRate} /min`,
      vitals.temperature && `Temp: ${vitals.temperature} °C`,
      vitals.oxygenSaturation && `SpO₂: ${vitals.oxygenSaturation}%`,
      vitals.weight && `Weight: ${vitals.weight} kg`,
      vitals.painScore && `Pain: ${vitals.painScore}/10`,
    ].filter(Boolean).join(' | ') || 'Not recorded'

    // ── Investigations ──
    const invRows = investigations.map(i => `  • ${i.test} — ${i.rationale} [${i.priority}]`).join('\n')

    // ── Diagnosis ──
    const workingDx = diagnoses.filter(d => d.type === 'working')
    const diffDx = diagnoses.filter(d => d.type === 'differential')
    const dangerDx = diagnoses.filter(d => d.type === 'cannot_miss')
    const ddxText = computedDDX ? computedDDX.slice(0, 5).map((c, i) => `  ${i + 1}. ${c.diseaseName} (${(c.currentProb * 100).toFixed(1)}%)${c.isRedFlagTriggered ? ' ⚠' : ''}`).join('\n') : ''

    const workingStr = workingDx.map(d => `  • ${d.name}${d.probability ? ` (${d.probability}% confidence)` : ''}`).join('\n') || 'None documented'
    const diffStr = diffDx.map(d => `  • ${d.name}${d.probability ? ` (${d.probability}%)` : ''}`).join('\n') || 'None documented'
    const dangerStr = dangerDx.map(d => `  • ${d.name}${d.probability ? ` (${d.probability}%)` : ''}`).join('\n') || 'None documented'

    // ── Management ──
    const mgmtImmediate = management.filter(m => m.type === 'immediate').map(m => `  • ${m.action}`).join('\n')
    const mgmtDefinitive = management.filter(m => m.type === 'definitive').map(m => `  • ${m.action}`).join('\n')
    const mgmtDisposition = management.filter(m => m.type === 'disposition').map(m => `  • ${m.action}`).join('\n')

    // ── Social ──
    const socialLines = [
      social.smoking ? `Smoking: ${social.smoking}` : '',
      social.alcohol ? `Alcohol: ${social.alcohol}` : '',
      social.occupation ? `Occupation: ${social.occupation}` : '',
      social.travel ? `Travel: ${social.travel}` : '',
    ].filter(Boolean).join('\n')

    // ── Build documents ──

    const hpiDoc = [
      `HISTORY OF PRESENT ILLNESS`,
      ``,
      hpiNarrative,
      ``,
      pmhLines.length > 0 ? `PAST MEDICAL HISTORY:\n${pmhLines.join('\n')}` : '',
      surgLines.length > 0 ? `SURGICAL HISTORY:\n${surgLines.join('\n')}` : '',
      socialLines ? `SOCIAL HISTORY:\n${socialLines}` : '',
      `FAMILY HISTORY: ${social.familyHistory || 'Not documented.'}`,
      ``,
      `MEDICATIONS: ${drugs.medications.map(m => `${m.name} ${m.dose} ${m.frequency}`.trim()).join(', ') || 'None'}`,
      `ALLERGIES: ${drugs.allergies.map(a => `${a.allergen} (${a.reaction})`).join(', ') || 'None known'}`,
      ``,
      `REVIEW OF SYSTEMS: ${rosText}`,
    ].filter(Boolean).join('\n')

    const soapDoc = [
      `SOAP NOTE`,
      ``,
      `SUBJECTIVE:`,
      `Chief complaint: ${ccList}`,
      hpiNarrative,
      ``,
      `OBJECTIVE:`,
      `Vitals: ${vitalsText}`,
      ``,
      `Examination:`,
      examLines,
      ``,
      `Investigations:`,
      invRows || '  • None ordered',
      ``,
      `ASSESSMENT:`,
      `Working diagnosis:`,
      workingStr,
      ``,
      ddxText ? `Bayesian differential:${ddxText ? '\n' + ddxText : ''}` : '',
      ``,
      `Differential diagnoses:`,
      diffStr,
      ``,
      `Cannot miss / Dangerous:`,
      `${dangerStr}\n`,
      `PLAN:`,
      mgmtImmediate ? `Immediate:\n${mgmtImmediate}` : '',
      mgmtDefinitive ? `Definitive:\n${mgmtDefinitive}` : '',
      mgmtDisposition ? `Disposition:\n${mgmtDisposition}` : '',
    ].filter(Boolean).join('\n')

    const admissionDoc = [
      `ADMISSION NOTE`,
      ``,
      `Patient: ${biodata.name}`,
      `Age/Sex: ${ageStr}, ${biodata.sex}`,
      `Informant: ${biodata.informant || 'Patient'} (${biodata.informantRelation || 'self'})`,
      `MRN: ${biodata.phone || 'Not provided'}`,
      ``,
      `CHIEF COMPLAINT: ${ccList}`,
      ``,
      `HISTORY OF PRESENT ILLNESS:`,
      hpiNarrative,
      ``,
      `PAST MEDICAL HISTORY:`,
      pmhLines.join('\n') || 'None documented',
      ``,
      `MEDICATIONS: ${drugs.medications.map(m => `${m.name} ${m.dose}`).join(', ') || 'None'}`,
      `ALLERGIES: ${drugs.allergies.map(a => `${a.allergen}: ${a.reaction}`).join('; ') || 'None known'}`,
      ``,
      `SOCIAL: ${socialLines || 'Not documented'}`,
      `FAMILY HISTORY: ${social.familyHistory || 'Not documented'}`,
      ``,
      `REVIEW OF SYSTEMS: ${rosText}`,
      ``,
      `PHYSICAL EXAMINATION:`,
      `Vitals: ${vitalsText}`,
      examLines,
      ``,
      `INVESTIGATIONS:`,
      invRows || 'Results pending',
      ``,
      `ASSESSMENT:`,
      `Working diagnosis: ${workingDx.map(d => d.name).join(', ') || 'Not documented'}`,
      ddxText ? `\nBayesian differential:\n${ddxText}` : '',
      `\nDanger diagnoses: ${dangerDx.map(d => d.name).join(', ') || 'None identified'}`,
      ``,
      `MANAGEMENT PLAN:`,
      mgmtImmediate ? `Immediate:\n${mgmtImmediate}` : '',
      mgmtDefinitive ? `Definitive:\n${mgmtDefinitive}` : '',
      mgmtDisposition ? `Disposition:\n${mgmtDisposition}` : '',
    ].filter(Boolean).join('\n')

    const dischargeDoc = [
      `DISCHARGE SUMMARY`,
      ``,
      `Patient: ${biodata.name}`,
      `Age/Sex: ${ageStr}, ${biodata.sex}`,
      ``,
      `DIAGNOSIS: ${workingDx.map(d => d.name).join(', ') || 'Not documented'}`,
      ``,
      `BRIEF SUMMARY:`,
      hpiNarrative,
      ``,
      `MANAGEMENT:`,
      management.map(m => `  • ${m.action}`).join('\n') || 'Not documented',
      ``,
      `DISPOSITION: ${mgmtDisposition || 'Not specified'}`,
      `Follow-up: As per clinic`,
    ].filter(Boolean).join('\n')

    setDocumentation({ hpi: hpiDoc, soap: soapDoc, admissionNote: admissionDoc, dischargeSummary: dischargeDoc })
  }, [biodata, complaints, hpiData, pmh, drugs, social, ros, vitals, examFindings, investigations, diagnoses, management])

  // ── CRL Engine Integration ─────────────────────────────────────────

  const ruleRegistry = useMemo(() => createDefaultRuleRegistry(), [])

  const ruleContext = useMemo(() => buildRuleContext({
    biodata,
    complaints,
    conditions: pmh.conditions.map(c => c.name.toLowerCase().replace(/\s+/g, '_')),
    currentStep: step,
    completedSteps: WORKFLOW.slice(0, stepIndex).map(s => s.id),
  }), [biodata, complaints, pmh, step, stepIndex])

  const engineResult = useMemo(() => {
    const allRules = Array.from(ruleRegistry.rules.values())
    return evaluateAllRules(allRules, ruleContext)
  }, [ruleRegistry, ruleContext])

  const activatedCtx = useMemo<ActivatedContext>(() => {
    return toActivatedContext(engineResult)
  }, [engineResult])

  // Sync ActivatedContext into ref (for callbacks that need fresh values)
  useEffect(() => {
    lockedRef.current = activatedCtx.lockedSteps
  }, [activatedCtx])

  // Auto-skip steps marked as skipped by CRL rules
  useEffect(() => {
    if (!activatedCtx) return
    skippedRef.current = activatedCtx.skippedSteps
    if (activatedCtx.skippedSteps.includes(step) && stepIndex < WORKFLOW.length - 1) {
      advance()
    }
  }, [activatedCtx, step, stepIndex, advance])

  const activeRules = useMemo(() => {
    return engineResult.evaluations
      .filter(e => e.matched)
      .map(e => `${e.rule.id}: ${e.rule.name}`)
  }, [engineResult])

  // ── Derived Clinical Context ────────────────────────────────────────

  const ageNum = parseInt(biodata.age) || 0
  const ageCategory: string = ageNum <= 0 ? "neonate" : ageNum <= 1 ? "infant" : ageNum <= 9 ? "child" : ageNum <= 19 ? "adolescent" : ageNum <= 64 ? "adult" : "older_adult"
  const isFemaleReproductive = biodata.sex === "female" && ageNum >= 10 && ageNum <= 55
  const isNeonate = biodata.ageUnit === "days" && ageNum < 28
  const isPregnant = pmh.isPregnant || false

  // ── Specialty Module Activation (Rule X-001 to X-003) ──────────────

  const [showObgynModule, setShowObgynModule] = useState(false)
  const [showNeonatologyModule, setShowNeonatologyModule] = useState(false)
  const [showPediatricModule, setShowPediatricModule] = useState(false)

  const [obgynHistory, setObgynHistory] = useState({
    gravida: "", para: "", living: "", abortions: "", lmp: "", cycleLength: "",
    menopause: "", gestationalAge: "", edd: "", pregnancyComplications: "",
    contraceptive: "", papSmear: "", breastExam: "",
  })
  const [neonatalHistory, setNeonatalHistory] = useState({
    antenatalCare: "", gestationAtBirth: "", deliveryMode: "", birthWeight: "",
    apgarScore: "", resuscitation: "", feeding: "", maternalIllness: "",
  })

  useEffect(() => {
    setShowObgynModule(isFemaleReproductive || biodata.sex === "female")
  }, [isFemaleReproductive, biodata.sex])

  useEffect(() => {
    setShowNeonatologyModule(isNeonate || ageCategory === "neonate")
  }, [isNeonate, ageCategory])

  useEffect(() => {
    setShowPediatricModule(["infant", "child", "adolescent"].includes(ageCategory))
  }, [ageCategory])

  // ── Permission-based step filtering ─────────────────────────────────

  const userPermissions = ROLE_PERMISSIONS[clinicianRole] || ROLE_PERMISSIONS.doctor
  const WORKFLOW_STEP_TO_PERM: Record<string, string> = {
    registration: "registration", chief_complaint: "chief_complaint", hpi: "hpi",
    pmh: "pmh", drug_history: "drug_history", social_history: "social_history",
    ros: "ros", examination: "examination", investigations: "investigations",
    diagnosis: "diagnosis", management: "management", documentation: "documentation",
  }
  const visibleWorkflow = WORKFLOW.filter(s => {
    const perm = WORKFLOW_STEP_TO_PERM[s.id]
    return userPermissions.includes("all") || userPermissions.includes(perm)
  })

  // ── Persistence (API-based, no localStorage) ─────────────────────────

  useEffect(() => {
    if (!biodata.name) return
    const data = { biodata, complaints, hpiData, pmh, drugs, social, ros, vitals, examFindings, investigations, diagnoses, management, step }
    const id = sessionApi.save({
      id: encounterId || `enc-${Date.now()}`,
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    if (!encounterId) setEncounterId(id)
  }, [biodata, complaints, hpiData, pmh, drugs, social, ros, vitals, examFindings, investigations, diagnoses, management, step])

  useEffect(() => {
    const sessions = sessionApi.list()
    if (sessions.length > 0) {
      const latest = sessions[0]
      setEncounterId(latest.id)
      if (latest.biodata) setBiodata(latest.biodata)
      if (latest.complaints) setComplaints(latest.complaints)
      if (latest.hpiData) setHpiData(latest.hpiData)
      if (latest.pmh) setPmh(latest.pmh)
      if (latest.drugs) setDrugs(latest.drugs)
      if (latest.social) setSocial(latest.social)
      if (latest.ros) setRos(latest.ros)
      if (latest.vitals) setVitals(latest.vitals)
      if (latest.examFindings) setExamFindings(latest.examFindings)
      if (latest.investigations) setInvestigations(latest.investigations)
      if (latest.diagnoses) setDiagnoses(latest.diagnoses)
      if (latest.management) setManagement(latest.management)
      if (latest.step) setStep(latest.step as WorkflowStep)
    }
  }, [])

  // ── HPI Rules Engine — Initialize when entering HPI step ─────────────
  useEffect(() => {
    if (step !== "hpi" || complaints.length === 0 || hpiEngineReady) return
    const ctx = {
      patientAge: parseInt(biodata.age) || 30,
      patientSex: (biodata.sex === "male" || biodata.sex === "female") ? biodata.sex : "male",
      patientOccupation: biodata.occupation,
      patientResidence: biodata.residence,
      isPediatric: (parseInt(biodata.age) || 30) < 18,
      isNeonatal: biodata.ageUnit === "days" && (parseInt(biodata.age) || 30) < 28,
      isGeriatric: (parseInt(biodata.age) || 30) >= 65,
      informant: biodata.informant || "patient",
      informantReliability: biodata.informantRelation === "self" ? "reliable" : "unknown",
    }
    let engine = createHpiEngine(encounterId || `enc-${Date.now()}`, ctx)
    complaints.forEach((c, i) => {
      engine = addChiefComplaint(engine, conceptToSymptomCategory(c.concept), c.concept.replace(/_/g, " "), c.text, i === 0, i)
    })
    hpiEngineRef.current = engine
    setHpiOutput(getEngineOutput(engine))
    setHpiEngineReady(true)
  }, [step, complaints, biodata, encounterId, hpiEngineReady])

  // ── DDX Engine — Map HPI fields → feature library IDs ───────────────

  const HPI_TO_FEATURE: Record<string, string> = {
    pain_location: 'pain_initial_location', pain_onset: 'pain_onset',
    pain_duration: 'pain_duration', pain_character: 'pain_character',
    pain_severity: 'pain_severity', pain_radiation: 'pain_radiation',
    pain_progression: 'pain_progression', pain_aggravating: 'pain_worsening_factors',
    pain_relieving: 'pain_relieving_factors', pain_timing: 'pain_temporal_pattern',
    red_flag_syncope: 'syncope', red_flag_bleeding: 'gi_bleeding',
    red_flag_peritonitis: 'peritonitis',
    nausea_vomiting: 'vomiting', vomit_character: 'vomiting_description',
    appetite: 'appetite_loss', bowel_habits: 'constipation',
    urinary_symptoms: 'dysuria', gynecological: 'vaginal_bleeding',
    fever: 'fever', previous_episodes: 'recurrent_abdominal_pain',
  }

  const CONCEPT_HPI_MAP: Record<string, Record<string, string>> = {
    abdominal_pain: HPI_TO_FEATURE,
    distension: {
      distension_onset: 'distension_onset', distension_duration: 'distension_duration',
      distension_progression: 'distension_progression', distension_pain_relation: 'distension_pain_relation',
      distension_gas_passage_relief: 'distension_gas_passage_relief',
      distension_character: 'distension_character', distension_site: 'distension_site',
      distension_worse_after_meals: 'distension_worse_after_meals',
    },
    constipation: {
      constipation_duration: 'constipation_duration', constipation_stool_frequency: 'constipation_stool_frequency',
      constipation_stool_consistency: 'constipation_stool_consistency', constipation_straining: 'constipation_straining',
      constipation_incomplete_evacuation: 'constipation_incomplete_evacuation',
      constipation_abdominal_pain: 'constipation_abdominal_pain', constipation_bloating: 'constipation_bloating',
      constipation_obstipation: 'constipation_obstipation',
    },
    vomiting: {
      vomiting_onset: 'vomiting_onset', vomiting_frequency: 'vomiting_frequency',
      vomiting_description: 'vomiting_description', vomiting_timing: 'vomiting_timing',
      nausea_vomiting: 'nausea',
    },
    gi_bleeding: {
      gi_bleeding_onset: 'gi_bleeding_onset', gi_bleeding_duration: 'gi_bleeding_duration',
      gi_bleeding_colour: 'gi_bleeding_colour', gi_bleeding_volume: 'gi_bleeding_volume',
      gi_bleeding_clots: 'gi_bleeding_clots',
    },
    jaundice: {
      jaundice_duration: 'jaundice_duration', jaundice_pruritus: 'jaundice_pruritus',
      jaundice_urine_colour: 'jaundice_urine', jaundice_stool_colour: 'jaundice_stool',
    },
  }

  /** Collect answers from ALL complaints with HPI data */
  function collectAllAnswers(): AnswerRecord[] {
    const answers: AnswerRecord[] = []
    let ts = Date.now()
    for (const complaint of complaints) {
      const hpi = hpiData[complaint.id]
      if (!hpi) continue
      const conceptMap = CONCEPT_HPI_MAP[complaint.concept]
      if (!conceptMap) continue
      for (const [fieldId, featureId] of Object.entries(conceptMap)) {
        const val = hpi[fieldId]
        if (val === undefined || val === null || val === '' || val === '— Select —' || val === 'N/A' || val === 'Unknown') continue
        const feature = FEATURES[featureId]
        if (!feature) continue
        answers.push({
          featureId,
          questionLabel: feature.label || fieldId,
          value: val,
          polarity: typeof val === 'string' && (val === 'no' || val === 'None' || val === 'Normal') ? 'absent' : 'present',
          timestamp: ts++,
          source: 'hpi',
        })
      }
    }
    return answers
  }

  const [computedDDX, setComputedDDX] = useState<CandidateDiseaseState[] | null>(null)

  const runDdx = useCallback(() => {
    const hasAbdominalPain = complaints.some(c => c.concept === 'abdominal_pain')
    const hasDistension = complaints.some(c => c.concept === 'distension' || c.concept === 'abdominal_distension')
    const hasVomiting = complaints.some(c => c.concept === 'vomiting')
    const hasConstipation = complaints.some(c => c.concept === 'constipation')
    const hasGiBleeding = complaints.some(c => CONCEPT_HPI_MAP.gi_bleeding && c.concept in CONCEPT_HPI_MAP)
    const hasJaundice = complaints.some(c => c.concept === 'jaundice')

    const answers = collectAllAnswers()
    if (answers.length === 0) return

    // Add symptom presence markers for each complaint concept
    let ts = Date.now() + answers.length
    for (const c of complaints) {
      if (c.concept === 'abdominal_pain') {
        answers.push({ featureId: 'abdominal_pain', questionLabel: 'Abdominal pain', value: true, polarity: 'present', timestamp: ts++, source: 'cc' })
      }
    }

    const age = parseInt(biodata.age) || 30
    const sex = biodata.sex === 'female' ? 'female' : 'male'

    const partialState = {
      patient: { age, sex, geographicRegion: 'tropical_africa' },
      answers,
      chiefComplaint: { highwayId: hasAbdominalPain ? 'abdominal_pain' : 'multi_symptom' },
    } as any

    // Select disease map based on complaints:
    // If only abdominal pain → use dedicated abdominal pain map
    // If multi-complaint or non-abdominal → use extended disease map
    const useExtended = hasDistension || hasVomiting || hasConstipation || hasGiBleeding || hasJaundice ||
      complaints.some(c => c.concept !== 'abdominal_pain')
    const diseaseMap = useExtended ? EXTENDED_DISEASE_MAP : ABDOMINAL_PAIN_DISEASE_MAP

    const result = computeDdxUpdate(partialState, diseaseMap)
    setComputedDDX(result.activeCandidates.slice(0, 15))
  }, [complaints, hpiData, biodata])

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Documentation Panel Helpers ─────────────────────────────────
  function getHpiStatus(): "Draft" | "Live" | "Complete" {
    if (!hpiEngineRef.current) return "Draft"
    const engine = hpiEngineRef.current
    if (engine.status === "complete") return "Complete"
    const primary = engine.symptoms.find(s => s.id === engine.primarySymptomId)
    if (primary?.explorationComplete && engine.timeline.length > 0) return "Live"
    return "Draft"
  }

  function computeCoverage(domain: string): number {
    if (!hpiEngineRef.current || !hpiOutput) return 0
    const engine = hpiEngineRef.current
    switch (domain) {
      case "primary": {
        const primary = engine.symptoms.find(s => s.id === engine.primarySymptomId)
        if (!primary) return 0
        const mandatory = getTemplate(primary.category).coreFields.filter(f => f.mandatory)
        const answered = mandatory.filter(f => primary.coreData[f.id] !== undefined && primary.coreData[f.id] !== null && primary.coreData[f.id] !== '')
        return mandatory.length > 0 ? Math.round((answered.length / mandatory.length) * 100) : 0
      }
      case "associated": {
        const associated = engine.symptoms.filter(s => !s.isPrimary)
        if (associated.length === 0) return 0
        const complete = associated.filter(s => s.explorationComplete)
        return Math.round((complete.length / associated.length) * 100)
      }
      case "timeline": return engine.timeline.length > 0 ? 100 : 0
      case "risk_factors": {
        const entered = Object.keys(engine.riskFactors).length
        return Math.min(entered * 20, 100)
      }
      case "safety": return engine.unresolvedAlerts.length === 0 ? 100 : 50
      case "care": {
        const cp = engine.careBeforePresentation
        const filled = [cp.firstSought, cp.whereSought, cp.response].filter(Boolean).length
        return Math.min(filled * 33, 100)
      }
      case "impact": {
        const filled = Object.keys(engine.impactOnLife).length
        return Math.min(filled * 20, 100)
      }
      default: return 0
    }
  }

  function getOutstandingItems(): string[] {
    if (!hpiEngineRef.current) return []
    const engine = hpiEngineRef.current
    const items: string[] = []
    // Missing mandatory fields on current/incomplete symptoms
    for (const sym of engine.symptoms) {
      if (sym.explorationComplete) continue
      const template = getTemplate(sym.category)
      for (const field of template.coreFields.filter(f => f.mandatory)) {
        if (sym.coreData[field.id] === undefined || sym.coreData[field.id] === null || sym.coreData[field.id] === '') {
          items.push(`${sym.label}: ${field.label}`)
        }
      }
    }
    // Unresolved alerts
    for (const alert of engine.unresolvedAlerts) {
      items.push(`⚠ ${alert.replace(/_/g, " ")}`)
    }
    // Missing care/impact/status
    if (!engine.careBeforePresentation.firstSought) items.push("Care sought before arrival")
    if (Object.keys(engine.impactOnLife).length === 0) items.push("Functional impact")
    if (!engine.currentStatus.trend) items.push("Current status")
    return items.slice(0, 12)
  }

  function getCoverageData(): { domain: string; percent: number }[] {
    return [
      { domain: "Pain Assessment", percent: computeCoverage("primary") },
      { domain: "Associated Symptoms", percent: computeCoverage("associated") },
      { domain: "Timeline", percent: computeCoverage("timeline") },
      { domain: "Risk Factors", percent: computeCoverage("risk_factors") },
      { domain: "Safety Screening", percent: computeCoverage("safety") },
      { domain: "Care Before Arrival", percent: computeCoverage("care") },
      { domain: "Functional Impact", percent: computeCoverage("impact") },
    ]
  }

  const coverageData = useMemo(() => getCoverageData(), [hpiOutput, hpiOutput?.state.lastUpdated])
  const hpiStatus = useMemo(() => getHpiStatus(), [hpiOutput, hpiOutput?.state.lastUpdated])
  const outstandingItems = useMemo(() => getOutstandingItems(), [hpiOutput, hpiOutput?.state.lastUpdated])
  const overallCoverage = useMemo(() => Math.round(coverageData.reduce((s, d) => s + d.percent, 0) / coverageData.length), [coverageData])

  function renderRegistration() {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Patient Registration</h2>
          <span className="rule-badge">PAT-0001 to PAT-0011</span>
        </div>
        <p className="section-desc">Enter patient biodata. Rules automatically determine clinical context: age category, sex-specific pathways, and applicable screening modules.</p>

        {/* ── Role & Facility Selector (Permission-based UI) ── */}
        {showRoleSelector && (
          <div className="card" style={{marginBottom:16,padding:"var(--space-4)"}}>
            <div className="form-section">CLINICIAN CONTEXT</div>
            <p className="section-desc" style={{fontSize:"var(--text-xs)"}}>Select your role — the system will only show steps you're authorized to perform.</p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Your Role</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {CLINICIAN_ROLES.map(r => (
                    <button key={r.id} className={`btn btn-sm ${clinicianRole === r.id ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setClinicianRole(r.id)}>
                      {r.icon} {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Facility</label>
                <select className="form-select" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}>
                  {FACILITIES.map(f => <option key={f.id} value={f.id}>{f.label} ({f.region})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginTop:12,padding:"8px 12px",background:"var(--clr-primary-subtle, #EBF4FF)",borderRadius:"var(--radius)",fontSize:"var(--text-xs)"}}>
              <strong>Spec Rule #3:</strong> A {clinicianRole} at {FACILITIES.find(f => f.id === selectedFacility)?.label} / {DEPARTMENTS.find(d => d.id === selectedDepartment)?.label} can see: {ROLE_PERMISSIONS[clinicianRole].filter(p => p !== "all").slice(0, 6).join(", ")}...
            </div>
          </div>
        )}

        <div className="form-section">IDENTITY <small style={{fontWeight:400,color:"var(--clr-text-muted)"}}> — all fields required</small></div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="e.g. MARY AKINYI OCHIENG" value={biodata.name} onChange={e => setBiodata(f => ({...f, name: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <div style={{display:"flex",gap:8}}>
              <input className="form-input" type="number" placeholder="34" value={biodata.age} onChange={e => setBiodata(f => ({...f, age: e.target.value}))} style={{flex:1}} />
              <select className="form-select" style={{width:90}} value={biodata.ageUnit} onChange={e => setBiodata(f => ({...f, ageUnit: e.target.value as any}))}>
                <option value="years">Years</option>
                <option value="months">Months</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Sex at Birth</label>
            <select className="form-select" value={biodata.sex} onChange={e => setBiodata(f => ({...f, sex: e.target.value as any}))}>
              <option value="">— Select —</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Occupation</label>
            <input className="form-input" placeholder="e.g. Teacher, Farmer" value={biodata.occupation} onChange={e => setBiodata(f => ({...f, occupation: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Residence</label>
            <input className="form-input" placeholder="e.g. Nairobi, Kibera" value={biodata.residence} onChange={e => setBiodata(f => ({...f, residence: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" placeholder="+254 712 345 678" value={biodata.phone} onChange={e => setBiodata(f => ({...f, phone: e.target.value}))} />
          </div>
        </div>
        <div className="form-section">INFORMANT</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Informant</label>
            <input className="form-input" placeholder="Person providing history" value={biodata.informant} onChange={e => setBiodata(f => ({...f, informant: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <select className="form-select" value={biodata.informantRelation} onChange={e => setBiodata(f => ({...f, informantRelation: e.target.value}))}>
              <option value="">— Select —</option>
              <option value="self">Self</option>
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="caregiver">Caregiver</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Next of Kin</label>
            <input className="form-input" placeholder="Name and contact" value={biodata.nextOfKin} onChange={e => setBiodata(f => ({...f, nextOfKin: e.target.value}))} />
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:16}}>
          <button className="btn btn-primary btn-lg" disabled={!biodata.name || !biodata.age || !biodata.sex} onClick={advance}>
            Continue to Chief Complaint →
          </button>
        </div>
      </div>
    )
  }

  function renderChiefComplaint() {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Chief Complaint</h2>
          <span className="rule-badge">CC-0001 to CC-0010</span>
        </div>
        <p className="section-desc">
          <strong>Rule CC-0001:</strong> Each complaint is an independent object.<br />
          <strong>Rule CC-0007:</strong> Display is chronological by onset, not entry order.<br />
          <strong>Rule CC-0009:</strong> Chief complaint cannot contain a diagnosis — use symptoms.
        </p>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <input className="form-input" placeholder='e.g. "Abdominal pain for 3 days"' value={complaintInput}
            onChange={e => setComplaintInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addComplaint() }}
            style={{flex:1}} />
          <button className="btn btn-accent" onClick={addComplaint}>+ Add</button>
        </div>
        {complaints.length > 0 && (
          <div className="card" style={{marginBottom:16}}>
            <div className="card-header">
              <span className="card-title">Clinical Timeline <small>(chronological)</small></span>
              <span className="badge badge-completed">{complaints.length}</span>
            </div>
            <div className="timeline">
              {[...complaints].sort((a,b) => a.createdAt - b.createdAt).map(c => (
                <div key={c.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div style={{flex:1}}>
                    <div className="timeline-text">
                      <strong>{c.concept.replace(/_/g, " ")}</strong>
                      <span style={{color:"var(--clr-text-secondary)"}}> — "{c.text}"</span>
                    </div>
                    <div className="timeline-meta">{c.bodySystem} · Severity: {c.severity}/10</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{color:"var(--clr-critical)"}} onClick={() => removeComplaint(c.id)}>✕</button>
                </div>
              ))}
            </div>
            {complaints.map(c => (
              <div key={c.id} style={{display:"flex",gap:12,alignItems:"center",marginTop:8,padding:"8px 0",borderTop:"1px solid var(--clr-divider)"}}>
                <span style={{fontSize:"var(--text-sm)",fontWeight:500,minWidth:120}}>{c.concept.replace(/_/g, " ")}</span>
                <label style={{fontSize:"var(--text-xs)",color:"var(--clr-text-secondary)"}}>Severity:</label>
                <input type="range" min="1" max="10" value={c.severity}
                  onChange={e => setComplaints(prev => prev.map(x => x.id === c.id ? {...x, severity: parseInt(e.target.value)} : x))}
                  style={{flex:1,maxWidth:120}} />
                <span style={{fontSize:"var(--text-sm)",fontWeight:600,minWidth:20}}>{c.severity}</span>
                <label style={{fontSize:"var(--text-xs)",color:"var(--clr-text-secondary)"}}>Duration:</label>
                <input className="form-input" style={{width:80}} placeholder="3" value={c.duration}
                  onChange={e => setComplaints(prev => prev.map(x => x.id === c.id ? {...x, duration: e.target.value} : x))} />
              </div>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-primary btn-lg" disabled={complaints.length === 0} onClick={advance}>Continue to HPI →</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function handleAnswer(questionId: string, answer: string | number | boolean) {
    if (!hpiEngineRef.current) return
    // Find the answered question to get fieldId before it's removed from pending
    const answeredQ = hpiEngineRef.current.questions.find(q => q.id === questionId)
    const output = recordAnswerAndAdvance(hpiEngineRef.current, questionId, answer)
    hpiEngineRef.current = output.state
    setHpiOutput(output)
    // Sync to legacy hpiData for DDX engine compatibility
    if (answeredQ) {
      const symp = output.state.symptoms.find(s => s.id === answeredQ.symptomId)
      if (symp) {
        const complaint = complaints.find(c => c.concept.replace(/_/g, " ") === symp.label)
        if (complaint) {
          updateHpiField(complaint.id, answeredQ.fieldId, answer)
        }
      }
    }
  }

  function handleAddAssociatedSymptom(category: string, label: string, verbatim: string) {
    if (!hpiEngineRef.current) return
    const cat = conceptToSymptomCategory(category)
    const engine = addAssociatedSymptom(hpiEngineRef.current, cat, label, verbatim)
    hpiEngineRef.current = engine
    setHpiOutput(getEngineOutput(engine))
  }

  function handleAdvanceStage() {
    if (!hpiEngineRef.current) return
    const output = advanceStage(hpiEngineRef.current)
    hpiEngineRef.current = output.state
    setHpiOutput(output)
  }

  function renderHpi() {
    const engine = hpiEngineRef.current
    const output = hpiOutput
    const stageLabel = engine?.status?.replace(/_/g, " ") || "Initializing..."
    const isComplete = engine?.status === "complete"

    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">History of Present Illness</h2>
          <span className="rule-badge">HPI Engine</span>
        </div>

        {/* Stage progress */}
        <div style={{display:"flex",gap:"var(--space-2)",marginBottom:"var(--space-4)",flexWrap:"wrap",alignItems:"center"}}>
          <span className="badge badge-current">{stageLabel}</span>
          {output && (
            <span className="badge badge-pending">{output.questionsRemaining} remaining</span>
          )}
          {engine && (
            <span className="badge badge-info">{engine.symptoms.length} symptom(s)</span>
          )}
        </div>

        {!hpiEngineReady ? (
          <div className="empty-state" style={{padding:"var(--space-8)"}}>
            <div className="empty-title">Enter the Chief Complaint first</div>
            <div className="empty-desc">Go back to Chief Complaint step to add complaints, then return here.</div>
            <button className="btn btn-ghost" onClick={goBack}>← Back to Chief Complaint</button>
          </div>
        ) : isComplete ? (
          /* ── Complete state ── */
          <div>
            <div style={{padding:"var(--space-4)",background:"var(--clr-success-light)",borderRadius:"var(--radius-md)",marginBottom:"var(--space-4)",textAlign:"center"}}>
              <span style={{fontWeight:600,color:"var(--clr-success-dark)"}}>✓ HPI Complete</span>
              <p style={{fontSize:"var(--text-sm)",color:"var(--clr-text-secondary)",marginTop:"var(--space-1)"}}>
                All mandatory information collected. {output?.questionsRemaining || 0} optional questions remaining.
              </p>
            </div>
            {output?.narrative && (
              <div className="doc-block" style={{marginBottom:"var(--space-4)"}}>
                <div className="doc-label">HPI Narrative</div>
                <div style={{whiteSpace:"pre-wrap"}}>{output.narrative}</div>
              </div>
            )}
          </div>
        ) : !output?.nextQuestion ? (
          /* ── No more questions — ready to advance ── */
          <div style={{textAlign:"center",padding:"var(--space-8)"}}>
            <p style={{marginBottom:"var(--space-4)",color:"var(--clr-text-secondary)"}}>
              Primary symptom explored. Add associated symptoms or advance to next stage.
            </p>
            <div style={{display:"flex",gap:"var(--space-3)",justifyContent:"center"}}>
              <button className="btn btn-accent" onClick={handleAdvanceStage}>
                Advance Stage →
              </button>
            </div>
          </div>
        ) : (
          /* ── Active question ── */
          <div>
            <div className="question-card">
              <div className="question-text">{output.nextQuestion.text}</div>
              {output.nextQuestion.purpose && (
                <div style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)",marginBottom:"var(--space-3)"}}>
                  {output.nextQuestion.purpose}
                </div>
              )}
              {output.nextQuestion.ddRelevance && output.nextQuestion.ddRelevance.length > 0 && (
                <div style={{fontSize:"var(--text-xs)",color:"var(--clr-accent-dark)",marginBottom:"var(--space-3)",background:"rgba(49,151,149,0.04)",padding:"var(--space-2)",borderRadius:"var(--radius-sm)"}}>
                  DDX relevance: {output.nextQuestion.ddRelevance.join(", ")}
                </div>
              )}
              {output.nextQuestion.type === "boolean" && (
                <div style={{display:"flex",gap:"var(--space-3)"}}>
                  {["Yes","No","Unknown"].map(opt => (
                    <button key={opt} className={`btn ${opt === "Yes" ? "btn-primary" : opt === "No" ? "btn-outline" : "btn-ghost"}`}
                      onClick={() => handleAnswer(output.nextQuestion!.id, opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {output.nextQuestion.type === "select" && output.nextQuestion.options && (
                <div style={{display:"flex",flexWrap:"wrap",gap:"var(--space-2)"}}>
                  {output.nextQuestion.options.map(opt => (
                    <button key={opt} className="btn btn-outline btn-sm"
                      onClick={() => handleAnswer(output.nextQuestion!.id, opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {output.nextQuestion.type === "multi_select" && output.nextQuestion.options && (
                <div style={{display:"flex",flexWrap:"wrap",gap:"var(--space-2)"}}>
                  {output.nextQuestion.options.map(opt => (
                    <button key={opt} className="btn btn-outline btn-sm"
                      onClick={() => handleAnswer(output.nextQuestion!.id, opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {(output.nextQuestion.type === "text" || output.nextQuestion.type === "number") && (
                <div style={{display:"flex",gap:"var(--space-2)"}}>
                  <input className="form-input" type={output.nextQuestion.type === "number" ? "number" : "text"}
                    placeholder="Type your answer..."
                    style={{flex:1}}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                        handleAnswer(output.nextQuestion!.id, (e.target as HTMLInputElement).value.trim())
                        ;(e.target as HTMLInputElement).value = ""
                      }
                    }} />
                  <button className="btn btn-primary" onClick={(e) => {
                    const inp = (e.target as HTMLElement).parentElement?.querySelector("input")
                    if (inp?.value.trim()) {
                      handleAnswer(output.nextQuestion!.id, inp.value.trim())
                      inp.value = ""
                    }
                  }}>Answer</button>
                </div>
              )}
            </div>

            {/* Answer history */}
            {engine && engine.questions.filter(q => q.answered).length > 0 && (
              <details style={{marginBottom:"var(--space-4)"}}>
                <summary style={{cursor:"pointer",fontSize:"var(--text-sm)",color:"var(--clr-text-secondary)",padding:"var(--space-2)",userSelect:"none"}}>
                  Answered ({engine.questions.filter(q => q.answered).length})
                </summary>
                <div style={{maxHeight:200,overflowY:"auto",marginTop:"var(--space-2)"}}>
                  {engine.questions.filter(q => q.answered).map(q => (
                    <div key={q.id} style={{fontSize:"var(--text-xs)",padding:"var(--space-1) var(--space-2)",borderBottom:"1px solid var(--clr-divider)",display:"flex",justifyContent:"space-between"}}>
                      <span style={{color:"var(--clr-text-secondary)"}}>{q.text}</span>
                      <span style={{fontWeight:600,color:"var(--clr-text)"}}>{String(q.answer)}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Brief narrative preview */}
            {output.narrative && (
              <div className="doc-block" style={{marginBottom:"var(--space-4)"}}>
                <div className="doc-label">HPI Narrative (evolving)</div>
                <div style={{whiteSpace:"pre-wrap",fontSize:"var(--text-sm)",maxHeight:150,overflowY:"auto"}}>
                  {output.narrative.split("\n").slice(0, 20).join("\n")}
                  {output.narrative.split("\n").length > 20 ? "\n..." : ""}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Differentials */}
        {output?.activeDifferentials && output.activeDifferentials.length > 0 && (
          <div className="card" style={{marginBottom:"var(--space-4)"}}>
            <div className="card-header">
              <span className="card-title">Active Differentials</span>
              <span className="badge badge-info">{output.activeDifferentials.filter(d => !d.isExcluded).length} active</span>
            </div>
            <div className="diff-list">
              {output.activeDifferentials.filter(d => !d.isExcluded).sort((a,b) => b.probability - a.probability).slice(0, 8).map(d => (
                <div key={d.id} className={`diff-item ${d.probability >= 70 ? "primary" : d.probability >= 40 ? "likely" : "possible"}`}>
                  <span className="diff-name">{d.name}</span>
                  <span className="diff-probability">{(d.probability).toFixed(0)}%</span>
                </div>
              ))}
              {output.activeDifferentials.filter(d => d.isExcluded).length > 0 && (
                <details>
                  <summary style={{cursor:"pointer",fontSize:"var(--text-xs)",color:"var(--clr-text-muted)",padding:"var(--space-1)"}}>
                    Excluded ({output.activeDifferentials.filter(d => d.isExcluded).length})
                  </summary>
                  {output.activeDifferentials.filter(d => d.isExcluded).map(d => (
                    <div key={d.id} className="diff-item" style={{opacity:0.5}}>
                      <span className="diff-name">{d.name}</span>
                      <span style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)",marginLeft:"auto"}}>{d.exclusionReason}</span>
                    </div>
                  ))}
                </details>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        {output?.timeline && output.timeline.length > 0 && (
          <div className="card" style={{marginBottom:"var(--space-4)"}}>
            <div className="card-header">
              <span className="card-title">Timeline</span>
            </div>
            <div className="timeline">
              {[...output.timeline].sort((a,b) => a.relativeDay - b.relativeDay).map(t => (
                <div key={t.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <div className="timeline-text">
                      <strong>{t.label}</strong>
                    </div>
                    <div className="timeline-meta">Day {t.relativeDay} — {t.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add associated symptom */}
        {engine && engine.status === "associated_discovery" && (
          <div className="card" style={{marginBottom:"var(--space-4)"}}>
            <div className="card-header">
              <span className="card-title">Add Associated Symptom</span>
            </div>
            <p className="section-desc">Select any additional symptom the patient is experiencing:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"var(--space-2)"}}>
              {["vomiting", "fever", "distension", "constipation", "diarrhea", "cough", "dyspnea", "weakness", "bleeding", "urinary"].map(cat => (
                <button key={cat} className="btn btn-outline btn-sm"
                  onClick={() => handleAddAssociatedSymptom(cat, cat.charAt(0).toUpperCase() + cat.slice(1), `Patient reports ${cat}`)}>
                  + {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{display:"flex",gap:12}}>
          {isComplete ? (
            <button className="btn btn-primary btn-lg" onClick={advance}>Continue to Past History →</button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={handleAdvanceStage} disabled={!engine}>
              Force Advance Stage
            </button>
          )}
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function renderPmh() {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Past Medical & Surgical History</h2>
          <span className="rule-badge">PHX-0001</span>
        </div>
        <p className="section-desc">Document known medical conditions, surgeries, and admissions. Significant conditions (diabetes, hypertension, asthma, etc.) will be highlighted in the HPI summary.</p>
        <div className="form-section">MEDICAL CONDITIONS</div>
        {pmh.conditions.map((c,i) => (
          <div key={i} className="card" style={{marginBottom:8,padding:"var(--space-3)"}}>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <input className="form-input" placeholder="Condition" value={c.name} onChange={e => setPmh(prev => {const n=[...prev.conditions];n[i]={...n[i],name:e.target.value};return{...prev,conditions:n}})} style={{flex:2,minWidth:140}} />
              <input className="form-input" placeholder="Year dx" value={c.year} onChange={e => setPmh(prev => {const n=[...prev.conditions];n[i]={...n[i],year:e.target.value};return{...prev,conditions:n}})} style={{flex:1,minWidth:80}} />
              <input className="form-input" placeholder="Notes/clinic" value={c.notes} onChange={e => setPmh(prev => {const n=[...prev.conditions];n[i]={...n[i],notes:e.target.value};return{...prev,conditions:n}})} style={{flex:2,minWidth:120}} />
              <button className="btn btn-ghost btn-sm" style={{color:"var(--clr-critical)"}} onClick={() => setPmh(prev => ({...prev,conditions:prev.conditions.filter((_,j)=>j!==i)}))}>✕</button>
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => setPmh(prev => ({...prev,conditions:[...prev.conditions,{name:"",year:"",notes:""}]}))}>+ Add Condition</button>

        <div className="form-section" style={{marginTop:24}}>SURGICAL HISTORY</div>
        {pmh.surgeries.map((s,i) => (
          <div key={i} className="card" style={{marginBottom:8,padding:"var(--space-3)"}}>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <input className="form-input" placeholder="Procedure" value={s.name} onChange={e => setPmh(prev => {const n=[...prev.surgeries];n[i]={...n[i],name:e.target.value};return{...prev,surgeries:n}})} style={{flex:2,minWidth:140}} />
              <input className="form-input" placeholder="Year" value={s.year} onChange={e => setPmh(prev => {const n=[...prev.surgeries];n[i]={...n[i],year:e.target.value};return{...prev,surgeries:n}})} style={{flex:1,minWidth:80}} />
              <input className="form-input" placeholder="Notes" value={s.notes} onChange={e => setPmh(prev => {const n=[...prev.surgeries];n[i]={...n[i],notes:e.target.value};return{...prev,surgeries:n}})} style={{flex:2,minWidth:120}} />
              <button className="btn btn-ghost btn-sm" style={{color:"var(--clr-critical)"}} onClick={() => setPmh(prev => ({...prev,surgeries:prev.surgeries.filter((_,j)=>j!==i)}))}>✕</button>
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => setPmh(prev => ({...prev,surgeries:[...prev.surgeries,{name:"",year:"",notes:""}]}))}>+ Add Surgery</button>

        {/* ── OBGYN Module (Rule X-002: female 10-55 → show obstetric history) ── */}
        {showObgynModule && (
          <>
            <div className="form-section" style={{marginTop:24}}>OBSTETRIC & GYNECOLOGICAL HISTORY <span className="rule-badge">PAT-0003</span></div>
            <p className="section-desc" style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)"}}>Rule PAT-0003: Female reproductive age — obstetric and gynecological history required.</p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Gravida</label>
                <input className="form-input" placeholder="e.g. 2" value={obgynHistory.gravida} onChange={e => setObgynHistory(p => ({...p, gravida: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Para</label>
                <input className="form-input" placeholder="e.g. 1" value={obgynHistory.para} onChange={e => setObgynHistory(p => ({...p, para: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Living Children</label>
                <input className="form-input" placeholder="e.g. 1" value={obgynHistory.living} onChange={e => setObgynHistory(p => ({...p, living: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Abortions</label>
                <input className="form-input" placeholder="e.g. 0" value={obgynHistory.abortions} onChange={e => setObgynHistory(p => ({...p, abortions: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">LMP</label>
                <input className="form-input" placeholder="e.g. 2026-05-15" value={obgynHistory.lmp} onChange={e => setObgynHistory(p => ({...p, lmp: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Cycle Length</label>
                <select className="form-select" value={obgynHistory.cycleLength} onChange={e => setObgynHistory(p => ({...p, cycleLength: e.target.value}))}>
                  <option value="">— Select —</option>
                  <option value="regular 28d">Regular (28 days)</option>
                  <option value="irregular">Irregular</option>
                  <option value="amenorrhea">Amenorrhea</option>
                  <option value="postmenopausal">Post-menopausal</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pregnant?</label>
                <select className="form-select" value={pmh.isPregnant ? "yes" : "no"} onChange={e => setPmh(prev => ({...prev, isPregnant: e.target.value === "yes"}))}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Contraceptive Use</label>
                <input className="form-input" placeholder="e.g. COCP, IUD, None" value={obgynHistory.contraceptive} onChange={e => setObgynHistory(p => ({...p, contraceptive: e.target.value}))} />
              </div>
            </div>
            {pmh.isPregnant && (
              <div style={{marginTop:12,padding:"var(--space-3)",background:"var(--clr-warning-light, #FEF3C7)",borderRadius:"var(--radius)",border:"1px solid var(--clr-warning, #F59E0B)"}}>
                <strong style={{color:"var(--clr-warning-dark, #92400E)"}}>⚠ Pregnancy Confirmed</strong>
                <p style={{fontSize:"var(--text-xs)",color:"var(--clr-text-secondary)",marginTop:4}}>Rule PAT-0004 activated: Obstetric care pathway. Medication dosing, investigations, and management will account for pregnancy status.</p>
              </div>
            )}
          </>
        )}

        {/* ── Neonatology Module (Rule X-003: age <28 days → neonatal history) ── */}
        {showNeonatologyModule && (
          <>
            <div className="form-section" style={{marginTop:24}}>NEONATAL HISTORY <span className="rule-badge">PAT-0006</span></div>
            <p className="section-desc" style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)"}}>Rule PAT-0006: Neonate ({'<'}28 days) — birth and perinatal history required.</p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Antenatal Care</label>
                <input className="form-input" placeholder="e.g. 4 visits, uneventful" value={neonatalHistory.antenatalCare} onChange={e => setNeonatalHistory(p => ({...p, antenatalCare: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Gestation at Birth</label>
                <select className="form-select" value={neonatalHistory.gestationAtBirth} onChange={e => setNeonatalHistory(p => ({...p, gestationAtBirth: e.target.value}))}>
                  <option value="">— Select —</option>
                  <option value="full term (37-42 wks)">Full term (37-42 wks)</option>
                  <option value="preterm (<37 wks)">Preterm (&lt;37 wks)</option>
                  <option value="post term (>42 wks)">Post term (&gt;42 wks)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Mode</label>
                <select className="form-select" value={neonatalHistory.deliveryMode} onChange={e => setNeonatalHistory(p => ({...p, deliveryMode: e.target.value}))}>
                  <option value="">— Select —</option>
                  <option value="spontaneous vaginal">Spontaneous Vaginal</option>
                  <option value="assisted vaginal">Assisted Vaginal</option>
                  <option value="emergency c-section">Emergency C-section</option>
                  <option value="elective c-section">Elective C-section</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Birth Weight (kg)</label>
                <input className="form-input" placeholder="e.g. 3.2" value={neonatalHistory.birthWeight} onChange={e => setNeonatalHistory(p => ({...p, birthWeight: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Apgar Score</label>
                <input className="form-input" placeholder="e.g. 9/10" value={neonatalHistory.apgarScore} onChange={e => setNeonatalHistory(p => ({...p, apgarScore: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Resuscitation Needed</label>
                <select className="form-select" value={neonatalHistory.resuscitation} onChange={e => setNeonatalHistory(p => ({...p, resuscitation: e.target.value}))}>
                  <option value="">— Select —</option>
                  <option value="none">None</option>
                  <option value="oxygen">Oxygen</option>
                  <option value="ppv">PPV</option>
                  <option value="intubation">Intubation</option>
                  <option value="nICU admission">NICU Admission</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Feeding</label>
                <select className="form-select" value={neonatalHistory.feeding} onChange={e => setNeonatalHistory(p => ({...p, feeding: e.target.value}))}>
                  <option value="">— Select —</option>
                  <option value="exclusive breastfeeding">Exclusive Breastfeeding</option>
                  <option value="formula">Formula</option>
                  <option value="mixed">Mixed</option>
                  <option value="ng tube">NG Tube</option>
                  <option value="IV fluids">IV Fluids</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Maternal Illness in Pregnancy</label>
                <input className="form-input" placeholder="e.g. GDM, PIH, None" value={neonatalHistory.maternalIllness} onChange={e => setNeonatalHistory(p => ({...p, maternalIllness: e.target.value}))} />
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Surgical History (ACT-0015: Intestinal Obstruction) ── */}
        {activatedCtx.visibleSections.has('surgical_history') && (
          <>
            <div className="form-section" style={{marginTop:24}}>SURGICAL & OBSTRUCTION HISTORY <span className="rule-badge">ACT-0015</span></div>
            <p className="section-desc" style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)"}}>Rule ACT-0015: Abdominal distension + obstipation + vomiting — intestinal obstruction pathway requires focused surgical history.</p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Prior Abdominal Surgery</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="none">None</option>
                  <option value="appendicectomy">Appendicectomy</option>
                  <option value="cholecystectomy">Cholecystectomy</option>
                  <option value="colectomy">Colectomy</option>
                  <option value="small_bowel">Small bowel resection</option>
                  <option value="gastric">Gastric surgery</option>
                  <option value="gynecological">Gynecological (hysterectomy/ovarian)</option>
                  <option value="multiple">Multiple abdominal surgeries</option>
                  <option value="other">Other (specify in notes)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Known Hernia</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no">No known hernia</option>
                  <option value="inguinal">Inguinal</option>
                  <option value="femoral">Femoral</option>
                  <option value="umbilical">Umbilical</option>
                  <option value="incisional">Incisional (at scar site)</option>
                  <option value="hiatal">Hiatal</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Last Bowel Movement</label>
                <input className="form-input" placeholder="e.g. 2 days ago, 12 hours ago" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Passage of Gas</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="today">Today / within 6 hours</option>
                  <option value="yesterday">Yesterday / 6-24 hours ago</option>
                  <option value="2days">2 days ago</option>
                  <option value="3days">3+ days ago</option>
                  <option value="none_since">None since symptoms started</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vomiting — Description</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="bilious">Bilious (green/yellow)</option>
                  <option value="feculent">Feculent (faecal odour)</option>
                  <option value="clear_gastric">Clear / gastric contents</option>
                  <option value="blood">Blood (haematemesis)</option>
                  <option value="coffee_ground">Coffee-ground</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Abdominal Distension — Onset</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="sudden">Sudden (minutes to hours)</option>
                  <option value="gradual">Gradual (hours to days)</option>
                  <option value="progressive">Progressive worsening</option>
                </select>
              </div>
            </div>
            <div style={{marginTop:12,padding:"var(--space-3)",background:"rgba(229,62,62,0.03)",border:"1px solid rgba(229,62,62,0.15)",borderRadius:"var(--radius-md)"}}>
              <strong style={{color:"var(--clr-critical)",fontSize:"var(--text-sm)"}}>
                ⚠ If obstipation (no stool + no gas) + bilious/feculent vomiting + distension: <em>intestinal obstruction until proven otherwise</em>
              </strong>
            </div>
          </>
        )}

        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button className="btn btn-primary btn-lg" onClick={advance}>Continue to Medications →</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function renderDrugHistory() {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Medications & Allergies</h2>
          <span className="rule-badge">DHX-0001 · AHX-0001</span>
        </div>
        <div className="form-section">CURRENT MEDICATIONS</div>
        {drugs.medications.map((m,i) => (
          <div key={i} className="card" style={{marginBottom:8,padding:"var(--space-3)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr auto",gap:8,alignItems:"center"}}>
              <input className="form-input" placeholder="Drug" value={m.name} onChange={e => setDrugs(prev => {const n=[...prev.medications];n[i]={...n[i],name:e.target.value};return{...prev,medications:n}})} />
              <input className="form-input" placeholder="Dose" value={m.dose} onChange={e => setDrugs(prev => {const n=[...prev.medications];n[i]={...n[i],dose:e.target.value};return{...prev,medications:n}})} />
              <input className="form-input" placeholder="Frequency" value={m.frequency} onChange={e => setDrugs(prev => {const n=[...prev.medications];n[i]={...n[i],frequency:e.target.value};return{...prev,medications:n}})} />
              <input className="form-input" placeholder="Indication" value={m.indication} onChange={e => setDrugs(prev => {const n=[...prev.medications];n[i]={...n[i],indication:e.target.value};return{...prev,medications:n}})} />
              <button className="btn btn-ghost btn-sm" style={{color:"var(--clr-critical)"}} onClick={() => setDrugs(prev => ({...prev,medications:prev.medications.filter((_,j)=>j!==i)}))}>✕</button>
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => setDrugs(prev => ({...prev,medications:[...prev.medications,{name:"",dose:"",frequency:"",route:"",indication:""}]}))}>+ Add Medication</button>

        <div className="form-section" style={{marginTop:24}}>ALLERGIES</div>
        {drugs.allergies.map((a,i) => (
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <input className="form-input" placeholder="Allergen" value={a.allergen} onChange={e => setDrugs(prev => {const n=[...prev.allergies];n[i]={...n[i],allergen:e.target.value};return{...prev,allergies:n}})} style={{flex:1}} />
            <input className="form-input" placeholder="Reaction" value={a.reaction} onChange={e => setDrugs(prev => {const n=[...prev.allergies];n[i]={...n[i],reaction:e.target.value};return{...prev,allergies:n}})} style={{flex:1}} />
            <button className="btn btn-ghost btn-sm" style={{color:"var(--clr-critical)"}} onClick={() => setDrugs(prev => ({...prev,allergies:prev.allergies.filter((_,j)=>j!==i)}))}>✕</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => setDrugs(prev => ({...prev,allergies:[...prev.allergies,{allergen:"",reaction:""}]}))}>+ Add Allergy</button>
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button className="btn btn-primary btn-lg" onClick={advance}>Continue to Social →</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function renderSocialHistory() {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Social & Family History</h2>
          <span className="rule-badge">SHX-0001 · FHX-0001</span>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Smoking</label>
            <select className="form-select" value={social.smoking} onChange={e => setSocial(f => ({...f, smoking: e.target.value}))}>
              <option value="">— Select —</option>
              <option value="never">Never smoked</option>
              <option value="former">Former smoker</option>
              <option value="current">Current smoker</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Alcohol</label>
            <select className="form-select" value={social.alcohol} onChange={e => setSocial(f => ({...f, alcohol: e.target.value}))}>
              <option value="">— Select —</option>
              <option value="never">Never</option>
              <option value="occasional">Occasional</option>
              <option value="regular">Regular</option>
              <option value="heavy">Heavy use</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Occupation (if not already provided)</label>
            <input className="form-input" value={social.occupation} onChange={e => setSocial(f => ({...f, occupation: e.target.value}))} placeholder="Current/last occupation" />
          </div>
          <div className="form-group">
            <label className="form-label">Recent Travel</label>
            <input className="form-input" value={social.travel} onChange={e => setSocial(f => ({...f, travel: e.target.value}))} placeholder="Any travel in past 3 months?" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Family History (relevant conditions in first-degree relatives)</label>
          <textarea className="form-textarea" value={social.familyHistory} onChange={e => setSocial(f => ({...f, familyHistory: e.target.value}))} placeholder="e.g. Mother: hypertension (60y), Father: diabetes (55y), Sibling: asthma" />
        </div>

        {/* ── CRL-Driven: Alcohol History (ACT-0011: Jaundice / ACT-0012: Substance Use) ── */}
        {activatedCtx.visibleSections.has('alcohol_history') && (
          <>
            <div className="form-section" style={{marginTop:24}}>ALCOHOL HISTORY <span className="rule-badge">ACT-0011</span></div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Daily Alcohol Intake</label>
                <select className="form-select" value={social.alcohol} onChange={e => setSocial(f => ({...f, alcohol: e.target.value}))}>
                  <option value="">— Select —</option>
                  <option value="none">None</option>
                  <option value="occasional">&lt;1 unit/day</option>
                  <option value="moderate">1-3 units/day</option>
                  <option value="heavy">4-6 units/day</option>
                  <option value="very_heavy">&gt;6 units/day</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration of Heavy Use</label>
                <input className="form-input" placeholder="e.g. 10 years, 2 years" />
              </div>
              <div className="form-group">
                <label className="form-label">Type of Alcohol</label>
                <input className="form-input" placeholder="e.g. Beer, spirits, palm wine" />
              </div>
              <div className="form-group">
                <label className="form-label">Ever Tried to Cut Down?</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no">No</option>
                  <option value="yes_unsuccessful">Yes, unsuccessful</option>
                  <option value="yes_successful">Yes, currently reduced</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Hepatitis Risk (ACT-0011: Jaundice) ── */}
        {activatedCtx.visibleSections.has('hepatitis_risk') && (
          <>
            <div className="form-section" style={{marginTop:24}}>HEPATITIS RISK FACTORS <span className="rule-badge">ACT-0011</span></div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Blood Transfusion History</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">IV Drug Use</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no">No</option>
                  <option value="previous">Previous</option>
                  <option value="current">Current</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tattoos / Body Piercings</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Country of Origin (Hepatitis B endemic?)</label>
                <input className="form-input" placeholder="e.g. Nigeria, South Africa, UK" />
              </div>
              <div className="form-group">
                <label className="form-label">Known Hepatitis Exposure</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no">No known exposure</option>
                  <option value="hep_b">Hepatitis B</option>
                  <option value="hep_c">Hepatitis C</option>
                  <option value="hep_a">Hepatitis A</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vaccinated for Hepatitis B?</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button className="btn btn-primary btn-lg" onClick={advance}>Continue to ROS →</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function renderRos() {
    const rosSystems = [
      { id:"general", label:"General", symptoms:["Fever","Weight loss","Fatigue","Night sweats","Chills"] },
      { id:"gi", label:"Gastrointestinal", symptoms:["Abdominal pain","Nausea","Vomiting","Diarrhea","Constipation","Blood in stool","Heartburn","Dysphagia"] },
      { id:"gu", label:"Genitourinary", symptoms:["Dysuria","Frequency","Hematuria","Urgency","Hesitancy","Flank pain"] },
      { id:"cv", label:"Cardiovascular", symptoms:["Chest pain","Palpitations","SOB on exertion","Orthopnea","PND","Leg swelling"] },
      { id:"resp", label:"Respiratory", symptoms:["Cough","Sputum","Hemoptysis","Wheeze","SOB","Chest tightness"] },
      { id:"cns", label:"Neurological", symptoms:["Headache","Dizziness","Syncope","Seizure","Weakness","Numbness","Vision change"] },
      { id:"msk", label:"Musculoskeletal", symptoms:["Joint pain","Back pain","Muscle weakness","Swelling","Stiffness"] },
    ]
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Review of Systems</h2>
          <span className="rule-badge">ROS-0001: Only relevant systems activated</span>
        </div>
        <p className="section-desc">Based on the presenting complaint, relevant systems are shown. Record positive and negative findings.</p>
        {rosSystems.map(sys => (
          <div key={sys.id} className="card" style={{marginBottom:12}}>
            <div className="card-header">
              <span className="card-title">{sys.label}</span>
              <span className={`badge ${ros.some(r => r.system === sys.id && r.present === true) ? "badge-attention" : "badge-pending"}`}>
                {ros.filter(r => r.system === sys.id && r.present === true).length} positive
              </span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {sys.symptoms.map(s => {
                const existing = ros.find(r => r.system === sys.id && r.symptom === s)
                return (
                  <label key={s} className="question-option" style={{padding:"var(--space-1) var(--space-2)",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}>
                      <span style={{flex:1,fontSize:"var(--text-sm)"}}>{s}</span>
                      <select className="form-select" style={{width:80,padding:"2px 6px",fontSize:"var(--text-xs)"}}
                        value={existing?.present === true ? "yes" : existing?.present === false ? "no" : ""}
                        onChange={e => {
                          const val = e.target.value === "yes" ? true : e.target.value === "no" ? false : null
                          setRos(prev => {
                            const filtered = prev.filter(r => !(r.system === sys.id && r.symptom === s))
                            if (val === null) return filtered
                            return [...filtered, { system: sys.id, symptom: s, present: val }]
                          })
                        }}>
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-primary btn-lg" onClick={advance}>Continue to Examination →</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function renderExamination() {
    const setExam = (sys: string, finding: string, normal: boolean) => {
      setExamFindings(prev => [...prev.filter(f => !(f.system === sys && f.finding.startsWith(finding.split(':')[0]))), { system: sys, finding, normal }])
    }
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Vitals & Physical Examination</h2>
          <span className="rule-badge">EXM-0001</span>
        </div>
        <div className="form-section">VITAL SIGNS</div>
        <div className="vitals-grid">
          {[
            {key:"systolic",label:"Systolic BP",unit:"mmHg",ph:"120"},{key:"diastolic",label:"Diastolic BP",unit:"mmHg",ph:"80"},
            {key:"heartRate",label:"Heart Rate",unit:"bpm",ph:"72"},{key:"respiratoryRate",label:"Resp Rate",unit:"/min",ph:"16"},
            {key:"temperature",label:"Temp",unit:"°C",ph:"36.6"},{key:"oxygenSaturation",label:"SpO₂",unit:"%",ph:"98"},
            {key:"weight",label:"Weight",unit:"kg",ph:"70"},{key:"painScore",label:"Pain Score",unit:"/10",ph:"0"},
          ].map(v => (
            <div key={v.key} className="vital-card">
              <div className="vital-label">{v.label}</div>
              <input className="vital-input" type="number" step="0.1" placeholder={v.ph} value={(vitals as any)[v.key]} onChange={e => setVitals(f => ({...f, [v.key]: e.target.value}))} />
              <div style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)",marginTop:4}}>{v.unit}</div>
            </div>
          ))}
        </div>

        <div className="form-section">ABDOMINAL EXAMINATION</div>
        <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
          <div className="form-group">
            <label className="form-label">Inspection</label>
            <select className="form-select" value={examFindings.find(f => f.finding.startsWith('abd_inspection'))?.finding.split(': ')[1] || ''} onChange={e => setExam('abdominal', `abd_inspection: ${e.target.value}`, e.target.value === 'Normal')}>
              <option value="">— Select —</option>
              {["Normal","Distended","Scars","Visible peristalsis","Hernia","Caput medusae","Distended + scars"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Auscultation — Bowel Sounds</label>
            <select className="form-select" value={examFindings.find(f => f.finding.startsWith('abd_auscultation'))?.finding.split(': ')[1] || ''} onChange={e => setExam('abdominal', `abd_auscultation: ${e.target.value}`, e.target.value === 'Normal bowel sounds')}>
              <option value="">— Select —</option>
              {["Normal bowel sounds","Hyperactive","Hypoactive","Absent","Tinkling","Bruits"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="form-section" style={{fontSize:"var(--text-sm)",marginTop:16}}>Palpation — by Quadrant</div>
        <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
          {[
            {id:"palp_ruq",label:"RUQ (Right Upper)"},
            {id:"palp_luq",label:"LUQ (Left Upper)"},
            {id:"palp_rlq",label:"RLQ (Right Lower)"},
            {id:"palp_llq",label:"LLQ (Left Lower)"},
            {id:"palp_epigastric",label:"Epigastric"},
            {id:"palp_suprapubic",label:"Suprapubic"},
          ].map(q => (
            <div key={q.id} className="form-group" style={{marginBottom:4}}>
              <label className="form-label" style={{fontSize:"var(--text-xs)"}}>{q.label}</label>
              <select className="form-select" style={{fontSize:"var(--text-xs)"}} value={examFindings.find(f => f.finding.startsWith(q.id))?.finding.split(': ')[1] || ''} onChange={e => setExam('abdominal', `${q.id}: ${e.target.value}`, e.target.value === 'Soft/Non-tender')}>
                <option value="">—</option>
                {["Soft/Non-tender","Tender","Guarding","Rebound","Mass","Organomegaly"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="form-section" style={{fontSize:"var(--text-sm)",marginTop:16}}>Special Signs</div>
        <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
          {[
            {id:"sign_rovsing",label:"Rovsing's Sign (RLQ pain on left palpation)"},
            {id:"sign_psoas",label:"Psoas Sign (pain on hip extension)"},
            {id:"sign_obturator",label:"Obturator Sign (pain on internal rotation)"},
            {id:"sign_murphy",label:"Murphy's Sign (inspiratory arrest on RUQ palpation)"},
            {id:"sign_mcburney",label:"McBurney's Point Tenderness"},
            {id:"sign_cva",label:"CVA Tenderness (costovertebral angle)"},
          ].map(s => (
            <div key={s.id} className="form-group" style={{marginBottom:4}}>
              <label className="form-label" style={{fontSize:"var(--text-xs)"}}>{s.label}</label>
              <select className="form-select" style={{fontSize:"var(--text-xs)"}} value={examFindings.find(f => f.finding.startsWith(s.id))?.finding.split(': ')[1] || ''} onChange={e => setExam('abdominal', `${s.id}: ${e.target.value}`, e.target.value === 'Negative')}>
                <option value="">—</option>
                {["Negative","Positive","Unable to assess"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="form-section" style={{fontSize:"var(--text-sm)",marginTop:16}}>Additional Systems</div>
        <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
          {[
            {id:"cv_exam",label:"CVS",options:["Normal","Tachycardic","Murmur","JVP elevated","Leg swelling"]},
            {id:"resp_exam",label:"Respiratory",options:["Normal","Wheeze","Crackles","Reduced air entry","Rhonchi"]},
            {id:"neuro_exam",label:"Neurological",options:["Normal","Focal deficit","GCS <15","Meningism"]},
            {id:"skin_exam",label:"Skin",options:["Normal","Rash","Jaundice","Cyanosis","Pallor"]},
          ].map(s => (
            <div key={s.id} className="form-group" style={{marginBottom:4}}>
              <label className="form-label" style={{fontSize:"var(--text-xs)"}}>{s.label}</label>
              <select className="form-select" style={{fontSize:"var(--text-xs)"}} value={examFindings.find(f => f.finding.startsWith(s.id))?.finding.split(': ')[1] || ''} onChange={e => { if (e.target.value) setExam(s.id, `${s.id}: ${e.target.value}`, e.target.value.startsWith('Normal')) }}>
                <option value="">—</option>
                {s.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* ── CRL-Driven: GI Bleeding Examination (ACT-0016) ── */}
        {activatedCtx.visibleSections.has('gi_bleeding_examination') && (
          <div className="form-section" style={{marginTop:24}}>GI BLEEDING — FOCUSED EXAM <span className="rule-badge">ACT-0016</span></div>
        )}
        {activatedCtx.visibleSections.has('gi_bleeding_examination') && (
          <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr",marginTop:8}}>
            <div className="form-group">
              <label className="form-label">PR Exam — Stool Colour</label>
              <select className="form-select">
                <option value="">— Select —</option>
                <option value="normal">Normal brown</option>
                <option value="melena">Melena (black, tarry)</option>
                <option value="fresh_blood">Fresh blood / hematochezia</option>
                <option value="maroon">Maroon/clot</option>
                <option value="not_performed">Not performed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">PR Exam — Masses</label>
              <select className="form-select">
                <option value="">— Select —</option>
                <option value="none">None palpable</option>
                <option value="rectal_mass">Rectal mass</option>
                <option value="prostate_enlarged">Enlarged prostate</option>
                <option value="impacted_stool">Impacted stool</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pallor / Conjunctival</label>
              <select className="form-select">
                <option value="">— Select —</option>
                <option value="normal">Normal</option>
                <option value="pale">Pale / pallor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Orthostatic BP Change</label>
              <select className="form-select">
                <option value="">— Select —</option>
                <option value="none">None (&lt;10 mmHg)</option>
                <option value="mild">Mild (10-20 mmHg)</option>
                <option value="significant">Significant (&gt;20 mmHg)</option>
              </select>
            </div>
          </div>
        )}

        {/* ── CRL-Driven: Hernia Assessment (ACT-0015: Intestinal Obstruction) ── */}
        {activatedCtx.visibleSections.has('hernia_assessment') && (
          <>
            <div className="form-section" style={{marginTop:24}}>HERNIA ASSESSMENT <span className="rule-badge">ACT-0015</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">Inguinal — Right</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">No hernia</option>
                  <option value="reducible">Reducible</option>
                  <option value="irreducible">Irreducible</option>
                  <option value="tender_irreducible">Tender, irreducible (incarcerated)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Inguinal — Left</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">No hernia</option>
                  <option value="reducible">Reducible</option>
                  <option value="irreducible">Irreducible</option>
                  <option value="tender_irreducible">Tender, irreducible (incarcerated)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Femoral — Right</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">No hernia</option>
                  <option value="reducible">Reducible</option>
                  <option value="irreducible">Irreducible</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Femoral — Left</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">No hernia</option>
                  <option value="reducible">Reducible</option>
                  <option value="irreducible">Irreducible</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Umbilical Hernia</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">No hernia</option>
                  <option value="reducible">Reducible</option>
                  <option value="irreducible">Irreducible</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Incisional Hernia (scar site)</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">No hernia</option>
                  <option value="reducible">Reducible</option>
                  <option value="irreducible">Irreducible</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Obstruction Examination (ACT-0015) ── */}
        {activatedCtx.visibleSections.has('obstruction_examination') && (
          <>
            <div className="form-section" style={{marginTop:24}}>OBSTRUCTION EXAMINATION <span className="rule-badge">ACT-0015</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">Abdominal Scar Assessment</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no_scars">No scars</option>
                  <option value="midline">Midline laparotomy scar</option>
                  <option value="transverse">Transverse/Pfannenstiel</option>
                  <option value="rlq">RLQ scar (appendicectomy)</option>
                  <option value="ruq">RUQ scar (cholecystectomy)</option>
                  <option value="multiple">Multiple scars</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Abdominal Girth / Distension</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="mild">Mild distension</option>
                  <option value="moderate">Moderate distension</option>
                  <option value="severe">Severe/distended</option>
                  <option value="tense">Tense/tympanitic</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bowel Sounds</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal</option>
                  <option value="hyperactive">Hyperactive (early obstruction)</option>
                  <option value="tinkling">Tinkling (classic obstruction)</option>
                  <option value="hypoactive">Hypoactive</option>
                  <option value="absent">Absent (late/ileus)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Succession Splash</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">Absent</option>
                  <option value="present">Present (gastric outlet/obstruction)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hernia Orifices — All Sites</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">All clear — no hernia</option>
                  <option value="hernia_found">Hernia detected (see hernia section)</option>
                  <option value="unable_to_assess">Unable to assess (obese/uncooperative)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Peritoneal Signs</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">No peritonism</option>
                  <option value="guarding">Guarding present</option>
                  <option value="rebound">Rebound tenderness</option>
                  <option value="rigidity">Rigidity (board-like)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Jaundice / Hepatic Examination (ACT-0011) ── */}
        {activatedCtx.visibleSections.has('hepatic_examination') && (
          <>
            <div className="form-section" style={{marginTop:24}}>HEPATIC EXAMINATION <span className="rule-badge">ACT-0011</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">Jaundice — Scleral</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">Absent</option>
                  <option value="mild">Mild icterus</option>
                  <option value="moderate">Moderate icterus</option>
                  <option value="severe">Severe icterus</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hepatomegaly</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="no">Not palpable</option>
                  <option value="tender">Palpable, tender</option>
                  <option value="non_tender">Palpable, non-tender</option>
                  <option value="nodular">Nodular liver edge</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Gallbladder (Murphy's)</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="negative">Negative</option>
                  <option value="positive">Positive (Murphy's sign)</option>
                  <option value="palpable">Palpable gallbladder</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Spider Naevi / Palmar Erythema</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">Absent</option>
                  <option value="present">Present (chronic liver disease)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ascites</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">Absent</option>
                  <option value="mild">Mild / shifting dullness</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe / tense</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stigmata of CLD</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="none">None</option>
                  <option value="present">Present (gynaecomastia, caput medusae, testicular atrophy)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Cardiac Examination (ACT-0003) ── */}
        {activatedCtx.visibleSections.has('cardiac_examination') && (
          <>
            <div className="form-section" style={{marginTop:24}}>CARDIAC EXAMINATION <span className="rule-badge">ACT-0003</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">JVP</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal (&lt;4 cm)</option>
                  <option value="elevated">Elevated</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Heart Sounds</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal S1, S2</option>
                  <option value="murmur">Murmur present</option>
                  <option value="gallop">Gallop (S3/S4)</option>
                  <option value="muffled">Muffled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Peripheral Oedema</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="none">None</option>
                  <option value="pitting">Pitting oedema</option>
                  <option value="severe">Severe / sacral oedema</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Chest Auscultation</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="clear">Clear</option>
                  <option value="crackles">Crackles / crepitations</option>
                  <option value="wheeze">Wheeze</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Respiratory Examination (ACT-0005) ── */}
        {activatedCtx.visibleSections.has('respiratory_examination') && (
          <>
            <div className="form-section" style={{marginTop:24}}>RESPIRATORY EXAMINATION <span className="rule-badge">ACT-0005</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">Respiratory Effort</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal</option>
                  <option value="increased">Increased work of breathing</option>
                  <option value="accessory">Accessory muscle use</option>
                  <option value="nasal_flaring">Nasal flaring</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Percussion</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="resonant">Resonant</option>
                  <option value="dull">Dull</option>
                  <option value="hyperresonant">Hyperresonant</option>
                  <option value="stony_dull">Stony dull</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Breath Sounds</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="vesicular">Vesicular</option>
                  <option value="bronchial">Bronchial</option>
                  <option value="reduced">Reduced</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Added Sounds</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="none">None</option>
                  <option value="wheeze">Wheeze</option>
                  <option value="crackles">Crackles</option>
                  <option value="rhonchi">Rhonchi</option>
                  <option value="pleural_rub">Pleural rub</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Neurological Examination (ACT-0010) ── */}
        {activatedCtx.visibleSections.has('neurological_examination') && (
          <>
            <div className="form-section" style={{marginTop:24}}>NEUROLOGICAL EXAMINATION <span className="rule-badge">ACT-0010</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">GCS</label>
                <input className="form-input" placeholder="15" />
              </div>
              <div className="form-group">
                <label className="form-label">Pupils</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal & reactive</option>
                  <option value="sluggish">Sluggish</option>
                  <option value="fixed">Fixed / dilated</option>
                  <option value="anisocoria">Anisocoria</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Motor Power</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal (5/5 all limbs)</option>
                  <option value="weakness">Focal weakness</option>
                  <option value="hemiparesis">Hemiparesis</option>
                  <option value="paraplegia">Paraplegia</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Meningism</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="absent">Absent</option>
                  <option value="neck_stiffness">Neck stiffness</option>
                  <option value="kernig">Kernig's sign</option>
                  <option value="brudzinski">Brudzinski's sign</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Wound Assessment (ACT-0001: Diabetic Foot) ── */}
        {activatedCtx.visibleSections.has('wound_assessment') && (
          <>
            <div className="form-section" style={{marginTop:24}}>WOUND ASSESSMENT <span className="rule-badge">ACT-0001</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">Wound Location</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="great_toe">Great toe</option>
                  <option value="other_toe">Other toe</option>
                  <option value="metatarsal_head">Metatarsal head (plantar)</option>
                  <option value="heel">Heel</option>
                  <option value="dorsum">Dorsum of foot</option>
                  <option value="ankle">Ankle / malleolus</option>
                  <option value="leg">Lower leg</option>
                  <option value="multiple">Multiple sites</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Wound Size (cm)</label>
                <input className="form-input" placeholder="e.g. 2x3x0.5" />
              </div>
              <div className="form-group">
                <label className="form-label">Wound Depth</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="superficial">Superficial (skin only)</option>
                  <option value="subcutaneous">Subcutaneous tissue</option>
                  <option value="tendon">Tendon / joint exposed</option>
                  <option value="bone">Bone exposed (probe to bone)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Infection Signs</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="none">No infection</option>
                  <option value="cellulitis">Cellulitis (erythema / warmth)</option>
                  <option value="purulent">Purulent discharge</option>
                  <option value="abscess">Abscess / pus collection</option>
                  <option value="necrosis">Necrotic / gangrenous</option>
                  <option value="gas">Crepitus / gas (gas gangrene)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Peripheral Pulses — Dorsalis Pedis</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal (palpable)</option>
                  <option value="reduced">Reduced / weak</option>
                  <option value="absent">Absent</option>
                  <option value="doppler_only">Doppler-only</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Peripheral Pulses — Posterior Tibial</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal (palpable)</option>
                  <option value="reduced">Reduced / weak</option>
                  <option value="absent">Absent</option>
                  <option value="doppler_only">Doppler-only</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monofilament Test (10g)</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal (sensation intact)</option>
                  <option value="reduced">Reduced sensation</option>
                  <option value="absent">Absent (neuropathy)</option>
                  <option value="not_tested">Not tested</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ABPI (Ankle-Brachial Index)</label>
                <input className="form-input" placeholder="e.g. 1.0, 0.6" />
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Foot Examination (ACT-0001: Diabetic Foot) ── */}
        {activatedCtx.visibleSections.has('foot_examination') && (
          <>
            <div className="form-section" style={{marginTop:24}}>FOOT EXAMINATION <span className="rule-badge">ACT-0001</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">Foot Deformity</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="none">None</option>
                  <option value="claw_toes">Claw toes</option>
                  <option value="hammer_toes">Hammer toes</option>
                  <option value="charcot">Charcot foot (rocker-bottom)</option>
                  <option value="flat_foot">Flat foot / pes planus</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Callus / Corns</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="none">None</option>
                  <option value="mild">Mild callus</option>
                  <option value="severe">Severe callus / pre-ulcerative</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Skin Temperature</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal</option>
                  <option value="warm">Warm (suggests infection / Charcot)</option>
                  <option value="cold">Cold (suggests ischaemia)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nail Assessment</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal</option>
                  <option value="onychomycosis">Fungal (onychomycosis)</option>
                  <option value="ingrown">Ingrown toenail</option>
                  <option value="trauma">Traumatic / discoloured</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Neurovascular Assessment (ACT-0001: Diabetic Foot) ── */}
        {activatedCtx.visibleSections.has('neurovascular_assessment') && (
          <>
            <div className="form-section" style={{marginTop:24}}>NEUROVASCULAR ASSESSMENT <span className="rule-badge">ACT-0001</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">Vibration Sense (128 Hz)</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal (&gt;10 sec)</option>
                  <option value="reduced">Reduced (&lt;10 sec)</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pinprick Sensation</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal</option>
                  <option value="reduced">Reduced</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Temperature Sensation</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal</option>
                  <option value="reduced">Reduced</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ankle Reflex</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="normal">Normal</option>
                  <option value="reduced">Reduced</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Offloading Assessment (ACT-0001: Diabetic Foot) ── */}
        {activatedCtx.visibleSections.has('offloading_assessment') && (
          <>
            <div className="form-section" style={{marginTop:24}}>OFFLOADING ASSESSMENT <span className="rule-badge">ACT-0001</span></div>
            <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div className="form-group">
                <label className="form-label">Footwear</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="appropriate">Appropriate footwear</option>
                  <option value="inappropriate">Inappropriate / tight / worn</option>
                  <option value="barefoot">Walks barefoot</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mobility</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="independent">Independent</option>
                  <option value="with_aid">Walking aid</option>
                  <option value="wheelchair">Wheelchair user</option>
                  <option value="bedridden">Bedridden</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Offloading Needed?</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="total_contact_cast">Total contact cast</option>
                  <option value="removable_walker">Removable walker (CAM boot)</option>
                  <option value="felted_foam">Felted foam dressing</option>
                  <option value="crutches">Crutches / non-weight bearing</option>
                  <option value="not_required">Not required</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pressure Redistribution</label>
                <select className="form-select">
                  <option value="">— Select —</option>
                  <option value="appropriate">Appropriate insoles / cushioning</option>
                  <option value="needs_referral">Needs orthotics / podiatry referral</option>
                  <option value="not_required">Not required</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button className="btn btn-primary btn-lg" onClick={advance}>Continue to Investigations →</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  const INV_LABELS: Record<string, { label: string; rationale: string; priority: "routine" | "urgent" }> = {
    cbc: { label:"Complete Blood Count (CBC)", rationale:"Infection, anemia, bleeding", priority:"routine" },
    crp: { label:"C-Reactive Protein (CRP)", rationale:"Inflammation marker", priority:"routine" },
    serum_electrolytes: { label:"Serum Electrolytes + Creatinine", rationale:"Dehydration, renal function", priority:"routine" },
    urinalysis: { label:"Urinalysis", rationale:"UTI, hematuria, ketones", priority:"routine" },
    pregnancy_test: { label:"Pregnancy Test (β-hCG)", rationale:"Rule out ectopic/obstetric (if female)", priority:"urgent" },
    abdominal_ultrasound: { label:"Abdominal Ultrasound", rationale:"Gallstones, appendicitis, abscess, ovarian pathology", priority:"urgent" },
    ct_abdomen_pelvis: { label:"CT Abdomen & Pelvis", rationale:"Definitive imaging for surgical abdomen", priority:"urgent" },
    abdominal_xray_erect: { label:"Abdominal X-ray (Erect)", rationale:"Free air under diaphragm? Air-fluid levels in obstruction?", priority:"urgent" },
    abdominal_xray_supine: { label:"Abdominal X-ray (Supine)", rationale:"Dilated bowel loops, obstruction pattern", priority:"urgent" },
    lactate: { label:"Serum Lactate", rationale:"Bowel ischemia marker — elevated in strangulation", priority:"urgent" },
    coagulation_profile: { label:"Coagulation Profile (PT/PTT/INR)", rationale:"Bleeding risk assessment", priority:"urgent" },
    blood_crossmatch: { label:"Blood Cross-match", rationale:"Prepare for transfusion in active bleeding", priority:"urgent" },
    upper_gi_endoscopy: { label:"Upper GI Endoscopy (OGD)", rationale:"Diagnose and treat upper GI bleeding source", priority:"urgent" },
    colonoscopy: { label:"Colonoscopy", rationale:"Evaluate lower GI bleeding source", priority:"urgent" },
    lft: { label:"Liver Function Tests", rationale:"Hepatocellular injury, cholestasis pattern", priority:"routine" },
    bilirubin: { label:"Serum Bilirubin (total/direct)", rationale:"Jaundice workup", priority:"routine" },
    ecg: { label:"Electrocardiogram (ECG)", rationale:"Ischemia, arrhythmia, LVH", priority:"urgent" },
    troponin: { label:"Troponin", rationale:"Cardiac biomarker for ACS", priority:"urgent" },
    cxr: { label:"Chest X-ray", rationale:"Cardiomegaly, pulmonary edema, pneumonia", priority:"urgent" },
    renal_function: { label:"Renal Function (Urea/Creatinine)", rationale:"Hypertensive nephropathy screening", priority:"routine" },
    lipid_profile: { label:"Lipid Profile", rationale:"Cardiovascular risk assessment", priority:"routine" },
    hba1c: { label:"HbA1c", rationale:"Glycemic control assessment over 3 months", priority:"routine" },
    fasting_glucose: { label:"Fasting Blood Glucose", rationale:"Current glycemic status", priority:"routine" },
    urine_microalbumin: { label:"Urine Microalbumin", rationale:"Diabetic nephropathy screening", priority:"routine" },
    fundoscopy: { label:"Fundoscopy / Retinal Exam", rationale:"Diabetic retinopathy screening", priority:"routine" },
    wound_swab: { label:"Wound Swab (Culture & Sensitivity)", rationale:"Identify infecting organism in diabetic foot ulcer", priority:"urgent" },
    blood_glucose: { label:"Blood Glucose (Random)", rationale:"Current glucose level in diabetic foot", priority:"urgent" },
    xray_foot: { label:"X-ray Foot", rationale:"Osteomyelitis? Charcot foot? Foreign body?", priority:"urgent" },
    oxygen_saturation: { label:"Oxygen Saturation (SpO₂)", rationale:"Hypoxia assessment", priority:"urgent" },
    abg: { label:"Arterial Blood Gas", rationale:"Acid-base status, oxygenation", priority:"urgent" },
    serum_bilirubin: { label:"Serum Bilirubin", rationale:"Neonatal jaundice assessment", priority:"urgent" },
    transcutaneous_bilirubin: { label:"Transcutaneous Bilirubin", rationale:"Non-invasive bilirubin screening", priority:"routine" },
    blood_group_mother_baby: { label:"Blood Group (Mother & Baby)", rationale:"ABO incompatibility workup", priority:"urgent" },
    direct_coombs: { label:"Direct Coombs Test", rationale:"Hemolytic jaundice workup", priority:"urgent" },
    pregnancy_test_urine: { label:"Urine Pregnancy Test (β-hCG)", rationale:"Rule out pregnancy-related pathology", priority:"urgent" },
    pelvic_ultrasound: { label:"Pelvic Ultrasound", rationale:"Ovarian, uterine, tubal pathology", priority:"urgent" },
    fetal_ultrasound: { label:"Fetal Ultrasound (Obstetric)", rationale:"Fetal viability, gestation, placental location", priority:"urgent" },
    fetal_heart_monitoring: { label:"Fetal Heart Rate Monitoring", rationale:"Fetal distress assessment", priority:"urgent" },
  }

  function renderInvestigations() {
    const crlInvestigations: Investigation[] = Array.from(activatedCtx.recommendedInvestigations ?? [])
      .map(id => {
        const meta = (INV_LABELS as Record<string, { label: string; rationale: string; priority: "routine" | "urgent" }>)[id]
        if (!meta) return null
        return { test: meta.label, rationale: meta.rationale, priority: meta.priority }
      })
      .filter(Boolean) as Investigation[]

    const suggested: Investigation[] = [
      { test:"Complete Blood Count (CBC)", rationale:"Infection, anemia, bleeding", priority:"routine" },
      { test:"C-Reactive Protein (CRP)", rationale:"Inflammation marker", priority:"routine" },
      { test:"Serum Electrolytes + Creatinine", rationale:"Dehydration, renal function", priority:"routine" },
      { test:"Urinalysis", rationale:"UTI, hematuria, ketones", priority:"routine" },
      { test:"Pregnancy Test (β-hCG)", rationale:"Rule out ectopic/obstetric (if female)", priority:"urgent" },
      { test:"Abdominal Ultrasound", rationale:"Gallstones, appendicitis, abscess, ovarian pathology", priority:"urgent" },
      { test:"CT Abdomen & Pelvis", rationale:"Definitive imaging for surgical abdomen", priority:"urgent" },
    ]

    const allSuggested = [...suggested, ...crlInvestigations].filter(
      (inv, i, arr) => arr.findIndex(x => x.test === inv.test) === i
    )

    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recommended Investigations</h2>
          <span className="rule-badge">INV-0001: Data-driven, not disease-driven</span>
        </div>
        <p className="section-desc">Based on the clinical data collected, the following investigations are suggested. Each has a rationale linked to the differential.</p>
        {crlInvestigations.length > 0 && (
          <div style={{marginBottom:12,padding:"var(--space-2)",background:"rgba(49,151,149,0.05)",borderRadius:"var(--radius)",fontSize:"var(--text-xs)",color:"var(--clr-accent-dark)"}}>
            ✦ {crlInvestigations.length} investigation(s) recommended by Clinical Rules Engine (ACT rules)
          </div>
        )}
        <table className="inv-table">
          <thead><tr><th style={{width:40}}>Use</th><th>Test</th><th>Rationale</th><th>Priority</th></tr></thead>
          <tbody>
            {allSuggested.map(s => {
              const exists = investigations.some(i => i.test === s.test)
              return (
                <tr key={s.test}>
                  <td><input type="checkbox" checked={exists} onChange={e => setInvestigations(prev => e.target.checked ? [...prev, s] : prev.filter(i => i.test !== s.test))} /></td>
                  <td style={{fontWeight:500}}>{s.test}</td>
                  <td style={{fontSize:"var(--text-sm)",color:"var(--clr-text-secondary)"}}>{s.rationale}</td>
                  <td><span className={`badge ${s.priority === "urgent" ? "badge-attention" : "badge-info"}`}>{s.priority}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="form-group" style={{marginTop:16}}>
          <label className="form-label">Additional investigations</label>
          <input className="form-input" placeholder="Add custom investigation..." onKeyDown={e => {
            if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
              setInvestigations(prev => [...prev, { test: (e.target as HTMLInputElement).value.trim(), rationale:"Custom", priority:"routine" }])
              ;(e.target as HTMLInputElement).value = ""
            }
          }} />
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button className="btn btn-primary btn-lg" onClick={advance}>Continue to Diagnosis →</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function renderDiagnosis() {
    const canCompute = complaints.some(c => c.concept === 'abdominal_pain') && hpiData[complaints.find(c => c.concept === 'abdominal_pain')?.id || '']
    const cdx = computedDDX
    const dangerKeywords = ['rupture','perforat','ectopic','ischemia','obstruction','pancreatitis','aaa']
    const dangerList = cdx ? cdx.filter(c => (c.isRedFlagTriggered || c.currentProb > 0.05) && dangerKeywords.some(k => c.diseaseName.toLowerCase().includes(k))).slice(0, 5) : []
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Assessment & Diagnosis</h2>
          <span className="rule-badge">DX-0001: Three-list differential</span>
        </div>

        {/* Bayesian DDX */}
        <div className="card" style={{marginBottom:16,borderLeft:"3px solid var(--clr-accent)"}}>
          <div className="card-header">
            <span className="card-title">Bayesian Differential (computed from HPI data)</span>
            {cdx ? <span className="badge badge-completed">{cdx.length} candidates</span> : <span className="badge badge-pending">Not computed</span>}
          </div>
          {canCompute && !cdx && (
            <div style={{padding:"var(--space-3)",textAlign:"center"}}>
              <button className="btn btn-accent btn-lg" onClick={runDdx}>🧮 Compute Differentials from HPI</button>
              <p style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)",marginTop:8}}>Uses Bayesian engine with feature likelihood ratios and disease maps ({ABDOMINAL_PAIN_DISEASE_MAP.size} abdominal + {EXTENDED_DISEASE_MAP.size} extended)</p>
            </div>
          )}
          {cdx && (
            <div>
              <table className="inv-table" style={{margin:0}}>
                <thead><tr><th>#</th><th>Disease</th><th>Probability</th><th style={{width:80}}>Danger</th></tr></thead>
                <tbody>
                  {cdx.slice(0, 10).map((c,i) => (
                    <tr key={c.diseaseId} style={c.isRedFlagTriggered ? {background:"rgba(229,62,62,0.04)"} : undefined}>
                      <td>{i + 1}</td>
                      <td style={{fontWeight:500}}>
                        {c.diseaseName}
                        {i === 0 && c.currentProb > 0.3 && <span className="badge badge-attention" style={{marginLeft:8}}>Lead</span>}
                      </td>
                      <td>{(c.currentProb * 100).toFixed(1)}%</td>
                      <td>{c.isRedFlagTriggered ? <span className="badge badge-critical">⚠</span> : <span style={{color:"var(--clr-text-muted)"}}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{display:"flex",gap:8,padding:"var(--space-2)"}}>
                {cdx.slice(0, 5).map(c => (
                  <span key={c.diseaseId} className="tag" style={{cursor:"pointer",background:"rgba(49,151,149,0.06)",borderColor:"rgba(49,151,149,0.2)"}}
                    onClick={() => { if (!diagnoses.some(d => d.name === c.diseaseName)) setDiagnoses(prev => [...prev,{name:c.diseaseName,type:"differential",probability:(c.currentProb * 100).toFixed(0),evidence:""}]) }}>
                    + {c.diseaseName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Working Dx */}
        <div className="card" style={{marginBottom:16,borderLeft:"3px solid var(--clr-critical)"}}>
          <div className="card-header">
            <span className="card-title">Working Diagnosis</span>
            <span className="badge badge-critical">Primary</span>
          </div>
          {diagnoses.filter(d => d.type === "working").map((d,i) => (
            <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
              <input className="form-input" placeholder="Diagnosis" value={d.name} onChange={e => {const n=[...diagnoses];const idx=diagnoses.indexOf(d);n[idx]={...n[idx],name:e.target.value};setDiagnoses(n)}} style={{flex:2}} />
              <input className="form-input" placeholder="Confidence %" value={d.probability} onChange={e => {const n=[...diagnoses];const idx=diagnoses.indexOf(d);n[idx]={...n[idx],probability:e.target.value};setDiagnoses(n)}} style={{flex:1}} />
              <button className="btn btn-ghost btn-sm" style={{color:"var(--clr-critical)"}} onClick={() => setDiagnoses(prev => prev.filter(x => x !== d))}>✕</button>
            </div>
          ))}
          <button className="btn btn-outline btn-sm" onClick={() => setDiagnoses(prev => [...prev,{name:"",type:"working",probability:"",evidence:""}])}>+ Working Diagnosis</button>
        </div>
        {/* Differential */}
        <div className="card" style={{marginBottom:16,borderLeft:"3px solid var(--clr-warning)"}}>
          <div className="card-header">
            <span className="card-title">Differential Diagnoses</span>
            <span className="badge badge-attention">Consider</span>
          </div>
          {diagnoses.filter(d => d.type === "differential").map((d,i) => (
            <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
              <input className="form-input" placeholder="Diagnosis" value={d.name} onChange={e => {const n=[...diagnoses];const idx=diagnoses.indexOf(d);n[idx]={...n[idx],name:e.target.value};setDiagnoses(n)}} style={{flex:2}} />
              <input className="form-input" placeholder="Probability" value={d.probability} onChange={e => {const n=[...diagnoses];const idx=diagnoses.indexOf(d);n[idx]={...n[idx],probability:e.target.value};setDiagnoses(n)}} style={{flex:1}} />
              {diagnoses.filter(x => x.type === "differential").indexOf(d) === 0 && <span className="badge badge-attention" style={{fontSize:10}}>Most likely</span>}
              <button className="btn btn-ghost btn-sm" style={{color:"var(--clr-critical)"}} onClick={() => setDiagnoses(prev => prev.filter(x => x !== d))}>✕</button>
            </div>
          ))}
          <button className="btn btn-outline btn-sm" onClick={() => setDiagnoses(prev => [...prev,{name:"",type:"differential",probability:"",evidence:""}])}>+ Differential</button>
        </div>
        {/* Cannot Miss / Dangerous */}
        <div className="card" style={{marginBottom:16,borderLeft:"3px solid var(--color-critical)",background:"rgba(229,62,62,0.02)"}}>
          <div className="card-header">
            <span className="card-title">Cannot Miss / Dangerous</span>
            <span className="badge badge-critical">Must exclude</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {dangerList.map(d => (
              <span key={d.diseaseId} className="tag" style={{background:"rgba(229,62,62,0.08)",borderColor:"rgba(229,62,62,0.3)",color:"var(--clr-critical-dark)"}}
                onClick={() => { if (!diagnoses.some(dx => dx.name === d.diseaseName)) setDiagnoses(prev => [...prev,{name:d.diseaseName,type:"cannot_miss",probability:(d.currentProb * 100).toFixed(0),evidence:""}]) }}>
                + {d.diseaseName}
              </span>
            ))}
            {["Ectopic pregnancy (if female)","Ruptured AAA","Perforated viscus","Mesenteric ischemia","Myocardial infarction"].filter(n => !dangerList.some(d => d.diseaseName.includes(n.split(' ')[0]))).map(name => (
              <span key={name} className="tag" style={{cursor:"pointer",background:"rgba(229,62,62,0.06)",borderColor:"rgba(229,62,62,0.2)",color:"var(--clr-critical-dark)"}}
                onClick={() => { if (!diagnoses.some(d => d.name === name)) setDiagnoses(prev => [...prev,{name,type:"cannot_miss",probability:"",evidence:""}]) }}>
                + {name}
              </span>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-primary btn-lg" disabled={!diagnoses.some(d => d.type === "working")} onClick={advance}>Continue to Management →</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function renderManagement() {
    const addItem = (type: ManagementItem["type"]) => setManagement(prev => [...prev,{type,action:""}])
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Management Plan</h2>
          <span className="rule-badge">MGT-0001: Structured management</span>
        </div>
        {(["immediate","definitive","disposition"] as const).map(cat => (
          <div key={cat} className="card" style={{marginBottom:12}}>
            <div className="card-header">
              <span className="card-title" style={{textTransform:"capitalize"}}>{cat}</span>
              <span className={`badge ${cat==="immediate"?"badge-critical":cat==="definitive"?"badge-info":"badge-completed"}`}>
                {cat==="immediate"?"Now":cat==="definitive"?"Plan":"Outcome"}
              </span>
            </div>
            {management.filter(m => m.type === cat).map((m,i) => (
              <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                <input className="form-input" placeholder={`${cat} action...`} value={m.action} onChange={e => {const n=[...management];const idx=management.indexOf(m);n[idx]={...n[idx],action:e.target.value};setManagement(n)}} style={{flex:1}} />
                <button className="btn btn-ghost btn-sm" style={{color:"var(--clr-critical)"}} onClick={() => setManagement(prev => prev.filter(x => x !== m))}>✕</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={() => addItem(cat)}>+ Add {cat} action</button>
          </div>
        ))}
        {/* ── CRL-Driven: GI Bleeding Management (ACT-0016) ── */}
        {activatedCtx.visibleSections.has('gi_bleeding_management') && (
          <>
            <div className="form-section" style={{marginTop:24}}>GI BLEEDING MANAGEMENT <span className="rule-badge">ACT-0016</span></div>
            <div className="card" style={{padding:"var(--space-3)"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div className="form-group">
                  <label className="form-label">Resuscitation</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="iv_fluids">IV fluids (crystalloid)</option>
                    <option value="blood_transfusion">Blood transfusion</option>
                    <option value="both">IV fluids + blood transfusion</option>
                    <option value="none">Not required</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PPI Therapy</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="iv_ppi">IV PPI (e.g., omeprazole 80mg stat + 8mg/h infusion)</option>
                    <option value="oral_ppi">Oral PPI</option>
                    <option value="not_indicated">Not indicated</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Endoscopy Timing</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="urgent">&lt;6 hours (urgent)</option>
                    <option value="early">6-24 hours (early)</option>
                    <option value="elective">&gt;24 hours (elective)</option>
                    <option value="not_required">Not required</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Disposition</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="hdu">HDU / ICU (for unstable bleeding)</option>
                    <option value="ward">General ward</option>
                    <option value="discharge">Discharge (low-risk, stable)</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: Diabetes Management (ACT-0001 / ACT-0004) ── */}
        {activatedCtx.visibleSections.has('diabetes_management') && (
          <>
            <div className="form-section" style={{marginTop:24}}>DIABETES MANAGEMENT <span className="rule-badge">ACT-0001/0004</span></div>
            <div className="card" style={{padding:"var(--space-3)"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div className="form-group">
                  <label className="form-label">Blood Glucose Target</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="tight">Tight (4-7 mmol/L) — ICU/HDU</option>
                    <option value="moderate">Moderate (6-10 mmol/L) — ward</option>
                    <option value="liberal">Liberal (&lt;12 mmol/L) — stable</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Insulin Regimen</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="iv_insulin">IV insulin infusion</option>
                    <option value="basal_bolus">Basal-bolus (glargine + aspart)</option>
                    <option value="oral_only">Oral agents only</option>
                    <option value="nil">No change needed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Foot Care</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="wound_care">Daily wound care + offloading</option>
                    <option value="podiatry">Podiatry referral</option>
                    <option value="both">Wound care + podiatry</option>
                    <option value="not_required">Not required</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty Referral</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="endocrinology">Endocrinology review</option>
                    <option value="diabetic_foot_clinic">Diabetic foot clinic</option>
                    <option value="both">Endocrinology + foot clinic</option>
                    <option value="not_required">Not required</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── CRL-Driven: NG Tube / Obstruction Management (ACT-0015) ── */}
        {activatedCtx.visibleSections.has('ng_tube_assessment') && (
          <>
            <div className="form-section" style={{marginTop:24}}>OBSTRUCTION — NG TUBE & DECOMPRESSION <span className="rule-badge">ACT-0015</span></div>
            <div className="card" style={{padding:"var(--space-3)"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div className="form-group">
                  <label className="form-label">NG Tube Insertion</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="indicated">Indicated — insert NG tube</option>
                    <option value="not_indicated">Not indicated</option>
                    <option value="already_in">Already in situ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Aspirate Volume</label>
                  <input className="form-input" placeholder="e.g. 500 mL" />
                </div>
                <div className="form-group">
                  <label className="form-label">Aspirate Character</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="clear">Clear / gastric</option>
                    <option value="bilious">Bilious (green)</option>
                    <option value="feculent">Feculent (brown/faecal odour)</option>
                    <option value="bloody">Bloody</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Surgical Consult</label>
                  <select className="form-select">
                    <option value="">— Select —</option>
                    <option value="urgent">Urgent surgical review</option>
                    <option value="elective">Elective surgical referral</option>
                    <option value="not_required">Not required</option>
                  </select>
                </div>
              </div>
              {activatedCtx.warnings.includes('suspected_intestinal_obstruction_requires_surgical_review') && (
                <div style={{marginTop:12,padding:"var(--space-2)",background:"rgba(229,62,62,0.05)",borderRadius:"var(--radius)",fontSize:"var(--text-xs)",color:"var(--clr-critical)"}}>
                  ⚠ ACT-0015: Suspected intestinal obstruction — surgical review required. Do not order oral contrast.
                </div>
              )}
            </div>
          </>
        )}

        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-success btn-lg" disabled={management.length === 0} onClick={() => { generateDocs(); advance() }}>
            ✓ Generate Documentation
          </button>
          <button className="btn btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    )
  }

  function renderDocumentation() {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Generated Clinical Documentation</h2>
          <span className="rule-badge">DOC-0001: Rendered from observations only — no placeholders</span>
        </div>
        <p className="section-desc">
          Documents are rendered from the collected observations. Only data that was actually entered appears below.
          <strong> Rule:</strong> Documents never store data — they render observations.
        </p>
        {[
          {id:"hpi",label:"HPI Narrative",content:documentation.hpi},
          {id:"soap",label:"SOAP Note",content:documentation.soap},
          {id:"admission",label:"Admission Note",content:documentation.admissionNote},
          {id:"discharge",label:"Discharge Summary",content:documentation.dischargeSummary},
        ].map(doc => (
          <div key={doc.id} className="doc-block">
            <div className="doc-label">{doc.label}</div>
            <div style={{whiteSpace:"pre-wrap"}}>{doc.content || <em style={{color:"var(--clr-text-muted)"}}>No data collected yet for this section.</em>}</div>
          </div>
        ))}
        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-success" onClick={() => window.print()}>🖨 Print / PDF</button>
          <button className="btn btn-primary" onClick={() => setStep("complete")}>✓ Complete Encounter</button>
          <button className="btn btn-ghost" onClick={goBack}>← Back to Management</button>
        </div>
      </div>
    )
  }

  function renderComplete() {
    return (
      <div className="empty-state" style={{marginTop:"var(--space-12)"}}>
        <div className="empty-icon" style={{fontSize:"3rem",opacity:1}}>✅</div>
        <div className="empty-title" style={{color:"var(--clr-success)",fontSize:"var(--text-2xl)"}}>Encounter Complete</div>
        <div className="empty-desc" style={{maxWidth:400}}>
          Patient <strong>{biodata.name}</strong> — all {complaints.length} complaint(s) have been fully documented.
          The HPI, examination findings, investigations, diagnosis, and management plan have been recorded.
        </div>
        <div style={{marginTop:32,display:"flex",gap:12}}>
          <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>New Clinical Entry</button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="app-layout">
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-brand">
            <span className="app-brand-dot" />
            AMEXAN
          </span>
          <span style={{fontSize:"var(--text-sm)",color:"var(--clr-text-muted)",paddingLeft:"var(--space-3)",borderLeft:"1px solid var(--clr-divider)"}}>
            Encounter Center
          </span>
        </div>

        {/* Workflow progress — filtered by permissions */}
        <div className="workflow-bar" style={{flex:1,margin:"0 var(--space-4)",gap:0}}>
          {visibleWorkflow.map(s => {
            const idx = WORKFLOW.indexOf(s)
            const state = idx < stepIndex ? "completed" : idx === stepIndex ? "current" : "pending"
            return (
              <div key={s.id} className={`workflow-step ${state}`} style={{gap:"var(--space-1)",padding:"var(--space-1) var(--space-2)"}}>
                <span className="step-indicator" style={{width:18,height:18,fontSize:9}}>
                  {state === "completed" ? "✓" : idx + 1}
                </span>
                <span style={{fontSize:10}}>{s.label}</span>
              </div>
            )
          })}
        </div>

        <div className="app-header-right" style={{gap:"var(--space-1)"}}>
          <span className="badge badge-current" style={{fontSize:9}}>CRL Active</span>
          <span className="badge badge-info" style={{fontSize:9,background:"var(--clr-primary-subtle)",color:"var(--clr-primary)"}}>
            {CLINICIAN_ROLES.find(r => r.id === clinicianRole)?.icon} {CLINICIAN_ROLES.find(r => r.id === clinicianRole)?.label}
          </span>
          {step !== "registration" && biodata.name && (
            <span style={{fontSize:"var(--text-sm)",color:"var(--clr-text-secondary)"}}>
              {biodata.name.split(" ")[0]}
            </span>
          )}
        </div>
      </header>

      <div className="app-main">
        {/* ── SIDEBAR ── */}
        <aside className="app-sidebar">
          {biodata.name && (
            <div className="sidebar-group">
              <div className="sidebar-label">Current Patient</div>
              <div className="sidebar-item active" style={{cursor:"default",background:"transparent"}}>
                <span className="s-icon">👤</span>
                <span>{biodata.name}</span>
              </div>
              <div style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)",padding:"0 var(--space-2) var(--space-2)"}}>
                {biodata.age} {biodata.ageUnit} · {biodata.sex}{biodata.occupation ? ` · ${biodata.occupation}` : ""}
              </div>
            </div>
          )}

          {step !== "registration" && (
            <div className="sidebar-group">
              <div className="sidebar-label">Context</div>
              <div style={{fontSize:"var(--text-xs)",padding:"var(--space-1) var(--space-2)",display:"flex",flexDirection:"column",gap:4}}>
                <span>{CLINICIAN_ROLES.find(r => r.id === clinicianRole)?.icon} {CLINICIAN_ROLES.find(r => r.id === clinicianRole)?.label}</span>
                <span style={{color:"var(--clr-text-muted)"}}>{selectedFacility.replace("-", " ")} / {DEPARTMENTS.find(d => d.id === selectedDepartment)?.label}</span>
              </div>
            </div>
          )}
          <div className="sidebar-group">
            <div className="sidebar-label">Progress — {visibleWorkflow.length} Steps</div>
            {visibleWorkflow.map(s => {
              const wfIdx = WORKFLOW.indexOf(s)
              const state = wfIdx < stepIndex ? "completed" : wfIdx === stepIndex ? "current" : "pending"
              return (
                <div key={s.id} className={`sidebar-item ${state === "current" ? "active" : ""}`}>
                  <span className="s-icon">
                    {state === "completed" ? <span style={{color:"var(--clr-success)"}}>✓</span> : state === "current" ? <span style={{color:"var(--clr-accent)"}}>●</span> : "○"}
                  </span>
                  <span style={{color: state === "pending" ? "var(--clr-text-muted)" : undefined}}>{s.label}</span>
                  {state === "completed" && <span className="s-count" style={{background:"var(--clr-success-light)",color:"var(--clr-success-dark)"}}>Done</span>}
                  {state === "current" && <span className="s-count" style={{background:"rgba(49,151,149,0.1)",color:"var(--clr-accent-dark)"}}>Now</span>}
                </div>
              )
            })}
          </div>

          {activatedCtx.activePathways.length > 0 && (
            <div className="sidebar-group">
              <div className="sidebar-label">Active Pathways</div>
              {activatedCtx.activePathways.map((p,i) => (
                <div key={i} style={{fontSize:"var(--text-xs)",padding:"var(--space-1) var(--space-2)",display:"flex",gap:"var(--space-1)"}}>
                  <span style={{color:"var(--clr-accent-dark)",flexShrink:0}}>→</span>
                  <span style={{textTransform:"capitalize"}}>{p.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
          {activatedCtx.alerts.length > 0 && (
            <div className="sidebar-group">
              <div className="sidebar-label" style={{color:"var(--clr-critical)"}}>⚠ Alerts</div>
              {activatedCtx.alerts.map((a,i) => (
                <div key={i} style={{fontSize:"var(--text-xs)",color:"var(--clr-critical)",padding:"var(--space-1) var(--space-2)"}}>
                  {a.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          )}
          {activatedCtx.warnings.length > 0 && (
            <div className="sidebar-group">
              <div className="sidebar-label" style={{color:"var(--clr-warning)"}}>⚡ Warnings</div>
              {activatedCtx.warnings.map((w,i) => (
                <div key={i} style={{fontSize:"var(--text-xs)",color:"var(--clr-warning)",padding:"var(--space-1) var(--space-2)"}}>
                  {w.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          )}
          {activeRules.length > 0 && (
            <div className="sidebar-group">
              <div className="sidebar-label">Active Clinical Rules</div>
              {activeRules.map((r,i) => (
                <div key={i} style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)",padding:"var(--space-1) var(--space-2)",display:"flex",gap:"var(--space-1)",alignItems:"flex-start"}}>
                  <span style={{color:"var(--clr-accent)",flexShrink:0}}>•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="app-content">
          {/* Step indicator header */}
          <div style={{display:"flex",alignItems:"center",gap:"var(--space-3)",marginBottom:"var(--space-4)"}}>
            <span className="badge badge-current">Step {stepIndex + 1}/{visibleWorkflow.length}</span>
            <span style={{fontSize:"var(--text-base)",fontWeight:600,color:"var(--clr-text)"}}>
              {WORKFLOW[stepIndex]?.icon} {WORKFLOW[stepIndex]?.label}
            </span>
            {biodata.name && step !== "registration" && (
              <span style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)"}}>
                {biodata.name} · {complaints.length} complaint(s)
              </span>
            )}
          </div>

          {step === "registration" && renderRegistration()}
          {step === "chief_complaint" && renderChiefComplaint()}
          {step === "hpi" && renderHpi()}
          {step === "pmh" && renderPmh()}
          {step === "drug_history" && renderDrugHistory()}
          {step === "social_history" && renderSocialHistory()}
          {step === "ros" && renderRos()}
          {step === "examination" && renderExamination()}
          {step === "investigations" && renderInvestigations()}
          {step === "diagnosis" && renderDiagnosis()}
          {step === "management" && renderManagement()}
          {step === "documentation" && renderDocumentation()}
          {step === "complete" && renderComplete()}
        </main>

        {/* ── RIGHT DOCUMENTATION PANEL ── */}
        <aside className="app-docs-panel">
          {/* ═══════════════════════════════════════════════════════════
             CLINICAL DOCUMENTATION — Auto-generated from encounter data
             Rules: Never manually edited. Every section has a purpose.
             ═══════════════════════════════════════════════════════════ */}

          {/* ── SECTION 1: PATIENT IDENTIFICATION ── */}
          <div className="docs-section">
            <div className="docs-header">
              <span>PATIENT IDENTIFICATION</span>
              {biodata.name && <span className="docs-badge">✓</span>}
            </div>
            {biodata.name ? (
              <div style={{fontSize:"var(--text-xs)",padding:"0 var(--space-1)"}}>
                <div className="docs-info-row"><span className="docs-info-label">Name</span><span className="docs-info-value" style={{fontWeight:700}}>{biodata.name}</span></div>
                <div className="docs-info-row"><span className="docs-info-label">Age/Sex</span><span className="docs-info-value">{biodata.age} {biodata.ageUnit} · {biodata.sex}</span></div>
                {biodata.occupation && <div className="docs-info-row"><span className="docs-info-label">Occupation</span><span className="docs-info-value">{biodata.occupation}</span></div>}
                {biodata.residence && <div className="docs-info-row"><span className="docs-info-label">Residence</span><span className="docs-info-value">{biodata.residence}</span></div>}
                <div className="docs-info-row"><span className="docs-info-label">Facility</span><span className="docs-info-value">{selectedFacility.replace("-", " ")}</span></div>
                <div className="docs-info-row"><span className="docs-info-label">Department</span><span className="docs-info-value">{DEPARTMENTS.find(d => d.id === selectedDepartment)?.label || selectedDepartment}</span></div>
                <div className="docs-info-row"><span className="docs-info-label">Encounter</span><span className="docs-info-value">{encounterId || "New"}</span></div>
                <div className="docs-info-row"><span className="docs-info-label">Date/Time</span><span className="docs-info-value">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span></div>
                <div className="docs-info-row"><span className="docs-info-label">Clinician</span><span className="docs-info-value">{CLINICIAN_ROLES.find(r => r.id === clinicianRole)?.icon} {CLINICIAN_ROLES.find(r => r.id === clinicianRole)?.label}</span></div>
                {biodata.informant && <div className="docs-info-row"><span className="docs-info-label">Informant</span><span className="docs-info-value">{biodata.informant} ({biodata.informantRelation || "self"})</span></div>}
                <div className="docs-info-row"><span className="docs-info-label">Reliability</span><span className="docs-info-value"><span style={{color:"var(--clr-success-dark)"}}>●</span> Reliable</span></div>
              </div>
            ) : (
              <div className="docs-empty">Awaiting biodata entry</div>
            )}
          </div>

          {/* ── SECTION 2: CHIEF COMPLAINTS ── */}
          <div className="docs-section">
            <div className="docs-header">
              <span>CHIEF COMPLAINTS</span>
              {complaints.length > 0 && <span className="docs-badge">{complaints.length > 4 ? `${complaints.length}` : ""}</span>}
            </div>
            {complaints.length > 0 ? (
              <div style={{fontSize:"var(--text-xs)",padding:"0 var(--space-1)"}}>
                {[...complaints].sort((a,b) => a.createdAt - b.createdAt).slice(0, 4).map((c, i) => (
                  <div key={c.id} className="docs-info-row" style={{borderLeft:`2px solid ${i === 0 ? "var(--clr-accent)" : "var(--clr-border)"}`,paddingLeft:"var(--space-2)",marginBottom:2}}>
                    <span style={{flex:1}}>
                      <span style={{fontWeight:i === 0 ? 700 : 400,color:"var(--clr-text)"}}>{c.concept.replace(/_/g, " ")}</span>
                      <span style={{color:"var(--clr-text-muted)",marginLeft:"var(--space-2)"}}>× {c.duration || "?"}</span>
                    </span>
                    <span style={{color:"var(--clr-text-secondary)",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{c.text}"</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="docs-empty">No complaints recorded</div>
            )}
          </div>

          {/* ── SECTION 3: CLINICAL TIMELINE ── */}
          <div className="docs-section">
            <div className="docs-header">
              <span>CLINICAL TIMELINE</span>
              {hpiOutput?.timeline && hpiOutput.timeline.length > 0 && <span className="docs-badge">{hpiOutput.timeline.length}</span>}
            </div>
            {hpiOutput?.timeline && hpiOutput.timeline.length > 0 ? (
              <div>
                {[...hpiOutput.timeline].sort((a,b) => a.relativeDay - b.relativeDay).map((t, i) => (
                  <div key={t.id} className="docs-timeline-item" style={{borderLeftColor:i === 0 ? "var(--clr-accent)" : "var(--clr-border)"}}>
                    <div>
                      <div className="docs-timeline-label">{t.label}</div>
                      <div className="docs-timeline-meta">Day {t.relativeDay} · {t.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : biodata.name ? (
              <div className="docs-empty">Timeline auto-populates as symptoms are explored</div>
            ) : (
              <div className="docs-empty">Awaiting encounter data</div>
            )}
          </div>

          {/* ── SECTION 4: ACTIVE PROBLEMS ── */}
          <div className="docs-section">
            <div className="docs-header"><span>ACTIVE PROBLEMS</span></div>
            {hpiEngineRef.current && hpiEngineRef.current.symptoms.length > 0 ? (
              <div style={{fontSize:"var(--text-xs)",padding:"0 var(--space-1)"}}>
                {hpiEngineRef.current.symptoms.map(s => {
                  const status = s.explorationComplete ? "Complete" : s.coreData && Object.keys(s.coreData).length > 0 ? "Exploring" : "Pending"
                  const statusColor = status === "Complete" ? "var(--clr-success-dark)" : status === "Exploring" ? "var(--clr-accent-dark)" : "var(--clr-text-muted)"
                  return (
                    <div key={s.id} className="docs-info-row">
                      <span style={{fontWeight:s.isPrimary ? 700 : 400,color:"var(--clr-text)"}}>
                        {s.isPrimary ? "★ " : ""}{s.label}
                      </span>
                      <span style={{color:statusColor,fontWeight:500}}>{status}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="docs-empty">No active problems — enter HPI</div>
            )}
          </div>

          {/* ── SECTION 5: HPI DOCUMENT ── */}
          <div className="docs-section">
            <div className="docs-header">
              <span>HISTORY OF PRESENTING ILLNESS</span>
              <span className="docs-badge" style={{background: hpiStatus === "Complete" ? "var(--clr-success-light)" : hpiStatus === "Live" ? "rgba(49,151,149,0.1)" : "var(--clr-bg-alt)",color: hpiStatus === "Complete" ? "var(--clr-success-dark)" : hpiStatus === "Live" ? "var(--clr-accent-dark)" : "var(--clr-text-muted)"}}>
                {hpiStatus}
              </span>
            </div>
            {hpiStatus === "Complete" && hpiOutput?.narrative ? (
              <div className="docs-narrative" style={{maxHeight:250}}>{hpiOutput.narrative}</div>
            ) : hpiStatus === "Live" && hpiOutput?.narrative ? (
              <div className="docs-narrative" style={{maxHeight:200,opacity:0.8}}>{hpiOutput.narrative}</div>
            ) : hpiStatus === "Draft" ? (
              <div className="docs-narrative" style={{textAlign:"center",color:"var(--clr-text-muted)",fontSize:"var(--text-sm)",padding:"var(--space-6) var(--space-2)"}}>
                <div style={{fontWeight:600,marginBottom:"var(--space-2)"}}>History still being collected...</div>
                <div style={{fontSize:"var(--text-xs)"}}>The narrative will auto-generate once primary symptom exploration and timeline are complete.</div>
              </div>
            ) : (
              <div className="docs-empty">Awaiting HPI entry</div>
            )}
          </div>

          {/* ── SECTION 6: CLINICAL COVERAGE ── */}
          <div className="docs-section">
            <div className="docs-header">
              <span>CLINICAL COVERAGE</span>
              {biodata.name && <span className="docs-badge">{overallCoverage}%</span>}
            </div>
            {biodata.name ? (
              <div style={{fontSize:"var(--text-xs)",padding:"0 var(--space-1)"}}>
                {coverageData.map(d => (
                  <div key={d.domain} style={{display:"flex",alignItems:"center",gap:"var(--space-2)",padding:"2px 0"}}>
                    <span style={{flex:1,color:"var(--clr-text-secondary)"}}>{d.domain}</span>
                    <div style={{width:60,height:6,background:"var(--clr-bg-alt)",borderRadius:3,overflow:"hidden",flexShrink:0}}>
                      <div style={{width:`${d.percent}%`,height:"100%",background:d.percent >= 80 ? "var(--clr-success)" : d.percent >= 50 ? "var(--clr-warning)" : "var(--clr-critical)",borderRadius:3,transition:"width 0.3s ease"}} />
                    </div>
                    <span style={{width:28,textAlign:"right",fontWeight:600,color:"var(--clr-text)",fontFamily:"var(--font-mono)"}}>{d.percent}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="docs-empty">Coverage data appears after Registration</div>
            )}
          </div>

          {/* ── SECTION 7: OUTSTANDING INFORMATION ── */}
          <div className="docs-section">
            <div className="docs-header">
              <span>STILL NEEDED</span>
              {outstandingItems.length > 0 && <span className="docs-badge">{outstandingItems.length}</span>}
            </div>
            {outstandingItems.length > 0 ? (
              <div style={{fontSize:"var(--text-xs)",padding:"0 var(--space-1)"}}>
                {outstandingItems.map((item, i) => (
                  <div key={i} className="docs-info-row" style={{border:"none",padding:"var(--space-1) var(--space-2)",gap:"var(--space-2)"}}>
                    <span style={{color:"var(--clr-accent-dark)"}}>•</span>
                    <span style={{color:"var(--clr-text-secondary)"}}>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="docs-empty">{biodata.name ? "All information collected" : "Awaiting data entry"}</div>
            )}
          </div>

          {/* ── SECTION 8: CURRENT CLINICAL POSSIBILITIES ── */}
          <div className="docs-section">
            <div className="docs-header">
              <span>CURRENT CLINICAL POSSIBILITIES</span>
              {hpiOutput?.activeDifferentials && <span className="docs-badge">{hpiOutput.activeDifferentials.filter(d => !d.isExcluded).length}</span>}
            </div>
            {hpiOutput?.activeDifferentials && hpiOutput.activeDifferentials.filter(d => !d.isExcluded).length > 0 ? (
              <div>
                <div style={{fontSize:"var(--text-xs)",fontWeight:600,color:"var(--clr-text-muted)",textTransform:"uppercase",letterSpacing:"0.04em",padding:"0 var(--space-2) var(--space-1)",marginTop:"var(--space-1)"}}>
                  Being Explored
                </div>
                {hpiOutput.activeDifferentials.filter(d => !d.isExcluded).sort((a,b) => b.probability - a.probability).slice(0, 6).map(d => (
                  <div key={d.id} className={`docs-ddx-item ${d.probability >= 70 ? "primary" : d.probability >= 40 ? "likely" : "possible"}`}>
                    <span className="docs-ddx-name">{d.name}</span>
                    <span className="docs-ddx-prob">{(d.probability).toFixed(0)}%</span>
                  </div>
                ))}
                {hpiOutput.activeDifferentials.filter(d => d.isExcluded).length > 0 && (
                  <div>
                    <div style={{fontSize:"var(--text-xs)",fontWeight:600,color:"var(--clr-text-muted)",textTransform:"uppercase",letterSpacing:"0.04em",padding:"0 var(--space-2) var(--space-1)",marginTop:"var(--space-2)"}}>
                      Being Excluded
                    </div>
                    {hpiOutput.activeDifferentials.filter(d => d.isExcluded).map(d => (
                      <div key={d.id} className="docs-ddx-item possible" style={{opacity:0.5}}>
                        <span className="docs-ddx-name">{d.name}</span>
                        <span style={{fontSize:"var(--text-xs)",color:"var(--clr-text-muted)"}}>{d.exclusionReason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="docs-empty">Possibilities appear as data is collected</div>
            )}
          </div>

          {/* ── SECTION 9: SAFETY STATUS ── */}
          <div className="docs-section">
            <div className="docs-header"><span>SAFETY STATUS</span></div>
            <div style={{fontSize:"var(--text-xs)",padding:"0 var(--space-1)"}}>
              <div className="docs-info-row">
                <span className="docs-info-label">Emergency Screen</span>
                <span className="docs-info-value" style={{color:hpiEngineReady ? "var(--clr-success-dark)" : "var(--clr-text-muted)"}}>
                  {hpiEngineReady ? "✓ Completed" : "○ Pending"}
                </span>
              </div>
              <div className="docs-info-row">
  <span className="docs-info-label">Red Flags</span>
  <span className="docs-info-value" style={{color:(hpiOutput?.state.unresolvedAlerts.length ?? 0) === 0 ? "var(--clr-success-dark)" : "var(--clr-critical)"}}>
    {(hpiOutput?.state.unresolvedAlerts.length ?? 0) === 0 ? "None" : `⚠ ${hpiOutput?.state.unresolvedAlerts.length} active`}
  </span>
</div>
              {hpiOutput?.state.unresolvedAlerts && hpiOutput.state.unresolvedAlerts.length > 0 && (
                <div style={{padding:"var(--space-1) var(--space-2)",marginTop:"var(--space-1)",background:"rgba(229,62,62,0.05)",borderRadius:"var(--radius-sm)"}}>
                  {hpiOutput.state.unresolvedAlerts.map((a, i) => (
                    <div key={i} style={{color:"var(--clr-critical)",padding:"1px 0"}}>⚠ {a.replace(/_/g, " ")}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 10: QUESTION PROGRESS ── */}
          <div className="docs-section">
            <div className="docs-header"><span>HISTORY PROGRESS</span></div>
            {biodata.name ? (
              <div style={{fontSize:"var(--text-xs)",padding:"0 var(--space-1)"}}>
                {coverageData.map(d => (
                  <div key={d.domain} style={{display:"flex",alignItems:"center",gap:"var(--space-2)",padding:"2px 0"}}>
                    <span style={{flex:1,color:"var(--clr-text-secondary)",fontSize:"10px"}}>{d.domain}</span>
                    <div style={{width:50,height:4,background:"var(--clr-bg-alt)",borderRadius:2,overflow:"hidden",flexShrink:0}}>
                      <div style={{width:`${d.percent}%`,height:"100%",background:d.percent >= 80 ? "var(--clr-success)" : d.percent >= 50 ? "var(--clr-warning)" : "var(--clr-critical)",borderRadius:2}} />
                    </div>
                    <span style={{width:24,textAlign:"right",fontWeight:600,fontSize:"10px",color:"var(--clr-text)",fontFamily:"var(--font-mono)"}}>{d.percent}%</span>
                  </div>
                ))}
                <div style={{padding:"var(--space-1) var(--space-2)",marginTop:"var(--space-1)",textAlign:"center",fontWeight:600,fontSize:"var(--text-xs)",color:"var(--clr-text)",borderTop:"1px solid var(--clr-divider)"}}>
                  Overall — {overallCoverage}%
                </div>
              </div>
            ) : (
              <div className="docs-empty">Progress appears after Registration</div>
            )}
          </div>

          {/* ── SECTION 11: WORKFLOW PROGRESS ── */}
          <div className="docs-section">
            <div className="docs-header"><span>WORKFLOW PROGRESS</span></div>
            <div style={{fontSize:"var(--text-xs)",padding:"0 var(--space-1)"}}>
              <div className="docs-info-row">
                <span className="docs-info-label">Current Stage</span>
                <span className="docs-info-value" style={{color:"var(--clr-accent-dark)"}}>{WORKFLOW[stepIndex]?.label || "—"}</span>
              </div>
              <div className="docs-info-row">
                <span className="docs-info-label">History Stage</span>
                <span className="docs-info-value">{hpiOutput?.state.status.replace(/_/g, " ") || "Not started"}</span>
              </div>
              <div className="docs-info-row">
                <span className="docs-info-label">Next Step</span>
                <span className="docs-info-value" style={{color:"var(--clr-primary-light)"}}>
                  {stepIndex < WORKFLOW.length - 1 ? `→ ${WORKFLOW[stepIndex + 1].label}` : "Complete"}
                </span>
              </div>
            </div>
          </div>

          {/* ── SECTION 12: PROBLEM SUMMARY (auto-summary) ── */}
          <div className="docs-section">
            <div className="docs-header"><span>PROBLEM SUMMARY</span></div>
            {biodata.name && complaints.length > 0 ? (
              <div style={{fontSize:"var(--text-xs)",padding:"var(--space-1) var(--space-2)",color:"var(--clr-text-secondary)",background:"var(--clr-bg)",borderRadius:"var(--radius-sm)",lineHeight:1.6}}>
                {biodata.name.split(" ")[0]} is a {biodata.age}-year-old {biodata.sex}{biodata.occupation ? ` ${biodata.occupation}` : ""} presenting with {complaints.map((c, i) => `${c.concept.replace(/_/g, " ")}${c.duration ? ` × ${c.duration} ${c.durationUnit || "days"}` : ""}${i < complaints.length - 1 ? ", " : ""}`).join("")}.
                {hpiOutput?.timeline && hpiOutput.timeline.length > 0 ? ` Symptom onset began approximately ${Math.min(...hpiOutput.timeline.map(t => t.relativeDay))} days ago.` : ""}
              </div>
            ) : (
              <div className="docs-empty">Summary generated after CC entry</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
