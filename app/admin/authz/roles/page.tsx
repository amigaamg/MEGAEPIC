'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import { Shield, Plus, Edit3, Trash2, Search, Users, CheckCircle, XCircle } from 'lucide-react'
import {
  registerRole, getAllRoles, deleteRole as deleteRbacRole,
  type AuthzRole,
} from '@/lib/amexan/authz'
import type { ResourceType, Action } from '@/lib/amexan/constitution/types'

const RESOURCE_OPTIONS: ResourceType[] = [
  'patient', 'encounter', 'prescription', 'lab_order', 'imaging_order',
  'clinical_note', 'discharge_summary', 'referral', 'consent',
  'vitals', 'assessment', 'care_plan', 'staff', 'department',
  'organization', 'finance', 'admin', 'system_config', 'audit_log',
  'reports', 'inventory', 'pharmacy', 'theatre',
]

const ACTION_OPTIONS: Action[] = [
  'create', 'read', 'update', 'delete', 'approve', 'reject',
  'sign', 'verify', 'audit', 'export', 'assign',
]

const ROLE_TYPES: AuthzRole['type'][] = ['system', 'organization', 'department', 'custom']

let _roleCounter = 0

function generateId(): string {
  _roleCounter++
  return `role_${Date.now()}_${_roleCounter}`
}

