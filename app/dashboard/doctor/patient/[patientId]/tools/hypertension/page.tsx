"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";

import {
  usePatient,
  useBPEntries,
  usePrescriptions,
  useFollowUps,
  useClinicalNotes,
  useAlerts,
  useLabOrders,
  useComplications,
} from "@/hooks/useAmexan";

import PatientHeader       from "@/components/amexan/PatientHeader";
import ToolTabs            from "@/components/amexan/ToolTabs";
import AlertsBanner        from "@/components/amexan/AlertsBanner";
import HTNSidebar          from "@/components/amexan/htn/HTNSidebar";
import ClinicalSnapshot    from "@/components/amexan/htn/ClinicalSnapshot";
import BPIntelligence      from "@/components/amexan/htn/BPIntelligence";
import PrescriptionManager from "@/components/amexan/htn/PrescriptionManager";
import FollowUpScheduler   from "@/components/amexan/htn/FollowUpScheduler";
import ClinicalNotes       from "@/components/amexan/htn/ClinicalNotes";
import LabOrders           from "@/components/amexan/htn/LabOrders";
import ImagingOrders       from "@/components/amexan/htn/ImagingOrders";
import PatientMessaging    from "@/components/amexan/htn/PatientMessaging";
import ToolSettings        from "@/components/amexan/htn/ToolSettings";

export type HTNPanel =
  | "snapshot" | "bp" | "prescriptions" | "followups"
  | "notes" | "labs" | "imaging" | "messaging" | "settings";

