import {
  type AmxpId,
  type JourneyObject,
  type JourneyType,
  type JourneyStatus,
  type JourneyPriority,
  type JourneyEvent,
  type Milestone,
  type HealthGoal,
  type JourneyTask,
  type CareTeamMember,
  type MonitoringParameter,
  type EducationModule,
  type JourneyAlert,
  type EmergencyPlan,
  type PatientDashboardConfig,
  type PatientQuickAction,
  type PatientVerificationLevel,
  generateAmxpId,
  VERIFICATION_LABELS,
} from './types';

export function createJourney(params: {
  type: JourneyType;
  title: string;
  description?: string;
  diagnosedAt?: number;
  diagnosedBy?: string;
  diagnosedAtFacility?: string;
  priority?: JourneyPriority;
}): JourneyObject {
  const now = Date.now();
  return {
    id: `journey-${now.toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type: params.type,
    title: params.title,
    description: params.description,
    status: 'active',
    priority: params.priority || 'medium',
    diagnosedAt: params.diagnosedAt,
    diagnosedBy: params.diagnosedBy,
    diagnosedAtFacility: params.diagnosedAtFacility,
    timeline: [],
    milestones: [],
    goals: [],
    tasks: [],
    careTeam: [],
    appointments: [],
    medications: [],
    investigations: [],
    monitoring: [],
    education: [],
    alerts: [],
    documents: [],
    notes: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addJourneyEvent(journey: JourneyObject, event: Omit<JourneyEvent, 'id'>): JourneyObject {
  journey.timeline.push({
    ...event,
    id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
  });
  journey.updatedAt = Date.now();
  return journey;
}

export function addMilestone(journey: JourneyObject, milestone: Omit<Milestone, 'id'>): JourneyObject {
  journey.milestones.push({
    ...milestone,
    id: `ms-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
  });
  journey.updatedAt = Date.now();
  return journey;
}

export function completeMilestone(journey: JourneyObject, milestoneId: string): JourneyObject {
  const ms = journey.milestones.find(m => m.id === milestoneId);
  if (ms) {
    ms.status = 'completed';
    ms.completedAt = Date.now();
  }
  journey.updatedAt = Date.now();
  return journey;
}

export function addGoal(journey: JourneyObject, goal: Omit<HealthGoal, 'id'>): JourneyObject {
  journey.goals.push({
    ...goal,
    id: `goal-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
  });
  journey.updatedAt = Date.now();
  return journey;
}

export function updateGoalProgress(journey: JourneyObject, goalId: string, current: string, progress: number): JourneyObject {
  const goal = journey.goals.find(g => g.id === goalId);
  if (goal) {
    goal.current = current;
    goal.progress = progress;
    if (progress >= 100) goal.status = 'achieved';
    else if (progress >= 75) goal.status = 'on_track';
    else if (progress >= 40) goal.status = 'needs_attention';
    else goal.status = 'off_track';
  }
  journey.updatedAt = Date.now();
  return journey;
}

export function addTask(journey: JourneyObject, task: Omit<JourneyTask, 'id'>): JourneyObject {
  journey.tasks.push({
    ...task,
    id: `task-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
  });
  journey.updatedAt = Date.now();
  return journey;
}

export function completeTask(journey: JourneyObject, taskId: string): JourneyObject {
  const task = journey.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'completed';
    task.completedAt = Date.now();
  }
  journey.updatedAt = Date.now();
  return journey;
}

export function addCareTeamMember(journey: JourneyObject, member: CareTeamMember): JourneyObject {
  journey.careTeam.push(member);
  journey.updatedAt = Date.now();
  return journey;
}

export function addMonitoringParameter(journey: JourneyObject, param: Omit<MonitoringParameter, 'id' | 'readings' | 'trend' | 'lastValue' | 'lastRecorded'>): JourneyObject {
  journey.monitoring.push({
    ...param,
    id: `mon-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    lastValue: undefined,
    lastRecorded: undefined,
    trend: 'unknown',
    readings: [],
  });
  journey.updatedAt = Date.now();
  return journey;
}

export function addEducationModule(journey: JourneyObject, module: Omit<EducationModule, 'id' | 'completed' | 'completedAt' | 'progress'>): JourneyObject {
  journey.education.push({
    ...module,
    id: `edu-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    completed: false,
    progress: 0,
  });
  journey.updatedAt = Date.now();
  return journey;
}

