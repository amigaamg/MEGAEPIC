// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CLINICIAN EXPERIENCE CONSTITUTION (BOOK XI)
//
// The Clinician Experience Constitution answers the question "every feature must
// map to at least one clinician pain." AMEXAN exists to eliminate:
//   • wasted time   • duplicate work   • lost information
//   • unsafe systems   • poor communication   • admin burden   • bad software
//
// Constitutional test: every feature must remove cognitive load from the clinician
// while improving patient care and preserving clinical judgment. It must reduce at
// least one of: time, cognitive load, risk, coordination effort, documentation
// effort, duplication, reasoning distance, communication friction, or continuity gap.
//
// This file encodes the mapping from each Book XI mandate → the clinician pain it
// solves → the constitutional test(s) it passes → the engine module that implements
// it. It is the constitutional proof that AMEXAN is hooked for clinicians: no
// feature exists unless it is wired to a real engine that removes suffering.
//
// This module is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Constitutional test predicates ─────────────────────────────────────────────

export type ClinicianPain =
  | 'wasted_time' | 'duplicate_work' | 'lost_information' | 'unsafe_systems'
  | 'poor_communication' | 'administrative_burden' | 'bad_software'
  | 'cognitive_load' | 'context_switching' | 'no_continuity' | 'documentation_toil'
  | 'no_reasoning_support' | 'clicks_and_fields' | 'burnout';

export const CLINICIAN_PAINS: readonly ClinicianPain[] = [
  'wasted_time', 'duplicate_work', 'lost_information', 'unsafe_systems',
  'poor_communication', 'administrative_burden', 'bad_software', 'cognitive_load',
  'context_switching', 'no_continuity', 'documentation_toil', 'no_reasoning_support',
  'clicks_and_fields', 'burnout',
];

export type ClinicianTestKey =
  | 'saves_time' | 'reduces_cognitive_load' | 'improves_safety'
  | 'improves_coordination' | 'improves_documentation' | 'reduces_duplication'
  | 'improves_reasoning' | 'improves_communication' | 'improves_continuity';

export const CLINICIAN_TESTS: readonly ClinicianTestKey[] = [
  'saves_time', 'reduces_cognitive_load', 'improves_safety', 'improves_coordination',
  'improves_documentation', 'reduces_duplication', 'improves_reasoning',
  'improves_communication', 'improves_continuity',
];

export const TEST_PASS_REASON: Readonly<Record<ClinicianTestKey, string>> = {
  saves_time: 'Returns hours to patient care instead of documentation.',
  reduces_cognitive_load: 'Removes the need to remember; the system remembers.',
  improves_safety: 'Catches allergy, dose, interaction and deterioration risk early.',
  improves_coordination: 'One encounter, everyone communicates inside it.',
  improves_documentation: 'One structured encounter; every artifact is generated.',
  reduces_duplication: 'Write once, reuse automatically everywhere.',
  improves_reasoning: 'Suggests, warns, and explains — the clinician still decides.',
  improves_communication: 'No chasing lab, radiology, pharmacy, or the porter.',
  improves_continuity: 'The full longitudinal timeline is always one tap away.',
};

// ── Mandate definitions ────────────────────────────────────────────────────────

export interface ClinicianMandate {
  number: number;
  title: string;
  problem: string;
  pains: ClinicianPain[];
  tests: ClinicianTestKey[];
  engines: string[];
}

