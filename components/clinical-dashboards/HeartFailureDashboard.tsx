"use client";

import {
  useState, useEffect, useCallback, useMemo, useRef, memo
} from "react";
import {
  collection, query, where, orderBy, getDocs, addDoc, updateDoc,
  deleteDoc, doc, getDoc, setDoc, Timestamp, serverTimestamp,
  onSnapshot, limit, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PharmaEntry {
  drugClass: string; mechanism: string; minDose: number; maxDose: number;
  unit: string; commonDoses: string[]; frequencies: string[]; routes: string[];
  indications: string[]; contraindications: string[]; warnings: string[];
  sideEffects: string[]; patientInstructions: string; monitoring: string[];
  interactions: string[]; pregnancyCategory: string; renalDose?: string;
  hepaticDose?: string; color: string; tlColor: string;
  name?: string; class?: string; emoji?: string; targetDose?: string;
}

interface DrugInfo extends PharmaEntry { [key: string]: any }
interface PatientData { [key: string]: any; name: string; id: string; medications: Medication[]; adherence: AdherenceEntry[]; alerts: HFAlert[]; readings: HFReading[]; hospitalizations: Hospitalization[]; labs: LabResult[]; notes: { text: string; timestamp: Date }[]; complications: string[]; age?: number; sex?: string; mrn?: string }
interface Medication { [key: string]: any; name?: string; active?: boolean; dose?: string; frequency?: string; notes?: string }
interface AdherenceEntry { [key: string]: any; date: string; taken: boolean; medicationName?: string }
interface HFAlert { [key: string]: any; id: string; severity: string; message?: string; timestamp?: Date; trigger?: string; actions?: string[]; createdAt?: string; category?: string; history?: { date: string; message: string }[] }
interface LabResult { [key: string]: any; name: string; value: string; unit?: string; date: Date }

export const PHARMA_DB: Record<string, PharmaEntry> = {
  "Enalapril": {
    drugClass: "ACE Inhibitor (ACEi)",
    mechanism: "Inhibits ACE â†’ â†“ angiotensin II â†’ vasodilation + â†“ aldosterone + â†“ sympathetic activation. Mortality benefit in HFrEF (SOLVD, CONSENSUS).",
    minDose: 2.5, maxDose: 40, unit: "mg",
    commonDoses: ["2.5","5","10","20","40"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Heart failure with reduced EF (HFrEF)","Hypertension","Post-MI","Diabetic nephropathy","CKD with proteinuria"],
    contraindications: ["Pregnancy","Angioedema (prior ACEi)","Bilateral renal artery stenosis","Concurrent ARB + aliskiren (in DM/CKD)"],
    warnings: ["First-dose hypotension â€” start low, especially if on diuretics","Dry cough in 10-20% â€” switch to ARB if intolerable","Angioedema (0.1-0.5%) â€” rare but life-threatening","Monitor K+ and creatinine â€” hyperkalemia risk","SOLVD: enalapril down-arrow mortality 16% in HFrEF"],
    sideEffects: ["Dry cough","Dizziness","Hyperkalemia","Up-arrow Creatinine","Hypotension","Angioedema (rare)","Taste disturbance"],
    patientInstructions: "Take once or twice daily. Can take with or without food. Report dry cough or swelling of face/lips/tongue (emergency!). Avoid NSAIDs. Do not take if pregnant. Monitor weight daily.",
    monitoring: ["BP (supine + standing)","Serum K+","Creatinine/eGFR","Check 1-2wk after start/dose change"],
    interactions: ["ARBs/Aliskiren â€” avoid dual RAAS blockade","NSAIDs â€” up-arrow renal risk, down-arrow efficacy","K-sparing diuretics â€” hyperkalemia","Lithium â€” up-arrow toxicity","mTOR inhibitors â€” up-arrow angioedema"],
    pregnancyCategory: "D â€” CONTRAINDICATED",
    renalDose: "eGFR <30: start 2.5mg, titrate cautiously",
    color: "#059669", tlColor: "#10b981",
  },
  "Ramipril": {
    drugClass: "ACE Inhibitor (ACEi) â€” Prodrug",
    mechanism: "Prodrug active metabolite ramiprilat inhibits ACE. HOPE trial: down-arrow CV events in high-risk patients.",
    minDose: 2.5, maxDose: 10, unit: "mg",
    commonDoses: ["1.25","2.5","5","10"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Heart failure post-MI","Hypertension","Prevention of MI/stroke in high CV risk (HOPE)","CKD/proteinuria"],
    contraindications: ["Pregnancy","Prior ACEi-induced angioedema","Bilateral renal artery stenosis"],
    warnings: ["Cough (10-15%) â€” switch to ARB if troublesome","Angioedema â€” rare but life-threatening","Monitor renal function and K+","First-dose hypotension"],
    sideEffects: ["Dry cough","Dizziness","Hyperkalemia","Up-arrow Creatinine","Hypotension","Headache"],
    patientInstructions: "Take once or twice daily. Swallow capsule whole or sprinkle. Report dry cough, face/tongue swelling. Avoid ibuprofen.",
    monitoring: ["BP","K+","Creatinine/eGFR"],
    interactions: ["NSAIDs â€” up-arrow renal risk","K-sparing diuretics â€” hyperkalemia","ARBs/Aliskiren â€” avoid dual RAAS"],
    pregnancyCategory: "D â€” CONTRAINDICATED",
    renalDose: "eGFR <30: start 1.25mg OD",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Lisinopril": {
    drugClass: "ACE Inhibitor (ACEi)",
    mechanism: "Inhibits ACE â†’ down-arrow angiotensin II â†’ vasodilation + down-arrow aldosterone.",
    minDose: 5, maxDose: 40, unit: "mg",
    commonDoses: ["5","10","20","40"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Heart failure","Hypertension","Post-MI","Diabetic nephropathy","CKD with proteinuria"],
    contraindications: ["Pregnancy","Angioedema","Bilateral renal artery stenosis"],
    warnings: ["Dry cough (10-20%)","Angioedema (0.1-0.5%)","First-dose hypotension","Hyperkalemia risk"],
    sideEffects: ["Dry cough","Dizziness","Hyperkalemia","Up-arrow Creatinine","Headache"],
    patientInstructions: "Take ONCE DAILY. Report persistent cough or face swelling. Avoid NSAIDs.",
    monitoring: ["BP","K+","Creatinine/eGFR"],
    interactions: ["NSAIDs â€” up-arrow renal risk","K-sparing diuretics â€” hyperkalemia","ARBs/Aliskiren â€” avoid dual RAAS"],
    pregnancyCategory: "D â€” CONTRAINDICATED",
    renalDose: "eGFR <30: start 2.5mg",
    color: "#059669", tlColor: "#34d399",
  },
  "Trandolapril": {
    drugClass: "ACE Inhibitor (ACEi) â€” Prodrug",
    mechanism: "Prodrug â†’ trandolaprilat inhibits ACE. Tissue ACE affinity.",
    minDose: 1, maxDose: 4, unit: "mg",
    commonDoses: ["1","2","4"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Heart failure post-MI","Hypertension"],
    contraindications: ["Pregnancy","ACEi angioedema","Renal artery stenosis"],
    warnings: ["Hypotension","Cough","Angioedema"],
    sideEffects: ["Cough","Dizziness","Hyperkalemia"],
    patientInstructions: "Take once daily. Monitor weight. Report dizziness.",
    monitoring: ["BP","K+","eGFR"],
    interactions: ["NSAIDs","K-sparing diuretics","Dual RAAS"],
    pregnancyCategory: "D",
    renalDose: "eGFR <30: 0.5mg OD",
    color: "#6d28d9", tlColor: "#7c3aed",
  },
  "Perindopril": {
    drugClass: "ACE Inhibitor (ACEi) â€” Prodrug",
    mechanism: "Prodrug â†’ perindoprilat. High tissue ACE affinity. EUROPA: down-arrow CV events in stable CAD.",
    minDose: 2, maxDose: 8, unit: "mg",
    commonDoses: ["2","4","8"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Heart failure","Hypertension","Stable CAD (EUROPA)"],
    contraindications: ["Pregnancy","Angioedema"],
    warnings: ["Cough","Hypotension","Renal monitoring"],
    sideEffects: ["Cough","Dizziness","Headache","Asthenia"],
    patientInstructions: "Take once daily in morning. Report cough or swelling.",
    monitoring: ["BP","K+","eGFR"],
    interactions: ["NSAIDs","Diuretics","Lithium"],
    pregnancyCategory: "D",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Losartan": {
    drugClass: "Angiotensin Receptor Blocker (ARB)",
    mechanism: "Selectively blocks AT1 receptors â†’ down-arrow vasoconstriction, aldosterone, sodium retention. Well-tolerated in HFrEF.",
    minDose: 25, maxDose: 150, unit: "mg",
    commonDoses: ["25","50","100","150"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Heart failure (ACEi-intolerant)","Hypertension","Diabetic nephropathy (type 2)","LVH"],
    contraindications: ["Pregnancy","Bilateral renal artery stenosis","Severe hyperkalemia (K+ >6.0)"],
    warnings: ["Monitor K+ and creatinine 1-2wk after initiation","First-dose hypotension if volume depleted","Avoid in pregnancy"],
    sideEffects: ["Dizziness","Hyperkalemia","Up-arrow Creatinine","Hypotension","Cough (less than ACEi)"],
    patientInstructions: "Take ONCE DAILY. Avoid potassium supplements. Drink adequate fluids.",
    monitoring: ["BP","Serum K+","Creatinine/eGFR","Urine ACR"],
    interactions: ["NSAIDs â€” up-arrow renal risk","K-sparing diuretics â€” hyperkalemia","Lithium â€” up-arrow toxicity","ACEi â€” dual RAAS: avoid"],
    pregnancyCategory: "D â€” CONTRAINDICATED",
    renalDose: "eGFR 15-30: caution; <15: not recommended",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Valsartan": {
    drugClass: "Angiotensin Receptor Blocker (ARB)",
    mechanism: "Selectively blocks AT1 receptors. Val-HeFT: valsartan down-arrow morbidity/mortality in HFrEF.",
    minDose: 40, maxDose: 320, unit: "mg",
    commonDoses: ["40","80","160","320"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Heart failure (Val-HeFT)","Hypertension","Post-MI"],
    contraindications: ["Pregnancy","Severe hyperkalemia","Bilateral renal artery stenosis"],
    warnings: ["First-dose hypotension","Hyperkalemia","Monitor renal function"],
    sideEffects: ["Dizziness","Hyperkalemia","Headache","Diarrhea","Fatigue"],
    patientInstructions: "Take once or twice daily. Can take with food. Avoid potassium supplements.",
    monitoring: ["BP","K+","eGFR"],
    interactions: ["NSAIDs","K-sparing diuretics","Lithium"],
    pregnancyCategory: "D",
    renalDose: "eGFR <30: caution",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Candesartan": {
    drugClass: "Angiotensin Receptor Blocker (ARB)",
    mechanism: "Selectively blocks AT1 receptors. CHARM: candesartan down-arrow CV deaths and HF hospitalizations across EF spectrum.",
    minDose: 4, maxDose: 32, unit: "mg",
    commonDoses: ["4","8","16","32"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Heart failure (CHARM â€” HFrEF and HFpEF)","Hypertension"],
    contraindications: ["Pregnancy","Bilateral renal artery stenosis","Severe hepatic impairment"],
    warnings: ["First-dose hypotension","Hyperkalemia","Monitor renal function","CHARM: down-arrow CV death/HF hosp by 23%"],
    sideEffects: ["Dizziness","Hyperkalemia","Hypotension","Headache","UTI"],
    patientInstructions: "Take once daily. Monitor for dizziness when standing.",
    monitoring: ["BP","K+","eGFR","LFTs"],
    interactions: ["NSAIDs","K-sparing diuretics","ACEi â€” avoid dual RAAS"],
    pregnancyCategory: "D",
    renalDose: "eGFR <15: not recommended",
    color: "#7c3aed", tlColor: "#a855f7",
  },
  "Sacubitril/Valsartan": {
    drugClass: "Angiotensin Receptor-Neprilysin Inhibitor (ARNI)",
    mechanism: "Sacubitril inhibits neprilysin (up-arrow ANP, BNP, CNP) + valsartan blocks AT1. PARADIGM-HF: down-arrow CV death/HF hosp by 20% vs enalapril. Superior to ACEi.",
    minDose: 24, maxDose: 103, unit: "mg",
    commonDoses: ["24/26","49/51","97/103"], frequencies: ["BD"], routes: ["Oral"],
    indications: ["HFrEF (NYHA II-IV) â€” FIRST-LINE replacement for ACEi/ARB","Hypertension"],
    contraindications: ["Pregnancy","Angioedema history","Concurrent ACEi (washout 36h)","Bilateral renal artery stenosis"],
    warnings: ["DO NOT take with ACEi â€” wait 36h after last ACEi dose","Angioedema risk","Hypotension","Hyperkalemia","Renal impairment"],
    sideEffects: ["Hypotension","Hyperkalemia","Cough","Dizziness","Renal impairment","Angioedema (rare)"],
    patientInstructions: "Take TWICE DAILY (BD). DO NOT take if you have taken an ACEi in the last 36 hours. Monitor BP â€” may cause dizziness. Report swelling of face or difficulty breathing. Weigh daily.",
    monitoring: ["BP (frequent â€” especially at initiation)","Serum K+","Creatinine/eGFR","Weight"],
    interactions: ["ACEi â€” wait 36h washout","K-sparing diuretics â€” up-arrow hyperkalemia","NSAIDs â€” up-arrow renal risk","Aliskiren â€” avoid","Atorvastatin â€” up-arrow levels"],
    pregnancyCategory: "D â€” CONTRAINDICATED",
    renalDose: "eGFR 15-30: start 24/26mg BD; <15: not recommended",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Bisoprolol": {
    drugClass: "Beta-Blocker (beta1-selective)",
    mechanism: "Selective beta1-blockade â†’ down-arrow HR, down-arrow contractility, down-arrow renin. CIBIS II: down-arrow all-cause mortality 34% in HFrEF.",
    minDose: 1.25, maxDose: 10, unit: "mg",
    commonDoses: ["1.25","2.5","5","7.5","10"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["HFrEF (CIBIS II â€” mortality benefit)","Angina","Hypertension"],
    contraindications: ["Asthma/severe COPD","2nd/3rd degree AV block (no pacemaker)","Severe bradycardia (HR <50)","Decompensated HF","Cardiogenic shock"],
    warnings: ["CIBIS II: start 1.25mg, titrate slowly â€” 'Start low, go slow'","Do NOT stop abruptly â€” taper over 2 weeks","May mask hypoglycemia in diabetics"],
    sideEffects: ["Fatigue","Bradycardia","Cold extremities","Dizziness","Hypotension","Nightmares","Depression"],
    patientInstructions: "Take ONCE DAILY. Do NOT stop suddenly â€” can cause dangerous rebound. Start low and increase slowly. Report very slow pulse (<50 bpm), breathlessness, or worsening HF symptoms.",
    monitoring: ["HR (target >=55-60 bpm)","BP","Clinical status (worsening HF)","ECG"],
    interactions: ["Verapamil/diltiazem â€” severe bradycardia/AV block","Clonidine â€” rebound HTN on withdrawal","Antiarrhythmics â€” additive effects","Insulin â€” masks hypoglycemia"],
    pregnancyCategory: "C â€” use with caution",
    renalDose: "eGFR <30: caution with titration",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "Carvedilol": {
    drugClass: "Beta-Blocker (non-selective beta1, beta2, alpha1)",
    mechanism: "Non-selective beta-blockade + alpha1-blockade â†’ vasodilation + down-arrow HR + down-arrow contractility. COPERNICUS: down-arrow mortality 35% in severe HF.",
    minDose: 3.125, maxDose: 50, unit: "mg",
    commonDoses: ["3.125","6.25","12.5","25","50"], frequencies: ["BD"], routes: ["Oral"],
    indications: ["HFrEF (COPERNICUS, US Carvedilol â€” mortality benefit)","Hypertension","Post-MI with LV dysfunction"],
    contraindications: ["Decompensated HF (NYHA IV on IV inotropes)","Asthma","2nd/3rd AV block","Severe bradycardia"],
    warnings: ["Start 3.125mg BD â€” titrate at 2-week intervals to 25mg BD","May cause dizziness (alpha-blockade component)","Do NOT stop abruptly","Monitor for worsening HF during titration"],
    sideEffects: ["Dizziness (alpha1-blockade)","Fatigue","Bradycardia","Hypotension","Edema","Diarrhea","Weight gain"],
    patientInstructions: "Take TWICE DAILY (BD) with food. 'Start low, go slow' â€” dose increased gradually every 2 weeks. Do NOT stop suddenly. Report breathlessness, dizziness, or weight gain.",
    monitoring: ["HR (target 55-60 bpm)","BP (sitting/standing)","Weight","Clinical status during titration"],
    interactions: ["Verapamil/diltiazem â€” bradycardia","Clonidine â€” rebound HTN","Digoxin â€” up-arrow levels","Antiarrhythmics â€” additive effects"],
    pregnancyCategory: "C",
    renalDose: "No adjustment â€” hepatic metabolism",
    color: "#c2410c", tlColor: "#ea580c",
  },
  "Metoprolol Succinate": {
    drugClass: "Beta-Blocker (beta1-selective, extended-release)",
    mechanism: "Selective beta1-blockade. Extended-release: once daily. MERIT-HF: down-arrow all-cause mortality 34% in HFrEF.",
    minDose: 25, maxDose: 200, unit: "mg",
    commonDoses: ["25","50","100","150","200"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["HFrEF (MERIT-HF â€” mortality benefit)","Hypertension","Angina","Post-MI","AF rate control"],
    contraindications: ["Severe asthma","2nd/3rd AV block","HR <60","Decompensated HF","Sick sinus syndrome"],
    warnings: ["Do NOT crush succinate tablets","Titrate slowly in HF â€” start 25mg OD, double every 2 weeks","Must not stop abruptly","Depression reported â€” monitor mood"],
    sideEffects: ["Fatigue","Bradycardia","Cold extremities","Dizziness","Depression","Insomnia","Nightmares"],
    patientInstructions: "Take ONCE DAILY at same time. Swallow whole â€” do NOT crush or chew. Do NOT stop suddenly. Report very slow pulse or breathlessness.",
    monitoring: ["HR","BP","HF clinical status"],
    interactions: ["Verapamil/diltiazem â€” bradycardia","CYP2D6 inhibitors (fluoxetine, paroxetine)","Clonidine â€” rebound on withdrawal"],
    pregnancyCategory: "C",
    color: "#c2410c", tlColor: "#ea580c",
  },
  "Spironolactone": {
    drugClass: "Mineralocorticoid Receptor Antagonist (MRA)",
    mechanism: "Blocks aldosterone receptors â†’ up-arrow Na+/water excretion, down-arrow K+ excretion. Anti-fibrotic in heart. RALES: down-arrow mortality 30% in severe HFrEF.",
    minDose: 12.5, maxDose: 50, unit: "mg",
    commonDoses: ["12.5","25","50"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["HFrEF (NYHA II-IV â€” RALES trial)","Resistant HTN","Primary hyperaldosteronism"],
    contraindications: ["Hyperkalemia (K+ >5.0)","Addison's disease","eGFR <30","Pregnancy"],
    warnings: ["MANDATORY K+ monitoring â€” life-threatening hyperkalemia","Gynecomastia in men (15-20%)","Renal impairment increases hyperkalemia risk","RALES: start 12.5-25mg OD, max 50mg"],
    sideEffects: ["Hyperkalemia","Gynecomastia/breast pain (men)","Menstrual irregularities","Dizziness","GI upset"],
    patientInstructions: "Take ONCE DAILY with food. AVOID potassium-rich foods and K supplements. AVOID NSAIDs. Report muscle weakness, palpitations, or breast tenderness.",
    monitoring: ["K+ at 1wk, 4wk, then 3-monthly (MANDATORY)","Creatinine/eGFR","BP"],
    interactions: ["ACEi/ARBs â€” up-up hyperkalemia","NSAIDs â€” up-arrow renal risk, up-arrow K+","Digoxin â€” up-arrow digoxin t-half","K supplements â€” contraindicated"],
    pregnancyCategory: "D â€” CONTRAINDICATED",
    renalDose: "Avoid eGFR <30; caution 30-45",
    color: "#7c3aed", tlColor: "#a855f7",
  },
  "Eplerenone": {
    drugClass: "Mineralocorticoid Receptor Antagonist (MRA) â€” Selective",
    mechanism: "Selective aldosterone receptor antagonist. Less gynecomastia than spironolactone. EMPHASIS-HF: down-arrow mortality/HF hosp by 37% in mild HFrEF.",
    minDose: 25, maxDose: 50, unit: "mg",
    commonDoses: ["25","50"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["HFrEF (mild symptoms â€” EMPHASIS-HF)","Post-MI with LV dysfunction (EPHESUS)"],
    contraindications: ["Hyperkalemia (K+ >5.0)","eGFR <30","Pregnancy"],
    warnings: ["Hyperkalemia risk â€” mandatory monitoring","Less gynecomastia than spironolactone","EMPHASIS-HF: start 25mg OD, up-titrate to 50mg OD"],
    sideEffects: ["Hyperkalemia","Up-arrow Creatinine","Dizziness","Fatigue","Diarrhea"],
    patientInstructions: "Take once daily with or without food. Avoid potassium supplements. Avoid NSAIDs. Report muscle weakness or irregular heartbeat.",
    monitoring: ["K+ at 1wk, 4wk, then 3-monthly","Creatinine/eGFR","BP"],
    interactions: ["ACEi/ARBs â€” up-arrow hyperkalemia","NSAIDs â€” up-arrow renal risk","Ketoconazole â€” up-arrow eplerenone levels","Digoxin â€” monitor levels"],
    pregnancyCategory: "B â€” limited data",
    renalDose: "eGFR 30-50: 25mg OD; eGFR <30: contraindicated",
    color: "#7c3aed", tlColor: "#6d28d9",
  },
  "Dapagliflozin": {
    drugClass: "SGLT2 Inhibitor (SGLT2i)",
    mechanism: "Selectively inhibits SGLT2 in kidney + osmotic diuresis + beneficial cardiac/renal effects. DAPA-HF: down-arrow worsening HF/CV death by 26%.",
    minDose: 5, maxDose: 10, unit: "mg",
    commonDoses: ["5","10"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["HFrEF (NYHA II-IV â€” DAPA-HF)","Type 2 DM","CKD with proteinuria"],
    contraindications: ["Type 1 DM","Severe hepatic impairment","eGFR <25 (initiation)"],
    warnings: ["Diabetic ketoacidosis (atypical)","Genitourinary infections","Volume depletion â€” caution with diuretics","Fournier's gangrene (rare)"],
    sideEffects: ["Genital mycotic infections","UTI","Polyuria","Volume depletion","DKA (rare)"],
    patientInstructions: "Take ONCE DAILY. Maintain adequate hydration. Report genital itching/discharge, signs of DKA.",
    monitoring: ["eGFR (before and during therapy)","Volume status","Blood glucose (if DM)"],
    interactions: ["Diuretics â€” up-arrow risk of volume depletion","Insulin/sulphonylureas â€” up-arrow hypoglycemia risk","NSAIDs â€” up-arrow renal risk"],
    pregnancyCategory: "C â€” avoid in 2nd/3rd trimester",
    renalDose: "eGFR 25-45: use with caution; <25: do not initiate",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Empagliflozin": {
    drugClass: "SGLT2 Inhibitor (SGLT2i)",
    mechanism: "Selective SGLT2 inhibitor. EMPEROR-Reduced: down-arrow CV death/HF hosp by 25% in HFrEF with/without diabetes.",
    minDose: 10, maxDose: 25, unit: "mg",
    commonDoses: ["10","25"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["HFrEF (EMPEROR-Reduced)","Type 2 DM"],
    contraindications: ["Type 1 DM","Severe hepatic impairment","eGFR <20"],
    warnings: ["DKA risk","GU infections","Volume depletion","Monitor for Fournier's gangrene"],
    sideEffects: ["UTI","Genital infections","Polyuria","Hypotension","DKA"],
    patientInstructions: "Take once daily. Stay well-hydrated. Report fever or perineal pain.",
    monitoring: ["eGFR","Volume status","BG (if DM)"],
    interactions: ["Diuretics â€” volume depletion","Insulin â€” hypoglycemia"],
    pregnancyCategory: "C",
    renalDose: "eGFR <30: avoid",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Furosemide": {
    drugClass: "Loop Diuretic",
    mechanism: "Inhibits Na+-K+-2Cl- cotransporter in ascending loop of Henle â†’ potent diuresis. Works even in renal impairment.",
    minDose: 20, maxDose: 240, unit: "mg",
    commonDoses: ["20","40","80","120","160","240"], frequencies: ["OD","BD","TDS"], routes: ["Oral","IV"],
    indications: ["Acute/chronic HF with volume overload","Pulmonary edema","HTN with CKD/fluid overload"],
    contraindications: ["Anuria","Sulfonamide allergy","Pre-coma","Severe electrolyte depletion"],
    warnings: ["Profound diuresis â€” hypovolemia","Hypokalemia â€” up-arrow digoxin toxicity risk","Ototoxicity (high IV doses)","Hyperuricemia","DO NOT take at night"],
    sideEffects: ["Polyuria","Hypokalemia","Hypotension","Dehydration","Gout","Tinnitus","Muscle cramps"],
    patientInstructions: "Take in the MORNING. You will urinate frequently. Weigh yourself daily â€” report >2kg gain overnight. Report dizziness, ringing in ears, muscle cramps.",
    monitoring: ["U&E (K+, Na+, Mg++)","eGFR","BP (orthostatic)","Daily weight"],
    interactions: ["Digoxin â€” hypokalemia up-arrow toxicity","ACEi/ARBs â€” up-arrow hypotension","Aminoglycosides â€” ototoxicity","Lithium â€” up-arrow levels","NSAIDs â€” down-arrow efficacy"],
    pregnancyCategory: "C â€” use if needed",
    renalDose: "Effective across all eGFR â€” higher doses needed in CKD",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Bumetanide": {
    drugClass: "Loop Diuretic",
    mechanism: "Inhibits Na+-K+-2Cl- cotransporter. 40x more potent than furosemide.",
    minDose: 1, maxDose: 10, unit: "mg",
    commonDoses: ["1","2","4","5","10"], frequencies: ["OD","BD"], routes: ["Oral","IV"],
    indications: ["HF with fluid overload","Edema","Renal insufficiency"],
    contraindications: ["Anuria","Sulfonamide allergy","Hepatic coma"],
    warnings: ["Hypokalemia","Ototoxicity","Dehydration"],
    sideEffects: ["Hypokalemia","Polyuria","Muscle cramps","Nausea"],
    patientInstructions: "Take in morning. Weigh daily. Report >2kg gain.",
    monitoring: ["K+","eGFR","Weight"],
    interactions: ["Digoxin","Lithium","Aminoglycosides"],
    pregnancyCategory: "C",
    color: "#dc2626", tlColor: "#f87171",
  },
  "Torsemide": {
    drugClass: "Loop Diuretic",
    mechanism: "Inhibits Na+-K+-2Cl- cotransporter. More predictable absorption. Longer t-half.",
    minDose: 5, maxDose: 200, unit: "mg",
    commonDoses: ["5","10","20","50","100","200"], frequencies: ["OD","BD"], routes: ["Oral","IV"],
    indications: ["HF volume overload","Hypertension","Edema","Renal disease"],
    contraindications: ["Sulfonamide allergy","Anuria"],
    warnings: ["Hypokalemia","Ototoxicity","Volume depletion"],
    sideEffects: ["Hypokalemia","Polyuria","Dizziness","Headache"],
    patientInstructions: "Take in morning. Report weight gain >2kg/day.",
    monitoring: ["K+","Weight","eGFR"],
    interactions: ["Digoxin","Lithium"],
    pregnancyCategory: "B",
    color: "#dc2626", tlColor: "#fca5a5",
  },
  "Digoxin": {
    drugClass: "Cardiac Glycoside",
    mechanism: "Inhibits Na+/K+-ATPase â†’ up-arrow intracellular Ca++ â†’ up-arrow inotropy. Vagomimetic â†’ down-arrow HR in AF. DIG trial: down-arrow HF hospitalizations, neutral mortality.",
    minDose: 0.0625, maxDose: 0.25, unit: "mg",
    commonDoses: ["0.0625","0.125","0.1875","0.25"], frequencies: ["OD"], routes: ["Oral","IV"],
    indications: ["HFrEF (in addition to GDMT â€” down-arrow hospitalizations)","Rate control in AF + HF"],
    contraindications: ["2nd/3rd degree AV block (no pacemaker)","WPW","HOCM","Hypokalemia"],
    warnings: ["Narrow therapeutic index â€” toxicity common","Hypokalemia, hypomagnesemia, hypercalcemia up-arrow toxicity","Renal function determines clearance","Monitor digoxin levels (0.5-0.9 ng/mL in HF)"],
    sideEffects: ["Nausea/vomiting","Anorexia","Arrhythmias","Visual disturbances","Confusion"],
    patientInstructions: "Take ONCE DAILY at same time. Do NOT miss dose. Do NOT double dose. Report nausea, vomiting, visual changes, confusion, palpitations.",
    monitoring: ["Digoxin level (target 0.5-0.9 ng/mL for HF)","K+, Mg++, Ca++","ECG","eGFR"],
    interactions: ["Amiodarone â€” up-arrow digoxin levels (halve dose)","Hypokalemia (from diuretics) â€” up-arrow toxicity","Verapamil â€” up-arrow digoxin levels","Spironolactone â€” up-arrow digoxin t-half"],
    pregnancyCategory: "C",
    renalDose: "eGFR 15-30: 0.125mg alt days or 0.0625mg OD; <15: 0.0625mg OD",
    color: "#2563eb", tlColor: "#60a5fa",
  },
  "Hydralazine/ISDN": {
    drugClass: "Vasodilator Combination (H/I)",
    mechanism: "Hydralazine (arterial vasodilator) + ISDN (venodilator + NO donor). A-HeFT: down-arrow mortality 43% in self-identified Black patients with HFrEF.",
    minDose: 37.5, maxDose: 75, unit: "mg",
    commonDoses: ["37.5","75"], frequencies: ["TDS"], routes: ["Oral"],
    indications: ["Adjunct in HFrEF for self-identified Black patients (A-HeFT)","ACEi/ARB-intolerant HF"],
    contraindications: ["SLE/hydralazine-induced lupus","Severe aortic stenosis","MI (acute)"],
    warnings: ["Hydralazine: drug-induced SLE (5-10%) â€” ANA, anti-histone antibodies","ISDN: tolerance develops â€” need nitrate-free interval","A-HeFT: fixed-dose combination BiDil"],
    sideEffects: ["Headache (ISDN)","Flushing","Dizziness","Tachycardia (hydralazine)","Lupus-like syndrome"],
    patientInstructions: "Take THREE times daily (TDS) â€” every 8 hours. Headache often improves with continued use. Report joint pain, rash, fever.",
    monitoring: ["BP (sitting/standing)","HR","ANA/anti-histone if lupus symptoms"],
    interactions: ["PDE5 inhibitors (sildenafil, tadalafil) â€” severe hypotension","Beta-blockers â€” additive bradycardia"],
    pregnancyCategory: "C",
    renalDose: "Hydralazine: reduce dosing interval in severe CKD",
    color: "#6d28d9", tlColor: "#7c3aed",
  },
  "Ivabradine": {
    drugClass: "If Channel Blocker (Sinus Node Modulator)",
    mechanism: "Selectively blocks If channels in SA node â†’ down-arrow HR without negative inotropy. SHIFT: down-arrow HF hospitalization by 26% in HFrEF with HR >=70 bpm.",
    minDose: 2.5, maxDose: 7.5, unit: "mg",
    commonDoses: ["2.5","5","7.5"], frequencies: ["BD"], routes: ["Oral"],
    indications: ["HFrEF with HR >=70 bpm on max tolerated BB (SHIFT)","Inappropriate sinus tachycardia"],
    contraindications: ["HR <60 bpm at rest","Sick sinus syndrome","Sinoatrial block","3rd degree AV block","Severe hypotension (SBP <90)","Acute decompensated HF"],
    warnings: ["SHIFT: add to BB, NOT replace â€” only if HR >=70 despite BB","Visual disturbances (phosphenes)","May cause bradycardia â€” monitor HR","Atrial fibrillation risk increased"],
    sideEffects: ["Phosphenes (visual bright spots, 8.5%)","Bradycardia (6%)","Headache","Dizziness","Blurred vision","AF (new-onset, 9%)"],
    patientInstructions: "Take TWICE DAILY with food. You may see temporary bright spots in your vision (phosphenes). Report very slow pulse, fainting, or palpitations.",
    monitoring: ["HR (before initiation and during therapy)","ECG","Visual symptoms"],
    interactions: ["Verapamil/diltiazem â€” avoid (up-arrow bradycardia)","CYP3A4 inhibitors (clarithromycin, ketoconazole, grapefruit) â€” up-arrow ivabradine","CYP3A4 inducers (rifampicin) â€” down-arrow efficacy"],
    pregnancyCategory: "D â€” avoid",
    renalDose: "eGFR >15: no adjustment",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Vericiguat": {
    drugClass: "Soluble Guanylate Cyclase (sGC) Stimulator",
    mechanism: "Stimulates sGC directly + sensitizes to NO â†’ up-arrow cGMP â†’ vasodilation + anti-fibrotic. VICTORIA: down-arrow CV death/HF hosp by 10% in high-risk worsening HF.",
    minDose: 2.5, maxDose: 10, unit: "mg",
    commonDoses: ["2.5","5","10"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Worsening HFrEF (EF <45%, elevated BNP, recent decompensation â€” VICTORIA)"],
    contraindications: ["Severe hypotension (SBP <90)","Severe hepatic impairment (Child-Pugh C)","Concurrent PDE5 inhibitors (sildenafil)"],
    warnings: ["Hypotension â€” especially with other vasodilators","VICTORIA: added to background GDMT","Dose titration: 2.5 -> 5 -> 10mg OD, 2-weekly"],
    sideEffects: ["Hypotension (16%)","Anemia (10%)","Headache","Dizziness","Nausea"],
    patientInstructions: "Take ONCE DAILY with food. Titrate dose up every 2 weeks as tolerated. Report dizziness, especially when standing. Do NOT take with sildenafil/tadalafil.",
    monitoring: ["BP (sitting/standing)","Hb (for anemia)","Symptoms of worsening HF","CBC"],
    interactions: ["PDE5 inhibitors â€” severe hypotension (contraindicated)","Nitrates â€” additive hypotension","Other vasodilators â€” caution"],
    pregnancyCategory: "C â€” avoid",
    renalDose: "eGFR 15-30: limited data, use cautiously",
    color: "#7c3aed", tlColor: "#a855f7",
  },
};

export function getDrugInfo(name: string): PharmaEntry | null {
  const key = Object.keys(PHARMA_DB).find(k => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().startsWith(k.toLowerCase()));
  return key ? PHARMA_DB[key] : null;
}

export interface ScientificAlert {
  id: string; severity: "critical"|"urgent"|"warning"|"info";
  category: string; title: string; detail: string;
  evidence: string; action: string; icon: string;
}

export interface PatientSummary {
  id: string; name: string; age?: number; sex?: string; email?: string;
  phone?: string; universalId?: string; diagnosis?: string; riskLevel?: string;
  lastVisit?: string; nextReview?: string;
  latestEF?: number; latestBNP?: number; latestWeight?: number; latestNYHA?: number;
  latestAt?: Date; totalReadings: number;
}

export interface HFReading {
  id: string; ef?: number; bnp?: number; ntproBNP?: number; weight?: number;
  nyhaClass?: 1|2|3|4; systolicBP?: number; diastolicBP?: number; hr?: number;
  recordedAt: Date; source: "patient"|"clinic"|"device";
  edema?: "none"|"mild"|"moderate"|"severe"; jvp?: number; orthopnea?: boolean; pnd?: boolean;
  doctorNote?: string; doctorReviewed?: boolean;
}

export interface MedItem {
  id: string;
  drug: string;
  medication?: string;
  dose: string;
  dosage?: string;
  unit: string; frequency: string; drugClass: string;
  status: "active"|"stopped"|"paused";
  startDate: string; endDate?: string;
  indication?: string; route?: string; instructions?: string;
  warnings?: string; refills?: number; duration?: string;
  notes?: string;
  changeHistory?: DoseChangeItem[];
}

export interface DoseChangeItem {
  date: string; changeType: "started"|"dose_increase"|"dose_decrease"|"stopped"|"paused"|"restarted";
  previousDose?: string; newDose?: string; changedBy: string; reason?: string;
}

export interface Hospitalization {
  id?: string; startDate: Date; endDate?: Date; reason: string;
  facility?: string; duration?: string; dischargeEF?: number; dischargeBNP?: number;
  ivDiuretics?: boolean; inotropes?: boolean; icu?: boolean;
  [key: string]: any;
}

export interface HfAlert { id: string; trigger: string; actions: string[]; createdAt: string; doctorNote?: string; category?: string; history: { date: string; message: string }[]; }
export interface Complication { name: string; date: string; }
export interface LifestyleItem { name: string; grade: "Good"|"Moderate"|"Poor"; updatedAt?: string; }
export interface LabTest { name: string; result?: string; orderedAt?: string; type?: "lab"|"imaging"; status?: string; study?: string; modality?: string; bodyPart?: string; urgency?: string; }
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
export interface ChartPoint { date: string; isoDate: string; value: number; unit: string; type: string; source: "patient"|"clinic"|"device"; }

export interface EducationTopic {
  id: string; title: string; content: string; keyPoints: string[];
  category: string; duration: string; sentAt?: string; acknowledged?: boolean;
}

export const EDUCATION_TOPICS: EducationTopic[] = [
  { id: "hf_basics", title: "What is Heart Failure?", content: "Heart failure means your heart is not pumping as well as it should. It does NOT mean your heart has stopped working. Blood and fluid can back up into your lungs and body, causing shortness of breath and swelling. HF is a chronic condition that can be managed well with medications and lifestyle changes.", keyPoints: ["HF is a chronic condition â€” manageable, not curable","Two main types: HFrEF (reduced EF) and HFpEF (preserved EF)","Common symptoms: SOB, fatigue, leg swelling, rapid weight gain","Early treatment improves quality of life and survival","You can live well with HF â€” follow your treatment plan"], category: "Foundation", duration: "5 min" },
  { id: "daily_weight", title: "Why Daily Weight Matters", content: "Weighing yourself every morning is the single most important self-monitoring tool in HF. Weight gain from fluid retention happens 5-7 days before you feel short of breath. Catching it early can prevent hospitalization.", keyPoints: ["Weigh EVERY morning, after voiding but before eating/drinking","Use the same scale, same time, same clothing","Record your weight daily â€” bring log to appointments","Call your doctor if weight increases >2 kg (4.4 lbs) in 1-2 days","Sudden weight gain = fluid retention = call doctor NOW"], category: "Monitoring", duration: "4 min" },
  { id: "low_sodium", title: "Low Sodium Diet (<2g/day)", content: "Sodium causes your body to retain fluid, making your heart work harder. Most HF patients should limit sodium to <2000 mg/day. Processed foods account for 70% of sodium intake.", keyPoints: ["Limit sodium to <2000 mg/day (approx 1 teaspoon of salt)","Avoid processed foods: canned soups, deli meats, frozen dinners, fast food","Read labels â€” 'sodium' not 'salt' on nutrition facts","Cook with herbs, lemon, garlic, no-salt seasoning blends","Restaurant food: ask for no added salt, sauces on side"], category: "Nutrition", duration: "5 min" },
  { id: "fluid_restriction", title: "Fluid Restriction in Heart Failure", content: "Some HF patients (those with advanced HF or frequent admissions) need to limit total fluid intake to 1.5-2 L/day. This includes all fluids â€” water, coffee, soup, ice cream.", keyPoints: ["Typical limit: 1.5-2 L/day (6-8 cups)","All fluids count: water, tea, coffee, juice, soup, ice cream, gelatin","Measure fluids â€” use a pitcher for daily allowance","Ice chips, hard candies, frozen grapes for thirst","Thirst management: brush teeth, use mouthwash, chew gum"], category: "Lifestyle", duration: "4 min" },
  { id: "early_decompensation", title: "Recognizing Early Decompensation", content: "HF decompensation (worsening) usually builds over days. Recognizing early signs allows early intervention â€” often preventing hospitalization. Weight gain and increased symptoms are key.", keyPoints: ["Weight gain >2 kg in 1-2 days = FLUID OVERLOAD","Increasing shortness of breath with activity","Waking up gasping for air (PND)","Need more pillows to sleep (orthopnea)","New or worsening leg swelling","Persistent cough or wheezing","Fatigue, confusion, decreased urine output","Track daily: weight + symptoms + BP. Act early â€” call your doctor."], category: "Safety", duration: "5 min" },
  { id: "gdmt_explained", title: "Your Heart Failure Medications (GDMT)", content: "Guideline-Directed Medical Therapy (GDMT) is the combination of medications proven to prolong life and reduce hospitalizations in HF. Most patients need 3-4 medications working together.", keyPoints: ["ARNI/ACEi/ARB: dilate blood vessels, protect heart + kidneys","Beta-blockers: protect heart from adrenaline, improve pumping","MRAs: reduce fluid, protect heart from scarring","SGLT2 inhibitors: newest breakthrough â€” protect heart + kidneys","Diuretics: relieve fluid symptoms (NOT life-prolonging)","Take ALL medications daily â€” even when you feel well","Do NOT stop or change doses without talking to your doctor"], category: "Medications", duration: "6 min" },
  { id: "when_to_call", title: "When to Call Your Doctor or Go to Hospital", content: "Knowing when to seek medical attention can save your life. Create an action plan with your doctor for worsening symptoms.", keyPoints: ["Call clinic: weight gain >2 kg in 1-2 days, increased SOB, new swelling","Go to ER: severe chest pain, difficulty breathing at rest, confusion, fainting","Call 911: can't breathe, chest pain not relieved, unresponsive","Keep medications list with you at all times","Have emergency contact numbers visible at home","Know your 'dry weight' â€” call if weight >2 kg above it"], category: "Safety", duration: "4 min" },
  { id: "exercise_in_hf", title: "Exercise and Heart Failure", content: "Regular exercise is safe and beneficial for most patients with stable HF. Cardiac rehabilitation programs provide supervised, structured exercise tailored to HF patients.", keyPoints: ["Exercise improves symptoms, quality of life, and may reduce hospitalizations","Start: 5-10 min walking, 3-5 days/week, build up slowly","Stop if: chest pain, severe SOB, extreme fatigue, dizziness","Aerobic: walking, cycling, swimming (low-impact)","Resistance: light weights, bands â€” avoid heavy lifting","Aim: 30 min moderate activity, most days (after stable)","Enroll in cardiac rehab if available â€” 20-35% down-arrow admissions"], category: "Lifestyle", duration: "5 min" },
  { id: "sleep_and_hf", title: "Sleep and Heart Failure â€” Sleep Apnea", content: "Up to 50% of HF patients have sleep-disordered breathing (central or obstructive sleep apnea). Untreated, it worsens HF, increases arrhythmias, and raises mortality.", keyPoints: ["Screen for OSA: snoring, witnessed apnea, daytime sleepiness, nocturia","Central sleep apnea (CSA) is common in advanced HF â€” Cheyne-Stokes","OSA: CPAP therapy improves BP and HF symptoms","CSA: adaptive servo-ventilation (ASV) â€” use with caution (SERVE-HF trial)","Sleep 7-9 hours â€” poor sleep raises BP and inflammation","Avoid alcohol, heavy meals, screens 1-2h before bed","Elevate head of bed â€” reduces orthopnea"], category: "Lifestyle", duration: "5 min" },
  { id: "hf_depression", title: "Heart Failure and Depression", content: "Depression affects 1 in 4 HF patients â€” double the general population rate. Depression worsens HF outcomes, increases hospitalizations, and reduces medication adherence.", keyPoints: ["Depression is a medical condition â€” NOT weakness or 'normal' in HF","Symptoms: persistent sadness, loss of interest, low energy, appetite changes","Depression in HF -> 2x higher mortality, 3x more hospitalizations","Safe antidepressants: SSRIs preferred (fluoxetine, sertraline, escitalopram)","Avoid TCAs (up-arrow arrhythmia risk in HF)","Talk therapy (CBT) is as effective as medication","Tell your doctor â€” screening is part of routine HF care"], category: "Mental Health", duration: "5 min" },
  { id: "eol_discussions", title: "Advanced Heart Failure â€” End-of-Life Discussions", content: "Advanced HF is a serious condition with a prognosis worse than many cancers. Discussing goals of care early allows patients to make informed decisions about their treatment.", keyPoints: ["Palliative care: symptom relief, quality of life â€” available with active HF treatment","Hospice: for patients with NYHA IV, frequent admissions, poor prognosis","Goals of care discussion: recommended for NYHA III-IV, 1+ HF admission in 6 months","Advance directives: document your wishes","Consider: ICD deactivation (if shocks in terminal phase)","Resources: HF specialist, palliative care, social worker, chaplain","Having the conversation does NOT mean giving up â€” it means planning ahead"], category: "Advanced Care", duration: "6 min" },
];

function calculateGDMTScore(meds: MedItem[], ef?: number): { score: number; max: number; details: string[] } {
  if (ef === undefined || ef >= 40) return { score: 0, max: 0, details: ["Not HFrEF â€” GDMT score not applicable"] };
  let score = 0;
  const details: string[] = [];
  const active = meds.filter(m => m.status === "active");
  const hasARNI = active.some(m => m.drugClass?.includes("ARNI"));
  const hasACEi = active.some(m => m.drugClass?.includes("ACE"));
  const hasARB = active.some(m => m.drugClass?.includes("ARB"));
  const hasRAAS = hasARNI || hasACEi || hasARB;
  if (hasRAAS) { score += 25; details.push((hasARNI ? "ARNI" : hasACEi ? "ACEi" : "ARB") + " (+25 pts)"); }
  const hasBB = active.some(m => m.drugClass?.includes("Beta"));
  if (hasBB) { score += 25; details.push("Beta-blocker (+25 pts)"); }
  const hasMRA = active.some(m => m.drugClass?.includes("MRA"));
  if (hasMRA) { score += 25; details.push("MRA (+25 pts)"); }
  const hasSGLT2 = active.some(m => m.drugClass?.includes("SGLT2"));
  if (hasSGLT2) { score += 25; details.push("SGLT2i (+25 pts)"); }
  return { score, max: 100, details };
}

export function generateHFAlerts(readings: HFReading[], medications: MedItem[] = [], adherencePct: number = 100, labOrders: LabTest[] = []): ScientificAlert[] {
  const alerts: ScientificAlert[] = [];
  if (!readings.length) return alerts;
  const latest = readings.at(-1)!;
  const last7 = readings.filter(r => { const d = new Date(); d.setDate(d.getDate() - 7); return r.recordedAt >= d; });
  const prev30 = readings.filter(r => { const d = new Date(); d.setDate(d.getDate() - 60); const d2 = new Date(); d2.setDate(d2.getDate() - 30); return r.recordedAt >= d && r.recordedAt < d2; });

  if (latest.bnp && latest.bnp > 1000) {
    alerts.push({ id: "bnp_critical", severity: "critical", category: "Hemodynamic Decompensation",
      title: "Critical BNP Elevation:  pg/mL",
      detail: "BNP markedly elevated (>1000 pg/mL) â€” high risk for decompensation. Assess for congestion, escalate diuretics.",
      evidence: "ESC 2021 HF Guidelines â€” BNP >1000 pg/mL predicts poor prognosis and need for advanced therapies",
      action: "URGENT: Clinical reassessment. Consider IV diuretics. Assess for inotrope/vasodilator need. Check for worsening renal function.",
      icon: "danger" });
  } else if (latest.bnp && latest.bnp > 400) {
    alerts.push({ id: "bnp_elevated", severity: "urgent", category: "BNP/NT-proBNP Elevated",
      title: "BNP Elevated:  pg/mL",
      detail: "BNP significantly elevated. May indicate worsening HF or inadequate decongestion.",
      evidence: "ESC 2021 â€” BNP >400 pg/mL indicates high HF hospitalization risk.",
      action: "Review volume status, adjust diuretics, consider up-titrating GDMT if tolerated.",
      icon: "warning" });
  }
  if (latest.ef !== undefined) {
    if (latest.ef < 35) {
      alerts.push({ id: "ef_critical", severity: "urgent", category: "Severely Reduced EF",
        title: "Severely Reduced EF: %",
        detail: "EF <35% â€” HIGHEST risk group. ICD candidate if >40 days post-MI and on GDMT. Must be on triple/quadruple therapy.",
        evidence: "ESC 2021: ICD recommended if EF <35% after 3 months GDMT. AHA/ACC 2022: Class I for quadruple therapy.",
        action: "Quadruple GDMT: ARNI/ACEi + BB + MRA + SGLT2i. Assess for ICD. Consider CRT if QRS >130ms.",
        icon: "heart" });
    } else if (latest.ef <= 40) {
      alerts.push({ id: "ef_mild", severity: "warning", category: "Mildly Reduced EF",
        title: "EF: % â€” Heart Failure with Mildly Reduced EF (HFmrEF)",
        detail: "EF 35-40%. Continue GDMT. Some trials suggest benefit of quadruple therapy extends to this range.",
        evidence: "ESC 2021: HFmrEF may benefit from GDMT. CHARM, TOPCAT: benefit in LVEF 35-45%.",
        action: "Continue ARNI/ACEi + BB + MRA. Consider SGLT2i. Optimize doses.",
        icon: "chart" });
    }
  }
  if (latest.nyhaClass && latest.nyhaClass >= 3) {
    alerts.push({ id: "nyha_worsening", severity: "urgent", category: "NYHA Class Worsening",
      title: "NYHA Class  â€” Symptomatic HF",
      detail: "Patient currently NYHA Class . NYHA III-IV associated with poor prognosis and high hospitalization rate.",
      evidence: "NYHA classification is a strong independent predictor of mortality in HF. ESC 2021: NYHA II-IV = GDMT indicated.",
      action: "Review GDMT optimization. Consider intensifying therapy. Assess for volume overload.",
      icon: "breath" });
  }
  if (latest.weight && readings.length >= 2) {
    const prev = readings.at(-2);
    if (prev && prev.weight && (latest.weight - prev.weight) > 2) {
      alerts.push({ id: "weight_gain", severity: "urgent", category: "Acute Weight Gain",
        title: "Significant Weight Gain: + kg",
        detail: "Weight increased >2kg since last visit. Likely fluid retention â€” early sign of decompensation.",
        evidence: "ESC 2021: Daily weight monitoring essential. >2kg in 1-2 days mandates clinical review.",
        action: "Increase diuretic dose. Assess for edema, JVP, pulmonary congestion.",
        icon: "weight" });
    }
  }
  if (last7.length >= 2 && prev30.length >= 2) {
    const avgBNP7 = Math.round(last7.reduce((a, r) => a + (r.bnp || 0), 0) / last7.filter(r => r.bnp).length);
    const avgBNP30 = Math.round(prev30.reduce((a, r) => a + (r.bnp || 0), 0) / prev30.filter(r => r.bnp).length);
    if (avgBNP7 && avgBNP30 && avgBNP7 > avgBNP30 * 1.5) {
      alerts.push({ id: "bnp_trend", severity: "warning", category: "Rising BNP Trend",
        title: "BNP Rising:  pg/mL (up % vs 30-day avg)",
        detail: "Rising BNP/NT-proBNP trend despite therapy. Suggests worsening hemodynamics.",
        evidence: "ESC 2021: Serial BNP monitoring is valuable. Rising BNP predicts HF events.",
        action: "Increase diuretics. Consider IV therapy if congestion. Reassess GDMT adherence.",
        icon: "trend" });
    }
  }
  const lastReadingDays = Math.floor((Date.now() - latest.recordedAt.getTime()) / 86400000);
  if (lastReadingDays >= 14) {
    alerts.push({ id: "no_readings", severity: "warning", category: "Monitoring Gap",
      title: "No HF Tracking Data for  Days",
      detail: "Missing weight/BNP/EF data. Regular monitoring is critical for HF management.",
      evidence: "ESC 2021: Regular monitoring of weight, symptoms, and labs reduces HF hospitalizations.",
      action: "Contact patient to resume tracking. Consider home monitoring or telemedicine.",
      icon: "gap" });
  }
  if (adherencePct < 50) {
    alerts.push({ id: "adherence_low", severity: "urgent", category: "Low Adherence",
      title: "Low Monitoring Adherence: %",
      detail: "Patient not tracking weight/BNP consistently. Poor self-monitoring correlates with higher HF hospitalization risk.",
      evidence: "ESC 2021: Self-monitoring is a Class I recommendation. HF patients who monitor daily have 35% fewer admissions.",
      action: "Counsel on importance of daily weight and symptom tracking.",
      icon: "calendar" });
  }

  const activeMeds = medications.filter(m => m.status === "active");
  const hasACEi = activeMeds.some(m => m.drugClass?.includes("ACE") || m.drugClass?.includes("ARB") || m.drugClass?.includes("ARNI"));
  const hasBB = activeMeds.some(m => m.drugClass?.includes("Beta"));
  const hasMRA = activeMeds.some(m => m.drugClass?.includes("MRA"));
  const hasSGLT2i = activeMeds.some(m => m.drugClass?.includes("SGLT2"));

  if (!hasACEi && !hasBB && !hasMRA && !hasSGLT2i && latest.ef !== undefined && latest.ef < 40) {
    alerts.push({ id: "no_gdmt", severity: "critical", category: "GDMT Not Initiated",
      title: "HFrEF â€” No Guideline-Directed Medical Therapy Initiated",
      detail: "Patient with reduced EF not on any GDMT. Class I recommendation for quadruple therapy.",
      evidence: "ESC 2021 / AHA/ACC 2022: Quadruple therapy is standard of care for HFrEF.",
      action: "START quadruple therapy: ARNI + BB + MRA + SGLT2i. Consider initial low doses and titrate.",
      icon: "danger" });
  }
  if (latest.ef !== undefined && latest.ef < 40) {
    if (!hasACEi) alerts.push({ id: "missing_ARNI", severity: "warning", category: "Missing ARNI/RAASi",
      title: "HFrEF â€” ARNI/ACEi Not Prescribed",
      detail: "Patient with reduced EF without ARNI or ACEi. ARNI is first-line, superior to ACEi (PARADIGM-HF).",
      evidence: "ESC 2021 Class I: ARNI recommended as first-line RAASi in HFrEF. PARADIGM-HF: 20% reduction.",
      action: "Initiate sacubitril/valsartan 24/26mg BD (if ACEi-naive) or switch from ACEi (36h washout).",
      icon: "med" });
    if (!hasBB) alerts.push({ id: "missing_BB", severity: "warning", category: "Missing Beta-Blocker",
      title: "HFrEF â€” Beta-Blocker Not Prescribed",
      detail: "Beta-blockers (bisoprolol, carvedilol, metoprolol succinate) reduce mortality 34% in HFrEF.",
      evidence: "CIBIS II: bisoprolol â†“ mortality 34%. COPERNICUS: carvedilol â†“ 35%. MERIT-HF: metoprolol â†“ 34%.",
      action: "Initiate BB: bisoprolol 1.25mg OD or carvedilol 3.125mg BD.",
      icon: "med" });
    if (!hasMRA) alerts.push({ id: "missing_MRA", severity: "warning", category: "Missing MRA",
      title: "HFrEF â€” MRA Not Prescribed",
      detail: "MRA (spironolactone/eplerenone) reduces mortality 30% in HFrEF. Class I recommendation for all NYHA II-IV.",
      evidence: "RALES: spironolactone â†“ mortality 30%. EMPHASIS-HF: eplerenone â†“ mortality/HF hosp 37%.",
      action: "Start spironolactone 12.5-25mg OD or eplerenone 25mg OD. Check K+ and Cr before and 1 week after.",
      icon: "med" });
    if (!hasSGLT2i) alerts.push({ id: "missing_SGLT2i", severity: "warning", category: "Missing SGLT2i",
      title: "HFrEF â€” SGLT2i Not Prescribed",
      detail: "SGLT2i (dapagliflozin/empagliflozin) reduces CV death/HF hospitalization 25% in HFrEF regardless of diabetes status.",
      evidence: "DAPA-HF: dapagliflozin â†“ worsening HF/CV death 26%. EMPEROR-Reduced: empagliflozin â†“ 25%.",
      action: "Start dapagliflozin 10mg OD or empagliflozin 10mg OD. No titration needed.",
      icon: "med" });
  }
  return alerts;
}

function exportNoteAsPDF(note: ClinicalNote, patientName: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Clinical Note â€” ' + patientName + '</title><style>body{font-family:Segoe UI,Arial,sans-serif;padding:40px;color:#111;background:#fff;max-width:800px;margin:0 auto}.header{border-bottom:3px solid #7c3aed;padding-bottom:16px;margin-bottom:24px}.logo{color:#7c3aed;font-size:22px;font-weight:800}.sub{color:#6b7280;font-size:12px;margin-top:4px}.patient{background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;border-left:4px solid #7c3aed}.section{margin-bottom:16px;page-break-inside:avoid}.section-title{color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;border-bottom:0.5px solid #e5e7eb;padding-bottom:4px}.section-content{font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap}.footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between}.badge{display:inline-block;padding:2px 8px;border-radius:4px;background:#f3e8ff;color:#7c3aed;font-size:11px;font-weight:600;margin-left:8px}@media print{body{padding:20px}.no-print{display:none}}</style></head><body><div class="header"><div class="logo">Heart AMEXAN Health System</div><div class="sub">Heart Failure Control Center â€” Clinical Note</div></div><div class="patient"><strong>Patient:</strong> ' + patientName + ' &nbsp;|&nbsp; <strong>Date:</strong> ' + note.date + ' &nbsp;|&nbsp; <strong>Visit Type:</strong> ' + (note.visitType ?? "Clinic Visit") + ' &nbsp;|&nbsp; <strong>Doctor:</strong> ' + (note.doctorName ?? "AMEXAN") + '<span class="badge">HF</span></div>' + (note.cc ? '<div class="section"><div class="section-title">Chief Complaint</div><div class="section-content">' + note.cc + '</div></div>' : "") + (note.hpi ? '<div class="section"><div class="section-title">History of Present Illness</div><div class="section-content">' + note.hpi + '</div></div>' : "") + (note.exam ? '<div class="section"><div class="section-title">Examination Findings</div><div class="section-content">' + note.exam + '</div></div>' : "") + (note.investigations ? '<div class="section"><div class="section-title">Investigations</div><div class="section-content">' + note.investigations + '</div></div>' : "") + (note.assessment ? '<div class="section"><div class="section-title">Assessment / Diagnosis</div><div class="section-content">' + note.assessment + '</div></div>' : "") + (note.plan ? '<div class="section"><div class="section-title">Management Plan</div><div class="section-content">' + note.plan + '</div></div>' : "") + (note.followUps?.length ? '<div class="section"><div class="section-title">Follow-up Instructions</div><div class="section-content">' + note.followUps.join("\n") + '</div></div>' : "") + '<div class="footer"><span>AMEXAN Health System Â· HF Monitoring</span><span>Generated: ' + new Date().toLocaleString() + '</span><span>Note ID: ' + (note.id ?? "â€”") + '</span></div><script>window.onload = function(){ window.print(); }</script></body></html>');
  w.document.close();
}

const COMPLICATIONS = ["Atrial Fibrillation","CKD (Stage 3a+)","Anemia of Chronic Disease","Type 2 Diabetes","Iron Deficiency","Sleep Apnea (OSA/CSA)","Depression","Cachexia/Sarcopenia","Cardiac Cirrhosis","CHF+COPD Overlap","Gout","CVA/TIA"];
const LIFESTYLE_ITEMS = ["Daily weight monitoring","Low sodium diet (<2g/day)","Fluid restriction (1.5-2L/day)","Regular exercise (30min, 5x/week)","Smoking cessation","Alcohol avoidance or <1 unit/day","Cardiac rehabilitation enrollment","Sleep hygiene (7-9 hrs)","HF self-care action plan","Vaccination (flu, pneumococcal, COVID-19)"];
const SPECIALTIES = ["Cardiology","Advanced HF / Transplant","Electrophysiology","Nephrology","Palliative Care / Hospice","Cardiac Rehabilitation","Dietitian / Nutrition","Sleep Medicine","Psychology / Psychiatry","Endocrinology (DM + HF)"];
const URGENCIES: string[] = ["routine","urgent","emergency"];
const VISIT_TYPES = ["new_patient","follow_up","emergency","telemedicine","home_visit","discharge_review","advanced_HF_review"];
const LAB_PANEL = ["BNP or NT-proBNP","Serum Potassium (K+)","Creatinine / eGFR","HbA1c (if DM)","Complete Blood Count (CBC)","Iron Studies (Fe, ferritin, TSAT)","TSH","LFTs","Uric Acid","Serum Magnesium","Lipid Panel","NT-proBNP trending"];
const IMAGING_PANEL = ["Echocardiogram (TTE) with LVEF","ECG (12-lead)","Chest X-Ray (cardiomegaly/fluid)","Holter Monitor (24h)","CMR (Cardiac MRI)","Stress Echo / Nuclear","Right Heart Catheterization","Coronary Angiography","Lung Ultrasound (B-lines)","CPET (Cardiopulmonary Exercise Test)"];
const DRUGS = ["Enalapril","Ramipril","Lisinopril","Trandolapril","Perindopril","Losartan","Valsartan","Candesartan","Sacubitril/Valsartan","Bisoprolol","Carvedilol","Metoprolol Succinate","Spironolactone","Eplerenone","Dapagliflozin","Empagliflozin","Furosemide","Bumetanide","Torsemide","Digoxin","Hydralazine/ISDN","Ivabradine","Vericiguat","Amiodarone","Warfarin","Apixaban","Rivaroxaban","Edoxaban"];
const FREQS = ["OD (Once daily)","BD (Twice daily)","TDS (Three times daily)","QDS (Four times daily)","Nocte (At bedtime)","PRN (As needed)","Weekly","Alternate days"];
const UNITS = ["mg","mcg","g","mL","mmol","L"];
const ROUTES_LIST = ["Oral","Sublingual","IV","IM","SC","Topical","Transdermal","Inhaled"];

const T = {
  bg: "#f9fafb", card: "#ffffff", border: "rgba(0,0,0,0.08)",
  text: "#111827", muted: "#6b7280", faint: "#9ca3af",
  danger: "#dc2626", info: "#2563eb", success: "#059669", warn: "#d97706", purple: "#7c3aed",
  teal: "#0891b2", orange: "#ea580c", pink: "#db2777",
} as const;

const CHANGE_COLORS: Record<DoseChangeItem["changeType"], { bg: string; color: string; label: string }> = {
  started: { bg: "#f0fdf4", color: "#059669", label: "Started" },
  dose_increase: { bg: "#fff7ed", color: "#d97706", label: "up Arrow Dose Increased" },
  dose_decrease: { bg: "#eff6ff", color: "#2563eb", label: "down Arrow Dose Decreased" },
  stopped: { bg: "#fef2f2", color: "#dc2626", label: "Stopped" },
  paused: { bg: "#fefce8", color: "#ca8a04", label: "Paused" },
  restarted: { bg: "#f0fdfa", color: "#0891b2", label: "Restarted" },
};

const GLOBAL_CSS = `
  .hf-root*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  .hf-root{font-family:'DM Sans','Plus Jakarta Sans','Segoe UI',system-ui,sans-serif}
  @keyframes hf-pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes hf-fade-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .hf-fade{animation:hf-fade-in 0.18s ease}
  .hf-scroll{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.12) transparent}
  .hf-scroll::-webkit-scrollbar{width:4px;height:4px}
  .hf-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}
  .hf-btn-press{transition:transform 0.1s,opacity 0.1s}
  .hf-btn-press:active{transform:scale(0.97);opacity:0.85}
  @media(max-width:640px){
    .hf-wa-track{display:none!important}
    .hf-desktop-layout{display:none!important}
    .hf-page-header{display:none!important}
    .hf-root{position:fixed!important;inset:0!important;overflow:hidden!important;padding:0!important;display:flex!important;flex-direction:column!important}
    .hf-mobile-list{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow-y:auto!important;background:#fff!important}
    .hf-mobile-list.hidden{display:none!important}
    .hf-mobile-detail{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#f9fafb!important}
    .hf-mobile-detail.hidden{display:none!important}
    .hf-list-topbar{position:sticky!important;top:0!important;z-index:20!important;background:linear-gradient(135deg,#7c3aed,#6d28d9)!important;color:#fff!important;padding:14px 16px 10px!important;min-height:56px!important;flex-shrink:0!important}
    .hf-list-topbar h2{color:#fff!important;font-size:17px!important;margin:0!important;font-weight:800}
    .hf-list-topbar p{color:rgba(255,255,255,.75)!important;font-size:11px!important;margin:2px 0 0!important}
    .hf-list-search{padding:8px 12px!important;background:#f9fafb!important;position:sticky!important;top:56px!important;z-index:9!important;border-bottom:0.5px solid rgba(0,0,0,.07)!important;flex-shrink:0!important}
    .hf-list-search input{width:100%!important;border-radius:20px!important;padding:8px 14px!important;border:none!important;background:#ececec!important;font-size:14px!important;outline:none!important;font-family:inherit!important}
    .hf-patient-btn{width:100%!important;display:flex!important;align-items:center!important;gap:12px!important;padding:12px 16px!important;border:none!important;border-bottom:.5px solid rgba(0,0,0,.07)!important;background:#fff!important;cursor:pointer!important;text-align:left!important;min-height:64px!important}
    .hf-patient-btn:active,.hf-patient-btn.active-row{background:#f5f3ff!important}
    .hf-patient-avatar{width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(124,58,237,.12)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:19px!important;font-weight:800!important;color:#7c3aed!important;flex-shrink:0!important}
    .hf-patient-row-info{flex:1!important;min-width:0!important}
    .hf-patient-row-name{font-weight:600;font-size:14px;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hf-patient-row-sub{font-size:11px;color:#9ca3af;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hf-patient-row-bp{text-align:right;flex-shrink:0}
    .hf-patient-mini-header{display:none!important}
    .hf-detail-topbar{position:sticky!important;top:0!important;z-index:20!important;background:linear-gradient(135deg,#7c3aed,#6d28d9)!important;padding:10px 14px!important;display:flex!important;align-items:center!important;gap:10px!important;min-height:56px!important;flex-shrink:0!important}
    .hf-back-btn{background:none!important;border:none!important;color:#fff!important;font-size:28px!important;cursor:pointer!important;padding:0 8px 0 0!important;flex-shrink:0!important;line-height:1!important}
    .hf-detail-topbar-avatar{width:36px!important;height:36px!important;border-radius:50%!important;background:rgba(255,255,255,.25)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:800!important;font-size:16px!important;flex-shrink:0!important;color:#fff!important}
    .hf-detail-topbar-info{flex:1!important;min-width:0!important;overflow:hidden!important}
    .hf-detail-topbar-name{font-weight:700;font-size:15px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .hf-detail-topbar-sub{font-size:11px;color:rgba(255,255,255,.8)}
    .hf-detail-topbar-ef{background:rgba(255,255,255,.2);border-radius:8px;padding:4px 9px;text-align:center;flex-shrink:0;border:"0.5px solid " + T.border rgba(255,255,255,.3)}
    .hf-detail-content{flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;padding:10px 10px 100px!important;-webkit-overflow-scrolling:touch!important;width:100%!important}
    .hf-stat-row{gap:5px!important;flex-wrap:wrap!important}
    .hf-stat-card{min-width:65px!important;padding:7px 7px!important;flex:1!important}
    .hf-stat-card .sv{font-size:14px!important}
    .hf-tabs-wrap{position:sticky!important;top:56px!important;z-index:15!important;background:#fff!important;border-bottom:.5px solid rgba(0,0,0,.08)!important;flex-shrink:0!important;width:100%!important}
    .hf-tabs{display:flex!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;flex-wrap:nowrap!important;padding:4px 8px!important;gap:2px!important;background:#fff!important;border-radius:0!important;border:none!important;margin-bottom:0!important;width:100%!important}
    .hf-tabs::-webkit-scrollbar{display:none!important}
    .hf-tab-btn{font-size:10px!important;padding:5px 8px!important;white-space:nowrap!important;min-height:32px!important}
    .hf-panel{padding:12px!important;border-radius:10px!important;overflow-x:hidden!important}
    .hf-med-edit-row{flex-direction:column!important}
    .hf-comp-grid{grid-template-columns:1fr 1fr!important}
    .hf-note-grid{grid-template-columns:1fr!important}
    .hf-labs-grid{grid-template-columns:1fr!important}
    .hf-ref-grid{grid-template-columns:1fr!important}
    .hf-adh-box{width:22px!important;height:22px!important;font-size:9px!important}
    .hf-detail-content *{max-width:100%!important}
    table{display:block!important;overflow-x:auto!important;width:100%!important}
  }
  @media(min-width:641px) and (max-width:1023px){
    .hf-wa-track{display:none!important}
    .hf-mobile-list,.hf-mobile-detail{display:none!important}
    .hf-desktop-layout{display:flex!important}
    .hf-patient-list{width:240px!important;flex-shrink:0!important}
    .hf-tabs{flex-wrap:wrap!important}
    .hf-tab-btn{font-size:11px!important}
    .hf-note-grid{grid-template-columns:1fr 1fr!important}
    .hf-labs-grid{grid-template-columns:1fr 1fr!important}
    .hf-ref-grid{grid-template-columns:1fr 1fr!important}
    .hf-comp-grid{grid-template-columns:1fr 1fr 1fr!important}
  }
  @media(min-width:1024px){
    .hf-wa-track{display:none!important}
    .hf-mobile-list,.hf-mobile-detail{display:none!important}
    .hf-desktop-layout{display:flex!important}
    .hf-patient-list{width:290px!important;flex-shrink:0!important}
    .hf-note-grid{grid-template-columns:1fr 1fr!important}
    .hf-labs-grid{grid-template-columns:1fr 1fr!important}
    .hf-ref-grid{grid-template-columns:1fr 1fr!important}
    .hf-comp-grid{grid-template-columns:1fr 1fr 1fr!important}
  }
`;

function Dot({ color }: { color: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}
function SectHeader({ label, color, sub }: { label: string; color: string; sub?: string }) {
  return (
    <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
      <Dot color={color} />{label}
      {sub && <span style={{ fontSize: 9, color: T.faint, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>Â· {sub}</span>}
    </div>
  );
}
function Badge({ text, color, bg, border }: { text: string; color: string; bg: string; border: string }) {
  return <span style={{ padding: "2px 7px", borderRadius: 5, background: bg, color, border: "0.5px solid " + border, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>;
}
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="hf-stat-card" style={{ background: T.bg, border: "0.5px solid " + T.border, borderTop: "2px solid " + (color ?? T.border) , borderRadius: 10, padding: "10px 13px", flex: 1, minWidth: 90 }}>
      <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div className="sv" style={{ color: color ?? T.text, fontSize: 18, fontWeight: 800, lineHeight: 1.1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ color: T.faint, fontSize: 10 }}>{sub}</div>}
    </div>
  );
}
function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={"hf-panel hf-fade" + (className ? " " + className : "")} style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 14, padding: "16px 18px", ...style }}>{children}</div>;
}
function Skeleton({ height = 200 }: { height?: number }) {
  return <div style={{ height, background: T.bg, borderRadius: 10, border: "0.5px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.faint, fontSize: 13 }}><span style={{ animation: "hf-pulse 1.4s ease-in-out infinite" }}>Loading...</span></div>;
}
function Btn({ label, variant = "default", onClick, fullWidth, small, icon, disabled }: {
  label: string; variant?: "default"|"primary"|"success"|"warn"|"danger"|"info";
  onClick?: () => void; fullWidth?: boolean; small?: boolean; icon?: string; disabled?: boolean;
}) {
  const s: Record<string, React.CSSProperties> = {
    default: { background: "transparent", color: T.muted, border: "0.5px solid " + T.border },
    primary: { background: T.purple, color: "#fff", border: "1px solid " + T.purple },
    success: { background: T.success, color: "#fff", border: "1px solid " + T.success },
    warn:    { background: "#fff7ed", color: T.warn, border: "0.5px solid " + T.warn },
    danger:  { background: "#fef2f2", color: T.danger, border: "0.5px solid " + T.danger },
    info:    { background: "#eff6ff", color: T.info, border: "0.5px solid " + T.info },
  };
  return (
    <button onClick={onClick} disabled={disabled} className="hf-btn-press" style={{
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
        style={{ width: "100%", background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
    </div>
  );
}
function SelField({ label, value, onChange, options }: { label?: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      {label && <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", fontFamily: "inherit", width: "100%", appearance: "none" }}>
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
        style={{ width: "100%", background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
    </div>
  );
}

const NYHA_LABELS: Record<number, string> = { 1: "I â€” No limitation", 2: "II â€” Slight limitation", 3: "III â€” Marked limitation", 4: "IV â€” Unable â€” symptoms at rest" };
const NYHA_COLORS: Record<number, string> = { 1: T.success, 2: T.teal, 3: T.warn, 4: T.danger };

function NYHATab({ readings }: { readings: HFReading[] }) {
  const nyhaReadings = useMemo(() => readings.filter(r => r.nyhaClass !== undefined).sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()), [readings]);
  if (!nyhaReadings.length) return <div style={{ textAlign: "center", padding: "24px 0", color: T.faint, fontSize: 13 }}>No NYHA Class data recorded yet.</div>;
  return (
    <div>
      <SectHeader label="NYHA Functional Class Tracking" color={T.teal} sub={nyhaReadings.length + " entries"} />
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {nyhaReadings.slice(-10).reverse().map((r, i) => (
          <div key={i} style={{ flex: 1, minWidth: 70, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 10, padding: "9px 11px", textAlign: "center", borderTop: "3px solid " + NYHA_COLORS[r.nyhaClass!] }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: NYHA_COLORS[r.nyhaClass!] }}>{r.nyhaClass}</div>
            <div style={{ fontSize: 10, color: T.faint }}>{r.recordedAt.toLocaleDateString()}</div>
            <div style={{ fontSize: 9, color: NYHA_COLORS[r.nyhaClass!], fontWeight: 600 }}>{NYHA_LABELS[r.nyhaClass!].split(" â€” ")[0]}</div>
          </div>
        ))}
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: "10px 14px", border: "0.5px solid " + T.border }}>
        {([1,2,3,4] as const).map(n => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: n < 4 ? "0.5px solid " + T.border : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: NYHA_COLORS[n] + "20", border: "2px solid " + NYHA_COLORS[n], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: NYHA_COLORS[n], flexShrink: 0 }}>{n}</div>
            <div style={{ fontSize: 12, color: T.text }}>{NYHA_LABELS[n]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EFTab({ readings }: { readings: HFReading[] }) {
  const efReadings = useMemo(() => readings.filter(r => r.ef !== undefined).sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()), [readings]);
  if (!efReadings.length) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>ðŸ«€</div>
      <div style={{ color: T.muted, fontSize: 13 }}>No EF readings recorded yet.</div>
    </div>
  );
  return (
    <div>
      <SectHeader label="LV Ejection Fraction (EF) Trend" color={T.purple} />
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {efReadings.map((r, i) => {
          const ef = r.ef!;
          const zone = ef < 35 ? T.danger : ef <= 40 ? T.warn : ef <= 50 ? T.info : T.success;
          const zoneLabel = ef < 35 ? "Severe" : ef <= 40 ? "Moderate" : ef <= 50 ? "Mild" : "Normal";
          return (
            <div key={i} style={{ flex: 1, minWidth: 80, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 10, padding: "10px 12px", textAlign: "center", borderTop: "3px solid " + zone }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: zone }}>{ef}%</div>
              <div style={{ fontSize: 10, color: T.faint }}>{r.recordedAt.toLocaleDateString()}</div>
              <Badge text={zoneLabel} color={zone} bg={zone + "18"} border={zone + "40"} />
            </div>
          );
        })}
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: "10px 14px", border: "0.5px solid " + T.border }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 6 }}>EF Zone Reference</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[{ range: "<35%", label: "Severe", color: T.danger }, { range: "35-40%", label: "Moderate", color: T.warn }, { range: "40-50%", label: "Mild", color: T.info }, { range: ">50%", label: "Normal/HFpEF", color: T.success }].map(z => (
            <div key={z.range} style={{ flex: 1, minWidth: 70, textAlign: "center", background: z.color + "12", borderRadius: 8, padding: "6px 8px", border: "0.5px solid " + z.color + "30" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: z.color }}>{z.range}</div>
              <div style={{ fontSize: 10, color: z.color }}>{z.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BNPWeightTab({ readings }: { readings: HFReading[] }) {
  const chartData = useMemo(() => readings.filter(r => r.bnp !== undefined || r.weight !== undefined).sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()), [readings]);
  if (!chartData.length) return <div style={{ textAlign: "center", padding: "24px 0" }}><div style={{ fontSize: 36, marginBottom: 8 }}>ðŸ“Š</div><div style={{ color: T.faint, fontSize: 13 }}>No BNP or weight data yet.</div></div>;
  const latestBNP = chartData.filter(r => r.bnp).at(-1)?.bnp;
  const latestWeight = chartData.filter(r => r.weight).at(-1)?.weight;
  return (
    <div>
      <SectHeader label="BNP/NT-proBNP & Weight" color={T.info} />
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {chartData.map((r, i) => (
          <div key={i} style={{ flex: 1, minWidth: 100, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 10, padding: "9px 11px" }}>
            <div style={{ fontSize: 10, color: T.faint, marginBottom: 4 }}>{r.recordedAt.toLocaleDateString()}</div>
            {r.bnp !== undefined && <div><span style={{ color: r.bnp > 1000 ? T.danger : r.bnp > 400 ? T.warn : T.teal, fontWeight: 700, fontSize: 15 }}>{r.bnp}</span><span style={{ color: T.faint, fontSize: 10 }}> pg/mL BNP</span></div>}
            {r.weight !== undefined && <div><span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{r.weight}</span><span style={{ color: T.faint, fontSize: 10 }}> kg</span></div>}
            {r.nyhaClass !== undefined && <Badge text={"NYHA " + r.nyhaClass} color={NYHA_COLORS[r.nyhaClass]} bg={NYHA_COLORS[r.nyhaClass] + "18"} border={NYHA_COLORS[r.nyhaClass] + "40"} />}
          </div>
        ))}
      </div>
      {latestBNP !== undefined && (
        <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", border: "0.5px solid #bfdbfe", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, color: T.info, fontSize: 12, marginBottom: 4 }}>Latest BNP: {latestBNP} pg/mL</div>
          <div style={{ fontSize: 11, color: T.muted }}>{latestBNP < 100 ? "Excellent control â€” low risk" : latestBNP < 400 ? "Mild elevation" : latestBNP < 1000 ? "Moderate elevation â€” monitor" : "High risk â€” escalate therapy"}</div>
        </div>
      )}
      {latestWeight !== undefined && (
        <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", border: "0.5px solid #86efac" }}>
          <div style={{ fontWeight: 700, color: T.success, fontSize: 12, marginBottom: 4 }}>Dry Weight: {latestWeight} kg</div>
          <div style={{ fontSize: 11, color: T.muted }}>Monitor daily - call if weight increases {'>'}2 kg over 1-2 days.</div>
        </div>
      )}
    </div>
  );
}

function PharmaCard({ drug, patient, onUpdate }: {
  drug: DrugInfo; patient: PatientData; onUpdate: (med: Medication) => void;
}) {
  const med = patient.medications.find(m => m.name === drug.name);
  const active = med?.active ?? false;
  const dose = med?.dose ?? "";
  const freq = med?.frequency ?? "";
  const notes = med?.notes ?? "";
  const target = drug.targetDose;
  const atTarget = active && target !== undefined && dose !== "" && target !== "variable";
  const optimal = target === undefined || target === "variable";
  const pct = atTarget && target !== "variable" && !isNaN(parseInt(dose)) && !isNaN(parseInt(target as string)) ? Math.round((parseInt(dose) / parseInt(target as string)) * 100) : 0;
  return (
    <Card style={{ borderLeft: "3px solid " + (active ? drug.color : T.border), opacity: active ? 1 : 0.55 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: drug.color }}>{drug.emoji}</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{drug.name}</span>
          <Badge text={drug.class ?? ""} color={drug.color} bg={drug.color + "16"} border={drug.color + "35"} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, cursor: "pointer", color: T.muted }}>
          <input type="checkbox" checked={active} onChange={e => onUpdate({ ...med || { name: drug.name, dose: "", frequency: "", notes: "" }, active: e.target.checked, name: drug.name })} style={{ accentColor: drug.color }} />
          {active ? "Active" : "Inactive"}
        </label>
      </div>
      {active && (
        <div className="hf-med-edit-row" style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <InpField value={dose} onChange={v => onUpdate({ ...med || { name: drug.name, active: true, frequency: "", notes: "" }, dose: v, name: drug.name })} placeholder={"Target: " + (target ?? "titrate")} label="Dose" />
          <InpField value={freq} onChange={v => onUpdate({ ...med || { name: drug.name, active: true, dose: "", notes: "" }, frequency: v, name: drug.name })} placeholder="e.g. BID" label="Freq" />
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: active ? 6 : 0 }}>
        {drug.indications.slice(0, 2).map(ind => <Badge key={ind} text={ind} color={drug.color} bg={drug.color + "12"} border={drug.color + "25"} />)}
      </div>
      {active && (
        <TextArea value={notes} onChange={v => onUpdate({ ...med || { name: drug.name, active: true, dose, frequency: freq }, notes: v, name: drug.name })} placeholder="Notes (recent titration, side effectsâ€¦)" rows={1} />
      )}
      {active && !optimal && target !== "variable" && (
        <div style={{ marginTop: 6, background: T.bg, borderRadius: 6, padding: "6px 10px", border: "0.5px solid " + T.border }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: T.faint }}>Target: {target}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: pct >= 100 ? T.success : T.warn }}>{pct}% of target</span>
          </div>
          <div style={{ width: "100%", height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: Math.min(pct, 100) + "%", height: "100%", background: pct >= 100 ? T.success : T.warn, borderRadius: 2, transition: "width 0.4s" }} />
          </div>
        </div>
      )}
    </Card>
  );
}

function AdherenceCalendar({ adherence, color, onToggle }: {
  adherence: AdherenceEntry[]; color: string; onToggle: (date: string, taken: boolean) => void;
}) {
  const today = new Date();
  const days: Date[] = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); days.push(d); }
  return (
    <div>
      <div style={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        {days.map(d => {
          const key = d.toISOString().slice(0, 10);
          const entry = adherence.find(a => a.date === key);
          const taken = entry?.taken;
          return (
            <button key={key} onClick={() => onToggle(key, !taken)}
              className="hf-adh-box" title={key + ": " + (taken ? "Taken" : "Not recorded")}
              style={{ width: 28, height: 28, border: "none", borderRadius: 6, background: taken ? color : T.border, cursor: "pointer", color: taken ? "#fff" : T.faint, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: T.faint }}>
        {adherence.filter(a => a.taken).length}/{days.length} days
      </div>
    </div>
  );
}

function MedicationsTab({ patient, setPatient }: { patient: PatientData; setPatient: (p: PatientData) => void }) {
  const [filter, setFilter] = useState("all");
  const drugs = useMemo(() => {
    const list = Object.values(PHARMA_DB).flat();
    return filter === "all" ? list : filter === "active" ? list.filter(d => patient.medications.find(m => m.name === d.name)?.active) : list.filter(d => d.class === filter);
  }, [filter, patient.medications]);
  const classes = useMemo(() => [...new Set(Object.values(PHARMA_DB).flat().map(d => d.class).filter(Boolean))] as string[], []);
  const onUpdate = (med: Medication) => {
    const others = patient.medications.filter(m => m.name !== med.name);
    setPatient({ ...patient, medications: [...others, med] });
  };
  return (
    <div>
      <SectHeader label="GDMT Medications" color={T.purple} sub={patient.medications.filter(m => m.active).length + " active"} />
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        <Btn label="All" variant={filter === "all" ? "primary" : "default"} small onClick={() => setFilter("all")} />
        <Btn label="Active" variant={filter === "active" ? "primary" : "default"} small onClick={() => setFilter("active")} />
        {classes.map(c => <Btn key={c} label={c} variant={filter === c ? "primary" : "default"} small onClick={() => setFilter(c as string)} />)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {drugs.map(d => <PharmaCard key={d.name} drug={d} patient={patient} onUpdate={onUpdate} />)}
      </div>
    </div>
  );
}

function AdherenceTab({ patient, setPatient }: { patient: PatientData; setPatient: (p: PatientData) => void }) {
  const [showAll, setShowAll] = useState(false);
  const activeMeds = patient.medications.filter(m => m.active);
  return (
    <div>
      <SectHeader label="Medication Adherence" color={T.success} sub={Math.round((patient.adherence.filter(a => a.taken).length / Math.max(patient.adherence.length, 1)) * 100) + "% overall"} />
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>14-Day Tracker</span>
          <Btn label={showAll ? "Less" : "All Meds"} variant="default" small onClick={() => setShowAll(!showAll)} />
        </div>
        {(showAll ? activeMeds : activeMeds.slice(0, 1)).map((med, i) => {
          const color = Object.values(PHARMA_DB).flat().find(d => d.name === med.name)?.color ?? T.purple;
          return (
            <div key={i} style={{ marginBottom: showAll ? 8 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 4 }}>{med.name}</div>
              <AdherenceCalendar
                adherence={patient.adherence.filter(a => a.medicationName === med.name)}
                color={color}
                onToggle={(date, taken) => {
                  const existing = patient.adherence.findIndex(a => a.date === date && a.medicationName === med.name);
                  let updated: AdherenceEntry[];
                  if (existing >= 0) {
                    updated = [...patient.adherence];
                    updated[existing] = { ...updated[existing], taken };
                  } else {
                    updated = [...patient.adherence, { date, taken, medicationName: med.name }];
                  }
                  setPatient({ ...patient, adherence: updated });
                }}
              />
            </div>
          );
        })}
      </Card>
      <Card style={{ background: T.bg }}>
        <SectHeader label="Adherence Tips" color={T.faint} />
        <ul style={{ margin: 0, padding: "0 0 0 16px", color: T.muted, fontSize: 11, lineHeight: 1.7 }}>
          <li>Use a pill organizer â€” reduces missed doses by up to 50%</li>
          <li>Set a daily alarm for medication timing</li>
          <li>Pair meds with a daily habit (e.g. brushing teeth)</li>
          <li>Keep a medication log â€” bring to every visit</li>
          <li>Use a single pharmacy for all prescriptions</li>
        </ul>
      </Card>
    </div>
  );
}

function AlertsTab({ alerts, readings }: { alerts: HFAlert[]; readings: HFReading[] }) {
  const [resolved, setResolved] = useState<string[]>([]);
  const activeAlerts = useMemo(() => {
    const all = [...alerts, ...generateHFAlerts(readings)];
    return all.filter(a => !resolved.includes(a.id)).sort((a, b) => a.severity === "critical" ? -1 : a.severity === "warning" ? -1 : 1);
  }, [alerts, readings, resolved]);
  const critical = activeAlerts.filter(a => a.severity === "critical").length;
  const warning = activeAlerts.filter(a => a.severity === "warning").length;
  if (!activeAlerts.length) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>âœ…</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: T.success, marginBottom: 4 }}>No Active Alerts</div>
      <div style={{ color: T.faint, fontSize: 12 }}>All clinical parameters are within range.</div>
    </div>
  );
  return (
    <div>
      <SectHeader label="Clinical Alerts & Notifications" color={critical > 0 ? T.danger : T.warn} sub={critical + " critical / " + warning + " warnings"} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {activeAlerts.map(a => {
          const colors = a.severity === "critical" ? { bg: "#fef2f2", border: "#fecaca", text: T.danger } : a.severity === "warning" ? { bg: "#fff7ed", border: "#fed7aa", text: T.warn } : { bg: "#eff6ff", border: "#bfdbfe", text: T.info };
          return (
            <div key={a.id} style={{ flex: 1, minWidth: 200, background: colors.bg, border: "0.5px solid " + colors.border, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <Badge text={a.severity.toUpperCase()} color={colors.text} bg={colors.text + "18"} border={colors.text + "40"} />
                <button onClick={() => setResolved([...resolved, a.id])} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, fontSize: 14, padding: 0, lineHeight: 1 }}>âœ•</button>
              </div>
              <div style={{ fontWeight: 600, color: T.text, fontSize: 12, marginBottom: 2 }}>{(a as any).message || (a as any).title}</div>
              <div style={{ fontSize: 10, color: T.faint }}>{((a as any).timestamp || new Date()).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ComplicationOptions = [
  "HF hospitalization", "Atrial fibrillation", "CKD progression", "Hypotension",
  "Hyperkalemia", "Hypokalemia", "Bradycardia", "Dizziness/Falls",
  "Worsening edema", "Pleural effusion", "Cardiorenal syndrome", "Liver congestion",
];
function ComplicationsTab({ patient, setPatient }: { patient: PatientData; setPatient: (p: PatientData) => void }) {
  const [newComp, setNewComp] = useState("");
  const add = () => { if (newComp && !patient.complications.includes(newComp)) { setPatient({ ...patient, complications: [...patient.complications, newComp] }); setNewComp(""); } };
  const remove = (item: string) => setPatient({ ...patient, complications: patient.complications.filter(c => c !== item) });
  return (
    <div>
      <SectHeader label="Complications & Comorbidities" color={T.danger} sub={patient.complications.length + " recorded"} />
      <div className="hf-comp-grid" style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        {patient.complications.map((c, i) => (
          <div key={i} style={{ background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <span style={{ fontSize: 12, color: T.text }}>{c}</span>
            <button onClick={() => remove(c)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer", fontSize: 14, padding: 0, flexShrink: 0, lineHeight: 1 }}>âœ•</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
        <select value={newComp} onChange={e => setNewComp(e.target.value)} style={{ flex: 1, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, fontFamily: "inherit" }}>
          <option value="">Select complication...</option>
          {ComplicationOptions.filter(c => !patient.complications.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Btn label="Add" variant="primary" small onClick={add} />
      </div>
    </div>
  );
}

const HF_LIFESTYLE = [
  { icon: "ðŸ§‚", label: "Low Sodium Diet", detail: "<2,000 mg/day â€” avoid processed foods, canned soups", color: T.warn },
  { icon: "âš–ï¸", label: "Daily Weight", detail: "Same time, same scale, after voiding, before eating", color: T.info },
  { icon: "ðŸ’§", label: "Fluid Restriction", detail: "1.5-2 L/day if moderate-to-severe HF", color: T.teal },
  { icon: "ðŸš¬", label: "Smoking Cessation", detail: "Strongly advised â€” major CV risk factor", color: T.danger },
  { icon: "ðŸƒ", label: "Exercise", detail: "30 min moderate activity, 5 days/week as tolerated", color: T.success },
  { icon: "ðŸ›Œ", label: "Sleep & CPAP", detail: "Screen for sleep apnea â€” treat with CPAP if positive", color: T.purple },
  { icon: "ðŸ’‰", label: "Vaccinations", detail: "Annual flu, pneumococcal, COVID-19, RSV if eligible", color: T.info },
  { icon: "ðŸº", label: "Limit Alcohol", detail: "Avoid or minimal â€” can worsen HF", color: T.warn },
];
function LifestyleTab() {
  return (
    <div>
      <SectHeader label="Lifestyle & Self-Care" color={T.success} sub="HF Self-Care Guidelines" />
      <div className="hf-comp-grid" style={{ display: "grid", gap: 6 }}>
        {HF_LIFESTYLE.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 10, padding: "10px 12px", alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: T.text, marginBottom: 1 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HospitalizationTab({ patient, setPatient }: { patient: PatientData; setPatient: (p: PatientData) => void }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const addHosp = () => {
    if (!startDate || !reason) return;
    const h: Hospitalization = { startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : undefined, reason };
    setPatient({ ...patient, hospitalizations: [...patient.hospitalizations, h] });
    setStartDate(""); setEndDate(""); setReason("");
  };
  return (
    <div>
      <SectHeader label="Hospitalization History" color={T.danger} sub={patient.hospitalizations.length + " admissions"} />
      {patient.hospitalizations.length === 0 && <div style={{ textAlign: "center", padding: "16px 0", color: T.faint, fontSize: 12 }}>No hospitalizations recorded.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {patient.hospitalizations.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()).map((h, i) => (
          <div key={i} style={{ background: T.bg, border: "0.5px solid " + T.border, borderLeft: "3px solid " + T.danger, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: T.text, marginBottom: 2 }}>{h.reason}</div>
            <div style={{ fontSize: 11, color: T.faint }}>{h.startDate.toLocaleDateString()}{h.endDate ? " â€“ " + h.endDate.toLocaleDateString() : " â€“ Present"}</div>
          </div>
        ))}
      </div>
      <Card>
        <SectHeader label="Add Hospitalization" color={T.faint} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <InpField type="date" value={startDate} onChange={setStartDate} label="Start" />
            <InpField type="date" value={endDate} onChange={setEndDate} label="End (optional)" />
          </div>
          <SelField value={reason} onChange={setReason} options={["Acute decompensated HF", "Pulmonary edema", "Cardiogenic shock", "Arrhythmia (AFib/VT)", "Volume overload", "Chest pain / ACS", "Syncope", "Other"]} label="Reason" />
          <Btn label="Add Hospitalization" variant="danger" fullWidth onClick={addHosp} />
        </div>
      </Card>
    </div>
  );
}

function LabsTab({ patient, setPatient }: { patient: PatientData; setPatient: (p: PatientData) => void }) {
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newDate, setNewDate] = useState("");
  const addLab = () => {
    if (!newName || !newValue) return;
    const lab: LabResult = { name: newName, value: newValue, unit: newUnit, date: newDate ? new Date(newDate) : new Date() };
    setPatient({ ...patient, labs: [...patient.labs, lab] });
    setNewName(""); setNewValue(""); setNewUnit(""); setNewDate("");
  };
  return (
    <div>
      <SectHeader label="Lab Results" color={T.info} sub={patient.labs.length + " results"} />
      {patient.labs.length > 0 && (
        <div className="hf-labs-grid" style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          {patient.labs.sort((a, b) => b.date.getTime() - a.date.getTime()).map((lab, i) => (
            <div key={i} style={{ background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "9px 11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12, color: T.text }}>{lab.name}</div>
                <div style={{ fontSize: 10, color: T.faint }}>{lab.date.toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{lab.value}</span>
                {lab.unit && <span style={{ fontSize: 10, color: T.faint }}> {lab.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Card>
        <SectHeader label="Quick Add Lab" color={T.faint} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <SelField value={newName} onChange={setNewName} options={["", "BNP", "NT-proBNP", "Creatinine", "eGFR", "Potassium", "Sodium", "Hemoglobin", "HbA1c", "TSH", "Ferritin", "LDL", "HDL", "Triglycerides", "ALT", "AST"]} label="Test" />
            <InpField value={newValue} onChange={setNewValue} placeholder="Value" label="Value" />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <InpField value={newUnit} onChange={setNewUnit} placeholder="Unit (pg/mL, mg/dLâ€¦)" label="Unit" />
            <InpField type="date" value={newDate} onChange={setNewDate} label="Date" />
          </div>
          <Btn label="Add Lab" variant="info" fullWidth onClick={addLab} />
        </div>
      </Card>
    </div>
  );
}

function NotesTab({ patient, setPatient }: { patient: PatientData; setPatient: (p: PatientData) => void }) {
  const [noteText, setNoteText] = useState("");
  const addNote = () => {
    if (!noteText.trim()) return;
    setPatient({ ...patient, notes: [...patient.notes, { text: noteText.trim(), timestamp: new Date() }] });
    setNoteText("");
  };
  return (
    <div>
      <SectHeader label="Clinical Notes" color={T.teal} sub={patient.notes.length + " notes"} />
      <Card style={{ marginBottom: 12 }}>
        <TextArea value={noteText} onChange={setNoteText} placeholder="Write a clinical noteâ€¦" rows={3} />
        <div style={{ marginTop: 6 }}><Btn label="Add Note" variant="primary" fullWidth onClick={addNote} /></div>
      </Card>
      <div className="hf-note-grid" style={{ display: "grid", gap: 6 }}>
        {patient.notes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((n, i) => (
          <div key={i} style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, marginBottom: 4, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{n.text}</div>
            <div style={{ fontSize: 10, color: T.faint }}>{n.timestamp.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineTab({ patient }: { patient: PatientData }) {
  const events: { date: Date; text: string; color: string; icon: string }[] = [];
  patient.hospitalizations.forEach(h => {
    events.push({ date: h.startDate, text: "Hospitalized: " + h.reason, color: T.danger, icon: "ðŸ¥" });
    if (h.endDate) events.push({ date: h.endDate, text: "Discharged: " + h.reason, color: T.success, icon: "âœ…" });
  });
  patient.readings.forEach(r => {
    events.push({ date: r.recordedAt, text: "HF Read: " + (r.ef !== undefined ? "EF " + r.ef + "%" : "") + (r.bnp !== undefined ? " BNP " + r.bnp : "") + (r.nyhaClass ? " NYHA " + r.nyhaClass : ""), color: T.info, icon: "ðŸ“Š" });
  });
  patient.notes.forEach(n => {
    events.push({ date: n.timestamp, text: "Note: " + n.text.slice(0, 60) + (n.text.length > 60 ? "â€¦" : ""), color: T.teal, icon: "ðŸ“" });
  });
  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  if (!events.length) return <div style={{ textAlign: "center", padding: "24px 0", color: T.faint, fontSize: 13 }}>No events yet.</div>;
  return (
    <div>
      <SectHeader label="Patient Timeline" color={T.purple} sub={events.length + " events"} />
      <div style={{ position: "relative", paddingLeft: 20 }}>
        <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: T.border, borderRadius: 1 }} />
        {events.slice(0, 50).map((e, i) => (
          <div key={i} style={{ position: "relative", padding: "0 0 12px 16px" }}>
            <div style={{ position: "absolute", left: -13, top: 4, width: 16, height: 16, borderRadius: "50%", background: e.color + "20", border: "2px solid " + e.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>{e.icon}</div>
            <div style={{ fontSize: 11, color: T.text, marginBottom: 1 }}>{e.text}</div>
            <div style={{ fontSize: 10, color: T.faint }}>{e.date.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChatMessage { from: string; text: string; time: string; unread: boolean }
const MESSAGES_INITIAL: ChatMessage[] = [
  { from: "Cardiology NP", text: "Start ARNI â€” 24/26 mg BID, titrate q2w", time: "2h ago", unread: true },
  { from: "Patient", text: "I'm up 3 lb in 2 days, feeling SOB", time: "4h ago", unread: true },
  { from: "Pharmacy", text: "Prior auth approved for dapagliflozin", time: "1d ago", unread: false },
];
function MessagingTab() {
  const [msgs, setMsgs] = useState(MESSAGES_INITIAL);
  const [newMsg, setNewMsg] = useState("");
  const send = () => { if (newMsg.trim()) { setMsgs([...msgs, { from: "You", text: newMsg.trim(), time: "Just now", unread: false }]); setNewMsg(""); } };
  return (
    <div>
      <SectHeader label="Messages & Secure Chat" color={T.info} sub={msgs.filter(m => m.unread).length + " unread"} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12, maxHeight: 280, overflowY: "auto" }} className="hf-scroll">
        {msgs.map((m, i) => (
          <div key={i} style={{ background: m.from === "Patient" ? "#fef2f2" : m.from === "You" ? "#f0fdf4" : T.bg, border: "0.5px solid " + T.border, borderRadius: 10, padding: "8px 11px", borderLeft: "3px solid " + (m.from === "Patient" ? T.danger : m.from === "You" ? T.success : T.info) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 11, color: T.text }}>{m.from}</span>
              <span style={{ fontSize: 10, color: T.faint, display: "flex", alignItems: "center", gap: 3 }}>{m.unread && <Dot color={T.info} />}{m.time}</span>
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <InpField value={newMsg} onChange={setNewMsg} placeholder="Type a messageâ€¦" />
        <Btn label="Send" variant="primary" onClick={send} />
      </div>
    </div>
  );
}

const REFERRALS_DATA = [
  { spec: "Cardiology (HF Specialist)", reason: "GDMT optimization, advanced therapies", priority: "High", icon: "ðŸ«€" },
  { spec: "Cardiac Rehabilitation", reason: "Exercise prescription, education", priority: "High", icon: "ðŸƒ" },
  { spec: "Nutrition/Dietitian", reason: "Low-sodium diet education", priority: "Medium", icon: "ðŸ¥—" },
  { spec: "Social Work", reason: "Medication access, financial assistance", priority: "Medium", icon: "ðŸ¤" },
  { spec: "Sleep Medicine", reason: "Screen for central/obstructive sleep apnea", priority: "Low", icon: "ðŸ›Œ" },
  { spec: "Palliative Care", reason: "Advanced HF symptom management", priority: "As needed", icon: "ðŸ•Šï¸" },
];
function ReferralsTab() {
  return (
    <div>
      <SectHeader label="Referrals & Care Team" color={T.teal} sub={REFERRALS_DATA.length + " suggested"} />
      <div className="hf-ref-grid" style={{ display: "grid", gap: 6 }}>
        {REFERRALS_DATA.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 10, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 10, padding: "10px 12px", alignItems: "flex-start" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: T.text }}>{r.spec}</div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>{r.reason}</div>
              <Badge text={r.priority} color={r.priority === "High" ? T.danger : r.priority === "Medium" ? T.warn : T.info} bg={r.priority === "High" ? "#fef2f2" : r.priority === "Medium" ? "#fff7ed" : "#eff6ff"} border={r.priority === "High" ? "#fecaca" : r.priority === "Medium" ? "#fed7aa" : "#bfdbfe"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientPicker({ patients, selectedId, onSelect }: {
  patients: PatientData[]; selectedId: string; onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase())), [patients, search]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      <div className="hf-list-topbar">
        <h2 style={{ color: "#fff", fontSize: 17, margin: 0, fontWeight: 800 }}>HF Patients</h2>
        <p style={{ color: "rgba(255,255,255,.75)", fontSize: 11, margin: "2px 0 0" }}>{patients.length} total</p>
      </div>
      <div className="hf-list-search">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ðŸ” Search patientsâ€¦" style={{ width: "100%", borderRadius: 20, padding: "8px 14px", border: "none", background: "#ececec", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} className="hf-scroll">
        {filtered.map(p => {
          const activeMeds = p.medications.filter(m => m.active).length;
          const latestEF = [...p.readings].reverse().find(r => r.ef !== undefined)?.ef;
  const gdmtScore = calculateGDMTScore(p.medications as any, latestEF).score;
  const isSelected = p.id === selectedId;
          return (
            <button key={p.id} onClick={() => onSelect(p.id)} className="hf-patient-btn" style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              border: "none", borderBottom: ".5px solid rgba(0,0,0,.07)", background: isSelected ? "#f5f3ff" : "#fff",
              cursor: "pointer", textAlign: "left", minHeight: 64, boxSizing: "border-box",
            }}>
              <div className="hf-patient-avatar" style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(124,58,237,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 800, color: "#7c3aed", flexShrink: 0 }}>
                {p.name.charAt(0)}
              </div>
              <div className="hf-patient-row-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="hf-patient-row-name" style={{ fontWeight: 600, fontSize: 14, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div className="hf-patient-row-sub" style={{ fontSize: 11, color: "#9ca3af", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  EF {latestEF !== undefined ? latestEF + "%" : "â€”"} Â· {activeMeds} meds Â· GDMT {gdmtScore}%
                </div>
              </div>
              <div className="hf-patient-row-bp" style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                  <Dot color={gdmtScore >= 80 ? T.success : gdmtScore >= 50 ? T.warn : T.danger} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: gdmtScore >= 80 ? T.success : gdmtScore >= 50 ? T.warn : T.danger }}>{gdmtScore}%</span>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No matching patients</div>}
      </div>
    </div>
  );
}

const TABS = [
  { key: "meds", label: "GDMT", icon: "ðŸ’Š" },
  { key: "adh", label: "Adherence", icon: "âœ…" },
  { key: "ef", label: "EF", icon: "ðŸ«€" },
  { key: "bnp", label: "BNP/Wt", icon: "âš–ï¸" },
  { key: "nyha", label: "NYHA", icon: "ðŸƒ" },
  { key: "alerts", label: "Alerts", icon: "ðŸ””" },
  { key: "comps", label: "Complications", icon: "âš ï¸" },
  { key: "lifestyle", label: "Lifestyle", icon: "ðŸ§ " },
  { key: "hosp", label: "Hospitalizations", icon: "ðŸ¥" },
  { key: "labs", label: "Labs", icon: "ðŸ§ª" },
  { key: "notes", label: "Notes", icon: "ðŸ“" },
  { key: "timeline", label: "Timeline", icon: "ðŸ“…" },
  { key: "msgs", label: "Messages", icon: "ðŸ’¬" },
  { key: "refs", label: "Referrals", icon: "ðŸ”„" },
] as const;
type TabKey = typeof TABS[number]["key"];

function PatientPanel({ patient: initialPatient, onBack }: { patient: PatientData; onBack: () => void }) {
  const [patient, setPatient] = useState(initialPatient);
  const [tab, setTab] = useState<TabKey>("meds");
  useEffect(() => { setPatient(initialPatient); setTab("meds"); }, [initialPatient]);
  const gdmtScore = calculateGDMTScore(patient.medications as any, patient.readings.at(-1)?.ef).score;
  const activeAlerts = [...patient.alerts, ...generateHFAlerts(patient.readings)].sort((a, b) => a.severity === "critical" ? -1 : 1);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical").length;
  const latestReading = patient.readings.at(-1);
  const latestEF = latestReading?.ef;
  const latestBNP = latestReading?.bnp;
  const latestWeight = latestReading?.weight;
  const latestNYHA = [...patient.readings].reverse().find(r => r.nyhaClass !== undefined)?.nyhaClass;
  const renderTab = () => {
    switch (tab) {
      case "meds": return <MedicationsTab patient={patient} setPatient={setPatient} />;
      case "adh": return <AdherenceTab patient={patient} setPatient={setPatient} />;
      case "ef": return <EFTab readings={patient.readings} />;
      case "bnp": return <BNPWeightTab readings={patient.readings} />;
      case "nyha": return <NYHATab readings={patient.readings} />;
      case "alerts": return <AlertsTab alerts={patient.alerts} readings={patient.readings} />;
      case "comps": return <ComplicationsTab patient={patient} setPatient={setPatient} />;
      case "lifestyle": return <LifestyleTab />;
      case "hosp": return <HospitalizationTab patient={patient} setPatient={setPatient} />;
      case "labs": return <LabsTab patient={patient} setPatient={setPatient} />;
      case "notes": return <NotesTab patient={patient} setPatient={setPatient} />;
      case "timeline": return <TimelineTab patient={patient} />;
      case "msgs": return <MessagingTab />;
      case "refs": return <ReferralsTab />;
      default: return null;
    }
  };
  const efZoneColor = latestEF !== undefined ? (latestEF < 35 ? T.danger : latestEF <= 40 ? T.warn : latestEF <= 50 ? T.info : T.success) : T.faint;
  return (
    <div className="hf-mobile-detail" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#f9fafb" }}>
      <div className="hf-detail-topbar" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} className="hf-back-btn" style={{ background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", padding: "0 8px 0 0", flexShrink: 0, lineHeight: 1 }}>â€¹</button>
        <div className="hf-detail-topbar-avatar" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0, color: "#fff" }}>{patient.name.charAt(0)}</div>
        <div className="hf-detail-topbar-info" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div className="hf-detail-topbar-name" style={{ fontWeight: 700, fontSize: 15, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{patient.name}</div>
          <div className="hf-detail-topbar-sub" style={{ fontSize: 11, color: "rgba(255,255,255,.8)" }}>{patient.age}y Â· {patient.sex} Â· {patient.mrn}</div>
        </div>
        {latestEF !== undefined && (
          <div className="hf-detail-topbar-ef" style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "4px 9px", textAlign: "center", flexShrink: 0, border: ".5px solid rgba(255,255,255,.3)" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{latestEF}%</div>
            <div style={{ color: "#fff", fontSize: 8, opacity: 0.8 }}>EF</div>
          </div>
        )}
        {criticalAlerts > 0 && (
          <div style={{ background: T.danger, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 10, color: "#fff", flexShrink: 0 }}>
            {criticalAlerts}
          </div>
        )}
      </div>
      <div className="hf-stat-row" style={{ display: "flex", gap: 5, padding: "8px 10px 2px", background: "#fff", borderBottom: ".5px solid rgba(0,0,0,.07)", flexWrap: "wrap", flexShrink: 0 }}>
        {latestEF !== undefined && <StatCard label="EF" value={latestEF + "%"} color={efZoneColor} />}
        {latestBNP !== undefined && <StatCard label="BNP" value={String(latestBNP)} sub="pg/mL" color={latestBNP > 1000 ? T.danger : latestBNP > 400 ? T.warn : T.teal} />}
        {latestWeight !== undefined && <StatCard label="Weight" value={String(latestWeight)} sub="kg" />}
        {latestNYHA !== undefined && <StatCard label="NYHA" value={String(latestNYHA)} color={NYHA_COLORS[latestNYHA]} />}
        <StatCard label="GDMT" value={gdmtScore + "%"} color={gdmtScore >= 80 ? T.success : gdmtScore >= 50 ? T.warn : T.danger} />
      </div>
      <div className="hf-tabs-wrap" style={{ flexShrink: 0, background: "#fff", borderBottom: ".5px solid rgba(0,0,0,.08)", overflow: "hidden" }}>
        <div className="hf-tabs" style={{ display: "flex", overflowX: "auto", flexWrap: "nowrap", padding: "4px 8px", gap: 2, background: "#fff" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className="hf-tab-btn" style={{
              fontSize: 10, padding: "5px 8px", whiteSpace: "nowrap", minHeight: 32, border: "none",
              background: tab === t.key ? "#7c3aed" : "transparent", color: tab === t.key ? "#fff" : "#6b7280",
              borderRadius: 8, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 3,
            }}>
              <span style={{ fontSize: 11 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="hf-detail-content" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "10px 10px 100px", width: "100%", boxSizing: "border-box" }}>
        {renderTab()}
      </div>
    </div>
  );
}

export default function HeartFailureDashboard({ patients: initialPatients, patientId: initialPatientId, onPatientChange }: {
  patients: PatientData[]; patientId?: string; onPatientChange?: (id: string) => void;
}) {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedId, setSelectedId] = useState(initialPatientId || (initialPatients[0]?.id ?? ""));
  const [viewing, setViewing] = useState(false);
  const selectedPatient = patients.find(p => p.id === selectedId);
  useEffect(() => {
    setPatients(initialPatients);
    if (!selectedId && initialPatients.length > 0) setSelectedId(initialPatients[0].id);
  }, [initialPatients]);
  useEffect(() => { onPatientChange?.(selectedId); }, [selectedId]);
  const handleSelect = (id: string) => { setSelectedId(id); setViewing(true); };
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="hf-root" style={{ minHeight: "calc(100vh - 60px)", background: T.bg, padding: 16, fontFamily: "'DM Sans','Plus Jakarta Sans','Segoe UI',system-ui,sans-serif" }}>
        <div className="hf-page-header" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <img src="https://img.icons8.com/fluency/48/heart-with-pulse.png" alt="" style={{ width: 28, height: 28 }} />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0 }}>Heart Failure Dashboard</h1>
            <p style={{ fontSize: 12, color: T.faint, margin: "2px 0 0" }}>Guideline-Directed Medical Therapy Â· EF-Tracked Â· BNP Monitoring</p>
          </div>
          <div style={{ flex: 1 }} />
          {selectedPatient && (
            <Btn label="Export PDF" variant="default" icon="ðŸ“„" small onClick={() => {
              exportNoteAsPDF(selectedPatient as any, selectedPatient.name || "Patient");
            }} />
          )}
        </div>
        <div className="hf-desktop-layout" style={{ display: "flex", gap: 16, height: "calc(100vh - 140px)" }}>
          <div className="hf-patient-list" style={{ width: 290, flexShrink: 0, background: "#fff", borderRadius: 14, border: ".5px solid rgba(0,0,0,.07)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <PatientPicker patients={patients} selectedId={selectedId} onSelect={handleSelect} />
          </div>
          <div style={{ flex: 1, overflow: "hidden", borderRadius: 14, background: "#f9fafb", border: ".5px solid rgba(0,0,0,.07)", display: "flex", flexDirection: "column", minWidth: 0 }}>
            {selectedPatient ? (
              <PatientPanel patient={selectedPatient} onBack={() => setViewing(false)} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: T.faint, fontSize: 14 }}>Select a patient to view details</div>
            )}
          </div>
        </div>
        {(!viewing || !selectedPatient) && (
          <div className="hf-mobile-list" style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden", background: "#fff" }}>
            <PatientPicker patients={patients} selectedId={selectedId} onSelect={handleSelect} />
          </div>
        )}
        {viewing && selectedPatient && (
          <div className="hf-mobile-detail" style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden", background: "#f9fafb" }}>
            <PatientPanel patient={selectedPatient} onBack={() => setViewing(false)} />
          </div>
        )}
      </div>
    </>
  );
}

