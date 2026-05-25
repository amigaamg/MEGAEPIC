"use client";
import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintContent from './PrintContent';

export default function PrintModal({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const [includeMonitoring, setIncludeMonitoring] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includePrescriptions, setIncludePrescriptions] = useState(true);
  const [includeLabs, setIncludeLabs] = useState(true);
  const [includeImaging, setIncludeImaging] = useState(true);
  const [includeReferrals, setIncludeReferrals] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | 'last3' | 'last6'>('all');

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: onClose,
  } as any);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: 500, padding: 24 }}>
        <h3>Print Options</h3>
        <div>
          <label><input type="checkbox" checked={includeMonitoring} onChange={e => setIncludeMonitoring(e.target.checked)} /> Monitoring data</label>
        </div>
        <div>
          <label><input type="checkbox" checked={includeNotes} onChange={e => setIncludeNotes(e.target.checked)} /> Clinical notes</label>
        </div>
        <div>
          <label><input type="checkbox" checked={includePrescriptions} onChange={e => setIncludePrescriptions(e.target.checked)} /> Prescriptions</label>
        </div>
        <div>
          <label><input type="checkbox" checked={includeLabs} onChange={e => setIncludeLabs(e.target.checked)} /> Labs</label>
        </div>
        <div>
          <label><input type="checkbox" checked={includeImaging} onChange={e => setIncludeImaging(e.target.checked)} /> Imaging</label>
        </div>
        <div>
          <label><input type="checkbox" checked={includeReferrals} onChange={e => setIncludeReferrals(e.target.checked)} /> Referrals</label>
        </div>
        <div>
          <label>Date range</label>
          <select value={dateRange} onChange={e => setDateRange(e.target.value as any)}>
            <option value="all">All time</option>
            <option value="last3">Last 3 months</option>
            <option value="last6">Last 6 months</option>
          </select>
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ padding: '8px 16px', background: '#0aaa76', color: '#fff', border: 'none', borderRadius: 8 }}>Print</button>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8 }}>Cancel</button>
        </div>
        <div ref={componentRef} style={{ position: 'absolute', left: '-9999px' }}>
          <PrintContent
            patientId={patientId}
            includeMonitoring={includeMonitoring}
            includeNotes={includeNotes}
            includePrescriptions={includePrescriptions}
            includeLabs={includeLabs}
            includeImaging={includeImaging}
            includeReferrals={includeReferrals}
            dateRange={dateRange}
          />
        </div>
      </div>
    </div>
  );
}