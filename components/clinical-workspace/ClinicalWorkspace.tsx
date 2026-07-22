"use client"

import dynamic from "next/dynamic"
import EncounterHeader from "./EncounterHeader"
import EncounterPanel from "./EncounterPanel"
import BottomBar from "./BottomBar"
import { useClinicalWorkspace } from "./workflow-state"

const PatientQueue = dynamic(() => import("./queue/PatientQueue"), { ssr: false })
const ClinicalAssistant = dynamic(() => import("./ClinicalAssistant"), { ssr: false })

export default function ClinicalWorkspace() {
  const { queueCollapsed, toggleQueue } = useClinicalWorkspace()

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{
        background: "var(--midnight-900)",
        color: "var(--slate-200)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* ============================================ */}
      {/* TOP: Persistent Encounter Header */}
      {/* ============================================ */}
      <EncounterHeader />

      {/* ============================================ */}
      {/* MIDDLE: 3-Panel Layout */}
      {/* ============================================ */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Patient Queue */}
        <div
          className="flex-shrink-0 border-r overflow-hidden transition-all duration-200"
          style={{
            width: queueCollapsed ? 0 : 300,
            borderColor: "var(--midnight-700)",
            minWidth: queueCollapsed ? 0 : 300,
          }}
        >
          {!queueCollapsed && <PatientQueue />}
        </div>

        {/* Queue toggle button (when collapsed) */}
        {queueCollapsed && (
          <button
            onClick={toggleQueue}
            className="flex-shrink-0 w-6 flex items-center justify-center text-[10px] border-r cursor-pointer hover:opacity-80"
            style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)", color: "var(--slate-500)" }}
          >
            ▶
          </button>
        )}

        {/* CENTER: Active Encounter (workflow) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EncounterPanel />
        </div>

        {/* RIGHT: Clinical Assistant */}
        <div className="flex-shrink-0 border-l relative overflow-hidden" style={{ borderColor: "var(--midnight-700)" }}>
          <ClinicalAssistant />
        </div>
      </div>

      {/* ============================================ */}
      {/* BOTTOM: Status Bar */}
      {/* ============================================ */}
      <BottomBar />
    </div>
  )
}
