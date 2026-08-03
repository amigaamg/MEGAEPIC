'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { C } from '@/lib/colors'
import {
  MessageSquare, Users, Building2, Megaphone, Send, Paperclip,
  User, CheckCheck,
} from 'lucide-react'
import {
  createCareTeamThread,
  createAnnouncement,
  sendMessage,
  getThreads,
  getMessages,
  markRead,
  type CommunicationThread,
  type CommunicationChannel,
  type CommunicationMessage,
  type MessageSender,
} from '@/lib/amexan/communication'

const CURRENT_USER: MessageSender = {
  uid: 'me',
  name: 'Dr. James Mwangi',
  role: 'Consultant Physician',
  departmentName: 'Internal Medicine',
}

const DEMO_PARTICIPANTS: Record<string, MessageSender[]> = {
  care_team: [
    CURRENT_USER,
    { uid: 'u1', name: 'Sr. Grace Kamau', role: 'Nurse In-charge', departmentName: 'Ward 3A' },
    { uid: 'u2', name: 'Dr. Peter Ochieng', role: 'Medical Officer', departmentName: 'Internal Medicine' },
    { uid: 'u3', name: 'Dr. Ann Wanjiku', role: 'Pharmacist', departmentName: 'Pharmacy' },
  ],
}

const SEED_THREADS: { channel: CommunicationChannel; title: string; description?: string; patientId?: string }[] = [
  { channel: 'care_team', title: 'Ward 3A — John Mwangi', description: 'Review of the 68yo with community-acquired pneumonia. Plan: continue IV ceftriaxone, repeat CXR tomorrow.', patientId: 'pat_001' },
  { channel: 'care_team', title: 'Ward 3A — Grace Kamau', description: 'DKA day 2 on insulin infusion. ABG due 22:00.', patientId: 'pat_002' },
  { channel: 'care_team', title: 'Theatre list — Friday', description: '6 cases. First cut 08:00. Confirm NBM status for the 09:00 laparotomy.' },
  { channel: 'announcement', title: 'EMR Maintenance — Saturday 02:00', description: 'Scheduled maintenance. Read-only mode expected for ~30 min.' },
  { channel: 'announcement', title: 'New Meningitis Pathway', description: 'Fever + neck stiffness now auto-activates the meningitis pathway in the rule engine.' },
]

function seed(): CommunicationThread[] {
  const list: CommunicationThread[] = []
  for (const s of SEED_THREADS) {
    if (getThreads('org_ktrh', { channel: s.channel }).some(t => t.title === s.title)) continue
    const thread =
      s.channel === 'announcement'
        ? createAnnouncement({ organizationId: 'org_ktrh', title: s.title, description: s.description, sender: { uid: 'admin', name: 'IT Operations', role: 'Administrator' } })
        : createCareTeamThread({
            organizationId: 'org_ktrh',
            title: s.title,
            description: s.description,
            patientId: s.patientId,
            participants: DEMO_PARTICIPANTS.care_team,
          })
    sendMessage({
      threadId: thread.id,
      channel: s.channel,
      sender: DEMO_PARTICIPANTS.care_team[1] || CURRENT_USER,
      body: s.description || '—',
      priority: 'routine',
      organizationId: 'org_ktrh',
    })
    list.push(thread)
  }
  return getThreads('org_ktrh')
}

