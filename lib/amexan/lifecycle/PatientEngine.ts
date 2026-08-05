// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN PATIENT CENTER ENGINE (BOOK VIII — Center 2)
//
// The patient never belongs to the hospital. The hospital only owns encounters.
// The patient owns identity, consent, longitudinal journey, history, family,
// risk, follow-up, care network, education, and goals.
//
// The patient timeline (Birth → Vaccines → Clinic → Admissions → Operations →
// Pregnancies → Diseases → Follow-up → Death) is a lifetime record. Never reset.
//
// Stored in PostgreSQL (patients, demographics, contacts, insurance, consent,
// guardians, alerts) and Neo4j (Patient-Disease-Medication-Doctor-Hospital-Family-
// Research-Education graph).
//
// Pure and deterministic. Persistence is orchestrated by the conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type {
  ConsentRecord, FollowUpPlan, GuardianRecord, PatientAlert, PatientCenterModel,
  PatientContact, PatientEducationRecord, PatientGoal, PatientInsurance,
  PatientTimelineEvent,
} from './types';

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface CreatePatientCenterInput {
  patientId: string;
  personId: AmxUid;
  demographics: PatientCenterModel['demographics'];
  createdAt?: number;
}

export class PatientEngine {
  static create(input: CreatePatientCenterInput): PatientCenterModel {
    if (!input.patientId || !input.personId) throw new Error('[PatientEngine] patientId and personId are required');
    const now = input.createdAt ?? Date.now();
    return {
      patientId: input.patientId,
      personId: input.personId,
      demographics: input.demographics,
      contacts: [],
      insurance: [],
      consent: [],
      guardians: [],
      timeline: [],
      family: [],
      riskProfile: {},
      careNetwork: [],
      education: [],
      goals: [],
      alerts: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Demographics & contacts ──────────────────────────────────────────────────

  static updateDemographics(model: PatientCenterModel, patch: Partial<PatientCenterModel['demographics']>): PatientCenterModel {
    return { ...model, demographics: { ...model.demographics, ...patch }, updatedAt: Date.now() };
  }

  static addContact(model: PatientCenterModel, contact: Omit<PatientContact, 'id'>): PatientCenterModel {
    const contacts = contact.isPrimary ? model.contacts.map(c => ({ ...c, isPrimary: false })) : model.contacts;
    return { ...model, contacts: [...contacts, { ...contact, id: nextId('pc') }], updatedAt: Date.now() };
  }

  // ── Insurance ────────────────────────────────────────────────────────────────

  static addInsurance(model: PatientCenterModel, insurance: Omit<PatientInsurance, 'id'>): PatientCenterModel {
    return { ...model, insurance: [...model.insurance, { ...insurance, id: nextId('ins') }], updatedAt: Date.now() };
  }

  static deactivateInsurance(model: PatientCenterModel, insuranceId: string): PatientCenterModel {
    const insurance = model.insurance.map(i => (i.id === insuranceId ? { ...i, active: false } : i));
    return { ...model, insurance, updatedAt: Date.now() };
  }

  static getActiveInsurance(model: PatientCenterModel): PatientInsurance[] {
    const now = Date.now();
    return model.insurance.filter(i => i.active && i.validFrom <= now && i.validUntil >= now);
  }

  // ── Consent ──────────────────────────────────────────────────────────────────

  static grantConsent(model: PatientCenterModel, consent: Omit<ConsentRecord, 'id'>): PatientCenterModel {
    return { ...model, consent: [...model.consent, { ...consent, id: nextId('cons') }], updatedAt: Date.now() };
  }

  static revokeConsent(model: PatientCenterModel, consentId: string): PatientCenterModel {
    const consent = model.consent.map(c => (c.id === consentId ? { ...c, revokedAt: Date.now() } : c));
    return { ...model, consent, updatedAt: Date.now() };
  }

  static hasActiveConsent(model: PatientCenterModel, type: string): boolean {
    return model.consent.some(c => c.type === type && !c.revokedAt);
  }

  // ── Guardians ────────────────────────────────────────────────────────────────

  static addGuardian(model: PatientCenterModel, guardian: Omit<GuardianRecord, 'id'>): PatientCenterModel {
    return { ...model, guardians: [...model.guardians, { ...guardian, id: nextId('gd') }], updatedAt: Date.now() };
  }

  // ── Timeline (lifetime record) ───────────────────────────────────────────────

  static addTimelineEvent(model: PatientCenterModel, event: Omit<PatientTimelineEvent, 'id'>): PatientCenterModel {
    const timeline = [...model.timeline, { ...event, id: nextId('tl') }].sort((a, b) => a.at - b.at);
    return { ...model, timeline, updatedAt: Date.now() };
  }

  static getTimeline(model: PatientCenterModel): PatientTimelineEvent[] {
    return [...model.timeline].sort((a, b) => b.at - a.at);
  }

  // ── Family ───────────────────────────────────────────────────────────────────

  static addFamilyMember(model: PatientCenterModel, family: Omit<PatientCenterModel['family'][number], 'id'>): PatientCenterModel {
    return { ...model, family: [...model.family, { ...family, id: nextId('fam') }], updatedAt: Date.now() };
  }

  // ── Risk profile ─────────────────────────────────────────────────────────────

  static updateRiskProfile(model: PatientCenterModel, risks: Record<string, number>): PatientCenterModel {
    return { ...model, riskProfile: { ...model.riskProfile, ...risks }, updatedAt: Date.now() };
  }

  static getHighestRisks(model: PatientCenterModel, top = 5): { key: string; value: number }[] {
    return Object.entries(model.riskProfile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, top)
      .map(([key, value]) => ({ key, value }));
  }

  // ── Care network ─────────────────────────────────────────────────────────────

  static addToCareNetwork(model: PatientCenterModel, providerId: string): PatientCenterModel {
    if (model.careNetwork.includes(providerId)) return model;
    return { ...model, careNetwork: [...model.careNetwork, providerId], updatedAt: Date.now() };
  }

  // ── Follow-up plan ───────────────────────────────────────────────────────────

  static setFollowUpPlan(model: PatientCenterModel, plan: Omit<FollowUpPlan, 'id' | 'active'>): PatientCenterModel {
    const full: FollowUpPlan = { ...plan, id: nextId('fu'), active: true };
    return { ...model, followUpPlan: full, updatedAt: Date.now() };
  }

  static markFollowUpDue(model: PatientCenterModel, nextDueAt: number): PatientCenterModel {
    if (!model.followUpPlan) return model;
    return { ...model, followUpPlan: { ...model.followUpPlan, nextDueAt }, updatedAt: Date.now() };
  }

  static getDueFollowUps(model: PatientCenterModel): FollowUpPlan[] {
    const now = Date.now();
    if (model.followUpPlan && model.followUpPlan.active && model.followUpPlan.nextDueAt <= now) return [model.followUpPlan];
    return [];
  }

  // ── Education & goals ────────────────────────────────────────────────────────

  static recordEducation(model: PatientCenterModel, education: Omit<PatientEducationRecord, 'id'>): PatientCenterModel {
    return { ...model, education: [...model.education, { ...education, id: nextId('edu') }], updatedAt: Date.now() };
  }

  static addGoal(model: PatientCenterModel, goal: Omit<PatientGoal, 'id' | 'achieved'>): PatientCenterModel {
    return { ...model, goals: [...model.goals, { ...goal, id: nextId('goal'), achieved: false }], updatedAt: Date.now() };
  }

  static achieveGoal(model: PatientCenterModel, goalId: string): PatientCenterModel {
    const goals = model.goals.map(g => (g.id === goalId ? { ...g, achieved: true, achievedAt: Date.now() } : g));
    return { ...model, goals, updatedAt: Date.now() };
  }

  // ── Alerts ───────────────────────────────────────────────────────────────────

  static addAlert(model: PatientCenterModel, alert: Omit<PatientAlert, 'id' | 'active'>): PatientCenterModel {
    return { ...model, alerts: [...model.alerts, { ...alert, id: nextId('pal'), active: true }], updatedAt: Date.now() };
  }

  static resolveAlert(model: PatientCenterModel, alertId: string): PatientCenterModel {
    const alerts = model.alerts.map(a => (a.id === alertId ? { ...a, active: false } : a));
    return { ...model, alerts, updatedAt: Date.now() };
  }

  static getActiveAlerts(model: PatientCenterModel): PatientAlert[] {
    return model.alerts.filter(a => a.active).sort((a, b) => (a.severity === 'critical' ? -1 : 0) - (b.severity === 'critical' ? -1 : 0));
  }

  // ── Convenience ──────────────────────────────────────────────────────────────

  static getDashboardSummary(model: PatientCenterModel): {
    activeInsurance: number;
    activeAlerts: number;
    timelineEvents: number;
    goals: number;
    achievedGoals: number;
    dueFollowUp: boolean;
  } {
    return {
      activeInsurance: PatientEngine.getActiveInsurance(model).length,
      activeAlerts: PatientEngine.getActiveAlerts(model).length,
      timelineEvents: model.timeline.length,
      goals: model.goals.length,
      achievedGoals: model.goals.filter(g => g.achieved).length,
      dueFollowUp: PatientEngine.getDueFollowUps(model).length > 0,
    };
  }
}

export default PatientEngine;
