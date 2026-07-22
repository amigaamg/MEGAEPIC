'use client'

import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import { Baby, Heart, Activity, Shield, Users, Syringe, Brain, Link, ChevronRight, ArrowRight } from 'lucide-react'

const systems = [
  { key: 'fetal', label: 'Fetal Intelligence Center', icon: <Heart size={18} />, color: '#EC4899', desc: 'Growth, dopplers, BPP, anomalies, twins' },
  { key: 'labour-delivery', label: 'Labour & Delivery IC', icon: <Activity size={18} />, color: '#F43F5E', desc: 'Partograph, CTG, labour timeline, emergency protocols' },
  { key: 'postpartum', label: 'Postpartum IC', icon: <Users size={18} />, color: '#14B8A6', desc: 'Bleeding, involution, breastfeeding, depression' },
  { key: 'neonatal', label: 'Neonatal IC', icon: <Baby size={18} />, color: '#F97316', desc: 'APGAR, NICU, jaundice, feeding, discharge readiness' },
  { key: 'child-health', label: 'Child Health IC', icon: <Shield size={18} />, color: '#10B981', desc: 'Growth, development, nutrition, immunization, school health' },
  { key: 'vaccination', label: 'Vaccination Intelligence', icon: <Syringe size={18} />, color: '#6366F1', desc: 'Schedule, lot tracking, coverage, forecasting, adverse events' },
  { key: 'ecd', label: 'Early Childhood Development', icon: <Brain size={18} />, color: '#8B5CF6', desc: 'Motor, language, social, autism screening, school readiness' },
  { key: 'mother-baby', label: 'Mother-Baby Linked Record', icon: <Link size={18} />, color: '#0EA5E9', desc: 'Two-patient record, generational health, linked outcomes' },
]

export default function MaternalChildHub() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Baby size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Maternal & Child Health</span>
      </div>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Volume XII: Maternal & Child Health Super-System</h1><p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Women's Health ✅ · Antenatal ✅ · 8 new sub-systems below</p></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {systems.map(s => (
            <div key={s.key} onClick={() => router.push(`/maternal-child/${s.key}`)} style={{ padding: 18, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div></div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
