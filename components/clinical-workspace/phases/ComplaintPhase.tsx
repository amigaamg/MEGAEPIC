"use client"

import { useClinicalWorkspace } from "../workflow-state"
import AdaptiveCard from "../cards/AdaptiveCard"

const COMPLAINT_QUESTIONS = [
  { id: "cc-1", conceptId: "chest_pain_onset", question: "When did this start?", answerType: "text" as const, priority: 1 as const, answered: false },
  { id: "cc-2", conceptId: "chest_pain_type", question: "How would you describe the pain?", answerType: "text" as const, priority: 1 as const, answered: false },
  { id: "cc-3", conceptId: "pain_severity", question: "Rate the severity (0-10)", answerType: "numeric" as const, unit: "/10", priority: 1 as const, answered: false },
  { id: "cc-4", conceptId: "pain_trauma", question: "Is there an associated injury or trauma?", answerType: "boolean" as const, priority: 2 as const, answered: false },
]

export default function ComplaintPhase() {
  const { addComplaint, nextPhase } = useClinicalWorkspace()

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>
          Chief Complaint
        </h2>
        <p className="text-xs mt-1" style={{ color: "var(--slate-500)" }}>
          Record the patient's presenting complaint in their own words.
        </p>
      </div>

      {/* Quick complaint entry */}
      <div
        className="rounded-xl p-4 border"
        style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}
      >
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--slate-300)" }}>
          Patient's own words
        </label>
        <input
          type="text"
          placeholder='e.g., "I have chest pain"'
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-3"
          style={{
            background: "var(--midnight-700)",
            color: "var(--slate-200)",
            border: "1px solid var(--midnight-600)",
          }}
        />
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--slate-500)" }}>
              Onset
            </label>
            <input
              type="text"
              placeholder="e.g., 3 hours ago"
              className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
              style={{ background: "var(--midnight-700)", color: "var(--slate-200)", border: "1px solid var(--midnight-600)" }}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--slate-500)" }}>
              Duration
            </label>
            <input
              type="text"
              placeholder="e.g., intermittent"
              className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
              style={{ background: "var(--midnight-700)", color: "var(--slate-200)", border: "1px solid var(--midnight-600)" }}
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["Chest Pain", "Abdominal Pain", "Headache", "Fever", "Dyspnoea", "Cough", "Trauma", "Back Pain"].map((cc) => (
            <button
              key={cc}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all"
              style={{ background: "var(--midnight-700)", color: "var(--slate-400)", border: "1px solid var(--midnight-600)" }}
            >
              {cc}
            </button>
          ))}
        </div>
        <button
          onClick={nextPhase}
          className="w-full mt-3 py-2.5 rounded-lg text-xs font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Continue to HPI →
        </button>
      </div>

      {/* Suggested questions */}
      <div>
        <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--slate-400)" }}>
          Suggested Questions
        </h3>
        <div className="space-y-2">
          {COMPLAINT_QUESTIONS.map((q) => (
            <AdaptiveCard key={q.id} question={q} />
          ))}
        </div>
      </div>
    </div>
  )
}
