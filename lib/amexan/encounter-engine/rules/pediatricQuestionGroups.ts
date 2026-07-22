import { QuestionGroup, QuestionCard } from '../types/ces';

/**
 * Get pediatric question cards mapped to a constitutional section type.
 * Returns an empty array if no pediatric cards exist for the given section type.
 */
export function getPediatricCardsForSection(sectionId: string): QuestionCard[] {
  const groups = Object.values(PEDIATRIC_QUESTION_GROUPS).filter(
    g => g.constitutionalSectionId === sectionId
  );
  return groups.flatMap(g => g.cards);
}

export const PEDIATRIC_QUESTION_GROUPS: Record<string, QuestionGroup> = {
  // ═══════════════════════════════════════════
  // PEDIATRIC FAMILY / SOCIAL HISTORY
  // (replaces adult social_history for children)
  // ═══════════════════════════════════════════
  peds_family_social: {
    id: 'peds_family_social',
    label: 'Family & Social Background',
    phase: 'social_history',
    constitutionalSectionId: 'social_history',
    condition: { ageGroups: ['neonate', 'infant', 'child'] },
    cards: [
      { id: 'q_peds_caregiver', phase: 'social_history', question: 'Who is the primary caregiver?', type: 'text', required: true, factKey: 'peds_caregiver' },
      { id: 'q_peds_household', phase: 'social_history', question: 'Who lives in the household?', type: 'chips', multiple: true, chips: ['Mother', 'Father', 'Siblings', 'Grandparent', 'Other relatives', 'Non-relatives'], required: false, factKey: 'peds_household' },
      { id: 'q_peds_siblings', phase: 'social_history', question: 'Number of siblings?', type: 'text', required: false, factKey: 'peds_siblings' },
      { id: 'q_peds_birth_order', phase: 'social_history', question: 'Birth order among siblings?', type: 'text', required: false, factKey: 'peds_birth_order' },
      { id: 'q_peds_siblings_healthy', phase: 'social_history', question: 'Are siblings healthy?', type: 'chips', chips: ['All healthy', 'Some health issues', 'Unknown'], required: false, factKey: 'peds_siblings_healthy' },
      { id: 'q_peds_school', phase: 'social_history', question: 'School attendance?', type: 'chips', chips: ['Not yet school-age', 'Attends regularly', 'Irregular attendance', 'Not attending', 'Unknown'], required: false, factKey: 'peds_school' },
      { id: 'q_peds_school_grade', phase: 'social_history', question: 'Current grade/class?', type: 'text', required: false, factKey: 'peds_school_grade', dependsOn: { questionId: 'q_peds_school', value: 'Attends regularly' } },
      { id: 'q_peds_school_performance', phase: 'social_history', question: 'Any school performance concerns?', type: 'chips', chips: ['None', 'Learning difficulty', 'Behavioural', 'Frequent absences', 'Other'], required: false, factKey: 'peds_school_performance' },
      { id: 'q_peds_school_fees', phase: 'social_history', question: 'Who pays school fees?', type: 'chips', chips: ['Parent', 'Relative', 'Sponsor', 'Government', 'Not applicable'], required: false, factKey: 'peds_school_fees' },
      { id: 'q_peds_household_smokers', phase: 'social_history', question: 'Does anyone in the household smoke?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'peds_household_smokers' },
      { id: 'q_peds_tb_exposure', phase: 'social_history', question: 'Known TB contact in household?', type: 'chips', chips: ['No', 'Yes', 'Unknown'], required: false, factKey: 'peds_tb_exposure' },
      { id: 'q_peds_cooking_fuel', phase: 'social_history', question: 'Main cooking fuel?', type: 'chips', chips: ['Gas/Electric', 'Kerosene', 'Charcoal', 'Firewood', 'Other'], required: false, factKey: 'peds_cooking_fuel' },
      { id: 'q_peds_water_source', phase: 'social_history', question: 'Main water source?', type: 'chips', chips: ['Piped indoor', 'Piped outdoor', 'Borehole/well', 'River/stream', 'Bottled', 'Other'], required: false, factKey: 'peds_water_source' },
      { id: 'q_peds_toilet', phase: 'social_history', question: 'Type of toilet?', type: 'chips', chips: ['Flush toilet', 'VIP latrine', 'Pit latrine', 'Open/bush', 'Other'], required: false, factKey: 'peds_toilet' },
      { id: 'q_peds_handwashing', phase: 'social_history', question: 'Handwashing facility with soap?', type: 'chips', chips: ['Yes, always', 'Sometimes', 'No', 'Unknown'], required: false, factKey: 'peds_handwashing' },
      { id: 'q_peds_food_hygiene', phase: 'social_history', question: 'Food storage and hygiene practices?', type: 'chips', chips: ['Adequate', 'Inadequate', 'Unknown'], required: false, factKey: 'peds_food_hygiene' },
      { id: 'q_peds_sleeping_arrangements', phase: 'social_history', question: 'Sleeping arrangements?', type: 'chips', chips: ['Own bed', 'Shared bed (with whom?)', 'Floor'], required: false, factKey: 'peds_sleeping_arrangements' },
      { id: 'q_peds_bed_nets', phase: 'social_history', question: 'Does the child sleep under a bed net?', type: 'chips', chips: ['Always', 'Sometimes', 'Never', 'Not applicable'], required: false, factKey: 'peds_bed_nets' },
    ],
  },

  // ═══════════════════════════════════════════
  // BIRTH HISTORY (neonate + child)
  // ═══════════════════════════════════════════
  peds_birth_history: {
    id: 'peds_birth_history',
    label: 'Birth History',
    phase: 'past_medical',
    constitutionalSectionId: 'birth_history',
    condition: { ageGroups: ['neonate', 'infant', 'child'] },
    cards: [
      { id: 'q_peds_birth_place', phase: 'past_medical', question: 'Place of delivery?', type: 'chips', chips: ['Hospital', 'Health centre', 'Clinic', 'Home', 'On the way', 'Other'], required: true, factKey: 'peds_birth_place' },
      { id: 'q_peds_birth_attendant', phase: 'past_medical', question: 'Birth attendant?', type: 'chips', chips: ['Doctor', 'Midwife', 'Nurse', 'TBA', 'Relative', 'Unassisted', 'Unknown'], required: true, factKey: 'peds_birth_attendant' },
      { id: 'q_peds_gestation', phase: 'past_medical', question: 'Gestational age at delivery (weeks)?', type: 'chips', chips: ['Extremely preterm (<28)', 'Very preterm (28-32)', 'Moderate preterm (32-37)', 'Full term (37-42)', 'Post-term (>42)', 'Unknown'], required: true, factKey: 'peds_gestation' },
      { id: 'q_peds_antenatal_care', phase: 'past_medical', question: 'Antenatal care attended?', type: 'chips', chips: ['Yes, regular', 'Yes, irregular', 'None', 'Unknown'], required: false, factKey: 'peds_antenatal_care' },
      { id: 'q_peds_maternal_illness', phase: 'past_medical', question: 'Maternal illness during pregnancy?', type: 'chips', chips: ['None', 'Hypertension', 'Diabetes', 'Malaria', 'HIV', 'Syphilis', 'UTI', 'Other', 'Unknown'], required: false, factKey: 'peds_maternal_illness' },
      { id: 'q_peds_labour_onset', phase: 'past_medical', question: 'Onset of labour?', type: 'chips', chips: ['Spontaneous', 'Induced', 'Caesarean (no labour)', 'Unknown'], required: true, factKey: 'peds_labour_onset' },
      { id: 'q_peds_labour_duration', phase: 'past_medical', question: 'Duration of labour?', type: 'chips', chips: ['Normal (<12h)', 'Prolonged (>12h)', 'Unknown'], required: false, factKey: 'peds_labour_duration' },
      { id: 'q_peds_liquor', phase: 'past_medical', question: 'Liquor appearance?', type: 'chips', chips: ['Clear', 'Meconium-stained', 'Blood-stained', 'Foul-smelling', 'Unknown'], required: false, factKey: 'peds_liquor' },
      { id: 'q_peds_delivery_mode', phase: 'past_medical', question: 'Mode of delivery?', type: 'chips', chips: ['SVD', 'Assisted vacuum', 'Assisted forceps', 'C-section (elective)', 'C-section (emergency)', 'Unknown'], required: true, factKey: 'peds_delivery_mode' },
      { id: 'q_peds_cried_immediately', phase: 'past_medical', question: 'Did the baby cry immediately after birth?', type: 'chips', chips: ['Yes', 'No (weak cry)', 'No (not at all)', 'Unknown'], required: true, factKey: 'peds_cried_immediately' },
      { id: 'q_peds_resuscitation', phase: 'past_medical', question: 'Resuscitation required at birth?', type: 'chips', chips: ['None', 'Stimulation only', 'Bag-mask', 'Chest compressions', 'Intubation', 'Medications', 'Unknown'], required: false, factKey: 'peds_resuscitation' },
      { id: 'q_peds_birth_weight', phase: 'past_medical', question: 'Birth weight (kg)?', type: 'text', required: true, factKey: 'peds_birth_weight' },
      { id: 'q_peds_birth_length', phase: 'past_medical', question: 'Birth length (cm)?', type: 'text', required: false, factKey: 'peds_birth_length' },
      { id: 'q_peds_birth_hc', phase: 'past_medical', question: 'Head circumference at birth (cm)?', type: 'text', required: false, factKey: 'peds_birth_hc' },
      { id: 'q_peds_birth_trauma', phase: 'past_medical', question: 'Any birth injury?', type: 'chips', chips: ['None', 'Cephalohematoma', 'Caput', 'Fracture', 'Brachial plexus', 'Facial palsy', 'Other'], required: false, factKey: 'peds_birth_trauma' },
      { id: 'q_peds_neonatal_jaundice', phase: 'past_medical', question: 'Neonatal jaundice requiring treatment?', type: 'chips', chips: ['No', 'Yes (phototherapy)', 'Yes (exchange transfusion)', 'Unknown'], required: false, factKey: 'peds_neonatal_jaundice' },
      { id: 'q_peds_nicu_admission', phase: 'past_medical', question: 'Admitted to NICU?', type: 'chips', chips: ['No', 'Yes', 'Unknown'], required: false, factKey: 'peds_nicu_admission' },
      { id: 'q_peds_nicu_reason', phase: 'past_medical', question: 'Reason for NICU admission?', type: 'text', required: false, factKey: 'peds_nicu_reason', dependsOn: { questionId: 'q_peds_nicu_admission', value: 'Yes' } },
    ],
  },

  // ═══════════════════════════════════════════
  // GROWTH & DEVELOPMENT (infant + child)
  // ═══════════════════════════════════════════
  peds_growth_development: {
    id: 'peds_growth_development',
    label: 'Growth & Development',
    phase: 'past_medical',
    constitutionalSectionId: 'development',
    condition: { ageGroups: ['infant', 'child'] },
    cards: [
      // Growth
      { id: 'q_peds_current_weight', phase: 'past_medical', question: 'Current weight (kg)?', type: 'text', required: false, factKey: 'peds_current_weight' },
      { id: 'q_peds_current_height', phase: 'past_medical', question: 'Current height/length (cm)?', type: 'text', required: false, factKey: 'peds_current_height' },
      { id: 'q_peds_current_hc', phase: 'past_medical', question: 'Current head circumference (cm)?', type: 'text', required: false, factKey: 'peds_current_hc' },
      { id: 'q_peds_growth_concern', phase: 'past_medical', question: 'Any previous growth concerns?', type: 'chips', chips: ['None', 'Poor weight gain', 'Stunting', 'Wasting', 'Overweight', 'Microcephaly', 'Macrocephaly'], required: false, factKey: 'peds_growth_concern' },

      // Gross motor
      { id: 'q_peds_head_control', phase: 'past_medical', question: 'Head control?', type: 'chips', chips: ['Achieved age-appropriate', 'Not yet', 'Unknown'], required: false, factKey: 'peds_head_control' },
      { id: 'q_peds_sitting', phase: 'past_medical', question: 'Sitting without support?', type: 'chips', chips: ['Achieved age-appropriate', 'Not yet', 'Unknown'], required: false, factKey: 'peds_sitting' },
      { id: 'q_peds_crawling', phase: 'past_medical', question: 'Crawling?', type: 'chips', chips: ['Achieved', 'Not yet', 'Unknown'], required: false, factKey: 'peds_crawling' },
      { id: 'q_peds_walking', phase: 'past_medical', question: 'Walking independently?', type: 'chips', chips: ['Not yet', 'Starting to walk', 'Walking well', 'Running/kicking', 'Unknown'], required: false, factKey: 'peds_walking' },

      // Fine motor
      { id: 'q_peds_pincer_grasp', phase: 'past_medical', question: 'Pincer grasp?', type: 'chips', chips: ['Achieved age-appropriate', 'Not yet', 'Unknown'], required: false, factKey: 'peds_pincer_grasp' },
      { id: 'q_peds_drawing', phase: 'past_medical', question: 'Drawing/scribbling?', type: 'chips', chips: ['Not yet', 'Scribbles', 'Draws shapes', 'Draws figures', 'Unknown'], required: false, factKey: 'peds_drawing' },

      // Language
      { id: 'q_peds_vocalization', phase: 'past_medical', question: 'Vocalization?', type: 'chips', chips: ['Coos/babbles age-appropriate', 'Single words', 'Phrases', 'Sentences', 'Delayed', 'Unknown'], required: false, factKey: 'peds_vocalization' },
      { id: 'q_peds_responds_name', phase: 'past_medical', question: 'Responds to own name?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'peds_responds_name' },
      { id: 'q_peds_follows_commands', phase: 'past_medical', question: 'Follows simple commands?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'peds_follows_commands' },

      // Social
      { id: 'q_peds_social_smile', phase: 'past_medical', question: 'Social smile?', type: 'chips', chips: ['Achieved age-appropriate', 'Not yet', 'Unknown'], required: false, factKey: 'peds_social_smile' },
      { id: 'q_peds_stranger_anxiety', phase: 'past_medical', question: 'Stranger anxiety?', type: 'chips', chips: ['Appropriate', 'Not yet', 'Unknown'], required: false, factKey: 'peds_stranger_anxiety' },
      { id: 'q_peds_play', phase: 'past_medical', question: 'Play behaviour?', type: 'chips', chips: ['Solo play', 'Parallel play', 'Cooperative play', 'Not yet appropriate', 'Unknown'], required: false, factKey: 'peds_play' },
      { id: 'q_peds_regression', phase: 'past_medical', question: 'Any regression of milestones?', type: 'chips', chips: ['No', 'Yes', 'Unknown'], required: true, factKey: 'peds_regression' },
    ],
  },

  // ═══════════════════════════════════════════
  // IMMUNIZATION HISTORY (infant + child + adolescent)
  // ═══════════════════════════════════════════
  peds_immunization: {
    id: 'peds_immunization',
    label: 'Immunization History',
    phase: 'past_medical',
    constitutionalSectionId: 'immunization',
    condition: { ageGroups: ['infant', 'child', 'adolescent'] },
    cards: [
      { id: 'q_peds_immunization_status', phase: 'past_medical', question: 'Immunization status?', type: 'chips', chips: ['Up to date for age', 'Not up to date', 'Unknown', 'Never vaccinated'], required: true, factKey: 'peds_immunization_status' },
      { id: 'q_peds_bcg', phase: 'past_medical', question: 'BCG vaccine received?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'peds_bcg' },
      { id: 'q_peds_ polio', phase: 'past_medical', question: 'Polio vaccines received?', type: 'chips', chips: ['Complete', 'Incomplete', 'Unknown'], required: false, factKey: 'peds_polio' },
      { id: 'q_peds_pentavalent', phase: 'past_medical', question: 'Pentavalent (DPT-HepB-Hib) received?', type: 'chips', chips: ['Complete', 'Incomplete', 'Unknown'], required: false, factKey: 'peds_pentavalent' },
      { id: 'q_peds_pcv', phase: 'past_medical', question: 'Pneumococcal (PCV) received?', type: 'chips', chips: ['Complete', 'Incomplete', 'Unknown'], required: false, factKey: 'peds_pcv' },
      { id: 'q_peds_rotavirus', phase: 'past_medical', question: 'Rotavirus vaccine received?', type: 'chips', chips: ['Complete', 'Incomplete', 'Unknown'], required: false, factKey: 'peds_rotavirus' },
      { id: 'q_peds_mr', phase: 'past_medical', question: 'Measles/Rubella (MR) received?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'peds_mr' },
      { id: 'q_peds_yellow_fever', phase: 'past_medical', question: 'Yellow fever vaccine received?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'peds_yellow_fever' },
      { id: 'q_peds_vitamin_a', phase: 'past_medical', question: 'Vitamin A supplementation received?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'peds_vitamin_a' },
      { id: 'q_peds_immunization_other', phase: 'past_medical', question: 'Other vaccines received?', type: 'text', required: false, factKey: 'peds_immunization_other' },
      { id: 'q_peds_immunization_missed_reason', phase: 'past_medical', question: 'Reason for missed vaccines?', type: 'chips', chips: ['Vaccine unavailable', 'Child illness', 'Missed appointment', 'Caregiver refusal', 'Lack of awareness', 'Other', 'Not applicable'], required: false, factKey: 'peds_immunization_missed_reason' },
      { id: 'q_peds_immunization_adverse', phase: 'past_medical', question: 'Any adverse event following immunization?', type: 'chips', chips: ['None', 'Fever', 'Rash', 'Seizure', 'Allergic reaction', 'Hospitalization', 'Other'], required: false, factKey: 'peds_immunization_adverse' },
    ],
  },

  // ═══════════════════════════════════════════
  // NUTRITION HISTORY (neonate + infant + child)
  // ═══════════════════════════════════════════
  peds_nutrition: {
    id: 'peds_nutrition',
    label: 'Nutrition & Feeding',
    phase: 'past_medical',
    constitutionalSectionId: 'nutrition',
    condition: { ageGroups: ['neonate', 'infant', 'child'] },
    cards: [
      // Neonatal feeding (0-6 months)
      { id: 'q_peds_first_feed', phase: 'past_medical', question: 'Time to first feed after birth?', type: 'chips', chips: ['Within 1 hour', '1-6 hours', '>6 hours', 'Unknown'], required: false, factKey: 'peds_first_feed' },
      { id: 'q_peds_colostrum', phase: 'past_medical', question: 'Colostrum given?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'peds_colostrum' },
      { id: 'q_peds_breastfeeding', phase: 'past_medical', question: 'Breastfeeding?', type: 'chips', chips: ['Exclusive breastfeeding', 'Formula feeding', 'Mixed feeding', 'Not applicable'], required: true, factKey: 'peds_breastfeeding' },
      { id: 'q_peds_feeding_freq', phase: 'past_medical', question: 'Feeding frequency?', type: 'chips', chips: ['On demand', 'Scheduled', 'Poor intake', 'Unknown'], required: false, factKey: 'peds_feeding_freq' },
      { id: 'q_peds_feeding_difficulty', phase: 'past_medical', question: 'Any feeding difficulties?', type: 'chips', chips: ['None', 'Poor latch', 'Poor suck', 'Choking', 'Vomiting', 'Refusal', 'Other'], required: false, factKey: 'peds_feeding_difficulty' },

      // Complementary feeding (6+ months)
      { id: 'q_peds_complementary_age', phase: 'past_medical', question: 'Age complementary foods introduced (months)?', type: 'text', required: false, factKey: 'peds_complementary_age' },
      { id: 'q_peds_complementary_types', phase: 'past_medical', question: 'Types of complementary foods?', type: 'chips', multiple: true, chips: ['Cereals/porridge', 'Fruits', 'Vegetables', 'Meat/fish', 'Eggs', 'Legumes', 'Dairy', 'Family diet', 'Other'], required: false, factKey: 'peds_complementary_types' },
      { id: 'q_peds_complementary_meals', phase: 'past_medical', question: 'Meals per day (excluding milk)?', type: 'chips', chips: ['1-2 meals', '3-4 meals', '5+ meals', 'Not yet'], required: false, factKey: 'peds_complementary_meals' },

      // Current appetite
      { id: 'q_peds_appetite', phase: 'past_medical', question: 'Current appetite?', type: 'chips', chips: ['Normal', 'Reduced', 'Increased', 'Poor/refusing'], required: false, factKey: 'peds_appetite' },
      { id: 'q_peds_dietary_diversity', phase: 'past_medical', question: 'Dietary diversity adequate for age?', type: 'chips', chips: ['Adequate', 'Limited', 'Poor', 'Unknown'], required: false, factKey: 'peds_dietary_diversity' },
    ],
  },
};
