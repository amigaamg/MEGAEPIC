'use client';
import React, { useState } from 'react';
import { RoleManager } from '@/src/components/settings/RoleManager';

type SettingsTab = 'preferences' | 'roles';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('preferences');

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'preferences', label: 'Preferences', icon: '⚙️' },
    { key: 'roles', label: 'Roles & Permissions', icon: '🔐' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Configure clinical workspace preferences and access control</p>
      </div>

      <div className="flex gap-1.5 pb-2 border-b overflow-x-auto" style={{ borderColor: 'var(--surface-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors"
            style={{
              background: activeTab === tab.key ? 'var(--sky-50)' : 'transparent',
              color: activeTab === tab.key ? 'var(--sky-700)' : 'var(--text-secondary)',
              border: activeTab === tab.key ? '1px solid var(--sky-200)' : '1px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Clinical Preferences</div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Auto-populate DDx', desc: 'Suggest differential diagnoses on encounter open' },
                { label: 'Show Protocol Alerts', desc: 'Display alert rules during charting' },
                { label: 'Enable Drug Interactions', desc: 'Check interactions on medication entry' },
                { label: 'Note Auto-save', desc: 'Auto-save clinical notes every 30s' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                      style={{ background: 'var(--sky-200)' }}>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Display</div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Compact Mode', desc: 'Reduce spacing in clinical views' },
                { label: 'Show Sidebar Labels', desc: 'Display text labels on navigation' },
                { label: 'High Contrast', desc: 'Increase contrast for accessibility' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                      style={{ background: 'var(--sky-200)' }}>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 md:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>About</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              AMEXAN Clinical Intelligence Platform v1.0.0<br />
              Built for the African Centre for Clinical Excellence<br />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sky Blue + White · Inter Font · Universal Architecture</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <RoleManager />
      )}
    </div>
  );
}
