'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

const OUTCOME_OPTIONS = [
  { value: 'live_birth', label: 'Live Birth' },
  { value: 'stillbirth', label: 'Stillbirth' },
  { value: 'miscarriage', label: 'Miscarriage' },
  { value: 'ectopic', label: 'Ectopic' },
  { value: 'termination', label: 'Termination' },
];

const DELIVERY_TYPE_OPTIONS = [
  { value: 'svd', label: 'SVD' },
  { value: 'c_section', label: 'C-Section' },
  { value: 'vacuum', label: 'Vacuum' },
  { value: 'forceps', label: 'Forceps' },
  { value: 'assisted_breech', label: 'Assisted Breech' },
];

export default function ObstetricHistorySection() {
  const [showPregnancyForm, setShowPregnancyForm] = useState(false);
  const [newPregnancy, setNewPregnancy] = useState({
    year: new Date().getFullYear(),
    outcome: 'live_birth' as string,
    gestationalAgeWeeks: 40,
    deliveryType: 'svd' as string,
    placeOfDelivery: '',
    complications: '',
    babyWeight: 3.0,
    babySex: 'unknown' as string,
    breastfeeding: '',
  });

  const obstetric = useHistoryStore(s => s.obstetricHistory);
  const setObstetricHistory = useHistoryStore(s => s.setObstetricHistory);
  const addObstetricPregnancy = useHistoryStore(s => s.addObstetricPregnancy);
  const setCurrentPregnancy = useHistoryStore(s => s.setCurrentPregnancy);

  const addPregnancy = () => {
    if (!newPregnancy.year) return;
    addObstetricPregnancy({
      year: newPregnancy.year,
      outcome: newPregnancy.outcome as any,
      gestationalAgeWeeks: newPregnancy.gestationalAgeWeeks,
      deliveryType: newPregnancy.deliveryType as any,
      placeOfDelivery: newPregnancy.placeOfDelivery,
      complications: newPregnancy.complications.split(',').map(s => s.trim()).filter(Boolean),
      babyWeight: newPregnancy.babyWeight,
      babySex: newPregnancy.babySex as any,
      breastfeeding: newPregnancy.breastfeeding,
    });
    setNewPregnancy({
      year: new Date().getFullYear(),
      outcome: 'live_birth',
      gestationalAgeWeeks: 40,
      deliveryType: 'svd',
      placeOfDelivery: '',
      complications: '',
      babyWeight: 3.0,
      babySex: 'unknown',
      breastfeeding: '',
    });
    setShowPregnancyForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Obstetric History</h2>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Gravida & Para</span>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Total Pregnancies</label>
            <input type="number" value={obstetric.totalPregnancies || ''} onChange={e => setObstetricHistory({ totalPregnancies: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Total Deliveries</label>
            <input type="number" value={obstetric.totalDeliveries || ''} onChange={e => setObstetricHistory({ totalDeliveries: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Live Children</label>
            <input type="number" value={obstetric.liveChildren || ''} onChange={e => setObstetricHistory({ liveChildren: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Stillbirths</label>
            <input type="number" value={obstetric.stillbirths || ''} onChange={e => setObstetricHistory({ stillbirths: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Miscarriages</label>
            <input type="number" value={obstetric.miscarriages || ''} onChange={e => setObstetricHistory({ miscarriages: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Ectopics</label>
            <input type="number" value={obstetric.ectopics || ''} onChange={e => setObstetricHistory({ ectopics: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">C-Sections</label>
            <input type="number" value={obstetric.cesareanSections || ''} onChange={e => setObstetricHistory({ cesareanSections: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
        </div>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--text-secondary)] font-medium">Pregnancy History</span>
          <button onClick={() => setShowPregnancyForm(!showPregnancyForm)}
            className="text-[10px] text-teal-400 hover:text-teal-300">
            + Add Pregnancy
          </button>
        </div>
        {obstetric.pregnancies.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {obstetric.pregnancies.map((p, i) => (
              <div key={i} className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-primary)] px-2 py-1.5 rounded border border-[var(--border)]">
                {p.year} — {p.outcome.replace('_', ' ')} @ {p.gestationalAgeWeeks}w — {p.babyWeight}kg ({p.babySex})
              </div>
            ))}
          </div>
        )}
        {showPregnancyForm && (
          <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <input type="number" placeholder="Year" value={newPregnancy.year || ''} onChange={e => setNewPregnancy({ ...newPregnancy, year: parseInt(e.target.value) || 0 })}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
            <select value={newPregnancy.outcome} onChange={e => setNewPregnancy({ ...newPregnancy, outcome: e.target.value })}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
              {OUTCOME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input type="number" placeholder="Weeks Gestation" value={newPregnancy.gestationalAgeWeeks || ''} onChange={e => setNewPregnancy({ ...newPregnancy, gestationalAgeWeeks: parseInt(e.target.value) || 0 })}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
            <select value={newPregnancy.deliveryType} onChange={e => setNewPregnancy({ ...newPregnancy, deliveryType: e.target.value })}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
              {DELIVERY_TYPE_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <input type="text" placeholder="Place of Delivery" value={newPregnancy.placeOfDelivery} onChange={e => setNewPregnancy({ ...newPregnancy, placeOfDelivery: e.target.value })}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
            <input type="text" placeholder="Complications (comma separated)" value={newPregnancy.complications} onChange={e => setNewPregnancy({ ...newPregnancy, complications: e.target.value })}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
            <input type="number" step="0.01" placeholder="Baby Weight (kg)" value={newPregnancy.babyWeight || ''} onChange={e => setNewPregnancy({ ...newPregnancy, babyWeight: parseFloat(e.target.value) || 0 })}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
            <select value={newPregnancy.babySex} onChange={e => setNewPregnancy({ ...newPregnancy, babySex: e.target.value })}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
            <input type="text" placeholder="Breastfeeding" value={newPregnancy.breastfeeding} onChange={e => setNewPregnancy({ ...newPregnancy, breastfeeding: e.target.value })}
              className="col-span-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
            <button onClick={addPregnancy} className="col-span-2 text-xs bg-teal-600 text-white py-1.5 rounded hover:bg-teal-500">
              Save Pregnancy
            </button>
          </div>
        )}
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Current Pregnancy</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Trimester</label>
            <select value={obstetric.currentPregnancy.trimester} onChange={e => setCurrentPregnancy({ trimester: e.target.value as any })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
              <option value="first">First</option>
              <option value="second">Second</option>
              <option value="third">Third</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Weeks Gestation</label>
            <input type="number" value={obstetric.currentPregnancy.weeksGestation || ''} onChange={e => setCurrentPregnancy({ weeksGestation: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Antenatal Care</label>
            <input type="text" value={obstetric.currentPregnancy.antenatalCare} onChange={e => setCurrentPregnancy({ antenatalCare: e.target.value })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Fetal Movements</label>
            <select value={obstetric.currentPregnancy.fetalMovements} onChange={e => setCurrentPregnancy({ fetalMovements: e.target.value as any })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="reduced">Reduced</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Complications</label>
            <input type="text" placeholder="Comma separated" value={obstetric.currentPregnancy.complications.join(', ')} onChange={e => setCurrentPregnancy({ complications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
