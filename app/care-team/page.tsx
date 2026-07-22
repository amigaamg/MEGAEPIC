'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import {
  Users, Stethoscope, Pill, FlaskConical, Scan, Heart,
  Activity, Clock, AlertTriangle, Search, User, Ambulance,
  Brain, Baby, Eye, Bone, Microscope,
} from 'lucide-react'

interface Profession {
  id: string
  label: string
  icon: string
  color: string
  count: number
  active: number
  description: string
}

const PROFESSIONS: Profession[] = [
  { id: 'medical_doctor', label: 'Medical Doctors', icon: '🩺', color: '#3B82F6', count: 12, active: 8, description: 'Physicians, surgeons, specialists providing direct patient care' },
  { id: 'nurse', label: 'Nursing', icon: '💉', color: '#10B981', count: 28, active: 18, description: 'Registered nurses, enrolled nurses, nursing officers' },
  { id: 'pharmacist', label: 'Pharmacy', icon: '💊', color: '#8B5CF6', count: 6, active: 4, description: 'Pharmacists, pharmaceutical technologists' },
  { id: 'lab_technologist', label: 'Laboratory', icon: '🔬', color: '#F59E0B', count: 8, active: 5, description: 'Medical laboratory scientists and technicians' },
  { id: 'radiographer', label: 'Radiology', icon: '🔬', color: '#6366F1', count: 4, active: 3, description: 'Radiographers, radiologists, imaging technologists' },
  { id: 'physiotherapist', label: 'Physiotherapy', icon: '🏃', color: '#14B8A6', count: 5, active: 3, description: 'Physiotherapists, occupational therapists' },
  { id: 'midwife', label: 'Midwifery', icon: '👶', color: '#EC4899', count: 10, active: 6, description: 'Midwives, nurse-midwives' },
  { id: 'nutritionist', label: 'Nutrition', icon: '🥗', color: '#22C55E', count: 3, active: 2, description: 'Dietitians, nutritionists' },
  { id: 'psychologist', label: 'Psychology', icon: '🧠', color: '#A855F7', count: 4, active: 2, description: 'Clinical psychologists, counselors' },
  { id: 'social_worker', label: 'Social Work', icon: '🤝', color: '#F97316', count: 3, active: 2, description: 'Medical social workers, case managers' },
  { id: 'clinical_officer', label: 'Clinical Officers', icon: '🩺', color: '#06B6D4', count: 7, active: 5, description: 'Clinical officers, medical officers' },
  { id: 'community_health', label: 'Community Health', icon: '🏘️', color: '#84CC16', count: 15, active: 10, description: 'Community health workers, outreach teams' },
  { id: 'administrator', label: 'Administration', icon: '📋', color: '#64748B', count: 8, active: 6, description: 'Hospital administrators, records officers, finance' },
]

const TEAM_MEMBERS = [
  { name: 'Dr. James Mwangi', profession: 'medical_doctor', role: 'Consultant Physician', department: 'Internal Medicine', status: 'on_duty', patients: 12, shift: 'Morning' },
  { name: 'Dr. Grace Kamau', profession: 'medical_doctor', role: 'Registrar', department: 'Surgery', status: 'on_duty', patients: 8, shift: 'Morning' },
  { name: 'Nurse Peter Ochieng', profession: 'nurse', role: 'Senior Nursing Officer', department: 'Ward 3A', status: 'on_duty', patients: 6, shift: 'Morning' },
  { name: 'Nurse Ann Wanjiku', profession: 'nurse', role: 'Registered Nurse', department: 'ICU', status: 'on_duty', patients: 2, shift: 'Night' },
  { name: 'Pharmacist Sarah Chebet', profession: 'pharmacist', role: 'Clinical Pharmacist', department: 'Pharmacy', status: 'on_duty', patients: 0, shift: 'Morning' },
  { name: 'Lab Tech David Kioko', profession: 'lab_technologist', role: 'MLS', department: 'Laboratory', status: 'on_duty', patients: 0, shift: 'Morning' },
  { name: 'Midwife Esther Nyambura', profession: 'midwife', role: 'Nurse-Midwife', department: 'Maternity', status: 'on_duty', patients: 4, shift: 'Morning' },
  { name: 'Physio Samuel Kiprop', profession: 'physiotherapist', role: 'Physiotherapist', department: 'Rehab', status: 'on_call', patients: 3, shift: 'On Call' },
  { name: 'Dr. Mary Akinyi', profession: 'medical_doctor', role: 'Pediatrician', department: 'Pediatrics', status: 'on_duty', patients: 10, shift: 'Morning' },
  { name: 'Nurse Hannah Jerono', profession: 'nurse', role: 'NICU Nurse', department: 'NICU', status: 'on_duty', patients: 3, shift: 'Morning' },
]

