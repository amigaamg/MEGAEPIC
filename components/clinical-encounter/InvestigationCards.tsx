'use client';
import React from 'react';
import type { LabOrder, ImagingOrder } from '@/lib/amexan/encounter-engine/types/ces';

interface Props {
  labOrders: LabOrder[];
  imagingOrders: ImagingOrder[];
  onRequestLab: (orderId: string) => void;
  onRequestImaging: (orderId: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  diagnostic: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Diagnostic' },
  rule_out: { bg: '#FFF7ED', text: '#C2410C', label: 'Rule Out' },
  supportive_baseline: { bg: '#F0FDF4', text: '#15803D', label: 'Baseline' },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  suggested: { bg: '#F1F5F9', text: '#64748B', label: 'Suggested' },
  ordered: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Sent to Lab' },
  sample_collected: { bg: '#FEF3C7', text: '#B45309', label: 'Sample Collected' },
  processing: { bg: '#FEF3C7', text: '#B45309', label: 'Processing' },
  completed: { bg: '#F0FDF4', text: '#15803D', label: 'Completed' },
  cancelled: { bg: '#FEF2F2', text: '#B91C1C', label: 'Cancelled' },
};

function OrderBadge({ type }: { type: string }) {
  const cfg = CATEGORY_COLORS[type] || CATEGORY_COLORS.supportive_baseline;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
      background: cfg.bg, color: cfg.text, textTransform: 'uppercase',
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.suggested;
  return (
    <span style={{
      fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
      background: cfg.bg, color: cfg.text, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    stat: '#DC2626', urgent: '#EA580C', routine: '#64748B',
  };
  return (
    <span style={{
      fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2,
      background: colors[priority] + '18', color: colors[priority] || '#64748B',
      textTransform: 'uppercase', marginLeft: 4,
    }}>
      {priority}
    </span>
  );
}

function LabOrderCard({ order, onRequest }: { order: LabOrder; onRequest: (id: string) => void }) {
  const canRequest = order.status === 'suggested';
  const hasResult = order.status === 'completed' && order.result;

  return (
    <div style={{
      border: `1px solid ${canRequest ? '#CBD5E1' : '#E2E8F0'}`,
      borderRadius: 5, padding: '6px 8px', background: canRequest ? '#fff' : '#F8FAFC',
      opacity: order.status === 'completed' || order.status === 'cancelled' ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
            <strong style={{ fontSize: 10, color: '#0F172A' }}>{order.testName}</strong>
            <OrderBadge type={order.category} />
            <span style={{ fontSize: 8, color: '#64748B' }}>Blood</span>
          </div>
          <div style={{ fontSize: 8, color: '#64748B', lineHeight: 1.3, marginBottom: 3 }}>{order.reason}</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={order.status} />
            <PriorityBadge priority={order.priority} />
          </div>
          {hasResult && (
            <div style={{ marginTop: 3, padding: '3px 5px', background: '#F0FDF4', borderRadius: 3, border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: '#15803D' }}>Result: </span>
              <span style={{ fontSize: 8, color: '#166534' }}>{order.result}</span>
              {order.flag && order.flag !== 'normal' && (
                <span style={{
                  fontSize: 7, marginLeft: 4, fontWeight: 700,
                  color: order.flag === 'critical' ? '#DC2626' : '#EA580C',
                }}>
                  ({order.flag.toUpperCase()})
                </span>
              )}
            </div>
          )}
        </div>
        {canRequest && (
          <button
            onClick={() => onRequest(order.id)}
            style={{
              padding: '4px 10px', borderRadius: 4, border: 'none',
              background: '#2563EB', color: '#fff', fontSize: 9,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            Request
          </button>
        )}
      </div>
    </div>
  );
}

function ImagingOrderCard({ order, onRequest }: { order: ImagingOrder; onRequest: (id: string) => void }) {
  const canRequest = order.status === 'suggested';
  const hasResult = order.status === 'completed' && (order.findings || order.impression);

  return (
    <div style={{
      border: `1px solid ${canRequest ? '#CBD5E1' : '#E2E8F0'}`,
      borderRadius: 5, padding: '6px 8px', background: canRequest ? '#fff' : '#F8FAFC',
      opacity: order.status === 'completed' || order.status === 'cancelled' ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
            <strong style={{ fontSize: 10, color: '#0F172A' }}>{order.studyName}</strong>
            <OrderBadge type={order.category} />
            <span style={{ fontSize: 8, color: '#64748B' }}>{order.modality}</span>
          </div>
          <div style={{ fontSize: 8, color: '#64748B', lineHeight: 1.3, marginBottom: 3 }}>
            {order.reason} — Region: {order.bodyRegion}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={order.status} />
            <PriorityBadge priority={order.priority} />
          </div>
          {hasResult && (
            <div style={{ marginTop: 3, background: '#EFF6FF', borderRadius: 3, padding: '3px 5px', border: '1px solid #BFDBFE' }}>
              {order.findings && (
                <div style={{ fontSize: 8, color: '#1E3A5F', marginBottom: 2 }}>
                  <strong>Findings:</strong> {order.findings}
                </div>
              )}
              {order.impression && (
                <div style={{ fontSize: 8, color: '#1E3A5F' }}>
                  <strong>Impression:</strong> {order.impression}
                </div>
              )}
              {order.flag && order.flag !== 'normal' && (
                <span style={{
                  fontSize: 7, fontWeight: 700, color: order.flag === 'critical' ? '#DC2626' : '#EA580C',
                }}>
                  ({order.flag.toUpperCase()})
                </span>
              )}
            </div>
          )}
        </div>
        {canRequest && (
          <button
            onClick={() => onRequest(order.id)}
            style={{
              padding: '4px 10px', borderRadius: 4, border: 'none',
              background: '#2563EB', color: '#fff', fontSize: 9,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            Request
          </button>
        )}
      </div>
    </div>
  );
}

export function InvestigationCards({ labOrders, imagingOrders, onRequestLab, onRequestImaging }: Props) {
  const diagnosticLabs = labOrders.filter(o => o.category === 'diagnostic');
  const ruleOutLabs = labOrders.filter(o => o.category === 'rule_out');
  const baselineLabs = labOrders.filter(o => o.category === 'supportive_baseline');
  const diagnosticImaging = imagingOrders.filter(o => o.category === 'diagnostic');
  const ruleOutImaging = imagingOrders.filter(o => o.category === 'rule_out');
  const baselineImaging = imagingOrders.filter(o => o.category === 'supportive_baseline');

  const section = (title: string, labs: LabOrder[], imaging: ImagingOrder[]) => {
    if (labs.length === 0 && imaging.length === 0) return null;
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{
          fontSize: 9, fontWeight: 700, color: '#334155',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          marginBottom: 4, borderBottom: '1px solid #E2E8F0',
          paddingBottom: 3,
        }}>
          {title}
        </div>
        {labs.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 600, color: '#64748B', marginBottom: 3, paddingLeft: 2 }}>
              Blood Work
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {labs.map(o => <LabOrderCard key={o.id} order={o} onRequest={onRequestLab} />)}
            </div>
          </div>
        )}
        {imaging.length > 0 && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 600, color: '#64748B', marginBottom: 3, paddingLeft: 2 }}>
              Imaging
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {imaging.map(o => <ImagingOrderCard key={o.id} order={o} onRequest={onRequestImaging} />)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const total = labOrders.length + imagingOrders.length;

  if (total === 0) {
    return (
      <div style={{ padding: '14px 10px', textAlign: 'center', fontSize: 10, color: '#94A3B8' }}>
        No investigations suggested yet. Complete history and examination to generate recommendations.
      </div>
    );
  }

  return (
    <div>
      {section('Diagnostic — to confirm diagnosis', diagnosticLabs, diagnosticImaging)}
      {section('Rule Out — to exclude differentials', ruleOutLabs, ruleOutImaging)}
      {section('Supportive / Baseline', baselineLabs, baselineImaging)}
    </div>
  );
}
