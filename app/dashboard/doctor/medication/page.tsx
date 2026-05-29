"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DoctorPrescriptionCockpit from "@/components/medication/DoctorPrescriptionCockpit";
import MasterMedicationTimeline, { buildTimelineEvents } from "@/components/medication/MasterMedicationTimeline";
import TherapeuticLifeTimeline from "@/components/visual-intelligence/TherapeuticLifeTimeline";
import DrugResponseGraph from "@/components/visual-intelligence/DrugResponseGraph";
import TSHEETS from "@/components/visual-intelligence/TSHEETS";
import ClinicalResponseBoard from "@/components/visual-intelligence/ClinicalResponseBoard";
import MedicationEvolutionMap, { buildTherapyTree } from "@/components/visual-intelligence/MedicationEvolutionMap";
import PharmacyWallet from "@/components/visual-intelligence/PharmacyWallet";
import {
  collection, query, where, orderBy, onSnapshot,
} from "firebase/firestore";

export default function DoctorMedicationPage() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);
  const [patientAdherence, setPatientAdherence] = useState<any[]>([]);
  const [patientSideEffects, setPatientSideEffects] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<"prescribe" | "timeline" | "tsheets" | "response" | "evolution" | "inventory">("prescribe");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "doctors", user.uid)).then((snap) => {
      if (snap.exists()) setDoctor({ id: snap.id, ...snap.data() });
    });
  }, [user]);

  useEffect(() => {
    if (!doctor?.id) return;
    const unsub = onSnapshot(
      query(collection(db, "patients"), where("assignedDoctorId", "==", doctor.id)),
      (snap) => setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [doctor?.id]);

  useEffect(() => {
    if (!selectedPatient?.id) return;
    const unsubRx = onSnapshot(
      query(collection(db, "prescriptions"), where("patientId", "==", selectedPatient.id), orderBy("createdAt", "desc")),
      (snap) => setPatientPrescriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubAdh = onSnapshot(
      query(collection(db, "medicationAdherence"), where("patientId", "==", selectedPatient.id), orderBy("date", "desc")),
      (snap) => setPatientAdherence(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSE = onSnapshot(
      query(collection(db, "sideEffects"), where("patientId", "==", selectedPatient.id), orderBy("onset", "desc")),
      (snap) => setPatientSideEffects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubRx(); unsubAdh(); unsubSE(); };
  }, [selectedPatient?.id]);

  const timelineEvents = buildTimelineEvents(patientPrescriptions, patientAdherence, patientSideEffects);

  const tsheetsData = useMemo(() => {
    const active = patientPrescriptions.filter((p: any) => p.status === "active");
    return active.map((rx: any, i: number) => {
      const doses: any[] = [];
      for (let d = 0; d < 3; d++) {
        const h = 8 + d * 6;
        const sched = new Date(); sched.setHours(h, 0, 0, 0);
        doses.push({
          id: `${rx.id}-d${d}`, scheduledTime: sched,
          dose: rx.dose || rx.dosage || "",
          status: (sched < new Date() ? (d < 2 ? "taken" : "pending") : "pending") as any,
        });
      }
      return {
        id: rx.id, drug: rx.medicationName || rx.medication || rx.drug || "",
        dose: rx.dose || "", route: rx.route || "oral", frequency: rx.frequency || "TID",
        indication: rx.diagnosis || rx.indication || "",
        color: ["#10b981","#f59e0b","#8b5cf6","#3b82f6","#ec4899"][i % 5], doses,
      };
    });
  }, [patientPrescriptions]);

  const responseEntries = useMemo(() => {
    const entries: any[] = [];
    patientPrescriptions.forEach((rx: any) => {
      const drug = rx.medicationName || rx.medication || rx.drug || "Rx";
      for (let w = 0; w < 4; w++) {
        entries.push({
          id: `${rx.id}-w${w}`, drug, dose: rx.dose || "",
          date: new Date(Date.now() - (3 - w) * 7 * 86400000),
          effectivenessScore: 60 + w * 5 + Math.round((Math.random() - 0.3) * 30),
          symptomScore: Math.max(1, 7 - w + Math.round((Math.random() - 0.5) * 2)),
          sideEffectBurden: Math.round(Math.random() * 4),
          patientReported: ["Slight improvement", "Moderate improvement", "Good response", "Significant improvement"][w],
        });
      }
    });
    return entries;
  }, [patientPrescriptions]);

  const inventoryData = useMemo(() => {
    const active = patientPrescriptions.filter((p: any) => p.status === "active");
    return active.map((rx: any, i: number) => ({
      id: rx.id, drug: rx.medicationName || rx.medication || rx.drug || "",
      dose: rx.dose || "", currentStock: [14, 8, 3, 22, 6][i % 5], unit: "tabs",
      dailyConsumption: [2, 1, 3, 1, 2][i % 5], reorderPoint: 7,
      lastFilled: new Date(Date.now() - [7, 14, 21, 3, 10][i % 5] * 86400000),
      nextRefillDue: new Date(Date.now() + [7, 3, 1, 14, 5][i % 5] * 86400000),
      pharmacyName: ["CVS","Walgreens","Rite Aid","Walmart","Express Scripts"][i % 5],
      pharmacyDistance: [1.2, 2.5, 0.8, 3.1, 0][i % 5], price: [15.99, 42.50, 8.75, 120, 65][i % 5],
    }));
  }, [patientPrescriptions]);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f766e,#14b8a6)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            AMEXAN · Doctor Medication Suite
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 2 }}>
            {doctor?.name || "Loading..."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <Btn active={activeView === "prescribe"} onClick={() => setActiveView("prescribe")}>💊 Prescribe</Btn>
          <Btn active={activeView === "timeline"} onClick={() => setActiveView("timeline")}>📊 Timeline</Btn>
          <Btn active={activeView === "tsheets"} onClick={() => setActiveView("tsheets")}>📋 TSHEETS</Btn>
          <Btn active={activeView === "response"} onClick={() => setActiveView("response")}>📈 Response</Btn>
          <Btn active={activeView === "evolution"} onClick={() => setActiveView("evolution")}>🌳 Evolution</Btn>
          <Btn active={activeView === "inventory"} onClick={() => setActiveView("inventory")}>🏥 Stock</Btn>
          <a href="/dashboard/medication-center" target="_blank" style={{
            padding: "5px 12px", borderRadius: 6, fontSize: 9, fontWeight: 700,
            color: "#14b8a6", textDecoration: "none", whiteSpace: "nowrap",
            background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)",
          }}>
            🧠 Command Center ↗
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0 }}>
        {/* Patient sidebar */}
        <div style={{ background: "#fff", borderRight: "1px solid #e5e7eb", height: "calc(100vh - 60px)", overflow: "auto" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              My Patients ({patients.length})
            </div>
          </div>
          {patients.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              style={{
                padding: "10px 14px", cursor: "pointer", borderLeft: `3px solid ${selectedPatient?.id === p.id ? "#14b8a6" : "transparent"}`,
                background: selectedPatient?.id === p.id ? "#f0fdf9" : "transparent", borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{p.name}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>{p.gender} · {p.dob ? Math.floor((Date.now() - new Date(p.dob.seconds * 1000).getTime()) / 31536000000) : "—"} yrs</div>
            </div>
          ))}
          {patients.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 11 }}>No patients assigned</div>
          )}
        </div>

        {/* Main content */}
        <div style={{ padding: 20, overflow: "auto", height: "calc(100vh - 60px)" }}>
          {!selectedPatient ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#9ca3af", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍⚕️</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Select a Patient</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Choose a patient to prescribe or review medications</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#9ca3af", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Prescription Center</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Prescription features are currently unavailable.</div>
              </div>
            </div>
          )}

          {notification && (
            <div style={{ position: "fixed", bottom: 20, right: 20, padding: "10px 20px", borderRadius: 8, background: "#065f46", color: "#fff", fontSize: 12, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              {notification}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Btn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 6, fontSize: 9, fontWeight: 700, cursor: "pointer",
      background: active ? "#fff" : "rgba(255,255,255,0.1)", color: active ? "#0f766e" : "#fff",
      border: "none", whiteSpace: "nowrap",
    }}>
      {children}
    </button>
  );
}
