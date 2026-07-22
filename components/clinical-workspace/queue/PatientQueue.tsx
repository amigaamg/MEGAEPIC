"use client"

import { useClinicalWorkspace } from "../workflow-state"
import { type PatientSummary } from "../types"

const PRIORITY_COLORS: Record<string, string> = {
  immediate: "#dc2626",
  emergency: "#f97316",
  urgent: "#eab308",
  "semi-urgent": "#3b82f6",
  routine: "#22c55e",
}

const NEWS_COLORS: Record<number, string> = {
  0: "#22c55e",
  1: "#22c55e",
  2: "#eab308",
  3: "#eab308",
  4: "#f97316",
  5: "#f97316",
  6: "#dc2626",
  7: "#dc2626",
  8: "#7c3aed",
  9: "#7c3aed",
}

export default function PatientQueue() {
  const { activeTab, setActiveTab, queue, selectPatient, selectedPatient, startEncounter } = useClinicalWorkspace()

  const QUEUE_TABS = [
    { id: "emergency", label: "Emergency", count: 4, icon: "🚨" },
    { id: "ward", label: "Ward", count: 12, icon: "🏥" },
    { id: "clinic", label: "Clinic", count: 8, icon: "🩺" },
    { id: "icu", label: "ICU", count: 3, icon: "💉" },
    { id: "theatre", label: "Theatre", count: 2, icon: "🔬" },
    { id: "telemedicine", label: "Telemedicine", count: 5, icon: "📹" },
    { id: "completed", label: "Completed", count: 24, icon: "✅" },
  ]

  const handlePatientClick = (patient: PatientSummary) => {
    selectPatient(patient)
  }

  const handleStartEncounter = () => {
    const patient = selectedPatient || queue[0]
    if (!patient) return

    const typeMap: Record<string, any> = {
      emergency: "emergency",
      ward: "ward",
      clinic: "clinic",
      icu: "icu",
      theatre: "theatre",
      telemedicine: "telemedicine",
    }

    startEncounter(typeMap[activeTab] || "clinic", patient.department)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--midnight-900)" }}>
      {/* Queue Tabs */}
      <div className="flex-shrink-0 p-3 border-b" style={{ borderColor: "var(--midnight-700)" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--slate-200)" }}>
            Patient Queue
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--midnight-700)", color: "var(--slate-400)" }}>
            {queue.length} patients
          </span>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {QUEUE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab.id ? "var(--accent)" : "var(--midnight-800)",
                color: activeTab === tab.id ? "#fff" : "var(--slate-400)",
                opacity: activeTab === tab.id ? 1 : 0.7,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]"
                style={{
                  background: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "var(--midnight-700)",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-xs" style={{ color: "var(--slate-500)" }}>
            <span className="text-2xl mb-2">📋</span>
            <span>No patients in this queue</span>
          </div>
        ) : (
          queue.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              isSelected={selectedPatient?.id === patient.id}
              onClick={() => handlePatientClick(patient)}
              onStart={() => {
                selectPatient(patient)
                handleStartEncounter()
              }}
            />
          ))
        )}
      </div>

      {/* Start Encounter Button */}
      {selectedPatient && (
        <div className="flex-shrink-0 p-3 border-t" style={{ borderColor: "var(--midnight-700)" }}>
          <button
            onClick={handleStartEncounter}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            START ENCOUNTER
          </button>
        </div>
      )}
    </div>
  )
}

function PatientCard({
  patient,
  isSelected,
  onClick,
  onStart,
}: {
  patient: PatientSummary
  isSelected: boolean
  onClick: () => void
  onStart: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="rounded-xl p-3 cursor-pointer transition-all border"
      style={{
        background: isSelected ? "var(--midnight-700)" : "var(--midnight-800)",
        borderColor: isSelected ? "var(--accent)" : "var(--midnight-700)",
        boxShadow: isSelected ? "0 0 0 1px var(--accent)" : "none",
      }}
    >
      {/* Priority + Critical indicators */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: PRIORITY_COLORS[patient.priority] || "#6b7280" }}
          />
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--slate-500)" }}>
            {patient.priority}
          </span>
        </div>
        <div className="flex gap-1">
          {patient.isCritical && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: "#dc262620", color: "#ef4444" }}>
              CRITICAL
            </span>
          )}
          {patient.isIsolation && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: "#eab30820", color: "#eab308" }}>
              ISOLATION
            </span>
          )}
          {patient.isPregnant && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: "#ec489920", color: "#ec4899" }}>
              PREGNANT
            </span>
          )}
        </div>
      </div>

      {/* Name + ID */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {patient.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: "var(--slate-100)" }}>
            {patient.name}
          </div>
          <div className="text-[10px]" style={{ color: "var(--slate-500)" }}>
            {patient.hospitalNumber} · {patient.age}y {patient.sex}
          </div>
        </div>
      </div>

      {/* Complaint */}
      <div className="text-xs mb-2 line-clamp-2" style={{ color: "var(--slate-300)" }}>
        {patient.complaint}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* NEWS Score */}
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
            style={{
              background: `${NEWS_COLORS[patient.newsScore] || "#6b7280"}20`,
              color: NEWS_COLORS[patient.newsScore] || "#6b7280",
            }}
          >
            {patient.newsScore}
          </div>
          {/* Waiting time */}
          {patient.waitingMinutes > 0 && (
            <span className="text-[10px]" style={{ color: "var(--slate-500)" }}>
              ⏱ {patient.waitingMinutes}m
            </span>
          )}
          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <span className="text-[10px]" style={{ color: "#f97316" }}>
              ⚠ {patient.allergies[0]}
            </span>
          )}
        </div>
        <div className="text-[10px]" style={{ color: "var(--slate-500)" }}>
          {patient.bed || patient.location}
        </div>
      </div>
    </div>
  )
}
