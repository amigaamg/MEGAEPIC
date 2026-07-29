// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CONSTITUTION — Book II: Universal Experience & Ecosystem
// Defines every actor, journey, UI contract, permission lens, workflow, and
// presentation rule. No UI component may contain medical reasoning.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Ecosystem Actors ───────────────────────────────────────────────────────────
// Every human or system that interacts with AMEXAN.

export type ActorId =
  | 'patient' | 'doctor' | 'nurse' | 'student' | 'resident' | 'consultant'
  | 'pharmacist' | 'lab_technician' | 'radiologist' | 'midwife'
  | 'community_health_worker' | 'administrator' | 'hospital_ceo'
  | 'finance_officer' | 'insurance_adjuster' | 'researcher'
  | 'educator' | 'regulator' | 'family_member' | 'developer'
  | 'ai_agent' | 'system';

export interface ActorDefinition {
  id: ActorId;
  label: string;
  description: string;
  defaultJourney: JourneyId;
  permissions: string[];
  lenses: string[];
  educationLevel: 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';
}

export const ACTORS: Record<ActorId, ActorDefinition> = {
  doctor: {
    id: 'doctor', label: 'Doctor', description: 'Licensed medical practitioner',
    defaultJourney: 'clinical_care', permissions: ['read:all', 'write:clinical', 'write:orders', 'write:diagnosis'],
    lenses: ['diagnostic', 'management', 'documentation'], educationLevel: 'expert',
  },
  resident: {
    id: 'resident', label: 'Resident', description: 'Medical resident in training',
    defaultJourney: 'clinical_care', permissions: ['read:all', 'write:clinical', 'write:orders'],
    lenses: ['diagnostic', 'learning', 'documentation'], educationLevel: 'advanced',
  },
  consultant: {
    id: 'consultant', label: 'Consultant', description: 'Senior consultant physician',
    defaultJourney: 'clinical_care', permissions: ['read:all', 'write:clinical', 'write:orders', 'write:diagnosis', 'admin'],
    lenses: ['diagnostic', 'supervision', 'management'], educationLevel: 'expert',
  },
  midwife: {
    id: 'midwife', label: 'Midwife', description: 'Certified midwife',
    defaultJourney: 'nursing_care', permissions: ['read:all', 'write:observations', 'write:medication_admin'],
    lenses: ['maternal', 'neonatal', 'observations'], educationLevel: 'advanced',
  },
  nurse: {
    id: 'nurse', label: 'Nurse', description: 'Registered nurse providing direct patient care',
    defaultJourney: 'nursing_care', permissions: ['read:all', 'write:observations', 'write:medication_admin', 'write:care_plan'],
    lenses: ['observations', 'medication', 'care_plan'], educationLevel: 'advanced',
  },
  student: {
    id: 'student', label: 'Medical Student', description: 'Medical student in training',
    defaultJourney: 'learning', permissions: ['read:deidentified', 'write:learning_log'],
    lenses: ['education', 'observation', 'simulation'], educationLevel: 'basic',
  },
  patient: {
    id: 'patient', label: 'Patient', description: 'The person receiving care',
    defaultJourney: 'patient_portal', permissions: ['read:self', 'write:self_reported'],
    lenses: ['personal', 'education', 'appointments'], educationLevel: 'basic',
  },
  pharmacist: {
    id: 'pharmacist', label: 'Pharmacist', description: 'Clinical pharmacist',
    defaultJourney: 'pharmacy', permissions: ['read:prescriptions', 'write:dispensing', 'read:allergies'],
    lenses: ['medication', 'interactions'], educationLevel: 'advanced',
  },
  lab_technician: {
    id: 'lab_technician', label: 'Lab Technician', description: 'Laboratory scientist',
    defaultJourney: 'laboratory', permissions: ['read:orders', 'write:results'],
    lenses: ['orders', 'results', 'quality'], educationLevel: 'advanced',
  },
  radiologist: {
    id: 'radiologist', label: 'Radiologist', description: 'Radiology specialist',
    defaultJourney: 'radiology', permissions: ['read:imaging_orders', 'write:imaging_reports'],
    lenses: ['imaging', 'reporting'], educationLevel: 'expert',
  },
  administrator: {
    id: 'administrator', label: 'Hospital Administrator', description: 'Hospital management',
    defaultJourney: 'administration', permissions: ['read:operational', 'write:config'],
    lenses: ['operations', 'finance', 'staff'], educationLevel: 'intermediate',
  },
  researcher: {
    id: 'researcher', label: 'Researcher', description: 'Clinical researcher',
    defaultJourney: 'research', permissions: ['read:deidentified', 'read:aggregate'],
    lenses: ['cohorts', 'analytics', 'publications'], educationLevel: 'expert',
  },
  educator: {
    id: 'educator', label: 'Educator', description: 'Medical educator / faculty',
    defaultJourney: 'education', permissions: ['read:student_performance', 'write:curriculum'],
    lenses: ['teaching', 'assessment', 'curriculum'], educationLevel: 'expert',
  },
  community_health_worker: {
    id: 'community_health_worker', label: 'Community Health Worker', description: 'Frontline community health provider',
    defaultJourney: 'community_health', permissions: ['read:self_limited', 'write:screening'],
    lenses: ['screening', 'referral', 'education'], educationLevel: 'basic',
  },
  regulator: {
    id: 'regulator', label: 'Regulator / Ministry', description: 'Government health authority',
    defaultJourney: 'public_health', permissions: ['read:aggregate', 'read:surveillance'],
    lenses: ['surveillance', 'reporting', 'analytics'], educationLevel: 'advanced',
  },
  insurance_adjuster: {
    id: 'insurance_adjuster', label: 'Insurance Adjuster', description: 'Insurance claims processor',
    defaultJourney: 'insurance', permissions: ['read:claims', 'write:approvals'],
    lenses: ['claims', 'verification'], educationLevel: 'intermediate',
  },
  ai_agent: {
    id: 'ai_agent', label: 'AI Agent', description: 'Artificial intelligence assistant',
    defaultJourney: 'ai_service', permissions: ['read:deidentified', 'write:suggestions'],
    lenses: ['suggestion', 'analysis'], educationLevel: 'expert',
  },
  family_member: {
    id: 'family_member', label: 'Family Member', description: 'Patient family / guardian',
    defaultJourney: 'family_portal', permissions: ['read:self_limited'],
    lenses: ['updates', 'education'], educationLevel: 'basic',
  },
  developer: {
    id: 'developer', label: 'Developer', description: 'Third-party developer / integrator',
    defaultJourney: 'developer_portal', permissions: ['read:api', 'write:api'],
    lenses: ['api', 'webhooks', 'logs'], educationLevel: 'expert',
  },
  system: {
    id: 'system', label: 'System', description: 'Automated system processes and services',
    defaultJourney: 'system_operations', permissions: ['read:all', 'write:system'],
    lenses: ['audit', 'telemetry', 'health'], educationLevel: 'expert',
  },
  finance_officer: {
    id: 'finance_officer', label: 'Finance Officer', description: 'Billing and financial administration',
    defaultJourney: 'finance_portal', permissions: ['read:billing', 'write:billing'],
    lenses: ['billing', 'reports', 'insurance'], educationLevel: 'advanced',
  },
  hospital_ceo: {
    id: 'hospital_ceo', label: 'Hospital CEO', description: 'Executive hospital leadership',
    defaultJourney: 'executive_dashboard', permissions: ['read:all_analytics', 'read:audit'],
    lenses: ['analytics', 'operations', 'compliance'], educationLevel: 'advanced',
  },
};

