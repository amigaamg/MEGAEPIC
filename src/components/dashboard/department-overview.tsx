'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import type { DepartmentInfo } from '@/lib/workspaceData';

interface DepartmentOverviewProps {
  departments: DepartmentInfo[];
  hospitalId: string;
  searchQuery?: string;
}

export default function DepartmentOverview({ departments, hospitalId, searchQuery = '' }: DepartmentOverviewProps) {
  const filtered = departments.filter(d =>
    d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {filtered.map((dept, i) => {
        const registry = DEPARTMENTS[dept.key];
        return (
          <motion.div
            key={dept.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/clinical-workspace/${hospitalId}/departments/${dept.key}`}
              className="frost-card p-3.5 flex flex-col gap-2 no-underline transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg block"
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 22 }}>{registry?.icon || dept.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                  background: `${registry?.color || dept.color}15`,
                  color: registry?.color || dept.color,
                }}>
                  {dept.activeCases} active
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.2 }}>
                {registry?.label || dept.label}
              </div>
              <div style={{ fontSize: 10, color: '#64748B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {dept.description}
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 'auto' }}>
                {dept.todayEncounters} encounters today
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
