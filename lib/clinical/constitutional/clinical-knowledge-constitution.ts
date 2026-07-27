// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK VI–XIII
// CLINICAL KNOWLEDGE INTERPRETATION LAYER (Layer 2)
// Contains NO patient data. Contains ALL medical knowledge.
// ═══════════════════════════════════════════════════════════════
// Book VI: Clinical Knowledge Constitution — Disease Objects
// Book VII: Knowledge Graph — everything is nodes
// Book VIII: Disease Graph — one disease, all knowledge
// Book IX: Reasoning Engine — operates on graphs, not medicine
// Book X: Activation Rules — evidence activates, not complaints
// Book XI: Investigation Objects — each investigation is knowledge
// Book XII: Treatment Objects — each drug is a knowledge object
// Book XIII: Reasoning Graph — full chain facts→diagnosis→outcome
// ═══════════════════════════════════════════════════════════════
// FORBIDDEN SHORTCUT: Complaint→Disease
// Always: Facts→Mechanisms→Phenotypes→Diseases→Investigations→Diagnosis
// ═══════════════════════════════════════════════════════════════

import type { MechanismCategoryUniversal, ClinicalConfidence } from './hpi-constitution';

// ─────────────────────────────────────────────────────────────────
// BOOK VI: DISEASE OBJECT — every disease is one constitutional object
// ─────────────────────────────────────────────────────────────────

export type EmergencyLevel = 'red' | 'orange' | 'yellow' | 'green';
export type EvidenceLevel = 'gold_standard' | 'guideline' | 'expert_opinion' | 'case_series' | 'mechanistic_reasoning';
export type DiseaseSpecialty =
  | 'internal_medicine' | 'pediatrics' | 'surgery' | 'obstetrics' | 'gynecology'
  | 'cardiology' | 'pulmonology' | 'neurology' | 'gastroenterology' | 'nephrology'
  | 'endocrinology' | 'rheumatology' | 'infectious_disease' | 'hematology' | 'oncology'
  | 'psychiatry' | 'dermatology' | 'ophthalmology' | 'ent' | 'orthopedics'
  | 'emergency_medicine' | 'family_medicine' | 'neonatology' | 'critical_care';

export interface DiseaseEtiology {
  agent: string;
  type: 'infectious' | 'genetic' | 'environmental' | 'idiopathic' | 'iatrogenic' | 'autoimmune' | 'degenerative' | 'traumatic' | 'neoplastic' | 'congenital';
  frequency: 'common' | 'uncommon' | 'rare';
  notes: string;
}

export interface DiseaseRiskFactor {
  factor: string;
  weight: number;
  type: 'modifiable' | 'non_modifiable' | 'environmental' | 'genetic';
}

export interface DiseasePathophysiologyStep {
  step: number;
  event: string;
  mechanism: MechanismCategoryUniversal;
  detail: string;
}

export interface DiseasePhenotype {
  name: string;
  features: string[];
  prevalence: number;
  typicalPresentation: string;
}

export interface DiseaseSymptom {
  symptomId: string;
  frequency: 'always' | 'common' | 'uncommon' | 'rare' | 'never';
  typicalCharacter: string;
  typicalTimeline: string;
  discriminatingValue: number;
}

export interface DiseaseSign {
  signId: string;
  frequency: 'always' | 'common' | 'uncommon' | 'rare';
  description: string;
}

export interface DiseaseInvestigation {
  investigationId: string;
  purpose: string;
  timing: 'initial' | 'confirmatory' | 'monitoring' | 'follow_up';
  requiredForDiagnosis: boolean;
  expectedResult: string;
  sensitivity: number;
  specificity: number;
}

export interface DiseaseDiagnosisRule {
  ruleId: string;
  description: string;
  criteria: string[];
  requiredCount: number;
  logic: 'and' | 'or' | 'weighted_score';
  threshold: number;
}

export interface DiseaseTreatment {
  treatmentId: string;
  type: 'medication' | 'procedure' | 'surgery' | 'therapy' | 'supportive' | 'monitoring';
  firstLine: boolean;
  evidenceLevel: EvidenceLevel;
  notes: string;
}

export interface DiseaseComplication {
  complication: string;
  frequency: 'common' | 'uncommon' | 'rare';
  diseaseId: string | null;
  management: string;
}

export interface DiseaseMonitoring {
  parameter: string;
  frequency: string;
  target: string;
  actionIfAbnormal: string;
}

export interface DiseaseDisposition {
  admissionRequired: boolean;
  icuRequired: boolean;
  specialtyReferral: string | null;
  followUpTiming: string;
  dischargeCriteria: string[];
}