// ── Journeys ───────────────────────────────────────────────────────────────────
// A journey is the complete experience an actor has with AMEXAN.

export type JourneyId =
  | 'clinical_care' | 'nursing_care' | 'learning' | 'patient_portal'
  | 'pharmacy' | 'laboratory' | 'radiology' | 'administration'
  | 'research' | 'education' | 'community_health' | 'public_health'
  | 'insurance' | 'ai_service' | 'family_portal' | 'developer_portal'
  | 'telemedicine' | 'emergency' | 'icu' | 'operating_theatre'
  | 'system_operations' | 'finance_portal' | 'executive_dashboard';

export interface JourneyDefinition {
  id: JourneyId;
  label: string;
  description: string;
  actors: ActorId[];
  phases: JourneyPhase[];
  entryPoint: string;
  completionCriteria: string[];
}

export interface JourneyPhase {
  id: string;
  label: string;
  description: string;
  required: boolean;
  dependsOn: string[];
  minCompletion: number;
  sections: SectionId[];
}

export const JOURNEYS: Record<JourneyId, JourneyDefinition> = {
  clinical_care: {
    id: 'clinical_care', label: 'Clinical Care', description: 'Full clinical encounter for doctors',
    actors: ['doctor', 'resident', 'consultant'],
    entryPoint: 'registration',
    completionCriteria: ['diagnosis_made', 'management_planned', 'documentation_complete'],
    phases: [
      { id: 'registration', label: 'Registration', description: 'Patient identification', required: true, dependsOn: [], minCompletion: 100, sections: ['patient_info', 'biodata', 'vitals_triage'] },
      { id: 'history', label: 'History Taking', description: 'Complete clinical history', required: true, dependsOn: ['registration'], minCompletion: 80, sections: ['chief_complaint', 'hpi', 'past_history', 'social_history', 'family_history', 'review_of_systems'] },
      { id: 'examination', label: 'Examination', description: 'Physical examination', required: true, dependsOn: ['history'], minCompletion: 80, sections: ['general_exam', 'system_exam', 'vitals'] },
      { id: 'assessment', label: 'Assessment', description: 'Differential and diagnosis', required: true, dependsOn: ['examination'], minCompletion: 90, sections: ['problem_list', 'differentials', 'diagnosis'] },
      { id: 'plan', label: 'Management Plan', description: 'Treatment and monitoring', required: true, dependsOn: ['assessment'], minCompletion: 80, sections: ['investigations', 'medications', 'procedures', 'monitoring', 'disposition'] },
      { id: 'documentation', label: 'Documentation', description: 'Clinical notes', required: true, dependsOn: ['plan'], minCompletion: 100, sections: ['summary', 'prescription', 'certificates'] },
    ],
  },
  nursing_care: {
    id: 'nursing_care', label: 'Nursing Care', description: 'Nursing workflow',
    actors: ['nurse', 'midwife'],
    entryPoint: 'handover',
    completionCriteria: ['observations_recorded', 'medication_given', 'care_plan_updated'],
    phases: [
      { id: 'handover', label: 'Handover', description: 'Nursing handover', required: true, dependsOn: [], minCompletion: 80, sections: ['handover_report', 'patient_list'] },
      { id: 'observations', label: 'Observations', description: 'Vital signs and monitoring', required: true, dependsOn: ['handover'], minCompletion: 90, sections: ['vitals', 'fluid_chart', 'input_output', 'pain_score'] },
      { id: 'medication', label: 'Medication', description: 'Medication administration', required: true, dependsOn: ['observations'], minCompletion: 100, sections: ['medication_check', 'administration_record', 'controlled_drugs'] },
      { id: 'care', label: 'Care Delivery', description: 'Nursing care interventions', required: true, dependsOn: ['medication'], minCompletion: 70, sections: ['wound_care', 'hygiene', 'mobilization', 'pressure_area'] },
      { id: 'handover_out', label: 'End of Shift', description: 'Shift handover', required: true, dependsOn: ['care'], minCompletion: 80, sections: ['handover_report', 'pending_tasks'] },
    ],
  },
  learning: {
    id: 'learning', label: 'Medical Education', description: 'Student learning journey',
    actors: ['student', 'resident'],
    entryPoint: 'dashboard',
    completionCriteria: ['case_reviewed', 'assessment_completed'],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'Learning dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['assigned_cases', 'curriculum', 'progress'] },
      { id: 'case_study', label: 'Case Study', description: 'Review clinical cases', required: true, dependsOn: ['dashboard'], minCompletion: 60, sections: ['case_presentation', 'history_review', 'exam_findings'] },
      { id: 'reasoning', label: 'Clinical Reasoning', description: 'Try differential diagnosis', required: true, dependsOn: ['case_study'], minCompletion: 70, sections: ['differential_attempt', 'compare_with_expert', 'reasoning_feedback'] },
      { id: 'study', label: 'Study Material', description: 'Disease-specific learning', required: false, dependsOn: ['reasoning'], minCompletion: 0, sections: ['guidelines', 'textbooks', 'videos', 'research'] },
      { id: 'assessment', label: 'Assessment', description: 'Knowledge assessment', required: true, dependsOn: ['reasoning'], minCompletion: 80, sections: ['quiz', 'osce', 'feedback'] },
    ],
  },
  patient_portal: {
    id: 'patient_portal', label: 'Patient Portal', description: 'Patient self-service',
    actors: ['patient', 'family_member'],
    entryPoint: 'home',
    completionCriteria: [],
    phases: [
      { id: 'home', label: 'Home', description: 'Patient dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['health_summary', 'appointments', 'messages'] },
      { id: 'self_report', label: 'Self Report', description: 'Report symptoms', required: false, dependsOn: ['home'], minCompletion: 0, sections: ['symptom_report', 'vitals_home', 'medication_log'] },
      { id: 'education', label: 'Health Education', description: 'Learn about conditions', required: false, dependsOn: ['home'], minCompletion: 0, sections: ['condition_info', 'medication_info', 'lifestyle'] },
      { id: 'appointments', label: 'Appointments', description: 'Manage appointments', required: false, dependsOn: ['home'], minCompletion: 0, sections: ['book', 'reschedule', 'telemedicine'] },
    ],
  },
  pharmacy: {
    id: 'pharmacy', label: 'Pharmacy', description: 'Pharmacy workflow',
    actors: ['pharmacist'],
    entryPoint: 'prescriptions',
    completionCriteria: ['dispensed'],
    phases: [
      { id: 'prescriptions', label: 'Prescriptions', description: 'Review prescriptions', required: true, dependsOn: [], minCompletion: 80, sections: ['pending_prescriptions', 'interaction_check'] },
      { id: 'dispensing', label: 'Dispensing', description: 'Dispense medications', required: true, dependsOn: ['prescriptions'], minCompletion: 90, sections: ['dispense', 'counsel', 'label'] },
    ],
  },
  laboratory: {
    id: 'laboratory', label: 'Laboratory', description: 'Lab workflow',
    actors: ['lab_technician'],
    entryPoint: 'orders',
    completionCriteria: ['results_reported'],
    phases: [
      { id: 'orders', label: 'Orders', description: 'View lab orders', required: true, dependsOn: [], minCompletion: 80, sections: ['pending_orders', 'sample_collection'] },
      { id: 'processing', label: 'Processing', description: 'Run lab tests', required: true, dependsOn: ['orders'], minCompletion: 80, sections: ['sample_processing', 'quality_control'] },
      { id: 'results', label: 'Results', description: 'Enter and validate results', required: true, dependsOn: ['processing'], minCompletion: 90, sections: ['result_entry', 'validation', 'critical_values'] },
    ],
  },
  radiology: {
    id: 'radiology', label: 'Radiology', description: 'Radiology workflow',
    actors: ['radiologist'],
    entryPoint: 'worklist',
    completionCriteria: ['report_finalized'],
    phases: [
      { id: 'worklist', label: 'Worklist', description: 'Pending studies', required: true, dependsOn: [], minCompletion: 80, sections: ['pending_studies', 'protocoling'] },
      { id: 'reporting', label: 'Reporting', description: 'Interpret and report', required: true, dependsOn: ['worklist'], minCompletion: 90, sections: ['image_review', 'dictation', 'report'] },
      { id: 'verification', label: 'Verification', description: 'Finalize report', required: true, dependsOn: ['reporting'], minCompletion: 100, sections: ['verification', 'critical_findings'] },
    ],
  },
  telemedicine: {
    id: 'telemedicine', label: 'Telemedicine', description: 'Remote consultation',
    actors: ['doctor', 'patient'],
    entryPoint: 'queue',
    completionCriteria: ['consultation_done'],
    phases: [
      { id: 'queue', label: 'Queue', description: 'Virtual waiting room', required: true, dependsOn: [], minCompletion: 0, sections: ['patient_queue', 'connection_check'] },
      { id: 'consultation', label: 'Consultation', description: 'Video consultation', required: true, dependsOn: ['queue'], minCompletion: 80, sections: ['video', 'history', 'assessment'] },
      { id: 'prescription', label: 'Prescription', description: 'E-prescription', required: false, dependsOn: ['consultation'], minCompletion: 0, sections: ['e_prescription', 'follow_up'] },
    ],
  },
  emergency: {
    id: 'emergency', label: 'Emergency', description: 'Emergency department workflow',
    actors: ['doctor', 'nurse'],
    entryPoint: 'triage',
    completionCriteria: ['disposition_decided'],
    phases: [
      { id: 'triage', label: 'Triage', description: 'Emergency triage', required: true, dependsOn: [], minCompletion: 100, sections: ['triage_assessment', 'acuity', 'resus'] },
      { id: 'assessment', label: 'Assessment', description: 'Emergency assessment', required: true, dependsOn: ['triage'], minCompletion: 80, sections: ['abcde', 'focused_history', 'bedside_tests'] },
      { id: 'stabilization', label: 'Stabilization', description: 'Emergency treatment', required: true, dependsOn: ['assessment'], minCompletion: 90, sections: ['resuscitation', 'monitoring', 'consultation'] },
      { id: 'disposition', label: 'Disposition', description: 'Admit, discharge, or transfer', required: true, dependsOn: ['stabilization'], minCompletion: 100, sections: ['decision', 'referral', 'handover'] },
    ],
  },
  administration: {
    id: 'administration', label: 'Administration', description: 'Hospital administration workflow',
    actors: ['administrator'],
    entryPoint: 'dashboard',
    completionCriteria: ['report_reviewed'],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'Operational dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['overview', 'occupancy', 'finance'] },
      { id: 'operations', label: 'Operations', description: 'Operational management', required: false, dependsOn: ['dashboard'], minCompletion: 0, sections: ['staffing', 'supplies', 'maintenance'] },
    ],
  },
  research: {
    id: 'research', label: 'Research', description: 'Clinical research workflow',
    actors: ['researcher'],
    entryPoint: 'dashboard',
    completionCriteria: ['study_reviewed'],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'Research dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['studies', 'cohorts', 'analytics'] },
      { id: 'analysis', label: 'Analysis', description: 'Data analysis', required: false, dependsOn: ['dashboard'], minCompletion: 0, sections: ['queries', 'reports', 'export'] },
    ],
  },
  education: {
    id: 'education', label: 'Education', description: 'Medical education administration',
    actors: ['educator'],
    entryPoint: 'dashboard',
    completionCriteria: ['curriculum_reviewed'],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'Education dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['students', 'curriculum', 'assessments'] },
      { id: 'teaching', label: 'Teaching', description: 'Teaching management', required: false, dependsOn: ['dashboard'], minCompletion: 0, sections: ['sessions', 'materials', 'evaluations'] },
    ],
  },
  community_health: {
    id: 'community_health', label: 'Community Health', description: 'Community health workflow',
    actors: ['community_health_worker'],
    entryPoint: 'dashboard',
    completionCriteria: ['screening_done'],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'CHW dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['households', 'screenings', 'referrals'] },
      { id: 'screening', label: 'Screening', description: 'Health screening', required: true, dependsOn: ['dashboard'], minCompletion: 80, sections: ['symptom_report', 'vitals', 'risk_assessment'] },
    ],
  },
  public_health: {
    id: 'public_health', label: 'Public Health', description: 'Public health surveillance',
    actors: ['regulator'],
    entryPoint: 'dashboard',
    completionCriteria: ['surveillance_reviewed'],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'Surveillance dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['alerts', 'disease_trends', 'coverage'] },
      { id: 'reporting', label: 'Reporting', description: 'Public health reporting', required: false, dependsOn: ['dashboard'], minCompletion: 0, sections: ['reports', 'export', 'submissions'] },
    ],
  },
  insurance: {
    id: 'insurance', label: 'Insurance', description: 'Insurance claims workflow',
    actors: ['insurance_adjuster'],
    entryPoint: 'dashboard',
    completionCriteria: ['claims_reviewed'],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'Claims dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['pending_claims', 'approved', 'denied'] },
      { id: 'verification', label: 'Verification', description: 'Verify claims', required: true, dependsOn: ['dashboard'], minCompletion: 80, sections: ['patient_verification', 'coverage', 'authorization'] },
    ],
  },
  ai_service: {
    id: 'ai_service', label: 'AI Service', description: 'AI agent service workflow',
    actors: ['ai_agent'],
    entryPoint: 'processing',
    completionCriteria: ['task_completed'],
    phases: [
      { id: 'processing', label: 'Processing', description: 'Process AI tasks', required: true, dependsOn: [], minCompletion: 0, sections: ['tasks', 'models', 'results'] },
    ],
  },
  family_portal: {
    id: 'family_portal', label: 'Family Portal', description: 'Family member portal',
    actors: ['family_member'],
    entryPoint: 'home',
    completionCriteria: [],
    phases: [
      { id: 'home', label: 'Home', description: 'Family dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['patient_updates', 'messages', 'education'] },
    ],
  },
  developer_portal: {
    id: 'developer_portal', label: 'Developer Portal', description: 'Developer API portal',
    actors: ['developer'],
    entryPoint: 'dashboard',
    completionCriteria: ['api_reviewed'],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'Developer dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['api_keys', 'docs', 'logs'] },
      { id: 'webhooks', label: 'Webhooks', description: 'Manage webhooks', required: false, dependsOn: ['dashboard'], minCompletion: 0, sections: ['endpoints', 'events', 'history'] },
    ],
  },
  system_operations: {
    id: 'system_operations', label: 'System Operations', description: 'Automated system operations',
    actors: ['system', 'developer'],
    entryPoint: 'monitoring',
    completionCriteria: [],
    phases: [
      { id: 'monitoring', label: 'Monitoring', description: 'System health monitoring', required: true, dependsOn: [], minCompletion: 0, sections: ['health', 'alerts', 'telemetry'] },
      { id: 'maintenance', label: 'Maintenance', description: 'System maintenance', required: false, dependsOn: ['monitoring'], minCompletion: 0, sections: ['backup', 'update', 'cleanup'] },
    ],
  },
  finance_portal: {
    id: 'finance_portal', label: 'Finance Portal', description: 'Finance and billing operations',
    actors: ['finance_officer', 'administrator'],
    entryPoint: 'dashboard',
    completionCriteria: [],
    phases: [
      { id: 'dashboard', label: 'Dashboard', description: 'Finance dashboard', required: true, dependsOn: [], minCompletion: 0, sections: ['billing', 'insurance', 'reports'] },
      { id: 'claims', label: 'Claims', description: 'Insurance claims management', required: false, dependsOn: ['dashboard'], minCompletion: 0, sections: ['submissions', 'tracking', 'appeals'] },
    ],
  },
  executive_dashboard: {
    id: 'executive_dashboard', label: 'Executive Dashboard', description: 'Executive hospital leadership',
    actors: ['hospital_ceo', 'administrator'],
    entryPoint: 'overview',
    completionCriteria: [],
    phases: [
      { id: 'overview', label: 'Overview', description: 'Executive overview', required: true, dependsOn: [], minCompletion: 0, sections: ['analytics', 'operations', 'compliance'] },
      { id: 'reports', label: 'Reports', description: 'Executive reports', required: false, dependsOn: ['overview'], minCompletion: 0, sections: ['financial', 'clinical', 'quality'] },
    ],
  },
  icu: {
    id: 'icu', label: 'ICU', description: 'Intensive care unit workflow',
    actors: ['doctor', 'nurse', 'resident', 'consultant'],
    entryPoint: 'rounds',
    completionCriteria: ['discharge_summary'],
    phases: [
      { id: 'rounds', label: 'Rounds', description: 'ICU rounds', required: true, dependsOn: [], minCompletion: 0, sections: ['vitals', 'ventilator', 'medications', 'labs'] },
      { id: 'procedures', label: 'Procedures', description: 'ICU procedures', required: false, dependsOn: ['rounds'], minCompletion: 0, sections: ['lines', 'intubation', 'dialysis'] },
    ],
  },
  operating_theatre: {
    id: 'operating_theatre', label: 'Operating Theatre', description: 'Surgical workflow',
    actors: ['doctor', 'nurse', 'consultant'],
    entryPoint: 'scheduling',
    completionCriteria: ['post_op_notes', 'discharge_instructions'],
    phases: [
      { id: 'scheduling', label: 'Scheduling', description: 'Surgery scheduling', required: true, dependsOn: [], minCompletion: 0, sections: ['booking', 'consent', 'pre_op'] },
      { id: 'procedure', label: 'Procedure', description: 'Intra-operative', required: true, dependsOn: ['scheduling'], minCompletion: 0, sections: ['timeout', 'surgery', 'signout'] },
      { id: 'recovery', label: 'Recovery', description: 'Post-operative recovery', required: true, dependsOn: ['procedure'], minCompletion: 0, sections: ['vitals', 'pain', 'discharge'] },
    ],
  },
};
// A section is a logical grouping of UI cards within a journey phase.

