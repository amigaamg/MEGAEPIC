"use client"

import { useClinicalWorkspace } from "./workflow-state"
import WorkflowNavigator from "./WorkflowNavigator"
import PhaseRenderer from "./phases/PhaseRenderer"

export default function EncounterPanel() {
  const { encounter } = useClinicalWorkspace()

  if (!encounter) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-4xl mb-3">🩺</div>
        <h2 className="text-lg font-bold mb-1" style={{ color: "var(--slate-300)" }}>
          No Active Encounter
        </h2>
        <p className="text-xs text-center max-w-md" style={{ color: "var(--slate-500)" }}>
          Select a patient from the queue and click "Start Encounter" to begin a clinical workflow.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <WorkflowNavigator />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <PhaseRenderer />
      </div>
    </div>
  )
}
