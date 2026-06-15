'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

type Tab = 'antenatal' | 'natal' | 'postnatal';

export default function BirthHistorySection() {
  const [tab, setTab] = useState<Tab>('antenatal');
  const antenatal = useHistoryStore(s => s.birthHistory.antenatal);
  const natal = useHistoryStore(s => s.birthHistory.natal);
  const postnatal = useHistoryStore(s => s.birthHistory.postnatal);
  const setAntenatalHistory = useHistoryStore(s => s.setAntenatalHistory);
  const setNatalHistory = useHistoryStore(s => s.setNatalHistory);
  const setPostnatalHistory = useHistoryStore(s => s.setPostnatalHistory);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'antenatal', label: 'Antenatal' },
    { key: 'natal', label: 'Natal' },
    { key: 'postnatal', label: 'Postnatal' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Birth History</h2>
      </div>

      <div className="flex gap-1 bg-[var(--bg-card)] rounded-lg p-1 border border-[var(--border)]">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === t.key ? 'bg-teal-500/20 text-teal-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'antenatal' && (
        <div className="space-y-3">
          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Basic Information</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Antenatal Care</label>
                <select value={antenatal.antenatalCare} onChange={e => setAntenatalHistory({ antenatalCare: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">ANC Visits</label>
                <input type="number" value={antenatal.ancVisits || ''} onChange={e => setAntenatalHistory({ ancVisits: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Place of Delivery</label>
                <input type="text" value={antenatal.placeOfDelivery} onChange={e => setAntenatalHistory({ placeOfDelivery: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Maternal Health</span>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Maternal Illness (comma separated)</label>
                <input type="text" value={antenatal.maternalIllness.join(', ')} onChange={e => setAntenatalHistory({ maternalIllness: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Medications (comma separated)</label>
                <input type="text" value={antenatal.medications.join(', ')} onChange={e => setAntenatalHistory({ medications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Complications (comma separated)</label>
                <input type="text" value={antenatal.complications.join(', ')} onChange={e => setAntenatalHistory({ complications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Ultrasounds</label>
                <input type="text" value={antenatal.ultrasounds} onChange={e => setAntenatalHistory({ ultrasounds: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">HIV Status</label>
                <select value={antenatal.hivStatus} onChange={e => setAntenatalHistory({ hivStatus: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="unknown">Unknown</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Prophylaxis & Screening</span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={antenatal.tetanusToxoid} onChange={e => setAntenatalHistory({ tetanusToxoid: e.target.checked })}
                  className="accent-teal-500" />
                Tetanus Toxoid
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={antenatal.syphilisScreen} onChange={e => setAntenatalHistory({ syphilisScreen: e.target.checked })}
                  className="accent-teal-500" />
                Syphilis Screen
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={antenatal.malariaProphylaxis} onChange={e => setAntenatalHistory({ malariaProphylaxis: e.target.checked })}
                  className="accent-teal-500" />
                Malaria Prophylaxis
              </label>
            </div>
          </div>
        </div>
      )}

      {tab === 'natal' && (
        <div className="space-y-3">
          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Delivery Details</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Place of Delivery</label>
                <input type="text" value={natal.placeOfDelivery} onChange={e => setNatalHistory({ placeOfDelivery: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Delivery Type</label>
                <select value={natal.deliveryType} onChange={e => setNatalHistory({ deliveryType: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="svd">SVD</option>
                  <option value="assisted_breach">Assisted Breech</option>
                  <option value="vacuum">Vacuum</option>
                  <option value="forceps">Forceps</option>
                  <option value="c_section_elective">C/S Elective</option>
                  <option value="c_section_emergency">C/S Emergency</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Presentation</label>
                <select value={natal.presentation} onChange={e => setNatalHistory({ presentation: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="cephalic">Cephalic</option>
                  <option value="breech">Breech</option>
                  <option value="transverse">Transverse</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Birth Weight (kg)</label>
                <input type="number" step="0.01" value={natal.birthWeight || ''} onChange={e => setNatalHistory({ birthWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Gestational Age (weeks)</label>
                <input type="number" value={natal.gestationalAgeWeeks || ''} onChange={e => setNatalHistory({ gestationalAgeWeeks: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Newborn Status</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Cry</label>
                <select value={natal.cry} onChange={e => setNatalHistory({ cry: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="immediate">Immediate</option>
                  <option value="delayed">Delayed</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Color</label>
                <select value={natal.color} onChange={e => setNatalHistory({ color: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="pink">Pink</option>
                  <option value="pale">Pale</option>
                  <option value="blue">Blue</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Resuscitation</label>
                <input type="text" value={natal.resuscitation} onChange={e => setNatalHistory({ resuscitation: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] mt-2">
              <input type="checkbox" checked={natal.cordProlapse} onChange={e => setNatalHistory({ cordProlapse: e.target.checked })}
                className="accent-teal-500" />
              Cord Prolapse
            </label>
          </div>
        </div>
      )}

      {tab === 'postnatal' && (
        <div className="space-y-3">
          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Immediate Postnatal Care</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Immediate Feeding</label>
                <select value={postnatal.immediateFeeding} onChange={e => setPostnatalHistory({ immediateFeeding: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="breastfeeding">Breastfeeding</option>
                  <option value="formula">Formula</option>
                  <option value="mixed">Mixed</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">NICU Days</label>
                <input type="number" value={postnatal.nicuDays || ''} onChange={e => setPostnatalHistory({ nicuDays: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Newborn Interventions</span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={postnatal.vitaminK} onChange={e => setPostnatalHistory({ vitaminK: e.target.checked })}
                  className="accent-teal-500" />
                Vitamin K
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={postnatal.bcgGiven} onChange={e => setPostnatalHistory({ bcgGiven: e.target.checked })}
                  className="accent-teal-500" />
                BCG Given
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={postnatal.opvGiven} onChange={e => setPostnatalHistory({ opvGiven: e.target.checked })}
                  className="accent-teal-500" />
                OPV Given
              </label>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Neonatal Complications</span>
            <div className="flex flex-wrap gap-4 mb-3">
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={postnatal.neonatalJaundice} onChange={e => setPostnatalHistory({ neonatalJaundice: e.target.checked })}
                  className="accent-teal-500" />
                Neonatal Jaundice
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={postnatal.phototherapy} onChange={e => setPostnatalHistory({ phototherapy: e.target.checked })}
                  className="accent-teal-500" />
                Phototherapy
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={postnatal.neonatalSepsis} onChange={e => setPostnatalHistory({ neonatalSepsis: e.target.checked })}
                  className="accent-teal-500" />
                Neonatal Sepsis
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                <input type="checkbox" checked={postnatal.nicuAdmission} onChange={e => setPostnatalHistory({ nicuAdmission: e.target.checked })}
                  className="accent-teal-500" />
                NICU Admission
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Meconium Passed</label>
                <select value={postnatal.meconiumPassed} onChange={e => setPostnatalHistory({ meconiumPassed: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="within_24h">Within 24h</option>
                  <option value="after_24h">After 24h</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Urine Passed</label>
                <select value={postnatal.urinePassed} onChange={e => setPostnatalHistory({ urinePassed: e.target.value as any })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  <option value="within_24h">Within 24h</option>
                  <option value="after_24h">After 24h</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
