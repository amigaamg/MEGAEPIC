'use client';
import { RegistrationProvider, useRegistration } from './RegistrationProvider';
import { RegistrationSidebar } from './RegistrationSidebar';
import { RegistrationForm } from './RegistrationForm';
import { useState } from 'react';

function RegistrationContent() {
  const { clinicalContext } = useRegistration();
  const [showJson, setShowJson] = useState(false);

  return (
    <div style={{
      display: 'flex', height: '100vh', background: '#F9FAFB',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <RegistrationSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          padding: '12px 24px', background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#2F80ED', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#FFFFFF', fontSize: 13,
              fontWeight: 700,
            }}>A</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E' }}>
              AMEXAN
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
              Clinical Registration Engine
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              padding: '4px 10px', borderRadius: 12, fontSize: 11,
              background: '#F0FFF4', color: '#27AE60', fontWeight: 600,
            }}>
              v1.0
            </span>
            <button
              onClick={() => setShowJson(!showJson)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12,
                border: '1px solid #E5E7EB', background: '#FFFFFF',
                color: '#6B7280', cursor: 'pointer',
              }}
            >
              {showJson ? 'Hide Debug' : 'Debug'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <RegistrationForm />
        </div>

        {showJson && clinicalContext && (
          <div style={{
            borderTop: '1px solid #E5E7EB', padding: 16, background: '#1A1A2E',
            maxHeight: 300, overflow: 'auto', fontSize: 11, color: '#E8F8F5',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            whiteSpace: 'pre-wrap',
          }}>
            {JSON.stringify(clinicalContext, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}

export function RegistrationPage() {
  return (
    <RegistrationProvider>
      <RegistrationContent />
    </RegistrationProvider>
  );
}
