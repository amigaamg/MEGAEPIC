'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ENCOUNTER_LABELS } from '@/lib/encounterTypes';
import EncounterTypeSelector from '@/src/components/clinical/encounter-type-selector';
import { WORKSPACE_DATA } from '@/lib/workspaceData';

const MOCK_PATIENTS = [
  { id: 'P001', name: 'Amara Nwosu', gender: 'F', age: 34 },
  { id: 'P002', name: 'John Kamau', gender: 'M', age: 58 },
  { id: 'P003', name: 'Mary Wanjiku', gender: 'F', age: 42 },
  { id: 'P004', name: 'Baby Ochieng', gender: 'M', age: 2 },
  { id: 'P005', name: 'James Otieno', gender: 'M', age: 67 },
  { id: 'P006', name: 'Grace Mwangi', gender: 'F', age: 29 },
  { id: 'P007', name: 'Samuel Kiprop', gender: 'M', age: 45 },
  { id: 'P008', name: 'Faith Akinyi', gender: 'F', age: 31 },
];

export default function NewEncounterPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;

  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [department, setDepartment] = useState('');
  const [unit, setUnit] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return [];
    const q = patientSearch.toLowerCase();
    return MOCK_PATIENTS.filter(
      p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [patientSearch]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !department || !chiefComplaint.trim()) return;
    setSubmitting(true);
    const encounterId = `ENC-${String(Date.now()).slice(-6)}`;
    await new Promise(r => setTimeout(r, 300));
    router.push(`/clinical-workspace/${hospitalId}/encounters/${encounterId}`);
  };

  const typeInfo = selectedType ? ENCOUNTER_LABELS[selectedType] : null;
  const deptInfo = department ? WORKSPACE_DATA.find(d => d.key === department) : null;
  const units = deptInfo?.units ?? [];

  if (step === 'select') {
    return (
      <div className="flex flex-col gap-6 animate-fade-in max-w-5xl">
        <EncounterTypeSelector onSelect={handleTypeSelect} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setStep('select'); setSelectedType(null); }}
          style={{
            padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)', color: '#94A3B8', fontSize: 11,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          ← Back
        </button>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>
            {typeInfo?.icon} {typeInfo?.label}
          </h1>
          <p style={{ fontSize: 12, color: '#64748B' }}>Complete the intake form to start this encounter</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="frost-card p-6 flex flex-col gap-5">
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
            Patient
          </label>
          <input
            value={patientSearch}
            onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
            placeholder="Search by patient name or ID..."
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 13,
              outline: 'none', fontFamily: "'DM Sans',sans-serif",
            }}
          />
          {patientSearch && !selectedPatient && filteredPatients.length > 0 && (
            <div style={{ marginTop: 6, borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              {filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setPatientSearch(p.name); }}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', fontSize: 12, color: '#E2E8F0',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                  className="hover:bg-white/[0.03]"
                >
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#06B6D4' }}>{p.id}</span>
                  <span>{p.name}</span>
                  <span style={{ color: '#64748B', fontSize: 11 }}>{p.gender}, {p.age}y</span>
                </div>
              ))}
            </div>
          )}
          {selectedPatient && (
            <div style={{ marginTop: 6, padding: '8px 12px', borderRadius: 6, background: 'rgba(0,214,143,0.06)', border: '1px solid rgba(0,214,143,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#00D68F' }}>✓</span>
              <span style={{ fontSize: 12, color: '#E2E8F0' }}>{selectedPatient.name}</span>
              <span style={{ fontSize: 11, color: '#64748B', fontFamily: "'JetBrains Mono',monospace" }}>{selectedPatient.id}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Department
            </label>
            <select
              value={department}
              onChange={e => { setDepartment(e.target.value); setUnit(''); }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 13,
                outline: 'none', fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <option value="" style={{ background: '#1e293b' }}>Select department</option>
              {WORKSPACE_DATA.map(d => (
                <option key={d.key} value={d.key} style={{ background: '#1e293b' }}>{d.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Unit / Ward
            </label>
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              disabled={!department}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 13,
                outline: 'none', fontFamily: "'DM Sans',sans-serif",
                opacity: department ? 1 : 0.5,
              }}
            >
              <option value="" style={{ background: '#1e293b' }}>{department ? 'Select unit' : 'Select department first'}</option>
              {units.map(u => (
                <option key={u.id} value={u.id} style={{ background: '#1e293b' }}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
            Chief Complaint
          </label>
          <textarea
            value={chiefComplaint}
            onChange={e => setChiefComplaint(e.target.value)}
            placeholder="Enter the patient's chief complaint / reason for encounter..."
            rows={3}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 13,
              outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif",
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!selectedPatient || !department || !chiefComplaint.trim() || submitting}
            style={{
              padding: '10px 24px', borderRadius: 6, border: 'none',
              background: !selectedPatient || !department || !chiefComplaint.trim()
                ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(135deg,#06B6D4,#0891B2)',
              color: !selectedPatient || !department || !chiefComplaint.trim() ? '#475569' : '#fff',
              fontSize: 12, fontWeight: 600,
              cursor: !selectedPatient || !department || !chiefComplaint.trim() ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {submitting ? 'Creating...' : `Start ${typeInfo?.label ?? 'Encounter'}`}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
