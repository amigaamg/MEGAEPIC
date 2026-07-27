import { RelationshipType } from './book-II-relationships';
import { ObjectType } from './book-I-objects';

export type LearnerRole = 'student' | 'resident' | 'registrar' | 'consultant' | 'nurse' | 'clinical_officer' | 'specialist';

export interface LearningObjective {
  id: string;
  domain: string;
  concept: string;
  competency: 'knowledge' | 'skill' | 'attitude';
  level: 'recall' | 'comprehend' | 'apply' | 'analyze' | 'evaluate' | 'create';
  prerequisites: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  specialty: string;
  objectives: string[];
  estimatedHours: number;
  assessmentCriteria: string[];
}

export interface ClinicalTeachingPoint {
  id: string;
  concept: string;
  teachingNote: string;
  commonMistake: string;
  keyTakeaway: string;
  differentials: string[];
}

export const LEARNING_OBJECTIVES: LearningObjective[] = [
  { id: 'lo_cough_001', domain: 'respiratory', concept: 'cough_types', competency: 'knowledge', level: 'recall', prerequisites: [] },
  { id: 'lo_cough_002', domain: 'respiratory', concept: 'cough_mechanisms', competency: 'knowledge', level: 'comprehend', prerequisites: ['lo_cough_001'] },
  { id: 'lo_cough_003', domain: 'respiratory', concept: 'cough_history', competency: 'skill', level: 'apply', prerequisites: ['lo_cough_002'] },
  { id: 'lo_cough_004', domain: 'respiratory', concept: 'cough_examination', competency: 'skill', level: 'apply', prerequisites: ['lo_cough_003'] },
  { id: 'lo_cough_005', domain: 'respiratory', concept: 'cough_differentials', competency: 'knowledge', level: 'evaluate', prerequisites: ['lo_cough_004'] },
  { id: 'lo_cough_006', domain: 'respiratory', concept: 'cough_investigations', competency: 'knowledge', level: 'analyze', prerequisites: ['lo_cough_005'] },
  { id: 'lo_cough_007', domain: 'respiratory', concept: 'cough_management', competency: 'skill', level: 'create', prerequisites: ['lo_cough_006'] },
  { id: 'lo_abdo_001', domain: 'gastroenterology', concept: 'abdominal_pain_types', competency: 'knowledge', level: 'recall', prerequisites: [] },
  { id: 'lo_resp_base', domain: 'respiratory', concept: 'respiratory_anatomy', competency: 'knowledge', level: 'recall', prerequisites: [] },
  { id: 'lo_resp_exam', domain: 'respiratory', concept: 'respiratory_examination', competency: 'skill', level: 'apply', prerequisites: ['lo_resp_base'] },
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'lp_cough',
    name: 'Cough: From Symptom to Diagnosis',
    specialty: 'respiratory',
    objectives: ['lo_cough_001', 'lo_cough_002', 'lo_cough_003', 'lo_cough_004', 'lo_cough_005', 'lo_cough_006', 'lo_cough_007'],
    estimatedHours: 4,
    assessmentCriteria: ['Correctly classify cough types', 'Perform respiratory examination', 'Generate differential diagnosis', 'Order appropriate investigations'],
  },
  {
    id: 'lp_resp_base',
    name: 'Respiratory Medicine Fundamentals',
    specialty: 'respiratory',
    objectives: ['lo_resp_base', 'lo_resp_exam'],
    estimatedHours: 2,
    assessmentCriteria: ['Describe respiratory anatomy', 'Perform basic respiratory exam'],
  },
];

export const TEACHING_POINTS: ClinicalTeachingPoint[] = [
  {
    id: 'tp_cough_acute',
    concept: 'acute_cough',
    teachingNote: 'Acute cough (<3 weeks) is most commonly viral URTI. Red flags include hemoptysis, weight loss, night sweats.',
    commonMistake: 'Prescribing antibiotics for acute cough without signs of bacterial infection',
    keyTakeaway: 'Most acute cough is self-limiting. Antibiotics have minimal benefit.',
    differentials: ['URTI', 'acute bronchitis', 'pneumonia', 'COVID-19'],
  },
  {
    id: 'tp_cough_chronic',
    concept: 'chronic_cough',
    teachingNote: 'Chronic cough (>8 weeks) requires systematic evaluation. Upper airway cough syndrome, asthma, and GERD account for most cases.',
    commonMistake: 'Ordering chest X-ray before history is complete',
    keyTakeaway: 'History guides investigation. Ask about ACE inhibitors, smoking, occupation.',
    differentials: ['UACS', 'asthma', 'GERD', 'non-asthmatic eosinophilic bronchitis', 'TB'],
  },
  {
    id: 'tp_hemoptysis',
    concept: 'hemoptysis',
    teachingNote: 'Hemoptysis is a red flag. Massive hemoptysis (>200ml/24h) is a medical emergency.',
    commonMistake: 'Underestimating the severity of small-volume hemoptysis',
    keyTakeaway: 'TB, bronchiectasis, and lung cancer are the most common causes in Kenya.',
    differentials: ['TB', 'bronchiectasis', 'lung cancer', 'PE', 'bronchitis'],
  },
];

export class LearningConstitution {
  private objectives: Map<string, LearningObjective> = new Map();
  private paths: Map<string, LearningPath> = new Map();
  private teachingPoints: Map<string, ClinicalTeachingPoint> = new Map();

  constructor() {
    for (const obj of LEARNING_OBJECTIVES) this.objectives.set(obj.id, obj);
    for (const p of LEARNING_PATHS) this.paths.set(p.id, p);
    for (const tp of TEACHING_POINTS) this.teachingPoints.set(tp.id, tp);
  }

  getObjective(id: string): LearningObjective | null {
    return this.objectives.get(id) || null;
  }

  getPath(id: string): LearningPath | null {
    return this.paths.get(id) || null;
  }

  getTeachingPoint(concept: string): ClinicalTeachingPoint | null {
    return this.teachingPoints.get(`tp_${concept}`) || null;
  }

  getObjectivesForDomain(domain: string): LearningObjective[] {
    const all = Array.from(this.objectives.values());
    return all.filter(o => o.domain === domain);
  }

  getPrerequisites(objectiveId: string): LearningObjective[] {
    const obj = this.objectives.get(objectiveId);
    if (!obj) return [];
    return obj.prerequisites.map(id => this.objectives.get(id) as LearningObjective).filter(Boolean);
  }

  toGraphEdges(): { source: string; target: string; type: RelationshipType; properties: Record<string, unknown> }[] {
    const edges: { source: string; target: string; type: RelationshipType; properties: Record<string, unknown> }[] = [];
    const pathValues = Array.from(this.paths.values());
    for (const path of pathValues) {
      for (let i = 0; i < path.objectives.length - 1; i++) {
        edges.push({
          source: path.objectives[i],
          target: path.objectives[i + 1],
          type: RelationshipType.Requires,
          properties: { pathId: path.id, estimatedHours: path.estimatedHours },
        });
      }
    }
    const objValues = Array.from(this.objectives.values());
    for (const obj of objValues) {
      for (const prereq of obj.prerequisites) {
        edges.push({
          source: prereq,
          target: obj.id,
          type: RelationshipType.Requires,
          properties: { domain: obj.domain, competency: obj.competency },
        });
      }
    }
    return edges;
  }
}

export const learningConstitution = new LearningConstitution();
