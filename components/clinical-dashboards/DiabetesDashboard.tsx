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
  "Metformin": {
    drugClass: "Biguanide",
    mechanism: "AMPK activation, reduces hepatic gluconeogenesis, increases insulin sensitivity, reduces intestinal glucose absorption. First-line for type 2 diabetes.",
    minDose: 500, maxDose: 2550, unit: "mg",
    commonDoses: ["500","850","1000"], frequencies: ["BD","TDS"], routes: ["Oral"],
    indications: ["Type 2 diabetes (first-line)","Prediabetes","PCOS (off-label)","Gestational diabetes (off-label)"],
    contraindications: ["eGFR <30 mL/min/1.73m2","Severe liver disease","Alcoholism (acute intoxication)","Metabolic acidosis","History of lactic acidosis","Decompensated heart failure","Severe infection/sepsis"],
    warnings: ["Lactic acidosis rare but potentially fatal","Hold 48h before IV contrast","Hold during acute illness, dehydration, or sepsis","Long-term: Vitamin B12 deficiency (screen annually)","May cause ovulation in anovulatory women"],
    sideEffects: ["GI upset (nausea, diarrhoea, abdominal pain)","Metallic taste","B12 deficiency (10-30% with long-term use)","Lactic acidosis (rare)","Decreased appetite"],
    patientInstructions: "Take WITH FOOD to reduce GI side effects. Start at 500mg ONCE daily with largest meal, increase slowly over 4-8 weeks. Extended-release (XR) versions cause less GI upset. NEVER drink alcohol excessively while on metformin. Stop metformin 48h before any contrast dye scan and restart after 48h (after checking kidney function).",
    monitoring: ["eGFR (baseline, then 6-monthly)","HbA1c (every 3-6 months)","Vitamin B12 (annually after 3-4 years)","LFTs at baseline","Fasting glucose"],
    interactions: ["Iodinated contrast - hold metformin 48h before and after","Alcohol - increases lactic acidosis risk","Cimetidine - increases metformin levels","NSAIDs - may affect renal function"],
    pregnancyCategory: "B - generally safe, preferred in GDM",
    renalDose: "eGFR 30-45: max 1000mg/day; eGFR 15-30: avoid; <15: contraindicated",
    hepaticDose: "Avoid in severe hepatic impairment",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Gliclazide": {
    drugClass: "Sulfonylurea (2nd generation)",
    mechanism: "Binds to SUR1 subunit of K_ATP channels on pancreatic beta-cells increasing insulin secretion. MR formulation provides once-daily dosing.",
    minDose: 40, maxDose: 320, unit: "mg",
    commonDoses: ["40","80","160","320"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Type 2 diabetes (after metformin insufficient)","Type 2 diabetes when metformin contraindicated/intolerant"],
    contraindications: ["Type 1 diabetes","DKA","Severe hepatic impairment","Severe renal impairment (eGFR <15)"],
    warnings: ["Hypoglycemia risk","Weight gain (2-3 kg typical)","Secondary failure after prolonged use","May increase CV risk"],
    sideEffects: ["Hypoglycemia (most common)","Weight gain","GI upset","Headache","Dizziness","Rash (rare)","Hyponatremia (rare)"],
    patientInstructions: "Take ONCE or TWICE daily WITH MEALS. MR tablets: take with breakfast, swallow whole. Carry glucose/dextrose tablets. CHECK BLOOD GLUCOSE BEFORE DRIVING. Do not skip meals.",
    monitoring: ["HbA1c (every 3-6 months)","Fasting and postprandial glucose","Body weight","Renal function"],
    interactions: ["Other antidiabetics - increase hypoglycemia","Beta-blockers - mask hypoglycemia symptoms","CYP2C9 inhibitors (fluconazole) - increase levels","Alcohol - disulfiram-like reaction"],
    pregnancyCategory: "C - insulin preferred in pregnancy",
    renalDose: "MR: start 30mg if eGFR 15-59; avoid if eGFR <15",
    hepaticDose: "Avoid in severe hepatic disease",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Glibenclamide": {
    drugClass: "Sulfonylurea (2nd generation, glyburide)",
    mechanism: "Binds SUR1 on beta-cells - K_ATP channel closure increases insulin secretion. More potent but higher hypoglycemia risk.",
    minDose: 2.5, maxDose: 15, unit: "mg",
    commonDoses: ["2.5","5","10","15"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["Type 2 diabetes"],
    contraindications: ["Type 1 diabetes","DKA","Elderly (>65) - increased hypoglycemia risk","Severe hepatic/renal impairment"],
    warnings: ["PROLONGED SEVERE HYPOGLYCEMIA in elderly/renal impairment/missed meals","Weight gain (2-4 kg)","Avoid in patients >65","Avoid in G6PD deficiency"],
    sideEffects: ["Hypoglycemia (severe and prolonged)","Weight gain","Nausea","Cholestatic jaundice (rare)","Photosensitivity","Disulfiram-like reaction with alcohol"],
    patientInstructions: "Take WITH MEALS. HIGH RISK OF SEVERE HYPOGLYCEMIA - especially if you skip meals, drink alcohol, or have kidney issues. Always carry emergency sugar.",
    monitoring: ["HbA1c (every 3-6 months)","Fasting glucose","Renal function","Liver function"],
    interactions: ["Alcohol - prolonged severe hypoglycemia","Beta-blockers - mask symptoms","CYP2C9 inhibitors - increase levels"],
    pregnancyCategory: "C - not recommended in pregnancy",
    renalDose: "Avoid if eGFR <30",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Pioglitazone": {
    drugClass: "Thiazolidinedione (TZD)",
    mechanism: "PPARgamma agonist increasing insulin sensitivity in adipose tissue, muscle, liver reducing glucose production and increasing glucose uptake.",
    minDose: 15, maxDose: 45, unit: "mg",
    commonDoses: ["15","30","45"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Type 2 diabetes (with metformin or sulfonylurea)","NAFLD/NASH (off-label)"],
    contraindications: ["Heart failure (NYHA III/IV)","Bladder cancer (current or history)","Active liver disease (ALT >2.5x ULN)","Osteoporosis (increased fracture risk in women)","Type 1 diabetes"],
    warnings: ["FLUID RETENTION - peripheral edema, increased CHF risk","BLADDER CANCER - meta-analysis shows 14-22% increased risk","Bone fractures (women - increased 40-50%)","Weight gain (2-5 kg)","Monitor LFTs","Macular edema (rare)"],
    sideEffects: ["Weight gain","Edema","Fluid retention","Headache","Upper respiratory infection","Sinusitis","Myalgia","Fracture risk (women)","Hepatotoxicity (rare)"],
    patientInstructions: "Take ONCE DAILY with or without food. Report swelling, sudden weight gain >2kg/week, SOB, vision changes, or blood in urine. Full effect takes 6-12 WEEKS.",
    monitoring: ["LFTs at baseline then every 2 months for 1 year","Symptoms of heart failure","Body weight","HbA1c every 3-6 months"],
    interactions: ["Insulin - increased edema + HF risk (AVOID)","NSAIDs - increased edema","CYP2C8 inhibitors (gemfibrozil) - increase levels"],
    pregnancyCategory: "C - avoid in pregnancy",
    renalDose: "No dose adjustment needed",
    color: "#059669", tlColor: "#10b981",
  },
  "Sitagliptin": {
    drugClass: "DPP-4 Inhibitor (Gliptin)",
    mechanism: "Inhibits DPP-4 enzyme increasing GLP-1 and GIP levels leading to glucose-dependent insulin secretion and reduced glucagon. Weight-neutral, low hypoglycemia risk.",
    minDose: 25, maxDose: 100, unit: "mg",
    commonDoses: ["25","50","100"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Type 2 diabetes (add-on to metformin)","Type 2 diabetes (combination with insulin)"],
    contraindications: ["Type 1 diabetes","DKA","Hx of pancreatitis (relative)"],
    warnings: ["Acute pancreatitis (rare 0.03-0.3%)","Severe arthralgia (joint pain)","Bullous pemphigoid (rare)","Renal dose adjustment REQUIRED","CV neutral per TECOS"],
    sideEffects: ["Upper respiratory infection","Nasopharyngitis","Headache","Nausea","Diarrhea","Pancreatitis (rare)","Joint pain (rare)","Angioedema (rare)"],
    patientInstructions: "Take ONCE DAILY, with or without food. Report SEVERE ABDOMINAL PAIN (pancreatitis), severe joint pain, or blistering skin. Does NOT cause hypoglycemia alone.",
    monitoring: ["HbA1c (every 3-6 months)","Renal function (for dose adjustment)","Symptoms of pancreatitis"],
    interactions: ["Sulfonylureas/insulin - increased hypoglycemia risk","Digoxin - small increase in digoxin levels"],
    pregnancyCategory: "B - limited data",
    renalDose: "eGFR 30-45: 50mg OD; eGFR <30: 25mg OD",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Empagliflozin": {
    drugClass: "SGLT2 Inhibitor (Gliflozin)",
    mechanism: "Inhibits SGLT2 in proximal renal tubule blocking glucose reabsorption causing glucosuria and reducing plasma glucose. Also reduces BP, weight, and uric acid.",
    minDose: 10, maxDose: 25, unit: "mg",
    commonDoses: ["10","25"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Type 2 diabetes with CVD/CKD","Type 2 diabetes add-on therapy","HFrEF with/without diabetes (EMPEROR-Reduced)","CKD (EMPEROR-Preserved, EMPA-KIDNEY)"],
    contraindications: ["Type 1 diabetes (off-label extreme caution)","eGFR <20 (for glycemic indication)","Recurrent DKA","Fournier gangrene risk"],
    warnings: ["EUGLYCEMIC DKA (sick day rule: hold during illness)","Genital infections (candidal balanitis/vulvovaginitis 5-10%)","Fournier gangrene (rare emergency)","Volume depletion (elderly, loop diuretics)","Hyperkalemia (with RAAS blockers)"],
    sideEffects: ["Genital yeast infections (very common)","UTIs","Polyuria/dehydration","Thirst","Hypotension","Hyperkalemia","DKA (atypical, euglycemic)","Fournier gangrene (rare)"],
    patientInstructions: "Take ONCE DAILY in the morning. You may urinate more. Maintain good genital hygiene. REPORT: severe genital pain/swelling/fever, nausea/vomiting despite normal BG. SICK DAY RULE: stop if you cannot eat/drink. EMPA-REG: reduced CV death 38%.",
    monitoring: ["HbA1c","eGFR","Genital exam","Volume status","Ketones if unwell"],
    interactions: ["Loop diuretics - increased volume depletion","Insulin/sulfonylureas - increased hypoglycemia","NSAIDs - increased renal risk"],
    pregnancyCategory: "C - not recommended in pregnancy",
    renalDose: "eGFR 20-44: maintain 10mg; <20: avoid for glycemic indication",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "Dapagliflozin": {
    drugClass: "SGLT2 Inhibitor (Gliflozin)",
    mechanism: "Selective SGLT2 inhibitor causing glucosuria and natriuresis reducing glucose, BP, weight, and intraglomerular pressure.",
    minDose: 5, maxDose: 10, unit: "mg",
    commonDoses: ["5","10"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Type 2 diabetes (DECLARE-TIMI 58)","HFrEF regardless of diabetes (DAPA-HF)","CKD regardless of diabetes (DAPA-CKD)"],
    contraindications: ["Type 1 diabetes (off-label)","eGFR <25 (for glycemic indication)"],
    warnings: ["Euglycemic DKA - hold during illness","Genital infections","Volume depletion","Fournier gangrene","Stop before surgery 24-48h"],
    sideEffects: ["Genital yeast infections","UTI","Polyuria","Dehydration","Hypotension","DKA","Hyperkalemia","Nausea"],
    patientInstructions: "Take ONCE DAILY, morning. Good genital hygiene. SICK DAY RULE: stop if vomiting/diarrhoea. DAPA-HF: reduced CV death 18%, reduced HHF 30%. DAPA-CKD: reduced composite 39%.",
    monitoring: ["HbA1c","eGFR","Volume status","Ketones during illness"],
    interactions: ["Diuretics - additive hypovolemia","Insulin/sulfonylureas - increased hypoglycemia","NSAIDs - reduced efficacy, increased AKI risk"],
    pregnancyCategory: "C - avoid",
    renalDose: "eGFR 25-45: caution; <25: avoid for glycemic indication",
    color: "#c2410c", tlColor: "#ea580c",
  },
  "Liraglutide": {
    drugClass: "GLP-1 Receptor Agonist",
    mechanism: "GLP-1 RA increasing glucose-dependent insulin secretion, reducing glucagon, increasing satiety, slowing gastric emptying, reducing body weight. Once-daily SC.",
    minDose: 0.6, maxDose: 3.0, unit: "mg",
    commonDoses: ["0.6","1.2","1.8","3.0"], frequencies: ["OD"], routes: ["SC"],
    indications: ["Type 2 diabetes (after metformin)","CV risk reduction (LEADER: reduced MACE 13%)","Obesity (Saxenda 3.0mg)"],
    contraindications: ["Type 1 diabetes","DKA","MTC/MEN-2","Severe GI disease (gastroparesis)"],
    warnings: ["Thyroid C-cell tumors (rodent data)","Pancreatitis (discontinue if suspected)","DKA in T1DM (do not use)","AKI from dehydration","HR increase 2-4 bpm"],
    sideEffects: ["Nausea/vomiting (dose-dependent)","Diarrhea","Constipation","Reduced Appetite leading to weight loss","Headache","Injection site reactions","Increased HR 2-4 bpm","Pancreatitis (rare)"],
    patientInstructions: "Inject SC ONCE DAILY in abdomen/thigh/upper arm. Start 0.6mg for 1 week, then increase to 1.2mg. Nausea improves over weeks. LEADER: reduced MACE 13%, reduced CV death.",
    monitoring: ["HbA1c","Weight","HR","Pancreatitis symptoms","eGFR"],
    interactions: ["Insulin/sulfonylureas - increased hypoglycemia","Warfarin - may increase INR","Oral contraceptives - delayed absorption"],
    pregnancyCategory: "X - avoid in pregnancy",
    renalDose: "Use with extreme caution if eGFR <15",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Semaglutide": {
    drugClass: "GLP-1 Receptor Agonist",
    mechanism: "GLP-1 RA (once-weekly SC or once-daily oral) increasing glucose-dependent insulin, reducing glucagon, increasing satiety, reducing weight. Most potent GLP-1 for weight loss.",
    minDose: 0.5, maxDose: 2.0, unit: "mg",
    commonDoses: ["0.25","0.5","1.0","2.0"], frequencies: ["Weekly"], routes: ["SC","Oral"],
    indications: ["Type 2 diabetes (SUSTAIN-6: reduced MACE 26%)","Obesity (Wegovy 2.4mg)","CV risk reduction (PIONEER 6)"],
    contraindications: ["Type 1 diabetes","MTC/MEN-2","Severe gastroparesis","Hx of pancreatitis"],
    warnings: ["Pancreatitis - discontinue if suspected","Thyroid C-cell tumors","Gallbladder disease with rapid weight loss","HR increase 3-5 bpm","Hypoglycemia with insulin/sulfonylurea"],
    sideEffects: ["Nausea/vomiting/diarrhea/constipation","Significant weight loss (4-15 kg)","Headache","Fatigue","Abdominal pain","Injection site reactions","Gallbladder disease (1-3%)"],
    patientInstructions: "SC (Ozempic): ONCE WEEKLY same day. Rotate sites. Oral (Rybelsus): on EMPTY STOMACH with <1/2 cup water, wait 30 min before eating. SUSTAIN-6: reduced MACE 26%, reduced stroke 39%.",
    monitoring: ["HbA1c","Weight","HR","Pancreatitis symptoms","Renal function","Gallbladder symptoms"],
    interactions: ["Insulin/sulfonylureas - reduce dose to prevent hypoglycemia","Warfarin - monitor INR"],
    pregnancyCategory: "X - avoid",
    renalDose: "eGFR 15-29: caution; <15: avoid",
    color: "#059669", tlColor: "#10b981",
  },
  "Dulaglutide": {
    drugClass: "GLP-1 Receptor Agonist",
    mechanism: "Long-acting GLP-1 RA (once weekly) increasing glucose-dependent insulin secretion, reducing glucagon, increasing satiety, reducing weight. Fixed-dose autoinjector.",
    minDose: 0.75, maxDose: 4.5, unit: "mg",
    commonDoses: ["0.75","1.5","3.0","4.5"], frequencies: ["Weekly"], routes: ["SC"],
    indications: ["Type 2 diabetes (REWIND: reduced MACE 12%)","Type 2 diabetes with CVD/high CV risk"],
    contraindications: ["Type 1 diabetes","MTC/MEN-2","Hx of pancreatitis","Severe GI disease"],
    warnings: ["Pancreatitis","Thyroid C-cell tumors","Gallbladder disease","HR increase","AKI with severe GI illness","Hypoglycemia with insulin/sulfonylurea"],
    sideEffects: ["Nausea/vomiting/diarrhea","Weight loss","Reduced Appetite","Headache","Injection site reaction","Pancreatitis (rare)","Cholelithiasis"],
    patientInstructions: "Inject ONCE WEEKLY SC. Same day each week. If miss dose and 3+ days remain, give missed dose. Refrigerate (2-8C). REWIND: reduced MACE 12% in primary + secondary prevention.",
    monitoring: ["HbA1c","Weight","HR","Pancreatitis symptoms"],
    interactions: ["Insulin/sulfonylureas - reduce dose if needed","Warfarin - monitor INR"],
    pregnancyCategory: "X",
    renalDose: "No dose adjustment needed; limited data in eGFR <15",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Insulin Glargine": {
    drugClass: "Long-acting Basal Insulin (Analog)",
    mechanism: "Recombinant human insulin analog forming microprecipitates in SC for slow prolonged release over 24h. U-100 and U-300 (Toujeo) formulations.",
    minDose: 10, maxDose: 100, unit: "units",
    commonDoses: ["10","20","30","40","50","60","80","100"], frequencies: ["OD"], routes: ["SC"],
    indications: ["Type 1 diabetes (with mealtime insulin)","Type 2 diabetes (basal insulin - often first insulin)","Gestational diabetes (off-label)"],
    contraindications: ["Hypoglycemia","Hypersensitivity"],
    warnings: ["Hypoglycemia (most common)","Do NOT mix/dilute with other insulin","Lipodystrophy at injection site","U-300 NOT bioequivalent to U-100","Weight gain (1-4 kg)"],
    sideEffects: ["Hypoglycemia","Weight gain","Injection site reactions","Lipodystrophy","Edema on initiation","Hypokalemia"],
    patientInstructions: "Inject SC ONCE DAILY same time each day. Rotate injection sites. Do not re-use needles. Discard after 28 days at room temperature. Monitor glucose at least 2-4x daily.",
    monitoring: ["Fasting glucose (target 4-7 mmol/L)","HbA1c (every 3-6 months)","Body weight","Injection sites","Hypoglycemia frequency"],
    interactions: ["All antidiabetic agents - increased hypoglycemia","Beta-blockers - mask symptoms","Alcohol - increased hypoglycemia","Corticosteroids - increased insulin requirements"],
    pregnancyCategory: "B - safe in pregnancy (preferred basal analog)",
    renalDose: "Close monitoring; no dose adjustment needed",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "Insulin Detemir": {
    drugClass: "Long-acting Basal Insulin (Analog)",
    mechanism: "Acylated human insulin analog binding to albumin for prolonged action 18-22h. More predictable than NPH.",
    minDose: 10, maxDose: 100, unit: "units",
    commonDoses: ["10","20","30","40","50","60","80"], frequencies: ["OD","BD"], routes: ["SC"],
    indications: ["Type 1 diabetes","Type 2 diabetes requiring basal insulin"],
    contraindications: ["Hypoglycemia","Hypersensitivity"],
    warnings: ["Hypoglycemia","Rotate injection sites","Lower weight gain than glargine or NPH","May need BD dosing in T1DM"],
    sideEffects: ["Hypoglycemia","Weight gain","Injection site reactions","Lipodystrophy"],
    patientInstructions: "Inject SC ONCE or TWICE daily. Once-daily: with evening meal or bedtime. Twice-daily: 12h apart. Rotate sites. Do not mix with other insulin.",
    monitoring: ["Fasting glucose","HbA1c","Weight","Injection sites"],
    interactions: ["Other antidiabetics - increased hypoglycemia","Beta-blockers - mask symptoms"],
    pregnancyCategory: "B - safe in pregnancy",
    renalDose: "Monitor glucose closely",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Insulin Degludec": {
    drugClass: "Ultra-long Basal Insulin (Analog)",
    mechanism: "DesB30 human insulin with acylation forming multihexamers for ultra-long flat profile >42h. Flexible dosing window (8-40h).",
    minDose: 10, maxDose: 100, unit: "units",
    commonDoses: ["10","20","30","40","50","60","80","100"], frequencies: ["OD"], routes: ["SC"],
    indications: ["Type 1 diabetes","Type 2 diabetes requiring basal insulin","Flexible injection timing"],
    contraindications: ["Hypoglycemia","Hypersensitivity"],
    warnings: ["Hypoglycemia (lower rate than glargine U-100 per SWITCH 1 and 2)","Rotate injection sites","U-200 formulation different from U-100"],
    sideEffects: ["Hypoglycemia","Weight gain","Injection site reactions","Lipodystrophy"],
    patientInstructions: "Inject SC ONCE DAILY (flexible timing: can vary up to 8h). Flat profile means less midnight lows. SWITCH 2: 25% lower hypoglycemia vs glargine in T2DM.",
    monitoring: ["Fasting glucose","HbA1c","Weight","Hypoglycemia episodes"],
    interactions: ["Other antidiabetic agents - increased hypoglycemia","Beta-blockers - mask hypoglycemia"],
    pregnancyCategory: "C - limited data",
    renalDose: "No dose adjustment, monitor closely in CKD",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Insulin Aspart": {
    drugClass: "Rapid-acting Bolus Insulin (Analog)",
    mechanism: "Human insulin analog (Asp-B28) with fast absorption (onset 15min, peak 1-2h, duration 3-4h). Dosed with meals.",
    minDose: 2, maxDose: 50, unit: "units",
    commonDoses: ["2","4","6","8","10","12","15","20","25","30"], frequencies: ["With meals (TDS + correction)"], routes: ["SC","IV"],
    indications: ["Type 1 diabetes (basal-bolus)","Type 2 diabetes (intensive insulin)","DKA (IV infusion)","Gestational diabetes (off-label)"],
    contraindications: ["Hypoglycemia","Hypersensitivity"],
    warnings: ["Hypoglycemia (dose-dependent)","Requires carb counting for optimal dosing","Weight gain (1-4 kg)","Lipodystrophy with poor rotation"],
    sideEffects: ["Hypoglycemia","Weight gain","Injection site pain","Lipodystrophy","Edema at initiation"],
    patientInstructions: "Inject SC just BEFORE or WITHIN 20 MIN AFTER starting meal. Calculate dose based on BG and carb intake. NEVER SHARE PENS. Always carry fast-acting sugar.",
    monitoring: ["Pre- and postprandial glucose (4x daily min)","HbA1c (every 3 months)","Weight","Hypoglycemia frequency","Ketones if persistently high"],
    interactions: ["Other antidiabetics - increased hypoglycemia","Beta-blockers - mask symptoms","Corticosteroids - increased requirements","Alcohol - increased hypoglycemia risk"],
    pregnancyCategory: "B - safe in pregnancy",
    renalDose: "Close monitoring; may need dose reduction",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Insulin Lispro": {
    drugClass: "Rapid-acting Bolus Insulin (Analog)",
    mechanism: "Human insulin analog (Lys-B28, Pro-B29) with rapid absorption (onset 15min, peak 30-90min, duration 3-5h).",
    minDose: 2, maxDose: 50, unit: "units",
    commonDoses: ["2","4","6","8","10","12","15","20","25","30"], frequencies: ["With meals"], routes: ["SC","IV"],
    indications: ["Type 1 diabetes (basal-bolus)","Type 2 diabetes (intensive insulin)","DKA (IV protocol)","Gestational diabetes"],
    contraindications: ["Hypoglycemia","Hypersensitivity"],
    warnings: ["Hypoglycemia","Weight gain","Rotate injection sites","Never share pens"],
    sideEffects: ["Hypoglycemia","Weight gain","Lipodystrophy","Injection site reactions"],
    patientInstructions: "Inject SC immediately before meals (up to 15 min). A premeal dose is typically 1u per 10-15g carb + correction. Do NOT inject if meal skipped.",
    monitoring: ["Pre/postprandial glucose","HbA1c","Weight","Hypoglycemia"],
    interactions: ["Other antidiabetics - increased hypoglycemia","Beta-blockers - mask symptoms"],
    pregnancyCategory: "B",
    renalDose: "Monitor closely",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Insulin Regular": {
    drugClass: "Short-acting Insulin (Human Recombinant)",
    mechanism: "Regular human insulin with onset 30-60 min, peak 2-4h, duration 5-8h. Given 30 min before meals.",
    minDose: 2, maxDose: 50, unit: "units",
    commonDoses: ["2","4","6","8","10","12","15","20","25","30"], frequencies: ["30min before meals"], routes: ["SC","IV"],
    indications: ["Type 1 diabetes","Type 2 diabetes","DKA (IV protocol)","Hyperkalemia (IV dextrose+insulin)"],
    contraindications: ["Hypoglycemia"],
    warnings: ["Requires 30-min timing BEFORE meals","Less predictable peak than rapid analogs","Higher risk of late postprandial hypoglycemia"],
    sideEffects: ["Hypoglycemia","Weight gain","Lipodystrophy"],
    patientInstructions: "Inject SC 30 MIN BEFORE MEALS. Eating immediately after injection increases hypoglycemia risk. Still used in hospital IV protocols for DKA.",
    monitoring: ["Pre- and postprandial glucose","HbA1c","Weight","Hypoglycemia episodes"],
    interactions: ["Beta-blockers - mask hypoglycemia","Corticosteroids - increased requirements","Alcohol - increased hypoglycemia risk"],
    pregnancyCategory: "B",
    renalDose: "Monitor closely in renal impairment",
    color: "#6b7280", tlColor: "#9ca3af",
  },
  "Insulin NPH": {
    drugClass: "Intermediate-acting Basal Insulin (Human Recombinant)",
    mechanism: "Neutral protamine Hagedorn - protamine + insulin complex causing delayed absorption. Onset 1-2h, peak 4-8h, duration 12-18h. Cloudy suspension.",
    minDose: 10, maxDose: 100, unit: "units",
    commonDoses: ["10","20","30","40","50"], frequencies: ["OD","BD"], routes: ["SC"],
    indications: ["Type 1 diabetes (with rapid insulin)","Type 2 diabetes (basal coverage)","Pregnancy (preferred basal in pregnancy)","Gestational diabetes"],
    contraindications: ["Hypoglycemia","Hypersensitivity"],
    warnings: ["CLOUDY - must ROLL between palms to resuspend (NOT SHAKE)","Pronounced peak (4-8h) causing risk of hypoglycemia","Higher variability than analogs","Weight gain"],
    sideEffects: ["Hypoglycemia (especially during peak 4-8h)","Weight gain","Lipodystrophy","Injection site reactions"],
    patientInstructions: "ROLL (do NOT shake) to mix. If ONCE daily, typically bedtime. If TWICE daily, 12h apart. PEAK at 4-8h - most likely time for hypoglycemia. PREFERRED basal in pregnancy.",
    monitoring: ["Fasting glucose (target 4-7 mmol/L)","Hypoglycemia during peak","HbA1c","Weight","Injection sites"],
    interactions: ["Other antidiabetics - increased hypoglycemia","Beta-blockers","Corticosteroids - increased requirements"],
    pregnancyCategory: "B - FIRST-LINE basal in pregnancy",
    renalDose: "Monitor closely in CKD",
    color: "#6b7280", tlColor: "#9ca3af",
  },
  "Acarbose": {
    drugClass: "Alpha-Glucosidase Inhibitor",
    mechanism: "Competitively inhibits alpha-glucosidase in small intestine delaying starch absorption and reducing postprandial glucose spikes.",
    minDose: 25, maxDose: 300, unit: "mg",
    commonDoses: ["25","50","100"], frequencies: ["TDS"], routes: ["Oral"],
    indications: ["Type 2 diabetes (postprandial glucose predominant)","Impaired glucose tolerance (STOP-NIDDM: reduced T2DM 25%)"],
    contraindications: ["Chronic GI disorders (IBD, malabsorption)","Cirrhosis","eGFR <25","DKA"],
    warnings: ["GI side effects 30-70% (flatulence, diarrhoea)","Do NOT use sucrose for hypoglycemia - use dextrose","Slow dose titration needed","Hepatotoxicity (rare)"],
    sideEffects: ["Flatulence (30-70%)","Diarrhea","Abdominal distension","Bloating","Transaminitis (rare)"],
    patientInstructions: "Take WITH FIRST BITE OF EACH MEAL. IMPORTANT: if hypoglycemia occurs, take GLUCOSE TABLETS (dextrose) - table sugar will NOT work. Titrate slowly.",
    monitoring: ["HbA1c","LFTs (first year)","GI tolerability"],
    interactions: ["Digoxin, warfarin - may alter absorption","Intestinal adsorbents - reduce effect"],
    pregnancyCategory: "B",
    renalDose: "eGFR <25: avoid",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Repaglinide": {
    drugClass: "Meglitinide (Glinide)",
    mechanism: "Binds to beta-cell K_ATP channel causing rapid increase in insulin secretion. Very short duration (3-4h) - dosed with meals.",
    minDose: 0.5, maxDose: 16, unit: "mg",
    commonDoses: ["0.5","1","2","4"], frequencies: ["With meals (TDS/QDS)"], routes: ["Oral"],
    indications: ["Type 2 diabetes (postprandial hyperglycemia)","Type 2 diabetes with irregular meal patterns","Renal impairment (hepatically cleared)","Elderly"],
    contraindications: ["Type 1 diabetes","DKA","Severe hepatic impairment"],
    warnings: ["Hypoglycemia (less than sulfonylureas)","Dose WITH each meal - skip if skip meal","Flexible dosing is key advantage","Weight gain less than SU"],
    sideEffects: ["Hypoglycemia","Weight gain (less than SU)","Diarrhea","Headache","Upper respiratory infection","Arthralgia"],
    patientInstructions: "Take WITHIN 15-30 MIN BEFORE MEALS or SKIP if meal skipped. Rapid onset (30-60 min), short duration (3-4h). The more carbs you eat, the more insulin released.",
    monitoring: ["Postprandial glucose (target <10 at 2h)","HbA1c","Weight"],
    interactions: ["Gemfibrozil - increased repaglinide levels (contraindicated)","CYP2C8 and CYP3A4 inhibitors - increase levels","Clopidogrel - increases levels","Beta-blockers - mask symptoms"],
    pregnancyCategory: "C - avoid",
    renalDose: "Safe - primarily hepatically cleared",
    hepaticDose: "Avoid severe hepatic impairment",
    color: "#7c3aed", tlColor: "#a855f7",
  },
};

// ─── Drug Info Lookup ──────────────────────────────────────────────────────────

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
  readings: GlucoseReading[],
  hba1cs: HbA1cReading[],
  medications: Medication[],
  adherencePct: number,
  labOrders: LabOrder[],
  footExams: FootExamResult[],
): ScientificAlert[] {
  const alerts: ScientificAlert[] = [];
  if (!readings.length && !hba1cs.length) return alerts;

  const glucoseReadings = readings.filter(r => typeof r.value === "number" && r.value > 0);
  const last7 = glucoseReadings.filter(r => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return r.recordedAt >= d;
  });
  const last30 = glucoseReadings.filter(r => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return r.recordedAt >= d;
  });
  const latestGlucose = glucoseReadings.at(-1);
  const latestHbA1c = hba1cs.at(-1);

  // 1. Hypoglycemia (<3.9 mmol/L)
  if (latestGlucose && latestGlucose.value < 3.9) {
    alerts.push({ id: "hypo", severity: "critical", category: "Hypoglycemia",
      title: `Hypoglycemia: ${latestGlucose.value.toFixed(1)} mmol/L`,
      detail: `Latest glucose below 3.9 mmol/L threshold. Risk factors: missed meal, excess insulin/sulfonylurea, alcohol, exercise.`,
      evidence: "ADA 2024 Standards — hypoglycemia defined as glucose <3.9 mmol/L (70 mg/dL)",
      action: "URGENT: Treat with 15g fast-acting carbohydrate (4 glucose tabs or 150mL juice). Recheck in 15 min. Review insulin/SU dosing. Consider reducing doses.",
      icon: "🆘" });
  }
  // 2. Severe Hypoglycemia (<3.0 mmol/L)
  if (latestGlucose && latestGlucose.value < 3.0) {
    alerts.push({ id: "severe_hypo", severity: "critical", category: "Severe Hypoglycemia",
      title: `SEVERE Hypoglycemia: ${latestGlucose.value.toFixed(1)} mmol/L`,
      detail: "Glucose <3.0 mmol/L requires immediate intervention. Risk of seizure, loss of consciousness, and death.",
      evidence: "ADA 2024 — Level 2 hypoglycemia requiring immediate action",
      action: "URGENT: If conscious: 15-20g fast-acting carbs + snack. If unconscious: Glucagon IM/SC 1mg or IV dextrose 50% 25g. Call emergency services. Discharge with glucagon kit.",
      icon: "🚨" });
  }
  // 3. Hyperglycemia (>13.9 mmol/L)
  if (latestGlucose && latestGlucose.value > 13.9) {
    alerts.push({ id: "hyper", severity: "urgent", category: "Hyperglycemia",
      title: `Hyperglycemia: ${latestGlucose.value.toFixed(1)} mmol/L`,
      detail: "Glucose >13.9 mmol/L increases risk of DKA and long-term complications. Check ketones if T1DM.",
      evidence: "ADA 2024 — hyperglycemia threshold; DKA risk with glucose >13.9 mmol/L",
      action: "Check urine/serum ketones. Review insulin regimen. Adjust prandial/correction doses. Rule out illness, infection, missed doses, or dietary indiscretion.",
      icon: "⚠️" });
  }
  // 4. HbA1c above target
  if (latestHbA1c && latestHbA1c.value >= 7.0) {
    const above = latestHbA1c.value - 7.0;
    alerts.push({ id: "hba1c_high", severity: "warning", category: "Glycemic Control",
      title: `HbA1c ${latestHbA1c.value.toFixed(1)}% — ${above.toFixed(1)}% Above Target`,
      detail: `HbA1c above target of <7.0% (ADA). Current: ${latestHbA1c.value.toFixed(1)}%. Each 1% reduction lowers microvascular complications by 35%.`,
      evidence: "UKPDS — each 1% HbA1c reduction → 35% ↓ microvascular complications; DCCT/EDIC — intensive control reduces long-term complications",
      action: "Intensify therapy. Consider adding/adjusting medications. Reinforce lifestyle (diet, exercise). Recheck in 3 months if stable, earlier if significantly elevated.",
      icon: "📊" });
  }
  // 5. Rising glucose trend (last 7 vs previous 7 days)
  const prev7 = glucoseReadings.filter(r => {
    const d1 = new Date(); d1.setDate(d1.getDate() - 14);
    const d2 = new Date(); d2.setDate(d2.getDate() - 7);
    return r.recordedAt >= d1 && r.recordedAt < d2;
  });
  if (last7.length >= 3 && prev7.length >= 3) {
    const avg7 = last7.reduce((a, r) => a + r.value, 0) / last7.length;
    const avgP7 = prev7.reduce((a, r) => a + r.value, 0) / prev7.length;
    if (avg7 - avgP7 >= 2.0) {
      alerts.push({ id: "trend_up", severity: "warning", category: "Worsening Trend",
        title: `Rising Glucose Trend: ↑${(avg7 - avgP7).toFixed(1)} mmol/L over past week`,
        detail: `Last 7-day average: ${avg7.toFixed(1)} vs previous 7-day average: ${avgP7.toFixed(1)} mmol/L.`,
        evidence: "ADA 2024 — trends more predictive than single readings; upward trend = medication review needed",
        action: "Review triggers: medication changes, illness, stress, dietary changes, reduced activity. Consider dose adjustment or therapy intensification.",
        icon: "📈" });
    }
  }
  // 6. No HbA1c in last 6 months
  if (!hba1cs.length || (Date.now() - (hba1cs.at(-1)?.recordedAt?.getTime() ?? 0)) > 180 * 86400000) {
    alerts.push({ id: "missed_hba1c", severity: "warning", category: "Monitoring Gap",
      title: "HbA1c Due — No Result in Past 6 Months",
      detail: "ADA recommends HbA1c monitoring every 3-6 months. Current gap exceeds 6 months.",
      evidence: "ADA 2024 — HbA1c testing at least twice yearly (quarterly if not at target or on therapy change)",
      action: "Order: HbA1c + Fasting Glucose + Lipid Panel + Urine ACR + LFTs + Renal Function.",
      icon: "🔬" });
  }
  // 7. Low adherence
  if (adherencePct < 50 && last30.length >= 5) {
    alerts.push({ id: "adherence", severity: "urgent", category: "Medication Non-Adherence",
      title: `Low Glucose Monitoring Adherence: ${Math.round(adherencePct)}%`,
      detail: "Monitoring adherence <50% impairs clinical decision-making. Regular glucose monitoring is essential for glycemic control.",
      evidence: "ADA 2024 — self-monitoring of glucose is essential for insulin therapy and recommended for all patients on non-insulin therapies",
      action: "Counsel patient on importance of monitoring. Consider CGM (continuous glucose monitor). Address barriers: cost, pain, forgetfulness, technique.",
      icon: "📅" });
  }
  // 8. No readings in >7 days
  if (latestGlucose) {
    const daysSince = Math.floor((Date.now() - latestGlucose.recordedAt.getTime()) / 86400000);
    if (daysSince >= 7) {
      alerts.push({ id: "gap", severity: "warning", category: "Monitoring Gap",
        title: `No Glucose Reading for ${daysSince} Days`,
        detail: "Monitoring gap identified. Regular glucose monitoring is essential for diabetes management.",
        evidence: "ADA 2024 — SMBG frequency individualized but essential for insulin users",
        action: "Contact patient to resume monitoring. Consider CGM if persistent gaps. Check if glucometer and strips are available.",
        icon: "📵" });
    }
  }
  // 9. Foot risk (no exam in 12 months)
  if (!footExams.length || (Date.now() - (footExams.at(-1)?.recordedAt?.getTime() ?? 0)) > 365 * 86400000) {
    alerts.push({ id: "foot_risk", severity: "warning", category: "Foot Care",
      title: "Annual Foot Exam Due",
      detail: "ADA recommends annual comprehensive foot exam for all patients with diabetes. No exam recorded in past 12 months.",
      evidence: "ADA 2024 — annual foot exam (visual inspection, monofilament, pulse exam) to prevent diabetic foot ulcers and amputations",
      action: "Schedule comprehensive foot exam. Include: monofilament testing, peripheral pulse exam, visual inspection for callus, fissures, ulcers.",
      icon: "🦶" });
  }
  // 10. DKA warning (glucose >13.9 + symptoms or T1DM with high glucose)
  if (latestGlucose && latestGlucose.value > 16.7) {
    alerts.push({ id: "dka_warning", severity: "urgent", category: "DKA Risk",
      title: `Potential DKA Risk — Glucose ${latestGlucose.value.toFixed(1)} mmol/L`,
      detail: "Glucose >16.7 mmol/L with ketones suggests possible DKA. Requires urgent evaluation, especially in T1DM.",
      evidence: "ADA 2024 — DKA diagnostic criteria: glucose >13.9, ketones, metabolic acidosis",
      action: "Check serum/urine ketones immediately. If positive: consider emergency referral. Assess for DKA symptoms (nausea, vomiting, abdominal pain, Kussmaul breathing).",
      icon: "🧪" });
  }
  // 11. Drug-specific: SGLT2i euglycemic DKA warning
  medications.filter(m => m.status === "active").forEach(med => {
    const name = (med.drug ?? med.medication ?? "").toLowerCase();
    if (name.includes("empagliflozin") || name.includes("dapagliflozin") || name.includes("canagliflozin") || name.includes("ertugliflozin")) {
      alerts.push({ id: `sglt2_dka_${med.id}`, severity: "info", category: "Patient Safety",
        title: `SGLT2i (${med.drug ?? med.medication}) — Euglycemic DKA Risk`,
        detail: "SGLT2 inhibitors can cause euglycemic DKA (glucose mildly elevated or normal with ketosis). Patient education on sick day rules is essential.",
        evidence: "FDA warning 2015; ADA 2024 — hold SGLT2i during illness, surgery, prolonged fasting",
        action: "Reinforce sick day rules: HOLD SGLT2i during illness, surgery, or if unable to eat/drink. Monitor ketones during illness. Do not restart until eating and hydrating normally.",
        icon: "💊" });
    }
  });

  return alerts;
}

// ─── Education Content Database ──────────────────────────────────────────────

export interface EducationTopic {
  id: string; title: string; content: string; keyPoints: string[];
  category: string; duration: string; sentAt?: string; acknowledged?: boolean;
}

export const EDUCATION_TOPICS: EducationTopic[] = [
  { id: "dm_basics", title: "Understanding Your Diabetes", content: "Diabetes is a condition where your body cannot properly use glucose (sugar) for energy. In type 2 diabetes, your cells become resistant to insulin. In type 1 diabetes, your pancreas produces little or no insulin. Without enough effective insulin, glucose builds up in your blood, causing damage to blood vessels, nerves, and organs over time.", keyPoints: ["Type 2 diabetes: insulin resistance + relative insulin deficiency","Type 1 diabetes: autoimmune destruction of pancreatic beta-cells","Target HbA1c <7.0% (53 mmol/mol) for most adults","Fasting glucose target 4-7 mmol/L","Postprandial glucose target <10 mmol/L at 2 hours","Well-controlled diabetes prevents complications"], category: "Foundation", duration: "5 min" },
  { id: "carb_counting", title: "Carbohydrate Counting — Matching Insulin to Food", content: "Carbohydrate counting is a meal-planning tool that helps match your insulin dose to the amount of carbs you eat. This gives you more flexibility in food choices while maintaining good blood glucose control. One 'carb choice' equals 15g of carbohydrate. Most meals need 3-4 carb choices.", keyPoints: ["Learn which foods contain carbs: grains, fruits, dairy, starchy vegetables, sweets","1 carb choice = 15g carbohydrate","Most adults need 45-60g carbs per meal (3-4 carb choices)","Fiber does NOT count toward carb total (subtract fiber from total carbs)","Insulin-to-carb ratio (ICR) = units per 15g carbs","Typical ICR: 1 unit per 10-15g carbs (T1DM)"], category: "Nutrition", duration: "8 min" },
  { id: "hypoglycemia_mgmt", title: "Recognizing and Treating Hypoglycemia (Low Blood Sugar)", content: "Hypoglycemia (glucose <3.9 mmol/L) is a medical emergency that requires immediate treatment. Early symptoms include sweating, shaking, anxiety, hunger, and palpitations. Later symptoms: confusion, drowsiness, slurred speech, and loss of consciousness. Always carry fast-acting glucose.", keyPoints: ["Mild hypo (3.0-3.9): 15g fast-acting carbs (4 tabs/150mL juice/1 tbsp honey)","Severe hypo (<3.0): Glucagon IM/SC or IV dextrose","Always recheck glucose after 15 minutes — 'Rule of 15'","If still low after 15 min: retreat with 15g carbs","Once normal: eat a meal or snack containing protein + complex carbs","DO NOT use chocolate, cake, or ice cream — fat slows absorption","Wear medical ID if you have recurrent severe hypos"], category: "Safety", duration: "6 min" },
  { id: "sick_day_rules", title: "Sick Day Management — Staying Safe During Illness", content: "Illness, infection, and stress raise blood glucose even if you cannot eat. NEITHER stop insulin nor drink sugared drinks. Checking ketones is essential. The 'Sick Day Rule' is: if you cannot eat or drink normally, call your doctor or go to hospital.", keyPoints: ["NEVER stop insulin — you may need MORE insulin during illness","Check glucose every 2-4 hours during illness","Check ketones if glucose >13.9 mmol/L or you feel unwell","Drink 200-250mL of sugar-free fluids every hour","If you cannot eat: consume 15g carbs every 1-2 hours","HOLD SGLT2i (empagliflozin, dapagliflozin) during illness","Seek emergency care if: vomiting >4h, moderate+ ketones, unable to keep fluids"], category: "Safety", duration: "6 min" },
  { id: "foot_care", title: "Daily Foot Care — Preventing Amputations", content: "Diabetes can cause neuropathy (loss of feeling) and peripheral vascular disease (poor blood flow) in your feet. A small blister or cut can become a serious infection leading to amputation. Daily foot inspection is ESSENTIAL.", keyPoints: ["Inspect feet EVERY DAY — use a mirror to check soles","Wash feet daily with lukewarm water, dry thoroughly (especially between toes)","Moisturize but NOT between toes (prevents fungal infection)","NEVER walk barefoot — always wear shoes or slippers","Cut nails straight across, file sharp edges","Choose shoes with wide toe boxes, check inside before wearing","Report any: blister, cut, redness, swelling, or discoloration to your doctor IMMEDIATELY"], category: "Complications", duration: "5 min" },
  { id: "medication_adherence", title: "Why You Must Take Your Diabetes Medications Every Day", content: "Diabetes medications only work when taken consistently. Missed doses → uncontrolled glucose → complications. Studies show medication adherence is the #1 modifiable factor in diabetes outcomes.", keyPoints: ["Take medications at the SAME TIME every day","Set alarms or link to daily habits (e.g., brushing teeth, meals)","NEVER stop medications without telling your doctor","Refill prescriptions before they run out","Store insulin in refrigerator (2-8C) — never freeze or leave in hot car","Rotate injection sites to prevent lipodystrophy","Side effects? Tell your doctor — we can find a better option"], category: "Medications", duration: "5 min" },
  { id: "glucose_monitoring", title: "How to Monitor Your Blood Glucose Correctly", content: "Self-monitoring of blood glucose (SMBG) is the cornerstone of diabetes self-management. It helps you understand how food, activity, stress, and medications affect your glucose — and guides insulin dosing and medication adjustments.", keyPoints: ["Wash hands with warm water and soap — alcohol alone is not enough","Use the sides of your fingers (less painful)","Rotate finger sites to avoid calluses","Target: Fasting 4-7 mmol/L, Postprandial <10 mmol/L","How often: T1DM ≥4x daily; T2DM on insulin ≥2x daily; T2DM not on insulin: as needed","CGM (Continuous Glucose Monitor) provides real-time data and trends","Record ALL readings with notes (pre/post meal, activity, stress)"], category: "Monitoring", duration: "6 min" },
  { id: "complications_prevention", title: "Preventing Diabetes Complications", content: "Diabetes complications affect eyes (retinopathy), kidneys (nephropathy), nerves (neuropathy), heart (CVD), and feet (ulceration). The good news: excellent glucose control dramatically reduces your risk.", keyPoints: ["DCCT (T1DM): intensive glucose control reduced retinopathy 76%, nephropathy 54%, neuropathy 60%","UKPDS (T2DM): each 1% HbA1c reduction → 35% ↓ microvascular complications","Annual screening: dilated eye exam, urine ACR, foot exam","BP target <130/80 mmHg for diabetics (ACCORD, ADVANCE)","Statin therapy recommended for most diabetics over 40","Aspirin for secondary prevention or high CV risk"], category: "Complications", duration: "6 min" },
  { id: "exercise_guidelines", title: "Exercise — Your Secret Weapon for Diabetes Control", content: "Exercise improves insulin sensitivity for 24-48 hours after each session. It lowers glucose during and after activity, reduces HbA1c by 0.5-0.7%, improves CV health, and aids weight loss.", keyPoints: ["Aerobic: 150 min/week moderate intensity (brisk walking, swimming, cycling)","Resistance: 2-3 sessions/week (builds muscle = glucose sink)","Check glucose BEFORE exercise (if <5.6 carry snack, if >13.9+ketones avoid)","Stay hydrated — dehydration raises glucose","Post-exercise: delayed hypoglycemia can occur 4-12h later","Always carry fast-acting glucose during exercise","Exercise improves insulin sensitivity for 24-48 hours"], category: "Lifestyle", duration: "5 min" },
  { id: "healthy_eating", title: "Healthy Eating for Diabetes Control", content: "You do NOT need special 'diabetic foods.' A healthy diabetes diet is the same healthy diet everyone should follow: whole foods, plenty of vegetables, lean proteins, healthy fats, and controlled portions of carbohydrates.", keyPoints: ["Plate method: 1/2 non-starchy vegetables, 1/4 lean protein, 1/4 complex carbs","Choose LOW glycemic index carbs: whole grains, legumes, non-starchy vegetables","Avoid sugar-sweetened beverages (soda, juice, sweet tea) — they spike glucose","Eat protein at each meal (slows glucose absorption)","Healthy fats: olive oil, nuts, avocado, fatty fish (omega-3s)","Limit processed foods and added sugars","Alcohol: 1 drink/day max (women), 2/day max (men) — never on empty stomach"], category: "Nutrition", duration: "7 min" },
  { id: "dka_prevention", title: "Diabetic Ketoacidosis (DKA) — Recognition and Prevention", content: "DKA is a life-threatening complication caused by severe insulin deficiency, resulting in high ketones and metabolic acidosis. In T1DM, DKA is often the presenting feature. In T2DM, it can occur with severe illness or SGLT2i use.", keyPoints: ["Symptoms: thirst, frequent urination, nausea/vomiting, abdominal pain, Kussmaul breathing (deep, rapid), fruity breath, confusion","Triggers: missed insulin doses, infection, illness, MI, stroke, trauma","Check ketones if glucose >13.9 mmol/L for >4 hours","Ketone targets: blood <0.6 mmol/L normal; 0.6-1.5 elevated; >1.5 high risk","Treatment: IV fluids, IV insulin, electrolyte replacement — hospital required","PREVENT: never miss insulin dose, follow sick day rules","T1DM: DKA at diagnosis in 30-40% of cases"], category: "Safety", duration: "6 min" },
  { id: "insulin_therapy", title: "Starting and Managing Insulin Therapy", content: "Insulin therapy is often necessary for optimal diabetes control. Starting insulin is NOT a failure — it is the most effective way to lower glucose and prevent complications. Many patients with T2DM will eventually need insulin as beta-cell function declines.", keyPoints: ["Types: Rapid-acting (Aspart, Lispro) → meals; Long-acting (Glargine, Degludec) → basal","Common starting: basal insulin (Glargine 10U or 0.1-0.2 U/kg at bedtime)","Titrate: increase by 2U every 3 days until fasting glucose 4-7 mmol/L","Basal-bolus: basal once daily + bolus with each meal (T1DM standard)","Insulin pens more convenient than vials/syringes for most","Store unopened insulin in refrigerator (2-8C); opened at room temp <30 days","Hypoglycemia risk is highest in first 3 months of insulin therapy"], category: "Medications", duration: "8 min" },
  { id: "cgm_technology", title: "Continuous Glucose Monitoring (CGM) — Making Sense of Your Data", content: "CGM measures interstitial glucose every 1-5 minutes, providing real-time glucose data, trends, and alerts. CGM improves HbA1c and reduces hypoglycemia compared to fingerstick monitoring alone.", keyPoints: ["CGM types: Dexcom G6/G7 (10-14 days), Freestyle Libre 2/3 (14 days), Medtronic Guardian","CGM metrics: Time In Range (TIR) target >70% (3.9-10 mmol/L)","Time Below Range (TBR) target <4% (<3.9 mmol/L)","Time Above Range (TAR) target <25% (>10 mmol/L)","Glucose Management Indicator (GMI) approximates HbA1c from CGM data","MARD (Mean Absolute Relative Difference) — accuracy metric (<10% is good)","Calibration: some CGM require fingerstick calibration 1-2x/day","Ambulatory Glucose Profile (AGP) is the standard CGM report"], category: "Technology", duration: "7 min" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientSummary {
  id: string; name: string; age?: number; sex?: string; email?: string;
  phone?: string; universalId?: string; diagnosis?: string; riskLevel?: string;
  lastVisit?: string; nextReview?: string;
  latestGlucose?: number; latestHbA1c?: number; latestAt?: Date;
  totalReadings: number;
}
interface RawReading {
  id: string; patientId: string; toolType: string; recordedAt: Timestamp;
  doctorNote?: string; doctorReviewed?: boolean;
  data?: { value?: number; unit?: string; mealTag?: string; activity?: string; notes?: string };
  value?: number; unit?: string; mealTag?: string; activity?: string;
  triage?: { label?: string; urgency?: string; message?: string };
}
export interface GlucoseReading {
  id: string; value: number; unit: string;
  recordedAt: Date; source: "patient"|"clinic"|"device"|"cgm";
  mealTag?: "fasting"|"pre-meal"|"post-meal"|"bedtime"|"nocturnal";
  activity?: string; notes?: string;
  triageLabel?: string; triageUrgency?: string; triageMessage?: string;
}
export interface HbA1cReading {
  id: string; value: number; recordedAt: Date;
  source: "lab"|"point-of-care"|"patient";
  estimatedAverageGlucose?: number; notes?: string;
}
export interface FootExamResult {
  id: string; recordedAt: Date; performedBy: string;
  monofilament: "normal"|"reduced"|"absent"; vibrationSense: "normal"|"reduced"|"absent";
  pulses: "palpable"|"reduced"|"absent"; deformity: string[];
  callus: string[]; fissures: string[]; ulcers: string[];
  riskCategory: "low"|"moderate"|"high"|"active"; notes?: string;
  plan?: string; nextReviewDate?: string;
}
export interface Medication {
  id: string;
  drug: string; medication?: string;
  dose: string; dosage?: string;
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
  date: string; isoDate: string; value: number;
  rawCount: number; source: "patient"|"clinic"|"device"|"cgm"; category: string;
}

// ─── Static Lists ─────────────────────────────────────────────────────────────

export const COMPLICATIONS: Complication[] = [
  { name: "Diabetic Retinopathy", date: "" }, { name: "Diabetic Nephropathy", date: "" },
  { name: "Diabetic Neuropathy", date: "" }, { name: "Peripheral Vascular Disease", date: "" },
  { name: "Coronary Artery Disease", date: "" }, { name: "Cerebrovascular Disease", date: "" },
  { name: "Diabetic Foot Ulcer", date: "" }, { name: "Gastroparesis", date: "" },
  { name: "Erectile Dysfunction", date: "" }, { name: "NAFLD/NASH", date: "" },
  { name: "Hearing Impairment", date: "" }, { name: "Periodontal Disease", date: "" },
];

export const LIFESTYLE_ITEMS: LifestyleItem[] = [
  { name: "Physical Activity", grade: "Moderate" }, { name: "Diet Quality", grade: "Moderate" },
  { name: "Smoking Status", grade: "Poor" }, { name: "Alcohol Intake", grade: "Good" },
  { name: "Sleep Quality", grade: "Moderate" }, { name: "Stress Management", grade: "Moderate" },
  { name: "Foot Care Routine", grade: "Moderate" }, { name: "Glucose Monitoring", grade: "Good" },
  { name: "Medication Adherence", grade: "Good" }, { name: "Appointment Adherence", grade: "Good" },
];

export const SPECIALTIES = ["Endocrinology","Cardiology","Nephrology","Ophthalmology","Podiatry","Dietitian","Diabetes Educator","Psychology","Neurology","Vascular Surgery","Wound Care","Pain Management"];
export const LAB_PANEL = [
  { name: "HbA1c", unit: "%", ref: "<7.0" }, { name: "Fasting Glucose", unit: "mmol/L", ref: "4.0-7.0" },
  { name: "Random Glucose", unit: "mmol/L", ref: "<11.1" }, { name: "Urine ACR", unit: "mg/mmol", ref: "<3.0" },
  { name: "Serum Creatinine", unit: "umol/L", ref: "60-110" }, { name: "eGFR", unit: "mL/min/1.73m2", ref: ">60" },
  { name: "Sodium", unit: "mmol/L", ref: "135-145" }, { name: "Potassium", unit: "mmol/L", ref: "3.5-5.0" },
  { name: "Total Cholesterol", unit: "mmol/L", ref: "<5.2" }, { name: "LDL Cholesterol", unit: "mmol/L", ref: "<2.6" },
  { name: "HDL Cholesterol", unit: "mmol/L", ref: ">1.3" }, { name: "Triglycerides", unit: "mmol/L", ref: "<1.7" },
  { name: "ALT", unit: "U/L", ref: "10-40" }, { name: "AST", unit: "U/L", ref: "10-40" },
  { name: "TSH", unit: "mIU/L", ref: "0.5-4.5" }, { name: "Vitamin B12", unit: "pmol/L", ref: "150-700" },
  { name: "Serum Ketones", unit: "mmol/L", ref: "<0.6" }, { name: "C-Peptide", unit: "mmol/L", ref: "0.37-1.47" },
  { name: "GAD Antibodies", unit: "U/mL", ref: "<5" }, { name: "Insulin Antibodies", unit: "U/mL", ref: "<5" },
];
export const IMAGING_PANEL = [
  { study: "Fundus Photography (Retinal Screening)", modality: "Ophthalmology", bodyPart: "Eyes" },
  { study: "Carotid Doppler", modality: "Ultrasound", bodyPart: "Carotid Arteries" },
  { study: "Ankle-Brachial Index (ABI)", modality: "Vascular", bodyPart: "Lower Limbs" },
  { study: "Echocardiogram", modality: "Ultrasound", bodyPart: "Heart" },
  { study: "Foot X-Ray", modality: "X-Ray", bodyPart: "Foot" },
  { study: "DEXA Scan (bone density)", modality: "DEXA", bodyPart: "Hip/Spine" },
];
export const DRUGS = Object.keys(PHARMA_DB);
export const FREQS = ["OD","BD","TDS","QID","Weekly","Biweekly","Monthly","PRN","With meals","30min before meals","Bedtime"];
export const UNITS = ["mg","mcg","g","units","mL","tablet","capsule","injection","patch","drop"];
export const ROUTES_LIST = ["Oral","SC","IV","IM","Topical","Inhaled","SL","PR","Ophthalmic","Intra-articular"];

// ─── Design Tokens ────────────────────────────────────────────────────────────

export const T = {
  bg: "#f0fdf4", text: "#14532d", primary: "#16a34a", secondary: "#22c55e",
  accent: "#15803d", muted: "#86efac", border: "#bbf7d0", card: "#ffffff",
  success: "#16a34a", warning: "#d97706", danger: "#dc2626", info: "#0891b2",
  textMuted: "#6b7280", textDark: "#052e16",
} as const;

export const CHANGE_COLORS: Record<string, string> = {
  started: "#16a34a", dose_increase: "#d97706", dose_decrease: "#0891b2",
  stopped: "#dc2626", paused: "#f59e0b", restarted: "#7c3aed",
};

// ─── Global CSS ───────────────────────────────────────────────────────────────

export const GLOBAL_CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${T.bg};color:${T.text};line-height:1.5}
  .dm-root{max-width:1440px;margin:0 auto;padding:8px}
  .dm-root *{box-sizing:border-box}
  .dm-root button{cursor:pointer;font:inherit}
  .dm-root input,.dm-root select,.dm-root textarea{font:inherit}
  .dm-root table{border-collapse:collapse;width:100%}
  .dm-root a{color:${T.primary};text-decoration:none}
  .dm-root a:hover{text-decoration:underline}

  @media(max-width:640px){
    .dm-root{padding:4px}
    .dm-panels{grid-template-columns:1fr!important}
    .dm-picker-panel,.dm-patient-panel{border-radius:0}
    .dm-header{flex-direction:column;gap:8px;padding:8px}
    .dm-search-box{width:100%}
    .dm-tabs{overflow-x:auto;gap:0}
    .dm-tab{font-size:12px;padding:6px 10px;white-space:nowrap}
    .dm-grid{grid-template-columns:1fr!important}
    .dm-stats{grid-template-columns:repeat(2,1fr)!important}
    .dm-table-wrap{overflow-x:auto}
    .dm-modal-content{width:95%;margin:5% auto;padding:12px}
    .dm-form-grid{grid-template-columns:1fr!important}
    .dm-pharma-card{grid-template-columns:1fr!important}
  }
  @media(min-width:641px)and(max-width:1023px){
    .dm-panels{grid-template-columns:1fr}
    .dm-grid{grid-template-columns:1fr 1fr}
    .dm-stats{grid-template-columns:repeat(2,1fr)}
    .dm-form-grid{grid-template-columns:1fr 1fr}
    .dm-pharma-card{grid-template-columns:1fr 1fr}
  }
  @media(min-width:1024px){
    .dm-panels{grid-template-columns:380px 1fr}
    .dm-grid{grid-template-columns:1fr 1fr}
    .dm-stats{grid-template-columns:repeat(4,1fr)}
    .dm-form-grid{grid-template-columns:1fr 1fr}
    .dm-pharma-card{grid-template-columns:1fr 1fr}
  }

  .dm-panels{display:grid;gap:8px;min-height:calc(100vh - 20px)}
  .dm-picker-panel{background:${T.card};border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden;display:flex;flex-direction:column;max-height:calc(100vh - 20px)}
  .dm-patient-panel{background:${T.card};border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow-y:auto;max-height:calc(100vh - 20px)}
  .dm-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid ${T.border};background:${T.card}}
  .dm-header h1{font-size:20px;font-weight:700;color:${T.textDark};margin:0}
  .dm-header-sub{font-size:11px;color:${T.textMuted}}
  .dm-search-box{position:relative;flex:1;max-width:320px}
  .dm-search-box input{width:100%;padding:8px 12px 8px 32px;border:1px solid ${T.border};border-radius:8px;font-size:13px;outline:none;transition:border-color 0.2s}
  .dm-search-box input:focus{border-color:${T.primary};box-shadow:0 0 0 2px ${T.muted}}
  .dm-search-box svg{position:absolute;left:8px;top:50%;transform:translateY(-50%);color:${T.textMuted};width:16px;height:16px}
  .dm-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:8px;font-size:13px;font-weight:600;transition:all 0.15s;background:${T.primary};color:#fff}
  .dm-btn:hover{opacity:.9;transform:translateY(-1px)}
  .dm-btn:active{transform:translateY(0)}
  .dm-btn-outline{background:transparent;border:1.5px solid ${T.primary};color:${T.primary}}
  .dm-btn-outline:hover{background:${T.muted};opacity:1}
  .dm-btn-sm{padding:4px 10px;font-size:12px}
  .dm-btn-xs{padding:2px 6px;font-size:11px;border-radius:4px}
  .dm-btn-danger{background:${T.danger};color:#fff}
  .dm-btn-warning{background:${T.warning};color:#fff}
  .dm-btn-success{background:${T.success};color:#fff}
  .dm-tabs{display:flex;gap:4px;padding:8px 12px;border-bottom:1px solid ${T.border};overflow-x:auto;flex-wrap:nowrap}
  .dm-tab{padding:8px 14px;border:none;background:transparent;color:${T.textMuted};font-size:13px;font-weight:500;border-radius:8px;transition:all .15s;white-space:nowrap}
  .dm-tab:hover{background:${T.muted};color:${T.textDark}}
  .dm-tab.active{background:${T.primary};color:#fff}
  .dm-section{padding:12px 16px}
  .dm-section h2{font-size:15px;font-weight:700;color:${T.textDark};margin-bottom:8px;display:flex;align-items:center;gap:6px}
  .dm-section h2 svg{width:18px;height:18px}
  .dm-grid{display:grid;gap:12px}
  .dm-stats{display:grid;gap:8px}
  .dm-stat-card{background:${T.card};border:1px solid ${T.border};border-radius:10px;padding:12px;text-align:center}
  .dm-stat-card .label{font-size:11px;color:${T.textMuted};text-transform:uppercase;font-weight:600;letter-spacing:.3px}
  .dm-stat-card .value{font-size:24px;font-weight:800;color:${T.textDark};margin:4px 0}
  .dm-stat-card .sub{font-size:11px;color:${T.textMuted}}
  .dm-card{background:${T.card};border:1px solid ${T.border};border-radius:10px;padding:12px;margin-bottom:8px}
  .dm-pharma-card{display:grid;gap:12px;padding:12px;background:${T.card};border:1px solid ${T.border};border-radius:10px;margin-bottom:8px}
  .dm-pharma-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .dm-pharma-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
  .dm-pharma-class{font-size:11px;color:${T.textMuted};font-weight:600}
  .dm-pharma-prop{font-size:12px;margin:2px 0;color:${T.text}}
  .dm-pharma-prop strong{color:${T.textDark};font-weight:600}
  .dm-pharma-prop a{color:${T.primary};text-decoration:none}
  .dm-form-grid{display:grid;gap:8px}
  .dm-field{display:flex;flex-direction:column;gap:2px}
  .dm-field label{font-size:11px;font-weight:600;color:${T.textMuted};text-transform:uppercase}
  .dm-field input,.dm-field select,.dm-field textarea{padding:8px;border:1px solid ${T.border};border-radius:6px;font-size:13px;outline:none}
  .dm-field input:focus,.dm-field select:focus,.dm-field textarea:focus{border-color:${T.primary}}
  .dm-field textarea{resize:vertical;min-height:60px}
  .dm-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600}
  .dm-badge-green{background:#dcfce7;color:#166534}
  .dm-badge-yellow{background:#fef3c7;color:#92400e}
  .dm-badge-red{background:#fce4ec;color:#b71c1c}
  .dm-badge-blue{background:#e0f2fe;color:#075985}
  .dm-badge-purple{background:#f3e8ff;color:#6b21a8}
  .dm-table{width:100%;border-collapse:collapse}
  .dm-table th{text-align:left;font-size:11px;font-weight:600;color:${T.textMuted};padding:8px 6px;border-bottom:2px solid ${T.border};text-transform:uppercase}
  .dm-table td{padding:8px 6px;border-bottom:1px solid ${T.border};font-size:13px}
  .dm-table tr:hover{background:${T.bg}}
  .dm-modal{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000}
  .dm-modal-content{background:${T.card};border-radius:16px;padding:20px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.15)}
  .dm-modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .dm-modal-header h2{font-size:18px;font-weight:700;color:${T.textDark}}
  .dm-modal-close{background:none;border:none;font-size:24px;color:${T.textMuted};cursor:pointer;padding:4px;line-height:1}
  .dm-modal-close:hover{color:${T.textDark}}
  .dm-empty{text-align:center;padding:24px;color:${T.textMuted}}
  .dm-empty svg{width:48px;height:48px;margin-bottom:8px;opacity:.4}
  .dm-loader{display:flex;align-items:center;justify-content:center;padding:48px;color:${T.textMuted}}
  .dm-spinner{width:24px;height:24px;border:3px solid ${T.border};border-top-color:${T.primary};border-radius:50%;animation:spin .6s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .dm-toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:10px;color:#fff;font-size:13px;font-weight:600;z-index:2000;animation:slideUp .3s ease;box-shadow:0 4px 12px rgba(0,0,0,.15)}
  .dm-toast-success{background:${T.success}}
  .dm-toast-error{background:${T.danger}}
  .dm-toast-info{background:${T.info}}
  @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
  .dm-divider{height:1px;background:${T.border};margin:8px 0}
  .dm-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .dm-skeleton{background:linear-gradient(90deg,${T.border} 25%,${T.muted} 50%,${T.border} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;height:16px;margin:4px 0}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .dm-timeline{position:relative;padding-left:20px}
  .dm-timeline::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:2px;background:${T.border}}
  .dm-timeline-item{position:relative;padding:8px 0 8px 16px}
  .dm-timeline-item::before{content:'';position:absolute;left:-14px;top:12px;width:10px;height:10px;border-radius:50%;background:${T.primary};border:2px solid ${T.card}}
  .dm-timeline-date{font-size:11px;color:${T.textMuted}}
  .dm-timeline-icon{font-size:14px;margin-right:4px}
  .dm-pulse{animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .dm-print-only{display:none}
  @media print{body{background:#fff!important}.dm-no-print{display:none!important}.dm-print-only{display:block!important}.dm-root{max-width:100%!important;padding:0!important}.dm-panels{display:block!important}.dm-patient-panel{max-height:none!important;overflow:visible!important}}
  .dm-glucose-normal{color:#16a34a;font-weight:600}
  .dm-glucose-elevated{color:#d97706;font-weight:600}
  .dm-glucose-high{color:#dc2626;font-weight:600}
  .dm-glucose-low{color:#7c3aed;font-weight:600}
  .dm-hba1c-good{color:#16a34a;font-weight:600}
  .dm-hba1c-fair{color:#d97706;font-weight:600}
  .dm-hba1c-poor{color:#dc2626;font-weight:600}
`;

// ─── Primitive Components ────────────────────────────────────────────────────

const Dot = ({ color, size = 10 }: { color: string; size?: number }) =>
  <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />;

const SectHeader = ({ icon, title, extra }: { icon?: string; title: string; extra?: React.ReactNode }) =>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
    <h2>{icon && <span style={{ marginRight: 6 }}>{icon}</span>}{title}</h2>
    {extra}
  </div>;

const Badge = ({ children, color = "#16a34a", bg = "#dcfce7" }: { children: React.ReactNode; color?: string; bg?: string }) =>
  <span className="dm-badge" style={{ background: bg, color }}>{children}</span>;

const StatCard = ({ label, value, sub, color }: { label: string; value: React.ReactNode; sub?: string; color?: string }) =>
  <div className="dm-stat-card">
    <div className="label">{label}</div>
    <div className="value" style={color ? { color } : undefined}>{value}</div>
    {sub && <div className="sub">{sub}</div>}
  </div>;

const Card = ({ children, style, ...rest }: { children: React.ReactNode; style?: React.CSSProperties; [key: string]: any }) =>
  <div className="dm-card" style={style} {...rest}>{children}</div>;

const Skeleton = ({ width = "100%", height = 16 }: { width?: string|number; height?: number }) =>
  <div className="dm-skeleton" style={{ width: typeof width === "number" ? width : width, height }} />;

const Btn = ({ children, onClick, variant, size, disabled, style, title, type }: {
  children: React.ReactNode; onClick?: (...args: any[]) => void; variant?: "primary"|"outline"|"danger"|"warning"|"success";
  size?: "sm"|"xs"; disabled?: boolean; style?: React.CSSProperties; title?: string; type?: "button"|"submit";
}) => {
  let cls = "dm-btn";
  if (variant === "outline") cls += " dm-btn-outline";
  else if (variant === "danger") cls += " dm-btn-danger";
  else if (variant === "warning") cls += " dm-btn-warning";
  else if (variant === "success") cls += " dm-btn-success";
  if (size === "sm") cls += " dm-btn-sm";
  else if (size === "xs") cls += " dm-btn-xs";
  return <button className={cls} onClick={onClick} disabled={disabled} style={style} title={title} type={type || "button"}>{children}</button>;
};

const InpField = ({ label, value, onChange, placeholder, type = "text", required, style }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; required?: boolean; style?: React.CSSProperties;
}) =>
  <div className="dm-field" style={style}>
    <label>{label}{required && <span style={{ color: T.danger }}>*</span>}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
  </div>;

const SelField = ({ label, value, onChange, options, required, style }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean; style?: React.CSSProperties;
}) =>
  <div className="dm-field" style={style}>
    <label>{label}{required && <span style={{ color: T.danger }}>*</span>}</label>
    <select value={value} onChange={e => onChange(e.target.value)} required={required}>
      <option value="">-- Select --</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>;

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) =>
  <div className="dm-field">
    <label>{label}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
  </div>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function glucoseColor(value: number): string {
  if (value < 3.9) return "#7c3aed";
  if (value < 7.0) return "#16a34a";
  if (value < 10.0) return "#d97706";
  if (value < 13.9) return "#dc2626";
  return "#991b1b";
}

function hba1cColor(value: number): string {
  if (value < 6.0) return "#16a34a";
  if (value < 7.0) return "#d97706";
  if (value < 9.0) return "#dc2626";
  return "#991b1b";
}

function averageByDay(readings: GlucoseReading[]): ChartPoint[] {
  const map = new Map<string, { sum: number; count: number; sources: Set<string> }>();
  readings.forEach(r => {
    const d = r.recordedAt.toLocaleDateString("en-CA");
    if (!map.has(d)) map.set(d, { sum: 0, count: 0, sources: new Set() });
    const e = map.get(d)!;
    e.sum += r.value; e.count += 1; e.sources.add(r.source);
  });
  return Array.from(map.entries()).map(([date, e]) => ({
    date, isoDate: date, value: Math.round(e.sum / e.count * 10) / 10,
    rawCount: e.count, source: e.sources.has("cgm") ? "cgm" : e.sources.has("device") ? "device" : e.sources.has("clinic") ? "clinic" : "patient",
    category: e.sources.size > 1 ? "mixed" : Array.from(e.sources)[0],
  })).sort((a, b) => a.date.localeCompare(b.date)) as ChartPoint[];
}

function toMedTimeline(meds: Medication[]): MedForTimeline[] {
  return meds.map(m => ({
    id: m.id, drug: m.drug ?? m.medication ?? "Unknown", dose: `${m.dose}${m.unit}`,
    startDate: m.startDate ? new Date(m.startDate) : new Date(),
    endDate: m.endDate ? new Date(m.endDate) : undefined,
    changeHistory: m.changeHistory,
  })).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
}

function exportNoteAsPDF(note: ClinicalNote, patientName: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <html><head><title>Clinical Note - ${patientName}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto}
      h1{font-size:18px;border-bottom:2px solid #333;padding-bottom:8px}
      h2{font-size:14px;margin-top:16px;color:#555}
      p{font-size:12px;line-height:1.5;margin:4px 0}
      .header{text-align:center;margin-bottom:20px}
      .header h1{margin:0;border:none}
      .header p{color:#666;font-size:11px}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      td,th{padding:6px 8px;border:1px solid #ddd;font-size:12px;text-align:left}
      th{background:#f5f5f5}
    </style></head><body>
    <div class="header">
      <h1>Clinical Consultation Note</h1>
      <p>Patient: ${patientName} | Date: ${note.date}</p>
      <p>Visit Type: ${note.visitType || "General"} | Doctor: ${note.doctorName || "—"}</p>
    </div>
    ${note.cc ? `<h2>Chief Complaint</h2><p>${note.cc}</p>` : ""}
    ${note.hpi ? `<h2>History of Present Illness</h2><p>${note.hpi}</p>` : ""}
    ${note.exam ? `<h2>Examination Findings</h2><p>${note.exam}</p>` : ""}
    ${note.investigations ? `<h2>Investigations</h2><p>${note.investigations}</p>` : ""}
    ${note.assessment ? `<h2>Assessment</h2><p>${note.assessment}</p>` : ""}
    ${note.plan ? `<h2>Plan</h2><p>${note.plan}</p>` : ""}
    ${(note.diagnoses?.length) ? `<h2>Diagnoses</h2><p>${note.diagnoses.join(", ")}</p>` : ""}
    ${(note.followUps?.length) ? `<h2>Follow-Up</h2><p>${note.followUps.join("; ")}</p>` : ""}
    ${note.vitals ? `<h2>Vitals</h2><table>${Object.entries(note.vitals).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>` : ""}
    <p style="margin-top:24px;font-size:10px;color:#999;text-align:center">Generated by Amexan Clinical Dashboard</p>
    </body></html>
  `);
  printWindow.document.close();
  setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
}

// ─── GlucoseTab ───────────────────────────────────────────────────────────────

const GlucoseTab = ({ readings, loading }: { readings: GlucoseReading[]; loading: boolean }) => {
  const [sortAsc, setSortAsc] = useState(false);
  const sorted = useMemo(() => [...readings].sort((a, b) =>
    sortAsc ? a.recordedAt.getTime() - b.recordedAt.getTime() : b.recordedAt.getTime() - a.recordedAt.getTime()
  ), [readings, sortAsc]);
  const stats = useMemo(() => {
    if (!readings.length) return { avg: 0, min: 0, max: 0, count: 0, inRange: 0, hypo: 0 };
    const vals = readings.map(r => r.value);
    const avg = vals.reduce((a, v) => a + v, 0) / vals.length;
    const inRange = vals.filter(v => v >= 3.9 && v <= 10).length;
    const hypo = vals.filter(v => v < 3.9).length;
    return { avg: Math.round(avg * 10) / 10, min: Math.min(...vals), max: Math.max(...vals), count: vals.length, inRange: Math.round(inRange / vals.length * 100), hypo };
  }, [readings]);
  if (loading) return <div className="dm-loader"><div className="dm-spinner" />&nbsp;Loading glucose data...</div>;
  return <div className="dm-section">
    <SectHeader icon="🩸" title="Glucose Monitoring" extra={
      <Btn size="sm" variant="outline" onClick={() => setSortAsc(!sortAsc)}>{sortAsc ? "Newest First" : "Oldest First"}</Btn>
    } />
    <div className="dm-stats">
      <StatCard label="Average" value={`${stats.avg}`} sub={`mmol/L (${stats.count} readings)`} />
      <StatCard label="Range" value={`${stats.min}–${stats.max}`} sub="mmol/L" />
      <StatCard label="In Range" value={`${stats.inRange}%`} sub="3.9–10.0 mmol/L" color={stats.inRange >= 70 ? T.success : stats.inRange >= 50 ? T.warning : T.danger} />
      <StatCard label="Hypo Episodes" value={`${stats.hypo}`} sub="<3.9 mmol/L" color={stats.hypo > 0 ? T.danger : T.success} />
    </div>
    <div className="dm-table-wrap" style={{ marginTop: 12 }}>
      <table className="dm-table">
        <thead><tr>
          <th onClick={() => setSortAsc(!sortAsc)} style={{ cursor: "pointer" }}>Date/Time{sortAsc ? " ↑" : " ↓"}</th>
          <th>Glucose</th><th>Meal Tag</th><th>Source</th><th>Notes</th>
        </tr></thead>
        <tbody>
          {sorted.slice(0, 100).map(r =>
            <tr key={r.id}>
              <td>{r.recordedAt.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
              <td style={{ color: glucoseColor(r.value), fontWeight: 600 }}>{r.value.toFixed(1)} mmol/L</td>
              <td><Badge color={r.mealTag === "fasting" ? T.info : r.mealTag === "post-meal" ? T.warning : r.mealTag === "bedtime" ? T.primary : T.textMuted} bg={r.mealTag === "fasting" ? "#e0f2fe" : r.mealTag === "post-meal" ? "#fef3c7" : r.mealTag === "bedtime" ? "#dcfce7" : "#f3f4f6"}>{r.mealTag || "—"}</Badge></td>
              <td><Badge>{r.source}</Badge></td>
              <td style={{ fontSize: 12, color: T.textMuted }}>{r.notes || "—"}</td>
            </tr>
          )}
          {!sorted.length && <tr><td colSpan={5} className="dm-empty">No glucose readings recorded</td></tr>}
        </tbody>
      </table>
    </div>
  </div>;
};

// ─── HbA1cTab ─────────────────────────────────────────────────────────────────

const HbA1cTab = ({ hba1cs, loading }: { hba1cs: HbA1cReading[]; loading: boolean }) => {
  const sorted = useMemo(() => [...hba1cs].sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()), [hba1cs]);
  const latest = sorted[0];
  const trend = sorted.length >= 2 ? (sorted[0].value - sorted[1].value).toFixed(1) : null;
  if (loading) return <div className="dm-loader"><div className="dm-spinner" />&nbsp;Loading HbA1c data...</div>;
  return <div className="dm-section">
    <SectHeader icon="🧪" title="HbA1c (Glycated Haemoglobin)" />
    {latest && <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div style={{ fontSize: 48, fontWeight: 800, color: hba1cColor(latest.value) }}>{latest.value.toFixed(1)}%</div>
      <div style={{ fontSize: 13, color: T.textMuted }}>{latest.recordedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
      {trend !== null && <div style={{ fontSize: 14, marginTop: 4, color: +trend > 0 ? T.danger : +trend < 0 ? T.success : T.textMuted }}>
        {+trend > 0 ? `↑ +${trend}%` : +trend < 0 ? `↓ ${trend}%` : "— No change"} from previous
      </div>}
      <div style={{ marginTop: 8 }}>
        <Badge color={latest.value < 7 ? T.success : latest.value < 8 ? T.warning : T.danger} bg={latest.value < 7 ? "#dcfce7" : latest.value < 8 ? "#fef3c7" : "#fce4ec"}>
          {latest.value < 7 ? "At Target (<7.0%)" : latest.value < 8 ? "Above Target (7.0–8.0%)" : "Significantly Elevated (>8.0%)"}
        </Badge>
      </div>
      {latest.estimatedAverageGlucose && <p style={{ fontSize: 13, color: T.textMuted, marginTop: 8 }}>Estimated Average Glucose (eAG): {latest.estimatedAverageGlucose.toFixed(1)} mmol/L</p>}
    </div>}
    {!latest && <div className="dm-empty">No HbA1c results recorded</div>}
    {sorted.length > 1 && <div style={{ marginTop: 12 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>History</h2>
      <table className="dm-table">
        <thead><tr><th>Date</th><th>HbA1c</th><th>Category</th><th>Source</th><th>Notes</th></tr></thead>
        <tbody>
          {sorted.map(r =>
            <tr key={r.id}>
              <td>{r.recordedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
              <td style={{ color: hba1cColor(r.value), fontWeight: 600 }}>{r.value.toFixed(1)}%</td>
              <td><Badge color={r.value < 7 ? T.success : r.value < 8 ? T.warning : T.danger} bg={r.value < 7 ? "#dcfce7" : r.value < 8 ? "#fef3c7" : "#fce4ec"}>{r.value < 7 ? "Good" : r.value < 8 ? "Fair" : "Poor"}</Badge></td>
              <td><Badge>{r.source}</Badge></td>
              <td style={{ fontSize: 12, color: T.textMuted }}>{r.notes || "—"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>}
  </div>;
};

// ─── PharmaCard ───────────────────────────────────────────────────────────────

const PharmaCard = ({ drug }: { drug: string }) => {
  const [expanded, setExpanded] = useState(false);
  const info = getDrugInfo(drug);
  if (!info) return <div className="dm-empty">No info available for {drug}</div>;
  return <div className="dm-pharma-card">
    <div className="dm-pharma-header">
      <Dot color={info.color} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{drug}</div>
        <div className="dm-pharma-class">{info.drugClass} · {info.commonDoses.join("/")} {info.unit} · {info.frequencies.join("/")} · {info.routes.join("/")}</div>
      </div>
      <Btn size="xs" variant="outline" onClick={() => setExpanded(!expanded)}>{expanded ? "Less" : "More"}</Btn>
    </div>
    <div className="dm-pharma-prop"><strong>Mechanism:</strong> {info.mechanism}</div>
    <div className="dm-pharma-prop"><strong>Dose Range:</strong> {info.minDose}–{info.maxDose}{info.unit} · <strong>Common:</strong> {info.commonDoses.join(", ")} {info.unit}</div>
    <div className="dm-pharma-prop"><strong>Frequency:</strong> {info.frequencies.join(" / ")} · <strong>Route:</strong> {info.routes.join(" / ")}</div>
    {expanded && <>
      <div className="dm-divider" />
      <div className="dm-pharma-prop"><strong>Indications:</strong> {info.indications.join("; ")}</div>
      <div className="dm-pharma-prop"><strong style={{ color: T.danger }}>Contraindications:</strong> {info.contraindications.join("; ")}</div>
      <div className="dm-pharma-prop"><strong style={{ color: T.warning }}>Warnings:</strong> {info.warnings.join("; ")}</div>
      <div className="dm-pharma-prop"><strong>Side Effects:</strong> {info.sideEffects.join("; ")}</div>
      <div className="dm-pharma-prop"><strong>Pregnancy:</strong> {info.pregnancyCategory}</div>
      <div className="dm-pharma-prop"><strong>Monitoring:</strong> {info.monitoring.join("; ")}</div>
      <div className="dm-pharma-prop"><strong>Interactions:</strong> {info.interactions.join("; ")}</div>
      {info.renalDose && <div className="dm-pharma-prop"><strong>Renal:</strong> {info.renalDose}</div>}
      {info.hepaticDose && <div className="dm-pharma-prop"><strong>Hepatic:</strong> {info.hepaticDose}</div>}
      <div className="dm-divider" />
      <div className="dm-pharma-prop" style={{ background: "#f0fdf4", padding: 8, borderRadius: 6, fontSize: 12 }}><strong>Patient Instructions:</strong> {info.patientInstructions}</div>
    </>}
  </div>;
};

// ─── AdherenceCalendar ─────────────────────────────────────────────────────────

const AdherenceCalendar = ({ adherence, meds, onChange }: {
  adherence: AdherenceMap; meds: Medication[]; onChange: (medId: string, date: string, taken: boolean) => void;
}) => {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (today.getDay()) - weekOffset * 7 + i);
    return d;
  });
  const dateStr = (d: Date) => d.toLocaleDateString("en-CA");
  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const toggle = (medId: string, date: string, current: boolean) => onChange(medId, date, !current);
  return <div className="dm-section">
    <SectHeader icon="📅" title="Medication Adherence" extra={
      <div className="dm-row">
        <Btn size="xs" variant="outline" onClick={() => setWeekOffset(w => w + 1)}>‹ Prev</Btn>
        <span style={{ fontSize: 12, color: T.textMuted }}>{weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Last Week" : `${weekOffset} weeks ago`}</span>
        <Btn size="xs" variant="outline" onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0}>Next ›</Btn>
      </div>
    } />
    <div style={{ overflowX: "auto" }}>
      <table className="dm-table" style={{ minWidth: 600 }}>
        <thead><tr>
          <th style={{ position: "sticky", left: 0, background: T.card, zIndex: 1 }}>Medication</th>
          {days.map(d => <th key={dateStr(d)} style={{ textAlign: "center", color: isToday(d) ? T.primary : T.textMuted, fontWeight: isToday(d) ? 700 : 500 }}>
            {d.toLocaleDateString("en-GB", { weekday: "short" })}
            <div style={{ fontSize: 10 }}>{d.getDate()}/{d.getMonth() + 1}</div>
          </th>)}
        </tr></thead>
        <tbody>
          {meds.filter(m => m.status === "active").map(med => {
            const medId = med.id;
            const medAdherence = adherence[medId] || {};
            const takenCount = days.filter(d => medAdherence[dateStr(d)] === true).length;
            return <tr key={medId}>
              <td style={{ position: "sticky", left: 0, background: T.card, fontWeight: 600, fontSize: 13 }}>
                <Dot color={getDrugInfo(med.drug)?.color || T.primary} size={8} /> {med.drug} {med.dose}{med.unit}
                <div style={{ fontSize: 10, color: T.textMuted }}>{med.frequency}</div>
              </td>
              {days.map(d => {
                const ds = dateStr(d);
                const taken = medAdherence[ds];
                const future = d > today;
                return <td key={ds} style={{ textAlign: "center", cursor: future ? "default" : "pointer", padding: 4 }}
                  onClick={() => !future && toggle(medId, ds, !!taken)}>
                  {future ? <span style={{ color: T.border }}>—</span>
                    : taken === undefined ? <span style={{ color: T.textMuted, fontSize: 18 }}>○</span>
                    : taken ? <span style={{ color: T.success, fontSize: 18 }}>●</span>
                    : <span style={{ color: T.danger, fontSize: 18 }}>✕</span>}
                </td>;
              })}
            </tr>;
          })}
          {!meds.filter(m => m.status === "active").length && <tr><td colSpan={8} className="dm-empty">No active medications</td></tr>}
        </tbody>
      </table>
    </div>
  </div>;
};

// ─── MedicationCard ────────────────────────────────────────────────────────────

interface MedCardProps {
  med: Medication; patientId: string; adherence: AdherenceMap;
  onAdherenceChange: (medId: string, date: string, taken: boolean) => void;
  onUpdateMed: (id: string, updates: Partial<Medication>) => Promise<void>;
  onDeleteMed: (id: string) => Promise<void>;
}
const MedicationCard = ({ med, patientId, adherence, onAdherenceChange, onUpdateMed, onDeleteMed }: MedCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [changeType, setChangeType] = useState<DoseChange["changeType"]>("dose_increase");
  const [newDose, setNewDose] = useState(med.dose);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const info = getDrugInfo(med.drug);
  const isActive = med.status === "active";

  const handleDoseChange = async () => {
    setSaving(true);
    try {
      const change: DoseChange = {
        date: new Date().toLocaleDateString("en-CA"),
        changeType,
        previousDose: `${med.dose}${med.unit}`,
        newDose: changeType === "stopped" || changeType === "paused" ? undefined : `${newDose}${med.unit}`,
        changedBy: "doctor",
        reason: reason || undefined,
      };
      const history = [...(med.changeHistory || []), change];
      const updates: Partial<Medication> = {
        changeHistory: history,
        ...(changeType === "stopped" ? { status: "stopped" as const, endDate: new Date().toLocaleDateString("en-CA") }
          : changeType === "paused" ? { status: "paused" as const }
          : changeType === "restarted" ? { status: "active" as const }
          : { dose: newDose }),
      };
      await onUpdateMed(med.id, updates);
      setShowChange(false);
      setReason("");
    } finally { setSaving(false); }
  };

  const handleStatusToggle = async (newStatus: "active" | "paused" | "stopped") => {
    setSaving(true);
    try {
      const change: DoseChange = {
        date: new Date().toLocaleDateString("en-CA"),
        changeType: newStatus === "active" ? "restarted" : newStatus,
        previousDose: `${med.dose}${med.unit}`,
        changedBy: "doctor",
        reason: `Status changed to ${newStatus}`,
      };
      const history = [...(med.changeHistory || []), change];
      await onUpdateMed(med.id, {
        status: newStatus,
        changeHistory: history,
        ...(newStatus === "stopped" ? { endDate: new Date().toLocaleDateString("en-CA") } : {}),
      });
    } finally { setSaving(false); }
  };

  const medAdherence = useMemo(() => {
    const m = adherence[med.id] || {};
    const days = Object.keys(m);
    if (!days.length) return { pct: 0, total: 0, taken: 0 };
    const taken = days.filter(d => m[d] === true).length;
    return { pct: Math.round(taken / days.length * 100), total: days.length, taken };
  }, [adherence, med.id]);

  return <Card style={{ borderLeft: `4px solid ${info?.color || T.primary}` }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={info?.color || T.primary} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>{med.drug}</span>
          <Badge color={isActive ? T.success : med.status === "paused" ? T.warning : T.danger}
            bg={isActive ? "#dcfce7" : med.status === "paused" ? "#fef3c7" : "#fce4ec"}>{med.status}</Badge>
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
          {med.dose}{med.unit} · {med.frequency} · {med.route || "Oral"}
          {med.drugClass && ` · ${med.drugClass}`}
        </div>
        {isActive && <div style={{ marginTop: 4, fontSize: 12 }}>
          <span style={{ color: medAdherence.pct >= 80 ? T.success : medAdherence.pct >= 50 ? T.warning : T.danger, fontWeight: 600 }}>
            Adherence: {medAdherence.pct}% ({medAdherence.taken}/{medAdherence.total} days)
          </span>
        </div>}
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap" }}>
        {isActive && <Btn size="xs" variant="outline" onClick={() => { setChangeType("dose_increase"); setShowChange(true); setNewDose(med.dose); }} title="Increase Dose">↑</Btn>}
        {isActive && <Btn size="xs" variant="outline" onClick={() => { setChangeType("dose_decrease"); setShowChange(true); setNewDose(med.dose); }} title="Decrease Dose">↓</Btn>}
        {isActive && <Btn size="xs" variant="warning" onClick={() => handleStatusToggle("paused")} disabled={saving} title="Pause">⏸</Btn>}
        {med.status === "paused" && <Btn size="xs" variant="success" onClick={() => handleStatusToggle("active")} disabled={saving} title="Restart">▶</Btn>}
        <Btn size="xs" variant="danger" onClick={() => handleStatusToggle("stopped")} disabled={saving} title="Stop">✕</Btn>
        <Btn size="xs" variant="outline" onClick={() => setExpanded(!expanded)}>{expanded ? "▲" : "▼"}</Btn>
      </div>
    </div>

    {expanded && <>
      <div className="dm-divider" />
      <div className="dm-pharma-prop"><strong>Start:</strong> {med.startDate || "—"} {med.endDate ? `· End: ${med.endDate}` : ""}</div>
      {med.indication && <div className="dm-pharma-prop"><strong>Indication:</strong> {med.indication}</div>}
      {med.instructions && <div className="dm-pharma-prop"><strong>Instructions:</strong> {med.instructions}</div>}
      {med.notes && <div className="dm-pharma-prop"><strong>Notes:</strong> {med.notes}</div>}
      {info && <>
        <div className="dm-divider" />
        <div className="dm-pharma-prop"><strong>Mechanism:</strong> {info.mechanism}</div>
        <div className="dm-pharma-prop"><strong>Monitoring:</strong> {info.monitoring.join("; ")}</div>
        <div className="dm-pharma-prop"><strong style={{ color: T.warning }}>Warnings:</strong> {info.warnings.slice(0, 3).join("; ")}</div>
        <div className="dm-pharma-prop"><strong>Patient Instructions:</strong> {info.patientInstructions}</div>
      </>}
      {(med.changeHistory?.length) ? <>
        <div className="dm-divider" />
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Change History</h2>
        <div className="dm-timeline">
          {[...med.changeHistory].reverse().map((ch, i) =>
            <div key={i} className="dm-timeline-item">
              <span className="dm-timeline-date">{ch.date}</span>
              <div><Badge color={CHANGE_COLORS[ch.changeType] || T.textMuted} bg={`${CHANGE_COLORS[ch.changeType] || T.textMuted}20`}>{ch.changeType.replace("_", " ")}</Badge></div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {ch.previousDose && `${ch.previousDose}`}{ch.newDose ? ` → ${ch.newDose}` : ""}
                {ch.reason && ` · ${ch.reason}`}
                {ch.changedBy && ` · by ${ch.changedBy}`}
              </div>
            </div>
          )}
        </div>
      </> : null}
    </>}

    {showChange && <div className="dm-modal" onClick={() => setShowChange(false)}>
      <div className="dm-modal-content" onClick={e => e.stopPropagation()}>
        <div className="dm-modal-header">
          <h2>{changeType === "dose_increase" ? "Increase" : changeType === "dose_decrease" ? "Decrease" : changeType} Dose</h2>
          <button className="dm-modal-close" onClick={() => setShowChange(false)}>×</button>
        </div>
        <div className="dm-form-grid">
          <div className="dm-field">
            <label>Current Dose</label>
            <input value={`${med.dose}${med.unit}`} disabled />
          </div>
          {changeType !== "stopped" && changeType !== "paused" && <InpField label="New Dose" value={newDose} onChange={setNewDose} type="number" required />}
          <div className="dm-field">
            <label>Dose Range</label>
            <input value={info ? `${info.minDose}–${info.maxDose} ${info.unit}` : "—"} disabled />
          </div>
          {info && <div className="dm-field">
            <label>Common Doses</label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {info.commonDoses.map(d => <Btn key={d} size="xs" variant={newDose === d ? "primary" : "outline"} onClick={() => setNewDose(d)}>{d}</Btn>)}
            </div>
          </div>}
          <TextArea label="Reason for Change" value={reason} onChange={setReason} placeholder="e.g., HbA1c still elevated, patient tolerating well..." />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Btn variant="outline" onClick={() => setShowChange(false)}>Cancel</Btn>
          <Btn onClick={handleDoseChange} disabled={saving || (changeType !== "stopped" && changeType !== "paused" && !newDose)}>
            {saving ? "Saving..." : "Confirm Change"}
          </Btn>
        </div>
      </div>
    </div>}
  </Card>;
};

// ─── MedicationsTab ────────────────────────────────────────────────────────────

const MedicationsTab = ({ medications, patientId, adherence, onAdherenceChange, onUpdateMed, onDeleteMed, onAddMed }: {
  medications: Medication[]; patientId: string; adherence: AdherenceMap;
  onAdherenceChange: (medId: string, date: string, taken: boolean) => void;
  onUpdateMed: (id: string, updates: Partial<Medication>) => Promise<void>;
  onDeleteMed: (id: string) => Promise<void>;
  onAddMed: () => void;
}) => {
  const [showPharma, setShowPharma] = useState(false);
  const [drugFilter, setDrugFilter] = useState("");
  const filteredDrugs = useMemo(() =>
    Object.keys(PHARMA_DB).filter(d => d.toLowerCase().includes(drugFilter.toLowerCase())),
  [drugFilter]);
  const active = medications.filter(m => m.status === "active");
  const paused = medications.filter(m => m.status === "paused");
  const stopped = medications.filter(m => m.status === "stopped");
  return <div className="dm-section">
    <SectHeader icon="💊" title="Diabetes Medications" extra={
      <div className="dm-row">
        <Btn size="sm" variant="outline" onClick={() => setShowPharma(!showPharma)}>{showPharma ? "Hide" : "Show"} Drug DB</Btn>
        <Btn size="sm" onClick={onAddMed}>+ Add</Btn>
      </div>
    } />
    {showPharma && <Card style={{ marginBottom: 12 }}>
      <InpField label="Search Drug Database" value={drugFilter} onChange={setDrugFilter} placeholder="e.g., Metformin, Insulin..." />
      <div style={{ marginTop: 8, maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {filteredDrugs.map(d => <PharmaCard key={d} drug={d} />)}
        {!filteredDrugs.length && <div className="dm-empty">No drugs match your search</div>}
      </div>
    </Card>}
    {active.length > 0 && <div style={{ marginBottom: 8 }}>
      <h2 style={{ fontSize: 13, color: T.success, marginBottom: 6 }}>Active ({active.length})</h2>
      {active.map(m => <MedicationCard key={m.id} med={m} patientId={patientId} adherence={adherence}
        onAdherenceChange={onAdherenceChange} onUpdateMed={onUpdateMed} onDeleteMed={onDeleteMed} />)}
    </div>}
    {paused.length > 0 && <div style={{ marginBottom: 8 }}>
      <h2 style={{ fontSize: 13, color: T.warning, marginBottom: 6 }}>Paused ({paused.length})</h2>
      {paused.map(m => <MedicationCard key={m.id} med={m} patientId={patientId} adherence={adherence}
        onAdherenceChange={onAdherenceChange} onUpdateMed={onUpdateMed} onDeleteMed={onDeleteMed} />)}
    </div>}
    {stopped.length > 0 && <div style={{ marginBottom: 8 }}>
      <h2 style={{ fontSize: 13, color: T.danger, marginBottom: 6 }}>Stopped ({stopped.length})</h2>
      {stopped.map(m => <MedicationCard key={m.id} med={m} patientId={patientId} adherence={adherence}
        onAdherenceChange={onAdherenceChange} onUpdateMed={onUpdateMed} onDeleteMed={onDeleteMed} />)}
    </div>}
    {!medications.length && <div className="dm-empty">No medications prescribed</div>}
  </div>;
};

// ─── AlertsTab ─────────────────────────────────────────────────────────────────

const AlertsTab = ({ alerts, onAcknowledge }: { alerts: ScientificAlert[]; onAcknowledge?: (id: string) => void }) => {
  const grouped = useMemo(() => {
    const g: Record<string, ScientificAlert[]> = {};
    alerts.forEach(a => { (g[a.severity] = g[a.severity] || []).push(a); });
    return g;
  }, [alerts]);
  const order = ["critical", "urgent", "warning", "info"] as const;
  const severityColor = { critical: T.danger, urgent: "#d97706", warning: T.info, info: T.textMuted };
  const severityBg = { critical: "#fce4ec", urgent: "#fef3c7", warning: "#e0f2fe", info: "#f3f4f6" };
  return <div className="dm-section">
    <SectHeader icon="🔔" title="Clinical Alerts & Decision Support" extra={
      <Badge color={alerts.length > 0 ? T.danger : T.success} bg={alerts.length > 0 ? "#fce4ec" : "#dcfce7"}>
        {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
      </Badge>
    } />
    {alerts.length === 0 && <div className="dm-empty">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p>No active clinical alerts — patient is meeting all treatment targets.</p>
    </div>}
    {order.map(sev => (grouped[sev] || []).map(a => <Card key={a.id} style={{ borderLeft: `4px solid ${severityColor[a.severity]}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{a.icon}</span>
            <Badge color={severityColor[a.severity]} bg={severityBg[a.severity]}>{a.severity.toUpperCase()}</Badge>
            <Badge color={T.textMuted} bg="#f3f4f6">{a.category}</Badge>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{a.title}</div>
          <p style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>{a.detail}</p>
          <p style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>Evidence: {a.evidence}</p>
        </div>
      </div>
      <div style={{ marginTop: 8, padding: 8, background: "#f0fdf4", borderRadius: 6 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.textDark }}>Recommended Action:</p>
        <p style={{ fontSize: 12, color: T.text }}>{a.action}</p>
      </div>
      {onAcknowledge && <div style={{ marginTop: 8, textAlign: "right" }}>
        <Btn size="sm" variant="outline" onClick={() => onAcknowledge(a.id)}>Acknowledge</Btn>
      </div>}
    </Card>))}
  </div>;
};

// ─── ComplicationsTab ─────────────────────────────────────────────────────────

const ComplicationsTab = ({ complications, onUpdate }: {
  complications: Complication[]; onUpdate: (c: Complication[]) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [editComps, setEditComps] = useState<Complication[]>([]);
  const openEditor = () => { setEditComps([...complications]); setEditing(true); };
  const save = () => { onUpdate(editComps.filter(c => c.date)); setEditing(false); };
  const toggleComp = (name: string) => {
    setEditComps(prev => {
      const exists = prev.find(c => c.name === name);
      if (exists) {
        if (exists.date) return prev.map(c => c.name === name ? { ...c, date: "" } : c);
        return prev.filter(c => c.name !== name);
      }
      return [...prev, { name, date: new Date().toLocaleDateString("en-CA") }];
    });
  };
  const updateDate = (name: string, date: string) => {
    setEditComps(prev => prev.map(c => c.name === name ? { ...c, date } : c));
  };
  return <div className="dm-section">
    <SectHeader icon="🫁" title="Complications" extra={<Btn size="sm" variant="outline" onClick={openEditor}>{complications.length > 0 ? "Edit" : "Add"}</Btn>} />
    {complications.length === 0 && <p style={{ fontSize: 13, color: T.textMuted }}>No complications recorded</p>}
    {complications.filter(c => c.date).map(c => <div key={c.name} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 13 }}>{c.name}</span>
      <span style={{ fontSize: 12, color: T.textMuted }}>{c.date}</span>
    </div>)}
    {editing && <div className="dm-modal" onClick={() => setEditing(false)}>
      <div className="dm-modal-content" onClick={e => e.stopPropagation()}>
        <div className="dm-modal-header">
          <h2>Complications</h2>
          <button className="dm-modal-close" onClick={() => setEditing(false)}>×</button>
        </div>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>Tap to add/remove. Set year when diagnosed.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {COMPLICATIONS.map(c => {
            const has = editComps.find(ec => ec.name === c.name);
            return <button key={c.name} onClick={() => toggleComp(c.name)}
              style={{ padding: "4px 10px", borderRadius: 9999, border: `1.5px solid ${has?.date ? T.primary : T.border}`, background: has?.date ? T.muted : "transparent", fontSize: 12, cursor: "pointer", color: has?.date ? T.textDark : T.textMuted, fontWeight: has?.date ? 600 : 400 }}>
              {c.name}
            </button>;
          })}
        </div>
        {editComps.filter(c => c.date).length > 0 && <div style={{ marginTop: 8 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Diagnosis Dates</h2>
          {editComps.filter(c => c.date).map(c => <InpField key={c.name} label={c.name} value={c.date} onChange={v => updateDate(c.name, v)} placeholder="YYYY-MM-DD" />)}
        </div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Btn variant="outline" onClick={() => setEditing(false)}>Cancel</Btn>
          <Btn onClick={save}>Save</Btn>
        </div>
      </div>
    </div>}
  </div>;
};

// ─── LifestyleTab ─────────────────────────────────────────────────────────────

const LifestyleTab = ({ items, onUpdate }: {
  items: LifestyleItem[]; onUpdate: (items: LifestyleItem[]) => void;
}) => {
  const setGrade = (name: string, grade: LifestyleItem["grade"]) => {
    onUpdate(items.map(i => i.name === name ? { ...i, grade, updatedAt: new Date().toLocaleDateString("en-CA") } : i));
  };
  const gradeColor = { Good: T.success, Moderate: T.warning, Poor: T.danger };
  const gradeBg = { Good: "#dcfce7", Moderate: "#fef3c7", Poor: "#fce4ec" };
  return <div className="dm-section">
    <SectHeader icon="🏃" title="Lifestyle & Self-Management" />
    <div style={{ display: "grid", gap: 6 }}>
      {items.map(item => <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {(["Good", "Moderate", "Poor"] as const).map(g =>
            <Btn key={g} size="xs" variant={item.grade === g ? "primary" : "outline"}
              style={item.grade === g ? { background: gradeColor[g] } : {}}
              onClick={() => setGrade(item.name, g)}>{g}</Btn>
          )}
        </div>
      </div>)}
    </div>
  </div>;
};

// ─── EducationTab ──────────────────────────────────────────────────────────────

const EducationTab = ({ sentTopics, onSend }: {
  sentTopics: EducationTopic[]; onSend: (topic: EducationTopic) => void;
}) => {
  const [filter, setFilter] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic | null>(null);
  const categories = useMemo(() => ["All", ...new Set(EDUCATION_TOPICS.map(t => t.category))], []);
  const filtered = filter === "All" ? EDUCATION_TOPICS : EDUCATION_TOPICS.filter(t => t.category === filter);
  const sentIds = new Set(sentTopics.map(t => t.id));
  return <div className="dm-section">
    <SectHeader icon="📚" title="Patient Education Library" />
    <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
      {categories.map(c => <Btn key={c} size="xs" variant={filter === c ? "primary" : "outline"} onClick={() => setFilter(c)}>{c}</Btn>)}
    </div>
    <div style={{ display: "grid", gap: 6 }}>
      {filtered.map(topic => {
        const sent = sentIds.has(topic.id);
        return <Card key={topic.id} style={{ cursor: "pointer", opacity: sent ? 0.7 : 1 }}
          onClick={() => setSelectedTopic(topic)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{topic.title}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{topic.category} · {topic.duration}{sent && " · Sent ✓"}</div>
            </div>
            <Btn size="xs" variant="success" onClick={e => { e.stopPropagation(); onSend(topic); }} disabled={sent}>
              {sent ? "Sent ✓" : "Send"}
            </Btn>
          </div>
        </Card>;
      })}
    </div>
    {selectedTopic && <div className="dm-modal" onClick={() => setSelectedTopic(null)}>
      <div className="dm-modal-content" onClick={e => e.stopPropagation()}>
        <div className="dm-modal-header">
          <h2>{selectedTopic.title}</h2>
          <button className="dm-modal-close" onClick={() => setSelectedTopic(null)}>×</button>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{selectedTopic.content}</p>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Key Points</h2>
        <ul style={{ paddingLeft: 20, fontSize: 12 }}>
          {selectedTopic.keyPoints.map((kp, i) => <li key={i} style={{ marginBottom: 3 }}>{kp}</li>)}
        </ul>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Btn onClick={() => { onSend(selectedTopic); setSelectedTopic(null); }} disabled={sentIds.has(selectedTopic.id)}>
            {sentIds.has(selectedTopic.id) ? "Already Sent" : "Send to Patient"}
          </Btn>
          <Btn variant="outline" onClick={() => setSelectedTopic(null)}>Close</Btn>
        </div>
      </div>
    </div>}
  </div>;
};

// ─── LabsTab ───────────────────────────────────────────────────────────────────

const LabsTab = ({ labOrders, onAdd }: { labOrders: LabOrder[]; onAdd: (order: LabOrder) => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("ordered");
  const submitOrder = () => {
    if (!name) return;
    onAdd({ name, result: result || undefined, orderedAt: new Date().toISOString(), type: "lab", status });
    setName(""); setResult(""); setStatus("ordered"); setShowForm(false);
  };
  const panel = [...LAB_PANEL, ...IMAGING_PANEL];
  return <div className="dm-section">
    <SectHeader icon="🔬" title="Lab Orders & Results" extra={<Btn size="sm" onClick={() => setShowForm(true)}>+ Order Lab</Btn>} />
    {labOrders.length === 0 && <div className="dm-empty">No lab orders recorded</div>}
    {labOrders.length > 0 && <table className="dm-table">
      <thead><tr><th>Test</th><th>Result</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>
        {labOrders.map((l, i) => <tr key={i}>
          <td style={{ fontWeight: 500 }}>{l.name}</td>
          <td>{l.result || "—"}</td>
          <td style={{ fontSize: 12 }}>{l.orderedAt ? new Date(l.orderedAt).toLocaleDateString("en-GB") : "—"}</td>
          <td><Badge color={l.status === "completed" ? T.success : l.status === "resulted" ? T.info : T.warning}
            bg={l.status === "completed" ? "#dcfce7" : l.status === "resulted" ? "#e0f2fe" : "#fef3c7"}>{l.status || "ordered"}</Badge></td>
        </tr>)}
      </tbody>
    </table>}
    {showForm && <div className="dm-modal" onClick={() => setShowForm(false)}>
      <div className="dm-modal-content" onClick={e => e.stopPropagation()}>
        <div className="dm-modal-header">
          <h2>Order Lab / Imaging</h2>
          <button className="dm-modal-close" onClick={() => setShowForm(false)}>×</button>
        </div>
        <div className="dm-form-grid">
          <SelField label="Lab / Study" value={name} onChange={setName} options={panel.map(p => ("name" in p ? p.name : p.study) || "")} required />
          <InpField label="Result" value={result} onChange={setResult} placeholder="Optional: enter result" />
          <SelField label="Status" value={status} onChange={setStatus} options={["ordered", "resulted", "completed", "cancelled"]} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn>
          <Btn onClick={submitOrder} disabled={!name}>Submit Order</Btn>
        </div>
      </div>
    </div>}
  </div>;
};

// ─── NotesTab ──────────────────────────────────────────────────────────────────

const NotesTab = ({ notes, patientName, onSave }: {
  notes: ClinicalNote[]; patientName: string; onSave: (note: ClinicalNote) => Promise<void>;
}) => {
  const [editing, setEditing] = useState<ClinicalNote | null>(null);
  const [newNote, setNewNote] = useState(false);
  const blankNote = (): ClinicalNote => ({
    date: new Date().toLocaleDateString("en-CA"), cc: "", hpi: "", exam: "",
    investigations: "", assessment: "", plan: "", diagnoses: [], followUps: [], visitType: "",
  });
  const [form, setForm] = useState<ClinicalNote>(blankNote());
  const sorted = useMemo(() => [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [notes]);
  const openNew = () => { setForm(blankNote()); setNewNote(true); setEditing(null); };
  const openEdit = (n: ClinicalNote) => { setForm({ ...n }); setEditing(n); setNewNote(false); };
  const saveNote = async () => {
    await onSave(form);
    setNewNote(false); setEditing(null);
  };
  const exportPdf = (n: ClinicalNote) => exportNoteAsPDF(n, patientName);
  return <div className="dm-section">
    <SectHeader icon="📝" title="Clinical Notes" extra={<Btn size="sm" onClick={openNew}>+ New Note</Btn>} />
    {sorted.length === 0 && <div className="dm-empty">No clinical notes recorded</div>}
    {sorted.map((n, i) => <Card key={n.id || i} onClick={() => openEdit(n)} style={{ cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{n.date} {n.visitType && `· ${n.visitType}`}</div>
          {n.cc && <div style={{ fontSize: 12, color: T.textMuted }}>CC: {n.cc}</div>}
          {n.assessment && <div style={{ fontSize: 12, color: T.textMuted }}>Assessment: {n.assessment}</div>}
        </div>
        <Btn size="xs" variant="outline" onClick={e => { e.stopPropagation(); exportPdf(n); }}>PDF</Btn>
      </div>
    </Card>)}
    {(newNote || editing) && <div className="dm-modal" onClick={() => { setNewNote(false); setEditing(null); }}>
      <div className="dm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <div className="dm-modal-header">
          <h2>{newNote ? "New Clinical Note" : "Edit Clinical Note"}</h2>
          <button className="dm-modal-close" onClick={() => { setNewNote(false); setEditing(null); }}>×</button>
        </div>
        <div className="dm-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <InpField label="Date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} type="date" required />
          <SelField label="Visit Type" value={form.visitType || ""} onChange={v => setForm(f => ({ ...f, visitType: v }))}
            options={["General Review", "Follow-up", "New Patient", "Medication Review", "Urgent Visit", "Annual Review", "Phone/Telehealth"]} />
        </div>
        <TextArea label="Chief Complaint (CC)" value={form.cc || ""} onChange={v => setForm(f => ({ ...f, cc: v }))} />
        <TextArea label="History of Present Illness (HPI)" value={form.hpi || ""} onChange={v => setForm(f => ({ ...f, hpi: v }))} rows={4} />
        <TextArea label="Examination Findings" value={form.exam || ""} onChange={v => setForm(f => ({ ...f, exam: v }))} rows={3} />
        <TextArea label="Investigations" value={form.investigations || ""} onChange={v => setForm(f => ({ ...f, investigations: v }))} rows={2} />
        <TextArea label="Assessment" value={form.assessment || ""} onChange={v => setForm(f => ({ ...f, assessment: v }))} rows={3} />
        <TextArea label="Plan" value={form.plan || ""} onChange={v => setForm(f => ({ ...f, plan: v }))} rows={3} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Btn variant="outline" onClick={() => { setNewNote(false); setEditing(null); }}>Cancel</Btn>
          <Btn onClick={saveNote}>Save Note</Btn>
        </div>
      </div>
    </div>}
  </div>;
};

// ─── TimelineTab ───────────────────────────────────────────────────────────────

const TimelineTab = ({ events }: { events: TimelineEvent[] }) => {
  const sorted = useMemo(() => [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [events]);
  return <div className="dm-section">
    <SectHeader icon="📋" title="Patient Timeline" />
    {sorted.length === 0 && <div className="dm-empty">No timeline events</div>}
    <div className="dm-timeline">
      {sorted.map(e => <div key={e.id} className="dm-timeline-item">
        <span className="dm-timeline-icon">{e.icon}</span>
        <span className="dm-timeline-date">{new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{e.title}</div>
        {e.detail && <div style={{ fontSize: 12, color: T.textMuted }}>{e.detail}</div>}
      </div>)}
    </div>
  </div>;
};

// ─── MessagingTab ──────────────────────────────────────────────────────────────

const MessagingTab = ({ messages, patientName, patientId, onSend }: {
  messages: Message[]; patientName: string; patientId: string; onSend: (text: string) => Promise<void>;
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try { await onSend(text); setText(""); } finally { setSending(false); }
  };
  return <div className="dm-section">
    <SectHeader icon="💬" title={`Messages — ${patientName}`} />
    <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
      {messages.length === 0 && <div className="dm-empty">No messages yet. Send a message to the patient.</div>}
      {messages.filter(m => m.text).map((m, i) => <div key={m.id || i} style={{
        alignSelf: m.from === "doctor" ? "flex-end" : "flex-start",
        background: m.from === "doctor" ? T.primary : "#f3f4f6",
        color: m.from === "doctor" ? "#fff" : T.text,
        padding: "8px 12px", borderRadius: 12,
        borderBottomRightRadius: m.from === "doctor" ? 4 : 12,
        borderBottomLeftRadius: m.from === "doctor" ? 12 : 4,
        maxWidth: "80%", fontSize: 13,
      }}>
        <div>{m.text}</div>
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
          {m.time ? new Date(m.time).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
          {m.from === "doctor" ? " · Doctor" : " · Patient"}
        </div>
      </div>)}
      <div ref={bottomRef} />
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <input style={{ flex: 1, padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none" }}
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Type your message here..." onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} />
      <Btn onClick={send} disabled={!text.trim() || sending}>{sending ? "Sending..." : "Send"}</Btn>
    </div>
  </div>;
};

// ─── ReferralsTab ──────────────────────────────────────────────────────────────

const ReferralsTab = ({ referrals, onAdd }: {
  referrals: LabOrder[]; onAdd: (r: LabOrder) => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [notes, setNotes] = useState("");
  const submitRef = () => {
    if (!specialty) return;
    onAdd({ name: `Referral to ${specialty}`, orderedAt: new Date().toISOString(), type: "imaging", study: specialty, urgency, status: "ordered" });
    setSpecialty(""); setUrgency("routine"); setNotes(""); setShowForm(false);
  };
  const urgencyColor = { routine: T.success, urgent: T.danger, "semi-urgent": T.warning };
  const urgencyBg = { routine: "#dcfce7", urgent: "#fce4ec", "semi-urgent": "#fef3c7" };
  return <div className="dm-section">
    <SectHeader icon="🔄" title="Referrals" extra={<Btn size="sm" onClick={() => setShowForm(true)}>+ Refer</Btn>} />
    {referrals.length === 0 && <div className="dm-empty">No referrals recorded</div>}
    {referrals.map((r, i) => <Card key={i}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.study ? `Referral to ${r.study}` : r.name}</div>
          {r.orderedAt && <div style={{ fontSize: 12, color: T.textMuted }}>{new Date(r.orderedAt).toLocaleDateString("en-GB")}</div>}
        </div>
        <Badge color={urgencyColor[r.urgency as keyof typeof urgencyColor] || T.textMuted}
          bg={urgencyBg[r.urgency as keyof typeof urgencyBg] || "#f3f4f6"}>{r.urgency || "routine"}</Badge>
      </div>
    </Card>)}
    {showForm && <div className="dm-modal" onClick={() => setShowForm(false)}>
      <div className="dm-modal-content" onClick={e => e.stopPropagation()}>
        <div className="dm-modal-header">
          <h2>New Referral</h2>
          <button className="dm-modal-close" onClick={() => setShowForm(false)}>×</button>
        </div>
        <div className="dm-form-grid">
          <SelField label="Specialty" value={specialty} onChange={setSpecialty} options={SPECIALTIES} required />
          <SelField label="Urgency" value={urgency} onChange={setUrgency} options={["routine", "semi-urgent", "urgent"]} />
          <TextArea label="Referral Notes" value={notes} onChange={setNotes} placeholder="Reason for referral..." />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn>
          <Btn onClick={submitRef} disabled={!specialty}>Submit Referral</Btn>
        </div>
      </div>
    </div>}
  </div>;
};
// ─── PatientPicker ────────────────────────────────────────────────────────────

interface PatientPickerProps {
  patients: PatientSummary[]; selectedId: string | null; onSelect: (id: string) => void;
  search: string; onSearchChange: (s: string) => void; loading: boolean;
}
const PatientPicker = ({ patients, selectedId, onSelect, search, onSearchChange, loading }: PatientPickerProps) => {
  const filtered = useMemo(() => patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.universalId || "").includes(search) ||
    (p.phone || "").includes(search) ||
    (p.diagnosis || "").toLowerCase().includes(search.toLowerCase())
  ), [patients, search]);
  return <div className="dm-picker-panel">
    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: T.textDark, marginBottom: 4 }}>🩺 Diabetes Registry</div>
      <div style={{ fontSize: 11, color: T.textMuted }}>{patients.length} patients · {patients.filter(p => p.latestHbA1c && p.latestHbA1c >= 7).length} above HbA1c target</div>
    </div>
    <div className="dm-search-box" style={{ margin: "8px 12px", maxWidth: "none" }}>
      <input placeholder="Search patients..." value={search} onChange={e => onSearchChange(e.target.value)} />
    </div>
    <div style={{ flex: 1, overflowY: "auto" }}>
      {loading && <div className="dm-loader"><div className="dm-spinner" /></div>}
      {!loading && filtered.length === 0 && <div className="dm-empty">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <p>No patients found</p>
      </div>}
      {filtered.map(p => {
        const isSelected = p.id === selectedId;
        const hba1cHigh = p.latestHbA1c ? p.latestHbA1c >= 7 : false;
        const glucoseHigh = p.latestGlucose ? p.latestGlucose > 13.9 : false;
        return <div key={p.id} onClick={() => onSelect(p.id)}
          style={{
            padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid ${T.border}`,
            background: isSelected ? T.muted : "transparent",
            borderLeft: isSelected ? `3px solid ${T.primary}` : "3px solid transparent",
            transition: "all 0.15s",
          }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: T.textDark }}>{p.name}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>
                {p.age ? `${p.age}y` : ""} {p.sex || ""} {p.universalId ? `· ${p.universalId}` : ""} {p.diagnosis ? `· ${p.diagnosis}` : ""}
              </div>
              {p.latestHbA1c && <div style={{ fontSize: 12, marginTop: 2 }}>
                HbA1c: <span style={{ color: hba1cColor(p.latestHbA1c), fontWeight: 600 }}>{p.latestHbA1c.toFixed(1)}%</span>
              </div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              {p.latestGlucose && <Badge color={glucoseColor(p.latestGlucose)} bg={p.latestGlucose < 3.9 ? "#f3e8ff" : p.latestGlucose < 7 ? "#dcfce7" : p.latestGlucose < 10 ? "#fef3c7" : "#fce4ec"}>
                {p.latestGlucose.toFixed(1)}
              </Badge>}
              {p.nextReview && <span style={{ fontSize: 10, color: T.textMuted }}>Next: {p.nextReview}</span>}
            </div>
          </div>
        </div>;
      })}
    </div>
  </div>;
};

// ─── PatientPanel ──────────────────────────────────────────────────────────────

interface PatientPanelProps {
  patientId: string; patient: PatientSummary;
  glucoseReadings: GlucoseReading[]; hba1cReadings: HbA1cReading[];
  medications: Medication[]; adherence: AdherenceMap;
  alerts: ScientificAlert[]; complications: Complication[];
  lifestyle: LifestyleItem[]; education: EducationTopic[];
  labOrders: LabOrder[]; clinicalNotes: ClinicalNote[];
  timelineEvents: TimelineEvent[]; messages: Message[];
  referrals: LabOrder[]; footExams: FootExamResult[];
  glucoseLoading: boolean; hba1cLoading: boolean;
  onAdherenceChange: (medId: string, date: string, taken: boolean) => void;
  onUpdateMed: (id: string, updates: Partial<Medication>) => Promise<void>;
  onDeleteMed: (id: string) => Promise<void>;
  onAddMed: () => void;
  onUpdateComplications: (c: Complication[]) => void;
  onUpdateLifestyle: (items: LifestyleItem[]) => void;
  onSendEducation: (topic: EducationTopic) => Promise<void>;
  onAddLab: (order: LabOrder) => void;
  onSaveNote: (note: ClinicalNote) => Promise<void>;
  onSendMessage: (text: string) => Promise<void>;
  onAddReferral: (r: LabOrder) => void;
}
const PatientPanel = ({
  patientId, patient, glucoseReadings, hba1cReadings,
  medications, adherence, alerts, complications, lifestyle,
  education, labOrders, clinicalNotes, timelineEvents, messages,
  referrals, footExams, glucoseLoading, hba1cLoading,
  onAdherenceChange, onUpdateMed, onDeleteMed, onAddMed,
  onUpdateComplications, onUpdateLifestyle, onSendEducation,
  onAddLab, onSaveNote, onSendMessage, onAddReferral,
}: PatientPanelProps) => {
  const [tab, setTab] = useState("glucose");
  const adhPct = useMemo(() => {
    const active = medications.filter(m => m.status === "active");
    if (!active.length) return 100;
    let total = 0; let taken = 0;
    active.forEach(m => {
      const a = adherence[m.id] || {};
      Object.values(a).forEach(v => { total++; if (v) taken++; });
    });
    return total ? Math.round(taken / total * 100) : 100;
  }, [medications, adherence]);

  const tabs = [
    { id: "glucose", label: "Glucose", icon: "🩸" },
    { id: "hba1c", label: "HbA1c", icon: "🧪" },
    { id: "meds", label: "Meds", icon: "💊" },
    { id: "adherence", label: "Adherence", icon: "📅" },
    { id: "alerts", label: `Alerts (${alerts.length})`, icon: "🔔" },
    { id: "complications", label: "Complications", icon: "🫁" },
    { id: "lifestyle", label: "Lifestyle", icon: "🏃" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "labs", label: "Labs", icon: "🔬" },
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "timeline", label: "Timeline", icon: "📋" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "referrals", label: "Referrals", icon: "🔄" },
  ];
  const renderTab = () => {
    switch (tab) {
      case "glucose": return <GlucoseTab readings={glucoseReadings} loading={glucoseLoading} />;
      case "hba1c": return <HbA1cTab hba1cs={hba1cReadings} loading={hba1cLoading} />;
      case "meds": return <MedicationsTab medications={medications} patientId={patientId} adherence={adherence}
        onAdherenceChange={onAdherenceChange} onUpdateMed={onUpdateMed} onDeleteMed={onDeleteMed} onAddMed={onAddMed} />;
      case "adherence": return <AdherenceCalendar adherence={adherence} meds={medications} onChange={onAdherenceChange} />;
      case "alerts": return <AlertsTab alerts={alerts} />;
      case "complications": return <ComplicationsTab complications={complications} onUpdate={onUpdateComplications} />;
      case "lifestyle": return <LifestyleTab items={lifestyle} onUpdate={onUpdateLifestyle} />;
      case "education": return <EducationTab sentTopics={education} onSend={onSendEducation} />;
      case "labs": return <LabsTab labOrders={labOrders} onAdd={onAddLab} />;
      case "notes": return <NotesTab notes={clinicalNotes} patientName={patient.name} onSave={onSaveNote} />;
      case "timeline": return <TimelineTab events={timelineEvents} />;
      case "messages": return <MessagingTab messages={messages} patientName={patient.name} patientId={patientId} onSend={onSendMessage} />;
      case "referrals": return <ReferralsTab referrals={referrals} onAdd={onAddReferral} />;
      default: return <GlucoseTab readings={glucoseReadings} loading={glucoseLoading} />;
    }
  };
  return <div className="dm-patient-panel">
    <div className="dm-header dm-no-print">
      <div>
        <h1>{patient.name}</h1>
        <div className="dm-header-sub">{patient.age ? `${patient.age}y` : ""} {patient.sex || ""} · {patient.diagnosis || "Type 2 Diabetes"} · Risk: {patient.riskLevel || "Moderate"} · Last Visit: {patient.lastVisit || "—"}</div>
      </div>
      <div className="dm-stats" style={{ display: "flex", gap: 8 }}>
        <StatCard label="Glucose" value={patient.latestGlucose ? `${patient.latestGlucose.toFixed(1)}` : "—"} sub="mmol/L" />
        <StatCard label="HbA1c" value={patient.latestHbA1c ? `${patient.latestHbA1c.toFixed(1)}%` : "—"} sub={patient.latestHbA1c && patient.latestHbA1c < 7 ? "At Target" : "Above Target"} color={patient.latestHbA1c && patient.latestHbA1c < 7 ? T.success : T.danger} />
        <StatCard label="Alerts" value={`${alerts.length}`} sub="active" color={alerts.length > 0 ? T.danger : T.success} />
        <StatCard label="Adherence" value={`${adhPct}%`} sub="medication" color={adhPct >= 80 ? T.success : adhPct >= 50 ? T.warning : T.danger} />
      </div>
    </div>
    <div className="dm-tabs dm-no-print">
      {tabs.map(t => <button key={t.id} className={`dm-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
        {t.icon} {t.label}
      </button>)}
    </div>
    {renderTab()}
  </div>;
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface DashboardProps {
  patientId?: string;
}
export default function DiabetesDashboard({ patientId: initialPatientId }: DashboardProps) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialPatientId || null);
  const [search, setSearch] = useState("");
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [glucoseLoading, setGlucoseLoading] = useState(false);
  const [hba1cLoading, setHba1cLoading] = useState(false);
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [hba1cReadings, setHba1cReadings] = useState<HbA1cReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherence, setAdherence] = useState<AdherenceMap>({});
  const [complications, setComplications] = useState<Complication[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestyleItem[]>(LIFESTYLE_ITEMS);
  const [education, setEducation] = useState<EducationTopic[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [referrals, setReferrals] = useState<LabOrder[]>([]);
  const [footExams, setFootExams] = useState<FootExamResult[]>([]);
  const [patient, setPatient] = useState<PatientSummary>({ id: "", name: "Select a Patient", totalReadings: 0 });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // Load patients
  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, snap => {
      const list: PatientSummary[] = snap.docs.map(d => {
        const d2 = d.data();
        const latestReading = d2.latestGlucoseReading ? (d2.latestGlucoseReading as unknown as { value?: number; hba1c?: number; timestamp?: Timestamp }) : null;
        return {
          id: d.id, name: d2.name || "Unknown",
          age: d2.age, sex: d2.sex, email: d2.email, phone: d2.phone,
          universalId: d2.universalId, diagnosis: d2.diagnosis, riskLevel: d2.riskLevel,
          lastVisit: d2.lastVisit, nextReview: d2.nextReview,
          latestGlucose: latestReading?.value, latestHbA1c: latestReading?.hba1c,
          latestAt: latestReading?.timestamp?.toDate(), totalReadings: d2.totalGlucoseReadings || 0,
        };
      });
      setPatients(list);
      setPatientsLoading(false);
    });
    return () => unsub();
  }, []);

  // Load patient data
  useEffect(() => {
    if (!selectedId) return;
    const pid = selectedId;
    const p = patients.find(x => x.id === pid);
    if (p) setPatient(p);

    setGlucoseLoading(true); setHba1cLoading(true);

    // Glucose readings
    const glucoseUnsub = onSnapshot(
      query(collection(db, "patients", pid, "glucoseReadings"), orderBy("recordedAt", "desc"), limit(500)),
      snap => {
        const list: GlucoseReading[] = snap.docs.map(d => {
          const d2 = d.data();
          return {
            id: d.id, value: d2.value ?? d2.data?.value ?? 0, unit: d2.unit ?? "mmol/L",
            recordedAt: (d2.recordedAt as Timestamp)?.toDate() ?? new Date(),
            source: d2.source ?? "patient",
            mealTag: d2.mealTag ?? d2.data?.mealTag,
            activity: d2.activity ?? d2.data?.activity,
            notes: d2.notes ?? d2.data?.notes,
            triageLabel: d2.triage?.label, triageUrgency: d2.triage?.urgency, triageMessage: d2.triage?.message,
          };
        });
        setGlucoseReadings(list.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()));
        setGlucoseLoading(false);
      }, err => { console.error("glucose err", err); setGlucoseLoading(false); });

    // HbA1c readings
    const hba1cUnsub = onSnapshot(
      query(collection(db, "patients", pid, "hba1cReadings"), orderBy("recordedAt", "desc"), limit(50)),
      snap => {
        const list: HbA1cReading[] = snap.docs.map(d => {
          const d2 = d.data();
          return {
            id: d.id, value: d2.value, recordedAt: (d2.recordedAt as Timestamp)?.toDate() ?? new Date(),
            source: d2.source ?? "lab",
            estimatedAverageGlucose: d2.estimatedAverageGlucose, notes: d2.notes,
          };
        });
        setHba1cReadings(list);
        setHba1cLoading(false);
      }, err => { console.error("hba1c err", err); setHba1cLoading(false); });

    // Medications
    const medUnsub = onSnapshot(
      query(collection(db, "patients", pid, "medications"), orderBy("startDate", "desc")),
      snap => {
        const list: Medication[] = snap.docs.map(d => {
          const d2 = d.data();
          const drug = String(d2.medication ?? d2.drug ?? d2.name ?? "Unknown");
          const dos = String(d2.dosage ?? d2.dose ?? d2.strength ?? "—");
          const doseMatch = dos.match(/^([\d.]+)\s*([a-zA-Z]*)/);
          const doseNum = doseMatch ? doseMatch[1] : dos;
          const doseUnit = doseMatch?.[2]?.toLowerCase() || (d2.unit as string) || "mg";
          const pharma = getDrugInfo(drug);
          return {
            id: d.id, drug, medication: drug, dose: doseNum, dosage: dos,
            unit: doseUnit, frequency: String(d2.frequency ?? d2.freq ?? "OD"),
            drugClass: String(d2.drugClass ?? pharma?.drugClass ?? "—"),
            status: d2.active === true || d2.status === "active" || (!d2.endDate && d2.active !== false) ? "active" : d2.status === "paused" ? "paused" : "stopped",
            startDate: d2.startDate ? String(d2.startDate) : "", endDate: d2.endDate ? String(d2.endDate) : undefined,
            indication: d2.indication, route: d2.route ?? pharma?.routes?.[0], instructions: d2.instructions,
            warnings: d2.warnings, refills: d2.refills, duration: d2.duration, notes: d2.notes,
            changeHistory: d2.changeHistory as DoseChange[] | undefined,
          };
        });
        setMedications(list);
      });

    // Adherence
    const adhUnsub = onSnapshot(
      query(collection(db, "patients", pid, "adherence")),
      snap => {
        const map: AdherenceMap = {};
        snap.docs.forEach(d => { const d2 = d.data(); map[d.id] = d2.log || {}; });
        setAdherence(map);
      });

    // Clinical data
    const loadData = async () => {
      try {
        const [compSnap, labsSnap, notesSnap, msgsSnap, refSnap, footSnap, eduSnap, eventsSnap] = await Promise.all([
          getDocs(query(collection(db, "patients", pid, "complications"), limit(100))),
          getDocs(query(collection(db, "patients", pid, "labOrders"), orderBy("orderedAt", "desc"), limit(100))),
          getDocs(query(collection(db, "patients", pid, "clinicalNotes"), orderBy("date", "desc"), limit(100))),
          getDocs(query(collection(db, "patients", pid, "messages"), orderBy("timestamp", "asc"), limit(500))),
          getDocs(query(collection(db, "patients", pid, "referrals"), orderBy("orderedAt", "desc"), limit(100))),
          getDocs(query(collection(db, "patients", pid, "footExams"), orderBy("recordedAt", "desc"), limit(20))),
          getDocs(query(collection(db, "patients", pid, "education"), orderBy("sentAt", "desc"), limit(100))),
          getDocs(query(collection(db, "patients", pid, "timeline"), orderBy("date", "desc"), limit(200))),
        ]);
        setComplications(compSnap.docs.map(d => ({ ...d.data(), name: d.data().name })) as Complication[]);
        setLabOrders(labsSnap.docs.map(d => ({ ...d.data(), name: d.data().name })) as LabOrder[]);
        setClinicalNotes(notesSnap.docs.map(d => ({ ...d.data(), id: d.id })) as ClinicalNote[]);
        setMessages(msgsSnap.docs.map(d => {
          const d2 = d.data();
          return { id: d.id, from: d2.from, senderId: d2.senderId, senderName: d2.senderName, senderRole: d2.senderRole, time: d2.time, text: d2.text, read: d2.read, status: d2.status, threadId: d2.threadId, timestamp: d2.timestamp?.toDate ? d2.timestamp.toDate() : undefined };
        }));
        setReferrals(refSnap.docs.map(d => ({ ...d.data(), name: d.data().name })) as LabOrder[]);
        setFootExams(footSnap.docs.map(d => {
          const d2 = d.data();
          return { id: d.id, recordedAt: (d2.recordedAt as Timestamp)?.toDate() ?? new Date(), performedBy: d2.performedBy || "", monofilament: d2.monofilament || "normal", vibrationSense: d2.vibrationSense || "normal", pulses: d2.pulses || "palpable", deformity: d2.deformity || [], callus: d2.callus || [], fissures: d2.fissures || [], ulcers: d2.ulcers || [], riskCategory: d2.riskCategory || "low", notes: d2.notes, plan: d2.plan, nextReviewDate: d2.nextReviewDate };
        }));
        setEducation(eduSnap.docs.map(d => ({ ...d.data(), sentAt: (d.data().sentAt as Timestamp)?.toDate?.()?.toISOString() })) as EducationTopic[]);
        setTimelineEvents(eventsSnap.docs.map(d => ({ ...d.data(), date: (d.data().date as Timestamp)?.toDate?.()?.toISOString() ?? d.data().date })) as TimelineEvent[]);
      } catch (e) { console.error("loadData err", e); }
    };
    loadData();
    return () => { glucoseUnsub(); hba1cUnsub(); medUnsub(); adhUnsub(); };
  }, [selectedId]);

  // ─── Action helpers ────────────────────────────────────────────────────────

  const handleAdherenceChange = useCallback(async (medId: string, date: string, taken: boolean) => {
    if (!selectedId) return;
    try {
      const ref = doc(db, "patients", selectedId, "adherence", medId);
      const snap = await getDoc(ref);
      const log = snap.exists() ? snap.data().log || {} : {};
      log[date] = taken;
      await setDoc(ref, { log }, { merge: true });
    } catch (e) { console.error(e); }
  }, [selectedId]);

  const handleUpdateMed = useCallback(async (id: string, updates: Partial<Medication>) => {
    if (!selectedId) return;
    try {
      await updateDoc(doc(db, "patients", selectedId, "medications", id), updates);
      showToast("Medication updated");
    } catch (e) { showToast("Failed to update medication", "error"); }
  }, [selectedId]);

  const handleDeleteMed = useCallback(async (id: string) => {
    if (!selectedId) return;
    try {
      await deleteDoc(doc(db, "patients", selectedId, "medications", id));
      showToast("Medication deleted");
    } catch (e) { showToast("Failed to delete", "error"); }
  }, [selectedId]);

  const handleAddMed = useCallback(async () => {
    if (!selectedId) return;
    try {
      await addDoc(collection(db, "patients", selectedId, "medications"), {
        medication: "Metformin", dose: "500", unit: "mg", frequency: "BD",
        status: "active", startDate: new Date().toLocaleDateString("en-CA"),
        route: "Oral", drugClass: "Biguanide", active: true,
      });
      showToast("Metformin 500mg BD added");
    } catch (e) { showToast("Failed to add", "error"); }
  }, [selectedId]);

  const handleUpdateComplications = useCallback(async (c: Complication[]) => {
    if (!selectedId) return;
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(query(collection(db, "patients", selectedId, "complications")));
      existing.docs.forEach(d => batch.delete(d.ref));
      c.filter(c2 => c2.date).forEach(c2 => batch.set(doc(collection(db, "patients", selectedId, "complications")), c2));
      await batch.commit();
      setComplications(c);
      showToast("Complications updated");
    } catch (e) { showToast("Failed to update", "error"); }
  }, [selectedId]);

  const handleUpdateLifestyle = useCallback(async (items: LifestyleItem[]) => {
    setLifestyle(items);
    if (!selectedId) return;
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(query(collection(db, "patients", selectedId, "lifestyle")));
      existing.docs.forEach(d => batch.delete(d.ref));
      items.forEach(item => batch.set(doc(collection(db, "patients", selectedId, "lifestyle")), item));
      await batch.commit();
    } catch (e) { console.error(e); }
  }, [selectedId]);

  const handleSendEducation = useCallback(async (topic: EducationTopic) => {
    if (!selectedId) return;
    try {
      await addDoc(collection(db, "patients", selectedId, "education"), { ...topic, sentAt: serverTimestamp() });
      setEducation(prev => [...prev, topic]);
      showToast(`"${topic.title}" sent to patient`);
    } catch (e) { showToast("Failed to send", "error"); }
  }, [selectedId]);

  const handleAddLab = useCallback(async (order: LabOrder) => {
    if (!selectedId) return;
    try { await addDoc(collection(db, "patients", selectedId, "labOrders"), { ...order, createdAt: serverTimestamp() }); showToast("Lab ordered"); }
    catch (e) { showToast("Failed", "error"); }
  }, [selectedId]);

  const handleSaveNote = useCallback(async (note: ClinicalNote) => {
    if (!selectedId) return;
    try {
      if (note.id) {
        await updateDoc(doc(db, "patients", selectedId, "clinicalNotes", note.id), { ...note, lastEditedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, "patients", selectedId, "clinicalNotes"), { ...note, createdAt: serverTimestamp(), doctorId: "doctor", doctorName: "Dr. Provider" });
      }
      showToast("Note saved");
    } catch (e) { showToast("Failed to save", "error"); }
  }, [selectedId]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!selectedId) return;
    try {
      await addDoc(collection(db, "patients", selectedId, "messages"), {
        from: "doctor", text, time: new Date().toISOString(),
        senderId: "doctor", senderName: "Dr. Provider", senderRole: "Endocrinologist",
        timestamp: serverTimestamp(), read: false, status: "sent",
      });
      showToast("Message sent");
    } catch (e) { showToast("Failed to send", "error"); }
  }, [selectedId]);

  const handleAddReferral = useCallback(async (r: LabOrder) => {
    if (!selectedId) return;
    try { await addDoc(collection(db, "patients", selectedId, "referrals"), { ...r, createdAt: serverTimestamp() }); showToast("Referral submitted"); }
    catch (e) { showToast("Failed", "error"); }
  }, [selectedId]);

  const currentAlerts = useMemo(() => {
    if (!selectedId) return [];
    return generateClinicalAlerts(glucoseReadings, hba1cReadings, medications, medications.filter(m => m.status === "active").length > 0 ? 80 : 100, labOrders, footExams);
  }, [glucoseReadings, hba1cReadings, medications, labOrders, footExams, selectedId]);

  return <div className="dm-root">
    <style>{GLOBAL_CSS}</style>
    <div className="dm-panels">
      <PatientPicker patients={patients} selectedId={selectedId} onSelect={setSelectedId}
        search={search} onSearchChange={setSearch} loading={patientsLoading} />
      {selectedId ? <PatientPanel patientId={selectedId} patient={patient}
        glucoseReadings={glucoseReadings} hba1cReadings={hba1cReadings}
        medications={medications} adherence={adherence}
        alerts={currentAlerts} complications={complications}
        lifestyle={lifestyle} education={education}
        labOrders={labOrders} clinicalNotes={clinicalNotes}
        timelineEvents={timelineEvents} messages={messages}
        referrals={referrals} footExams={footExams}
        glucoseLoading={glucoseLoading} hba1cLoading={hba1cLoading}
        onAdherenceChange={handleAdherenceChange}
        onUpdateMed={handleUpdateMed} onDeleteMed={handleDeleteMed} onAddMed={handleAddMed}
        onUpdateComplications={handleUpdateComplications}
        onUpdateLifestyle={handleUpdateLifestyle}
        onSendEducation={handleSendEducation}
        onAddLab={handleAddLab} onSaveNote={handleSaveNote}
        onSendMessage={handleSendMessage} onAddReferral={handleAddReferral} />
        : <div className="dm-patient-panel" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="dm-empty">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width={64} height={64}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>Select a patient to begin</p>
            <p style={{ fontSize: 13, color: T.textMuted }}>Choose from the diabetes registry on the left</p>
          </div>
        </div>}
    </div>
    {toast && <div className={`dm-toast dm-toast-${toast.type}`}>{toast.msg}</div>}
  </div>;
}
