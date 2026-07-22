import React from 'react';
import type { PrescriptionOrder } from '@/lib/amexan/encounter-engine/types/ces';

const statusColors: Record<string, string> = {
  suggested: '#6366F1',
  prescribed: '#2563EB',
  sent_to_pharmacy: '#7C3AED',
  confirmed: '#059669',
  alternative_offered: '#D97706',
  dispensed: '#16A34A',
  cancelled: '#DC2626',
};

const categoryColors: Record<string, string> = {
  definitive: '#1E40AF',
  supportive: '#7C3AED',
  preventive: '#059669',
};

const pregnancyRiskColors: Record<string, string> = {
  safe: '#16A34A',
  caution: '#D97706',
  contraindicated: '#DC2626',
  not_assessed: '#6B7280',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      fontSize: 7, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: statusColors[status] || '#6B7280',
      border: `1px solid ${statusColors[status] || '#6B7280'}`,
      borderRadius: 2, padding: '1px 5px',
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function WarningTag({ text, type }: { text: string; type: 'allergy' | 'contraindication' | 'interaction' | 'warning' }) {
  const colors: Record<string, string> = {
    allergy: '#DC2626',
    contraindication: '#EA580C',
    interaction: '#D97706',
    warning: '#6366F1',
  };
  return (
    <span style={{
      fontSize: 7, color: colors[type],
      border: `1px solid ${colors[type]}40`,
      borderRadius: 2, padding: '1px 5px', marginRight: 3, marginBottom: 2,
      display: 'inline-block',
    }}>
      {type === 'allergy' && '⚠ '}{type === 'contraindication' && '✗ '}{type === 'interaction' && '↔ '}{type === 'warning' && '!'}
      {text}
    </span>
  );
}

function PregnancyRiskBadge({ risk }: { risk: string }) {
  return (
    <span style={{
      fontSize: 7, fontWeight: 700, textTransform: 'uppercase',
      color: pregnancyRiskColors[risk] || '#6B7280',
      border: `1px solid ${pregnancyRiskColors[risk] || '#6B7280'}40`,
      borderRadius: 2, padding: '1px 5px',
    }}>
      {risk === 'not_assessed' ? '' : 'Pregnancy: '}{risk.replace(/_/g, ' ')}
    </span>
  );
}

function PrescriptionCard({
  order,
  onPrescribe,
  onSendToPharmacy,
  onCancel,
}: {
  order: PrescriptionOrder;
  onPrescribe: (id: string) => void;
  onSendToPharmacy: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const hasWarnings = order.warnings.length > 0 || order.allergies.length > 0 || order.contraindications.length > 0 || order.interactions.length > 0;
  const isSuggested = order.status === 'suggested';
  const isPrescribed = order.status === 'prescribed';
  const isSent = order.status === 'sent_to_pharmacy';
  const isConfirmed = order.status === 'confirmed';
  const isAlternative = order.status === 'alternative_offered';
  const isDispensed = order.status === 'dispensed';
  const isCancelled = order.status === 'cancelled';

  const canPrescribe = isSuggested;
  const canSendToPharmacy = isPrescribed;
  const canCancel = !isDispensed && !isCancelled;

  return (
    <div style={{
      border: '1px solid #E2E8F0', borderRadius: 4,
      marginBottom: 6, background: '#FFF',
      borderLeft: `3px solid ${categoryColors[order.category] || '#6366F1'}`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '4px 8px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#0F172A' }}>{order.drugName}</span>
            <StatusBadge status={order.status} />
            <span style={{
              fontSize: 7, fontWeight: 600, textTransform: 'uppercase',
              color: categoryColors[order.category] || '#6366F1',
              letterSpacing: '0.03em',
            }}>
              {order.category}
            </span>
            <PregnancyRiskBadge risk={order.pregnancyRisk} />
            {order.requiresRenalAdjustment && (
              <span style={{ fontSize: 7, fontWeight: 600, color: '#EA580C', border: '1px solid #EA580C40', borderRadius: 2, padding: '1px 4px' }}>
                Renal adjust
              </span>
            )}
            {order.requiresHepaticAdjustment && (
              <span style={{ fontSize: 7, fontWeight: 600, color: '#D97706', border: '1px solid #D9770640', borderRadius: 2, padding: '1px 4px' }}>
                Hepatic adjust
              </span>
            )}
          </div>
          <div style={{ fontSize: 8, color: '#475569', marginTop: 2 }}>
            {order.genericName} &middot; {order.dose} {order.doseUnit} &middot; {order.route} &middot; {order.frequency} &middot; x{order.duration} {order.durationUnit}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '5px 8px' }}>
        {/* Indication */}
        <div style={{ fontSize: 8, color: '#334155', marginBottom: 3 }}>
          <strong>Indication:</strong> {order.indication || order.reason}
        </div>

        {/* Alternatives */}
        {order.alternativeMeds.length > 0 && (
          <div style={{ fontSize: 7, color: '#6B7280', marginBottom: 3 }}>
            <strong>Alternatives:</strong> {order.alternativeMeds.join(', ')}
          </div>
        )}

        {/* Warnings section */}
        {hasWarnings && (
          <div style={{
            background: '#FFF8F0', border: '1px solid #FED7AA', borderRadius: 3,
            padding: '4px 6px', marginBottom: 4,
          }}>
            {order.allergies.map((a, i) => <WarningTag key={`all-${i}`} text={a} type="allergy" />)}
            {order.contraindications.map((c, i) => <WarningTag key={`contra-${i}`} text={c} type="contraindication" />)}
            {order.interactions.map((int, i) => <WarningTag key={`int-${i}`} text={int} type="interaction" />)}
            {order.warnings.map((w, i) => <WarningTag key={`warn-${i}`} text={w} type="warning" />)}
          </div>
        )}

        {/* Patient instructions */}
        <div style={{ fontSize: 7, color: '#059669', fontStyle: 'italic', marginBottom: 3 }}>
          {order.patientInstructions}
        </div>

        {/* Pharmacy note */}
        {order.pharmacyNote && (
          <div style={{ fontSize: 7, color: '#7C3AED', background: '#F5F3FF', borderRadius: 2, padding: '2px 4px', marginBottom: 3 }}>
            <strong>Pharmacy note:</strong> {order.pharmacyNote}
          </div>
        )}

        {/* Dispensed info */}
        {isDispensed && order.dispensedAt && (
          <div style={{ fontSize: 7, color: '#16A34A' }}>
            Dispensed {new Date(order.dispensedAt).toLocaleString()} {order.dispensedBy ? `by ${order.dispensedBy}` : ''}
          </div>
        )}
        {isCancelled && (
          <div style={{ fontSize: 7, color: '#DC2626' }}>Cancelled</div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 4, padding: '4px 8px',
        borderTop: '1px solid #E2E8F0', background: '#F8FAFC',
      }}>
        {canPrescribe && (
          <button onClick={() => onPrescribe(order.id)} style={{
            fontSize: 8, fontWeight: 600, padding: '2px 8px', border: 'none', borderRadius: 3,
            background: '#2563EB', color: '#FFF', cursor: 'pointer',
          }}>
            Prescribe
          </button>
        )}
        {canSendToPharmacy && (
          <button onClick={() => onSendToPharmacy(order.id)} style={{
            fontSize: 8, fontWeight: 600, padding: '2px 8px', border: 'none', borderRadius: 3,
            background: '#7C3AED', color: '#FFF', cursor: 'pointer',
          }}>
            Send to Pharmacy
          </button>
        )}
        {canCancel && (
          <button onClick={() => onCancel(order.id)} style={{
            fontSize: 8, fontWeight: 600, padding: '2px 8px', border: '1px solid #DC2626', borderRadius: 3,
            background: 'transparent', color: '#DC2626', cursor: 'pointer',
          }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export function PrescriptionCards({
  prescriptionOrders,
  onPrescribe,
  onSendToPharmacy,
  onCancel,
}: {
  prescriptionOrders: PrescriptionOrder[];
  onPrescribe: (id: string) => void;
  onSendToPharmacy: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const definitive = prescriptionOrders.filter(o => o.category === 'definitive' && o.status !== 'cancelled');
  const supportive = prescriptionOrders.filter(o => o.category === 'supportive' && o.status !== 'cancelled');
  const preventive = prescriptionOrders.filter(o => o.category === 'preventive' && o.status !== 'cancelled');
  const cancelled = prescriptionOrders.filter(o => o.status === 'cancelled');

  if (prescriptionOrders.length === 0) {
    return (
      <div style={{
        padding: 20, textAlign: 'center', color: '#94A3B8', fontSize: 9,
        border: '1px dashed #CBD5E1', borderRadius: 4, marginTop: 4,
      }}>
        Manage the diagnosis and examinations to generate prescription orders.
      </div>
    );
  }

  function renderSection(title: string, orders: PrescriptionOrder[], color: string) {
    if (orders.length === 0) return null;
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={{
          fontSize: 8, fontWeight: 700, color,
          textTransform: 'uppercase', letterSpacing: '0.04em',
          marginBottom: 3, borderBottom: `1px solid ${color}30`, paddingBottom: 2,
        }}>
          {title} ({orders.length})
        </div>
        {orders.map(order => (
          <PrescriptionCard
            key={order.id}
            order={order}
            onPrescribe={onPrescribe}
            onSendToPharmacy={onSendToPharmacy}
            onCancel={onCancel}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {renderSection('Definitive Therapy', definitive, '#1E40AF')}
      {renderSection('Supportive Care', supportive, '#7C3AED')}
      {renderSection('Preventive', preventive, '#059669')}
      {cancelled.length > 0 && (
        <details>
          <summary style={{ fontSize: 8, color: '#6B7280', cursor: 'pointer', marginTop: 4 }}>
            Cancelled ({cancelled.length})
          </summary>
          <div style={{ opacity: 0.5 }}>
            {cancelled.map(order => (
              <PrescriptionCard
                key={order.id}
                order={order}
                onPrescribe={onPrescribe}
                onSendToPharmacy={onSendToPharmacy}
                onCancel={onCancel}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export function PrescriptionNote({ order, clinicianName, hospitalName }: {
  order: PrescriptionOrder;
  clinicianName?: string;
  hospitalName?: string;
}) {
  const atTop = order.status === 'prescribed' || order.status === 'sent_to_pharmacy' || order.status === 'confirmed' || order.status === 'dispensed';

  if (!atTop) {
    return (
      <div style={{
        border: '1px dashed #CBD5E1', borderRadius: 4, padding: 16,
        textAlign: 'center', fontSize: 9, color: '#94A3B8',
      }}>
        Prescribe first to generate a printable note.
      </div>
    );
  }

  return (
    <div style={{
      border: '2px solid #1E40AF', borderRadius: 4, padding: 12,
      background: '#FFF', maxWidth: 500, fontFamily: 'monospace',
    }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #1E40AF', paddingBottom: 6, marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{hospitalName || 'HOSPITAL'}</div>
        <div style={{ fontSize: 7, color: '#475569' }}>PRESCRIPTION ORDER FORM</div>
      </div>

      <div style={{ fontSize: 9, marginBottom: 4 }}>
        <strong>Drug:</strong> {order.drugName}
      </div>
      <div style={{ fontSize: 9, marginBottom: 4 }}>
        <strong>Generic:</strong> {order.genericName}
      </div>
      <div style={{ fontSize: 9, marginBottom: 2 }}>
        <strong>Dose:</strong> {order.dose} {order.doseUnit} &middot; <strong>Route:</strong> {order.route} &middot; <strong>Frequency:</strong> {order.frequency}
      </div>
      <div style={{ fontSize: 9, marginBottom: 4 }}>
        <strong>Duration:</strong> {order.duration} {order.durationUnit}
      </div>
      <div style={{ fontSize: 9, marginBottom: 4 }}>
        <strong>Indication:</strong> {order.indication}
      </div>

      {order.patientInstructions && (
        <div style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 4, color: '#059669' }}>
          {order.patientInstructions}
        </div>
      )}

      <div style={{
        borderTop: '1px solid #CBD5E1', marginTop: 6, paddingTop: 6,
        display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#475569',
      }}>
        <div>
          <div>Prescriber: {order.prescribedByName || clinicianName || 'Clinician'}</div>
          <div>Date: {order.prescribedAt ? new Date(order.prescribedAt).toLocaleString() : ''}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>Status: {order.status.replace(/_/g, ' ')}</div>
          {order.dispensedAt && (
            <div>Dispensed: {new Date(order.dispensedAt).toLocaleString()}</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
        <div style={{ borderTop: '1px solid #000', paddingTop: 2, minWidth: 120, textAlign: 'center' }}>
          Prescriber Signature
        </div>
        <div style={{ borderTop: '1px solid #000', paddingTop: 2, minWidth: 120, textAlign: 'center' }}>
          Pharmacy Stamp
        </div>
      </div>
    </div>
  );
}
