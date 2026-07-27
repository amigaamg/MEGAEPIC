'use client';
import { useRegistration } from './RegistrationProvider';

const STAGES = [
  { id: 'identity', label: 'Identity', icon: '📋', color: '#2F80ED' },
  { id: 'patient_context', label: 'Patient Context', icon: '👤', color: '#27AE60' },
  { id: 'encounter_context', label: 'Encounter', icon: '🏥', color: '#F39C12' },
  { id: 'clinical_context', label: 'Clinical Context', icon: '🩺', color: '#8E44AD' },
  { id: 'administrative_context', label: 'Admin', icon: '📄', color: '#E74C3C' },
  { id: 'registration_complete', label: 'Confirm', icon: '✅', color: '#1ABC9C' },
] as const;

export function RegistrationSidebar() {
  const { state, isStageActive, isStageComplete, progress } = useRegistration();

  return (
    <div style={{
      width: 260, background: '#FFFFFF', borderRight: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Registration Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${progress.percent}%`, height: '100%',
              background: 'linear-gradient(90deg, #2F80ED, #1ABC9C)',
              borderRadius: 3, transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', minWidth: 30, textAlign: 'right' }}>
            {progress.percent}%
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF' }}>
          {progress.completed}/{progress.total} stages
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {STAGES.map(stage => {
          const active = isStageActive(stage.id);
          const completed = isStageComplete(stage.id);
          const locked = state.stageStatuses[stage.id] === 'locked' ||
            (!active && !completed && !state.completedStages.includes(stage.id as any));

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                marginBottom: 2, cursor: 'default',
                background: active ? '#EBF5FB' : 'transparent',
                border: active ? '1px solid #B2D8F7' : '1px solid transparent',
                opacity: locked ? 0.4 : 1,
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
                background: completed ? stage.color : active ? '#E8F4FD' : '#F3F4F6',
                color: completed ? '#FFFFFF' : active ? stage.color : '#9CA3AF',
              }}>
                {completed ? '✓' : stage.icon}
              </div>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? '#1A1A2E' : '#4B5563',
                }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {active ? 'In progress...' : completed ? 'Complete' : locked ? 'Locked' : 'Pending'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '12px 16px', borderTop: '1px solid #E5E7EB',
        fontSize: 11, color: '#9CA3AF', textAlign: 'center',
      }}>
        Registration Engine v1.0
      </div>
    </div>
  );
}
