import type {
  InvestigationBundle, MedicationProtocol, NursingProtocol,
  MonitoringProtocol, SupportiveCareProtocol, InfusionProtocol,
  IsolationProtocol, DiseaseKnowledge,
} from '../types/protocols'

// ══════════════════════════════════════════════════════════════════════
// MALARIA
// ══════════════════════════════════════════════════════════════════════

export const MALARIA_DISEASE_KNOWLEDGE: DiseaseKnowledge[] = [{
  id: 'malaria',
  name: 'Malaria',
  mechanisms: ['plasmodium_parasitemia', 'hemolysis'],
  epidemiology: ['Kenya is high-burden malaria country', 'Transmission seasonal in most regions (rainy seasons)', 'P. falciparum accounts for >95% of cases', 'Leading cause of fever in endemic areas', 'Pregnant women and children <5 at highest risk'],
  riskFactors: ['Living in or travel to endemic area', 'No recent antimalarial prophylaxis', 'Pregnancy (increased severity)', 'Children <5 years', 'HIV infection', 'Sickle cell disease (increased severity)', 'Splenectomy (increased risk)'],
  pathophysiology: 'Plasmodium parasites are transmitted by female Anopheles mosquito. Sporozoites infect hepatocytes (exo-erythrocytic phase), then merozoites invade RBCs (erythrocytic phase). P. falciparum causes severe disease due to cytoadherence of parasitized RBCs to endothelium (sequestration), leading to microvascular obstruction, organ dysfunction, and hemolysis.',
  diagnosticCriteria: ['Fever or history of fever in last 48h with no obvious source', 'Positive RDT (HRP-2 or pLDH)', 'Positive blood film (thick + thin smears)', 'High parasitemia (>5%) indicates severe malaria', 'Severe: impaired consciousness, respiratory distress, seizures, hypoglycemia, acidosis, severe anemia, renal impairment, jaundice, shock'],
  differentials: ['Sepsis (bacterial)', 'Pneumonia', 'Meningitis', 'Typhoid fever', 'Dengue fever', 'Other viral fevers (chikungunya, Rift Valley)', 'Urinary tract infection', 'Leptospirosis', 'Relapsing fevers (brucellosis)'],
  severityScoring: ['WHO severe malaria criteria: any of impaired consciousness, prostration, respiratory distress, multiple convulsions, shock, pulmonary edema, abnormal bleeding, jaundice, severe anemia, hypoglycemia, acidosis, hyperparasitemia >5%, renal impairment', 'SMAC (Severe Malaria Assessment Checklist)'],
  complications: ['Cerebral malaria (mortality 15-20%)', 'Severe hemolytic anemia', 'Acute kidney injury', 'Pulmonary edema / ARDS', 'Hypoglycemia', 'Metabolic acidosis', 'Disseminated intravascular coagulation', 'Blackwater fever (massive hemolysis)', 'Splenic rupture', 'Post-malaria neurological syndrome'],
  references: ['WHO Malaria Treatment Guidelines (2023)', 'Kenya Malaria Treatment Guidelines (2023)', 'CDC Yellow Book: Malaria'],
}]

export const MALARIA_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'malaria_initial',
  label: 'Malaria Initial Workup',
  diseaseId: 'malaria',
  severity: 'moderate',
  bedside: ['Pulse oximetry', 'Blood glucose (bedside)', 'Temperature'],
  laboratory: ['RDT (Malaria rapid diagnostic test)', 'Blood film (thick + thin smear)', 'FBC', 'CRP', 'Blood glucose'],
  imaging: [],
  microbiology: ['Blood culture (if severe or uncertain diagnosis)'],
  conditional: {
    if_severe: ['Blood gas', 'Lactate', 'U&E / Creatinine', 'LFTs', 'Coagulation profile', 'Blood culture', 'Chest X-ray', 'CT head (if cerebral malaria with focal signs)'],
    if_pregnant: ['Hb', 'Blood glucose Q4H', 'Obstetric ultrasound'],
    if_renal_impairment: ['U&E daily', 'Urine output strict', 'Renal ultrasound'],
    if_hypoglycemia: ['Blood glucose Q2H', 'IV dextrose infusion'],
  },
}]

export const MALARIA_MEDICATIONS: MedicationProtocol[] = [
  { id: 'malaria_act_firstline', diseaseId: 'malaria', drug: 'Artemether-Lumefantrine (AL)', route: 'PO', dose: 'Weight-based', frequency: 'BID x3 days', duration: '3 days', contraindications: ['Known hypersensitivity'], allergies: [], severity: 'mild', alternativeIfAllergy: ['Dihydroartemisinin-Piperaquine (DP)'], notes: 'First-line uncomplicated malaria. Take with fatty meal. Complete all doses.' },
  { id: 'malaria_artesunate_iv', diseaseId: 'malaria', drug: 'Artesunate IV', route: 'IV', dose: '2.4 mg/kg', frequency: '0, 12, 24h then daily', duration: 'Minimum 24h, then switch to oral ACT', contraindications: ['Known hypersensitivity'], allergies: [], severity: 'severe', alternativeIfAllergy: ['Quinine IV 20 mg/kg load then 10 mg/kg Q8H'], notes: 'First-line for severe malaria. WHO-recommended. Monitor for hemolysis (post-artesunate hemolytic anemia).' },
  { id: 'malaria_primaquine', diseaseId: 'malaria', drug: 'Primaquine', route: 'PO', dose: '0.25-0.5 mg/kg', frequency: 'OD', duration: 'Single dose (gametocytocidal)', contraindications: ['G6PD deficiency (test before giving)', 'Pregnancy'], allergies: [], severity: 'mild', alternativeIfAllergy: ['Not needed — gametocytocidal single dose only'], notes: 'Single dose to clear gametocytes and reduce transmission. MUST test G6PD first.' },
]

export const MALARIA_NURSING: NursingProtocol[] = [{
  id: 'malaria_nursing',
  diseaseId: 'malaria',
  severity: 'moderate',
  monitoring: [
    { id: 'mal_ns_temp', parameter: 'Temperature', frequency: 'Q4H (Q2H if severe)', target: '<38°C' },
    { id: 'mal_ns_consciousness', parameter: 'Level of Consciousness', frequency: 'Q4H', notes: 'AVPU/GCS — worsening may indicate cerebral malaria' },
    { id: 'mal_ns_bg', parameter: 'Blood Glucose', frequency: 'Q6H (Q2H if severe)', target: '>4 mmol/L', notes: 'Hypoglycemia common in severe malaria' },
    { id: 'mal_ns_urine', parameter: 'Urine Output and Colour', frequency: 'Q8H', notes: 'Dark urine = possible blackwater fever (massive hemolysis)' },
    { id: 'mal_ns_vitals', parameter: 'Vital Signs', frequency: 'Q4H' },
  ],
  care: [
    { id: 'mal_care_act', parameter: 'ACT Administration', frequency: 'BID', notes: 'Ensure completion of 3-day course. Take with fatty meal to enhance absorption.' },
    { id: 'mal_care_seizure', parameter: 'Seizure Precautions', frequency: 'Continuous', notes: 'Cerebral malaria can present with seizures. Pad bed rails. Suction ready.' },
    { id: 'mal_care_hydration', parameter: 'Hydration', frequency: 'Per protocol', notes: 'IV fluids if unable to take PO. Avoid overhydration (risk of pulmonary edema).' },
    { id: 'mal_care_education', parameter: 'Patient Education', frequency: 'Once', notes: 'Complete full ACT course even if symptoms resolve. Return if fever recurs within 28 days.' },
  ],
  escalation: [
    { id: 'mal_esc_cerebral', condition: 'Cerebral malaria', threshold: 'GCS <11 or seizures', action: 'ICU referral. IV artesunate. Seizure management. Avoid lumbar puncture if mass effect.', notify: ['Doctor', 'ICU team'] },
    { id: 'mal_esc_aki', condition: 'Acute kidney injury', threshold: 'Urine output <0.5 mL/kg/h x6h or creatinine rise', action: 'Assess volume status. Renal ultrasound. Nephrology referral. RRT assessment.', notify: ['Doctor', 'Nephrology'] },
    { id: 'mal_esc_anemia', condition: 'Severe anemia', threshold: 'Hb <7 g/dL', action: 'Cross-match. Transfuse packed RBCs. Monitor for fluid overload.', notify: ['Doctor'] },
  ],
}]

export const MALARIA_MONITORING: MonitoringProtocol[] = [{
  id: 'malaria_monitoring',
  diseaseId: 'malaria',
  severity: 'moderate',
  vitals: ['Temp', 'HR', 'BP', 'RR', 'SpO2'],
  vitalsFrequency: 'Q4H (Q1-2H if severe)',
  urineOutput: true,
  urineOutputFrequency: 'Q8H (Q2H if severe)',
  fluidBalance: true,
  dailyWeight: false,
  painScore: false,
  consciousness: true,
  oxygenMonitoring: false,
  special: ['Parasitemia daily until negative', 'Hb daily (if severe anemia)', 'Blood glucose Q6H (Q2H if severe or quinine)', 'Parasite clearance time'],
}]

export const MALARIA_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'mal_sc_fever', condition: 'malaria', threshold: 'Temperature >38.5°C', action: 'Antipyretic — Paracetamol 1 g PO/IV Q6H PRN', details: 'Tepid sponging if febrile convulsions risk in children. Avoid NSAIDs if renal impairment.', monitoring: 'Temp Q4H. Repeat paracetamol not more than 4g/day.' },
  { id: 'mal_sc_hydration', condition: 'malaria', threshold: 'Unable to take PO or severe malaria', action: 'IV maintenance fluids (0.9% NS or Ringer lactate)', details: 'Monitor for pulmonary edema (especially in severe malaria). Avoid overhydration.', monitoring: 'Fluid balance strict. Lung auscultation. SpO2.' },
  { id: 'mal_sc_bg_monitor', condition: 'malaria', threshold: 'Severe malaria or quinine therapy', action: 'Blood glucose monitoring Q2-4H', details: 'Hypoglycemia common in severe malaria. Prophylactic dextrose infusion if on quinine.', monitoring: 'BG Q2H if severe or on quinine. Treat <4 mmol/L with 50 mL D50 IV.' },
]

export const MALARIA_ISOLATION: IsolationProtocol[] = [{
  id: 'isolation_malaria_standard',
  diseaseId: 'malaria',
  type: 'standard',
  ppe: ['Gloves for blood/body fluid contact'],
  roomType: 'Standard bed',
  patientTransport: 'No restrictions — cover insect bite prevention (bed net)',
  duration: 'Duration of admission',
  disinfection: ['Standard cleaning', 'Needle and sharps disposal', 'Bed nets for patient'],
}]

// ══════════════════════════════════════════════════════════════════════
// MENINGITIS
// ══════════════════════════════════════════════════════════════════════

export const MENINGITIS_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'meningitis_initial',
  label: 'Meningitis Initial Workup',
  diseaseId: 'meningitis',
  severity: 'severe',
  bedside: ['GCS/AVPU', 'Pupillary assessment', 'Meningeal signs (Kernig, Brudzinski)', 'Pulse oximetry', 'Blood glucose'],
  laboratory: ['FBC', 'CRP', 'PCT', 'U&E / Creatinine', 'Blood culture x2', 'Coagulation profile', 'HIV test'],
  imaging: ['CT head (before LP if mass/ICP suspected)'],
  microbiology: ['CSF: cell count, protein, glucose, Gram stain, culture', 'CSF: India ink (if HIV+ / immunocompromised)', 'CSF: Cryptococcal antigen (if HIV+)', 'CSF: GeneXpert MTB/RIF (if TB suspected)', 'CSF: Viral PCR panel'],
  conditional: {
    if_severe: ['ABG', 'Lactate', 'Procalcitonin', 'MRI brain with gadolinium'],
    if_hiv_positive: ['CSF CrAg', 'CD4 count', 'HIV viral load', 'RPR (syphilis serology)'],
    if_seizure: ['EEG', 'Antiepileptic drug levels'],
    if_hyponatremia: ['Serum osmolality', 'Urine osmolality', 'Urine sodium (SIADH workup)'],
  },
}]

export const MENINGITIS_MEDICATIONS: MedicationProtocol[] = [
  { id: 'meningitis_ceftriaxone', diseaseId: 'meningitis', drug: 'Ceftriaxone', route: 'IV', dose: '2 g', frequency: 'Q12H', duration: '10-14 days', contraindications: ['Cephalosporin anaphylaxis'], allergies: ['Penicillin allergy (cross ~5-10%)'], severity: 'severe', alternativeIfAllergy: ['Meropenem 2 g IV Q8H'], notes: 'Empiric coverage for S. pneumoniae, N. meningitidis, H. influenzae.' },
  { id: 'meningitis_vancomycin', diseaseId: 'meningitis', drug: 'Vancomycin', route: 'IV', dose: '15-20 mg/kg', frequency: 'Q8-12H', duration: '10-14 days', contraindications: ['Previous red man syndrome'], allergies: [], severity: 'severe', alternativeIfAllergy: ['Linezolid 600 mg IV Q12H'], notes: 'Add for penicillin-resistant pneumococcus coverage. Trough 15-20 mcg/mL.' },
  { id: 'meningitis_dexamethasone', diseaseId: 'meningitis', drug: 'Dexamethasone', route: 'IV', dose: '0.15 mg/kg', frequency: 'Q6H', duration: '2-4 days (start before/between antibiotics)', contraindications: ['Septic shock', 'Active TB meningitis'], allergies: [], severity: 'severe', alternativeIfAllergy: [], notes: 'Reduces mortality in pneumococcal meningitis. Give BEFORE or WITH first antibiotic dose.' },
  { id: 'meningitis_acyclovir', diseaseId: 'meningitis', drug: 'Acyclovir', route: 'IV', dose: '10 mg/kg', frequency: 'Q8H', duration: '14-21 days', contraindications: ['Severe renal impairment (adjust dose)'], allergies: [], severity: 'severe', alternativeIfAllergy: ['Ganciclovir (if CMV suspected)'], notes: 'If viral encephalitis suspected (esp HSV). Adjust for renal function.' },
]

