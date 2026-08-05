// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Quality Engine (BOOK VI-P · Constitutional Engine No. 26)
//
// "The Engine of Continuous Improvement"
//
// Quality is continuously measured — not inspected at the end.
//
// The engine governs: quality indicators (mortality, morbidity, SSI, HAIs,
// medication errors, readmissions, documentation quality, patient satisfaction,
// waiting times, guideline adherence, accreditation readiness), the audit
// engine, the KPI engine, and the accreditation engine with automatic gap
// analysis.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Constitutional authority / restriction tables ──────────────────────────────

export const QUALITY_AUTHORITY: readonly string[] = [
  'conduct_audits', 'record_quality_indicators', 'report_incidents',
  'view_kpi_dashboards', 'run_accreditation_gap_analysis', 'recommend_improvements',
  'coordinate_accreditation', 'lead_quality_governance', 'access_audit_trails',
  'publish_quality_reports',
];

export const QUALITY_RESTRICTIONS: readonly string[] = [
  'punish_staff_without_due_process', 'falsify_quality_data',
  'override_constitutional_governance', 'disclose_identified_incident_data',
  'modify_clinical_documentation', 'skew_kpi_targets',
];

// ── Quality indicator ──────────────────────────────────────────────────────────

export type QualityIndicatorName =
  | 'mortality' | 'morbidity' | 'ssi' | 'hais' | 'medication_errors'
  | 'readmissions' | 'documentation_quality' | 'patient_satisfaction'
  | 'waiting_times' | 'guideline_adherence' | 'accreditation_readiness';

export interface QualityIndicator {
  name: QualityIndicatorName;
  value: number;
  target: number;
  period: string;
  unit: 'rate' | 'count' | 'percentage' | 'minutes' | 'score';
  trend: 'improving' | 'stable' | 'deteriorating';
  measuredAt: number;
  recordedBy?: AmxUid;
}

// ── Incident (event) ───────────────────────────────────────────────────────────

export type IncidentSeverity = 'near_miss' | 'minor' | 'moderate' | 'major' | 'sentinel';

export interface Incident {
  id: string;
  type: 'clinical' | 'medication' | 'falls' | 'infection' | 'device' | 'operational' | 'patient_safety' | 'other';
  severity: IncidentSeverity;
  description: string;
  occurredAt: number;
  reportedAt: number;
  reportedBy: AmxUid;
  involvedPatientId?: string;
  actions: string[];
  status: 'open' | 'under_review' | 'closed';
  closedAt?: number;
}

// ── Audit engine ───────────────────────────────────────────────────────────────

export type AuditDomain =
  | 'clinical' | 'department' | 'nursing' | 'laboratory' | 'radiology'
  | 'pharmacy' | 'financial' | 'operational';

export interface Audit {
  id: string;
  domain: AuditDomain;
  title: string;
  scope: string;
  criteria: { criterion: string; passed: boolean; evidence?: string }[];
  findings: { finding: string; severity: 'minor' | 'major' | 'critical'; recommendation?: string }[];
  status: 'planned' | 'in_progress' | 'completed';
  scheduledAt: number;
  completedAt?: number;
  conductedBy: AmxUid;
}

// ── KPI engine ─────────────────────────────────────────────────────────────────

export type KpiLevel = 'hospital' | 'department' | 'clinician' | 'nursing' | 'laboratory' | 'radiology' | 'executive';

export interface Kpi {
  id: string;
  level: KpiLevel;
  name: string;
  value: number;
  target: number;
  unit: string;
  measuredAt: number;
  dashboard: string;
}

// ── Accreditation engine ───────────────────────────────────────────────────────

export type AccreditationStandard =
  | 'jci' | 'iso' | 'national' | 'cohsasa' | 'teaching' | 'laboratory';

export interface AccreditationRequirement {
  id: string;
  standard: AccreditationStandard;
  requirement: string;
  met: boolean;
  gapNotes?: string;
}

