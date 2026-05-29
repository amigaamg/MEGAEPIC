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
  "Hydroxyurea": {
    drugClass: "HbF Inducer (Antimetabolite)",
    mechanism: "Inhibits ribonucleotide reductase → ↑ HbF production → ↓ RBC sickling, ↓ VOC, ↓ mortality. Increases nitric oxide production → vasodilation.",
    minDose: 10, maxDose: 35, unit: "mg/kg/day",
    commonDoses: ["10","15","20","25","30","35"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Sickle Cell Disease (SCD) — reduce VOC","SCD — reduce ACS","SCD — reduce transfusion need","SCD — reduce mortality"],
    contraindications: ["Pregnancy","Severe bone marrow suppression (ANC <2000)","Severe renal impairment","Known hypersensitivity"],
    warnings: ["Myelosuppression — dose-dependent, reversible","Monitor CBC monthly during titration","Dose escalation every 8-12 weeks until mild myelosuppression (ANC 2000-4000)","Teratogenic — effective contraception required","Increased risk of infection — monitor for fever","Macrocytosis expected — therapeutic target"],
    sideEffects: ["Myelosuppression (neutropenia, thrombocytopenia, anemia)","Macrocytosis (expected — therapeutic effect)","Nausea/vomiting","Anorexia","Diarrhea","Alopecia (rare)","Skin rash","Leg ulcers (rare — can worsen existing)","Impaired fertility"],
    patientInstructions: "Take ONCE DAILY at the same time each day. Swallow capsule whole. Do NOT break or crush. Drink plenty of water. You need monthly blood tests to monitor your blood counts. Do NOT take if pregnant or planning pregnancy. Use effective contraception. Report fever, easy bruising, bleeding, or unusual tiredness immediately.",
    monitoring: ["CBC with differential monthly during titration","HbF levels every 3 months","ANC target 2000-4000 (mild myelosuppression)","Platelet count","Serum creatinine","LFTs","Pregnancy test before starting"],
    interactions: ["⚠️ Other myelosuppressive agents — additive bone marrow suppression","⚠️ Didanosine — ↑ risk of hepatotoxicity","⚠️ Stavudine — ↑ risk of peripheral neuropathy","Ribavirin — ↑ risk of anemia"],
    pregnancyCategory: "D — CONTRAINDICATED (teratogenic). Effective contraception mandatory.",
    renalDose: "CrCl 10-50: reduce dose by 50%; CrCl <10: avoid",
    hepaticDose: "Use with caution; reduce dose in severe impairment",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Folic Acid": {
    drugClass: "Vitamin Supplement",
    mechanism: "Essential cofactor for RBC production. SCD patients have increased RBC turnover → increased folate requirement. Prevents megaloblastic anemia.",
    minDose: 5, maxDose: 5, unit: "mg",
    commonDoses: ["5"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Sickle Cell Disease (routine supplement)","Increased RBC turnover states","Megaloblastic anemia prophylaxis","Pregnancy (all women)"],
    contraindications: ["None significant at physiological doses"],
    warnings: ["May mask B12 deficiency in pernicious anemia","High doses (>1mg/day) may lower seizure threshold"],
    sideEffects: ["Generally well-tolerated","Rare: GI upset, altered sleep patterns"],
    patientInstructions: "Take ONCE DAILY with or without food. This is an essential supplement for all SCD patients. Do not skip doses. Store at room temperature.",
    monitoring: ["None routine"],
    interactions: ["Methotrexate — may interfere","Phenytoin — may reduce levels","Sulfasalazine — may reduce absorption"],
    pregnancyCategory: "A — SAFE in all trimesters",
    color: "#059669", tlColor: "#10b981",
  },
  "Penicillin V": {
    drugClass: "Antibiotic (Penicillin) — Prophylaxis",
    mechanism: "Inhibits bacterial cell wall synthesis. Prophylaxis against Streptococcus pneumoniae — leading cause of infection in SCD due to functional asplenia/hyposplenism.",
    minDose: 125, maxDose: 500, unit: "mg",
    commonDoses: ["125","250","500"], frequencies: ["BD"], routes: ["Oral"],
    indications: ["SCD — pneumococcal prophylaxis (standard of care)","Functional asplenia/hyposplenism","Post-splenectomy prophylaxis"],
    contraindications: ["Penicillin allergy (anaphylaxis)","Severe hypersensitivity to beta-lactams"],
    warnings: ["Anaphylaxis risk — ensure no history of penicillin allergy","Monitor for rash, urticaria","May cause antibiotic-associated diarrhea","<3y: 125mg BD, ≥3y: 250mg BD"],
    sideEffects: ["Diarrhea (most common)","Rash","Nausea","Oral thrush (prolonged use)","C.difficile colitis (rare)","Allergic reactions (urticaria, anaphylaxis)"],
    patientInstructions: "<3y: Take 125mg TWICE DAILY. ≥3y: Take 250mg TWICE DAILY. Take WITH food to reduce stomach upset. Complete the full course. Report any rash, hives, or difficulty breathing immediately — this could be an allergy. Do not stop without doctor advice.",
    monitoring: ["Check adherence at each visit","Monitor for breakthrough infections"],
    interactions: ["⚠️ Methotrexate — increased methotrexate toxicity","Oral contraceptives — may ↓ efficacy","Warfarin — may ↑ INR","Allopurinol — ↑ risk of rash"],
    pregnancyCategory: "B — Generally safe",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Amoxicillin": {
    drugClass: "Antibiotic (Aminopenicillin) — Prophylaxis",
    mechanism: "Inhibits bacterial cell wall synthesis (broader spectrum than penicillin V). Alternative for pneumococcal prophylaxis in penicillin-allergic patients.",
    minDose: 125, maxDose: 500, unit: "mg",
    commonDoses: ["125","250","500"], frequencies: ["OD","BD"], routes: ["Oral"],
    indications: ["SCD — pneumococcal prophylaxis (alternative)","Acute otitis media prophylaxis","Sinusitis prophylaxis"],
    contraindications: ["Penicillin allergy","Infectious mononucleosis (rash risk)"],
    warnings: ["Anaphylaxis — check allergy history","Rash (especially in EBV infection)","Antibiotic-associated diarrhea","<5y: 125mg OD, ≥5y: 250mg OD"],
    sideEffects: ["Diarrhea","Rash","Nausea","Abdominal pain","C.difficile (rare)","Candidiasis (oral thrush)"],
    patientInstructions: "<5y: Take 125mg ONCE DAILY. ≥5y: Take 250mg ONCE DAILY. Take with or without food. Report any allergic reaction. Use the entire prescribed course.",
    monitoring: ["Adherence check at visits","Breakthrough infection surveillance"],
    interactions: ["⚠️ Methotrexate — increased toxicity","Oral contraceptives — may ↓ efficacy","Allopurinol — ↑ rash risk","Warfarin — may ↑ INR"],
    pregnancyCategory: "B — Generally safe",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "L-glutamine (Endari)": {
    drugClass: "Amino Acid / Antioxidant",
    mechanism: "Increases NAD redox potential in RBCs → reduces oxidative stress → decreases HbS polymerization. Reduces VOC frequency by 25% in clinical trials.",
    minDose: 5, maxDose: 15, unit: "g",
    commonDoses: ["5","10","15"], frequencies: ["BD"], routes: ["Oral"],
    indications: ["SCD — reduce frequency of VOC (FDA approved)","SCD — reduce oxidative stress","Adjunct to hydroxyurea for persistent crises"],
    contraindications: ["Severe hepatic encephalopathy","Known hypersensitivity"],
    warnings: ["May cause constipation or abdominal discomfort","Higher doses may affect liver function tests","Take with food or cold beverage","Avoid high-protein meals at same time"],
    sideEffects: ["Constipation (most common)","Nausea","Headache","Abdominal pain","Cough","Back pain","Flatulence"],
    patientInstructions: "Take TWICE DAILY with food or cold beverage. 0.3g/kg/dose. Mix with 8oz of cold beverage or soft food. Do NOT mix with hot liquids. Drink plenty of water. May take up to 24 weeks for full effect on crisis reduction.",
    monitoring: ["VOC frequency tracking","Hb levels","Liver function tests (baseline and periodic)","Lactate levels (if symptoms of acidosis)"],
    interactions: ["High-protein meals may affect absorption","Antacids — separate by 2 hours"],
    pregnancyCategory: "C — limited data; use if benefit outweighs risk",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "Crizanlizumab (Adakveo)": {
    drugClass: "P-selectin Inhibitor (Monoclonal Antibody)",
    mechanism: "Humanized monoclonal antibody that binds P-selectin → blocks interaction with P-selectin glycoprotein ligand-1 → reduces vaso-occlusion. Reduces VOC by 45% (SUSTAIN trial).",
    minDose: 5, maxDose: 5, unit: "mg/kg",
    commonDoses: ["5"], frequencies: ["4-weekly (after month 1)"], routes: ["IV"],
    indications: ["SCD — reduce frequency of VOC in patients ≥16 years","Recurrent VOC despite hydroxyurea"],
    contraindications: ["Known hypersensitivity to crizanlizumab","Active serious infection (delay infusion)"],
    warnings: ["Infusion reactions (fever, chills, nausea, headache) — premedicate","Nausea/vomiting common after infusion","Arthralgia reported","Do NOT administer live vaccines during therapy","May interfere with platelet function assays"],
    sideEffects: ["Nausea (most common)","Arthralgia","Back pain","Pyrexia","Infusion site reactions","Diarrhea","Pruritus","Vomiting"],
    patientInstructions: "This medication is given as an IV infusion over 30 minutes. Month 1: loading dose, then every 4 weeks. Premedication may be given to prevent infusion reactions. Report any fever, chills, or nausea during or after infusion.",
    monitoring: ["VOC frequency (primary outcome)","Infusion tolerance","CBC before each infusion","LFTs periodic"],
    interactions: ["No significant drug-drug interactions (monoclonal antibody)"],
    pregnancyCategory: "C — limited human data; use only if clearly needed",
    color: "#c2410c", tlColor: "#ea580c",
  },
  "Voxelotor (Oxbryta)": {
    drugClass: "HbS Polymerization Inhibitor",
    mechanism: "Small molecule that increases Hb-O2 affinity → stabilizes oxy-Hb conformation → inhibits HbS polymerization → reduces hemolysis, raises Hb levels.",
    minDose: 1500, maxDose: 1500, unit: "mg",
    commonDoses: ["1500"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["SCD — increase Hb levels (FDA approved)","SCD — reduce hemolysis","Adjunct to hydroxyurea"],
    contraindications: ["Known hypersensitivity","Severe hepatic impairment (Child-Pugh C)"],
    warnings: ["May cause headache and diarrhea","GI-related side effects common in first 2 weeks","Monitor LFTs — can cause elevated transaminases","May cause false elevation of Hb by some analyzers — use standard methods"],
    sideEffects: ["Headache","Diarrhea","Abdominal pain","Nausea","Fatigue","Rash","Pyrexia","ALT elevation"],
    patientInstructions: "Take ONCE DAILY with or without food. Swallow tablet whole — do not crush or chew. If diarrhea occurs, stay hydrated and inform your doctor. Use contraception if of childbearing age.",
    monitoring: ["Hb at baseline and monthly","Reticulocyte count","Total bilirubin","LDH (hemolysis markers)","LFTs at baseline and periodic","Pregnancy test if applicable"],
    interactions: ["⚠️ Moderate/strong CYP3A4 inducers (rifampin, carbamazepine) — ↓ voxelotor levels","⚠️ CYP3A4 inhibitors — may ↑ voxelotor levels","Ribavirin — ↑ risk of hemolysis"],
    pregnancyCategory: "C — limited data; use if benefit outweighs risk",
    color: "#059669", tlColor: "#34d399",
  },
  "Deferasirox (Exjade/Jadenu)": {
    drugClass: "Oral Iron Chelator",
    mechanism: "Tridentate iron chelator → binds to Fe3+ → promotes fecal excretion of iron. Used for iron overload from chronic transfusions in SCD.",
    minDose: 14, maxDose: 28, unit: "mg/kg/day",
    commonDoses: ["14","20","28"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Transfusional iron overload in SCD","Chronic transfusions (stroke prevention, recurrent ACS)"],
    contraindications: ["eGFR <40 mL/min","High-risk myelodysplastic syndrome","Advanced malignancies","Platelet count <50"],
    warnings: ["⚠️ Acute kidney injury — monitor creatinine monthly","⚠️ GI hemorrhage (rare but serious)","⚠️ Hepatic toxicity — monitor LFTs","May cause rash — often self-limited","Auditory and ocular toxicity — baseline and annual monitoring"],
    sideEffects: ["↑ Creatinine (dose-dependent)","GI upset (nausea, vomiting, diarrhea)","Rash","Abdominal pain","ALT elevation","Headache","Proteinuria"],
    patientInstructions: "Jadenu: Take ONCE DAILY with food. Exjade: Take ONCE DAILY on empty stomach, at least 30 min before food. Disperse tablet in water, orange juice or apple juice. Drink promptly. Avoid NSAIDs — risk of kidney injury.",
    monitoring: ["Serum ferritin monthly (target: 500-1000 ng/mL)","Creatinine/eGFR monthly","LFTs monthly","Urinalysis for protein","Audiology and ophthalmology annually","Iron balance: ferritin + liver iron concentration"],
    interactions: ["⚠️ NSAIDs — ↑ renal risk","⚠️ Antacids (aluminum) — ↓ chelation","⚠️ Repaglinide — ↑ hypoglycemia","⚠️ CYP3A4 substrates (midazolam, cyclosporine) — ↑ levels"],
    pregnancyCategory: "C — avoid unless essential",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Deferoxamine (Desferal)": {
    drugClass: "Parenteral Iron Chelator",
    mechanism: "Hexadentate iron chelator → binds Fe3+ → promotes urinary and fecal iron excretion. Gold standard for severe iron overload. Given IV or SC infusion 8-12h.",
    minDose: 20, maxDose: 40, unit: "mg/kg/day",
    commonDoses: ["20","30","40"], frequencies: ["OD"], routes: ["IV","SC"],
    indications: ["Severe transfusional iron overload","Ferritin >2500 ng/mL","Liver iron concentration >7 mg/g dry weight","Deferasirox intolerance or contraindication"],
    contraindications: ["Severe renal impairment","Anuria","Pregnancy (avoid)","Hypersensitivity"],
    warnings: ["⚠️ Auditory toxicity (high-frequency hearing loss) — audiometry monitoring","⚠️ Ocular toxicity (cataracts, visual field defects) — ophthalmology monitoring","⚠️ Growth retardation in children — monitor growth chart","⚠️ Yersinia and mucormycosis infections — increased susceptibility"],
    sideEffects: ["Auditory impairment (high-frequency)","Visual disturbances","Growth retardation (children)","Infusion site reactions","Arthralgia","Fever","Leg cramps","Yersinia enterocolitica infection"],
    patientInstructions: "This medication is given as a SLOW INFUSION under the skin (SC) or into a vein (IV) over 8-12 hours, usually overnight, 5-7 nights per week. Use a portable infusion pump. Rotate infusion sites.",
    monitoring: ["Serum ferritin monthly","Audiometry every 6-12 months","Ophthalmology exam annually","Growth assessment (children)","Iron balance assessment","Annual cardiac T2* MRI if iron overloaded"],
    interactions: ["⚠️ Vitamin C — co-administration may worsen cardiac iron toxicity (dose >200mg/day)","Prochlorperazine — may ↑ seizure risk"],
    pregnancyCategory: "C — avoid; use only if clearly needed",
    color: "#dc2626", tlColor: "#f87171",
  },
  "Fentanyl": {
    drugClass: "Short-Acting Opioid (Agonist)",
    mechanism: "μ-opioid receptor agonist → activates descending pain pathways → modulates pain perception. Rapid onset (5-15 min) and short duration.",
    minDose: 25, maxDose: 100, unit: "mcg",
    commonDoses: ["25","50","100"], frequencies: ["PRN"], routes: ["IV","Transdermal","Buccal","Intranasal"],
    indications: ["Acute moderate-severe VOC pain (first-line short-acting opioid)","Breakthrough pain","Procedural analgesia"],
    contraindications: ["Severe respiratory depression","Paralytic ileus","Concurrent MAOIs","Known hypersensitivity"],
    warnings: ["⚠️ Respiratory depression — dose-dependent; monitor RR and SpO2","⚠️ Hypotension — especially in hypovolemic patients","⚠️ Dependence and tolerance with prolonged use","⚠️ Ileus and constipation — prescribe stool softeners"],
    sideEffects: ["Respiratory depression","Sedation/drowsiness","Nausea/vomiting","Constipation","Pruritus","Hypotension","Bradycardia","Dizziness"],
    patientInstructions: "For VOC crisis: Take as prescribed for breakthrough pain. Use the lowest effective dose. This is a STRONG opioid — use only for crisis pain. Report difficulty breathing, severe drowsiness, or if pain is not controlled.",
    monitoring: ["Pain score (0-10) before and after administration","Respiratory rate (target >12/min)","Oxygen saturation","Bowel movements — prevent constipation","Signs of dependence/withdrawal"],
    interactions: ["⚠️ Other CNS depressants (benzodiazepines, alcohol) — additive respiratory depression","⚠️ MAOIs — severe reaction","⚠️ CYP3A4 inhibitors (ketoconazole, ritonavir) — ↑ fentanyl levels","Buprenorphine — reduced efficacy"],
    pregnancyCategory: "C — avoid prolonged use in pregnancy; risk of neonatal withdrawal",
    color: "#d97706", tlColor: "#f59e0b",
  },
  "Morphine": {
    drugClass: "Opioid Analgesic (Agonist)",
    mechanism: "μ-opioid receptor agonist → ↑ pain threshold, ↓ pain perception. Gold standard for moderate-severe pain. Used in VOC in SCD.",
    minDose: 2.5, maxDose: 20, unit: "mg",
    commonDoses: ["2.5","5","10","15","20"], frequencies: ["q4h PRN","q4h scheduled"], routes: ["Oral","IV","SC","IM"],
    indications: ["Moderate-severe VOC pain in SCD","Post-operative pain","Severe acute pain (crisis)","Chronic severe pain (with caution)"],
    contraindications: ["Respiratory depression","Paralytic ileus","Head injury (↑ ICP)","MAOI use within 14 days","Severe asthma/COPD exacerbation"],
    warnings: ["⚠️ Respiratory depression — monitoring mandatory","⚠️ Hypotension — histamine release","⚠️ Tolerance and dependence — opioid rotation may help","⚠️ Constipation — prescribe stool softeners"],
    sideEffects: ["Respiratory depression","Sedation","Nausea/vomiting","Constipation","Pruritus","Urinary retention","Hypotension","Dizziness","Miosis"],
    patientInstructions: "Take as prescribed for moderate-severe pain. If pain is not controlled within 30-60 min, contact your doctor. Do NOT take with alcohol or other sedatives. Take stool softeners to prevent constipation.",
    monitoring: ["Pain score (0-10)","Respiratory rate (target >12/min)","Sedation level","Bowel function","Nausea/vomiting","Oxygen saturation"],
    interactions: ["⚠️ All CNS depressants — additive respiratory depression","⚠️ MAOIs — severe excitement/depression","⚠️ CYP2D6 inhibitors (fluoxetine, paroxetine) — altered metabolism"],
    pregnancyCategory: "C — avoid prolonged use; neonatal withdrawal syndrome",
    color: "#d97706", tlColor: "#fbbf24",
  },
  "Ibuprofen": {
    drugClass: "NSAID (Non-Steroidal Anti-Inflammatory)",
    mechanism: "Non-selective COX-1/COX-2 inhibitor → ↓ prostaglandin synthesis → ↓ inflammation and pain.",
    minDose: 200, maxDose: 800, unit: "mg",
    commonDoses: ["200","400","600","800"], frequencies: ["TDS","QDS"], routes: ["Oral"],
    indications: ["Mild-moderate VOC pain","Musculoskeletal pain in SCD","Fever"],
    contraindications: ["Active peptic ulcer/GI bleeding","Severe heart failure","Severe renal impairment (eGFR <30)","Aspirin/NSAID hypersensitivity","Third trimester of pregnancy"],
    warnings: ["⚠️ Renal impairment — SCD patients already at risk; monitor creatinine","⚠️ GI bleeding — risk increases with dose and duration","May mask fever in infection","Avoid dehydration — SCD patients at risk for sickling"],
    sideEffects: ["GI upset/heartburn","Peptic ulcer/GI bleeding","↑ Creatinine","Hypertension","Fluid retention","Dizziness","Headache"],
    patientInstructions: "Take WITH FOOD to reduce stomach upset. Do NOT take if you have a history of stomach ulcers. Drink plenty of water. If you take 3 or more doses daily, your doctor should monitor your kidney function.",
    monitoring: ["Creatinine/eGFR at baseline and if prolonged use","BP","Signs of GI bleeding"],
    interactions: ["⚠️ ACEi/ARBs — reduced antihypertensive effect, ↑ renal risk","⚠️ Diuretics — ↓ efficacy, ↑ renal risk","⚠️ Aspirin — ↑ GI risk","⚠️ Anticoagulants (warfarin, DOACs) — ↑ bleeding"],
    pregnancyCategory: "D (3rd trimester) — CONTRAINDICATED after 20 weeks",
    renalDose: "eGFR 30-60: use with caution, limit dose; eGFR <30: avoid",
    color: "#2563eb", tlColor: "#3b82f6",
  },
  "Paracetamol": {
    drugClass: "Analgesic / Antipyretic (Non-opioid)",
    mechanism: "Central COX inhibition (weak peripheral anti-inflammatory). Analgesic and antipyretic effects. Adjunct for VOC pain management.",
    minDose: 500, maxDose: 1000, unit: "mg",
    commonDoses: ["500","1000"], frequencies: ["QDS"], routes: ["Oral","IV"],
    indications: ["Mild-moderate VOC pain (adjunct)","Fever","Pain in patients with contraindication to NSAIDs"],
    contraindications: ["Severe hepatic impairment","Known hypersensitivity"],
    warnings: ["⚠️ Hepatotoxicity at >4g/day — ALCOHOL USE INCREASES RISK","⚠️ Do not exceed 4g (4000mg) in 24 hours","Check combination products for hidden paracetamol"],
    sideEffects: ["Generally well-tolerated at therapeutic doses","Rash (rare)","Hepatotoxicity (overdose)","Blood dyscrasias (rare)"],
    patientInstructions: "Take every 4-6 hours as needed. Do NOT exceed 4000mg (4g) in 24 hours. CHECK all other medications — many contain paracetamol. Avoid alcohol while taking this medication.",
    monitoring: ["Pain scores","LFTs if prolonged high-dose use"],
    interactions: ["⚠️ Alcohol — increased hepatotoxicity","⚠️ Warfarin — may ↑ INR with chronic high doses"],
    pregnancyCategory: "B — Safe in all trimesters (first choice analgesic in pregnancy)",
    color: "#6d28d9", tlColor: "#7c3aed",
  },
  "Pregabalin": {
    drugClass: "Gabapentinoid / Neuropathic Pain Agent",
    mechanism: "Binds to α2-δ subunit of voltage-gated calcium channels → ↓ Ca2+ influx → ↓ neurotransmitter release → ↓ neuropathic pain.",
    minDose: 75, maxDose: 600, unit: "mg",
    commonDoses: ["75","150","300"], frequencies: ["BD"], routes: ["Oral"],
    indications: ["Chronic neuropathic pain in SCD","Chronic pain syndrome (VOC-related nerve damage)","Fibromyalgia"],
    contraindications: ["Known hypersensitivity","Severe heart failure (NYHA IV)"],
    warnings: ["⚠️ Dizziness and somnolence — impairment (no driving)","⚠️ Suicidal ideation — monitor mood changes","⚠️ Peripheral edema — especially with CCBs","Abrupt withdrawal — insomnia, anxiety, pain, sweating (taper over 1 week)"],
    sideEffects: ["Dizziness (most common)","Somnolence","Peripheral edema","Blurred vision","Dry mouth","Weight gain","Constipation","Ataxia"],
    patientInstructions: "Take TWICE DAILY as directed. This medication causes DROWSINESS and DIZZINESS — do NOT drive, operate machinery until you know how it affects you. Do NOT stop suddenly.",
    monitoring: ["Pain scores (neuropathic component)","Mood assessment","Renal function before and during therapy"],
    interactions: ["⚠️ CNS depressants (opioids, benzodiazepines, alcohol) — additive sedation","⚠️ ACEi/ARBs — may ↑ angioedema risk"],
    pregnancyCategory: "C — avoid if possible; risk of fetal harm unclear",
    renalDose: "CrCl 30-60: 75-300mg/day; CrCl 15-30: 25-150mg/day; CrCl <15: 25-75mg/day",
    color: "#7c3aed", tlColor: "#a855f7",
  },
  "Erythropoietin (EPO)": {
    drugClass: "Hematopoietic Growth Factor",
    mechanism: "Stimulates erythropoiesis in bone marrow → ↑ RBC production. Used in SCD for relative erythropoietin deficiency.",
    minDose: 150, maxDose: 300, unit: "U/kg",
    commonDoses: ["150","300"], frequencies: ["3x/week"], routes: ["SC","IV"],
    indications: ["SCD with relative EPO deficiency","Anemia with low reticulocyte count","Transfusion-dependent SCD (reduce need)","Hydroxyurea-induced anemia"],
    contraindications: ["Uncontrolled hypertension","Pure red cell aplasia (anti-EPO antibodies)","Known hypersensitivity","Active malignancy"],
    warnings: ["⚠️ Hypertension — can worsen BP; monitor closely","⚠️ Thrombotic events — ↑ risk of VOC and stroke","⚠️ Pure red cell aplasia — rare but serious"],
    sideEffects: ["Hypertension","Headache","Arthralgia","Injection site pain","Nausea","Flu-like symptoms","Thrombotic events (rare)","Seizures (rare)"],
    patientInstructions: "This medication is given as an injection under the skin (SC) or into a vein (IV) 3 times per week. Monitor your blood pressure at home — report high readings.",
    monitoring: ["Hb/hematocrit — target: not to exceed 12 g/dL","BP at each visit","Iron studies (ferritin, transferrin saturation)","Reticulocyte count","EPO levels"],
    interactions: ["Iron supplements — essential for response","ACEi/ARBs — may ↓ response","Androgens — may ↑ response"],
    pregnancyCategory: "C — limited data; use if clearly needed",
    color: "#059669", tlColor: "#34d399",
  },
  "Warfarin": {
    drugClass: "Vitamin K Antagonist (Anticoagulant)",
    mechanism: "Inhibits vitamin K-dependent clotting factors (II, VII, IX, X) and proteins C and S. Used for thrombotic events in SCD.",
    minDose: 2, maxDose: 10, unit: "mg",
    commonDoses: ["2","3","4","5","6","7.5","10"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["SCD-related thrombosis (DVT, PE, cerebral sinus thrombosis)","Recurrent VOC with hypercoagulability","Atrial fibrillation (SCD patients)"],
    contraindications: ["Active bleeding","Severe hepatic impairment","Pregnancy (teratogenic — avoid, use LMWH instead)","Uncontrolled bleeding diathesis"],
    warnings: ["⚠️ Narrow therapeutic index — INR monitoring REQUIRED","⚠️ Bleeding — major complication; educate patient","⚠️ Teratogenic — effective contraception mandatory in women","Dietary vitamin K — maintain consistent intake"],
    sideEffects: ["Bleeding (most serious)","Bruising","Rash","Alopecia","Calciphylaxis (rare)","Purple toes syndrome"],
    patientInstructions: "Take ONCE DAILY at the same time each day. You need REGULAR BLOOD TESTS (INR) — typically weekly initially, then monthly. Keep consistent intake of green leafy vegetables (vitamin K).",
    monitoring: ["INR — target 2.0-3.0 (varies by indication)","Hb/Hct","Stool occult blood","Signs of bleeding"],
    interactions: ["⚠️ Many antibiotics — ↑ INR","⚠️ NSAIDs — ↑ bleeding risk","⚠️ Acetaminophen — ↑ INR in high doses","⚠️ Antifungals — ↑ INR"],
    pregnancyCategory: "X — CONTRAINDICATED (teratogenic) — use LMWH instead",
    color: "#dc2626", tlColor: "#ef4444",
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
  hbData: HbReading[],
  vocData: VOCEvent[],
  medications: SCDMedication[],
  complications: SCDComplication[],
  vaccinations: Vaccination[],
  tcdData: TCDReading[],
): ScientificAlert[] {
  const alerts: ScientificAlert[] = [];
  if (!hbData.length) return alerts;
  const latestHb = hbData.at(-1)!;
  if (latestHb.value < 5) {
    alerts.push({ id: "hb_critical", severity: "critical", category: "Severe Anemia",
      title: "Critical Hb: " + latestHb.value + " g/dL",
      detail: "Hb <5 g/dL — severe life-threatening anemia. Immediate exchange transfusion should be considered.",
      evidence: "NHLBI SCD Guidelines 2014; Hb <5 g/dL = threshold for exchange transfusion",
      action: "URGENT: Cross-match blood. Consider exchange transfusion. Assess for aplastic crisis, sequestration, acute chest syndrome. IV fluids, oxygen. Hematology consult.",
      icon: "🚨" });
  } else if (latestHb.value < 7) {
    alerts.push({ id: "hb_severe", severity: "urgent", category: "Anemia",
      title: "Severe Anemia: Hb " + latestHb.value + " g/dL",
      detail: "Hb <7 g/dL — significant anemia requiring investigation. Assess for acute drop, hemolysis, aplastic crisis, or sequestration.",
      evidence: "NHLBI SCD Guidelines 2014; Hb <7 g/dL = threshold for transfusion in steady-state SCD",
      action: "Urgent: Check reticulocyte count, LDH, bilirubin, haptoglobin. Assess spleen size. Consider simple transfusion if symptomatic.",
      icon: "🩸" });
  }
  const hbF = latestHb.hbF ?? 0;
  if (hbF < 20) {
    alerts.push({ id: "hbf_low", severity: "info", category: "HbF Optimization",
      title: "HbF " + hbF + "% — Below Therapeutic Target",
      detail: "HbF <20% suggests hydroxyurea may not be optimized. Target HbF ≥20% for clinical efficacy.",
      evidence: "HbF ≥20% associated with 5-fold reduction in VOC (Platt et al, NEJM 1994).",
      action: "Review hydroxyurea dose. Consider dose escalation if ANC 2000-4000. Check adherence. Consider add-on therapy if max dose tolerated.",
      icon: "📊" });
  }
  const vocCount = vocData.length;
  if (vocCount > 3) {
    alerts.push({ id: "frequent_voc", severity: "urgent", category: "Frequent Crises",
      title: vocCount + " VOC Episodes This Year",
      detail: ">3 VOC per year indicates suboptimal disease control. Guideline-recommended threshold for starting/intensifying hydroxyurea.",
      evidence: "NHLBI SCD 2014: ≥3 VOC/yr = indication for hydroxyurea.",
      action: "Optimize hydroxyurea. Consider adding L-glutamine or crizanlizumab. Assess adherence. Check HbF level.",
      icon: "⚠️" });
  }
  const hospitalized = vocData.filter(v => v.requiresHospitalization).length;
  if (hospitalized > 0) {
    alerts.push({ id: "voc_hospitalized", severity: "warning", category: "VOC Requiring Hospitalization",
      title: hospitalized + " VOC(s) Required Hospitalization",
      detail: "Hospitalized VOC events represent severe crises requiring IV analgesia.",
      evidence: "Severe VOC requiring hospitalization is associated with increased risk of ACS, stroke, and death in SCD",
      action: "Review crisis prevention strategy. Optimize hydroxyurea. Consider add-on therapy. Pain management specialist referral if refractory.",
      icon: "🏥" });
  }
  if (complications.some(c => c.name === "Acute Chest Syndrome")) {
    alerts.push({ id: "acs_history", severity: "warning", category: "ACS History",
      title: "History of Acute Chest Syndrome",
      detail: "Previous ACS episode — highest risk factor for recurrent ACS. ACS is the leading cause of death in SCD.",
      evidence: "ACS accounts for 25% of SCD deaths (Vichinsky et al, NEJM 2000).",
      action: "Vaccinations up-to-date. Incentive spirometry if hospitalized. Optimize hydroxyurea. Low threshold for antibiotics with respiratory symptoms.",
      icon: "🫁" });
  }
  if (complications.some(c => c.name === "Stroke/TIA" || c.name === "Abnormal TCD")) {
    alerts.push({ id: "stroke_history", severity: "critical", category: "Cerebrovascular Disease",
      title: "History of Stroke/TIA or Abnormal TCD",
      detail: "Stroke history or abnormal TCD are the strongest predictors of recurrent stroke in SCD.",
      evidence: "STOP trial: transfusion ↓ stroke risk by 92% in abnormal TCD.",
      action: "If abnormal TCD (>200 cm/s): Start chronic transfusion program (target HbS <30%). If stroke history: Continue transfusions for minimum 3-5 years.",
      icon: "🧠" });
  }
  const latestTCD = tcdData.at(-1);
  if (latestTCD && latestTCD.velocity > 200) {
    alerts.push({ id: "tcd_abnormal", severity: "critical", category: "Abnormal TCD",
      title: "Abnormal TCD: " + latestTCD.velocity + " cm/s",
      detail: "TCD velocity >200 cm/s in " + latestTCD.artery + " — significantly elevated stroke risk.",
      evidence: "STOP trial: TCD >200 cm/s = 10% annual stroke risk without intervention.",
      action: "URGENT: Start chronic transfusion program (target HbS <30%). If conditional (170-199): repeat TCD in 1-3 months.",
      icon: "🧠" });
  }
  if (complications.some(c => c.name === "Priapism")) {
    alerts.push({ id: "priapism", severity: "warning", category: "Priapism",
      title: "Priapism Episode History",
      detail: "Priapism in SCD is a urological emergency. Recurrent episodes can lead to erectile dysfunction.",
      evidence: "35-45% of males with SCD experience priapism. Ischemic priapism >4h requires emergency intervention.",
      action: "Educate patient on home management. If episode >2h: urgent medical evaluation. Consider hydroxyurea optimization. Urology referral.",
      icon: "🔞" });
  }
  if (complications.some(c => c.name === "Splenic Sequestration")) {
    alerts.push({ id: "sequestration", severity: "urgent", category: "Splenic Sequestration",
      title: "History of Splenic Sequestration",
      detail: "Acute splenic sequestration is a life-threatening emergency with rapid drop in Hb and splenic enlargement.",
      evidence: "Most common in children with HbSS. Mortality 10-15% in acute episode.",
      action: "Educate parents on spleen palpation. Urgent: if Hb drop >2g/dL + splenomegaly — transfusion, IV fluids.",
      icon: "🫀" });
  }
  if (complications.some(c => c.name === "Iron Overload" || c.name === "Iron Overload (ferritin >1000)")) {
    alerts.push({ id: "iron_overload", severity: "warning", category: "Iron Overload",
      title: "Iron Overload (Ferritin >1000 ng/mL)",
      detail: "Transfusional iron overload causes progressive organ damage. Ferritin >1000 ng/mL indicates significant iron burden.",
      evidence: "Ferritin >1000 ng/mL correlates with liver iron concentration >3 mg/g.",
      action: "Start/optimize iron chelation (deferasirox or deferoxamine). Monitor ferritin monthly. Annual T2* MRI heart + liver.",
      icon: "🩸" });
  }
  if (complications.some(c => c.name === "Pulmonary Hypertension")) {
    alerts.push({ id: "pulm_htn", severity: "urgent", category: "Pulmonary Hypertension",
      title: "Pulmonary Hypertension (TR jet >2.5 m/s)",
      detail: "Pulmonary HTN in SCD is associated with 40% mortality at 40 months.",
      evidence: "TR jet >2.5 m/s on echo suggests pulmonary HTN. Right heart catheterization confirms.",
      action: "Echocardiogram + BNP. Right heart catheterization if suspected. Cardiology/pulmonology referral.",
      icon: "❤️" });
  }
  if (complications.some(c => c.name === "Retinopathy")) {
    alerts.push({ id: "retinopathy", severity: "warning", category: "Retinopathy",
      title: "Sickle Cell Retinopathy",
      detail: "Proliferative sickle retinopathy (PSR) can cause vision loss. More common in HbSC disease.",
      evidence: "HbSC: 33-43% have PSR. HbSS: 10-15%.",
      action: "Annual dilated fundoscopy. Ophthalmology referral. Laser photocoagulation for sea-fan neovascularization.",
      icon: "👁️" });
  }
  if (complications.some(c => c.name === "Leg Ulcers")) {
    alerts.push({ id: "leg_ulcers", severity: "warning", category: "Leg Ulcers",
      title: "Chronic Leg Ulcers",
      detail: "Venous stasis ulcers in SCD — often bilateral, peri-malleolar. Difficult to heal. High recurrence.",
      evidence: "8-10% of SCD patients develop leg ulcers. Most common in HbSS.",
      action: "Wound care specialist. Compression therapy. Debridement + dressings. Pain management.",
      icon: "🦵" });
  }
  if (complications.some(c => c.name === "Avascular Necrosis (AVN)" || c.name === "Avascular Necrosis")) {
    alerts.push({ id: "avn", severity: "warning", category: "Avascular Necrosis",
      title: "Avascular Necrosis (Femoral/Humeral Head)",
      detail: "AVN due to bone infarction from VOC. Causes chronic pain, functional limitation, and eventual joint collapse.",
      evidence: "10-50% of SCD patients develop AVN. Hip is most common site.",
      action: "Weight-bearing limitation. Orthopedics referral. Core decompression if early stage. Total hip arthroplasty if advanced.",
      icon: "🦴" });
  }
  if (medications.filter(m => m.status === "active" && m.drug.toLowerCase().includes("hydroxyurea")).length === 0 && vocCount > 3) {
    alerts.push({ id: "no_hu", severity: "urgent", category: "Hydroxyurea Indicated",
      title: "Hydroxyurea Not Prescribed Despite Frequent Crises",
      detail: "Patient has >3 VOC/year and is NOT on hydroxyurea — the first-line disease-modifying therapy for SCD.",
      evidence: "NHLBI SCD 2014: Strong recommendation for hydroxyurea in patients with ≥3 VOC/yr.",
      action: "Initiate hydroxyurea therapy (10-35mg/kg/day OD). Check CBC, reticulocytes, HbF, renal function, pregnancy test.",
      icon: "💊" });
  }
  const hasPenicillin = medications.some(m => (m.drug.toLowerCase().includes("penicillin") || m.drug.toLowerCase().includes("amoxicillin")) && m.status === "active");
  if (!hasPenicillin && complications.some(c => c.name === "Splenic Sequestration" || c.name === "Functional Asplenia")) {
    alerts.push({ id: "no_penicillin", severity: "urgent", category: "Prophylaxis Missing",
      title: "Penicillin Prophylaxis Not Prescribed",
      detail: "Patient with functional asplenia not on penicillin prophylaxis — increased risk of fatal pneumococcal sepsis.",
      evidence: "Penicillin prophylaxis reduces pneumococcal disease by 84% in SCD.",
      action: "Start penicillin V: <3y 125mg BD, ≥3y 250mg BD. Ensure pneumococcal vaccination complete.",
      icon: "💊" });
  }
  return alerts;
}

export interface HbReading {
  id: string; patientId: string; date: Date; value: number; unit: string;
  hbF?: number; reticulocytes?: number; ldh?: number; bilirubin?: number;
  source: "lab"|"clinic"|"device";
}

export interface VOCEvent {
  id: string; patientId: string; date: Date; severity: "mild"|"moderate"|"severe";
  location: string; duration: number; unit: string;
  requiresHospitalization: boolean; treatment: string;
  triggers?: string; notes?: string;
}

export interface Transfusion {
  id: string; patientId: string; date: Date; type: "simple"|"exchange"|"partial_exchange";
  volume: number; unit: string; preHb: number; postHb: number;
  preHbS: number; postHbS: number; indication: string;
  reaction?: string; location: string;
}

export interface TCDReading {
  id: string; patientId: string; date: Date; artery: "right_MCA"|"left_MCA"|"right_ACA"|"left_ACA"|"right_PCA"|"left_PCA"|"basilar";
  velocity: number; unit: string; interpretation: "normal"|"conditional"|"abnormal"|"inadequate";
}

export interface SCDMedication {
  id: string; drug: string; medication?: string; dose: string; dosage?: string;
  unit: string; frequency: string; drugClass: string;
  status: "active"|"stopped"|"paused";
  startDate: string; endDate?: string; indication?: string; route?: string;
  instructions?: string; warnings?: string; refills?: number; duration?: string; notes?: string;
  changeHistory?: DoseChange[]; active?: boolean;
}

export interface DoseChange {
  date: string; changeType: "started"|"dose_increase"|"dose_decrease"|"stopped"|"paused"|"restarted";
  previousDose?: string; newDose?: string; changedBy: string; reason?: string;
}

export interface Alert {
  id: string; trigger: string; actions: string[]; createdAt: string; doctorNote?: string; category?: string; history: { date: string; message: string }[];
}

export interface SCDComplication {
  name: string; date: string; details?: string;
}

export interface LifestyleItem { name: string; grade: "Good"|"Moderate"|"Poor"; updatedAt?: string; }

export interface LabOrder {
  name: string; result?: string; orderedAt?: string; type?: "lab"|"imaging"; status?: string; study?: string; modality?: string; bodyPart?: string; urgency?: string;
}

export interface SCDClinicalNote {
  id?: string; date: string; cc?: string; hpi?: string; exam?: string;
  investigations?: string; assessment?: string; plan?: string;
  diagnoses?: string[]; followUps?: string[];
  isLocked?: boolean; lastEditedAt?: string; doctorId?: string; doctorName?: string;
  visitType?: string; vitals?: Record<string, string>;
}

export interface TimelineEvent {
  id: string; date: string; type: "visit"|"med"|"alert"|"reading"|"note"|"lab"; icon: string; title: string; detail?: string;
}

export interface Message {
  id?: string; from: "doctor"|"patient"; senderId?: string; senderName?: string; senderRole?: string; time: string; text: string; read?: boolean; status?: string; threadId?: string; timestamp?: Date;
}

export interface AdherenceMap { [medId: string]: { [date: string]: boolean }; }

export interface ChartPoint { date: string; isoDate: string; value: number; label: string; threshold: number; source: string; }

export interface EducationTopic {
  id: string; title: string; content: string; keyPoints: string[];
  category: string; duration: string; sentAt?: string; acknowledged?: boolean;
}

export interface Vaccination {
  id: string; name: string; date: string; dose: string; dueDate?: string;
  administered: boolean; notes?: string;
}

export const EDUCATION_TOPICS: EducationTopic[] = [
  { id: "scd_basics", title: "Understanding Sickle Cell Disease", content: "Sickle cell disease (SCD) is a genetic blood disorder where red blood cells become crescent-shaped (sickled). These sickled cells are rigid and sticky, blocking blood flow in small vessels, causing pain crises and organ damage. SCD is caused by a mutation in the hemoglobin gene (HbS). When both parents pass on the HbS gene, the child has SCD (HbSS — sickle cell anemia).", keyPoints: ["SCD is inherited — it is not contagious","Sickled cells block blood flow → pain and organ damage","Chronic hemolysis (RBC destruction) leads to anemia","Disease severity varies between individuals","SCD affects every organ system in the body"], category: "Foundation", duration: "5 min" },
  { id: "scd_genetics", title: "SCD Genetics: SS, SC, Sβ-thal", content: "SCD has several genotypes. HbSS (sickle cell anemia) is the most common and often most severe. HbSC is a milder form but carries higher risk of retinopathy. HbSβ-thalassemia varies in severity — Sβ0 is similar to SS, Sβ+ is milder. Knowing the genotype helps predict complications and guide management.", keyPoints: ["HbSS (Sickle Cell Anemia) — most common, most severe","HbSC — milder, but high retinopathy risk","HbSβ0 — similar severity to HbSS","HbSβ+ — milder course","Each child of a carrier has 25% chance of SCD if both parents carry trait"], category: "Foundation", duration: "6 min" },
  { id: "crisis_recognition", title: "Recognizing a Crisis Early", content: "Early recognition of a crisis allows prompt treatment and may prevent hospitalization. Key signs: sudden onset of pain in arms, legs, chest, back, or abdomen. The pain is often described as deep, aching, or sharp. Children may limp, refuse to walk, or cry inconsolably. Fever, pallor, and jaundice may accompany the crisis.", keyPoints: ["Sudden onset pain — hallmark of VOC","Location varies: limbs, back, chest, abdomen","Fever + pain = possible infection, not just crisis","Pallor, jaundice, fatigue may suggest hemolytic crisis","Children: irritability, limping, refusing to eat/drink"], category: "Symptoms", duration: "5 min" },
  { id: "pain_management_home", title: "Pain Management at Home", content: "Mild to moderate crises can be managed at home with oral hydration, warmth, NSAIDs, and paracetamol. Keep a pain diary. Use pain scores to guide your response. If pain does not improve with home measures within 2-4 hours, contact your healthcare provider.", keyPoints: ["Stay hydrated — drink water (not just juice/soda)","Apply warmth (heating pad, warm bath) to painful areas","NSAIDs (ibuprofen 400mg) for mild pain","Paracetamol (500-1000mg) as adjunct","Rest, but avoid complete immobility","If no improvement in 2-4 hours → call doctor"], category: "Crisis Management", duration: "6 min" },
  { id: "when_to_go_hospital", title: "When to Go to Hospital", content: "Some crises cannot be managed at home and require hospital care. Know the warning signs: severe pain not controlled by oral medications, fever >38.5°C, difficulty breathing, chest pain, severe headache, sudden vision changes, priapism >2 hours, or pain in a new location suggests a complication beyond simple VOC.", keyPoints: ["Severe pain not controlled by home meds after 2-4 hours","Fever >38.5°C (101.3°F) — infection risk","Difficulty breathing, chest pain, or cough","Severe headache, vision changes, or confusion","Priapism lasting >2 hours — medical emergency","Sudden pallor or extreme fatigue — possible sequestration/aplastic crisis"], category: "Safety", duration: "4 min" },
  { id: "hydroxyurea_benefits", title: "Hydroxyurea: Benefits and Monitoring", content: "Hydroxyurea (Hydroxycarbamide) is the cornerstone of SCD treatment. It increases fetal hemoglobin (HbF), which reduces sickling and VOC frequency by 50%. It also reduces ACS, transfusion need, and improves survival. It requires monthly CBC monitoring and gradual dose escalation.", keyPoints: ["Reduces VOC by 50% — fewer pain crises","Reduces ACS by 50% and transfusion need","Reduces mortality — proven survival benefit","Increases HbF — the key therapeutic effect","Dose: 10-35mg/kg/day once daily","Monthly CBC during dose titration","Monitor for neutropenia (target ANC 2000-4000)"], category: "Medications", duration: "5 min" },
  { id: "penicillin_prophylaxis", title: "Penicillin Prophylaxis — Why It Matters", content: "SCD causes functional asplenia (the spleen does not work properly), which increases risk of severe bacterial infections, especially pneumococcal sepsis — a leading cause of death in young children with SCD. Daily penicillin prophylaxis reduces this risk by 84%.", keyPoints: ["SCD damages the spleen — unable to filter bacteria","Pneumococcal sepsis is a medical emergency","Penicillin V: <3y 125mg BD, ≥3y 250mg BD","Continue at least until age 5, often lifelong","Amoxicillin alternative if penicillin-allergic","Complete all vaccinations — essential","DO NOT skip doses — even missed weekend doses increase risk"], category: "Medications", duration: "4 min" },
  { id: "vaccination_schedule", title: "SCD Vaccination Schedule", content: "Children and adults with SCD need an enhanced vaccination schedule due to impaired spleen function. In addition to routine vaccines, they need extra pneumococcal vaccines (PCV13, PPSV23), meningococcal (MenACWY, MenB), Haemophilus influenzae type b (Hib), annual influenza, and COVID-19 vaccines.", keyPoints: ["Pneumococcal: PCV13 at 2,4,6,12m + PPSV23 at 2y then @5y","Meningococcal ACWY: 2 doses at 9-12m, then booster @16y","MenB: 2-3 doses from age 2m","Hib: 3-4 doses in infancy","Annual influenza vaccine — mandatory every year","COVID-19 + boosters — all ages eligible"], category: "Prevention", duration: "5 min" },
  { id: "hydration", title: "Staying Hydrated", content: "Dehydration is a major trigger for VOC. It increases blood viscosity and promotes sickling. SCD patients should drink 8-10 glasses of water daily (more in hot weather or with exercise). Thirst is a late sign of dehydration — drink even when not thirsty.", keyPoints: ["Drink 8-10 glasses of water daily — more in heat/exercise","Avoid caffeine and alcohol — they dehydrate","Set phone reminders if you forget to drink","Carry a water bottle always","Signs of dehydration: dark urine, dry mouth, headache","In hot weather: double water intake"], category: "Lifestyle", duration: "3 min" },
  { id: "triggers", title: "Avoiding Crisis Triggers", content: "Common triggers that precipitate VOC include: cold (temperature drop), infection, dehydration, stress, alcohol, smoking, high altitude, vigorous exercise without preparation, and pregnancy. Identifying and avoiding personal triggers is a cornerstone of SCD management.", keyPoints: ["Cold temperature: dress warmly, avoid cold exposure","Infection: hand hygiene, vaccinations, early treatment of fever","Dehydration: drink 8-10 glasses of water daily","Stress: relaxation techniques, adequate sleep","Altitude: avoid >5000ft (1500m) without oxygen","Exercise: stay active but avoid sudden strenuous exertion","Alcohol: avoid or limit — causes dehydration + marrow suppression"], category: "Lifestyle", duration: "5 min" },
  { id: "tcd_stroke", title: "Stroke Prevention: TCD Screening", content: "Stroke affects 10% of children with SCD (highest ages 2-16). Transcranial Doppler (TCD) ultrasound measures blood flow velocity in the brain arteries. Abnormal TCD (>200 cm/s) indicates high stroke risk. Regular TCD screening and treatment reduces stroke risk by 92%.", keyPoints: ["TCD screening: ages 2-16, every 6-12 months","Normal TCD: <170 cm/s — repeat annually","Conditional TCD: 170-199 cm/s — repeat in 1-3 months","Abnormal TCD: >200 cm/s — start chronic transfusion","Transfusion target: HbS <30% before transfusion","Stroke prevention is life-saving — do not miss TCD appointments"], category: "Prevention", duration: "5 min" },
  { id: "leg_ulcer_care", title: "Leg Ulcer Care in SCD", content: "Leg ulcers in SCD typically appear around the ankles (medial malleolus). They result from poor circulation, hemolysis, and venous stasis. Healing is slow and recurrence is common. Treatment requires a multidisciplinary approach including wound care, compression, infection control, and pain management.", keyPoints: ["Keep wound clean and dressed — change dressings daily","Compression stockings (if no arterial disease)","Elevate legs when resting","Pain management: topical and systemic","Avoid trauma to ankles — wear protective footwear","Diet: adequate protein, zinc, vitamin C","Report signs of infection: increased pain, redness, pus, fever"], category: "Complications", duration: "4 min" },
  { id: "priapism_management", title: "Priapism: What to Do", content: "Priapism is a prolonged, painful erection lasting >4 hours. In SCD, it is caused by sickled cells blocking venous outflow (ischemic priapism). It is a medical emergency — delayed treatment causes permanent erectile dysfunction. Home measures: urinate, exercise (jog), drink water, take warm bath.", keyPoints: ["If erection >2 hours: start home measures (urinate, walk, hydration)","If >4 hours: GO TO HOSPITAL IMMEDIATELY","Treatment: aspiration + irrigation, intracavernosal phenylephrine","Hydroxyurea reduces frequency of priapism episodes","Exchange transfusion may be needed for refractory cases","Exercise and hydration may abort early episode"], category: "Emergency", duration: "4 min" },
  { id: "acs_warning", title: "Acute Chest Syndrome Warning Signs", content: "Acute Chest Syndrome (ACS) is a leading cause of death in SCD. It is defined as a new pulmonary infiltrate + fever, chest pain, cough, or wheezing. ACS can develop rapidly over 24-48 hours. ANY respiratory symptom in SCD should be taken seriously.", keyPoints: ["Fever + chest pain = ACS until proven otherwise","Cough, wheezing, shortness of breath","Rapid onset — can progress in hours","Trigger: infection, fat embolism (from bone infarction)","Treatment: antibiotics, oxygen, bronchodilators, transfusion","Prevention: incentive spirometry when hospitalized, vaccinations","High mortality — immediate medical attention required"], category: "Emergency", duration: "5 min" },
  { id: "pregnancy_scd", title: "Family Planning and Pregnancy in SCD", content: "Pregnancy in SCD increases risks for both mother and baby: more frequent crises, preeclampsia, preterm delivery, low birth weight, and miscarriage. However, with specialist multidisciplinary care, most women with SCD have successful pregnancies. Preconception counseling is essential.", keyPoints: ["Preconception counseling: discuss risks and optimize health","Hydroxyurea must be STOPPED before pregnancy","Folic acid 5mg daily essential throughout pregnancy","Prophylactic transfusions debated — individualize","Higher risk of: VOC, preeclampsia, preterm delivery, IUGR","Multidisciplinary care: hematology + obstetrics + anesthesia","Breastfeeding is safe and encouraged"], category: "Life Stages", duration: "6 min" },
  { id: "support_groups", title: "Support Groups and Advocacy", content: "Living with SCD is challenging. Support groups connect you with others who understand. Advocacy organizations provide education, financial assistance, and research updates. No one should go through this alone.", keyPoints: ["Connect with local SCD support groups","National organizations: SCDAA (US), Sickle Cell Society (UK)","Online communities: Facebook groups, forums","Counseling for mental health — chronic illness is hard","Financial assistance programs for medications","School accommodations: water breaks, temperature control","Share your story — advocacy raises awareness"], category: "Support", duration: "4 min" },
];

const COMPLICATIONS = ["Acute Chest Syndrome","Stroke/TIA","Abnormal TCD","Priapism","Splenic Sequestration","Aplastic Crisis","Iron Overload","Pulmonary Hypertension","Retinopathy","Leg Ulcers","Avascular Necrosis (AVN)","Functional Asplenia","Renal Impairment","Gallstones","Chronic Pain Syndrome","Delayed Puberty","Infertility","Osteoporosis"];
const LIFESTYLE_ITEMS = ["Hydration (≥8 glasses/day)","Avoid cold triggers","Infection prevention (hand hygiene)","Moderate exercise (no overexertion)","Adequate sleep (8-10 hours)","Stress management","Alcohol avoidance","Smoking cessation","Balanced nutrition","Regular dental care"];
const SPECIALTIES = ["Hematology","Pain Specialist","Ophthalmology","Orthopedics","Neurology","Wound Care","Social Worker","Genetic Counselor","Cardiology (Pulmonary HTN)","Nephrology","Pulmonology","Psychology/Psychiatry","Physical Therapy","Transfusion Medicine"];
const URGENCIES: string[] = ["routine","urgent","emergency"];
const VISIT_TYPES = ["new_patient","follow_up","emergency","telemedicine","home_visit","discharge_review"];
const LAB_PANEL = ["Hb (Hemoglobin)","HbF (Fetal Hemoglobin)","Hb Electrophoresis","Reticulocyte Count","LDH","Total Bilirubin","Direct Bilirubin","Haptoglobin","CBC with Differential","Platelet Count","Serum Ferritin","Creatinine/eGFR","LFTs (ALT, AST, ALP)","Blood Culture","Iron Studies","Vitamin B12","Folate Level","CRP","ESR","Urinalysis"];
const IMAGING_PANEL = ["Transcranial Doppler (TCD)","Echocardiogram","Chest X-Ray","MRI Brain (silent infarcts)","MRA Brain","Hip X-Ray (AVN)","Abdominal Ultrasound (gallstones)","Dilated Fundoscopy","Renal Doppler Ultrasound","Liver Iron MRI (FerriScan)","Cardiac T2* MRI","DEXA Scan (osteoporosis)"];
const DRUGS = ["Hydroxyurea","Folic Acid","Penicillin V","Amoxicillin","L-glutamine (Endari)","Crizanlizumab (Adakveo)","Voxelotor (Oxbryta)","Deferasirox (Exjade/Jadenu)","Deferoxamine (Desferal)","Fentanyl","Morphine","Ibuprofen","Diclofenac","Paracetamol","Pregabalin","Gabapentin","Erythropoietin (EPO)","Warfarin","LMWH"];
const FREQS = ["OD (Once daily)","BD (Twice daily)","TDS (Three times daily)","QDS (Four times daily)","Nocte (At bedtime)","PRN (As needed)","Weekly","Alternate days","Every 4 weeks","Monthly"];
const UNITS = ["mg","mcg","g","mL","IU","U/kg","mg/kg"];
const ROUTES_LIST = ["Oral","Sublingual","IV","IM","SC","Topical","Transdermal","Inhaled","Buccal","Intranasal"];
const VACCINATIONS_LIST = ["PCV13 (Pneumococcal)","PPSV23 (Pneumococcal)","MenACWY (Meningococcal)","MenB (Meningococcal B)","Hib","Hepatitis B","DTaP","Polio (IPV)","MMR","Varicella","Influenza (Annual)","COVID-19","RSV","Rotavirus"];

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

const GLOBAL_CSS = `
  .scd-root*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  .scd-root{font-family:"DM Sans","Plus Jakarta Sans","Segoe UI",system-ui,sans-serif}
  @keyframes scd-pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes scd-fade-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .scd-fade{animation:scd-fade-in 0.18s ease}
  .scd-scroll{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.12) transparent}
  .scd-scroll::-webkit-scrollbar{width:4px;height:4px}
  .scd-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}
  .scd-btn-press{transition:transform 0.1s,opacity 0.1s}
  .scd-btn-press:active{transform:scale(0.97);opacity:0.85}
  @media(max-width:640px){
    .scd-wa-track{display:none!important}
    .scd-desktop-layout{display:none!important}
    .scd-page-header{display:none!important}
    .scd-root{position:fixed!important;inset:0!important;overflow:hidden!important;padding:0!important;display:flex!important;flex-direction:column!important}
    .scd-mobile-list{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow-y:auto!important;background:#fff!important}
    .scd-mobile-list.hidden{display:none!important}
    .scd-mobile-detail{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#f9fafb!important}
    .scd-mobile-detail.hidden{display:none!important}
    .scd-list-topbar{position:sticky!important;top:0!important;z-index:20!important;background:#7c3aed!important;color:#fff!important;padding:14px 16px 10px!important;min-height:56px!important;flex-shrink:0!important}
    .scd-list-topbar h2{color:#fff!important;font-size:17px!important;margin:0!important;font-weight:800}
    .scd-list-topbar p{color:rgba(255,255,255,.75)!important;font-size:11px!important;margin:2px 0 0!important}
    .scd-list-search{padding:8px 12px!important;background:#f9fafb!important;position:sticky!important;top:56px!important;z-index:9!important;border-bottom:0.5px solid rgba(0,0,0,.07)!important;flex-shrink:0!important}
    .scd-list-search input{width:100%!important;border-radius:20px!important;padding:8px 14px!important;border:none!important;background:#ececec!important;font-size:14px!important;outline:none!important;font-family:inherit!important}
    .scd-patient-btn{width:100%!important;display:flex!important;align-items:center!important;gap:12px!important;padding:12px 16px!important;border:none!important;border-bottom:.5px solid rgba(0,0,0,.07)!important;background:#fff!important;cursor:pointer!important;text-align:left!important;min-height:64px!important}
    .scd-patient-btn:active,.scd-patient-btn.active-row{background:#f5f3ff!important}
    .scd-patient-avatar{width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(124,58,237,.12)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:19px!important;font-weight:800!important;color:#7c3aed!important;flex-shrink:0!important}
    .scd-patient-row-info{flex:1!important;min-width:0!important}
    .scd-patient-row-name{font-weight:600;font-size:14px;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .scd-patient-row-sub{font-size:11px;color:#9ca3af;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .scd-detail-topbar{position:sticky!important;top:0!important;z-index:20!important;background:#7c3aed!important;padding:10px 14px!important;display:flex!important;align-items:center!important;gap:10px!important;min-height:56px!important;flex-shrink:0!important}
    .scd-back-btn{background:none!important;border:none!important;color:#fff!important;font-size:28px!important;cursor:pointer!important;padding:0 8px 0 0!important;flex-shrink:0!important;line-height:1!important}
    .scd-detail-topbar-avatar{width:36px!important;height:36px!important;border-radius:50%!important;background:rgba(255,255,255,.25)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:800!important;font-size:16px!important;flex-shrink:0!important;color:#fff!important}
    .scd-detail-topbar-info{flex:1!important;min-width:0!important;overflow:hidden!important}
    .scd-detail-topbar-name{font-weight:700;font-size:15px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .scd-detail-topbar-sub{font-size:11px;color:rgba(255,255,255,.8)}
    .scd-detail-content{flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;padding:10px 10px 100px!important;-webkit-overflow-scrolling:touch!important;width:100%!important}
    .scd-stat-row{gap:5px!important;flex-wrap:wrap!important}
    .scd-stat-card{min-width:65px!important;padding:7px 7px!important;flex:1!important}
    .scd-stat-card .sv{font-size:14px!important}
    .scd-tabs-wrap{position:sticky!important;top:56px!important;z-index:15!important;background:#fff!important;border-bottom:.5px solid rgba(0,0,0,.08)!important;flex-shrink:0!important;width:100%!important}
    .scd-tabs{display:flex!important;overflow-x:auto!important;flex-wrap:nowrap!important;padding:4px 8px!important;gap:2px!important;background:#fff!important;border-radius:0!important;border:none!important;margin-bottom:0!important;width:100%!important}
    .scd-tabs::-webkit-scrollbar{display:none!important}
    .scd-tab-btn{font-size:10px!important;padding:5px 8px!important;white-space:nowrap!important;min-height:32px!important}
    .scd-panel{padding:12px!important;border-radius:10px!important;overflow-x:hidden!important}
    .scd-comp-grid{grid-template-columns:1fr 1fr!important}
    .scd-note-grid{grid-template-columns:1fr!important}
    .scd-labs-grid{grid-template-columns:1fr!important}
    .scd-ref-grid{grid-template-columns:1fr!important}
    .scd-detail-content *{max-width:100%!important}
    table{display:block!important;overflow-x:auto!important;width:100%!important}
  }
  @media(min-width:641px) and (max-width:1023px){
    .scd-wa-track{display:none!important}
    .scd-mobile-list,.scd-mobile-detail{display:none!important}
    .scd-desktop-layout{display:flex!important}
    .scd-patient-list{width:240px!important;flex-shrink:0!important}
    .scd-tabs{flex-wrap:wrap!important}
    .scd-tab-btn{font-size:11px!important}
    .scd-note-grid{grid-template-columns:1fr 1fr!important}
    .scd-labs-grid{grid-template-columns:1fr 1fr!important}
    .scd-ref-grid{grid-template-columns:1fr 1fr!important}
    .scd-comp-grid{grid-template-columns:1fr 1fr 1fr!important}
  }
  @media(min-width:1024px){
    .scd-wa-track{display:none!important}
    .scd-mobile-list,.scd-mobile-detail{display:none!important}
    .scd-desktop-layout{display:flex!important}
    .scd-patient-list{width:290px!important;flex-shrink:0!important}
    .scd-tabs{flex-wrap:wrap!important}
    .scd-tab-btn{font-size:11px!important}
    .scd-note-grid{grid-template-columns:1fr 1fr!important}
    .scd-labs-grid{grid-template-columns:1fr 1fr!important}
    .scd-ref-grid{grid-template-columns:1fr 1fr!important}
    .scd-comp-grid{grid-template-columns:1fr 1fr 1fr!important}
  }
`;

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
  return <span style={{ padding: "2px 7px", borderRadius: 5, background: bg, color, border: "0.5px solid " + border, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="scd-stat-card" style={{ background: T.bg, border: "0.5px solid " + T.border, borderTop: "2px solid " + (color ?? T.border), borderRadius: 10, padding: "10px 13px", flex: 1, minWidth: 90 }}>
      <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div className="sv" style={{ color: color ?? T.text, fontSize: 18, fontWeight: 800, lineHeight: 1.1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ color: T.faint, fontSize: 10 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={"scd-panel scd-fade" + (className ? " " + className : "")} style={{ background: T.card, border: "0.5px solid " + T.border, borderRadius: 14, padding: "16px 18px", ...style }}>{children}</div>;
}

function Skeleton({ height = 200 }: { height?: number }) {
  return <div style={{ height, background: T.bg, borderRadius: 10, border: "0.5px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.faint, fontSize: 13 }}><span style={{ animation: "scd-pulse 1.4s ease-in-out infinite" }}>Loading…</span></div>;
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
    <button onClick={onClick} disabled={disabled} className="scd-btn-press" style={{
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

function exportNoteAsPDF(note: SCDClinicalNote, patientName: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Clinical Note — ' + patientName + '</title><style>body{font-family:"Segoe UI",Arial,sans-serif;padding:40px;color:#111;background:#fff;max-width:800px;margin:0 auto}.header{border-bottom:3px solid #7c3aed;padding-bottom:16px;margin-bottom:24px}.logo{color:#7c3aed;font-size:22px;font-weight:800}.sub{color:#6b7280;font-size:12px;margin-top:4px}.patient{background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;border-left:4px solid #7c3aed}.section{margin-bottom:16px;page-break-inside:avoid}.section-title{color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;border-bottom:0.5px solid #e5e7eb;padding-bottom:4px}.section-content{font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap}.footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between}.badge{display:inline-block;padding:2px 8px;border-radius:4px;background:#f3e8ff;color:#7c3aed;font-size:11px;font-weight:600;margin-left:8px}@media print{body{padding:20px}.no-print{display:none}}</style></head><body><div class="header"><div class="logo">🩸 AMEXAN Health System</div><div class="sub">SCD Control Center — Clinical Note</div></div><div class="patient"><strong>Patient:</strong> ' + patientName + ' &nbsp;|&nbsp; <strong>Date:</strong> ' + note.date + ' &nbsp;|&nbsp; <strong>Visit Type:</strong> ' + (note.visitType ?? "Clinic Visit") + ' &nbsp;|&nbsp; <strong>Doctor:</strong> ' + (note.doctorName ?? "AMEXAN") + '<span class="badge">SCD</span></div>');
  if (note.cc) w.document.write('<div class="section"><div class="section-title">Chief Complaint</div><div class="section-content">' + note.cc + '</div></div>');
  if (note.hpi) w.document.write('<div class="section"><div class="section-title">History of Present Illness</div><div class="section-content">' + note.hpi + '</div></div>');
  if (note.exam) w.document.write('<div class="section"><div class="section-title">Examination Findings</div><div class="section-content">' + note.exam + '</div></div>');
  if (note.investigations) w.document.write('<div class="section"><div class="section-title">Investigations</div><div class="section-content">' + note.investigations + '</div></div>');
  if (note.assessment) w.document.write('<div class="section"><div class="section-title">Assessment / Diagnosis</div><div class="section-content">' + note.assessment + '</div></div>');
  if (note.plan) w.document.write('<div class="section"><div class="section-title">Management Plan</div><div class="section-content">' + note.plan + '</div></div>');
  if (note.followUps?.length) w.document.write('<div class="section"><div class="section-title">Follow-up Instructions</div><div class="section-content">' + note.followUps.join("\n") + '</div></div>');
  w.document.write('<div class="footer"><span>AMEXAN Health System · SCD Monitoring</span><span>Generated: ' + new Date().toLocaleString() + '</span><span>Note ID: ' + (note.id ?? "—") + '</span></div><script>window.onload = function(){ window.print(); }<\/script></body></html>');
  w.document.close();
}

function HbTrendTab({ readings = [] }: { readings?: HbReading[]; [key: string]: any }) {
  const [filter, setFilter] = useState<"all"|"low"|"critical">("all");
  const filtered = useMemo(() => {
    const r = [...readings].reverse();
    if (filter === "low") return r.filter(x => x.value < 7);
    if (filter === "critical") return r.filter(x => x.value < 5);
    return r;
  }, [readings, filter]);
  if (!readings.length) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🩸</div>
      <div style={{ color: T.muted, fontSize: 13 }}>No Hb readings recorded yet.</div>
    </div>
  );
  const latest = readings.at(-1);
  return (
    <div>
      <SectHeader label="Hb / HbF Trend" color={T.danger} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: latest && latest.value < 5 ? "#fef2f2" : T.bg, borderRadius: 8, padding: "10px 12px", border: "0.5px solid " + T.border }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.faint, textTransform: "uppercase" }}>Latest Hb</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: latest && latest.value < 7 ? T.danger : T.text }}>{(latest?.value.toFixed(1) ?? "—")} <span style={{ fontSize: 12, fontWeight: 400, color: T.faint }}>g/dL</span></div>
          {latest && <div style={{ fontSize: 10, color: latest.value < 5 ? T.danger : latest.value < 7 ? T.warn : T.success, fontWeight: 600 }}>{latest.value < 5 ? "CRITICAL — exchange transfusion threshold" : latest.value < 7 ? "Severe anemia — action needed" : "Stable"}</div>}
        </div>
        <div style={{ background: T.bg, borderRadius: 8, padding: "10px 12px", border: "0.5px solid " + T.border }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.faint, textTransform: "uppercase" }}>Latest HbF</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.purple }}>{(latest?.hbF?.toFixed(1) ?? "—")} <span style={{ fontSize: 12, fontWeight: 400, color: T.faint }}>%</span></div>
          {latest?.hbF !== undefined && <div style={{ fontSize: 10, color: latest.hbF < 20 ? T.warn : T.success, fontWeight: 600 }}>{latest.hbF < 20 ? "Below target (<20%) — optimize hydroxyurea" : "Therapeutic target met (≥20%)"}</div>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {(["all","low","critical"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 10px", borderRadius: 6, border: "0.5px solid " + (filter===f?T.info:T.border), background: filter===f?"#eff6ff":"transparent", color: filter===f?T.info:T.faint, fontSize: 11, fontWeight: filter===f?700:500, cursor: "pointer", fontFamily: "inherit" }}>
            {f === "all" ? "All (" + readings.length + ")" : f === "low" ? "<7 g/dL (" + readings.filter(x=>x.value<7).length + ")" : "<5 g/dL (" + readings.filter(x=>x.value<5).length + ")"}
          </button>
        ))}
      </div>
      <div className="scd-scroll" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
          <thead><tr>{["Date","Hb (g/dL)","HbF (%)","Reticulocytes","LDH","Bilirubin","Status"].map(h => (<th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: "0.5px solid " + T.border, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>))}</tr></thead>
          <tbody>{filtered.slice(0, 50).map((r, i) => (
            <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: "0.5px solid " + T.border }}>
              <td style={{ padding: "8px 10px", color: T.muted, whiteSpace: "nowrap" }}>{r.date instanceof Date ? r.date.toLocaleDateString() : String(r.date)}</td>
              <td style={{ padding: "8px 10px", fontWeight: 800, color: r.value < 5 ? T.danger : r.value < 7 ? T.warn : T.text }}>{r.value.toFixed(1)}</td>
              <td style={{ padding: "8px 10px", color: T.purple }}>{r.hbF?.toFixed(1) ?? "—"}</td>
              <td style={{ padding: "8px 10px", color: r.reticulocytes !== undefined && r.reticulocytes < 1 ? T.danger : T.muted }}>{r.reticulocytes !== undefined ? r.reticulocytes.toFixed(1) + "%" : "—"}</td>
              <td style={{ padding: "8px 10px", color: T.muted }}>{r.ldh !== undefined ? r.ldh + " U/L" : "—"}</td>
              <td style={{ padding: "8px 10px", color: r.bilirubin !== undefined && r.bilirubin > 2 ? T.warn : T.muted }}>{r.bilirubin !== undefined ? r.bilirubin.toFixed(1) + " mg/dL" : "—"}</td>
              <td style={{ padding: "8px 10px" }}>{r.value < 5 ? <Badge text="Critical" color="#fff" bg="#dc2626" border="#b91c1c" /> : r.value < 7 ? <Badge text="Low" color={T.warn} bg="#fff7ed" border="#fde68a" /> : <Badge text="Stable" color={T.success} bg="#f0fdf4" border="#86efac" />}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function VOCTab({ events = [] }: { events?: VOCEvent[]; [key: string]: any }) {
  const [filter, setFilter] = useState<"all"|"mild"|"moderate"|"severe">("all");
  const filtered = useMemo(() => {
    const r = [...events].reverse();
    if (filter !== "all") return r.filter(x => x.severity === filter);
    return r;
  }, [events, filter]);
  const severeCount = events.filter(e => e.severity === "severe").length;
  const hospCount = events.filter(e => e.requiresHospitalization).length;
  if (!events.length) return <div style={{ color: T.faint, textAlign: "center", padding: "24px 0" }}>No VOC events recorded.</div>;
  return (
    <div>
      <SectHeader label={"VOC Tracker (" + events.length + " total)"} color={T.warn} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
        <StatCard label="Total Events" value={String(events.length)} sub={events.filter(e => {const d=new Date(); d.setFullYear(d.getFullYear()-1); return new Date(e.date)>=d;}).length + " in last year"} color={T.warn} />
        <StatCard label="Severe" value={String(severeCount)} sub={severeCount > 0 ? "Requiring IV analgesia" : "None severe"} color={severeCount > 0 ? T.danger : T.success} />
        <StatCard label="Hospitalized" value={String(hospCount)} sub={hospCount > 0 ? "Admissions" : "All managed at home"} color={hospCount > 0 ? T.danger : T.success} />
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {(["all","mild","moderate","severe"] as const).map(f => {
          const count = f==="all" ? events.length : events.filter(function(x){return x.severity===f}).length;
          return (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 10px", borderRadius: 6, border: "0.5px solid " + (filter===f?T.warn:T.border), background: filter===f?"#fff7ed":"transparent", color: filter===f?T.warn:T.faint, fontSize: 11, fontWeight: filter===f?700:500, cursor: "pointer", fontFamily: "inherit" }}>
            {f.charAt(0).toUpperCase()+f.slice(1)} ({count})
          </button>
          );
        })}
      </div>
      <div className="scd-scroll" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
          <thead><tr>{["Date","Severity","Location","Duration","Hospitalized","Treatment","Triggers"].map(h => (<th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: "0.5px solid " + T.border, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>))}</tr></thead>
          <tbody>{filtered.slice(0, 50).map((v, i) => (
            <tr key={v.id} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: "0.5px solid " + T.border }}>
              <td style={{ padding: "8px 10px", whiteSpace: "nowrap", color: T.muted }}>{v.date instanceof Date ? v.date.toLocaleDateString() : String(v.date)}</td>
              <td style={{ padding: "8px 10px" }}><Badge text={v.severity.toUpperCase()} color={v.severity==="severe"?T.danger:v.severity==="moderate"?T.warn:T.info} bg={v.severity==="severe"?"#fef2f2":v.severity==="moderate"?"#fff7ed":"#eff6ff"} border={"#d1d5db"} /></td>
              <td style={{ padding: "8px 10px", color: T.muted }}>{v.location}</td>
              <td style={{ padding: "8px 10px", color: T.muted }}>{v.duration} {v.unit}</td>
              <td style={{ padding: "8px 10px" }}>{v.requiresHospitalization ? <Badge text="Yes" color={T.danger} bg="#fef2f2" border="#fca5a5" /> : <span style={{ color: T.faint }}>No</span>}</td>
              <td style={{ padding: "8px 10px", color: T.muted, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.treatment}</td>
              <td style={{ padding: "8px 10px", color: T.faint, maxWidth: 100 }}>{v.triggers ?? "—"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function TransfusionTab({ transfusions }: { transfusions: Transfusion[]; [key: string]: any }) {
  if (!transfusions.length) return <div style={{ color: T.faint, textAlign: "center", padding: "24px 0" }}>No transfusion history recorded.</div>;
  return (
    <div>
      <SectHeader label={"Transfusion History (" + transfusions.length + ")"} color={T.danger} />
      <div className="scd-scroll" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700 }}>
          <thead><tr>{["Date","Type","Volume","Pre-Hb","Post-Hb","Pre-HbS","Post-HbS","Indication","Reaction"].map(h => (<th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: "0.5px solid " + T.border, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>))}</tr></thead>
          <tbody>{transfusions.map((t, i) => (
            <tr key={t.id} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: "0.5px solid " + T.border }}>
              <td style={{ padding: "8px 10px", whiteSpace: "nowrap", color: T.muted }}>{t.date instanceof Date ? t.date.toLocaleDateString() : String(t.date)}</td>
              <td style={{ padding: "8px 10px" }}><Badge text={t.type.replace(/_/g," ")} color={T.info} bg="#eff6ff" border="#bfdbfe" /></td>
              <td style={{ padding: "8px 10px", color: T.muted }}>{t.volume} {t.unit}</td>
              <td style={{ padding: "8px 10px", fontWeight: 700, color: t.preHb < 7 ? T.danger : T.text }}>{t.preHb.toFixed(1)}</td>
              <td style={{ padding: "8px 10px", fontWeight: 700, color: T.success }}>{t.postHb.toFixed(1)}</td>
              <td style={{ padding: "8px 10px", color: t.preHbS > 30 ? T.warn : T.muted }}>{t.preHbS}%</td>
              <td style={{ padding: "8px 10px", color: T.success }}>{t.postHbS}%</td>
              <td style={{ padding: "8px 10px", color: T.muted }}>{t.indication}</td>
              <td style={{ padding: "8px 10px", color: t.reaction ? T.danger : T.faint }}>{t.reaction ?? "None"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function ACSHistoryTab({ complications }: { complications: SCDComplication[]; [key: string]: any }) {
  const acsEvents = complications.filter(c => c.name === "Acute Chest Syndrome");
  if (!acsEvents.length) return <div style={{ color: T.faint, textAlign: "center", padding: "24px 0" }}>No ACS history recorded.</div>;
  return (
    <div>
      <SectHeader label="Acute Chest Syndrome History" color={T.warn} />
      {acsEvents.map((c, i) => (
        <div key={i} style={{ background: "#fff7ed", borderRadius: 8, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #fed7aa" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.warn }}>ACS Episode — {c.date}</div>
          {c.details && <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{c.details}</div>}
        </div>
      ))}
    </div>
  );
}

function HydroxyureaTab({ medications, patientId }: { medications: SCDMedication[]; patientId: string; [key: string]: any }) {
  const hu = medications.find(m => m.status === "active" && m.drug.toLowerCase().includes("hydroxyurea"));
  if (!hu) return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>💊</div>
      <div style={{ color: T.muted, fontSize: 13 }}>Hydroxyurea not currently prescribed.</div>
      <div style={{ color: T.faint, fontSize: 11, marginTop: 5 }}>Consider initiation if ≥3 VOC/year or based on clinical indication.</div>
    </div>
  );
  return (
    <div>
      <SectHeader label="Hydroxyurea Dose Management" color={T.purple} />
      <div style={{ background: "#f5f3ff", borderRadius: 10, padding: "12px 14px", border: "0.5px solid #ddd6fe", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div><div style={{ fontSize: 10, fontWeight: 700, color: T.faint }}>Current Dose</div><div style={{ fontWeight: 800, fontSize: 18, color: T.purple }}>{hu.dose}{hu.unit}</div></div>
          <div><div style={{ fontSize: 10, fontWeight: 700, color: T.faint }}>Frequency</div><div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{hu.frequency}</div></div>
          <div><div style={{ fontSize: 10, fontWeight: 700, color: T.faint }}>Status</div><div style={{ fontWeight: 700, fontSize: 14, color: T.success }}>Active</div></div>
        </div>
      </div>
      <div style={{ background: T.bg, borderRadius: 8, padding: "10px 12px", border: "0.5px solid " + T.border, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 6 }}>Titration Protocol</div>
        <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>Start at 10-15 mg/kg/day. Escalate by 5mg/kg/day every 8-12 weeks. Target: mild myelosuppression (ANC 2000-4000). Maximum: 35mg/kg/day. Monitor CBC monthly during titration.</div>
      </div>
      {hu.changeHistory && hu.changeHistory.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 6 }}>Change History</div>
          {hu.changeHistory.map((ch, i) => {
            const cc = CHANGE_COLORS[ch.changeType] ?? CHANGE_COLORS.started;
            return <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 4 }}><span style={{ color: T.faint }}>{ch.date}</span><span style={{ color: cc.color, fontWeight: 600 }}>{cc.label}</span>{ch.previousDose && ch.newDose && <span style={{ color: T.muted }}>{ch.previousDose} → {ch.newDose}</span>}</div>;
          })}
        </div>
      )}
    </div>
  );
}

function TCDTab({ readings = [] }: { readings?: TCDReading[]; [key: string]: any }) {
  const latestRight = useMemo(() => readings.filter(r=>r.artery==="right_MCA").at(-1), [readings]);
  const latestLeft = useMemo(() => readings.filter(r=>r.artery==="left_MCA").at(-1), [readings]);
  if (!readings.length) return <div style={{ color: T.faint, textAlign: "center", padding: "24px 0" }}>No TCD results recorded.</div>;
  return (
    <div>
      <SectHeader label="TCD Velocities" color={T.info} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: latestRight ? (latestRight.velocity > 200 ? "#fef2f2" : latestRight.velocity >= 170 ? "#fff7ed" : "#f0fdf4") : T.bg, borderRadius: 10, padding: "12px 14px", border: "0.5px solid " + T.border }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase" }}>Right MCA</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: latestRight && latestRight.velocity > 200 ? T.danger : latestRight && latestRight.velocity >= 170 ? T.warn : T.text }}>{(latestRight?.velocity ?? "—")} <span style={{ fontSize: 12 }}>cm/s</span></div>
          {latestRight && <div style={{ fontSize: 11, fontWeight: 600, color: latestRight.velocity > 200 ? T.danger : latestRight.velocity >= 170 ? T.warn : T.success }}>{latestRight.interpretation.charAt(0).toUpperCase() + latestRight.interpretation.slice(1)}</div>}
        </div>
        <div style={{ background: latestLeft ? (latestLeft.velocity > 200 ? "#fef2f2" : latestLeft.velocity >= 170 ? "#fff7ed" : "#f0fdf4") : T.bg, borderRadius: 10, padding: "12px 14px", border: "0.5px solid " + T.border }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase" }}>Left MCA</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: latestLeft && latestLeft.velocity > 200 ? T.danger : latestLeft && latestLeft.velocity >= 170 ? T.warn : T.text }}>{(latestLeft?.velocity ?? "—")} <span style={{ fontSize: 12 }}>cm/s</span></div>
          {latestLeft && <div style={{ fontSize: 11, fontWeight: 600, color: latestLeft.velocity > 200 ? T.danger : latestLeft.velocity >= 170 ? T.warn : T.success }}>{latestLeft.interpretation.charAt(0).toUpperCase() + latestLeft.interpretation.slice(1)}</div>}
        </div>
      </div>
    </div>
  );
}

function PharmaCard({ drug }: { drug: string }) {
  const info = getDrugInfo(drug);
  const [expanded, setExpanded] = useState(false);
  if (!info) return null;
  return (
    <div style={{ border: "0.5px solid #ddd6fe", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <button onClick={() => setExpanded(p => !p)} style={{ width: "100%", padding: "9px 12px", display: "flex", alignItems: "center", gap: 8, background: "#f5f3ff", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
        <span style={{ fontSize: 14 }}>💊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: T.purple, fontSize: 12 }}>SCD Pharmacological Reference: {drug}</div>
          <div style={{ color: "#a78bfa", fontSize: 10 }}>{info.drugClass} · Dose: {info.minDose}–{info.maxDose}{info.unit} · {info.pregnancyCategory} pregnancy</div>
        </div>
        <span style={{ color: T.purple, fontSize: 11 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "12px 14px", background: T.card, borderTop: "0.5px solid #ddd6fe" }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: T.muted, lineHeight: 1.5 }}><strong style={{ color: T.text }}>Mechanism:</strong> {info.mechanism}</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 4 }}>Dosing Range</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{info.commonDoses.map(d => <span key={d} style={{ background: "#f5f3ff", color: T.purple, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, border: "0.5px solid #ddd6fe" }}>{d}{info.unit}</span>)}<span style={{ color: T.faint, fontSize: 10, alignSelf: "center" }}>Min: {info.minDose}{info.unit} | Max: {info.maxDose}{info.unit}</span></div>
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
          {info.monitoring.length > 0 && <div><div style={{ fontSize: 10, fontWeight: 700, color: T.purple, textTransform: "uppercase", marginBottom: 4 }}>🔬 Monitoring Required</div><div style={{ fontSize: 11, color: T.muted }}>{info.monitoring.join(" · ")}</div></div>}
          {info.renalDose && <div style={{ marginTop: 6, fontSize: 11, color: T.teal }}><strong>Renal dosing:</strong> {info.renalDose}</div>}
        </div>
      )}
    </div>
  );
}

function SCDMedicationsTab({ patientId }: { patientId: string; [key: string]: any }) {
  const [prescriptions, setPrescriptions] = useState<SCDMedication[]>([]);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  useEffect(() => {
    const q = query(collection(db, "prescriptions"), where("patientId","==",patientId), orderBy("createdAt","desc"));
    return onSnapshot(q, snap => setPrescriptions(snap.docs.map(d => ({id:d.id,...d.data()}) as SCDMedication)));
  }, [patientId]);
  const groups = { Active: prescriptions.filter(p => p.status === "active" || (!p.status)), Paused: prescriptions.filter(p => p.status === "paused"), Stopped: prescriptions.filter(p => p.status === "stopped") };
  const allSCD = ["hydroxyurea","folic acid","penicillin","amoxicillin","l-glutamine","crizanlizumab","voxelotor","deferasirox","deferoxamine","fentanyl","morphine","ibuprofen","paracetamol","pregabalin","erythropoietin","warfarin"];
  return (
    <div style={{ padding: "0 0 24px" }}>
      <SectHeader label="SCD Medications" color={T.purple} sub={prescriptions.length + " total"} />
      {(Object.entries(groups) as [string, SCDMedication[]][]).filter(([,list]) => list.length > 0).map(([label, list]) => (
        <div key={label} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
          {list.map(rx => (
            <div key={rx.id} style={{ border: "0.5px solid " + T.border, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
              <div role="button" tabIndex={0} onClick={() => setExpandedId(e => e === rx.id ? null : rx.id)} onKeyDown={e => e.key === "Enter" && setExpandedId(e => e === rx.id ? null : rx.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", cursor: "pointer", background: allSCD.some(s => rx.drug.toLowerCase().includes(s)) ? "#f5f3ff" : "transparent" }}>
                <span style={{ fontSize: 16 }}>💊</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{rx.drug}</div><div style={{ fontSize: 11, color: T.faint }}>{rx.dose}{rx.unit} · {rx.frequency} · {rx.route ?? "Oral"}</div></div>
                <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: rx.status === "active" ? "#f0fdf4" : rx.status === "paused" ? "#fffbeb" : "#f3f4f6", color: rx.status === "active" ? T.success : rx.status === "paused" ? T.warn : T.faint }}>{rx.status || "active"}</span>
                <span style={{ color: T.faint, fontSize: 14 }}>{expandedId === rx.id ? "▲" : "▼"}</span>
              </div>
              {expandedId === rx.id && <PharmaCard drug={rx.drug.split(" ")[0].replace(/[^a-zA-Z-]/g,"")} />}
            </div>
          ))}
        </div>
      ))}
      {!prescriptions.length && <div style={{ textAlign: "center", padding: "32px 0", color: T.faint, fontSize: 13 }}>No medications prescribed.</div>}
    </div>
  );
}

function PainManagementTab(_props: { [key: string]: any }) {
  return (
    <div>
      <SectHeader label="Pain Management Protocol" color={T.orange} />
      <div style={{ background: "#fff7ed", borderRadius: 10, padding: "12px 14px", border: "0.5px solid #fed7aa", marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.warn, marginBottom: 6 }}>WHO Sickle Cell Pain Ladder</div>
        <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.7 }}>
          <strong>Step 1 — Mild pain:</strong> Paracetamol 500-1000mg QDS ± NSAIDs (Ibuprofen 400mg TDS). Hydration, warmth, rest, distraction.<br />
          <strong>Step 2 — Moderate pain:</strong> Step 1 + Weak opioid (Codeine 30-60mg q4h) or Tramadol 50-100mg q4h.<br />
          <strong>Step 3 — Severe pain (VOC):</strong> Morphine 0.1-0.2mg/kg IV/SC q2-4h or Fentanyl 25-100mcg IV PRN. Patient-controlled analgesia (PCA) if available. Hydration 3L/day IV. Incentive spirometry.
        </div>
      </div>
      <div style={{ background: T.bg, borderRadius: 8, padding: "10px 12px", border: "0.5px solid " + T.border }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase", marginBottom: 6 }}>Key Principles</div>
        <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
          • Assess pain using age-appropriate pain scale (0-10)<br />
          • Treat pain promptly — do not wait for confirmation of VOC<br />
          • Use scheduled analgesia (not PRN) during acute VOC<br />
          • Adjuvants: consider gabapentin/pregabalin for neuropathic component<br />
          • Monitor for opioid side effects: constipation (laxatives), pruritus, respiratory depression<br />
          • Avoid meperidine (pethidine) — risk of seizures<br />
          • Patient-controlled analgesia (PCA) preferred for severe pain<br />
          • Multimodal approach: combine non-opioid + opioid + non-pharmacological
        </div>
      </div>
    </div>
  );
}

function VaccinationTab({ vaccinations }: { vaccinations: Vaccination[]; [key: string]: any }) {
  return (
    <div>
      <SectHeader label="Vaccination Tracker" color={T.success} />
      <div className="scd-scroll" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
          <thead><tr>{["Vaccine","Date","Dose","Due Date","Status","Notes"].map(h => (<th key={h} style={{ padding: "6px 10px", color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: "0.5px solid " + T.border, textAlign: "left" }}>{h}</th>))}</tr></thead>
          <tbody>{VACCINATIONS_LIST.map((v, i) => {
            const found = vaccinations.find(x => x.name === v);
            return (
              <tr key={v} style={{ background: i % 2 === 0 ? "transparent" : T.bg, borderBottom: "0.5px solid " + T.border }}>
                <td style={{ padding: "8px 10px", fontWeight: 600, color: found ? T.text : T.muted }}>{v}</td>
                <td style={{ padding: "8px 10px", color: T.muted }}>{found?.date ?? "—"}</td>
                <td style={{ padding: "8px 10px", color: T.muted }}>{found?.dose ?? "—"}</td>
                <td style={{ padding: "8px 10px", color: T.faint }}>{found?.dueDate ?? "—"}</td>
                <td style={{ padding: "8px 10px" }}>{found ? (found.administered ? <Badge text="Done" color={T.success} bg="#f0fdf4" border="#86efac" /> : <Badge text="Due" color={T.warn} bg="#fff7ed" border="#fde68a" />) : <Badge text="Missing" color={T.danger} bg="#fef2f2" border="#fca5a5" />}</td>
                <td style={{ padding: "8px 10px", color: T.faint, maxWidth: 100 }}>{found?.notes ?? "—"}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdherenceTab({ adherence }: { adherence: AdherenceMap; [key: string]: any }) {
  const allDays = useMemo(() => Object.values(adherence).flatMap(m => Object.values(m)), [adherence]);
  const medPct = allDays.length > 0 ? Math.round(allDays.filter(Boolean).length / allDays.length * 100) : 0;
  return (
    <div>
      <SectHeader label="Adherence Overview" color={T.success} />
      <div className="scd-stat-row" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard label="Medication Adherence" value={medPct + "%"} sub="30-day calendar" color={medPct>=80?T.success:medPct>=60?T.warn:T.danger} />
      </div>
    </div>
  );
}

function LabsTab({ labOrders, imagingOrders = [] }: { labOrders: LabOrder[]; imagingOrders?: LabOrder[]; [key: string]: any }) {
  return (
    <div>
      <SectHeader label="Investigations — Labs & Imaging" color={T.purple} />
      <div className="scd-labs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>🔬 Laboratory</div>
          {LAB_PANEL.map(l => {
            const ordered = labOrders.find(x => x.name === l);
            return <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: "0.5px solid " + T.border }}><div style={{ flex: 1, fontSize: 12, color: ordered ? T.text : T.muted }}>{l}</div>{ordered ? (ordered.result ? <Badge text={ordered.result.length > 15 ? ordered.result.slice(0,15)+"…" : ordered.result} color={T.success} bg="#f0fdf4" border="#86efac" /> : <Badge text={ordered.urgency === "urgent" ? "⚡ Urgent" : "Ordered"} color={T.warn} bg="#fffbeb" border="#fde68a" />) : <Badge text="—" color={T.faint} bg={T.bg} border={T.border} />}</div>;
          })}
        </div>
        <div>
          <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>🩻 Imaging</div>
          {IMAGING_PANEL.map(l => {
            const ordered = imagingOrders.find(x => x.name === l);
            return <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: "0.5px solid " + T.border }}><div style={{ flex: 1, fontSize: 12, color: ordered ? T.text : T.muted }}>{l}</div>{ordered ? (ordered.result ? <Badge text={ordered.result.length > 15 ? ordered.result.slice(0,15)+"…" : ordered.result} color={T.success} bg="#f0fdf4" border="#86efac" /> : <Badge text={ordered.urgency === "urgent" ? "⚡ Urgent" : "Ordered"} color={T.warn} bg="#fffbeb" border="#fde68a" />) : <Badge text="—" color={T.faint} bg={T.bg} border={T.border} />}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

function LifestyleTab({ lifestyle, onToggle, onGrade, onSendNotification, patientId }: {
  lifestyle: LifestyleItem[]; onToggle: (name: string) => void; onGrade: (name: string, grade: LifestyleItem["grade"]) => void;
  onSendNotification?: (item: string, grade: LifestyleItem["grade"]) => void; patientId?: string; [key: string]: any;
}) {
  const GRADES: LifestyleItem["grade"][] = ["Good","Moderate","Poor"];
  const gc: Record<LifestyleItem["grade"], string> = { Good: T.success, Moderate: T.warn, Poor: T.danger };
  return (
    <div>
      <SectHeader label="Lifestyle Modification" color={T.success} />
      {LIFESTYLE_ITEMS.map(item => {
        const ls = lifestyle.find(x => x.name === item);
        return (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: "0.5px solid " + T.border, flexWrap: "wrap" }}>
            <button onClick={() => onToggle(item)} style={{ width: 18, height: 18, borderRadius: 4, border: "1.5px solid " + (ls?T.success:T.border), background: ls?T.success:"transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {ls && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, color: ls?T.text:T.muted }}>{item}</div></div>
            {ls && <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>{GRADES.map(g => <button key={g} onClick={() => onGrade(item, g)} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "0.5px solid " + (ls.grade===g?gc[g]:T.border), background: ls.grade===g?gc[g]:"transparent", color: ls.grade===g?"#fff":T.faint }}>{g}</button>)}</div>}
          </div>
        );
      })}
    </div>
  );
}

function EducationTab({ education, onSend, patientId }: {
  education: string[]; onSend: (topic: EducationTopic) => void; patientId: string;
}) {
  const [filter, setFilter] = useState<string>("All");
  const categories = useMemo(() => ["All", ...new Set(EDUCATION_TOPICS.map(t => t.category))], []);
  const filtered = filter === "All" ? EDUCATION_TOPICS : EDUCATION_TOPICS.filter(t => t.category === filter);
  return (
    <div>
      <SectHeader label="Patient Education Library" color={T.info} sub={education.length + " topics sent"} />
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>{categories.map(c => (<button key={c} onClick={() => setFilter(c)} style={{ padding: "3px 9px", borderRadius: 6, border: "0.5px solid " + (filter===c?T.info:T.border), background: filter===c?"#eff6ff":"transparent", color: filter===c?T.info:T.faint, fontSize: 10, fontWeight: filter===c?700:500, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>))}</div>
      {filtered.map(topic => {
        const sent = education.includes(topic.id);
        return (<div key={topic.id} onClick={() => onSend(topic)} style={{ border: "0.5px solid " + (sent?"#93c5fd":T.border), borderRadius: 10, marginBottom: 7, overflow: "hidden", cursor: "pointer", background: sent?"#f0f9ff":T.bg }}><div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 18 }}>📚</span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{topic.title}</div><div style={{ fontSize: 11, color: T.faint }}>{topic.category} · {topic.duration}</div></div>{sent ? <Badge text="✓ Sent" color={T.info} bg="#eff6ff" border="#93c5fd" /> : <span style={{ color: T.faint, fontSize: 11 }}>Send ›</span>}</div></div>);
      })}
    </div>
  );
}

function TimelineTab({ events }: { events: TimelineEvent[] }) {
  const tc: Record<TimelineEvent["type"], string> = { visit: T.info, med: T.purple, alert: T.warn, reading: T.success, note: T.muted, lab: "#7c3aed" };
  return (
    <div>
      <SectHeader label="Clinical Event Timeline" color={T.info} sub={events.length + " events"} />
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

function AlertsTab({ alerts, onAdd, onDelete, hbData, vocData, medications, complications, vaccinations, tcdData }: {
  alerts: Alert[]; onAdd: (a: Alert) => void; onDelete: (id: string) => void;
  hbData: HbReading[]; vocData: VOCEvent[]; medications: SCDMedication[]; complications: SCDComplication[]; vaccinations: Vaccination[]; tcdData: TCDReading[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const ACTION_OPTS = ["Notify doctor","Notify patient via app","Flag for urgent review","Schedule appointment","Order labs","Escalate to hematologist","Refer to specialist"];
  const CATEGORIES = ["Hb Threshold","VOC Frequency","Medication Change","Adherence","Lab Result","TCD Alert","Complication","ACS Warning","Iron Overload","Infection Risk","Custom"];
  const scientificAlerts = useMemo(() => generateClinicalAlerts(hbData, vocData, medications, complications, vaccinations, tcdData), [hbData, vocData, medications, complications, vaccinations, tcdData]);
  const severityColor = { critical: T.danger, urgent: T.warn, warning: T.orange, info: T.info } as const;
  const severityBg = { critical: "#fef2f2", urgent: "#fff7ed", warning: "#fff7ed", info: "#eff6ff" } as const;
  return (
    <div>
      <SectHeader label="SCD Clinical Alert Engine" color={T.danger} sub={scientificAlerts.length + " active alert(s)"} />
      {scientificAlerts.length === 0 && <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "0.5px solid #86efac", display: "flex", gap: 10 }}><span style={{ fontSize: 18 }}>✅</span><div><div style={{ fontWeight: 700, fontSize: 13, color: T.success }}>All Clinical Parameters Satisfactory</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>No automated alerts generated.</div></div></div>}
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
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "0.5px solid " + T.border }}>
        <SectHeader label="Custom Alert Rules (Doctor-Created)" color={T.warn} />
        {alerts.map(a => (
          <div key={a.id} style={{ border: "0.5px solid #fed7aa", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
            <div style={{ padding: "9px 12px", background: "#fff7ed", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>🔔</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: T.warn, fontSize: 12 }}>{a.trigger}</div>
                <div style={{ color: T.faint, fontSize: 11 }}>{a.category && <span style={{ background: "#fff7ed", border: "0.5px solid #fed7aa", borderRadius: 4, padding: "1px 6px", fontSize: 10, marginRight: 5 }}>{a.category}</span>}Actions: {a.actions.join(" · ")}</div>
                {a.doctorNote && <div style={{ fontSize: 11, color: T.muted, marginTop: 3, fontStyle: "italic" }}>Note: {a.doctorNote}</div>}
              </div>
              <Btn label="Remove" variant="danger" small onClick={() => onDelete(a.id)} />
            </div>
          </div>
        ))}
        {showForm ? (
          <div style={{ border: "1.5px dashed " + T.warn, borderRadius: 10, padding: 12, background: "#fffbeb" }}>
            <InpField label="Trigger condition" value={trigger} onChange={setTrigger} placeholder="e.g. Hb <5 g/dL" />
            <div style={{ color: T.faint, fontSize: 10, fontWeight: 600, margin: "8px 0 5px" }}>Actions</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>{ACTION_OPTS.map(a => { const sel = actions.includes(a); return <button key={a} onClick={() => setActions(p => sel ? p.filter(x => x !== a) : [...p, a])} style={{ padding: "4px 9px", borderRadius: 7, border: "0.5px solid " + (sel?T.warn:T.border), background: sel?T.warn:"transparent", color: sel?"#fff":T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{sel ? "✓ " : ""}{a}</button>; })}</div>
            <div style={{ display: "flex", gap: 6 }}><Btn label="✓ Create Alert" variant="success" onClick={() => { if (!trigger) return; onAdd({ id: "a"+Date.now(), trigger, actions, category: "SCD", createdAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), history: [] }); setTrigger(""); setActions([]); setShowForm(false); }} /><Btn label="Cancel" onClick={() => setShowForm(false)} /></div>
          </div>
        ) : <Btn label="🔔 Create New Alert Rule" variant="warn" fullWidth onClick={() => setShowForm(true)} />}
      </div>
    </div>
  );
}

function ComplicationsTab({ complications, onToggle }: { complications: SCDComplication[]; onToggle: (name: string) => void }) {
  const COMP_INFO: Record<string, string> = {
    "Acute Chest Syndrome": "Leading cause of death in SCD — fever + pulmonary infiltrate. Treat with antibiotics + oxygen + transfusion.",
    "Stroke/TIA": "Cerebrovascular event — TCD screening essential. Chronic transfusion to prevent recurrence.",
    "Abnormal TCD": "TCD velocity >200 cm/s — 10% annual stroke risk. Indication for chronic transfusion.",
    "Priapism": "Persistent painful erection — urological emergency. >4h requires aspiration and phenylephrine.",
    "Splenic Sequestration": "Acute splenic enlargement + Hb drop. Life-threatening. IV fluids + transfusion.",
    "Aplastic Crisis": "Sudden Hb drop + reticulocytopenia. Usually parvovirus B19. Transfusion support.",
    "Iron Overload": "Transfusional iron overload. Ferritin >1000. Chelation therapy (deferasirox/deferoxamine).",
    "Pulmonary Hypertension": "TR jet >2.5 m/s. 40% mortality at 40 months. Right heart catheterization for diagnosis.",
    "Retinopathy": "Proliferative sickle retinopathy. Annual screening. Laser for sea-fan neovascularization.",
    "Leg Ulcers": "Venous stasis ulcers, peri-malleolar. Difficult to heal. Wound care + compression.",
    "Avascular Necrosis (AVN)": "Bone infarction → joint collapse. Hip most common. Orthopedic referral.",
    "Functional Asplenia": "Spleen dysfunction → pneumococcal sepsis risk. Penicillin prophylaxis + vaccinations.",
    "Renal Impairment": "SCD nephropathy. Proteinuria, declining eGFR. ACEi/ARB for proteinuria.",
    "Gallstones": "Pigment gallstones from chronic hemolysis. Cholecystectomy if symptomatic.",
    "Chronic Pain Syndrome": "Persistent pain beyond acute VOC. Multimodal approach needed.",
    "Delayed Puberty": "Common in SCD due to chronic illness. Monitor growth. Endocrine referral.",
    "Infertility": "Gonadal damage from sickling + hydroxyurea. Fertility preservation counseling.",
    "Osteoporosis": "Chronic illness + possible steroid use. DEXA scan. Calcium + vitamin D.",
  };
  return (
    <div>
      <SectHeader label="SCD Complications" color={T.danger} />
      <div className="scd-comp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {COMPLICATIONS.map(c => {
          const comp = complications.find(x => x.name === c);
          return (
            <button key={c} onClick={() => onToggle(c)} style={{ border: "0.5px solid " + (comp?"#fca5a5":T.border), borderRadius: 10, padding: "10px 11px", background: comp?"#fef2f2":T.bg, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid " + (comp?T.danger:T.border), background: comp?T.danger:"transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {comp && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: comp?T.danger:T.text }}>{c}</div>
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

function NotesTab({ notes, onSave, onEdit, patientName }: {
  notes: SCDClinicalNote[]; onSave: (n: SCDClinicalNote) => void; onEdit: (n: SCDClinicalNote) => void; patientName: string;
}) {
  const blank = (): SCDClinicalNote => ({ date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), cc: "", hpi: "", exam: "", investigations: "", assessment: "", plan: "", diagnoses: [], followUps: [], isLocked: false, visitType: "follow_up", vitals: {} });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SCDClinicalNote>(blank());
  const [expandedId, setExpandedId] = useState<string|null>(notes[0]?.id ?? null);
  const FIELDS: { key: keyof SCDClinicalNote; label: string; ph: string }[] = [
    { key: "cc", label: "Chief Complaint (CC)", ph: "What brings the patient today?" },
    { key: "hpi", label: "History of Present Illness (HPI)", ph: "Duration, character, severity, triggers…" },
    { key: "exam", label: "Examination Findings", ph: "General, CVS, Respiratory, Abdomen, MSK, Neuro…" },
    { key: "investigations", label: "Investigations / Results", ph: "Recent labs, Hb, HbF, reticulocytes, imaging…" },
    { key: "assessment", label: "Assessment / Diagnosis", ph: "Primary diagnosis, complications, disease severity…" },
    { key: "plan", label: "Management Plan", ph: "Medication changes, referrals, follow-up, education…" },
  ];
  return (
    <div>
      <SectHeader label="Clinical Notes — SOAP Format" color={T.muted} />
      {[...notes].reverse().map(n => (
        <div key={n.id ?? n.date} style={{ border: "0.5px solid " + T.border, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
          <div role="button" tabIndex={0} onClick={() => setExpandedId(expandedId === n.id ? null : n.id ?? n.date)} onKeyDown={e => e.key === "Enter" && setExpandedId(expandedId === n.id ? null : n.id ?? n.date)} style={{ width: "100%", padding: "10px 13px", display: "flex", alignItems: "center", gap: 8, background: T.bg, cursor: "pointer" }}>
            <span style={{ fontSize: 16 }}>📋</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{n.date} — {n.assessment || "Clinical Note"}</div><div style={{ color: T.faint, fontSize: 11 }}>{n.doctorName ?? "AMEXAN"} · {n.visitType ?? "Follow-up"}{n.isLocked ? " 🔒" : " 🔓"}</div></div>
            <span style={{ color: T.faint, fontSize: 11 }}>{expandedId === (n.id ?? n.date) ? "▲" : "▼"}</span>
          </div>
          {expandedId === (n.id ?? n.date) && (
            <div className="scd-note-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 14px" }}>
              {FIELDS.filter(f => n[f.key]).map(f => (<div key={f.key} style={{ gridColumn: f.key === "plan" || f.key === "hpi" ? "1 / -1" : undefined }}><div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{f.label}</div><div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n[f.key] as string}</div></div>))}
            </div>
          )}
        </div>
      ))}
      {showForm ? (
        <div style={{ border: "1.5px solid " + T.info, borderRadius: 12, padding: 13, background: "#eff6ff", marginTop: 8 }}>
          <div style={{ color: T.info, fontWeight: 700, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>📋 New SOAP Note — {form.date}<Btn label="Cancel" small onClick={() => { setShowForm(false); setForm(blank()); }} /></div>
          <div className="scd-note-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {FIELDS.map(f => (<div key={f.key} style={{ gridColumn: f.key === "plan" || f.key === "hpi" ? "1 / -1" : undefined }}><TextArea label={f.label} value={(form[f.key] as string) ?? ""} onChange={v => setForm({ ...form, [f.key]: v })} placeholder={f.ph} rows={4} /></div>))}
          </div>
          <div style={{ display: "flex", gap: 6 }}><Btn label="✓ Save Note" variant="success" onClick={() => { onSave({ ...form, id: "n"+Date.now() }); setShowForm(false); setForm(blank()); }} /><Btn label="Cancel" onClick={() => { setShowForm(false); setForm(blank()); }} /></div>
        </div>
      ) : <Btn label="📋 Write New SOAP Note" variant="primary" fullWidth onClick={() => { setForm(blank()); setShowForm(true); }} />}
    </div>
  );
}

function MessagingTab({ messages, onSend, threadId, loadingMessages, patientName }: {
  messages: Message[]; onSend: (text: string) => void; threadId: string; loadingMessages?: boolean; patientName?: string;
}) {
  const [newMsg, setNewMsg] = useState("");
  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(m => !m.read && (m.from !== "doctor" && m.senderRole !== "doctor")).length;
  const initials = (patientName ?? "P").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ border: "0.5px solid " + T.border, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.bg }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{patientName ?? "Patient"}</div><div style={{ fontSize: 11, color: T.faint }}>{loadingMessages ? "Loading…" : messages.length + " messages"}{unreadCount > 0 ? " · " + unreadCount + " unread" : ""}</div></div>
      </div>
      <div className="scd-scroll" style={{ maxHeight: 200, overflowY: "auto", padding: "10px 14px" }}>
        {messages.length === 0 && <div style={{ color: T.faint, fontSize: 12, textAlign: "center", padding: "10px 0" }}>No messages yet.</div>}
        {messages.slice(-20).map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, flexDirection: m.from === "doctor" ? "row-reverse" : "row" }}>
            <div style={{ background: m.from === "doctor" ? T.info : T.bg, color: m.from === "doctor" ? "#fff" : T.text, borderRadius: 10, padding: "6px 10px", fontSize: 12, maxWidth: "80%" }}><div>{m.text}</div><div style={{ fontSize: 9, color: m.from === "doctor" ? "rgba(255,255,255,0.7)" : T.faint, marginTop: 2 }}>{m.time}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderTop: "0.5px solid " + T.border }}>
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message…" onKeyDown={e => { if (e.key === "Enter" && newMsg.trim()) { onSend(newMsg.trim()); setNewMsg(""); } }} style={{ flex: 1, background: T.bg, border: "0.5px solid " + T.border, borderRadius: 8, padding: "7px 10px", fontSize: 12, outline: "none", fontFamily: "inherit", color: T.text }} />
        <Btn label="Send" variant="primary" small onClick={() => { if (newMsg.trim()) { onSend(newMsg.trim()); setNewMsg(""); } }} />
      </div>
    </div>
  );
}

export interface Referral {
  id?: string; status: string; urgency: string; specialty?: string;
  receivingDoctorName?: string; date?: string; reason?: string; to?: string;
}

function ReferralsPreview({ referrals }: { referrals: Referral[] }) {
  const pendingCount = referrals.filter(r => r.status === "pending").length;
  const urgentCount = referrals.filter(r => r.urgency === "urgent" || r.urgency === "emergency").length;
  return (
    <div>
      <SectHeader label="Referrals" color={T.info} sub={referrals.length + " total"} />
      {referrals.length === 0 && <div style={{ color: T.faint, textAlign: "center", padding: "20px 0" }}>No referrals yet.</div>}
      {referrals.map((r, i) => (
        <div key={r.id ?? i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "0.5px solid " + T.border, borderRadius: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>🏥</span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 12, color: T.text }}>{r.specialty ?? "Specialist"}</div><div style={{ fontSize: 11, color: T.faint }}>To: {r.receivingDoctorName ?? "—"} · {r.status} · {r.urgency}</div></div>
          <Badge text={r.status} color={r.status === "pending" ? T.warn : r.status === "completed" ? T.success : T.faint} bg={r.status === "pending" ? "#fff7ed" : r.status === "completed" ? "#f0fdf4" : T.bg} border="#d1d5db" />
        </div>
      ))}
    </div>
  );
}

// ─── Types for PatientSummary ──────────────────────────────────────────────────

interface SCDPatientSummary {
  id: string; name: string; email?: string; phone?: string; universalId?: string;
  latestHb?: number; latestHbF?: number; lastVOC?: Date; totalVOC?: number;
  latestTCD?: number; latestFerritin?: number; lastReading?: Date; totalReadings: number;
}

// ─── PatientPicker ─────────────────────────────────────────────────────────────

const PatientPicker = memo(function PatientPicker({ patients, selectedId, onSelect, loading }: {
  patients: SCDPatientSummary[]; selectedId: string | null; onSelect: (id: string) => void; loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.universalId ?? "").toLowerCase().includes(search.toLowerCase()) || (p.email ?? "").toLowerCase().includes(search.toLowerCase())), [patients, search]);
  if (loading) return <Skeleton height={160} />;
  if (!patients.length) return (<Card><div style={{ textAlign: "center", padding: "24px 0" }}><div style={{ fontSize: 36, marginBottom: 10 }}>🩸</div><div style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>No SCD Patients Found</div><div style={{ color: T.faint, fontSize: 11, marginTop: 5 }}>Patients appear once they log data via the AMEXAN SCD app.</div></div></Card>);
  return (<Card style={{ padding: "14px 14px" }}><SectHeader label={`SCD Patients (${patients.length})`} color={T.purple} /><input type="search" placeholder="Search by name, ID or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", marginBottom: 10, fontFamily: "inherit" }} /><div className="scd-scroll" style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 420, overflowY: "auto" }}>{filtered.map(p => { const active = selectedId === p.id; return (<button key={p.id} onClick={() => onSelect(p.id)} className="scd-patient-btn" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, textAlign: "left", cursor: "pointer", border: active ? `1.5px solid rgba(124,58,237,0.4)` : `0.5px solid ${T.border}`, background: active ? "rgba(124,58,237,0.04)" : T.bg, fontFamily: "inherit", width: "100%", transition: "all 0.15s" }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: active ? "rgba(124,58,237,0.12)" : T.bg, border: `0.5px solid ${active ? "rgba(124,58,237,0.3)" : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: active ? T.purple : T.muted, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{p.name.charAt(0).toUpperCase()}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ color: active ? T.purple : T.text, fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div><div style={{ color: T.faint, fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.universalId ?? p.id.slice(0, 10)}{p.lastReading ? ` · ${p.lastReading.toLocaleDateString()}` : ""}</div></div><div style={{ textAlign: "right", flexShrink: 0 }}>{p.latestHb != null && <div style={{ color: p.latestHb < 7 ? T.danger : p.latestHb < 10 ? T.warn : T.success, fontWeight: 700, fontSize: 12 }}>Hb {p.latestHb}</div>}{p.totalVOC != null && <div style={{ padding: "1px 5px", borderRadius: 4, background: p.totalVOC > 3 ? "#fef2f2" : "#f0fdf4", color: p.totalVOC > 3 ? T.danger : T.success, fontSize: 9, fontWeight: 700, display: "inline-block", marginTop: 1 }}>{p.totalVOC} VOCs</div>}</div></button>);})}{!filtered.length && <div style={{ color: T.faint, fontSize: 13, padding: "12px 0", textAlign: "center" }}>No patients match "{search}"</div>}</div></Card>);
});

// ─── Tabs Definition ──────────────────────────────────────────────────────────

type SCDTabId = "hb"|"voc"|"transfusions"|"tcd"|"medications"|"pain"|"hydroxyurea"|"adherence"|"alerts"|"complications"|"lifestyle"|"education"|"labs"|"vaccinations"|"notes"|"timeline"|"messaging"|"referrals"|"acs";

const SCD_TABS: { id: SCDTabId; icon: string; label: string }[] = [
  { id: "hb",            icon: "🩸", label: "Hb Trend"    },
  { id: "voc",           icon: "⚡", label: "VOC Events"   },
  { id: "transfusions",  icon: "💉", label: "Transfusions" },
  { id: "tcd",           icon: "🧠", label: "TCD"          },
  { id: "medications",   icon: "💊", label: "Medications"  },
  { id: "pain",          icon: "🤕", label: "Pain Mgmt"    },
  { id: "hydroxyurea",   icon: "💧", label: "Hydroxyurea"  },
  { id: "adherence",     icon: "📅", label: "Adherence"    },
  { id: "alerts",        icon: "🔔", label: "Alerts"       },
  { id: "complications", icon: "⚕️",  label: "Complic."    },
  { id: "lifestyle",     icon: "🏃", label: "Lifestyle"    },
  { id: "education",     icon: "📚", label: "Education"    },
  { id: "labs",          icon: "🔬", label: "Labs"         },
  { id: "vaccinations",  icon: "💉", label: "Vaccines"     },
  { id: "notes",         icon: "📋", label: "Notes"        },
  { id: "timeline",      icon: "🕐", label: "Timeline"     },
  { id: "messaging",     icon: "💬", label: "Messaging"    },
  { id: "referrals",     icon: "📤", label: "Referrals"    },
  { id: "acs",           icon: "🫁", label: "ACS History"  },
];

// ─── Patient Panel (full SCD clinical hub) ────────────────────────────────────

function PatientPanel({ patientId, patientName, doctorId, doctorName, onOpenConversation, onOpenReferrals }: {
  patientId: string; patientName: string; doctorId?: string; doctorName?: string;
  onOpenConversation?: (threadId: string) => void;
  onOpenReferrals?: (patientId: string, patientName: string) => void;
}) {
  const [tab, setTab] = useState<SCDTabId>("hb");
  const tabsRef = useRef<HTMLDivElement>(null);

  const [hbData, setHbData] = useState<HbReading[]>([]);
  const [vocData, setVOCData] = useState<VOCEvent[]>([]);
  const [transfusions, setTransfusions] = useState<Transfusion[]>([]);
  const [tcdData, setTCDData] = useState<TCDReading[]>([]);
  const [medications, setMedications] = useState<SCDMedication[]>([]);
  const [adherence, setAdherence] = useState<AdherenceMap>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [complications, setComplications] = useState<SCDComplication[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestyleItem[]>([]);
  const [education, setEducation] = useState<string[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<SCDClinicalNote[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [referrals, setReferrals] = useState<Record<string, unknown>[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loadingHb, setLoadingHb] = useState(true);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(true);

  const threadId = useMemo(() => {
    if (!doctorId || !patientId) return "";
    return [doctorId, patientId].sort().join("_");
  }, [doctorId, patientId]);

  useEffect(() => {
    setLoadingHb(true);
    const q = query(collection(db, "hbReadings"), where("patientId", "==", patientId), orderBy("date", "asc"));
    return onSnapshot(q, snap => { setHbData(snap.docs.map(d => ({ id: d.id, ...d.data() } as HbReading))); setLoadingHb(false); }, () => setLoadingHb(false));
  }, [patientId]);

  useEffect(() => {
    const q = query(collection(db, "vocEvents"), where("patientId", "==", patientId), orderBy("date", "desc"));
    return onSnapshot(q, snap => setVOCData(snap.docs.map(d => ({ id: d.id, ...d.data() } as VOCEvent))), () => {});
  }, [patientId]);

  useEffect(() => {
    const q = query(collection(db, "transfusions"), where("patientId", "==", patientId), orderBy("date", "desc"));
    return onSnapshot(q, snap => setTransfusions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transfusion))), () => {});
  }, [patientId]);

  useEffect(() => {
    const q = query(collection(db, "tcdReadings"), where("patientId", "==", patientId), orderBy("date", "asc"));
    return onSnapshot(q, snap => setTCDData(snap.docs.map(d => ({ id: d.id, ...d.data() } as TCDReading))), () => {});
  }, [patientId]);

  useEffect(() => {
    setLoadingMeds(true);
    const q = query(collection(db, "prescriptions"), where("patientId", "==", patientId), orderBy("startDate", "asc"));
    return onSnapshot(q, snap => {
      const meds: SCDMedication[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as SCDMedication));
      setMedications(meds);
      setAdherence(prev => { const next = { ...prev }; meds.filter(m => m.active).forEach(m => { if (!next[m.id]) { const days: Record<string, boolean> = {}; for (let i=13;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); days[d.toISOString().split("T")[0]]=false; } next[m.id]=days; } }); return next; });
      setLoadingMeds(false);
    }, () => setLoadingMeds(false));
  }, [patientId]);

  useEffect(() => {
    if (!threadId) return;
    setLoadingMsg(true);
    const q = query(collection(db, "messages"), where("threadId", "==", threadId), orderBy("timestamp", "asc"), limit(100));
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => { const data = d.data(); return { id: d.id, from: (data.senderRole==="doctor"||data.from==="doctor")?"doctor":"patient", senderId: data.senderId, senderName: data.senderName, senderRole: data.senderRole, time: data.timestamp instanceof Timestamp?data.timestamp.toDate().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):String(data.time??""), text: data.text??"", read: data.read??false, status: data.status, threadId: data.threadId } as Message; }));
      setLoadingMsg(false);
    }, () => setLoadingMsg(false));
  }, [threadId]);

  useEffect(() => {
    const q = query(collection(db, "alerts"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, snap => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert))), () => {});
  }, [patientId]);

  useEffect(() => {
    const q = query(collection(db, "clinicalNotes"), where("patientId", "==", patientId), orderBy("visitDate", "desc"), limit(50));
    return onSnapshot(q, snap => {
      setClinicalNotes(snap.docs.map(d => { const data = d.data(); return { id: d.id, date: data.visitDate instanceof Timestamp?data.visitDate.toDate().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):String(data.date??""), cc: data.chiefComplaint??data.cc??"", hpi: data.hpi??"", exam: data.examination?.general??data.exam??"", investigations: data.investigations??"", assessment: data.diagnoses?.[0]??data.assessment??"", plan: data.plan??"", diagnoses: data.diagnoses??[], followUps: data.followUps??[], isLocked: data.isLocked??false, doctorName: data.doctorName??"AMEXAN", visitType: data.visitType??"follow_up", vitals: data.vitals??{} } as SCDClinicalNote; }));
    }, () => {});
  }, [patientId]);

  useEffect(() => {
    const q = query(collection(db, "referrals"), where("patientId", "==", patientId), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, snap => setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
  }, [patientId]);

  useEffect(() => {
    getDocs(query(collection(db, "labOrders"), where("patientId", "==", patientId), orderBy("orderedAt", "desc"), limit(100)))
      .then(snap => { const labs: LabOrder[] = []; snap.docs.forEach(d => { const r = d.data(); labs.push({ name: r.name??r.test??"Unknown", result: r.result, orderedAt: r.orderedAt instanceof Timestamp?r.orderedAt.toDate().toLocaleDateString():String(r.orderedAt??""), type: r.type??"lab", status: r.status??"ordered" } as LabOrder); }); setLabOrders(labs); }).catch(() => {});
    getDocs(query(collection(db, "timeline_events"), where("patientId", "==", patientId), orderBy("date", "asc"), limit(200)))
      .then(snap => setTimeline(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent)))).catch(() => {});
    getDoc(doc(db, "patientProfiles", patientId)).then(d => { if (!d.exists()) return; const r = d.data() as Record<string, unknown>; if (r.complications) setComplications(r.complications as SCDComplication[]); if (r.lifestyle) setLifestyle(r.lifestyle as LifestyleItem[]); if (r.education) setEducation(r.education as string[]); if (r.vaccinations) setVaccinations(r.vaccinations as Vaccination[]); }).catch(() => {});
    getDocs(query(collection(db, "education_logs"), where("patientId", "==", patientId), limit(100)))
      .then(snap => { const sentIds = snap.docs.map(d => String(d.data().topicId??d.data().topic??"")).filter(Boolean); if (sentIds.length > 0) setEducation(p => [...new Set([...p, ...sentIds])]); }).catch(() => {});
    getDocs(query(collection(db, "vaccinations"), where("patientId", "==", patientId), limit(50)))
      .then(snap => setVaccinations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vaccination)))).catch(() => {});
  }, [patientId]);

  const addTimeline = useCallback((type: TimelineEvent["type"], icon: string, title: string, detail?: string) => {
    const ev: TimelineEvent = { id: "t"+Date.now(), date: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}), type, icon, title, ...(detail!==undefined && { detail }) };
    setTimeline(p => [...p, ev]);
    addDoc(collection(db, "timeline_events"), { ...ev, patientId, createdAt: serverTimestamp() }).catch(() => {});
  }, [patientId]);

  const profileUpdate = useCallback((field: string, value: unknown) => {
    setDoc(doc(db, "patientProfiles", patientId), { [field]: value }, { merge: true }).catch(() => {});
  }, [patientId]);

  const handleAddAlert = useCallback((alert: Alert) => {
    setAlerts(p => [...p, alert]);
    addDoc(collection(db, "alerts"), { ...alert, patientId, doctorId, doctorName: doctorName??"Doctor", createdAt: serverTimestamp() }).catch(() => {});
    addTimeline("alert", "🔔", `Alert: ${alert.trigger}`);
  }, [patientId, doctorId, doctorName, addTimeline]);

  const handleDeleteAlert = useCallback((id: string) => {
    setAlerts(p => p.filter(a => a.id !== id));
    deleteDoc(doc(db, "alerts", id)).catch(() => {});
  }, []);

  const handleToggleComplication = useCallback((name: string) => {
    setComplications(prev => { const next = prev.find(x => x.name === name) ? prev.filter(x => x.name !== name) : [...prev, { name, date: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) }]; profileUpdate("complications", next); return next; });
    addTimeline("visit", "⚕️", `Complication: ${name}`);
  }, [profileUpdate, addTimeline]);

  const handleToggleLifestyle = useCallback((name: string) => {
    setLifestyle(prev => { const next = prev.find(x => x.name === name) ? prev.filter(x => x.name !== name) : [...prev, { name, grade: "Good" as const }]; profileUpdate("lifestyle", next); return next; });
  }, [profileUpdate]);

  const handleGradeLifestyle = useCallback((name: string, grade: LifestyleItem["grade"]) => {
    setLifestyle(prev => { const next = prev.map(x => x.name === name ? { ...x, grade } : x); profileUpdate("lifestyle", next); return next; });
  }, [profileUpdate]);

  const handleSendEducation = useCallback(async (topic: EducationTopic) => {
    try {
      await addDoc(collection(db, "education_logs"), { patientId, topicId: topic.id, topic: topic.id, title: topic.title, content: topic.content, keyPoints: topic.keyPoints, category: topic.category, sentBy: doctorId, sentByName: doctorName??"Doctor", sentAt: serverTimestamp(), read: false });
      await addDoc(collection(db, "patientNotifications"), { patientId, type: "education", title: `📚 New Education: ${topic.title}`, body: `Your doctor has shared an education resource.\n\n📖 ${topic.title}\n⏱ ${topic.duration}\n\nOpen your AMEXAN app to read more.\n\n— ${doctorName??"Your Doctor"}`, topicId: topic.id, read: false, priority: "normal", senderId: doctorId, senderName: doctorName??"Doctor", createdAt: serverTimestamp() });
      setEducation(prev => [...new Set([...prev, topic.id])]);
      addTimeline("visit", "📚", `Education sent: ${topic.title}`);
    } catch { /* silent */ }
  }, [patientId, doctorId, doctorName, addTimeline]);

  const handleSaveNote = useCallback((note: SCDClinicalNote) => {
    setClinicalNotes(p => [note, ...p]);
    addDoc(collection(db, "clinicalNotes"), { patientId, chiefComplaint: note.cc??"", hpi: note.hpi??"", examination: { general: note.exam??"" }, investigations: note.investigations??"", assessment: note.assessment??"", plan: note.plan??"", diagnoses: note.diagnoses??[], followUps: note.followUps??[], isLocked: note.isLocked??false, visitType: note.visitType??"follow_up", vitals: note.vitals??{}, doctorId: doctorId??"", doctorName: doctorName??"AMEXAN", visitDate: serverTimestamp(), createdAt: serverTimestamp() }).then(ref => { setClinicalNotes(p => p.map(n => n.id === note.id ? { ...n, id: ref.id } : n)); }).catch(() => {});
    addTimeline("note", "📋", `Note: ${note.assessment||"Clinical note"}`, note.visitType);
  }, [patientId, doctorId, doctorName, addTimeline]);

  const handleEditNote = useCallback((note: SCDClinicalNote) => {
    setClinicalNotes(p => p.map(n => n.id === note.id ? note : n));
    if (!note.id) return;
    updateDoc(doc(db, "clinicalNotes", note.id), { chiefComplaint: note.cc??"", hpi: note.hpi??"", examination: { general: note.exam??"" }, investigations: note.investigations??"", assessment: note.assessment??"", plan: note.plan??"", diagnoses: note.diagnoses??[], followUps: note.followUps??[], isLocked: note.isLocked??false, visitType: note.visitType??"follow_up", vitals: note.vitals??{}, lastEditedAt: serverTimestamp() }).catch(() => {});
    addTimeline("note", "✏️", `Note edited: ${note.assessment||"Clinical note"}`);
  }, [addTimeline]);

  const handleSendMessage = useCallback((text: string) => {
    const now = new Date();
    const m: Message = { from: "doctor", senderId: doctorId, senderName: doctorName??"Doctor", senderRole: "doctor", time: now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), text, read: false, status: "sent", threadId, timestamp: now };
    setMessages(p => [...p, m]);
    addDoc(collection(db, "messages"), { text, senderId: doctorId, senderName: doctorName??"Doctor", senderRole: "doctor", threadId, patientId, from: "doctor", type: "text", clinTag: "none", read: false, status: "sent", reactions: [], timestamp: serverTimestamp() }).catch(() => {});
    addDoc(collection(db, "patientNotifications"), { patientId, type: "message", title: `Message from ${doctorName??"Your Doctor"}`, body: text.slice(0,100)+(text.length>100?"…":""), read: false, priority: "normal", senderId: doctorId, senderName: doctorName??"Doctor", createdAt: serverTimestamp() }).catch(() => {});
  }, [patientId, doctorId, doctorName, threadId]);

  const handleOrderLab = useCallback((name: string, urgency = "routine") => {
    const item: LabOrder = { name, type: "lab", urgency, status: "ordered", orderedAt: new Date().toLocaleDateString() };
    setLabOrders(p => [...p, item]);
    addDoc(collection(db, "labOrders"), { patientId, name, type: "lab", urgency, status: "ordered", orderedBy: doctorId, orderedByName: doctorName??"Doctor", orderedAt: serverTimestamp(), createdAt: serverTimestamp() }).catch(() => {});
    addTimeline("lab", "🔬", `Lab ordered: ${name}`, urgency);
  }, [patientId, doctorId, doctorName, addTimeline]);

  const handleUpdateResult = useCallback(async (name: string, result: string) => {
    setLabOrders(p => p.map(l => l.name === name ? { ...l, result, status: "resulted" } : l));
    try { const snap = await getDocs(query(collection(db, "labOrders"), where("patientId", "==", patientId), where("name", "==", name))); const batch = writeBatch(db); snap.docs.forEach(d => batch.update(d.ref, { result, status: "resulted", resultedAt: serverTimestamp() })); await batch.commit(); } catch { /* silent */ }
    addTimeline("lab", "📋", `Result: ${name} — ${result}`);
  }, [patientId, addTimeline]);

  const handleUpdateVaccination = useCallback((v: Vaccination) => {
    setVaccinations(p => { const idx = p.findIndex(x => x.name === v.name); if (idx >= 0) { const next = [...p]; next[idx] = v; return next; } return [...p, v]; });
    addDoc(collection(db, "vaccinations"), { ...v, patientId, updatedAt: serverTimestamp() }).then(ref => { setVaccinations(p => p.map(x => x.id ? x : { ...x, id: ref.id })); }).catch(() => {});
  }, [patientId]);

  const latestHb = hbData.length > 0 ? hbData[hbData.length - 1] : null;
  const avgHb = hbData.length > 0 ? Math.round(hbData.reduce((a, r) => a + r.value, 0) / hbData.length * 10) / 10 : 0;
  const vocCount = vocData.length;
  const vocLast12Mo = vocData.filter(v => { const d = new Date(v.date); return Date.now() - d.getTime() < 365*86400000; }).length;
  const activeMedCount = medications.filter(m => m.active && (!m.status || m.status === "active")).length;
  const latestTCDVal = tcdData.length > 0 ? tcdData[tcdData.length - 1].velocity : null;
  const insights = useMemo(() => {
    const ins: { type: "warn"|"info"|"danger"|"success"; msg: string }[] = [];
    if (hbData.length === 0) return [{ type: "info" as const, msg: "No Hb readings yet — patient has not started monitoring." }];
    if (latestHb && latestHb.value < 7) ins.push({ type: "danger", msg: `Hb ${latestHb.value} g/dL — severe anemia. Consider transfusion evaluation and erythropoietin support.` });
    else if (latestHb && latestHb.value < 9) ins.push({ type: "warn", msg: `Hb ${latestHb.value} g/dL — moderate anemia. Optimize hydroxyurea dose, monitor reticulocytes.` });
    if (vocLast12Mo >= 3) ins.push({ type: "danger", msg: `${vocLast12Mo} VOC episodes in past 12 months. Discuss hydroxyurea optimization, crizanlizumab or L-glutamine.` });
    else if (vocLast12Mo >= 1) ins.push({ type: "warn", msg: `${vocLast12Mo} VOC episode(s) in past 12 months. Reinforce trigger avoidance (hydration, temperature, infection).` });
    if (latestTCDVal !== null && latestTCDVal >= 200) ins.push({ type: "danger", msg: `TCD velocity ${latestTCDVal} cm/s — abnormal. High stroke risk. Start chronic transfusion program.` });
    else if (latestTCDVal !== null && latestTCDVal >= 170) ins.push({ type: "warn", msg: `TCD velocity ${latestTCDVal} cm/s — conditional. Repeat in 1-3 months.` });
    const hu = medications.find(m => m.medication?.toLowerCase().includes("hydroxy") || m.drug?.toLowerCase().includes("hydroxy"));
    if (hu && hu.active) ins.push({ type: "info", msg: `Hydroxyurea active. Monitor HbF, CBC every 4-8 weeks. Target HbF >20%.` });
    if (!hu && vocCount > 0) ins.push({ type: "warn", msg: "Patient with VOC history not on hydroxyurea. Consider initiating therapy (NIH/NHLBI guideline)." });
    const hydroxyureaRx = medications.find(m => (m.medication?.toLowerCase().includes("hydroxy") || m.drug?.toLowerCase().includes("hydroxy")) && m.active);
    if (hydroxyureaRx) { const doseVal = parseFloat(String(hydroxyureaRx.dosage??hydroxyureaRx.dose??"0")); if (doseVal > 0 && doseVal < 15) ins.push({ type: "warn", msg: `Hydroxyurea dose ${doseVal} mg/kg — subtherapeutic. Target: 20-35 mg/kg/day. Consider uptitration.` }); }
    if (complications.length > 0) ins.push({ type: "info", msg: `${complications.length} complication(s) documented. Review management plan.` });
    if (!ins.length) ins.push({ type: "success", msg: "All clinical parameters stable. Continue current management and review quarterly." });
    return ins;
  }, [hbData, latestHb, avgHb, vocLast12Mo, vocCount, latestTCDVal, medications, complications.length]);

  const scrollTab = (id: SCDTabId) => { setTab(id); const el = tabsRef.current?.querySelector(`[data-tab="${id}"]`) as HTMLElement|null; el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); };

  const icColors = { warn: T.warn, info: T.info, danger: T.danger, success: T.success } as const;
  const icBgs = { warn: "#fffbeb", info: "#eff6ff", danger: "#fef2f2", success: "#f0fdf4" } as const;
  const icIcons = { warn: "⚠️", info: "ℹ️", danger: "🚨", success: "✅" } as const;

  const isLoadingTab = (t: SCDTabId) => (loadingHb && ["hb","voc","transfusions","alerts"].includes(t)) || (loadingMeds && t === "medications");

  return (
    <div>
      <Card style={{ marginBottom: 10 }} className="scd-patient-mini-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(124,58,237,0.1)", border: "1.5px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: T.purple, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{patientName.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}><div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{patientName}</div><div style={{ color: T.muted, fontSize: 11 }}>SCD Monitoring · {hbData.length} Hb readings · {activeMedCount} active meds</div></div>
          {latestHb && (<div style={{ padding: "6px 14px", borderRadius: 10, background: latestHb.value < 7 ? "#fef2f2" : latestHb.value < 9 ? "#fff7ed" : "#f0fdf4", border: `0.5px solid ${latestHb.value < 7 ? "#fca5a5" : latestHb.value < 9 ? "#fed7aa" : "#86efac"}` }}><div style={{ color: latestHb.value < 7 ? T.danger : latestHb.value < 9 ? T.warn : T.success, fontWeight: 800, fontSize: 16 }}>Hb {latestHb.value}</div><div style={{ color: latestHb.value < 7 ? T.danger : latestHb.value < 9 ? T.warn : T.success, fontSize: 10, fontWeight: 600 }}>{latestHb.value < 7 ? "Severe" : latestHb.value < 9 ? "Moderate" : "Stable"}</div></div>)}
          <div style={{ display: "flex", gap: 6 }}>{(["messaging","referrals","notes"] as SCDTabId[]).map(t => { const tb = SCD_TABS.find(x => x.id === t)!; return <button key={t} onClick={() => scrollTab(t)} style={{ padding: "5px 10px", borderRadius: 7, border: `0.5px solid ${T.border}`, background: tab===t ? T.bg : "transparent", color: T.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{tb.icon} {tb.label}</button>; })}</div>
        </div>
      </Card>

      <div className="scd-stat-row" style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <StatCard label="Latest Hb" value={latestHb ? `${latestHb.value} g/dL` : "—"} sub={latestHb ? `${latestHb.hbF ?? "—"}% HbF` : ""} color={latestHb && latestHb.value < 7 ? T.danger : latestHb && latestHb.value < 9 ? T.warn : T.success} />
        <StatCard label="Avg Hb (All)" value={hbData.length > 0 ? `${avgHb} g/dL` : "—"} color={avgHb < 7 ? T.danger : avgHb < 9 ? T.warn : T.success} />
        <StatCard label="VOC (12mo)" value={`${vocLast12Mo}`} sub={`${vocCount} total`} color={vocLast12Mo >= 3 ? T.danger : vocLast12Mo >= 1 ? T.warn : T.success} />
        <StatCard label="Active Meds" value={`${activeMedCount}`} sub="medications" color={T.purple} />
        <StatCard label="TCD" value={latestTCDVal !== null ? `${latestTCDVal} cm/s` : "—"} sub={latestTCDVal !== null && latestTCDVal >= 200 ? "Abnormal" : latestTCDVal !== null && latestTCDVal >= 170 ? "Conditional" : "Normal"} color={latestTCDVal !== null && latestTCDVal >= 200 ? T.danger : latestTCDVal !== null && latestTCDVal >= 170 ? T.warn : T.success} />
        <StatCard label="Transfusions" value={`${transfusions.length}`} sub="total" color={T.info} />
      </div>

      {!loadingHb && (<Card style={{ marginBottom: 10 }}><SectHeader label="Clinical Insights" color={T.warn} sub="Evidence-based · NIH/NHLBI Guidelines" />{insights.map((item, idx) => (<div key={idx} style={{ borderLeft: `3px solid ${icColors[item.type]}`, borderRadius: 7, padding: "7px 10px", marginBottom: idx < insights.length-1 ? 6 : 0, background: icBgs[item.type] }}><div style={{ fontSize: 11, color: icColors[item.type], lineHeight: 1.5 }}>{icIcons[item.type]} {item.msg}</div></div>))}</Card>)}

      <div className="scd-tabs-wrap">
        <div ref={tabsRef} className="scd-tabs scd-scroll" style={{ display: "flex", gap: 2, marginBottom: 10, background: T.bg, borderRadius: 10, padding: 3, border: `0.5px solid ${T.border}`, overflowX: "auto" }}>
          {SCD_TABS.map(({ id, icon, label }) => { const active = tab === id; return (<button key={id} data-tab={id} onClick={() => scrollTab(id)} className="scd-tab-btn scd-btn-press" style={{ padding: "7px 10px", borderRadius: 7, border: "none", background: active ? "#fff" : "transparent", color: active ? T.purple : T.faint, fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" }}>{icon} {label}</button>); })}
        </div>
      </div>

      <Card>
        {isLoadingTab(tab) ? <Skeleton /> : (
          <>
            {tab === "hb" && <HbTrendTab hbData={hbData} medications={medications} patientId={patientId} onAddHb={(v: number,t: number) => { addDoc(collection(db, "hbReadings"), { patientId, value: v, hbF: t, date: serverTimestamp() }).then(ref => addTimeline("lab", "🩸", `Hb: ${v} g/dL, HbF: ${t}%`)).catch(() => {}); }} />}
            {tab === "voc" && <VOCTab vocEvents={vocData} onAdd={(l: string,s: string) => { addDoc(collection(db, "vocEvents"), { patientId, location: l, severity: s, date: serverTimestamp(), status: "active" }).then(ref => addTimeline("med", "⚡", `VOC: ${l} (${s}/10)`)).catch(() => {}); }} patientId={patientId} />}
            {tab === "transfusions" && <TransfusionTab transfusions={transfusions} onAdd={(t: Transfusion) => { addDoc(collection(db, "transfusions"), { ...t, patientId, date: serverTimestamp() }).catch(() => {}); }} patientId={patientId} />}
            {tab === "tcd" && <TCDTab tcdData={tcdData} patientId={patientId} />}
            {tab === "medications" && <SCDMedicationsTab medications={medications} patientId={patientId} doctorId={doctorId} doctorName={doctorName} onUpdate={() => {}} onAdd={(m: SCDMedication) => { addDoc(collection(db, "prescriptions"), { ...m, patientId, doctorId, doctorName: doctorName??"Doctor", createdAt: serverTimestamp(), startDate: serverTimestamp() }).then(ref => addTimeline("med", "💊", `${m.medication} prescribed`)).catch(() => {}); }} />}
            {tab === "pain" && <PainManagementTab vocEvents={vocData} medications={medications} />}
            {tab === "hydroxyurea" && <HydroxyureaTab medications={medications} hbData={hbData} patientId={patientId} />}
            {tab === "adherence" && <AdherenceTab medications={medications} adherence={adherence} />}
            {tab === "alerts" && <AlertsTab alerts={alerts} onAdd={handleAddAlert} onDelete={handleDeleteAlert} hbData={hbData} vocData={vocData} medications={medications} complications={complications} vaccinations={vaccinations} tcdData={tcdData} />}
            {tab === "complications" && <ComplicationsTab complications={complications} onToggle={handleToggleComplication} />}
            {tab === "lifestyle" && <LifestyleTab lifestyle={lifestyle} onToggle={handleToggleLifestyle} onGrade={handleGradeLifestyle} />}
            {tab === "education" && <EducationTab education={education} onSend={handleSendEducation} patientId={patientId} />}
            {tab === "labs" && <LabsTab labOrders={labOrders} onOrderLab={handleOrderLab} onUpdateResult={handleUpdateResult} />}
            {tab === "vaccinations" && <VaccinationTab vaccinations={vaccinations} onUpdate={handleUpdateVaccination} />}
            {tab === "notes" && <NotesTab notes={clinicalNotes} onSave={handleSaveNote} onEdit={handleEditNote} patientName={patientName} />}
            {tab === "timeline" && <TimelineTab events={timeline} />}
            {tab === "messaging" && <MessagingTab messages={messages} onSend={handleSendMessage} threadId={threadId} loadingMessages={loadingMsg} patientName={patientName} />}
            {tab === "referrals" && <ReferralsPreview referrals={referrals as unknown as Referral[]} />}
            {tab === "acs" && <ACSHistoryTab complications={complications} transfusions={transfusions} />}
          </>
        )}
      </Card>

      <div style={{ textAlign: "center", color: T.faint, fontSize: 10, padding: "8px 0 2px" }}>
        Sickle Cell Disease Control Center v1.0 · AMEXAN · NIH/NHLBI · ASH 2023 Guidelines · All changes sync in real-time
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Root: SickleCellDashboard
// ═══════════════════════════════════════════════════════════════════════════════

export default function SickleCellDashboard({ doctorId, doctorName, onOpenConversation, onOpenReferrals }: {
  doctorId?: string; doctorName?: string;
  onOpenConversation?: (threadId: string) => void;
  onOpenReferrals?: (patientId: string, patientName: string) => void;
}) {
  const [patients, setPatients] = useState<SCDPatientSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [mobileScreen, setMobileScreen] = useState<"list"|"detail">("list");
  const [listSearch, setListSearch] = useState("");

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "scd-dashboard-css";
    if (!document.getElementById("scd-dashboard-css")) {
      el.innerHTML = GLOBAL_CSS;
      document.head.appendChild(el);
    }
    return () => { document.getElementById("scd-dashboard-css")?.remove(); };
  }, []);

  useEffect(() => {
    const q = query(collection(db, "hbReadings"));
    return onSnapshot(q, async snap => {
      const map: Record<string, { count: number; latestHb?: number; latestHbF?: number; lastReading?: Date }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        const pid = data.patientId; if (!pid) return;
        const val = data.value as number | undefined;
        const hbF = data.hbF as number | undefined;
        const at = data.date instanceof Timestamp ? data.date.toDate() : new Date();
        if (!map[pid]) map[pid] = { count: 0 };
        map[pid].count++;
        if (!map[pid].lastReading || at > map[pid].lastReading!) {
          map[pid].lastReading = at; map[pid].latestHb = val; map[pid].latestHbF = hbF;
        }
      });
      const ids = Object.keys(map);
      if (!ids.length) { setPatients([]); setLoadingPatients(false); return; }

      const results = await Promise.all(ids.map(async pid => {
        try {
          let pd: Record<string, unknown> | null = null;
          try { const u = await getDoc(doc(db, "users", pid)); if (u.exists()) pd = u.data(); } catch {}
          if (!pd) { try { const p = await getDoc(doc(db, "patientProfiles", pid)); if (p.exists()) pd = p.data(); } catch {} }
          const name = String(pd?.name ?? pd?.displayName ?? pd?.fullName ?? `Patient ${pid.slice(-6)}`);
          const vocSnap = await getDocs(query(collection(db, "vocEvents"), where("patientId", "==", pid)));
          const totalVOC = vocSnap.size;
          return {
            id: pid, name, email: String(pd?.email ?? ""), phone: String(pd?.phone ?? ""),
            universalId: String(pd?.universalId ?? pd?.nhif ?? ""),
            latestHb: map[pid].latestHb, latestHbF: map[pid].latestHbF,
            lastReading: map[pid].lastReading, totalReadings: map[pid].count,
            totalVOC,
          } as SCDPatientSummary;
        } catch {
          return { id: pid, name: `Patient ${pid.slice(-6)}`, totalReadings: map[pid].count, totalVOC: 0 } as SCDPatientSummary;
        }
      }));

      results.sort((a, b) => (b.lastReading?.getTime() ?? 0) - (a.lastReading?.getTime() ?? 0));
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
    <div className="scd-root" style={{ color: T.text, background: T.bg, minHeight: "100%", padding: "0 0 24px" }}>

      <div className={`scd-mobile-list scd-scroll${mobileScreen === "detail" ? " hidden" : ""}`}>
        <div className="scd-list-topbar">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><h2>🩸 SCD Monitor</h2><p>AMEXAN · NIH/NHLBI · ASH 2023</p></div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "5px 11px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "scd-pulse 2s ease-in-out infinite" }} />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>Live</span>
            </div>
          </div>
        </div>
        <div className="scd-list-search"><input type="search" value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search patients…" /></div>
        {loadingPatients
          ? <div style={{ padding: "32px 16px", color: T.faint, textAlign: "center" }}><span style={{ animation: "scd-pulse 1.4s ease-in-out infinite", display: "inline-block" }}>Loading patients…</span></div>
          : !patients.length
            ? <div style={{ padding: "48px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🩸</div><div style={{ color: T.muted, fontSize: 13 }}>No SCD monitoring patients found.</div></div>
            : filteredMobilePatients.map(p => {
                const active = selectedId === p.id;
                return (<button key={p.id} onClick={() => { setSelectedId(p.id); setMobileScreen("detail"); }} className={`scd-patient-btn${active ? " active-row" : ""}`}>
                  <div className="scd-patient-avatar">{p.name.charAt(0).toUpperCase()}</div>
                  <div className="scd-patient-row-info">
                    <div className="scd-patient-row-name">{p.name}</div>
                    <div className="scd-patient-row-sub">{p.universalId || p.id.slice(0,10)}{p.lastReading ? ` · ${p.lastReading.toLocaleDateString()}` : ""}{` · ${p.totalReadings} readings`}</div>
                  </div>
                  {p.latestHb != null && (<div className="scd-patient-row-hb"><div style={{ fontWeight: 800, fontSize: 14, color: p.latestHb < 7 ? T.danger : p.latestHb < 9 ? T.warn : T.success }}>{p.latestHb}</div><div style={{ fontSize: 9, color: p.latestHb < 7 ? T.danger : p.latestHb < 9 ? T.warn : T.success, fontWeight: 700, background: p.latestHb < 7 ? "#fef2f2" : p.latestHb < 9 ? "#fff7ed" : "#f0fdf4", borderRadius: 4, padding: "1px 5px", display: "inline-block", marginTop: 2 }}>Hb</div></div>)}
                  <span style={{ color: T.faint, fontSize: 20, marginLeft: 4, flexShrink: 0 }}>›</span>
                </button>);
              })}
      </div>

      <div className={`scd-mobile-detail${mobileScreen === "list" ? " hidden" : ""}`}>
        {selectedPatient ? (
          <>
            <div className="scd-detail-topbar">
              <button className="scd-back-btn" onClick={() => setMobileScreen("list")}>‹</button>
              <div className="scd-detail-topbar-avatar">{selectedPatient.name.charAt(0).toUpperCase()}</div>
              <div className="scd-detail-topbar-info">
                <div className="scd-detail-topbar-name">{selectedPatient.name}</div>
                <div className="scd-detail-topbar-sub">{selectedPatient.universalId ?? selectedPatient.id.slice(0,10)} · {selectedPatient.totalReadings} readings</div>
              </div>
              {selectedPatient.latestHb != null && (
                <div className="scd-detail-topbar-hb">
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>Hb {selectedPatient.latestHb}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>{selectedPatient.latestHb < 7 ? "Severe" : selectedPatient.latestHb < 9 ? "Moderate" : "Stable"}</div>
                </div>
              )}
            </div>
            <div className="scd-detail-content scd-scroll">
              <PatientPanel patientId={selectedPatient.id} onOpenReferrals={onOpenReferrals} onOpenConversation={onOpenConversation} patientName={selectedPatient.name} doctorId={doctorId} doctorName={doctorName} />
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: T.faint, fontSize: 14, gap: 10 }}>
            <span style={{ fontSize: 48 }}>🩸</span>
            <span>Select a patient</span>
          </div>
        )}
      </div>

      <div className="scd-desktop-layout" style={{ flexDirection: "column", minHeight: "100%" }}>
        <div className="scd-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10, padding: "16px 0 0" }}>
          <div><h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, margin: 0 }}>🩸 SCD Monitoring Control Center</h2><p style={{ color: T.muted, fontSize: 12, margin: "3px 0 0" }}>Sickle Cell Disease intelligence · AMEXAN · NIH/NHLBI Guidelines · ASH 2023</p></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: T.muted }}>{patients.length} patients · {patients.reduce((a, p) => a + p.totalReadings, 0)} readings</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(124,58,237,0.08)", border: "0.5px solid rgba(124,58,237,0.3)", borderRadius: 8, padding: "6px 13px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.purple, animation: "scd-pulse 2s ease-in-out infinite" }} />
              <span style={{ color: T.purple, fontSize: 12, fontWeight: 600 }}>Live Sync</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
          <div className="scd-patient-list" style={{ width: 290, flexShrink: 0 }}>
            <PatientPicker patients={patients} selectedId={selectedId} onSelect={setSelectedId} loading={loadingPatients} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedPatient
              ? <PatientPanel patientId={selectedPatient.id} onOpenReferrals={onOpenReferrals} onOpenConversation={onOpenConversation} patientName={selectedPatient.name} doctorId={doctorId} doctorName={doctorName} />
              : loadingPatients
                ? <Skeleton height={300} />
                : patients.length > 0
                  ? <Card><div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}><div style={{ fontSize: 36, marginBottom: 10 }}>🩸</div>Select a patient from the list</div></Card>
                  : null}
          </div>
        </div>
      </div>
    </div>
  );
}