export type SectionId = string;

export interface SectionDefinition {
  id: SectionId;
  label: string;
  description: string;
  icon: string;
  priority: number;
  cards: CardContractId[];
  visibilityRule?: string;
  allowedActors: ActorId[];
}

// ── UI Card Contracts ─────────────────────────────────────────────────────────
// A card is the smallest atomic UI unit. The engine says "show this card".
// The UI renders it according to theme. No medical logic in UI.

export type CardContractId = string;

export type CardType = 'question_group' | 'info_display' | 'vital_signs' | 'differential_list'
  | 'diagnosis' | 'medication_list' | 'investigation_order' | 'result_display'
  | 'timeline' | 'narrative' | 'summary' | 'alert' | 'action_button'
  | 'education_content' | 'chart' | 'image_viewer' | 'document_preview'
  | 'workflow_progress' | 'patient_header' | 'handover_report' | 'fluid_chart'
  | 'pain_score' | 'risk_score' | 'ai_suggestion' | 'referral_form';

export interface CardContract {
  id: CardContractId;
  type: CardType;
  label: string;
  priority: number;
  minWidth: 'full' | 'half' | 'third' | 'auto';
  visibility: 'always' | 'conditional' | 'role_based';
  visibilityCondition?: string;
  requiredActorCompletion?: ActorId[];
  actions: CardAction[];
  dataSource: string;
}

