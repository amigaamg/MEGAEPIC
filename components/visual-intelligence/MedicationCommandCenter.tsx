"use client";
import { useState, useMemo } from "react";
import TherapeuticLifeTimeline from "@/components/visual-intelligence/TherapeuticLifeTimeline";
import DrugResponseGraph from "@/components/visual-intelligence/DrugResponseGraph";
import TSHEETS from "@/components/visual-intelligence/TSHEETS";
import PrescriptionReceipt from "@/components/visual-intelligence/PrescriptionReceipt";
import PharmacyWallet from "@/components/visual-intelligence/PharmacyWallet";
import ClinicalResponseBoard from "@/components/visual-intelligence/ClinicalResponseBoard";
import MedicationEvolutionMap, { buildTherapyTree } from "@/components/visual-intelligence/MedicationEvolutionMap";
import PatientMobileJourney from "@/components/visual-intelligence/PatientMobileJourney";
import LifetimeTherapeuticMemory from "@/components/visual-intelligence/LifetimeTherapeuticMemory";

interface Props {
  patient: any;
  prescriptions: any[];
  adherenceRecords: any[];
  sideEffects: any[];
  doctor?: any;
  mode?: "doctor" | "patient" | "inpatient";
}

type TabKey = "timeline" | "tsheets" | "response" | "evolution" | "inventory" | "receipt" | "memory" | "mobile";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "timeline", label: "Timeline", icon: "📊" },
  { key: "tsheets", label: "TSHEETS", icon: "📋" },
  { key: "response", label: "Response", icon: "📈" },
  { key: "evolution", label: "Evolution", icon: "🌳" },
  { key: "inventory", label: "Inventory", icon: "🏥" },
  { key: "receipt", label: "Receipt", icon: "📄" },
  { key: "memory", label: "Memory", icon: "📖" },
  { key: "mobile", label: "Mobile", icon: "📱" },
];

