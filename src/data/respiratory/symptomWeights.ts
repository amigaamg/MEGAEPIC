import { SymptomWeight } from '@/src/types';

// This is the reasoning engine's brain.
// Positive = supports the disease. Negative = argues against it.
export const symptomWeights: SymptomWeight[] = [
  // PNEUMONIA
  { diseaseId: 'pneumonia', symptomKey: 'fever',               weight: 4  },
  { diseaseId: 'pneumonia', symptomKey: 'productive_cough',    weight: 4  },
  { diseaseId: 'pneumonia', symptomKey: 'tachypnea',           weight: 5  },
  { diseaseId: 'pneumonia', symptomKey: 'crackles',            weight: 5  },
  { diseaseId: 'pneumonia', symptomKey: 'hypoxia',             weight: 5  },
  { diseaseId: 'pneumonia', symptomKey: 'wheeze',              weight: -3 },
  { diseaseId: 'pneumonia', symptomKey: 'night_symptoms',      weight: -2 },
  { diseaseId: 'pneumonia', symptomKey: 'recurrent_episodes',  weight: -3 },

  // ASTHMA
  { diseaseId: 'asthma', symptomKey: 'wheeze',                 weight: 6  },
  { diseaseId: 'asthma', symptomKey: 'night_symptoms',         weight: 5  },
  { diseaseId: 'asthma', symptomKey: 'recurrent_episodes',     weight: 5  },
  { diseaseId: 'asthma', symptomKey: 'trigger_exposure',       weight: 4  },
  { diseaseId: 'asthma', symptomKey: 'family_history_atopy',   weight: 3  },
  { diseaseId: 'asthma', symptomKey: 'bronchodilator_response',weight: 6  },
  { diseaseId: 'asthma', symptomKey: 'fever',                  weight: -2 },
  { diseaseId: 'asthma', symptomKey: 'productive_cough',       weight: -2 },

  // BRONCHIOLITIS
  { diseaseId: 'bronchiolitis', symptomKey: 'age_under_2',     weight: 6  },
  { diseaseId: 'bronchiolitis', symptomKey: 'viral_prodrome',  weight: 4  },
  { diseaseId: 'bronchiolitis', symptomKey: 'wheeze',          weight: 4  },
  { diseaseId: 'bronchiolitis', symptomKey: 'reduced_feeding', weight: 3  },
  { diseaseId: 'bronchiolitis', symptomKey: 'crackles',        weight: 3  },
  { diseaseId: 'bronchiolitis', symptomKey: 'age_over_24mo',   weight: -4 },
  { diseaseId: 'bronchiolitis', symptomKey: 'focal_consolidation', weight: -4 },

  // TB
  { diseaseId: 'tb', symptomKey: 'chronic_cough',              weight: 5  },
  { diseaseId: 'tb', symptomKey: 'weight_loss',                weight: 5  },
  { diseaseId: 'tb', symptomKey: 'night_sweats',               weight: 5  },
  { diseaseId: 'tb', symptomKey: 'tb_contact',                 weight: 7  },
  { diseaseId: 'tb', symptomKey: 'hemoptysis',                 weight: 5  },
  { diseaseId: 'tb', symptomKey: 'lymphadenopathy',            weight: 4  },
  { diseaseId: 'tb', symptomKey: 'acute_onset',                weight: -4 },

  // CROUP
  { diseaseId: 'croup', symptomKey: 'stridor',                 weight: 7  },
  { diseaseId: 'croup', symptomKey: 'barking_cough',           weight: 7  },
  { diseaseId: 'croup', symptomKey: 'fever',                   weight: 2  },
  { diseaseId: 'croup', symptomKey: 'age_6mo_to_3yr',         weight: 3  },
  { diseaseId: 'croup', symptomKey: 'wheeze',                  weight: -3 },

  // URTI
  { diseaseId: 'urti', symptomKey: 'fever',                    weight: 2  },
  { diseaseId: 'urti', symptomKey: 'runny_nose',               weight: 4  },
  { diseaseId: 'urti', symptomKey: 'mild_cough',               weight: 3  },
  { diseaseId: 'urti', symptomKey: 'hypoxia',                  weight: -5 },
  { diseaseId: 'urti', symptomKey: 'crackles',                 weight: -5 },

  // PLEURAL EFFUSION
  { diseaseId: 'pleural_effusion', symptomKey: 'dull_percussion',   weight: 6 },
  { diseaseId: 'pleural_effusion', symptomKey: 'absent_breath_sounds', weight: 6 },
  { diseaseId: 'pleural_effusion', symptomKey: 'fever',             weight: 2 },
  { diseaseId: 'pleural_effusion', symptomKey: 'tb_contact',        weight: 3 },
];