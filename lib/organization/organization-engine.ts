// AMEXAN Universal Organization Engine
// Phase 4.2.2 - Foundation Implementation
// Constitutional: Organizations are constitutional objects, not optional features

import { create } from 'zustand'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateAmxOrg } from '@/lib/utils'

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  timezone?: string
}

export interface GeographicInfo {
  latitude: number
  longitude: number
  region: string
}

export interface ContactInfo {
  phone: string
  email: string
  website?: string
  emergency?: string
}

export type OrganizationType = 
  | 'hospital'
  | 'clinic'
  | 'health-center'
  | 'private-practice'
  | 'medical-school'
  | 'research-institute'
  | 'university'
  | 'ngo'
  | 'government'
  | 'corporate'
  | 'insurance'
  | 'laboratory-network'
  | 'radiology-network'
  | 'pharmacy-chain'
  | 'telemedicine-provider'
  | 'community-program'
  | 'other'

export interface Organization {
  // Constitutional: Organizations are permanent, constitutional objects
  id: string                      // AMXOID - permanent, unique, never reused
  amxorg: string                  // AMXORG - global organizational identifier
  type: OrganizationType
  profile: OrganizationProfile
  hierarchy: OrganizationHierarchy
  facilities: Facility[]
  departments: Department[]
  units: Unit[]
  services: Service[]
  teams: Team[]
  staffing: StaffingModel
  policies: OrganizationPolicy[]
  resources: ResourceCatalog
  integration: IntegrationProfile
  branding: OrganizationBranding
  analytics: OrganizationAnalytics
  status: 'active' | 'verified' | 'suspended' | 'archived' | 'pending'
  createdAt: Date
  verifiedAt?: Date
  migratedFrom?: string
}

export interface OrganizationProfile {
  // Constitutional: Organizations define their own operational model
  name: {
    formal: string
    short: string
    display: string
    alternate?: string[]
  }
  identification: {
    taxId?: string
    license?: string
    registryNumber?: string
    accreditation?: string
    certification?: string
  }
  location: {
    address: Address
    geographic: GeographicInfo
    contact: ContactInfo
    timezone: string
    languages: string[]
  }
  classification: {
    tier: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
    ownership: 'public' | 'private' | 'non-profit' | 'government'
    funding: 'government' | 'private' | 'insurance' | 'mixed'
    capacity?: number
    beds?: number
    employees?: number
  }
  governance: {
    legalEntity: string
    board?: string[]
    management?: string[]
    complianceOfficer?: string
    privacyOfficer?: string
  }
}

export interface OrganizationHierarchy {
  // Constitutional: Hierarchical structure is mandatory for coordination
  levels: HierarchyLevel[]
  reportingLines: ReportLine[]
  decisionAuthority: DecisionAuthority
  emergencyChain: EmergencyChain
}

export interface HierarchyLevel {
  level: number
  name: string
  description: string
  authority: 'low' | 'medium' | 'high' | 'critical'
  reportingTo?: string
  responsibilities: string[]
}

export interface ReportLine {
  from: string
  to: string
  type: 'direct' | 'indirect' | 'advisory'
  weight: number
}

export interface DecisionAuthority {
  clinical: 'doctor' | 'nurse' | 'administrator' | 'committee'
  financial: 'department' | 'ward' | 'facility' | 'corporate'
  operational: 'department' | 'unit' | 'team' | 'individual'
  emergency: 'rapid-response' | 'triage' | 'protocol' | 'field'
}

export interface EmergencyChain {
  levels: EmergencyLevel[]
  activation: 'automatic' | 'manual' | 'threshold'
  communication: CommunicationProtocol
}

export interface EmergencyLevel {
  level: number
  trigger: string
  responders: string[]
  authority: string
  resources: string[]
}

export interface CommunicationProtocol {
  primary: string[]
  secondary: string[]
  escalation: string[]
  notification: 'sms' | 'call' | 'push' | 'email'
}

export interface Facility {
  // Constitutional: Facilities are physical locations with defined capabilities
  id: string
  amxfid: string
  name: string
  type: 'hospital' | 'clinic' | 'center' | 'site' | 'outreach'
  location: Address
  capacity: FacilityCapacity
  departments: string[]
  wards: string[]
  units: string[]
  equipment: string[]
  staffing: FacilityStaffing
  services: string[]
  emergency: boolean
  trauma: boolean
  isolation: boolean
  status: 'operational' | 'maintenance' | 'closed' | 'emergency'
}

export interface FacilityCapacity {
  beds: number
  intensiveCare: number
  operatingTheatres: number
  laboratories: number
  imaging: number
  pharmacy: number
  ambulance: number
}

