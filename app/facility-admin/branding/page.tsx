'use client'

import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import { ArrowLeft, Palette, Save } from 'lucide-react'

export default function BrandingPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.back()} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><ArrowLeft size={16} /></button>
        <Palette size={18} color={C.sky} />
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Branding Settings</h1>
      </div>
      <div style={{ padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Organization Name</label>
            <input defaultValue="Nairobi Teaching Hospital" style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tagline</label>
            <input defaultValue="Excellence in Patient Care" style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Primary Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input defaultValue="#2F80ED" style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'monospace', outline: 'none' }} />
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#2F80ED', border: '2px solid var(--surface-border)' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Secondary Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input defaultValue="#1A5CC7" style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'monospace', outline: 'none' }} />
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#1A5CC7', border: '2px solid var(--surface-border)' }} />
            </div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Document Header</label>
            <input defaultValue="--- Nairobi Teaching Hospital --- Confidential Patient Information ---" style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Document Footer / Disclaimer</label>
            <textarea defaultValue="This document contains confidential patient information protected by law. If you are not the intended recipient, please notify the sender and delete this document immediately." rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)', resize: 'vertical' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Signature Block</label>
            <textarea defaultValue="Electronically signed by {providerName}\n{providerTitle}\n{organizationName}\n{date}" rows={2} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)', resize: 'vertical' }} />
          </div>
        </div>
        <button style={{ marginTop: 20, padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Save size={14} /> Save Changes</button>
      </div>
    </div>
  )
}
