'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Plug, ShieldCheck, Activity, Database, Server, Zap, ArrowRight, CheckCircle, AlertTriangle, Server as ServerIcon, Database as DatabaseIcon, Image as ImageIcon, FlaskConical as FlaskConicalIcon, Scan as ScanIcon, Building2 as Building2Icon, FileText as FileTextIcon, Code2 as Code2Icon } from 'lucide-react'


const iconMap: Record<string, React.ElementType> = {
  Server: ServerIcon,
  Database: DatabaseIcon,
  Image: ImageIcon,
  FlaskConical: FlaskConicalIcon,
  Scan: ScanIcon,
  Building2: Building2Icon,
  FileText: FileTextIcon,
  Code2: Code2Icon,
}

function getIcon(name: string, props: any) {
  const Icon = iconMap[name] || ServerIcon
  return <Icon {...props} />
}

// Integration engines configuration
const integrationEngines = [
  { id: 'fhir', name: 'FHIR R4', icon: 'Server', color: 'green', endpoint: '/api/fhir/R4', status: 'active' },
  { id: 'hl7', name: 'HL7 ADT', icon: 'Database', color: 'sky', endpoint: '/api/hl7/adt', status: 'active' },
  { id: 'dicom', name: 'DICOM PACS', icon: 'Image', color: 'purple', endpoint: '/api/dicom', status: 'active' },
  { id: 'lis', name: 'LIS Laboratory', icon: 'FlaskConical', color: 'blue', endpoint: '/api/lis', status: 'active' },
  { id: 'ris', name: 'RIS Imaging', icon: 'Scan', color: 'amber', endpoint: '/api/ris', status: 'active' },
  { id: 'erp', name: 'Enterprise Resource Planning', icon: 'Building2', color: 'gray', endpoint: '/api.erp', status: 'testing' },
  { id: 'sds', name: 'Document Storage', icon: 'FileText', color: 'slate', endpoint: '/api/sds', status: 'testing' },
  { id: 'api', name: 'REST API', icon: 'Code2', color: 'indigo', endpoint: '/api/rest', status: 'testing' },
]