export const MENINGITIS_NURSING: NursingProtocol[] = [{
  id: 'meningitis_nursing',
  diseaseId: 'meningitis',
  severity: 'severe',
  monitoring: [
    { id: 'men_ns_gcs', parameter: 'GCS / Neurological Observations', frequency: 'Q1H', target: 'Stable or improving', notes: 'GCS, pupils, limb power, cranial nerves. Report any deterioration immediately.' },
    { id: 'men_ns_vitals', parameter: 'Vital Signs', frequency: 'Q1H' },
    { id: 'men_ns_temp', parameter: 'Temperature', frequency: 'Q1H', target: '<38°C' },
    { id: 'men_ns_spo2', parameter: 'SpO2', frequency: 'Continuous', target: '>94%' },
    { id: 'men_ns_io', parameter: 'Strict Intake & Output', frequency: 'Q1H', notes: 'SIADH common — monitor for hyponatremia' },
    { id: 'men_ns_seizure', parameter: 'Seizure Activity', frequency: 'Continuous observation', notes: 'Seizure precautions. Document any seizure activity.' },
  ],
  care: [
    { id: 'men_care_hob', parameter: 'Head of Bed Elevation', frequency: 'Continuous', notes: 'HOB 30° to reduce ICP. Avoid neck flexion/rotation.' },
    { id: 'men_care_stimulation', parameter: 'Minimal Stimulation', frequency: 'Continuous', notes: 'Dim lights. Cluster care. Avoid unnecessary procedures.' },
    { id: 'men_care_abx', parameter: 'Antibiotic Administration', frequency: 'Per order', notes: 'First dose STAT. Dexamethasone BEFORE antibiotics. Ensure CSF cultures obtained first.' },
    { id: 'men_care_isolation', parameter: 'Isolation Precautions', frequency: 'Continuous', notes: 'Droplet precautions until meningococcus excluded (24h effective antibiotics if meningococcal).' },
  ],
  escalation: [
    { id: 'men_esc_icp', condition: 'Raised ICP / herniation', threshold: 'GCS drop >2, pupillary changes, Cushing reflex (HTN + bradycardia), abnormal posturing', action: 'HOB 30°. Hyperventilation (PaCO2 30-35 mmHg). Mannitol 0.5-1 g/kg IV. Neurosurgery consult. ICU referral.', notify: ['Doctor', 'ICU team', 'Neurosurgery'] },
    { id: 'men_esc_seizure', condition: 'Status epilepticus', threshold: 'Seizure >5 min or multiple without recovery', action: 'Benzodiazepine IV. Load phenytoin/fosphenytoin. ICU referral. EEG monitoring.', notify: ['Doctor', 'ICU team', 'Neurologist'] },
    { id: 'men_esc_shock', condition: 'Septic shock', threshold: 'SBP <90 despite fluids', action: 'Sepsis protocol. Vasopressors. ICU referral.', notify: ['ICU team', 'Doctor'] },
  ],
}]

export const MENINGITIS_MONITORING: MonitoringProtocol[] = [{
  id: 'meningitis_monitoring',
  diseaseId: 'meningitis',
  severity: 'severe',
  vitals: ['GCS', 'HR', 'BP', 'RR', 'SpO2', 'Temp', 'Pupils'],
  vitalsFrequency: 'Q1H (Q15min if unstable)',
  urineOutput: true,
  urineOutputFrequency: 'Q1H',
  fluidBalance: true,
  dailyWeight: true,
  painScore: true,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['GCS chart Q1H', 'Pupil chart Q1H', 'Seizure chart', 'Na+ Q6H (SIADH monitoring)', 'CSF results (culture, cell count, protein, glucose)', 'Meningococcal: monitor for DIC, purpura fulminans, adrenal hemorrhage'],
}]

export const MENINGITIS_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'men_sc_fluids', condition: 'meningitis', threshold: 'All meningitis patients', action: 'IV fluids — cautious maintenance (monitor SIADH)', details: 'SIADH common. Fluid restriction if hyponatremic. Normal Saline preferred. Monitor Na+ Q6-12H.', monitoring: 'Na+ trend. Urine output. Fluid balance. Weight daily.' },
  { id: 'men_sc_analgesia', condition: 'meningitis', threshold: 'Headache severe', action: 'Analgesia — Paracetamol 1 g Q6H PRN. Avoid NSAIDs if concern for bleeding.', details: 'Photophobia — dim lights. Dark quiet environment. Cluster care.', monitoring: 'Pain score. Headache response. Neurological assessment.' },
]

export const MENINGITIS_ISOLATION: IsolationProtocol[] = [{
  id: 'isolation_meningitis_droplet',
  diseaseId: 'meningitis',
  type: 'droplet',
  ppe: ['Surgical mask', 'Gloves', 'Gown (if splash risk)', 'Eye protection if suctioning'],
  roomType: 'Single room preferred. Negative pressure if TB meningitis.',
  patientTransport: 'Patient must wear surgical mask. Limit transport to essential only.',
  duration: '24 hours after effective antibiotic therapy started (if meningococcal)',
  disinfection: ['Droplet precautions', 'Standard cleaning', 'Hand hygiene before and after contact'],
}]

export const MENINGITIS_DISEASE_KNOWLEDGE: DiseaseKnowledge[] = [{
  id: 'meningitis',
  name: 'Meningitis',
  mechanisms: ['meningeal_inflammation'],
  epidemiology: ['Annual incidence ~5-10/100,000 in Africa meningitis belt', 'Peak in dry season (Dec-Jun) in Sahel', 'N. meningitidis causes epidemics in African meningitis belt', 'S. pneumoniae is most common cause in adults worldwide', 'H. influenzae type b (Hib) declining since vaccination', 'HIV co-infection increases risk of cryptococcal and TB meningitis'],
  riskFactors: ['Overcrowding (military barracks, dormitories)', 'Age: infants and elderly at highest risk', 'HIV infection (cryptococcal, TB, pneumococcal)', 'Sickle cell disease (pneumococcal)', 'Asplenia/hyposplenia', 'CSF leak (skull fracture, surgery)', 'Complement deficiency (terminal pathway)', 'Recent neurosurgery or CNS device', 'Alcoholism', 'Diabetes mellitus'],
  pathophysiology: 'Meningitis is inflammation of the meninges (pia-arachnoid and dura). Bacteria reach the subarachnoid space via hematogenous spread from nasopharyngeal colonization, direct extension from sinuses/ears/mastoid, or direct inoculation (trauma/surgery). Bacterial multiplication and host inflammatory response cause cerebral edema, increased ICP, impaired CSF flow, and potential cerebral ischemia. S. pneumoniae causes the most severe disease with highest mortality.',
  diagnosticCriteria: ['Fever + nuchal rigidity + altered mental status (classic triad in ~50%)', 'Kernig sign (pain with knee extension when hip flexed)', 'Brudzinski sign (involuntary hip flexion with neck flexion)', 'CSF analysis: cell count, protein, glucose, Gram stain, culture', 'CSF glucose <40% serum glucose suggests bacterial', 'Blood cultures positive in 50-80% of bacterial meningitis', 'CT head before LP if: immunocompromised, focal neuro deficit, papilledema, GCS <10, seizure within 1 week, or history of CNS mass'],
  differentials: ['Viral meningitis (enterovirus, HSV, VZV)', 'Meningoencephalitis (HSV, arbovirus, rabies)', 'TB meningitis (subacute course, basilar involvement)', 'Fungal meningitis (cryptococcal — especially HIV)', 'Cerebral malaria', 'Subarachnoid hemorrhage', 'Cerebral abscess', 'Parameningeal infection (sinus, mastoid empyema)', 'Carcinomatous meningitis', 'Drug-induced meningitis (NSAIDs, IVIG, TMP-SMX)', 'Bacterial endocarditis with emboli'],
  severityScoring: ['GCS (Glasgow Coma Scale) for consciousness level', 'Modified NIHSS for focal deficits', 'Bacterial meningitis score (children): predicts bacterial etiology', 'Mortality risk: low GCS, septic shock, extreme ages, pneumococcal etiology'],
  complications: ['Hearing loss (most common — 10-30%, especially pneumococcal)', 'Cerebral edema / herniation', 'Septic shock / DIC', 'SIADH / hyponatremia', 'Hydrocephalus (communicating or obstructive)', 'Cerebral infarction (vasculitis/spasm)', 'Seizures and epilepsy', 'Cognitive impairment / memory loss', 'Cranial nerve palsies (especially III, VI, VII)', 'Brain abscess', 'Subdural empyema', 'Death (10-30% bacterial, higher in pneumococcal)'],
  references: ['WHO Guidelines for Epidemic Meningitis (2023)', 'IDSA Guidelines for Bacterial Meningitis (2023)', 'Kenya National Guidelines for Meningitis', 'MSF Clinical Guidelines: Meningitis'],
}]

// ══════════════════════════════════════════════════════════════════════
// URINARY TRACT INFECTION
// ══════════════════════════════════════════════════════════════════════

export const UTI_DISEASE_KNOWLEDGE: DiseaseKnowledge[] = [{
  id: 'uti',
  name: 'Urinary Tract Infection',
  mechanisms: ['bacterial_uti'],
  epidemiology: ['One of the most common bacterial infections in women', '>50% of women will have ≥1 UTI in lifetime', 'Recurrent UTI in 20-30% of women after first episode', 'Prevalence increases with age and sexual activity', 'E. coli causes 70-95% of uncomplicated cystitis', 'Nosocomial UTI accounts for 40% of hospital-acquired infections (catheter-associated)'],
  riskFactors: ['Female sex (short urethra, proximity to anus)', 'Sexual activity (honeymoon cystitis)', 'Diaphragm/spermicide use', 'Pregnancy (ureteral dilation and stasis)', 'Menopause (loss of estrogen, pH changes)', 'Diabetes mellitus', 'Immunosuppression', 'Urinary catheterization', 'Structural abnormalities (stricture, stone, reflux)', 'Neurogenic bladder', 'Previous UTI', 'Antibiotic use (alters microbiome)'],
  pathophysiology: 'Bacteria (usually fecal flora) colonize the periurethral area and ascend the urethra into the bladder. E. coli binds to uroepithelial cells via adhesins (type 1 fimbriae, P fimbriae). In uncomplicated cystitis, infection is limited to bladder mucosa. Pyelonephritis occurs when bacteria ascend the ureters to the kidney, causing tubulointerstitial inflammation, microabscesses, and potential bacteremia.',
  diagnosticCriteria: ['Dysuria, frequency, urgency, suprapubic pain', 'Urinalysis: positive leukocyte esterase and nitrites', 'Pyuria (≥10 WBC/hpf) on microscopy', 'Urine culture: ≥10³ CFU/mL (symptomatic) or ≥10⁵ CFU/mL (asymptomatic)', 'Upper UTI (pyelonephritis): fever, flank pain, CVA tenderness, nausea/vomiting', 'Complicated UTI: presence of structural/functional abnormality, catheter, male, pregnancy', 'Recurrent UTI: ≥2 in 6 months or ≥3 in 12 months'],
  differentials: ['Vaginitis (Candida, Trichomonas, BV)', 'Urethritis (Chlamydia, N. gonorrhoeae)', 'Interstitial cystitis / bladder pain syndrome', 'Overactive bladder', 'Bladder cancer (hematuria without infection)', 'Pelvic inflammatory disease', 'Nephrolithiasis', 'Prostatitis (men)', 'Diverticulitis (if lower abdominal pain)', 'Appendicitis (if right flank pain)'],
  severityScoring: ['Uncomplicated vs complicated classification', 'SEPSIS criteria if pyelonephritis: qSOFA, SIRS', 'Kidney disease staging if recurrent pyelonephritis with renal scarring'],
  complications: ['Pyelonephritis with bacteremia (25-30% of pyelonephritis)', 'Renal abscess (cortical or corticomedullary)', 'Perinephric abscess', 'Emphysematous pyelonephritis (diabetics) — surgical emergency', 'Papillary necrosis (diabetics, sickle cell)', 'Urosepsis / septic shock', 'Pregnancy: preterm labor, low birth weight, pyelonephritis', 'Recurrent UTI leading to renal scarring in children', 'Struvite stones (urease-producing organisms)'],
  references: ['IDSA Guidelines for UTI (2023)', 'Kenya Guidelines for Management of UTI', 'ACOG Practice Bulletin: UTI in Pregnancy', 'EAU Guidelines on Urological Infections'],
}]

// ══════════════════════════════════════════════════════════════════════
// GASTROENTERITIS
// ══════════════════════════════════════════════════════════════════════

