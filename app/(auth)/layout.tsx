export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(180deg, var(--midnight-900), var(--midnight-800), var(--midnight-700))",
      }}
    >
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--teal)" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M5 18L11 6L17 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.5 13.5H14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--frost-50)" }}
            >
              AMEX<span style={{ color: "var(--teal)" }}>AN</span>
            </span>
          </div>
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Clinical Intelligence Platform
          </p>
        </div>
        <div
          className="glass-card p-8"
          style={{
            background: "var(--surface-glass)",
            backdropFilter: "blur(24px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
