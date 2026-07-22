import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, onSnapshot, Timestamp, Unsubscribe, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { encounterRef } from '@/lib/firebase/collections'

export type VitalSignId =
  | 'temperature'
  | 'heartRate'
  | 'respiratoryRate'
  | 'bpSystolic'
  | 'bpDiastolic'
  | 'oxygenSaturation'
  | 'weight'
  | 'height'
  | 'painScore'
  | 'bloodGlucose'
  | 'gcs'
  | 'avpu'

export interface VitalReading {
  id: string
  encounterId: string
  patientId: string
  recordedBy: string
  recordedByName: string
  recordedByRole: 'nurse' | 'doctor' | 'system'
  recordedAt: number
  temperature?: number
  heartRate?: number
  respiratoryRate?: number
  bpSystolic?: number
  bpDiastolic?: number
  oxygenSaturation?: number
  weight?: number
  height?: number
  painScore?: number
  bloodGlucose?: number
  gcs?: number
  avpu?: 'alert' | 'voice' | 'pain' | 'unresponsive'
  news2?: number
  pews?: number
  notes?: string
  source: 'manual_entry' | 'device' | 'imported'
}

export interface VitalTrend {
  parameter: VitalSignId
  label: string
  unit: string
  readings: { time: number; value: number; recordedBy: string }[]
  currentValue: number | null
  refLow: number
  refHigh: number
  criticalLow: number
  criticalHigh: number
  direction: 'stable' | 'improving' | 'worsening'
}

function vitalsCol(orgId: string, deptId: string, unitId: string, encounterId: string) {
  return collection(db, 'organizations', orgId, 'departments', deptId, 'units', unitId, 'encounters', encounterId, 'vitals')
}

export async function recordVitals(
  deptId: string,
  unitId: string,
  encounterId: string,
  patientId: string,
  data: {
    recordedBy: string
    recordedByName: string
    recordedByRole: 'nurse' | 'doctor' | 'system'
    temperature?: number
    heartRate?: number
    respiratoryRate?: number
    bpSystolic?: number
    bpDiastolic?: number
    oxygenSaturation?: number
    weight?: number
    height?: number
    painScore?: number
    bloodGlucose?: number
    gcs?: number
    avpu?: 'alert' | 'voice' | 'pain' | 'unresponsive'
    notes?: string
    source?: 'manual_entry' | 'device' | 'imported'
  },
  orgId: string = 'telemed-a98cf',
): Promise<string> {
  const col = vitalsCol(orgId, deptId, unitId, encounterId)
  const ref = doc(col)
  const news2 = computeNEWS2(data)
  const vitalData: VitalReading = {
    id: ref.id,
    encounterId,
    patientId,
    recordedBy: data.recordedBy,
    recordedByName: data.recordedByName,
    recordedByRole: data.recordedByRole,
    recordedAt: Date.now(),
    temperature: data.temperature,
    heartRate: data.heartRate,
    respiratoryRate: data.respiratoryRate,
    bpSystolic: data.bpSystolic,
    bpDiastolic: data.bpDiastolic,
    oxygenSaturation: data.oxygenSaturation,
    weight: data.weight,
    height: data.height,
    painScore: data.painScore,
    bloodGlucose: data.bloodGlucose,
    gcs: data.gcs,
    avpu: data.avpu,
    news2,
    source: data.source || 'manual_entry',
    notes: data.notes,
  }
  await setDoc(ref, vitalData, { merge: true })
  await setDoc(doc(encounterRef(orgId, deptId, unitId, encounterId), 'lastVitals'), {
    lastVitalsAt: Date.now(),
    lastVitalsBy: data.recordedByName,
    news2,
  }, { merge: true })
  return ref.id
}

export function listenVitals(
  deptId: string,
  unitId: string,
  encounterId: string,
  maxReadings: number,
  onData: (vitals: VitalReading[]) => void,
  onError?: (err: Error) => void,
  orgId: string = 'telemed-a98cf',
): Unsubscribe {
  const q = query(
    vitalsCol(orgId, deptId, unitId, encounterId),
    orderBy('recordedAt', 'desc'),
    limit(maxReadings),
  )
  return onSnapshot(q,
    (snap) => onData(snap.docs.map(d => d.data() as VitalReading).reverse()),
    (err) => onError?.(err),
  )
}

