'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '../../state/uiStore';
import { usePatientStore } from '../../state/patientStore';
import { useTheme } from '../themes/ThemeProvider';
import { Sidebar, PHASES } from './Sidebar';
import { Button } from '../components/ui/Button';
import { THEMES } from '../themes/themes.config';
import { getSeverity } from '../../engine/inference/scorer';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const sidebarOpen = useUIStore(s => s.sidebarOpen);
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen);
  const phaseIdx = useUIStore(s => s.phaseIdx);
  const setPhaseIdx = useUIStore(s => s.setPhaseIdx);
  const addDonePhase = useUIStore(s => s.addDonePhase);
  const clearDonePhases = useUIStore(s => s.clearDonePhases);
  const isMobile = useUIStore(s => s.isMobile);
  const setIsMobile = useUIStore(s => s.setIsMobile);
  const themeId = useUIStore(s => s.themeId);
  const setThemeId = useUIStore(s => s.setThemeId);
  const form = usePatientStore(s => s.form);
  const resetForm = usePatientStore(s => s.reset);

  const severity = getSeverity(form);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobile = 'matches' in e ? e.matches : window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handler(mq);
    mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
  }, [setIsMobile, setSidebarOpen]);

  const goNext = () => {
    addDonePhase(PHASES[phaseIdx].id);
    setPhaseIdx(Math.min(PHASES.length - 1, phaseIdx + 1));
  };
  const goPrev = () => setPhaseIdx(Math.max(0, phaseIdx - 1));
  const handleReset = () => {
    if (window.confirm('Clear all data and start over?')) {
      resetForm();
      clearDonePhases();
      setPhaseIdx(0);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.colors.bg, overflow: 'hidden', fontFamily: theme.typography.font, color: theme.colors.text }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.colors.border}`, background: theme.colors.header, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <Button variant="ghost" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</Button>
            )}
            <div style={{ fontSize: 12, color: theme.colors.textSub }}>
              <span style={{ fontWeight: 700, color: theme.colors.text }}>AMEXAN</span>
              <span style={{ marginLeft: 8, color: theme.colors.textMuted }}>Step {phaseIdx + 1}/{PHASES.length}</span>
              {severity && (
                <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: severity.bg, color: severity.color }}>
                  {severity.level}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {Object.values(THEMES).slice(0, 6).map(th => (
              <button key={th.id} onClick={() => setThemeId(th.id)} title={th.name} style={{
                width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                border: `2px solid ${themeId === th.id ? theme.colors.accent : theme.colors.border}`,
                background: th.colors.bg,
                transition: 'transform 0.15s, border-color 0.15s',
                transform: themeId === th.id ? 'scale(1.15)' : 'scale(1)',
              }} />
            ))}
            <Button variant="secondary" onClick={() => useUIStore.getState().setShowRef(true)}>📚 Ref</Button>
            <Button variant="danger" onClick={() => useUIStore.getState().setShowDoses(true)}>💊 Doses</Button>
            <Button variant="secondary" onClick={handleReset}>↺ Reset</Button>
            <Button variant="secondary" disabled={phaseIdx === 0} onClick={goPrev}>← Back</Button>
            <Button variant="primary" onClick={goNext}>
              {phaseIdx === PHASES.length - 2 ? '✨Note' : phaseIdx === PHASES.length - 1 ? '✓ Done' : 'Next →'}
            </Button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', maxWidth: 960, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: isMobile ? '14px 12px' : '24px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