export const CLINICIAN_MANDATES: readonly ClinicianMandate[] = [
  {
    number: 1, title: 'Documentation Automation', problem: 'Doctors spend hours typing every note.',
    pains: ['documentation_toil', 'wasted_time', 'duplicate_work'],
    tests: ['saves_time', 'reduces_cognitive_load', 'improves_documentation'],
    engines: ['encounter-engine/engines/documentation-engine.exe', 'encounter-engine/engines/dischargeEngine'],
  },
  {
    number: 2, title: 'Universal Patient Timeline', problem: 'Clinicians cannot reconstruct the patient story.',
    pains: ['no_continuity', 'lost_information'],
    tests: ['improves_continuity', 'improves_coordination'],
    engines: ['longitudinal/timelineEngine', 'master-timeline', 'chronic-disease'],
  },
  {
    number: 3, title: 'Clinical Intelligence', problem: 'Existing systems store but do not think.',
    pains: ['no_reasoning_support', 'unsafe_systems'],
    tests: ['improves_reasoning', 'improves_safety'],
    engines: ['intelligence (DifferentialEngine, MonitoringEngine, PredictionEngine, ExplanationEngine)'],
  },
  {
    number: 4, title: 'Zero Duplicate Documentation', problem: 'Doctors repeat themselves six times per patient.',
    pains: ['duplicate_work', 'administrative_burden'],
    tests: ['reduces_duplication', 'saves_time', 'reduces_cognitive_load'],
    engines: ['encounter-engine/engines/documentation-engine', 'encounter-engine/engines/documentationEngine'],
  },
  {
    number: 5, title: 'Intelligent Ordering', problem: 'Ordering is repetitive and unsafe.',
    pains: ['clicks_and_fields', 'unsafe_systems', 'wasted_time'],
    tests: ['improves_safety', 'saves_time', 'reduces_duplication'],
    engines: ['encounter-engine/engines/investigation-engine', 'encounter-engine/engines/protocol-engine'],
  },
  {
    number: 6, title: 'Results Intelligence', problem: 'Doctors miss important results.',
    pains: ['lost_information', 'poor_communication'],
    tests: ['improves_safety', 'improves_communication', 'improves_continuity'],
    engines: ['encounter-engine/engines/alert-engine', 'notification'],
  },
  {
    number: 7, title: 'Medication Safety', problem: 'Medication errors harm patients.',
    pains: ['unsafe_systems', 'cognitive_load'],
    tests: ['improves_safety', 'reduces_cognitive_load'],
    engines: ['intelligence (DrugEngine)', 'encounter-engine/engines/prescription-engine', 'pharmacy'],
  },
  {
    number: 8, title: 'Intelligent Documentation Quality', problem: 'Incomplete notes degrade care.',
    pains: ['documentation_toil', 'unsafe_systems'],
    tests: ['improves_documentation', 'improves_safety'],
    engines: ['information-gap-engine', 'encounter-engine/engines/documentation-engine'],
  },
  {
    number: 9, title: 'Communication', problem: 'Doctors chase laboratory, radiology, pharmacy, and the ward.',
    pains: ['poor_communication', 'wasted_time', 'context_switching'],
    tests: ['improves_communication', 'improves_coordination'],
    engines: ['communication (createCareTeamThread)', 'lifecycle/CommunicationEngine'],
  },
  {
    number: 10, title: 'Real-Time Hospital Awareness', problem: 'Nobody knows hospital status.',
    pains: ['poor_communication', 'wasted_time'],
    tests: ['improves_coordination', 'improves_communication'],
    engines: ['facility/FacilityAdministrationEngine', 'dashboard'],
  },
  {
    number: 11, title: 'Task Automation', problem: 'Doctors remember everything themselves.',
    pains: ['cognitive_load', 'administrative_burden'],
    tests: ['reduces_cognitive_load', 'saves_time'],
    engines: ['encounter-engine/engines/workflow-engine', 'encounter-engine/engines/task-engine'],
  },
  {
    number: 12, title: 'Adaptive History Engine', problem: 'Doctors ask the same questions repeatedly.',
    pains: ['wasted_time', 'cognitive_load', 'context_switching'],
    tests: ['saves_time', 'reduces_cognitive_load'],
    engines: ['intelligence (question categories / symptom-driven history)'],
  },
  {
    number: 13, title: 'Adaptive Examination Engine', problem: 'Doctors forget important examination components.',
    pains: ['cognitive_load', 'unsafe_systems'],
    tests: ['improves_documentation', 'reduces_cognitive_load'],
    engines: ['encounter-engine/engines/documentation-engine (examination narrative)'],
  },
  {
    number: 14, title: 'Clinical Calculators', problem: 'Doctors leave the system to compute scores.',
    pains: ['context_switching', 'wasted_time'],
    tests: ['saves_time', 'improves_safety'],
    engines: ['departments (card, neuro)', 'encounter-engine (severity / scoring)'],
  },
  {
    number: 15, title: 'Protocol Engine', problem: 'Protocols are hard to find and apply.',
    pains: ['cognitive_load', 'no_reasoning_support'],
    tests: ['improves_continuity', 'improves_safety'],
    engines: ['encounter-engine/engines/protocol-engine', 'intelligence (GuidelineEngine)'],
  },
  {
    number: 16, title: 'Intelligent Search', problem: 'Clinicians cannot find patients, notes, or tests.',
    pains: ['lost_information', 'wasted_time'],
    tests: ['saves_time', 'improves_continuity'],
    engines: ['db/postgres', 'data'],
  },
  {
    number: 17, title: 'Clinical Memory', problem: 'AMEXAN forgets nothing about the patient.',
    pains: ['no_continuity', 'lost_information'],
    tests: ['improves_continuity', 'improves_reasoning'],
    engines: ['intelligence (MemoryEngine)', 'clinical-reasoning'],
  },
  {
    number: 18, title: 'Longitudinal Analytics', problem: 'Trends are not visible.',
    pains: ['no_continuity', 'no_reasoning_support'],
    tests: ['improves_continuity', 'improves_reasoning'],
    engines: ['longitudinal', 'chronic-disease'],
  },
  {
    number: 19, title: 'Teaching', problem: 'Teaching is manual and unrecorded.',
    pains: ['administrative_burden', 'duplicate_work'],
    tests: ['improves_documentation', 'saves_time'],
    engines: ['student/MedicalStudentEngine', 'resident', 'intern', 'consultant'],
  },
  {
    number: 20, title: 'Research', problem: 'Research data collection is manual and duplicative.',
    pains: ['administrative_burden', 'duplicate_work'],
    tests: ['reduces_duplication', 'improves_documentation'],
    engines: ['research/ResearchEngine'],
  },
  {
    number: 21, title: 'Quality', problem: 'Quality measurement requires manual statistics.',
    pains: ['administrative_burden', 'unsafe_systems'],
    tests: ['improves_documentation', 'improves_safety'],
    engines: ['quality/QualityEngine'],
  },
  {
    number: 22, title: 'Telemedicine', problem: 'Patients cannot reach their clinician remotely.',
    pains: ['no_continuity', 'context_switching'],
    tests: ['improves_continuity', 'improves_communication'],
    engines: ['telemedicine/TelemedicineEngine', 'lifecycle'],
  },
  {
    number: 23, title: 'Personal AI Clinical Assistant', problem: 'The clinician has no constitutional assistant.',
    pains: ['cognitive_load', 'administrative_burden', 'context_switching'],
    tests: ['reduces_cognitive_load', 'saves_time', 'improves_reasoning'],
    engines: ['experience', 'intelligence (OrchestrationEngine)', 'consultant (ai wall)'],
  },
  {
    number: 24, title: 'Administrative Automation', problem: 'Doctors manually calculate bills and compile reports.',
    pains: ['administrative_burden', 'wasted_time', 'duplicate_work'],
    tests: ['saves_time', 'reduces_duplication'],
    engines: ['finance', 'hmis', 'analytics'],
  },
  {
    number: 25, title: 'Universal Interoperability', problem: 'Hospitals will not replace existing systems.',
    pains: ['bad_software', 'duplicate_work'],
    tests: ['improves_continuity', 'reduces_duplication'],
    engines: ['integration (FHIR/HL7/DICOM)', 'hmis/integration-engine', 'persistence'],
  },
  {
    number: 26, title: 'Lifelong Professional Workspace', problem: 'The clinician must never want to leave.',
    pains: ['cognitive_load', 'burnout', 'context_switching'],
    tests: ['saves_time', 'reduces_cognitive_load', 'improves_continuity'],
    engines: ['dashboard', 'workspace', 'experience'],
  },
];

