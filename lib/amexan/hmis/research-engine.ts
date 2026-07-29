// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XIX: Research Engine
// Clinical trial management, research studies, patient enrollment, data collection.
// ═══════════════════════════════════════════════════════════════════════════════

export interface ResearchStudy {
  id: string;
  title: string;
  shortTitle: string;
  protocolNumber: string;
  phase: TrialPhase;
  status: StudyStatus;
  type: StudyType;
  principalInvestigator: string;
  principalInvestigatorId: string;
  sponsor: string;
  fundingSource: string;
  objectives: string[];
  endpoints: StudyEndpoint[];
  eligibilityCriteria: EligibilityCriteria;
  enrollmentTarget: number;
  enrolledCount: number;
  facilities: string[];
  departments: string[];
  ethicsApproval: EthicsApproval;
  startDate: string;
  endDate: string;
  duration: string;
  interventions: StudyIntervention[];
  arms: StudyArm[];
  dataPoints: DataPointDefinition[];
  publications: Publication[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export enum TrialPhase {
  Phase0 = 'phase_0',
  Phase1 = 'phase_1',
  Phase2 = 'phase_2',
  Phase3 = 'phase_3',
  Phase4 = 'phase_4',
  Observational = 'observational',
  Retrospective = 'retrospective',
  Prospective = 'prospective',
  CaseControl = 'case_control',
  Cohort = 'cohort',
  CrossSectional = 'cross_sectional',
  SystematicReview = 'systematic_review',
  MetaAnalysis = 'meta_analysis',
}

export enum StudyStatus {
  Planning = 'planning',
  Submitted = 'submitted',
  Approved = 'approved',
  Active = 'active',
  Enrolling = 'enrolling',
  ActiveNotEnrolling = 'active_not_enrolling',
  Completed = 'completed',
  Suspended = 'suspended',
  Terminated = 'terminated',
  Withdrawn = 'withdrawn',
  Published = 'published',
}

export enum StudyType {
  Interventional = 'interventional',
  Observational = 'observational',
  ExpandedAccess = 'expanded_access',
  Registry = 'registry',
  QualityImprovement = 'quality_improvement',
}

export interface StudyEndpoint {
  name: string;
  type: 'primary' | 'secondary' | 'exploratory';
  measure: string;
  timeFrame: string;
  description: string;
}

export interface EligibilityCriteria {
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  minAge: number;
  maxAge: number;
  allowedGenders: string[];
 健康状况?: string[];
  conditions: string[];
}

export interface EthicsApproval {
  board: string;
  approvalNumber: string;
  approvalDate: string;
  expiryDate: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired';
  documents: string[];
}

export interface StudyIntervention {
  name: string;
  type: 'drug' | 'procedure' | 'device' | 'behavioral' | 'biological' | 'other';
  description: string;
  dose?: string;
  frequency?: string;
  duration?: string;
}

export interface StudyArm {
  name: string;
  description: string;
  interventions: string[];
  targetEnrollment: number;
}

export interface DataPointDefinition {
  name: string;
  code: string;
  type: 'numeric' | 'categorical' | 'text' | 'date' | 'boolean' | 'file';
  required: boolean;
  collectionTimePoints: string[];
  unit?: string;
  options?: string[];
}

export interface StudyParticipant {
  id: string;
  studyId: string;
  patientId: string;
  patientIdentifier: string;
  enrollmentDate: number;
  arm: string;
  status: ParticipantStatus;
  consent: ConsentRecord;
  dataPoints: ParticipantDataPoint[];
  adverseEvents: AdverseEvent[];
  completionDate?: number;
  withdrawalReason?: string;
}

export enum ParticipantStatus {
  Screened = 'screened',
  Eligible = 'eligible',
  Enrolling = 'enrolling',
  Active = 'active',
  Completed = 'completed',
  Withdrawn = 'withdrawn',
  LostToFollowUp = 'lost_to_follow_up',
  Excluded = 'excluded',
  Deceased = 'deceased',
}

export interface ConsentRecord {
  obtained: boolean;
  consentDate?: number;
  consentVersion?: string;
  obtainedBy?: string;
  witnessedBy?: string;
  documentUrl?: string;
  withdrawnAt?: number;
  withdrawalReason?: string;
}

export interface ParticipantDataPoint {
  dataPointCode: string;
  value: unknown;
  collectedAt: number;
  collectedBy: string;
  timePoint: string;
}

export interface AdverseEvent {
  id: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'death';
  relationship: 'unrelated' | 'possibly' | 'probably' | 'definitely';
  onsetDate: string;
  resolutionDate?: string;
  action: 'none' | 'reduced_dose' | 'interrupted' | 'discontinued' | 'hospitalized';
  reported: boolean;
  reportedAt?: number;
}

export interface Publication {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  type: 'original_article' | 'review' | 'case_report' | 'abstract' | 'poster' | 'other';
  status: 'draft' | 'submitted' | 'under_review' | 'published' | 'rejected';
}

export interface ResearchStats {
  totalStudies: number;
  activeStudies: number;
  totalParticipants: number;
  enrollingStudies: number;
  completedStudies: number;
  publicationsCount: number;
  byPhase: Record<string, number>;
  byType: Record<string, number>;
}

export function getResearchStats(studies: ResearchStudy[], participants: StudyParticipant[]): ResearchStats {
  const byPhase: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const s of studies) {
    byPhase[s.phase] = (byPhase[s.phase] || 0) + 1;
    byType[s.type] = (byType[s.type] || 0) + 1;
  }
  return {
    totalStudies: studies.length,
    activeStudies: studies.filter(s => s.status === StudyStatus.Active || s.status === StudyStatus.Enrolling).length,
    totalParticipants: participants.length,
    enrollingStudies: studies.filter(s => s.status === StudyStatus.Enrolling).length,
    completedStudies: studies.filter(s => s.status === StudyStatus.Completed).length,
    publicationsCount: studies.reduce((s, st) => s + st.publications.length, 0),
    byPhase, byType,
  };
}
