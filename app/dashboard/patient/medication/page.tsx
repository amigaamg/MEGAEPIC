"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PatientMedicationHome from "@/components/medication/PatientMedicationHome";

export default function PatientMedicationPage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "patients", user.uid)).then((snap) => {
      if (snap.exists()) setPatient({ id: snap.id, ...snap.data() });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f0fdf9" }}>
        <div style={{ textAlign: "center", color: "#0f766e" }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f0fdf9" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💊</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Patient profile not found</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Please contact your healthcare provider</div>
        </div>
      </div>
    );
  }

  return (
    <PatientMedicationHome
      patientId={patient.id}
      patientName={patient.name}
      patientAge={patient.dob ? Math.floor((Date.now() - new Date(patient.dob.seconds * 1000).getTime()) / 31536000000) : undefined}
      diagnoses={patient.activeToolTypes || []}
      viewMode="patient"
    />
  );
}
