// components/HTNDoctorControlCenter.tsx
"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import HTNPanel from "./HTNPanel"; // your full cockpit (already dark themed)

// ─── Types (same as your HTNDashboard) ──────────────────────────────────────
interface PatientSummary {
  id: string;
  name: string;
  email?: string;
  universalId?: string;
  latestSystolic?: number;
  latestDiastolic?: number;
  latestAt?: Date;
  totalReadings: number;
  age?: number;
  sex?: string;
  primaryDx?: string;
  riskCategory?: string;
  followUpInterval?: string;
  lastVisit?: Date;
  nextReview?: Date;
  bmi?: number;
}

// ─── Dark theme patient picker (matches HTNPanel look) ───────────────────────
const pickerTheme = {
  bg: "#0a0a12",
  bgCard: "#0f0f1c",
  bgSub: "#13131f",
  border: "rgba(255,255,255,0.07)",
  text: "#e8e8f0",
  textSub: "#9090b0",
  textMuted: "#55557a",
};

function PatientPicker({
  patients,
  selectedId,
  onSelect,
  loading,
}: {
  patients: PatientSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.universalId ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div
        style={{
          background: pickerTheme.bgCard,
          border: `1px solid ${pickerTheme.border}`,
          borderRadius: 14,
          padding: "18px 20px",
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: pickerTheme.textSub,
        }}
      >
        Loading patients…
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div
        style={{
          background: pickerTheme.bgCard,
          border: `1px solid ${pickerTheme.border}`,
          borderRadius: 14,
          padding: "32px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>🩺</div>
        <div style={{ color: pickerTheme.text, fontSize: 13 }}>
          No patients with BP readings found.
        </div>
        <div style={{ color: pickerTheme.textMuted, fontSize: 11, marginTop: 6 }}>
          Patients appear here once they log a BP reading via the patient app.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: pickerTheme.bgCard,
        border: `1px solid ${pickerTheme.border}`,
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          color: pickerTheme.textMuted,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#60a5fa",
            display: "inline-block",
          }}
        />
        HTN Patients ({patients.length})
      </div>
      <input
        type="text"
        placeholder="Search by name or ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          background: pickerTheme.bgSub,
          border: `1px solid ${pickerTheme.border}`,
          borderRadius: 8,
          padding: "9px 14px",
          color: pickerTheme.text,
          fontSize: 13,
          outline: "none",
          marginBottom: 12,
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          maxHeight: 460,
          overflowY: "auto",
        }}
      >
        {filtered.map((p) => {
          const active = selectedId === p.id;
          // BP classification helper (inline)
          const classify = (sys: number, dia: number) => {
            if (sys >= 180 || dia >= 120)
              return { label: "Crisis", color: "#fca5a5", bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.4)" };
            if (sys >= 140 || dia >= 90)
              return { label: "Stage 2", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" };
            if (sys >= 130 || dia >= 80)
              return { label: "Stage 1", color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)" };
            if (sys >= 120)
              return { label: "Elevated", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)" };
            return { label: "Normal", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" };
          };
          const cls =
            p.latestSystolic && p.latestDiastolic
              ? classify(p.latestSystolic, p.latestDiastolic)
              : null;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "10px 13px",
                borderRadius: 9,
                textAlign: "left",
                cursor: "pointer",
                border: active
                  ? "1.5px solid rgba(248,113,113,0.4)"
                  : `1px solid ${pickerTheme.border}`,
                background: active
                  ? "rgba(248,113,113,0.08)"
                  : pickerTheme.bgSub,
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: active
                    ? "rgba(248,113,113,0.15)"
                    : pickerTheme.bgSub,
                  border: `1px solid ${
                    active
                      ? "rgba(248,113,113,0.3)"
                      : pickerTheme.border
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: active ? "#f87171" : pickerTheme.textSub,
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: active ? "#f87171" : pickerTheme.text,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ color: pickerTheme.textMuted, fontSize: 11 }}>
                  {p.universalId ?? p.id.slice(0, 10)}
                  {p.latestAt && (
                    <span style={{ marginLeft: 7 }}>
                      · {p.latestAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {cls && p.latestSystolic && p.latestDiastolic && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      color: cls.color,
                      fontWeight: 700,
                      fontSize: 13,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {p.latestSystolic}/{p.latestDiastolic}
                  </div>
                  <div
                    style={{
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: cls.bg,
                      border: `1px solid ${cls.border}`,
                      color: cls.color,
                      fontSize: 9,
                      fontWeight: 700,
                      display: "inline-block",
                    }}
                  >
                    {cls.label}
                  </div>
                </div>
              )}
              <div
                style={{
                  color: pickerTheme.textMuted,
                  fontSize: 11,
                  flexShrink: 0,
                  marginLeft: 4,
                }}
              >
                {p.totalReadings}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div
            style={{
              color: pickerTheme.textMuted,
              fontSize: 13,
              padding: "16px 0",
              textAlign: "center",
            }}
          >
            No patients match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Wrapper Component ──────────────────────────────────────────────────
export default function HTNDoctorControlCenter({ doctorId }: { doctorId?: string }) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatientFull, setSelectedPatientFull] = useState<PatientSummary | null>(null);

  // Fetch all patients with BP readings (exactly like your HTNDashboard)
  useEffect(() => {
    (async () => {
      try {
        const readingsSnap = await getDocs(
          query(
            collection(db, "toolReadings"),
            where("toolType", "==", "bp_monitor")
          )
        );
        const map: Record<
          string,
          {
            count: number;
            latestSys?: number;
            latestDia?: number;
            latestAt?: Date;
          }
        > = {};
        readingsSnap.docs.forEach((d) => {
          const data = d.data();
          const pid = data.patientId;
          if (!pid) return;
          const sys = data.data?.systolic ?? data.systolic;
          const dia = data.data?.diastolic ?? data.diastolic;
          const at = data.recordedAt instanceof Timestamp
            ? data.recordedAt.toDate()
            : new Date();
          if (!map[pid]) map[pid] = { count: 0 };
          map[pid].count++;
          if (!map[pid].latestAt || at > map[pid].latestAt!) {
            map[pid].latestAt = at;
            map[pid].latestSys = sys;
            map[pid].latestDia = dia;
          }
        });

        const uniqueIds = Object.keys(map);
        if (!uniqueIds.length) {
          setPatients([]);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          uniqueIds.map(async (pid) => {
            try {
              // Try users collection first, then patientProfiles
              let profileData: any = null;
              const userDoc = await getDoc(doc(db, "users", pid));
              if (userDoc.exists()) profileData = userDoc.data();
              if (!profileData) {
                const profileDoc = await getDoc(doc(db, "patientProfiles", pid));
                if (profileDoc.exists()) profileData = profileDoc.data();
              }
              const name =
                profileData?.name ??
                profileData?.displayName ??
                profileData?.fullName ??
                `Patient ${pid.slice(-6)}`;
              const age = profileData?.age;
              const sex = profileData?.sex;
              const primaryDx = profileData?.primaryDx ?? "Essential Hypertension";
              const riskCategory = profileData?.riskCategory;
              const followUpInterval = profileData?.followUpInterval;
              const lastVisit = profileData?.lastVisit
                ? profileData.lastVisit instanceof Timestamp
                  ? profileData.lastVisit.toDate()
                  : new Date(profileData.lastVisit)
                : undefined;
              const nextReview = profileData?.nextReview
                ? profileData.nextReview instanceof Timestamp
                  ? profileData.nextReview.toDate()
                  : new Date(profileData.nextReview)
                : undefined;
              return {
                id: pid,
                name,
                email: profileData?.email,
                universalId: profileData?.universalId,
                latestSystolic: map[pid].latestSys,
                latestDiastolic: map[pid].latestDia,
                latestAt: map[pid].latestAt,
                totalReadings: map[pid].count,
                age,
                sex,
                primaryDx,
                riskCategory,
                followUpInterval,
                lastVisit,
                nextReview,
              } as PatientSummary;
            } catch {
              return {
                id: pid,
                name: `Patient ${pid.slice(-6)}`,
                totalReadings: map[pid].count,
                latestSystolic: map[pid].latestSys,
                latestDiastolic: map[pid].latestDia,
                latestAt: map[pid].latestAt,
              } as PatientSummary;
            }
          })
        );

        results.sort(
          (a, b) => (b.latestAt?.getTime() ?? 0) - (a.latestAt?.getTime() ?? 0)
        );
        setPatients(results);
        if (results.length > 0) setSelectedId(results[0].id);
      } catch (err) {
        console.error("HTN Doctor Control Center fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  // When selectedId changes, find the full patient object to pass to HTNPanel
  useEffect(() => {
    if (selectedId) {
      const found = patients.find((p) => p.id === selectedId);
      setSelectedPatientFull(found || null);
    } else {
      setSelectedPatientFull(null);
    }
  }, [selectedId, patients]);

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        flexWrap: "wrap",
        padding: "20px",
        background: pickerTheme.bg,
        minHeight: "100vh",
      }}
    >
      {/* Left column: Patient Picker */}
      <div style={{ width: 320, flexShrink: 0 }}>
        <PatientPicker
          patients={patients}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
        />
      </div>

      {/* Right column: Full HTN Cockpit */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedPatientFull ? (
          <HTNPanel
            patientId={selectedPatientFull.id}
            patient={{
              id: selectedPatientFull.id,
              name: selectedPatientFull.name,
              age: selectedPatientFull.age,
              sex: selectedPatientFull.sex,
              primaryDx: selectedPatientFull.primaryDx,
              riskCategory: selectedPatientFull.riskCategory,
              followUpInterval: selectedPatientFull.followUpInterval,
              lastVisit: selectedPatientFull.lastVisit,
              nextReview: selectedPatientFull.nextReview,
            }}
          />
        ) : loading ? (
          <div
            style={{
              background: pickerTheme.bgCard,
              border: `1px solid ${pickerTheme.border}`,
              borderRadius: 14,
              padding: "60px 20px",
              textAlign: "center",
              color: pickerTheme.textSub,
            }}
          >
            Loading patient data…
          </div>
        ) : patients.length === 0 ? (
          <div
            style={{
              background: pickerTheme.bgCard,
              border: `1px solid ${pickerTheme.border}`,
              borderRadius: 14,
              padding: "60px 20px",
              textAlign: "center",
              color: pickerTheme.textSub,
            }}
          >
            No patients with BP readings found.
          </div>
        ) : (
          <div
            style={{
              background: pickerTheme.bgCard,
              border: `1px solid ${pickerTheme.border}`,
              borderRadius: 14,
              padding: "60px 20px",
              textAlign: "center",
              color: pickerTheme.textSub,
            }}
          >
            Select a patient from the list to open the HTN cockpit.
          </div>
        )}
      </div>
    </div>
  );
}