export default function CareTeamPage() {
  const [selectedProfession, setSelectedProfession] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<typeof TEAM_MEMBERS[0] | null>(null)

  const filteredMembers = useMemo(() => {
    let result = TEAM_MEMBERS
    if (selectedProfession !== 'all') result = result.filter(m => m.profession === selectedProfession)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.department.toLowerCase().includes(q))
    }
    return result
  }, [selectedProfession, searchQuery])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Users size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Care Team</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>13 professions · {TEAM_MEMBERS.length} on duty</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search team members..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Profession sidebar */}
        <div style={{ width: 240, background: 'var(--surface-card)', borderRight: '1px solid var(--surface-border)', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '12px 12px 0', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Professions</div>
          <button onClick={() => setSelectedProfession('all')}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: selectedProfession === 'all' ? 'var(--sky-50)' : 'transparent', color: selectedProfession === 'all' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: selectedProfession === 'all' ? 600 : 400, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', margin: '2px 6px' }}>
            <Users size={14} /> All Professions
            <span style={{ marginLeft: 'auto', background: 'var(--sky-50)', color: 'var(--primary)', borderRadius: 10, padding: '0 7px', fontSize: 10, fontWeight: 700 }}>{TEAM_MEMBERS.length}</span>
          </button>
          <div style={{ height: 1, background: 'var(--surface-border)', margin: '4px 8px' }} />
          {PROFESSIONS.map(p => (
            <button key={p.id} onClick={() => setSelectedProfession(p.id)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: selectedProfession === p.id ? 'var(--sky-50)' : 'transparent', color: selectedProfession === p.id ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: selectedProfession === p.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', margin: '1px 6px' }}>
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block' }}>{p.label}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.active} active of {p.count}</span>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Member list */}
        <div style={{ width: 320, borderRight: '1px solid var(--surface-border)', overflow: 'auto', background: 'var(--surface-card)' }}>
          <div style={{ padding: '12px 16px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Team Members ({filteredMembers.length})
          </div>
          {filteredMembers.map((member, i) => (
            <div key={i} onClick={() => setSelectedMember(member)}
              style={{
                padding: '10px 16px', cursor: 'pointer', margin: '2px 8px', borderRadius: 8,
                background: selectedMember?.name === member.name ? 'var(--sky-50)' : 'transparent',
                border: selectedMember?.name === member.name ? '1px solid var(--sky-200)' : '1px solid transparent',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{PROFESSIONS.find(p => p.id === member.profession)?.icon || '👤'}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>{member.role}</span>
                </div>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: member.status === 'on_duty' ? '#10B981' : member.status === 'on_call' ? '#F59E0B' : 'var(--text-muted)', flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                <span>{member.department}</span>
                <span>·</span>
                <span>{member.shift}</span>
                {member.patients > 0 && <><span>·</span><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{member.patients} patients</span></>}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {selectedMember ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--sky-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {PROFESSIONS.find(p => p.id === selectedMember.profession)?.icon || '👤'}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{selectedMember.name}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{selectedMember.role} · {selectedMember.department}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: selectedMember.status === 'on_duty' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', color: selectedMember.status === 'on_duty' ? '#10B981' : '#F59E0B', fontWeight: 600, textTransform: 'capitalize' }}>
                      {selectedMember.status.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--sky-50)', color: 'var(--primary)', fontWeight: 500 }}>
                      {selectedMember.shift} Shift
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: '14px 18px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Current Patients</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedMember.patients}</span>
                </div>
                <div style={{ padding: '14px 18px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Shift Duration</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>8h</span>
                </div>
                <div style={{ padding: '14px 18px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Pending Tasks</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>3</span>
                </div>
              </div>

              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Active Patients</h3>
                {selectedMember.patients > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Array.from({ length: selectedMember.patients }, (_, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--surface-elevated)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#10B981' : 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>Patient {String.fromCharCode(65 + i)}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Ward {Math.floor(Math.random() * 5) + 1}{String.fromCharCode(65 + Math.floor(Math.random() * 3))}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>No active patients assigned</p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Select a team member</p>
              <p style={{ fontSize: 12, margin: 0 }}>Choose from the list to view their details and assignments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
