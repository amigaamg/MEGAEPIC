'use client';
import { useParams, useRouter } from 'next/navigation';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';

const MOCK_PATIENT = {
  id: 'P001', name: 'Amara Nwosu', age: 34, sex: 'F', dob: '1992-03-15',
  bloodType: 'O+', allergies: 'Penicillin', department: 'Cardiology',
  admission: '2026-05-27', diagnosis: 'Hypertension, Stage 2',
  medications: ['Amlodipine 5mg OD', 'Lisinopril 10mg OD'],
  notes: 'Patient reports good compliance. BP well-controlled at last visit.',
};

export default function PatientChartPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;
  const patientId = params?.patientId as string;

  const p = MOCK_PATIENT;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      <div className="frost-card p-5">
        <div className="flex items-start gap-4 mb-4">
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>
            {p.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>{p.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1">
              <span style={{ fontSize: 12, color: '#64748B' }}>ID: {p.id}</span>
              <span style={{ fontSize: 12, color: '#475569' }}>·</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>{p.age}y · {p.sex}</span>
              <span style={{ fontSize: 12, color: '#475569' }}>·</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>DOB: {p.dob}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 11,
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              }}
            >
              📋 New Note
            </button>
            <button
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none',
                background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
                color: '#fff', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              }}
            >
              ➕ New Encounter
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="frost-card p-4 flex flex-col gap-3">
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vitals</div>
          {[
            { label: 'Blood Type', value: p.bloodType },
            { label: 'Allergies', value: p.allergies, warn: true },
            { label: 'Diagnosis', value: p.diagnosis },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 10, color: '#475569' }}>{item.label}</div>
              <div style={{ fontSize: 12, color: item.warn ? '#FF4560' : '#E2E8F0', fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="frost-card p-4 flex flex-col gap-3">
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medications</div>
          {p.medications.map((med, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 6,
              background: 'rgba(0,214,143,0.06)', border: '1px solid rgba(0,214,143,0.1)',
            }}>
              <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500 }}>{med}</div>
            </div>
          ))}
        </div>

        <div className="frost-card p-4 flex flex-col gap-3">
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Notes</div>
          <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{p.notes}</div>
        </div>
      </div>
    </div>
  );
}
