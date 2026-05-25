// components/bp-monitor/AdherenceTracker.tsx
"use client";


import { calculateAdherence } from "@/lib/bpClassification";

interface Props {
  readings: { recordedAt: Date | { toDate: () => Date } }[];
  daysBack?: number;
  expectedPerDay?: number;
}

function AdherenceRing({ percentage }: { percentage: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 80
      ? "#00e676"
      : percentage >= 60
      ? "#ffc107"
      : percentage >= 40
      ? "#ff9800"
      : "#ff1744";

  return (
    <div style={{ position: "relative", width: 110, height: 110 }}>
      <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
        {/* Background track */}
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Progress arc */}
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease",
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: color,
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {percentage}%
        </span>
        <span style={{ color: "#555577", fontSize: 10, marginTop: 2 }}>
          adherence
        </span>
      </div>
    </div>
  );
}

function DailyDot({ count, expected = 2 }: { count: number; expected?: number }) {
  const filled = Math.min(count, expected);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: expected }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background:
              i < filled
                ? "#00e676"
                : "rgba(255,255,255,0.1)",
            border:
              i < filled
                ? "none"
                : "1px solid rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}

export default function AdherenceTracker({
  readings,
  daysBack = 30,
  expectedPerDay = 2,
}: Props) {
  const { percentage, totalLogged, totalExpected, dailyMap } =
    calculateAdherence(readings, daysBack, expectedPerDay);

  const sortedDays = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-daysBack);

  const adherenceLabel =
    percentage >= 80
      ? "Excellent"
      : percentage >= 60
      ? "Good"
      : percentage >= 40
      ? "Poor"
      : "Very Poor";

  const adherenceColor =
    percentage >= 80
      ? "#00e676"
      : percentage >= 60
      ? "#ffc107"
      : percentage >= 40
      ? "#ff9800"
      : "#ff1744";

  return (
    <div>
      {/* Top summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <AdherenceRing percentage={percentage} />

        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              color: adherenceColor,
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {adherenceLabel} Adherence
          </div>
          <div style={{ color: "#666688", fontSize: 13, marginBottom: 12 }}>
            {totalLogged} of {totalExpected} expected readings logged in the
            last {daysBack} days
          </div>

          {/* Bar breakdown */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              height: 8,
              overflow: "hidden",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${adherenceColor}99, ${adherenceColor})`,
                borderRadius: 8,
                transition: "width 1s ease",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#555577", fontSize: 11 }}>0%</span>
            <span
              style={{
                color: "#555577",
                fontSize: 11,
              }}
            >
              Target ≥80%
            </span>
            <span style={{ color: "#555577", fontSize: 11 }}>100%</span>
          </div>
        </div>
      </div>

      {/* Calendar heatmap */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            color: "#555577",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Last {daysBack} Days — Daily Logging
        </div>

        {/* Grid of days */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 28px)",
            gap: 4,
          }}
        >
          {sortedDays.map(([date, count]) => {
            const d = new Date(date);
            const dayLabel = d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const missed = count === 0;
            const partial = count > 0 && count < expectedPerDay;
            const full = count >= expectedPerDay;

            return (
              <div
                key={date}
                title={`${dayLabel}: ${count}/${expectedPerDay} readings`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: missed
                    ? "rgba(255,255,255,0.04)"
                    : partial
                    ? "rgba(255,193,7,0.25)"
                    : "rgba(0,230,118,0.25)",
                  border: missed
                    ? "1px solid rgba(255,255,255,0.06)"
                    : partial
                    ? "1px solid rgba(255,193,7,0.4)"
                    : "1px solid rgba(0,230,118,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "default",
                  fontSize: 9,
                  color: missed
                    ? "#333344"
                    : partial
                    ? "#fcd34d"
                    : "#6ee7b7",
                  fontWeight: 700,
                }}
              >
                {missed ? "" : count}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        {[
          { color: "rgba(0,230,118,0.25)", border: "rgba(0,230,118,0.4)", label: `Full (≥${expectedPerDay} readings)` },
          { color: "rgba(255,193,7,0.25)", border: "rgba(255,193,7,0.4)", label: "Partial (1 reading)" },
          { color: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.06)", label: "Missed (0 readings)" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: item.color,
                border: `1px solid ${item.border}`,
              }}
            />
            <span style={{ color: "#555577", fontSize: 11 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}