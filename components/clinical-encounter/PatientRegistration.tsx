'use client';
import React, { useState } from 'react';
import { generateHospitalNumber } from '@/lib/amexan/domain/hospital-number';
import { registerPatient } from '@/src/services/patientService';

interface PatientInfo {
  name: string;
  age: number;
  sex: 'male' | 'female';
  hospitalNumber: string;
}

interface Props {
  onComplete: (info: PatientInfo) => void;
}

export function PatientRegistration({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Patient name is required'); return; }
    const ageNum = parseInt(age);
    if (!ageNum || ageNum < 0 || ageNum > 150) { setError('Enter a valid age (0–150)'); return; }
    if (!sex) { setError('Select sex'); return; }

    setSaving(true);
    try {
      const orgId = 'telemed-a98cf';
      const hn = await generateHospitalNumber(orgId);

      await registerPatient({
        mrn: hn,
        name: name.trim(),
        dob: Date.now() - ageNum * 365.25 * 86400 * 1000,
        sex,
        bloodGroup: '',
        allergies: [],
        medicalHistory: [],
        surgicalHistory: [],
        familyHistory: [],
        contact: '',
        address: '',
      }, orgId);

      onComplete({ name: name.trim(), age: ageNum, sex, hospitalNumber: hn });
    } catch (err: any) {
      setError(err?.message || 'Failed to register patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pr-overlay">
      <div className="pr-modal">
        <div className="pr-title">New Patient Encounter</div>
        <div className="pr-subtitle">Register patient and begin clinical workflow</div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="pr-label">Patient Name</label>
            <input
              className="pr-input" placeholder="e.g. John Kofi Mensah"
              value={name} onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="pr-label">Age (years)</label>
            <input
              className="pr-input" type="number" min={0} max={150} placeholder="e.g. 45"
              value={age} onChange={e => setAge(e.target.value)}
            />
          </div>

          <div>
            <label className="pr-label">Sex</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['male', 'female'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className={`pr-toggle ${sex === s ? 'pr-toggle-active' : ''}`}
                >
                  {s === 'male' ? '♂ Male' : '♀ Female'}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ color: '#D93025', fontSize: 13 }}>{error}</div>}

          <button
            type="submit" disabled={saving}
            className="pr-submit"
          >
            {saving ? 'Registering…' : 'Begin Clinical Encounter →'}
          </button>
        </form>

        <div className="pr-hint">
          Hospital number will be auto-generated: <strong style={{ color: '#2F80ED' }}>HN-{new Date().getFullYear()}-XXXXX</strong>
        </div>
      </div>

      <style>{`
        .pr-overlay {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.97);
          font-family: 'Inter',system-ui,sans-serif;
          padding: 16px;
        }
        .pr-modal {
          background: #FFFFFF; border: 1px solid #E2E8F0;
          border-radius: 16px; padding: 40px; width: 440px; max-width: 100%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
        }
        .pr-title { font-size: 22px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
        .pr-subtitle { font-size: 13px; color: #475569; margin-bottom: 28px; }
        .pr-submit {
          margin-top: 8px; padding: 12px 24px; border-radius: 8px; border: none;
          background: #2F80ED; color: #FFFFFF; font-size: 15px;
          font-weight: 600; cursor: pointer; width: 100%;
          opacity: ${saving ? 0.6 : 1}; transition: opacity 0.15s;
        }
        .pr-submit:hover { background: #2563EB; }
        .pr-submit:disabled { cursor: not-allowed; }
        .pr-hint { margin-top: 16px; font-size: 11px; color: #94A3B8; text-align: center; }
        .pr-label { display: block; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 6px; }
        .pr-input {
          width: 100%; padding: 10px 14px; border-radius: 8px;
          border: 1px solid #E2E8F0; background: #FFFFFF; color: #0F172A;
          font-size: 14px; outline: none; box-sizing: border-box; font-family: inherit;
        }
        .pr-input:focus { border-color: #2F80ED; box-shadow: 0 0 0 2px rgba(47,128,237,0.15); }
        .pr-toggle {
          flex: 1; padding: 10px 16px; border-radius: 8px;
          border: 1px solid #E2E8F0; background: #FFFFFF; color: #0F172A;
          font-size: 14px; font-weight: 500; cursor: pointer;
          text-transform: capitalize; transition: all 0.15s;
        }
        .pr-toggle-active {
          border-color: #2F80ED !important; background: #EFF6FF !important;
        }
        @media (max-width: 640px) {
          .pr-modal { padding: 24px 20px; border-radius: 12px; }
          .pr-title { font-size: 18px; }
          .pr-input { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
