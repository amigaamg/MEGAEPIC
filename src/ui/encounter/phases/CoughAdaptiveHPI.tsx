'use client';
import React, { useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { ClinicalEngine, QUESTION_REGISTRY } from '@/src/engine/cough/ClinicalEngine';
import type { ClinicalQuestion } from '@/src/engine/cough/ClinicalEngine';
import type { ConsultantDiagnosis } from '@/src/engine/inference/scorer';
import { useTheme } from '../../themes/ThemeProvider';

interface CoughAdaptiveHPIProps {
  patientName?: string;
  patientAgeMonths?: number;
  patientGender?: string;
  presentingComplaint?: string;
  complaintDuration?: string;
  onComplete: (narrative: string, answers: Record<string, any>) => void;
  deptColor?: string;
}

function DDXPanel({ ddx, engine }: { ddx: ConsultantDiagnosis[]; engine: ClinicalEngine }) {
  const theme = useTheme();
  const c = theme.colors;
  const progress = engine.getProgress();

  if (ddx.length === 0) {
    return (
      <div style={{ fontSize: 13, color: c.textMuted, textAlign: 'center', padding: 24 }}>
        Answer questions to see differential diagnosis
      </div>
    );
  }

  const top5 = ddx.slice(0, 5);
  const maxProb = top5[0]?.probability || 0;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>Progress</div>
        <div style={{
          height: 4, background: c.border, borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress.percent}%`, height: '100%',
            background: c.accent, borderRadius: 2, transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
          {progress.answered}/{progress.total} questions
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Differential Diagnosis
      </div>

      {top5.map((dx, i) => {
        const barWidth = maxProb > 0 ? (dx.probability / maxProb) * 100 : 0;
        const isPrimary = i === 0;

        const riskColors: Record<string, string> = {
          critical: '#DC2626', high: '#EA580C', moderate: '#CA8A04', low: c.textMuted,
        };

        return (
          <div key={dx.diseaseId} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{
                fontSize: 12, fontWeight: isPrimary ? 600 : 400, color: c.text,
              }}>
                {dx.diseaseName}
              </span>
              <span style={{
                fontSize: 11, color: riskColors[dx.risk] || c.textMuted,
                fontWeight: isPrimary ? 600 : 400,
              }}>
                {(dx.probability * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 4, background: c.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${barWidth}%`, height: '100%',
                background: isPrimary ? c.accent : c.textMuted,
                borderRadius: 2, transition: 'width 0.3s ease',
              }} />
            </div>
            {dx.risk === 'critical' && (
              <div style={{
                fontSize: 10, color: '#DC2626', marginTop: 2, fontWeight: 600,
              }}>
                Must not miss
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuestionRenderer({
  question, selectValue,
  onSelectChange, onAnswer,
}: {
  question: ClinicalQuestion;
  selectValue: string | null;
  onSelectChange: (v: string | null) => void;
  onAnswer: (value: any) => void;
}) {
  const theme = useTheme();
  const c = theme.colors;

  const tierLabels: Record<number, { label: string; color: string }> = {
    0: { label: 'Essential Safety Question', color: '#DC2626' },
    1: { label: 'Core Characterization', color: c.accent },
    2: { label: 'Clinical Discriminator', color: '#7C3AED' },
    3: { label: 'Risk Factor Assessment', color: '#D97706' },
  };

  const t = tierLabels[question.tier] || { label: 'Question', color: c.textMuted };

  if (question.type === 'boolean') {
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: t.color,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t.label}
          </span>
        </div>
        <p style={{
          fontSize: 16, fontWeight: 500, color: c.text,
          marginBottom: 24, lineHeight: 1.5,
        }}>
          {question.text}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => onAnswer(true)}
            style={{
              padding: '14px 32px', borderRadius: 8, border: `2px solid ${c.accent}`,
              background: `${c.accentBg}`, color: c.accentText,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              minWidth: 100,
            }}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onAnswer(false)}
            style={{
              padding: '14px 32px', borderRadius: 8, border: `2px solid ${c.border}`,
              background: c.surface, color: c.text,
              fontSize: 15, fontWeight: 500, cursor: 'pointer',
              minWidth: 100,
            }}
          >
            No
          </button>
        </div>
      </div>
    );
  }

  if (question.type === 'select' && question.options) {
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: t.color,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t.label}
          </span>
        </div>
        <p style={{
          fontSize: 16, fontWeight: 500, color: c.text,
          marginBottom: 24, lineHeight: 1.5,
        }}>
          {question.text}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 400 }}>
          {question.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectChange(opt.value === selectValue ? null : opt.value)}
              style={{
                padding: '10px 16px', borderRadius: 6,
                border: `1px solid ${selectValue === opt.value ? c.accent : c.border}`,
                background: selectValue === opt.value ? c.accentBg : c.surface,
                color: selectValue === opt.value ? c.accentText : c.text,
                textAlign: 'left', fontSize: 13, cursor: 'pointer',
                fontWeight: selectValue === opt.value ? 600 : 400,
              }}
            >
              {selectValue === opt.value ? '● ' : '○ '} {opt.label}
            </button>
          ))}
        </div>
        {selectValue && (
          <button
            type="button"
            onClick={() => onAnswer(selectValue)}
            style={{
              marginTop: 20, padding: '10px 24px', borderRadius: 6,
              background: c.accent, color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Next →
          </button>
        )}
      </div>
    );
  }

  if (question.type === 'number') {
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: t.color,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t.label}
          </span>
        </div>
        <p style={{
          fontSize: 16, fontWeight: 500, color: c.text,
          marginBottom: 16, lineHeight: 1.5,
        }}>
          {question.text}
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
          <input
            type="range"
            min={0} max={10} step={1}
            defaultValue={5}
            onChange={(e) => onSelectChange(e.target.value)}
            style={{ flex: 1, maxWidth: 300, accentColor: c.accent }}
          />
        </div>
        <button
          type="button"
          onClick={() => onAnswer(selectValue ?? 5)}
          style={{
            padding: '10px 24px', borderRadius: 6,
            background: c.accent, color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Next →
        </button>
      </div>
    );
  }

  return null;
}

