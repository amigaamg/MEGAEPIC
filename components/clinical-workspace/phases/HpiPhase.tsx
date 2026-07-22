"use client"

import { useClinicalWorkspace } from "../workflow-state"
import AdaptiveCard from "../cards/AdaptiveCard"
import { useMemo } from "react"

const HPI_QUESTIONS = [
  { id: "hpi-1", conceptId: "pain_radiation", question: "Does the pain radiate anywhere?", answerType: "boolean" as const, priority: 1 as const, answered: false },
  { id: "hpi-2", conceptId: "pain_exertional", question: "Is it brought on by exertion?", answerType: "boolean" as const, priority: 1 as const, answered: false },
  { id: "hpi-3", conceptId: "associated_dyspnoea", question: "Associated shortness of breath?", answerType: "boolean" as const, priority: 1 as const, answered: false },
  { id: "hpi-4", conceptId: "associated_diaphoresis", question: "Associated diaphoresis (sweating)?", answerType: "boolean" as const, priority: 1 as const, answered: false },
  { id: "hpi-5", conceptId: "pain_quality", question: "Describe the quality (crushing, stabbing, burning)", answerType: "text" as const, priority: 2 as const, answered: false },
  { id: "hpi-6", conceptId: "associated_nausea", question: "Associated nausea or vomiting?", answerType: "boolean" as const, priority: 2 as const, answered: false },
  { id: "hpi-7", conceptId: "chest_pain_pleuritic", question: "Is it pleuritic (worse with deep breathing)?", answerType: "boolean" as const, priority: 2 as const, answered: false },
]

export default function HpiPhase() {
  const { nextPhase, prevPhase, complaints } = useClinicalWorkspace()

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>
            History of Presenting Illness
          </h2>
          <p className="text-xs" style={{ color: "var(--slate-500)" }}>
            SOCRATES: Site, Onset, Character, Radiation, Associated, Timing, Exacerbating, Severity
          </p>
        </div>
      </div>

      {/* Complaint timeline */}
      <div
        className="rounded-xl p-4 border"
        style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}
      >
        <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--slate-300)" }}>
          Timeline
        </h3>
        <div className="space-y-2">
          <TimelineEntry time="3 months ago" text="Started noticing intermittent chest discomfort" />
          <TimelineEntry time="2 weeks ago" text="Pain becoming more frequent, now daily" />
          <TimelineEntry time="3 days ago" text="Pain radiating to left arm" />
          <TimelineEntry time="Today" text="Presented to ED with severe chest pain" active />
        </div>
        <button
          className="w-full mt-3 py-1.5 rounded-lg text-[10px] font-medium border border-dashed"
          style={{ borderColor: "var(--midnight-600)", color: "var(--slate-500)" }}
        >
          + Add timeline entry
        </button>
      </div>

      {/* Questions */}
      <div>
        <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--slate-400)" }}>
          Characterize the Complaint
        </h3>
        <div className="space-y-2">
          {HPI_QUESTIONS.map((q) => (
            <AdaptiveCard key={q.id} question={q} />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button onClick={prevPhase} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}>
          ← Back
        </button>
        <button onClick={nextPhase} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>
          Continue to Past History →
        </button>
      </div>
    </div>
  )
}

function TimelineEntry({ time, text, active }: { time: string; text: string; active?: boolean }) {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full" style={{ background: active ? "var(--accent)" : "var(--slate-600)" }} />
        <div className="w-px flex-1" style={{ background: "var(--midnight-700)" }} />
      </div>
      <div className="pb-2">
        <div className="text-[10px] font-medium" style={{ color: "var(--slate-500)" }}>
          {time}
        </div>
        <div className="text-xs" style={{ color: "var(--slate-300)" }}>
          {text}
        </div>
      </div>
    </div>
  )
}
