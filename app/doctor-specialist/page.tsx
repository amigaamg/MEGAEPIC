'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import {
  Stethoscope, Search, Users, Clock, AlertTriangle, Activity,
  Heart, Brain, Eye, Bone, Microscope, Baby,
  Syringe, Ear, Droplets, Pill, User,

} from 'lucide-react'

interface Specialty {
  id: string
  label: string
  icon: string
  color: string
  description: string
  commonCases: string[]
  keyActions: { label: string; shortcut: string }[]
  template: string
}

const SPECIALTIES: Specialty[] = [
  { id: 'general_surgery', label: 'General Surgery', icon: '🔪', color: '#3B82F6', description: 'Abdominal, breast, endocrine, hernia, trauma surgery', commonCases: ['Appendectomy', 'Cholecystectomy', 'Hernia repair', 'Laparotomy'], keyActions: [{ label: 'Wound check', shortcut: 'W' }, { label: 'Drain review', shortcut: 'D' }, { label: 'Op note', shortcut: 'O' }], template: 'Pre-op assessment → Surgery → Post-op monitoring → Discharge' },
  { id: 'cardiology', label: 'Cardiology', icon: '💓', color: '#EF4444', description: 'Heart diseases, cardiac diagnostics, interventions', commonCases: ['ACS', 'Heart failure', 'Arrhythmia', 'Valvular disease'], keyActions: [{ label: 'Echo', shortcut: 'E' }, { label: 'ECG', shortcut: 'G' }, { label: 'Stress test', shortcut: 'S' }], template: 'Assessment → Diagnostics → Medical management → Intervention if needed' },
  { id: 'neurology', label: 'Neurology', icon: '🧠', color: '#8B5CF6', description: 'Brain, spinal cord, peripheral nerve disorders', commonCases: ['Stroke', 'Seizure', 'Parkinson\'s', 'Neuropathy'], keyActions: [{ label: 'NIHSS', shortcut: 'N' }, { label: 'CT/MRI', shortcut: 'I' }, { label: 'LP', shortcut: 'L' }], template: 'Neurological exam → Imaging → Diagnosis → Treatment plan' },
  { id: 'pediatrics', label: 'Pediatrics', icon: '👶', color: '#10B981', description: 'Child health from birth to adolescence', commonCases: ['Respiratory infection', 'Diarrhea', 'Malaria', 'Malnutrition'], keyActions: [{ label: 'Growth chart', shortcut: 'G' }, { label: 'Immunization', shortcut: 'V' }, { label: 'FEV', shortcut: 'F' }], template: 'Age-appropriate assessment → Growth/development → Treatment → Follow-up' },
  { id: 'obstetrics_gynecology', label: 'OB/GYN', icon: '👶', color: '#EC4899', description: 'Pregnancy, childbirth, reproductive health', commonCases: ['Antenatal care', 'Labor management', 'Preeclampsia', 'Postpartum care'], keyActions: [{ label: 'Partograph', shortcut: 'P' }, { label: 'US', shortcut: 'U' }, { label: 'Fetal monitor', shortcut: 'F' }], template: 'Antenatal → Labor → Delivery → Postpartum → Newborn care' },
  { id: 'orthopedic_surgery', label: 'Orthopedics', icon: '🦴', color: '#F59E0B', description: 'Musculoskeletal system, fractures, joints', commonCases: ['Fracture fixation', 'Joint replacement', 'Spine surgery', 'Sports injury'], keyActions: [{ label: 'X-ray', shortcut: 'X' }, { label: 'Cast', shortcut: 'C' }, { label: 'ROM', shortcut: 'R' }], template: 'Fracture assessment → Reduction/Fixation → Rehabilitation → Follow-up' },
  { id: 'emergency_medicine', label: 'Emergency', icon: '🚨', color: '#DC2626', description: 'Acute care, resuscitation, trauma management', commonCases: ['Trauma', 'ACS', 'Stroke', 'Sepsis'], keyActions: [{ label: 'ATLS', shortcut: 'A' }, { label: 'Resus', shortcut: 'R' }, { label: 'FAST', shortcut: 'F' }], template: 'Triage → Primary survey → Resuscitation → Secondary survey → Disposition' },
  { id: 'internal_medicine', label: 'Internal Medicine', icon: '🩺', color: '#6366F1', description: 'Adult medical diseases, complex diagnostics', commonCases: ['Diabetes', 'Hypertension', 'Pneumonia', 'CKD'], keyActions: [{ label: 'Ward round', shortcut: 'W' }, { label: 'Review', shortcut: 'R' }, { label: 'Multidisciplinary', shortcut: 'M' }], template: 'History → Examination → Investigation → Diagnosis → Management' },
  { id: 'psychiatry', label: 'Psychiatry', icon: '🧠', color: '#A855F7', description: 'Mental health disorders, behavioral therapy', commonCases: ['Depression', 'Schizophrenia', 'Bipolar', 'Anxiety'], keyActions: [{ label: 'MSE', shortcut: 'M' }, { label: 'Risk assess', shortcut: 'R' }, { label: 'Therapy', shortcut: 'T' }], template: 'Mental state exam → Risk assessment → Diagnosis → Treatment plan' },
  { id: 'radiology', label: 'Radiology', icon: '🔬', color: '#14B8A6', description: 'Medical imaging interpretation and procedures', commonCases: ['CT interpretation', 'MRI reading', 'Ultrasound', 'X-ray reporting'], keyActions: [{ label: 'CT', shortcut: 'T' }, { label: 'MRI', shortcut: 'M' }, { label: 'US', shortcut: 'U' }], template: 'Image acquisition → Interpretation → Report → Clinical correlation' },
  { id: 'pathology', label: 'Pathology', icon: '🔬', color: '#F97316', description: 'Laboratory medicine, tissue diagnosis', commonCases: ['Histopathology', 'Cytology', 'Blood bank', 'Microbiology'], keyActions: [{ label: 'Frozen section', shortcut: 'F' }, { label: 'Culture', shortcut: 'C' }, { label: 'Crossmatch', shortcut: 'X' }], template: 'Specimen receipt → Processing → Analysis → Report → Clinical correlation' },
  { id: 'anesthesiology', label: 'Anesthesiology', icon: '💉', color: '#06B6D4', description: 'Perioperative care, pain management, critical care', commonCases: ['Pre-op assessment', 'General anesthesia', 'Regional block', 'Pain management'], keyActions: [{ label: 'Airway', shortcut: 'A' }, { label: 'Monitor', shortcut: 'M' }, { label: 'Block', shortcut: 'B' }], template: 'Pre-op assessment → Anesthesia plan → Intra-op → Recovery → Pain management' },
  { id: 'dermatology', label: 'Dermatology', icon: '🧴', color: '#84CC16', description: 'Skin diseases, allergies, dermatologic surgery', commonCases: ['Eczema', 'Psoriasis', 'Skin infection', 'Skin cancer'], keyActions: [{ label: 'Biopsy', shortcut: 'B' }, { label: 'Dermoscopy', shortcut: 'D' }, { label: 'Cryo', shortcut: 'C' }], template: 'Skin exam → Diagnosis → Topical/systemic treatment → Follow-up' },
  { id: 'ophthalmology', label: 'Ophthalmology', icon: '👁️', color: '#22C55E', description: 'Eye diseases, vision disorders, eye surgery', commonCases: ['Cataract', 'Glaucoma', 'Conjunctivitis', 'Retinopathy'], keyActions: [{ label: 'Visual acuity', shortcut: 'V' }, { label: 'Fundoscopy', shortcut: 'F' }, { label: 'Tonometry', shortcut: 'T' }], template: 'Vision assessment → Eye exam → Diagnosis → Medical/surgical treatment' },
  { id: 'ent', label: 'ENT', icon: '👂', color: '#F59E0B', description: 'Ear, nose, throat disorders', commonCases: ['Otitis media', 'Sinusitis', 'Tonsillitis', 'Hearing loss'], keyActions: [{ label: 'Otoscopy', shortcut: 'O' }, { label: 'Audiometry', shortcut: 'A' }, { label: 'Endoscopy', shortcut: 'E' }], template: 'ENT exam → Diagnostic tests → Medical/surgical treatment → Follow-up' },
  { id: 'urology', label: 'Urology', icon: '💧', color: '#3B82F6', description: 'Urinary tract and male reproductive system', commonCases: ['BPH', 'UTI', 'Kidney stones', 'Prostate cancer'], keyActions: [{ label: 'Ultrasound', shortcut: 'U' }, { label: 'Uroflow', shortcut: 'F' }, { label: 'Cystoscopy', shortcut: 'C' }], template: 'Urologic assessment → Imaging → Medical/surgical treatment → Follow-up' },
  { id: 'pulmonology', label: 'Pulmonology', icon: '🫁', color: '#14B8A6', description: 'Respiratory system diseases', commonCases: ['Asthma', 'COPD', 'Pneumonia', 'TB'], keyActions: [{ label: 'PFTs', shortcut: 'P' }, { label: 'Bronchoscopy', shortcut: 'B' }, { label: 'Chest tube', shortcut: 'T' }], template: 'Respiratory assessment → PFTs/Imaging → Diagnosis → Treatment plan' },
  { id: 'nephrology', label: 'Nephrology', icon: '🫘', color: '#8B5CF6', description: 'Kidney diseases, dialysis, transplantation', commonCases: ['CKD', 'AKI', 'Glomerulonephritis', 'Dialysis'], keyActions: [{ label: 'Renal US', shortcut: 'R' }, { label: 'Biopsy', shortcut: 'B' }, { label: 'Dialysis', shortcut: 'D' }], template: 'Renal assessment → eGFR/Urinalysis → Diagnosis → Medical/RRT management' },
  { id: 'endocrinology', label: 'Endocrinology', icon: '🫀', color: '#F97316', description: 'Hormonal and metabolic disorders', commonCases: ['Diabetes', 'Thyroid', 'Adrenal', 'Pituitary'], keyActions: [{ label: 'OGTT', shortcut: 'O' }, { label: 'Thyroid US', shortcut: 'T' }, { label: 'Hormone panel', shortcut: 'H' }], template: 'Endocrine assessment → Laboratory → Imaging → Diagnosis → Management' },
  { id: 'oncology', label: 'Oncology', icon: '🎗️', color: '#EC4899', description: 'Cancer diagnosis, chemotherapy, palliative care', commonCases: ['Solid tumors', 'Hematologic cancers', 'Palliative care', 'Chemotherapy'], keyActions: [{ label: 'Staging', shortcut: 'S' }, { label: 'Chemo plan', shortcut: 'C' }, { label: 'MDT', shortcut: 'M' }], template: 'Histologic diagnosis → Staging → MDT discussion → Treatment → Follow-up' },
  { id: 'infectious_disease', label: 'Infectious Disease', icon: '🦠', color: '#EF4444', description: 'Complex infections, antibiotic stewardship, HIV/TB', commonCases: ['HIV management', 'TB', 'Sepsis', 'Tropical diseases'], keyActions: [{ label: 'ID consult', shortcut: 'I' }, { label: 'Culture review', shortcut: 'C' }, { label: 'Antibiotic plan', shortcut: 'A' }], template: 'Source identification → Microbiology → Antimicrobial therapy → Monitoring' },
]

