'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDepartmentTotalActiveCases, getDepartmentTotalEncountersToday } from '@/lib/workspaceData';

export default function LiveDepartmentStats() {
  const [deptStats] = useState({ totalActive: getDepartmentTotalActiveCases(), totalToday: getDepartmentTotalEncountersToday() });
  const [loading] = useState(false);
  const { totalActive, totalToday } = deptStats;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="frost-card p-4 animate-pulse">
            <div className="h-3 w-16 bg-slate-700 rounded mb-3" />
            <div className="h-6 w-12 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: 'Active Cases', value: totalActive, icon: '🏥', color: '#3b82f6' },
    { label: 'Today Encounters', value: totalToday, icon: '📋', color: '#00D68F' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: '#E2E8F0',
              lineHeight: 1.1,
            }}
          >
            {stat.value}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
