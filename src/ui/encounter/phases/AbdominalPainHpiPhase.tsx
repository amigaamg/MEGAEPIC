'use client';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '../../themes/ThemeProvider';
import { createSession, processAnswer, type AmexanSession } from '@/lib/amexan/encounter/engines/sessionAdapter';
import type { LegacyNextQuestion } from '@/lib/amexan/encounter/engines/sessionAdapter';
import type { InterviewState, Contradiction } from '@/lib/amexan/knowbase/diseaseNode';
import { INTERVIEW_STATE_ORDER } from '@/lib/amexan/knowbase/diseaseNode';
import type { PatientForm } from '@/src/types';
import type { DocumentEvent, AIInsight } from '@/lib/encounterTypes';

interface Props {
  form: PatientForm;
  setField: (p: string, v: any) => void;
  addEvent: (e: Partial<DocumentEvent>) => void;
  addInsight: (i: Partial<AIInsight>) => void;
  deptColor: string;
}

type StateMeta = {
  id: InterviewState;
  label: string;
  icon: string;
  goal: string;
  color: string;
};

const STATES: StateMeta[] = [
  { id: 'patient_identification', label: 'Patient ID', icon: '📋', goal: 'Establish biodata and priors.', color: '#6B7280' },
  { id: 'chief_complaint', label: 'Chief Complaint', icon: '🗣️', goal: 'Define the presenting problem.', color: '#6B7280' },
  { id: 'timeline_construction', label: 'Timeline', icon: '🕐', goal: 'When did it start? How has it evolved?', color: '#DC2626' },
  { id: 'symptom_characterization', label: 'Characterisation', icon: '🔍', goal: 'Location, character, severity, radiation.', color: '#7C3AED' },
  { id: 'differential_resolution', label: 'Differential', icon: '🎯', goal: 'Separate competing diagnoses.', color: '#2563EB' },
  { id: 'red_flag_exclusion', label: 'Red Flags', icon: '🚨', goal: 'Exclude life-threatening causes.', color: '#DC2626' },
  { id: 'documentation_validation', label: 'Validation', icon: '✓', goal: 'Fill narrative gaps.', color: '#059669' },
  { id: 'complete', label: 'Complete', icon: '✅', goal: 'Narrative generated.', color: '#4F46E5' },
];

function getAgeInMonths(form: PatientForm): number {
  return parseInt(form.biodata.ageMonths) || 0;
}
function getSex(form: PatientForm): string {
  return form.biodata.sex || 'unknown';
}

