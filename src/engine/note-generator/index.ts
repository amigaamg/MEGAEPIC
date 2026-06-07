import type { DDXResult } from '../ddx-engine';
import { phraseDifferential, phraseAssessment, formatMedicalText } from './language-engine';
import { getTemplateBySpecialty } from './templates';

export interface NoteSection {
  title: string;
  content: string;
}

export interface GeneratedNote {
  title: string;
  type: 'consultation' | 'ward_round' | 'discharge_summary' | 'operative_note' | 'referral';
  sections: NoteSection[];
  assessment: string;
  plan: string;
  differentials: string[];
  generatedAt: string;
}

export interface NoteGenerator {
  generateConsultationNote(params: {
    patientName: string;
    age: string;
    sex: string;
    chiefComplaint: string;
    hpi: string;
    pmh: string;
    medications: string;
    examFindings: string;
    differentials: DDXResult[];
  }): Promise<GeneratedNote>;

  generateDischargeSummary(params: {
    patientName: string;
    admissionDate: string;
    dischargeDate: string;
    diagnosis: string;
    procedures: string;
    hospitalCourse: string;
    medicationsOnDischarge: string;
    followUpPlan: string;
  }): Promise<GeneratedNote>;
}

function buildDifferentialText(differentials: DDXResult[]): string[] {
  return differentials.map(d => phraseDifferential(d.diseaseName, d.probability));
}

function buildAssessmentText(differentials: DDXResult[]): string {
  const names = differentials.map(d => d.diseaseName);
  const topSeverity = differentials[0]?.severityLevel || 'mild';
  return phraseAssessment(names, topSeverity);
}

function buildPlanText(differentials: DDXResult[]): string {
  const lines: string[] = [];
  if (differentials.length > 0) {
    const top = differentials[0];
    if (top.recommendedActions && top.recommendedActions.length > 0) {
      lines.push('Recommended actions:');
      lines.push(...top.recommendedActions.map(a => `- ${a}`));
    }
    if (top.suggestedInvestigations && top.suggestedInvestigations.length > 0) {
      lines.push('Suggested investigations:');
      lines.push(...top.suggestedInvestigations.map(i => `- ${i}`));
    }
  }
  return lines.length > 0 ? lines.join('\n') : 'Management plan to be determined based on clinical course.';
}

export function createNoteGenerator(departmentId?: string): NoteGenerator {
  const template = departmentId ? getTemplateBySpecialty(departmentId) : undefined;

  return {
    async generateConsultationNote(params): Promise<GeneratedNote> {
      const { patientName, age, sex, chiefComplaint, hpi, pmh, medications, examFindings, differentials } = params;
      const now = new Date().toISOString();

      const sections: NoteSection[] = [
        { title: 'Patient Information', content: `Name: ${patientName}\nAge: ${age}\nSex: ${sex}` },
        { title: 'Chief Complaint', content: formatMedicalText(chiefComplaint) },
        { title: 'History of Presenting Illness', content: hpi || 'Not documented.' },
        { title: 'Past Medical History', content: pmh || 'None documented.' },
        { title: 'Medications', content: medications || 'None.' },
        { title: 'Examination Findings', content: examFindings || 'Not documented.' },
      ];

      if (differentials.length > 0) {
        sections.push({
          title: 'Differential Diagnoses',
          content: differentials.map((d, i) =>
            `${i + 1}. ${d.diseaseName} (${(d.probability * 100).toFixed(1)}%) — ${d.confidence} confidence`
          ).join('\n'),
        });
      }

      const assessment = buildAssessmentText(differentials);
      const plan = buildPlanText(differentials);
      const differentialTexts = buildDifferentialText(differentials);

      if (template?.assessment) {
        sections.push({
          title: 'Specialty Assessment',
          content: template.assessment(differentials[0]?.diseaseName || '', differentials[0]?.severityLevel || 'mild'),
        });
      }

      return {
        title: `Consultation Note — ${patientName}`,
        type: 'consultation',
        sections,
        assessment,
        plan,
        differentials: differentialTexts,
        generatedAt: now,
      };
    },

    async generateDischargeSummary(params): Promise<GeneratedNote> {
      const { patientName, admissionDate, dischargeDate, diagnosis, procedures, hospitalCourse, medicationsOnDischarge, followUpPlan } = params;
      const now = new Date().toISOString();

      const sections: NoteSection[] = [
        { title: 'Patient Identification', content: `Name: ${patientName}` },
        { title: 'Admission Details', content: `Admitted: ${admissionDate}\nDischarged: ${dischargeDate}` },
        { title: 'Diagnosis at Discharge', content: diagnosis },
        { title: 'Procedures Performed', content: procedures || 'None.' },
        { title: 'Hospital Course', content: hospitalCourse || 'Not documented.' },
        { title: 'Medications on Discharge', content: medicationsOnDischarge || 'None.' },
        { title: 'Follow-up Plan', content: followUpPlan || 'To be reviewed in outpatient clinic.' },
      ];

      return {
        title: `Discharge Summary — ${patientName}`,
        type: 'discharge_summary',
        sections,
        assessment: `Discharge diagnosis: ${diagnosis}`,
        plan: `Follow-up: ${followUpPlan}`,
        differentials: [],
        generatedAt: now,
      };
    },
  };
}
