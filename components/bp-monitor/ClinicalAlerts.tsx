// components/bp-monitor/ClinicalAlerts.tsx
"use client";


import { classifyBP, detectPatterns } from "@/lib/bpClassification";

interface Props {
  readings: { systolic: number; diastolic: number; recordedAt: Date | { toDate: () => Date }; source?: string }[];
  adherencePercent: number;
}

interface Alert {
  level: "critical" | "warning" | "info" | "good";
  icon: string;
  title: string;
  detail: string;
}

function buildAlerts(readings: { systolic: number; diastolic: number; recordedAt: Date | { toDate: () => Date }; source?: string }[], adherencePercent: number): Alert[] {
  const alerts: Alert[] = [];

  if (readings.length === 0) {
    alerts.push({
      level: "info",
      icon: "📊",
      title: "No readings yet",
      detail: "BP readings will appear here once logged by the patient.",
    });
    return alerts;
  }

  const latest = readings[readings.length - 1];
  const latestClass = classifyBP(latest.systolic, latest.diastolic);

  // ─── Latest BP ───────────────────────────────────────────────────────────────
  if (latestClass.category === "crisis") {
    alerts.push({
      level: "critical",
      icon: "🚨",
      title: `Hypertensive Crisis: ${latest.systolic}/${latest.diastolic} mmHg`,
      detail:
        "Immediate clinical evaluation required. Consider IV antihypertensive therapy if symptomatic.",
    });
  } else if (latestClass.category === "stage2") {
    alerts.push({
      level: "warning",
      icon: "⚠️",
      title: `Stage 2 HTN: ${latest.systolic}/${latest.diastolic} mmHg`,
      detail:
        "BP above target. Review current antihypertensive regimen — consider dose increase or addition of another agent.",
    });
  } else if (latestClass.category === "stage1") {
    alerts.push({
      level: "warning",
      icon: "🟡",
      title: `Stage 1 HTN: ${latest.systolic}/${latest.diastolic} mmHg`,
      detail:
        "BP elevated. Lifestyle modification reinforced. Consider adding low-dose medication if no improvement in 3 months.",
    });
  } else if (latestClass.category === "normal") {
    alerts.push({
      level: "good",
      icon: "✅",
      title: `BP Well Controlled: ${latest.systolic}/${latest.diastolic} mmHg`,
      detail: "Latest reading within target range. Continue current management.",
    });
  }

  // ─── Average over last 5 ──────────────────────────────────────────────────
  if (readings.length >= 5) {
    const last5 = readings.slice(-5);
    const avgSys = Math.round(
      last5.reduce((a, r) => a + r.systolic, 0) / last5.length
    );
    const avgDia = Math.round(
      last5.reduce((a, r) => a + r.diastolic, 0) / last5.length
    );
    const avgClass = classifyBP(avgSys, avgDia);
    if (
      avgClass.category !== "normal" &&
      avgClass.category !== latestClass.category
    ) {
      alerts.push({
        level: "info",
        icon: "📈",
        title: `Average (last 5): ${avgSys}/${avgDia} mmHg — ${avgClass.label}`,
        detail:
          "Rolling average suggests persistent elevation. Assess medication adherence and secondary causes.",
      });
    }
  }

  // ─── Adherence ───────────────────────────────────────────────────────────────
  if (adherencePercent < 40) {
    alerts.push({
      level: "critical",
      icon: "📵",
      title: `Very poor adherence: ${adherencePercent}%`,
      detail:
        "Patient is logging fewer than 40% of expected readings. BP data insufficient for reliable assessment. Engage patient.",
    });
  } else if (adherencePercent < 60) {
    alerts.push({
      level: "warning",
      icon: "📉",
      title: `Low adherence: ${adherencePercent}%`,
      detail:
        "Patient missing over 40% of BP monitoring. Counsel on importance of regular logging.",
    });
  } else if (adherencePercent >= 80) {
    alerts.push({
      level: "good",
      icon: "👍",
      title: `Good adherence: ${adherencePercent}%`,
      detail: "Patient is consistently logging BP readings.",
    });
  }

  // ─── Pattern detection ───────────────────────────────────────────────────────
  const patterns = detectPatterns(readings);
  patterns.forEach((p) => {
    alerts.push({
      level: "warning",
      icon: "🔬",
      title: "Pattern Detected",
      detail: p,
    });
  });

  // ─── Trend (last 10) ─────────────────────────────────────────────────────────
  if (readings.length >= 10) {
    const firstHalf = readings.slice(-10, -5);
    const secondHalf = readings.slice(-5);
    const avg1 =
      firstHalf.reduce((a, r) => a + r.systolic, 0) / firstHalf.length;
    const avg2 =
      secondHalf.reduce((a, r) => a + r.systolic, 0) / secondHalf.length;
    const delta = Math.round(avg2 - avg1);
    if (delta >= 10) {
      alerts.push({
        level: "warning",
        icon: "📊",
        title: `BP trending upward (+${delta} mmHg systolic over last 10 readings)`,
        detail:
          "Progressive elevation noted. Review for medication non-adherence, lifestyle factors, or white-coat effect.",
      });
    } else if (delta <= -10) {
      alerts.push({
        level: "good",
        icon: "📉",
        title: `BP improving (${delta} mmHg systolic over last 10 readings)`,
        detail: "Positive trend. Continue current treatment strategy.",
      });
    }
  }

  return alerts;
}

const levelStyles = {
  critical: {
    bg: "rgba(255,23,68,0.08)",
    border: "#ff1744",
    iconBg: "rgba(255,23,68,0.18)",
    titleColor: "#ff6b8a",
    tag: "CRITICAL",
    tagBg: "rgba(255,23,68,0.25)",
    tagColor: "#ff1744",
  },
  warning: {
    bg: "rgba(255,152,0,0.07)",
    border: "#ff9800",
    iconBg: "rgba(255,152,0,0.18)",
    titleColor: "#ffb74d",
    tag: "ALERT",
    tagBg: "rgba(255,152,0,0.25)",
    tagColor: "#ff9800",
  },
  info: {
    bg: "rgba(96,165,250,0.07)",
    border: "#60a5fa",
    iconBg: "rgba(96,165,250,0.18)",
    titleColor: "#93c5fd",
    tag: "INFO",
    tagBg: "rgba(96,165,250,0.25)",
    tagColor: "#60a5fa",
  },
  good: {
    bg: "rgba(0,230,118,0.07)",
    border: "#00e676",
    iconBg: "rgba(0,230,118,0.18)",
    titleColor: "#69f0ae",
    tag: "GOOD",
    tagBg: "rgba(0,230,118,0.25)",
    tagColor: "#00e676",
  },
};

export default function ClinicalAlerts({ readings, adherencePercent }: Props) {
  const alerts = buildAlerts(readings, adherencePercent);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {alerts.map((alert, i) => {
        const s = levelStyles[alert.level];
        return (
          <div
            key={i}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}30`,
              borderLeft: `3px solid ${s.border}`,
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: s.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {alert.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: s.titleColor,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {alert.title}
                </span>
                <span
                  style={{
                    padding: "1px 7px",
                    borderRadius: 4,
                    background: s.tagBg,
                    color: s.tagColor,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.tag}
                </span>
              </div>
              <p
                style={{
                  color: "#666688",
                  fontSize: 12,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {alert.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}