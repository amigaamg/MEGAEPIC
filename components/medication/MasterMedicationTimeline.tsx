"use client";
import { useMemo } from "react";
import { Timestamp } from "firebase/firestore";

interface TimelineEvent {
  id: string;
  date: Date;
  type: "prescribed" | "started" | "dose_increased" | "dose_decreased" | "switched" | "stopped" | "completed" | "side_effect" | "missed_dose" | "refill" | "lab_result";
  medication: string;
  dose: string;
  detail: string;
  by?: string;
  severity?: "normal" | "warning" | "critical";
  outcome?: string;
}

interface Props {
  events: TimelineEvent[];
  patientName: string;
  compact?: boolean;
}

const EVENT_COLORS: Record<string, { bg: string; icon: string; color: string }> = {
  prescribed: { bg: "#3b82f6", icon: "💊", color: "#dbeafe" },
  started: { bg: "#10b981", icon: "▶", color: "#d1fae5" },
  dose_increased: { bg: "#8b5cf6", icon: "↑", color: "#ede9fe" },
  dose_decreased: { bg: "#f59e0b", icon: "↓", color: "#fef3c7" },
  switched: { bg: "#6366f1", icon: "⇄", color: "#e0e7ff" },
  stopped: { bg: "#ef4444", icon: "■", color: "#fee2e2" },
  completed: { bg: "#6b7280", icon: "✓", color: "#f3f4f6" },
  side_effect: { bg: "#f97316", icon: "⚠", color: "#ffedd5" },
  missed_dose: { bg: "#dc2626", icon: "✖", color: "#fef2f2" },
  refill: { bg: "#14b8a6", icon: "🔄", color: "#ccfbf1" },
  lab_result: { bg: "#06b6d4", icon: "🔬", color: "#cffafe" },
};

const toDate = (v: Date | Timestamp | null | undefined): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof (v as any).toDate === "function") return (v as any).toDate();
  return null;
};

const fmtDate = (d: Date | null) =>
  d
    ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const fmtTime = (d: Date | null) =>
  d ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

const fmtFull = (d: Date | null) => (d ? `${fmtDate(d)} ${fmtTime(d)}` : "—");

