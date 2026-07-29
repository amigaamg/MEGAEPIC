'use client';
import { useState, useMemo } from 'react';
import { IntegrationType, IntegrationProtocol, EndpointStatus, AuthMethod, TransformType, createEndpoint, getIntegrationStats } from '@/lib/amexan/hmis/integration-engine';
import type { IntegrationEndpoint, DataMapping } from '@/lib/amexan/hmis/integration-engine';

const MOCK_ENDPOINTS: IntegrationEndpoint[] = [
  createEndpoint({ name: 'NHIF Claims Gateway', type: IntegrationType.NHIF, protocol: IntegrationProtocol.HTTPS, version: '2.0', config: { baseUrl: 'https://api.nhif.or.ke/v2', timeout: 30000, retryCount: 3, retryDelay: 1000, batchSize: 50, maxConcurrent: 5, tlsEnabled: true }, authMethod: AuthMethod.OAuth2, mappings: [{ sourceSystem: 'AMEXAN', sourceField: 'patient_name', targetSystem: 'NHIF', targetField: 'member_name', transform: TransformType.Direct, isRequired: true }] }),
  createEndpoint({ name: 'SHA Integration', type: IntegrationType.SHA, protocol: IntegrationProtocol.HTTPS, version: '1.0', config: { baseUrl: 'https://api.sha.go.ke/v1', timeout: 30000, retryCount: 3, retryDelay: 1000, batchSize: 100, maxConcurrent: 3, tlsEnabled: true }, authMethod: AuthMethod.ClientCredentials }),
  createEndpoint({ name: 'National Registry', type: IntegrationType.NationalRegistry, protocol: IntegrationProtocol.HTTPS, version: '1.0', config: { baseUrl: 'https://registry.national.go.ke/api', timeout: 15000, retryCount: 2, retryDelay: 2000, batchSize: 10, maxConcurrent: 2, tlsEnabled: true }, authMethod: AuthMethod.APIKey }),
  createEndpoint({ name: 'PACS Archive', type: IntegrationType.PACS, protocol: IntegrationProtocol.DICOM, version: 'DICOM 3.0', config: { baseUrl: 'pacs://pacs.hospital.local', port: 11112, timeout: 60000, retryCount: 3, retryDelay: 5000, batchSize: 20, maxConcurrent: 2, tlsEnabled: true }, authMethod: AuthMethod.None }),
  createEndpoint({ name: 'Safaricom M-Pesa', type: IntegrationType.PaymentGateway, protocol: IntegrationProtocol.HTTPS, version: '2.0', config: { baseUrl: 'https://api.safaricom.co.ke/mpesa', timeout: 30000, retryCount: 3, retryDelay: 1000, batchSize: 1, maxConcurrent: 10, tlsEnabled: true }, authMethod: AuthMethod.OAuth2 }),
];

MOCK_ENDPOINTS[0].status = EndpointStatus.Connected;
MOCK_ENDPOINTS[0].lastConnectionAt = Date.now() - 3600000;
MOCK_ENDPOINTS[1].status = EndpointStatus.Configuring;
MOCK_ENDPOINTS[2].status = EndpointStatus.Connected;
MOCK_ENDPOINTS[2].lastConnectionAt = Date.now() - 7200000;
MOCK_ENDPOINTS[3].status = EndpointStatus.Disconnected;
MOCK_ENDPOINTS[4].status = EndpointStatus.Connected;
MOCK_ENDPOINTS[4].lastConnectionAt = Date.now() - 1800000;

export default function IntegrationPage() {
  const [endpoints] = useState(MOCK_ENDPOINTS);
  const [selectedEp, setSelectedEp] = useState<string | null>(null);

  const stats = useMemo(() => getIntegrationStats(endpoints), [endpoints]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Integration Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XXI — FHIR, HL7, DICOM, custom adapters for interoperability</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Endpoint</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Endpoints', value: stats.totalEndpoints, color: '#2563EB' }, { label: 'Connected', value: stats.connected, color: '#10B981' }, { label: 'Errors', value: stats.errors, color: '#EF4444' }, { label: 'Mappings', value: stats.totalMappings, color: '#8B5CF6' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {endpoints.map(ep => {
          const isSelected = selectedEp === ep.id;
          return (
            <div key={ep.id} onClick={() => setSelectedEp(isSelected ? null : ep.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(37,99,235,0.08)' : ep.status === EndpointStatus.Error ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(37,99,235,0.3)' : ep.status === EndpointStatus.Error ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{ep.name} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {ep.type} · v{ep.version}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{ep.protocol} · {ep.authMethod} · {ep.mappings.length} mappings · {ep.errorCount} errors</div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: ep.status === EndpointStatus.Connected ? 'rgba(16,185,129,0.15)' : ep.status === EndpointStatus.Error ? 'rgba(239,68,68,0.15)' : ep.status === EndpointStatus.Configuring ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: ep.status === EndpointStatus.Connected ? '#10B981' : ep.status === EndpointStatus.Error ? '#EF4444' : ep.status === EndpointStatus.Configuring ? '#F59E0B' : '#94A3B8' }}>{ep.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: '#E2E8F0', marginBottom: 4 }}>Config: {ep.config.baseUrl || ep.config.port ? `${ep.config.baseUrl || `port ${ep.config.port}`}` : 'Internal'}</div>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Timeout: <span style={{ color: '#E2E8F0' }}>{ep.config.timeout}ms</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Retries: <span style={{ color: '#E2E8F0' }}>{ep.config.retryCount}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>TLS: <span style={{ color: '#E2E8F0' }}>{ep.config.tlsEnabled ? 'Enabled' : 'Disabled'}</span></div>
                    {ep.lastConnectionAt && <div style={{ fontSize: 11, color: '#64748B' }}>Last: <span style={{ color: '#E2E8F0' }}>{new Date(ep.lastConnectionAt).toLocaleString()}</span></div>}
                  </div>
                  {ep.mappings.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>Data Mappings</div>
                      {ep.mappings.map((m, i) => <div key={i} style={{ fontSize: 11, color: '#94A3B8' }}>{m.sourceSystem}.{m.sourceField} → {m.targetSystem}.{m.targetField} ({m.transform})</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