export interface DiseaseObject {
  id: string;
  name: string;
  snomed: string;
  icd10: string;
  synonyms: string[];
  specialties: DiseaseSpecialty[];
  ageGroups: string[];
  emergencyLevel: EmergencyLevel;
  bodySystems: string[];
  mechanisms: MechanismCategoryUniversal[];
  phenotypes: DiseasePhenotype[];
  etiologies: DiseaseEtiology[];
  riskFactors: DiseaseRiskFactor[];
  predispositions: string[];
  naturalHistory: string;
  pathophysiology: DiseasePathophysiologyStep[];
  complications: DiseaseComplication[];
  symptoms: DiseaseSymptom[];
  signs: DiseaseSign[];
  investigations: DiseaseInvestigation[];
  diagnosisRules: DiseaseDiagnosisRule[];
  treatments: DiseaseTreatment[];
  monitoring: DiseaseMonitoring[];
  disposition: DiseaseDisposition;
  patientEducation: string[];
  references: string[];
  evidenceLevel: EvidenceLevel;
  guidelines: string[];
  differentials: string[];
}

// ─────────────────────────────────────────────────────────────────
// BOOK VII: KNOWLEDGE GRAPH — everything is nodes
// ─────────────────────────────────────────────────────────────────

export type KnowledgeNodeType =
  | 'symptom' | 'sign' | 'mechanism' | 'phenotype' | 'disease'
  | 'investigation' | 'investigation_result' | 'treatment'
  | 'risk_factor' | 'etiology' | 'complication' | 'anatomy'
  | 'patient' | 'encounter' | 'fact' | 'diagnosis' | 'guideline';

export type KnowledgeRelationshipType =
  | 'supports' | 'contradicts' | 'causes' | 'associated'
  | 'requires' | 'confirms' | 'excludes' | 'treats'
  | 'complicates' | 'predisposes' | 'manifests_as'
  | 'diagnosed_by' | 'managed_by' | 'monitored_by'
  | 'differentiate' | 'follows' | 'precedes';

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  metadata: Record<string, unknown>;
  weight: number;
}

export interface KnowledgeRelationship {
  sourceId: string;
  targetId: string;
  type: KnowledgeRelationshipType;
  strength: number;
  evidence: EvidenceLevel;
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  relationships: KnowledgeRelationship[];
  version: string;
}

// ─────────────────────────────────────────────────────────────────
// BOOK IX: REASONING ENGINE — operates on graphs, not medicine
// ─────────────────────────────────────────────────────────────────

export interface ReasoningEvidence {
  factId: string;
  attribute: string;
  value: unknown;
  supportsDiseaseIds: string[];
  contradictsDiseaseIds: string[];
  weight: number;
}

export interface DiseaseActivation {
  disease: DiseaseObject;
  activationScore: number;
  evidenceMatch: ReasoningEvidence[];
  missingEvidence: string[];
  contradictingEvidence: ReasoningEvidence[];
  mechanismMatch: MechanismCategoryUniversal[];
  phenotypeMatch: string[];
  confidence: ClinicalConfidence;
  investigationReadiness: InvestigationReadiness;
}

export interface InvestigationReadiness {
  ready: boolean;
  thresholdMet: number;
  requiredThreshold: number;
  suggestedInvestigations: string[];
  requiredInvestigations: string[];
}

export interface DifferentialRanking {
  diseases: DiseaseActivation[];
  topDisease: DiseaseActivation | null;
  confidenceGap: number;
  requiresMoreEvidence: boolean;
  nextBestInvestigation: string | null;
}

// ─────────────────────────────────────────────────────────────────
// BOOK X: ACTIVATION RULES — evidence activates, not complaints
// ─────────────────────────────────────────────────────────────────

export interface ActivationThreshold {
  domain: 'mechanism' | 'phenotype' | 'disease' | 'investigation';
  minimumEvidence: number;
  minimumProbability: number;
  requiredMechanisms: MechanismCategoryUniversal[];
  requiredPhenotypes: string[];
}