export function AbdominalPainHpiPhase({ form, setField, addEvent, addInsight, deptColor }: Props) {
  const theme = useTheme();
  const sessionRef = useRef<AmexanSession | null>(null);
  const [session, setSession] = useState<AmexanSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<LegacyNextQuestion | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showNarrative, setShowNarrative] = useState(true);
  const [showContradictions, setShowContradictions] = useState(true);
  const initRef = useRef(false);

  const age = useMemo(() => {
    const mo = getAgeInMonths(form);
    return Math.max(1, Math.floor(mo / 12) || 1);
  }, [form]);
  const sex = useMemo(() => {
    const s = getSex(form);
    return s === 'female' ? 'female' as const : 'male' as const;
  }, [form]);
  const complaint = useMemo(() => {
    const c = form.complaints || [];
    return c[0] || 'abdominal pain';
  }, [form.complaints]);

  const symptomId = useMemo(() => {
    const c = (form.complaints || [])[0] || '';
    const lower = c.toLowerCase();
    if (lower.includes('vomit') || lower.includes('nausea')) return 'nausea_vomiting';
    if (lower.includes('distension') || lower.includes('bloating')) return 'bloating';
    if (lower.includes('diarrhoea') || lower.includes('diarrhea')) return 'diarrhea';
    if (lower.includes('constipation')) return 'constipation';
    if (lower.includes('dysphagia')) return 'dysphagia';
    if (lower.includes('hematemesis')) return 'hematemesis';
    if (lower.includes('melena')) return 'melena';
    if (lower.includes('hematochezia')) return 'hematochezia';
    return 'abdominal_pain';
  }, [form.complaints]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    try {
      const s = createSession(symptomId, complaint, age, sex, '');
      sessionRef.current = s;
      setSession(s);
      setCurrentQuestion(s.nextQuestion as any);
      setShowNarrative(true);
    } catch (e) {
    }
  }, [symptomId, complaint, age, sex]);

  const handleAnswer = useCallback((featureId: string, value: string | boolean | string[] | number) => {
    if (!sessionRef.current) return;
    const updated = processAnswer(sessionRef.current, featureId, value);
    sessionRef.current = updated;
    setSession(updated);
    setCurrentQuestion(updated.nextQuestion as any);
    setAnsweredCount(prev => prev + 1);

    addEvent({ type: 'hpi_entered', description: `${sessionRef.current.state.interviewState}: ${featureId} = ${String(value)}` });

    if (updated.isComplete || updated.nextQuestion === null) {
      setShowNarrative(true);
    }
  }, [addEvent]);

  const renderAnswer = useCallback((q: LegacyNextQuestion) => {
    if (!sessionRef.current) return null;
    const state = sessionRef.current.state;
    const existingAnswer = state.answers.find(a => a.featureId === q.featureId);

    switch (q.type) {
      case 'boolean':
        return (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => handleAnswer(q.featureId, true)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 8, border: `2px solid ${existingAnswer?.value === true ? deptColor : theme.colors.border}`,
                background: existingAnswer?.value === true ? `${deptColor}15` : theme.colors.surfaceAlt,
                color: existingAnswer?.value === true ? deptColor : theme.colors.text,
                fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: theme.typography.font,
                transition: 'all .12s',
              }}>Yes</button>
            <button onClick={() => handleAnswer(q.featureId, false)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 8, border: `2px solid ${existingAnswer?.value === false ? '#ef4444' : theme.colors.border}`,
                background: existingAnswer?.value === false ? '#ef444420' : theme.colors.surfaceAlt,
                color: existingAnswer?.value === false ? '#ef4444' : theme.colors.text,
                fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: theme.typography.font,
                transition: 'all .12s',
              }}>No</button>
          </div>
        );

      case 'select':
        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {(q.options || []).map(opt => {
              const isSelected = existingAnswer?.value === opt.toLowerCase() || existingAnswer?.value === opt;
              return (
                <button key={opt} onClick={() => handleAnswer(q.featureId, opt.toLowerCase())}
                  style={{
                    padding: '8px 14px', borderRadius: 100, border: `1px solid ${isSelected ? deptColor : theme.colors.border}`,
                    background: isSelected ? `${deptColor}20` : 'transparent',
                    color: isSelected ? deptColor : theme.colors.textSub,
                    fontSize: '.8125rem', fontWeight: isSelected ? 600 : 400, cursor: 'pointer', fontFamily: theme.typography.font,
                    transition: 'all .12s',
                  }}>{opt}</button>
              );
            })}
          </div>
        );

      case 'multi_select': {
        const selected: string[] = Array.isArray(existingAnswer?.value) ? existingAnswer.value as string[] : [];
        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {(q.options || []).map(opt => {
              const isSel = selected.includes(opt.toLowerCase());
              return (
                <button key={opt} onClick={() => {
                  const next = isSel ? selected.filter(x => x !== opt.toLowerCase()) : [...selected, opt.toLowerCase()];
                  handleAnswer(q.featureId, next);
                }}
                  style={{
                    padding: '8px 14px', borderRadius: 100, border: `1px solid ${isSel ? deptColor : theme.colors.border}`,
                    background: isSel ? `${deptColor}20` : 'transparent',
                    color: isSel ? deptColor : theme.colors.textSub,
                    fontSize: '.8125rem', fontWeight: isSel ? 600 : 400, cursor: 'pointer', fontFamily: theme.typography.font,
                    transition: 'all .12s',
                  }}>{opt}</button>
              );
            })}
          </div>
        );
      }

      case 'number':
        return (
          <div style={{ marginTop: 8 }}>
            <input type="number"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${theme.colors.borderStrong}`, background: theme.colors.bg,
                color: theme.colors.text, fontSize: '.875rem', outline: 'none',
                fontFamily: theme.typography.font, boxSizing: 'border-box',
              }}
              placeholder={q.clinicalGuide || 'Enter value'}
              value={existingAnswer?.value !== undefined ? String(existingAnswer.value) : ''}
              onChange={e => { const v = e.target.value; if (v !== '') handleAnswer(q.featureId, parseFloat(v)); }} />
          </div>
        );

      case 'text':
        return (
          <div style={{ marginTop: 8 }}>
            <input type="text"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${theme.colors.borderStrong}`, background: theme.colors.bg,
                color: theme.colors.text, fontSize: '.875rem', outline: 'none',
                fontFamily: theme.typography.font, boxSizing: 'border-box',
              }}
              placeholder={q.clinicalGuide || 'Enter details'}
              value={existingAnswer?.value !== undefined ? String(existingAnswer.value) : ''}
              onChange={e => handleAnswer(q.featureId, e.target.value)} />
          </div>
        );

      default:
        return null;
    }
  }, [handleAnswer, theme, deptColor]);

  const currentState = useMemo(() => {
    if (!session) return STATES[2];
    const stateId = session.state.interviewState || 'timeline_construction';
    return STATES.find(s => s.id === stateId) || STATES[2];
  }, [session]);

  const currentStateIdx = useMemo(() => {
    return INTERVIEW_STATE_ORDER.indexOf(currentState.id);
  }, [currentState.id]);

  const differentials = useMemo(() => {
    if (!session) return [];
    return session.state.ddx.activeCandidates.slice(0, 7);
  }, [session]);

  const topDiagnosis = useMemo(() => {
    if (!session) return null;
    return session.state.ddx.leadingDiagnosis;
  }, [session]);

  const redFlags = useMemo(() => {
    if (!session) return [];
    const flags: { disease: string; reason: string; severity: 'critical' | 'high' }[] = [];
    for (const c of session.state.ddx.activeCandidates) {
      if (c.isRedFlagTriggered) {
        flags.push({ disease: c.diseaseName, reason: `Red flag for ${c.diseaseName} (${Math.round(c.currentProb * 100)}%)`, severity: c.currentProb > 0.3 ? 'critical' : 'high' });
      }
    }
    const syncope = session.state.answers.find(a => a.featureId === 'syncope' && a.polarity === 'present');
    const rigidity = session.state.answers.find(a => a.featureId === 'rigidity' && a.polarity === 'present');
    const peritonism = session.state.answers.find(a => a.featureId === 'peritonism' && a.polarity === 'present');
    if (syncope) flags.push({ disease: 'Haemodynamic Instability', reason: 'Syncope with abdominal pain = haemodynamic compromise', severity: 'critical' });
    if (rigidity) flags.push({ disease: 'Generalised Peritonitis', reason: 'Abdominal rigidity = surgical emergency', severity: 'critical' });
    if (peritonism) flags.push({ disease: 'Peritoneal Irritation', reason: 'Peritonism suggests surgical abdomen', severity: 'high' });
    return flags;
  }, [session]);

  const contradictions: Contradiction[] = useMemo(() => {
    if (!session) return [];
    return session.state.contradictions || [];
  }, [session]);

  const isComplete = session?.isComplete || session?.nextQuestion === null;

  // Build continuous narrative from narrative parts
  const continuousNarrative = useMemo(() => {
    if (!session) return '';
    const parts = session.state.narrativeParts || [];
    if (parts.length === 0) return '';
    return parts.map(p => p.text).filter(Boolean).join(' ');
  }, [session]);

  const completeness = useMemo(() => {
    if (!session) return null;
    return session.state.completeness;
  }, [session]);

  const s = {
    header: { fontSize: '1.125rem', fontWeight: 600, color: theme.colors.text, marginBottom: 4 },
    sub: { fontSize: '.8125rem', color: theme.colors.textMuted, marginBottom: 20 },
    card: { background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
    label: { fontSize: '.6875rem', fontWeight: 600, color: theme.colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: '.08em' as const, marginBottom: 8 },
    labelSection: { fontSize: '.8125rem', fontWeight: 600, color: theme.colors.text, marginBottom: 4 },
    text: { fontSize: '.8125rem', color: theme.colors.text, lineHeight: 1.6, fontWeight: 400 },
    muted: { fontSize: '.75rem', color: theme.colors.textMuted, lineHeight: 1.5 },
    guide: { fontSize: '.6875rem', color: theme.colors.textMuted, fontStyle: 'italic', marginTop: 6, lineHeight: 1.4 },
    subtleCard: { background: theme.colors.bg, border: `1px solid ${theme.colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
    dangerCard: { border: `1px solid ${theme.colors.danger}40`, background: theme.colors.dangerBg } as React.CSSProperties,
    dangerLabel: { color: theme.colors.danger, fontSize: '.6875rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.08em' as const, marginBottom: 8 },
    dangerText: { fontSize: '.8125rem', color: theme.colors.danger, lineHeight: 1.5 },
    warnCard: { border: `1px solid ${theme.colors.warn}40`, background: theme.colors.warnBg } as React.CSSProperties,
    warnLabel: { color: theme.colors.warn, fontSize: '.6875rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.08em' as const, marginBottom: 8 },
    warnText: { fontSize: '.8125rem', color: theme.colors.warn, lineHeight: 1.5 },
  };

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🩺</div>
        <div style={s.header}>Initialising Clinical Reasoning Engine...</div>
        <div style={s.muted}>Preparing adaptive history-taking for {complaint}.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={s.header}>History of Presenting Illness — {complaint}</div>
      <div style={s.sub}>CIOS v2 — 8-state adaptive clinical interview. Questions selected by 4-factor priority scoring.</div>

      {/* 8-State Progress Bar */}
      <div style={{ ...s.card, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 8, flexWrap: 'wrap' }}>
          {STATES.map((st, i) => {
            const isActive = currentState.id === st.id;
            const isPast = currentStateIdx > i;
            const isFuture = currentStateIdx < i;
            return (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 100,
                  background: isActive ? `${st.color}20` : isPast ? `${st.color}10` : 'transparent',
                  border: `1px solid ${isActive ? st.color : isPast ? `${st.color}30` : theme.colors.border}`,
                  opacity: isFuture ? 0.35 : 1,
                  fontSize: '.625rem', fontWeight: isActive || isPast ? 600 : 400,
                  color: isActive ? st.color : isPast ? st.color : theme.colors.textMuted,
                  whiteSpace: 'nowrap' as const,
                }}>
                  <span>{isPast ? '✓' : st.icon}</span>
                  <span>{st.label}</span>
                </div>
                {i < STATES.length - 1 && (
                  <div style={{ width: 8, height: 1, background: isPast ? st.color : theme.colors.border }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '.6875rem', color: currentState.color, fontWeight: 600, marginTop: 4 }}>
          State {currentStateIdx + 1}/8: {currentState.label} — {currentState.goal}
        </div>
        <div style={{ ...s.muted, marginTop: 2 }}>
          {answeredCount} answers | {session.state.ddx.activeCandidates.length} active diagnoses
          {completeness && ` | ${Math.round(Object.values(completeness).filter(Boolean).length / Object.keys(completeness).length * 100)}% complete`}
        </div>
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div style={{ ...s.card, ...s.dangerCard, marginBottom: 16 }}>
          <div style={s.dangerLabel}>Red Flags Detected</div>
          {redFlags.map((rf, i) => (
            <div key={i} style={{ ...s.dangerText, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                flexShrink: 0, width: 56, padding: '1px 6px', borderRadius: 4, fontSize: '.625rem', fontWeight: 700,
                textAlign: 'center', textTransform: 'uppercase',
                background: rf.severity === 'critical' ? theme.colors.dangerBg : theme.colors.warnBg,
                color: rf.severity === 'critical' ? theme.colors.danger : theme.colors.warn,
              }}>{rf.severity}</span>
              <span style={{ flex: 1 }}>{rf.reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Contradictions */}
      {contradictions.length > 0 && showContradictions && (
        <div style={{ ...s.card, ...s.warnCard, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={s.warnLabel}>Contradictions Detected</div>
            <button onClick={() => setShowContradictions(false)}
              style={{
                padding: '2px 8px', borderRadius: 4, border: `1px solid ${theme.colors.border}`,
                background: 'transparent', color: theme.colors.textMuted, fontSize: '.625rem',
                cursor: 'pointer', fontFamily: theme.typography.font,
              }}>Dismiss</button>
          </div>
          {contradictions.map((c, i) => (
            <div key={i} style={{ ...s.warnText, marginBottom: 6, padding: '6px 8px', background: `${theme.colors.warn}08`, borderRadius: 6 }}>
              <div style={{ fontSize: '.6875rem', fontWeight: 600, marginBottom: 2 }}>
                {c.type.toUpperCase()} — {c.featureA.replace(/_/g, ' ')} vs {c.featureB.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '.75rem', lineHeight: 1.4 }}>{c.description}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        {/* Main Panel: Question + Continuous Narrative */}
        <div>
          {currentQuestion && !isComplete ? (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '1px 8px', borderRadius: 4, fontSize: '.625rem', fontWeight: 700,
                      background: `${currentState.color}15`, color: currentState.color,
                    }}>State {currentStateIdx + 1}: {currentState.label}</span>
                    <span style={{ fontSize: '.6875rem', color: theme.colors.textMuted }}>
                      Priority: {(currentQuestion.informationGain || 0).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: theme.colors.text, lineHeight: 1.4, marginBottom: 4 }}>
                    {currentQuestion.label}
                  </div>
                  <div style={s.guide}>{currentQuestion.rationale}</div>
                  {currentQuestion.clinicalGuide && (
                    <div style={{ ...s.guide, marginTop: 4, color: theme.colors.textMuted, fontStyle: 'italic' }}>
                      💡 {currentQuestion.clinicalGuide}
                    </div>
                  )}
                </div>
              </div>
              {renderAnswer(currentQuestion)}
            </div>
          ) : isComplete ? (
            <div style={s.card}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: theme.colors.text, marginBottom: 4 }}>
                  HPI Complete — State 8/8
                </div>
                <div style={s.muted}>
                  All essential domains explored. Review the narrative below.
                </div>
              </div>
            </div>
          ) : (
            <div style={s.card}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚡</div>
                <div style={s.muted}>Processing next question...</div>
              </div>
            </div>
          )}

          {/* Continuous HPI Narrative — builds after every answer */}
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={s.labelSection}>📝 Continuous HPI Narrative</div>
              <button onClick={() => setShowNarrative(!showNarrative)}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: `1px solid ${theme.colors.border}`,
                  background: 'transparent', color: theme.colors.textMuted, fontSize: '.6875rem',
                  cursor: 'pointer', fontFamily: theme.typography.font,
                }}>{showNarrative ? 'Collapse' : 'Expand'}</button>
            </div>
            {showNarrative && (
              continuousNarrative ? (
                <div style={{ ...s.subtleCard, borderLeft: `3px solid ${deptColor}` }}>
                  <div style={s.text}>{continuousNarrative}</div>
                </div>
              ) : session.narrative ? (
                <div style={{ ...s.subtleCard, borderLeft: `3px solid ${deptColor}` }}>
                  <div style={s.text}>{session.narrative.fullNarrative}</div>
                </div>
              ) : (
                <div style={{ ...s.subtleCard, textAlign: 'center', padding: 16 }}>
                  <div style={s.muted}>Answer questions — the narrative builds continuously after each answer.</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Panel: Differential + Completeness + Answers */}
        <div>
          {/* Differential Panel */}
          <div style={s.card}>
            <div style={s.labelSection}>🧠 Differential</div>
            <div style={s.muted}>Real-time probability updates</div>
            {differentials.length === 0 ? (
              <div style={{ ...s.subtleCard, marginTop: 8, textAlign: 'center', padding: 16 }}>
                <div style={s.muted}>Awaiting data...</div>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                {differentials.map((d, i) => {
                  const barWidth = Math.min(100, Math.round(d.currentProb * 100));
                  const isTop = i === 0;
                  return (
                    <div key={d.diseaseId} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 0', borderBottom: i < differentials.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.5625rem', fontWeight: 700,
                        background: isTop ? deptColor : theme.colors.surfaceAlt,
                        color: isTop ? '#fff' : theme.colors.textMuted,
                      }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '.75rem', color: theme.colors.text, fontWeight: isTop ? 600 : 400,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{d.diseaseName}</div>
                        <div style={{ width: '100%', height: 4, borderRadius: 2, background: theme.colors.surfaceAlt, marginTop: 2, overflow: 'hidden' }}>
                          <div style={{
                            width: `${barWidth}%`, height: '100%', borderRadius: 2,
                            background: isTop ? deptColor : barWidth > 30 ? deptColor : theme.colors.textMuted,
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontSize: '.625rem', fontWeight: 700, color: isTop ? deptColor : theme.colors.textMuted,
                        minWidth: 30, textAlign: 'right', fontFamily: theme.typography.mono,
                      }}>{barWidth}%</span>
                    </div>
                  );
                })}
              </div>
            )}
            {topDiagnosis && topDiagnosis.currentProb > 0.8 && (
              <div style={{ ...s.subtleCard, marginTop: 8, borderLeft: `3px solid ${deptColor}` }}>
                <div style={{ fontSize: '.75rem', fontWeight: 600, color: deptColor, marginBottom: 2 }}>
                  Converged: {topDiagnosis.diseaseName}
                </div>
                <div style={s.muted}>Probability {Math.round(topDiagnosis.currentProb * 100)}%. HPI can stop.</div>
              </div>
            )}
          </div>

          {/* Completeness Panel */}
          {completeness && (
            <div style={s.card}>
              <div style={s.labelSection}>📊 Completeness</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, fontSize: '.625rem' }}>
                {Object.entries(completeness).map(([domain, complete]) => (
                  <div key={domain} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px',
                    color: complete ? theme.colors.textMuted : theme.colors.text,
                  }}>
                    <span style={{ color: complete ? '#22c55e' : theme.colors.textMuted }}>{complete ? '✓' : '○'}</span>
                    <span>{domain.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer History */}
          <div style={s.card}>
            <div style={s.labelSection}>Answered</div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {session.state.answers.length === 0 ? (
                <div style={s.muted}>No answers yet.</div>
              ) : (
                session.state.answers.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '3px 0', fontSize: '.6875rem', color: theme.colors.textSub,
                    borderBottom: i < session.state.answers.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                  }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                      {a.questionLabel || a.featureId.replace(/_/g, ' ')}
                    </span>
                    <span style={{
                      flexShrink: 0, padding: '1px 6px', borderRadius: 4,
                      background: a.polarity === 'present' ? `${deptColor}15` : theme.colors.surfaceAlt,
                      color: a.polarity === 'present' ? deptColor : theme.colors.textMuted,
                      fontSize: '.625rem', fontWeight: 600,
                    }}>{String(a.value).length > 20 ? String(a.value).slice(0, 20) + '...' : String(a.value)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
