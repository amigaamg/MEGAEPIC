"use client";
import { useState, useEffect, useMemo } from "react";
import {
  collection, query, where, orderBy, onSnapshot, updateDoc, doc, Timestamp, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateDoctorReview } from "@/src/engine/medication/journeyEngine";
import MasterMedicationTimeline, { buildTimelineEvents } from "./MasterMedicationTimeline";

interface Props {
  doctorId: string;
  patientId?: string;
}

export default function DoctorReviewDashboard({ doctorId, patientId }: Props) {
  return null;
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [adherenceRecords, setAdherenceRecords] = useState<any[]>([]);
  const [sideEffects, setSideEffects] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(patientId || null);
  const [reviews, setReviews] = useState<Record<string, any>>({});
  const [activeView, setActiveView] = useState<"patients" | "timeline" | "review">("patients");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    const unsub = onSnapshot(
      query(collection(db, "patients"), where("assignedDoctorId", "==", doctorId)),
      (snap) => {
        setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    return () => unsub();
  }, [doctorId]);

  useEffect(() => {
    if (!selectedPatient) return;
    const unsubRx = onSnapshot(
      query(collection(db, "prescriptions"), where("patientId", "==", selectedPatient), orderBy("createdAt", "desc")),
      (snap) => setPrescriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubAdh = onSnapshot(
      query(collection(db, "medicationAdherence"), where("patientId", "==", selectedPatient), orderBy("date", "desc")),
      (snap) => setAdherenceRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSE = onSnapshot(
      query(collection(db, "sideEffects"), where("patientId", "==", selectedPatient), orderBy("onset", "desc")),
      (snap) => setSideEffects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubRx(); unsubAdh(); unsubSE(); };
  }, [selectedPatient]);

  const activeMeds = prescriptions.filter((p) => p.status === "active" || p.active === true);
  const timelineEvents = useMemo(() => buildTimelineEvents(prescriptions, adherenceRecords, sideEffects), [prescriptions, adherenceRecords, sideEffects]);

  const adherenceRate = useMemo(() => {
    const last30 = adherenceRecords.slice(0, 30);
    if (last30.length === 0) return 100;
    return Math.round(last30.reduce((s, r) => s + (r.adherencePercentage || 0), 0) / last30.length);
  }, [adherenceRecords]);

  const patientReview = useMemo(() => {
    if (!selectedPatient) return null;
    return generateDoctorReview(
      {
        age: 0, weight: 70, renalFunction: { egfr: 90 }, liverFunction: { alt: 20, ast: 18 },
        allergies: [], pregnancy: false, breastfeeding: false, diagnoses: [],
        currentDrugs: activeMeds.map((m) => m.medicationName || m.medication || ""),
        vitals: {}, labs: {},
      },
      sideEffects,
      adherenceRate,
      adherenceRecords.slice(0, 30).reduce((s, r) => s + (r.totalMissed || 0), 0),
      sideEffects.filter((se) => se.severity === "severe").map(() => "side_effects" as any),
      activeMeds.map((m) => m.medicationName || m.medication || "")
    );
  }, [selectedPatient, sideEffects, adherenceRate, activeMeds]);

  const getPatientAlertLevel = (pid: string) => {
    const pRx = prescriptions.filter((p) => p.patientId === pid);
    const pAdh = adherenceRecords.filter((a) => a.patientId === pid);
    const pSE = sideEffects.filter((s) => s.patientId === pid);
    const pRate = pAdh.length > 0 ? Math.round(pAdh.reduce((s, r) => s + (r.adherencePercentage || 0), 0) / pAdh.length) : 100;
    const hasSevereSE = pSE.some((s) => s.severity === "severe");
    if (pRate < 50 || hasSevereSE) return "critical";
    if (pRate < 75 || pSE.length > 2) return "warning";
    return "normal";
  };

  const css = `
    .drd { font-family: 'DM Sans', 'Segoe UI', sans-serif; background: #f9fafb; min-height: 100vh; }
    .drd-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .drd-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; }
    .drd-btn { padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
    .drd-tab { padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; }
    .drd-tab.active { background: #0f766e; color: #fff; }
    .drd-tab:not(.active) { background: #f3f4f6; color: #6b7280; }
  `;

  return (
    <div className="drd">
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f766e,#14b8a6)", padding: "20px 24px", color: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          AMEXAN · Doctor Review Dashboard
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
          Therapeutic Intelligence
        </div>
        <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
          {patients.length} patients · Clinical review summaries
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, minHeight: "calc(100vh - 80px)" }}>
        {/* Patient List */}
        <div className="drd-card" style={{ borderRadius: 0, borderRight: "1px solid #e5e7eb", overflow: "auto" }}>
          <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Patients ({patients.length})
            </div>
          </div>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "#9ca3af" }}>Loading...</div>
          ) : patients.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>No patients assigned</div>
          ) : (
            patients.map((p) => {
              const alertLevel = getPatientAlertLevel(p.id);
              const alertColor = alertLevel === "critical" ? "#dc2626" : alertLevel === "warning" ? "#d97706" : "#10b981";
              return (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPatient(p.id); setActiveView("timeline"); }}
                  style={{
                    padding: "12px 14px", cursor: "pointer", borderLeft: `3px solid ${selectedPatient === p.id ? alertColor : "transparent"}`,
                    background: selectedPatient === p.id ? "#f0fdf9" : "transparent",
                    borderBottom: "1px solid #f3f4f6", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (selectedPatient !== p.id) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => { if (selectedPatient !== p.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>
                        {p.gender} · {p.dob ? Math.floor((Date.now() - new Date(p.dob.seconds * 1000).getTime()) / 31536000000) : "—"} yrs
                      </div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: alertColor, flexShrink: 0, marginTop: 4 }} />
                  </div>
                  {p.diagnosis && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>{p.diagnosis}</div>}
                </div>
              );
            })
          )}
        </div>

        {/* Main Content */}
        <div style={{ padding: 20, overflow: "auto" }}>
          {!selectedPatient ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#9ca3af", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍⚕️</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Select a Patient</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Choose a patient from the left panel to review their medication journey</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Patient header */}
              <div className="drd-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                      {patients.find((p) => p.id === selectedPatient)?.name || "Patient"}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                      {activeMeds.length} active medications · {adherenceRate}% adherence · {sideEffects.length} reported side effects
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["timeline", "review"] as const).map((v) => (
                      <button key={v} className={`drd-tab ${activeView === v ? "active" : ""}`} onClick={() => setActiveView(v)}>
                        {v === "timeline" ? "📋 Timeline" : "📊 Review"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline View */}
              {activeView === "timeline" && (
                <MasterMedicationTimeline
                  events={timelineEvents}
                  patientName={patients.find((p) => p.id === selectedPatient)?.name || "Patient"}
                />
              )}

              {/* Review View */}
              {activeView === "review" && patientReview && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Adherence Summary */}
                  <div className="drd-card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                      Adherence Summary
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: patientReview!.adherenceSummary.overallPercentage >= 75 ? "#059669" : "#dc2626" }}>
                          {patientReview!.adherenceSummary.overallPercentage}%
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>Overall Adherence</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>{patientReview!.adherenceSummary.missedDoses30d}</div>
                        <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>Missed Doses (30d)</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: patientReview!.adherenceSummary.trend === "improving" ? "#059669" : patientReview!.adherenceSummary.trend === "worsening" ? "#dc2626" : "#f59e0b" }}>
                          {patientReview!.adherenceSummary.trend}
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>Trend</div>
                      </div>
                    </div>
                    {patientReview!.adherenceSummary.commonReasons.length > 0 && (
                      <div style={{ marginTop: 10, padding: "8px 12px", background: "#fffbeb", borderRadius: 8, fontSize: 11, color: "#92400e" }}>
                        Common reasons: {patientReview!.adherenceSummary.commonReasons.join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Side Effect Burden */}
                  <div className="drd-card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Side Effect Burden
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#6b7280" }}>{patientReview!.sideEffectBurden.totalActive}</div>
                        <div style={{ fontSize: 10, color: "#6b7280" }}>Active</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: patientReview!.sideEffectBurden.severe > 0 ? "#dc2626" : "#6b7280" }}>
                          {patientReview!.sideEffectBurden.severe}
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7280" }}>Severe</div>
                      </div>
                      <div>
                        {patientReview!.sideEffectBurden.requiresAction ? (
                          <span className="drd-badge" style={{ background: "#fef2f2", color: "#dc2626" }}>⚠ Action Needed</span>
                        ) : (
                          <span className="drd-badge" style={{ background: "#f0fdf4", color: "#059669" }}>✓ No Action</span>
                        )}
                      </div>
                    </div>
                    {sideEffects.filter((s) => s.severity === "severe").map((se) => (
                      <div key={se.id} style={{ marginTop: 8, padding: "8px 12px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca", fontSize: 11, color: "#991b1b" }}>
                        🔴 {se.sideEffect} — {se.notes || "Reported by patient"}
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="drd-card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Clinical Recommendations
                    </div>
                    {patientReview!.recommendations.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {patientReview!.recommendations.map((r, i) => (
                          <div key={i} style={{ padding: "8px 12px", background: "#f0fdf9", borderRadius: 8, border: "1px solid #d1fae5", fontSize: 11, color: "#065f46" }}>
                            {i + 1}. {r}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "#6b7280" }}>No recommendations at this time</div>
                    )}
                  </div>

                  {/* Medication Changes */}
                  {patientReview!.medicationChanges.length > 0 && (
                    <div className="drd-card" style={{ padding: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        Suggested Medication Changes
                      </div>
                      {patientReview!.medicationChanges.map((mc, i) => (
                        <div key={i} style={{ padding: "8px 12px", background: "#fffbeb", borderRadius: 8, marginBottom: 4, border: "1px solid #fde68a", fontSize: 11, color: "#78350f" }}>
                          {mc.drugId}: <strong>{mc.action}</strong> — {mc.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Latest Side Effects Log */}
                  {sideEffects.length > 0 && (
                    <div className="drd-card" style={{ padding: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        Recent Side Effect Reports
                      </div>
                      {sideEffects.slice(0, 5).map((se) => (
                        <div key={se.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{se.sideEffect}</div>
                            <div style={{ fontSize: 10, color: "#6b7280" }}>
                              {se.medicationName} · {se.notes || "—"}
                            </div>
                          </div>
                          <span className="drd-badge" style={{
                            background: se.severity === "severe" ? "#fef2f2" : se.severity === "moderate" ? "#fffbeb" : "#f0fdf4",
                            color: se.severity === "severe" ? "#dc2626" : se.severity === "moderate" ? "#d97706" : "#059669",
                          }}>
                            {se.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Save Review Button */}
                  <button
                    onClick={async () => {
                      if (!selectedPatient) return;
                      await updateDoc(doc(db, "medicationReviews", `review_${selectedPatient}_${Date.now()}`), {
                        ...patientReview, patientId: selectedPatient, doctorId, savedAt: serverTimestamp(),
                      });
                    }}
                    className="drd-btn"
                    style={{ background: "#0f766e", color: "#fff", padding: "10px 24px", alignSelf: "flex-start" }}
                  >
                    Save Review to Patient Record
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
