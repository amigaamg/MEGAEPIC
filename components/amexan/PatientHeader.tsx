"use client";
import { formatDistanceToNow } from "date-fns";

interface Patient { id?: string; name?: string; age?: number; gender?: string; }
interface PatientTool { targetBP?: string; monitoringFrequency?: string; }
interface FollowUp { scheduledDate?: any; }
interface BPStats { avg7daySystolic?: number; avg7dayDiastolic?: number; totalReadings?: number; }

interface Props {
  patient: Patient;
  tool: PatientTool;
  nextFollowUp: FollowUp | null;
  stats: BPStats | null;
  onNewBP: () => void;
}

export default function PatientHeader({ patient, tool, nextFollowUp, stats, onNewBP }: Props) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f1923 0%, #1a2a3a 100%)",
      borderBottom: "1px solid #1e2d3d",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "#fff",
        }}>
          {patient?.name?.[0] || "?"}
        </div>
        <div>
          <h2 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, margin: 0 }}>
            {patient?.name || "Unknown Patient"}
            {patient?.age && <span style={{ color: "#64748b", fontWeight: 400, marginLeft: 8, fontSize: 14 }}>{patient.age}y {patient?.gender || ""}</span>}
          </h2>
          <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 12, color: "#64748b" }}>
            <span>🎯 Target: {tool?.targetBP || "<130/80"}</span>
            <span>📊 {stats?.avg7daySystolic && stats?.avg7dayDiastolic ? `7d Avg: ${stats.avg7daySystolic}/${stats.avg7dayDiastolic}` : "No data"}</span>
            {nextFollowUp && <span>📅 Next: {formatDistanceToNow(nextFollowUp.scheduledDate?.toDate?.() || new Date(), { addSuffix: true })}</span>}
          </div>
        </div>
      </div>
      <button onClick={onNewBP} style={{
        background: "#3b82f6", color: "#fff", border: "none",
        borderRadius: 8, padding: "8px 16px", fontSize: 13,
        fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
      }}>
        ❤️ Log BP Reading
      </button>
    </div>
  );
}