export const GASTROENTERITIS_DISEASE_KNOWLEDGE: DiseaseKnowledge[] = [{
  id: 'gastroenteritis',
  name: 'Acute Gastroenteritis',
  mechanisms: ['enteric_infection'],
  epidemiology: ['Second leading cause of death in children <5 globally', '~1.7 billion cases annually worldwide', 'Rotavirus accounts for 40% of severe childhood diarrhea (pre-vaccine)', 'Norovirus is leading cause of foodborne outbreaks', 'Cholera causes large epidemics in humanitarian crises', 'Kenya: diarrhea accounts for 18% of under-5 mortality'],
  riskFactors: ['Unsafe water and poor sanitation', 'Lack of exclusive breastfeeding (infants)', 'Malnutrition (increases severity and duration)', 'HIV infection', 'Travel to endemic areas (traveler\'s diarrhea)', 'Antibiotic use (C. difficile)', 'Immunosuppression', 'Age <5 years and >65 years', 'Living in crowded conditions', 'Humanitarian emergencies / refugee settings'],
  pathophysiology: 'Infectious agents enter via fecal-oral route. Viruses (rotavirus, norovirus) invade enterocytes causing villous damage and malabsorptive diarrhea. Bacteria (Vibrio cholerae, ETEC) produce enterotoxins that activate cAMP leading to secretory diarrhea. Invasive bacteria (Shigella, Salmonella, Campylobacter) cause inflammation, mucosal ulceration, and bloody diarrhea (dysentery). Dehydration results from fluid and electrolyte losses.',
  diagnosticCriteria: ['Sudden onset of loose/watery stools ≥3 in 24h', 'Associated symptoms: nausea, vomiting, abdominal cramps, fever', 'Dehydration assessment (WHO Plan A/B/C): none/some/severe', 'Bloody/mucoid stools = dysentery (likely Shigella)', 'Duration: acute <7 days, persistent 7-14 days, chronic >14 days', 'Stool microscopy: WBCs, RBCs, ova/cysts, parasites', 'Stool culture indicated if: dysentery, immunocompromised, outbreak, severe, traveler, persistent'],
  differentials: ['Food poisoning (toxin-mediated, short incubation)', 'C. difficile colitis (antibiotic history)', 'Inflammatory bowel disease (chronic/bloody diarrhea)', 'Irritable bowel syndrome (chronic, no fever/weight loss)', 'Surgical abdomen (appendicitis, intussusception)', 'Malabsorption (celiac, pancreatic insufficiency)', 'Endocrine (hyperthyroidism, carcinoid)', 'Laxative abuse'],
  severityScoring: ['WHO Plan: A (none), B (some), C (severe dehydration)', 'Vesikari score (children): 0-20 points, severity classification', 'CDI (Clostridioides difficile) severity: mild/moderate/severe/fulminant'],
  complications: ['Dehydration and electrolyte disturbances (hypokalemia, hyponatremia)', 'Hypovolemic shock (leading cause of death)', 'Acute kidney injury (pre-renal)', 'Metabolic acidosis (HCO3 loss in stool)', 'Hemolytic uremic syndrome (STEC/HUS — E. coli O157:H7)', 'Toxic megacolon (Shigella, C. difficile)', 'Reactive arthritis (post-Shigella, Campylobacter, Salmonella)', 'Guillain-Barré syndrome (post-Campylobacter jejuni)', 'Lactose intolerance (secondary, transient)', 'Post-infectious IBS'],
  references: ['WHO Diarrhoeal Disease Guidelines', 'Kenja MoH Guidelines for Diarrhoea Management', 'ESPID/ESPGHAN Guidelines for Acute Gastroenteritis in Children', 'CDC Guidelines for Managing Acute Gastroenteritis'],
}]

export const UTI_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'uti_initial',
  label: 'UTI Initial Workup',
  diseaseId: 'uti',
  severity: 'moderate',
  bedside: ['Urinalysis/dipstick', 'Temperature', 'Flank exam'],
  laboratory: ['Urine culture + sensitivity', 'FBC', 'CRP', 'U&E / Creatinine'],
  imaging: [],
  microbiology: [],
  conditional: {
    if_severe: ['Blood culture x2', 'Lactate', 'Renal ultrasound', 'CT abdomen (if complicated/pyonephrosis)'],
    if_recurrent: ['Renal ultrasound', 'Post-void residual', 'CT urogram (if recurrent/persistent)'],
    if_male: ['Prostate exam (if prostatitis suspected)', 'PSA if indicated'],
    if_pregnant: ['Urine culture (mandatory screen)', 'Repeat culture 1-2 weeks after treatment'],
    if_renal_impairment: ['Renal ultrasound', 'U&E daily', 'Urine protein/creatinine ratio'],
  },
}]

export const UTI_MEDICATIONS: MedicationProtocol[] = [
  { id: 'uti_nitrofurantoin', diseaseId: 'uti', drug: 'Nitrofurantoin', route: 'PO', dose: '100 mg', frequency: 'Q6H', duration: '5 days (uncomplicated)', contraindications: ['eGFR <30', 'Pregnancy (third trimester — G6PD)', 'Anuria'], allergies: ['Nitrofurantoin allergy (rare)'], severity: 'mild', alternativeIfAllergy: ['Trimethoprim 200 mg PO Q12H (if suscept)'], notes: 'First-line uncomplicated cystitis. Avoid if pyelonephritis suspected (poor tissue penetration).' },
  { id: 'uti_ceftriaxone', diseaseId: 'uti', drug: 'Ceftriaxone', route: 'IV', dose: '1 g', frequency: 'OD', duration: '7-14 days (complicated/pyelonephritis)', contraindications: ['Cephalosporin anaphylaxis'], allergies: ['Penicillin allergy (cross ~5-10%)'], severity: 'moderate', alternativeIfAllergy: ['Gentamicin 5-7 mg/kg IV OD + dose adjust'], notes: 'Empiric for complicated UTI / pyelonephritis. Adjust duration based on severity.' },
  { id: 'uti_ciprofloxacin', diseaseId: 'uti', drug: 'Ciprofloxacin', route: 'PO/IV', dose: '500 mg PO BID / 400 mg IV BID', frequency: 'BID', duration: '7-14 days', contraindications: ['QTc prolongation', 'Tendon rupture history', 'Epilepsy', 'Children <18', 'Pregnancy'], allergies: ['Fluoroquinolone allergy'], severity: 'moderate', alternativeIfAllergy: ['Ceftriaxone 1 g IV OD'], notes: 'Reserve for when alternatives not suitable. High resistance in some areas.' },
]

export const UTI_NURSING: NursingProtocol[] = [{
  id: 'uti_nursing',
  diseaseId: 'uti',
  severity: 'moderate',
  monitoring: [
    { id: 'uti_ns_temp', parameter: 'Temperature', frequency: 'Q6H', target: '<38°C' },
    { id: 'uti_ns_urine', parameter: 'Urine Output and Character', frequency: 'Q8H', notes: 'Colour, cloudiness, dysuria, frequency. Strain urine for stones.' },
    { id: 'uti_ns_pain', parameter: 'Pain (flank/suprapubic)', frequency: 'Q6H', notes: 'Assess location and severity' },
    { id: 'uti_ns_catheter', parameter: 'Catheter Care (if indwelling)', frequency: 'Per hospital protocol', notes: 'Perineal hygiene. Drainage bag below bladder. Document urine output.' },
  ],
  care: [
    { id: 'uti_care_hydration', parameter: 'Encourage Oral Hydration', frequency: 'Ongoing', notes: '2-3 L/day unless fluid restricted. Cranberry juice may reduce adherence of bacteria.' },
    { id: 'uti_care_hygiene', parameter: 'Perineal Hygiene', frequency: 'BID and PRN', notes: 'Wipe front to back. Avoid irritants (douches, powders). Teach proper hygiene.' },
    { id: 'uti_care_education', parameter: 'Patient Education', frequency: 'Once', notes: 'Complete full antibiotic course. Return if symptoms worsen or fever persists >48h on antibiotics. Avoid sexual intercourse until symptoms resolve.' },
  ],
  escalation: [
    { id: 'uti_esc_pyelo', condition: 'Pyelonephritis', threshold: 'Fever >38.5 with flank pain, nausea/vomiting', action: 'IV antibiotics. Blood cultures. Assess for obstruction (ultrasound).', notify: ['Doctor'] },
    { id: 'uti_esc_sepsis', condition: 'Urosepsis', threshold: 'Fever + hypotension + organ dysfunction', action: 'Sepsis protocol. IV fluids. Broad-spectrum antibiotics. Vasopressors if needed. ICU referral.', notify: ['Doctor', 'ICU team'] },
    { id: 'uti_esc_obstruction', condition: 'Obstructive uropathy', threshold: 'Anuria + flank pain + rising creatinine', action: 'Renal ultrasound stat. Urology consult for decompression (nephrostomy/stent).', notify: ['Urology', 'Doctor'] },
  ],
}]

export const UTI_MONITORING: MonitoringProtocol[] = [{
  id: 'uti_monitoring',
  diseaseId: 'uti',
  severity: 'moderate',
  vitals: ['Temp', 'HR', 'BP', 'RR'],
  vitalsFrequency: 'Q6H (Q2H if severe)',
  urineOutput: true,
  fluidBalance: false,
  dailyWeight: false,
  painScore: true,
  consciousness: false,
  oxygenMonitoring: false,
  special: ['Urinalysis daily (if inpatient)', 'Urine culture results at 48h (check sensitivities)', 'U&E monitor if renal impairment or IV antibiotics'],
}]

export const UTI_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'uti_sc_hydration', condition: 'uti', threshold: 'All UTI patients', action: 'Increase fluid intake to 2-3 L/day (unless contraindicated)', details: 'Encourage frequent voiding. Avoid bladder irritants (caffeine, alcohol, spicy foods).', monitoring: 'Fluid intake. Urine output. Symptom improvement.' },
  { id: 'uti_sc_analgesia', condition: 'uti', threshold: 'Dysuria or suprapubic pain', action: 'Analgesia — Paracetamol 1 g Q6H PRN. Phenazopyridine if severe dysuria (short-term).', details: 'Warm compress to suprapubic area for comfort. Avoid NSAIDs if renal impaired.', monitoring: 'Pain score. Dysuria resolution.' },
  { id: 'uti_sc_prevention', condition: 'uti', threshold: 'Recurrent UTI (≥2 in 6 months or ≥3 in 12 months)', action: 'Prophylaxis options: low-dose antibiotic, D-mannose, cranberry, post-coital prophylaxis', details: 'Assess for risk factors: sexual activity, diaphragm use, poor hygiene, residual urine, stones. Refer to urology if complicated.', monitoring: 'UTI frequency. Compliance with preventive measures.' },
]

// ══════════════════════════════════════════════════════════════════════
// GASTROENTERITIS
// ══════════════════════════════════════════════════════════════════════

export const GASTROENTERITIS_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'ge_initial',
  label: 'Gastroenteritis Initial Workup',
  diseaseId: 'gastroenteritis',
  severity: 'moderate',
  bedside: ['Hydration assessment (mucous membranes, skin turgor, CRT)', 'Temperature', 'Weight', 'Stool chart'],
  laboratory: ['FBC', 'CRP', 'U&E / Creatinine', 'Stool microscopy'],
  imaging: [],
  microbiology: ['Stool culture', 'Stool PCR panel (if available)'],
  conditional: {
    if_severe: ['Blood culture x2', 'ABG (if dehydration severe)', 'Lactate', 'Stool C. diff toxin (if recent antibiotics)'],
    if_dysentery: ['Stool culture (specific for Shigella)', 'Blood culture'],
    if_cholera_suspected: ['Stool dark-field microscopy', 'Stool culture (TCBS)'],
    if_typhoid_suspected: ['Blood culture (1st week)', 'Stool culture (3rd week)', 'Widal test (limited utility)'],
    if_severe_dehydration: ['ABG', 'Lactate', 'U&E daily'],
  },
}]

export const GASTROENTERITIS_MEDICATIONS: MedicationProtocol[] = [
  { id: 'ge_antibiotics_severe', diseaseId: 'gastroenteritis', drug: 'Ceftriaxone', route: 'IV', dose: '1-2 g', frequency: 'OD', duration: '3-5 days', contraindications: ['Cephalosporin anaphylaxis'], allergies: ['Penicillin allergy (cross ~5-10%)'], severity: 'severe', alternativeIfAllergy: ['Azithromycin 500 mg IV OD'], notes: 'For severe or dysenteric gastroenteritis. Not indicated for most viral or mild bacterial GE.' },
  { id: 'ge_azithromycin_typhoid', diseaseId: 'gastroenteritis', drug: 'Azithromycin', route: 'PO/IV', dose: '500 mg', frequency: 'OD', duration: '5-7 days', contraindications: ['QTc prolongation'], allergies: ['Macrolide allergy (rare)'], severity: 'moderate', alternativeIfAllergy: ['Ciprofloxacin 500 mg PO BID (if susceptible)'], notes: 'First-line for typhoid fever in Kenya (cipro resistance common).' },
  { id: 'ge_zinc', diseaseId: 'gastroenteritis', drug: 'Zinc Sulfate', route: 'PO', dose: '20 mg (children 10 mg)', frequency: 'OD', duration: '10-14 days', contraindications: [], allergies: [], severity: 'mild', alternativeIfAllergy: [], notes: 'WHO-recommended for all diarrheal episodes in children. Reduces duration and severity.' },
]

export const GASTROENTERITIS_NURSING: NursingProtocol[] = [{
  id: 'ge_nursing',
  diseaseId: 'gastroenteritis',
  severity: 'moderate',
  monitoring: [
    { id: 'ge_ns_hydration', parameter: 'Hydration Status', frequency: 'Q4H', notes: 'Mucous membranes, skin turgor, CRT, thirst, sunken eyes, capillary refill' },
    { id: 'ge_ns_stool', parameter: 'Stool Chart (frequency, consistency, volume, blood/mucus)', frequency: 'Per episode', notes: 'Classify: watery, bloody, mucoid. Quantify volume if possible.' },
    { id: 'ge_ns_vitals', parameter: 'Vital Signs', frequency: 'Q4H (Q1H if severe dehydration)' },
    { id: 'ge_ns_weight', parameter: 'Weight', frequency: 'Daily', notes: 'Key indicator of hydration status change' },
    { id: 'ge_ns_vomit', parameter: 'Vomiting Assessment', frequency: 'Per episode', notes: 'Frequency, volume (estimate), ability to tolerate oral intake' },
  ],
  care: [
    { id: 'ge_care_ors', parameter: 'Oral Rehydration Solution Therapy', frequency: 'After each loose stool', notes: '<2 years: 50-100 mL per stool. 2-10 years: 100-200 mL. >10 years: as much as tolerated. Plan A/B/C per WHO.' },
    { id: 'ge_care_iv', parameter: 'IV Fluids (if severe dehydration)', frequency: 'Per protocol', notes: '100 mL/kg over 3-6 hours (Plan C WHO). Reassess after each hour. Switch to ORS when tolerating PO.' },
    { id: 'ge_care_feeding', parameter: 'Continue Feeding', frequency: 'Per schedule', notes: 'Breastfeeding: continue. Children: offer usual food immediately after rehydration. BRAT diet is NOT recommended — give nutrient-rich foods.' },
    { id: 'ge_care_hygiene', parameter: 'Hand Hygiene', frequency: 'After each patient contact and stool episode', notes: 'Soap and water (alcohol gel less effective against norovirus). Contact precautions.' },
  ],
  escalation: [
    { id: 'ge_esc_severe_dehyd', condition: 'Severe dehydration', threshold: '≥2 of: lethargic/unconscious, unable to drink, sunken eyes, skin pinch goes back very slowly', action: 'IV fluids 100 mL/kg over 3h. Reassess hourly. Admit. Strict IO chart.', notify: ['Doctor'] },
    { id: 'ge_esc_shock', condition: 'Hypovolemic shock', threshold: 'SBP <90, tachycardia, delayed CRT, weak pulses, altered consciousness', action: 'IV fluids 20 mL/kg bolus. Repeat if no response. Consider septic shock. ICU referral.', notify: ['Doctor', 'ICU team'] },
    { id: 'ge_esc_bloody', condition: 'Dysentery (bloody diarrhea)', threshold: 'Visible blood in stool + fever', action: 'Stool culture. Start empiric antibiotics. Assess for complications (toxic megacolon, HUS).', notify: ['Doctor'] },
  ],
}]