const DOCTOR_ID = "doctor_sarah_kimani";
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function HTNToolPage() {
  const params    = useParams();
  const patientId = typeof params?.patientId === "string"
    ? params.patientId
    : Array.isArray(params?.patientId)
    ? params.patientId![0]
    : "";

  const [activePanel, setActivePanel] = useState<HTNPanel>("snapshot");

  const { data: toolsList, isLoading: loadingTools } = useSWR<any[]>(
    patientId ? `/api/amexan/tools?patientId=${patientId}&status=active` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const htnTool = toolsList?.find(
    (t: any) => t.tool_type === "hypertension" || t.toolType === "hypertension"
  );
  const TOOL_ID = htnTool?.id ?? "";

  const { patient, loading: loadingPatient } = usePatient(patientId);

  const { data: toolData, mutate: revalidateTool } = useSWR<any>(
    TOOL_ID ? `/api/amexan/tools/${TOOL_ID}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const updateThresholds = async (thresholds: any) => {
    await fetch(`/api/amexan/tools/${TOOL_ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertThresholds: thresholds }),
    });
    revalidateTool();
  };

  const normTool = toolData ? {
    ...toolData,
    patientId:           toolData.patient_id   ?? toolData.patientId,
    doctorId:            toolData.doctor_id    ?? toolData.doctorId,
    toolType:            toolData.tool_type    ?? toolData.toolType,
    targetBP:            toolData.target_bp    ?? toolData.targetBP    ?? "<130/80",
    monitoringFrequency: toolData.monitoring_frequency ?? toolData.monitoringFrequency ?? "daily",
    clinicalNotes:       toolData.clinical_notes ?? toolData.clinicalNotes ?? "",
    alertThresholds:     toolData.alert_thresholds ?? toolData.alertThresholds ?? {
      systolicCritical: 180, diastolicCritical: 120,
      systolicWarning:  160, diastolicWarning:  100,
      systolicTarget:   130, diastolicTarget:    80,
      hypotensionSystolic: 90, adherenceLow: 70,
      bpReadingGapDays: 3, uncontrolledReadingsCount: 7, uncontrolledReadingsDays: 14,
    },
  } : null;

  const { entries, chartData, stats, logBP: logBPOrig } = useBPEntries(
    TOOL_ID, patientId, normTool?.alertThresholds
  );
  const logBP = async (entry: Partial<import('@/types').BPEntry>): Promise<void> => { await logBPOrig(entry as any); };
  const { active: rxActive, stopped: rxStopped, prescribe: prescribeOrig, adjustDose: adjustDoseOrig, stopDrug } = usePrescriptions(TOOL_ID, patientId);
  const prescribe = async (rx: Partial<import('@/types').Prescription>): Promise<void> => { await prescribeOrig(rx as any); };
  const adjustDose = async (id: string, newDose: string, reason: string, doctorId: string): Promise<void> => { await adjustDoseOrig(id, newDose, reason, doctorId); };
  const { followUps, upcoming, scheduleVisit, markAttended, markMissed, attendanceRate } = useFollowUps(TOOL_ID, patientId);
  const { notes, addNote }               = useClinicalNotes(TOOL_ID);
  const { active: activeAlerts, critical, warnings, acknowledge } = useAlerts(TOOL_ID);
  const { orders: labs, pending: pendingLabs, orderLabs } = useLabOrders(TOOL_ID, patientId, DOCTOR_ID);
  const { complications } = useComplications(TOOL_ID);

  const loading = loadingPatient || loadingTools;

  if (loading) return <HTNSkeleton />;
  if (!patient) return <HTNErrorState patientId={patientId} message="Patient not found" />;
  if (!TOOL_ID || !normTool) return (
    <HTNErrorState
      patientId={patientId}
      message="No active HTN tool found for this patient"
      hint="Go back and register the patient with a Hypertension tool assigned"
    />
  );

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: "#0c1520",
      fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
    }}>
      <HTNSidebar
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        activeAlertCount={activeAlerts.length}
        criticalCount={critical.length}
        pendingLabCount={pendingLabs.length}
        upcomingVisitCount={upcoming.length}
        onLogBP={() => setActivePanel("bp")}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <PatientHeader
          patient={patient}
          tool={normTool}
          nextFollowUp={upcoming[0] ?? null}
          stats={stats}
          onNewBP={() => setActivePanel("bp")}
        />
        <ToolTabs patientId={patientId} activeTool="hypertension" complications={complications} />
        {critical.length > 0 && <AlertsBanner alerts={critical} onAcknowledge={acknowledge} />}
        <PanelTabs active={activePanel} onChange={setActivePanel} pendingLabCount={pendingLabs.length} warningCount={warnings.length} />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {activePanel === "snapshot" && (
            <ClinicalSnapshot patient={patient} tool={normTool} stats={stats} bpEntries={entries}
              chartData={chartData} prescriptions={rxActive} complications={complications} recentNote={notes[0] ?? null} />
          )}
          {activePanel === "bp" && (
            <BPIntelligence toolId={TOOL_ID} patientId={patientId} entries={entries} chartData={chartData}
              stats={stats} thresholds={normTool.alertThresholds} prescriptions={[...rxActive, ...rxStopped]}
              onLogBP={logBP} doctorId={DOCTOR_ID} />
          )}
          {activePanel === "prescriptions" && (
            <PrescriptionManager toolId={TOOL_ID} patientId={patientId} doctorId={DOCTOR_ID}
              active={rxActive} stopped={rxStopped} bpEntries={entries}
              onPrescribe={prescribe} onAdjustDose={adjustDose} onStopDrug={(id: string) => stopDrug(id, 'reason', DOCTOR_ID)} />
          )}
          {activePanel === "followups" && (
            <FollowUpScheduler toolId={TOOL_ID} patientId={patientId} doctorId={DOCTOR_ID}
              followUps={followUps} attendanceRate={attendanceRate} notes={notes}
              onSchedule={scheduleVisit} onMarkAttended={markAttended} onMarkMissed={markMissed} />
          )}
          {activePanel === "notes" && (
            <ClinicalNotes toolId={TOOL_ID} patientId={patientId} doctorId={DOCTOR_ID}
              notes={notes} prescriptions={[...rxActive, ...rxStopped]} followUps={followUps} labs={labs} onAddNote={addNote} />
          )}
          {activePanel === "labs" && (
            <LabOrders toolId={TOOL_ID} patientId={patientId} doctorId={DOCTOR_ID} orders={labs} onOrderLabs={orderLabs} />
          )}
          {activePanel === "imaging" && (
            <ImagingOrders toolId={TOOL_ID} patientId={patientId} doctorId={DOCTOR_ID} />
          )}
          {activePanel === "messaging" && (
            <PatientMessaging patientId={patientId} doctorId={DOCTOR_ID} patient={patient} />
          )}
          {activePanel === "settings" && (
            <ToolSettings tool={normTool} onUpdateThresholds={updateThresholds} />
          )}
        </div>
      </div>
    </div>
  );
}

