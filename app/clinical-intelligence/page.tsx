'use client';
import { useState } from 'react';
import { ClinicalChat } from '@/components/ClinicalChat';
import { DifferentialDashboard } from '@/components/DifferentialDashboard';
import { LiveNotePreview } from '@/components/LiveNotePreview';

export default function ClinicalIntelligencePage() {
  const [activePanel, setActivePanel] = useState<'chat' | 'differentials' | 'note'>('chat');

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden flex flex-col">
      <Header activePanel={activePanel} setActivePanel={setActivePanel} />
      {/* Desktop: 3-panel layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <div className="w-[35%] min-w-[340px] max-w-[450px] border-r border-gray-200 bg-white shadow-sm">
          <ClinicalChat />
        </div>
        <div className="w-[32%] min-w-[300px] max-w-[420px] border-r border-gray-200 bg-white shadow-sm">
          <DifferentialDashboard />
        </div>
        <div className="flex-1 min-w-[340px] bg-white shadow-sm">
          <LiveNotePreview />
        </div>
      </div>
      {/* Tablet/Mobile: single panel with tabs */}
      <div className="flex lg:hidden flex-1 overflow-hidden bg-white">
        {activePanel === 'chat' && <ClinicalChat />}
        {activePanel === 'differentials' && <DifferentialDashboard />}
        {activePanel === 'note' && <LiveNotePreview />}
      </div>
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
        <a href="/consultation/respiratory" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">Full Form</a>
      </div>
    </div>
  );
}
