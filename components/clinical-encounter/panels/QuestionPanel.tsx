'use client';
import React, { useMemo, useRef, useEffect } from 'react';
import { QuestionEngineState, getCurrentGroup, didGroupChange } from '@/lib/amexan/encounter-engine/engines/question-engine';
import { EncounterPhase, QuestionCard } from '@/lib/amexan/encounter-engine/types/ces';
import { QuestionCardComponent } from '../cards/QuestionCard';

interface Props {
  questionEngine: QuestionEngineState;
  onAnswer: (cardId: string, value: string | number | boolean | string[]) => void;
  currentPhase: EncounterPhase;
  primaryComplaint?: string;
}

const PHASE_LABELS: Record<string, string> = {
  registration: 'Patient Registration',
  chief_complaint: 'Chief Complaint',
  hpi: 'History of Presenting Illness',
  past_medical: 'Past Medical History',
  past_surgical: 'Past Surgical History',
  drug_history: 'Drug History',
  allergies: 'Allergy History',
  family_history: 'Family History',
  social_history: 'Social History',
  review_of_systems: 'Review of Systems',
  functional_assessment: 'Functional Assessment',
  general_exam: 'General Examination',
  systemic_exam: 'Systemic Examination',
  clinical_reasoning: 'Clinical Reasoning',
  differentials: 'Differential Diagnoses',
  investigations: 'Investigations',
  diagnosis: 'Diagnosis',
  management: 'Management Plan',
  disposition: 'Disposition',
  follow_up: 'Follow-up',
};

export function QuestionPanel({ questionEngine, onAnswer, currentPhase, primaryComplaint }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevAnswerCountRef = useRef(Object.keys(questionEngine.answers).length);
  const userScrolledUpRef = useRef(false);

  const visibleCards = useMemo(() => {
    return questionEngine.visibleCards || [];
  }, [questionEngine.visibleCards, questionEngine.answers]);

  const currentGroup = useMemo(() => getCurrentGroup(questionEngine), [questionEngine]);
  const groupChanged = useMemo(() => didGroupChange(questionEngine), [questionEngine]);

  const answeredCount = Object.keys(questionEngine.answers).length;
  const totalCount = visibleCards.length;

  // Auto-scroll to bottom only if user hasn't scrolled up
  useEffect(() => {
    if (answeredCount > prevAnswerCountRef.current) {
      prevAnswerCountRef.current = answeredCount;
      if (userScrolledUpRef.current) return;
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [answeredCount]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    userScrolledUpRef.current = !isNearBottom;
  };

  const phaseLabel = PHASE_LABELS[currentPhase] || currentPhase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="ce-question-panel" onScroll={handleScroll}>
      {/* Phase Header */}
      <div className="ce-question-header">
        <div className="ce-question-phase-label">{phaseLabel}</div>
        {primaryComplaint && (
          <div className="ce-question-complaint">{primaryComplaint}</div>
        )}
        <div className="ce-question-progress">
          <div className="ce-progress-bar">
            <div
              className="ce-progress-fill"
              style={{ width: `${totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0}%` }}
            />
          </div>
          <span className="ce-progress-text">{answeredCount}/{totalCount}</span>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="ce-question-conversation" ref={containerRef}>
        {/* Group Banner */}
        {currentGroup && groupChanged && (
          <div className="ce-group-banner">
            <span className="ce-group-banner-icon">◈</span>
            <span>{currentGroup.label}</span>
          </div>
        )}

        {/* Question Cards */}
        {visibleCards.map((card, idx) => {
          const isAnswered = !!questionEngine.answers[card.id];
          const isLastUnanswered = idx === visibleCards.length - 1 && !isAnswered;

          return (
            <div
              key={card.id}
              className={`ce-question-card-wrapper ${isLastUnanswered ? 'ce-card-active' : ''} ${isAnswered ? 'ce-card-answered' : ''}`}
            >
              {isLastUnanswered && (
                <div className="ce-doctor-prompt">
                  {card.groupLabel ? (
                    <span>{card.groupLabel}</span>
                  ) : (
                    <span>Tell me more…</span>
                  )}
                </div>
              )}
              <QuestionCardComponent
                card={card}
                onAnswer={(value) => onAnswer(card.id, value)}
                currentValue={questionEngine.answers[card.id]?.value}
              />
            </div>
          );
        })}

        {/* Empty state */}
        {visibleCards.length === 0 && (
          <div className="ce-question-empty">
            <div className="ce-empty-icon">◷</div>
            <div className="ce-empty-text">No questions for this phase</div>
            <div className="ce-empty-hint">Complete earlier phases or select a different phase below</div>
          </div>
        )}
      </div>

      <style>{`
        .ce-question-panel {
          width: 40%; min-width: 360px;
          display: flex; flex-direction: column;
          background: var(--ce-surface);
          border-right: 1px solid var(--ce-border);
          position: relative;
        }
        .ce-question-header {
          padding: var(--ce-space-lg) var(--ce-space-xl);
          border-bottom: 1px solid var(--ce-border-light);
          flex-shrink: 0;
        }
        .ce-question-phase-label {
          font-size: 13px; font-weight: 600; color: var(--ce-sky-600);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .ce-question-complaint {
          font-size: 12px; color: var(--ce-text-muted);
          margin-top: 2px;
        }
        .ce-question-progress {
          display: flex; align-items: center; gap: 8px;
          margin-top: var(--ce-space-sm);
        }
        .ce-progress-bar {
          flex: 1; height: 4px;
          background: var(--ce-border-light);
          border-radius: 2px; overflow: hidden;
        }
        .ce-progress-fill {
          height: 100%;
          background: var(--ce-sky-400);
          border-radius: 2px;
          transition: width 300ms ease;
        }
        .ce-progress-text {
          font-size: 11px; color: var(--ce-text-muted); font-weight: 500;
          min-width: 36px; text-align: right;
        }
        .ce-question-conversation {
          flex: 1; overflow-y: auto;
          padding: var(--ce-space-md) var(--ce-space-xl) var(--ce-space-2xl);
        }
        .ce-group-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; margin: 12px 0;
          background: var(--ce-group-bg);
          border: 1px solid var(--ce-group-border);
          border-radius: var(--ce-radius-md);
          color: var(--ce-group-text);
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.01em;
        }
        .ce-group-banner-icon {
          font-size: 14px;
        }
        .ce-question-card-wrapper {
          margin-bottom: 6px;
          transition: opacity 200ms ease;
        }
        .ce-question-card-wrapper.ce-card-answered {
          opacity: 0.6;
        }
        .ce-doctor-prompt {
          font-size: 12px; font-weight: 500; color: var(--ce-sky-600);
          padding: 6px 0 4px 4px;
          letter-spacing: 0.01em;
        }
        .ce-question-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 200px; color: var(--ce-text-muted);
        }
        .ce-empty-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.4; }
        .ce-empty-text { font-size: 14px; font-weight: 500; }
        .ce-empty-hint { font-size: 12px; margin-top: 4px; }
      `}</style>
    </div>
  );
}
