'use client';
import { motion } from 'framer-motion';
import { ENCOUNTER_LABELS } from '@/lib/encounterTypes';

interface EncounterTypeSelectorProps {
  onSelect: (type: string) => void;
}

const ENCOUNTER_TYPES: { type: string; description: string }[] = [
  { type: 'outpatient', description: 'For clinic/office consultations and evaluations' },
  { type: 'inpatient', description: 'For hospitalized patients requiring admission' },
  { type: 'follow_up', description: 'For scheduled follow-ups and interval reviews' },
  { type: 'telemedicine', description: 'For remote/virtual consultations via telemedicine' },
  { type: 'full_history', description: 'For comprehensive new patient workups and histories' },
];

export default function EncounterTypeSelector({ onSelect }: EncounterTypeSelectorProps) {
  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9', marginBottom: 6 }}>
          What type of encounter?
        </h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Select the encounter type to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {ENCOUNTER_TYPES.map(({ type, description }, i) => {
          const info = ENCOUNTER_LABELS[type] ?? { label: type, icon: '📄', color: '#64748B' };
          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(type)}
              className="frost-card-sm"
              style={{
                textAlign: 'left', cursor: 'pointer', border: 'none',
                padding: 0, background: 'none', width: '100%',
              }}
            >
              <div
                className="group"
                style={{
                  padding: 20, borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                  height: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${info.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, marginBottom: 14,
                  }}
                >
                  {info.icon}
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
                  {info.label}
                </div>

                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>
                  {description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
