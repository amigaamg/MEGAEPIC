"use client";
import { useState } from "react";

interface Prescription {
  id?: string;
  drug?: string;
  medication?: string;
  dose?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string | { toDate: () => Date };
  endDate?: string | { toDate: () => Date };
  status?: string;
  instructions?: string;
}

interface BPEntry {
  id?: string;
  systolic: number;
  diastolic: number;
  recordedAt?: any;
}

interface Props {
  toolId: string;
  patientId: string;
  doctorId: string;
  active: Prescription[];
  stopped: Prescription[];
  bpEntries: BPEntry[];
  onPrescribe: (rx: Partial<Prescription>) => Promise<void>;
  onAdjustDose: (id: string, newDose: string, reason: string, doctorId: string) => Promise<void>;
  onStopDrug: (id: string) => Promise<void>;
}

export default function PrescriptionManager({ toolId, patientId, doctorId, active, stopped, bpEntries, onPrescribe, onAdjustDose, onStopDrug }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("OD");
  const [saving, setSaving] = useState(false);

  const handlePrescribe = async () => {
    if (!drug || !dose) return;
    setSaving(true);
    await onPrescribe({ drug, medication: drug, dose, dosage: dose, frequency, startDate: new Date().toISOString() });
    setDrug(""); setDose(""); setFrequency("OD");
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700, margin: 0 }}>💊 Prescription Manager</h3>
        <button onClick={() => setShowForm(v => !v)} style={{
          padding: "8px 16px", background: showForm ? "#4a6785" : "#3b82f6", color: "#fff",
          border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          {showForm ? "Cancel" : "+ New Prescription"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#131e2b", borderRadius: 12, border: "1px solid #1e2d3d", padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: "block", fontSize: 12, color: "#4a6785", marginBottom: 4 }}>Drug Name</label>
              <input value={drug} onChange={e => setDrug(e.target.value)} placeholder="e.g. Amlodipine" style={{
                width: "100%", padding: "10px 14px", background: "#0f1923",
                border: "1px solid #1e2d3d", borderRadius: 8, color: "#e2e8f0", fontSize: 13, outline: "none",
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, color: "#4a6785", marginBottom: 4 }}>Dose</label>
              <input value={dose} onChange={e => setDose(e.target.value)} placeholder="5mg" style={{
                width: "100%", padding: "10px 14px", background: "#0f1923",
                border: "1px solid #1e2d3d", borderRadius: 8, color: "#e2e8f0", fontSize: 13, outline: "none",
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, color: "#4a6785", marginBottom: 4 }}>Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{
                width: "100%", padding: "10px 14px", background: "#0f1923",
                border: "1px solid #1e2d3d", borderRadius: 8, color: "#e2e8f0", fontSize: 13, outline: "none",
              }}>
                <option value="OD">Once daily</option>
                <option value="BD">Twice daily</option>
                <option value="TDS">Three times daily</option>
                <option value="QHS">At bedtime</option>
              </select>
            </div>
          </div>
          <button onClick={handlePrescribe} disabled={saving || !drug || !dose} style={{
            padding: "10px 24px", background: saving ? "#4a6785" : "#34d399", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? "default" : "pointer",
          }}>
            {saving ? "Saving..." : "💾 Prescribe"}
          </button>
        </div>
      )}

      {active.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: "#34d399", fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Active Prescriptions ({active.length})</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {active.map(rx => (
              <div key={rx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#131e2b", borderRadius: 10, border: "1px solid #1e2d3d" }}>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{rx.drug || rx.medication || "Unknown"}</div>
                  <div style={{ color: "#4a6785", fontSize: 12, marginTop: 2 }}>{rx.dose || rx.dosage} · {rx.frequency}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {rx.id && <button onClick={() => onStopDrug(rx.id!)} style={{ padding: "4px 10px", background: "#ef444420", color: "#ef4444", border: "1px solid #ef444430", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Stop</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stopped.length > 0 && (
        <div>
          <h4 style={{ color: "#4a6785", fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Stopped ({stopped.length})</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stopped.map(rx => (
              <div key={rx.id} style={{ padding: "10px 16px", background: "#0f1923", borderRadius: 8, opacity: 0.6 }}>
                <div style={{ color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>{rx.drug || rx.medication || "Unknown"}</div>
                <div style={{ color: "#4a6785", fontSize: 11 }}>{rx.dose || rx.dosage} · {rx.frequency} — Ended {rx.endDate ? new Date(typeof rx.endDate === 'object' && 'toDate' in rx.endDate ? rx.endDate.toDate() : rx.endDate as string).toLocaleDateString() : ""}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
