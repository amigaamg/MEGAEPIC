import { type Observation, type ClinicalContext, ConfidenceLevel } from './types'

export interface ImagingOrder {
  id: string
  modality: string
  bodyPart: string
  patientId: string
  encounterId?: string
  priority: 'routine' | 'urgent' | 'stat'
  status: 'ordered' | 'scheduled' | 'in_progress' | 'completed' | 'verified' | 'cancelled'
  orderedAt: number
  scheduledAt?: number
  completedAt?: number
  resultAvailable?: boolean
  report?: string
  findings?: string
  impression?: string
  previousImaging?: ImagingRecord[]
  contrastRequired?: boolean
  contrastAllergy?: boolean
  pregnancyConfirmed?: boolean
  radiationDose?: number
}

export interface ImagingRecord {
  id: string
  orderId: string
  modality: string
  url: string
  thumbnail?: string
  dicomId?: string
  size: number
  capturedAt: number
  annotated?: boolean
}

export interface ModalityInfo {
  name: string
  category: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'fluoroscopy' | 'nuclear' | 'mammography'
  radiationDose?: number
  contrastRequired?: boolean
  prepRequired?: boolean
  averageDuration: number
}

const imagingOrders = new Map<string, ImagingOrder>()
const imagingRecords = new Map<string, ImagingRecord[]>()
const modalityRegistry = new Map<string, ModalityInfo>()

export function orderImaging(order: ImagingOrder): ImagingOrder {
  imagingOrders.set(order.id, order)
  return order
}

export function getImagingOrder(orderId: string): ImagingOrder | undefined {
  return imagingOrders.get(orderId)
}

export function getImagingOrdersForPatient(patientId: string): ImagingOrder[] {
  const results: ImagingOrder[] = []
  for (const [, order] of imagingOrders) {
    if (order.patientId === patientId) {
      results.push(order)
    }
  }
  return results
}

export function completeImaging(orderId: string, result: { report: string; findings: string; impression: string }): void {
  const order = imagingOrders.get(orderId)
  if (order) {
    order.status = 'completed'
    order.completedAt = Date.now()
    order.resultAvailable = true
    order.report = result.report
    order.findings = result.findings
    order.impression = result.impression
  }
}

export function addImagingRecord(record: ImagingRecord): void {
  if (!imagingRecords.has(record.orderId)) {
    imagingRecords.set(record.orderId, [])
  }
  imagingRecords.get(record.orderId)!.push(record)
}

export function getImagingRecords(orderId: string): ImagingRecord[] {
  return imagingRecords.get(orderId) || []
}

export function checkPreviousImaging(patientId: string, modality: string): ImagingOrder[] {
  const results: ImagingOrder[] = []
  for (const [, order] of imagingOrders) {
    if (
      order.patientId === patientId &&
      order.modality === modality &&
      order.status === 'completed'
    ) {
      results.push(order)
    }
  }
  return results.sort((a, b) => b.completedAt! - a.completedAt!)
}

export function checkContrastContraindications(order: ImagingOrder): string[] {
  const contraindications: string[] = []
  if (order.contrastRequired && order.contrastAllergy) {
    contraindications.push('Contrast allergy detected')
  }
  if (order.contrastRequired && order.pregnancyConfirmed) {
    contraindications.push('Contrast not recommended during pregnancy')
  }
  return contraindications
}

export function checkRadiationBurden(patientId: string, months: number = 12): number {
  const cutoff = Date.now() - months * 30 * 24 * 60 * 60 * 1000
  let totalDose = 0
  for (const [, order] of imagingOrders) {
    if (
      order.patientId === patientId &&
      order.completedAt &&
      order.completedAt >= cutoff &&
      order.radiationDose
    ) {
      totalDose += order.radiationDose
    }
  }
  return totalDose
}

export function registerModality(modality: ModalityInfo): void {
  modalityRegistry.set(modality.name.toLowerCase(), modality)
}

export function getModality(name: string): ModalityInfo | undefined {
  return modalityRegistry.get(name.toLowerCase())
}

export function getAllModalities(): ModalityInfo[] {
  return Array.from(modalityRegistry.values())
}

export function suggestImaging(
  patientId: string,
  clinicalContext: ClinicalContext,
): ImagingOrder[] {
  const suggestions: ImagingOrder[] = []
  const existing = getImagingOrdersForPatient(patientId)

  const suggestedStudies = [
    { modality: 'CT', bodyPart: 'Chest', priority: 'routine' as const },
    { modality: 'X-Ray', bodyPart: 'Chest PA', priority: 'routine' as const },
    { modality: 'Ultrasound', bodyPart: 'Abdomen', priority: 'routine' as const },
  ]

  for (const study of suggestedStudies) {
    const duplicate = existing.some(
      e => e.modality === study.modality && e.bodyPart === study.bodyPart && e.status !== 'cancelled',
    )
    if (!duplicate) {
      suggestions.push({
        id: `imaging_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        modality: study.modality,
        bodyPart: study.bodyPart,
        patientId,
        priority: study.priority,
        status: 'ordered',
        orderedAt: Date.now(),
      })
    }
  }

  return suggestions
}

export function clearImagingData(patientId?: string): void {
  if (patientId) {
    for (const [id, order] of imagingOrders) {
      if (order.patientId === patientId) {
        imagingOrders.delete(id)
        imagingRecords.delete(id)
      }
    }
  } else {
    imagingOrders.clear()
    imagingRecords.clear()
  }
}

export default {
  orderImaging,
  getImagingOrder,
  getImagingOrdersForPatient,
  completeImaging,
  addImagingRecord,
  getImagingRecords,
  checkPreviousImaging,
  checkContrastContraindications,
  checkRadiationBurden,
  registerModality,
  getModality,
  getAllModalities,
  suggestImaging,
  clearImagingData,
}