export const GASTROENTERITIS_MONITORING: MonitoringProtocol[] = [{
  id: 'ge_monitoring',
  diseaseId: 'gastroenteritis',
  severity: 'moderate',
  vitals: ['HR', 'BP', 'RR', 'Temp'],
  vitalsFrequency: 'Q4H (Q1H if severe dehydration)',
  urineOutput: true,
  urineOutputFrequency: 'Q8H (Q2H if severe)',
  fluidBalance: true,
  dailyWeight: true,
  painScore: true,
  consciousness: true,
  oxygenMonitoring: false,
  special: ['Stool frequency and character chart', 'Hydration status assessment Q4H', 'Weight daily', 'U&E if IV fluids >24h or abnormal losses', 'Screen contacts for diarrhea'],
}]

export const GASTROENTERITIS_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'ge_sc_ors', condition: 'gastroenteritis', threshold: 'Some dehydration or at risk', action: 'Oral rehydration solution — after each loose stool', details: 'WHO ORS: 1 packet/L clean water. Give 50-100 mL/kg over 4h for some dehydration. Continue breast/bottle feeding.', monitoring: 'Stool frequency. Hydration status. Weight. Urine output.' },
  { id: 'ge_sc_nutrition', condition: 'gastroenteritis', threshold: 'All patients', action: 'Continue nutrition — early refeeding', details: 'Breastfeeding: continue. Children: age-appropriate foods. Avoid sugary drinks (increase osmotic diarrhea). BRAT diet outdated.', monitoring: 'Tolerance of feeding. Weight maintenance.' },
  { id: 'ge_sc_zinc', condition: 'gastroenteritis', threshold: 'Children <5 years', action: 'Zinc supplementation 10 mg OD x10-14 days', details: 'WHO recommendation — reduces diarrhea duration and severity. Continue even after diarrhea stops.', monitoring: 'Completion of 14-day course.' },
  { id: 'ge_sc_prevention', condition: 'gastroenteritis', threshold: 'Community setting / outbreak', action: 'Hand hygiene, safe water, food safety, rotavirus vaccination', details: 'Educate on proper hand washing. Advise on safe water storage. Recommend rotavirus vaccine for infants (Kenya EPI schedule).', monitoring: 'Case count. Outbreak control measures.' },
]

export const GASTROENTERITIS_ISOLATION: IsolationProtocol[] = [{
  id: 'isolation_ge_contact',
  diseaseId: 'gastroenteritis',
  type: 'contact',
  ppe: ['Gloves', 'Gown (if soiling anticipated)', 'Hand hygiene with soap and water (not alcohol gel alone for norovirus)'],
  roomType: 'Single room preferred. Cohort if outbreak.',
  patientTransport: 'Limit transport. Patient wear clean gown. Notify receiving area.',
  duration: 'Duration of symptoms + 48h after last diarrheal episode',
  disinfection: ['Contact precautions', 'Chlorine-based disinfectant for surfaces', 'Dedicated toilet or commode', 'Soap and water for hand hygiene (alcohol gel less effective against norovirus)'],
}]

// ══════════════════════════════════════════════════════════════════════
// COPD
// ══════════════════════════════════════════════════════════════════════

export const COPD_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'copd_initial',
  label: 'COPD Initial / Exacerbation Workup',
  diseaseId: 'copd',
  severity: 'moderate',
  bedside: ['Pulse oximetry', 'Peak flow measurement', 'ABG (if SpO2 <92% or severe exacerbation)', 'ECG'],
  laboratory: ['CBC', 'CRP', 'U&E / Creatinine', 'BNP (if concomitant HF suspected)'],
  imaging: ['Chest X-ray'],
  microbiology: ['Sputum culture (if purulent sputum)', 'Blood culture (if febrile/severe)'],
  conditional: {
    if_severe: ['ABG (mandatory)', 'Lactate', 'Chest CT (if atypical features or ?bronchiectasis)', 'Echocardiogram (if cor pulmonale suspected)'],
    if_hypoxia: ['ABG', 'BNP'],
    if_hypercapnia: ['ABG serial', 'Consider NIV monitoring'],
    if_frequent_exacerbations: ['Spirometry (when stable)', 'Alpha-1 antitrypsin level'],
  },
}]

export const COPD_MEDICATIONS: MedicationProtocol[] = [
  { id: 'copd_saba', diseaseId: 'copd', drug: 'Salbutamol (Albuterol)', route: 'INH', dose: '100-200 mcg', frequency: 'Q4-6H PRN (Q1H if acute exacerbation)', duration: 'As needed', contraindications: ['Tachyarrhythmia'], allergies: [], severity: 'mild', alternativeIfAllergy: [], notes: 'Short-acting bronchodilator. First-line for symptom relief. Use spacer if available.' },
  { id: 'copd_sama', diseaseId: 'copd', drug: 'Ipratropium Bromide', route: 'INH', dose: '20-40 mcg (MDI) / 500 mcg (neb)', frequency: 'Q6H (Q4H if acute)', duration: 'As needed / scheduled', contraindications: ['Narrow-angle glaucoma (avoid nebulized)', 'Bladder outlet obstruction'], allergies: [], severity: 'mild', alternativeIfAllergy: ['Tiotropium 18 mcg INH OD'], notes: 'Short-acting anticholinergic. Often used in combination with SABA for exacerbations.' },
  { id: 'copd_ics_laba', diseaseId: 'copd', drug: 'Fluticasone/Salmeterol', route: 'INH', dose: '250/50 mcg', frequency: 'BID', duration: 'Long-term maintenance', contraindications: ['Untreated respiratory infection'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['Budesonide/Formoterol 320/9 mcg INH BID'], notes: 'For patients with exacerbations despite LAMA. Not first-line — reserve for high exacerbation risk.' },
  { id: 'copd_lama', diseaseId: 'copd', drug: 'Tiotropium', route: 'INH', dose: '18 mcg (HandiHaler) / 2.5 mcg (Respimat)', frequency: 'OD', duration: 'Long-term maintenance', contraindications: ['Narrow-angle glaucoma'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['Glycopyrrolate 15.6 mcg INH BID'], notes: 'First-line maintenance therapy for COPD. Reduces exacerbations and improves QoL.' },
  { id: 'copd_prednisolone', diseaseId: 'copd', drug: 'Prednisolone', route: 'PO', dose: '30-40 mg', frequency: 'OD', duration: '5-7 days (no taper needed)', contraindications: ['Systemic fungal infection', 'Active TB'], allergies: [], severity: 'moderate', alternativeIfAllergy: [], notes: 'For acute exacerbations. Do not taper if ≤7 days. Monitor blood glucose.' },
  { id: 'copd_antibiotics', diseaseId: 'copd', drug: 'Amoxicillin/Clavulanate', route: 'PO', dose: '875/125 mg', frequency: 'BID', duration: '5-7 days', contraindications: ['Penicillin allergy', 'Cholestatic jaundice'], allergies: ['Penicillin allergy'], severity: 'moderate', alternativeIfAllergy: ['Doxycycline 100 mg PO BID', 'Cefuroxime 500 mg PO BID'], notes: 'For exacerbations with increased sputum purulence AND volume/dyspnea (Anthropis criteria).' },
]

export const COPD_NURSING: NursingProtocol[] = [{
  id: 'copd_nursing',
  diseaseId: 'copd',
  severity: 'moderate',
  monitoring: [
    { id: 'copd_ns_spo2', parameter: 'SpO2', frequency: 'Continuous if acute, Q4H if stable', target: '88-92% (COPD patients may not correct to >94%)', notes: 'Target lower range — avoid hyperoxia (can suppress hypoxic drive)' },
    { id: 'copd_ns_rr', parameter: 'Respiratory Rate and Pattern', frequency: 'Q4H (Q1H if acute)', notes: 'Prolonged expiration, accessory muscle use, pursed-lip breathing, tripod position' },
    { id: 'copd_ns_vitals', parameter: 'Vital Signs', frequency: 'Q4H' },
    { id: 'copd_ns_sputum', parameter: 'Sputum Character', frequency: 'Daily', notes: 'Colour, volume, consistency, purulence' },
    { id: 'copd_ns_o2_titration', parameter: 'Oxygen Titration', frequency: 'Continuous monitoring', notes: 'Target SpO2 88-92%. Titrate O2 to lowest flow that achieves target. ABG if deterioration.' },
  ],
  care: [
    { id: 'copd_care_position', parameter: 'Positioning', frequency: 'Q2H', notes: 'Upright / tripod position to optimize diaphragmatic excursion. Avoid supine.' },
    { id: 'copd_care_breathing', parameter: 'Breathing Techniques', frequency: 'PRN', notes: 'Pursed-lip breathing. Diaphragmatic breathing. Controlled coughing technique.' },
    { id: 'copd_care_inhaler', parameter: 'Inhaler Technique', frequency: 'Daily while admitted', notes: 'Teach proper inhaler technique. Use spacer for MDI. Nebulized if unable to coordinate.' },
    { id: 'copd_care_smoking', parameter: 'Smoking Cessation Counseling', frequency: 'During admission', notes: 'Single most effective intervention. Offer NRT during admission. Provide quitline referral.' },
    { id: 'copd_care_pulmonary_rehab', parameter: 'Pulmonary Rehabilitation Referral', frequency: 'Once stable', notes: 'Exercise training, education, psychosocial support. Reduces hospitalizations and improves QoL.' },
  ],
  escalation: [
    { id: 'copd_esc_hypercapnia', condition: 'Acute-on-chronic hypercapnic respiratory failure', threshold: 'PaCO2 >60 or rising, pH <7.30, SpO2 <88% on >5L O2, RR >30, exhaustion', action: 'NIV (BiPAP) assessment. ABG. ICU referral if NIV fails or contraindicated.', notify: ['Doctor', 'Respiratory team', 'ICU team'] },
    { id: 'copd_esc_exhaustion', condition: 'Respiratory muscle exhaustion', threshold: 'RR >35, paradoxical breathing, inability to complete sentences, PaCO2 rising, pH falling', action: 'ICU referral for possible intubation and mechanical ventilation.', notify: ['ICU team', 'Registrar', 'Consultant'] },
    { id: 'copd_esc_pneumothorax', condition: 'Pneumothorax (especially if on NIV)', threshold: 'Sudden deterioration, pleuritic pain, hyperresonance, tracheal deviation', action: 'Chest X-ray STAT. Needle decompression if tension. Chest tube insertion.', notify: ['Doctor', 'Surgery team'] },
  ],
}]

export const COPD_MONITORING: MonitoringProtocol[] = [{
  id: 'copd_monitoring',
  diseaseId: 'copd',
  severity: 'moderate',
  vitals: ['RR', 'HR', 'BP', 'SpO2', 'Temp'],
  vitalsFrequency: 'Q4H (Q1H if acute exacerbation)',
  urineOutput: false,
  fluidBalance: false,
  dailyWeight: false,
  painScore: false,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['SpO2 target 88-92%', 'ABG at baseline and if condition changes', 'Sputum character daily', 'NIV settings and tolerance (if applicable)', 'CAT (COPD Assessment Test) or mMRC dyspnea scale', 'Exacerbation frequency per year'],
}]

export const COPD_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'copd_sc_exercise', condition: 'copd', threshold: 'Stable COPD', action: 'Pulmonary rehabilitation program', details: 'Multidisciplinary program with exercise training, education, breathing retraining, and psychosocial support. 6-8 weeks minimum.', monitoring: '6-minute walk test. CAT score. Exacerbation frequency. QoL assessment.' },
  { id: 'copd_sc_smoking', condition: 'copd', threshold: 'Current smoker', action: 'Smoking cessation — highest impact intervention', details: 'Brief advice at every encounter. Pharmacotherapy (NRT, varenicline, bupropion). Refer to smoking cessation clinic.', monitoring: 'Cessation progress. Exacerbation rate. Lung function decline rate.' },
  { id: 'copd_sc_vaccination', condition: 'copd', threshold: 'All COPD patients', action: 'Influenza vaccine annually. Pneumococcal vaccine (PCV13 + PPSV23). COVID-19 vaccine.', details: 'Immunizations reduce exacerbation risk. Ensure up-to-date per Kenya EPI schedule.', monitoring: 'Vaccination record. Exacerbation rate.' },
  { id: 'copd_sc_long_term_o2', condition: 'copd', threshold: 'PaO2 <55 mmHg or SpO2 <88% on room air when stable', action: 'Assess for long-term oxygen therapy (LTOT)', details: 'LTOT ≥15h/day improves survival. Prescribe flow to achieve SpO2 88-92% at rest and during exertion/sleep. Reassess in 90 days.', monitoring: 'ABG or SpO2 at 90 days. Compliance. Flow rate adjustments.' },
]

// ══════════════════════════════════════════════════════════════════════
// CHRONIC KIDNEY DISEASE
// ══════════════════════════════════════════════════════════════════════

