// components/bp-monitor/MedicationTimeline.tsx
"use client";

import { Medication } from "@/lib/useBPMonitor";

interface Props {
  medications: Medication[];
  startDate?: Date;
  endDate?: Date;
}

const MED_COLORS = [
  { bg: "rgba(96,165,250,0.18)", border: "#60a5fa", text: "#93c5fd" },
  { bg: "rgba(167,139,250,0.18)", border: "#a78bfa", text: "#c4b5fd" },
  { bg: "rgba(52,211,153,0.18)", border: "#34d399", text: "#6ee7b7" },
  { bg: "rgba(251,191,36,0.18)", border: "#fbbf24", text: "#fcd34d" },
  { bg: "rgba(248,113,113,0.18)", border: "#f87171", text: "#fca5a5" },
  { bg: "rgba(236,72,153,0.18)", border: "#ec4899", text: "#f9a8d4" },
];

function getTimelinePercent(date: Date, start: Date, end: Date): number {
  const total = end.getTime() - start.getTime();
  const offset = date.getTime() - start.getTime();
  return Math.max(0, Math.min(100, (offset / total) * 100));
}

export default function MedicationTimeline({
  medications,
  startDate,
  endDate,
}: Props) {
  if (!medications || medications.length === 0) {
    return (
      <div
        style={{ color: "#555577", fontSize: 14, padding: "24px 0" }}
      >
        No medications prescribed
      </div>
    );
  }

  const now = new Date();
  const end = endDate ?? now;

  // Calculate timeline range
  const allStarts = medications.map((m) => m.startDate.getTime());
  const defaultStart = new Date(Math.min(...allStarts));
  // go back a little for visual margin
  defaultStart.setDate(defaultStart.getDate() - 3);
  const start = startDate ?? defaultStart;

  // Group by drug name
  const drugGroups: Record<string, Medication[]> = {};
  medications.forEach((med) => {
    if (!drugGroups[med.drug]) drugGroups[med.drug] = [];
    drugGroups[med.drug].push(med);
  });

  const drugs = Object.keys(drugGroups);

  return (
    <div style={{ padding: "4px 0" }}>
      {/* Timeline header: months */}
      <TimelineHeader start={start} end={end} />

      {/* Drug rows */}
      <div style={{ marginTop: 8 }}>
        {drugs.map((drug, drugIdx) => {
          const meds = drugGroups[drug];
          const color = MED_COLORS[drugIdx % MED_COLORS.length];

          return (
            <div key={drug} style={{ marginBottom: 18 }}>
              {/* Drug name */}
              <div
                style={{
                  color: color.text,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                {drug}
              </div>

              {/* Dose blocks */}
              <div
                style={{
                  position: "relative",
                  height: 32,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {meds.map((med) => {
                  const left = getTimelinePercent(med.startDate, start, end);
                  const right = getTimelinePercent(
                    med.endDate ?? now,
                    start,
                    end
                  );
                  const width = right - left;
                  const isActive = !med.endDate || med.endDate > now;

                  return (
                    <div
                      key={med.id}
                      title={`${med.drug} ${med.dose} — Started ${med.startDate.toLocaleDateString()}${med.endDate ? ` | Ended ${med.endDate.toLocaleDateString()}` : " (active)"}`}
                      style={{
                        position: "absolute",
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 4,
                        height: 24,
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 10,
                        overflow: "hidden",
                        cursor: "default",
                        // Pulse glow if active
                        boxShadow: isActive
                          ? `0 0 8px ${color.border}60`
                          : "none",
                      }}
                    >
                      <span
                        style={{
                          color: color.text,
                          fontSize: 11,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {med.dose}
                        {isActive && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: color.border,
                              marginLeft: 6,
                              verticalAlign: "middle",
                            }}
                          />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          color: "#44445a",
          fontSize: 11,
          marginTop: 12,
          textAlign: "right",
        }}
      >
        ● Active medication &nbsp;|&nbsp; Hover blocks for details
      </p>
    </div>
  );
}

function TimelineHeader({ start, end }: { start: Date; end: Date }) {
  const months: { label: string; left: number }[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);

  while (cursor <= end) {
    const pct =
      ((cursor.getTime() - start.getTime()) /
        (end.getTime() - start.getTime())) *
      100;
    if (pct >= 0 && pct <= 100) {
      months.push({
        label: cursor.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        left: pct,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div style={{ position: "relative", height: 20, marginBottom: 4 }}>
      {months.map((m) => (
        <span
          key={m.label}
          style={{
            position: "absolute",
            left: `${m.left}%`,
            color: "#555577",
            fontSize: 10,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          {m.label}
        </span>
      ))}
    </div>
  );
}