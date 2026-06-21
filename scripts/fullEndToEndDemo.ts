import { generateDocuments, DocumentInput } from '../lib/history-engine/documentGenerator';

function makeSoc(
  questionId: string, question: string, answer: string | boolean | string[], field: string, weight = 1,
) { return { questionId, question, answer, field, weight }; }

function main() {
  // ── PATIENT: 65-year-old male, Intestinal Obstruction (strangulated) ──
  const input: DocumentInput = {
    biodata: {
      name: 'John Kamau Mwangi',
      age: 65,
      sex: 'male',
      profile: 'adult',
      occupation: 'Retired teacher',
      occupationType: 'retired',
      residence: 'Kasarani, Nairobi',
      informant: 'patient',
      reliability: 'reliable',
    },
    chiefComplaints: [
      {
        id: 'cc_1',
        symptomId: 'abdominal_pain',
        label: 'severe abdominal pain',
        duration: '3 days',
        durationDays: 3,
        isPrimary: true,
        associatedSymptomIds: ['vomiting', 'abdominal_distension', 'obstipation'],
      },
      {
        id: 'cc_2',
        symptomId: 'vomiting',
        label: 'vomiting',
        duration: '2 days',
        durationDays: 2,
        isPrimary: false,
      },
      {
        id: 'cc_3',
        symptomId: 'abdominal_distension',
        label: 'abdominal distension',
        duration: '2 days',
        durationDays: 2,
        isPrimary: false,
      },
      {
        id: 'cc_4',
        symptomId: 'obstipation',
        label: 'not passed gas or stool',
        duration: '2 days',
        durationDays: 2,
        isPrimary: false,
      },
    ],

    // ── HPI — Structured SOCRATES data ──
    hpi: {
      abdominal_pain: {
        symptomId: 'abdominal_pain',
        label: 'Abdominal pain',
        socrates: [
          makeSoc('pain_onset', 'How did the pain begin?', 'Gradual over hours', 'onset_type'),
          makeSoc('pain_initial_location', 'Where did the pain start?', 'Periumbilical (around the navel)', 'initial_location'),
          makeSoc('pain_location_now', 'Where is the pain now?', 'Diffuse — whole abdomen', 'location'),
          makeSoc('pain_character', 'How would you describe the pain?', 'Cramping — comes in waves', 'quality'),
          makeSoc('pain_severity', 'Rate the pain severity', '9', 'severity'),
          makeSoc('pain_progression', 'How has the pain progressed?', 'Colicky — coming in waves', 'progression'),
          makeSoc('pain_radiation', 'Does the pain spread anywhere?', 'No radiation', 'radiation'),
          makeSoc('aggravating_factors', 'What makes it worse?', 'Movement, eating', 'aggravating_factors'),
          makeSoc('relieving_factors', 'What makes it better?', 'Nothing', 'relieving_factors'),
          makeSoc('pain_flow', 'Overall trend', 'worsening', 'flow'),
          makeSoc('associated_nausea', 'Associated with nausea?', true, 'associated_nausea'),
          makeSoc('associated_vomiting', 'Associated with vomiting?', true, 'associated_vomiting'),
          makeSoc('associated_anorexia', 'Associated with anorexia?', true, 'associated_anorexia'),
          makeSoc('associated_fever', 'Associated with fever?', true, 'associated_fever'),
          makeSoc('risk_prior_abdominal_surgery', 'Prior abdominal surgery?', true, 'risk_prior_abdominal_surgery'),
        ],
        positives: ['nausea', 'vomiting', 'anorexia', 'fever', 'obstipation', 'distension'],
        negatives: ['diarrhoea', 'dysuria', 'chest_pain'],
        flow: 'worsening',
      },
      vomiting: {
        symptomId: 'vomiting',
        label: 'Vomiting',
        socrates: [
          makeSoc('vomiting_timing', 'When did vomiting start relative to pain?', 'After the pain began', 'timing'),
          makeSoc('vomiting_description', 'What does the vomit look like?', 'Bilious (yellow-green bile-stained fluid — suggests proximal obstruction)', 'description'),
          makeSoc('vomiting_frequency', 'How often are you vomiting?', 'Multiple times per hour', 'frequency'),
          makeSoc('vomiting_relief', 'Does vomiting relieve the pain?', true, 'relief'),
        ],
        positives: ['bilious', 'frequent'],
        negatives: ['hematemesis', 'coffee_ground', 'faeculent'],
        parentSymptomId: 'abdominal_pain',
      },
      abdominal_distension: {
        symptomId: 'abdominal_distension',
        label: 'Abdominal distension',
        socrates: [
          makeSoc('distension_onset', 'How quickly did the distension develop?', 'Developed over 1-2 days', 'onset'),
          makeSoc('distension_progression', 'How has the distension progressed?', 'Progressive worsening', 'progression'),
          makeSoc('distension_site', 'Where is the distension?', 'Generalised — whole abdomen', 'site'),
          makeSoc('distension_gas_passage_relief', 'Does passing gas relieve the distension?', false, 'gas_passage_relief'),
        ],
        positives: ['generalised'],
        negatives: [],
        parentSymptomId: 'abdominal_pain',
      },
      obstipation: {
        symptomId: 'obstipation',
        label: 'Obstipation',
        socrates: [
          makeSoc('obstipation_duration', 'How long since last gas/stool?', '3 days', 'duration'),
        ],
        positives: ['no_stool', 'no_gas'],
        negatives: ['diarrhoea'],
        parentSymptomId: 'abdominal_pain',
      },
      nausea: {
        symptomId: 'nausea',
        label: 'Nausea',
        socrates: [
          makeSoc('nausea_present', 'Do you have nausea?', true, 'present'),
          makeSoc('nausea_duration', 'How many days?', '2', 'duration'),
          makeSoc('nausea_timing', 'When does nausea occur?', 'persistent throughout the day', 'timing'),
          makeSoc('nausea_severity', 'How severe is the nausea?', 'severe, prevents eating or drinking', 'severity'),
          makeSoc('nausea_vomiting_relation', 'Does nausea precede vomiting?', 'each vomiting episode preceded by worsening nausea', 'vomiting_relation'),
        ],
        positives: [],
        negatives: ['hematemesis'],
        parentSymptomId: 'abdominal_pain',
      },
      anorexia: {
        symptomId: 'anorexia',
        label: 'Anorexia',
        socrates: [
          makeSoc('anorexia_present', 'Has appetite decreased?', true, 'present'),
          makeSoc('anorexia_duration', 'How long?', '2', 'duration'),
          makeSoc('anorexia_degree', 'How much has food intake reduced?', 'complete, has not eaten solid food for 2 days', 'degree'),
          makeSoc('anorexia_weight_loss', 'Any weight loss?', 'Not sure — no documented weight', 'weight_loss'),
        ],
        positives: [],
        negatives: ['weight_loss'],
        parentSymptomId: 'abdominal_pain',
      },
      peritonism: {
        symptomId: 'peritonism',
        label: 'Change in pain character',
        socrates: [
          makeSoc('peritonism_present', 'Has the pain changed?', true, 'present'),
          makeSoc('peritonism_duration', 'How many days?', '1', 'duration'),
          makeSoc('peritonism_progression', 'How has the pain changed?', 'pain became constant rather than colicky, with severe exacerbations', 'progression'),
          makeSoc('peritonism_movement_sensitivity', 'Worse with movement?', true, 'movement_sensitivity'),
          makeSoc('peritonism_cough_sensitivity', 'Worse with coughing?', true, 'cough_sensitivity'),
        ],
        positives: ['guarding', 'rebound'],
        negatives: [],
        parentSymptomId: 'abdominal_pain',
      },
      fever_chills: {
        symptomId: 'fever_chills',
        label: 'Hotness of body with chills',
        socrates: [
          makeSoc('fever_chills_present', 'Do you have fevers?', true, 'present'),
          makeSoc('fever_chills_rigors', 'Do you have shaking chills?', true, 'rigors'),
          makeSoc('fever_duration', 'How many days?', '1', 'duration'),
          makeSoc('fever_severity', 'What temperature?', 'documented 38.5 C at clinic', 'severity'),
          makeSoc('fever_pattern', 'Constant or comes and goes?', 'persistent with intermittent spikes', 'pattern'),
          makeSoc('fever_sweats', 'Any night sweats?', true, 'night_sweats'),
        ],
        positives: ['rigors'],
        negatives: ['cough', 'dysuria', 'headache'],
        parentSymptomId: 'abdominal_pain',
      },
    },

    featureRegistry: {
      obstipation: { id: 'obstipation', present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} },
      abdominal_distension: { id: 'abdominal_distension', present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} },
      peritonism: { id: 'peritonism', present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} },
      guarding: { id: 'guarding', present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} },
      vomiting: { id: 'vomiting', present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} },
      fever_chills: { id: 'fever_chills', present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} },
      prior_abdominal_surgery: { id: 'prior_abdominal_surgery', present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} },
      smoking: { id: 'smoking', present: false, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} },
    },

    globalAnswers: {
      flow: 'worsening',
      functionalImpact: 'Unable to eat, sleep, or perform any daily activities due to severe abdominal pain',
      seenByAnyone: 'a local clinic',
      treatmentTaken: 'painkillers (paracetamol) without relief',
      treatmentResponse: 'No relief',
    },

    // ── PAST HISTORY ──
    pastHistory: {
      admissions: [
        { year: 2018, reason: 'Acute appendicitis', hospital: 'Kenyatta National Hospital', treatment: 'Appendectomy' },
      ],
      surgeries: [
        { year: 2018, procedure: 'Open appendectomy', hospital: 'Kenyatta National Hospital' },
      ],
      transfusions: [],
      chronicDiseases: [
        {
          condition: 'Hypertension', yearDiagnosed: 2015, hospital: 'Mbagathi Hospital',
          drugs: 'Enalapril 10mg daily', followUp: 'Mbagathi Hospital', compliant: true,
        },
      ],
      allergies: [],
      foodAllergies: [],
      drugAllergies: ['Sulfonamides'],
      longTermMeds: ['Enalapril 10mg daily'],
      tbHistory: 'none',
    },

    // ── FAMILY & SOCIAL ──
    familySocial: {
      maritalStatus: 'married',
      numberOfSpouses: 1,
      education: 'tertiary',
      incomeLevel: 'middle',
      housing: 'owned',
      water: 'piped',
      sanitation: 'flush',
      smoking: 'never',
      alcohol: 'occasional',
      alcoholAmount: '1-2 beers on weekends',
      substanceUse: [],
      familyHistory: ['Mother — hypertension', 'Father — died of stroke at 72'],
      familyDiseases: ['hypertension', 'stroke'],
      occupationExposure: [],
      travelHistory: [],
      transportAccess: 'private',
      healthInsurance: true,
    },

    // ── ROS ──
    ros: [
      {
        id: 'general', label: 'General', priority: 1,
        symptoms: [
          { id: 'fever', label: 'Fever', present: true, details: '38.5°C, with rigors' },
          { id: 'weight_loss', label: 'Weight loss', present: false, details: '' },
          { id: 'fatigue', label: 'Fatigue / Malaise', present: true, details: 'Marked fatigue' },
          { id: 'night_sweats', label: 'Night sweats', present: false, details: '' },
        ],
      },
      {
        id: 'ent', label: 'Ear, Nose & Throat', priority: 2,
        symptoms: [
          { id: 'hearing_loss', label: 'Hearing loss', present: false, details: '' },
          { id: 'tinnitus', label: 'Tinnitus', present: false, details: '' },
          { id: 'sore_throat', label: 'Sore throat', present: false, details: '' },
          { id: 'dysphagia', label: 'Dysphagia', present: false, details: '' },
        ],
      },
      {
        id: 'respiratory', label: 'Respiratory', priority: 2,
        symptoms: [
          { id: 'cough', label: 'Cough', present: false, details: '' },
          { id: 'dyspnea', label: 'Dyspnea (SOB)', present: false, details: '' },
          { id: 'wheeze', label: 'Wheezing', present: false, details: '' },
          { id: 'hemoptysis', label: 'Hemoptysis', present: false, details: '' },
        ],
      },
      {
        id: 'cardiovascular', label: 'Cardiovascular', priority: 2,
        symptoms: [
          { id: 'chest_pain', label: 'Chest pain', present: false, details: '' },
          { id: 'palpitations', label: 'Palpitations', present: false, details: '' },
          { id: 'orthopnea', label: 'Orthopnea', present: false, details: '' },
          { id: 'leg_swelling', label: 'Leg swelling', present: false, details: '' },
        ],
      },
      {
        id: 'gi', label: 'Gastrointestinal', priority: 1,
        symptoms: [
          { id: 'abdominal_pain', label: 'Abdominal pain', present: true, details: 'Severe, colicky, diffuse' },
          { id: 'nausea', label: 'Nausea/Vomiting', present: true, details: 'Bilious, multiple times/hour' },
          { id: 'diarrhoea', label: 'Diarrhoea', present: false, details: '' },
          { id: 'constipation', label: 'Constipation', present: true, details: 'No stool for 3 days' },
          { id: 'hematemesis', label: 'Hematemesis', present: false, details: '' },
          { id: 'melena', label: 'Melena/Blood in stool', present: false, details: '' },
          { id: 'jaundice', label: 'Jaundice', present: false, details: '' },
        ],
      },
      {
        id: 'musculoskeletal', label: 'Musculoskeletal', priority: 3,
        symptoms: [
          { id: 'joint_pain', label: 'Joint pain', present: false, details: '' },
          { id: 'back_pain', label: 'Back pain', present: false, details: '' },
          { id: 'muscle_weakness', label: 'Muscle weakness', present: false, details: '' },
        ],
      },
      {
        id: 'neurological', label: 'Neurological', priority: 2,
        symptoms: [
          { id: 'headache', label: 'Headache', present: false, details: '' },
          { id: 'dizziness', label: 'Dizziness', present: false, details: '' },
          { id: 'seizure', label: 'Seizures', present: false, details: '' },
          { id: 'altered_consciousness', label: 'Altered consciousness', present: true, details: 'Mild confusion due to sepsis' },
          { id: 'numbness', label: 'Numbness/Tingling', present: false, details: '' },
        ],
      },
      {
        id: 'gu', label: 'Genitourinary', priority: 2,
        symptoms: [
          { id: 'dysuria', label: 'Dysuria', present: false, details: '' },
          { id: 'frequency', label: 'Urinary frequency', present: false, details: '' },
          { id: 'oliguria', label: 'Oliguria/Anuria', present: true, details: 'Reduced urine output for 1 day' },
          { id: 'hematuria', label: 'Hematuria', present: false, details: '' },
        ],
      },
      {
        id: 'skin', label: 'Skin', priority: 3,
        symptoms: [
          { id: 'rash', label: 'Rash', present: false, details: '' },
          { id: 'pruritus', label: 'Itching', present: false, details: '' },
          { id: 'ulcers', label: 'Skin ulcers', present: false, details: '' },
        ],
      },
    ],

    // ── IMPACT ON LIFE ──
    impactOnLife: {
      work: 'unable',
      walking: 'unable',
      eating: 'unable',
      sleeping: 'severely_disturbed',
      adl: 'needs_assistance',
      description: 'Patient is completely bedridden due to severe abdominal pain. Unable to eat or drink. Has not slept in 2 nights. Requires assistance with all activities including using the bathroom.',
    },

    // ── DDX (from Bayesian engine) ──
    ddx: {
      probabilities: [
        { diseaseId: 'intestinal_obstruction', diseaseName: 'Intestinal Obstruction', probability: 0.56 },
        { diseaseId: 'acute_appendicitis', diseaseName: 'Acute Appendicitis', probability: 0.15 },
        { diseaseId: 'volvulus', diseaseName: 'Volvulus', probability: 0.12 },
        { diseaseId: 'secondary_bacterial_peritonitis', diseaseName: 'Secondary Bacterial Peritonitis', probability: 0.03 },
        { diseaseId: 'small_bowel_obstruction_adhesions', diseaseName: 'Small Bowel Obstruction (Adhesions)', probability: 0.02 },
      ],
      snapshots: [],
      traces: [
        {
          diseaseId: 'intestinal_obstruction', diseaseName: 'Intestinal Obstruction',
          supporting: ['Obstipation', 'Abdominal distension', 'Peritonism', 'Prior abdominal surgery', 'Bilious vomiting'],
          against: [], keyFindings: ['Peritonism — RED FLAG'],
        },
      ],
    },

    // ── RED FLAGS ──
    redFlags: [
      {
        id: 'rf_peritonism', rule: 'Peritonism with obstruction',
        severity: 'critical', message: 'Suspected strangulated obstruction — emergency laparotomy indicated',
        diseases: ['intestinal_obstruction', 'volvulus'], triggered: true,
      },
      {
        id: 'rf_rigors', rule: 'Fever with rigors in obstruction',
        severity: 'high', message: 'Systemic sepsis — urgent antibiotics + source control',
        diseases: ['intestinal_obstruction', 'secondary_bacterial_peritonitis'], triggered: true,
      },
      {
        id: 'rf_oliguria', rule: 'Reduced urine output',
        severity: 'high', message: 'Dehydration / pre-renal AKI — aggressive IV fluids',
        diseases: ['intestinal_obstruction'], triggered: true,
      },
    ],

    timeline: [
      { id: 'tl1', date: '2026-06-18', relativeTime: '3 days ago', description: 'Gradual onset of periumbilical pain' },
      { id: 'tl2', date: '2026-06-19', relativeTime: '2 days ago', description: 'Pain became diffuse; vomiting started; distension noted' },
      { id: 'tl3', date: '2026-06-20', relativeTime: '1 day ago', description: 'Obstipation; fever with rigors; went to local clinic' },
      { id: 'tl4', date: '2026-06-21', relativeTime: 'Today', description: 'Referred to hospital with suspected intestinal obstruction' },
    ],

    // ── GENERAL EXAMINATION ──
    generalExamination: {
      vitals: {
        temperature: 38.9, heartRate: 112, bloodPressureSystolic: 90, bloodPressureDiastolic: 60,
        respiratoryRate: 24, oxygenSaturation: 96, bloodSugar: 6.8, weight: 72, height: 170, bmi: 24.9, painScore: 9,
      },
      appearance: { appearance: 'In obvious distress, lying still, grimacing, pale and diaphoretic' },
      hydration: { status: 'moderate_dehydration', dryMucosa: true, sunkenEyes: true, reducedSkinTurgor: true },
      nutrition: { status: 'normal' },
      consciousness: { level: 'drowsy', gcs: 14 },
      distress: { pain: true, respiratory: false, cardiovascular: true, neurological: false, painScore: 9 },
      generalSigns: [
        { id: 'gs_jaundice', label: 'Jaundice', present: false, details: '' },
        { id: 'gs_cyanosis', label: 'Cyanosis', present: false, details: '' },
        { id: 'gs_clubbing', label: 'Clubbing', present: false, details: '' },
        { id: 'gs_lymphadenopathy', label: 'Lymphadenopathy', present: false, details: '' },
        { id: 'gs_edema', label: 'Pedal edema', present: false, details: '' },
        { id: 'gs_pallor', label: 'Pallor', present: true, details: 'Conjunctival pallor present' },
        { id: 'gs_dehydration', label: 'Dehydration', present: true, details: 'Dry mucous membranes, sunken eyes, reduced skin turgor' },
      ],
      notes: 'Patient appears septic — tachycardic, hypotensive, febrile with rigors. Moderate dehydration with reduced urine output.',
    },

    // ── SYSTEMIC EXAMINATION ──
    systemExaminations: [
      {
        systemId: 'respiratory', systemName: 'Respiratory System',
        findings: [
          { id: 'rs_inspection', label: 'Inspection', finding: 'normal', description: 'Chest symmetrical, no accessory muscle use' },
          { id: 'rs_auscultation', label: 'Auscultation', finding: 'normal', description: 'Clear breath sounds bilaterally, no crepitations or wheeze' },
          { id: 'rs_percussion', label: 'Percussion', finding: 'normal', description: 'Resonant bilaterally' },
        ],
        summary: 'Respiratory system examination was unremarkable.',
      },
      {
        systemId: 'cardiovascular', systemName: 'Cardiovascular System',
        findings: [
          { id: 'cvs_inspection', label: 'Inspection', finding: 'normal', description: 'No JVP elevation, no visible precordial bulge' },
          { id: 'cvs_auscultation', label: 'Auscultation', finding: 'normal', description: 'S1 S2 audible, no murmurs, rubs or gallop' },
          { id: 'cvs_perfusion', label: 'Peripheral perfusion', finding: 'abnormal', description: 'Tachycardia (112 bpm), hypotension (90/60), capillary refill >3 seconds' },
        ],
        summary: 'Tachycardia and hypotension consistent with distributive shock (sepsis).',
      },
      {
        systemId: 'abdominal', systemName: 'Abdominal Examination',
        findings: [
          { id: 'abd_inspection', label: 'Inspection', finding: 'abnormal', description: 'Distended abdomen, visible peristalsis, old appendectomy scar' },
          { id: 'abd_auscultation', label: 'Auscultation', finding: 'abnormal', description: 'Hyperactive bowel sounds with tinkling — consistent with obstruction' },
          { id: 'abd_palpation', label: 'Palpation', finding: 'abnormal', description: 'Generalised tenderness with guarding and rigidity. Rebound tenderness positive in all quadrants' },
          { id: 'abd_percussion', label: 'Percussion', finding: 'abnormal', description: 'Tympanic centrally, dull in flanks' },
          { id: 'abd_rectal', label: 'Rectal examination', finding: 'abnormal', description: 'Empty rectum, no masses, tenderness on rectal examination' },
          { id: 'abd_hernia', label: 'Hernial orifices', finding: 'normal', description: 'No hernia detected' },
        ],
        summary: 'Classic signs of strangulated intestinal obstruction with peritonism. Surgical abdomen.',
      },
      {
        systemId: 'neurological', systemName: 'Neurological System',
        findings: [
          { id: 'neuro_cns', label: 'CNS', finding: 'abnormal', description: 'GCS 14/15 (E3 V4 M6) — drowsy but rousable' },
          { id: 'neuro_pupils', label: 'Pupils', finding: 'normal', description: 'Equal and reactive to light bilaterally' },
          { id: 'neuro_motor', label: 'Motor', finding: 'normal', description: 'Normal tone, power 5/5 all limbs' },
        ],
        summary: 'Mildly reduced consciousness likely due to sepsis. No focal neurological deficits.',
      },
      {
        systemId: 'musculoskeletal', systemName: 'Musculoskeletal System',
        findings: [
          { id: 'msk_general', label: 'General', finding: 'normal', description: 'No deformities, swelling, or tenderness of joints' },
        ],
        summary: 'Musculoskeletal examination unremarkable.',
      },
    ],

    // ── LOCAL EXAMINATION (surgical scar) ──
    localExaminations: [
      {
        id: 'local_scar', type: 'scar', anatomicalSite: 'Right lower quadrant (McBurney)',
        label: 'Appendectomy scar',
        findings: { size: '5 cm', shape: 'Linear', color: 'Healed well', tenderness: 'None' },
        description: 'Well-healed 5 cm right lower quadrant scar from open appendectomy in 2018. No signs of infection, hernia, or tenderness.',
        interpretation: 'Previous surgical scar, well-healed, no evidence of incisional hernia.',
      },
    ],

    // ── CLINICAL REASONING ──
    clinicalReasoning: [
      {
        diseaseId: 'intestinal_obstruction', diseaseName: 'Intestinal Obstruction', probability: 56,
        supportingFromHistory: [
          'Obstipation — hallmark of complete mechanical obstruction',
          'Abdominal distension — progressive over 2 days',
          'Bilious vomiting after pain onset',
          'Colicky periumbilical pain migrating to diffuse',
          'Prior abdominal surgery (appendectomy) — most common cause of SBO',
        ],
        supportingFromExamination: [
          'Distended abdomen with visible peristalsis',
          'Hyperactive tinkling bowel sounds',
          'Generalised tenderness with guarding and rigidity',
          'Rebound tenderness — peritonism present',
          'Tachycardia, hypotension, fever — systemic sepsis',
        ],
        opposing: [],
        keyFindings: ['Obstipation', 'Peritonism', 'Prior surgery'],
        overallAssessment: 'Most likely diagnosis — strangulated small bowel obstruction secondary to adhesions. Peritonism and systemic sepsis indicate bowel ischaemia with impending perforation. Emergency laparotomy indicated.',
      },
      {
        diseaseId: 'volvulus', diseaseName: 'Volvulus', probability: 12,
        supportingFromHistory: [
          'Sudden-onset pain (initially)',
          'Obstipation',
          'Rapid distension',
        ],
        supportingFromExamination: [
          'Distended abdomen',
          'Peritonism',
        ],
        opposing: [
          'No previous episodes',
          'Less common in this age group for sigmoid volvulus',
          'Pain was gradual not instantaneous',
        ],
        keyFindings: ['Distension', 'Obstipation'],
        overallAssessment: 'Possible but less likely. Would be confirmed by abdominal X-ray showing coffee bean sign or CT with mesenteric swirl.',
      },
      {
        diseaseId: 'acute_appendicitis', diseaseName: 'Perforated Appendicitis', probability: 15,
        supportingFromHistory: [
          'Periumbilical to RLQ migration classic',
          'Anorexia',
          'Fever',
        ],
        supportingFromExamination: [
          'Guarding and rebound tenderness',
          'Rovsing sign positive',
        ],
        opposing: [
          'Patient already had appendectomy in 2018',
          'Obstipation is not typical of appendicitis',
          'Pain migration was to entire abdomen, not RLQ',
          'Distension is more prominent than expected',
        ],
        keyFindings: ['Peritonism', 'Prior appendectomy'],
        overallAssessment: 'Very unlikely given prior appendectomy, but stump appendicitis is a rare possibility. Would be ruled out on CT.',
      },
    ],

    // ── PROVISIONAL DIAGNOSIS ──
    provisionalDiagnosis: {
      diagnosis: 'Strangulated Small Bowel Obstruction (secondary to adhesions)',
      diagnosisId: 'intestinal_obstruction',
      probability: 56,
      reasoning: {
        fromHistory: [
          'Complete obstipation (no gas or stool for 3 days) strongly suggests mechanical obstruction',
          'Progressive abdominal distension over 2 days',
          'Bilious vomiting occurring after pain onset — consistent with proximal obstruction',
          'Colicky (wavelike) pain suggestive of intestinal peristalsis against a blockage',
          'Prior appendectomy — adhesions are the most common cause of SBO in patients with previous abdominal surgery',
          'Fever with rigors — concern for strangulation with systemic sepsis',
        ],
        fromExamination: [
          'Distended abdomen with visible peristalsis and hyperactive tinkling bowel sounds — classic obstructed bowel',
          'Generalised guarding, rigidity, and rebound tenderness — peritonism indicating bowel ischaemia',
          'Tachycardia (112 bpm), hypotension (90/60), fever (38.9°C) — distributive shock from sepsis',
          'Moderate dehydration with sunken eyes, dry mucosa, reduced turgor',
          'GCS 14/15 — encephalopathy secondary to sepsis',
        ],
      },
    },

    // ── DIFFERENTIALS ──
    differentialWithReasoning: [
      {
        diseaseId: 'volvulus', diseaseName: 'Sigmoid / Small Bowel Volvulus', probability: 12,
        reasonsFor: ['Rapid distension', 'Obstipation', 'Peritonism'],
        reasonsAgainst: ['Pain was gradual not instantaneous', 'No previous similar episodes', 'Less common in non-elderly'],
      },
      {
        diseaseId: 'secondary_bacterial_peritonitis', diseaseName: 'Secondary Bacterial Peritonitis', probability: 3,
        reasonsFor: ['Fever with rigors', 'Generalised peritonism', 'Hypotension/tachycardia'],
        reasonsAgainst: ['Peritonism likely secondary to obstruction', 'Not a primary diagnosis'],
      },
    ],

    // ── INVESTIGATIONS ──
    investigationPlan: {
      investigations: [
        {
          id: 'inv_axr', name: 'Abdominal X-ray (erect + supine)', category: 'imaging',
          rationale: 'First-line imaging for suspected obstruction — can show dilated loops, air-fluid levels',
          expectedFinding: 'Dilated small bowel loops with multiple air-fluid levels; possibly no gas in colon',
          priority: 'essential', recommendedFor: ['intestinal_obstruction', 'volvulus'],
        },
        {
          id: 'inv_ct', name: 'CT abdomen & pelvis with IV contrast', category: 'imaging',
          rationale: 'Gold standard to confirm obstruction, identify level, cause, and look for signs of strangulation',
          expectedFinding: 'Transition point with dilated proximal bowel and collapsed distal bowel; possible closed-loop or mesenteric edema',
          priority: 'essential', recommendedFor: ['intestinal_obstruction', 'volvulus'],
        },
        {
          id: 'inv_fbc', name: 'Full blood count', category: 'lab',
          rationale: 'Assess for leukocytosis suggesting infection/ischaemia; haemoconcentration from dehydration',
          expectedFinding: 'Leukocytosis (WBC > 15k) with neutrophilia; elevated haematocrit',
          priority: 'essential', recommendedFor: ['intestinal_obstruction', 'secondary_bacterial_peritonitis'],
        },
        {
          id: 'inv_uec', name: 'Urea, electrolytes, creatinine', category: 'lab',
          rationale: 'Assess hydration status and renal function; hypokalaemia may worsen ileus',
          expectedFinding: 'Elevated urea and creatinine (pre-renal AKI), possible hypokalaemia',
          priority: 'essential', recommendedFor: ['intestinal_obstruction'],
        },
        {
          id: 'inv_lft', name: 'Liver function tests', category: 'lab',
          rationale: 'Baseline; may be elevated in bilious vomiting or sepsis',
          expectedFinding: 'Mildly elevated transaminases, possible hyperbilirubinaemia',
          priority: 'supportive', recommendedFor: [],
        },
        {
          id: 'inv_lactate', name: 'Serum lactate', category: 'lab',
          rationale: 'Key marker of bowel ischaemia — elevated lactate suggests strangulation requiring emergency surgery',
          expectedFinding: 'Elevated (> 2 mmol/L) indicating bowel ischaemia',
          priority: 'essential', recommendedFor: ['intestinal_obstruction', 'volvulus'],
        },
        {
          id: 'inv_crp', name: 'C-reactive protein', category: 'lab',
          rationale: 'Markedly elevated in strangulation and peritonitis',
          expectedFinding: 'CRP > 150 mg/dL',
          priority: 'supportive', recommendedFor: ['secondary_bacterial_peritonitis'],
        },
        {
          id: 'inv_bg', name: 'Arterial blood gas', category: 'lab',
          rationale: 'Assess acid-base status and lactate; metabolic acidosis suggests ischaemia',
          expectedFinding: 'Metabolic acidosis with elevated lactate',
          priority: 'essential', recommendedFor: ['intestinal_obstruction'],
        },
        {
          id: 'inv_ecg', name: 'ECG', category: 'bedside',
          rationale: 'Pre-operative assessment given age and hypertension',
          expectedFinding: 'Sinus tachycardia, no ischaemic changes',
          priority: 'supportive', recommendedFor: [],
        },
        {
          id: 'inv_group', name: 'Blood group and cross-match', category: 'lab',
          rationale: 'Prepare for emergency laparotomy',
          expectedFinding: 'Group O+ or as determined',
          priority: 'essential', recommendedFor: [],
        },
      ],
      notes: 'Priority: stat AXR and bloods (FBC, UECs, lactate, blood group, crossmatch). CT if patient stabilises. Patient is high-risk for emergency surgery — involve anaesthesia early.',
    },

    // ── INVESTIGATION INTERPRETATION ──
    investigationInterpretation: {
      items: [
        {
          investigationId: 'inv_axr', investigationName: 'Abdominal X-ray (erect + supine)',
          result: 'Multiple dilated small bowel loops > 3 cm with central air-fluid levels. No gas visualized in colon. No free air under diaphragm.',
          isAbnormal: true,
          interpretation: 'Classic small bowel obstruction pattern. No free air (good — no perforation yet). Transition point likely in distal ileum.',
          supportsDiseaseIds: ['intestinal_obstruction', 'small_bowel_obstruction_adhesions'],
        },
        {
          investigationId: 'inv_fbc', investigationName: 'Full blood count',
          result: 'Hb 15.2 g/dL, WBC 18.4 x 10^9/L (neutrophilia 85%), Plt 450 x 10^9/L',
          isAbnormal: true,
          interpretation: 'Leukocytosis with neutrophilia suggests infection/ischaemia. Elevated Hb/haematocrit from haemoconcentration due to dehydration.',
          supportsDiseaseIds: ['intestinal_obstruction', 'secondary_bacterial_peritonitis'],
        },
        {
          investigationId: 'inv_uec', investigationName: 'Urea, electrolytes, creatinine',
          result: 'Na 135, K 3.2 (low), Cl 98, Urea 12.5 (high), Creat 132 (high)',
          isAbnormal: true,
          interpretation: 'Pre-renal acute kidney injury (AKI) from dehydration. Hypokalaemia from vomiting.',
          supportsDiseaseIds: ['intestinal_obstruction'],
        },
        {
          investigationId: 'inv_lactate', investigationName: 'Serum lactate',
          result: '3.8 mmol/L (elevated)',
          isAbnormal: true,
          interpretation: 'Elevated lactate > 2.0 suggests bowel ischaemia. This is an indication for emergency laparotomy.',
          supportsDiseaseIds: ['intestinal_obstruction', 'volvulus'],
        },
        {
          investigationId: 'inv_crp', investigationName: 'C-reactive protein',
          result: '186 mg/dL',
          isAbnormal: true,
          interpretation: 'Markedly elevated — consistent with strangulation and peritonitis.',
          supportsDiseaseIds: ['secondary_bacterial_peritonitis', 'intestinal_obstruction'],
        },
        {
          investigationId: 'inv_bg', investigationName: 'Arterial blood gas',
          result: 'pH 7.28 (low), HCO3 18, pCO2 32, BE -6, Lactate 3.8',
          isAbnormal: true,
          interpretation: 'Metabolic acidosis with raised lactate — confirms tissue hypoperfusion and bowel ischaemia.',
          supportsDiseaseIds: ['intestinal_obstruction'],
        },
      ],
      overallInterpretation: 'All results point to strangulated small bowel obstruction with bowel ischaemia and pre-renal AKI. The triad of dilated small bowel on AXR, leukocytosis, and elevated lactate mandates emergency surgical exploration. No free air suggests perforation has not yet occurred but is imminent.',
    },

    // ── TREATMENT PLAN ──
    treatmentPlan: {
      items: [
        {
          category: 'supportive', intervention: 'NBM (nil by mouth)', forCondition: 'Intestinal obstruction',
          rationale: 'Rest the bowel and prepare for potential surgery',
        },
        {
          category: 'supportive', intervention: 'NG tube insertion (wide bore) to free drainage',
          forCondition: 'Intestinal obstruction',
          rationale: 'Decompress the stomach and proximal bowel; relieves vomiting and reduces aspiration risk',
        },
        {
          category: 'supportive', intervention: 'IV fluids — Normal Saline 500 mL bolus stat → 1L 8-hourly',
          forCondition: 'Dehydration / pre-renal AKI',
          rationale: 'Resuscitate from hypovolaemic shock and correct dehydration. Monitor urine output',
          dosage: '500 mL stat + 1L 8-hourly',
        },
        {
          category: 'supportive', intervention: 'IV fluids — Ringer\'s Lactate with 20 mmol KCl/L after K+ replacement',
          forCondition: 'Hypokalaemia',
          rationale: 'Correct hypokalaemia once urine output confirmed (> 30 mL/hr)',
          dosage: '20 mmol KCl in 1L Ringer\'s over 8 hours',
        },
        {
          category: 'supportive', intervention: 'IV antibiotics — Ceftriaxone 2g IV 12-hourly + Metronidazole 500mg IV 8-hourly',
          forCondition: 'Peritonitis / sepsis',
          rationale: 'Cover Gram-negative rods and anaerobes from gut flora translocation. Adjust based on culture',
          dosage: 'Ceftriaxone 2g IV 12-hrly + Metronidazole 500mg IV 8-hrly',
          duration: 'Until source controlled',
        },
        {
          category: 'supportive', intervention: 'IV Paracetamol 1g 6-hourly',
          forCondition: 'Severe pain',
          rationale: 'Analgesia — avoid opioids until diagnosis confirmed to not mask peritonism',
          dosage: '1g IV 6-hourly',
        },
        {
          category: 'supportive', intervention: 'Urethral catheter (Foley\'s)',
          forCondition: 'Monitoring',
          rationale: 'Strict input-output charting to guide fluid resuscitation',
        },
        {
          category: 'definitive', intervention: 'Emergency exploratory laparotomy — adhesiolysis ± small bowel resection',
          forCondition: 'Strangulated small bowel obstruction',
          rationale: 'Indications: peritonism + elevated lactate + septic shock. Delay increases mortality due to bowel necrosis and perforation',
        },
        {
          category: 'complication_management', intervention: 'IV Noradrenaline infusion titrated to MAP ≥ 65 mmHg',
          forCondition: 'Septic shock refractory to fluids',
          rationale: 'If hypotension persists after 30 mL/kg IV fluids, start vasopressors',
          dosage: 'Start at 0.05 mcg/kg/min, titrate',
        },
        {
          category: 'complication_management', intervention: 'Post-operative ICU care',
          forCondition: 'Expected post-laparotomy',
          rationale: 'Patient is high-risk — age 65, septic shock, AKI. Requires close haemodynamic monitoring',
        },
      ],
      followUp: 'Daily surgical review. Post-operative wound care. Return to clinic in 2 weeks for suture removal and histology results.',
      disposition: 'admit_ward',
      dispositionRationale: 'Emergency admission — requires emergency laparotomy. Peritonism + elevated lactate + septic shock = surgical emergency.',
    },

    // ── MONITORING PLAN ──
    monitoringPlan: {
      vitalMonitoring: [
        { id: 'vital_bp', parameter: 'Blood pressure, heart rate, temperature', frequency: 'Every 15 minutes until stable, then 1-hourly', target: 'MAP ≥ 65 mmHg, HR < 100, afebrile', rationale: 'Septic shock monitoring' },
        { id: 'vital_uo', parameter: 'Urine output via Foley catheter', frequency: 'Hourly', target: '> 0.5 mL/kg/hour', rationale: 'Assess fluid resuscitation adequacy and AKI progression' },
        { id: 'vital_o2', parameter: 'Oxygen saturation', frequency: 'Continuous', target: 'SpO2 ≥ 94%', rationale: 'Monitor for respiratory compromise from distension or sepsis' },
        { id: 'vital_pain', parameter: 'Pain score', frequency: 'Every 4 hours', target: '< 4/10', rationale: 'Adequate analgesia' },
      ],
      labMonitoring: [
        { id: 'lab_uec', parameter: 'Urea, electrolytes, creatinine', frequency: 'Every 12 hours', target: 'Normalising', rationale: 'Monitor AKI and electrolyte correction' },
        { id: 'lab_lactate', parameter: 'Serum lactate', frequency: 'Every 6 hours after resuscitation', target: '< 2.0 mmol/L', rationale: 'Clearing lactate indicates restored perfusion' },
        { id: 'lab_fbc', parameter: 'Full blood count', frequency: 'Daily', target: 'Normalising WBC', rationale: 'Monitor infection response' },
        { id: 'lab_crp', parameter: 'C-reactive protein', frequency: 'Daily', target: 'Trending down', rationale: 'Monitor inflammatory response to treatment' },
        { id: 'lab_bg', parameter: 'Arterial blood gas', frequency: 'As clinically indicated', target: 'pH > 7.35', rationale: 'Monitor acid-base status' },
      ],
      complicationPrevention: [
        { id: 'comp_dvt', measure: 'Low molecular weight heparin (Enoxaparin 40mg SC daily) once haemostasis confirmed post-op', rationale: 'DVT prophylaxis — high-risk surgical patient' },
        { id: 'comp_stress', measure: 'Stress ulcer prophylaxis — Pantoprazole 40mg IV daily', rationale: 'Stress ulcer prevention in critical illness' },
        { id: 'comp_wound', measure: 'IV antibiotics continued 24 hours post-op; wound inspection daily', rationale: 'Prevent surgical site infection' },
        { id: 'comp_nutrition', measure: 'Consider TPN if NBM > 5 days', rationale: 'Nutritional support for prolonged ileus' },
      ],
      escalationCriteria: 'Immediate escalation to surgical consultant if: lactate > 4.0, MAP drops < 60 despite fluids + vasopressors, GCS < 12, new onset atrial fibrillation, or any sign of perforation (free air, sudden deterioration).',
      reviewPlan: 'Surgical review 4-hourly. Anaesthesia review pre-operatively. ICU consult if pressor requirement > 0.2 mcg/kg/min.',
    },

    // ── EMPTY PEDIATRIC / OBSTETRIC / GYNECOLOGY (male adult patient) ──
    birthHistory: {
      antenatal: { antenatalCare: '', ancVisits: 0, placeOfDelivery: '', maternalIllness: [], medications: [], ultrasounds: '', complications: [], tetanusToxoid: false, hivStatus: '', syphilisScreen: false, malariaProphylaxis: false },
      natal: { placeOfDelivery: '', deliveryType: '', presentation: '', cordProlapse: false, birthWeight: 0, gestationalAgeWeeks: 0, resuscitation: '', cry: '', color: '' },
      postnatal: { immediateFeeding: '', vitaminK: false, bcgGiven: false, opvGiven: false, neonatalJaundice: false, phototherapy: false, neonatalSepsis: false, nicuAdmission: false, nicuDays: 0, meconiumPassed: '', urinePassed: '' },
    },
    immunizationHistory: {
      bcg: { vaccine: 'BCG', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      opv0: { vaccine: 'OPV-0', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      opv1: { vaccine: 'OPV-1', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      opv2: { vaccine: 'OPV-2', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      opv3: { vaccine: 'OPV-3', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      ipv: { vaccine: 'IPV', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      penta1: { vaccine: 'Penta-1', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      penta2: { vaccine: 'Penta-2', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      penta3: { vaccine: 'Penta-3', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      pcv1: { vaccine: 'PCV-1', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      pcv2: { vaccine: 'PCV-2', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      pcv3: { vaccine: 'PCV-3', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      rota1: { vaccine: 'Rota-1', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      rota2: { vaccine: 'Rota-2', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      measles1: { vaccine: 'Measles-1', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      measles2: { vaccine: 'Measles-2', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      yellowFever: { vaccine: 'Yellow Fever', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      hpv: { vaccine: 'HPV', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      tetanus: { vaccine: 'Tetanus', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      covid: { vaccine: 'COVID-19', dose: '', ageGiven: '', dateGiven: '', given: false, notes: '' },
      other: [], upToDate: false,
    },
    growthDevelopment: { growthParams: [], milestones: { socialSmile: 'unknown', headControl: 'unknown', sitting: 'unknown', crawling: 'unknown', standing: 'unknown', walking: 'unknown', firstWords: 'unknown', sentences: 'unknown', toiletTraining: 'unknown', concerns: '' }, concerns: '' },
    nutritionHistory: { currentFeeding: '', breastfeedingDuration: '', formulaType: '', complementaryFoodsStarted: '', mealsPerDay: 0, foodGroups: [], supplements: [], appetite: '', feedingDifficulty: '', pica: false },
    obstetricHistory: { totalPregnancies: 0, totalDeliveries: 0, liveChildren: 0, stillbirths: 0, miscarriages: 0, ectopics: 0, cesareanSections: 0, pregnancies: [], currentPregnancy: { trimester: '', weeksGestation: 0, antenatalCare: '', fetalMovements: '', complications: [] } },
    gynecologicHistory: { menstrual: { menarche: 0, cycleLength: 0, duration: 0, regularity: '', flow: '', dysmenorrhea: '', intermenstrualBleeding: false, postcoitalBleeding: false, postmenopausalBleeding: false, menopauseAge: null, lmp: '' }, contraception: { currentMethod: 'none', previousMethods: [], duration: '', compliance: '', sideEffects: '' }, papSmears: '', stdHistory: [], gynecologicSurgery: [], fertilityConcerns: '', breastSymptoms: '' },
    obstetricExamination: null,
    newbornExamination: null,

    // ── ALL SECTIONS COMPLETED ──
    completedSections: [
      'chief_complaints', 'hpi', 'past_history', 'family_social', 'ros', 'impact',
      'history_summary', 'general_exam', 'systemic_exam', 'clinical_reasoning',
      'diagnosis', 'differentials', 'investigations', 'interpretation', 'treatment',
      'monitoring', 'local_examination',
    ],
  };

  // ── GENERATE ──
  const docs = generateDocuments(input);

  console.log('='.repeat(100));
  console.log('  COMPLETE CLINICAL DOCUMENTATION — FULL SYSTEM DEMO');
  console.log('  Disease: Strangulated Small Bowel Obstruction');
  console.log('='.repeat(100));
  console.log();
  console.log(docs.fullDocumentation);

  // Also show summary stats
  console.log('\n');
  console.log('─'.repeat(50));
  console.log('DOCUMENT GENERATION STATS');
  console.log('─'.repeat(50));
  console.log(`Total characters: ${docs.fullDocumentation.length}`);
  console.log(`Total lines: ${docs.fullDocumentation.split('\n').length}`);
  console.log(`Sections generated in document: ${countSections(docs.fullDocumentation)}`);

  function countSections(text: string): number {
    const matches = text.match(/─{3,} \d+\. /g);
    return matches ? matches.length : 0;
  }
}

main();