export const CKD_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'ckd_initial',
  label: 'CKD Initial / Routine Workup',
  diseaseId: 'ckd',
  severity: 'moderate',
  bedside: ['BP (seated/standing)', 'BMI', 'Pulse oximetry', 'ECG'],
  laboratory: ['U&E / Creatinine (eGFR)', 'FBC', 'Urinalysis', 'Urine protein/creatinine ratio', 'CRP', 'HbA1c (if diabetic)'],
  imaging: ['Renal ultrasound'],
  microbiology: [],
  conditional: {
    if_severe: ['ABG (metabolic acidosis screen)', 'Serum calcium, phosphate, PTH (CKD-MBD workup)', 'Iron studies (anemia workup)', 'Vitamin D levels'],
    if_rapid_decline: ['Autoimmune serology (ANA, ANCA, anti-GBM)', 'Complement levels (C3, C4)', 'Myeloma screen (SPEP, UPEP)', 'Renal biopsy assessment'],
    if_diabetes: ['HbA1c', 'Urine ACR', 'Fundoscopy'],
    if_hypertension: ['Fundoscopy', 'Echocardiogram'],
    if_hiv: ['CD4 count', 'HIV viral load', 'Urine ACR'],
    if_anemia: ['Iron studies (ferritin, TIBC, %sat)', 'B12, folate', 'EPO level'],
  },
}]

export const CKD_MEDICATIONS: MedicationProtocol[] = [
  { id: 'ckd_ace_i', diseaseId: 'ckd', drug: 'Enalapril / Ramipril (ACE inhibitor)', route: 'PO', dose: 'Enalapril 2.5-10 mg BID or Ramipril 2.5-10 mg OD', frequency: 'OD-BID', duration: 'Long-term', contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'K+ >5.5', 'Previous angioedema'], allergies: ['ACE-i cough'], severity: 'moderate', alternativeIfAllergy: ['ARB: Losartan 25-100 mg PO OD'], notes: 'First-line for proteinuric CKD. Reduces progression. Monitor K+ and creatinine at 1-2 weeks after start/titration.' },
  { id: 'ckd_sglt2i', diseaseId: 'ckd', drug: 'Dapagliflozin / Empagliflozin (SGLT2i)', route: 'PO', dose: '10 mg OD', frequency: 'OD', duration: 'Long-term', contraindications: ['Type 1 DM', 'eGFR <25 (dapagliflozin) / <30 (empagliflozin)'], allergies: [], severity: 'moderate', alternativeIfAllergy: [], notes: 'Renoprotective independent of glycemic effect. Reduces CKD progression, HF hospitalization. Monitor for euglycemic DKA.' },
  { id: 'ckd_loop_diuretic', diseaseId: 'ckd', drug: 'Furosemide', route: 'PO/IV', dose: '40-160 mg (higher doses needed in CKD)', frequency: 'OD-TID', duration: 'As needed for volume overload', contraindications: ['Anuria', 'Severe electrolyte depletion'], allergies: ['Sulfa allergy (possible cross)'], severity: 'moderate', alternativeIfAllergy: ['Bumetanide 1-4 mg PO/IV'], notes: 'For volume overload / HTN in CKD. Requires higher doses due to reduced tubular secretion.' },
  { id: 'ckd_erythropoietin', diseaseId: 'ckd', drug: 'Epoetin alfa (EPO)', route: 'SC', dose: '50-100 IU/kg', frequency: '3x/week', duration: 'Long-term (titrate to Hb 10-12 g/dL)', contraindications: ['Uncontrolled HTN', 'Pure red cell aplasia', 'History of thromboembolism'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['Darbepoetin alfa 0.45 mcg/kg weekly'], notes: 'For anemia of CKD (Hb <10, iron replete). Target Hb 10-12 g/dL. Do NOT exceed Hb 13 (CV risk).' },
  { id: 'ckd_sevelamer', diseaseId: 'ckd', drug: 'Sevelamer Carbonate (phosphate binder)', route: 'PO', dose: '800-1600 mg', frequency: 'TID with meals', duration: 'Long-term', contraindications: ['Bowel obstruction', 'Hypophosphatemia'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['Calcium acetate 667-1334 mg TID with meals'], notes: 'For CKD-MBD. Lower serum phosphate. Avoid calcium-based binders if hypercalcemia or adynamic bone.' },
  { id: 'ckd_vitamin_d', diseaseId: 'ckd', drug: 'Calcitriol (active Vitamin D)', route: 'PO', dose: '0.25-0.5 mcg', frequency: 'OD', duration: 'Long-term', contraindications: ['Hypercalcemia', 'Hyperphosphatemia'], allergies: [], severity: 'mild', alternativeIfAllergy: ['Paricalcitol 1-2 mcg PO OD'], notes: 'For CKD stages 3-5 with low Vitamin D, secondary hyperparathyroidism. Monitor Ca, PO4, PTH q3-6 months.' },
]

export const CKD_NURSING: NursingProtocol[] = [{
  id: 'ckd_nursing',
  diseaseId: 'ckd',
  severity: 'moderate',
  monitoring: [
    { id: 'ckd_ns_bp', parameter: 'Blood Pressure', frequency: 'Q6H (seated and standing)', target: '<130/80 mmHg', notes: 'Orthostatic BP — assess for volume depletion' },
    { id: 'ckd_ns_io', parameter: 'Strict Intake & Output', frequency: 'Q8H', notes: 'Daily weights. Fluid restriction if oliguric / edematous.' },
    { id: 'ckd_ns_weight', parameter: 'Daily Weight', frequency: 'Daily (before breakfast, after voiding)', notes: 'Weight gain >1 kg/day suggests fluid overload' },
    { id: 'ckd_ns_oedema', parameter: 'Oedema Assessment (peripheral, sacral, periorbital)', frequency: 'Daily', notes: '0-3+ pitting scale. Assess for pulmonary edema (crackles, dyspnea).' },
    { id: 'ckd_ns_ue', parameter: 'U&E / Creatinine (review daily)', frequency: 'Per order', notes: 'Monitor K+, Na+, creatinine, eGFR trend. ECG if K+ >6.0.' },
  ],
  care: [
    { id: 'ckd_care_diet', parameter: 'Renal Diet', frequency: 'Ongoing', notes: 'Renal dietitian referral. Low sodium (<2g/day), controlled K+ and PO4 based on levels. Protein restriction (0.6-0.8 g/kg if non-dialysis).' },
    { id: 'ckd_care_med_adherence', parameter: 'Medication Adherence', frequency: 'Daily', notes: 'Review all medications. Avoid nephrotoxins (NSAIDs, aminoglycosides, contrast). Adjust doses for eGFR.' },
    { id: 'ckd_care_access', parameter: 'Vascular Access Preservation (if CKD 4-5)', frequency: 'Ongoing', notes: 'Protect arm veins for future AV fistula. No IV lines or BP in dominant arm if AV fistula planned. Refer for fistula creation when eGFR <20.' },
    { id: 'ckd_care_rrt_education', parameter: 'RRT Education', frequency: 'When eGFR <25', notes: 'Educate on dialysis options (hemodialysis, peritoneal dialysis) and transplantation. Support shared decision-making.' },
    { id: 'ckd_care_symptoms', parameter: 'Uremic Symptom Assessment', frequency: 'Daily', notes: 'Nausea, pruritus, fatigue, cognitive changes, anorexia, metallic taste. Report to nephrologist.' },
  ],
  escalation: [
    { id: 'ckd_esc_hyperkalemia', condition: 'Severe hyperkalemia', threshold: 'K+ >6.5 or >6.0 with ECG changes', action: 'ECG STAT. Calcium gluconate for cardiac protection. Insulin + dextrose. Albuterol neb. Kayexalate. Dialysis assessment.', notify: ['Doctor', 'Nephrology', 'ICU team'] },
    { id: 'ckd_esc_fluid_overload', condition: 'Acute pulmonary edema', threshold: 'SpO2 <90% with crackles, JVP elevated, respiratory distress', action: 'Semi-upright. O2. IV furosemide (higher dose). Nitrates if BP elevated. Dialysis if refractory.', notify: ['Doctor', 'Nephrology'] },
    { id: 'ckd_esc_uremic', condition: 'Uremic syndrome', threshold: 'Pericarditis, encephalopathy, bleeding diathesis', action: 'Urgent nephrology review for RRT initiation. Assess for uremic pericarditis (echo).', notify: ['Nephrology', 'Doctor'] },
    { id: 'ckd_esc_acidosis', condition: 'Severe metabolic acidosis', threshold: 'pH <7.2, HCO3 <12', action: 'Assess for urgent dialysis. IV sodium bicarbonate (slowly, careful with fluid overload).', notify: ['Nephrology', 'Doctor', 'ICU team'] },
  ],
}]

export const CKD_MONITORING: MonitoringProtocol[] = [{
  id: 'ckd_monitoring',
  diseaseId: 'ckd',
  severity: 'moderate',
  vitals: ['BP (seated + standing)', 'HR', 'RR', 'Temp', 'SpO2'],
  vitalsFrequency: 'Q6H (Q1H if acute complication)',
  urineOutput: true,
  urineOutputFrequency: 'Q8H (Q1H if oliguric)',
  fluidBalance: true,
  dailyWeight: true,
  painScore: false,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['eGFR and creatinine with each lab', 'K+, Na+, Ca, PO4, HCO3 daily if unstable', 'Hb and iron studies monthly (for anemia management)', 'PTH and Vitamin D q6 months (CKD-MBD)', 'ECG if K+ >5.5', 'AV fistula assessment (thrill, bruit, signs of infection)'],
}]

// ══════════════════════════════════════════════════════════════════════
// SEPSIS
// ══════════════════════════════════════════════════════════════════════

export const SEPSIS_DISEASE_KNOWLEDGE: DiseaseKnowledge[] = [{
  id: 'sepsis',
  name: 'Sepsis / Septic Shock',
  mechanisms: ['systemic_inflammatory_response', 'bacteremia'],
  epidemiology: ['Leading cause of death worldwide (~11 million deaths/year)', '~50 million cases annually globally', 'Mortality 15-30% for sepsis, >40% for septic shock', 'Highest burden in sub-Saharan Africa and South Asia', 'Accounts for 20% of all deaths globally', 'Increasing incidence due to aging, immunosuppression, resistant organisms'],
  riskFactors: ['Extremes of age (<1, >65)', 'Immunosuppression (HIV, cancer, chemotherapy, steroids)', 'Diabetes mellitus', 'Chronic organ disease (CKD, COPD, cirrhosis)', 'Indwelling devices (catheters, lines, tubes)', 'Recent surgery or trauma', 'Burns', 'Prolonged hospitalization', 'Antibiotic resistance / prior antibiotic use', 'Malnutrition', 'Pregnancy / postpartum'],
  pathophysiology: 'Sepsis is life-threatening organ dysfunction caused by a dysregulated host response to infection. Pathogen-associated molecular patterns (PAMPs) and damage-associated molecular patterns (DAMPs) activate innate immune receptors (TLRs, NLRs), triggering massive cytokine release (TNF-α, IL-1, IL-6). This causes endothelial dysfunction, microvascular thrombosis, vasodilation, myocardial depression, and cellular metabolic derangement. Organ dysfunction results from tissue hypoperfusion, mitochondrial failure, and apoptosis.',
  diagnosticCriteria: ['Suspected or confirmed infection', 'qSOFA ≥2: altered mental status, RR ≥22, SBP ≤100', 'SOFA score ≥2 (includes respiratory, coagulation, liver, cardiovascular, CNS, renal)', 'Lactate >2 mmol/L indicates tissue hypoperfusion', 'Septic shock: sepsis + vasopressor requirement to maintain MAP ≥65 + lactate >2 despite adequate fluid resuscitation', 'SIRS criteria (older, less specific): fever/hypothermia, tachycardia, tachypnea, WBC abnormal'],
  differentials: ['Cardiogenic shock (low cardiac output, high filling pressures)', 'Hypovolemic shock (hemorrhage, dehydration, burns)', 'Obstructive shock (PE, tamponade, tension pneumothorax)', 'Distributive shock other than sepsis (anaphylaxis, spinal, adrenal crisis)', 'Pancreatitis (SIRS without infection)', 'Pulmonary embolism', 'Myocardial infarction with cardiogenic shock', 'Anaphylaxis', 'Adrenal crisis', 'Thyroid storm'],
  severityScoring: ['qSOFA: quick bedside screen (≥2 = higher mortality)', 'SOFA score: 0-24 points, quantifies organ dysfunction', 'APACHE II: ICU mortality prediction', 'Lactate: ≥2 (mild), ≥4 (severe tissue hypoperfusion)', 'Mortality in Emergency Department Sepsis (MEDS) score'],
  complications: ['Septic shock (vasopressor-dependent hypotension)', 'ARDS (acute respiratory distress syndrome)', 'Acute kidney injury (50-60% of septic shock)', 'DIC (disseminated intravascular coagulation)', 'Multi-organ dysfunction syndrome (MODS)', 'Stress cardiomyopathy / myocardial depression', 'Adrenal insufficiency (relative)', 'Ileus / GI dysfunction', 'Critical illness polyneuropathy/myopathy', 'Post-sepsis syndrome (cognitive, physical, psychological deficits)', 'Amputation (from purpura fulminans, peripheral ischemia)'],
  references: ['Surviving Sepsis Campaign Guidelines (2022)', 'Sepsis-3 Definitions (JAMA 2016)', 'Kenya National Sepsis Guidelines', 'WHO Sepsis Clinical Care Improvement'],
}]

export const SEPSIS_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'sepsis_initial',
  label: 'Sepsis Initial Workup (1-Hour Bundle)',
  diseaseId: 'sepsis',
  severity: 'severe',
  bedside: ['Pulse oximetry continuous', 'ECG', 'Blood glucose', 'Lactate (venous or arterial)', 'qSOFA assessment'],
  laboratory: ['Blood culture x2 (from different sites, before antibiotics)', 'FBC with differential', 'CRP', 'PCT', 'Lactate', 'U&E / Creatinine', 'LFTs', 'Coagulation profile', 'ABG (with lactate)', 'Blood group and cross-match'],
  imaging: ['Chest X-ray (source identification)', 'Ultrasound (Focused: cardiac, IVC, abdomen)'],
  microbiology: ['Urinalysis / urine culture', 'Sputum culture (if respiratory source)', 'CSF analysis (if CNS source suspected)', 'Wound culture (if wound source)'],
  conditional: {
    if_ventilated: ['BAL / mini-BAL', 'ET aspirate culture'],
    if_shock: ['Echocardiogram', 'Serial lactate q2h', 'CVP monitoring', 'ScvO2 monitoring'],
    if_renal_failure: ['Renal ultrasound', 'Urine electrolytes'],
    if_dic: ['D-dimer', 'Fibrinogen', 'Peripheral smear for schistocytes'],
    if_source_unknown: ['CT abdomen/pelvis', 'Echocardiogram (endocarditis screen)'],
  },
}]

