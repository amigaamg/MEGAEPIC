import { DiseaseNode } from '../knowledge-graph/types';

export interface PatientContext {
  ageMonths: number;
  isHIVPositive: boolean;
  isMalnourished: boolean;
  hasAtopy: boolean;
  hasFamilyAsthma: boolean;
  isSmokingExposure: boolean;
  hasTbContact: boolean;
  isOvercrowding: boolean;
  isUnvaccinated: boolean;
}

export interface Evidence {
  historyHits: string[];
  examHits: string[];
  riskBoosts: string[];
  complicationOf?: string;
}

export interface ScoredDisease {
  disease: DiseaseNode;
  rawScore: number;
  probability: number;
  evidence: Evidence;
  relation: 'primary' | 'secondary' | 'complication' | 'comorbidity';
}

export interface SeverityInfo {
  level: string;
  color: string;
  bg: string;
  msg: string;
}
