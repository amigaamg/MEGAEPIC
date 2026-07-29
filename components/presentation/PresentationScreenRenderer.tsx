'use client';

import React from 'react';
import { PresentationScreen, CardAction } from '@/lib/amexan/constitution/books/book-II-experience';
import { SectionRenderer } from './SectionRenderer';

export function PresentationScreenRenderer({ screen, onCardAction, onNavigate, className }: {
  screen: PresentationScreen;
  onCardAction?: (cardId: string, action: CardAction) => void;
  onNavigate?: (phaseId: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{screen.title}</h1>
            {screen.subtitle && <p className="text-xs text-gray-500">{screen.subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {screen.warnings.slice(0, 2).map((w) => (
              <div key={w.id} className={`text-[10px] px-2 py-1 rounded-full font-medium ${w.type === 'critical' ? 'bg-red-50 text-red-700' : w.type === 'warning' ? 'bg-amber-50 text-amber-700' : w.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                {w.message}
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${screen.progress}%` }} />
              </div>
              <span className="text-[11px] text-gray-400 font-mono">{screen.progress}%</span>
            </div>
          </div>
        </div>

        <nav className="px-4 pb-2 flex gap-1 overflow-x-auto scrollbar-none">
          {screen.navigation.map((nav) => (
            <button
              key={nav.target}
              onClick={() => nav.enabled && onNavigate?.(nav.target.split('/').pop() || '')}
              disabled={!nav.enabled}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${nav.active ? 'bg-primary text-white shadow-sm' : nav.enabled ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
            >
              {nav.label}
              {nav.completionRequired > 0 && !nav.active && (
                <span className="text-[9px] opacity-60">{nav.completionRequired}%</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {screen.sections.map((section) => (
          <SectionRenderer
            key={section.sectionId}
            section={section}
            onCardAction={onCardAction}
          />
        ))}
      </div>

      {screen.shortcuts.length > 0 && (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto">
            {screen.shortcuts.map((s) => (
              <button
                key={s.id}
                className="text-[11px] px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-600 whitespace-nowrap transition-colors flex items-center gap-1"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}