const DEFAULT_ROLES: AuthzRole[] = [
  { id: 'admin', name: 'System Admin', description: 'Full system access', type: 'system', permissions: [{ resource: 'admin', actions: ['admin'], scope: { type: 'global' }, deny: false }], isAssignable: false, createdBy: '' as any, createdAt: 0, updatedAt: 0 },
  { id: 'org_admin', name: 'Organization Admin', description: 'Full organization access', type: 'organization', permissions: RESOURCE_OPTIONS.map(r => ({ resource: r, actions: ['create', 'read', 'update', 'delete'], scope: { type: 'organization' }, deny: false })), isAssignable: true, createdBy: '' as any, createdAt: 0, updatedAt: 0 },
  { id: 'doctor', name: 'Medical Doctor', description: 'Clinical care and prescribing', type: 'organization', permissions: [
    { resource: 'patient', actions: ['create', 'read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'encounter', actions: ['create', 'read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'prescription', actions: ['create', 'read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'lab_order', actions: ['create', 'read'], scope: { type: 'department' }, deny: false },
    { resource: 'imaging_order', actions: ['create', 'read'], scope: { type: 'department' }, deny: false },
    { resource: 'clinical_note', actions: ['create', 'read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'discharge_summary', actions: ['create', 'read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'referral', actions: ['create', 'read'], scope: { type: 'department' }, deny: false },
    { resource: 'vitals', actions: ['read'], scope: { type: 'department' }, deny: false },
    { resource: 'assessment', actions: ['create', 'read', 'update'], scope: { type: 'department' }, deny: false },
  ], isAssignable: true, createdBy: '' as any, createdAt: 0, updatedAt: 0 },
  { id: 'nurse', name: 'Nurse', description: 'Nursing care and medication administration', type: 'organization', permissions: [
    { resource: 'patient', actions: ['read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'vitals', actions: ['create', 'read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'prescription', actions: ['read'], scope: { type: 'department' }, deny: false },
    { resource: 'clinical_note', actions: ['create', 'read'], scope: { type: 'department' }, deny: false },
    { resource: 'assessment', actions: ['create', 'read'], scope: { type: 'department' }, deny: false },
  ], isAssignable: true, createdBy: '' as any, createdAt: 0, updatedAt: 0 },
  { id: 'pharmacist', name: 'Pharmacist', description: 'Pharmacy dispensing and review', type: 'organization', permissions: [
    { resource: 'prescription', actions: ['read', 'update', 'approve'], scope: { type: 'department' }, deny: false },
    { resource: 'pharmacy', actions: ['create', 'read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'patient', actions: ['read'], scope: { type: 'department' }, deny: false },
  ], isAssignable: true, createdBy: '' as any, createdAt: 0, updatedAt: 0 },
  { id: 'lab_tech', name: 'Lab Technologist', description: 'Laboratory operations', type: 'organization', permissions: [
    { resource: 'lab_order', actions: ['read', 'update'], scope: { type: 'department' }, deny: false },
    { resource: 'patient', actions: ['read'], scope: { type: 'department' }, deny: false },
  ], isAssignable: true, createdBy: '' as any, createdAt: 0, updatedAt: 0 },
  { id: 'receptionist', name: 'Receptionist', description: 'Front desk operations', type: 'organization', permissions: [
    { resource: 'patient', actions: ['create', 'read'], scope: { type: 'organization' }, deny: false },
    { resource: 'encounter', actions: ['create', 'read'], scope: { type: 'organization' }, deny: false },
    { resource: 'schedule', actions: ['create', 'read', 'update'], scope: { type: 'organization' }, deny: false },
  ], isAssignable: true, createdBy: '' as any, createdAt: 0, updatedAt: 0 },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<AuthzRole[]>(() => {
    DEFAULT_ROLES.forEach(r => registerRole(r))
    return getAllRoles()
  })
  const [search, setSearch] = useState('')
  const [editingRole, setEditingRole] = useState<AuthzRole | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const filteredRoles = useMemo(() => {
    if (!search.trim()) return roles
    const q = search.toLowerCase()
    return roles.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
  }, [roles, search])

  function handleSave(role: AuthzRole) {
    registerRole(role)
    setRoles(getAllRoles())
    setShowEditor(false)
    setEditingRole(null)
  }

  function handleDelete(id: string) {
    deleteRbacRole(id)
    setRoles(getAllRoles())
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Shield size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Authorization / Roles</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <button onClick={() => { setEditingRole(null); setShowEditor(true) }}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
          <Plus size={14} /> New Role
        </button>
      </div>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {filteredRoles.map(role => (
            <div key={role.id} style={{ background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={16} color="var(--primary)" />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{role.name}</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--sky-50)', color: 'var(--primary)', fontWeight: 500 }}>{role.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditingRole(role); setShowEditor(true) }}
                    style={{ padding: 5, borderRadius: 6, border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Edit3 size={13} />
                  </button>
                  {role.isAssignable && (
                    <button onClick={() => handleDelete(role.id)}
                      style={{ padding: 5, borderRadius: 6, border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer', color: '#EF4444' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>{role.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {role.permissions.slice(0, 8).map((p, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: p.deny ? 'rgba(239,68,68,0.08)' : 'var(--sky-50)', color: p.deny ? '#EF4444' : 'var(--primary)', fontWeight: 500 }}>
                    {p.resource}:{p.actions[0]}
                    {p.actions.length > 1 ? `+${p.actions.length - 1}` : ''}
                  </span>
                ))}
                {role.permissions.length > 8 && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 6px' }}>+{role.permissions.length - 8} more</span>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
                {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                {!role.isAssignable ? ' · System (locked)' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditor && <RoleEditor role={editingRole} onSave={handleSave} onClose={() => setShowEditor(false)} />}
    </div>
  )
}

function RoleEditor({ role, onSave, onClose }: { role: AuthzRole | null; onSave: (role: AuthzRole) => void; onClose: () => void }) {
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [type, setType] = useState<AuthzRole['type']>(role?.type ?? 'organization')
  const [permissions, setPermissions] = useState(role?.permissions ?? [])

  function togglePermission(resource: ResourceType, action: Action) {
    setPermissions(prev => {
      const existing = prev.findIndex(p => p.resource === resource && p.actions.includes(action) && !p.deny)
      if (existing >= 0) {
        const updated = prev.filter((_, i) => i !== existing)
        return updated
      }
      const existingPerm = prev.find(p => p.resource === resource && !p.deny)
      if (existingPerm) {
        return prev.map(p => p.resource === resource && !p.deny ? { ...p, actions: [...p.actions, action] } : p)
      }
      return [...prev, { resource, actions: [action], scope: { type: 'organization' as const }, deny: false }]
    })
  }

  function hasPermission(resource: ResourceType, action: Action): boolean {
    return permissions.some(p => p.resource === resource && p.actions.includes(action) && !p.deny)
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id: role?.id ?? generateId(),
      name: name.trim(),
      description: description.trim(),
      type,
      permissions,
      inheritsFrom: role?.inheritsFrom,
      isAssignable: true,
      maxAssignments: role?.maxAssignments,
      createdBy: '' as any,
      createdAt: role?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{role ? 'Edit Role' : 'New Role'}</h2>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Role Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Senior Registrar" style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What this role can do..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Role Type</label>
          <select value={type} onChange={e => setType(e.target.value as AuthzRole['type'])}
            style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
            {ROLE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>Permissions</label>
          <div style={{ border: '1px solid var(--surface-border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(5, 1fr)', gap: 0, background: 'var(--surface-elevated)', borderBottom: '1px solid var(--surface-border)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              <span style={{ padding: '8px 12px' }}>Resource</span>
              {ACTION_OPTIONS.slice(0, 5).map(a => <span key={a} style={{ padding: '8px 4px', textAlign: 'center' }}>{a}</span>)}
            </div>
            {RESOURCE_OPTIONS.map(resource => (
              <div key={resource} style={{ display: 'grid', gridTemplateColumns: '140px repeat(5, 1fr)', gap: 0, borderBottom: '1px solid var(--surface-border)', fontSize: 12 }}>
                <span style={{ padding: '6px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{resource.replace(/_/g, ' ')}</span>
                {ACTION_OPTIONS.slice(0, 5).map(action => {
                  const active = hasPermission(resource, action)
                  return (
                    <button key={action} onClick={() => togglePermission(resource, action)}
                      style={{ padding: '6px 4px', textAlign: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: active ? 'var(--primary)' : 'var(--text-muted)', fontSize: 14 }}>
                      {active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose}
            style={{ height: 38, padding: '0 20px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Cancel
          </button>
          <button onClick={handleSave}
            style={{ height: 38, padding: '0 20px', borderRadius: 8, border: 'none', background: name.trim() ? 'var(--primary)' : 'var(--surface-border)', color: name.trim() ? 'white' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)' }}>
            {role ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  )
}
