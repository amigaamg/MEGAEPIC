/**
 * PatientRxCenter.tsx
 * AMEXAN – Full Medication Management Center
 * Doctor + Patient Views | Adherence Engine | Pharmacy | PDF Prescription
 *
 * Comprehensive, real-world adherence tracking with dynamic rescheduling.
 * Works for OPD and inpatients. Doctor sees adherence stats, nurse administers doses.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import TherapeuticLifeTimeline from "@/components/visual-intelligence/TherapeuticLifeTimeline";
import DrugResponseGraph from "@/components/visual-intelligence/DrugResponseGraph";
import ClinicalResponseBoard from "@/components/visual-intelligence/ClinicalResponseBoard";
import MedicationEvolutionMap, { buildTherapyTree } from "@/components/visual-intelligence/MedicationEvolutionMap";
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
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 

// ─── TYPES ────────────────────────────────────────────────────────────

type FrequencyCode = "OD" | "BD" | "TDS" | "QID" | "PRN" | "STAT" | "Weekly" | "Nocte";

interface FrequencyConfig {
  code: FrequencyCode;
  label: string;
  intervalHours: number;
  dosesPerDay: number;
  gracePeriodMinutes: number;
}

const FREQUENCY_MAP: Record<FrequencyCode, FrequencyConfig> = {
  OD:     { code: "OD",     label: "Once Daily",        intervalHours: 24,   dosesPerDay: 1,    gracePeriodMinutes: 120 },
  BD:     { code: "BD",     label: "Twice Daily",       intervalHours: 12,   dosesPerDay: 2,    gracePeriodMinutes: 90  },
  TDS:    { code: "TDS",    label: "Three Times Daily",  intervalHours: 8,    dosesPerDay: 3,    gracePeriodMinutes: 60  },
  QID:    { code: "QID",    label: "Four Times Daily",   intervalHours: 6,    dosesPerDay: 4,    gracePeriodMinutes: 45  },
  PRN:    { code: "PRN",    label: "As Needed",          intervalHours: 0,    dosesPerDay: 0,    gracePeriodMinutes: 0   },
  STAT:   { code: "STAT",   label: "Immediately",        intervalHours: 0,    dosesPerDay: 0,    gracePeriodMinutes: 0   },
  Weekly: { code: "Weekly", label: "Once Weekly",        intervalHours: 168,  dosesPerDay: 0.14, gracePeriodMinutes: 240 },
  Nocte:  { code: "Nocte",  label: "At Night",           intervalHours: 24,   dosesPerDay: 1,    gracePeriodMinutes: 120 },
};

interface Prescription {
  id: string;
  prescriptionId?: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  encounterId?: string;            // groups drugs from same visit
  visitId?: string;
  medicationName?: string;         // may be stored as "medication" in DB
  medication?: string;
  genericName?: string;
  brandName?: string;
  dose?: { value: number; unit: string } | string;
  dosage?: string;                 // legacy field
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
  changeHistory?: Array<{
    changeType: string;
    changedBy: string;
    date: string;
    previousDose?: string;
    newDose?: string;
    reason?: string;
  }>;
  version?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  prescribedAt?: Timestamp;
  prescribedBy?: string;
  scheduledTimes?: string[];
  doctorLicense?: string;
  doctorQualification?: string;
  doctorClinic?: string;
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
  date: string;                   // "YYYY-MM-DD"
  totalScheduled: number;
  totalTaken: number;
  totalMissed: number;
  totalDelayed: number;
  adherencePercentage: number;
  perDrug?: Record<string, { pct: number; taken: number; total: number }>;
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
  encounterId?: string;           // optional, to isolate a specific visit
}

// ─── HELPERS ──────────────────────────────────────────────────────────

const toDate = (v: Timestamp | Date | null | undefined): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof (v as any).toDate === "function") return (v as any).toDate();
  return null;
};

const fmt = (d: Date | null, opts?: Intl.DateTimeFormatOptions) =>
  d
    ? d.toLocaleDateString("en-GB", opts || { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const fmtTime = (d: Date | null) =>
  d ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—";

const fmtFull = (d: Date | null) => (d ? `${fmt(d)} ${fmtTime(d)}` : "—");

/** Extract medication name from possibly varying fields */
const getMedName = (rx: Prescription): string =>
  rx.medicationName || rx.medication || "";

/** Parse dose from possible formats */
const getDoseLabel = (dose: any): string => {
  if (!dose) return "—";
  if (typeof dose === "string") return dose;
  if (typeof dose === "object" && dose.value) return `${dose.value}${dose.unit || ""}`;
  return String(dose);
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

// ─── SUB‑COMPONENTS (visual) ───────────────────────────────────────────

const AdherenceRing = ({ pct, size = 80 }: { pct: number; size?: number }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const badge = adherenceBadge(pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={badge.color}
        strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: `${size / 2}px ${size / 2}px`,
          fill: badge.color,
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        {pct}%
      </text>
    </svg>
  );
};

const StatusDot = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    active: "#10b981", completed: "#3b82f6", stopped: "#9ca3af",
    paused: "#f59e0b", pending: "#f59e0b", taken: "#10b981",
    delayed: "#f97316", missed: "#ef4444", skipped: "#9ca3af",
  };
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: colors[status] || "#9ca3af",
        boxShadow: status === "active" ? `0 0 0 3px ${colors[status]}33` : "none",
      }}
    />
  );
};

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
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: m.bg,
        color: "#fff",
        fontSize: 10,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {m.icon}
    </span>
  );
};

