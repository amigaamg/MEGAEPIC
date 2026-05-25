"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HTNPanel } from "@/app/dashboard/doctor/patient/[patientId]/tools/hypertension/page";

interface Props {
  activePanel:       HTNPanel;
  onPanelChange:     (p: HTNPanel) => void;
  activeAlertCount:  number;
  criticalCount:     number;
  pendingLabCount:   number;
  upcomingVisitCount:number;
  onLogBP:           () => void;
}

export default function HTNSidebar({
  activePanel, onPanelChange, activeAlertCount,
  criticalCount, pendingLabCount, upcomingVisitCount, onLogBP,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const w = collapsed ? 56 : 216;

  const NAV: {
    section?: string;
    items: { id: HTNPanel | string; label: string; icon: string; badge?: number; action?: () => void; isLink?: string }[];
  }[] = [
    {
      items: [
        { id: "dashboard-home", label: "Dashboard", icon: "⬜", isLink: "/dashboard/doctor" },
      ]
    },
    {
      section: "HTN Tool",
      items: [
        { id: "snapshot",      label: "Clinical Snapshot",  icon: "🩺" },
        { id: "bp",            label: "BP Monitoring",       icon: "❤️",  badge: criticalCount || undefined },
        { id: "prescriptions", label: "Prescriptions",       icon: "💊" },
        { id: "followups",     label: "Follow-Ups",          icon: "📅",  badge: upcomingVisitCount || undefined },
        { id: "notes",         label: "Clinical Notes",      icon: "📝" },
        { id: "labs",          label: "Lab Orders",          icon: "🧪",  badge: pendingLabCount || undefined },
        { id: "imaging",       label: "Imaging",             icon: "🫀" },
        { id: "messaging",     label: "Messaging",           icon: "✉️" },
        { id: "settings",      label: "Tool Settings",       icon: "⚙️" },
      ]
    },
    {
      section: "Patient Portal",
      items: [
        { id: "log-bp",   label: "Log BP Reading", icon: "➕", action: onLogBP },
        { id: "book",     label: "Book Appointment", icon: "📆" },
      ]
    },
  ];

  return (
    <aside style={{
      width: w, minHeight: "100vh", background: "#0f1923",
      borderRight: "1px solid #1e2d3d",
      display: "flex", flexDirection: "column",
      transition: "width 0.2s ease", flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* Brand */}
      <div style={{
        padding: collapsed ? "16px 12px" : "16px", height: 64,
        borderBottom: "1px solid #1e2d3d",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg,#06b6d4,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>❤️</div>
        {!collapsed && (
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 1, fontFamily: "Georgia, serif" }}>AMEXAN</div>
            <div style={{ color: "#334e68", fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase" }}>Clinical Monitoring</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            marginLeft: "auto", background: "none", border: "none",
            color: "#334e68", cursor: "pointer", fontSize: 12, padding: 2,
            flexShrink: 0,
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto", overflowX: "hidden" }}>
        {NAV.map((group, gi) => (
          <div key={gi}>
            {group.section && !collapsed && (
              <div style={{
                color: "#334e68", fontSize: 9, fontWeight: 700,
                letterSpacing: 1, textTransform: "uppercase",
                padding: "12px 14px 4px",
              }}>
                {group.section}
              </div>
            )}
            {group.items.map(item => {
              const isActive = item.id === activePanel;
              const handleClick = () => {
                if (item.action) { item.action(); return; }
                if (item.isLink) { router.push(item.isLink); return; }
                onPanelChange(item.id as HTNPanel);
              };

              return (
                <button key={item.id} onClick={handleClick} style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 8, padding: collapsed ? "10px 0" : "9px 14px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: isActive ? "linear-gradient(90deg,#1e3a5f,#172d4a)" : "transparent",
                  borderLeft: `3px solid ${isActive ? "#3b82f6" : "transparent"}`,
                  border: "none",
                  color: isActive ? "#93c5fd" : "#4a6785",
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.12s",
                  position: "relative",
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "#7cb9e8"; e.currentTarget.style.background = "#12202e"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "#4a6785"; e.currentTarget.style.background = "transparent"; }}}
                title={collapsed ? item.label : undefined}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span style={{
                          background: "#ef4444", color: "#fff",
                          borderRadius: "99px", fontSize: 9, fontWeight: 700,
                          padding: "1px 5px", lineHeight: 1.5,
                        }}>{item.badge}</span>
                      )}
                    </>
                  )}
                  {/* Collapsed badge dot */}
                  {collapsed && item.badge && item.badge > 0 && (
                    <span style={{
                      position: "absolute", top: 6, right: 6,
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#ef4444",
                    }}/>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* PDF button */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid #1e2d3d" }}>
        <button style={{
          width: "100%", padding: "9px 0",
          background: "linear-gradient(135deg,#1e3a5f,#1a4d7c)",
          border: "1px solid #2563eb33", borderRadius: 8,
          color: "#93c5fd", fontWeight: 600, fontSize: 11,
          cursor: "pointer",
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 6, paddingLeft: collapsed ? 0 : 10,
        }}>
          <span style={{ fontSize: 13 }}>📄</span>
          {!collapsed && "Generate PDF"}
        </button>
      </div>
    </aside>
  );
}