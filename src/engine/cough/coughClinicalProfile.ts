export type CoughDuration = 'acute' | 'subacute' | 'chronic';
export type CoughCharacter = 'dry' | 'productive' | 'barking' | 'paroxysmal' | 'honking';
export type SputumType = 'none' | 'clear' | 'purulent' | 'rusty' | 'blood_streaked' | 'frothy_pink' | 'foul_putrid';
export type FeverPattern = 'no_fever' | 'low_grade' | 'high_grade' | 'continuous' | 'intermittent' | 'remittent';
export type Progression = 'improving' | 'worsening' | 'static' | 'fluctuating';
export type AgeGroup = 'neonatal' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export interface CoughProfile {
  duration: CoughDuration;
  durationDays: number;
  character: CoughCharacter | null;
  sputum: SputumType;
  sputumAmount: 'none' | 'scant' | 'moderate' | 'copious';
  hemoptysis: boolean;
  hemoptysisVolume?: 'streaks' | 'frank' | 'massive';
  onset: 'sudden' | 'gradual' | 'insidious';
  timing: 'morning' | 'night' | 'throughout_day' | 'after_meals' | 'with_exercise' | 'no_pattern';
  triggers: string[];
  aggravatingFactors: string[];
  relievingFactors: string[];
  progression: Progression;
  associatedFever: boolean;
  feverPattern: FeverPattern;
  associatedWheeze: boolean;
  associatedDyspnea: boolean;
  associatedChestPain: boolean;
  associatedWeightLoss: boolean;
  associatedNightSweats: boolean;
  associatedHoarseness: boolean;
  associatedDysphagia: boolean;
  associatedCyanosis: boolean;
  associatedPalpitations: boolean;
  associatedLegSwelling: boolean;
  associatedOrthopnea: boolean;
  exerciseInduced: boolean;
  nocturnal: boolean;
  postTussiveVomiting: boolean;
  chokingEpisode: boolean;
  sickContact: boolean;
  severity: number;
  impactSleep: 'normal' | 'disturbed' | 'severely_disturbed';
  impactFeeding: 'normal' | 'reduced' | 'unable';
  impactDailyActivity: 'none' | 'some' | 'significant';
}

export interface CoughDifferential {
  id: string;
  name: string;
  system: string;
  ageGroups: AgeGroup[];
  prevalenceWeight: number;
  mustNotMiss: boolean;
  typicalDuration: CoughDuration;
  keyCharacter: CoughCharacter[];
  keyAssociations: Partial<Record<keyof CoughProfile, number>>;
  redFlags: string[];
  riskFactors: string[];
  investigationPriority: 'urgent' | 'soon' | 'routine';
  keyPoint: string;
}

export const COUGH_DURATION_THRESHOLDS = {
  acute: { min: 0, max: 21, label: 'Acute (<3 weeks)' },
  subacute: { min: 21, max: 56, label: 'Subacute (3-8 weeks)' },
  chronic: { min: 56, max: Infinity, label: 'Chronic (>8 weeks)' },
};

export function classifyCoughDuration(days: number): CoughDuration {
  if (days <= 21) return 'acute';
  if (days <= 56) return 'subacute';
  return 'chronic';
}

export function getAgeGroup(months: number): AgeGroup {
  if (months <= 1) return 'neonatal';
  if (months <= 12) return 'infant';
  if (months <= 36) return 'toddler';
  if (months <= 144) return 'child';
  if (months <= 216) return 'adolescent';
  if (months <= 720) return 'adult';
  return 'elderly';
}

