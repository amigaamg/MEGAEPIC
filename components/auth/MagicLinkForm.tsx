'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { sendSignInLinkToEmail } from 'firebase/auth'
import { MailCheck } from 'lucide-react'

export default function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSend() {
    if (!email.trim()) { setMessage('Please enter your email address.'); setStatus('error'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMessage('Please enter a valid email address.'); setStatus('error'); return }

    setStatus('sending')
    setMessage('')

    try {
      window.localStorage.setItem('emailForSignIn', email.trim())
      await sendSignInLinkToEmail(auth, email.trim(), {
        url: `${window.location.origin}/login?magic-link=1`,
        handleCodeInApp: true,
      })
      setStatus('sent')
      setMessage(`We sent a magic link to ${email.trim()}. Click it to sign in instantly.`)
    } catch (err: any) {
      setMessage(err.code === 'auth/too-many-requests'
        ? 'Too many requests. Please wait a moment.'
        : 'Failed to send magic link. Please try again.')
      setStatus('error')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div>
      {status === 'sent' ? (
        <div style={{
          padding: 20, borderRadius: 12,
          background: 'var(--primary-light)',
          border: '1px solid var(--sky-200)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            <MailCheck size={32} style={{ color: 'var(--primary)' }} aria-hidden="true" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Check your email
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {message}
          </p>
          <button
            onClick={() => setStatus('idle')}
            style={{
              marginTop: 16, background: 'none', border: 'none',
              color: 'var(--primary)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            Send to a different email
          </button>
        </div>
      ) : (
        <div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }} htmlFor="magic-email">
              Email address
            </label>
            <input
              id="magic-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck={false}
              className="input"
              style={{ minHeight: 48, height: 'auto', padding: '0 14px', fontSize: 16 }}
            />
          </div>

          {status === 'error' && message && (
            <div style={{
              padding: '8px 12px', borderRadius: 8, marginTop: 12,
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              color: 'var(--red)', fontSize: 12,
            }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={status === 'sending'}
            className="w-full mt-4"
            style={{
              minHeight: 48, height: 'auto', padding: '0 20px',
              borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--primary)', color: 'white',
              fontSize: 15, fontWeight: 600,
              cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              opacity: status === 'sending' ? 0.6 : 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {status === 'sending' ? (
              <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Sending...</>
            ) : (
              'Send Magic Link'
            )}
          </button>

          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
            No password needed. We&apos;ll email you a sign-in link that works instantly.
          </p>
        </div>
      )}
    </div>
  )
}
