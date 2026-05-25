"use client";

import { useState, useEffect, use } from "react";
import { classifyBP, calculateAdherence } from "@/lib/bpClassification";
import BPTrendChart from "@/components/bp-monitor/BPTrendChart";
import MedicationTimeline from "@/components/bp-monitor/MedicationTimeline";
import AdherenceTracker from "@/components/bp-monitor/AdherenceTracker";
import ClinicalAlerts from "@/components/bp-monitor/ClinicalAlerts";
import { db } from "@/lib/firebase"; // your Firebase config
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";

// Types (matching your Firestore documents)
interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  recordedAt: Timestamp;
  patientId: string;
  toolType: string;
}

interface Medication {
  id: string;
  drug: string;
  dose: string;
  startDate: Date;
  endDate?: Date;
  patientId: string;
  prescribedBy?: string;
}

// ─── Data formatting helper ─────────────────────────────────────────────────
function formatReadingsForChart(readings: BPReading[]): ChartPoint[] {
  return readings.map((r) => ({
    date: r.recordedAt.toDate().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    systolic: r.systolic,
    diastolic: r.diastolic,
    pulse: r.pulse,
    source: "bp_monitor",
    category: "",
  }));
}

// ─── Styles (unchanged) ────────────────────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "24px",
};

const SECTION_TITLE_STYLE: React.CSSProperties = {
  color: "#8888a0",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: "16px 20px",
        flex: 1,
        minWidth: 130,
      }}
    >
      <div style={{ color: "#666688", fontSize: 11, marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          color: color ?? "#e2e2f0",
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ color: "#555577", fontSize: 11 }}>{sub}</div>}
    </div>
  );
}

function LoadingPulse() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 8,
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#444466",
        fontSize: 14,
      }}
    >
      <span
        style={{
          display: "inline-block",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        Loading data...
      </span>
    </div>
  );
}

