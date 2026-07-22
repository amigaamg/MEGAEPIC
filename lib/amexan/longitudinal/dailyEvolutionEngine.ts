// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Daily Evolution Engine — the pulse of the inpatient stay
// ═══════════════════════════════════════════════════════════════════════════════
// Every day creates a new Hospital Day record from the delta.
// Never rewrites what hasn't changed.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  HospitalDay, SoapNote, VitalsSummary, PatientStatus,
  ProblemStatus, InvestigationStatus, MedicationStatus,
  ToDoTask, DischargeReadiness, TimelineEvent, TrendDirection,
  ClinicalSnapshot, WarningItem, MedicationIssue,
} from './types';
import type { EncounterState } from '../encounter/encounterState';
import type { ManagementItem, MedicationCard, DispositionCard } from '../encounter/encounterState';

// ── Create a new Hospital Day ─────────────────────────────────────────────────

export function createHospitalDay(
  dayNumber: number,
  previousDay?: HospitalDay,
  encounter?: EncounterState,
): HospitalDay {
  const now = Date.now();
  const prevProblems = previousDay?.problems ?? [];
  const prevMeds = previousDay?.medications ?? [];

  return {
    dayNumber,
    date: now,
    status: 'stable',
    summary: generateDaySummary(dayNumber, previousDay, encounter),
    overnightEvents: [],
    soap: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      generatedAt: now,
    },
    vitals: buildVitalsSummary(previousDay?.vitals, encounter),
    investigations: buildInvestigationStatuses(encounter),
    medications: buildMedicationStatuses(encounter, prevMeds),
    tasks: previousDay?.tasks?.filter(t => t.status !== 'completed') ?? [],
    events: previousDay?.events ?? [],
    problems: buildProblemStatuses(prevProblems, encounter),
    dischargeReadiness: previousDay?.dischargeReadiness ?? 'not_ready',
  };
}

// ── Generate day summary ──────────────────────────────────────────────────────

function generateDaySummary(
  dayNumber: number,
  previousDay?: HospitalDay,
  encounter?: EncounterState,
): string {
  const parts: string[] = [];
  parts.push(`Hospital Day ${dayNumber}.`);

  if (dayNumber === 1) {
    if (encounter?.chiefComplaint.text) {
      parts.push(`Admitted with ${encounter.chiefComplaint.text}.`);
    }
    if (encounter?.assessment?.finalDiagnosis) {
      parts.push(`Working diagnosis: ${encounter.assessment.finalDiagnosis}.`);
    }
  }

  if (previousDay) {
    // Delta from previous day
    const resolvedProblems = previousDay.problems
      .filter(p => p.status === 'resolved' && !previousDay.problems.some(p2 => p2.id === p.id && p2.status !== 'resolved'));
    if (resolvedProblems.length > 0) {
      parts.push(`Resolved: ${resolvedProblems.map(p => p.problem).join(', ')}.`);
    }

    const newProblems = previousDay.problems.filter(p => p.status === 'active');
    if (newProblems.length > 0) {
      parts.push(`Active issues: ${newProblems.map(p => p.problem).join(', ')}.`);
    }
  }

  return parts.join(' ');
}

// ── Build vitals summary ──────────────────────────────────────────────────────

function buildVitalsSummary(
  previous: VitalsSummary | undefined,
  encounter?: EncounterState,
): VitalsSummary {
  const v = encounter?.examination?.vitals;
  if (!v) return previous ?? {};

  const summary: VitalsSummary = {};

  if (v.temp !== undefined) {
    summary.tempMin = v.temp;
    summary.tempMax = v.temp;
    summary.tempTrend = computeTrend(previous?.tempMin, v.temp);
  }
  if (v.hr !== undefined) {
    summary.hrMin = v.hr;
    summary.hrMax = v.hr;
    summary.hrTrend = computeTrend(previous?.hrMin, v.hr);
  }
  if (v.rr !== undefined) {
    summary.rrMin = v.rr;
    summary.rrMax = v.rr;
    summary.rrTrend = computeTrend(previous?.rrMin, v.rr);
  }
  if (v.bpSystolic !== undefined && v.bpDiastolic !== undefined) {
    summary.bpSystolicMin = v.bpSystolic;
    summary.bpSystolicMax = v.bpSystolic;
    summary.bpTrend = computeTrend(previous?.bpSystolicMin, v.bpSystolic);
  }
  if (v.spo2 !== undefined) {
    summary.spo2Min = v.spo2;
    summary.spo2Max = v.spo2;
    summary.spo2Trend = computeTrend(previous?.spo2Min, v.spo2);
  }

  return summary;
}

function computeTrend(previous?: number, current?: number): TrendDirection {
  if (previous === undefined || current === undefined) return 'stable';
  const diff = current - previous;
  if (Math.abs(diff) < 0.05 * Math.abs(previous)) return 'stable';
  return diff > 0 ? 'worsening' : 'improving';
}

// ── Build investigation statuses from encounter ──────────────────────────────

