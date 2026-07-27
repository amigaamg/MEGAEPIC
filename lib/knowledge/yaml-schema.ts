export interface YamlKnowledgeDocument {
  version: string;
  metadata: YamlMetadata;
  symptoms?: YamlSymptom[];
  diseases?: YamlDisease[];
  mechanisms?: YamlMechanism[];
  phenotypes?: YamlPhenotype[];
  investigations?: YamlInvestigation[];
  drugs?: YamlDrug[];
  guidelines?: YamlGuideline[];
  contexts?: YamlContext[];
  questions?: YamlQuestion[];
  signs?: YamlSign[];
  scores?: YamlScore[];
  protocols?: YamlProtocol[];
}

export interface YamlMetadata {
  title: string;
  author: string;
  date: string;
  description: string;
  source: 'who' | 'kenya_moh' | 'cosecsa' | 'nice' | 'idosa' | 'custom';
  specialty?: string;
  tags?: string[];
}

export interface YamlSymptom {
  id: string;
  name: string;
  aliases?: string[];
  bodySystem: string;
  urgency?: 'red' | 'orange' | 'yellow' | 'green';
  mechanisms: string[];
  phenotypes?: string[];
  questions?: YamlSymptomQuestion[];
  signs?: string[];
}

export interface YamlSymptomQuestion {
  id: string;
  text: string;
  dataType: 'boolean' | 'number' | 'text' | 'single_choice' | 'multiple_choice' | 'date';
  options?: string[];
  order: number;
  enables?: string[];
  hides?: string[];
  supportsPhenotype?: string[];
  supportsDisease?: string[];
}

export interface YamlMechanism {
  id: string;
  name: string;
  category: 'inflammatory' | 'infectious' | 'neoplastic' | 'autoimmune' | 'degenerative' | 'vascular' | 'traumatic' | 'congenital' | 'metabolic' | 'toxic' | 'idiopathic' | 'iatrogenic' | 'functional' | 'psychogenic';
  description?: string;
  phenotypes: string[];
}

export interface YamlPhenotype {
  id: string;
  name: string;
  features: string[];
  urgency?: 'routine' | 'urgent' | 'emergency' | 'critical';
  prevalence?: number;
  suggests: string[];
  symptoms?: string[];
  signs?: string[];
  requiresInvestigation?: string[];
}

export interface YamlDisease {
  id: string;
  name: string;
  icd10?: string;
  snomed?: string;
  synonyms?: string[];
  specialty: string[];
  emergencyLevel: 'red' | 'orange' | 'yellow' | 'green';
  mechanisms: string[];
  phenotypes?: string[];
  symptoms?: { symptomId: string; frequency: 'always' | 'common' | 'uncommon' | 'rare' }[];
  signs?: { signId: string; frequency: 'always' | 'common' | 'uncommon' | 'rare' }[];
  riskFactors?: string[];
  etiologies?: string[];
  complications?: string[];
  investigations?: { investigationId: string; purpose: string; timing: 'initial' | 'confirmatory' | 'monitoring' }[];
  treatments?: { treatmentId: string; firstLine: boolean }[];
  guidelines?: string[];
  scores?: string[];
  monitoring?: string[];
  differentials?: string[];
  contexts?: YamlDiseaseContext[];
}

export interface YamlDiseaseContext {
  context: string;
  changes: string[];
}

export interface YamlInvestigation {
  id: string;
  name: string;
  loinc?: string;
  category: 'hematology' | 'biochemistry' | 'microbiology' | 'immunology' | 'pathology' | 'genetics' | 'toxicology' | 'other';
  specimen?: string;
  turnaroundTime?: string;
  confirmsDisease?: string[];
  excludesDisease?: string[];
}

export interface YamlDrug {
  id: string;
  name: string;
  genericName: string;
  atcCode?: string;
  category: string;
  pregnancyCategory?: string;
  renalAdjustment?: string;
  contraindications?: string[];
  treatsDisease?: string[];
}

export interface YamlGuideline {
  id: string;
  title: string;
  issuingBody: string;
  year: number;
  level: 'global' | 'national' | 'regional' | 'local';
  country?: string;
  appliesToDisease: string[];
  overrides?: string[];
}

export interface YamlContext {
  id: string;
  name: string;
  category: 'age' | 'pregnancy' | 'comorbidity' | 'immunosuppression' | 'icu' | 'community' | 'hospital' | 'resource_limited';
  description?: string;
  modifies?: { diseaseId: string; changes: string[] }[];
  inheritsFrom?: string[];
}

export interface YamlQuestion {
  id: string;
  text: string;
  dataType: 'boolean' | 'number' | 'text' | 'single_choice' | 'multiple_choice' | 'date';
  options?: string[];
  order: number;
  symptomId?: string;
  enables?: string[];
  hides?: string[];
}

export interface YamlSign {
  id: string;
  name: string;
  examinationType: 'inspection' | 'palpation' | 'percussion' | 'auscultation' | 'measurement' | 'special_test';
  bodySystem?: string;
  supportsDisease?: string[];
  supportsPhenotype?: string[];
}

export interface YamlScore {
  id: string;
  name: string;
  minScore?: number;
  maxScore?: number;
  components?: { name: string; points: number }[];
  thresholds?: { level: string; min: number; max: number }[];
  appliesToDisease?: string[];
}

export interface YamlProtocol {
  id: string;
  name: string;
  type: 'treatment' | 'monitoring' | 'diagnostic' | 'discharge';
  steps: string[];
  appliesToDisease?: string[];
}