export default function BPMonitorPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const [activeTab, setActiveTab] = useState<
    "overview" | "adherence" | "medications" | "alerts"
  >("overview");

  // State for fetched data
  const [readings, setReadings] = useState<BPReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [loadingMeds, setLoadingMeds] = useState(true);

  // Fetch BP readings from toolReadings
  useEffect(() => {
    if (!patientId) return;

    const fetchReadings = async () => {
      try {
        const q = query(
          collection(db, "toolReadings"),
          where("patientId", "==", patientId),
          where("toolType", "==", "bp_monitor"),
          orderBy("recordedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BPReading[];
        // Reverse to chronological order for the chart
        setReadings(data.reverse());
      } catch (error) {
        console.error("Error fetching BP readings:", error);
      } finally {
        setLoadingReadings(false);
      }
    };

    fetchReadings();
  }, [patientId]);

  // Fetch medications from prescriptions
  useEffect(() => {
    if (!patientId) return;

    const fetchMeds = async () => {
      try {
        const q = query(
          collection(db, "prescriptions"),
          where("patientId", "==", patientId),
          orderBy("startDate", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate?.() ?? new Date(),
          endDate: doc.data().endDate?.toDate?.(),
        })) as Medication[];
        setMedications(data);
      } catch (error) {
        console.error("Error fetching medications:", error);
      } finally {
        setLoadingMeds(false);
      }
    };

    fetchMeds();
  }, [patientId]);

  // Derived data
  const chartData = formatReadingsForChart(readings);
  const latest = readings.length > 0 ? readings[readings.length - 1] : null;
  const latestClass = latest
    ? classifyBP(latest.systolic, latest.diastolic)
    : null;

  const avgSys =
    readings.length > 0
      ? Math.round(
          readings.reduce((a, r) => a + r.systolic, 0) / readings.length
        )
      : 0;
  const avgDia =
    readings.length > 0
      ? Math.round(
          readings.reduce((a, r) => a + r.diastolic, 0) / readings.length
        )
      : 0;

  const { percentage: adherencePct } = calculateAdherence(readings, 30, 2);

  const tabs = [
    { id: "overview", label: "BP Trend", icon: "📈" },
    { id: "medications", label: "Medications", icon: "💊" },
    { id: "adherence", label: "Adherence", icon: "📅" },
    { id: "alerts", label: "Clinical Alerts", icon: "🔔" },
  ] as const;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a12",
        padding: "0 0 60px 0",
        fontFamily:
          "'DM Sans', 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(248,113,113,0.08) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "28px 32px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              color: "#555577",
              fontSize: 12,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Dashboard</span>
            <span>›</span>
            <span>Patients</span>
            <span>›</span>
            <span style={{ color: "#8888a0" }}>BP Monitoring</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  color: "#e2e2f0",
                  fontSize: 26,
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(248,113,113,0.18)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  ❤️
                </span>
                BP Intelligence Panel
              </h1>
              <p style={{ color: "#555577", fontSize: 13, margin: "6px 0 0" }}>
                AMEXAN · Patient {patientId.slice(0, 8)}...
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,230,118,0.08)",
                border: "1px solid rgba(0,230,118,0.2)",
                borderRadius: 8,
                padding: "8px 14px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#00e676",
                  boxShadow: "0 0 8px #00e676",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span
                style={{ color: "#69f0ae", fontSize: 12, fontWeight: 600 }}
              >
                Live monitoring
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px 0" }}>
        {/* Stat Row */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <StatCard
            label="Latest Reading"
            value={
              latest ? `${latest.systolic}/${latest.diastolic}` : "No data"
            }
            sub={latestClass?.label ?? "—"}
            color={latestClass?.textColor ?? "#666688"}
          />
          <StatCard
            label="30-Day Average"
            value={readings.length > 0 ? `${avgSys}/${avgDia}` : "—"}
            sub={
              readings.length > 0
                ? classifyBP(avgSys, avgDia).label
                : "No readings"
            }
            color={
              readings.length > 0
                ? classifyBP(avgSys, avgDia).textColor
                : "#666688"
            }
          />
          <StatCard
            label="Adherence (30d)"
            value={`${adherencePct}%`}
            sub={`${readings.length} readings logged`}
            color={
              adherencePct >= 80
                ? "#69f0ae"
                : adherencePct >= 60
                ? "#fcd34d"
                : "#fca5a5"
            }
          />
          <StatCard
            label="Medications"
            value={`${
              medications.filter((m: Medication) => !m.endDate || m.endDate > new Date())
                .length
            }`}
            sub="active prescriptions"
          />
          <StatCard
            label="Total Readings"
            value={`${readings.length}`}
            sub="all time"
          />
        </div>

        {/* Latest BP Badge */}
        {latestClass && latest && (
          <div
            style={{
              background: latestClass.bgColor,
              border: `1px solid ${latestClass.borderColor}40`,
              borderRadius: 12,
              padding: "14px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: latestClass.color,
                boxShadow: `0 0 10px ${latestClass.color}`,
              }}
            />
            <span
              style={{
                color: latestClass.textColor,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {latestClass.label}
            </span>
            <span style={{ color: "#555577", fontSize: 13 }}>
              {latestClass.description}
            </span>
            <span
              style={{
                marginLeft: "auto",
                padding: "3px 10px",
                borderRadius: 6,
                background: `${latestClass.color}22`,
                border: `1px solid ${latestClass.color}44`,
                color: latestClass.textColor,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              {latestClass.action}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: 4,
            border: "1px solid rgba(255,255,255,0.06)",
            width: "fit-content",
          }}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: active
                    ? "rgba(248,113,113,0.15)"
                    : "transparent",
                  color: active ? "#f87171" : "#555577",
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                  borderBottom: active
                    ? "1px solid rgba(248,113,113,0.3)"
                    : "1px solid transparent",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        {activeTab === "overview" && (
          <div style={CARD_STYLE}>
            <div style={SECTION_TITLE_STYLE}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#f87171",
                  display: "inline-block",
                }}
              />
              Blood Pressure Trend — Last 90 Days
            </div>
            {loadingReadings ? (
              <LoadingPulse />
            ) : (
              <BPTrendChart data={chartData} />
            )}
          </div>
        )}

        {activeTab === "medications" && (
          <div style={CARD_STYLE}>
            <div style={SECTION_TITLE_STYLE}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#a78bfa",
                  display: "inline-block",
                }}
              />
              Medication Timeline
            </div>
            {loadingMeds ? (
              <LoadingPulse />
            ) : (
              <MedicationTimeline medications={medications} />
            )}
          </div>
        )}

        {activeTab === "adherence" && (
          <div style={CARD_STYLE}>
            <div style={SECTION_TITLE_STYLE}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#34d399",
                  display: "inline-block",
                }}
              />
              Patient Adherence — Last 30 Days
            </div>
            {loadingReadings ? (
              <LoadingPulse />
            ) : (
              <AdherenceTracker readings={readings} />
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div style={CARD_STYLE}>
            <div style={SECTION_TITLE_STYLE}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#fbbf24",
                  display: "inline-block",
                }}
              />
              Clinical Intelligence Alerts
            </div>
            {loadingReadings ? (
              <LoadingPulse />
            ) : (
              <ClinicalAlerts
                readings={readings}
                adherencePercent={adherencePct}
              />
            )}
          </div>
        )}

        {/* Bottom preview for overview tab */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {activeTab === "overview" && (
            <div style={CARD_STYLE}>
              <div style={SECTION_TITLE_STYLE}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#fbbf24",
                    display: "inline-block",
                  }}
                />
                Clinical Alerts Summary
              </div>
              <ClinicalAlerts
                readings={readings}
                adherencePercent={adherencePct}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
        }
      `}</style>
    </div>
  );
}

// Type needed for BPTrendChart (must be defined before it's used)
interface ChartPoint {
  date: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  source: string;
  category: string;
}