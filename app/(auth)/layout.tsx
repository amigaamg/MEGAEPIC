import { AuthLayout } from '@/layouts/auth'

// AMEXAN Authentication Layout
// Constitutional Principle: Auth surfaces are calm, focused, and never busy.
// Consumes the universal AuthLayout. Brand is the constitutional identity.

export default function AuthLayoutRoot({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout
      brand={
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ background: 'var(--sky-500)' }}>
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
              <path d="M5 18L11 6L17 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.5 13.5H14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AMEX<span style={{ color: 'var(--sky-500)' }}>AN</span>
          </div>
          <p className="text-xs font-medium tracking-widest uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
            Clinical Operating System
          </p>
        </div>
      }
    >
      {children}
    </AuthLayout>
  )
}
