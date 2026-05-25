"use client";

// ─────────────────────────────────────────────────────────────────────────────
// HTNPanel.tsx  —  HTN Doctor Control Center  (FIXED & PRODUCTION-READY)
// Full chronic disease intelligence cockpit for AMEXAN / MedZon
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg: "#0a0a12",
  bgCard: "#0f0f1c",
  bgSub: "#13131f",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.13)",
  text: "#e8e8f0",
  textSub: "#9090b0",
  textMuted: "#55557a",
  sys: "#f87171",
  dia: "#60a5fa",
  pulse: "#a78bfa",
  map: "#34d399",
  optimal: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", text: "#34d399" },
  elevated: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)", text: "#fbbf24" },
  stage1: { bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)", text: "#fb923c" },
  stage2: { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", text: "#f87171" },
  crisis: { bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.4)", text: "#fca5a5" },
  medColors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"],
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  recordedAt: Date;
  doctorNote?: string;
  arm?: string;
  position?: string;
  triageLabel?: string;
  triageUrgency?: string;
}

interface Medication {
  id: string;
  drug: string;
  dose: string;
  doseValue: number;
  doseUnit: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  active: boolean;
  indication?: string;
  drugClass?: string;
  previousDose?: string;
  notes?: string;
}

interface MedEvent {
  id: string;
  medicationId: string;
  eventType: "started" | "increased" | "decreased" | "stopped" | "replaced" | "added";
  drug: string;
  dose: string;
  previousDose?: string;
  date: Date;
  reason?: string;
}

interface AdherenceLog {
  id: string;
  medicationId: string;
  drug: string;
  date: Date;
  taken: boolean;
  note?: string;
}

interface Alert {
  id: string;
  severity: "urgent" | "warning" | "info";
  category: string;
  message: string;
  action: string;
  triggerType?: string;
  triggerValue?: number;
  notifyPatient: boolean;
  date: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedNote?: string;
}

interface ClinicalNote {
  id: string;
  type: string;
  date: Date;
  chiefComplaint: string;
  hpi?: string;
  examination?: string;
  investigations?: string;
  assessment?: string;
  plan?: string;
  doctorId?: string;
  biodata?: string;
}

interface LabResult {
  id: string;
  test: string;
  date: Date;
  result?: string;
  status: "normal" | "abnormal" | "borderline" | "pending";
  flag?: string;
  ordered: boolean;
  priority?: string;
  indication?: string;
}

interface ImagingResult {
  id: string;
  modality: string;
  date: Date;
  findings?: string;
  status: "normal" | "abnormal" | "pending";
  ordered: boolean;
}

interface Complication {
  id: string;
  name: string;
  present: boolean;
  diagnosedDate?: Date;
  notes?: string;
  severity?: string;
}

interface TimelineEvent {
  id: string;
  date: Date;
  type: "bp" | "med" | "adherence" | "alert" | "lab" | "note" | "referral" | "education" | "complication" | "imaging";
  title: string;
  description?: string;
  severity?: "green" | "amber" | "red" | "blue" | "purple";
  linkedId?: string;
}

interface PatientSummary {
  id: string;
  name: string;
  universalId?: string;
  latestSystolic?: number;
  latestDiastolic?: number;
  latestAt?: Date;
  totalReadings: number;
}

interface Message {
  id: string;
  direction: "in" | "out";
  text: string;
  sentAt: Date;
  read?: boolean;
}

interface Referral {
  id: string;
  specialty: string;
  reason: string;
  priority: "routine" | "urgent" | "emergency";
  date: Date;
  status: string;
  notes?: string;
}

interface PatientInfo {
  id: string;
  name: string;
  age?: number;
  sex?: string;
  dob?: Date;
  primaryDx?: string;
  riskCategory?: string;
  followUpInterval?: string;
  lastVisit?: Date;
  nextReview?: Date;
  primaryDoctorId?: string;
  bmi?: number;
  smoker?: boolean;
  diabetic?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classifyBP(sys: number, dia: number) {
  if (sys >= 180 || dia >= 120) return { label: "Hypertensive Crisis", ...T.crisis, key: "crisis" };
  if (sys >= 140 || dia >= 90)  return { label: "Stage 2 HTN",         ...T.stage2, key: "stage2" };
  if (sys >= 130 || dia >= 80)  return { label: "Stage 1 HTN",         ...T.stage1, key: "stage1" };
  if (sys >= 120)                return { label: "Elevated",            ...T.elevated, key: "elevated" };
  return                                { label: "Normal / Optimal",    ...T.optimal, key: "optimal" };
}

function getMedColor(idx: number) { return T.medColors[idx % T.medColors.length]; }

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateShort(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function toDate(val: any): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date)     return val;
  return new Date(val);
}

async function addTimelineEvent(patientId: string, event: Omit<TimelineEvent, "id">) {
  try {
    await addDoc(collection(db, "timeline_events"), {
      patientId, ...event,
      date: Timestamp.fromDate(event.date),
      createdAt: serverTimestamp(),
    });
  } catch (e) { console.error("Timeline event error:", e); }
}

// ─── Shared Style Map ─────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  card: {
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: "18px 20px",
    marginBottom: 12,
  },
  inlineForm: {
    background: T.bgSub,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: "16px 18px",
    marginTop: 12,
  },
  label: {
    color: T.textMuted, fontSize: 10, fontWeight: 700,
    textTransform: "uppercase" as const, letterSpacing: "0.1em",
    marginBottom: 12, display: "block",
  },
  input: {
    background: T.bgSub, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "8px 11px",
    color: T.text, fontSize: 13, fontFamily: "inherit",
    width: "100%", outline: "none", boxSizing: "border-box" as const,
  },
  select: {
    background: T.bgSub, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "7px 10px",
    color: T.text, fontSize: 13, fontFamily: "inherit",
    cursor: "pointer", outline: "none", width: "100%",
  },
  btn: {
    padding: "8px 16px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: "transparent",
    color: T.text, fontSize: 12, fontFamily: "inherit",
    cursor: "pointer", fontWeight: 600,
  },
  btnPrimary: {
    padding: "8px 16px", borderRadius: 8,
    border: "1px solid rgba(248,113,113,0.4)",
    background: "rgba(248,113,113,0.12)",
    color: "#f87171", fontSize: 12, fontFamily: "inherit",
    cursor: "pointer", fontWeight: 700,
  },
  btnSuccess: {
    padding: "8px 16px", borderRadius: 8,
    border: "1px solid rgba(52,211,153,0.4)",
    background: "rgba(52,211,153,0.1)",
    color: "#34d399", fontSize: 12, fontFamily: "inherit",
    cursor: "pointer", fontWeight: 700,
  },
  btnInfo: {
    padding: "8px 16px", borderRadius: 8,
    border: "1px solid rgba(96,165,250,0.4)",
    background: "rgba(96,165,250,0.1)",
    color: "#60a5fa", fontSize: 12, fontFamily: "inherit",
    cursor: "pointer", fontWeight: 700,
  },
  btnAmber: {
    padding: "8px 16px", borderRadius: 8,
    border: "1px solid rgba(251,191,36,0.35)",
    background: "rgba(251,191,36,0.09)",
    color: "#fbbf24", fontSize: 12, fontFamily: "inherit",
    cursor: "pointer", fontWeight: 700,
  },
};

// ─── Atomic Components ────────────────────────────────────────────────────────

function Badge({ children, color = "#60a5fa" }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 9px", borderRadius: 20,
      background: `${color}18`, border: `1px solid ${color}44`,
      color, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
      whiteSpace: "nowrap" as const,
    }}>{children}</span>
  );
}