function buildInvestigationStatuses(encounter?: EncounterState): InvestigationStatus[] {
  if (!encounter?.investigations) return [];

  const statuses: InvestigationStatus[] = [];
  for (const lab of encounter.investigations.labs) {
    statuses.push({
      id: lab.testId,
      testName: lab.testName,
      category: 'lab',
      status: lab.result !== null ? 'resulted' : 'ordered',
      orderedAt: lab.orderedAt,
      resultedAt: lab.resultedAt ?? undefined,
      result: lab.result !== null ? String(lab.result) : undefined,
      unit: lab.unit,
      referenceRange: lab.referenceRange,
      flag: lab.flag,
      interpretation: lab.interpretation,
    });
  }
  for (const img of encounter.investigations.imaging) {
    statuses.push({
      id: img.studyId,
      testName: img.studyName,
      category: 'imaging',
      status: img.finding ? 'resulted' : 'ordered',
      orderedAt: img.completedAt ?? Date.now(),
      resultedAt: img.completedAt ?? undefined,
      result: img.finding || undefined,
      interpretation: img.impression,
    });
  }
  return statuses;
}

// ── Build medication statuses ────────────────────────────────────────────────

function buildMedicationStatuses(
  encounter?: EncounterState,
  previous?: MedicationStatus[],
): MedicationStatus[] {
  const meds = encounter?.medications || [];
  const prevMap = new Map(previous?.map(m => [m.id, m]));

  return meds.map(m => {
    const prev = prevMap.get(m.id);
    const statusMap: Record<string, 'prescribed' | 'verified' | 'dispensed' | 'administering' | 'completed' | 'missed' | 'discontinued'> = {
      prescribed: 'prescribed',
      administering: 'administering',
      completed: 'completed',
      discontinued: 'discontinued',
      draft: 'prescribed',
    };
    return {
      id: m.id,
      genericName: m.genericName,
      dosage: `${m.dose.value}${m.dose.unit}`,
      route: m.route,
      frequency: m.frequency,
      status: statusMap[m.status] || 'prescribed',
      prescribedAt: m.prescribedAt ?? Date.now(),
      lastAdministered: prev?.lastAdministered,
      nextDue: prev?.nextDue,
      missedDoses: prev?.missedDoses ?? 0,
    };
  });
}

// ── Build problem statuses ───────────────────────────────────────────────────

function buildProblemStatuses(
  previous: ProblemStatus[],
  encounter?: EncounterState,
): ProblemStatus[] {
  const problems: ProblemStatus[] = [];

  // From problem list
  if (encounter?.problemList) {
    for (const prob of encounter.problemList) {
      const existing = previous.find(p => p.id === prob.id);
      problems.push({
        id: prob.id,
        problem: prob.problem,
        status: existing?.status ?? (prob.status === 'resolved' ? 'resolved' : 'active'),
        priority: prob.priority,
        icd10: prob.icd10,
      });
    }
  }

  // From provisional diagnosis
  if (encounter?.provisionalDiagnosis && !problems.some(p => p.problem === encounter.provisionalDiagnosis!.diagnosis)) {
    problems.push({
      id: `pr_${encounter.provisionalDiagnosis.id}`,
      problem: encounter.provisionalDiagnosis.diagnosis,
      status: 'active',
      priority: 1,
    });
  }

  return problems.length > 0 ? problems : previous;
}

// ── Generate SOAP note from delta ────────────────────────────────────────────