export const COUGH_DIFFERENTIALS: CoughDifferential[] = [
  {
    id: 'upper_respiratory_tract_infection',
    name: 'Upper Respiratory Tract Infection (Viral URTI / Common Cold)',
    system: 'respiratory',
    ageGroups: ['infant', 'toddler', 'child', 'adolescent', 'adult'],
    prevalenceWeight: 50,
    mustNotMiss: false,
    typicalDuration: 'acute',
    keyCharacter: ['dry', 'productive'],
    keyAssociations: {
      associatedFever: 3,
      sickContact: 2,
    },
    redFlags: [],
    riskFactors: ['daycare', 'school_attendance', 'sick_contact', 'season'],
    investigationPriority: 'routine',
    keyPoint: 'Most common cause of acute cough. Self-limiting. Requires no antibiotics. Supportive care only.'
  },
  {
    id: 'acute_bronchitis',
    name: 'Acute Bronchitis',
    system: 'respiratory',
    ageGroups: ['toddler', 'child', 'adolescent', 'adult', 'elderly'],
    prevalenceWeight: 20,
    mustNotMiss: false,
    typicalDuration: 'acute',
    keyCharacter: ['productive', 'dry'],
    keyAssociations: {
      associatedFever: 3,
      associatedDyspnea: 1,
      sputum: 4,
    },
    redFlags: ['hemoptysis', 'persistent_fever_>7_days'],
    riskFactors: ['smoking', 'recent_URTI', 'asthma'],
    investigationPriority: 'routine',
    keyPoint: 'Acute productive cough following URTI. Usually viral. No pneumonia signs on exam.'
  },
  {
    id: 'community_acquired_pneumonia',
    name: 'Community-Acquired Pneumonia',
    system: 'respiratory',
    ageGroups: ['infant', 'toddler', 'child', 'adolescent', 'adult', 'elderly'],
    prevalenceWeight: 15,
    mustNotMiss: true,
    typicalDuration: 'acute',
    keyCharacter: ['productive', 'dry'],
    keyAssociations: {
      associatedFever: 5,
      associatedDyspnea: 5,
      associatedChestPain: 3,
      sputum: 4,
      progression: 4,
      severity: 4,
    },
    redFlags: ['chest_indrawing', 'hypoxia', 'altered_consciousness', 'grunting', 'nasal_flaring'],
    riskFactors: ['HIV', 'malnutrition', 'prematurity', 'congenital_heart_disease', 'immunosuppression', 'smoking', 'COPD', 'diabetes', 'crowded_living'],
    investigationPriority: 'urgent',
    keyPoint: 'Fever + cough + tachypnoea + chest indrawing (in children) or focal chest signs (in adults). Treat with antibiotics. Chest X-ray confirms.'
  },
  {
    id: 'bronchial_asthma',
    name: 'Bronchial Asthma',
    system: 'respiratory',
    ageGroups: ['infant', 'toddler', 'child', 'adolescent', 'adult', 'elderly'],
    prevalenceWeight: 12,
    mustNotMiss: false,
    typicalDuration: 'chronic',
    keyCharacter: ['dry'],
    keyAssociations: {
      associatedWheeze: 5,
      exerciseInduced: 4,
      nocturnal: 4,
      timing: 3,
      triggers: 4,
      severity: 2,
    },
    redFlags: ['silent_chest', 'cyanosis', 'exhaustion', 'altered_consciousness'],
    riskFactors: ['atopy', 'family_asthma', 'eczema', 'allergic_rhinitis', 'prior_exacerbations'],
    investigationPriority: 'routine',
    keyPoint: 'Recurrent wheeze + cough (especially nocturnal, post-exercise, or with triggers). Personal/family history of atopy. Responds to bronchodilators and inhaled corticosteroids.'
  },
  {
    id: 'bronchiolitis',
    name: 'Acute Bronchiolitis',
    system: 'respiratory',
    ageGroups: ['neonatal', 'infant', 'toddler'],
    prevalenceWeight: 10,
    mustNotMiss: true,
    typicalDuration: 'acute',
    keyCharacter: ['productive', 'dry'],
    keyAssociations: {
      associatedFever: 3,
      associatedDyspnea: 5,
      associatedWheeze: 4,
      sputum: 1,
      severity: 3,
    },
    redFlags: ['apnoea', 'hypoxia', 'poor_feeding', 'lethargy', 'grunting', 'head_bobbing'],
    riskFactors: ['prematurity', 'congenital_heart_disease', 'age_<3_months', 'immunodeficiency', 'tobacco_smoke_exposure'],
    investigationPriority: 'urgent',
    keyPoint: 'First episode of wheeze in an infant <12 months with coryzal prodrome. RSV season. Supportive care. May require oxygen and NG feeding.'
  },
  {
    id: 'tuberculosis',
    name: 'Pulmonary Tuberculosis',
    system: 'respiratory',
    ageGroups: ['infant', 'toddler', 'child', 'adolescent', 'adult', 'elderly'],
    prevalenceWeight: 8,
    mustNotMiss: true,
    typicalDuration: 'chronic',
    keyCharacter: ['productive', 'dry'],
    keyAssociations: {
      associatedWeightLoss: 5,
      associatedNightSweats: 5,
      hemoptysis: 3,
      sputum: 3,
      severity: 2,
    },
    redFlags: ['hemoptysis', 'weight_loss', 'night_sweats', 'cough_>2_weeks_with_contacts'],
    riskFactors: ['HIV', 'TB_contact', 'malnutrition', 'crowded_living', 'diabetes', 'immunosuppression', 'alcohol_excess', 'incarceration'],
    investigationPriority: 'urgent',
    keyPoint: 'Cough >2 weeks + weight loss + night sweats + TB contact OR HIV positive. GeneXpert and CXR. Requires 6-month multi-drug regimen.'
  },
  {
    id: 'whooping_cough_pertussis',
    name: 'Pertussis (Whooping Cough)',
    system: 'respiratory',
    ageGroups: ['neonatal', 'infant', 'toddler', 'child'],
    prevalenceWeight: 5,
    mustNotMiss: true,
    typicalDuration: 'chronic',
    keyCharacter: ['paroxysmal'],
    keyAssociations: {
      postTussiveVomiting: 5,
      associatedCyanosis: 4,
      associatedDyspnea: 3,
      severity: 3,
    },
    redFlags: ['apnoea_in_infant', 'cyanosis_during_paroxysms', 'post_tussive_vomiting', 'poor_feeding'],
    riskFactors: ['unvaccinated', 'incomplete_immunization', 'household_contact_with_prolonged_cough', 'age_<6_months', 'waning_immunity'],
    investigationPriority: 'urgent',
    keyPoint: 'Paroxysmal cough followed by inspiratory whoop and post-tussive vomiting. Unvaccinated infant. PCR confirmation. Azithromycin.'
  },
  {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    system: 'gastroenterology',
    ageGroups: ['infant', 'toddler', 'child', 'adolescent', 'adult', 'elderly'],
    prevalenceWeight: 10,
    mustNotMiss: false,
    typicalDuration: 'chronic',
    keyCharacter: ['dry'],
    keyAssociations: {
      associatedDysphagia: 3,
      associatedHoarseness: 3,
      timing: 4,
      triggers: 3,
      nocturnal: 3,
    },
    redFlags: ['dysphagia', 'odynophagia', 'hematemesis', 'unexplained_weight_loss'],
    riskFactors: ['obesity', 'hiatal_hernia', 'pregnancy', 'smoking', 'alcohol', 'NSAID_use', 'delayed_gastric_emptying'],
    investigationPriority: 'routine',
    keyPoint: 'Chronic cough worse after meals or when lying flat. Associated heartburn, acid regurgitation, hoarseness. Trial of PPI is diagnostic and therapeutic.'
  },
  {
    id: 'post_nasal_drip',
    name: 'Post-Nasal Drip / Upper Airway Cough Syndrome (UACS)',
    system: 'ent',
    ageGroups: ['child', 'adolescent', 'adult'],
    prevalenceWeight: 15,
    mustNotMiss: false,
    typicalDuration: 'chronic',
    keyCharacter: ['dry', 'productive'],
    keyAssociations: {
      timing: 4,
      triggers: 2,
      associatedHoarseness: 2,
    },
    redFlags: [],
    riskFactors: ['allergic_rhinitis', 'sinusitis', 'deviated_septum', 'nasal_polyps', 'smoking'],
    investigationPriority: 'routine',
    keyPoint: 'Chronic cough with sensation of throat clearing, nasal congestion, or post-nasal drip. Worse in morning or when supine. Responds to antihistamines and intranasal steroids.'
  },
  {
    id: 'copd_exacerbation',
    name: 'Chronic Obstructive Pulmonary Disease (COPD) Exacerbation',
    system: 'respiratory',
    ageGroups: ['adult', 'elderly'],
    prevalenceWeight: 8,
    mustNotMiss: true,
    typicalDuration: 'acute',
    keyCharacter: ['productive', 'dry'],
    keyAssociations: {
      associatedDyspnea: 5,
      sputum: 4,
      associatedFever: 2,
      severity: 4,
      progression: 3,
    },
    redFlags: ['hypoxia', 'altered_consciousness', 'use_of_accessory_muscles', 'paradoxical_chest_wall_movement', 'new_onset_cyanosis'],
    riskFactors: ['smoking', 'biomass_fuel_exposure', 'alpha1_antitrypsin_deficiency', 'occupational_exposure', 'prior_exacerbations'],
    investigationPriority: 'urgent',
    keyPoint: 'Acute worsening of dyspnoea, cough and sputum in a known COPD patient or long-term smoker >40 years. Requires bronchodilators, steroids, and often antibiotics.'
  },
  {
    id: 'heart_failure',
    name: 'Heart Failure (Cardiac Cough)',
    system: 'cardiovascular',
    ageGroups: ['adult', 'elderly'],
    prevalenceWeight: 6,
    mustNotMiss: true,
    typicalDuration: 'chronic',
    keyCharacter: ['dry', 'productive'],
    keyAssociations: {
      associatedOrthopnea: 5,
      associatedLegSwelling: 4,
      associatedDyspnea: 5,
      associatedPalpitations: 2,
      sputum: 3,
      nocturnal: 4,
      severity: 3,
    },
    redFlags: ['orthopnea', 'PND', 'leg_swelling', 'raised_JVP', 'bibasilar_crackles', 'S3_gallop'],
    riskFactors: ['coronary_artery_disease', 'hypertension', 'diabetes', 'valvular_heart_disease', 'cardiomyopathy', 'alcohol_excess', 'prior_MI'],
    investigationPriority: 'urgent',
    keyPoint: 'Cough worse when lying flat (orthopnoea), paroxysmal nocturnal dyspnoea, leg swelling, fatigue. BNP elevated. Echocardiogram confirms.'
  },
  {
    id: 'lung_cancer',
    name: 'Lung Cancer (Bronchogenic Carcinoma)',
    system: 'oncology',
    ageGroups: ['adult', 'elderly'],
    prevalenceWeight: 3,
    mustNotMiss: true,
    typicalDuration: 'chronic',
    keyCharacter: ['dry', 'productive'],
    keyAssociations: {
      hemoptysis: 5,
      associatedWeightLoss: 5,
      associatedChestPain: 3,
      associatedDyspnea: 3,
      sputum: 2,
    },
    redFlags: ['hemoptysis_>40_years_smoker', 'unexplained_weight_loss', 'hoarseness', 'clubbing', 'recurrent_pneumonia_same_lobe', 'SVC_obstruction'],
    riskFactors: ['smoking', 'second_hand_smoke', 'asbestos', 'radon', 'family_history_lung_cancer', 'COPD', 'pulmonary_fibrosis'],
    investigationPriority: 'urgent',
    keyPoint: 'Chronic cough in a smoker >40 years with haemoptysis, weight loss, or chest pain. CT chest and bronchoscopy with biopsy. High mortality if advanced.'
  },
  {
    id: 'bronchiectasis',
    name: 'Bronchiectasis',
    system: 'respiratory',
    ageGroups: ['child', 'adolescent', 'adult', 'elderly'],
    prevalenceWeight: 4,
    mustNotMiss: false,
    typicalDuration: 'chronic',
    keyCharacter: ['productive'],
    keyAssociations: {
      sputum: 5,
      hemoptysis: 3,
      associatedDyspnea: 3,
      timing: 3,
      severity: 2,
    },
    redFlags: ['massive_hemoptysis', 'recurrent_hospitalizations', 'respiratory_failure'],
    riskFactors: ['severe_pneumonia_history', 'TB_history', 'immunodeficiency', 'ABPA', 'cystic_fibrosis', 'PCD'],
    investigationPriority: 'soon',
    keyPoint: 'Chronic productive cough with copious purulent sputum, recurrent chest infections, clubbing. HRCT chest shows dilated airways.'
  },
  {
    id: 'foreign_body_aspiration',
    name: 'Foreign Body Aspiration',
    system: 'respiratory',
    ageGroups: ['infant', 'toddler', 'child'],
    prevalenceWeight: 3,
    mustNotMiss: true,
    typicalDuration: 'acute',
    keyCharacter: ['dry', 'paroxysmal'],
    keyAssociations: {
      onset: 5,
      associatedDyspnea: 4,
      associatedCyanosis: 4,
      severity: 4,
    },
    redFlags: ['sudden_choking_episode', 'unilateral_wheeze', 'acute_dyspnea', 'cyanosis', 'stridor'],
    riskFactors: ['age_6mo_to_4yr', 'playing_with_small_objects', 'nuts_seeds_food'],
    investigationPriority: 'urgent',
    keyPoint: 'Sudden onset of cough and choking in a toddler while playing/eating. Unilateral wheeze or reduced air entry. Rigid bronchoscopy is diagnostic and therapeutic.'
  },
  {
    id: 'croup',
    name: 'Croup (Laryngotracheobronchitis)',
    system: 'respiratory',
    ageGroups: ['infant', 'toddler', 'child'],
    prevalenceWeight: 5,
    mustNotMiss: false,
    typicalDuration: 'acute',
    keyCharacter: ['barking'],
    keyAssociations: {
      associatedHoarseness: 4,
      associatedFever: 2,
      nocturnal: 4,
      severity: 2,
    },
    redFlags: ['stridor_at_rest', 'hypoxia', 'agitation', 'lethargy', 'tripod_positioning', 'drooling'],
    riskFactors: ['age_6mo_to_3yr', 'male_sex', 'autumn_winter_season', 'viral_prodrome'],
    investigationPriority: 'routine',
    keyPoint: 'Barking seal-like cough with inspiratory stridor and hoarseness. Age 6 months to 3 years. Worse at night. Clinical diagnosis. Dexamethasone and nebulised adrenaline.'
  },
  {
    id: 'covid_19',
    name: 'COVID-19 (SARS-CoV-2 Infection)',
    system: 'respiratory',
    ageGroups: ['infant', 'toddler', 'child', 'adolescent', 'adult', 'elderly'],
    prevalenceWeight: 7,
    mustNotMiss: true,
    typicalDuration: 'acute',
    keyCharacter: ['dry'],
    keyAssociations: {
      associatedFever: 4,
      associatedDyspnea: 3,
      severity: 2,
    },
    redFlags: ['hypoxia', 'respiratory_rate_>30', 'altered_consciousness', 'chest_pain_pressure'],
    riskFactors: ['close_contact_confirmed_case', 'age_>65', 'obesity', 'diabetes', 'hypertension', 'immunosuppression', 'chronic_lung_disease'],
    investigationPriority: 'urgent',
    keyPoint: 'Dry cough + fever + fatigue + loss of taste/smell during known outbreak. PCR confirms. Severity ranges from mild to critical ARDS.'
  },
  {
    id: 'influenza',
    name: 'Influenza (Seasonal Flu)',
    system: 'respiratory',
    ageGroups: ['infant', 'toddler', 'child', 'adolescent', 'adult', 'elderly'],
    prevalenceWeight: 10,
    mustNotMiss: false,
    typicalDuration: 'acute',
    keyCharacter: ['dry'],
    keyAssociations: {
      associatedFever: 5,
      severity: 3,
      sickContact: 3,
    },
    redFlags: ['respiratory_distress', 'altered_consciousness', 'severe_dehydration'],
    riskFactors: ['age_<2_>65', 'pregnancy', 'chronic_lung_disease', 'cardiac_disease', 'immunosuppression', 'obesity', 'healthcare_worker'],
    investigationPriority: 'routine',
    keyPoint: 'Acute onset high fever, myalgia, dry cough, sore throat during influenza season. Rapid antigen test or PCR. Oseltamivir if high risk or within 48 hours.'
  },
  {
    id: 'allergic_rhinitis',
    name: 'Allergic Rhinitis',
    system: 'ent',
    ageGroups: ['child', 'adolescent', 'adult'],
    prevalenceWeight: 10,
    mustNotMiss: false,
    typicalDuration: 'chronic',
    keyCharacter: ['dry'],
    keyAssociations: {
      triggers: 4,
      timing: 2,
    },
    redFlags: [],
    riskFactors: ['family_atopy', 'personal_asthma', 'eczema', 'seasonal_pollen_exposure'],
    investigationPriority: 'routine',
    keyPoint: 'Chronic cough with sneezing, itchy/watery eyes, nasal congestion. Seasonal variation. Allergic shiners and nasal crease on exam.'
  },
  {
    id: 'interstitial_lung_disease',
    name: 'Interstitial Lung Disease / Pulmonary Fibrosis',
    system: 'respiratory',
    ageGroups: ['adult', 'elderly'],
    prevalenceWeight: 2,
    mustNotMiss: false,
    typicalDuration: 'chronic',
    keyCharacter: ['dry'],
    keyAssociations: {
      associatedDyspnea: 5,
      severity: 3,
      triggers: 1,
    },
    redFlags: ['velcro_crackles', 'clubbing', 'hypoxia_on_exertion', 'restrictive_PFTs'],
    riskFactors: ['smoking', 'occupational_exposure', 'family_history_ILD', 'GERD', 'connective_tissue_disease', 'drug_exposure'],
    investigationPriority: 'soon',
    keyPoint: 'Chronic dry cough with progressive exertional dyspnoea. Basal velcro crackles on auscultation. HRCT shows interstitial changes.'
  },
  {
    id: 'pulmonary_embolism',
    name: 'Pulmonary Embolism',
    system: 'cardiovascular',
    ageGroups: ['adult', 'elderly'],
    prevalenceWeight: 2,
    mustNotMiss: true,
    typicalDuration: 'acute',
    keyCharacter: ['dry'],
    keyAssociations: {
      associatedDyspnea: 5,
      associatedChestPain: 4,
      hemoptysis: 3,
      onset: 5,
      severity: 4,
    },
    redFlags: ['acute_dyspnea', 'pleuritic_chest_pain', 'hemoptysis', 'syncope', 'hypotension', 'tachycardia', 'hypoxia'],
    riskFactors: ['surgery_<4_weeks', 'immobilisation', 'malignancy', 'previous_VTE', 'thrombophilia', 'pregnancy_postpartum', 'oestrogen_therapy', 'age_>65', 'obesity'],
    investigationPriority: 'urgent',
    keyPoint: 'Sudden onset dyspnoea and pleuritic chest pain with haemoptysis in a patient with VTE risk factors. D-dimer, CTPA confirms. High mortality if missed.'
  },
  {
    id: 'lung_abscess',
    name: 'Lung Abscess',
    system: 'respiratory',
    ageGroups: ['adult', 'elderly'],
    prevalenceWeight: 1,
    mustNotMiss: true,
    typicalDuration: 'subacute',
    keyCharacter: ['productive'],
    keyAssociations: {
      associatedFever: 5,
      sputum: 5,
      hemoptysis: 3,
      associatedWeightLoss: 4,
      severity: 3,
    },
    redFlags: ['foul_putrid_sputum', 'hemoptysis', 'high_fever_rigors', 'toxic_appearance'],
    riskFactors: ['aspiration_risk', 'periodontal_disease', 'immunosuppression', 'bronchial_obstruction', 'GERD', 'diabetes', 'alcohol_excess'],
    investigationPriority: 'urgent',
    keyPoint: 'Persistent high fever with foul-smelling purulent sputum. Risk factors for aspiration. CT chest shows cavitary lesion with air-fluid level.'
  },
];

