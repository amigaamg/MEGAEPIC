'use client';
import React from 'react';
import type { AnthropometryEngineOutput, AnthropometryMeasurement } from '@/lib/clinical/constitutional/examination-engine';

interface Props {
  engineOutput: AnthropometryEngineOutput | null;
  onValueChange: (measurementId: string, value: number | null) => void;
}

export function AnthropometryPanel({ engineOutput, onValueChange }: Props) {
  if (!engineOutput || engineOutput.measurements.length === 0) return null;

  const visibleMeasurements = engineOutput.measurements.filter(m => m.visibility === 'visible');

  if (visibleMeasurements.length === 0) return null;

  return (
    <div className="ec-exam-section">
      <div className="ec-exam-section-title">
        Anthropometry & Growth
        {engineOutput.summary && (
          <span style={{ fontSize: 8, fontWeight: 400, color: '#64748B', marginLeft: 8 }}>
            {engineOutput.summary}
          </span>
        )}
      </div>

      <div className="ec-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', padding: '8px 10px' }}>
        {visibleMeasurements.map(m => (
          <AnthropometryCard key={m.id} measurement={m} onValueChange={onValueChange} />
        ))}
      </div>

      {/* Alerts */}
      {engineOutput.alerts.length > 0 && (
        <div style={{ padding: '6px 10px', borderTop: '1px solid #E2E8F0' }}>
          {engineOutput.alerts.map((alert, i) => (
            <div key={i} style={{
              padding: '4px 8px', marginBottom: 3, borderRadius: 4, fontSize: 9,
              background: alert.severity === 'critical' ? '#FEF2F2'
                : alert.severity === 'warning' ? '#FFF7ED'
                : alert.severity === 'caution' ? '#FFFBEB' : '#F0FDF4',
              border: `1px solid ${
                alert.severity === 'critical' ? '#FECACA'
                : alert.severity === 'warning' ? '#FED7AA'
                : alert.severity === 'caution' ? '#FDE68A' : '#BBF7D0'
              }`,
              color: alert.severity === 'critical' ? '#991B1B'
                : alert.severity === 'warning' ? '#9A3412'
                : alert.severity === 'caution' ? '#92400E' : '#166534',
            }}>
              <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 7 }}>
                {alert.severity}
              </span>
              {' '}{alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Growth Velocity */}
      {engineOutput.growthVelocity && (
        <div style={{ padding: '6px 10px', borderTop: '1px solid #E2E8F0', fontSize: 8, color: '#64748B' }}>
          {engineOutput.growthVelocity.weightVelocity && (
            <div>Weight velocity: {engineOutput.growthVelocity.weightVelocity}</div>
          )}
          {engineOutput.growthVelocity.heightVelocity && (
            <div>Height velocity: {engineOutput.growthVelocity.heightVelocity}</div>
          )}
          {engineOutput.growthVelocity.hcVelocity && (
            <div>HC velocity: {engineOutput.growthVelocity.hcVelocity}</div>
          )}
        </div>
      )}
    </div>
  );
}

function AnthropometryCard({ measurement, onValueChange }: {
  measurement: AnthropometryMeasurement;
  onValueChange: (id: string, value: number | null) => void;
}) {
  const interpret = measurement.interpretation;
  const alertColor = interpret && 'alertLevel' in interpret
    ? (interpret.alertLevel === 'critical' ? '#DC2626'
      : interpret.alertLevel === 'warning' ? '#EA580C'
      : interpret.alertLevel === 'caution' ? '#D97706'
      : interpret.alertLevel === 'out_of_range' ? '#8B5CF6'
      : '#10B981')
    : '#94A3B8';

  return (
    <div className="ec-card ec-card-active" style={{
      opacity: 1,
      borderColor: measurement.value != null ? alertColor : undefined,
    }}>
      <div className="ec-card-q" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {measurement.label}
        {measurement.overrideReason && (
          <span style={{
            fontSize: 6, fontWeight: 600, color: '#7C3AED',
            background: '#7C3AED12', padding: '1px 3px', borderRadius: 2,
            textTransform: 'uppercase',
          }}>
            Override
          </span>
        )}
      </div>

      {measurement.id === 'bmi' && measurement.value != null ? (
        <div style={{
          fontSize: 14, fontWeight: 700, color: alertColor, padding: '4px 0',
          textAlign: 'center', letterSpacing: '-0.02em',
        }}>
          {measurement.value.toFixed(1)} {measurement.unit}
          <div style={{ fontSize: 8, fontWeight: 400, color: '#94A3B8' }}>
            Auto-calculated from weight &amp; height
          </div>
        </div>
      ) : (
        <input className="ec-input" type="number" step="any"
          placeholder={`Enter ${measurement.unit}`}
          value={measurement.value != null ? String(measurement.value) : ''}
          onChange={e => {
            const raw = e.target.value;
            onValueChange(measurement.id, raw ? parseFloat(raw) : null);
          }}
          style={{ width: '100%', marginBottom: interpret ? 4 : 0 }}
        />
      )}

      {interpret && (
        <div style={{
          fontSize: 8, lineHeight: 1.3, color: alertColor, marginTop: 2,
          background: `${alertColor}08`, padding: '2px 4px', borderRadius: 3,
        }}>
          {interpret.narrative && (
            <div style={{ maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {interpret.narrative}
            </div>
          )}
          {'zScore' in interpret && interpret.zScore != null && (
            <div style={{ display: 'flex', gap: 4, marginTop: 2, fontWeight: 500 }}>
              <span>Z: {interpret.zScore.toFixed(1)}</span>
              {'percentile' in interpret && interpret.percentile != null && (
                <span>P{Math.round(interpret.percentile)}</span>
              )}
            </div>
          )}
          {'classification' in interpret && interpret.classification && (
            <div style={{
              fontWeight: 600, fontSize: 7, textTransform: 'uppercase', marginTop: 1,
            }}>
              {interpret.classification}
            </div>
          )}
          {'expectedMin' in interpret && interpret.expectedMin != null && (
            <div style={{ fontSize: 7, color: '#94A3B8', marginTop: 1 }}>
              Expected: {interpret.expectedMin}-{interpret.expectedMax} {measurement.unit}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
