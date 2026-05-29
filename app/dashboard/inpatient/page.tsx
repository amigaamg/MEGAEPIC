"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import InpatientCommandCenter from "@/components/medication/InpatientCommandCenter";

export default function InpatientPage() {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f172a" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>Loading Command Center...</div>
      </div>
    );
  }

  return <InpatientCommandCenter doctorId={doctor?.id} />;
}
