'use client'

import { useMemo, useState } from 'react'
import type { ClinicalIntelligenceOutput } from '@/lib/clinical/engines/clinicalIntelligenceEngine'
import type { CoughDiseaseProbability, CoughRedFlag } from '@/lib/amexan/clinical-reasoning/coughReasoning'
import type { PatientVitals } from '@/lib/clinical/engines/clinicalIntelligenceEngine'
import { runClinicalIntelligence } from '@/lib/clinical/engines/clinicalIntelligenceEngine'

interface Props {
  differentials: CoughDiseaseProbability[]
  redFlags: CoughRedFlag[]
  vitals: PatientVitals
  comorbidities?: string[]
  allergies?: string[]
  age?: number
  pregnancy?: boolean
}

export function ClinicalIntelligencePanel({ differentials, redFlags, vitals, comorbidities = [], allergies = [], age = 40, pregnancy = false }: Props) {
  const plan = useMemo(() => runClinicalIntelligence({ differentials, redFlags, vitals, comorbidities, allergies, age, pregnancy }), [differentials, redFlags, vitals, comorbidities, allergies, age, pregnancy])

  const [activeTab, setActiveTab] = useState<'medications' | 'investigations' | 'nursing' | 'monitoring' | 'supportive'>('medications')

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>🧠</span>
          <div>
            <div style={styles.headerTitle}>Clinical Intelligence Engine</div>
            <div style={styles.headerMeta}>
              <span style={styles.leadingDx}>{plan.leadingDiagnosis}</span>
              <SeverityBadge severity={plan.severity} />
            </div>
          </div>
        </div>
      </div>

      {plan.warnings.length > 0 && (
        <div style={styles.warnings}>
          {plan.warnings.map((w, i) => (
            <div key={i} style={styles.warningRow}>
              <span style={styles.warningIcon}>⚠️</span>
              <span style={styles.warningText}>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div style={styles.tabs}>
        {(['medications', 'investigations', 'nursing', 'monitoring', 'supportive'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            ...styles.tab,
            background: activeTab === tab ? '#2F80ED' : 'transparent',
            color: activeTab === tab ? '#fff' : '#475569',
          }}>
            {tab === 'medications' ? '💊 Meds' : tab === 'investigations' ? '🔬 Labs' : tab === 'nursing' ? '🩺 Nursing' : tab === 'monitoring' ? '📊 Monitor' : '🆘 Support'}
          </button>
        ))}
      </div>

      <div style={styles.panel}>
        {activeTab === 'medications' && <MedicationsTab plan={plan} allergies={allergies} />}
        {activeTab === 'investigations' && <InvestigationsTab plan={plan} />}
        {activeTab === 'nursing' && <NursingTab plan={plan} />}
        {activeTab === 'monitoring' && <MonitoringTab plan={plan} />}
        {activeTab === 'supportive' && <SupportiveTab plan={plan} />}
      </div>

      {plan.recommendations.length > 0 && (
        <div style={styles.recommendations}>
          <div style={styles.recTitle}>📋 Recommendations</div>
          {plan.recommendations.map((r, i) => (
            <div key={i} style={styles.recRow}>
              <span style={styles.recCheck}>✓</span> {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    mild: { bg: '#E8F5E9', text: '#1E8E3E' },
    moderate: { bg: '#FFF3E0', text: '#E65100' },
    severe: { bg: '#FFEBEE', text: '#D32F2F' },
  }
  const c = colors[severity] || colors.moderate
  return <span style={{ ...styles.badge, background: c.bg, color: c.text }}>{severity.toUpperCase()}</span>
}

function MedicationsTab({ plan, allergies }: { plan: ClinicalIntelligenceOutput; allergies: string[] }) {
  const [accepted, setAccepted] = useState<Record<number, boolean>>({})
  const patientAllergyLower = allergies.map(a => a.toLowerCase())
  return (
    <div>
      {plan.medications.length === 0 && <div style={styles.empty}>No medications recommended</div>}
          {plan.medications.map((med, i) => {
            const drugAllergyMatch = patientAllergyLower.some(a => med.drug.toLowerCase().includes(a) || a.includes(med.drug.toLowerCase().split(' ')[0]))
            return (
              <div key={i} style={styles.medCard}>
                <div style={styles.medHeader}>
                  <span style={styles.medTitle}>{med.drug}</span>
                  <span style={styles.medRoute}>{med.route}</span>
                </div>
                <div style={styles.medMeta}>
                  <span>{med.dose} · {med.frequency} · {med.duration}</span>
                </div>
                <div style={styles.medNotes}>{med.notes}</div>
                {drugAllergyMatch && med.alternativeIfAllergy.length > 0 && (
                  <div style={styles.allergyNote}>
                    🔄 Allergy alternative: {med.alternativeIfAllergy.join(' / ')}
                  </div>
                )}
                <div style={styles.medActions}>
                  <button
                    onClick={() => setAccepted(prev => ({ ...prev, [i]: !prev[i] }))}
                    style={{
                      ...styles.medBtn,
                      background: accepted[i] ? '#10B981' : '#2F80ED',
                    }}
                  >
                    {accepted[i] ? '✓ Accepted' : 'Accept Rx'}
                  </button>
                </div>
              </div>
            )
          })}
      {plan.infusion.length > 0 && (
        <>
          <div style={styles.subSection}>💧 Infusion Orders</div>
          {plan.infusion.map((inf, i) => (
            <div key={i} style={{ ...styles.medCard, borderLeft: '3px solid #60A5FA' }}>
              <div style={styles.medHeader}><span style={styles.medTitle}>{inf.solution}</span></div>
              <div style={styles.medMeta}>{inf.rate} · {inf.indication}</div>
              <div style={styles.medNotes}>Monitor: {inf.monitoring.join(', ')}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function InvestigationsTab({ plan }: { plan: ClinicalIntelligenceOutput }) {
  const inv = plan.investigations
  return (
    <div>
      <div style={styles.bundleLabel}>{inv.bundleLabel}</div>
      {inv.bedside.length > 0 && (
        <div style={styles.invSection}>
          <div style={styles.invSectionTitle}>🛏️ Bedside</div>
          {inv.bedside.map((item, i) => <div key={i} style={styles.invItem}>• {item}</div>)}
        </div>
      )}
      {inv.laboratory.length > 0 && (
        <div style={styles.invSection}>
          <div style={styles.invSectionTitle}>🧪 Laboratory</div>
          {inv.laboratory.map((item, i) => <div key={i} style={styles.invItem}>• {item}</div>)}
        </div>
      )}
      {inv.imaging.length > 0 && (
        <div style={styles.invSection}>
          <div style={styles.invSectionTitle}>📷 Imaging</div>
          {inv.imaging.map((item, i) => <div key={i} style={styles.invItem}>• {item}</div>)}
        </div>
      )}
      {inv.microbiology.length > 0 && (
        <div style={styles.invSection}>
          <div style={styles.invSectionTitle}>🦠 Microbiology</div>
          {inv.microbiology.map((item, i) => <div key={i} style={styles.invItem}>• {item}</div>)}
        </div>
      )}
      {inv.conditional.length > 0 && (
        <div style={styles.invSection}>
          <div style={styles.invSectionTitle}>🔀 Conditional</div>
          {inv.conditional.map((c, i) => (
            <div key={i} style={styles.invItem}>
              <strong>{c.label}:</strong> {c.tests.join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NursingTab({ plan }: { plan: ClinicalIntelligenceOutput }) {
  if (!plan.nursing) return <div style={styles.empty}>No nursing orders generated</div>
  return (
    <div>
      <div style={styles.subSection}>📊 Monitoring Orders</div>
      {plan.nursing.monitoring.map((m, i) => (
        <div key={i} style={styles.nurseRow}>
          <span style={styles.nurseParam}>{m.parameter}</span>
          <span style={styles.nurseFreq}>{m.frequency}</span>
          {m.target && <span style={styles.nurseTarget}>→ {m.target}</span>}
          {m.notes && <span style={styles.nurseNote}>{m.notes}</span>}
        </div>
      ))}
      <div style={{ ...styles.subSection, marginTop: 12 }}>🩺 Care Orders</div>
      {plan.nursing.care.map((c, i) => (
        <div key={i} style={styles.nurseRow}>
          <span style={styles.nurseParam}>{c.parameter}</span>
          <span style={styles.nurseFreq}>{c.frequency}</span>
          {c.notes && <span style={styles.nurseNote}>{c.notes}</span>}
        </div>
      ))}
      <div style={{ ...styles.subSection, marginTop: 12 }}>🚨 Escalation Criteria</div>
      {plan.nursing.escalation.map((e, i) => (
        <div key={i} style={{ ...styles.nurseRow, borderLeft: '3px solid #EF4444', background: '#FFF5F5' }}>
          <div style={styles.nurseParam}>{e.condition}</div>
          <div style={styles.nurseFreq}>{e.threshold} → {e.action}</div>
          <div style={styles.nurseNote}>Notify: {e.notify.join(', ')}</div>
        </div>
      ))}
    </div>
  )
}

function MonitoringTab({ plan }: { plan: ClinicalIntelligenceOutput }) {
  const m = plan.monitoring
  if (!m) return <div style={styles.empty}>No monitoring plan generated</div>
  return (
    <div>
      <div style={styles.subSection}>Vitals Frequency: <strong>{m.vitalsFrequency}</strong></div>
      <div style={styles.monGrid}>
        {m.urineOutput && <div style={styles.monChip}>💧 Strict I/O Chart</div>}
        {m.fluidBalance && <div style={styles.monChip}>⚖️ Fluid Balance</div>}
        {m.dailyWeight && <div style={styles.monChip}>⚖️ Daily Weight</div>}
        {m.painScore && <div style={styles.monChip}>😣 Pain Score</div>}
      </div>
      {m.special.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={styles.subSection}>Special Monitoring</div>
          {m.special.map((s, i) => <div key={i} style={styles.invItem}>• {s}</div>)}
        </div>
      )}
    </div>
  )
}

function SupportiveTab({ plan }: { plan: ClinicalIntelligenceOutput }) {
  const s = plan.supportive
  const items = [
    { key: 'Oxygen Therapy', value: s.oxygen },
    { key: 'IV Fluids', value: s.fluids },
    { key: 'Vasopressors', value: s.vasopressors },
    { key: 'Fever Management', value: s.fever },
    { key: 'Nutrition', value: s.nutrition },
    { key: 'DVT Prophylaxis', value: s.dvtProphylaxis },
    { key: 'Early Mobilization', value: s.mobilization },
    { key: 'Sepsis Bundle', value: s.sepsisBundle },
  ]

  return (
    <div>
      {items.filter(item => item.value).map((item, i) => (
        <div key={i} style={styles.supCard}>
          <div style={styles.supTitle}>{item.key}</div>
          {item.value && (
            <>
              <div style={styles.supAction}>{item.value.action}</div>
              <div style={styles.supDetails}>{item.value.details}</div>
              <div style={styles.supMonitor}>Monitor: {item.value.monitoring}</div>
            </>
          )}
        </div>
      ))}
      {plan.isolation && (
        <div style={{ ...styles.supCard, borderLeft: '3px solid #8B5CF6', marginTop: 8 }}>
          <div style={styles.supTitle}>🔒 Isolation: {plan.isolation.type.toUpperCase()}</div>
          <div style={styles.supAction}>PPE: {plan.isolation.ppe.join(', ')}</div>
          <div style={styles.supDetails}>Room: {plan.isolation.roomType}</div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  header: {
    padding: '14px 16px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F8FAFC',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontSize: 13, fontWeight: 700, color: '#0F172A' },
  headerMeta: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 },
  leadingDx: { fontSize: 11, color: '#475569', fontWeight: 600 },
  badge: { fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.03em' },
  warnings: { padding: '8px 16px', background: '#FFF5F5', borderBottom: '1px solid #FECACA' },
  warningRow: { display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' },
  warningIcon: { fontSize: 12 },
  warningText: { fontSize: 11, color: '#DC2626', fontWeight: 600 },
  tabs: { display: 'flex', gap: 0, padding: '8px 8px 0', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
  tab: { padding: '6px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: '6px 6px 0 0', cursor: 'pointer' },
  panel: { padding: 12, maxHeight: 400, overflowY: 'auto' },
  subSection: { fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  medCard: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    marginBottom: 8,
    background: '#FFFFFF',
    borderLeft: '3px solid #2F80ED',
  },
  medHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  medTitle: { fontSize: 13, fontWeight: 700, color: '#0F172A' },
  medRoute: { fontSize: 10, fontWeight: 600, color: '#60A5FA', background: '#EFF6FF', padding: '1px 6px', borderRadius: 4 },
  medMeta: { fontSize: 11, color: '#475569', marginBottom: 2 },
  medNotes: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  allergyNote: { fontSize: 10, color: '#D97706', background: '#FFFBEB', padding: '4px 8px', borderRadius: 4, marginTop: 4 },
  medActions: { marginTop: 6, display: 'flex', gap: 6 },
  medBtn: { padding: '4px 12px', borderRadius: 6, border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  bundleLabel: { fontSize: 12, fontWeight: 700, color: '#2F80ED', marginBottom: 10 },
  invSection: { marginBottom: 10 },
  invSectionTitle: { fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  invItem: { fontSize: 11, color: '#334155', padding: '2px 0', lineHeight: 1.6 },
  nurseRow: { padding: '6px 10px', borderRadius: 6, marginBottom: 4, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 11 },
  nurseParam: { fontWeight: 600, color: '#0F172A', display: 'inline', marginRight: 8 },
  nurseFreq: { color: '#2F80ED', fontWeight: 600, display: 'inline', marginRight: 8 },
  nurseTarget: { color: '#10B981', display: 'inline', marginRight: 8 },
  nurseNote: { color: '#94A3B8', display: 'inline' },
  monGrid: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  monChip: { padding: '4px 10px', borderRadius: 6, background: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: 11, color: '#0369A1', fontWeight: 500 },
  supCard: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    marginBottom: 6,
    background: '#F8FAFC',
    borderLeft: '3px solid #10B981',
  },
  supTitle: { fontSize: 11, fontWeight: 700, color: '#0F172A', marginBottom: 2 },
  supAction: { fontSize: 12, color: '#1E40AF', fontWeight: 600, marginBottom: 2 },
  supDetails: { fontSize: 10, color: '#475569', lineHeight: 1.5, marginBottom: 2 },
  supMonitor: { fontSize: 10, color: '#94A3B8' },
  recommendations: { padding: '10px 16px', borderTop: '1px solid #E2E8F0', background: '#F0F9FF' },
  recTitle: { fontSize: 11, fontWeight: 700, color: '#0369A1', marginBottom: 6 },
  recRow: { fontSize: 10, color: '#334155', padding: '1px 0', lineHeight: 1.6 },
  recCheck: { color: '#10B981', fontWeight: 700, marginRight: 4 },
  empty: { fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: 20 },
}
