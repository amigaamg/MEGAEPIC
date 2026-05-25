"use client";
import { useRouter } from "next/navigation";

interface Complication { name?: string; }
interface Props {
  patientId: string;
  activeTool: string;
  complications: Complication[];
}

export default function ToolTabs({ patientId, activeTool, complications }: Props) {
  const router = useRouter();
  const tools = [
    { id: "hypertension", label: "Hypertension", icon: "❤️" },
    { id: "diabetes", label: "Diabetes", icon: "🩸" },
    { id: "asthma", label: "Asthma", icon: "🫁" },
  ];

  return (
    <div style={{
      display: "flex", gap: 0,
      background: "#111c27", borderBottom: "1px solid #1e2d3d",
      padding: "0 16px", flexShrink: 0,
    }}>
      {tools.map(t => {
        const isActive = activeTool === t.id;
        return (
          <button key={t.id} onClick={() => router.push(`/dashboard/doctor/patient/${patientId}/tools/${t.id}`)} style={{
            padding: "10px 18px", background: "none", border: "none",
            borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
            color: isActive ? "#60a5fa" : "#4a6785",
            fontWeight: isActive ? 600 : 400,
            fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            transition: "color 0.15s",
          }}>
            {t.icon} {t.label}
          </button>
        );
      })}
      {complications.length > 0 && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#f59e0b" }}>
          ⚠️ {complications.length} complication{complications.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
