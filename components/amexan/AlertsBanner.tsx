"use client";
import { useState } from "react";

interface SystemAlert {
  id: string;
  severity?: string;
  title?: string;
  detail?: string;
  icon?: string;
}

interface Props {
  alerts: SystemAlert[];
  onAcknowledge: (id: string) => Promise<void>;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  urgent: "#f59e0b",
  warning: "#3b82f6",
  info: "#64748b",
};

export default function AlertsBanner({ alerts, onAcknowledge }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = alerts.filter(a => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 16px 0", flexShrink: 0 }}>
      {visible.map(alert => {
        const color = SEVERITY_COLORS[alert.severity || "info"] || "#64748b";
        return (
          <div key={alert.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 10,
            background: `${color}15`, border: `1px solid ${color}30`,
            fontSize: 13, color: "#e2e8f0",
          }}>
            <span style={{ fontSize: 18 }}>{alert.icon || "🔔"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color }}>{alert.title || "Alert"}</div>
              {alert.detail && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{alert.detail}</div>}
            </div>
            <button onClick={async () => {
              await onAcknowledge(alert.id);
              setDismissed(prev => new Set(prev).add(alert.id));
            }} style={{
              background: `${color}30`, color: "#e2e8f0", border: `1px solid ${color}40`,
              borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>
              Dismiss
            </button>
          </div>
        );
      })}
    </div>
  );
}
