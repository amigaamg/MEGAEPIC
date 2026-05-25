'use client';
// ═══════════════════════════════════════════════════════════════════════════
// ResultsTrendChart.tsx
//
// Renders a line/bar trend chart for any numeric lab test over time.
// Works for: HbA1c, Glucose, BP, Creatinine, Lipid panel, etc.
// Powers the "chronic disease management" view — see values improving/worsening.
// ═══════════════════════════════════════════════════════════════════════════

'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ResultPoint {
  date: Date;
  value: number;
  unit: string;
  flag?: string;
  visitLabel?: string;
}

interface Props {
  patientId: string;
  testName: string;             // e.g. "HbA1c"
  normalRange?: [number, number]; // e.g. [4, 6]
  unit?: string;
  color?: string;
}

const FLAG_COLORS: Record<string, string> = {
  critical: '#dc2626', high: '#f97316', low: '#3b82f6', normal: '#059669',
};

export default function ResultsTrendChart({ patientId, testName, normalRange, unit, color = '#00e5cc' }: Props) {
  const [points, setPoints] = useState<ResultPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Pull from labOrders where testName matches
        const snap = await getDocs(
          query(
            collection(db, 'labOrders'),
            where('patientId', '==', patientId),
            where('testName', '==', testName),
            orderBy('orderedAt', 'asc'),
          )
        );
        const pts: ResultPoint[] = [];
        snap.docs.forEach(d => {
          const data = d.data();
          if (data.resultValue) {
            const val = parseFloat(data.resultValue);
            if (!isNaN(val)) {
              pts.push({
                date: data.orderedAt?.toDate?.() || new Date(),
                value: val,
                unit: data.unit || unit || '',
                flag: data.flag,
                visitLabel: data.orderedAt?.toDate?.()?.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) || '',
              });
            }
          }
        });
        setPoints(pts);
      } catch {}
      setLoading(false);
    };
    if (patientId && testName) load();
  }, [patientId, testName]);

  if (loading) return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted, #546382)', fontSize: 12 }}>Loading trend…</div>
  );

  if (points.length < 2) return (
    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted, #546382)', fontSize: 12 }}>
      Not enough data for trend · {points.length} result{points.length === 1 ? '' : 's'} recorded
    </div>
  );

  // Chart geometry
  const W = 400, H = 160, PAD = { top: 20, right: 20, bottom: 30, left: 44 };
  const xs = points.map(p => p.value);
  const minV = Math.min(...xs) * 0.9, maxV = Math.max(...xs) * 1.1;
  const scaleX = (i: number) => PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right);
  const scaleY = (v: number) => PAD.top + (1 - (v - minV) / (maxV - minV)) * (H - PAD.top - PAD.bottom);

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i).toFixed(1)},${scaleY(p.value).toFixed(1)}`).join(' ');

  const trend = points.length >= 2 ? points[points.length - 1].value - points[points.length - 2].value : 0;
  const trendColor = trend < 0 ? '#059669' : trend > 0 ? '#dc2626' : '#546382';
  const trendIcon = trend < 0 ? '↓' : trend > 0 ? '↑' : '→';

  return (
    <div style={{ background: 'var(--surface, #111827)', border: '1px solid var(--border, #243047)', borderRadius: 14, padding: '16px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text, #e8edf5)' }}>{testName} Trend</div>
          <div style={{ fontSize: 11, color: 'var(--muted, #546382)', marginTop: 2 }}>{points.length} results recorded</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color }}>
            {points[points.length - 1].value} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted, #546382)' }}>{unit || points[0].unit}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: trendColor }}>
            {trendIcon} {Math.abs(trend).toFixed(1)} vs prev
          </div>
        </div>
      </div>

      {/* SVG chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Normal range band */}
        {normalRange && (
          <rect
            x={PAD.left} y={scaleY(normalRange[1])}
            width={W - PAD.left - PAD.right}
            height={scaleY(normalRange[0]) - scaleY(normalRange[1])}
            fill="rgba(5,150,105,.08)" stroke="rgba(5,150,105,.2)" strokeWidth="0.5"
          />
        )}

        {/* Y-axis gridlines */}
        {[0.25, 0.5, 0.75].map(t => {
          const v = minV + t * (maxV - minV);
          const y = scaleY(v);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(255,255,255,.06)" strokeWidth="0.5" />
              <text x={PAD.left - 4} y={y} textAnchor="end" dominantBaseline="central" fill="#546382" fontSize="9">{v.toFixed(1)}</text>
            </g>
          );
        })}

        {/* Trend line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Area under line */}
        <path
          d={`${pathD} L${scaleX(points.length - 1).toFixed(1)},${H - PAD.bottom} L${PAD.left},${H - PAD.bottom} Z`}
          fill={color} fillOpacity="0.06"
        />

        {/* Data points */}
        {points.map((p, i) => {
          const x = scaleX(i), y = scaleY(p.value);
          const fc = p.flag ? (FLAG_COLORS[p.flag] || color) : color;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={fc} stroke="var(--surface, #111827)" strokeWidth="2" />
              {/* X label */}
              <text x={x} y={H - PAD.bottom + 12} textAnchor="middle" fill="#546382" fontSize="9">
                {p.visitLabel}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Latest result row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        {points.slice(-5).reverse().map((p, i) => (
          <div key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, fontFamily: 'monospace', fontWeight: 700, background: p.flag ? `${FLAG_COLORS[p.flag]}15` : 'rgba(0,229,204,.08)', color: p.flag ? FLAG_COLORS[p.flag] : color, border: `1px solid ${p.flag ? `${FLAG_COLORS[p.flag]}30` : 'rgba(0,229,204,.2)'}` }}>
            {p.value} {i === 0 && <span style={{ fontWeight: 400, opacity: .7 }}>(latest)</span>}
          </div>
        ))}
      </div>
    </div>
  );
}