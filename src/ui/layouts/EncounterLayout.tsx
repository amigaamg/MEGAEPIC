'use client';
import { useState, useMemo } from 'react';
import { ENCOUNTER_PHASES, WORKSPACE_PHASES, type EncounterType, type DocumentEvent, type AIInsight, type UserRole, ROLE_WORKSPACES } from '@/lib/encounterTypes';
import { Timeline } from './Timeline';
import { IntelligencePanel } from './IntelligencePanel';

const CSS = `
  .enc-layout{display:grid;grid-template-columns:220px 1fr 280px;height:100vh;overflow:hidden;background:#070B14}
  .enc-sidebar{background:rgba(15,23,32,.8);border-right:1px solid rgba(255,255,255,.04);overflow-y:auto;display:flex;flex-direction:column}
  .enc-sidebar-header{padding:16px 16px 12px;border-bottom:1px solid rgba(255,255,255,.04);flex-shrink:0}
  .enc-sidebar-title{font-size:.75rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px}
  .enc-sidebar-sub{font-size:.625rem;color:#334155}
  .enc-phases{flex:1;overflow-y:auto;padding:8px 0}
  .enc-phase{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:all .15s;border-left:2px solid transparent;font-size:.8125rem;color:#64748B}
  .enc-phase:hover{background:rgba(255,255,255,.03);color:#94A3B8}
  .enc-phase.active{border-left-color:#06B6D4;background:rgba(6,182,212,.06);color:#E2E8F0;font-weight:500}
  .enc-phase.completed{color:#475569}
  .enc-phase.completed .phase-icon{opacity:.4}
  .enc-phase.completed::after{content:'✓';margin-left:auto;font-size:.625rem;color:#10B981}
  .enc-phase.disabled{opacity:.3;cursor:not-allowed}
  .enc-phase .phase-icon{font-size:.875rem;flex-shrink:0;width:20px;text-align:center}
  .enc-phase .phase-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

  .enc-main{display:flex;flex-direction:column;overflow:hidden}
  .enc-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid rgba(255,255,255,.04);background:rgba(15,23,32,.6);flex-shrink:0;min-height:52px}
  .enc-topbar-left{display:flex;align-items:center;gap:12px}
  .enc-topbar-back{display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,.06);background:transparent;color:#64748B;font-size:.75rem;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;text-decoration:none}
  .enc-topbar-back:hover{background:rgba(255,255,255,.04);color:#E2E8F0}
  .enc-topbar-title{font-size:.875rem;font-weight:600;color:#E2E8F0}
  .enc-topbar-badge{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:100px;font-size:.625rem;font-weight:500;background:rgba(6,182,212,.1);color:#06B6D4;border:1px solid rgba(6,182,212,.2)}
  .enc-topbar-right{display:flex;align-items:center;gap:8px}
  .enc-topbar-btn{display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.06);background:transparent;color:#94A3B8;font-size:.75rem;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif}
  .enc-topbar-btn:hover{background:rgba(255,255,255,.04);color:#E2E8F0}
  .enc-topbar-btn.primary{background:#06B6D4;color:#070B14;border-color:#06B6D4;font-weight:600}
  .enc-topbar-btn.primary:hover{background:#22D3EE}

  .enc-content{flex:1;overflow-y:auto;padding:24px}
  .enc-content-inner{max-width:860px;margin:0 auto}

  .enc-right{background:rgba(15,23,32,.8);border-left:1px solid rgba(255,255,255,.04);overflow-y:auto;display:flex;flex-direction:column}

  @media(max-width:1200px){
    .enc-layout{grid-template-columns:200px 1fr 240px}
  }
  @media(max-width:900px){
    .enc-layout{grid-template-columns:1fr}
    .enc-sidebar{display:none}
    .enc-right{display:none}
  }
`;

interface EncounterLayoutProps {
  encounterType: EncounterType;
  departmentLabel: string;
  departmentColor: string;
  unitLabel: string;
  patientName?: string;
  userRole?: UserRole;
  activePhase: string;
  onPhaseChange: (phaseId: string) => void;
  completedPhases: string[];
  events: DocumentEvent[];
  insights: AIInsight[];
  onBack: () => void;
  isLive?: boolean;
  children: React.ReactNode;
}

export function EncounterLayout({
  encounterType,
  departmentLabel,
  departmentColor,
  unitLabel,
  patientName = 'Unnamed Patient',
  userRole = 'doctor',
  activePhase,
  onPhaseChange,
  completedPhases,
  events,
  insights,
  onBack,
  isLive,
  children,
}: EncounterLayoutProps) {
  const [showTimeline, setShowTimeline] = useState(false);

  const phases = useMemo(() => {
    const encounterPhaseIds = ENCOUNTER_PHASES[encounterType] || [];
    const rolePhases = ROLE_WORKSPACES[userRole] || [];
    return encounterPhaseIds.filter(id => rolePhases.includes(id)).map(id => {
      const def = WORKSPACE_PHASES.find(p => p.id === id);
      return { id, label: def?.label || id, icon: def?.icon || '📄', description: def?.description || '' };
    });
  }, [encounterType, userRole]);

  const currentIdx = phases.findIndex(p => p.id === activePhase);

  return (
    <>
      <style>{CSS}</style>
      <div className="enc-layout">
        {/* LEFT SIDEBAR — Phases */}
        <aside className="enc-sidebar">
          <div className="enc-sidebar-header">
            <div className="enc-sidebar-title" style={{ color: departmentColor }}>{departmentLabel}</div>
            <div className="enc-sidebar-sub">{unitLabel} · {encounterType.replace(/_/g, ' ')}</div>
          </div>
          <div className="enc-phases">
            {phases.map((phase, i) => {
              const isCompleted = completedPhases.includes(phase.id);
              const isActive = phase.id === activePhase;
              const isDisabled = i > currentIdx && !isCompleted && !isActive;
              return (
                <div key={phase.id}
                  className={`enc-phase${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}${isDisabled ? ' disabled' : ''}`}
                  onClick={() => !isDisabled && onPhaseChange(phase.id)}
                  title={phase.description}>
                  <span className="phase-icon">{phase.icon}</span>
                  <span className="phase-label">{phase.label}</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER — Content */}
        <main className="enc-main">
          <div className="enc-topbar">
            <div className="enc-topbar-left">
              <button className="enc-topbar-back" onClick={onBack}>← Back</button>
              <span className="enc-topbar-title">{patientName}</span>
              <span className="enc-topbar-badge">{encounterType.replace(/_/g, ' ')}</span>
            </div>
            <div className="enc-topbar-right">
              <button className="enc-topbar-btn" onClick={() => setShowTimeline(!showTimeline)}>
                🕐 {showTimeline ? 'Hide' : 'Show'} Timeline
              </button>
              {isLive && <span className="enc-topbar-badge" style={{ background: 'rgba(16,185,129,.1)', color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>● Live</span>}
              <button className="enc-topbar-btn">💬 Team</button>
              <button className="enc-topbar-btn primary">Complete Phase</button>
            </div>
          </div>

          {showTimeline && (
            <div style={{ borderBottom: '1px solid rgba(255,255,255,.04)', padding: '16px 24px', maxHeight: 200, overflowY: 'auto', background: 'rgba(15,23,32,.4)' }}>
              <Timeline events={events} />
            </div>
          )}

          <div className="enc-content">
            <div className="enc-content-inner">
              {children}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR — Intelligence */}
        <aside className="enc-right">
          <IntelligencePanel insights={insights} departmentColor={departmentColor} />
        </aside>
      </div>
    </>
  );
}