export interface CardAction {
  id: string;
  label: string;
  icon: string;
  type: 'navigation' | 'submit' | 'generate' | 'print' | 'share' | 'ai_assist';
  target?: string;
  requiresConfirmation: boolean;
}

// ── Presentation Instructions ──────────────────────────────────────────────────
// The engine outputs these. The UI renders them.

export interface PresentationScreen {
  screenId: string;
  title: string;
  subtitle?: string;
  journeyId: JourneyId;
  phaseId: string;
  progress: number;
  sections: PresentationSection[];
  navigation: NavigationInstruction[];
  warnings: WarningBanner[];
  shortcuts: ShortcutAction[];
  locked: boolean;
  theme: ThemeContext;
}

export interface PresentationSection {
  sectionId: SectionId;
  label: string;
  icon: string;
  cards: PresentationCard[];
  collapsed: boolean;
  collapsible: boolean;
  completion: number;
}

export interface PresentationCard {
  cardId: CardContractId;
  type: CardType;
  label: string;
  priority: number;
  visible: boolean;
  enabled: boolean;
  required: boolean;
  completed: boolean;
  minWidth: 'full' | 'half' | 'third' | 'auto';
  data?: Record<string, any>;
  actions: CardAction[];
  warning?: string;
  highlight?: boolean;
  badge?: string | number;
}

