import type { AtomicFact, FactQuery } from '../storage/types';
import type { AtomicFactStore } from '../storage/engine';
import type { ClinicalDocument, DocumentSection, DocumentType, DocumentStatus, TemplateSlot } from './types';
import { DOCUMENT_TEMPLATES } from './types';

let _docIdCounter = 0;
function uid(): string {
  _docIdCounter++;
  return `doc_${_docIdCounter}_${Date.now()}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export class DocumentationEngine {
  private store: AtomicFactStore;
  private documents: Map<string, ClinicalDocument> = new Map();
  private maxHistory = 1000;

  constructor(store: AtomicFactStore) {
    this.store = store;
  }

  generateDocument(
    patientId: string,
    documentType: DocumentType,
    opts?: {
      encounterId?: string;
      authoredBy?: string;
      status?: DocumentStatus;
      tags?: string[];
    },
  ): ClinicalDocument {
    const template = DOCUMENT_TEMPLATES[documentType];
    const facts = this.store.query({
      patientId,
      encounterId: opts?.encounterId,
      status: 'active',
    } as FactQuery);

    const sections: DocumentSection[] = template.sections.map((sec, i) => ({
      id: `sec_${i}_${Date.now()}`,
      title: sec.title,
      content: this.renderSection(sec.slot, facts),
      order: i,
      facts: facts.filter(f => this.factMatchesSlot(f, sec.slot)).map(f => f.id),
    }));

    const content = sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n');
    const title = this.generateTitle(documentType, facts);

    const doc: ClinicalDocument = {
      id: uid(),
      patientId,
      encounterId: opts?.encounterId,
      documentType,
      title,
      content,
      sections,
      status: opts?.status || 'draft',
      version: 1,
      generatedAt: Date.now(),
      generatedBy: 'documentation_engine',
      authoredBy: opts?.authoredBy,
      sourceFactIds: sections.flatMap(s => s.facts),
      sourceEventIds: [],
      tags: opts?.tags || [documentType],
      metadata: {},
    };

    this.documents.set(doc.id, doc);
    if (this.documents.size > this.maxHistory) {
      const firstKey = this.documents.keys().next().value;
      if (firstKey) this.documents.delete(firstKey as string);
    }

    return doc;
  }

  getDocument(id: string): ClinicalDocument | undefined {
    return this.documents.get(id);
  }

  getDocumentsByPatient(patientId: string): ClinicalDocument[] {
    return Array.from(this.documents.values())
      .filter(d => d.patientId === patientId)
      .sort((a, b) => b.generatedAt - a.generatedAt);
  }

  getDocumentsByType(documentType: DocumentType): ClinicalDocument[] {
    return Array.from(this.documents.values())
      .filter(d => d.documentType === documentType)
      .sort((a, b) => b.generatedAt - a.generatedAt);
  }

  signDocument(docId: string, signedBy: string): boolean {
    const doc = this.documents.get(docId);
    if (!doc) return false;
    doc.status = 'final';
    doc.signedBy = signedBy;
    doc.signedAt = Date.now();
    return true;
  }

  amendDocument(docId: string, amendedContent: string): ClinicalDocument | undefined {
    const original = this.documents.get(docId);
    if (!original) return undefined;
    original.status = 'superseded';

    const amended: ClinicalDocument = {
      ...original,
      id: uid(),
      version: original.version + 1,
      content: amendedContent,
      status: 'amended',
      generatedAt: Date.now(),
    };
    this.documents.set(amended.id, amended);
    return amended;
  }

  getStats(): { total: number; byType: Record<string, number>; byStatus: Record<string, number> } {
    const all = Array.from(this.documents.values());
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const d of all) {
      byType[d.documentType] = (byType[d.documentType] || 0) + 1;
      byStatus[d.status] = (byStatus[d.status] || 0) + 1;
    }
    return { total: all.length, byType, byStatus };
  }

  private renderSection(slot: TemplateSlot, facts: AtomicFact[]): string {
    const slotFacts = facts.filter(f => this.factMatchesSlot(f, slot));
    if (slotFacts.length === 0) {
      return this.getSlotPlaceholder(slot);
    }

    switch (slot) {
      case 'patient_info':
        return this.renderPatientInfo(slotFacts);
      case 'date':
        return formatDate(Date.now());
      case 'chief_complaint':
        return this.renderChiefComplaint(slotFacts);
      case 'history_of_presenting_illness':
        return this.renderHPI(slotFacts);
      case 'past_medical_history':
        return this.renderListFacts(slotFacts, 'past_medical_history');
      case 'drug_history':
        return this.renderDrugHistory(slotFacts);
      case 'allergies':
        return this.renderListFacts(slotFacts, 'allergy');
      case 'family_history':
        return this.renderListFacts(slotFacts, 'family_history');
      case 'social_history':
        return this.renderSocialHistory(slotFacts);
      case 'vitals':
        return this.renderVitals(slotFacts);
      case 'examination':
        return this.renderExamination(slotFacts);
      case 'investigations':
        return this.renderInvestigations(slotFacts);
      case 'diagnosis':
        return this.renderDiagnoses(slotFacts);
      case 'differentials':
        return this.renderDifferentials(slotFacts);
      case 'treatment':
        return this.renderTreatments(slotFacts);
      case 'plan':
        return this.renderPlan(slotFacts);
      case 'follow_up':
        return this.renderFollowUp(slotFacts);
      case 'discharge_medications':
        return this.renderTreatments(slotFacts);
      case 'discharge_instructions':
        return this.renderPlan(slotFacts);
      case 'referral_reason':
        return this.getSlotPlaceholder(slot);
      case 'operation_details':
        return this.renderOperationDetails(slotFacts);
      case 'anaesthesia_details':
        return this.getSlotPlaceholder(slot);
      case 'cause_of_death':
        return this.getSlotPlaceholder(slot);
      case 'review_of_systems':
        return this.renderListFacts(slotFacts, 'ros');
      case 'immunizations_given':
        return this.renderListFacts(slotFacts, 'immunization');
      default:
        return slotFacts.map(f => `- ${f.concept}: ${JSON.stringify(f.value)}`).join('\n');
    }
  }

  private factMatchesSlot(fact: AtomicFact, slot: TemplateSlot): boolean {
    const mapping: Record<TemplateSlot, string[]> = {
      patient_info: ['patient.registered', 'patient.updated'],
      date: [],
      chief_complaint: ['symptom.recorded'],
      history_of_presenting_illness: ['symptom.recorded', 'symptom.updated', 'fact.recorded'],
      past_medical_history: ['fact.recorded'],
      drug_history: ['medication.ordered', 'treatment.prescribed'],
      allergies: ['fact.recorded'],
      family_history: ['fact.recorded'],
      social_history: ['fact.recorded'],
      review_of_systems: ['symptom.recorded', 'fact.recorded'],
      vitals: ['vital.recorded'],
      examination: ['examination.performed', 'finding.recorded', 'finding.updated'],
      investigations: ['investigation.ordered', 'investigation.resulted'],
      diagnosis: ['diagnosis.added', 'diagnosis.updated'],
      differentials: ['diagnosis.added'],
      treatment: ['treatment.prescribed', 'treatment.administered', 'medication.ordered'],
      plan: ['discharge.ordered', 'outcome.recorded'],
      follow_up: ['discharge.ordered'],
      discharge_medications: ['treatment.prescribed', 'medication.ordered'],
      discharge_instructions: ['discharge.ordered'],
      referral_reason: ['referral.made', 'transfer.ordered'],
      operation_details: ['procedure.performed'],
      anaesthesia_details: ['procedure.performed'],
      cause_of_death: ['outcome.recorded'],
      immunizations_given: ['treatment.prescribed'],
    };
    const prefixes = mapping[slot] || [];
    if (prefixes.length === 0) return true;
    return prefixes.some(p => fact.tags.includes(p) || fact.concept.startsWith(p));
  }

  private getSlotPlaceholder(slot: TemplateSlot): string {
    const placeholders: Record<TemplateSlot, string> = {
      patient_info: '*Patient information not recorded*',
      date: formatDate(Date.now()),
      chief_complaint: '*No chief complaint recorded*',
      history_of_presenting_illness: '*No history recorded*',
      past_medical_history: '*No past medical history recorded*',
      drug_history: '*No drug history recorded*',
      allergies: '*No allergies recorded*',
      family_history: '*No family history recorded*',
      social_history: '*No social history recorded*',
      review_of_systems: '*Review of systems not documented*',
      vitals: '*No vitals recorded*',
      examination: '*No examination findings recorded*',
      investigations: '*No investigations recorded*',
      diagnosis: '*No diagnosis recorded*',
      differentials: '*No differentials recorded*',
      treatment: '*No treatment recorded*',
      plan: '*No plan recorded*',
      follow_up: '*No follow-up plan recorded*',
      discharge_medications: '*No discharge medications recorded*',
      discharge_instructions: '*No discharge instructions recorded*',
      referral_reason: '*No referral reason documented*',
      operation_details: '*No operation details recorded*',
      anaesthesia_details: '*No anaesthesia details recorded*',
      cause_of_death: '*Cause of death not recorded*',
      immunizations_given: '*No immunizations recorded*',
    };
    return placeholders[slot] || '*Not documented*';
  }

  private generateTitle(documentType: DocumentType, facts: AtomicFact[]): string {
    const typeLabels: Record<DocumentType, string> = {
      soap_note: 'SOAP Note',
      admission_summary: 'Admission Summary',
      discharge_summary: 'Discharge Summary',
      referral_letter: 'Referral Letter',
      consultation_note: 'Consultation Note',
      ward_round_note: 'Ward Round Note',
      operation_note: 'Operation Note',
      death_summary: 'Death Summary',
      clinic_note: 'Clinic Note',
      handover_note: 'Handover Note',
      progress_note: 'Progress Note',
      investigation_request: 'Investigation Request',
      prescription_chart: 'Prescription Chart',
      nursing_note: 'Nursing Note',
      insurance_form: 'Insurance Form',
      death_certificate: 'Medical Certificate of Death',
      immunization_record: 'Immunization Record',
      antenatal_record: 'Antenatal Record',
      research_form: 'Research Data Form',
    };
    return `${typeLabels[documentType]} — ${formatDate(Date.now())}`;
  }

  private renderPatientInfo(facts: AtomicFact[]): string {
    const name = facts.find(f => f.concept.includes('patientName'));
    const age = facts.find(f => f.concept.includes('age') || f.concept.includes('dob'));
    const sex = facts.find(f => f.concept.includes('sex') || f.concept.includes('gender'));
    const mrn = facts.find(f => f.concept.includes('mrn') || f.concept.includes('hospitalNumber'));
    const lines: string[] = [];
    if (name) lines.push(`**Name:** ${name.value}`);
    if (age) lines.push(`**Age:** ${age.value}`);
    if (sex) lines.push(`**Sex:** ${sex.value}`);
    if (mrn) lines.push(`**MRN:** ${mrn.value}`);
    return lines.length > 0 ? lines.join('\n') : this.getSlotPlaceholder('patient_info');
  }

  private renderChiefComplaint(facts: AtomicFact[]): string {
    const complaints = facts.filter(f =>
      f.concept.includes('symptomId') || f.concept.includes('complaint'),
    );
    return complaints.map(c => `- ${c.value}${c.metadata?.duration ? ` (${c.metadata.duration})` : ''}`).join('\n')
      || this.getSlotPlaceholder('chief_complaint');
  }

  private renderHPI(facts: AtomicFact[]): string {
    return facts
      .filter(f => f.tags.includes('symptom.recorded') || f.tags.includes('fact.recorded'))
      .map(f => `- ${f.concept}: ${JSON.stringify(f.value)}`)
      .join('\n') || this.getSlotPlaceholder('history_of_presenting_illness');
  }

  private renderListFacts(facts: AtomicFact[], prefix: string): string {
    const matched = facts.filter(f => f.concept.toLowerCase().includes(prefix));
    return matched.map(f => `- ${f.concept.replace(`${prefix}.`, '')}: ${JSON.stringify(f.value)}`).join('\n')
      || this.getSlotPlaceholder(prefix as TemplateSlot);
  }

  private renderDrugHistory(facts: AtomicFact[]): string {
    return facts
      .filter(f => f.tags.includes('medication.ordered') || f.tags.includes('treatment.prescribed'))
      .map(f => {
        const p = f.value as Record<string, unknown>;
        return `- ${p.name || p.medicationId || f.concept}: ${p.dose || ''} ${p.frequency || ''}`;
      })
      .join('\n') || this.getSlotPlaceholder('drug_history');
  }

  private renderSocialHistory(facts: AtomicFact[]): string {
    return facts
      .filter(f => ['smoking', 'alcohol', 'occupation', 'residence'].some(k => f.concept.includes(k)))
      .map(f => `- ${f.concept.split('.').pop()}: ${f.value}`)
      .join('\n') || this.getSlotPlaceholder('social_history');
  }

  private renderVitals(facts: AtomicFact[]): string {
    const sys = facts.find(f => f.concept.includes('systolicBP'));
    const dia = facts.find(f => f.concept.includes('diastolicBP'));
    const pulse = facts.find(f => f.concept.includes('pulse') || f.concept.includes('hr'));
    const temp = facts.find(f => f.concept.includes('temperature'));
    const spo2 = facts.find(f => f.concept.includes('oxygenSaturation') || f.concept.includes('spo2'));
    const rr = facts.find(f => f.concept.includes('respiratoryRate') || f.concept.includes('rr'));
    const weight = facts.find(f => f.concept.includes('weight'));
    const height = facts.find(f => f.concept.includes('height'));
    const gcs = facts.find(f => f.concept.includes('gcs') || f.concept.includes('avpu'));

    const lines: string[] = [];
    if (sys && dia) lines.push(`BP: ${sys.value}/${dia.value} mmHg`);
    else if (sys) lines.push(`BP: ${sys.value} mmHg`);
    if (pulse) lines.push(`Pulse: ${pulse.value} /min`);
    if (temp) lines.push(`Temp: ${temp.value} °C`);
    if (spo2) lines.push(`SpO2: ${spo2.value} %`);
    if (rr) lines.push(`RR: ${rr.value} /min`);
    if (weight) lines.push(`Weight: ${weight.value} kg`);
    if (height) lines.push(`Height: ${height.value} cm`);
    if (gcs) lines.push(`GCS: ${gcs.value}`);
    return lines.join(' | ') || this.getSlotPlaceholder('vitals');
  }

  private renderExamination(facts: AtomicFact[]): string {
    const examFacts = facts.filter(f =>
      f.tags.includes('examination.performed') || f.tags.includes('finding.recorded'),
    );
    return examFacts.map(f => {
      const system = f.concept.includes('respiratory') ? 'Respiratory'
        : f.concept.includes('cardiovascular') ? 'Cardiovascular'
        : f.concept.includes('abdominal') ? 'Abdominal'
        : f.concept.includes('neurological') ? 'Neurological'
        : f.concept.includes('musculoskeletal') ? 'Musculoskeletal'
        : 'General';
      return `- **${system}**: ${f.concept.split('.').pop()}: ${JSON.stringify(f.value)}`;
    }).join('\n') || this.getSlotPlaceholder('examination');
  }

  private renderInvestigations(facts: AtomicFact[]): string {
    const ordered = facts.filter(f => f.tags.includes('investigation.ordered') && !f.concept.includes('result'));
    const resulted = facts.filter(f => f.tags.includes('investigation.resulted') || f.concept.includes('result'));
    const lines: string[] = [];
    if (ordered.length > 0) {
      lines.push('**Ordered:**');
      ordered.forEach(f => lines.push(`- ${f.concept.split('.').pop()}: ${JSON.stringify(f.value)}`));
    }
    if (resulted.length > 0) {
      lines.push('**Results:**');
      resulted.forEach(f => lines.push(`- ${f.concept.split('.').pop()}: ${JSON.stringify(f.value)}`));
    }
    return lines.join('\n') || this.getSlotPlaceholder('investigations');
  }

  private renderDiagnoses(facts: AtomicFact[]): string {
    return facts
      .filter(f => f.tags.includes('diagnosis.added'))
      .map(f => {
        const p = f.value as Record<string, unknown>;
        const name = p.name || p.diagnosisId || f.concept;
        const icd = p.icd10 ? ` (${p.icd10})` : '';
        const conf = p.confidence ? ` — ${Math.round(Number(p.confidence) * 100)}%` : '';
        return `- **${name}**${icd}${conf}`;
      })
      .join('\n') || this.getSlotPlaceholder('diagnosis');
  }

  private renderDifferentials(facts: AtomicFact[]): string {
    return this.renderDiagnoses(facts);
  }

  private renderTreatments(facts: AtomicFact[]): string {
    return facts
      .filter(f => f.tags.includes('treatment.prescribed') || f.tags.includes('medication.ordered'))
      .map(f => {
        const p = f.value as Record<string, unknown>;
        const name = p.name || p.treatmentId || f.concept.split('.').pop();
        const dose = p.dose ? ` ${p.dose}` : '';
        const freq = p.frequency ? ` ${String(p.frequency).replace(/_/g, ' ')}` : '';
        const dur = p.duration ? ` ×${p.duration}d` : '';
        return `- **${name}**${dose}${freq}${dur}`;
      })
      .join('\n') || this.getSlotPlaceholder('treatment');
  }

  private renderPlan(facts: AtomicFact[]): string {
    const planFacts = facts.filter(f =>
      f.tags.includes('discharge.ordered') || f.tags.includes('outcome.recorded') || f.concept.includes('plan'),
    );
    return planFacts.map(f => `- ${f.concept.split('.').pop()}: ${JSON.stringify(f.value)}`).join('\n')
      || this.getSlotPlaceholder('plan');
  }

  private renderFollowUp(facts: AtomicFact[]): string {
    const followUp = facts.filter(f =>
      f.concept.includes('followUp') || f.concept.includes('follow_up'),
    );
    return followUp.map(f => `- ${f.concept}: ${JSON.stringify(f.value)}`).join('\n')
      || this.getSlotPlaceholder('follow_up');
  }

  private renderOperationDetails(facts: AtomicFact[]): string {
    return facts
      .filter(f => f.tags.includes('procedure.performed'))
      .map(f => `- ${f.concept.split('.').pop()}: ${JSON.stringify(f.value)}`)
      .join('\n') || this.getSlotPlaceholder('operation_details');
  }
}