export default function CommunicationsPage() {
  const [threads, setThreads] = useState<CommunicationThread[]>(() => seed())
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [filter, setFilter] = useState<CommunicationChannel | 'all'>('all')
  const [draft, setDraft] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [composeTitle, setComposeTitle] = useState('')
  const [composeBody, setComposeBody] = useState('')

  const activeThread = useMemo(() => threads.find(t => t.id === activeThreadId) || null, [threads, activeThreadId])
  const [messages, setMessages] = useState<CommunicationMessage[]>([])

  const visibleThreads = useMemo(
    () => threads.filter(t => filter === 'all' || t.channel === filter),
    [threads, filter],
  )

  const openThread = (id: string) => {
    setActiveThreadId(id)
    markRead(id, CURRENT_USER.uid)
    setMessages(getMessages(id))
    setThreads(getThreads('org_ktrh'))
  }

  const handleSend = () => {
    if (!activeThread || !draft.trim()) return
    sendMessage({
      threadId: activeThread.id,
      channel: activeThread.channel,
      sender: CURRENT_USER,
      body: draft.trim(),
      priority: 'routine',
      organizationId: 'org_ktrh',
    })
    setDraft('')
    setMessages(getMessages(activeThread.id))
    setThreads(getThreads('org_ktrh'))
  }

  const handleCompose = () => {
    if (!composeTitle.trim() || !composeBody.trim()) return
    const thread = createCareTeamThread({
      organizationId: 'org_ktrh',
      title: composeTitle.trim(),
      description: composeBody.trim(),
      participants: DEMO_PARTICIPANTS.care_team,
    })
    sendMessage({
      threadId: thread.id,
      channel: 'care_team',
      sender: CURRENT_USER,
      body: composeBody.trim(),
      priority: 'routine',
      organizationId: 'org_ktrh',
    })
    setShowCompose(false)
    setComposeTitle('')
    setComposeBody('')
    setThreads(getThreads('org_ktrh'))
  }

  const FILTERS: { key: CommunicationChannel | 'all'; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <MessageSquare size={13} /> },
    { key: 'care_team', label: 'Care Team', icon: <Users size={13} /> },
    { key: 'direct', label: 'Direct', icon: <User size={13} /> },
    { key: 'organization', label: 'Organization', icon: <Building2 size={13} /> },
    { key: 'announcement', label: 'Announcements', icon: <Megaphone size={13} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <MessageSquare size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Communications</span>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>← Dashboard</Link>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, overflow: 'hidden' }}>
        {/* Thread list */}
        <aside style={{ borderRight: '1px solid var(--surface-border)', background: 'var(--surface-card)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--surface-border)' }}>
            <button onClick={() => setShowCompose(true)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Send size={13} /> New Conversation
            </button>
            <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: filter === f.key ? C.sky + '15' : 'var(--surface)', color: filter === f.key ? C.sky : 'var(--text-muted)', fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)' }}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {visibleThreads.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No conversations.</div>}
            {visibleThreads.map(t => (
              <button key={t.id} onClick={() => openThread(t.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                  border: activeThreadId === t.id ? `1px solid ${C.sky}` : '1px solid transparent',
                  background: activeThreadId === t.id ? C.sky + '0d' : 'transparent',
                  fontFamily: 'var(--font-sans)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <ChannelBadge channel={t.channel} />
                  <span style={{ fontSize: 12, fontWeight: 600, flex: 1, color: 'var(--text-primary)' }}>{t.title}</span>
                  {t.unreadCount > 0 && <span style={{ background: C.sky, color: '#fff', borderRadius: 10, fontSize: 9, padding: '1px 7px', fontWeight: 700 }}>{t.unreadCount}</span>}
                </div>
                {t.lastMessage && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                    {t.lastMessage.sender.name}: {t.lastMessage.body}
                  </div>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Message view */}
        <main style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-elevated)' }}>
          {!activeThread ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Select a conversation to view messages.
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-card)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ChannelBadge channel={activeThread.channel} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{activeThread.title}</div>
                  {activeThread.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{activeThread.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {activeThread.participants.map(p => (
                    <div key={p.uid} title={p.name} style={{ width: 26, height: 26, borderRadius: '50%', background: C.sky + '20', color: C.sky, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 30 }}>No messages yet. Start the conversation.</div>}
                {messages.map(m => {
                  const mine = m.sender.uid === CURRENT_USER.uid
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', background: mine ? C.sky : 'var(--surface-card)', color: mine ? '#fff' : 'var(--text-primary)', padding: '10px 14px', borderRadius: 12, borderTopRightRadius: mine ? 4 : 12, borderTopLeftRadius: mine ? 12 : 4, fontSize: 12, lineHeight: 1.5 }}>
                        {!mine && <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, color: C.sky }}>{m.sender.name}</div>}
                        {m.body}
                        <div style={{ fontSize: 9, opacity: 0.75, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                          {fmtTime(m.createdAt)}
                          {mine && m.status === 'read' && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ padding: 14, borderTop: '1px solid var(--surface-border)', background: 'var(--surface-card)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <button style={{ padding: 8, borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer' }}><Paperclip size={14} color="var(--text-muted)" /></button>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Type a message…"
                  rows={1}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', fontSize: 12, resize: 'none', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <button onClick={handleSend} disabled={!draft.trim()} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: draft.trim() ? C.sky : 'var(--surface-border)', color: draft.trim() ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: draft.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)' }}>
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface-card)', borderRadius: 16, padding: 24, width: 480, maxWidth: '90%', border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Send size={16} color={C.sky} />
              <span style={{ fontSize: 15, fontWeight: 700 }}>New Care Team Conversation</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setShowCompose(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>×</button>
            </div>
            <input
              value={composeTitle}
              onChange={e => setComposeTitle(e.target.value)}
              placeholder="Subject — e.g. Ward 3A handover"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', fontSize: 12, marginBottom: 12, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <textarea
              value={composeBody}
              onChange={e => setComposeBody(e.target.value)}
              placeholder="Message…"
              rows={4}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', fontSize: 12, marginBottom: 16, resize: 'none', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <button onClick={handleCompose} disabled={!composeTitle.trim() || !composeBody.trim()} style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: composeTitle.trim() && composeBody.trim() ? C.sky : 'var(--surface-border)', color: composeTitle.trim() && composeBody.trim() ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: composeTitle.trim() && composeBody.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)' }}>
              Create Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ChannelBadge({ channel }: { channel: CommunicationChannel }) {
  const map: Record<CommunicationChannel, { label: string; color: string }> = {
    care_team: { label: 'Care Team', color: '#10B981' },
    direct: { label: 'Direct', color: C.sky },
    organization: { label: 'Org', color: '#7C3AED' },
    announcement: { label: 'Announcement', color: '#F59E0B' },
    patient: { label: 'Patient', color: '#EF4444' },
  }
  const m = map[channel]
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: m.color + '18', color: m.color, flexShrink: 0, letterSpacing: 0.3, textTransform: 'uppercase' }}>{m.label}</span>
  )
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
}
