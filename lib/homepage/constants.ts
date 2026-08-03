// AMEXAN Homepage Constants
// Constitutional: content is data. Components render this data.

import type { HeroContent, EcosystemNode } from './types'
import { ROUTES } from './routes'

export const HERO: HeroContent = {
  eyebrow: 'AMEXAN Clinical Operating System',
  headline: 'The Clinical Operating System for Healthcare',
  subheadline:
    'One intelligent platform connecting clinicians, patients, hospitals, researchers, educators and healthcare organizations through evidence-based clinical intelligence.',
  buttons: [
    { id: 'start', label: 'Start Free', description: 'Create a free account', route: ROUTES.register, variant: 'primary', icon: 'Rocket' },
    { id: 'demo', label: 'Book Demo', description: 'See AMEXAN in action', route: ROUTES.bookDemo, variant: 'secondary', icon: 'CalendarDays' },
    { id: 'explore', label: 'Explore Platform', description: 'Tour the operating system', route: ROUTES.platform, variant: 'ghost', icon: 'Play' },
  ],
  status: {
    label: 'Platform Status',
    value: 'Online',
    ok: true,
  },
  version: 'v1.0 Constitution',
  countries: 'Universal',
  modules: [
    { id: 'clinical-intelligence', label: 'Clinical Intelligence', status: 'active' },
    { id: 'hmis', label: 'HMIS', status: 'active' },
    { id: 'emr', label: 'EMR', status: 'active' },
    { id: 'telemedicine', label: 'Telemedicine', status: 'active' },
    { id: 'education', label: 'Education', status: 'active' },
    { id: 'marketplace', label: 'Marketplace', status: 'active' },
    { id: 'research', label: 'Research', status: 'active' },
    { id: 'analytics', label: 'Analytics', status: 'active' },
    { id: 'knowledge-graph', label: 'Knowledge Graph', status: 'active' },
    { id: 'fhir', label: 'FHIR', status: 'active' },
    { id: 'security', label: 'Security', status: 'active' },
    { id: 'ai', label: 'AI Assistants', status: 'active' },
    { id: 'monitoring', label: 'Monitoring', status: 'active' },
  ],
  flow: [
    'Patient',
    'Registration',
    'Encounter',
    'Clinical Intelligence',
    'Investigations',
    'Treatment',
    'Monitoring',
    'Recovery',
    'Research',
    'Education',
    'Analytics',
  ],
}

export const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'patient', label: 'Patient' },
  { id: 'community', label: 'Community' },
  { id: 'clinic', label: 'Clinic' },
  { id: 'hospital', label: 'Hospital' },
  { id: 'referral', label: 'Referral' },
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'radiology', label: 'Radiology' },
  { id: 'pharmacy', label: 'Pharmacy' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'research', label: 'Research' },
  { id: 'education', label: 'Education' },
  { id: 'public-health', label: 'Public Health' },
  { id: 'government', label: 'Government' },
]

export const TRUST_ITEMS = [
  'FHIR',
  'SNOMED CT',
  'LOINC',
  'DICOM',
  'ICD-11',
  'HL7',
  'Offline-first',
  'Knowledge Graph',
  'Role-based Security',
  'End-to-End Encryption',
]

export const CAPABILITIES = [
  { icon: 'Database', label: 'Lifelong Patient Records' },
  { icon: 'Grid', label: '20+ Healthcare Workspaces' },
  { icon: 'BookMarked', label: 'International Standards' },
  { icon: 'Building', label: 'Multi-Hospital Ready' },
  { icon: 'WifiOff', label: 'Offline First' },
  { icon: 'Code', label: 'API Driven' },
  { icon: 'Brain', label: 'Knowledge Graph Powered' },
  { icon: 'Cpu', label: 'AI Assisted' },
]

export const HOMEPAGE_VERSION = 'v1.0'
export const HOMEPAGE_CONSTITUTION_VERSION = 'Book II – Homepage Constitution v1.0'