export default function MasterMedicationTimeline({ events, patientName, compact = false }: Props) {
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    const sorted = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());
    sorted.forEach((ev) => {
      const key = `${ev.date.getFullYear()}-${String(ev.date.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return groups;
  }, [events]);

  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>No medication events yet</div>
        <div style={{ fontSize: 12 }}>The timeline will populate as medications are prescribed and taken</div>
      </div>
    );
  }

  const overallAdherence = useMemo(() => {
    const taken = events.filter((e) => e.type === "started" || e.type === "dose_increased" || e.type === "dose_decreased").length;
    const missed = events.filter((e) => e.type === "missed_dose").length;
    const total = taken + missed;
    return total > 0 ? Math.round((taken / total) * 100) : 100;
  }, [events]);

  const css = `
    .rx-timeline {
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
      position: relative;
    }
    .rx-timeline-line {
      position: absolute;
      left: 28px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, #14b8a6 0%, #0f766e 50%, #0d9488 100%);
    }
    .rx-timeline-item {
      position: relative;
      padding-left: 60px;
      padding-bottom: 20px;
    }
    .rx-timeline-dot {
      position: absolute;
      left: 15px;
      top: 2px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
  `;

  return (
    <div className="rx-timeline">
      <style>{css}</style>

      {/* Header Stats */}
      {!compact && (
        <div style={{
          background: "linear-gradient(135deg,#0f766e,#14b8a6)",
          borderRadius: 16,
          padding: "20px 24px",
          color: "#fff",
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Therapeutic Biography
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
            {patientName} · Medication Timeline
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{events.length}</div>
              <div style={{ fontSize: 10, opacity: 0.75 }}>Total Events</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{overallAdherence}%</div>
              <div style={{ fontSize: 10, opacity: 0.75 }}>Overall Adherence</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>
                {Object.keys(groupedByMonth).length}
              </div>
              <div style={{ fontSize: 10, opacity: 0.75 }}>Months Tracked</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        <div className="rx-timeline-line" />

        {Object.entries(groupedByMonth).map(([monthKey, monthEvents]) => {
          const [year, month] = monthKey.split("-");
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("en-GB", { month: "long", year: "numeric" });

          return (
            <div key={monthKey}>
              <div style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                padding: "8px 0 8px 60px",
                marginBottom: 8,
              }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#0f766e",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: "#ccfbf1",
                  padding: "4px 14px",
                  borderRadius: 999,
                }}>
                  {monthName}
                </span>
              </div>

              {monthEvents.map((ev) => {
                const style = EVENT_COLORS[ev.type] || EVENT_COLORS.prescribed;
                return (
                  <div key={ev.id} className="rx-timeline-item">
                    <div
                      className="rx-timeline-dot"
                      style={{ background: style.bg }}
                      title={ev.type.replace(/_/g, " ")}
                    >
                      <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>
                        {style.icon}
                      </span>
                    </div>

                    <div style={{
                      background: "#fff",
                      borderRadius: 12,
                      border: `1px solid ${ev.severity === "critical" ? "#fecaca" : "#e5e7eb"}`,
                      padding: compact ? "8px 12px" : "12px 16px",
                      boxShadow: ev.severity === "critical" ? "0 0 0 2px #fef2f2" : "0 1px 3px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{
                              fontSize: compact ? 12 : 14,
                              fontWeight: 800,
                              color: "#111827",
                            }}>
                              {ev.medication}
                            </span>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: style.bg,
                              background: style.color,
                              padding: "2px 8px",
                              borderRadius: 999,
                              textTransform: "capitalize",
                            }}>
                              {ev.type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div style={{
                            fontSize: compact ? 11 : 12,
                            color: "#6b7280",
                            marginTop: 2,
                          }}>
                            {ev.detail}
                            {ev.dose && <span style={{ fontWeight: 700 }}> · {ev.dose}</span>}
                          </div>
                          {ev.outcome && (
                            <div style={{
                              marginTop: 4,
                              padding: "4px 10px",
                              background: "#f0fdf9",
                              borderRadius: 6,
                              fontSize: 11,
                              color: "#065f46",
                              display: "inline-block",
                            }}>
                              {ev.outcome}
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: compact ? 10 : 11, fontWeight: 700, color: "#6b7280" }}>
                            {fmtDate(ev.date)}
                          </div>
                          <div style={{ fontSize: 10, color: "#9ca3af" }}>
                            {fmtTime(ev.date)}
                          </div>
                          {ev.by && (
                            <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>
                              {ev.by}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function buildTimelineEvents(prescriptions: any[], adherenceRecords: any[], sideEffects: any[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  prescriptions.forEach((rx) => {
    const startDate = rx.startDate?.toDate ? rx.startDate.toDate() : rx.startDate ? new Date(rx.startDate) : null;
    if (startDate) {
      events.push({
        id: `${rx.id}-start`,
        date: startDate,
        type: "prescribed",
        medication: rx.medicationName || rx.medication || rx.drug || "",
        dose: rx.dose || rx.dosage || "",
        detail: `Prescribed for ${rx.indication || "—"} · ${rx.frequency} · ${rx.route}`,
        by: rx.doctorName || rx.prescribedBy,
      });
    }

    (rx.doseChanges || []).forEach((dc: any, i: number) => {
      const d = dc.date?.toDate ? dc.date.toDate() : dc.date ? new Date(dc.date) : null;
      if (d) {
        const prev = parseFloat(dc.previousDose) || 0;
        const next = parseFloat(dc.newDose) || 0;
        events.push({
          id: `${rx.id}-dose-${i}`,
          date: d,
          type: next > prev ? "dose_increased" : "dose_decreased",
          medication: rx.medicationName || rx.medication || "",
          dose: `${dc.previousDose} → ${dc.newDose}`,
          detail: dc.reason || "Dose adjustment",
          by: dc.changedBy,
        });
      }
    });

    if (rx.switchedTo) {
      const d = rx.switchedTo?.toDate ? rx.switchedTo.toDate() : null;
      if (d) {
        events.push({
          id: `${rx.id}-switch`,
          date: d,
          type: "switched",
          medication: rx.medicationName || rx.medication || "",
          dose: rx.dose || "",
          detail: `Switched to ${rx.switchedTo}`,
          by: rx.stoppedBy,
        });
      }
    }

    const stopDate = rx.actualStopDate?.toDate ? rx.actualStopDate.toDate() : null;
    if (stopDate) {
      events.push({
        id: `${rx.id}-stop`,
        date: stopDate,
        type: "stopped",
        medication: rx.medicationName || rx.medication || "",
        dose: rx.dose || "",
        detail: rx.stopReason || "Discontinued",
        by: rx.stoppedBy,
        severity: rx.stopReason?.toLowerCase().includes("side") || rx.stopReason?.toLowerCase().includes("reaction") ? "warning" : "normal",
      });
    }
  });

  (sideEffects || []).forEach((se) => {
    const d = se.onset?.toDate ? se.onset.toDate() : null;
    if (d) {
      events.push({
        id: `se-${se.id}`,
        date: d,
        type: "side_effect",
        medication: se.medicationName || "",
        dose: "",
        detail: `${se.sideEffect} (${se.severity})`,
        severity: se.severity === "severe" ? "critical" : se.severity === "moderate" ? "warning" : "normal",
      });
    }
  });

  (adherenceRecords || []).forEach((ar) => {
    const totalMissed = ar.totalMissed || 0;
    if (totalMissed > 0) {
      const d = ar.date ? new Date(ar.date + "T00:00:00") : null;
      if (d) {
        events.push({
          id: `missed-${ar.id}`,
          date: d,
          type: "missed_dose",
          medication: "",
          dose: "",
          detail: `${totalMissed} missed dose(s) — ${ar.adherencePercentage}% adherence`,
          severity: (ar.adherencePercentage || 100) < 50 ? "critical" : (ar.adherencePercentage || 100) < 75 ? "warning" : "normal",
        });
      }
    }
  });

  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}
