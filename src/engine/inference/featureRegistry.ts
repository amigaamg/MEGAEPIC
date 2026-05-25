import { PatientForm } from '../../types';

export interface FeatureDescriptor {
  id: string;
  type: 'symptom' | 'sign';
  questionText: string;
  isAnswered: (form: PatientForm) => boolean | undefined;
  setValue: (form: PatientForm, value: boolean) => PatientForm;
}

function toggleComplaint(form: PatientForm, id: string, value: boolean): PatientForm {
  if (value) {
    if (form.complaints.includes(id)) return form;
    return { ...form, complaints: [...form.complaints, id] };
  }
  return { ...form, complaints: form.complaints.filter(c => c !== id) };
}

function setHPI(form: PatientForm, key: string, value: boolean): PatientForm {
  return { ...form, hpi: { ...form.hpi, [key]: value } };
}

function setROS(form: PatientForm, key: string, value: boolean): PatientForm {
  return { ...form, ros: { ...form.ros, [key]: value } };
}

function setVitals(form: PatientForm, key: string, value: boolean): PatientForm {
  return { ...form, vitals: { ...form.vitals, [key]: value } };
}

function setPMH(form: PatientForm, key: string, value: boolean): PatientForm {
  return { ...form, pmh: { ...form.pmh, [key]: value } };
}

function setFamily(form: PatientForm, key: string, value: boolean): PatientForm {
  return { ...form, family: { ...form.family, [key]: value } };
}

