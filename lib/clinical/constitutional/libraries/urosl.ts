import { SymptomObject } from '../types';

export interface UROSLSystem {
  id: string;
  label: string;
  icon: string;
  questions: UROSLQuestion[];
}

export interface UROSLQuestion {
  id: string;
  label: string;
  symptomId: string;
  positiveLabel: string;
  negativeLabel: string;
}

const UROSL_SYSTEMS: UROSLSystem[] = [
  {
    id: 'general', label: 'General / Constitutional', icon: '🌡️',
    questions: [
      { id: 'ros_fever', label: 'Fever / Chills?', symptomId: 'fever', positiveLabel: 'Reports fever/chills', negativeLabel: 'No fever or chills' },
      { id: 'ros_weight_loss', label: 'Unexplained weight loss?', symptomId: 'weight_loss', positiveLabel: 'Reports weight loss', negativeLabel: 'No weight loss' },
      { id: 'ros_night_sweats', label: 'Night sweats?', symptomId: 'night_sweats', positiveLabel: 'Reports night sweats', negativeLabel: 'No night sweats' },
      { id: 'ros_fatigue', label: 'Fatigue / malaise?', symptomId: 'fatigue', positiveLabel: 'Reports fatigue', negativeLabel: 'No fatigue' },
    ],
  },
  {
    id: 'ent', label: 'ENT / Head & Neck', icon: '👂',
    questions: [
      { id: 'ros_sore_throat', label: 'Sore throat?', symptomId: 'sore_throat', positiveLabel: 'Reports sore throat', negativeLabel: 'No sore throat' },
      { id: 'ros_ear_pain', label: 'Ear pain / discharge?', symptomId: 'ear_pain', positiveLabel: 'Reports ear pain/discharge', negativeLabel: 'No ear symptoms' },
      { id: 'ros_nasal', label: 'Nasal congestion / discharge?', symptomId: 'nasal_discharge', positiveLabel: 'Reports nasal symptoms', negativeLabel: 'No nasal symptoms' },
      { id: 'ros_hearing', label: 'Hearing loss?', symptomId: 'hearing_loss', positiveLabel: 'Reports hearing loss', negativeLabel: 'No hearing loss' },
    ],
  },
  {
    id: 'respiratory', label: 'Respiratory', icon: '🫁',
    questions: [
      { id: 'ros_cough', label: 'Cough?', symptomId: 'cough', positiveLabel: 'Reports cough', negativeLabel: 'No cough' },
      { id: 'ros_dyspnea', label: 'Shortness of breath?', symptomId: 'difficulty_breathing', positiveLabel: 'Reports dyspnea', negativeLabel: 'No dyspnea' },
      { id: 'ros_wheeze', label: 'Wheeze?', symptomId: 'wheeze', positiveLabel: 'Reports wheeze', negativeLabel: 'No wheeze' },
      { id: 'ros_hemoptysis', label: 'Coughing blood?', symptomId: 'hemoptysis', positiveLabel: 'Reports hemoptysis', negativeLabel: 'No hemoptysis' },
    ],
  },
  {
    id: 'cardiovascular', label: 'Cardiovascular', icon: '❤️',
    questions: [
      { id: 'ros_chest_pain', label: 'Chest pain / tightness?', symptomId: 'chest_pain', positiveLabel: 'Reports chest pain', negativeLabel: 'No chest pain' },
      { id: 'ros_palpitations', label: 'Palpitations?', symptomId: 'palpitations', positiveLabel: 'Reports palpitations', negativeLabel: 'No palpitations' },
      { id: 'ros_orthopnea', label: 'Orthopnea / PND?', symptomId: 'orthopnea', positiveLabel: 'Reports orthopnea/PND', negativeLabel: 'No orthopnea or PND' },
      { id: 'ros_oedema', label: 'Leg swelling?', symptomId: 'peripheral_oedema', positiveLabel: 'Reports leg swelling', negativeLabel: 'No leg swelling' },
    ],
  },
  {
    id: 'gastrointestinal', label: 'Gastrointestinal', icon: '🫃',
    questions: [
      { id: 'ros_abdominal_pain', label: 'Abdominal pain?', symptomId: 'abdominal_pain', positiveLabel: 'Reports abdominal pain', negativeLabel: 'No abdominal pain' },
      { id: 'ros_nausea_vomiting', label: 'Nausea / vomiting?', symptomId: 'vomiting', positiveLabel: 'Reports nausea/vomiting', negativeLabel: 'No nausea or vomiting' },
      { id: 'ros_diarrhea', label: 'Diarrhoea?', symptomId: 'diarrhea', positiveLabel: 'Reports diarrhoea', negativeLabel: 'No diarrhoea' },
      { id: 'ros_constipation', label: 'Constipation?', symptomId: 'constipation', positiveLabel: 'Reports constipation', negativeLabel: 'No constipation' },
    ],
  },
  {
    id: 'neurological', label: 'Neurological', icon: '🧠',
    questions: [
      { id: 'ros_headache', label: 'Headache?', symptomId: 'headache', positiveLabel: 'Reports headache', negativeLabel: 'No headache' },
      { id: 'ros_seizures', label: 'Seizures / convulsions?', symptomId: 'convulsions', positiveLabel: 'Reports seizures', negativeLabel: 'No seizures' },
      { id: 'ros_dizziness', label: 'Dizziness / vertigo?', symptomId: 'dizziness', positiveLabel: 'Reports dizziness', negativeLabel: 'No dizziness' },
      { id: 'ros_visual', label: 'Visual disturbance?', symptomId: 'visual_disturbance', positiveLabel: 'Reports visual disturbance', negativeLabel: 'No visual disturbance' },
    ],
  },
  {
    id: 'musculoskeletal', label: 'Musculoskeletal', icon: '🦴',
    questions: [
      { id: 'ros_joint_pain', label: 'Joint pain / swelling?', symptomId: 'joint_pain', positiveLabel: 'Reports joint pain/swelling', negativeLabel: 'No joint symptoms' },
      { id: 'ros_back_pain', label: 'Back pain?', symptomId: 'back_pain', positiveLabel: 'Reports back pain', negativeLabel: 'No back pain' },
      { id: 'ros_muscle_weakness', label: 'Muscle weakness?', symptomId: 'muscle_weakness_proximal', positiveLabel: 'Reports muscle weakness', negativeLabel: 'No muscle weakness' },
    ],
  },
  {
    id: 'genitourinary', label: 'Genitourinary', icon: '🚽',
    questions: [
      { id: 'ros_dysuria', label: 'Painful urination?', symptomId: 'dysuria', positiveLabel: 'Reports dysuria', negativeLabel: 'No dysuria' },
      { id: 'ros_oliguria', label: 'Reduced urine output?', symptomId: 'oliguria', positiveLabel: 'Reports oliguria', negativeLabel: 'Normal urine output' },
      { id: 'ros_hematuria', label: 'Blood in urine?', symptomId: 'hematuria', positiveLabel: 'Reports hematuria', negativeLabel: 'No hematuria' },
    ],
  },
  {
    id: 'dermatological', label: 'Dermatological', icon: '🧴',
    questions: [
      { id: 'ros_rash', label: 'Rash / skin lesions?', symptomId: 'rash', positiveLabel: 'Reports rash', negativeLabel: 'No rash' },
      { id: 'ros_pruritus', label: 'Itching?', symptomId: 'pruritus', positiveLabel: 'Reports pruritus', negativeLabel: 'No pruritus' },
      { id: 'ros_jaundice', label: 'Jaundice / yellowing?', symptomId: 'jaundice', positiveLabel: 'Reports jaundice', negativeLabel: 'No jaundice' },
    ],
  },
  {
    id: 'hematological', label: 'Hematological', icon: '🩸',
    questions: [
      { id: 'ros_easy_bruising', label: 'Easy bruising?', symptomId: 'easy_bruising', positiveLabel: 'Reports easy bruising', negativeLabel: 'No easy bruising' },
      { id: 'ros_pallor', label: 'Pallor / pale?', symptomId: 'pallor', positiveLabel: 'Reports pallor', negativeLabel: 'No pallor' },
      { id: 'ros_bleeding', label: 'Bleeding tendency?', symptomId: 'bleeding', positiveLabel: 'Reports bleeding tendency', negativeLabel: 'No bleeding tendency' },
    ],
  },
  {
    id: 'endocrine', label: 'Endocrine / Metabolic', icon: '⚖️',
    questions: [
      { id: 'ros_polydipsia', label: 'Excessive thirst?', symptomId: 'polydipsia', positiveLabel: 'Reports polydipsia', negativeLabel: 'No polydipsia' },
      { id: 'ros_polyuria', label: 'Excessive urination?', symptomId: 'polyuria', positiveLabel: 'Reports polyuria', negativeLabel: 'No polyuria' },
      { id: 'ros_thyroid', label: 'Heat/cold intolerance?', symptomId: 'thyroid_symptoms', positiveLabel: 'Reports thyroid symptoms', negativeLabel: 'No thyroid symptoms' },
    ],
  },
  {
    id: 'psychiatric', label: 'Psychiatric', icon: '🧘',
    questions: [
      { id: 'ros_depression', label: 'Low mood / depression?', symptomId: 'depression', positiveLabel: 'Reports low mood', negativeLabel: 'No mood disturbance' },
      { id: 'ros_anxiety', label: 'Anxiety / panic?', symptomId: 'anxiety', positiveLabel: 'Reports anxiety', negativeLabel: 'No anxiety' },
      { id: 'ros_sleep', label: 'Sleep disturbance?', symptomId: 'sleep_disturbance', positiveLabel: 'Reports sleep disturbance', negativeLabel: 'No sleep disturbance' },
    ],
  },
];

export function getAllROSLSystems(): UROSLSystem[] {
  return UROSL_SYSTEMS;
}

export function getROSLSystem(id: string): UROSLSystem | undefined {
  return UROSL_SYSTEMS.find(s => s.id === id);
}

export function generateROSStateFromSymptoms(
  symptoms: SymptomObject[]
): Record<string, boolean | null> {
  const state: Record<string, boolean | null> = {};
  for (const system of UROSL_SYSTEMS) {
    for (const q of system.questions) {
      const existing = symptoms.find(s => s.symptomId === q.symptomId && s.source === 'ros');
      if (existing) {
        state[q.id] = existing.present;
      } else {
        const fromCC = symptoms.find(s => s.symptomId === q.symptomId && s.source === 'chief_complaint');
        const fromHPI = symptoms.find(s => s.symptomId === q.symptomId && s.source === 'hpi');
        if (fromCC || fromHPI) {
          state[q.id] = 'reviewed_in_hpi' as any;
        } else {
          state[q.id] = null;
        }
      }
    }
  }
  return state;
}
