// ============================================================
// AMEXAN CLINICAL RULES ENGINE
// Version 2.0 — Full Production
// All clinical logic lives here. Import into ClinicalWorkspace.
// ============================================================

// ── AGE GROUP CLASSIFIER ────────────────────────────────────
export function getAgeGroup(age) {
  const n = parseInt(age, 10);
  if (isNaN(n)) return 'adult';
  if (n < 1)   return 'neonate';
  if (n < 12)  return 'paed';
  if (n < 18)  return 'adolescent';
  if (n < 60)  return 'adult';
  return 'elderly';
}

// ── HISTORY FLOWS ────────────────────────────────────────────
// Each flow = chief complaint → dynamic section list
export const HISTORY_FLOWS = {

  'Chest Pain': {
    label: 'Chest Pain',
    icon: '🫀',
    category: 'Cardiovascular',
    sections: [
      {
        id: 'hpi',
        label: 'History of Presenting Illness',
        redFlags: true,
        fields: [
          { id: 'onset',       label: 'Onset',                type: 'select',      options: ['Sudden','Gradual','Exertional','At rest'] },
          { id: 'duration',    label: 'Duration',              type: 'text',        placeholder: 'e.g. 2 hours' },
          { id: 'character',   label: 'Character',             type: 'select',      options: ['Crushing','Sharp','Burning','Pressure','Tearing','Dull','Pleuritic'] },
          { id: 'severity',    label: 'Severity (0–10)',       type: 'slider',      min: 0, max: 10 },
          { id: 'radiation',   label: 'Radiation',             type: 'multiselect', options: ['Left arm','Jaw','Back','Neck','Epigastrium','Right arm','None'] },
          { id: 'relieving',   label: 'Relieving factors',     type: 'multiselect', options: ['Rest','GTN','Sitting forward','Antacids','Analgesia','Nothing'] },
          { id: 'aggravating', label: 'Aggravating factors',   type: 'multiselect', options: ['Exertion','Inspiration','Movement','Lying flat','Eating'] },
          { id: 'dyspnoea',    label: 'Dyspnoea (SOB)',        type: 'boolean',     redFlag: true },
          { id: 'diaphoresis', label: 'Diaphoresis (sweating)',type: 'boolean',     redFlag: true },
          { id: 'syncope',     label: 'Syncope / Pre-syncope', type: 'boolean',     redFlag: true },
          { id: 'palpitations',label: 'Palpitations',          type: 'boolean' },
          { id: 'nausea',      label: 'Nausea / Vomiting',     type: 'boolean' },
          { id: 'haemoptysis', label: 'Haemoptysis',           type: 'boolean',     redFlag: true },
          { id: 'cough',       label: 'Cough',                 type: 'boolean' },
          { id: 'prev_similar',label: 'Previous similar episode',type:'boolean' },
        ],
      },
      {
        id: 'cardiac_rf',
        label: 'Cardiac Risk Factors',
        fields: [
          { id: 'htn',        label: 'Hypertension',          type: 'boolean' },
          { id: 'dm',         label: 'Diabetes mellitus',     type: 'boolean' },
          { id: 'smoking',    label: 'Smoking',               type: 'boolean' },
          { id: 'dyslipid',   label: 'Dyslipidaemia',         type: 'boolean' },
          { id: 'fam_hx',     label: 'Family Hx IHD <55y',   type: 'boolean',     redFlag: true },
          { id: 'obesity',    label: 'Obesity',               type: 'boolean' },
          { id: 'prior_acs',  label: 'Prior ACS / PCI / CABG',type: 'boolean' },
          { id: 'af',         label: 'Atrial Fibrillation',   type: 'boolean' },
          { id: 'cocaine',    label: 'Cocaine / stimulant use',type: 'boolean',    redFlag: true },
        ],
      },
    ],
  },

  'Shortness of Breath': {
    label: 'Shortness of Breath',
    icon: '🫁',
    category: 'Respiratory/Cardiac',
    sections: [
      {
        id: 'hpi',
        label: 'History of Presenting Illness',
        redFlags: true,
        fields: [
          { id: 'onset',       label: 'Onset',                type: 'select',      options: ['Sudden','Acute (<24h)','Subacute (days)','Chronic (weeks/months)'] },
          { id: 'severity',    label: 'Severity (MRC grade)',  type: 'select',      options: ['Grade 1: only strenuous','Grade 2: hurrying/hills','Grade 3: own pace','Grade 4: 100 yards','Grade 5: at rest'] },
          { id: 'orthopnoea',  label: 'Orthopnoea (SOB lying)',type: 'boolean',     redFlag: true },
          { id: 'pillows',     label: 'Number of pillows',     type: 'number' },
          { id: 'pnd',         label: 'Paroxysmal nocturnal dyspnoea',type:'boolean',redFlag:true },
          { id: 'wheeze',      label: 'Wheeze',                type: 'boolean' },
          { id: 'cough',       label: 'Cough',                 type: 'boolean' },
          { id: 'sputum',      label: 'Sputum — colour',       type: 'select',      options: ['None','Clear/white','Yellow','Green','Brown','Frothy pink'] },
          { id: 'haemoptysis', label: 'Haemoptysis',           type: 'boolean',     redFlag: true },
          { id: 'fever',       label: 'Fever / rigors',        type: 'boolean' },
          { id: 'pleuritic',   label: 'Pleuritic chest pain',  type: 'boolean',     redFlag: true },
          { id: 'leg_swelling',label: 'Leg swelling',          type: 'boolean',     redFlag: true },
          { id: 'exercise_tol',label: 'Exercise tolerance',    type: 'text',        placeholder: 'e.g. 100m on flat' },
        ],
      },
    ],
  },

  'Fever / Pyrexia': {
    label: 'Fever / Pyrexia',
    icon: '🌡️',
    category: 'Infectious',
    sections: [
      {
        id: 'hpi',
        label: 'History of Presenting Illness',
        redFlags: true,
        fields: [
          { id: 'duration',    label: 'Duration of fever',     type: 'text' },
          { id: 'pattern',     label: 'Fever pattern',         type: 'select',      options: ['Continuous','Remittent','Intermittent','Quotidian','Tertian','Hectic/swinging'] },
          { id: 'rigors',      label: 'Rigors / chills',       type: 'boolean',     redFlag: true },
          { id: 'night_sweats',label: 'Night sweats',          type: 'boolean' },
          { id: 'weight_loss', label: 'Weight loss',           type: 'boolean',     redFlag: true },
          { id: 'sore_throat', label: 'Sore throat',           type: 'boolean' },
          { id: 'cough',       label: 'Cough / sputum',        type: 'boolean' },
          { id: 'dysuria',     label: 'Dysuria / frequency',   type: 'boolean' },
          { id: 'diarrhoea',   label: 'Diarrhoea / vomiting',  type: 'boolean' },
          { id: 'rash',        label: 'Rash',                  type: 'boolean' },
          { id: 'headache',    label: 'Headache',              type: 'boolean' },
          { id: 'neck_stiff',  label: 'Neck stiffness',        type: 'boolean',     redFlag: true },
          { id: 'photophobia', label: 'Photophobia',           type: 'boolean',     redFlag: true },
          { id: 'travel',      label: 'Recent travel (malaria endemic area)',type:'boolean',redFlag:true },
          { id: 'travel_dest', label: 'Travel destination',    type: 'text' },
          { id: 'sick_contacts',label:'Sick contacts',         type: 'boolean' },
          { id: 'animal_contact',label:'Animal / bird contact',type: 'boolean' },
          { id: 'immunocomp',  label: 'Immunocompromised / on steroids',type:'boolean',redFlag:true },
        ],
      },
    ],
  },

  'Abdominal Pain': {
    label: 'Abdominal Pain',
    icon: '🫃',
    category: 'Gastrointestinal',
    sections: [
      {
        id: 'hpi',
        label: 'History of Presenting Illness',
        redFlags: true,
        fields: [
          { id: 'site',        label: 'Site',                  type: 'select',      options: ['RUQ','LUQ','Epigastric','Periumbilical','RIF','LIF','Suprapubic','Diffuse','Loin'] },
          { id: 'onset',       label: 'Onset',                 type: 'select',      options: ['Sudden','Gradual','Colicky','Constant'] },
          { id: 'severity',    label: 'Severity (0–10)',        type: 'slider',      min: 0, max: 10 },
          { id: 'radiation',   label: 'Radiation',             type: 'select',      options: ['Back','Right shoulder','Groin','Flank','Nowhere'] },
          { id: 'nausea',      label: 'Nausea / Vomiting',     type: 'boolean' },
          { id: 'haematemesis',label: 'Haematemesis',          type: 'boolean',     redFlag: true },
          { id: 'blood_stool', label: 'PR blood / melaena',    type: 'boolean',     redFlag: true },
          { id: 'bowel_habit', label: 'Change in bowel habit', type: 'boolean' },
          { id: 'constipation',label: 'Constipation',          type: 'boolean' },
          { id: 'diarrhoea',   label: 'Diarrhoea',             type: 'boolean' },
          { id: 'jaundice',    label: 'Jaundice / dark urine', type: 'boolean' },
          { id: 'dysuria',     label: 'Dysuria / haematuria',  type: 'boolean' },
          { id: 'lmp',         label: 'LMP (females)',         type: 'date',        genderRestrict: 'female' },
          { id: 'pregnant',    label: 'Possible pregnancy',    type: 'boolean',     genderRestrict: 'female', redFlag: true },
          { id: 'last_ate',    label: 'Last ate / drank',      type: 'text' },
          { id: 'anorexia',    label: 'Anorexia / weight loss',type: 'boolean',     redFlag: true },
        ],
      },
    ],
  },

  'Headache': {
    label: 'Headache',
    icon: '🧠',
    category: 'Neurology',
    sections: [
      {
        id: 'hpi',
        label: 'History of Presenting Illness',
        redFlags: true,
        fields: [
          { id: 'onset',       label: 'Onset',                 type: 'select',      options: ['Thunderclap (sudden worst ever)','Acute hours','Subacute days','Chronic'] },
          { id: 'site',        label: 'Location',              type: 'select',      options: ['Frontal','Temporal (unilateral)','Temporal (bilateral)','Occipital','Global','Periorbital'] },
          { id: 'character',   label: 'Character',             type: 'select',      options: ['Throbbing','Pressure/band','Stabbing','Constant','Pulsatile'] },
          { id: 'severity',    label: 'Severity (0–10)',        type: 'slider',      min: 0, max: 10 },
          { id: 'thunderclap', label: 'Thunderclap onset',     type: 'boolean',     redFlag: true },
          { id: 'vomiting',    label: 'Vomiting',              type: 'boolean' },
          { id: 'photophobia', label: 'Photophobia / phonophobia',type:'boolean' },
          { id: 'neck_stiff',  label: 'Neck stiffness',        type: 'boolean',     redFlag: true },
          { id: 'fever',       label: 'Fever',                 type: 'boolean',     redFlag: true },
          { id: 'visual_chg',  label: 'Visual changes / aura', type: 'boolean' },
          { id: 'weakness',    label: 'Limb weakness / numbness',type:'boolean',    redFlag: true },
          { id: 'seizure',     label: 'Seizure',               type: 'boolean',     redFlag: true },
          { id: 'confusion',   label: 'Confusion / altered consciousness',type:'boolean',redFlag:true },
          { id: 'progressive', label: 'Progressive worsening', type: 'boolean',     redFlag: true },
          { id: 'morning_worse',label:'Worse in morning / with Valsalva',type:'boolean',redFlag:true },
          { id: 'triggers',    label: 'Triggers',              type: 'multiselect', options: ['Stress','Menstruation','Food','Sleep deprivation','Exertion','Bright lights','None identified'] },
        ],
      },
    ],
  },

  'Paediatric Fever': {
    label: 'Paediatric Fever',
    icon: '👶',
    category: 'Paediatrics',
    ageGroups: ['neonate', 'paed', 'adolescent'],
    sections: [
      {
        id: 'hpi',
        label: 'History of Presenting Illness',
        redFlags: true,
        fields: [
          { id: 'age_months',  label: 'Age (months)',          type: 'number' },
          { id: 'duration',    label: 'Duration of fever',     type: 'text' },
          { id: 'measured_temp',label:'Measured temperature (°C)',type:'number' },
          { id: 'feeding',     label: 'Feeding normally?',     type: 'boolean',     redFlag: true },
          { id: 'fluids',      label: 'Fluid intake adequate?',type: 'boolean',     redFlag: true },
          { id: 'urine_output',label: 'Urine output normal?',  type: 'boolean',     redFlag: true },
          { id: 'convulsions', label: 'Convulsions / seizures',type: 'boolean',     redFlag: true },
          { id: 'vax_status',  label: 'Vaccination up to date?',type:'boolean' },
          { id: 'sick_contacts',label:'Sick contacts / outbreak',type:'boolean' },
          { id: 'rash',        label: 'Rash / petechiae',      type: 'boolean',     redFlag: true },
          { id: 'neck_stiff',  label: 'Neck stiffness',        type: 'boolean',     redFlag: true },
          { id: 'bulging_fontanelle',label:'Bulging fontanelle (infants)',type:'boolean',redFlag:true, ageGroups:['neonate'] },
          { id: 'lethargy',    label: 'Lethargy / irritability',type:'boolean',     redFlag: true },
          { id: 'cough',       label: 'Cough / difficulty breathing',type:'boolean' },
          { id: 'diarrhoea',   label: 'Diarrhoea / vomiting',  type: 'boolean' },
          { id: 'ear_pull',    label: 'Ear pulling / ear pain', type: 'boolean' },
          { id: 'birth_hx',    label: 'Perinatal complications',type:'boolean',     ageGroups: ['neonate'] },
        ],
      },
    ],
  },

  'Obstetric Review': {
    label: 'Obstetric Review',
    icon: '🤰',
    category: 'Obstetrics',
    genderRestrict: 'female',
    sections: [
      {
        id: 'hpi',
        label: 'Current Pregnancy',
        redFlags: true,
        fields: [
          { id: 'gestation',   label: 'Gestation (weeks)',     type: 'number' },
          { id: 'gravida',     label: 'Gravida',               type: 'number' },
          { id: 'para',        label: 'Para',                  type: 'number' },
          { id: 'anc',         label: 'ANC attendance',        type: 'select',      options: ['Nil','1–2 visits','3–4 visits','≥5 visits'] },
          { id: 'bleeding',    label: 'PV bleeding',           type: 'boolean',     redFlag: true },
          { id: 'fetal_movement',label:'Fetal movements normal?',type:'boolean',    redFlag: true },
          { id: 'contractions',label: 'Contractions',          type: 'boolean' },
          { id: 'fluid_loss',  label: 'Fluid loss (ROM)',       type: 'boolean',     redFlag: true },
          { id: 'headache_epigastric',label:'Headache / epigastric pain',type:'boolean',redFlag:true },
          { id: 'visual_disturbance',label:'Visual disturbance',type:'boolean',    redFlag: true },
          { id: 'swelling',    label: 'Face / hand swelling',  type: 'boolean',     redFlag: true },
          { id: 'hiv_status',  label: 'HIV status',            type: 'select',      options: ['Negative','Positive on ART','Positive not on ART','Unknown'] },
          { id: 'syphilis_test',label:'Syphilis test done?',   type: 'boolean' },
          { id: 'diabetes',    label: 'GDM / diabetes',        type: 'boolean' },
          { id: 'bp_issues',   label: 'Hypertension in pregnancy',type:'boolean',   redFlag: true },
        ],
      },
    ],
  },

  'Diabetes Review': {
    label: 'Diabetes Review',
    icon: '🩸',
    category: 'Endocrine',
    sections: [
      {
        id: 'hpi',
        label: 'Diabetes History',
        fields: [
          { id: 'dm_type',     label: 'Diabetes type',         type: 'select',      options: ['Type 1','Type 2','MODY','GDM','Secondary'] },
          { id: 'duration',    label: 'Duration of DM',        type: 'text' },
          { id: 'last_hba1c',  label: 'Last HbA1c (%)',        type: 'number' },
          { id: 'home_glucose',label: 'Home glucose monitoring',type:'boolean' },
          { id: 'hypo_episodes',label:'Hypoglycaemic episodes', type: 'boolean',    redFlag: true },
          { id: 'hypo_freq',   label: 'Frequency of hypos',    type: 'select',      options: ['None','<1/month','1–4/month','>1/week','Daily'] },
          { id: 'hypo_awareness',label:'Hypo awareness intact?',type:'boolean' },
          { id: 'polyuria',    label: 'Polyuria',               type: 'boolean' },
          { id: 'polydipsia',  label: 'Polydipsia',             type: 'boolean' },
          { id: 'weight_change',label:'Recent weight change',   type: 'select',      options: ['Stable','Gaining','Losing'] },
          { id: 'foot_symptoms',label:'Foot symptoms (pain/numbness)',type:'boolean' },
          { id: 'visual_change',label:'Visual changes',         type: 'boolean' },
          { id: 'neuropathy',  label: 'Neuropathy symptoms',   type: 'boolean' },
          { id: 'nephropathy_known',label:'Known nephropathy',  type: 'boolean' },
          { id: 'diet_adherence',label:'Diet adherence',        type: 'select',      options: ['Good','Moderate','Poor'] },
          { id: 'exercise',    label: 'Exercise frequency',     type: 'select',      options: ['Daily','3–5×/week','1–2×/week','Rarely','None'] },
        ],
      },
    ],
  },

  'Stroke / TIA': {
    label: 'Stroke / TIA',
    icon: '🧠',
    category: 'Neurology',
    sections: [
      {
        id: 'hpi',
        label: 'Stroke History',
        redFlags: true,
        fields: [
          { id: 'onset_time',  label: 'Time of symptom onset',type: 'text',        placeholder: 'HH:MM — FAST protocol' },
          { id: 'last_well',   label: 'Last known well time', type: 'text' },
          { id: 'facial_droop',label: 'Facial droop',         type: 'boolean',     redFlag: true },
          { id: 'arm_weakness',label: 'Arm weakness',         type: 'boolean',     redFlag: true },
          { id: 'speech_disturbance',label:'Speech disturbance',type:'boolean',   redFlag: true },
          { id: 'visual_loss', label: 'Visual loss / diplopia',type: 'boolean',   redFlag: true },
          { id: 'headache',    label: 'Sudden severe headache',type:'boolean',    redFlag: true },
          { id: 'vomiting',    label: 'Vomiting',              type: 'boolean' },
          { id: 'seizure',     label: 'Seizure at onset',      type: 'boolean' },
          { id: 'prior_tia',   label: 'Prior TIA / stroke',    type: 'boolean',   redFlag: true },
          { id: 'af',          label: 'Atrial fibrillation',   type: 'boolean' },
          { id: 'anticoag',    label: 'On anticoagulants',     type: 'boolean' },
          { id: 'thrombolytics',label:'Thrombolysis candidate?',type:'boolean' },
        ],
      },
    ],
  },

};

