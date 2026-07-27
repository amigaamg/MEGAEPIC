import { ObjectType, EvidenceLevel } from './book-I-objects';
import { RelationshipType } from './book-II-relationships';

export interface NarrativeRule {
  objectType: ObjectType;
  condition: NarrativeCondition;
  template: string;
  variables: string[];
  priority: number;
}

export interface NarrativeCondition {
  field: string;
  operator: 'eq' | 'neq' | 'exists' | 'not_exists' | 'range';
  value?: unknown;
  min?: number;
  max?: number;
}

export interface NarrativeSlot {
  id: string;
  label: string;
  objectTypes: ObjectType[];
  required: boolean;
  narrativeTemplate: string;
}

export type DocumentType =
  | 'soap_note'
  | 'admission_note'
  | 'discharge_summary'
  | 'referral_letter'
  | 'operation_note'
  | 'death_summary'
  | 'clinic_note'
  | 'ward_round'
  | 'progress_note'
  | 'handover'
  | 'investigation_request'
  | 'prescription_chart'
  | 'nursing_note'
  | 'insurance_form'
  | 'death_certificate'
  | 'immunization_record'
  | 'antenatal_record'
  | 'research_form';

export interface DocumentBlueprint {
  type: DocumentType;
  sections: DocumentSection[];
  requiredObjects: ObjectType[];
  generatedBy: RelationshipType;
}

export interface DocumentSection {
  id: string;
  label: string;
  narrativeRules: NarrativeRule[];
  order: number;
  required: boolean;
}

export const DOCUMENT_BLUEPRINTS: Record<DocumentType, DocumentBlueprint> = {
  soap_note: {
    type: 'soap_note',
    requiredObjects: [ObjectType.Patient, ObjectType.Encounter],
    generatedBy: RelationshipType.Generates,
    sections: [
      { id: 's_subjective', label: 'Subjective', narrativeRules: [], order: 1, required: true },
      { id: 's_objective', label: 'Objective', narrativeRules: [], order: 2, required: true },
      { id: 's_assessment', label: 'Assessment', narrativeRules: [], order: 3, required: true },
      { id: 's_plan', label: 'Plan', narrativeRules: [], order: 4, required: true },
    ],
  },
  admission_note: {
    type: 'admission_note',
    requiredObjects: [ObjectType.Patient, ObjectType.Admission],
    generatedBy: RelationshipType.Generates,
    sections: [
      { id: 'a_cc', label: 'Chief Complaint', narrativeRules: [], order: 1, required: true },
      { id: 'a_hpi', label: 'History of Present Illness', narrativeRules: [], order: 2, required: true },
      { id: 'a_pmh', label: 'Past Medical History', narrativeRules: [], order: 3, required: true },
      { id: 'a_exam', label: 'Examination', narrativeRules: [], order: 4, required: true },
      { id: 'a_plan', label: 'Admission Plan', narrativeRules: [], order: 5, required: true },
    ],
  },
  discharge_summary: {
    type: 'discharge_summary',
    requiredObjects: [ObjectType.Patient, ObjectType.Discharge],
    generatedBy: RelationshipType.Generates,
    sections: [
      { id: 'd_admission', label: 'Admission Details', narrativeRules: [], order: 1, required: true },
      { id: 'd_course', label: 'Hospital Course', narrativeRules: [], order: 2, required: true },
      { id: 'd_diagnosis', label: 'Final Diagnosis', narrativeRules: [], order: 3, required: true },
      { id: 'd_medications', label: 'Discharge Medications', narrativeRules: [], order: 4, required: true },
      { id: 'd_followup', label: 'Follow-up Plan', narrativeRules: [], order: 5, required: true },
    ],
  },
  referral_letter: {
    type: 'referral_letter',
    requiredObjects: [ObjectType.Patient, ObjectType.Referral],
    generatedBy: RelationshipType.Generates,
    sections: [
      { id: 'r_reason', label: 'Reason for Referral', narrativeRules: [], order: 1, required: true },
      { id: 'r_clinical', label: 'Clinical Summary', narrativeRules: [], order: 2, required: true },
      { id: 'r_investigations', label: 'Investigations', narrativeRules: [], order: 3, required: true },
    ],
  },
  operation_note: {
    type: 'operation_note',
    requiredObjects: [ObjectType.Patient, ObjectType.Operation],
    generatedBy: RelationshipType.Generates,
    sections: [
      { id: 'o_preop', label: 'Pre-operative Diagnosis', narrativeRules: [], order: 1, required: true },
      { id: 'o_procedure', label: 'Procedure', narrativeRules: [], order: 2, required: true },
      { id: 'o_findings', label: 'Findings', narrativeRules: [], order: 3, required: true },
      { id: 'o_postop', label: 'Post-operative Plan', narrativeRules: [], order: 4, required: true },
    ],
  },
  death_summary: { type: 'death_summary', requiredObjects: [ObjectType.Patient], generatedBy: RelationshipType.Generates, sections: [] },
  clinic_note: { type: 'clinic_note', requiredObjects: [ObjectType.Patient, ObjectType.Encounter], generatedBy: RelationshipType.Generates, sections: [] },
  ward_round: { type: 'ward_round', requiredObjects: [ObjectType.Patient, ObjectType.Encounter], generatedBy: RelationshipType.Generates, sections: [] },
  progress_note: { type: 'progress_note', requiredObjects: [ObjectType.Patient, ObjectType.Encounter], generatedBy: RelationshipType.Generates, sections: [] },
  handover: { type: 'handover', requiredObjects: [ObjectType.Patient], generatedBy: RelationshipType.Generates, sections: [] },
  investigation_request: { type: 'investigation_request', requiredObjects: [ObjectType.Patient, ObjectType.Investigation], generatedBy: RelationshipType.Generates, sections: [] },
  prescription_chart: { type: 'prescription_chart', requiredObjects: [ObjectType.Patient, ObjectType.Drug], generatedBy: RelationshipType.Generates, sections: [] },
  nursing_note: { type: 'nursing_note', requiredObjects: [ObjectType.Patient], generatedBy: RelationshipType.Generates, sections: [] },
  insurance_form: { type: 'insurance_form', requiredObjects: [ObjectType.Patient, ObjectType.InsuranceProvider], generatedBy: RelationshipType.Generates, sections: [] },
  death_certificate: { type: 'death_certificate', requiredObjects: [ObjectType.Patient], generatedBy: RelationshipType.Generates, sections: [] },
  immunization_record: { type: 'immunization_record', requiredObjects: [ObjectType.Patient], generatedBy: RelationshipType.Generates, sections: [] },
  antenatal_record: { type: 'antenatal_record', requiredObjects: [ObjectType.Patient], generatedBy: RelationshipType.Generates, sections: [] },
  research_form: { type: 'research_form', requiredObjects: [ObjectType.Patient, ObjectType.ResearchStudy], generatedBy: RelationshipType.Generates, sections: [] },
};

