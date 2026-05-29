'use client';
import { motion } from 'framer-motion';

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

interface StatsCardsProps {
  stats: Stat[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="frost-card p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <span style={{ fontSize: 20 }}>{stat.icon}</span>
            {stat.trend && (
              <span style={{ fontSize: 10, fontWeight: 600, color: stat.trendUp ? '#00D68F' : '#FF4560' }}>
                {stat.trendUp ? '↑' : '↓'} {stat.trend}
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.1 }}>{stat.value}</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