export function CoughAdaptiveHPI({
  patientName,
  patientAgeMonths,
  patientGender,
  presentingComplaint,
  complaintDuration,
  onComplete,
}: CoughAdaptiveHPIProps) {
  const theme = useTheme();
  const c = theme.colors;
  const engineRef = useRef<ClinicalEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new ClinicalEngine({
      patientName,
      patientAgeMonths: patientAgeMonths || 0,
      patientGender: patientGender || '',
      presentingComplaint: presentingComplaint || 'Cough',
      complaintDuration: complaintDuration || '',
    });
  }
  const engine = engineRef.current;

  const [currentQuestion, setCurrentQuestion] = useState<ClinicalQuestion | null>(() => engine.getNextQuestion());
  const [answered, setAnswered] = useState(0);
  const [ddx, setDDX] = useState<ConsultantDiagnosis[]>([]);
  const [showNarrative, setShowNarrative] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [phaseDone, setPhaseDone] = useState(false);

  useEffect(() => {
    const unsub = engine.onChange(() => {
      setDDX(engine.getDDX());
    });
    return unsub;
  }, [engine]);

  const totalRelevant = useMemo(() => {
    return QUESTION_REGISTRY.filter(q =>
      !(q.ageMinMonths !== undefined && (engine.getAgeMonths() || 0) < q.ageMinMonths) &&
      !(q.ageMaxMonths !== undefined && (engine.getAgeMonths() || 0) > q.ageMaxMonths) &&
      !(q.gender && (engine.getGender() || '').toUpperCase() !== q.gender)
    ).length;
  }, [engine]);

  const handleAnswer = useCallback((qId: string, value: any) => {
    engine.answer(qId, value);
    setAnswered(engine.askedCount);
    setSelectValue(null);

    if (engine.isComplete()) {
      setCurrentQuestion(null);
      setNarrative(engine.generateNarrative());
      setShowNarrative(true);
    } else {
      const next = engine.getNextQuestion();
      setCurrentQuestion(next);
    }
  }, [engine]);

  const handleNarrativeDone = useCallback(() => {
    setPhaseDone(true);
    onComplete(engine.generateNarrative(), engine.getAllAnswers());
  }, [engine, onComplete]);

  const goToNarrative = useCallback(() => {
    setNarrative(engine.generateNarrative());
    setShowNarrative(true);
  }, [engine]);

  if (phaseDone) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: c.text }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>HPI Complete</div>
        <div style={{ fontSize: 14, color: c.textMuted }}>
          {answered} questions answered · Narrative generated
        </div>
      </div>
    );
  }

  if (showNarrative) {
    return (
      <div style={{ display: 'flex', gap: 24, minHeight: 400 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: c.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12,
          }}>
            Clinical Narrative
          </div>
          <div style={{
            padding: 20, borderRadius: 8,
            background: c.accentBg,
            border: `1px solid ${c.border}`,
            fontSize: 14, lineHeight: 1.7, color: c.text,
            whiteSpace: 'pre-wrap',
          }}>
            {narrative}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleNarrativeDone}
              style={{
                padding: '10px 24px', borderRadius: 6,
                background: c.accent, color: '#fff',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Accept & Complete HPI →
            </button>
            <button
              type="button"
              onClick={() => setShowNarrative(false)}
              style={{
                padding: '10px 24px', borderRadius: 6,
                background: 'transparent', color: c.text,
                border: `1px solid ${c.border}`, fontSize: 14, cursor: 'pointer',
              }}
            >
              Continue questioning
            </button>
          </div>
        </div>
        <div style={{ width: 280, flexShrink: 0 }}>
          <DDXPanel ddx={ddx} engine={engine} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 24, minHeight: 400 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 24, paddingBottom: 16,
          borderBottom: `1px solid ${c.border}`,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: c.accent,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Clinical Interview
          </div>
          <div style={{ fontSize: 12, color: c.textMuted }}>
            {answered}/{totalRelevant} · {totalRelevant > 0 ? Math.round((answered / totalRelevant) * 100) : 0}%
          </div>
        </div>

        {currentQuestion ? (
          <QuestionRenderer
            question={currentQuestion}
            selectValue={selectValue}
            onSelectChange={setSelectValue}
            onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 14, color: c.textMuted, marginBottom: 16 }}>
              All questions answered
            </div>
            <button
              type="button"
              onClick={goToNarrative}
              style={{
                padding: '10px 24px', borderRadius: 6,
                background: c.accent, color: '#fff',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Generate Clinical Narrative →
            </button>
          </div>
        )}
      </div>

      <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${c.border}`, paddingLeft: 20 }}>
        <DDXPanel ddx={ddx} engine={engine} />
      </div>
    </div>
  );
}
