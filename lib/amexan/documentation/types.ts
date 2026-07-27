import type { AtomicFact } from '../storage/types';

export type DocumentType =
  | 'soap_note'
  | 'admission_summary'
  | 'discharge_summary'
  | 'referral_letter'
  | 'consultation_note'
  | 'ward_round_note'
  | 'operation_note'
  | 'death_summary'
  | 'clinic_note'
  | 'handover_note'
  | 'progress_note'
  | 'investigation_request'
  | 'prescription_chart'
  | 'nursing_note'
  | 'insurance_form'
  | 'death_certificate'
  | 'immunization_record'
  | 'antenatal_record'
  | 'research_form';

export type DocumentStatus = 'draft' | 'final' | 'amended' | 'superseded';

export interface ClinicalDocument {
  id: string;
  patientId: string;
  encounterId?: string;
  documentType: DocumentType;
  title: string;
  content: string;
  sections: DocumentSection[];
  status: DocumentStatus;
  version: number;
  generatedAt: number;
  generatedBy: string;
  authoredBy?: string;
  reviewedBy?: string;
  signedBy?: string;
  signedAt?: number;
  sourceFactIds: string[];
  sourceEventIds: string[];
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
  facts: string[];
}

export type TemplateSlot =
  | 'patient_info'
  | 'date'
  | 'chief_complaint'
  | 'history_of_presenting_illness'
  | 'past_medical_history'
  | 'drug_history'
  | 'allergies'
  | 'family_history'
  | 'social_history'
  | 'review_of_systems'
  | 'vitals'
  | 'examination'
  | 'investigations'
  | 'diagnosis'
  | 'differentials'
  | 'treatment'
  | 'plan'
  | 'follow_up'
  | 'discharge_medications'
  | 'discharge_instructions'
  | 'referral_reason'
  | 'operation_details'
  | 'anaesthesia_details'
  | 'cause_of_death'
  | 'immunizations_given';

export interface DocumentTemplate {
  id: string;
  documentType: DocumentType;
  name: string;
  description: string;
  slots: TemplateSlot[];
  sections: { title: string; slot: TemplateSlot }[];
}

