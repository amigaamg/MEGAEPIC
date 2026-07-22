'use client'

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type {
  ADOSContext, ADOSLifecycleState, ADOSAssignmentType,
  ADOSPatient, ADOSTask, ADOSAlert, ADOSNotification,
  ADOSHandover, ADOSAnswers, ADOSQueueItem, ADOSShiftType,
  ADOSLocation, ADOSVitals, ADOSPatientTask,
} from '@/lib/ados/types'
import {
  buildADOSContext, createLifecycle, transitionLifecycle,
  answerADOSQuestions, getShiftProgress, getShiftRemaining,
  createTask, generateEndOfShiftSummary, createADOSHandover,
  acknowledgeADOSHandover, generateSuggestions, prioritizeQueue,
} from '@/lib/ados/engine'

interface ADOSContextValue {
  lifecycle: ADOSLifecycleState
  context: ADOSContext | null
  answers: ADOSAnswers | null
  shiftProgress: number
  shiftRemaining: string
  setContext: (params: {
    doctorId: string; doctorName: string; doctorTitle?: string; specialty?: string
    organizationId: string; organizationName: string
    departmentId: string; departmentName: string
    shift: ADOSShiftType; assignmentType: ADOSAssignmentType
    location: ADOSLocation; patients: ADOSPatient[]
    queue?: ADOSQueueItem[]; tasks?: ADOSTask[]
    alerts?: ADOSAlert[]; notifications?: ADOSNotification[]
    handover?: ADOSHandover
  }) => void
  selectPatient: (patientId: string) => void
  completeTask: (taskId: string) => void
  addTask: (params: { type: ADOSTask['type']; title: string; patientId?: string; patientName?: string; priority?: ADOSTask['priority'] }) => void
  acknowledgeAlert: (alertId: string) => void
  readNotification: (notifId: string) => void
  startHandover: (summary: string) => ADOSHandover | null
  acceptHandover: (clinicianId: string, clinicianName: string) => void
  endShift: () => void
  summary: ReturnType<typeof generateEndOfShiftSummary> | null
}

const ADOSCtx = createContext<ADOSContextValue | null>(null)

export function ADOSProvider({ children }: { children: ReactNode }) {
  const [lifecycle, setLifecycle] = useState<ADOSLifecycleState>(createLifecycle())
  const [context, setContextState] = useState<ADOSContext | null>(null)

  const setContext = useCallback((params: {
    doctorId: string; doctorName: string; doctorTitle?: string; specialty?: string
    organizationId: string; organizationName: string
    departmentId: string; departmentName: string
    shift: ADOSShiftType; assignmentType: ADOSAssignmentType
    location: ADOSLocation; patients: ADOSPatient[]
    queue?: ADOSQueueItem[]; tasks?: ADOSTask[]
    alerts?: ADOSAlert[]; notifications?: ADOSNotification[]
    handover?: ADOSHandover
  }) => {
    const ctx = buildADOSContext(params)
    setContextState(ctx)
    setLifecycle(prev => transitionLifecycle(prev, 'working', ctx))
  }, [])

  const selectPatient = useCallback((patientId: string) => {
    setLifecycle(prev => ({ ...prev, currentPatientId: patientId, lastActivity: Date.now() }))
  }, [])

  const completeTask = useCallback((taskId: string) => {
    setContextState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'completed' as const, completedAt: Date.now() } : t),
      }
    })
  }, [])

  const addTask = useCallback((params: { type: ADOSTask['type']; title: string; patientId?: string; patientName?: string; priority?: ADOSTask['priority'] }) => {
    const task = createTask(params)
    setContextState(prev => {
      if (!prev) return prev
      return { ...prev, tasks: [...prev.tasks, task] }
    })
  }, [])

  const acknowledgeAlert = useCallback((alertId: string) => {
    setContextState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        alerts: prev.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a),
      }
    })
  }, [])

  const readNotification = useCallback((notifId: string) => {
    setContextState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        notifications: prev.notifications.map(n => n.id === notifId ? { ...n, read: true } : n),
      }
    })
  }, [])

  const startHandover = useCallback((summary: string): ADOSHandover | null => {
    if (!context) return null
    const handover = createADOSHandover({
      fromClinicianId: context.doctorId,
      fromClinicianName: context.doctorName,
      patients: context.patients,
      tasks: context.tasks,
      summary,
    })
    setContextState(prev => prev ? { ...prev, handover } : prev)
    setLifecycle(prev => transitionLifecycle(prev, 'handover', context))
    return handover
  }, [context])

  const acceptHandover = useCallback((clinicianId: string, clinicianName: string) => {
    setContextState(prev => {
      if (!prev || !prev.handover) return prev
      return {
        ...prev,
        handover: acknowledgeADOSHandover(prev.handover, clinicianId, clinicianName),
      }
    })
  }, [])

  const endShift = useCallback(() => {
    setLifecycle(prev => transitionLifecycle(prev, 'completed', context || undefined))
    setContextState(null)
  }, [context])

  const answers = useMemo(() => context ? answerADOSQuestions(context) : null, [context])
  const shiftProgress = context ? getShiftProgress(context.shiftStart, context.shiftEnd) : 0
  const shiftRemaining = context ? getShiftRemaining(context.shiftStart, context.shiftEnd) : ''

  const summary = useMemo(() => {
    if (!context || lifecycle.phase !== 'handover') return null
    return generateEndOfShiftSummary(context)
  }, [context, lifecycle.phase])

  return (
    <ADOSCtx.Provider value={{
      lifecycle, context, answers,
      shiftProgress, shiftRemaining,
      setContext, selectPatient, completeTask, addTask,
      acknowledgeAlert, readNotification,
      startHandover, acceptHandover, endShift, summary,
    }}>
      {children}
    </ADOSCtx.Provider>
  )
}

export function useADOS() {
  const ctx = useContext(ADOSCtx)
  if (!ctx) throw new Error('useADOS must be used within ADOSProvider')
  return ctx
}