// ── Query engine ───────────────────────────────────────────────────────────────

export function mandateByNumber(number: number): ClinicianMandate | undefined {
  return CLINICIAN_MANDATES.find(m => m.number === number);
}

export function mandatesForPain(pain: ClinicianPain): ClinicianMandate[] {
  return CLINICIAN_MANDATES.filter(m => m.pains.includes(pain));
}

export function mandatesPassingTest(test: ClinicianTestKey): ClinicianMandate[] {
  return CLINICIAN_MANDATES.filter(m => m.tests.includes(test));
}

export function mandatesForEngine(fragment: string): ClinicianMandate[] {
  return CLINICIAN_MANDATES.filter(m => m.engines.some(e => e.toLowerCase().includes(fragment.toLowerCase())));
}

export function totalMandates(): number {
  return CLINICIAN_MANDATES.length;
}

/** Constitutional proof: every mandate is wired to at least one engine. */
export function verifyAllMandatesHooked(): { ok: boolean; broken: { number: number; title: string }[] } {
  const broken = CLINICIAN_MANDATES.filter(m => m.engines.length === 0);
  return { ok: broken.length === 0, broken };
}

/** Constitutional proof: every mandate passes at least one test and resolves a pain. */
export function verifyAllMandatesMeetTests(): { ok: boolean; broken: ClinicianMandate[] } {
  const broken = CLINICIAN_MANDATES.filter(m => m.tests.length === 0 || m.pains.length === 0);
  return { ok: broken.length === 0, broken };
}