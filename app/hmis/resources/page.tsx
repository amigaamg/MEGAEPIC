'use client';
import { useState, useMemo } from 'react';
import { ResourceCategory, createResource, assignResource, releaseResource, scheduleMaintenance, completeMaintenance, getAvailableResources, getResourceUtilization } from '@/lib/amexan/hmis/resource-engine';
import { ResourceStatus } from '@/lib/amexan/hmis/hospital-model';
import type { Resource, ResourceLocation } from '@/lib/amexan/hmis/resource-engine';

const MOCK_RESOURCES: Resource[] = [
  createResource({ hospitalId: 'HOS-001', category: ResourceCategory.Ventilator, type: 'ventilator', name: 'Drager Oxylog 3000', identifier: 'V-001', location: { departmentId: 'DEPT-003', wardId: 'WARD-ICU-1', roomId: 'RM-ICU-1' }, serialNumber: 'DR-12345', manufacturer: 'Drager', model: 'Oxylog 3000' }),
  createResource({ hospitalId: 'HOS-001', category: ResourceCategory.Ventilator, type: 'ventilator', name: 'Drager Oxylog 3000', identifier: 'V-002', location: { departmentId: 'DEPT-003', wardId: 'WARD-ICU-1', roomId: 'RM-ICU-2' }, serialNumber: 'DR-12346', manufacturer: 'Drager', model: 'Oxylog 3000' }),
  createResource({ hospitalId: 'HOS-001', category: ResourceCategory.Monitor, type: 'monitor', name: 'Philips IntelliVue', identifier: 'M-001', location: { departmentId: 'DEPT-003', wardId: 'WARD-ICU-1' }, serialNumber: 'PH-78901', manufacturer: 'Philips', model: 'IntelliVue MX800' }),
  createResource({ hospitalId: 'HOS-001', category: ResourceCategory.InfusionPump, type: 'infusion_pump', name: 'Alaris Pump', identifier: 'IP-001', location: { departmentId: 'DEPT-002', wardId: 'WARD-IM-1' }, serialNumber: 'AL-45678', manufacturer: 'BD', model: 'Alaris GH Plus' }),
  createResource({ hospitalId: 'HOS-001', category: ResourceCategory.InfusionPump, type: 'infusion_pump', name: 'Alaris Pump', identifier: 'IP-002', location: { departmentId: 'DEPT-002', wardId: 'WARD-IM-1' }, serialNumber: 'AL-45679', manufacturer: 'BD', model: 'Alaris GH Plus' }),
  createResource({ hospitalId: 'HOS-001', category: ResourceCategory.DialysisMachine, type: 'dialysis', name: 'Fresenius 4008S', identifier: 'D-001', location: { departmentId: 'DEPT-010' }, serialNumber: 'FR-11223', manufacturer: 'Fresenius', model: '4008S' }),
  createResource({ hospitalId: 'HOS-001', category: ResourceCategory.PatientTransport, type: 'wheelchair', name: 'Wheelchair', identifier: 'WC-001', location: { departmentId: 'DEPT-001' } }),
  createResource({ hospitalId: 'HOS-001', category: ResourceCategory.ImagingEquipment, type: 'xray', name: 'Siemens X-Ray', identifier: 'XR-001', location: { departmentId: 'DEPT-007' }, serialNumber: 'SI-99887', manufacturer: 'Siemens', model: 'Multix Fusion' }),
];

assignResource(MOCK_RESOURCES[0], 'P-003', 'ENC-003');
assignResource(MOCK_RESOURCES[2], 'P-003', 'ENC-003');
MOCK_RESOURCES[3].maintenance.push({ id: 'MNT-001', type: 'routine', description: 'Annual calibration', performedBy: 'tech-01', performedAt: Date.now() - 86400000, status: 'in_progress' });

const CATEGORY_LABELS: Record<string, string> = { bed: 'Beds', ventilator: 'Ventilators', monitor: 'Monitors', infusion_pump: 'Infusion Pumps', dialysis_machine: 'Dialysis', imaging_equipment: 'Imaging', patient_transport: 'Transport', other: 'Other' };