interface SocratesQuestionDef {
  id: string;
  field: string;
  label: string;
  type: 'select' | 'boolean' | 'multi_select' | 'number' | 'text';
  options?: string[];
  clinicalGuide?: string;
  weight: number;
  condition?: { field: string; value?: boolean | string; values?: string[] };
}

interface SocratesSection {
  section: string;
  purpose: string;
  condition?: { field: string; value: boolean | string };
  questions: SocratesQuestionDef[];
}

export const COUGH_SOCRATES_FLOW: SocratesSection[] = [
  {
    section: 'Onset and Duration',
    purpose: 'characterize',
    questions: [
      { id: 'cough_onset', field: 'onset', label: 'How did the cough begin?', type: 'select' as const, options: ['Suddenly (within hours)', 'Gradually (over days)', 'Insidiously (over weeks to months)'], clinicalGuide: 'Sudden onset suggests foreign body, PE, or acute infection. Gradual suggests pneumonia or bronchitis. Insidious suggests TB, malignancy, or ILD', weight: 3 },
      { id: 'cough_duration_days', field: 'durationDays', label: 'How many days has the cough been present?', type: 'number' as const, clinicalGuide: 'Acute <21 days, Subacute 21-56 days, Chronic >56 days', weight: 4 },
    ]
  },
  {
    section: 'Character of Cough',
    purpose: 'characterize',
    questions: [
      { id: 'cough_character', field: 'coughChar', label: 'What is the nature of the cough?', type: 'select' as const, options: ['Dry / Non-productive', 'Productive (brings up phlegm)', 'Barking (like a seal)', 'Paroxysmal (in severe bouts)', 'Honking / Habitual'], clinicalGuide: 'Dry suggests URTI, asthma, GERD, ILD. Productive suggests bronchitis, pneumonia, bronchiectasis. Barking is CLASSIC for croup. Paroxysmal with whoop suggests pertussis. Honking suggests psychogenic cough.', weight: 5 },
      { id: 'cough_productive', field: 'productive', label: 'Do you cough up any phlegm or sputum?', type: 'boolean' as const, weight: 4, condition: { field: 'coughChar', values: ['Productive (brings up phlegm)'] } },
    ]
  },
  {
    section: 'Sputum Characterisation',
    purpose: 'characterize',
    condition: { field: 'productive', value: true },
    questions: [
      { id: 'sputum_color', field: 'sputumColor', label: 'What colour is the sputum?', type: 'select' as const, options: ['Clear or white (mucoid)', 'Yellow or green (purulent)', 'Rusty-coloured', 'Blood-stained', 'Frothy pink', 'Foul-smelling / Putrid'], clinicalGuide: 'Purulent suggests bacterial infection. Rusty is classically pneumococcal pneumonia. Blood-stained suggests TB, malignancy, bronchiectasis, or PE. Frothy pink suggests pulmonary oedema. Foul suggests lung abscess or anaerobic infection.', weight: 4 },
      { id: 'sputum_amount', field: 'sputumAmount', label: 'How much sputum per day?', type: 'select' as const, options: ['Small (<20 mL / few teaspoons)', 'Moderate (20-100 mL / egg-cup)', 'Large (>100 mL / cupful)'], clinicalGuide: 'Large volume suggests bronchiectasis or lung abscess', weight: 2 },
      { id: 'hemoptysis', field: 'hemoptysis', label: 'Is there any blood in the sputum? (Haemoptysis)', type: 'boolean' as const, weight: 5 },
      { id: 'hemoptysis_volume', field: 'hemoptysisVolume', label: 'How much blood?', type: 'select' as const, options: ['Blood-streaked only', 'Frank blood (teaspoonfuls)', 'Massive (cupful / >200 mL)'], condition: { field: 'hemoptysis', value: true }, clinicalGuide: 'Massive haemoptysis is a medical emergency. Consider TB, bronchiectasis, lung cancer, PE.', weight: 5 },
    ]
  },
  {
    section: 'Temporal Pattern',
    purpose: 'characterize',
    questions: [
      { id: 'cough_timing', field: 'coughTiming', label: 'When does the cough occur most?', type: 'select' as const, options: ['Morning only', 'Night-time / Nocturnal', 'Throughout the day', 'After meals', 'With exercise only', 'No particular pattern'], clinicalGuide: 'Morning cough with sputum suggests COPD or bronchiectasis. Nocturnal suggests asthma, GERD, or heart failure. After meals suggests GERD or aspiration. Exercise-induced suggests asthma.', weight: 3 },
      { id: 'cough_flow', field: 'flow', label: 'Is the cough getting better, worse, or staying the same?', type: 'select' as const, options: ['Improving', 'Worsening', 'Static', 'Fluctuating'], clinicalGuide: 'Worsening over time requires exclusion of TB, malignancy, or progressive lung disease', weight: 3 },
    ]
  },
  {
    section: 'Triggers and Relieving Factors',
    purpose: 'characterize',
    questions: [
      { id: 'cough_triggers', field: 'triggers', label: 'What triggers the cough?', type: 'multi_select' as const, options: ['Cold air', 'Dust or smoke', 'Exercise', 'Lying down', 'Eating or drinking', 'Strong smells', 'Emotions or stress', 'Talking or laughing', 'Nothing specific'], clinicalGuide: 'Cold air/exercise/emotions suggests asthma. Lying down suggests GERD or heart failure. Eating suggests aspiration.', weight: 3 },
      { id: 'cough_relieving', field: 'relieving', label: 'What makes the cough better?', type: 'multi_select' as const, options: ['Nothing', 'Rest', 'Inhaler (puffer)', 'Antacids', 'Cough syrup', 'Warm fluids', 'Sitting upright', 'Avoiding triggers'], clinicalGuide: 'Response to inhaler suggests asthma. Sitting upright suggests heart failure or GERD. Antacids suggests GERD.', weight: 2 },
    ]
  },
  {
    section: 'Associated Respiratory Symptoms',
    purpose: 'rule_in',
    questions: [
      { id: 'cough_fever', field: 'associatedFever', label: 'Has there been any fever?', type: 'boolean' as const, weight: 3 },
      { id: 'fever_pattern', field: 'feverPattern', label: 'What is the fever pattern?', type: 'select' as const, options: ['No fever', 'Low-grade (not measured)', 'High-grade with chills and rigors', 'Continuous (always elevated)', 'Intermittent (comes and goes)', 'Only at night (night sweats)'], condition: { field: 'associatedFever', value: true }, clinicalGuide: 'High fever with rigors suggests pneumonia, lung abscess, or influenza. Night sweats suggest TB or malignancy.', weight: 3 },
      { id: 'cough_wheeze', field: 'associatedWheeze', label: 'Is there any wheezing or whistling sound when breathing?', type: 'boolean' as const, weight: 4 },
      { id: 'cough_dyspnea', field: 'associatedDyspnea', label: 'Are you short of breath?', type: 'boolean' as const, weight: 4 },
      { id: 'dyspnea_severity', field: 'dyspneaSeverity', label: 'At what point do you become short of breath?', type: 'select' as const, options: ['Only with heavy exertion', 'With moderate activity (climbing stairs)', 'With minimal activity (walking to toilet)', 'At rest', 'Unable to speak full sentences'], condition: { field: 'associatedDyspnea', value: true }, clinicalGuide: 'Dyspnoea at rest or unable to speak sentences indicates severe respiratory compromise', weight: 4 },
      { id: 'cough_chest_pain', field: 'associatedChestPain', label: 'Is there any chest pain or discomfort?', type: 'boolean' as const, weight: 3 },
      { id: 'chest_pain_type', field: 'chestPainType', label: 'What type of chest pain?', type: 'select' as const, options: ['Sharp / pleuritic (worse with breathing)', 'Dull / aching', 'Crushing / squeezing', 'Burning / retrosternal'], condition: { field: 'associatedChestPain', value: true }, clinicalGuide: 'Pleuritic pain suggests pneumonia, PE, or pleurisy. Crushing suggests cardiac ischaemia. Burning suggests GERD.', weight: 3 },
      { id: 'cough_cyanosis', field: 'associatedCyanosis', label: 'Have you noticed any blue discolouration of the lips or fingers?', type: 'boolean' as const, weight: 5 },
    ]
  },
  {
    section: 'Constitutional and Systemic Symptoms',
    purpose: 'rule_in',
    questions: [
      { id: 'cough_weight_loss', field: 'associatedWeightLoss', label: 'Have you lost weight unintentionally?', type: 'boolean' as const, clinicalGuide: 'Unintentional weight loss raises suspicion for TB, malignancy, or chronic infection', weight: 4 },
      { id: 'weight_loss_amount', field: 'weightLossAmount', label: 'How much weight have you lost and over what period?', type: 'text' as const, condition: { field: 'associatedWeightLoss', value: true }, weight: 2 },
      { id: 'cough_night_sweats', field: 'associatedNightSweats', label: 'Do you have drenching night sweats (soaking the bedsheets)?', type: 'boolean' as const, clinicalGuide: 'Drenching night sweats are classic for TB. Also seen in lymphoma and other chronic infections.', weight: 5 },
      { id: 'cough_hoarseness', field: 'associatedHoarseness', label: 'Has your voice become hoarse?', type: 'boolean' as const, clinicalGuide: 'Hoarseness + cough suggests laryngitis, GERD, recurrent laryngeal nerve involvement (lung cancer), or croup in children', weight: 2 },
      { id: 'cough_dysphagia', field: 'associatedDysphagia', label: 'Do you have difficulty swallowing?', type: 'boolean' as const, clinicalGuide: 'Dysphagia + cough suggests GERD, oesophageal cancer, or aspiration', weight: 3 },
    ]
  },
  {
    section: 'Cardiovascular Review of Systems',
    purpose: 'rule_in',
    questions: [
      { id: 'cough_orthopnea', field: 'associatedOrthopnea', label: 'Do you find it harder to breathe when lying flat? How many pillows do you sleep on?', type: 'boolean' as const, clinicalGuide: 'Orthopnoea is a cardinal symptom of heart failure. Also suggests GERD if worse after meals.', weight: 5 },
      { id: 'cough_pnd', field: 'associatedPND', label: 'Do you wake up suddenly at night gasping for air?', type: 'boolean' as const, clinicalGuide: 'Paroxysmal Nocturnal Dyspnoea (PND) is highly specific for heart failure.', weight: 5 },
      { id: 'cough_leg_swelling', field: 'associatedLegSwelling', label: 'Do you have any swelling in your ankles or legs?', type: 'boolean' as const, weight: 3 },
      { id: 'cough_palpitations', field: 'associatedPalpitations', label: 'Do you feel your heart racing or skipping beats?', type: 'boolean' as const, weight: 2 },
    ]
  },
  {
    section: 'GI, ENT & Medication Review',
    purpose: 'rule_in',
    questions: [
      { id: 'cough_heartburn', field: 'associatedHeartburn', label: 'Do you experience heartburn, acid reflux, or a burning sensation in your chest?', type: 'boolean' as const, clinicalGuide: 'GERD is one of the most common causes of chronic cough. Cough may be the only symptom of GERD.', weight: 4 },
      { id: 'cough_regurgitation', field: 'associatedRegurgitation', label: 'Do you experience regurgitation (food or liquid coming back up into your mouth)?', type: 'boolean' as const, condition: { field: 'associatedHeartburn', value: true }, clinicalGuide: 'Regurgitation is more specific for GERD than heartburn alone. Nocturnal regurgitation is highly suggestive.', weight: 3 },
      { id: 'cough_nasal_congestion', field: 'nasalCongestion', label: 'Do you have a blocked or runny nose?', type: 'boolean' as const, clinicalGuide: 'Nasal congestion suggests URTI, allergic rhinitis, or post-nasal drip as the cause of cough', weight: 3 },
      { id: 'cough_post_nasal_drip', field: 'postNasalDrip', label: 'Do you feel like mucus is dripping down the back of your throat, causing you to clear your throat frequently?', type: 'boolean' as const, clinicalGuide: 'Post-nasal drip / UACS is one of the most common causes of chronic cough. Ask about sensation of throat clearing.', weight: 4 },
      { id: 'cough_sore_throat', field: 'associatedSoreThroat', label: 'Do you have a sore throat?', type: 'boolean' as const, clinicalGuide: 'Sore throat with cough suggests URTI or post-nasal drip. If no cough with sore throat, consider pharyngitis alone.', weight: 2 },
      { id: 'cough_hoarseness', field: 'associatedHoarseness', label: 'Has your voice become hoarse?', type: 'boolean' as const, clinicalGuide: 'Hoarseness with cough suggests GERD/laryngopharyngeal reflux, laryngitis, or recurrent laryngeal nerve palsy (lung cancer). In children, suggests croup.', weight: 3 },
      { id: 'cough_dysphagia', field: 'associatedDysphagia', label: 'Do you have difficulty swallowing food or liquids?', type: 'boolean' as const, clinicalGuide: 'Dysphagia with cough suggests GERD, oesophageal pathology, or aspiration. Also screen for neurological causes.', weight: 4 },
      { id: 'cough_odynophagia', field: 'associatedOdynophagia', label: 'Is swallowing painful?', type: 'boolean' as const, clinicalGuide: 'Odynophagia suggests oesophagitis, pharyngitis, or epiglottitis', weight: 2 },
      { id: 'cough_ace_inhibitor', field: 'medicationACEI', label: 'Are you currently taking any medication for blood pressure, especially ACE inhibitors (e.g., enalapril, lisinopril, captopril)?', type: 'boolean' as const, clinicalGuide: 'ACE inhibitors cause a dry, persistent cough in 5-20% of patients. It is one of the most commonly missed causes of chronic cough. Cough resolves within 1-4 weeks of stopping.', weight: 5 },
      { id: 'cough_beta_blocker', field: 'medicationBetaBlocker', label: 'Are you taking any beta-blocker medications (e.g., propranolol, atenolol, bisoprolol)?', type: 'boolean' as const, clinicalGuide: 'Beta-blockers can worsen asthma and cause bronchospasm, especially non-cardioselective ones.', weight: 3 },
      { id: 'cough_anticoagulant', field: 'medicationAnticoagulant', label: 'Are you on any blood thinners (aspirin, warfarin, rivaroxaban, apixaban)?', type: 'boolean' as const, clinicalGuide: 'Anticoagulants increase the risk of bleeding if haemoptysis develops. Important safety information.', weight: 3 },
      { id: 'cough_immunization_flu', field: 'fluVaccineThisYear', label: 'Did you receive the influenza vaccine this year?', type: 'boolean' as const, clinicalGuide: 'Influenza vaccine reduces risk and severity of influenza. Unvaccinated status increases influenza probability during season.', weight: 2 },
      { id: 'cough_immunization_pneumococcal', field: 'pneumococcalVaccine', label: 'Have you ever received the pneumonia vaccine?', type: 'boolean' as const, clinicalGuide: 'Pneumococcal vaccine reduces risk of pneumococcal pneumonia. Adults >65 and those with chronic conditions should receive it.', weight: 2 },
    ]
  },
  {
    section: 'Impact on Daily Life',
    purpose: 'severity',
    questions: [
      { id: 'cough_impact_sleep', field: 'impactSleep', label: 'How does the cough affect your sleep?', type: 'select' as const, options: ['No affect on sleep', 'Wakes me occasionally', 'Wakes me frequently', 'Cannot sleep due to cough'], weight: 3 },
      { id: 'cough_impact_feeding', field: 'impactFeeding', label: 'How does the cough affect your eating / feeding?', type: 'select' as const, options: ['Normal appetite and feeding', 'Reduced appetite', 'Unable to feed or eat properly', 'Vomiting after coughing bouts'], weight: 3 },
      { id: 'cough_impact_daily', field: 'impactDaily', label: 'How does the cough affect your daily activities?', type: 'select' as const, options: ['No limitation', 'Some limitation (avoid some activities)', 'Significant limitation (cannot work/attend school)', 'Confined to bed or house'], weight: 2 },
      { id: 'cough_severity_scale', field: 'severity', label: 'On a scale of 0 to 10, how severe is the cough?', type: 'number' as const, clinicalGuide: '0 = no cough, 10 = worst possible cough', weight: 2 },
    ]
  },
];