export default function DoctorSpecialistPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(SPECIALTIES[0].id)
  const [searchQuery, setSearchQuery] = useState('')

  const specialty = useMemo(() => SPECIALTIES.find(s => s.id === selectedSpecialty), [selectedSpecialty])

  const filteredSpecialties = useMemo(() => {
    if (!searchQuery.trim()) return SPECIALTIES
    const q = searchQuery.toLowerCase()
    return SPECIALTIES.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.commonCases.some(c => c.toLowerCase().includes(q))
    )
  }, [searchQuery])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Stethoscope size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Specialist Workspaces</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{SPECIALTIES.length} specialties</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search specialties..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Specialty list */}
        <div style={{ width: 260, background: 'var(--surface-card)', borderRight: '1px solid var(--surface-border)', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '12px 12px 0', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Specialties</div>
          {filteredSpecialties.map(s => (
            <button key={s.id} onClick={() => setSelectedSpecialty(s.id)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', textAlign: 'left',
                background: selectedSpecialty === s.id ? 'var(--sky-50)' : 'transparent',
                color: selectedSpecialty === s.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: selectedSpecialty === s.id ? 600 : 400,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-sans)', margin: '1px 6px',
                borderLeft: `3px solid ${selectedSpecialty === s.id ? s.color : 'transparent'}`,
              }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ flex: 1 }}>{s.label}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Specialty detail */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {specialty && (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${specialty.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                  {specialty.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: specialty.color }}>{specialty.label}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>{specialty.description}</p>
                </div>
              </div>

              {/* Workflow template */}
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                  <Activity size={12} style={{ display: 'inline', marginRight: 4 }} /> Clinical Workflow Template
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {specialty.template.split('→').map((step, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--sky-50)', color: 'var(--primary)', fontSize: 12, fontWeight: 500 }}>
                        {step.trim()}
                      </span>
                      {i < specialty.template.split('→').length - 1 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Common cases + Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                    <Users size={12} style={{ display: 'inline', marginRight: 4 }} /> Common Cases
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {specialty.commonCases.map((c, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--surface-elevated)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> Key Actions
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {specialty.keyActions.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'var(--surface-elevated)' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{a.label}</span>
                        <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: 'var(--sky-50)', color: 'var(--primary)', fontWeight: 600 }}>{a.shortcut}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workspace preview */}
              <div style={{ padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: `1px solid ${specialty.color}25`, borderLeft: `4px solid ${specialty.color}` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 12 }}>
                  {specialty.label} Workspace Preview
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-elevated)' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Left Pane</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>Patient list & queue</span>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-elevated)' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Center Pane</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{specialty.label} workspace</span>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-elevated)' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Right Pane</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>Specialty tools & AI</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
