import type { PhenotypeRule } from './symptom-types';

export interface PhenotypeDefinition extends PhenotypeRule {
  symptomId?: string                // which symptom node this belongs to
}

export const PHENOTYPE_LIBRARY: Record<string, PhenotypeDefinition> = {
  // ─── Fever Phenotypes ────────────────────────────────────────────────
  phen_fever_malaria: {
    id: 'phen_fever_malaria', label: 'Malaria Phenotype',
    description: 'Fever with rigors, headache, joint pains, travel to endemic area',
    symptomId: 'SX000001',
    criteria: [{ factKey: 'fever_malaria_risk', operator: 'eq', value: true }, { factKey: 'fever_rigors', operator: 'eq', value: true }],
    probability: 0.6, suggestsMechanisms: ['plasmodium_parasitemia', 'hemolysis'],
    suggestsDifferentials: ['Malaria', 'Severe malaria'], emergencyWeight: 60,
  },
  phen_fever_respiratory: {
    id: 'phen_fever_respiratory', label: 'Respiratory Infection Phenotype',
    description: 'Fever with cough, sore throat, chest findings',
    symptomId: 'SX000001',
    criteria: [{ factKey: 'fever_cough', operator: 'eq', value: true }],
    probability: 0.4, suggestsMechanisms: ['viral_mucosal_inflammation', 'airway_inflammation', 'alveolar_inflammation'],
    suggestsDifferentials: ['Upper respiratory tract infection', 'Pneumonia', 'Bronchitis', 'Tuberculosis'], emergencyWeight: 40,
  },
  phen_fever_uti: {
    id: 'phen_fever_uti', label: 'Urinary Tract Infection Phenotype',
    description: 'Fever with dysuria, frequency, flank pain',
    symptomId: 'SX000001',
    criteria: [{ factKey: 'fever_dysuria', operator: 'eq', value: true }],
    probability: 0.3, suggestsMechanisms: ['bacterial_uti'],
    suggestsDifferentials: ['Urinary tract infection', 'Pyelonephritis'], emergencyWeight: 30,
  },
  phen_fever_gi: {
    id: 'phen_fever_gi', label: 'Gastrointestinal Infection Phenotype',
    description: 'Fever with diarrhea, vomiting, abdominal pain',
    symptomId: 'SX000001',
    criteria: [{ factKey: 'fever_diarrhea', operator: 'eq', value: true }],
    probability: 0.3, suggestsMechanisms: ['enteric_infection'],
    suggestsDifferentials: ['Gastroenteritis', 'Typhoid fever', 'Food poisoning'], emergencyWeight: 30,
  },
  phen_fever_cns: {
    id: 'phen_fever_cns', label: 'CNS Infection Phenotype',
    description: 'Fever with neck stiffness, headache, confusion, seizure',
    symptomId: 'SX000001',
    criteria: [{ factKey: 'fever_neck_stiffness', operator: 'eq', value: true }],
    probability: 0.5, suggestsMechanisms: ['meningeal_inflammation', 'intracranial_infection'],
    suggestsDifferentials: ['Meningitis', 'Encephalitis', 'Cerebral malaria'], emergencyWeight: 90,
  },
  phen_fever_sepsis: {
    id: 'phen_fever_sepsis', label: 'Sepsis Phenotype',
    description: 'High fever with confusion, rigors, functional impairment',
    symptomId: 'SX000001',
    criteria: [{ factKey: 'fever_severity', operator: 'eq', value: 'Severe' }, { factKey: 'fever_rigors', operator: 'eq', value: true }],
    probability: 0.3, suggestsMechanisms: ['systemic_inflammatory_response', 'bacteremia'],
    suggestsDifferentials: ['Sepsis', 'Septic shock', 'Bacteremia'], emergencyWeight: 85,
  },

  // ─── Headache Phenotypes ─────────────────────────────────────────────
  phen_headache_migraine: {
    id: 'phen_headache_migraine', label: 'Migraine Phenotype',
    description: 'Unilateral throbbing pain with nausea, photophobia, phonophobia, aura',
    symptomId: 'SX000002',
    criteria: [{ factKey: 'headache_quality', operator: 'contains', value: 'Throbbing' }, { factKey: 'headache_nausea', operator: 'eq', value: true }],
    probability: 0.6, suggestsMechanisms: ['vascular_dysregulation', 'trigeminal_nerve_activation', 'cortical_spreading_depression'],
    suggestsDifferentials: ['Migraine with aura', 'Migraine without aura', 'Chronic migraine'], emergencyWeight: 20,
  },
  phen_headache_tension: {
    id: 'phen_headache_tension', label: 'Tension-Type Headache Phenotype',
    description: 'Bilateral pressing/tightening pain, no nausea, no photophobia/phonophobia',
    symptomId: 'SX000002',
    criteria: [{ factKey: 'headache_quality', operator: 'contains', value: 'Pressing' }, { factKey: 'headache_side', operator: 'contains', value: 'both' }],
    probability: 0.5, suggestsMechanisms: ['musculoskeletal_tension'],
    suggestsDifferentials: ['Tension-type headache', 'Chronic tension-type headache'], emergencyWeight: 10,
  },
  phen_headache_cluster: {
    id: 'phen_headache_cluster', label: 'Cluster Headache Phenotype',
    description: 'Unilateral severe pain around eye with autonomic features',
    symptomId: 'SX000002',
    criteria: [{ factKey: 'headache_site', operator: 'contains', value: 'Around eye' }, { factKey: 'headache_quality', operator: 'contains', value: 'Sharp' }],
    probability: 0.4, suggestsMechanisms: ['trigeminal_autonomic_reflex', 'hypothalamic_activation'],
    suggestsDifferentials: ['Cluster headache', 'Trigeminal autonomic cephalalgia'], emergencyWeight: 15,
  },
  phen_headache_cns_infection: {
    id: 'phen_headache_cns_infection', label: 'CNS Infection Phenotype',
    description: 'Headache with neck stiffness, fever, rash, altered consciousness',
    symptomId: 'SX000002',
    criteria: [{ factKey: 'headache_neck_stiffness', operator: 'eq', value: true }, { factKey: 'headache_fever', operator: 'eq', value: true }],
    probability: 0.6, suggestsMechanisms: ['meningeal_inflammation', 'intracranial_infection', 'elevated_intracranial_pressure'],
    suggestsDifferentials: ['Meningitis', 'Encephalitis', 'Cerebral abscess'], emergencyWeight: 90,
  },
  phen_headache_hemorrhage: {
    id: 'phen_headache_hemorrhage', label: 'Subarachnoid Hemorrhage Phenotype',
    description: 'Sudden onset worst headache of life, with neck stiffness',
    symptomId: 'SX000002',
    criteria: [{ factKey: 'headache_worst', operator: 'eq', value: true }, { factKey: 'headache_neck_stiffness', operator: 'eq', value: true }],
    probability: 0.5, suggestsMechanisms: ['subarachnoid_bleeding', 'aneurysmal_rupture', 'elevated_intracranial_pressure'],
    suggestsDifferentials: ['Subarachnoid hemorrhage', 'Intracranial hemorrhage'], emergencyWeight: 95,
  },
  phen_headache_sinus: {
    id: 'phen_headache_sinus', label: 'Sinus Headache Phenotype',
    description: 'Frontal headache with nasal congestion, worse on bending',
    symptomId: 'SX000002',
    criteria: [{ factKey: 'headache_site', operator: 'contains', value: 'Forehead' }, { factKey: 'headache_nasal', operator: 'eq', value: true }],
    probability: 0.3, suggestsMechanisms: ['sinus_mucosal_inflammation'],
    suggestsDifferentials: ['Acute sinusitis', 'Allergic rhinitis'], emergencyWeight: 10,
  },

  // ─── Cough Phenotypes ────────────────────────────────────────────────
  phen_cough_upper_respiratory: {
    id: 'phen_cough_upper_respiratory', label: 'Upper Respiratory Infection Phenotype',
    description: 'Acute cough with nasal congestion, fever, sore throat',
    symptomId: 'SX000005',
    criteria: [{ factKey: 'cough_type', operator: 'contains', value: 'Dry' }, { factKey: 'cough_duration', operator: 'contains', value: 'acute' }],
    probability: 0.5, suggestsMechanisms: ['viral_mucosal_inflammation', 'airway_inflammation'],
    suggestsDifferentials: ['Common cold', 'Acute pharyngitis', 'Viral upper respiratory infection'], emergencyWeight: 15,
  },
  phen_cough_lower_respiratory: {
    id: 'phen_cough_lower_respiratory', label: 'Lower Respiratory Infection Phenotype',
    description: 'Productive cough with fever, dyspnea, chest pain, sputum',
    symptomId: 'SX000005',
    criteria: [{ factKey: 'cough_productive', operator: 'eq', value: true }, { factKey: 'cough_fever', operator: 'eq', value: true }],
    probability: 0.5, suggestsMechanisms: ['alveolar_inflammation', 'parenchymal_consolidation', 'bronchial_mucosal_infection'],
    suggestsDifferentials: ['Pneumonia', 'Bronchitis', 'Bronchiectasis'], emergencyWeight: 60,
  },
  phen_cough_asthma: {
    id: 'phen_cough_asthma', label: 'Asthma Phenotype',
    description: 'Recurrent cough with wheeze, worse at night/early morning, with triggers',
    symptomId: 'SX000005',
    criteria: [{ factKey: 'cough_wheeze', operator: 'eq', value: true }, { factKey: 'cough_timing', operator: 'contains', value: 'night' }],
    probability: 0.5, suggestsMechanisms: ['bronchial_hyperresponsiveness', 'airway_inflammation'],
    suggestsDifferentials: ['Asthma', 'Cough variant asthma'], emergencyWeight: 40,
  },
  phen_cough_pertussis: {
    id: 'phen_cough_pertussis', label: 'Pertussis Phenotype',
    description: 'Paroxysmal cough with whoop, post-tussive vomiting, no fever',
    symptomId: 'SX000005',
    criteria: [{ factKey: 'cough_whoop', operator: 'eq', value: true }],
    probability: 0.6, suggestsMechanisms: ['bordetella_infection'],
    suggestsDifferentials: ['Pertussis (whooping cough)', 'Parainfluenza infection'], emergencyWeight: 40,
  },
  phen_cough_tb: {
    id: 'phen_cough_tb', label: 'Tuberculosis Phenotype',
    description: 'Chronic cough with weight loss, night sweats, hemoptysis, TB contact',
    symptomId: 'SX000005',
    criteria: [{ factKey: 'cough_duration', operator: 'contains', value: 'chronic' }, { factKey: 'cough_tb_contact', operator: 'eq', value: true }],
    probability: 0.5, suggestsMechanisms: ['mycobacterial_infection', 'granulomatous_inflammation', 'parenchymal_destruction'],
    suggestsDifferentials: ['Pulmonary tuberculosis', 'Extrapulmonary tuberculosis'], emergencyWeight: 70,
  },
  phen_cough_croup: {
    id: 'phen_cough_croup', label: 'Croup Phenotype',
    description: 'Barking cough with stridor, worse at night, in young children',
    symptomId: 'SX000005',
    criteria: [{ factKey: 'cough_type', operator: 'contains', value: 'Barking' }, { factKey: 'cough_stridor', operator: 'eq', value: true }],
    probability: 0.6, suggestsMechanisms: ['laryngeal_inflammation', 'airway_edema'],
    suggestsDifferentials: ['Croup (laryngotracheobronchitis)', 'Epiglottitis', 'Bacterial tracheitis'], emergencyWeight: 70,
  },
};

export function getPhenotype(id: string): PhenotypeDefinition | undefined {
  return PHENOTYPE_LIBRARY[id];
}

export function getPhenotypesBySymptom(symptomId: string): PhenotypeDefinition[] {
  return Object.values(PHENOTYPE_LIBRARY).filter(p => p.symptomId === symptomId);
}

export function getPhenotypesByMechanism(mechanismId: string): PhenotypeDefinition[] {
  return Object.values(PHENOTYPE_LIBRARY).filter(p => p.suggestsMechanisms.includes(mechanismId));
}