export const FEATURE_REGISTRY: Record<string, FeatureDescriptor> = {
  // ── RESPIRATORY SYMPTOMS ──────────────────────────────────────────────
  cough: {
    id: 'cough', type: 'symptom',
    questionText: 'Is cough present?',
    isAnswered: (f) => f.complaints.includes('cough'),
    setValue: (f, v) => toggleComplaint(f, 'cough', v),
  },
  fever: {
    id: 'fever', type: 'symptom',
    questionText: 'Is fever present?',
    isAnswered: (f) => f.complaints.includes('fever'),
    setValue: (f, v) => toggleComplaint(f, 'fever', v),
  },
  wheeze: {
    id: 'wheeze', type: 'symptom',
    questionText: 'Is wheeze (whistling sound on breathing) present?',
    isAnswered: (f) => f.complaints.includes('wheeze'),
    setValue: (f, v) => toggleComplaint(f, 'wheeze', v),
  },
  difficulty_breathing: {
    id: 'difficulty_breathing', type: 'symptom',
    questionText: 'Is difficulty breathing present?',
    isAnswered: (f) => f.complaints.includes('difficulty_breathing'),
    setValue: (f, v) => toggleComplaint(f, 'difficulty_breathing', v),
  },
  stridor: {
    id: 'stridor', type: 'symptom',
    questionText: 'Is stridor (noisy breathing on inspiration) present?',
    isAnswered: (f) => f.complaints.includes('stridor'),
    setValue: (f, v) => toggleComplaint(f, 'stridor', v),
  },
  chest_pain: {
    id: 'chest_pain', type: 'symptom',
    questionText: 'Is chest pain present?',
    isAnswered: (f) => f.complaints.includes('chest_pain'),
    setValue: (f, v) => toggleComplaint(f, 'chest_pain', v),
  },
  hemoptysis: {
    id: 'hemoptysis', type: 'symptom',
    questionText: 'Is there coughing up of blood (haemoptysis)?',
    isAnswered: (f) => f.complaints.includes('hemoptysis'),
    setValue: (f, v) => toggleComplaint(f, 'hemoptysis', v),
  },
  noisy_breathing: {
    id: 'noisy_breathing', type: 'symptom',
    questionText: 'Is noisy breathing present?',
    isAnswered: (f) => f.complaints.includes('noisy_breathing'),
    setValue: (f, v) => toggleComplaint(f, 'noisy_breathing', v),
  },
  lethargy: {
    id: 'lethargy', type: 'symptom',
    questionText: 'Is lethargy or reduced activity present?',
    isAnswered: (f) => f.complaints.includes('lethargy'),
    setValue: (f, v) => toggleComplaint(f, 'lethargy', v),
  },
  cyanosis: {
    id: 'cyanosis', type: 'symptom',
    questionText: 'Is cyanosis (blue discoloration) present?',
    isAnswered: (f) => f.complaints.includes('cyanosis'),
    setValue: (f, v) => toggleComplaint(f, 'cyanosis', v),
  },
  nasal_discharge: {
    id: 'nasal_discharge', type: 'symptom',
    questionText: 'Is there nasal discharge or runny nose?',
    isAnswered: (f) => f.complaints.includes('nasal_discharge'),
    setValue: (f, v) => toggleComplaint(f, 'nasal_discharge', v),
  },
  sore_throat: {
    id: 'sore_throat', type: 'symptom',
    questionText: 'Is sore throat present?',
    isAnswered: (f) => f.complaints.includes('sore_throat'),
    setValue: (f, v) => toggleComplaint(f, 'sore_throat', v),
  },
  chest_tightness: {
    id: 'chest_tightness', type: 'symptom',
    questionText: 'Is chest tightness present?',
    isAnswered: (f) => f.complaints.includes('chest_tightness'),
    setValue: (f, v) => toggleComplaint(f, 'chest_tightness', v),
  },
  rash: {
    id: 'rash', type: 'symptom',
    questionText: 'Is rash present?',
    isAnswered: (f) => f.complaints.includes('rash'),
    setValue: (f, v) => toggleComplaint(f, 'rash', v),
  },
  ear_pain: {
    id: 'ear_pain', type: 'symptom',
    questionText: 'Is ear pain present?',
    isAnswered: (f) => f.complaints.includes('ear_pain'),
    setValue: (f, v) => toggleComplaint(f, 'ear_pain', v),
  },
  abdominal_pain: {
    id: 'abdominal_pain', type: 'symptom',
    questionText: 'Is abdominal pain present?',
    isAnswered: (f) => f.complaints.includes('abdominal_pain'),
    setValue: (f, v) => toggleComplaint(f, 'abdominal_pain', v),
  },
  reduced_feeding: {
    id: 'reduced_feeding', type: 'symptom',
    questionText: 'Is there reduced feeding or difficulty feeding?',
    isAnswered: (f) => f.hpi.feedingDiff,
    setValue: (f, v) => setHPI(f, 'feedingDiff', v),
  },
  difficulty_feeding: {
    id: 'difficulty_feeding', type: 'symptom',
    questionText: 'Is there difficulty with feeding?',
    isAnswered: (f) => f.hpi.feedingDiff,
    setValue: (f, v) => setHPI(f, 'feedingDiff', v),
  },
  poor_feeding: {
    id: 'poor_feeding', type: 'symptom',
    questionText: 'Is there poor appetite or feeding?',
    isAnswered: (f) => f.nutrition.appetite === 'good' || f.nutrition.appetite === 'reduced' || f.nutrition.appetite === 'anorexic',
    setValue: (f, v) => ({ ...f, nutrition: { ...f.nutrition, appetite: v ? 'reduced' : 'good' } }),
  },

  // ── HPI-SPECIFIC SYMPTOMS ────────────────────────────────────────────
  night_sweats: {
    id: 'night_sweats', type: 'symptom',
    questionText: 'Are night sweats present?',
    isAnswered: (f) => f.hpi.nightSweats,
    setValue: (f, v) => setHPI(f, 'nightSweats', v),
  },
  weight_loss: {
    id: 'weight_loss', type: 'symptom',
    questionText: 'Is there weight loss or failure to gain weight?',
    isAnswered: (f) => f.hpi.weightLoss,
    setValue: (f, v) => setHPI(f, 'weightLoss', v),
  },
  tb_contact: {
    id: 'tb_contact', type: 'symptom',
    questionText: 'Is there known TB contact in the household?',
    isAnswered: (f) => f.hpi.tbContact,
    setValue: (f, v) => setHPI(f, 'tbContact', v),
  },
  orthopnea: {
    id: 'orthopnea', type: 'symptom',
    questionText: 'Does the child have orthopnoea (difficulty breathing when lying flat)?',
    isAnswered: (f) => f.hpi.orthopnea,
    setValue: (f, v) => setHPI(f, 'orthopnea', v),
  },
  sweating_during_feeds: {
    id: 'sweating_during_feeds', type: 'symptom',
    questionText: 'Does the child sweat during feeds?',
    isAnswered: (f) => f.hpi.sweatingFeeds,
    setValue: (f, v) => setHPI(f, 'sweatingFeeds', v),
  },
  hoarseness: {
    id: 'hoarseness', type: 'symptom',
    questionText: 'Is hoarseness of the voice present?',
    isAnswered: (f) => f.hpi.hoarseness,
    setValue: (f, v) => setHPI(f, 'hoarseness', v),
  },
  choking_episode: {
    id: 'choking_episode', type: 'symptom',
    questionText: 'Was there a sudden choking or aspiration episode?',
    isAnswered: (f) => f.hpi.suddenOnset,
    setValue: (f, v) => setHPI(f, 'suddenOnset', v),
  },
  sudden_cough: {
    id: 'sudden_cough', type: 'symptom',
    questionText: 'Did the cough start suddenly?',
    isAnswered: (f) => f.hpi.suddenOnset,
    setValue: (f, v) => setHPI(f, 'suddenOnset', v),
  },
  unilateral_wheeze: {
    id: 'unilateral_wheeze', type: 'symptom',
    questionText: 'Is the wheeze unilateral (on one side only)?',
    isAnswered: (f) => f.hpi.unilateralWheeze,
    setValue: (f, v) => setHPI(f, 'unilateralWheeze', v),
  },
  chronic_cough: {
    id: 'chronic_cough', type: 'symptom',
    questionText: 'Is the cough chronic (>4 weeks duration)?',
    isAnswered: (f) => f.hpi.coughDuration === 'chronic',
    setValue: (f, v) => ({ ...f, hpi: { ...f.hpi, coughDuration: v ? 'chronic' : '' } }),
  },
  paroxysmal_cough: {
    id: 'paroxysmal_cough', type: 'symptom',
    questionText: 'Is there paroxysmal (whooping) cough?',
    isAnswered: (f) => f.hpi.pertussisContact,
    setValue: (f, v) => setHPI(f, 'pertussisContact', v),
  },
  post_tussive_vomiting: {
    id: 'post_tussive_vomiting', type: 'symptom',
    questionText: 'Does the child vomit after coughing episodes?',
    isAnswered: (f) => f.hpi.postTussiveVomiting,
    setValue: (f, v) => setHPI(f, 'postTussiveVomiting', v),
  },
  exercise_triggered_symptoms: {
    id: 'exercise_triggered_symptoms', type: 'symptom',
    questionText: 'Are symptoms triggered or worsened by exercise?',
    isAnswered: (f) => f.hpi.exerciseTriggered,
    setValue: (f, v) => setHPI(f, 'exerciseTriggered', v),
  },
  fast_breathing: {
    id: 'fast_breathing', type: 'symptom',
    questionText: 'Is the child breathing faster than normal? (Check RR)',
    isAnswered: (f) => f.vitals.rr !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, rr: v ? '40' : '' } }),
  },
  difficulty_swallowing: {
    id: 'difficulty_swallowing', type: 'symptom',
    questionText: 'Does the child have difficulty swallowing or drooling?',
    isAnswered: (f) => f.hpi.drooling,
    setValue: (f, v) => setHPI(f, 'drooling', v),
  },
  dysphagia: {
    id: 'dysphagia', type: 'symptom',
    questionText: 'Is there dysphagia or drooling?',
    isAnswered: (f) => f.hpi.drooling,
    setValue: (f, v) => setHPI(f, 'drooling', v),
  },
  recurrent_respiratory_infections: {
    id: 'recurrent_respiratory_infections', type: 'symptom',
    questionText: 'Does the child have recurrent respiratory infections?',
    isAnswered: (f) => f.pmh.recurrentChest,
    setValue: (f, v) => setPMH(f, 'recurrentChest', v),
  },
  hypothermia: {
    id: 'hypothermia', type: 'symptom',
    questionText: 'Does the child have hypothermia? (Check temperature)',
    isAnswered: (f) => f.vitals.temp !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, temp: v ? '35.5' : '' } }),
  },
  lymphadenopathy: {
    id: 'lymphadenopathy', type: 'symptom',
    questionText: 'Are lymph nodes enlarged (lymphadenopathy)?',
    isAnswered: (f) => f.vitals.lymphNodes !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, lymphNodes: v ? 'cervical' : 'none' } }),
  },

  // ── CNS/NEUROLOGICAL SYMPTOMS ─────────────────────────────────────────
  seizures: {
    id: 'seizures', type: 'symptom',
    questionText: 'Have seizures or convulsions occurred?',
    isAnswered: (f) => f.ros.seizures || f.hpi.seizureHPI,
    setValue: (f, v) => setROS(f, 'seizures', v),
  },
  altered_mental_state: {
    id: 'altered_mental_state', type: 'symptom',
    questionText: 'Is there altered mental state or confusion?',
    isAnswered: (f) => f.vitals.examConsciousLevel !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, examConsciousLevel: v ? 'drowsy' : 'alert' } }),
  },
  headache: {
    id: 'headache', type: 'symptom',
    questionText: 'Is headache present?',
    isAnswered: (f) => f.ros.headache,
    setValue: (f, v) => setROS(f, 'headache', v),
  },
  fatigue: {
    id: 'fatigue', type: 'symptom',
    questionText: 'Is easy fatigability present?',
    isAnswered: (f) => f.ros.fatigue,
    setValue: (f, v) => setROS(f, 'fatigue', v),
  },
  palpitations: {
    id: 'palpitations', type: 'symptom',
    questionText: 'Are palpitations (awareness of heart beat) present?',
    isAnswered: (f) => f.ros.palpitations,
    setValue: (f, v) => setROS(f, 'palpitations', v),
  },
  vomiting: {
    id: 'vomiting', type: 'symptom',
    questionText: 'Is vomiting present?',
    isAnswered: (f) => f.ros.vomiting || f.hpi.vomitingHPI,
    setValue: (f, v) => setROS(f, 'vomiting', v),
  },
  irritability: {
    id: 'irritability', type: 'symptom',
    questionText: 'Is there irritability or persistent crying?',
    isAnswered: (f) => f.hpi.vomitingHPI || f.ros.vomiting,
    setValue: (f, v) => setHPI(f, 'vomitingHPI', v),
  },
  constipation: {
    id: 'constipation', type: 'symptom',
    questionText: 'Is constipation present?',
    isAnswered: (f) => f.ros.constipation,
    setValue: (f, v) => setROS(f, 'constipation', v),
  },
  abdominal_pain_symptom: {
    id: 'abdominal_pain_symptom', type: 'symptom',
    questionText: 'Is there abdominal pain?',
    isAnswered: (f) => f.ros.abdominalPain,
    setValue: (f, v) => setROS(f, 'abdominalPain', v),
  },
  hypothermia_symptom: {
    id: 'hypothermia_symptom', type: 'symptom',
    questionText: 'Is hypothermia present?',
    isAnswered: (f) => f.vitals.temp !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, temp: v ? '35.0' : '37.0' } }),
  },
  apnoeic_spells: {
    id: 'apnoeic_spells', type: 'symptom',
    questionText: 'Does the child have apnoeic spells (pauses in breathing)?',
    isAnswered: (f) => f.hpi.cyanoticEpisodes,
    setValue: (f, v) => setHPI(f, 'cyanoticEpisodes', v),
  },
  conjunctivitis: {
    id: 'conjunctivitis', type: 'symptom',
    questionText: 'Is conjunctivitis (red eyes) present?',
    isAnswered: (f) => f.hpi.hoarseness, // proxy — no dedicated field
    setValue: (f, v) => setHPI(f, 'hoarseness', v),
  },
  joint_pain: {
    id: 'joint_pain', type: 'symptom',
    questionText: 'Is joint pain present?',
    isAnswered: (f) => f.vitals.examJointSwelling,
    setValue: (f, v) => setVitals(f, 'examJointSwelling', v),
  },
  photophobia: {
    id: 'photophobia', type: 'symptom',
    questionText: 'Is photophobia (aversion to light) present?',
    isAnswered: (f) => f.hpi.site === 'head' || f.hpi.character?.includes('light'),
    setValue: (f, v) => ({ ...f, hpi: { ...f.hpi, site: v ? 'head' : '' } }),
  },
  ascending_weakness: {
    id: 'ascending_weakness', type: 'symptom',
    questionText: 'Is there ascending muscle weakness (starting from legs)?',
    isAnswered: (f) => f.vitals.examMuscleWasting,
    setValue: (f, v) => setVitals(f, 'examMuscleWasting', v),
  },

  // ── EXAMINATION SIGNS ─────────────────────────────────────────────────
  crackles: {
    id: 'crackles', type: 'sign',
    questionText: 'Are crackles or crepitations heard on auscultation?',
    isAnswered: (f) => f.vitals.examCrackles !== undefined,
    setValue: (f, v) => setVitals(f, 'examCrackles', v),
  },
  bronchial_breathing: {
    id: 'bronchial_breathing', type: 'sign',
    questionText: 'Are bronchial breath sounds present?',
    isAnswered: (f) => f.vitals.examBronchial !== undefined,
    setValue: (f, v) => setVitals(f, 'examBronchial', v),
  },
  chest_indrawing: {
    id: 'chest_indrawing', type: 'sign',
    questionText: 'Is chest indrawing (subcostal/intercostal recession) present?',
    isAnswered: (f) => f.vitals.examIndrawing !== undefined,
    setValue: (f, v) => setVitals(f, 'examIndrawing', v),
  },
  wheeze_sign: {
    id: 'wheeze', type: 'sign',
    questionText: 'Is wheeze heard on auscultation of the chest?',
    isAnswered: (f) => f.vitals.examWheeze !== undefined,
    setValue: (f, v) => setVitals(f, 'examWheeze', v),
  },
  stridor_sign: {
    id: 'stridor', type: 'sign',
    questionText: 'Is inspiratory stridor present on examination?',
    isAnswered: (f) => f.vitals.examStridor !== undefined,
    setValue: (f, v) => setVitals(f, 'examStridor', v),
  },
  reduced_air_entry: {
    id: 'reduced_air_entry', type: 'sign',
    questionText: 'Is there reduced air entry on one or both sides?',
    isAnswered: (f) => f.vitals.examReducedBS !== undefined,
    setValue: (f, v) => setVitals(f, 'examReducedBS', v),
  },
  dullness_to_percussion: {
    id: 'dullness_to_percussion', type: 'sign',
    questionText: 'Is there dullness to percussion over the chest?',
    isAnswered: (f) => f.vitals.examDullness !== undefined,
    setValue: (f, v) => setVitals(f, 'examDullness', v),
  },
  hyperinflation: {
    id: 'hyperinflation', type: 'sign',
    questionText: 'Is there hyperinflation (hyperresonance on percussion)?',
    isAnswered: (f) => f.vitals.examHyperResonance !== undefined,
    setValue: (f, v) => setVitals(f, 'examHyperResonance', v),
  },
  hyperresonance: {
    id: 'hyperresonance', type: 'sign',
    questionText: 'Is hyperresonance present on percussion?',
    isAnswered: (f) => f.vitals.examHyperResonance !== undefined,
    setValue: (f, v) => setVitals(f, 'examHyperResonance', v),
  },
  tracheal_deviation: {
    id: 'tracheal_deviation', type: 'sign',
    questionText: 'Is tracheal deviation present?',
    isAnswered: (f) => f.vitals.examTrachealDeviation !== undefined,
    setValue: (f, v) => setVitals(f, 'examTrachealDeviation', v),
  },
  absent_breath_sounds: {
    id: 'absent_breath_sounds', type: 'sign',
    questionText: 'Are breath sounds absent on one side?',
    isAnswered: (f) => f.vitals.examReducedBS !== undefined,
    setValue: (f, v) => setVitals(f, 'examReducedBS', v),
  },
  hypoxia: {
    id: 'hypoxia', type: 'sign',
    questionText: 'Is hypoxia present? (SpO₂ less than 92%)',
    isAnswered: (f) => f.vitals.spo2 !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, spo2: v ? '88' : '98' } }),
  },
  tachypnea: {
    id: 'tachypnea', type: 'sign',
    questionText: 'Is tachypnoea (elevated respiratory rate) present?',
    isAnswered: (f) => f.vitals.rr !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, rr: v ? '50' : '30' } }),
  },
  toxic_appearance: {
    id: 'toxic_appearance', type: 'sign',
    questionText: 'Does the child appear toxic or severely ill?',
    isAnswered: (f) => f.vitals.generalCondition !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, generalCondition: v ? 'toxic' : 'well' } }),
  },
  clubbing: {
    id: 'clubbing', type: 'sign',
    questionText: 'Is digital clubbing present?',
    isAnswered: (f) => f.vitals.clubbingExam !== undefined,
    setValue: (f, v) => setVitals(f, 'clubbingExam', v),
  },
  cyanosis_sign: {
    id: 'cyanosis', type: 'sign',
    questionText: 'Is central cyanosis present on examination?',
    isAnswered: (f) => f.vitals.cyanosisExam !== undefined,
    setValue: (f, v) => setVitals(f, 'cyanosisExam', v),
  },
  pallor: {
    id: 'pallor', type: 'sign',
    questionText: 'Is pallor present?',
    isAnswered: (f) => f.vitals.pallorExam !== undefined,
    setValue: (f, v) => setVitals(f, 'pallorExam', v),
  },
  jaundice: {
    id: 'jaundice', type: 'sign',
    questionText: 'Is jaundice present?',
    isAnswered: (f) => f.vitals.jaundiceExam !== undefined,
    setValue: (f, v) => setVitals(f, 'jaundiceExam', v),
  },
  hepatomegaly: {
    id: 'hepatomegaly', type: 'sign',
    questionText: 'Is hepatomegaly (enlarged liver) present?',
    isAnswered: (f) => f.vitals.examHepatomegaly !== undefined,
    setValue: (f, v) => setVitals(f, 'examHepatomegaly', v),
  },
  splenomegaly: {
    id: 'splenomegaly', type: 'sign',
    questionText: 'Is splenomegaly (enlarged spleen) present?',
    isAnswered: (f) => f.vitals.examSplenomegaly !== undefined,
    setValue: (f, v) => setVitals(f, 'examSplenomegaly', v),
  },
  murmur: {
    id: 'murmur', type: 'sign',
    questionText: 'Is a heart murmur heard on auscultation?',
    isAnswered: (f) => f.vitals.examMurmur !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, examMurmur: v ? 'present' : '' } }),
  },
  gallop_rhythm: {
    id: 'gallop_rhythm', type: 'sign',
    questionText: 'Is an S3 gallop rhythm present?',
    isAnswered: (f) => f.vitals.examHeartSounds !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, examHeartSounds: v ? 'gallop' : '' } }),
  },
  tachycardia: {
    id: 'tachycardia', type: 'sign',
    questionText: 'Is tachycardia present? (Check heart rate)',
    isAnswered: (f) => f.vitals.hr !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, hr: v ? '150' : '' } }),
  },
  hypotension: {
    id: 'hypotension', type: 'sign',
    questionText: 'Is hypotension present? (Check blood pressure)',
    isAnswered: (f) => f.vitals.bpSystolic !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, bpSystolic: v ? '70' : '100' } }),
  },
  prolonged_cap_refill: {
    id: 'prolonged_cap_refill', type: 'sign',
    questionText: 'Is capillary refill prolonged (>3 seconds)?',
    isAnswered: (f) => f.vitals.capRefill !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, capRefill: v ? '4' : '<2' } }),
  },
  petechiae: {
    id: 'petechiae', type: 'sign',
    questionText: 'Are petechiae or purpura present on the skin?',
    isAnswered: (f) => f.vitals.examSkinPetechiae !== undefined,
    setValue: (f, v) => setVitals(f, 'examSkinPetechiae', v),
  },
  neck_stiffness: {
    id: 'neck_stiffness', type: 'sign',
    questionText: 'Is neck stiffness (nuchal rigidity) present?',
    isAnswered: (f) => f.vitals.examNeckStiffness !== undefined,
    setValue: (f, v) => setVitals(f, 'examNeckStiffness', v),
  },
  bulging_fontanelle: {
    id: 'bulging_fontanelle', type: 'sign',
    questionText: 'Is the fontanelle bulging (raised ICP)?',
    isAnswered: (f) => f.vitals.examFontanelle !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, examFontanelle: v ? 'bulging' : '' } }),
  },
  altered_consciousness: {
    id: 'altered_consciousness', type: 'sign',
    questionText: 'Is the conscious level reduced (not fully alert)?',
    isAnswered: (f) => f.vitals.examConsciousLevel !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, examConsciousLevel: v ? 'drowsy' : 'alert' } }),
  },
  prolonged_convulsion: {
    id: 'prolonged_convulsion', type: 'sign',
    questionText: 'Has there been a prolonged convulsion?',
    isAnswered: (f) => f.ros.seizures,
    setValue: (f, v) => setROS(f, 'seizures', v),
  },
  reduced_tone: {
    id: 'reduced_tone', type: 'sign',
    questionText: 'Is there reduced muscle tone (hypotonia)?',
    isAnswered: (f) => f.vitals.examCnsTone !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, examCnsTone: v ? 'hypotonia' : '' } }),
  },
  areflexia: {
    id: 'areflexia', type: 'sign',
    questionText: 'Are deep tendon reflexes absent (areflexia)?',
    isAnswered: (f) => f.vitals.examCnsReflexes !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, examCnsReflexes: v ? 'absent' : '' } }),
  },
  drooling: {
    id: 'drooling', type: 'sign',
    questionText: 'Is drooling present?',
    isAnswered: (f) => f.hpi.drooling,
    setValue: (f, v) => setHPI(f, 'drooling', v),
  },
  tripod_posture: {
    id: 'tripod_posture', type: 'sign',
    questionText: 'Is the child assuming a tripod/sniffing position?',
    isAnswered: (f) => f.hpi.tripodPosition,
    setValue: (f, v) => setHPI(f, 'tripodPosition', v),
  },
  elevated_bp: {
    id: 'elevated_bp', type: 'sign',
    questionText: 'Is blood pressure elevated above normal for age?',
    isAnswered: (f) => f.vitals.bpSystolic !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, bpSystolic: v ? '120' : '100' } }),
  },
  cervical_lymphadenopathy: {
    id: 'cervical_lymphadenopathy', type: 'sign',
    questionText: 'Are cervical lymph nodes enlarged?',
    isAnswered: (f) => f.vitals.lymphNodes !== '' && f.vitals.lymphNodeSite !== '',
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, lymphNodes: v ? 'cervical' : 'none', lymphNodeSite: v ? 'enlarged' : '' } }),
  },
  rash_sign: {
    id: 'rash', type: 'sign',
    questionText: 'Is a skin rash present on examination?',
    isAnswered: (f) => f.vitals.examSkinRash !== '' || f.ros.rash,
    setValue: (f, v) => ({ ...f, vitals: { ...f.vitals, examSkinRash: v ? 'generalised maculopapular' : '' } }),
  },
};

export function getWeight(featureId: string, form: PatientForm): number {
  const entry = FEATURE_REGISTRY[featureId];
  if (!entry) return 1;
  if (entry.type === 'symptom') {
    if (form.complaints.includes(featureId)) return 5;
    if (entry.isAnswered(form)) return 3;
    return 1;
  }
  return 1;
}
