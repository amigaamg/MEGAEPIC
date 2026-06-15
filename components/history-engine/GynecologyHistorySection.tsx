'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

type Tab = 'menstrual' | 'contraception' | 'other';

export default function GynecologyHistorySection() {
  const [tab, setTab] = useState<Tab>('menstrual');
  const gynecologic = useHistoryStore(s => s.gynecologicHistory);
  const setMenstrualHistory = useHistoryStore(s => s.setMenstrualHistory);
  const setContraceptionHistory = useHistoryStore(s => s.setContraceptionHistory);
  const setGynecologicHistory = useHistoryStore(s => s.setGynecologicHistory);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'menstrual', label: 'Menstrual' },
    { key: 'contraception', label: 'Contraception' },
    { key: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Gynecology History</h2>
      </div>

      <div className="flex gap-1 bg-[var(--bg-card)] rounded-lg p-1 border border-[var(--border)]">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === t.key ? 'bg-teal-500/20 text-teal-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'menstrual' && (
        <div className="space-y-3">
          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Menstrual History</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Menarche (age)</label>
                <input type="number" value={gynecologic.menstrual.menarche || ''} onChange={e => setMenstrualHistory({ menarche: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Cycle Length (days)</label>
                <input type="number" value={gynecologic.menstrual.cycleLength || ''} onChange={e => setMenstrualHistory({ cycleLength: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Duration (days)</label>
                <input type="number" value={gynecologic.menstrual.duration || ''} onChange={e => setMenstrualHistory({ duration: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Regularity</label>
                <select value={gynecologic.menstrual.regularity} onChange={e => setMenstrualHistory({ regularity: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="regular">Regular</option>
                  <option value="irregular">Irregular</option>
                  <option value="amenorrhea">Amenorrhea</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Flow</label>
                <select value={gynecologic.menstrual.flow} onChange={e => setMenstrualHistory({ flow: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Dysmenorrhea</label>
                <select value={gynecologic.menstrual.dysmenorrhea} onChange={e => setMenstrualHistory({ dysmenorrhea: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="none">None</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">LMP</label>
                <input type="date" value={gynecologic.menstrual.lmp} onChange={e => setMenstrualHistory({ lmp: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Menopause Age</label>
                <input type="number" value={gynecologic.menstrual.menopauseAge ?? ''} onChange={e => setMenstrualHistory({ menopauseAge: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={gynecologic.menstrual.intermenstrualBleeding} onChange={e => setMenstrualHistory({ intermenstrualBleeding: e.target.checked })} className="accent-teal-500" />
                Intermenstrual Bleeding
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={gynecologic.menstrual.postcoitalBleeding} onChange={e => setMenstrualHistory({ postcoitalBleeding: e.target.checked })} className="accent-teal-500" />
                Postcoital Bleeding
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={gynecologic.menstrual.postmenopausalBleeding} onChange={e => setMenstrualHistory({ postmenopausalBleeding: e.target.checked })} className="accent-teal-500" />
                Postmenopausal Bleeding
              </label>
            </div>
          </div>
        </div>
      )}

      {tab === 'contraception' && (
        <div className="space-y-3">
          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Contraception History</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Current Method</label>
                <select value={gynecologic.contraception.currentMethod} onChange={e => setContraceptionHistory({ currentMethod: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="none">None</option>
                  <option value="pill">Pill</option>
                  <option value="iud">IUD</option>
                  <option value="implant">Implant</option>
                  <option value="injection">Injection</option>
                  <option value="condom">Condom</option>
                  <option value="sterilization">Sterilization</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Duration</label>
                <input type="text" value={gynecologic.contraception.duration} onChange={e => setContraceptionHistory({ duration: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Compliance</label>
                <select value={gynecologic.contraception.compliance} onChange={e => setContraceptionHistory({ compliance: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Side Effects</label>
                <input type="text" value={gynecologic.contraception.sideEffects} onChange={e => setContraceptionHistory({ sideEffects: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Previous Methods</label>
                <input type="text" value={gynecologic.contraception.previousMethods.join(', ')} onChange={e => setContraceptionHistory({ previousMethods: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'other' && (
        <div className="space-y-3">
          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Gynecologic History</span>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Pap Smears</label>
                <textarea value={gynecologic.papSmears} onChange={e => setGynecologicHistory({ papSmears: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] min-h-[50px]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">STD History (comma separated)</label>
                <input type="text" value={gynecologic.stdHistory.join(', ')} onChange={e => setGynecologicHistory({ stdHistory: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Gynecologic Surgery (comma separated)</label>
                <input type="text" value={gynecologic.gynecologicSurgery.join(', ')} onChange={e => setGynecologicHistory({ gynecologicSurgery: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Fertility Concerns</label>
                <textarea value={gynecologic.fertilityConcerns} onChange={e => setGynecologicHistory({ fertilityConcerns: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] min-h-[50px]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Breast Symptoms</label>
                <textarea value={gynecologic.breastSymptoms} onChange={e => setGynecologicHistory({ breastSymptoms: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] min-h-[50px]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