export const ACTIVATION_THRESHOLDS: Record<string, ActivationThreshold> = {
  mechanism: { domain: 'mechanism', minimumEvidence: 1, minimumProbability: 0.15, requiredMechanisms: [], requiredPhenotypes: [] },
  phenotype: { domain: 'phenotype', minimumEvidence: 2, minimumProbability: 0.3, requiredMechanisms: [], requiredPhenotypes: [] },
  disease: { domain: 'disease', minimumEvidence: 3, minimumProbability: 0.2, requiredMechanisms: [], requiredPhenotypes: [] },
  investigation_critical: { domain: 'investigation', minimumEvidence: 1, minimumProbability: 0.15, requiredMechanisms: [], requiredPhenotypes: [] },
  investigation_standard: { domain: 'investigation', minimumEvidence: 2, minimumProbability: 0.3, requiredMechanisms: [], requiredPhenotypes: [] },
  investigation_specialized: { domain: 'investigation', minimumEvidence: 3, minimumProbability: 0.5, requiredMechanisms: [], requiredPhenotypes: [] },
};

// ─────────────────────────────────────────────────────────────────
// BOOK XI: INVESTIGATION OBJECTS — each investigation is knowledge
// ─────────────────────────────────────────────────────────────────

export type InvestigationCategory =
  | 'lab_blood' | 'lab_urine' | 'lab_stool' | 'lab_csf' | 'lab_other'
  | 'imaging_xray' | 'imaging_ultrasound' | 'imaging_ct' | 'imaging_mri'
  | 'imaging_nuclear' | 'imaging_other'
  | 'ecg' | 'echo' | 'endoscopy' | 'biopsy'
  | 'function_test' | 'microbiology' | 'genetics'
  | 'point_of_care' | 'monitoring';

export interface InvestigationObject {
  id: string;
  name: string;
  category: InvestigationCategory;
  purpose: string;
  mechanismSupported: MechanismCategoryUniversal[];
  diseasesSupported: string[];
  diseasesExcluded: string[];
  contraindications: string[];
  sensitivity: number;
  specificity: number;
  positivePredictiveValue: number;
  negativePredictiveValue: number;
  interpretationRules: InterpretationRule[];
  falsePositives: string[];
  falseNegatives: string[];
  cost: 'low' | 'medium' | 'high';
  urgency: 'stat' | 'urgent' | 'routine' | 'elective';
  preparationRequired: string[];
  turnaroundTime: string;
  requiresSpecialist: boolean;
  activationThreshold: number;
  ageRestrictions: string[];
  pregnancySafety: string;
}

export interface InterpretationRule {
  finding: string;
  supportsDiseaseIds: string[];
  contradictsDiseaseIds: string[];
  weight: number;
  notes: string;
}

// ─────────────────────────────────────────────────────────────────
// BOOK XII: TREATMENT OBJECTS — each drug is a knowledge object
// ─────────────────────────────────────────────────────────────────

export type DrugCategory =
  | 'antibiotic' | 'antiviral' | 'antifungal' | 'antiparasitic'
  | 'antihypertensive' | 'diuretic' | 'anticoagulant' | 'antiplatelet'
  | 'statin' | 'antiarrhythmic' | 'inotrope'
  | 'bronchodilator' | 'corticosteroid' | 'immunosuppressant'
  | 'analgesic' | 'antipyretic' | 'nsaid'
  | 'antiepileptic' | 'antidepressant' | 'antipsychotic' | 'anxiolytic'
  | 'antidiabetic' | 'thyroid_hormone' | 'contraceptive'
  | 'iv_fluid' | 'electrolyte' | 'nutrition'
  | 'chemotherapy' | 'biologic' | 'vaccine'
  | 'antidote' | 'oxygen' | 'other';

export interface TreatmentObject {
  id: string;
  name: string;
  genericName: string;
  category: DrugCategory;
  mechanisms: MechanismCategoryUniversal[];
  diseasesManaged: string[];
  contraindications: string[];
  interactions: string[];
  sideEffects: string[];
  pregnancyCategory: string;
  renalAdjustment: string;
  hepaticAdjustment: string;
  pediatricDosing: string;
  adultDosing: string;
  monitoringRequired: string[];
  evidenceLevel: EvidenceLevel;
  firstLine: boolean;
  route: ('oral' | 'iv' | 'im' | 'subcutaneous' | 'topical' | 'inhaled' | 'rectal' | 'intrathecal')[];
  duration: string;
  notes: string;
}

// ─────────────────────────────────────────────────────────────────
// BOOK XIII: REASONING GRAPH — full chain
// ─────────────────────────────────────────────────────────────────

export interface ReasoningChainStep {
  step: number;
  layer: 'fact' | 'mechanism' | 'phenotype' | 'disease' | 'investigation' | 'diagnosis' | 'treatment' | 'monitoring' | 'outcome';
  nodeIds: string[];
  evidenceIds: string[];
  confidence: number;
  timestamp: string;
}

