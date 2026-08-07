import { describe, it, expect } from 'vitest';
import {
  createEmptyPatientIdentity,
  computeTrustScore,
  determineVerificationLevel,
  upgradeVerificationLevel,
  linkPatientAccount,
  addClinicalIdentity,
  createSession,
  revokeSession,
  generateAmxpIdForTemp,
  mergeTempIdentity,
} from '../identity';
import {
  createJourney,
  addJourneyEvent,
  addMilestone,
  completeMilestone,
  addGoal,
  updateGoalProgress,
  addTask,
  completeTask,
  addCareTeamMember,
  addMonitoringParameter,
  addEducationModule,
  addAlert,
  acknowledgeAlert,
  setEmergencyPlan,
  initializeJourneyDefaults,
  getJourneyPriority,
  buildPatientDashboard,
  determineJourneyTypesFromConditions,
  generateWelcomeJourneys,
} from '../journey';
import {
  createRegistrationState,
  validateStage1,
  validateStage2,
  canAdvanceStage,
  getNextStage,
  getStageProgress,
  isRegistrationComplete,
  generateTempPatientId,
} from '../registration';
import {
  createCareService,
  transitionService,
  addServiceRequirement,
  setServiceBilling,
  addServiceCommunication,
  setServiceOutcome,
  setServiceFeedback,
  getServiceProgress,
  getPatientFacingStatus,
  getBundlesForJourney,
  estimateBundleCost,
} from '../care-service';
import {
  addFamilyMember,
  removeFamilyMember,
  getDefaultPermissionsForRelationship,
  canAccessPatientData,
  getEmergencyContacts,
  createFamilyTree,
} from '../family';
import {
  generateAmxpId,
  isValidAmxpId,
} from '../types';
import type { AmxpId } from '../types';

const PHONE = '0700000000';

function makeIdentity(amxpId?: AmxpId) {
  return createEmptyPatientIdentity(amxpId);
}

