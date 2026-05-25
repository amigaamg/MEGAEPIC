"use client";

import { useMemo } from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";

interface ChartPoint {
  date: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  source?: string;
  category?: string;
}

interface Props {
  data: ChartPoint[];
}

export default function BPTrendChart({ data }: Props) {
  const stats = useMemo(() => {
    if (!data.length) return null;
    const sys = data.map(d => d.systolic);
    const dia = data.map(d => d.diastolic);
    return {
      avgSys: Math.round(sys.reduce((a, b) => a + b, 0) / sys.length),
      avgDia: Math.round(dia.reduce((a, b) => a + b, 0) / dia.length),
      maxSys: Math.max(...sys),
      minSys: Math.min(...sys),
      lastReading: data[data.length - 1],
    };
  }, [data]);

  if (!data.length) {
    return (
      <div style={{
        height: 300, display: "flex", alignItems: "center", justifyContent: "center",
        color: "#555577", fontSize: 14, flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontSize: 36 }}>📊</div>
        <div>No BP readings available</div>
        <div style={{ fontSize: 12, color: "#444466" }}>Start monitoring to see your trend</div>
      </div>
    );
  }

  const targetSys = 130;
  const targetDia = 80;

  return (
    <div>
      {stats && (
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          {[
            { label: "Avg Systolic", value: stats.avgSys, color: stats.avgSys > targetSys ? "#f87171" : "#69f0ae" },
            { label: "Avg Diastolic", value: stats.avgDia, color: stats.avgDia > targetDia ? "#f87171" : "#69f0ae" },
            { label: "Max Systolic", value: stats.maxSys, color: "#fca5a5" },
            { label: "Min Systolic", value: stats.minSys, color: "#93c5fd" },
            { label: "Latest", value: `${stats.lastReading.systolic}/${stats.lastReading.diastolic}`, color: "#c4b5fd" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#555577", fontSize: 10, marginBottom: 4 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 800, fontFamily: "monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="#444466" tick={{ fontSize: 11 }} />
          <YAxis domain={[60, 200]} stroke="#444466" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#13131f", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, color: "#e2e2f0", fontSize: 12,
            }}
            labelStyle={{ color: "#8888a0", fontWeight: 700 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8888a0" }} />
          <ReferenceLine y={targetSys} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} label={{ value: "SYS target", fill: "#f59e0b", fontSize: 10 }} />
          <ReferenceLine y={targetDia} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} label={{ value: "DIA target", fill: "#f59e0b", fontSize: 10 }} />
          <Area type="monotone" dataKey="systolic" fill="rgba(248,113,113,0.08)" stroke="transparent" />
          <Line type="monotone" dataKey="systolic" stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: "#f87171", strokeWidth: 0 }} name="Systolic" />
          <Line type="monotone" dataKey="diastolic" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }} name="Diastolic" />
          {data[0]?.pulse && (
            <Line type="monotone" dataKey="pulse" stroke="#34d399" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Pulse" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
