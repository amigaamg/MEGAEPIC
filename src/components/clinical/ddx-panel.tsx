'use client';
import { motion } from 'framer-motion';

export interface DdxResult {
  disease: string;
  probability: number;
  evidence: string[];
  confidence: 'low' | 'medium' | 'high';
  action: string;
}

interface DdxPanelProps {
  results: DdxResult[];
  isLoading?: boolean;
  patientInfo?: string;
}

const CONFIDENCE_COLORS = { low: '#FF4560', medium: '#FFB020', high: '#00D68F' };

export default function DdxPanel({ results, isLoading, patientInfo }: DdxPanelProps) {
  return (
    <div className="frost-card p-4 flex flex-col gap-3">
      <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Differential Diagnosis</div>
      {patientInfo && <div style={{ fontSize: 11, color: '#475569' }}>{patientInfo}</div>}

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 20, justifyContent: 'center' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#06B6D4', animation: 'amx-spin 0.7s linear infinite' }} />
          <span style={{ fontSize: 12, color: '#64748B' }}>Analysing clinical data...</span>
        </div>
      ) : results.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#475569' }}>
          Submit patient data to generate differential diagnoses.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((r, i) => (
            <motion.div
              key={r.disease}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="frost-card-sm p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', minWidth: 20 }}>#{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{r.disease}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#06B6D4' }}>
                    {(r.probability * 100).toFixed(0)}%
                  </span>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: CONFIDENCE_COLORS[r.confidence],
                  }} title={r.confidence} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {r.evidence.map((e, ei) => (
                  <span key={ei} style={{
                    fontSize: 9, padding: '2px 7px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                    color: '#64748B',
                  }}>
                    {e}
                  </span>
                ))}
              </div>
              {r.action && (
                <div style={{ fontSize: 10, color: '#475569', fontStyle: 'italic' }}>
                  {r.action}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
