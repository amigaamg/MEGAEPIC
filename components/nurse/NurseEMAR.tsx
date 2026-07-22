'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateTherapyDay } from '@/lib/clinical/tracking/dayTracker'

interface MedSchedule {
  id: string
  prescriptionId: string
  patientId: string
  medicationName: string
  dose: string
  route: string
  frequency: string
  scheduledTime: string
  scheduledTimestamp: number
  status: 'pending' | 'taken' | 'missed' | 'delayed'
  administeredBy?: string
  administeredAt?: number
  notes?: string
}

interface Prescription {
  id: string
  patientId: string
  doctorId: string
  doctorName: string
  drug: string
  dose: string
  route: string
  frequency: string
  duration: string
  startDate: number
  active: boolean
}

interface Props {
  unitId: string
  patientId?: string
  userId: string
  userName: string
}

export function NurseEMAR({ unitId, patientId, userId, userName }: Props) {
  const [schedules, setSchedules] = useState<MedSchedule[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [administeringId, setAdministeringId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken' | 'missed'>('all')

  useEffect(() => {
    const constraints: any[] = [where('status', 'in', ['pending', 'missed', 'delayed'])]
    if (patientId) constraints.push(where('patientId', '==', patientId))
    const q = query(collection(db, 'medicationSchedules'), ...constraints)
    return onSnapshot(q, (snap) => {
      setSchedules(snap.docs.map(d => d.data() as MedSchedule))
    })
  }, [patientId])

  useEffect(() => {
    const q = query(collection(db, 'prescriptions'), where('active', '==', true), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setPrescriptions(snap.docs.map(d => d.data() as Prescription))
    })
  }, [])

  const handleAdminister = async (scheduleId: string) => {
    setAdministeringId(scheduleId)
    try {
      await updateDoc(doc(db, 'medicationSchedules', scheduleId), {
        status: 'taken',
        administeredBy: userName,
        administeredAt: Date.now(),
      })
    } catch (err) {
      console.error('Failed to administer:', err)
    } finally {
      setAdministeringId(null)
    }
  }

  const handleMissed = async (scheduleId: string) => {
    try {
      await updateDoc(doc(db, 'medicationSchedules', scheduleId), {
        status: 'missed',
        notes: 'Marked as missed by nurse',
      })
    } catch (err) {
      console.error('Failed to mark missed:', err)
    }
  }

  const now = Date.now()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const filtered = schedules
    .filter(s => {
      if (filter === 'all') return true
      return s.status === filter
    })
    .sort((a, b) => (a.scheduledTimestamp || 0) - (b.scheduledTimestamp || 0))

  const statusColor: Record<string, string> = {
    pending: '#F59E0B',
    taken: '#10B981',
    missed: '#DC2626',
    delayed: '#8B5CF6',
  }

  const statusBg: Record<string, string> = {
    pending: '#FFFBEB',
    taken: '#ECFDF5',
    missed: '#FEF2F2',
    delayed: '#F5F3FF',
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['all', 'pending', 'taken', 'missed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: 'none',
              background: filter === f ? '#2F80ED' : '#F1F5F9',
              color: filter === f ? '#fff' : '#475569',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? schedules.length : schedules.filter(s => s.status === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 30, color: '#94A3B8', fontSize: 13 }}>
          No medications scheduled
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(schedule => {
          const prescription = prescriptions.find(p => p.id === schedule.prescriptionId)
          const dayInfo = prescription
            ? calculateTherapyDay(prescription.startDate ? new Date(prescription.startDate) : null, prescription.duration)
            : null

          return (
            <div
              key={schedule.id}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: statusBg[schedule.status] || '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    {schedule.medicationName}
                  </span>
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 600,
                    background: `${statusColor[schedule.status]}20`,
                    color: statusColor[schedule.status],
                  }}>
                    {schedule.status.toUpperCase()}
                  </span>
                  {dayInfo && (
                    <span style={{ fontSize: 10, color: '#64748B' }}>
                      Day {dayInfo.currentDay}/{dayInfo.totalDays}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>
                  {schedule.dose} · {schedule.route} · {schedule.frequency}
                  {schedule.scheduledTime && ` · Due: ${schedule.scheduledTime}`}
                </div>
                {schedule.administeredBy && (
                  <div style={{ fontSize: 10, color: '#10B981', marginTop: 1 }}>
                    Given by {schedule.administeredBy} {schedule.administeredAt ? new Date(schedule.administeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {schedule.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAdminister(schedule.id)}
                      disabled={administeringId === schedule.id}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#10B981',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {administeringId === schedule.id ? '...' : 'Give'}
                    </button>
                    <button
                      onClick={() => handleMissed(schedule.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0',
                        background: '#fff',
                        color: '#DC2626',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Missed
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
