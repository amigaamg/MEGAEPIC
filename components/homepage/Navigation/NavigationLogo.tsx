'use client'

import Link from 'next/link'

// NavigationLogo — constitutional AMEXAN wordmark.
// Kept separate so both desktop and mobile nav share the exact same mark.

export function NavigationLogo() {
  return (
    <Link href="/" className="hp-logo" aria-label="AMEXAN — Clinical Operating System, Home">
      <div className="hp-logo-icon" aria-hidden="true">
        <span>A</span>
      </div>
      <div className="hp-logo-text">
        <span className="hp-logo-name">AMEXAN</span>
        <span className="hp-logo-sub">Clinical Operating System</span>
      </div>
    </Link>
  )
}
