'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SearchBar from '@/src/components/shared/search-bar';

export interface DiseaseSummary {
  id: string;
  name: string;
  prevalence: 'very_common' | 'common' | 'uncommon' | 'rare';
  emergency: boolean;
  mustNotMiss: boolean;
}

interface DiseaseGridProps {
  diseases: DiseaseSummary[];
  departmentKey: string;
  sectionSlug: string;
  hospitalId: string;
  search: string;
  onSearchChange: (v: string) => void;
}

const PREVALENCE_COLORS: Record<string, string> = {
  very_common: '#00D68F',
  common: '#06B6D4',
  uncommon: '#FFB020',
  rare: '#FF4560',
};

const PREVALENCE_LABELS: Record<string, string> = {
  very_common: 'Very Common',
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
};

export default function DiseaseGrid({ diseases, departmentKey, sectionSlug, hospitalId, search, onSearchChange }: DiseaseGridProps) {
  const filtered = diseases.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search diseases..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((disease, i) => (
          <motion.div
            key={disease.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/clinical-workspace/${hospitalId}/departments/${departmentKey.toLowerCase()}/${sectionSlug}/${disease.id}`}
              className="frost-card p-4 flex flex-col gap-2 no-underline transition-all duration-200 hover:translate-y-[-2px] block"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {disease.emergency && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(255,69,96,0.15)', color: '#FF4560' }}>
                      EMERGENCY
                    </span>
                  )}
                  {disease.mustNotMiss && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(255,176,32,0.15)', color: '#FFB020' }}>
                      MUST NOT MISS
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                  background: `${PREVALENCE_COLORS[disease.prevalence]}15`,
                  color: PREVALENCE_COLORS[disease.prevalence],
                }}>
                  {PREVALENCE_LABELS[disease.prevalence]}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>{disease.name}</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