const PANELS: { id: HTNPanel; label: string; icon: string }[] = [
  { id: "snapshot",      label: "Clinical Snapshot",  icon: "🩺" },
  { id: "bp",            label: "BP Monitoring",       icon: "❤️" },
  { id: "prescriptions", label: "Prescriptions",       icon: "💊" },
  { id: "followups",     label: "Follow-Ups",          icon: "📅" },
  { id: "notes",         label: "Clinical Notes",      icon: "📝" },
  { id: "labs",          label: "Lab Orders",          icon: "🧪" },
  { id: "imaging",       label: "Imaging",             icon: "🫀" },
  { id: "messaging",     label: "Messaging",           icon: "✉️" },
  { id: "settings",      label: "Settings",            icon: "⚙️" },
];

function PanelTabs({ active, onChange, pendingLabCount, warningCount }: {
  active: HTNPanel; onChange: (p: HTNPanel) => void;
  pendingLabCount: number; warningCount: number;
}) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #1e2d3d", background: "#111c27", overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
      {PANELS.map(p => {
        const badge = p.id === "labs" && pendingLabCount > 0 ? pendingLabCount : p.id === "bp" && warningCount > 0 ? warningCount : 0;
        return (
          <button key={p.id} onClick={() => onChange(p.id)} style={{
            padding: "12px 16px", background: "none", border: "none",
            borderBottom: active === p.id ? "2px solid #3b82f6" : "2px solid transparent",
            color: active === p.id ? "#60a5fa" : "#4a6785",
            fontWeight: active === p.id ? 600 : 400,
            fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s", flexShrink: 0,
          }}>
            <span style={{ fontSize: 13 }}>{p.icon}</span>
            {p.label}
            {badge > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: "99px", fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function HTNSkeleton() {
  return (
    <div style={{ height: "100vh", background: "#0c1520", display: "flex" }}>
      <div style={{ width: 216, background: "#0f1923", borderRight: "1px solid #1e2d3d" }} />
      <div style={{ flex: 1, padding: 24 }}>
        <style>{`@keyframes pulse{0%,100%{opacity:.35}50%{opacity:.65}}`}</style>
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          {[64, 200, 140, 160].map((w, i) => (
            <div key={i} style={{ width: w, height: 52, background: "#131e2b", borderRadius: 8, animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite` }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[280, 320, 260, 300].map((h, i) => (
            <div key={i} style={{ height: h, background: "#131e2b", borderRadius: 12, animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HTNErrorState({ patientId, message, hint }: { patientId: string; message?: string; hint?: string }) {
  return (
    <div style={{ height: "100vh", background: "#0c1520", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 36 }}>⚠️</div>
      <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 16 }}>{message ?? "Patient data not found"}</div>
      {hint && <div style={{ color: "#64748b", fontSize: 13, maxWidth: 360, textAlign: "center" }}>{hint}</div>}
      <div style={{ background: "#131e2b", border: "1px solid #1e2d3d", borderRadius: 8, padding: "8px 16px", color: "#4a6785", fontSize: 11, fontFamily: "monospace", marginTop: 6 }}>
        patientId: {patientId}
      </div>
    </div>
  );
}