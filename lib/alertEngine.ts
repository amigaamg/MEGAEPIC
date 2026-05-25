import type {
  BPEntry,
  PatientTool,
  Prescription,
  AdherenceEntry,
  FollowUp,
  LabOrder,
  SystemAlert,
  AlertTrigger,
  AlertType,
} from "../types";
import { Timestamp } from "firebase/firestore";
import { computeBPStatus } from "./bpStats";

// ─────────────────────────────────────────────────────────────
// ALERT EVALUATION RESULT
// ─────────────────────────────────────────────────────────────

interface AlertEvaluation {
  shouldFire: boolean;
  trigger: AlertTrigger;
  type: AlertType;
  message: string;
  patientMessage: string;
  value: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────
// RULE 1: HYPERTENSIVE CRISIS
// ─────────────────────────────────────────────────────────────

export function evalBPCrisis(
  entry: BPEntry,
  tool: PatientTool
): AlertEvaluation {
  const { systolicCritical, diastolicCritical } = tool.alertThresholds;
  const isCrisis = entry.systolic >= systolicCritical || entry.diastolic >= diastolicCritical;
  return {
    shouldFire: isCrisis,
    trigger: "bp_crisis",
    type: "critical",
    message: `⚠️ CRISIS: BP ${entry.systolic}/${entry.diastolic} mmHg recorded. Threshold: ≥${systolicCritical}/≥${diastolicCritical}. Immediate review required.`,
    patientMessage: `Your blood pressure reading of ${entry.systolic}/${entry.diastolic} is dangerously high. Please seek emergency care immediately or call your doctor now.`,
    value: { systolic: entry.systolic, diastolic: entry.diastolic, threshold: `${systolicCritical}/${diastolicCritical}` },
  };
}

// ─────────────────────────────────────────────────────────────
// RULE 2: HYPERTENSIVE EMERGENCY PATTERN (3 crisis in 7 days)
// ─────────────────────────────────────────────────────────────

export function evalEmergencyPattern(
  recentEntries: BPEntry[],
  tool: PatientTool
): AlertEvaluation {
  const { systolicCritical, diastolicCritical } = tool.alertThresholds;
  const msDay = 86_400_000;
  const last7 = recentEntries.filter(
    (e) => Date.now() - e.timestamp.toMillis() <= 7 * msDay
  );
  const crisisCount = last7.filter(
    (e) => e.systolic >= systolicCritical || e.diastolic >= diastolicCritical
  ).length;

  return {
    shouldFire: crisisCount >= 3,
    trigger: "bp_emergency_pattern",
    type: "critical",
    message: `🚨 EMERGENCY PATTERN: ${crisisCount} hypertensive crisis readings in the last 7 days. Patient requires urgent clinical review and possible hospitalisation.`,
    patientMessage: `Your doctor has been alerted that your blood pressure has been critically high multiple times this week. Please attend clinic urgently.`,
    value: { crisisCount, window: "7 days" },
  };
}

// ─────────────────────────────────────────────────────────────
// RULE 3: UNCONTROLLED BP PATTERN (7 above target in 14 days)
// ─────────────────────────────────────────────────────────────

export function evalUncontrolledPattern(
  recentEntries: BPEntry[],
  tool: PatientTool
): AlertEvaluation {
  const { systolicTarget, diastolicTarget, uncontrolledReadingsCount, uncontrolledReadingsDays } = tool.alertThresholds;
  const msDay = 86_400_000;
  const windowEntries = recentEntries.filter(
    (e) => Date.now() - e.timestamp.toMillis() <= uncontrolledReadingsDays * msDay
  );
  const aboveTarget = windowEntries.filter(
    (e) => e.systolic > systolicTarget || e.diastolic > diastolicTarget
  ).length;

  return {
    shouldFire: aboveTarget >= uncontrolledReadingsCount,
    trigger: "uncontrolled_bp_pattern",
    type: "warning",
    message: `⚠️ UNCONTROLLED HTN: ${aboveTarget} of last ${windowEntries.length} readings above target (${systolicTarget}/${diastolicTarget} mmHg) over ${uncontrolledReadingsDays} days. Consider medication adjustment.`,
    patientMessage: `Your blood pressure has been above the target level several times recently. Your doctor has been notified and may contact you about your medications.`,
    value: { aboveTarget, totalReadings: windowEntries.length, target: `${systolicTarget}/${diastolicTarget}` },
  };
}

// ─────────────────────────────────────────────────────────────
// RULE 4: MEDICATION NON-ADHERENCE (<70% over 14 days)
// ─────────────────────────────────────────────────────────────

export function evalNonAdherence(
  adherenceEntries: AdherenceEntry[],
  prescription: Prescription,
  tool: PatientTool
): AlertEvaluation {
  const { adherenceLow } = tool.alertThresholds;
  const msDay = 86_400_000;
  const last14 = adherenceEntries.filter(
    (a) => a.prescriptionId === prescription.id &&
           Date.now() - a.date.toMillis() <= 14 * msDay
  );
  if (!last14.length) return { shouldFire: false, trigger: "medication_non_adherence", type: "warning", message: "", patientMessage: "", value: {} };

  const taken = last14.filter((a) => a.taken).length;
  const pct   = Math.round((taken / last14.length) * 100);

  return {
    shouldFire: pct < adherenceLow,
    trigger: "medication_non_adherence",
    type: "warning",
    message: `💊 LOW ADHERENCE: ${prescription.drug} ${prescription.dose} — ${pct}% adherence over 14 days (threshold: ${adherenceLow}%). Counselling recommended at next visit.`,
    patientMessage: `It looks like you may have missed some doses of ${prescription.drug}. Taking your medication every day is important for blood pressure control. Please speak to your doctor if you're having trouble.`,
    value: { drug: prescription.drug, dose: prescription.dose, adherencePct: pct, threshold: adherenceLow },
  };
}

// ─────────────────────────────────────────────────────────────
// RULE 5: MISSED FOLLOW-UP
// ─────────────────────────────────────────────────────────────

export function evalMissedFollowUp(followUp: FollowUp): AlertEvaluation {
  const msDay = 86_400_000;
  const isOverdue =
    followUp.status === "scheduled" &&
    Date.now() - followUp.scheduledDate.toMillis() > 2 * msDay;

  return {
    shouldFire: isOverdue,
    trigger: "missed_follow_up",
    type: "warning",
    message: `📅 MISSED VISIT: Scheduled follow-up on ${followUp.scheduledDate.toDate().toDateString()} was not attended. Consider rescheduling.`,
    patientMessage: `You missed your scheduled visit. Please contact the clinic to reschedule your appointment as soon as possible.`,
    value: { scheduledDate: followUp.scheduledDate.toDate().toISOString(), type: followUp.type },
  };
}

// ─────────────────────────────────────────────────────────────
// RULE 6: OVERDUE LAB RESULTS (ordered >7 days, no results)
// ─────────────────────────────────────────────────────────────

export function evalOverdueLab(labOrder: LabOrder): AlertEvaluation {
  const msDay = 86_400_000;
  const isOverdue =
    labOrder.status === "pending" &&
    Date.now() - labOrder.orderedAt.toMillis() > 7 * msDay;

  return {
    shouldFire: isOverdue,
    trigger: "overdue_lab",
    type: "warning",
    message: `🧪 OVERDUE LABS: Lab order (${labOrder.tests.join(", ")}) placed ${Math.floor((Date.now() - labOrder.orderedAt.toMillis()) / msDay)} days ago with no results. Follow up with patient.`,
    patientMessage: `Your doctor has requested blood tests that have not been done yet. Please visit your nearest laboratory as soon as possible.`,
    value: { tests: labOrder.tests, orderedAt: labOrder.orderedAt.toDate().toISOString() },
  };
}

// ─────────────────────────────────────────────────────────────
// RULE 7: HYPOTENSION DETECTED
// ─────────────────────────────────────────────────────────────

export function evalHypotension(
  entry: BPEntry,
  tool: PatientTool
): AlertEvaluation {
  const { hypotensionSystolic } = tool.alertThresholds;
  return {
    shouldFire: entry.systolic <= hypotensionSystolic,
    trigger: "hypotension_detected",
    type: "critical",
    message: `⬇️ HYPOTENSION: BP ${entry.systolic}/${entry.diastolic} mmHg. SBP ≤${hypotensionSystolic}. Consider medication reduction — check for over-treatment.`,
    patientMessage: `Your blood pressure is lower than normal (${entry.systolic}/${entry.diastolic}). You may feel dizzy or faint. Please sit down and contact your doctor.`,
    value: { systolic: entry.systolic, diastolic: entry.diastolic, threshold: hypotensionSystolic },
  };
}

// ─────────────────────────────────────────────────────────────
// RULE 8: BP IMPROVING (positive reinforcement)
// ─────────────────────────────────────────────────────────────

export function evalBPImproving(
  recentEntries: BPEntry[],
  tool: PatientTool
): AlertEvaluation {
  const msDay = 86_400_000;
  const last7 = recentEntries.filter(e => Date.now() - e.timestamp.toMillis() <= 7 * msDay);
  const prev7s = Date.now() - 14 * msDay;
  const prev7e = Date.now() - 7 * msDay;
  const prior7 = recentEntries.filter(e => {
    const ms = e.timestamp.toMillis();
    return ms >= prev7s && ms < prev7e;
  });

  if (last7.length < 3 || prior7.length < 3) return { shouldFire: false, trigger: "bp_improving", type: "info", message: "", patientMessage: "", value: {} };

  const avg = (arr: BPEntry[]) => arr.reduce((s, e) => s + e.systolic, 0) / arr.length;
  const improvement = avg(prior7) - avg(last7);

  return {
    shouldFire: improvement >= 10,
    trigger: "bp_improving",
    type: "info",
    message: `✅ IMPROVEMENT: Average systolic BP dropped by ${Math.round(improvement)} mmHg this week vs last week. Treatment response is positive.`,
    patientMessage: `Great news — your blood pressure has improved by ${Math.round(improvement)} mmHg this week! Keep taking your medications and following your doctor's advice.`,
    value: { improvementMmHg: Math.round(improvement), currentAvg: Math.round(avg(last7)), priorAvg: Math.round(avg(prior7)) },
  };
}

// ─────────────────────────────────────────────────────────────
// ALERT BUILDER — creates a SystemAlert from an evaluation
// ─────────────────────────────────────────────────────────────

export function buildAlert(
  evaluation: AlertEvaluation,
  toolId: string,
  patientId: string,
  doctorId: string
): Omit<SystemAlert, "id"> {
  return {
    toolId,
    patientId,
    doctorId,
    type:       evaluation.type,
    trigger:    evaluation.trigger,
    value:      evaluation.value,
    message:    evaluation.message,
    patientMessage: evaluation.patientMessage,
    sentAt:     Timestamp.now(),
    isActive:   true,
    notificationChannels: evaluation.type === "critical"
      ? ["push", "sms", "in_app"]
      : evaluation.type === "warning"
      ? ["push", "in_app"]
      : ["in_app"],
  };
}