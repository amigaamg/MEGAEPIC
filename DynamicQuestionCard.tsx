'use client';
// ─── AMEXAN — DynamicQuestionCard ───────────────────────────────────────────
import { QuestionNode } from '@/src/types';

interface Props {
  question: QuestionNode;
  onAnswer: (questionId: string, answer: string | string[]) => void;
  questionNumber: number;
  total: number;
}

export function DynamicQuestionCard({ question, onAnswer, questionNumber, total }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(questionNumber / Math.max(total, 1)) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 font-medium tabular-nums whitespace-nowrap">
          {questionNumber} / {total}
        </span>
      </div>

      {/* Question text */}
      <p className="text-base font-semibold text-gray-800 mb-5 leading-snug">
        {question.text}
      </p>

      {/* Answer options */}
      <div className="flex flex-col gap-2">
        {question.type === 'boolean' && (
          <>
            <AnswerButton label="Yes" onClick={() => onAnswer(question.id, 'true')} accent />
            <AnswerButton label="No"  onClick={() => onAnswer(question.id, 'false')} />
          </>
        )}

        {(question.type === 'single' || question.type === 'multi') &&
          question.options?.map(option => (
            <AnswerButton
              key={option}
              label={option}
              onClick={() => onAnswer(question.id, option)}
            />
          ))}
      </div>
    </div>
  );
}

interface BtnProps {
  label: string;
  onClick: () => void;
  accent?: boolean;
}

function AnswerButton({ label, onClick, accent }: BtnProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-xl border text-sm font-medium
        transition-all duration-150 active:scale-[0.98]
        ${accent
          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
        }
      `}
    >
      {label}
    </button>
  );
}