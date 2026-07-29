'use client';
import { useState, useMemo } from 'react';
import { HealthSystemLevel, BedType, BedStatus, BedFeature, DepartmentType, UnitType, RoomType, ResourceType, ResourceStatus, computeOccupancyStats, buildHospitalTree, createHospitalId, createDepartmentId, createWardId, createBedId, createResourceId } from '@/lib/amexan/hmis/hospital-model';
import type { DepartmentInfo, UnitInfo, WardInfo, RoomInfo, BedInfo, ResourceInfo } from '@/lib/amexan/hmis/hospital-model';

const MOCK_DEPARTMENTS: DepartmentInfo[] = [
  { id: 'DEPT-001', hospitalId: 'HOS-001', name: 'Emergency Department', code: 'ED', type: DepartmentType.Emergency, services: ['Emergency Medicine', 'Trauma', 'Resuscitation'], units: [{ id: 'UNIT-ED-1', departmentId: 'DEPT-001', name: 'ED Unit', code: 'EDU', type: UnitType.Medical, wards: [{ id: 'WARD-ED-1', unitId: 'UNIT-ED-1', name: 'ED Ward', code: 'EDW', gender: 'mixed', totalBeds: 20, rooms: [{ id: 'RM-ED-1', wardId: 'WARD-ED-1', name: 'Resus Bay', capacity: 4, type: RoomType.Resuscitation, beds: Array.from({ length: 4 }, (_, i) => ({ id: `BED-ED-${i + 1}`, wardId: 'WARD-ED-1', roomId: 'RM-ED-1', label: `ED-${i + 1}`, type: BedType.Emergency, features: [BedFeature.Oxygen, BedFeature.Monitor, BedFeature.Suction], status: i < 3 ? BedStatus.Occupied : BedStatus.Available, lastCleanedAt: Date.now() - 3600000 })) }, { id: 'RM-ED-2', wardId: 'WARD-ED-1', name: 'Triage Bay', capacity: 6, type: RoomType.Triage, beds: Array.from({ length: 6 }, (_, i) => ({ id: `BED-ED-T${i + 1}`, wardId: 'WARD-ED-1', roomId: 'RM-ED-2', label: `TRI-${i + 1}`, type: BedType.Emergency, features: [BedFeature.Oxygen], status: i < 2 ? BedStatus.Occupied : BedStatus.Available, lastCleanedAt: Date.now() - 7200000 })) }], isolationCapable: true, visitorPolicy: 'restricted' }] }], status: 'active', headOfDepartment: 'Dr. Amara Okafor' },
  { id: 'DEPT-002', hospitalId: 'HOS-001', name: 'Internal Medicine', code: 'IM', type: DepartmentType.Inpatient, services: ['General Medicine', 'Cardiology', 'Neurology', 'Respiratory'], units: [{ id: 'UNIT-IM-1', departmentId: 'DEPT-002', name: 'Medical Ward', code: 'MW', type: UnitType.Medical, wards: [{ id: 'WARD-IM-1', unitId: 'UNIT-IM-1', name: 'Ward A', code: 'WA', gender: 'mixed', totalBeds: 30, rooms: Array.from({ length: 10 }, (_, ri) => ({ id: `RM-IM-A${ri + 1}`, wardId: 'WARD-IM-1', name: `Room A${ri + 1}`, capacity: 3, type: RoomType.General, beds: Array.from({ length: 3 }, (_, bi) => ({ id: `BED-IM-A${ri + 1}-${bi + 1}`, wardId: 'WARD-IM-1', roomId: `RM-IM-A${ri + 1}`, label: `A${ri + 1}-${bi + 1}`, type: BedType.Standard, features: [BedFeature.Oxygen], status: BedStatus.Available, lastCleanedAt: Date.now() - 86400000 })) })), isolationCapable: true, visitorPolicy: 'open' }] }], status: 'active', headOfDepartment: 'Dr. James Mwangi' },
  { id: 'DEPT-003', hospitalId: 'HOS-001', name: 'ICU', code: 'ICU', type: DepartmentType.ICU, services: ['Critical Care', 'Ventilation'], units: [{ id: 'UNIT-ICU-1', departmentId: 'DEPT-003', name: 'ICU Unit', code: 'ICU', type: UnitType.Medical, wards: [{ id: 'WARD-ICU-1', unitId: 'UNIT-ICU-1', name: 'ICU Ward', code: 'ICUW', gender: 'mixed', totalBeds: 12, rooms: Array.from({ length: 12 }, (_, i) => ({ id: `RM-ICU-${i + 1}`, wardId: 'WARD-ICU-1', name: `ICU Bay ${i + 1}`, capacity: 1, type: RoomType.ICU, beds: [{ id: `BED-ICU-${i + 1}`, wardId: 'WARD-ICU-1', roomId: `RM-ICU-${i + 1}`, label: `ICU-${i + 1}`, type: BedType.ICU, features: [BedFeature.Ventilator, BedFeature.Monitor, BedFeature.Suction, BedFeature.Oxygen, BedFeature.Dialysis], status: i < 8 ? BedStatus.Occupied : BedStatus.Available, lastCleanedAt: Date.now() - 1800000 }] })), isolationCapable: true, visitorPolicy: 'restricted' }] }], status: 'active', headOfDepartment: 'Dr. Susan Akinyi' },
];

