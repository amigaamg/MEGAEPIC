'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { FileText, Search, Plus, Save, Eye, Check } from 'lucide-react'

export default function NewNotePage() {
  const [patientSearch, setPatientSearch] = useState('')
  const [noteType, setNoteType] = useState('progress')
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <FileText size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>New Clinical Note</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowPreview(!showPreview)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={14} /> {showPreview ? 'Edit' : 'Preview'}</button>
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Save size={14} /> Save & Sign</button>
      </div>
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Patient</div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input style={{ width: '100%', height: 36, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} placeholder="Search patient..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Note Type</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['progress', 'admission', 'discharge', 'procedure', 'consult', 'transfer'].map(t => (
                <button key={t} onClick={() => setNoteType(t)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: noteType === t ? C.sky : 'var(--surface)', color: noteType === t ? C.white : 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontWeight: noteType === t ? 600 : 400, textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          {showPreview ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Preview</div>
              <div style={{ padding: 16, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: 300 }}>{content || 'No content yet...'}</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Note Content</div>
              <textarea style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 350, fontFamily: 'inherit', lineHeight: 1.7 }} value={content} onChange={e => setContent(e.target.value)} placeholder={`Write your clinical note here...

SOAP format:

S - Subjective:
${noteType === 'progress' ? 'Patient reports...' : ''}
${noteType === 'admission' ? 'Chief complaint...' : ''}
${noteType === 'discharge' ? 'Summary of admission...' : ''}

O - Objective:
Vitals: ...
Examination: ...

A - Assessment:
...

P - Plan:
...`} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
