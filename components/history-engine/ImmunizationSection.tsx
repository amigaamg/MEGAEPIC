'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

const VACCINE_KEYS: { key: string; label: string; dose: string }[] = [
  { key: 'bcg', label: 'BCG', dose: '1' },
  { key: 'opv0', label: 'OPV', dose: '0' },
  { key: 'opv1', label: 'OPV', dose: '1' },
  { key: 'opv2', label: 'OPV', dose: '2' },
  { key: 'opv3', label: 'OPV', dose: '3' },
  { key: 'ipv', label: 'IPV', dose: '1' },
  { key: 'penta1', label: 'Penta', dose: '1' },
  { key: 'penta2', label: 'Penta', dose: '2' },
  { key: 'penta3', label: 'Penta', dose: '3' },
  { key: 'pcv1', label: 'PCV', dose: '1' },
  { key: 'pcv2', label: 'PCV', dose: '2' },
  { key: 'pcv3', label: 'PCV', dose: '3' },
  { key: 'rota1', label: 'Rota', dose: '1' },
  { key: 'rota2', label: 'Rota', dose: '2' },
  { key: 'measles1', label: 'Measles', dose: '1' },
  { key: 'measles2', label: 'Measles', dose: '2' },
  { key: 'yellowFever', label: 'Yellow Fever', dose: '1' },
  { key: 'hpv', label: 'HPV', dose: '1' },
  { key: 'tetanus', label: 'Tetanus', dose: '1' },
  { key: 'covid', label: 'COVID-19', dose: '1' },
];

export default function ImmunizationSection() {
  const immunizationHistory = useHistoryStore(s => s.immunizationHistory);
  const setVaccineStatus = useHistoryStore(s => s.setVaccineStatus);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Immunization History</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--bg-card)]">
              <th className="text-left px-2 py-2 text-[var(--text-secondary)] font-medium border border-[var(--border)]">Vaccine</th>
              <th className="text-left px-2 py-2 text-[var(--text-secondary)] font-medium border border-[var(--border)]">Dose</th>
              <th className="text-center px-2 py-2 text-[var(--text-secondary)] font-medium border border-[var(--border)]">Given</th>
              <th className="text-left px-2 py-2 text-[var(--text-secondary)] font-medium border border-[var(--border)]">Age Given</th>
              <th className="text-left px-2 py-2 text-[var(--text-secondary)] font-medium border border-[var(--border)]">Date Given</th>
              <th className="text-left px-2 py-2 text-[var(--text-secondary)] font-medium border border-[var(--border)]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {VACCINE_KEYS.map(vk => {
              const vaccine = (immunizationHistory as any)[vk.key] as { vaccine: string; dose: string; given: boolean; ageGiven: string; dateGiven: string; notes: string } | undefined;
              if (!vaccine) return null;
              return (
                <tr key={vk.key} className="border border-[var(--border)] hover:bg-[var(--bg-hover)]">
                  <td className="px-2 py-1.5 text-[var(--text-primary)]">{vk.label}</td>
                  <td className="px-2 py-1.5 text-[var(--text-muted)]">{vk.dose}</td>
                  <td className="px-2 py-1.5 text-center">
                    <input type="checkbox" checked={vaccine.given} onChange={e => setVaccineStatus(vk.key, { given: e.target.checked })}
                      className="accent-teal-500" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" value={vaccine.ageGiven} onChange={e => setVaccineStatus(vk.key, { ageGiven: e.target.value })}
                      className="w-20 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-1.5 py-1 text-[11px] text-[var(--text-primary)]" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="date" value={vaccine.dateGiven} onChange={e => setVaccineStatus(vk.key, { dateGiven: e.target.value })}
                      className="w-28 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-1.5 py-1 text-[11px] text-[var(--text-primary)]" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" value={vaccine.notes} onChange={e => setVaccineStatus(vk.key, { notes: e.target.value })}
                      className="w-28 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-1.5 py-1 text-[11px] text-[var(--text-primary)]" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
          <input type="checkbox" checked={immunizationHistory.upToDate}
            onChange={e => {
              const store = useHistoryStore.getState();
              const current = store.immunizationHistory;
              useHistoryStore.setState({ immunizationHistory: { ...current, upToDate: e.target.checked } });
            }}
            className="accent-teal-500" />
          Up to Date
        </label>
      </div>
    </div>
  );
}