export interface AccreditationRun {
  id: string;
  standard: AccreditationStandard;
  startedAt: number;
  completedAt?: number;
  requirements: AccreditationRequirement[];
  gapAnalysis: { met: number; unmet: number; overallPercent: number };
  status: 'in_progress' | 'completed';
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface QualityModel {
  organizationId: string;
  facilityId?: string;
  chiefQualityOfficerId?: AmxUid;
  indicators: QualityIndicator[];
  incidents: Incident[];
  audits: Audit[];
  kpis: Kpi[];
  accreditationRuns: AccreditationRun[];
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateQualityModelInput {
  organizationId: string;
  facilityId?: string;
  chiefQualityOfficerId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Gap analysis ───────────────────────────────────────────────────────────────

export function analyzeGap(requirements: AccreditationRequirement[]): { met: number; unmet: number; overallPercent: number } {
  const met = requirements.filter(r => r.met).length;
  const unmet = requirements.length - met;
  const overallPercent = requirements.length > 0 ? Math.round((met / requirements.length) * 100) : 0;
  return { met, unmet, overallPercent };
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class QualityEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateQualityModelInput): QualityModel {
    if (!input.organizationId) throw new Error('[QualityEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      chiefQualityOfficerId: input.chiefQualityOfficerId,
      indicators: [],
      incidents: [],
      audits: [],
      kpis: [],
      accreditationRuns: [],
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard & audit ─────────────────────────────────────────────

  static canQualityPerform(action: string): { allowed: boolean; reason?: string } {
    if (QUALITY_AUTHORITY.includes(action)) return { allowed: true };
    if (QUALITY_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        punish_staff_without_due_process: 'Staff accountability requires due process.',
        falsify_quality_data: 'Quality data must never be falsified.',
        override_constitutional_governance: 'Constitutional governance may not be overridden.',
        disclose_identified_incident_data: 'Incident data is shared only in de-identified or permitted form.',
        modify_clinical_documentation: 'Clinical documentation may not be modified by quality.',
        skew_kpi_targets: 'KPI targets may not be artificially adjusted.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Quality authority.` };
  }

  static guard(model: QualityModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[QualityEngine] actorId is required for quality actions');
    const verdict = QualityEngine.canQualityPerform(action);
    if (!verdict.allowed) throw new Error(`[QualityEngine] ${verdict.reason}`);
  }

  static audit(model: QualityModel, actorId: AmxUid | undefined, action: string, detail?: string): QualityModel {
    const now = Date.now();
    const actor = actorId ?? model.chiefQualityOfficerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Quality indicator engine ─────────────────────────────────────────────────

  static recordIndicator(model: QualityModel, actorId: AmxUid | undefined, input: Omit<QualityIndicator, 'measuredAt' | 'trend'>): { model: QualityModel; indicator: QualityIndicator } {
    QualityEngine.guard(model, actorId ?? model.chiefQualityOfficerId ?? ('' as AmxUid), 'record_quality_indicators');
    const previous = model.indicators
      .filter(i => i.name === input.name && i.period === input.period)
      .sort((a, b) => b.measuredAt - a.measuredAt)[0];
    const trend: QualityIndicator['trend'] = !previous ? 'stable' : Math.abs(input.value - previous.value) < 0.001 ? 'stable' : input.value < previous.value && (input.unit === 'rate' || input.unit === 'count' || input.unit === 'minutes') ? 'improving' : input.value > previous.value && (input.unit === 'percentage' || input.unit === 'score') ? 'improving' : 'deteriorating';
    const indicator: QualityIndicator = { ...input, trend, measuredAt: Date.now() };
    return {
      model: { ...QualityEngine.audit(model, actorId, 'quality_indicator_recorded', input.name), indicators: [...model.indicators, indicator], updatedAt: Date.now() },
      indicator,
    };
  }

  static getIndicator(model: QualityModel, name: QualityIndicatorName): QualityIndicator | undefined {
    return model.indicators.filter(i => i.name === name).sort((a, b) => b.measuredAt - a.measuredAt)[0];
  }

  static getUnderperformingIndicators(model: QualityModel): QualityIndicator[] {
    return model.indicators
      .filter(i => i.unit === 'rate' || i.unit === 'count' || i.unit === 'minutes' ? i.value > i.target : i.value < i.target);
  }

  // ── Incident reporting ───────────────────────────────────────────────────────

  static reportIncident(model: QualityModel, actorId: AmxUid | undefined, input: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy' | 'status'> & { reportedBy: AmxUid }): { model: QualityModel; incident: Incident } {
    QualityEngine.guard(model, input.reportedBy, 'report_incidents');
    const incident: Incident = { ...input, id: nextId('inc'), reportedAt: Date.now(), status: 'open' };
    return {
      model: { ...QualityEngine.audit(model, actorId, 'incident_reported', input.severity), incidents: [...model.incidents, incident], updatedAt: Date.now() },
      incident,
    };
  }

  static closeIncident(model: QualityModel, incidentId: string, actions: string[]): QualityModel {
    const index = model.incidents.findIndex(i => i.id === incidentId);
    if (index === -1) throw new Error(`[QualityEngine] Incident "${incidentId}" does not exist`);
    const updated = { ...model.incidents[index], actions, status: 'closed' as const, closedAt: Date.now() };
    return { ...model, incidents: [...model.incidents.slice(0, index), updated, ...model.incidents.slice(index + 1)], updatedAt: Date.now() };
  }

  static getOpenIncidents(model: QualityModel, severity?: IncidentSeverity): Incident[] {
    return model.incidents.filter(i => i.status !== 'closed' && (!severity || i.severity === severity));
  }

  // ── Audit engine ─────────────────────────────────────────────────────────────

  static createAudit(model: QualityModel, actorId: AmxUid | undefined, input: Omit<Audit, 'id' | 'status' | 'findings' | 'criteria'> & { criteria: Audit['criteria'] }): { model: QualityModel; audit: Audit } {
    QualityEngine.guard(model, input.conductedBy, 'conduct_audits');
    const audit: Audit = { ...input, id: nextId('aud'), findings: [], status: 'planned' };
    return {
      model: { ...QualityEngine.audit(model, actorId, 'audit_planned', input.domain), audits: [...model.audits, audit], updatedAt: Date.now() },
      audit,
    };
  }

  static completeAudit(model: QualityModel, auditId: string, findings: Audit['findings']): { model: QualityModel; audit: Audit; score: number } {
    const index = model.audits.findIndex(a => a.id === auditId);
    if (index === -1) throw new Error(`[QualityEngine] Audit "${auditId}" does not exist`);
    const criteria = model.audits[index].criteria;
    const passed = criteria.filter(c => c.passed).length;
    const score = criteria.length > 0 ? Math.round((passed / criteria.length) * 100) : 0;
    const updated: Audit = { ...model.audits[index], findings, status: 'completed', completedAt: Date.now() };
    return {
      model: { ...QualityEngine.audit(model, model.audits[index].conductedBy, 'audit_completed', auditId), audits: [...model.audits.slice(0, index), updated, ...model.audits.slice(index + 1)], updatedAt: Date.now() },
      audit: updated,
      score,
    };
  }

  // ── KPI engine ───────────────────────────────────────────────────────────────

  static recordKpi(model: QualityModel, actorId: AmxUid | undefined, input: Omit<Kpi, 'id' | 'measuredAt'>): { model: QualityModel; kpi: Kpi } {
    QualityEngine.guard(model, actorId ?? model.chiefQualityOfficerId ?? ('' as AmxUid), 'view_kpi_dashboards');
    const kpi: Kpi = { ...input, id: nextId('kpi'), measuredAt: Date.now() };
    return {
      model: { ...QualityEngine.audit(model, actorId, 'kpi_recorded', input.name), kpis: [...model.kpis, kpi], updatedAt: Date.now() },
      kpi,
    };
  }

  static getKpisByLevel(model: QualityModel, level: KpiLevel): Kpi[] {
    return model.kpis.filter(k => k.level === level);
  }

  static getExecutiveKpis(model: QualityModel): Kpi[] {
    return model.kpis.filter(k => k.level === 'executive' || k.level === 'hospital');
  }

  // ── Accreditation engine ─────────────────────────────────────────────────────

  static startAccreditation(model: QualityModel, actorId: AmxUid | undefined, standard: AccreditationStandard, requirements: string[]): { model: QualityModel; run: AccreditationRun } {
    QualityEngine.guard(model, actorId ?? model.chiefQualityOfficerId ?? ('' as AmxUid), 'run_accreditation_gap_analysis');
    const now = Date.now();
    const run: AccreditationRun = {
      id: nextId('acc'),
      standard,
      startedAt: now,
      requirements: requirements.map(r => ({ id: nextId('req'), standard, requirement: r, met: false })),
      gapAnalysis: { met: 0, unmet: requirements.length, overallPercent: 0 },
      status: 'in_progress',
    };
    return {
      model: { ...QualityEngine.audit(model, actorId, 'accreditation_started', standard), accreditationRuns: [...model.accreditationRuns, run], updatedAt: now },
      run,
    };
  }

  static markRequirementMet(model: QualityModel, runId: string, requirementId: string, met: boolean, gapNotes?: string): QualityModel {
    const runIndex = model.accreditationRuns.findIndex(r => r.id === runId);
    if (runIndex === -1) throw new Error(`[QualityEngine] Accreditation run "${runId}" does not exist`);
    const run = model.accreditationRuns[runIndex];
    const reqIndex = run.requirements.findIndex(r => r.id === requirementId);
    if (reqIndex === -1) throw new Error(`[QualityEngine] Requirement "${requirementId}" does not exist`);
    const requirements = run.requirements.map((r, i) => i === reqIndex ? { ...r, met, gapNotes } : r);
    const updatedRun = { ...run, requirements, gapAnalysis: analyzeGap(requirements) };
    return {
      ...model,
      accreditationRuns: [...model.accreditationRuns.slice(0, runIndex), updatedRun, ...model.accreditationRuns.slice(runIndex + 1)],
      updatedAt: Date.now(),
    };
  }

  static completeAccreditation(model: QualityModel, runId: string): QualityModel {
    const runIndex = model.accreditationRuns.findIndex(r => r.id === runId);
    if (runIndex === -1) throw new Error(`[QualityEngine] Accreditation run "${runId}" does not exist`);
    const updatedRun = { ...model.accreditationRuns[runIndex], status: 'completed' as const, completedAt: Date.now() };
    return {
      ...model,
      accreditationRuns: [...model.accreditationRuns.slice(0, runIndex), updatedRun, ...model.accreditationRuns.slice(runIndex + 1)],
      updatedAt: Date.now(),
    };
  }

  static getAccreditationGap(model: QualityModel, standard: AccreditationStandard): AccreditationRun | undefined {
    return model.accreditationRuns.filter(r => r.standard === standard).sort((a, b) => b.startedAt - a.startedAt)[0];
  }

  // ── Read conveniences / dashboard ────────────────────────────────────────────

  static getDashboardSummary(model: QualityModel): {
    openIncidents: number;
    openAudits: number;
    underperformingIndicators: number;
    accreditationProgress: { standard: AccreditationStandard; percent: number }[];
    kpiCount: number;
  } {
    return {
      openIncidents: model.incidents.filter(i => i.status !== 'closed').length,
      openAudits: model.audits.filter(a => a.status !== 'completed').length,
      underperformingIndicators: QualityEngine.getUnderperformingIndicators(model).length,
      accreditationProgress: model.accreditationRuns.map(r => ({ standard: r.standard, percent: r.gapAnalysis.overallPercent })),
      kpiCount: model.kpis.length,
    };
  }
}

export default QualityEngine;