export default function ResourcesPage() {
  const [resources] = useState(MOCK_RESOURCES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | 'all'>('all');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const utilization = useMemo(() => getResourceUtilization(resources), [resources]);
  const available = useMemo(() => getAvailableResources(resources, categoryFilter !== 'all' ? categoryFilter : undefined), [resources, categoryFilter]);

  const filtered = useMemo(() => {
    return resources.filter(r => {
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.identifier.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [resources, search, categoryFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Resource Management</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book IX — Equipment lifecycle, maintenance, calibration, utilization</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Add Resource
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Total', value: utilization.total, color: '#F97316' },
          { label: 'Available', value: utilization.available, color: '#10B981' },
          { label: 'In Use', value: utilization.inUse, color: '#3B82F6' },
          { label: 'Maintenance', value: utilization.maintenance, color: '#F59E0B' },
          { label: 'Utilization', value: `${utilization.utilizationRate.toFixed(0)}%`, color: utilization.utilizationRate > 80 ? '#EF4444' : '#F97316' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
        {Object.entries(utilization.byCategory).map(([cat, data]) => (
          <div key={cat} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, color: '#64748B' }}>{CATEGORY_LABELS[cat] || cat}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{data.inUse}/{data.total}</div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${data.total > 0 ? (data.inUse / data.total) * 100 : 0}%`, height: '100%', background: '#F97316', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as ResourceCategory | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Categories</option>
          {Object.values(ResourceCategory).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ResourceStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Status</option>
          {Object.values(ResourceStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(resource => {
          const isSelected = selectedResource === resource.id;
          const hasMaintenance = resource.maintenance.length > 0;
          return (
            <div
              key={resource.id}
              onClick={() => setSelectedResource(isSelected ? null : resource.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(249,115,22,0.08)' : hasMaintenance ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(249,115,22,0.3)' : hasMaintenance ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {resource.category === ResourceCategory.Ventilator ? '💨' : resource.category === ResourceCategory.Monitor ? '📺' : resource.category === ResourceCategory.InfusionPump ? '💉' : resource.category === ResourceCategory.DialysisMachine ? '🩸' : resource.category === ResourceCategory.ImagingEquipment ? '📡' : resource.category === ResourceCategory.PatientTransport ? '🦽' : '🔧'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{resource.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{resource.identifier} · {resource.manufacturer && `${resource.manufacturer} ${resource.model || ''}`} · {resource.serialNumber && `S/N: ${resource.serialNumber}`}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: resource.status === ResourceStatus.Available ? 'rgba(16,185,129,0.15)' : resource.status === ResourceStatus.InUse ? 'rgba(59,130,246,0.15)' : resource.status === ResourceStatus.Maintenance ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: resource.status === ResourceStatus.Available ? '#10B981' : resource.status === ResourceStatus.InUse ? '#3B82F6' : resource.status === ResourceStatus.Maintenance ? '#F59E0B' : '#EF4444' }}>
                    {resource.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Location: <span style={{ color: '#E2E8F0' }}>{resource.location.departmentId} · {resource.location.wardId || ''} · {resource.location.roomId || ''}</span></div>
                    {resource.assignment && <div style={{ fontSize: 11, color: '#64748B' }}>Assigned: <span style={{ color: '#E2E8F0' }}>Patient {resource.assignment.patientId} · {resource.assignment.encounterId}</span></div>}
                  </div>
                  {resource.maintenance.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Maintenance Records</div>
                      {resource.maintenance.map(m => (
                        <div key={m.id} style={{ fontSize: 11, color: '#94A3B8', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 4 }}>
                          {m.type} · {m.description} · {m.status}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: '8px 0 4px' }}>Calibration ({resource.calibration.length})</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{resource.calibration.length === 0 ? 'No calibration records' : resource.calibration.map(c => `${c.parameter}: ${c.passed ? '✓' : '✗'}`).join(', ')}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
