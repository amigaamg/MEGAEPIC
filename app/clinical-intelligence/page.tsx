'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClinicalChat } from '@/components/ClinicalChat';
import { DifferentialDashboard } from '@/components/DifferentialDashboard';
import { LiveNotePreview } from '@/components/LiveNotePreview';

export default function ClinicalIntelligencePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<'chat' | 'differentials' | 'note'>('chat');

  useEffect(() => { if (!loading && !user) router.replace('/clinical-auth'); }, [user, loading, router]);
  if (loading || !user) return null;

  return (
    <div className="clinical-intel-shell" style={{
      height: '100vh', width: '100vw', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: '#f7f8fc',
    }}>
      <Header activePanel={activePanel} setActivePanel={setActivePanel} />
      {/* Desktop: 3-panel layout */}
      <div className="clinical-intel-desktop" style={{ display: 'none', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '35%', minWidth: 300, maxWidth: 450, borderRight: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <ClinicalChat />
        </div>
        <div style={{ width: '32%', minWidth: 260, maxWidth: 420, borderRight: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <DifferentialDashboard />
        </div>
        <div style={{ flex: 1, minWidth: 280, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <LiveNotePreview />
        </div>
      </div>
      {/* Tablet/Mobile: single panel with tabs */}
      <div className="clinical-intel-mobile" style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#fff' }}>
        {activePanel === 'chat' && <ClinicalChat />}
        {activePanel === 'differentials' && <DifferentialDashboard />}
        {activePanel === 'note' && <LiveNotePreview />}
      </div>
      <style>{`
        @media (min-width: 1024px) {
          .clinical-intel-desktop { display: flex !important; }
          .clinical-intel-mobile { display: none !important; }
        }
        @media (max-width: 1200px) {
          .clinical-intel-desktop > div:first-child { min-width: 260px; }
          .clinical-intel-desktop > div:nth-child(2) { min-width: 220px; }
        }
        @media (max-width: 768px) {
          .clinical-intel-shell { height: calc(100vh - 56px); }
        }
      `}</style>
    </div>
  );
}

function Header({ activePanel, setActivePanel }: {
  activePanel: string;
  setActivePanel: (p: 'chat' | 'differentials' | 'note') => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-base font-bold" style={{ color: '#2563eb' }}>AMEXAN</span>
        <span className="w-px h-4 bg-gray-200" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
          Clinical Intelligence Engine
        </span>
      </div>
      {/* Mobile/Tablet panel switcher */}
      <div className="flex lg:hidden bg-gray-100 rounded-lg p-0.5">
        {[
          { id: 'chat' as const, label: 'Interview', icon: '💬' },
          { id: 'differentials' as const, label: 'DDx', icon: '📊' },
          { id: 'note' as const, label: 'Note', icon: '📋' },
        ].map(p => (
          <button key={p.id} onClick={() => setActivePanel(p.id)}
            className={`flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md font-medium transition-colors ${
              activePanel === p.id ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <span>{p.icon}</span>
            <span className="hidden xs:inline">{p.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <a href="/" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">Home</a>
        <span className="w-px h-3 bg-gray-200" />
        <a href="/workspace" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">Clinical Workspace</a>
      </div>
    </div>
  );
}