export class DocumentationGraphEngine {
  private narratives: Map<string, NarrativeRule[]> = new Map();

  registerNarrative(objectType: ObjectType, rules: NarrativeRule[]): void {
    this.narratives.set(objectType, rules);
  }

  generateNarrative(objectType: ObjectType, data: Record<string, unknown>): string {
    const rules = this.narratives.get(objectType) || [];
    const matched = rules.filter(r => this.matchesCondition(r.condition, data));
    if (matched.length === 0) return '';
    matched.sort((a, b) => b.priority - a.priority);
    const rule = matched[0];
    let narrative = rule.template;
    for (const v of rule.variables) {
      narrative = narrative.replace(`{{${v}}}`, String(data[v] ?? ''));
    }
    return narrative;
  }

  getBlueprint(type: DocumentType): DocumentBlueprint | null {
    return DOCUMENT_BLUEPRINTS[type] || null;
  }

  getRequiredObjects(type: DocumentType): ObjectType[] {
    return DOCUMENT_BLUEPRINTS[type]?.requiredObjects || [];
  }

  private matchesCondition(condition: NarrativeCondition, data: Record<string, unknown>): boolean {
    const val = data[condition.field];
    switch (condition.operator) {
      case 'eq': return val === condition.value;
      case 'neq': return val !== condition.value;
      case 'exists': return val !== undefined && val !== null;
      case 'not_exists': return val === undefined || val === null;
      case 'range':
        if (typeof val !== 'number') return false;
        return (condition.min === undefined || val >= condition.min) &&
               (condition.max === undefined || val <= condition.max);
      default: return false;
    }
  }
}

export const documentationGraphEngine = new DocumentationGraphEngine();