export interface NavigationInstruction {
  label: string;
  target: string;
  icon: string;
  enabled: boolean;
  active: boolean;
  completionRequired: number;
}

export interface WarningBanner {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  dismissible: boolean;
  action?: { label: string; target: string };
}

export interface ShortcutAction {
  id: string;
  label: string;
  icon: string;
  target: string;
  actorRestricted: ActorId[];
}

export interface ThemeContext {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  mode: 'light' | 'dark' | 'auto';
  fontScale: number;
  density: 'comfortable' | 'compact' | 'spacious';
  logoUrl?: string;
  facilityName: string;
}

// ── Permissions ────────────────────────────────────────────────────────────────

export interface PermissionCheck {
  actor: ActorId;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'admin' | 'write';
  context: Record<string, unknown>;
}

export function checkPermission(check: PermissionCheck, actorPermissions: string[]): boolean {
  if (actorPermissions.includes('admin')) return true;
  const required = `${check.action}:${check.resource}`;
  const wildcard = `${check.action}:*`;
  const readAll = `read:all`;
  return actorPermissions.some(p => p === required || p === wildcard || p === readAll);
}

export function getActor(actorId: ActorId): ActorDefinition {
  return ACTORS[actorId] || ACTORS.doctor;
}

export function getJourney(journeyId: JourneyId): JourneyDefinition {
  return JOURNEYS[journeyId] || JOURNEYS.clinical_care;
}

export function getJourneyForActor(actorId: ActorId): JourneyDefinition {
  const actor = getActor(actorId);
  return getJourney(actor.defaultJourney);
}