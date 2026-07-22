"use client"

import { useClinicalWorkspace } from "./workflow-state"

export default function EncounterHeader() {
  const { encounter } = useClinicalWorkspace()

  if (!encounter || !encounter.patient) {
    return (
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}
      >
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold" style={{ color: "var(--slate-300)" }}>
            AMEXAN
          </div>
          <div className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--midnight-700)", color: "var(--slate-500)" }}>
            Clinical Workspace
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--slate-500)" }}>
          <span>No active encounter</span>
        </div>
      </div>
    )
  }

  const { patient, type, id, context } = encounter
  const riskColors: Record<string, string> = {
    critical: "#dc2626",
    high: "#f97316",
    moderate: "#eab308",
    low: "#22c55e",
  }

  return (
    <div
      className="flex items-center px-4 py-2 border-b gap-4 flex-shrink-0"
      style={{ background: "var(--midnight-850)", borderColor: "var(--midnight-700)", minHeight: 56 }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        {patient.name.charAt(0)}
      </div>

      {/* Patient Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: "var(--slate-100)" }}>
            {patient.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--midnight-700)", color: "var(--slate-400)" }}>
            {id}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold" style={{ background: "#3b82f620", color: "#60a5fa" }}>
            {type}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--slate-500)" }}>
          <span>{patient.age}y {patient.sex}</span>
          <span>{patient.hospitalNumber}</span>
          <span>{patient.department}</span>
          <span style={{ color: patient.bed ? "var(--slate-300)" : undefined }}>{patient.bed || patient.location}</span>
          <span>NEWS {patient.newsScore}</span>
        </div>
      </div>

      {/* Alerts */}
      <div className="flex items-center gap-1.5">
        {patient.isCritical && (
          <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: "#dc262630", color: "#ef4444" }}>
            CRITICAL
          </span>
        )}
        {patient.isDNR && (
          <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: "#7c3aed30", color: "#a78bfa" }}>
            DNR
          </span>
        )}
        {patient.isIsolation && (
          <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: "#eab30830", color: "#facc15" }}>
            ISOLATION
          </span>
        )}
        {patient.isPregnant && (
          <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: "#ec489930", color: "#f472b6" }}>
            PREGNANT
          </span>
        )}
        {patient.allergies.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: "#f9731630", color: "#fb923c" }}>
            ⚠ {patient.allergies.join(", ")}
          </span>
        )}
      </div>

      {/* Risk Level */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
        style={{
          background: `${riskColors[context.riskLevel]}20`,
          color: riskColors[context.riskLevel],
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: riskColors[context.riskLevel] }}
        />
        {context.riskLevel.toUpperCase()} RISK
      </div>
    </div>
  )
}
