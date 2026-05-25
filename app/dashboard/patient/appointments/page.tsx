"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [joining, setJoining] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const patient = auth.currentUser;
    if (!patient) return;

    const q = query(collection(db, "appointments"), where("patientId", "==", patient.uid));
    const unsub = onSnapshot(q, snap => {
      const appts = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => {
          const da = a.date?.toDate ? a.date.toDate() : new Date(a.date ?? 0);
          const db2 = b.date?.toDate ? b.date.toDate() : new Date(b.date ?? 0);
          return db2.getTime() - da.getTime();
        });
      setAppointments(appts);
    });
    return () => unsub();
  }, []);

  const joinConsultation = async (appointment: any) => {
    setJoining(appointment.id);
    try {
      // ✅ FIX: correct path — no /app/ prefix, no literal [id]
      if (appointment.consultationId) {
        router.push(`/dashboard/consultation/${appointment.consultationId}`);
        return;
      }

      // Fallback: query consultations collection
      const q = query(
        collection(db, "consultations"),
        where("appointmentId", "==", appointment.id),
        where("status", "==", "active")
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        alert("The doctor hasn't started the consultation yet. Please wait.");
        return;
      }

      // ✅ FIX: correct path here too
      router.push(`/dashboard/consultation/${snap.docs[0].id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to join. Please try again.");
    } finally {
      setJoining(null);
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    booked:    { label: "Scheduled",   color: "#3b82f6" },
    active:    { label: "Live Now 🟢", color: "#10b981" },
    completed: { label: "Completed",   color: "#6b7280" },
    cancelled: { label: "Cancelled",   color: "#ef4444" },
  };

  const fmtDate = (date: any) => {
    if (!date) return "—";
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-KE", {
      weekday: "short", year: "numeric", month: "short",
      day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div style={{ padding: "32px", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>My Appointments</h1>

      {appointments.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <p>No appointments found.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {appointments.map((a) => {
          const cfg = statusConfig[a.status] ?? { label: a.status, color: "#6b7280" };
          const isActive = a.status === "active";

          return (
            <div
              key={a.id}
              style={{
                borderWidth: isActive ? 2 : 1,
                borderStyle: "solid",
                borderColor: isActive ? "#10b981" : "#e5e7eb",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: isActive ? "rgba(16,185,129,0.05)" : "#fff",
                gap: 16,
                flexWrap: "wrap" as const,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {a.doctorName ? `Dr. ${a.doctorName}` : "Doctor"}
                  {a.specialty ? ` · ${a.specialty}` : ""}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{fmtDate(a.date)}</div>
                {a.patientNotes && (
                  <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                    "{a.patientNotes}"
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" as const }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: cfg.color,
                    background: `${cfg.color}18`, borderRadius: 20, padding: "2px 10px",
                  }}>
                    {cfg.label}
                  </span>
                  {a.paymentStatus && (
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: a.paymentStatus === "paid" ? "#10b981" : "#f59e0b",
                      background: a.paymentStatus === "paid" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      borderRadius: 20, padding: "2px 10px",
                    }}>
                      {a.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
                      {a.amount ? ` · KES ${a.amount.toLocaleString()}` : ""}
                    </span>
                  )}
                </div>
              </div>

              <div>
                {isActive && (
                  <button
                    onClick={() => joinConsultation(a)}
                    disabled={joining === a.id}
                    style={{
                      background: joining === a.id ? "#6b7280" : "#10b981",
                      color: "#fff",
                      borderWidth: 0, borderStyle: "solid", borderColor: "transparent",
                      borderRadius: 8,
                      padding: "10px 20px",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: joining === a.id ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {joining === a.id ? "Joining…" : "🎥 Join Now"}
                  </button>
                )}
                {a.status === "booked" && (
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>Waiting for doctor</span>
                )}
                {a.status === "completed" && (
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>View summary →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}