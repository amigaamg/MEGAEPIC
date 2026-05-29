"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const HTNDashboard = lazy(() => import("@/components/bp-monitor/HTNDashboard"));
const DiabetesDashboard = lazy(() => import("./DiabetesDashboard"));
const CKDDashboard = lazy(() => import("./CKDDashboard"));
const HeartFailureDashboard = lazy(() => import("./HeartFailureDashboard"));
const AsthmaDashboard = lazy(() => import("./AsthmaDashboard"));
const COPDDashboard = lazy(() => import("./COPDDashboard"));
const HIVDashboard: React.LazyExoticComponent<React.ComponentType<any>> = lazy(() => import("./HIVDashboard").then(m => ({ default: (m as any).default })));
const SickleCellDashboard = lazy(() => import("./SickleCellDashboard"));

export type DiseaseType = "hypertension" | "diabetes_t2" | "ckd" | "heart_failure" | "asthma" | "copd" | "hiv" | "sickle_cell";

export const DISEASE_META: Record<DiseaseType, { icon: string; label: string; color: string }> = {
  hypertension: { icon: "❤️", label: "Hypertension Control Center", color: "#dc2626" },
  diabetes_t2: { icon: "🍬", label: "Diabetes Intelligence Center", color: "#d97706" },
  ckd: { icon: "🫘", label: "CKD Command Center", color: "#059669" },
  heart_failure: { icon: "💔", label: "Heart Failure Hub", color: "#db2777" },
  asthma: { icon: "🌬️", label: "Asthma Control Center", color: "#2563eb" },
  copd: { icon: "🫁", label: "COPD Management Center", color: "#6366f1" },
  hiv: { icon: "🧬", label: "HIV Care Center", color: "#7c3aed" },
  sickle_cell: { icon: "🩸", label: "Sickle Cell Disease Center", color: "#ef4444" },
};

interface Props {
  patientId?: string;
  doctorId?: string;
  doctorName?: string;
  diseaseType: DiseaseType;
  compact?: boolean;
  onLaunchTool?: (toolId: string) => void;
  onOpenConversation?: (patientId: string) => void;
  onOpenReferrals?: (patientId: string) => void;
}

function LoadingFallback({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${color}20`, borderTopColor: color, animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "#6b7280", fontSize: 13 }}>Loading clinical dashboard…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function DiseaseDashboardHub({ patientId, doctorId, doctorName, diseaseType, compact, onLaunchTool, onOpenConversation, onOpenReferrals }: Props) {
  const meta = DISEASE_META[diseaseType];
  const [resolvedPatientId, setResolvedPatientId] = useState(patientId);

  useEffect(() => {
    if (patientId && patientId !== "new") {
      getDoc(doc(db, "users", patientId)).then(snap => {
        if (snap?.exists()) {
          const data = snap.data();
          setResolvedPatientId(patientId);
        }
      }).catch(() => {});
    }
  }, [patientId]);

  const dashboards: Record<DiseaseType, React.ReactNode> = {
    hypertension: <HTNDashboard doctorId={doctorId} doctorName={doctorName} onOpenConversation={onOpenConversation} onOpenReferrals={onOpenReferrals} />,
    diabetes_t2: <DiabetesDashboard patientId={resolvedPatientId} />,
    ckd: <CKDDashboard doctorId={doctorId} doctorName={doctorName} onOpenConversation={onOpenConversation} onOpenReferrals={onOpenReferrals} />,
    heart_failure: <HeartFailureDashboard patientId={resolvedPatientId} patients={[] as any} onPatientChange={function(){} as any} />,
    asthma: <AsthmaDashboard />,
    copd: <COPDDashboard doctorId={doctorId} doctorName={doctorName} onOpenConversation={onOpenConversation} onOpenReferrals={onOpenReferrals} />,
    hiv: <HIVDashboard doctorId={doctorId} doctorName={doctorName} onOpenConversation={onOpenConversation} onOpenReferrals={onOpenReferrals} />,
    sickle_cell: <SickleCellDashboard doctorId={doctorId} doctorName={doctorName} onOpenConversation={onOpenConversation} onOpenReferrals={onOpenReferrals} />,
  };

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Suspense fallback={<LoadingFallback color={meta.color} />}>
        {dashboards[diseaseType]}
      </Suspense>
    </div>
  );
}
