'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { C } from '@/lib/colors'
import { S, NAV_ITEMS } from '@/components/landing/config'
import { ChevronDown, Menu, X, Globe } from 'lucide-react'

export default function Header({ scrolled }: { scrolled: boolean }) {
  const [megaOpen, setMegaOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const hasChildren = (item: typeof NAV_ITEMS[number]): item is typeof NAV_ITEMS[number] & { children: NonNullable<typeof NAV_ITEMS[number]['children']> } =>
    'children' in item && !!item.children

  return (
    <>
      <motion.header
        style={{
          ...S.nav,
          ...(scrolled ? S.navScroll : {}),
        }}
      >
        <div style={S.logoWrap}>
          <div style={S.logoIcon}>
            <span style={{ lineHeight: 1 }}>A</span>
          </div>
          <div>
            <div style={S.logoText}>AMEXAN</div>
            <div style={{ fontSize: 10, color: C.textLight, marginTop: -2, whiteSpace: 'nowrap' }}>Clinical Operating System</div>
          </div>
        </div>

        <nav className="h-nav-center" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
          {NAV_ITEMS.map((item) =>
            hasChildren(item) ? (
              <div
                key={item.label}
                style={{ position: 'relative' }}
                onMouseEnter={() => setMegaOpen(item.label)}
                onMouseLeave={() => setMegaOpen(null)}
              >
                <button
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: megaOpen === item.label ? C.sky : C.navy,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.skyLight }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  {item.label}
                  <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: megaOpen === item.label ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                <AnimatePresence>
                  {megaOpen === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: 12,
                        background: C.white,
                        borderRadius: 16,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                        padding: 16,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 4,
                        minWidth: 420,
                        maxWidth: 640,
                      }}
                    >
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            transition: 'background 0.15s',
                            display: 'block',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = C.skyLight }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{child.label}</span>
                            {child.badge && (
                              <span style={{
                                fontSize: 9,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: child.badge === 'New' ? 'var(--sky-500)' : child.badge === 'Core' ? 'var(--sky-500)' : 'var(--sky-600)',
                                color: C.white,
                                lineHeight: '16px',
                              }}>
                                {child.badge}
                              </span>
                            )}
                          </div>
                          {child.desc && (
                            <div style={{ fontSize: 11, color: C.textLight, lineHeight: 1.4 }}>{child.desc}</div>
                          )}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a
                key={item.label}
                href={item.href}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: C.navy,
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.skyLight; e.currentTarget.style.color = C.sky }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.navy }}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="h-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ ...S.btnOutline, padding: '8px 10px', border: 'none', background: 'transparent' }}>
            <Globe size={16} />
            <span>EN</span>
          </button>
          <a href="#" style={{ fontSize: 13, color: C.navy, fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.sky }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.navy }}
          >Log In</a>
          <a href="/register" style={S.btnPrimary}>Get Started</a>
          <a href="#" style={S.btnOutline}>Book Demo</a>
        </div>

        <button
          className="h-hamburger"
          style={{ display: 'none', padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="h-mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed',
              top: 72,
              left: 0,
              right: 0,
              bottom: 0,
              background: C.white,
              padding: 24,
              overflowY: 'auto',
              zIndex: 99,
            }}
          >
            {NAV_ITEMS.map((item) => (
              <div key={item.label} style={{ marginBottom: 8 }}>
                {hasChildren(item) ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, padding: '12px 0', borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
                      {item.label}
                    </div>
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        style={{
                          display: 'block',
                          padding: '10px 12px',
                          textDecoration: 'none',
                          borderRadius: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>{child.label}</span>
                          {child.badge && (
                            <span style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: child.badge === 'New' ? 'var(--sky-500)' : child.badge === 'Core' ? 'var(--sky-500)' : 'var(--sky-600)',
                              color: C.white,
                            }}>
                              {child.badge}
                            </span>
                          )}
                        </div>
                        {child.desc && (
                          <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{child.desc}</div>
                        )}
                      </a>
                    ))}
                  </>
                ) : (
                  <a
                    href={item.href}
                    style={{
                      display: 'block',
                      padding: '12px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: C.navy,
                      textDecoration: 'none',
                      borderRadius: 8,
                    }}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              <a href="/register" style={{ ...S.btnPrimary, justifyContent: 'center', padding: '12px 20px' }}>Get Started</a>
              <a href="#" style={{ ...S.btnOutline, justifyContent: 'center', padding: '12px 20px' }}>Book Demo</a>
              <a href="#" style={{ fontSize: 13, color: C.navy, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>Log In</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