export const SEPSIS_MEDICATIONS: MedicationProtocol[] = [
  { id: 'sepsis_abx_broad', diseaseId: 'sepsis', drug: 'Piperacillin/Tazobactam', route: 'IV', dose: '4.5 g', frequency: 'Q6H', duration: '7-14 days (source-dependent)', contraindications: ['Penicillin anaphylaxis'], allergies: ['Penicillin allergy'], severity: 'severe', alternativeIfAllergy: ['Meropenem 1 g IV Q8H'], notes: 'Administer within 1 hour of sepsis recognition. Extended infusion (4h) preferred.' },
  { id: 'sepsis_abx_plus', diseaseId: 'sepsis', drug: 'Vancomycin', route: 'IV', dose: '15-20 mg/kg', frequency: 'Q8-12H', duration: '7-14 days', contraindications: ['Red man syndrome', 'Severe renal impairment (adjust)'], allergies: [], severity: 'severe', alternativeIfAllergy: ['Linezolid 600 mg IV Q12H'], notes: 'Add for MRSA coverage. Trough monitoring: 15-20 mcg/mL. Adjust for renal function.' },
  { id: 'sepsis_norepinephrine', diseaseId: 'sepsis', drug: 'Norepinephrine', route: 'IV', dose: '0.05-0.5 mcg/kg/min', frequency: 'Continuous infusion', duration: 'Until MAP ≥65 sustained off pressors', contraindications: ['Hypovolemia (correct volume first)'], allergies: [], severity: 'severe', alternativeIfAllergy: ['Vasopressin 0.03 U/min'], notes: 'First-line vasopressor. Titrate to MAP ≥65. Insert arterial line for continuous BP monitoring.' },
  { id: 'sepsis_dobutamine', diseaseId: 'sepsis', drug: 'Dobutamine', route: 'IV', dose: '2.5-20 mcg/kg/min', frequency: 'Continuous infusion', duration: 'Until cardiac function improves', contraindications: ['HOCM', 'Severe hypertension'], allergies: [], severity: 'severe', alternativeIfAllergy: ['Epinephrine 0.01-0.1 mcg/kg/min'], notes: 'Add if myocardial dysfunction (low ScvO2, elevated lactate, clinical hypoperfusion despite MAP >65).' },
  { id: 'sepsis_hydrocortisone', diseaseId: 'sepsis', drug: 'Hydrocortisone', route: 'IV', dose: '200 mg/day', frequency: '50 mg Q6H or continuous infusion', duration: 'Until vasopressor weaned', contraindications: ['Active GI bleeding (relative)'], allergies: [], severity: 'severe', alternativeIfAllergy: [], notes: 'Consider if vasopressor-dependent despite adequate fluid resuscitation (refractory shock). May improve vasopressor weaning.' },
]

export const SEPSIS_NURSING: NursingProtocol[] = [{
  id: 'sepsis_nursing',
  diseaseId: 'sepsis',
  severity: 'severe',
  monitoring: [
    { id: 'sep_ns_vitals', parameter: 'Vital Signs (HR, BP, RR, SpO2, Temp)', frequency: 'Q15min until stable then Q1H', target: 'MAP ≥65, HR <120, SpO2 >94%' },
    { id: 'sep_ns_lactate', parameter: 'Lactate Clearance', frequency: 'Q2H until <2 or falling', target: '>10% reduction per hour', notes: 'Lactate clearance is primary resuscitation endpoint' },
    { id: 'sep_ns_urine', parameter: 'Urine Output', frequency: 'Q1H', target: '>0.5 mL/kg/h' },
    { id: 'sep_ns_gcs', parameter: 'Level of Consciousness (GCS)', frequency: 'Q1H' },
    { id: 'sep_ns_spo2', parameter: 'SpO2', frequency: 'Continuous', target: '>94%' },
    { id: 'sep_ns_abg', parameter: 'ABG trends (pH, PaO2, PaCO2, lactate)', frequency: 'Q2-4H as clinically indicated' },
  ],
  care: [
    { id: 'sep_care_abx', parameter: 'Antibiotic Administration', frequency: 'Within 1 hour STAT', notes: 'Blood cultures FIRST, then antibiotics. Time zero documented. Do NOT delay if cultures difficult.' },
    { id: 'sep_care_fluids', parameter: 'IV Fluid Resuscitation', frequency: 'Bolus protocol', notes: '30 mL/kg crystalloid within 3h. Reassess after each bolus (BP, lactate, lung auscultation). Switch to vasopressors if fluid-refractory.' },
    { id: 'sep_care_lines', parameter: 'Lines and Monitoring', frequency: 'As placed', notes: 'Arterial line for continuous BP. Central line for vasopressors and CVP. Second IV/IO access.' },
    { id: 'sep_care_sepsis_bundle', parameter: 'Sepsis 1-Hour Bundle Compliance', frequency: 'Document within 1 hour', notes: 'Measure lactate. Obtain blood cultures. Administer broad-spectrum antibiotics. Begin 30 mL/kg crystalloid. Apply vasopressors if hypotensive during/after fluids.' },
    { id: 'sep_care_source', parameter: 'Source Control Assessment', frequency: 'Within 6 hours', notes: 'Identify and control source: remove infected catheters, drain abscess, debride necrotic tissue. Surgical consult if needed.' },
    { id: 'sep_care_family', parameter: 'Family Communication', frequency: 'Daily and with significant changes', notes: 'Explain sepsis diagnosis, treatment plan, expected course. Update on organ failure status.' },
  ],
  escalation: [
    { id: 'sep_esc_persistent_shock', condition: 'Persistent shock despite fluids', threshold: 'MAP <65 after 30 mL/kg crystalloid', action: 'Start norepinephrine. Insert arterial line. Consider central line. ICU team at bedside.', notify: ['ICU team', 'Doctor', 'Consultant'] },
    { id: 'sep_esc_refractory', condition: 'Refractory septic shock', threshold: 'Norepinephrine >0.5 mcg/kg/min with MAP <65', action: 'Add vasopressin. Consider dobutamine if low cardiac output. Assess for adrenal insufficiency — give hydrocortisone.', notify: ['ICU team', 'Intensivist', 'Consultant'] },
    { id: 'sep_esc_aki', condition: 'Acute kidney injury', threshold: 'Oliguria <0.5 mL/kg/h x6h despite resuscitation or creatinine doubling', action: 'Nephrology review. Assess for RRT. Fluid balance optimization.', notify: ['Nephrology', 'ICU team'] },
    { id: 'sep_esc_ards', condition: 'ARDS', threshold: 'PaO2/FiO2 <200 with bilateral infiltrates', action: 'Lung-protective ventilation (TV 6 mL/kg PBW, plateau <30). Prone positioning if PaO2/FiO2 <150. Consider ECMO referral.', notify: ['Respiratory therapy', 'ICU team', 'Consultant'] },
  ],
}]

export const SEPSIS_MONITORING: MonitoringProtocol[] = [{
  id: 'sepsis_monitoring',
  diseaseId: 'sepsis',
  severity: 'severe',
  vitals: ['HR (continuous)', 'BP (arterial line continuous)', 'RR', 'SpO2 continuous', 'Temp Q1H', 'CVP (if central line)', 'ScvO2 (if available)'],
  vitalsFrequency: 'Q15min until stable then Q1H',
  urineOutput: true,
  urineOutputFrequency: 'Q1H',
  fluidBalance: true,
  dailyWeight: true,
  painScore: true,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['Lactate Q2H until <2', 'ABG Q4-6H', 'Chest X-ray daily', 'Procalcitonin daily (antibiotic stewardship)', 'Cultures at 48h if no response', 'Organ function panel daily (LFTs, coags, creatinine, bilirubin)', 'Ventilator settings Q1H if intubated', 'SOFA score daily'],
}]

export const SEPSIS_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'sep_sc_fluids', condition: 'sepsis', threshold: 'Sepsis with hypoperfusion (lactate >2 or hypotension)', action: 'IV crystalloid 30 mL/kg within 3 hours', details: 'Use balanced crystalloids (Ringer lactate, Plasmalyte) if available. Reassess volume status after each 500-1000 mL. Use dynamic measures (IVC collapsibility, PLR, passive leg raise) to guide ongoing fluids.', monitoring: 'Lactate clearance. Urine output. MAP. Lung auscultation for crackles (sign of fluid overload).' },
  { id: 'sep_sc_oxygen', condition: 'sepsis', threshold: 'SpO2 <94% or respiratory distress', action: 'Oxygen therapy — titrate to SpO2 ≥94%', details: 'Start nasal prongs 2-5 L/min. Escalate to face mask, NRB, or NIV as needed. Target SpO2 94-98%. ABG if deterioration.', monitoring: 'SpO2 continuous. ABG if worsening. Respiratory rate and pattern.' },
  { id: 'sep_sc_nutrition', condition: 'sepsis', threshold: 'ICU stay >48h', action: 'Early enteral nutrition within 24-48h of ICU admission', details: 'NG feeding if unable to take PO. Trophic feeds (10-20 mL/h) initially. Advance as tolerated. Avoid PN unless contraindicated.', monitoring: 'Gastric residual volume. Bowel sounds. Tolerance of feeds.' },
  { id: 'sep_sc_dvt', condition: 'sepsis', threshold: 'All sepsis patients', action: 'VTE prophylaxis — LMWH (enoxaparin 40 mg SC OD)', details: 'Start within 24h unless contraindicated (active bleeding, coagulopathy, platelets <50). Use mechanical prophylaxis if contraindicated.', monitoring: 'Signs of bleeding daily. Platelet count. Signs of DVT (asymmetric leg swelling).' },
  { id: 'sep_sc_glycemic', condition: 'sepsis', threshold: 'BG >10 mmol/L', action: 'Insulin infusion protocol (target BG 6-10 mmol/L)', details: 'Avoid hypoglycemia (<4 mmol/L). Use validated insulin infusion protocol. Monitor BG Q1-2H.', monitoring: 'BG Q1H. Potassium Q4-6H. Watch for hypoglycemia.' },
]

export const SEPSIS_ISOLATION: IsolationProtocol[] = [{
  id: 'isolation_sepsis_standard',
  diseaseId: 'sepsis',
  type: 'standard',
  ppe: ['Gloves', 'Gown for contact with body fluids', 'Face shield if splash risk'],
  roomType: 'ICU bed or monitored bed. Single room if source is drug-resistant organism.',
  patientTransport: 'Limited to essential only. Inform receiving area of infection status.',
  duration: 'Duration of hospitalization + additional precautions per identified organism',
  disinfection: ['Standard precautions', 'Enhanced cleaning of high-touch surfaces', 'Hand hygiene before and after contact', 'Contact/droplet/airborne per identified organism'],
}]

// ══════════════════════════════════════════════════════════════════════
// ACUTE BRONCHITIS
// ══════════════════════════════════════════════════════════════════════

export const BRONCHITIS_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'bronchitis_initial',
  label: 'Acute Bronchitis Workup',
  diseaseId: 'bronchitis',
  severity: 'mild',
  bedside: ['Pulse oximetry', 'Temperature'],
  laboratory: ['CRP (if needed to rule out pneumonia)', 'CBC (if symptoms severe or prolonged)'],
  imaging: ['Chest X-ray (only if: suspicion of pneumonia, >65y, fever >38°C, RR >24, HR >100)'],
  microbiology: [],
  conditional: {
    if_prolonged: ['Pertussis PCR', 'Chest X-ray', 'Spirometry (if recurrent)'],
    if_severe: ['Chest X-ray', 'CRP', 'CBC', 'Sputum culture'],
    if_wheezing: ['Peak flow measurement', 'Spirometry (if available)'],
  },
}]

export const BRONCHITIS_MEDICATIONS: MedicationProtocol[] = [
  { id: 'bronchitis_symptomatic', diseaseId: 'bronchitis', drug: 'Supportive care only — antibiotics NOT routinely indicated', route: 'PO', dose: 'N/A', frequency: 'N/A', duration: 'Self-limited (7-14 days)', contraindications: [], allergies: [], severity: 'mild', alternativeIfAllergy: [], notes: 'Cough resolves in 2-3 weeks. Mucolytics/antitussives not routinely recommended. Avoid antibiotics in uncomplicated acute bronchitis.' },
  { id: 'bronchitis_analgesic', diseaseId: 'bronchitis', drug: 'Paracetamol or Ibuprofen', route: 'PO', dose: '1 g Q6H PRN or 400 mg TID PRN', frequency: 'PRN', duration: 'As needed', contraindications: [], allergies: [], severity: 'mild', alternativeIfAllergy: [], notes: 'For fever and chest discomfort. Bronchitis is typically viral (90%) — antibiotics do not improve outcomes.' },
  { id: 'bronchitis_inhaled_bd', diseaseId: 'bronchitis', drug: 'Salbutamol inhaler', route: 'INH', dose: '100-200 mcg', frequency: 'Q4-6H PRN', duration: 'As needed for cough/wheeze', contraindications: ['Tachyarrhythmia'], allergies: [], severity: 'mild', alternativeIfAllergy: ['Ipratropium 20-40 mcg INH Q6H PRN'], notes: 'Benefit limited to patients with wheezing or underlying airway hyperreactivity. Not routine.' },
  { id: 'bronchitis_antibiotics', diseaseId: 'bronchitis', drug: 'Amoxicillin/Clavulanate or Doxycycline', route: 'PO', dose: '875/125 mg BID or 100 mg BID', frequency: 'BID', duration: '5-7 days', contraindications: ['Penicillin allergy (for amox/clav)'], allergies: ['Penicillin allergy'], severity: 'mild', alternativeIfAllergy: ['Azithromycin 500 mg PO OD x5d'], notes: 'Only if pertussis suspected or COPD exacerbation. NOT indicated for routine acute bronchitis.' },
]