function StatCard({ label, value, sub, color = T.text, size = 22 }: {
  label: string; value: string; sub?: string; color?: string; size?: number;
}) {
  return (
    <div style={{
      background: T.bgSub, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "14px 16px", flex: 1, minWidth: 110,
    }}>
      <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ color, fontSize: size, fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>{value}</div>
      {sub && <div style={{ color: T.textSub, fontSize: 10 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children, color = "#60a5fa" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
      color: T.textMuted, fontSize: 10, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.1em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      {children}
    </div>
  );
}

function AlertBanner({ alerts }: { alerts: Alert[] }) {
  const urgent = alerts.filter(a => !a.resolved && a.severity === "urgent");
  if (!urgent.length) return null;
  return (
    <div style={{
      background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)",
      borderRadius: 12, padding: "12px 16px", marginBottom: 14,
      display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
    }}>
      <span style={{ color: "#f87171", fontSize: 16 }}>⚠</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#f87171", fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
          {urgent.length} urgent alert{urgent.length > 1 ? "s" : ""} require attention
        </div>
        <div style={{ color: T.textSub, fontSize: 11 }}>{urgent[0].message}</div>
      </div>
    </div>
  );
}

// ─── Patient Selector Strip ───────────────────────────────────────────────────

function PatientSelectorStrip({
  patients, selectedId, onSelect, loading,
}: {
  patients: PatientSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div style={{
        background: T.bgCard, borderBottom: `1px solid ${T.border}`,
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ color: T.textMuted, fontSize: 12 }}>Loading patients...</span>
      </div>
    );
  }

  return (
    <div style={{
      background: T.bgCard, borderBottom: `1px solid ${T.border}`,
      padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
    }}>
      <span style={{ color: T.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
        👥 Patient
      </span>
      <select
        value={selectedId ?? ""}
        onChange={e => onSelect(e.target.value)}
        style={{ ...S.select, maxWidth: 380, width: "auto", flex: 1 }}
      >
        <option value="">— Select a patient —</option>
        {patients.map(p => {
          const bp = p.latestSystolic && p.latestDiastolic ? ` · ${p.latestSystolic}/${p.latestDiastolic}` : "";
          const cls = p.latestSystolic && p.latestDiastolic ? classifyBP(p.latestSystolic, p.latestDiastolic).label : "";
          return (
            <option key={p.id} value={p.id}>
              {p.name}{bp}{cls ? ` (${cls})` : ""} · {p.totalReadings} readings
            </option>
          );
        })}
      </select>
      {patients.length > 0 && (
        <span style={{ color: T.textMuted, fontSize: 11 }}>{patients.length} patients with BP data</span>
      )}
    </div>
  );
}

// ─── BP Trend Engine ──────────────────────────────────────────────────────────

function BPTrendEngine({ readings, medEvents }: {
  readings: BPReading[];
  medEvents: MedEvent[];
}) {
  const [range, setRange] = useState<"30d" | "90d" | "6m" | "all">("90d");

  const filteredReadings = (() => {
    if (range === "all") return readings;
    const days = range === "30d" ? 30 : range === "90d" ? 90 : 180;
    const cutoff = new Date(Date.now() - days * 86_400_000);
    return readings.filter(r => r.recordedAt >= cutoff);
  })();

  const chartData = filteredReadings.map(r => ({
    date: fmtDateShort(r.recordedAt),
    systolic: r.systolic,
    diastolic: r.diastolic,
    pulse: r.pulse,
    map: Math.round(r.diastolic + (r.systolic - r.diastolic) / 3),
  }));

  const medLines = (() => {
    if (filteredReadings.length < 2) return [];
    const first = filteredReadings[0].recordedAt;
    const last  = filteredReadings[filteredReadings.length - 1].recordedAt;
    return medEvents
      .filter(e => e.date >= first && e.date <= last)
      .map((e, i) => ({
        ...e,
        xLabel: fmtDateShort(e.date),
        color:  getMedColor(i),
        symbol: e.eventType === "stopped" ? "■" : e.eventType === "increased" ? "▲" : "●",
      }));
  })();

  const ranges = [
    { id: "30d", label: "30D" }, { id: "90d", label: "90D" },
    { id: "6m",  label: "6M"  }, { id: "all", label: "ALL" },
  ] as const;

  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <SectionLabel color="#f87171">Clinical Trend Engine</SectionLabel>
        <div style={{ display: "flex", gap: 3, background: T.bgSub, borderRadius: 8, padding: 3, border: `1px solid ${T.border}` }}>
          {ranges.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)} style={{
              ...S.btn, padding: "4px 11px",
              background: range === r.id ? "rgba(248,113,113,0.15)" : "transparent",
              color: range === r.id ? "#f87171" : T.textSub,
              border: "none",
            }}>{r.label}</button>
          ))}
        </div>
      </div>

      {medLines.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          {medLines.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: m.color, fontSize: 10, fontWeight: 700 }}>{m.symbol}</span>
              <span style={{ color: T.textSub, fontSize: 10 }}>
                {m.drug} {m.dose} {m.eventType === "stopped" ? "STOPPED" : m.eventType === "increased" ? "↑" : "started"}
              </span>
            </div>
          ))}
        </div>
      )}

      {chartData.length === 0 ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 13 }}>
          No BP readings in this range.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 80, left: -5, bottom: 0 }}>
            <defs>
              <linearGradient id="sysGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#f87171" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ReferenceArea y1={55}  y2={120} fill="#059669" fillOpacity={0.04} />
            <ReferenceArea y1={120} y2={130} fill="#d97706" fillOpacity={0.05} />
            <ReferenceArea y1={130} y2={140} fill="#ea580c" fillOpacity={0.05} />
            <ReferenceArea y1={140} y2={180} fill="#dc2626" fillOpacity={0.04} />
            <ReferenceArea y1={180} y2={215} fill="#7f1d1d" fillOpacity={0.07} />
            {[
              { y: 180, c: "#7f1d1d60", l: "Crisis" },
              { y: 140, c: "#f8717160", l: "Stage 2 · 140" },
              { y: 130, c: "#fb923c60", l: "Stage 1 · 130" },
              { y: 120, c: "#fbbf2460", l: "Elevated · 120" },
            ].map(({ y, c, l }) => (
              <ReferenceLine key={y} y={y} stroke={c} strokeDasharray="5 3" strokeWidth={1}
                label={{ value: l, fill: c, fontSize: 9, position: "insideRight" }}
              />
            ))}
            {medLines.map(m => (
              <ReferenceLine key={`ml-${m.id}`} x={m.xLabel}
                stroke={m.color} strokeWidth={1.5} strokeDasharray="4 2"
                label={{ value: `${m.symbol} ${m.drug.split(" ")[0]}`, fill: m.color, fontSize: 9, position: "insideTopLeft", angle: -25 }}
              />
            ))}
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={{ stroke: T.border }} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[55, 215]} ticks={[60, 80, 100, 120, 130, 140, 160, 180, 200]} tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0f0f1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: T.text, fontSize: 12 }} labelStyle={{ color: T.textSub, marginBottom: 6 }} />
            <Area type="monotone" dataKey="systolic" fill="url(#sysGrad)" stroke="none" />
            <Line type="monotone" dataKey="pulse"    stroke={T.pulse} strokeWidth={1.5} strokeDasharray="3 2" dot={false} opacity={0.7} />
            <Line type="monotone" dataKey="map"      stroke={T.map}   strokeWidth={1}   strokeDasharray="1 3" dot={false} opacity={0.5} />
            <Line type="monotone" dataKey="diastolic" stroke={T.dia}  strokeWidth={2.5}
              dot={{ r: 4, fill: T.dia, stroke: T.bg, strokeWidth: 1.5 }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="systolic"  stroke={T.sys}  strokeWidth={3}
              dot={{ r: 5, fill: T.sys, stroke: T.bg, strokeWidth: 2 }} activeDot={{ r: 10 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
        {[
          { c: T.sys,   l: "Systolic",  dash: false },
          { c: T.dia,   l: "Diastolic", dash: false },
          { c: T.pulse, l: "Pulse",     dash: true  },
          { c: T.map,   l: "MAP",       dash: true  },
        ].map(({ c, l, dash }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 16, height: 2.5, borderRadius: 2, background: dash ? "transparent" : c, borderTop: dash ? `2px dashed ${c}` : undefined, flexShrink: 0 }} />
            <span style={{ color: T.textMuted, fontSize: 10 }}>{l}</span>
          </div>
        ))}
        <span style={{ color: T.textMuted, fontSize: 10 }}>· Vertical lines = medication events</span>
      </div>
    </div>
  );
}

// ─── Medications Panel ────────────────────────────────────────────────────────

