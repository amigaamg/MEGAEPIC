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
}

export const PHARMA_DB: Record<string, PharmaEntry> = {
  "Ramipril": {
    drugClass: "ACE Inhibitor (ACEi)",
    mechanism: "Inhibits ACE \u2192 \u2193 angiotensin II \u2192 vasodilation + \u2193 aldosterone \u2192 renoprotective in CKD. HOPE trial proven CV event reduction in high-risk patients.",
    minDose: 1.25, maxDose: 10, unit: "mg",
    commonDoses: ["1.25","2.5","5","10"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Hypertension with CKD","Diabetic nephropathy","Proteinuric CKD","Post-MI","Heart failure","High CV risk (HOPE)"],
    contraindications: ["Pregnancy (ALL trimesters)","Angioedema history","Bilateral renal artery stenosis","Concurrent ARB + aliskiren"],
    warnings: ["Monitor K+ and Cr at 1-2 weeks after initiation","First-dose hypotension if volume-depleted","Cough in 10-15% - switch to ARB if intolerable","Angioedema (rare but life-threatening)","Dose adjust for eGFR <30"],
    sideEffects: ["Dry cough","Hyperkalemia","\u2191 Creatinine","Dizziness","Hypotension","Angioedema (rare)","Fatigue"],
    patientInstructions: "Take once or twice daily as directed. Swallow capsule whole or sprinkle on food. Report dry cough, swelling of face/lips/tongue (emergency!). Avoid ibuprofen/NSAIDs. Do NOT take if pregnant. Avoid potassium supplements.",
    monitoring: ["BP","Serum K+","Creatinine/eGFR","Urine ACR","Check 1-2wk after dose change"],
    interactions: ["NSAIDs - \u2191 renal risk, \u2193 efficacy","K+ sparing diuretics - hyperkalemia","ARBs/Aliskiren - avoid dual RAAS","Lithium - \u2191 toxicity","mTOR inhibitors - \u2191 angioedema"],
    pregnancyCategory: "D - CONTRAINDICATED",
    renalDose: "eGFR 10-30: start 1.25mg OD, max 10mg; eGFR <10: start 1.25mg OD",
    color: "#059669", tlColor: "#10b981",
  },
  "Lisinopril": {
    drugClass: "ACE Inhibitor (ACEi)",
    mechanism: "Inhibits ACE \u2192 \u2193 angiotensin II \u2192 vasodilation + \u2193 aldosterone \u2192 renoprotective. Reduces proteinuria and slows CKD progression.",
    minDose: 5, maxDose: 40, unit: "mg",
    commonDoses: ["5","10","20","40"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension with CKD","Diabetic nephropathy","Proteinuric CKD","Heart failure","Post-MI"],
    contraindications: ["Pregnancy (ALL)","Angioedema","Bilateral renal artery stenosis","Concurrent ARB + aliskiren"],
    warnings: ["Dry cough up to 20%","Angioedema (0.1-0.5%)","Hyperkalemia - monitor K+ regularly","First-dose hypotension","Dose adjust in CKD"],
    sideEffects: ["Dry cough","Hyperkalemia","\u2191 Creatinine","Dizziness","Hypotension","Headache"],
    patientInstructions: "Take once daily at same time each day. Can be taken with or without food. Report persistent dry cough, swelling, or dizziness. Avoid NSAIDs. Do not take if pregnant.",
    monitoring: ["BP","K+","Creatinine/eGFR","Urine ACR","Check 1-2wk after initiation"],
    interactions: ["ARBs - avoid dual RAAS","NSAIDs - \u2191 renal risk","K+ sparing diuretics - hyperkalemia","Lithium - \u2191 toxicity"],
    pregnancyCategory: "D - CONTRAINDICATED",
    renalDose: "eGFR 10-30: start 5mg, max 40mg; eGFR <10: start 2.5mg",
    color: "#059669", tlColor: "#34d399",
  },
  "Losartan": {
    drugClass: "Angiotensin Receptor Blocker (ARB)",
    mechanism: "Selectively blocks AT1 receptors \u2192 \u2193 vasoconstriction, aldosterone, sodium retention \u2192 \u2193 BP + renoprotective. Reduces proteinuria and slows CKD progression.",
    minDose: 25, maxDose: 100, unit: "mg",
    commonDoses: ["25","50","100"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension with CKD","Diabetic nephropathy (type 2 - RENAAL trial)","Proteinuric CKD","ACEi-intolerant cough","Heart failure","LVH"],
    contraindications: ["Pregnancy (2nd/3rd trimester - TERATOGENIC)","Bilateral renal artery stenosis","Severe hyperkalemia (K+ >6.0)","Concurrent ACEi + aliskiren"],
    warnings: ["Monitor K+ and Cr at 1-2 weeks after initiation and dose change","First-dose hypotension especially if volume-depleted","Acute kidney injury with NSAIDs or dehydration","Less cough than ACEi","Alternative when ACEi causes angioedema"],
    sideEffects: ["Dizziness","Hyperkalemia","\u2191 Cr (acceptable if <30% rise)","Back pain","Diarrhea","Hypotension"],
    patientInstructions: "Take once daily at same time. Can take with or without food. AVOID potassium supplements and salt substitutes (KCl). Drink adequate fluids. Stop and seek care if pregnant.",
    monitoring: ["BP","Serum K+ (baseline, 1-2wk, 3mo, then annually)","Creatinine/eGFR","Urine ACR"],
    interactions: ["NSAIDs - \u2191 renal risk, \u2193 efficacy","K+ sparing diuretics - hyperkalemia","Lithium - \u2191 toxicity","ACEi - avoid dual RAAS"],
    pregnancyCategory: "D (2nd/3rd trimester) - CONTRAINDICATED",
    renalDose: "eGFR 15-30: use with caution; eGFR <15: not recommended",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Valsartan": {
    drugClass: "Angiotensin Receptor Blocker (ARB)",
    mechanism: "Selective AT1 receptor blocker. Reduces proteinuria and slows CKD progression. Effective in heart failure and post-MI.",
    minDose: 40, maxDose: 320, unit: "mg",
    commonDoses: ["40","80","160","320"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Hypertension with CKD","Diabetic nephropathy","Heart failure (VALHEFT)","Post-MI (VALIANT)","Proteinuric CKD"],
    contraindications: ["Pregnancy","Bilateral renal artery stenosis","Severe hyperkalemia","Concurrent ACEi + aliskiren"],
    warnings: ["Monitor K+ and Cr","First-dose hypotension","Cough less than ACEi","Dose adjust in hepatic impairment"],
    sideEffects: ["Dizziness","Hyperkalemia","Hypotension","Diarrhea","Fatigue","\u2191 Cr"],
    patientInstructions: "Take once or twice daily with water. Avoid potassium supplements. Avoid NSAIDs. Report dizziness, muscle weakness, or reduced urination.",
    monitoring: ["BP","K+","Creatinine/eGFR","Urine ACR"],
    interactions: ["NSAIDs - \u2191 renal risk","K+ sparing diuretics - hyperkalemia","Lithium - \u2191 toxicity","ACEi - avoid dual RAAS"],
    pregnancyCategory: "D - CONTRAINDICATED",
    renalDose: "eGFR 15-30: caution; no dose adjustment needed as not renally cleared",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Candesartan": {
    drugClass: "Angiotensin Receptor Blocker (ARB)",
    mechanism: "Selective AT1 receptor blocker with high receptor affinity. Strong evidence in heart failure and CKD.",
    minDose: 4, maxDose: 32, unit: "mg",
    commonDoses: ["4","8","16","32"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hypertension with CKD","Heart failure (CHARM program)","Diabetic nephropathy","Proteinuric CKD"],
    contraindications: ["Pregnancy","Bilateral renal artery stenosis","Severe hyperkalemia"],
    warnings: ["Monitor K+ and Cr","First-dose hypotension","Cough less than ACEi"],
    sideEffects: ["Dizziness","Hyperkalemia","Hypotension","Headache","\u2191 Cr"],
    patientInstructions: "Take once daily. Can be taken with or without food. Avoid potassium supplements and NSAIDs.",
    monitoring: ["BP","K+","Creatinine/eGFR","Urine ACR"],
    interactions: ["NSAIDs - \u2191 renal risk","K+ sparing diuretics - hyperkalemia","Lithium - monitor levels"],
    pregnancyCategory: "D - CONTRAINDICATED",
    renalDose: "No dose adjustment for renal impairment; start cautiously in severe CKD",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Empagliflozin": {
    drugClass: "SGLT2 Inhibitor (SGLT2i)",
    mechanism: "Inhibits SGLT2 in proximal tubule \u2192 glucosuria + natriuresis \u2192 reduced intraglomerular pressure. Proven renal benefit: EMPA-REG OUTCOME, EMPA-KIDNEY. Slows CKD progression independent of diabetes status.",
    minDose: 10, maxDose: 25, unit: "mg",
    commonDoses: ["10","25"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["CKD with or without type 2 diabetes (EMPA-KIDNEY)","Diabetic nephropathy (EMPA-REG)","Heart failure (EMPEROR-Reduced, EMPEROR-Preserved)","Type 2 diabetes with CV risk"],
    contraindications: ["eGFR <20 (EMPA-KIDNEY) or <30 (EMPA-REG)","Type 1 diabetes (off-label)","History of ketoacidosis","Severe hepatic impairment"],
    warnings: ["Euglycemic DKA (rare but serious) - educate patient","Genital mycotic infections (candida balanitis/vaginitis) - 5-8%","Volume depletion/hypotension (especially with diuretics)","Fournier gangrene (extremely rare)","Monitor eGFR - small initial drop is expected and benign","Lower limb amputation - increased risk with canagliflozin"],
    sideEffects: ["Genital candidiasis","UTI","Polyuria","Volume depletion","Nausea","DKA (rare)"],
    patientInstructions: "Take ONCE DAILY in the morning. Drink adequate fluids to prevent dehydration. Report any genital redness/itching/discharge (treatable). Seek emergency care if nausea/vomiting/abdominal pain with deep breathing (DKA signs). Monitor for hypoglycemia if on insulin/sulphonylurea.",
    monitoring: ["eGFR (initially, 3-monthly)","Blood glucose/HbA1c","Volume status/BP","Genital symptoms"],
    interactions: ["Loop/thiazide diuretics - \u2191 volume depletion risk","Insulin/sulphonylureas - \u2191 hypoglycemia risk","NSAIDs - may reduce efficacy"],
    pregnancyCategory: "C - avoid; limited data",
    renalDose: "eGFR \u226520: start 10mg; eGFR <20: not recommended. Small initial eGFR dip is expected.",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Dapagliflozin": {
    drugClass: "SGLT2 Inhibitor (SGLT2i)",
    mechanism: "Inhibits SGLT2 \u2192 \u2193 glucose reabsorption + natriuresis \u2192 tubuloglomerular feedback \u2192 \u2193 intraglomerular pressure. DAPA-CKD trial: 39% reduction in composite renal outcome. First SGLT2i approved for CKD regardless of diabetes.",
    minDose: 5, maxDose: 10, unit: "mg",
    commonDoses: ["5","10"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["CKD with or without type 2 diabetes (DAPA-CKD)","Diabetic nephropathy","Heart failure (DAPA-HF, DELIVER)","Type 2 diabetes"],
    contraindications: ["eGFR <25 (DAPA-CKD criteria)","Type 1 diabetes (off-label)","History of ketoacidosis"],
    warnings: ["Euglycemic DKA - educate on sick day rules","Genital infections (mycotic)","Volume depletion - caution with loop diuretics","Initiate only if eGFR \u226525","Benign initial eGFR dip (~3-5 mL/min) over first 2-4 weeks"],
    sideEffects: ["Genital candidiasis","Polyuria","Volume depletion","Nausea","DKA (rare)","UTI"],
    patientInstructions: "Take once daily in morning. Stay hydrated. Practice good genital hygiene. If you develop nausea/vomiting/malaise with deep rapid breathing - seek emergency care (signs of DKA). Do not stop on sick days without medical advice.",
    monitoring: ["eGFR","HbA1c (if diabetic)","Volume status","K+","Genital symptoms"],
    interactions: ["Loop diuretics - \u2191 volume depletion","Insulin - \u2191 hypoglycemia risk","NSAIDs - \u2193 efficacy"],
    pregnancyCategory: "C - avoid; limited data",
    renalDose: "eGFR \u226525: 10mg OD; eGFR <25: not recommended",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Furosemide": {
    drugClass: "Loop Diuretic",
    mechanism: "Inhibits Na-K-2Cl cotransporter in ascending loop of Henle \u2192 potent diuresis, natriuresis, and kaliuresis. Used for volume overload in CKD, HF, and nephrotic syndrome.",
    minDose: 20, maxDose: 500, unit: "mg",
    commonDoses: ["20","40","80","120","160","250"], frequencies: ["OD","BD","TDS"], routes: ["Oral","IV"],
    indications: ["Volume overload in CKD","Heart failure","Nephrotic syndrome","Hypertension with fluid retention","Hyperkalemia (adjunct)"],
    contraindications: ["Anuria","Hepatic coma","Severe hypokalemia","Sulfonamide allergy (cross-reactivity)"],
    warnings: ["Ototoxicity at high doses or rapid IV","Dehydration/hypovolemia","Hypokalemia, hypomagnesemia, hypocalcemia","Monitor urine output and weight","Resistance at low eGFR - increase dose, not frequency"],
    sideEffects: ["Hypokalemia","Dehydration","Ototoxicity","Hyperuricemia","Hypomagnesemia","Dizziness"],
    patientInstructions: "Take in morning to avoid nocturia. Monitor daily weight. Report hearing changes or dizziness. Avoid NSAIDs. Take with or without food.",
    monitoring: ["Daily weight","Urine output","K+, Mg, Ca","BP","Creatinine/eGFR"],
    interactions: ["NSAIDs - \u2193 efficacy, \u2191 nephrotoxicity","Digoxin - \u2191 toxicity (hypokalemia)","Lithium - \u2191 toxicity","Other diuretics - additive effect"],
    pregnancyCategory: "C - use if benefit outweighs risk",
    renalDose: "eGFR <30: may require higher doses (up to 250-500mg) due to reduced tubular secretion",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "Bumetanide": {
    drugClass: "Loop Diuretic",
    mechanism: "Potent loop diuretic acting on Na-K-2Cl cotransporter. 40-60x more potent than furosemide. Better oral bioavailability, preferred when oral absorption is concern.",
    minDose: 0.5, maxDose: 10, unit: "mg",
    commonDoses: ["0.5","1","2","4","5"], frequencies: ["OD","BD"], routes: ["Oral","IV"],
    indications: ["Volume overload in CKD","Diuretic resistance (higher bioavailability)","Heart failure","Edema"],
    contraindications: ["Anuria","Severe hypokalemia","Hepatic encephalopathy"],
    warnings: ["Ototoxicity","Dehydration","Electrolyte depletion","Monitor K+, Mg+ levels"],
    sideEffects: ["Hypokalemia","Dehydration","Ototoxicity","Muscle cramps","Hyperuricemia"],
    patientInstructions: "Take in morning. Monitor weight daily. Report hearing changes.",
    monitoring: ["Electrolytes","BP","Weight","Renal function"],
    interactions: ["NSAIDs - antagonize effect","Aminoglycosides - ototoxicity","Lithium - \u2191 levels"],
    pregnancyCategory: "C",
    renalDose: "eGFR <30: may need dose increase; titrate to effect",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "Spironolactone": {
    drugClass: "K+ Sparing Diuretic (MRA)",
    mechanism: "Competitive aldosterone antagonist in distal collecting duct \u2192 \u2193 K+ excretion, \u2193 Na+ reabsorption. Anti-fibrotic in heart and kidney. Use cautiously in CKD due to hyperkalemia risk.",
    minDose: 12.5, maxDose: 100, unit: "mg",
    commonDoses: ["12.5","25","50"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Resistant hypertension","Heart failure (RALES)","Primary aldosteronism","Cirrhotic ascites","Proteinuric CKD (off-label)"],
    contraindications: ["eGFR <30 (relative)","Hyperkalemia (K+ >5.0)","Addison disease","Concurrent K+ supplements"],
    warnings: ["Hyperkalemia risk - HIGH in CKD MONITOR K+ CLOSELY","Gynecomastia (dose-related, reversible)","Avoid with other K+ sparing diuretics","Do NOT give with potassium supplements"],
    sideEffects: ["Hyperkalemia","Gynecomastia","Breast tenderness","Menstrual irregularities","Drowsiness","GI upset"],
    patientInstructions: "Take once daily with food. Avoid potassium-rich foods (bananas, oranges, salt substitutes). Report breast tenderness or enlargement. Regular blood tests for K+ are mandatory.",
    monitoring: ["K+ 1-2 weeks after initiation","BP","Creatinine/eGFR","Signs of gynecomastia"],
    interactions: ["ACEi/ARB - additive hyperkalemia","NSAIDs - \u2191 K+, \u2193 efficacy","K+ supplements - CONTRAINDICATED","Digoxin - \u2191 toxicity"],
    pregnancyCategory: "C - avoid if possible",
    renalDose: "eGFR 30-60: 12.5-25mg OD; eGFR <30: AVOID unless dialysis",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Eplerenone": {
    drugClass: "K+ Sparing Diuretic (MRA)",
    mechanism: "Selective aldosterone antagonist - fewer endocrine side effects than spironolactone. Weaker anti-fibrotic but better tolerated. Useful for HF + CKD.",
    minDose: 25, maxDose: 50, unit: "mg",
    commonDoses: ["25","50"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Heart failure post-MI (EPHESUS)","Resistant hypertension","Mild CKD with HF"],
    contraindications: ["eGFR <30","K+ >5.0","Type 2 diabetes with microalbuminuria (EMPHASIS-HF caution)"],
    warnings: ["Hyperkalemia risk (less than spironolactone)","Monitor K+","No gynecomastia advantage over spironolactone"],
    sideEffects: ["Hyperkalemia","Dizziness","Fatigue","GI upset"],
    patientInstructions: "Take with or without food. Avoid high K+ diet. Report palpitations or muscle weakness.",
    monitoring: ["K+","BP","Creatinine/eGFR"],
    interactions: ["ACEi/ARB - \u2191 K+","NSAIDs - \u2193 efficacy","Ketoconazole - \u2191 eplerenone levels"],
    pregnancyCategory: "B",
    renalDose: "eGFR 30-60: 25mg OD; eGFR <30: AVOID",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Sodium Bicarbonate": {
    drugClass: "Alkalinizing Agent",
    mechanism: "Corrects metabolic acidosis by providing bicarbonate buffer. Slows CKD progression by reducing acid-mediated tubulointerstitial injury and endothelin activation.",
    minDose: 650, maxDose: 6500, unit: "mg",
    commonDoses: ["650","1300","1950","2600"], frequencies: ["OD","BD","TDS"], routes: ["Oral","IV"],
    indications: ["Metabolic acidosis in CKD (HCO3 <22 mmol/L)","Chronic kidney disease (preserve renal function)","Renal tubular acidosis"],
    contraindications: ["Metabolic alkalosis","Hypocalcemia (tetany risk)","Severe hypertension (sodium load)"],
    warnings: ["Sodium load may worsen BP and edema","Monitor bicarbonate to avoid overcorrection (target 22-26)","Gastric discomfort - take with food","GI perforation risk (rare)"],
    sideEffects: ["Gastric bloating","Belching","Hypernatremia","Fluid overload","Metabolic alkalosis"],
    patientInstructions: "Take with food to reduce GI upset. Do not take within 2 hours of other meds. Expect some belching - this is normal. Monitor your breathing (deep breathing may signal acidosis).",
    monitoring: ["Serum bicarbonate","BP (sodium load)","Weight/edema","K+"],
    interactions: ["Calcium - reduce absorption","Iron - reduce absorption","Antacids - alkalosis risk"],
    pregnancyCategory: "C - safe at standard doses",
    renalDose: "Start 650mg TDS; titrate to target HCO3 22-26 mmol/L",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Sevelamer": {
    drugClass: "Phosphate Binder (Non-Ca)",
    mechanism: "Cross-linked polyallylamine HCl that binds dietary phosphate in GI tract, preventing absorption. Calcium-free - preferred in CKD-MBD to avoid vascular calcification.",
    minDose: 800, maxDose: 6400, unit: "mg",
    commonDoses: ["800","1600","2400","3200"], frequencies: ["TDS"], routes: ["Oral"],
    indications: ["Hyperphosphatemia in CKD stage 3-5","CKD-MBD management","Patients needing Ca-free binder (vascular calcification risk)"],
    contraindications: ["Bowel obstruction","Hypophosphatemia","GI strictures"],
    warnings: ["Tablet swelling - take with food and water","GI obstruction risk (rare)","May reduce absorption of fat-soluble vitamins","Lower HDL cholesterol"],
    sideEffects: ["Constipation","Nausea","Vomiting","GI obstruction (rare)","Flatulence"],
    patientInstructions: "Take with meals. Swallow whole - do NOT crush or chew. Drink plenty of water. Stay consistent with meals for best phosphate control.",
    monitoring: ["Serum phosphate","Calcium","PTH","Alkaline phosphatase"],
    interactions: ["Ciprofloxacin - reduce absorption (separate by 2h)","Thyroid hormone - separate by 2h","Fat-soluble vitamins"],
    pregnancyCategory: "C - use if needed",
    renalDose: "No renal dose adjustment; titrate to PO4 target",
    color: "#ca8a04", tlColor: "#eab308",
  },
  "Calcium Carbonate": {
    drugClass: "Phosphate Binder (Ca-based)",
    mechanism: "Binds dietary phosphate in gut; also provides calcium supplementation. First-line for early CKD but limit calcium dose to <1500mg/day total to avoid vascular calcification.",
    minDose: 500, maxDose: 3000, unit: "mg",
    commonDoses: ["500","1000","1250","1500","2500"], frequencies: ["TDS"], routes: ["Oral"],
    indications: ["Hyperphosphatemia in CKD","Calcium supplementation","CKD-MBD"],
    contraindications: ["Hypercalcemia","Nephrolithiasis","Hypophosphatemia","Vitamin D toxicity"],
    warnings: ["Avoid total calcium intake >2000mg/day (including diet)","May cause hypercalcemia if given with Vitamin D","Milk-alkali syndrome risk","Metabolic alkalosis"],
    sideEffects: ["Constipation","Hypercalcemia","Nausea","Milk-alkali syndrome"],
    patientInstructions: "Take with meals. Chew or swallow with water. Do not take with other medications - wait 2 hours. Avoid calcium supplements otherwise.",
    monitoring: ["Serum calcium","Phosphate","PTH","Ca x PO4 product (<55 mg2/dL2)"],
    interactions: ["Iron - reduce absorption","Thyroid hormone - separate","Fluoroquinolones - chelation","Vitamin D - hypercalcemia risk"],
    pregnancyCategory: "C - safe at recommended doses",
    renalDose: "No renal adjustment; monitor calcium in stage 4-5",
    color: "#ca8a04", tlColor: "#eab308",
  },
  "Lanthanum Carbonate": {
    drugClass: "Phosphate Binder (Non-Ca, Non-Al)",
    mechanism: "Chewable phosphate binder that binds dietary phosphate in GI tract. High potency, low pill burden. Lanthanum accumulates in bone but no clinical toxicity shown.",
    minDose: 500, maxDose: 3000, unit: "mg",
    commonDoses: ["500","750","1000","1500"], frequencies: ["TDS"], routes: ["Oral"],
    indications: ["Hyperphosphatemia in dialysis patients","CKD-MBD with calcium avoidance"],
    contraindications: ["Hypophosphatemia","GI obstruction","Acute peptic ulcer"],
    warnings: ["Very expensive - reserve for resistant cases","Lanthanum deposition in bone/GI tract (long-term significance unknown)","Take with or immediately after meals"],
    sideEffects: ["Nausea","Vomiting","Diarrhea","Constipation","GI perforation (rare)"],
    patientInstructions: "Chew tablet completely BEFORE swallowing. Do not swallow whole. Take with meals. Store at room temperature.",
    monitoring: ["Serum phosphate","Calcium","PTH"],
    interactions: ["Thyroid hormone - separate by 2h","Quinolones - chelation"],
    pregnancyCategory: "C - limited data",
    renalDose: "No adjustment; titrate to phosphate target",
    color: "#ca8a04", tlColor: "#eab308",
  },
  "Cinacalcet": {
    drugClass: "Calcimimetic",
    mechanism: "Allosteric activator of CaSR \u2192 \u2193 PTH secretion. Used for secondary hyperparathyroidism in dialysis patients (EVOLVE trial). Reduces fracture risk and parathyroidectomy rate.",
    minDose: 30, maxDose: 180, unit: "mg",
    commonDoses: ["30","60","90","120","180"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Secondary hyperparathyroidism in dialysis","Parathyroid carcinoma"],
    contraindications: ["Hypocalcemia","QT prolongation"],
    warnings: ["Hypocalcemia risk - monitor Ca weekly at initiation","QT prolongation - ECG monitoring if on other QT drugs","Nausea/vomiting common - take with food","Seizure threshold reduction"],
    sideEffects: ["Nausea","Vomiting","Hypocalcemia","Diarrhea","Dizziness","Myalgia"],
    patientInstructions: "Take with food or shortly after a meal. Swallow whole - do not crush. Report muscle cramps or tingling (signs of low calcium). Take 2h after phosphate binders.",
    monitoring: ["Serum calcium (weekly then monthly)","PTH (monthly)","Phosphate","QT interval"],
    interactions: ["Phosphate binders - separate by 2h","QT-prolonging drugs","CYP3A4 inhibitors/inducers","Ca channel blockers"],
    pregnancyCategory: "C - avoid",
    renalDose: "No adjustment in renal impairment; not studied in HD",
    color: "#9333ea", tlColor: "#a855f7",
  },
  "Calcitriol": {
    drugClass: "Active Vitamin D Analogue",
    mechanism: "Active form of vitamin D (1,25-dihydroxycholecalciferol) \u2192 \u2191 intestinal Ca/PO4 absorption, \u2193 PTH synthesis. Essential for CKD-MBD management.",
    minDose: 0.25, maxDose: 2, unit: "mcg",
    commonDoses: ["0.25","0.5","1","1.5","2"], frequencies: ["OD","TIW"], routes: ["Oral","IV"],
    indications: ["Secondary hyperparathyroidism in CKD","Hypocalcemia in CKD","Renal osteodystrophy"],
    contraindications: ["Hypercalcemia","Vitamin D toxicity","Hyperphosphatemia (correct first)"],
    warnings: ["Hypercalcemia and hyperphosphatemia risk","Can worsen vascular calcification if Ca x PO4 elevated","Monitor Ca, PO4, PTH regularly"],
    sideEffects: ["Hypercalcemia","Hyperphosphatemia","Hypercalciuria","Metastatic calcification"],
    patientInstructions: "Take as directed - usually daily or 3x weekly. Do NOT take with calcium supplements or antacids containing magnesium. Report nausea, vomiting, or constipation.",
    monitoring: ["Ca, PO4, PTH (monthly)","Ca x PO4 product","Renal function"],
    interactions: ["Thiazides - \u2191 hypercalcemia","Ca supplements - additive","Cholestyramine - \u2193 absorption"],
    pregnancyCategory: "C - safe at recommended doses",
    renalDose: "No adjustment; titrate to PTH target per KDIGO",
    color: "#9333ea", tlColor: "#a855f7",
  },
  "Paricalcitol": {
    drugClass: "Selective Vitamin D Receptor Activator (VDRA)",
    mechanism: "Selective VDR activator that \u2193 PTH with less Ca/PO4 elevation than calcitriol. May offer survival benefit (IMPACT, PARADIGM trials). Preferred in CKD-MBD.",
    minDose: 1, maxDose: 16, unit: "mcg",
    commonDoses: ["1","2","4","6","8"], frequencies: ["OD","TIW"], routes: ["Oral","IV"],
    indications: ["Secondary hyperparathyroidism in CKD stage 3-4","Dialysis patients with SHPT"],
    contraindications: ["Hypercalcemia","Vitamin D toxicity"],
    warnings: ["Less hypercalcemia than calcitriol but still monitor","Adynamic bone disease with oversuppression","Monitor Ca, PO4, PTH"],
    sideEffects: ["Hypercalcemia (less than calcitriol)","Nausea","Diarrhea","Dizziness"],
    patientInstructions: "Take daily or as directed (dialysis days if TIW). Report persistent nausea or vomiting.",
    monitoring: ["PTH (monthly)","Ca, PO4, ALP","Ca x PO4 product"],
    interactions: ["Phosphate binders","Digoxin - hypercalcemia \u2191 toxicity"],
    pregnancyCategory: "C",
    renalDose: "No dose adjustment; titrate to PTH target",
    color: "#9333ea", tlColor: "#a855f7",
  },
  "Epoetin Alfa": {
    drugClass: "Erythropoiesis-Stimulating Agent (ESA)",
    mechanism: "Recombinant human erythropoietin \u2192 stimulates erythroid progenitor cells in bone marrow \u2192 \u2191 RBC production. Corrects anemia of CKD. TREAT, CHOIR trials defined target Hb 10-12 g/dL.",
    minDose: 2000, maxDose: 40000, unit: "units",
    commonDoses: ["2000","4000","6000","8000","10000","20000"], frequencies: ["TIW","weekly","biweekly"], routes: ["Subcutaneous","IV"],
    indications: ["Anemia in CKD (Hb <10 g/dL)","ESA dose: target Hb 10-12 g/dL","Pre-dialysis and dialysis patients"],
    contraindications: ["Hb >13 g/dL","Uncontrolled hypertension","Pure red cell aplasia (PRCA)","History of thrombotic events"],
    warnings: ["Black box: increased risk of death, MI, stroke if Hb >11 g/dL","Do NOT target Hb >12 g/dL","Hypertension - monitor BP closely","Seizures (especially first months)","Thrombotic events","Pure red cell aplasia (rare)"],
    sideEffects: ["Hypertension","Thrombosis","Headache","Flu-like symptoms","Injection site pain","PRCA (rare)"],
    patientInstructions: "Strict BP monitoring required. Report severe headache, vision changes, or leg swelling. Hold if systolic >180. Keep all appointments for blood tests. Iron stores must be adequate.",
    monitoring: ["Hb (weekly to monthly)","BP","Iron, ferritin, TSAT","Seizure precautions"],
    interactions: ["Iron deficiency reduces response","ACEi may \u2193 response","Heparin - \u2191 thrombotic risk"],
    pregnancyCategory: "C - use if benefit outweighs risk",
    renalDose: "No clearance-related adjustment; titrate to Hb target",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Darbepoetin Alfa": {
    drugClass: "Erythropoiesis-Stimulating Agent (ESA)",
    mechanism: "Hyperglycosylated erythropoietin analogue with 3x longer half-life than epoetin alfa. Less frequent dosing (weekly/BIW). Same MOA: stimulates RBC production.",
    minDose: 20, maxDose: 300, unit: "mcg",
    commonDoses: ["20","40","60","100","150","200","300"], frequencies: ["weekly","biweekly","monthly"], routes: ["Subcutaneous","IV"],
    indications: ["Anemia in CKD (Hb <10 g/dL)","ESA for dialysis patients","ESA for pre-dialysis patients"],
    contraindications: ["Hb >12 g/dL","Uncontrolled HTN","PRCA","Prior thrombotic events"],
    warnings: ["Same black box as epoetin: CV events at Hb >11 g/dL","Do not target Hb >12 g/dL","Monitor iron stores","Seizures"],
    sideEffects: ["Hypertension","Thrombosis","Headache","Injection site reactions","Fatigue"],
    patientInstructions: "Less frequent injections than epoetin. Monitor BP. Report severe headaches or vision changes. Adequate iron essential.",
    monitoring: ["Hb (monthly)","BP","Iron, ferritin, TSAT"],
    interactions: ["Adequate iron required for response"],
    pregnancyCategory: "C",
    renalDose: "No adjustment; titrate to Hb target 10-12 g/dL",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Iron Sucrose": {
    drugClass: "IV Iron",
    mechanism: "Iron-carbohydrate complex for IV iron repletion. Corrects iron deficiency anemia in CKD. More bioavailable than oral iron. Used with ESAs for optimal erythropoiesis.",
    minDose: 100, maxDose: 500, unit: "mg",
    commonDoses: ["100","200","300","500"], frequencies: ["weekly","per dialysis"], routes: ["IV"],
    indications: ["Iron deficiency in CKD (TSAT <30%, ferritin <500)","With ESA therapy","Hemodialysis patients"],
    contraindications: ["Anaphylaxis","Iron overload","Hemochromatosis","Non-iron deficiency anemias"],
    warnings: ["Hypotension during infusion","Anaphylaxis (very rare with iron sucrose)","Monitor for infusion reactions","Correct before/concomitant with ESA"],
    sideEffects: ["Hypotension","Nausea","Headache","Infusion site extravasation (brown staining)","Dysgeusia (metallic taste)"],
    patientInstructions: "Given by IV infusion. Report any rash, itching, or difficulty breathing during infusion. Metallic taste during infusion is normal.",
    monitoring: ["Iron, ferritin, TSAT","Hb","BP during infusion"],
    interactions: ["Oral iron not needed with IV"],
    pregnancyCategory: "B - safe in pregnancy",
    renalDose: "No adjustment; titrate to iron repletion",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Ferric Carboxymaltose": {
    drugClass: "IV Iron",
    mechanism: "High-dose IV iron preparation. Allows rapid correction of iron deficiency with fewer infusions (up to 1000mg per session). Longer stability than iron sucrose.",
    minDose: 500, maxDose: 1500, unit: "mg",
    commonDoses: ["500","750","1000","1500"], frequencies: ["weekly","single dose"], routes: ["IV"],
    indications: ["Iron deficiency anemia - rapid repletion","CKD with iron deficiency","NDD-CKD patients (FIND-CKD trial)"],
    contraindications: ["Anaphylaxis","Iron overload","First trimester pregnancy"],
    warnings: ["Hypophosphatemia (FGF-23 mediated) - monitor PO4","Hypotension","Anaphylaxis risk <0.1%","Extravasation - brown staining of skin"],
    sideEffects: ["Hypophosphatemia","Nausea","Dizziness","Headache","Infusion reactions","Transient \u2193 PO4"],
    patientInstructions: "Single high-dose infusion typically takes 15-30 minutes. Transient low phosphate is common and usually resolves. Stay hydrated after infusion.",
    monitoring: ["Ferritin, TSAT","Hb","Phosphate","BP"],
    interactions: ["PO4 levels - transient decrease is expected"],
    pregnancyCategory: "C - avoid first trimester",
    renalDose: "No adjustment; 500-1000mg single dose",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Oral Iron": {
    drugClass: "Oral Iron Supplement",
    mechanism: "Elemental iron absorbed via DMT1 in duodenum. First-line for mild iron deficiency in NDD-CKD. Ferrous sulfate (160mg = 50mg elemental Fe), ferrous fumarate, ferrous gluconate.",
    minDose: 50, maxDose: 200, unit: "mg elemental",
    commonDoses: ["50","65","100","200"], frequencies: ["OD","BD","alternate days"], routes: ["Oral"],
    indications: ["Iron deficiency in non-dialysis CKD","Pre-ESA iron repletion","Mild iron deficiency anemia"],
    contraindications: ["Iron overload","Hemochromatosis","Anemia of chronic disease without iron deficiency"],
    warnings: ["Alternate-day dosing improves absorption","GI side effects limit adherence","May reduce absorption of other meds","Low efficacy in dialysis patients"],
    sideEffects: ["Constipation","Dark stools","Nausea","Epigastric pain","Metallic taste"],
    patientInstructions: "Take on empty stomach with vitamin C (orange juice) for best absorption. If GI upset, take with food. Stools will be dark - this is normal. Wait 2 hours before/after other meds. Alternate-day dosing may be better.",
    monitoring: ["Ferritin, TSAT","Hb","GI tolerance"],
    interactions: ["Dairy (Ca) - \u2193 absorption","Antacids - \u2193 absorption","PPIs - \u2193 absorption","Thyroxine - separate by 4h"],
    pregnancyCategory: "A - safe",
    renalDose: "Dose per iron deficiency severity; no renal adjustment",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Kayexalate (Sodium Polystyrene Sulfonate)": {
    drugClass: "K+ Binder",
    mechanism: "Exchanges Na+ for K+ in GI tract \u2192 \u2193 serum K+. Cation-exchange resin. Historically used but recent evidence limited; newer agents preferred. Risk of colonic necrosis.",
    minDose: 15, maxDose: 60, unit: "g",
    commonDoses: ["15","30","60"], frequencies: ["OD","QID"], routes: ["Oral","Rectal"],
    indications: ["Hyperkalemia emergency (K+ >6.0 with ECG changes)","Maintenance of normokalemia in CKD"],
    contraindications: ["Bowel obstruction","Post-operative GI surgery","Hypokalemia","Neonates"],
    warnings: ["Colonic necrosis (especially with sorbitol) - FATAL","Electrolyte disturbances (Na+ load)","Not for acute K+ reduction (slow acting)","Can bind other meds"],
    sideEffects: ["Colonic necrosis","Constipation","Diarrhea","Sodium overload","Hypokalemia","Anorexia"],
    patientInstructions: "Take with food. Mix with water or syrup. Do not heat. Avoid sorbitol-containing preparations. Report abdominal pain or constipation.",
    monitoring: ["K+ daily","Sodium","ECG","Bowel function"],
    interactions: ["Sorbitol - colonic necrosis","Ca/Mg antacids - binding","Digoxin - \u2193 absorption"],
    pregnancyCategory: "C - avoid if possible",
    renalDose: "No adjustment; titrate to K+ target",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Patiromer": {
    drugClass: "K+ Binder (Novel)",
    mechanism: "Non-absorbed Ca-K+ exchange polymer that binds K+ in the colon. Novel agent with better safety profile than Kayexalate. AMETHYST-DN trial: effective and safe in CKD with RAASi.",
    minDose: 8.4, maxDose: 25.2, unit: "g",
    commonDoses: ["8.4","16.8","25.2"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hyperkalemia in CKD (maintenance)","Allow RAASi optimization in hyperkalemic patients","Mild-moderate hyperkalemia"],
    contraindications: ["Hypokalemia","Bowel obstruction","Severe constipation"],
    warnings: ["GI side effects common","May bind other meds - separate by 3h","No colonic necrosis risk (unlike Kayexalate)","Effective but can be expensive"],
    sideEffects: ["Constipation","Hypomagnesemia","Diarrhea","Flatulence","Nausea"],
    patientInstructions: "Mix powder with water, stir, drink immediately. Separate from other medications by 3 hours. Do not heat. Take with or without food. Stay hydrated.",
    monitoring: ["K+","Mg+ (can lower)","Bowel function"],
    interactions: ["Separate from ALL other oral meds by 3 hours"],
    pregnancyCategory: "C - limited data",
    renalDose: "No adjustment; titrate to K+ target",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Sodium Zirconium Cyclosilicate (SZC)": {
    drugClass: "K+ Binder (Novel)",
    mechanism: "Inorganic, non-absorbed K+ binder that selectively captures K+ in GI tract. Fast acting (within 1h). HARMONIZE trial: effective for acute + maintenance hyperkalemia.",
    minDose: 5, maxDose: 15, unit: "g",
    commonDoses: ["5","10","15"], frequencies: ["OD","TDS"], routes: ["Oral"],
    indications: ["Acute hyperkalemia (K+ >6.0)","Chronic hyperkalemia maintenance","Enable RAASi therapy"],
    contraindications: ["Hypokalemia","Bowel obstruction"],
    warnings: ["Edema (Na+ content - 1g SZC has 400mg Na)","GI side effects","Can cause hypokalemia if not titrated","Monitor K+ daily during acute phase"],
    sideEffects: ["Edema (from Na+)","Constipation","Hypokalemia","GI discomfort"],
    patientInstructions: "For acute: 10g TDS up to 72h. For maintenance: 5g OD. Mix with water, stir, drink. Monitor for swelling (from sodium content).",
    monitoring: ["K+ daily (acute)","Weekly (maintenance)","BP/weight - fluid status"],
    interactions: ["Separate from other meds by 2h","Diuretics - additive effect"],
    pregnancyCategory: "C - limited data",
    renalDose: "No adjustment; titrate to K+ target",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Allopurinol": {
    drugClass: "Xanthine Oxidase Inhibitor",
    mechanism: "Inhibits xanthine oxidase \u2192 \u2193 uric acid production. CKD patients with hyperuricemia may benefit from kidney protective effects (CKD-FIX, PERL trials - mixed results).",
    minDose: 50, maxDose: 900, unit: "mg",
    commonDoses: ["50","100","200","300"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hyperuricemia/Gout in CKD","Prevention of tumor lysis syndrome","Recurrent urate stones"],
    contraindications: ["Allopurinol hypersensitivity syndrome","Acute gout flare (not to start during)","Severe hepatic impairment"],
    warnings: ["Allopurinol hypersensitivity (DRESS, SJS/TEN) - START LOW, GO SLOW","Renal dose adjustment MANDATORY","Do NOT start during acute gout flare","Interactions with azathioprine/6-MP"],
    sideEffects: ["Rash (stop immediately if unexplained)","GI upset","Acute gout flare (first 6 weeks)","DRESS syndrome (rare, fatal)"],
    patientInstructions: "Take once daily after food. Start at low dose. Report ANY rash immediately - may be sign of serious allergy. Drink 2-3L fluids daily. Gout flares may increase first 6 weeks - do not stop.",
    monitoring: ["Uric acid (target <360 \u03BCmol/L)","LFTs","Renal function","Rash monitoring"],
    interactions: ["Azathioprine/6-MP - \u2191 toxicity (reduce to 25%)","Warfarin - \u2191 INR","Thiazides - \u2191 hypersensitivity risk"],
    pregnancyCategory: "C - avoid if possible",
    renalDose: "eGFR 30-60: 100-200mg OD; eGFR <30: 50-100mg OD; HD: 100mg post-dialysis TIW",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Febuxostat": {
    drugClass: "Xanthine Oxidase Inhibitor",
    mechanism: "Selective xanthine oxidase inhibitor (non-purine). Alternative to allopurinol. CARES trial: similar efficacy but possible CV safety signal vs allopurinol.",
    minDose: 40, maxDose: 120, unit: "mg",
    commonDoses: ["40","80","120"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Hyperuricemia/Gout in CKD (allopurinol intolerant)","CKD with hyperuricemia"],
    contraindications: ["Allopurinol hypersensitivity (no cross-reactivity documented)","Acute gout flare","Concurrent azathioprine/6-MP/mercaptopurine"],
    warnings: ["CV safety signal (CARES trial) - not conclusive","Hepatotoxicity","Gout flare first 6 weeks","No dose adjustment needed in mild-moderate CKD"],
    sideEffects: ["Gout flare","Nausea","LFT elevation","CV events (potential signal)","Hepatotoxicity"],
    patientInstructions: "Take once daily with or without food. Gout flares may occur for first 6 weeks - continue medication. Report jaundice, dark urine, or RUQ pain.",
    monitoring: ["Uric acid","LFTs","CV symptoms","Rash"],
    interactions: ["Azathioprine/6-MP - CONTRAINDICATED","Theophylline - \u2191 levels","Warfarin - \u2191 INR"],
    pregnancyCategory: "C - avoid",
    renalDose: "eGFR 15-60: 40-80mg OD; no HD data",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Atorvastatin": {
    drugClass: "Statin (HMG-CoA Reductase Inhibitor)",
    mechanism: "Competitive HMG-CoA reductase inhibitor \u2192 \u2193 cholesterol synthesis \u2192 \u2191 LDL receptor expression. CV event reduction in CKD (SHARP, 4D trials). Preferred statin in CKD (no renal dose adjustment).",
    minDose: 10, maxDose: 80, unit: "mg",
    commonDoses: ["10","20","40","80"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Primary CV prevention in CKD","Secondary CV prevention","SHARP trial CKD population","Diabetes + CKD"],
    contraindications: ["Active liver disease","Pregnancy","Breastfeeding","Concurrent cyclosporine (with caution)"],
    warnings: ["Muscle toxicity (myopathy, rhabdomyolysis) - rare","LFT monitoring recommended","Diabetes risk (small increase in HbA1c)","CYP3A4 drug interactions"],
    sideEffects: ["Myalgia","LFT elevation","Diarrhea","Headache","Nausea","Rhabdomyolysis (rare)"],
    patientInstructions: "Take once daily at same time. Grapefruit juice - avoid large amounts. Report unexplained muscle pain, tenderness, or weakness. Dark urine = seek care immediately.",
    monitoring: ["Lipid profile (non-HDL-C target)","LFTs","CK if muscle symptoms","HbA1c"],
    interactions: ["Grapefruit juice - \u2191 levels","CYP3A4 inhibitors (macrolides, azoles) - \u2191 toxicity","Warfarin - \u2191 INR","Ca antagonists - \u2191 levels"],
    pregnancyCategory: "X - CONTRAINDICATED",
    renalDose: "No dose adjustment in CKD; max 80mg OD",
    color: "#059669", tlColor: "#10b981",
  },
  "Rosuvastatin": {
    drugClass: "Statin (HMG-CoA Reductase Inhibitor)",
    mechanism: "High-potency statin with limited hepatic metabolism. Lower drug interaction profile than atorvastatin. Half-life 19h. Preferred in multiple drug regimens.",
    minDose: 5, maxDose: 40, unit: "mg",
    commonDoses: ["5","10","20","40"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Primary and secondary CV prevention","CKD-associated dyslipidemia","SHARP trial (with ezetimibe)"],
    contraindications: ["Active liver disease","Pregnancy","Breastfeeding","Severe renal impairment (max 10mg if eGFR <30)"],
    warnings: ["Proteinuria/hamaturia (transient, dose-related)","Myopathy risk","Renal dose cap: max 10mg if eGFR <30","Rosuvastatin less CYP3A4 dependent","Higher potency - start low"],
    sideEffects: ["Myalgia","LFT elevation","Headache","Abdominal pain","Proteinuria (reversible)","Rhabdomyolysis (rare)"],
    patientInstructions: "Take once daily at any time, with or without food. Swallow whole. Report muscle pain. Avoid large amounts of grapefruit juice (less interaction than atorvastatin).",
    monitoring: ["Lipid profile","LFTs","CK","Urine dipstick (proteinuria)"],
    interactions: ["Warfarin - \u2191 INR","Gemfibrozil - \u2191 levels","Antacids - separate by 2h","Protease inhibitors"],
    pregnancyCategory: "X - CONTRAINDICATED",
    renalDose: "eGFR <30: max 10mg OD; all else standard",
    color: "#059669", tlColor: "#10b981",
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

export function generateClinicalAlerts(
  eGFRTrend: number[],
  latestK: number | null,
  latestHCO3: number | null,
  latestHb: number | null,
  latestFerritin: number | null,
  latestTSAT: number | null,
  latestBP: { sys: number; dia: number } | null,
  latestACR: number | null,
  latestAlbumin: number | null,
  medications: CKDMedication[],
  hasAVFistula: boolean,
): ScientificAlert[] {
  const alerts: ScientificAlert[] = [];

  if (eGFRTrend.length >= 2) {
    const first = eGFRTrend[0];
    const last = eGFRTrend[eGFRTrend.length - 1];
    const annualDecline = ((first - last) / eGFRTrend.length) * 12;
    if (annualDecline > 5) {
      alerts.push({ id: "egfr_decline", severity: "warning", category: "CKD Progression",
        title: "eGFR Decline >" + Math.round(annualDecline) + " mL/min/year",
        detail: "Annualized eGFR decline exceeds 5 mL/min/year. Consider optimizing renoprotective therapy, rechecking for reversible causes, and nephrology referral.",
        evidence: "KDIGO 2024 - rapid progression defined as >5 mL/min/1.73m2/year decline; indicates need for intensified management",
        action: "Review BP control, ACEi/ARB dosing, volume status. Exclude NSAIDs, contrast, obstruction. Re-check eGFR in 2-4 weeks. Consider nephrology referral if sustained.",
        icon: "\uD83D\uDCC9" });
    }
  }

  const currenteGFR = eGFRTrend.length > 0 ? eGFRTrend[eGFRTrend.length - 1] : null;
  if (currenteGFR !== null && currenteGFR < 30) {
    alerts.push({ id: "egfr_lt30", severity: "urgent", category: "Advanced CKD",
      title: "eGFR " + currenteGFR + " mL/min - Prepare for RRT",
      detail: "eGFR below 30. Initiate discussions about renal replacement therapy options (HD, PD, transplant). Consider AV fistula creation if eGFR <20 or declining rapidly.",
      evidence: "KDIGO 2024 - eGFR <30 is CKD stage 4; comprehensive RRT education recommended",
      action: "Refer to vascular access for AV fistula evaluation. Refer to transplant center for pre-emptive transplant workup. Initiate CKD-MBD monitoring (PTH, Ca, PO4, Vit D). Review anemia management.",
      icon: "\u26A0\uFE0F" });
  }
  if (currenteGFR !== null && currenteGFR < 15) {
    alerts.push({ id: "egfr_lt15", severity: "critical", category: "CKD Stage 5 (ESRD)",
      title: "eGFR " + currenteGFR + " mL/min - CKD Stage 5",
      detail: "eGFR below 15. Patient has end-stage renal disease (ESRD). Urgent preparation for RRT required unless transplant planned pre-emptively.",
      evidence: "KDIGO 2024 - eGFR <15 defines CKD stage 5/ESRD",
      action: "URGENT: Initiate/confirm dialysis access (AV fistula/graft or PD catheter). Discuss dialysis modality. If transplant candidate, expedite transplant evaluation. Manage uremia, acidosis, anemia, hyperkalemia, and fluid overload.",
      icon: "\uD83D\uDEA8" });
  }

  if (latestK !== null && latestK > 6.0) {
    alerts.push({ id: "k_critical", severity: "critical", category: "Hyperkalemia Emergency",
      title: "Critical Hyperkalemia: K+ " + latestK + " mmol/L",
      detail: "Serum potassium >6.0 mmol/L is life-threatening. Risk of cardiac arrhythmia - obtain ECG immediately.",
      evidence: "KDIGO 2024 - K+ >6.0 requires emergency management; renal care society guidelines",
      action: "URGENT: STAT ECG. IV calcium gluconate if ECG changes present. IV insulin + glucose, inhaled salbutamol. IV sodium bicarbonate if acidotic. Consider SZC 10g TDS. Arrange dialysis if refractory.",
      icon: "\uD83D\uDEA8" });
  } else if (latestK !== null && latestK > 5.5) {
    alerts.push({ id: "k_high", severity: "urgent", category: "Hyperkalemia",
      title: "Hyperkalemia: K+ " + latestK + " mmol/L",
      detail: "Potassium >5.5 mmol/L. Review contributing medications (ACEi/ARB, MRA, K+ supplements). Consider K+ binder (patiromer or SZC).",
      evidence: "KDIGO 2024 - K+ >5.5 requires intervention; ESC guidelines for RAASi management",
      action: "Review medication list (ACEi/ARB/MRA/spironolactone). Consider K+ binder. Repeat K+. ECG if >6.0. Educate on dietary K+ restriction. Adjust or temporarily hold RAASi if progressive.",
      icon: "\u26A0\uFE0F" });
  }

  if (latestHCO3 !== null && latestHCO3 < 22) {
    alerts.push({ id: "acidosis", severity: "warning", category: "Metabolic Acidosis",
      title: "Metabolic Acidosis: HCO3 " + latestHCO3 + " mmol/L",
      detail: "Bicarbonate below target (>22). Metabolic acidosis in CKD accelerates progression. Consider oral sodium bicarbonate supplementation.",
      evidence: "KDIGO 2024 - HCO3 target >22; correcting acidosis may slow CKD progression per multiple RCTs",
      action: "Start sodium bicarbonate 500-650mg BD, titrate to HCO3 22-26. Monitor for Na+ load, BP increase, edema. Target HCO3 22-26 mmol/L.",
      icon: "\uD83E\uDDEA" });
  }

  if (latestHb !== null && latestHb < 10) {
    alerts.push({ id: "anemia_severe", severity: "urgent", category: "Renal Anemia",
      title: "Anemia: Hb " + latestHb + " g/dL",
      detail: "Hemoglobin below 10 g/dL. Anemia of CKD is associated with LVH, reduced QoL, and increased mortality. Evaluate iron stores and consider ESA if iron-replete.",
      evidence: "KDIGO 2024 - ESA therapy recommended when Hb <10 after iron deficiency corrected; target Hb 10-12",
      action: "Check iron studies (ferritin, TSAT). If ferritin <500 and TSAT <30%: IV iron (iron sucrose or ferric carboxymaltose). If iron-replete: initiate ESA (epoetin or darbepoetin). Refer to nephrology.",
      icon: "\uD83E\uDE78" });
  }

  if (latestFerritin !== null && latestTSAT !== null && (latestFerritin < 200 || latestTSAT < 30)) {
    alerts.push({ id: "iron_deficiency", severity: "warning", category: "Iron Deficiency",
      title: "Iron Deficiency: Ferritin " + latestFerritin + " / TSAT " + latestTSAT + "%",
      detail: "Low iron stores in CKD. Iron deficiency is the most common reversible cause of ESA hyporesponse.",
      evidence: "KDIGO 2024 - TSAT <30% and ferritin <500 indicate iron deficiency in CKD; IV iron preferred in dialysis",
      action: "Administer IV iron (iron sucrose 200mg x 5 doses or ferric carboxymaltose 500-1000mg). Recheck Hb in 2-4 weeks. Oral iron less effective in CKD (hepcidin blockade).",
      icon: "\uD83D\uDD2C" });
  }

  if (latestBP && (latestBP.sys >= 140 || latestBP.dia >= 90)) {
    alerts.push({ id: "bp_uncontrolled", severity: "warning", category: "Uncontrolled BP",
      title: "Uncontrolled BP: " + latestBP.sys + "/" + latestBP.dia + " mmHg",
      detail: "BP above target (<130/80 mmHg for CKD with proteinuria per KDIGO/ESC). Uncontrolled BP accelerates CKD progression.",
      evidence: "KDIGO 2024 - target BP <130/80 in CKD with proteinuria; ACEi/ARB first-line for BP control in CKD",
      action: "Optimize antihypertensive therapy. ACEi/ARB first-line. Add CCB or thiazide (if eGFR >30) or loop diuretic (if eGFR <30). Review salt restriction adherence.",
      icon: "\u2764\uFE0F" });
  }

  if (latestACR !== null && latestACR > 300) {
    alerts.push({ id: "proteinuria_worsening", severity: "warning", category: "Proteinuria",
      title: "Severe Proteinuria: ACR " + latestACR + " mg/g",
      detail: "ACR >300 mg/g (macroalbuminuria). High risk for CKD progression and CV events. Optimize ACEi/ARB dosing. Consider SGLT2i or finerenone.",
      evidence: "KDIGO 2024 - ACR >300 = A3 category, high risk; ACEi/ARB titrated to max tolerated dose for proteinuria reduction",
      action: "Maximize ACEi/ARB dose. Add SGLT2i (dapagliflozin CREDENCE/DAPA-CKD proven). Consider finerenone if K+ and eGFR permit. Re-check ACR in 1-3 months.",
      icon: "\uD83E\uDDEA" });
  }

  if (latestAlbumin !== null && latestAlbumin < 35) {
    alerts.push({ id: "low_albumin", severity: "warning", category: "Hypoalbuminemia",
      title: "Low Albumin: " + latestAlbumin + " g/L",
      detail: "Low albumin may indicate malnutrition, inflammation, or nephrotic-range proteinuria. Poor nutritional status in CKD is associated with worse outcomes.",
      evidence: "KDIGO 2024 - malnutrition-inflammation complex in CKD associated with increased mortality",
      action: "Assess nutritional status. Consider dietary consultation. Check for nephrotic syndrome (proteinuria, edema). Evaluate for underlying inflammation or liver disease.",
      icon: "\u2695\uFE0F" });
  }

  if (currenteGFR !== null && currenteGFR < 30 && !hasAVFistula) {
    alerts.push({ id: "av_fistula", severity: "warning", category: "Vascular Access Planning",
      title: "AV Fistula Not Created (eGFR " + currenteGFR + ")",
      detail: "eGFR below 30. AV fistula creation should be planned to allow adequate maturation time (4-6 months) before dialysis initiation.",
      evidence: "KDIGO 2024 - AV fistula preferred for HD access; refer when eGFR <30 and declining; allow 4-6 months maturation",
      action: "Refer to vascular surgeon for AV fistula evaluation and creation. Perform vein mapping. Consider PD catheter as alternative. Educate patient on fistula care and preservation.",
      icon: "\uD83C\uDF7A" });
  }

  return alerts;
}

export interface PatientSummary {
  id: string; name: string; age?: number; sex?: string; email?: string;
  phone?: string; universalId?: string; diagnosis?: string; riskLevel?: string;
  lastVisit?: string; nextReview?: string;
  latesteGFR?: number; latestCreatinine?: number; latestAt?: Date;
  totalReadings: number;
}

interface RawCKDReading {
  id: string; patientId: string; toolType: string; recordedAt: Timestamp;
  doctorNote?: string; doctorReviewed?: boolean;
  data?: {
    eGFR?: number; creatinine?: number; potassium?: number; sodium?: number;
    HCO3?: number; calcium?: number; phosphate?: number; magnesium?: number;
    albumin?: number; Hb?: number; ferritin?: number; TSAT?: number;
    PTH?: number; vitD?: number; BUN?: number; chloride?: number;
    ACR?: number; BP_sys?: number; BP_dia?: number;
  };
}

export interface CKDReading {
  id: string; recordedAt: Date;
  date?: string; ckdStage?: string;
  eGFR?: number; creatinine?: number; BUN?: number;
  potassium?: number; sodium?: number; chloride?: number; HCO3?: number;
  calcium?: number; phosphate?: number; magnesium?: number; albumin?: number;
  Hb?: number; ferritin?: number; TSAT?: number; PTH?: number; vitD?: number;
  ACR?: number; BP_sys?: number; BP_dia?: number;
  source: "patient"|"clinic"|"lab";
  doctorNote?: string; doctorReviewed?: boolean;
}

export interface CKDMedication {
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
  changeHistory?: CKDoseChange[];
}

export interface CKDoseChange {
  date: string; changeType: "started"|"dose_increase"|"dose_decrease"|"stopped"|"paused"|"restarted";
  previousDose?: string; newDose?: string; changedBy: string; reason?: string;
}

export interface CKDAlert {
  id: string; trigger: string; actions: string[]; createdAt: string;
  doctorNote?: string; category?: string;
  history: { date: string; message: string }[];
}

export interface CKDComplication {
  name: string; date: string; id?: string;
}

export interface CKDLifestyleItem {
  name: string; grade: "Good"|"Moderate"|"Poor"; updatedAt?: string; id?: string;
}

export interface CKDLabOrder {
  id?: string; name: string; result?: string; orderedAt?: string;
  type?: "lab"|"imaging"; status?: string;
  study?: string; modality?: string; bodyPart?: string; urgency?: string;
  patientId?: string;
}

export interface CKDClinicalNote {
  id?: string; date: string;
  cc?: string; hpi?: string; exam?: string; investigations?: string;
  assessment?: string; plan?: string;
  diagnoses?: string[]; followUps?: string[];
  isLocked?: boolean; lastEditedAt?: string;
  doctorId?: string; doctorName?: string;
  visitType?: string; vitals?: Record<string, string>;
}

export interface CKDTimelineEvent {
  id: string; date: string;
  type: "visit"|"med"|"alert"|"reading"|"note"|"lab";
  icon: string; title: string; detail?: string;
}

export interface CKDMessage {
  id?: string; from: "doctor"|"patient";
  senderId?: string; senderName?: string; senderRole?: string;
  time: string; text: string; read?: boolean;
  status?: string; threadId?: string; timestamp?: Date;
}

export interface CKDAdherenceMap {
  [medId: string]: { [date: string]: boolean };
}

export interface CKDEducationTopic {
  id: string; title: string; content: string; keyPoints: string[];
  category: string; duration: string;
  sentAt?: string; acknowledged?: boolean;
}

export const EDUCATION_TOPICS: CKDEducationTopic[] = [
  {
    id: "ckd_stages", title: "Understanding CKD Stages",
    content: "Chronic Kidney Disease (CKD) is classified into stages based on eGFR (estimated glomerular filtration rate). Stage 1: eGFR >90 with kidney damage (proteinuria, structural abnormalities). Stage 2: eGFR 60-89 with kidney damage. Stage 3: eGFR 30-59 (subdivided into 3a: 45-59, 3b: 30-44). Stage 4: eGFR 15-29 - prepare for renal replacement therapy. Stage 5: eGFR <15 - end-stage renal disease (ESRD), dialysis or transplant needed.",
    keyPoints: [
      "eGFR is your kidney function estimate - higher is better",
      "CKD stage determines what treatments and monitoring you need",
      "Regular blood tests (every 3-6 months) track your stage",
      "Earlier stages: focus on slowing progression",
      "Later stages: prepare for dialysis or transplant"
    ],
    category: "Foundation", duration: "5 min"
  },
  {
    id: "low_protein_diet", title: "Low Protein Diet in CKD",
    content: "Reducing dietary protein intake can slow CKD progression by reducing glomerular hyperfiltration and uremic toxin production. The recommended intake is 0.6-0.8 g/kg/day for non-dialysis CKD stages 3-5 (vs. 1.2-1.5 g/kg in general population). Good protein sources include egg whites, fish, chicken, tofu in controlled portions. Work with a renal dietitian to avoid malnutrition.",
    keyPoints: [
      "Target: 0.6-0.8g protein per kg body weight per day",
      "Spread protein intake evenly across meals",
      "High-quality proteins: egg whites, fish, lean poultry",
      "Avoid processed meats (high in phosphate and sodium)",
      "Work with a dietitian to prevent malnutrition",
      "Not for dialysis patients who need MORE protein (1.2g/kg)"
    ],
    category: "Nutrition", duration: "6 min"
  },
  {
    id: "salt_restriction_ckd", title: "Salt Restriction in CKD",
    content: "Salt (sodium) restriction is crucial in CKD because the kidneys cannot excrete excess sodium effectively. Excess sodium leads to fluid overload, hypertension, edema, and accelerates CKD progression. Aim for <5g salt/day (<2g sodium). This is especially important in later stages.",
    keyPoints: [
      "Target: <5g salt (approx 1 teaspoon) per day",
      "Avoid processed foods: deli meats, canned soups, frozen dinners, chips",
      "Avoid adding salt at the table - taste food first",
      "Read labels for sodium content - aim <400mg per serving",
      "Limit eating out - restaurant food is very high in salt",
      "Use lemon, herbs, garlic, onion, and spices instead of salt"
    ],
    category: "Lifestyle", duration: "5 min"
  },
  {
    id: "potassium_management", title: "Potassium Management",
    content: "CKD impairs the kidneys ability to excrete potassium, leading to hyperkalemia (high K+). This is dangerous as it can cause cardiac arrhythmias. Dietary potassium restriction is needed when K+ >5.0. Avoid high-potassium foods: bananas, oranges, potatoes (boil to leach), tomatoes, avocado, dried fruits.",
    keyPoints: [
      "Normal K+: 3.5-5.0 mmol/L",
      "High K+ (>5.5) can cause dangerous heart rhythm problems",
      "High-K foods to limit: banana, orange, potato, tomato, avocado, kiwi, dried fruit",
      "Lower-K fruits: apple, berries, grapes, peach, pear",
      "Boil vegetables - some K+ leaches into water",
      "Avoid salt substitutes (KCl-based)",
      "Key medications that raise K+: ACEi, ARB, spironolactone, K+ supplements"
    ],
    category: "Nutrition", duration: "6 min"
  },
  {
    id: "phosphate_binders", title: "Phosphate Binders - How to Take",
    content: "Phosphate binders are medications that prevent dietary phosphate from being absorbed into the blood. They must be taken WITH meals to be effective. Types: Calcium-based (calcium carbonate, calcium acetate) and non-calcium-based (sevelamer, lanthanum, sucroferric oxyhydroxide). The choice depends on your calcium levels, PTH, and vascular calcification risk.",
    keyPoints: [
      "ALWAYS take with meals - never on empty stomach",
      "Chew or crush tablets thoroughly (some require chewing)",
      "Separate from other medications by 2 hours",
      "Goal: control serum PO4 to 1.13-1.78 mmol/L",
      "Non-calcium binders preferred if calcification risk",
      "Constipation is common - increase fluids and fiber"
    ],
    category: "Medications", duration: "5 min"
  },
  {
    id: "anemia_management", title: "Anemia Management in CKD",
    content: "Anemia is very common in CKD, especially in stages 4-5. The kidneys produce erythropoietin (EPO), which signals bone marrow to make red blood cells. Damaged kidneys produce less EPO, causing anemia. Treatment includes: iron supplementation (oral or IV) and ESAs (erythropoiesis-stimulating agents like epoetin or darbepoetin). Target Hb is 10-12 g/dL.",
    keyPoints: [
      "Hb target: 10-12 g/dL (higher targets increase risk)",
      "Iron stores must be adequate before starting ESA",
      "IV iron is more effective than oral in CKD",
      "Fatigue, shortness of breath, pallor are common symptoms",
      "ESA requires regular blood monitoring (weekly initially)",
      "ESA is given SC or IV - frequency depends on type"
    ],
    category: "Treatments", duration: "5 min"
  },
  {
    id: "preparing_dialysis", title: "Preparing for Dialysis",
    content: "When CKD progresses to stage 5 (eGFR <15), renal replacement therapy (RRT) becomes necessary to sustain life. The two main forms of dialysis are hemodialysis (HD) and peritoneal dialysis (PD). Pre-emptive kidney transplant is the best option for suitable candidates.",
    keyPoints: [
      "eGFR <15 or symptoms of uremia = time to start",
      "Hemodialysis (HD): 3-4 hours, 3x/week, at center or home",
      "Peritoneal dialysis (PD): daily, at home, more flexible",
      "AV fistula needs 4-6 months to mature - plan ahead",
      "PD catheter placed 2-4 weeks before starting",
      "Discuss all options with your nephrologist early",
      "Patients who plan ahead live longer on dialysis"
    ],
    category: "Treatments", duration: "7 min"
  },
  {
    id: "av_fistula_care", title: "AV Fistula Care",
    content: "An AV fistula is a surgically created connection between an artery and a vein, usually in the arm, which provides reliable access for hemodialysis. It must be created months before dialysis starts to allow maturation. Proper care is essential.",
    keyPoints: [
      "AV fistula takes 4-6 months to mature after surgery",
      "Feel for thrill (buzzing sensation) - means it is working",
      "Listen for bruit (whooshing sound) with stethoscope",
      "Keep the arm clean and dry",
      "Do not wear tight watches, jewelry, or tight sleeves",
      "No BP measurements on fistula arm",
      "No blood draws or IVs in fistula arm",
      "Elevate arm after surgery to reduce swelling",
      "Report: no thrill/bruit, redness, swelling, pain, bleeding"
    ],
    category: "Procedures", duration: "5 min"
  },
  {
    id: "peritoneal_dialysis", title: "Peritoneal Dialysis Basics",
    content: "Peritoneal dialysis (PD) uses the peritoneum (lining of the abdominal cavity) as a natural filter. Dialysis solution is infused through a catheter, dwells in the abdomen, and then drains out, removing waste and excess fluid. PD offers flexibility, independence, and better preservation of residual kidney function.",
    keyPoints: [
      "PD can be done at home, at work, or while traveling",
      "Two types: CAPD (manual, 4x/day exchanges) and APD (machine at night)",
      "PD catheter placed surgically 2-4 weeks before starting",
      "You must keep the catheter exit site clean and dry",
      "Training takes about 1-2 weeks",
      "Benefits: preserve residual kidney function, fewer dietary restrictions",
      "Risks: peritonitis (infection of PD catheter), hernia"
    ],
    category: "Treatments", duration: "6 min"
  },
  {
    id: "transplant_evaluation", title: "Transplant Evaluation",
    content: "Kidney transplant offers the best outcomes for ESRD - better survival, quality of life, and fewer dietary restrictions than dialysis. Pre-emptive transplant (before starting dialysis) has the best results. The evaluation involves a multidisciplinary team and includes medical, surgical, and psychosocial assessments.",
    keyPoints: [
      "Pre-emptive transplant (before dialysis) offers best outcomes",
      "Evaluation includes: blood tests, cardiac workup, cancer screening",
      "Active infections, recent cancer, severe heart disease may be barriers",
      "Waitlist: average 3-5 years for deceased donor",
      "Living donor transplant can be done electively",
      "You must be healthy enough to undergo surgery"
    ],
    category: "Treatments", duration: "6 min"
  },
  {
    id: "fluid_restriction", title: "Fluid Restriction in Advanced CKD",
    content: "As CKD progresses, urine output decreases, and excess fluid accumulates in the body. Fluid overload causes edema, hypertension, pulmonary congestion, and heart failure. Fluid restriction is needed when eGFR <15 or if you are on dialysis, and typically ranges from 1-2L/day depending on urine output.",
    keyPoints: [
      "Typical limit: 1-1.5L/day (check with your doctor)",
      "Include ALL fluids: water, tea, coffee, soup, ice cream, jelly",
      "Ice chips: 1 cup = approx 150mL water",
      "Thirst control: chew gum, suck on hard candy, lemon slices",
      "Weigh yourself daily - >2kg gain in 2 days = fluid overload",
      "Salt restriction helps reduce thirst"
    ],
    category: "Lifestyle", duration: "5 min"
  },
  {
    id: "medication_review_ckd", title: "Medication Review in CKD",
    content: "Many medications are cleared by the kidneys and need dose adjustment or avoidance as eGFR declines. NSAIDs (ibuprofen, diclofenac) should be avoided entirely in CKD - they reduce kidney blood flow and accelerate CKD. Metformin, certain antibiotics, and some pain medications need dose adjustment. Always check with your nephrologist before starting any new medication.",
    keyPoints: [
      "Avoid NSAIDs (ibuprofen, naproxen, diclofenac) - speed up CKD",
      "ACEi/ARB may cause a small creatinine rise - this is normal",
      "Metformin dose limit when eGFR <45; stop when eGFR <30",
      "Some antibiotics need dose adjustment (check with doctor)",
      "Contrast dye for CT scans can harm kidneys - discuss with nephrologist",
      "Herbal supplements may be harmful - always ask",
      "Always bring a current medication list to every appointment"
    ],
    category: "Medications", duration: "6 min"
  },
];

function normalizeCKDReading(raw: Record<string, unknown>, id: string): CKDReading | null {
  const d = raw.data as Record<string, number> | undefined;
  const recordedAt = raw.recordedAt instanceof Timestamp ? raw.recordedAt.toDate() : new Date(raw.recordedAt as string);
  return {
    id, recordedAt,
    eGFR: (d?.eGFR ?? raw.eGFR) as number,
    creatinine: (d?.creatinine ?? raw.creatinine) as number,
    BUN: (d?.BUN ?? raw.BUN) as number,
    potassium: (d?.potassium ?? raw.potassium) as number,
    sodium: (d?.sodium ?? raw.sodium) as number,
    chloride: (d?.chloride ?? raw.chloride) as number,
    HCO3: (d?.HCO3 ?? raw.HCO3) as number,
    calcium: (d?.calcium ?? raw.calcium) as number,
    phosphate: (d?.phosphate ?? raw.phosphate) as number,
    magnesium: (d?.magnesium ?? raw.magnesium) as number,
    albumin: (d?.albumin ?? raw.albumin) as number,
    Hb: (d?.Hb ?? raw.Hb) as number,
    ferritin: (d?.ferritin ?? raw.ferritin) as number,
    TSAT: (d?.TSAT ?? raw.TSAT) as number,
    PTH: (d?.PTH ?? raw.PTH) as number,
    vitD: (d?.vitD ?? raw.vitD) as number,
    ACR: (d?.ACR ?? raw.ACR) as number,
    BP_sys: (d?.BP_sys ?? raw.BP_sys) as number,
    BP_dia: (d?.BP_dia ?? raw.BP_dia) as number,
    source: "clinic",
    doctorNote: raw.doctorNote as string,
    doctorReviewed: raw.doctorReviewed as boolean,
  };
}

function avgByKey(arr: CKDReading[], key: keyof CKDReading): number | null {
  const vals = arr.map(r => r[key] as number).filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null;
}

function exportNoteAsPDF(note: CKDClinicalNote, patientName: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Clinical Note - ' + patientName + '</title>');
  w.document.write('<style>');
  w.document.write('body{font-family:Segoe UI,Arial,sans-serif;padding:40px;color:#111;background:#fff;max-width:800px;margin:0 auto}');
  w.document.write('.header{border-bottom:3px solid #0891b2;padding-bottom:16px;margin-bottom:24px}');
  w.document.write('.logo{color:#0891b2;font-size:22px;font-weight:800}');
  w.document.write('.sub{color:#6b7280;font-size:12px;margin-top:4px}');
  w.document.write('.patient{background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;border-left:4px solid #0891b2}');
  w.document.write('.section{margin-bottom:16px;page-break-inside:avoid}');
  w.document.write('.section-title{color:#0891b2;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;border-bottom:0.5px solid #e5e7eb;padding-bottom:4px}');
  w.document.write('.section-content{font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap}');
  w.document.write('.footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between}');
  w.document.write('.badge{display:inline-block;padding:2px 8px;border-radius:4px;background:#ccfbf1;color:#0891b2;font-size:11px;font-weight:600;margin-left:8px}');
  w.document.write('@media print{body{padding:20px}.no-print{display:none}}');
  w.document.write('</style></head><body>');
  w.document.write('<div class="header"><div class="logo">AMEXAN Health System</div><div class="sub">CKD Control Center - Clinical Note</div></div>');
  w.document.write('<div class="patient"><strong>Patient:</strong> ' + patientName + ' &nbsp;|&nbsp; <strong>Date:</strong> ' + note.date + ' &nbsp;|&nbsp; <strong>Visit Type:</strong> ' + (note.visitType ?? "Clinic Visit") + ' &nbsp;|&nbsp; <strong>Doctor:</strong> ' + (note.doctorName ?? "AMEXAN") + '<span class="badge">CKD</span></div>');
  if (note.cc) w.document.write('<div class="section"><div class="section-title">Chief Complaint</div><div class="section-content">' + note.cc + '</div></div>');
  if (note.hpi) w.document.write('<div class="section"><div class="section-title">History of Present Illness</div><div class="section-content">' + note.hpi + '</div></div>');
  if (note.exam) w.document.write('<div class="section"><div class="section-title">Examination Findings</div><div class="section-content">' + note.exam + '</div></div>');
  if (note.investigations) w.document.write('<div class="section"><div class="section-title">Investigations</div><div class="section-content">' + note.investigations + '</div></div>');
  if (note.assessment) w.document.write('<div class="section"><div class="section-title">Assessment / Diagnosis</div><div class="section-content">' + note.assessment + '</div></div>');
  if (note.plan) w.document.write('<div class="section"><div class="section-title">Management Plan</div><div class="section-content">' + note.plan + '</div></div>');
  if (note.followUps?.length) w.document.write('<div class="section"><div class="section-title">Follow-up Instructions</div><div class="section-content">' + note.followUps.join("\n") + '</div></div>');
  w.document.write('<div class="footer"><span>AMEXAN Health System - CKD Monitoring</span><span>Generated: ' + new Date().toLocaleString() + '</span><span>Note ID: ' + (note.id ?? "-") + '</span></div>');
  w.document.write('</body></html>');
  w.document.close();
}
const COMPLICATIONS = ["Anemia of CKD","Renal Bone Disease (CKD-MBD)","Hyperkalemia","Metabolic Acidosis","Uremia","Volume Overload","Pericarditis (Uremic)","Malnutrition","Secondary Hyperparathyroidism","Vascular Calcification"];
const LIFESTYLE_ITEMS = ["Low protein diet (0.6-0.8g/kg/day)","Salt restriction (<5g/day)","Potassium management","Fluid restriction (1-1.5L/day)","Phosphate binder compliance","Smoking cessation","Regular exercise (adapted)","Medication adherence","BP monitoring routine","Avoid NSAIDs"];
const SPECIALTIES = ["Nephrology","Renal Dietitian","Vascular Surgeon","Transplant Coordinator","Transplant Surgeon","Pharmacy (Renal Dosing)","Cardiology","Endocrinology","Palliative Care","Social Worker"];
const URGENCIES: string[] = ["routine","urgent","emergency"];
const VISIT_TYPES = ["new_patient","follow_up","emergency","telemedicine","home_visit","discharge_review"];
const LAB_PANEL = ["eGFR (CKD-EPI)","Serum Creatinine","BUN","Serum Potassium (K+)","Serum Sodium (Na+)","Serum Chloride (Cl-)","Bicarbonate (HCO3-)","Corrected Calcium","Serum Phosphate","Serum Magnesium","Serum Albumin","Hemoglobin (Hb)","Ferritin","Transferrin Saturation (TSAT)","PTH (Intact)","Vitamin D (25-OH)","Urine ACR (Albumin:Creatinine)","HbA1c (if diabetic)","Uric Acid","Lipid Profile"];
const IMAGING_PANEL = ["Renal Ultrasound (USS)","Renal Doppler Ultrasound","KUB (Kidneys, Ureters, Bladder)","CT Abdomen (non-contrast)","CT Abdomen with contrast (with caution)","MRI Abdomen (no gadolinium if eGFR <30)","Chest X-Ray (fluid assessment)","Echocardiogram","Renal MAG-3 Scan","DEXA Bone Density"];
const CKD_DRUGS = ["Ramipril","Lisinopril","Losartan","Valsartan","Candesartan","Empagliflozin","Dapagliflozin","Furosemide","Bumetanide","Spironolactone","Eplerenone","Sodium Bicarbonate","Sevelamer","Calcium Carbonate","Lanthanum Carbonate","Cinacalcet","Calcitriol","Paricalcitol","Epoetin Alfa","Darbepoetin","Iron Sucrose","Ferric Carboxymaltose","Oral Iron","Kayexalate","Patiromer","Sodium Zirconium Cyclosilicate","Allopurinol","Febuxostat","Atorvastatin","Rosuvastatin"];
const FREQS = ["OD (Once daily)","BD (Twice daily)","TDS (Three times daily)","QDS (Four times daily)","Nocte (At bedtime)","PRN (As needed)","TIW (Three times weekly)","Alternate days"];
const UNITS = ["mg","mcg","g","IU","mL","mmol"];
const ROUTES_LIST = ["Oral","IV","SC","Sublingual","IM","Topical","Inhaled","Rectal"];

const T = {
  bg: "#f9fafb", card: "#ffffff", border: "rgba(0,0,0,0.08)",
  text: "#111827", muted: "#6b7280", faint: "#9ca3af",
  danger: "#dc2626", info: "#0891b2", success: "#059669", warn: "#d97706", purple: "#7c3aed",
  teal: "#0891b2", orange: "#ea580c", pink: "#db2777",
} as const;

const CHANGE_COLORS: Record<CKDoseChange["changeType"], { bg: string; color: string; label: string }> = {
  started: { bg: "#f0fdf4", color: "#059669", label: "Started" },
  dose_increase: { bg: "#fff7ed", color: "#d97706", label: "\u2191 Dose Increased" },
  dose_decrease: { bg: "#eff6ff", color: "#0891b2", label: "\u2193 Dose Decreased" },
  stopped: { bg: "#fef2f2", color: "#dc2626", label: "Stopped" },
  paused: { bg: "#fefce8", color: "#ca8a04", label: "Paused" },
  restarted: { bg: "#f0fdfa", color: "#0891b2", label: "Restarted" },
};

const GLOBAL_CSS = [
  ".ckd-root*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}",
  ".ckd-root{font-family:'DM Sans','Plus Jakarta Sans','Segoe UI',system-ui,sans-serif}",
  "@keyframes ckd-pulse{0%,100%{opacity:1}50%{opacity:.4}}",
  "@keyframes ckd-fade-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}",
  ".ckd-fade{animation:ckd-fade-in 0.18s ease}",
  ".ckd-scroll{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.12) transparent}",
  ".ckd-scroll::-webkit-scrollbar{width:4px;height:4px}",
  ".ckd-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}",
  ".ckd-btn-press{transition:transform 0.1s,opacity 0.1s}",
  ".ckd-btn-press:active{transform:scale(0.97);opacity:0.85}",
  "@media(max-width:640px){",
    ".ckd-wa-track{display:none!important}.ckd-desktop-layout{display:none!important}.ckd-page-header{display:none!important}",
    ".ckd-root{position:fixed!important;inset:0!important;overflow:hidden!important;padding:0!important;display:flex!important;flex-direction:column!important}",
    ".ckd-mobile-list{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow-y:auto!important;background:#fff!important}",
    ".ckd-mobile-list.hidden{display:none!important}",
    ".ckd-mobile-detail{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#f9fafb!important}",
    ".ckd-mobile-detail.hidden{display:none!important}",
    ".ckd-list-topbar{position:sticky!important;top:0!important;z-index:20!important;background:#0891b2!important;color:#fff!important;padding:14px 16px 10px!important;min-height:56px!important;flex-shrink:0!important}",
    ".ckd-list-topbar h2{color:#fff!important;font-size:17px!important;margin:0!important;font-weight:800}",
    ".ckd-list-topbar p{color:rgba(255,255,255,.75)!important;font-size:11px!important;margin:2px 0 0!important}",
    ".ckd-list-search{padding:8px 12px!important;background:#f9fafb!important;position:sticky!important;top:56px!important;z-index:9!important;border-bottom:0.5px solid rgba(0,0,0,.07)!important;flex-shrink:0!important}",
    ".ckd-list-search input{width:100%!important;border-radius:20px!important;padding:8px 14px!important;border:none!important;background:#ececec!important;font-size:14px!important;outline:none!important;font-family:inherit!important}",
    ".ckd-patient-btn{width:100%!important;display:flex!important;align-items:center!important;gap:12px!important;padding:12px 16px!important;border:none!important;border-bottom:.5px solid rgba(0,0,0,.07)!important;background:#fff!important;cursor:pointer!important;text-align:left!important;min-height:64px!important}",
    ".ckd-patient-btn:active,.ckd-patient-btn.active-row{background:#f0fdfa!important}",
    ".ckd-patient-avatar{width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(8,145,178,.12)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:19px!important;font-weight:800!important;color:#0891b2!important;flex-shrink:0!important}",
    ".ckd-patient-row-info{flex:1!important;min-width:0!important}",
    ".ckd-patient-row-name{font-weight:600;font-size:14px;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".ckd-patient-row-sub{font-size:11px;color:#9ca3af;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".ckd-patient-row-bp{text-align:right;flex-shrink:0}",
    ".ckd-detail-topbar{position:sticky!important;top:0!important;z-index:20!important;background:#0891b2!important;padding:10px 14px!important;display:flex!important;align-items:center!important;gap:10px!important;min-height:56px!important;flex-shrink:0!important}",
    ".ckd-back-btn{background:none!important;border:none!important;color:#fff!important;font-size:28px!important;cursor:pointer!important;padding:0 8px 0 0!important;flex-shrink:0!important;line-height:1!important}",
    ".ckd-detail-topbar-avatar{width:36px!important;height:36px!important;border-radius:50%!important;background:rgba(255,255,255,.25)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:800!important;font-size:16px!important;flex-shrink:0!important;color:#fff!important}",
    ".ckd-detail-topbar-info{flex:1!important;min-width:0!important;overflow:hidden!important}",
    ".ckd-detail-topbar-name{font-weight:700;font-size:15px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".ckd-detail-topbar-sub{font-size:11px;color:rgba(255,255,255,.8)}",
    ".ckd-detail-content{flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;padding:10px 10px 100px!important;-webkit-overflow-scrolling:touch!important;width:100%!important}",
    ".ckd-tabs-wrap{position:sticky!important;top:56px!important;z-index:15!important;background:#fff!important;border-bottom:.5px solid rgba(0,0,0,.08)!important;flex-shrink:0!important;width:100%!important}",
    ".ckd-tabs{display:flex!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;flex-wrap:nowrap!important;padding:4px 8px!important;gap:2px!important;background:#fff!important;border-radius:0!important;border:none!important;margin-bottom:0!important;width:100%!important}",
    ".ckd-tabs::-webkit-scrollbar{display:none!important}",
    ".ckd-tab-btn{font-size:10px!important;padding:5px 8px!important;white-space:nowrap!important;min-height:32px!important}",
    ".ckd-panel{padding:12px!important;border-radius:10px!important;overflow-x:hidden!important}",
    ".ckd-comp-grid{grid-template-columns:1fr 1fr!important}",
    ".ckd-note-grid{grid-template-columns:1fr!important}",
    ".ckd-labs-grid{grid-template-columns:1fr!important}",
    ".ckd-detail-content *{max-width:100%!important}",
    "table{display:block!important;overflow-x:auto!important;width:100%!important}",
  "}",
  "@media(min-width:641px) and (max-width:1023px){",
    ".ckd-mobile-list,.ckd-mobile-detail,.ckd-wa-track{display:none!important}",
    ".ckd-desktop-layout{display:flex!important}",
    ".ckd-patient-list{width:240px!important;flex-shrink:0!important}",
    ".ckd-tabs{flex-wrap:wrap!important}",
    ".ckd-tab-btn{font-size:11px!important}",
    ".ckd-note-grid{grid-template-columns:1fr 1fr!important}",
    ".ckd-labs-grid{grid-template-columns:1fr 1fr!important}",
    ".ckd-comp-grid{grid-template-columns:1fr 1fr 1fr!important}",
  "}",
  "@media(min-width:1024px){",
    ".ckd-mobile-list,.ckd-mobile-detail,.ckd-wa-track{display:none!important}",
    ".ckd-desktop-layout{display:flex!important}",
    ".ckd-patient-list{width:290px!important;flex-shrink:0!important}",
    ".ckd-note-grid{grid-template-columns:1fr 1fr!important}",
    ".ckd-labs-grid{grid-template-columns:1fr 1fr!important}",
    ".ckd-comp-grid{grid-template-columns:1fr 1fr 1fr!important}",
  "}",
].join("\n");
function Dot({ color }: { color: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

function SectHeader({ label, color, sub }: { label: string; color: string; sub?: string }) {
  return (
    <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
      <Dot color={color} />{label}
      {sub && <span style={{ fontSize: 9, color: T.faint, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>{"\u00B7"} {sub}</span>}
    </div>
  );
}

function Badge({ text, color, bg, border }: { text: string; color: string; bg: string; border: string }) {
  return <span style={{ padding: "2px 7px", borderRadius: 5, background: bg, color, border: "0.5px solid " + border, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="ckd-stat-card" style={{ background: T.bg, border: "0.5px solid " + T.border, borderTop: "2px solid " + (color ?? T.border), borderRadius: 10, padding: "10px 13px", flex: 1, minWidth: 90 }}>
      <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div className="sv" style={{ color: color ?? T.text, fontSize: 18, fontWeight: 800, lineHeight: 1.1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ color: T.faint, fontSize: 10 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={"ckd-panel ckd-fade" + (className ? " " + className : "")} style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 14, padding: "16px 18px", ...style }}>{children}</div>;
}

function Skeleton({ height = 200 }: { height?: number }) {
  return <div style={{ height, background: T.bg, borderRadius: 10, border: "0.5px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.faint, fontSize: 13 }}><span style={{ animation: "ckd-pulse 1.4s ease-in-out infinite" }}>Loading{"\u2026"}</span></div>;
}

function Btn({ label, variant = "default", onClick, fullWidth, small, icon, disabled }: {
  label: string; variant?: "default"|"primary"|"success"|"warn"|"danger"|"info";
  onClick?: () => void; fullWidth?: boolean; small?: boolean; icon?: string; disabled?: boolean;
}) {
  const s: Record<string, React.CSSProperties> = {
    default: { background: "transparent", color: T.muted, border: "0.5px solid " + T.border },
    primary: { background: T.info, color: "#fff", border: "1px solid " + T.info },
    success: { background: T.success, color: "#fff", border: "1px solid " + T.success },
    warn:    { background: "#fff7ed", color: T.warn, border: "0.5px solid " + T.warn },
    danger:  { background: "#fef2f2", color: T.danger, border: "0.5px solid " + T.danger },
    info:    { background: "#eff6ff", color: T.info, border: "0.5px solid " + T.info },
  };
  return (
    <button onClick={onClick} disabled={disabled} className="ckd-btn-press" style={{
      ...s[variant], padding: small ? "4px 9px" : "8px 13px", borderRadius: 8, fontSize: small ? 10 : 12, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      width: fullWidth ? "100%" : undefined, display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 4, minHeight: small ? 28 : 36, fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s",
    }}>
      {icon && <span style={{ fontSize: small ? 11 : 13 }}>{icon}</span>}{label}
    </button>
  );
}

function InpField({ label, value, onChange, placeholder, type }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ flex: 1 }}>
      {label && <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{label}</div>}
      <input type={type ?? "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
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

function PharmaCard({ drug }: { drug: string }) {
  const info = getDrugInfo(drug);
  const [expanded, setExpanded] = useState(false);
  if (!info) return null;
  return (
    <div style={{ border: "0.5px solid #ccfbf1", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <button onClick={() => setExpanded(p => !p)} style={{ width: "100%", padding: "9px 12px", display: "flex", alignItems: "center", gap: 8, background: "#f0fdfa", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
        <span style={{ fontSize: 14 }}>{"\uD83D\uDC8A"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: T.info, fontSize: 12 }}>Pharmacological Reference: {drug}</div>
          <div style={{ color: T.faint, fontSize: 10 }}>{info.drugClass} {"\u00B7"} Dose: {info.minDose}-{info.maxDose}{info.unit} {"\u00B7"} {info.pregnancyCategory} pregnancy</div>
        </div>
        <span style={{ color: T.info, fontSize: 11 }}>{expanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "12px 14px", background: T.card, borderTop: "0.5px solid #ccfbf1" }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: T.muted, lineHeight: 1.5 }}><strong style={{ color: T.text }}>Mechanism:</strong> {info.mechanism}</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 4 }}>Dosing Range</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {info.commonDoses.map(d => <span key={d} style={{ background: "#f0fdfa", color: T.info, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, border: "0.5px solid #99f6e4" }}>{d}{info.unit}</span>)}
              <span style={{ color: T.faint, fontSize: 10, alignSelf: "center" }}>Min: {info.minDose}{info.unit} | Max: {info.maxDose}{info.unit}</span>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.danger, textTransform: "uppercase", marginBottom: 4 }}>{"\u26A0\uFE0F"} Warnings & Contraindications</div>
            {info.warnings.map((w, i) => <div key={i} style={{ fontSize: 11, color: T.warn, marginBottom: 2 }}>{"\u2022"} {w}</div>)}
            {info.contraindications.map((c, i) => <div key={i} style={{ fontSize: 11, color: T.danger, marginBottom: 2 }}>{"\uD83D\uDEAB"} {c}</div>)}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 4 }}>Side Effects</div>
            <div style={{ fontSize: 11, color: T.muted }}>{info.sideEffects.join(" \u00B7 ")}</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 4 }}>Key Drug Interactions</div>
            {info.interactions.map((x, i) => <div key={i} style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>{"\u2022"} {x}</div>)}
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.success, textTransform: "uppercase", marginBottom: 4 }}>{"\uD83D\uDCCB"} Patient Instructions</div>
            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{info.patientInstructions}</div>
          </div>
          {info.monitoring.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.purple, textTransform: "uppercase", marginBottom: 4 }}>{"\uD83D\uDD2C"} Monitoring Required</div>
              <div style={{ fontSize: 11, color: T.muted }}>{info.monitoring.join(" \u00B7 ")}</div>
            </div>
          )}
          {info.renalDose && <div style={{ marginTop: 6, fontSize: 11, color: T.teal }}><strong>Renal dosing:</strong> {info.renalDose}</div>}
        </div>
      )}
    </div>
  );
}
function EGTab({ readings }: { readings: CKDReading[] }) {
  const sorted = useMemo(() => [...readings].sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()), [readings]);
  const eGFRVals = useMemo(() => sorted.map(r => r.eGFR).filter((v): v is number => v !== undefined), [sorted]);
  const latest = sorted.at(-1);
  const eGFR = latest?.eGFR;
  const cr = latest?.creatinine;
  const egfrClass = eGFR !== undefined ? (
    eGFR >= 90 ? { label: "Stage 1", color: T.success, bg: "#f0fdf4", border: "#86efac" }
    : eGFR >= 60 ? { label: "Stage 2", color: T.info, bg: "#eff6ff", border: "#93c5fd" }
    : eGFR >= 45 ? { label: "Stage 3a", color: T.warn, bg: "#fffbeb", border: "#fde68a" }
    : eGFR >= 30 ? { label: "Stage 3b", color: T.orange, bg: "#fff7ed", border: "#fed7aa" }
    : eGFR >= 15 ? { label: "Stage 4", color: T.danger, bg: "#fef2f2", border: "#fca5a5" }
    : { label: "Stage 5", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" }
  ) : null;

  if (readings.length === 0) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{"\uD83C\uDF7A"}</div>
      <div style={{ color: T.muted, fontSize: 13 }}>No renal lab data recorded yet.</div>
      <div style={{ color: T.faint, fontSize: 11, marginTop: 6 }}>Labs appear here once the patient has lab results.</div>
    </div>
  );
  return (
    <div>
      <SectHeader label="eGFR Trend & CKD Staging" color={T.info} sub={egfrClass ? "Current: " + egfrClass.label : ""} />
      {latest && eGFR !== undefined && cr !== undefined && (
        <div className="ckd-stat-row" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <StatCard label="Latest eGFR" value={"" + eGFR} sub="mL/min/1.73m2" color={egfrClass?.color} />
          <StatCard label="Creatinine" value={"" + cr} sub="mg/dL" color={cr > 1.2 ? T.danger : T.success} />
          <StatCard label="CKD Stage" value={egfrClass?.label ?? "-"} sub="KDIGO 2024" color={egfrClass?.color} />
          <StatCard label="RRT Status" value={eGFR < 15 ? "ESRD" : eGFR < 30 ? "Prepare" : "Not Indicated"} sub={eGFR < 30 ? "Refer" : ""} color={eGFR < 15 ? T.danger : eGFR < 30 ? T.warn : T.success} />
        </div>
      )}
      <div style={{ background: T.bg, borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid " + T.border }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>eGFR Values (CKD-EPI equation)</div>
        <div style={{ fontSize: 10, color: T.faint }}>{eGFRVals.length} readings over {sorted.length > 0 ? (sorted.at(0)!.recordedAt.toLocaleDateString() + " - " + sorted.at(-1)!.recordedAt.toLocaleDateString()) : "N/A"}</div>
      </div>
      <div className="ckd-scroll" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
          <thead>
            <tr>{["Date","eGFR (mL/min)","Stage","Creatinine","Change"].map(h => (
              <th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: "0.5px solid " + T.border, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {sorted.reverse().slice(0, 30).map((r, i, arr) => {
              const prev = arr[i + 1];
              const change = prev?.eGFR !== undefined && r.eGFR !== undefined ? (r.eGFR - prev.eGFR) : null;
              const stage = r.eGFR !== undefined ? (
                r.eGFR >= 90 ? "Stage 1" : r.eGFR >= 60 ? "Stage 2" : r.eGFR >= 45 ? "Stage 3a" : r.eGFR >= 30 ? "Stage 3b" : r.eGFR >= 15 ? "Stage 4" : "Stage 5"
              ) : "-";
              return (
                <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: "0.5px solid " + T.border }}>
                  <td style={{ padding: "8px 10px", color: T.muted, whiteSpace: "nowrap", fontSize: 11 }}>{r.recordedAt.toLocaleDateString()}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 800, color: r.eGFR !== undefined && r.eGFR < 30 ? T.danger : r.eGFR !== undefined && r.eGFR < 60 ? T.warn : T.success }}>{r.eGFR ?? "-"}</td>
                  <td style={{ padding: "8px 10px" }}><Badge text={stage} color={T.info} bg="#f0fdfa" border="#99f6e4" /></td>
                  <td style={{ padding: "8px 10px", color: T.muted }}>{r.creatinine ?? "-"}</td>
                  <td style={{ padding: "8px 10px", color: change !== null ? (change < -2 ? T.danger : change > 2 ? T.success : T.faint) : T.faint }}>
                    {change !== null ? (change >= 0 ? "+" + change.toFixed(1) : change.toFixed(1)) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sorted.length > 30 && <div style={{ textAlign: "center", color: T.faint, fontSize: 11, padding: "8px 0" }}>Showing latest 30 of {sorted.length}</div>}
    </div>
  );
}

function CreatinineTab({ readings }: { readings: CKDReading[] }) {
  const sorted = useMemo(() => [...readings].sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()), [readings]);
  const latestCr = sorted.at(-1)?.creatinine;
  if (readings.length === 0) return <div style={{ color: T.faint, textAlign: "center", padding: "24px 0" }}>No creatinine data.</div>;
  return (
    <div>
      <SectHeader label="Creatinine History" color={T.warn} />
      <StatCard label="Latest Creatinine" value={"" + (latestCr ?? "-")} sub="mg/dL" color={latestCr !== undefined && latestCr > 1.2 ? T.danger : T.success} />
      <div className="ckd-scroll" style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
          <thead>
            <tr>{["Date","Creatinine (mg/dL)","eGFR","BUN"].map(h => (
              <th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: "0.5px solid " + T.border, textAlign: "left" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {sorted.reverse().slice(0, 30).map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: "0.5px solid " + T.border }}>
                <td style={{ padding: "8px 10px", color: T.muted, fontSize: 11 }}>{r.recordedAt.toLocaleDateString()}</td>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: r.creatinine !== undefined && r.creatinine > 1.2 ? T.danger : T.text }}>{r.creatinine ?? "-"}</td>
                <td style={{ padding: "8px 10px", color: T.muted }}>{r.eGFR ?? "-"}</td>
                <td style={{ padding: "8px 10px", color: T.muted }}>{r.BUN ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ElectrolytesTab({ readings }: { readings: CKDReading[] }) {
  const sorted = useMemo(() => [...readings].sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()), [readings]);
  const l = sorted[0];
  if (!l) return <div style={{ color: T.faint, textAlign: "center", padding: "24px 0" }}>No electrolyte data.</div>;
  const elecRows = [
    { name: "Potassium (K+)", value: l.potassium, unit: "mmol/L", low: 3.5, high: 5.0 },
    { name: "Sodium (Na+)", value: l.sodium, unit: "mmol/L", low: 135, high: 145 },
    { name: "Chloride (Cl-)", value: l.chloride, unit: "mmol/L", low: 97, high: 107 },
    { name: "Bicarbonate (HCO3-)", value: l.HCO3, unit: "mmol/L", low: 22, high: 28 },
    { name: "Calcium (Ca2+)", value: l.calcium, unit: "mmol/L", low: 2.15, high: 2.55 },
    { name: "Phosphate (PO4)", value: l.phosphate, unit: "mmol/L", low: 0.81, high: 1.45 },
    { name: "Magnesium (Mg2+)", value: l.magnesium, unit: "mmol/L", low: 0.65, high: 1.05 },
    { name: "Albumin", value: l.albumin, unit: "g/L", low: 35, high: 50 },
  ];
  return (
    <div>
      <SectHeader label="Electrolytes & Renal Panel" color={T.teal} sub="Latest values" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {elecRows.map(e => {
          const val = e.value;
          const flag = val !== undefined ? (val < e.low ? "\u2193" : val > e.high ? "\u2191" : "\u2713") : "-";
          const flagColor = val !== undefined ? (val < e.low ? T.warn : val > e.high ? T.danger : T.success) : T.faint;
          return (
            <div key={e.name} style={{ background: T.bg, borderRadius: 8, padding: "9px 11px", border: "0.5px solid " + T.border }}>
              <div style={{ fontSize: 10, color: T.faint, fontWeight: 600 }}>{e.name}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginTop: 2 }}>{val ?? "-"} <span style={{ fontSize: 10, fontWeight: 500, color: T.faint }}>{e.unit}</span></div>
              <div style={{ fontSize: 11, color: flagColor, fontWeight: 600, marginTop: 1 }}>{flag} (Range: {e.low}-{e.high})</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function MedsTab({ medications, patientId }: { medications: CKDMedication[]; patientId: string }) {
  const active = medications.filter(m => m.status === "active");
  const paused = medications.filter(m => m.status === "paused");
  const stopped = medications.filter(m => m.status === "stopped");
  const [expandedId, setExpandedId] = useState<string|null>(null);

  return (
    <div>
      <SectHeader label={"Medications (" + active.length + " active)"} color={T.purple} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
        <StatCard label="Active" value={"" + active.length} color={T.success} />
        <StatCard label="Paused" value={"" + paused.length} color={T.warn} />
        <StatCard label="Stopped" value={"" + stopped.length} color={T.faint} />
      </div>
      <div style={{ marginBottom: 12, background: "#f5f3ff", borderRadius: 8, padding: "8px 12px", border: "0.5px solid #ddd6fe" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.purple }}>Renal Dosing Advisory</div>
        <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Many medications require dose adjustment or avoidance as eGFR declines. Review Pharma cards below for renal-specific dosing information.</div>
      </div>
      {[...active, ...paused, ...stopped].map(med => {
        const open = expandedId === med.id;
        return (
          <div key={med.id} style={{ border: "0.5px solid " + T.border, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
            <button onClick={() => setExpandedId(open ? null : med.id)} style={{ width: "100%", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, background: T.bg, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              <span style={{ fontSize: 14 }}>{"\uD83D\uDC8A"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{med.drug} {med.dose}{med.unit}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{med.frequency} {"\u00B7"} {med.drugClass} {"\u00B7"} {med.indication}</div>
              </div>
              <Badge text={med.status} color={med.status === "active" ? T.success : med.status === "paused" ? T.warn : T.faint} bg={med.status === "active" ? "#f0fdf4" : med.status === "paused" ? "#fffbeb" : "#f9fafb"} border={med.status === "active" ? "#86efac" : med.status === "paused" ? "#fde68a" : T.border} />
              <span style={{ color: T.faint, fontSize: 11 }}>{open ? "\u25B2" : "\u25BC"}</span>
            </button>
            {open && (
              <div style={{ padding: "10px 12px", borderTop: "0.5px solid " + T.border }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>Started: {med.startDate}{med.endDate ? " - Ended: " + med.endDate : ""}</div>
                {med.instructions && <div style={{ background: "#f0fdfa", borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 11, color: T.text }}>{"\uD83D\uDCCB"} {med.instructions}</div>}
                {med.warnings && <div style={{ background: "#fff7ed", borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 11, color: T.warn }}>{"\u26A0\uFE0F"} {med.warnings}</div>}
                <PharmaCard drug={med.drug} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AdherenceTab({ adherence }: { adherence: CKDAdherenceMap }) {
  const allDays = useMemo(() => Object.values(adherence).flatMap(m => Object.values(m)), [adherence]);
  const medPct = allDays.length > 0 ? Math.round(allDays.filter(Boolean).length / allDays.length * 100) : 0;
  return (
    <div>
      <SectHeader label="Medication Adherence" color={T.success} />
      <StatCard label="Overall Adherence" value={medPct + "%"} sub="All medications" color={medPct >= 80 ? T.success : medPct >= 60 ? T.warn : T.danger} />
      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "8px 12px", marginTop: 12, border: "0.5px solid #bfdbfe" }}>
        <div style={{ fontSize: 11, color: T.info, fontWeight: 600 }}>Medication Adherence in CKD</div>
        <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Non-adherence to renoprotective medications (ACEi/ARB, SGLT2i) accelerates CKD progression. Phosphate binder adherence is critical in advanced CKD.</div>
      </div>
      <div style={{ marginTop: 12 }}>
        {Object.entries(adherence).map(([medId, days]) => {
          const dates = Object.keys(days).sort();
          const taken = dates.filter(d => days[d]).length;
          const pct = dates.length > 0 ? Math.round(taken / dates.length * 100) : 0;
          return (
            <div key={medId} style={{ border: "0.5px solid " + T.border, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>Medication {medId.slice(0, 8)}</div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 6, marginBottom: 6 }}>
                {dates.map(d => (
                  <div key={d} style={{ width: 24, height: 24, borderRadius: 5, background: days[d] ? "#dcfce7" : "#fee2e2", border: "0.5px solid " + (days[d] ? "#86efac" : "#fca5a5"), fontSize: 9, fontWeight: 700, color: days[d] ? T.success : T.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {days[d] ? "\u2713" : "\u2717"}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: T.faint }}>{taken}/{dates.length} days taken - {pct}% adherence</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function AlertsTab({ alerts, onAdd, onDelete, eGFRTrend, latestK, latestHCO3, latestHb, latestFerritin, latestTSAT, latestBP, latestACR, latestAlbumin, medications, hasAVFistula }: {
  alerts: CKDAlert[]; onAdd: (a: CKDAlert) => void; onDelete: (id: string) => void;
  eGFRTrend: number[]; latestK: number | null; latestHCO3: number | null; latestHb: number | null;
  latestFerritin: number | null; latestTSAT: number | null;
  latestBP: { sys: number; dia: number } | null; latestACR: number | null;
  latestAlbumin: number | null; medications: CKDMedication[]; hasAVFistula: boolean;
}) {
  const scientificAlerts = useMemo(() => generateClinicalAlerts(eGFRTrend, latestK, latestHCO3, latestHb, latestFerritin, latestTSAT, latestBP, latestACR, latestAlbumin, medications, hasAVFistula), [eGFRTrend, latestK, latestHCO3, latestHb, latestFerritin, latestTSAT, latestBP, latestACR, latestAlbumin, medications, hasAVFistula]);
  const severityColor = { critical: T.danger, urgent: T.warn, warning: T.orange, info: T.info } as const;
  const severityBg = { critical: "#fef2f2", urgent: "#fff7ed", warning: "#fff7ed", info: "#eff6ff" } as const;
  const [showForm, setShowForm] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [category, setCategory] = useState("CKD Progression");
  const ACTION_OPTS = ["Notify doctor","Notify patient via app","Send SMS to patient","Flag for urgent review","Schedule appointment","Order labs","Refer to nephrology","Refer for AV fistula"];
  const CATEGORIES = ["CKD Progression","Hyperkalemia","Anemia","Acidosis","BP Threshold","Medication Change","Lab Result","Symptom Alert","Fluid Status","Custom"];

  return (
    <div>
      <SectHeader label={"Clinical Alert Engine - KDIGO 2024"} color={T.danger} sub={scientificAlerts.length + " active alert(s)"} />
      {scientificAlerts.length === 0 && (
        <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "0.5px solid #86efac", display: "flex", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{"\u2705"}</span>
          <div><div style={{ fontWeight: 700, fontSize: 13, color: T.success }}>All Clinical Parameters Satisfactory</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>No automated alerts generated. Continue current management.</div></div>
        </div>
      )}
      {scientificAlerts.map(a => (
        <div key={a.id} style={{ border: "0.5px solid " + severityColor[a.severity] + "40", borderLeft: "4px solid " + severityColor[a.severity], borderRadius: 10, marginBottom: 10, overflow: "hidden", background: severityBg[a.severity] }}>
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
              <div style={{ color: T.info, fontWeight: 600, fontSize: 10, marginBottom: 4 }}>{"\uD83C\uDF93"} Evidence Base</div>
              <div style={{ fontSize: 10, color: T.muted }}>{a.evidence}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ color: T.success, fontWeight: 600, fontSize: 10, marginBottom: 4 }}>{"\u2705"} Recommended Action</div>
              <div style={{ fontSize: 11, color: T.text, lineHeight: 1.5 }}>{a.action}</div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "0.5px solid " + T.border }}>
        <SectHeader label="Custom Alert Rules (Doctor-Created)" color={T.warn} />
        {alerts.map(a => (
          <div key={a.id} style={{ border: "0.5px solid #fed7aa", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
            <div style={{ padding: "9px 12px", background: "#fff7ed", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>{"\uD83D\uDD14"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: T.warn, fontSize: 12 }}>{a.trigger}</div>
                <div style={{ color: T.faint, fontSize: 11 }}>{a.category && <span style={{ background: "#fff7ed", border: "0.5px solid #fed7aa", borderRadius: 4, padding: "1px 6px", fontSize: 10, marginRight: 5 }}>{a.category}</span>}Actions: {a.actions.join(" - ")} - {a.createdAt}</div>
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
          <div style={{ border: "1.5px dashed " + T.warn, borderRadius: 10, padding: 12, background: "#fffbeb" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <SelField label="Alert Category" value={category} onChange={setCategory} options={CATEGORIES} />
              <InpField label="Trigger condition" value={trigger} onChange={setTrigger} placeholder="e.g. eGFR decline >5 in 3 months" />
            </div>
            <TextArea label="Doctor's clinical note (reason for alert)" value={doctorNote} onChange={setDoctorNote} placeholder="Clinical reasoning for this alert rule" rows={2} />
            <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, margin: "8px 0 5px" }}>Actions to trigger</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {ACTION_OPTS.map(a => {
                const sel = actions.includes(a);
                return <button key={a} onClick={() => setActions(p => sel ? p.filter(x => x !== a) : [...p, a])}
                  style={{ padding: "4px 9px", borderRadius: 7, border: "0.5px solid " + (sel ? T.warn : T.border), background: sel ? T.warn : "transparent", color: sel ? "#fff" : T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{sel ? "\u2713 " : ""}{a}</button>;
              })}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn label="\u2713 Create Alert" variant="success" onClick={() => {
                if (!trigger) return;
                onAdd({ id: "a"+Date.now(), trigger, actions, category, doctorNote, createdAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), history: [] });
                setTrigger(""); setActions([]); setDoctorNote(""); setShowForm(false);
              }} />
              <Btn label="Cancel" onClick={() => setShowForm(false)} />
            </div>
          </div>
        ) : <Btn label={"\uD83D\uDD14 Create New Alert Rule"} variant="warn" fullWidth onClick={() => setShowForm(true)} />}
      </div>
    </div>
  );
}

function ComplicationsTab({ complications, onUpdate }: { complications: CKDComplication[]; onUpdate: (c: CKDComplication) => void }) {
  const COMP_INFO: Record<string, string> = {
    "Anemia of CKD": "Hb target 10-12 g/dL; iron studies + ESA if needed",
    "Renal Bone Disease (CKD-MBD)": "Monitor Ca, PO4, PTH; Vit D analogs; phosphate binders",
    "Hyperkalemia": "K+ >5.5; dietary restriction, K+ binders, review RAASi/MRA",
    "Metabolic Acidosis": "HCO3 <22; oral sodium bicarbonate; target HCO3 22-26",
    "Uremia": "eGFR <15; nausea, pruritus, encephalopathy; dialysis indicated",
    "Volume Overload": "Edema, pulmonary congestion; loop diuretics, fluid restriction",
    "Pericarditis (Uremic)": "Life-threatening; urgent dialysis, NSAIDs avoided",
    "Malnutrition": "Low albumin; dietitian referral; consider ONS",
    "Secondary Hyperparathyroidism": "PTH > target; Vit D analogs, cinacalcet, phosphate control",
    "Vascular Calcification": "Ca x PO4 product <4.6; non-Ca binders preferred",
  };
  return (
    <div>
      <SectHeader label="CKD Complications & Comorbidities" color={T.danger} />
      <div className="ckd-comp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {COMPLICATIONS.map(c => {
          const comp = complications.find(x => x.name === c);
          return (
            <button key={c} onClick={() => onUpdate({ name: c, date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) })} style={{ border: "0.5px solid " + (comp ? "#fca5a5" : T.border), borderRadius: 10, padding: "10px 11px", background: comp ? "#fef2f2" : T.bg, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid " + (comp ? T.danger : T.border), background: comp ? T.danger : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {comp && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>{"\u2713"}</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: comp ? T.danger : T.text }}>{c}</div>
                  {comp && <div style={{ color: T.faint, fontSize: 10, marginTop: 1 }}>Dx: {comp.date}</div>}
                  <div style={{ color: T.faint, fontSize: 10, marginTop: 2, lineHeight: 1.4 }}>{COMP_INFO[c]}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LifestyleTab({ items, onUpdate, onGrade, onSendNotification, patientId }: {
  items: CKDLifestyleItem[]; onUpdate: (item: CKDLifestyleItem) => void;
  onGrade?: (name: string, grade: CKDLifestyleItem["grade"]) => void;
  onSendNotification?: (item: string, grade: CKDLifestyleItem["grade"]) => void; patientId?: string;
}) {
  const GRADES: CKDLifestyleItem["grade"][] = ["Good","Moderate","Poor"];
  const gc: Record<CKDLifestyleItem["grade"], string> = { Good: T.success, Moderate: T.warn, Poor: T.danger };
  return (
    <div>
      <SectHeader label="Lifestyle Modification in CKD" color={T.success} />
      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #86efac" }}>
        <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>Lifestyle changes are essential to slow CKD progression</div>
        <div style={{ fontSize: 10, color: T.muted }}>Dietary modifications, fluid management, and medication adherence are key pillars of CKD management.</div>
      </div>
      {LIFESTYLE_ITEMS.map(item => {
        const ls = items.find(x => x.name === item);
        return (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: "0.5px solid " + T.border, flexWrap: "wrap" }}>
            <button onClick={() => onUpdate(ls ?? { name: item, grade: "Moderate" })} style={{ width: 18, height: 18, borderRadius: 4, border: "1.5px solid " + (ls ? T.success : T.border), background: ls ? T.success : "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {ls && <span style={{ color: "#fff", fontSize: 9 }}>{"\u2713"}</span>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: ls ? T.text : T.muted }}>{item}</div>
            </div>
            {ls && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                {GRADES.map(g => <button key={g} onClick={() => onGrade?.(item, g)}
                  style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "0.5px solid " + (ls.grade === g ? gc[g] : T.border), background: ls.grade === g ? gc[g] : "transparent", color: ls.grade === g ? "#fff" : T.faint }}>{g}</button>)}
                <button onClick={() => onSendNotification?.(item, ls.grade)} title="Notify patient"
                  style={{ padding: "3px 7px", borderRadius: 6, background: "#eff6ff", border: "0.5px solid " + T.info, color: T.info, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{"\uD83D\uDCE4"}</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EducationTab({ education, onSend, patientId, doctorId, doctorName }: {
  education: string[]; onSend: (topic: CKDEducationTopic) => void;
  patientId: string; doctorId?: string; doctorName?: string;
}) {
  const [filter, setFilter] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<CKDEducationTopic|null>(null);
  const categories = useMemo(() => ["All", ...new Set(EDUCATION_TOPICS.map(t => t.category))], []);
  const filtered = filter === "All" ? EDUCATION_TOPICS : EDUCATION_TOPICS.filter(t => t.category === filter);

  return (
    <div>
      <SectHeader label={"Patient Education Library"} color={T.info} sub={education.length + " topics sent"} />
      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #bfdbfe" }}>
        <div style={{ fontSize: 11, color: T.info, fontWeight: 600 }}>Evidence-based CKD education content</div>
        <div style={{ fontSize: 10, color: T.muted }}>Sending a topic delivers it to the patients app education section and sends a push notification.</div>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: "3px 9px", borderRadius: 6, border: "0.5px solid " + (filter === c ? T.info : T.border), background: filter === c ? "#eff6ff" : "transparent", color: filter === c ? T.info : T.faint, fontSize: 10, fontWeight: filter === c ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
        ))}
      </div>
      {selectedTopic && (
        <div style={{ border: "1.5px solid " + T.info, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ background: "#eff6ff", padding: "10px 13px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{"\uD83D\uDCDA"}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: T.info, fontSize: 13 }}>{selectedTopic.title}</div><div style={{ fontSize: 10, color: "#93c5fd" }}>{selectedTopic.category} {"\u00B7"} {selectedTopic.duration}</div></div>
            <button onClick={() => setSelectedTopic(null)} style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontFamily: "inherit", fontSize: 16 }}>{"\u2715"}</button>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 10 }}>{selectedTopic.content}</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 6 }}>Key Points for Patient</div>
              {selectedTopic.keyPoints.map((kp, i) => <div key={i} style={{ fontSize: 12, color: T.text, marginBottom: 4, display: "flex", gap: 6, lineHeight: 1.5 }}><span style={{ color: T.info, flexShrink: 0 }}>{"\u2022"}</span>{kp}</div>)}
            </div>
            <Btn label={education.includes(selectedTopic.id) ? "\u2713 Already Sent - Resend" : "\uD83D\uDCE4 Send to Patient"} variant={education.includes(selectedTopic.id) ? "default" : "primary"} onClick={() => { onSend(selectedTopic); setSelectedTopic(null); }} fullWidth />
          </div>
        </div>
      )}
      {filtered.map(topic => {
        const sent = education.includes(topic.id);
        return (
          <div key={topic.id} onClick={() => setSelectedTopic(topic)} style={{ border: "0.5px solid " + (sent ? "#93c5fd" : T.border), borderRadius: 10, marginBottom: 7, overflow: "hidden", cursor: "pointer", background: sent ? "#f0f9ff" : T.bg }}>
            <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{"\uD83D\uDCDA"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{topic.title}</div>
                <div style={{ fontSize: 11, color: T.faint, marginTop: 1 }}>{topic.category} {"\u00B7"} {topic.duration} {"\u00B7"} {topic.keyPoints.length} key points</div>
              </div>
              {sent ? <Badge text="\u2713 Sent" color={T.info} bg="#eff6ff" border="#93c5fd" /> : <span style={{ color: T.faint, fontSize: 11 }}>View {"\u203A"}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function LabsTab({ labOrders, imagingOrders, onOrderLab, onOrderImaging, onUpdateResult }: {
  labOrders: CKDLabOrder[]; imagingOrders: CKDLabOrder[];
  onOrderLab: (n: string, urgency?: string) => void;
  onOrderImaging: (n: string, urgency?: string) => void;
  onUpdateResult: (name: string, result: string, type: "lab"|"imaging") => void;
}) {
  const [customLab, setCustomLab] = useState("");
  const [customImg, setCustomImg] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [editingResult, setEditingResult] = useState<{name: string; type: "lab"|"imaging"}|null>(null);
  const [resultText, setResultText] = useState("");

  function OrderRow({ name, orders, type, onOrder }: { name: string; orders: CKDLabOrder[]; type: "lab"|"imaging"; onOrder: (n: string) => void }) {
    const ordered = orders.find(x => x.name === name);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: "0.5px solid " + T.border }}>
        <div style={{ flex: 1, fontSize: 12, color: ordered ? T.text : T.muted }}>{name}</div>
        {ordered ? (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {ordered.result
              ? <Badge text={ordered.result.length > 15 ? ordered.result.slice(0,15)+"\u2026" : ordered.result} color={T.success} bg="#f0fdf4" border="#86efac" />
              : <Badge text={ordered.urgency === "urgent" ? "\u26A1 Urgent" : "Ordered"} color={T.warn} bg="#fffbeb" border="#fde68a" />}
            <button onClick={() => { setEditingResult({name, type}); setResultText(ordered.result ?? ""); }}
              style={{ background: "none", border: "0.5px solid " + T.border, borderRadius: 5, padding: "2px 6px", fontSize: 10, cursor: "pointer", color: T.muted, fontFamily: "inherit" }}>Result</button>
          </div>
        ) : <Btn label="Order" small onClick={() => onOrder(name)} />}
      </div>
    );
  }

  return (
    <div>
      <SectHeader label="Investigations - Labs & Imaging" color={T.purple} />
      {editingResult && (
        <div style={{ background: "#f5f3ff", borderRadius: 10, padding: 12, marginBottom: 12, border: "0.5px solid #ddd6fe" }}>
          <div style={{ fontWeight: 700, color: T.purple, fontSize: 12, marginBottom: 8 }}>Enter Result: {editingResult.name}</div>
          <InpField value={resultText} onChange={setResultText} placeholder="e.g. 4.2 mmol/L (Normal) or Pending" />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <Btn label={"\u2713 Save Result"} variant="success" onClick={() => { onUpdateResult(editingResult.name, resultText, editingResult.type); setEditingResult(null); }} />
            <Btn label="Cancel" onClick={() => setEditingResult(null)} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {URGENCIES.map(u => <button key={u} onClick={() => setUrgency(u)} style={{ padding: "3px 9px", borderRadius: 6, border: "0.5px solid " + (urgency === u ? T.danger : T.border), background: urgency === u ? "#fef2f2" : "transparent", color: urgency === u ? T.danger : T.faint, fontSize: 10, fontWeight: urgency === u ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>{u}</button>)}
        <span style={{ fontSize: 10, color: T.faint, alignSelf: "center" }}>urgency level for new orders</span>
      </div>
      <div className="ckd-labs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{"\uD83D\uDD2C"} Laboratory</div>
          {LAB_PANEL.map(l => <OrderRow key={l} name={l} orders={labOrders} type="lab" onOrder={n => onOrderLab(n, urgency)} />)}
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            <input value={customLab} onChange={e => setCustomLab(e.target.value)} placeholder="Custom lab test" style={{ flex: 1, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "7px 9px", fontSize: 11, outline: "none", fontFamily: "inherit", color: T.text }} />
            <Btn label="+" variant="primary" small onClick={() => { if (customLab) { onOrderLab(customLab, urgency); setCustomLab(""); } }} />
          </div>
        </div>
        <div>
          <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{"\uD83E\uDE7B"} Imaging & Procedures</div>
          {IMAGING_PANEL.map(l => <OrderRow key={l} name={l} orders={imagingOrders} type="imaging" onOrder={n => onOrderImaging(n, urgency)} />)}
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            <input value={customImg} onChange={e => setCustomImg(e.target.value)} placeholder="Custom imaging" style={{ flex: 1, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "7px 9px", fontSize: 11, outline: "none", fontFamily: "inherit", color: T.text }} />
            <Btn label="+" variant="primary" small onClick={() => { if (customImg) { onOrderImaging(customImg, urgency); setCustomImg(""); } }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotesTab({ notes, onSave, onEdit, patientName, doctorId, doctorName }: {
  notes: CKDClinicalNote[]; onSave: (n: CKDClinicalNote) => void; onEdit: (n: CKDClinicalNote) => void;
  patientName: string; doctorId?: string; doctorName?: string;
}) {
  const blank = (): CKDClinicalNote => ({
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    cc: "", hpi: "", exam: "", investigations: "", assessment: "", plan: "",
    diagnoses: [], followUps: [], isLocked: false,
    visitType: "follow_up", vitals: {},
    doctorId, doctorName: doctorName ?? "AMEXAN",
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CKDClinicalNote>(blank());
  const [editingNote, setEditingNote] = useState<CKDClinicalNote|null>(null);
  const [expandedId, setExpandedId] = useState<string|null>(notes[0]?.id ?? null);

  const FIELDS: { key: keyof CKDClinicalNote; label: string; ph: string }[] = [
    { key: "cc", label: "Chief Complaint (CC)", ph: "What brings the patient today?" },
    { key: "hpi", label: "History of Present Illness (HPI)", ph: "Duration, character, severity, aggravating/relieving factors" },
    { key: "exam", label: "Examination Findings", ph: "General, Cardiovascular, Respiratory, Abdomen, Neurological" },
    { key: "investigations", label: "Investigations / Results", ph: "Recent labs, imaging findings" },
    { key: "assessment", label: "Assessment / Diagnosis", ph: "CKD stage, primary and secondary diagnoses" },
    { key: "plan", label: "Management Plan", ph: "Medications, lifestyle advice, referrals, follow-up" },
  ];

  const activeForm = editingNote ?? form;
  const setActiveForm = editingNote ? setEditingNote as (n: CKDClinicalNote) => void : setForm;

  return (
    <div>
      <SectHeader label="Clinical Notes - SOAP Format" color={T.muted} />
      {[...notes].reverse().map((n) => (
        <div key={n.id ?? n.date} style={{ border: "0.5px solid " + T.border, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
          <div onClick={() => setExpandedId(expandedId === n.id ? null : n.id ?? n.date)} style={{ padding: "10px 13px", display: "flex", alignItems: "center", gap: 8, background: T.bg, cursor: "pointer" }}>
            <span style={{ fontSize: 16 }}>{"\uD83D\uDCCB"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{n.date} - {n.assessment || "Clinical Note"}</div>
              <div style={{ color: T.faint, fontSize: 11 }}>{n.doctorName ?? "AMEXAN"} {"\u00B7"} {n.visitType ?? "Follow-up"}{n.isLocked ? " \uD83D\uDD12" : " \uD83D\uDD13"}</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {!n.isLocked && <Btn label="\u270F\uFE0F Edit" small variant="info" onClick={() => { setEditingNote({ ...n }); setShowForm(true); }} />}
              <Btn label="\uD83D\uDCC4 PDF" small onClick={() => { exportNoteAsPDF(n, patientName); }} />
              <Badge text={n.isLocked ? "Locked" : "Draft"} color={n.isLocked ? T.muted : T.warn} bg={n.isLocked ? T.bg : "#fffbeb"} border={n.isLocked ? T.border : "#fde68a"} />
            </div>
          </div>
          {expandedId === (n.id ?? n.date) && (
            <div className="ckd-note-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 14px" }}>
              {FIELDS.filter(f => n[f.key]).map(f => (
                <div key={f.key} style={{ gridColumn: f.key === "plan" || f.key === "hpi" ? "1 / -1" : undefined }}>
                  <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n[f.key] as string}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {(showForm) && (
        <div style={{ border: "1.5px solid " + T.info, borderRadius: 12, padding: 13, background: "#eff6ff", marginTop: 8 }}>
          <div style={{ color: T.info, fontWeight: 700, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            {"\uD83D\uDCCB"} {editingNote ? "Edit Clinical Note" : "New SOAP Note"} - {activeForm?.date}
            <Btn label="Cancel" small onClick={() => { setShowForm(false); setEditingNote(null); setForm(blank()); }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <SelField label="Visit Type" value={activeForm?.visitType ?? "follow_up"} onChange={v => setActiveForm({ ...activeForm!, visitType: v })} options={VISIT_TYPES} />
          </div>
          <div className="ckd-note-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {FIELDS.map(f => (
              <div key={f.key} style={{ gridColumn: f.key === "plan" || f.key === "hpi" ? "1 / -1" : undefined }}>
                <TextArea label={f.label} value={(activeForm?.[f.key] as string) ?? ""} onChange={v => setActiveForm({ ...activeForm!, [f.key]: v })} placeholder={f.ph} rows={4} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Btn label={"\u2713 Save Note"} variant="success" onClick={() => {
              if (editingNote) { onEdit({ ...activeForm!, isLocked: false, lastEditedAt: new Date().toLocaleDateString() }); }
              else { onSave({ ...form, id: "n"+Date.now() }); }
              setShowForm(false); setEditingNote(null); setForm(blank());
            }} />
            <Btn label={"\uD83D\uDD12 Save & Lock"} variant="info" onClick={() => {
              if (editingNote) { onEdit({ ...activeForm!, isLocked: true }); }
              else { onSave({ ...form, id: "n"+Date.now(), isLocked: true }); }
              setShowForm(false); setEditingNote(null); setForm(blank());
            }} />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingNote(null); setForm(blank()); }} />
          </div>
        </div>
      )}
      {!showForm && <Btn label={"\uD83D\uDCCB Write New SOAP Note"} variant="primary" fullWidth onClick={() => { setEditingNote(null); setForm(blank()); setShowForm(true); }} />}
    </div>
  );
}

function TimelineTab({ events }: { events: CKDTimelineEvent[] }) {
  const tc: Record<CKDTimelineEvent["type"], string> = { visit: T.info, med: T.purple, alert: T.warn, reading: T.success, note: T.muted, lab: "#7c3aed" };
  return (
    <div>
      <SectHeader label={"Clinical Event Timeline"} color={T.info} sub={events.length + " events"} />
      {events.length === 0 && <div style={{ color: T.faint, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No events recorded yet.</div>}
      <div style={{ position: "relative", paddingLeft: 22 }}>
        <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 1.5, background: T.border }} />
        {[...events].reverse().map(e => (
          <div key={e.id} style={{ position: "relative", marginBottom: 12, paddingLeft: 10 }}>
            <div style={{ position: "absolute", left: -14, top: 4, width: 10, height: 10, borderRadius: "50%", background: tc[e.type], border: "2px solid " + T.card, boxShadow: "0 0 0 1px " + tc[e.type] + "40" }} />
            <div style={{ fontSize: 10, color: T.faint, marginBottom: 1 }}>{e.date}</div>
            <div style={{ fontWeight: 600, fontSize: 12, color: T.text }}>{e.icon} {e.title}</div>
            {e.detail && <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{e.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagingTab({ messages, onSend, threadId, loadingMessages, patientName, onOpenMessaging }: {
  messages: CKDMessage[]; onSend: (text: string) => void; threadId: string;
  loadingMessages?: boolean; patientName?: string; onOpenMessaging?: () => void;
}) {
  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(m => !m.read && (m.from !== "doctor" && m.senderRole !== "doctor")).length;
  const lastTime = lastMessage ? (lastMessage.time || (lastMessage.timestamp ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")) : "";
  const initials = (patientName ?? "P").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div onClick={() => onOpenMessaging?.()} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: "0.5px solid " + T.border, background: T.bg, cursor: "pointer" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#0891b2 0%,#22d3ee 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{initials}</div>
        <div style={{ position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{patientName ?? "Patient"}</span>
          <span style={{ fontSize: 10, color: unreadCount > 0 ? T.info : T.faint }}>{lastTime}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "85%", fontWeight: unreadCount > 0 ? 600 : 400, color: unreadCount > 0 ? T.text : T.faint }}>
            {loadingMessages ? "Loading..." : lastMessage ? (lastMessage.senderRole === "doctor" || lastMessage.from === "doctor" ? "You: " : "") + lastMessage.text : "No messages yet"}
          </span>
          {unreadCount > 0 && <div style={{ background: T.info, color: "#fff", borderRadius: "50%", minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, padding: "0 4px" }}>{unreadCount}</div>}
        </div>
      </div>
      <div style={{ color: T.faint, fontSize: 16 }}>{"\u203A"}</div>
    </div>
  );
}
function ReferralsTab({ referrals, onAdd, doctorId, doctorName, patientName, patientId, onOpenReferrals }: {
  referrals: Record<string,unknown>[]; onAdd: (r: Record<string,unknown>) => void;
  doctorId?: string; doctorName?: string; patientName?: string; patientId?: string; onOpenReferrals?: (patientId: string, patientName: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [spec, setSpec] = useState(SPECIALTIES[0]);
  const [urgency, setUrgency] = useState("routine");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div>
      <SectHeader label="Referrals - Multi-Disciplinary" color={T.info} sub={referrals.filter(r => r.status === "pending" && r.urgency === "urgent").length > 0 ? "⚡ urgent pending" : undefined} />
      {referrals.length === 0 && <div style={{ color: T.faint, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No referrals made yet.</div>}
      <div className="ckd-scroll" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto", marginBottom: 12 }}>
        {referrals.map((r, idx) => {
          const p = r.status === "pending";
          const u = r.urgency === "urgent";
          return (
            <div key={String(r.id ?? idx)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: 10, background: p && u ? "#fef2f2" : T.bg, border: "0.5px solid " + (p && u ? "#fecaca" : T.border) }}>
              <div style={{ color: p ? T.warn : T.success, fontSize: 16 }}>{p ? "\u23F1\uFE0F" : "\u2713"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{String(r.specialty ?? "")}</div>
                <div style={{ color: T.faint, fontSize: 11 }}>{String(r.reason ?? "")} {r.urgency === "urgent" ? "\u26A1" : ""}</div>
                <div style={{ color: T.faint, fontSize: 10 }}>Status: {String(r.status ?? "pending")} | Referred: {String(r.date ?? "")}</div>
              </div>
              <Badge text={String(r.status ?? "pending")} color={p ? T.warn : T.success} bg={p ? "#fffbeb" : "#f0fdf4"} border={p ? "#fde68a" : "#86efac"} />
            </div>
          );
        })}
      </div>
      {showForm && (
        <div style={{ border: "1.5px solid #93c5fd", borderRadius: 12, padding: 13, background: "#eff6ff", marginBottom: 12 }}>
          <div style={{ color: T.info, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{"\uD83D\uDC69\u200D\u2695\uFE0F"} New Referral</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <SelField label="Specialty" value={spec} onChange={setSpec} options={SPECIALTIES} />
            <SelField label="Urgency" value={urgency} onChange={setUrgency} options={["emergency","urgent","routine","elective"]} />
          </div>
          <TextArea label="Reason for Referral" value={reason} onChange={setReason} placeholder="e.g. Stage 4 CKD, need AV fistula assessment" rows={2} />
          <TextArea label="Additional Notes" value={notes} onChange={setNotes} placeholder="Relevant history, labs, medications" rows={2} />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <Btn label={"\u2713 Submit Referral"} variant="success" onClick={() => {
              onAdd({ id: "r"+Date.now(), specialty: spec, urgency, reason, notes, status: "pending", date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), doctorId, doctorName, patientName });
              setShowForm(false); setReason(""); setNotes("");
            }} />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {!showForm && <Btn label={"\u2795 Add Referral"} variant="primary" fullWidth onClick={() => setShowForm(true)} />}
      {onOpenReferrals && <Btn label={"\uD83D\uDD0D View Full Referrals Dashboard"} variant="info" fullWidth onClick={() => onOpenReferrals(patientId ?? "", patientName ?? "")} />}
    </div>
  );
}

function DialysisPlanningTab({ patientProfile, onUpdateProfile }: {
  patientProfile: Record<string,unknown>; onUpdateProfile: (u: Record<string,unknown>) => void;
}) {
  const [form, setForm] = useState({
    egfr: Number(patientProfile?.latestEGFR ?? patientProfile?.egfr ?? 25),
    stage: String(patientProfile?.ckdStage ?? "G3b"),
    hasAvFistula: Boolean(patientProfile?.hasAvFistula ?? false),
    fistulaReady: Boolean(patientProfile?.fistulaReady ?? false),
    dialysisModality: String(patientProfile?.dialysisModality ?? "hemodialysis"),
    dialysisCenter: String(patientProfile?.dialysisCenter ?? ""),
    accessType: String(patientProfile?.accessType ?? "av_fistula"),
    transplantListed: Boolean(patientProfile?.transplantListed ?? false),
    transplantCenter: String(patientProfile?.transplantCenter ?? ""),
    nephrologist: String(patientProfile?.nephrologist ?? ""),
    lastNephrologyVisit: String(patientProfile?.lastNephrologyVisit ?? ""),
  });

  const stageDefs: Record<string, { egfr: string; plan: string }> = {
    G1:  { egfr: "\u226590 mL/min",  plan: "Monitor BP, manage comorbidities, annual review" },
    G2:  { egfr: "60-89 mL/min",     plan: "Cardiovascular risk reduction, annual eGFR" },
    G3a: { egfr: "45-59 mL/min",     plan: "Nephrology referral, manage complications" },
    G3b: { egfr: "30-44 mL/min",     plan: "Anemia management, bone mineral density, 6-monthly" },
    G4:  { egfr: "15-29 mL/min",     plan: "Prepare for RRT, AV fistula planning, 3-monthly" },
    G5:  { egfr: "<15 mL/min",       plan: "Dialysis initiation or transplantation evaluation" },
  };

  const currentStage = stageDefs[form.stage] ?? stageDefs.G3b;

  return (
    <div>
      <SectHeader label="Dialysis & Renal Replacement Planning" color={T.purple} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: T.purple, marginBottom: 8, textTransform: "uppercase" }}>Current CKD Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: form.stage === "G5" ? "#fef2f2" : form.stage === "G4" ? "#fffbeb" : "#f0fdf4", border: "1.5px solid " + (form.stage === "G5" ? T.danger : form.stage === "G4" ? T.warn : T.success) }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: form.stage === "G5" ? T.danger : form.stage === "G4" ? T.warn : T.success }}>{form.stage}</span>
              <span style={{ fontSize: 8, color: T.faint }}>CKD</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>eGFR: {form.egfr} mL/min</div>
              <div style={{ fontSize: 11, color: T.muted }}>{currentStage.egfr}</div>
            </div>
          </div>
          <div style={{ background: "#f5f3ff", borderRadius: 8, padding: 10, fontSize: 11, color: T.muted, lineHeight: 1.6 }}>{currentStage.plan}</div>
        </Card>
        <Card style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: T.purple, marginBottom: 8, textTransform: "uppercase" }}>Vascular Access</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.text, cursor: "pointer" }}>
              <input type="checkbox" checked={form.hasAvFistula} onChange={e => setForm({...form, hasAvFistula: e.target.checked})} style={{ accentColor: "#7c3aed" }} />
              AV Fistula Created
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.text, cursor: "pointer" }}>
              <input type="checkbox" checked={form.fistulaReady} onChange={e => setForm({...form, fistulaReady: e.target.checked})} style={{ accentColor: "#7c3aed" }} />
              Fistula Matured / Ready for Use
            </label>
            <SelField label="Access Type" value={form.accessType} onChange={v => setForm({...form, accessType: v})} options={["av_fistula","av_graft","tunneled_catheter","non_tunneled_catheter","peritoneal_dialysis_catheter"]} />
          </div>
        </Card>
        <Card style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: T.purple, marginBottom: 8, textTransform: "uppercase" }}>Dialysis Plan</div>
          <SelField label="Modality" value={form.dialysisModality} onChange={v => setForm({...form, dialysisModality: v})} options={["hemodialysis","peritoneal_dialysis","home_hemodialysis","no_dialysis_deferred"]} />
          <div style={{ marginTop: 6 }}>
            <InpField label="Dialysis Center" value={form.dialysisCenter} onChange={v => setForm({...form, dialysisCenter: v})} placeholder="e.g. Nairobi Renal Centre" />
          </div>
        </Card>
        <Card style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: T.purple, marginBottom: 8, textTransform: "uppercase" }}>Transplantation</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.text, cursor: "pointer", marginBottom: 6 }}>
            <input type="checkbox" checked={form.transplantListed} onChange={e => setForm({...form, transplantListed: e.target.checked})} style={{ accentColor: "#7c3aed" }} />
            Listed for Transplant
          </label>
          <InpField label="Transplant Center" value={form.transplantCenter} onChange={v => setForm({...form, transplantCenter: v})} placeholder="e.g. Kenyatta Hospital" />
        </Card>
      </div>
      <Card style={{ padding: 12, marginTop: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: T.purple, marginBottom: 8, textTransform: "uppercase" }}>Nephrology Follow-Up</div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}><InpField label="Nephrologist" value={form.nephrologist} onChange={v => setForm({...form, nephrologist: v})} placeholder="Dr. Name" /></div>
          <div style={{ flex: 1 }}><InpField label="Last Visit" value={form.lastNephrologyVisit} onChange={v => setForm({...form, lastNephrologyVisit: v})} placeholder="e.g. 15 Mar 2026" /></div>
        </div>
      </Card>
      <Btn label={"\uD83D\uDCBE Save Dialysis Plan"} variant="primary" fullWidth onClick={() => onUpdateProfile({ ...form })} />
    </div>
  );
}
type TabId = "egfr"|"creatinine"|"electrolytes"|"medications"|"adherence"|"alerts"|"complications"|"lifestyle"|"education"|"labs"|"notes"|"timeline"|"messaging"|"referrals"|"dialysis";
const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "egfr",          icon: "\uD83D\uDCCA", label: "eGFR"       },
  { id: "creatinine",    icon: "\uD83D\uDCDD", label: "Creatinine" },
  { id: "electrolytes",  icon: "\u2697\uFE0F", label: "Electrolytes"},
  { id: "medications",   icon: "\uD83D\uDC8A", label: "Meds"       },
  { id: "adherence",     icon: "\uD83D\uDCC6", label: "Adherence"  },
  { id: "alerts",        icon: "\uD83D\uDD14", label: "Alerts"     },
  { id: "complications", icon: "\u26A0\uFE0F", label: "Complic."   },
  { id: "lifestyle",     icon: "\uD83C\uDFC3", label: "Lifestyle"  },
  { id: "education",     icon: "\uD83D\uDCD6", label: "Education"  },
  { id: "labs",          icon: "\uD83D\uDD2C", label: "Labs"       },
  { id: "notes",         icon: "\uD83D\uDCCB", label: "Notes"      },
  { id: "timeline",      icon: "\uD83D\uDD0D", label: "Timeline"   },
  { id: "messaging",     icon: "\uD83D\uDCAC", label: "Messages"   },
  { id: "referrals",     icon: "\uD83D\uDC69\u200D\u2695\uFE0F", label: "Referrals" },
  { id: "dialysis",      icon: "\uD83E\uDE7B", label: "Dialysis"   },
];

function PatientPanel({ patientId, patientName, doctorId, doctorName, onOpenReferrals, onOpenConversation }: {
  patientId: string; patientName: string; doctorId?: string;
  doctorName?: string; onOpenConversation?: (threadId: string) => void;
  onOpenReferrals?: (patientId: string, patientName: string) => void;
}) {
  const [tab, setTab] = useState<TabId>("egfr");
  const tabsRef = useRef<HTMLDivElement>(null);

  const [readings, setReadings] = useState<CKDReading[]>([]);
  const [medications, setMedications] = useState<CKDMedication[]>([]);
  const [adherence, setAdherence] = useState<CKDAdherenceMap>({});
  const [alerts, setAlerts] = useState<CKDAlert[]>([]);
  const [complications, setComplications] = useState<CKDComplication[]>([]);
  const [lifestyle, setLifestyle] = useState<CKDLifestyleItem[]>([]);
  const [educationTopics, setEducationTopics] = useState<string[]>([]);
  const [labOrders, setLabOrders] = useState<CKDLabOrder[]>([]);
  const [imagingOrders, setImagingOrders] = useState<CKDLabOrder[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<CKDClinicalNote[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<CKDTimelineEvent[]>([]);
  const [messages, setMessages] = useState<CKDMessage[]>([]);
  const [referrals, setReferrals] = useState<Record<string,unknown>[]>([]);
  const [patientProfile, setPatientProfile] = useState<Record<string,unknown>>({});
  const [loadingR, setLoadingR] = useState(true);
  const [loadingM, setLoadingM] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(true);

  const threadId = useMemo(() => {
    if (!doctorId || !patientId) return "";
    return [doctorId, patientId].sort().join("_");
  }, [doctorId, patientId]);

  const profile = patientProfile as Record<string,unknown>;

  useEffect(() => {
    setLoadingR(true);
    const q = query(
      collection(db, "toolReadings"),
      where("patientId", "==", patientId),
      where("toolType", "==", "ckd_monitor"),
      orderBy("recordedAt", "asc")
    );
    return onSnapshot(q, snap => {
      const parsed = snap.docs
        .map(d => normalizeCKDReading({ id: d.id, ...d.data() } as unknown as Record<string, unknown>, d.id))
        .filter(Boolean) as CKDReading[];
      setReadings(parsed);
      setLoadingR(false);
    }, () => setLoadingR(false));
  }, [patientId]);

  useEffect(() => {
    setLoadingM(true);
    const q = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId),
      orderBy("startDate", "asc")
    );
    return onSnapshot(q, snap => {
      const meds: CKDMedication[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id, patientId: data.patientId, drugName: data.drugName ?? data.medication ?? data.name ?? "",
          dose: data.dose ?? data.dosage ?? "", frequency: data.frequency ?? data.freq ?? "",
          route: data.route ?? "oral", startDate: data.startDate ?? data.prescribedDate ?? "",
          endDate: data.endDate ?? "", status: data.status ?? "active",
          prescriber: data.prescriber ?? doctorName ?? "",
          notes: data.notes ?? data.instructions ?? "",
          renalAdjusted: Boolean(data.renalAdjusted),
          renalAdjustment: data.renalAdjustment ?? "",
        } as unknown as CKDMedication;
      });
      setMedications(meds);
      setAdherence(prev => {
        const next = { ...prev };
        meds.filter(m => m.status === "active" && !next[m.id]).forEach(m => {
          const days: Record<string, boolean> = {};
          for (let i = 29; i >= 0; i--) {
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
      const msgs: CKDMessage[] = snap.docs.map(d => {
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
        } as CKDMessage;
      });
      setMessages(msgs);
      setLoadingMsg(false);
    }, () => setLoadingMsg(false));
  }, [threadId]);

  useEffect(() => {
    const q = query(collection(db, "clinicalAlerts"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, snap => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as CKDAlert)));
    }, () => {});
  }, [patientId]);

  useEffect(() => {
    const q = query(collection(db, "clinicalNotes"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, snap => {
      setClinicalNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as CKDClinicalNote)));
    }, () => {});
  }, [patientId]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "patientProfiles", patientId), snap => {
      if (snap.exists()) setPatientProfile(snap.data() as Record<string,unknown>);
    });
    return unsub;
  }, [patientId]);

  const handleSaveMedication = useCallback(async (med: CKDMedication) => {
    try {
      const data = { ...med, patientId, prescriber: doctorName ?? doctorId ?? "AMEXAN" };
      if (med.id?.startsWith("new_")) {
        const ref = await addDoc(collection(db, "prescriptions"), data);
        setMedications(prev => prev.map(m => m.id === med.id ? { ...m, id: ref.id } : m));
      } else {
        await setDoc(doc(db, "prescriptions", med.id!), data);
      }
    } catch (e) { console.error("Save med error", e); }
  }, [patientId, doctorId, doctorName]);

  const handleStopMedication = useCallback(async (id: string) => {
    await updateDoc(doc(db, "prescriptions", id), { status: "paused", endDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) });
  }, []);

  const handleSaveAdherence = useCallback(async (medId: string, date: string, taken: boolean) => {
    const key = `adherence_${medId}_${date}`;
    const path = doc(db, "prescriptions", medId);
    await updateDoc(path, {
      [`adherence_${medId}`]: taken,
      lastAdherenceUpdate: new Date().toISOString(),
    });
    setAdherence(prev => ({
      ...prev,
      [medId]: { ...(prev[medId] ?? {}), [date]: taken },
    }));
  }, []);

  const handleSaveAlert = useCallback(async (alert: CKDAlert) => {
    try {
      await addDoc(collection(db, "clinicalAlerts"), { ...alert, patientId, createdAt: Timestamp.now() });
    } catch (e) { console.error("Save alert error", e); }
  }, [patientId]);

  const handleDismissAlert = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, "clinicalAlerts", id), { dismissed: true, dismissedAt: new Date().toISOString(), dismissedBy: doctorName ?? "AMEXAN" });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } as CKDAlert : a));
    } catch (e) { console.error("Dismiss alert error", e); }
  }, [doctorName]);

  const handleUpdateComplication = useCallback((c: CKDComplication) => {
    setComplications(prev => prev.map(x => x.id === c.id ? c : x));
  }, []);

  const handleUpdateLifestyle = useCallback((item: CKDLifestyleItem) => {
    setLifestyle(prev => prev.map(x => x.id === item.id ? item : x));
  }, []);

  const handleSendEducation = useCallback((topic: string) => {
    setEducationTopics(prev => prev.includes(topic) ? prev : [...prev, topic]);
  }, []);

  const handleOrderLab = useCallback(async (name: string, urgency = "routine") => {
    const order: CKDLabOrder = { id: "l"+Date.now(), name, orderedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), urgency, result: undefined, patientId };
    setLabOrders(prev => [...prev, order]);
    try { await addDoc(collection(db, "labOrders"), { ...order, patientId, orderedBy: doctorId ?? "amexan" }); } catch {}
  }, [patientId, doctorId]);

  const handleOrderImaging = useCallback(async (name: string, urgency = "routine") => {
    const order: CKDLabOrder = { id: "i"+Date.now(), name, orderedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), urgency, result: undefined, patientId };
    setImagingOrders(prev => [...prev, order]);
    try { await addDoc(collection(db, "imagingOrders"), { ...order, patientId, orderedBy: doctorId ?? "amexan" }); } catch {}
  }, [patientId, doctorId]);

  const handleUpdateResult = useCallback(async (name: string, result: string, type: "lab"|"imaging") => {
    if (type === "lab") {
      setLabOrders(prev => prev.map(o => o.name === name ? { ...o, result } : o));
    } else {
      setImagingOrders(prev => prev.map(o => o.name === name ? { ...o, result } : o));
    }
    try {
      const col = type === "lab" ? "labOrders" : "imagingOrders";
      const q = query(collection(db, col), where("patientId", "==", patientId), where("name", "==", name), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) await updateDoc(doc(db, col, snap.docs[0].id), { result });
    } catch {}
  }, [patientId]);

  const handleSaveNote = useCallback(async (note: CKDClinicalNote) => {
    try {
      if (note.id) {
        await setDoc(doc(db, "clinicalNotes", note.id), { ...note, patientId, doctorId, doctorName });
        setClinicalNotes(prev => prev.map(n => n.id === note.id ? note : n));
      } else {
        const ref = await addDoc(collection(db, "clinicalNotes"), { ...note, patientId, doctorId, doctorName, createdAt: Timestamp.now() });
        setClinicalNotes(prev => [...prev, { ...note, id: ref.id }]);
      }
    } catch (e) { console.error("Save note error", e); }
  }, [patientId, doctorId, doctorName]);

  const handleEditNote = useCallback(async (note: CKDClinicalNote) => {
    if (note.id) {
      await setDoc(doc(db, "clinicalNotes", note.id), { ...note, patientId, doctorId, doctorName, lastEditedAt: new Date().toISOString() }, { merge: true });
      setClinicalNotes(prev => prev.map(n => n.id === note.id ? note : n));
    }
  }, [patientId, doctorId, doctorName]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!threadId || !text.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        threadId, text: text.trim(),
        senderId: doctorId ?? "amexan", senderName: doctorName ?? "AMEXAN", senderRole: "doctor",
        timestamp: Timestamp.now(), read: false, status: "sent",
        patientId,
      });
    } catch (e) { console.error("Send message error", e); }
  }, [threadId, doctorId, doctorName, patientId]);

  const handleAddReferral = useCallback(async (r: Record<string,unknown>) => {
    try {
      await addDoc(collection(db, "referrals"), { ...r, patientId, createdAt: Timestamp.now() });
      setReferrals(prev => [...prev, r]);
    } catch (e) { console.error("Add referral error", e); }
  }, [patientId]);

  const handleUpdateProfile = useCallback(async (u: Record<string,unknown>) => {
    try {
      await setDoc(doc(db, "patientProfiles", patientId), u, { merge: true });
      setPatientProfile(prev => ({ ...prev, ...u }));
    } catch (e) { console.error("Update profile error", e); }
  }, [patientId]);

  const eGFRData = useMemo(() => readings.map(r => ({
    date: r.date ?? r.recordedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    value: r.eGFR ?? 0,
    stage: r.ckdStage ?? "",
  })).filter(r => r.value > 0), [readings]);

  const latestEGFR = eGFRData.length > 0 ? eGFRData[eGFRData.length - 1].value : null;
  const egfrChange = eGFRData.length >= 2 ? eGFRData[eGFRData.length - 1].value - eGFRData[eGFRData.length - 2].value : null;

  const creatinineData = useMemo(() => readings.map(r => ({
    date: r.date,
    value: r.creatinine ?? 0,
  })).filter(r => r.value > 0), [readings]);

  const latestCreatinine = creatinineData.length > 0 ? creatinineData[creatinineData.length - 1].value : null;

  const electrolytes = useMemo(() => {
    if (readings.length === 0) return { potassium: 0, sodium: 0, chloride: 0, bicarbonate: 0, calcium: 0, phosphate: 0, magnesium: 0, albumin: 0 };
    const latest = readings[readings.length - 1];
    return {
      potassium: latest.potassium ?? 0,
      sodium: latest.sodium ?? 0,
      chloride: latest.chloride ?? 0,
      bicarbonate: latest.HCO3 ?? 0,
      calcium: latest.calcium ?? 0,
      phosphate: latest.phosphate ?? 0,
      magnesium: latest.magnesium ?? 0,
      albumin: latest.albumin ?? 0,
    };
  }, [readings]);

  const bmi = profile?.bmi as number | undefined;
  const age = profile?.age as number | undefined;
  const gender = profile?.gender as string | undefined;

  const eGFRTrendVals = useMemo(() => eGFRData.map(d => d.value), [eGFRData]);
  const scientificAlerts = useMemo(() => generateClinicalAlerts(
    eGFRTrendVals,
    electrolytes.potassium || null,
    electrolytes.bicarbonate || null,
    Number(profile?.hemoglobin ?? profile?.hb ?? null) || null,
    Number(profile?.ferritin ?? null) || null,
    Number(profile?.ironSaturation ?? profile?.transferrinSaturation ?? null) || null,
    { sys: Number(profile?.systolicBP ?? profile?.systolic ?? 0), dia: Number(profile?.diastolicBP ?? profile?.diastolic ?? 0) },
    Number(profile?.upcr ?? profile?.proteinuria ?? null) || null,
    electrolytes.albumin || null,
    medications,
    Boolean(profile?.hasAvFistula),
  ), [eGFRTrendVals, electrolytes, profile, medications]);

  return (
    <div>
      {/* Tab Navigation */}
      <div ref={tabsRef} className="ckd-scroll" style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 8, marginBottom: 14, WebkitOverflowScrolling: "touch" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "7px 13px", borderRadius: 10, border: "0.5px solid " + (tab === t.id ? T.info : T.border), background: tab === t.id ? "#ecfeff" : "transparent", color: tab === t.id ? T.info : T.faint, fontSize: 12, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Patient Summary Card */}
      <Card style={{ padding: "12px 15px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#0891b2 0%,#22d3ee 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
            {patientName?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>{patientName}</div>
            <div style={{ display: "flex", gap: 10, color: T.faint, fontSize: 11, flexWrap: "wrap" }}>
              <span>{profile?.universalId as string ?? profile?.nhif as string ?? patientId.slice(0,10)}</span>
              {age && <span>{age}yo</span>}
              {gender && <span>{gender}</span>}
              {bmi && <span>BMI {bmi}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <StatCard label="Latest eGFR" value={latestEGFR != null ? latestEGFR.toFixed(1) : "—"} sub="mL/min"
              color={egfrChange != null ? (egfrChange >= 0 ? T.success : T.danger) : undefined} />
            <StatCard label="Latest Creatinine" value={latestCreatinine != null ? latestCreatinine.toFixed(1) : "—"} sub="µmol/L" />
            <StatCard label="K+" value={electrolytes.potassium ? electrolytes.potassium.toFixed(1) : "—"} sub="mmol/L" />
          </div>
        </div>
      </Card>

      {/* Tab Content */}
      {loadingR ? <Skeleton height={200} /> : (
        <>
          {tab === "egfr" && <EGTab readings={readings} />}
          {tab === "creatinine" && <CreatinineTab readings={readings} />}
          {tab === "electrolytes" && <ElectrolytesTab readings={readings} />}
          {tab === "medications" && (
            <MedsTab medications={medications} patientId={patientId} />
          )}
          {tab === "adherence" && (
            <AdherenceTab adherence={adherence} />
          )}
          {tab === "alerts" && (
            <AlertsTab alerts={alerts} onAdd={handleSaveAlert} onDelete={handleDismissAlert}
              eGFRTrend={eGFRTrendVals} latestK={electrolytes.potassium || null}
              latestHCO3={electrolytes.bicarbonate || null} latestHb={Number(profile?.hemoglobin ?? profile?.hb ?? null) || null}
              latestFerritin={Number(profile?.ferritin ?? null) || null}
              latestTSAT={Number(profile?.ironSaturation ?? profile?.transferrinSaturation ?? null) || null}
              latestBP={{ sys: Number(profile?.systolicBP ?? profile?.systolic ?? 0), dia: Number(profile?.diastolicBP ?? profile?.diastolic ?? 0) }}
              latestACR={Number(profile?.upcr ?? profile?.proteinuria ?? null) || null}
              latestAlbumin={electrolytes.albumin || null}
              medications={medications} hasAVFistula={Boolean(profile?.hasAvFistula)} />
          )}
          {tab === "complications" && (
            <ComplicationsTab complications={complications} onUpdate={handleUpdateComplication} />
          )}
          {tab === "lifestyle" && (
            <LifestyleTab items={lifestyle} onUpdate={handleUpdateLifestyle} />
          )}
          {tab === "education" && (
            <EducationTab education={educationTopics} onSend={handleSendEducation as unknown as (topic: CKDEducationTopic) => void} patientId={patientId} doctorId={doctorId} doctorName={doctorName} />
          )}
          {tab === "labs" && (
            <LabsTab labOrders={labOrders} imagingOrders={imagingOrders}
              onOrderLab={handleOrderLab} onOrderImaging={handleOrderImaging} onUpdateResult={handleUpdateResult} />
          )}
          {tab === "notes" && (
            <NotesTab notes={clinicalNotes} onSave={handleSaveNote} onEdit={handleEditNote}
              patientName={patientName} doctorId={doctorId} doctorName={doctorName} />
          )}
          {tab === "timeline" && <TimelineTab events={timelineEvents} />}
          {tab === "messaging" && (
            <MessagingTab messages={messages} onSend={handleSendMessage}
              threadId={threadId} loadingMessages={loadingMsg}
              patientName={patientName} onOpenMessaging={() => onOpenConversation?.(threadId)} />
          )}
          {tab === "referrals" && (
            <ReferralsTab referrals={referrals} onAdd={handleAddReferral}
              doctorId={doctorId} doctorName={doctorName} patientName={patientName} patientId={patientId}
              onOpenReferrals={onOpenReferrals ? (pid, pname) => onOpenReferrals(pid, pname) : undefined} />
          )}
          {tab === "dialysis" && (
            <DialysisPlanningTab patientProfile={profile} onUpdateProfile={handleUpdateProfile} />
          )}
        </>
      )}
    </div>
  );
}
function PatientPicker({ patients, selectedId, onSelect, loading }: {
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
        <div style={{ fontSize: 36, marginBottom: 10 }}>{"\uD83E\uDE7B"}</div>
        <div style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>No CKD Patients Found</div>
        <div style={{ color: T.faint, fontSize: 11, marginTop: 5 }}>Patients appear here once they log CKD data (eGFR, creatinine) via the AMEXAN patient app.</div>
      </div>
    </Card>
  );
  return (
    <Card style={{ padding: "14px 14px" }}>
      <SectHeader label={"CKD Patients (" + patients.length + ")"} color={T.info} />
      <input type="search" placeholder="Search by name, ID or email..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", background: T.bg, border: "0.5px solid " + T.border, borderRadius: 10, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", marginBottom: 10, fontFamily: "inherit" }} />
      <div className="ckd-scroll" style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 420, overflowY: "auto" }}>
        {filtered.map(p => {
          const active = selectedId === p.id;
          return (
            <button key={p.id} onClick={() => onSelect(p.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                border: active ? "1.5px solid rgba(8,145,178,0.4)" : "0.5px solid " + T.border,
                background: active ? "rgba(8,145,178,0.04)" : T.bg, fontFamily: "inherit", width: "100%", transition: "all 0.15s" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: active ? "rgba(8,145,178,0.12)" : T.bg, border: "0.5px solid " + (active ? "rgba(8,145,178,0.3)" : T.border), display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#0891b2" : T.muted, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: active ? "#0891b2" : T.text, fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ color: T.faint, fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.universalId ?? p.id.slice(0,10)}{p.latestAt && " \u00B7 " + p.latestAt.toLocaleDateString()}
                </div>
              </div>
              {p.latesteGFR && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: p.latesteGFR < 30 ? T.danger : p.latesteGFR < 60 ? T.warn : T.success, fontWeight: 700, fontSize: 12 }}>{p.latesteGFR.toFixed(1)}</div>
                  <div style={{ padding: "1px 5px", borderRadius: 4, background: p.latesteGFR < 30 ? "#fef2f2" : p.latesteGFR < 60 ? "#fffbeb" : "#f0fdf4", color: p.latesteGFR < 30 ? T.danger : p.latesteGFR < 60 ? T.warn : T.success, fontSize: 9, fontWeight: 700, display: "inline-block", marginTop: 1 }}>eGFR</div>
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
}

export default function CKDDashboard({ doctorId, doctorName, onOpenConversation, onOpenReferrals }:
  { doctorId?: string; doctorName?: string; onOpenConversation?: (threadId: string) => void; onOpenReferrals?:
    (patientId: string, patientName: string) => void })
{
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [mobileScreen, setMobileScreen] = useState<"list"|"detail">("list");
  const [listSearch, setListSearch] = useState("");

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "ckd-dashboard-css";
    if (!document.getElementById("ckd-dashboard-css")) {
      el.innerHTML = GLOBAL_CSS;
      document.head.appendChild(el);
    }
    return () => { document.getElementById("ckd-dashboard-css")?.remove(); };
  }, []);

  useEffect(() => {
    const q = query(collection(db, "toolReadings"), where("toolType", "==", "ckd_monitor"));
    return onSnapshot(q, async snap => {
      const map: Record<string, { count: number; latestEGFR?: number; latestCreatinine?: number; latestAt?: Date }> = {};
      snap.docs.forEach(d => {
        const data = d.data() as RawCKDReading & { patientId: string };
        const pid = data.patientId; if (!pid) return;
        const egfr = (data.data as Record<string, number> | undefined)?.eGFR ?? (data.data as Record<string, number> | undefined)?.egfr;
        const cr = (data.data as Record<string, number> | undefined)?.creatinine;
        const at = data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date();
        if (!map[pid]) map[pid] = { count: 0 };
        map[pid].count++;
        if (!map[pid].latestAt || at > map[pid].latestAt!) {
          map[pid].latestAt = at; map[pid].latestEGFR = egfr; map[pid].latestCreatinine = cr;
        }
      });
      const ids = Object.keys(map);
      if (!ids.length) { setPatients([]); setLoadingPatients(false); return; }
      const results = await Promise.all(ids.map(async pid => {
        try {
          let pd: Record<string, unknown> | null = null;
          try { const u = await getDoc(doc(db, "users", pid)); if (u.exists()) pd = u.data(); } catch {}
          if (!pd) { try { const p = await getDoc(doc(db, "patientProfiles", pid)); if (p.exists()) pd = p.data(); } catch {} }
          const name = String(pd?.name ?? pd?.displayName ?? pd?.fullName ?? pid);
          return {
            id: pid, name, email: String(pd?.email ?? ""), phone: String(pd?.phone ?? ""),
            universalId: String(pd?.universalId ?? pd?.nhif ?? ""),
            latesteGFR: map[pid].latestEGFR, latestCreatinine: map[pid].latestCreatinine,
            latestAt: map[pid].latestAt, totalReadings: map[pid].count,
          } as PatientSummary;
        } catch {
          return { id: pid, name: pid, totalReadings: map[pid].count, latesteGFR: map[pid].latestEGFR, latestCreatinine: map[pid].latestCreatinine, latestAt: map[pid].latestAt } as PatientSummary;
        }
      }));
      results.sort((a, b) => (b.latestAt?.getTime() ?? 0) - (a.latestAt?.getTime() ?? 0));
      setPatients(results);
      if (!selectedId && results.length > 0) setSelectedId(results[0].id);
      setLoadingPatients(false);
    }, () => setLoadingPatients(false));
  }, [doctorId]);

  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedId) ?? null, [patients, selectedId]);

  const filteredMobilePatients = useMemo(() =>
    patients.filter(p => p.name.toLowerCase().includes(listSearch.toLowerCase()) || (p.universalId ?? "").toLowerCase().includes(listSearch.toLowerCase())),
    [patients, listSearch]);

  return (
    <div className="ckd-root" style={{ color: T.text, background: T.bg, minHeight: "100%", padding: "0 0 24px" }}>
      {/* MOBILE: List screen */}
      <div className={"ckd-mobile-list ckd-scroll" + (mobileScreen === "detail" ? " hidden" : "")}>
        <div className="ckd-list-topbar">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2>{"\uD83E\uDE7B"} CKD Control Center</h2>
              <p>AMEXAN \u00B7 Renal Intelligence \u00B7 KDIGO 2024</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(8,145,178,0.18)", borderRadius: 20, padding: "5px 11px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", animation: "ckd-pulse 2s ease-in-out infinite" }} />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>Live</span>
            </div>
          </div>
        </div>
        <div className="ckd-list-search">
          <input type="search" value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search patients..." />
        </div>
        {loadingPatients
          ? <div style={{ padding: "32px 16px", color: T.faint, textAlign: "center" }}><span style={{ animation: "ckd-pulse 1.4s ease-in-out infinite", display: "inline-block" }}>Loading patients...</span></div>
          : !patients.length
            ? <div style={{ padding: "48px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>{"\uD83E\uDE7B"}</div><div style={{ color: T.muted, fontSize: 13 }}>No CKD monitoring patients found.</div></div>
            : filteredMobilePatients.map(p => {
              const active = selectedId === p.id;
              return (
                <button key={p.id} onClick={() => { setSelectedId(p.id); setMobileScreen("detail"); }} className={"ckd-patient-btn" + (active ? " active-row" : "")}>
                  <div className="ckd-patient-avatar">{p.name.charAt(0).toUpperCase()}</div>
                  <div className="ckd-patient-row-info">
                    <div className="ckd-patient-row-name">{p.name}</div>
                    <div className="ckd-patient-row-sub">
                      {p.universalId || p.id.slice(0,10)}
                      {p.latestAt && " \u00B7 " + p.latestAt.toLocaleDateString()}
                      {" \u00B7 " + p.totalReadings + " readings"}
                    </div>
                  </div>
                  {p.latesteGFR && (
                    <div className="ckd-patient-row-egfr">
                      <div style={{ fontWeight: 800, fontSize: 14, color: p.latesteGFR < 30 ? T.danger : p.latesteGFR < 60 ? T.warn : T.success }}>{p.latesteGFR.toFixed(0)}</div>
                      <div style={{ fontSize: 9, color: p.latesteGFR < 30 ? T.danger : p.latesteGFR < 60 ? T.warn : T.success, fontWeight: 700, background: p.latesteGFR < 30 ? "#fef2f2" : p.latesteGFR < 60 ? "#fffbeb" : "#f0fdf4", borderRadius: 4, padding: "1px 5px", display: "inline-block", marginTop: 2 }}>eGFR</div>
                    </div>
                  )}
                  <span style={{ color: T.faint, fontSize: 20, marginLeft: 4, flexShrink: 0 }}>{"\u203A"}</span>
                </button>
              );
            })}
      </div>

      {/* MOBILE: Detail screen */}
      <div className={"ckd-mobile-detail" + (mobileScreen === "list" ? " hidden" : "")}>
        {selectedPatient ? (
          <>
            <div className="ckd-detail-topbar">
              <button className="ckd-back-btn" onClick={() => setMobileScreen("list")}>{"\u2190"}</button>
              <div className="ckd-detail-topbar-avatar">{selectedPatient.name.charAt(0).toUpperCase()}</div>
              <div className="ckd-detail-topbar-info">
                <div className="ckd-detail-topbar-name">{selectedPatient.name}</div>
                <div className="ckd-detail-topbar-sub">{selectedPatient.universalId ?? selectedPatient.id.slice(0,10)} \u00B7 {selectedPatient.totalReadings} readings</div>
              </div>
              {selectedPatient.latesteGFR && (
                <div className="ckd-detail-topbar-egfr">
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>{selectedPatient.latesteGFR.toFixed(0)}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>eGFR</div>
                </div>
              )}
            </div>
            <div className="ckd-detail-content ckd-scroll">
              <PatientPanel patientId={selectedPatient.id} onOpenReferrals={onOpenReferrals} onOpenConversation={onOpenConversation} patientName={selectedPatient.name} doctorId={doctorId} doctorName={doctorName} />
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: T.faint, fontSize: 14, gap: 10 }}>
            <span style={{ fontSize: 48 }}>{"\uD83E\uDE7B"}</span>
            <span>Select a patient</span>
          </div>
        )}
      </div>

      {/* DESKTOP: Two-column layout */}
      <div className="ckd-desktop-layout" style={{ flexDirection: "column", minHeight: "100%" }}>
        <div className="ckd-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10, padding: "16px 0 0" }}>
          <div>
            <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, margin: 0 }}>{"\uD83E\uDE7B"} CKD Monitoring Control Center</h2>
            <p style={{ color: T.muted, fontSize: 12, margin: "3px 0 0" }}>Renal intelligence \u00B7 AMEXAN \u00B7 KDIGO 2024 \u00B7 NKF-KDOQI</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: T.muted }}>{patients.length} patients \u00B7 {patients.reduce((a, p) => a + p.totalReadings, 0)} readings</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(8,145,178,0.08)", border: "0.5px solid rgba(8,145,178,0.3)", borderRadius: 8, padding: "6px 13px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22d3ee", animation: "ckd-pulse 2s ease-in-out infinite" }} />
              <span style={{ color: "#0891b2", fontSize: 12, fontWeight: 600 }}>Live Sync</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
          <div className="ckd-patient-list" style={{ width: 290, flexShrink: 0 }}>
            <PatientPicker patients={patients} selectedId={selectedId} onSelect={setSelectedId} loading={loadingPatients} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedPatient
              ? <PatientPanel patientId={selectedPatient.id} onOpenReferrals={onOpenReferrals} onOpenConversation={onOpenConversation} patientName={selectedPatient.name} doctorId={doctorId} doctorName={doctorName} />
              : loadingPatients
                ? <Skeleton height={300} />
                : patients.length > 0
                  ? <Card><div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}><div style={{ fontSize: 36, marginBottom: 10 }}>{"\uD83E\uDE7B"}</div>Select a patient from the list</div></Card>
                  : null}
          </div>
        </div>
      </div>
    </div>
  );
}
