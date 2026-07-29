'use client';

import React from 'react';
import { PresentationProvider } from '@/lib/amexan/presentation/presentation-context';
import { usePresentationStore } from '@/lib/amexan/presentation/store';
import { ACTORS, ActorId } from '@/lib/amexan/constitution/books/book-II-experience';

function ActorSwitcher() {
  const actorId = usePresentationStore((s) => s.actorId);
  const setActor = usePresentationStore((s) => s.setActor);
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
      >
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
          {ACTORS[actorId]?.label?.charAt(0) || '?'}
        </div>
        <span className="text-gray-700">{ACTORS[actorId]?.label || actorId}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-80 overflow-y-auto">
            {Object.entries(ACTORS).map(([id, def]) => (
              <button
                key={id}
                onClick={() => { setActor(id as ActorId); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${actorId === id ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'}`}
              >
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">{def.label.charAt(0)}</div>
                {def.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  const theme = usePresentationStore((s) => s.theme);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/experience/clinical_care/_first" className="text-sm font-bold text-gray-900">
            {theme?.brand.facilityName || 'AMEXAN'}
          </a>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500">Experience Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <ActorSwitcher />
          <div className="text-xs text-gray-400">
            {theme && (
              <span style={{ color: theme.colors.primary }}>{theme.mode}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}