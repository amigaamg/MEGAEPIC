"use client"

import { useClinicalWorkspace } from "./workflow-state"
import type { WorkflowPhase } from "./types"

const WORKFLOW_STEPS: { id: WorkflowPhase; label: string; icon: string }[] = [
  { id: "registration", label: "Registration", icon: "📋" },
  { id: "complaint", label: "Complaint", icon: "💬" },
  { id: "hpi", label: "HPI", icon: "📝" },
  { id: "pmh", label: "Past History", icon: "📚" },
  { id: "examination", label: "Exam", icon: "🩺" },
  { id: "investigations", label: "Investigations", icon: "🔬" },
  { id: "diagnosis", label: "Diagnosis", icon: "🎯" },
  { id: "management", label: "Management", icon: "💊" },
  { id: "documentation", label: "Doc", icon: "📄" },
  { id: "disposition", label: "Disposition", icon: "🚪" },
  { id: "complete", label: "Complete", icon: "✅" },
]

export default function WorkflowNavigator() {
  const { phase, setPhase, encounterHistory, getWorkflowProgress } = useClinicalWorkspace()
  const completedPhases = encounterHistory.map((h) => h.phase)
  const progress = getWorkflowProgress()

  return (
    <div className="flex-shrink-0 px-4 py-2 border-b" style={{ borderColor: "var(--midnight-700)" }}>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--midnight-700)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "var(--accent)" }}
          />
        </div>
        <span className="text-[10px] font-medium" style={{ color: "var(--slate-500)" }}>
          {progress}%
        </span>
      </div>

      {/* Step beads */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {WORKFLOW_STEPS.map((step) => {
          const isActive = step.id === phase
          const isCompleted = completedPhases.includes(step.id)
          const isAvailable = isActive || isCompleted

          return (
            <button
              key={step.id}
              onClick={() => isAvailable && setPhase(step.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all"
              style={{
                background: isActive ? "var(--accent)" : isCompleted ? "var(--midnight-700)" : "transparent",
                color: isActive ? "#fff" : isCompleted ? "var(--slate-300)" : "var(--slate-600)",
                cursor: isAvailable ? "pointer" : "default",
                opacity: isActive || isCompleted ? 1 : 0.5,
              }}
            >
              <span>{step.icon}</span>
              <span>{step.label}</span>
              {isCompleted && <span className="text-[8px]">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
