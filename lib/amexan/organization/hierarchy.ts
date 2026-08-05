import { type AmxUid } from '@/lib/amexan/constitution/types'

export interface LegacyOrganization {
  uid: AmxUid
  name: string
  legalName: string
  type: 'hospital' | 'clinic' | 'lab' | 'pharmacy' | 'insurance' | 'training' | 'ministry' | 'ngo'
  taxId: string
  country: string
  licenseNumber: string
  status: 'active' | 'suspended' | 'closed'
  createdAt: number
}

export interface LegacyBranch {
  id: string
  orgId: AmxUid
  name: string
  address: string
  phone: string
  type: 'main' | 'satellite' | 'mobile'
}

export interface LegacyDepartment {
  id: string
  orgId: AmxUid
  branchId: string
  name: string
  type: 'medical' | 'surgical' | 'diagnostic' | 'support' | 'admin'
  headId?: string
  parentDeptId?: string
  active: boolean
}

export interface LegacyUnit {
  id: string
  deptId: string
  name: string
  leadId?: string
  type: 'ward' | 'icu' | 'theatre' | 'clinic' | 'lab_unit' | 'pharmacy_unit'
}

const orgStore = new Map<string, LegacyOrganization>()
const branchStore = new Map<string, LegacyBranch[]>()
const deptStore = new Map<string, LegacyDepartment[]>()
const unitStore = new Map<string, LegacyUnit[]>()

export function registerOrg(org: LegacyOrganization): void { orgStore.set(org.uid, org); branchStore.set(org.uid, []); deptStore.set(org.uid, []) }
export function getOrg(orgId: AmxUid): LegacyOrganization | undefined { return orgStore.get(orgId) }

export function addBranch(orgId: AmxUid, branch: LegacyBranch): void {
  const branches = branchStore.get(orgId) ?? []
  branches.push(branch)
  branchStore.set(orgId, branches)
}

export function addDepartment(orgId: AmxUid, dept: LegacyDepartment): void {
  const depts = deptStore.get(orgId) ?? []
  depts.push(dept)
  deptStore.set(orgId, depts)
}

export function addUnit(deptId: string, unit: LegacyUnit): void {
  const units = unitStore.get(deptId) ?? []
  units.push(unit)
  unitStore.set(deptId, units)
}

export function getOrgTree(orgId: AmxUid): { org: LegacyOrganization | undefined; branches: LegacyBranch[]; departments: LegacyDepartment[]; units: Record<string, LegacyUnit[]> } {
  const org = orgStore.get(orgId)
  const branches = branchStore.get(orgId) ?? []
  const departments = deptStore.get(orgId) ?? []
  const units: Record<string, LegacyUnit[]> = {}
  departments.forEach(d => { units[d.id] = unitStore.get(d.id) ?? [] })
  return { org, branches, departments, units }
}

export function getDepartmentChain(deptId: string): LegacyDepartment[] {
  const chain: LegacyDepartment[] = []
  let current: LegacyDepartment | undefined
  for (const depts of deptStore.values()) {
    current = depts.find(d => d.id === deptId)
    if (current) break
  }
  if (!current) return chain
  chain.push(current)
  while (current.parentDeptId) {
    for (const depts of deptStore.values()) {
      const parent = depts.find(d => d.id === current!.parentDeptId)
      if (parent) { chain.unshift(parent); current = parent; break }
    }
  }
  return chain
}

export function getStaffInUnit(unitId: string): string[] { return [] }

export function getBedsInWard(wardId: string): any[] { return [] }

export function getAllOrgs(): LegacyOrganization[] { return Array.from(orgStore.values()) }
export function getBranches(orgId: AmxUid): LegacyBranch[] { return branchStore.get(orgId) ?? [] }
export function getDepartments(orgId: AmxUid): LegacyDepartment[] { return deptStore.get(orgId) ?? [] }
export function getUnits(deptId: string): LegacyUnit[] { return unitStore.get(deptId) ?? [] }
