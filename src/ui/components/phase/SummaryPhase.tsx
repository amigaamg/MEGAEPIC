'use client';
import React, { useMemo, useState } from 'react';
import { usePatientStore } from '../../../state/patientStore';
import { useUIStore } from '../../../state/uiStore';
import { useTheme } from '../../themes/ThemeProvider';
import { runInference } from '../../../engine/inference/scorer';
import { DDX_RULES } from '../../../engine/knowledge-graph/reference';
import { getSeverity } from '../../../engine/inference/scorer';

export const SummaryPhase: React.FC = () => {
  const form = usePatientStore(s => s.form);
  const setField = usePatientStore(s => s.setField);
  const isMobile = useUIStore(s => s.isMobile);
  const t = useTheme();
  const [activeDdx, setActiveDdx] = useState<string | null>(null);

  const scored = useMemo(() => runInference(form), [form]);
  const severity = useMemo(() => getSeverity(form), [form]);

  const inp = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '8px 12px', borderRadius: 8,
    border: `1px solid ${t.colors.border}`,
    background: t.colors.surface, color: t.colors.text,
    fontSize: 13, outline: 'none',
    fontFamily: t.typography.font, transition: 'border-color 0.15s',
  };
  const ta = { ...inp, minHeight: 64, resize: 'vertical' as const };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, paddingBottom: 8, borderBottom: `1px solid ${t.colors.border}` }}>
          Clinical Summary & Differential Diagnosis
        </div>
        <div style={{ fontSize: 11, color: t.colors.textMuted, marginTop: 4 }}>
          Integrated scoring, severity assessment, and structured differentials.
        </div>
      </div>

      <div style={{ background: t.colors.surface, border: `1px solid ${t.colors.border}`, borderRadius: 12, padding: 24 }}>
        {/* Severity */}
        {severity && (
          <div style={{ padding: '14px 18px', borderRadius: 10, marginBottom: 20, background: severity.bg, border: `1px solid ${severity.color}30` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: severity.color }}>{severity.level}</div>
            <div style={{ fontSize: 13, color: severity.color, marginTop: 3 }}>{severity.msg}</div>
          </div>
        )}

        {/* Probability Scores */}
        {scored.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${t.colors.border}` }}>
              Differential Probability Scores
            </div>
            {scored.slice(0, 7).map(d => (
              <div key={d.disease.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.colors.text }}>{d.disease.name}</span>
                    <span style={{ fontSize: 10, color: t.colors.textMuted, marginLeft: 8 }}>{d.relation}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.colors.accent }}>{Math.round(d.probability * 100)}%</span>
                </div>
                <div style={{ height: 8, background: t.colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(d.probability * 100)}%`, background: t.colors.accent, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
                {d.evidence.historyHits.length > 0 && (
                  <div style={{ fontSize: 10, color: t.colors.textSub, marginTop: 2 }}>
                    Hx: {d.evidence.historyHits.join(', ')}
                  </div>
                )}
                {d.evidence.examHits.length > 0 && (
                  <div style={{ fontSize: 10, color: t.colors.textSub }}>
                    Exam: {d.evidence.examHits.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Working Diagnosis */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${t.colors.border}` }}>
            Working Diagnosis
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.colors.textSub, marginBottom: 5 }}>Select or Type Working Diagnosis</div>
            <input style={{ ...inp, fontSize: 15, fontWeight: 600, padding: '10px 14px' }}
              value={form.summary.workingDx} placeholder="Type or select from differentials above..."
              onChange={e => setField('summary.workingDx', e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {scored.slice(0, 6).map(d => (
              <button key={d.disease.id} onClick={() => setField('summary.workingDx', d.disease.name)} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `1px solid ${form.summary.workingDx === d.disease.name ? t.colors.accent : t.colors.border}`,
                background: form.summary.workingDx === d.disease.name ? t.colors.accentBg : 'transparent',
                color: form.summary.workingDx === d.disease.name ? t.colors.accentText : t.colors.textSub, fontFamily: t.typography.font, fontWeight: 600,
              }}>{d.disease.name}</button>
            ))}
          </div>
        </div>

        {/* DDx Framework */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${t.colors.border}` }}>
            DDx Rule-In / Rule-Out
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {Object.keys(DDX_RULES).map(name => (
              <button key={name} onClick={() => setActiveDdx(activeDdx === name ? null : name)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                border: `1px solid ${activeDdx === name ? t.colors.accent : t.colors.border}`,
                background: activeDdx === name ? t.colors.accent : 'transparent',
                color: activeDdx === name ? 'white' : t.colors.textSub, fontFamily: t.typography.font,
              }}>{name}</button>
            ))}
          </div>
          {activeDdx && DDX_RULES[activeDdx] && (
            <div style={{ background: t.colors.surfaceAlt, borderRadius: 10, padding: 16, border: `1px solid ${t.colors.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.colors.text, marginBottom: 12 }}>{activeDdx}</div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.success, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Supports Diagnosis</div>
                  {DDX_RULES[activeDdx].supports.map((s, i) => (
                    <div key={i} style={{ fontSize: 12, color: t.colors.text, padding: '3px 0', display: 'flex', gap: 8 }}>
                      <span style={{ color: t.colors.success, flexShrink: 0 }}>•</span>{s}
                    </div>
                  ))}
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.accentText, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 12, marginBottom: 8 }}>Key Investigations</div>
                  {DDX_RULES[activeDdx].investigations.map((inv, i) => (
                    <div key={i} style={{ fontSize: 12, color: t.colors.text, padding: '3px 0', display: 'flex', gap: 8 }}>
                      <span style={{ color: t.colors.accentText, flexShrink: 0 }}>→</span>{inv}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.danger, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Arguments Against</div>
                  {DDX_RULES[activeDdx].rulesOut.map((r, i) => (
                    <div key={i} style={{ fontSize: 12, color: t.colors.text, padding: '3px 0', display: 'flex', gap: 8 }}>
                      <span style={{ color: t.colors.danger, flexShrink: 0 }}>✗</span>{r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${t.colors.border}` }}>
            Additional Differential Considerations
          </div>
          <textarea style={ta} value={form.summary.ddxNotes} onChange={e => setField('summary.ddxNotes', e.target.value)}
            placeholder="Additional differential diagnoses, clinical reasoning, or observations not captured by the scoring engine..." />
        </div>
      </div>
    </>
  );
};