export const BRONCHITIS_NURSING: NursingProtocol[] = [{
  id: 'bronchitis_nursing',
  diseaseId: 'bronchitis',
  severity: 'mild',
  monitoring: [
    { id: 'bronc_ns_temp', parameter: 'Temperature', frequency: 'Q8H', target: '<38°C' },
    { id: 'bronc_ns_cough', parameter: 'Cough frequency and character', frequency: 'Daily', notes: 'Assess for progression to purulent sputum or hemoptysis' },
    { id: 'bronc_ns_spo2', parameter: 'SpO2', frequency: 'Q8H', target: '>95%' },
  ],
  care: [
    { id: 'bronc_care_rest', parameter: 'Rest and Hydration', frequency: 'Ongoing', notes: 'Encourage oral fluids 2-3 L/day. Rest until fever resolves.' },
    { id: 'bronc_care_education', parameter: 'Patient Education', frequency: 'Once', notes: 'Explain viral etiology. Cough may last 2-3 weeks. Antibiotics not helpful. Return if worsening (fever, dyspnea, hemoptysis).' },
    { id: 'bronc_care_humidify', parameter: 'Humidified Air / Steam', frequency: 'PRN', notes: 'May soothe cough. Honey (≥1 year old) for nocturnal cough.' },
  ],
  escalation: [
    { id: 'bronc_esc_pneumonia', condition: 'Suspected pneumonia', threshold: 'Fever >38.5 >3 days, RR >24, SpO2 <92%, focal chest signs', action: 'Chest X-ray. Assess CURB-65. Consider pneumonia protocol.', notify: ['Doctor'] },
  ],
}]

export const BRONCHITIS_MONITORING: MonitoringProtocol[] = [{
  id: 'bronchitis_monitoring',
  diseaseId: 'bronchitis',
  severity: 'mild',
  vitals: ['Temp', 'RR', 'SpO2'],
  vitalsFrequency: 'Q8H',
  urineOutput: false,
  fluidBalance: false,
  dailyWeight: false,
  painScore: false,
  consciousness: false,
  oxygenMonitoring: false,
  special: ['Symptom diary (cough severity, sputum, fever)', 'RESP score (if needed for antibiotic decision)'],
}]

export const BRONCHITIS_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'bronc_sc_rest', condition: 'bronchitis', threshold: 'All patients', action: 'Rest, hydration, humidified air', details: 'Encourage increased oral fluids. Use humidifier or steam inhalation. Avoid smoke and irritants.', monitoring: 'Symptom progression. Fever curve. Cough severity.' },
  { id: 'bronc_sc_analgesia', condition: 'bronchitis', threshold: 'Fever or chest discomfort', action: 'Antipyretics/analgesics as needed', details: 'Paracetamol 1 g Q6H PRN or ibuprofen 400 mg TID PRN for fever and myalgias. Avoid aspirin in children (Reye).', monitoring: 'Fever response. Symptom relief.' },
]

// ══════════════════════════════════════════════════════════════════════
// DENGUE FEVER
// ══════════════════════════════════════════════════════════════════════

export const DENGUE_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'dengue_initial',
  label: 'Dengue Fever Workup',
  diseaseId: 'dengue',
  severity: 'moderate',
  bedside: ['Pulse oximetry', 'Temperature', 'Tourniquet test (positive in 70% of dengue)', 'Capillary refill', 'Blood pressure (lying + standing)'],
  laboratory: ['FBC (daily minimum — monitor HCT and platelets)', 'CRP', 'U&E / Creatinine', 'LFTs', 'Dengue NS1 antigen (first 5 days)', 'Dengue IgM/IgG (after day 5)'],
  imaging: [],
  microbiology: [],
  conditional: {
    if_severe: ['ABG', 'Lactate', 'Coagulation profile', 'Chest X-ray (pleural effusion)', 'Abdominal ultrasound (gallbladder wall thickening, ascites)', 'Echocardiogram (myocarditis)'],
    if_warning_signs: ['HCT q4-6H', 'Platelet count q12H', 'Blood glucose q6H'],
    if_shock: ['Blood culture', 'Lactate', 'ECHO', 'Blood group and cross-match'],
  },
}]

export const DENGUE_MEDICATIONS: MedicationProtocol[] = [
  { id: 'dengue_paracetamol', diseaseId: 'dengue', drug: 'Paracetamol', route: 'PO/IV', dose: '1 g (adults), 15 mg/kg (children)', frequency: 'Q6H PRN', duration: 'Max 4 g/day', contraindications: ['Severe hepatic impairment'], allergies: [], severity: 'mild', alternativeIfAllergy: [], notes: 'ONLY antipyretic. AVOID NSAIDs (bleeding risk), AVOID aspirin (Reye syndrome, bleeding).' },
  { id: 'dengue_iv_fluids', diseaseId: 'dengue', drug: 'Isotonic crystalloids (NS, Ringer lactate)', route: 'IV', dose: 'Maintenance + boluses as needed', frequency: 'Per protocol', duration: 'Until oral intake adequate', contraindications: ['Fluid overload (once critical phase resolved)'], allergies: [], severity: 'moderate', alternativeIfAllergy: [], notes: 'Conservative IV fluids during critical phase (day 3-7). Avoid overhydration — contributes to pleural effusion/respiratory distress. Crystalloids first-line; colloids (starch) contraindicated.' },
  { id: 'dengue_blood_transfusion', diseaseId: 'dengue', drug: 'Packed RBC transfusion', route: 'IV', dose: '10-20 mL/kg', frequency: 'PRN', duration: 'Per response', contraindications: ['Not for prophylactic transfusion'], allergies: [], severity: 'severe', alternativeIfAllergy: [], notes: 'Transfuse only for: Hb/HCT drop (not hemoconcentration), or active bleeding with hypovolemia. NOT prophylactic (platelet transfusion not indicated).' },
]

export const DENGUE_NURSING: NursingProtocol[] = [{
  id: 'dengue_nursing',
  diseaseId: 'dengue',
  severity: 'moderate',
  monitoring: [
    { id: 'den_ns_temp', parameter: 'Temperature', frequency: 'Q4H', target: '<38°C' },
    { id: 'den_ns_hct', parameter: 'HCT (hematocrit) trend', frequency: 'Daily (Q4-6H in critical phase)', notes: 'Rising HCT = plasma leakage. Drop = bleeding/blood loss' },
    { id: 'den_ns_platelets', parameter: 'Platelet count', frequency: 'Daily (Q12H if <50,000)', notes: 'Bleeding risk increases when <20,000' },
    { id: 'den_ns_vitals', parameter: 'Vitals (BP, HR, RR, SpO2)', frequency: 'Q4H (Q1-2H in critical phase)', notes: 'Narrow pulse pressure (<20 mmHg) = early shock' },
    { id: 'den_ns_bleeding', parameter: 'Bleeding assessment', frequency: 'Q4H', notes: 'Mucosal, skin (petechiae, ecchymosis), GI, menstrual. Assess for melena, hematemesis.' },
    { id: 'den_ns_urine', parameter: 'Urine output', frequency: 'Q8H (Q1-2H if shock)', target: '>1 mL/kg/h', notes: 'Oliguria suggests hypovolemia or renal impairment' },
    { id: 'den_ns_warning', parameter: 'Dengue Warning Signs Check', frequency: 'Q4H', notes: 'Watch for: severe abdominal pain, persistent vomiting, clinical fluid accumulation, mucosal bleed, lethargy/restlessness, hepatomegaly >2cm, increasing HCT with rapid platelet drop' },
  ],
  care: [
    { id: 'den_care_fluids', parameter: 'Fluid Management', frequency: 'Continuous monitoring', notes: 'Febrile phase (day 1-3): encourage oral fluids. Critical phase (day 3-7): cautious IV fluids, monitor for overload. Recovery phase (day 7-10): fluid restriction.' },
    { id: 'den_care_mosquito', parameter: 'Mosquito Precautions', frequency: 'Continuous', notes: 'Bed net during admission. Screen windows. Eliminate standing water. Notify infection control.' },
    { id: 'den_care_education', parameter: 'Patient and Family Education', frequency: 'Daily', notes: 'Explain phases. Teach warning signs. Emphasize NO NSAIDs/aspirin/ibuprofen. Return if bleeding, severe pain, or confusion.' },
  ],
  escalation: [
    { id: 'den_esc_shock', condition: 'Dengue shock syndrome', threshold: 'Pulse pressure <20 mmHg, hypotension for age, cool extremities, delayed CRT', action: 'IV fluid bolus 10-20 mL/kg over 1h. Reassess. Consider HCT to guide further fluids. ICU referral.', notify: ['Doctor', 'ICU team'] },
    { id: 'den_esc_bleeding', condition: 'Significant bleeding', threshold: 'Hematemesis, melena, heavy menstrual, mucosal bleeding, or dropping HCT', action: 'Cross-match. Transfuse if Hb drops. NOT platelet transfusion (unhelpful, may worsen). Surgical consult if GI bleed.', notify: ['Doctor', 'ICU team'] },
    { id: 'den_esc_fluid_overload', condition: 'Fluid overload / pulmonary edema', threshold: 'Respiratory distress, SpO2 <92%, crepitations, pleural effusion', action: 'Stop IV fluids. Diuretics (furosemide 0.5-1 mg/kg). Oxygen. ICU referral.', notify: ['Doctor', 'ICU team'] },
  ],
}]

export const DENGUE_MONITORING: MonitoringProtocol[] = [{
  id: 'dengue_monitoring',
  diseaseId: 'dengue',
  severity: 'moderate',
  vitals: ['Temp', 'HR', 'BP (including pulse pressure)', 'RR', 'SpO2'],
  vitalsFrequency: 'Q4H (Q1-2H in critical phase)',
  urineOutput: true,
  urineOutputFrequency: 'Q8H (Q1-2H if shock)',
  fluidBalance: true,
  dailyWeight: false,
  painScore: true,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['HCT daily (Q4-6H in critical phase)', 'Platelet count daily (Q12H if <50,000)', 'Tourniquet test on admission', 'Warning signs assessment each shift', 'Gallbladder ultrasound (if suspected plasma leakage)', 'LFTs if hepatomegaly or jaundice'],
}]

export const DENGUE_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'den_sc_fluids', condition: 'dengue', threshold: 'Febrile phase (day 1-3)', action: 'Encourage oral intake — oral rehydration solution or fruit juice', details: 'Target: adequate urine output. Avoid dark-colored drinks (may mimic GI bleed).', monitoring: 'Oral intake. Urine output. Warning signs.' },
  { id: 'den_sc_rest', condition: 'dengue', threshold: 'All dengue patients', action: 'Bed rest during febrile and critical phases', details: 'Minimize physical activity. Headache and myalgia common — use paracetamol only.', monitoring: 'Pain scores. Fever response to paracetamol.' },
  { id: 'den_sc_avoid_nsaids', condition: 'dengue', threshold: 'All patients — CRITICAL', action: 'ABSOLUTELY NO NSAIDs, aspirin, or ibuprofen. Increased bleeding risk.', details: 'Bleeding is a major complication. Only paracetamol is safe. Educate patient and family.', monitoring: 'Educate at every encounter. Monitor for signs of bleeding.' },
]

export const DENGUE_ISOLATION: IsolationProtocol[] = [{
  id: 'isolation_dengue_standard',
  diseaseId: 'dengue',
  type: 'standard',
  ppe: ['Gloves for blood/body fluid contact', 'Long sleeves (prevent mosquito transmission from patient to others)'],
  roomType: 'Standard bed with mosquito net. Screened windows.',
  patientTransport: 'No restrictions beyond mosquito precautions (net, long sleeves)',
  duration: 'Duration of fever (patient can infect mosquitoes ≤48h before and 5d after fever onset)',
  disinfection: ['Standard cleaning', 'Bed nets', 'Environmental mosquito control'],
}]

// ══════════════════════════════════════════════════════════════════════
// MIGRAINE / HEADACHE
// ══════════════════════════════════════════════════════════════════════

export const MIGRAINE_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'headache_initial',
  label: 'Headache / Migraine Workup',
  diseaseId: 'migraine',
  severity: 'mild',
  bedside: ['Full neurological examination', 'Fundoscopy (papilledema?', 'Blood pressure', 'Temperature'],
  laboratory: ['CBC', 'CRP (if concern for infection)'],
  imaging: ['CT head (non-contrast) if: sudden severe headache, focal signs, altered mental status, or atypical features'],
  microbiology: [],
  conditional: {
    if_red_flag_sudden: ['CT head STAT', 'LP (if CT negative, for SAH)', 'CTA/MRA if aneurysm suspected'],
    if_red_flag_focal: ['MRI brain with gadolinium', 'MR venogram (if CVT suspected)', 'EEG (if seizure)'],
    if_chronic_daily: ['MRI brain', 'ESR/CRP (giant cell arteritis if >50y)', 'Thyroid function', 'Vitamin D, B12, folate'],
    if_cluster: ['MRI brain (rule out pituitary/hypothalamic pathology)', 'High-resolution CT sinuses'],
    if_with_medication_overuse: ['Medication diary review', 'Gradual withdrawal plan'],
  },
}]