export interface TargetedRiskFactor {
  id: string;
  label: string;
  field: string;
  type: 'boolean' | 'select' | 'text';
  options?: string[];
  clinicalGuide: string;
  relevantDifferentials: string[];
  weight: number;
}

export const COUGH_RISK_FACTORS_BY_DIFFERENTIAL: Record<string, TargetedRiskFactor[]> = {
  community_acquired_pneumonia: [
    { id: 'rf_hiv', field: 'riskHIV', label: 'Do you know your HIV status?', type: 'select', options: ['Negative', 'Positive', 'Unknown', 'Never tested'], clinicalGuide: 'HIV is the strongest risk factor for pneumonia and TB', relevantDifferentials: ['community_acquired_pneumonia', 'tuberculosis'], weight: 5 },
    { id: 'rf_malnutrition', field: 'riskMalnutrition', label: 'Have you had any significant weight loss or poor appetite recently?', type: 'boolean', clinicalGuide: 'Malnutrition impairs immune response to respiratory infections', relevantDifferentials: ['community_acquired_pneumonia', 'tuberculosis', 'lung_abscess'], weight: 3 },
    { id: 'rf_smoking', field: 'riskSmoking', label: 'Do you smoke cigarettes?', type: 'boolean', clinicalGuide: 'Smoking damages mucociliary clearance and increases risk of pneumonia, COPD, and lung cancer', relevantDifferentials: ['community_acquired_pneumonia', 'copd_exacerbation', 'lung_cancer', 'bronchiectasis'], weight: 4 },
    { id: 'rf_crowded', field: 'riskCrowded', label: 'Do you live in crowded conditions?', type: 'boolean', clinicalGuide: 'Overcrowding increases transmission of respiratory infections including TB and pneumonia', relevantDifferentials: ['community_acquired_pneumonia', 'tuberculosis'], weight: 2 },
  ],
  tuberculosis: [
    { id: 'rf_tb_contact', field: 'riskTbContact', label: 'Have you been in contact with anyone diagnosed with tuberculosis?', type: 'boolean', clinicalGuide: 'Household TB contact is the single strongest risk factor for TB infection', relevantDifferentials: ['tuberculosis'], weight: 5 },
    { id: 'rf_hiv_tb', field: 'riskHIV', label: 'Do you know your HIV status?', type: 'select', options: ['Negative', 'Positive', 'Unknown', 'Never tested'], clinicalGuide: 'HIV increases TB risk 20-fold. TB is the leading cause of death among HIV patients.', relevantDifferentials: ['tuberculosis', 'community_acquired_pneumonia'], weight: 5 },
    { id: 'rf_diabetes', field: 'riskDiabetes', label: 'Do you have diabetes mellitus?', type: 'boolean', clinicalGuide: 'Diabetes triples the risk of TB and is associated with worse outcomes', relevantDifferentials: ['tuberculosis', 'lung_abscess'], weight: 3 },
    { id: 'rf_alcohol', field: 'riskAlcohol', label: 'Do you consume alcohol regularly?', type: 'boolean', clinicalGuide: 'Alcohol excess impairs immunity and increases TB risk', relevantDifferentials: ['tuberculosis', 'lung_abscess'], weight: 2 },
    { id: 'rf_immunosuppression', field: 'riskImmunosuppression', label: 'Are you on any long-term steroids or immunosuppressive medications?', type: 'boolean', clinicalGuide: 'Immunosuppression increases risk of TB reactivation', relevantDifferentials: ['tuberculosis', 'community_acquired_pneumonia'], weight: 3 },
  ],
  bronchial_asthma: [
    { id: 'rf_atopy', field: 'riskAtopy', label: 'Do you or your family have a history of eczema, hay fever, or allergies?', type: 'boolean', clinicalGuide: 'Atopy is the strongest risk factor for asthma. Ask about personal and family history.', relevantDifferentials: ['bronchial_asthma', 'allergic_rhinitis'], weight: 4 },
    { id: 'rf_asthma_family', field: 'riskAsthmaFamily', label: 'Is there a family history of asthma?', type: 'boolean', clinicalGuide: 'Asthma has strong genetic component. First-degree relative with asthma doubles risk.', relevantDifferentials: ['bronchial_asthma'], weight: 4 },
    { id: 'rf_asthma_triggers', field: 'riskAsthmaTriggers', label: 'Have you noticed specific triggers that cause wheezing or coughing?', type: 'text', clinicalGuide: 'Common triggers: cold air, exercise, dust, pollen, pets, smoke, stress', relevantDifferentials: ['bronchial_asthma', 'allergic_rhinitis'], weight: 3 },
  ],
  bronchiolitis: [
    { id: 'rf_prematurity', field: 'riskPrematurity', label: 'Was the child born prematurely?', type: 'boolean', clinicalGuide: 'Prematurity <37 weeks is a major risk factor for severe RSV bronchiolitis', relevantDifferentials: ['bronchiolitis'], weight: 4 },
    { id: 'rf_chd', field: 'riskCHD', label: 'Does the child have any known heart condition?', type: 'boolean', clinicalGuide: 'Congenital heart disease increases risk of severe bronchiolitis', relevantDifferentials: ['bronchiolitis'], weight: 4 },
    { id: 'rf_age_risk', field: 'riskAgeInfant', label: 'How old is the infant in months?', type: 'text', clinicalGuide: 'Age <3 months is a risk factor for severe disease. Youngest infants have highest risk of apnoea.', relevantDifferentials: ['bronchiolitis'], weight: 3 },
  ],
  whooping_cough_pertussis: [
    { id: 'rf_vaccination', field: 'riskVaccination', label: 'Has the child received their routine vaccinations?', type: 'select', options: ['Fully vaccinated for age', 'Partially vaccinated', 'Not vaccinated', 'Unknown'], clinicalGuide: 'Unvaccinated or incompletely vaccinated children are at highest risk for severe pertussis', relevantDifferentials: ['whooping_cough_pertussis'], weight: 5 },
    { id: 'rf_pertussis_contact', field: 'riskPertussisContact', label: 'Has there been contact with anyone who has a prolonged cough?', type: 'boolean', clinicalGuide: 'Pertussis is highly contagious. Household attack rate is 80% in susceptible contacts.', relevantDifferentials: ['whooping_cough_pertussis'], weight: 4 },
  ],
  gerd: [
    { id: 'rf_heartburn', field: 'riskHeartburn', label: 'Do you experience heartburn or acid regurgitation?', type: 'boolean', clinicalGuide: 'Heartburn and regurgitation are the classic symptoms of GERD. However, cough may be the ONLY symptom.', relevantDifferentials: ['gerd'], weight: 4 },
    { id: 'rf_obesity', field: 'riskObesity', label: 'What is your height and weight? (to calculate BMI)', type: 'text', clinicalGuide: 'Obesity increases intra-abdominal pressure and predisposes to GERD', relevantDifferentials: ['gerd', 'heart_failure'], weight: 2 },
    { id: 'rf_hiatal_hernia', field: 'riskHiatalHernia', label: 'Have you been diagnosed with a hiatus hernia?', type: 'boolean', clinicalGuide: 'Hiatal hernia predisposes to GERD and its respiratory complications', relevantDifferentials: ['gerd'], weight: 3 },
  ],
  copd_exacerbation: [
    { id: 'rf_smoking_copd', field: 'riskSmoking', label: 'What is your smoking history? (pack-years)', type: 'text', clinicalGuide: 'Smoking is the #1 cause of COPD. >20 pack-year history is highly suggestive.', relevantDifferentials: ['copd_exacerbation', 'lung_cancer', 'bronchiectasis'], weight: 5 },
    { id: 'rf_biomass', field: 'riskBiomass', label: 'Do you cook with wood, charcoal, or biomass fuels indoors?', type: 'boolean', clinicalGuide: 'Indoor biomass fuel exposure is a major cause of COPD in developing countries', relevantDifferentials: ['copd_exacerbation'], weight: 4 },
    { id: 'rf_copd_exacerbations', field: 'riskExacerbations', label: 'How many times have you been hospitalised for chest problems in the past year?', type: 'text', clinicalGuide: 'Frequent exacerbations indicate severe COPD and high mortality risk', relevantDifferentials: ['copd_exacerbation', 'bronchiectasis'], weight: 3 },
  ],
  heart_failure: [
    { id: 'rf_cad', field: 'riskCAD', label: 'Do you have a history of coronary artery disease, heart attack, or angina?', type: 'boolean', clinicalGuide: 'CAD is the most common cause of heart failure', relevantDifferentials: ['heart_failure'], weight: 5 },
    { id: 'rf_hypertension', field: 'riskHypertension', label: 'Do you have high blood pressure?', type: 'boolean', clinicalGuide: 'Hypertension is the second most common cause of heart failure (especially HFpEF)', relevantDifferentials: ['heart_failure'], weight: 4 },
    { id: 'rf_hf_medications', field: 'riskHFMedications', label: 'Are you on any water pills (diuretics) or heart medications?', type: 'boolean', clinicalGuide: 'Current treatment for heart failure suggests established diagnosis', relevantDifferentials: ['heart_failure'], weight: 3 },
  ],
  lung_cancer: [
    { id: 'rf_smoking_lung', field: 'riskSmoking', label: 'What is your smoking history? (How many years and how many per day?)', type: 'text', clinicalGuide: 'Smoking causes 85% of lung cancer. Risk increases with pack-years. 30+ pack-years = highest risk.', relevantDifferentials: ['lung_cancer', 'copd_exacerbation', 'bronchiectasis'], weight: 5 },
    { id: 'rf_asbestos', field: 'riskAsbestos', label: 'Have you worked with asbestos, coal, or other industrial dusts?', type: 'boolean', clinicalGuide: 'Asbestos exposure causes lung cancer and mesothelioma. Latency period is 20-40 years.', relevantDifferentials: ['lung_cancer', 'interstitial_lung_disease'], weight: 3 },
    { id: 'rf_lung_ca_family', field: 'riskLungCAFamily', label: 'Is there a family history of lung cancer?', type: 'boolean', clinicalGuide: 'Family history increases risk, especially in non-smokers', relevantDifferentials: ['lung_cancer'], weight: 2 },
  ],
  foreign_body_aspiration: [
    { id: 'rf_choking', field: 'riskChokingEpisode', label: 'Did the cough start suddenly while the child was eating or playing with small objects?', type: 'boolean', clinicalGuide: 'A witnessed choking episode is the most important diagnostic clue for foreign body aspiration', relevantDifferentials: ['foreign_body_aspiration'], weight: 5 },
  ],
  pulmonary_embolism: [
    { id: 'rf_dvt', field: 'riskDVT', label: 'Do you have any leg pain, swelling, or redness?', type: 'boolean', clinicalGuide: 'DVT in the legs is the source of most pulmonary emboli', relevantDifferentials: ['pulmonary_embolism'], weight: 4 },
    { id: 'rf_immobilisation', field: 'riskImmobilisation', label: 'Have you been immobile or had surgery in the past 4 weeks?', type: 'boolean', clinicalGuide: 'Surgery, prolonged bed rest, long-haul flights >4 hours all increase VTE risk', relevantDifferentials: ['pulmonary_embolism'], weight: 4 },
    { id: 'rf_previous_vte', field: 'riskPreviousVTE', label: 'Have you had a previous blood clot (DVT or PE)?', type: 'boolean', clinicalGuide: 'Previous VTE is a strong risk factor for recurrent VTE', relevantDifferentials: ['pulmonary_embolism'], weight: 4 },
    { id: 'rf_malignancy_vte', field: 'riskMalignancy', label: 'Do you have active cancer or have you been treated for cancer recently?', type: 'boolean', clinicalGuide: 'Malignancy increases VTE risk 4-7 fold, especially adenocarcinomas', relevantDifferentials: ['pulmonary_embolism'], weight: 3 },
  ],
};

export function getTargetedRiskFactors(topDifferentials: string[]): TargetedRiskFactor[] {
  const seen = new Set<string>();
  const factors: TargetedRiskFactor[] = [];
  for (const diffId of topDifferentials) {
    const riskFactors = COUGH_RISK_FACTORS_BY_DIFFERENTIAL[diffId] || [];
    for (const rf of riskFactors) {
      if (!seen.has(rf.id)) {
        seen.add(rf.id);
        factors.push(rf);
      }
    }
  }
  return factors;
}
