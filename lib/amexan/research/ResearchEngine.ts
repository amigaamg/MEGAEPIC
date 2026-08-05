// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Research Engine (BOOK VI-O · Constitutional Engine No. 25)
//
// "The Engine of Scientific Discovery"
//
// Every clinical encounter can contribute to medical knowledge while respecting
// ethics, privacy, and constitutional governance.
//
// The engine governs: the research workspace, study lifecycle, ethics engine,
// CRF engine, dataset engine, publication engine, grant engine, and the AI
// research companion.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Constitutional authority / restriction tables ──────────────────────────────

export const RESEARCH_AUTHORITY: readonly string[] = [
  'create_protocols', 'submit_ethics', 'recruit_participants', 'collect_data',
  'manage_datasets', 'publish_findings', 'manage_grants', 'analyze_data',
  'teach_research', 'lead_research_governance',
];

export const RESEARCH_RESTRICTIONS: readonly string[] = [
  'publish_without_ethics_approval', 'access_identified_patient_data',
  'override_constitutional_governance', 'fabricate_data',
  'share_data_outside_agreement', 'modify_protocol_without_amendment',
];

// ── Research workspace ─────────────────────────────────────────────────────────

export type ResearchWorkspaceKind =
  | 'clinical_trial' | 'observational_study' | 'registry'
  | 'quality_improvement' | 'population_health' | 'ml_dataset'
  | 'medical_education_research' | 'health_systems_research';

export interface ResearchWorkspace {
  id: string;
  title: string;
  kind: ResearchWorkspaceKind;
  principalInvestigatorId: AmxUid;
  createdBy?: AmxUid;
  description: string;
  createdAt: number;
  active: boolean;
}

// ── Study lifecycle ────────────────────────────────────────────────────────────

export type StudyStage =
  | 'idea' | 'protocol' | 'ethics' | 'funding' | 'recruitment'
  | 'data_collection' | 'monitoring' | 'analysis' | 'publication' | 'knowledge_base';

export interface Study {
  id: string;
  workspaceId?: string;
  title: string;
  protocolVersion: string;
  stage: StudyStage;
  startedAt: number;
  stages: { stage: StudyStage; enteredAt: number }[];
  ethics?: { approvalId?: string; irbId?: string; approvedAt?: number; status: 'not_submitted' | 'submitted' | 'approved' | 'rejected' | 'withdrawn' };
  fundingId?: string;
  participants: { participantId: string; enrolledAt: number }[];
  dataCollectionNotes?: string;
  analysisSummary?: string;
  knowledgeBaseEntry?: string;
}

// ── Ethics engine ──────────────────────────────────────────────────────────────

export interface EthicsSubmission {
  id: string;
  studyId: string;
  irbId: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: number;
  decidedAt?: number;
  consentTemplate?: string;
  participantRightsDocument?: string;
  protocolVersions: string[];
  amendments: { amendment: string; submittedAt: number; approvedAt?: number }[];
  adverseEvents: { event: string; reportedAt: number; severity: string; outcome?: string }[];
  monitoringReports: { report: string; at: number; by?: AmxUid }[];
  complianceNotes?: string;
}

// ── CRF Engine ─────────────────────────────────────────────────────────────────

export interface CrfField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'measurement';
  required: boolean;
  validation?: string;
  options?: string[];
}

export interface CrfForm {
  id: string;
  studyId: string;
  title: string;
  version: string;
  fields: CrfField[];
  purpose: 'randomized_trial' | 'registry' | 'cohort' | 'audit';
  validated: boolean;
  active: boolean;
}

// ── Dataset engine ─────────────────────────────────────────────────────────────

export type DatasetFormat =
  | 'fhir' | 'omop' | 'csv' | 'sql' | 'dicom' | 'genomics'
  | 'laboratory' | 'imaging' | 'wearables';

export interface Dataset {
  id: string;
  studyId: string;
  name: string;
  format: DatasetFormat;
  deidentified: boolean;
  recordCount: number;
  createdAt: number;
  schemaVersion?: string;
}

// ── Publication engine ─────────────────────────────────────────────────────────

export type PublicationStage =
  | 'abstract' | 'conference' | 'manuscript' | 'submitted'
  | 'peer_review' | 'published' | 'impact_tracked';

export interface Publication {
  id: string;
  studyId: string;
  title: string;
  authors: AmxUid[];
  stage: PublicationStage;
  abstract?: string;
  conference?: string;
  journal?: string;
  submittedAt?: number;
  publishedAt?: number;
  citations: number;
  impactFactor?: number;
}

