'use client'

import { C } from '@/lib/colors'
import { User, Calendar, Phone, MapPin, Activity, FileText, ClipboardList, Pill, FlaskConical, Scan } from 'lucide-react'

export default function PatientDetailPage({ params }: { params: { pid: string } }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <User size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Patient Profile</span>
      </div>
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.sky + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} color={C.sky} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>John Mwangi</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span><strong>ID:</strong> {params.pid}</span>
                <span><strong>Age:</strong> 68 years</span>
                <span><strong>Gender:</strong> Male</span>
                <span><strong>Phone:</strong> +254 712 345 678</span>
                <span><strong>County:</strong> Kisii</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 11 }}>Edit</button>
              <button style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: C.sky, color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>New Encounter</button>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Clinical Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Blood Group:</strong> O+</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Allergies:</strong> Penicillin (Rash)</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Chronic Conditions:</strong> Hypertension, Type 2 DM</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Current Medications:</strong> Amlodipine 5mg, Metformin 500mg</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Next of Kin:</strong> Mary Mwangi (Spouse) · +254 723 456 789</div>
            </div>
          </div>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Recent Encounters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { type: 'OPD Consultation', date: '12 Jul 2026', dept: 'General Surgery', doctor: 'Dr. Kamau' },
                { type: 'Lab Review', date: '10 Jul 2026', dept: 'Laboratory', doctor: '' },
                { type: 'Follow-up', date: '05 Jul 2026', dept: 'Medical OPD', doctor: 'Dr. Ochieng' },
                { type: 'Ward Review', date: '28 Jun 2026', dept: 'Ward 4', doctor: 'Dr. Kamau' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 10 }}>
                  <span style={{ fontWeight: 600 }}>{e.type}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{e.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[{ icon: <FileText size={12} />, label: 'Clinical Notes' }, { icon: <Pill size={12} />, label: 'Medications' }, { icon: <FlaskConical size={12} />, label: 'Lab Results' }, { icon: <Scan size={12} />, label: 'Imaging' }, { icon: <ClipboardList size={12} />, label: 'Encounters' }, { icon: <Activity size={12} />, label: 'Vitals' }].map(b => (
              <button key={b.label} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>{b.icon} {b.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
