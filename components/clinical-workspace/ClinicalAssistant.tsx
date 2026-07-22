"use client"

import { useClinicalWorkspace } from "./workflow-state"

export default function ClinicalAssistant() {
  const { encounter, differentials, questions, assistantCollapsed, toggleAssistant } = useClinicalWorkspace()

  if (assistantCollapsed) {
    return (
      <button
        onClick={toggleAssistant}
        className="flex items-center justify-center w-8 py-2 rounded-l-lg absolute -left-8 top-1/2 -translate-y-1/2"
        style={{ background: "var(--midnight-800)", color: "var(--slate-400)" }}
      >
        ◀
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--midnight-850)", width: 300 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--midnight-700)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--slate-200)" }}>
          Clinical Assistant
        </h3>
        <button onClick={toggleAssistant} className="text-xs px-2 py-1 rounded" style={{ color: "var(--slate-500)" }}>
          ▶
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {/* Current Differential */}
        <AssistantSection title="Current Differential">
          {differentials.length === 0 ? (
            <div className="text-xs py-2" style={{ color: "var(--slate-500)" }}>
              No differentials yet. Complete the history to generate.
            </div>
          ) : (
            differentials.slice(0, 4).map((dd) => (
              <div key={dd.diseaseId} className="flex items-center justify-between py-1.5 border-b border-dashed last:border-0" style={{ borderColor: "var(--midnight-700)" }}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: "var(--slate-200)" }}>
                    {dd.diseaseName}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--slate-500)" }}>
                    <span>Rank #{dd.rank}</span>
                    <span>Conf: {(dd.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: dd.probability > 70 ? "#dc262620" : dd.probability > 40 ? "#eab30820" : "#22c55e20",
                    color: dd.probability > 70 ? "#ef4444" : dd.probability > 40 ? "#eab308" : "#22c55e",
                  }}
                >
                  {dd.probability.toFixed(0)}%
                </div>
              </div>
            ))
          )}
        </AssistantSection>

        {/* Missing Information */}
        <AssistantSection title="Missing Information">
          {questions.filter((q) => !q.answered).length === 0 ? (
            <div className="text-xs py-2" style={{ color: "var(--slate-500)" }}>
              All key questions answered.
            </div>
          ) : (
            questions
              .filter((q) => !q.answered && q.priority <= 2)
              .slice(0, 5)
              .map((q) => (
                <div key={q.id} className="text-xs py-1.5 flex items-start gap-2">
                  <span className="mt-0.5" style={{ color: q.priority === 1 ? "#ef4444" : "#eab308" }}>
                    {q.priority === 1 ? "🔴" : "🟡"}
                  </span>
                  <span style={{ color: "var(--slate-300)" }}>{q.question}</span>
                </div>
              ))
          )}
        </AssistantSection>

        {/* Recommended Actions */}
        <AssistantSection title="Recommended Actions">
          <div className="space-y-1">
            <ActionItem icon="🤖" label="Run CRL Evaluation" />
            <ActionItem icon="📊" label="Calculate qSOFA Score" />
            <ActionItem icon="🩻" label="Review Chest X-Ray" />
          </div>
        </AssistantSection>

        {/* Context */}
        {encounter && (
          <AssistantSection title="Clinical Context">
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <ContextItem label="Age Group" value={encounter.context.ageGroup} />
              <ContextItem label="Risk Level" value={encounter.context.riskLevel.toUpperCase()} />
              <ContextItem label="Active Rules" value={`${encounter.context.activeRules}`} />
              <ContextItem label="Pregnancy" value={encounter.context.pregnancyStatus} />
              <ContextItem label="Known Conditions" value={encounter.context.knownConditions.join(", ") || "None"} />
              <ContextItem label="Active Pathways" value={encounter.context.activePathways.join(", ") || "None"} />
            </div>
          </AssistantSection>
        )}
      </div>
    </div>
  )
}

function AssistantSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--midnight-800)", border: "1px solid var(--midnight-700)" }}>
      <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--slate-500)" }}>
        {title}
      </h4>
      {children}
    </div>
  )
}

function ActionItem({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all hover:opacity-80"
      style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider" style={{ color: "var(--slate-600)" }}>
        {label}
      </div>
      <div style={{ color: "var(--slate-300)" }}>{value}</div>
    </div>
  )
}
