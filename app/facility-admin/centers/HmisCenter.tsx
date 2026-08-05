'use client';

import { useState } from 'react';
import { Database, PlugZap, Import } from 'lucide-react';
import {
  FacilityAdministrationEngine,
  SUPPORTED_HMIS_SYSTEMS,
  HMIS_SYSTEM_LABELS,
  IMPORTABLE_ENTITIES,
  type FacilityAdminModel,
} from '@/lib/amexan/facility';
import { C, Card, Kpi, AddBtn, ActionBtn } from '../ui';

// Center 16 — HMIS Connection. The Facility Administrator connects their legacy
// hospital information system (OpenMRS, OpenEMR, Bahmni, Epic…) and runs one-click
// imports of departments, employees, patients, beds, clinics, theatres, labs,
// pharmacy, appointments, users, roles, assets and services.

export function HmisCenter({ model, onSave }: { model: FacilityAdminModel; onSave: (fn: (m: FacilityAdminModel) => FacilityAdminModel) => void }) {
  const [system, setSystem] = useState(SUPPORTED_HMIS_SYSTEMS[0]);
  const [endpoint, setEndpoint] = useState('');
  const summary = FacilityAdministrationEngine.getImportSummary(model);

  const connect = () => onSave(m => FacilityAdministrationEngine.connectSystem(m, { system, endpoint: endpoint || undefined, config: {} }).model);
  const markConnected = (connectionId: string) => onSave(m => FacilityAdministrationEngine.markConnectionStatus(m, connectionId, 'connected'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: '#eef2ff', color: C.purple }}>
        <PlugZap size={15} /> The hospital keeps its own records. AMEXAN connects and imports the structure you already have — one click per entity.
      </div>

      <Card title="Connect External HMIS / EMR" subtitle="OpenMRS, OpenEMR, Bahna, DHIS2, Epic, Cerner, Meditech, custom SQL, FHIR server, CSV.">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={system} onChange={e => setSystem(e.target.value as any)} style={{ height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none', color: C.navy }}>
            {SUPPORTED_HMIS_SYSTEMS.map(s => <option key={s} value={s}>{HMIS_SYSTEM_LABELS[s]}</option>)}
          </select>
          <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="Endpoint URL (optional)" style={{ flex: 1, minWidth: 200, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none' }} />
          <AddBtn label="Connect System" onClick={connect} />
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Connections</div>
          {model.hmisConnections.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, flex: 1 }}>{c.label}</span>
              <span style={{ fontSize: 10, color: C.muted }}>{c.endpoint || 'no endpoint'}</span>
              <StatusPill status={c.status} />
              {c.status === 'configured' && <ActionBtn label="Mark Connected" onClick={() => markConnected(c.id)} />}
              {c.status !== 'configured' && c.status !== 'disconnected' && <ActionBtn label="Test / Sync" onClick={() => onSave(m => FacilityAdministrationEngine.markConnectionStatus(m, c.id, 'syncing'))} />}
            </div>
          ))}
          {model.hmisConnections.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No connections yet. Connect your Hospital Information System above.</div>}
        </div>
      </Card>

      <Card title="One-Click Data Import" subtitle="Import departments, employees, patients, beds, clinics, theatres, laboratories, radiology, pharmacy, appointments, users, roles, assets, services.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {IMPORTABLE_ENTITIES.map(entity => {
            const done = model.importBatches.some(b => b.entity === entity);
            return (
              <button key={entity} disabled={model.hmisConnections.length === 0} onClick={() => onSave(m => {
                const conn = m.hmisConnections.find(c => c.status !== 'disconnected');
                return conn ? FacilityAdministrationEngine.runImport(m, { connectionId: conn.id, entity, sourceCount: 1, generateAmxIds: true }).model : m;
              })}
                title={model.hmisConnections.length === 0 ? 'Connect a system first' : `Import ${entity}`}
                style={{ padding: '10px', borderRadius: 10, border: `1px solid ${model.hmisConnections.length === 0 ? `${C.border}55` : done ? C.green : C.border}`, background: done ? `${C.green}10` : '#fff', cursor: model.hmisConnections.length === 0 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left', textTransform: 'capitalize', opacity: model.hmisConnections.length === 0 ? 0.5 : 1 }}>
                {done ? '✓ Imported' : `+ Import ${entity}`}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, fontSize: 11, color: C.muted }}><Database size={13} /> {summary.totalImported} records imported across all entities.</div>
      </Card>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === 'connected' ? C.green : status === 'configured' ? C.sky : status === 'disconnected' ? C.red : C.amber;
  return <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${tone}18`, color: tone, textTransform: 'capitalize' }}>{status}</span>;
}