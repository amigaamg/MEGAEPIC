'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, ArrowRight, Command } from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: string
  action: string
  shortcut?: string
  category: string
}

const DEFAULT_COMMANDS: CommandItem[] = [
  { id: 'nav-patients', label: 'Go to Patients', description: 'View all patients', icon: '👤', action: 'navigate:/patients', category: 'Navigation' },
  { id: 'nav-queue', label: 'Go to Queue', description: 'View department queue', icon: '📋', action: 'navigate:/workflow/queue', category: 'Navigation' },
  { id: 'nav-tasks', label: 'Go to Tasks', description: 'View task board', icon: '✅', action: 'navigate:/workflow/tasks', category: 'Navigation' },
  { id: 'nav-dashboard', label: 'Go to Dashboard', description: 'Return to dashboard', icon: '📊', action: 'navigate:/dashboard', category: 'Navigation' },
  { id: 'nav-admin', label: 'Go to Admin', description: 'Organization settings', icon: '⚙️', action: 'navigate:/admin/organization', category: 'Navigation' },
  { id: 'action-next', label: 'Next Patient', description: 'Advance to next patient', icon: '➡️', action: 'next_patient', category: 'Actions', shortcut: 'n' },
  { id: 'action-note', label: 'Write Note', description: 'Create clinical note', icon: '📝', action: 'write_note', category: 'Actions', shortcut: 'w' },
  { id: 'action-lab', label: 'Order Lab', description: 'Order laboratory test', icon: '🧪', action: 'order_lab', category: 'Actions', shortcut: 'l' },
  { id: 'action-prescribe', label: 'Prescribe', description: 'Write prescription', icon: '💊', action: 'prescribe', category: 'Actions', shortcut: 'p' },
  { id: 'action-refer', label: 'Refer Patient', description: 'Create referral', icon: '🔗', action: 'refer', category: 'Actions', shortcut: 'r' },
  { id: 'action-search', label: 'Search Patients', description: 'Find a patient', icon: '🔍', action: 'search_patients', category: 'Actions', shortcut: '/' },
  { id: 'action-discharge', label: 'Discharge Summary', description: 'Write discharge summary', icon: '🚪', action: 'discharge', category: 'Actions' },
  { id: 'action-handover', label: 'Handover', description: 'Start handover process', icon: '🤝', action: 'handover', category: 'Actions' },
]

interface CommandBarProps {
  onCommand: (action: string) => void
  customCommands?: CommandItem[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CommandBar({ onCommand, customCommands, open: externalOpen, onOpenChange }: CommandBarProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen
  const setIsOpen = onOpenChange ?? setInternalOpen

  const commands = customCommands ?? DEFAULT_COMMANDS

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
    setSelectedIndex(0)
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const el = listRef.current.children[selectedIndex] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  function handleSelect(item: CommandItem) {
    setIsOpen(false)
    onCommand(item.action)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      handleSelect(filtered[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '15vh',
    }} onClick={() => setIsOpen(false)}>
      <div style={{
        width: '100%', maxWidth: 560, background: 'var(--surface-card)',
        borderRadius: 16, border: '1px solid var(--surface-border)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--surface-border)', gap: 10 }}>
          <Search size={16} color="var(--text-muted)" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-sans)' }} />
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--surface-elevated)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Command size={11} />K
          </span>
        </div>

        <div ref={listRef} style={{ maxHeight: 320, overflow: 'auto', padding: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No results for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button key={item.id} onClick={() => handleSelect(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  background: idx === selectedIndex ? 'var(--sky-50)' : 'transparent',
                  color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
                  fontSize: 13, fontFamily: 'var(--font-sans)',
                }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 500, display: 'block' }}>{item.label}</span>
                  {item.description && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.description}</span>
                  )}
                </div>
                {item.shortcut && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'var(--surface-elevated)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.shortcut}</span>
                )}
                <ArrowRight size={13} color="var(--text-muted)" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
