'use client'

import { useState } from 'react'
import {
  LayoutDashboard, FileText, Route, GitFork, Heart, Boxes, ListChecks, BookOpen, FileStack,
  ScrollText, Pill, FlaskConical, Scale, Siren, GitBranch, TrendingUp, Store,
  X, ClipboardList, ChevronRight, Activity, ShieldCheck, Network
} from 'lucide-react'
import { PC, pc, StatusPill } from './ui'
import { DashboardView } from './dashboard'
import { ProtocolLibraryView, ProtocolEditorView, type EditorActions } from './library'
import { PathwaysView, AlgorithmsView, BundlesView, OrderSetsView, GuidelinesView, PoliciesView, SopsView, FormularyView, ReferenceRangesView } from './catalog'
import { AiRulesView, EscalationRulesView } from './rules'
import { SimulatorView } from './simulator'
import { VersionControlView, AnalyticsView, MarketplaceView } from './governance'
import type { Protocol } from './data'

type ViewId =
  | 'dashboard' | 'protocols' | 'pathways' | 'algorithms' | 'bundles' | 'ordersets'
  | 'guidelines' | 'sops' | 'policies' | 'formulary' | 'ranges'
  | 'airules' | 'escalation' | 'simulator' | 'versions' | 'analytics' | 'marketplace'

interface Module { id: ViewId; label: string; icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }> }

const MODULES: Module[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'protocols', label: 'Clinical Protocols', icon: FileText },
  { id: 'pathways', label: 'Clinical Pathways', icon: Route },
  { id: 'algorithms', label: 'Algorithms', icon: GitFork },
  { id: 'bundles', label: 'Care Bundles', icon: Boxes },
  { id: 'ordersets', label: 'Order Sets', icon: ListChecks },
  { id: 'guidelines', label: 'Clinical Guidelines', icon: BookOpen },
  { id: 'sops', label: 'SOP Library', icon: FileStack },
  { id: 'policies', label: 'Hospital Policies', icon: ScrollText },
  { id: 'formulary', label: 'Drug Formularies', icon: Pill },
  { id: 'ranges', label: 'Reference Ranges', icon: FlaskConical },
  { id: 'airules', label: 'AI Rules', icon: Scale },
  { id: 'escalation', label: 'Escalation Rules', icon: Siren },
  { id: 'simulator', label: 'Protocol Simulator', icon: Activity },
  { id: 'versions', label: 'Version Control', icon: GitBranch },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
]

