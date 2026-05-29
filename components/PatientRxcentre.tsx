/**
 * PatientRxCenter.tsx
 * AMEXAN — Full Medication Management Center
 * Doctor + Patient Views | Adherence Engine | Pharmacy | PDF Prescription
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust to your firebase config path
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// ─────────────────────────── TYPES ───────────────────────────

type FrequencyCode = "OD" | "BD" | "TDS" | "QID" | "PRN" | "STAT" | "Weekly" | "Nocte";

interface FrequencyConfig {
  code: FrequencyCode;
  label: string;
  intervalHours: number;
  dosesPerDay: number;
  gracePeriodMinutes: number;
}

const FREQUENCY_MAP: Record<FrequencyCode, FrequencyConfig> = {
  OD:     { code: "OD",     label: "Once Daily",       intervalHours: 24,   dosesPerDay: 1, gracePeriodMinutes: 120 },
  BD:     { code: "BD",     label: "Twice Daily",      intervalHours: 12,   dosesPerDay: 2, gracePeriodMinutes: 90 },
  TDS:    { code: "TDS",    label: "Three Times Daily", intervalHours: 8,   dosesPerDay: 3, gracePeriodMinutes: 60 },
  QID:    { code: "QID",    label: "Four Times Daily",  intervalHours: 6,   dosesPerDay: 4, gracePeriodMinutes: 45 },
  PRN:    { code: "PRN",    label: "As Needed",         intervalHours: 0,   dosesPerDay: 0, gracePeriodMinutes: 0 },
  STAT:   { code: "STAT",   label: "Immediately",       intervalHours: 0,   dosesPerDay: 0, gracePeriodMinutes: 0 },
  Weekly: { code: "Weekly", label: "Once Weekly",       intervalHours: 168, dosesPerDay: 0.14, gracePeriodMinutes: 240 },
  Nocte:  { code: "Nocte",  label: "At Night",          intervalHours: 24,  dosesPerDay: 1, gracePeriodMinutes: 120 },
};

interface Prescription {
  id: string;
  prescriptionId?: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  encounterId?: string;
  visitId?: string;
  medicationName: string;
  genericName?: string;
  brandName?: string;
  dose: { value: number; unit: string } | string;
  route: string;
  frequency: string;
  frequencyCode?: FrequencyCode;
  indication: string;
  therapeuticClass?: string;
  instructions: string;
  sideEffects?: string[];
  warnings?: string;
  startDate: Timestamp | Date | null;
  expectedEndDate?: Timestamp | Date | null;
  actualStopDate?: Timestamp | Date | null;
  endDate?: Timestamp | Date | null;
  duration?: string;
  status: "active" | "completed" | "stopped" | "paused";
  active?: boolean;
  adherenceStatus?: "excellent" | "good" | "moderate" | "poor";
  possessionStatus?: { hasMedication: boolean; acquiredAt?: Timestamp; source?: string };
  refillInfo?: { totalRefills: number; remainingRefills: number };
  refills?: number;
  monitoring?: { requiresMonitoring: boolean; monitoringParameters?: string[] };
  changeHistory?: Array<{ changeType: string; changedBy: string; date: string; previousDose?: string; newDose?: string; reason?: string }>;
  version?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  prescribedAt?: Timestamp;
}

interface MedSchedule {
  id: string;
  prescriptionId: string;
  patientId: string;
  scheduledTime: Timestamp;
  doseNumber: number;
  status: "pending" | "taken" | "delayed" | "missed" | "skipped";
  gracePeriodMinutes: number;
  actualTime?: Timestamp;
  administeredBy?: string;
  notes?: string;
  createdAt?: Timestamp;
}

interface AdherenceRecord {
  id: string;
  prescriptionId: string;
  patientId: string;
  date: string;
  totalScheduled: number;
  totalTaken: number;
  totalMissed: number;
  totalDelayed: number;
  adherencePercentage: number;
}

interface Props {
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientSex?: string;
  viewMode?: "patient" | "doctor" | "nurse";
  currentUserId?: string;
  currentUserName?: string;
  hospitalName?: string;
  doctorLicense?: string;
}

// ─────────────────────────── HELPERS ───────────────────────────

const toDate = (v: Timestamp | Date | null | undefined): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof (v as any).toDate === "function") return (v as any).toDate();
  return null;
};

const fmt = (d: Date | null, opts?: Intl.DateTimeFormatOptions) =>
  d ? d.toLocaleDateString("en-GB", opts || { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtTime = (d: Date | null) =>
  d ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—";

const fmtFull = (d: Date | null) => (d ? `${fmt(d)} ${fmtTime(d)}` : "—");

const getDoseLabel = (dose: any): string => {
  if (!dose) return "—";
  if (typeof dose === "string") return dose;
  return `${dose.value}${dose.unit}`;
};

const getFreqCode = (freq: string): FrequencyCode => {
  const map: Record<string, FrequencyCode> = {
    "once daily": "OD", "daily": "OD", "od": "OD",
    "twice daily": "BD", "bd": "BD", "bid": "BD",
    "three times daily": "TDS", "tds": "TDS", "tid": "TDS",
    "four times daily": "QID", "qid": "QID",
    "as needed": "PRN", "prn": "PRN",
    "stat": "STAT", "immediately": "STAT",
    "weekly": "Weekly", "once weekly": "Weekly",
    "nocte": "Nocte", "at night": "Nocte", "bedtime": "Nocte",
  };
  return map[freq.toLowerCase()] || "OD";
};

const adherencePct = (taken: number, scheduled: number) =>
  scheduled === 0 ? 100 : Math.round((taken / scheduled) * 100);

const adherenceBadge = (pct: number) => {
  if (pct >= 90) return { label: "Excellent", color: "#10b981", bg: "#d1fae5", icon: "✦" };
  if (pct >= 75) return { label: "Good",      color: "#f59e0b", bg: "#fef3c7", icon: "◆" };
  if (pct >= 50) return { label: "Moderate",  color: "#f97316", bg: "#ffedd5", icon: "▲" };
  return            { label: "Poor",       color: "#ef4444", bg: "#fee2e2", icon: "✖" };
};

const timeUntil = (d: Date | null): string => {
  if (!d) return "";
  const diff = d.getTime() - Date.now();
  if (diff < 0) return "overdue";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
};

// ─────────────────────────── SUB-COMPONENTS ───────────────────────────

// Animated countdown ring
const AdherenceRing = ({ pct, size = 80 }: { pct: number; size?: number }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const badge = adherenceBadge(pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={badge.color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle"
        style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px`, fill: badge.color, fontSize: 14, fontWeight: 800 }}>
        {pct}%
      </text>
    </svg>
  );
};

// Pill status dot
const StatusDot = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    active: "#10b981", completed: "#3b82f6", stopped: "#9ca3af",
    paused: "#f59e0b", pending: "#f59e0b", taken: "#10b981",
    delayed: "#f97316", missed: "#ef4444", skipped: "#9ca3af",
  };
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: colors[status] || "#9ca3af",
      boxShadow: status === "active" ? `0 0 0 3px ${colors[status]}33` : "none",
    }} />
  );
};

// Timeline dot
const TimelineDot = ({ type }: { type: string }) => {
  const map: Record<string, { bg: string; icon: string }> = {
    started:        { bg: "#10b981", icon: "▶" },
    restarted:      { bg: "#3b82f6", icon: "↺" },
    dose_increased: { bg: "#8b5cf6", icon: "↑" },
    dose_decreased: { bg: "#f97316", icon: "↓" },
    stopped:        { bg: "#ef4444", icon: "■" },
    paused:         { bg: "#f59e0b", icon: "⏸" },
    completed:      { bg: "#6366f1", icon: "✓" },
  };
  const m = map[type] || { bg: "#9ca3af", icon: "•" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 26, height: 26, borderRadius: "50%",
      background: m.bg, color: "#fff", fontSize: 10, fontWeight: 800, flexShrink: 0,
    }}>{m.icon}</span>
  );
};

// Weekly heatmap
const WeekHeatmap = ({ records }: { records: AdherenceRecord[] }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const rec = records.find(r => r.date === key);
    return { day: days[d.getDay() === 0 ? 6 : d.getDay() - 1], pct: rec ? rec.adherencePercentage : null };
  });
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {last7.map((d, i) => {
        const pct = d.pct ?? 0;
        const color = d.pct === null ? "#e5e7eb" : pct >= 90 ? "#10b981" : pct >= 75 ? "#f59e0b" : pct >= 50 ? "#f97316" : "#ef4444";
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 28, height: Math.max(8, (pct / 100) * 48), background: color,
              borderRadius: 4, transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)",
              opacity: d.pct === null ? 0.3 : 1,
            }} title={d.pct !== null ? `${pct}%` : "No data"} />
            <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────── PDF GENERATION ───────────────────────────

const generatePrescriptionPDF = (
  rxList: Prescription[],
  patientName: string,
  patientAge: number | undefined,
  patientSex: string | undefined,
  hospitalName: string,
  doctorName: string,
  doctorLicense: string,
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, W, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text(hospitalName || "AMEXAN Medical Centre", W / 2, 10, { align: "center" });
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text("PRESCRIPTION / Rx", W / 2, 17, { align: "center" });

  // Patient info
  doc.setTextColor(30, 30, 30);
  const now = new Date();
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text(`Patient: ${patientName}`, 8, 30);
  doc.text(`Age: ${patientAge ?? "—"} yrs | Sex: ${patientSex ?? "—"}`, 8, 36);
  doc.text(`Date: ${fmt(now)} ${fmtTime(now)}`, W - 8, 30, { align: "right" });
  doc.text(`Rx No: AMX-${Date.now().toString().slice(-6)}`, W - 8, 36, { align: "right" });

  doc.setDrawColor(200, 200, 200);
  doc.line(8, 40, W - 8, 40);

  // Rx symbol
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110);
  doc.text("℞", 8, 52);

  // Medications table
  const tableData = rxList.map((rx, i) => [
    `${i + 1}. ${rx.medicationName}${rx.genericName && rx.genericName !== rx.medicationName ? `\n(${rx.genericName})` : ""}`,
    getDoseLabel(rx.dose),
    rx.route,
    rx.frequency,
    rx.duration ? `${rx.duration} days` : "Ongoing",
    rx.instructions || "—",
    rx.possessionStatus?.hasMedication ? "✓ Have" : "— Buy",
  ]);

  (doc as any).autoTable({
    startY: 56,
    head: [["Medication", "Dose", "Route", "Freq.", "Duration", "Instructions", "Status"]],
    body: tableData,
    styles: { fontSize: 7, cellPadding: 2, lineColor: [220, 220, 220], lineWidth: 0.2 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 255, 254] },
    columnStyles: { 0: { cellWidth: 35 }, 5: { cellWidth: 28 } },
    margin: { left: 8, right: 8 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Doctor signature band
  doc.setFillColor(248, 250, 252);
  doc.rect(0, finalY, W, 22, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
  doc.text(`Dr. ${doctorName}`, W - 8, finalY + 8, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7);
  doc.text(`License: ${doctorLicense || "—"}`, W - 8, finalY + 14, { align: "right" });
  doc.setFontSize(7); doc.setTextColor(120, 120, 120);
  doc.text("This prescription is valid for 30 days from date of issue.", 8, finalY + 16);

  doc.save(`Rx_${patientName.replace(/\s/g, "_")}_${now.toISOString().split("T")[0]}.pdf`);
};

// ─────────────────────────── ADHERENCE ENGINE ───────────────────────────

const scheduleNextDoses = async (
  prescription: Prescription,
  firstTakenTime: Date,
  patientId: string,
) => {
  const freqCode = (prescription.frequencyCode || getFreqCode(prescription.frequency)) as FrequencyCode;
  const config = FREQUENCY_MAP[freqCode];
  if (!config || config.intervalHours === 0) return;

  const duration = parseInt(prescription.duration || "30") || 30;
  const endDate = toDate(prescription.expectedEndDate || prescription.endDate) ||
    new Date(firstTakenTime.getTime() + duration * 24 * 3600000);

  const schedules: Omit<MedSchedule, "id">[] = [];
  let next = new Date(firstTakenTime.getTime() + config.intervalHours * 3600000);

  while (next <= endDate) {
    schedules.push({
      prescriptionId: prescription.id,
      patientId,
      scheduledTime: Timestamp.fromDate(next),
      doseNumber: schedules.length + 2,
      status: "pending",
      gracePeriodMinutes: config.gracePeriodMinutes,
      createdAt: serverTimestamp() as any,
    });
    next = new Date(next.getTime() + config.intervalHours * 3600000);
    if (schedules.length > 200) break; // safety cap
  }

  const col = collection(db, "medicationSchedules");
  await Promise.all(schedules.map(s => addDoc(col, s)));
};

const recordAdministration = async (
  schedule: MedSchedule,
  patientId: string,
  administeredBy: { type: string; userId: string; name: string },
  notes = "",
) => {
  const now = new Date();
  const scheduledTime = toDate(schedule.scheduledTime)!;
  const diffMin = (now.getTime() - scheduledTime.getTime()) / 60000;
  const status: string = diffMin <= 0 ? "taken" : diffMin <= schedule.gracePeriodMinutes ? "taken" : "delayed";

  // Record administration
  await addDoc(collection(db, "medicationAdministrations"), {
    prescriptionId: schedule.prescriptionId,
    patientId,
    scheduledTime: schedule.scheduledTime,
    actualTime: Timestamp.fromDate(now),
    administeredBy,
    status,
    delayMinutes: Math.max(0, Math.round(diffMin)),
    notes,
    createdAt: serverTimestamp(),
  });

  // Update schedule
  await updateDoc(doc(db, "medicationSchedules", schedule.id), {
    status,
    actualTime: Timestamp.fromDate(now),
    updatedAt: serverTimestamp(),
  });

  // Update daily adherence aggregate
  const dateKey = now.toISOString().split("T")[0];
  const adherenceId = `${patientId}_${dateKey}`;
  const adherenceRef = doc(db, "medicationAdherence", adherenceId);
  const existing = await getDocs(query(collection(db, "medicationAdherence"),
    where("patientId", "==", patientId), where("date", "==", dateKey)));
  if (existing.empty) {
    await setDoc(adherenceRef, {
      patientId, date: dateKey,
      totalScheduled: 1, totalTaken: status !== "missed" ? 1 : 0,
      totalMissed: 0, totalDelayed: status === "delayed" ? 1 : 0,
      adherencePercentage: 100,
      activePrescriptions: 1,
      generatedAt: serverTimestamp(),
    });
  } else {
    const d = existing.docs[0].data();
    const taken = d.totalTaken + (status !== "missed" ? 1 : 0);
    const delayed = d.totalDelayed + (status === "delayed" ? 1 : 0);
    const sched = d.totalScheduled + 1;
    await updateDoc(existing.docs[0].ref, {
      totalTaken: taken, totalDelayed: delayed, totalScheduled: sched,
      adherencePercentage: Math.round((taken / sched) * 100),
      updatedAt: serverTimestamp(),
    });
  }

  // Recalculate next dose time if taken late (dynamic rescheduling)
  if (status === "delayed") {
    const pendingSchedules = await getDocs(query(
      collection(db, "medicationSchedules"),
      where("prescriptionId", "==", schedule.prescriptionId),
      where("status", "==", "pending"),
      orderBy("scheduledTime", "asc"),
    ));
    const freqCode = getFreqCode(schedule.prescriptionId); // fallback
    // This would recalculate next doses from now — simplified here
    // In production: delete old pending schedules and recreate from now
    if (!pendingSchedules.empty) {
      const nextSched = pendingSchedules.docs[0];
      // Shift all future schedules by the delay
      pendingSchedules.docs.forEach(async (s) => {
        const st = toDate(s.data().scheduledTime)!;
        const shifted = new Date(st.getTime() + diffMin * 60000);
        await updateDoc(s.ref, { scheduledTime: Timestamp.fromDate(shifted) });
      });
    }
  }
};

// ─────────────────────────── MAIN COMPONENT ───────────────────────────

export default function PatientRxCenter({
  patientId,
  patientName,
  patientAge,
  patientSex,
  viewMode = "patient",
  currentUserId = "",
  currentUserName = "",
  hospitalName = "AMEXAN Medical Centre",
  doctorLicense = "",
}: Props) {
  return null;
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [schedules, setSchedules] = useState<MedSchedule[]>([]);
  const [adherenceRecords, setAdherenceRecords] = useState<AdherenceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "history" | "adherence" | "pharmacy">("active");
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [takingDose, setTakingDose] = useState<string | null>(null);
  const [markedOwned, setMarkedOwned] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "warning" | "error" } | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "stopped" | "completed">("all");

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Live clock
  useEffect(() => {
    tickRef.current = setInterval(() => setNow(new Date()), 30000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  // ── Firestore listeners
  useEffect(() => {
    if (!patientId) return;
    setLoading(true);

    const rxQ = query(collection(db, "prescriptions"), where("patientId", "==", patientId), orderBy("createdAt", "desc"));
    const unsubRx = onSnapshot(rxQ, snap => {
      setPrescriptions(snap.docs.map(d => ({ ...d.data(), id: d.id } as Prescription)));
      setLoading(false);
    });

    const schQ = query(
      collection(db, "medicationSchedules"),
      where("patientId", "==", patientId),
      where("status", "in", ["pending", "taken", "delayed", "missed"]),
      orderBy("scheduledTime", "asc"),
    );
    const unsubSch = onSnapshot(schQ, snap => {
      setSchedules(snap.docs.map(d => ({ ...d.data(), id: d.id } as MedSchedule)));
    });

    const adhQ = query(collection(db, "medicationAdherence"), where("patientId", "==", patientId), orderBy("date", "desc"));
    const unsubAdh = onSnapshot(adhQ, snap => {
      setAdherenceRecords(snap.docs.map(d => ({ ...d.data(), id: d.id } as AdherenceRecord)));
    });

    return () => { unsubRx(); unsubSch(); unsubAdh(); };
  }, [patientId]);

  // ── Computed helpers
  const activeMeds = prescriptions.filter(p => p.status === "active" || p.active === true);
  const stoppedMeds = prescriptions.filter(p => p.status === "stopped" || p.status === "completed");

  const todaySchedules = schedules.filter(s => {
    const d = toDate(s.scheduledTime);
    if (!d) return false;
    return d.toDateString() === now.toDateString();
  });

  const overallAdherence = adherenceRecords.length > 0
    ? Math.round(adherenceRecords.slice(0, 30).reduce((a, r) => a + r.adherencePercentage, 0) / Math.min(adherenceRecords.length, 30))
    : 100;

  const missedToday = todaySchedules.filter(s => s.status === "missed").length;
  const dueNow = todaySchedules.filter(s => {
    if (s.status !== "pending") return false;
    const d = toDate(s.scheduledTime);
    return d && d <= new Date(now.getTime() + 30 * 60000);
  }).length;

  const showNotif = (msg: string, type: "success" | "warning" | "error") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Handle first dose
  const handleFirstDose = useCallback(async (rx: Prescription) => {
    setTakingDose(rx.id);
    try {
      const now = new Date();
      // Record the first administration
      await addDoc(collection(db, "medicationAdministrations"), {
        prescriptionId: rx.id,
        patientId,
        scheduledTime: Timestamp.fromDate(now),
        actualTime: Timestamp.fromDate(now),
        administeredBy: { type: viewMode === "nurse" ? "nurse" : "patient", userId: currentUserId, name: currentUserName || patientName },
        status: "taken",
        delayMinutes: 0,
        notes: "First dose",
        createdAt: serverTimestamp(),
      });
      // Schedule subsequent doses
      await scheduleNextDoses(rx, now, patientId);
      // Mark first schedule
      const firstSched: Omit<MedSchedule, "id"> = {
        prescriptionId: rx.id, patientId,
        scheduledTime: Timestamp.fromDate(now),
        doseNumber: 1, status: "taken",
        gracePeriodMinutes: FREQUENCY_MAP[getFreqCode(rx.frequency)]?.gracePeriodMinutes || 90,
        actualTime: Timestamp.fromDate(now),
        createdAt: serverTimestamp() as any,
      };
      await addDoc(collection(db, "medicationSchedules"), firstSched);
      // Update prescription
      await updateDoc(doc(db, "prescriptions", rx.id), {
        "adherenceFirstDose": Timestamp.fromDate(now),
        updatedAt: serverTimestamp(),
      });
      showNotif(`✓ First dose recorded for ${rx.medicationName}. Schedule set!`, "success");
    } catch (e) {
      console.error(e);
      showNotif("Failed to record dose. Try again.", "error");
    } finally {
      setTakingDose(null);
    }
  }, [patientId, currentUserId, currentUserName, patientName, viewMode]);

  // ── Handle subsequent dose
  const handleTakeDose = useCallback(async (schedule: MedSchedule, rx: Prescription) => {
    setTakingDose(schedule.id);
    try {
      await recordAdministration(
        schedule, patientId,
        { type: viewMode === "nurse" ? "nurse" : "patient", userId: currentUserId, name: currentUserName || patientName },
      );
      showNotif(`✓ Dose recorded for ${rx.medicationName}`, "success");
    } catch (e) {
      showNotif("Failed to record dose.", "error");
    } finally {
      setTakingDose(null);
    }
  }, [patientId, currentUserId, currentUserName, patientName, viewMode]);

  // ── Toggle possession
  const handleToggleOwned = useCallback(async (rx: Prescription, owned: boolean) => {
    setMarkedOwned(prev => ({ ...prev, [rx.id]: owned }));
    await updateDoc(doc(db, "prescriptions", rx.id), {
      possessionStatus: { hasMedication: owned, acquiredAt: owned ? serverTimestamp() : null, source: owned ? "External Pharmacy" : null },
      updatedAt: serverTimestamp(),
    });
    showNotif(owned ? `✓ ${rx.medicationName} marked as obtained` : `${rx.medicationName} marked as not yet obtained`, owned ? "success" : "warning");
  }, []);

  // ── CSS vars & design tokens
  const css = `
    :root {
      --rx-bg: #f0fdf9;
      --rx-surface: #ffffff;
      --rx-border: #d1fae5;
      --rx-teal: #0f766e;
      --rx-teal-light: #14b8a6;
      --rx-teal-dim: #ccfbf1;
      --rx-amber: #f59e0b;
      --rx-red: #ef4444;
      --rx-blue: #3b82f6;
      --rx-gray: #6b7280;
      --rx-text: #111827;
      --rx-sub: #6b7280;
      --rx-radius: 16px;
      --rx-radius-sm: 10px;
      --rx-shadow: 0 4px 24px rgba(15,118,110,0.08), 0 1px 3px rgba(0,0,0,0.04);
      --rx-shadow-lg: 0 12px 48px rgba(15,118,110,0.14);
    }

    .rx-center * { box-sizing: border-box; margin: 0; padding: 0; }
    .rx-center { font-family: 'DM Sans', 'Plus Jakarta Sans', 'Segoe UI', sans-serif; background: var(--rx-bg); min-height: 100%; }
    .rx-card { background: var(--rx-surface); border-radius: var(--rx-radius); box-shadow: var(--rx-shadow); border: 1px solid var(--rx-border); overflow: hidden; }
    .rx-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }
    .rx-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; letter-spacing: 0.01em; }
    .rx-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .rx-btn-primary { background: var(--rx-teal); color: #fff; }
    .rx-btn-primary:hover:not(:disabled) { background: #0d9488; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,118,110,0.3); }
    .rx-btn-ghost { background: transparent; color: var(--rx-teal); border: 1.5px solid var(--rx-teal); }
    .rx-btn-ghost:hover:not(:disabled) { background: var(--rx-teal-dim); }
    .rx-btn-danger { background: #fef2f2; color: #ef4444; border: 1.5px solid #fecaca; }
    .rx-tab { padding: 8px 18px; border-radius: 999px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; letter-spacing: 0.04em; text-transform: uppercase; }
    .rx-tab.active { background: var(--rx-teal); color: #fff; }
    .rx-tab:not(.active) { background: transparent; color: var(--rx-sub); }
    .rx-tab:not(.active):hover { background: var(--rx-teal-dim); color: var(--rx-teal); }
    .rx-divider { height: 1px; background: var(--rx-border); margin: 0; }
    .rx-pulse { animation: rxPulse 2s infinite; }
    @keyframes rxPulse { 0%,100%{box-shadow:0 0 0 0 rgba(15,118,110,0.4)} 50%{box-shadow:0 0 0 8px rgba(15,118,110,0)} }
    .rx-shake { animation: rxShake 0.5s; }
    @keyframes rxShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
    .rx-fadein { animation: rxFadeIn 0.4s ease-out; }
    @keyframes rxFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .rx-slide { animation: rxSlide 0.35s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes rxSlide { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    .rx-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--rx-border); border-radius: var(--rx-radius-sm); font-size: 13px; background: #f9fffe; outline: none; transition: border-color 0.2s; }
    .rx-input:focus { border-color: var(--rx-teal); }
    .rx-section-title { font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--rx-sub); }
    @media (max-width: 640px) {
      .rx-grid-2 { grid-template-columns: 1fr !important; }
      .rx-hide-mobile { display: none !important; }
    }
  `;

  // ── Notification toast
  const NotifToast = () => notification ? (
    <div className="rx-fadein" style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: notification.type === "success" ? "#d1fae5" : notification.type === "error" ? "#fee2e2" : "#fef3c7",
      border: `1.5px solid ${notification.type === "success" ? "#6ee7b7" : notification.type === "error" ? "#fca5a5" : "#fcd34d"}`,
      color: notification.type === "success" ? "#065f46" : notification.type === "error" ? "#7f1d1d" : "#78350f",
      padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
      maxWidth: 340, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    }}>{notification.msg}</div>
  ) : null;

  // ── Medication detail modal
  const MedDetailModal = ({ rx }: { rx: Prescription }) => {
    const freqCode = rx.frequencyCode || getFreqCode(rx.frequency);
    const config = FREQUENCY_MAP[freqCode as FrequencyCode];
    const rxSchedules = schedules.filter(s => s.prescriptionId === rx.id);
    const rxAdherence = adherenceRecords.filter(r =>
      rxSchedules.some(s => s.prescriptionId === rx.id)
    );
    const taken = rxSchedules.filter(s => s.status === "taken").length;
    const total = rxSchedules.filter(s => s.status !== "pending").length;
    const pct = total > 0 ? Math.round((taken / total) * 100) : 100;

    const hasFirstDose = rxSchedules.length > 0;
    const nextPending = rxSchedules.find(s => s.status === "pending" && toDate(s.scheduledTime)! > now);
    const nextTime = nextPending ? toDate(nextPending.scheduledTime) : null;

    const isOwned = markedOwned[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;

    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        backdropFilter: "blur(4px)",
      }} onClick={() => setShowDetail(false)}>
        <div className="rx-slide rx-card" style={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 0 }}
          onClick={e => e.stopPropagation()}>

          {/* Modal header */}
          <div style={{ background: "linear-gradient(135deg,#0f766e,#14b8a6)", padding: "24px 24px 20px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8, marginBottom: 6 }}>
                  Medication Details
                </div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{rx.medicationName}</div>
                {rx.genericName && rx.genericName !== rx.medicationName && (
                  <div style={{ fontSize: 13, opacity: 0.85 }}>{rx.genericName}</div>
                )}
              </div>
              <button onClick={() => setShowDetail(false)} style={{
                background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, fontWeight: 700,
              }}>×</button>
            </div>
            {rx.indication && (
              <div style={{ marginTop: 10, display: "inline-flex", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                📋 {rx.indication}
              </div>
            )}
          </div>

          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Adherence ring + stats */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", background: "#f0fdf9", borderRadius: 12, padding: 16 }}>
              <AdherenceRing pct={pct} size={80} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>Adherence</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{taken} of {total} doses taken</div>
                {nextTime && (
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>
                    ⏰ Next dose: {fmtTime(nextTime)} ({timeUntil(nextTime)})
                  </div>
                )}
              </div>
              {/* Possession toggle */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>Have it?</div>
                <button className="rx-btn" onClick={() => handleToggleOwned(rx, !isOwned)} style={{
                  background: isOwned ? "#d1fae5" : "#fef3c7",
                  color: isOwned ? "#065f46" : "#92400e",
                  border: `1.5px solid ${isOwned ? "#6ee7b7" : "#fcd34d"}`,
                  padding: "6px 14px", fontSize: 12,
                }}>
                  {isOwned ? "✓ Have it" : "Buy needed"}
                </button>
              </div>
            </div>

            {/* Drug info grid */}
            <div>
              <div className="rx-section-title" style={{ marginBottom: 12 }}>Prescription Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="rx-grid-2">
                {[
                  { label: "Dose", value: getDoseLabel(rx.dose) },
                  { label: "Route", value: rx.route },
                  { label: "Frequency", value: `${config?.label || rx.frequency} (${freqCode})` },
                  { label: "Duration", value: rx.duration ? `${rx.duration} days` : "Ongoing" },
                  { label: "Start Date", value: fmt(toDate(rx.startDate)) },
                  { label: "Expected End", value: fmt(toDate(rx.expectedEndDate || rx.endDate)) },
                  { label: "Prescribed By", value: rx.doctorName },
                  { label: "Prescribed On", value: fmtFull(toDate(rx.createdAt || rx.startDate)) },
                  { label: "Status", value: rx.status },
                  { label: "Therapeutic Class", value: rx.therapeuticClass || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#f9fffe", borderRadius: 10, padding: "10px 14px", border: "1px solid #d1fae5" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions & Role */}
            {(rx.instructions || rx.indication) && (
              <div style={{ background: "#ecfdf5", borderRadius: 12, padding: 16, border: "1px solid #a7f3d0" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#047857", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Why & How</div>
                {rx.indication && <div style={{ fontSize: 13, color: "#065f46", marginBottom: 6 }}>
                  <strong>For:</strong> {rx.indication}
                </div>}
                {rx.instructions && <div style={{ fontSize: 13, color: "#065f46" }}>
                  <strong>Instructions:</strong> {rx.instructions}
                </div>}
              </div>
            )}

            {/* Side effects */}
            {(rx.sideEffects?.length || rx.warnings) && (
              <div style={{ background: "#fff7ed", borderRadius: 12, padding: 16, border: "1px solid #fed7aa" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>⚠ Side Effects & Warnings</div>
                {rx.sideEffects?.map((se, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#7c2d12", marginBottom: 3 }}>• {se}</div>
                ))}
                {rx.warnings && <div style={{ fontSize: 13, color: "#7c2d12", marginTop: 4 }}>{rx.warnings}</div>}
              </div>
            )}

            {/* Timeline / Change History */}
            {rx.changeHistory && rx.changeHistory.length > 0 && (
              <div>
                <div className="rx-section-title" style={{ marginBottom: 12 }}>Change History</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { changeType: "started", changedBy: rx.doctorName, date: fmt(toDate(rx.createdAt || rx.startDate)) },
                    ...rx.changeHistory,
                  ].map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <TimelineDot type={c.changeType} />
                      <div style={{ flex: 1, paddingTop: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{c.changeType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{c.date} · By {c.changedBy}</div>
                        {c.reason && <div style={{ fontSize: 12, color: "#6b7280" }}>Reason: {c.reason}</div>}
                        {c.previousDose && c.newDose && (
                          <div style={{ fontSize: 12, color: "#6b7280" }}>{c.previousDose} → {c.newDose}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's schedule */}
            {rxSchedules.length > 0 && (
              <div>
                <div className="rx-section-title" style={{ marginBottom: 12 }}>Today's Doses</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {rxSchedules.filter(s => {
                    const d = toDate(s.scheduledTime);
                    return d && d.toDateString() === now.toDateString();
                  }).map(s => {
                    const st = toDate(s.scheduledTime);
                    const at = toDate(s.actualTime);
                    return (
                      <div key={s.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: s.status === "taken" ? "#f0fdf4" : s.status === "missed" ? "#fef2f2" : s.status === "delayed" ? "#fff7ed" : "#fafafa",
                        border: `1px solid ${s.status === "taken" ? "#bbf7d0" : s.status === "missed" ? "#fecaca" : s.status === "delayed" ? "#fed7aa" : "#e5e7eb"}`,
                        borderRadius: 10, padding: "10px 14px",
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>Dose #{s.doseNumber} · {fmtTime(st)}</div>
                          {at && <div style={{ fontSize: 11, color: "#6b7280" }}>Taken at {fmtTime(at)}</div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <StatusDot status={s.status} />
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280" }}>{s.status}</span>
                          {s.status === "pending" && (
                            <button className="rx-btn rx-btn-primary" style={{ padding: "5px 12px", fontSize: 11 }}
                              disabled={takingDose === s.id}
                              onClick={() => handleTakeDose(s, rx)}>
                              {takingDose === s.id ? "..." : "✓ Take"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* First dose CTA */}
            {!hasFirstDose && rx.status === "active" && (
              <div style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", borderRadius: 14, padding: 20, textAlign: "center", border: "1.5px solid #6ee7b7" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>Ready to start this medication?</div>
                <div style={{ fontSize: 12, color: "#047857", marginBottom: 16 }}>
                  Tap below when you take your first dose. We'll set your full schedule automatically.
                </div>
                <button className="rx-btn rx-btn-primary rx-pulse" disabled={takingDose === rx.id}
                  onClick={() => handleFirstDose(rx)} style={{ padding: "12px 28px", fontSize: 14 }}>
                  {takingDose === rx.id ? "⏳ Setting up schedule..." : "💊 I've Taken My First Dose"}
                </button>
              </div>
            )}

            {/* Monitoring */}
            {rx.monitoring?.requiresMonitoring && (
              <div style={{ background: "#eff6ff", borderRadius: 12, padding: 14, border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🔬 Monitoring Required</div>
                <div style={{ fontSize: 13, color: "#1e40af" }}>Parameters: {rx.monitoring.monitoringParameters?.join(", ") || "See doctor"}</div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  // ── Prescription Card
  const RxCard = ({ rx }: { rx: Prescription }) => {
    const rxSchedules = schedules.filter(s => s.prescriptionId === rx.id);
    const taken = rxSchedules.filter(s => s.status === "taken").length;
    const total = rxSchedules.filter(s => s.status !== "pending").length;
    const pct = total > 0 ? Math.round((taken / total) * 100) : (rxSchedules.length === 0 ? null : 100);
    const badge = pct !== null ? adherenceBadge(pct) : null;

    const nextPending = rxSchedules.find(s => s.status === "pending" && toDate(s.scheduledTime)! > now);
    const nextTime = nextPending ? toDate(nextPending.scheduledTime) : null;
    const isOwned = markedOwned[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;
    const isNew = rx.changeHistory?.length === 0 || !rx.changeHistory;
    const freqCode = rx.frequencyCode || getFreqCode(rx.frequency);

    const dueNowForRx = rxSchedules.some(s => {
      if (s.status !== "pending") return false;
      const d = toDate(s.scheduledTime);
      return d && d <= new Date(now.getTime() + 60 * 60000) && d > new Date(now.getTime() - 30 * 60000);
    });

    return (
      <div className={`rx-card rx-fadein ${dueNowForRx ? "rx-pulse" : ""}`}
        style={{ cursor: "pointer", transition: "all 0.2s", border: dueNowForRx ? "2px solid #f59e0b" : "1px solid #d1fae5" }}
        onClick={() => { setSelectedRx(rx); setShowDetail(true); }}>

        {/* Card header */}
        <div style={{
          padding: "16px 18px 12px",
          background: rx.status === "stopped" ? "#f9fafb" : rx.status === "paused" ? "#fffbeb" : "linear-gradient(135deg,#f0fdf9,#ecfdf5)",
          borderBottom: "1px solid #d1fae5",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <StatusDot status={rx.status} />
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0f766e", wordBreak: "break-word" }}>
                  {rx.medicationName}
                </span>
                {isNew && <span className="rx-badge" style={{ background: "#dbeafe", color: "#1d4ed8" }}>NEW</span>}
                {dueNowForRx && <span className="rx-badge" style={{ background: "#fef3c7", color: "#92400e" }}>⏰ DUE</span>}
              </div>
              {rx.genericName && rx.genericName !== rx.medicationName && (
                <div style={{ fontSize: 12, color: "#6b7280" }}>{rx.genericName}</div>
              )}
              {rx.brandName && <div style={{ fontSize: 11, color: "#9ca3af" }}>Brand: {rx.brandName}</div>}
            </div>
            {pct !== null && badge && (
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <AdherenceRing pct={pct} size={52} />
              </div>
            )}
          </div>

          {/* Indication pill */}
          {rx.indication && (
            <span className="rx-badge" style={{ marginTop: 6, background: "#ccfbf1", color: "#0f766e", fontSize: 11 }}>
              {rx.indication}
            </span>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: "12px 18px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { label: "Dose", value: getDoseLabel(rx.dose) },
              { label: "Route", value: rx.route },
              { label: "Frequency", value: freqCode },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f9fffe", borderRadius: 8, padding: "6px 10px" }}>
                <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#111827", marginTop: 2 }}>{value || "—"}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>Start</span>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{fmt(toDate(rx.startDate))}</div>
            </div>
            <div>
              <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>
                {rx.actualStopDate ? "Stopped" : rx.expectedEndDate || rx.endDate ? "Expected End" : "Duration"}
              </span>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                {rx.actualStopDate ? fmt(toDate(rx.actualStopDate)) :
                 rx.expectedEndDate ? fmt(toDate(rx.expectedEndDate)) :
                 rx.endDate ? fmt(toDate(rx.endDate)) :
                 rx.duration ? `${rx.duration} days` : "Ongoing"}
              </div>
            </div>
          </div>

          {/* Possession + next dose */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="rx-btn"
                style={{
                  padding: "5px 12px", fontSize: 11,
                  background: isOwned ? "#d1fae5" : "#fef3c7",
                  color: isOwned ? "#065f46" : "#92400e",
                  border: `1px solid ${isOwned ? "#6ee7b7" : "#fcd34d"}`,
                }}
                onClick={e => { e.stopPropagation(); handleToggleOwned(rx, !isOwned); }}>
                {isOwned ? "✓ Have it" : "○ Buy needed"}
              </button>
              {rx.refills !== undefined && (
                <span className="rx-badge" style={{ background: "#f0f9ff", color: "#0369a1", fontSize: 10 }}>
                  {rx.refills} refills
                </span>
              )}
            </div>
            {nextTime && (
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b" }}>
                ⏰ {fmtTime(nextTime)} {timeUntil(nextTime)}
              </div>
            )}
          </div>

          {/* Dr info */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>👨‍⚕️ {rx.doctorName}</span>
            <span style={{ fontSize: 11, color: "#14b8a6", fontWeight: 700 }}>View Details →</span>
          </div>
        </div>
      </div>
    );
  };

  // ── Today's schedule row
  const ScheduleRow = ({ s }: { s: MedSchedule }) => {
    const rx = prescriptions.find(p => p.id === s.prescriptionId);
    if (!rx) return null;
    const st = toDate(s.scheduledTime);
    const at = toDate(s.actualTime);
    const overdue = s.status === "pending" && st && st < now;

    return (
      <div className={`rx-fadein ${overdue ? "rx-shake" : ""}`} style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        background: s.status === "taken" ? "#f0fdf4" : s.status === "missed" ? "#fef2f2" : overdue ? "#fff7ed" : "#fff",
        border: `1px solid ${s.status === "taken" ? "#bbf7d0" : s.status === "missed" ? "#fecaca" : overdue ? "#fed7aa" : "#e5e7eb"}`,
        borderRadius: 12, transition: "all 0.3s",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: s.status === "taken" ? "#d1fae5" : s.status === "missed" ? "#fee2e2" : overdue ? "#fef3c7" : "#f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
        }}>
          {s.status === "taken" ? "✓" : s.status === "missed" ? "✖" : overdue ? "⚠" : "💊"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{rx.medicationName}</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            {getDoseLabel(rx.dose)} · {rx.route} · Scheduled {fmtTime(st)}
            {at && ` · Taken ${fmtTime(at)}`}
          </div>
          {rx.indication && <div style={{ fontSize: 10, color: "#9ca3af" }}>For: {rx.indication}</div>}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {s.status === "pending" && (
            <button className="rx-btn rx-btn-primary" style={{ padding: "7px 14px", fontSize: 12 }}
              disabled={takingDose === s.id}
              onClick={() => handleTakeDose(s, rx)}>
              {takingDose === s.id ? "..." : "✓ Take Now"}
            </button>
          )}
          {s.status !== "pending" && (
            <span className="rx-badge" style={{
              background: s.status === "taken" ? "#d1fae5" : s.status === "missed" ? "#fee2e2" : "#fef3c7",
              color: s.status === "taken" ? "#065f46" : s.status === "missed" ? "#7f1d1d" : "#78350f",
            }}>
              <StatusDot status={s.status} /> {s.status}
            </span>
          )}
        </div>
      </div>
    );
  };

  // ────────────── RENDER ──────────────

  return (
    <>
      <style>{css}</style>
      <div className="rx-center" style={{ padding: "0 0 40px" }}>
        <NotifToast />
        {showDetail && selectedRx && <MedDetailModal rx={selectedRx!} />}

        {/* ── HEADER HERO ── */}
        <div style={{
          background: "linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #14b8a6 100%)",
          padding: "28px 20px 24px", position: "relative", overflow: "hidden",
        }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: -20, right: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
              AMEXAN · Medication Center
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{patientName}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 20 }}>
              {activeMeds.length} Active Medication{activeMeds.length !== 1 ? "s" : ""} · {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>

            {/* Summary KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Active Meds", value: activeMeds.length, color: "#fff", bg: "rgba(255,255,255,0.18)", icon: "💊" },
                { label: "Due Now", value: dueNow, color: dueNow > 0 ? "#fef3c7" : "#fff", bg: dueNow > 0 ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.18)", icon: "⏰" },
                { label: "Missed Today", value: missedToday, color: missedToday > 0 ? "#fee2e2" : "#fff", bg: missedToday > 0 ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.18)", icon: "⚠" },
                { label: "Adherence", value: `${overallAdherence}%`, color: "#fff", bg: "rgba(255,255,255,0.18)", icon: "📊" },
              ].map(({ label, value, color, bg, icon }) => (
                <div key={label} style={{
                  background: bg, borderRadius: 12, padding: "10px 12px", textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 20px", display: "flex", gap: 6, overflowX: "auto" }}>
          {(["active", "history", "adherence", "pharmacy"] as const).map(t => (
            <button key={t} className={`rx-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}>
              {t === "active" ? "💊 Active" : t === "history" ? "📋 History" : t === "adherence" ? "📊 Adherence" : "🏥 Pharmacy"}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 20px 0" }}>

          {/* ═══════ ACTIVE MEDICATIONS TAB ═══════ */}
          {activeTab === "active" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Today's schedule */}
              {todaySchedules.length > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div className="rx-section-title">Today's Schedule</div>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{now.toLocaleDateString("en-GB", { weekday: "long" })}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {todaySchedules.sort((a, b) => (toDate(a.scheduledTime)?.getTime() || 0) - (toDate(b.scheduledTime)?.getTime() || 0))
                      .map(s => <ScheduleRow key={s.id} s={s} />)}
                  </div>
                </div>
              )}

              {/* Active med cards */}
              <div>
                <div className="rx-section-title" style={{ marginBottom: 12 }}>
                  Active Medications ({activeMeds.length})
                </div>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading medications...</div>
                ) : activeMeds.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No active medications</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
                    {activeMeds.map(rx => <RxCard key={rx.id} rx={rx} />)}
                  </div>
                )}
              </div>

              {/* Recently added (this visit/week) */}
              {prescriptions.filter(p => {
                const d = toDate(p.createdAt);
                return d && (Date.now() - d.getTime()) < 7 * 24 * 3600000;
              }).length > 0 && (
                <div>
                  <div className="rx-section-title" style={{ marginBottom: 12 }}>Recently Added (This Week)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {prescriptions.filter(p => {
                      const d = toDate(p.createdAt);
                      return d && (Date.now() - d.getTime()) < 7 * 24 * 3600000;
                    }).map(rx => (
                      <div key={rx.id} className="rx-card rx-fadein" style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer",
                        background: "linear-gradient(135deg,#fafffe,#f0fdf9)",
                      }} onClick={() => { setSelectedRx(rx); setShowDetail(true); }}>
                        <span style={{ fontSize: 24 }}>🆕</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f766e" }}>{rx.medicationName} {getDoseLabel(rx.dose)}</div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>{rx.indication} · {rx.frequency} · By {rx.doctorName}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>Added {fmtFull(toDate(rx.createdAt))}</div>
                        </div>
                        <span className="rx-badge" style={{ background: "#dbeafe", color: "#1d4ed8" }}>NEW</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ HISTORY TAB ═══════ */}
          {activeTab === "history" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Filter */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["all", "active", "stopped", "completed"] as const).map(f => (
                  <button key={f} onClick={() => setFilterStatus(f)} style={{
                    padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: filterStatus === f ? "#0f766e" : "#f3f4f6",
                    color: filterStatus === f ? "#fff" : "#6b7280",
                    border: "none", textTransform: "capitalize",
                  }}>{f}</button>
                ))}
              </div>

              {/* All meds by indication group */}
              {Object.entries(
                prescriptions
                  .filter(p => filterStatus === "all" || p.status === filterStatus)
                  .reduce((acc, rx) => {
                    const key = rx.indication || "General";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(rx);
                    return acc;
                  }, {} as Record<string, Prescription[]>)
              ).map(([indication, rxList]) => (
                <div key={indication}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div className="rx-section-title">{indication}</div>
                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{rxList.length} drug{rxList.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {rxList.map(rx => {
                      const isActive = rx.status === "active" || rx.active;
                      return (
                        <div key={rx.id} className="rx-card rx-fadein" style={{
                          cursor: "pointer", opacity: isActive ? 1 : 0.75,
                          border: isActive ? "1.5px solid #a7f3d0" : "1px solid #e5e7eb",
                        }} onClick={() => { setSelectedRx(rx); setShowDetail(true); }}>
                          <div style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                  <StatusDot status={rx.status} />
                                  <span style={{ fontSize: 15, fontWeight: 800, color: isActive ? "#0f766e" : "#6b7280" }}>{rx.medicationName}</span>
                                  <span className="rx-badge" style={{
                                    background: isActive ? "#d1fae5" : rx.status === "completed" ? "#dbeafe" : "#f3f4f6",
                                    color: isActive ? "#065f46" : rx.status === "completed" ? "#1d4ed8" : "#6b7280",
                                  }}>{rx.status}</span>
                                </div>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                  {getDoseLabel(rx.dose)} · {rx.route} · {rx.frequency}
                                </div>
                                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                                  {fmt(toDate(rx.startDate))} → {rx.actualStopDate ? fmt(toDate(rx.actualStopDate)) : rx.endDate ? fmt(toDate(rx.endDate)) : "Ongoing"}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>By {rx.doctorName}</div>
                                {rx.changeHistory && rx.changeHistory.length > 0 && (
                                  <span className="rx-badge" style={{ background: "#f5f3ff", color: "#7c3aed", marginTop: 4 }}>
                                    {rx.changeHistory.length} changes
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Mini timeline */}
                            {rx.changeHistory && rx.changeHistory.length > 0 && (
                              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e5e7eb" }}>
                                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                                  {[{ changeType: "started", date: fmt(toDate(rx.createdAt || rx.startDate)), changedBy: rx.doctorName }, ...rx.changeHistory].map((c, i) => (
                                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                                      {i > 0 && <div style={{ width: 20, height: 1, background: "#d1d5db" }} />}
                                      <div style={{ textAlign: "center" }}>
                                        <TimelineDot type={c.changeType} />
                                        <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 4, maxWidth: 52 }}>{c.date}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══════ ADHERENCE TAB ═══════ */}
          {activeTab === "adherence" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Overall adherence big card */}
              <div className="rx-card" style={{ background: "linear-gradient(135deg,#0f766e,#14b8a6)", border: "none", padding: "24px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                      30-Day Adherence
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{overallAdherence}%</div>
                    <div style={{ marginTop: 6, ...{ color: "rgba(255,255,255,0.8)", fontSize: 13 } }}>
                      {adherenceBadge(overallAdherence).label} compliance
                    </div>
                  </div>
                  <AdherenceRing pct={overallAdherence} size={100} />
                </div>
              </div>

              {/* Weekly heatmap */}
              <div className="rx-card" style={{ padding: 20 }}>
                <div className="rx-section-title" style={{ marginBottom: 16 }}>Weekly Trend</div>
                <WeekHeatmap records={adherenceRecords} />
                <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                  {[
                    { color: "#10b981", label: "≥90% Excellent" },
                    { color: "#f59e0b", label: "75–89% Good" },
                    { color: "#f97316", label: "50–74% Moderate" },
                    { color: "#ef4444", label: "<50% Poor" },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                      <span style={{ fontSize: 11, color: "#6b7280" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-medication adherence */}
              <div>
                <div className="rx-section-title" style={{ marginBottom: 12 }}>Per Medication</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeMeds.map(rx => {
                    const rxSched = schedules.filter(s => s.prescriptionId === rx.id);
                    const taken = rxSched.filter(s => s.status === "taken").length;
                    const total = rxSched.filter(s => s.status !== "pending").length;
                    const pct = total > 0 ? Math.round((taken / total) * 100) : 100;
                    const badge = adherenceBadge(pct);
                    const missed = rxSched.filter(s => s.status === "missed").length;
                    const delayed = rxSched.filter(s => s.status === "delayed").length;

                    return (
                      <div key={rx.id} className="rx-card rx-fadein" style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{rx.medicationName}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{rx.indication} · {rx.frequency}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <AdherenceRing pct={pct} size={52} />
                            <span className="rx-badge" style={{ background: badge.bg, color: badge.color }}>
                              {badge.icon} {badge.label}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 6, background: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
                          <div style={{
                            height: "100%", width: `${pct}%`, background: badge.color,
                            borderRadius: 999, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                          }} />
                        </div>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {[
                            { label: "Taken", value: taken, color: "#10b981" },
                            { label: "Missed", value: missed, color: "#ef4444" },
                            { label: "Delayed", value: delayed, color: "#f97316" },
                            { label: "Total Scheduled", value: total, color: "#6b7280" },
                          ].map(({ label, value, color }) => (
                            <div key={label} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
                              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>{label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Dose timeline dots */}
                        {rxSched.length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {rxSched.slice(-30).map((s, i) => (
                              <div key={i} title={`Dose ${s.doseNumber}: ${s.status} at ${fmtTime(toDate(s.scheduledTime))}`} style={{
                                width: 12, height: 12, borderRadius: "50%",
                                background: s.status === "taken" ? "#10b981" : s.status === "missed" ? "#ef4444" : s.status === "delayed" ? "#f97316" : "#e5e7eb",
                                cursor: "pointer",
                              }} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missed dose log */}
              {schedules.filter(s => s.status === "missed").length > 0 && (
                <div>
                  <div className="rx-section-title" style={{ marginBottom: 12 }}>Missed Dose Log</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {schedules.filter(s => s.status === "missed").slice(0, 10).map(s => {
                      const rx = prescriptions.find(p => p.id === s.prescriptionId);
                      return (
                        <div key={s.id} style={{
                          display: "flex", gap: 12, alignItems: "center",
                          background: "#fef2f2", borderRadius: 10, padding: "10px 14px",
                          border: "1px solid #fecaca",
                        }}>
                          <span style={{ fontSize: 18 }}>✖</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#7f1d1d" }}>{rx?.medicationName}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>Scheduled: {fmtFull(toDate(s.scheduledTime))}</div>
                          </div>
                          <span className="rx-badge" style={{ background: "#fee2e2", color: "#ef4444" }}>MISSED</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ PHARMACY TAB ═══════ */}
          {activeTab === "pharmacy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Rx summary card */}
              <div className="rx-card" style={{ padding: 20, background: "linear-gradient(135deg,#ecfdf5,#f0fdf9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#047857", marginBottom: 6 }}>
                      Current Prescription
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#065f46" }}>{patientName}</div>
                    <div style={{ fontSize: 12, color: "#047857" }}>
                      {activeMeds.length} Active Medication{activeMeds.length !== 1 ? "s" : ""} · {now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="rx-btn rx-btn-primary" onClick={() => {
                      const doctor = activeMeds[0];
                      generatePrescriptionPDF(
                        activeMeds, patientName, patientAge, patientSex,
                        hospitalName,
                        doctor?.doctorName || "Dr. Unknown",
                        doctorLicense,
                      );
                      showNotif("✓ Prescription PDF generated!", "success");
                    }}>
                      📄 Download Prescription
                    </button>
                    <button className="rx-btn rx-btn-ghost">🖨 Print</button>
                  </div>
                </div>

                {/* Medication ownership summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeMeds.map(rx => {
                    const isOwned = markedOwned[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;
                    return (
                      <div key={rx.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "#fff", borderRadius: 10, padding: "10px 14px",
                        border: `1.5px solid ${isOwned ? "#a7f3d0" : "#fed7aa"}`,
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                            {rx.medicationName} {getDoseLabel(rx.dose)}
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>{rx.frequency} · {rx.route}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {rx.refills !== undefined && (
                            <span className="rx-badge" style={{ background: "#f0f9ff", color: "#0369a1", fontSize: 10 }}>
                              {rx.refills} refills
                            </span>
                          )}
                          <button onClick={() => handleToggleOwned(rx, !isOwned)} style={{
                            padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
                            background: isOwned ? "#d1fae5" : "#fff7ed",
                            color: isOwned ? "#065f46" : "#92400e",
                            border: `1px solid ${isOwned ? "#6ee7b7" : "#fed7aa"}`,
                          }}>
                            {isOwned ? "✓ Have it" : "Need to buy"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prescription preview table */}
              <div className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 18px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>Prescription Sheet</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>As it will appear on the downloadable PDF</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#0f766e" }}>
                        {["#", "Medication", "Dose", "Route", "Frequency", "Duration", "Instructions", "Status"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeMeds.map((rx, i) => {
                        const isOwned = markedOwned[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;
                        return (
                          <tr key={rx.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fffe", borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "10px 12px", color: "#6b7280", fontWeight: 700 }}>{i + 1}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <div style={{ fontWeight: 800, color: "#0f766e" }}>{rx.medicationName}</div>
                              {rx.genericName && rx.genericName !== rx.medicationName && (
                                <div style={{ fontSize: 11, color: "#6b7280" }}>({rx.genericName})</div>
                              )}
                              <div style={{ fontSize: 10, color: "#9ca3af" }}>{rx.indication}</div>
                            </td>
                            <td style={{ padding: "10px 12px", fontWeight: 700 }}>{getDoseLabel(rx.dose)}</td>
                            <td style={{ padding: "10px 12px", color: "#374151" }}>{rx.route}</td>
                            <td style={{ padding: "10px 12px", color: "#374151" }}>{rx.frequency}</td>
                            <td style={{ padding: "10px 12px", color: "#374151" }}>{rx.duration ? `${rx.duration}d` : "Ongoing"}</td>
                            <td style={{ padding: "10px 12px", color: "#374151", maxWidth: 120 }}>{rx.instructions || "—"}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{
                                padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                                background: isOwned ? "#d1fae5" : "#fef3c7",
                                color: isOwned ? "#065f46" : "#92400e",
                              }}>
                                {isOwned ? "✓ Have" : "Buy"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer row */}
                <div style={{ padding: "14px 18px", background: "#f8fafc", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Prescribing Physician: <strong>{activeMeds[0]?.doctorName || "—"}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Date: <strong>{now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>
                  </div>
                </div>
              </div>

              {/* Refill requests section */}
              <div className="rx-card" style={{ padding: 20 }}>
                <div className="rx-section-title" style={{ marginBottom: 14 }}>Refill Tracker</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeMeds.map(rx => {
                    const refills = rx.refills ?? rx.refillInfo?.remainingRefills ?? 0;
                    return (
                      <div key={rx.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 14px", borderRadius: 10, background: "#fafafa", border: "1px solid #e5e7eb",
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800 }}>{rx.medicationName}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>{getDoseLabel(rx.dose)} · {rx.frequency}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="rx-badge" style={{
                            background: refills > 2 ? "#d1fae5" : refills > 0 ? "#fef3c7" : "#fee2e2",
                            color: refills > 2 ? "#065f46" : refills > 0 ? "#92400e" : "#7f1d1d",
                          }}>
                            {refills} refill{refills !== 1 ? "s" : ""} left
                          </span>
                          {refills <= 1 && (
                            <button className="rx-btn rx-btn-ghost" style={{ padding: "5px 12px", fontSize: 11 }}
                              onClick={async () => {
                                await addDoc(collection(db, "pharmacyOrders"), {
                                  patientId, prescriptionIds: [rx.id],
                                  issuedAt: serverTimestamp(), doctorId: rx.doctorId,
                                  doctorName: rx.doctorName, status: "refill_requested",
                                });
                                showNotif(`Refill requested for ${rx.medicationName}`, "success");
                              }}>
                              Request Refill
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}