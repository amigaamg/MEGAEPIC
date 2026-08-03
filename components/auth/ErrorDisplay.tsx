'use client'

import { Search, KeyRound, CircleX, UserRound, Clock, WifiOff, ShieldAlert, Mail, UserX, Ban, TriangleAlert, X, type LucideIcon } from 'lucide-react'

interface Props {
  error: { code?: string; message: string }
  onDismiss?: () => void
}

const ERROR_STYLES: Record<string, { bg: string; border: string; color: string; icon: LucideIcon; recovery: string }> = {
  'auth/user-not-found': { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: Search, recovery: 'Check the email or phone you entered, or create a new account.' },
  'auth/wrong-password': { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: KeyRound, recovery: 'Reset your password or try signing in with a passkey instead.' },
  'auth/invalid-credential': { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: CircleX, recovery: 'The email or password is incorrect. Try again or reset your password.' },
  'auth/email-already-in-use': { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', icon: UserRound, recovery: 'Sign in instead, or reset your password if you forgot it.' },
  'auth/too-many-requests': { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', icon: Clock, recovery: 'Too many attempts. Please wait a few minutes before trying again.' },
  'auth/network-request-failed': { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: WifiOff, recovery: 'Check your internet connection and try again.' },
  'auth/popup-closed-by-user': { bg: 'var(--surface-elevated)', border: 'var(--surface-border)', color: 'var(--text-secondary)', icon: CircleX, recovery: 'Sign-in was cancelled. Try again when ready.' },
  'auth/weak-password': { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', icon: ShieldAlert, recovery: 'Use at least 4 characters. Mix letters and numbers for a stronger password.' },
  'auth/invalid-email': { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: Mail, recovery: 'Enter a valid email address (e.g., name@example.com).' },
  'auth/user-disabled': { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: UserX, recovery: 'This account has been disabled. Contact support for help.' },
  'auth/missing-email': { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: Mail, recovery: 'Please enter your email address to continue.' },
  'permission-denied': { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: Ban, recovery: 'You don\'t have permission to perform this action. Contact your administrator.' },
}

export default function ErrorDisplay({ error, onDismiss }: Props) {
  const cfg = error.code ? ERROR_STYLES[error.code] : undefined
  const bg = cfg?.bg || 'var(--red-bg)'
  const border = cfg?.border || 'var(--red-border)'
  const color = cfg?.color || 'var(--red)'
  const Icon = cfg?.icon || TriangleAlert
  const recovery = cfg?.recovery || 'Please try again. If the problem persists, contact support.'

  return (
    <div
      role="alert"
      style={{
        padding: '12px 16px',
        borderRadius: 10,
        background: bg,
        border: `1px solid ${border}`,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        marginBottom: 16,
      }}
    >
      <Icon size={16} style={{ lineHeight: 1.4, flexShrink: 0, marginTop: 1, color }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color, margin: '0 0 4px' }}>
          {error.message}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          {recovery}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, fontSize: 14,
            lineHeight: 1, flexShrink: 0, display: 'flex',
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