export interface FacilityStaffing {
  doctors: number
  nurses: number
  technicians: number
  administrators: number
  support: number
}

export interface Department {
  // Constitutional: Departments are clinical and administrative units
  id: string
  amxfid: string
  name: string
  type: 'clinical' | 'administrative' | 'support'
  parentDepartment?: string
  level: number
  specialization: string[]
  staffing: DepartmentStaffing
  rooms: string[]
  equipment: string[]
  protocols: string[]
  responsibilities: string[]
  services: string[]
  budget?: DepartmentBudget
}

export interface DepartmentStaffing {
  doctors: number
  nurses: number
  technicians: number
  residents: number
  students: number
  administrators: number
}

export interface DepartmentBudget {
  annual: number
  quarters: QuarterlyBudget[]
  categories: BudgetCategory[]
}

export interface QuarterlyBudget {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  allocated: number
  spent: number
  remaining: number
}

export interface BudgetCategory {
  category: string
  allocated: number
  spent: number
  variance?: number
}

export interface Unit {
  // Constitutional: Units are granular operational groups
  id: string
  amxfid: string
  name: string
  type: 'ward' | 'clinic' | 'service' | 'team' | 'group'
  department: string
  parentUnit?: string
  level: number
  capacity: UnitCapacity
  staffing: UnitStaffing
  responsibilities: string[]
  rotation?: RotationSchedule
  coverage?: CoverageModel
}

export interface UnitCapacity {
  beds: number
  equipment: string[]
  consumables: string[]
}

export interface UnitStaffing {
  nurses: number
  aides: number
  technicians: number
  clinicians: number
}

export interface RotationSchedule {
  pattern: 'fixed' | 'flexible' | 'cross-training'
  shifts: Shift[]
  days: string[]
}

export interface Shift {
  type: 'day' | 'night' | 'swing' | 'on-call'
  start: string
  end: string
  staffing: number
}

export interface CoverageModel {
  coveragePercentage: number
  callRota: string
  backup: string[]
}

export interface Service {
  // Constitutional: Services are clinical and administrative offerings
  id: string
  amxfid: string
  name: string
  type: 'clinical' | 'administrative' | 'support'
  department: string
  provider: string[]
  cost: ServiceCost
  coverage: string[]
  requirements?: string[]
}

export interface ServiceCost {
  consultation: number
  procedure: number
  supplies: number
  drugs: number
  admission: number
  discharge: number
}

export interface Team {
  // Constitutional: Teams are care delivery groups
  id: string
  amxfid: string
  name: string
  type: 'medical' | 'nursing' | 'multidisciplinary' | 'support'
  department: string
  members: TeamMember[]
  leader?: string
  responsibilities: string[]
  schedule?: TeamSchedule
}

export interface TeamMember {
  staffId: string
  role: string
  expertise: string[]
  availability: 'full-time' | 'part-time' | 'relief' | 'student'
  schedule: string
}

export interface TeamSchedule {
  pattern: 'fixed' | 'rotating' | 'on-call'
  shifts: Shift[]
}

export interface StaffingModel {
  // Constitutional: Staffing defines human resource configuration
  total: {
    doctors: number
    nurses: number
    technicians: number
    administrators: number
    support: number
  }
  distribution: DepartmentStaffing[]
  utilization: UtilizationRate[]
  planning: StaffingPlan[]
}

export interface UtilizationRate {
  department: string
  percentage: number
  efficiency: number
}

export interface StaffingPlan {
  period: 'monthly' | 'quarterly' | 'annual'
  forecasts: Forecast[]
  requirements: string[]
}

export interface Forecast {
  role: string
  needed: number
  available: number
  gap: number
}

export interface OrganizationPolicy {
  // Constitutional: Policies define operational boundaries
  id: string
  name: string
  type: 'clinical' | 'administrative' | 'financial' | 'compliance'
  description: string
  applicableTo: string[]
  restrictions: PolicyRestriction[]
  requirements: PolicyRequirement[]
  approval: ApprovalWorkflow
}

export interface PolicyRestriction {
  condition: string
  action: string
  exception?: string
}

export interface PolicyRequirement {
  condition: string
  action: string
  penalty?: string
}

export interface ApprovalWorkflow {
  levels: number
  approvers: string[]
  escalation?: string
}

export interface ResourceCatalog {
  // Constitutional: Resources are physical and digital assets
  beds: Bed[]
  equipment: Equipment[]
  pharmaceuticals: Medication[]
  supplies: Supply[]
  vehicles: Vehicle[]
  facilities: Facility[]
  systems: DigitalSystem[]
}

