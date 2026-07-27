import { EvidenceLevel } from './book-I-objects';
import { RelationshipType } from './book-II-relationships';

export const EVIDENCE_PRIORITY: Record<EvidenceLevel, number> = {
  systematic_review: 10,
  randomized_trial: 9,
  cohort_study: 7,
  case_control: 6,
  case_series: 4,
  expert_opinion: 2,
  consensus_guideline: 3,
  textbook: 3,
};

export interface EvidenceReference {
  id: string;
  citation: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  level: EvidenceLevel;
  url?: string;
  doi?: string;
  pmid?: string;
}

export interface EvidenceLink {
  relationshipType: RelationshipType;
  sourceType: string;
  targetType: string;
  sourceId: string;
  targetId: string;
  references: EvidenceReference[];
  confidence: number;
  lastReviewed: number;
  reviewedBy: string;
}

export const EVIDENCE_LIBRARY: Record<string, EvidenceReference> = {
  ref_bates: {
    id: 'ref_bates',
    citation: 'Bates B. A Guide to Physical Examination and History Taking. 12th ed. Wolters Kluwer; 2017.',
    title: 'A Guide to Physical Examination and History Taking',
    authors: ['Bates B'],
    year: 2017,
    journal: 'Wolters Kluwer',
    level: 'expert_opinion',
  } as EvidenceReference,
  ref_hutchison: {
    id: 'ref_hutchison',
    citation: 'Colledge NR, Walker BR, Ralston SH. Davidson\'s Principles and Practice of Medicine. 23rd ed. Elsevier; 2018.',
    title: 'Davidson\'s Principles and Practice of Medicine',
    authors: ['Colledge NR', 'Walker BR', 'Ralston SH'],
    year: 2018,
    journal: 'Elsevier',
    level: 'expert_opinion',
    doi: '10.1016/B978-0-7020-7028-0',
  } as EvidenceReference,
  ref_ats_cough: {
    id: 'ref_ats_cough',
    citation: 'Irwin RS, French CL, Chang AB, Altman KW. Classification of Cough as a Symptom in Adults and Management Algorithms. Chest. 2018;153(1):196-209.',
    title: 'Classification of Cough as a Symptom in Adults',
    authors: ['Irwin RS', 'French CL', 'Chang AB', 'Altman KW'],
    year: 2018,
    journal: 'Chest',
    level: 'consensus_guideline',
    doi: '10.1016/j.chest.2017.10.016',
  } as EvidenceReference,
  ref_who_tb: {
    id: 'ref_who_tb',
    citation: 'WHO. Global Tuberculosis Report 2023. Geneva: World Health Organization; 2023.',
    title: 'Global Tuberculosis Report 2023',
    authors: ['World Health Organization'],
    year: 2023,
    journal: 'WHO Press',
    level: 'systematic_review',
  } as EvidenceReference,
  ref_nice_cough: {
    id: 'ref_nice_cough',
    citation: 'NICE. Cough (acute): antimicrobial prescribing. NICE guideline NG120. 2019.',
    title: 'Cough (acute): antimicrobial prescribing',
    authors: ['National Institute for Health and Care Excellence'],
    year: 2019,
    journal: 'NICE',
    level: 'consensus_guideline',
  } as EvidenceReference,
};

export class EvidenceConstitution {
  private links: EvidenceLink[] = [];

  linkRelationship(
    relationshipType: RelationshipType,
    sourceId: string,
    targetId: string,
    refIds: string[],
    confidence?: number,
  ): EvidenceLink {
    const refs = refIds.map(id => EVIDENCE_LIBRARY[id]).filter(Boolean);
    const link: EvidenceLink = {
      relationshipType,
      sourceType: '',
      targetType: '',
      sourceId,
      targetId,
      references: refs,
      confidence: confidence || this.averageConfidence(refs),
      lastReviewed: Date.now(),
      reviewedBy: 'system',
    };
    this.links.push(link);
    return link;
  }

  getEvidenceForRelationship(sourceId: string, targetId: string, type: RelationshipType): EvidenceLink[] {
    return this.links.filter(
      l => l.sourceId === sourceId && l.targetId === targetId && l.relationshipType === type,
    );
  }

  getConfidence(sourceId: string, targetId: string, type: RelationshipType): number {
    const links = this.getEvidenceForRelationship(sourceId, targetId, type);
    if (links.length === 0) return 0.5;
    return links.reduce((sum, l) => sum + l.confidence, 0) / links.length;
  }

  private averageConfidence(refs: EvidenceReference[]): number {
    if (refs.length === 0) return 0.5;
    return refs.reduce((sum, r) => {
      const level = r.level as EvidenceLevel;
      return sum + (EVIDENCE_PRIORITY[level] || 5) / 10;
    }, 0) / refs.length;
  }
}

export const evidenceConstitution = new EvidenceConstitution();

evidenceConstitution.linkRelationship(
  RelationshipType.HasMechanism,
  'cough',
  'airway_inflammation',
  ['ref_ats_cough', 'ref_bates'],
  0.9,
);
evidenceConstitution.linkRelationship(
  RelationshipType.SuggestsDisease,
  'chronic_cough_phenotype',
  'tuberculosis',
  ['ref_who_tb'],
  0.85,
);
evidenceConstitution.linkRelationship(
  RelationshipType.SuggestsDisease,
  'cough',
  'pneumonia',
  ['ref_ats_cough', 'ref_nice_cough'],
  0.8,
);
evidenceConstitution.linkRelationship(
  RelationshipType.HasTreatment,
  'pneumonia',
  'antibiotics',
  ['ref_nice_cough'],
  0.9,
);
