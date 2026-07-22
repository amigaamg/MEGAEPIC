'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Command } from 'lucide-react'
import LeftPane from './LeftPane'
import CenterPane from './CenterPane'
import RightPane from './RightPane'
import CommandBar from './CommandBar'
import { generateWorkspace, getVisiblePanes, getWorkspaceTitle, getQuickActions } from '@/lib/amexan/workspace/engine'
import type { WorkspaceSession } from '@/lib/amexan/workspace'

interface WorkspaceShellProps {
  session: WorkspaceSession
  children?: React.ReactNode
  fullWidth?: boolean
}

export default function WorkspaceShell({ session, children, fullWidth }: WorkspaceShellProps) {
  const router = useRouter()
  const [viewport, setViewport] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1200 })
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    function handleResize() {
      setViewport({ width: window.innerWidth })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const layout = generateWorkspace(session)
  const panes = getVisiblePanes(session, viewport)
  const title = getWorkspaceTitle(session.assignmentType)

  const handleCommand = useCallback((action: string) => {
    if (action.startsWith('navigate:')) {
      const path = action.slice('navigate:'.length)
      router.push(path)
    }
  }, [router])

  const handleNavigate = useCallback((path: string) => {
    router.push(path)
  }, [router])

  const handleAction = useCallback((action: string, payload?: unknown) => {
    switch (action) {
      case 'next_patient':
      case 'write_note':
      case 'order_lab':
      case 'prescribe':
        break
    }
  }, [])

  const paneProps = { session, onNavigate: handleNavigate, onAction: handleAction }

  if (fullWidth) {
    return <>{children}</>
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)' }}>
      {/* Top bar */}
      <div style={{ height: 48, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0 }}>
        <button onClick={() => setCommandOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', flex: 1, maxWidth: 300, textAlign: 'left' }}>
          <Command size={13} />
          <span>Search or type command...</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>Ctrl+K</span>
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{session.departmentName}</span>
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {getQuickActions(session.assignmentType).slice(0, 3).map(a => (
            <button key={a.action}
              style={{ height: 30, padding: '0 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {a.label}
            </button>
          ))}
          <span style={{ width: 1, height: 20, background: 'var(--surface-border)', margin: '0 4px' }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{session.identity.slice(0, 8)}</span>
        </div>
      </div>

      {/* Three-pane body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left pane */}
        {panes.left && (
          <>
            <div style={{
              width: leftCollapsed ? 0 : (layout.leftPane.width ?? 280),
              minWidth: leftCollapsed ? 0 : (layout.leftPane.minWidth ?? 240),
              borderRight: '1px solid var(--surface-border)',
              background: 'var(--surface-card)',
              overflow: 'hidden',
              transition: 'width 0.2s ease',
              flexShrink: 0,
            }}>
              {!leftCollapsed && <LeftPane {...paneProps} />}
            </div>
            <button onClick={() => setLeftCollapsed(!leftCollapsed)}
              style={{
                position: 'absolute', left: leftCollapsed ? 0 : (layout.leftPane.width ?? 280) - 12,
                top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                width: 20, height: 40, borderRadius: '0 6px 6px 0',
                border: '1px solid var(--surface-border)', borderLeft: 'none',
                background: 'var(--surface-card)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', padding: 0,
                transition: 'left 0.2s ease',
              }}>
              {leftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </>
        )}

        {/* Center pane */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', background: 'var(--surface-elevated)' }}>
          {children ?? <CenterPane {...paneProps} />}
        </div>

        {/* Right pane */}
        {panes.right && (
          <div style={{
            width: rightCollapsed ? 0 : (layout.rightPane.width ?? 280),
            minWidth: rightCollapsed ? 0 : (layout.rightPane.minWidth ?? 240),
            borderLeft: '1px solid var(--surface-border)',
            background: 'var(--surface-card)',
            overflow: 'hidden',
            transition: 'width 0.2s ease',
            flexShrink: 0,
          }}>
            {!rightCollapsed && <RightPane {...paneProps} />}
          </div>
        )}
      </div>

      <CommandBar onCommand={handleCommand} open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