export interface Bed {
  id: string
  type: 'general' | 'icu' | 'nursing' | 'isolation'
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning'
  department: string
  unit: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  department: string
  status: 'operational' | 'maintenance' | 'broken' | 'reserved'
  location: string
  lastService?: Date
  warranty?: Date
}

export interface Medication {
  id: string
  name: string
  type: 'prescription' | 'over-the-counter' | 'controlled'
  department: string
  stock: number
  unit: string
  minimumStock: number
  controlled: boolean
}

export interface Supply {
  id: string
  name: string
  category: string
  stock: number
  unit: string
  reorderPoint: number
}

export interface Vehicle {
  id: string
  type: 'ambulance' | 'transport' | 'maintenance'
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service'
  capacity: number
  assignedTo?: string
}

export interface DigitalSystem {
  id: string
  name: string
  type: 'ehr' | 'billing' | 'inventory' | 'scheduling' | 'reports'
  status: 'active' | 'configured' | 'testing' | 'maintenance'
  integration: string[]
}

export interface IntegrationProfile {
  // Constitutional: Integration defines system interoperability
  fhir: FHIRIntegration
  external: ExternalSystem[]
  legacy: LegacySystem[]
  api: APIConfiguration[]
}

export interface FHIRIntegration {
  enabled: boolean
  baseUrl?: string
  patientMapping: MappingRule
  encounterMapping: MappingRule
  organizationMapping: MappingRule
}

export interface ExternalSystem {
  id: string
  name: string
  type: 'insurance' | 'laboratory' | 'radiology' | 'pharmacy' | 'government'
  endpoint: string
  authentication: 'oauth' | 'api-key' | 'certificate'
  formats: string[]
  mapping: MappingRule
}

export interface LegacySystem {
  id: string
  name: string
  type: string
  endpoint: string
  format: string
  mapping: MappingRule
}

export interface APIConfiguration {
  name: string
  endpoint: string
  authentication: 'basic' | 'token' | 'oauth'
  rateLimit: number
  timeout: number
}

export interface MappingRule {
  id?: string
  patient: string
  encounter: string
  organization: string
  resource: string
}

export interface OrganizationBranding {
  // Constitutional: Branding ensures consistency without changing operations
  logo: string
  colors: ColorScheme
  typography: Typography
  documents: DocumentTemplate[]
  website?: string
  mobileApp?: string
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  neutral: string
  success: string
  warning: string
  danger: string
  info: string
}

export interface Typography {
  heading: string
  body: string
  caption: string
  mono: string
  lineHeight: number
}

export interface DocumentTemplate {
  id: string
  name: string
  type: 'invoice' | 'report' | 'letter' | 'certificate'
  content: string
  fields: DocumentField[]
}

export interface DocumentField {
  name: string
  type: 'text' | 'date' | 'number' | 'select'
  required: boolean
  defaultValue?: string
}

export interface OrganizationAnalytics {
  // Constitutional: Analytics measure constitutional performance
  kpi: KPI[]
  metrics: Metric[]
  reports: Report[]
  dashboards: Dashboard[]
}

