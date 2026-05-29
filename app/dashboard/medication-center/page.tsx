"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MedicationCommandCenter from "@/components/visual-intelligence/MedicationCommandCenter";

export default function MedicationCommandCenterPage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [adherenceRecords, setAdherenceRecords] = useState<any[]>([]);
  const [sideEffects, setSideEffects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    // Try patient first, then doctor
    getDoc(doc(db, "patients", user.uid)).then((snap) => {
      if (snap.exists()) {
        setPatient({ id: snap.id, ...snap.data() });
        setLoading(false);
      }
    });
    getDoc(doc(db, "doctors", user.uid)).then((snap) => {
      if (snap.exists()) setDoctor({ id: snap.id, ...snap.data() });
    });
  }, [user]);

  const patientId = patient?.id;

  useEffect(() => {
    if (!patientId) return;
    const unsubRx = onSnapshot(
      query(collection(db, "prescriptions"), where("patientId", "==", patientId), orderBy("createdAt", "desc")),
      (snap) => setPrescriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubAdh = onSnapshot(
      query(collection(db, "medicationAdherence"), where("patientId", "==", patientId), orderBy("date", "desc")),
      (snap) => setAdherenceRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSE = onSnapshot(
      query(collection(db, "sideEffects"), where("patientId", "==", patientId), orderBy("onset", "desc")),
      (snap) => setSideEffects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubRx(); unsubAdh(); unsubSE(); };
  }, [patientId]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0f1a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", border: "2px solid #14b8a6",
            borderTopColor: "transparent", animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <div style={{ fontSize: 12, color: "#64748b" }}>Loading Medication Intelligence...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0f1a" }}>
        <div style={{ textAlign: "center", color: "#475569" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>No Patient Profile Found</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>A patient profile is required to use the Medication Intelligence Center</div>
        </div>
      </div>
    );
  }

  return (
    <MedicationCommandCenter
      patient={patient}
      doctor={doctor}
      prescriptions={prescriptions}
      adherenceRecords={adherenceRecords}
      sideEffects={sideEffects}
      mode={doctor ? "doctor" : "patient"}
    />
  );
}
