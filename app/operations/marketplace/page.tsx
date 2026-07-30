'use client';

import { useState } from 'react';
import { ShoppingBag, Package, Download, Star, Users, DollarSign, Search } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const plugins = [
  { id: 'plug-001', name: 'Clinical Note Enhancer', publisher: 'MediSoft Labs', category: 'Documentation', installs: 12400, rating: 4.7, price: '$49/mo', verified: true },
  { id: 'plug-002', name: 'Drug Interaction Checker Pro', publisher: 'PharmaData Inc.', category: 'Safety', installs: 8700, rating: 4.5, price: '$99/mo', verified: true },
  { id: 'plug-003', name: 'Voice Dictation Module', publisher: 'SpeechAI', category: 'Input', installs: 15300, rating: 4.8, price: '$29/mo', verified: true },
  { id: 'plug-004', name: 'Advanced Analytics Dashboard', publisher: 'DataVis Corp.', category: 'Analytics', installs: 5600, rating: 4.3, price: '$79/mo', verified: true },
  { id: 'plug-005', name: 'Telemedicine Scheduler', publisher: 'HealthConnect', category: 'Scheduling', installs: 9200, rating: 4.0, price: '$39/mo', verified: false },
  { id: 'plug-006', name: 'ICD-11 Coding Assistant', publisher: 'CodeRight', category: 'Billing', installs: 18700, rating: 4.6, price: '$19/mo', verified: true },
  { id: 'plug-007', name: 'Patient Portal Bridge', publisher: 'PortalTech', category: 'Integration', installs: 4300, rating: 3.8, price: '$59/mo', verified: false },
  { id: 'plug-008', name: 'Compliance Audit Logger', publisher: 'SecureLogix', category: 'Compliance', installs: 3100, rating: 4.9, price: '$149/mo', verified: true },
  { id: 'plug-009', name: 'ML Model Trainer', publisher: 'AIWorks', category: 'AI', installs: 2800, rating: 4.2, price: '$199/mo', verified: true },
  { id: 'plug-010', name: 'Multi-Language Translator', publisher: 'LinguaSoft', category: 'Accessibility', installs: 6800, rating: 4.4, price: '$15/mo', verified: true },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');

  const filtered = plugins.filter(p =>
    !search || p.id.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase()) || p.publisher.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalInstalls = plugins.reduce((a, p) => a + p.installs, 0);
  const publishers = [...new Set(plugins.map(p => p.publisher))].length;
  const avgRating = plugins.reduce((a, p) => a + p.rating, 0) / plugins.length;

  return (
    <div style={S.page}>
      <div style={S.h1}><ShoppingBag size={20} color={C.sky} /> Marketplace Operations</div>
      <div style={S.sub}>Level 11 · Plugin registry, publisher stats, ratings, and install metrics</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{plugins.length}</div>
          <div style={S.statLabel}>Available Plugins</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>{(totalInstalls / 1000).toFixed(1)}K</div>
          <div style={S.statLabel}>Total Installs</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.amber)}>{publishers}</div>
          <div style={S.statLabel}>Publishers</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>${plugins.reduce((a, p) => a + parseInt(p.price.replace(/[^0-9]/g, '')), 0) / plugins.length}/mo</div>
          <div style={S.statLabel}>Avg Revenue/Plugin</div>
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search plugins..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.grid2}>
        {filtered.map(p => (
          <div key={p.id} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', fontWeight: 600, color: '#f1f5f9' }}>{p.name}</div>
              {p.verified && <span style={S.badge(C.green, 'rgba(34,197,94,0.1)')}>Verified</span>}
            </div>
            <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: C.textMuted, marginBottom: 8 }}>
              <Users size={11} style={{ display: 'inline', marginRight: 2 }} /> {p.publisher} · {p.category}
            </div>
            <div style={{ display: 'flex', gap: 'clamp(12px, 1.5vw, 20px)', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Download size={12} color={C.textMuted} />
                <span style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 600, color: '#e2e8f0' }}>{(p.installs / 1000).toFixed(1)}K</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star size={12} color={C.amber} />
                <span style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 600, color: '#e2e8f0' }}>{p.rating}</span>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 'clamp(12px, 1.3vw, 14px)', fontWeight: 700, color: C.sky }}>{p.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
