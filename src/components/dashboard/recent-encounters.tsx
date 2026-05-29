'use client';
import { motion } from 'framer-motion';

interface Encounter {
  id: string;
  patientName: string;
  department: string;
  type: string;
  time: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface RecentEncountersProps {
  encounters: Encounter[];
}

const STATUS_COLORS: Record<string, string> = {
  active: '#00D68F',
  completed: '#64748B',
  cancelled: '#FF4560',
};

export default function RecentEncounters({ encounters }: RecentEncountersProps) {
  return (
    <div className="frost-card overflow-hidden">
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Recent Encounters</div>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {encounters.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: '#475569' }}>No recent encounters</div>
        ) : (
          encounters.map((enc, i) => (
            <motion.div
              key={enc.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                transition: 'background 0.15s',
              }}
              className="hover:bg-white/[0.02]"
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[enc.status] || '#64748B', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {enc.patientName}
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>
                  {enc.department} · {enc.type}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>{enc.time}</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
