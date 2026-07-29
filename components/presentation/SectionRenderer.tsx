'use client';

import React, { useState } from 'react';
import { PresentationSection, CardAction } from '@/lib/amexan/constitution/books/book-II-experience';
import { CardRenderer } from './CardRenderer';

export function SectionRenderer({ section, onCardAction }: {
  section: PresentationSection;
  onCardAction?: (cardId: string, action: CardAction) => void;
}) {
  const [collapsed, setCollapsed] = useState(section.collapsed);

  if (!section.cards.length) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => section.collapsible && setCollapsed(!collapsed)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-t-xl ${collapsed ? 'rounded-xl' : ''} bg-gray-50 border border-gray-100 hover:bg-gray-100/60 transition-colors`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{section.label}</span>
          {section.completion > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${section.completion}%` }} />
              </div>
              <span className="text-[10px] text-gray-400 font-mono">{section.completion}%</span>
            </div>
          )}
        </div>
        {section.collapsible && (
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1 mt-3">
          {section.cards
            .sort((a, b) => a.priority - b.priority)
            .map((card) => (
              <div key={card.cardId} className={card.minWidth === 'full' ? 'md:col-span-2' : card.minWidth === 'third' ? 'md:col-span-1' : ''}>
                <CardRenderer
                  card={card}
                  onAction={(action) => onCardAction?.(card.cardId, action)}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}