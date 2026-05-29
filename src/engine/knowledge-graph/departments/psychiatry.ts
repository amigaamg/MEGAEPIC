import type { DepartmentDefinition } from './index';

export const psychiatry: DepartmentDefinition = {
  id: 'PSYCH',
  name: 'Psychiatry',
  shortName: 'PSYCH',
  description: 'Diagnosis, treatment and prevention of mental, emotional and behavioural disorders across the lifespan.',
  icon: '💬',
  color: '#a78bfa',
  sections: [
    {
      id: 'mood-disorders',
      name: 'Mood Disorders',
      description: 'Depressive and bipolar spectrum disorders',
      diseaseCategories: ['Major depressive disorder', 'Persistent depressive disorder', 'Bipolar I disorder', 'Bipolar II disorder', 'Cyclothymia', 'Seasonal affective disorder', 'Postpartum depression'],
    },
    {
      id: 'anxiety',
      name: 'Anxiety & Stress-Related Disorders',
      description: 'Anxiety disorders, OCD, trauma and stressor-related conditions',
      diseaseCategories: ['Generalised anxiety disorder', 'Panic disorder', 'Phobias', 'Social anxiety disorder', 'OCD', 'PTSD', 'Acute stress disorder', 'Adjustment disorder'],
    },
    {
      id: 'psychotic',
      name: 'Psychotic Disorders',
      description: 'Schizophrenia spectrum and other psychotic disorders',
      diseaseCategories: ['Schizophrenia', 'Schizoaffective disorder', 'Delusional disorder', 'Brief psychotic disorder', 'Schizophreniform disorder', 'Substance-induced psychotic disorder'],
    },
    {
      id: 'addiction',
      name: 'Addiction Psychiatry',
      description: 'Substance use disorders and behavioural addictions',
      diseaseCategories: ['Alcohol use disorder', 'Opioid use disorder', 'Cocaine/stimulant use', 'Cannabis use disorder', 'Sedative/hypnotic use', 'Gambling disorder', 'Nicotine dependence'],
    },
    {
      id: 'child-adolescent',
      name: 'Child & Adolescent Psychiatry',
      description: 'Psychiatric disorders in children and adolescents',
      diseaseCategories: ['ADHD', 'Autism spectrum disorder', 'Conduct disorder', 'Oppositional defiant disorder', 'Tic disorders', 'Selective mutism', 'Childhood anxiety', 'School refusal'],
    },
    {
      id: 'perinatal',
      name: 'Perinatal Psychiatry',
      description: 'Mental health during pregnancy and the postpartum period',
      diseaseCategories: ['Prenatal depression', 'Postpartum depression', 'Postpartum psychosis', 'Perinatal anxiety', 'Tokophobia'],
    },
    {
      id: 'geriatric-psych',
      name: 'Geriatric Psychiatry',
      description: 'Mental health conditions in older adults',
      diseaseCategories: ['Late-life depression', 'Dementia', 'Delirium', 'Behavioural psychological symptoms of dementia', 'Late-life psychosis'],
    },
  ],
  commonSymptoms: [
    'depressed_mood', 'elated_mood', 'irritability', 'anxiety',
    'panic_attacks', 'worry', 'rumination', 'pressured_speech',
    'flight_of_ideas', 'grandiosity', 'hallucinations', 'delusions',
    'paranoia', 'disorganised_speech', 'catatonia', 'social_withdrawal',
    'apathy', 'anhedonia', 'fatigue', 'insomnia', 'hypersomnia',
    'decreased_sleep', 'appetite_change', 'weight_change',
    'poor_concentration', 'indecisiveness', 'agitation',
    'psychomotor_retardation', 'suicidal_ideation', 'self_harm',
    'obsessions', 'compulsions', 'flashbacks', 'hypervigilance',
    'avoidance', 'dissociation', 'memory_impairment', 'confusion',
  ],
  commonInvestigations: [
    'MSE (Mental State Examination)', 'PHQ-9', 'GAD-7', 'Mood Disorder Questionnaire',
    'Young Mania Rating Scale', 'Columbia Suicide Severity Rating Scale',
    'Thyroid function', 'Vitamin B12', 'Folate', 'Iron studies',
    'FBC', 'U&E', 'LFT', 'Blood glucose', 'Drug toxicology screen',
    'Alcohol level', 'ECT workup', 'CT head', 'MRI brain', 'EEG',
    'HIV test', 'Syphilis serology', 'Autoimmune screen',
  ],
};