// ── STANDARD HISTORY SECTIONS ────────────────────────────────
export const STANDARD_HISTORY_SECTIONS = {

  pmhx: {
    id: 'pmhx',
    label: 'Past Medical History',
    fields: [
      { id: 'conditions',     label: 'Chronic conditions',     type: 'text',  prefillKey: 'chronicIllnesses',  placeholder: 'e.g. HTN, T2DM, Asthma' },
      { id: 'admissions',     label: 'Previous admissions',    type: 'text',  placeholder: 'Date, hospital, reason' },
      { id: 'surgeries',      label: 'Previous surgeries',     type: 'text',  prefillKey: 'pastSurgeries',      placeholder: 'e.g. Appendicectomy 2012' },
      { id: 'childhood_illnesses',label:'Childhood illnesses', type: 'text',  placeholder: 'e.g. Measles, Sickle cell' },
      { id: 'blood_transfusion',label:'Blood transfusions',    type: 'boolean' },
    ],
  },

  medications: {
    id: 'medications',
    label: 'Drug History',
    fields: [
      { id: 'current_meds',   label: 'Current medications',    type: 'text',  prefillKey: 'currentMeds',        placeholder: 'Drug, dose, frequency' },
      { id: 'otc',            label: 'OTC / herbal / supplements',type:'text', placeholder: 'e.g. multivitamins, herbal tea' },
      { id: 'contraceptives', label: 'Contraceptives',          type: 'text',  genderRestrict: 'female',         placeholder: 'e.g. COC, DMPA, implant' },
      { id: 'recent_antibiotics',label:'Recent antibiotics',    type: 'boolean' },
      { id: 'steroids_recent',label: 'Recent steroids / immunosuppressants',type:'boolean' },
      { id: 'adherence',      label: 'Medication adherence',   type: 'select', options: ['Good','Moderate','Poor','Not applicable'] },
    ],
  },

  allergies: {
    id: 'allergies',
    label: 'Allergies',
    fields: [
      { id: 'allergens',      label: 'Known allergens',         type: 'text',  prefillKey: 'allergies',          placeholder: 'Drug / substance name' },
      { id: 'reaction',       label: 'Nature of reaction',      type: 'text',  placeholder: 'e.g. Anaphylaxis, rash, GI upset' },
      { id: 'latex',          label: 'Latex allergy',           type: 'boolean' },
      { id: 'food_allergy',   label: 'Food allergy',            type: 'boolean' },
      { id: 'nkda',           label: 'NKDA (No Known Drug Allergy)',type:'boolean' },
    ],
  },

  family_hx: {
    id: 'family_hx',
    label: 'Family History',
    fields: [
      { id: 'family',         label: 'Family history',          type: 'text',  prefillKey: 'familyHistory',      placeholder: 'Condition, relation, age at onset' },
      { id: 'ihd',            label: 'IHD / premature cardiac death',type:'boolean' },
      { id: 'dm_family',      label: 'Diabetes mellitus',       type: 'boolean' },
      { id: 'cancer',         label: 'Malignancy',              type: 'boolean' },
      { id: 'scd',            label: 'Sudden cardiac death',    type: 'boolean', redFlag: true },
      { id: 'genetic_condition',label:'Known genetic conditions',type:'text' },
    ],
  },

  social_hx: {
    id: 'social_hx',
    label: 'Social History',
    fields: [
      { id: 'smoking',        label: 'Smoking status',          type: 'select', options: ['Never','Ex-smoker','Current (cigarettes)','Current (shisha)','Passive'] },
      { id: 'pack_years',     label: 'Pack years (if applicable)',type:'number' },
      { id: 'alcohol',        label: 'Alcohol use',             type: 'select', options: ['None','Occasional (<14u/week)','Moderate (14–21u)','Heavy (>21u)','Dependent'] },
      { id: 'occupation',     label: 'Occupation / employment', type: 'text',  prefillKey: 'occupation' },
      { id: 'living_situation',label:'Living situation',        type: 'select', options: ['With family','Alone','Care home','Homeless'] },
      { id: 'marital_status', label: 'Marital status',          type: 'select', options: ['Single','Married','Divorced','Widowed'] },
      { id: 'travel',         label: 'Recent international travel',type:'text', placeholder: 'Destination, duration' },
      { id: 'sexual_hx',      label: 'Sexual history (if clinically relevant)',type:'text' },
      { id: 'recreational_drugs',label:'Recreational drug use', type: 'boolean' },
      { id: 'hiv_risk',       label: 'HIV risk factors',        type: 'boolean' },
      { id: 'functional_status',label:'Functional / ADL status',type:'select',  options: ['Independent','Partly dependent','Fully dependent'] },
    ],
  },

  systems_review: {
    id: 'systems_review',
    label: 'Systems Review',
    fields: [
      { id: 'cvs',    label: 'CVS: palpitations, oedema, orthopnoea, PND',    type: 'text' },
      { id: 'resp',   label: 'Resp: cough, wheeze, haemoptysis, SOB',          type: 'text' },
      { id: 'gi',     label: 'GI: nausea, vomiting, dysphagia, bowel habit',   type: 'text' },
      { id: 'renal',  label: 'Renal: dysuria, haematuria, polyuria, nocturia', type: 'text' },
      { id: 'neuro',  label: 'Neuro: headache, dizziness, vision, weakness, seizures', type: 'text' },
      { id: 'msk',    label: 'MSK: joint pain, swelling, stiffness, weakness', type: 'text' },
      { id: 'skin',   label: 'Skin: rash, pruritis, jaundice, lesions',        type: 'text' },
      { id: 'haem',   label: 'Haem: easy bruising, bleeding, lymphadenopathy', type: 'text' },
      { id: 'endo',   label: 'Endo: polyuria, polydipsia, heat/cold intolerance, weight change', type: 'text' },
      { id: 'psych',  label: 'Psych: mood, sleep, appetite, cognition',        type: 'text' },
    ],
  },

};