describe('PatientConstitution — Layer 1 · Lifetime Identity (AmxpId)', () => {
  it('generates a valid permanent AmxpId and a valid temp AmxpId', () => {
    const id = generateAmxpId('patient');
    expect(isValidAmxpId(id)).toBe(true);
    expect(id).toMatch(/^AMXPID-/);
    const temp = generateAmxpId('temp');
    expect(isValidAmxpId(temp)).toBe(true);
    expect(temp).toMatch(/^TEMP-/);
  });

  it('rejects malformed AmxpIds', () => {
    expect(isValidAmxpId('AMXPID-2025-A')).toBe(false);
    expect(isValidAmxpId('patient-2025-ABCDEFGH')).toBe(false);
  });

  it('creates an empty identity at verification level 0 (Anonymous)', () => {
    const identity = makeIdentity();
    expect(identity.verification.level).toBe(0);
    expect(identity.trust.score).toBe(0);
    expect(identity.clinical).toEqual([]);
    expect(identity.linkedAccounts).toEqual([]);
  });

  it('verification level escalates monotonically with evidence', () => {
    let identity = makeIdentity();
    upgradeVerificationLevel(identity, 1);
    expect(determineVerificationLevel(identity)).toBe(1);
    upgradeVerificationLevel(identity, 2);
    expect(determineVerificationLevel(identity)).toBe(2);
    upgradeVerificationLevel(identity, 3);
    expect(determineVerificationLevel(identity)).toBe(3);
    upgradeVerificationLevel(identity, 4);
    expect(identity.verification.level).toBe(4);
  });

  it('trust score reflects evidence and caps at 100', () => {
    const identity = makeIdentity();
    upgradeVerificationLevel(identity, 4);
    addClinicalIdentity(identity, {
      facilityId: 'f1', facilityName: 'F1', mrn: 'M1',
      encounterNumbers: [], linkedSince: Date.now(), isActive: true,
    });
    const score = computeTrustScore(identity);
    expect(score).toBeGreaterThanOrEqual(60);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('temp identities are mergeable into a permanent one', () => {
    const temp = generateAmxpIdForTemp();
    const permanent = generateAmxpId('patient');
    const res = mergeTempIdentity(temp, permanent);
    expect(res.merged).toBe(true);
    const bad = mergeTempIdentity(permanent, permanent);
    expect(bad.merged).toBe(false);
  });

  it('sessions are single-current and revocable', () => {
    const identity = makeIdentity();
    createSession(identity.authentication, {
      id: 's1', deviceName: 'Phone', deviceType: 'mobile',
      ip: '1.1.1.1', lastActivity: Date.now(), expiresAt: Date.now() + 1e6,
    });
    createSession(identity.authentication, {
      id: 's2', deviceName: 'Tablet', deviceType: 'tablet',
      ip: '2.2.2.2', lastActivity: Date.now(), expiresAt: Date.now() + 1e6,
    });
    const current = identity.authentication.sessions.filter((s) => s.isCurrent);
    expect(current).toHaveLength(1);
    expect(current[0].id).toBe('s2');
    revokeSession(identity.authentication, 's2');
    expect(identity.authentication.sessions).toHaveLength(1);
  });
});

describe('PatientConstitution — Layer 3 · Clinical Identity per facility', () => {
  it('links the same patient across facilities with distinct MRNs', () => {
    const identity = makeIdentity();
    addClinicalIdentity(identity, {
      facilityId: 'fac-a', facilityName: 'A', mrn: 'MRN-A',
      encounterNumbers: ['E1'], linkedSince: Date.now(), isActive: true,
    });
    addClinicalIdentity(identity, {
      facilityId: 'fac-b', facilityName: 'B', mrn: 'MRN-B',
      encounterNumbers: [], linkedSince: Date.now(), isActive: true,
    });
    expect(identity.clinical).toHaveLength(2);
    expect(identity.clinical.map((c) => c.facilityId)).toEqual(['fac-a', 'fac-b']);
  });
});

describe('PatientConstitution — Journeys', () => {
  it('creates an active journey with an id', () => {
    const journey = createJourney({ type: 'hypertension', title: 'My BP' });
    expect(journey.id).toMatch(/^journey-/);
    expect(journey.status).toBe('active');
    expect(journey.priority).toBe('medium');
  });

  it('initializes protocol defaults for pregnancy (milestones, monitoring)', () => {
    const journey = createJourney({ type: 'pregnancy', title: 'Pregnancy' });
    initializeJourneyDefaults(journey);
    expect(journey.milestones.length).toBeGreaterThanOrEqual(9);
    expect(journey.monitoring.some((m) => m.name === 'Fundal Height')).toBe(true);
    expect(journey.tasks.some((t) => t.title.includes('iron'))).toBe(true);
  });

  it('adds, completes and tracks a milestone', () => {
    const journey = createJourney({ type: 'tb', title: 'TB' });
    initializeJourneyDefaults(journey);
    const first = journey.milestones[0];
    completeMilestone(journey, first.id);
    expect(first.status).toBe('completed');
    expect(first.completedAt).toBeTruthy();
  });

  it('updates goal progress and escalates status', () => {
    const journey = createJourney({ type: 'diabetes', title: 'DM' });
    initializeJourneyDefaults(journey);
    const goal = journey.goals[0];
    updateGoalProgress(journey, goal.id, '6.8%', 100);
    expect(goal.status).toBe('achieved');
    updateGoalProgress(journey, goal.id, '8.0%', 20);
    expect(goal.status).toBe('off_track');
  });

  it('supports tasks, alerts, care team, monitoring and emergency plan', () => {
    const journey = createJourney({ type: 'other', title: 'J' });
    const task = { title: 'Take meds', type: 'medication' as const, status: 'pending' as const };
    addTask(journey, task);
    completeTask(journey, journey.tasks[0].id);
    expect(journey.tasks[0].status).toBe('completed');

    addAlert(journey, { type: 'warning', title: 'W', message: 'M' });
    acknowledgeAlert(journey, journey.alerts[0].id);
    expect(journey.alerts[0].status).toBe('acknowledged');

    addCareTeamMember(journey, { id: 'ct1', name: 'Dr X', role: 'Physician', isPrimary: true, isActive: true });
    expect(journey.careTeam).toHaveLength(1);

    addMonitoringParameter(journey, { name: 'BP', unit: 'mmHg', frequency: 'daily', targetMax: 130, targetMin: 80 });
    expect(journey.monitoring[0].trend).toBe('unknown');
    expect(journey.monitoring[0].readings).toEqual([]);

    addEducationModule(journey, { title: 'E', type: 'article', category: 'c' });
    expect(journey.education[0].progress).toBe(0);

    setEmergencyPlan(journey, { conditions: ['x'], instructions: ['y'], medications: [], contacts: [], allergies: [] });
    expect(journey.emergencyPlan).toBeTruthy();
  });

  it('derives journey priority from clinical risk', () => {
    expect(getJourneyPriority('heart_failure', 'active')).toBe('critical');
    expect(getJourneyPriority('pregnancy', 'active')).toBe('high');
    expect(getJourneyPriority('hypertension', 'active')).toBe('medium');
    expect(getJourneyPriority('hypertension', 'completed')).toBe('low');
  });

  it('maps free-text conditions to journey types', () => {
    const types = determineJourneyTypesFromConditions(['Diabetes', 'Pregnancy']);
    expect(types).toContain('diabetes');
    expect(types).toContain('pregnancy');
  });

  it('generates welcome journeys incl. child health for young patients', () => {
    const journeys = generateWelcomeJourneys({
      sex: 'female', dateOfBirth: '2024-01-01', conditions: [],
    });
    expect(journeys.length).toBeGreaterThan(0);
    expect(journeys.some((j) => j.type === 'child')).toBe(true);
  });

  it('builds a patient dashboard with health score and activity', () => {
    const journey = createJourney({ type: 'hypertension', title: 'BP', priority: 'high' });
    initializeJourneyDefaults(journey);
    addJourneyEvent(journey, { type: 'diagnosis', title: 'Dx', date: Date.now() });
    const dash = buildPatientDashboard({
      amxpId: generateAmxpId('patient'),
      fullName: 'Jane Doe',
      journeys: [journey],
      verificationLevel: 2,
    });
    expect(dash.greeting).toContain('Jane Doe');
    expect(dash.activeTasks).toBeGreaterThan(0);
    expect(dash.healthScore).toBeGreaterThanOrEqual(0);
    expect(dash.healthScore).toBeLessThanOrEqual(100);
  });
});

describe('PatientConstitution — Registration flow', () => {
  it('enforces per-stage validation', () => {
    const state = createRegistrationState('self');
    state.data.stage1.email = 'not-an-email';
    const v1 = validateStage1(state.data.stage1);
    expect(v1.email).toBeTruthy();
    expect(canAdvanceStage(state).canAdvance).toBe(false);

    state.data.stage1.email = 'jane@example.com';
    expect(canAdvanceStage(state).canAdvance).toBe(true);

    state.stage = 1;
    const v2 = validateStage2(state.data.stage2);
    expect(v2.fullName).toBeTruthy();
    expect(canAdvanceStage(state).canAdvance).toBe(false);
  });

  it('advances stages and reports completion', () => {
    let stage = 0 as 0 | 1 | 2 | 3 | 4 | 5;
    expect(getNextStage(stage)).toBe(1);
    expect(isRegistrationComplete(4)).toBe(false);
    expect(isRegistrationComplete(5)).toBe(true);
    expect(getStageProgress(5)).toBe(100);
  });

  it('produces temp ids for emergency/guest registration', () => {
    const temp = generateTempPatientId();
    expect(temp).toMatch(/^TEMP-/);
  });
});

describe('PatientConstitution — Care Services', () => {
  const amxpId = generateAmxpId('patient');

  it('creates a service in requested state with a full workflow', () => {
    const svc = createCareService({
      type: 'physical_consultation', title: 'Consult',
      patientAmxpId: amxpId, providerId: 'p1', providerName: 'Dr X',
      providerType: 'hospital', facilityId: 'f1', facilityName: 'F1',
    });
    expect(svc.status).toBe('requested');
    expect(svc.workflow).toHaveLength(10);
  });

  it('moves forward through the lifecycle and blocks regression', () => {
    const svc = createCareService({
      type: 'physical_consultation', title: 'Consult',
      patientAmxpId: amxpId, providerId: 'p1', providerName: 'Dr X',
      providerType: 'hospital', facilityId: 'f1', facilityName: 'F1',
    });
    transitionService(svc, 'eligibility_checked');
    transitionService(svc, 'scheduled');
    expect(svc.status).toBe('scheduled');
    const before = svc.status;
    transitionService(svc, 'requested'); // regression blocked
    expect(svc.status).toBe(before);
    expect(getServiceProgress(svc)).toBeGreaterThan(0);
    expect(getPatientFacingStatus(svc)).toContain('scheduled');
  });

  it('handles cancellation and failure as terminal states', () => {
    const svc = createCareService({
      type: 'diagnostic_lab', title: 'Lab',
      patientAmxpId: amxpId, providerId: 'p1', providerName: 'Lab A',
      providerType: 'laboratory', facilityId: 'f1', facilityName: 'F1',
    });
    transitionService(svc, 'cancelled');
    expect(svc.status).toBe('cancelled');
    expect(getServiceProgress(svc)).toBe(0);
  });

  it('accumulates requirements, billing, communications and outcome', () => {
    const svc = createCareService({
      type: 'pharmacy', title: 'Dispense',
      patientAmxpId: amxpId, providerId: 'p1', providerName: 'Pharm A',
      providerType: 'pharmacy', facilityId: 'f1', facilityName: 'F1',
    });
    addServiceRequirement(svc, { name: 'Prescription', met: true });
    setServiceBilling(svc, {
      estimatedCost: 1000, currency: 'KES', insuranceCovered: 700,
      patientContribution: 300, paymentStatus: 'paid',
    });
    addServiceCommunication(svc, { type: 'confirmation', channel: 'sms' });
    setServiceOutcome(svc, { documents: [], followUpRequired: false, outcomeDate: Date.now() });
    setServiceFeedback(svc, { rating: 5, submittedAt: Date.now(), anonymous: false });
    expect(svc.requirements).toHaveLength(1);
    expect(svc.billing?.paymentStatus).toBe('paid');
    expect(svc.feedback?.rating).toBe(5);
  });

  it('returns care bundles for a journey type', () => {
    const bundles = getBundlesForJourney('pregnancy');
    expect(bundles.some((b) => b.id === 'pregnancy-bundle')).toBe(true);
    expect(estimateBundleCost(bundles[0], 'level_3')).toBe(bundles[0].totalEstimatedCost);
  });
});

describe('PatientConstitution — Family & Permissions', () => {
  it('grants default permissions by relationship and full access to parents/guardians', () => {
    const parentPerms = getDefaultPermissionsForRelationship('mother');
    expect(parentPerms).toContain('full_access');
    const childPerms = getDefaultPermissionsForRelationship('child');
    expect(childPerms).not.toContain('full_access');
  });

  it('adds/removes family members and enforces permission checks', () => {
    const identity = makeIdentity();
    const sonId = generateAmxpId('patient');
    addFamilyMember(identity, { amxpId: sonId, relationship: 'son', fullName: 'Kid' });
    expect(canAccessPatientData(identity.linkedAccounts, sonId, 'receive_notifications').allowed).toBe(true);
    expect(canAccessPatientData(identity.linkedAccounts, sonId, 'view_labs').allowed).toBe(false);
    removeFamilyMember(identity, sonId);
    expect(identity.linkedAccounts).toHaveLength(0);
  });

  it('builds a family tree with labels', () => {
    const identity = makeIdentity();
    const spouseId = generateAmxpId('patient');
    addFamilyMember(identity, { amxpId: spouseId, relationship: 'spouse', fullName: 'Partner' });
    const tree = createFamilyTree(identity);
    expect(tree).toHaveLength(1);
    expect(tree[0].relationshipLabel).toBe('Spouse');
  });

  it('collects emergency contacts from family + explicit emergency contact', () => {
    const identity = makeIdentity();
    identity.human.emergencyContact = { name: 'Mum', relationship: 'Mother', phone: PHONE };
    const contacts = getEmergencyContacts(identity);
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts[0].name).toBe('Mum');
  });
});

describe('PatientConstitution — one identity, many facilities (constitutional rule)', () => {
  it('a person keeps a single AmxpId across employments of clinical identity', () => {
    const identity = makeIdentity();
    addClinicalIdentity(identity, {
      facilityId: 'fac-1', facilityName: 'F1', mrn: '0001',
      encounterNumbers: [], linkedSince: Date.now(), isActive: true,
    });
    addClinicalIdentity(identity, {
      facilityId: 'fac-2', facilityName: 'F2', mrn: '0002',
      encounterNumbers: [], linkedSince: Date.now(), isActive: true,
    });
    // MRNs differ, AmxpId is unchanged and unique.
    expect(identity.amxpId).toBeTruthy();
    expect(new Set(identity.clinical.map((c) => c.mrn)).size).toBe(2);
    expect(identity.clinical.every((c) => c.facilityId !== identity.amxpId)).toBe(true);
  });

  it('links a family account and escalates trust', () => {
    const identity = makeIdentity();
    const other = generateAmxpId('patient');
    linkPatientAccount(identity, {
      amxpId: other, relationship: 'mother', fullName: 'Mom',
      permissions: ['view_appointments', 'emergency_access'],
      linkedSince: Date.now(), isActive: true,
    });
    expect(identity.linkedAccounts).toHaveLength(1);
    expect(identity.trust.score).toBeGreaterThan(0);
  });
});
