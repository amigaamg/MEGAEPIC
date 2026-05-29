'use client';
import { useParams } from 'next/navigation';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';

export default function SettingsPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Configure clinical workspace preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="frost-card p-5 flex flex-col gap-4">
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Preferences</div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Auto-populate DDx', desc: 'Suggest differential diagnoses on encounter open' },
              { label: 'Show Protocol Alerts', desc: 'Display alert rules during charting' },
              { label: 'Enable Drug Interactions', desc: 'Check interactions on medication entry' },
              { label: 'Note Auto-save', desc: 'Auto-save clinical notes every 30s' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{item.desc}</div>
                </div>
                <label style={{ position: 'relative', width: 36, height: 20, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)', transition: 'background 0.2s',
                  }} />
                  <span style={{
                    position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: '50%',
                    background: '#64748B', transition: 'all 0.2s',
                  }} />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="frost-card p-5 flex flex-col gap-4">
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display</div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Compact Mode', desc: 'Reduce spacing in clinical views' },
              { label: 'Show Sidebar Labels', desc: 'Display text labels on navigation' },
              { label: 'High Contrast', desc: 'Increase contrast for accessibility' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{item.desc}</div>
                </div>
                <label style={{ position: 'relative', width: 36, height: 20, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)', transition: 'background 0.2s',
                  }} />
                  <span style={{
                    position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: '50%',
                    background: '#64748B', transition: 'all 0.2s',
                  }} />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="frost-card p-5">
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>About</div>
        <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
          AMEXAN Clinical Intelligence Platform v1.0.0<br />
          Built for the African Centre for Clinical Excellence
        </div>
      </div>
    </div>
  );
}