// ── AUTO-PREFILL MAP ─────────────────────────────────────────
// Maps section.fieldId → function(patient) => value
export const PREFILL_MAP = {
  'pmhx.conditions':    (p) => (p.chronicIllnesses || []).join(', '),
  'pmhx.surgeries':     (p) => (p.pastSurgeries || []).join(', '),
  'medications.current_meds': (p) => (p.currentMeds || []).map(m => `${m.name} ${m.dose} ${m.frequency || ''}`).join(', '),
  'allergies.allergens':(p) => (p.allergies || []).join(', '),
  'family_hx.family':   (p) => p.familyHistory || '',
  'social_hx.occupation':(p)=> p.occupation || '',
};

// ── HISTORY FLOW MATCHER ────────────────────────────────────
export function getHistoryFlow(chiefComplaint, ageGroup, gender) {
  const cc = chiefComplaint.toLowerCase();
  if (cc.includes('chest') || cc.includes('cardiac'))                     return HISTORY_FLOWS['Chest Pain'];
  if (cc.includes('breath') || cc.includes('dyspnoea') || cc.includes('sob')) return HISTORY_FLOWS['Shortness of Breath'];
  if (cc.includes('fever') || cc.includes('pyrexia') || cc.includes('temperature')) {
    return (['neonate','paed'].includes(ageGroup)) ? HISTORY_FLOWS['Paediatric Fever'] : HISTORY_FLOWS['Fever / Pyrexia'];
  }
  if (cc.includes('abdom') || cc.includes('belly') || cc.includes('stomach')) return HISTORY_FLOWS['Abdominal Pain'];
  if (cc.includes('headache') || cc.includes('head'))                     return HISTORY_FLOWS['Headache'];
  if (cc.includes('stroke') || cc.includes('tia') || cc.includes('weakness') || cc.includes('facial')) return HISTORY_FLOWS['Stroke / TIA'];
  if (cc.includes('diabet') || cc.includes('glucose') || cc.includes('sugar')) return HISTORY_FLOWS['Diabetes Review'];
  if ((cc.includes('pregnan') || cc.includes('antenatal') || cc.includes('obstet')) && gender?.toLowerCase() === 'female') return HISTORY_FLOWS['Obstetric Review'];
  return null;
}

