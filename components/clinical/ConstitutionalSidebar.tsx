'use client';
import React from 'react';
import { useConstitutionalStore } from '@/lib/clinical/constitutional/constitutionalStore';

interface Props {
  onNavigate?: (sectionId: string) => void;
}

export function ConstitutionalSidebar({ onNavigate }: Props) {
  const gateStates = useConstitutionalStore(s => s.gateStates);
  const activeSectionId = useConstitutionalStore(s => s.activeSectionId);
  const completedSectionIds = useConstitutionalStore(s => s.completedSectionIds);
  const setActiveSection = useConstitutionalStore(s => s.setActiveSection);
  const progress = useConstitutionalStore(s => s.progress);
  const totalRequired = useConstitutionalStore(s => s.totalRequired);
  const completedRequired = useConstitutionalStore(s => s.completedRequired);

  const sky = '#2F80ED';
  const skyLight = 'rgba(47,128,237,.12)';
  const skyBg = 'rgba(47,128,237,.08)';
  const skyBorder = 'rgba(47,128,237,.2)';

  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        CONSTITUTIONAL WORKFLOW
      </div>
      <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 8, background: skyBg, border: `1px solid ${skyBorder}` }}>
        <div style={{ fontSize: 11, color: sky, fontWeight: 600, marginBottom: 2 }}>
          Progress: {Math.round(progress * 100)}%
        </div>
        <div style={{ height: 4, background: 'rgba(47,128,237,.15)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: sky, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>
          {completedRequired}/{totalRequired} required gates completed
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {gateStates.map(gs => {
          const isActive = gs.gate.id === activeSectionId;
          const isDone = completedSectionIds.includes(gs.gate.id);
          const isLocked = gs.status === 'locked';
          const isPending = gs.status === 'pending';

          let bgColor = 'transparent';
          let textColor = '#64748B';
          let fontWeight = 400;

          if (isPending) {
            textColor = '#475569';
            bgColor = 'transparent';
          }
          if (isActive) {
            bgColor = skyLight;
            textColor = sky;
            fontWeight = 700;
          }
          if (isDone) {
            bgColor = 'rgba(47,128,237,.06)';
            textColor = sky;
            fontWeight = 600;
          }

          return (
            <button
              key={gs.gate.id}
              onClick={() => {
                if (!isPending) {
                  if (onNavigate) {
                    onNavigate(gs.gate.id);
                  } else {
                    setActiveSection(gs.gate.id);
                  }
                }
              }}
              disabled={isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                cursor: isPending ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                width: '100%',
                background: bgColor,
                color: textColor,
                fontWeight,
                fontSize: 12,
                fontFamily: "'Inter', system-ui, sans-serif",
                opacity: isPending ? 0.4 : 1,
                transition: 'all .12s',
              }}>
              <span style={{ fontSize: 13, lineHeight: 1 }}>{gs.gate.icon}</span>
              <span style={{ flex: 1 }}>{gs.gate.label}</span>
              {isDone && <span style={{ fontSize: 10, color: sky }}>✓</span>}
              {isActive && !isDone && <span style={{ fontSize: 10, color: sky }}>→</span>}
              {gs.status === 'locked' && <span style={{ fontSize: 10, color: '#94A3B8' }}>○</span>}
              {gs.status === 'pending' && <span style={{ fontSize: 10, color: '#475569' }}>—</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