export interface KPI {
  id: string
  name: string
  category: 'clinical' | 'operational' | 'financial' | 'quality'
  target: number
  current: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

export interface Metric {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  formula: string
  lastCalculated: Date
  value: number
}

export interface Report {
  id: string
  name: string
  type: 'operational' | 'clinical' | 'financial' | 'compliance'
  period: ReportPeriod
  generatedAt: Date
  content: Record<string, any>
}

export interface ReportPeriod {
  start: Date
  end: Date
}

export interface Dashboard {
  id: string
  name: string
  type: 'overview' | 'department' | 'facility' | 'financial'
  widgets: DashboardWidget[]
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'map' | 'alert'
  title: string
  dataSource: string
  config: Record<string, any>
  position: WidgetPosition
}

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface OrganizationState {
  // Constitutional: Organizations are permanent fixtures
  currentOrganization: Organization | null
  organizations: Organization[]
  isLoading: boolean
  error: string | null
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  currentOrganization: null,
  organizations: [],
  isLoading: false,
  error: null,

  // Core actions
  createOrganization: async (data: CreateOrganizationData) => {
    set({ isLoading: true, error: null })
    try {
      const amxorg = generateAmxOrg()
      
      const organization: Organization = {
        id: amxorg,
        amxorg,
        type: data.type,
        profile: data.profile,
        hierarchy: {
          levels: data.hierarchy.levels,
          reportingLines: [],
          decisionAuthority: {
            clinical: 'doctor',
            financial: 'department',
            operational: 'department',
            emergency: 'rapid-response',
          },
          emergencyChain: {
            levels: [],
            activation: 'automatic',
            communication: {
              primary: [],
              secondary: [],
              escalation: [],
              notification: 'sms',
            },
          },
        },
        facilities: [],
        departments: [],
        units: [],
        services: [],
        teams: [],
        staffing: {
          total: { doctors: 0, nurses: 0, technicians: 0, administrators: 0, support: 0 },
          distribution: [],
          utilization: [],
          planning: [],
        },
        policies: [],
        resources: {
          beds: [],
          equipment: [],
          pharmaceuticals: [],
          supplies: [],
          vehicles: [],
          facilities: [],
          systems: [],
        },
        integration: {
          fhir: {
            enabled: false,
            patientMapping: { id: '', patient: '', encounter: '', organization: '', resource: '' },
            encounterMapping: { id: '', patient: '', encounter: '', organization: '', resource: '' },
            organizationMapping: { id: '', patient: '', encounter: '', organization: '', resource: '' },
          },
          external: [],
          legacy: [],
          api: [],
        },
        branding: {
          logo: '',
          colors: {
            primary: '#0ea5e9',
            secondary: '#64748b',
            accent: '#14b8a6',
            neutral: '#64748b',
            success: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
          },
          typography: {
            heading: 'Inter, system-ui, sans-serif',
            body: 'Inter, system-ui, sans-serif',
            caption: 'Inter, system-ui, sans-serif',
            mono: 'Menlo, monospace',
            lineHeight: 1.5,
          },
          documents: [],
        },
        analytics: {
          kpi: [],
          metrics: [],
          reports: [],
          dashboards: [],
        },
        status: 'pending',
        createdAt: new Date(),
      }
      
      await setDoc(doc(db, 'organizations', amxorg), organization)
      
      set({
        currentOrganization: organization,
        organizations: [...get().organizations, organization],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  switchOrganization: async (organizationId: string) => {
    try {
      const org = get().organizations.find(o => o.id === organizationId) || await getOrganizationById(organizationId)
      if (!org) throw new Error('Organization not found')
      
      set({
        currentOrganization: org,
        error: null,
      })
    } catch (error) {
      console.error('Switch organization error:', error)
      set({ error: (error as Error).message })
    }
  },

  updateOrganization: async (organizationId: string, updates: Partial<Organization>) => {
    try {
      const org = get().organizations.find(o => o.id === organizationId) || await getOrganizationById(organizationId)
      if (!org) throw new Error('Organization not found')
      
      const updatedOrg = { ...org, ...updates }
      await updateDoc(doc(db, 'organizations', organizationId), updatedOrg)
      
      set({
        currentOrganization: updatedOrg,
        organizations: get().organizations.map(o => o.id === organizationId ? updatedOrg : o),
        error: null,
      })
    } catch (error) {
      console.error('Update organization error:', error)
      set({ error: (error as Error).message })
    }
  },

  // Query functions
  getOrganization: async (organizationId: string): Promise<Organization | null> => {
    try {
      const docRef = doc(db, 'organizations', organizationId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docSnap.data() as Organization
      }
      return null
    } catch (error) {
      console.error('Get organization error:', error)
      return null
    }
  },

  getOrganizations: async (): Promise<Organization[]> => {
    try {
      const q = query(collection(db, 'organizations'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(d => d.data()) as Organization[]
    } catch (error) {
      console.error('Get organizations error:', error)
      return []
    }
  },

  // Computed properties
  getOrganizationByAmxorg: (amxorg: string) => {
    return get().organizations.find(o => o.amxorg === amxorg) || null
  },

  getDepartmentsByOrg: (organizationId: string) => {
    return get().organizations.find(o => o.id === organizationId)?.departments || []
  },

  getFacilitiesByOrg: (organizationId: string) => {
    return get().organizations.find(o => o.id === organizationId)?.facilities || []
  },

  isVerified: () => {
    return get().currentOrganization?.status === 'verified'
  },
}) as const)

// ─── Helper Functions ───────────────────────────────────────────────────────────

export interface CreateOrganizationData {
  type: OrganizationType
  profile: OrganizationProfile
  hierarchy: {
    levels: HierarchyLevel[]
  }
}

export const getOrganizationById = async (organizationId: string): Promise<Organization | null> => {
  try {
    const docRef = doc(db, 'organizations', organizationId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as Organization
    }
    return null
  } catch (error) {
    console.error('Get organization by id error:', error)
    return null
  }
}

export interface VerificationData {
  verifiedBy: string
  verifiedAt: Date
  notes?: string
}