// ── EXAMINATION TEMPLATES ─────────────────────────────────────
export const EXAMINATION_TEMPLATES = {

  general: {
    label: 'General Examination',
    icon: '👁️',
    fields: [
      { id: 'appearance',   label: 'General appearance',       type: 'select',  options: ['Well','Unwell','Acutely distressed','Obtunded','Cachectic','Obese'] },
      { id: 'temp',         label: 'Temperature (°C)',          type: 'number',  unit: '°C',    refRange: '36.5–37.5' },
      { id: 'pulse',        label: 'Pulse (bpm)',               type: 'number',  unit: 'bpm',   refRange: '60–100' },
      { id: 'pulse_char',   label: 'Pulse character',           type: 'select',  options: ['Regular','Irregularly irregular','Regularly irregular','Weak/thready','Bounding'] },
      { id: 'sbp',          label: 'Systolic BP (mmHg)',        type: 'number',  unit: 'mmHg' },
      { id: 'dbp',          label: 'Diastolic BP (mmHg)',       type: 'number',  unit: 'mmHg' },
      { id: 'rr',           label: 'Resp Rate (rpm)',           type: 'number',  unit: 'rpm',   refRange: '12–20' },
      { id: 'spo2',         label: 'SpO₂ (%)',                  type: 'number',  unit: '%',     refRange: '>94' },
      { id: 'weight',       label: 'Weight (kg)',               type: 'number',  unit: 'kg' },
      { id: 'height',       label: 'Height (cm)',               type: 'number',  unit: 'cm' },
      { id: 'bmi',          label: 'BMI (auto-calc)',           type: 'text',    placeholder: 'Auto-calculated' },
      { id: 'pallor',       label: 'Pallor',                    type: 'boolean' },
      { id: 'jaundice',     label: 'Jaundice (icterus)',        type: 'boolean' },
      { id: 'cyanosis',     label: 'Central cyanosis',          type: 'boolean' },
      { id: 'peripheral_cyanosis',label:'Peripheral cyanosis',  type: 'boolean' },
      { id: 'clubbing',     label: 'Finger clubbing',           type: 'boolean' },
      { id: 'koilonychia',  label: 'Koilonychia',               type: 'boolean' },
      { id: 'leukonychia',  label: 'Leukonychia',               type: 'boolean' },
      { id: 'oedema',       label: 'Peripheral oedema',         type: 'boolean' },
      { id: 'oedema_grade', label: 'Oedema grade',              type: 'select',  options: ['Trace +','Mild ++','Moderate +++','Severe ++++'] },
      { id: 'lad',          label: 'Lymphadenopathy',           type: 'boolean' },
      { id: 'lad_sites',    label: 'LAD sites',                 type: 'multiselect', options: ['Cervical','Submandibular','Axillary','Inguinal','Generalised'] },
      { id: 'hydration',    label: 'Hydration status',          type: 'select',  options: ['Well hydrated','Mildly dehydrated','Moderately dehydrated','Severely dehydrated'] },
    ],
  },

  cvs: {
    label: 'Cardiovascular',
    icon: '❤️',
    fields: [
      { id: 'apex',         label: 'Apex beat location',        type: 'select',  options: ['5th ICS MCL','Displaced laterally','Displaced inferiorly','Not palpable','Heaving','Thrusting'] },
      { id: 'thrills',      label: 'Thrills',                   type: 'boolean' },
      { id: 'jvp',          label: 'JVP',                       type: 'select',  options: ['Not raised','Raised (specify cm)','Markedly raised','Kussmaul positive'] },
      { id: 'jvp_cm',       label: 'JVP height (cm above sternal angle)',type:'number' },
      { id: 'hs',           label: 'Heart sounds',              type: 'select',  options: ['S1+S2 normal','Soft S1','Loud S1','S3 (gallop)','S4 present','Muffled','Added sounds present'] },
      { id: 'murmurs',      label: 'Murmurs',                   type: 'text',    placeholder: 'Grade, site, radiation, timing' },
      { id: 'rub',          label: 'Pericardial rub',           type: 'boolean' },
      { id: 'radiofem',     label: 'Radio-femoral delay',        type: 'boolean' },
      { id: 'pulses_sym',   label: 'Peripheral pulses',         type: 'select',  options: ['Equal bilaterally','Reduced right','Reduced left','Absent right','Absent left'] },
      { id: 'ankle_brachial',label:'Ankle-brachial index noted',type: 'boolean' },
      { id: 'varicosities', label: 'Varicosities',               type: 'boolean' },
      { id: 'carotid_bruit',label: 'Carotid bruit',             type: 'boolean' },
    ],
  },

  resp: {
    label: 'Respiratory',
    icon: '🫁',
    fields: [
      { id: 'chest_shape',  label: 'Chest shape',               type: 'select',  options: ['Normal','Barrel chest','Pectus excavatum','Pectus carinatum','Kyphoscoliosis','Scoliosis'] },
      { id: 'use_of_acc_muscles',label:'Use of accessory muscles',type:'boolean' },
      { id: 'intercostal_recession',label:'Intercostal recession',type:'boolean' },
      { id: 'expansion',    label: 'Chest expansion',           type: 'select',  options: ['Equal bilaterally','Reduced right','Reduced left','Poor bilaterally'] },
      { id: 'trachea',      label: 'Trachea position',          type: 'select',  options: ['Central','Deviated right','Deviated left'] },
      { id: 'percussion_r', label: 'Percussion — right',        type: 'select',  options: ['Resonant','Dull (upper)','Dull (middle)','Dull (lower)','Stony dull','Hyperresonant'] },
      { id: 'percussion_l', label: 'Percussion — left',         type: 'select',  options: ['Resonant','Dull (upper)','Dull (middle)','Dull (lower)','Stony dull','Hyperresonant'] },
      { id: 'breath_sounds',label: 'Breath sounds',             type: 'select',  options: ['Vesicular bilaterally','Bronchial right','Bronchial left','Reduced right','Reduced left','Absent right','Absent left'] },
      { id: 'crackles',     label: 'Crackles (crepitations)',   type: 'multiselect', options: ['None','Right upper','Right middle','Right lower','Left upper','Left middle','Left lower','Bilateral basal','Diffuse'] },
      { id: 'wheeze',       label: 'Wheeze',                    type: 'multiselect', options: ['None','Expiratory','Inspiratory','Biphasic','Right','Left','Bilateral'] },
      { id: 'pleural_rub',  label: 'Pleural rub',               type: 'boolean' },
      { id: 'vocal_resonance',label:'Vocal resonance',          type: 'select',  options: ['Normal','Increased','Decreased','Absent'] },
    ],
  },

  abdomen: {
    label: 'Abdominal',
    icon: '🫃',
    fields: [
      { id: 'inspection',   label: 'Inspection',                type: 'multiselect', options: ['Normal','Distended','Scars (specify)','Visible peristalsis','Caput medusae','Herniae','Stoma'] },
      { id: 'distension',   label: 'Distension',                type: 'select',  options: ['Absent','Mild','Moderate','Severe'] },
      { id: 'tenderness_site',label:'Site of tenderness',       type: 'select',  options: ['None','RUQ','LUQ','Epigastric','Periumbilical','RIF','LIF','Suprapubic','Diffuse'] },
      { id: 'guarding',     label: 'Guarding',                  type: 'boolean', redFlag: true },
      { id: 'rigidity',     label: 'Rigidity (board-like)',     type: 'boolean', redFlag: true },
      { id: 'rebound',      label: 'Rebound tenderness',        type: 'boolean', redFlag: true },
      { id: 'murphy',       label: "Murphy's sign",              type: 'boolean' },
      { id: 'mcburney',     label: "McBurney's point tenderness",type:'boolean' },
      { id: 'liver',        label: 'Liver (cm below costal margin)',type:'text',  placeholder: 'e.g. 3 cm, smooth, tender' },
      { id: 'spleen',       label: 'Spleen',                    type: 'select',  options: ['Not palpable','Just palpable','2–5 cm (moderate)','5–10 cm (large)','>10 cm (massive)'] },
      { id: 'kidneys',      label: 'Kidneys',                   type: 'select',  options: ['Not palpable','Right ballotable','Left ballotable','Bilateral enlarged'] },
      { id: 'ascites',      label: 'Ascites',                   type: 'boolean' },
      { id: 'ascites_sign', label: 'Shifting dullness / fluid thrill',type:'boolean' },
      { id: 'bowel_sounds', label: 'Bowel sounds',              type: 'select',  options: ['Normal','Increased (tinkling)','Reduced','Absent'] },
      { id: 'pr_exam',      label: 'PR exam done',              type: 'boolean' },
      { id: 'pr_findings',  label: 'PR findings',               type: 'text' },
    ],
  },

  neuro: {
    label: 'Neurological',
    icon: '🧠',
    fields: [
      { id: 'consciousness',label: 'Level of consciousness (AVPU)',type:'select',options:['Alert','Voice-responsive','Pain-responsive','Unresponsive'] },
      { id: 'gcs_e',        label: 'GCS — Eye',                 type: 'number',  refRange: '4' },
      { id: 'gcs_v',        label: 'GCS — Verbal',              type: 'number',  refRange: '5' },
      { id: 'gcs_m',        label: 'GCS — Motor',               type: 'number',  refRange: '6' },
      { id: 'orientation',  label: 'Orientation',               type: 'select',  options: ['Fully oriented (T/P/Pl)','Disoriented to time','Disoriented to place','Disoriented to person','Unorientable'] },
      { id: 'pupils_l',     label: 'Left pupil (mm)',            type: 'number' },
      { id: 'pupils_r',     label: 'Right pupil (mm)',           type: 'number' },
      { id: 'pupils_react', label: 'Pupil reactivity',          type: 'select',  options: ['Equal, reactive bilaterally','Sluggish bilateral','Fixed dilated bilateral','Anisocoria','Horner syndrome'] },
      { id: 'facial_asymm', label: 'Facial asymmetry',          type: 'boolean' },
      { id: 'dysarthria',   label: 'Dysarthria',                 type: 'boolean' },
      { id: 'dysphasia',    label: 'Dysphasia / aphasia',        type: 'boolean' },
      { id: 'power_ru',     label: 'Power — Right upper limb',  type: 'select',  options: ['5/5','4/5','3/5','2/5','1/5','0/5'] },
      { id: 'power_lu',     label: 'Power — Left upper limb',   type: 'select',  options: ['5/5','4/5','3/5','2/5','1/5','0/5'] },
      { id: 'power_rl',     label: 'Power — Right lower limb',  type: 'select',  options: ['5/5','4/5','3/5','2/5','1/5','0/5'] },
      { id: 'power_ll',     label: 'Power — Left lower limb',   type: 'select',  options: ['5/5','4/5','3/5','2/5','1/5','0/5'] },
      { id: 'tone',         label: 'Tone',                      type: 'select',  options: ['Normal bilaterally','Hypertonia (right)','Hypertonia (left)','Hypotonia (right)','Hypotonia (left)','Spastic','Rigidity','Flaccid'] },
      { id: 'reflexes',     label: 'Deep tendon reflexes',      type: 'select',  options: ['Normal (2+) bilaterally','Hyperreflexia','Hyporeflexia','Absent','Asymmetric'] },
      { id: 'plantar',      label: 'Plantar response',          type: 'select',  options: ['Flexor bilaterally (normal)','Right extensor (Babinski +)','Left extensor (Babinski +)','Bilateral extensor','Equivocal'] },
      { id: 'sensation',    label: 'Sensation',                 type: 'select',  options: ['Intact all modalities','Reduced light touch','Reduced proprioception','Glove-and-stocking loss','Hemisensory loss right','Hemisensory loss left'] },
      { id: 'cerebellar',   label: 'Cerebellar signs',          type: 'boolean' },
      { id: 'meningism',    label: 'Neck stiffness / meningism',type: 'boolean', redFlag: true },
      { id: 'kernig',       label: "Kernig's sign",              type: 'boolean', redFlag: true },
      { id: 'brudzinski',   label: "Brudzinski's sign",          type: 'boolean', redFlag: true },
    ],
  },

  msk: {
    label: 'Musculoskeletal',
    icon: '🦴',
    fields: [
      { id: 'gait',         label: 'Gait',                      type: 'select',  options: ['Normal','Antalgic','Trendelenburg','Ataxic','Spastic','Steppage','Hemiplegic'] },
      { id: 'joints_affected',label:'Joints affected',          type: 'multiselect', options: ['Neck','Shoulders','Elbows','Wrists','MCP/PIP','Hips','Knees','Ankles','MTPs','Spine','Sacroiliac'] },
      { id: 'swelling',     label: 'Joint swelling',            type: 'boolean' },
      { id: 'warmth',       label: 'Warmth / erythema',         type: 'boolean' },
      { id: 'effusion',     label: 'Effusion',                  type: 'boolean' },
      { id: 'crepitus',     label: 'Crepitus',                  type: 'boolean' },
      { id: 'tenderness',   label: 'Tenderness',                type: 'boolean' },
      { id: 'rom',          label: 'Range of movement',         type: 'select',  options: ['Full','Mildly restricted','Moderately restricted','Severely restricted','Fixed deformity'] },
      { id: 'deformity',    label: 'Deformity',                 type: 'text',    placeholder: 'e.g. ulnar deviation, valgus' },
      { id: 'muscle_wasting',label:'Muscle wasting',            type: 'boolean' },
    ],
  },

  skin: {
    label: 'Dermatological',
    icon: '🫶',
    fields: [
      { id: 'rash_morphology',label:'Rash morphology',          type: 'select',  options: ['Macules','Papules','Vesicles','Pustules','Bullae','Plaques','Petechiae','Purpura','Ecchymosis','Nodules','Urticaria'] },
      { id: 'rash_distribution',label:'Distribution',           type: 'multiselect', options: ['Face','Trunk','Upper limbs','Lower limbs','Flexures','Extensor surfaces','Palms/soles','Generalised','Localised'] },
      { id: 'petechiae',    label: 'Petechiae / purpura',       type: 'boolean', redFlag: true },
      { id: 'jaundice_skin',label: 'Jaundice',                  type: 'boolean' },
      { id: 'cyanosis_skin',label: 'Cyanosis',                  type: 'boolean' },
      { id: 'wounds',       label: 'Wounds / ulcers',           type: 'text',    placeholder: 'Site, size, depth, base, edges' },
    ],
  },

  ent: {
    label: 'ENT',
    icon: '👂',
    fields: [
      { id: 'ear_ext',      label: 'External ear / canal',      type: 'text' },
      { id: 'tympanic_r',   label: 'R tympanic membrane',       type: 'select',  options: ['Intact/normal','Dull/congested','Perforation','Bulging','Retracted'] },
      { id: 'tympanic_l',   label: 'L tympanic membrane',       type: 'select',  options: ['Intact/normal','Dull/congested','Perforation','Bulging','Retracted'] },
      { id: 'throat',       label: 'Oropharynx / tonsils',      type: 'select',  options: ['Normal','Erythematous','Tonsillar enlargement','Exudate','Peritonsillar swelling'] },
      { id: 'nasal',        label: 'Nasal exam',                type: 'text' },
      { id: 'lymph_nodes',  label: 'Cervical lymph nodes',      type: 'boolean' },
    ],
  },

  eyes: {
    label: 'Ophthalmology',
    icon: '👁️',
    fields: [
      { id: 'va_r',         label: 'Visual acuity — Right (LogMAR/Snellen)',type:'text' },
      { id: 'va_l',         label: 'Visual acuity — Left',      type: 'text' },
      { id: 'visual_fields',label: 'Visual fields',             type: 'select',  options: ['Full to confrontation','Left homonymous hemianopia','Right homonymous hemianopia','Bitemporal hemianopia','Central scotoma'] },
      { id: 'fundus',       label: 'Fundoscopy',                type: 'text',    placeholder: 'Cup:disc, vessels, haemorrhages, exudates' },
      { id: 'iop',          label: 'IOP (if measured)',         type: 'text' },
      { id: 'papilloedema', label: 'Papilloedema',              type: 'boolean', redFlag: true },
    ],
  },

  paediatric: {
    label: 'Paediatric Specific',
    icon: '👶',
    ageGroups: ['neonate', 'paed'],
    fields: [
      { id: 'fontanelle',   label: 'Anterior fontanelle',       type: 'select',  options: ['Flat/normal','Bulging','Sunken','Closed'], ageGroups: ['neonate'] },
      { id: 'head_circ',    label: 'Head circumference (cm)',   type: 'number', ageGroups: ['neonate', 'paed'] },
      { id: 'growth_chart', label: 'Weight for age centile',    type: 'select',  options: ['3rd–97th centile (normal)','<3rd centile','<-2 SD (stunted)','<-3 SD (severely stunted)','Overweight >97th'] },
      { id: 'nutritional_status',label:'Nutritional status',    type: 'select',  options: ['Normal','Moderate acute malnutrition','Severe acute malnutrition','Underweight','Overweight'] },
      { id: 'muac',         label: 'MUAC (cm)',                 type: 'number' },
      { id: 'chest_indrawing',label:'Chest indrawing',          type: 'boolean', redFlag: true },
      { id: 'nasal_flaring',label: 'Nasal flaring',             type: 'boolean' },
      { id: 'grunting',     label: 'Grunting',                  type: 'boolean', redFlag: true },
      { id: 'stridor',      label: 'Stridor',                   type: 'boolean', redFlag: true },
      { id: 'milestones',   label: 'Developmental milestones',  type: 'select',  options: ['Appropriate for age','Delayed gross motor','Delayed fine motor','Delayed speech','Globally delayed'] },
      { id: 'skin_turgor',  label: 'Skin turgor',               type: 'select',  options: ['Normal','Reduced','Tenting (severe dehydration)'] },
      { id: 'capillary_refill',label:'Capillary refill time',   type: 'select',  options: ['<2 seconds (normal)','2–3 seconds','3–4 seconds','>4 seconds (critical)'] },
    ],
  },

};