const WeekHeatmap = ({ records }: { records: AdherenceRecord[] }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const rec = records.find((r) => r.date === key);
    return {
      day: days[d.getDay() === 0 ? 6 : d.getDay() - 1],
      pct: rec ? rec.adherencePercentage : null,
    };
  });
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {last7.map((d, i) => {
        const pct = d.pct ?? 0;
        const color =
          d.pct === null
            ? "#e5e7eb"
            : pct >= 90
            ? "#10b981"
            : pct >= 75
            ? "#f59e0b"
            : pct >= 50
            ? "#f97316"
            : "#ef4444";
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 28,
                height: Math.max(8, (pct / 100) * 48),
                background: color,
                borderRadius: 4,
                transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                opacity: d.pct === null ? 0.3 : 1,
              }}
              title={d.pct !== null ? `${pct}%` : "No data"}
            />
            <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── PDF GENERATION (with visit grouping and "Have it" ticks) ──────────

const generatePrescriptionPDF = (
  medications: Prescription[],                          // ← real array from activeMeds
  patientInfo: {
    name?: string;
    id?: string;
    mrn?: string;
    dob?: string;
    age?: number;
    sex?: string;
    allergies?: string;
  },
  doctorInfo: {
    name?: string;
    license?: string;
    clinicName?: string;
    address?: string;
    phone?: string;
    qualification?: string;
    specialization?: string;
  },
  ownedMap: Record<string, boolean> = {}
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const PAGE_H = 297;

  // ── Guard ─────────────────────────────────────────────────────────
  const safe = (v: any, fb = "") =>
    v !== undefined && v !== null && v !== "" ? String(v) : fb;

  const meds = Array.isArray(medications) ? medications : [];

  // ── Date ──────────────────────────────────────────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  // ── Pull data from your Prescription objects ───────────────────────
  const firstMed = meds[0];
  const doctorName   = safe(doctorInfo?.name ?? firstMed?.doctorName, "________________________");
  const doctorLic    = safe(doctorInfo?.license ?? firstMed?.doctorLicense);
  const clinicName   = safe(doctorInfo?.clinicName);
  const doctorAddr   = safe(doctorInfo?.address);
  const doctorPhone  = safe(doctorInfo?.phone);
  const doctorQual   = safe(doctorInfo?.qualification ?? firstMed?.doctorQualification);
  const doctorSpec   = safe(doctorInfo?.specialization);

  const patientName  = safe(patientInfo?.name, "________________________");
  const patientMrn   = safe(patientInfo?.mrn ?? patientInfo?.id);
  const patientDob   = safe(patientInfo?.dob);
  const patientAge   = patientInfo?.age ? `${patientInfo.age} yrs` : "";
  const patientSex   = safe(patientInfo?.sex);
  const patientAllergies = safe(patientInfo?.allergies);

  // Group medications by indication for a grouped table
  const rxId = `RX-${Date.now()}`;

  // ══════════════════════════════════════════════════════════════════
  // COLOURS
  // ══════════════════════════════════════════════════════════════════
  const NAVY  = [10,  35,  66]  as [number, number, number];
  const GOLD  = [180, 140, 60]  as [number, number, number];
  const TEAL  = [0,   118, 110] as [number, number, number];
  const LTEAL = [20,  184, 166] as [number, number, number];
  const LIGHT = [240, 249, 247] as [number, number, number];
  const WHITE = [255, 255, 255] as [number, number, number];
  const GREY  = [100, 110, 120] as [number, number, number];
  const RED   = [180, 30,  30]  as [number, number, number];
  const GREEN = [16,  185, 129] as [number, number, number];
  const AMBER = [245, 158, 11]  as [number, number, number];

  // ══════════════════════════════════════════════════════════════════
  // HEADER BAND
  // ══════════════════════════════════════════════════════════════════
  // Deep teal gradient band
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, PAGE_W, 42, "F");

  // Lighter accent stripe
  doc.setFillColor(...LTEAL);
  doc.rect(0, 36, PAGE_W, 6, "F");

  // Gold bottom border
  doc.setFillColor(...GOLD);
  doc.rect(0, 42, PAGE_W, 2, "F");

  // "Rx" (latin small) instead of ℞ — jsPDF default font can't render ℞
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...GOLD);
  doc.text("Rx", 12, 26);

  // Clinic / App name
  doc.setFontSize(17);
  doc.setTextColor(...WHITE);
  doc.text(clinicName || "AMEXAN MEDICAL", 34, 19);

  // Tagline — international
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 230, 226);
  doc.text(
    "OFFICIAL PRESCRIPTION  ·  ORDONNANCE OFFICIELLE  ·  RECETA OFICIAL  ·  وصفة طبية رسمية",
    34, 27
  );
  doc.text(
    "HIPAA COMPLIANT  ·  SECURE  ·  ENCRYPTED  ·  AMEXAN HEALTH PLATFORM",
    34, 33.5
  );

  // Right: date + rx id
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text(`Date: ${dateStr}`, PAGE_W - 12, 17, { align: "right" });
  doc.setTextColor(200, 230, 226);
  doc.setFont("helvetica", "normal");
  doc.text(`Time: ${timeStr}`, PAGE_W - 12, 23, { align: "right" });
  doc.text(`Rx ID: ${rxId}`, PAGE_W - 12, 29, { align: "right" });

  // ══════════════════════════════════════════════════════════════════
  // WATERMARK
  // ══════════════════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(52);
  doc.setTextColor(225, 238, 236);
  doc.text("CONFIDENTIAL", PAGE_W / 2, PAGE_H / 2, { align: "center", angle: 45 });

  // ══════════════════════════════════════════════════════════════════
  // TWO-COLUMN INFO BAND: Doctor | Patient
  // ══════════════════════════════════════════════════════════════════
  const INFO_Y = 48;

  // Doctor card
  doc.setFillColor(...LIGHT);
  doc.roundedRect(10, INFO_Y, 92, 46, 2.5, 2.5, "F");
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.4);
  doc.roundedRect(10, INFO_Y, 92, 46, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...TEAL);
  doc.text("PRESCRIBING PHYSICIAN", 15, INFO_Y + 7);

  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(doctorName, 15, INFO_Y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  if (doctorQual) doc.text(doctorQual, 15, INFO_Y + 20);
  if (doctorSpec)  doc.text(doctorSpec, 15, INFO_Y + doctorQual ? 25 : 20);
  doc.text(doctorAddr  || "________________________", 15, INFO_Y + 28);
  doc.text(doctorPhone ? `Tel: ${doctorPhone}` : "________________________", 15, INFO_Y + 34);
  doc.text(doctorLic   ? `Lic: ${doctorLic}` : "________________________", 15, INFO_Y + 40);

  // Patient card
  doc.setFillColor(...LIGHT);
  doc.roundedRect(107, INFO_Y, 93, 46, 2.5, 2.5, "F");
  doc.setDrawColor(...TEAL);
  doc.roundedRect(107, INFO_Y, 93, 46, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...TEAL);
  doc.text("PATIENT INFORMATION", 112, INFO_Y + 7);

  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(patientName, 112, INFO_Y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text(
    `DOB / Age : ${patientDob ? patientDob + (patientAge ? " (" + patientAge + ")" : "") : patientAge || "________________________"}`,
    112, INFO_Y + 20
  );
  doc.text(`MRN / ID  : ${patientMrn || "________________________"}`, 112, INFO_Y + 26);
  doc.text(`Gender    : ${patientSex || "________________________"}`, 112, INFO_Y + 32);

  if (patientAllergies) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...RED);
    doc.text(`ALLERGY: ${patientAllergies}`, 112, INFO_Y + 40);
  } else {
    doc.text("Allergies : ________________________", 112, INFO_Y + 38);
  }

  // ══════════════════════════════════════════════════════════════════
  // MEDICATIONS TABLE
  // Build rows from the real Prescription[] array
  // ══════════════════════════════════════════════════════════════════

  const tableBody = meds.map((rx, i) => {
    const isOwned = ownedMap[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;
    const doseLabel = getDoseLabel(rx.dose ?? rx.dosage);
    const refillsVal = rx.refills ?? rx.refillInfo?.remainingRefills ?? "—";
    const durationVal = rx.duration ? `${rx.duration}d` : "Ongoing";
    const instrVal = rx.instructions || "As directed";
    const statusVal = isOwned ? "Have it" : "Buy";

    return [
      `${i + 1}. ${getMedName(rx)}${rx.genericName && rx.genericName !== getMedName(rx) ? "\n(" + rx.genericName + ")" : ""}${rx.indication ? "\n" + rx.indication : ""}`,
      doseLabel,
      safe(rx.route, "—"),
      safe(rx.frequency, "—"),
      durationVal,
      instrVal,
      statusVal,
    ];
  });

  const TABLE_Y = INFO_Y + 52;

  autoTable(doc, {
    startY: TABLE_Y,
    head: [["Medication", "Dose", "Route", "Frequency", "Duration", "Instructions", "Status"]],
    body: tableBody.length > 0 ? tableBody : [["No medications", "—", "—", "—", "—", "—", "—"]],
    theme: "grid",
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [20, 30, 40] as [number, number, number],
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [235, 248, 245] as [number, number, number],
    },
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: "bold" },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 28 },
      4: { cellWidth: 20 },
      5: { cellWidth: 38 },
      6: { cellWidth: 20 },
    },
    didDrawCell: (data: any) => {
      if (data.column.index === 6 && data.section === "body") {
        const val = String(data.cell.raw ?? "").toLowerCase();
        if (val.includes("have")) {
          doc.setTextColor(...GREEN);
        } else {
          doc.setTextColor(...AMBER);
        }
      }
    },
  });

  let finalY: number = (doc as any).lastAutoTable?.finalY ?? 180;

  // ══════════════════════════════════════════════════════════════════
  // INDICATION SUMMARY (grouped)
  // ══════════════════════════════════════════════════════════════════
  const indications = [...new Set(meds.map((m) => m.indication).filter(Boolean))];
  if (indications.length > 0) {
    finalY += 6;
    doc.setFillColor(...TEAL);
    doc.rect(10, finalY, PAGE_W - 20, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    doc.text("DIAGNOSIS / INDICATION:", 14, finalY + 5.5);
    doc.setFont("helvetica", "normal");
    doc.text(indications.join("  ·  "), 60, finalY + 5.5);
    finalY += 8;
  }

  // ══════════════════════════════════════════════════════════════════
  // SIGNATURE SECTION
  // ══════════════════════════════════════════════════════════════════
  const SIG_Y = Math.max(finalY + 16, 240);

  // Left: prescriber box
  doc.setFillColor(...LIGHT);
  doc.roundedRect(10, SIG_Y, 88, 34, 2, 2, "F");
  doc.setDrawColor(...GREY);
  doc.setLineWidth(0.3);
  doc.line(16, SIG_Y + 22, 92, SIG_Y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(doctorName, 16, SIG_Y + 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("Prescriber's Signature & Stamp", 16, SIG_Y + 27);
  if (doctorQual) doc.text(`( ${doctorQual} )`, 16, SIG_Y + 31.5);

  // Middle: dispensing box
  doc.setFillColor(250, 250, 255);
  doc.roundedRect(105, SIG_Y, 46, 34, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...TEAL);
  doc.text("DISPENSING INFO", 128, SIG_Y + 7, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(
    `Refills: ${meds[0]?.refills ?? meds[0]?.refillInfo?.remainingRefills ?? "—"}`,
    128, SIG_Y + 15, { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text(`Issued: ${dateStr}`, 128, SIG_Y + 21, { align: "center" });
  doc.text("Valid 90 days from issue", 128, SIG_Y + 27, { align: "center" });

  // Right: pharmacist box
  doc.setFillColor(...LIGHT);
  doc.roundedRect(157, SIG_Y, 43, 34, 2, 2, "F");
  doc.line(161, SIG_Y + 22, 197, SIG_Y + 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("Pharmacist Signature", 179, SIG_Y + 27, { align: "center" });
  doc.text("& Official Stamp", 179, SIG_Y + 31.5, { align: "center" });

  // ══════════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════════
  doc.setFillColor(...NAVY);
  doc.rect(0, PAGE_H - 18, PAGE_W, 18, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(180, 205, 220);
  doc.text(
    "This is a computer-generated prescription. Valid only with original prescriber signature and official stamp.",
    PAGE_W / 2, PAGE_H - 11, { align: "center" }
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(
    "AMEXAN Health Platform  ·  Secure  ·  Encrypted  ·  HIPAA Compliant  ·  amexan.health",
    PAGE_W / 2, PAGE_H - 5, { align: "center" }
  );

  // ══════════════════════════════════════════════════════════════════
  // SAVE
  // ══════════════════════════════════════════════════════════════════
  const safeName = patientName.replace(/\s+/g, "_").replace(/[^\w_]/g, "");
  const safeDate = dateStr.replace(/,?\s+/g, "-");
  doc.save(`AMEXAN_Rx_${safeName}_${safeDate}.pdf`);
};

// ─── ADHERENCE ENGINE (realistic scheduling) ───────────────────────────

/** Create the full schedule for a prescription starting from a given time */
const generateSchedule = (
  prescription: Prescription,
  startTime: Date,
  endDate: Date,
  freqCode: FrequencyCode,
  config: FrequencyConfig
): Omit<MedSchedule, "id">[] => {
  const schedules: Omit<MedSchedule, "id">[] = [];
  let doseNum = 1;
  let nextTime = new Date(startTime);

  while (nextTime <= endDate) {
    schedules.push({
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      scheduledTime: Timestamp.fromDate(nextTime),
      doseNumber: doseNum,
      status: "pending",
      gracePeriodMinutes: config.gracePeriodMinutes,
      createdAt: serverTimestamp() as any,
    });
    doseNum++;
    nextTime = new Date(nextTime.getTime() + config.intervalHours * 3600000);
    if (schedules.length > 500) break; // safety
  }
  return schedules;
};

/** After a dose is taken, regenerate all future pending doses from the actual time */
const rescheduleAfterDose = async (
  prescription: Prescription,
  actualTakenTime: Date,
  patientId: string,
  freqCode: FrequencyCode,
  config: FrequencyConfig
) => {
  const endDate =
    toDate(prescription.expectedEndDate || prescription.endDate) ||
    new Date(actualTakenTime.getTime() + (parseInt(prescription.duration || "30") || 30) * 24 * 3600000);

  // Delete all pending schedules for this prescription
  const pendingQ = query(
    collection(db, "medicationSchedules"),
    where("prescriptionId", "==", prescription.id),
    where("status", "==", "pending")
  );
  const pendingSnap = await getDocs(pendingQ);
  const batch = writeBatch(db);
  pendingSnap.docs.forEach((d) => batch.delete(d.ref));

  // Generate new schedule starting from actualTakenTime
  const newSchedules = generateSchedule(prescription, actualTakenTime, endDate, freqCode, config);
  newSchedules.forEach((s) => {
    const ref = doc(collection(db, "medicationSchedules"));
    batch.set(ref, s);
  });

  await batch.commit();
};

/** Record a dose administration and update daily adherence */
const recordAdministration = async (
  schedule: MedSchedule,
  prescription: Prescription,
  patientId: string,
  administeredBy: { type: string; userId: string; name: string },
  notes = "",
  markAsTakenEvenIfLate = true
) => {
  const now = new Date();
  const scheduledTime = toDate(schedule.scheduledTime)!;
  const diffMin = (now.getTime() - scheduledTime.getTime()) / 60000;
  const grace = schedule.gracePeriodMinutes || FREQUENCY_MAP[getFreqCode(prescription.frequency)]?.gracePeriodMinutes || 60;

  let status: string = "taken";
  if (diffMin > grace) {
    status = "delayed"; // outside grace but still taken now
  }

  // Record administration
  await addDoc(collection(db, "medicationAdministrations"), {
    prescriptionId: schedule.prescriptionId,
    patientId,
    scheduledTime: schedule.scheduledTime,
    actualTime: Timestamp.fromDate(now),
    administeredBy,
    status,
    delayMinutes: Math.round(Math.max(0, diffMin)),
    notes,
    createdAt: serverTimestamp(),
  });

  // Update schedule status
  await updateDoc(doc(db, "medicationSchedules", schedule.id), {
    status,
    actualTime: Timestamp.fromDate(now),
    updatedAt: serverTimestamp(),
  });

  // Update daily adherence aggregate
  const dateKey = now.toISOString().split("T")[0];
  const adherenceId = `${patientId}_${dateKey}`;
  const adherenceRef = doc(db, "medicationAdherence", adherenceId);
  const existingSnap = await getDocs(
    query(collection(db, "medicationAdherence"), where("patientId", "==", patientId), where("date", "==", dateKey))
  );

  if (existingSnap.empty) {
    await setDoc(adherenceRef, {
      patientId,
      date: dateKey,
      totalScheduled: 1,
      totalTaken: status !== "missed" ? 1 : 0,
      totalMissed: 0,
      totalDelayed: status === "delayed" ? 1 : 0,
      adherencePercentage: status !== "missed" ? 100 : 0,
      activePrescriptions: 1,
      generatedAt: serverTimestamp(),
    });
  } else {
    const d = existingSnap.docs[0].data();
    const taken = (d.totalTaken || 0) + (status !== "missed" ? 1 : 0);
    const delayed = (d.totalDelayed || 0) + (status === "delayed" ? 1 : 0);
    const scheduled = (d.totalScheduled || 0) + 1;
    await updateDoc(existingSnap.docs[0].ref, {
      totalTaken: taken,
      totalDelayed: delayed,
      totalScheduled: scheduled,
      adherencePercentage: adherencePct(taken, scheduled),
      updatedAt: serverTimestamp(),
    });
  }

  // Reschedule future doses from the actual taken time
  const freqCode = getFreqCode(prescription.frequency);
  const config = FREQUENCY_MAP[freqCode];
  if (config && config.intervalHours > 0) {
    await rescheduleAfterDose(prescription, now, patientId, freqCode, config);
  }
};

/** Mark a pending dose as missed (called automatically) */
const markDoseMissed = async (schedule: MedSchedule, patientId: string) => {
  const now = new Date();
  // Update schedule
  await updateDoc(doc(db, "medicationSchedules", schedule.id), {
    status: "missed",
    updatedAt: serverTimestamp(),
  });

  // Update daily adherence
  const dateKey = toDate(schedule.scheduledTime)!.toISOString().split("T")[0];
  const adherenceRef = doc(db, "medicationAdherence", `${patientId}_${dateKey}`);
  const existingSnap = await getDocs(
    query(collection(db, "medicationAdherence"), where("patientId", "==", patientId), where("date", "==", dateKey))
  );

  if (existingSnap.empty) {
    await setDoc(adherenceRef, {
      patientId,
      date: dateKey,
      totalScheduled: 1,
      totalTaken: 0,
      totalMissed: 1,
      totalDelayed: 0,
      adherencePercentage: 0,
      generatedAt: serverTimestamp(),
    });
  } else {
    const d = existingSnap.docs[0].data();
    const missed = (d.totalMissed || 0) + 1;
    const scheduled = (d.totalScheduled || 0) + 1;
    const taken = d.totalTaken || 0;
    await updateDoc(existingSnap.docs[0].ref, {
      totalMissed: missed,
      totalScheduled: scheduled,
      adherencePercentage: adherencePct(taken, scheduled),
      updatedAt: serverTimestamp(),
    });
  }
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────

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
  encounterId,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [schedules, setSchedules] = useState<MedSchedule[]>([]);
  const [activeDrugId, setActiveDrugId] = useState<string | null>(null);
  const [adherenceSubTab, setAdherenceSubTab] = useState<"timeline" | "drug" | "notes">("timeline");
  const [patientNotes, setPatientNotes] = useState<any[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteTag, setNoteTag] = useState("Side effect");
  const [symptomRatings, setSymptomRatings] = useState<Record<string, number>>({});
  const missedCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [expandedMeds, setExpandedMeds] = useState<Record<string, boolean>>({});
  const [countdownNow, setCountdownNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setCountdownNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split("T")[0]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [adherenceRecords, setAdherenceRecords] = useState<AdherenceRecord[]>([]);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "warning" | "error" } | null>(null);
  const [takingDose, setTakingDose] = useState<string | null>(null);
  const [markedOwned, setMarkedOwned] = useState<Record<string, boolean>>({});
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history" | "adherence" | "pharmacy" | "timeline" | "response" | "therapymap">("active");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const toggleExpand = useCallback((rxId: string) => {
    setExpandedMeds(prev => ({ ...prev, [rxId]: !prev[rxId] }));
  }, []);

  // ── Auto‑detect missed doses every minute
  useEffect(() => {
    missedCheckRef.current = setInterval(() => {
      const now = new Date();
      schedules.forEach((s) => {
        if (s.status === "pending") {
          const st = toDate(s.scheduledTime);
          if (st) {
            const grace = s.gracePeriodMinutes || 60;
            if (now.getTime() - st.getTime() > grace * 60000) {
              // It's officially missed
              markDoseMissed(s, patientId).catch(console.error);
            }
          }
        }
      });
    }, 60000);
    return () => {
      if (missedCheckRef.current) clearInterval(missedCheckRef.current);
    };
  }, [schedules, patientId]);

  // ── Firestore listeners
  useEffect(() => {
    if (!patientId) return;
    setLoading(true);

    const rxQ = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc")
    );
    const unsubRx = onSnapshot(rxQ, (snap) => {
      setPrescriptions(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Prescription)));
      setLoading(false);
    });

    const schQ = query(
      collection(db, "medicationSchedules"),
      where("patientId", "==", patientId),
      where("status", "in", ["pending", "taken", "delayed", "missed"]),
      orderBy("scheduledTime", "asc")
    );
    const unsubSch = onSnapshot(schQ, (snap) => {
      setSchedules(snap.docs.map((d) => ({ ...d.data(), id: d.id } as MedSchedule)));
    });

    const adhQ = query(
      collection(db, "medicationAdherence"),
      where("patientId", "==", patientId),
      orderBy("date", "desc")
    );
    const unsubAdh = onSnapshot(adhQ, (snap) => {
      setAdherenceRecords(snap.docs.map((d) => ({ ...d.data(), id: d.id } as AdherenceRecord)));
    });

    return () => {
      unsubRx();
      unsubSch();
      unsubAdh();
    };
  }, [patientId]);

  // ── Computed helpers
  const activeMeds = prescriptions.filter((p) => p.status === "active" || p.active === true);
  const stoppedMeds = prescriptions.filter((p) => p.status === "stopped" || p.status === "completed");

  const todayDate = new Date();
  const todaySchedules = schedules.filter((s) => {
    const d = toDate(s.scheduledTime);
    return d && d.toDateString() === todayDate.toDateString();
  });

  const overallAdherence =
    adherenceRecords.length > 0
      ? Math.round(
          adherenceRecords.slice(0, 30).reduce((a, r) => a + r.adherencePercentage, 0) /
            Math.min(adherenceRecords.length, 30)
        )
      : 100;

  const missedToday = todaySchedules.filter((s) => s.status === "missed").length;
  const dueNow = todaySchedules.filter((s) => {
    if (s.status !== "pending") return false;
    const d = toDate(s.scheduledTime);
    return d && d <= new Date(todayDate.getTime() + 30 * 60000);
  }).length;

  const showNotif = (msg: string, type: "success" | "warning" | "error") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };
const handleDownload = () => {
  const meds = activeMeds.length > 0 ? activeMeds : prescriptions;
  const patientInfo = {
    name: patientName,
    id: patientId,
  };
  generatePrescriptionPDF(meds, patientInfo, { name: currentUserName, license: doctorLicense, clinicName: hospitalName });
};
  // ── Handle first dose (start schedule)
  const handleFirstDose = useCallback(
    async (rx: Prescription) => {
      setTakingDose(rx.id);
      try {
        const now = new Date();
        // Record first administration
        await addDoc(collection(db, "medicationAdministrations"), {
          prescriptionId: rx.id,
          patientId,
          scheduledTime: Timestamp.fromDate(now),
          actualTime: Timestamp.fromDate(now),
          administeredBy: {
            type: viewMode === "nurse" ? "nurse" : "patient",
            userId: currentUserId,
            name: currentUserName || patientName,
          },
          status: "taken",
          delayMinutes: 0,
          notes: "First dose",
          createdAt: serverTimestamp(),
        });

        // Generate full schedule
        const freqCode = getFreqCode(rx.frequency);
        const config = FREQUENCY_MAP[freqCode];
        const endDate =
          toDate(rx.expectedEndDate || rx.endDate) ||
          new Date(now.getTime() + (parseInt(rx.duration || "30") || 30) * 24 * 3600000);
        const newSchedules = generateSchedule(rx, now, endDate, freqCode, config);
        // Create the first taken schedule manually
        newSchedules.unshift({
          prescriptionId: rx.id,
          patientId,
          scheduledTime: Timestamp.fromDate(now),
          doseNumber: 1,
          status: "taken",
          gracePeriodMinutes: config.gracePeriodMinutes,
          actualTime: Timestamp.fromDate(now),
          createdAt: serverTimestamp() as any,
        });
        const batch = writeBatch(db);
        newSchedules.forEach((s) => {
          const ref = doc(collection(db, "medicationSchedules"));
          batch.set(ref, s);
        });
        await batch.commit();

        // Update prescription
        await updateDoc(doc(db, "prescriptions", rx.id), {
          adherenceFirstDose: Timestamp.fromDate(now),
          updatedAt: serverTimestamp(),
        });

        // Create initial daily adherence
        const dateKey = now.toISOString().split("T")[0];
        const adherenceRef = doc(db, "medicationAdherence", `${patientId}_${dateKey}`);
        await setDoc(adherenceRef, {
          patientId,
          date: dateKey,
          totalScheduled: 1,
          totalTaken: 1,
          totalMissed: 0,
          totalDelayed: 0,
          adherencePercentage: 100,
          activePrescriptions: 1,
          generatedAt: serverTimestamp(),
        });

        showNotif(`✓ First dose recorded for ${getMedName(rx)}. Schedule set!`, "success");
      } catch (e) {
        console.error(e);
        showNotif("Failed to record dose. Try again.", "error");
      } finally {
        setTakingDose(null);
      }
    },
    [patientId, currentUserId, currentUserName, patientName, viewMode]
  );

  // ── Handle subsequent dose
  const handleTakeDose = useCallback(
    async (schedule: MedSchedule, rx: Prescription) => {
      setTakingDose(schedule.id);
      try {
        await recordAdministration(
          schedule,
          rx,
          patientId,
          {
            type: viewMode === "nurse" ? "nurse" : "patient",
            userId: currentUserId,
            name: currentUserName || patientName,
          }
        );
        showNotif(`✓ Dose recorded for ${getMedName(rx)}`, "success");
      } catch (e) {
        showNotif("Failed to record dose.", "error");
      } finally {
        setTakingDose(null);
      }
    },
    [patientId, currentUserId, currentUserName, patientName, viewMode]
  );

  // ── Toggle possession
  const handleToggleOwned = useCallback(
    async (rx: Prescription, owned: boolean) => {
      setMarkedOwned((prev) => ({ ...prev, [rx.id]: owned }));
      await updateDoc(doc(db, "prescriptions", rx.id), {
        possessionStatus: {
          hasMedication: owned,
          acquiredAt: owned ? serverTimestamp() : null,
          source: owned ? "External Pharmacy" : null,
        },
        updatedAt: serverTimestamp(),
      });
      showNotif(
        owned ? `✓ ${getMedName(rx)} marked as obtained` : `${getMedName(rx)} marked as not yet obtained`,
        owned ? "success" : "warning"
      );
    },
    []
  );

  // ── CSS variables
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
    .rx-section-title { font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--rx-sub); }
    @media (max-width: 640px) {
      .rx-grid-2 { grid-template-columns: 1fr !important; }
      .rx-hide-mobile { display: none !important; }
    }
  `;

  // ── Notification toast
  const NotifToast = () =>
    notification ? (
      <div
        className="rx-fadein"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          background:
            notification.type === "success"
              ? "#d1fae5"
              : notification.type === "error"
              ? "#fee2e2"
              : "#fef3c7",
          border: `1.5px solid ${
            notification.type === "success"
              ? "#6ee7b7"
              : notification.type === "error"
              ? "#fca5a5"
              : "#fcd34d"
          }`,
          padding: "12px 20px",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          maxWidth: 340,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        {notification.msg}
      </div>
    ) : null;

  // ── Medication detail modal (unchanged but using getMedName/getDoseLabel)
  const MedDetailModal = ({ rx }: { rx: Prescription }) => {
    const freqCode = rx.frequencyCode || getFreqCode(rx.frequency);
    const config = FREQUENCY_MAP[freqCode as FrequencyCode];
    const rxSchedules = schedules.filter((s) => s.prescriptionId === rx.id);
    const taken = rxSchedules.filter((s) => s.status === "taken" || s.status === "delayed").length;
    const total = rxSchedules.filter((s) => s.status !== "pending").length;
    const pct = total > 0 ? Math.round((taken / total) * 100) : 100;

    const nextPending = rxSchedules.find(
      (s) => s.status === "pending" && toDate(s.scheduledTime)! > todayDate
    );
    const nextTime = nextPending ? toDate(nextPending.scheduledTime) : null;
    const isOwned = markedOwned[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          backdropFilter: "blur(4px)",
        }}
        onClick={() => setShowDetail(false)}
      >
        <div
          className="rx-slide rx-card"
          style={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg,#0f766e,#14b8a6)",
              padding: "24px 24px 20px",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                    marginBottom: 6,
                  }}
                >
                  Medication Details
                </div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{getMedName(rx)}</div>
                {rx.genericName && rx.genericName !== getMedName(rx) && (
                  <div style={{ fontSize: 13, opacity: 0.85 }}>{rx.genericName}</div>
                )}
              </div>
              <button
                onClick={() => setShowDetail(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>
            {rx.indication && (
              <div
                style={{
                  marginTop: 10,
                  display: "inline-flex",
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                📋 {rx.indication}
              </div>
            )}
          </div>

          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Adherence ring + possession */}
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                background: "#f0fdf9",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <AdherenceRing pct={pct} size={80} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>
                  Adherence
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {taken} of {total} doses taken
                </div>
                {nextTime && (
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>
                    ⏰ Next dose: {fmtTime(nextTime)} ({timeUntil(nextTime)})
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>
                  Have it?
                </div>
                <button
                  className="rx-btn"
                  onClick={() => handleToggleOwned(rx, !isOwned)}
                  style={{
                    background: isOwned ? "#d1fae5" : "#fef3c7",
                    color: isOwned ? "#065f46" : "#92400e",
                    border: `1.5px solid ${isOwned ? "#6ee7b7" : "#fcd34d"}`,
                    padding: "6px 14px",
                    fontSize: 12,
                  }}
                >
                  {isOwned ? "✓ Have it" : "Buy needed"}
                </button>
              </div>
            </div>

            {/* Details grid */}
            <div>
              <div className="rx-section-title" style={{ marginBottom: 12 }}>
                Prescription Details
              </div>
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
                className="rx-grid-2"
              >
                {[
                  { label: "Dose", value: getDoseLabel(rx.dose || rx.dosage) },
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
                  <div
                    key={label}
                    style={{
                      background: "#f9fffe",
                      borderRadius: 10,
                      padding: "10px 14px",
                      border: "1px solid #d1fae5",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 2,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                      {value || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indication & instructions */}
            {(rx.instructions || rx.indication) && (
              <div
                style={{
                  background: "#ecfdf5",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid #a7f3d0",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#047857",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  Why & How
                </div>
                {rx.indication && (
                  <div style={{ fontSize: 13, color: "#065f46", marginBottom: 6 }}>
                    <strong>For:</strong> {rx.indication}
                  </div>
                )}
                {rx.instructions && (
                  <div style={{ fontSize: 13, color: "#065f46" }}>
                    <strong>Instructions:</strong> {rx.instructions}
                  </div>
                )}
              </div>
            )}

            {/* Side effects & warnings */}
            {(rx.sideEffects?.length || rx.warnings) && (
              <div
                style={{
                  background: "#fff7ed",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid #fed7aa",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#c2410c",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  ⚠ Side Effects & Warnings
                </div>
                {rx.sideEffects?.map((se, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#7c2d12", marginBottom: 3 }}>
                    • {se}
                  </div>
                ))}
                {rx.warnings && (
                  <div style={{ fontSize: 13, color: "#7c2d12", marginTop: 4 }}>{rx.warnings}</div>
                )}
              </div>
            )}

            {/* Change history timeline */}
            {rx.changeHistory && rx.changeHistory.length > 0 && (
              <div>
                <div className="rx-section-title" style={{ marginBottom: 12 }}>
                  Change History
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    {
                      changeType: "started",
                      changedBy: rx.doctorName,
                      date: fmt(toDate(rx.createdAt || rx.startDate)),
                    },
                    ...rx.changeHistory,
                  ].map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <TimelineDot type={c.changeType} />
                      <div style={{ flex: 1, paddingTop: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                          {c.changeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {c.date} · By {c.changedBy}
                        </div>
                        {c.reason && (
                          <div style={{ fontSize: 12, color: "#6b7280" }}>Reason: {c.reason}</div>
                        )}
                        {c.previousDose && c.newDose && (
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            {c.previousDose} → {c.newDose}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's doses */}
            {rxSchedules.length > 0 && (
              <div>
                <div className="rx-section-title" style={{ marginBottom: 12 }}>
                  Today's Doses
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {rxSchedules
                    .filter((s) => {
                      const d = toDate(s.scheduledTime);
                      return d && d.toDateString() === todayDate.toDateString();
                    })
                    .map((s) => {
                      const st = toDate(s.scheduledTime);
                      const at = toDate(s.actualTime);
                      return (
                        <div
                          key={s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background:
                              s.status === "taken"
                                ? "#f0fdf4"
                                : s.status === "missed"
                                ? "#fef2f2"
                                : s.status === "delayed"
                                ? "#fff7ed"
                                : "#fafafa",
                            border: `1px solid ${
                              s.status === "taken"
                                ? "#bbf7d0"
                                : s.status === "missed"
                                ? "#fecaca"
                                : s.status === "delayed"
                                ? "#fed7aa"
                                : "#e5e7eb"
                            }`,
                            borderRadius: 10,
                            padding: "10px 14px",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>
                              Dose #{s.doseNumber} · {fmtTime(st)}
                            </div>
                            {at && (
                              <div style={{ fontSize: 11, color: "#6b7280" }}>
                                Taken at {fmtTime(at)}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <StatusDot status={s.status} />
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: "#6b7280",
                              }}
                            >
                              {s.status}
                            </span>
                            {s.status === "pending" && (
                              <button
                                className="rx-btn rx-btn-primary"
                                style={{ padding: "5px 12px", fontSize: 11 }}
                                disabled={takingDose === s.id}
                                onClick={() => handleTakeDose(s, rx)}
                              >
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
            {rxSchedules.length === 0 && rx.status === "active" && (
              <div
                style={{
                  background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                  borderRadius: 14,
                  padding: 20,
                  textAlign: "center",
                  border: "1.5px solid #6ee7b7",
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 8 }}
                >
                  Ready to start this medication?
                </div>
                <div style={{ fontSize: 12, color: "#047857", marginBottom: 16 }}>
                  Tap below when you take your first dose. Your full schedule will be set automatically.
                </div>
                <button
                  className="rx-btn rx-btn-primary rx-pulse"
                  disabled={takingDose === rx.id}
                  onClick={() => handleFirstDose(rx)}
                  style={{ padding: "12px 28px", fontSize: 14 }}
                >
                  {takingDose === rx.id ? "⏳ Setting up schedule..." : "💊 I've Taken My First Dose"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Prescription card (used in Active tab)
  const RxCard = ({ rx }: { rx: Prescription }) => {
    const rxSchedules = schedules.filter((s) => s.prescriptionId === rx.id);
    const taken = rxSchedules.filter((s) => s.status === "taken" || s.status === "delayed").length;
    const total = rxSchedules.filter((s) => s.status !== "pending").length;
    const pct = total > 0 ? Math.round((taken / total) * 100) : rxSchedules.length === 0 ? null : 100;
    const badge = pct !== null ? adherenceBadge(pct) : null;

    const nextPending = rxSchedules.find(
      (s) => s.status === "pending" && toDate(s.scheduledTime)! > todayDate
    );
    const nextTime = nextPending ? toDate(nextPending.scheduledTime) : null;
    const isOwned = markedOwned[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;
    const isNew =
      rx.changeHistory?.length === 0 && rx.status === "active";
    const freqCode = rx.frequencyCode || getFreqCode(rx.frequency);

    const dueNowForRx = rxSchedules.some((s) => {
      if (s.status !== "pending") return false;
      const d = toDate(s.scheduledTime);
      return d && d <= new Date(todayDate.getTime() + 60 * 60000) && d > new Date(todayDate.getTime() - 30 * 60000);
    });

    return (
      <div
        className={`rx-card rx-fadein ${dueNowForRx ? "rx-pulse" : ""}`}
        style={{
          cursor: "pointer",
          transition: "all 0.2s",
          border: dueNowForRx ? "2px solid #f59e0b" : "1px solid #d1fae5",
        }}
        onClick={() => {
          setSelectedRx(rx);
          setShowDetail(true);
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: "16px 18px 12px",
            background:
              rx.status === "stopped"
                ? "#f9fafb"
                : rx.status === "paused"
                ? "#fffbeb"
                : "linear-gradient(135deg,#f0fdf9,#ecfdf5)",
            borderBottom: "1px solid #d1fae5",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 4,
                }}
              >
                <StatusDot status={rx.status} />
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#0f766e",
                    wordBreak: "break-word",
                  }}
                >
                  {getMedName(rx)}
                </span>
                {isNew && (
                  <span className="rx-badge" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                    NEW
                  </span>
                )}
                {dueNowForRx && (
                  <span className="rx-badge" style={{ background: "#fef3c7", color: "#92400e" }}>
                    ⏰ DUE
                  </span>
                )}
              </div>
              {rx.genericName && rx.genericName !== getMedName(rx) && (
                <div style={{ fontSize: 12, color: "#6b7280" }}>{rx.genericName}</div>
              )}
            </div>
            {pct !== null && badge && (
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <AdherenceRing pct={pct} size={52} />
              </div>
            )}
          </div>
          {rx.indication && (
            <span
              className="rx-badge"
              style={{ marginTop: 6, background: "#ccfbf1", color: "#0f766e", fontSize: 11 }}
            >
              {rx.indication}
            </span>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: "12px 18px 16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {[
              { label: "Dose", value: getDoseLabel(rx.dose || rx.dosage) },
              { label: "Route", value: rx.route },
              { label: "Frequency", value: freqCode },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f9fffe", borderRadius: 8, padding: "6px 10px" }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#111827", marginTop: 2 }}>
                  {value || "—"}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div>
              <span
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Start
              </span>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                {fmt(toDate(rx.startDate))}
              </div>
            </div>
            <div>
              <span
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {rx.actualStopDate
                  ? "Stopped"
                  : rx.expectedEndDate || rx.endDate
                  ? "Expected End"
                  : "Duration"}
              </span>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                {rx.actualStopDate
                  ? fmt(toDate(rx.actualStopDate))
                  : rx.expectedEndDate
                  ? fmt(toDate(rx.expectedEndDate))
                  : rx.endDate
                  ? fmt(toDate(rx.endDate))
                  : rx.duration
                  ? `${rx.duration} days`
                  : "Ongoing"}
              </div>
            </div>
          </div>

          {/* Possession + next dose */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="rx-btn"
                style={{
                  padding: "5px 12px",
                  fontSize: 11,
                  background: isOwned ? "#d1fae5" : "#fef3c7",
                  color: isOwned ? "#065f46" : "#92400e",
                  border: `1px solid ${isOwned ? "#6ee7b7" : "#fcd34d"}`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleOwned(rx, !isOwned);
                }}
              >
                {isOwned ? "✓ Have it" : "○ Buy needed"}
              </button>
              {rx.refills !== undefined && (
                <span
                  className="rx-badge"
                  style={{ background: "#f0f9ff", color: "#0369a1", fontSize: 10 }}
                >
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

          {/* Doctor info */}
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 11, color: "#9ca3af" }}>👨‍⚕️ {rx.doctorName}</span>
            <span style={{ fontSize: 11, color: "#14b8a6", fontWeight: 700 }}>View Details →</span>
          </div>
        </div>
      </div>
    );
  };

  // ── Today's schedule row
  const ScheduleRow = ({ s }: { s: MedSchedule }) => {
    const rx = prescriptions.find((p) => p.id === s.prescriptionId);
    if (!rx) return null;
    const st = toDate(s.scheduledTime);
    const at = toDate(s.actualTime);
    const overdue = s.status === "pending" && st && st < todayDate;

    return (
      <div
        className={`rx-fadein ${overdue ? "rx-shake" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background:
            s.status === "taken"
              ? "#f0fdf4"
              : s.status === "missed"
              ? "#fef2f2"
              : overdue
              ? "#fff7ed"
              : "#fff",
          border: `1px solid ${
            s.status === "taken"
              ? "#bbf7d0"
              : s.status === "missed"
              ? "#fecaca"
              : overdue
              ? "#fed7aa"
              : "#e5e7eb"
          }`,
          borderRadius: 12,
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background:
              s.status === "taken"
                ? "#d1fae5"
                : s.status === "missed"
                ? "#fee2e2"
                : overdue
                ? "#fef3c7"
                : "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {s.status === "taken" ? "✓" : s.status === "missed" ? "✖" : overdue ? "⚠" : "💊"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{getMedName(rx)}</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            {getDoseLabel(rx.dose || rx.dosage)} · {rx.route} · Scheduled {fmtTime(st)}
            {at && ` · Taken ${fmtTime(at)}`}
          </div>
          {rx.indication && (
            <div style={{ fontSize: 10, color: "#9ca3af" }}>For: {rx.indication}</div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {s.status === "pending" && (
            <button
              className="rx-btn rx-btn-primary"
              style={{ padding: "7px 14px", fontSize: 12 }}
              disabled={takingDose === s.id}
              onClick={() => handleTakeDose(s, rx)}
            >
              {takingDose === s.id ? "..." : "✓ Take Now"}
            </button>
          )}
          {s.status !== "pending" && (
            <span
              className="rx-badge"
              style={{
                background:
                  s.status === "taken"
                    ? "#d1fae5"
                    : s.status === "missed"
                    ? "#fee2e2"
                    : "#fef3c7",
                color:
                  s.status === "taken"
                    ? "#065f46"
                    : s.status === "missed"
                    ? "#7f1d1d"
                    : "#78350f",
              }}
            >
              <StatusDot status={s.status} /> {s.status}
            </span>
          )}
        </div>
      </div>
    );
  };

  // ── MAIN RENDER ────────────────────────────────────────────────────

  return (
    <>
      <style>{css}</style>
      <div className="rx-center" style={{ padding: "0 0 40px" }}>
        <NotifToast />
        {showDetail && selectedRx && <MedDetailModal rx={selectedRx!} />}

        {/* ── HEADER HERO ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #14b8a6 100%)",
            padding: "28px 20px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -20,
              right: 60,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                marginBottom: 6,
              }}
            >
              AMEXAN · Medication Center
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
              {patientName}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 20 }}>
              {activeMeds.length} Active Medication{activeMeds.length !== 1 ? "s" : ""} ·{" "}
              {todayDate.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Active Meds", value: activeMeds.length, color: "#fff", bg: "rgba(255,255,255,0.18)", icon: "💊" },
                {
                  label: "Due Now",
                  value: dueNow,
                  color: dueNow > 0 ? "#fef3c7" : "#fff",
                  bg: dueNow > 0 ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.18)",
                  icon: "⏰",
                },
                {
                  label: "Missed Today",
                  value: missedToday,
                  color: missedToday > 0 ? "#fee2e2" : "#fff",
                  bg: missedToday > 0 ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.18)",
                  icon: "⚠",
                },
                { label: "Adherence", value: `${overallAdherence}%`, color: "#fff", bg: "rgba(255,255,255,0.18)", icon: "📊" },
              ].map(({ label, value, color, bg, icon }) => (
                <div
                  key={label}
                  style={{
                    background: bg,
                    borderRadius: 12,
                    padding: "10px 12px",
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div
                    style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: 3 }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "12px 20px",
            display: "flex",
            gap: 6,
            overflowX: "auto",
          }}
        >
          {(["active", "history", "adherence", "pharmacy", "timeline", "response", "therapymap"] as const).map((t) => (
            <button
              key={t}
              className={`rx-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "active" ? "💊 Active"
                : t === "history" ? "📋 History"
                : t === "adherence" ? "📊 Adherence"
                : t === "pharmacy" ? "🏥 Pharmacy"
                : t === "timeline" ? "📈 Timeline"
                : t === "response" ? "📉 Response"
                : "🌳 Therapy Map"}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          {/* ── ACTIVE TAB ── */}
          {activeTab === "active" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {todaySchedules.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <div className="rx-section-title">Today's Schedule</div>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      {todayDate.toLocaleDateString("en-GB", { weekday: "long" })}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {todaySchedules
                      .sort(
                        (a, b) =>
                          (toDate(a.scheduledTime)?.getTime() || 0) -
                          (toDate(b.scheduledTime)?.getTime() || 0)
                      )
                      .map((s) => (
                        <ScheduleRow key={s.id} s={s} />
                      ))}
                  </div>
                </div>
              )}

              <div>
                <div className="rx-section-title" style={{ marginBottom: 12 }}>
                  Active Medications ({activeMeds.length})
                </div>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                    Loading medications...
                  </div>
                ) : activeMeds.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                    No active medications
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                      gap: 14,
                    }}
                  >
                    {activeMeds.map((rx) => (
                      <RxCard key={rx.id} rx={rx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Recently added (this week) */}
              {prescriptions
                .filter((p) => {
                  const d = toDate(p.createdAt);
                  return d && Date.now() - d.getTime() < 7 * 24 * 3600000;
                }).length > 0 && (
                <div>
                  <div className="rx-section-title" style={{ marginBottom: 12 }}>
                    Recently Added (This Week)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {prescriptions
                      .filter((p) => {
                        const d = toDate(p.createdAt);
                        return d && Date.now() - d.getTime() < 7 * 24 * 3600000;
                      })
                      .map((rx) => (
                        <div
                          key={rx.id}
                          className="rx-card rx-fadein"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            cursor: "pointer",
                            background: "linear-gradient(135deg,#fafffe,#f0fdf9)",
                          }}
                          onClick={() => {
                            setSelectedRx(rx);
                            setShowDetail(true);
                          }}
                        >
                          <span style={{ fontSize: 24 }}>🆕</span>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "#0f766e",
                              }}
                            >
                              {getMedName(rx)} {getDoseLabel(rx.dose || rx.dosage)}
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                              {rx.indication} · {rx.frequency} · By {rx.doctorName}
                            </div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>
                              Added {fmtFull(toDate(rx.createdAt))}
                            </div>
                          </div>
                          <span
                            className="rx-badge"
                            style={{ background: "#dbeafe", color: "#1d4ed8" }}
                          >
                            NEW
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <style>{`
            .vi-light {
              --surface: #ffffff;
              --surface2: #f9fafb;
              --border: #e5e7eb;
              --text: #111827;
              --text2: #6b7280;
              --muted: #9ca3af;
              --accent: #0f766e;
              --green: #059669;
            }
          `}</style>

          {/* ── TIMELINE TAB ── */}
          {activeTab === "timeline" && (
            <div className="vi-light" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <TherapeuticLifeTimeline
                events={prescriptions.flatMap((rx) => {
                  const evts: any[] = [];
                  const diseaseTrack = rx.indication || "General";
                  const drugName = getMedName(rx);
                  const startDate = toDate(rx.startDate) || new Date();
                  evts.push({
                    id: `rx-${rx.id}`, date: startDate,
                    type: "medication_start", diseaseTrack,
                    drug: drugName, dose: getDoseLabel(rx.dose || rx.dosage),
                    detail: `${rx.frequency || ""} · ${rx.route || ""}`,
                    outcome: rx.status, severity: "normal",
                  });
                  const stopD = toDate(rx.actualStopDate);
                  if (stopD) {
                    evts.push({
                      id: `rx-stop-${rx.id}`,
                      date: stopD,
                      type: "stopped", diseaseTrack,
                      drug: drugName, dose: getDoseLabel(rx.dose || rx.dosage),
                      detail: (rx as any).stopReason || "Discontinued",
                      severity: "warning",
                    });
                  }
                  return evts;
                })}
                patientName={patientName}
              />
              <div style={{
                background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
                padding: "14px 18px", fontSize: 11, color: "#6b7280", lineHeight: 1.6,
              }}>
                <strong style={{ color: "#0f766e" }}>📊 {prescriptions.length}</strong> total prescriptions ·
                <strong style={{ color: "#0f766e" }}> {prescriptions.filter((p) => p.status === "active").length}</strong> active ·
                <strong style={{ color: "#0f766e" }}> {new Set(prescriptions.map((p) => getMedName(p))).size}</strong> unique medications
              </div>
            </div>
          )}

          {/* ── RESPONSE TAB ── */}
          {activeTab === "response" && (
            <div className="vi-light" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(() => {
                const entries: any[] = [];
                prescriptions.forEach((rx) => {
                  const drug = getMedName(rx);
                  for (let w = 0; w < 4; w++) {
                    const date = new Date(Date.now() - (3 - w) * 7 * 86400000);
                    const base = Math.min(95, Math.max(30, 55 + w * 8));
                    entries.push({
                      id: `${rx.id}-w${w}`,
                      drug, dose: getDoseLabel(rx.dose || rx.dosage),
                      date,
                      effectivenessScore: base + Math.round((Math.random() - 0.3) * 20),
                      symptomScore: Math.max(1, Math.min(10, 7 - w + Math.round((Math.random() - 0.5) * 2))),
                      sideEffectBurden: Math.max(0, Math.min(8, Math.round(Math.random() * 4))),
                      patientReported: ["Initial", "Mild improvement", "Moderate", "Good response"][w],
                    });
                  }
                });
                return entries;
              })().length > 0 && (
                <>
                  <DrugResponseGraph
                     entries={prescriptions.flatMap((rx) => {
                      const drug = getMedName(rx);
                      const base = 60;
                      return [0, 1, 2, 3].map((w) => ({
                        date: new Date(Date.now() - (3 - w) * 7 * 86400000).toISOString().split("T")[0],
                        effect: Math.min(95, base + w * 8 + Math.round((Math.random() - 0.3) * 15)),
                        severity: Math.max(10, 70 - w * 12 + Math.round((Math.random() - 0.5) * 15)),
                        medication: drug,
                      }));
                    })}
                    targetRangeMin={60}
                    targetRangeMax={90}
                  />
                  <ClinicalResponseBoard
                    entries={prescriptions.flatMap((rx) => {
                      const drug = getMedName(rx);
                      return [0, 1, 2, 3].map((w) => ({
                        id: `${rx.id}-w${w}`,
                        drug, dose: getDoseLabel(rx.dose || rx.dosage),
                        date: new Date(Date.now() - (3 - w) * 7 * 86400000),
                        effectivenessScore: Math.min(95, 55 + w * 8 + Math.round((Math.random() - 0.3) * 20)),
                        symptomScore: Math.max(1, 7 - w + Math.round((Math.random() - 0.5) * 2)),
                        sideEffectBurden: Math.max(0, Math.round(Math.random() * 4)),
                        patientReported: ["Starting", "Mild improvement", "Moderate", "Good response"][w],
                      }));
                    })}
                    patientName={patientName}
                  />
                </>
              )}
            </div>
          )}

          {/* ── THERAPY MAP TAB ── */}
          {activeTab === "therapymap" && (
            <div className="vi-light" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MedicationEvolutionMap
                rootDiagnosis={prescriptions.find((rx) => rx.indication)?.indication || "General"}
                branches={buildTherapyTree(prescriptions, prescriptions.find((rx) => rx.indication)?.indication || "General", patientName)}
                patientName={patientName}
              />
              <div style={{
                background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
                padding: "12px 16px", display: "flex", alignItems: "center", gap: 8,
                fontSize: 11, color: "#6b7280",
              }}>
                <span style={{ fontSize: 16 }}>💡</span>
                Therapy evolution map shows the full medication journey — start, stop, switch, and outcome for each drug.
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === "history" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["all", "active", "stopped", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: filterStatus === f ? "#0f766e" : "#f3f4f6",
                      color: filterStatus === f ? "#fff" : "#6b7280",
                      border: "none",
                      textTransform: "capitalize",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {Object.entries(
                prescriptions
                  .filter((p) => filterStatus === "all" || p.status === filterStatus)
                  .reduce((acc, rx) => {
                    const key = rx.indication || "General";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(rx);
                    return acc;
                  }, {} as Record<string, Prescription[]>)
              ).map(([indication, rxList]) => (
                <div key={indication}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <div className="rx-section-title">{indication}</div>
                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      {rxList.length} drug{rxList.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {rxList.map((rx) => {
                      const isActive = rx.status === "active" || rx.active;
                      return (
                        <div
                          key={rx.id}
                          className="rx-card rx-fadein"
                          style={{
                            cursor: "pointer",
                            opacity: isActive ? 1 : 0.75,
                            border: isActive ? "1.5px solid #a7f3d0" : "1px solid #e5e7eb",
                          }}
                          onClick={() => {
                            setSelectedRx(rx);
                            setShowDetail(true);
                          }}
                        >
                          <div style={{ padding: "14px 16px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                gap: 8,
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 4,
                                  }}
                                >
                                  <StatusDot status={rx.status} />
                                  <span
                                    style={{
                                      fontSize: 15,
                                      fontWeight: 800,
                                      color: isActive ? "#0f766e" : "#6b7280",
                                    }}
                                  >
                                    {getMedName(rx)}
                                  </span>
                                  <span
                                    className="rx-badge"
                                    style={{
                                      background: isActive
                                        ? "#d1fae5"
                                        : rx.status === "completed"
                                        ? "#dbeafe"
                                        : "#f3f4f6",
                                      color: isActive
                                        ? "#065f46"
                                        : rx.status === "completed"
                                        ? "#1d4ed8"
                                        : "#6b7280",
                                    }}
                                  >
                                    {rx.status}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                  {getDoseLabel(rx.dose || rx.dosage)} · {rx.route} · {rx.frequency}
                                </div>
                                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                                  {fmt(toDate(rx.startDate))} →{" "}
                                  {rx.actualStopDate
                                    ? fmt(toDate(rx.actualStopDate))
                                    : rx.endDate
                                    ? fmt(toDate(rx.endDate))
                                    : "Ongoing"}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                  By {rx.doctorName}
                                </div>
                                {rx.changeHistory && rx.changeHistory.length > 0 && (
                                  <span
                                    className="rx-badge"
                                    style={{
                                      background: "#f5f3ff",
                                      color: "#7c3aed",
                                      marginTop: 4,
                                    }}
                                  >
                                    {rx.changeHistory.length} changes
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Mini timeline */}
                            {rx.changeHistory && rx.changeHistory.length > 0 && (
                              <div
                                style={{
                                  marginTop: 10,
                                  paddingTop: 10,
                                  borderTop: "1px solid #e5e7eb",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    overflowX: "auto",
                                  }}
                                >
                                  {[
                                    {
                                      changeType: "started",
                                      date: fmt(toDate(rx.createdAt || rx.startDate)),
                                      changedBy: rx.doctorName,
                                    },
                                    ...rx.changeHistory,
                                  ].map((c, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        display: "flex",
                                        gap: 6,
                                        alignItems: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {i > 0 && (
                                        <div
                                          style={{
                                            width: 20,
                                            height: 1,
                                            background: "#d1d5db",
                                          }}
                                        />
                                      )}
                                      <div style={{ textAlign: "center" }}>
                                        <TimelineDot type={c.changeType} />
                                        <div
                                          style={{
                                            fontSize: 9,
                                            color: "#9ca3af",
                                            marginTop: 4,
                                            maxWidth: 52,
                                          }}
                                        >
                                          {c.date}
                                        </div>
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



{activeTab === "adherence" && (() => {

  /* ─────────────────────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────────────────────── */

  const todayStr = new Date().toISOString().split("T")[0];

  const pctColor = (p) =>
    p >= 90 ? "#059669" : p >= 75 ? "#d97706" : p >= 50 ? "#ea580c" : "#dc2626";

  const pctBg = (p) =>
    p >= 90 ? "#ecfdf5" : p >= 75 ? "#fffbeb" : p >= 50 ? "#fff7ed" : "#fef2f2";

  const statusMeta = {
    taken:    { color: "#059669", bg: "#ecfdf5", label: "Taken" },
    missed:   { color: "#dc2626", bg: "#fef2f2", label: "Missed" },
    delayed:  { color: "#d97706", bg: "#fffbeb", label: "Delayed" },
    pending:  { color: "#2563eb", bg: "#eff6ff", label: "Due now" },
    upcoming: { color: "#6b7280", bg: "#f9fafb", label: "Upcoming" },
  };

 const dayAdherenceForDrug = (
  dateStr: string,
  prescription: Prescription
): number | null => {
  // Use precomputed adherence if available
  const rec = adherenceRecords.find((r) => r.date === dateStr);
  if (rec?.perDrug?.[prescription.id]?.pct != null) {
    return rec.perDrug[prescription.id].pct;
  }

  // Get all doses scheduled for that specific day
  const daySchedules = schedules.filter((s) => {
    const scheduled = toDate(s.scheduledTime);
    if (!scheduled) return false;

    return (
      s.prescriptionId === prescription.id &&
      scheduled.toISOString().split("T")[0] === dateStr
    );
  });

  // No doses scheduled for this day
  if (daySchedules.length === 0) return null;

  // Count successfully administered doses
  const successfulDoses = daySchedules.filter((s) =>
    ["taken", "delayed"].includes(s.status)
  ).length;

  // Total doses expected today
  const totalScheduled = daySchedules.length;

  // Adherence percentage
  const adherence = Math.round(
    (successfulDoses / totalScheduled) * 100
  );

  return adherence;
};

  const overallAdherence = (() => {
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const rec = adherenceRecords.find(r => r.date === ds);
      return rec ? rec.adherencePercentage : null;
    }).filter(p => p !== null);
    return last30.length ? Math.round(last30.reduce((a, b) => a + b, 0) / last30.length) : 0;
  })();

  const toggleExpand = (id) =>
    setExpandedMeds(prev => ({ ...prev, [id]: !prev[id] }));

  /* ─────────────────────────────────────────────────────────────────────────
     DRUG being viewed in single-drug deep view
  ───────────────────────────────────────────────────────────────────────── */
  const focusDrug = activeDrugId
    ? prescriptions.find(p => p.id === activeDrugId)
    : null;

  /* ─────────────────────────────────────────────────────────────────────────
     NOTE TAG CONFIG
  ───────────────────────────────────────────────────────────────────────── */
  const NOTE_TAGS = [
    { label: "Side effect",       color: "#dc2626", bg: "#fef2f2" },
    { label: "Symptom change",    color: "#d97706", bg: "#fffbeb" },
    { label: "Missed dose reason",color: "#2563eb", bg: "#eff6ff" },
    { label: "General feedback",  color: "#059669", bg: "#ecfdf5" },
    { label: "Question",          color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Urgent concern",    color: "#dc2626", bg: "#fef2f2" },
  ];

  const SIDE_EFFECTS = [
    { id: "dizziness",   label: "Dizziness / Lightheadedness" },
    { id: "headache",    label: "Headache" },
    { id: "fatigue",     label: "Fatigue / Weakness" },
    { id: "swelling",    label: "Ankle / Leg swelling" },
    { id: "cough",       label: "Dry cough" },
    { id: "nausea",      label: "Nausea" },
    { id: "palpitation", label: "Palpitations" },
    { id: "rash",        label: "Skin rash / Itch" },
  ];

  const SEVERITY = ["None", "Mild", "Moderate", "Severe"];

  /* ═══════════════════════════════════════════════════════════════════════
     SUB-TAB SWITCHER
  ════════════════════════════════════════════════════════════════════════ */
  const SubTabBar = () => (
    <div style={{
      display: "flex",
      background: "#f1f5f9",
      borderRadius: 14,
      padding: 4,
      gap: 2,
      marginBottom: 20,
    }}>
      {["timeline", "drug", "notes"].map(tab => {
        const labels = { timeline: "📅 Timeline", drug: "💊 Drug Detail", notes: "📝 Notes" };
        const active = adherenceSubTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setAdherenceSubTab(tab as "notes" | "drug" | "timeline")}
            style={{
              flex: 1,
              padding: "9px 4px",
              borderRadius: 11,
              border: "none",
              fontSize: 12,
              fontWeight: active ? 700 : 500,
              background: active ? "#fff" : "transparent",
              color: active ? "#0f766e" : "#64748b",
              cursor: "pointer",
              boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              transition: "all 0.18s",
            }}
          >
            {labels[tab]}
          </button>
        );
      })}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════
     ① HERO CARD — Greeting + Next Dose Countdown
  ════════════════════════════════════════════════════════════════════════ */
  const HeroCard = () => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    const nextDose = schedules
      .filter(s => s.status === "pending")
      .sort(
        (a, b) =>
          (toDate(a.scheduledTime)?.getTime() ?? Infinity) -
          (toDate(b.scheduledTime)?.getTime() ?? Infinity)
      )[0];
    const rxForNext = nextDose
      ? prescriptions.find(p => p.id === nextDose.prescriptionId)
      : null;
    const nextTime = nextDose ? toDate(nextDose.scheduledTime) : null;
    const secondsLeft = nextTime
      ? Math.max(0, Math.floor((nextTime.getTime() - countdownNow.getTime()) / 1000))
      : 0;
    const hoursLeft = Math.floor(secondsLeft / 3600);
    const minutesLeft = Math.floor((secondsLeft % 3600) / 60);
    const isOverdue = nextTime && nextTime < countdownNow;
    const displayCountdown =
      hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`;

    const pendingToday = todaySchedules.filter(s => s.status === "pending").length;
    const takenToday = todaySchedules.filter(
      s => s.status === "taken" || s.status === "delayed"
    ).length;
    const totalToday = todaySchedules.filter(s => (s as any).status !== "upcoming").length;

    return (
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #0f766e 55%, #0d9488 100%)",
          borderRadius: 20,
          padding: "22px 22px 18px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        {/* Decorative circle */}
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 130, height: 130, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />
        <div style={{
          position: "absolute", bottom: -20, right: 60,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />

        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.75, marginBottom: 3 }}>
          {greeting}, {patientName}
        </div>

        {/* Today progress row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
              {takenToday} of {totalToday} doses taken today
            </div>
            <div style={{
              height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${totalToday > 0 ? (takenToday / totalToday) * 100 : 0}%`,
                background: "#6ee7b7",
                borderRadius: 4,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "6px 12px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{overallAdherence}%</div>
            <div style={{ fontSize: 9, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              30-day
            </div>
          </div>
        </div>

        {/* Next dose */}
        {rxForNext && nextTime ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,0.10)",
            borderRadius: 14, padding: "12px 14px",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                {isOverdue ? "⚠ OVERDUE" : "Next dose"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>
                {getMedName(rxForNext)}{" "}
                <span style={{ fontWeight: 500, opacity: 0.85 }}>
                  {getDoseLabel(rxForNext.dose ?? rxForNext.dosage)}
                </span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                {fmtTime(nextTime)} ·{" "}
                {isOverdue ? (
                  <span style={{ color: "#fcd34d", fontWeight: 700 }}>Overdue</span>
                ) : (
                  <span style={{ color: "#6ee7b7" }}>{displayCountdown} remaining</span>
                )}
              </div>
            </div>
            <button
              disabled={takingDose === nextDose?.id}
              onClick={() => rxForNext && nextDose && handleTakeDose(nextDose, rxForNext)}
              style={{
                background: "#fff",
                color: "#0f766e",
                fontWeight: 800,
                fontSize: 13,
                padding: "10px 20px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                flexShrink: 0,
                transition: "transform 0.15s",
              }}
            >
              {takingDose === nextDose?.id ? "⏳" : "Take Now"}
            </button>
          </div>
        ) : (
          <div style={{
            background: "rgba(110,231,183,0.15)",
            borderRadius: 14, padding: "12px 14px",
            fontSize: 13, fontWeight: 600,
          }}>
            ✓ All caught up! No pending doses.
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ② 7-DAY HORIZONTAL STRIP
  ════════════════════════════════════════════════════════════════════════ */
  const DayStrip = () => {
    const base = new Date();
    const dow = base.getDay();
    const mondayOff = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOff + weekOffset * 7);
    const stripStart = new Date(monday);
    const stripEnd = new Date(monday); stripEnd.setDate(monday.getDate() + 6);

    const fmtShort = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    return (
      <div className="rx-card" style={{ padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button className="rx-btn rx-btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}
            onClick={() => setWeekOffset(w => w - 1)}>←</button>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {fmtShort(stripStart)} – {fmtShort(stripEnd)}
          </span>
          <button className="rx-btn rx-btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}
            onClick={() => setWeekOffset(w => w + 1)}>→</button>
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const day = new Date(monday); day.setDate(monday.getDate() + i);
            const ds = day.toISOString().split("T")[0];
            const isToday = ds === todayStr;
            const isSel = ds === selectedDay;

            const daySchedules = schedules.filter(s => {
              const d = toDate(s.scheduledTime);
              return d && d.toISOString().split("T")[0] === ds;
            }).sort((a, b) =>
              (toDate(a.scheduledTime)?.getTime() ?? 0) -
              (toDate(b.scheduledTime)?.getTime() ?? 0)
            );

            const dots = daySchedules.map(s => {
              const overdue = s.status === "pending" && (toDate(s.scheduledTime) ?? new Date(0)) < new Date();
              if (s.status === "taken")   return "#059669";
              if (s.status === "missed")  return "#dc2626";
              if (s.status === "delayed") return "#d97706";
              if (overdue)                return "#f59e0b";
              return "#3b82f6";
            });

            // Day-level adherence score
            const rec = adherenceRecords.find(r => r.date === ds);
            const dayPct = rec?.adherencePercentage ?? null;

            return (
              <div
                key={i}
                onClick={() => setSelectedDay(ds)}
                style={{
                  flex: "1 0 auto",
                  minWidth: 58,
                  background: isSel
                    ? "linear-gradient(160deg, #0f766e, #14b8a6)"
                    : isToday ? "#f0fdf9" : "#fff",
                  border: `1.5px solid ${isSel ? "#0f766e" : isToday ? "#6ee7b7" : "#e5e7eb"}`,
                  borderRadius: 14,
                  padding: "8px 5px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  boxShadow: isSel ? "0 4px 12px rgba(15,118,110,0.22)" : "none",
                }}
              >
                <div style={{
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  color: isSel ? "rgba(255,255,255,0.75)" : "#9ca3af",
                  marginBottom: 2,
                }}>
                  {day.toLocaleDateString("en-GB", { weekday: "short" })}
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800,
                  color: isSel ? "#fff" : "#111827",
                  marginBottom: 5,
                }}>
                  {day.getDate()}
                </div>

                {/* Dose dots */}
                {dots.length > 0 ? (
                  <div style={{ display: "flex", justifyContent: "center", gap: 3, flexWrap: "wrap", minHeight: 16 }}>
                    {dots.slice(0, 5).map((c, j) => (
                      <span key={j} style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: isSel ? "rgba(255,255,255,0.75)" : c,
                        display: "inline-block",
                        boxShadow: isSel ? "none" : `0 0 0 1.5px ${c}30`,
                      }} />
                    ))}
                    {dots.length > 5 && (
                      <span style={{ fontSize: 8, color: isSel ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
                        +{dots.length - 5}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: isSel ? "rgba(255,255,255,0.5)" : "#d1d5db", minHeight: 16 }}>—</div>
                )}

                {/* Adherence pct */}
                {dayPct !== null && (
                  <div style={{
                    marginTop: 5, fontSize: 10, fontWeight: 700,
                    color: isSel ? "rgba(255,255,255,0.9)" : pctColor(dayPct),
                  }}>
                    {dayPct}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ③ SELECTED DAY EXPAND PANEL — per medication per dose breakdown
  ════════════════════════════════════════════════════════════════════════ */
  const DayExpandPanel = () => {
    const selDate = new Date(selectedDay + "T00:00:00");
    const daySchedules = schedules.filter(s => {
      const d = toDate(s.scheduledTime);
      return d && d.toISOString().split("T")[0] === selectedDay;
    });
    const rxMap = Object.fromEntries(prescriptions.map(rx => [rx.id, rx]));
    const medIds = Array.from(new Set(daySchedules.map(s => s.prescriptionId)));

    // Day summary stats
    const pastDoses = daySchedules.filter(s => (s as any).status !== "upcoming");
    const takenCount = pastDoses.filter(s => s.status === "taken" || s.status === "delayed").length;
    const dayPct = pastDoses.length ? Math.round((takenCount / pastDoses.length) * 100) : null;

    return (
      <div className="rx-card" style={{ marginBottom: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: daySchedules.length ? "1px solid #f3f4f6" : "none",
          background: dayPct !== null ? pctBg(dayPct) : undefined,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
              {selDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            {dayPct !== null && (
              <div style={{ fontSize: 11, color: pctColor(dayPct), fontWeight: 600, marginTop: 2 }}>
                {takenCount}/{pastDoses.length} doses taken · {dayPct}% adherence
              </div>
            )}
          </div>
          {dayPct !== null && (
            <div style={{
              background: pctColor(dayPct), color: "#fff",
              borderRadius: 10, padding: "4px 12px",
              fontSize: 13, fontWeight: 800,
            }}>
              {dayPct}%
            </div>
          )}
        </div>

        {daySchedules.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            No doses scheduled for this day.
          </div>
        ) : (
          <div style={{ padding: "10px 14px" }}>
            {medIds.map(medId => {
              const rx = rxMap[medId];
              if (!rx) return null;
              const medSched = daySchedules
                .filter(s => s.prescriptionId === medId)
                .sort((a, b) =>
                  (toDate(a.scheduledTime)?.getTime() ?? 0) -
                  (toDate(b.scheduledTime)?.getTime() ?? 0)
                );
              const medTaken = medSched.filter(s => s.status === "taken" || s.status === "delayed").length;

              return (
                <div key={medId} style={{ marginBottom: 14 }}>
                  {/* Medication header */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 6,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f766e" }}>
                      {getMedName(rx)}
                      <span style={{
                        fontSize: 11, fontWeight: 500, color: "#64748b", marginLeft: 6,
                      }}>
                        {getDoseLabel(rx.dose ?? rx.dosage)} · {rx.frequency}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: medTaken === medSched.length ? "#ecfdf5" : "#fef2f2",
                      color: medTaken === medSched.length ? "#059669" : "#dc2626",
                      padding: "2px 8px", borderRadius: 8,
                    }}>
                      {medTaken}/{medSched.length}
                    </span>
                  </div>

                  {/* Dose rows */}
                  {medSched.map(s => {
                    const st = toDate(s.scheduledTime);
                    const at = toDate(s.actualTime);
                    const overdue = s.status === "pending" && st && st < new Date();
                    const effectiveStatus = overdue ? "pending" : s.status;
                    const meta = statusMeta[effectiveStatus] ?? statusMeta.upcoming;
                    const delayMin = at && st
                      ? Math.round((at.getTime() - st.getTime()) / 60000)
                      : 0;

                    return (
                      <div
                        key={s.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 10px",
                          background: meta.bg,
                          borderRadius: 10,
                          marginBottom: 6,
                          border: `1px solid ${meta.color}25`,
                        }}
                      >
                        {/* Status dot */}
                        <div style={{
                          width: 9, height: 9, borderRadius: "50%",
                          background: meta.color,
                          boxShadow: `0 0 0 2px ${meta.color}25`,
                          flexShrink: 0,
                        }} />

                        {/* Time info */}
                        <div style={{ minWidth: 52 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                            {fmtTime(st)}
                          </div>
                          {at && at !== st && (
                            <div style={{ fontSize: 10, color: "#6b7280" }}>
                              Taken {fmtTime(at)}{delayMin > 0 ? ` (+${delayMin}m)` : ""}
                            </div>
                          )}
                        </div>

                        {/* Status label */}
                        <span style={{
                          flex: 1, fontSize: 12, fontWeight: 700,
                          color: meta.color,
                        }}>
                          {meta.label}
                          {overdue && s.status === "pending" ? " (overdue)" : ""}
                        </span>

                        {/* Action button */}
                        {s.status === "pending" && (
                          <button
                            className="rx-btn rx-btn-primary"
                            disabled={takingDose === s.id}
                            onClick={(e) => { e.stopPropagation(); handleTakeDose(s, rx); }}
                            style={{ padding: "4px 12px", fontSize: 11, fontWeight: 700 }}
                          >
                            {takingDose === s.id ? "..." : "Take"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ④ MEDICATION OVERVIEW CARDS — with mini 7-day bar chart + full
        single-drug deep-dive toggle
  ════════════════════════════════════════════════════════════════════════ */
  const MedOverviewCards = () => (
    <div style={{ marginBottom: 16 }}>
      <div className="rx-section-title" style={{ marginBottom: 10 }}>
        Medication Overview
      </div>
      {activeMeds.map(rx => {
        const rxSched = schedules.filter(s => s.prescriptionId === rx.id);
        const past = rxSched.filter(s => (s as any).status !== "upcoming");
        const taken = past.filter(s => s.status === "taken" || s.status === "delayed").length;
        const pct = past.length ? Math.round((taken / past.length) * 100) : 100;
        const badge = adherenceBadge(pct);
        const expanded = expandedMeds[rx.id] ?? false;

        // Last 14 days mini bars
        const last14 = Array.from({ length: 14 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (13 - i));
          const ds = d.toISOString().split("T")[0];
          return { ds, pct: dayAdherenceForDrug(ds, rx), dayNum: d.getDate() };
        });

        // Streak
        const streak = (() => {
          let s = 0;
          for (let i = 0; i < 30; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const ds = d.toISOString().split("T")[0];
            const p = dayAdherenceForDrug(ds, rx);
            if (p === null) continue;
            if (p >= 90) s++;
            else break;
          }
          return s;
        })();

        return (
          <div
            key={rx.id}
            className="rx-card rx-fadein"
            style={{ padding: "14px 16px", cursor: "pointer", marginBottom: 10 }}
          >
            {/* Card header row */}
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onClick={() => toggleExpand(rx.id)}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f766e" }}>
                  {getMedName(rx)}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {getDoseLabel(rx.dose ?? rx.dosage)} · {rx.route} · {rx.frequency}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {streak > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: "#d97706",
                    background: "#fffbeb", borderRadius: 8, padding: "2px 7px",
                  }}>
                    🔥 {streak}d
                  </span>
                )}
                <AdherenceRing pct={pct} size={40} />
                <span style={{ fontSize: 13, fontWeight: 700, color: badge.color }}>
                  {badge.label}
                </span>
                <span style={{ fontSize: 16, color: "#9ca3af" }}>{expanded ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* 14-day mini bar chart */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32 }}>
                {last14.map(({ ds, pct: p }, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: p !== null ? `${Math.max(4, (p / 100) * 32)}px` : "4px",
                    background: p !== null ? pctColor(p) : "#e5e7eb",
                    borderRadius: "2px 2px 0 0",
                    transition: "height 0.3s",
                    opacity: ds === selectedDay ? 1 : 0.75,
                    outline: ds === selectedDay ? `2px solid #0f766e` : "none",
                  }} title={`${p !== null ? p + "%" : "No data"}`} />
                ))}
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 9, color: "#9ca3af", marginTop: 2,
              }}>
                <span>{last14[0]?.dayNum}</span>
                <span>Today</span>
              </div>
            </div>

            {/* Expanded details */}
            {expanded && (
              <div style={{ marginTop: 14, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, marginBottom: 12 }}>
                  {[
                    ["Taken", taken, "#059669"],
                    ["Missed", rxSched.filter(s => s.status === "missed").length, "#dc2626"],
                    ["Delayed", rxSched.filter(s => s.status === "delayed").length, "#d97706"],
                    ["Pending", rxSched.filter(s => s.status === "pending").length, "#2563eb"],
                  ].map(([lbl, val, clr]) => (
                    <div key={lbl} style={{
                      background: "#f8fafc", borderRadius: 8, padding: "6px 12px",
                      borderLeft: `3px solid ${clr}`,
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: clr as string }}>{val}</div>
                      <div style={{ fontSize: 10, color: "#6b7280" }}>{lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Last 14 dose history table */}
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Date", "Scheduled", "Taken at", "Status"].map(h => (
                          <th key={h} style={{
                            padding: "5px 7px", textAlign: "left",
                            fontSize: 10, fontWeight: 700, color: "#6b7280",
                            textTransform: "uppercase", letterSpacing: "0.05em",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rxSched
                        .filter(s => (s as any).status !== "upcoming")
                        .sort((a, b) =>
                          (toDate(b.scheduledTime)?.getTime() ?? 0) -
                          (toDate(a.scheduledTime)?.getTime() ?? 0)
                        )
                        .slice(0, 14)
                        .map(s => {
                          const st = toDate(s.scheduledTime);
                          const at = toDate(s.actualTime);
                          const meta = statusMeta[s.status] ?? statusMeta.upcoming;
                          return (
                            <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "5px 7px" }}>{fmt(st)}</td>
                              <td style={{ padding: "5px 7px" }}>{fmtTime(st)}</td>
                              <td style={{ padding: "5px 7px" }}>{at ? fmtTime(at) : "—"}</td>
                              <td style={{ padding: "5px 7px" }}>
                                <span style={{
                                  fontWeight: 700, color: meta.color,
                                  background: meta.bg, padding: "1px 6px",
                                  borderRadius: 6, fontSize: 10,
                                }}>
                                  {meta.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Deep dive button */}
                <button
                  onClick={() => { setActiveDrugId(rx.id); setAdherenceSubTab("drug"); }}
                  style={{
                    marginTop: 12, width: "100%",
                    background: "#f0fdf4", border: "1px solid #6ee7b7",
                    borderRadius: 10, padding: "9px",
                    fontSize: 12, fontWeight: 700, color: "#0f766e",
                    cursor: "pointer",
                  }}
                >
                  View full {getMedName(rx)} analysis →
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════
     ⑤ MONTHLY HEAT STRIP
  ════════════════════════════════════════════════════════════════════════ */
  const MonthlyHeatStrip = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return (
      <div className="rx-card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 10,
        }}>
          <div className="rx-section-title">Monthly Heatmap</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button className="rx-btn rx-btn-ghost" style={{ padding: "3px 8px", fontSize: 12 }}
              onClick={() => {
                if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
                else setSelectedMonth(m => m - 1);
              }}>←</button>
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              {new Date(selectedYear, selectedMonth, 1).toLocaleDateString("en-GB", {
                month: "short", year: "numeric",
              })}
            </span>
            <button className="rx-btn rx-btn-ghost" style={{ padding: "3px 8px", fontSize: 12 }}
              onClick={() => {
                if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
                else setSelectedMonth(m => m + 1);
              }}>→</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const ds = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const rec = adherenceRecords.find(r => r.date === ds);
            const p = rec?.adherencePercentage ?? null;
            const color = p === null
              ? "#e5e7eb"
              : p >= 90 ? "#059669"
              : p >= 75 ? "#d97706"
              : p >= 50 ? "#ea580c"
              : "#dc2626";
            const isSelected = ds === selectedDay;
            return (
              <div
                key={d}
                title={`${d}: ${p !== null ? p + "%" : "No data"}`}
                onClick={() => setSelectedDay(ds)}
                style={{
                  flex: "1 0 auto", width: 13, height: 28,
                  background: color, borderRadius: 3,
                  cursor: "pointer",
                  outline: isSelected ? "2px solid #0f766e" : "none",
                  outlineOffset: 1,
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scaleY(1.25)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scaleY(1)")}
              />
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 9, color: "#9ca3af" }}>
          <span>1</span><span>15</span><span>{daysInMonth}</span>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          {[["#059669","≥90%"],["#d97706","75–89%"],["#ea580c","50–74%"],["#dc2626","<50%"],["#e5e7eb","No data"]].map(([c, l]) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6b7280" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />
              {l}
            </span>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ⑥ 30-DAY SCORE RING + TIME-OF-DAY PATTERN
  ════════════════════════════════════════════════════════════════════════ */
  const ScoreAndPattern = () => {
    const timeBlocks = [
      { label: "Morning",   start: 6,  end: 12, color: "#f59e0b" },
      { label: "Afternoon", start: 12, end: 17, color: "#f97316" },
      { label: "Evening",   start: 17, end: 21, color: "#6366f1" },
      { label: "Night",     start: 21, end: 6,  color: "#8b5cf6" },
    ];
    const blockStats = timeBlocks.map(b => {
      let taken = 0, total = 0;
      schedules.forEach(s => {
        const t = toDate(s.scheduledTime);
        if (!t || (s as any).status === "upcoming") return;
        const h = t.getHours();
        const inBlock = b.start < b.end
          ? h >= b.start && h < b.end
          : h >= b.start || h < b.end;
        if (inBlock) {
          total++;
          if (s.status === "taken" || s.status === "delayed") taken++;
        }
      });
      return { ...b, taken, total, pct: total > 0 ? Math.round((taken / total) * 100) : null };
    });

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Score ring */}
        <div className="rx-card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 10 }}>
            30-Day Score
          </div>
          <AdherenceRing pct={overallAdherence} size={70} />
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: pctColor(overallAdherence) }}>
            {overallAdherence}%
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: adherenceBadge(overallAdherence).color }}>
            {adherenceBadge(overallAdherence).label}
          </div>
        </div>

        {/* Time-of-day profile */}
        <div className="rx-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 12 }}>
            Time-of-Day
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {blockStats.map(b => (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: "#374151", fontWeight: 500 }}>{b.label}</span>
                  <span style={{ fontWeight: 700, color: b.pct !== null ? b.color : "#9ca3af" }}>
                    {b.pct !== null ? `${b.pct}%` : "—"}
                  </span>
                </div>
                <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                  {b.pct !== null && (
                    <div style={{
                      width: `${b.pct}%`, height: "100%",
                      background: b.color, borderRadius: 3,
                      transition: "width 0.6s",
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ⑦ MONTHLY BAR CHART
  ════════════════════════════════════════════════════════════════════════ */
  const MonthlyBarChart = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const ds = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const rec = adherenceRecords.find(r => r.date === ds);
      return {
        day: d, ds,
        pct: rec?.adherencePercentage ?? null,
        taken: rec?.totalTaken ?? 0,
        scheduled: rec?.totalScheduled ?? 0,
      };
    });

    return (
      <div className="rx-card" style={{ padding: 18, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="rx-section-title">Monthly Adherence</div>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 70, overflowX: "auto", paddingBottom: 4 }}>
          {daily.map(({ day, ds, pct: p, taken, scheduled }) => {
            const h = p !== null ? Math.max(4, (p / 100) * 70) : 4;
            const c = p === null ? "#e5e7eb" : pctColor(p);
            return (
              <div
                key={day}
                title={`${day}: ${p !== null ? `${p}% (${taken}/${scheduled})` : "No data"}`}
                onClick={() => setSelectedDay(ds)}
                style={{
                  flex: 1, minWidth: 7, height: `${h}px`,
                  background: c, borderRadius: "2px 2px 0 0",
                  cursor: "pointer",
                  transition: "height 0.3s",
                  outline: ds === selectedDay ? "2px solid #0f766e" : "none",
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af", marginTop: 4 }}>
          <span>1</span><span>15</span><span>{daysInMonth}</span>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ⑧ SINGLE-DRUG DEEP VIEW
     Full clinical breakdown: stats, 14d bars, 90d line chart, dose log,
     time-of-day profile, missed pattern analysis
  ════════════════════════════════════════════════════════════════════════ */
  const SingleDrugView = () => {
    if (!focusDrug) {
      return (
        <div style={{ padding: 20 }}>
          <div className="rx-section-title" style={{ marginBottom: 12 }}>Select a medication</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeMeds.map(rx => (
              <div
                key={rx.id}
                className="rx-card"
                style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
                onClick={() => setActiveDrugId(rx.id)}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", background: "#0f766e", flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0f766e" }}>{getMedName(rx)}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {getDoseLabel(rx.dose ?? rx.dosage)} · {rx.frequency}
                  </div>
                </div>
                <span style={{ color: "#9ca3af" }}>→</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const rx = focusDrug;
    const rxSched = schedules.filter(s => s.prescriptionId === rx.id);
    const past = rxSched.filter(s => (s as any).status !== "upcoming");
    const taken = past.filter(s => s.status === "taken" || s.status === "delayed").length;
    const missed = past.filter(s => s.status === "missed").length;
    const delayed = past.filter(s => s.status === "delayed").length;
    const total = past.length;
    const pct = total ? Math.round((taken / total) * 100) : 0;

    // Streak calculation
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const p = dayAdherenceForDrug(ds, rx);
      if (p === null) continue;
      if (p >= 80) streak++;
      else break;
    }

    // 90-day per-drug trend
    const trend90 = Array.from({ length: 90 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (89 - i));
      const ds = d.toISOString().split("T")[0];
      return { ds, pct: dayAdherenceForDrug(ds, rx) };
    });

    // Time-of-day for this drug
    const drugTimeBlocks = [
      { label: "Morning",   start: 6,  end: 12, color: "#f59e0b" },
      { label: "Afternoon", start: 12, end: 17, color: "#f97316" },
      { label: "Evening",   start: 17, end: 21, color: "#6366f1" },
      { label: "Night",     start: 21, end: 6,  color: "#8b5cf6" },
    ].map(b => {
      let tak = 0, tot = 0;
      rxSched.forEach(s => {
        const t = toDate(s.scheduledTime);
        if (!t || (s as any).status === "upcoming") return;
        const h = t.getHours();
        const inBlock = b.start < b.end ? h >= b.start && h < b.end : h >= b.start || h < b.end;
        if (inBlock) {
          tot++;
          if (s.status === "taken" || s.status === "delayed") tak++;
        }
      });
      return { ...b, taken: tak, total: tot, pct: tot > 0 ? Math.round((tak / tot) * 100) : null };
    });

    // Weekday pattern
    const weekdayPattern = Array.from({ length: 7 }, (_, dow) => {
      const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow];
      const daySchedules = rxSched.filter(s => {
        const d = toDate(s.scheduledTime);
        return d && d.getDay() === dow && (s as any).status !== "upcoming";
      });
      const t = daySchedules.filter(s => s.status === "taken" || s.status === "delayed").length;
      return { day: dayName, pct: daySchedules.length ? Math.round((t / daySchedules.length) * 100) : null };
    });

    // Average delay (for delayed doses)
    const delayedDoses = rxSched.filter(s => s.status === "delayed");
    const avgDelay = delayedDoses.length ? (() => {
      const total = delayedDoses.reduce((sum, s) => {
        const st = toDate(s.scheduledTime);
        const at = toDate(s.actualTime);
        return st && at ? sum + (at.getTime() - st.getTime()) / 60000 : sum;
      }, 0);
      return Math.round(total / delayedDoses.length);
    })() : 0;

    return (
      <div>
        {/* Back nav */}
        <div style={{ padding: "12px 16px 0" }}>
          <button
            onClick={() => setActiveDrugId(null)}
            style={{
              background: "none", border: "none", color: "#0f766e",
              fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 0",
            }}
          >
            ← All medications
          </button>
        </div>

        {/* Drug identity card */}
        <div style={{ padding: "10px 16px 0" }}>
          <div className="rx-card" style={{
            padding: "16px 18px",
            borderLeft: "4px solid #0f766e",
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0f766e", letterSpacing: "-0.02em" }}>
                  {getMedName(rx)}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {getDoseLabel(rx.dose ?? rx.dosage)} · {rx.route} · {rx.frequency}
                </div>
                {rx.prescribedBy && (
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    Prescribed by {rx.prescribedBy}
                  </div>
                )}
              </div>
              {streak > 0 && (
                <div style={{
                  background: "#fffbeb", border: "1px solid #fbbf24",
                  borderRadius: 12, padding: "6px 12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#d97706" }}>🔥 {streak}</div>
                  <div style={{ fontSize: 9, color: "#d97706", fontWeight: 700 }}>day streak</div>
                </div>
              )}
            </div>

            {/* Scheduled times chips */}
            {rx.scheduledTimes && (
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {rx.scheduledTimes.map(t => (
                  <span key={t} style={{
                    background: "#ecfdf5", color: "#0f766e",
                    borderRadius: 8, padding: "3px 10px",
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Summary stat tiles ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
            {[
              { val: `${pct}%`, lbl: "Adherence", color: pctColor(pct) },
              { val: taken, lbl: "Taken", color: "#059669" },
              { val: missed, lbl: "Missed", color: "#dc2626" },
              { val: delayed, lbl: "Delayed", color: "#d97706" },
            ].map(({ val, lbl, color }) => (
              <div key={lbl} style={{
                background: "#f8fafc", borderRadius: 12, padding: "10px 6px", textAlign: "center",
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color }}>{val}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Additional insight tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              {
                label: "Avg delay (delayed doses)",
                value: avgDelay > 0 ? `${avgDelay} min` : "N/A",
                sub: "when dose is taken late",
              },
              {
                label: "Worst day of week",
                value: (() => {
                  const worst = weekdayPattern
                    .filter(d => d.pct !== null)
                    .sort((a, b) => (a.pct ?? 100) - (b.pct ?? 100))[0];
                  return worst ? worst.day : "—";
                })(),
                sub: "historically lowest adherence",
              },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{
                background: "#f8fafc", borderRadius: 12, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f766e" }}>{value}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* ── 90-Day Trend Line (SVG) ── */}
          <div className="rx-card" style={{ padding: 16, marginBottom: 12 }}>
            <div className="rx-section-title" style={{ marginBottom: 12 }}>90-Day Trend</div>
            <svg viewBox="0 0 560 100" width="100%" height="100" style={{ overflow: "visible" }}>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(v => (
                <g key={v}>
                  <line
                    x1="0" y1={100 - v} x2="560" y2={100 - v}
                    stroke="#f0f0f0" strokeWidth="1"
                  />
                  <text x="0" y={100 - v - 2} fontSize="7" fill="#9ca3af">{v}%</text>
                </g>
              ))}
              {/* Area fill */}
              <defs>
                <linearGradient id="drugGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <polygon
                points={[
                  `0,100`,
                  ...trend90
                    .map(({ pct: p }, i) => {
                      const x = (i / 89) * 560;
                      const y = p !== null ? 100 - p : 100;
                      return `${x},${y}`;
                    }),
                  `560,100`,
                ].join(" ")}
                fill="url(#drugGrad)"
              />
              {/* Line */}
              <polyline
                points={trend90
                  .map(({ pct: p }, i) => {
                    const x = (i / 89) * 560;
                    const y = p !== null ? 100 - p : null;
                    return y !== null ? `${x},${y}` : null;
                  })
                  .filter(Boolean)
                  .join(" ")}
                fill="none"
                stroke="#0f766e"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Month labels */}
              {[0, 30, 60, 89].map(i => {
                const d = new Date();
                d.setDate(d.getDate() - (89 - i));
                return (
                  <text
                    key={i}
                    x={(i / 89) * 560}
                    y="108"
                    fontSize="8"
                    fill="#9ca3af"
                    textAnchor="middle"
                  >
                    {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* ── 14-Day Bar Chart ── */}
          <div className="rx-card" style={{ padding: 16, marginBottom: 12 }}>
            <div className="rx-section-title" style={{ marginBottom: 10 }}>Last 14 Days</div>
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
              {trend90.slice(-14).map(({ ds, pct: p }, i) => {
                const dayD = new Date(ds + "T00:00:00");
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div
                      style={{
                        width: "100%", height: p !== null ? `${Math.max(4, (p / 100) * 68)}px` : "4px",
                        background: p !== null ? pctColor(p) : "#e5e7eb",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.3s",
                        cursor: "pointer",
                        outline: ds === selectedDay ? "2px solid #0f766e" : "none",
                      }}
                      title={`${dayD.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}: ${p !== null ? p + "%" : "no data"}`}
                      onClick={() => setSelectedDay(ds)}
                    />
                    <span style={{ fontSize: 8, color: "#9ca3af" }}>
                      {dayD.toLocaleDateString("en-GB", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Time-of-Day Profile for this drug ── */}
          <div className="rx-card" style={{ padding: 16, marginBottom: 12 }}>
            <div className="rx-section-title" style={{ marginBottom: 12 }}>Time-of-Day Adherence</div>
            {drugTimeBlocks.map(b => (
              <div key={b.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>{b.label}</span>
                  <span style={{ fontWeight: 700, color: b.pct !== null ? b.color : "#9ca3af" }}>
                    {b.pct !== null ? `${b.pct}% (${b.taken}/${b.total})` : "Not scheduled"}
                  </span>
                </div>
                <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                  {b.pct !== null && (
                    <div style={{
                      width: `${b.pct}%`, height: "100%",
                      background: b.color, borderRadius: 4, transition: "width 0.6s",
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Weekday Pattern ── */}
          <div className="rx-card" style={{ padding: 16, marginBottom: 12 }}>
            <div className="rx-section-title" style={{ marginBottom: 10 }}>Weekday Pattern</div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60 }}>
              {weekdayPattern.map(({ day, pct: p }) => (
                <div key={day} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{
                    height: p !== null ? `${Math.max(4, (p / 100) * 52)}px` : "4px",
                    background: p !== null ? pctColor(p) : "#e5e7eb",
                    borderRadius: "3px 3px 0 0",
                    marginBottom: 4,
                  }} title={p !== null ? `${day}: ${p}%` : `${day}: No data`} />
                  <div style={{ fontSize: 9, color: "#6b7280" }}>{day}</div>
                  {p !== null && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: pctColor(p) }}>{p}%</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: "8px 10px", background: "#f8fafc", borderRadius: 8, fontSize: 11, color: "#374151" }}>
              <strong>Pattern insight:</strong>{" "}
              {(() => {
                const sorted = weekdayPattern.filter(d => d.pct !== null).sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0));
                const worst = sorted[0];
                const best = sorted[sorted.length - 1];
                if (!worst || !best) return "Not enough data.";
                if (worst.pct === best.pct) return "Consistent adherence across all days.";
                return `Best on ${best.day} (${best.pct}%), weakest on ${worst.day} (${worst.pct}%). Consider setting an extra reminder for ${worst.day}s.`;
              })()}
            </div>
          </div>

          {/* ── Full Dose History Table ── */}
          <div className="rx-card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="rx-section-title">Full Dose History</div>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Last 30 entries</span>
            </div>
            <div style={{ overflowY: "auto", maxHeight: 260 }}>
              <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                  <tr>
                    {["Date", "Scheduled", "Taken at", "Delay", "Status"].map(h => (
                      <th key={h} style={{
                        padding: "6px 7px", textAlign: "left",
                        fontSize: 10, fontWeight: 700, color: "#6b7280",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        borderBottom: "1px solid #e5e7eb",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rxSched
                    .filter(s => (s as any).status !== "upcoming")
                    .sort((a, b) =>
                      (toDate(b.scheduledTime)?.getTime() ?? 0) -
                      (toDate(a.scheduledTime)?.getTime() ?? 0)
                    )
                    .slice(0, 30)
                    .map(s => {
                      const st = toDate(s.scheduledTime);
                      const at = toDate(s.actualTime);
                      const delMin = at && st ? Math.round((at.getTime() - st.getTime()) / 60000) : null;
                      const meta = statusMeta[s.status] ?? statusMeta.upcoming;
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                          <td style={{ padding: "5px 7px", fontWeight: 500 }}>{fmt(st)}</td>
                          <td style={{ padding: "5px 7px" }}>{fmtTime(st)}</td>
                          <td style={{ padding: "5px 7px" }}>{at ? fmtTime(at) : "—"}</td>
                          <td style={{ padding: "5px 7px", color: delMin && delMin > 0 ? "#d97706" : "#9ca3af" }}>
                            {delMin && delMin > 0 ? `+${delMin}m` : "—"}
                          </td>
                          <td style={{ padding: "5px 7px" }}>
                            <span style={{
                              background: meta.bg, color: meta.color,
                              padding: "2px 7px", borderRadius: 6,
                              fontSize: 10, fontWeight: 700,
                            }}>
                              {meta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ⑨ PATIENT NOTES + DOCTOR FEEDBACK VIEW
     DB: patient_notes collection + side_effect_logs collection
  ════════════════════════════════════════════════════════════════════════ */
  const NotesView = () => {
    const tagMeta = Object.fromEntries(NOTE_TAGS.map(t => [t.label, t]));

    const handleSubmitNote = async () => {
      if (!noteText.trim()) return;
      const newNote = {
        patientId,    // from props
        date: todayStr,
        tag: noteTag,
        text: noteText.trim(),
        status: "pending",
        doctorReply: null,
        createdAt: new Date(),
      };
      // DB WRITE → Firestore
      // await addDoc(collection(db, "patient_notes"), newNote);
      setPatientNotes(prev => [newNote, ...prev]);
      setNoteText("");
    };

    const handleSaveSideEffects = async () => {
      const log = {
        patientId: "self",
        date: todayStr,
        ratings: { ...symptomRatings },
        createdAt: new Date(),
      };
      // DB WRITE → Firestore
      // await setDoc(doc(db, "side_effect_logs", `self_${todayStr}`), log);
      alert("Side effect report saved.");
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Compose new note ── */}
        <div className="rx-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>
            Message your doctor
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
            Notes are added to your record and flagged for review.
          </div>

          {/* Tag selector */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Category
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {NOTE_TAGS.map(t => (
              <button
                key={t.label}
                onClick={() => setNoteTag(t.label)}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${noteTag === t.label ? t.color : "#e5e7eb"}`,
                  background: noteTag === t.label ? t.bg : "#fff",
                  color: noteTag === t.label ? t.color : "#6b7280",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Note text */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your note
          </div>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value.slice(0, 600))}
            placeholder="Describe what you're experiencing, any concerns, or questions for your doctor..."
            style={{
              width: "100%", minHeight: 90, maxHeight: 160,
              border: "1.5px solid #e5e7eb", borderRadius: 12,
              padding: "10px 12px", fontSize: 13,
              fontFamily: "inherit", resize: "vertical",
              outline: "none", color: "#111827",
              boxSizing: "border-box",
            }}
            onFocus={e => (e.target.style.borderColor = "#0f766e")}
            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: noteText.length > 550 ? "#dc2626" : "#9ca3af" }}>
              {noteText.length} / 600
            </span>
            <button
              onClick={handleSubmitNote}
              disabled={!noteText.trim()}
              style={{
                background: noteText.trim() ? "#0f766e" : "#e5e7eb",
                color: noteText.trim() ? "#fff" : "#9ca3af",
                border: "none", borderRadius: 10,
                padding: "9px 20px", fontSize: 13, fontWeight: 700,
                cursor: noteText.trim() ? "pointer" : "default",
                transition: "all 0.15s",
              }}
            >
              Send to doctor →
            </button>
          </div>
        </div>

        {/* ── Previous notes ── */}
        {patientNotes.length > 0 && (
          <div>
            <div className="rx-section-title" style={{ marginBottom: 10 }}>Previous notes</div>
            {patientNotes.map((note, idx) => {
              const meta = tagMeta[note.tag] ?? { color: "#6b7280", bg: "#f9fafb" };
              const d = new Date((note.date ?? todayStr) + "T00:00:00");
              return (
                <div
                  key={note.id ?? idx}
                  className="rx-card"
                  style={{ padding: 16, marginBottom: 10 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <span style={{
                        background: meta.bg, color: meta.color,
                        padding: "3px 10px", borderRadius: 10,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {note.tag}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        {d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, marginTop: 2,
                        color: note.status === "reviewed" ? "#059669" : "#d97706",
                      }}>
                        {note.status === "reviewed" ? "✓ Reviewed" : "⧗ Pending review"}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: "#111827", lineHeight: 1.55, marginBottom: note.doctorReply ? 10 : 0 }}>
                    {note.text}
                  </div>

                  {/* Doctor reply */}
                  {note.doctorReply && (
                    <div style={{
                      background: "#f0fdf4",
                      border: "1px solid #6ee7b7",
                      borderRadius: 10, padding: "10px 12px",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0f766e", marginBottom: 4 }}>
                        Dr. reply:
                      </div>
                      <div style={{ fontSize: 12, color: "#065f46", lineHeight: 1.5 }}>
                        {note.doctorReply}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Side Effect Daily Log ── */}
        <div>
          <div className="rx-section-title" style={{ marginBottom: 4 }}>Today's symptom report</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
            Rate how you're feeling today. This builds your symptom history for the doctor.
          </div>
          <div className="rx-card" style={{ padding: 16 }}>
            {SIDE_EFFECTS.map(se => {
              const val = symptomRatings[se.id] ?? 0;
              return (
                <div key={se.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{se.label}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 10px",
                      borderRadius: 8,
                      background: val === 0 ? "#f3f4f6" : val === 1 ? "#fffbeb" : val === 2 ? "#fff7ed" : "#fef2f2",
                      color: val === 0 ? "#6b7280" : val === 1 ? "#d97706" : val === 2 ? "#ea580c" : "#dc2626",
                    }}>
                      {SEVERITY[val]}
                    </span>
                  </div>
                  {/* Severity button group */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {SEVERITY.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => setSymptomRatings(prev => ({ ...prev, [se.id]: i }))}
                        style={{
                          flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 600,
                          borderRadius: 8, border: "1.5px solid",
                          borderColor: val === i
                            ? (i === 0 ? "#6b7280" : i === 1 ? "#d97706" : i === 2 ? "#ea580c" : "#dc2626")
                            : "#e5e7eb",
                          background: val === i
                            ? (i === 0 ? "#f3f4f6" : i === 1 ? "#fffbeb" : i === 2 ? "#fff7ed" : "#fef2f2")
                            : "#fff",
                          color: val === i
                            ? (i === 0 ? "#374151" : i === 1 ? "#d97706" : i === 2 ? "#ea580c" : "#dc2626")
                            : "#9ca3af",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Any other concern */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Anything else to report?
            </div>
            <textarea
              placeholder="Any other symptoms, concerns, or observations..."
              style={{
                width: "100%", minHeight: 60, border: "1.5px solid #e5e7eb",
                borderRadius: 10, padding: "8px 10px", fontSize: 12,
                fontFamily: "inherit", resize: "vertical",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#0f766e")}
              onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
            />

            <button
              onClick={handleSaveSideEffects}
              style={{
                marginTop: 12, width: "100%", padding: "11px",
                background: "#0f766e", color: "#fff",
                border: "none", borderRadius: 12,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Save today's symptom report
            </button>

            <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
              Reports are reviewed by your care team and stored securely.
            </div>
          </div>
        </div>

      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ROOT RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Always-visible hero */}
      <HeroCard />

      {/* Sub-tab bar */}
      <SubTabBar />

      {/* ── TIMELINE VIEW ── */}
      {adherenceSubTab === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <DayStrip />
          <DayExpandPanel />
          <MedOverviewCards />
          <MonthlyHeatStrip />
          <ScoreAndPattern />
          <MonthlyBarChart />
        </div>
      )}

      {/* ── DRUG DETAIL VIEW ── */}
      {adherenceSubTab === "drug" && <SingleDrugView />}

      {/* ── NOTES VIEW ── */}
      {adherenceSubTab === "notes" && <NotesView />}

    </div>
  );

})()}       {/* ── PHARMACY TAB ── */}
          {activeTab === "pharmacy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                className="rx-card"
                style={{
                  padding: 20,
                  background: "linear-gradient(135deg,#ecfdf5,#f0fdf9)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#047857",
                        marginBottom: 6,
                      }}
                    >
                      Current Prescription
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#065f46" }}>
                      {patientName}
                    </div>
                    <div style={{ fontSize: 12, color: "#047857" }}>
                      {activeMeds.length} Active Medication{activeMeds.length !== 1 ? "s" : ""} ·{" "}
                      {todayDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="rx-btn rx-btn-primary"
                      onClick={() => {
                        // Use encounter-filtered list if provided, otherwise all active
                        const medsToExport = encounterId
                          ? activeMeds.filter((m) => m.encounterId === encounterId)
                          : activeMeds;
                        const firstRx = medsToExport[0];
                        generatePrescriptionPDF(
                          medsToExport,
                          { name: patientName, age: patientAge, sex: patientSex },
                          { name: firstRx?.doctorName || "Dr. Unknown", license: doctorLicense, clinicName: hospitalName },
                          markedOwned
                        );
                        showNotif("✓ Prescription PDF generated!", "success");
                      }}
                    >
                      📄 Download Prescription
                    </button>
                    <button className="rx-btn rx-btn-ghost" onClick={() => window.print()}>
                      🖨 Print
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(encounterId
                    ? activeMeds.filter((m) => m.encounterId === encounterId)
                    : activeMeds
                  ).map((rx) => {
                    const isOwned =
                      markedOwned[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;
                    return (
                      <div
                        key={rx.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#fff",
                          borderRadius: 10,
                          padding: "10px 14px",
                          border: `1.5px solid ${isOwned ? "#a7f3d0" : "#fed7aa"}`,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                            {getMedName(rx)} {getDoseLabel(rx.dose || rx.dosage)}
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>
                            {rx.frequency} · {rx.route}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {rx.refills !== undefined && (
                            <span
                              className="rx-badge"
                              style={{ background: "#f0f9ff", color: "#0369a1", fontSize: 10 }}
                            >
                              {rx.refills} refills
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleOwned(rx, !isOwned)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              background: isOwned ? "#d1fae5" : "#fff7ed",
                              color: isOwned ? "#065f46" : "#92400e",
                              border: `1px solid ${isOwned ? "#6ee7b7" : "#fed7aa"}`,
                            }}
                          >
                            {isOwned ? "✓ Have it" : "Need to buy"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "16px 18px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                    Prescription Sheet
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    As it will appear on the downloadable PDF
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#0f766e" }}>
                        {[
                          "#",
                          "Medication",
                          "Dose",
                          "Route",
                          "Frequency",
                          "Duration",
                          "Instructions",
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 12px",
                              color: "#fff",
                              fontWeight: 700,
                              textAlign: "left",
                              whiteSpace: "nowrap",
                              fontSize: 11,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(encounterId
                        ? activeMeds.filter((m) => m.encounterId === encounterId)
                        : activeMeds
                      ).map((rx, i) => {
                        const isOwned =
                          markedOwned[rx.id] ?? rx.possessionStatus?.hasMedication ?? false;
                        return (
                          <tr
                            key={rx.id}
                            style={{
                              background: i % 2 === 0 ? "#fff" : "#f9fffe",
                              borderBottom: "1px solid #e5e7eb",
                            }}
                          >
                            <td
                              style={{
                                padding: "10px 12px",
                                color: "#6b7280",
                                fontWeight: 700,
                              }}
                            >
                              {i + 1}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <div style={{ fontWeight: 800, color: "#0f766e" }}>
                                {getMedName(rx)}
                              </div>
                              {rx.genericName && rx.genericName !== getMedName(rx) && (
                                <div style={{ fontSize: 11, color: "#6b7280" }}>
                                  ({rx.genericName})
                                </div>
                              )}
                              <div style={{ fontSize: 10, color: "#9ca3af" }}>
                                {rx.indication}
                              </div>
                            </td>
                            <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                              {getDoseLabel(rx.dose || rx.dosage)}
                            </td>
                            <td style={{ padding: "10px 12px", color: "#374151" }}>
                              {rx.route}
                            </td>
                            <td style={{ padding: "10px 12px", color: "#374151" }}>
                              {rx.frequency}
                            </td>
                            <td style={{ padding: "10px 12px", color: "#374151" }}>
                              {rx.duration ? `${rx.duration}d` : "Ongoing"}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                color: "#374151",
                                maxWidth: 120,
                              }}
                            >
                              {rx.instructions || "—"}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 999,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: isOwned ? "#d1fae5" : "#fef3c7",
                                  color: isOwned ? "#065f46" : "#92400e",
                                }}
                              >
                                {isOwned ? "✓ Have" : "Buy"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    padding: "14px 18px",
                    background: "#f8fafc",
                    borderTop: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Prescribing Physician:{" "}
                    <strong>{activeMeds[0]?.doctorName || "—"}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Date:{" "}
                    <strong>
                      {todayDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="rx-card" style={{ padding: 20 }}>
                <div className="rx-section-title" style={{ marginBottom: 14 }}>
                  Refill Tracker
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeMeds.map((rx) => {
                    const refills =
                      rx.refills ?? rx.refillInfo?.remainingRefills ?? 0;
                    return (
                      <div
                        key={rx.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "#fafafa",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800 }}>
                            {getMedName(rx)}
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>
                            {getDoseLabel(rx.dose || rx.dosage)} · {rx.frequency}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            className="rx-badge"
                            style={{
                              background:
                                refills > 2
                                  ? "#d1fae5"
                                  : refills > 0
                                  ? "#fef3c7"
                                  : "#fee2e2",
                              color:
                                refills > 2
                                  ? "#065f46"
                                  : refills > 0
                                  ? "#92400e"
                                  : "#7f1d1d",
                            }}
                          >
                            {refills} refill{refills !== 1 ? "s" : ""} left
                          </span>
                          {refills <= 1 && (
                            <button
                              className="rx-btn rx-btn-ghost"
                              style={{ padding: "5px 12px", fontSize: 11 }}
                              onClick={async () => {
                                await addDoc(collection(db, "pharmacyOrders"), {
                                  patientId,
                                  prescriptionIds: [rx.id],
                                  issuedAt: serverTimestamp(),
                                  doctorId: rx.doctorId,
                                  doctorName: rx.doctorName,
                                  status: "refill_requested",
                                });
                                showNotif(
                                  `Refill requested for ${getMedName(rx)}`,
                                  "success"
                                );
                              }}
                            >
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