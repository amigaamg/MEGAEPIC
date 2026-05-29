'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import type { DepartmentInfo } from '@/lib/workspaceData';
import SearchBar from '@/src/components/shared/search-bar';
import FilterPills from '@/src/components/shared/filter-pills';

interface DepartmentListProps {
  departments: DepartmentInfo[];
  hospitalId: string;
  search: string;
  onSearchChange: (v: string) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (v: string[]) => void;
}

const CATEGORY_MAP: Record<string, string[]> = {
  medical: ['IM', 'CARD', 'ENDO', 'RESP', 'RENAL', 'NEURO', 'GI', 'ID', 'RHEUM', 'GERI', 'HAEM', 'ONCO'],
  surgical: ['SURG', 'ORTHO', 'URO', 'ENT', 'OPHTH'],
  paediatric: ['PAED'],
  obstetric: ['OB', 'GYN'],
  emergency: ['EM', 'ICU'],
  psychiatric: ['PSYCH'],
  diagnostic: ['RAD', 'LAB', 'PHARM'],
  dermatology: ['DERM'],
};

export default function DepartmentList({ departments, hospitalId, search, onSearchChange, categories, selectedCategories, onCategoriesChange }: DepartmentListProps) {
  const filtered = departments.filter(d => {
    const matchesSearch = d.label.toLowerCase().includes(search.toLowerCase()) || d.key.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => CATEGORY_MAP[cat]?.includes(d.key));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={onSearchChange} placeholder="Search departments..." />
        </div>
      </div>
      <FilterPills options={categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} selected={selectedCategories} onChange={onCategoriesChange} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((dept, i) => {
          const reg = DEPARTMENTS[dept.key];
          return (
            <motion.div key={dept.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Link
                href={`/clinical-workspace/${hospitalId}/departments/${dept.key}`}
                className="frost-card p-4 flex flex-col gap-2.5 no-underline transition-all duration-200 hover:translate-y-[-2px] block"
              >
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 24 }}>{reg?.icon || dept.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: `${reg?.color || dept.color}15`, color: reg?.color || dept.color }}>
                    {dept.units.length} units
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>{reg?.label || dept.label}</div>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>{dept.description}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span style={{ fontSize: 11, color: '#00D68F' }}>{dept.activeCases} active</span>
                  <span style={{ fontSize: 11, color: '#475569' }}>{dept.todayEncounters} today</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