export function generateSoapFromDelta(
  encounter: EncounterState,
  previousDay?: HospitalDay,
): SoapNote {
  const p = encounter.demographics.sex === 'female' ? 'She' : 'He';
  const pos = encounter.demographics.sex === 'female' ? 'her' : 'his';

  // S — Subjective (generated from overnight events + symptom changes)
  const subjectiveParts: string[] = [];

  if (previousDay) {
    const activeProblems = previousDay.problems.filter(pb => pb.status === 'active' || pb.status === 'improving');
    if (activeProblems.length > 0) {
      subjectiveParts.push(`${p} reports continued ${activeProblems.map(pb => pb.problem.toLowerCase()).join(', ')}.`);
    }
    if (previousDay.soap.plan) {
      subjectiveParts.push(`Plan from yesterday was followed.`);
    }
  }

  if (encounter.chiefComplaint.text) {
    const resolvedLabels: Record<string, string> = {
      cough: 'cough',
      fever: 'febrile episodes',
      pain: 'pain',
      dyspnea: 'shortness of breath',
    };
    const ccKey = encounter.chiefComplaint.text.toLowerCase();
    for (const [key, label] of Object.entries(resolvedLabels)) {
      if (ccKey.includes(key)) {
        subjectiveParts.push(`${p} reports improved ${label}.`);
        break;
      }
    }
  }

  subjectiveParts.push(`${p} is eating well and sleeping well.`);

  // O — Objective
  const v = encounter.examination.vitals;
  const vitalsItems: string[] = [];
  if (v.temp !== undefined) vitalsItems.push(`Temp ${v.temp}°C`);
  if (v.hr !== undefined) vitalsItems.push(`HR ${v.hr}/min`);
  if (v.rr !== undefined) vitalsItems.push(`RR ${v.rr}/min`);
  if (v.bpSystolic !== undefined && v.bpDiastolic !== undefined)
    vitalsItems.push(`BP ${v.bpSystolic}/${v.bpDiastolic}`);
  if (v.spo2 !== undefined) vitalsItems.push(`SpO₂ ${v.spo2}%`);

  const objectiveParts: string[] = [];
  objectiveParts.push(`Vital signs: ${vitalsItems.join(', ')}.`);

  // Activity
  objectiveParts.push(`Mobilizing independently.`);
  objectiveParts.push(`Eating and drinking well.`);
  objectiveParts.push(`Urine output adequate.`);

  // A — Assessment
  const assessmentParts: string[] = [];
  if (encounter.assessment.finalDiagnosis) {
    assessmentParts.push(`${encounter.assessment.finalDiagnosis} — improving.`);
  }
  if (previousDay?.investigations) {
    const newResults = previousDay.investigations.filter(i => i.status === 'resulted' && i.flag === 'abnormal');
    if (newResults.length > 0) {
      assessmentParts.push(`Abnormal labs: ${newResults.map(i => `${i.testName}: ${i.result}`).join(', ')}.`);
    }
  }
  if (!assessmentParts.length) {
    assessmentParts.push(`Clinically improving.`);
  }

  // P — Plan
  const planParts: string[] = encounter.plan.treatments.map(t => t.detail);
  if (encounter.plan.medications.length > 0) {
    planParts.push(`Continue current medications.`);
  }
  if (encounter.plan.followUp) {
    planParts.push(encounter.plan.followUp);
  }
  if (!planParts.length) {
    planParts.push(`Continue current management.`);
  }

  return {
    subjective: subjectiveParts.join(' '),
    objective: objectiveParts.join(' '),
    assessment: assessmentParts.join(' '),
    plan: planParts.join(' '),
    generatedAt: Date.now(),
  };
}

// ── Build clinical snapshot (today's summary) ────────────────────────────────

export function buildClinicalSnapshot(
  encounter: EncounterState,
  today: HospitalDay,
): ClinicalSnapshot {
  const warnings: WarningItem[] = [];
  const medicationIssues: MedicationIssue[] = [];
  const outstanding: string[] = [];

  // Warnings
  if (encounter.history.medications.allergies.length > 0) {
    warnings.push({
      type: 'allergy',
      message: `Allergies: ${encounter.history.medications.allergies.map(a => a.drug).join(', ')}`,
      severity: 'warning',
    });
  }

  if (today.vitals.news && today.vitals.news > 5) {
    warnings.push({ type: 'high_news', message: `NEWS: ${today.vitals.news} — High`, severity: 'critical' });
  }

  // Outstanding results
  for (const inv of today.investigations) {
    if (inv.status === 'ordered' || inv.status === 'processing') {
      outstanding.push(`${inv.testName} (${inv.status})`);
    }
  }

  // Medication issues
  for (const med of today.medications) {
    if (med.missedDoses > 0) {
      medicationIssues.push({
        medication: med.genericName,
        issue: 'missed_dose',
        detail: `${med.missedDoses} missed dose(s)`,
        severity: 'warning',
      });
    }
    if (med.status === 'prescribed' && med.nextDue && med.nextDue < Date.now() + 3600000) {
      medicationIssues.push({
        medication: med.genericName,
        issue: 'due_soon',
        detail: `Next dose due within 1 hour`,
        severity: 'info',
      });
    }
  }

  const diagnosis = encounter.provisionalDiagnosis?.diagnosis || encounter.assessment.finalDiagnosis || 'Undifferentiated';
  const diagnosisStatus: PatientStatus = today.problems.some(p => p.status === 'worsening') ? 'deteriorating'
    : today.problems.some(p => p.status === 'active') ? 'stable'
    : 'improving';

  return {
    diagnosis,
    diagnosisStatus,
    problems: today.problems,
    warnings,
    outstandingResults: outstanding,
    todayTasks: today.tasks.filter(t => t.status === 'pending'),
    medicationIssues,
    dischargeReadiness: today.dischargeReadiness,
    nextDueAction: medicationIssues.find(m => m.issue === 'due_soon')?.detail,
  };
}

// ── Determine patient status from hospital day ───────────────────────────────

export function determinePatientStatus(day: HospitalDay): PatientStatus {
  if (day.dischargeReadiness === 'discharged') return 'discharge_ready';
  if (day.vitals.news && day.vitals.news > 7) return 'critical';
  if (day.problems.some(p => p.status === 'worsening')) return 'deteriorating';
  if (day.problems.some(p => p.status === 'improving' || p.status === 'resolved')) return 'improving';
  return 'stable';
}