// ── INVESTIGATION RULES ───────────────────────────────────────
export const INVESTIGATION_RULES = {

  'Hypertension': {
    urgent:  ['U&E', 'Creatinine', 'ECG', 'Urinalysis'],
    routine: ['FBC', 'Lipid profile', 'Fasting glucose', 'Thyroid function', 'Echocardiogram', 'Renal USS', 'Urine albumin:creatinine ratio', 'Fundoscopy'],
    pathway: 'HTN Target Organ Damage Workup',
    links:   ['Cardiology outpatient'],
  },

  'Type 2 DM': {
    urgent:  ['Random blood glucose', 'HbA1c', 'U&E'],
    routine: ['FBC', 'Lipid profile', 'LFT', 'Urine R&M + ACR (microalbuminuria)', 'Fundoscopy (diabetic eye)', 'Foot exam (monofilament)', 'eGFR'],
    pathway: 'DM Annual Review Protocol',
  },

  'Chest Pain': {
    urgent:  ['ECG (12-lead)', 'Troponin I / hs-Troponin', 'FBC', 'U&E', 'CXR', 'D-dimer', 'BNP'],
    routine: ['Echocardiogram', 'Lipid profile', 'Stress test / exercise ECG', 'CT Coronary Angiogram', 'Holter monitor'],
    pathway: 'ACS Pathway (HEART score)',
  },

  'Sepsis': {
    urgent:  ['FBC + differential', 'CRP', 'Blood Culture ×2', 'Lactate', 'LFT', 'U&E', 'Creatinine', 'Procalcitonin', 'Blood gas (ABG/VBG)', 'Urine C&S', 'CXR'],
    routine: ['Serial lactate', 'Coagulation (PT, APTT, D-dimer)', 'Peripheral film'],
    pathway: 'Sepsis Six Bundle',
  },

  'Pneumonia': {
    urgent:  ['CXR (PA + lateral)', 'FBC', 'CRP', 'Blood culture ×2', 'Sputum C&S'],
    routine: ['Procalcitonin', 'U&E', 'Legionella / Pneumococcal urinary antigen', 'Pleural fluid MC&S (if effusion)', 'HIV test (if unknown)'],
    pathway: 'CAP Severity — CURB-65',
  },

  'Malaria': {
    urgent:  ['Thick & thin blood film', 'RDT (malaria antigen)', 'FBC', 'U&E', 'LFT', 'Random glucose', 'Blood culture'],
    routine: ['Urine R&M', 'Haematinics (if anaemia)'],
    pathway: 'WHO Malaria Treatment Protocol',
  },

  'Anaemia': {
    urgent:  ['FBC + reticulocyte count', 'Peripheral blood film', 'Blood group & crossmatch'],
    routine: ['Serum ferritin', 'Serum iron / TIBC / transferrin saturation', 'Vitamin B12 & folate', 'LFT', 'Bone marrow aspirate/trephine (if unexplained)', 'Haemoglobin electrophoresis', 'Coombs test (DHAT)', 'Stool for O&P'],
    pathway: 'Anaemia Workup Algorithm',
  },

  'AKI': {
    urgent:  ['U&E + creatinine (serial)', 'eGFR', 'Urine R&M + urine sodium', 'Urine output chart', 'Renal USS', 'Blood gas', 'FBC'],
    routine: ['LFT', 'Albumin', 'Coagulation', 'Immunology screen (ANA, ANCA, anti-GBM)', 'Biopsy (if no clear cause)'],
    pathway: 'AKI Kidney Disease Improving Global Outcomes (KDIGO)',
  },

  'Heart Failure': {
    urgent:  ['CXR', 'ECG', 'BNP / NT-proBNP', 'FBC', 'U&E', 'Troponin'],
    routine: ['Echocardiogram (urgent)', 'LFT', 'Thyroid function', 'Lipid profile', 'Holter'],
    pathway: 'HF Assessment — ESC Guidelines',
  },

  'Neonatal Sepsis': {
    urgent:  ['FBC + differential', 'CRP', 'Blood culture (peripheral ×1, umbilical ×1)', 'Lumbar puncture (CSF)', 'Blood gas', 'Glucose', 'Urine bag specimen C&S'],
    routine: ['CXR', 'LFT', 'Procalcitonin', 'Serial CRP'],
    pathway: 'Neonatal Sepsis Protocol — WHO ETAT+',
  },

  'DVT': {
    urgent:  ['D-dimer', 'FBC', 'Coagulation', 'Lower limb Doppler USS'],
    routine: ['Thrombophilia screen (protein C, S, ATIII, Factor V Leiden — after 3 months off anticoag)', 'Cancer screen if unprovoked (PSA, CA-125, CT Chest/Abdomen/Pelvis)'],
    pathway: 'Wells DVT Score → Imaging',
  },

  'Pulmonary Embolism': {
    urgent:  ['D-dimer', 'Blood gas (ABG)', 'ECG', 'CXR', 'Troponin', 'BNP', 'CT Pulmonary Angiogram (CTPA)', 'FBC', 'U&E'],
    routine: ['Lower limb Doppler USS', 'Echocardiogram', 'Thrombophilia screen'],
    pathway: 'Geneva / Wells PE Score → CTPA',
  },

  'Stroke': {
    urgent:  ['Non-contrast CT head (immediate)', 'ECG', 'FBC', 'Coagulation', 'Glucose', 'U&E', 'Lipid profile', 'Blood culture (if febrile)'],
    routine: ['MRI brain + DWI', 'MRA/CTA', 'Carotid Doppler', 'Echocardiogram', '24-hour Holter (AF screening)'],
    pathway: 'FAST Stroke Pathway → thrombolysis window',
  },

  'Meningitis': {
    urgent:  ['Non-contrast CT head', 'Lumbar puncture (CSF: opening pressure, protein, glucose, MC&S, PCR)', 'Blood culture ×2', 'FBC', 'CRP', 'U&E', 'Blood glucose', 'Coagulation'],
    routine: ['PCR panel (bacterial, viral, TB, fungal)', 'India ink / cryptococcal antigen', 'Throat swab'],
    pathway: 'Bacterial Meningitis — 6-hour antibiotic target',
  },

  'Tuberculosis': {
    urgent:  ['Sputum AFB ×3', 'GeneXpert MTB/RIF', 'CXR (PA)', 'HIV test', 'FBC', 'LFT', 'U&E'],
    routine: ['Mantoux test', 'IGRA', 'CT Chest', 'Bronchoscopy + BAL', 'Culture & DST (drug sensitivity)', 'Lymph node biopsy (if extrapulmonary)'],
    pathway: 'Kenya / WHO TB Diagnostic Algorithm',
  },

  'Pre-eclampsia': {
    urgent:  ['BP (serial)', 'Urine protein (dipstick / PCR)', 'FBC (platelets)', 'LFT', 'U&E', 'Creatinine', 'LDH', 'Blood group & crossmatch', 'CTG'],
    routine: ['Coagulation', 'USS fetal biometry / Doppler', 'Ophthalmology review'],
    pathway: 'Pre-eclampsia HELLP Pathway',
  },

  'DKA': {
    urgent:  ['Blood gas (ABG)', 'Blood glucose (CBG)', 'U&E + creatinine', 'FBC', 'Urinalysis + ketones', 'Blood culture', 'Serum ketones', 'ECG'],
    routine: ['CXR', 'HbA1c', 'Lactate', 'Phosphate + Magnesium'],
    pathway: 'DKA Management Protocol — hourly glucose/K+',
  },

  'Sickle Cell Crisis': {
    urgent:  ['FBC + reticulocytes', 'Blood group + crossmatch', 'Blood film', 'U&E', 'LFT', 'Urine R&M', 'Blood culture (if febrile)', 'CXR (if ACS suspected)'],
    routine: ['HbS electrophoresis (if not known)', 'G6PD screen', 'Echocardiogram'],
    pathway: 'Acute Sickle Crisis — VOC/ACS Protocol',
  },

};

