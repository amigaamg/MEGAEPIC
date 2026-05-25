"use client";
/**
 * HTNDashboard.tsx — AMEXAN HTN Control Center v2.0
 * ESC/ESH 2023 · AHA/ACC 2017 · JNC8 · WHO HTN Guidelines
 * Mobile-first · Real-time Firebase · Pharmacological intelligence
 * Full DB integration: prescriptions, messages, clinicalNotes,
 *   referrals, education_logs, patientNotifications, labOrders
 */

import {
  useState, useEffect, useCallback, useMemo, useRef, memo
} from "react";
import {
  collection, query, where, orderBy, getDocs, addDoc, updateDoc,
  deleteDoc, doc, getDoc, setDoc, Timestamp, serverTimestamp,
  onSnapshot, limit, writeBatch,
} from "firebase/firestore";
import BPTrendChart from "@/components/bp-monitor/BPTrendChart";
import AdherenceTracker from "@/components/bp-monitor/AdherenceTracker";
import AmexanClinicalMessaging from "@/components/AmexanClinicalMessaging";
import ClinicalAlerts from "@/components/bp-monitor/ClinicalAlerts";
import MedicationTimeline from "@/components/bp-monitor/MedicationTimeline";
import { db } from "@/lib/firebase";
import { classifyBP, calculateAdherence } from "@/lib/bpClassification";

// ─── Pharmacological Intelligence Database ────────────────────────────────────

interface PharmaEntry {
  drugClass: string; mechanism: string; minDose: number; maxDose: number;
  unit: string; commonDoses: string[]; frequencies: string[]; routes: string[];
  indications: string[]; contraindications: string[]; warnings: string[];
  sideEffects: string[]; patientInstructions: string; monitoring: string[];
  interactions: string[]; pregnancyCategory: string; renalDose?: string;
  hepaticDose?: string; color: string; tlColor: string; /* timeline */
}

