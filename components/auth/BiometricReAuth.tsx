'use client'

import { useState } from 'react'

interface Props {
  onSuccess: () => void
  onCancel?: () => void
}

export default function BiometricReAuth({ onSuccess, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleVerify() {
    setLoading(true)
    setError(null)
    try {
      if (!navigator.credentials || !navigator.credentials.get) {
        setError('Biometric authentication is not available on this device.')
        setLoading(false)
        return
      }
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: 'required',
          timeout: 60000,
        },
      } as CredentialRequestOptions)
      if (assertion) {
        onSuccess()
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Verification was cancelled.')
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--surface-card)',
        borderRadius: 16, padding: 32,
        maxWidth: 360, width: '100%',
        textAlign: 'center',
        border: '1px solid var(--surface-border)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Verify to Continue
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
          Your session expired. Use your fingerprint, face, or PIN to securely re-authenticate.
        </p>

        {error && (
          <div style={{
            padding: '8px 12px', borderRadius: 8,
            background: 'var(--red-bg)', border: '1px solid var(--red-border)',
            color: 'var(--red)', fontSize: 12, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleVerify}
            disabled={loading}
            style={{
              minHeight: 48, padding: '0 20px',
              borderRadius: 10, border: 'none',
              background: 'var(--primary)', color: 'white',
              fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Verifying...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg> Verify Identity</>
            )}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                minHeight: 40, padding: '0 16px',
                borderRadius: 10, border: '1px solid var(--surface-border)',
                background: 'transparent', color: 'var(--text-secondary)',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
