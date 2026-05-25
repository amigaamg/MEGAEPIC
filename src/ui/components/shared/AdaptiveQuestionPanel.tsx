'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { usePatientStore } from '../../../state/patientStore';
import { useTheme } from '../../themes/ThemeProvider';
import { runInference } from '../../../engine/inference/scorer';
import { suggestNextQuestions, computeDDxEntropy } from '../../../engine/inference/adaptiveQuestioner';
import { FEATURE_REGISTRY } from '../../../engine/inference/featureRegistry';

interface AdaptiveQuestionPanelProps {
  phaseType?: 'symptom' | 'sign' | 'all';
}

export const AdaptiveQuestionPanel: React.FC<AdaptiveQuestionPanelProps> = ({ phaseType = 'all' }) => {
  const form = usePatientStore(s => s.form);
  const updateForm = usePatientStore(s => s.updateForm);
  const t = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  const currentDDx = useMemo(() => runInference(form), [form]);
  const ddxEntropy = useMemo(() => computeDDxEntropy(currentDDx), [currentDDx]);

  const suggestions = useMemo(() => {
    return suggestNextQuestions(form, currentDDx)
      .filter(s => {
        if (answeredIds.has(s.feature.id)) return false;
        if (phaseType === 'symptom' && s.feature.type !== 'symptom') return false;
        if (phaseType === 'sign' && s.feature.type !== 'sign') return false;
        return true;
      });
  }, [form, currentDDx, answeredIds, phaseType]);

  const handleAnswer = useCallback((featureId: string, value: boolean) => {
    const descriptor = FEATURE_REGISTRY[featureId];
    if (!descriptor) return;
    const newForm = descriptor.setValue(form, value);
    updateForm(newForm);
    setAnsweredIds(prev => new Set(prev).add(featureId));
  }, [form, updateForm]);

  if (suggestions.length === 0) return null;

  const btnBase: React.CSSProperties = {
    padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
    border: 'none', fontWeight: 600, fontFamily: t.typography.font,
    transition: 'all 0.12s',
  };

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          background: t.colors.accentBg,
          border: `1px solid ${t.colors.accent}30`,
          borderRadius: 10,
          padding: '10px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: t.colors.accentText,
          fontWeight: 600,
          fontSize: 13,
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 15 }}>🔍</span>
        <span>Adaptive Questions — diagnostic uncertainty {(ddxEntropy).toFixed(2)} bits</span>
        <span style={{ fontSize: 10, color: t.colors.textMuted, marginLeft: 4 }}>
          ({suggestions.length} suggestions)
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div
          style={{
            background: t.colors.surfaceAlt,
            border: `1px solid ${t.colors.border}`,
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            padding: '12px 16px',
          }}
        >
          {suggestions.slice(0, 5).map((s, i) => (
            <div key={s.feature.id} style={{
              marginBottom: i < suggestions.length - 1 ? 16 : 0,
              paddingBottom: i < suggestions.length - 1 ? 14 : 0,
              borderBottom: i < suggestions.length - 1 ? `1px solid ${t.colors.border}` : 'none',
            }}>
              <div style={{
                fontSize: 13, fontWeight: 500, color: t.colors.text, marginBottom: 8,
              }}>
                {i + 1}. {s.feature.questionText}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {[true, false].map(v => (
                  <button
                    key={String(v)}
                    onClick={() => handleAnswer(s.feature.id, v)}
                    style={{
                      ...btnBase,
                      background: v ? t.colors.accent : 'transparent',
                      color: v ? '#fff' : t.colors.textSub,
                      border: v ? 'none' : `1px solid ${t.colors.border}`,
                    }}
                  >
                    {v ? 'Yes' : 'No'}
                  </button>
                ))}
                <span style={{
                  fontSize: 10, color: t.colors.textMuted, marginLeft: 4,
                }}>
                  IG: {(s.informationGain * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}

          <div style={{
            fontSize: 10, color: t.colors.textMuted, marginTop: 12,
            paddingTop: 8, borderTop: `1px solid ${t.colors.border}`,
          }}>
            Questions ranked by expected information gain (entropy reduction). Answering improves diagnostic accuracy.
            {currentDDx.some(d => d.disease.mustNotMiss && d.probability > 0.3) &&
              <span style={{ color: t.colors.danger, fontWeight: 600 }}> ⚠ Urgency boost active — must-not-miss diseases in differential.</span>
            }
          </div>
        </div>
      )}
    </div>
  );
};
