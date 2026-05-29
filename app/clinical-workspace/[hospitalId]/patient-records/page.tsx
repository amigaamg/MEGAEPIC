'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SearchBar from '@/src/components/shared/search-bar';

const MOCK_PATIENTS = [
  { id: 'P001', name: 'Amara Nwosu', age: 34, sex: 'F', department: 'Cardiology', admission: '2026-05-27', status: 'active' },
  { id: 'P002', name: 'John Kamau', age: 52, sex: 'M', department: 'Internal Medicine', admission: '2026-05-26', status: 'active' },
  { id: 'P003', name: 'Mary Wanjiku', age: 28, sex: 'F', department: 'OB/GYN', admission: '2026-05-25', status: 'active' },
  { id: 'P004', name: 'Baby Ochieng', age: 0.1, sex: 'M', department: 'Neonatology', admission: '2026-05-28', status: 'active' },
  { id: 'P005', name: 'Samuel Ochieng', age: 45, sex: 'M', department: 'Surgery', admission: '2026-05-24', status: 'discharged' },
  { id: 'P006', name: 'Grace Mwangi', age: 31, sex: 'F', department: 'Endocrinology', admission: '2026-05-23', status: 'active' },
  { id: 'P007', name: 'Fatima Hassan', age: 67, sex: 'F', department: 'Geriatrics', admission: '2026-05-22', status: 'active' },
  { id: 'P008', name: 'Kwame Osei', age: 8, sex: 'M', department: 'Paediatrics', admission: '2026-05-21', status: 'discharged' },
];

const STATUS_COLORS: Record<string, string> = { active: '#00D68F', discharged: '#64748B', cancelled: '#FF4560' };

export default function PatientRecordsPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;
  const [search, setSearch] = useState('');

  const filtered = MOCK_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Patient Records</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>{MOCK_PATIENTS.length} patients</p>
        </div>
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search patients..." />
        </div>
      </div>

      <div className="frost-card overflow-hidden">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {['ID', 'Name', 'Age', 'Sex', 'Department', 'Admitted', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 11, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/clinical-workspace/${hospitalId}/patient-records/${p.id}`)}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                  className="hover:bg-white/[0.02]"
                >
                  <td style={{ padding: '10px 14px', color: '#06B6D4', fontWeight: 500, fontFamily: "'JetBrains Mono',monospace" }}>{p.id}</td>
                  <td style={{ padding: '10px 14px', color: '#E2E8F0', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '10px 14px', color: '#94A3B8' }}>{p.age < 1 ? `${Math.round(p.age * 12)}mo` : p.age}y</td>
                  <td style={{ padding: '10px 14px', color: '#64748B' }}>{p.sex}</td>
                  <td style={{ padding: '10px 14px', color: '#94A3B8' }}>{p.department}</td>
                  <td style={{ padding: '10px 14px', color: '#64748B' }}>{p.admission}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                      background: `${STATUS_COLORS[p.status]}15`, color: STATUS_COLORS[p.status],
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
