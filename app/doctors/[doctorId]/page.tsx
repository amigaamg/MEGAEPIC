'use client'

import { C } from '@/lib/colors'
import { User, MapPin, Star, Briefcase, GraduationCap, Phone, Mail, Award, Calendar, ChevronRight } from 'lucide-react'

export default function DoctorProfilePage({ params }: { params: { doctorId: string } }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <User size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Doctor Profile</span>
      </div>
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ padding: 24, background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.sky + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <User size={36} color={C.sky} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Dr. James Kamau</h2>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Consultant General Surgeon</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>KMPDC 5678</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 12 }}>
            <span style={{ padding: '3px 8px', borderRadius: 4, background: '#10B98115', color: '#10B981', fontSize: 10, fontWeight: 600 }}>Active</span>
            <span style={{ padding: '3px 8px', borderRadius: 4, background: C.sky + '15', color: C.sky, fontSize: 10, fontWeight: 600 }}>Verified</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} color={C.sky} /> Current Positions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>AMEXAN Demo Facility · Consultant Surgeon</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>University of Nairobi · Senior Lecturer (Part-time)</div>
            </div>
          </div>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}><GraduationCap size={14} color={C.sky} /> Qualifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>MBChB · University of Nairobi (2006)</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>MMed Surgery · University of Nairobi (2012)</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>FCS (ECSA) · COSECSA (2014)</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Specialties & Expertise</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['General Surgery', 'HPB Surgery', 'Laparoscopic Surgery', 'Trauma Surgery', 'Surgical Oncology'].map(s => (
              <span key={s} style={{ padding: '4px 10px', borderRadius: 6, background: C.sky + '15', color: C.sky, fontSize: 10, fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
