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

interface ARTPharmaEntry {
  drugClass: string; mechanism: string; standardDose: string; unit: string;
  commonDoses: string[]; routes: string[]; indications: string[];
  contraindications: string[]; warnings: string[]; sideEffects: string[];
  patientInstructions: string; monitoring: string[]; interactions: string[];
  pregnancyCategory: string; renalDose?: string; hepaticDose?: string;
  color: string; tlColor: string; fdc?: string;
}

export const PHARMA_DB: Record<string, ARTPharmaEntry> = {
  "TDF": {
    drugClass: "NRTI",
    mechanism: "Nucleotide reverse transcriptase inhibitor — competes with dATP → chain termination of HIV proviral DNA. Prodrug: tenofovir diphosphate.",
    standardDose: "300mg", unit: "mg", commonDoses: ["300"], routes: ["Oral"],
    indications: ["HIV-1 first-line backbone","HBsAg+ (active against HBV)","PrEP (TDF/FTC)"],
    contraindications: ["CrCl <50 mL/min (use TAF)","Hypersensitivity"],
    warnings: ["Renal toxicity (Fanconi syndrome, proximal tubulopathy) — monitor CrCl, phosphate, urine glucose","Bone mineral density loss — osteopenia/osteoporosis risk","Nephrotoxic drug combinations (NSAIDs, aminoglycosides, cotrimoxazole high dose)","Do not co-administer with TAF","Lactic acidosis/hepatic steatosis (rare class effect)"],
    sideEffects: ["Nausea/diarrhea (common first 4 weeks)","Renal impairment","Decreased BMD","Headache","Flatulence","Fatigue","Fanconi syndrome (rare)"],
    patientInstructions: "Take one tablet ONCE DAILY with or without food. Stay well hydrated. Report any bone pain, reduced urine output, or persistent nausea. Regular kidney function and phosphate monitoring required. Do not take with other tenofovir-containing medicines.",
    monitoring: ["CrCl/eGFR at baseline and every 3 months","Serum phosphate (3-monthly)","Urine dipstick for glucose/protein","BMD (DEXA) if risk factors","HBV serology (before starting)","HIV VL and CD4"],
    interactions: ["Didanosine — ↑ didanosine levels (dose reduction needed)","Nephrotoxic drugs — ↑ renal impairment","Atazanavir — ↓ atazanavir levels (boosted ATV + TDF)","Lopinavir/ritonavir — ↑ TDF levels","Sofosbuvir/Ledipasvir (HCV) — ↑ tenofovir levels"],
    pregnancyCategory: "B — safe in pregnancy, preferred NRTI backbone in PMTCT",
    renalDose: "Avoid if CrCl <50; TAF preferred",
    color: "#2563eb", tlColor: "#3b82f6", fdc: "TDF/FTC/DTG, TDF/3TC/EFV, TDF/FTC/EFV, TDF/3TC/DTG",
  },
  "TAF": {
    drugClass: "NRTI",
    mechanism: "Prodrug — tenofovir alafenamide → tenofovir diphosphate in cells. Higher intracellular levels, 90% lower plasma tenofovir vs TDF → better renal/bone safety.",
    standardDose: "25mg", unit: "mg", commonDoses: ["25","10"], routes: ["Oral"],
    indications: ["HIV-1 (preferred over TDF for renal/bone safety)","HBsAg+ (active against HBV)","If eGFR ≥15 (vs TDF eGFR ≥50)"],
    contraindications: ["CrCl <15 mL/min (not on dialysis)","Hypersensitivity"],
    warnings: ["Lactic acidosis/hepatic steatosis","HBV exacerbation if discontinued","Renal monitoring still required (though less than TDF)","Not interchangeable with TDF 1:1 (different dosing)"],
    sideEffects: ["Nausea","Headache","Fatigue","Diarrhea","Decreased BMD (less than TDF)","Renal effects (lower risk than TDF)"],
    patientInstructions: "Take ONCE DAILY with food (improves absorption). Stay hydrated. Report persistent vomiting, abdominal pain, or decreased urination. Do not take with TDF.",
    monitoring: ["CrCl/eGFR at baseline then 3–6 monthly","LFTs","HIV VL and CD4","Urine glucose/protein"],
    interactions: ["Rifampicin — ↓ TAF levels (avoid combination)","Carbamazepine, phenytoin, St John's Wort — ↓ TAF","NS5A/B HCV drugs — monitor TAF levels","Hormonal contraceptives — no interaction (safe)"],
    pregnancyCategory: "B — limited data but safe; WHO prefers TDF in pregnancy due to more data",
    renalDose: "CrCl ≥15: 25mg OD; CrCl <15 (not on HD): not recommended",
    color: "#7c3aed", tlColor: "#8b5cf6", fdc: "TAF/FTC/BIC (Biktarvy), TAF/FTC/RPV (Odefsey), TAF/FTC/EVG/c",
  },
  "FTC": {
    drugClass: "NRTI (cytidine analogue)",
    mechanism: "Competitive inhibitor of reverse transcriptase — chain termination. Long intracellular half-life >10h. Active against HIV-1 and HBV.",
    standardDose: "200mg", unit: "mg", commonDoses: ["200"], routes: ["Oral"],
    indications: ["HIV-1 (with TDF or TAF backbone)","HBsAg+ (active against HBV)","PrEP (co-formulated)","Part of single-tablet regimens"],
    contraindications: ["Hypersensitivity"],
    warnings: ["Packed with TDF/TAF in FDC — check dose equivalency","Lactic acidosis/hepatic steatosis","HBV exacerbation if stopped","Pancreatitis (rare)"],
    sideEffects: ["Headache","Nausea","Diarrhea","Hyperpigmentation (palms/soles — benign)","Fatigue","Insomnia"],
    patientInstructions: "Take 200 mg ONCE DAILY with or without food. FTC is almost always co-formulated (TDF/FTC or TAF/FTC). Do not take with 3TC (same class).",
    monitoring: ["HIV VL","CD4","CrCl (especially with TDF)","LFTs"],
    interactions: ["Lamivudine (3TC) — do not combine (same resistance profile)","Ribavirin — may antagonize (in vitro)"],
    pregnancyCategory: "B — safe in pregnancy, PMTCT compatible",
    renalDose: "CrCl 30–49: 200mg q48h; CrCl 15–29: 200mg q72h",
    color: "#059669", tlColor: "#10b981",
  },
  "3TC": {
    drugClass: "NRTI (cytidine analogue)",
    mechanism: "Similar to FTC — chain termination of reverse transcriptase. Well tolerated, widely available, low cost.",
    standardDose: "300mg OD or 150mg BD", unit: "mg", commonDoses: ["150","300"], routes: ["Oral"],
    indications: ["HIV-1 (first-line alternative backbone)","HBsAg+ (active against HBV)","Part of TDF/3TC/DTG (TLD) — WHO preferred first-line"],
    contraindications: ["Hypersensitivity"],
    warnings: ["Do NOT combine with FTC (same class/same resistance)","Lactic acidosis (class effect)","HBV flare if discontinued","Pancreatitis (particularly in pediatric patients)"],
    sideEffects: ["Nausea","Fatigue","Headache","Diarrhea","Nasal congestion","Pancreatitis (children)"],
    patientInstructions: "Take 300mg ONCE DAILY or 150mg TWICE DAILY. Well tolerated. Take with or without food. Inform your doctor if you have hepatitis B (risk of flare on stopping).",
    monitoring: ["HIV VL","CD4","LFTs","HBV serology"],
    interactions: ["FTC — do NOT combine (redundant, same resistance profile)","Trimethoprim — may ↑ 3TC levels (not clinically significant)"],
    pregnancyCategory: "B — safe, PMTCT compatible",
    renalDose: "CrCl 30–49: 150mg OD; CrCl 15–29: 150mg ×1 then 100mg OD; CrCl 5–14: 150mg ×1 then 50mg OD; HD: 25–50mg OD",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "ABC": {
    drugClass: "NRTI (guanosine analogue)",
    mechanism: "Carbovir triphosphate — competes with dGTP → chain termination. Good CNS penetration.",
    standardDose: "300mg BD or 600mg OD", unit: "mg", commonDoses: ["300","600"], routes: ["Oral"],
    indications: ["HIV-1 (alternative NRTI — not first-line per WHO)","High CV risk requires caution","CNS HIV (good CSF penetration)"],
    contraindications: ["⚠️ HLA-B*5701 positive (ABSOLUTE — hypersensitivity risk, potentially fatal)","High CV risk (if alternatives available)"],
    warnings: ["⚠️ MANDATORY HLA-B*5701 screening before initiation — can cause life-threatening hypersensitivity (5–8% if HLA+)","Hypersensitivity: fever, rash, GI symptoms, SOB, difficulty swallowing — do NOT rechallenge","Increased MI risk in patients with high CV risk (D:A:D study)","Lactic acidosis"],
    sideEffects: ["Hypersensitivity reaction (if HLA-B*5701+) — STOP immediately, never rechallenge","Nausea","Headache","Fatigue","Rash","Fever","CV risk (controversial — >10% 10-year risk: avoid)"],
    patientInstructions: "⚠️ You MUST have a genetic test (HLA-B*5701) BEFORE starting this medicine. If you develop fever, rash, nausea, vomiting, abdominal pain, or extreme tiredness — STOP taking this medicine immediately and call your doctor. NEVER restart abacavir after a hypersensitivity reaction — it may be life-threatening.",
    monitoring: ["⚠️ HLA-B*5701 (MANDATORY before start)","HIV VL and CD4","CV risk assessment","LFTs","Lipid profile"],
    interactions: ["Ribavirin — may antagonize","Methadone — ↑ abc clearance (may need dose ↑)","Ethanol — ↓ abc levels (minor)"],
    pregnancyCategory: "C — limited data; avoid in pregnancy if alternatives available",
    renalDose: "No dose adjustment (hepatically cleared, not renal)",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "AZT": {
    drugClass: "NRTI (thymidine analogue)",
    mechanism: "AZT-triphosphate — chain termination. First antiretroviral ever approved (1987). Now less used due to toxicity.",
    standardDose: "300mg BD", unit: "mg", commonDoses: ["300"], routes: ["Oral","IV"],
    indications: ["HIV-1 (third-line/legacy)","Prevention of MTCT (IV during labor)","HIV+ needlestick PEP (alternative)"],
    contraindications: ["Hb <7.5 g/dL","ANC <750 cells/mm³","Hypersensitivity"],
    warnings: ["⚠️ Bone marrow suppression: anemia, neutropenia — mandatory CBC monitoring","Lipoatrophy (peripheral fat loss)","Lactic acidosis with hepatic steatosis (more common than other NRTIs)","Myopathy (after prolonged use)","Hair and nail pigmentation"],
    sideEffects: ["Anemia (common)","Neutropenia","Nausea/vomiting","Headache","Malaise/fatigue","Lipoatrophy","Myopathy","Nail/hyperpigmentation"],
    patientInstructions: "Take 300mg TWICE DAILY with food to reduce nausea. This medicine can cause anemia — report severe fatigue, paleness, or shortness of breath. Regular blood tests are mandatory. May cause fat loss from face, arms, and legs (lipoatrophy). Not used as first-line in most settings.",
    monitoring: ["⚠️ CBC with differential (baseline, 2 weeks, monthly ×3, then 3-monthly)","LFTs","HIV VL and CD4","Lipid profile"],
    interactions: ["Ribavirin — ↑ anemia risk (avoid in HCV/HIV)","Stavudine (d4T) — avoid (antagonistic)","Probenecid — ↑ AZT levels","Rifampicin — ↓ AZT levels","Ganciclovir/valganciclovir — ↑ myelosuppression"],
    pregnancyCategory: "C — extensive safety data in pregnancy (legacy PMTCT), but TDF now preferred",
    renalDose: "CrCl 15–59: 300mg OD; CrCl <15: 300mg q12h (avoid if possible)",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "DTG": {
    drugClass: "INSTI (integrase strand transfer inhibitor)",
    mechanism: "Binds integrase active site → blocks strand transfer step of HIV DNA integration into host genome. High genetic barrier to resistance.",
    standardDose: "50mg OD", unit: "mg", commonDoses: ["50"], routes: ["Oral"],
    indications: ["⭐ HIV-1 first-line (WHO preferred) — TDF/3TC/DTG or TAF/FTC/DTG","Switch therapy (high barrier)","NNRTI failure salvage"],
    contraindications: ["Hypersensitivity"],
    warnings: ["⚠️ Neural tube defects (NTD) — first 6 weeks of pregnancy: small increased risk (0.3% vs 0.1% background). WHO still recommends DTG in pregnancy (benefits outweigh risks)","INSIGHT: (INSTI) central nervous system side effects — insomnia, headache, dizziness","Weight gain (more than other INSTIs — especially in Black women)","Drug interaction with rifampicin (double dose to 50mg BD for 2 weeks after rifampicin initiation)","Hypersensitivity (rare — fever, rash, hepatic)"],
    sideEffects: ["Insomnia (common 3–5%)","Headache","Dizziness","Nausea","Diarrhea","Weight gain (moderate)","Anxiety","AST/ALT elevation"],
    patientInstructions: "Take 50mg ONCE DAILY with or without food. If you are pregnant or planning pregnancy, discuss with your doctor — DTG is still recommended as first-line per WHO. May cause trouble sleeping — take in the morning if this happens. Report mood changes, severe headache, or jaundice. If on rifampicin (TB treatment), dose increases to 50mg TWICE DAILY.",
    monitoring: ["HIV VL and CD4","Weight/BMI","Blood glucose (if significant weight gain)","LFTs if symptoms","Pregnancy test (if planning)"],
    interactions: ["⚠️ Rifampicin — DTG 50mg BD during + 2wks after rifampicin","⚠️ Polyvalent cations (Ca, Fe, Mg, Al) — separate by 2h (antacids, supplements)","Carbamazepine, phenytoin, phenobarbital — ↓ DTG levels","Metformin — ↑ metformin levels (monitor)","St John's Wort — avoid"],
    pregnancyCategory: "B — DTG recommended by WHO as first-line regardless of pregnancy status (benefit > NTD risk)",
    renalDose: "No dose adjustment needed",
    hepaticDose: "Child-Pugh B/C: use with caution",
    color: "#2563eb", tlColor: "#3b82f6", fdc: "TDF/3TC/DTG (TLD), TAF/FTC/DTG",
  },
  "EVGc": {
    drugClass: "INSTI (boosted with cobicistat)",
    mechanism: "Integrase strand transfer inhibitor. Requires pharmacokinetic boosting with cobicistat (CYP3A4 inhibitor).",
    standardDose: "150/150mg", unit: "mg", commonDoses: ["150"], routes: ["Oral"],
    indications: ["HIV-1 first-line (co-formulated only: EVG/c/FTC/TAF or EVG/c/FTC/TDF)"],
    contraindications: ["CrCl <30 (for TAF formulation)","CrCl <50 (for TDF formulation)","Hypersensitivity"],
    warnings: ["Requires boosting with cobicistat — many drug interactions","Cobicistat inhibits creatinine secretion → ↑ Cr (by 0.1–0.2) but eGFR by cystatin C is normal","Weight gain (less than DTG)","Lower genetic barrier than DTG — not preferred after failure","Do NOT combine with rifampicin"],
    sideEffects: ["Nausea","Diarrhea","Headache","↑ Cr (benign, does not reflect true renal function)","Weight gain","Fatigue"],
    patientInstructions: "Always taken as a single-tablet regimen (STR). Must be taken with FOOD (improves absorption). Do not take with St John's Wort. Tell your doctor all medicines you take (many interactions).",
    monitoring: ["HIV VL and CD4","Cr at baseline and 3 months","LFTs","Urine glucose"],
    interactions: ["Rifampicin — contraindicated","Carbamazepine, phenytoin, phenobarbital — avoid","Statins — ↓ statin dose (simvastatin/atorvastatin)","Sildenafil — max 25mg q48h","Hormonal contraceptives — ↓ levels (use alternative)"],
    pregnancyCategory: "B — limited data; DTG preferred in pregnancy",
    renalDose: "EVG/c/TAF/FTC: CrCl ≥30; EVG/c/TDF/FTC: CrCl ≥50",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "RAL": {
    drugClass: "INSTI (first-in-class)",
    mechanism: "Integrase strand transfer inhibitor — first INSTI approved (2007). Low genetic barrier relative to DTG/BIC.",
    standardDose: "400mg BD", unit: "mg", commonDoses: ["400"], routes: ["Oral"],
    indications: ["HIV-1 first-line (alternative)","Pregnancy (extensive safety data)","Post-exposure prophylaxis (PEP)","Switch therapy"],
    contraindications: ["Hypersensitivity"],
    warnings: ["Lower genetic barrier than DTG — resistance possible with incomplete adherence","Twice-daily dosing — adherence challenge vs OD INSTIs","CNS side effects (less than DTG)","Rash — mild, self-limited","CPK elevation (rare)"],
    sideEffects: ["Nausea","Headache","Diarrhea","Insomnia","Fatigue","Rash","CPK elevation"],
    patientInstructions: "Take 400mg TWICE DAILY — morning and evening. Missed doses lead to resistance more quickly. May be taken with or without food. Use a pillbox or timer to remember twice-daily dosing.",
    monitoring: ["HIV VL and CD4","Lipid profile","CPK if muscle symptoms","LFTs"],
    interactions: ["Rifampicin — RAL 800mg BD (double dose)","Carbamazepine, phenytoin — ↓ RAL levels","Antacids — separate by 2h","Tipranavir/ritonavir — ↓ RAL levels"],
    pregnancyCategory: "B — extensive safety data; preferred INSTI in pregnancy before DTG data",
    renalDose: "No dose adjustment",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "BIC": {
    drugClass: "INSTI",
    mechanism: "Integrase strand transfer inhibitor — highest genetic barrier among INSTIs. Co-formulated only as Biktarvy (BIC/TAF/FTC).",
    standardDose: "50mg (co-formulated)", unit: "mg", commonDoses: ["50"], routes: ["Oral"],
    indications: ["HIV-1 first-line (single-tablet Biktarvy)","Switch to single-tablet regimen"],
    contraindications: ["CrCl <30 (TAF component)","Hypersensitivity"],
    warnings: ["Co-formulated only — cannot adjust individual components","Weight gain (moderate, similar to DTG)","BIC does NOT require boosting (unlike EVG)","Limited data in pregnancy","Headache/insomnia"],
    sideEffects: ["Headache","Nausea","Diarrhea","Weight gain","Insomnia","Fatigue"],
    patientInstructions: "Take ONE tablet ONCE DAILY with or without food. Biktarvy is a complete regimen — no other ARVs needed. Tell your doctor about all medicines. Do not take with rifampicin or St John's Wort.",
    monitoring: ["HIV VL and CD4","CrCl","LFTs","Weight"],
    interactions: ["Rifampicin — avoid (↓ BIC 75%)","Carbamazepine, phenytoin — ↓ BIC","Polyvalent cations (Ca, Fe, Mg) — separate by 2h","Metformin — ↑ metformin","St John's Wort — avoid"],
    pregnancyCategory: "B — limited data; DTG preferred if pregnancy is planned",
    renalDose: "CrCl ≥30: standard; CrCl <30: not recommended",
    color: "#059669", tlColor: "#10b981",
  },
  "CAB": {
    drugClass: "INSTI (long-acting injectable)",
    mechanism: "Integrase strand transfer inhibitor — formulated as nanocrystal suspension for IM injection. Long t½ ~40 days.",
    standardDose: "600mg IM + 600mg RPV IM monthly or 400mg IM + 600mg RPV IM bi-monthly", unit: "mg", commonDoses: ["400","600"], routes: ["IM"],
    indications: ["HIV-1 maintenance (VL <50 copies/mL, no resistance) — switch from oral","Long-acting option for adherence challenges"],
    contraindications: ["Known INSTI resistance","Prior CAB/RPV failure","Hypersensitivity"],
    warnings: ["⚠️ Must be administered by healthcare professional — cannot be self-administered","Injection site reactions (pain, nodules) very common","Requires oral lead-in (CAB 30mg + RPV 25mg for 4 weeks) to confirm tolerability","Resistance risk if doses are missed (long tail — injectable levels decline slowly)","Not for first-line initiation (maintenance only)"],
    sideEffects: ["Injection site pain/swelling/nodules (84%)","Pyrexia","Fatigue","Headache","Nausea","Hepatotoxicity (rare)"],
    patientInstructions: "This is a long-acting injectable — you will come to clinic every 1 or 2 months for injections. Do not miss appointments. If you miss a scheduled injection, you may need oral bridging therapy. Report injection site problems or fever.",
    monitoring: ["HIV VL monthly ×3 then 3-monthly","Injection site inspection","LFTs","HBsAg","Pregnancy test if applicable"],
    interactions: ["Rifampicin — avoid (↓ CAB/RPV levels)","Carbamazepine, phenytoin — avoid","PPIs — avoid with oral RPV lead-in"],
    pregnancyCategory: "B — limited data; switch to oral regimen if pregnant",
    renalDose: "No dose adjustment needed",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "EFV": {
    drugClass: "NNRTI",
    mechanism: "Non-competitive inhibitor of reverse transcriptase — binds hydrophobic pocket near active site. Long t½ 40–55h.",
    standardDose: "600mg OD (400mg OD preferred for better tolerability)", unit: "mg", commonDoses: ["400","600"], routes: ["Oral"],
    indications: ["HIV-1 first-line (legacy — still used in resource-limited settings)","Part of TDF/FTC/EFV or TDF/3TC/EFV FDC"],
    contraindications: ["⚠️ Pregnancy (1st trimester — teratogenic: neural tube defects)","History of severe psychiatric illness","Hypersensitivity"],
    warnings: ["⚠️ TERATOGENIC — avoid in 1st trimester / women planning pregnancy without reliable contraception","CNS side effects: vivid dreams, dizziness, impaired concentration, drowsiness — improve in 2–4 weeks","Psychiatric: depression, suicidal ideation","Rash (NNRTI class) — mild self-limited","↑ LFTs — hepatotoxicity","False positive urine cannabinoid test","Lipodystrophy"],
    sideEffects: ["CNS (common): dizziness, insomnia, abnormal dreams, confusion (improves)","Rash","Nausea","Fatigue","↑ LFTs","Gynecomastia","Hyperlipidemia","Psychiatric effects"],
    patientInstructions: "Take ONCE DAILY ON AN EMPTY STOMACH (high-fat meal increases drug levels and side effects). Best taken AT BEDTIME to reduce CNS side effects (dizziness, disturbing dreams). These side effects usually improve in 2–4 weeks. Avoid in pregnancy. Use reliable contraception. Do not drive until you know how EFV affects you.",
    monitoring: ["HIV VL and CD4","LFTs at baseline, 4 weeks, then 3-monthly","Lipid profile","Pregnancy test (women of childbearing age)","Mental health screening"],
    interactions: ["⚠️ Rifampicin — EFV 600mg OD (boost)","Carbamazepine, phenytoin — ↓ EFV","St John's Wort — avoid","Methadone — may need ↑ dose","Oral contraceptives — use additional method","Voriconazole — ↓ voriconazole (avoid)","Artemether/lumefantrine (antimalarial) — ↓ levels"],
    pregnancyCategory: "D — TERATOGENIC 1st trimester (neural tube defects). Avoid in women planning pregnancy. DTG is safer.",
    renalDose: "No dose adjustment needed",
    color: "#ea580c", tlColor: "#f97316",
  },
  "NVP": {
    drugClass: "NNRTI",
    mechanism: "Non-competitive NNRTI — binds reverse transcriptase. Widely available, low cost. Used in PMTCT historically.",
    standardDose: "200mg OD ×14 days → 200mg BD", unit: "mg", commonDoses: ["200"], routes: ["Oral"],
    indications: ["HIV-1 (alternative first-line in resource-limited — less preferred now)","PMTCT (single-dose — legacy)"],
    contraindications: ["⚠️ Severe hepatic impairment","Baseline AST/ALT >5× ULN","Hypersensitivity","Men with CD4 >400, women with CD4 >250 (↑ hepatotoxicity risk)"],
    warnings: ["⚠️ Hepatotoxicity — can be severe/fatal. 14-day lead-in at 200mg OD essential. Mandatory LFT monitoring.","Rash — mild (self-limited in 2–3 weeks) vs SJS/TEN (rare, 0.3%) — STOP if severe","Risk of SJS/TEN — highest in first 6 weeks","CD4 threshold: ↑ risk hepatotoxicity if CD4 >250 (women) or >400 (men) — avoid if possible"],
    sideEffects: ["Rash (17% — common in first 6 weeks)","↑ LFTs/hepatotoxicity","Nausea","Fatigue","Headache","SJS/TEN (rare, 0.3%)"],
    patientInstructions: "Start with 200mg ONCE DAILY for the first 14 days (lead-in dose), then increase to TWICE DAILY. Take with or without food. Report any rash (especially if fever/blisters), jaundice, or dark urine immediately — these may be signs of a serious reaction. Regular blood tests required.",
    monitoring: ["⚠️ LFTs at baseline, 2 weeks, 4 weeks, then monthly ×3, then 3-monthly","Rash monitoring (first 6 weeks critical)","HIV VL and CD4"],
    interactions: ["Rifampicin — avoid (↓ NVP; ↑ hepatotoxicity)","Ketoconazole, fluconazole — ↑ NVP levels","Oral contraceptives — ↓ efficacy","Methadone — ↓ methadone (withdrawal)","Protease inhibitors — ↓ PI levels"],
    pregnancyCategory: "B — extensive PMTCT safety data; but DTG/TDF preferred now",
    renalDose: "No adjustment (hepatic clearance). HD: no supplement needed",
    color: "#c2410c", tlColor: "#ea580c",
  },
  "RPV": {
    drugClass: "NNRTI (2nd generation)",
    mechanism: "Diarylpyrimidine NNRTI — flexible binding to RT pocket. Active against some NNRTI-resistant strains.",
    standardDose: "25mg OD", unit: "mg", commonDoses: ["25"], routes: ["Oral"],
    indications: ["HIV-1 first-line (only with VL <100,000 and CD4 >200 at initiation)","Switch to STR (TAF/FTC/RPV — Odefsey)","Part of CAB/RPV long-acting injectable maintenance"],
    contraindications: ["⚠️ HIV VL >100,000 copies/mL at initiation (↑ risk of failure)","CD4 <200 at initiation (↓ efficacy)","Hypersensitivity","Co-administration with PPIs"],
    warnings: ["⚠️ MUST be taken WITH A FULL MEAL (↑ absorption 50% vs fasting)","VL >100,000: DO NOT USE as first-line — higher failure rate","PPIs contraindicated (↓ RPV absorption by 40%)","H2 antagonists — separate by 12h","Antacids — separate by 2h","QTc prolongation (dose-related, mild)"],
    sideEffects: ["Headache","Nausea","Insomnia","Depression","Dizziness","↑ LFTs (mild)","QTc prolongation (clinically insignificant at 25mg)"],
    patientInstructions: "Take 25mg ONCE DAILY WITH A FULL MEAL (at least 390 kcal) — absorption requires food. Do NOT take with acid-reducing medicines (omeprazole, esomeprazole — these reduce RPV absorption). Report persistent headache, mood changes, or irregular heartbeat.",
    monitoring: ["HIV VL (baseline must be <100,000)","CD4","LFTs","ECG if risk factors for QTc"],
    interactions: ["⚠️ PPIs (omeprazole, pantoprazole) — CONTRAINDICATED","H2 blockers (ranitidine, famotidine) — take 12h apart","Antacids — separate by 2h","Rifampicin, carbamazepine, phenytoin — avoid","St John's Wort — avoid"],
    pregnancyCategory: "B — limited data; DTG preferred",
    renalDose: "No dose adjustment needed",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "DOR": {
    drugClass: "NNRTI (2nd generation)",
    mechanism: "Next-generation NNRTI — binds RT with unique flexibility. Better metabolic and tolerability profile vs EFV.",
    standardDose: "100mg OD", unit: "mg", commonDoses: ["100"], routes: ["Oral"],
    indications: ["HIV-1 (newer option — good tolerability)","Switch from EFV (better CNS profile)"],
    contraindications: ["Hypersensitivity","Co-administration with strong CYP3A inducers"],
    warnings: ["Less data in pregnancy","Fewer drug interactions than EFV","No food restriction (take with or without food)","Better CNS profile — less dizziness, fewer abnormal dreams","Lower lipid impact than EFV"],
    sideEffects: ["Headache","Nausea","Diarrhea","Dizziness","Insomnia","Abnormal dreams (less than EFV)","Rash (mild)"],
    patientInstructions: "Take 100mg ONCE DAILY with or without food. Better tolerated than efavirenz (less dizziness and nightmares). Tell your doctor before taking other medications.",
    monitoring: ["HIV VL and CD4","LFTs","Lipid profile"],
    interactions: ["Rifampicin — ↓ DOR (avoid)","Carbamazepine, phenytoin — avoid","St John's Wort — avoid","Antacids — separate by 2h"],
    pregnancyCategory: "B — limited data",
    renalDose: "No dose adjustment needed",
    hepaticDose: "Child-Pugh: no adjustment needed",
    color: "#059669", tlColor: "#34d399",
  },
  "ETR": {
    drugClass: "NNRTI (2nd generation)",
    mechanism: "Diarylpyrimidine — flexible binding to RT; active against most NNRTI-resistant strains (including K103N, Y181C).",
    standardDose: "200mg BD", unit: "mg", commonDoses: ["200"], routes: ["Oral"],
    indications: ["HIV-1 (second-line after NNRTI failure)","NNRTI resistance salvage"],
    contraindications: ["Hypersensitivity","Severe hepatic impairment"],
    warnings: ["Twice-daily dosing","Rash (common first 2 weeks, usually self-limited)","SJS/TEN (rare)","Hepatotoxicity","Complex drug interaction profile (CYP3A4 inducer/substrate)","Must be taken with food"],
    sideEffects: ["Rash (16% — first 2 weeks)","Nausea","Diarrhea","Headache","Peripheral neuropathy","↑ LFTs","Hyperlipidemia (mild)"],
    patientInstructions: "Take 200mg TWICE DAILY WITH FOOD. Rash is common in the first 2 weeks — if mild, continue; if severe or with fever/blisters, stop and call immediately. Tell your doctor about all medicines — ETR has many drug interactions.",
    monitoring: ["HIV VL and CD4","LFTs","Rash monitoring","Lipid profile"],
    interactions: ["Rifampicin — avoid (↓ ETR 50%)","PI/r — use standard doses (atazanavir/r, darunavir/r)","EFV — ↓ ETR (avoid combination)","Statins — monitor (↓ atorvastatin)","Warfarin — monitor INR"],
    pregnancyCategory: "B — limited data",
    renalDose: "No dose adjustment needed",
    hepaticDose: "Child-Pugh B/C: avoid or reduce dose",
    color: "#7c3aed", tlColor: "#a855f7",
  },
  "LPVr": {
    drugClass: "Boosted Protease Inhibitor (PI/r)",
    mechanism: "Lopinavir inhibited by CYP3A4, boosted with ritonavir → high trough levels. Inhibits HIV-1 protease → prevents gag-pol cleavage → immature non-infectious virions.",
    standardDose: "400/100mg BD", unit: "mg", commonDoses: ["400/100"], routes: ["Oral"],
    indications: ["HIV-1 (legacy second-line — PI/r backbone)","Salvage therapy","HIV-2 (active, unlike NNRTIs)","PEP (alternative)"],
    contraindications: ["Hypersensitivity","Severe hepatic impairment","Concurrent CYP3A4 sensitive drugs"],
    warnings: ["GI intolerance (diarrhea, nausea — common)","Dyslipidemia (↑ TG, LDL)","PR interval prolongation — caution with AV block","Hepatotoxicity","Lipodystrophy","Pancreatitis (rare)","Many drug interactions (ritonavir is potent CYP3A4 inhibitor)"],
    sideEffects: ["Diarrhea (very common, 30%)","Nausea","Dyslipidemia (↑ TG, LDL)","Asthenia","Fatigue","Perioral paresthesia (ritonavir)","Lipodystrophy","Hepatotoxicity"],
    patientInstructions: "Take 400mg/100mg TWICE DAILY with food (improves absorption and reduces GI side effects). Diarrhea is very common — anti-diarrheals may help. LPV/r has many drug interactions — always check before starting new medicines. Regular lipid monitoring needed.",
    monitoring: ["HIV VL and CD4","Fasting lipid profile (↑ TG, LDL)","LFTs","Blood glucose","ECG (PR interval)"],
    interactions: ["⚠️ Many — LPV/r is a CYP inhibitor AND substrate","Rifampicin — dose adjust to LPV/r 800/200mg BD","Sildenafil — max 25mg q48h","Statins — avoid simvastatin/lovastatin (↑ risk rhabdomyolysis)","Hormonal contraceptives — ↓ efficacy (use alternative)","Antacids — separate by 2h"],
    pregnancyCategory: "C — safety data available; DTG/TDF preferred",
    renalDose: "No dose adjustment",
    hepaticDose: "Child-Pugh B/C: ↓ dose or avoid",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "ATVr": {
    drugClass: "Boosted Protease Inhibitor (PI/r)",
    mechanism: "Azapeptide PI — inhibits HIV protease. Boosted with ritonavir. Distinct from LPV/r: once-daily dosing, better GI profile.",
    standardDose: "300/100mg OD", unit: "mg", commonDoses: ["300/100"], routes: ["Oral"],
    indications: ["HIV-1 (second-line PI)","HIV-2 (active)","Salvage therapy (if PI-sensitive)"],
    contraindications: ["Hypersensitivity","Severe hepatic impairment","Neonatal period (<3 months, kernicterus risk)","Concurrent TDF + H2 blocker or PPI"],
    warnings: ["⚠️ Hyperbilirubinemia (unconjugated, benign) — 30–40% get scleral icterus/jaundice. Reassure patient it is harmless (Gilbert-like). May cause cosmetic concern → switch if unacceptable.","PR interval prolongation — AV block risk","Nephrolithiasis (rare, 1%)","Cholelithiasis","Hepatotoxicity","GI intolerance less than LPV/r"],
    sideEffects: ["Hyperbilirubinemia/jaundice (30–40%, benign)","Nausea","Diarrhea","↑ LFTs","Rash","Nephrolithiasis","PR prolongation"],
    patientInstructions: "Take 300mg/100mg ONCE DAILY WITH FOOD (improves absorption). You may develop yellowing of the eyes or skin — this is harmless (not liver damage) but can be cosmetically bothersome. Tell your doctor if it bothers you. Stay well hydrated to reduce kidney stone risk.",
    monitoring: ["Bilirubin (unconjugated — expect elevation, reassure)","HIV VL and CD4","LFTs","ECG (PR interval)","Urine if flank pain (stones)"],
    interactions: ["⚠️ PPIs — separate: PPI 12h before ATV/r (or avoid)","H2 blockers — separate by 10h","TDF — ↓ ATV levels (boosted ATV recommended with TDF)","Rifampicin — avoid","Sildenafil — max 25mg q48h","Statins — avoid simvastatin/lovastatin"],
    pregnancyCategory: "B — safety data; use if alternatives not available",
    renalDose: "No adjustment; TDF interaction ↓ ATV levels",
    hepaticDose: "Child-Pugh B: 300mg OD (unboosted) with caution; C: avoid",
    color: "#d97706", tlColor: "#fbbf24",
  },
  "DRVr": {
    drugClass: "Boosted Protease Inhibitor (PI/r)",
    mechanism: "Non-peptidic PI — highly potent, high resistance barrier. Requires boosting with ritonavir or cobicistat.",
    standardDose: "800/100mg OD or 600/100mg BD", unit: "mg", commonDoses: ["600/100","800/100"], routes: ["Oral"],
    indications: ["HIV-1 (second-line — preferred boosted PI per WHO)","PI-resistant strain salvage (high barrier)","HIV-2","OD dosing in treatment-naive; BD in PI-experienced"],
    contraindications: ["Hypersensitivity (sulfonamide moiety — caution with sulfa allergy)","Severe hepatic impairment"],
    warnings: ["⚠️ Hepatotoxicity (especially in HBV/HCV co-infection)","Hypersensitivity: rash (common >10%), SJS/TEN rare. Sulfa moiety — caution if severe sulfa allergy","Dyslipidemia (less than LPV/r but still significant)","GI: diarrhea, nausea","Pancreatitis (rare)","↑ Bleeding risk in hemophilia"],
    sideEffects: ["Diarrhea (common)","Nausea","Rash (10–15% — usually mild)","↑ LFTs","Dyslipidemia","Headache","Hepatotoxicity (monitor in co-infection)"],
    patientInstructions: "Take with FOOD (↑ absorption 30%). If first-time treatment: 800mg/100mg ONCE DAILY. If previous PI failure or resistance: 600mg/100mg TWICE DAILY. Slight sulfa component — rash possible but usually mild. Report fever, jaundice, or dark urine. Regular blood tests required.",
    monitoring: ["HIV VL and CD4","LFTs (especially in HBV/HCV co-infection)","Lipid profile","Blood glucose","Rash monitoring"],
    interactions: ["Rifampicin — DRV/r 600/100mg BD + rifampicin","Sildenafil — max 25mg q48h","Statins — avoid simvastatin/lovastatin (use rosuvastatin 10mg max)","Antacids — separate by 2h","Hormonal contraceptives — use alternative","Antiepileptics — ↓ DRV levels"],
    pregnancyCategory: "B — DRV/r 600/100mg BD in pregnancy (OD not adequate)",
    renalDose: "No dose adjustment needed",
    hepaticDose: "Child-Pugh B: use with caution; C: avoid",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "MVC": {
    drugClass: "CCR5 Antagonist (Entry Inhibitor)",
    mechanism: "Selectively binds CCR5 co-receptor → blocks HIV-1 entry into CD4 cells. Does NOT work with CXCR4-tropic or dual-tropic virus.",
    standardDose: "150mg BD, 300mg BD, or 600mg BD (dose depends on concomitant drugs)", unit: "mg", commonDoses: ["150","300","600"], routes: ["Oral"],
    indications: ["HIV-1 (salvage — only if CCR5-tropic confirmed)","Multi-drug resistant HIV"],
    contraindications: ["⚠️ CXCR4 or dual/mixed tropism (MUST confirm with tropism assay first)","Hypersensitivity","CrCl <30"],
    warnings: ["⚠️ MANDATORY tropism assay (Trofile or genotypic) before use — ineffective if CXCR4-tropic","Dose varies by interaction: → with CYP3A4 inhibitors (PI/r): 150mg BD → with CYP3A4 inducers (EFV, rifampicin): 600mg BD","Hepatotoxicity (rare, allergic)","Postural hypotension","↑ CV risk (theoretical, not confirmed)"],
    sideEffects: ["Cough","Fever","Upper respiratory infections","Rash","Abdominal pain","Postural hypotension","Headache"],
    patientInstructions: "Only for patients with CCR5-tropic HIV (requires special blood test). Dose varies based on your other HIV medicines — may be 150mg, 300mg, or 600mg TWICE DAILY. Report severe cough, fever, or jaundice. Take with or without food.",
    monitoring: ["Tropism assay (before start and if virologic failure)","HIV VL and CD4","LFTs","BP sitting/standing"],
    interactions: ["PI/r (CYP3A4 inhibitors) — MVC 150mg BD","EFV, rifampicin (CYP3A4 inducers) — MVC 600mg BD","Tipranavir/r — MVC 300mg BD","Carbamazepine, phenytoin — ↑ MVC dose"],
    pregnancyCategory: "B — limited human data; avoid unless necessary",
    renalDose: "CrCl 30–80: dose adjust based on interaction; CrCl <30: avoid",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "ENF": {
    drugClass: "Fusion Inhibitor (first-in-class)",
    mechanism: "Peptide (36 amino acids) that mimics HR2 domain of gp41 → prevents six-helix bundle formation → blocks fusion of HIV with host cell. SC injection only.",
    standardDose: "90mg SC BD", unit: "mg", commonDoses: ["90"], routes: ["SC"],
    indications: ["HIV-1 (salvage therapy — multi-drug resistant)","Last resort when other options exhausted"],
    contraindications: ["Hypersensitivity"],
    warnings: ["SC injection only — cannot be given orally or IV","Injection site reactions (98% — pain, erythema, nodule, induration) — rotate sites","Bacterial pneumonia (increased risk)","Hypersensitivity reaction (rare)","Expensive, not widely available in resource-limited settings"],
    sideEffects: ["Injection site reactions (pain, swelling, nodules — very common)","Peripheral neuropathy","Insomnia","Depression","Nausea","Bacterial pneumonia (↑ risk)"],
    patientInstructions: "Must be injected under the skin TWICE DAILY (90mg). Rotate injection sites: arm, thigh, abdomen. Injection site reactions (lumps, redness, pain) are very common — massage and warm compresses can help. Never skip doses. Dispose of syringes safely. Report severe injection reactions or fever/cough.",
    monitoring: ["HIV VL and CD4","Injection site inspection","CBC","LFTs","Lipid profile"],
    interactions: ["No significant drug interactions (not metabolized by CYP)","Take with or without other ARVs"],
    pregnancyCategory: "B — limited data",
    renalDose: "No dose adjustment",
    color: "#6d28d9", tlColor: "#7c3aed",
  },
};

export function getDrugInfo(name: string): ARTPharmaEntry | null {
  const key = Object.keys(PHARMA_DB).find(k => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().startsWith(k.toLowerCase()));
  return key ? PHARMA_DB[key] : null;
}

export interface ScientificAlert {
  id: string; severity: "critical"|"urgent"|"warning"|"info";
  category: string; title: string; detail: string;
  evidence: string; action: string; icon: string;
}

export interface HIVReading {
  id: string; viralLoad?: number; cd4?: number; cd4Percent?: number;
  recordedAt: Date; source: "lab"|"clinic"|"poc";
}

export interface HIVMedication {
  id: string; drug: string; medication?: string; dose: string; dosage?: string;
  unit: string; frequency: string; drugClass: string;
  status: "active"|"stopped"|"paused";
  startDate: string; endDate?: string; indication?: string; route?: string;
  instructions?: string; warnings?: string; refills?: number; duration?: string;
  notes?: string; changeHistory?: DoseChange[];
}

export interface DoseChange {
  date: string; changeType: "started"|"dose_increase"|"dose_decrease"|"stopped"|"paused"|"restarted";
  previousDose?: string; newDose?: string; changedBy: string; reason?: string;
}

export interface Alert { id: string; trigger: string; actions: string[]; createdAt: string; doctorNote?: string; category?: string; history: { date: string; message: string }[]; }

export interface Complication { name: string; date: string; }

export interface LifestyleItem { name: string; grade: "Good"|"Moderate"|"Poor"; updatedAt?: string; }

export interface LabOrder { name: string; result?: string; orderedAt?: string; type?: "lab"|"imaging"; status?: string; study?: string; modality?: string; bodyPart?: string; urgency?: string; }

export interface ClinicalNote {
  id?: string; date: string; cc?: string; hpi?: string; exam?: string;
  investigations?: string; assessment?: string; plan?: string;
  diagnoses?: string[]; followUps?: string[]; isLocked?: boolean;
  lastEditedAt?: string; doctorId?: string; doctorName?: string;
  visitType?: string; vitals?: Record<string, string>;
}

export interface PatientSummary {
  id: string; name: string; age?: number; sex?: string; email?: string;
  phone?: string; universalId?: string; diagnosis?: string; riskLevel?: string;
  lastVisit?: string; nextReview?: string;
  latestVL?: number; latestCD4?: number; latestAt?: Date; totalReadings: number;
}

export interface TimelineEvent { id: string; date: string; type: "visit"|"med"|"alert"|"reading"|"note"|"lab"; icon: string; title: string; detail?: string; }

export interface Message { id?: string; from: "doctor"|"patient"; senderId?: string; senderName?: string; senderRole?: string; time: string; text: string; read?: boolean; status?: string; threadId?: string; timestamp?: Date; }

export interface AdherenceMap { [medId: string]: { [date: string]: boolean }; }

export interface EducationTopic {
  id: string; title: string; content: string; keyPoints: string[];
  category: string; duration: string; sentAt?: string; acknowledged?: boolean;
}

export function generateClinicalAlerts(
  readings: HIVReading[],
  medications: HIVMedication[],
  adherencePct: number,
  labOrders: LabOrder[],
): ScientificAlert[] {
  const alerts: ScientificAlert[] = [];
  if (!readings.length) return alerts;

  const latest = readings.at(-1)!;
  const last6mo = readings.filter(r => { const d = new Date(); d.setMonth(d.getMonth()-6); return r.recordedAt >= d; });

  if (latest.viralLoad && latest.viralLoad > 1000) {
    alerts.push({ id: "vl_failure", severity: "critical", category: "Virologic Failure",
      title: "Virologic Failure: VL " + latest.viralLoad + " copies/mL",
      detail: "VL >1000 copies/mL after 6 months on ART. Confirm with repeat viral load in 1 month. Assess adherence, drug interactions, and resistance.",
      evidence: "WHO 2021: Virologic failure = VL ≥1000 copies/mL after ≥6 months of ART",
      action: "URGENT: Repeat VL in 1 month. Intensive adherence counseling. Assess for drug-drug interactions. If confirmed: genotype resistance testing and switch regimen.",
      icon: "🚨" });
  }
  if (latest.viralLoad && latest.viralLoad >= 50 && latest.viralLoad <= 999) {
    alerts.push({ id: "low_viremia", severity: "warning", category: "Low-Level Viremia",
      title: "Low-Level Viremia: " + latest.viralLoad + " copies/mL",
      detail: "VL 50–999 copies/mL — risk of subsequent virologic failure (increased 3–5×). Address adherence and drug interactions.",
      evidence: "WHO 2021: Low-level viremia = VL 50–999 copies/mL; associated with increased risk of failure and resistance",
      action: "Repeat VL in 3 months. Enhanced adherence counseling. Monitor VL closely (every 3 months). Check for drug interactions.",
      icon: "⚠️" });
  }
  if (latest.cd4 !== undefined && latest.cd4 < 200) {
    alerts.push({ id: "cd4_aids", severity: "critical", category: "AIDS-Defining",
      title: "CD4 <200 cells/µL (AIDS-defining): " + latest.cd4,
      detail: "CD4 <200 cells/µL — AIDS-defining. Patient at high risk for OIs (PCP, TB, cryptococcosis, toxoplasmosis).",
      evidence: "CDC: AIDS = CD4 <200 cells/µL or AIDS-defining OI regardless of CD4",
      action: "Start/continue OI prophylaxis: CTX (PCP/Toxo), INH (TB if TST/IGRA+ endemic), fluconazole if CrAg+. Urgent ART initiation. Check CrAg. Screen for TB symptoms.",
      icon: "🚨" });
  }
  if (latest.cd4 !== undefined && latest.cd4 >= 200 && latest.cd4 < 350) {
    alerts.push({ id: "cd4_low", severity: "urgent", category: "Low CD4",
      title: "CD4 " + latest.cd4 + " cells/µL - Below 350 threshold",
      detail: "CD4 200–350. Risk of OIs increases. Ensure CTX prophylaxis if CD4 <200. Optimize ART adherence.",
      evidence: "WHO: CD4 <350 = advanced HIV disease. Consider OI prophylaxis based on local guidelines.",
      action: "Check if on CTX (need if CD4 <200). Repeat CD4 in 3 months. Reinforce adherence. Screen for TB symptoms at every visit.",
      icon: "⚠️" });
  }
  if (readings.length >= 2) {
    const prev = readings.at(-2)!;
    if (prev.cd4 !== undefined && latest.cd4 !== undefined && latest.cd4 < prev.cd4) {
      alerts.push({ id: "cd4_decline", severity: "warning", category: "CD4 Decline",
        title: "CD4 declining: " + prev.cd4 + " -> " + latest.cd4 + " cells/µL",
        detail: "CD4 count is decreasing. May indicate incomplete viral suppression or poor adherence. Check viral load.",
        evidence: "WHO: CD4 decline in setting of ART should prompt adherence assessment and VL testing",
        action: "Check viral load. Assess adherence intensively. Review for OIs. Repeat CD4 in 3 months.",
        icon: "📉" });
    }
  }
  if (!medications.some(m => m.status === "active")) {
    alerts.push({ id: "no_art", severity: "critical", category: "Not on ART",
      title: "Not on Antiretroviral Therapy",
      detail: "Patient is not on any active ART. All HIV+ patients should be on ART regardless of CD4 count (WHO treat-all).",
      evidence: "WHO 2021: Treat-all — initiate ART in all people living with HIV regardless of CD4 or WHO stage",
      action: "Start ART immediately. Check baseline CD4, VL, Cr, LFTs, HBsAg, pregnancy test if applicable. WHO preferred first-line: TDF/3TC/DTG.",
      icon: "🚨" });
  }
  if (adherencePct < 95 && adherencePct > 0) {
    alerts.push({ id: "low_adherence", severity: "urgent", category: "ART Adherence",
      title: "Low ART Adherence: " + adherencePct + "% (Target: ≥95%)",
      detail: "Adherence below 95% threshold. Each 10% drop increases virologic failure risk. HIV requires near-perfect adherence.",
      evidence: "AIDS Clinical Trials Group (ACTG): Adherence <95% → ↑ risk of virologic failure and drug resistance",
      action: "Intensive adherence counseling. Assess barriers: side effects, stigma, forgetfulness, mental health, substance use. Consider pillbox, alarm, DOT, or long-acting CAB/RPV.",
      icon: "📅" });
  }
  const daysSinceLastVL = last6mo.length === 0 ? 999 : Math.floor((Date.now() - last6mo.at(-1)!.recordedAt.getTime()) / 86400000);
  if (daysSinceLastVL > 180) {
    alerts.push({ id: "no_vl_6mo", severity: "warning", category: "Monitoring Gap",
      title: "No Viral Load in Past 6 Months",
      detail: "WHO recommends viral load monitoring at 6 months and 12 months after ART initiation, then annually.",
      evidence: "WHO 2021: Routine VL monitoring is the standard of care for ART monitoring",
      action: "Order VL now. Schedule regular VL monitoring per WHO guidelines.",
      icon: "🔬" });
  }
  const activeMeds = medications.filter(m => m.status === "active");
  if (activeMeds.some(m => m.drug.toUpperCase().includes("DTG")) && activeMeds.some(m => m.drug.toUpperCase().includes("RIFAMPICIN") || m.drug.toUpperCase().includes("RIF"))) {
    alerts.push({ id: "dtg_rif", severity: "urgent", category: "Drug Interaction",
      title: "Drug Interaction: DTG + Rifampicin",
      detail: "Rifampicin reduces DTG levels by 50% (UGT1A1 induction). DTG must be dosed at 50mg BD.",
      evidence: "Dooley KE, et al. Clin Infect Dis 2013. DTG 50mg BD overcomes rifampicin induction.",
      action: "Ensure DTG is dosed 50mg TWICE DAILY while on rifampicin and for 2 weeks after rifampicin completion.",
      icon: "⚠️" });
  }
  if (activeMeds.some(m => m.drug.toUpperCase().includes("TDF")) && activeMeds.some(m => m.drug.toUpperCase().includes("ATV"))) {
    alerts.push({ id: "tdf_renal", severity: "warning", category: "Renal Toxicity Risk",
      title: "TDF + ATV/r — Increased Renal Risk",
      detail: "ATV/r increases tenofovir exposure (↑ renal toxicity risk). Monitor CrCl, phosphate, urine glucose regularly.",
      evidence: "ATV/r ↑ tenofovir AUC 37%. Higher risk of proximal tubulopathy and Fanconi syndrome.",
      action: "Monitor CrCl, phosphate, urine glucose at baseline and every 3 months. Consider switch to TAF if renal function worsening.",
      icon: "🧪" });
  }
  if (latest.viralLoad !== undefined && latest.viralLoad > 1000) {
    alerts.push({ id: "tb_screen", severity: "urgent", category: "TB Screening",
      title: "TB Screening Overdue — Perform Now",
      detail: "All HIV+ individuals should be screened for TB at every visit using the WHO 4-symptom screen.",
      evidence: "WHO: TB screening at every clinical encounter for PLHIV.",
      action: "Screen for: current cough, fever, night sweats, weight loss. If any positive: sputum Xpert MTB/RIF, CXR, LAM (if CD4 <100).",
      icon: "🫁" });
  }
  return alerts;
}
export const EDUCATION_TOPICS: EducationTopic[] = [
  { id: "hiv_basics", title: "Understanding HIV and ART", content: "HIV (Human Immunodeficiency Virus) attacks your immune system, specifically CD4 cells. ART (Antiretroviral Therapy) stops the virus from multiplying, allowing your immune system to recover. With effective ART, HIV is a manageable chronic condition.", keyPoints: ["HIV attacks CD4 cells","ART stops HIV from replicating — not a cure but highly effective","U=U: Undetectable = Untransmittable","With ART, life expectancy is nearly normal","HIV is a chronic condition — like diabetes or hypertension"], category: "Foundation", duration: "5 min" },
  { id: "adherence_u_u", title: "Why Adherence Matters (U=U Concept)", content: "Adherence means taking your ART exactly as prescribed, every day. The goal is to achieve and maintain an undetectable viral load (<50 copies/mL). U=U (Undetectable = Untransmittable) means that when your viral load is undetectable, you CANNOT transmit HIV to sexual partners.", keyPoints: ["≥95% adherence needed for sustained viral suppression","Missing doses → virus rebounds → resistance can develop","U=U: Undetectable viral load = zero risk of sexual transmission","U=U is backed by 20+ years of scientific evidence","Set alarms, use pill boxes, link to daily routine"], category: "Treatment", duration: "6 min" },
  { id: "how_art_works", title: "How ART Works", content: "ART uses a combination of drugs from different classes to block HIV at different stages of its life cycle. Each drug class attacks HIV differently — this is why combination therapy is essential.", keyPoints: ["NRTIs: block reverse transcriptase (nucleoside)","NNRTIs: block reverse transcriptase (non-nucleoside)","INSTIs: block integrase","PIs: block protease","3 drugs from 2+ classes = best suppression"], category: "Treatment", duration: "7 min" },
  { id: "side_effects", title: "Common Side Effects and Management", content: "Most ART side effects are mild and improve within the first 4–6 weeks. Many can be managed with simple strategies. Do NOT stop ART because of side effects.", keyPoints: ["Nausea/diarrhea: common first weeks, take with food","DTG: insomnia, headache — take DTG in the morning","TDF: renal monitoring needed — stay hydrated","EFV: vivid dreams, dizziness — take at bedtime","ABC hypersensitivity: STOP immediately if fever + rash"], category: "Treatment", duration: "5 min" },
  { id: "dtg_efv_counseling", title: "DTG/EFV Counseling Points", content: "Dolutegravir (DTG) and Efavirenz (EFV) have specific counseling needs. DTG is WHO preferred first-line with high efficacy and low side effects.", keyPoints: ["DTG: once daily, well tolerated, high genetic barrier","DTG: may cause insomnia — take in morning","DTG + rifampicin: need double dose (50mg BD)","EFV: take on empty stomach at bedtime","EFV: teratogenic — avoid in 1st trimester"], category: "Treatment", duration: "5 min" },
  { id: "disclosure", title: "Disclosure and Partner Notification", content: "Disclosing your HIV status is a personal decision. It can feel scary, but many people find it freeing. Healthcare providers can assist with disclosure.", keyPoints: ["Disclosure is YOUR decision","Healthcare workers can help with disclosure","Partner notification: helps partners access testing","U=U: when undetectable, you cannot transmit HIV","Support groups: practice disclosure conversations"], category: "Psychosocial", duration: "6 min" },
  { id: "family_planning", title: "Family Planning and PMTCT", content: "People living with HIV can have healthy, HIV-negative children with proper care. PMTCT involves ART during pregnancy, labor, and breastfeeding.", keyPoints: ["ART during pregnancy prevents transmission to baby","PMTCT reduces transmission to <2%","TDF/3TC/DTG is safe in pregnancy (WHO preferred)","Breastfeeding: on ART + undetectable VL, risk <1%","Male partners: PrEP available if HIV-negative"], category: "Reproductive Health", duration: "7 min" },
  { id: "tb_prevention", title: "TB Preventive Therapy (TPT)", content: "TB is the leading cause of death in PLHIV. TPT reduces TB risk by 60–90%. TB preventive therapy is a critical intervention.", keyPoints: ["TB is #1 killer of PLHIV — but it is preventable","TPT: Isoniazid 300mg OD ×6 months OR 3HP weekly ×3 months","Screen for active TB before starting TPT","INH side effects: peripheral neuropathy (give pyridoxine B6)","TPT prevents active TB disease — highly effective"], category: "Prevention", duration: "5 min" },
  { id: "nutrition_hiv", title: "Nutrition in HIV", content: "Good nutrition supports your immune system, helps ART work better, and manages side effects. HIV increases your energy needs by 10–30%.", keyPoints: ["Eat a balanced diet: proteins, carbs, healthy fats, vegetables","HIV increases calorie needs by 10–30%","Some ART causes weight gain (DTG, INSTI class)","Avoid raw/undercooked eggs and meat","Stay well hydrated (especially on TDF)"], category: "Lifestyle", duration: "5 min" },
  { id: "healthy_living", title: "Healthy Living with HIV", content: "Living well with HIV means more than just taking ART. A holistic approach includes physical activity, mental health, social connections, and regular follow-up.", keyPoints: ["Exercise: 150 min/week moderate activity","Mental health: screening for depression/anxiety","Smoking: HIV+ smokers lose more life-years to smoking than HIV","Alcohol: limit or avoid","Vaccinations: influenza, pneumococcal, HPV, COVID-19"], category: "Lifestyle", duration: "6 min" },
  { id: "oi_warning", title: "Recognizing OIs (Warning Signs)", content: "Opportunistic infections (OIs) are infections that take advantage of a weakened immune system. Knowing the warning signs means you can seek treatment early.", keyPoints: ["Fever + cough + weight loss → TB","Severe headache + fever + confusion → Cryptococcal meningitis","Dry cough + fever + difficulty breathing → PCP","Headache + seizures + confusion → Cerebral toxoplasmosis","Vision changes → CMV retinitis"], category: "Safety", duration: "6 min" },
  { id: "support_groups", title: "Support Groups and Community Resources", content: "You are not alone. Support groups connect you with others who understand. Peer support improves adherence, mental health, and quality of life.", keyPoints: ["Peer support: talk to someone who has been through it","Adherence support groups — stay on track","Community-based organizations offer free services","Online communities: find support if you cannot attend in person","Disclosure support: role-play with peers"], category: "Psychosocial", duration: "4 min" },
  { id: "travel_art", title: "Travel with ART", content: "HIV should not stop you from traveling. With some planning, you can travel safely anywhere.", keyPoints: ["Carry enough ART for entire trip + extra","Keep ART in hand luggage (not checked baggage)","Get a doctor's letter listing your medicines","Check destination country entry requirements","Set phone alarm for time zone changes"], category: "Lifestyle", duration: "4 min" },
];
const COMPLICATIONS = ["OIs (opportunistic infections)","IRIS (Immune Reconstitution Inflammatory Syndrome)","Lipodystrophy/fat redistribution","HIV-associated Nephropathy (HIVAN)","Hepatic steatosis/Lactic acidosis","HIV-associated Neurocognitive Disorder (HAND)","HIV-associated Cardiomyopathy","Metabolic syndrome / INSIGHT weight gain","Peripheral neuropathy","AIDS-defining malignancies (KS, NHL, CC)","Non-AIDS malignancies","Osteoporosis/osteopenia (TDF-related)","Pancreatitis","Skin conditions (prurigo, seborrheic dermatitis)","Anemia"];
const LIFESTYLE_ITEMS = ["Balanced nutrition (increased calorie/protein)","Regular exercise (≥150 min/week)","Smoking cessation","Alcohol reduction","Safe sex practices (condoms)","Adherence routine (pillbox, alarms)","Sleep hygiene (7–9 hrs)","Stress management / mindfulness","Hydration (≥2L water daily)","Hygiene (food safety, dental care)"];
const SPECIALTIES = ["ID Specialist","HIV Specialist","Obstetrician/Gynecologist","Nutritionist/Dietitian","Social Worker/Counselor","TB Clinic","Mental Health/Psychiatry","Ophthalmology","Dermatology","Oncology","Cardiology","Nephrology","Neurology","Dental/Oral Health","Hepatology (HBV/HCV co-infection)"];
const URGENCIES: string[] = ["routine","urgent","emergency"];
const VISIT_TYPES = ["new_patient","follow_up","emergency","telemedicine","home_visit","discharge_review","OI_follow_up","ART_initiation"];
const LAB_PANEL = ["HIV Viral Load","CD4 Count / %","Creatinine / eGFR","ALT / AST","Hemoglobin / CBC","HBsAg (Hepatitis B)","Anti-HCV (Hepatitis C)","RPR/TPHA (Syphilis)","CrAg (Cryptococcal Antigen)","Serum Phosphate (if on TDF)","Urine dipstick (protein/glucose)","Pregnancy Test","TB LAM (urine, CD4 <100)","Lipid Profile","Blood Glucose","Sputum Xpert MTB/RIF","Chest X-Ray"];
const IMAGING_PANEL = ["Chest X-Ray (TB screening)","Abdominal USS (hepatic/renal)","CT Brain (if neuro symptoms)","Fundoscopy (CMV screening if CD4 <50)","DEXA scan (BMD if TDF long-term)","Echocardiogram (if cardiomyopathy suspected)","ECG","MRI Brain (if HAND suspected)"];
const ART_DRUGS = ["TDF","TAF","FTC","3TC","ABC","AZT","DTG","EVG/c","RAL","BIC","CAB","EFV","NVP","RPV","DOR","ETR","LPV/r","ATV/r","DRV/r","MVC","ENF"];
const FREQS = ["OD (Once daily)","BD (Twice daily)","TDS (Three times daily)","QDS (Four times daily)","Nocte (At bedtime)","PRN (As needed)","Weekly","Alternate days","Monthly IM","Bi-monthly IM"];
const UNITS = ["mg","mcg","g","mL","IU"];
const ROUTES_LIST = ["Oral","SC","IM","IV","Topical"];
const OI_PROPHYLAXIS_LIST = ["CTX (Cotrimoxazole) 960mg OD — PCP/Toxo","INH (Isoniazid) 300mg OD + B6 25mg — TB (TPT)","Fluconazole 400mg OD — Cryptococcosis (if CrAg+)","Azithromycin 1200mg weekly — MAC (CD4 <50)","Valganciclovir — CMV (CD4 <50, if indicated)","Primary prophylaxis per WHO stage"];

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

const GLOBAL_CSS = `@media(max-width:640px){.hiv-wa-track{display:none!important}.hiv-desktop-layout{display:none!important}.hiv-page-header{display:none!important}.hiv-root{position:fixed!important;inset:0!important;overflow:hidden!important;padding:0!important;display:flex!important;flex-direction:column!important}.hiv-mobile-list{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow-y:auto!important;background:#fff!important}.hiv-mobile-list.hidden{display:none!important}.hiv-mobile-detail{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#f9fafb!important}.hiv-mobile-detail.hidden{display:none!important}.hiv-list-topbar{position:sticky!important;top:0!important;z-index:20!important;background:#7c3aed!important;color:#fff!important;padding:14px 16px 10px!important;min-height:56px!important;flex-shrink:0!important}.hiv-list-topbar h2{color:#fff!important;font-size:17px!important;margin:0!important;font-weight:800}.hiv-list-search{padding:8px 12px!important;background:#f9fafb!important;position:sticky!important;top:56px!important;z-index:9!important;border-bottom:0.5px solid rgba(0,0,0,.07)!important;flex-shrink:0!important}.hiv-list-search input{width:100%!important;border-radius:20px!important;padding:8px 14px!important;border:none!important;background:#ececec!important;font-size:14px!important;outline:none!important;font-family:inherit!important}.hiv-patient-btn{width:100%!important;display:flex!important;align-items:center!important;gap:12px!important;padding:12px 16px!important;border:none!important;border-bottom:.5px solid rgba(0,0,0,.07)!important;background:#fff!important;cursor:pointer!important;text-align:left!important;min-height:64px!important}.hiv-patient-avatar{width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(124,58,237,.12)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:19px!important;font-weight:800!important;color:#7c3aed!important;flex-shrink:0!important}.hiv-patient-row-info{flex:1!important;min-width:0!important}.hiv-patient-row-name{font-weight:600;font-size:14px;color:#111827}.hiv-patient-row-sub{font-size:11px;color:#9ca3af}.hiv-patient-row-vl{text-align:right;flex-shrink:0}.hiv-detail-topbar{position:sticky!important;top:0!important;z-index:20!important;background:#7c3aed!important;padding:10px 14px!important;display:flex!important;align-items:center!important;gap:10px!important;min-height:56px!important;flex-shrink:0!important}.hiv-back-btn{background:none!important;border:none!important;color:#fff!important;font-size:28px!important;cursor:pointer!important}.hiv-detail-topbar-avatar{width:36px!important;height:36px!important;border-radius:50%!important;background:rgba(255,255,255,.25)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:800!important;font-size:16px!important;color:#fff!important}.hiv-detail-topbar-name{font-weight:700;font-size:15px;color:#fff}.hiv-detail-topbar-sub{font-size:11px;color:rgba(255,255,255,.8)}.hiv-detail-content{flex:1!important;overflow-y:auto!important;padding:10px 10px 100px!important}.hiv-tabs-wrap{position:sticky!important;top:56px!important;z-index:15!important;background:#fff!important;border-bottom:.5px solid rgba(0,0,0,.08)!important;flex-shrink:0!important}.hiv-tabs{display:flex!important;overflow-x:auto!important;flex-wrap:nowrap!important;padding:4px 8px!important;gap:2px!important}.hiv-tab-btn{font-size:10px!important;padding:5px 8px!important;white-space:nowrap!important;min-height:32px!important}}@media(min-width:641px){.hiv-mobile-list,.hiv-mobile-detail{display:none!important}.hiv-desktop-layout{display:flex!important}}@media(min-width:1024px){.hiv-patient-list{width:290px!important;flex-shrink:0!important}};

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
  return <span style={{ padding: "2px 7px", borderRadius: 5, background: bg, color, border: 0.5px solid T.border, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>;
}
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="hiv-stat-card" style={{ background: T.bg, border: 0.5px solid T.border, borderTop: 2px solid T.border, borderRadius: 10, padding: "10px 13px", flex: 1, minWidth: 90 }}>
      <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div className="sv" style={{ color: color ?? T.text, fontSize: 18, fontWeight: 800, lineHeight: 1.1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ color: T.faint, fontSize: 10 }}>{sub}</div>}
    </div>
  );
}
function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={hiv-panel hiv-fade\} style={{ background: T.card, border: 0.5px solid T.border, borderRadius: 14, padding: "16px 18px", ...style }}>{children}</div>;
}
function Skeleton({ height = 200 }: { height?: number }) {
  return <div style={{ height, background: T.bg, borderRadius: 10, border: 0.5px solid T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.faint, fontSize: 13 }}><span style={{ animation: "hiv-pulse 1.4s ease-in-out infinite" }}>Loading…</span></div>;
}
function Btn({ label, variant = "default", onClick, fullWidth, small, icon, disabled }: {
  label: string; variant?: "default"|"primary"|"success"|"warn"|"danger"|"info";
  onClick?: () => void; fullWidth?: boolean; small?: boolean; icon?: string; disabled?: boolean;
}) {
  const s: Record<string, React.CSSProperties> = {
    default: { background: "transparent", color: T.muted, border: 0.5px solid \ },
    primary: { background: T.purple, color: "#fff", border: 1px solid \ },
    success: { background: T.success, color: "#fff", border: 1px solid \ },
    warn:    { background: "#fff7ed", color: T.warn, border: 0.5px solid \ },
    danger:  { background: "#fef2f2", color: T.danger, border: 0.5px solid \ },
    info:    { background: "#eff6ff", color: T.info, border: 0.5px solid \ },
  };
  return (
    <button onClick={onClick} disabled={disabled} className="hiv-btn-press" style={{
      ...s[variant], padding: small ? "4px 9px" : "8px 13px", borderRadius: 8, fontSize: small ? 10 : 12, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      width: fullWidth ? "100%" : undefined, display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 4, minHeight: small ? 28 : 36, fontFamily: "inherit", whiteSpace: "nowrap",
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
        style={{ width: "100%", background: T.bg, border: 0.5px solid T.border, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
    </div>
  );
}
function SelField({ label, value, onChange, options }: { label?: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      {label && <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ background: T.bg, border: 0.5px solid T.border, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", fontFamily: "inherit", width: "100%", appearance: "none" }}>
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
        style={{ width: "100%", background: T.bg, border: 0.5px solid T.border, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
    </div>
  );
}
function PharmaCard({ drug }: { drug: string }) {
  const info = getDrugInfo(drug);
  const [expanded, setExpanded] = useState(false);
  if (!info) return null;
  return (
    <div style={{ border: "0.5px solid #dbeafe", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <button onClick={() => setExpanded(p => !p)} style={{ width: "100%", padding: "9px 12px", display: "flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
        <span style={{ fontSize: 14 }}>💊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: T.info, fontSize: 12 }}>Pharmacological Reference: {drug}</div>
          <div style={{ color: "#93c5fd", fontSize: 10 }}>{info.drugClass} · Dose: {info.standardDose} · {info.pregnancyCategory}</div>
        </div>
        <span style={{ color: T.info, fontSize: 11 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "12px 14px", background: T.card, borderTop: "0.5px solid #dbeafe" }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: T.muted, lineHeight: 1.5 }}><strong style={{ color: T.text }}>Mechanism:</strong> {info.mechanism}</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 4 }}>Standard Dosing</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {info.commonDoses.map(d => <span key={d} style={{ background: "#eff6ff", color: T.info, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, border: "0.5px solid #bfdbfe" }}>{d}{info.unit}</span>)}
              <span style={{ color: T.faint, fontSize: 10, alignSelf: "center" }}>Standard: {info.standardDose}</span>
            </div>
          </div>
          {info.fdc && <div style={{ marginBottom: 8, fontSize: 11, color: T.teal, fontStyle: "italic" }}>Common FDC: {info.fdc}</div>}
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

function ViralLoadTab({ readings }: { readings: HIVReading[] }) {
  const chartData = useMemo(() => {
    return readings.filter(r => r.viralLoad !== undefined).map(r => ({
      date: r.recordedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      vl: r.viralLoad!, cd4: r.cd4,
    }));
  }, [readings]);
  const latest = readings.at(-1);
  const suppressed = latest?.viralLoad !== undefined && latest.viralLoad < 50;
  if (!readings.length) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
      <div style={{ color: T.muted, fontSize: 13 }}>No HIV lab results recorded yet.</div>
    </div>
  );
  return (
    <div>
      <SectHeader label="Viral Load Suppression" color={T.purple} />
      <div style={{ background: suppressed ? "#f0fdf4" : "#fef2f2", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: 0.5px solid T.border, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>{suppressed ? "✅" : "⚠️"}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: suppressed ? T.success : T.danger }}>
            {suppressed ? "Suppressed (<50 copies/mL)" : Detectable: \ copies/mL}
          </div>
          <div style={{ fontSize: 11, color: T.muted }}>Latest: {latest?.recordedAt.toLocaleDateString()} · {chartData.length} result(s) on record</div>
        </div>
      </div>
      {chartData.length > 0 && (
        <div className="hiv-scroll" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
            <thead>
              <tr>{["Date","Viral Load (copies/mL)","Status","CD4"].map(h => (
                <th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: 0.5px solid T.border, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[...chartData].reverse().map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: 0.5px solid \ }}>
                  <td style={{ padding: "8px 10px", color: T.muted }}>{r.date}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700, color: r.vl < 50 ? T.success : r.vl < 1000 ? T.warn : T.danger }}>{r.vl < 20 ? "<20" : r.vl.toLocaleString()}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <Badge text={r.vl < 50 ? "Suppressed" : r.vl < 1000 ? "Low-level" : "Detectable"} color={r.vl < 50 ? T.success : r.vl < 1000 ? T.warn : T.danger} bg={r.vl < 50 ? "#f0fdf4" : r.vl < 1000 ? "#fffbeb" : "#fef2f2"} border={r.vl < 50 ? "#86efac" : r.vl < 1000 ? "#fde68a" : "#fca5a5"} />
                  </td>
                  <td style={{ padding: "8px 10px", color: r.cd4 !== undefined ? (r.cd4 < 200 ? T.danger : r.cd4 < 350 ? T.warn : T.success) : T.faint }}>
                    {r.cd4 !== undefined ? r.cd4.toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function CD4Tab({ readings }: { readings: HIVReading[] }) {
  const cd4Readings = readings.filter(r => r.cd4 !== undefined);
  const latest = cd4Readings.at(-1);
  if (!cd4Readings.length) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🩸</div>
      <div style={{ color: T.muted, fontSize: 13 }}>No CD4 results recorded yet.</div>
    </div>
  );
  return (
    <div>
      <SectHeader label="CD4 Count Trend" color={T.success} sub={\ result(s)} />
      <div style={{ background: T.bg, borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: 0.5px solid \ }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatCard label="Latest CD4" value={latest?.cd4?.toLocaleString() ?? "—"} sub="cells/µL" color={latest && latest.cd4 < 200 ? T.danger : latest && latest.cd4 < 350 ? T.warn : T.success} />
          <StatCard label="CD4 %" value={latest?.cd4Percent !== undefined ? \% : "—"} sub={latest && latest.cd4Percent < 14 ? "Low" : "Normal"} />
          <StatCard label="CD4 Nadir" value={Math.min(...cd4Readings.map(r => r.cd4!)).toLocaleString()} sub="lowest ever" color={T.warn} />
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "#f3f4f6", marginTop: 10, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: "#86efac", width: "35%" }} />
          <div style={{ position: "absolute", left: "35%", top: 0, bottom: 0, background: "#fde68a", width: "15%" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, background: "#fca5a5", width: "50%" }} />
          {latest && <div style={{ position: "absolute", left: \%, top: -3, width: 14, height: 14, borderRadius: "50%", background: T.purple, border: "2px solid #fff", transform: "translateX(-50%)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.faint, marginTop: 4 }}>
          <span>0</span><span style={{ color: T.success }}>350</span><span style={{ color: T.warn }}>500</span><span style={{ color: T.faint }}>1000+</span>
        </div>
      </div>
      <div className="hiv-scroll" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
          <thead>
            <tr>{["Date","CD4","%","Zone","VL at same time"].map(h => (
              <th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: 0.5px solid T.border, textAlign: "left" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[...cd4Readings].reverse().map((r, i) => {
              const zoneColor = r.cd4! < 200 ? T.danger : r.cd4! < 350 ? T.warn : r.cd4! < 500 ? T.info : T.success;
              const zoneLabel = r.cd4! < 200 ? "AIDS" : r.cd4! < 350 ? "Advanced" : r.cd4! < 500 ? "Moderate" : "Normal";
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: 0.5px solid \ }}>
                  <td style={{ padding: "8px 10px", color: T.muted }}>{r.recordedAt.toLocaleDateString()}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700, color: zoneColor }}>{r.cd4!.toLocaleString()}</td>
                  <td style={{ padding: "8px 10px", color: T.muted }}>{r.cd4Percent !== undefined ? \% : "—"}</td>
                  <td style={{ padding: "8px 10px" }}><Badge text={zoneLabel} color={zoneColor} bg={i % 2 === 0 ? "transparent" : T.bg} border={zoneColor} /></td>
                  <td style={{ padding: "8px 10px", color: r.viralLoad !== undefined ? (r.viralLoad < 50 ? T.success : T.danger) : T.faint }}>
                    {r.viralLoad !== undefined ? (r.viralLoad < 50 ? "Suppressed" : r.viralLoad.toLocaleString()) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ARTTab({ medications, patientId }: { medications: HIVMedication[]; patientId: string }) {
  const activeMeds = medications.filter(m => m.status === "active");
  const stoppedMeds = medications.filter(m => m.status === "stopped");
  return (
    <div>
      <SectHeader label="Current ART Regimen" color={T.purple} sub={\ drug(s)} />
      {activeMeds.length === 0 && (
        <div style={{ background: "#fef2f2", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: "0.5px solid #fca5a5" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.danger }}>⚠️ Not on any ART regimen</div>
          <div style={{ fontSize: 11, color: T.muted }}>WHO recommends ART initiation in all PLHIV (Treat All).</div>
        </div>
      )}
      {activeMeds.map(med => {
        const info = getDrugInfo(med.drug);
        return (
          <div key={med.id} style={{ border: 0.5px solid T.border, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
            <div style={{ padding: "9px 12px", background: "#f5f3ff", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>💊</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: T.purple, fontSize: 13 }}>{med.drug} {med.dose}{med.unit}</div>
                <div style={{ color: T.faint, fontSize: 10 }}>{med.frequency} · {info?.drugClass ?? med.drugClass} · {med.route ?? "Oral"}</div>
              </div>
              <Badge text={med.status} color={T.success} bg="#f0fdf4" border="#86efac" />
            </div>
            {info && <PharmaCard drug={med.drug} />}
          </div>
        );
      })}
      {stoppedMeds.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SectHeader label="Previous Regimens" color={T.faint} />
          {stoppedMeds.map(med => (
            <div key={med.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: 0.5px solid T.border, fontSize: 12 }}>
              <span style={{ color: T.faint }}>⬛</span>
              <span style={{ color: T.muted }}>{med.drug} {med.dose}{med.unit}</span>
              <span style={{ color: T.faint, fontSize: 10 }}>{med.startDate} → {med.endDate ?? "present"}</span>
              <Badge text="Stopped" color={T.faint} bg={T.bg} border={T.border} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function OIProphylaxisTab({ prophylaxis, onToggle }: { prophylaxis: string[]; onToggle: (name: string) => void }) {
  return (
    <div>
      <SectHeader label="OI Prophylaxis" color={T.success} sub={\ active} />
      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #86efac" }}>
        <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>OI prophylaxis saves lives in advanced HIV</div>
        <div style={{ fontSize: 10, color: T.muted }}>CD4 <200: CTX for PCP/Toxo. INH for TB prevention (TPT). Fluconazole if CrAg+.</div>
      </div>
      {OI_PROPHYLAXIS_LIST.map(item => {
        const active = prophylaxis.includes(item);
        return (
          <button key={item} onClick={() => onToggle(item)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: 0.5px solid T.border, borderRadius: 8, marginBottom: 6, background: active ? "#f0fdf4" : T.bg, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: 1.5px solid T.border, background: active ? T.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {active && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
            </div>
            <div style={{ flex: 1, fontSize: 12, color: active ? T.text : T.muted }}>{item}</div>
            {active && <Badge text="Active" color={T.success} bg="#f0fdf4" border="#86efac" />}
          </button>
        );
      })}
    </div>
  );
}

function TBScreeningTab({ tbSymptoms, onToggle }: { tbSymptoms: string[]; onToggle: (name: string) => void }) {
  const TB_SYMPTOMS = ["Cough >2 weeks", "Fever >2 weeks", "Night sweats", "Weight loss (unexplained)", "Chest pain", "Hemoptysis (coughing blood)", "Lymphadenopathy", "Contact with TB patient"];
  const anyPositive = tbSymptoms.length > 0;
  return (
    <div>
      <SectHeader label="TB Symptom Screening" color={T.warn} sub={anyPositive ? "⚠️ Screen positive" : "Screen negative"} />
      <div style={{ background: anyPositive ? "#fef2f2" : "#f0fdf4", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: 0.5px solid \ }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: anyPositive ? T.danger : T.success }}>
          {anyPositive ? "Positive TB symptom screen — investigate further" : "Negative TB symptom screen — continue routine monitoring"}
        </div>
        <div style={{ fontSize: 10, color: T.muted }}>WHO 4-symptom screen: CFFW (Cough, Fever, night sweats, Weight loss). Screen at every visit.</div>
      </div>
      {TB_SYMPTOMS.map(s => {
        const active = tbSymptoms.includes(s);
        return (
          <button key={s} onClick={() => onToggle(s)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: 0.5px solid T.border, borderRadius: 8, marginBottom: 4, background: active ? "#fef2f2" : T.bg, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, border: 1.5px solid T.border, background: active ? T.danger : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {active && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
            </div>
            <span style={{ fontSize: 12, color: active ? T.danger : T.muted }}>{s}</span>
          </button>
        );
      })}
      {anyPositive && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "#fff7ed", borderRadius: 8, border: "0.5px solid #fed7aa" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.warn }}>Recommended next steps:</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>• Sputum Xpert MTB/RIF · CXR · LAM (if CD4 <100) · Clinical evaluation</div>
        </div>
      )}
    </div>
  );
}

function AdherenceTab({ readings, adherence }: { readings: HIVReading[]; adherence: AdherenceMap }) {
  const allDays = useMemo(() => Object.values(adherence).flatMap(m => Object.values(m)), [adherence]);
  const medPct = allDays.length > 0 ? Math.round(allDays.filter(Boolean).length / allDays.length * 100) : 0;
  return (
    <div>
      <SectHeader label="Adherence Overview" color={T.success} sub="Target: ≥95%" />
      <div className="hiv-stat-row" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard label="ART Adherence" value={\%} sub="last 14 days" color={medPct >= 95 ? T.success : medPct >= 80 ? T.warn : T.danger} />
        <StatCard label="Viral Load" value={readings.filter(r => r.viralLoad !== undefined && r.viralLoad < 50).length > 0 ? "Suppressed" : "No data"} sub="latest" color={readings.filter(r => r.viralLoad !== undefined && r.viralLoad < 50).length > 0 ? T.success : T.faint} />
        <StatCard label="CD4 Latest" value={readings.at(-1)?.cd4?.toLocaleString() ?? "—"} sub="cells/µL" color={readings.at(-1)?.cd4 !== undefined && readings.at(-1)!.cd4 < 200 ? T.danger : readings.at(-1)?.cd4 !== undefined && readings.at(-1)!.cd4 < 350 ? T.warn : T.success} />
      </div>
      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #86efac" }}>
        <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>U=U: Undetectable = Untransmittable</div>
        <div style={{ fontSize: 10, color: T.muted }}>Sustained adherence ≥95% = virologic suppression = zero transmission risk.</div>
      </div>
    </div>
  );
}

function AlertsTab({ alerts, onAdd, onDelete, readings, adherencePct, medications, labOrders }: {
  alerts: Alert[]; onAdd: (a: Alert) => void; onDelete: (id: string) => void;
  readings: HIVReading[]; adherencePct: number; medications: HIVMedication[]; labOrders: LabOrder[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [category, setCategory] = useState("HIV Management");
  const ACTION_OPTS = ["Notify patient via app","Send SMS to patient","Flag for urgent review","Schedule appointment","Order labs","Escalate to ID specialist","Refer to counselor"];
  const CATEGORIES = ["HIV Management","Virologic","Immunologic","OI/TB","Adherence","Drug Interaction","PMTCT","Psychosocial","Monitoring Gap"];
  const scientificAlerts = useMemo(() => generateClinicalAlerts(readings, medications, adherencePct, labOrders), [readings, medications, adherencePct, labOrders]);
  const severityColor = { critical: T.danger, urgent: T.warn, warning: T.warn, info: T.info } as const;
  const severityBg = { critical: "#fef2f2", urgent: "#fff7ed", warning: "#fff7ed", info: "#eff6ff" } as const;
  return (
    <div>
      <SectHeader label="Clinical Alert Engine — WHO 2021" color={T.danger} sub={\ active} />
      {scientificAlerts.length === 0 && (
        <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "0.5px solid #86efac", display: "flex", gap: 10 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div><div style={{ fontWeight: 700, fontSize: 13, color: T.success }}>All HIV Clinical Parameters Satisfactory</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>No automated alerts generated. Continue current ART management.</div></div>
        </div>
      )}
      {scientificAlerts.map(a => (
        <div key={a.id} style={{ border: "0.5px solid " + T.border, borderLeft: "4px solid " + severityColor[a.severity], borderRadius: 10, marginBottom: 10, overflow: "hidden", background: severityBg[a.severity] }}>
          <div style={{ padding: "10px 13px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ background: severityColor[a.severity], color: "#fff", padding: "1px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{a.severity.toUpperCase()}</span>
                  <span style={{ color: T.faint, fontSize: 10 }}>{a.category}</span>
                </div>
                <div style={{ fontWeight: 700, color: T.text, fontSize: 13 }}>{a.title}</div>
                <div style={{ color: T.muted, fontSize: 11, lineHeight: 1.5 }}>{a.detail}</div>
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
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: 0.5px solid \ }}>
        {alerts.map(a => (
          <div key={a.id} style={{ border: "0.5px solid #fed7aa", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
            <div style={{ padding: "9px 12px", background: "#fff7ed", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 14 }}>🔔</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: T.warn, fontSize: 12 }}>{a.trigger}</div>
                <div style={{ color: T.faint, fontSize: 11 }}>{a.category && <span style={{ background: "#fff7ed", border: "0.5px solid #fed7aa", borderRadius: 4, padding: "1px 6px", fontSize: 10 }}>{a.category}</span>}Actions: {a.actions.join(" · ")}</div>
              </div>
              <Btn label="Remove" variant="danger" small onClick={() => onDelete(a.id)} />
            </div>
          </div>
        ))}
        {showForm ? (
          <div style={{ border: 1.5px dashed \, borderRadius: 10, padding: 12, background: "#fffbeb" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <SelField label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
              <InpField label="Trigger" value={trigger} onChange={setTrigger} placeholder="e.g. VL >1000 for 2 consecutive" />
            </div>
            <TextArea label="Doctor's note" value={doctorNote} onChange={setDoctorNote} placeholder="Clinical reasoning…" rows={2} />
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {ACTION_OPTS.map(a => {
                const sel = actions.includes(a);
                return <button key={a} onClick={() => setActions(p => sel ? p.filter(x => x !== a) : [...p, a])}
                  style={{ padding: "4px 9px", borderRadius: 7, border: 0.5px solid T.border, background: sel?T.warn:"transparent", color: sel?"#fff":T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{sel ? "✓ " : ""}{a}</button>;
              })}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn label="✓ Create Alert" variant="success" onClick={() => { if (!trigger) return; onAdd({ id: "a"+Date.now(), trigger, actions, category, doctorNote, createdAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), history: [] }); setTrigger(""); setActions([]); setDoctorNote(""); setShowForm(false); }} />
              <Btn label="Cancel" onClick={() => setShowForm(false)} />
            </div>
          </div>
        ) : <Btn label="🔔 Create New Alert Rule" variant="warn" fullWidth onClick={() => setShowForm(true)} />}
      </div>
    </div>
  );
}

function ComplicationsTab({ complications, onToggle }: { complications: Complication[]; onToggle: (name: string) => void }) {
  const COMP_INFO: Record<string, string> = {
    "OIs (opportunistic infections)": "Common OIs: TB, PCP, Cryptococcosis, Toxoplasmosis, CMV. Screen at each visit.",
    "IRIS (Immune Reconstitution Inflammatory Syndrome)": "Paradoxical worsening after ART initiation. Common with TB + ART.",
    "Lipodystrophy/fat redistribution": "Fat loss (face, arms, legs) or gain (abdomen). Associated with d4T, AZT.",
    "HIV-associated Nephropathy (HIVAN)": "Collapsing FSGS. Proteinuria, ↑ Cr. More in Black patients.",
    "Hepatic steatosis/Lactic acidosis": "NRTI mitochondrial toxicity. Risk with d4T, ddI, AZT.",
    "HIV-associated Neurocognitive Disorder (HAND)": "Cognitive decline. Screen with IHDS. Optimize ART.",
    "HIV-associated Cardiomyopathy": "Dilated cardiomyopathy in advanced HIV.",
    "Metabolic syndrome / INSIGHT weight gain": "Weight gain with INSTIs. Monitor weight, glucose, lipids.",
    "Peripheral neuropathy": "Pain, numbness in feet. Manage with gabapentin/amitriptyline.",
    "AIDS-defining malignancies (KS, NHL, CC)": "KS (HHV-8), NHL, Cervical Cancer (HPV). ART is primary treatment.",
    "Non-AIDS malignancies": "Increased risk: lung, anal, liver cancers.",
    "Osteoporosis/osteopenia (TDF-related)": "TDF associated with BMD loss. Consider TAF switch.",
    "Pancreatitis": "Rare. Associated with ddI, d4T. Severe abdominal pain.",
    "Skin conditions (prurigo, seborrheic dermatitis)": "Common in HIV. Improves with ART.",
    "Anemia": "AZT-related bone marrow suppression. Also chronic disease.",
  };
  return (
    <div>
      <SectHeader label="HIV Complications & Comorbidities" color={T.danger} />
      <div className="hiv-comp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {COMPLICATIONS.map(c => {
          const comp = complications.find(x => x.name === c);
          return (
            <button key={c} onClick={() => onToggle(c)} style={{ border: 0.5px solid T.border, borderRadius: 10, padding: "10px 11px", background: comp?"#fef2f2":T.bg, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: 1.5px solid T.border, background: comp?T.danger:"transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {comp && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: comp?T.danger:T.text }}>{c}</div>
                  {comp && <div style={{ color: T.faint, fontSize: 10 }}>Dx: {comp.date}</div>}
                  <div style={{ color: T.faint, fontSize: 10, lineHeight: 1.4 }}>{COMP_INFO[c]}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function ContactTracingTab({ contacts, onToggle }: { contacts: string[]; onToggle: (name: string) => void }) {
  const CONTACT_TYPES = ["Sexual partner 1","Sexual partner 2","Sexual partner 3","Child/children","Household contact 1","Household contact 2","Needle-sharing partner","Partner notified (anonymous)","Partner tested HIV negative","Partner tested HIV positive","Partner linked to care","Partner started PrEP"];
  return (
    <div>
      <SectHeader label="Partner Notification & Contact Tracing" color={T.info} sub={\ traced} />
      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #bfdbfe" }}>
        <div style={{ fontSize: 11, color: T.info, fontWeight: 600 }}>Offer assisted partner notification services.</div>
        <div style={{ fontSize: 10, color: T.muted }}>All sexual partners and needle-sharing contacts should be offered HIV testing and PrEP if negative.</div>
      </div>
      {CONTACT_TYPES.map(c => {
        const active = contacts.includes(c);
        return (
          <button key={c} onClick={() => onToggle(c)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: 0.5px solid T.border, borderRadius: 8, marginBottom: 4, background: active ? "#eff6ff" : T.bg, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, border: 1.5px solid T.border, background: active ? T.info : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {active && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
            </div>
            <span style={{ fontSize: 12, color: active ? T.info : T.muted }}>{c}</span>
          </button>
        );
      })}
    </div>
  );
}

function PMTCTTab({ pmtctSteps, onToggle }: { pmtctSteps: string[]; onToggle: (name: string) => void }) {
  const PMTCT_ITEMS = ["Pregnant: on ART (TDF/3TC/DTG)","Pregnant: VL <50 copies/mL (suppressed)","Labor & delivery: continue ART","Infant: nevirapine prophylaxis (6 weeks)","Infant: HIV PCR test at birth","Infant: HIV PCR test at 6 weeks","Infant: HIV PCR test at 6 months","Infant: rapid test at 18 months","Exclusive breastfeeding advised","Mixed feeding avoided (↑ transmission risk)","Mother: contraception counseling","Mother: family planning completed"];
  return (
    <div>
      <SectHeader label="PMTCT Steps" color={T.pink} sub={\ completed} />
      <div style={{ background: "#fdf2f8", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #fbcfe8" }}>
        <div style={{ fontSize: 11, color: T.pink, fontWeight: 600 }}>Prevention of Mother to Child Transmission</div>
        <div style={{ fontSize: 10, color: T.muted }}>With effective PMTCT, transmission risk is <2% (without ART: 15–45%).</div>
      </div>
      {PMTCT_ITEMS.map(item => {
        const active = pmtctSteps.includes(item);
        return (
          <button key={item} onClick={() => onToggle(item)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: 0.5px solid T.border, borderRadius: 8, marginBottom: 4, background: active ? "#fdf2f8" : T.bg, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, border: 1.5px solid T.border, background: active ? T.pink : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {active && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
            </div>
            <span style={{ fontSize: 12, color: active ? T.pink : T.muted }}>{item}</span>
          </button>
        );
      })}
    </div>
  );
}

function LifestyleTab({ lifestyle, onToggle, onGrade, onSendNotification, patientId }: {
  lifestyle: LifestyleItem[]; onToggle: (name: string) => void; onGrade: (name: string, grade: LifestyleItem["grade"]) => void;
  onSendNotification: (item: string, grade: LifestyleItem["grade"]) => void; patientId: string;
}) {
  const GRADES: LifestyleItem["grade"][] = ["Good","Moderate","Poor"];
  const gc: Record<LifestyleItem["grade"], string> = { Good: T.success, Moderate: T.warn, Poor: T.danger };
  return (
    <div>
      <SectHeader label="Lifestyle Modification" color={T.success} />
      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "0.5px solid #86efac" }}>
        <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>Lifestyle interventions improve ART outcomes</div>
      </div>
      {LIFESTYLE_ITEMS.map(item => {
        const ls = lifestyle.find(x => x.name === item);
        return (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: 0.5px solid T.border, flexWrap: "wrap" }}>
            <button onClick={() => onToggle(item)} style={{ width: 18, height: 18, borderRadius: 4, border: 1.5px solid T.border, background: ls?T.success:"transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {ls && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: ls?T.text:T.muted }}>{item}</div>
            </div>
            {ls && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                {GRADES.map(g => <button key={g} onClick={() => onGrade(item, g)}
                  style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: 0.5px solid T.border, background: ls.grade===g?gc[g]:"transparent", color: ls.grade===g?"#fff":T.faint }}>{g}</button>)}
                <button onClick={() => onSendNotification(item, ls.grade)} title="Notify patient"
                  style={{ padding: "3px 7px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: 0.5px solid T.border, background: "#eff6ff", color: T.info }}>📤</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EducationTab({ education, onSend, patientId, doctorId, doctorName }: {
  education: string[]; onSend: (topic: EducationTopic) => void;
  patientId: string; doctorId?: string; doctorName?: string;
}) {
  const [filter, setFilter] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic|null>(null);
  const categories = useMemo(() => ["All", ...new Set(EDUCATION_TOPICS.map(t => t.category))], []);
  const filtered = filter === "All" ? EDUCATION_TOPICS : EDUCATION_TOPICS.filter(t => t.category === filter);
  return (
    <div>
      <SectHeader label="Patient Education Library" color={T.info} sub={\ topics sent} />
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: "3px 9px", borderRadius: 6, border: 0.5px solid T.border, background: filter===c?"#eff6ff":"transparent", color: filter===c?T.info:T.faint, fontSize: 10, fontWeight: filter===c?700:500, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
        ))}
      </div>
      {selectedTopic && (
        <div style={{ border: 1.5px solid T.border, borderRadius: 12, marginBottom: 12 }}>
          <div style={{ background: "#eff6ff", padding: "10px 13px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📚</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: T.info, fontSize: 13 }}>{selectedTopic.title}</div><div style={{ fontSize: 10, color: "#93c5fd" }}>{selectedTopic.category} · {selectedTopic.duration}</div></div>
            <button onClick={() => setSelectedTopic(null)} style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontFamily: "inherit", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 10 }}>{selectedTopic.content}</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 6 }}>Key Points</div>
              {selectedTopic.keyPoints.map((kp, i) => <div key={i} style={{ fontSize: 12, color: T.text, marginBottom: 4 }}>• {kp}</div>)}
            </div>
            <Btn label={education.includes(selectedTopic.id) ? "✓ Already Sent — Resend" : "📤 Send to Patient"} variant={education.includes(selectedTopic.id) ? "default" : "primary"} onClick={() => { onSend(selectedTopic); setSelectedTopic(null); }} fullWidth />
          </div>
        </div>
      )}
      {filtered.map(topic => {
        const sent = education.includes(topic.id);
        return (
          <div key={topic.id} onClick={() => setSelectedTopic(topic)} style={{ border: 0.5px solid T.border, borderRadius: 10, marginBottom: 7, cursor: "pointer", background: sent?"#f0f9ff":T.bg, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📚</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{topic.title}</div>
              <div style={{ fontSize: 11, color: T.faint }}>{topic.category} · {topic.duration}</div>
            </div>
            {sent ? <Badge text="✓ Sent" color={T.info} bg="#eff6ff" border="#93c5fd" /> : <span style={{ color: T.faint, fontSize: 11 }}>View ›</span>}
          </div>
        );
      })}
    </div>
  );
}

function LabsTab({ labOrders, onOrderLab, onUpdateResult }: {
  labOrders: LabOrder[];
  onOrderLab: (n: string, urgency?: string) => void;
  onUpdateResult: (name: string, result: string, type: "lab"|"imaging") => void;
}) {
  const [customLab, setCustomLab] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [editingResult, setEditingResult] = useState<{name: string; type: "lab"|"imaging"}|null>(null);
  const [resultText, setResultText] = useState("");
  return (
    <div>
      <SectHeader label="HIV Lab Monitoring" color={T.purple} />
      {editingResult && (
        <div style={{ background: "#f5f3ff", borderRadius: 10, padding: 12, marginBottom: 12, border: "0.5px solid #ddd6fe" }}>
          <div style={{ fontWeight: 700, color: T.purple, fontSize: 12, marginBottom: 8 }}>Enter Result: {editingResult.name}</div>
          <InpField value={resultText} onChange={setResultText} placeholder="e.g. <20 copies/mL or 450 cells/µL" />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <Btn label="✓ Save Result" variant="success" onClick={() => { onUpdateResult(editingResult.name, resultText, editingResult.type); setEditingResult(null); }} />
            <Btn label="Cancel" onClick={() => setEditingResult(null)} />
          </div>
        </div>
      )}
      {LAB_PANEL.map(l => {
        const ordered = labOrders.find(x => x.name === l);
        return (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: 0.5px solid \ }}>
            <div style={{ flex: 1, fontSize: 12, color: ordered ? T.text : T.muted }}>{l}</div>
            {ordered ? (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {ordered.result
                  ? <Badge text={ordered.result.length > 15 ? ordered.result.slice(0,15)+"…" : ordered.result} color={T.success} bg="#f0fdf4" border="#86efac" />
                  : <Badge text={ordered.urgency === "urgent" ? "⚡ Urgent" : "Ordered"} color={T.warn} bg="#fffbeb" border="#fde68a" />}
                <button onClick={() => { setEditingResult({name: l, type: "lab"}); setResultText(ordered.result ?? ""); }}
                  style={{ background: "none", border: 0.5px solid T.border, borderRadius: 5, padding: "2px 6px", fontSize: 10, cursor: "pointer", color: T.muted, fontFamily: "inherit" }}>Result</button>
              </div>
            ) : <Btn label="Order" small onClick={() => onOrderLab(l, urgency)} />}
          </div>
        );
      })}
    </div>
  );
}
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
    { key: "hpi", label: "History of Present Illness (HPI)", ph: "Duration, severity, ART history, adherence, OI symptoms…" },
    { key: "exam", label: "Examination Findings", ph: "General, skin, lymph nodes, chest, abdominal, neurological…" },
    { key: "investigations", label: "Investigations / Results", ph: "Recent VL, CD4, Cr, LFTs, Hb, CrAg, CXR…" },
    { key: "assessment", label: "Assessment / Diagnosis", ph: "WHO Stage, OIs, ART regimen, adherence level…" },
    { key: "plan", label: "Management Plan", ph: "ART changes, OI treatment, prophylaxis, referrals, follow-up…" },
  ];
  const activeForm = editingNote ?? form;
  const setActiveForm = editingNote ? setEditingNote as (n: ClinicalNote) => void : setForm;
  return (
    <div>
      <SectHeader label="Clinical Notes — SOAP Format" color={T.muted} />
      {[...notes].reverse().map((n) => (
        <div key={n.id ?? n.date} style={{ border: 0.5px solid T.border, borderRadius: 12, marginBottom: 10 }}>
          <div onClick={() => setExpandedId(expandedId === n.id ? null : n.id ?? n.date)} style={{ padding: "10px 13px", display: "flex", alignItems: "center", gap: 8, background: T.bg, cursor: "pointer" }}>
            <span style={{ fontSize: 16 }}>📋</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{n.date} — {n.assessment || "HIV Clinical Note"}</div>
              <div style={{ color: T.faint, fontSize: 11 }}>{n.doctorName} · {n.visitType ?? "Follow-up"}{n.isLocked ? " 🔒" : " 🔓"}</div>
            </div>
            <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
              {!n.isLocked && <Btn label="✏️" small variant="info" onClick={() => { setEditingNote({ ...n }); setShowForm(true); }} />}
            </div>
            <span style={{ color: T.faint, fontSize: 11 }}>{expandedId === (n.id ?? n.date) ? "▲" : "▼"}</span>
          </div>
          {expandedId === (n.id ?? n.date) && (
            <div className="hiv-note-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 14px" }}>
              {FIELDS.filter(f => n[f.key]).map(f => (
                <div key={f.key} style={{ gridColumn: f.key === "plan" || f.key === "hpi" ? "1 / -1" : undefined }}>
                  <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n[f.key] as string}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {showForm && (
        <div style={{ border: 1.5px solid T.border, borderRadius: 12, padding: 13, background: "#eff6ff", marginTop: 8 }}>
          <div style={{ color: T.info, fontWeight: 700, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            📋 {editingNote ? "Edit Clinical Note" : "New SOAP Note"}
            <Btn label="Cancel" small onClick={() => { setShowForm(false); setEditingNote(null); setForm(blank()); }} />
          </div>
          <div className="hiv-note-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {FIELDS.map(f => (
              <div key={f.key} style={{ gridColumn: f.key === "plan" || f.key === "hpi" ? "1 / -1" : undefined }}>
                <TextArea label={f.label} value={(activeForm?.[f.key] as string) ?? ""} onChange={v => setActiveForm({ ...activeForm!, [f.key]: v })} placeholder={f.ph} rows={4} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn label="✓ Save Note" variant="success" onClick={() => {
              if (editingNote) onEdit({ ...activeForm!, isLocked: false });
              else onSave({ ...form, id: "n"+Date.now() });
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

function TimelineTab({ events }: { events: TimelineEvent[] }) {
  const tc: Record<TimelineEvent["type"], string> = { visit: T.info, med: T.purple, alert: T.warn, reading: T.success, note: T.muted, lab: "#7c3aed" };
  return (
    <div>
      <SectHeader label="Clinical Event Timeline" color={T.info} sub={\ events} />
      {events.length === 0 && <div style={{ color: T.faint, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No events recorded yet.</div>}
      <div style={{ position: "relative", paddingLeft: 22 }}>
        <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 1.5, background: T.border }} />
        {[...events].reverse().map(e => (
          <div key={e.id} style={{ position: "relative", marginBottom: 12, paddingLeft: 10 }}>
            <div style={{ position: "absolute", left: -14, top: 4, width: 10, height: 10, borderRadius: "50%", background: tc[e.type], border: 2px solid T.border, boxShadow: 0 0 0 1px T.border }} />
            <div style={{ fontSize: 10, color: T.faint }}>{e.date}</div>
            <div style={{ fontWeight: 600, fontSize: 12, color: T.text }}>{e.icon} {e.title}</div>
            {e.detail && <div style={{ fontSize: 11, color: T.muted }}>{e.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagingTab({ messages, onSend, threadId, loadingMessages, patientName, onOpenMessaging }: {
  messages: Message[]; onSend: (text: string) => void; threadId: string; loadingMessages?: boolean;
  patientName?: string; onOpenMessaging?: () => void;
}) {
  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(m => !m.read && m.from !== "doctor").length;
  const initials = (patientName ?? "P").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div onClick={() => onOpenMessaging?.()} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: 0.5px solid T.border, background: T.bg, cursor: "pointer" }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{patientName ?? "Patient"}</div>
        <div style={{ fontSize: 12, fontWeight: unreadCount > 0 ? 600 : 400, color: unreadCount > 0 ? T.text : T.faint }}>
          {loadingMessages ? "Loading…" : lastMessage ? \\ : "No messages yet"}
        </div>
      </div>
      {unreadCount > 0 && (
        <div style={{ background: T.info, color: "#fff", borderRadius: "50%", minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
          {unreadCount}
        </div>
      )}
    </div>
  );
}

interface Referral {
  id?: string; status: string; urgency: string; type: string; reason?: string;
  specialty?: string; receivingDoctorName?: string; referringDoctorName?: string;
  patientId?: string; patientName?: string; createdAt?: any;
}
function ReferralsPreview({ referrals = [], onOpenReferrals }: { referrals: Referral[]; onOpenReferrals: () => void }) {
  const pending = referrals.filter(r => r.status === "pending").length;
  return (
    <div onClick={onOpenReferrals} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: 0.5px solid T.border, background: T.bg, cursor: "pointer" }}>
      <div style={{ fontSize: 26 }}>🏥</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>Referrals</div>
        <div style={{ fontSize: 11, color: T.faint }}>{referrals.length} referral(s) · {pending} pending</div>
      </div>
      <div style={{ color: T.faint, fontSize: 16 }}>›</div>
    </div>
  );
}
function PatientPicker({ patients, selectedId, onSelect, loading }: {
  patients: PatientSummary[]; selectedId: string | null; onSelect: (id: string) => void; loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => search
    ? patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.universalId ?? "").toLowerCase().includes(search.toLowerCase()))
    : patients, [patients, search]);
  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>HIV Patients</span>
        <span style={{ color: T.faint, fontWeight: 500 }}>{patients.length}</span>
      </div>
      <InpField value={search} onChange={setSearch} placeholder="Search patients…" />
      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        {loading ? <Skeleton /> : filtered.length === 0 ? (
          <div style={{ color: T.faint, fontSize: 12, textAlign: "center", padding: "16px 0" }}>No patients found.</div>
        ) : filtered.map(p => {
          const active = selectedId === p.id;
          return (
            <button key={p.id} onClick={() => onSelect(p.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 8px",
              border: "none", borderBottom: "0.5px solid #f0f0f0", background: active ? "#f5f3ff" : "transparent",
              cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 12,
              color: active ? T.purple : T.text, fontWeight: active ? 700 : 500,
            }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: active ? T.purple : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#fff" : T.muted, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: T.faint }}>{p.totalReadings ?? "-"} encounters</div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function PatientPanel({ patientId, onOpenReferrals, onOpenConversation, patientName, doctorId, doctorName }: {
  patientId: string; onOpenReferrals?: (pid: string, pn: string) => void; onOpenConversation?: (threadId: string) => void;
  patientName: string; doctorId?: string; doctorName?: string;
}) {
  const [readings, setReadings] = useState<HIVReading[]>([]);
  const [medications, setMedications] = useState<HIVMedication[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [customAlerts, setCustomAlerts] = useState<Alert[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [complications, setComplications] = useState<Complication[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestyleItem[]>([]);
  const [education, setEducation] = useState<string[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [contacts, setContacts] = useState<string[]>([]);
  const [pmtctSteps, setPmtctSteps] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [referrals, setReferrals] = useState<Record<string, unknown>[]>([]);
  const [threadId, setThreadId] = useState(patientId);
  const [loadingR, setLoadingR] = useState(true);
  const [loadingM, setLoadingM] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [tab, setTab] = useState("viral_load");
  const tabsRef = useRef<HTMLDivElement>(null);

  type TabId = typeof TABS[number]["id"];
  const TABS = [
    { id: "viral_load" as const, icon: "🦠", label: "VL" },
    { id: "cd4" as const, icon: "🛡️", label: "CD4" },
    { id: "art" as const, icon: "💊", label: "ART" },
    { id: "oi_prophylaxis" as const, icon: "🩺", label: "OI Proph" },
    { id: "tb_screening" as const, icon: "🫁", label: "TB" },
    { id: "adherence" as const, icon: "✅", label: "Adherence" },
    { id: "alerts" as const, icon: "🔔", label: "Alerts" },
    { id: "complications" as const, icon: "⚠️", label: "Comps" },
    { id: "contact_tracing" as const, icon: "👥", label: "Tracing" },
    { id: "pmtct" as const, icon: "🤱", label: "PMTCT" },
    { id: "lifestyle" as const, icon: "🏃", label: "Lifestyle" },
    { id: "labs" as const, icon: "🔬", label: "Labs" },
    { id: "education" as const, icon: "📚", label: "Education" },
    { id: "notes" as const, icon: "📋", label: "Notes" },
    { id: "timeline" as const, icon: "📅", label: "Timeline" },
    { id: "messaging" as const, icon: "💬", label: "Chat" },
    { id: "referrals" as const, icon: "🏥", label: "Referrals" },
  ];
  useEffect(() => { if (patientId) setThreadId(patientId); }, [patientId]);
  useEffect(() => {
    const q = query(collection(db, "hivReadings"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, snap => { setReadings(snap.docs.map(d => ({ id: d.id, ...d.data() } as HIVReading)).reverse()); setLoadingR(false); }, () => setLoadingR(false));
  }, [patientId]);
  useEffect(() => {
    const q = query(collection(db, "hivMedications"), where("patientId", "==", patientId), orderBy("startDate", "desc"), limit(50));
    return onSnapshot(q, snap => { setMedications(snap.docs.map(d => ({ id: d.id, ...d.data() } as HIVMedication))); setLoadingM(false); }, () => setLoadingM(false));
  }, [patientId]);
  useEffect(() => {
    const q = query(collection(db, "clinicalAlerts"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(q, snap => { setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert))); }, () => {});
  }, [patientId]);
  useEffect(() => {
    const q = query(collection(db, "clinicalNotes"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, snap => { setClinicalNotes(snap.docs.map(d => { const dt = d.data(); return { id: d.id, date: dt.visitDate instanceof Timestamp ? dt.visitDate.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : String(dt.date ?? ""), cc: dt.chiefComplaint ?? dt.cc ?? "", hpi: dt.hpi ?? "", exam: dt.examination?.general ?? dt.exam ?? "", investigations: dt.investigations ?? "", assessment: dt.assessment ?? "", plan: dt.plan ?? "", diagnoses: dt.diagnoses ?? [], followUps: dt.followUps ?? [], isLocked: dt.isLocked ?? false, doctorId: dt.doctorId ?? "", doctorName: dt.doctorName ?? "AMEXAN", visitType: dt.visitType ?? "follow_up", vitals: dt.vitals ?? {} } as ClinicalNote); })); }, () => {});
  }, [patientId]);
  useEffect(() => {
    const q = query(collection(db, "referrals"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, snap => { setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }, () => {});
  }, [patientId]);
  useEffect(() => {
    if (!threadId) return;
    setLoadingMsg(true);
    const q = query(collection(db, "messages"), where("threadId", "==", threadId), orderBy("timestamp", "asc"), limit(100));
    return onSnapshot(q, snap => {
      const msgs: Message[] = snap.docs.map(d => { const dt = d.data(); return { id: d.id, from: (dt.senderRole === "doctor" || dt.from === "doctor") ? "doctor" : "patient", senderId: dt.senderId, senderName: dt.senderName, senderRole: dt.senderRole, time: dt.timestamp instanceof Timestamp ? dt.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : String(dt.time ?? ""), text: dt.text ?? "", read: dt.read ?? false, status: dt.status, threadId: dt.threadId, timestamp: dt.timestamp instanceof Timestamp ? dt.timestamp.toDate() : undefined } as Message; });
      setMessages(msgs); setLoadingMsg(false);
    }, () => setLoadingMsg(false));
  }, [threadId]);
  useEffect(() => {
    getDocs(query(collection(db, "labOrders"), where("patientId", "==", patientId), orderBy("orderedAt", "desc"), limit(100))).then(snap => {
      const labs: LabOrder[] = [];
      snap.docs.forEach(d => { const r = d.data(); labs.push({ name: r.name ?? r.test ?? "Unknown", result: r.result, orderedAt: r.orderedAt instanceof Timestamp ? r.orderedAt.toDate().toLocaleDateString() : String(r.orderedAt ?? ""), type: r.type ?? "lab", status: r.status ?? "ordered", urgency: r.urgency }); });
      setLabOrders(labs);
    }).catch(() => {});
    getDocs(query(collection(db, "timeline_events"), where("patientId", "==", patientId), orderBy("date", "asc"), limit(200))).then(snap => setTimeline(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent)))).catch(() => {});
    getDoc(doc(db, "patientProfiles", patientId)).then(d => { if (!d.exists()) return; const r = d.data() as Record<string, unknown>; if (r.complications) setComplications(r.complications as Complication[]); if (r.lifestyle) setLifestyle(r.lifestyle as LifestyleItem[]); if (r.education) setEducation(r.education as string[]); if (r.contacts) setContacts(r.contacts as string[]); if (r.pmtctSteps) setPmtctSteps(r.pmtctSteps as string[]); }).catch(() => {});
    getDocs(query(collection(db, "education_logs"), where("patientId", "==", patientId), limit(100))).then(snap => { const ids = snap.docs.map(d => String(d.data().topicId ?? d.data().topic ?? "")).filter(Boolean); if (ids.length > 0) setEducation(p => [...new Set([...p, ...ids])]); }).catch(() => {});
  }, [patientId]);
  const addTimeline = useCallback((type: TimelineEvent["type"], icon: string, title: string, detail?: string) => {
    const ev: TimelineEvent = { id: "t" + Date.now(), date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), type, icon, title, ...(detail !== undefined && { detail }) };
    setTimeline(p => [...p, ev]);
    addDoc(collection(db, "timeline_events"), { ...ev, patientId, createdAt: serverTimestamp() }).catch(() => {});
  }, [patientId]);
  const profileUpdate = useCallback((field: string, value: unknown) => { setDoc(doc(db, "patientProfiles", patientId), { [field]: value }, { merge: true }).catch(() => {}); }, [patientId]);
  const handleMedUpdate = useCallback((med: HIVMedication, changeType: DoseChange["changeType"], oldDose: string) => {
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const entry: DoseChange = { date: today, changeType, previousDose: oldDose + "mg", newDose: med.dose + "mg", changedBy: doctorName ?? "Doctor", reason: med.notes };
    const history = [...(med.changeHistory ?? []), entry];
    setMedications(p => p.map(m => m.id === med.id ? { ...med, changeHistory: history } : m));
    updateDoc(doc(db, "hivMedications", med.id), { dosage: med.dose + med.unit, frequency: med.frequency, instructions: med.instructions ?? "", changeHistory: history, updatedAt: serverTimestamp() }).catch(() => {});
    addTimeline("med", "💊", med.drug + " " + changeType.replace("_", " ") + " → " + med.dose + med.unit, med.notes);
  }, [doctorName, addTimeline]);
  const handleMedStop = useCallback((id: string) => {
    const med = medications.find(m => m.id === id); if (!med) return;
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const entry: DoseChange = { date: today, changeType: "stopped", changedBy: doctorName ?? "Doctor" };
    const history = [...(med.changeHistory ?? []), entry];
    setMedications(p => p.map(m => m.id === id ? { ...m, status: "stopped", endDate: today, changeHistory: history } : m));
    updateDoc(doc(db, "hivMedications", id), { active: false, endDate: serverTimestamp(), changeHistory: history, updatedAt: serverTimestamp() }).catch(() => {});
    addTimeline("med", "⏹", med.drug + " stopped");
  }, [medications, doctorName, addTimeline]);
  const handleMedAdd = useCallback((med: HIVMedication) => {
    setMedications(p => [...p, med]);
    addDoc(collection(db, "hivMedications"), { ...med, patientId, doctorId, doctorName: doctorName ?? "Doctor", startDate: serverTimestamp(), createdAt: serverTimestamp() }).then(ref => setMedications(p => p.map(m => m.id === med.id ? { ...m, id: ref.id } : m))).catch(() => {});
    addDoc(collection(db, "patientNotifications"), { patientId, type: "prescription", title: "New ART: " + med.drug, body: med.drug + " " + med.dose + med.unit + " " + med.frequency + "\\nRx: " + (doctorName ?? "Doctor"), read: false, priority: "high", senderId: doctorId, senderName: doctorName ?? "Doctor", createdAt: serverTimestamp() }).catch(() => {});
    addTimeline("med", "💊", med.drug + " " + med.dose + med.unit + " started");
  }, [patientId, doctorId, doctorName, addTimeline]);
  const handleToggleComplication = useCallback((name: string) => {
    setComplications(prev => { const next = prev.find(x => x.name === name) ? prev.filter(x => x.name !== name) : [...prev, { name, date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }]; profileUpdate("complications", next); return next; });
    addTimeline("visit", "⚠️", "Complication: " + name);
  }, [profileUpdate, addTimeline]);
  const handleToggleLifestyle = useCallback((name: string) => { setLifestyle(prev => { const next = prev.find(x => x.name === name) ? prev.filter(x => x.name !== name) : [...prev, { name, grade: "Good" as const }]; profileUpdate("lifestyle", next); return next; }); }, [profileUpdate]);
  const handleGradeLifestyle = useCallback((name: string, grade: LifestyleItem["grade"]) => { setLifestyle(prev => { const next = prev.map(x => x.name === name ? { ...x, grade } : x); profileUpdate("lifestyle", next); return next; }); }, [profileUpdate]);
  const handleSendEducation = useCallback(async (topic: EducationTopic) => {
    try { await addDoc(collection(db, "education_logs"), { patientId, topicId: topic.id, topic: topic.id, title: topic.title, content: topic.content, keyPoints: topic.keyPoints, category: topic.category, sentBy: doctorId, sentByName: doctorName ?? "Doctor", sentAt: serverTimestamp(), read: false }); await addDoc(collection(db, "patientNotifications"), { patientId, type: "education", title: "New Education: " + topic.title, body: "Doctor shared: " + topic.title, topicId: topic.id, read: false, priority: "normal", senderId: doctorId, senderName: doctorName ?? "Doctor", createdAt: serverTimestamp() }); setEducation(prev => [...new Set([...prev, topic.id])]); addTimeline("visit", "📚", "Education sent: " + topic.title); } catch {}
  }, [patientId, doctorId, doctorName, addTimeline]);
  const handleOrderLab = useCallback((name: string, urgency = "routine") => {
    const item: LabOrder = { name, type: "lab", urgency, status: "ordered", orderedAt: new Date().toLocaleDateString() };
    setLabOrders(p => [...p, item]);
    addDoc(collection(db, "labOrders"), { patientId, name, type: "lab", urgency, status: "ordered", orderedBy: doctorId, orderedByName: doctorName ?? "Doctor", orderedAt: serverTimestamp(), createdAt: serverTimestamp() }).catch(() => {});
    addTimeline("lab", "🔬", "Lab ordered: " + name, urgency);
  }, [patientId, doctorId, doctorName, addTimeline]);
  const handleUpdateResult = useCallback(async (name: string, result: string, type: "lab"|"imaging") => {
    setLabOrders(p => p.map(l => l.name === name ? { ...l, result, status: "resulted" } : l));
    try { const snap = await getDocs(query(collection(db, "labOrders"), where("patientId", "==", patientId), where("name", "==", name))); const batch = writeBatch(db); snap.docs.forEach(d => batch.update(d.ref, { result, status: "resulted", resultedAt: serverTimestamp() })); await batch.commit(); } catch {}
    addTimeline("lab", "🔬", "Result: " + name + " → " + result);
  }, [patientId, addTimeline]);
  const handleSaveNote = useCallback((note: ClinicalNote) => {
    setClinicalNotes(p => [note, ...p]);
    addDoc(collection(db, "clinicalNotes"), { patientId, chiefComplaint: note.cc ?? "", hpi: note.hpi ?? "", examination: { general: note.exam ?? "" }, investigations: note.investigations ?? "", assessment: note.assessment ?? "", plan: note.plan ?? "", diagnoses: note.diagnoses ?? [], followUps: note.followUps ?? [], isLocked: note.isLocked ?? false, visitType: note.visitType ?? "follow_up", vitals: note.vitals ?? {}, doctorId: doctorId ?? "", doctorName: doctorName ?? "AMEXAN", visitDate: serverTimestamp(), createdAt: serverTimestamp(), lastEditedAt: serverTimestamp() }).then(ref => setClinicalNotes(p => p.map(n => n.id === note.id ? { ...n, id: ref.id } : n))).catch(() => {});
    addTimeline("note", "📋", "Note: " + (note.assessment || "Clinical note"));
  }, [patientId, doctorId, doctorName, addTimeline]);
  const handleEditNote = useCallback((note: ClinicalNote) => {
    setClinicalNotes(p => p.map(n => n.id === note.id ? note : n));
    if (!note.id) return;
    updateDoc(doc(db, "clinicalNotes", note.id), { chiefComplaint: note.cc ?? "", hpi: note.hpi ?? "", examination: { general: note.exam ?? "" }, investigations: note.investigations ?? "", assessment: note.assessment ?? "", plan: note.plan ?? "", diagnoses: note.diagnoses ?? [], followUps: note.followUps ?? [], isLocked: note.isLocked ?? false, visitType: note.visitType ?? "follow_up", vitals: note.vitals ?? {}, lastEditedAt: serverTimestamp() }).catch(() => {});
    addTimeline("note", "📋", "Note edited");
  }, [addTimeline]);
  const handleAddAlert = useCallback((alert: Alert) => { setAlerts(p => [...p, { ...alert, id: "a" + Date.now() }]); addDoc(collection(db, "clinicalAlerts"), { ...alert, patientId, doctorId, doctorName: doctorName ?? "Doctor", createdAt: serverTimestamp() }).catch(() => {}); addTimeline("alert", "🔔", "Alert: " + alert.trigger); }, [patientId, doctorId, doctorName, addTimeline]);
  const handleDeleteAlert = useCallback((id: string) => { setAlerts(p => p.filter(a => a.id !== id)); deleteDoc(doc(db, "clinicalAlerts", id)).catch(() => {}); }, []);
  const handleSendMessage = useCallback((text: string) => {
    const now = new Date();
    const m: Message = { from: "doctor", senderId: doctorId, senderName: doctorName ?? "Doctor", senderRole: "doctor", time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text, read: false, status: "sent", threadId, timestamp: now };
    setMessages(p => [...p, m]);
    addDoc(collection(db, "messages"), { text, senderId: doctorId, senderName: doctorName ?? "Doctor", senderRole: "doctor", threadId, patientId, from: "doctor", type: "text", clinTag: "none", read: false, status: "sent", reactions: [], timestamp: serverTimestamp() }).catch(() => {});
    addDoc(collection(db, "patientNotifications"), { patientId, type: "message", title: "Message from " + (doctorName ?? "Doctor"), body: text.slice(0, 100), read: false, priority: "normal", senderId: doctorId, senderName: doctorName ?? "Doctor", createdAt: serverTimestamp() }).catch(() => {});
  }, [patientId, doctorId, doctorName, threadId]);
  const handleToggleContact = useCallback((name: string) => {
    setContacts(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
    addDoc(collection(db, "patientNotifications"), { patientId, type: "contact_tracing", title: "Contact Tracing Update", body: name + " was " + (contacts.includes(name) ? "removed from" : "added to") + " contact tracing", read: false, priority: "low", senderId: doctorId, senderName: doctorName ?? "Doctor", createdAt: serverTimestamp() }).catch(() => {});
    profileUpdate("contacts", contacts.includes(name) ? contacts.filter(x => x !== name) : [...contacts, name]);
    addTimeline("visit", "👥", "Contact tracing: " + name);
  }, [contacts, profileUpdate, patientId, doctorId, doctorName, addTimeline]);
  const handleTogglePmtct = useCallback((name: string) => {
    setPmtctSteps(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
    profileUpdate("pmtctSteps", pmtctSteps.includes(name) ? pmtctSteps.filter(x => x !== name) : [...pmtctSteps, name]);
  }, [pmtctSteps, profileUpdate]);
  const latest = readings.at(-1);
  const suppressed = latest ? latest.viralLoad < 50 || latest.viralLoad < 200 : false;
  const activeMeds = useMemo(() => medications.filter(m => m.status === "active"), [medications]);
  const scrollTab = (id: TabId) => { setTab(id); const el = tabsRef.current?.querySelector("[data-tab=\\\""+id+"\\""]") as HTMLElement|null; el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); };
  return (
    <div>
      <Card style={{ marginBottom: 10 }} className="htn-patient-mini-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(124,58,237,0.1)", border: "1.5px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: T.purple, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{patientName.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{patientName}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>HIV Care · {readings.length} VL results · {activeMeds.length} active ART</div>
          </div>
          {latest && (<div style={{ padding: "6px 14px", borderRadius: 10, background: suppressed ? "#f0fdf4" : "#fef2f2", border: "0.5px solid " + (suppressed ? "#86efac" : "#fca5a5") }}>
            <div style={{ color: suppressed ? T.success : T.danger, fontWeight: 800, fontSize: 14 }}>{latest.viralLoad < 50 ? "<50" : latest.viralLoad < 200 ? "<200" : latest.viralLoad} c/mL</div>
            <div style={{ color: suppressed ? T.success : T.danger, fontSize: 10, fontWeight: 600 }}>{suppressed ? "Suppressed" : "Not suppressed"}</div>
          </div>)}
          <div style={{ display: "flex", gap: 6 }}>
            {(["messaging","referrals","notes"] as TabId[]).map(t => { const tb = TABS.find(x => x.id === t)!; return <button key={t} onClick={() => scrollTab(t)} style={{ padding: "5px 10px", borderRadius: 7, border: "0.5px solid " + T.border, background: tab === t ? T.bg : "transparent", color: T.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{tb.icon} {tb.label}</button>; })}
          </div>
        </div>
      </Card>
      <div className="htn-stat-row" style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <StatCard label="Latest VL" value={latest ? (latest.viralLoad < 50 ? "<50" : String(latest.viralLoad)) + " c/mL" : "—"} sub={suppressed ? "Suppressed" : "Not suppressed"} color={suppressed ? T.success : T.danger} />
        <StatCard label="Latest CD4" value={latest ? latest.cd4 + " cells/µL" : "—"} sub={latest && latest.cd4Percent ? latest.cd4Percent + "%" : ""} color={latest && latest.cd4 < 200 ? T.danger : latest && latest.cd4 < 350 ? T.warn : T.success} />
        <StatCard label="Active ART" value={String(activeMeds.length)} sub="regimens" color={T.purple} />
        <StatCard label="VL Results" value={String(readings.length)} sub="all time" />
        <StatCard label="Alerts" value={String(generateClinicalAlerts(readings, medications, 0, []).length)} sub="active" color={generateClinicalAlerts(readings, medications, 0, []).length > 0 ? T.danger : T.success} />
      </div>
      <div className="htn-tabs-wrap">
        <div ref={tabsRef} className="htn-tabs htn-scroll" style={{ display: "flex", gap: 2, marginBottom: 10, background: T.bg, borderRadius: 10, padding: 3, border: "0.5px solid " + T.border, overflowX: "auto" }}>
          {TABS.map(({ id, icon, label }) => { const active = tab === id; return (
            <button key={id} data-tab={id} onClick={() => scrollTab(id)} className="htn-tab-btn htn-btn-press" style={{ padding: "7px 10px", borderRadius: 7, border: "none", background: active ? "#fff" : "transparent", color: active ? T.purple : T.faint, fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" }}>{icon} {label}</button>); })}
        </div>
      </div>
      <Card>
        {loadingR ? <Skeleton /> : (
          <>
            {tab === "viral_load" && <ViralLoadTab readings={readings} />}
            {tab === "cd4" && <CD4Tab readings={readings} />}
            {tab === "art" && <ARTTab medications={medications} onUpdate={handleMedUpdate} onStop={handleMedStop} onAdd={handleMedAdd} />}
            {tab === "oi_prophylaxis" && <OIProphylaxisTab />}
            {tab === "tb_screening" && <TBScreeningTab />}
            {tab === "adherence" && <AdherenceTab />}
            {tab === "alerts" && <AlertsTab alerts={alerts} onAdd={handleAddAlert} onDelete={handleDeleteAlert} readings={readings} adherencePct={0} medications={medications} labOrders={labOrders} />}
            {tab === "complications" && <ComplicationsTab complications={complications} onToggle={handleToggleComplication} />}
            {tab === "contact_tracing" && <ContactTracingTab contacts={contacts} onToggle={handleToggleContact} />}
            {tab === "pmtct" && <PMTCTTab pmtctSteps={pmtctSteps} onToggle={handleTogglePmtct} />}
            {tab === "lifestyle" && <LifestyleTab lifestyle={lifestyle} onToggle={handleToggleLifestyle} onGrade={handleGradeLifestyle} onSendNotification={() => {}} patientId={patientId} />}
            {tab === "labs" && <LabsTab labOrders={labOrders} onOrderLab={handleOrderLab} onUpdateResult={handleUpdateResult} />}
            {tab === "education" && <EducationTab education={education} onSend={handleSendEducation} patientId={patientId} doctorId={doctorId} doctorName={doctorName} />}
            {tab === "notes" && <NotesTab notes={clinicalNotes} onSave={handleSaveNote} onEdit={handleEditNote} patientName={patientName} doctorId={doctorId} doctorName={doctorName} />}
            {tab === "timeline" && <TimelineTab events={timeline} />}
            {tab === "messaging" && <MessagingTab messages={messages} onSend={handleSendMessage} threadId={threadId} loadingMessages={loadingMsg} patientName={patientName} onOpenMessaging={() => onOpenConversation?.(threadId)} />}
            {tab === "referrals" && <ReferralsPreview referrals={referrals as any} onOpenReferrals={() => onOpenReferrals?.(patientId, patientName)} />}
          </>
        )}
      </Card>
      <div style={{ textAlign: "center", color: T.faint, fontSize: 10, padding: "8px 0 2px" }}>HIV Care Intelligence · AMEXAN · WHO 2024 HIV Guidelines · Real-time sync</div>
    </div>
  );
}
export default function HIVDashboard({ doctorId, doctorName, onOpenConversation, onOpenReferrals }: {
  doctorId?: string; doctorName?: string; onOpenConversation?: (threadId: string) => void; onOpenReferrals?: (patientId: string, patientName: string) => void;
}) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [mobileScreen, setMobileScreen] = useState<"list"|"detail">("list");
  const [listSearch, setListSearch] = useState("");
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "hiv-dashboard-css";
    if (!document.getElementById("hiv-dashboard-css")) { el.innerHTML = GLOBAL_CSS; document.head.appendChild(el); }
    return () => { document.getElementById("hiv-dashboard-css")?.remove(); };
  }, []);
  useEffect(() => {
    const q = query(collection(db, "toolReadings"), where("toolType", "==", "hiv_monitor"));
    return onSnapshot(q, async snap => {
      const map: Record<string, { count: number; latestVL?: number; latestCD4?: number; latestAt?: Date }> = {};
      snap.docs.forEach(d => {
        const data = d.data(); const pid = data.patientId; if (!pid) return;
        const vl = (data.data as Record<string, unknown>|undefined)?.viralLoad ?? data.viralLoad;
        const cd = (data.data as Record<string, unknown>|undefined)?.cd4 ?? data.cd4;
        const at = data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date();
        if (!map[pid]) map[pid] = { count: 0 };
        map[pid].count++;
        if (!map[pid].latestAt || at > map[pid].latestAt!) { map[pid].latestAt = at; map[pid].latestVL = vl; map[pid].latestCD4 = cd; }
      });
      const ids = Object.keys(map);
      if (!ids.length) { setPatients([]); setLoadingPatients(false); return; }
      const results = await Promise.all(ids.map(async pid => {
        try {
          let pd: Record<string, unknown> | null = null;
          try { const u = await getDoc(doc(db, "users", pid)); if (u.exists()) pd = u.data(); } catch {}
          if (!pd) { const p = await getDoc(doc(db, "patientProfiles", pid)); if (p.exists()) pd = p.data(); }
          const name = String(pd?.name ?? pd?.displayName ?? pd?.fullName ?? "Patient " + pid.slice(-6));
          return { id: pid, name, email: String(pd?.email ?? ""), phone: String(pd?.phone ?? ""), universalId: String(pd?.universalId ?? pd?.nhif ?? ""), latestVL: map[pid].latestVL, latestCD4: map[pid].latestCD4, latestAt: map[pid].latestAt, totalReadings: map[pid].count } as PatientSummary;
        } catch { return { id: pid, name: "Patient " + pid.slice(-6), totalReadings: map[pid].count } as PatientSummary; }
      }));
      results.sort((a, b) => (b.latestAt?.getTime() ?? 0) - (a.latestAt?.getTime() ?? 0));
      setPatients(results);
      if (!selectedId && results.length > 0) setSelectedId(results[0].id);
      setLoadingPatients(false);
    }, () => setLoadingPatients(false));
  }, [doctorId]);
  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedId) ?? null, [patients, selectedId]);
  const filteredMobilePatients = useMemo(() => patients.filter(p => p.name.toLowerCase().includes(listSearch.toLowerCase()) || (p.universalId ?? "").toLowerCase().includes(listSearch.toLowerCase())), [patients, listSearch]);
  return (
    <div className="htn-root" style={{ color: T.text, background: T.bg, minHeight: "100%", padding: "0 0 24px" }}>
      <div className={"htn-mobile-list htn-scroll" + (mobileScreen === "detail" ? " hidden" : "")}>
        <div className="htn-list-topbar" style={{ background: "linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)", color: "#fff", padding: "16px 18px 14px", borderRadius: "0 0 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>&#x1f9a0; HIV Care</h2><p style={{ margin: "3px 0 0", fontSize: 11, opacity: 0.85 }}>AMEXAN &middot; WHO 2024 Guidelines</p></div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "5px 11px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "htn-pulse 2s ease-in-out infinite" }} />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>Live</span>
            </div>
          </div>
        </div>
        <div className="htn-list-search"><input type="search" value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search patients&hellip;" /></div>
        {loadingPatients ? <div style={{ padding: "32px 16px", color: T.faint, textAlign: "center" }}><span style={{ animation: "htn-pulse 1.4s ease-in-out infinite", display: "inline-block" }}>Loading patients&hellip;</span></div>
        : !patients.length ? <div style={{ padding: "48px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>&#x1f9a0;</div><div style={{ color: T.muted, fontSize: 13 }}>No HIV patients found.</div></div>
        : filteredMobilePatients.map(p => {
          const active = selectedId === p.id;
          return (
            <button key={p.id} onClick={() => { setSelectedId(p.id); setMobileScreen("detail"); }} className={"htn-patient-btn" + (active ? " active-row" : "")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", border: "none", borderBottom: "0.5px solid #f0f0f0", background: active ? "#f5f3ff" : "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: active ? T.purple : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#fff" : T.muted, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{p.name.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: active ? T.purple : T.text }}>{p.name}</div>
                <div style={{ fontSize: 11, color: T.faint }}>{p.universalId || p.id.slice(0,10)} &middot; {p.totalReadings ?? 0} VL results{p.latestAt ? " &middot; " + p.latestAt.toLocaleDateString() : ""}</div>
              </div>
              {p.latestVL !== undefined && <div style={{ fontWeight: 700, fontSize: 13, color: (p.latestVL < 200 ? T.success : T.danger), textAlign: "right", flexShrink: 0 }}>{p.latestVL < 50 ? "<50" : p.latestVL < 200 ? "<200" : p.latestVL}<div style={{ fontSize: 9, fontWeight: 500 }}>c/mL</div></div>}
              <span style={{ color: T.faint, fontSize: 20, marginLeft: 4, flexShrink: 0 }}>&rsaquo;</span>
            </button>
          );
        })}
      </div>
      <div className={"htn-mobile-detail" + (mobileScreen === "list" ? " hidden" : "")}>
        {selectedPatient ? (
          <>
            <div className="htn-detail-topbar" style={{ background: "linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setMobileScreen("list")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "6px 10px", color: "#fff", fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>&lsaquo;</button>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>{selectedPatient.name.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{selectedPatient.name}</div><div style={{ fontSize: 11, opacity: 0.85 }}>{selectedPatient.universalId ?? selectedPatient.id.slice(0,10)} &middot; {selectedPatient.totalReadings} VL results</div></div>
              {selectedPatient.latestVL !== undefined && <div style={{ textAlign: "right", background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "4px 10px" }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{selectedPatient.latestVL < 50 ? "<50" : selectedPatient.latestVL < 200 ? "<200" : selectedPatient.latestVL} c/mL</div>
                <div style={{ fontSize: 9, opacity: 0.85 }}>{selectedPatient.latestVL < 200 ? "Suppressed" : "Unsuppressed"}</div>
              </div>}
            </div>
            <div className="htn-detail-content htn-scroll"><PatientPanel patientId={selectedPatient.id} onOpenReferrals={onOpenReferrals} onOpenConversation={onOpenConversation} patientName={selectedPatient.name} doctorId={doctorId} doctorName={doctorName} /></div>
          </>
        ) : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: T.faint, fontSize: 14, gap: 10 }}><span style={{ fontSize: 48 }}>&#x1f9a0;</span><span>Select a patient</span></div>}
      </div>
      <div className="htn-desktop-layout" style={{ flexDirection: "column", minHeight: "100%", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div><h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, margin: 0 }}>&#x1f9a0; HIV Care Intelligence</h2><p style={{ color: T.muted, fontSize: 12, margin: "3px 0 0" }}>ART management &middot; AMEXAN &middot; WHO 2024</p></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: T.muted }}>{patients.length} patients &middot; {patients.reduce((a, p) => a + (p.totalReadings ?? 0), 0)} VL results</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(5,150,105,0.08)", border: "0.5px solid rgba(5,150,105,0.3)", borderRadius: 8, padding: "6px 13px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.success, animation: "htn-pulse 2s ease-in-out infinite" }} /><span style={{ color: T.success, fontSize: 12, fontWeight: 600 }}>Live Sync</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
          <div className="htn-patient-list" style={{ width: 290, flexShrink: 0 }}><PatientPicker patients={patients} selectedId={selectedId} onSelect={setSelectedId} loading={loadingPatients} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedPatient ? <PatientPanel patientId={selectedPatient.id} onOpenReferrals={onOpenReferrals} onOpenConversation={onOpenConversation} patientName={selectedPatient.name} doctorId={doctorId} doctorName={doctorName} />
            : loadingPatients ? <Skeleton height={300} />
            : patients.length > 0 ? <Card><div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}><div style={{ fontSize: 36, marginBottom: 10 }}>&#x1f9a0;</div>Select a patient from the list</div></Card> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
`