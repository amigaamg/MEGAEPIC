import type { AmxUid, Role, Permission, ResourceType, Action } from '../constitution/types'

const _roles = new Map<string, Role>()
const _userRoles = new Map<AmxUid, Set<string>>()

export function registerRole(role: Role) {
  _roles.set(role.id, role)
}

export function getRole(roleId: string): Role | undefined {
  return _roles.get(roleId)
}

export function assignRole(uid: AmxUid, roleId: string) {
  if (!_roles.has(roleId)) return false
  if (!_userRoles.has(uid)) _userRoles.set(uid, new Set())
  _userRoles.get(uid)!.add(roleId)
  return true
}

export function unassignRole(uid: AmxUid, roleId: string) {
  return _userRoles.get(uid)?.delete(roleId) ?? false
}

export function getUserRoles(uid: AmxUid): Role[] {
  const roleIds = _userRoles.get(uid)
  if (!roleIds) return []
  return Array.from(roleIds).map(id => _roles.get(id)).filter(Boolean) as Role[]
}

export function getUserPermissions(uid: AmxUid): Permission[] {
  const roles = getUserRoles(uid)
  const permissions: Permission[] = []
  const seen = new Set<string>()
  for (const role of roles) {
    for (const p of role.permissions) {
      const key = `${p.resource}:${p.actions.sort().join(',')}:${p.deny}`
      if (!seen.has(key)) {
        seen.add(key)
        permissions.push(p)
      }
    }
  }
  return permissions
}

export function hasPermission(uid: AmxUid, resource: ResourceType, action: Action): boolean {
  const permissions = getUserPermissions(uid)
  for (const p of permissions) {
    if (p.deny && p.resource === resource && p.actions.includes(action)) return false
    if (!p.deny && p.resource === resource && p.actions.includes(action)) return true
  }
  return false
}

export function getAllRoles(): Role[] {
  return Array.from(_roles.values())
}

export function deleteRole(roleId: string) {
  _roles.delete(roleId)
  for (const [, roles] of _userRoles) roles.delete(roleId)
}
