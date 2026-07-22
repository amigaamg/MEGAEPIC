import { Timestamp } from "firebase/firestore";

export interface TherapyDayInfo {
  currentDay: number;
  totalDays: number;
  daysRemaining: number;
  percentage: number;
  label: string;
  status: "not_started" | "in_progress" | "completed" | "overdue";
}

export interface DoseAdministrationSummary {
  totalScheduled: number;
  totalGiven: number;
  totalMissed: number;
  totalPending: number;
  compliancePercentage: number;
  lastGivenAt: Date | null;
  nextDueAt: Date | null;
  status: "on_track" | "attention" | "critical" | "not_started";
}

export interface MedicationScheduleEvent {
  id: string;
  prescribedAt: Date;
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  durationDays: number;
  startDate: Date;
  endDate: Date;
  therapyDay: TherapyDayInfo;
  doses: DoseAdministrationSummary;
}

function toDate(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === "function") return v.toDate();
  if (typeof v === "string") return new Date(v);
  if (typeof v === "number") return new Date(v);
  return null;
}

export function calculateTherapyDay(
  startDate: Date | Timestamp | null | undefined,
  duration: string | number | null | undefined
): TherapyDayInfo {
  const start = toDate(startDate);
  if (!start) {
    return { currentDay: 0, totalDays: 0, daysRemaining: 0, percentage: 0, label: "Not started", status: "not_started" };
  }

  const totalDays = parseInt(String(duration || "0")) || 0;
  if (totalDays <= 0) {
    return { currentDay: 0, totalDays: 0, daysRemaining: 0, percentage: 0, label: "Ongoing", status: "in_progress" };
  }

  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const currentDay = Math.max(1, diffDays + 1);
  const daysRemaining = Math.max(0, totalDays - currentDay);
  const percentage = Math.min(100, Math.round((currentDay / totalDays) * 100));

  let status: TherapyDayInfo["status"] = "in_progress";
  if (currentDay > totalDays) status = "completed";
  if (currentDay <= 0) status = "not_started";

  return {
    currentDay: currentDay > totalDays ? totalDays : currentDay,
    totalDays,
    daysRemaining,
    percentage,
    label: `${currentDay}/${totalDays}`,
    status,
  };
}

export function calculateDoseCompliance(
  schedules: { status: string; scheduledTime?: any; actualTime?: any }[]
): DoseAdministrationSummary {
  const totalScheduled = schedules.length;
  const totalGiven = schedules.filter(s => s.status === "taken" || s.status === "delayed").length;
  const totalMissed = schedules.filter(s => s.status === "missed" || s.status === "omitted").length;
  const totalPending = schedules.filter(s => s.status === "pending" || s.status === "held").length;

  const givenSchedules = schedules
    .filter(s => (s.status === "taken" || s.status === "delayed") && s.actualTime)
    .sort((a, b) => (toDate(b.actualTime)?.getTime() || 0) - (toDate(a.actualTime)?.getTime() || 0));

  const pendingSchedules = schedules
    .filter(s => s.status === "pending" && s.scheduledTime)
    .sort((a, b) => (toDate(a.scheduledTime)?.getTime() || 0) - (toDate(b.scheduledTime)?.getTime() || 0));

  const compliancePercentage = totalScheduled > 0 ? Math.round((totalGiven / totalScheduled) * 100) : 100;
  const lastGivenAt = givenSchedules.length > 0 ? toDate(givenSchedules[0].actualTime) : null;
  const nextDueAt = pendingSchedules.length > 0 ? toDate(pendingSchedules[0].scheduledTime) : null;

  let status: DoseAdministrationSummary["status"] = "on_track";
  if (totalScheduled === 0) status = "not_started";
  else if (compliancePercentage < 50) status = "critical";
  else if (compliancePercentage < 80) status = "attention";

  return { totalScheduled, totalGiven, totalMissed, totalPending, compliancePercentage, lastGivenAt, nextDueAt, status };
}

export function getDoseComplianceColor(status: string): string {
  switch (status) {
    case "on_track": return "#10b981";
    case "attention": return "#f59e0b";
    case "critical": return "#ef4444";
    case "not_started": return "#9ca3af";
    default: return "#6b7280";
  }
}

export function getTherapyDayColor(status: TherapyDayInfo["status"]): string {
  switch (status) {
    case "in_progress": return "#3b82f6";
    case "completed": return "#10b981";
    case "not_started": return "#9ca3af";
    case "overdue": return "#ef4444";
    default: return "#6b7280";
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case "on_track": return "✓";
    case "attention": return "⚠";
    case "critical": return "✗";
    case "not_started": return "○";
    default: return "•";
  }
}

export function calculateExpectedDosesGiven(
  startDate: Date | Timestamp | null | undefined,
  frequency: string,
  dosesGiven: number
): { expected: number; given: number; adherence: number } {
  const start = toDate(startDate);
  if (!start) return { expected: 0, given: 0, adherence: 0 };

  const now = new Date();
  const hoursSinceStart = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (hoursSinceStart < 0) return { expected: 0, given: 0, adherence: 0 };

  const freqMap: Record<string, number> = {
    "OD": 1, "Once daily": 1, "daily": 1, "QD": 1,
    "BD": 2, "Twice daily": 2, "BID": 2,
    "TDS": 3, "Three times daily": 3, "TID": 3,
    "QDS": 4, "Four times daily": 4, "QID": 4,
    "Q4H": 6, "Q6H": 4, "Q8H": 3, "Q12H": 2,
    "Nocte": 1, "At night": 1,
    "Weekly": 1 / 7, "Once weekly": 1 / 7,
  };
  const dosesPerDay = freqMap[frequency] || 0;
  const expected = Math.round((hoursSinceStart / 24) * dosesPerDay);
  const expectedCapped = Math.max(1, expected);
  const adherence = Math.min(100, Math.round((dosesGiven / expectedCapped) * 100));

  return { expected: expectedCapped, given: dosesGiven, adherence };
}