export const DOCUMENT_TEMPLATES: Record<DocumentType, DocumentTemplate> = {
  soap_note: {
    id: 'soap_note', documentType: 'soap_note', name: 'SOAP Note', description: 'Subjective, Objective, Assessment, Plan',
    slots: ['patient_info', 'date', 'chief_complaint', 'history_of_presenting_illness', 'review_of_systems', 'vitals', 'examination', 'diagnosis', 'differentials', 'treatment', 'plan', 'follow_up'],
    sections: [
      { title: 'Subjective', slot: 'history_of_presenting_illness' },
      { title: 'Objective', slot: 'examination' },
      { title: 'Assessment', slot: 'diagnosis' },
      { title: 'Plan', slot: 'plan' },
    ],
  },
  admission_summary: {
    id: 'admission_summary', documentType: 'admission_summary', name: 'Admission Summary', description: 'Comprehensive admission documentation',
    slots: ['patient_info', 'date', 'chief_complaint', 'history_of_presenting_illness', 'past_medical_history', 'drug_history', 'allergies', 'family_history', 'social_history', 'review_of_systems', 'vitals', 'examination', 'investigations', 'diagnosis', 'differentials', 'treatment', 'plan'],
    sections: [
      { title: 'Admission Diagnosis', slot: 'diagnosis' },
      { title: 'History', slot: 'history_of_presenting_illness' },
      { title: 'Examination Findings', slot: 'examination' },
      { title: 'Plan', slot: 'plan' },
    ],
  },
  discharge_summary: {
    id: 'discharge_summary', documentType: 'discharge_summary', name: 'Discharge Summary', description: 'Patient discharge documentation',
    slots: ['patient_info', 'date', 'diagnosis', 'treatment', 'discharge_medications', 'discharge_instructions', 'follow_up'],
    sections: [
      { title: 'Diagnosis at Discharge', slot: 'diagnosis' },
      { title: 'Treatment Given', slot: 'treatment' },
      { title: 'Discharge Medications', slot: 'discharge_medications' },
      { title: 'Discharge Instructions', slot: 'discharge_instructions' },
      { title: 'Follow-up Plan', slot: 'follow_up' },
    ],
  },
  referral_letter: {
    id: 'referral_letter', documentType: 'referral_letter', name: 'Referral Letter', description: 'Referral to another facility or specialist',
    slots: ['patient_info', 'date', 'chief_complaint', 'history_of_presenting_illness', 'examination', 'investigations', 'diagnosis', 'treatment', 'referral_reason'],
    sections: [
      { title: 'Reason for Referral', slot: 'referral_reason' },
      { title: 'Clinical Summary', slot: 'history_of_presenting_illness' },
      { title: 'Findings', slot: 'examination' },
    ],
  },
  consultation_note: {
    id: 'consultation_note', documentType: 'consultation_note', name: 'Consultation Note', description: 'Specialist consultation documentation',
    slots: ['patient_info', 'date', 'chief_complaint', 'history_of_presenting_illness', 'examination', 'investigations', 'diagnosis', 'differentials', 'plan', 'follow_up'],
    sections: [
      { title: 'Consultation Findings', slot: 'examination' },
      { title: 'Assessment', slot: 'diagnosis' },
      { title: 'Recommendations', slot: 'plan' },
    ],
  },
  ward_round_note: {
    id: 'ward_round_note', documentType: 'ward_round_note', name: 'Ward Round Note', description: 'Daily ward round documentation',
    slots: ['patient_info', 'date', 'vitals', 'examination', 'investigations', 'diagnosis', 'treatment', 'plan', 'follow_up'],
    sections: [
      { title: 'Subjective Update', slot: 'history_of_presenting_illness' },
      { title: 'Objective', slot: 'examination' },
      { title: 'Assessment', slot: 'diagnosis' },
      { title: 'Plan', slot: 'plan' },
    ],
  },
  operation_note: {
    id: 'operation_note', documentType: 'operation_note', name: 'Operation Note', description: 'Surgical operation documentation',
    slots: ['patient_info', 'date', 'diagnosis', 'operation_details', 'anaesthesia_details', 'plan', 'follow_up'],
    sections: [
      { title: 'Pre-operative Diagnosis', slot: 'diagnosis' },
      { title: 'Operation Details', slot: 'operation_details' },
      { title: 'Post-operative Plan', slot: 'plan' },
    ],
  },
  death_summary: {
    id: 'death_summary', documentType: 'death_summary', name: 'Death Summary', description: 'Documentation following patient death',
    slots: ['patient_info', 'date', 'diagnosis', 'cause_of_death'],
    sections: [
      { title: 'Diagnosis at Death', slot: 'diagnosis' },
      { title: 'Cause of Death', slot: 'cause_of_death' },
    ],
  },
  clinic_note: {
    id: 'clinic_note', documentType: 'clinic_note', name: 'Clinic Note', description: 'Outpatient clinic visit documentation',
    slots: ['patient_info', 'date', 'chief_complaint', 'history_of_presenting_illness', 'vitals', 'examination', 'diagnosis', 'treatment', 'plan', 'follow_up'],
    sections: [
      { title: 'History', slot: 'history_of_presenting_illness' },
      { title: 'Examination', slot: 'examination' },
      { title: 'Assessment', slot: 'diagnosis' },
      { title: 'Plan', slot: 'plan' },
    ],
  },
  handover_note: {
    id: 'handover_note', documentType: 'handover_note', name: 'Handover Note', description: 'Shift handover documentation (ISBAR)',
    slots: ['patient_info', 'date', 'diagnosis', 'treatment', 'plan'],
    sections: [
      { title: 'Situation', slot: 'diagnosis' },
      { title: 'Background', slot: 'history_of_presenting_illness' },
      { title: 'Assessment', slot: 'diagnosis' },
      { title: 'Recommendation', slot: 'plan' },
    ],
  },
  progress_note: {
    id: 'progress_note', documentType: 'progress_note', name: 'Progress Note', description: 'Daily progress note',
    slots: ['patient_info', 'date', 'vitals', 'examination', 'plan'],
    sections: [
      { title: 'Progress', slot: 'history_of_presenting_illness' },
      { title: 'Examination', slot: 'examination' },
      { title: 'Plan', slot: 'plan' },
    ],
  },
  investigation_request: {
    id: 'investigation_request', documentType: 'investigation_request', name: 'Investigation Request', description: 'Laboratory or imaging request form',
    slots: ['patient_info', 'date', 'diagnosis', 'investigations'],
    sections: [
      { title: 'Clinical Details', slot: 'diagnosis' },
      { title: 'Investigations Requested', slot: 'investigations' },
    ],
  },
  prescription_chart: {
    id: 'prescription_chart', documentType: 'prescription_chart', name: 'Prescription Chart', description: 'Medication prescription chart',
    slots: ['patient_info', 'date', 'treatment'],
    sections: [
      { title: 'Current Medications', slot: 'treatment' },
    ],
  },
  nursing_note: {
    id: 'nursing_note', documentType: 'nursing_note', name: 'Nursing Note', description: 'Nursing observation and care note',
    slots: ['patient_info', 'date', 'vitals', 'treatment', 'plan'],
    sections: [
      { title: 'Observations', slot: 'vitals' },
      { title: 'Care Given', slot: 'treatment' },
      { title: 'Care Plan', slot: 'plan' },
    ],
  },
  insurance_form: {
    id: 'insurance_form', documentType: 'insurance_form', name: 'Insurance Form', description: 'Medical insurance claim form',
    slots: ['patient_info', 'date', 'diagnosis', 'treatment', 'investigations'],
    sections: [
      { title: 'Diagnosis', slot: 'diagnosis' },
      { title: 'Treatment Provided', slot: 'treatment' },
      { title: 'Investigations', slot: 'investigations' },
    ],
  },
  death_certificate: {
    id: 'death_certificate', documentType: 'death_certificate', name: 'Medical Certificate of Death', description: 'Cause of death certification',
    slots: ['patient_info', 'date', 'cause_of_death'],
    sections: [
      { title: 'Cause of Death', slot: 'cause_of_death' },
    ],
  },
  immunization_record: {
    id: 'immunization_record', documentType: 'immunization_record', name: 'Immunization Record', description: 'Vaccination history record',
    slots: ['patient_info', 'date', 'immunizations_given'],
    sections: [
      { title: 'Immunizations', slot: 'immunizations_given' },
    ],
  },
  antenatal_record: {
    id: 'antenatal_record', documentType: 'antenatal_record', name: 'Antenatal Record', description: 'Antenatal care visit record',
    slots: ['patient_info', 'date', 'vitals', 'examination', 'investigations', 'plan', 'follow_up'],
    sections: [
      { title: 'Maternal Examination', slot: 'examination' },
      { title: 'Investigations', slot: 'investigations' },
      { title: 'Plan', slot: 'plan' },
    ],
  },
  research_form: {
    id: 'research_form', documentType: 'research_form', name: 'Research Data Form', description: 'Clinical research data collection form',
    slots: ['patient_info', 'date', 'diagnosis', 'treatment', 'investigations'],
    sections: [
      { title: 'Clinical Data', slot: 'diagnosis' },
      { title: 'Interventions', slot: 'treatment' },
    ],
  },
};
