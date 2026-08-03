export function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

export function generateAmxId(prefix?: string): string {
  return `${prefix ? prefix + '_' : 'AMX_'}${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

export function generateAmxOrg(): string {
  return `ORG_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

export function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `hash_${Math.abs(hash).toString(36)}`
}

export function createId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}