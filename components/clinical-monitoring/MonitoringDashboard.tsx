"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { DISEASE_META } from "@/components/clinical-dashboards/DiseaseDashboardHub";

interface DiseaseEnrollment {
  id: string; patientId: string; diseaseType: string; status: string;
  enrolledAt?: any; milestones?: any[];
}

interface PatientData {
  uid: string; name: string; age?: number; sex?: string;
}

interface ToolAssignment {
  id: string; patientId: string; toolId: string; toolName: string;
  toolCategory: string; active: boolean; assignedAt?: any;
}

interface Props {
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  onLaunchTool?: (toolId: string) => void;
}

const DISEASE_TOOL_MAP: Record<string, { tools: { id: string; label: string; icon: string }[] }> = {
  hypertension: {
    tools: [
      { id: "bp_trend", label: "BP Trend & Analysis", icon: "📈" },
      { id: "cv_risk_framingham", label: "CV Risk Assessment", icon: "🧮" },
      { id: "antihypertensive_protocol", label: "Antihypertensive Protocol", icon: "📋" },
      { id: "bp_target", label: "BP Target Achievement", icon: "🎯" },
      { id: "med_adherence", label: "Medication Adherence", icon: "💊" },
      { id: "renal_panel", label: "Renal Function Panel", icon: "🧪" },
      { id: "ecg_echo", label: "ECG / Echo", icon: "🩻" },
      { id: "home_bp_guide", label: "Home BP Guide", icon: "🏠" },
      { id: "htn_staging", label: "HTN Severity Staging", icon: "📊" },
    ],
  },
  diabetes_t2: {
    tools: [
      { id: "hba1c_trend", label: "HbA1c Trend", icon: "📈" },
      { id: "glucose_log", label: "Glucose Log", icon: "🩸" },
      { id: "insulin_dose", label: "Insulin Dose Tracker", icon: "💉" },
      { id: "foot_exam", label: "Foot Examination", icon: "🦶" },
      { id: "retinopathy", label: "Retinopathy Status", icon: "👁️" },
      { id: "med_adherence", label: "Medication Adherence", icon: "💊" },
      { id: "cv_risk_framingham", label: "CV Risk Assessment", icon: "🧮" },
      { id: "renal_panel", label: "Renal Function Panel", icon: "🧪" },
    ],
  },
  ckd: {
    tools: [
      { id: "renal_panel", label: "Renal Function Panel", icon: "🧪" },
      { id: "bp_trend", label: "BP Trend", icon: "📈" },
      { id: "med_adherence", label: "Medication Adherence", icon: "💊" },
      { id: "cv_risk_framingham", label: "CV Risk Assessment", icon: "🧮" },
    ],
  },
  heart_failure: {
    tools: [
      { id: "ecg_echo", label: "ECG / Echo", icon: "🩻" },
      { id: "bp_trend", label: "BP Trend", icon: "📈" },
      { id: "med_adherence", label: "Medication Adherence", icon: "💊" },
      { id: "renal_panel", label: "Renal Function Panel", icon: "🧪" },
    ],
  },
};