export default function ProtocolCenter() {
  const [view, setView] = useState<ViewId>('dashboard')
  const [selected, setSelected] = useState<Protocol | null>(null)
  const [preview, setPreview] = useState<Protocol | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isEditor = view === 'protocols' && !!selected

  const actions: EditorActions = {
    onBack: () => setSelected(null),
    onSimulate: () => { setView('simulator') },
    onVersions: () => { setView('versions') },
    onPreview: (p) => setPreview(p),
  }

  const navigate = (id: ViewId) => {
    setView(id)
    if (id !== 'protocols') setSelected(null)
    setSidebarOpen(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: PC.bg, fontFamily: "'Inter','Noto Sans',system-ui,sans-serif", color: PC.ink }}>
      <style>{`
        .pc-mobile-overlay{display:none}
        .pc-menu-toggle{display:none}
        @media(max-width:900px){
          .pc-sidebar{position:fixed!important;left:0;top:0;bottom:0;z-index:40;box-shadow:0 8px 40px rgba(11,44,77,.2);transform:translateX(-100%);transition:transform .2s}
          .pc-sidebar--open{transform:translateX(0)!important}
          .pc-mobile-overlay{display:block}
          .pc-menu-toggle{display:inline-flex!important}
          .pc-main{padding:14px!important}
        }
      `}</style>

      <div style={{ height: 54, background: '#fff', borderBottom: `1px solid ${PC.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => setSidebarOpen(o => !o)} aria-label="Menu" className="pc-menu-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: PC.slate, padding: 6, touchAction: 'manipulation' }}>
          <ClipboardList size={19} />
        </button>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>AM</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: PC.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>AMEXAN · Protocol Center</div>
          <div style={{ fontSize: 9, color: PC.muted, letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 700 }}>Clinical Intelligence Engine Configuration Center</div>
        </div>
        <span style={pc.pill(PC.green, `${PC.green}18`)}>Live</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: PC.slate }}>Facility Administrator</span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 54px)', position: 'relative' }}>
        <div className={`pc-sidebar${sidebarOpen ? ' pc-sidebar--open' : ''}`} style={{ width: 232, minWidth: 232, background: '#fff', borderRight: `1px solid ${PC.border}`, padding: '12px 10px', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: PC.muted, padding: '6px 12px 8px' }}>Protocol Center</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MODULES.map(m => {
              const Icon = m.icon
              const active = isEditor ? m.id === 'protocols' : view === m.id
              return (
                <button key={m.id} onClick={() => navigate(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', background: active ? PC.skySoft : 'transparent', color: active ? PC.sky : PC.slate, fontWeight: active ? 800 : 500, fontSize: 12, touchAction: 'manipulation' }}>
                  <Icon size={15} style={{ flexShrink: 0, color: active ? PC.sky : PC.muted }} />
                  <span style={{ flex: 1 }}>{m.label}</span>
                  {active && <ChevronRight size={13} />}
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${PC.border}`, fontSize: 10, color: PC.muted, lineHeight: 1.5, padding: '0 10px' }}>
            Every protocol here is a living, executable object — not a PDF. Changes propagate hospital-wide instantly.
          </div>
        </div>
        {sidebarOpen && <div className="pc-mobile-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,46,77,.35)', zIndex: 19 }} />}

        <main className="pc-main" style={{ flex: 1, overflow: 'auto', padding: 20, background: PC.bg }}>
          {isEditor && selected
            ? <ProtocolEditorView protocol={selected} actions={actions} />
            : renderView(view, { onOpen: (p) => setSelected(p) })}
        </main>
      </div>

      {preview && <PreviewModal protocol={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}

function renderView(view: ViewId, ctx: { onOpen: (p: Protocol) => void }) {
  switch (view) {
    case 'dashboard': return <DashboardView />
    case 'protocols': return <ProtocolLibraryView onOpen={ctx.onOpen} />
    case 'pathways': return <PathwaysView />
    case 'algorithms': return <AlgorithmsView />
    case 'bundles': return <BundlesView />
    case 'ordersets': return <OrderSetsView />
    case 'guidelines': return <GuidelinesView />
    case 'sops': return <SopsView />
    case 'policies': return <PoliciesView />
    case 'formulary': return <FormularyView />
    case 'ranges': return <ReferenceRangesView />
    case 'airules': return <AiRulesView />
    case 'escalation': return <EscalationRulesView />
    case 'simulator': return <SimulatorView />
    case 'versions': return <VersionControlView />
    case 'analytics': return <AnalyticsView />
    case 'marketplace': return <MarketplaceView />
    default: return <DashboardView />
  }
}

function PreviewModal({ protocol, onClose }: { protocol: Protocol; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,20,30,.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 'min(720px,100%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 16 }}>
        <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '16px 20px', borderBottom: `1px solid ${PC.border}`, display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: PC.navy }}>{protocol.name} <span style={{ fontFamily: 'monospace', fontSize: 11, color: PC.muted }}>v{protocol.version}</span></div>
            <div style={{ fontSize: 10, color: PC.muted, marginTop: 2 }}>Preview — not published</div>
          </div>
          <StatusPill status={protocol.status} />
          <button onClick={onClose} style={{ ...pc.btn(), padding: '6px 9px' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {protocol.sections.map(s => (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: PC.sky, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.title}</div>
              {s.blocks.map((b, i) => (
                <p key={i} style={{ fontSize: 11.5, color: PC.ink, lineHeight: 1.6, margin: '0 0 8px' }}>
                  {b.text || (b.items ? b.items.join(' · ') : '')}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}