const MOCK_RESOURCES: ResourceInfo[] = [
  { id: 'RES-001', hospitalId: 'HOS-001', resourceType: ResourceType.Ventilator, name: 'Drager Ventilator', identifier: 'V-001', status: ResourceStatus.InUse, location: 'ICU', departmentId: 'DEPT-003', manufacturer: 'Drager', model: 'Oxylog 3000', serialNumber: 'DR-12345', lastCalibratedAt: Date.now() - 2592000000, nextMaintenanceAt: Date.now() + 2592000000 },
  { id: 'RES-002', hospitalId: 'HOS-001', resourceType: ResourceType.Ventilator, name: 'Drager Ventilator', identifier: 'V-002', status: ResourceStatus.Available, location: 'ICU', departmentId: 'DEPT-003', manufacturer: 'Drager', model: 'Oxylog 3000', serialNumber: 'DR-12346', lastCalibratedAt: Date.now() - 2592000000, nextMaintenanceAt: Date.now() + 2592000000 },
  { id: 'RES-003', hospitalId: 'HOS-001', resourceType: ResourceType.Defibrillator, name: 'Zoll Defibrillator', identifier: 'DEF-001', status: ResourceStatus.Available, location: 'ED', departmentId: 'DEPT-001', manufacturer: 'Zoll', model: 'R Series', serialNumber: 'ZL-78901', lastCalibratedAt: Date.now() - 5184000000, nextMaintenanceAt: Date.now() + 7776000000 },
];

export default function HospitalModelPage() {
  const [depts] = useState(MOCK_DEPARTMENTS);
  const [resources] = useState(MOCK_RESOURCES);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const stats = useMemo(() => computeOccupancyStats(depts), [depts]);

  const tree = useMemo(() => buildHospitalTree('HOS-001', depts), [depts]);

  const filteredDepts = useMemo(() => {
    if (!search) return depts;
    const q = search.toLowerCase();
    return depts.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
  }, [depts, search]);

  const selectedDeptData = selectedDept ? depts.find(d => d.id === selectedDept) : null;

  const resourceSummary = useMemo(() => ({
    total: resources.length,
    available: resources.filter(r => r.status === ResourceStatus.Available).length,
    inUse: resources.filter(r => r.status === ResourceStatus.InUse).length,
    maintenance: resources.filter(r => r.status === ResourceStatus.Maintenance || r.status === ResourceStatus.OutOfService).length,
  }), [resources]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Hospital Model</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book I — Health system hierarchy, departments, wards, rooms, beds, resources</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#06B6D4,#0891B2)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Add Department
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Beds', value: stats.totalBeds, color: '#06B6D4' },
          { label: 'Occupied', value: stats.occupiedBeds, color: '#EF4444' },
          { label: 'Available', value: stats.availableBeds, color: '#10B981' },
          { label: 'Occupancy', value: `${stats.occupancyRate.toFixed(1)}%`, color: stats.occupancyRate > 80 ? '#EF4444' : '#F59E0B' },
          { label: 'Resources', value: resourceSummary.total, color: '#8B5CF6' },
          { label: 'Depts', value: depts.length, color: '#F59E0B' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <input
              placeholder="Search departments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredDepts.map(dept => (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
                style={{
                  padding: 14, borderRadius: 10, cursor: 'pointer',
                  background: selectedDept === dept.id ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedDept === dept.id ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{dept.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{dept.code} · {dept.type} · {dept.units.reduce((s, u) => s + u.wards.reduce((sw, w) => sw + w.totalBeds, 0), 0)} beds</div>
                    {dept.headOfDepartment && <div style={{ fontSize: 10, color: '#475569' }}>HOD: {dept.headOfDepartment}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: selectedDept === dept.id ? '#06B6D4' : '#475569' }}>{selectedDept === dept.id ? '▲' : '▼'}</div>
                </div>
                {selectedDept === dept.id && (
                  <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    {dept.units.map(unit => (
                      <div key={unit.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>{unit.name} ({unit.code})</div>
                        {unit.wards.map(ward => (
                          <div key={ward.id} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 4 }}>
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: 12, color: '#E2E8F0' }}>{ward.name} — {ward.gender}</span>
                              <span style={{ fontSize: 11, color: '#64748B' }}>{ward.totalBeds} beds</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                              {ward.rooms.map(room => (
                                <div key={room.id} style={{ fontSize: 10, color: '#475569', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}>
                                  {room.name} ({room.beds.filter(b => b.status === BedStatus.Occupied).length}/{room.capacity})
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>Resources</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resources.map(r => (
              <div key={r.id} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#F1F5F9' }}>{r.name}</div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: r.status === ResourceStatus.Available ? 'rgba(16,185,129,0.15)' : r.status === ResourceStatus.InUse ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)', color: r.status === ResourceStatus.Available ? '#10B981' : r.status === ResourceStatus.InUse ? '#3B82F6' : '#EF4444' }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>{r.identifier} · {r.location} · {r.manufacturer} {r.model}</div>
              </div>
            ))}
          </div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', margin: '16px 0 12px' }}>Occupancy by Type</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between"><span style={{ fontSize: 12, color: '#94A3B8' }}>ICU/HDU</span><span style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{stats.icus.occupiedBeds}/{stats.icus.totalBeds}</span></div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ width: `${stats.icus.totalBeds > 0 ? (stats.icus.occupiedBeds / stats.icus.totalBeds) * 100 : 0}%`, height: '100%', background: '#EF4444', borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between"><span style={{ fontSize: 12, color: '#94A3B8' }}>Wards</span><span style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{stats.wards.occupiedBeds}/{stats.wards.totalBeds}</span></div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ width: `${stats.wards.totalBeds > 0 ? (stats.wards.occupiedBeds / stats.wards.totalBeds) * 100 : 0}%`, height: '100%', background: '#F59E0B', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