// ── EXAM TEMPLATES MATCHER ────────────────────────────────────
export function getExamTemplatesForImpression(impressions, ageGroup, gender) {
  const imps = (impressions || []).map(i => i.toLowerCase());
  const suggested = [];
  if (imps.some(i => i.includes('chest')||i.includes('cardiac')||i.includes('heart')||i.includes('hypertension')||i.includes('af')||i.includes('failure'))) suggested.push('cvs');
  if (imps.some(i => i.includes('pneum')||i.includes('asthma')||i.includes('copd')||i.includes('resp')||i.includes('tb')||i.includes('pe'))) suggested.push('resp');
  if (imps.some(i => i.includes('abdom')||i.includes('liver')||i.includes('bowel')||i.includes('appendix')||i.includes('gi'))) suggested.push('abdomen');
  if (imps.some(i => i.includes('stroke')||i.includes('seizure')||i.includes('meningitis')||i.includes('headache')||i.includes('neuro'))) suggested.push('neuro');
  if (imps.some(i => i.includes('arthri')||i.includes('joint')||i.includes('msk')||i.includes('musculo'))) suggested.push('msk');
  if (['neonate','paed'].includes(ageGroup)) suggested.push('paediatric');
  suggested.push('general');
  return [...new Set(suggested)];
}

// ── INVESTIGATIONS GETTER ────────────────────────────────────
export function getInvestigationsForImpression(impressions) {
  const urgent = [], routine = [], pathways = [];
  (impressions || []).forEach(imp => {
    const rule = INVESTIGATION_RULES[imp];
    if (!rule) return;
    rule.urgent?.forEach(t => { if (!urgent.includes(t)) urgent.push(t); });
    rule.routine?.forEach(t => { if (!routine.includes(t)) routine.push(t); });
    if (rule.pathway && !pathways.includes(rule.pathway)) pathways.push(rule.pathway);
  });
  return { urgent, routine, pathways };
}

