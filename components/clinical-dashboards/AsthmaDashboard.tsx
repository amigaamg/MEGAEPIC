"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, Timestamp, doc, updateDoc, addDoc, deleteDoc, setDoc, getDocs, orderBy, limit as firestoreLimit } from "firebase/firestore";

interface PharmaEntry {
  drugClass: string; mechanism: string; minDose: number; maxDose: number; unit: string;
  commonDoses: string[]; frequencies: string[]; routes: string[];
  indications: string[]; contraindications: string[]; warnings: string[];
  sideEffects: string[]; patientInstructions: string; monitoring: string[];
  interactions: string[]; pregnancyCategory: string; color: string; tlColor: string;
}

const PHARMA_DB: Record<string, PharmaEntry> = {
  "Albuterol HFA": {
    drugClass: "Short-Acting Beta-Agonist (SABA)",
    mechanism: "Selective beta-2 adrenergic receptor agonist, relaxes bronchial smooth muscle, increases cAMP, causes bronchodilation within 5-15 minutes, duration 4-6 hours.",
    minDose: 90, maxDose: 180, unit: "mcg",
    commonDoses: ["90 (2 puffs)"], frequencies: ["q4-6h PRN"], routes: ["Inhaled (MDI)"],
    indications: ["Acute asthma symptom relief", "Exercise-induced bronchoconstriction pre-treatment", "Acute exacerbations first-line"],
    contraindications: ["Hypersensitivity to albuterol", "Tachyarrhythmias use with caution"],
    warnings: ["Excessive use >2 canisters/year indicates poor control needs step-up GINA", "May cause hypokalemia with high doses", "Paradoxical bronchospasm rare stop if occurs", "Monitor for tremor/tachycardia"],
    sideEffects: ["Tremor", "Tachycardia", "Palpitations", "Headache", "Nervousness", "Hypokalemia high doses", "Hyperglycemia high doses"],
    patientInstructions: "Use only when needed for symptom relief. Shake well before each use. Prime with 4 test sprays if new or not used for 7 days. Rinse mouth after use. If using >2 canisters per year tell your doctor.",
    monitoring: ["Number of canisters used per year", "Symptom frequency", "Peak flow", "ACT score"],
    interactions: ["Beta-blockers non-selective may block bronchodilation", "Diuretics may worsen hypokalemia", "MAOIs tricyclic antidepressants may increase cardiovascular effects"],
    pregnancyCategory: "C, safe in acute asthma exacerbations, benefits outweigh risks",
    color: "#059669", tlColor: "#34d399",
  },
  "Levalbuterol (Xopenex)": {
    drugClass: "Short-Acting Beta-Agonist (SABA) - R-isomer",
    mechanism: "R-isomer of albuterol, selective beta-2 agonist with less beta-1 cardiac stimulation. Bronchodilation with potentially fewer side effects than racemic albuterol.",
    minDose: 45, maxDose: 90, unit: "mcg",
    commonDoses: ["45 (1 puff)", "90 (2 puffs)"], frequencies: ["q4-6h PRN"], routes: ["Inhaled (MDI)"],
    indications: ["Acute asthma symptom relief", "Patients intolerant to racemic albuterol side effects"],
    contraindications: ["Hypersensitivity to levalbuterol or albuterol"],
    warnings: ["Same class warnings as albuterol - excessive use indicates poor control", "May cause hypokalemia", "Paradoxical bronchospasm rare"],
    sideEffects: ["Tremor (possibly less than albuterol)", "Tachycardia (possibly less than albuterol)", "Nervousness", "Headache", "Dizziness"],
    patientInstructions: "Similar to albuterol. May be better tolerated in patients who experience significant tremor or palpitations with regular albuterol. Standard 4-6 hour duration.",
    monitoring: ["Symptom frequency", "Peak flow", "Canister usage rate"],
    interactions: ["Beta-blockers may antagonize effects", "Other adrenergics may potentiate effects"],
    pregnancyCategory: "C, use when clearly needed",
    color: "#059669", tlColor: "#6ee7b7",
  },
  "Fluticasone propionate (Flovent HFA)": {
    drugClass: "Inhaled Corticosteroid (ICS)",
    mechanism: "Synthetic glucocorticoid, high affinity for glucocorticoid receptor, decreases airway inflammation, eosinophil recruitment, cytokine production, airway hyperresponsiveness.",
    minDose: 88, maxDose: 440, unit: "mcg",
    commonDoses: ["44 (1-2 puffs)", "110 (1-2 puffs)", "220 (1-2 puffs)"], frequencies: ["BID"], routes: ["Inhaled (MDI)"],
    indications: ["Persistent asthma maintenance therapy GINA step 2-5", "Step-down therapy once controlled"],
    contraindications: ["Hypersensitivity to fluticasone", "Acute bronchospasm not for rescue", "Untreated oral thrush"],
    warnings: ["Rinse mouth after each use to prevent oral thrush and dysphonia", "Adrenal suppression with high doses >440mcg/day long-term", "Growth velocity reduction in children monitor height annually", "Cataract/glaucoma risk with long-term high dose", "Not for acute attacks"],
    sideEffects: ["Oral thrush candidiasis", "Dysphonia/hoarseness", "Cough", "Pharyngitis", "Adrenal suppression high dose long-term", "Growth suppression children"],
    patientInstructions: "Rinse your mouth with water after each use and spit out do not swallow. Use every 12 hours consistently. Do not stop even if feeling well. Not for sudden breathing problems.",
    monitoring: ["Asthma control ACT score", "Peak flow", "Growth velocity in children", "Ocular exam annually for cataract/glaucoma", "Adrenal function if high-dose long-term"],
    interactions: ["CYP3A4 inhibitors strong like ritonavir ketoconazole can increase systemic levels risk of adrenal suppression", "Beta-agonists additive bronchodilation"],
    pregnancyCategory: "C, ICS preferred over oral steroids in pregnancy, use lowest effective dose",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Budesonide (Pulmicort Flexhaler)": {
    drugClass: "Inhaled Corticosteroid (ICS)",
    mechanism: "Synthetic glucocorticoid with high topical anti-inflammatory activity. Decreases airway inflammation by inhibiting eosinophils, mast cells, macrophages, T-lymphocytes.",
    minDose: 180, maxDose: 720, unit: "mcg",
    commonDoses: ["90 (Flexhaler)", "180 (Flexhaler)", "360 (Flexhaler)"], frequencies: ["BID"], routes: ["Inhaled (DPI)"],
    indications: ["Persistent asthma maintenance GINA step 2-5", "Preferred ICS in children step 2"],
    contraindications: ["Hypersensitivity to budesonide", "Acute bronchospasm not for rescue"],
    warnings: ["Rinse mouth after use oral thrush risk", "Adrenal insufficiency during stress/trauma if high-dose prolonged use", "Growth monitoring in children", "Cataract and glaucoma with long-term high-dose use", "Not for acute bronchospasm"],
    sideEffects: ["Oral thrush", "Dysphonia", "Cough", "Pharyngitis", "Adrenal suppression high dose", "Growth velocity reduction"],
    patientInstructions: "Inhale rapidly and deeply through the inhaler. DPI not to be used with spacer. Rinse mouth after use. Use twice daily every day. Not for sudden attacks.",
    monitoring: ["ACT", "Peak flow", "Height in children", "Ocular exam", "Adrenal function if indicated"],
    interactions: ["CYP3A4 inhibitors increase budesonide levels"],
    pregnancyCategory: "B, preferred ICS in pregnancy, extensive safety data",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Beclomethasone (Qvar)": {
    drugClass: "Inhaled Corticosteroid (ICS)",
    mechanism: "Prodrug hydrolyzed to active beclomethasone-17-monopropionate (BMP) in the lungs. High glucocorticoid receptor affinity, potent topical anti-inflammatory.",
    minDose: 40, maxDose: 160, unit: "mcg",
    commonDoses: ["40 (1-2 puffs)", "80 (1-2 puffs)"], frequencies: ["BID"], routes: ["Inhaled (MDI)"],
    indications: ["Persistent asthma maintenance step 2", "Switching from other ICS lower dose needed due to extrafine particle size"],
    contraindications: ["Hypersensitivity to beclomethasone", "Acute bronchospasm"],
    warnings: ["Rinse mouth after use", "Extrafine particles reach small airways better than fluticasone", "Adrenal suppression with high doses", "Not for acute attacks"],
    sideEffects: ["Oral thrush", "Dysphonia", "Cough", "Pharyngitis"],
    patientInstructions: "Rinse mouth after each use. Qvar has extrafine particles that reach deeper into lungs. Use twice daily consistently. Shake well before use.",
    monitoring: ["ACT", "Peak flow", "Ocular exam"],
    interactions: ["CYP3A4 inhibitors theoretical"],
    pregnancyCategory: "C, limited data, ICS preferred class in pregnancy",
    color: "#0891b2", tlColor: "#67e8f9",
  },
  "Budesonide/Formoterol (Symbicort SMART)": {
    drugClass: "ICS/LABA Combination - SMART Regimen",
    mechanism: "Budesonide ICS anti-inflammatory + formoterol LABA rapid-onset bronchodilation within 1-3 minutes. SMART uses the same inhaler for maintenance AND reliever therapy.",
    minDose: 80, maxDose: 160, unit: "mcg (ICS)",
    commonDoses: ["80/4.5 (1-2 puffs BID + PRN)", "160/4.5 (1-2 puffs BID + PRN)"], frequencies: ["BID + PRN"], routes: ["Inhaled (DPI/MDI)"],
    indications: ["GINA step 3-5 SMART preferred strategy", "Adults and adolescents 12+ years", "Patients needing both maintenance and rapid symptom relief"],
    contraindications: ["Hypersensitivity to budesonide or formoterol", "Acute severe asthma requiring urgent care"],
    warnings: ["Do not exceed 8 puffs/day in total (maintenance + as-needed)", "Rinse mouth after each use", "Not for acute severe exacerbations seek emergency care", "Formoterol long-acting beta-agonist black box warning asthma-related death"],
    sideEffects: ["Oral thrush", "Dysphonia", "Tremor", "Headache", "Tachycardia", "Cough", "Pharyngitis"],
    patientInstructions: "This is BOTH your controller and your reliever! Use 1-2 puffs in the morning and 1-2 puffs in the evening for maintenance. For symptom relief take additional puffs as needed. Maximum 8 puffs per day total. Rinse mouth after use. If you need more than 8 puffs in a day seek urgent medical help.",
    monitoring: ["Total daily puffs count critical", "ACT score", "Peak flow", "Exacerbation rate", "SABA-free days", "Puff count per week"],
    interactions: ["Beta-blockers non-selective may antagonize bronchodilation", "CYP3A4 inhibitors may increase budesonide levels"],
    pregnancyCategory: "B, SMART preferred GINA strategy in pregnancy",
    color: "#10b981", tlColor: "#34d399",
  },
  "Fluticasone/Salmeterol (Advair Diskus)": {
    drugClass: "ICS/LABA Combination - Fixed Dose",
    mechanism: "Fluticasone ICS anti-inflammatory + salmeterol LABA long-acting bronchodilation 12 hours. Fixed maintenance-only regimen NOT for relief.",
    minDose: 100, maxDose: 500, unit: "mcg (ICS)",
    commonDoses: ["100/50", "250/50", "500/50"], frequencies: ["BID"], routes: ["Inhaled (DPI/MDI)"],
    indications: ["Persistent asthma maintenance step 3-5 GINA", "Patients already controlled on ICS+LABA separately"],
    contraindications: ["Hypersensitivity", "Acute bronchospasm not a reliever", "Status asthmaticus"],
    warnings: ["NOT for acute symptom relief MUST use separate SABA", "LABA black box warning asthma-related death use only with ICS", "Rinse mouth after use", "Adrenal suppression high-dose long-term", "Cardiovascular effects high doses"],
    sideEffects: ["Oral thrush", "Dysphonia", "Cough", "Pharyngitis", "Headache", "Tremor", "Palpitations", "Candidiasis"],
    patientInstructions: "Use twice daily 12 hours apart. This is ONLY a maintenance inhaler not for rescue. You MUST still carry your blue reliever inhaler. Rinse mouth after each use. Do not stop suddenly.",
    monitoring: ["ACT", "Peak flow", "Exacerbation rate", "SABA usage", "Adrenal function high dose"],
    interactions: ["Strong CYP3A4 inhibitors increase systemic fluticasone", "Beta-blockers non-selective", "Diuretics hypokalemia"],
    pregnancyCategory: "C, use if clearly indicated, benefit likely outweighs risk",
    color: "#10b981", tlColor: "#6ee7b7",
  },
  "Fluticasone furoate/Vilanterol (Breo Ellipta)": {
    drugClass: "ICS/LABA Combination - Once Daily",
    mechanism: "Fluticasone furoate ICS high receptor affinity + vilanterol LABA once-daily ultra-long-acting bronchodilation. Once daily dosing improves adherence.",
    minDose: 100, maxDose: 200, unit: "mcg (ICS)",
    commonDoses: ["100/25", "200/25"], frequencies: ["OD"], routes: ["Inhaled (DPI)"],
    indications: ["Persistent asthma step 3-5 once-daily option", "Patients preferring once-daily regimen for adherence"],
    contraindications: ["Hypersensitivity", "Acute bronchospasm not a reliever"],
    warnings: ["Once daily DO NOT double dose if missed skip the missed dose", "Rinse mouth after use", "LABA black box warning", "Adrenal suppression high dose", "Not for acute symptoms"],
    sideEffects: ["Oral thrush", "Dysphonia", "Cough", "Headache", "Pharyngitis", "Pneumonia warning in COPD", "Palpitations"],
    patientInstructions: "Take ONE puff ONCE daily at the same time each day. Do not take more than 1 puff per day. Rinse mouth after use. Still carry your blue reliever for rescue.",
    monitoring: ["ACT", "Peak flow", "Exacerbation rate", "Adherence daily dosing", "SABA usage"],
    interactions: ["CYP3A4 inhibitors increase levels", "Beta-blockers antagonize"],
    pregnancyCategory: "C, limited data",
    color: "#10b981", tlColor: "#a7f3d0",
  },
  "Salmeterol (Serevent)": {
    drugClass: "Long-Acting Beta-Agonist (LABA)",
    mechanism: "Selective beta-2 agonist, long-acting bronchodilation for 12 hours. Should NEVER be used without ICS in asthma.",
    minDose: 50, maxDose: 50, unit: "mcg",
    commonDoses: ["50 (1 blister)"], frequencies: ["BID"], routes: ["Inhaled (DPI)"],
    indications: ["Add-on therapy to ICS in persistent asthma step 3-5 GINA", "NEVER as monotherapy in asthma"],
    contraindications: ["Hypersensitivity to salmeterol", "Asthma without concomitant ICS - increased mortality", "Acute bronchospasm"],
    warnings: ["BLACK BOX WARNING salmeterol monotherapy increases risk of asthma-related death", "Must always be used with an ICS never alone", "Not for acute symptom relief", "May mask worsening asthma"],
    sideEffects: ["Tremor", "Tachycardia", "Palpitations", "Headache", "Nervousness", "Muscle cramps", "Hypokalemia"],
    patientInstructions: "Salmeterol must always be used with an inhaled steroid Flovent/Advair type. Never use salmeterol alone for asthma. Take every 12 hours. Always carry SABA for symptom relief.",
    monitoring: ["Concomitant ICS use verification", "ACT", "Peak flow"],
    interactions: ["Non-selective beta-blockers antagonize", "Diuretics may worsen hypokalemia", "MAOIs tricyclic antidepressants increase cardiovascular risk"],
    pregnancyCategory: "C, use only if clearly needed with ICS",
    color: "#0891b2", tlColor: "#47cdff",
  },
  "Formoterol (Foradil/Oxis)": {
    drugClass: "Long-Acting Beta-Agonist (LABA) - Rapid Onset",
    mechanism: "Selective beta-2 agonist with rapid onset 1-3 minutes and 12-hour duration. Unique among LABAs for its rapid onset similar to SABA.",
    minDose: 12, maxDose: 48, unit: "mcg",
    commonDoses: ["12 (1 capsule)"], frequencies: ["BID"], routes: ["Inhaled (DPI)"],
    indications: ["Add-on to ICS in asthma step 3", "When rapid onset LABA needed for symptom relief only in SMART regimens", "COPD"],
    contraindications: ["Hypersensitivity", "Asthma without ICS monotherapy"],
    warnings: ["LABA black box warning must be used with ICS", "Not for acute exacerbations despite rapid onset 12-hour duration means risk of accumulation", "Monitor for paradoxical bronchospasm"],
    sideEffects: ["Tremor", "Tachycardia", "Headache", "Palpitations", "Cough", "Hypokalemia", "Hyperglycemia"],
    patientInstructions: "Used in combination products like Symbicort for SMART therapy. The rapid onset allows it to work for both maintenance and relief when combined with budesonide.",
    monitoring: ["ICS use verification", "Exacerbation rate", "SABA use"],
    interactions: ["Beta-blockers", "Diuretics", "MAOIs"],
    pregnancyCategory: "C, use with ICS if needed",
    color: "#0891b2", tlColor: "#38bdf8",
  },
  "Tiotropium (Spiriva Respimat)": {
    drugClass: "Long-Acting Muscarinic Antagonist (LAMA)",
    mechanism: "Blocks M3 muscarinic receptors in airways, decreases vagal tone, bronchoconstriction, mucus secretion. Add-on bronchodilation.",
    minDose: 2.5, maxDose: 5, unit: "mcg",
    commonDoses: ["2.5 (2 puffs)"], frequencies: ["OD"], routes: ["Inhaled (Respimat)"],
    indications: ["Add-on therapy GINA step 4-5","Persistent asthma despite ICS/LABA","COPD overlap"],
    contraindications: ["Hypersensitivity to tiotropium","Acute bronchospasm not for acute use"],
    warnings: ["Not for acute exacerbations not a reliever","May cause urinary retention in men with BPH","Narrow-angle glaucoma risk avoid contact with eyes"],
    sideEffects: ["Dry mouth","Cough","Pharyngitis","Sinusitis","Urinary retention men","Constipation","Blurred vision"],
    patientInstructions: "Take ONCE DAILY 2 puffs at the same time each day. Do NOT use for sudden breathing trouble. Avoid getting spray in eyes.",
    monitoring: ["Asthma control","Peak flow","Urinary symptoms","Glaucoma monitoring"],
    interactions: ["Anticholinergics additive anticholinergic effects"],
    pregnancyCategory: "B, limited human data",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Montelukast": {
    drugClass: "Leukotriene Receptor Antagonist (LTRA)",
    mechanism: "Selectively blocks cysteinyl leukotriene receptors CysLT1 in airways, decreases bronchoconstriction, mucus, eosinophilic inflammation.",
    minDose: 10, maxDose: 10, unit: "mg",
    commonDoses: ["10"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Mild persistent asthma step 2 GINA","Exercise-induced bronchoconstriction","Allergic rhinitis-associated asthma","Aspirin-sensitive asthma"],
    contraindications: ["Hypersensitivity","Phenylketonuria chewable contains aspartate"],
    warnings: ["ADRs neuropsychiatric events rare, agitation, aggression, depression, suicidal ideation, educate patient","Less effective than low-dose ICS as monotherapy","Administer in evening for maximal benefit"],
    sideEffects: ["Headache","Abdominal pain","Thirst","Diarrhea","Neuropsychiatric events rare monitor","Mild transaminitis"],
    patientInstructions: "Take ONCE DAILY in the evening. Swallow tablet whole or chew chewable tablet. Tell your doctor immediately if you notice mood changes or unusual thoughts. Not for acute attacks.",
    monitoring: ["Asthma control ACT","Neuropsychiatric symptoms","LFTs if long-term"],
    interactions: ["CYP3A4 inducers rifampicin phenytoin decrease montelukast levels","Gemfibrozil increases montelukast levels"],
    pregnancyCategory: "B, limited data, use if clearly needed",
    color: "#0891b2", tlColor: "#06b6d4",
  },
  "Theophylline SR": {
    drugClass: "Methylxanthine Bronchodilator",
    mechanism: "Non-selective phosphodiesterase inhibitor increases cAMP causes bronchodilation. Also anti-inflammatory, increases diaphragmatic contractility, increases mucociliary clearance.",
    minDose: 200, maxDose: 400, unit: "mg",
    commonDoses: ["200","300","400"], frequencies: ["BD"], routes: ["Oral"],
    indications: ["Add-on therapy in severe asthma step 5 GINA","Nocturnal asthma","COPD overlap"],
    contraindications: ["Hypersensitivity","Peptic ulcer disease","Seizure disorder","Uncontrolled arrhythmia"],
    warnings: ["NARROW THERAPEUTIC INDEX 55-110 mcmol/L","Toxicity nausea vomiting seizures arrhythmias monitor levels","Multiple drug interactions check ALL medications","Smoking decreases levels, cessation increases levels","Fever decreases clearance to toxicity risk"],
    sideEffects: ["Nausea/vomiting dose-related","Headache","Insomnia","Tremor","Palpitations","Tachycardia","Seizures toxic levels","Arrhythmias toxic levels"],
    patientInstructions: "Take slow-release tablets whole do not crush or chew. Take at SAME times each day 12 hours apart. Avoid caffeine it adds to side effects. Regular blood tests required to check levels.",
    monitoring: ["Serum theophylline levels trough 55-110 mcmol/L mandatory","ECG if cardiac symptoms","LFTs","Seizure monitoring"],
    interactions: ["CYP1A2 inhibitors ciprofloxacin fluvoxamine cimetidine increase toxicity","CYP1A2 inducers rifampicin carbamazepine phenytoin smoking decrease levels","Macrolides erythromycin clarithromycin increase toxicity","Caffeine additive effects"],
    pregnancyCategory: "C, avoid if possible, can cause neonatal irritability",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Omalizumab (Xolair)": {
    drugClass: "Anti-IgE Monoclonal Antibody (Biologic)",
    mechanism: "Recombinant humanized monoclonal antibody that binds free IgE preventing IgE binding to Fc-epsilon-RI receptors on mast cells/basophils, decreasing allergic inflammation. SC injection.",
    minDose: 75, maxDose: 375, unit: "mg",
    commonDoses: ["75","150","300","375"], frequencies: ["Every 2-4 weeks"], routes: ["SC injection"],
    indications: ["Severe persistent allergic asthma GINA step 5","IgE-mediated asthma plus positive skin test or aeroallergen sensitivity","Age 6 years and above","Inadequate control on ICS/LABA"],
    contraindications: ["Hypersensitivity to omalizumab","Non-allergic asthma low IgE","Autoimmune disease theoretical risk"],
    warnings: ["Anaphylaxis 0.2 percent observe 30 min after injection prescribe auto-injector","Increased risk of parasitic infections","Eosinophilic granulomatosis with polyangiitis EGPA rare monitor"],
    sideEffects: ["Injection site reactions","Anaphylaxis rare 0.2 percent","Headache","Arthralgia","Fever","Parasitic infection risk"],
    patientInstructions: "Given as injection every 2-4 weeks by healthcare professional. May take 12-16 weeks to see full benefit. Do NOT stop your other asthma medications. Carry epinephrine auto-injector.",
    monitoring: ["IgE levels at baseline and periodically","ACT score every visit","Exacerbation rate","Parasitic infection screening"],
    interactions: ["No formal drug interaction studies"],
    pregnancyCategory: "B, limited data, human IgG crosses placenta",
    color: "#7c3aed", tlColor: "#a855f7",
  },
  "Mepolizumab (Nucala)": {
    drugClass: "Anti-IL5 Monoclonal Antibody (Biologic)",
    mechanism: "Humanized monoclonal antibody that binds IL-5, decreases eosinophil production, maturation, and survival, decreasing eosinophilic airway inflammation. SC injection every 4 weeks.",
    minDose: 100, maxDose: 100, unit: "mg",
    commonDoses: ["100"], frequencies: ["Every 4 weeks"], routes: ["SC injection"],
    indications: ["Severe eosinophilic asthma GINA step 5","Blood eosinophils 300 or more cells per mcL","Oral corticosteroid-sparing therapy"],
    contraindications: ["Hypersensitivity to mepolizumab","Non-eosinophilic asthma"],
    warnings: ["Hypersensitivity reactions immediate and delayed observe post-dose","Herpes zoster recommend vaccination before starting","May unmask EGPA"],
    sideEffects: ["Headache","Injection site reactions","Back pain","Fatigue","Hypersensitivity reactions","Herpes zoster","Pharyngitis"],
    patientInstructions: "Injection once every 4 weeks. Continue all other medications as prescribed. May take 4-8 weeks to show improvement. Do not stop abruptly.",
    monitoring: ["Blood eosinophil count baseline 3-monthly","ACT score","Oral corticosteroid use aim to reduce","Exacerbation frequency"],
    interactions: ["No formal drug interaction studies"],
    pregnancyCategory: "B, limited human data, monoclonal antibodies cross placenta in 3rd trimester",
    color: "#7c3aed", tlColor: "#8b5cf6",
  },
  "Benralizumab (Fasenra)": {
    drugClass: "Anti-IL5R-alpha Monoclonal Antibody (Biologic)",
    mechanism: "Humanized afucosylated monoclonal antibody that binds IL-5 receptor alpha on eosinophils causing antibody-dependent cell-mediated cytotoxicity with rapid eosinophil depletion less than 24h. SC every 8 weeks after loading.",
    minDose: 30, maxDose: 30, unit: "mg",
    commonDoses: ["30"], frequencies: ["Every 8 weeks"], routes: ["SC injection"],
    indications: ["Severe eosinophilic asthma GINA step 5","Reduction of exacerbations and OCS use"],
    contraindications: ["Hypersensitivity to benralizumab","Non-eosinophilic asthma"],
    warnings: ["Hypersensitivity reactions rare but serious","Helminth infection treat before starting","May unmask EGPA or other eosinophilic vasculitides"],
    sideEffects: ["Headache","Pharyngitis","Pyrexia","Injection site reactions","Hypersensitivity rare","Herpes zoster 1-2 percent"],
    patientInstructions: "First 3 doses every 4 weeks then every 8 weeks. Do not stop other asthma medications. Keep all appointments timing of doses matters.",
    monitoring: ["Blood eosinophils should become zero","ACT score","Exacerbation rate","OCS use","Symptom diary"],
    interactions: ["No formal studies, avoid other biologics concurrently"],
    pregnancyCategory: "B, limited data, IgG1 crosses placenta",
    color: "#7c3aed", tlColor: "#c084fc",
  },
  "Dupilumab (Dupixent)": {
    drugClass: "Anti-IL4R-alpha Monoclonal Antibody (Biologic)",
    mechanism: "Fully human monoclonal antibody that binds IL-4R-alpha subunit, blocking both IL-4 and IL-13 signaling type 2 inflammation. Broadest biologic also approved for atopic dermatitis, nasal polyps, eosinophilic esophagitis.",
    minDose: 200, maxDose: 300, unit: "mg",
    commonDoses: ["200","300"], frequencies: ["Every 2 weeks"], routes: ["SC injection"],
    indications: ["Moderate-to-severe eosinophilic asthma GINA step 5","OCS-dependent asthma","Atopic dermatitis plus asthma","Nasal polyps plus asthma"],
    contraindications: ["Hypersensitivity to dupilumab","Active helminth infection"],
    warnings: ["Eosinophilia transient can be greater than 3000 per mcL usually self-limiting","Conjunctivitis/keratitis especially with atopic dermatitis indication","Parasitic infection treat before starting","EGPA unmasking monitor for vasculitic symptoms"],
    sideEffects: ["Injection site reactions","Conjunctivitis 8-15 percent","Ocular pruritus","Dry eye","Eosinophilia","Herpes zoster","Arthralgia"],
    patientInstructions: "Loading dose if prescribed then injection every 2 weeks. Can self-inject after training auto-injector pen. Store in refrigerator. Continue all other medications. Report eye symptoms early.",
    monitoring: ["Blood count eosinophils","ACT score","Exacerbation rate","OCS reduction","Ocular exam if eye symptoms"],
    interactions: ["No formal studies, avoid live vaccines during therapy"],
    pregnancyCategory: "B, limited human data",
    color: "#0891b2", tlColor: "#22d3ee",
  },
  "Prednisolone": {
    drugClass: "Oral Corticosteroid (OCS)",
    mechanism: "Synthetic glucocorticoid, potent anti-inflammatory via multiple pathways: decreases eosinophils, cytokines, vascular permeability, mucus production.",
    minDose: 30, maxDose: 60, unit: "mg",
    commonDoses: ["30","40","50","60"], frequencies: ["OD"], routes: ["Oral"],
    indications: ["Acute asthma exacerbations short course 5-7 days","Severe persistent asthma maintenance lowest possible dose","OCS-dependent asthma prior to biologics"],
    contraindications: ["Systemic fungal infection","Live vaccine administration avoid during course","Active peptic ulcer use with caution"],
    warnings: ["Short courses 5-7 days do NOT require taper in asthma","Long-term use osteoporosis diabetes cataracts adrenal suppression","Screen for diabetes before starting steroid-induced hyperglycemia common","Psychiatric effects euphoria depression psychosis warn patient"],
    sideEffects: ["Short-term hyperglycemia insomnia mood changes increased appetite fluid retention","Long-term osteoporosis cataracts diabetes adrenal suppression Cushingoid features hypertension weight gain"],
    patientInstructions: "Take in the MORNING with breakfast. Short courses 5-7 days for flare-ups take every dose as prescribed. Long-term never stop suddenly doctor will taper. Carry a steroid card. Monitor blood sugar.",
    monitoring: ["Fasting blood glucose steroid-induced hyperglycemia","DXA scan if multiple courses per year or long-term use","Adrenal function morning cortisol","Weight BP mood","Ophthalmology exam cataracts"],
    interactions: ["NSAIDs increase GI bleeding risk","Antidiabetics increase glucose dose adjustment needed","CYP3A4 inducers rifampicin carbamazepine decrease prednisolone","Anticoagulants warfarin altered INR","Live vaccines contraindicated"],
    pregnancyCategory: "B, safe in short courses for maternal benefit, monitor for neonatal adrenal suppression with prolonged use",
    color: "#dc2626", tlColor: "#ef4444",
  },
  "Aminophylline": {
    drugClass: "IV Methylxanthine Bronchodilator",
    mechanism: "Phosphodiesterase inhibitor causes bronchodilation, increases mucociliary clearance, increases diaphragmatic contractility. Also mild anti-inflammatory and diuretic properties.",
    minDose: 5, maxDose: 6, unit: "mg/kg",
    commonDoses: ["Loading 5-6 mg/kg IV over 20-30 min","Infusion 0.5-0.7 mg/kg/hr"], frequencies: ["IV infusion"], routes: ["IV"],
    indications: ["Severe acute asthma exacerbation not responding to inhaled bronchodilators and IV steroids","Life-threatening asthma second-line after optimal therapy"],
    contraindications: ["Hypersensitivity to xanthines","Seizure disorder lower threshold","Uncontrolled arrhythmia","Peptic ulcer disease","Hyperthyroidism"],
    warnings: ["NARROW THERAPEUTIC INDEX toxic levels cause seizures and arrhythmias","Loading dose should be given over 20-30 min not bolus","If patient on oral theophylline skip or halve loading dose","Monitor ECG continuously during IV administration","Correct hypokalemia before and during infusion"],
    sideEffects: ["Nausea/vomiting common","Tachycardia","Hypotension","Arrhythmias atrial and ventricular","Seizures toxic levels greater than 110 mcmol/L","Restlessness","Insomnia","Tremor"],
    patientInstructions: "Given in hospital setting only intravenous infusion. You will have your heart rhythm monitored. Tell your nurse if you feel nauseous dizzy or your heart is racing. Must have regular blood level monitoring.",
    monitoring: ["Serum theophylline levels target 55-110 mcmol/L do NOT exceed","Continuous ECG monitoring","BP monitoring","K+ levels correct hypokalemia","CNS status seizure watch"],
    interactions: ["Ciprofloxacin greatly increases theophylline levels risk of seizures","Cimetidine increases levels","Erythromycin clarithromycin increase levels","Smoking decreases levels smokers need higher doses","Caffeine additive effects"],
    pregnancyCategory: "C, use only if clearly needed for life-threatening asthma",
    color: "#dc2626", tlColor: "#f87171",
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

export function generateClinicalAlerts({ peakFlowData, actData, meds, exacerbations }: {
  peakFlowData: PeakFlowReading[]; actData: ACTScore[]; meds: Medication[]; exacerbations: Exacerbation[];
}): Alert[] {
  const ret: Alert[] = [];
  if (!peakFlowData.length && !actData.length) return ret;

  const latestPF = peakFlowData.at(-1);
  const latestACT = actData.at(-1);

  if (latestACT) {
    const actTotal = (latestACT as any).total ?? (latestACT as any).score ?? 0;
    if (actTotal <= 15) {
      ret.push({ id: "act_very_poor", severity: "critical", type: "Asthma Control", category: "Asthma Control", active: true, message: "ACT score <=15 indicates very poorly controlled asthma",
        title: `ACT Score ${actTotal}/25 - Very Poorly Controlled`,
        detail: "ACT score <=15 indicates very poorly controlled asthma. High risk of exacerbation. Immediate step-up of therapy required.",
        evidence: "GINA 2023: ACT <=15 = very poorly controlled asthma. Minimum clinically important difference = 3 points.",
        action: "Step up treatment GINA algorithm. Consider short course OCS. Review adherence, inhaler technique, and triggers. Schedule follow-up within 1-2 weeks.",
        icon: "🚨" });
    } else if (actTotal >= 16 && actTotal <= 19) {
      ret.push({ id: "act_not_well", severity: "warning", type: "Asthma Control", category: "Asthma Control", active: true, message: "ACT score 16-19 indicates asthma is not well controlled",
        title: `ACT Score ${actTotal}/25 - Not Well Controlled`,
        detail: "ACT score 16-19 indicates asthma is not well controlled. Review medication and consider step-up.",
        evidence: "GINA 2023: ACT 16-19 = not well controlled. 25% of patients in this range will exacerbate within 6 months.",
        action: "Review ICS dose and inhaler technique. Consider step-up to next GINA step. Reassess in 4-6 weeks.",
        icon: "⚠️" });
    } else if (actTotal >= 20) {
      ret.push({ id: "act_well", severity: "info", type: "Asthma Control", category: "Asthma Control", active: true, message: "Well controlled asthma ACT >=20",
        title: `ACT Score ${actTotal}/25 - Well Controlled`,
        detail: "Well controlled asthma ACT >=20. Continue current management. Reassess in 3-6 months.",
        evidence: "GINA 2023: ACT >=20 = well controlled asthma. Lower exacerbation risk.",
        action: "If stable >=3 months consider step-down therapy. Continue regular monitoring.",
        icon: "✅" });
    }
  }

  if (latestPF && (latestPF as any).percentPersonalBest !== undefined) {
    const pct = (latestPF as any).percentPersonalBest;
    if (pct < 50) {
      ret.push({ id: "pf_red", severity: "critical", type: "Peak Flow", category: "Peak Flow", active: true, message: `Peak flow ${pct}% of personal best - RED zone`,
        title: `Peak Flow in RED Zone: ${pct}% of personal best (${latestPF.value} L/min)`,
        detail: "Peak flow <50% personal best indicates severe airway obstruction. Immediate action required.",
        evidence: "GINA 2023: Peak flow <50% = RED zone medical alert. Risk of severe exacerbation.",
        action: "Take reliever SABA 4-6 puffs immediately. Seek emergency care if no improvement. Contact doctor urgently.",
        icon: "🚨" });
    } else if (pct < 80) {
      ret.push({ id: "pf_yellow", severity: "warning", type: "Peak Flow", category: "Peak Flow", active: true, message: `Peak flow ${pct}% of personal best - YELLOW zone`,
        title: `Peak Flow in YELLOW Zone: ${pct}% of personal best`,
        detail: "Peak flow 50-80% personal best indicates need for cautious step-up. Asthma may be deteriorating.",
        evidence: "GINA 2023: Peak flow 50-80% = YELLOW zone. Early intervention can prevent exacerbations.",
        action: "Increase reliever SABA as needed. Double ICS dose as per action plan. Assess trigger exposure. Monitor closely.",
        icon: "⚠️" });
    }
  }

  if (latestPF && latestPF.zone && latestPF.zone === "green") {
    ret.push({ id: "pf_green", severity: "info", type: "Peak Flow", category: "Peak Flow", active: true, message: "Peak flow in GREEN zone",
      title: "Peak Flow in GREEN Zone: >=80% personal best",
      detail: "Peak flow is in the green zone, indicating good asthma control.",
      evidence: "GINA 2023: Green zone = >=80% personal best, well controlled",
      action: "Continue regular maintenance therapy. Review asthma action plan.",
      icon: "✅" });
  }

  if (latestPF && peakFlowData.length >= 7) {
    const last7 = peakFlowData.slice(-7);
    const values = last7.map(p => (p as any).percentPersonalBest).filter((v: any) => v !== undefined);
    if (values.length >= 4) {
      const max = Math.max(...values);
      const min = Math.min(...values);
      const variability = ((max - min) / ((max + min) / 2)) * 100;
      if (variability > 20) {
        ret.push({ id: "pf_variability", severity: "warning", type: "Peak Flow", category: "Peak Flow Variability", active: true, message: `High peak flow variability ${variability.toFixed(0)}%`,
          title: `High Peak Flow Variability: ${variability.toFixed(0)}% (target <20%)`,
          detail: "Increased peak flow variability (>20%) indicates unstable asthma.",
          evidence: "GINA 2023: Peak flow variability >20% indicates poor asthma control and increased exacerbation risk",
          action: "Review asthma control. Consider step-up. Evaluate triggers. Monitor daily peak flow regularly.",
          icon: "📊" });
      }
    }
  }

  if (exacerbations.length > 2) {
    ret.push({ id: "ocs_excess", severity: "urgent", type: "Exacerbation", category: "Exacerbation", active: true, message: `${exacerbations.length} exacerbation(s) in past year`,
      title: `>2 Exacerbations Requiring OCS in Past Year (${exacerbations.length} courses)`,
      detail: "Multiple courses of oral corticosteroids indicate poorly controlled severe asthma.",
      evidence: "GINA 2023: >=2 exacerbations requiring OCS/year = GINA step 5 consideration for add-on therapy",
      action: "Refer for specialist review. Consider biologic therapy. Assess adherence, triggers, inhaler technique.",
      icon: "💊" });
  }

  const edVisits = exacerbations.filter((e: any) => e.location === "ED" || e.location === "ICU").length;
  if (edVisits > 0) {
    ret.push({ id: "ed_visit", severity: "critical", type: "Exacerbation", category: "Exacerbation", active: true, message: `${edVisits} ED visit(s) in past year`,
      title: `${edVisits} ED Visit(s) for Asthma in Past Year`,
      detail: "Emergency department visits for asthma indicate recent severe exacerbation.",
      evidence: "GINA 2023: Prior exacerbation = strongest predictor of future exacerbation OR 2-3x",
      action: "Optimize maintenance therapy. Update written asthma action plan. Refer to asthma specialist.",
      icon: "🏥" });
  }

  const activeMeds2 = meds.filter(m => m.status === "current" || m.status === "active");
  const hasICS = activeMeds2.some(m => {
    const n = (m.name || m.drug || m.medication || "").toLowerCase();
    return n.includes("budesonide") || n.includes("fluticasone") || n.includes("beclomethasone") || n.includes("ciclesonide") || n.includes("mometasone");
  });
  const hasSABA = activeMeds2.some(m => {
    const n = (m.name || m.drug || m.medication || "").toLowerCase();
    return n.includes("salbutamol") || n.includes("albuterol") || n.includes("terbutaline");
  });

  if (hasSABA && !hasICS) {
    ret.push({ id: "saba_only", severity: "urgent", type: "saba_only", category: "Medication", active: true, message: "SABA-only therapy without ICS - inadequate asthma care",
      title: "SABA-only Therapy Without ICS - Inadequate Asthma Care",
      detail: "Patient using SABA reliever without ICS preventer. SABA-only therapy is associated with increased exacerbation risk and mortality.",
      evidence: "GINA 2019 revised recommendation: SABA-only is NO LONGER recommended for asthma. All patients need ICS-containing therapy.",
      action: "URGENT: Start ICS-containing therapy. Consider ICS-formoterol SMART. Educate patient on difference between preventer and reliever.",
      icon: "⚠️" });
  }

  if (!latestACT && !latestPF) {
    ret.push({ id: "no_monitoring", severity: "warning", type: "Monitoring Gap", category: "Monitoring Gap", active: true, message: "No asthma monitoring data recorded",
      title: "No Asthma Monitoring Data Recorded",
      detail: "No ACT scores or peak flow readings recorded.",
      evidence: "GINA 2023: Regular monitoring of asthma control is essential",
      action: "Provide peak flow meter. Teach patient to monitor peak flow daily. Complete ACT questionnaire at every visit.",
      icon: "📵" });
  }

  meds.filter(m => m.status === "current" || m.status === "active").forEach((med: any, mi: number) => {
    const name = med.name.toLowerCase();
    if (name.includes("theophylline")) {
      ret.push({ id: `theo_${mi}`, severity: "warning", type: "drug_monitoring", category: "Drug Monitoring", active: true, message: "Theophylline requires serum level monitoring",
        title: "Theophylline - Mandatory Serum Level Monitoring",
        detail: "Theophylline has a narrow therapeutic index 55-110 mcmol/L. Toxicity can cause seizures and arrhythmias.",
        evidence: "GINA 2023: Theophylline levels must be monitored every 3-6 months",
        action: "Order serum theophylline level. Target trough 55-110 mcmol/L. Assess for drug interactions.",
        icon: "🧪" });
    }
    if (name.includes("prednisolone") || name.includes("prednisone")) {
      ret.push({ id: `ocs_${mi}`, severity: "warning", type: "drug_monitoring", category: "OCS Monitoring", active: true, message: "Maintenance OCS requires monitoring for adverse effects",
        title: "Maintenance OCS - Monitor for Adverse Effects",
        detail: "Long-term OCS requires monitoring for osteoporosis, diabetes, cataracts, adrenal suppression.",
        evidence: "GINA 2023: Minimal OCS use is a key treatment goal",
        action: "Check FBC, fasting glucose, DXA scan. Consider PPI. Consider biologic referral.",
        icon: "🫀" });
    }
  });

  return ret;
}

export interface PatientSummary {
  id: string; name: string; age?: number; sex?: string; email?: string;
  phone?: string; universalId?: string; diagnosis?: string; riskLevel?: string;
  lastVisit?: string; nextReview?: string;
  latestPeakFlow?: number; latestACT?: number; latestAt?: Date;
  totalReadings?: number;
  [key: string]: any;
}
interface RawReading {
  id: string; patientId: string; toolType: string; recordedAt: Timestamp;
  doctorNote?: string; doctorReviewed?: boolean;
  data?: { peakFlow?: number; predicted?: number; percentPersonalBest?: number; zone?: string; symptoms?: string };
  peakFlow?: number; predicted?: number; percentPersonalBest?: number; zone?: string;
  triage?: { label?: string; urgency?: string; message?: string };
}
export interface PeakFlowReading {
  id?: string; value: number; predicted?: number; percentPersonalBest?: number;
  zone?: "green"|"yellow"|"red";
  recordedAt?: Date; source?: "patient"|"clinic";
  symptoms?: string; notes?: string;
  date?: string;
}
export interface ACTScore {
  id: string; total: number; components: [number,number,number,number,number];
  recordedAt: Date; category?: "well_controlled"|"not_well"|"very_poor";
  date?: string;
}
export interface SpirometryReading {
  id: string; fev1: number; fvc: number; ratio: number;
  fev1PercentPredicted: number; fvcPercentPredicted: number;
  recordedAt: Date; notes?: string;
  fev1Predicted?: number; fvcPredicted?: number; ratioPredicted?: number; fef2575?: number;
}
export interface Exacerbation {
  id: string; date: string; severity: "mild"|"moderate"|"severe"|"life-threatening";
  requiredOCS: boolean; requiredED: boolean; requiredHospitalization: boolean;
  trigger?: string; treatment?: string; peakFlowAtPresentation?: number;
  location?: string; action?: string;
}
export interface Medication {
  id: string;
  drug: string;
  medication?: string;
  dose: string;
  dosage?: string;
  unit: string; frequency: string; drugClass: string;
  status: "active"|"stopped"|"paused"|"current";
  startDate: string; endDate?: string;
  indication?: string; route?: string; instructions?: string;
  warnings?: string; refills?: number; duration?: string;
  notes?: string;
  name?: string;
  changeHistory?: DoseChange[];
  step?: string; category?: string; freq?: string; start?: string; changes?: {date?: string; from?: string; to?: string; reason?: string}[];
}
export interface DoseChange {
  date: string; changeType: "started"|"dose_increase"|"dose_decrease"|"stopped"|"paused"|"restarted";
  previousDose?: string; newDose?: string; changedBy: string; reason?: string;
}
interface MedForTimeline { id: string; drug: string; dose: string; startDate: Date; endDate?: Date; changeHistory?: DoseChange[]; }
export interface Alert { id?: string; severity?: string; category?: string; title?: string; detail?: string; evidence?: string; action?: string; icon?: string; active?: boolean; message?: string; type?: string; trigger?: string; actions?: string[]; createdAt?: string; doctorNote?: string; history?: { date: string; message: string }[]; }
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
  text?: string; author?: string;
}
export interface TimelineEvent { id: string; date: string; type: "visit"|"med"|"alert"|"reading"|"note"|"lab"; icon: string; title: string; detail?: string; color?: string; description?: string; }
export interface Message { id?: string; from: "doctor"|"patient"|"staff"; senderId?: string; senderName?: string; senderRole?: string; time?: string; text: string; read?: boolean; status?: string; threadId?: string; timestamp?: Date; date?: string; }
export interface AdherenceMap { [medId: string]: number | { [date: string]: boolean }; }
export interface ChartPoint {
  date: string; isoDate: string; value: number; predicted?: number;
  percentPersonalBest: number; zone: string; source: "patient"|"clinic";
}
export interface EducationTopic {
  id: string; title: string; content: string; keyPoints: string[];
  category: string; duration: string; sentAt?: string; acknowledged?: boolean;
  icon?: string;
}
export interface InhalerChecklistItem {
  id?: string; label: string; checked?: boolean; done?: boolean;
}

export const EDUCATION_TOPICS: EducationTopic[] = [
  { id: "asthma_basics", title: "Understanding Your Asthma", content: "Asthma is a chronic condition where the airways in your lungs become inflamed and narrow. It can be triggered by allergens, exercise, infections, and irritants. While there is no cure, asthma can be controlled with proper treatment.", keyPoints: ["Asthma = chronic airway inflammation + bronchoconstriction","Common triggers: allergens, cold air, exercise, smoke, stress","Well-controlled asthma: symptoms <=2x/week, no night waking, normal activity","Asthma medications: preventers ICS and relievers SABA","Action plans help you manage day-to-day and handle flare-ups"], category: "Foundation", duration: "5 min" },
  { id: "action_plan", title: "Your Asthma Action Plan - Green/Yellow/Red Zones", content: "An asthma action plan is a personalized guide that tells you what to do based on your peak flow. It has three zones: Green >=80% all clear take maintenance, Yellow 50-80% caution increase medications, Red <50% danger seek emergency care.", keyPoints: ["Green zone: doing well take your regular preventer","Yellow zone: asthma is flaring follow your plan increase treatment","Red zone: medical emergency take reliever + seek help NOW","Your personal best peak flow is the highest reading over 2 weeks when well","Keep your written plan visible fridge, phone, wallet"], category: "Management", duration: "6 min" },
  { id: "inhaler_technique", title: "Correct Inhaler Technique", content: "Using your inhaler correctly is the single most important factor in getting the right dose of medication. Up to 70% of patients use their inhaler incorrectly. Common mistakes include not shaking, not using a spacer, and poor breath-hold.", keyPoints: ["pMDI: shake, breathe out, seal lips, press + breathe in slowly 3-5 sec, hold 10 sec","Use a SPACER chamber with pMDI it doubles the medication reaching your lungs","DPI turbuhaler, diskus: load, breathe OUT, seal lips, INHALE forcefully and deeply","Rinse mouth after ICS prevents thrush","Get your technique checked every visit it changes over time"], category: "Management", duration: "7 min" },
  { id: "peak_flow_monitoring", title: "Peak Flow Monitoring - Track Your Asthma", content: "Peak flow is a simple measure of how well air moves out of your lungs. Regular monitoring helps you see changes in your asthma before symptoms develop.", keyPoints: ["Measure peak flow every morning before medication and evening if possible","Stand up, take a deep breath, seal lips around meter, BLAST out as hard and fast as you can","Record the best of 3 blows","Know your personal best the highest reading when your asthma is well controlled","Use your action plan based on your peak flow percentage"], category: "Monitoring", duration: "5 min" },
  { id: "trigger_avoidance", title: "Identifying and Avoiding Triggers", content: "Everyone with asthma has different triggers. Common triggers include allergens dust mites, pollen, pet dander, mold, infections, irritants, weather changes, exercise, and stress.", keyPoints: ["Allergen avoidance: encase mattresses, reduce clutter, HEPA filter, wash bedding hot","Pollen: close windows in season, shower after being outdoors","Cold air: wear a scarf over nose and mouth","Infections: annual flu vaccine, pneumococcal vaccine","Keep a symptom diary to identify your personal triggers"], category: "Lifestyle", duration: "6 min" },
  { id: "emergency_signs", title: "When to Seek Emergency Care", content: "Asthma attacks can be serious. Knowing the warning signs of a severe attack can save your life. Do not wait if your reliever is not working seek emergency care immediately.", keyPoints: ["Reliever blue inhaler is NOT helping or effects last <2 hours","Severe breathlessness cannot speak in full sentences","Peak flow <50% of personal best","Chest feels tight/heavy","Coughing that wont stop","Lips or fingernails turning blue cyanosis","Distressed gasping or exhausted","Call emergency services do NOT drive yourself"], category: "Safety", duration: "4 min" },
  { id: "reliever_vs_preventer", title: "Difference Between Reliever and Preventer Inhalers", content: "Reliever inhalers usually blue work fast to open your airways during an attack. Preventer inhalers usually brown/red/orange work slowly over time to reduce airway inflammation for long-term control.", keyPoints: ["Reliever SABA: when for when you have symptoms works in minutes","Preventer ICS: every day to prevent symptoms takes 1-4 weeks","Using reliever >2x/week = asthma is not controlled step up needed","GINA now recommends ICS-formoterol SMART as preferred treatment","Do NOT stop preventer when feeling well inflammation is still there"], category: "Foundation", duration: "5 min" },
  { id: "smart_therapy", title: "SMART/MART Therapy Explained", content: "SMART Single Maintenance And Reliever Therapy uses one inhaler for both daily control and symptom relief. This is now the PREFERRED approach for adults and adolescents per GINA 2023. It reduces exacerbations by 30-40%.", keyPoints: ["One inhaler does both jobs: maintenance + reliever","Formoterol LABA works as fast as salbutamol 1-3 min onset","Budesonide ICS gives continuous anti-inflammatory protection","Using more for relief automatically increases your ICS dose when needed","Max 8 puffs/day if you exceed this seek medical help"], category: "Medications", duration: "5 min" },
  { id: "allergen_avoidance", title: "Allergen Avoidance - Control Your Environment", content: "Allergen exposure triggers airway inflammation and can make your asthma harder to control. Reducing your exposure to allergens is an important part of asthma management.", keyPoints: ["House dust mites: allergen-proof mattress covers, wash bedding at 60C weekly","Pets: keep out of bedroom, wash pet weekly, HEPA filter","Mold: fix leaks, reduce humidity <50%, clean mold with bleach","Pollen: limit outdoor time during peak 5am-10am, shower after exposure","Cockroaches: seal food, use bait traps, keep home clean"], category: "Lifestyle", duration: "6 min" },
  { id: "exercise_asthma", title: "Exercise and Asthma - Stay Active Safely", content: "Exercise is good for everyone with asthma. Being fit actually reduces your asthma symptoms over time. Many Olympic athletes have asthma. The key is taking medications correctly.", keyPoints: ["Pre-medicate: SABA 10-15 min before exercise or formoterol if on SMART","Warm up for 5-15 min before intense activity","Breathe through your nose warms and filters air","Choose swimming warm humid excellent for asthma","Stop if you feel symptoms do NOT push through"], category: "Lifestyle", duration: "5 min" },
  { id: "smoking_cessation", title: "Smoking and Asthma - Quitting Is Essential", content: "Smoking is extremely harmful for people with asthma. It worsens airway inflammation, reduces medication effectiveness, increases exacerbation risk, and accelerates lung function decline.", keyPoints: ["Smoking directly worsens airway inflammation","Reduces effectiveness of inhaled steroids by up to 40%","Each cigarette causes bronchoconstriction for 30-60 minutes","Second-hand smoke is equally harmful make your home smoke-free","Quit now: NRT patches gum, varenicline Champix, or bupropion","Rates of asthma attacks drop significantly just 4 weeks after quitting"], category: "Lifestyle", duration: "5 min" },
  { id: "vaccination", title: "Influenza and Pneumococcal Vaccination", content: "People with asthma are at higher risk of complications from respiratory infections. Flu and pneumococcal infections are common triggers of asthma exacerbations. Annual flu vaccination is recommended.", keyPoints: ["Annual flu vaccine recommended for ALL asthma patients","Pneumococcal vaccine PCV13 + PPSV23 recommended for moderate-severe asthma","Vaccines are safe no evidence they trigger severe asthma exacerbations","Best time: autumn October-November for flu vaccine","Good hand hygiene reduces infection risk significantly"], category: "Prevention", duration: "4 min" },
  { id: "step_up_step_down", title: "Step-Up/Step-Down Treatment - GINA Guidelines", content: "Asthma treatment follows a stepwise approach GINA steps 1-5. The goal is to find the lowest treatment step that maintains good control. Step-up when control deteriorates. Step-down when well controlled for >=3 months.", keyPoints: ["Step 1: As-needed low-dose ICS-formoterol GINA preferred","Step 2: Low-dose ICS or LTRA","Step 3: Low-dose ICS/LABA preferred ICS-formoterol as SMART","Step 4: Medium-dose ICS/LABA","Step 5: High-dose + LAMA + consider biologic","Step down: reduce ICS dose by 25-50% every 2-3 months if stable","Never stop ICS completely risk of severe exacerbation"], category: "Medications", duration: "6 min" },
];

function normalizeMed(raw: Record<string, unknown>, id: string): Medication {
  const fmt = (ts: unknown) => ts instanceof Timestamp
    ? ts.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : String(ts ?? "");
  const drug = String(raw.medication ?? raw.drug ?? raw.name ?? "Unknown");
  const dosage = String(raw.dosage ?? raw.dose ?? raw.strength ?? "-");
  const doseMatch = dosage.match(/^([\d.]+)\s*([a-zA-Z]*)/);
  const doseNum = doseMatch ? doseMatch[1] : dosage;
  const doseUnit = doseMatch?.[2]?.toLowerCase() || (raw.unit as string) || "mg";
  const pharma = getDrugInfo(drug);
  const drugClass = String(raw.drugClass ?? raw.class ?? pharma?.drugClass ?? "-");
  const isActive = raw.active === true || raw.status === "active" || (!raw.endDate && raw.active !== false);
  return {
    id, drug, medication: drug, dose: doseNum, dosage: dosage,
    unit: doseUnit, frequency: String(raw.frequency ?? raw.freq ?? "OD"),
    drugClass, status: raw.endDate ? "stopped" : (isActive ? "active" : "stopped"),
    startDate: fmt(raw.startDate ?? raw.createdAt),
    endDate: raw.endDate ? fmt(raw.endDate) : undefined,
    indication: String(raw.indication ?? raw.indications ?? "Asthma"),
    route: String(raw.route ?? "Inhaled"),
    instructions: String(raw.instructions ?? ""),
    warnings: String(raw.warnings ?? ""),
    refills: Number(raw.refills ?? 0),
    duration: String(raw.duration ?? ""),
    notes: String(raw.notes ?? raw.doctorNote ?? ""),
    changeHistory: (raw.changeHistory as DoseChange[]) ?? [],
  };
}

function extractPeakFlow(raw: RawReading & Record<string, unknown>): PeakFlowReading | null {
  const d = raw.data as Record<string, number|string>|undefined;
  const val = (d?.peakFlow as number) ?? (raw.peakFlow as number);
  if (!val) return null;
  return {
    id: raw.id, value: val,
    predicted: (d?.predicted as number) ?? (raw.predicted as number),
    percentPersonalBest: (d?.percentPersonalBest as number) ?? (raw.percentPersonalBest as number),
    zone: (d?.zone as "green"|"yellow"|"red") ?? (raw.zone as "green"|"yellow"|"red"),
    recordedAt: raw.recordedAt instanceof Timestamp ? raw.recordedAt.toDate() : new Date(raw.recordedAt as string),
    source: "patient",
    symptoms: d?.symptoms as string, notes: raw.doctorNote,
  };
}

function averageByDay(readings: PeakFlowReading[]): ChartPoint[] {
  const g: Record<string, { val: number[]; pred: number[]; pct: number[]; zone: string; date: Date }> = {};
  readings.forEach(r => {
    if (!r.recordedAt && !r.date) return;
    const d = r.recordedAt || new Date(r.date || "");
    const k = d.toISOString().split("T")[0];
    if (!g[k]) g[k] = { val: [], pred: [], pct: [], zone: "", date: d };
    g[k].val.push(r.value);
    if (r.predicted) g[k].pred.push(r.predicted);
    if (r.percentPersonalBest !== undefined) g[k].pct.push(r.percentPersonalBest);
    if (r.zone) g[k].zone = r.zone;
  });
  return Object.entries(g).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => ({
    date: v.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    isoDate: k,
    value: Math.round(v.val.reduce((a,b) => a+b, 0)/v.val.length),
    predicted: v.pred.length ? Math.round(v.pred.reduce((a,b) => a+b, 0)/v.pred.length) : undefined,
    percentPersonalBest: v.pct.length ? Math.round(v.pct.reduce((a,b) => a+b, 0)/v.pct.length) : 100,
    zone: v.zone || "green",
    source: "patient",
  }));
}

function toMedTimeline(m: Medication): MedForTimeline {
  const p = (s: string) => { const d = new Date(s); return isNaN(d.getTime()) ? new Date() : d; };
  return { id: m.id, drug: m.drug, dose: `${m.dose}${m.unit}`, startDate: p(m.startDate), endDate: m.endDate ? p(m.endDate) : undefined, changeHistory: m.changeHistory };
}

function exportNoteAsPDF(note: ClinicalNote, patientName: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Clinical Note - ${patientName}</title>
    <style>
      body{font-family:"Segoe UI",Arial,sans-serif;padding:40px;color:#111;background:#fff;max-width:800px;margin:0 auto}
      .header{border-bottom:3px solid #0891b2;padding-bottom:16px;margin-bottom:24px}
      .logo{color:#0891b2;font-size:22px;font-weight:800}
      .sub{color:#6b7280;font-size:12px;margin-top:4px}
      .patient{background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;border-left:4px solid #0891b2}
      .section{margin-bottom:16px;page-break-inside:avoid}
      .section-title{color:#0891b2;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;border-bottom:0.5px solid #e5e7eb;padding-bottom:4px}
      .section-content{font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap}
      .footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between}
      .badge{display:inline-block;padding:2px 8px;border-radius:4px;background:#dbeafe;color:#0891b2;font-size:11px;font-weight:600;margin-left:8px}
      @media print{body{padding:20px}.no-print{display:none}}
    </style></head><body>
    <div class="header">
      <div class="logo">🌬️ AMEXAN Health System</div>
      <div class="sub">Asthma Control Center - Clinical Note</div>
    </div>
    <div class="patient">
      <strong>Patient:</strong> ${patientName} &nbsp;|&nbsp; <strong>Date:</strong> ${note.date} &nbsp;|&nbsp; <strong>Visit Type:</strong> ${note.visitType ?? "Clinic Visit"} &nbsp;|&nbsp; <strong>Doctor:</strong> ${note.doctorName ?? "AMEXAN"}<span class="badge">Asthma</span>
    </div>
    ${note.cc ? `<div class="section"><div class="section-title">Chief Complaint</div><div class="section-content">${note.cc}</div></div>` : ""}
    ${note.hpi ? `<div class="section"><div class="section-title">History of Present Illness (HPI)</div><div class="section-content">${note.hpi}</div></div>` : ""}
    ${note.exam ? `<div class="section"><div class="section-title">Examination Findings</div><div class="section-content">${note.exam}</div></div>` : ""}
    ${note.investigations ? `<div class="section"><div class="section-title">Investigations</div><div class="section-content">${note.investigations}</div></div>` : ""}
    ${note.assessment ? `<div class="section"><div class="section-title">Assessment / Diagnosis</div><div class="section-content">${note.assessment}</div></div>` : ""}
    ${note.plan ? `<div class="section"><div class="section-title">Management Plan</div><div class="section-content">${note.plan}</div></div>` : ""}
    ${note.followUps?.length ? `<div class="section"><div class="section-title">Follow-up Instructions</div><div class="section-content">${note.followUps.join("\n")}</div></div>` : ""}
    <div class="footer"><span>AMEXAN Health System · Asthma Monitoring</span><span>Generated: ${new Date().toLocaleString()}</span><span>Note ID: ${note.id ?? "-"}</span></div>
    </body></html>`);
  w.document.close();
}

const TRIGGER_ITEMS = ["Dust mites","Pollen (grass/tree)","Pet dander (cats/dogs)","Mold/dampness","Tobacco smoke","Cold air","Exercise","Strong odors/perfume","Household cleaning products","Air pollution","Stress/emotions","Respiratory infections","Certain foods (sulfites)","NSAIDs/aspirin sensitivity","GERD (acid reflux)","Weather changes"];
const SPECIALTIES = ["Respiratory Medicine / Pulmonology","Allergy & Immunology","ENT (Otorhinolaryngology)","Sleep Medicine","Exercise Physiology","Thoracic Surgery","Emergency Medicine","Pediatric Pulmonology","Cardiothoracic Surgery","Clinical Immunology (for biologics)"];
const URGENCIES: string[] = ["routine","urgent","emergency"];
const VISIT_TYPES = ["new_patient","follow_up","asthma_review","emergency","telemedicine","home_visit","discharge_review","spirometry_review"];
const LAB_PANEL = ["Complete Blood Count (CBC) with differential","Serum IgE (total)","Allergen-specific IgE panel","Eosinophil count","Vitamin D level","CRP / hs-CRP","Serum theophylline level (if applicable)","Pulmonary function tests (spirometry)","FeNO (Fractional Exhaled Nitric Oxide)","Arterial Blood Gas (if acute severe)","Blood glucose (if on OCS)","TSH (if concern for thyroid comorbidity)"];
const IMAGING_PANEL = ["Chest X-Ray (PA + Lateral)","CT Chest (High Resolution - HRCT)","CT Sinus (if chronic sinusitis)","Chest MRI (rarely indicated)","CT Pulmonary Angiography (if PE suspected)","Bronchoscopy (if atypical presentation)"];
const DRUGS = ["Salbutamol (Albuterol)","Beclomethasone","Budesonide","Fluticasone propionate","Budesonide/Formoterol (Symbicort)","Fluticasone/Salmeterol (Seretide/Advair)","Fluticasone furoate/Vilanterol (Relvar/Breo)","Salmeterol","Formoterol","Tiotropium (Spiriva Respimat)","Montelukast","Theophylline SR","Omalizumab (Xolair)","Mepolizumab (Nucala)","Benralizumab (Fasenra)","Dupilumab (Dupixent)","Prednisolone","Aminophylline"];
const FREQS = ["OD (Once daily)","BD (Twice daily)","TDS (Three times daily)","PRN (As needed)","Nocte (At bedtime)","Weekly","Every 2 weeks","Every 4 weeks","Every 8 weeks"];
const UNITS = ["mg","mcg","g","mL","mmol"];
const ROUTES_LIST = ["Inhaled (pMDI)","Inhaled (DPI)","Nebulized","Oral","IV","SC","IM"];

const GINA_STEPS = [
  { step: 1, label: "Step 1 - As-needed ICS-formoterol", icon: "🌱", color: "#059669", description: "As-needed low-dose ICS-formoterol SMART preferred GINA strategy" },
  { step: 2, label: "Step 2 - Low-dose ICS", icon: "🌿", color: "#10b981", description: "Low-dose ICS 200-400mcg budesonide or equivalent PRN SABA or low-dose ICS-formoterol as needed" },
  { step: 3, label: "Step 3 - Low-dose ICS/LABA", icon: "🌳", color: "#3b82f6", description: "Low-dose ICS-formoterol SMART preferred. Alternatives: low-dose ICS/LABA maintenance + PRN SABA" },
  { step: 4, label: "Step 4 - Medium-dose ICS/LABA", icon: "🌲", color: "#7c3aed", description: "Medium-dose ICS-formoterol SMART. Consider add-on therapy tiotropium" },
  { step: 5, label: "Step 5 - High-dose + Refer for biologic", icon: "🏔️", color: "#dc2626", description: "High-dose ICS/LABA + LAMA + OCS lowest possible + consider biologic therapy anti-IgE, anti-IL5, anti-IL4Ra" },
];

const T: Record<string, string> = {
  bg: "#f0fdfa", card: "#ffffff", border: "rgba(0,0,0,0.08)",
  text: "#111827", muted: "#6b7280", faint: "#9ca3af",
  danger: "#dc2626", info: "#2563eb", success: "#059669", warn: "#d97706", purple: "#7c3aed",
  teal: "#0891b2", orange: "#ea580c", pink: "#db2777",
};

const CHANGE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  started: { bg: "#f0fdf4", color: "#059669", label: "Started" },
  dose_increase: { bg: "#fff7ed", color: "#d97706", label: "↑ Dose Increased" },
  dose_decrease: { bg: "#eff6ff", color: "#2563eb", label: "↓ Dose Decreased" },
  stopped: { bg: "#fef2f2", color: "#dc2626", label: "Stopped" },
  paused: { bg: "#fefce8", color: "#ca8a04", label: "Paused" },
  restarted: { bg: "#f0fdfa", color: "#0891b2", label: "Restarted" },
};

const GLOBAL_CSS = `
  .asth-root*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  .asth-root{font-family:"DM Sans","Plus Jakarta Sans","Segoe UI",system-ui,sans-serif}
  @keyframes asth-pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes asth-fade-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .asth-fade{animation:asth-fade-in 0.18s ease}
  .asth-scroll{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.12) transparent}
  .asth-scroll::-webkit-scrollbar{width:4px;height:4px}
  .asth-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}
  .asth-btn-press{transition:transform 0.1s,opacity 0.1s}
  .asth-btn-press:active{transform:scale(0.97);opacity:0.85}

  @media(max-width:640px){
    .asth-wa-track{display:none!important}
    .asth-desktop-layout{display:none!important}
    .asth-page-header{display:none!important}
    .asth-root{position:fixed!important;inset:0!important;overflow:hidden!important;padding:0!important;display:flex!important;flex-direction:column!important}
    .asth-mobile-list{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow-y:auto!important;background:#fff!important}
    .asth-mobile-list.hidden{display:none!important}
    .asth-mobile-detail{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#f0fdfa!important}
    .asth-mobile-detail.hidden{display:none!important}
    .asth-list-topbar{position:sticky!important;top:0!important;z-index:20!important;background:#0891b2!important;color:#fff!important;padding:14px 16px 10px!important;min-height:56px!important;flex-shrink:0!important}
    .asth-list-topbar h2{color:#fff!important;font-size:17px!important;margin:0!important;font-weight:800}
    .asth-list-topbar p{color:rgba(255,255,255,.75)!important;font-size:11px!important;margin:2px 0 0!important}
    .asth-list-search{padding:8px 12px!important;background:#f0fdfa!important;position:sticky!important;top:56px!important;z-index:9!important;border-bottom:0.5px solid rgba(0,0,0,.07)!important;flex-shrink:0!important}
    .asth-list-search input{width:100%!important;border-radius:20px!important;padding:8px 14px!important;border:none!important;background:#ececec!important;font-size:14px!important;outline:none!important;font-family:inherit!important}
    .asth-patient-btn{width:100%!important;display:flex!important;align-items:center!important;gap:12px!important;padding:12px 16px!important;border:none!important;border-bottom:.5px solid rgba(0,0,0,.07)!important;background:#fff!important;cursor:pointer!important;text-align:left!important;min-height:64px!important}
    .asth-patient-btn:active,.asth-patient-btn.active-row{background:#f0fdfa!important}
    .asth-patient-avatar{width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(8,145,178,.12)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:19px!important;font-weight:800!important;color:#0891b2!important;flex-shrink:0!important}
    .asth-patient-row-info{flex:1!important;min-width:0!important}
    .asth-patient-row-name{font-weight:600;font-size:14px;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .asth-patient-row-sub{font-size:11px;color:#9ca3af;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .asth-detail-topbar{position:sticky!important;top:0!important;z-index:20!important;background:#0891b2!important;padding:10px 14px!important;display:flex!important;align-items:center!important;gap:10px!important;min-height:56px!important;flex-shrink:0!important}
    .asth-back-btn{background:none!important;border:none!important;color:#fff!important;font-size:28px!important;cursor:pointer!important;padding:0 8px 0 0!important;flex-shrink:0!important;line-height:1!important}
    .asth-detail-topbar-avatar{width:36px!important;height:36px!important;border-radius:50%!important;background:rgba(255,255,255,.25)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:800!important;font-size:16px!important;flex-shrink:0!important;color:#fff!important}
    .asth-detail-topbar-info{flex:1!important;min-width:0!important;overflow:hidden!important}
    .asth-detail-topbar-name{font-weight:700;font-size:15px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .asth-detail-topbar-sub{font-size:11px;color:rgba(255,255,255,.8)}
    .asth-detail-content{flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;padding:10px 10px 100px!important;-webkit-overflow-scrolling:touch!important;width:100%!important}
    .asth-stat-row{gap:5px!important;flex-wrap:wrap!important}
    .asth-stat-card{min-width:65px!important;padding:7px 7px!important;flex:1!important}
    .asth-stat-card .sv{font-size:14px!important}
    .asth-tabs-wrap{position:sticky!important;top:56px!important;z-index:15!important;background:#fff!important;border-bottom:.5px solid rgba(0,0,0,.08)!important;flex-shrink:0!important;width:100%!important}
    .asth-tabs{display:flex!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;flex-wrap:nowrap!important;padding:4px 8px!important;gap:2px!important;background:#fff!important;border-radius:0!important;border:none!important;margin-bottom:0!important;width:100%!important}
    .asth-tabs::-webkit-scrollbar{display:none!important}
    .asth-tab-btn{font-size:10px!important;padding:5px 8px!important;white-space:nowrap!important;min-height:32px!important}
    .asth-panel{padding:12px!important;border-radius:10px!important;overflow-x:hidden!important}
    .asth-inline-grid{grid-template-columns:1fr 1fr!important}
    .asth-note-grid{grid-template-columns:1fr!important}
    .asth-labs-grid{grid-template-columns:1fr!important}
    .asth-ref-grid{grid-template-columns:1fr!important}
    .asth-adh-box{width:22px!important;height:22px!important;font-size:9px!important}
    .asth-detail-content *{max-width:100%!important}
    table{display:block!important;overflow-x:auto!important;width:100%!important}
  }
  @media(min-width:641px) and (max-width:1023px){
    .asth-wa-track{display:none!important}
    .asth-mobile-list,.asth-mobile-detail{display:none!important}
    .asth-desktop-layout{display:flex!important}
    .asth-patient-list{width:240px!important;flex-shrink:0!important}
    .asth-tabs{flex-wrap:wrap!important}
    .asth-tab-btn{font-size:11px!important}
    .asth-note-grid{grid-template-columns:1fr 1fr!important}
    .asth-labs-grid{grid-template-columns:1fr 1fr!important}
    .asth-ref-grid{grid-template-columns:1fr 1fr!important}
    .asth-inline-grid{grid-template-columns:1fr 1fr 1fr!important}
  }
  @media(min-width:1024px){
    .asth-wa-track{display:none!important}
    .asth-mobile-list,.asth-mobile-detail{display:none!important}
    .asth-desktop-layout{display:flex!important}
    .asth-patient-list{width:290px!important;flex-shrink:0!important}
    .asth-note-grid{grid-template-columns:1fr 1fr!important}
    .asth-labs-grid{grid-template-columns:1fr 1fr!important}
    .asth-ref-grid{grid-template-columns:1fr 1fr!important}
    .asth-inline-grid{grid-template-columns:1fr 1fr 1fr!important}
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
  return <span style={{ padding: "2px 7px", borderRadius: 5, background: bg, color, border: `0.5px solid ${border}`, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>;
}
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="asth-stat-card" style={{ background: T.bg, border: `0.5px solid ${T.border}`, borderTop: `2px solid ${color ?? T.border}`, borderRadius: 10, padding: "10px 13px", flex: 1, minWidth: 90 }}>
      <div style={{ color: T.faint, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div className="sv" style={{ color: color ?? T.text, fontSize: 18, fontWeight: 800, lineHeight: 1.1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ color: T.faint, fontSize: 10 }}>{sub}</div>}
    </div>
  );
}
function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={`asth-panel asth-fade${className ? ` ${className}` : ""}`} style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", ...style }}>{children}</div>;
}
function Skeleton({ height = 200 }: { height?: number }) {
  return <div style={{ height, background: T.bg, borderRadius: 10, border: `0.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.faint, fontSize: 13 }}><span style={{ animation: "asth-pulse 1.4s ease-in-out infinite" }}>Loading...</span></div>;
}
function Btn({ label, variant = "default", onClick, fullWidth, small, icon, disabled }: {
  label: string; variant?: "default"|"primary"|"success"|"warn"|"danger"|"info";
  onClick?: () => void; fullWidth?: boolean; small?: boolean; icon?: string; disabled?: boolean;
}) {
  const s: Record<string, React.CSSProperties> = {
    default: { background: "transparent", color: T.muted, border: `0.5px solid ${T.border}` },
    primary: { background: T.teal, color: "#fff", border: `1px solid ${T.teal}` },
    success: { background: T.success, color: "#fff", border: `1px solid ${T.success}` },
    warn:    { background: "#fff7ed", color: T.warn, border: `0.5px solid ${T.warn}` },
    danger:  { background: "#fef2f2", color: T.danger, border: `0.5px solid ${T.danger}` },
    info:    { background: "#eff6ff", color: T.info, border: `0.5px solid ${T.info}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} className="asth-btn-press" style={{
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
function PeakFlowIndicator({ value, zones }: { value: number; zones: { green: number; yellow: number } }) {
  const pct = (value / zones.green) * 100;
  let zone: string, zoneColor: string;
  if (pct >= 80) { zone = "Green"; zoneColor = T.success; }
  else if (pct >= 60) { zone = "Yellow"; zoneColor = T.warn; }
  else { zone = "Red"; zoneColor = T.danger; }
  const fillPct = Math.min(pct, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: T.bg, borderRadius: 4, overflow: "hidden", border: `0.5px solid ${T.border}` }}>
        <div style={{ width: `${fillPct}%`, height: "100%", background: zoneColor, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: zoneColor }}>{zone}</span>
    </div>
  );
}

function InhalerTechniquePanel({ data }: { data: InhalerChecklistItem[] }) {
  const [items, setItems] = useState<InhalerChecklistItem[]>(data || []);
  const checkCount = items.filter(i => i.done).length;
  const total = items.length;
  return (
    <Card>
      <SectHeader label="Inhaler Technique" color={T.success} sub={`${checkCount}/${total} steps`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, idx) => (
          <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: item.done ? T.muted : T.text, textDecoration: item.done ? "line-through" : "none" }}>
            <input type="checkbox" checked={item.done} onChange={() => {
              const next = [...items];
              next[idx] = { ...next[idx], done: !next[idx].done };
              setItems(next);
            }} style={{ accentColor: T.success }} />
            {item.label}
          </label>
        ))}
      </div>
    </Card>
  );
}

function ExacerbationHistoryPanel({ data }: { data: Exacerbation[] }) {
  const items = data || [];
  const recent = items.filter(e => new Date(e.date).getTime() > Date.now() - 365 * 86400000).length;
  return (
    <Card>
      <SectHeader label="Exacerbations" color={T.danger} sub={`${recent} in 12mo`} />
      {items.length === 0 ? <div style={{ color: T.faint, fontSize: 12, padding: "10px 0" }}>No exacerbation history</div> : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead><tr style={{ color: T.faint, fontSize: 9, textTransform: "uppercase" }}><th style={{ textAlign: "left", padding: "4px 0" }}>Date</th><th style={{ textAlign: "left", padding: "4px 0" }}>Severity</th><th style={{ textAlign: "left", padding: "4px 0" }}>Location</th><th style={{ textAlign: "left", padding: "4px 0" }}>Action</th></tr></thead>
          <tbody>{items.map((e, i) => (
            <tr key={i} style={{ borderTop: `0.5px solid ${T.border}` }}>
              <td style={{ padding: "4px 0", fontWeight: 500 }}>{new Date(e.date).toLocaleDateString()}</td>
              <td style={{ padding: "4px 0" }}><Badge text={e.severity} color={e.severity === "severe" ? T.danger : e.severity === "moderate" ? T.warn : T.success} bg={e.severity === "severe" ? "#fef2f2" : e.severity === "moderate" ? "#fff7ed" : "#f0fdf4"} border={"transparent"} /></td>
              <td style={{ padding: "4px 0" }}>{e.location || "-"}</td>
              <td style={{ padding: "4px 0" }}>{e.action || "-"}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </Card>
  );
}

function SpirometryPanel({ data }: { data: SpirometryReading[] }) {
  const items = data || [];
  const latest = items[items.length - 1];
  return (
    <Card>
      <SectHeader label="Spirometry" color={T.purple} />
      {latest ? (
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <StatCard label="FEV1" value={`${latest.fev1?.toFixed(1) || "-"} L`} sub={latest.fev1Predicted ? `${((latest.fev1/latest.fev1Predicted)*100).toFixed(0)}% predicted` : undefined} color={T.purple} />
          <StatCard label="FVC" value={`${latest.fvc?.toFixed(1) || "-"} L`} sub={latest.fvcPredicted ? `${((latest.fvc/latest.fvcPredicted)*100).toFixed(0)}% predicted` : undefined} color={T.info} />
          <StatCard label="FEV1/FVC" value={latest.fev1 && latest.fvc ? `${((latest.fev1/latest.fvc)*100).toFixed(0)}%` : "-"} sub={latest.ratioPredicted ? `${((latest.fev1/latest.fvc/latest.ratioPredicted)*100).toFixed(0)}% predicted` : undefined} color={latest.fev1 && latest.fvc && (latest.fev1/latest.fvc) < 0.7 ? T.danger : T.success} />
          <StatCard label="FEF25-75" value={latest.fef2575 ? `${latest.fef2575.toFixed(1)} L/s` : "-"} color={T.teal} />
        </div>
      ) : <div style={{ color: T.faint, fontSize: 12, padding: "10px 0" }}>No spirometry data</div>}
      {items.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Btn label="View Trend" variant="info" small />
          <Btn label="% Change" variant="default" small />
        </div>
      )}
    </Card>
  );
}

function AllergenTriggerPanel({ data }: { data: string[] }) {
  const triggers = data && data.length ? data : [];
  return (
    <Card>
      <SectHeader label="Triggers & Allergens" color={T.orange} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {triggers.length === 0 ? <span style={{ color: T.faint, fontSize: 12 }}>None identified</span> :
          triggers.map((t, i) => (
            <Badge key={i} text={t} color={T.orange} bg="#fff7ed" border={T.orange} />
          ))}
      </div>
    </Card>
  );
}

function AdherencePanel({ data, meds }: { data: AdherenceMap; meds: Medication[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayMeds = showAll ? meds : meds.slice(0, 5);
  return (
    <Card>
      <SectHeader label="Medication Adherence" color={T.teal} sub={meds.length > 5 ? `${meds.length} medications` : undefined} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {displayMeds.map((m, i) => {
          const adh = (data as any)?.[m.name || m.drug || m.medication || ""];
          const pct = adh != null ? Math.round(Number(adh) * 100) : 0;
          let barColor = T.success;
          if (pct < 50) barColor = T.danger;
          else if (pct < 75) barColor = T.warn;
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ fontWeight: 600, color: T.text }}>{m.name || m.drug || m.medication || ""}</span>
                <span style={{ color: barColor, fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: T.bg, borderRadius: 3, overflow: "hidden", border: `0.5px solid ${T.border}` }}>
                <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 3, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </div>
      {meds.length > 5 && (
        <Btn label={showAll ? "Show Less" : `Show All (${meds.length})`} variant="default" small onClick={() => setShowAll(!showAll)} />
      )}
    </Card>
  );
}

function AlertsPanel({ data, onDismiss }: { data: Alert[]; onDismiss?: (id: string) => void }) {
  const alerts = data || [];
  const active = alerts.filter(a => a.active);
  return (
    <Card>
      <SectHeader label="Clinical Alerts" color={T.danger} sub={`${active.length} active`} />
      {active.length === 0 ? <div style={{ color: T.faint, fontSize: 12, padding: "10px 0" }}>No active alerts</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {active.map((a, i) => (
            <div key={a.id || i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: a.severity === "critical" ? "#fef2f2" : a.severity === "warning" ? "#fff7ed" : "#eff6ff", borderRadius: 8, padding: "8px 10px", border: `0.5px solid ${a.severity === "critical" ? T.danger : a.severity === "warning" ? T.warn : T.info}` }}>
              <div style={{ flex: 1, fontSize: 12, color: T.text, lineHeight: 1.4 }}>{a.message}</div>
              {onDismiss && a.id && <button onClick={() => onDismiss(a.id!)} style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontSize: 14 }}>✕</button>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function EducationPanel({ onSelect }: { onSelect?: (topic: EducationTopic) => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <Card>
      <SectHeader label="Asthma Education" color={T.success} sub={`${EDUCATION_TOPICS.length} topics`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {EDUCATION_TOPICS.map((t, i) => (
          <div key={i}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 0", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 12, color: T.text, borderBottom: `0.5px solid ${T.border}` }}>
              <span>{t.icon}</span>
              <span style={{ flex: 1, fontWeight: 600 }}>{t.title}</span>
              <span style={{ color: T.faint, fontSize: 10 }}>{openIdx === i ? "−" : "+"}</span>
            </button>
            {openIdx === i && (
              <div style={{ padding: "6px 0 6px 28px", fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 6px" }}>{t.content}</p>
                {t.keyPoints && (
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {t.keyPoints.map((kp, j) => <li key={j} style={{ marginBottom: 2 }}>{kp}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function NotesPanel({ data, onSave }: { data: ClinicalNote[]; onSave?: (note: ClinicalNote) => void }) {
  const [text, setText] = useState("");
  const items = data || [];
  const handleSave = () => {
    if (!text.trim()) return;
    const note: ClinicalNote = { id: `n${Date.now()}`, date: new Date().toISOString(), text: text.trim(), author: "Clinician" };
    onSave?.(note);
    setText("");
  };
  return (
    <Card>
      <SectHeader label="Clinical Notes" color={T.info} sub={`${items.length} notes`} />
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <TextArea value={text} onChange={setText} placeholder="Write a note..." rows={2} />
        <Btn label="Save" variant="primary" onClick={handleSave} small disabled={!text.trim()} />
      </div>
      {items.slice(0, 10).map((n, i) => (
        <div key={n.id || i} style={{ padding: "6px 0", borderBottom: `0.5px solid ${T.border}`, fontSize: 11, lineHeight: 1.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: T.faint, fontSize: 9, marginBottom: 2 }}>
            <span>{n.author || "Clinician"}</span>
            <span>{n.date ? new Date(n.date).toLocaleDateString() : ""}</span>
          </div>
          <div style={{ color: T.text }}>{n.text}</div>
        </div>
      ))}
    </Card>
  );
}

function TimelinePanel({ data }: { data: TimelineEvent[] }) {
  const items = data || [];
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <Card>
      <SectHeader label="Timeline" color={T.teal} sub={`${items.length} events`} />
      <div style={{ position: "relative", paddingLeft: 16 }}>
        <div style={{ position: "absolute", left: 5, top: 0, bottom: 0, width: 1.5, background: T.border, borderRadius: 1 }} />
        {sorted.slice(0, 15).map((ev, i) => (
          <div key={i} style={{ position: "relative", padding: "0 0 12px 14px", borderLeft: "none" }}>
            <div style={{ position: "absolute", left: -8, top: 4, width: 8, height: 8, borderRadius: "50%", background: ev.color || T.success, border: `2px solid ${T.card}` }} />
            <div style={{ fontSize: 9, color: T.faint, marginBottom: 2 }}>{new Date(ev.date).toLocaleString()}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{ev.title}</div>
            {ev.description && <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{ev.description}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function MessagingPanel({ data, onSend }: { data: Message[]; onSend?: (msg: Message) => void }) {
  const [text, setText] = useState("");
  const items = data || [];
  const handleSend = () => {
    if (!text.trim()) return;
    const msg: Message = { id: `m${Date.now()}`, date: new Date().toISOString(), text: text.trim(), from: "staff", read: false };
    onSend?.(msg);
    setText("");
  };
  return (
    <Card>
      <SectHeader label="Secure Messaging" color={T.info} sub={`${items.filter(m => !m.read).length} unread`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10, maxHeight: 240, overflowY: "auto" }} className="asth-scroll">
        {items.slice(0, 20).map((m, i) => (
          <div key={m.id || i} style={{ padding: "6px 8px", borderRadius: 8, background: m.from === "staff" ? "#eff6ff" : T.bg, border: `0.5px solid ${T.border}`, fontSize: 11, lineHeight: 1.4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: T.faint, fontSize: 9, marginBottom: 2 }}>
              <span>{m.from === "staff" ? "You" : "Patient"}</span>
              <span>{new Date(m.date || m.time || "").toLocaleDateString()}</span>
            </div>
            <div style={{ color: T.text }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
        <Btn label="Send" variant="primary" onClick={handleSend} small disabled={!text.trim()} />
      </div>
    </Card>
  );
}

function ReferralsPanel({ data }: { data: { to: string; date: string; status: string; reason: string }[] }) {
  const items = data || [];
  return (
    <Card>
      <SectHeader label="Referrals" color={T.purple} sub={`${items.length} referrals`} />
      {items.length === 0 ? <div style={{ color: T.faint, fontSize: 12, padding: "10px 0" }}>No referrals</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: T.bg, borderRadius: 8, fontSize: 11 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: T.text }}>{r.to}</div>
                <div style={{ color: T.faint, fontSize: 9 }}>{r.reason} · {new Date(r.date).toLocaleDateString()}</div>
              </div>
              <Badge text={r.status} color={r.status === "Completed" ? T.success : r.status === "Pending" ? T.warn : T.info} bg={r.status === "Completed" ? "#f0fdf4" : r.status === "Pending" ? "#fff7ed" : "#eff6ff"} border={"transparent"} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PeakFlowChart({ data, zones }: { data: PeakFlowReading[]; zones: { green: number; yellow: number } }) {
  if (!data.length) return <div style={{ color: T.faint, fontSize: 12, padding: "10px 0" }}>No data</div>;
  const maxPEF = Math.max(...data.map(r => r.value), zones.green) * 1.2;
  const barH = 120;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: barH + 20, padding: "10px 0", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: barH * (1 - 0.6) + 10, height: 1, borderTop: `1px dashed ${T.warn}40`, zIndex: 0 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 10, height: 1, borderTop: `1px dashed ${T.success}40`, zIndex: 0 }} />
      {data.map((r, i) => {
        const h = (r.value / maxPEF) * barH;
        const color = r.zone === "green" ? T.success : r.zone === "yellow" ? T.warn : T.danger;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 1 }}>
            <div style={{ width: "100%", maxWidth: 24, height: Math.max(h, 4), background: color, borderRadius: "3px 3px 0 0", minHeight: 4, transition: "height 0.3s" }} />
            <span style={{ fontSize: 7, color: T.faint, transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>{(r.date || "").slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

function MedicationTimelinePanel({ data }: { data: Medication[] }) {
  const items = data || [];
  const ginaStep = items.length > 0 ? Math.max(...items.map(m => Number(m.step) || 0)) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.length === 0 ? <div style={{ color: T.faint, fontSize: 12 }}>No medications</div> :
        items.map((m, i) => {
          const drugKey = m.name || m.drug || "";
          const info = getDrugInfo(drugKey);
          const catColors: Record<string, string> = { "SABA": T.success, "ICS": T.teal, "ICS/LABA": T.success, "LAMA": T.info, "LTRA": T.teal, "Biologic": T.purple, "OCS": T.danger, "Methylxanthine": T.warn };
          const catColor = catColors[m.category || ""] || T.muted;
          return (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", background: T.bg, borderRadius: 10, border: `0.5px solid ${T.border}`, borderLeft: `3px solid ${catColor}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{m.name}</span>
                  <Badge text={m.category || ""} color={catColor} bg={catColor+"18"} border={"transparent"} />
                  {m.step ? <Badge text={`GINA ${m.step}`} color={T.purple} bg={T.purple+"18"} border={"transparent"} /> : null}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{m.dose} · {m.freq}</div>
                <div style={{ fontSize: 10, color: T.faint, marginTop: 1 }}>Started {m.start} · {m.status}</div>
                {m.changes && m.changes.length > 0 && (
                  <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                    {m.changes.map((c, j) => (
                      <div key={j} style={{ fontSize: 10, color: T.warn, background: "#fff7ed", padding: "2px 6px", borderRadius: 4 }}>
                        {c.date}: {c.from} → {c.to} ({c.reason})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {info && <div style={{ fontSize: 9, color: T.faint, maxWidth: 120, textAlign: "right" }}>
                <div>{info.drugClass}</div>
              </div>}
            </div>
          );
        })}
      {ginaStep > 0 && (
        <div style={{ fontSize: 10, color: T.muted, textAlign: "right", marginTop: 4 }}>
          Current GINA Step: {ginaStep} · {GINA_STEPS[ginaStep-1]?.label.split("-")[1]?.trim() || ""}
        </div>
      )}
    </div>
  );
}

const DEMO_PATIENTS: PatientSummary[] = [
  { id: "p1", name: "Emily Harper", age: 34, dx: "Persistent Moderate Asthma", lastVisit: "2025-11-10", actScore: 18, peakFlow: 350, exacerbations12m: 2, ginaStep: 3, phone: "(555) 234-5678", email: "emily.h@email.com", avatar: "EH" },
  { id: "p2", name: "James Chen", age: 28, dx: "Mild Intermittent Asthma", lastVisit: "2025-12-01", actScore: 22, peakFlow: 420, exacerbations12m: 0, ginaStep: 1, phone: "(555) 345-6789", email: "james.c@email.com", avatar: "JC" },
  { id: "p3", name: "Sophia Martinez", age: 9, dx: "Persistent Mild Asthma", lastVisit: "2025-10-22", actScore: 16, peakFlow: 180, exacerbations12m: 3, ginaStep: 2, phone: "(555) 456-7890", email: "parent.s@email.com", avatar: "SM" },
  { id: "p4", name: "Robert Kim", age: 52, dx: "Severe Persistent Asthma", lastVisit: "2025-11-28", actScore: 12, peakFlow: 230, exacerbations12m: 5, ginaStep: 5, phone: "(555) 567-8901", email: "robert.k@email.com", avatar: "RK" },
  { id: "p5", name: "Aisha Patel", age: 41, dx: "Persistent Moderate Asthma", lastVisit: "2025-12-05", actScore: 20, peakFlow: 310, exacerbations12m: 1, ginaStep: 3, phone: "(555) 678-9012", email: "aisha.p@email.com", avatar: "AP" },
  { id: "p6", name: "William Torres", age: 67, dx: "COPD-Asthma Overlap", lastVisit: "2025-09-15", actScore: 14, peakFlow: 190, exacerbations12m: 4, ginaStep: 4, phone: "(555) 789-0123", email: "will.t@email.com", avatar: "WT" },
  { id: "p7", name: "Olivia Brown", age: 22, dx: "Mild Intermittent Asthma", lastVisit: "2025-11-20", actScore: 24, peakFlow: 380, exacerbations12m: 0, ginaStep: 1, phone: "(555) 890-1234", email: "olivia.b@email.com", avatar: "OB" },
  { id: "p8", name: "Daniel Wilson", age: 45, dx: "Persistent Severe Asthma", lastVisit: "2025-12-10", actScore: 10, peakFlow: 200, exacerbations12m: 6, ginaStep: 5, phone: "(555) 901-2345", email: "dan.w@email.com", avatar: "DW" },
];

function PatientPicker({ patients, selectedId, onSelect, onSearch, search }: {
  patients: PatientSummary[]; selectedId?: string; onSelect: (id: string) => void;
  onSearch: (v: string) => void; search: string;
}) {
  return (
    <div className="asth-patient-list" style={{ borderRight: `0.5px solid ${T.border}`, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 14px 8px", background: "#0891b2", color: "#fff" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Asthma Patients</h2>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,.7)", margin: "1px 0 0" }}>{patients.length} active</p>
      </div>
      <div style={{ padding: "6px 12px", background: "#f0fdfa" }}>
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search patients..." style={{ width: "100%", borderRadius: 20, padding: "7px 12px", border: "none", background: "#ececec", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }} className="asth-scroll">
        {patients.map(p => (
          <button key={p.id} onClick={() => onSelect(p.id)} className="asth-patient-btn active-row"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", borderBottom: `0.5px solid ${T.border}`, background: selectedId === p.id ? "#f0fdfa" : "#fff", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: selectedId === p.id ? "#0891b2" : "rgba(8,145,178,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: selectedId === p.id ? "#fff" : "#0891b2", flexShrink: 0 }}>{p.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{p.dx} · GINA {p.ginaStep}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: p.actScore && p.actScore <= 15 ? T.danger : p.actScore && p.actScore <= 19 ? T.warn : T.success }}>{p.actScore || "-"}</div>
              <div style={{ fontSize: 8, color: T.faint }}>ACT</div>
            </div>
          </button>
        ))}
        {patients.length === 0 && <div style={{ padding: 20, textAlign: "center", color: T.faint, fontSize: 12 }}>No patients found</div>}
      </div>
    </div>
  );
}

function AsthmaDashboard() {
  const [patients, setPatients] = useState<PatientSummary[]>(DEMO_PATIENTS);
  const [selectedId, setSelectedId] = useState<string>("p1");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("pef");
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [peakFlowData, setPeakFlowData] = useState<any[]>([]);
  const [actData, setActData] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [exacerbations, setExacerbations] = useState<any[]>([]);
  const [spirometry, setSpirometry] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [inhalerTechnique, setInhalerTechnique] = useState<InhalerChecklistItem[]>([]);
  const [referrals, setReferrals] = useState<{ to: string; date: string; status: string; reason: string }[]>([]);
  const [adherence, setAdherence] = useState<any>({});
  const [triggers, setTriggers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfExporting, setPdfExporting] = useState(false);

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const selected = patients.find(p => p.id === selectedId);

  useEffect(() => {
    const styleId = "asth-global-css";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
    return () => { const s = document.getElementById(styleId); if (s) s.remove(); };
  }, []);

  useEffect(() => {
    setLoading(true);
    setPeakFlowData([]); setActData([]); setMeds([]);
    setExacerbations([]); setSpirometry([]); setNotes([]);
    setMessages([]); setTimeline([]); setAlerts([]);
    setInhalerTechnique([]); setReferrals([]); setAdherence({});
    setTriggers([]);
    const timer = setTimeout(() => {
      if (selectedId === "p1") {
        setPeakFlowData([{ date: "2025-12-01", value: 350, predicted: 420, zone: "yellow" },{ date: "2025-12-02", value: 380, predicted: 420, zone: "yellow" },{ date: "2025-12-03", value: 410, predicted: 420, zone: "green" },{ date: "2025-12-04", value: 390, predicted: 420, zone: "yellow" },{ date: "2025-12-05", value: 370, predicted: 420, zone: "yellow" },{ date: "2025-12-06", value: 340, predicted: 420, zone: "red" },{ date: "2025-12-07", value: 360, predicted: 420, zone: "yellow" }]);
        setActData([{ date: "2025-10-01", score: 16 },{ date: "2025-11-01", score: 18 },{ date: "2025-12-01", score: 19 }]);
        setMeds([{ name: "Albuterol HFA", dose: "90mcg", freq: "2 puffs q4-6h PRN", step: 1, start: "2023-01-15", status: "current", category: "SABA", changes: [{ from: "1 puff PRN", to: "2 puffs q4-6h", date: "2024-06-01", reason: "Increased symptoms" }] },{ name: "Symbicort SMART", dose: "160/4.5mcg", freq: "1 puff BID + PRN", step: 3, start: "2024-06-01", status: "current", category: "ICS/LABA" },{ name: "Montelukast", dose: "10mg", freq: "1 tab qHS", step: 2, start: "2024-01-10", status: "current", category: "LTRA" }]);
        setExacerbations([{ date: "2025-08-15", severity: "Moderate", location: "ED", action: "Prednisone 40mg x5d" },{ date: "2025-05-20", severity: "Mild", location: "Home", action: "Increased SABA" }]);
        setSpirometry([{ date: "2025-11-10", fev1: 2.4, fvc: 3.2, fev1Predicted: 3.0, fvcPredicted: 3.8 },{ date: "2025-08-10", fev1: 2.1, fvc: 3.0, fev1Predicted: 3.0, fvcPredicted: 3.8 }]);
        setNotes([{ id:"n1", date:"2025-11-10", text:"Patient reports improved symptom control. ACT up from 16 to 19. Continue current regimen.", author:"Dr. Smith" },{ id:"n2", date:"2025-08-15", text:"ED visit for asthma exacerbation triggered by pollen. Prescribed prednisone burst. Discussed trigger avoidance.", author:"Dr. Smith" }]);
        setMessages([{ id:"m1", date:"2025-12-05", text:"My peak flow has been lower this week. Should I increase my inhaler?", from:"patient", read:false }]);
        setTimeline([{ date:"2025-11-10", title:"Routine follow-up", description:"ACT 19, PEF 350, stable", color:T.success },{ date:"2025-08-15", title:"ED visit - exacerbation", description:"Moderate, treated with prednisone", color:T.danger },{ date:"2024-06-01", title:"Step-up to GINA 3", description:"Started Symbicort SMART", color:T.info }]);
        setInhalerTechnique([{ label:"Shake inhaler well before use", done:true },{ label:"Exhale fully away from inhaler", done:true },{ label:"Seal lips around mouthpiece", done:true },{ label:"Press canister and inhale slowly", done:false },{ label:"Hold breath for 10 seconds", done:false },{ label:"Wait 30-60s between puffs", done:false }]);
        setReferrals([{ to:"Pulmonology", date:"2025-11-10", status:"Completed", reason:"Asthma severity assessment" },{ to:"Allergy & Immunology", date:"2025-12-01", status:"Pending", reason:"Allergen testing" }]);
        setAdherence({ "Albuterol HFA": 0.85, "Symbicort SMART": 0.72, "Montelukast": 0.95 });
        setTriggers(["Pollen","Dust mites","Exercise","Cold air","Pet dander"]);
      } else if (selectedId === "p4") {
        setPeakFlowData([{ date:"2025-12-01", value:230, predicted:350, zone:"yellow" },{ date:"2025-12-02", value:210, predicted:350, zone:"red" },{ date:"2025-12-03", value:200, predicted:350, zone:"red" },{ date:"2025-12-04", value:240, predicted:350, zone:"yellow" },{ date:"2025-12-05", value:220, predicted:350, zone:"yellow" }]);
        setActData([{ date:"2025-10-01", score:11 },{ date:"2025-11-01", score:12 },{ date:"2025-12-01", score:10 }]);
        setMeds([{ name:"Advair 250/50", dose:"250/50mcg", freq:"1 puff BID", step:4, start:"2024-03-01", status:"current", category:"ICS/LABA" },{ name:"Spiriva Respimat", dose:"2.5mcg", freq:"2 puffs daily", step:4, start:"2024-06-15", status:"current", category:"LAMA" },{ name:"Albuterol HFA", dose:"90mcg", freq:"2 puffs q4h PRN", step:1, start:"2022-01-01", status:"current", category:"SABA" },{ name:"Prednisone", dose:"5-10mg", freq:"daily", step:5, start:"2025-01-01", status:"current", category:"OCS" },{ name:"Fasenra", dose:"30mg SC", freq:"q4 weeks", step:5, start:"2025-02-01", status:"current", category:"Biologic" }]);
        setExacerbations([{ date:"2025-11-20", severity:"Severe", location:"ICU", action:"IV steroids, BiPAP" },{ date:"2025-09-10", severity:"Severe", location:"ED", action:"Prednisone 60mg x7d" },{ date:"2025-07-05", severity:"Moderate", location:"ED", action:"Prednisone 40mg x5d" },{ date:"2025-04-15", severity:"Severe", location:"ICU", action:"Intubation, IV steroids" },{ date:"2025-01-20", severity:"Moderate", location:"ED", action:"Prednisone 40mg x5d" }]);
        setSpirometry([{ date:"2025-11-28", fev1:1.5, fvc:2.8, fev1Predicted:3.2, fvcPredicted:3.9 }]);
        setNotes([{ id:"n3", date:"2025-11-28", text:"Severe persistent asthma. ACT 10. Recent ICU admission. Considering switching biologic. Poor adherence noted.", author:"Dr. Smith" }]);
        setMessages([{ id:"m2", date:"2025-12-08", text:"I ran out of prednisone. What should I do?", from:"patient", read:true }]);
        setTimeline([{ date:"2025-11-20", title:"ICU admission", description:"Severe exacerbation requiring BiPAP", color:T.danger },{ date:"2025-02-01", title:"Started Fasenra", description:"Biologic therapy initiated", color:T.success },{ date:"2024-03-01", title:"Started Advair", description:"Step-up to GINA 4", color:T.info }]);
        setInhalerTechnique([{ label:"Shake inhaler", done:true },{ label:"Exhale fully", done:false },{ label:"Seal lips around mouthpiece", done:true },{ label:"Inhale slowly and deeply", done:false }]);
        setReferrals([{ to:"Pulmonology", date:"2025-11-28", status:"Completed", reason:"Severe asthma management" },{ to:"Pharmacy", date:"2025-11-28", status:"Pending", reason:"Medication reconciliation" }]);
        setAdherence({ "Advair 250/50": 0.45, "Spiriva Respimat": 0.60, "Albuterol HFA": 0.90, "Prednisone": 0.50, "Fasenra": 0.85 });
        setTriggers(["Pollen","Mold","Smoke","Strong odors","Exercise","Weather changes"]);
      } else if (selectedId === "p6") {
        setPeakFlowData([{ date:"2025-12-01", value:190, predicted:320, zone:"red" },{ date:"2025-12-02", value:195, predicted:320, zone:"red" },{ date:"2025-12-03", value:180, predicted:320, zone:"red" },{ date:"2025-12-04", value:200, predicted:320, zone:"yellow" },{ date:"2025-12-05", value:185, predicted:320, zone:"red" }]);
        setActData([{ date:"2025-09-01", score:13 },{ date:"2025-10-01", score:14 },{ date:"2025-11-01", score:12 },{ date:"2025-12-01", score:11 }]);
        setMeds([{ name:"Breo Ellipta", dose:"200/25mcg", freq:"1 puff daily", step:4, start:"2024-01-01", status:"current", category:"ICS/LABA" },{ name:"Spiriva Respimat", dose:"2.5mcg", freq:"2 puffs daily", step:4, start:"2024-06-01", status:"current", category:"LAMA" },{ name:"Albuterol HFA", dose:"90mcg", freq:"2 puffs q4h PRN", step:1, start:"2022-06-01", status:"current", category:"SABA" },{ name:"Theophylline ER", dose:"300mg", freq:"BID", step:5, start:"2025-03-01", status:"current", category:"Methylxanthine" }]);
        setExacerbations([{ date:"2025-10-01", severity:"Severe", location:"ED", action:"Prednisone 50mg x7d, antibiotics" },{ date:"2025-07-15", severity:"Moderate", location:"ED", action:"Prednisone 40mg x5d" },{ date:"2025-04-01", severity:"Moderate", location:"ED", action:"Increased bronchodilators" },{ date:"2025-01-10", severity:"Moderate", location:"ED", action:"Prednisone 40mg x5d, O2" }]);
        setSpirometry([{ date:"2025-09-15", fev1:1.8, fvc:3.0, fev1Predicted:2.8, fvcPredicted:3.5, ratioPredicted:0.75 }]);
        setNotes([{ id:"n4", date:"2025-09-15", text:"ACO patient. FEV1/FVC 0.60. Poorly controlled. Discussed smoking cessation. Refer to pulmonary rehab.", author:"Dr. Smith" }]);
        setMessages([]);
        setTimeline([{ date:"2025-10-01", title:"ED visit - exacerbation", description:"Severe, treated with prednisone + abx", color:T.danger },{ date:"2025-03-01", title:"Started Theophylline", description:"Add-on therapy for ACO", color:T.info }]);
        setInhalerTechnique([{ label:"Shake inhaler", done:true },{ label:"Exhale fully", done:true },{ label:"Seal lips", done:false },{ label:"Inhale slowly", done:false },{ label:"Hold breath", done:false }]);
        setReferrals([{ to:"Pulmonary Rehab", date:"2025-09-15", status:"Pending", reason:"ACO management" }]);
        setAdherence({ "Breo Ellipta": 0.65, "Spiriva Respimat": 0.70, "Albuterol HFA": 0.75, "Theophylline ER": 0.55 });
        setTriggers(["Smoke","Cold air","Respiratory infections","Exercise","Weather changes"]);
      } else {
        setPeakFlowData([{ date:"2025-12-01", value:320, predicted:400, zone:"yellow" },{ date:"2025-12-02", value:340, predicted:400, zone:"yellow" },{ date:"2025-12-03", value:360, predicted:400, zone:"green" }]);
        setActData([{ date:"2025-10-01", score:17 },{ date:"2025-11-01", score:19 },{ date:"2025-12-01", score:20 }]);
        setMeds([{ name:"Pulmicort Flexhaler", dose:"180mcg", freq:"2 puffs BID", step:2, start:"2024-05-01", status:"current", category:"ICS" },{ name:"Albuterol HFA", dose:"90mcg", freq:"2 puffs PRN", step:1, start:"2023-01-01", status:"current", category:"SABA" }]);
        setExacerbations([]);
        setSpirometry([]);
        setNotes([]); setMessages([]); setTimeline([]); setInhalerTechnique([]);
        setReferrals([]); setAdherence({}); setTriggers([]);
      }
      const generated = generateClinicalAlerts({ actData: actData, exacerbations: exacerbations, meds: meds, peakFlowData: peakFlowData });
      setAlerts(generated);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedId]);

  useEffect(() => {
    if (actData.length || peakFlowData.length || meds.length) {
      const generated = generateClinicalAlerts({ actData, exacerbations, meds, peakFlowData });
      setAlerts(generated);
    }
  }, [actData, exacerbations, meds, peakFlowData]);

  const tabs = [
    { id:"pef", label:"Peak Flow", icon:"📊" },
    { id:"act", label:"ACT Score", icon:"📋" },
    { id:"meds", label:"Medications", icon:"💊" },
    { id:"inhale", label:"Inhaler Tech", icon:"💨" },
    { id:"exac", label:"Exacerbations", icon:"⚠️" },
    { id:"spiro", label:"Spirometry", icon:"🫁" },
    { id:"trig", label:"Triggers", icon:"🌿" },
    { id:"adh", label:"Adherence", icon:"🎯" },
    { id:"alert", label:"Alerts", icon:"🔔" },
    { id:"edu", label:"Education", icon:"📖" },
    { id:"notes", label:"Notes", icon:"📝" },
    { id:"time", label:"Timeline", icon:"📅" },
    { id:"msg", label:"Messages", icon:"✉️" },
    { id:"ref", label:"Referrals", icon:"🔄" },
  ];

  const togglePanel = (id: string) => setExpandedPanels(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:T.bg, color:T.faint, fontSize:14 }}><div style={{ animation:"asth-pulse 1.4s ease-in-out infinite" }}>Loading Asthma Dashboard...</div></div>;
  }

  const handleExportPDF = async () => {
    setPdfExporting(true);
    try {
      const el = document.getElementById("asth-dashboard-content");
      if (!el) return;
      const note: ClinicalNote = { id:`n-pdf-${Date.now()}`, date:new Date().toISOString(), text:"PDF export initiated for "+(selected?.name||"unknown"), author:"System" };
      setNotes(prev => [...prev, note]);
      const link = document.createElement("a");
      link.href = "#";
      link.download = `asthma_${selected?.name?.replace(/\s+/g,"_")||"report"}.pdf`;
      link.click();
    } catch(e) { console.error("PDF export error:", e); }
    setPdfExporting(false);
  };

  return (
    <div className="asth-root" style={{ background: T.bg, minHeight: "100vh", position: "relative" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Mobile List View */}
      <div className={`asth-mobile-list ${mobileView === "list" ? "" : "hidden"}`}>
        <div className="asth-list-topbar">
          <h2>Asthma Patients</h2>
          <p>{patients.length} active</p>
        </div>
        <div className="asth-list-search">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." />
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {filtered.map(p => (
            <button key={p.id} onClick={() => { setSelectedId(p.id); setMobileView("detail"); }} className="asth-patient-btn">
              <div className="asth-patient-avatar">{p.avatar}</div>
              <div className="asth-patient-row-info">
                <div className="asth-patient-row-name">{p.name}</div>
                <div className="asth-patient-row-sub">{p.dx} · G{p.ginaStep}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Detail View */}
      <div className={`asth-mobile-detail ${mobileView === "detail" ? "" : "hidden"}`}>
        <div className="asth-detail-topbar">
          <button className="asth-back-btn" onClick={() => setMobileView("list")}>‹</button>
          <div className="asth-detail-topbar-avatar">{selected?.avatar}</div>
          <div className="asth-detail-topbar-info">
            <div className="asth-detail-topbar-name">{selected?.name || "Unknown"}</div>
            <div className="asth-detail-topbar-sub">{selected?.dx} · GINA {selected?.ginaStep}</div>
          </div>
        </div>

        {/* Mobile Stats Row */}
        <div style={{ padding: "10px 10px 0", display: "flex", gap: 6, flexWrap: "wrap" }} className="asth-stat-row">
          <StatCard label="ACT" value={`${selected?.actScore ?? "-"}`} color={(selected?.actScore ?? 20) <= 15 ? T.danger : (selected?.actScore ?? 20) <= 19 ? T.warn : T.success} />
          <StatCard label="PEF" value={selected?.peakFlow ? `${selected.peakFlow}` : "-"} color={T.teal} />
          <StatCard label="Exac/12m" value={`${selected?.exacerbations12m ?? 0}`} color={(selected?.exacerbations12m ?? 0) >= 3 ? T.danger : (selected?.exacerbations12m ?? 0) >= 1 ? T.warn : T.success} />
          <StatCard label="GINA" value={`${selected?.ginaStep ?? "-"}`} color={T.purple} />
        </div>

        {/* Mobile Tabs */}
        <div className="asth-tabs-wrap">
          <div className="asth-tabs">
            {tabs.map(t => (
              <button key={t.id} className="asth-tab-btn" onClick={() => setTab(t.id)} style={{ padding: "6px 12px", border: "none", borderRadius: 6, background: tab === t.id ? "#0891b2" : "transparent", color: tab === t.id ? "#fff" : T.muted, cursor: "pointer", fontWeight: 600, fontSize: 11, fontFamily: "inherit", transition: "all 0.15s" }}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>

        {/* Mobile Panel Content */}
        <div className="asth-detail-content">
          {tab === "pef" && <Card><SectHeader label="Peak Expiratory Flow" color={T.teal} /><PeakFlowChart data={peakFlowData} zones={{green:400, yellow:320}} /><div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>{peakFlowData.slice(-3).map((r,i)=><Badge key={i} text={`${r.date.slice(5)}: ${r.value}`} color={r.zone==="green"?T.success:r.zone==="yellow"?T.warn:T.danger} bg={r.zone==="green"?"#f0fdf4":r.zone==="yellow"?"#fff7ed":"#fef2f2"} border="transparent"/>)}</div></Card>}
          {tab === "act" && <Card><SectHeader label="Asthma Control Test" color={T.info} /><div style={{display:"flex",flexDirection:"column",gap:8}}>{actData.slice(-5).reverse().map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",background:T.bg,borderRadius:8,fontSize:12}}><span style={{color:T.faint}}>{new Date(a.date).toLocaleDateString()}</span><span style={{fontWeight:700,fontSize:16,color:a.score<=15?T.danger:a.score<=19?T.warn:T.success}}>{a.score}/25</span></div>)}</div></Card>}
          {tab === "meds" && <Card><SectHeader label="Medications" color={T.success} /><MedicationTimelinePanel data={meds} />{alerts.filter(a=>a.type==="saba_only"||a.type==="medication_gap"||a.type==="drug_monitoring").length>0&&<div style={{marginTop:8}}>{alerts.filter(a=>a.type==="saba_only"||a.type==="medication_gap"||a.type==="drug_monitoring").map((a,i)=><div key={i} style={{fontSize:10,color:T.warn,background:"#fff7ed",padding:"4px 8px",borderRadius:6,marginBottom:4}}>⚠ {a.message}</div>)}</div>}</Card>}
          {tab === "inhale" && <InhalerTechniquePanel data={inhalerTechnique} />}
          {tab === "exac" && <ExacerbationHistoryPanel data={exacerbations} />}
          {tab === "spiro" && <SpirometryPanel data={spirometry} />}
          {tab === "trig" && <AllergenTriggerPanel data={triggers} />}
          {tab === "adh" && <AdherencePanel data={adherence} meds={meds} />}
          {tab === "alert" && <AlertsPanel data={alerts} onDismiss={(id)=>setAlerts(prev=>prev.map(a=>a.id===id?{...a,active:false}:a))} />}
          {tab === "edu" && <EducationPanel onSelect={(t)=>{}} />}
          {tab === "notes" && <NotesPanel data={notes} onSave={(n)=>setNotes(prev=>[n,...prev])} />}
          {tab === "time" && <TimelinePanel data={timeline} />}
          {tab === "msg" && <MessagingPanel data={messages} onSend={(m)=>setMessages(prev=>[...prev,m])} />}
          {tab === "ref" && <ReferralsPanel data={referrals} />}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="asth-desktop-layout" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <PatientPicker patients={filtered} selectedId={selectedId} onSelect={setSelectedId} onSearch={setSearch} search={search} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} id="asth-dashboard-content">
          {/* Desktop Top Bar */}
          <div className="asth-page-header" style={{ padding: "14px 20px", background: "#0891b2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{selected?.name || "Asthma Dashboard"}</h1>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: "rgba(255,255,255,.7)" }}>{selected?.dx} · GINA {selected?.ginaStep} · Last visit {selected?.lastVisit || "-"}</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn label="Export PDF" variant="primary" icon="📄" small onClick={handleExportPDF} disabled={pdfExporting} />
            </div>
          </div>

          {/* Desktop Stats */}
          <div style={{ padding: "10px 20px", display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }} className="asth-stat-row">
            <StatCard label="ACT Score" value={`${selected?.actScore ?? "-"}/25`} sub={selected?.actScore ? (selected.actScore <= 15 ? "Poorly controlled" : selected.actScore <= 19 ? "Not well controlled" : "Well controlled") : "-"} color={(selected?.actScore ?? 20) <= 15 ? T.danger : (selected?.actScore ?? 20) <= 19 ? T.warn : T.success} />
            <StatCard label="Peak Flow" value={selected?.peakFlow ? `${selected.peakFlow} L/min` : "-"} sub={selected?.peakFlow && selected?.peakFlow >= 320 ? "Green zone" : selected?.peakFlow && selected?.peakFlow >= 200 ? "Yellow zone" : selected?.peakFlow ? "Red zone" : ""} color={selected?.peakFlow && selected.peakFlow >= 320 ? T.success : selected?.peakFlow && selected?.peakFlow >= 200 ? T.warn : T.danger} />
            <StatCard label="Exacerbations (12mo)" value={`${selected?.exacerbations12m ?? 0}`} sub={(selected?.exacerbations12m ?? 0) >= 2 ? "High risk" : (selected?.exacerbations12m ?? 0) >= 1 ? "Moderate risk" : "Low risk"} color={(selected?.exacerbations12m ?? 0) >= 2 ? T.danger : (selected?.exacerbations12m ?? 0) >= 1 ? T.warn : T.success} />
            <StatCard label="GINA Step" value={`${selected?.ginaStep ?? "-"}`} sub={selected?.ginaStep ? GINA_STEPS.filter(s=>s.step===selected?.ginaStep)[0]?.label.split("-")[0]?.trim() : ""} color={T.purple} />
          </div>

          {/* Desktop Tabs & Content */}
          <div className="asth-tabs-wrap" style={{ flexShrink: 0 }}>
            <div className="asth-tabs" style={{ display: "flex", overflowX: "auto", padding: "6px 16px", gap: 2, background: "#fff", borderBottom: `0.5px solid ${T.border}` }}>
              {tabs.map(t => (
                <button key={t.id} className="asth-tab-btn" onClick={() => setTab(t.id)} style={{ padding: "6px 14px", border: "none", borderRadius: 6, background: tab === t.id ? "#0891b2" : "transparent", color: tab === t.id ? "#fff" : T.muted, cursor: "pointer", fontWeight: 600, fontSize: 11, fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap" }}>{t.icon} {t.label}</button>
              ))}
            </div>
          </div>

          {/* Desktop Panel Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }} className="asth-scroll">
            {tab === "pef" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectHeader label="Peak Expiratory Flow" color={T.teal} />
                  <PeakFlowChart data={peakFlowData} zones={{green:400, yellow:320}} />
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 12 }}>
                    {peakFlowData.slice(-7).map((r,i) => (
                      <Badge key={i} text={`${r.date.slice(5)}: ${r.value}`} color={r.zone==="green"?T.success:r.zone==="yellow"?T.warn:T.danger} bg={r.zone==="green"?"#f0fdf4":r.zone==="yellow"?"#fff7ed":"#fef2f2"} border="transparent" />
                    ))}
                  </div>
                </Card>
                {peakFlowData.length>7&&<Card><SectHeader label="Weekly Average" color={T.teal} /><div style={{color:T.muted,fontSize:12}}>Average: {Math.round(peakFlowData.reduce((a,b)=>a+b.value,0)/peakFlowData.length)} L/min</div></Card>}
              </div>
            )}
            {tab === "act" && (
              <Card>
                <SectHeader label="Asthma Control Test" color={T.info} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {actData.slice(-7).reverse().map((a,i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: T.bg, borderRadius: 10, fontSize: 12 }}>
                      <span style={{ color: T.faint }}>{new Date(a.date).toLocaleDateString()}</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 18, color: a.score <= 15 ? T.danger : a.score <= 19 ? T.warn : T.success }}>{a.score}</span>
                        <span style={{ color: T.faint, fontSize: 11 }}>/ 25</span>
                      </div>
                    </div>
                  ))}
                  {actData.length === 0 && <div style={{ color: T.faint, fontSize: 12 }}>No ACT data available</div>}
                </div>
              </Card>
            )}
            {tab === "meds" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectHeader label="Current Medications" color={T.success} sub={`${meds.length} active`} />
                  <MedicationTimelinePanel data={meds} />
                </Card>
                <Card>
                  <SectHeader label="GINA Step Assessment" color={T.purple} sub={`Current: Step ${selected?.ginaStep || "?"}`} />
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead><tr style={{ color: T.faint, fontSize: 9, textTransform: "uppercase" }}><th style={{ textAlign:"left", padding:"4px 0" }}>Step</th><th style={{ textAlign:"left", padding:"4px 0" }}>Label</th><th style={{ textAlign:"left", padding:"4px 0" }}>Description</th></tr></thead>
                    <tbody>{GINA_STEPS.map((s,i) => (
                      <tr key={i} style={{ borderTop: `0.5px solid ${T.border}`, opacity: selected?.ginaStep === s.step ? 1 : 0.5, background: selected?.ginaStep === s.step ? "#f0fdfa" : "transparent" }}>
                        <td style={{ padding:"4px 0", fontWeight: 700 }}><Badge text={s.icon} color={s.color} bg={s.color+"18"} border={s.color} /> Step {s.step}</td>
                        <td style={{ padding:"4px 0", fontWeight: 600 }}>{s.label}</td>
                        <td style={{ padding:"4px 0", color: T.muted }}>{s.description}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </Card>
                {alerts.filter(a=>a.type==="saba_only"||a.type==="medication_gap"||a.type==="drug_monitoring").length>0 && (
                  <Card>
                    <SectHeader label="Medication Alerts" color={T.warn} />
                    {alerts.filter(a=>a.type==="saba_only"||a.type==="medication_gap"||a.type==="drug_monitoring").map((a,i) => (
                      <div key={i} style={{ fontSize: 11, color: T.warn, background: "#fff7ed", padding: "6px 10px", borderRadius: 8, marginBottom: 4 }}>⚠ {a.message}</div>
                    ))}
                  </Card>
                )}
              </div>
            )}
            {tab === "inhale" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <InhalerTechniquePanel data={inhalerTechnique} />
                <Card>
                  <SectHeader label="Inhaler Type Guide" color={T.info} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
                    <div><strong>MDI:</strong> Shake 5s, exhale, press & inhale slowly, hold 10s</div>
                    <div><strong>DPI:</strong> Load capsule, exhale away, inhale rapidly & deeply, hold 10s</div>
                    <div><strong>SMART:</strong> Use same inhaler for maintenance AND relief</div>
                  </div>
                </Card>
              </div>
            )}
            {tab === "exac" && <ExacerbationHistoryPanel data={exacerbations} />}
            {tab === "spiro" && <SpirometryPanel data={spirometry} />}
            {tab === "trig" && <AllergenTriggerPanel data={triggers} />}
            {tab === "adh" && <AdherencePanel data={adherence} meds={meds} />}
            {tab === "alert" && <AlertsPanel data={alerts} onDismiss={(id)=>setAlerts(prev=>prev.map(a=>a.id===id?{...a,active:false}:a))} />}
            {tab === "edu" && <EducationPanel onSelect={(t)=>{}} />}
            {tab === "notes" && <NotesPanel data={notes} onSave={(n)=>setNotes(prev=>[n,...prev])} />}
            {tab === "time" && <TimelinePanel data={timeline} />}
            {tab === "msg" && <MessagingPanel data={messages} onSend={(m)=>setMessages(prev=>[...prev,m])} />}
            {tab === "ref" && <ReferralsPanel data={referrals} />}
          </div>
        </div>
      </div>

      {/* Full-screen loading overlay */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 28, animation: "asth-pulse 1s ease-in-out infinite" }}>🫁</div>
            <div style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>Loading patient data...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AsthmaDashboard;
