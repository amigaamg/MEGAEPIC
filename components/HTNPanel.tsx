"use client";

import HTNDashboard from "@/components/bp-monitor/HTNDashboard";

interface HTNPanelProps {
  patientId: string;
  patient: {
    id: string;
    name: string;
    age?: number;
    sex?: string;
    primaryDx?: string;
    riskCategory?: string;
    followUpInterval?: string;
    lastVisit?: Date;
    nextReview?: Date;
  };
}

export default function HTNPanel({ patientId, patient }: HTNPanelProps) {
  return (
    <HTNDashboard
      doctorId={patientId}
      doctorName={patient.name}
    />
  );
}
