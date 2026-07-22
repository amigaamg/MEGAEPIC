'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import { Shield, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import {
  getAllPolicies, addPolicy, deletePolicy, togglePolicy, createPolicyRecord,
  type Policy, type PolicySubject, type PolicyResource, type PolicyCondition,
} from '@/lib/amexan/authz/policy-engine'
import type { Action, AmxUid } from '@/lib/amexan/constitution/types'

const EFFECT_OPTIONS: Policy['effect'][] = ['allow', 'deny']
const SUBJECT_TYPES: PolicySubject['type'][] = ['role', 'user', 'department', 'group', 'position']
const RESOURCE_TYPES = [
  'patient', 'encounter', 'prescription', 'lab_order', 'imaging_order',
  'clinical_note', 'discharge_summary', 'referral', 'consent',
  'vitals', 'assessment', 'care_plan', 'staff', 'department',
  'organization', 'finance', 'admin', 'system_config', 'audit_log', 'reports',
]
const ACTION_OPTIONS: Action[] = [
  'create', 'read', 'update', 'delete', 'approve', 'reject',
  'sign', 'verify', 'audit', 'export', 'assign',
]
const OPERATORS: PolicyCondition['operator'][] = ['eq', 'neq', 'lt', 'gt', 'lte', 'gte', 'in', 'not_in', 'contains']