export default function IntegrationPage() {
  const [selectedEngine, setSelectedEngine] = useState<string>('fhir')
  const [healthStatus, setHealthStatus] = useState<any>({})

  const selectedEngineData = integrationEngines.find(engine => engine.id === selectedEngine)

  const testIntegrations = async () => {
    setHealthStatus({})

    for (const engine of integrationEngines) {
      try {
        const startTime = Date.now()
        const response = await fetch(engine.endpoint, { method: 'GET' })
        const endTime = Date.now()
        const latency = endTime - startTime

        setHealthStatus(prev => ({
          ...prev,
          [engine.id]: {
            healthy: response.ok,
            latency,
            status: response.ok ? 'active' : 'error',
            error: response.ok ? null : 'HTTP ' + response.status,
          }
        }))
      } catch (error) {
        setHealthStatus(prev => ({
          ...prev,
          [engine.id]: {
            healthy: false,
            latency: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Network error',
          }
        }))
      }
    }
  }

  const handleEngineSelect = (engineId: string) => {
    setSelectedEngine(engineId)
    testIntegrations()
  }

  return (
    <section className="min-h-screen py-8">
      <div className="max-w-container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/cos-comprehensive" className="text-sky-600 hover:text-sky-700">← Back to Platform</a>
            <span className="text-gray-300">/</span>

            <span className="text-gray-600">Integration & Interoperability</span>
          </nav>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plug size={24} className="text-sky-600" />
            <h1 className="text-4xl font-bold text-gray-900">Integration & Interoperability</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect AMEXAN with your existing healthcare systems and external platforms.
            Never replace what works — just connect it.
          </p>
        </div>

        {/* Integration Engines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {integrationEngines.map(engine => (
            <button
              key={engine.id}
              onClick={() => handleEngineSelect(engine.id)}
              className={`p-6 rounded-lg border transition-all cursor-pointer
                ${engine.status === 'active' ? 'bg-white border-gray-200 hover:shadow-md hover:border-sky-300' :
                engine.status === 'testing' ? 'bg-gray-50 border-gray-200 border-dashed' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${engine.status === 'active' ? 'bg-green-50' : 'bg-gray-100'}`}>
                  {getIcon(engine.icon, { size: 20, className: `${engine.status === 'active' ? 'text-green-600' : 'text-gray-400'}` })}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{engine.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{engine.id} integration</p>
                  <span className={`text-xs font-medium ${engine.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'} px-2 py-0.5 rounded`}>
                    {engine.status}
                  </span>
                </div>
              </div>
              {engine.endpoint !== '/api.erp' && (
                <ArrowRight
                  size={16}
                  className="text-gray-400 mt-1"
                />
              )}
            </button>
          ))}
        </div>

        {/* Selected Engine Details */}
        {selectedEngineData && (
          <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                {getIcon(selectedEngineData.icon, { size: 24, className: "text-green-600" })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedEngineData.name}</h2>
                <p className="text-gray-600 mt-1">Type: {selectedEngineData.id} • Endpoint: {selectedEngineData.endpoint}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Bidirectional data sync with retry logic</li>
                  <li>• Graceful degradation when endpoint unavailable</li>
                  <li>• Real-time health monitoring</li>
                  <li>• Authentication support (OAuth, API Key, Cert)</li>
                  <li>• Rate limiting and throttling</li>
                  <li>• Error tracking and alerting</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Mappings</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {selectedEngine === 'fhir' && (
                    <>
                      <li>Patient: Patient resource mapping</li>
                      <li>Encounter: Encounter resource</li>
                      <li>Observation: Observation resource</li>
                      <li>Procedure: Procedure resource</li>
                    </>
                  )}
                  {selectedEngine === 'hl7' && (
                    <>
                      <li>ADT: Admission/Discharge/Transfer</li>
                      <li>MDM: Master Patient Index</li>
                    </>
                  )}
                  {selectedEngine === 'dicom' && (
                    <>
                      <li>Study: Study object</li>
                      <li>Series: Series object</li>
                      <li>Image: Image object</li>
                    </>
                  )}
                  {selectedEngine === 'lis' && (
                    <>
                      <li>Order: Laboratory order</li>
                      <li>Result: Laboratory result</li>
                    </>
                  )}
                  {selectedEngine === 'ris' && (
                    <>
                      <li>Order: Radiology order</li>
                      <li>Result: Radiology result</li>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Status</h3>
              <div className="space-y-2 text-sm">
                {healthStatus && Object.keys(healthStatus).map(engineId => (
                  <div key={engineId} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">{engineId}:</span>
                    <span className={`font-medium ${healthStatus[engineId]?.healthy ? 'text-green-600' : 'text-red-600'}`}>
                      {healthStatus[engineId]?.healthy ? 'Healthy' : 'Unhealthy'}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {healthStatus[engineId]?.latency ? `${healthStatus[engineId].latency}ms` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    className="w-full px-4 py-2 bg-sky-50 border border-sky-200 rounded text-sky-700 hover:bg-sky-100 transition-colors"
                    onClick={() => alert('Integration configuration would go here')}
                  >
                    Configure Integration
                  </button>
                  <button
                    className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded text-green-700 hover:bg-green-100 transition-colors"
                    onClick={() => alert('Health check would go here')}
                  >
                    Run Health Check
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integration Benefits */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-sky-50">
                  <ShieldCheck size={20} className="text-sky-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Never Replace</h3>
                  <p className="text-sm text-gray-600 mt-1">Connect to existing systems without replacement</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-green-50">
                  <Activity size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Always Available</h3>
                  <p className="text-sm text-gray-600 mt-1">Zero downtime, graceful degradation</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Database size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Data Sync</h3>
                  <p className="text-sm text-gray-600 mt-1">Bidirectional real-time synchronization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}