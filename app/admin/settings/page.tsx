'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Settings, Save, Building, Bell, Shield, Palette, FileText } from 'lucide-react'

export default function OrgSettingsPage() {
  const [tab, setTab] = useState('general')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Settings size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Organization Settings</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Save size={14} /> Save Changes</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {[{ key: 'general', label: 'General', icon: <Building size={14} /> }, { key: 'branding', label: 'Branding', icon: <Palette size={14} /> }, { key: 'notifications', label: 'Notifications', icon: <Bell size={14} /> }, { key: 'security', label: 'Security', icon: <Shield size={14} /> }, { key: 'templates', label: 'Templates', icon: <FileText size={14} /> }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t.key ? C.sky : 'transparent'}`, background: 'transparent', color: tab === t.key ? C.sky : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          {tab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>General Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ l: 'Organization Name', v: 'Kisii Teaching & Referral Hospital' }, { l: 'Registration No.', v: 'KMPDC/HS/0082' }, { l: 'Type', v: 'Public Hospital' }, { l: 'County', v: 'Kisii' }, { l: 'Phone', v: '+254 712 345 678' }, { l: 'Email', v: 'info@kisii.trh.go.ke' }].map(f => (
                  <div key={f.l}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>{f.l}</div>
                    <input style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} defaultValue={f.v} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'branding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>Branding</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ l: 'Primary Color', v: '#2F80ED' }, { l: 'Secondary Color', v: '#1E3A5F' }, { l: 'Logo URL', v: '' }, { l: 'Favicon URL', v: '' }].map(f => (
                  <div key={f.l}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>{f.l}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {f.v && <div style={{ width: 24, height: 24, borderRadius: 4, background: f.v, border: '1px solid var(--surface-border)' }} />}
                      <input style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} defaultValue={f.v} placeholder={f.l} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(tab === 'notifications' || tab === 'security' || tab === 'templates') && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              <Settings size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              {tab === 'notifications' && 'Configure notification channels (SMS, Email, In-app)'}
              {tab === 'security' && 'Manage security policies, 2FA, session timeout, IP allowlist'}
              {tab === 'templates' && 'Configure document templates for discharge, referrals, certificates'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