export function computeVitalTrends(vitals: VitalReading[]): VitalTrend[] {
  if (vitals.length === 0) return []

  const parameters: { id: VitalSignId; label: string; unit: string; refLow: number; refHigh: number; criticalLow: number; criticalHigh: number }[] = [
    { id: 'temperature', label: 'Temperature', unit: '°C', refLow: 36.5, refHigh: 37.5, criticalLow: 35, criticalHigh: 39.5 },
    { id: 'heartRate', label: 'Heart Rate', unit: 'bpm', refLow: 60, refHigh: 100, criticalLow: 40, criticalHigh: 140 },
    { id: 'respiratoryRate', label: 'Respiratory Rate', unit: '/min', refLow: 12, refHigh: 20, criticalLow: 8, criticalHigh: 30 },
    { id: 'bpSystolic', label: 'Systolic BP', unit: 'mmHg', refLow: 90, refHigh: 140, criticalLow: 80, criticalHigh: 180 },
    { id: 'oxygenSaturation', label: 'SpO₂', unit: '%', refLow: 95, refHigh: 100, criticalLow: 90, criticalHigh: 100 },
    { id: 'bloodGlucose', label: 'Blood Glucose', unit: 'mmol/L', refLow: 3.9, refHigh: 6.1, criticalLow: 2.2, criticalHigh: 16.7 },
    { id: 'painScore', label: 'Pain Score', unit: '/10', refLow: 0, refHigh: 3, criticalLow: 0, criticalHigh: 8 },
  ]

  return parameters.map(param => {
    const readings = vitals
      .map(v => ({ time: v.recordedAt, value: v[param.id] as number | undefined, recordedBy: v.recordedByName }))
      .filter(r => r.value !== undefined) as { time: number; value: number; recordedBy: string }[]

    const values = readings.map(r => r.value)
    const currentValue = values.length > 0 ? values[values.length - 1] : null

    let direction: 'stable' | 'improving' | 'worsening' = 'stable'
    if (values.length >= 3) {
      const recent3 = values.slice(-3)
      const trend = recent3[recent3.length - 1] - recent3[0]
      const outOfRange = recent3.some(v => v < param.refLow || v > param.refHigh)
      if (Math.abs(trend) > 0.1 * (param.refHigh - param.refLow) && outOfRange) {
        direction = trend > 0 ? 'worsening' : 'worsening'
      }
    }

    return {
      parameter: param.id,
      label: param.label,
      unit: param.unit,
      readings,
      currentValue,
      refLow: param.refLow,
      refHigh: param.refHigh,
      criticalLow: param.criticalLow,
      criticalHigh: param.criticalHigh,
      direction,
    }
  })
}

export function computeNEWS2(vitals: {
  respiratoryRate?: number
  oxygenSaturation?: number
  temperature?: number
  heartRate?: number
  bpSystolic?: number
  avpu?: string
}): number {
  let score = 0
  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate <= 8) score += 3
    else if (vitals.respiratoryRate <= 11) score += 1
    else if (vitals.respiratoryRate >= 25) score += 3
    else if (vitals.respiratoryRate >= 21) score += 2
  }
  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation <= 91) score += 3
    else if (vitals.oxygenSaturation <= 93) score += 2
    else if (vitals.oxygenSaturation <= 95) score += 1
  }
  if (vitals.temperature !== undefined) {
    if (vitals.temperature <= 35) score += 3
    else if (vitals.temperature <= 36) score += 1
    else if (vitals.temperature >= 39.1) score += 2
    else if (vitals.temperature >= 38.1) score += 1
  }
  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate <= 40) score += 3
    else if (vitals.heartRate <= 50) score += 1
    else if (vitals.heartRate >= 131) score += 3
    else if (vitals.heartRate >= 111) score += 2
    else if (vitals.heartRate >= 91) score += 1
  }
  if (vitals.bpSystolic !== undefined) {
    if (vitals.bpSystolic <= 90) score += 3
    else if (vitals.bpSystolic <= 100) score += 2
    else if (vitals.bpSystolic >= 220) score += 3
  }
  if (vitals.avpu) {
    if (vitals.avpu === 'voice' || vitals.avpu === 'pain' || vitals.avpu === 'unresponsive') score += 3
  }
  return score
}

export function getNEWS2Risk(news2: number): { level: 'low' | 'medium' | 'high'; color: string; action: string } {
  if (news2 >= 7) return { level: 'high', color: '#DC2626', action: 'Urgent medical review. Sepsis/clinical deterioration pathway.' }
  if (news2 >= 5) return { level: 'medium', color: '#F59E0B', action: 'Prompt medical review within 1 hour.' }
  if (news2 >= 3) return { level: 'medium', color: '#F59E0B', action: 'Inform doctor. Increase monitoring frequency.' }
  return { level: 'low', color: '#10B981', action: 'Routine monitoring continues.' }
}