export interface ReasoningChain {
  patientId: string;
  encounterId: string;
  steps: ReasoningChainStep[];
  active: boolean;
  startedAt: string;
  completedAt: string | null;
  finalDiagnosis: string | null;
}

// ═══════════════════════════════════════════════════════════════
// CONSTITUTIONAL PRINCIPLES
// ═══════════════════════════════════════════════════════════════

export const KNOWLEDGE_CONSTITUTION = {
  layerSeparatedFromPatientData: true,
  diseaseObjectsSelfContained: true,
  symptomsReferenceDiseasesNeverContainKnowledge: true,
  shortcutComplaintToDiseaseForbidden: true,
  reasoningChainMustPassThroughAllLayers: true,
  factsMechanismsPhenotypesDiseases: true,
  evidenceActivatesNotComplaints: true,
  investigationsNeverExistBeforeReasoning: true,
  investigationsVisibleOnlyWhenConfidencePassesThresholds: true,
  treatmentsReferencedNotEmbedded: true,
  diseasesCompeteByExplainingEvidence: true,
  knowledgeGraphIsSourceOfTruth: true,
} as const;

export const REASONING_CHAIN_ORDER: ReasoningChainStep['layer'][] = [
  'fact', 'mechanism', 'phenotype', 'disease', 'investigation',
  'diagnosis', 'treatment', 'monitoring', 'outcome',
];

// ═══════════════════════════════════════════════════════════════
// KNOWN SYMPTOM-TO-DISEASE MAPPINGS (references only, no knowledge)
// Symptoms point to diseases; diseases contain the knowledge.
// ═══════════════════════════════════════════════════════════════

export const SYMPTOM_DISEASE_REFERENCES: Record<string, string[]> = {
  cough: ['pneumonia', 'pulmonary_tuberculosis', 'asthma', 'copd', 'bronchiectasis', 'lung_cancer', 'gerd', 'heart_failure', 'pulmonary_embolism'],
  fever: ['pneumonia', 'pulmonary_tuberculosis', 'urinary_tract_infection', 'malaria', 'typhoid', 'meningitis', 'sepsis', 'cellulitis', 'viral_infection', 'hiv_seroconversion'],
  abdominal_pain: ['acute_appendicitis', 'acute_cholecystitis', 'pancreatitis', 'bowel_obstruction', 'peptic_ulcer_disease', 'gastroenteritis', 'diverticulitis', 'ectopic_pregnancy', 'ovarian_torsion', 'renal_colic'],
  headache: ['migraine', 'tension_headache', 'meningitis', 'subarachnoid_hemorrhage', 'sinusitis', 'cluster_headache', 'hypertensive_emergency', 'cerebral_venous_sinus_thrombosis'],
  chest_pain: ['acute_coronary_syndrome', 'pulmonary_embolism', 'pneumothorax', 'pericarditis', 'costochondritis', 'gerd', 'panic_attack', 'aortic_dissection'],
  dyspnea: ['asthma', 'copd_exacerbation', 'pneumonia', 'pulmonary_embolism', 'heart_failure', 'pneumothorax', 'anaphylaxis', 'foreign_body_aspiration', 'covid_19'],
  vomiting: ['gastroenteritis', 'bowel_obstruction', 'pancreatitis', 'diabetic_ketoacidosis', 'meningitis', 'increased_intracranial_pressure', 'pregnancy', 'drug_induced'],
  diarrhea: ['gastroenteritis', 'typhoid', 'inflammatory_bowel_disease', 'irritable_bowel_syndrome', 'cholera', 'c_diff_colitis', 'malabsorption'],
  seizure: ['epilepsy', 'febrile_convulsion', 'meningitis', 'stroke', 'brain_tumor', 'hypoglycemia', 'hyponatremia', 'eclampsia', 'drug_withdrawal'],
  bleeding: ['coagulopathy', 'peptic_ulcer_disease', 'esophageal_varices', 'trauma', 'ectopic_pregnancy', 'placental_abruption', 'hemorrhoids', 'malignancy'],
  syncope: ['cardiac_arrhythmia', 'vasovagal_syncope', 'orthostatic_hypotension', 'pulmonary_embolism', 'aortic_stenosis', 'hypoglycemia', 'seizure'],
};

export function getPossibleDiseases(symptomId: string): string[] {
  return SYMPTOM_DISEASE_REFERENCES[symptomId] ?? [];
}

export function findSymptomsByDisease(diseaseId: string): string[] {
  return Object.entries(SYMPTOM_DISEASE_REFERENCES)
    .filter(([, diseases]) => diseases.includes(diseaseId))
    .map(([symptom]) => symptom);
}
