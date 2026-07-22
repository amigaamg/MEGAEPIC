export interface UCCLEntry {
  id: string;
  label: string;
  aliases: string[];
  category: string;
  system: string;
  ageAppropriate: boolean;
  minAgeMonths?: number;
  explorationFields: string[];
  redFlag: boolean;
}

const UCCL_REGISTRY: UCCLEntry[] = [
  // Respiratory
  { id: 'cough', label: 'Cough', aliases: ['coughing', 'hacking cough'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, explorationFields: ['onset', 'character', 'duration', 'timing', 'productive', 'sputum'], redFlag: false },
  { id: 'wheeze', label: 'Wheeze', aliases: ['whistling', 'noisy breathing'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, explorationFields: ['onset', 'trigger', 'timing', 'severity'], redFlag: false },
  { id: 'difficulty_breathing', label: 'Difficulty Breathing', aliases: ['shortness of breath', 'dyspnea', 'breathlessness'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, explorationFields: ['onset', 'severity', 'positional', 'exertion'], redFlag: true },
  { id: 'stridor', label: 'Stridor', aliases: ['noisy inspiration', 'croupy cough'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, explorationFields: ['onset', 'severity', 'positional', 'feeding'], redFlag: true },
  { id: 'chest_indrawing', label: 'Chest Indrawing', aliases: ['subcostal retractions', 'intercostal retractions'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, minAgeMonths: 0, explorationFields: ['severity', 'associated'], redFlag: true },
  { id: 'cyanosis', label: 'Cyanosis', aliases: ['blue lips', 'blue skin'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, explorationFields: ['site', 'context', 'duration'], redFlag: true },
  { id: 'hemoptysis', label: 'Coughing Blood', aliases: ['blood in sputum', 'hemoptysis'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, minAgeMonths: 12, explorationFields: ['volume', 'frequency', 'associated'], redFlag: true },
  { id: 'nasal_discharge', label: 'Runny Nose', aliases: ['rhinorrhea', 'nasal congestion'], category: 'respiratory', system: 'ent', ageAppropriate: true, explorationFields: ['color', 'duration', 'fever'], redFlag: false },
  { id: 'noisy_breathing', label: 'Noisy Breathing', aliases: ['rattly chest', 'secretions'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, explorationFields: ['type', 'timing', 'position'], redFlag: false },

  // Infective
  { id: 'fever', label: 'Fever', aliases: ['hot body', 'high temperature', 'pyrexia'], category: 'infective', system: 'general', ageAppropriate: true, explorationFields: ['duration', 'pattern', 'height', 'response'], redFlag: false },
  { id: 'night_sweats', label: 'Night Sweats', aliases: ['drenching sweats'], category: 'infective', system: 'general', ageAppropriate: true, minAgeMonths: 6, explorationFields: ['severity', 'frequency', 'associated'], redFlag: false },
  { id: 'weight_loss', label: 'Weight Loss', aliases: ['wasting', 'failure to thrive'], category: 'infective', system: 'general', ageAppropriate: true, explorationFields: ['amount', 'duration', 'appetite'], redFlag: true },
  { id: 'rash', label: 'Rash', aliases: ['skin eruption', 'spots'], category: 'infective', system: 'dermatology', ageAppropriate: true, explorationFields: ['onset', 'distribution', 'character', 'itch'], redFlag: false },
  { id: 'lethargy', label: 'Lethargy', aliases: ['tiredness', 'low energy', 'sleepy'], category: 'infective', system: 'general', ageAppropriate: true, explorationFields: ['degree', 'duration', 'consciousness'], redFlag: true },

  // Neurological
  { id: 'convulsions', label: 'Convulsions', aliases: ['fits', 'seizures', 'jerking'], category: 'neurological', system: 'neurology', ageAppropriate: true, explorationFields: ['type', 'duration', 'frequency', 'post_ictal'], redFlag: true },
  { id: 'altered_consciousness', label: 'Altered Consciousness', aliases: ['confusion', 'unresponsive', 'coma'], category: 'neurological', system: 'neurology', ageAppropriate: true, explorationFields: ['level', 'onset', 'duration'], redFlag: true },
  { id: 'headache', label: 'Headache', aliases: ['head pain'], category: 'neurological', system: 'neurology', ageAppropriate: true, minAgeMonths: 36, explorationFields: ['site', 'character', 'severity', 'timing', 'associated'], redFlag: false },
  { id: 'visual_disturbance', label: 'Visual Disturbance', aliases: ['blurred vision', 'double vision'], category: 'neurological', system: 'ophthalmology', ageAppropriate: true, minAgeMonths: 36, explorationFields: ['type', 'onset', 'duration'], redFlag: true },

  // Gastrointestinal
  { id: 'vomiting', label: 'Vomiting', aliases: ['being sick', 'emesis'], category: 'gastrointestinal', system: 'gastroenterology', ageAppropriate: true, explorationFields: ['frequency', 'content', 'projectile', 'relation'], redFlag: false },
  { id: 'diarrhea', label: 'Diarrhea', aliases: ['loose stools', 'watery stool'], category: 'gastrointestinal', system: 'gastroenterology', ageAppropriate: true, explorationFields: ['frequency', 'consistency', 'blood', 'duration'], redFlag: false },
  { id: 'abdominal_pain', label: 'Abdominal Pain', aliases: ['stomach ache', 'belly pain'], category: 'gastrointestinal', system: 'gastroenterology', ageAppropriate: true, minAgeMonths: 24, explorationFields: ['site', 'character', 'severity', 'radiation', 'timing'], redFlag: false },
  { id: 'constipation', label: 'Constipation', aliases: ['difficulty passing stool', 'hard stool'], category: 'gastrointestinal', system: 'gastroenterology', ageAppropriate: true, explorationFields: ['duration', 'frequency', 'blood', 'pain'], redFlag: false },

  // Feeding
  { id: 'poor_feeding', label: 'Poor Feeding', aliases: ['not feeding well', 'reduced intake'], category: 'feeding', system: 'nutrition', ageAppropriate: true, minAgeMonths: 0, explorationFields: ['duration', 'amount', 'vomiting', 'weight'], redFlag: true },
  { id: 'excessive_crying', label: 'Excessive Crying', aliases: ['fussy', 'irritable'], category: 'feeding', system: 'general', ageAppropriate: true, minAgeMonths: 0, explorationFields: ['pattern', 'consolable', 'associated'], redFlag: false },
  { id: 'apnoea', label: 'Apnoea', aliases: ['stopped breathing', 'breathing pauses'], category: 'respiratory', system: 'respiratory', ageAppropriate: true, minAgeMonths: 0, explorationFields: ['frequency', 'duration', 'color_change'], redFlag: true },
  { id: 'feeding_cough', label: 'Coughing During Feeds', aliases: ['choking on feeds'], category: 'feeding', system: 'gastroenterology', ageAppropriate: true, minAgeMonths: 0, explorationFields: ['frequency', 'associated', 'weight'], redFlag: true },

  // Cardiovascular
  { id: 'chest_pain', label: 'Chest Pain', aliases: ['chest discomfort'], category: 'cardiovascular', system: 'cardiovascular', ageAppropriate: true, minAgeMonths: 72, explorationFields: ['site', 'character', 'radiation', 'exertion', 'relief'], redFlag: true },
  { id: 'palpitations', label: 'Palpitations', aliases: ['heart racing', 'skipping beats'], category: 'cardiovascular', system: 'cardiovascular', ageAppropriate: true, minAgeMonths: 120, explorationFields: ['onset', 'duration', 'trigger', 'associated'], redFlag: false },
  { id: 'peripheral_oedema', label: 'Swollen Feet/Legs', aliases: ['oedema', 'leg swelling'], category: 'cardiovascular', system: 'cardiovascular', ageAppropriate: true, minAgeMonths: 12, explorationFields: ['site', 'pitting', 'timing', 'associated'], redFlag: true },
  { id: 'orthopnea', label: 'Breathless When Lying Flat', aliases: ['cannot lie flat'], category: 'cardiovascular', system: 'respiratory', ageAppropriate: true, minAgeMonths: 60, explorationFields: ['pillows', 'severity'], redFlag: true },

  // Genitourinary
  { id: 'dysuria', label: 'Pain Passing Urine', aliases: ['burning urine', 'urodynia'], category: 'genitourinary', system: 'urology', ageAppropriate: true, explorationFields: ['duration', 'frequency', 'fever'], redFlag: false },
  { id: 'oliguria', label: 'Reduced Urine Output', aliases: ['passing less urine'], category: 'genitourinary', system: 'urology', ageAppropriate: true, explorationFields: ['duration', 'color', 'associated'], redFlag: true },
  { id: 'hematuria', label: 'Blood in Urine', aliases: ['red urine'], category: 'genitourinary', system: 'urology', ageAppropriate: true, explorationFields: ['timing', 'pain', 'clots'], redFlag: true },
  { id: 'vaginal_discharge', label: 'Vaginal Discharge', aliases: ['abnormal discharge'], category: 'genitourinary', system: 'gynecology', ageAppropriate: true, minAgeMonths: 120, explorationFields: ['color', 'odor', 'itch', 'timing'], redFlag: false },

  // Musculoskeletal
  { id: 'joint_pain', label: 'Joint Pain', aliases: ['arthralgia', 'painful joints'], category: 'musculoskeletal', system: 'musculoskeletal', ageAppropriate: true, explorationFields: ['site', 'number', 'swelling', 'timing', 'morning'], redFlag: false },
  { id: 'joint_swelling', label: 'Joint Swelling', aliases: ['swollen joints'], category: 'musculoskeletal', system: 'musculoskeletal', ageAppropriate: true, explorationFields: ['site', 'warmth', 'redness', 'limitation'], redFlag: false },
  { id: 'back_pain', label: 'Back Pain', aliases: ['spinal pain'], category: 'musculoskeletal', system: 'musculoskeletal', ageAppropriate: true, minAgeMonths: 60, explorationFields: ['site', 'radiation', 'movement', 'night'], redFlag: false },

  // ENT
  { id: 'sore_throat', label: 'Sore Throat', aliases: ['painful swallowing', 'odynophagia'], category: 'ent', system: 'ent', ageAppropriate: true, explorationFields: ['severity', 'duration', 'fever'], redFlag: false },
  { id: 'ear_pain', label: 'Ear Pain', aliases: ['otalgia', 'earache'], category: 'ent', system: 'ent', ageAppropriate: true, explorationFields: ['side', 'discharge', 'hearing'], redFlag: false },
  { id: 'hearing_loss', label: 'Hearing Loss', aliases: ['deafness', 'hard of hearing'], category: 'ent', system: 'ent', ageAppropriate: true, explorationFields: ['onset', 'side', 'progression'], redFlag: false },

  // Obstetric
  { id: 'abnormal_vaginal_bleeding', label: 'Abnormal Vaginal Bleeding', aliases: ['heavy periods', 'intermenstrual bleeding'], category: 'obstetric', system: 'gynecology', ageAppropriate: true, minAgeMonths: 120, explorationFields: ['volume', 'timing', 'pain', 'duration'], redFlag: true },
  { id: 'pelvic_pain', label: 'Pelvic Pain', aliases: ['lower abdominal pain', 'suprapubic pain'], category: 'obstetric', system: 'gynecology', ageAppropriate: true, minAgeMonths: 120, explorationFields: ['site', 'character', 'timing', 'cycle'], redFlag: false },
  { id: 'abdominal_bloating', label: 'Abdominal Bloating', aliases: ['swollen belly', 'distension'], category: 'obstetric', system: 'gastroenterology', ageAppropriate: true, explorationFields: ['onset', 'timing', 'associated'], redFlag: false },
];

export function searchUCCL(query: string): UCCLEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return UCCL_REGISTRY.filter(entry =>
    entry.label.toLowerCase().includes(q) ||
    entry.aliases.some(a => a.includes(q)) ||
    entry.system.toLowerCase().includes(q) ||
    entry.category.toLowerCase().includes(q)
  ).slice(0, 15);
}

export function getUCCLEntry(id: string): UCCLEntry | undefined {
  return UCCL_REGISTRY.find(e => e.id === id);
}

export function getAllUCCL(): UCCLEntry[] {
  return [...UCCL_REGISTRY];
}

export const UCCL_CATEGORIES = [
  { id: 'all', label: 'All Symptoms' },
  { id: 'respiratory', label: 'Respiratory' },
  { id: 'infective', label: 'Infective / General' },
  { id: 'neurological', label: 'Neurological' },
  { id: 'gastrointestinal', label: 'Gastrointestinal' },
  { id: 'cardiovascular', label: 'Cardiovascular' },
  { id: 'genitourinary', label: 'Genitourinary' },
  { id: 'musculoskeletal', label: 'Musculoskeletal' },
  { id: 'ent', label: 'ENT' },
  { id: 'obstetric', label: 'Obstetric / Gynecological' },
  { id: 'feeding', label: 'Feeding / Pediatric' },
];

export function getUCCLByCategory(category: string): UCCLEntry[] {
  if (category === 'all') return UCCL_REGISTRY;
  return UCCL_REGISTRY.filter(e => e.category === category);
}
