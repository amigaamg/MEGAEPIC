// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XVII: Universal Referral Engine
// Inter-facility and intra-facility referral workflows with full lifecycle.
// ═══════════════════════════════════════════════════════════════════════════════

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  encounterId: string;
  referralType: ReferralType;
  direction: ReferralDirection;
  status: ReferralStatus;
  priority: ReferralPriority;
  referringFacilityId: string;
  referringFacilityName: string;
  referringDepartmentId: string;
  referringProviderId: string;
  referringProviderName: string;
  receivingFacilityId: string;
  receivingFacilityName: string;
  receivingDepartmentId: string;
  receivingProviderId?: string;
  receivingProviderName?: string;
  reason: string;
  clinicalSummary: string;
  diagnosis?: string;
  investigations?: ReferralInvestigation[];
  attachments: ReferralAttachment[];
  urgency: ReferralUrgency;
  timeline: ReferralTimeline;
  consentObtained: boolean;
  feedback?: ReferralFeedback;
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export enum ReferralType {
  Clinical = 'clinical',
  Surgical = 'surgical',
  Diagnostic = 'diagnostic',
  Specialist = 'specialist',
  Emergency = 'emergency',
  Admission = 'admission',
  Transfer = 'transfer',
  Discharge = 'discharge',
  FollowUp = 'follow_up',
  Rehabilitation = 'rehabilitation',
  Palliative = 'palliative',
  HomeCare = 'home_care',
  MentalHealth = 'mental_health',
  Maternity = 'maternity',
  Neonatal = 'neonatal',
  Oncology = 'oncology',
  Cardiac = 'cardiac',
  SecondOpinion = 'second_opinion',
  Other = 'other',
}

export enum ReferralDirection {
  Internal = 'internal',
  External = 'external',
  Incoming = 'incoming',
  Outgoing = 'outgoing',
}

export enum ReferralStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Received = 'received',
  Accepted = 'accepted',
  Declined = 'declined',
  InProgress = 'in_progress',
  Completed = 'completed',
  Closed = 'closed',
  Cancelled = 'cancelled',
  OnHold = 'on_hold',
  Escalated = 'escalated',
}

export enum ReferralPriority {
  STAT = 'stat',
  Emergency = 'emergency',
  Urgent = 'urgent',
  Routine = 'routine',
  Elective = 'elective',
}

export enum ReferralUrgency {
  Immediate = 'immediate',
  Within24h = 'within_24h',
  Within72h = 'within_72h',
  Within1Week = 'within_1_week',
  Within1Month = 'within_1_month',
  AsScheduled = 'as_scheduled',
}

export interface ReferralInvestigation {
  type: string;
  summary: string;
  result?: string;
  attached: boolean;
}

export interface ReferralAttachment {
  id: string;
  type: 'document' | 'image' | 'lab_result' | 'imaging' | 'report' | 'other';
  name: string;
  url: string;
  uploadedAt: number;
  uploadedBy: string;
}

export interface ReferralTimeline {
  submittedAt?: number;
  receivedAt?: number;
  acceptedAt?: number;
  declinedAt?: number;
  declinedReason?: string;
  completedAt?: number;
  closedAt?: number;
  responseDueBy?: number;
}

export interface ReferralFeedback {
  rating: number;
  comments: string;
  timeliness: 'excellent' | 'good' | 'fair' | 'poor';
  outcome?: string;
  providedBy: string;
  providedAt: number;
}

export interface ReferralStats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  declined: number;
  byType: Record<string, number>;
  byDirection: Record<string, number>;
  averageAcceptanceTime: number;
  averageCompletionTime: number;
}

export function createReferral(params: {
  patientId: string; patientName: string; encounterId: string;
  referralType: ReferralType; direction: ReferralDirection;
  referringFacilityId: string; referringFacilityName: string;
  referringDepartmentId: string; referringProviderId: string; referringProviderName: string;
  receivingFacilityId: string; receivingFacilityName: string;
  receivingDepartmentId: string; reason: string; clinicalSummary: string;
  priority?: ReferralPriority; urgency?: ReferralUrgency;
}): Referral {
  const now = Date.now();
  return {
    id: `REF-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    patientId: params.patientId, patientName: params.patientName, encounterId: params.encounterId,
    referralType: params.referralType, direction: params.direction, status: ReferralStatus.Draft,
    priority: params.priority || ReferralPriority.Routine,
    referringFacilityId: params.referringFacilityId, referringFacilityName: params.referringFacilityName,
    referringDepartmentId: params.referringDepartmentId,
    referringProviderId: params.referringProviderId, referringProviderName: params.referringProviderName,
    receivingFacilityId: params.receivingFacilityId, receivingFacilityName: params.receivingFacilityName,
    receivingDepartmentId: params.receivingDepartmentId,
    reason: params.reason, clinicalSummary: params.clinicalSummary,
    urgency: params.urgency || ReferralUrgency.AsScheduled,
    investigations: [], attachments: [], consentObtained: false,
    timeline: { responseDueBy: now + 7 * 86400000 },
    metadata: {}, createdAt: now, updatedAt: now,
  };
}

export function submitReferral(referral: Referral): Referral {
  referral.status = ReferralStatus.Submitted;
  referral.timeline.submittedAt = Date.now();
  referral.updatedAt = Date.now();
  return referral;
}

export function acceptReferral(referral: Referral, providerId: string, providerName: string): Referral {
  referral.status = ReferralStatus.Accepted;
  referral.receivingProviderId = providerId;
  referral.receivingProviderName = providerName;
  referral.timeline.acceptedAt = Date.now();
  referral.updatedAt = Date.now();
  return referral;
}

export function declineReferral(referral: Referral, reason: string): Referral {
  referral.status = ReferralStatus.Declined;
  referral.timeline.declinedAt = Date.now();
  referral.timeline.declinedReason = reason;
  referral.updatedAt = Date.now();
  return referral;
}

export function completeReferral(referral: Referral): Referral {
  referral.status = ReferralStatus.Completed;
  referral.timeline.completedAt = Date.now();
  referral.updatedAt = Date.now();
  return referral;
}

export function getReferralStats(referrals: Referral[]): ReferralStats {
  const byType: Record<string, number> = {};
  const byDirection: Record<string, number> = {};
  for (const r of referrals) {
    byType[r.referralType] = (byType[r.referralType] || 0) + 1;
    byDirection[r.direction] = (byDirection[r.direction] || 0) + 1;
  }
  const accepted = referrals.filter(r => r.timeline.acceptedAt && r.timeline.submittedAt);
  const completed = referrals.filter(r => r.timeline.completedAt && r.timeline.submittedAt);
  const avgAccept = accepted.length > 0
    ? Math.round(accepted.reduce((s, r) => s + (r.timeline.acceptedAt! - r.timeline.submittedAt!), 0) / accepted.length / 3600000)
    : 0;
  const avgComplete = completed.length > 0
    ? Math.round(completed.reduce((s, r) => s + (r.timeline.completedAt! - r.timeline.submittedAt!), 0) / completed.length / 3600000)
    : 0;
  return {
    total: referrals.length,
    pending: referrals.filter(r => r.status === ReferralStatus.Submitted || r.status === ReferralStatus.Draft).length,
    accepted: referrals.filter(r => r.status === ReferralStatus.Accepted).length,
    completed: referrals.filter(r => r.status === ReferralStatus.Completed || r.status === ReferralStatus.Closed).length,
    declined: referrals.filter(r => r.status === ReferralStatus.Declined).length,
    byType, byDirection, averageAcceptanceTime: avgAccept, averageCompletionTime: avgComplete,
  };
}
