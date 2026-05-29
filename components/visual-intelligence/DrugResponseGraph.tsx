'use client';
import { useMemo, useState } from 'react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Brush, ReferenceArea,
} from 'recharts';
import { motion } from 'framer-motion';

export interface DataPoint {
  date: string;
  effect: number;
  severity: number;
  event?: string;
}

interface BaseProps {
  title?: string;
  drug?: string;
  className?: string;
}

interface EntriesProps extends BaseProps {
  entries: DataPoint[];
  targetRangeMin?: number;
  targetRangeMax?: number;
}

interface MedsProps extends BaseProps {
  medications: { name: string; data: { date: string; effect: number }[] }[];
  disease: { name: string; data: { date: string; severity: number }[] };
}

type Props = EntriesProps | MedsProps;

const fmtTooltipDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-sm p-3 min-w-[180px]">
      <div className="text-[10px] font-bold text-[var(--teal)] mb-1.5">{fmtTooltipDate(label)}</div>
      {payload.map((entry: any, i: number) => (
        <div key={`tt-${i}`} className="flex justify-between gap-4 text-[11px]">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-bold" style={{ color: entry.color }}>{entry.value.toFixed(1)}</span>
        </div>
      ))}
      {payload[0]?.payload?.event && (
        <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-[var(--text-muted)]">
          {payload[0].payload.event}
        </div>
      )}
    </div>
  );
};

export default function DrugResponseGraph(props: Props) {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);

  const { data, targetMin, targetMax, drugName } = useMemo(() => {
    if ('entries' in props) {
      return {
        data: props.entries,
        targetMin: props.targetRangeMin,
        targetMax: props.targetRangeMax,
        drugName: props.drug,
      };
    }
    const medData = props.medications || [];
    const diseaseData = props.disease?.data || [];
    const dateSet = new Set<string>();
    medData.forEach(m => m.data.forEach(d => dateSet.add(d.date)));
    diseaseData.forEach(d => dateSet.add(d.date));
    const merged = Array.from(dateSet).sort().map(date => {
      const point: any = { date };
      medData.forEach(m => {
        const entry = m.data.find(d => d.date === date);
        point[m.name] = entry?.effect ?? null;
      });
      point[props.disease?.name || 'Disease Severity'] = diseaseData.find(d => d.date === date)?.severity ?? null;
      return point;
    });
    return { data: merged, targetMin: undefined, targetMax: undefined, drugName: props.drug || medData[0]?.name };
  }, [props]);

  const { yMin, yMax } = useMemo(() => {
    let min = 0, max = 10;
    data.forEach(d => {
      Object.entries(d).forEach(([k, v]) => {
        if (k !== 'date' && k !== 'event' && v !== null) {
          max = Math.max(max, (v as number) * 1.15);
          min = Math.min(min, (v as number) * 0.85);
        }
      });
    });
    return { yMin: Math.floor(min), yMax: Math.ceil(max) };
  }, [data]);

  const lines = useMemo(() => {
    if ('entries' in props) {
      return [
        { key: 'effect', color: 'var(--green)', name: 'Drug Effect' },
        { key: 'severity', color: 'var(--red)', name: 'Disease Severity' },
      ];
    }
    const ls: { key: string; color: string; name: string }[] = [];
    (props as MedsProps).medications?.forEach((m, i) => {
      const colors = ['var(--green)', 'var(--purple)', 'var(--amber)'];
      ls.push({ key: m.name, color: colors[i % colors.length], name: m.name });
    });
    ls.push({ key: (props as MedsProps).disease?.name || 'Disease Severity', color: 'var(--red)', name: (props as MedsProps).disease?.name || 'Disease Severity' });
    return ls;
  }, [props, data]);

  const hasEvent = data.some(d => d.event);

  if (data.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="text-3xl mb-2">📊</div>
        <div className="text-sm font-bold text-[var(--text-secondary)]">No Response Data</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">Graph populates as treatment response is recorded</div>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--purple)] shadow-[0_0_6px_var(--purple)]" />
          <span className="text-[11px] font-bold text-[var(--text-primary)]">
            {props.title || `Drug Response · ${drugName || ''}`}
          </span>
        </div>
        <div className="flex gap-3 text-[9px] text-[var(--text-muted)]">
          <span><span className="inline-block w-2 h-2 rounded-full bg-[var(--green)] mr-1" />Effect</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-[var(--red)] mr-1" />Severity</span>
          {targetMin !== undefined && <span><span className="inline-block w-3 h-0.5 bg-[var(--teal)] mr-1" />Target</span>}
        </div>
      </div>

      <div className="p-3" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="effectGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="severityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--red)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
              }}
              minTickGap={40}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }} />

            {targetMin !== undefined && targetMax !== undefined && (
              <ReferenceArea y1={targetMin} y2={targetMax} fill="var(--teal)" fillOpacity={0.06} />
            )}

            {lines.map((line) => (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                fill={line.key === 'effect' || line.key === drugName ? 'url(#effectGrad)' : 'url(#severityGrad)'}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: line.color }}
              />
            ))}

            <Brush
              dataKey="date"
              height={20}
              stroke="var(--purple)"
              fill="var(--surface-elevated)"
              travellerWidth={8}
              startIndex={0}
              endIndex={data.length - 1}
              onChange={(e) => {
                if (e.startIndex !== undefined && e.endIndex !== undefined) {
                  setZoomDomain([e.startIndex, e.endIndex]);
                }
              }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {data.filter(d => d.event).length > 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {data.filter(d => d.event).slice(-5).reverse().map((d, i) => (
            <span key={`ev-${i}`} className="px-2 py-0.5 rounded-full text-[9px] bg-[rgba(124,90,245,0.1)] border border-[rgba(124,90,245,0.2)] text-[var(--purple)]">
              {fmtTooltipDate(d.date)}: {d.event}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
