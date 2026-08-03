'use client'
import { Shield, FileText, Users, Lock, Database, Server, WifiOff } from 'lucide-react'

const SECURITY_ITEMS = [
  { icon: <Shield size={13} />, label: 'End-to-End Encryption' },
  { icon: <FileText size={13} />, label: 'Audit Logging' },
  { icon: <Users size={13} />, label: 'Role-Based Access' },
  { icon: <Lock size={13} />, label: 'Patient Privacy' },
  { icon: <Database size={13} />, label: 'Data Integrity' },
  { icon: <Server size={13} />, label: 'High Availability' },
  { icon: <WifiOff size={13} />, label: 'Offline First' },
]

const STANDARDS = ['HL7 FHIR R4', 'SNOMED CT', 'LOINC', 'DICOM', 'ICD-11', 'WHO Guidelines', 'HIPAA', 'GDPR', 'SOC 2']

// Phase 4F — Security & International Standards.
export default function StandardsSection() {
  return (
    <section className="hp-section-dark" id="security-standards">
      <div className="hp-title-wrap">
        <div className="hp-tag-dark">SECURITY & STANDARDS</div>
        <h2 className="hp-h2-dark">Healthcare-Grade. Every Layer.</h2>
        <p className="hp-sub-dark" style={{ maxWidth: 600, margin: '0 auto' }}>Encrypted. Audited. Compliant. Offline-capable. Interoperability is not an afterthought—it is the foundation.</p>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="hp-flex" style={{ gap: 8, justifyContent: 'center' }}>
          {SECURITY_ITEMS.map((item) => (
            <span key={item.label} className="pill-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{item.icon} {item.label}</span>
          ))}
        </div>
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {STANDARDS.map((s) => (
            <span key={s} style={{ padding: '4px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>{s}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
