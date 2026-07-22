export interface MechanismDefinition {
  id: string
  label: string
  category: MechanismCategory
  bodySystem: string
  description: string
}

export type MechanismCategory =
  | 'infectious' | 'inflammatory' | 'neoplastic' | 'degenerative'
  | 'vascular' | 'traumatic' | 'autoimmune' | 'metabolic'
  | 'congenital' | 'functional' | 'obstructive' | 'ischemic'
  | 'hemorrhagic' | 'toxic' | 'nutritional' | 'idiopathic'
  | 'immunological' | 'endocrine' | 'mechanical' | 'allergic'
  | 'thrombotic' | 'embolic' | 'infiltrative' | 'psychogenic';

export const MECHANISM_LIBRARY: Record<string, MechanismDefinition> = {
  // ─── Infectious ──────────────────────────────────────────────────────
  plasmodium_parasitemia: {
    id: 'plasmodium_parasitemia', label: 'Plasmodium Parasitemia',
    category: 'infectious', bodySystem: 'General', description: 'Presence of Plasmodium species in blood',
  },
  hemolysis: {
    id: 'hemolysis', label: 'Hemolysis',
    category: 'infectious', bodySystem: 'Hematological', description: 'RBC destruction due to infection or immune',
  },
  viral_mucosal_inflammation: {
    id: 'viral_mucosal_inflammation', label: 'Viral Mucosal Inflammation',
    category: 'infectious', bodySystem: 'Respiratory', description: 'Viral infection causing mucosal inflammation',
  },
  alveolar_inflammation: {
    id: 'alveolar_inflammation', label: 'Alveolar Inflammation',
    category: 'infectious', bodySystem: 'Respiratory', description: 'Alveolar infection and inflammatory response',
  },
  parenchymal_consolidation: {
    id: 'parenchymal_consolidation', label: 'Parenchymal Consolidation',
    category: 'infectious', bodySystem: 'Respiratory', description: 'Lung tissue consolidation from infection',
  },
  bronchial_mucosal_infection: {
    id: 'bronchial_mucosal_infection', label: 'Bronchial Mucosal Infection',
    category: 'infectious', bodySystem: 'Respiratory', description: 'Infection of bronchial mucosa',
  },
  mycobacterial_infection: {
    id: 'mycobacterial_infection', label: 'Mycobacterial Infection',
    category: 'infectious', bodySystem: 'Respiratory', description: 'Infection with Mycobacterium species',
  },
  meningeal_inflammation: {
    id: 'meningeal_inflammation', label: 'Meningeal Inflammation',
    category: 'infectious', bodySystem: 'Nervous', description: 'Inflammation of meninges from infection',
  },
  intracranial_infection: {
    id: 'intracranial_infection', label: 'Intracranial Infection',
    category: 'infectious', bodySystem: 'Nervous', description: 'Infection within cranial cavity',
  },
  bacterial_uti: {
    id: 'bacterial_uti', label: 'Bacterial Urinary Tract Infection',
    category: 'infectious', bodySystem: 'Renal', description: 'Bacterial infection of urinary tract',
  },
  enteric_infection: {
    id: 'enteric_infection', label: 'Enteric Infection',
    category: 'infectious', bodySystem: 'GI', description: 'Gastrointestinal infection',
  },
  bordetella_infection: {
    id: 'bordetella_infection', label: 'Bordetella Infection',
    category: 'infectious', bodySystem: 'Respiratory', description: 'Bordetella pertussis respiratory infection',
  },
  systemic_inflammatory_response: {
    id: 'systemic_inflammatory_response', label: 'Systemic Inflammatory Response',
    category: 'infectious', bodySystem: 'General', description: 'Systemic response to infection (SIRS)',
  },
  bacteremia: {
    id: 'bacteremia', label: 'Bacteremia',
    category: 'infectious', bodySystem: 'General', description: 'Bacteria in bloodstream',
  },

  // ─── Inflammatory ────────────────────────────────────────────────────
  airway_inflammation: {
    id: 'airway_inflammation', label: 'Airway Inflammation',
    category: 'inflammatory', bodySystem: 'Respiratory', description: 'Inflammation of airways',
  },
  bronchial_hyperresponsiveness: {
    id: 'bronchial_hyperresponsiveness', label: 'Bronchial Hyperresponsiveness',
    category: 'inflammatory', bodySystem: 'Respiratory', description: 'Excessive airway narrowing in response to triggers',
  },
  sinus_mucosal_inflammation: {
    id: 'sinus_mucosal_inflammation', label: 'Sinus Mucosal Inflammation',
    category: 'inflammatory', bodySystem: 'HEENT', description: 'Inflammation of sinus mucosa',
  },
  laryngeal_inflammation: {
    id: 'laryngeal_inflammation', label: 'Laryngeal and Subglottic Inflammation',
    category: 'inflammatory', bodySystem: 'Respiratory', description: 'Inflammation of larynx and subglottic region',
  },
  airway_edema: {
    id: 'airway_edema', label: 'Upper Airway Edema',
    category: 'inflammatory', bodySystem: 'Respiratory', description: 'Swelling of upper airway structures',
  },
  granulomatous_inflammation: {
    id: 'granulomatous_inflammation', label: 'Granulomatous Inflammation',
    category: 'inflammatory', bodySystem: 'General', description: 'Granuloma formation from chronic inflammation',
  },

  // ─── Vascular ────────────────────────────────────────────────────────
  vascular_dysregulation: {
    id: 'vascular_dysregulation', label: 'Vascular Dysregulation',
    category: 'vascular', bodySystem: 'Nervous', description: 'Abnormal regulation of cranial blood flow',
  },
  subarachnoid_bleeding: {
    id: 'subarachnoid_bleeding', label: 'Subarachnoid Bleeding',
    category: 'hemorrhagic', bodySystem: 'Nervous', description: 'Bleeding into subarachnoid space',
  },
  aneurysmal_rupture: {
    id: 'aneurysmal_rupture', label: 'Aneurysmal Rupture',
    category: 'hemorrhagic', bodySystem: 'Nervous', description: 'Rupture of cerebral aneurysm',
  },
  elevated_intracranial_pressure: {
    id: 'elevated_intracranial_pressure', label: 'Elevated Intracranial Pressure',
    category: 'obstructive', bodySystem: 'Nervous', description: 'Increased ICP from mass or edema',
  },

  // ─── Neurological ────────────────────────────────────────────────────
  trigeminal_nerve_activation: {
    id: 'trigeminal_nerve_activation', label: 'Trigeminal Nerve Activation',
    category: 'functional', bodySystem: 'Nervous', description: 'Activation of trigeminovascular system',
  },
  cortical_spreading_depression: {
    id: 'cortical_spreading_depression', label: 'Cortical Spreading Depression',
    category: 'functional', bodySystem: 'Nervous', description: 'Wave of neuronal depolarization in cortex',
  },
  trigeminal_autonomic_reflex: {
    id: 'trigeminal_autonomic_reflex', label: 'Trigeminal Autonomic Reflex Activation',
    category: 'functional', bodySystem: 'Nervous', description: 'Reflex activation of cranial autonomic pathways',
  },
  hypothalamic_activation: {
    id: 'hypothalamic_activation', label: 'Hypothalamic Activation',
    category: 'functional', bodySystem: 'Nervous', description: 'Hypothalamic involvement in headache disorders',
  },

  // ─── Musculoskeletal ─────────────────────────────────────────────────
  musculoskeletal_tension: {
    id: 'musculoskeletal_tension', label: 'Musculoskeletal Tension',
    category: 'functional', bodySystem: 'MSK', description: 'Pericranial muscle tension and tenderness',
  },

  // ─── Neoplastic ──────────────────────────────────────────────────────
  parenchymal_destruction: {
    id: 'parenchymal_destruction', label: 'Parenchymal Destruction',
    category: 'degenerative', bodySystem: 'General', description: 'Destruction of functional tissue',
  },

  upper_airway_irritation: {
    id: 'upper_airway_irritation', label: 'Upper Airway Irritation',
    category: 'inflammatory', bodySystem: 'Respiratory', description: 'Irritation of upper airway mucosa from environmental or infectious causes',
  },
  smooth_muscle_constriction: {
    id: 'smooth_muscle_constriction', label: 'Smooth Muscle Constriction',
    category: 'obstructive', bodySystem: 'Respiratory', description: 'Bronchial smooth muscle contraction causing airway narrowing',
  },
  respiratory_mucosal_inflammation: {
    id: 'respiratory_mucosal_inflammation', label: 'Respiratory Mucosal Inflammation',
    category: 'inflammatory', bodySystem: 'Respiratory', description: 'Diffuse inflammation of respiratory tract mucosa',
  },
  parenchymal_infection: {
    id: 'parenchymal_infection', label: 'Parenchymal Infection',
    category: 'infectious', bodySystem: 'Respiratory', description: 'Infection of lung parenchyma',
  },
  left_ventricular_failure: {
    id: 'left_ventricular_failure', label: 'Left Ventricular Failure',
    category: 'mechanical', bodySystem: 'Cardiovascular', description: 'Decreased cardiac output due to LV dysfunction',
  },
  increased_pulmonary_capillary_pressure: {
    id: 'increased_pulmonary_capillary_pressure', label: 'Increased Pulmonary Capillary Pressure',
    category: 'mechanical', bodySystem: 'Cardiovascular', description: 'Elevated hydrostatic pressure in pulmonary capillaries',
  },
  pulmonary_artery_occlusion: {
    id: 'pulmonary_artery_occlusion', label: 'Pulmonary Artery Occlusion',
    category: 'embolic', bodySystem: 'Cardiovascular', description: 'Occlusion of pulmonary artery by thrombus or embolus',
  },
  ventilation_perfusion_mismatch: {
    id: 'ventilation_perfusion_mismatch', label: 'Ventilation-Perfusion Mismatch',
    category: 'mechanical', bodySystem: 'Respiratory', description: 'Regional imbalance between lung ventilation and blood flow',
  },
  airway_obstruction: {
    id: 'airway_obstruction', label: 'Airway Obstruction',
    category: 'obstructive', bodySystem: 'Respiratory', description: 'Narrowing or blockage of airways',
  },
  mucus_hypersecretion: {
    id: 'mucus_hypersecretion', label: 'Mucus Hypersecretion',
    category: 'inflammatory', bodySystem: 'Respiratory', description: 'Excessive mucus production from airway inflammation',
  },
  intrapleural_air: {
    id: 'intrapleural_air', label: 'Intrapleural Air',
    category: 'mechanical', bodySystem: 'Respiratory', description: 'Air in pleural space causing lung compression',
  },
  mucous_plugging: {
    id: 'mucous_plugging', label: 'Mucous Plugging',
    category: 'obstructive', bodySystem: 'Respiratory', description: 'Airway obstruction by thick mucus',
  },

  // ─── Metabolic ───────────────────────────────────────────────────────
  hemolytic_anemia: {
    id: 'hemolytic_anemia', label: 'Hemolytic Anemia',
    category: 'metabolic', bodySystem: 'Hematological', description: 'Accelerated RBC destruction',
  },
};

export function getMechanism(id: string): MechanismDefinition | undefined {
  return MECHANISM_LIBRARY[id];
}

export function getMechanismsByCategory(category: MechanismCategory): MechanismDefinition[] {
  return Object.values(MECHANISM_LIBRARY).filter(m => m.category === category);
}

export function getMechanismsByBodySystem(system: string): MechanismDefinition[] {
  return Object.values(MECHANISM_LIBRARY).filter(m => m.bodySystem === system);
}