export default function MedicationCommandCenter({ patient, prescriptions, adherenceRecords, sideEffects, doctor, mode = "doctor" }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("timeline");

  const timelineEvents = useMemo(() => {
    const events: any[] = [];
    prescriptions.forEach((rx: any) => {
      const diseaseTrack = rx.indication || rx.diagnosis || "General";
      const drugName = rx.medicationName || rx.medication || rx.drug || "";
      const startDate = rx.startDate?.toDate ? rx.startDate.toDate() : rx.startDate ? new Date(rx.startDate) : new Date();
      events.push({
        id: `rx-${rx.id}`, date: startDate,
        type: "medication_start", diseaseTrack,
        drug: drugName, dose: rx.dose || rx.dosage || "",
        detail: `Started · ${rx.frequency || ""} · ${rx.route || ""}`,
        outcome: rx.status, severity: "normal",
      });
      if (rx.actualStopDate) {
        const stopDate = rx.actualStopDate.toDate ? rx.actualStopDate.toDate() : new Date(rx.actualStopDate);
        events.push({
          id: `rx-stop-${rx.id}`, date: stopDate,
          type: "stopped", diseaseTrack,
          drug: drugName, dose: rx.dose || "",
          detail: rx.stopReason || "Discontinued", severity: "warning",
        });
      }
    });
    sideEffects.forEach((se: any) => {
      events.push({
        id: `se-${se.id}`,
        date: se.onset?.toDate ? se.onset.toDate() : se.date?.toDate ? se.date.toDate() : new Date(),
        type: "side_effect",
        diseaseTrack: se.medication || se.drug || "General",
        drug: se.medication || se.drug || "",
        dose: "",
        detail: se.symptom || se.reaction || se.description || "",
        outcome: se.severity || "mild",
        severity: se.severity === "severe" ? "critical" : se.severity === "moderate" ? "warning" : "normal",
      });
    });
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [prescriptions, sideEffects]);

  const tsheetsData = useMemo(() => {
    const activeRxs = prescriptions.filter((p: any) => p.status === "active");
    return activeRxs.map((rx: any, i: number) => {
      const drugName = rx.medicationName || rx.medication || rx.drug || "Medication";
      const totalDoses = 3;
      const now = new Date();
      const doses: any[] = [];
      for (let d = 0; d < totalDoses; d++) {
        const hour = 8 + d * 6;
        const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
        const isPast = scheduled < now;
        doses.push({
          id: `${rx.id}-d${d}`,
          scheduledTime: scheduled,
          dose: rx.dose || rx.dosage || "10mg",
          status: isPast ? (d === 1 ? "taken" : d === 0 ? "delayed" : "pending") as any : "pending",
          actualTime: isPast && d >= 0 ? new Date(scheduled.getTime() + Math.random() * 600000) : undefined,
        });
      }
      return {
        id: rx.id,
        drug: drugName,
        dose: rx.dose || rx.dosage || "",
        route: rx.route || "oral",
        frequency: rx.frequency || "TID",
        indication: rx.diagnosis || rx.indication || "",
        color: [`#10b981`, `#f59e0b`, `#8b5cf6`, `#3b82f6`, `#ec4899`][i % 5],
        doses,
      };
    });
  }, [prescriptions]);

  const inventoryData = useMemo(() => {
    const activeRxs = prescriptions.filter((p: any) => p.status === "active");
    return activeRxs.map((rx: any, i: number) => ({
      id: rx.id,
      drug: rx.medicationName || rx.medication || rx.drug || "Medication",
      dose: rx.dose || rx.dosage || "",
      currentStock: [14, 8, 3, 22, 6][i % 5],
      unit: "tabs",
      dailyConsumption: [2, 1, 3, 1, 2][i % 5],
      reorderPoint: 7,
      lastFilled: new Date(Date.now() - [7, 14, 21, 3, 10][i % 5] * 86400000),
      nextRefillDue: new Date(Date.now() + [7, 3, 1, 14, 5][i % 5] * 86400000),
      pharmacyName: ["CVS", "Walgreens", "Rite Aid", "Walmart Pharmacy", "Express Scripts"][i % 5],
      pharmacyDistance: [1.2, 2.5, 0.8, 3.1, 0][i % 5],
      price: [15.99, 42.50, 8.75, 120.00, 65.00][i % 5],
    }));
  }, [prescriptions]);

  const responseEntries = useMemo(() => {
    const entries: any[] = [];
    prescriptions.forEach((rx: any) => {
      const drugName = rx.medicationName || rx.medication || rx.drug || "Medication";
      for (let w = 0; w < 4; w++) {
        const date = new Date(Date.now() - (3 - w) * 7 * 86400000);
        entries.push({
          id: `${rx.id}-w${w}`,
          drug: drugName,
          dose: rx.dose || rx.dosage || "",
          date,
          effectivenessScore: Math.min(100, Math.max(20, 60 + Math.round((Math.random() - 0.3) * 40) + w * 5)),
          symptomScore: Math.max(1, Math.min(10, 7 - w + Math.round((Math.random() - 0.5) * 2))),
          sideEffectBurden: Math.max(0, Math.min(10, Math.round(Math.random() * 4))),
          patientReported: ["Feeling better", "Mild improvement", "No change", "Slight improvement"][w],
          labValue: w === 1 ? Math.round(100 + Math.random() * 30) : undefined,
        });
      }
    });
    return entries;
  }, [prescriptions]);

  const therapyBranches = useMemo(() => buildTherapyTree(prescriptions, patient.diagnosis || "General", patient.name || "Patient"), [prescriptions, patient]);

  const memoryItems = useMemo(() => {
    const items: any[] = [];
    prescriptions.forEach((rx: any) => {
      const drugName = rx.medicationName || rx.medication || rx.drug || "";
      const startDate = rx.startDate?.toDate ? rx.startDate.toDate() : new Date();
      items.push({
        id: `mem-start-${rx.id}`,
        type: "start",
        drug: drugName,
        date: startDate,
        detail: `Started ${rx.dose || rx.dosage || ""} ${rx.frequency || ""}`,
        icon: "💊",
        color: "#10b981",
        outcome: "Active",
      });
      if (rx.actualStopDate) {
        const stopDate = rx.actualStopDate.toDate ? rx.actualStopDate.toDate() : new Date();
        items.push({
          id: `mem-stop-${rx.id}`,
          type: "stop",
          drug: drugName,
          date: stopDate,
          detail: rx.stopReason || "Discontinued",
          icon: "⏹",
          color: "#6b7280",
        });
      }
    });
    sideEffects.forEach((se: any) => {
      items.push({
        id: `mem-se-${se.id}`,
        type: "side_effect",
        drug: se.medication || se.drug || "Unknown",
        date: se.onset?.toDate ? se.onset.toDate() : new Date(),
        detail: se.symptom || se.description || "",
        icon: "⚠️",
        color: "#ef4444",
        outcome: se.severity || "mild",
      });
    });
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [prescriptions, sideEffects]);

  const patientName = patient?.name || "Patient";
  const patientAge = patient?.dob
    ? Math.floor((Date.now() - new Date(patient.dob.seconds * 1000).getTime()) / 31536000000)
    : 30;
  const diagnosis = patient?.diagnoses?.[0] || patient?.activeToolTypes?.[0] || "General";

  return (
    <div style={{
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      background: "#0a0f1a", minHeight: "100vh", color: "#e2e8f0",
    }}>
      {/* Bloomberg-style header bar */}
      <div style={{
        background: "linear-gradient(90deg,#0f172a,#1e293b)",
        borderBottom: "1px solid #1e293b",
        padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#14b8a6", letterSpacing: "0.15em" }}>
            AMEXAN ⌨
          </div>
          <div style={{ width: 1, height: 20, background: "#1e293b" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9" }}>
            Medication Intelligence Center
          </div>
          <div style={{ fontSize: 9, color: "#475569" }}>
            {patientName} · {patientAge}y · {mode.toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#10b981",
            boxShadow: "0 0 8px #10b981", marginRight: 6, animation: "pulse-ring 2s infinite",
          }} />
          <span style={{ fontSize: 8, color: "#475569" }}>LIVE</span>
          <span style={{ fontSize: 8, color: "#334155", margin: "0 8px" }}>|</span>
          <span style={{ fontSize: 8, color: "#64748b" }}>{prescriptions.filter((p: any) => p.status === "active").length} active Rx</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid #1e293b",
        padding: "0 12px", background: "#0f172a", overflowX: "auto",
      }} className="no-scrollbar">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 16px", fontSize: 9, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", border: "none", cursor: "pointer", whiteSpace: "nowrap",
              background: "transparent",
              color: activeTab === tab.key ? "#14b8a6" : "#475569",
              borderBottom: activeTab === tab.key ? "2px solid #14b8a6" : "2px solid transparent",
              transition: "all 0.1s",
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ padding: 16 }}>
        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
@keyframes pulse-ring { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TherapeuticLifeTimeline events={timelineEvents} patientName={patientName} />
            {responseEntries.length > 0 && (
              <DrugResponseGraph
                entries={responseEntries.map((e: any) => ({
                  date: e.date instanceof Date ? e.date.toISOString().split("T")[0] : e.date,
                  effect: e.effectivenessScore,
                  severity: e.symptomScore * 10,
                  medication: e.drug,
                }))}
                targetRangeMin={60}
                targetRangeMax={90}
              />
            )}
            <ClinicalResponseBoard entries={responseEntries} patientName={patientName} diagnosis={diagnosis} />
          </div>
        )}

        {/* Response Tab */}
        {activeTab === "response" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <DrugResponseGraph
              entries={responseEntries.map((e: any) => ({
                date: e.date instanceof Date ? e.date.toISOString().split("T")[0] : e.date,
                effect: e.effectivenessScore,
                severity: e.symptomScore * 10,
                medication: e.drug,
              }))}
              targetRangeMin={60}
              targetRangeMax={90}
            />
            <ClinicalResponseBoard entries={responseEntries} patientName={patientName} diagnosis={diagnosis} />
          </div>
        )}

        {/* TSHEETS Tab */}
        {activeTab === "tsheets" && (
          <TSHEETS
            schedules={tsheetsData}
            date={new Date()}
            onTakeDose={(scheduleId, doseId) => console.log("Dose taken:", scheduleId, doseId)}
            onReportMissed={(scheduleId, doseId, reason) => console.log("Missed:", scheduleId, doseId, reason)}
          />
        )}

        {/* Response Tab */}
        {activeTab === "response" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <DrugResponseGraph
              entries={responseEntries.map((e: any) => ({
                date: e.date,
                effect: e.effectivenessScore,
                severity: e.symptomScore * 10,
                medication: e.drug,
              }))}
              targetRangeMin={60}
              targetRangeMax={90}
            />
            <ClinicalResponseBoard entries={responseEntries} patientName={patientName} diagnosis={diagnosis} />
          </div>
        )}

        {/* Evolution Tab */}
        {activeTab === "evolution" && (
          <MedicationEvolutionMap
            rootDiagnosis={diagnosis}
            branches={therapyBranches}
            patientName={patientName}
          />
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <PharmacyWallet
            items={inventoryData}
            onReorder={(itemId) => console.log("Reorder:", itemId)}
          />
        )}

        {/* Receipt Tab */}
        {activeTab === "receipt" && prescriptions.length > 0 && (
          <PrescriptionReceipt
            receiptId={`RX-${Date.now()}`}
            date={new Date()}
            patientName={patientName}
            patientId={patient?.id || ""}
            diagnosis={diagnosis}
            doctorName={doctor?.name || "Dr. Smith"}
            doctorLicense={doctor?.licenseNumber || "LIC-12345"}
            facility="AMEXAN Medical Center"
            items={prescriptions.filter((p: any) => p.status === "active").map((rx: any) => ({
              drug: rx.medicationName || rx.medication || rx.drug || "Medication",
              dose: rx.dose || rx.dosage || "",
              route: rx.route || "oral",
              frequency: rx.frequency || "TID",
              duration: rx.duration || "30 days",
              quantity: 30,
              refills: rx.refills || 2,
            }))}
            expectedOutcomes={[
              "Improvement in primary symptoms within 2-4 weeks",
              "Reduction in disease activity markers",
              "Improved quality of life scores",
            ]}
            warnings={[
              "May cause drowsiness — avoid driving",
              "Monitor liver function monthly",
              "Do not exceed prescribed dosage",
            ]}
          />
        )}

        {/* Memory Tab */}
        {activeTab === "memory" && (
          <LifetimeTherapeuticMemory items={memoryItems} patientName={patientName} />
        )}

        {/* Mobile Tab */}
        {activeTab === "mobile" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PatientMobileJourney
              patientName={patientName}
              date={new Date()}
              adherenceRate={Math.round(
                adherenceRecords.length > 0
                  ? (adherenceRecords.filter((a: any) => a.taken).length / adherenceRecords.length) * 100
                  : 78
              )}
              nextAppointment={new Date(Date.now() + 14 * 86400000)}
              tasks={[
                { id: "t1", time: "08:00", label: "Take Metformin", type: "medication", detail: "500mg with breakfast", done: true, icon: "💊" },
                { id: "t2", time: "09:00", label: "Blood Glucose Check", type: "measurement", detail: "Fasting reading", done: true, icon: "🩸" },
                { id: "t3", time: "12:00", label: "Take Metformin", type: "medication", detail: "500mg with lunch", done: false, icon: "💊" },
                { id: "t4", time: "14:00", label: "Walk 15 min", type: "activity", detail: "Light exercise", done: false, icon: "🚶" },
                { id: "t5", time: "18:00", label: "Take Metformin", type: "medication", detail: "500mg with dinner", done: false, icon: "💊" },
                { id: "t6", time: "20:00", label: "Evening Check-in", type: "check-in", detail: "How do you feel?", done: false, icon: "📝" },
              ]}
              onTaskComplete={(taskId) => console.log("Complete:", taskId)}
            />
          </div>
        )}

        {/* Fallback for tabs with no data */}
        {activeTab === "receipt" && prescriptions.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No prescriptions to generate a receipt</div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{
        borderTop: "1px solid #1e293b", padding: "4px 16px",
        background: "#0f172a", fontSize: 8, color: "#475569",
        display: "flex", justifyContent: "space-between",
        position: "sticky", bottom: 0,
      }}>
        <span>AMEXAN v3.0 · Medication Intelligence Engine</span>
        <span>{new Date().toLocaleString("en-GB")} · {prescriptions.length} Rx · {sideEffects.length} SE · {adherenceRecords.length} adherence records</span>
      </div>
    </div>
  );
}
