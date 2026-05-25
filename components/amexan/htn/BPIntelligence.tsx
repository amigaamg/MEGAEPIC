"use client";
import { useState, useMemo } from "react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer,
  Brush, Legend,
} from "recharts";

interface BPEntry { id?: string; systolic: number; diastolic: number; recordedAt?: any; }
interface BPChartPoint { date: string; systolic: number; diastolic: number; }
interface Prescription { id?: string; drug?: string; dose?: string; }
interface Thresholds { systolicCritical?: number; diastolicCritical?: number; systolicTarget?: number; diastolicTarget?: number; }

interface Props {
  toolId: string;
  patientId: string;
  entries: BPEntry[];
  chartData: BPChartPoint[];
  stats: import("@/types").BPStats | null;
  thresholds: Thresholds | null;
  prescriptions: Prescription[];
  onLogBP: (entry: Partial<BPEntry>) => Promise<void>;
  doctorId?: string;
}

export default function BPIntelligence({ toolId, patientId, entries, chartData, stats, thresholds, prescriptions, onLogBP, doctorId }: Props) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [saving, setSaving] = useState(false);

  const avgSys = stats?.avg7daySystolic || 0;
  const avgDia = stats?.avg7dayDiastolic || 0;
  const controlRate = stats?.pctInTarget || 0;
  const targetSys = thresholds?.systolicTarget || 130;
  const targetDia = thresholds?.diastolicTarget || 80;

  const handleLog = async () => {
    if (!systolic || !diastolic) return;
    setSaving(true);
    await onLogBP({ systolic: Number(systolic), diastolic: Number(diastolic) });
    setSystolic("");
    setDiastolic("");
    setSaving(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Average BP", value: avgSys ? `${avgSys}/${avgDia}` : "—", sub: "mmHg", color: avgSys > targetSys ? "#ef4444" : "#34d399" },
          { label: "Control Rate", value: `${controlRate}%`, sub: `${entries.length} readings`, color: controlRate >= 70 ? "#34d399" : controlRate >= 50 ? "#f59e0b" : "#ef4444" },
          { label: "Total Readings", value: `${entries.length}`, sub: "all time", color: "#60a5fa" },
          { label: "Active Meds", value: `${prescriptions.filter(p => !p.drug || true).length}`, sub: "prescriptions", color: "#a78bfa" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#131e2b", borderRadius: 12, border: "1px solid #1e2d3d", padding: "14px 18px" }}>
            <div style={{ color: "#4a6785", fontSize: 11, marginBottom: 4 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.value}</div>
            <div style={{ color: "#4a6785", fontSize: 11 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#131e2b", borderRadius: 12, border: "1px solid #1e2d3d", padding: 20, marginBottom: 20 }}>
        <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          📈 BP Trend
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
              <XAxis dataKey="date" stroke="#4a6785" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 220]} stroke="#4a6785" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f1923", border: "1px solid #1e2d3d", borderRadius: 8 }} />
              <ReferenceLine y={targetSys} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Target ${targetSys}`, fill: "#f59e0b", fontSize: 11 }} />
              <ReferenceLine y={targetDia} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Target ${targetDia}`, fill: "#f59e0b", fontSize: 11 }} />
              <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#4a6785" }}>
            No readings yet. Log your first BP reading above.
          </div>
        )}
      </div>

      <div style={{ background: "#131e2b", borderRadius: 12, border: "1px solid #1e2d3d", padding: 20 }}>
        <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ❤️ Log New BP Reading
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#4a6785", marginBottom: 4 }}>Systolic (mmHg)</label>
            <input type="number" value={systolic} onChange={e => setSystolic(e.target.value)} placeholder="120" style={{
              padding: "10px 14px", background: "#0f1923", border: "1px solid #1e2d3d",
              borderRadius: 8, color: "#e2e8f0", fontSize: 14, width: 120, outline: "none",
            }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#4a6785", marginBottom: 4 }}>Diastolic (mmHg)</label>
            <input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} placeholder="80" style={{
              padding: "10px 14px", background: "#0f1923", border: "1px solid #1e2d3d",
              borderRadius: 8, color: "#e2e8f0", fontSize: 14, width: 120, outline: "none",
            }} />
          </div>
          <button onClick={handleLog} disabled={saving || !systolic || !diastolic} style={{
            padding: "10px 20px", background: saving ? "#4a6785" : "#3b82f6", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? "default" : "pointer",
          }}>
            {saving ? "Saving..." : "💾 Save Reading"}
          </button>
        </div>
      </div>
    </div>
  );
}
