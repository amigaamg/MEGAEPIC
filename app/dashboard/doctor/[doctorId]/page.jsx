"use client";
// ─────────────────────────────────────────────────────────────────────────────
// SAVE THIS FILE AT EXACTLY:
//   app/doctors/[doctorId]/page.jsx
//
// Create the folders if they don't exist:
//   app/
//   └── doctors/
//       └── [doctorId]/
//           └── page.jsx   ← this file
//
// This is the PUBLIC portfolio page patients (and the doctor) see.
// The "View Public Portfolio" button in DoctorDashboardEditor links here.
// URL pattern: /doctors/{uid}
// ─────────────────────────────────────────────────────────────────────────────

import { use } from "react";
import dynamic from "next/dynamic";

// Load with SSR off — AmexanDoctorPortfolio uses browser APIs (Uploadcare, etc.)
const AmexanDoctorPortfolio = dynamic(
  () => import("@/components/AmexanDoctorPortfolio"),
  {
    ssr: false,
    loading: () => <PortfolioLoader />,
  }
);

export default function DoctorPublicPortfolioPage({ params }) {
  const { doctorId } = use(params);

  if (!doctorId) {
    return (
      <div style={styles.center}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={styles.title}>Doctor not found</div>
        <div style={styles.sub}>This portfolio link is invalid or has expired.</div>
        <a href="/" style={styles.backBtn}>← Back to AMEXAN</a>
      </div>
    );
  }

  return (
    // Full-bleed: breaks out of any parent padding
    <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: "#f7f8fa" }}>
      <AmexanDoctorPortfolio doctorId={doctorId} />
    </div>
  );
}

// ── Skeleton loader shown while the portfolio chunk loads ─────────────────────
function PortfolioLoader() {
  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -800px 0 }
          100% { background-position:  800px 0 }
        }
        .sk {
          background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 8px;
        }
      `}</style>

      {/* Hero banner skeleton */}
      <div style={{ background: "#0B1628", height: 260, position: "relative" }}>
        <div style={{
          position: "absolute", bottom: -60, left: 40,
          width: 160, height: 160, borderRadius: "50%",
          border: "4px solid #fff",
          background: "#1a3a5a",
        }} />
      </div>

      {/* Info skeleton */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px 32px" }}>
        <div className="sk" style={{ height: 36, width: 280, marginBottom: 12 }} />
        <div className="sk" style={{ height: 20, width: 200, marginBottom: 8 }} />
        <div className="sk" style={{ height: 16, width: 320, marginBottom: 24 }} />

        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <div className="sk" style={{ height: 44, width: 160, borderRadius: 12 }} />
          <div className="sk" style={{ height: 44, width: 140, borderRadius: 12 }} />
          <div className="sk" style={{ height: 44, width: 120, borderRadius: 12 }} />
        </div>

        {/* Tab bar skeleton */}
        <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e5e7eb", paddingBottom: 0, marginBottom: 32 }}>
          {[80, 100, 90, 110, 85].map((w, i) => (
            <div key={i} className="sk" style={{ height: 40, width: w, borderRadius: "8px 8px 0 0" }} />
          ))}
        </div>

        {/* Content skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
          <div>
            <div className="sk" style={{ height: 200, marginBottom: 20, borderRadius: 16 }} />
            <div className="sk" style={{ height: 160, borderRadius: 16 }} />
          </div>
          <div>
            <div className="sk" style={{ height: 140, marginBottom: 16, borderRadius: 16 }} />
            <div className="sk" style={{ height: 200, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  center: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "80vh", fontFamily: "sans-serif",
    textAlign: "center", padding: "40px 24px",
    background: "#f7f8fa",
  },
  title: {
    fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8,
  },
  sub: {
    fontSize: 14, color: "#94a3b8", marginBottom: 24,
  },
  backBtn: {
    background: "#0ea5e9", color: "#fff",
    padding: "12px 28px", borderRadius: 12,
    fontWeight: 700, textDecoration: "none", fontSize: 14,
  },
};