'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Activity, ClipboardList, FileText, HeartPulse, Pill, Scan, Microscope, Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function EMRPage() {
  const { session, user, loading } = useAuth();
  const router = useRouter();

  const sections = [
    { id: 'clinical-notes', label: 'Clinical Notes', icon: FileText, route: '/hmis/emr/notes', color: '#2F80ED' },
    { id: 'vitals', label: 'Vitals & Observations', icon: Activity, route: '/hmis/emr/vitals', color: '#10B981' },
    { id: 'diagnoses', label: 'Diagnoses', icon: AlertCircle, route: '/hmis/emr/diagnoses', color: '#EF4444' },
    { id: 'treatment-plans', label: 'Treatment Plans', icon: ClipboardList, route: '/hmis/emr/treatment-plans', color: '#8B5CF6' },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill, route: '/hmis/emr/prescriptions', color: '#0EA5E9' },
    { id: 'orders', label: 'Orders', icon: Scan, route: '/hmis/emr/orders', color: '#F59E0B' },
    { id: 'lab-results', label: 'Lab Results', icon: Microscope, route: '/hmis/emr/lab-results', color: '#14B8A6' },
    { id: 'imaging', label: 'Imaging', icon: Scan, route: '/hmis/emr/imaging', color: '#06B6D4' },
    { id: 'encounters', label: 'Encounters', icon: Calendar, route: '/hmis/emr/encounters', color: '#F97316' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Activity size={32} style={{ animation: 'spin 1s linear infinite', color: '#2F80ED' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ marginTop: 12, fontSize: 14, color: '#64748B' }}>Loading EMR...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Not signed in</p>
          <button onClick={() => router.push('/login')} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2F80ED', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif", color: '#0F172A' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ height: 64, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Stethoscope size={20} color="#2F80ED" />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>AMEXAN EMR</span>
        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 8 }}>Electronic Medical Records</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#64748B' }}>{user.email}</span>
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Electronic Medical Records</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>Clinical notes, vitals, diagnoses, treatment plans, prescriptions, and orders — all in one place.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => router.push(section.route)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                  borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(47,128,237,0.12)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${section.color}15`, color: section.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{section.label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Manage {section.label.toLowerCase()}</div>
                </div>
                <ArrowRight size={14} color="#94A3B8" />
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Active Patients', value: '0', color: '#2F80ED' },
            { label: 'Today\'s Encounters', value: '0', color: '#10B981' },
            { label: 'Pending Orders', value: '0', color: '#F59E0B' },
            { label: 'Critical Alerts', value: '0', color: '#EF4444' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color, marginTop: 4 }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}