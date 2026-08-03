import { type Observation, type ClinicalContext, ConfidenceLevel } from './types'

export interface LabOrder {
  id: string
  testName: string
  testCode: string
  patientId: string
  encounterId?: string
  priority: 'routine' | 'urgent' | 'stat'
  status: 'ordered' | 'collected' | 'in_progress' | 'completed' | 'verified' | 'critical' | 'cancelled'
  orderedAt: number
  collectedAt?: number
  completedAt?: number
  result?: unknown
  referenceRange?: string
  units?: string
  abnormal?: boolean
  criticalValue?: boolean
  previousResults?: LabResult[]
}

export interface LabResult {
  id: string
  orderId: string
  testName: string
  value: number
  units: string
  referenceRange: string
  abnormal: boolean
  critical: boolean
  verified: boolean
  verifiedBy?: string
  verifiedAt?: number
  timestamp: number
}

export interface LabPanel {
  id: string
  name: string
  tests: string[]
  bundleDiscount?: boolean
}

const labOrders = new Map<string, LabOrder>()
const labResults = new Map<string, LabResult[]>()
const labPanels = new Map<string, LabPanel>()

export function orderLab(order: LabOrder): LabOrder {
  labOrders.set(order.id, order)
  return order
}

export function getLabOrder(orderId: string): LabOrder | undefined {
  return labOrders.get(orderId)
}

export function getLabOrdersForPatient(patientId: string): LabOrder[] {
  const results: LabOrder[] = []
  for (const [, order] of labOrders) {
    if (order.patientId === patientId) {
      results.push(order)
    }
  }
  return results
}

export function submitLabResult(result: LabResult): LabResult {
  const order = labOrders.get(result.orderId)
  if (order) {
    order.status = 'completed'
    order.result = result.value
    order.completedAt = result.timestamp
    order.abnormal = result.abnormal
    order.criticalValue = result.critical
  }

  if (!labResults.has(result.orderId)) {
    labResults.set(result.orderId, [])
  }
  labResults.get(result.orderId)!.push(result)

  return result
}

export function getLabResults(orderId: string): LabResult[] {
  return labResults.get(orderId) || []
}

export function checkDuplicateOrder(
  patientId: string,
  testName: string,
  hours: number = 24,
): boolean {
  const cutoff = Date.now() - hours * 60 * 60 * 1000
  for (const [, order] of labOrders) {
    if (
      order.patientId === patientId &&
      order.testName === testName &&
      order.orderedAt >= cutoff &&
      order.status !== 'cancelled'
    ) {
      return true
    }
  }
  return false
}

export function checkCriticalResults(patientId: string): LabResult[] {
  const results: LabResult[] = []
  for (const [, order] of labOrders) {
    if (order.patientId === patientId && order.criticalValue && order.status === 'completed') {
      const orderResults = labResults.get(order.id) || []
      results.push(...orderResults)
    }
  }
  return results
}

export function getPendingLabs(patientId: string): LabOrder[] {
  const results: LabOrder[] = []
  for (const [, order] of labOrders) {
    if (
      order.patientId === patientId &&
      (order.status === 'ordered' || order.status === 'collected' || order.status === 'in_progress')
    ) {
      results.push(order)
    }
  }
  return results
}

export function registerLabPanel(panel: LabPanel): void {
  labPanels.set(panel.id, panel)
}

export function getLabPanel(panelId: string): LabPanel | undefined {
  return labPanels.get(panelId)
}

export function getAllLabPanels(): LabPanel[] {
  return Array.from(labPanels.values())
}

export function suggestLabOrder(
  patientId: string,
  clinicalContext: ClinicalContext,
): LabOrder[] {
  const suggestions: LabOrder[] = []
  const existing = getLabOrdersForPatient(patientId)

  const suggestedTests = [
    { testName: 'Complete Blood Count', testCode: 'CBC', priority: 'routine' as const },
    { testName: 'Basic Metabolic Panel', testCode: 'BMP', priority: 'routine' as const },
    { testName: 'Liver Function Tests', testCode: 'LFT', priority: 'routine' as const },
  ]

  for (const test of suggestedTests) {
    const duplicate = checkDuplicateOrder(patientId, test.testName)
    if (!duplicate) {
      suggestions.push({
        id: `lab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testName: test.testName,
        testCode: test.testCode,
        patientId,
        priority: test.priority,
        status: 'ordered',
        orderedAt: Date.now(),
      })
    }
  }

  return suggestions
}

export function clearLabData(patientId?: string): void {
  if (patientId) {
    for (const [id, order] of labOrders) {
      if (order.patientId === patientId) {
        labOrders.delete(id)
        labResults.delete(id)
      }
    }
  } else {
    labOrders.clear()
    labResults.clear()
  }
}

export default {
  orderLab,
  getLabOrder,
  getLabOrdersForPatient,
  submitLabResult,
  getLabResults,
  checkDuplicateOrder,
  checkCriticalResults,
  getPendingLabs,
  registerLabPanel,
  getLabPanel,
  getAllLabPanels,
  suggestLabOrder,
  clearLabData,
}