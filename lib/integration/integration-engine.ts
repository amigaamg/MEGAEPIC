import { create } from 'zustand'
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '../authentication/auth-engine'

export type IntegrationDirection = 'amexin-to-external' | 'external-to-amexin' | 'bidirectional'

export interface IntegrationConnection {
  id: string
  type: string
  name: string
  endpoint: string
  auth: any
  healthDataTypes: string[]
  mapping: any
  healthDataMapping?: any
  status: 'active' | 'testing' | 'deprecated' | 'error'
  lastHealthyAt?: Date
  totalRequests?: number
  errorCount?: number
  createdAt?: Date
}

export interface IntegrationMapping {
  patient: string
  encounter: string
  observation: string
  procedure: string
  medication: string
}

export interface HealthDataMapping {
  patient: string
  encounter: string
  observation: string
  procedure: string
  medication: string
}

export const useIntegrationStore = create<any>((set, get) => ({
  connections: Array<any>,
  isLoading: false,
  error: null,
  isHealthy: true,
  lastHealthCheck: null,

  createIntegration: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const connectionId = `conn_${Date.now()}`
      const connection: IntegrationConnection = {
        id: connectionId,
        type: data.type,
        name: data.name,
        endpoint: data.endpoint,
        auth: data.auth || { type: 'none' },
        healthDataTypes: data.healthDataTypes || [],
        mapping: data.mapping || { patient: 'patient', encounter: 'encounter' },
        healthDataMapping: data.healthDataMapping || { patient: 'Patient', encounter: 'Encounter' },
        status: 'testing',
        lastHealthyAt: new Date(),
        totalRequests: 0,
        errorCount: 0,
        createdAt: new Date(),
      }
      
      await setDoc(doc(db, 'integrations', connectionId), connection)
      
      set({
        connections: [...get().connections, connection],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  testConnection: async (endpoint: string) => {
    try {
      const testStart = Date.now()
      const healthData = await get().testIntegrationEndpoint(endpoint)
      
      set({
        connections: get().connections.map(c => c.endpoint === endpoint ? { ...c, lastHealthyAt: new Date(), totalRequests: (c.totalRequests || 0) + 1, errorCount: (c.errorCount || 0) } : c),
        isHealthy: healthData.healthy,
        lastHealthCheck: new Date(),
      })
    } catch (error) {
      set({
        connections: get().connections.map(c => c.endpoint === endpoint ? { ...c, lastHealthyAt: new Date(), totalRequests: (c.totalRequests || 0) + 1, errorCount: (c.errorCount || 0) + 1, status: 'error' } : c),
        isHealthy: false,
        lastHealthCheck: new Date(),
      })
    }
  },

  // Helper function to test external endpoints
  testIntegrationEndpoint: async (endpoint: string): Promise<{ healthy: boolean; data?: any }> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(endpoint, { method: 'GET', signal: controller.signal })
      clearTimeout(timeoutId)
      if (response.ok) {
        const data = await response.json()
        return { healthy: true, data }
      } else {
        return { healthy: false }
      }
    } catch (error) {
      return { healthy: false }
    }
  },

  getHealthyConnections: () => {
    return get().connections.filter(c => c.status === 'active' && c.lastHealthyAt && (new Date().getTime() - c.lastHealthyAt.getTime()) < 5 * 60 * 1000)
  },

  getIntegrationByType: (type: string) => {
    return get().connections.filter(c => c.type === type)
  },
}) as const)


// Initialize connection listeners
export const setupIntegrationListeners = () => {
  onSnapshot(query(collection(db, 'integrations')), (snapshot) => {
    const connections = snapshot.docs.map(d => d.data()) as IntegrationConnection[]
    useIntegrationStore.setState({ connections })
  })
  
  onSnapshot(query(collection(db, 'integration_health')), (snapshot) => {
    const healthStatus: Record<string, boolean> = {}
    snapshot.docs.forEach(d => { healthStatus[d.id] = d.data().healthy === true })
    useIntegrationStore.setState({
      connections: useIntegrationStore.getState().connections.map(c => ({
        ...c,
        status: healthStatus[c.id] === true ? 'active' : 'testing',
        lastHealthyAt: healthStatus[c.id] === true ? new Date() : c.lastHealthyAt,
      }))
    })
  })
}

// Helper function to simulate integration testing (for demo)
export const testAllIntegrations = async () => {
  const integrations = [
    { type: 'fhir', name: 'FHIR R4 API', endpoint: '/api/fhir/R4', healthDataTypes: ['Patient', 'Encounter', 'Observation'] },
    { type: 'hl7', name: 'HL7 ADT API', endpoint: '/api/hl7/adt', healthDataTypes: ['Patient', 'Encounter'] },
    { type: 'dicom', name: 'DICOM Server', endpoint: '/api/dicom', healthDataTypes: ['Study', 'Series', 'Image'] },
    { type: 'lis', name: 'LIS API', endpoint: '/api/lis', healthDataTypes: ['Order', 'Result'] },
    { type: 'ris', name: 'RIS API', endpoint: '/api/ris', healthDataTypes: ['Order', 'Result'] },
    { type: 'erp', name: 'Enterprise Resource Planning', endpoint: '/api.erp', healthDataTypes: ['Patient', 'Appointment'] },
    { type: 'sds', name: 'Document Storage', endpoint: '/api/sds', healthDataTypes: ['Document'] },
  ]
  
  for (const integration of integrations) {
    await testIntegrationEndpoint(integration.endpoint)
  }
  
  return integrations.map(i => ({ ...i, status: 'active', lastHealthyAt: new Date(), totalRequests: 5, errorCount: 0}))
}

export const testIntegrationEndpoint = async (endpoint: string): Promise<{ healthy: boolean; data?: any }> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(endpoint, { method: 'GET', signal: controller.signal })
    clearTimeout(timeoutId)
    if (response.ok) {
      const data = await response.json()
      return { healthy: true, data }
    } else {
      return { healthy: false }
    }
  } catch (error) {
    return { healthy: false }
  }
}
