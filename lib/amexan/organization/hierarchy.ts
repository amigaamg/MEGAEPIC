import { type AmxUid } from '@/lib/amexan/identity/types'
import type { Organization, Branch, Department, Unit } from './types'

const orgStore = new Map<string, Organization>()
const branchStore = new Map<string, Branch[]>()
const deptStore = new Map<string, Department[]>()
const unitStore = new Map<string, Unit[]>()

export function registerOrg(org: Organization): void { orgStore.set(org.uid, org); branchStore.set(org.uid, []); deptStore.set(org.uid, []) }
export function getOrg(orgId: AmxUid): Organization | undefined { return orgStore.get(orgId) }

export function addBranch(orgId: AmxUid, branch: Branch): void {
  const branches = branchStore.get(orgId) ?? []
  branches.push(branch)
  branchStore.set(orgId, branches)
}

export function addDepartment(orgId: AmxUid, dept: Department): void {
  const depts = deptStore.get(orgId) ?? []
  depts.push(dept)
  deptStore.set(orgId, depts)
}

export function addUnit(deptId: string, unit: Unit): void {
  const units = unitStore.get(deptId) ?? []
  units.push(unit)
  unitStore.set(deptId, units)
}

export function getOrgTree(orgId: AmxUid): { org: Organization | undefined; branches: Branch[]; departments: Department[]; units: Record<string, Unit[]> } {
  const org = orgStore.get(orgId)
  const branches = branchStore.get(orgId) ?? []
  const departments = deptStore.get(orgId) ?? []
  const units: Record<string, Unit[]> = {}
  departments.forEach(d => { units[d.id] = unitStore.get(d.id) ?? [] })
  return { org, branches, departments, units }
}

export function getDepartmentChain(deptId: string): Department[] {
  const chain: Department[] = []
  let current: Department | undefined
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

export function getAllOrgs(): Organization[] { return Array.from(orgStore.values()) }
export function getBranches(orgId: AmxUid): Branch[] { return branchStore.get(orgId) ?? [] }
export function getDepartments(orgId: AmxUid): Department[] { return deptStore.get(orgId) ?? [] }
export function getUnits(deptId: string): Unit[] { return unitStore.get(deptId) ?? [] }