const SAMPLE_POLICIES: Policy[] = [
  {
    id: 'pol_1', organizationId: 'org_1', name: 'Clinicians Read All Patients',
    description: 'Allow doctors and nurses to read any patient record', effect: 'allow',
    subjects: [{ type: 'role', values: ['doctor', 'nurse'] }],
    resources: [{ type: 'patient' as any }],
    actions: ['read'], conditions: [], priority: 100, version: 1,
    enabled: true, createdBy: '' as AmxUid, createdAt: Date.now() - 86400000, updatedAt: Date.now() - 86400000,
  },
  {
    id: 'pol_2', organizationId: 'org_1', name: 'Restrict Delete Encounters',
    description: 'Only admins can delete encounters', effect: 'deny',
    subjects: [{ type: 'role', values: ['doctor', 'nurse', 'pharmacist', 'lab_tech'] }],
    resources: [{ type: 'encounter' as any }],
    actions: ['delete'], conditions: [], priority: 200, version: 1,
    enabled: true, createdBy: '' as AmxUid, createdAt: Date.now() - 86400000, updatedAt: Date.now() - 86400000,
  },
  {
    id: 'pol_3', organizationId: 'org_1', name: 'Allow Break-Glass Read',
    description: 'Allow any clinician to read in emergency', effect: 'allow',
    subjects: [{ type: 'role', values: ['doctor', 'nurse'] }],
    resources: [{ type: 'patient' as any }],
    actions: ['read'], conditions: [{ attribute: 'emergency', operator: 'eq', value: true }],
    priority: 50, version: 1,
    enabled: true, createdBy: '' as AmxUid, createdAt: Date.now() - 43200000, updatedAt: Date.now() - 43200000,
  },
]

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(() => {
    SAMPLE_POLICIES.forEach(p => addPolicy(p))
    return getAllPolicies()
  })
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return policies
    const q = search.toLowerCase()
    return policies.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }, [policies, search])

  function handleToggle(id: string) {
    togglePolicy(id)
    setPolicies(getAllPolicies())
  }

  function handleDelete(id: string) {
    deletePolicy(id)
    setPolicies(getAllPolicies())
  }

  function handleCreate(data: { name: string; description: string; effect: Policy['effect']; subjects: PolicySubject[]; resources: PolicyResource[]; actions: Action[] }) {
    createPolicyRecord('org_1', data.name, data.effect, data.subjects, data.resources, data.actions, '' as AmxUid)
    setPolicies(getAllPolicies())
    setShowEditor(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Shield size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Authorization / Policies</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search policies..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <button onClick={() => setShowEditor(true)}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
          <Plus size={14} /> New Policy
        </button>
      </div>
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(policy => (
            <div key={policy.id} style={{ background: 'var(--surface-card)', borderRadius: 12, border: `1px solid ${policy.effect === 'deny' ? 'rgba(239,68,68,0.2)' : 'var(--surface-border)'}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: policy.effect === 'deny' ? '#EF4444' : '#10B981', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{policy.name}</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: policy.effect === 'deny' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', color: policy.effect === 'deny' ? '#EF4444' : '#10B981', fontWeight: 600, textTransform: 'uppercase' }}>{policy.effect}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>v{policy.version}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{policy.description}</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {policy.subjects.map((s, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
                      {s.type}: {s.values.join(', ')}
                    </span>
                  ))}
                  {policy.resources.map((r, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'var(--sky-50)', color: 'var(--primary)', fontWeight: 500 }}>
                      {r.type}
                    </span>
                  ))}
                  {policy.actions.map(a => (
                    <span key={a} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleToggle(policy.id)}
                style={{ padding: 6, borderRadius: 6, border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer', color: policy.enabled ? '#10B981' : 'var(--text-muted)' }}>
                {policy.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              </button>
              <button onClick={() => handleDelete(policy.id)}
                style={{ padding: 6, borderRadius: 6, border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer', color: '#EF4444' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showEditor && <PolicyEditor onSave={handleCreate} onClose={() => setShowEditor(false)} />}
    </div>
  )
}

function PolicyEditor({ onSave, onClose }: { onSave: (data: any) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [effect, setEffect] = useState<Policy['effect']>('allow')
  const [subjectType, setSubjectType] = useState<PolicySubject['type']>('role')
  const [subjectValues, setSubjectValues] = useState('')
  const [resourceType, setResourceType] = useState(RESOURCE_TYPES[0])
  const [actions, setActions] = useState<Action[]>([])

  function toggleAction(action: Action) {
    setActions(prev => prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action])
  }

  function handleSave() {
    if (!name.trim() || !subjectValues.trim() || actions.length === 0) return
    onSave({
      name: name.trim(),
      description: description.trim(),
      effect,
      subjects: [{ type: subjectType, values: subjectValues.split(',').map(v => v.trim()).filter(Boolean) }],
      resources: [{ type: resourceType as any }],
      actions,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 16, width: '100%', maxWidth: 520, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>New Policy</h2>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Deny Delete Encounters" style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What this policy does..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Effect</label>
            <select value={effect} onChange={e => setEffect(e.target.value as Policy['effect'])}
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
              {EFFECT_OPTIONS.map(e => <option key={e} value={e}>{e.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Resource</label>
            <select value={resourceType} onChange={e => setResourceType(e.target.value)}
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
              {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Subject</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={subjectType} onChange={e => setSubjectType(e.target.value as PolicySubject['type'])}
              style={{ width: 120, height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
              {SUBJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={subjectValues} onChange={e => setSubjectValues(e.target.value)} placeholder="doctor, nurse (comma separated)" style={{ flex: 1, height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Actions</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ACTION_OPTIONS.map(action => (
              <button key={action} onClick={() => toggleAction(action)}
                style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${actions.includes(action) ? 'var(--primary)' : 'var(--surface-border)'}`, background: actions.includes(action) ? 'var(--sky-50)' : 'transparent', color: actions.includes(action) ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                {action}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose}
            style={{ height: 38, padding: '0 20px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Cancel
          </button>
          <button onClick={handleSave}
            style={{ height: 38, padding: '0 20px', borderRadius: 8, border: 'none', background: name.trim() && subjectValues.trim() && actions.length ? 'var(--primary)' : 'var(--surface-border)', color: name.trim() && subjectValues.trim() && actions.length ? 'white' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: name.trim() && subjectValues.trim() && actions.length ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)' }}>
            Create Policy
          </button>
        </div>
      </div>
    </div>
  )
}
