export interface MechanismProtocolAction {
  mechanismId: string
  mechanismLabel: string
  suggestedInvestigations: string[]
  suggestedMedicationCategories: string[]
  suggestedNursing: string[]
  suggestedMonitoring: string[]
  suggestedSupportiveCare: string[]
}

export const MECHANISM_PROTOCOL_MAP: Record<string, MechanismProtocolAction> = {
  // ─── Infectious Mechanisms ──────────────────────────────────────────────
  plasmodium_parasitemia: {
    mechanismId: 'plasmodium_parasitemia',
    mechanismLabel: 'Plasmodium Parasitemia',
    suggestedInvestigations: ['RDT (Malaria rapid diagnostic test)', 'Blood film for malaria parasites', 'FBC', 'CRP', 'Blood glucose'],
    suggestedMedicationCategories: ['Antimalarial (artemisinin-based combination therapy)'],
    suggestedNursing: ['Monitor temperature q4h', 'Monitor for hypoglycemia', 'Check GCS q4h if severe'],
    suggestedMonitoring: ['Temperature 4-hourly', 'Blood glucose 6-hourly', 'GCS 4-hourly if severe', 'Urine output monitoring'],
    suggestedSupportiveCare: ['IV fluids maintenance', 'Antipyretics', 'Blood transfusion if Hb <7 g/dL'],
  },
  hemolysis: {
    mechanismId: 'hemolysis',
    mechanismLabel: 'Hemolysis',
    suggestedInvestigations: ['FBC with reticulocyte count', 'Blood film', 'Bilirubin (total + direct)', 'LDH', 'Haptoglobin', 'Hb electrophoresis'],
    suggestedMedicationCategories: ['Folic acid supplementation', 'Hydroxyurea (if SCD)'],
    suggestedNursing: ['Monitor urine colour', 'Assess for pallor/jaundice daily', 'Pain assessment'],
    suggestedMonitoring: ['Hb trend 12-hourly if acute', 'Bilirubin trend', 'Urine output'],
    suggestedSupportiveCare: ['IV hydration', 'Oxygen if anaemic with distress', 'Avoid cold exposure'],
  },
  viral_mucosal_inflammation: {
    mechanismId: 'viral_mucosal_inflammation',
    mechanismLabel: 'Viral Mucosal Inflammation',
    suggestedInvestigations: ['FBC', 'CRP', 'Viral PCR (if specific pathogen suspected)'],
    suggestedMedicationCategories: ['Symptomatic relief (antipyretics, analgesics)', 'Antiviral (if influenza/HSV indicated)'],
    suggestedNursing: ['Hydration encouragement', 'Rest promotion', 'Temperature monitoring'],
    suggestedMonitoring: ['Temperature 6-hourly', 'Symptom progression'],
    suggestedSupportiveCare: ['IV fluids if unable to take PO', 'Antipyretics PRN'],
  },
  alveolar_inflammation: {
    mechanismId: 'alveolar_inflammation',
    mechanismLabel: 'Alveolar Inflammation',
    suggestedInvestigations: ['Chest X-ray', 'FBC', 'CRP', 'Sputum culture', 'Blood culture', 'Pulse oximetry'],
    suggestedMedicationCategories: ['Empiric antibiotics per CURB-65', 'Antipyretics'],
    suggestedNursing: ['Chest physiotherapy', 'Monitor SpO2 continuously', 'Positioning for comfort', 'Assess cough and sputum'],
    suggestedMonitoring: ['SpO2 continuous', 'Respiratory rate 2-hourly', 'Temperature 4-hourly', 'CURB-65 reassessment'],
    suggestedSupportiveCare: ['Oxygen if SpO2 <92%', 'IV fluids if unable to take PO', 'Chest physiotherapy'],
  },
  parenchymal_consolidation: {
    mechanismId: 'parenchymal_consolidation',
    mechanismLabel: 'Parenchymal Consolidation',
    suggestedInvestigations: ['Chest X-ray (PA + lateral)', 'FBC', 'CRP', 'Sputum Gram stain and culture', 'Blood culture x2', 'PCT'],
    suggestedMedicationCategories: ['Broad-spectrum antibiotics', 'Antipyretics'],
    suggestedNursing: ['Monitor breath sounds q4h', 'Position for optimal ventilation', 'Assess sputum colour/volume'],
    suggestedMonitoring: ['SpO2 continuous', 'Respiratory rate hourly if severe', 'Temperature 4-hourly', 'Chest X-ray response at 48h'],
    suggestedSupportiveCare: ['Oxygen therapy', 'IV fluids', 'Chest physiotherapy', 'Nutritional support'],
  },
  bronchial_mucosal_infection: {
    mechanismId: 'bronchial_mucosal_infection',
    mechanismLabel: 'Bronchial Mucosal Infection',
    suggestedInvestigations: ['Chest X-ray', 'FBC', 'CRP', 'Sputum culture'],
    suggestedMedicationCategories: ['Bronchodilators', 'Antibiotics (if bacterial suspected)', 'Antitussives (if indicated)'],
    suggestedNursing: ['Monitor cough frequency/character', 'Breath sounds auscultation', 'Hydration encouragement'],
    suggestedMonitoring: ['Temperature 6-hourly', 'Sputum character', 'Cough severity'],
    suggestedSupportiveCare: ['Increased oral fluids', 'Humidified air', 'Avoid smoke/dust'],
  },
  mycobacterial_infection: {
    mechanismId: 'mycobacterial_infection',
    mechanismLabel: 'Mycobacterial Infection',
    suggestedInvestigations: ['Chest X-ray', 'GeneXpert MTB/RIF', 'Sputum AFB smear x3', 'TB culture', 'IGRA/TST', 'HIV test'],
    suggestedMedicationCategories: ['RIPE regimen (Rifampicin, INH, PZA, Ethambutol)', 'Pyridoxine (Vitamin B6)'],
    suggestedNursing: ['Airborne isolation', 'Wear N95 respirator', 'Cough etiquette teaching', 'Directly observed therapy (DOT) setup'],
    suggestedMonitoring: ['AFB smear conversion at 2 months', 'LFTs monthly (INH hepatotoxicity)', 'Visual acuity (ethambutol)', 'Sputum culture conversion'],
    suggestedSupportiveCare: ['Nutritional support', 'Contact tracing', 'HIV testing and management'],
  },
  meningeal_inflammation: {
    mechanismId: 'meningeal_inflammation',
    mechanismLabel: 'Meningeal Inflammation',
    suggestedInvestigations: ['LP with CSF analysis (cell count, protein, glucose, Gram stain, culture)', 'Blood culture x2', 'CRP', 'PCT', 'CT head (if mass suspected before LP)'],
    suggestedMedicationCategories: ['Empiric antibiotics (ceftriaxone + vancomycin)', 'Dexamethasone', 'Antivirals if encephalitis suspected'],
    suggestedNursing: ['Neurological observations q1h', 'Seizure precautions', 'Raised head of bed', 'Monitor for SIADH'],
    suggestedMonitoring: ['GCS hourly', 'Temperature 2-hourly', 'Neck stiffness progression', 'Seizure chart'],
    suggestedSupportiveCare: ['IV fluids (avoid overhydration)', 'Antipyretics', 'ICP monitoring if indicated'],
  },
  intracranial_infection: {
    mechanismId: 'intracranial_infection',
    mechanismLabel: 'Intracranial Infection',
    suggestedInvestigations: ['CT head (contrast)', 'MRI brain with gadolinium', 'CSF analysis (LP if safe)', 'Blood culture', 'CRP', 'ESR'],
    suggestedMedicationCategories: ['Empiric broad-spectrum antibiotics', 'Antivirals (acyclovir)', 'Anticonvulsants', 'Dexamethasone'],
    suggestedNursing: ['Neurological observations q30min', 'Seizure precautions', 'Raised head of bed 30°', 'Intake/output strict'],
    suggestedMonitoring: ['GCS hourly', 'ICP if monitored', 'Temperature 2-hourly', 'Seizure activity', 'Cranial nerve function'],
    suggestedSupportiveCare: ['ICU level care', 'IV fluids', 'Anticonvulsants', 'Nutritional support'],
  },
  bacterial_uti: {
    mechanismId: 'bacterial_uti',
    mechanismLabel: 'Bacterial Urinary Tract Infection',
    suggestedInvestigations: ['Urinalysis/dipstick', 'Urine culture + sensitivity', 'FBC', 'CRP', 'Renal ultrasound (if recurrent/complicated)'],
    suggestedMedicationCategories: ['Empiric antibiotics (nitrofurantoin or ciprofloxacin or ceftriaxone)'],
    suggestedNursing: ['Encourage oral hydration', 'Monitor urine output', 'Assess for flank pain/fever'],
    suggestedMonitoring: ['Temperature 6-hourly', 'Urine output', 'Dysuria resolution', 'Culture results at 48h'],
    suggestedSupportiveCare: ['Increased oral fluids (2-3 L/day)', 'Antipyretics', 'Avoid bubble baths (children)'],
  },
  enteric_infection: {
    mechanismId: 'enteric_infection',
    mechanismLabel: 'Enteric Infection',
    suggestedInvestigations: ['Stool microscopy and culture', 'FBC', 'CRP', 'Blood culture (if typhoid suspected)', 'Widal test (if indicated)'],
    suggestedMedicationCategories: ['Empiric antibiotics (azithromycin or ceftriaxone)', 'Antipyretics'],
    suggestedNursing: ['Stool chart (frequency, consistency)', 'Monitor hydration status', 'Hand hygiene reinforcement', 'Contact isolation'],
    suggestedMonitoring: ['Stool frequency/volume', 'Hydration status', 'Temperature 6-hourly', 'Weight daily'],
    suggestedSupportiveCare: ['Oral rehydration solution', 'IV fluids if dehydrated', 'Zinc supplementation (children)', 'Probiotics'],
  },
  bordetella_infection: {
    mechanismId: 'bordetella_infection',
    mechanismLabel: 'Bordetella Infection',
    suggestedInvestigations: ['Pertussis PCR (nasopharyngeal swab)', 'FBC (lymphocytosis)', 'Chest X-ray'],
    suggestedMedicationCategories: ['Macrolide antibiotic (azithromycin)', 'Post-exposure prophylaxis for contacts'],
    suggestedNursing: ['Respiratory isolation', 'Monitor cough paroxysms', 'Apnoea monitoring in infants', 'Suctioning if needed'],
    suggestedMonitoring: ['Cough frequency and severity', 'Oxygen saturation', 'Apnoea episodes', 'Feeding ability'],
    suggestedSupportiveCare: ['Oxygen if hypoxic', 'IV fluids if unable to feed', 'Humidified air', 'Avoid cough triggers'],
  },
  systemic_inflammatory_response: {
    mechanismId: 'systemic_inflammatory_response',
    mechanismLabel: 'Systemic Inflammatory Response',
    suggestedInvestigations: ['FBC with differential', 'CRP', 'PCT', 'Lactate', 'Blood culture x2', 'Urinalysis/culture', 'Chest X-ray', 'Organ function panel (LFTs, U&E, creatinine)'],
    suggestedMedicationCategories: ['Broad-spectrum IV antibiotics within 1 hour', 'IV fluids resuscitation'],
    suggestedNursing: ['Hourly vital signs', 'Monitor for organ dysfunction', 'Source identification', 'Strict intake/output chart'],
    suggestedMonitoring: ['Vitals hourly', 'Lactate clearance at 2h and 6h', 'Urine output hourly', 'GCS hourly', 'SpO2 continuous'],
    suggestedSupportiveCare: ['IV fluid resuscitation (30 mL/kg crystalloid)', 'Vasopressors if fluid-refractory', 'Source control', 'ICU referral'],
  },
  bacteremia: {
    mechanismId: 'bacteremia',
    mechanismLabel: 'Bacteremia',
    suggestedInvestigations: ['Blood culture x2 (from different sites)', 'FBC', 'CRP', 'PCT', 'Lactate', 'Chest X-ray', 'Urinalysis', 'ECHO (if endocarditis suspected)'],
    suggestedMedicationCategories: ['Empiric broad-spectrum IV antibiotics', 'Source-specific antibiotics once identified'],
    suggestedNursing: ['Hourly vital signs', 'Monitor for septic shock', 'Blood culture collection before antibiotics', 'Line/catheter inspection'],
    suggestedMonitoring: ['Temperature 2-hourly', 'Blood culture results at 48h', 'Lactate clearance', 'Organ function daily'],
    suggestedSupportiveCare: ['IV fluids', 'Vasopressors if needed', 'Source control', 'ICU if organ dysfunction'],
  },
  // ─── Inflammatory Mechanisms ────────────────────────────────────────────
  airway_inflammation: {
    mechanismId: 'airway_inflammation',
    mechanismLabel: 'Airway Inflammation',
    suggestedInvestigations: ['Spirometry/PEFR', 'FBC (eosinophils)', 'Chest X-ray', 'Allergen testing (if atopic)'],
    suggestedMedicationCategories: ['Inhaled corticosteroids (ICS)', 'Bronchodilators (SABA/LABA)', 'Leukotriene receptor antagonists'],
    suggestedNursing: ['Peak flow monitoring', 'Inhaler technique teaching', 'Asthma action plan review', 'Trigger avoidance counselling'],
    suggestedMonitoring: ['Peak expiratory flow rate', 'Symptom diary', 'Exacerbation frequency', 'Inhaler adherence'],
    suggestedSupportiveCare: ['Avoidance of triggers', 'Smoking cessation', 'Breathing exercises', 'Allergy management'],
  },
  bronchial_hyperresponsiveness: {
    mechanismId: 'bronchial_hyperresponsiveness',
    mechanismLabel: 'Bronchial Hyperresponsiveness',
    suggestedInvestigations: ['Methacholine challenge test', 'Spirometry pre/post bronchodilator', 'FBC', 'IgE levels', 'Skin prick testing'],
    suggestedMedicationCategories: ['Inhaled corticosteroids (ICS)', 'Long-acting bronchodilators (LABA)', 'Montelukast'],
    suggestedNursing: ['Peak flow diary', 'Identify and avoid triggers', 'Inhaler education', 'Written asthma action plan'],
    suggestedMonitoring: ['Daytime/nighttime symptoms', 'Peak flow variability', 'Reliever usage frequency', 'Exacerbations per year'],
    suggestedSupportiveCare: ['Trigger avoidance', 'Allergen immunotherapy referral', 'Smoking cessation', 'Weight management'],
  },
  sinus_mucosal_inflammation: {
    mechanismId: 'sinus_mucosal_inflammation',
    mechanismLabel: 'Sinus Mucosal Inflammation',
    suggestedInvestigations: ['Nasal endoscopy (if recurrent)', 'CT sinuses (if chronic)', 'Allergy testing'],
    suggestedMedicationCategories: ['Nasal corticosteroids', 'Saline nasal irrigation', 'Antihistamines (if allergic)', 'Analgesics'],
    suggestedNursing: ['Steam inhalation instruction', 'Nasal saline teaching', 'Identify triggers'],
    suggestedMonitoring: ['Symptom diary (facial pain, congestion)', 'Response to treatment'],
    suggestedSupportiveCare: ['Warm compresses', 'Increased fluid intake', 'Humidified air', 'Avoid nasal decongestants >3 days'],
  },
  laryngeal_inflammation: {
    mechanismId: 'laryngeal_inflammation',
    mechanismLabel: 'Laryngeal and Subglottic Inflammation',
    suggestedInvestigations: ['Lateral neck X-ray', 'FBC', 'CRP', 'Viral PCR (if croup suspected)'],
    suggestedMedicationCategories: ['Corticosteroids (dexamethasone)', 'Racemic epinephrine nebulised (if stridor at rest)'],
    suggestedNursing: ['Monitor for stridor', 'Position upright', 'Avoid agitation', 'Observe for respiratory distress'],
    suggestedMonitoring: ['Stridor at rest/on crying', 'Respiratory rate', 'SpO2 continuous', 'Westley croup score'],
    suggestedSupportiveCare: ['Humidified oxygen', 'Cool mist therapy', 'IV fluids if unable to take PO', 'Minimal handling'],
  },
  airway_edema: {
    mechanismId: 'airway_edema',
    mechanismLabel: 'Upper Airway Edema',
    suggestedInvestigations: ['Lateral neck X-ray', 'FBC', 'CRP', 'ENT assessment', 'Flexible nasopharyngoscopy (if stable)'],
    suggestedMedicationCategories: ['Nebulised epinephrine', 'Systemic corticosteroids', 'Antihistamines (if allergic)', 'IV calcium gluconate (if angioedema)'],
    suggestedNursing: ['Monitor airway patency', 'Position upright', 'Prepare intubation equipment', 'Continuous observation'],
    suggestedMonitoring: ['Stridor severity', 'Respiratory rate', 'SpO2 continuous', 'Accessory muscle use', 'Voice change'],
    suggestedSupportiveCare: ['Humidified oxygen', 'IV access', 'ICU preparedness for difficult airway', 'Avoid sedatives'],
  },
  granulomatous_inflammation: {
    mechanismId: 'granulomatous_inflammation',
    mechanismLabel: 'Granulomatous Inflammation',
    suggestedInvestigations: ['Chest X-ray', 'CT chest', 'Tissue biopsy', 'ACE levels (sarcoid)', 'Quantiferon-TB Gold', 'CRP', 'ESR'],
    suggestedMedicationCategories: ['Corticosteroids (if symptomatic sarcoidosis)', 'Immunosuppressants (methotrexate)', 'Anti-TB therapy (if TB)'],
    suggestedNursing: ['Monitor for organ involvement', 'Daily weight', 'Assess for symptoms of hypercalcaemia'],
    suggestedMonitoring: ['Organ-specific function', 'Medication side effects', 'Disease progression', 'LFTs monthly if on methotrexate'],
    suggestedSupportiveCare: ['Sun protection (sarcoid)', 'Calcium monitoring', 'Referral to appropriate specialist'],
  },
  // ─── Vascular & Hemorrhagic Mechanisms ──────────────────────────────────
  vascular_dysregulation: {
    mechanismId: 'vascular_dysregulation',
    mechanismLabel: 'Vascular Dysregulation',
    suggestedInvestigations: ['Neuroimaging (CT/MRI brain)', 'Blood pressure monitoring', 'ECG'],
    suggestedMedicationCategories: ['Acute migraine therapy (triptans)', 'Preventive therapy (beta-blockers, amitriptyline)', 'NSAIDs/analgesics'],
    suggestedNursing: ['Dark quiet environment', 'Pain assessment', 'Trigger identification', 'Ice pack application'],
    suggestedMonitoring: ['Headache diary', 'Response to treatment', 'Blood pressure'],
    suggestedSupportiveCare: ['Rest in dark room', 'Hydration', 'Caffeine management (avoid withdrawal)'],
  },
  subarachnoid_bleeding: {
    mechanismId: 'subarachnoid_bleeding',
    mechanismLabel: 'Subarachnoid Bleeding',
    suggestedInvestigations: ['CT head (non-contrast) STAT', 'LP for xanthochromia (if CT negative)', 'CT angiogram', 'Cerebral angiography', 'FBC', 'Coagulation profile'],
    suggestedMedicationCategories: ['Nimodipine (prevent vasospasm)', 'Analgesics', 'Antiepileptics', 'Blood pressure management'],
    suggestedNursing: ['Neurological observations q15min', 'HOB 30°', 'Avoid straining/Valsalva', 'Seizure precautions', 'Strict BP control'],
    suggestedMonitoring: ['GCS hourly', 'BP monitoring (target per protocol)', 'SpO2 continuous', 'ECG monitoring', 'Vasospasm watch (day 4-14)'],
    suggestedSupportiveCare: ['ICU admission', 'IV fluids (avoid hypovolaemia)', 'Pain management', 'Neurosurgical referral', 'Avoid anticoagulants'],
  },
  aneurysmal_rupture: {
    mechanismId: 'aneurysmal_rupture',
    mechanismLabel: 'Aneurysmal Rupture',
    suggestedInvestigations: ['CT head STAT', 'CT angiogram', 'Cerebral DSA', 'FBC', 'Coags', 'ECG', 'Troponin'],
    suggestedMedicationCategories: ['Nimodipine', 'Antiepileptics', 'Pain management', 'BP control agents'],
    suggestedNursing: ['Neurological observations q15min', 'HOB 30°', 'Avoid stimulation', 'Seizure precautions', 'Prepare for OR/IR'],
    suggestedMonitoring: ['GCS hourly', 'BP per protocol (systolic target)', 'ICP if monitored', 'Vasospasm screening (TCD)', 'ECG for arrhythmias'],
    suggestedSupportiveCare: ['ICU level care', 'IV normovolaemia', 'Neurosurgery/interventional radiology', 'Pain and anxiety management'],
  },
  elevated_intracranial_pressure: {
    mechanismId: 'elevated_intracranial_pressure',
    mechanismLabel: 'Elevated Intracranial Pressure',
    suggestedInvestigations: ['CT head (non-contrast) STAT', 'ICP monitoring', 'FBC', 'Coags', 'Blood gas', 'Serum osmolality'],
    suggestedMedicationCategories: ['Mannitol or hypertonic saline', 'Dexamethasone (if vasogenic oedema)', 'Antiepileptics', 'Sedation'],
    suggestedNursing: ['HOB 30°', 'Neurological observations q15min', 'Avoid neck flexion/rotation', 'Minimal stimulation', 'Prepare for EVD/ICP bolt'],
    suggestedMonitoring: ['ICP continuous', 'CPP calculation', 'GCS hourly', 'Pupils hourly', 'SpO2', 'ETCO2 if ventilated'],
    suggestedSupportiveCare: ['ICU admission', 'Short-term hyperventilation (if herniation)', 'IV fluids (avoid hypotonic)', 'Neurosurgical consultation'],
  },
  // ─── Neurological / Functional Mechanisms ──────────────────────────────
  trigeminal_nerve_activation: {
    mechanismId: 'trigeminal_nerve_activation',
    mechanismLabel: 'Trigeminal Nerve Activation',
    suggestedInvestigations: ['MRI brain (to exclude secondary causes)', 'Headache diary', 'Neurological examination'],
    suggestedMedicationCategories: ['Acute: triptans, NSAIDs, antiemetics', 'Preventive: beta-blockers, amitriptyline, topiramate', 'CGRP antagonists (if chronic)'],
    suggestedNursing: ['Pain assessment', 'Dark quiet environment', 'Trigger identification and avoidance'],
    suggestedMonitoring: ['Headache frequency and severity', 'Response to acute therapy', 'Medication overuse headache risk'],
    suggestedSupportiveCare: ['Sleep hygiene', 'Stress management', 'Regular meals and hydration', 'Avoid known triggers'],
  },
  cortical_spreading_depression: {
    mechanismId: 'cortical_spreading_depression',
    mechanismLabel: 'Cortical Spreading Depression',
    suggestedInvestigations: ['MRI brain', 'EEG (if seizure suspected)', 'Headache diary with aura description'],
    suggestedMedicationCategories: ['Migraine-specific acute therapy (triptans)', 'Preventive therapy if frequent'],
    suggestedNursing: ['Aura documentation', 'Safety during focal deficits', 'Reassurance'],
    suggestedMonitoring: ['Aura characteristics', 'Headache onset relative to aura', 'Response to treatment'],
    suggestedSupportiveCare: ['Rest until aura resolves', 'Avoid driving during aura', 'Migraine education'],
  },
  trigeminal_autonomic_reflex: {
    mechanismId: 'trigeminal_autonomic_reflex',
    mechanismLabel: 'Trigeminal Autonomic Reflex Activation',
    suggestedInvestigations: ['MRI brain (rule out pituitary/sellar pathology)', 'High-resolution CT (if sinus disease)'],
    suggestedMedicationCategories: ['Acute: sumatriptan SC/IN, oxygen therapy (100% O2 at 12-15 L/min)', 'Preventive: verapamil, lithium, topiramate, corticosteroids'],
    suggestedNursing: ['Cluster headache protocol', 'High-flow oxygen setup and monitoring', 'Pain assessment', 'Suicide risk assessment (cluster headache)'],
    suggestedMonitoring: ['Attack frequency and duration', 'Response to acute therapy', 'Seasonal pattern (cluster periods)'],
    suggestedSupportiveCare: ['Avoid alcohol during cluster period', 'Sleep hygiene', 'Support group referral', 'Neurology follow-up'],
  },
  hypothalamic_activation: {
    mechanismId: 'hypothalamic_activation',
    mechanismLabel: 'Hypothalamic Activation',
    suggestedInvestigations: ['MRI brain (pituitary/hypothalamus)', 'Endocrine workup (if suspected)', 'Sleep study (if circadian disruption)'],
    suggestedMedicationCategories: ['As per primary condition', 'Melatonin (if circadian disruption)'],
    suggestedNursing: ['Pattern recognition in headache diary', 'Sleep hygiene promotion'],
    suggestedMonitoring: ['Circadian pattern of attacks', 'Sleep quality', 'Mood assessment'],
    suggestedSupportiveCare: ['Regular sleep-wake schedule', 'Avoid shift work if possible', 'Stress management'],
  },
  // ─── Musculoskeletal ─────────────────────────────────────────────────────
  musculoskeletal_tension: {
    mechanismId: 'musculoskeletal_tension',
    mechanismLabel: 'Musculoskeletal Tension',
    suggestedInvestigations: ['Physical examination (cervical spine, TMJ)', 'CT/MRI cervical spine (if red flags)'],
    suggestedMedicationCategories: ['Simple analgesics (paracetamol, NSAIDs)', 'Muscle relaxants (short-term)', 'Tricyclic antidepressants (preventive)'],
    suggestedNursing: ['Posture assessment', 'Heat/cold therapy instruction', 'Stress reduction techniques', 'Neck stretching exercises'],
    suggestedMonitoring: ['Pain intensity (0-10)', 'Frequency of headaches', 'Functional impact', 'Response to physiotherapy'],
    suggestedSupportiveCare: ['Physiotherapy referral', 'Stress management', 'Ergonomic assessment', 'Regular exercise', 'Massage therapy'],
  },
  // ─── Metabolic / Degenerative ─────────────────────────────────────────
  parenchymal_destruction: {
    mechanismId: 'parenchymal_destruction',
    mechanismLabel: 'Parenchymal Destruction',
    suggestedInvestigations: ['CT/MRI of affected organ', 'Tissue biopsy', 'Organ function panel', 'Tumour markers (if neoplastic)'],
    suggestedMedicationCategories: ['Depends on aetiology (anti-TB, chemotherapy, immunosuppression)'],
    suggestedNursing: ['Monitor organ function', 'Pain management', 'Nutritional support', 'Functional assessment'],
    suggestedMonitoring: ['Organ-specific function trends', 'Weight/nutritional status', 'Pain scores', 'Complication surveillance'],
    suggestedSupportiveCare: ['Nutritional support (dietitian referral)', 'Pain management', 'Rehabilitation services', 'Social work support'],
  },
  hemolytic_anemia: {
    mechanismId: 'hemolytic_anemia',
    mechanismLabel: 'Hemolytic Anemia',
    suggestedInvestigations: ['FBC with reticulocyte count', 'Blood film', 'LDH', 'Bilirubin (total + direct)', 'Haptoglobin', 'Hb electrophoresis', 'Direct Coombs test', 'G6PD assay'],
    suggestedMedicationCategories: ['Folic acid', 'Hydroxyurea (if SCD)', 'Iron chelation (if transfusion-dependent)', 'Erythropoietin (selected cases)'],
    suggestedNursing: ['Monitor vital signs', 'Assess for pallor/jaundice', 'Urine colour monitoring', 'Fall precautions (if anaemic)'],
    suggestedMonitoring: ['Hb trend', 'Reticulocyte count', 'Bilirubin/ LDH trend', 'Transfusion interval', 'Spleen size'],
    suggestedSupportiveCare: ['Blood transfusion (if Hb <7 or symptomatic)', 'IV hydration', 'Avoid oxidative stress (if G6PD deficient)', 'Infection prevention'],
  },

  // ─── Respiratory Extension Mechanisms ─────────────────────────────────
  upper_airway_irritation: {
    mechanismId: 'upper_airway_irritation',
    mechanismLabel: 'Upper Airway Irritation',
    suggestedInvestigations: ['Throat swab', 'Chest X-ray', 'FBC'],
    suggestedMedicationCategories: ['Antitussives', 'Steam inhalation', 'Antihistamines (if allergic)'],
    suggestedNursing: ['Symptom monitoring', 'Hydration encouragement', 'Avoid smoke/dust'],
    suggestedMonitoring: ['Cough severity', 'Temperature 6-hourly', 'Symptom progression'],
    suggestedSupportiveCare: ['Warm fluids', 'Honey (age >1 year)', 'Humidified air', 'Avoid irritants'],
  },
  smooth_muscle_constriction: {
    mechanismId: 'smooth_muscle_constriction',
    mechanismLabel: 'Smooth Muscle Constriction',
    suggestedInvestigations: ['Spirometry pre/post bronchodilator', 'Peak flow', 'Chest X-ray', 'FBC'],
    suggestedMedicationCategories: ['Short-acting bronchodilator (salbutamol)', 'Ipratropium bromide', 'Inhaled corticosteroids (ICS)'],
    suggestedNursing: ['Peak flow monitoring', 'Inhaler technique assessment', 'Positioning for comfort', 'Breath sounds auscultation'],
    suggestedMonitoring: ['Peak expiratory flow rate q4h', 'Respiratory rate 2-hourly', 'SpO2 continuous', 'Accessory muscle use'],
    suggestedSupportiveCare: ['Oxygen if SpO2 <92%', 'Breathing exercises', 'Avoid known triggers', 'Smoking cessation'],
  },
  respiratory_mucosal_inflammation: {
    mechanismId: 'respiratory_mucosal_inflammation',
    mechanismLabel: 'Respiratory Mucosal Inflammation',
    suggestedInvestigations: ['Viral PCR panel', 'FBC', 'CRP', 'Chest X-ray'],
    suggestedMedicationCategories: ['Symptomatic relief (antipyretics, antitussives)', 'Antiviral (if influenza/COVID suspected)'],
    suggestedNursing: ['Temperature monitoring', 'Cough etiquette education', 'Hydration encouragement', 'Rest promotion'],
    suggestedMonitoring: ['Temperature 6-hourly', 'Cough character/progression', 'SpO2 8-hourly', 'Symptom diary'],
    suggestedSupportiveCare: ['IV fluids if unable to take PO', 'Antipyretics PRN', 'Rest', 'Nutritional support'],
  },
  parenchymal_infection: {
    mechanismId: 'parenchymal_infection',
    mechanismLabel: 'Parenchymal Infection',
    suggestedInvestigations: ['Chest X-ray PA + lateral', 'FBC with differential', 'CRP', 'Sputum Gram stain and culture', 'Blood culture x2'],
    suggestedMedicationCategories: ['Empiric antibiotics per local guidelines', 'Antipyretics'],
    suggestedNursing: ['Monitor breath sounds q4h', 'Position for optimal ventilation', 'Assess sputum colour/volume', 'Chest physiotherapy'],
    suggestedMonitoring: ['SpO2 continuous', 'Respiratory rate 2-hourly', 'Temperature 4-hourly', 'Chest X-ray response at 48h'],
    suggestedSupportiveCare: ['Oxygen if SpO2 <92%', 'IV fluids', 'Chest physiotherapy', 'Nutritional support'],
  },
  left_ventricular_failure: {
    mechanismId: 'left_ventricular_failure',
    mechanismLabel: 'Left Ventricular Failure',
    suggestedInvestigations: ['ECHO', 'BNP/NT-proBNP', 'Chest X-ray', 'ECG', 'Troponin', 'U&E', 'Creatinine', 'LFTs'],
    suggestedMedicationCategories: ['Diuretics (furosemide)', 'ACE inhibitor/ARB', 'Beta-blocker', 'Spironolactone'],
    suggestedNursing: ['Strict intake/output chart', 'Daily weight', 'Monitor for pulmonary edema', 'Position upright'],
    suggestedMonitoring: ['SpO2 continuous', 'Respiratory rate hourly', 'Urine output hourly', 'Daily weight', 'Edema assessment', 'Lung auscultation q4h'],
    suggestedSupportiveCare: ['Oxygen therapy', 'Sodium restriction', 'Fluid restriction', 'Elevate head of bed', 'ICU if cardiogenic shock'],
  },
  increased_pulmonary_capillary_pressure: {
    mechanismId: 'increased_pulmonary_capillary_pressure',
    mechanismLabel: 'Increased Pulmonary Capillary Pressure',
    suggestedInvestigations: ['Chest X-ray', 'ECHO', 'BNP', 'Right heart catheterization (if indicated)'],
    suggestedMedicationCategories: ['Diuretics (furosemide)', 'Vasodilators', 'Inotropes (if low output)'],
    suggestedNursing: ['Monitor for frothy sputum', 'Strict intake/output', 'Daily weight', 'Position upright'],
    suggestedMonitoring: ['SpO2 continuous', 'Respiratory rate hourly', 'Urine output', 'Breath sounds q2h'],
    suggestedSupportiveCare: ['Oxygen', 'Fluid restriction', 'Elevate head of bed', 'ICU referral'],
  },
  pulmonary_artery_occlusion: {
    mechanismId: 'pulmonary_artery_occlusion',
    mechanismLabel: 'Pulmonary Artery Occlusion',
    suggestedInvestigations: ['CT pulmonary angiogram', 'D-dimer', 'ECG', 'ECHO', 'ABG', 'Troponin'],
    suggestedMedicationCategories: ['Anticoagulation (LMWH → warfarin/DOAC)', 'Thrombolysis (if massive PE)'],
    suggestedNursing: ['Monitor for hemodynamic instability', 'SpO2 continuous', 'Strict bed rest', 'Prepare for thrombolysis if indicated'],
    suggestedMonitoring: ['SpO2 continuous', 'ECG monitoring', 'Blood pressure hourly', 'Respiratory rate hourly', 'Troponin trend'],
    suggestedSupportiveCare: ['Oxygen therapy', 'IV fluids cautiously', 'ICU if unstable', 'Compression stockings (DVT prevention)'],
  },
  ventilation_perfusion_mismatch: {
    mechanismId: 'ventilation_perfusion_mismatch',
    mechanismLabel: 'Ventilation-Perfusion Mismatch',
    suggestedInvestigations: ['ABG', 'Chest X-ray', 'CTPA', 'V/Q scan (if CTPA contraindicated)'],
    suggestedMedicationCategories: ['Treat underlying cause', 'Bronchodilators', 'Oxygen therapy'],
    suggestedNursing: ['Optimize positioning', 'Chest physiotherapy', 'Monitor SpO2', 'ABG sampling'],
    suggestedMonitoring: ['SpO2 continuous', 'ABG as needed', 'Respiratory rate', 'Work of breathing'],
    suggestedSupportiveCare: ['Oxygen therapy', 'Treat underlying cause', 'Pulmonary rehabilitation referral'],
  },
  airway_obstruction: {
    mechanismId: 'airway_obstruction',
    mechanismLabel: 'Airway Obstruction',
    suggestedInvestigations: ['Spirometry', 'Chest X-ray', 'CT chest', 'Bronchoscopy (if foreign body/tumor suspected)'],
    suggestedMedicationCategories: ['Bronchodilators (SABA)', 'Inhaled corticosteroids', 'Treat underlying cause'],
    suggestedNursing: ['Monitor for stridor/wheeze', 'Positioning for airway patency', 'Suctioning if needed', 'Breath sounds auscultation'],
    suggestedMonitoring: ['Peak flow q4h', 'SpO2 continuous', 'Respiratory rate', 'Accessory muscle use', 'Stridor grading'],
    suggestedSupportiveCare: ['Oxygen therapy', 'Airway clearance techniques', 'Referral to respiratory physician', 'Avoid respiratory depressants'],
  },
  mucus_hypersecretion: {
    mechanismId: 'mucus_hypersecretion',
    mechanismLabel: 'Mucus Hypersecretion',
    suggestedInvestigations: ['Sputum culture', 'Chest X-ray', 'FBC', 'CRP', 'CT chest (if bronchiectasis suspected)'],
    suggestedMedicationCategories: ['Mucolytics (acetylcysteine)', 'Chest physiotherapy', 'Expectorants', 'Antibiotics if infected'],
    suggestedNursing: ['Chest physiotherapy', 'Postural drainage', 'Assess sputum volume/color', 'Hydration encouragement'],
    suggestedMonitoring: ['Sputum 24h volume', 'Sputum color/consistency', 'Cough effectiveness', 'Temperature'],
    suggestedSupportiveCare: ['Increased oral fluids', 'Humidified air', 'Smoking cessation', 'Pulmonary rehabilitation'],
  },
  intrapleural_air: {
    mechanismId: 'intrapleural_air',
    mechanismLabel: 'Intrapleural Air',
    suggestedInvestigations: ['Chest X-ray (expiratory)', 'CT chest', 'ABG'],
    suggestedMedicationCategories: ['Analgesia', 'Oxygen therapy'],
    suggestedNursing: ['Monitor for tension physiology', 'Chest drain care', 'SpO2 continuous', 'Pain assessment'],
    suggestedMonitoring: ['SpO2 continuous', 'Respiratory rate hourly', 'Tracheal deviation check', 'Chest drain output'],
    suggestedSupportiveCare: ['Oxygen therapy', 'Chest tube insertion', 'Thoracic surgery referral if persistent', 'Pain management'],
  },
  mucous_plugging: {
    mechanismId: 'mucous_plugging',
    mechanismLabel: 'Mucous Plugging',
    suggestedInvestigations: ['Chest X-ray', 'CT chest', 'Bronchoscopy', 'Sputum culture'],
    suggestedMedicationCategories: ['Mucolytics (acetylcysteine)', 'Bronchodilators', 'Chest physiotherapy'],
    suggestedNursing: ['Chest physiotherapy', 'Postural drainage', 'Suctioning', 'Breath sounds auscultation', 'Hydration'],
    suggestedMonitoring: ['SpO2 continuous', 'Respiratory rate', 'Breath sounds distribution', 'Oxygen requirement'],
    suggestedSupportiveCare: ['Humidified oxygen', 'IV fluids', 'Bronchoscopy for refractory cases', 'Airway clearance techniques'],
  },
}

export function getMechanismProtocols(mechanismIds: string[]): MechanismProtocolAction[] {
  return mechanismIds
    .map(id => MECHANISM_PROTOCOL_MAP[id])
    .filter((m): m is MechanismProtocolAction => m !== undefined)
}

export function mergeMechanismActions(actions: MechanismProtocolAction[]): {
  investigations: string[]
  medications: string[]
  nursing: string[]
  monitoring: string[]
  supportiveCare: string[]
} {
  const investigations = new Set<string>()
  const medications = new Set<string>()
  const nursing = new Set<string>()
  const monitoring = new Set<string>()
  const supportiveCare = new Set<string>()

  for (const a of actions) {
    for (const i of a.suggestedInvestigations) investigations.add(i)
    for (const m of a.suggestedMedicationCategories) medications.add(m)
    for (const n of a.suggestedNursing) nursing.add(n)
    for (const m of a.suggestedMonitoring) monitoring.add(m)
    for (const s of a.suggestedSupportiveCare) supportiveCare.add(s)
  }

  return {
    investigations: [...investigations],
    medications: [...medications],
    nursing: [...nursing],
    monitoring: [...monitoring],
    supportiveCare: [...supportiveCare],
  }
}
