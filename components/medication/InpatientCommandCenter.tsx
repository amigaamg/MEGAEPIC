"use client";
import { useState, useEffect, useMemo } from "react";
import {
  collection, query, where, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface WardPatient {
  id: string;
  name: string;
  bed?: string;
  diagnosis?: string;
  admitDate?: any;
  riskLevel?: string;
}

interface Props {
  doctorId?: string;
  wardId?: string;
}

export default function InpatientCommandCenter({ doctorId, wardId }: Props) {
  return null;
  const [patients, setPatients] = useState<WardPatient[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "patients"), where("admitted", "==", true)),
      (snap) => setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WardPatient)))
    );
    const unsubRx = onSnapshot(
      query(collection(db, "prescriptions"), where("origin", "==", "inpatient"), orderBy("createdAt", "desc")),
      (snap) => setPrescriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSch = onSnapshot(
      query(collection(db, "medicationSchedules"), where("status", "in", ["pending", "taken", "delayed", "missed"]), orderBy("scheduledTime", "asc")),
      (snap) => setSchedules(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { unsub(); unsubRx(); unsubSch(); };
  }, []);

  const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === "function") return v.toDate();
    return null;
  };

  const fmtTime = (d: Date | null) =>
    d ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

  const getOverdueCount = (patientId: string) =>
    schedules.filter((s) => {
      const rx = prescriptions.find((p) => p.id === s.prescriptionId && p.patientId === patientId);
      if (!rx) return false;
      const d = toDate(s.scheduledTime);
      return s.status === "pending" && d && d < now;
    }).length;

  const getPendingCount = (patientId: string) =>
    schedules.filter((s) => {
      const rx = prescriptions.find((p) => p.id === s.prescriptionId && p.patientId === patientId);
      if (!rx) return false;
      const d = toDate(s.scheduledTime);
      return s.status === "pending" && d && d >= now && d.getTime() - now.getTime() < 3600000;
    }).length;

  const getMissedCount = (patientId: string) =>
    schedules.filter((s) => {
      const rx = prescriptions.find((p) => p.id === s.prescriptionId && p.patientId === patientId);
      return rx && s.status === "missed";
    }).length;

  const handleAdminister = async (scheduleId: string) => {
    try {
      await updateDoc(doc(db, "medicationSchedules", scheduleId), {
        status: "taken", actualTime: Timestamp.fromDate(new Date()), administeredBy: doctorId, updatedAt: serverTimestamp(),
      });
      setNotification({ msg: "Dose administered", type: "success" });
    } catch {
      setNotification({ msg: "Failed", type: "error" });
    }
    setTimeout(() => setNotification(null), 2000);
  };

  const patientMeds = (patientId: string) =>
    prescriptions.filter((p) => p.patientId === patientId && p.origin === "inpatient");

  const css = `
    .icc { font-family: 'DM Sans', 'Segoe UI', sans-serif; background: #0f172a; min-height: 100vh; color: #e2e8f0; }
    .icc-card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; }
    .icc-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
    .icc-btn { padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer; border: none; text-transform: uppercase; letter-spacing: 0.05em; }
  `;

  return (
    <div className="icc">
      <style>{css}</style>

      {/* Command Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderBottom: "1px solid #334155", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#14b8a6", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            AMEXAN · Inpatient Command Center
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", marginTop: 2 }}>
            Ward Medication Dashboard
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
          {now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {notification && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: notification!.type === "success" ? "#065f46" : "#7f1d1d", color: "#fff" }}>
          {notification!.msg}
        </div>
      )}

      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, height: "calc(100vh - 60px)" }}>
        {/* Patient Ward List */}
        <div className="icc-card" style={{ overflow: "auto" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #334155", fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Ward Patients ({patients.length})
          </div>
          {patients.map((p) => {
            const overdue = getOverdueCount(p.id);
            const pending = getPendingCount(p.id);
            const missed = getMissedCount(p.id);
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatient(p.id)}
                style={{
                  padding: "10px 14px", cursor: "pointer", borderLeft: `3px solid ${selectedPatient === p.id ? "#14b8a6" : "transparent"}`,
                  background: selectedPatient === p.id ? "rgba(20,184,166,0.1)" : "transparent", borderBottom: "1px solid #1e293b",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{p.bed || "—"} · {p.diagnosis || "—"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {overdue > 0 && <span className="icc-badge" style={{ background: "#dc2626", color: "#fff" }}>{overdue} overdue</span>}
                    {pending > 0 && <span className="icc-badge" style={{ background: "#f59e0b", color: "#fff" }}>{pending} due</span>}
                  </div>
                </div>
                {missed > 0 && <div style={{ fontSize: 9, color: "#ef4444", marginTop: 4 }}>⚠ {missed} missed dose(s) today</div>}
              </div>
            );
          })}
          {patients.length === 0 && (
            <div style={{ textAlign: "center", padding: 30, color: "#64748b", fontSize: 11 }}>
              No admitted patients
            </div>
          )}
        </div>

        {/* Patient Medication Board */}
        <div style={{ overflow: "auto" }}>
          {!selectedPatient ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🩺</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Select a patient</div>
                <div style={{ fontSize: 11 }}>View and manage inpatient medications</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Patient Header */}
              <div className="icc-card" style={{ padding: "12px 16px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>
                  {patients.find((p) => p.id === selectedPatient)?.name}
                </div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                  Bed {patients.find((p) => p.id === selectedPatient)?.bed} · {selectedPatient ? patientMeds(selectedPatient!).length : 0} medications
                </div>
              </div>

              {/* Medication Timeline for this patient */}
              {selectedPatient && patientMeds(selectedPatient!).length === 0 ? (
                <div className="icc-card" style={{ textAlign: "center", padding: 30, color: "#64748b", fontSize: 11 }}>
                  No inpatient medications ordered
                </div>
              ) : selectedPatient ? (
                patientMeds(selectedPatient!).map((rx) => {
                  const rxSchedules = schedules.filter((s) => s.prescriptionId === rx.id);
                  const upcomingSchedules = rxSchedules.filter((s) => {
                    const d = toDate(s.scheduledTime);
                    return s.status === "pending" && d;
                  }).sort((a, b) => (toDate(a.scheduledTime)?.getTime() || 0) - (toDate(b.scheduledTime)?.getTime() || 0));

                  return (
                    <div key={rx.id} className="icc-card" style={{ overflow: "hidden" }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{rx.medicationName || rx.medication}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>{rx.dose || rx.dosage} · {rx.route} · {rx.frequency} · {rx.indication}</div>
                        </div>
                        <span className="icc-badge" style={{
                          background: rx.status === "active" ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.2)",
                          color: rx.status === "active" ? "#10b981" : "#94a3b8",
                        }}>
                          {rx.status}
                        </span>
                      </div>

                      <div style={{ padding: "8px 16px" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                          Schedule
                        </div>
                        {upcomingSchedules.slice(0, 6).map((s) => {
                          const st = toDate(s.scheduledTime);
                          const isOverdue = st && st < now;
                          const isDueSoon = st && st >= now && st.getTime() - now.getTime() < 3600000;
                          return (
                            <div key={s.id} style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              padding: "6px 8px", marginBottom: 4, borderRadius: 6,
                              background: isOverdue ? "rgba(239,68,68,0.1)" : isDueSoon ? "rgba(245,158,11,0.1)" : "rgba(30,41,59,0.5)",
                              border: `1px solid ${isOverdue ? "rgba(239,68,68,0.3)" : isDueSoon ? "rgba(245,158,11,0.3)" : "transparent"}`,
                            }}>
                              <div>
                                <span style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>
                                  #{s.doseNumber} · {fmtTime(st)}
                                </span>
                                {isOverdue && <span className="icc-badge" style={{ background: "#dc2626", color: "#fff", marginLeft: 6, fontSize: 8 }}>OVERDUE</span>}
                              </div>
                              <div style={{ display: "flex", gap: 4 }}>
                                {s.status === "pending" && (
                                  <>
                                    <button className="icc-btn" style={{ background: "#10b981", color: "#fff" }} onClick={() => handleAdminister(s.id)}>
                                      Give
                                    </button>
                                    <button className="icc-btn" style={{ background: "#64748b", color: "#fff" }}>
                                      Hold
                                    </button>
                                  </>
                                )}
                                {s.status !== "pending" && (
                                  <span className="icc-badge" style={{
                                    background: s.status === "taken" ? "rgba(16,185,129,0.2)" : s.status === "missed" ? "rgba(239,68,68,0.2)" : "rgba(100,116,139,0.2)",
                                    color: s.status === "taken" ? "#10b981" : s.status === "missed" ? "#ef4444" : "#94a3b8",
                                  }}>
                                    {s.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {upcomingSchedules.length > 6 && (
                          <div style={{ fontSize: 9, color: "#64748b", textAlign: "center", padding: 4 }}>
                            +{upcomingSchedules.length - 6} more doses
                          </div>
                        )}
                      </div>

                      {/* Critical alerts */}
                      {rx.critical && (
                        <div style={{ padding: "6px 16px", background: "rgba(239,68,68,0.15)", borderTop: "1px solid rgba(239,68,68,0.3)", fontSize: 10, color: "#fca5a5", fontWeight: 600 }}>
                          ⚠ CRITICAL MEDICATION — Requires double verification before administration
                        </div>
                      )}
                    </div>
                  );
                })
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
