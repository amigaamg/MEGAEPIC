'use client'

import { useState } from 'react'
import { recordVitals } from '@/lib/clinical/vitals/vitalSignsEngine'

interface Props {
  deptId: string
  unitId: string
  encounterId: string
  patientId: string
  userId: string
  userName: string
  onSaved?: () => void
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #E2E8F0',
  fontSize: 13,
  background: '#F8FAFC',
  outline: 'none',
  fontFamily: "'Inter', sans-serif",
  boxSizing: 'border-box',
}

export function NurseVitalsCapture({ deptId, unitId, encounterId, patientId, userId, userName, onSaved }: Props) {
  const [vitals, setVitals] = useState({
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    bpSystolic: '',
    bpDiastolic: '',
    oxygenSaturation: '',
    weight: '',
    painScore: '',
    bloodGlucose: '',
    gcs: '',
    avpu: 'alert' as const,
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (field: string) => (value: string) => setVitals(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: {
        recordedBy: string; recordedByName: string; recordedByRole: 'nurse' | 'doctor' | 'system';
        source?: 'manual_entry' | 'device' | 'imported';
        temperature?: number; heartRate?: number; respiratoryRate?: number;
        bpSystolic?: number; bpDiastolic?: number; oxygenSaturation?: number;
        weight?: number; painScore?: number; bloodGlucose?: number;
        gcs?: number; avpu?: 'alert' | 'voice' | 'pain' | 'unresponsive';
        notes?: string;
      } = {
        recordedBy: userId,
        recordedByName: userName,
        recordedByRole: 'nurse',
        source: 'manual_entry',
      }
      if (vitals.temperature) payload.temperature = parseFloat(vitals.temperature)
      if (vitals.heartRate) payload.heartRate = parseInt(vitals.heartRate)
      if (vitals.respiratoryRate) payload.respiratoryRate = parseInt(vitals.respiratoryRate)
      if (vitals.bpSystolic) payload.bpSystolic = parseInt(vitals.bpSystolic)
      if (vitals.bpDiastolic) payload.bpDiastolic = parseInt(vitals.bpDiastolic)
      if (vitals.oxygenSaturation) payload.oxygenSaturation = parseInt(vitals.oxygenSaturation)
      if (vitals.weight) payload.weight = parseFloat(vitals.weight)
      if (vitals.painScore) payload.painScore = parseInt(vitals.painScore)
      if (vitals.bloodGlucose) payload.bloodGlucose = parseFloat(vitals.bloodGlucose)
      if (vitals.gcs) payload.gcs = parseInt(vitals.gcs)
      payload.avpu = vitals.avpu
      if (vitals.notes) payload.notes = vitals.notes

      await recordVitals(deptId, unitId, encounterId, patientId, payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      onSaved?.()
    } catch (err) {
      console.error('Failed to save vitals:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        <Field label="Temperature (°C)" value={vitals.temperature} onChange={set('temperature')} placeholder="37.0" />
        <Field label="Heart Rate (bpm)" value={vitals.heartRate} onChange={set('heartRate')} placeholder="72" />
        <Field label="Respiratory Rate (/min)" value={vitals.respiratoryRate} onChange={set('respiratoryRate')} placeholder="16" />
        <Field label="BP Systolic (mmHg)" value={vitals.bpSystolic} onChange={set('bpSystolic')} placeholder="120" />
        <Field label="BP Diastolic (mmHg)" value={vitals.bpDiastolic} onChange={set('bpDiastolic')} placeholder="80" />
        <Field label="SpO₂ (%)" value={vitals.oxygenSaturation} onChange={set('oxygenSaturation')} placeholder="98" />
        <Field label="Weight (kg)" value={vitals.weight} onChange={set('weight')} placeholder="70" />
        <Field label="Pain Score (0-10)" value={vitals.painScore} onChange={set('painScore')} placeholder="0" />
        <Field label="Blood Glucose (mmol/L)" value={vitals.bloodGlucose} onChange={set('bloodGlucose')} placeholder="5.0" />
        <Field label="GCS (3-15)" value={vitals.gcs} onChange={set('gcs')} placeholder="15" />
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#475569', marginBottom: 4 }}>AVPU</div>
          <select
            value={vitals.avpu}
            onChange={e => setVitals(prev => ({ ...prev, avpu: e.target.value as any }))}
            style={INPUT_STYLE}
          >
            <option value="alert">Alert</option>
            <option value="voice">Voice</option>
            <option value="pain">Pain</option>
            <option value="unresponsive">Unresponsive</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Notes</div>
        <textarea
          value={vitals.notes}
          onChange={e => setVitals(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any observations or concerns..."
          style={{ ...INPUT_STYLE, minHeight: 50, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 24px',
            borderRadius: 8,
            border: 'none',
            background: saved ? '#10B981' : '#2F80ED',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Vitals'}
        </button>
        {saved && <span style={{ fontSize: 11, color: '#10B981' }}>Vitals recorded successfully</span>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#475569', marginBottom: 4 }}>{label}</div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={INPUT_STYLE}
      />
    </div>
  )
}