// ── MONITORING PROTOCOLS ─────────────────────────────────────
export const MONITORING_PROTOCOLS = {

  'Hypertension': {
    label: 'HTN Monitoring Protocol',
    icon: '❤️',
    parameters: [
      { id: 'sbp',     icon: '❤️',  label: 'Systolic BP',    unit: 'mmHg',   target: '<130 mmHg',     frequency: 'Every visit' },
      { id: 'dbp',     icon: '💙',  label: 'Diastolic BP',   unit: 'mmHg',   target: '<80 mmHg',      frequency: 'Every visit' },
      { id: 'weight',  icon: '⚖️',  label: 'Weight / BMI',   unit: 'kg',     target: 'BMI 18.5–25',   frequency: 'Monthly' },
      { id: 'pulse',   icon: '💓',  label: 'Heart Rate',     unit: 'bpm',    target: '60–100 bpm',    frequency: 'Every visit' },
    ],
    labs: ['U&E 3-monthly', 'Creatinine 6-monthly', 'Lipid profile annually', 'Urine ACR annually'],
    review_frequency: 'Every 1–3 months until controlled, then 6-monthly',
  },

  'Type 2 DM': {
    label: 'DM Monitoring Protocol',
    icon: '🩸',
    parameters: [
      { id: 'glucose', icon: '🩸',  label: 'Blood Glucose',  unit: 'mmol/L', target: 'FBS 4–7 / PP <10', frequency: 'Daily (CBG)' },
      { id: 'weight',  icon: '⚖️',  label: 'Weight',         unit: 'kg',     target: 'BMI <25',           frequency: 'Monthly' },
      { id: 'sbp',     icon: '❤️',  label: 'Blood Pressure', unit: 'mmHg',   target: '<130/80 mmHg',      frequency: 'Every visit' },
      { id: 'spo2',    icon: '🫁',  label: 'SpO₂',           unit: '%',      target: '>94%',              frequency: 'PRN' },
    ],
    labs: ['HbA1c 3-monthly', 'Creatinine + eGFR 6-monthly', 'Urine ACR annually', 'Lipid profile annually', 'Fundoscopy annually', 'Foot exam every visit'],
    review_frequency: 'Every 3 months',
  },

  'Heart Failure': {
    label: 'Heart Failure Monitoring',
    icon: '💙',
    parameters: [
      { id: 'weight',  icon: '⚖️',  label: 'Daily Weight',   unit: 'kg',     target: 'Stable / <2 kg/week rise',  frequency: 'Daily' },
      { id: 'sbp',     icon: '❤️',  label: 'Blood Pressure', unit: 'mmHg',   target: '>100 mmHg systolic',         frequency: 'Every visit' },
      { id: 'pulse',   icon: '💓',  label: 'Heart Rate',     unit: 'bpm',    target: '60–70 bpm (target)',         frequency: 'Every visit' },
      { id: 'spo2',    icon: '🫁',  label: 'SpO₂',           unit: '%',      target: '>94%',                       frequency: 'Every visit' },
    ],
    labs: ['BNP / NT-proBNP', 'U&E (RAAS therapy monitoring)', 'Renal function on diuretics'],
    review_frequency: 'Weekly until stable, then monthly',
  },

  'Asthma': {
    label: 'Asthma Monitoring',
    icon: '🌬️',
    parameters: [
      { id: 'pefr',    icon: '🌬️', label: 'PEFR',           unit: 'L/min',  target: '>80% predicted / personal best', frequency: 'Twice daily' },
      { id: 'spo2',    icon: '🫁', label: 'SpO₂',            unit: '%',      target: '>94%',                          frequency: 'During acute' },
      { id: 'rr',      icon: '💨', label: 'Resp Rate',       unit: 'rpm',    target: '12–20',                         frequency: 'Every visit' },
      { id: 'pulse',   icon: '💓', label: 'Heart Rate',      unit: 'bpm',    target: '<100 bpm',                      frequency: 'Every visit' },
    ],
    labs: ['Spirometry (FEV1/FVC) annually', 'FeNO (if available)', 'IgE / Eosinophils (if allergic)'],
    review_frequency: '4–8 weeks after any change, then 3-monthly',
  },

  'Malaria': {
    label: 'Malaria Treatment Monitoring',
    icon: '🦟',
    parameters: [
      { id: 'temp',    icon: '🌡️', label: 'Temperature',    unit: '°C',     target: '<37.5°C',  frequency: 'Q4h' },
      { id: 'glucose', icon: '🩸', label: 'Blood Glucose',  unit: 'mmol/L', target: '>3.9 mmol/L (hypoglycaemia risk with quinine)', frequency: 'Q4h' },
      { id: 'pulse',   icon: '💓', label: 'Pulse',          unit: 'bpm',    target: '60–100',   frequency: 'Q4h' },
      { id: 'spo2',    icon: '🫁', label: 'SpO₂',           unit: '%',      target: '>94%',     frequency: 'Q4h' },
    ],
    labs: ['Repeat thick film at 48h, 72h', 'FBC daily', 'LFT, U&E daily (severe)'],
    review_frequency: 'Q4h for first 24h, then 6-hourly',
  },

  'Tuberculosis': {
    label: 'TB Treatment Monitoring',
    icon: '🫁',
    parameters: [
      { id: 'weight',  icon: '⚖️', label: 'Weight',         unit: 'kg',     target: 'Gaining weight on treatment', frequency: 'Monthly' },
      { id: 'temp',    icon: '🌡️', label: 'Temperature',    unit: '°C',     target: '<37.5°C',                    frequency: 'Weekly (initial)' },
    ],
    labs: ['Sputum AFB monthly (first 3 months)', 'LFT monthly (HRZE toxicity)', 'Visual acuity monthly (if on ethambutol)', 'Audiometry (if on aminoglycosides)'],
    review_frequency: '2-weekly for first month, then monthly',
  },

};

// ── CDS ALERTS ENGINE ─────────────────────────────────────────
export const CDS_ALERTS = {
  rules: [
    {
      id: 'bp_crisis',
      check: (v) => v.sbp >= 180 || v.dbp >= 120,
      message: 'Hypertensive crisis (BP ≥180/120) — immediate treatment required',
      level: 'critical',
      pathway: 'Hypertensive Emergency Protocol',
    },
    {
      id: 'bp_elevated',
      check: (v) => v.sbp >= 160 || v.dbp >= 100,
      message: 'Significantly elevated BP — review antihypertensives',
      level: 'warning',
      pathway: 'HTN Urgency Protocol',
    },
    {
      id: 'hypoglycaemia',
      check: (v) => v.glucose && v.glucose < 3.9,
      message: 'Hypoglycaemia (glucose <3.9 mmol/L) — immediate 15g fast-acting glucose',
      level: 'critical',
      pathway: 'Hypoglycaemia Protocol (15-15 Rule)',
    },
    {
      id: 'hyperglycaemia',
      check: (v) => v.glucose && v.glucose > 13.9,
      message: 'Severe hyperglycaemia (>13.9 mmol/L) — rule out DKA/HHS',
      level: 'critical',
      pathway: 'DKA / HHS Pathway',
    },
    {
      id: 'tachycardia',
      check: (v) => v.pulse > 100,
      message: 'Tachycardia (HR >100 bpm) — assess cause (sepsis, PE, ACS, AF)',
      level: 'warning',
    },
    {
      id: 'bradycardia',
      check: (v) => v.pulse && v.pulse < 50,
      message: 'Bradycardia (HR <50 bpm) — check medications, ECG',
      level: 'critical',
    },
    {
      id: 'hypoxia',
      check: (v) => v.spo2 && v.spo2 < 92,
      message: 'Severe hypoxia (SpO₂ <92%) — escalate immediately, oxygen therapy',
      level: 'critical',
      pathway: 'Oxygen Therapy Protocol',
    },
    {
      id: 'mild_hypoxia',
      check: (v) => v.spo2 && v.spo2 >= 92 && v.spo2 < 94,
      message: 'Borderline SpO₂ (<94%) — monitor closely, consider oxygen',
      level: 'warning',
    },
    {
      id: 'fever',
      check: (v) => v.temp && v.temp >= 38.3,
      message: 'Pyrexia (≥38.3°C) — screen for sepsis (qSOFA / SIRS)',
      level: 'warning',
      pathway: 'Sepsis Screening',
    },
    {
      id: 'hypothermia',
      check: (v) => v.temp && v.temp < 36.0,
      message: 'Hypothermia (<36°C) — assess cause, rewarm',
      level: 'critical',
    },
    {
      id: 'tachypnoea',
      check: (v) => v.rr && v.rr > 20,
      message: 'Tachypnoea (RR >20) — assess for pneumonia, PE, acidosis',
      level: 'warning',
    },
    {
      id: 'bradypnoea',
      check: (v) => v.rr && v.rr < 10,
      message: 'Bradypnoea (RR <10) — risk of respiratory failure',
      level: 'critical',
    },
    {
      id: 'hypotension',
      check: (v) => v.sbp && v.sbp < 90,
      message: 'Hypotension (SBP <90 mmHg) — SHOCK — IV access, fluid resuscitation',
      level: 'critical',
      pathway: 'Shock Protocol (MAP ≥65)',
    },
  ],

  runAll(vitals) {
    return this.rules.filter(r => {
      try { return r.check(vitals); } catch { return false; }
    });
  },
};

// ── COMPLETENESS RULES ────────────────────────────────────────
export const COMPLETENESS_RULES = [
  { id: 'cc',          label: 'Chief complaint documented',      required: true },
  { id: 'hpi',         label: 'HPI / history complete',          required: true },
  { id: 'pmhx',        label: 'Past medical history recorded',   required: true },
  { id: 'drugs',       label: 'Drug history documented',         required: true },
  { id: 'allergies',   label: 'Allergy status confirmed',        required: true },
  { id: 'exam',        label: 'Examination findings recorded',   required: true },
  { id: 'vitals',      label: 'Vital signs documented',          required: true },
  { id: 'impression',  label: 'Impression / diagnosis entered',  required: true },
  { id: 'plan',        label: 'Management plan documented',      required: true },
  { id: 'investigations',label:'Investigations ordered/reviewed',required: false },
  { id: 'follow_up',   label: 'Follow-up plan stated',           required: false },
  { id: 'counselling', label: 'Patient counselled / educated',   required: false },
  { id: 'signature',   label: 'Note signed & designated',        required: false },
];

// ── VITAL SIGN RANGES ─────────────────────────────────────────
export const VITAL_RANGES = {
  temp:    { min: 36.0, max: 37.5, alertMin: 35.5, alertMax: 38.3, unit: '°C' },
  pulse:   { min: 60,   max: 100,  alertMin: 50,   alertMax: 120,  unit: 'bpm' },
  sbp:     { min: 90,   max: 140,  alertMin: 90,   alertMax: 180,  unit: 'mmHg' },
  dbp:     { min: 60,   max: 90,   alertMin: 50,   alertMax: 120,  unit: 'mmHg' },
  rr:      { min: 12,   max: 20,   alertMin: 10,   alertMax: 25,   unit: 'rpm' },
  spo2:    { min: 94,   max: 100,  alertMin: 90,   alertMax: null, unit: '%' },
  glucose: { min: 4.0,  max: 7.8,  alertMin: 3.9,  alertMax: 13.9, unit: 'mmol/L' },
  weight:  { unit: 'kg' },
  height:  { unit: 'cm' },
};

export function isVitalAbnormal(type, value) {
  const range = VITAL_RANGES[type];
  if (!range || value === '' || value === null || value === undefined) return false;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (range.alertMin !== null && range.alertMin !== undefined && num < range.alertMin) return true;
  if (range.alertMax !== null && range.alertMax !== undefined && num > range.alertMax) return true;
  return false;
}

