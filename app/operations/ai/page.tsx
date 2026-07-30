'use client';

import { useState } from 'react';
import { Brain, Cpu, Activity, BarChart3, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const models = [
  { id: 'clinic-llm-v4', name: 'Clinical LLM v4', type: 'LLM', status: 'healthy' as const, latency: 142, accuracy: 97.2, drift: 0.3, version: '4.2.1', engines: 12 },
  { id: 'reasoning-transformer', name: 'Reasoning Transformer', type: 'Transformer', status: 'healthy' as const, latency: 215, accuracy: 94.8, drift: 0.7, version: '3.8.0', engines: 8 },
  { id: 'dx-classifier', name: 'Diagnosis Classifier', type: 'CNN', status: 'degraded' as const, latency: 89, accuracy: 91.5, drift: 2.1, version: '2.1.3', engines: 5 },
  { id: 'ner-extractor', name: 'NER Extractor', type: 'BERT', status: 'healthy' as const, latency: 67, accuracy: 98.1, drift: 0.1, version: '1.9.2', engines: 7 },
  { id: 'drug-interaction-net', name: 'Drug Interaction Net', type: 'GNN', status: 'healthy' as const, latency: 178, accuracy: 96.4, drift: 0.5, version: '2.0.0', engines: 4 },
  { id: 'voice-to-text', name: 'Voice-to-Text Engine', type: 'ASR', status: 'unhealthy' as const, latency: 312, accuracy: 88.3, drift: 4.8, version: '1.5.0', engines: 2 },
  { id: 'summarization-bert', name: 'Summarization BERT', type: 'BERT', status: 'healthy' as const, latency: 195, accuracy: 95.7, drift: 0.4, version: '3.2.1', engines: 6 },
  { id: 'imaging-ai', name: 'Imaging AI', type: 'ResNet', status: 'degraded' as const, latency: 256, accuracy: 93.2, drift: 1.8, version: '4.0.2', engines: 3 },
];

const statusColors = { healthy: C.green, degraded: C.amber, unhealthy: C.red };
const statusBg = { healthy: 'rgba(34,197,94,0.1)', degraded: 'rgba(245,158,11,0.1)', unhealthy: 'rgba(239,68,68,0.1)' };

export default function AIPage() {
  const [search, setSearch] = useState('');

  const filtered = models.filter(m =>
    !search || m.id.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase()) || m.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.page}>
      <div style={S.h1}><Brain size={20} color={C.purple} /> AI Operations</div>
      <div style={S.sub}>Level 8 · Model registry, inference monitoring, and engine performance</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{models.length}</div>
          <div style={S.statLabel}>Models Deployed</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.amber)}>182ms</div>
          <div style={S.statLabel}>Avg Inference Latency</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>94.4%</div>
          <div style={S.statLabel}>Avg Accuracy Score</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(models.filter(m => m.drift > 1).length > 0 ? C.amber : C.green)}>{models.reduce((a, m) => a + m.drift, 0) / models.length}%</div>
          <div style={S.statLabel}>Avg Data Drift</div>
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <Cpu size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search models..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Status</th>
              <th style={S.th}>Model</th>
              <th style={S.th}>Type</th>
              <th style={S.th}>Version</th>
              <th style={S.th}>Latency (ms)</th>
              <th style={S.th}>Accuracy</th>
              <th style={S.th}>Drift %</th>
              <th style={S.th}>Engines</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={{ background: m.status === 'unhealthy' ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                <td style={S.td}>
                  <span style={S.badge(statusColors[m.status], statusBg[m.status])}>
                    <span style={S.statusDot(statusColors[m.status])} />{m.status}
                  </span>
                </td>
                <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9' }}>{m.name}<div style={{ fontSize: 'clamp(8px, 0.8vw, 9px)', color: '#64748b' }}>{m.id}</div></td>
                <td style={S.td}>{m.type}</td>
                <td style={S.td}>{m.version}</td>
                <td style={S.td}>{m.latency}</td>
                <td style={{ ...S.td, fontWeight: 600, color: m.accuracy > 95 ? C.green : m.accuracy > 90 ? C.amber : C.red }}>{m.accuracy}%</td>
                <td style={{ ...S.td, fontWeight: 600, color: m.drift > 2 ? C.red : m.drift > 1 ? C.amber : C.green }}>{m.drift}%</td>
                <td style={S.td}>{m.engines}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
