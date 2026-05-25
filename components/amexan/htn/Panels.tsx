/**
 * AMEXAN — Remaining HTN Tool Panel Components
 *
 * FollowUpScheduler   — schedule visits, mark attended/missed, view timeline
 * ClinicalNotes       — SOAP notes with cross-linking
 * LabOrders           — order labs, view results, trend charts
 * ImagingOrders       — request imaging, view reports
 * PatientMessaging    — doctor → patient instructions + alerts
 * ToolSettings        — per-patient alert thresholds + monitoring config
 */

"use client";
import { useState } from "react";
import type { FollowUp, ClinicalNote, LabOrder, ImagingOrder, PatientTool, Patient, Prescription } from "@/types";

// ─────────────────────────────────────────────────────────────
// FOLLOW-UP SCHEDULER
// ─────────────────────────────────────────────────────────────

export function FollowUpScheduler({
  toolId, patientId, doctorId, followUps, attendanceRate,
  notes, onSchedule, onMarkAttended, onMarkMissed,
}: {
  toolId: string; patientId: string; doctorId: string;
  followUps: FollowUp[]; attendanceRate: number; notes: ClinicalNote[];
  onSchedule: (data: any) => Promise<any>;
  onMarkAttended: (id: string) => Promise<void>;
  onMarkMissed: (id: string, reason?: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", time: "09:00", type: "clinic", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const sorted = [...followUps].sort((a, b) => {
    const ad = (a.scheduledDate as any)?.toDate?.() ?? new Date(a.scheduledDate as any);
    const bd = (b.scheduledDate as any)?.toDate?.() ?? new Date(b.scheduledDate as any);
    return bd.getTime() - ad.getTime();
  });

  const handleSchedule = async () => {
    if (!form.date) return;
    setSubmitting(true);
    try {
      const dt = new Date(`${form.date}T${form.time}`);
      await onSchedule({ scheduledDate: dt, type: form.type, notes: form.notes, scheduledBy: doctorId });
      setForm({ date: "", time: "09:00", type: "clinic", notes: "" });
      setShowForm(false);
    } finally { setSubmitting(false); }
  };

  const statusDot = (s: string) => ({
    attended: "#10b981", missed: "#64748b", scheduled: "#3b82f6", cancelled: "#334e68",
  }[s] ?? "#64748b");

  const statusIcon = (s: string) => ({
    attended: "✓", missed: "✗", scheduled: "○", cancelled: "—",
  }[s] ?? "?");

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>📅 Follow-Up Scheduler</div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
            Attendance rate: <strong style={{ color: attendanceRate >= 80 ? "#10b981" : "#f59e0b" }}>{attendanceRate}%</strong>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
          border: "none", borderRadius: 8, padding: "10px 18px",
          fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>+ Schedule Visit</button>
      </div>

      {showForm && (
        <div style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={IS} />
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                style={IS} />
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={IS}>
                <option value="clinic">Clinic Visit</option>
                <option value="phone">Phone Call</option>
                <option value="virtual">Virtual</option>
                <option value="home_visit">Home Visit</option>
              </select>
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Notes</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Visit purpose..." style={IS} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSchedule} disabled={!form.date || submitting} style={{
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
              border: "none", borderRadius: 8, padding: "10px 20px",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              opacity: !form.date || submitting ? 0.5 : 1,
            }}>{submitting ? "Scheduling..." : "Confirm Visit"}</button>
            <button onClick={() => setShowForm(false)} style={{
              background: "transparent", border: "1px solid #1e2d3d", color: "#64748b",
              borderRadius: 8, padding: "10px 14px", fontSize: 13, cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, padding: 20 }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 2, background: "#1e2d3d" }} />
          {sorted.map((fu, i) => {
            const d = statusDot(fu.status);
            const date = (fu.scheduledDate as any)?.toDate?.() ?? new Date(fu.scheduledDate as any);
            const linkedNote = notes.find(n => n.id === fu.linkedNoteId);
            return (
              <div key={fu.id} style={{ display: "flex", gap: 14, marginBottom: 20, position: "relative" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: d + "22", border: `2px solid ${d}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: d, fontSize: 13, fontWeight: 700, zIndex: 1,
                }}>{statusIcon(fu.status)}</div>
                <div style={{ flex: 1, paddingTop: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>
                      {date.toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"long", year:"numeric" })}
                    </span>
                    <span style={{
                      background: d + "22", color: d, border: `1px solid ${d}44`,
                      borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700, textTransform: "capitalize",
                    }}>{fu.status}</span>
                    <span style={{ color: "#4a6785", fontSize: 11, textTransform: "capitalize" }}>{fu.type.replace("_"," ")}</span>
                  </div>
                  {fu.notes && <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>{fu.notes}</div>}
                  {linkedNote && (
                    <div style={{ color: "#60a5fa", fontSize: 11, marginTop: 3 }}>
                      📝 {linkedNote.assessment.slice(0, 80)}...
                    </div>
                  )}
                  {/* Action buttons for scheduled */}
                  {fu.status === "scheduled" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={() => onMarkAttended(fu.id)} style={{
                        padding: "4px 12px", borderRadius: 5, fontSize: 11, fontWeight: 600,
                        background: "#022c22", border: "1px solid #10b98133", color: "#34d399", cursor: "pointer",
                      }}>✓ Mark Attended</button>
                      <button onClick={() => onMarkMissed(fu.id)} style={{
                        padding: "4px 12px", borderRadius: 5, fontSize: 11,
                        background: "#1e2d3d", border: "1px solid #1e2d3d", color: "#64748b", cursor: "pointer",
                      }}>✗ Mark Missed</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CLINICAL NOTES
// ─────────────────────────────────────────────────────────────

export function ClinicalNotes({
  toolId, patientId, doctorId, notes, prescriptions, followUps, labs, onAddNote,
}: {
  toolId: string; patientId: string; doctorId: string;
  notes: ClinicalNote[]; prescriptions: Prescription[];
  followUps: FollowUp[]; labs: LabOrder[];
  onAddNote: (data: any) => Promise<any>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "visit", subjective: "", objective: "", assessment: "", plan: "", bpAtVisit: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(notes[0]?.id ?? null);

  const handleAdd = async () => {
    if (!form.subjective || !form.assessment) return;
    setSubmitting(true);
    try {
      await onAddNote({ ...form, toolId, patientId, doctorId, visitDate: new Date(), isLocked: false,
        vitals: form.bpAtVisit ? { bp: form.bpAtVisit } : undefined });
      setForm({ type: "visit", subjective: "", objective: "", assessment: "", plan: "", bpAtVisit: "" });
      setShowForm(false);
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>📝 Clinical Notes (SOAP)</div>
        <button onClick={() => setShowForm(v => !v)} style={{
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
          border: "none", borderRadius: 8, padding: "10px 18px",
          fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>+ New Note</button>
      </div>

      {showForm && (
        <div style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Note type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={IS}>
                <option value="visit">Clinic Visit</option>
                <option value="phone">Phone Call</option>
                <option value="lab_review">Lab Review</option>
                <option value="medication_change">Medication Change</option>
                <option value="complication">Complication</option>
              </select>
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>BP at visit</label>
              <input value={form.bpAtVisit} onChange={e => setForm(f => ({ ...f, bpAtVisit: e.target.value }))}
                placeholder="e.g. 138/88" style={IS} />
            </div>
          </div>
          {[
            { key: "subjective",  label: "S — Subjective (patient's complaints, history)" },
            { key: "objective",   label: "O — Objective (exam findings, vitals, labs)" },
            { key: "assessment",  label: "A — Assessment (diagnosis, clinical impression)" },
            { key: "plan",        label: "P — Plan (treatment, follow-up, orders)" },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>{label} *</label>
              <textarea value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                rows={3} style={{ ...IS, resize: "vertical", lineHeight: 1.5 }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleAdd} disabled={submitting || !form.subjective || !form.assessment} style={{
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
              border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer",
              opacity: submitting || !form.subjective || !form.assessment ? 0.5 : 1,
            }}>{submitting ? "Saving..." : "Save Note"}</button>
            <button onClick={() => setShowForm(false)} style={{
              background: "transparent", border: "1px solid #1e2d3d",
              color: "#64748b", borderRadius: 8, padding: "10px 14px", fontSize: 13, cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
        {/* Note list */}
        <div style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, overflow: "hidden" }}>
          {notes.map(n => (
            <button key={n.id} onClick={() => setActiveNote(n.id)} style={{
              width: "100%", padding: "12px 14px", background: activeNote === n.id ? "#1e3a5f" : "transparent",
              border: "none", borderBottom: "1px solid #1e2d3d", cursor: "pointer",
              textAlign: "left",
            }}>
              <div style={{ color: activeNote === n.id ? "#93c5fd" : "#94a3b8", fontWeight: 600, fontSize: 12 }}>
                {new Date((n.visitDate as any)?.toDate?.() ?? n.visitDate)
                  .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2, textTransform: "capitalize" }}>{n.type.replace("_"," ")}</div>
              {n.vitals?.bp && <div style={{ color: "#4a6785", fontSize: 10, marginTop: 1 }}>BP: {n.vitals.bp}</div>}
            </button>
          ))}
        </div>

        {/* Note detail */}
        {activeNote && (() => {
          const note = notes.find(n => n.id === activeNote);
          if (!note) return null;
          return (
            <div style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>
                    {new Date((note.visitDate as any)?.toDate?.() ?? note.visitDate)
                      .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                    {note.type.replace("_"," ")} · {note.isLocked ? "🔒 Locked" : "✏️ Editable"}
                  </div>
                </div>
                {note.vitals?.bp && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#64748b", fontSize: 10 }}>BP at visit</div>
                    <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 18 }}>{note.vitals.bp}</div>
                  </div>
                )}
              </div>
              {[
                { label: "S — Subjective", content: note.subjective, color: "#60a5fa" },
                { label: "O — Objective",  content: note.objective,  color: "#34d399" },
                { label: "A — Assessment", content: note.assessment, color: "#f59e0b" },
                { label: "P — Plan",       content: note.plan,       color: "#c084fc" },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 14 }}>
                  <div style={{ color: s.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{s.content}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LAB ORDERS
// ─────────────────────────────────────────────────────────────

const HTN_LAB_PANELS = [
  { label: "Renal Function", tests: ["Creatinine", "eGFR", "Urea", "Sodium", "Potassium"] },
  { label: "Metabolic", tests: ["HbA1c", "Fasting Glucose", "Lipid Profile"] },
  { label: "Urine", tests: ["Urine ACR", "Urine M/C/S"] },
  { label: "Cardiac", tests: ["BNP/NT-proBNP", "Troponin"] },
  { label: "Aldosterone Screen", tests: ["Aldosterone", "Renin", "Aldosterone:Renin Ratio"] },
];

export function LabOrders({ toolId, patientId, doctorId, orders, onOrderLabs }: {
  toolId: string; patientId: string; doctorId: string;
  orders: LabOrder[]; onOrderLabs: (tests: string[], priority: any, indication: string) => Promise<any>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [priority, setPriority] = useState<"routine" | "urgent" | "stat">("routine");
  const [indication, setIndication] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleTest = (t: string) => setSelected(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);
  const addPanel   = (tests: string[]) => setSelected(s => [...new Set([...s, ...tests])]);

  const handleOrder = async () => {
    if (!selected.length || !indication) return;
    setSubmitting(true);
    try {
      await onOrderLabs(selected, priority, indication);
      setSelected([]); setIndication(""); setShowForm(false);
    } finally { setSubmitting(false); }
  };

  const flagColor = (flag: string) => ({ normal: "#10b981", low: "#3b82f6", high: "#f59e0b", critical: "#ef4444" }[flag] ?? "#64748b");

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>🧪 Lab Orders</div>
        <button onClick={() => setShowForm(v => !v)} style={{
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
          border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>+ Order Labs</button>
      </div>

      {showForm && (
        <div style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ color: "#64748b", fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Quick Panels</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {HTN_LAB_PANELS.map(p => (
              <button key={p.label} onClick={() => addPanel(p.tests)} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 11,
                background: "#1e3a5f", border: "1px solid #2563eb44", color: "#93c5fd", cursor: "pointer",
              }}>+ {p.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {[...new Set(HTN_LAB_PANELS.flatMap(p => p.tests))].map(t => (
              <button key={t} onClick={() => toggleTest(t)} style={{
                padding: "4px 10px", borderRadius: 5, fontSize: 11,
                background: selected.includes(t) ? "#10b98122" : "transparent",
                border: `1px solid ${selected.includes(t) ? "#10b981" : "#1e2d3d"}`,
                color: selected.includes(t) ? "#10b981" : "#4a6785", cursor: "pointer",
              }}>{selected.includes(t) ? "✓ " : ""}{t}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as any)} style={IS}>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Indication *</label>
              <input value={indication} onChange={e => setIndication(e.target.value)}
                placeholder="Clinical reason..." style={IS} />
            </div>
          </div>
          {selected.length > 0 && (
            <div style={{ marginBottom: 12, fontSize: 12, color: "#94a3b8" }}>
              Selected: {selected.join(", ")}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleOrder} disabled={!selected.length || !indication || submitting} style={{
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
              border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer",
              opacity: !selected.length || !indication || submitting ? 0.5 : 1,
            }}>{submitting ? "Ordering..." : `Order ${selected.length} Test${selected.length !== 1 ? "s" : ""}`}</button>
            <button onClick={() => setShowForm(false)} style={{
              background: "transparent", border: "1px solid #1e2d3d",
              color: "#64748b", borderRadius: 8, padding: "10px 14px", fontSize: 13, cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      )}

      {orders.map(order => (
        <div key={order.id} style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{order.tests.join(", ")}</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{order.indication}</div>
              <div style={{ color: "#4a6785", fontSize: 11, marginTop: 2 }}>
                Ordered: {new Date((order.orderedAt as any)?.toDate?.() ?? order.orderedAt)
                  .toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{
                padding: "3px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                background: order.priority === "stat" ? "#45100a" : order.priority === "urgent" ? "#451a03" : "#1e2d3d",
                color: order.priority === "stat" ? "#ef4444" : order.priority === "urgent" ? "#f59e0b" : "#64748b",
                border: `1px solid ${order.priority === "stat" ? "#ef444433" : order.priority === "urgent" ? "#f59e0b33" : "transparent"}`,
              }}>{order.priority}</span>
              <span style={{
                padding: "3px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, textTransform: "capitalize",
                background: order.status === "reviewed" ? "#022c22" : order.status === "resulted" ? "#1e3a5f" : "#1e2d3d",
                color: order.status === "reviewed" ? "#10b981" : order.status === "resulted" ? "#60a5fa" : "#f59e0b",
              }}>{order.status}</span>
            </div>
          </div>
          {order.results && order.results.length > 0 && (
            <div style={{ borderTop: "1px solid #1e2d3d" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#0f1923" }}>
                    {["Test","Value","Reference","Flag"].map(h => (
                      <th key={h} style={{ padding: "6px 14px", textAlign: "left", color: "#4a6785", fontSize: 10, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.results.map((r, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #1e2d3d" }}>
                      <td style={{ padding: "7px 14px", color: "#94a3b8" }}>{r.test}</td>
                      <td style={{ padding: "7px 14px", color: flagColor(r.flag), fontWeight: r.flag !== "normal" ? 700 : 400 }}>
                        {r.value} {r.unit}
                      </td>
                      <td style={{ padding: "7px 14px", color: "#4a6785" }}>{r.referenceRange}</td>
                      <td style={{ padding: "7px 14px" }}>
                        <span style={{
                          color: flagColor(r.flag), fontSize: 10, fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: 0.5,
                        }}>{r.flag !== "normal" ? r.flag.toUpperCase() : "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {order.reviewNotes && (
                <div style={{ padding: "10px 14px", borderTop: "1px solid #1e2d3d", color: "#94a3b8", fontSize: 12 }}>
                  📝 {order.reviewNotes}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IMAGING ORDERS
// ─────────────────────────────────────────────────────────────

export function ImagingOrders({ toolId, patientId, doctorId }: { toolId: string; patientId: string; doctorId: string }) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>🫀 Imaging Orders</div>
      <div style={{ color: "#64748b", fontSize: 13, background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, padding: 32, textAlign: "center" }}>
        Imaging orders panel — uses same pattern as Lab Orders.<br/>
        Modalities: Echocardiogram · CXR · Renal Ultrasound · Fundoscopy · CT
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PATIENT MESSAGING
// ─────────────────────────────────────────────────────────────

export function PatientMessaging({ patientId, doctorId, patient }: { patientId: string; doctorId: string; patient: Patient }) {
  const [form, setForm] = useState({ subject: "", body: "", type: "instruction", priority: "normal" });
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    if (!form.subject || !form.body) return;
    setSubmitting(true);
    try {
      await fetch("/api/amexan/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, patientId, doctorId }),
      });
      setForm({ subject: "", body: "", type: "instruction", priority: "normal" });
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>✉️ Message to {patient.name}</div>
      <div style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 12, padding: 20, maxWidth: 600 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={IS}>
              <option value="instruction">Clinical Instruction</option>
              <option value="alert">Urgent Alert</option>
              <option value="result">Lab Result Summary</option>
              <option value="reminder">Appointment Reminder</option>
              <option value="general">General Message</option>
            </select>
          </div>
          <div>
            <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={IS}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Subject *</label>
          <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder="Message subject..." style={IS} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 5 }}>Message *</label>
          <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={6} placeholder={`Dear ${patient.name.split(" ")[0]},\n\n...`}
            style={{ ...IS, resize: "vertical", lineHeight: 1.6 }} />
        </div>
        <button onClick={handleSend} disabled={!form.subject || !form.body || submitting} style={{
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
          border: "none", borderRadius: 8, padding: "11px 24px", fontWeight: 600, fontSize: 13, cursor: "pointer",
          opacity: !form.subject || !form.body || submitting ? 0.5 : 1,
        }}>{submitting ? "Sending..." : "📤 Send to Patient"}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TOOL SETTINGS
// ─────────────────────────────────────────────────────────────

export function ToolSettings({ tool, onUpdateThresholds }: {
  tool: PatientTool; onUpdateThresholds: (t: PatientTool["alertThresholds"]) => Promise<void>;
}) {
  const [thresholds, setThresholds] = useState(tool.alertThresholds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof thresholds, value: number) =>
    setThresholds(t => ({ ...t, [key]: value }));

  const save = async () => {
    setSaving(true);
    try { await onUpdateThresholds(thresholds); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    finally { setSaving(false); }
  };

  const fields: { key: keyof typeof thresholds; label: string; desc: string; unit?: string }[] = [
    { key:"systolicCritical",          label:"SBP Crisis threshold",    desc:"Alert + SMS fired above this", unit:"mmHg" },
    { key:"diastolicCritical",         label:"DBP Crisis threshold",    desc:"Alert + SMS fired above this", unit:"mmHg" },
    { key:"systolicWarning",           label:"SBP Warning threshold",   desc:"Warning alert above this",     unit:"mmHg" },
    { key:"systolicTarget",            label:"SBP Treatment target",    desc:"Used for control calculations",unit:"mmHg" },
    { key:"diastolicTarget",           label:"DBP Treatment target",    desc:"Used for control calculations",unit:"mmHg" },
    { key:"adherenceLow",              label:"Adherence alert threshold",desc:"Alert below this adherence %", unit:"%" },
    { key:"bpReadingGapDays",          label:"BP reading gap alert",    desc:"Alert if no reading for N days",unit:"days" },
    { key:"uncontrolledReadingsCount", label:"Uncontrolled pattern count",desc:"Readings above target to trigger warning",unit:"readings" },
    { key:"uncontrolledReadingsDays",  label:"Uncontrolled pattern window",desc:"Window for above count check",unit:"days" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>⚙️ HTN Tool Settings</div>
      <div style={{ color: "#64748b", fontSize: 12, marginBottom: 20 }}>
        Customise alert thresholds and monitoring parameters for this patient.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, maxWidth: 900 }}>
        {fields.map(f => (
          <div key={f.key} style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 10, padding: 16 }}>
            <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
            <div style={{ color: "#64748b", fontSize: 11, marginBottom: 10 }}>{f.desc}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" value={thresholds[f.key]}
                onChange={e => update(f.key, Number(e.target.value))}
                style={{ ...IS, width: 80 }} />
              {f.unit && <span style={{ color: "#64748b", fontSize: 12 }}>{f.unit}</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <button onClick={save} disabled={saving} style={{
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
          border: "none", borderRadius: 8, padding: "11px 24px", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// Shared input style
const IS: React.CSSProperties = {
  width: "100%", background: "#0f1923", border: "1px solid #1e2d3d",
  borderRadius: 8, color: "#e2e8f0", padding: "9px 12px", fontSize: 13,
  outline: "none", boxSizing: "border-box",
};