export const PHARMA_DB: Record<string, PharmaEntry> = {
  "Amlodipine": {
    drugClass: "Calcium Channel Blocker (DHP-CCB)",
    mechanism: "Blocks L-type calcium channels → peripheral vasodilation → ↓ BP & afterload. Long t½ ~35–50h.",
    minDose: 2.5, maxDose: 10, unit: "mg",
    commonDoses: ["2.5","5","10"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension","Stable angina","Variant angina","Coronary artery disease","Raynaud's phenomenon"],
    contraindications: ["Severe aortic stenosis","Cardiogenic shock","Unstable angina (immediate-release)"],
    warnings: ["Peripheral edema (dose-dependent, up to 15% at 10mg)","Reflex tachycardia possible","Gingival hyperplasia (rare, with poor dental hygiene)","Worsening angina on initiation","Hepatic impairment: halve dose"],
    sideEffects: ["Ankle/leg edema","Flushing","Headache","Fatigue","Palpitations","Nausea","Dizziness"],
    patientInstructions: "Take ONCE DAILY at the same time each day — morning or evening (choose one and stick to it). Can be taken WITH or WITHOUT food. Do NOT stop suddenly as this may worsen angina. Report any ankle swelling, severe dizziness, or chest pain immediately.",
    monitoring: ["BP (sitting and standing)","Heart rate","Bilateral ankle edema","LFTs if hepatic disease"],
    interactions: ["⚠️ Simvastatin — max 20mg/day with amlodipine (rhabdomyolysis risk)","⚠️ Cyclosporine — increased cyclosporine levels","⚠️ CYP3A4 inhibitors (clarithromycin, ketoconazole) — ↑ amlodipine levels","NSAIDs — reduced antihypertensive effect"],
    pregnancyCategory: "C — use only if benefit outweighs risk",
    renalDose: "No dose adjustment required (not renally cleared)",
    hepaticDose: "Start 2.5mg OD; titrate cautiously",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Losartan": {
    drugClass: "Angiotensin Receptor Blocker (ARB)",
    mechanism: "Selectively blocks AT1 receptors → ↓ vasoconstriction, aldosterone, sodium retention → ↓ BP + renoprotection.",
    minDose: 25, maxDose: 100, unit: "mg",
    commonDoses: ["25","50","100"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension","Diabetic nephropathy (type 2)","Heart failure (ACEi-intolerant)","LVH reduction","Post-MI with HF"],
    contraindications: ["Pregnancy (2nd & 3rd trimester — TERATOGENIC)","Bilateral renal artery stenosis","Severe hyperkalemia (K⁺ >6.0 mmol/L)","Concurrent ACEi + direct renin inhibitor (triple RAAS blockade)"],
    warnings: ["Monitor K⁺ and creatinine at 1–2 weeks after initiation and dose change","First-dose hypotension especially if volume-depleted or on diuretics","Acute kidney injury with NSAIDs or dehydration","Avoid in pregnancy — counsel women of childbearing age"],
    sideEffects: ["Dizziness/lightheadedness","Hyperkalemia","↑ Creatinine (acceptable if <30% rise)","Back pain","Diarrhea","Cough (much less than ACEi)","Hypotension"],
    patientInstructions: "Take ONCE DAILY, same time each day. Can take with or without food. AVOID potassium supplements or salt substitutes (containing KCl) unless prescribed. Drink adequate fluids. Stop and seek care if pregnant. Report dizziness, muscle weakness, or reduced urination.",
    monitoring: ["BP","Serum K⁺ (baseline, 1–2wk, 3mo, then annually)","Creatinine/eGFR","Urine ACR (if diabetic/CKD)","HbA1c if diabetic"],
    interactions: ["⚠️ NSAIDs — ↑ renal risk, ↓ BP efficacy","⚠️ Potassium-sparing diuretics (spironolactone, amiloride) — hyperkalemia","⚠️ Lithium — ↑ lithium toxicity","⚠️ ACEi — dual RAAS blockade: avoid unless specialist supervision","Aliskiren — contraindicated in diabetes/CKD"],
    pregnancyCategory: "D (2nd/3rd trimester) — CONTRAINDICATED",
    renalDose: "eGFR 15–30: use with caution; eGFR <15: not recommended",
    hepaticDose: "Start 25mg OD in hepatic impairment",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Lisinopril": {
    drugClass: "ACE Inhibitor (ACEi)",
    mechanism: "Inhibits ACE → ↓ angiotensin II → vasodilation + ↓ aldosterone + ↓ sympathetic activation → ↓ BP + renoprotection.",
    minDose: 5, maxDose: 40, unit: "mg",
    commonDoses: ["5","10","20","40"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension","Heart failure with reduced EF (HFrEF)","Post-MI","Diabetic nephropathy (type 1)","CKD with proteinuria"],
    contraindications: ["Pregnancy (ALL trimesters)","Angioedema (prior ACEi-related)","Hereditary/idiopathic angioedema","Bilateral renal artery stenosis","Concurrent ARB + aliskiren (in DM/CKD)"],
    warnings: ["Dry cough in 10–20% (particularly in women and Asians) — switch to ARB if intolerable","Angioedema (0.1–0.5%) — rare but life-threatening; educate patient","First-dose hypotension — start low, especially if on diuretics","Hyperkalemia risk — monitor K⁺","Acute kidney injury with dehydration or NSAIDs"],
    sideEffects: ["Dry persistent cough (most common)","Dizziness","Hyperkalemia","↑ Creatinine","Hypotension","Headache","Angioedema (rare but serious)","Taste disturbance"],
    patientInstructions: "Take ONCE DAILY, preferably in the morning. Can take with or without food. You may develop a dry, tickly cough — tell your doctor as a different drug may suit you better. SEEK EMERGENCY CARE immediately if your face, lips, tongue, or throat swell (angioedema). Avoid NSAIDs (ibuprofen, diclofenac). Do NOT take if pregnant.",
    monitoring: ["BP","Serum K⁺","Creatinine/eGFR","Check at 1–2wk after start/dose change","Urine ACR in CKD/DM"],
    interactions: ["⚠️ ARBs/Aliskiren — dual RAAS blockade: avoid","⚠️ NSAIDs — ↑ renal risk","⚠️ Potassium-sparing diuretics — hyperkalemia","⚠️ Lithium — ↑ toxicity","⚠️ mTOR inhibitors (sirolimus) — ↑ angioedema risk","Antacids — may ↓ absorption"],
    pregnancyCategory: "D (all trimesters) — CONTRAINDICATED",
    renalDose: "eGFR 10–30: start 5mg, max 40mg; eGFR <10: start 2.5mg",
    color: "#059669", tlColor: "#10b981",
  },
  "Ramipril": {
    drugClass: "ACE Inhibitor (ACEi) — Prodrug",
    mechanism: "Prodrug → ramiprilat (active) inhibits ACE → ↓ angiotensin II → vasodilation + ↓ aldosterone. Long t½, twice-daily dosing option.",
    minDose: 1.25, maxDose: 10, unit: "mg",
    commonDoses: ["1.25","2.5","5","10"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Hypertension","Heart failure post-MI","Prevention of MI/stroke in high CV risk (HOPE trial)","CKD/proteinuria","Diabetic nephropathy"],
    contraindications: ["Pregnancy","Prior ACEi-induced angioedema","Bilateral renal artery stenosis"],
    warnings: ["Cough (10–15% — switch to ARB if troublesome)","Angioedema — rare but life-threatening","Monitor renal function and K⁺","HOPE trial: reduces CV events even in normotensive high-risk patients"],
    sideEffects: ["Dry cough","Dizziness","Hyperkalemia","↑ Creatinine","Hypotension","Headache","Asthenia"],
    patientInstructions: "Take once or twice daily as directed. May be taken with or without food. Swallow capsule whole or sprinkle on water. Report dry cough, face/tongue swelling (emergency!), dizziness. Avoid ibuprofen. Do not take if pregnant.",
    monitoring: ["BP","K⁺","Creatinine/eGFR","Urine ACR"],
    interactions: ["NSAIDs — ↑ renal risk","Potassium-sparing diuretics — hyperkalemia","Aliskiren/ARBs — avoid dual RAAS","Lithium — monitor levels"],
    pregnancyCategory: "D — CONTRAINDICATED",
    renalDose: "eGFR 10–30: start 1.25mg OD; titrate slowly",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Atenolol": {
    drugClass: "Beta-Blocker (β1-selective, cardioselective)",
    mechanism: "Selectively blocks β1-adrenergic receptors → ↓ HR, ↓ contractility, ↓ renin → ↓ BP & myocardial O₂ demand.",
    minDose: 25, maxDose: 100, unit: "mg",
    commonDoses: ["25","50","100"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension","Angina pectoris","Post-MI","SVT/rate control in AF","Hyperthyroidism (symptomatic)","Essential tremor"],
    contraindications: ["Asthma/severe COPD (relative — use cautiously)","2nd/3rd degree AV block (without pacemaker)","Sick sinus syndrome","Severe bradycardia (HR <60 at rest)","Decompensated heart failure","Cardiogenic shock","Prinzmetal angina (may ↑ vasospasm)"],
    warnings: ["Do NOT stop suddenly — rebound tachycardia/angina/MI risk (taper over 2 weeks)","May mask hypoglycemia symptoms in diabetics (sweating persists)","Worsens peripheral arterial disease — use with caution","Fatigue, cold extremities common","Less effective in Black patients — combine with CCB or diuretic"],
    sideEffects: ["Fatigue","Bradycardia","Cold hands/feet","Dizziness","Depression","Sexual dysfunction","Nightmares","Dyspnea (in susceptible patients)"],
    patientInstructions: "Take ONCE DAILY in the morning. Do NOT stop this medication suddenly — this can be dangerous (may cause a heart attack). Report dizziness, very slow pulse (<50 bpm), or breathlessness. If diabetic, know that this drug may hide low sugar symptoms except sweating.",
    monitoring: ["HR (maintain ≥55–60 bpm at rest)","BP","Blood glucose (in diabetics)","Spirometry if any respiratory symptoms"],
    interactions: ["⚠️ Verapamil/diltiazem — severe bradycardia/AV block","⚠️ Clonidine — rebound HTN if both stopped; stop beta-blocker first","⚠️ NSAIDs — ↓ antihypertensive effect","Insulin/sulphonylureas — masks hypoglycemia","Antiarrhythmics — additive bradycardia"],
    pregnancyCategory: "D — associated with IUGR; avoid if possible",
    renalDose: "eGFR 15–35: 25–50mg OD; eGFR <15: 25mg OD or 50mg every 4 days",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "Metoprolol": {
    drugClass: "Beta-Blocker (β1-selective) — Tartrate/Succinate",
    mechanism: "Selective β1-blockade → ↓ HR, ↓ contractility, ↓ BP, ↓ renin. Succinate form: extended-release, OD dosing.",
    minDose: 25, maxDose: 200, unit: "mg",
    commonDoses: ["25","50","100","200"], frequencies: ["OD (succinate)","BD (tartrate)"],
    routes: ["Oral"], indications: ["Hypertension","Angina","HFrEF (proven mortality benefit — MERIT-HF)","Post-MI","AF rate control","Prophylaxis of migraine","Hyperthyroidism"],
    contraindications: ["Severe asthma","2nd/3rd AV block","Sick sinus syndrome","HR <60","Decompensated HF (unless initiated in stable HF)"],
    warnings: ["Never stop abruptly (taper 2 weeks)","Succinate (extended-release) preferred in HF","May exacerbate Raynaud's","Depression reported"],
    sideEffects: ["Fatigue","Bradycardia","Cold extremities","Insomnia","Nightmares","Sexual dysfunction","Dyspnea"],
    patientInstructions: "Take as directed (once or twice daily). Swallow succinate tablets whole — do not crush. Take with food if stomach upset occurs. NEVER stop suddenly. Report chest pain, very slow pulse, or breathlessness.",
    monitoring: ["HR","BP","LFTs (rarely needed)","BG in diabetics"],
    interactions: ["Verapamil/diltiazem — bradycardia/AV block","CYP2D6 inhibitors (fluoxetine, paroxetine) — ↑ metoprolol levels","Clonidine — rebound on withdrawal"],
    pregnancyCategory: "C — use with caution",
    renalDose: "No dose adjustment required",
    color: "#c2410c", tlColor: "#ea580c",
  },
  "Hydrochlorothiazide": {
    drugClass: "Thiazide Diuretic",
    mechanism: "Inhibits NaCl cotransporter in distal tubule → ↑ Na⁺/water excretion → ↓ plasma volume → ↓ BP (long-term: ↓ vascular resistance).",
    minDose: 12.5, maxDose: 50, unit: "mg",
    commonDoses: ["12.5","25","50"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension (first-line esp. in Black patients)","Edema (HF, renal, hepatic)","Nephrogenic DI (paradoxically)","Calcium stones (↓ urinary calcium)"],
    contraindications: ["Anuria","Sulfonamide allergy","Severe hyponatremia/hypokalemia","Refractory hypokalemia"],
    warnings: ["Hypokalemia (monitor K⁺)","Hyponatremia (especially elderly)","Hyperuricemia → gout precipitation","Hyperglycemia — impairs insulin release","Photosensitivity — use sunscreen","Ineffective when eGFR <30"],
    sideEffects: ["Hypokalemia (most common)","Polyuria","Hyperuricemia/gout","Hyperglycemia","Hyperlipidemia","Impotence","Photosensitivity","Hypercalcemia"],
    patientInstructions: "Take in the MORNING (causes extra urination — avoid evening doses). Take with food to prevent stomach upset. Eat potassium-rich foods (banana, orange, spinach) unless told otherwise. Use sunscreen/protective clothing in sun. Report muscle cramps, weakness, or excessive thirst.",
    monitoring: ["U&E (K⁺, Na⁺) — at baseline, 1 month, then 6-monthly","Uric acid","Fasting glucose","Lipid profile","BP"],
    interactions: ["⚠️ ACEi/ARBs — additive K⁺ loss: monitor","⚠️ Digoxin — hypokalemia ↑ digoxin toxicity","⚠️ Lithium — ↑ toxicity","NSAIDs — ↓ diuretic effect","Corticosteroids — ↑ hypokalemia","Antidiabetics — dose adjustment may be needed"],
    pregnancyCategory: "B — generally safe; avoid in pre-eclampsia",
    renalDose: "Avoid if eGFR <30 (ineffective)",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Indapamide": {
    drugClass: "Thiazide-like Diuretic (sulfonamide)",
    mechanism: "Inhibits distal tubule NaCl cotransporter; also direct vasodilatory effect. Lower metabolic side-effect profile than HCTZ.",
    minDose: 1.25, maxDose: 2.5, unit: "mg",
    commonDoses: ["1.25","2.5"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension (preferred over HCTZ — HYVET trial benefit in elderly)","Heart failure — mild edema","Prevention of stroke in HTN (PROGRESS trial)"],
    contraindications: ["Severe hepatic impairment","Severe renal failure (eGFR <15)","Hypokalemia","Sulfonamide allergy"],
    warnings: ["Hypokalemia (less than HCTZ)","Hyponatremia (especially elderly)","ECG changes if hypokalemia/hypomagnesemia","Photosensitivity"],
    sideEffects: ["Hypokalemia","Dizziness","Headache","Fatigue","Nausea","Photosensitivity","Rash"],
    patientInstructions: "Take in the MORNING to avoid nighttime urination. Take with water. Eat K-rich foods. Protect skin from sun. Report muscle cramps or extreme fatigue.",
    monitoring: ["U&E (K⁺, Na⁺)","BP","Weight","eGFR"],
    interactions: ["Digoxin — ↑ toxicity if hypokalemia","Antiarrhythmics — hypokalemia risk","Lithium — ↑ levels"],
    pregnancyCategory: "B",
    renalDose: "Avoid eGFR <15",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Spironolactone": {
    drugClass: "Mineralocorticoid Receptor Antagonist (MRA) / Potassium-sparing Diuretic",
    mechanism: "Blocks aldosterone receptors in collecting duct → ↑ Na⁺/water excretion, ↓ K⁺ excretion. Anti-fibrotic in heart/kidney.",
    minDose: 25, maxDose: 100, unit: "mg",
    commonDoses: ["25","50","100"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Resistant HTN (4th-line agent — PATHWAY-2 trial)","Primary hyperaldosteronism","HFrEF (eplerenone preferred if tolerability issue)","Ascites in cirrhosis","Hypokalemia on other diuretics","PCOS (off-label: anti-androgen)"],
    contraindications: ["Hyperkalemia (K⁺ >5.0 mmol/L)","Addison's disease","Severe renal failure (eGFR <30)","Pregnancy","Combined with amiloride/triamterene"],
    warnings: ["⚠️ HYPERKALEMIA — potentially life-threatening — mandatory K⁺ monitoring","Gynecomastia in men (15–20% — use eplerenone if problematic)","Menstrual irregularities in women","Avoid in severe renal impairment"],
    sideEffects: ["Hyperkalemia","Gynecomastia/breast pain (men)","Menstrual irregularities","Dizziness","GI upset","Fatigue","Impotence"],
    patientInstructions: "Take with food to reduce stomach upset. AVOID potassium-rich foods and potassium supplements unless directed. AVOID NSAIDs. Do NOT take if pregnant. Report muscle weakness, palpitations (may be high potassium). Gynecomastia (breast enlargement in men) — tell your doctor.",
    monitoring: ["⚠️ K⁺ — at 1 week, 4 weeks, then every 3–6 months (MANDATORY)","Creatinine/eGFR — same schedule","Na⁺","BP"],
    interactions: ["⚠️ ACEi/ARBs — ↑↑ hyperkalemia risk: mandatory K⁺ monitoring","⚠️ NSAIDs — ↑ renal risk, ↑ K⁺","⚠️ Digoxin — spironolactone ↑ digoxin half-life","Potassium supplements — contraindicated with high K⁺","Lithium — monitor levels"],
    pregnancyCategory: "D — CONTRAINDICATED",
    renalDose: "Avoid if eGFR <30; use with extreme caution 30–45",
    color: "#7c3aed", tlColor: "#a855f7",
  },
  "Furosemide": {
    drugClass: "Loop Diuretic",
    mechanism: "Inhibits Na⁺-K⁺-2Cl⁻ cotransporter in thick ascending loop of Henle → potent Na⁺/water excretion. Works in renal impairment.",
    minDose: 20, maxDose: 80, unit: "mg",
    commonDoses: ["20","40","80"], frequencies: ["OD","BD"], routes: ["Oral","IV","IM"],
    indications: ["Resistant HTN with CKD/fluid overload","Acute pulmonary edema","HF with fluid retention","Nephrotic syndrome","Hypercalcemia"],
    contraindications: ["Anuria (no urine output)","Sulfonamide allergy","Pre-coma/hepatic coma","Severe electrolyte depletion"],
    warnings: ["Profound diuresis — hypovolemia risk","Hypokalemia (more severe than thiazides)","Hyponatremia","Ototoxicity (high IV doses, rare oral)","Hyperuricemia/gout","Glucose intolerance"],
    sideEffects: ["Polyuria","Hypokalemia","Hypotension/dehydration","Hyponatremia","Gout","Tinnitus (high doses)","Muscle cramps","Photosensitivity"],
    patientInstructions: "Take in the MORNING (or morning + early afternoon for BD dosing — NOT in evening). Take on empty stomach for best effect, or with food if GI upset. You will urinate frequently after taking — plan ahead. Report dizziness, muscle cramps, ringing in ears. Weigh yourself daily — report >2kg gain overnight.",
    monitoring: ["U&E (K⁺, Na⁺, Mg²⁺) — frequently in induction, then 3-monthly","eGFR","BP (sitting/standing — orthostatic)","Daily weight","Uric acid"],
    interactions: ["⚠️ Digoxin — hypokalemia ↑ toxicity","⚠️ ACEi/ARBs — ↑ hypotension (first dose)","⚠️ Aminoglycosides — additive ototoxicity","⚠️ Lithium — ↑ toxicity","NSAIDs — ↓ efficacy, ↑ renal risk","Antidiabetics — dose adjustment"],
    pregnancyCategory: "C — use only if necessary",
    renalDose: "Effective across all eGFR ranges — may need higher doses in CKD",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Nifedipine": {
    drugClass: "Calcium Channel Blocker (DHP-CCB) — Dihydropyridine",
    mechanism: "Blocks L-type calcium channels → arterial vasodilation → ↓ BP. Immediate-release: rapid onset, avoid in HTN (use modified-release only).",
    minDose: 10, maxDose: 90, unit: "mg",
    commonDoses: ["10","20","30","60","90"], frequencies: ["OD (LA)","BD (MR)","TDS (IR — avoid in HTN)"],
    routes: ["Oral"],
    indications: ["Hypertension (LA/MR form ONLY)","Stable angina","Raynaud's phenomenon","Achalasia (esophageal spasm)"],
    contraindications: ["Immediate-release form for HTN (↑ mortality in studies)","Cardiogenic shock","Acute MI","Unstable angina"],
    warnings: ["⚠️ NEVER use immediate-release capsules for chronic HTN (↑ MI risk)","Reflex tachycardia (especially IR form)","Peripheral edema","Gingival hyperplasia","Hypotension — use cautiously with beta-blockers"],
    sideEffects: ["Flushing","Headache","Peripheral edema","Tachycardia (IR)","Gingival hyperplasia","Constipation","Dizziness"],
    patientInstructions: "Take the LONG-ACTING (LA/MR/XL) tablet as directed. Swallow whole — do NOT crush or chew. Report ankle swelling, severe headache, or racing heartbeat.",
    monitoring: ["BP","HR","Edema","Dental hygiene (gingival hyperplasia)"],
    interactions: ["Grapefruit juice — ↑ nifedipine levels (CYP3A4)","Rifampicin — ↓ nifedipine levels","Beta-blockers — risk of severe hypotension (used together in angina)","CYP3A4 inhibitors — ↑ levels"],
    pregnancyCategory: "C — caution; used for acute HTN in pregnancy (specialist guidance)",
    renalDose: "No dose adjustment required",
    color: "#f59e0b", tlColor: "#fbbf24",
  },
  "Doxazosin": {
    drugClass: "Alpha-1 Adrenergic Blocker",
    mechanism: "Selectively blocks α1-adrenoceptors → ↓ peripheral vascular resistance → ↓ BP. Also used in BPH (improves urinary flow).",
    minDose: 1, maxDose: 16, unit: "mg",
    commonDoses: ["1","2","4","8"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Resistant HTN (add-on)","HTN + BPH (dual benefit)","Raynaud's (off-label)"],
    contraindications: ["Orthostatic hypotension history","Congestive heart failure (ALLHAT: ↑ CHF risk)","Monotherapy in HF"],
    warnings: ["First-dose phenomenon — severe postural hypotension within 2–6h of first dose","Take AT BEDTIME for first dose (and first dose after restart)","'Intraoperative floppy iris syndrome' — warn surgeon before cataract surgery","ALLHAT trial: inferior to CCB/diuretic as first-line"],
    sideEffects: ["Postural hypotension (especially 1st dose)","Dizziness","Headache","Fatigue","Rhinitis","Edema","Incontinence (women — ↓ urethral tone)"],
    patientInstructions: "Take the FIRST DOSE AT BEDTIME to minimize dizziness. Sit up slowly and hold onto something before standing. Do NOT take if you need to drive soon after the first dose. Tell all surgeons/eye doctors you take this medication. Report falls or fainting.",
    monitoring: ["BP — standing (orthostatic)","Symptoms of dizziness/falls"],
    interactions: ["Other antihypertensives — ↑ hypotension risk","PDE5 inhibitors (sildenafil, tadalafil) — severe hypotension: warn patient","Verapamil — ↑ hypotension"],
    pregnancyCategory: "B — limited data",
    renalDose: "No dose adjustment required",
    color: "#6d28d9", tlColor: "#7c3aed",
  },
  "Methyldopa": {
    drugClass: "Central α2-Agonist",
    mechanism: "Converted to α-methylnorepinephrine → stimulates central α2 receptors → ↓ sympathetic outflow → ↓ BP. Drug of choice in pregnancy.",
    minDose: 250, maxDose: 1000, unit: "mg",
    commonDoses: ["250","500","750","1000"], frequencies: ["BD","TDS"], routes: ["Oral"],
    indications: ["⭐ Hypertension in PREGNANCY (first-line, safest)","Resistant HTN when other options exhausted","Hypertensive emergencies (IV form)"],
    contraindications: ["Active hepatic disease","Depression (↑ risk)","Pheochromocytoma","MAOIs (hypertensive crisis)","Hemolytic anemia history from methyldopa"],
    warnings: ["Sedation — most pronounced in first weeks","Positive Coombs test (10–20% — hemolytic anemia in 1–5%)","Monitor LFTs — rare hepatitis/hepatic necrosis","Depression — use with caution in psychiatric history","Peripheral edema — may need diuretic","Rebound HTN if stopped abruptly"],
    sideEffects: ["Sedation/drowsiness (very common)","Dry mouth","Headache","Fatigue","Depression","Edema","Postural hypotension","Sexual dysfunction"],
    patientInstructions: "Take 2–3 times daily as directed. This medicine causes DROWSINESS — do not drive or operate machinery until you know how it affects you. Rise slowly from sitting/lying. Report yellowing of eyes, dark urine, persistent fever, or mood changes. Safe in pregnancy.",
    monitoring: ["BP","CBC (Coombs test if prolonged use)","LFTs (at 6–12 weeks of therapy)","Mood/depression assessment"],
    interactions: ["⚠️ MAOIs — hypertensive crisis","⚠️ Lithium — ↑ lithium toxicity","Iron supplements — ↓ methyldopa absorption (separate by 2h)","Anesthetics — enhanced hypotension","Antidepressants — ↓ efficacy"],
    pregnancyCategory: "B — FIRST-LINE in pregnancy (most evidence)",
    renalDose: "Reduce dose frequency in severe renal impairment; accumulates",
    color: "#059669", tlColor: "#34d399",
  },
};

// Helper to look up drug info (case-insensitive, partial match)
export function getDrugInfo(name: string): PharmaEntry | null {
  const key = Object.keys(PHARMA_DB).find(k => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().startsWith(k.toLowerCase()));
  return key ? PHARMA_DB[key] : null;
}

// ─── Science-Based Clinical Alert Engine ──────────────────────────────────────

export interface ScientificAlert {
  id: string; severity: "critical"|"urgent"|"warning"|"info";
  category: string; title: string; detail: string;
  evidence: string; action: string; icon: string;
}

export function generateClinicalAlerts(
  readings: BPReading[],
  medications: Medication[],
  adherencePct: number,
  labOrders: LabOrder[],
): ScientificAlert[] {
  const alerts: ScientificAlert[] = [];
  if (!readings.length) return alerts;

  const last7 = readings.filter(r => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return r.recordedAt >= d;
  });
  const last30 = readings.filter(r => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return r.recordedAt >= d;
  });
  const latest = readings.at(-1)!;
  const avgSys30 = last30.length ? Math.round(last30.reduce((a, r) => a + r.systolic, 0) / last30.length) : 0;
  const avgDia30 = last30.length ? Math.round(last30.reduce((a, r) => a + r.diastolic, 0) / last30.length) : 0;

  // 1. Hypertensive Crisis (≥180/120)
  if (latest.systolic >= 180 || latest.diastolic >= 120) {
    alerts.push({ id: "crisis", severity: "critical", category: "BP Emergency",
      title: `Hypertensive Crisis: ${latest.systolic}/${latest.diastolic} mmHg`,
      detail: `Latest reading exceeds hypertensive crisis threshold (≥180/120 mmHg). Patient requires immediate clinical evaluation for end-organ damage.`,
      evidence: "AHA/ACC 2017; ESC/ESH 2023 — threshold for hypertensive emergency/urgency",
      action: "URGENT: Assess for symptoms (headache, vision change, chest pain, SOB). IV therapy if emergency. Target: reduce MAP by no more than 25% in first hour.",
      icon: "🚨" });
  }
  // 2. Hypertensive Urgency (160–179/100–119)
  else if (latest.systolic >= 160 || latest.diastolic >= 100) {
    alerts.push({ id: "urgency", severity: "urgent", category: "Uncontrolled HTN",
      title: `Stage 2 Hypertension: ${latest.systolic}/${latest.diastolic} mmHg`,
      detail: `Latest BP in Stage 2 range. Review medication adequacy. Consider adding or intensifying pharmacotherapy.`,
      evidence: "AHA/ACC 2017 Stage 2 HTN; ESC/ESH 2023 Grade 2 HTN (≥160/100 mmHg)",
      action: "Review current medications. Consider adding thiazide diuretic, ARB, or CCB. Assess adherence. Exclude white coat effect with ABPM.",
      icon: "⚠️" });
  }
  // 3. High 30-day average
  if (avgSys30 >= 140 && last30.length >= 7) {
    const meds = medications.filter(m => m.status === "active");
    alerts.push({ id: "avg_high", severity: "warning", category: "Sustained Uncontrolled HTN",
      title: `30-day Average BP Elevated: ${avgSys30}/${avgDia30} mmHg`,
      detail: `30-day average exceeds target (${meds.length === 0 ? "no medications" : `on ${meds.length} active medication(s)`}).`,
      evidence: "ESC/ESH 2023 — office BP target <140/90 mmHg; <130/80 in DM/CKD/very high risk",
      action: meds.length === 0 ? "Initiate antihypertensive therapy (RCT evidence for benefit above 140/90)." : `Consider intensifying therapy. Current ${meds.length} med(s). Combination preferred per ESC/ESH 2023 single-pill strategy.`,
      icon: "📊" });
  }
  // 4. Isolated Systolic Hypertension
  if (latest.systolic >= 140 && latest.diastolic < 90 && (latest.systolic - latest.diastolic) > 60) {
    alerts.push({ id: "ish", severity: "warning", category: "Isolated Systolic HTN",
      title: `Isolated Systolic HTN + High Pulse Pressure (${latest.systolic - latest.diastolic} mmHg)`,
      detail: "Elevated pulse pressure (>60 mmHg) suggests increased aortic stiffness — independent CV risk factor in elderly.",
      evidence: "SHEP, Syst-Eur trials; ESC/ESH 2023 — ISH common in elderly, treat to reduce CV events",
      action: "CCB or low-dose thiazide diuretic preferred in ISH. Avoid over-treatment (avoid diastolic <70 mmHg).",
      icon: "🫀" });
  }
  // 5. Low adherence
  if (adherencePct < 50 && last30.length >= 5) {
    alerts.push({ id: "adherence", severity: "urgent", category: "Medication Non-Adherence",
      title: `Low BP Monitoring Adherence: ${adherencePct}%`,
      detail: "Monitoring adherence <50% impairs clinical decision-making. Home BP non-adherence associated with poorer outcomes.",
      evidence: "ESC/ESH 2023 — home BP monitoring 2x/day, 7 days recommended for diagnosis/monitoring",
      action: "Counsel patient on importance of monitoring. Consider simplifying regimen. Screen for non-adherence barriers (cost, side effects, forgetfulness).",
      icon: "📅" });
  }
  // 6. Missing readings (>7 days gap)
  const daysSinceLastReading = Math.floor((Date.now() - latest.recordedAt.getTime()) / 86400000);
  if (daysSinceLastReading >= 7) {
    alerts.push({ id: "gap", severity: "warning", category: "Monitoring Gap",
      title: `No BP Reading for ${daysSinceLastReading} Days`,
      detail: "Monitoring gap identified. Regular home BP monitoring is essential for adequate BP management.",
      evidence: "ESC/ESH 2023 — minimum 12 readings over 4 days recommended for home BP assessment",
      action: "Contact patient to resume monitoring. Check if device is functioning. Consider telemedicine check-in.",
      icon: "📵" });
  }
  // 7. Rising trend (last 7 days vs previous 7 days)
  const prev7 = readings.filter(r => {
    const d1 = new Date(); d1.setDate(d1.getDate() - 14);
    const d2 = new Date(); d2.setDate(d2.getDate() - 7);
    return r.recordedAt >= d1 && r.recordedAt < d2;
  });
  if (last7.length >= 3 && prev7.length >= 3) {
    const avg7 = Math.round(last7.reduce((a, r) => a + r.systolic, 0) / last7.length);
    const avgP7 = Math.round(prev7.reduce((a, r) => a + r.systolic, 0) / prev7.length);
    if (avg7 - avgP7 >= 10) {
      alerts.push({ id: "trend_up", severity: "warning", category: "Worsening Trend",
        title: `Rising BP Trend: ↑${avg7 - avgP7} mmHg over past week`,
        detail: `Last 7-day average: ${avg7} mmHg systolic vs previous 7-day average: ${avgP7} mmHg — significant upward trend.`,
        evidence: "ESC/ESH 2023 — trends more predictive than single readings; rising trend = medication review",
        action: "Review triggers: medication changes, dietary sodium, NSAIDs, stress, weight gain. Consider dose adjustment.",
        icon: "📈" });
    }
  }
  // 8. Morning surge detection (if morning readings consistently >20mmHg above evening)
  const morningReadings = last30.filter(r => r.recordedAt.getHours() >= 5 && r.recordedAt.getHours() <= 9);
  const eveningReadings = last30.filter(r => r.recordedAt.getHours() >= 18 && r.recordedAt.getHours() <= 22);
  if (morningReadings.length >= 5 && eveningReadings.length >= 5) {
    const avgMorn = Math.round(morningReadings.reduce((a, r) => a + r.systolic, 0) / morningReadings.length);
    const avgEve = Math.round(eveningReadings.reduce((a, r) => a + r.systolic, 0) / eveningReadings.length);
    if (avgMorn - avgEve >= 20) {
      alerts.push({ id: "morning_surge", severity: "warning", category: "Morning BP Surge",
        title: `Morning Surge Detected: Morning avg ${avgMorn} vs Evening avg ${avgEve} mmHg`,
        detail: "Morning BP surge (>15–20 mmHg rise) associated with ↑ risk of MI, stroke, and sudden death.",
        evidence: "JAS 2019; ESC/ESH 2023 — morning surge indicator for target organ damage risk",
        action: "Ensure evening or bedtime antihypertensive dosing. Consider long-acting drugs (amlodipine, telmisartan). Review 24h ABPM.",
        icon: "🌅" });
    }
  }
  // 9. Drug-specific monitoring alerts
  medications.filter(m => m.status === "active").forEach(med => {
    const name = (med.drug ?? med.medication ?? "").toLowerCase();
    if (name.includes("lisinopril") || name.includes("ramipril") || name.includes("losartan") || name.includes("enalapril")) {
      const kreatLab = labOrders.find(l => l.name.toLowerCase().includes("creat") || l.name.toLowerCase().includes("egfr") || l.name.toLowerCase().includes("potassium"));
      if (!kreatLab) {
        alerts.push({ id: `raas_${med.id}`, severity: "warning", category: "Laboratory Monitoring Required",
          title: `RAAS Agent (${med.drug ?? med.medication}) — Renal/K⁺ Labs Due`,
          detail: "ACEi/ARB therapy requires monitoring of creatinine, eGFR, and potassium at initiation and after dose changes.",
          evidence: "NICE/ESC guidelines — K⁺ and creatinine within 1–2 weeks of initiating RAAS agents",
          action: "Order: Creatinine/eGFR + Serum Potassium. Check within 1–2 weeks of any dose change.",
          icon: "🔬" });
      }
    }
    if (name.includes("spiro")) {
      const kLab = labOrders.find(l => l.name.toLowerCase().includes("potassium") || l.name.toLowerCase().includes("k+"));
      if (!kLab) {
        alerts.push({ id: `spiro_${med.id}`, severity: "urgent", category: "⚠️ Hyperkalemia Monitoring",
          title: "Spironolactone — Mandatory K⁺ Monitoring",
          detail: "Spironolactone can cause life-threatening hyperkalemia. K⁺ must be checked at 1 week, 4 weeks, then 3-monthly.",
          evidence: "NICE/ESC guidelines — mandatory renal monitoring for MRA therapy",
          action: "URGENT: Order serum K⁺ now if not done in past 4 weeks. Target K⁺ <5.0 mmol/L.",
          icon: "🧪" });
      }
    }
  });
  return alerts;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientSummary {
  id: string; name: string; age?: number; sex?: string; email?: string;
  phone?: string; universalId?: string; diagnosis?: string; riskLevel?: string;
  lastVisit?: string; nextReview?: string;
  latestSystolic?: number; latestDiastolic?: number; latestAt?: Date;
  totalReadings: number;
}
interface RawReading {
  id: string; patientId: string; toolType: string; recordedAt: Timestamp;
  doctorNote?: string; doctorReviewed?: boolean;
  data?: { systolic?: number; diastolic?: number; pulse?: number; arm?: string; position?: string };
  systolic?: number; diastolic?: number; pulse?: number;
  triage?: { label?: string; urgency?: string; message?: string };
}
export interface BPReading {
  id: string; systolic: number; diastolic: number; pulse?: number;
  recordedAt: Date; source: "patient"|"clinic"|"device";
  arm?: string; position?: string; doctorNote?: string; doctorReviewed?: boolean;
  triageLabel?: string; triageUrgency?: string; triageMessage?: string;
}
export interface Medication {
  id: string;
  drug: string;      // normalized from DB field "medication"
  medication?: string; // raw DB field
  dose: string;      // normalized from DB field "dosage"
  dosage?: string;   // raw DB field
  unit: string; frequency: string; drugClass: string;
  status: "active"|"stopped"|"paused";
  startDate: string; endDate?: string;
  indication?: string; route?: string; instructions?: string;
  warnings?: string; refills?: number; duration?: string;
  notes?: string;
  changeHistory?: DoseChange[];
}
export interface DoseChange {
  date: string; changeType: "started"|"dose_increase"|"dose_decrease"|"stopped"|"paused"|"restarted";
  previousDose?: string; newDose?: string; changedBy: string; reason?: string;
}
interface MedForTimeline { id: string; drug: string; dose: string; startDate: Date; endDate?: Date; changeHistory?: DoseChange[]; }
export interface Alert { id: string; trigger: string; actions: string[]; createdAt: string; doctorNote?: string; category?: string; history: { date: string; message: string }[]; }
export interface Complication { name: string; date: string; }
export interface LifestyleItem { name: string; grade: "Good"|"Moderate"|"Poor"; updatedAt?: string; }
export interface LabOrder { name: string; result?: string; orderedAt?: string; type?: "lab"|"imaging"; status?: string; study?: string; modality?: string; bodyPart?: string; urgency?: string; }
export interface ClinicalNote {
  id?: string; date: string;
  cc?: string; hpi?: string; exam?: string; investigations?: string;
  assessment?: string; plan?: string;
  diagnoses?: string[]; followUps?: string[];
  isLocked?: boolean; lastEditedAt?: string; doctorId?: string; doctorName?: string;
  visitType?: string; vitals?: Record<string, string>;
}
export interface TimelineEvent { id: string; date: string; type: "visit"|"med"|"alert"|"reading"|"note"|"lab"; icon: string; title: string; detail?: string; }
export interface Message { id?: string; from: "doctor"|"patient"; senderId?: string; senderName?: string; senderRole?: string; time: string; text: string; read?: boolean; status?: string; threadId?: string; timestamp?: Date; }
export interface AdherenceMap { [medId: string]: { [date: string]: boolean }; }
export interface ChartPoint {
  date: string; isoDate: string; systolic: number; diastolic: number;
  pulse?: number; rawCount: number; source: "patient"|"clinic"|"device"; category: string;
}
export interface EducationTopic {
  id: string; title: string; content: string; keyPoints: string[];
  category: string; duration: string; sentAt?: string; acknowledged?: boolean;
}

// ─── Education Content Database ──────────────────────────────────────────────

export const EDUCATION_TOPICS: EducationTopic[] = [
  { id: "htn_basics", title: "Understanding Your Blood Pressure", content: "Blood pressure is the force of blood against your artery walls. It is measured in mmHg with two numbers: systolic (top, when heart beats) / diastolic (bottom, between beats). Normal is below 120/80 mmHg. Hypertension (high blood pressure) increases your risk of heart attack, stroke, and kidney disease — but it is treatable and controllable.", keyPoints: ["Normal BP: <120/80 mmHg","High BP (Stage 1): 130–139/80–89 mmHg","High BP (Stage 2): ≥140/90 mmHg","Crisis: ≥180/120 — seek emergency care","Most people with HTN have NO symptoms — it's the 'silent killer'"], category: "Foundation", duration: "5 min" },
  { id: "salt_restriction", title: "Salt Restriction — <5g/day (2g Sodium)", content: "Excessive salt raises blood pressure by retaining water, increasing blood volume. The WHO recommends <5g of salt per day (about 1 teaspoon). Most people consume 9–12g/day.", keyPoints: ["Read food labels: look for 'sodium' content","High-salt foods: processed meats, canned goods, fast food, cheese","Cooking tips: use herbs, lemon, garlic instead of salt","Restaurant food: ask for sauces on the side","Reducing salt by 5g/day can lower BP by 5–7 mmHg"], category: "Lifestyle", duration: "4 min" },
  { id: "medication_adherence", title: "Why You Must Take Your Medications Every Day", content: "Blood pressure medications only work when taken consistently. Missing doses allows BP to rise, increasing risk of stroke or heart attack. Studies show medication adherence is the #1 factor in BP control.", keyPoints: ["Take medications at the SAME TIME every day","Set an alarm or link it to a routine (e.g., brushing teeth)","NEVER stop medications without telling your doctor","Refill prescriptions before they run out","Side effects? Tell your doctor — we can find a better option"], category: "Medications", duration: "5 min" },
  { id: "home_bp_monitoring", title: "How to Measure BP Correctly at Home", content: "Home BP monitoring gives your doctor the most accurate picture of your blood pressure. Measurements at the clinic may be falsely high (white coat effect). Taking correct readings is a skill.", keyPoints: ["Rest quietly for 5 minutes before measuring","Sit upright, feet flat on floor, back supported","Place cuff on bare arm at heart level","Don't talk, cross legs, or hold your bladder","Take 2 readings, 1–2 minutes apart — record both","Best times: morning before medications, evening before bed","Avoid coffee, exercise, smoking for 30 min before"], category: "Monitoring", duration: "6 min" },
  { id: "emergency_signs", title: "When to Seek Emergency Care", content: "Knowing the warning signs of a hypertensive emergency can save your life. Seek emergency care IMMEDIATELY if you experience any of these symptoms, especially with a very high BP reading.", keyPoints: ["🚨 Severe headache (worst of your life)","🚨 Sudden vision changes or loss","🚨 Chest pain or pressure","🚨 Difficulty breathing","🚨 Confusion or difficulty speaking","🚨 Numbness or weakness on one side","🚨 Severe nausea/vomiting with high BP","Call emergency services — do NOT drive yourself"], category: "Safety", duration: "4 min" },
  { id: "lifestyle_modification", title: "Lifestyle Changes That Lower Blood Pressure", content: "Lifestyle changes can lower BP by 10–20 mmHg — as much as a medication. These are not optional extras; they are evidence-based treatments.", keyPoints: ["DASH diet: fruits, vegetables, whole grains, low-fat dairy","Weight loss: every 1kg lost = ~1 mmHg drop in BP","Exercise: 150 min/week moderate (brisk walking, swimming)","Limit alcohol: men ≤2 units/day, women ≤1 unit/day","Stop smoking: major CV risk factor","Manage stress: meditation, yoga, deep breathing","Sleep 7–9 hours per night — sleep apnea raises BP"], category: "Lifestyle", duration: "7 min" },
  { id: "cv_risk", title: "Understanding Your Cardiovascular Risk", content: "Hypertension does not work alone — it combines with other risk factors (diabetes, cholesterol, smoking, age, family history) to multiply your risk of heart attack and stroke.", keyPoints: ["Your total CV risk matters more than BP alone","Other risk factors: diabetes, high cholesterol, obesity, smoking","Target BP is lower if you have diabetes or kidney disease","Annual check: weight, glucose, cholesterol, urine test","Aspirin: only if prescribed — discuss with your doctor","Regular monitoring and follow-ups reduce your risk significantly"], category: "Risk", duration: "5 min" },
  { id: "drug_side_effects", title: "Managing Medication Side Effects", content: "All medications can cause side effects, but many are manageable. Do NOT stop your medication — instead, tell your doctor and we will find the right solution.", keyPoints: ["ACE inhibitors (lisinopril, ramipril): dry cough → switch to ARB","CCBs (amlodipine): ankle swelling → reduce dose or add diuretic","Diuretics: frequent urination → take in morning","Beta-blockers: fatigue, cold hands → dose adjustment","All drugs: dizziness when standing → rise slowly","NEVER stop suddenly without medical advice"], category: "Medications", duration: "5 min" },
  { id: "dash_diet", title: "The DASH Diet — Eating to Lower BP", content: "DASH (Dietary Approaches to Stop Hypertension) is proven to lower BP by 8–11 mmHg in just 2 weeks. It focuses on nutrients that relax blood vessels.", keyPoints: ["↑ Potassium: bananas, spinach, avocados, sweet potato","↑ Magnesium: nuts, seeds, whole grains, dark chocolate","↑ Calcium: low-fat dairy, broccoli, fortified milk","↓ Sodium: <5g/day (avoid processed foods)","↓ Saturated fat: less red meat, full-fat dairy","↑ Fiber: beans, lentils, oats, vegetables","Alcohol: limit strictly — raises BP significantly"], category: "Nutrition", duration: "6 min" },
  { id: "stress_management", title: "Stress and Blood Pressure", content: "Chronic stress activates the sympathetic nervous system, releasing adrenaline and cortisol, which directly raises BP and increases cardiovascular risk.", keyPoints: ["Identify your stress triggers and work to reduce them","Daily relaxation: 10–20 min of deep breathing or meditation","Progressive muscle relaxation lowers BP acutely","Regular physical activity is one of the best stress relievers","Social support and talking to someone helps","Avoid stress eating, excess caffeine, alcohol as coping mechanisms","Consider professional support if overwhelmed"], category: "Mental Health", duration: "5 min" },
  { id: "sleep_hygiene", title: "Sleep and Blood Pressure", content: "Poor sleep (especially sleep apnea) is a major reversible cause of high blood pressure. Getting 7–9 hours of quality sleep can significantly improve BP control.", keyPoints: ["Obstructive sleep apnea (OSA) causes nocturnal BP spikes — screen if snoring/fatigue","Regular sleep schedule: same bedtime and wake time","Avoid screens, caffeine, alcohol 1–2h before bed","Keep bedroom cool, dark, and quiet","If BP is higher in the morning than expected — consider sleep study","CPAP therapy for OSA can lower BP by 2–10 mmHg"], category: "Lifestyle", duration: "4 min" },
  { id: "smoking_cessation", title: "Quitting Smoking — Your Most Important Step", content: "Smoking acutely raises BP for 20–30 minutes per cigarette through nicotine-induced catecholamine release. Chronic smoking causes arterial stiffness and accelerated atherosclerosis.", keyPoints: ["Each cigarette raises BP by 5–10 mmHg for ~20 minutes","Smoking quadruples the risk of heart attack in hypertensives","Quitting: BP benefit seen within weeks","Nicotine replacement therapy (NRT) is safe with BP medications","Varenicline (Champix) and bupropion are effective options","Set a quit date — tell your doctor for full support"], category: "Lifestyle", duration: "5 min" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bpClass(sys: number, dia: number) {
  const c = classifyBP(sys, dia);
  return { ...c, color: c.textColor, bg: c.bgColor, border: c.borderColor };
}

function normalizeMed(raw: Record<string, unknown>, id: string): Medication {
  const fmt = (ts: unknown) => ts instanceof Timestamp
    ? ts.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : String(ts ?? "");
  const drug = String(raw.medication ?? raw.drug ?? raw.name ?? "Unknown");
  const dosage = String(raw.dosage ?? raw.dose ?? raw.strength ?? "—");
  // Strip unit from dosage if combined (e.g., "10MG" → "10" + "mg")
  const doseMatch = dosage.match(/^([\d.]+)\s*([a-zA-Z]*)/);
  const doseNum = doseMatch ? doseMatch[1] : dosage;
  const doseUnit = doseMatch?.[2]?.toLowerCase() || (raw.unit as string) || "mg";
  // Derive drug class from pharma DB if not stored
  const pharma = getDrugInfo(drug);
  const drugClass = String(raw.drugClass ?? raw.class ?? pharma?.drugClass ?? "—");
  const isActive = raw.active === true || raw.status === "active" || (!raw.endDate && raw.active !== false);
  return {
    id, drug, medication: drug, dose: doseNum, dosage: dosage,
    unit: doseUnit, frequency: String(raw.frequency ?? raw.freq ?? "OD"),
    drugClass, status: raw.endDate ? "stopped" : (isActive ? "active" : "stopped"),
    startDate: fmt(raw.startDate ?? raw.createdAt),
    endDate: raw.endDate ? fmt(raw.endDate) : undefined,
    indication: String(raw.indication ?? raw.indications ?? "Hypertension"),
    route: String(raw.route ?? "Oral"),
    instructions: String(raw.instructions ?? ""),
    warnings: String(raw.warnings ?? ""),
    refills: Number(raw.refills ?? 0),
    duration: String(raw.duration ?? ""),
    notes: String(raw.notes ?? raw.doctorNote ?? ""),
    changeHistory: (raw.changeHistory as DoseChange[]) ?? [],
  };
}

function extractBP(raw: RawReading & Record<string, unknown>): BPReading | null {
  const d = raw.data as Record<string, number|string>|undefined;
  const sys = (d?.systolic as number) ?? (raw.systolic as number);
  const dia = (d?.diastolic as number) ?? (raw.diastolic as number);
  if (!sys || !dia) return null;
  return {
    id: raw.id, systolic: sys, diastolic: dia,
    pulse: (d?.pulse as number) ?? (raw.pulse as number),
    recordedAt: raw.recordedAt instanceof Timestamp ? raw.recordedAt.toDate() : new Date(raw.recordedAt as string),
    source: "patient", arm: d?.arm as string, position: d?.position as string,
    doctorNote: raw.doctorNote, doctorReviewed: raw.doctorReviewed,
    triageLabel: (raw.triage as Record<string, string>|undefined)?.label,
    triageUrgency: (raw.triage as Record<string, string>|undefined)?.urgency,
    triageMessage: (raw.triage as Record<string, string>|undefined)?.message,
  };
}

function averageByDay(readings: BPReading[]): ChartPoint[] {
  const g: Record<string, { sys: number[]; dia: number[]; pul: number[]; date: Date }> = {};
  readings.forEach(r => {
    const k = r.recordedAt.toISOString().split("T")[0];
    if (!g[k]) g[k] = { sys: [], dia: [], pul: [], date: r.recordedAt };
    g[k].sys.push(r.systolic); g[k].dia.push(r.diastolic);
    if (r.pulse) g[k].pul.push(r.pulse);
  });
  return Object.entries(g).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => ({
    date: v.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    isoDate: k,
    systolic: Math.round(v.sys.reduce((a,b) => a+b, 0)/v.sys.length),
    diastolic: Math.round(v.dia.reduce((a,b) => a+b, 0)/v.dia.length),
    pulse: v.pul.length ? Math.round(v.pul.reduce((a,b) => a+b, 0)/v.pul.length) : undefined,
    rawCount: v.sys.length, source: "patient" as const, category: "",
  }));
}

function toMedTimeline(m: Medication): MedForTimeline {
  const p = (s: string) => { const d = new Date(s); return isNaN(d.getTime()) ? new Date() : d; };
  return { id: m.id, drug: m.drug, dose: `${m.dose}${m.unit}`, startDate: p(m.startDate), endDate: m.endDate ? p(m.endDate) : undefined, changeHistory: m.changeHistory };
}

// PDF export utility (browser print)
function exportNoteAsPDF(note: ClinicalNote, patientName: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Clinical Note — ${patientName}</title>
    <style>
      body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;color:#111;background:#fff;max-width:800px;margin:0 auto}
      .header{border-bottom:3px solid #dc2626;padding-bottom:16px;margin-bottom:24px}
      .logo{color:#dc2626;font-size:22px;font-weight:800}
      .sub{color:#6b7280;font-size:12px;margin-top:4px}
      .patient{background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;border-left:4px solid #dc2626}
      .section{margin-bottom:16px;page-break-inside:avoid}
      .section-title{color:#dc2626;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;border-bottom:0.5px solid #e5e7eb;padding-bottom:4px}
      .section-content{font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap}
      .footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between}
      .badge{display:inline-block;padding:2px 8px;border-radius:4px;background:#fee2e2;color:#dc2626;font-size:11px;font-weight:600;margin-left:8px}
      @media print{body{padding:20px}.no-print{display:none}}
    </style></head><body>
    <div class="header">
      <div class="logo">🫀 AMEXAN Health System</div>
      <div class="sub">HTN Control Center — Clinical Note</div>
    </div>
    <div class="patient">
      <strong>Patient:</strong> ${patientName} &nbsp;|&nbsp; <strong>Date:</strong> ${note.date} &nbsp;|&nbsp; <strong>Visit Type:</strong> ${note.visitType ?? "Clinic Visit"} &nbsp;|&nbsp; <strong>Doctor:</strong> ${note.doctorName ?? "AMEXAN"}<span class="badge">HTN</span>
    </div>
    ${note.cc ? `<div class="section"><div class="section-title">Chief Complaint</div><div class="section-content">${note.cc}</div></div>` : ""}
    ${note.hpi ? `<div class="section"><div class="section-title">History of Present Illness (HPI)</div><div class="section-content">${note.hpi}</div></div>` : ""}
    ${note.exam ? `<div class="section"><div class="section-title">Examination Findings</div><div class="section-content">${note.exam}</div></div>` : ""}
    ${note.investigations ? `<div class="section"><div class="section-title">Investigations</div><div class="section-content">${note.investigations}</div></div>` : ""}
    ${note.assessment ? `<div class="section"><div class="section-title">Assessment / Diagnosis</div><div class="section-content">${note.assessment}</div></div>` : ""}
    ${note.plan ? `<div class="section"><div class="section-title">Management Plan</div><div class="section-content">${note.plan}</div></div>` : ""}
    ${note.followUps?.length ? `<div class="section"><div class="section-title">Follow-up Instructions</div><div class="section-content">${note.followUps.join("\n")}</div></div>` : ""}
    <div class="footer"><span>AMEXAN Health System · HTN Monitoring</span><span>Generated: ${new Date().toLocaleString()}</span><span>Note ID: ${note.id ?? "—"}</span></div>
    <script>window.onload = function(){ window.print(); }<\/script>
    </body></html>`);
  w.document.close();
}

// ─── Static Lists ─────────────────────────────────────────────────────────────

const COMPLICATIONS = ["Stroke/TIA","CKD (≥Stage 3)","Left Ventricular Hypertrophy","Hypertensive Retinopathy","Heart Failure","Coronary Artery Disease","Peripheral Arterial Disease","Atrial Fibrillation","Aortic Aneurysm","Hypertensive Encephalopathy"];
const LIFESTYLE_ITEMS = ["Dietary salt restriction (<5g/day)","Weight management / BMI <25","Regular aerobic exercise (≥150 min/week)","Smoking cessation","Alcohol reduction (≤2 units/day)","DASH diet adherence","Stress management / mindfulness","Sleep hygiene (7–9 hrs/night)","Caffeine reduction","Home BP monitoring routine"];
const SPECIALTIES = ["Cardiology","Nephrology","Ophthalmology","Neurology","Endocrinology","Vascular Surgery","Internal Medicine / General Medicine","Geriatrics","Obstetrics (HTN in Pregnancy)","Psychiatry (if depression/anxiety)"];
const URGENCIES: string[] = ["routine","urgent","emergency"];
const VISIT_TYPES = ["new_patient","follow_up","emergency","telemedicine","home_visit","discharge_review"];
const LAB_PANEL = ["Creatinine / eGFR","Serum Potassium (K⁺)","Serum Sodium (Na⁺)","Full Lipid Profile","HbA1c","Urinalysis (microscopy)","Urine ACR (Albumin:Creatinine ratio)","Complete Blood Count (CBC)","Fasting Plasma Glucose","TSH (Thyroid function)","LFTs (Liver function)","Serum Uric Acid","Serum Magnesium","BNP/NT-proBNP (if HF suspected)","Aldosterone:Renin Ratio (if 2° HTN)"];
const IMAGING_PANEL = ["ECG (12-lead)","Echocardiogram (TTE)","Renal Doppler Ultrasound","Fundoscopy / Dilated Fundal Exam","Chest X-Ray","Carotid Intima-Media Thickness (CIMT)","Abdominal USS (kidneys/adrenals)","24h Ambulatory BP Monitor (ABPM)","CT Head (if neurological symptoms)","Ankle-Brachial Index (ABI)"];
const DRUGS = ["Amlodipine","Losartan","Lisinopril","Ramipril","Atenolol","Metoprolol","Bisoprolol","Carvedilol","Hydrochlorothiazide","Indapamide","Spironolactone","Furosemide","Nifedipine","Doxazosin","Methyldopa","Valsartan","Telmisartan","Perindopril","Enalapril","Candesartan","Eplerenone","Clonidine","Hydralazine","Minoxidil"];
const FREQS = ["OD (Once daily)","BD (Twice daily)","TDS (Three times daily)","QDS (Four times daily)","Nocte (At bedtime)","PRN (As needed)","Weekly","Alternate days"];
const UNITS = ["mg","mcg","g","mL","mmol"];
const ROUTES_LIST = ["Oral","Sublingual","IV","IM","SC","Topical","Transdermal","Inhaled"];

// ─── Design Tokens ────────────────────────────────────────────────────────────

const T = {
  bg: "#f9fafb", card: "#ffffff", border: "rgba(0,0,0,0.08)",
  text: "#111827", muted: "#6b7280", faint: "#9ca3af",
  danger: "#dc2626", info: "#2563eb", success: "#059669", warn: "#d97706", purple: "#7c3aed",
  teal: "#0891b2", orange: "#ea580c", pink: "#db2777",
} as const;

const CHANGE_COLORS: Record<DoseChange["changeType"], { bg: string; color: string; label: string }> = {
  started: { bg: "#f0fdf4", color: "#059669", label: "Started" },
  dose_increase: { bg: "#fff7ed", color: "#d97706", label: "↑ Dose Increased" },
  dose_decrease: { bg: "#eff6ff", color: "#2563eb", label: "↓ Dose Decreased" },
  stopped: { bg: "#fef2f2", color: "#dc2626", label: "Stopped" },
  paused: { bg: "#fefce8", color: "#ca8a04", label: "Paused" },
  restarted: { bg: "#f0fdfa", color: "#0891b2", label: "Restarted" },
};


// ─── Global CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  .htn-root*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  .htn-root{font-family:'DM Sans','Plus Jakarta Sans','Segoe UI',system-ui,sans-serif}
  @keyframes htn-pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes htn-fade-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .htn-fade{animation:htn-fade-in 0.18s ease}
  .htn-scroll{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.12) transparent}
  .htn-scroll::-webkit-scrollbar{width:4px;height:4px}
  .htn-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}
  .htn-btn-press{transition:transform 0.1s,opacity 0.1s}
  .htn-btn-press:active{transform:scale(0.97);opacity:0.85}

  /* ─ MOBILE ≤640px: single full-screen column, no horizontal slide ─ */
  @media(max-width:640px){
    /* Hide the double-pane swipe track entirely on mobile */
    .htn-wa-track{display:none!important}

    /* Desktop two-col also hidden */
    .htn-desktop-layout{display:none!important}
    .htn-page-header{display:none!important}

    /* The mobile root fills the whole viewport and stacks vertically */
    .htn-root{
      position:fixed!important;inset:0!important;
      overflow:hidden!important;padding:0!important;
      display:flex!important;flex-direction:column!important;
    }

    /* Outer shell that we show/hide based on which screen is active */
    .htn-mobile-list{
      display:flex!important;flex-direction:column!important;
      width:100%!important;height:100%!important;overflow-y:auto!important;
      background:#fff!important;
    }
    .htn-mobile-list.hidden{display:none!important}

    .htn-mobile-detail{
      display:flex!important;flex-direction:column!important;
      width:100%!important;height:100%!important;overflow:hidden!important;
      background:#f9fafb!important;
    }
    .htn-mobile-detail.hidden{display:none!important}

    /* List topbar */
    .htn-list-topbar{
      position:sticky!important;top:0!important;z-index:20!important;
      background:#dc2626!important;color:#fff!important;
      padding:14px 16px 10px!important;min-height:56px!important;flex-shrink:0!important;
    }
    .htn-list-topbar h2{color:#fff!important;font-size:17px!important;margin:0!important;font-weight:800}
    .htn-list-topbar p{color:rgba(255,255,255,.75)!important;font-size:11px!important;margin:2px 0 0!important}
    .htn-list-search{
      padding:8px 12px!important;background:#f9fafb!important;
      position:sticky!important;top:56px!important;z-index:9!important;
      border-bottom:0.5px solid rgba(0,0,0,.07)!important;flex-shrink:0!important;
    }
    .htn-list-search input{
      width:100%!important;border-radius:20px!important;padding:8px 14px!important;
      border:none!important;background:#ececec!important;font-size:14px!important;
      outline:none!important;font-family:inherit!important;
    }

    /* Patient rows */
    .htn-patient-btn{
      width:100%!important;display:flex!important;align-items:center!important;
      gap:12px!important;padding:12px 16px!important;border:none!important;
      border-bottom:.5px solid rgba(0,0,0,.07)!important;background:#fff!important;
      cursor:pointer!important;text-align:left!important;min-height:64px!important;
    }
    .htn-patient-btn:active,.htn-patient-btn.active-row{background:#fff5f5!important}
    .htn-patient-avatar{
      width:44px!important;height:44px!important;border-radius:50%!important;
      background:rgba(220,38,38,.12)!important;display:flex!important;
      align-items:center!important;justify-content:center!important;
      font-size:19px!important;font-weight:800!important;color:#dc2626!important;flex-shrink:0!important;
    }
    .htn-patient-row-info{flex:1!important;min-width:0!important}
    .htn-patient-row-name{font-weight:600;font-size:14px;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .htn-patient-row-sub{font-size:11px;color:#9ca3af;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .htn-patient-row-bp{text-align:right;flex-shrink:0}
    .htn-patient-mini-header{display:none!important}

    /* Detail topbar */
    .htn-detail-topbar{
      position:sticky!important;top:0!important;z-index:20!important;
      background:#dc2626!important;padding:10px 14px!important;
      display:flex!important;align-items:center!important;gap:10px!important;
      min-height:56px!important;flex-shrink:0!important;
    }
    .htn-back-btn{
      background:none!important;border:none!important;color:#fff!important;
      font-size:28px!important;cursor:pointer!important;
      padding:0 8px 0 0!important;flex-shrink:0!important;line-height:1!important;
    }
    .htn-detail-topbar-avatar{
      width:36px!important;height:36px!important;border-radius:50%!important;
      background:rgba(255,255,255,.25)!important;display:flex!important;
      align-items:center!important;justify-content:center!important;
      font-weight:800!important;font-size:16px!important;flex-shrink:0!important;color:#fff!important;
    }
    .htn-detail-topbar-info{flex:1!important;min-width:0!important;overflow:hidden!important}
    .htn-detail-topbar-name{font-weight:700;font-size:15px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .htn-detail-topbar-sub{font-size:11px;color:rgba(255,255,255,.8)}
    .htn-detail-topbar-bp{
      background:rgba(255,255,255,.2);border-radius:8px;padding:4px 9px;
      text-align:center;flex-shrink:0;border:0.5px solid rgba(255,255,255,.3);
    }

    /* Scrollable content area */
    .htn-detail-content{
      flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;
      padding:10px 10px 100px!important;-webkit-overflow-scrolling:touch!important;
      width:100%!important;
    }

    /* Stats, tabs, panels */
    .htn-stat-row{gap:5px!important;flex-wrap:wrap!important}
    .htn-stat-card{min-width:65px!important;padding:7px 7px!important;flex:1!important}
    .htn-stat-card .sv{font-size:14px!important}
    .htn-tabs-wrap{
      position:sticky!important;top:56px!important;z-index:15!important;
      background:#fff!important;border-bottom:.5px solid rgba(0,0,0,.08)!important;
      flex-shrink:0!important;width:100%!important;
    }
    .htn-tabs{
      display:flex!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;
      flex-wrap:nowrap!important;padding:4px 8px!important;gap:2px!important;
      background:#fff!important;border-radius:0!important;border:none!important;margin-bottom:0!important;
      width:100%!important;
    }
    .htn-tabs::-webkit-scrollbar{display:none!important}
    .htn-tab-btn{font-size:10px!important;padding:5px 8px!important;white-space:nowrap!important;min-height:32px!important}
    .htn-panel{padding:12px!important;border-radius:10px!important;overflow-x:hidden!important}

    /* Grid overrides for small screens */
    .htn-med-edit-row{flex-direction:column!important}
    .htn-comp-grid{grid-template-columns:1fr 1fr!important}
    .htn-note-grid{grid-template-columns:1fr!important}
    .htn-labs-grid{grid-template-columns:1fr!important}
    .htn-ref-grid{grid-template-columns:1fr!important}
    .htn-adh-box{width:22px!important;height:22px!important;font-size:9px!important}

    /* Prevent any child from overflowing horizontally */
    .htn-detail-content *{max-width:100%!important}
    table{display:block!important;overflow-x:auto!important;width:100%!important}
  }

  /* ── TABLET 641px–1023px ── */
  @media(min-width:641px) and (max-width:1023px){
    .htn-wa-track{display:none!important}
    .htn-mobile-list,.htn-mobile-detail{display:none!important}
    .htn-desktop-layout{display:flex!important}
    .htn-patient-list{width:240px!important;flex-shrink:0!important}
    .htn-tabs{flex-wrap:wrap!important}
    .htn-tab-btn{font-size:11px!important}
    .htn-note-grid{grid-template-columns:1fr 1fr!important}
    .htn-labs-grid{grid-template-columns:1fr 1fr!important}
    .htn-ref-grid{grid-template-columns:1fr 1fr!important}
    .htn-comp-grid{grid-template-columns:1fr 1fr 1fr!important}
  }

  /* ── DESKTOP ≥1024px ── */
  @media(min-width:1024px){
    .htn-wa-track{display:none!important}
    .htn-mobile-list,.htn-mobile-detail{display:none!important}
    .htn-desktop-layout{display:flex!important}
    .htn-patient-list{width:290px!important;flex-shrink:0!important}
    .htn-note-grid{grid-template-columns:1fr 1fr!important}
    .htn-labs-grid{grid-template-columns:1fr 1fr!important}
    .htn-ref-grid{grid-template-columns:1fr 1fr!important}
    .htn-comp-grid{grid-template-columns:1fr 1fr 1fr!important}
  }
`;

// ─── Primitive UI ─────────────────────────────────────────────────────────────

function Dot({ color }: { color: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}
function SectHeader({ label, color, sub }: { label: string; color: string; sub?: string }) {
  return (
    <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
      <Dot color={color} />{label}
      {sub && <span style={{ fontSize: 9, color: T.faint, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>· {sub}</span>}
    </div>
  );
}
function Badge({ text, color, bg, border }: { text: string; color: string; bg: string; border: string }) {
  return <span style={{ padding: "2px 7px", borderRadius: 5, background: bg, color, border: `0.5px solid ${border}`, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>;
}
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="htn-stat-card" style={{ background: T.bg, border: `0.5px solid ${T.border}`, borderTop: `2px solid ${color ?? T.border}`, borderRadius: 10, padding: "10px 13px", flex: 1, minWidth: 90 }}>
      <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div className="sv" style={{ color: color ?? T.text, fontSize: 18, fontWeight: 800, lineHeight: 1.1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ color: T.faint, fontSize: 10 }}>{sub}</div>}
    </div>
  );
}
function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={`htn-panel htn-fade${className ? ` ${className}` : ""}`} style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", ...style }}>{children}</div>;
}
function Skeleton({ height = 200 }: { height?: number }) {
  return <div style={{ height, background: T.bg, borderRadius: 10, border: `0.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.faint, fontSize: 13 }}><span style={{ animation: "htn-pulse 1.4s ease-in-out infinite" }}>Loading…</span></div>;
}
function Btn({ label, variant = "default", onClick, fullWidth, small, icon, disabled }: {
  label: string; variant?: "default"|"primary"|"success"|"warn"|"danger"|"info";
  onClick?: () => void; fullWidth?: boolean; small?: boolean; icon?: string; disabled?: boolean;
}) {
  const s: Record<string, React.CSSProperties> = {
    default: { background: "transparent", color: T.muted, border: `0.5px solid ${T.border}` },
    primary: { background: T.danger, color: "#fff", border: `1px solid ${T.danger}` },
    success: { background: T.success, color: "#fff", border: `1px solid ${T.success}` },
    warn:    { background: "#fff7ed", color: T.warn, border: `0.5px solid ${T.warn}` },
    danger:  { background: "#fef2f2", color: T.danger, border: `0.5px solid ${T.danger}` },
    info:    { background: "#eff6ff", color: T.info, border: `0.5px solid ${T.info}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} className="htn-btn-press" style={{
      ...s[variant], padding: small ? "4px 9px" : "8px 13px", borderRadius: 8, fontSize: small ? 10 : 12, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      width: fullWidth ? "100%" : undefined, display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 4, minHeight: small ? 28 : 36, fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s",
    }}>
      {icon && <span style={{ fontSize: small ? 11 : 13 }}>{icon}</span>}{label}
    </button>
  );
}
function InpField({ label, value, onChange, placeholder, type = "text" }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ flex: 1 }}>
      {label && <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{label}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
    </div>
  );
}
function SelField({ label, value, onChange, options }: { label?: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      {label && <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", fontFamily: "inherit", width: "100%", appearance: "none" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div style={{ flex: 1 }}>
      {label && <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{label}</div>}
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
    </div>
  );
}

// ─── Panel: BP Trend ─────────────────────────────────────────────────────────

function BPTab({ readings, medications, patientId }: { readings: BPReading[]; medications: Medication[]; patientId: string }) {
  const chartData = useMemo(() => averageByDay(readings), [readings]);
  // ESC/ESH: target is 2 readings/day × 7 days = 14/week minimum
  const last7Days = readings.filter(r => { const d = new Date(); d.setDate(d.getDate()-7); return r.recordedAt >= d; });
  const last7Unique = new Set(last7Days.map(r => r.recordedAt.toISOString().split("T")[0])).size;
  const freq = `${last7Days.length} readings on ${last7Unique}/7 days`;
  const recommended = "ESC/ESH: 2×/day, 7 days, for reliable assessment";

  if (readings.length === 0) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <div style={{ color: T.muted, fontSize: 13 }}>No BP readings recorded yet.</div>
      <div style={{ color: T.faint, fontSize: 11, marginTop: 6 }}>Readings appear here once the patient logs via AMEXAN.</div>
    </div>
  );
  return (
    <div>
      <SectHeader label="BP Trend" color={T.danger} />
      {/* Monitoring adequacy indicator */}
      <div style={{ background: T.bg, borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, border: `0.5px solid ${T.border}`, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12 }}>📏</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: last7Days.length >= 12 ? T.success : T.warn }}>Monitoring: {freq}</div>
          <div style={{ fontSize: 10, color: T.faint }}>{recommended}</div>
        </div>
        <div style={{ padding: "2px 8px", borderRadius: 6, background: last7Days.length >= 12 ? "#f0fdf4" : "#fff7ed", color: last7Days.length >= 12 ? T.success : T.warn, fontSize: 10, fontWeight: 700, border: `0.5px solid ${last7Days.length >= 12 ? "#86efac" : "#fde68a"}` }}>
          {last7Days.length >= 14 ? "Optimal" : last7Days.length >= 7 ? "Adequate" : last7Days.length >= 3 ? "Minimal" : "Insufficient"}
        </div>
      </div>
      <BPTrendChart data={chartData} />
    </div>
  );
}

// ─── Panel: Readings Table ────────────────────────────────────────────────────

function ReadingsTab({ readings }: { readings: BPReading[] }) {
  const [filter, setFilter] = useState<"all"|"elevated"|"crisis">("all");
  const filtered = useMemo(() => {
    const r = [...readings].reverse();
    if (filter === "elevated") return r.filter(x => x.systolic >= 140 || x.diastolic >= 90);
    if (filter === "crisis") return r.filter(x => x.systolic >= 180 || x.diastolic >= 120);
    return r;
  }, [readings, filter]);

  if (!readings.length) return <div style={{ color: T.faint, textAlign: "center", padding: "24px 0" }}>No readings yet.</div>;
  return (
    <div>
      <SectHeader label={`All BP Readings (${readings.length} total)`} color={T.info} />
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {(["all","elevated","crisis"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 10px", borderRadius: 6, border: `0.5px solid ${filter===f?T.info:T.border}`, background: filter===f?"#eff6ff":"transparent", color: filter===f?T.info:T.faint, fontSize: 11, fontWeight: filter===f?700:500, cursor: "pointer", fontFamily: "inherit" }}>
            {f === "all" ? `All (${readings.length})` : f === "elevated" ? `Elevated (${readings.filter(x=>x.systolic>=140).length})` : `Crisis (${readings.filter(x=>x.systolic>=180).length})`}
          </button>
        ))}
      </div>
      <div className="htn-scroll" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 560 }}>
          <thead>
            <tr>{["Date & Time","BP mmHg","Pulse","Classification","MAP","PP (Pulse Pressure)","Triage","Note"].map(h => (
              <th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: `0.5px solid ${T.border}`, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((r, i) => {
              const cls = bpClass(r.systolic, r.diastolic);
              const MAP = Math.round((r.systolic + 2 * r.diastolic) / 3);
              const PP  = r.systolic - r.diastolic;
              return (
                <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: `0.5px solid ${T.border}` }}>
                  <td style={{ padding: "8px 10px", color: T.muted, whiteSpace: "nowrap" }}>
                    {r.recordedAt.toLocaleDateString()}<br />
                    <span style={{ color: T.faint, fontSize: 10 }}>{r.recordedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
                    <span style={{ color: T.danger, fontWeight: 800, fontSize: 15 }}>{r.systolic}</span>
                    <span style={{ color: T.faint, margin: "0 2px" }}>/</span>
                    <span style={{ color: T.info, fontWeight: 700, fontSize: 15 }}>{r.diastolic}</span>
                  </td>
                  <td style={{ padding: "8px 10px", color: T.purple }}>{r.pulse ?? "—"} {r.pulse && <span style={{ fontSize: 10, color: T.faint }}>bpm</span>}</td>
                  <td style={{ padding: "8px 10px" }}><Badge text={cls.label} color={cls.color} bg={cls.bg} border={cls.border} /></td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ color: MAP >= 110 ? T.danger : MAP >= 100 ? T.warn : T.muted, fontWeight: MAP >= 100 ? 700 : 400 }}>{MAP}</span>
                    <span style={{ color: T.faint, fontSize: 10 }}> mmHg</span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ color: PP > 60 ? T.warn : T.muted, fontWeight: PP > 60 ? 700 : 400 }}>{PP}</span>
                    <span style={{ color: T.faint, fontSize: 10 }}> mmHg{PP > 60 ? " ⚠️" : ""}</span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>{r.triageLabel
                    ? <span style={{ color: r.triageUrgency === "urgent" ? T.warn : T.success, fontSize: 11, fontWeight: 600 }}>{r.triageLabel}</span>
                    : <span style={{ color: T.faint }}>—</span>}
                  </td>
                  <td style={{ padding: "8px 10px", color: T.muted, maxWidth: 130 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.doctorNote ?? "—"}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length > 50 && <div style={{ textAlign: "center", color: T.faint, fontSize: 11, padding: "8px 0" }}>Showing latest 50 of {filtered.length}</div>}
    </div>
  );
}

// ─── Medication Pharmacology Card ─────────────────────────────────────────────

function PharmaCard({ drug }: { drug: string }) {
  const info = getDrugInfo(drug);
  const [expanded, setExpanded] = useState(false);
  if (!info) return null;
  return (
    <div style={{ border: `0.5px solid #dbeafe`, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <button onClick={() => setExpanded(p => !p)} style={{ width: "100%", padding: "9px 12px", display: "flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
        <span style={{ fontSize: 14 }}>💊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: T.info, fontSize: 12 }}>Pharmacological Reference: {drug}</div>
          <div style={{ color: "#93c5fd", fontSize: 10 }}>{info.drugClass} · Dose: {info.minDose}–{info.maxDose}{info.unit} · {info.pregnancyCategory} pregnancy</div>
        </div>
        <span style={{ color: T.info, fontSize: 11 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "12px 14px", background: T.card, borderTop: "0.5px solid #dbeafe" }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: T.muted, lineHeight: 1.5 }}><strong style={{ color: T.text }}>Mechanism:</strong> {info.mechanism}</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 4 }}>Dosing Range</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {info.commonDoses.map(d => <span key={d} style={{ background: "#eff6ff", color: T.info, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, border: "0.5px solid #bfdbfe" }}>{d}{info.unit}</span>)}
              <span style={{ color: T.faint, fontSize: 10, alignSelf: "center" }}>Min: {info.minDose}{info.unit} | Max: {info.maxDose}{info.unit}</span>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.danger, textTransform: "uppercase", marginBottom: 4 }}>⚠️ Warnings & Contraindications</div>
            {info.warnings.map((w, i) => <div key={i} style={{ fontSize: 11, color: T.warn, marginBottom: 2 }}>• {w}</div>)}
            {info.contraindications.map((c, i) => <div key={i} style={{ fontSize: 11, color: T.danger, marginBottom: 2 }}>🚫 {c}</div>)}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 4 }}>Side Effects</div>
            <div style={{ fontSize: 11, color: T.muted }}>{info.sideEffects.join(" · ")}</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 4 }}>Key Drug Interactions</div>
            {info.interactions.map((x, i) => <div key={i} style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>• {x}</div>)}
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.success, textTransform: "uppercase", marginBottom: 4 }}>📋 Patient Instructions</div>
            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{info.patientInstructions}</div>
          </div>
          {info.monitoring.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.purple, textTransform: "uppercase", marginBottom: 4 }}>🔬 Monitoring Required</div>
              <div style={{ fontSize: 11, color: T.muted }}>{info.monitoring.join(" · ")}</div>
            </div>
          )}
          {info.renalDose && <div style={{ marginTop: 6, fontSize: 11, color: T.teal }}><strong>Renal dosing:</strong> {info.renalDose}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Adherence Calendar (per medication) ─────────────────────────────────────

const AdherenceCalendar = memo(function AdherenceCalendar({ medId, medLabel, adherence, note, onNoteChange, readonly }: {
  medId: string; medLabel: string; adherence: { [d: string]: boolean };
  note: string; onNoteChange: (medId: string, v: string) => void; readonly?: boolean;
}) {
  const days = useMemo(() => Object.keys(adherence).sort(), [adherence]);
  const taken = days.filter(d => adherence[d]).length;
  const pct = days.length > 0 ? Math.round(taken / days.length * 100) : 0;
  const pc = pct >= 80 ? T.success : pct >= 60 ? T.warn : T.danger;
  return (
    <div style={{ borderTop: `0.5px solid ${T.border}`, paddingTop: 10, marginTop: 8 }}>
      <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Adherence — {medLabel}</div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 7 }}>
        {days.map(d => (
          <div key={d} title={d} className="htn-adh-box"
            style={{ width: 26, height: 26, borderRadius: 5, background: adherence[d] ? "#dcfce7" : "#fee2e2", border: `0.5px solid ${adherence[d] ? "#86efac" : "#fca5a5"}`, fontSize: 10, fontWeight: 700, color: adherence[d] ? T.success : T.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {adherence[d] ? "✓" : "✗"}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: T.faint, marginBottom: 6 }}>{taken}/{days.length} days taken · {pct}% adherence</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f3f4f6", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pc, transition: "width 0.4s" }} />
        </div>
        <span style={{ color: pc, fontWeight: 700, fontSize: 12, minWidth: 34 }}>{pct}%</span>
      </div>
      {!readonly && (
        <textarea rows={2} value={note} onChange={e => onNoteChange(medId, e.target.value)}
          placeholder="Adherence note (visible to patient)…"
          style={{ width: "100%", background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "6px 9px", color: T.text, fontSize: 11, outline: "none", resize: "none", fontFamily: "inherit" }} />
      )}
    </div>
  );
});

// ─── Medication Card ──────────────────────────────────────────────────────────


// ─── Types ───────────────────────────────────────────────────────────────────

export interface Prescription {
  id: string;
  active: boolean;
  medication: string;      // "AMLODIPINE"
  dosage: string;          // "10MG"
  frequency: string;       // "Once daily"
  route: string;           // "Oral"
  indication: string;      // "HYPERTENSION"
  instructions: string;
  warnings: string;
  duration: string;        // "30"
  refills: number;
  toolType: string;        // "bp_monitor"
  patientId: string;
  doctorId: string;
  doctorName: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
  status?: "active" | "paused" | "stopped";
  pauseReason?: string;
}

interface ChangeEvent {
  id: string;
  type: "started" | "dose_increase" | "dose_decrease" | "paused" | "restarted" | "stopped";
  date: Timestamp;
  previousDosage?: string;
  newDosage?: string;
  reason?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ROUTES = ["Oral","IV","IM","Sublingual","Topical","Inhaled","Rectal"];


const STATUS_TOKENS = {
  active:  { border:"#1D9E7550", iconBg:"#E1F5EE", badgeBg:"#E1F5EE", badgeColor:"#0F6E56", badgeBorder:"#1D9E7540" },
  paused:  { border:"#BA751750", iconBg:"#FAEEDA", badgeBg:"#FAEEDA", badgeColor:"#854F0B", badgeBorder:"#BA751740" },
  stopped: { border:"#E24B4A50", iconBg:"#FCEBEB", badgeBg:"#FCEBEB", badgeColor:"#A32D2D", badgeBorder:"#E24B4A40" },
};



// ─── Helpers ─────────────────────────────────────────────────────────────────

const tsToDate = (ts?: Timestamp): Date | null =>
  ts instanceof Timestamp ? ts.toDate() : ts ? new Date(ts as any) : null;

const fmtDate = (ts?: Timestamp) =>
  tsToDate(ts)?.toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" }) ?? "—";

const parseDoseVal  = (d: string) => parseFloat(d.replace(/[^0-9.]/g,"")) || 0;
const parseDoseUnit = (d: string) => d.replace(/[0-9.]/g,"").trim() || "MG";

const DOSE_STEPS = [1.25,2.5,5,10,20,40,80,160];

function getScheduledTimes(frequency: string): { label:string; hour:number; minute:number }[] {
  const f = frequency.toLowerCase();
  if (f.includes("twice") || f.includes("12"))
    return [{label:"8:00 AM",hour:8,minute:0},{label:"8:00 PM",hour:20,minute:0}];
  if (f.includes("three"))
    return [{label:"7:00 AM",hour:7,minute:0},{label:"1:00 PM",hour:13,minute:0},{label:"7:00 PM",hour:19,minute:0}];
  if (f.includes("four") || f.includes("8 hour"))
    return [{label:"6:00 AM",hour:6,minute:0},{label:"12:00 PM",hour:12,minute:0},{label:"6:00 PM",hour:18,minute:0},{label:"10:00 PM",hour:22,minute:0}];
  return [{label:"8:00 PM",hour:20,minute:0}];
}

// ─── Tiny shared UI pieces ───────────────────────────────────────────────────

const INP: React.CSSProperties = {
  width:"100%", background:"var(--color-background-primary)",
  border:"0.5px solid var(--color-border-secondary)", borderRadius:7,
  padding:"7px 10px", color:"var(--color-text-primary)",
  fontSize:12, fontFamily:"inherit", outline:"none",
};

function Chip({ label, value, danger }: { label:string; value:string; danger?:boolean }) {
  return (
    <div style={{ background: danger?"#FCEBEB":"var(--color-background-secondary)", borderRadius:8, padding:"5px 10px" }}>
      <div style={{ fontSize:9, color:"var(--color-text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:11, fontWeight:500, color: danger?"#A32D2D":"var(--color-text-primary)" }}>{value}</div>
    </div>
  );
}

function EField({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize:9, color:"var(--color-text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── MedicationCard ──────────────────────────────────────────────────────────

export function MedicationCard({
  prescription: rx, isExpanded, onToggleExpand,
}: {
  prescription: Prescription;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
   if (!rx) return null;
  const status: "active"|"paused"|"stopped" =
    rx.status ?? (rx.active ? "active" : "stopped");
  const S = STATUS_TOKENS[status];

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t); }, []);

  // Adherence from toolReadings
  const [adherence, setAdherence] = useState<Record<string,boolean>>({});
  useEffect(() => {
    if (!rx.patientId || !rx.toolType) return;
    const since = new Date(); since.setDate(since.getDate()-14);
    const q = query(collection(db,"toolReadings"),
      where("patientId","==",rx.patientId),
      where("toolType","==",rx.toolType),
      where("createdAt",">=",Timestamp.fromDate(since)),
      orderBy("createdAt","desc"), limit(60));
    return onSnapshot(q, snap => {
      const m: Record<string,boolean> = {};
      snap.forEach(d => { const dt=tsToDate(d.data().createdAt); if(dt) m[dt.toISOString().slice(0,10)]=true; });
      setAdherence(m);
    });
  }, [rx.patientId, rx.toolType]);

  // Change history from timeline_events
  const [history, setHistory] = useState<ChangeEvent[]>([]);
  useEffect(() => {
    const q = query(collection(db,"timeline_events"),
      where("prescriptionId","==",rx.id),
      orderBy("date","desc"), limit(10));
    return onSnapshot(q, snap =>
      setHistory(snap.docs.map(d=>({id:d.id,...d.data()} as ChangeEvent))));
  }, [rx.id]);

  // Edit state
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [doseVal, setDoseVal]   = useState(parseDoseVal(rx.dosage));
  const [doseUnit,setDoseUnit]  = useState(parseDoseUnit(rx.dosage));
  const [eFreq,   setEFreq]     = useState(rx.frequency);
  const [eRoute,  setERoute]    = useState(rx.route);
  const [eDur,    setEDur]      = useState(rx.duration);
  const [eRef,    setERef]      = useState(rx.refills);
  const [eInd,    setEInd]      = useState(rx.indication);
  const [eIns,    setEIns]      = useState(rx.instructions);
  const [eWarn,   setEWarn]     = useState(rx.warnings);
  const [reason,  setReason]    = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const [showPause,   setShowPause]   = useState(false);
  const [showPharma,  setShowPharma]  = useState(false);

  useEffect(()=>{
    setDoseVal(parseDoseVal(rx.dosage)); setDoseUnit(parseDoseUnit(rx.dosage));
    setEFreq(rx.frequency); setERoute(rx.route); setEDur(rx.duration);
    setERef(rx.refills); setEInd(rx.indication); setEIns(rx.instructions); setEWarn(rx.warnings);
  },[rx]);

  const resetEdit = () => { setEditing(false); setReason(""); };

  // Saves
  const saveEdit = async () => {
    setSaving(true);
    const newDosage = `${doseVal}${doseUnit}`;
    const oldVal = parseDoseVal(rx.dosage);
    const changeType = doseVal>oldVal?"dose_increase":doseVal<oldVal?"dose_decrease":null;
    await updateDoc(doc(db,"prescriptions",rx.id),{
      dosage:newDosage, frequency:eFreq, route:eRoute, duration:eDur,
      refills:eRef, indication:eInd, instructions:eIns, warnings:eWarn,
    });
    if (changeType) await addDoc(collection(db,"timeline_events"),{
      prescriptionId:rx.id, patientId:rx.patientId, doctorId:rx.doctorId,
      type:changeType, previousDosage:rx.dosage, newDosage, reason,
      date:serverTimestamp(),
    });
    setSaving(false); resetEdit();
  };

  const quickDose = async (dir:"up"|"down") => {
    const curr = parseDoseVal(rx.dosage);
    const newVal = dir==="up"
      ? (DOSE_STEPS.find(s=>s>curr)??curr*2)
      : (DOSE_STEPS.slice().reverse().find(s=>s<curr)??curr/2);
    const newDosage = `${newVal}${parseDoseUnit(rx.dosage)}`;
    await updateDoc(doc(db,"prescriptions",rx.id),{dosage:newDosage});
    await addDoc(collection(db,"timeline_events"),{
      prescriptionId:rx.id, patientId:rx.patientId, doctorId:rx.doctorId,
      type:dir==="up"?"dose_increase":"dose_decrease",
      previousDosage:rx.dosage, newDosage, reason:"Quick adjustment", date:serverTimestamp(),
    });
  };

  const pauseMed = async () => {
    await updateDoc(doc(db,"prescriptions",rx.id),{active:false,status:"paused",pauseReason});
    await addDoc(collection(db,"timeline_events"),{
      prescriptionId:rx.id, patientId:rx.patientId, type:"paused", reason:pauseReason, date:serverTimestamp(),
    });
    setShowPause(false); setPauseReason("");
  };

  const restartMed = async () => {
    await updateDoc(doc(db,"prescriptions",rx.id),{active:true,status:"active",pauseReason:""});
    await addDoc(collection(db,"timeline_events"),{
      prescriptionId:rx.id, patientId:rx.patientId, type:"restarted", date:serverTimestamp(),
    });
  };

  const stopMed = async () => {
    await updateDoc(doc(db,"prescriptions",rx.id),{active:false,status:"stopped",endDate:serverTimestamp()});
    await addDoc(collection(db,"timeline_events"),{
      prescriptionId:rx.id, patientId:rx.patientId, type:"stopped", date:serverTimestamp(),
    });
  };

  const sendToPatient = () =>
    addDoc(collection(db,"patientNotifications"),{
      patientId:rx.patientId, type:"prescription_shared",
      prescriptionId:rx.id, medication:rx.medication,
      dosage:rx.dosage, frequency:rx.frequency,
      instructions:rx.instructions, warnings:rx.warnings,
      doctorId:rx.doctorId, doctorName:rx.doctorName,
      createdAt:serverTimestamp(), read:false,
    });

  // Schedule / countdown
  const scheduledTimes = useMemo(()=>getScheduledTimes(rx.frequency),[rx.frequency]);

  const { nextDoseLabel, countdown } = useMemo(()=>{
    const upcoming = scheduledTimes.map(t=>{
      const d=new Date(now); d.setHours(t.hour,t.minute,0,0);
      if(d<=now) d.setDate(d.getDate()+1);
      return {label:t.label, ms:d.getTime()-now.getTime()};
    }).sort((a,b)=>a.ms-b.ms)[0];
    if(!upcoming) return {nextDoseLabel:"—",countdown:""};
    const h=Math.floor(upcoming.ms/3600000);
    const m=Math.floor((upcoming.ms%3600000)/60000);
    const s=Math.floor((upcoming.ms%60000)/1000);
    return {nextDoseLabel:upcoming.label, countdown:`${h}h ${m}m ${s}s`};
  },[now,scheduledTimes]);

  // Adherence strip
  const strip = useMemo(()=>Array.from({length:14},(_,i)=>{
    const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-(13-i));
    const key=d.toISOString().slice(0,10);
    return {date:d, state: d>now?"future":adherence[key]?"taken":"missed"};
  }),[adherence,now]);

  const adhRate = useMemo(()=>{
    const past=strip.filter(d=>d.state!=="future");
    return past.length ? Math.round(past.filter(d=>d.state==="taken").length/past.length*100) : 0;
  },[strip]);

  const dotC = { taken:{bg:"#E1F5EE",c:"#0F6E56"}, missed:{bg:"#FCEBEB",c:"#A32D2D"}, future:{bg:"var(--color-background-secondary)",c:"var(--color-text-secondary)"} };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ border:`0.5px solid ${S.border}`, borderRadius:14, marginBottom:12, overflow:"hidden", background:"var(--color-background-primary)" }}>

      {/* HEADER */}
      <div role="button" tabIndex={0} onClick={onToggleExpand} onKeyDown={e=>e.key==="Enter"&&onToggleExpand()}
        style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 15px", cursor:"pointer", userSelect:"none" }}>
        <div style={{ width:40,height:40,borderRadius:11,flexShrink:0,background:S.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>💊</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:500, fontSize:14, color:"var(--color-text-primary)" }}>{rx.medication}</div>
          <div style={{ fontSize:11, color:"var(--color-text-secondary)", marginTop:2 }}>
            {rx.dosage} · {rx.frequency} · {rx.route}{rx.indication?` · ${rx.indication}`:""}
          </div>
          {history[0] && (()=>{const cc=CHANGE_COLORS[history[0].type]??CHANGE_COLORS.started; return (
            <span style={{ display:"inline-block",marginTop:4,padding:"1px 6px",borderRadius:4,background:cc.bg,color:cc.color,fontSize:9,fontWeight:500,border:`0.5px solid ${cc.color}30` }}>
              {cc.label}{history[0].newDosage?`: ${history[0].newDosage}`:""}
            </span>);})()}
        </div>
        <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0 }}>
          <span style={{ fontSize:10,fontWeight:500,padding:"3px 9px",borderRadius:20,background:S.badgeBg,color:S.badgeColor,border:`0.5px solid ${S.badgeBorder}`,letterSpacing:"0.04em" }}>
            {status.toUpperCase()}
          </span>
          {status==="active"&&(
            <span style={{ fontSize:10,color:S.badgeColor,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap" }}>
              Next {nextDoseLabel} · {countdown}
            </span>
          )}
        </div>
        <span style={{ color:"var(--color-text-secondary)",fontSize:10,display:"inline-block",transition:"transform 0.2s",transform:isExpanded?"rotate(180deg)":"none",marginLeft:4 }}>▼</span>
      </div>

      {/* BODY */}
      {isExpanded && (
        <div style={{ padding:"15px 16px", borderTop:"0.5px solid var(--color-border-tertiary)" }}>

          {/* Meta chips */}
          <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:14 }}>
            <Chip label="Started"  value={fmtDate(rx.startDate)} />
            {rx.endDate   && <Chip label="Ends"     value={fmtDate(rx.endDate)} danger={status==="stopped"} />}
            {rx.duration  && <Chip label="Duration" value={`${rx.duration} days`} />}
            {rx.route     && <Chip label="Route"    value={rx.route} />}
            {rx.refills!=null&&<Chip label="Refills"  value={String(rx.refills)} />}
            {rx.toolType  && <Chip label="Monitor"  value={rx.toolType.replace(/_/g," ")} />}
          </div>

          {/* Banners */}
          {status==="active" && (
            <div style={{ display:"flex",alignItems:"center",gap:10,background:"#E1F5EE",borderRadius:9,padding:"9px 13px",marginBottom:14,border:"0.5px solid #1D9E7530" }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:"#1D9E75",flexShrink:0,animation:"rxPulse 2s infinite" }} />
              <div style={{ fontSize:12,color:"#0F6E56",fontWeight:500 }}>Next dose: <strong>{rx.dosage}</strong> at {nextDoseLabel}</div>
              <div style={{ marginLeft:"auto",fontSize:11,color:"#1D9E75",fontVariantNumeric:"tabular-nums" }}>in {countdown}</div>
            </div>
          )}
          {status==="paused" && (
            <div style={{ background:"#FAEEDA",borderRadius:9,padding:"9px 13px",marginBottom:14,fontSize:12,color:"#854F0B",border:"0.5px solid #BA751730" }}>
              ⏸ Paused{rx.pauseReason?` — ${rx.pauseReason}`:""}.
            </div>
          )}
          {status==="stopped" && (
            <div style={{ background:"#FCEBEB",borderRadius:9,padding:"9px 13px",marginBottom:14,fontSize:12,color:"#A32D2D",border:"0.5px solid #E24B4A30" }}>
              ⬛ Discontinued on {fmtDate(rx.endDate)}.
            </div>
          )}

          {/* Schedule */}
          {status==="active" && (
            <>
              <div style={{ fontSize:10,fontWeight:500,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8 }}>Today's schedule</div>
              <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:16 }}>
                {scheduledTimes.map((t,i)=>{
                  const slot=new Date(now); slot.setHours(t.hour,t.minute,0,0);
                  const isPast=now>=slot;
                  const taken=isPast&&!!adherence[now.toISOString().slice(0,10)];
                  const state=taken?"taken":isPast?"missed":"upcoming";
                  const ss={taken:{bg:"#E1F5EE",dot:"#1D9E75",text:"Taken",tc:"#0F6E56"},missed:{bg:"#FCEBEB",dot:"#E24B4A",text:"Missed",tc:"#A32D2D"},upcoming:{bg:"var(--color-background-secondary)",dot:"var(--color-border-secondary)",text:"Upcoming",tc:"var(--color-text-secondary)"}}[state];
                  return (
                    <div key={i} style={{ background:ss.bg,borderRadius:10,padding:"8px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:76 }}>
                      <div style={{ fontSize:13,fontWeight:500,color:"var(--color-text-primary)",fontVariantNumeric:"tabular-nums" }}>{t.label}</div>
                      <div style={{ fontSize:10,color:"var(--color-text-secondary)" }}>{rx.dosage}</div>
                      <div style={{ width:6,height:6,borderRadius:"50%",background:ss.dot,marginTop:2 }} />
                      <div style={{ fontSize:9,color:ss.tc,fontWeight:500 }}>{ss.text}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Adherence strip */}
          {status!=="stopped" && (
            <>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                <div style={{ fontSize:10,fontWeight:500,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.07em" }}>Adherence — last 14 days</div>
                <div style={{ marginLeft:"auto",fontSize:11,fontWeight:500,color:adhRate>=80?"#0F6E56":adhRate>=60?"#854F0B":"#A32D2D" }}>{adhRate}%</div>
              </div>
              <div style={{ display:"flex",gap:3,flexWrap:"wrap",marginBottom:16 }}>
                {strip.map(({date,state},i)=>{
                  const c=dotC[state as keyof typeof dotC];
                  return <div key={i} title={`${date.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})} — ${state}`}
                    style={{ width:26,height:26,borderRadius:5,background:c.bg,color:c.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500 }}>
                    {date.getDate()}
                  </div>;
                })}
              </div>
            </>
          )}

          {/* Instructions/warnings read-only */}
          {(rx.instructions||rx.warnings)&&!editing&&(
            <div style={{ background:"var(--color-background-secondary)",borderRadius:9,padding:"10px 12px",marginBottom:14 }}>
              {rx.instructions&&<div style={{ marginBottom:rx.warnings?6:0 }}>
                <div style={{ fontSize:9,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3 }}>Instructions</div>
                <div style={{ fontSize:12,color:"var(--color-text-primary)" }}>{rx.instructions}</div>
              </div>}
              {rx.warnings&&<div>
                <div style={{ fontSize:9,color:"#854F0B",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3 }}>Warnings</div>
                <div style={{ fontSize:12,color:"#854F0B" }}>{rx.warnings}</div>
              </div>}
            </div>
          )}

          <div style={{ height:0.5,background:"var(--color-border-tertiary)",margin:"4px 0 12px" }} />

          {/* Edit form */}
          {editing ? (
            <div style={{ background:"var(--color-background-secondary)",borderRadius:10,padding:14,marginBottom:12 }}>
              <div style={{ fontSize:12,fontWeight:500,color:"var(--color-text-primary)",marginBottom:12 }}>Edit prescription</div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:8 }}>
                <EField label="Dose value"><input type="number" value={doseVal} onChange={e=>setDoseVal(parseFloat(e.target.value))} style={INP} /></EField>
                <EField label="Unit"><select value={doseUnit} onChange={e=>setDoseUnit(e.target.value)} style={INP}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></EField>
                <EField label="Refills"><input type="number" value={eRef} onChange={e=>setERef(parseInt(e.target.value))} style={INP} /></EField>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8 }}>
                <EField label="Frequency"><select value={eFreq} onChange={e=>setEFreq(e.target.value)} style={INP}>{FREQS.map(f=><option key={f}>{f}</option>)}</select></EField>
                <EField label="Route"><select value={eRoute} onChange={e=>setERoute(e.target.value)} style={INP}>{ROUTES.map(r=><option key={r}>{r}</option>)}</select></EField>
                <EField label="Duration (days)"><input value={eDur} onChange={e=>setEDur(e.target.value)} style={INP} /></EField>
              </div>
              <div style={{ marginBottom:8 }}><EField label="Indication"><input value={eInd} onChange={e=>setEInd(e.target.value)} style={INP} /></EField></div>
              <div style={{ marginBottom:8 }}><EField label="Instructions for patient"><textarea value={eIns} onChange={e=>setEIns(e.target.value)} rows={2} style={{...INP,resize:"vertical"}} /></EField></div>
              <div style={{ marginBottom:8 }}><EField label="Warnings & cautions"><textarea value={eWarn} onChange={e=>setEWarn(e.target.value)} rows={2} style={{...INP,resize:"vertical"}} /></EField></div>
              <div style={{ marginBottom:12 }}><EField label="Reason for change"><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. BP uncontrolled, dose optimization" style={INP} /></EField></div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                <Btn label={saving?"Saving…":"✓ Save changes"} variant="success" onClick={saveEdit} disabled={saving} />
                <Btn label="Cancel" onClick={resetEdit} />
              </div>
            </div>
          ) : (
            <>
              {status==="active"&&(
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:10 }}>
                  <Btn label="✏ Edit" onClick={()=>setEditing(true)} />
                  <Btn label="↑ Dose" variant="warn" onClick={()=>quickDose("up")} />
                  <Btn label="↓ Dose" onClick={()=>quickDose("down")} />
                  <Btn label="⏸ Pause" variant="warn" onClick={()=>setShowPause(p=>!p)} />
                  <Btn label="Stop" variant="danger" onClick={stopMed} />
                  <Btn label="↗ Send to patient" variant="info" onClick={sendToPatient} />
                </div>
              )}
              {showPause&&status==="active"&&(
                <div style={{ background:"#FAEEDA",borderRadius:9,padding:12,marginBottom:10 }}>
                  <div style={{ fontSize:11,color:"#854F0B",marginBottom:7,fontWeight:500 }}>Reason for pausing</div>
                  <input value={pauseReason} onChange={e=>setPauseReason(e.target.value)} placeholder="e.g. Dry cough, patient request" style={{...INP,marginBottom:8}} />
                  <div style={{ display:"flex",gap:6 }}>
                    <Btn label="Confirm pause" variant="warn" onClick={pauseMed} />
                    <Btn label="Cancel" onClick={()=>setShowPause(false)} />
                  </div>
                </div>
              )}
              {status==="paused"&&(
                <div style={{ display:"flex",gap:6,marginBottom:10 }}>
                  <Btn label="▶ Restart" variant="success" onClick={restartMed} />
                  <Btn label="Stop permanently" variant="danger" onClick={stopMed} />
                </div>
              )}
            </>
          )}

          {/* Change history */}
          {history.length>0&&(
            <div style={{ borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:10,marginTop:10 }}>
              <div style={{ fontSize:10,fontWeight:500,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7 }}>Change history</div>
              {history.map((ch,i)=>{
                const cc=CHANGE_COLORS[ch.type]??CHANGE_COLORS.started;
                return (
                  <div key={ch.id} style={{ display:"flex",gap:8,alignItems:"center",fontSize:11,borderTop:i>0?"0.5px solid var(--color-border-tertiary)":"none",padding:i>0?"5px 0 0":"0 0 5px" }}>
                    <span style={{ color:"var(--color-text-secondary)",flexShrink:0,minWidth:82,fontVariantNumeric:"tabular-nums" }}>{fmtDate(ch.date as any)}</span>
                    <span style={{ padding:"1px 6px",borderRadius:4,background:cc.bg,color:cc.color,fontWeight:500,fontSize:9,flexShrink:0 }}>{cc.label}</span>
                    {ch.previousDosage&&<span style={{ color:"var(--color-text-secondary)" }}>{ch.previousDosage} → {ch.newDosage}</span>}
                    {ch.reason&&<span style={{ color:"var(--color-text-secondary)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>· {ch.reason}</span>}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      <style>{`@keyframes rxPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
    </div>
  );
}

// ─── Container — fetches prescriptions for a patient ─────────────────────────

export function PatientMedications({ patientId }: { patientId: string }) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [expandedId, setExpandedId] = useState<string|null>(null);

  useEffect(()=>{
    const q = query(collection(db,"prescriptions"),
      where("patientId","==",patientId), orderBy("createdAt","desc"));
    return onSnapshot(q, snap =>
      setPrescriptions(snap.docs.map(d=>({id:d.id,...d.data()} as Prescription))));
  },[patientId]);

  const groups = {
    Active:  prescriptions.filter(p=>p.active && (!p.status||p.status==="active")),
    Paused:  prescriptions.filter(p=>p.status==="paused"),
    Stopped: prescriptions.filter(p=>!p.active && p.status==="stopped"),
  };

  return (
    <div style={{ padding:"0 0 24px" }}>
      {(Object.entries(groups) as [string,Prescription[]][]).map(([label,list])=>
        list.length>0&&(
          <div key={label} style={{ marginBottom:20 }}>
            <div style={{ fontSize:10,fontWeight:500,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10 }}>{label}</div>
            {list.map(rx=>(
              <MedicationCard key={rx.id} prescription={rx}
                isExpanded={expandedId===rx.id}
                onToggleExpand={()=>setExpandedId(id=>id===rx.id?null:rx.id)}
              />
            ))}
          </div>
        )
      )}
      {!prescriptions.length&&(
        <div style={{ textAlign:"center",padding:"32px 0",color:"var(--color-text-secondary)",fontSize:13 }}>No prescriptions found.</div>
      )}
    </div>
  );
}

// ─── Panel: Medications ───────────────────────────────────────────────────────

// ════════════════════════════════════════════════════════════════════════════
//  MedicationsTab — paste this ENTIRE block into HTNDashboard.tsx
//  ► Replace the existing  // ─── Panel: Medications ───  section with this.
//  ► No new imports needed. Uses everything already in scope in that file.
//  ► The only new names introduced are:
//      MT_DRUG_DB  MT_getDrugInfo  MT_INDICATIONS  MT_CHANGE_COLORS
//      MT_ChangeType  MT_MedLocal  MT_toDate  MT_fmt  MT_fmtTime
//      MT_inp  MT_sel  MT_MedSel  MT_MedInp  MT_MedTA  MT_Modal
//      MedicationsTab   (the component itself)
// ════════════════════════════════════════════════════════════════════════════

// ── Drug reference data (scoped to MedicationsTab) ────────────────────────

const MT_DRUG_DB: Record<string, {
  drugClass: string; unit: string; commonDoses: string[];
  minDose: string; maxDose: string; pregnancyCategory: string;
  patientInstructions: string; warnings: string[]; monitoring: string[];
}> = {
  Amlodipine:    { drugClass:"CCB",         unit:"mg", commonDoses:["2.5","5","10"],      minDose:"2.5",  maxDose:"10",   pregnancyCategory:"C", patientInstructions:"Take once daily at the same time each day. May cause ankle swelling.",       warnings:["Ankle oedema","Flushing","Dizziness on standing"],                        monitoring:["BP","HR","Oedema"] },
  Lisinopril:    { drugClass:"ACEi",        unit:"mg", commonDoses:["5","10","20","40"],  minDose:"5",    maxDose:"40",   pregnancyCategory:"D", patientInstructions:"Take once daily. Avoid potassium supplements. Report dry cough.",          warnings:["Dry cough","Hyperkalaemia","Avoid in pregnancy","Angioedema"],             monitoring:["BP","eGFR","K+"] },
  Losartan:      { drugClass:"ARB",         unit:"mg", commonDoses:["25","50","100"],     minDose:"25",   maxDose:"100",  pregnancyCategory:"D", patientInstructions:"Take once daily. Monitor blood pressure regularly.",                      warnings:["Hyperkalaemia","Avoid in pregnancy","First-dose hypotension"],            monitoring:["BP","eGFR","K+"] },
  Atenolol:      { drugClass:"BB",          unit:"mg", commonDoses:["25","50","100"],     minDose:"25",   maxDose:"100",  pregnancyCategory:"D", patientInstructions:"Take once daily. Do not stop suddenly.",                                warnings:["Bradycardia","Fatigue","Do not stop abruptly","Bronchoconstriction"],     monitoring:["BP","HR"] },
  Metoprolol:    { drugClass:"BB",          unit:"mg", commonDoses:["25","50","100","200"],minDose:"25",  maxDose:"200",  pregnancyCategory:"C", patientInstructions:"Take with or after food. Do not stop suddenly.",                         warnings:["Bradycardia","Fatigue","Do not stop abruptly"],                           monitoring:["BP","HR"] },
  Furosemide:    { drugClass:"Loop D",      unit:"mg", commonDoses:["20","40","80"],      minDose:"20",   maxDose:"80",   pregnancyCategory:"C", patientInstructions:"Take in the morning to avoid night-time urination. Monitor weight daily.",warnings:["Hypokalaemia","Dehydration","Tinnitus at high doses"],                     monitoring:["BP","electrolytes","eGFR","weight"] },
  Spironolactone:{ drugClass:"MRA",         unit:"mg", commonDoses:["25","50","100"],     minDose:"25",   maxDose:"100",  pregnancyCategory:"C", patientInstructions:"Take with food. Avoid excess potassium in diet.",                       warnings:["Hyperkalaemia","Gynaecomastia","Avoid with ACEi/ARB unless monitored"],   monitoring:["K+","eGFR","BP"] },
  Atorvastatin:  { drugClass:"Statin",      unit:"mg", commonDoses:["10","20","40","80"], minDose:"10",   maxDose:"80",   pregnancyCategory:"X", patientInstructions:"Take at night. Avoid grapefruit juice.",                               warnings:["Myopathy","Avoid in pregnancy","Liver enzyme elevation"],                 monitoring:["LFT","CK if symptomatic","Lipid panel"] },
  Metformin:     { drugClass:"Biguanide",   unit:"mg", commonDoses:["500","850","1000"],  minDose:"500",  maxDose:"2000", pregnancyCategory:"B", patientInstructions:"Take with meals to reduce GI side effects.",                            warnings:["GI upset","Lactic acidosis (rare)","Hold before contrast"],              monitoring:["HbA1c","eGFR","B12 long-term"] },
  Aspirin:       { drugClass:"Antiplatelet",unit:"mg", commonDoses:["75","150","300"],    minDose:"75",   maxDose:"300",  pregnancyCategory:"C", patientInstructions:"Take with or after food. Do not crush enteric-coated tablets.",          warnings:["GI bleeding","Avoid in active peptic ulcer","Bronchospasm in ASA-sensitive"],monitoring:["FBC","renal function if long-term"] },
};

const MT_getDrugInfo = (name: string) => MT_DRUG_DB[name] ?? null;

const MT_INDICATIONS = [
  "Hypertension","Heart Failure","Atrial Fibrillation","Diabetes",
  "Dyslipidaemia","Angina","CKD","Prophylaxis","Oedema","Anticoagulation","Other",
];

// ── Change colour map (superset — includes extra types not in DoseChange) ──

type MT_ChangeType =
  | "started" | "dose_increased" | "dose_decreased" | "stopped"
  | "paused"  | "restarted"      | "frequency_changed"
  | "route_changed" | "duration_extended";

const MT_CHANGE_COLORS: Record<MT_ChangeType, { bg: string; color: string; label: string }> = {
  started:           { bg:"#d1fae5", color:"#065f46", label:"STARTED"    },
  dose_increased:    { bg:"#dbeafe", color:"#1e40af", label:"UP DOSE"    },
  dose_decreased:    { bg:"#fef9c3", color:"#854d0e", label:"DN DOSE"    },
  stopped:           { bg:"#fee2e2", color:"#991b1b", label:"STOPPED"    },
  paused:            { bg:"#fef3c7", color:"#92400e", label:"PAUSED"     },
  restarted:         { bg:"#e0e7ff", color:"#3730a3", label:"RESTARTED"  },
  frequency_changed: { bg:"#f3e8ff", color:"#6b21a8", label:"FREQ"       },
  route_changed:     { bg:"#fce7f3", color:"#9d174d", label:"ROUTE"      },
  duration_extended: { bg:"#ccfbf1", color:"#065f46", label:"EXTENDED"   },
};

// ── Local medication shape (reads directly from prescriptions collection) ──

interface MT_MedLocal {
  id: string;
  medication: string;
  drug?: string;
  dosage?: string;
  dose?: string | number;
  unit?: string;
  frequency: string;
  route: string;
  indication: string;
  instructions: string;
  warnings: string;
  duration: string | number;
  refills: number;
  active: boolean;
  paused?: boolean;
  startDate: Timestamp | Date | string;
  endDate: Timestamp | Date | string;
  createdAt?: Timestamp | Date | string;
  doctorId?: string;
  doctorName?: string;
  patientId: string;
  drugClass?: string;
  notes?: string;
  changeHistory?: Array<{
    date: Timestamp | Date | string;
    changeType: MT_ChangeType;
    previousDose?: string;
    newDose?: string;
    previousFrequency?: string;
    newFrequency?: string;
    changedBy: string;
    reason?: string;
  }>;
  stopReason?: string;
  toolType?: string | null;
}

// ── Timestamp helpers (scoped, no collision with file-level helpers) ───────

const MT_toDate = (ts: any): Date | null => {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts.seconds !== undefined) return new Date(ts.seconds * 1000);
  if (ts instanceof Date) return ts;
  if (typeof ts === "string") return new Date(ts);
  return null;
};
const MT_fmt = (ts: any, opts?: Intl.DateTimeFormatOptions) => {
  const d = MT_toDate(ts);
  if (!d || isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", opts ?? { day:"numeric", month:"short", year:"numeric" });
};
const MT_fmtTime = (ts: any) => {
  const d = MT_toDate(ts);
  if (!d || isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
};

// ── Input styles (scoped — avoids collision with file-level `inp`/`sel`) ──

const MT_inp: React.CSSProperties = {
  width:"100%", boxSizing:"border-box", background:"#fff",
  border:"0.5px solid #d1d5db", borderRadius:8, padding:"8px 10px",
  fontSize:12, color:"#111827", outline:"none", fontFamily:"inherit",
};
const MT_sel: React.CSSProperties = { ...MT_inp, cursor:"pointer" };

// ── Micro-components (MT_ prefix avoids collision with SelField / InpField / TextArea / Modal already in file) ──

const MT_MedSel = ({ label, value, onChange, options }: { label:string; value:string; onChange:(v:string)=>void; options:string[] }) => (
  <div>
    <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</div>
    <select value={value} onChange={e => onChange(e.target.value)} style={MT_sel}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
  </div>
);

const MT_MedInp = ({ label, value, onChange, placeholder, type="text" }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string }) => (
  <div style={{ flex:"1 1 100px" }}>
    <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</div>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={MT_inp} />
  </div>
);

const MT_MedTA = ({ label, value, onChange, placeholder, rows=2 }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string; rows?:number }) => (
  <div>
    <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</div>
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ ...MT_inp, resize:"vertical", lineHeight:1.5 }} />
  </div>
);

const MT_Modal = ({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) => (
  <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.45)", backdropFilter:"blur(3px)" }}>
    <div style={{ background:"#fff", borderRadius:16, width:"min(480px,94vw)", maxHeight:"88vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
      <div style={{ display:"flex", alignItems:"center", padding:"14px 16px", borderBottom:"0.5px solid #f3f4f6" }}>
        <div style={{ fontWeight:800, fontSize:14, color:"#111827" }}>{title}</div>
        <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af", lineHeight:1 }}>x</button>
      </div>
      <div style={{ padding:"16px" }}>{children}</div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  MedicationsTab
// ════════════════════════════════════════════════════════════════════════════

function MedicationsTab({ patientId, doctorId, doctorName, externalMeds, onUpdate, onStop, onPause, onRestart, onAdd, adherence, adherenceNotes, onAdherenceToggle, onNoteChange, onExternalUpdate }: {
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  externalMeds?: any[];
  onUpdate?: (med: any, changeType: string, oldDose: string) => void;
  onStop?: (id: string) => void;
  onPause?: (id: string) => void;
  onRestart?: (id: string) => void;
  onAdd?: (med: any) => void;
  adherence?: any;
  adherenceNotes?: Record<string, string>;
  onAdherenceToggle?: (medId: string, date: string) => void;
  onNoteChange?: (id: string, val: string) => void;
  onExternalUpdate?: () => void;
}) {

  // ── State ─────────────────────────────────────────────────────────────────
  const [medications, setMedications]   = useState<MT_MedLocal[]>([]);
  const [loading, setLoading]           = useState(true);
  const [expandedId, setExpandedId]     = useState<string|null>(null);
  const [filter, setFilter]             = useState<"all"|"active"|"stopped"|"paused">("active");
  const [nowMs, setNowMs]               = useState(Date.now());
  const [showAdd, setShowAdd]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState<string|null>(null);
  const [stopTarget, setStopTarget]     = useState<MT_MedLocal|null>(null);
  const [adjustTarget, setAdjustTarget] = useState<MT_MedLocal|null>(null);
  const [extendTarget, setExtendTarget] = useState<MT_MedLocal|null>(null);
  const [stopReason, setStopReason]     = useState("");
  const [extendDays, setExtendDays]     = useState("30");
  const [extendReason, setExtendReason] = useState("");
  const [adjustForm, setAdjustForm]     = useState({
    dose:"", unit:"mg", frequency:"", route:"", reason:"",
    changeType:"dose_increased" as MT_ChangeType,
  });
  const blankForm = { drug:"", dose:"5", unit:"mg", frequency:"OD (Once daily)", drugClass:"", indication:"Hypertension", route:"Oral", instructions:"", warnings:"", refills:30, duration:"30", notes:"" };
  const [form, setForm] = useState(blankForm);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => { const t = setInterval(() => setNowMs(Date.now()), 60_000); return () => clearInterval(t); }, []);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  // ── Firestore live listener ────────────────────────────────────────────────
  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    const q = query(collection(db, "prescriptions"), where("patientId","==",patientId), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap => {
      const meds = snap.docs.map(d => ({ id:d.id, ...d.data() } as MT_MedLocal));
      setMedications(meds);
      setLoading(false);
      setExpandedId(prev => prev ?? (meds.find(m => m.active)?.id ?? null));
    }, () => setLoading(false));
    return () => unsub();
  }, [patientId]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const mtIsActive  = (m: MT_MedLocal) => m.active === true && !m.paused;
  const mtIsPaused  = (m: MT_MedLocal) => m.paused  === true;
  const mtIsStopped = (m: MT_MedLocal) => m.active  === false;

  const activeMeds  = medications.filter(mtIsActive);
  const pausedMeds  = medications.filter(mtIsPaused);
  const stoppedMeds = medications.filter(mtIsStopped);

  const mtDaysLeft = (ts: any): number | null => { const d = MT_toDate(ts); if (!d) return null; return Math.ceil((d.getTime()-nowMs)/86_400_000); };
  const mtCoursePct = (m: MT_MedLocal) => {
    const s = MT_toDate(m.startDate), e = MT_toDate(m.endDate);
    if (!s||!e) return 0;
    return Math.min(100,Math.max(0,Math.round(((nowMs-s.getTime())/(e.getTime()-s.getTime()))*100)));
  };
  const mtDayOn = (m: MT_MedLocal) => Math.max(0,Math.floor((nowMs-(MT_toDate(m.startDate)?.getTime()??nowMs))/86_400_000));
  const expiring = activeMeds.filter(m => { const d=mtDaysLeft(m.endDate); return d!==null&&d>=0&&d<=7; });
  const filtered  = medications.filter(m => filter==="active"?mtIsActive(m):filter==="stopped"?mtIsStopped(m):filter==="paused"?mtIsPaused(m):true);

  const cardAccent = (m: MT_MedLocal) => {
    if (mtIsStopped(m)) return { border:"#e5e7eb",dot:"#9ca3af",bar:"#d1d5db",bg:"#fafafa",tag:"#f3f4f6",tagTxt:"#6b7280" };
    if (mtIsPaused(m))  return { border:"#fcd34d",dot:"#f59e0b",bar:"#f59e0b",bg:"#fffdf5",tag:"#fef3c7",tagTxt:"#92400e" };
    const d=mtDaysLeft(m.endDate);
    if (d!==null&&d<0)  return { border:"#fca5a5",dot:"#ef4444",bar:"#ef4444",bg:"#fff5f5",tag:"#fee2e2",tagTxt:"#991b1b" };
    if (d!==null&&d<=7) return { border:"#fcd34d",dot:"#f59e0b",bar:"#f59e0b",bg:"#fffdf5",tag:"#fef3c7",tagTxt:"#92400e" };
    return { border:"#6ee7b7",dot:"#059669",bar:"#059669",bg:"#f0fdf8",tag:"#d1fae5",tagTxt:"#065f46" };
  };
  const mtStatusLabel = (m: MT_MedLocal) => {
    if (mtIsStopped(m)) return "Stopped";
    if (mtIsPaused(m))  return "Paused";
    const d=mtDaysLeft(m.endDate);
    if (d===null) return "Active";
    if (d<0) return "Expired";
    if (d===0) return "Last day";
    return `${d}d left`;
  };

  // ── Audit / timeline helpers ───────────────────────────────────────────────
  const writeAudit = async (medId: string, action: string, details: Record<string, any>) => {
    try { await addDoc(collection(db,"clinical_audits"),{ patientId,medicationId:medId,action,details, doctorId:doctorId??"unknown",doctorName:doctorName??"Doctor",timestamp:serverTimestamp() }); } catch {}
  };
  const writeTimeline = async (medId: string, title: string, description: string, type: string) => {
    try { await addDoc(collection(db,"timeline_events"),{ patientId,medicationId:medId,title,description,type, doctorId:doctorId??"unknown",doctorName:doctorName??"Doctor",createdAt:serverTimestamp() }); } catch {}
  };

  // ── DB actions ────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!form.drug) return;
    setSaving(true);
    try {
      const days=parseInt(form.duration)||30, startTs=Timestamp.now();
      const endTs=Timestamp.fromDate(new Date(startTs.toDate().getTime()+days*86_400_000));
      const ref=await addDoc(collection(db,"prescriptions"),{
        medication:form.drug.toUpperCase(), drug:form.drug,
        dosage:`${form.dose}${form.unit}`.toUpperCase(), dose:form.dose, unit:form.unit,
        frequency:form.frequency, route:form.route, indication:form.indication,
        instructions:form.instructions, warnings:form.warnings, drugClass:form.drugClass,
        duration:form.duration, refills:form.refills, notes:form.notes,
        active:true, paused:false, patientId,
        doctorId:doctorId??"", doctorName:doctorName??"Doctor",
        startDate:startTs, endDate:endTs, createdAt:serverTimestamp(), toolType:null,
        changeHistory:[{ date:startTs,changeType:"started",newDose:`${form.dose}${form.unit}`,changedBy:doctorName??"Doctor" }],
      });
      await writeAudit(ref.id,"PRESCRIBED",{ drug:form.drug,dose:form.dose });
      await writeTimeline(ref.id,`${form.drug.toUpperCase()} prescribed`,`${form.dose}${form.unit} ${form.frequency} for ${form.duration} days`,"medication_start");
      setForm(blankForm); setShowAdd(false);
      showToast(`Prescribed: ${form.drug.toUpperCase()}`);
      onExternalUpdate?.();
    } catch { showToast("Failed to save — check connection"); }
    finally { setSaving(false); }
  };

  const handleStop = async () => {
    if (!stopTarget) return;
    setSaving(true);
    try {
      const ch={ date:Timestamp.now(),changeType:"stopped" as MT_ChangeType,changedBy:doctorName??"Doctor",reason:stopReason||undefined };
      await updateDoc(doc(db,"prescriptions",stopTarget.id),{
        active:false,paused:false,stopReason:stopReason||"",
        stoppedAt:serverTimestamp(),stoppedBy:doctorName??"Doctor",
        changeHistory:[...(stopTarget.changeHistory??[]),ch],
      });
      await writeAudit(stopTarget.id,"STOPPED",{ reason:stopReason });
      await writeTimeline(stopTarget.id,`${stopTarget.medication} stopped`,stopReason||"No reason given","medication_stop");
      await addDoc(collection(db,"patientNotifications"),{
        patientId,type:"medication_stop",
        title:`${stopTarget.medication} has been stopped`,
        body:`Your doctor has stopped ${stopTarget.medication}${stopTarget.dosage?" "+stopTarget.dosage:""}. ${stopReason?"Reason: "+stopReason:"Please contact your doctor if you have questions."}`,
        medicationId:stopTarget.id,createdAt:serverTimestamp(),read:false,priority:"high",
        senderId:doctorId,senderName:doctorName??"Doctor",
      });
      setStopTarget(null); setStopReason("");
      showToast(`${stopTarget.medication} stopped`);
      onExternalUpdate?.();
    } catch { showToast("Failed to stop medication"); }
    finally { setSaving(false); }
  };

  // Only stopped meds can be restarted — active/paused cannot
  const handleRestart = async (med: MT_MedLocal) => {
    if (!mtIsStopped(med)) return;
    setSaving(true);
    try {
      const newStart=Timestamp.now();
      const newEnd=Timestamp.fromDate(new Date(newStart.toDate().getTime()+(parseInt(String(med.duration))||30)*86_400_000));
      const ch={ date:newStart,changeType:"restarted" as MT_ChangeType,changedBy:doctorName??"Doctor",newDose:med.dosage??`${med.dose}${med.unit}` };
      await updateDoc(doc(db,"prescriptions",med.id),{
        active:true,paused:false,startDate:newStart,endDate:newEnd,stopReason:"",
        changeHistory:[...(med.changeHistory??[]),ch],
      });
      await writeAudit(med.id,"RESTARTED",{ medication:med.medication });
      await writeTimeline(med.id,`${med.medication} restarted`,`Reactivated by ${doctorName??"Doctor"}`,"medication_restart");
      showToast(`${med.medication} restarted`);
      onExternalUpdate?.();
    } catch { showToast("Failed to restart"); }
    finally { setSaving(false); }
  };

  const handlePause = async (med: MT_MedLocal) => {
    if (!mtIsActive(med)) return;
    setSaving(true);
    try {
      const ch={ date:Timestamp.now(),changeType:"paused" as MT_ChangeType,changedBy:doctorName??"Doctor" };
      await updateDoc(doc(db,"prescriptions",med.id),{ paused:true,pausedAt:serverTimestamp(),changeHistory:[...(med.changeHistory??[]),ch] });
      await writeAudit(med.id,"PAUSED",{ medication:med.medication });
      showToast(`${med.medication} paused`);
      onExternalUpdate?.();
    } catch { showToast("Failed to pause"); }
    finally { setSaving(false); }
  };

  const handleResume = async (med: MT_MedLocal) => {
    if (!mtIsPaused(med)) return;
    setSaving(true);
    try {
      const ch={ date:Timestamp.now(),changeType:"restarted" as MT_ChangeType,changedBy:doctorName??"Doctor" };
      await updateDoc(doc(db,"prescriptions",med.id),{ paused:false,changeHistory:[...(med.changeHistory??[]),ch] });
      await writeAudit(med.id,"RESUMED",{ medication:med.medication });
      showToast(`${med.medication} resumed`);
      onExternalUpdate?.();
    } catch { showToast("Failed to resume"); }
    finally { setSaving(false); }
  };

  const handleAdjust = async () => {
    if (!adjustTarget) return;
    setSaving(true);
    try {
      const prevDose=adjustTarget.dosage??`${adjustTarget.dose}${adjustTarget.unit}`;
      const newDose=adjustForm.dose?`${adjustForm.dose}${adjustForm.unit}`.toUpperCase():prevDose;
      let ct:MT_ChangeType=adjustForm.changeType;
      if (adjustForm.dose&&!adjustForm.route) ct=parseFloat(adjustForm.dose)>parseFloat(String(adjustTarget.dose??0))?"dose_increased":"dose_decreased";
      else if (adjustForm.frequency&&!adjustForm.dose) ct="frequency_changed";
      else if (adjustForm.route&&!adjustForm.dose) ct="route_changed";
      const ch={ date:Timestamp.now(),changeType:ct,previousDose:prevDose,newDose,
        previousFrequency:adjustForm.frequency?adjustTarget.frequency:undefined,
        newFrequency:adjustForm.frequency||undefined,
        changedBy:doctorName??"Doctor",reason:adjustForm.reason||undefined };
      const updates:Record<string,any>={ changeHistory:[...(adjustTarget.changeHistory??[]),ch] };
      if (adjustForm.dose)      { updates.dose=adjustForm.dose; updates.unit=adjustForm.unit; updates.dosage=newDose; }
      if (adjustForm.frequency) updates.frequency=adjustForm.frequency;
      if (adjustForm.route)     updates.route=adjustForm.route;
      await updateDoc(doc(db,"prescriptions",adjustTarget.id),updates);
      await writeAudit(adjustTarget.id,"ADJUSTED",{ ct,prevDose,newDose });
      await writeTimeline(adjustTarget.id,`${adjustTarget.medication} adjusted`,`${ct.replace(/_/g," ")}: ${prevDose} -> ${newDose}`,"medication_adjust");
      await addDoc(collection(db,"patientNotifications"),{
        patientId,type:"medication_change",
        title:`${adjustTarget.medication} updated`,
        body:`Your ${adjustTarget.medication} has been updated.\nNew dose: ${newDose}${adjustForm.frequency?"\nNew frequency: "+adjustForm.frequency:""}${adjustForm.reason?"\nReason: "+adjustForm.reason:""}`,
        medicationId:adjustTarget.id,createdAt:serverTimestamp(),read:false,priority:"normal",
        senderId:doctorId,senderName:doctorName??"Doctor",
      });
      setAdjustTarget(null);
      setAdjustForm({ dose:"",unit:"mg",frequency:"",route:"",reason:"",changeType:"dose_increased" });
      showToast(`${adjustTarget.medication} updated`);
      onExternalUpdate?.();
    } catch { showToast("Failed to update"); }
    finally { setSaving(false); }
  };

  const handleExtend = async () => {
    if (!extendTarget) return;
    setSaving(true);
    try {
      const currentEnd=MT_toDate(extendTarget.endDate)??new Date();
      const newEnd=Timestamp.fromDate(new Date(currentEnd.getTime()+(parseInt(extendDays)||30)*86_400_000));
      const ch={ date:Timestamp.now(),changeType:"duration_extended" as MT_ChangeType,changedBy:doctorName??"Doctor",reason:extendReason||undefined };
      await updateDoc(doc(db,"prescriptions",extendTarget.id),{
        endDate:newEnd,
        duration:String(parseInt(String(extendTarget.duration??30))+(parseInt(extendDays)||30)),
        changeHistory:[...(extendTarget.changeHistory??[]),ch],
      });
      await writeAudit(extendTarget.id,"EXTENDED",{ days:extendDays });
      setExtendTarget(null); setExtendDays("30"); setExtendReason("");
      showToast(`${extendTarget.medication} extended by ${extendDays} days`);
      onExternalUpdate?.();
    } catch { showToast("Failed to extend"); }
    finally { setSaving(false); }
  };

  const handleSendToPatient = async (med: MT_MedLocal) => {
    const pharma=MT_getDrugInfo(med.drug??med.medication??"");
    const body=[
      `${(med.medication??med.drug??"").toUpperCase()} ${med.dosage??`${med.dose}${med.unit}`} — ${med.frequency}`,
      `Course: ${MT_fmt(med.startDate)} to ${MT_fmt(med.endDate)} (${med.duration} days)`,
      med.instructions||pharma?.patientInstructions||"Take as directed.",
      med.warnings?`Warnings: ${med.warnings}`:pharma?.warnings?.length?`Warnings: ${pharma.warnings.join("; ")}`:null,
      pharma?.monitoring?.length?`Monitor: ${pharma.monitoring.join(", ")}`:null,
      `\n— ${doctorName??"Your Doctor"}`,
    ].filter(Boolean).join("\n\n");
    try {
      await addDoc(collection(db,"patientNotifications"),{
        patientId,type:"prescription",
        title:`Prescription: ${med.medication??med.drug} ${med.dosage??`${med.dose}${med.unit}`}`,
        body,medicationId:med.id,createdAt:serverTimestamp(),read:false,priority:"normal",
        senderId:doctorId,senderName:doctorName??"Doctor",
      });
      showToast("Sent to patient");
    } catch { showToast("Failed to send"); }
  };

  const handleDrugChange = (v: string) => {
    const p=MT_getDrugInfo(v);
    setForm(prev=>({
      ...prev,drug:v,
      drugClass:   p?.drugClass??prev.drugClass,
      instructions:p?.patientInstructions??prev.instructions,
      warnings:    p?.warnings?.slice(0,3).join("; ")??prev.warnings,
      dose:        p?.commonDoses?.[1]??prev.dose,
      unit:        p?.unit??prev.unit,
    }));
  };

  const previewEnd=new Date(nowMs+(parseInt(form.duration)||30)*86_400_000)
    .toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ textAlign:"center",padding:"40px 0",color:"#9ca3af",fontSize:13 }}>
      <div style={{ fontSize:28,marginBottom:8 }}>💊</div>Loading medications…
    </div>
  );

  return (
    <div style={{ fontFamily:"inherit" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:2000,background:"#111827",color:"#fff",padding:"10px 16px",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Stat strip */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16 }}>
        {[
          { label:"Total Rx",       value:medications.length,                    color:"#7c3aed",bg:"#f5f3ff" },
          { label:"Active",         value:activeMeds.length,                      color:"#059669",bg:"#f0fdf4" },
          { label:"Expiring 7d",    value:expiring.length,                        color:"#d97706",bg:"#fffbeb" },
          { label:"Paused/Stopped", value:pausedMeds.length+stoppedMeds.length,   color:"#6b7280",bg:"#f9fafb" },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg,borderRadius:10,padding:"10px 12px",border:`0.5px solid ${s.color}22` }}>
            <div style={{ fontSize:10,fontWeight:600,color:s.color,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.04em" }}>{s.label}</div>
            <div style={{ fontSize:22,fontWeight:800,color:s.color,lineHeight:1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:14,flexWrap:"wrap" }}>
        <div style={{ fontWeight:800,fontSize:13,color:"#111827" }}>💊 Medications</div>
        <div style={{ display:"flex",gap:0,marginLeft:"auto",border:"0.5px solid #e5e7eb",borderRadius:8,overflow:"hidden" }}>
          {(["active","paused","stopped","all"] as const).map((f,i,arr) => {
            const counts={ active:activeMeds.length,paused:pausedMeds.length,stopped:stoppedMeds.length,all:medications.length };
            return (
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:"4px 10px",border:"none",
                borderRight:i<arr.length-1?"0.5px solid #e5e7eb":"none",
                background:filter===f?"#7c3aed":"transparent",
                color:filter===f?"#fff":"#6b7280",
                fontSize:11,fontWeight:filter===f?700:500,cursor:"pointer",fontFamily:"inherit",
              }}>
                {f.charAt(0).toUpperCase()+f.slice(1)} · {counts[f]}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length===0 && <div style={{ textAlign:"center",padding:"28px 0",color:"#9ca3af",fontSize:13 }}>No {filter} medications</div>}

      {/* Medication cards */}
      {filtered.map(med => {
        const a=cardAccent(med), days=mtDaysLeft(med.endDate), prog=mtCoursePct(med), open=expandedId===med.id;
        const canRestart=mtIsStopped(med), canStop=mtIsActive(med)||mtIsPaused(med);
        const canPause=mtIsActive(med), canResume=mtIsPaused(med), canAdjust=mtIsActive(med)||mtIsPaused(med);
        return (
          <div key={med.id} style={{ borderRadius:14,border:`1.5px solid ${a.border}`,background:a.bg,marginBottom:10,overflow:"hidden",opacity:mtIsStopped(med)?0.72:1 }}>

            {/* Header */}
            <div onClick={()=>setExpandedId(open?null:med.id)} style={{ padding:"13px 14px",cursor:"pointer" }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                <div style={{ marginTop:3,width:10,height:10,borderRadius:"50%",background:a.dot,flexShrink:0,boxShadow:`0 0 0 3px ${a.dot}22` }} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                    <span style={{ fontWeight:800,fontSize:14,color:"#111827" }}>{(med.medication??med.drug??"").replace(/\b\w/g,c=>c.toUpperCase())}</span>
                    <span style={{ fontWeight:700,fontSize:13,color:a.dot }}>{med.dosage??`${med.dose}${med.unit}`}</span>
                    <span style={{ padding:"2px 8px",borderRadius:999,fontSize:10,fontWeight:700,background:a.tag,color:a.tagTxt }}>{mtStatusLabel(med)}</span>
                    {med.drugClass&&<span style={{ padding:"2px 7px",borderRadius:999,fontSize:10,fontWeight:600,background:"#ede9fe",color:"#6d28d9" }}>{med.drugClass}</span>}
                  </div>
                  <div style={{ fontSize:11,color:"#6b7280",marginTop:3,display:"flex",gap:10,flexWrap:"wrap" }}>
                    <span>{med.frequency}</span><span style={{ color:"#d1d5db" }}>·</span>
                    <span>{med.route}</span><span style={{ color:"#d1d5db" }}>·</span>
                    <span>{med.indication}</span>
                  </div>
                  {med.stopReason&&<div style={{ fontSize:10,color:"#ef4444",marginTop:3 }}>Stop reason: {med.stopReason}</div>}
                </div>
                <div style={{ color:"#9ca3af",fontSize:18,flexShrink:0,transform:open?"rotate(90deg)":"none",transition:"transform 0.2s",lineHeight:1 }}>›</div>
              </div>

              {/* Progress bar */}
              {(mtIsActive(med)||mtIsPaused(med))&&(
                <div style={{ marginTop:10 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:600,marginBottom:4 }}>
                    <span style={{ color:"#9ca3af" }}>Started {MT_fmt(med.startDate,{day:"numeric",month:"short"})}</span>
                    <span style={{ color:a.dot }}>Day {mtDayOn(med)} of {med.duration}</span>
                    <span style={{ color:"#9ca3af" }}>Ends {MT_fmt(med.endDate,{day:"numeric",month:"short",year:"numeric"})}</span>
                  </div>
                  <div style={{ position:"relative",height:7,borderRadius:999,background:"#f3f4f6",overflow:"hidden" }}>
                    <div style={{ position:"absolute",left:0,top:0,bottom:0,width:`${prog}%`,borderRadius:999,
                      background:days!==null&&days<0?"repeating-linear-gradient(45deg,#ef4444,#ef4444 4px,#fecaca 4px,#fecaca 8px)":
                        mtIsPaused(med)?"repeating-linear-gradient(45deg,#f59e0b,#f59e0b 4px,#fef3c7 4px,#fef3c7 8px)":a.bar }} />
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"#9ca3af",marginTop:3 }}>
                    <span>Rx'd {MT_fmtTime(med.createdAt)}</span>
                    <span style={{ fontWeight:700,color:a.dot }}>{prog}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Expanded body */}
            {open&&(
              <div style={{ borderTop:`1px solid ${a.border}`,padding:"12px 14px 14px" }}>

                {/* Date grid */}
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
                  {[{icon:"🗓",label:"Prescribed",value:MT_fmtTime(med.createdAt)},{icon:"►",label:"Start",value:MT_fmt(med.startDate)},{icon:"■",label:"End",value:MT_fmt(med.endDate)}].map(({icon,label,value})=>(
                    <div key={label} style={{ background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:10,padding:"9px 11px" }}>
                      <div style={{ fontSize:9,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{icon} {label}</div>
                      <div style={{ fontSize:11,fontWeight:700,color:"#111827" }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Rx detail */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14 }}>
                  {[["Duration",`${med.duration} days`],["Refills",String(med.refills)],["Prescribed by",med.doctorName??doctorName??"—"]].map(([k,v])=>(
                    <div key={k}><div style={{ fontSize:10,fontWeight:600,color:"#9ca3af",marginBottom:2 }}>{k}</div><div style={{ fontSize:12,fontWeight:600,color:"#374151" }}>{v}</div></div>
                  ))}
                </div>

                {/* Instructions / Warnings */}
                {(med.instructions||med.warnings)&&(
                  <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:14 }}>
                    {med.instructions&&<div style={{ background:"#eff6ff",border:"0.5px solid #bfdbfe",borderRadius:10,padding:"9px 11px" }}>
                      <div style={{ fontSize:10,fontWeight:700,color:"#1d4ed8",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em" }}>Instructions</div>
                      <div style={{ fontSize:12,color:"#1e40af",lineHeight:1.55 }}>{med.instructions}</div>
                    </div>}
                    {med.warnings&&<div style={{ background:"#fff7ed",border:"0.5px solid #fed7aa",borderRadius:10,padding:"9px 11px" }}>
                      <div style={{ fontSize:10,fontWeight:700,color:"#c2410c",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em" }}>Warnings</div>
                      <div style={{ fontSize:12,color:"#9a3412",lineHeight:1.55 }}>{med.warnings}</div>
                    </div>}
                  </div>
                )}

                {/* Change history */}
                {(med.changeHistory?.length??0)>0&&(
                  <div style={{ marginBottom:14,padding:"10px 12px",background:"#f9fafb",borderRadius:10,border:"0.5px solid #e5e7eb" }}>
                    <div style={{ fontSize:10,fontWeight:700,color:"#374151",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>Change History</div>
                    <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                      {[...(med.changeHistory??[])].reverse().map((ch,ci)=>{
                        const cc=MT_CHANGE_COLORS[ch.changeType]??{ bg:"#f3f4f6",color:"#374151",label:String(ch.changeType) };
                        return (
                          <div key={ci} style={{ display:"flex",alignItems:"flex-start",gap:8 }}>
                            <span style={{ padding:"2px 6px",borderRadius:4,background:cc.bg,color:cc.color,fontSize:9,fontWeight:800,flexShrink:0,marginTop:1 }}>{cc.label}</span>
                            <div>
                              <div style={{ fontSize:10,color:"#374151" }}>
                                {MT_fmt(ch.date)} · {ch.changedBy}
                                {ch.previousDose&&ch.newDose?` · ${ch.previousDose} to ${ch.newDose}`:""}
                                {ch.previousFrequency&&ch.newFrequency?` · ${ch.previousFrequency} to ${ch.newFrequency}`:""}
                              </div>
                              {ch.reason&&<div style={{ fontSize:10,color:"#9ca3af" }}>{ch.reason}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  <button onClick={()=>handleSendToPatient(med)} style={{ padding:"6px 12px",borderRadius:7,border:"0.5px solid #3b82f6",background:"#eff6ff",color:"#1d4ed8",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Send to Patient</button>
                  {canAdjust&&<button onClick={()=>{ setAdjustTarget(med); setAdjustForm({dose:"",unit:med.unit??"mg",frequency:med.frequency,route:med.route,reason:"",changeType:"dose_increased"}); }}
                    style={{ padding:"6px 12px",borderRadius:7,border:"0.5px solid #7c3aed",background:"#f5f3ff",color:"#6d28d9",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Adjust</button>}
                  {canAdjust&&<button onClick={()=>{ setExtendTarget(med); setExtendDays("30"); setExtendReason(""); }}
                    style={{ padding:"6px 12px",borderRadius:7,border:"0.5px solid #0891b2",background:"#ecfeff",color:"#0e7490",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Extend</button>}
                  {canPause&&<button onClick={()=>handlePause(med)} style={{ padding:"6px 12px",borderRadius:7,border:"0.5px solid #f59e0b",background:"#fffbeb",color:"#b45309",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Pause</button>}
                  {canResume&&<button onClick={()=>handleResume(med)} style={{ padding:"6px 12px",borderRadius:7,border:"0.5px solid #059669",background:"#f0fdf4",color:"#059669",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Resume</button>}
                  {canStop&&<button onClick={()=>{ setStopTarget(med); setStopReason(""); }} style={{ padding:"6px 12px",borderRadius:7,border:"0.5px solid #ef4444",background:"#fff5f5",color:"#dc2626",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Stop</button>}
                  {canRestart&&<button onClick={()=>handleRestart(med)} style={{ padding:"6px 12px",borderRadius:7,border:"0.5px solid #059669",background:"#f0fdf4",color:"#059669",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Restart</button>}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Timeline */}
      {medications.length>0&&(
        <div style={{ marginTop:20,paddingTop:16,borderTop:"0.5px solid #f3f4f6" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
            <div style={{ fontWeight:800,fontSize:12,color:"#111827" }}>Prescription Timeline</div>
            <div style={{ fontSize:10,color:"#9ca3af" }}>Newest first</div>
          </div>
          <div style={{ position:"relative",paddingLeft:22 }}>
            <div style={{ position:"absolute",left:8,top:6,bottom:6,width:2,background:"linear-gradient(to bottom,#7c3aed,#e5e7eb)",borderRadius:999 }} />
            {[...medications].sort((a,b)=>(MT_toDate(b.createdAt??b.startDate)?.getTime()??0)-(MT_toDate(a.createdAt??a.startDate)?.getTime()??0))
              .map((m,i,arr)=>{
                const a=cardAccent(m),days=mtDaysLeft(m.endDate),prog=mtCoursePct(m);
                return (
                  <div key={m.id} style={{ position:"relative",marginBottom:i<arr.length-1?18:0 }}>
                    <div style={{ position:"absolute",left:-22,top:2,width:12,height:12,borderRadius:"50%",background:a.dot,border:"2px solid #fff",boxShadow:`0 0 0 2px ${a.dot}55` }} />
                    <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
                      <span style={{ fontWeight:800,fontSize:12,color:"#111827" }}>{(m.medication??m.drug??"").replace(/\b\w/g,c=>c.toUpperCase())}</span>
                      <span style={{ fontSize:11,color:"#6b7280" }}>{m.dosage??`${m.dose}${m.unit}`} · {m.frequency}</span>
                      <span style={{ padding:"1px 7px",borderRadius:999,fontSize:10,fontWeight:700,background:a.tag,color:a.tagTxt }}>{mtStatusLabel(m)}</span>
                    </div>
                    <div style={{ fontSize:10,color:"#9ca3af",marginTop:3,display:"flex",gap:8,flexWrap:"wrap" }}>
                      <span style={{ fontWeight:600,color:"#6b7280" }}>{MT_fmt(m.startDate,{day:"numeric",month:"short"})} to {MT_fmt(m.endDate,{day:"numeric",month:"short",year:"numeric"})}</span>
                      <span>· {m.duration}d · {m.indication}</span>
                      {MT_fmtTime(m.createdAt)!=="—"&&<span>· Rx'd {MT_fmtTime(m.createdAt)}</span>}
                    </div>
                    {(mtIsActive(m)||mtIsPaused(m))&&(
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:5 }}>
                        <div style={{ flex:1,maxWidth:200,height:4,borderRadius:999,background:"#f3f4f6",overflow:"hidden" }}>
                          <div style={{ height:"100%",width:`${prog}%`,background:a.bar,borderRadius:999 }} />
                        </div>
                        <span style={{ fontSize:10,fontWeight:700,color:a.dot }}>{prog}%</span>
                        {days!==null&&<span style={{ fontSize:10,color:"#9ca3af" }}>{days<0?"Expired":`${days}d left`}</span>}
                      </div>
                    )}
                    {(m.changeHistory?.length??0)>0&&(
                      <div style={{ marginTop:5,paddingLeft:10,borderLeft:`2px solid ${a.border}`,display:"flex",flexDirection:"column",gap:3 }}>
                        {m.changeHistory!.map((ch,ci)=>{
                          const cc=MT_CHANGE_COLORS[ch.changeType]??{bg:"#f3f4f6",color:"#374151",label:String(ch.changeType)};
                          return (
                            <div key={ci} style={{ display:"flex",alignItems:"center",gap:6 }}>
                              <span style={{ padding:"1px 5px",borderRadius:4,background:cc.bg,color:cc.color,fontSize:9,fontWeight:800 }}>{cc.label}</span>
                              <span style={{ fontSize:10,color:"#9ca3af" }}>{MT_fmt(ch.date)}</span>
                              {ch.previousDose&&ch.newDose&&<span style={{ fontSize:10,color:"#6b7280" }}>{ch.previousDose} to {ch.newDose}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add new prescription */}
      {showAdd?(
        <div style={{ border:"1.5px dashed #10b981",borderRadius:14,padding:14,marginTop:16,background:"#f0fdf4" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
            <div style={{ fontWeight:800,fontSize:13,color:"#065f46" }}>New Prescription</div>
            <div style={{ marginLeft:"auto",padding:"3px 10px",borderRadius:999,background:"#d1fae5",fontSize:10,fontWeight:700,color:"#065f46" }}>Today to {previewEnd} ({form.duration} days)</div>
          </div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:8 }}>
            <div style={{ flex:"2 1 140px" }}>
              <div style={{ fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.04em" }}>Drug</div>
              <input list="mt-drug-list" value={form.drug} onChange={e=>handleDrugChange(e.target.value)} placeholder="e.g. Amlodipine" style={MT_inp} />
              <datalist id="mt-drug-list">{DRUGS.map(d=><option key={d} value={d}/>)}</datalist>
            </div>
            <div style={{ flex:"0 0 72px" }}>
              <div style={{ fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.04em" }}>Dose</div>
              <input value={form.dose} onChange={e=>setForm(p=>({...p,dose:e.target.value}))} list="mt-doses" style={MT_inp} />
              {MT_getDrugInfo(form.drug)&&<datalist id="mt-doses">{MT_getDrugInfo(form.drug)!.commonDoses.map(d=><option key={d} value={d}/>)}</datalist>}
            </div>
            <div style={{ flex:"0 0 60px" }}><MT_MedSel label="Unit" value={form.unit} onChange={v=>setForm(p=>({...p,unit:v}))} options={UNITS} /></div>
            <div style={{ flex:"1 1 120px" }}><MT_MedSel label="Frequency" value={form.frequency} onChange={v=>setForm(p=>({...p,frequency:v}))} options={FREQS} /></div>
            <div style={{ flex:"0 0 75px" }}><MT_MedSel label="Route" value={form.route} onChange={v=>setForm(p=>({...p,route:v}))} options={ROUTES_LIST} /></div>
            <div style={{ flex:"1 1 100px" }}><MT_MedInp label="Drug Class" value={form.drugClass} onChange={v=>setForm(p=>({...p,drugClass:v}))} placeholder="CCB, ARB…" /></div>
          </div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:8 }}>
            <div style={{ flex:"2 1 100px" }}><MT_MedSel label="Indication" value={form.indication} onChange={v=>setForm(p=>({...p,indication:v}))} options={MT_INDICATIONS} /></div>
            <MT_MedInp label="Duration (days)" value={form.duration} onChange={v=>setForm(p=>({...p,duration:v}))} placeholder="30" type="number" />
            <MT_MedInp label="Refills" value={String(form.refills)} onChange={v=>setForm(p=>({...p,refills:parseInt(v)||0}))} placeholder="0" type="number" />
          </div>
          <MT_MedTA label="Patient instructions" value={form.instructions} onChange={v=>setForm(p=>({...p,instructions:v}))} placeholder="How and when to take…" rows={2} />
          <div style={{ marginTop:8 }}><MT_MedTA label="Warnings" value={form.warnings} onChange={v=>setForm(p=>({...p,warnings:v}))} placeholder="Side effects to watch for…" rows={2} /></div>
          {form.drug&&MT_getDrugInfo(form.drug)&&(
            <div style={{ marginTop:10,padding:"8px 11px",background:"#eff6ff",borderRadius:9,border:"0.5px solid #bfdbfe",fontSize:11,color:"#1d4ed8" }}>
              {form.drug}: {MT_getDrugInfo(form.drug)!.minDose}–{MT_getDrugInfo(form.drug)!.maxDose}{MT_getDrugInfo(form.drug)!.unit} · Pregnancy: {MT_getDrugInfo(form.drug)!.pregnancyCategory} · Monitor: {MT_getDrugInfo(form.drug)!.monitoring.join(", ")}
            </div>
          )}
          <div style={{ display:"flex",gap:6,marginTop:12 }}>
            <button onClick={handleAdd} disabled={!form.drug||saving}
              style={{ padding:"8px 16px",borderRadius:8,border:"none",background:!form.drug||saving?"#d1d5db":"#059669",color:"#fff",fontSize:12,fontWeight:800,cursor:!form.drug||saving?"not-allowed":"pointer",fontFamily:"inherit" }}>
              {saving?"Saving…":"Prescribe and Save"}
            </button>
            <button onClick={()=>{ setShowAdd(false); setForm(blankForm); }}
              style={{ padding:"8px 14px",borderRadius:8,border:"0.5px solid #d1d5db",background:"#fff",color:"#6b7280",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowAdd(true)}
          style={{ width:"100%",marginTop:16,padding:"11px",borderRadius:12,border:"1.5px dashed #10b981",background:"transparent",color:"#059669",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit" }}>
          + Add New Prescription
        </button>
      )}

      {/* STOP MODAL */}
      {stopTarget&&(
        <MT_Modal title={`Stop ${stopTarget.medication}?`} onClose={()=>setStopTarget(null)}>
          <div style={{ marginBottom:14,padding:"10px 12px",background:"#fff5f5",border:"0.5px solid #fca5a5",borderRadius:10,fontSize:12,color:"#991b1b" }}>
            This will mark <strong>{stopTarget.medication}</strong> as stopped and notify the patient. You can restart it later.
          </div>
          <MT_MedTA label="Stop reason (optional)" value={stopReason} onChange={setStopReason} placeholder="e.g. Side effects, treatment complete…" rows={3} />
          <div style={{ display:"flex",gap:8,marginTop:14 }}>
            <button onClick={handleStop} disabled={saving}
              style={{ padding:"8px 16px",borderRadius:8,border:"none",background:"#dc2626",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit" }}>
              {saving?"Stopping…":"Confirm Stop"}
            </button>
            <button onClick={()=>setStopTarget(null)} style={{ padding:"8px 14px",borderRadius:8,border:"0.5px solid #d1d5db",background:"#fff",color:"#6b7280",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
          </div>
        </MT_Modal>
      )}

      {/* ADJUST MODAL */}
      {adjustTarget&&(
        <MT_Modal title={`Adjust: ${adjustTarget.medication}`} onClose={()=>setAdjustTarget(null)}>
          <div style={{ marginBottom:12,padding:"8px 11px",background:"#f5f3ff",border:"0.5px solid #c4b5fd",borderRadius:10,fontSize:11,color:"#6d28d9" }}>
            Current: <strong>{adjustTarget.dosage??`${adjustTarget.dose}${adjustTarget.unit}`}</strong> · {adjustTarget.frequency} · {adjustTarget.route}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
            <div>
              <div style={{ fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.04em" }}>New Dose</div>
              <input value={adjustForm.dose} onChange={e=>setAdjustForm(p=>({...p,dose:e.target.value}))} placeholder={`Current: ${adjustTarget.dose}`} style={MT_inp} list="mt-adj-doses" />
              {MT_getDrugInfo(adjustTarget.drug??adjustTarget.medication??"")&&(
                <datalist id="mt-adj-doses">{MT_getDrugInfo(adjustTarget.drug??adjustTarget.medication??"")!.commonDoses.map(d=><option key={d} value={d}/>)}</datalist>
              )}
            </div>
            <MT_MedSel label="Unit" value={adjustForm.unit} onChange={v=>setAdjustForm(p=>({...p,unit:v}))} options={UNITS} />
          </div>
          <div style={{ marginBottom:8 }}><MT_MedSel label="New Frequency" value={adjustForm.frequency} onChange={v=>setAdjustForm(p=>({...p,frequency:v}))} options={["(Keep current)",...FREQS]} /></div>
          <div style={{ marginBottom:8 }}><MT_MedSel label="New Route" value={adjustForm.route} onChange={v=>setAdjustForm(p=>({...p,route:v}))} options={["(Keep current)",...ROUTES_LIST]} /></div>
          <div style={{ marginBottom:8 }}><MT_MedSel label="Change Type" value={adjustForm.changeType} onChange={v=>setAdjustForm(p=>({...p,changeType:v as MT_ChangeType}))} options={["dose_increased","dose_decreased","frequency_changed","route_changed"]} /></div>
          <MT_MedTA label="Reason for change" value={adjustForm.reason} onChange={v=>setAdjustForm(p=>({...p,reason:v}))} placeholder="Clinical reason…" rows={2} />
          <div style={{ display:"flex",gap:8,marginTop:14 }}>
            <button onClick={handleAdjust} disabled={saving||(!adjustForm.dose&&!adjustForm.frequency&&!adjustForm.route)}
              style={{ padding:"8px 16px",borderRadius:8,border:"none",background:saving?"#d1d5db":"#7c3aed",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit" }}>
              {saving?"Saving…":"Apply Changes"}
            </button>
            <button onClick={()=>setAdjustTarget(null)} style={{ padding:"8px 14px",borderRadius:8,border:"0.5px solid #d1d5db",background:"#fff",color:"#6b7280",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
          </div>
        </MT_Modal>
      )}

      {/* EXTEND MODAL */}
      {extendTarget&&(
        <MT_Modal title={`Extend: ${extendTarget.medication}`} onClose={()=>setExtendTarget(null)}>
          <div style={{ marginBottom:12,padding:"8px 11px",background:"#ecfeff",border:"0.5px solid #a5f3fc",borderRadius:10,fontSize:11,color:"#0e7490" }}>
            Current end: <strong>{MT_fmt(extendTarget.endDate)}</strong> · Total duration: {extendTarget.duration} days
          </div>
          <div style={{ marginBottom:8 }}><MT_MedInp label="Extend by (days)" value={extendDays} onChange={setExtendDays} placeholder="30" type="number" /></div>
          <div style={{ marginBottom:8,padding:"7px 10px",background:"#f0fdf4",borderRadius:8,fontSize:11,color:"#059669",fontWeight:600 }}>
            New end date: {new Date((MT_toDate(extendTarget.endDate)?.getTime()??nowMs)+(parseInt(extendDays)||30)*86_400_000).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
          </div>
          <MT_MedTA label="Reason (optional)" value={extendReason} onChange={setExtendReason} placeholder="Ongoing therapy…" rows={2} />
          <div style={{ display:"flex",gap:8,marginTop:14 }}>
            <button onClick={handleExtend} disabled={saving}
              style={{ padding:"8px 16px",borderRadius:8,border:"none",background:"#0891b2",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit" }}>
              {saving?"Saving…":"Extend Course"}
            </button>
            <button onClick={()=>setExtendTarget(null)} style={{ padding:"8px 14px",borderRadius:8,border:"0.5px solid #d1d5db",background:"#fff",color:"#6b7280",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
          </div>
        </MT_Modal>
      )}

    </div>
  );
}

// ─── Panel: Adherence ────────────────────────────────────────────────────────

function AdherenceTab({ readings, adherence }: { readings: BPReading[]; adherence: AdherenceMap }) {
  const { percentage: readingPct } = useMemo(() => calculateAdherence(readings, 30, 2), [readings]);
  const allDays = useMemo(() => Object.values(adherence).flatMap(m => Object.values(m)), [adherence]);
  const medPct = allDays.length > 0 ? Math.round(allDays.filter(Boolean).length / allDays.length * 100) : 0;

  // ESC/ESH BP monitoring: recommended = 2/day, 7 days/week
  const last30Days = readings.filter(r => { const d = new Date(); d.setDate(d.getDate()-30); return r.recordedAt >= d; });
  const uniqueDaysRead = new Set(last30Days.map(r => r.recordedAt.toISOString().split("T")[0])).size;
  const bpAdh30 = Math.round(uniqueDaysRead / 30 * 100);

  return (
    <div>
      <SectHeader label="Adherence Overview" color={T.success} />
      <div className="htn-stat-row" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard label="Medication Adherence" value={`${medPct}%`} sub="30-day calendar" color={medPct>=80?T.success:medPct>=60?T.warn:T.danger} />
        <StatCard label="BP Monitoring (30d)" value={`${bpAdh30}%`} sub={`${uniqueDaysRead}/30 days`} color={bpAdh30>=80?T.success:bpAdh30>=60?T.warn:T.danger} />
        <StatCard label="Readings (30d)" value={`${last30Days.length}`} sub={`Target: ≥60 (2/day)`} color={last30Days.length>=60?T.success:last30Days.length>=30?T.warn:T.danger} />
      </div>
      {/* ESC/ESH guidance */}
      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "8px 12px", marginBottom: 14, border: "0.5px solid #bfdbfe" }}>
        <div style={{ fontSize: 11, color: T.info, fontWeight: 600 }}>ESC/ESH 2023 Monitoring Standard</div>
        <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Take BP twice daily (morning before meds + evening), both readings ≥1 min apart, for ≥4 days. Minimum 12 readings for reliable home BP average. Discard first day.</div>
      </div>
      <AdherenceTracker readings={readings} />
    </div>
  );
}

// ─── Panel: Alerts (Science-Based) ───────────────────────────────────────────

function AlertsTab({ alerts, onAdd, onDelete, readings, adherencePct, medications, labOrders }: {
  alerts: Alert[]; onAdd: (a: Alert) => void; onDelete: (id: string) => void;
  readings: BPReading[]; adherencePct: number; medications: Medication[]; labOrders: LabOrder[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [category, setCategory] = useState("BP Threshold");
  const ACTION_OPTS = ["Notify doctor","Notify patient via app","Send SMS to patient","Flag for urgent review","Schedule appointment","Order labs","Escalate to specialist"];
  const CATEGORIES = ["BP Threshold","Medication Change","Adherence","Monitoring Gap","Lab Result","Symptom Alert","Weight Change","Lifestyle","Custom"];
  const scientificAlerts = useMemo(() => generateClinicalAlerts(readings, medications, adherencePct, labOrders), [readings, medications, adherencePct, labOrders]);

  const severityColor = { critical: T.danger, urgent: T.warn, warning: T.orange, info: T.info } as const;
  const severityBg = { critical: "#fef2f2", urgent: "#fff7ed", warning: "#fff7ed", info: "#eff6ff" } as const;

  return (
    <div>
      {/* Auto-generated science-based alerts */}
      <SectHeader label="Clinical Alert Engine — ESC/ESH 2023" color={T.danger} sub={`${scientificAlerts.length} active alert(s)`} />
      {scientificAlerts.length === 0 && (
        <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "0.5px solid #86efac", display: "flex", gap: 10 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div><div style={{ fontWeight: 700, fontSize: 13, color: T.success }}>All Clinical Parameters Satisfactory</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>No automated alerts generated. Continue current management.</div></div>
        </div>
      )}
      {scientificAlerts.map(a => (
        <div key={a.id} style={{ border: `0.5px solid ${severityColor[a.severity]}40`, borderLeft: `4px solid ${severityColor[a.severity]}`, borderRadius: 10, marginBottom: 10, overflow: "hidden", background: severityBg[a.severity] }}>
          <div style={{ padding: "10px 13px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ background: severityColor[a.severity], color: "#fff", padding: "1px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{a.severity.toUpperCase()}</span>
                  <span style={{ color: T.faint, fontSize: 10 }}>{a.category}</span>
                </div>
                <div style={{ fontWeight: 700, color: T.text, fontSize: 13 }}>{a.title}</div>
                <div style={{ color: T.muted, fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>{a.detail}</div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 7, padding: "8px 10px", marginTop: 8 }}>
              <div style={{ color: T.info, fontWeight: 600, fontSize: 10, marginBottom: 4 }}>🎓 Evidence Base</div>
              <div style={{ fontSize: 10, color: T.muted }}>{a.evidence}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ color: T.success, fontWeight: 600, fontSize: 10, marginBottom: 4 }}>✅ Recommended Action</div>
              <div style={{ fontSize: 11, color: T.text, lineHeight: 1.5 }}>{a.action}</div>
            </div>
          </div>
        </div>
      ))}
      {/* Also show legacy ClinicalAlerts component */}
      <ClinicalAlerts readings={readings} adherencePercent={adherencePct} />

      {/* Doctor-created custom alert rules */}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: `0.5px solid ${T.border}` }}>
        <SectHeader label="Custom Alert Rules (Doctor-Created)" color={T.warn} />
        {alerts.map(a => (
          <div key={a.id} style={{ border: "0.5px solid #fed7aa", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
            <div style={{ padding: "9px 12px", background: "#fff7ed", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>🔔</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: T.warn, fontSize: 12 }}>{a.trigger}</div>
                <div style={{ color: T.faint, fontSize: 11 }}>
                  {a.category && <span style={{ background: "#fff7ed", border: "0.5px solid #fed7aa", borderRadius: 4, padding: "1px 6px", fontSize: 10, marginRight: 5 }}>{a.category}</span>}
                  Actions: {a.actions.join(" · ")} · {a.createdAt}
                </div>
                {a.doctorNote && <div style={{ fontSize: 11, color: T.muted, marginTop: 3, fontStyle: "italic" }}>Note: {a.doctorNote}</div>}
              </div>
              <Btn label="Remove" variant="danger" small onClick={() => onDelete(a.id)} />
            </div>
            {a.history.length > 0 && (
              <div style={{ padding: "8px 12px", background: T.card }}>
                {a.history.map((h, i) => <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 2 }}><span style={{ color: T.faint, flexShrink: 0 }}>{h.date}</span><span style={{ color: T.muted }}>{h.message}</span></div>)}
              </div>
            )}
          </div>
        ))}
        {showForm ? (
          <div style={{ border: `1.5px dashed ${T.warn}`, borderRadius: 10, padding: 12, background: "#fffbeb" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <SelField label="Alert Category" value={category} onChange={setCategory} options={CATEGORIES} />
              <InpField label="Trigger condition" value={trigger} onChange={setTrigger} placeholder="e.g. Systolic BP > 160 for 3 consecutive days" />
            </div>
            <TextArea label="Doctor's clinical note (reason for alert)" value={doctorNote} onChange={setDoctorNote} placeholder="Clinical reasoning for this alert rule…" rows={2} />
            <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, margin: "8px 0 5px" }}>Actions to trigger</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {ACTION_OPTS.map(a => {
                const sel = actions.includes(a);
                return <button key={a} onClick={() => setActions(p => sel ? p.filter(x => x !== a) : [...p, a])}
                  style={{ padding: "4px 9px", borderRadius: 7, border: `0.5px solid ${sel?T.warn:T.border}`, background: sel?T.warn:"transparent", color: sel?"#fff":T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{sel ? "✓ " : ""}{a}</button>;
              })}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn label="✓ Create Alert" variant="success" onClick={() => {
                if (!trigger) return;
                onAdd({ id: "a"+Date.now(), trigger, actions, category, doctorNote, createdAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), history: [] });
                setTrigger(""); setActions([]); setDoctorNote(""); setShowForm(false);
              }} />
              <Btn label="Cancel" onClick={() => setShowForm(false)} />
            </div>
          </div>
        ) : <Btn label="🔔 Create New Alert Rule" variant="warn" fullWidth onClick={() => setShowForm(true)} />}
      </div>
    </div>
  );
}

// ─── Panel: Complications ─────────────────────────────────────────────────────

function ComplicationsTab({ complications, onToggle }: { complications: Complication[]; onToggle: (name: string) => void }) {
  const COMP_INFO: Record<string, string> = {
    "Stroke/TIA": "Cerebrovascular disease — BP control reduces recurrence by 40%",
    "CKD (≥Stage 3)": "Target BP <130/80 mmHg; ACEi/ARB renoprotective (SPRINT, UKPDS)",
    "Left Ventricular Hypertrophy": "Regresses with BP control — ARBs, CCBs most effective (LIFE trial)",
    "Hypertensive Retinopathy": "Fundoscopy grading (Keith-Wagener-Barker); urgent referral if Grade 3–4",
    "Heart Failure": "HFrEF: ACEi + BB + MRA proven (RALES, MERIT-HF, CONSENSUS)",
    "Coronary Artery Disease": "Target BP <130/80 mmHg; Beta-blockers + ACEi post-MI (HOPE trial)",
    "Peripheral Arterial Disease": "ABI <0.9; avoid beta-blockers if severe; antiplatelet therapy",
    "Atrial Fibrillation": "Rate control; anticoagulation (CHA₂DS₂-VASc score); BP target <130/80",
    "Aortic Aneurysm": "Strict BP control <130/80; Beta-blockers or ARBs; vascular surgical follow-up",
    "Hypertensive Encephalopathy": "Emergency: controlled IV nitroprusside; target MAP reduction 25% in 1h",
  };

  return (
    <div>
      <SectHeader label="HTN Target Organ Damage & Complications" color={T.danger} />
      <div className="htn-comp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {COMPLICATIONS.map(c => {
          const comp = complications.find(x => x.name === c);
          return (
            <button key={c} onClick={() => onToggle(c)} style={{ border: `0.5px solid ${comp?"#fca5a5":T.border}`, borderRadius: 10, padding: "10px 11px", background: comp?"#fef2f2":T.bg, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${comp?T.danger:T.border}`, background: comp?T.danger:"transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {comp && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: comp?T.danger:T.text }}>{c}</div>
                  {comp && <div style={{ color: T.faint, fontSize: 10, marginTop: 1 }}>Dx: {comp.date}</div>}
                  <div style={{ color: T.faint, fontSize: 10, marginTop: 2, lineHeight: 1.4, fontWeight: 400 }}>{COMP_INFO[c]}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Panel: Lifestyle ─────────────────────────────────────────────────────────

function LifestyleTab({ lifestyle, onToggle, onGrade, onSendNotification, patientId }: {
  lifestyle: LifestyleItem[]; onToggle: (name: string) => void; onGrade: (name: string, grade: LifestyleItem["grade"]) => void;
  onSendNotification: (item: string, grade: LifestyleItem["grade"]) => void; patientId: string;
}) {
  const GRADES: LifestyleItem["grade"][] = ["Good","Moderate","Poor"];
  const gc: Record<LifestyleItem["grade"], string> = { Good: T.success, Moderate: T.warn, Poor: T.danger };
  const LIFESTYLE_BP_REDUCTION: Record<string, string> = {
    "Dietary salt restriction (<5g/day)": "↓ BP ~5–7 mmHg",
    "Weight management / BMI <25": "↓ BP ~1 mmHg per kg lost",
    "Regular aerobic exercise (≥150 min/week)": "↓ BP ~4–8 mmHg",
    "Smoking cessation": "↓ CV risk ×4",
    "Alcohol reduction (≤2 units/day)": "↓ BP ~3–5 mmHg",
    "DASH diet adherence": "↓ BP ~8–14 mmHg",
    "Stress management / mindfulness": "↓ BP ~3–5 mmHg",
    "Sleep hygiene (7–9 hrs/night)": "↓ BP ~3 mmHg (treats OSA)",
    "Caffeine reduction": "Acute ↓ BP on reduction",
    "Home BP monitoring routine": "Improves control & adherence",
  };

  return (
    <div>
      <SectHeader label="Lifestyle Modification" color={T.success} sub="Evidence-based BP reduction values shown" />
      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #86efac" }}>
        <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>Combined lifestyle changes can reduce BP by 10–20 mmHg</div>
        <div style={{ fontSize: 10, color: T.muted }}>Equivalent to a pharmacological agent. ESC/ESH 2023 — Lifestyle is first-line in Stage 1 HTN for 3–6 months.</div>
      </div>
      {LIFESTYLE_ITEMS.map(item => {
        const ls = lifestyle.find(x => x.name === item);
        const reduction = LIFESTYLE_BP_REDUCTION[item];
        return (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: `0.5px solid ${T.border}`, flexWrap: "wrap" }}>
            <button onClick={() => onToggle(item)} style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${ls?T.success:T.border}`, background: ls?T.success:"transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {ls && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: ls?T.text:T.muted }}>{item}</div>
              {reduction && <div style={{ fontSize: 10, color: T.success, marginTop: 1 }}>{reduction}</div>}
            </div>
            {ls && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                {GRADES.map(g => <button key={g} onClick={() => onGrade(item, g)}
                  style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: `0.5px solid ${ls.grade===g?gc[g]:T.border}`, background: ls.grade===g?gc[g]:"transparent", color: ls.grade===g?"#fff":T.faint }}>{g}</button>)}
                <button onClick={() => onSendNotification(item, ls.grade)} title="Notify patient"
                  style={{ padding: "3px 7px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: `0.5px solid ${T.info}`, background: "#eff6ff", color: T.info }}>📤</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel: Education ─────────────────────────────────────────────────────────

function EducationTab({ education, onSend, patientId, doctorId, doctorName }: {
  education: string[]; onSend: (topic: EducationTopic) => void;
  patientId: string; doctorId?: string; doctorName?: string;
}) {
  const [filter, setFilter] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic|null>(null);
  const categories = useMemo(() => ["All", ...new Set(EDUCATION_TOPICS.map(t => t.category))], []);
  const filtered = filter === "All" ? EDUCATION_TOPICS : EDUCATION_TOPICS.filter(t => t.category === filter);

  return (
    <div>
      <SectHeader label="Patient Education Library" color={T.info} sub={`${education.length} topics sent`} />
      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #bfdbfe" }}>
        <div style={{ fontSize: 11, color: T.info, fontWeight: 600 }}>Evidence-based education content</div>
        <div style={{ fontSize: 10, color: T.muted }}>Sending a topic delivers it to the patient's app education section and sends a push notification. Education records are logged in education_logs collection.</div>
      </div>
      {/* Category filter */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: "3px 9px", borderRadius: 6, border: `0.5px solid ${filter===c?T.info:T.border}`, background: filter===c?"#eff6ff":"transparent", color: filter===c?T.info:T.faint, fontSize: 10, fontWeight: filter===c?700:500, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
        ))}
      </div>
      {selectedTopic && (
        <div style={{ border: `1.5px solid ${T.info}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ background: "#eff6ff", padding: "10px 13px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📚</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: T.info, fontSize: 13 }}>{selectedTopic.title}</div><div style={{ fontSize: 10, color: "#93c5fd" }}>{selectedTopic.category} · {selectedTopic.duration}</div></div>
            <button onClick={() => setSelectedTopic(null)} style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontFamily: "inherit", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 10 }}>{selectedTopic.content}</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 6 }}>Key Points for Patient</div>
              {selectedTopic.keyPoints.map((kp, i) => <div key={i} style={{ fontSize: 12, color: T.text, marginBottom: 4, display: "flex", gap: 6, lineHeight: 1.5 }}><span style={{ color: T.info, flexShrink: 0 }}>•</span>{kp}</div>)}
            </div>
            <Btn label={education.includes(selectedTopic.id) ? "✓ Already Sent — Resend" : "📤 Send to Patient"} variant={education.includes(selectedTopic.id) ? "default" : "primary"} onClick={() => { onSend(selectedTopic); setSelectedTopic(null); }} fullWidth />
          </div>
        </div>
      )}
      {filtered.map(topic => {
        const sent = education.includes(topic.id);
        return (
          <div key={topic.id} onClick={() => setSelectedTopic(topic)} style={{ border: `0.5px solid ${sent?"#93c5fd":T.border}`, borderRadius: 10, marginBottom: 7, overflow: "hidden", cursor: "pointer", background: sent?"#f0f9ff":T.bg, transition: "all 0.15s" }}>
            <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📚</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic.title}</div>
                <div style={{ fontSize: 11, color: T.faint, marginTop: 1 }}>{topic.category} · {topic.duration} · {topic.keyPoints.length} key points</div>
              </div>
              {sent ? <Badge text="✓ Sent" color={T.info} bg="#eff6ff" border="#93c5fd" /> : <span style={{ color: T.faint, fontSize: 11 }}>View ›</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel: Labs & Imaging ────────────────────────────────────────────────────

function LabsTab({ labOrders, imagingOrders, onOrderLab, onOrderImaging, onUpdateResult }: {
  labOrders: LabOrder[]; imagingOrders: LabOrder[];
  onOrderLab: (n: string, urgency?: string) => void;
  onOrderImaging: (n: string, urgency?: string) => void;
  onUpdateResult: (name: string, result: string, type: "lab"|"imaging") => void;
}) {
  const [customLab, setCustomLab] = useState("");
  const [customImg, setCustomImg] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [editingResult, setEditingResult] = useState<{name: string; type: "lab"|"imaging"}|null>(null);
  const [resultText, setResultText] = useState("");

  function OrderRow({ name, orders, type, onOrder }: { name: string; orders: LabOrder[]; type: "lab"|"imaging"; onOrder: (n: string) => void }) {
    const ordered = orders.find(x => x.name === name);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: `0.5px solid ${T.border}` }}>
        <div style={{ flex: 1, fontSize: 12, color: ordered ? T.text : T.muted }}>{name}</div>
        {ordered ? (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {ordered.result
              ? <Badge text={ordered.result.length > 15 ? ordered.result.slice(0,15)+"…" : ordered.result} color={T.success} bg="#f0fdf4" border="#86efac" />
              : <Badge text={ordered.urgency === "urgent" ? "⚡ Urgent" : "Ordered"} color={T.warn} bg="#fffbeb" border="#fde68a" />}
            <button onClick={() => { setEditingResult({name, type}); setResultText(ordered.result ?? ""); }}
              style={{ background: "none", border: `0.5px solid ${T.border}`, borderRadius: 5, padding: "2px 6px", fontSize: 10, cursor: "pointer", color: T.muted, fontFamily: "inherit" }}>Result</button>
          </div>
        ) : <Btn label="Order" small onClick={() => onOrder(name)} />}
      </div>
    );
  }

  return (
    <div>
      <SectHeader label="Investigations — Labs & Imaging" color={T.purple} />
      {editingResult && (
        <div style={{ background: "#f5f3ff", borderRadius: 10, padding: 12, marginBottom: 12, border: "0.5px solid #ddd6fe" }}>
          <div style={{ fontWeight: 700, color: T.purple, fontSize: 12, marginBottom: 8 }}>Enter Result: {editingResult.name}</div>
          <InpField value={resultText} onChange={setResultText} placeholder="e.g. 4.2 mmol/L (Normal) or Pending" />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <Btn label="✓ Save Result" variant="success" onClick={() => { onUpdateResult(editingResult.name, resultText, editingResult.type); setEditingResult(null); }} />
            <Btn label="Cancel" onClick={() => setEditingResult(null)} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {URGENCIES.map(u => <button key={u} onClick={() => setUrgency(u)} style={{ padding: "3px 9px", borderRadius: 6, border: `0.5px solid ${urgency===u?T.danger:T.border}`, background: urgency===u?"#fef2f2":"transparent", color: urgency===u?T.danger:T.faint, fontSize: 10, fontWeight: urgency===u?700:500, cursor: "pointer", fontFamily: "inherit" }}>{u}</button>)}
        <span style={{ fontSize: 10, color: T.faint, alignSelf: "center" }}>urgency level for new orders</span>
      </div>
      <div className="htn-labs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>🔬 Laboratory</div>
          {LAB_PANEL.map(l => <OrderRow key={l} name={l} orders={labOrders} type="lab" onOrder={n => onOrderLab(n, urgency)} />)}
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            <input value={customLab} onChange={e => setCustomLab(e.target.value)} placeholder="Custom lab test…"
              style={{ flex: 1, background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "7px 9px", fontSize: 11, outline: "none", fontFamily: "inherit", color: T.text }} />
            <Btn label="+" variant="primary" small onClick={() => { if (customLab) { onOrderLab(customLab, urgency); setCustomLab(""); } }} />
          </div>
        </div>
        <div>
          <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>🩻 Imaging & Procedures</div>
          {IMAGING_PANEL.map(l => <OrderRow key={l} name={l} orders={imagingOrders} type="imaging" onOrder={n => onOrderImaging(n, urgency)} />)}
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            <input value={customImg} onChange={e => setCustomImg(e.target.value)} placeholder="Custom imaging…"
              style={{ flex: 1, background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "7px 9px", fontSize: 11, outline: "none", fontFamily: "inherit", color: T.text }} />
            <Btn label="+" variant="primary" small onClick={() => { if (customImg) { onOrderImaging(customImg, urgency); setCustomImg(""); } }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Panel: Clinical Notes (with edit + PDF) ──────────────────────────────────

function NotesTab({ notes, onSave, onEdit, patientName, doctorId, doctorName }: {
  notes: ClinicalNote[]; onSave: (n: ClinicalNote) => void; onEdit: (n: ClinicalNote) => void;
  patientName: string; doctorId?: string; doctorName?: string;
}) {
  const blank = (): ClinicalNote => ({
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    cc: "", hpi: "", exam: "", investigations: "", assessment: "", plan: "",
    diagnoses: [], followUps: [], isLocked: false,
    visitType: "follow_up", vitals: {},
    doctorId, doctorName: doctorName ?? "AMEXAN",
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ClinicalNote>(blank());
  const [editingNote, setEditingNote] = useState<ClinicalNote|null>(null);
  const [expandedId, setExpandedId] = useState<string|null>(notes[0]?.id ?? null);

  const FIELDS: { key: keyof ClinicalNote; label: string; ph: string }[] = [
    { key: "cc", label: "Chief Complaint (CC)", ph: "What brings the patient today?" },
    { key: "hpi", label: "History of Present Illness (HPI)", ph: "Duration, character, severity, aggravating/relieving factors, associated symptoms…" },
    { key: "exam", label: "Examination Findings", ph: "General, Cardiovascular, Respiratory, Abdomen, Neurological, Peripheral…" },
    { key: "investigations", label: "Investigations / Results", ph: "Recent labs, ECG findings, imaging results…" },
    { key: "assessment", label: "Assessment / Diagnosis", ph: "Primary and secondary diagnoses with ICD codes if possible…" },
    { key: "plan", label: "Management Plan", ph: "Medications, lifestyle advice, referrals, follow-up, patient education…" },
  ];

  const activeForm = editingNote ?? form;
  const setActiveForm = editingNote ? setEditingNote as (n: ClinicalNote) => void : setForm;

  return (
    <div>
      <SectHeader label="Clinical Notes — SOAP Format" color={T.muted} />
      {[...notes].reverse().map((n) => (
        <div key={n.id ?? n.date} style={{ border: `0.5px solid ${T.border}`, borderRadius: 12, marginBottom: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div role="button" tabIndex={0} onClick={() => setExpandedId(expandedId === n.id ? null : n.id ?? n.date)}
            onKeyDown={e => e.key === "Enter" && setExpandedId(expandedId === n.id ? null : n.id ?? n.date)}
            style={{ width: "100%", padding: "10px 13px", display: "flex", alignItems: "center", gap: 8, background: T.bg, cursor: "pointer", userSelect: "none" }}>
            <span style={{ fontSize: 16 }}>📋</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{n.date} — {n.assessment || "Clinical Note"}</div>
              <div style={{ color: T.faint, fontSize: 11 }}>{n.doctorName ?? "AMEXAN"} · {n.visitType ?? "Follow-up"}{n.isLocked ? " 🔒" : " 🔓"}</div>
            </div>
            <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
              {!n.isLocked && <Btn label="✏️ Edit" small variant="info" onClick={() => { setEditingNote({ ...n }); setShowForm(true); }} />}
              <Btn label="📄 PDF" small onClick={() => exportNoteAsPDF(n, patientName)} />
              <Badge text={n.isLocked ? "Locked" : "Draft"} color={n.isLocked ? T.muted : T.warn} bg={n.isLocked ? T.bg : "#fffbeb"} border={n.isLocked ? T.border : "#fde68a"} />
            </div>
            <span style={{ color: T.faint, fontSize: 11 }}>{expandedId === (n.id ?? n.date) ? "▲" : "▼"}</span>
          </div>
          {expandedId === (n.id ?? n.date) && (
            <div className="htn-note-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 14px" }}>
              {FIELDS.filter(f => n[f.key]).map(f => (
                <div key={f.key} style={{ gridColumn: f.key === "plan" || f.key === "hpi" ? "1 / -1" : undefined }}>
                  <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n[f.key] as string}</div>
                </div>
              ))}
              {n.vitals && Object.keys(n.vitals).length > 0 && (
                <div>
                  <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Vitals</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{Object.entries(n.vitals).map(([k,v]) => `${k}: ${v}`).join(" · ")}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {(showForm) && (
        <div style={{ border: `1.5px solid ${T.info}`, borderRadius: 12, padding: 13, background: "#eff6ff", marginTop: 8 }}>
          <div style={{ color: T.info, fontWeight: 700, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            📋 {editingNote ? "Edit Clinical Note" : "New SOAP Note"} — {activeForm?.date}
            <Btn label="Cancel" small onClick={() => { setShowForm(false); setEditingNote(null); setForm(blank()); }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <SelField label="Visit Type" value={activeForm?.visitType ?? "follow_up"} onChange={v => setActiveForm({ ...activeForm!, visitType: v })} options={VISIT_TYPES} />
          </div>
          {/* Vitals row */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, marginBottom: 6 }}>VITALS</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["BP","HR","Temp","SpO₂","RR","Weight (kg)","Height (cm)"].map(v => (
                <input key={v} placeholder={v} value={(activeForm?.vitals?.[v]) ?? ""}
                  onChange={e => setActiveForm({ ...activeForm!, vitals: { ...(activeForm?.vitals ?? {}), [v]: e.target.value } })}
                  style={{ flex: "1 1 80px", maxWidth: 100, background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "6px 9px", fontSize: 11, outline: "none", fontFamily: "inherit", color: T.text }} />
              ))}
            </div>
          </div>
          <div className="htn-note-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {FIELDS.map(f => (
              <div key={f.key} style={{ gridColumn: f.key === "plan" || f.key === "hpi" ? "1 / -1" : undefined }}>
                <TextArea label={f.label} value={(activeForm?.[f.key] as string) ?? ""} onChange={v => setActiveForm({ ...activeForm!, [f.key]: v })} placeholder={f.ph} rows={4} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Btn label="✓ Save Note" variant="success" onClick={() => {
              if (editingNote) { onEdit({ ...activeForm!, isLocked: false, lastEditedAt: new Date().toLocaleDateString() }); }
              else { onSave({ ...form, id: "n"+Date.now() }); }
              setShowForm(false); setEditingNote(null); setForm(blank());
            }} />
            <Btn label="🔒 Save & Lock" variant="info" onClick={() => {
              if (editingNote) { onEdit({ ...activeForm!, isLocked: true }); }
              else { onSave({ ...form, id: "n"+Date.now(), isLocked: true }); }
              setShowForm(false); setEditingNote(null); setForm(blank());
            }} />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingNote(null); setForm(blank()); }} />
          </div>
        </div>
      )}
      {!showForm && <Btn label="📋 Write New SOAP Note" variant="primary" fullWidth onClick={() => { setEditingNote(null); setForm(blank()); setShowForm(true); }} />}
    </div>
  );
}

// ─── Panel: Timeline ─────────────────────────────────────────────────────────

function TimelineTab({ events }: { events: TimelineEvent[] }) {
  const tc: Record<TimelineEvent["type"], string> = { visit: T.info, med: T.purple, alert: T.warn, reading: T.success, note: T.muted, lab: "#7c3aed" };
  return (
    <div>
      <SectHeader label="Clinical Event Timeline" color={T.info} sub={`${events.length} events`} />
      {events.length === 0 && <div style={{ color: T.faint, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No events recorded yet.</div>}
      <div style={{ position: "relative", paddingLeft: 22 }}>
        <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 1.5, background: T.border }} />
        {[...events].reverse().map(e => (
          <div key={e.id} style={{ position: "relative", marginBottom: 12, paddingLeft: 10 }}>
            <div style={{ position: "absolute", left: -14, top: 4, width: 10, height: 10, borderRadius: "50%", background: tc[e.type], border: `2px solid ${T.card}`, boxShadow: `0 0 0 1px ${tc[e.type]}40` }} />
            <div style={{ fontSize: 10, color: T.faint, marginBottom: 1 }}>{e.date}</div>
            <div style={{ fontWeight: 600, fontSize: 12, color: T.text }}>{e.icon} {e.title}</div>
            {e.detail && <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{e.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Panel: Messaging ────────────────────────────────────────────────────────

function MessagingTab({
  messages,
  onSend,
  threadId,
  loadingMessages,
  patientName,
  patientAvatar,
  onOpenMessaging
}: {
  messages: Message[];
  onSend: (text: string) => void;
  threadId: string;
  loadingMessages?: boolean;
  patientName?: string;
  patientAvatar?: string;
  onOpenMessaging?: () => void;
}) {
  const lastMessage = messages[messages.length - 1];

  const unreadCount = messages.filter(
    m => !m.read && (m.from !== "doctor" && m.senderRole !== "doctor")
  ).length;

  const lastTime = lastMessage
    ? lastMessage.time ||
      (lastMessage.timestamp
        ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "")
    : "";

  const initials = (patientName ?? "P")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={() => onOpenMessaging?.()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        border: `0.5px solid ${T.border}`,
        background: T.bg,
        cursor: "pointer",
        transition: "background 0.15s",
        userSelect: "none"
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
      onMouseLeave={e => (e.currentTarget.style.background = T.bg)}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {patientAvatar ? (
          <img
            src={patientAvatar}
            alt={patientName}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              objectFit: "cover",
              border: `1.5px solid ${T.border}`
            }}
          />
        ) : (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: 0.5,
              flexShrink: 0
            }}
          >
            {initials}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#22c55e",
            border: "2px solid #fff"
          }}
        />
      </div>

      {/* Text body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: T.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {patientName ?? "Patient"}
          </span>

          <span
            style={{
              fontSize: 10,
              color: unreadCount > 0 ? T.info : T.faint,
              whiteSpace: "nowrap",
              marginLeft: 8,
              flexShrink: 0
            }}
          >
            {lastTime}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span
            style={{
              fontSize: 12,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "85%",
              fontWeight: unreadCount > 0 ? 600 : 400,
              color: unreadCount > 0 ? T.text : T.faint
            }}
          >
            {loadingMessages
              ? "Loading…"
              : lastMessage
              ? `${lastMessage.senderRole === "doctor" ||
                lastMessage.from === "doctor"
                  ? "You: "
                  : ""}${lastMessage.text}`
              : "No messages yet — tap to start"}
          </span>

          {unreadCount > 0 && (
            <div
              style={{
                background: T.info,
                color: "#fff",
                borderRadius: "50%",
                minWidth: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                padding: "0 4px",
                flexShrink: 0
              }}
            >
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Chevron */}
      <div style={{ color: T.faint, fontSize: 16, flexShrink: 0 }}>
        ›
      </div>
    </div>
  );
}

// ─── Panel: Referrals ────────────────────────────────────────────────────────

// ─── Referral type (match your DB schema) ───────────────────────────────────
// ─── Referral type matching your Firestore schema exactly ───────────────────
interface Referral {
  id?: string;
  status: "pending" | "scheduled" | "completed" | "cancelled" | "accepted" | string;
  urgency: "routine" | "urgent" | "emergency" | string;
  type: "internal" | "external" | string;
  reason?: string;
  specialty?: string;
  receivingDoctorName?: string;
  receivingDoctorSpecialty?: string;
  receivingFacility?: string;
  referringDoctorName?: string;
  referringFacility?: string;
  patientId?: string;
  patientName?: string;
  noteId?: string;
  consentGiven?: boolean;
  createdAt?: { seconds: number } | Date | null;
  scheduledAt?: { seconds: number } | Date | null;
  acceptedAt?: { seconds: number } | Date | null;
  clinicalSummary?: {
    chiefComplaint?: string;
    diagnoses?: string[];
    doctorName?: string;
    doctorSpecialty?: string;
  };
}

// ─── Status pill colours ─────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#fef9c3", text: "#854d0e" },
  scheduled: { bg: "#dbeafe", text: "#1e40af" },
  accepted:  { bg: "#dcfce7", text: "#166534" },
  completed: { bg: "#f0fdf4", text: "#15803d" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

function statusPill(status: string) {
  const s = STATUS_COLORS[status] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 7px",
        textTransform: "capitalize",
        flexShrink: 0,
      }}
    >
      {status}
    </span>
  );
}

// ─── ReferralsPreview ────────────────────────────────────────────────────────
function ReferralsPreview({
  referrals = [],
  onOpenReferrals,
}: {
  referrals: Referral[];
  onOpenReferrals: () => void;
}) {
  // counts from your actual status values
  const pendingCount   = referrals.filter((r) => r.status === "pending").length;
  const scheduledCount = referrals.filter((r) => r.status === "scheduled").length;
  const urgentCount    = referrals.filter((r) => r.urgency === "urgent" || r.urgency === "emergency").length;

  // most recent referral (Firestore timestamps have .seconds)
  const sorted = [...referrals].sort((a, b) => {
    const ta = a.createdAt && "seconds" in (a.createdAt as object)
      ? (a.createdAt as { seconds: number }).seconds : 0;
    const tb = b.createdAt && "seconds" in (b.createdAt as object)
      ? (b.createdAt as { seconds: number }).seconds : 0;
    return tb - ta;
  });
  const latest = sorted[0];

  const subtitle =
    referrals.length === 0
      ? "No referrals yet — tap to create"
      : [
          `${referrals.length} referral${referrals.length > 1 ? "s" : ""}`,
          scheduledCount > 0 && `${scheduledCount} scheduled`,
          pendingCount > 0   && `${pendingCount} pending`,
          latest?.receivingDoctorName && `→ Dr. ${latest.receivingDoctorName}`,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenReferrals}
      onKeyDown={(e) => e.key === "Enter" && onOpenReferrals()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        border: `0.5px solid ${T.border}`,
        background: T.bg,
        cursor: "pointer",
        transition: "background 0.15s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = T.bg)}
    >
      {/* icon */}
      <div style={{ fontSize: 26, flexShrink: 0 }}>🏥</div>

      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>
          Referrals
        </div>
        <div
          style={{
            fontSize: 11,
            color: T.faint,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </div>
        {/* show specialty of latest referral if present */}
        {latest?.specialty && (
          <div style={{ fontSize: 10, color: T.faint, marginTop: 1 }}>
            {latest.referringFacility ?? "—"} → {latest.specialty}
          </div>
        )}
      </div>

      {/* right-side badges */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        {latest && statusPill(latest.status)}
        {urgentCount > 0 && (
          <span style={{
            background: "#fee2e2", color: "#991b1b",
            borderRadius: 999, fontSize: 10, fontWeight: 700,
            padding: "2px 6px",
          }}>
            ⚡ {urgentCount} urgent
          </span>
        )}
      </div>

      <div style={{ color: T.faint, fontSize: 16, flexShrink: 0, marginLeft: 4 }}>›</div>
    </div>
  );
}

// ─── Patient Picker ───────────────────────────────────────────────────────────

const PatientPicker = memo(function PatientPicker({ patients, selectedId, onSelect, loading }: {
  patients: PatientSummary[]; selectedId: string | null; onSelect: (id: string) => void; loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() =>
    patients.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.universalId ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(search.toLowerCase())
    ), [patients, search]);

  if (loading) return <Skeleton height={160} />;
  if (!patients.length) return (
    <Card>
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🩺</div>
        <div style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>No HTN Patients Found</div>
        <div style={{ color: T.faint, fontSize: 11, marginTop: 5 }}>Patients appear here once they log a BP reading via the AMEXAN patient app.</div>
      </div>
    </Card>
  );
  return (
    <Card style={{ padding: "14px 14px" }}>
      <SectHeader label={`HTN Patients (${patients.length})`} color={T.info} />
      <input type="search" placeholder="Search by name, ID or email…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", marginBottom: 10, fontFamily: "inherit" }} />
      <div className="htn-scroll" style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 420, overflowY: "auto" }}>
        {filtered.map(p => {
          const active = selectedId === p.id;
          const cls = p.latestSystolic && p.latestDiastolic ? bpClass(p.latestSystolic, p.latestDiastolic) : null;
          return (
            <button key={p.id} onClick={() => onSelect(p.id)} className="htn-patient-btn"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                border: active ? `1.5px solid rgba(220,38,38,0.4)` : `0.5px solid ${T.border}`,
                background: active ? "rgba(220,38,38,0.04)" : T.bg, fontFamily: "inherit", width: "100%", transition: "all 0.15s" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: active ? "rgba(220,38,38,0.12)" : T.bg, border: `0.5px solid ${active ? "rgba(220,38,38,0.3)" : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: active ? T.danger : T.muted, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: active ? T.danger : T.text, fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ color: T.faint, fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.universalId ?? p.id.slice(0, 10)}{p.latestAt && ` · ${p.latestAt.toLocaleDateString()}`}
                </div>
              </div>
              {cls && p.latestSystolic && p.latestDiastolic && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: cls.color, fontWeight: 700, fontSize: 12 }}>{p.latestSystolic}/{p.latestDiastolic}</div>
                  <div style={{ padding: "1px 5px", borderRadius: 4, background: cls.bg, color: cls.color, fontSize: 9, fontWeight: 700, display: "inline-block", marginTop: 1 }}>{cls.label}</div>
                </div>
              )}
              <div style={{ color: T.faint, fontSize: 10, flexShrink: 0, textAlign: "right" }}>{p.totalReadings}<br /><span style={{ fontSize: 9 }}>readings</span></div>
            </button>
          );
        })}
        {!filtered.length && <div style={{ color: T.faint, fontSize: 13, padding: "12px 0", textAlign: "center" }}>No patients match "{search}"</div>}
      </div>
    </Card>
  );
});

// ─── Tabs Definition ──────────────────────────────────────────────────────────

type TabId = "bp"|"readings"|"medications"|"adherence"|"alerts"|"complications"|"lifestyle"|"education"|"labs"|"notes"|"timeline"|"messaging"|"referrals";
const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "bp",            icon: "📈", label: "BP Trend"   },
  { id: "readings",      icon: "🗃️",  label: "Readings"   },
  { id: "medications",   icon: "💊", label: "Medications"},
  { id: "adherence",     icon: "📅", label: "Adherence"  },
  { id: "alerts",        icon: "🔔", label: "Alerts"     },
  { id: "complications", icon: "⚕️", label: "Complic."   },
  { id: "lifestyle",     icon: "🏃", label: "Lifestyle"  },
  { id: "education",     icon: "📚", label: "Education"  },
  { id: "labs",          icon: "🔬", label: "Labs"       },
  { id: "notes",         icon: "📋", label: "Notes"      },
  { id: "timeline",      icon: "🕐", label: "Timeline"   },
  { id: "messaging",     icon: "💬", label: "Messaging"  },
  { id: "referrals",     icon: "📤", label: "Referrals"  },
];

// ─── Patient Panel (full clinical hub) ───────────────────────────────────────

function PatientPanel({ patientId, patientName, doctorId, doctorName, onOpenReferrals,onOpenConversation }: {
  patientId: string; patientName: string; doctorId?: string; 
  doctorName?: string; onOpenConversation?: (threadId: string) => void;
    onOpenReferrals?: (patientId: string, patientName: string) => void;
}) {
  const [tab, setTab] = useState<TabId>("bp");
  const tabsRef = useRef<HTMLDivElement>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [readings,       setReadings]       = useState<BPReading[]>([]);
  const [medications,    setMedications]    = useState<Medication[]>([]);
  const [adherence,      setAdherence]      = useState<AdherenceMap>({});
  const [adherenceNotes, setAdherenceNotes] = useState<Record<string, string>>({});
  const [alerts,         setAlerts]         = useState<Alert[]>([]);
  const [complications,  setComplications]  = useState<Complication[]>([]);
  const [lifestyle,      setLifestyle]      = useState<LifestyleItem[]>([]);
  const [education,      setEducation]      = useState<string[]>([]);
  const [labOrders,      setLabOrders]      = useState<LabOrder[]>([]);
  const [imagingOrders,  setImagingOrders]  = useState<LabOrder[]>([]);
  const [clinicalNotes,  setClinicalNotes]  = useState<ClinicalNote[]>([]);
  const [timeline,       setTimeline]       = useState<TimelineEvent[]>([]);
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [referrals,      setReferrals]      = useState<Record<string, unknown>[]>([]);
  const [patientProfile, setPatientProfile] = useState<Record<string, unknown>>({});
  const [loadingR,       setLoadingR]       = useState(true);
  const [loadingM,       setLoadingM]       = useState(true);
  const [loadingMsg,     setLoadingMsg]     = useState(true);

  // Thread ID for messaging (matches clinicalmessenger.tsx pattern)
  const threadId = useMemo(() => {
    if (!doctorId || !patientId) return "";
    return [doctorId, patientId].sort().join("_");
  }, [doctorId, patientId]);

  // ── Real-time: BP Readings ─────────────────────────────────────────────────
  useEffect(() => {
    setLoadingR(true);
    const q = query(
      collection(db, "toolReadings"),
      where("patientId", "==", patientId),
      where("toolType", "==", "bp_monitor"),
      orderBy("recordedAt", "asc")
    );
    return onSnapshot(q, snap => {
      const parsed = snap.docs
        .map(d => extractBP({ id: d.id, ...d.data() } as RawReading & Record<string, unknown>))
        .filter(Boolean) as BPReading[];
      setReadings(parsed);
      setLoadingR(false);
    }, () => setLoadingR(false));
  }, [patientId]);

  // ── Real-time: Prescriptions (matches actual DB schema) ───────────────────
  useEffect(() => {
    setLoadingM(true);
    const q = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId),
      orderBy("startDate", "asc")
    );
    return onSnapshot(q, snap => {
      const meds: Medication[] = snap.docs.map(d => normalizeMed(d.data(), d.id));
      setMedications(meds);
      // Seed adherence calendar for active meds (last 14 days)
      setAdherence(prev => {
        const next = { ...prev };
        meds.filter(m => m.status === "active" && !next[m.id]).forEach(m => {
          const days: Record<string, boolean> = {};
          for (let i = 13; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            days[d.toISOString().split("T")[0]] = false;
          }
          next[m.id] = days;
        });
        return next;
      });
      setLoadingM(false);
    }, () => setLoadingM(false));
  }, [patientId]);

  // ── Real-time: Messages (uses threadId like clinicalmessenger.tsx) ─────────
  useEffect(() => {
    if (!threadId) return;
    setLoadingMsg(true);
    const q = query(
      collection(db, "messages"),
      where("threadId", "==", threadId),
      orderBy("timestamp", "asc"),
      limit(100)
    );
    return onSnapshot(q, snap => {
      const msgs: Message[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          from: (data.senderRole === "doctor" || data.from === "doctor") ? "doctor" : "patient",
          senderId: data.senderId, senderName: data.senderName, senderRole: data.senderRole,
          time: data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : String(data.time ?? ""),
          text: data.text ?? "", read: data.read ?? false, status: data.status,
          threadId: data.threadId,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : undefined,
        } as Message;
      });
      setMessages(msgs);
      setLoadingMsg(false);
    }, () => setLoadingMsg(false));
  }, [threadId]);

  // ── Real-time: Clinical Alerts ─────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "clinicalAlerts"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, snap => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert)));
    }, () => {});
  }, [patientId]);

  // ── Real-time: Clinical Notes ──────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "clinicalNotes"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, snap => {
      setClinicalNotes(snap.docs.map(d => {
        const data = d.data();
        // Map clinicalNotes DB schema (chiefComplaint, hpi, plan, etc.)
        return {
          id: d.id,
          date: data.visitDate instanceof Timestamp
            ? data.visitDate.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : String(data.date ?? new Date().toLocaleDateString()),
          cc: data.chiefComplaint ?? data.cc ?? "",
          hpi: data.hpi ?? "",
          exam: data.examination?.general ?? data.exam ?? "",
          investigations: data.investigations ?? "",
          assessment: data.diagnoses?.[0] ?? data.assessment ?? "",
          plan: data.plan ?? "",
          diagnoses: data.diagnoses ?? [],
          followUps: data.followUps ?? [],
          isLocked: data.isLocked ?? false,
          lastEditedAt: data.lastEditedAt instanceof Timestamp ? data.lastEditedAt.toDate().toLocaleDateString() : String(data.lastEditedAt ?? ""),
          doctorId: data.doctorId ?? "",
          doctorName: data.doctorName ?? "AMEXAN",
          visitType: data.visitType ?? "follow_up",
          vitals: data.vitals ?? {},
        } as ClinicalNote;
      }));
    }, () => {});
  }, [patientId]);

  // ── Real-time: Referrals ───────────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "referrals"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, snap => {
      setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, [patientId]);

  // ── One-time fetches ───────────────────────────────────────────────────────
  useEffect(() => {
    // Lab orders (from labOrders collection — matching patientsordercenter.tsx schema)
    getDocs(query(collection(db, "labOrders"), where("patientId", "==", patientId), orderBy("orderedAt", "desc"), limit(100)))
      .then(snap => {
        const labs: LabOrder[] = [], imgs: LabOrder[] = [];
        snap.docs.forEach(d => {
          const r = d.data();
          const item: LabOrder = {
            name: r.name ?? r.study ?? r.test ?? "Unknown",
            result: r.result, orderedAt: r.orderedAt instanceof Timestamp ? r.orderedAt.toDate().toLocaleDateString() : String(r.orderedAt ?? ""),
            type: r.type ?? "lab", status: r.status ?? "ordered",
            study: r.study, modality: r.modality, bodyPart: r.bodyPart, urgency: r.urgency,
          };
          // Imaging: has modality or type === "imaging"
          if (r.type === "imaging" || r.modality) imgs.push(item);
          else labs.push(item);
        });
        setLabOrders(labs);
        setImagingOrders(imgs);
      }).catch(() => {});

    // Adherence logs
    getDocs(query(collection(db, "adherenceLogs"), where("patientId", "==", patientId), limit(500)))
      .then(snap => {
        const map: AdherenceMap = {};
        snap.docs.forEach(d => {
          const r = d.data();
          if (!map[r.medicationId]) map[r.medicationId] = {};
          map[r.medicationId][r.date] = r.taken ?? false;
        });
        setAdherence(prev => {
          const m = { ...prev };
          Object.entries(map).forEach(([id, dates]) => { m[id] = { ...(m[id] ?? {}), ...dates }; });
          return m;
        });
      }).catch(() => {});

    // Timeline events
    getDocs(query(collection(db, "timeline_events"), where("patientId", "==", patientId), orderBy("date", "asc"), limit(200)))
      .then(snap => setTimeline(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent))))
      .catch(() => {});

    // Patient profile (complications, lifestyle, education, etc.)
    getDoc(doc(db, "patientProfiles", patientId)).then(d => {
      if (!d.exists()) return;
      const r = d.data() as Record<string, unknown>;
      setPatientProfile(r);
      if (r.complications) setComplications(r.complications as Complication[]);
      if (r.lifestyle) setLifestyle(r.lifestyle as LifestyleItem[]);
      if (r.education) setEducation(r.education as string[]);
    }).catch(() => {});

    // Education logs (what topics have been sent)
    getDocs(query(collection(db, "education_logs"), where("patientId", "==", patientId), limit(100)))
      .then(snap => {
        const sentIds = snap.docs.map(d => String(d.data().topicId ?? d.data().topic ?? "")).filter(Boolean);
        if (sentIds.length > 0) setEducation(prev => [...new Set([...prev, ...sentIds])]);
      }).catch(() => {});
  }, [patientId]);

  // ── Timeline helper ────────────────────────────────────────────────────────
 const addTimeline = useCallback((type: TimelineEvent["type"], icon: string, title: string, detail?: string) => {
  const ev: TimelineEvent = {
    id: "t" + Date.now(),
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    type,
    icon,
    title,
    ...(detail !== undefined && { detail }),  // only include detail if provided
  };
  setTimeline(p => [...p, ev]);
  addDoc(collection(db, "timeline_events"), {
    ...ev,
    patientId,
    createdAt: serverTimestamp(),
  }).catch(() => {});
}, [patientId]);

  // ── Patient profile write ──────────────────────────────────────────────────
  const profileUpdate = useCallback((field: string, value: unknown) => {
    setDoc(doc(db, "patientProfiles", patientId), { [field]: value }, { merge: true }).catch(() => {});
  }, [patientId]);

  // ── Medication handlers ────────────────────────────────────────────────────
  const handleMedUpdate = useCallback((med: Medication, changeType: DoseChange["changeType"], oldDose: string) => {
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const changeEntry: DoseChange = {
      date: today, changeType, previousDose: `${oldDose}${med.unit}`, newDose: `${med.dose}${med.unit}`,
      changedBy: doctorName ?? "Doctor", reason: med.notes,
    };
    const updatedHistory = [...(med.changeHistory ?? []), changeEntry];
    const updated = { ...med, changeHistory: updatedHistory };
    setMedications(p => p.map(m => m.id === med.id ? updated : m));

    // Write to Firestore using actual DB field names
    updateDoc(doc(db, "prescriptions", med.id), {
      dosage: `${med.dose}${med.unit}`,
      frequency: med.frequency,
      instructions: med.instructions ?? "",
      warnings: med.warnings ?? "",
      indication: med.indication ?? "",
      route: med.route ?? "Oral",
      changeHistory: updatedHistory,
      updatedAt: serverTimestamp(),
    }).catch(() => {});

    addTimeline("med", changeType === "dose_increase" ? "⬆️" : changeType === "dose_decrease" ? "⬇️" : "✏️",
      `${med.drug} ${changeType.replace("_", " ")} → ${med.dose}${med.unit}`, med.notes);
  }, [doctorName, addTimeline]);

  const handleMedStop = useCallback((id: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const changeEntry: DoseChange = { date: today, changeType: "stopped", changedBy: doctorName ?? "Doctor", previousDose: `${med.dose}${med.unit}` };
    const updatedHistory = [...(med.changeHistory ?? []), changeEntry];
    setMedications(p => p.map(m => m.id === id ? { ...m, status: "stopped" as const, endDate: today, changeHistory: updatedHistory } : m));
    updateDoc(doc(db, "prescriptions", id), { active: false, endDate: serverTimestamp(), changeHistory: updatedHistory, updatedAt: serverTimestamp() }).catch(() => {});
    addTimeline("med", "🛑", `${med.drug} stopped`);
  }, [medications, doctorName, addTimeline]);

  const handleMedPause = useCallback((id: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const changeEntry: DoseChange = { date: today, changeType: "paused", changedBy: doctorName ?? "Doctor" };
    const updatedHistory = [...(med.changeHistory ?? []), changeEntry];
    setMedications(p => p.map(m => m.id === id ? { ...m, status: "paused" as const, changeHistory: updatedHistory } : m));
    updateDoc(doc(db, "prescriptions", id), { active: false, status: "paused", changeHistory: updatedHistory, updatedAt: serverTimestamp() }).catch(() => {});
    addTimeline("med", "⏸️", `${med.drug} paused`);
  }, [medications, doctorName, addTimeline]);

  const handleMedRestart = useCallback((id: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const changeEntry: DoseChange = { date: today, changeType: "restarted", changedBy: doctorName ?? "Doctor" };
    const updatedHistory = [...(med.changeHistory ?? []), changeEntry];
    setMedications(p => p.map(m => m.id === id ? { ...m, status: "active" as const, endDate: undefined, changeHistory: updatedHistory } : m));
    updateDoc(doc(db, "prescriptions", id), { active: true, status: "active", endDate: null, changeHistory: updatedHistory, updatedAt: serverTimestamp() }).catch(() => {});
    addTimeline("med", "▶️", `${med.drug} restarted`);
  }, [medications, doctorName, addTimeline]);

  const handleMedAdd = useCallback((med: Medication) => {
    const pharma = getDrugInfo(med.drug);
    // Write using actual prescriptions DB schema
    const dbPayload = {
      patientId, medication: med.drug, dosage: `${med.dose}${med.unit}`, frequency: med.frequency,
      indication: med.indication ?? "Hypertension", route: med.route ?? "Oral",
      instructions: med.instructions ?? pharma?.patientInstructions ?? "",
      warnings: med.warnings ?? pharma?.warnings.join("; ") ?? "",
      duration: med.duration ?? "30", refills: med.refills ?? 30,
      active: true, status: "active", toolType: "bp_monitor",
      doctorId: doctorId ?? "unknown", doctorName: doctorName ?? "Doctor",
      startDate: serverTimestamp(), createdAt: serverTimestamp(),
      changeHistory: [{ date: new Date().toLocaleDateString("en-GB"), changeType: "started", newDose: `${med.dose}${med.unit}`, changedBy: doctorName ?? "Doctor" }],
    };
    setMedications(p => [...p, med]);
    addDoc(collection(db, "prescriptions"), dbPayload)
      .then(ref => setMedications(p => p.map(m => m.id === med.id ? { ...m, id: ref.id } : m)))
      .catch(() => {});

    // Send notification to patient automatically
    const notifText = `💊 NEW PRESCRIPTION\n\n${med.drug} ${med.dose}${med.unit} — ${med.frequency}\n\n📋 Instructions: ${med.instructions || pharma?.patientInstructions || "Take as directed."}\n\n⚠️ Warnings: ${med.warnings || pharma?.warnings.slice(0,3).join("; ") || "None specific."}\n\n🔬 Monitoring: ${pharma?.monitoring.join(", ") || "As advised by doctor."}\n\nPrescribed by: ${doctorName ?? "Your Doctor"}`;
    addDoc(collection(db, "patientNotifications"), {
      patientId, type: "prescription", title: `New prescription: ${med.drug} ${med.dose}${med.unit}`,
      body: notifText, read: false, priority: "high",
      senderId: doctorId, senderName: doctorName ?? "Doctor", createdAt: serverTimestamp(),
    }).catch(() => {});

    addTimeline("med", "💊", `${med.drug} ${med.dose}${med.unit} started`, `${med.frequency} · ${med.drugClass}`);
  }, [patientId, doctorId, doctorName, addTimeline]);

  // ── Adherence ──────────────────────────────────────────────────────────────
  const handleAdherenceToggle = useCallback((medId: string, date: string) => {
    setAdherence(prev => {
      const newVal = !prev[medId]?.[date];
      const next = { ...prev, [medId]: { ...prev[medId], [date]: newVal } };
      addDoc(collection(db, "adherenceLogs"), { patientId, medicationId: medId, date, taken: newVal, createdAt: serverTimestamp() }).catch(() => {});
      return next;
    });
  }, [patientId]);

  // ── Complications / Lifestyle / Education ─────────────────────────────────
  const handleToggleComplication = useCallback((name: string) => {
    setComplications(prev => {
      const next = prev.find(x => x.name === name)
        ? prev.filter(x => x.name !== name)
        : [...prev, { name, date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }];
      profileUpdate("complications", next);
      return next;
    });
    addTimeline("visit", "⚕️", `Complication: ${name}`);
  }, [profileUpdate, addTimeline]);

  const handleToggleLifestyle = useCallback((name: string) => {
    setLifestyle(prev => {
      const next = prev.find(x => x.name === name) ? prev.filter(x => x.name !== name) : [...prev, { name, grade: "Good" as const }];
      profileUpdate("lifestyle", next);
      return next;
    });
  }, [profileUpdate]);

  const handleGradeLifestyle = useCallback((name: string, grade: LifestyleItem["grade"]) => {
    setLifestyle(prev => {
      const next = prev.map(x => x.name === name ? { ...x, grade } : x);
      profileUpdate("lifestyle", next);
      return next;
    });
  }, [profileUpdate]);

  const handleLifestyleNotification = useCallback(async (item: string, grade: LifestyleItem["grade"]) => {
    const gradeMsg: Record<LifestyleItem["grade"], string> = {
      Good: "Great progress! Keep it up.",
      Moderate: "Good effort — there is still room to improve.",
      Poor: "This area needs attention. Let's work on it together.",
    };
    try {
      await addDoc(collection(db, "patientNotifications"), {
        patientId, type: "lifestyle", title: `Lifestyle Update: ${item}`,
        body: `🏃 Your doctor has reviewed your lifestyle:\n\n📌 ${item}\n📊 Assessment: ${grade} — ${gradeMsg[grade]}\n\nKeep working towards a healthier lifestyle. Every improvement counts for your blood pressure control! — ${doctorName ?? "Your Doctor"}`,
        read: false, priority: "normal", senderId: doctorId, senderName: doctorName ?? "Doctor", createdAt: serverTimestamp(),
      });
      alert(`✓ Lifestyle notification sent to patient`);
    } catch { alert("Failed to send notification."); }
  }, [patientId, doctorId, doctorName]);

  const handleSendEducation = useCallback(async (topic: EducationTopic) => {
    try {
      // Save to education_logs collection (patient app reads this)
      await addDoc(collection(db, "education_logs"), {
        patientId, topicId: topic.id, topic: topic.id, title: topic.title,
        content: topic.content, keyPoints: topic.keyPoints, category: topic.category,
        sentBy: doctorId, sentByName: doctorName ?? "Doctor", sentAt: serverTimestamp(), read: false,
      });
      // Send push notification
      await addDoc(collection(db, "patientNotifications"), {
        patientId, type: "education", title: `📚 New Education: ${topic.title}`,
        body: `Your doctor has shared an education resource with you.\n\n📖 ${topic.title}\n⏱ ${topic.duration}\n\nOpen your AMEXAN app to read the full content and key points.\n\n— ${doctorName ?? "Your Doctor"}`,
        topicId: topic.id, read: false, priority: "normal",
        senderId: doctorId, senderName: doctorName ?? "Doctor", createdAt: serverTimestamp(),
      });
      setEducation(prev => [...new Set([...prev, topic.id])]);
      addTimeline("visit", "📚", `Education sent: ${topic.title}`);
      alert(`✓ "${topic.title}" sent to patient`);
    } catch { alert("Failed to send education."); }
  }, [patientId, doctorId, doctorName, addTimeline]);

  // ── Labs ───────────────────────────────────────────────────────────────────
  const handleOrderLab = useCallback((name: string, urgency = "routine") => {
    const item: LabOrder = { name, type: "lab", urgency, status: "ordered", orderedAt: new Date().toLocaleDateString() };
    setLabOrders(p => [...p, item]);
    addDoc(collection(db, "labOrders"), {
      patientId, name, type: "lab", urgency, status: "ordered",
      orderedBy: doctorId, orderedByName: doctorName ?? "Doctor",
      orderedAt: serverTimestamp(), createdAt: serverTimestamp(),
    }).catch(() => {});
    addTimeline("lab", "🔬", `Lab ordered: ${name}`, urgency);
  }, [patientId, doctorId, doctorName, addTimeline]);

  const handleOrderImaging = useCallback((name: string, urgency = "routine") => {
    const item: LabOrder = { name, type: "imaging", urgency, status: "ordered", orderedAt: new Date().toLocaleDateString() };
    setImagingOrders(p => [...p, item]);
    addDoc(collection(db, "labOrders"), {
      patientId, name, study: name, type: "imaging", urgency, status: "ordered",
      orderedBy: doctorId, orderedByName: doctorName ?? "Doctor",
      orderedAt: serverTimestamp(), createdAt: serverTimestamp(),
    }).catch(() => {});
    addTimeline("lab", "🩻", `Imaging ordered: ${name}`, urgency);
  }, [patientId, doctorId, doctorName, addTimeline]);

  const handleUpdateResult = useCallback(async (name: string, result: string, type: "lab"|"imaging") => {
    if (type === "lab") setLabOrders(p => p.map(l => l.name === name ? { ...l, result, status: "resulted" } : l));
    else setImagingOrders(p => p.map(l => l.name === name ? { ...l, result, status: "resulted" } : l));
    // Update in labOrders collection — find the doc
    try {
      const snap = await getDocs(query(collection(db, "labOrders"), where("patientId", "==", patientId), where("name", "==", name)));
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.update(d.ref, { result, status: "resulted", resultedAt: serverTimestamp() }));
      await batch.commit();
    } catch { /* silent */ }
    addTimeline("lab", "📋", `Result: ${name} — ${result}`);
  }, [patientId, addTimeline]);

  // ── Notes ─────────────────────────────────────────────────────────────────
  const handleSaveNote = useCallback((note: ClinicalNote) => {
    setClinicalNotes(p => [note, ...p]);
    // Match clinicalNotes DB schema
    addDoc(collection(db, "clinicalNotes"), {
      patientId, chiefComplaint: note.cc ?? "", hpi: note.hpi ?? "",
      examination: { general: note.exam ?? "" },
      investigations: note.investigations ?? "",
      assessment: note.assessment ?? "", plan: note.plan ?? "",
      diagnoses: note.diagnoses ?? [], followUps: note.followUps ?? [],
      isLocked: note.isLocked ?? false, visitType: note.visitType ?? "follow_up",
      vitals: note.vitals ?? {}, doctorId: doctorId ?? "", doctorName: doctorName ?? "AMEXAN",
      visitDate: serverTimestamp(), createdAt: serverTimestamp(), lastEditedAt: serverTimestamp(),
    }).then(ref => {
      setClinicalNotes(p => p.map(n => n.id === note.id ? { ...n, id: ref.id } : n));
    }).catch(() => {});
    addTimeline("note", "📋", `Note: ${note.assessment || "Clinical note"}`, note.visitType);
  }, [patientId, doctorId, doctorName, addTimeline]);

  const handleEditNote = useCallback((note: ClinicalNote) => {
    setClinicalNotes(p => p.map(n => n.id === note.id ? note : n));
    if (!note.id) return;
    updateDoc(doc(db, "clinicalNotes", note.id), {
      chiefComplaint: note.cc ?? "", hpi: note.hpi ?? "",
      examination: { general: note.exam ?? "" },
      investigations: note.investigations ?? "",
      assessment: note.assessment ?? "", plan: note.plan ?? "",
      diagnoses: note.diagnoses ?? [], followUps: note.followUps ?? [],
      isLocked: note.isLocked ?? false, visitType: note.visitType ?? "follow_up",
      vitals: note.vitals ?? {}, lastEditedAt: serverTimestamp(),
    }).catch(() => {});
    addTimeline("note", "✏️", `Note edited: ${note.assessment || "Clinical note"}`);
  }, [addTimeline]);

  // ── Alerts ────────────────────────────────────────────────────────────────
  const handleAddAlert = useCallback((alert: Alert) => {
    setAlerts(p => [...p, alert]);
    addDoc(collection(db, "clinicalAlerts"), {
      ...alert, patientId, doctorId, doctorName: doctorName ?? "Doctor",
      createdAt: serverTimestamp(),
    }).catch(() => {});
    addTimeline("alert", "🔔", `Alert: ${alert.trigger}`);
  }, [patientId, doctorId, doctorName, addTimeline]);

  const handleDeleteAlert = useCallback((id: string) => {
    setAlerts(p => p.filter(a => a.id !== id));
    deleteDoc(doc(db, "clinicalAlerts", id)).catch(() => {});
  }, []);

  // ── Messaging (matches messages collection schema) ─────────────────────────
  const handleSendMessage = useCallback((text: string) => {
    const now = new Date();
    const m: Message = {
      from: "doctor", senderId: doctorId, senderName: doctorName ?? "Doctor",
      senderRole: "doctor", time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text, read: false, status: "sent", threadId, timestamp: now,
    };
    setMessages(p => [...p, m]);
    addDoc(collection(db, "messages"), {
      text, senderId: doctorId, senderName: doctorName ?? "Doctor", senderRole: "doctor",
      threadId, patientId, from: "doctor",
      type: "text", clinTag: "none", read: false, status: "sent", reactions: [],
      timestamp: serverTimestamp(),
    }).catch(() => {});
    // Also send a patient notification
    addDoc(collection(db, "patientNotifications"), {
      patientId, type: "message", title: `Message from ${doctorName ?? "Your Doctor"}`,
      body: text.slice(0, 100) + (text.length > 100 ? "…" : ""),
      read: false, priority: "normal", senderId: doctorId, senderName: doctorName ?? "Doctor",
      createdAt: serverTimestamp(),
    }).catch(() => {});
  }, [patientId, doctorId, doctorName, threadId]);

  // ── Referrals ─────────────────────────────────────────────────────────────
  const handleSubmitReferral = useCallback(async (refData: Record<string, unknown>) => {
    setReferrals(p => [{ ...refData, id: "r" + Date.now() }, ...p]);
    try {
      const ref = await addDoc(collection(db, "referrals"), refData);
      setReferrals(p => p.map(r => r.id === ("r" + Date.now()) ? { ...r, id: ref.id } : r));
      // Notify receiving doctor if internal referral
      if (refData.receivingDoctorId) {
        await addDoc(collection(db, "doctorNotifications"), {
          doctorId: refData.receivingDoctorId, type: "referral",
          title: `New Referral from ${doctorName ?? "AMEXAN"}`,
          body: `Patient: ${refData.patientName}\nSpecialty: ${refData.specialty}\nReason: ${refData.reason}`,
          referralId: ref.id, read: false, priority: refData.urgency === "emergency" ? "urgent" : "normal",
          createdAt: serverTimestamp(),
        });
      }
      addTimeline("visit", "📤", `Referral → ${refData.specialty}`, String(refData.receivingDoctorName ?? ""));
    } catch { /* silent */ }
  }, [doctorName, addTimeline]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const latest    = readings.at(-1);
  const latestCls = latest ? bpClass(latest.systolic, latest.diastolic) : null;
  const avgSys    = readings.length > 0 ? Math.round(readings.reduce((a, r) => a + r.systolic,  0) / readings.length) : 0;
  const avgDia    = readings.length > 0 ? Math.round(readings.reduce((a, r) => a + r.diastolic, 0) / readings.length) : 0;
  const { percentage: adhPct } = useMemo(() => calculateAdherence(readings, 30, 2), [readings]);
  const activeMeds = useMemo(() => medications.filter(m => m.status === "active"), [medications]);

  // ── Clinical insights (derived, no component needed) ──────────────────────
  const insights = useMemo(() => {
    const ins: { type: "warn"|"info"|"danger"|"success"; msg: string }[] = [];
    if (readings.length === 0) return [{ type: "info" as const, msg: "No BP readings yet — patient has not started monitoring." }];
    if (avgSys >= 140) ins.push({ type: "warn", msg: `Avg systolic ${avgSys} mmHg — uncontrolled on ${activeMeds.length} med(s). Consider ESC/ESH combination therapy strategy.` });
    const amlo = activeMeds.find(m => m.drug.toLowerCase().includes("amlodipine"));
    if (amlo && parseFloat(amlo.dose) >= 10) ins.push({ type: "info", msg: "Amlodipine at maximum dose (10 mg). Consider adding ARB/ACEi or thiazide diuretic." });
    const raasCount = activeMeds.filter(m => ["lisinopril","ramipril","losartan","valsartan","candesartan","telmisartan"].some(n => m.drug.toLowerCase().includes(n))).length;
    if (raasCount > 1) ins.push({ type: "danger", msg: "⚠️ Dual RAAS blockade detected — ACEi + ARB combination. High risk of hyperkalaemia and AKI. Review urgently." });
    if (latest && latest.systolic >= 180) ins.push({ type: "danger", msg: `Latest BP ${latest.systolic}/${latest.diastolic} — Hypertensive Crisis threshold. Immediate clinical review required.` });
    const spiro = activeMeds.find(m => m.drug.toLowerCase().includes("spiro") || m.drug.toLowerCase().includes("spironolactone"));
    if (spiro) ins.push({ type: "warn", msg: "Spironolactone active — mandatory K⁺ monitoring every 4 weeks. Check lab orders." });
    if (!ins.length) ins.push({ type: "success", msg: "BP trending towards target. Continue current management and review in 4–6 weeks." });
    return ins;
  }, [avgSys, activeMeds, latest, readings.length]);

  const scrollTab = (id: TabId) => {
    setTab(id);
    const el = tabsRef.current?.querySelector(`[data-tab="${id}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const icColors = { warn: T.warn, info: T.info, danger: T.danger, success: T.success } as const;
  const icBgs = { warn: "#fffbeb", info: "#eff6ff", danger: "#fef2f2", success: "#f0fdf4" } as const;
  const icIcons = { warn: "⚠️", info: "ℹ️", danger: "🚨", success: "✅" } as const;

  const isLoadingTab = (t: TabId) =>
    (loadingR && ["bp","readings","adherence","alerts"].includes(t)) ||
    (loadingM && t === "medications");

  return (
    <div>
      {/* Patient mini-header (desktop only) */}
      <Card style={{ marginBottom: 10 }} className="htn-patient-mini-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(220,38,38,0.1)", border: "1.5px solid rgba(220,38,38,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: T.danger, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
            {patientName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{patientName}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>HTN Monitoring · {readings.length} readings · {activeMeds.length} active meds</div>
          </div>
          {latestCls && latest && (
            <div style={{ padding: "6px 14px", borderRadius: 10, background: latestCls.bg, border: `0.5px solid ${latestCls.border}` }}>
              <div style={{ color: latestCls.color, fontWeight: 800, fontSize: 16 }}>{latest.systolic}/{latest.diastolic}</div>
              <div style={{ color: latestCls.color, fontSize: 10, fontWeight: 600 }}>{latestCls.label}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            {(["messaging","referrals","notes"] as TabId[]).map(t => {
              const tb = TABS.find(x => x.id === t)!;
              return <button key={t} onClick={() => scrollTab(t)} style={{ padding: "5px 10px", borderRadius: 7, border: `0.5px solid ${T.border}`, background: tab === t ? T.bg : "transparent", color: T.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{tb.icon} {tb.label}</button>;
            })}
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="htn-stat-row" style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <StatCard label="Latest BP"   value={latest ? `${latest.systolic}/${latest.diastolic}` : "—"} sub={latestCls?.label} color={latestCls?.color} />
        <StatCard label="Avg BP (All)" value={readings.length > 0 ? `${avgSys}/${avgDia}` : "—"} sub={readings.length > 0 ? bpClass(avgSys, avgDia).label : ""} color={readings.length > 0 ? bpClass(avgSys, avgDia).color : undefined} />
        <StatCard label="Monitoring Adh." value={`${adhPct}%`} sub="30-day" color={adhPct >= 80 ? T.success : adhPct >= 60 ? T.warn : T.danger} />
        <StatCard label="Active Meds" value={`${activeMeds.length}`} sub="prescriptions" color={T.purple} />
        <StatCard label="Total Readings" value={`${readings.length}`} sub="all time" />
        <StatCard label="Alerts" value={`${generateClinicalAlerts(readings, medications, adhPct, labOrders).length}`} sub="active" color={generateClinicalAlerts(readings, medications, adhPct, labOrders).length > 0 ? T.danger : T.success} />
      </div>

      {/* Clinical insights bar */}
      {!loadingR && (
        <Card style={{ marginBottom: 10 }}>
          <SectHeader label="Clinical Insights" color={T.warn} sub="Evidence-based · Auto-generated" />
          {insights.map((item, idx) => (
            <div key={idx} style={{ borderLeft: `3px solid ${icColors[item.type]}`, borderRadius: 7, padding: "7px 10px", marginBottom: idx < insights.length - 1 ? 6 : 0, background: icBgs[item.type] }}>
              <div style={{ fontSize: 11, color: icColors[item.type], lineHeight: 1.5 }}>{icIcons[item.type]} {item.msg}</div>
            </div>
          ))}
        </Card>
      )}

      {/* Tab bar */}
      <div className="htn-tabs-wrap">
        <div ref={tabsRef} className="htn-tabs htn-scroll" style={{ display: "flex", gap: 2, marginBottom: 10, background: T.bg, borderRadius: 10, padding: 3, border: `0.5px solid ${T.border}`, overflowX: "auto" }}>
          {TABS.map(({ id, icon, label }) => {
            const active = tab === id;
            return (
              <button key={id} data-tab={id} onClick={() => scrollTab(id)} className="htn-tab-btn htn-btn-press"
                style={{ padding: "7px 10px", borderRadius: 7, border: "none", background: active ? "#fff" : "transparent", color: active ? T.danger : T.faint, fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" }}>
                {icon} {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active panel */}
      <Card>
  {isLoadingTab(tab) ? <Skeleton /> : (
    <>
      {tab === "bp"            && <BPTab readings={readings} medications={medications} patientId={patientId} />}
      {tab === "readings"      && <ReadingsTab readings={readings} />}
      {tab === "medications"   && <MedicationsTab externalMeds={medications} onUpdate={handleMedUpdate} onStop={handleMedStop} onPause={handleMedPause} onRestart={handleMedRestart} onAdd={handleMedAdd} adherence={adherence} adherenceNotes={adherenceNotes} onAdherenceToggle={handleAdherenceToggle} onNoteChange={(id, v) => setAdherenceNotes(p => ({ ...p, [id]: v }))} doctorId={doctorId} doctorName={doctorName} patientId={patientId} />}
      {tab === "adherence"     && <AdherenceTab readings={readings} adherence={adherence} />}
      {tab === "alerts"        && <AlertsTab alerts={alerts} onAdd={handleAddAlert} onDelete={handleDeleteAlert} readings={readings} adherencePct={adhPct} medications={medications} labOrders={labOrders} />}
      {tab === "complications" && <ComplicationsTab complications={complications} onToggle={handleToggleComplication} />}
      {tab === "lifestyle"     && <LifestyleTab lifestyle={lifestyle} onToggle={handleToggleLifestyle} onGrade={handleGradeLifestyle} onSendNotification={handleLifestyleNotification} patientId={patientId} />}
      {tab === "education"     && <EducationTab education={education} onSend={handleSendEducation} patientId={patientId} doctorId={doctorId} doctorName={doctorName} />}
      {tab === "labs"          && <LabsTab labOrders={labOrders} imagingOrders={imagingOrders} onOrderLab={handleOrderLab} onOrderImaging={handleOrderImaging} onUpdateResult={handleUpdateResult} />}
      {tab === "notes"         && <NotesTab notes={clinicalNotes} onSave={handleSaveNote} onEdit={handleEditNote} patientName={patientName} doctorId={doctorId} doctorName={doctorName} />}
      {tab === "timeline"      && <TimelineTab events={timeline} />}
      {tab === "messaging" && (
        <MessagingTab
          messages={messages}
          onSend={handleSendMessage}
          threadId={threadId}
          loadingMessages={loadingMsg}
          patientName={patientName}
          onOpenMessaging={() => onOpenConversation?.(threadId)}
        />
      )}
      {tab === "referrals" && (
        <ReferralsPreview
          referrals={referrals as unknown as Referral[]}
          onOpenReferrals={() => onOpenReferrals?.(patientId, patientName)}
        />
      )}
    </>
  )}
</Card>

      <div style={{ textAlign: "center", color: T.faint, fontSize: 10, padding: "8px 0 2px" }}>
        HTN Control Center v2.0 · AMEXAN · ESC/ESH 2023 · AHA/ACC 2017 · All changes sync in real-time
      </div>
    </div>
  );
}

// ─── Root: HTNDashboard ───────────────────────────────────────────────────────

export default function HTNDashboard({ doctorId, doctorName, onOpenConversation, onOpenReferrals }: 
  { doctorId?: string; doctorName?: string; onOpenConversation?: (threadId: string) => void; onOpenReferrals?: 
    (patientId: string, patientName: string) => void }) 
    {
  const [patients,        setPatients]        = useState<PatientSummary[]>([]);
  const [selectedId,      setSelectedId]      = useState<string | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [mobileScreen,    setMobileScreen]    = useState<"list"|"detail">("list");
  const [listSearch,      setListSearch]      = useState("");

  // Inject global CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "htn-dashboard-css";
    if (!document.getElementById("htn-dashboard-css")) {
      el.innerHTML = GLOBAL_CSS;
      document.head.appendChild(el);
    }
    return () => { document.getElementById("htn-dashboard-css")?.remove(); };
  }, []);

  // Real-time patient list from toolReadings (bp_monitor)
  useEffect(() => {
    const q = query(collection(db, "toolReadings"), where("toolType", "==", "bp_monitor"));
    return onSnapshot(q, async snap => {
      // Aggregate by patient
      const map: Record<string, { count: number; latestSys?: number; latestDia?: number; latestAt?: Date }> = {};
      snap.docs.forEach(d => {
        const data = d.data() as RawReading & { patientId: string };
        const pid  = data.patientId; if (!pid) return;
        const sys  = (data.data as Record<string, number>|undefined)?.systolic  ?? data.systolic;
        const dia  = (data.data as Record<string, number>|undefined)?.diastolic ?? data.diastolic;
        const at   = data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date();
        if (!map[pid]) map[pid] = { count: 0 };
        map[pid].count++;
        if (!map[pid].latestAt || at > map[pid].latestAt!) {
          map[pid].latestAt = at; map[pid].latestSys = sys; map[pid].latestDia = dia;
        }
      });
      const ids = Object.keys(map);
      if (!ids.length) { setPatients([]); setLoadingPatients(false); return; }

      // Fetch patient info (try users first, then patientProfiles)
      const results = await Promise.all(ids.map(async pid => {
        try {
          let pd: Record<string, unknown> | null = null;
          try { const u = await getDoc(doc(db, "users", pid)); if (u.exists()) pd = u.data(); } catch {}
          if (!pd) { try { const p = await getDoc(doc(db, "patientProfiles", pid)); if (p.exists()) pd = p.data(); } catch {} }
          const name = String(pd?.name ?? pd?.displayName ?? pd?.fullName ?? `Patient ${pid.slice(-6)}`);
          return {
            id: pid, name, email: String(pd?.email ?? ""), phone: String(pd?.phone ?? ""),
            universalId: String(pd?.universalId ?? pd?.nhif ?? ""),
            latestSystolic: map[pid].latestSys, latestDiastolic: map[pid].latestDia,
            latestAt: map[pid].latestAt, totalReadings: map[pid].count,
          } as PatientSummary;
        } catch {
          return { id: pid, name: `Patient ${pid.slice(-6)}`, totalReadings: map[pid].count, latestSystolic: map[pid].latestSys, latestDiastolic: map[pid].latestDia, latestAt: map[pid].latestAt } as PatientSummary;
        }
      }));

      results.sort((a, b) => (b.latestAt?.getTime() ?? 0) - (a.latestAt?.getTime() ?? 0));
      setPatients(results);
      if (!selectedId && results.length > 0) setSelectedId(results[0].id);
      setLoadingPatients(false);
    }, () => setLoadingPatients(false));
  }, [doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedId) ?? null, [patients, selectedId]);
  const latestBP = selectedPatient?.latestSystolic && selectedPatient?.latestDiastolic
    ? { s: selectedPatient.latestSystolic, d: selectedPatient.latestDiastolic, cls: bpClass(selectedPatient.latestSystolic, selectedPatient.latestDiastolic) }
    : null;

  const filteredMobilePatients = useMemo(() =>
    patients.filter(p => p.name.toLowerCase().includes(listSearch.toLowerCase()) || (p.universalId ?? "").toLowerCase().includes(listSearch.toLowerCase())),
    [patients, listSearch]);

  return (
    <div className="htn-root" style={{ color: T.text, background: T.bg, minHeight: "100%", padding: "0 0 24px" }}>

      {/* ── MOBILE: Simple show/hide — no horizontal slide track ── */}

      {/* LIST screen */}
      <div className={`htn-mobile-list htn-scroll${mobileScreen === "detail" ? " hidden" : ""}`}>
        <div className="htn-list-topbar">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2>🫀 HTN Monitor</h2>
              <p>AMEXAN · ESC/ESH 2023</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "5px 11px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "htn-pulse 2s ease-in-out infinite" }} />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>Live</span>
            </div>
          </div>
        </div>
        <div className="htn-list-search">
          <input type="search" value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search patients…" />
        </div>
        {loadingPatients
          ? <div style={{ padding: "32px 16px", color: T.faint, textAlign: "center" }}><span style={{ animation: "htn-pulse 1.4s ease-in-out infinite", display: "inline-block" }}>Loading patients…</span></div>
          : !patients.length
            ? <div style={{ padding: "48px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🩺</div><div style={{ color: T.muted, fontSize: 13 }}>No BP monitoring patients found.</div></div>
            : filteredMobilePatients.map(p => {
              const cls = p.latestSystolic && p.latestDiastolic ? bpClass(p.latestSystolic, p.latestDiastolic) : null;
              const active = selectedId === p.id;
              return (
                <button key={p.id} onClick={() => { setSelectedId(p.id); setMobileScreen("detail"); }} className={`htn-patient-btn${active ? " active-row" : ""}`}>
                  <div className="htn-patient-avatar">{p.name.charAt(0).toUpperCase()}</div>
                  <div className="htn-patient-row-info">
                    <div className="htn-patient-row-name">{p.name}</div>
                    <div className="htn-patient-row-sub">
                      {p.universalId || p.id.slice(0,10)}
                      {p.latestAt && ` · ${p.latestAt.toLocaleDateString()}`}
                      {` · ${p.totalReadings} readings`}
                    </div>
                  </div>
                  {cls && p.latestSystolic && p.latestDiastolic && (
                    <div className="htn-patient-row-bp">
                      <div style={{ fontWeight: 800, fontSize: 14, color: cls.color }}>{p.latestSystolic}/{p.latestDiastolic}</div>
                      <div style={{ fontSize: 9, color: cls.color, fontWeight: 700, background: cls.bg, borderRadius: 4, padding: "1px 5px", display: "inline-block", marginTop: 2 }}>{cls.label}</div>
                    </div>
                  )}
                  <span style={{ color: T.faint, fontSize: 20, marginLeft: 4, flexShrink: 0 }}>›</span>
                </button>
              );
            })}
      </div>

      {/* DETAIL screen */}
      <div className={`htn-mobile-detail${mobileScreen === "list" ? " hidden" : ""}`}>
        {selectedPatient ? (
          <>
            <div className="htn-detail-topbar">
              <button className="htn-back-btn" onClick={() => setMobileScreen("list")}>‹</button>
              <div className="htn-detail-topbar-avatar">{selectedPatient.name.charAt(0).toUpperCase()}</div>
              <div className="htn-detail-topbar-info">
                <div className="htn-detail-topbar-name">{selectedPatient.name}</div>
                <div className="htn-detail-topbar-sub">{selectedPatient.universalId ?? selectedPatient.id.slice(0,10)} · {selectedPatient.totalReadings} readings</div>
              </div>
              {latestBP && (
                <div className="htn-detail-topbar-bp">
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>{latestBP.s}/{latestBP.d}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>{latestBP.cls.label}</div>
                </div>
              )}
            </div>
            <div className="htn-detail-content htn-scroll">
              <PatientPanel patientId={selectedPatient.id} onOpenReferrals={onOpenReferrals} onOpenConversation={onOpenConversation} patientName={selectedPatient.name} doctorId={doctorId} doctorName={doctorName} />
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: T.faint, fontSize: 14, gap: 10 }}>
            <span style={{ fontSize: 48 }}>🫀</span>
            <span>Select a patient</span>
          </div>
        )}
      </div>

      {/* ── DESKTOP / TABLET: Two-column layout ── */}
      <div className="htn-desktop-layout" style={{ flexDirection: "column", minHeight: "100%" }}>
        {/* Page header */}
        <div className="htn-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10, padding: "16px 0 0" }}>
          <div>
            <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, margin: 0 }}>🫀 HTN Monitoring Control Center</h2>
            <p style={{ color: T.muted, fontSize: 12, margin: "3px 0 0" }}>Blood pressure intelligence · AMEXAN · ESC/ESH 2023 · AHA/ACC 2017</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: T.muted }}>{patients.length} patients · {patients.reduce((a, p) => a + p.totalReadings, 0)} readings</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(5,150,105,0.08)", border: "0.5px solid rgba(5,150,105,0.3)", borderRadius: 8, padding: "6px 13px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.success, animation: "htn-pulse 2s ease-in-out infinite" }} />
              <span style={{ color: T.success, fontSize: 12, fontWeight: 600 }}>Live Sync</span>
            </div>
          </div>
        </div>
        {/* Two-column */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
          <div className="htn-patient-list" style={{ width: 290, flexShrink: 0 }}>
            <PatientPicker patients={patients} selectedId={selectedId} onSelect={setSelectedId} loading={loadingPatients} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedPatient
              ? <PatientPanel patientId={selectedPatient.id}  onOpenReferrals={onOpenReferrals}   onOpenConversation={onOpenConversation} patientName={selectedPatient.name} doctorId={doctorId} doctorName={doctorName} />
              : loadingPatients
                ? <Skeleton height={300} />
                : patients.length > 0
                  ? <Card><div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}><div style={{ fontSize: 36, marginBottom: 10 }}>🫀</div>Select a patient from the list</div></Card>
                  : null}
          </div>
        </div>
      </div>
    </div>
  );
}