function MedicationsPanel({ patientId, medications, medEvents, onUpdate }: {
  patientId: string;
  medications: Medication[];
  medEvents: MedEvent[];
  onUpdate: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionForms, setActionForms] = useState<Record<string, { type: string; newDose: string; reason: string; show: boolean }>>({});
  const [form, setForm] = useState({
    drug: "", dose: "", doseUnit: "mg", frequency: "Once daily",
    indication: "", drugClass: "", notes: "", startDate: "",
  });

  const toggleActionForm = (medId: string, type: string) => {
    setActionForms(prev => ({
      ...prev,
      [medId]: {
        type, newDose: "", reason: "",
        show: prev[medId]?.show && prev[medId]?.type === type ? !prev[medId].show : true,
      },
    }));
  };

  const saveMed = async () => {
    if (!form.drug || !form.dose) return;
    const startDate = form.startDate ? new Date(form.startDate) : new Date();
    try {
      const ref = await addDoc(collection(db, "prescriptions"), {
        patientId, drug: form.drug,
        dose: `${form.dose}${form.doseUnit}`,
        doseValue: parseFloat(form.dose), doseUnit: form.doseUnit,
        frequency: form.frequency, indication: form.indication,
        drugClass: form.drugClass, notes: form.notes,
        startDate: Timestamp.fromDate(startDate),
        active: true, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "medication_events"), {
        patientId, medicationId: ref.id, eventType: "started",
        drug: form.drug, dose: `${form.dose}${form.doseUnit}`,
        date: Timestamp.fromDate(startDate), reason: form.indication,
        createdAt: serverTimestamp(),
      });
      await addTimelineEvent(patientId, {
        date: startDate, type: "med",
        title: `${form.drug} ${form.dose}${form.doseUnit} started`,
        description: form.indication || "New prescription", severity: "blue",
      });
      setShowAddForm(false);
      setForm({ drug: "", dose: "", doseUnit: "mg", frequency: "Once daily", indication: "", drugClass: "", notes: "", startDate: "" });
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const handleMedAction = async (med: Medication, actionType: string, newDose: string, reason: string) => {
    const now = new Date();
    try {
      if (actionType === "stop" || actionType === "replace") {
        await updateDoc(doc(db, "prescriptions", med.id), { active: false, endDate: Timestamp.fromDate(now) });
      }
      if (actionType === "increase" || actionType === "decrease") {
        await updateDoc(doc(db, "prescriptions", med.id), { dose: newDose, previousDose: med.dose });
      }
      await addDoc(collection(db, "medication_events"), {
        patientId, medicationId: med.id,
        eventType: actionType === "stop" ? "stopped" : actionType === "increase" ? "increased" : actionType === "decrease" ? "decreased" : "replaced",
        drug: med.drug, dose: newDose || med.dose, previousDose: med.dose,
        date: Timestamp.fromDate(now), reason, createdAt: serverTimestamp(),
      });
      await addTimelineEvent(patientId, {
        date: now, type: "med",
        title: `${med.drug} — ${actionType === "stop" ? "stopped" : actionType === "increase" ? `dose ↑ to ${newDose}` : actionType === "decrease" ? `dose ↓ to ${newDose}` : "replaced"}`,
        description: reason,
        severity: actionType === "stop" ? "red" : actionType === "increase" ? "amber" : "green",
      });
      setActionForms({});
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const activeMeds  = medications.filter(m => m.active);
  const stoppedMeds = medications.filter(m => !m.active);

  const DRUG_CLASSES = ["ACE Inhibitor","ARB","CCB","Thiazide Diuretic","Beta Blocker","Alpha Blocker","MRA","Loop Diuretic","Vasodilator","Centrally Acting","Other"];
  const FREQUENCIES  = ["Once daily","Twice daily","Three times daily","Four times daily","Every other day","As needed","At night","Morning","With food"];
  const COMMON_DRUGS = [
    { name: "Amlodipine",          class: "CCB" },
    { name: "Losartan",            class: "ARB" },
    { name: "Ramipril",            class: "ACE Inhibitor" },
    { name: "Hydrochlorothiazide", class: "Thiazide Diuretic" },
    { name: "Atenolol",            class: "Beta Blocker" },
    { name: "Lisinopril",          class: "ACE Inhibitor" },
    { name: "Nifedipine",          class: "CCB" },
    { name: "Furosemide",          class: "Loop Diuretic" },
    { name: "Spironolactone",      class: "MRA" },
    { name: "Metoprolol",          class: "Beta Blocker" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionLabel color="#a78bfa">Active Medications ({activeMeds.length})</SectionLabel>
        <button style={S.btnSuccess} onClick={() => setShowAddForm(v => !v)}>+ Add medication</button>
      </div>

      {showAddForm && (
        <div style={S.inlineForm}>
          <span style={S.label}>New prescription</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {COMMON_DRUGS.map(d => (
              <button key={d.name} style={{ ...S.btn, padding: "4px 10px", fontSize: 11 }}
                onClick={() => setForm(f => ({ ...f, drug: d.name, drugClass: d.class }))}>
                {d.name}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Drug name</label>
              <input style={S.input} value={form.drug} onChange={e => setForm(f => ({ ...f, drug: e.target.value }))} placeholder="e.g. Amlodipine" />
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Drug class</label>
              <select style={S.select} value={form.drugClass} onChange={e => setForm(f => ({ ...f, drugClass: e.target.value }))}>
                <option value="">Select class</option>
                {DRUG_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Dose</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input style={{ ...S.input, flex: 1 }} value={form.dose}
                  onChange={e => setForm(f => ({ ...f, dose: e.target.value }))}
                  placeholder="e.g. 5" type="number" min="0" />
                <select style={{ ...S.select, width: 70 }} value={form.doseUnit}
                  onChange={e => setForm(f => ({ ...f, doseUnit: e.target.value }))}>
                  <option>mg</option><option>mcg</option><option>g</option><option>ml</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Frequency</label>
              <select style={S.select} value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                {FREQUENCIES.map(fr => <option key={fr}>{fr}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Start date</label>
              <input style={S.input} type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Indication</label>
              <input style={S.input} value={form.indication} onChange={e => setForm(f => ({ ...f, indication: e.target.value }))} placeholder="e.g. Essential HTN" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Notes (optional)</label>
              <input style={S.input} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Monitoring, counselling points…" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btnSuccess} onClick={saveMed}>Save prescription</button>
            <button style={S.btn} onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {activeMeds.map((med, idx) => {
        const color = getMedColor(idx);
        const af = actionForms[med.id];
        return (
          <div key={med.id} style={{
            background: T.bgSub, border: `1px solid ${color}30`,
            borderLeft: `3px solid ${color}`, borderRadius: 12,
            padding: "16px 18px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ color, fontWeight: 800, fontSize: 15 }}>{med.drug}</span>
                  {med.drugClass && <Badge color={color}>{med.drugClass}</Badge>}
                  <Badge color="#34d399">ACTIVE</Badge>
                  {med.previousDose && <span style={{ color: T.textMuted, fontSize: 10 }}>↑ from {med.previousDose}</span>}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: 12 }}>{med.dose}</span>
                  <span style={{ color: T.textSub, fontSize: 12 }}>{med.frequency}</span>
                  {med.indication && <span style={{ color: T.textMuted, fontSize: 11 }}>For: {med.indication}</span>}
                  <span style={{ color: T.textMuted, fontSize: 11 }}>Started: {fmtDate(med.startDate)}</span>
                </div>
                {med.notes && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 4 }}>{med.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button style={{ ...S.btnSuccess, padding: "5px 11px", fontSize: 11 }} onClick={() => toggleActionForm(med.id, "increase")}>↑ Increase</button>
                <button style={{ ...S.btnAmber,   padding: "5px 11px", fontSize: 11 }} onClick={() => toggleActionForm(med.id, "decrease")}>↓ Decrease</button>
                <button style={{ ...S.btn,        padding: "5px 11px", fontSize: 11 }} onClick={() => toggleActionForm(med.id, "replace")}>Replace</button>
                <button style={{ ...S.btnPrimary, padding: "5px 11px", fontSize: 11 }} onClick={() => toggleActionForm(med.id, "stop")}>Stop</button>
              </div>
            </div>

            {af?.show && (
              <div style={{ marginTop: 12, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <span style={{ color: T.textSub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {af.type === "increase" ? "Increase dose" : af.type === "decrease" ? "Decrease dose" : af.type === "replace" ? "Replace drug" : "Stop medication"}
                </span>
                <div style={{ display: "grid", gridTemplateColumns: af.type === "stop" ? "1fr" : "1fr 1fr", gap: 10, marginTop: 10 }}>
                  {af.type !== "stop" && (
                    <div>
                      <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>
                        {af.type === "replace" ? "New drug & dose" : "New dose"}
                      </label>
                      <input style={S.input} value={af.newDose}
                        onChange={e => setActionForms(prev => ({ ...prev, [med.id]: { ...prev[med.id], newDose: e.target.value } }))}
                        placeholder={af.type === "replace" ? "e.g. Ramipril 5mg" : "e.g. 10mg"} />
                    </div>
                  )}
                  <div>
                    <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Reason / clinical note</label>
                    <input style={S.input} value={af.reason}
                      onChange={e => setActionForms(prev => ({ ...prev, [med.id]: { ...prev[med.id], reason: e.target.value } }))}
                      placeholder="Clinical reason…" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button style={af.type === "stop" ? S.btnPrimary : S.btnSuccess}
                    onClick={() => handleMedAction(med, af.type, af.newDose, af.reason)}>
                    Confirm
                  </button>
                  <button style={S.btn}
                    onClick={() => setActionForms(prev => ({ ...prev, [med.id]: { ...prev[med.id], show: false } }))}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {stoppedMeds.length > 0 && (
        <>
          <div style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", margin: "14px 0 8px" }}>
            Stopped / Historical
          </div>
          {stoppedMeds.map(med => (
            <div key={med.id} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, opacity: 0.6 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ color: T.textSub, fontWeight: 700, fontSize: 13 }}>{med.drug}</span>
                <span style={{ color: T.textMuted, fontSize: 12 }}>{med.dose}</span>
                {med.drugClass && <Badge color={T.textMuted}>{med.drugClass}</Badge>}
                <Badge color="#f87171">STOPPED</Badge>
                {med.endDate && <span style={{ color: T.textMuted, fontSize: 11 }}>Stopped: {fmtDate(med.endDate)}</span>}
              </div>
            </div>
          ))}
        </>
      )}

      {medEvents.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SectionLabel color="#a78bfa">Medication event history</SectionLabel>
          {[...medEvents].reverse().slice(0, 12).map(e => (
            <div key={e.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ color: e.eventType === "stopped" ? "#f87171" : e.eventType === "increased" ? "#fbbf24" : "#34d399", fontSize: 12, fontWeight: 700, flexShrink: 0, width: 70 }}>
                {fmtDateShort(e.date)}
              </span>
              <div>
                <span style={{ color: e.eventType === "stopped" ? "#f87171" : e.eventType === "increased" ? "#fbbf24" : "#a78bfa", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                  {e.eventType === "started" ? "▶ Started" : e.eventType === "increased" ? "▲ Increased" : e.eventType === "decreased" ? "▼ Decreased" : e.eventType === "stopped" ? "■ Stopped" : "↺ Replaced"}
                </span>
                <span style={{ color: T.text, fontSize: 12, marginLeft: 8 }}>{e.drug}</span>
                <span style={{ color: T.textSub, fontSize: 12, marginLeft: 6 }}>{e.dose}</span>
                {e.previousDose && <span style={{ color: T.textMuted, fontSize: 11, marginLeft: 6 }}>← was {e.previousDose}</span>}
                {e.reason && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>{e.reason}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Adherence Panel ──────────────────────────────────────────────────────────

function AdherencePanel({ patientId, medications, adherenceLogs, onUpdate }: {
  patientId: string;
  medications: Medication[];
  adherenceLogs: AdherenceLog[];
  onUpdate: () => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const dateRange = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d;
  });

  const logsByMedDate = adherenceLogs.reduce<Record<string, Record<string, AdherenceLog>>>((acc, l) => {
    const dk = l.date.toISOString().split("T")[0];
    if (!acc[l.medicationId]) acc[l.medicationId] = {};
    acc[l.medicationId][dk] = l;
    return acc;
  }, {});

  const activeMeds = medications.filter(m => m.active);

  const overallPct = (() => {
    let total = 0, taken = 0;
    activeMeds.forEach(med => {
      dateRange.forEach(d => {
        const dk = d.toISOString().split("T")[0];
        const sk = med.startDate.toISOString().split("T")[0];
        if (dk < sk || d > today) return;
        total++;
        if (logsByMedDate[med.id]?.[dk]?.taken) taken++;
      });
    });
    return total > 0 ? Math.round((taken / total) * 100) : 0;
  })();

  const saveNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "adherence_notes"), { patientId, note, createdAt: serverTimestamp(), visibleToPatient: true });
      setNote("");
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="30-Day adherence" value={`${overallPct}%`}
          sub={`${adherenceLogs.filter(l => l.taken).length} doses logged`}
          color={overallPct >= 80 ? "#34d399" : overallPct >= 60 ? "#fbbf24" : "#f87171"} size={28} />
        <StatCard label="Medications tracked" value={`${activeMeds.length}`} sub="active prescriptions" />
        <StatCard label="Missed doses (30d)" value={`${adherenceLogs.filter(l => !l.taken).length}`} sub="patient-reported" color="#f87171" />
      </div>

      {activeMeds.map((med, idx) => {
        const color = getMedColor(idx);
        let taken = 0, missed = 0;
        dateRange.forEach(d => {
          const dk = d.toISOString().split("T")[0];
          const sk = med.startDate.toISOString().split("T")[0];
          if (dk < sk) return;
          const log = logsByMedDate[med.id]?.[dk];
          if (log) { if (log.taken) taken++; else missed++; }
        });
        const pct = (taken + missed) > 0 ? Math.round((taken / (taken + missed)) * 100) : 0;

        return (
          <div key={med.id} style={S.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color, fontWeight: 700, fontSize: 13 }}>{med.drug} {med.dose}</span>
                <span style={{ color: T.textSub, fontSize: 11 }}>{med.frequency}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#34d399", fontSize: 11 }}>{taken} taken</span>
                <span style={{ color: "#f87171", fontSize: 11 }}>{missed} missed</span>
                <Badge color={pct >= 80 ? "#34d399" : pct >= 60 ? "#fbbf24" : "#f87171"}>{pct}%</Badge>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
              {dateRange.map(d => {
                const dk = d.toISOString().split("T")[0];
                const sk = med.startDate.toISOString().split("T")[0];
                const log = logsByMedDate[med.id]?.[dk];
                const before = dk < sk, future = d > today;
                let bg = T.bgSub, textCol = T.textMuted, symbol = String(d.getDate());
                if (before || future) { bg = "transparent"; textCol = T.border; }
                else if (log?.taken)       { bg = "rgba(52,211,153,0.2)"; textCol = "#34d399"; symbol = "✓"; }
                else if (log && !log.taken) { bg = "rgba(248,113,113,0.15)"; textCol = "#f87171"; symbol = "✗"; }
                return (
                  <div key={dk} title={`${d.toLocaleDateString()} — ${log ? (log.taken ? "Taken" : "Missed") : "No record"}`}
                    style={{ background: bg, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1", fontSize: 10, color: textCol, fontWeight: log ? 700 : 400, border: `1px solid ${T.border}` }}>
                    {symbol}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={S.card}>
        <SectionLabel color="#34d399">Doctor note to patient re: adherence</SectionLabel>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Write a note about adherence. Visible to patient in their app…"
          style={{ ...S.input, minHeight: 80, resize: "vertical", marginBottom: 10, display: "block" }} />
        <button style={S.btnSuccess} onClick={saveNote} disabled={saving}>
          {saving ? "Sending…" : "Send to patient"}
        </button>
      </div>

      <div style={S.card}>
        <SectionLabel color="#fbbf24">Adherence barriers</SectionLabel>
        {["Forgetfulness","Side effects","Cost / affordability","Polypharmacy burden","Beliefs about medication","Work schedule / lifestyle","Asymptomatic — no perceived need","Difficulty swallowing","Other"].map(b => (
          <label key={b} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.border}`, color: T.textSub, fontSize: 12, cursor: "pointer" }}>
            <input type="checkbox" style={{ accentColor: "#fbbf24" }} />
            {b}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Alerts Panel ─────────────────────────────────────────────────────────────

function AlertsPanel({ patientId, alerts, onUpdate }: {
  patientId: string;
  alerts: Alert[];
  onUpdate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    severity: "warning" as "urgent" | "warning" | "info",
    category: "BP Control", message: "", action: "",
    triggerValue: "", notifyPatient: true,
  });

  const saveAlert = async () => {
    if (!form.message) return;
    try {
      await addDoc(collection(db, "clinicalAlerts"), {
        patientId, severity: form.severity, category: form.category,
        message: form.message, action: form.action,
        triggerValue: form.triggerValue ? parseFloat(form.triggerValue) : null,
        notifyPatient: form.notifyPatient,
        date: serverTimestamp(), resolved: false, createdAt: serverTimestamp(),
      });
      await addTimelineEvent(patientId, {
        date: new Date(), type: "alert",
        title: `Alert: ${form.category}`, description: form.message,
        severity: form.severity === "urgent" ? "red" : form.severity === "warning" ? "amber" : "blue",
      });
      setShowForm(false);
      setForm({ severity: "warning", category: "BP Control", message: "", action: "", triggerValue: "", notifyPatient: true });
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const resolveAlert = async (alertId: string) => {
    const note = prompt("Resolve note (optional):");
    try {
      await updateDoc(doc(db, "clinicalAlerts", alertId), { resolved: true, resolvedAt: serverTimestamp(), resolvedNote: note ?? "" });
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const active   = alerts.filter(a => !a.resolved);
  const resolved = alerts.filter(a =>  a.resolved);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <SectionLabel color="#fbbf24">Clinical alerts ({active.length} active)</SectionLabel>
        <button style={S.btnPrimary} onClick={() => setShowForm(v => !v)}>+ Create alert</button>
      </div>

      {showForm && (
        <div style={S.inlineForm}>
          <span style={S.label}>New clinical alert</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Severity</label>
              <select style={S.select} value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as any }))}>
                <option value="urgent">Urgent</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Category</label>
              <select style={S.select} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {["BP Control","Adherence","Medication","Lab Result","Complication Risk","Lifestyle","Follow-up Due","Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Alert message</label>
              <textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }}
                value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Describe the clinical concern…" />
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Action required</label>
              <input style={S.input} value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} placeholder="e.g. Increase dose, Recheck in 1 week" />
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Auto-trigger: systolic threshold</label>
              <input style={S.input} type="number" value={form.triggerValue} onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))} placeholder="e.g. 160 — blank = manual" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="notifyPt" checked={form.notifyPatient}
                onChange={e => setForm(f => ({ ...f, notifyPatient: e.target.checked }))}
                style={{ accentColor: "#f87171" }} />
              <label htmlFor="notifyPt" style={{ color: T.textSub, fontSize: 12 }}>Notify patient</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btnPrimary} onClick={saveAlert}>Save alert</button>
            <button style={S.btn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {active.map(a => (
        <div key={a.id} style={{
          background: T.bgCard,
          border: `1px solid ${a.severity === "urgent" ? "rgba(248,113,113,0.3)" : a.severity === "warning" ? "rgba(251,191,36,0.25)" : "rgba(96,165,250,0.2)"}`,
          borderLeft: `3px solid ${a.severity === "urgent" ? "#f87171" : a.severity === "warning" ? "#fbbf24" : "#60a5fa"}`,
          borderRadius: 12, padding: "14px 16px", marginBottom: 8,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                <Badge color={a.severity === "urgent" ? "#f87171" : a.severity === "warning" ? "#fbbf24" : "#60a5fa"}>{a.severity.toUpperCase()}</Badge>
                <Badge color={T.textSub}>{a.category}</Badge>
                <span style={{ color: T.textMuted, fontSize: 10 }}>{fmtDate(a.date)}</span>
              </div>
              <div style={{ color: T.text, fontSize: 12, marginBottom: 4 }}>{a.message}</div>
              {a.action && <div style={{ color: T.textSub, fontSize: 11 }}>→ {a.action}</div>}
              {a.notifyPatient && <div style={{ color: "#fbbf24", fontSize: 10, marginTop: 4 }}>Patient notified</div>}
            </div>
            <button style={{ ...S.btnSuccess, padding: "5px 10px", fontSize: 11, flexShrink: 0 }}
              onClick={() => resolveAlert(a.id)}>Resolve</button>
          </div>
        </div>
      ))}

      {resolved.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ color: T.textMuted, fontSize: 11, cursor: "pointer", marginBottom: 8 }}>
            Resolved alerts ({resolved.length})
          </summary>
          {resolved.map(a => (
            <div key={a.id} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 13px", marginBottom: 6, opacity: 0.55 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <Badge color={T.textMuted}>{a.severity}</Badge>
                <Badge color={T.textMuted}>{a.category}</Badge>
                <Badge color="#34d399">RESOLVED</Badge>
              </div>
              <div style={{ color: T.textSub, fontSize: 12 }}>{a.message}</div>
              {a.resolvedNote && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 3 }}>Note: {a.resolvedNote}</div>}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

// ─── Clinical Notes ───────────────────────────────────────────────────────────

function ClinicalNotesPanel({ patientId, notes, onUpdate }: {
  patientId: string;
  notes: ClinicalNote[];
  onUpdate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "Follow-up Visit", chiefComplaint: "",
    hpi: "", examination: "", investigations: "", assessment: "", plan: "",
  });

  const saveNote = async () => {
    if (!form.chiefComplaint) return;
    const now = new Date();
    try {
      await addDoc(collection(db, "clinicalNotes"), {
        patientId, ...form, date: Timestamp.fromDate(now), createdAt: serverTimestamp(),
      });
      await addTimelineEvent(patientId, {
        date: now, type: "note",
        title: `${form.type}: ${form.chiefComplaint}`,
        description: form.assessment, severity: "purple",
      });
      setShowForm(false);
      setForm({ type: "Follow-up Visit", chiefComplaint: "", hpi: "", examination: "", investigations: "", assessment: "", plan: "" });
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const NOTE_TYPES = ["Follow-up Visit","Initial Assessment","SOAP Note","Phone Consultation","Emergency Visit","Prescription Review","Referral Note"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <SectionLabel color="#a78bfa">Clinical notes ({notes.length})</SectionLabel>
        <button style={S.btnInfo} onClick={() => setShowForm(v => !v)}>+ New note</button>
      </div>

      {showForm && (
        <div style={S.inlineForm}>
          <span style={S.label}>New clinical note</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Note type</label>
              <select style={S.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {NOTE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Chief complaint</label>
              <input style={S.input} value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} placeholder="e.g. BP review, headache" />
            </div>
            {[
              { key: "hpi",            label: "HPI — History of presenting illness" },
              { key: "examination",    label: "Examination (Vitals, Systems)" },
              { key: "investigations", label: "Investigations / Results" },
              { key: "assessment",     label: "Assessment / Impression" },
              { key: "plan",           label: "Plan" },
            ].map(({ key, label }) => (
              <div key={key} style={{ gridColumn: "1 / -1" }}>
                <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>{label}</label>
                <textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={`${label}…`} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btnInfo} onClick={saveNote}>Save note</button>
            <button style={S.btn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {notes.length === 0 && !showForm && (
        <div style={{ color: T.textMuted, fontSize: 13, padding: "20px 0" }}>No clinical notes yet.</div>
      )}

      {[...notes].reverse().map(note => (
        <div key={note.id} style={S.card}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            <Badge color="#a78bfa">{note.type}</Badge>
            <span style={{ color: T.textSub, fontSize: 11 }}>{fmtDate(note.date)}</span>
          </div>
          <div style={{ color: T.text, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{note.chiefComplaint}</div>
          {([["hpi","HPI"],["examination","Examination"],["investigations","Investigations"],["assessment","Assessment"],["plan","Plan"]] as [string,string][]).filter(([k]) => (note as any)[k]).map(([k, l]) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
              <div style={{ color: T.textSub, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-line" }}>{(note as any)[k]}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Labs & Imaging ───────────────────────────────────────────────────────────

function LabsPanel({ patientId, labs, imaging, onUpdate }: {
  patientId: string; labs: LabResult[]; imaging: ImagingResult[]; onUpdate: () => void;
}) {
  const [showLabForm, setShowLabForm] = useState(false);
  const [showImgForm, setShowImgForm] = useState(false);
  const [labForm, setLabForm] = useState({ test: "U&E / Electrolytes", priority: "Routine", indication: "" });
  const [imgForm, setImgForm] = useState({ modality: "Echocardiogram", priority: "Routine", indication: "" });

  const orderLab = async () => {
    try {
      await addDoc(collection(db, "labs"), { patientId, ...labForm, date: serverTimestamp(), status: "pending", ordered: true, createdAt: serverTimestamp() });
      setShowLabForm(false); onUpdate();
    } catch (e) { console.error(e); }
  };

  const orderImg = async () => {
    try {
      await addDoc(collection(db, "imaging"), { patientId, ...imgForm, date: serverTimestamp(), status: "pending", ordered: true, createdAt: serverTimestamp() });
      setShowImgForm(false); onUpdate();
    } catch (e) { console.error(e); }
  };

  const HTN_LABS    = ["U&E / Electrolytes","Renal Function (eGFR, Creatinine)","Full Blood Count","Fasting Lipid Profile","HbA1c","Urine Albumin:Creatinine (ACR)","Urinalysis","Thyroid Function (TSH)","Aldosterone:Renin ratio","Uric acid","Liver Function Tests","Fasting Glucose"];
  const HTN_IMAGING = ["Echocardiogram","Renal Ultrasound / Doppler","Chest X-Ray","12-Lead ECG","Fundoscopy","Carotid Intima-Media Thickness","CT Angiography","MRI Brain","ABPM (24hr Ambulatory BP)"];

  const statusColor = (s: string) => s === "normal" ? "#34d399" : s === "abnormal" ? "#f87171" : s === "borderline" ? "#fbbf24" : "#60a5fa";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <SectionLabel color="#60a5fa">Laboratory results ({labs.length})</SectionLabel>
        <button style={S.btnInfo} onClick={() => setShowLabForm(v => !v)}>+ Order lab</button>
      </div>

      {showLabForm && (
        <div style={S.inlineForm}>
          <span style={S.label}>Lab order</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Test</label>
              <select style={S.select} value={labForm.test} onChange={e => setLabForm(f => ({ ...f, test: e.target.value }))}>
                {HTN_LABS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Priority</label>
              <select style={S.select} value={labForm.priority} onChange={e => setLabForm(f => ({ ...f, priority: e.target.value }))}>
                <option>Routine</option><option>Urgent</option><option>STAT</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Indication</label>
              <input style={S.input} value={labForm.indication} onChange={e => setLabForm(f => ({ ...f, indication: e.target.value }))} placeholder="Clinical indication…" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btnInfo} onClick={orderLab}>Place order</button>
            <button style={S.btn} onClick={() => setShowLabForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
          <thead>
            <tr>{["Test","Date","Result","Status","Flag"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "7px 10px", color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {labs.map((l, i) => (
              <tr key={l.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <td style={{ padding: "10px", color: T.text, fontWeight: 600 }}>{l.test}</td>
                <td style={{ padding: "10px", color: T.textSub }}>{fmtDate(l.date)}</td>
                <td style={{ padding: "10px", color: T.textSub }}>{l.result ?? "Pending"}</td>
                <td style={{ padding: "10px" }}><Badge color={statusColor(l.status)}>{l.status}</Badge></td>
                <td style={{ padding: "10px", color: T.textMuted, fontSize: 11 }}>{l.flag ?? "—"}</td>
              </tr>
            ))}
            {labs.length === 0 && <tr><td colSpan={5} style={{ padding: "16px 10px", color: T.textMuted, fontSize: 12 }}>No lab results yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <SectionLabel color="#a78bfa">Imaging & investigations ({imaging.length})</SectionLabel>
          <button style={S.btnAmber} onClick={() => setShowImgForm(v => !v)}>+ Order imaging</button>
        </div>

        {showImgForm && (
          <div style={S.inlineForm}>
            <span style={S.label}>Imaging order</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Modality</label>
                <select style={S.select} value={imgForm.modality} onChange={e => setImgForm(f => ({ ...f, modality: e.target.value }))}>
                  {HTN_IMAGING.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Priority</label>
                <select style={S.select} value={imgForm.priority} onChange={e => setImgForm(f => ({ ...f, priority: e.target.value }))}>
                  <option>Routine</option><option>Urgent</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Indication</label>
                <input style={S.input} value={imgForm.indication} onChange={e => setImgForm(f => ({ ...f, indication: e.target.value }))} placeholder="e.g. LVH screening…" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnAmber} onClick={orderImg}>Place order</button>
              <button style={S.btn} onClick={() => setShowImgForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {imaging.map(img => (
          <div key={img.id} style={{ ...S.card, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{img.modality}</span>
              <Badge color={statusColor(img.status)}>{img.status}</Badge>
              <span style={{ color: T.textMuted, fontSize: 11 }}>{fmtDate(img.date)}</span>
            </div>
            {img.findings && <div style={{ color: T.textSub, fontSize: 12, marginTop: 6 }}>{img.findings}</div>}
          </div>
        ))}
        {imaging.length === 0 && <div style={{ color: T.textMuted, fontSize: 12, padding: "12px 0" }}>No imaging results yet.</div>}
      </div>
    </div>
  );
}

// ─── Complications Panel ──────────────────────────────────────────────────────

function ComplicationsPanel({ patientId, complications, onUpdate }: {
  patientId: string; complications: Complication[]; onUpdate: () => void;
}) {
  const DEFAULT_COMPLICATIONS = [
    { name: "Left Ventricular Hypertrophy (LVH)",   organ: "Heart"   },
    { name: "Heart Failure",                          organ: "Heart"   },
    { name: "Coronary Artery Disease (CAD)",          organ: "Heart"   },
    { name: "Atrial Fibrillation",                    organ: "Heart"   },
    { name: "Stroke / TIA",                           organ: "Brain"   },
    { name: "Hypertensive Retinopathy",               organ: "Eyes"    },
    { name: "Chronic Kidney Disease (CKD)",           organ: "Kidneys" },
    { name: "Peripheral Arterial Disease",            organ: "Vessels" },
    { name: "Aortic Aneurysm",                        organ: "Vessels" },
    { name: "Erectile Dysfunction",                   organ: "Other"   },
    { name: "Hypertensive Crisis History",            organ: "Other"   },
  ];

  const ORGAN_COLORS: Record<string, string> = {
    Heart: "#f87171", Brain: "#a78bfa", Eyes: "#60a5fa",
    Kidneys: "#34d399", Vessels: "#fbbf24", Other: T.textSub,
  };

  const toggleComplication = async (name: string, organ: string) => {
    const existing = complications.find(c => c.name === name);
    try {
      if (existing) {
        await updateDoc(doc(db, "complications", existing.id), {
          present: !existing.present,
          ...(existing.present ? {} : { diagnosedDate: Timestamp.fromDate(new Date()) }),
        });
      } else {
        await addDoc(collection(db, "complications"), {
          patientId, name, organ, present: true,
          diagnosedDate: Timestamp.fromDate(new Date()), createdAt: serverTimestamp(),
        });
      }
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const byOrgan: Record<string, typeof DEFAULT_COMPLICATIONS> = {};
  DEFAULT_COMPLICATIONS.forEach(c => { if (!byOrgan[c.organ]) byOrgan[c.organ] = []; byOrgan[c.organ].push(c); });

  return (
    <div>
      <SectionLabel color="#f87171">Target organ damage & complications</SectionLabel>
      {Object.entries(byOrgan).map(([organ, comps]) => (
        <div key={organ} style={S.card}>
          <div style={{ color: ORGAN_COLORS[organ] ?? T.textSub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>
            {organ}
          </div>
          {comps.map(c => {
            const found = complications.find(x => x.name === c.name);
            const present = found?.present ?? false;
            return (
              <label key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
                <input type="checkbox" checked={present} onChange={() => toggleComplication(c.name, organ)} style={{ accentColor: ORGAN_COLORS[organ] }} />
                <span style={{ color: present ? T.text : T.textSub, fontSize: 12, fontWeight: present ? 700 : 400 }}>{c.name}</span>
                {present && found?.diagnosedDate && (
                  <span style={{ color: T.textMuted, fontSize: 10, marginLeft: "auto" }}>Dx: {fmtDate(found.diagnosedDate)}</span>
                )}
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Lifestyle & Education Panel ──────────────────────────────────────────────

function LifestylePanel({ patientId }: { patientId: string }) {
  const [adherence, setAdherence] = useState<Record<string, string>>({});
  const [sentEdu, setSentEdu] = useState<Set<string>>(new Set());

  const PLANS = [
    { domain: "Sodium restriction",  rec: "Target <2.4g/day (6g salt). Avoid processed foods. Expected SBP reduction: −2 to −8 mmHg.", icon: "🧂" },
    { domain: "DASH diet",           rec: "Rich in fruits, vegetables, whole grains, low-fat dairy. Reduces SBP 8–14 mmHg.", icon: "🥗" },
    { domain: "Physical activity",   rec: "150 min/week moderate aerobic exercise. Reduces SBP 4–9 mmHg.", icon: "🏃" },
    { domain: "Weight reduction",    rec: "Each 10 kg loss reduces SBP 5–20 mmHg. Target BMI 18.5–24.9.", icon: "⚖️" },
    { domain: "Alcohol moderation",  rec: "Men ≤2 units/day; Women ≤1 unit/day.", icon: "🍷" },
    { domain: "Smoking cessation",   rec: "Raises CV risk markedly. Consider NRT or varenicline.", icon: "🚭" },
    { domain: "Stress management",   rec: "Chronic stress sustains elevated BP. Mindfulness, 7–9h sleep.", icon: "🧘" },
    { domain: "Home BP monitoring",  rec: "Twice daily — morning + evening. Seated, 5 min rest. Log all readings.", icon: "🩺" },
  ];

  const EDUCATION = [
    { topic: "What is hypertension?",          desc: "Causes, risks, and what BP numbers mean." },
    { topic: "Why medication adherence matters", desc: "Risk of stroke and MI with poor control." },
    { topic: "How to take BP correctly at home", desc: "Positioning, equipment, recording." },
    { topic: "DASH diet fundamentals",          desc: "Foods to eat, avoid, and meal planning." },
    { topic: "Salt and BP connection",          desc: "How sodium affects blood pressure." },
    { topic: "Understanding your medications",  desc: "What each drug does and potential side effects." },
    { topic: "Warning signs — when to seek help", desc: "Hypertensive urgency/emergency symptoms." },
    { topic: "Exercise for hypertension",       desc: "Safe types, intensity, and frequency." },
  ];

  const sendEdu = async (topic: string) => {
    try {
      await addDoc(collection(db, "education_logs"), { patientId, topic, sentAt: serverTimestamp(), method: "App notification" });
      setSentEdu(prev => new Set([...prev, topic]));
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <SectionLabel color="#34d399">Lifestyle modification plan</SectionLabel>
      {PLANS.map(p => (
        <div key={p.domain} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}`, alignItems: "flex-start" }}>
          <div style={{ fontSize: 20, lineHeight: 1.2, width: 28, flexShrink: 0 }}>{p.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{p.domain}</span>
              <select style={{ ...S.select, width: 130, fontSize: 11, padding: "3px 8px" }}
                value={adherence[p.domain] ?? ""}
                onChange={e => setAdherence(prev => ({ ...prev, [p.domain]: e.target.value }))}>
                <option value="">Not assessed</option>
                <option value="good">Good</option>
                <option value="moderate">Moderate</option>
                <option value="poor">Poor</option>
                <option value="na">Not applicable</option>
              </select>
              {adherence[p.domain] && <Badge color={adherence[p.domain] === "good" ? "#34d399" : adherence[p.domain] === "moderate" ? "#fbbf24" : "#f87171"}>{adherence[p.domain]}</Badge>}
            </div>
            <div style={{ color: T.textSub, fontSize: 11, lineHeight: 1.6 }}>{p.rec}</div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        <SectionLabel color="#60a5fa">Patient education — send to patient app</SectionLabel>
        {EDUCATION.map(e => (
          <div key={e.topic} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: sentEdu.has(e.topic) ? "#34d399" : T.text, fontSize: 12, fontWeight: 600 }}>{e.topic}</div>
              <div style={{ color: T.textMuted, fontSize: 11 }}>{e.desc}</div>
            </div>
            {sentEdu.has(e.topic) ? <Badge color="#34d399">✓ Sent</Badge> : (
              <button style={{ ...S.btnInfo, padding: "4px 10px", fontSize: 11 }} onClick={() => sendEdu(e.topic)}>Send</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline Panel ───────────────────────────────────────────────────────────

function TimelinePanel({ events }: { events: TimelineEvent[] }) {
  const COLOR_MAP: Record<string, string> = { green: "#34d399", amber: "#fbbf24", red: "#f87171", blue: "#60a5fa", purple: "#a78bfa" };
  const TYPE_ICONS: Record<string, string> = { bp: "⊕", med: "💊", adherence: "📅", alert: "⚠", lab: "🧪", note: "📋", referral: "↗", education: "📚", complication: "🫀", imaging: "🖼" };

  const sorted = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <SectionLabel color="#a78bfa">Complete clinical timeline ({sorted.length} events)</SectionLabel>
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div style={{ position: "absolute", left: 8, top: 8, bottom: 0, width: 1, background: T.border }} />
        {sorted.map(event => {
          const color = COLOR_MAP[event.severity ?? "blue"] ?? T.textSub;
          return (
            <div key={event.id} style={{ position: "relative", marginBottom: 16 }}>
              <div style={{ position: "absolute", left: -24, top: 4, width: 12, height: 12, borderRadius: "50%", background: color, border: `2px solid ${T.bgCard}` }} />
              <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>{fmtDate(event.date)}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12 }}>{TYPE_ICONS[event.type] ?? "•"}</span>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{event.title}</span>
              </div>
              {event.description && <div style={{ color: T.textSub, fontSize: 11, marginTop: 2 }}>{event.description}</div>}
            </div>
          );
        })}
        {sorted.length === 0 && <div style={{ color: T.textMuted, fontSize: 12, padding: "20px 0" }}>No timeline events yet.</div>}
      </div>
    </div>
  );
}

// ─── Messages & Referrals Panel ───────────────────────────────────────────────

function MessagesPanel({ patientId, messages, referrals, onUpdate }: {
  patientId: string; messages: Message[]; referrals: Referral[]; onUpdate: () => void;
}) {
  const [msgText, setMsgText] = useState("");
  const [showRefForm, setShowRefForm] = useState(false);
  const [refForm, setRefForm] = useState({ specialty: "Cardiology", reason: "", priority: "routine" });
  const msgEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    try {
      await addDoc(collection(db, "messages"), { patientId, direction: "out", text: msgText, sentAt: serverTimestamp(), read: false });
      setMsgText("");
      onUpdate();
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) { console.error(e); }
  };

  const sendReferral = async () => {
    if (!refForm.reason) return;
    try {
      await addDoc(collection(db, "referrals"), { patientId, ...refForm, date: serverTimestamp(), status: "Submitted", createdAt: serverTimestamp() });
      await addTimelineEvent(patientId, { date: new Date(), type: "referral", title: `Referral: ${refForm.specialty}`, description: refForm.reason, severity: "blue" });
      setShowRefForm(false);
      setRefForm({ specialty: "Cardiology", reason: "", priority: "routine" });
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const SPECIALTIES = ["Cardiology","Nephrology","Endocrinology","Ophthalmology","Neurology","Dietitian","Physiotherapy","Vascular Surgery","Internal Medicine"];

  return (
    <div>
      <SectionLabel color="#60a5fa">Messages</SectionLabel>
      <div style={{ ...S.card, maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px", marginBottom: 12 }}>
        {messages.length === 0 && <div style={{ color: T.textMuted, fontSize: 12 }}>No messages yet.</div>}
        {messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.direction === "out" ? "flex-end" : "flex-start", maxWidth: "78%" }}>
            <div style={{
              background: m.direction === "out" ? "rgba(96,165,250,0.12)" : T.bgSub,
              border: `1px solid ${m.direction === "out" ? "rgba(96,165,250,0.25)" : T.border}`,
              borderRadius: 12,
              borderBottomRightRadius: m.direction === "out" ? 3 : 12,
              borderBottomLeftRadius: m.direction === "in" ? 3 : 12,
              padding: "9px 13px", color: T.text, fontSize: 12, lineHeight: 1.5,
            }}>
              {m.text}
              <div style={{ color: T.textMuted, fontSize: 9, marginTop: 3, textAlign: m.direction === "out" ? "right" : "left" }}>{fmtDate(m.sentAt)}</div>
            </div>
          </div>
        ))}
        <div ref={msgEndRef} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input style={{ ...S.input, flex: 1 }} value={msgText}
          onChange={e => setMsgText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
          placeholder="Message patient…" />
        <button style={S.btnInfo} onClick={sendMessage}>Send</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SectionLabel color="#a78bfa">Referrals ({referrals.length})</SectionLabel>
        <button style={S.btnAmber} onClick={() => setShowRefForm(v => !v)}>+ New referral</button>
      </div>

      {showRefForm && (
        <div style={S.inlineForm}>
          <span style={S.label}>New referral</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Specialty</label>
              <select style={S.select} value={refForm.specialty} onChange={e => setRefForm(f => ({ ...f, specialty: e.target.value }))}>
                {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Priority</label>
              <select style={S.select} value={refForm.priority} onChange={e => setRefForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: T.textSub, fontSize: 11, display: "block", marginBottom: 4 }}>Reason / clinical summary</label>
              <textarea style={{ ...S.input, minHeight: 70, resize: "vertical" }}
                value={refForm.reason} onChange={e => setRefForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Clinical indication, relevant history, question for specialist…" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btnAmber} onClick={sendReferral}>Submit referral</button>
            <button style={S.btn} onClick={() => setShowRefForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {referrals.map(r => (
        <div key={r.id} style={{ ...S.card, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
            <Badge color="#a78bfa">{r.specialty}</Badge>
            <Badge color={r.priority === "urgent" ? "#f87171" : r.priority === "emergency" ? "#dc2626" : T.textSub}>{r.priority}</Badge>
            <span style={{ color: T.textMuted, fontSize: 11 }}>{fmtDate(r.date)}</span>
            <Badge color="#34d399">{r.status}</Badge>
          </div>
          <div style={{ color: T.textSub, fontSize: 12 }}>{r.reason}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Clinical Intelligence ────────────────────────────────────────────────────

function ClinicalInsights({ readings, medications, adherenceLogs }: {
  readings: BPReading[]; medications: Medication[]; adherenceLogs: AdherenceLog[];
}) {
  const insights: { type: "warning" | "info" | "success"; message: string; recommendation: string }[] = [];

  if (readings.length > 0) {
    const latest = readings[readings.length - 1];
    const cls    = classifyBP(latest.systolic, latest.diastolic);
    if (cls.key === "stage2" || cls.key === "crisis") {
      insights.push({
        type: "warning",
        message: `BP remains ${cls.label} (${latest.systolic}/${latest.diastolic} mmHg) on ${medications.filter(m => m.active).length} medication(s).`,
        recommendation: medications.filter(m => m.active).length < 3
          ? "Consider adding thiazide diuretic as third-line agent if not contraindicated."
          : "Consider specialist referral for resistant hypertension workup.",
      });
    }
    const avgSys = Math.round(readings.reduce((a, r) => a + r.systolic, 0) / readings.length);
    if (avgSys >= 140) {
      insights.push({ type: "warning", message: `Mean systolic ${avgSys} mmHg — above JNC 8 target of <130.`, recommendation: "Intensify pharmacotherapy. Confirm adherence before escalating." });
    }
  }

  const takenTotal = adherenceLogs.length;
  const takenCount = adherenceLogs.filter(l => l.taken).length;
  const pct = takenTotal > 0 ? Math.round((takenCount / takenTotal) * 100) : 100;

  if (pct < 50)      insights.push({ type: "warning", message: `Critically low adherence: ${pct}%. Likely primary cause of poor BP control.`, recommendation: "Address barriers. Consider fixed-dose combination pill to simplify regimen." });
  else if (pct < 80) insights.push({ type: "info",    message: `Suboptimal adherence: ${pct}%.`, recommendation: "Reinforce daily dosing. Consider SMS/app reminders." });

  const active = medications.filter(m => m.active);
  if (active.length >= 3) {
    const hasRAS     = active.some(m => ["ARB","ACE Inhibitor"].includes(m.drugClass ?? ""));
    const hasCCB     = active.some(m => m.drugClass === "CCB");
    const hasDiuretic = active.some(m => ["Thiazide Diuretic","Loop Diuretic"].includes(m.drugClass ?? ""));
    if (!hasRAS || !hasCCB || !hasDiuretic) {
      insights.push({ type: "info", message: "Optimal triple therapy not yet complete.", recommendation: "NICE/JNC 8 triple therapy: CCB + ARB/ACEi + Thiazide diuretic. Check regimen gaps." });
    }
  }

  if (insights.length === 0) {
    insights.push({ type: "success", message: "No critical insights at this time.", recommendation: "Continue current management. Review at next scheduled visit." });
  }

  return (
    <div style={{ ...S.card, marginBottom: 14, border: "1px solid rgba(167,139,250,0.2)" }}>
      <SectionLabel color="#a78bfa">Clinical intelligence</SectionLabel>
      {insights.map((ins, i) => (
        <div key={i} style={{
          background: ins.type === "warning" ? "rgba(248,113,113,0.07)" : ins.type === "success" ? "rgba(52,211,153,0.07)" : "rgba(96,165,250,0.07)",
          border: `1px solid ${ins.type === "warning" ? "rgba(248,113,113,0.2)" : ins.type === "success" ? "rgba(52,211,153,0.2)" : "rgba(96,165,250,0.2)"}`,
          borderRadius: 10, padding: "12px 14px", marginBottom: 8,
        }}>
          <div style={{ color: ins.type === "warning" ? "#f87171" : ins.type === "success" ? "#34d399" : "#60a5fa", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
            {ins.type === "warning" ? "⚠ Clinical insight" : ins.type === "success" ? "✓ Status" : "ℹ Insight"}
          </div>
          <div style={{ color: T.text,    fontSize: 12, marginBottom: 4 }}>{ins.message}</div>
          <div style={{ color: T.textSub, fontSize: 11 }}>→ {ins.recommendation}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main HTNPanel Component ──────────────────────────────────────────────────

type Tab = "trend" | "readings" | "medications" | "adherence" | "alerts" | "complications" | "lifestyle" | "labs" | "notes" | "timeline" | "messages";

interface HTNPanelProps {
  patientId?: string;   // optional: pre-select a patient
  patient?: PatientInfo;
  doctorId?: string;
}

export default function HTNPanel({ patientId: propPatientId, patient: propPatient, doctorId }: HTNPanelProps) {

  // ── Patient list ──────────────────────────────────────────────────────────
  const [patientsList,      setPatientsList]      = useState<PatientSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(propPatientId ?? null);
  const [loadingPatients,   setLoadingPatients]   = useState(true);

  // ── Clinical data ─────────────────────────────────────────────────────────
  const [readings,       setReadings]       = useState<BPReading[]>([]);
  const [medications,    setMedications]    = useState<Medication[]>([]);
  const [medEvents,      setMedEvents]      = useState<MedEvent[]>([]);
  const [adherenceLogs,  setAdherenceLogs]  = useState<AdherenceLog[]>([]);
  const [alerts,         setAlerts]         = useState<Alert[]>([]);
  const [notes,          setNotes]          = useState<ClinicalNote[]>([]);
  const [labs,           setLabs]           = useState<LabResult[]>([]);
  const [imaging,        setImaging]        = useState<ImagingResult[]>([]);
  const [complications,  setComplications]  = useState<Complication[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [referrals,      setReferrals]      = useState<Referral[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [tab,            setTab]            = useState<Tab>("trend");

  // ── Load patient list ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingPatients(true);
      try {
        const snap = await getDocs(
          query(collection(db, "toolReadings"), where("toolType", "==", "bp_monitor"))
        );
        const map: Record<string, { count: number; latestSys?: number; latestDia?: number; latestAt?: Date }> = {};
        snap.docs.forEach(d => {
          const data = d.data();
          const pid  = data.patientId;
          if (!pid) return;
          const sys = data.data?.systolic ?? data.systolic;
          const dia = data.data?.diastolic ?? data.diastolic;
          const at  = data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date();
          if (!map[pid]) map[pid] = { count: 0 };
          map[pid].count++;
          if (!map[pid].latestAt || at > map[pid].latestAt!) {
            map[pid].latestAt  = at;
            map[pid].latestSys = sys;
            map[pid].latestDia = dia;
          }
        });

        const uniqueIds = Object.keys(map);
        if (!uniqueIds.length) { setPatientsList([]); setLoadingPatients(false); return; }

        const results = await Promise.all(uniqueIds.map(async pid => {
          try {
            const userDoc = await getDoc(doc(db, "users", pid));
            let profileData = userDoc.exists() ? userDoc.data() : null;
            if (!profileData) {
              const profileDoc = await getDoc(doc(db, "patientProfiles", pid));
              profileData = profileDoc.exists() ? profileDoc.data() : null;
            }
            const name = profileData?.name ?? profileData?.displayName ?? profileData?.fullName ?? `Patient …${pid.slice(-6)}`;
            return { id: pid, name, universalId: profileData?.universalId, latestSystolic: map[pid].latestSys, latestDiastolic: map[pid].latestDia, latestAt: map[pid].latestAt, totalReadings: map[pid].count } as PatientSummary;
          } catch {
            return { id: pid, name: `Patient …${pid.slice(-6)}`, totalReadings: map[pid].count, latestSystolic: map[pid].latestSys, latestDiastolic: map[pid].latestDia, latestAt: map[pid].latestAt } as PatientSummary;
          }
        }));

        results.sort((a, b) => (b.latestAt?.getTime() ?? 0) - (a.latestAt?.getTime() ?? 0));
        setPatientsList(results);

        // Auto-select first patient only if no prop was provided
        if (!propPatientId && results.length > 0) {
          setSelectedPatientId(results[0].id);
        }
      } catch (err) {
        console.error("Patient list fetch error:", err);
      } finally {
        setLoadingPatients(false);
      }
    })();
  }, []); // runs once on mount

  // ── Fetch all clinical data for the selected patient ──────────────────────
  const fetchAll = useCallback(async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    try {
      // BP Readings
      const bpSnap = await getDocs(query(
        collection(db, "toolReadings"),
        where("patientId", "==", selectedPatientId),
        where("toolType", "==", "bp_monitor"),
        orderBy("recordedAt", "asc"),
      ));
      setReadings(bpSnap.docs.map(d => {
        const r   = d.data();
        const sys = r.data?.systolic ?? r.systolic;
        const dia = r.data?.diastolic ?? r.diastolic;
        if (!sys || !dia) return null;
        return { id: d.id, systolic: sys, diastolic: dia, pulse: r.data?.pulse ?? r.pulse, recordedAt: toDate(r.recordedAt), doctorNote: r.doctorNote, arm: r.data?.arm, position: r.data?.position, triageLabel: r.triage?.label, triageUrgency: r.triage?.urgency } as BPReading;
      }).filter(Boolean) as BPReading[]);

      // Medications
      const medSnap = await getDocs(query(collection(db, "prescriptions"), where("patientId", "==", selectedPatientId)));
      setMedications(medSnap.docs.map(d => {
        const r = d.data();
        return { id: d.id, drug: r.name ?? r.drug ?? r.medication ?? "Unknown", dose: r.dosage ?? r.dose ?? r.strength ?? "—", doseValue: parseFloat(r.doseValue ?? "0") || 0, doseUnit: r.doseUnit ?? "mg", frequency: r.frequency ?? "Once daily", startDate: toDate(r.startDate ?? r.createdAt), endDate: r.endDate ? toDate(r.endDate) : undefined, active: r.active !== false, indication: r.indication, drugClass: r.drugClass ?? r.class, previousDose: r.previousDose, notes: r.notes } as Medication;
      }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()));

      // Medication Events
      try {
        const evSnap = await getDocs(query(collection(db, "medication_events"), where("patientId", "==", selectedPatientId)));
        setMedEvents(evSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, medicationId: r.medicationId, eventType: r.eventType, drug: r.drug, dose: r.dose, previousDose: r.previousDose, date: toDate(r.date ?? r.createdAt), reason: r.reason } as MedEvent;
        }).sort((a, b) => a.date.getTime() - b.date.getTime()));
      } catch { setMedEvents([]); }

      // Adherence Logs
      try {
        const adhSnap = await getDocs(query(collection(db, "adherence_logs"), where("patientId", "==", selectedPatientId)));
        setAdherenceLogs(adhSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, medicationId: r.medicationId, drug: r.drug ?? "", date: toDate(r.date ?? r.createdAt), taken: r.taken ?? false, note: r.note } as AdherenceLog;
        }).sort((a, b) => a.date.getTime() - b.date.getTime()));
      } catch { setAdherenceLogs([]); }

      // Clinical Alerts
      try {
        const altSnap = await getDocs(query(collection(db, "clinicalAlerts"), where("patientId", "==", selectedPatientId)));
        setAlerts(altSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, severity: r.severity ?? "info", category: r.category ?? "General", message: r.message, action: r.action ?? "", triggerType: r.triggerType, triggerValue: r.triggerValue, notifyPatient: r.notifyPatient ?? false, date: toDate(r.date ?? r.createdAt), resolved: r.resolved ?? false, resolvedAt: r.resolvedAt ? toDate(r.resolvedAt) : undefined, resolvedNote: r.resolvedNote } as Alert;
        }).sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch { setAlerts([]); }

      // Clinical Notes  (collection: clinicalNotes)
      try {
        const noteSnap = await getDocs(query(collection(db, "clinicalNotes"), where("patientId", "==", selectedPatientId)));
        setNotes(noteSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, type: r.type ?? r.noteType ?? "Follow-up Visit", date: toDate(r.date ?? r.createdAt), chiefComplaint: r.chiefComplaint ?? r.subject ?? "", hpi: r.hpi ?? r.history, examination: r.examination ?? r.exam, investigations: r.investigations, assessment: r.assessment ?? r.impression, plan: r.plan, biodata: r.biodata, doctorId: r.doctorId } as ClinicalNote;
        }).sort((a, b) => a.date.getTime() - b.date.getTime()));
      } catch { setNotes([]); }

      // Labs
      try {
        const labSnap = await getDocs(query(collection(db, "labs"), where("patientId", "==", selectedPatientId)));
        setLabs(labSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, test: r.test, date: toDate(r.date ?? r.createdAt), result: r.result, status: r.status ?? "pending", flag: r.flag, ordered: r.ordered ?? true, priority: r.priority, indication: r.indication } as LabResult;
        }).sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch { setLabs([]); }

      // Imaging
      try {
        const imgSnap = await getDocs(query(collection(db, "imaging"), where("patientId", "==", selectedPatientId)));
        setImaging(imgSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, modality: r.modality, date: toDate(r.date ?? r.createdAt), findings: r.findings, status: r.status ?? "pending", ordered: r.ordered ?? true } as ImagingResult;
        }).sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch { setImaging([]); }

      // Complications
      try {
        const compSnap = await getDocs(query(collection(db, "complications"), where("patientId", "==", selectedPatientId)));
        setComplications(compSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, name: r.name, present: r.present ?? false, diagnosedDate: r.diagnosedDate ? toDate(r.diagnosedDate) : undefined, notes: r.notes, severity: r.severity } as Complication;
        }));
      } catch { setComplications([]); }

      // Timeline Events
      try {
        const tlSnap = await getDocs(query(collection(db, "timeline_events"), where("patientId", "==", selectedPatientId)));
        setTimelineEvents(tlSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, type: r.type, title: r.title, date: toDate(r.date ?? r.createdAt), description: r.description, severity: r.severity, linkedId: r.linkedId } as TimelineEvent;
        }).sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch { setTimelineEvents([]); }

      // Messages
      try {
        const msgSnap = await getDocs(query(collection(db, "messages"), where("patientId", "==", selectedPatientId)));
        setMessages(msgSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, direction: r.direction ?? "out", text: r.text ?? r.message ?? r.content ?? "", sentAt: toDate(r.sentAt ?? r.createdAt), read: r.read } as Message;
        }).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()));
      } catch { setMessages([]); }

      // Referrals
      try {
        const refSnap = await getDocs(query(collection(db, "referrals"), where("patientId", "==", selectedPatientId)));
        setReferrals(refSnap.docs.map(d => {
          const r = d.data();
          return { id: d.id, specialty: r.specialty, reason: r.reason, priority: r.priority ?? "routine", date: toDate(r.date ?? r.createdAt), status: r.status ?? "Submitted", notes: r.notes } as Referral;
        }).sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch { setReferrals([]); }

    } catch (err) {
      console.error("HTNPanel fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  // Re-fetch whenever the selected patient changes
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const latest        = readings.at(-1) ?? null;
  const latestCls     = latest ? classifyBP(latest.systolic, latest.diastolic) : null;
  const avgSys        = readings.length > 0 ? Math.round(readings.reduce((a, r) => a + r.systolic, 0) / readings.length) : 0;
  const avgDia        = readings.length > 0 ? Math.round(readings.reduce((a, r) => a + r.diastolic, 0) / readings.length) : 0;
  const avgCls        = readings.length > 0 ? classifyBP(avgSys, avgDia) : null;
  const takenCount    = adherenceLogs.filter(l => l.taken).length;
  const totalCount    = adherenceLogs.length;
  const adherencePct  = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  const activeMeds    = medications.filter(m => m.active);
  const ctrlPct       = readings.length > 0 ? Math.round(readings.filter(r => r.systolic < 130 && r.diastolic < 80).length / readings.length * 100) : 0;

  // Selected patient name for header
  const selectedPatient = propPatient ?? patientsList.find(p => p.id === selectedPatientId);

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "trend",        icon: "📈", label: "Readings"      },
    { id: "readings",     icon: "🗃️", label: "Full Table"    },
    { id: "medications",  icon: "💊", label: "Medications"   },
    { id: "adherence",    icon: "📅", label: "Adherence"     },
    { id: "alerts",       icon: "🔔", label: "Alerts"        },
    { id: "complications",icon: "🫀", label: "Complications" },
    { id: "lifestyle",    icon: "🌿", label: "Lifestyle"     },
    { id: "labs",         icon: "🧪", label: "Labs"          },
    { id: "notes",        icon: "📋", label: "Notes"         },
    { id: "timeline",     icon: "⏱️", label: "Timeline"      },
    { id: "messages",     icon: "💬", label: "Messages"      },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans','Plus Jakarta Sans','Segoe UI',system-ui,sans-serif", color: T.text, background: T.bg, minHeight: "100%" }}>

      {/* ── Patient selector ─────────────────────────────────────────────── */}
      <PatientSelectorStrip
        patients={patientsList}
        selectedId={selectedPatientId}
        onSelect={id => { setSelectedPatientId(id); setTab("trend"); }}
        loading={loadingPatients}
      />

      {/* ── Patient header ───────────────────────────────────────────────── */}
      {selectedPatientId && (
        <div style={{ background: T.bgCard, borderBottom: `1px solid ${T.border}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>
                {selectedPatient?.name ?? "Patient"}
                <span style={{ color: T.textSub, fontWeight: 400, fontSize: 12, marginLeft: 10 }}>{selectedPatientId}</span>
              </div>
              <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span>Dx: Essential Hypertension</span>
                {selectedPatient && "totalReadings" in selectedPatient && (
                  <span>{(selectedPatient as PatientSummary).totalReadings} readings total</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {latestCls && latest && (
                <div style={{ background: latestCls.bg, border: `1px solid ${latestCls.border}`, borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: latestCls.text, fontSize: 18, fontWeight: 800 }}>{latest.systolic}/{latest.diastolic}</span>
                  <div>
                    <div style={{ color: latestCls.text, fontSize: 10, fontWeight: 700 }}>{latestCls.label}</div>
                    <div style={{ color: T.textMuted, fontSize: 9 }}>Latest reading</div>
                  </div>
                </div>
              )}
              <Badge color={adherencePct >= 80 ? "#34d399" : adherencePct >= 60 ? "#fbbf24" : "#f87171"}>{adherencePct}% adherent</Badge>
              <Badge color={alerts.some(a => !a.resolved && a.severity === "urgent") ? "#f87171" : T.textSub}>{alerts.filter(a => !a.resolved).length} alerts</Badge>
              <Badge color="#60a5fa">{activeMeds.length} meds</Badge>
            </div>
          </div>
        </div>
      )}

      {!selectedPatientId && !loadingPatients && (
        <div style={{ padding: 48, textAlign: "center", color: T.textMuted, fontSize: 14 }}>
          Select a patient above to open their HTN monitoring cockpit.
        </div>
      )}

      {selectedPatientId && (
        <div style={{ padding: "0 16px 32px" }}>

          {/* ── Clinical Summary Strip ──────────────────────────────────── */}
          <div style={{ display: "flex", gap: 8, margin: "16px 0 12px", flexWrap: "wrap" }}>
            <StatCard label="Latest BP" value={latest ? `${latest.systolic}/${latest.diastolic}` : "—"} sub={latestCls?.label ?? "No readings"} color={latestCls?.text ?? T.textSub} />
            <StatCard label="Average BP" value={readings.length > 0 ? `${avgSys}/${avgDia}` : "—"} sub={avgCls?.label ?? "No data"} color={avgCls?.text ?? T.textSub} />
            <StatCard label="BP control" value={`${ctrlPct}%`} sub="<130/80 mmHg" color={ctrlPct >= 70 ? "#34d399" : ctrlPct >= 50 ? "#fbbf24" : "#f87171"} />
            <StatCard label="Adherence" value={`${adherencePct}%`} sub={`${totalCount} doses logged`} color={adherencePct >= 80 ? "#34d399" : adherencePct >= 60 ? "#fbbf24" : "#f87171"} />
            <StatCard label="Active meds" value={`${activeMeds.length}`} sub="prescriptions" />
            <StatCard label="Readings" value={`${readings.length}`} sub="all time" />
            {latest?.pulse && <StatCard label="Pulse" value={`${latest.pulse}`} sub="bpm" color="#a78bfa" />}
          </div>

          {/* ── Alert Banner ─────────────────────────────────────────────── */}
          <AlertBanner alerts={alerts} />

          {/* ── Clinical Intelligence ─────────────────────────────────────── */}
          <ClinicalInsights readings={readings} medications={medications} adherenceLogs={adherenceLogs} />

          {/* ── BP Trend Engine (always visible) ─────────────────────────── */}
          {loading ? (
            <div style={{ ...S.card, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>
              Loading clinical data…
            </div>
          ) : (
            <BPTrendEngine readings={readings} medEvents={medEvents} />
          )}

          {/* ── Tab Bar ──────────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", background: T.bgSub, border: `1px solid ${T.border}`, borderRadius: 12, padding: 4, marginBottom: 16 }}>
            {TABS.map(({ id, icon, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "7px 14px", borderRadius: 9, border: "none",
                background: tab === id ? "rgba(248,113,113,0.12)" : "transparent",
                color: tab === id ? "#f87171" : T.textSub,
                fontSize: 12, fontWeight: tab === id ? 700 : 500,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                fontFamily: "inherit",
              }}>
                <span style={{ fontSize: 12 }}>{icon}</span> {label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ──────────────────────────────────────────────── */}
          {loading ? (
            <div style={{ ...S.card, height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>
              Loading…
            </div>
          ) : (
            <>
              {tab === "trend" && (
                <div style={S.card}>
                  <SectionLabel color="#f87171">Recent readings ({Math.min(readings.length, 15)} shown)</SectionLabel>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
                      <thead>
                        <tr>{["Date & Time","Systolic","Diastolic","Pulse","Category","Position / Arm","Triage","Doctor Note"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "7px 10px", color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {[...readings].reverse().slice(0, 15).map((r, i) => {
                          const cls = classifyBP(r.systolic, r.diastolic);
                          return (
                            <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                              <td style={{ padding: "10px", color: T.textSub, fontSize: 11 }}>
                                {r.recordedAt.toLocaleDateString()}<br />
                                <span style={{ color: T.textMuted, fontSize: 10 }}>{r.recordedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </td>
                              <td style={{ padding: "10px", color: T.sys, fontWeight: 800, fontSize: 16 }}>{r.systolic}</td>
                              <td style={{ padding: "10px", color: T.dia, fontWeight: 700, fontSize: 16 }}>{r.diastolic}</td>
                              <td style={{ padding: "10px", color: T.pulse }}>{r.pulse ?? "—"}</td>
                              <td style={{ padding: "10px" }}><Badge color={cls.text}>{cls.label}</Badge></td>
                              <td style={{ padding: "10px", color: T.textSub, fontSize: 11 }}>{r.position ?? "—"}{r.arm ? ` / ${r.arm}` : ""}</td>
                              <td style={{ padding: "10px" }}>
                                {r.triageLabel ? <span style={{ color: r.triageUrgency === "urgent" ? "#fbbf24" : "#34d399", fontSize: 11 }}>{r.triageLabel}</span> : <span style={{ color: T.textMuted }}>—</span>}
                              </td>
                              <td style={{ padding: "10px", color: T.textSub, fontSize: 11 }}>{r.doctorNote ?? "—"}</td>
                            </tr>
                          );
                        })}
                        {readings.length === 0 && (
                          <tr><td colSpan={8} style={{ padding: "20px 10px", color: T.textMuted, textAlign: "center" }}>No readings yet for this patient.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === "readings" && (
                <div style={S.card}>
                  <SectionLabel color="#60a5fa">All readings ({readings.length})</SectionLabel>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
                      <thead>
                        <tr>{["Date & Time","BP (mmHg)","Pulse","MAP","PP","Category","Position","Note"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "7px 10px", color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {[...readings].reverse().map((r, i) => {
                          const cls = classifyBP(r.systolic, r.diastolic);
                          const map = Math.round(r.diastolic + (r.systolic - r.diastolic) / 3);
                          const pp  = r.systolic - r.diastolic;
                          return (
                            <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                              <td style={{ padding: "10px", color: T.textSub, fontSize: 11 }}>
                                {r.recordedAt.toLocaleDateString()}<br />
                                <span style={{ color: T.textMuted, fontSize: 10 }}>{r.recordedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </td>
                              <td style={{ padding: "10px" }}>
                                <span style={{ color: T.sys, fontWeight: 800, fontSize: 16 }}>{r.systolic}</span>
                                <span style={{ color: T.textMuted, margin: "0 3px" }}>/</span>
                                <span style={{ color: T.dia, fontWeight: 700, fontSize: 16 }}>{r.diastolic}</span>
                              </td>
                              <td style={{ padding: "10px", color: T.pulse }}>{r.pulse ? `${r.pulse} bpm` : "—"}</td>
                              <td style={{ padding: "10px", color: T.map }}>{map}</td>
                              <td style={{ padding: "10px", color: "#fbbf24" }}>{pp}</td>
                              <td style={{ padding: "10px" }}><Badge color={cls.text}>{cls.label}</Badge></td>
                              <td style={{ padding: "10px", color: T.textSub, fontSize: 11 }}>{r.position ?? "—"}{r.arm ? ` / ${r.arm}` : ""}</td>
                              <td style={{ padding: "10px", color: T.textMuted, fontSize: 11 }}>{r.doctorNote ?? "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === "medications" && (
                <div style={S.card}>
                  <MedicationsPanel patientId={selectedPatientId} medications={medications} medEvents={medEvents} onUpdate={fetchAll} />
                </div>
              )}

              {tab === "adherence" && (
                <AdherencePanel patientId={selectedPatientId} medications={medications} adherenceLogs={adherenceLogs} onUpdate={fetchAll} />
              )}

              {tab === "alerts" && (
                <div style={S.card}>
                  <AlertsPanel patientId={selectedPatientId} alerts={alerts} onUpdate={fetchAll} />
                </div>
              )}

              {tab === "complications" && (
                <ComplicationsPanel patientId={selectedPatientId} complications={complications} onUpdate={fetchAll} />
              )}

              {tab === "lifestyle" && (
                <div style={S.card}>
                  <LifestylePanel patientId={selectedPatientId} />
                </div>
              )}

              {tab === "labs" && (
                <LabsPanel patientId={selectedPatientId} labs={labs} imaging={imaging} onUpdate={fetchAll} />
              )}

              {tab === "notes" && (
                <ClinicalNotesPanel patientId={selectedPatientId} notes={notes} onUpdate={fetchAll} />
              )}

              {tab === "timeline" && (
                <div style={S.card}>
                  <TimelinePanel events={timelineEvents} />
                </div>
              )}

              {tab === "messages" && (
                <MessagesPanel patientId={selectedPatientId} messages={messages} referrals={referrals} onUpdate={fetchAll} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}