'use client'

import { useState, useCallback } from 'react'
import { useADOS } from './ADOSContext'
import { C } from '@/lib/colors'
import {
  MessageSquare, Clock, AlertTriangle, CheckCircle, User,
  ArrowRight, FileText, ChevronRight, Sun, Moon, LogOut,
  Activity, Users, Brain,
} from 'lucide-react'

const S = {
  page: {
    minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif",
    color: C.text, display: 'flex', flexDirection: 'column' as const,
  },
  container: { maxWidth: 640, margin: '0 auto', width: '100%', padding: '40px 24px' },
  card: {
    background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
    padding: 28, marginBottom: 16,
  },
  label: { fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6, display: 'flex' as const, alignItems: 'center', gap: 4 },
}

export function ADOSHandover() {
  const { context, lifecycle, startHandover, acceptHandover, endShift } = useADOS()
  const [summary, setSummary] = useState('')
  const [step, setStep] = useState<'review' | 'summary' | 'complete'>('review')

  const handleStartHandover = useCallback(() => {
    if (!context || !summary.trim()) return
    startHandover(summary)
    setStep('complete')
  }, [context, summary, startHandover])

  const handleEndShift = useCallback(() => {
    endShift()
  }, [endShift])

  if (!context) {
    return (
      <div style={S.page}>
        <div style={{ ...S.container, textAlign: 'center', paddingTop: 80 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🩺</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>Shift Complete</h2>
          <p style={{ fontSize: 13, color: C.textLight, margin: '0 0 20px' }}>Thank you for your work today.</p>
          <button onClick={handleEndShift} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: C.sky, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  const criticalCount = context.patients.filter(p => p.priority === 'critical').length
  const pendingTasks = context.tasks.filter(t => t.status !== 'completed')

  if (step === 'review') {
    return (
      <div style={S.page}>
        <div style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, flexShrink: 0 }}>
          <MessageSquare size={18} color={C.sky} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
          <span style={{ width: 1, height: 20, background: C.border }} />
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>
            HANDOVER
          </span>
          <span style={{ fontSize: 12, color: C.textLight, flex: 1 }}>
            End-of-Shift Clinical Handover
          </span>
          <span style={{ fontSize: 11, color: C.textLight }}>{context.doctorName}</span>
        </div>
        <div style={S.container}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: '0 0 20px' }}>
            End-of-Shift Handover
          </h1>

          {/* Shift Info */}
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Sun size={20} color="#F59E0B" />
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, display: 'block' }}>
                  {context.shift.charAt(0).toUpperCase() + context.shift.slice(1)} Shift
                </span>
                <span style={{ fontSize: 12, color: C.textLight }}>
                  {context.doctorName} · {context.departmentName} · {context.assignment.label}
                </span>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: C.panel, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, #10B981, #F59E0B, #EF4444)',
              }} />
            </div>
          </div>

          {/* Patient Summary */}
          <div style={S.card}>
            <span style={S.label}><Users size={11} /> Patient Summary</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Total Patients', value: context.patients.length, color: C.sky },
                { label: 'Critical', value: criticalCount, color: '#EF4444' },
                { label: 'Pending Tasks', value: pendingTasks.length, color: '#F59E0B' },
              ].map(s => (
                <div key={s.label} style={{ padding: '12px', borderRadius: 10, background: C.panel, textAlign: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: s.color, display: 'block' }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: C.textLight }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Patient List */}
            {context.patients.map(p => (
              <div key={p.id} style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 4,
                background: p.priority === 'critical' ? 'rgba(239,68,68,0.05)' : C.panel,
                border: p.priority === 'critical' ? '1px solid rgba(239,68,68,0.15)' : 'none',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: p.priority === 'critical' ? '#EF4444' : p.priority === 'high' ? '#F59E0B' : '#10B981',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: C.textLight, marginLeft: 8 }}>
                    {p.bed || 'No bed'} · {p.diagnosis}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: C.textLight }}>
                  Day {p.hospitalDay}
                </span>
                {p.priority === 'critical' && (
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 600 }}>
                    CRITICAL
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div style={S.card}>
              <span style={S.label}><Activity size={11} /> Pending Tasks ({pendingTasks.length})</span>
              {pendingTasks.slice(0, 10).map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                  borderBottom: `1px solid ${C.panel}`, fontSize: 12,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: t.priority === 'critical' ? '#EF4444' : t.priority === 'urgent' ? '#F59E0B' : C.textLight,
                    flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, color: C.text }}>{t.title}</span>
                  {t.patientName && <span style={{ color: C.textLight, fontSize: 11 }}>{t.patientName}</span>}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setStep('summary')}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: C.sky, color: 'white', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            Continue to Handover Summary <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  if (step === 'summary') {
    return (
      <div style={S.page}>
        <div style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, flexShrink: 0 }}>
          <MessageSquare size={18} color={C.sky} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
          <span style={{ width: 1, height: 20, background: C.border }} />
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>
            HANDOVER SUMMARY
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setStep('review')}
            style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight, fontFamily: "'Inter', sans-serif" }}>
            Back
          </button>
        </div>
        <div style={S.container}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>
            Handover Summary
          </h1>
          <p style={{ fontSize: 13, color: C.textLight, margin: '0 0 24px' }}>
            Provide a brief summary of the shift and any key information for the incoming team.
          </p>

          <div style={S.card}>
            <span style={S.label}><FileText size={11} /> Clinical Summary</span>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Write a brief summary of the shift, including any unresolved issues, critical patients, and key handover points..."
              rows={6}
              style={{
                width: '100%', padding: 14, borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.panel,
                fontSize: 13, color: C.text, fontFamily: "'Inter', sans-serif",
                resize: 'vertical', outline: 'none', lineHeight: 1.6,
              }}
            />
          </div>

          <div style={S.card}>
            <span style={S.label}><AlertTriangle size={11} /> Critical Items to Hand Over</span>
            {context.patients.filter(p => p.priority === 'critical' || p.priority === 'high').map(p => (
              <div key={p.id} style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                fontSize: 13,
              }}>
                <span style={{ fontWeight: 600, color: C.navy }}>{p.name}</span>
                <span style={{ color: C.textLight }}> — {p.diagnosis}</span>
                <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.alerts.map((a, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>{a}</span>
                  ))}
                </div>
              </div>
            ))}
            {context.patients.filter(p => p.priority === 'critical' || p.priority === 'high').length === 0 && (
              <p style={{ fontSize: 12, color: '#10B981', margin: 0 }}>✓ No critical patients to hand over</p>
            )}
          </div>

          <button
            onClick={handleStartHandover}
            disabled={!summary.trim()}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: summary.trim() ? '#10B981' : C.border,
              color: summary.trim() ? 'white' : C.textLight,
              fontSize: 14, fontWeight: 700,
              cursor: summary.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: summary.trim() ? 1 : 0.6,
            }}>
            {summary.trim() ? <>Complete Handover <CheckCircle size={16} /></> : 'Write a summary to continue'}
          </button>
        </div>
      </div>
    )
  }

  // Complete step
  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', border: '2px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle size={36} color="#10B981" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>Handover Complete</h1>
          <p style={{ fontSize: 13, color: C.textLight, margin: '0 0 24px', maxWidth: 400, marginInline: 'auto' }}>
            Responsibility has been transferred. All patient information, pending tasks, and critical alerts have been documented for the incoming team.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setStep('review')}
              style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
              Review Handover
            </button>
            <button onClick={handleEndShift}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: C.sky, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
