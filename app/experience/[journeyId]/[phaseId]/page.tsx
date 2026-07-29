'use client';

import React from 'react';
import { usePresentationStore } from '@/lib/amexan/presentation/store';

export default function ExperiencePage({ params }: { params: { journeyId: string; phaseId: string } }) {
  const presentation = usePresentationStore((s) => s.presentation);
  const loading = usePresentationStore((s) => s.loading);
  const error = usePresentationStore((s) => s.error);
  const theme = usePresentationStore((s) => s.theme);

  const phaseId = params.phaseId === '_first' ? undefined : params.phaseId;

  React.useEffect(() => {
    const store = usePresentationStore.getState();
    if (store.journeyId !== params.journeyId) store.setJourney(params.journeyId as any);
    if (phaseId && store.phaseId !== phaseId) store.setPhase(phaseId);
  }, [params.journeyId, phaseId]);

  if (loading && !presentation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-500">Loading experience...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <div className="text-lg font-bold text-red-700 mb-2">Error</div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-300 mb-2">No Screen</div>
          <div className="text-sm text-gray-400">Initialize a patient to begin</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {theme && (
        <style>{`
          :root {
            --color-primary: ${theme.colors.primary};
            --color-secondary: ${theme.colors.secondary};
            --color-accent: ${theme.colors.accent};
            --color-background: ${theme.colors.background};
            --color-surface: ${theme.colors.surface};
            --color-text: ${theme.colors.text};
            --color-muted: ${theme.colors.muted};
            --color-border: ${theme.colors.border};
            --font-size: ${theme.typography.fontSize}px;
            --border-radius: ${theme.layout.borderRadius}px;
            --min-touch-target: ${theme.accessibility.touchTarget}px;
          }
        `}</style>
      )}
      <div className="h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
          background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-primary)' }}>
            {theme?.brand.facilityName || 'AMEXAN'}
          </span>
          <span style={{ color: 'var(--color-muted)', fontSize: 11 }}>
            {presentation.layout.navigation} · {presentation.device.viewportClass} · {presentation.device.orientation}
          </span>
        </div>
        <div className="flex-1 flex" style={{ overflow: 'hidden' }}>
          {presentation.layout.sidebar.mode === 'permanent' && (
            <aside style={{
              width: presentation.layout.sidebar.width,
              background: 'var(--color-surface)',
              borderRight: '1px solid var(--color-border)',
              overflow: 'auto',
            }}>
              {presentation.sections.map(s => (
                <div key={s.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{s.title}</div>
                  {s.cards.map(c => (
                    <div key={c.id} style={{
                      fontSize: 12, padding: '4px 0', cursor: 'pointer',
                      color: c.priority === 'critical' ? 'var(--color-critical)' : 'var(--color-text)',
                    }}>
                      {(c.content as any)?.title || c.id}
                    </div>
                  ))}
                </div>
              ))}
            </aside>
          )}
          <main style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: presentation.layout.columns > 1 ? `repeat(${presentation.layout.columns}, 1fr)` : '1fr',
              gap: 12,
            }}>
              {presentation.cards
                .filter(c => c.visibility === 'expanded' || c.visibility === 'pinned')
                .map(card => (
                  <div key={card.id} style={{
                    padding: 16, borderRadius: 'var(--border-radius)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--color-text)' }}>
                      {(card.content as any)?.title || card.id}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                      Priority: {card.priority} · Visibility: {card.visibility}
                    </div>
                  </div>
                ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