// ── Grant engine ───────────────────────────────────────────────────────────────

export interface Grant {
  id: string;
  studyId?: string;
  title: string;
  funder: string;
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'awarded' | 'active' | 'completed' | 'rejected';
  budgetLines: { item: string; amount: number }[];
  milestones: { milestone: string; dueAt?: number; achievedAt?: number }[];
  reports: { report: string; submittedAt: number }[];
  deliverables: string[];
  financialAccountability: string[];
}

// ── AI research companion ──────────────────────────────────────────────────────

export type ResearchAiKind =
  | 'literature_review' | 'protocol_generation' | 'statistical_suggestions'
  | 'bias_detection' | 'writing_assistance' | 'meta_analysis' | 'evidence_synthesis';

export interface ResearchAiInsight {
  id: string;
  studyId?: string;
  kind: ResearchAiKind;
  output: string;
  confidence: number;
  generatedAt: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface ResearchModel {
  organizationId: string;
  facilityId?: string;
  chiefResearchOfficerId?: AmxUid;
  workspaces: ResearchWorkspace[];
  studies: Study[];
  ethicsSubmissions: EthicsSubmission[];
  crfForms: CrfForm[];
  datasets: Dataset[];
  publications: Publication[];
  grants: Grant[];
  aiInsights: ResearchAiInsight[];
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateResearchModelInput {
  organizationId: string;
  facilityId?: string;
  chiefResearchOfficerId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class ResearchEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateResearchModelInput): ResearchModel {
    if (!input.organizationId) throw new Error('[ResearchEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      chiefResearchOfficerId: input.chiefResearchOfficerId,
      workspaces: [],
      studies: [],
      ethicsSubmissions: [],
      crfForms: [],
      datasets: [],
      publications: [],
      grants: [],
      aiInsights: [],
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard & audit ─────────────────────────────────────────────

  static canResearchPerform(action: string): { allowed: boolean; reason?: string } {
    if (RESEARCH_AUTHORITY.includes(action)) return { allowed: true };
    if (RESEARCH_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        publish_without_ethics_approval: 'Publication requires ethics approval.',
        access_identified_patient_data: 'Research uses de-identified data unless consent permits otherwise.',
        override_constitutional_governance: 'Constitutional governance may not be overridden.',
        fabricate_data: 'Data fabrication is a constitutional violation.',
        share_data_outside_agreement: 'Data may only be shared under signed agreements.',
        modify_protocol_without_amendment: 'Protocol modifications require a formal amendment.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Research authority.` };
  }

  static guard(model: ResearchModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[ResearchEngine] actorId is required for research actions');
    const verdict = ResearchEngine.canResearchPerform(action);
    if (!verdict.allowed) throw new Error(`[ResearchEngine] ${verdict.reason}`);
  }

  static audit(model: ResearchModel, actorId: AmxUid | undefined, action: string, detail?: string): ResearchModel {
    const now = Date.now();
    const actor = actorId ?? model.chiefResearchOfficerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Research Workspace ───────────────────────────────────────────────────────

  static createWorkspace(model: ResearchModel, actorId: AmxUid | undefined, input: Omit<ResearchWorkspace, 'id' | 'createdAt' | 'active'>): { model: ResearchModel; workspace: ResearchWorkspace } {
    const workspace: ResearchWorkspace = { ...input, id: nextId('ws'), createdAt: Date.now(), active: true };
    return {
      model: { ...ResearchEngine.audit(model, actorId, 'workspace_created', input.kind), workspaces: [...model.workspaces, workspace], updatedAt: Date.now() },
      workspace,
    };
  }

  // ── Study lifecycle ──────────────────────────────────────────────────────────

  static createStudy(model: ResearchModel, actorId: AmxUid | undefined, input: { workspaceId?: string; title: string; protocolVersion: string; principalInvestigatorId: AmxUid }): { model: ResearchModel; study: Study } {
    ResearchEngine.guard(model, input.principalInvestigatorId, 'create_protocols');
    const study: Study = {
      id: nextId('st'),
      workspaceId: input.workspaceId,
      title: input.title,
      protocolVersion: input.protocolVersion,
      stage: 'idea',
      startedAt: Date.now(),
      stages: [{ stage: 'idea', enteredAt: Date.now() }],
      participants: [],
    };
    return {
      model: { ...ResearchEngine.audit(model, actorId, 'study_created', input.title), studies: [...model.studies, study], updatedAt: Date.now() },
      study,
    };
  }

  static advanceStudy(model: ResearchModel, studyId: string, nextStage: StudyStage): ResearchModel {
    const index = model.studies.findIndex(s => s.id === studyId);
    if (index === -1) throw new Error(`[ResearchEngine] Study "${studyId}" does not exist`);
    const current = model.studies[index];
    const updated = { ...current, stage: nextStage, stages: [...current.stages, { stage: nextStage, enteredAt: Date.now() }] };
    return { ...model, studies: [...model.studies.slice(0, index), updated, ...model.studies.slice(index + 1)], updatedAt: Date.now() };
  }

  static enrollParticipant(model: ResearchModel, studyId: string, participantId: string): ResearchModel {
    const index = model.studies.findIndex(s => s.id === studyId);
    if (index === -1) throw new Error(`[ResearchEngine] Study "${studyId}" does not exist`);
    const current = model.studies[index];
    if (current.participants.some(p => p.participantId === participantId)) return model;
    const updated = { ...current, participants: [...current.participants, { participantId, enrolledAt: Date.now() }] };
    return { ...model, studies: [...model.studies.slice(0, index), updated, ...model.studies.slice(index + 1)], updatedAt: Date.now() };
  }

  static recordAnalysis(model: ResearchModel, studyId: string, summary: string): ResearchModel {
    const index = model.studies.findIndex(s => s.id === studyId);
    if (index === -1) throw new Error(`[ResearchEngine] Study "${studyId}" does not exist`);
    const updated = { ...model.studies[index], analysisSummary: summary, stage: 'analysis' as const };
    return { ...model, studies: [...model.studies.slice(0, index), updated, ...model.studies.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Ethics Engine ────────────────────────────────────────────────────────────

  static submitEthics(model: ResearchModel, actorId: AmxUid | undefined, input: { studyId: string; irbId: string; consentTemplate?: string; participantRightsDocument?: string; protocolVersions: string[] }): { model: ResearchModel; submission: EthicsSubmission } {
    ResearchEngine.guard(model, actorId ?? model.chiefResearchOfficerId ?? ('' as AmxUid), 'submit_ethics');
    const submission: EthicsSubmission = { id: nextId('eth'), studyId: input.studyId, irbId: input.irbId, status: 'submitted', submittedAt: Date.now(), consentTemplate: input.consentTemplate, participantRightsDocument: input.participantRightsDocument, protocolVersions: input.protocolVersions, amendments: [], adverseEvents: [], monitoringReports: [] };
    const studyIndex = model.studies.findIndex(s => s.id === input.studyId);
    let studies = model.studies;
    if (studyIndex !== -1) {
      const study = { ...model.studies[studyIndex], stage: 'ethics' as const, ethics: { status: 'submitted' as const } };
      studies = [...model.studies.slice(0, studyIndex), study, ...model.studies.slice(studyIndex + 1)];
    }
    return {
      model: { ...ResearchEngine.audit(model, actorId, 'ethics_submitted', input.irbId), ethicsSubmissions: [...model.ethicsSubmissions, submission], studies, updatedAt: Date.now() },
      submission,
    };
  }

  static decideEthics(model: ResearchModel, submissionId: string, approved: boolean): ResearchModel {
    const index = model.ethicsSubmissions.findIndex(e => e.id === submissionId);
    if (index === -1) throw new Error(`[ResearchEngine] Ethics submission "${submissionId}" does not exist`);
    const current = model.ethicsSubmissions[index];
    const updated = { ...current, status: approved ? ('approved' as const) : ('rejected' as const), decidedAt: Date.now() };
    return { ...model, ethicsSubmissions: [...model.ethicsSubmissions.slice(0, index), updated, ...model.ethicsSubmissions.slice(index + 1)], updatedAt: Date.now() };
  }

  static recordAmendment(model: ResearchModel, submissionId: string, amendment: string): ResearchModel {
    const index = model.ethicsSubmissions.findIndex(e => e.id === submissionId);
    if (index === -1) throw new Error(`[ResearchEngine] Ethics submission "${submissionId}" does not exist`);
    const current = model.ethicsSubmissions[index];
    const updated = { ...current, amendments: [...current.amendments, { amendment, submittedAt: Date.now() }] };
    return { ...model, ethicsSubmissions: [...model.ethicsSubmissions.slice(0, index), updated, ...model.ethicsSubmissions.slice(index + 1)], updatedAt: Date.now() };
  }

  static reportAdverseEvent(model: ResearchModel, submissionId: string, event: string, severity: string): ResearchModel {
    const index = model.ethicsSubmissions.findIndex(e => e.id === submissionId);
    if (index === -1) throw new Error(`[ResearchEngine] Ethics submission "${submissionId}" does not exist`);
    const current = model.ethicsSubmissions[index];
    const updated = { ...current, adverseEvents: [...current.adverseEvents, { event, reportedAt: Date.now(), severity }] };
    return { ...model, ethicsSubmissions: [...model.ethicsSubmissions.slice(0, index), updated, ...model.ethicsSubmissions.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── CRF Engine ───────────────────────────────────────────────────────────────

  static createCrfForm(model: ResearchModel, actorId: AmxUid | undefined, input: Omit<CrfForm, 'id' | 'version' | 'validated' | 'active'>): { model: ResearchModel; form: CrfForm } {
    const form: CrfForm = { ...input, id: nextId('crf'), version: '1.0', validated: false, active: true };
    return {
      model: { ...ResearchEngine.audit(model, actorId, 'crf_created', input.title), crfForms: [...model.crfForms, form], updatedAt: Date.now() },
      form,
    };
  }

  static validateCrfForm(model: ResearchModel, formId: string): ResearchModel {
    const index = model.crfForms.findIndex(f => f.id === formId);
    if (index === -1) throw new Error(`[ResearchEngine] CRF form "${formId}" does not exist`);
    const updated = { ...model.crfForms[index], validated: true };
    return { ...model, crfForms: [...model.crfForms.slice(0, index), updated, ...model.crfForms.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Dataset Engine ───────────────────────────────────────────────────────────

  static createDataset(model: ResearchModel, actorId: AmxUid | undefined, input: Omit<Dataset, 'id' | 'createdAt'>): { model: ResearchModel; dataset: Dataset } {
    ResearchEngine.guard(model, actorId ?? model.chiefResearchOfficerId ?? ('' as AmxUid), 'manage_datasets');
    const dataset: Dataset = { ...input, id: nextId('ds'), createdAt: Date.now() };
    return {
      model: { ...ResearchEngine.audit(model, actorId, 'dataset_created', input.format), datasets: [...model.datasets, dataset], updatedAt: Date.now() },
      dataset,
    };
  }

  static getDeidentifiedDatasets(model: ResearchModel): Dataset[] {
    return model.datasets.filter(d => d.deidentified);
  }

  // ── Publication Engine ───────────────────────────────────────────────────────

  static createPublication(model: ResearchModel, actorId: AmxUid | undefined, input: { studyId: string; title: string; authors: AmxUid[]; abstract?: string }): { model: ResearchModel; publication: Publication } {
    ResearchEngine.guard(model, input.authors[0], 'publish_findings');
    const publication: Publication = { ...input, id: nextId('pub'), stage: 'abstract', citations: 0 };
    return {
      model: { ...ResearchEngine.audit(model, actorId, 'publication_created', input.title), publications: [...model.publications, publication], updatedAt: Date.now() },
      publication,
    };
  }

  static advancePublication(model: ResearchModel, publicationId: string, stage: PublicationStage): ResearchModel {
    const index = model.publications.findIndex(p => p.id === publicationId);
    if (index === -1) throw new Error(`[ResearchEngine] Publication "${publicationId}" does not exist`);
    const current = model.publications[index];
    const updated = { ...current, stage, publishedAt: stage === 'published' ? Date.now() : current.publishedAt, submittedAt: stage === 'submitted' ? Date.now() : current.submittedAt };
    return { ...model, publications: [...model.publications.slice(0, index), updated, ...model.publications.slice(index + 1)], updatedAt: Date.now() };
  }

  static recordCitation(model: ResearchModel, publicationId: string): ResearchModel {
    const index = model.publications.findIndex(p => p.id === publicationId);
    if (index === -1) throw new Error(`[ResearchEngine] Publication "${publicationId}" does not exist`);
    const updated = { ...model.publications[index], citations: model.publications[index].citations + 1 };
    return { ...model, publications: [...model.publications.slice(0, index), updated, ...model.publications.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Grant Engine ─────────────────────────────────────────────────────────────

  static createGrant(model: ResearchModel, actorId: AmxUid | undefined, input: Omit<Grant, 'id' | 'status'>): { model: ResearchModel; grant: Grant } {
    ResearchEngine.guard(model, actorId ?? model.chiefResearchOfficerId ?? ('' as AmxUid), 'manage_grants');
    const grant: Grant = { ...input, id: nextId('gr'), status: 'draft' };
    return {
      model: { ...ResearchEngine.audit(model, actorId, 'grant_created', input.title), grants: [...model.grants, grant], updatedAt: Date.now() },
      grant,
    };
  }

  static submitGrant(model: ResearchModel, grantId: string): ResearchModel {
    const index = model.grants.findIndex(g => g.id === grantId);
    if (index === -1) throw new Error(`[ResearchEngine] Grant "${grantId}" does not exist`);
    const updated = { ...model.grants[index], status: 'submitted' as const };
    return { ...model, grants: [...model.grants.slice(0, index), updated, ...model.grants.slice(index + 1)], updatedAt: Date.now() };
  }

  static awardGrant(model: ResearchModel, grantId: string): ResearchModel {
    const index = model.grants.findIndex(g => g.id === grantId);
    if (index === -1) throw new Error(`[ResearchEngine] Grant "${grantId}" does not exist`);
    const updated = { ...model.grants[index], status: 'awarded' as const };
    return { ...model, grants: [...model.grants.slice(0, index), updated, ...model.grants.slice(index + 1)], updatedAt: Date.now() };
  }

  static achieveGrantMilestone(model: ResearchModel, grantId: string, milestone: string): ResearchModel {
    const index = model.grants.findIndex(g => g.id === grantId);
    if (index === -1) throw new Error(`[ResearchEngine] Grant "${grantId}" does not exist`);
    const current = model.grants[index];
    const milestones = current.milestones.map(m => m.milestone === milestone ? { ...m, achievedAt: Date.now() } : m);
    const updated = { ...current, milestones };
    return { ...model, grants: [...model.grants.slice(0, index), updated, ...model.grants.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── AI Research Companion ────────────────────────────────────────────────────

  static aiResearchInsight(model: ResearchModel, kind: ResearchAiKind, context: string, studyId?: string): { model: ResearchModel; insight: ResearchAiInsight } {
    let output = context;
    switch (kind) {
      case 'literature_review':
        output = `Literature review summary generated for: ${context}`;
        break;
      case 'protocol_generation':
        output = `Draft protocol outline generated from: ${context}`;
        break;
      case 'statistical_suggestions':
        output = `Recommended statistical approach based on: ${context}`;
        break;
      case 'bias_detection':
        output = /confound|selection|recall|bias/i.test(context) ? `Potential bias patterns detected: ${context}` : 'No obvious bias patterns flagged.';
        break;
      case 'writing_assistance':
        output = `Writing assistance provided for: ${context}`;
        break;
      case 'meta_analysis':
        output = `Meta-analysis framing suggested for: ${context}`;
        break;
      case 'evidence_synthesis':
      default:
        output = `Evidence synthesis prepared for: ${context}`;
    }
    const insight: ResearchAiInsight = { id: nextId('rai'), studyId, kind, output, confidence: 0.7, generatedAt: Date.now() };
    return { model: { ...model, aiInsights: [...model.aiInsights, insight], updatedAt: Date.now() }, insight };
  }

  // ── Read conveniences / dashboard ────────────────────────────────────────────

  static getStudiesAtStage(model: ResearchModel, stage: StudyStage): Study[] {
    return model.studies.filter(s => s.stage === stage);
  }

  static getActiveStudies(model: ResearchModel): Study[] {
    return model.studies.filter(s => !['publication', 'knowledge_base'].includes(s.stage));
  }

  static getDashboardSummary(model: ResearchModel): {
    activeStudies: number;
    approvedEthics: number;
    enrolledParticipants: number;
    datasets: number;
    publications: number;
    grantsAwarded: number;
  } {
    return {
      activeStudies: ResearchEngine.getActiveStudies(model).length,
      approvedEthics: model.ethicsSubmissions.filter(e => e.status === 'approved').length,
      enrolledParticipants: model.studies.reduce((sum, s) => sum + s.participants.length, 0),
      datasets: model.datasets.length,
      publications: model.publications.filter(p => p.stage === 'published').length,
      grantsAwarded: model.grants.filter(g => g.status === 'awarded' || g.status === 'active' || g.status === 'completed').length,
    };
  }
}

export default ResearchEngine;