export function addAlert(journey: JourneyObject, alert: Omit<JourneyAlert, 'id' | 'createdAt' | 'status'>): JourneyObject {
  journey.alerts.push({
    ...alert,
    id: `alert-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
    status: 'active',
  });
  journey.updatedAt = Date.now();
  return journey;
}

export function acknowledgeAlert(journey: JourneyObject, alertId: string): JourneyObject {
  const alert = journey.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'acknowledged';
    alert.acknowledgedAt = Date.now();
  }
  return journey;
}

export function setEmergencyPlan(journey: JourneyObject, plan: EmergencyPlan): JourneyObject {
  journey.emergencyPlan = plan;
  journey.updatedAt = Date.now();
  return journey;
}

function getDefaultMilestonesForJourney(type: JourneyType): Omit<Milestone, 'id'>[] {
  const pregnancyMilestones: Omit<Milestone, 'id'>[] = [
    { title: 'First ANC Visit', status: 'pending', order: 1, targetDate: undefined },
    { title: 'Dating Scan (8-12 weeks)', status: 'pending', order: 2 },
    { title: 'Quickening (18-20 weeks)', status: 'pending', order: 3 },
    { title: 'Anatomy Scan (18-22 weeks)', status: 'pending', order: 4 },
    { title: 'Glucose Challenge (24-28 weeks)', status: 'pending', order: 5 },
    { title: 'Third Trimester (28 weeks)', status: 'pending', order: 6 },
    { title: 'Birth Plan Review (32-34 weeks)', status: 'pending', order: 7 },
    { title: 'Delivery Ready (36+ weeks)', status: 'pending', order: 8 },
    { title: 'Delivery', status: 'pending', order: 9 },
    { title: 'Postnatal Check (6 weeks)', status: 'pending', order: 10 },
  ];
  const diabetesMilestones: Omit<Milestone, 'id'>[] = [
    { title: 'Initial Assessment', status: 'pending', order: 1 },
    { title: 'HbA1c Target Set', status: 'pending', order: 2 },
    { title: 'Lifestyle Plan Established', status: 'pending', order: 3 },
    { title: 'Medication Optimized', status: 'pending', order: 4 },
    { title: 'Foot Examination', status: 'pending', order: 5 },
    { title: 'Eye Examination', status: 'pending', order: 6 },
    { title: 'Kidney Function Check', status: 'pending', order: 7 },
    { title: '3-Month Review', status: 'pending', order: 8 },
    { title: 'Annual Review', status: 'pending', order: 9 },
  ];
  const htnMilestones: Omit<Milestone, 'id'>[] = [
    { title: 'Initial Diagnosis', status: 'pending', order: 1 },
    { title: 'Lifestyle Modifications Started', status: 'pending', order: 2 },
    { title: 'Medication Initiated', status: 'pending', order: 3 },
    { title: 'BP Target Achieved', status: 'pending', order: 4 },
    { title: 'Target Organ Assessment', status: 'pending', order: 5 },
    { title: '3-Month Review', status: 'pending', order: 6 },
    { title: 'Annual Review', status: 'pending', order: 7 },
  ];
  const asthmaMilestones: Omit<Milestone, 'id'>[] = [
    { title: 'Diagnosis Confirmed', status: 'pending', order: 1 },
    { title: 'Peak Flow Baseline', status: 'pending', order: 2 },
    { title: 'Inhaler Technique Checked', status: 'pending', order: 3 },
    { title: 'Trigger Identification', status: 'pending', order: 4 },
    { title: 'Asthma Action Plan', status: 'pending', order: 5 },
    { title: '3-Month Review', status: 'pending', order: 6 },
    { title: 'Annual Review', status: 'pending', order: 7 },
  ];
  const infantMilestones: Omit<Milestone, 'id'>[] = [
    { title: 'Birth', status: 'pending', order: 1 },
    { title: 'BCG + OPV (Birth)', status: 'pending', order: 2 },
    { title: '6-Week Check', status: 'pending', order: 3 },
    { title: 'Pentavalent 1 (6 weeks)', status: 'pending', order: 4 },
    { title: 'Pentavalent 2 (10 weeks)', status: 'pending', order: 5 },
    { title: 'Pentavalent 3 (14 weeks)', status: 'pending', order: 6 },
    { title: 'Measles 1 (9 months)', status: 'pending', order: 7 },
    { title: 'Measles 2 (18 months)', status: 'pending', order: 8 },
    { title: 'Developmental Assessment', status: 'pending', order: 9 },
  ];
  const tbMilestones: Omit<Milestone, 'id'>[] = [
    { title: 'Diagnosis Confirmed', status: 'pending', order: 1 },
    { title: 'Treatment Initiated', status: 'pending', order: 2 },
    { title: '2-Month Review (Intensive Phase Complete)', status: 'pending', order: 3 },
    { title: 'Sputum Conversion Check', status: 'pending', order: 4 },
    { title: '4-Month Review', status: 'pending', order: 5 },
    { title: '6-Month Review (Treatment Complete)', status: 'pending', order: 6 },
    { title: 'Cure Confirmed', status: 'pending', order: 7 },
  ];

  switch (type) {
    case 'pregnancy': case 'antenatal': return pregnancyMilestones;
    case 'diabetes': return diabetesMilestones;
    case 'hypertension': return htnMilestones;
    case 'asthma': return asthmaMilestones;
    case 'newborn': case 'infant': return infantMilestones;
    case 'tb': return tbMilestones;
    default: return [
      { title: 'Assessment Complete', status: 'pending', order: 1 },
      { title: 'Care Plan Established', status: 'pending', order: 2 },
      { title: 'First Follow-up', status: 'pending', order: 3 },
    ];
  }
}

function getDefaultMonitoringForJourney(type: JourneyType): Omit<MonitoringParameter, 'id' | 'readings' | 'trend' | 'lastValue' | 'lastRecorded'>[] {
  const shared = [
    { name: 'Blood Pressure', unit: 'mmHg', frequency: 'daily' as const, targetMax: 120, targetMin: 70, criticalMax: 180, criticalMin: 60 },
    { name: 'Heart Rate', unit: 'bpm', frequency: 'daily' as const, targetMin: 60, targetMax: 100 },
    { name: 'Temperature', unit: '°C', frequency: 'daily' as const, targetMin: 36, targetMax: 37.5 },
    { name: 'Weight', unit: 'kg', frequency: 'weekly' as const },
  ];
  if (type === 'hypertension') {
    return [
      { name: 'Blood Pressure', unit: 'mmHg', frequency: 'daily', targetMax: 130, targetMin: 80, criticalMax: 180, criticalMin: 60 },
      { name: 'Heart Rate', unit: 'bpm', frequency: 'daily', targetMin: 60, targetMax: 100 },
      { name: 'Weight', unit: 'kg', frequency: 'weekly' },
    ];
  }
  if (type === 'diabetes') {
    return [
      { name: 'Fasting Blood Sugar', unit: 'mmol/L', frequency: 'daily', targetMin: 4, targetMax: 7, criticalMin: 3, criticalMax: 15 },
      { name: 'Postprandial Blood Sugar', unit: 'mmol/L', frequency: 'daily', targetMax: 10 },
      { name: 'HbA1c', unit: '%', frequency: 'monthly', targetMax: 7 },
      { name: 'Weight', unit: 'kg', frequency: 'weekly' },
    ];
  }
  if (type === 'pregnancy' || type === 'antenatal') {
    return [
      { name: 'Blood Pressure', unit: 'mmHg', frequency: 'weekly', targetMax: 140, targetMin: 90 },
      { name: 'Weight', unit: 'kg', frequency: 'weekly' },
      { name: 'Fundal Height', unit: 'cm', frequency: 'monthly' },
      { name: 'Fetal Heart Rate', unit: 'bpm', frequency: 'monthly', targetMin: 110, targetMax: 160 },
      { name: 'Kick Counts', unit: 'kicks/day', frequency: 'daily', targetMin: 10 },
    ];
  }
  if (type === 'asthma') {
    return [
      { name: 'Peak Flow', unit: 'L/min', frequency: 'daily' },
      { name: 'Symptom Score', unit: '0-10', frequency: 'daily' },
      { name: 'Reliever Use', unit: 'puffs/day', frequency: 'daily' },
    ];
  }
  if (type === 'heart_failure') {
    return [
      { name: 'Weight', unit: 'kg', frequency: 'daily' },
      { name: 'Blood Pressure', unit: 'mmHg', frequency: 'daily', targetMax: 130, targetMin: 80 },
      { name: 'Heart Rate', unit: 'bpm', frequency: 'daily', targetMin: 60, targetMax: 100 },
      { name: 'SpO₂', unit: '%', frequency: 'daily', targetMin: 94 },
      { name: 'Pedal Edema', unit: '0-3+', frequency: 'daily' },
    ];
  }
  return shared;
}

function getDefaultGoalsForJourney(type: JourneyType): Omit<HealthGoal, 'id'>[] {
  if (type === 'hypertension') return [
    { metric: 'Blood Pressure', target: '<130/80 mmHg', status: 'not_set', progress: 0 },
    { metric: 'Exercise', target: '150 min/week', status: 'not_set', progress: 0 },
    { metric: 'BMI', target: '<25', status: 'not_set', progress: 0 },
    { metric: 'Salt Intake', target: '<5g/day', status: 'not_set', progress: 0 },
  ];
  if (type === 'diabetes') return [
    { metric: 'HbA1c', target: '<7%', status: 'not_set', progress: 0 },
    { metric: 'Fasting Blood Sugar', target: '4-7 mmol/L', status: 'not_set', progress: 0 },
    { metric: 'Exercise', target: '150 min/week', status: 'not_set', progress: 0 },
    { metric: 'Weight', target: 'BMI <25', status: 'not_set', progress: 0 },
  ];
  if (type === 'pregnancy' || type === 'antenatal') return [
    { metric: 'ANC Visits', target: '8 visits', status: 'not_set', progress: 0 },
    { metric: 'Weight Gain', target: '10-15 kg total', status: 'not_set', progress: 0 },
    { metric: 'Vaccinations', target: 'Tetanus complete', status: 'not_set', progress: 0 },
    { metric: 'Iron Supplement', target: 'Daily', status: 'not_set', progress: 0 },
  ];
  return [
    { metric: 'Treatment Adherence', target: '>90%', status: 'not_set', progress: 0 },
    { metric: 'Follow-up Compliance', target: 'All scheduled visits', status: 'not_set', progress: 0 },
  ];
}

function getDefaultAlertsForJourney(type: JourneyType): Omit<JourneyAlert, 'id' | 'createdAt' | 'status'>[] {
  if (type === 'pregnancy' || type === 'antenatal') return [
    { type: 'warning', title: 'Danger Signs', message: 'Watch for severe headache, blurred vision, vaginal bleeding, reduced fetal movements.' },
    { type: 'info', title: 'Nutrition', message: 'Ensure adequate iron, folate, and calcium intake.' },
  ];
  if (type === 'diabetes') return [
    { type: 'danger', title: 'Hypoglycemia Warning', message: 'If blood sugar < 4 mmol/L, take fast-acting sugar immediately.' },
    { type: 'warning', title: 'Foot Care', message: 'Check feet daily for cuts, blisters, or swelling.' },
  ];
  if (type === 'asthma') return [
    { type: 'danger', title: 'Asthma Attack Plan', message: 'If peak flow drops below 60%, use reliever and seek emergency care.' },
  ];
  if (type === 'hypertension') return [
    { type: 'danger', title: 'Hypertensive Emergency', message: 'If BP > 180/120, seek immediate medical attention.' },
  ];
  return [];
}

function getDefaultTasksForJourney(type: JourneyType): Omit<JourneyTask, 'id'>[] {
  const medTask: Omit<JourneyTask, 'id'> = { title: 'Take medications as prescribed', type: 'medication', status: 'pending', recurrence: 'daily' };
  const followUp: Omit<JourneyTask, 'id'> = { title: 'Attend follow-up appointment', type: 'appointment', status: 'pending' };
  if (type === 'pregnancy' || type === 'antenatal') return [
    { title: 'Take daily iron and folate', type: 'medication', status: 'pending', recurrence: 'daily' },
    { title: 'Monitor fetal movements', type: 'monitoring', status: 'pending', recurrence: 'daily' },
    { title: 'Attend next ANC visit', type: 'appointment', status: 'pending' },
    { title: 'Complete antenatal education module', type: 'education', status: 'pending' },
  ];
  if (type === 'diabetes') return [
    { title: 'Check blood sugar (fasting)', type: 'monitoring', status: 'pending', recurrence: 'daily' },
    { title: 'Take diabetes medication', type: 'medication', status: 'pending', recurrence: 'daily' },
    { title: 'Check feet for any changes', type: 'monitoring', status: 'pending', recurrence: 'daily' },
    { title: 'Exercise for 30 minutes', type: 'exercise', status: 'pending', recurrence: 'daily' },
  ];
  return [medTask, followUp];
}

export function initializeJourneyDefaults(journey: JourneyObject): JourneyObject {
  const milestones = getDefaultMilestonesForJourney(journey.type);
  milestones.forEach(m => addMilestone(journey, m));

  const goals = getDefaultGoalsForJourney(journey.type);
  goals.forEach(g => addGoal(journey, g));

  const tasks = getDefaultTasksForJourney(journey.type);
  tasks.forEach(t => addTask(journey, t));

  const monitoring = getDefaultMonitoringForJourney(journey.type);
  monitoring.forEach(m => addMonitoringParameter(journey, m));

  const alerts = getDefaultAlertsForJourney(journey.type);
  alerts.forEach(a => addAlert(journey, a));

  return journey;
}

export function getJourneyPriority(type: JourneyType, status: JourneyStatus, diagnosedAt?: number): JourneyPriority {
  if (status !== 'active') return 'low';
  const criticalTypes: JourneyType[] = ['cancer', 'oncology', 'heart_failure', 'palliative'];
  const highTypes: JourneyType[] = ['pregnancy', 'antenatal', 'newborn', 'hiv', 'tb', 'surgical', 'post_operative', 'ckd', 'mental_health', 'depression'];
  if (criticalTypes.includes(type)) return 'critical';
  if (highTypes.includes(type)) return 'high';
  return 'medium';
}

export function buildPatientDashboard(params: {
  amxpId: AmxpId;
  fullName: string;
  journeys: JourneyObject[];
  verificationLevel: PatientVerificationLevel;
}): PatientDashboardConfig {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const activeJourneys = params.journeys.filter(j => j.status === 'active');
  const allTasks = activeJourneys.flatMap(j => j.tasks.filter(t => t.status === 'pending' || t.status === 'overdue'));
  const allAlerts = activeJourneys.flatMap(j => j.alerts.filter(a => a.status === 'active'));

  const recentActivity: JourneyEvent[] = params.journeys
    .flatMap(j => j.timeline)
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  const totalMeds = allTasks.filter(t => t.type === 'medication').length;
  const totalApps = allTasks.filter(t => t.type === 'appointment').length;
  const totalMonitoring = allTasks.filter(t => t.type === 'monitoring').length;
  const totalEducation = allTasks.filter(t => t.type === 'education').length;
  const totalInvestigations = allTasks.filter(t => t.type === 'investigation').length;

  const quickActions: PatientQuickAction[] = [
    { id: 'book-appointment', label: 'Book Appointment', icon: 'Calendar', link: '/dashboard/patient/book', requiresContext: false },
    { id: 'telemedicine', label: 'Video Consultation', icon: 'Video', link: '/dashboard/patient/telemedicine', requiresContext: false },
    { id: 'upload-report', label: 'Upload Report', icon: 'Upload', link: '/dashboard/patient/upload', requiresContext: true },
    { id: 'refill', label: 'Refill Medication', icon: 'Pill', link: '/dashboard/patient/medication', requiresContext: true },
    { id: 'sos', label: 'Emergency SOS', icon: 'AlertTriangle', link: '/emergency', requiresContext: false },
  ];

  return {
    amxpId: params.amxpId,
    greeting: `${greeting} ${params.fullName}`,
    healthScore: computeHealthScore(params.journeys),
    activeTasks: allTasks.length,
    alerts: allAlerts,
    journeys: activeJourneys,
    careServices: [],
    familyMembers: [],
    todaysCare: {
      medications: totalMeds,
      investigations: totalInvestigations,
      monitoring: totalMonitoring,
      appointments: totalApps,
      education: totalEducation,
    },
    recentActivity,
    quickActions,
  };
}

function computeHealthScore(journeys: JourneyObject[]): number {
  if (journeys.length === 0) return 95;
  let score = 100;
  for (const journey of journeys) {
    const overdueTasks = journey.tasks.filter(t => t.status === 'overdue').length;
    const activeAlerts = journey.alerts.filter(a => a.status === 'active' && a.type === 'danger').length;
    score -= overdueTasks * 3;
    score -= activeAlerts * 10;
    if (journey.priority === 'critical') score -= 15;
    if (journey.priority === 'high') score -= 8;
    const goalsAchieved = journey.goals.filter(g => g.status === 'achieved').length;
    const totalGoals = journey.goals.length;
    if (totalGoals > 0) score += (goalsAchieved / totalGoals) * 5;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function determineJourneyTypesFromConditions(conditions: string[]): JourneyType[] {
  const map: Record<string, JourneyType> = {
    'pregnancy': 'pregnancy',
    'hypertension': 'hypertension',
    'high blood pressure': 'hypertension',
    'diabetes': 'diabetes',
    'diabetes mellitus': 'diabetes',
    'asthma': 'asthma',
    'copd': 'copd',
    'heart failure': 'heart_failure',
    'ckd': 'ckd',
    'chronic kidney disease': 'ckd',
    'hiv': 'hiv',
    'tb': 'tb',
    'tuberculosis': 'tb',
    'cancer': 'cancer',
    'depression': 'depression',
    'mental health': 'mental_health',
  };
  const types = new Set<JourneyType>();
  for (const condition of conditions) {
    const key = condition.toLowerCase().trim();
    if (map[key]) types.add(map[key]);
  }
  return Array.from(types);
}

export function generateWelcomeJourneys(params: {
  sex: string;
  dateOfBirth: string;
  conditions: string[];
}): JourneyObject[] {
  const journeys: JourneyObject[] = [];
  const age = calculateAge(params.dateOfBirth);
  const journeyTypes = determineJourneyTypesFromConditions(params.conditions);

  for (const type of journeyTypes) {
    const journey = createJourney({
      type,
      title: getJourneyTitle(type),
      diagnosedAt: Date.now(),
    });
    initializeJourneyDefaults(journey);
    journeys.push(journey);
  }

  if (params.sex === 'female' && age >= 12 && age <= 55) {
    const pregnancy = journeys.find(j => j.type === 'pregnancy' || j.type === 'antenatal');
    if (!pregnancy) {
      const wellness = createJourney({
        type: 'preventive',
        title: 'Wellness & Prevention',
        priority: 'low',
      });
      initializeJourneyDefaults(wellness);
      journeys.push(wellness);
    }
  }

  if (age <= 5) {
    const childJourney = createJourney({
      type: 'child',
      title: 'Child Health & Vaccinations',
    });
    initializeJourneyDefaults(childJourney);
    journeys.push(childJourney);
  }

  if (journeys.length === 0) {
    const wellness = createJourney({
      type: 'preventive',
      title: 'Wellness & Prevention',
      priority: 'low',
    });
    initializeJourneyDefaults(wellness);
    journeys.push(wellness);
  }

  return journeys;
}

function getJourneyTitle(type: JourneyType): string {
  const titles: Record<JourneyType, string> = {
    pregnancy: 'My Pregnancy Journey',
    newborn: 'My Newborn Care',
    infant: 'My Infant Health',
    child: 'My Child Health',
    hypertension: 'My Blood Pressure Management',
    diabetes: 'My Diabetes Care',
    asthma: 'My Asthma Management',
    copd: 'My COPD Care',
    heart_failure: 'My Heart Failure Management',
    ckd: 'My Kidney Health',
    hiv: 'My HIV Care',
    tb: 'My TB Treatment',
    cancer: 'My Cancer Journey',
    oncology: 'My Oncology Care',
    mental_health: 'My Mental Health',
    depression: 'My Depression Care',
    surgical: 'My Surgical Recovery',
    post_operative: 'My Post-Operative Care',
    recovery: 'My Recovery Journey',
    rehabilitation: 'My Rehabilitation',
    acute_illness: 'My Recovery',
    preventive: 'My Wellness & Prevention',
    wellness: 'My Wellness Journey',
    vaccination: 'My Vaccination Record',
    antenatal: 'My Antenatal Care',
    postnatal: 'My Postnatal Care',
    chronic_disease: 'My Chronic Care',
    palliative: 'My Palliative Care',
    other: 'My Health Journey',
  };
  return titles[type] || 'My Health Journey';
}

function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