export default function MonitoringDashboard({ patientId, patientName, doctorId, doctorName, onLaunchTool }: Props) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [enrolledDiseases, setEnrolledDiseases] = useState<DiseaseEnrollment[]>([]);
  const [assignedTools, setAssignedTools] = useState<ToolAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!patientId || patientId === "new") { setLoading(false); return; }
    const unsubEnroll = onSnapshot(
      query(collection(db, "disease_enrollments"), where("patientId", "==", patientId), where("status", "==", "active")),
      snap => {
        setEnrolledDiseases(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiseaseEnrollment)));
      }
    );
    const unsubTools = onSnapshot(
      query(collection(db, "tool_assignments"), where("patientId", "==", patientId), where("active", "==", true)),
      snap => {
        setAssignedTools(snap.docs.map(d => ({ id: d.id, ...d.data() } as ToolAssignment)));
      }
    );
    getDoc(doc(db, "users", patientId)).then(s => {
      if (s.exists()) setPatient({ uid: s.id, ...s.data() } as PatientData);
    }).catch(() => {});
    return () => { unsubEnroll(); unsubTools(); };
  }, [patientId]);

  const uniqueDiseases = [...new Set(enrolledDiseases.map(e => e.diseaseType))];

  const getDiseaseTools = (diseaseType: string) => {
    const mapping = DISEASE_TOOL_MAP[diseaseType];
    if (!mapping) return [];
    return mapping.tools;
  };

  const allRelevantTools = uniqueDiseases.flatMap(d => getDiseaseTools(d));
  const uniqueTools = allRelevantTools.filter((t, i, a) => a.findIndex(x => x.id === t.id) === i);

  const hasData = uniqueDiseases.length > 0 || assignedTools.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "slideUp .25s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0d1b2a" }}>📊 Patient-Based Monitoring</div>
          <div style={{ fontSize: 11, color: "#8fa3bd" }}>
            {patientId && patientId !== "new"
              ? `${patient?.name || patientName || "Patient"} — ${uniqueDiseases.length} condition(s)`
              : "Select a patient to see assigned monitoring tools"}
          </div>
        </div>
      </div>

      {(!patientId || patientId === "new") && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: 14, border: "1px dashed #cbd5e1" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Select a patient from the registry to view their</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>assigned monitoring tools and disease dashboards.</div>
        </div>
      )}

      {loading && patientId && patientId !== "new" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
        </div>
      )}

      {patientId && patientId !== "new" && !loading && (
        <>
          {/* Disease enrollment cards */}
          {uniqueDiseases.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                🏥 Enrolled Conditions
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {uniqueDiseases.map(dt => {
                  const meta = DISEASE_META[dt as keyof typeof DISEASE_META];
                  if (!meta) return null;
                  return (
                    <div key={dt} style={{
                      padding: "10px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8,
                      background: `${meta.color}10`, border: `1px solid ${meta.color}30`,
                    }}>
                      <span style={{ fontSize: 20 }}>{meta.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12, color: meta.color }}>{meta.label}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>Comprehensive monitoring active</div>
                      </div>
                      <button
                        onClick={() => onLaunchTool?.(`disease_${dt}`)}
                        style={{ marginLeft: 8, padding: "4px 10px", borderRadius: 6, border: `1px solid ${meta.color}40`, background: `${meta.color}08`, color: meta.color, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Open Dashboard →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assigned tools */}
          {uniqueTools.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                🛠️ Available Monitoring Tools
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                {uniqueTools.map(tool => (
                  <button key={tool.id} onClick={() => onLaunchTool?.(tool.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                      background: "#fff", border: "1px solid #e2e8f0", fontFamily: "inherit",
                      transition: "all .14s", display: "flex", alignItems: "center", gap: 10,
                      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                    }}>
                    <span style={{ fontSize: 20 }}>{tool.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1b2a" }}>{tool.label}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>Click to open</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No data state */}
          {!hasData && (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: 14, border: "1px dashed #cbd5e1" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🛠️</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>No monitoring tools assigned yet.</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                Tools appear here once the patient is enrolled in a disease program.
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              ⚡ Quick Actions
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: "📋", label: "View Full Dashboard", action: () => {
                  const primaryDisease = uniqueDiseases[0] || "hypertension";
                  onLaunchTool?.(`disease_${primaryDisease}`);
                }, color: "#0aaa76" },
                { icon: "💊", label: "Medication Adherence", action: () => onLaunchTool?.("med_adherence"), color: "#6366f1" },
                { icon: "📝", label: "Clinical Note", action: () => {}, color: "#f97316" },
                { icon: "📊", label: "Vitals Overview", action: () => {}, color: "#dc2626" },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${btn.color}30`, background: `${btn.color}08`, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: btn.color, display: "flex", alignItems: "center", gap: 6 }}>
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
