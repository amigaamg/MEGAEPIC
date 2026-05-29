"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DoctorReviewDashboard from "@/components/medication/DoctorReviewDashboard";

export default function DoctorReviewPage() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "doctors", user.uid)).then((snap) => {
      if (snap.exists()) setDoctor({ id: snap.id, ...snap.data() });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280" }}>Loading...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👨‍⚕️</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Doctor profile not found</div>
        </div>
      </div>
    );
  }

  return <DoctorReviewDashboard doctorId={doctor.id} />;
}
