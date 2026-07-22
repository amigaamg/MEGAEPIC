'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Calendar, Clock, Users, Check, Send } from 'lucide-react'

export default function BookDemoPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Check size={32} color={C.white} /></div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>Demo Booked!</h1>
          <p style={{ fontSize: 14, color: C.text, margin: 0 }}>We'll be in touch within 24 hours to confirm your session.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.white, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 15, fontWeight: 700 }}>A</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Book a Demo</h1>
        <p style={{ fontSize: 14, color: C.text, margin: '0 0 28px', lineHeight: 1.6 }}>See AMEXAN in action. Our team will walk you through the platform tailored to your facility's needs.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4, textTransform: 'uppercase' }}>Full Name</div>
              <input required style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', color: C.text }} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4, textTransform: 'uppercase' }}>Email</div>
              <input required type="email" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', color: C.text }} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4, textTransform: 'uppercase' }}>Organization</div>
              <input required style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', color: C.text }} value={org} onChange={e => setOrg(e.target.value)} placeholder="Hospital, Clinic, or Practice Name" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4, textTransform: 'uppercase' }}>Phone</div>
              <input required style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', color: C.text }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4, textTransform: 'uppercase' }}>Preferred Date</div>
              <input required type="date" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', color: C.text }} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4, textTransform: 'uppercase' }}>Preferred Time</div>
              <input required type="time" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', color: C.text }} value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <button type="submit" style={{ marginTop: 8, padding: '12px 24px', borderRadius: 10, border: 'none', background: C.sky, color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Send size={16} /> Book Demo</button>
        </form>
      </div>
    </div>
  )
}
