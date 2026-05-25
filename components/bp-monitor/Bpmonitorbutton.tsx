// ─────────────────────────────────────────────────────────────────────────────
// Drop this button into both the Patient Dashboard and Doctor Dashboard.
// It opens the full AMEXAN BP Intelligence Panel for the given patient.
//
// Usage in Patient Dashboard:
//   <BPMonitorButton patientId={currentUser.uid} variant="patient" />
//
// Usage in Doctor Dashboard (patient row / patient detail page):
//   <BPMonitorButton patientId={selectedPatient.id} variant="doctor" />
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { classifyBP } from "@/lib/bpClassification";
import { db } from "@/lib/firebase"; // adjust to your Firebase config
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

interface Props {
  patientId: string;
  variant?: "patient" | "doctor";
  compact?: boolean; // Use compact version for tables/lists
}

interface BPReading {
  systolic: number;
  diastolic: number;
  recordedAt: any; // Firestore Timestamp
}

export function BPMonitorButton({
  patientId,
  variant = "doctor",
  compact = false,
}: Props) {
  const [latest, setLatest] = useState<BPReading | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const fetchLatestReading = async () => {
      try {
        const q = query(
          collection(db, "toolReadings"),
          where("patientId", "==", patientId),
          where("toolType", "==", "bp_monitor"),
          orderBy("recordedAt", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setLatest(snapshot.docs[0].data() as BPReading);
        } else {
          setLatest(null);
        }
      } catch (error) {
        console.error("Error fetching latest BP reading:", error);
        setLatest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReading();
  }, [patientId]);

  const cls = latest ? classifyBP(latest.systolic, latest.diastolic) : null;
  const href = `/dashboard/bp-monitor/${patientId}`;

  if (compact) {
    return (
      <Link
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(248,113,113,0.1)",
          border: "1px solid rgba(248,113,113,0.25)",
          color: "#f87171",
          fontSize: 12,
          fontWeight: 600,
          textDecoration: "none",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background =
            "rgba(248,113,113,0.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background =
            "rgba(248,113,113,0.1)";
        }}
      >
        ❤️ BP Monitor
        {cls && latest && (
          <span
            style={{
              padding: "1px 6px",
              borderRadius: 4,
              background: cls.bgColor,
              border: `1px solid ${cls.borderColor}50`,
              color: cls.textColor,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {latest.systolic}/{latest.diastolic}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        borderRadius: 14,
        background:
          variant === "patient"
            ? "linear-gradient(135deg, rgba(248,113,113,0.12) 0%, rgba(251,191,36,0.06) 100%)"
            : "linear-gradient(135deg, rgba(96,165,250,0.10) 0%, rgba(167,139,250,0.06) 100%)",
        border: `1px solid ${
          variant === "patient"
            ? "rgba(248,113,113,0.25)"
            : "rgba(96,165,250,0.2)"
        }`,
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
          "0 8px 24px rgba(248,113,113,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "none";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background:
            variant === "patient"
              ? "rgba(248,113,113,0.18)"
              : "rgba(96,165,250,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        ❤️
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: variant === "patient" ? "#f87171" : "#93c5fd",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 3,
          }}
        >
          {variant === "patient" ? "My BP Monitoring" : "BP Intelligence Panel"}
        </div>
        <div style={{ color: "#666688", fontSize: 12 }}>
          {loading
            ? "Loading..."
            : latest
            ? `Last: ${latest.systolic}/${latest.diastolic} mmHg — ${cls?.label}`
            : "No readings yet — Tap to get started"}
        </div>
      </div>

      {/* Status badge */}
      {!loading && cls && latest && (
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 8,
            background: cls.bgColor,
            border: `1px solid ${cls.borderColor}40`,
            color: cls.textColor,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {cls.action}
        </div>
      )}

      {/* Arrow */}
      <div style={{ color: "#444466", fontSize: 16, flexShrink: 0 }}>›</div>
    </Link>
  );
}

export default BPMonitorButton;