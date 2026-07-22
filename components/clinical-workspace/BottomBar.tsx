"use client"

import { useClinicalWorkspace } from "./workflow-state"

export default function BottomBar() {
  const { encounter, phase, observations, complaints } = useClinicalWorkspace()

  return (
    <div
      className="flex items-center justify-between px-4 py-1.5 border-t text-[10px] flex-shrink-0"
      style={{ background: "var(--midnight-900)", borderColor: "var(--midnight-700)", color: "var(--slate-500)" }}
    >
      <div className="flex items-center gap-4">
        <span>💾 Autosaved</span>
        <span>🔄 Live</span>
        <span>📶 Connected</span>
        <span>📝 Draft</span>
        <span>⚙️ CRL Engine Active</span>
      </div>
      <div className="flex items-center gap-4">
        {encounter && (
          <>
            <span>Phase: {phase}</span>
            <span>Obs: {observations.length}</span>
            <span>Complaints: {complaints.length}</span>
          </>
        )}
        <span>AMEXAN v2.0</span>
        <span>User: Dr. Default</span>
        <span>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}
