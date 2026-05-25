"use client";
/**
 * AMEXAN — Clinical Snapshot Panel
 * The doctor's first view of a patient inside the HTN tool.
 * Left: structured clinical record (complaint, HPI, vitals, labs, dx, plan)
 * Right: BP chart + medication timeline side by side
 */

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, Legend,
} from "recharts";
import type {
  Patient, PatientTool, BPEntry, Prescription,
  ClinicalNote, Complication, BPStats,
} from "@/types";
import type { BPChartPoint } from "@/lib/bpStats";
import { bpStatusColor } from "@/lib/bpStats";

interface Props {
  patient:       Patient;
  tool:          PatientTool;
  stats:         BPStats | null;
  bpEntries:     BPEntry[];
  chartData:     (BPChartPoint & { sysAvg?: number; diaAvg?: number })[];
  prescriptions: Prescription[];
  complications: Complication[];
  recentNote:    ClinicalNote | null;
}

export default function ClinicalSnapshot({
  patient, tool, stats, bpEntries, chartData,
  prescriptions, complications, recentNote,
}: Props) {
  const [editingPlan, setEditingPlan] = useState(false);
  const [planText, setPlanText]       = useState(
    recentNote?.plan ?? "1. Continue current medications.\n2. Monitor BP twice daily.\n3. Follow up in 4 weeks."
  );

  const age = new Date().getFullYear() -
    new Date((patient.dob as any)?.toDate?.() ?? patient.dob).getFullYear();

  // medication change events for chart markers
  const medEvents = prescriptions.flatMap(rx => {
    const events: { date: string; label: string }[] = [];
    const sd = (rx.startDate as any)?.toDate?.() ?? new Date(rx.startDate as any);
    events.push({
      date:  sd.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      label: `${rx.drug} started`,
    });
    rx.doseChanges?.forEach(dc => {
      const d = (dc.date as any)?.toDate?.() ?? new Date(dc.date as any);
      events.push({
        date:  d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        label: `${rx.drug}: ${dc.previousDose}→${dc.newDose}`,
      });
    });
    return events;
  });

  const latestEntry = bpEntries[0];
  const latestBPColor = latestEntry
    ? bpStatusColor(latestEntry.status)
    : "#64748b";

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* ══ LEFT — CLINICAL RECORD ══════════════════════════════ */}
      <div style={{
        width: 340, flexShrink: 0,
        borderRight: "1px solid #1e2d3d",
        overflowY: "auto",
        padding: "18px 16px",
      }}>
        {/* Tool assigned badge */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14 }}>🩺</span>
            <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>
              Clinical Snapshot
            </span>
          </div>
          <span style={{ color: "#4a6785", fontSize: 10 }}>
            {tool.assignedAt
              ? new Date((tool.assignedAt as any)?.toDate?.() ?? tool.assignedAt)
                  .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "—"} · Tool Assigned
          </span>
        </div>

        {/* Chief Complaint */}
        <Section title="Chief Complaint">
          <p style={prose}>
            {recentNote?.subjective
              ? recentNote.subjective.slice(0, 160) + (recentNote.subjective.length > 160 ? "…" : "")
              : "Poor blood pressure control despite medication."}
          </p>
        </Section>

        {/* HPI */}
        <Section title="History of Present Illness">
          <p style={prose}>
            {age}-year-old {patient.gender === "male" ? "male" : "female"} with diagnosis of{" "}
            <strong style={{ color: "#cbd5e1" }}>{tool.diagnosis}</strong>.
            {recentNote?.objective
              ? " " + recentNote.objective.slice(0, 120) + "…"
              : " BP has remained poorly controlled. Combination therapy initiated."}
          </p>
        </Section>

        {/* Vitals */}
        <Section title="Examination">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <VitalCard
              label="BP" unit="mmHg"
              value={latestEntry ? `${latestEntry.systolic}/${latestEntry.diastolic}` : "—"}
              color={latestBPColor}
              highlight
            />
            <VitalCard
              label="HR" unit="bpm"
              value={latestEntry?.heartRate ?? "—"}
            />
            <VitalCard label="BMI" unit="kg/m²" value="26.2" />
            <VitalCard label="Weight" unit="kg" value="75" />
          </div>
        </Section>

        {/* Complications */}
        {complications.length > 0 && (
          <Section title="Active Complications">
            {complications.filter(c => c.status === "active").map(c => (
              <div key={c.id} style={{
                display: "flex", gap: 8, marginBottom: 6,
                padding: "7px 10px",
                background: "#450a0a22",
                border: "1px solid #ef444422",
                borderRadius: 7,
              }}>
                <span style={{ color: "#ef4444", fontSize: 13, flexShrink: 0 }}>⚠</span>
                <div>
                  <div style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                  {c.referral && (
                    <div style={{ color: "#64748b", fontSize: 11 }}>Referral: {c.referral}</div>
                  )}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Labs — latest results */}
        <Section title="Latest Labs">
          {MOCK_LATEST_LABS.map(l => (
            <div key={l.name} style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 5, padding: "4px 0",
              borderBottom: "1px solid #1e2d3d11",
            }}>
              <span style={{ color: "#64748b", fontSize: 12 }}>{l.name}</span>
              <span style={{
                color: l.flag === "high" ? "#f59e0b" : l.flag === "critical" ? "#ef4444" : "#94a3b8",
                fontSize: 12, fontWeight: l.flag !== "normal" ? 700 : 400,
              }}>{l.value}</span>
            </div>
          ))}
        </Section>

        {/* Diagnosis */}
        <Section title="Diagnosis">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <DxBadge label={tool.diagnosis} color="#1e3a5f" text="#93c5fd" border="#2563eb44" />
            {complications.filter(c => c.status === "active").map(c => (
              <DxBadge key={c.id} label={c.name} color="#2e1065" text="#c4b5fd" border="#7c3aed44" />
            ))}
          </div>
        </Section>

        {/* Active Medications */}
        <Section title="Active Medications">
          {prescriptions.map(rx => (
            <div key={rx.id} style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 6, padding: "6px 10px",
              background: "#131e2b", borderRadius: 6,
              border: "1px solid #1e2d3d",
            }}>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{rx.drug}</div>
                <div style={{ color: "#4a6785", fontSize: 10 }}>{rx.drugClass}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#93c5fd", fontSize: 12, fontWeight: 700 }}>{rx.dose}</div>
                <div style={{ color: "#4a6785", fontSize: 10 }}>{rx.frequency}</div>
              </div>
            </div>
          ))}
        </Section>

        {/* Plan */}
        <Section title="Current Plan">
          {editingPlan ? (
            <div>
              <textarea
                value={planText}
                onChange={e => setPlanText(e.target.value)}
                rows={6}
                style={{
                  width: "100%", background: "#0f1923",
                  border: "1px solid #2563eb44", borderRadius: 7,
                  color: "#e2e8f0", padding: "8px 10px",
                  fontSize: 12, resize: "vertical", lineHeight: 1.6,
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => setEditingPlan(false)} style={saveBtn}>
                  Save Plan
                </button>
                <button onClick={() => setEditingPlan(false)} style={cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingPlan(true)}
              title="Click to edit plan"
              style={{ cursor: "pointer" }}
            >
              {planText.split("\n").filter(Boolean).map((line, i) => (
                <div key={i} style={{
                  display: "flex", gap: 7, marginBottom: 6,
                  fontSize: 12, color: "#94a3b8",
                }}>
                  <span style={{ color: "#3b82f6", fontWeight: 700, flexShrink: 0 }}>•</span>
                  <span>{line.replace(/^\d+\.\s*/, "")}</span>
                </div>
              ))}
              <div style={{ color: "#334e68", fontSize: 10, marginTop: 6 }}>
                ✏️ Click to edit plan
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* ══ RIGHT — CHARTS ══════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>

        {/* Summary stat cards */}
        {stats && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10, marginBottom: 18,
          }}>
            {[
              {
                label: "Latest BP",
                value: `${stats.latestSystolic}/${stats.latestDiastolic}`,
                unit: "mmHg",
                color: bpStatusColor(
                  stats.latestSystolic >= 180 ? "crisis" :
                  stats.latestSystolic >= 160 ? "high" :
                  stats.latestSystolic > 130  ? "elevated" : "controlled"
                ),
              },
              { label: "30-day avg",   value: `${stats.avg30daySystolic}/${stats.avg30dayDiastolic}`, unit: "mmHg", color: "#e2e8f0" },
              { label: "In target",    value: `${stats.pctInTarget}%`, unit: `of readings`, color: stats.pctInTarget >= 70 ? "#10b981" : "#f59e0b" },
              { label: "Trend",        value: stats.trend, unit: `${stats.totalReadings} readings`, color: stats.trend === "improving" ? "#10b981" : stats.trend === "worsening" ? "#ef4444" : "#64748b" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#131e2b", border: "1px solid #1e2d3d",
                borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {s.label}
                </div>
                <div style={{ color: s.color, fontWeight: 800, fontSize: 20, marginTop: 4, fontVariantNumeric: "tabular-nums", textTransform: "capitalize" }}>
                  {s.value}
                </div>
                <div style={{ color: "#4a6785", fontSize: 10 }}>{s.unit}</div>
              </div>
            ))}
          </div>
        )}

        {/* BP Chart */}
        <div style={{
          background: "#131e2b", border: "1px solid #1e2d3d",
          borderRadius: 12, padding: "16px 18px", marginBottom: 16,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 12,
          }}>
            <div>
              <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>
                ❤️ Blood Pressure & Medication Timeline
              </div>
              <div style={{ color: "#4a6785", fontSize: 11, marginTop: 2 }}>
                Target {tool.targetBP} · medication changes shown as ▲
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData.slice(-20)} margin={{ top: 8, right: 60, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#4a6785", fontSize: 10 }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[60, 200]}
                tick={{ fill: "#4a6785", fontSize: 10 }}
                axisLine={false} tickLine={false}
                label={{ value: "mmHg", angle: -90, position: "insideLeft", fill: "#4a6785", fontSize: 9, dy: 20 }}
              />
              <Tooltip content={<BPTooltip />} />

              {/* Target band */}
              <ReferenceArea
                y1={tool.alertThresholds.diastolicTarget}
                y2={tool.alertThresholds.systolicTarget}
                fill="#10b981" fillOpacity={0.06}
              />
              <ReferenceLine
                y={tool.alertThresholds.systolicTarget}
                stroke="#10b981" strokeDasharray="5 3" strokeWidth={1}
                label={{ value: `Target ${tool.alertThresholds.systolicTarget}`, position: "right", fill: "#10b981", fontSize: 9 }}
              />
              <ReferenceLine
                y={tool.alertThresholds.systolicWarning}
                stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.4}
              />
              <ReferenceLine
                y={tool.alertThresholds.systolicCritical}
                stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} strokeOpacity={0.3}
              />

              {/* Medication markers */}
              {medEvents.map((ev, i) => (
                <ReferenceLine
                  key={i} x={ev.date}
                  stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3"
                  label={{ value: "▲", position: "insideTopRight", fill: "#f59e0b", fontSize: 11 }}
                />
              ))}

              <Line
                type="monotone" dataKey="systolic" name="Systolic"
                stroke="#ef4444" strokeWidth={2.5}
                dot={(props: any) => <BPDot {...props} />}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone" dataKey="diastolic" name="Diastolic"
                stroke="#3b82f6" strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone" dataKey="sysAvg" name="7d avg SBP"
                stroke="#ef4444" strokeWidth={1} strokeDasharray="5 3"
                dot={false} strokeOpacity={0.45}
              />
              <Legend
                formatter={v => <span style={{ color: "#64748b", fontSize: 11 }}>{v}</span>}
                iconSize={8}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Chart legend row */}
          <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 10, color: "#4a6785", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ color: "#f59e0b" }}>▲</span> Med change
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ display: "inline-block", width: 14, height: 2, background: "#10b981", borderRadius: 1 }} />
              Target {tool.targetBP}
            </span>
            {[
              { color: "#10b981", label: "Controlled" },
              { color: "#f59e0b", label: "Elevated" },
              { color: "#f97316", label: "High" },
              { color: "#ef4444", label: "Crisis" },
            ].map(l => (
              <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, display: "inline-block" }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Medication Timeline */}
        <MedicationTimeline prescriptions={prescriptions} />

        {/* Most recent note summary */}
        {recentNote && (
          <div style={{
            background: "#131e2b", border: "1px solid #1e2d3d",
            borderRadius: 12, padding: "14px 16px", marginTop: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                📝 Latest Clinical Note
              </div>
              <span style={{ color: "#4a6785", fontSize: 11 }}>
                {new Date((recentNote.visitDate as any)?.toDate?.() ?? recentNote.visitDate)
                  .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            {[
              { label: "A", color: "#f59e0b", text: recentNote.assessment },
              { label: "P", color: "#c084fc", text: recentNote.plan },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 8 }}>
                <span style={{
                  color: s.color, fontWeight: 700, fontSize: 10,
                  textTransform: "uppercase", letterSpacing: 0.5,
                  marginRight: 6,
                }}>{s.label}</span>
                <span style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>
                  {s.text?.slice(0, 200)}{s.text?.length > 200 ? "…" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MEDICATION TIMELINE COMPONENT
// ─────────────────────────────────────────────────────────────

function MedicationTimeline({ prescriptions }: { prescriptions: Prescription[] }) {
  // Jan 2026 → May 2026 = 5 months
  const MONTHS = ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"];

  const parsePct = (dateStr: string | any): number => {
    const d = (dateStr as any)?.toDate?.() ?? new Date(dateStr);
    const month = d.getMonth(); // 0=Jan
    const day   = d.getDate();
    const base  = ((month - 0) / 5) * 100; // Jan=0%, May=80%
    const dayFraction = (day / 31) * (100 / 5);
    return Math.min(Math.max(base + dayFraction, 0), 100);
  };

  const DRUG_COLORS: Record<string, string> = {
    "CCB":                                  "#3b82f6",
    "ARB":                                  "#10b981",
    "ACEi":                                 "#10b981",
    "Thiazide":                             "#f59e0b",
    "Carbonic Anhydrase Inhibitor (Eye Drops)": "#8b5cf6",
    "default":                              "#64748b",
  };

  const getColor = (drugClass: string) => DRUG_COLORS[drugClass] ?? DRUG_COLORS["default"];

  return (
    <div style={{
      background: "#131e2b", border: "1px solid #1e2d3d",
      borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        🕐 Medication Timeline
      </div>

      {/* Month headers */}
      <div style={{ display: "flex", marginBottom: 6, paddingLeft: 100 }}>
        {MONTHS.map(m => (
          <div key={m} style={{
            flex: 1, fontSize: 9, color: "#334e68",
            textAlign: "center", letterSpacing: 0.3,
          }}>{m}</div>
        ))}
      </div>

      {/* Drug rows */}
      {prescriptions.map(rx => {
        const color     = getColor(rx.drugClass);
        const startPct  = parsePct(rx.startDate);
        const endPct    = rx.stopDate ? parsePct(rx.stopDate) : 100;
        const widthPct  = endPct - startPct;

        // Build phases from dose changes
        const phases: { start: number; end: number; dose: string }[] = [];
        const changes = [...(rx.doseChanges ?? [])].sort((a, b) =>
          new Date((a.date as any)?.toDate?.() ?? a.date).getTime() -
          new Date((b.date as any)?.toDate?.() ?? b.date).getTime()
        );

        if (changes.length === 0) {
          phases.push({ start: startPct, end: endPct, dose: rx.dose });
        } else {
          // Phase 1: original dose → first change
          phases.push({ start: startPct, end: parsePct(changes[0].date), dose: changes[0].previousDose });
          // Middle phases
          for (let i = 0; i < changes.length - 1; i++) {
            phases.push({ start: parsePct(changes[i].date), end: parsePct(changes[i + 1].date), dose: changes[i].newDose });
          }
          // Last phase
          phases.push({ start: parsePct(changes[changes.length - 1].date), end: endPct, dose: changes[changes.length - 1].newDose });
        }

        return (
          <div key={rx.id} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            {/* Drug name */}
            <div style={{ width: 100, flexShrink: 0 }}>
              <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 12 }}>{rx.drug}</div>
              <div style={{ color: "#4a6785", fontSize: 10 }}>{rx.drugClass}</div>
            </div>

            {/* Timeline bar */}
            <div style={{ flex: 1, position: "relative", height: 28 }}>
              {/* Grid lines */}
              {MONTHS.map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  left: `${(i / 5) * 100}%`,
                  top: 0, bottom: 0,
                  width: 1, background: "#1e2d3d",
                }} />
              ))}

              {/* Dose phase bars */}
              {phases.map((ph, pi) => {
                const w = ph.end - ph.start;
                if (w <= 0) return null;
                return (
                  <div key={pi} style={{
                    position: "absolute",
                    left: `${ph.start}%`,
                    width: `${w}%`,
                    top: 4, height: 20,
                    background: color + "25",
                    border: `1px solid ${color}66`,
                    borderRadius: 4,
                    display: "flex", alignItems: "center",
                    paddingLeft: 6, overflow: "hidden",
                    fontSize: 10, color, fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {w > 8 ? ph.dose : ""}
                  </div>
                );
              })}

              {/* Dose change markers */}
              {changes.map((dc, ci) => {
                const pct = parsePct(dc.date);
                return (
                  <div key={ci} title={`${dc.previousDose} → ${dc.newDose}: ${dc.reason}`} style={{
                    position: "absolute",
                    left: `${pct}%`,
                    top: 0, bottom: 0,
                    width: 2, background: "#f59e0b",
                    cursor: "help",
                  }} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CUSTOM CHART COMPONENTS
// ─────────────────────────────────────────────────────────────

function BPDot(props: any) {
  const { cx, cy, payload } = props;
  const color   = bpStatusColor(payload.status);
  const isCrisis = payload.status === "crisis";
  return (
    <g>
      {isCrisis && <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.15} />}
      <circle cx={cx} cy={cy} r={isCrisis ? 5 : 3.5}
        fill={color} stroke="#0c1520" strokeWidth={1.5} />
    </g>
  );
}

function BPTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sys = payload.find((p: any) => p.dataKey === "systolic")?.value;
  const dia = payload.find((p: any) => p.dataKey === "diastolic")?.value;
  const pt  = payload[0]?.payload as BPChartPoint;
  return (
    <div style={{
      background: "#1e2a3a", border: "1px solid #2d3f55",
      borderRadius: 8, padding: "10px 14px", fontSize: 12,
    }}>
      <div style={{ color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ color: "#ef4444", fontWeight: 800, fontSize: 18 }}>
        {sys} <span style={{ color: "#4a6785", fontSize: 13 }}>/</span>{" "}
        <span style={{ color: "#3b82f6" }}>{dia}</span>
        <span style={{ color: "#64748b", fontSize: 11, marginLeft: 4 }}>mmHg</span>
      </div>
      {pt?.heartRate && <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3 }}>HR: {pt.heartRate} bpm</div>}
      {pt?.notes     && <div style={{ color: "#64748b",  fontSize: 11, marginTop: 3 }}>📝 {pt.notes}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        color: "#60a5fa", fontSize: 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 0.8,
        marginBottom: 7,
      }}>{title}</div>
      {children}
    </div>
  );
}

function VitalCard({ label, value, unit, highlight, color }: {
  label: string; value: string | number | undefined;
  unit: string; highlight?: boolean; color?: string;
}) {
  return (
    <div style={{
      background: highlight ? "#1c1f3a" : "#131e2b",
      border: `1px solid ${highlight ? "#ef444433" : "#1e2d3d"}`,
      borderRadius: 8, padding: "9px 11px",
    }}>
      <div style={{ color: "#4a6785", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{
        color: color ?? (highlight ? "#ef4444" : "#e2e8f0"),
        fontWeight: 700,
        fontSize: highlight ? 19 : 15,
        marginTop: 2,
        fontVariantNumeric: "tabular-nums",
      }}>{value ?? "—"}</div>
      <div style={{ color: "#4a6785", fontSize: 9 }}>{unit}</div>
    </div>
  );
}

function DxBadge({ label, color, text, border }: { label: string; color: string; text: string; border: string }) {
  return (
    <span style={{
      background: color, color: text, border: `1px solid ${border}`,
      borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 600,
    }}>{label}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────────────────────────

const prose: React.CSSProperties = {
  color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: 0,
};

const saveBtn: React.CSSProperties = {
  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#fff", border: "none", borderRadius: 7,
  padding: "8px 16px", fontWeight: 600, fontSize: 12, cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  background: "transparent", border: "1px solid #1e2d3d",
  color: "#64748b", borderRadius: 7,
  padding: "8px 12px", fontSize: 12, cursor: "pointer",
};

// ─────────────────────────────────────────────────────────────
// MOCK LATEST LABS (replace with real data from useDashboard)
// ─────────────────────────────────────────────────────────────

const MOCK_LATEST_LABS = [
  { name: "Creatinine",  value: "1.1 mg/dL",         flag: "normal" },
  { name: "eGFR",        value: "82 mL/min/1.73m²",  flag: "normal" },
  { name: "Potassium",   value: "4.6 mmol/L",         flag: "normal" },
  { name: "LDL",         value: "3.2 mmol/L",         flag: "high"   },
  { name: "HbA1c",       value: "5.8%",               flag: "high"   },
  { name: "Fasting Glu", value: "98 mg/dL",           flag: "normal" },
];