export const MIGRAINE_MEDICATIONS: MedicationProtocol[] = [
  { id: 'migraine_acute_mild', diseaseId: 'migraine', drug: 'Ibuprofen 400 mg + Domperidone 10 mg', route: 'PO', dose: '400 mg + 10 mg', frequency: 'Single dose, may repeat once', duration: 'Acute attack', contraindications: ['Peptic ulcer disease (ibuprofen)', 'GI obstruction (domperidone)'], allergies: [], severity: 'mild', alternativeIfAllergy: ['Paracetamol 1 g + Metoclopramide 10 mg'], notes: 'First-line for mild-moderate migraine. Take at first sign of attack.' },
  { id: 'migraine_acute_moderate', diseaseId: 'migraine', drug: 'Sumatriptan 50-100 mg', route: 'PO', dose: '50-100 mg PO or 6 mg SC', frequency: 'May repeat after 2h (max 200 mg/day PO, 12 mg/day SC)', duration: 'Acute attack', contraindications: ['Ischemic heart disease', 'Uncontrolled HTN', 'Hemiplegic migraine', 'Basilar migraine', 'Recent MAOI use'], allergies: ['Triptan allergy (rare)'], severity: 'moderate', alternativeIfAllergy: ['Rizatriptan 10 mg wafer', 'Zolmitriptan 2.5-5 mg IN'], notes: 'Most effective if taken early. SC sumatriptan is fastest (10-15 min onset).' },
  { id: 'migraine_preventive_propranolol', diseaseId: 'migraine', drug: 'Propranolol', route: 'PO', dose: '40-160 mg', frequency: 'OD-BID', duration: '6-12 months minimum', contraindications: ['Asthma', 'Heart block', 'Bradycardia', 'DM with hypoglycemia unawareness'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['Amitriptyline 10-50 mg PO nocte', 'Topiramate 25-100 mg PO OD'], notes: 'First-line preventive. Reduces attack frequency by ~50%. Start low, titrate slowly.' },
  { id: 'migraine_preventive_amitriptyline', diseaseId: 'migraine', drug: 'Amitriptyline', route: 'PO', dose: '10-50 mg', frequency: 'Nocte', duration: '6-12 months', contraindications: ['Recent MI', 'Heart block', 'BPH/glaucoma (relative)'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['Propranolol 40-160 mg OD', 'Topiramate 25-100 mg OD'], notes: 'Especially effective in migraine + tension overlap. Start 10 mg nocte, increase by 10 mg weekly.' },
]

export const MIGRAINE_NURSING: NursingProtocol[] = [{
  id: 'migraine_nursing',
  diseaseId: 'migraine',
  severity: 'moderate',
  monitoring: [
    { id: 'mig_ns_pain', parameter: 'Pain Score (0-10)', frequency: 'Q1H during acute attack', target: '<3/10', notes: 'Document location, quality (throbbing/pulsating, unilateral), aggravating factors' },
    { id: 'mig_ns_accompanying', parameter: 'Accompanying Symptoms', frequency: 'Per episode', notes: 'Nausea, vomiting, photophobia, phonophobia, aura (visual, sensory, motor)' },
    { id: 'mig_ns_triggers', parameter: 'Trigger log', frequency: 'Ongoing', notes: 'Identify: food triggers (cheese, chocolate, wine), missing meals, sleep deprivation, stress, menstruation, weather changes' },
  ],
  care: [
    { id: 'mig_care_environment', parameter: 'Environmental Management', frequency: 'During acute attack', notes: 'Dark quiet room. Dim lights. Reduce noise. Cool compress on forehead/neck.' },
    { id: 'mig_care_hydration', parameter: 'Hydration / Small Meals', frequency: 'Ongoing', notes: 'Sips of water to prevent dehydration (can worsen migraine). Avoid known trigger foods. Small frequent meals if nauseated.' },
    { id: 'mig_care_education', parameter: 'Patient Education', frequency: 'Once', notes: 'Write acute treatment plan. Discuss preventive options if ≥4 attacks/month or debilitating. Teach medication limits (risk of medication overuse headache).' },
    { id: 'mig_care_headache_diary', parameter: 'Headache Diary', frequency: 'Daily', notes: 'Record: date, time, severity, duration, triggers, medications used, response. Review at follow-up.' },
  ],
  escalation: [
    { id: 'mig_esc_status', condition: 'Status migrainosus', threshold: 'Attack >72h despite treatment', action: 'IV fluids. IV prochlorperazine 10 mg or metoclopramide 10 mg. IV valproate 500 mg. Consider IV dihydroergotamine (DHE).', notify: ['Doctor', 'Neurologist'] },
    { id: 'mig_esc_red_flag', condition: 'Headache red flag (secondary cause)', threshold: 'Sudden onset, worst ever, focal signs, fever, stiff neck, papilledema, altered consciousness', action: 'CT head STAT. LP if SAH suspect. Neurology/neurosurgery consult.', notify: ['Doctor', 'Neurologist', 'Neurosurgery'] },
  ],
}]

export const MIGRAINE_MONITORING: MonitoringProtocol[] = [{
  id: 'migraine_monitoring',
  diseaseId: 'migraine',
  severity: 'mild',
  vitals: ['BP', 'HR', 'Temp'],
  vitalsFrequency: 'Q6H',
  urineOutput: false,
  fluidBalance: false,
  dailyWeight: false,
  painScore: true,
  consciousness: true,
  oxygenMonitoring: false,
  special: ['Headache diary (frequency, severity, duration, triggers, medications)', 'Disability assessment (MIDAS or HIT-6)', 'Monthly attack frequency (to assess preventive response)'],
}]

export const MIGRAINE_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'mig_sc_lifestyle', condition: 'migraine', threshold: 'All migraine patients', action: 'Lifestyle modification: regular sleep, meals, exercise, hydration', details: 'Consistent sleep-wake schedule. Regular meals (don\'t skip). Limit caffeine and alcohol. Manage stress. Identify and avoid triggers.', monitoring: 'Headache diary. Attack frequency. Lifestyle adherence.' },
  { id: 'mig_sc_acute_plan', condition: 'migraine', threshold: 'All migraine patients', action: 'Written acute treatment action plan', details: 'Take medication at first sign. Limit acute medications to ≤10 days/month (prevent medication overuse). Know when to seek help.', monitoring: 'Acute medication use days per month. Responsiveness to treatment.' },
]

// ══════════════════════════════════════════════════════════════════════
// PERTUSSIS
// ══════════════════════════════════════════════════════════════════════

export const PERTUSSIS_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'pertussis_initial',
  label: 'Pertussis Workup',
  diseaseId: 'pertussis',
  severity: 'moderate',
  bedside: ['Pulse oximetry', 'Cough paroxysm observation', 'Apnoea monitoring (infants)'],
  laboratory: ['FBC (lymphocytosis common — may be striking)', 'CRP'],
  imaging: ['Chest X-ray (if suspicion of pneumonia or atelectasis)'],
  microbiology: ['Pertussis PCR (nasopharyngeal swab — best <3 weeks)', 'Pertussis culture (nasopharyngeal aspirate — best <2 weeks)', 'Serology (IgG anti-PT — best ≥3 weeks after cough onset)'],
  conditional: {
    if_severe_infant: ['ABG', 'Lactate', 'Chest X-ray', 'ECG (pulmonary hypertension assessment)', 'ECHO (assess for pulmonary HTN)'],
    if_apnoea: ['ABG', 'SpO2 continuous', 'Apnoea monitoring'],
    if_contact: ['Post-exposure prophylaxis for contacts (regardless of vaccination status)'],
  },
}]

export const PERTUSSIS_MEDICATIONS: MedicationProtocol[] = [
  { id: 'pertussis_azithromycin', diseaseId: 'pertussis', drug: 'Azithromycin', route: 'PO', dose: '500 mg day 1, then 250 mg days 2-5', frequency: 'OD', duration: '5 days', contraindications: ['QTc prolongation'], allergies: ['Macrolide allergy (rare)'], severity: 'moderate', alternativeIfAllergy: ['TMP-SMX 960 mg PO BID x14 days'], notes: 'Effective if started within 3 weeks of cough onset (catarrhal phase best). Reduces transmission but may not alter cough course. Also for post-exposure prophylaxis.' },
  { id: 'pertussis_azithromycin_infant', diseaseId: 'pertussis', drug: 'Azithromycin (infants)', route: 'PO', dose: '10 mg/kg daily', frequency: 'OD', duration: '5 days', contraindications: ['Hypertrophic pyloric stenosis (reported with erythromycin in infants <6 weeks)'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['TMP-SMX 8 mg/kg TMP BID x14 days'], notes: 'Macrolide of choice in infants. Monitor for pyloric stenosis if <6 weeks. Hospitalize all infants <6 months.' },
]

export const PERTUSSIS_NURSING: NursingProtocol[] = [{
  id: 'pertussis_nursing',
  diseaseId: 'pertussis',
  severity: 'moderate',
  monitoring: [
    { id: 'per_ns_cough', parameter: 'Cough paroxysm frequency and severity', frequency: 'Continuous observation', notes: 'Document frequency, duration, associated cyanosis, post-tussive emesis, apnoea' },
    { id: 'per_ns_spo2', parameter: 'SpO2', frequency: 'Continuous if infant or severe', target: '>94%', notes: 'Desaturation during paroxysms is common. Monitor for recovery between episodes.' },
    { id: 'per_ns_apnoea', parameter: 'Apnoea monitoring', frequency: 'Continuous (infants <6 months)', notes: 'Apnoea may be presenting sign in young infants — cardiorespiratory monitoring' },
    { id: 'per_ns_feeding', parameter: 'Feeding tolerance', frequency: 'Per feed', notes: 'Post-tussive emesis common. Small frequent feeds. Nasogastric feeding if severe.' },
  ],
  care: [
    { id: 'per_care_isolation', parameter: 'Respiratory isolation', frequency: 'Continuous', notes: 'Droplet precautions. Single room. Mask for all HCP. Continue until 5 days of effective therapy completed.' },
    { id: 'per_care_suction', parameter: 'Suctioning', frequency: 'PRN', notes: 'Gentle oral/nasopharyngeal suctioning during paroxysms if copious secretions. Avoid deep suctioning (may trigger laryngospasm).' },
    { id: 'per_care_oxygen', parameter: 'Oxygen during paroxysms', frequency: 'PRN during desaturation', notes: 'Low-flow O2 during paroxysms. Most infants do not need continuous O2 between episodes.' },
    { id: 'per_care_education', parameter: 'Patient/Family Education', frequency: 'Once', notes: 'Explain pertussis course (3 stages: catarrhal, paroxysmal, convalescent). Paroxysmal phase may last 6-10 weeks. Vaccinate household contacts.' },
  ],
  escalation: [
    { id: 'per_esc_apnoea', condition: 'Apnoea requiring intervention', threshold: 'Apnoea >20 sec or with bradycardia/cyanosis', action: 'Stimulation. Oxygen. Assess need for positive pressure ventilation. ICU referral.', notify: ['Doctor', 'ICU team'] },
    { id: 'per_esc_hypoxia', condition: 'Severe hypoxia / pulmonary hypertension', threshold: 'SpO2 <85% between paroxysms or signs of pulmonary HTN', action: 'ICU referral. Consider nitric oxide (iNO). ECMO assessment. Cardiothoracic consult.', notify: ['ICU team', 'Intensivist', 'Cardiology'] },
  ],
}]

export const PERTUSSIS_MONITORING: MonitoringProtocol[] = [{
  id: 'pertussis_monitoring',
  diseaseId: 'pertussis',
  severity: 'moderate',
  vitals: ['HR', 'RR', 'SpO2', 'Temp'],
  vitalsFrequency: 'Q1H (infants), Q4H (older)',
  urineOutput: false,
  fluidBalance: false,
  dailyWeight: false,
  painScore: false,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['Cough paroxysm frequency per 24h', 'Apnoea episodes (infants)', 'Feeding tolerance (% of normal intake)', 'O2 requirement (desaturation during paroxysms vs between)'],
}]

export const PERTUSSIS_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'per_sc_antibiotics', condition: 'pertussis', threshold: 'All confirmed/suspected', action: 'Antibiotic therapy and post-exposure prophylaxis for contacts', details: 'Treat index case. Give prophylaxis (azithromycin single dose) to all household and close contacts regardless of vaccination status.', monitoring: 'Completion of therapy. Contact tracing completion.' },
  { id: 'per_sc_support', condition: 'pertussis', threshold: 'Paroxysmal phase', action: 'Supportive care: small frequent feeds, suction, oxygen PRN, minimize handling', details: 'Avoid triggers for paroxysms (cold air, crying, feeding). Cluster care to minimize stimulation. Hospitalize all infants <6 months.', monitoring: 'Cough frequency. Feeding. Weight. O2 requirement.' },
]

export const PERTUSSIS_ISOLATION: IsolationProtocol[] = [{
  id: 'isolation_pertussis_droplet',
  diseaseId: 'pertussis',
  type: 'droplet',
  ppe: ['Surgical mask', 'Gloves', 'Gown if soiling anticipated'],
  roomType: 'Single room preferred',
  patientTransport: 'Patient must wear surgical mask. Minimize transport.',
  duration: 'Until 5 days of effective antibiotic therapy completed (or 3 weeks if untreated)',
  disinfection: ['Droplet precautions', 'Standard cleaning', 'Hand hygiene'],
}]

export const CKD_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'ckd_sc_diet', condition: 'ckd', threshold: 'All CKD patients', action: 'Renal dietitian referral — individualized meal plan', details: 'Low sodium (<2g/day). Potassium and phosphate restriction based on serum levels. Protein 0.6-0.8 g/kg/day (non-dialysis). Adequate caloric intake.', monitoring: 'Weight. U&E, Ca, PO4, albumin. Dietary adherence.' },
  { id: 'ckd_sc_nephrotoxin', condition: 'ckd', threshold: 'All CKD patients', action: 'Avoid nephrotoxins — NSAIDs, aminoglycosides, IV contrast, herbal remedies', details: 'Educate patient on OTC medications to avoid. Use acetaminophen for analgesia. Label allergy bracelet if needed.', monitoring: 'Medication review at each visit. eGFR trend.' },
  { id: 'ckd_sc_anemia', condition: 'ckd', threshold: 'Hb <10 g/dL (after iron repletion)', action: 'ESA therapy — epoetin alfa or darbepoetin', details: 'Ensure iron stores adequate (ferritin >200, TSAT >30%) before starting ESA. Target Hb 10-12 g/dL. Monitor BP.', monitoring: 'Hb weekly during initiation then monthly. Iron studies monthly. BP monitoring.' },
  { id: 'ckd_sc_rrt', condition: 'ckd', threshold: 'eGFR <25 and declining', action: 'RRT education and timely referral for dialysis access', details: 'Discuss dialysis modalities (HD, PD) and transplantation. Refer for AV fistula creation when eGFR <20. PD catheter when eGFR <15. Transplant evaluation.', monitoring: 'eGFR trend. Uremic symptoms. Nutritional status. Vascular access planning.' },
]
