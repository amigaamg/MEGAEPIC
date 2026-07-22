"use client"

import { useClinicalWorkspace } from "../workflow-state"
import type { QuestionCard } from "../types"

export default function AdaptiveCard({ question }: { question: QuestionCard }) {
  const { answerQuestion } = useClinicalWorkspace()

  const handleAnswer = (value: any) => {
    answerQuestion(question.id, value)
  }

  return (
    <div
      className="rounded-xl p-4 border transition-all"
      style={{
        background: question.answered ? "var(--midnight-800)" : "var(--midnight-750)",
        borderColor: question.redFlag ? "#dc2626" : question.answered ? "var(--midnight-600)" : "var(--accent)",
        opacity: question.answered ? 0.7 : 1,
      }}
    >
      {/* Question */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-sm mt-0.5">
          {question.priority === 1 ? "🔴" : question.priority === 2 ? "🟡" : "🔵"}
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium" style={{ color: "var(--slate-100)" }}>
            {question.question}
          </div>
          {question.reason && (
            <div className="text-[10px] mt-0.5" style={{ color: "var(--slate-500)" }}>
              {question.reason}
            </div>
          )}
        </div>
      </div>

      {/* Red flag */}
      {question.redFlag && (
        <div
          className="text-[10px] px-2 py-1 rounded-lg mb-3 font-medium"
          style={{ background: "#dc262615", color: "#ef4444", border: "1px solid #dc262630" }}
        >
          🚨 {question.redFlag}
        </div>
      )}

      {/* Answer input */}
      {!question.answered && (
        <div>
          {question.answerType === "boolean" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: "#22c55e20", color: "#4ade80", border: "1px solid #22c55e40" }}
              >
                ✓ Yes
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: "#ef444420", color: "#f87171", border: "1px solid #ef444440" }}
              >
                ✗ No
              </button>
            </div>
          )}

          {question.answerType === "text" && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your answer..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnswer((e.target as HTMLInputElement).value)
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                style={{
                  background: "var(--midnight-700)",
                  color: "var(--slate-200)",
                  border: "1px solid var(--midnight-600)",
                }}
                autoFocus
              />
              <button
                onClick={() => {
                  const input = document.getElementById(`q-${question.id}`) as HTMLInputElement
                  if (input?.value) handleAnswer(input.value)
                }}
                className="px-3 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                →
              </button>
            </div>
          )}

          {question.answerType === "numeric" && (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                id={`q-${question.id}`}
                placeholder="0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnswer(parseFloat((e.target as HTMLInputElement).value))
                  }
                }}
                className="w-24 px-3 py-2 rounded-lg text-xs outline-none text-center"
                style={{
                  background: "var(--midnight-700)",
                  color: "var(--slate-200)",
                  border: "1px solid var(--midnight-600)",
                }}
                autoFocus
              />
              {question.unit && (
                <span className="text-xs" style={{ color: "var(--slate-500)" }}>
                  {question.unit}
                </span>
              )}
              <button
                onClick={() => {
                  const input = document.getElementById(`q-${question.id}`) as HTMLInputElement
                  if (input?.value) handleAnswer(parseFloat(input.value))
                }}
                className="px-3 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                →
              </button>
            </div>
          )}

          {question.answerType === "select" && question.options && (
            <div className="flex flex-wrap gap-1.5">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{ background: "var(--midnight-700)", color: "var(--slate-300)", border: "1px solid var(--midnight-600)" }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer displayed */}
      {question.answered && (
        <div
          className="text-xs px-2 py-1 rounded-lg inline-block"
          style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}
        >
          ✓ {typeof question.answer === "boolean" ? (question.answer ? "Yes" : "No") : String(question.answer)}
        </div>
      )}
    </div>
  )
}
