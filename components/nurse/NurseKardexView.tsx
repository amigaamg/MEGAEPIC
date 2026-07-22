'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { listenVitals } from '@/lib/clinical/vitals/vitalSignsEngine'
import type { VitalReading } from '@/lib/clinical/vitals/vitalSignsEngine'

interface PatientProfile {
  id: string
  name: string
  age: number
  gender: string
  bed?: string
  mrn?: string
  allergies?: string
  diagnosis?: string[]
  diet?: string
  mobility?: string
  isolation?: string
  ivAccess?: string
  oxygen?: string
}

interface NurseTask {
  id: string
  patientId: string
  patientName: string
  bed: string
  task: string
  frequency: string
  priority: 'high' | 'medium' | 'low'
  dueTime: string
  status: 'pending' | 'completed'
}

interface Props {
  orgId: string
  deptId: string
  unitId: string
  userId: string
}

export function NurseKardexView({ orgId, deptId, unitId, userId }: Props) {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [vitalsMap, setVitalsMap] = useState<Record<string, VitalReading[]>>({})
  const [tasks, setTasks] = useState<NurseTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'prescriptions'), where('active', '==', true))
    const unsubPrescriptions = onSnapshot(q, (snap) => {
      const seen = new Set<string>()
      const patientMap = new Map<string, { name: string; id: string }>()
      snap.docs.forEach(d => {
        const data = d.data()
        const pid = data.patientId
        if (pid && !seen.has(pid)) {
          seen.add(pid)
          patientMap.set(pid, { name: data.patientName || 'Unknown', id: pid })
        }
      })
      const patientList: PatientProfile[] = Array.from(patientMap.entries()).map(([id, info]) => ({
        id,
        name: info.name,
        age: 0,
        gender: '',
        allergies: '',
        diagnosis: [],
      }))
      setPatients(patientList)
      setLoading(false)
    })

    const unsubTasks = onSnapshot(
      query(collection(db, 'medicationSchedules'), where('status', '==', 'pending'), orderBy('scheduledTimestamp', 'asc')),
      (snap) => {
        const taskList: NurseTask[] = snap.docs.map(d => {
          const data = d.data()
          return {
            id: d.id,
            patientId: data.patientId,
            patientName: data.patientName || 'Unknown',
            bed: data.bed || '-',
            task: `${data.medicationName} ${data.dose} ${data.route}`,
            frequency: data.frequency,
            priority: 'high' as const,
            dueTime: data.scheduledTime || '',
            status: 'pending' as const,
          }
        })
        setTasks(taskList)
      },
    )

    return () => {
      unsubPrescriptions()
      unsubTasks()
    }
  }, [])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 30, color: '#94A3B8', fontSize: 13 }}>Loading...</div>
  }

  if (patients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 30 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🛏️</div>
        <div style={{ color: '#94A3B8', fontSize: 13 }}>No active patients with prescriptions</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
          Patient Kardex — {patients.length} patients
        </div>
        <div style={{ fontSize: 11, color: '#64748B' }}>
          {tasks.filter(t => t.status === 'pending').length} pending tasks
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {patients.map(patient => (
          <div
            key={patient.id}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {patient.name}
                  {patient.bed && <span style={{ fontSize: 11, color: '#64748B', marginLeft: 8 }}>Bed {patient.bed}</span>}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  {patient.age > 0 && `${patient.age} yrs · `}
                  {patient.gender && `${patient.gender} · `}
                  MRN: {patient.mrn || patient.id.slice(-6)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge color="#10B981">{patient.diagnosis?.join(', ') || 'Under investigation'}</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
              <InfoChip label="Allergies" value={patient.allergies || 'None recorded'} color={patient.allergies && patient.allergies !== 'None' ? '#DC2626' : '#94A3B8'} />
              <InfoChip label="Diet" value={patient.diet || 'Not specified'} />
              <InfoChip label="Mobility" value={patient.mobility || 'Independent'} />
              <InfoChip label="Isolation" value={patient.isolation || 'Standard'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <InfoChip label="IV Access" value={patient.ivAccess || 'None'} />
              <InfoChip label="Oxygen" value={patient.oxygen || 'Room air'} />
              <InfoChip label="Tasks" value={`${tasks.filter(t => t.patientId === patient.id && t.status === 'pending').length} pending`} />
            </div>

            {tasks.filter(t => t.patientId === patient.id && t.status === 'pending').length > 0 && (
              <div style={{ marginTop: 8, borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>
                  Pending Medications
                </div>
                {tasks.filter(t => t.patientId === patient.id && t.status === 'pending').slice(0, 3).map(task => (
                  <div key={task.id} style={{ fontSize: 11, color: '#475569', padding: '2px 0' }}>
                    ⏰ {task.dueTime} — {task.task}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 600,
      background: `${color}15`,
      color,
    }}>
      {children}
    </span>
  )
}

function InfoChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ fontSize: 11 }}>
      <span style={{ color: '#94A3B8', fontWeight: 500 }}>{label}: </span>
      <span style={{ color: color || '#475569', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