export function isVitalMildlyAbnormal(type, value) {
  const range = VITAL_RANGES[type];
  if (!range) return false;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (range.min !== undefined && num < range.min) return true;
  if (range.max !== undefined && num > range.max) return true;
  return false;
}
// ======================= DIFFERENTIAL ENGINE =======================
const DISEASE_WEIGHTS = {
  // Format: disease_id -> { symptoms: weight, exam_findings: weight, vital_patterns: weight }
  Pneumonia: {
    symptoms: { fever: 0.3, cough: 0.3, shortness_of_breath: 0.2, sputum: 0.2 },
    examFindings: { crackles: 0.4, bronchial_breathing: 0.3, reduced_expansion: 0.2 },
    vitals: { fever_temp: 0.2, tachypnoea: 0.2, hypoxia: 0.4 },
  },
  Asthma: {
    symptoms: { wheeze: 0.5, cough: 0.2, shortness_of_breath: 0.3 },
    examFindings: { wheeze_expiratory: 0.5, hyperresonant: 0.2 },
    vitals: { tachypnoea: 0.2, normal_spo2_but_acute: 0.1 },
  },
  HeartFailure: {
    symptoms: { orthopnoea: 0.4, pnd: 0.4, leg_swelling: 0.2 },
    examFindings: { crackles_basal: 0.3, raised_jvp: 0.4, oedema: 0.2 },
    vitals: { tachycardia: 0.2, hypoxia: 0.3 },
  },
  // Add more diseases as needed – you can also auto-generate from INVESTIGATION_RULES keys
};

export function calculateDifferentials(context) {
  // context expected: { complaints: [{symptom, duration}], examFindings: [], vitals: {} }
  const scores = {};

  for (const [disease, weights] of Object.entries(DISEASE_WEIGHTS)) {
    let score = 0;
    // Symptom matching
    for (const complaint of context.complaints || []) {
      const sym = complaint.symptom?.toLowerCase();
      if (weights.symptoms[sym]) score += weights.symptoms[sym];
    }
    // Exam findings matching
    for (const finding of context.examFindings || []) {
      if (weights.examFindings[finding]) score += weights.examFindings[finding];
    }
    // Vital patterns (simplified)
    const vitals = context.vitals || {};
    if (vitals.temp > 38.3 && weights.vitals.fever_temp) score += weights.vitals.fever_temp;
    if (vitals.rr > 20 && weights.vitals.tachypnoea) score += weights.vitals.tachypnoea;
    if (vitals.spo2 < 92 && weights.vitals.hypoxia) score += weights.vitals.hypoxia;

    if (score > 0) scores[disease] = Math.min(score, 1.0);
  }

  // Normalise & sort
  const total = Object.values(scores).reduce((a,b) => a+b, 0);
  const ranked = Object.entries(scores)
    .map(([name, raw]) => ({ name, probability: total ? raw/total : 0 }))
    .sort((a,b) => b.probability - a.probability);
  return ranked;
}
// ======================= MANAGEMENT ENGINE =======================
export const MANAGEMENT_PROTOCOLS = {
  Pneumonia: {
    mild: {
      medications: ['Amoxicillin 500mg TID x 5 days', 'Paracetamol PRN'],
      procedures: [],
      referrals: [],
      followUp: 'Outpatient review in 48h',
    },
    moderate: {
      medications: ['IV Ceftriaxone 1g daily + Azithromycin 500mg daily'],
      procedures: ['Oxygen if SpO2 <92%'],
      referrals: ['Consider admission'],
      followUp: 'Daily review',
    },
    severe: {
      medications: ['IV Ceftriaxone + IV Azithromycin + IV fluids'],
      procedures: ['High-flow oxygen', 'ICU consult'],
      referrals: ['ICU'],
      followUp: 'Hourly monitoring',
    },
  },
  Asthma: {
    mild: {
      medications: ['Salbutamol inhaler 2 puffs PRN', 'Consider low-dose ICS'],
      procedures: [],
      referrals: [],
      followUp: 'Review in 1 week',
    },
    moderate: {
      medications: ['Salbutamol nebules 2.5mg Q4h', 'Prednisolone 40mg daily x 5d'],
      procedures: ['Oxygen', 'Nebuliser'],
      referrals: [],
      followUp: 'Daily until stable',
    },
    severe: {
      medications: ['IV Hydrocortisone', 'Magnesium sulfate', 'Aminophylline'],
      procedures: ['High-flow oxygen', 'BiPAP/NIV'],
      referrals: ['ICU admission'],
      followUp: 'ICU hourly',
    },
  },
  // Add others (Hypertension, DKA, Malaria, etc.)
};

export function getSeverityFromVitals(vitals, diagnosis) {
  if (!vitals) return 'mild';
  if (vitals.spo2 < 90 || vitals.rr > 30 || vitals.sbp < 90) return 'severe';
  if (vitals.temp > 39.5 || vitals.pulse > 120) return 'moderate';
  return 'mild';
}

export function getManagementPlan(impressions, vitals) {
  if (!impressions || impressions.length === 0) return null;
  const primaryDx = impressions[0]; // use first impression
  const protocol = MANAGEMENT_PROTOCOLS[primaryDx];
  if (!protocol) return null;
  const severity = getSeverityFromVitals(vitals, primaryDx);
  return protocol[severity] || protocol.mild;
}
// ======================= EDUCATION ENGINE =======================
export const EDUCATION_CONTENT = {
  Pneumonia: {
    title: 'Pneumonia – what you need to know',
    summary: 'Infection in the lungs caused by bacteria or viruses.',
    instructions: 'Take all antibiotics as prescribed. Rest and drink plenty of fluids. Return if breathing worsens.',
    videoUrl: 'https://example.com/pneumonia.mp4',
  },
  Asthma: {
    title: 'Asthma action plan',
    summary: 'Chronic airway inflammation that can be controlled with inhalers.',
    instructions: 'Use blue reliever inhaler for symptoms. Take brown preventer daily. Avoid triggers.',
  },
  // Add more diagnoses as you expand
};

export function getPatientEducation(diagnosis) {
  const edu = EDUCATION_CONTENT[diagnosis];
  if (!edu) return null;
  return {
    ...edu,
    diagnosis,
    language: 'en',
  };
}
// ======================= SCORING ENGINE =======================
export function calculateCURB65(patient) {
  // Confusion, Urea >7, RR ≥30, BP low, age≥65
  // Returns 0–5 score and risk class
  let score = 0;
  if (patient.confusion) score++;
  if (patient.urea && patient.urea > 7) score++;
  if (patient.rr && patient.rr >= 30) score++;
  if (patient.sbp && patient.sbp < 90) score++;
  if (patient.age >= 65) score++;
  return { score, risk: score >= 3 ? 'High (ICU)' : score === 2 ? 'Moderate (admit)' : 'Low (home care)' };
}

export function calculateHEARTScore(patient) {
  // History, ECG, Age, Risk factors, Troponin (simplified)
  let score = 0;
  // History (0=no, 1=intermediate, 2=high risk)
  score += patient.chest_pain_history_score || 0;
  // ECG (0=normal, 1=non‑specific, 2=significant)
  score += patient.ecg_score || 0;
  // Age (0=<45, 1=45–65, 2=>65)
  score += patient.age >= 65 ? 2 : (patient.age >= 45 ? 1 : 0);
  // Risk factors (0=none, 1=1–2, 2=>2)
  score += patient.risk_factors_count || 0;
  // Troponin (0=normal, 1=mild, 2=high)
  score += patient.troponin_score || 0;
  return { score, risk: score <= 3 ? 'Low (discharge)' : score <= 6 ? 'Moderate (obs)' : 'High (intervene)' };
}

// Add more scores (qSOFA, Wells, PESI, etc.)
// ======================= EXPLAINABILITY =======================
export function explainDifferential(dxList, context) {
  const explanations = [];
  for (const dx of dxList) {
    let reasons = [];
    if (dx.name === 'Pneumonia' && context.complaints?.some(c => c.symptom === 'cough')) reasons.push('Cough present');
    if (dx.name === 'Pneumonia' && context.examFindings?.includes('crackles')) reasons.push('Crackles heard');
    if (dx.name === 'HeartFailure' && context.complaints?.some(c => c.symptom === 'leg_swelling')) reasons.push('Leg swelling');
    explanations.push({
      diagnosis: dx.name,
      probability: `${(dx.probability * 100).toFixed(0)}%`,
      reasoning: reasons.join('; ') || 'Based on presenting symptoms',
    });
  }
  return explanations;
}

// Safety: force review for high‑risk conditions
export const HIGH_RISK_DIAGNOSES = ['Acute Coronary Syndrome', 'Stroke', 'Sepsis', 'Meningitis', 'DKA', 'Pulmonary Embolism'];
export function requiresHumanReview(impressions) {
  return impressions.some(imp => HIGH_RISK_DIAGNOSES.includes(imp));
}// ======================= PERSONALISATION =======================
export function adjustManagementForAllergies(plan, allergies) {
  if (!plan || !allergies) return plan;
  const allergyList = allergies.map(a => a.toLowerCase());
  if (allergyList.includes('penicillin') && plan.medications) {
    plan.medications = plan.medications.map(med =>
      med.includes('Amoxicillin') || med.includes('penicillin') ? 'Clarithromycin (penicillin allergic)' : med
    );
  }
  return plan;
}

export function adjustForRenalFunction(plan, gfr) {
  if (!plan || !gfr || gfr > 30) return plan;
  // For eGFR <30, adjust antibiotics, NSAIDs, etc.
  if (plan.medications) {
    plan.medications = plan.medications.map(med =>
      med.includes('Ceftriaxone') ? 'Ceftriaxone (renal adjusted dose)' : med
    );
  }
  return plan;
}