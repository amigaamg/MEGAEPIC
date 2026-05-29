'use client';
import { useParams } from 'next/navigation';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';

export default function AnalyticsPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Analytics</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Clinical intelligence and operational metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="frost-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>Encounter Volume</h3>
          <p style={{ fontSize: 12, color: '#64748B', textAlign: 'center', maxWidth: 240 }}>
            Real-time encounter tracking and departmental load analysis coming soon.
          </p>
        </div>

        <div className="frost-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>Clinical Outcomes</h3>
          <p style={{ fontSize: 12, color: '#64748B', textAlign: 'center', maxWidth: 240 }}>
            Outcome tracking, complication rates, and quality metrics dashboard coming soon.
          </p>
        </div>

        <div className="frost-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏱️</div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>Wait Times</h3>
          <p style={{ fontSize: 12, color: '#64748B', textAlign: 'center', maxWidth: 240 }}>
            Department wait time analytics and patient flow optimization coming soon.
          </p>
        </div>

        <div className="frost-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🦠</div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>Disease Surveillance</h3>
          <p style={{ fontSize: 12, color: '#64748B', textAlign: 'center', maxWidth: 240 }}>
            Disease prevalence tracking and outbreak surveillance dashboard coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
