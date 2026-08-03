// AMEXAN Authorization & Permission Engine
// Phase 4.2.4 - Foundation Implementation
// Constitutional: Authorization answers "What can you do RIGHT NOW?"

import { create } from 'zustand'
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, query, where, onSnapshot, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type PermissionScope = 
  | 'patient'
  | 'encounter'
  | 'prescription'
  | 'lab-order'
  | 'lab-result'
  | 'imaging'
  | 'procedure'
  | 'medication'
  | 'ward'
  | 'department'
  | 'organization'
  | 'research'
  | 'education'
  | 'finance'
  | 'inventory'
  | 'facility'
  | 'telemedicine'
  | 'analytics'
  | 'system'

export type PermissionAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'verify'
  | 'sign'
  | 'export'
  | 'share'
  | 'assign'
  | 'transfer'
  | 'archive'

export type PermissionSubject = 
  | 'self'
  | 'patient'
  | 'encounter'
  | 'ward'
  | 'department'
  | 'organization'
  | 'facility'
  | 'clinic'
  | 'department'
  | 'research'
  | 'system'

export interface Permission {
  // Constitutional: Permissions are derived, never stored permanently inside user
  id: string
  name: string
  description: string
  subject: PermissionSubject
  action: PermissionAction
  resource: PermissionScope
  conditions: PermissionCondition[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  expiry?: Date
  auditedAt?: Date
  version: number
  isActive: boolean
}

export interface PermissionCondition {
  type: 'role' | 'department' | 'organization' | 'time' | 'resource' | 'location' | 'patient' | 'emergency'
  value: string
  operator: '==' | '!=' | 'in' | 'not-in' | '>=' | '<=' | 'like'
  context?: string
}

export interface PermissionAssignment {
  // Constitutional: Permissions are contextual, not permanent
  id: string
  identityId: string
  organizationId: string
  role: string
  permissions: string[]
  conditions: PermissionCondition[]
  grantedAt: Date
  grantedBy: string
  expiresAt?: Date
  isActive: boolean
  auditTrail: AuditEntry[]
}

export interface AuditEntry {
  timestamp: Date
  performedBy: string
  action: string
  resource: string
  reason: string
  evidence: Record<string, any>
}

export interface Role {
  // Constitutional: Roles are organizational, not personal
  id: string
  name: string
  organizationId: string
  level: 'staff' | 'clinical' | 'administrative' | 'specialist' | 'manager'
  permissions: string[]
  responsibilities: string[]
  title?: string
  grade?: string
  capacity?: number
  qualification?: string[]
  supervision?: string
  reporting?: string
}

export interface DepartmentRole {
  departmentId: string
  role: string
  permissions: string[]
  level: 'staff' | 'clinical' | 'administrative'
  title?: string
}

export interface RoleAssignment {
  // Constitutional: Role assignments are temporary and contextual
  id: string
  identityId: string
  organizationId: string
  departmentId?: string
  role: string
  permissions: string[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  status: 'active' | 'suspended' | 'terminated'
  supervisor?: string
  approval?: ApprovalRecord
  auditTrail: AuditEntry[]
}

export interface ApprovalRecord {
  approvedBy: string
  approvedAt: Date
  purpose: string
  validity: ApprovalValidity
  conditions: string[]
}

export interface ApprovalValidity {
  type: 'time-limited' | 'role-limited' | 'resource-limited'
  duration?: number
  scope?: string[]
}

export interface PermissionPolicy {
  // Constitutional: Policies are organizational, not code
  id: string
  organizationId: string
  name: string
  type: 'clinical' | 'administrative' | 'financial' | 'compliance'
  description: string
  rules: PolicyRule[]
  exceptions: PolicyException[]
  effectiveDate: Date
  expiryDate?: Date
  status: 'active' | 'draft' | 'archived'
}

export interface PolicyRule {
  condition: string
  action: string
  enforcement: 'soft' | 'hard'
  penalty?: string
}

export interface PolicyException {
  condition: string
  reason: string
  approvedBy: string
  approvedAt: Date
}

export interface EmergencyOverride {
  // Constitutional: Emergency overrides are audited, not permanent
  id: string
  identityId: string
  organizationId: string
  resource: string
  purpose: string
  scope: EmergencyScope
  grantedBy: string
  grantedAt: Date
  expiresAt: Date
  reason: string
  active: boolean
  auditTrail: AuditEntry[]
}

export interface EmergencyScope {
  type: 'patient' | 'ward' | 'resource' | 'system'
  identifiers: string[]
  restrictions: EmergencyRestriction[]
}

export interface EmergencyRestriction {
  field: string
  restriction: string
}

export interface Delegation {
  // Constitutional: Delegations are temporary and tracked
  id: string
  identityId: string
  delegatorId: string
  delegateId: string
  organizationId: string
  permissions: string[]
  startDate: Date
  endDate?: Date
  purpose: string
  status: 'active' | 'suspended' | 'expired'
  auditTrail: AuditEntry[]
}

export interface RoleAssignment {
  id: string
  identityId: string
  organizationId: string
  departmentId?: string
  role: string
  permissions: string[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  status: 'active' | 'suspended' | 'terminated'
  supervisor?: string
  approval?: ApprovalRecord
  auditTrail: AuditEntry[]
}

export interface ApprovalRecord {
  approvedBy: string
  approvedAt: Date
  purpose: string
  validity: ApprovalValidity
  conditions: string[]
}

export interface ApprovalValidity {
  type: 'time-limited' | 'role-limited' | 'resource-limited'
  duration?: number
  scope?: string[]
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface PermissionState {
  // Constitutional: Permissions are dynamic, not static
  currentPermissions: string[]
  roleAssignments: RoleAssignment[]
  organizationRoles: Role[]
  departmentRoles: DepartmentRole[]
  emergencyOverrides: EmergencyOverride[]
  delegations: Delegation[]
  policies: PermissionPolicy[]
  isLoading: boolean
  error: string | null
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  currentPermissions: [],
  roleAssignments: [],
  organizationRoles: [],
  departmentRoles: [],
  emergencyOverrides: [],
  delegations: [],
  policies: [],
  isLoading: false,
  error: null,

  // Core permission actions
  assignPermissions: async (assignments: Partial<PermissionAssignment>[]) => {
    set({ isLoading: true, error: null })
    try {
      const batch = writeBatch(db)
      
      for (const assignment of assignments) {
        const id = assignment.id || generateId()
        const docRef = doc(db, 'permission_assignments', id)
        batch.set(docRef, { ...assignment, id })
      }
      
      await batch.commit()
      
      set({
        roleAssignments: [...get().roleAssignments, ...assignments.map(a => ({ ...a, id: a.id || generateId() })) as RoleAssignment[]],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  assignRole: async (assignment: Partial<RoleAssignment>) => {
    set({ isLoading: true, error: null })
    try {
      const id = assignment.id || generateId()
      const docRef = doc(db, 'role_assignments', id)
      await setDoc(docRef, { ...assignment, id })
      
      set({
        roleAssignments: [...get().roleAssignments, assignment as RoleAssignment],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  createPolicy: async (policy: Partial<PermissionPolicy>) => {
    set({ isLoading: true, error: null })
    try {
      const id = policy.id || generateId()
      const docRef = doc(db, 'policies', id)
      await setDoc(docRef, { ...policy, id })
      
      set({
        policies: [...get().policies, policy as PermissionPolicy],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  grantEmergencyOverride: async (override: Partial<EmergencyOverride>) => {
    set({ isLoading: true, error: null })
    try {
      const id = override.id || generateId()
      const docRef = doc(db, 'emergency_overrides', id)
      await setDoc(docRef, { ...override, id })
      
      set({
        emergencyOverrides: [...get().emergencyOverrides, override as EmergencyOverride],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  delegatePermissions: async (delegation: Partial<Delegation>) => {
    set({ isLoading: true, error: null })
    try {
      const id = delegation.id || generateId()
      const docRef = doc(db, 'delegations', id)
      await setDoc(docRef, { ...delegation, id })
      
      set({
        delegations: [...get().delegations, delegation as Delegation],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  // Query functions
  getPermissionsForIdentity: async (identityId: string, organizationId?: string) => {
    try {
      let q = query(collection(db, 'permission_assignments'), where('identityId', '==', identityId))
      if (organizationId) {
        q = query(q, where('organizationId', '==', organizationId))
      }
const snapshot = await getDocs(q)
       return snapshot.docs.map(d => d.data()) as PermissionAssignment[] | []
    } catch (error) {
      console.error('Get permissions for identity error:', error)
      return []
    }
  },

  getRolesByOrganization: async (organizationId: string) => {
    try {
      const q = query(collection(db, 'roles'), where('organizationId', '==', organizationId))
const snapshot = await getDocs(q)
       return snapshot.docs.map(d => d.data()) as Role[] | []
    } catch (error) {
      console.error('Get roles by organization error:', error)
      return []
    }
  },

  getDepartmentRolesByDepartment: async (departmentId: string) => {
    try {
      const q = query(collection(db, 'department_roles'), where('departmentId', '==', departmentId))
const snapshot = await getDocs(q)
       return snapshot.docs.map(d => d.data()) as DepartmentRole[] | []
    } catch (error) {
      console.error('Get department roles error:', error)
      return []
    }
  },

  getEmergencyOverridesByIdentity: async (identityId: string) => {
    try {
      const q = query(collection(db, 'emergency_overrides'), where('identityId', '==', identityId))
const snapshot = await getDocs(q)
       return snapshot.docs.map(d => d.data()) as EmergencyOverride[] | []
    } catch (error) {
      console.error('Get emergency overrides error:', error)
      return []
    }
  },

  // Computed properties
  getActivePermissions: () => {
    const state = get()
    return state.roleAssignments
      .filter(assignment => assignment.isActive)
      .flatMap(assignment => assignment.permissions)
      .filter((permission, index, self) => self.indexOf(permission) === index) // unique
  },

  getActiveRoles: () => {
    const state = get()
    return state.roleAssignments
      .filter(assignment => assignment.status === 'active')
      .map(assignment => assignment.role)
  },

  canAccessResource: (identityId: string, resource: string, action: string, organizationId?: string) => {
    // Constitutional: Permission evaluation is contextual
    const state = get()
    
    // Check emergency overrides first (highest priority)
    const emergencyOverride = state.emergencyOverrides.find(
      override => override.identityId === identityId && 
      override.resource === resource &&
      override.expiresAt && override.expiresAt > new Date() &&
      override.active
    )
    
    if (emergencyOverride?.scope?.type === 'system' || emergencyOverride?.scope?.identifiers?.includes(resource)) {
      return true
    }
    
    // Check role assignments
    const roleAssignment = state.roleAssignments.find(
      assignment => assignment.identityId === identityId &&
      (!organizationId || assignment.organizationId === organizationId) &&
      assignment.status === 'active'
    )
    
    if (!roleAssignment) return false
    
    // Check if role has the required permission
    const role = state.organizationRoles.find(r => r.name === roleAssignment.role)
    if (!role) return false
    
    // Check policy restrictions
    const applicablePolicies = state.policies.filter(
      policy => !policy.expiryDate || policy.expiryDate > new Date()
    )
    
    for (const policy of applicablePolicies) {
      const restrictions = policy.rules.filter(r => r.condition.includes(resource))
      if (restrictions.length > 0) {
        // Policy restricts access
        return false
      }
    }
    
    // Check delegations
    const delegation = state.delegations.find(
      d => d.identityId === identityId && d.endDate && d.endDate > new Date()
    )
    
    const permissions = delegation ? 
      [...role.permissions, ...delegation.permissions] : 
      role.permissions
    
    return permissions.includes(`${resource}:${action}`)
  },
}) as const)

// ─── Helper Functions ───────────────────────────────────────────────────────────\n
export interface CreateIdentityData {
  identityId: string
  organizationId: string
  role: string
  departmentId?: string
  permissions: string[]
  supervisor?: string
  startDate: Date
}

export interface RoleData {
  role: string
  permissions: string[]
  departmentId?: string
  title?: string
  grade?: string
}

export interface PolicyData {
  policyId: string
  organizationId: string
  rules: PolicyRule[]
  exceptions: PolicyException[]
}

export interface EmergencyOverrideData {
  identityId: string
  resource: string
  purpose: string
  scope: EmergencyScope
  grantedBy: string
  duration: number
  reason: string
}

export interface DelegationData {
  delegatorId: string
  delegateId: string
  organizationId: string
  permissions: string[]
  startDate: Date
  endDate?: Date
  purpose: string
}

// ─── Helpers ──────────────────────────────────────────────────────────

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export const getIdentityRoles = async (identityId: string, organizationId?: string) => {
  try {
    const roleAssignments = await getRoleAssignments(identityId)
    const roles = await getRolesByOrganization(organizationId || '')
    
    // Map roles to assignments
    return roleAssignments
      .filter(ra => !organizationId || ra.organizationId === organizationId)
      .map(ra => ({
        role: ra.role,
        title: roles.find(r => r.name === ra.role)?.title || ra.role,
        department: ra.departmentId,
        startDate: ra.startDate,
        endDate: ra.endDate,
        status: ra.status,
        supervisor: ra.supervisor,
      }))
  } catch (error) {
    console.error('Get identity roles error:', error)
    return []
  }
}

export const getRoleAssignments = async (identityId: string) => {
  try {
    const q = query(collection(db, 'role_assignments'), where('identityId', '==', identityId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()) as RoleAssignment[]
  } catch (error) {
    console.error('Get role assignments error:', error)
    return []
  }
}

export const getRolesByOrganization = async (organizationId: string) => {
  try {
    const q = query(collection(db, 'organization_roles'), where('organizationId', '==', organizationId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()) as { name: string; title: string }[]
  } catch (error) {
    console.error('Get roles by organization error:', error)
    return []
  }
}

export const getDelegations = async (identityId: string) => {
  try {
    const q = query(collection(db, 'delegations'), where('identityId', '==', identityId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()) as Delegation[]
  } catch (error) {
    console.error('Get delegations error:', error)
    return []
  }
}

export const getEmergencyOverrides = async (identityId: string) => {
  try {
    const q = query(collection(db, 'emergency_overrides'), where('identityId', '==', identityId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()) as EmergencyOverride[]
  } catch (error) {
    console.error('Get emergency overrides error:', error)
    return []
  }
}

export const evaluatePermissions = async (
  identityId: string,
  resource: string,
  action: string,
  organizationId?: string,
  context?: Record<string, any>
): Promise<boolean> => {
  try {
    // Get all applicable assignments
    const assignments = await getIdentityRoles(identityId, organizationId)
    
    // Check each assignment for permission
    for (const assignment of assignments) {
      if (hasPermission(assignment as unknown as RoleAssignment, resource, action, context)) {
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Evaluate permissions error:', error)
    return false
  }
}

export const hasPermission = (
  assignment: RoleAssignment,
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean => {
  // Check role permissions
  const role = usePermissionStore.getState().organizationRoles.find(r => r.name === assignment.role)
  if (!role) return false
  
  if (role.permissions.includes(`${resource}:${action}`)) {
    return true
  }
  
  // Check policy exceptions
  const applicablePolicies = usePermissionStore.getState().policies.filter(
    policy => !policy.expiryDate || policy.expiryDate > new Date()
  )
  
  for (const policy of applicablePolicies) {
    const exception = policy.exceptions.find(
      e => e.condition.includes(resource)
    )
    
    if (exception) {
      return true
    }
  }
  
  // Check emergency overrides
  const emergency = usePermissionStore.getState().emergencyOverrides.find(
    e => e.identityId === assignment.identityId &&
    e.resource === resource &&
    e.expiresAt && e.expiresAt > new Date() &&
    e.active
  )
  
  if (emergency) {
    return true
  }
  
  // Check delegations
  const delegation = usePermissionStore.getState().delegations.find(
    d => d.identityId === assignment.identityId &&
    d.endDate && d.endDate > new Date()
  )
  
  if (delegation && delegation.permissions.includes(`${resource}:${action}`)) {
    return true
  }
  
  return false
}

export const generateRoleId = (organizationId: string, roleName: string): string => {
  return `role_${organizationId}_${roleName}`
}

export const generatePolicyId = (organizationId: string, policyName: string): string => {
  return `policy_${organizationId}_${policyName}`
}

export const generateDelegationId = (delegatorId: string, delegateId: string): string => {
  return `deleg_${delegatorId}_${delegateId}`
}

export const generateEmergencyOverrideId = (identityId: string, resource: string): string => {
  return `emerg_${identityId}_${resource}`
}

// ─── Event Listeners ────────────────────────────────────────────────────────────

export const setupPermissionListeners = () => {
  // Listen to role assignment changes
  onSnapshot(query(collection(db, 'role_assignments')), (snapshot) => {
    const roleAssignments = snapshot.docs.map(d => d.data()) as RoleAssignment[] | []
    usePermissionStore.setState({ roleAssignments })
  })
  
  // Listen to policy changes
  onSnapshot(query(collection(db, 'policies')), (snapshot) => {
    const policies = snapshot.docs.map(d => d.data()) as PermissionPolicy[]
    usePermissionStore.setState({ policies })
  })
  
  // Listen to emergency override changes
  onSnapshot(query(collection(db, 'emergency_overrides')), (snapshot) => {
    const emergencyOverrides = snapshot.docs.map(d => d.data()) as EmergencyOverride[]
    usePermissionStore.setState({ emergencyOverrides })
  })
  
  // Listen to delegation changes
  onSnapshot(query(collection(db, 'delegations')), (snapshot) => {
    const delegations = snapshot.docs.map(d => d.data()) as Delegation[]
    usePermissionStore.setState({ delegations })
  })
}
