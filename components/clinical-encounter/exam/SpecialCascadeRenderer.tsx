'use client';
import React from 'react';
import type { ActiveCascade, ExamFindingGroupDef } from '@/lib/clinical/constitutional/examination-engine';
import { ExamFindingInput } from './ExamFindingInput';

interface Props {
  cascades: ActiveCascade[];
  findings: Record<string, { value: unknown }>;
  onAnswer: (findingId: string, value: unknown) => void;
}

export function SpecialCascadeRenderer({ cascades, findings, onAnswer }: Props) {
  if (cascades.length === 0) return null;

  return (
    <div className="ec-exam-section">
      <div className="ec-exam-section-title">Special Examination</div>
      {cascades.map(cascade => (
        <div key={cascade.cascadeId} className="ec-exam-cascade">
          <div className="ec-exam-cascade-header">
            {cascade.label}
            <span className="ec-exam-cascade-trigger">
              Triggered by: {cascade.triggerFindingId}
            </span>
          </div>
          {cascade.groups.map(group => (
            <div key={group.id} className="ec-exam-group">
              <div className="ec-exam-group-label">{group.label}</div>
              <div className="ec-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {group.findings.map(finding => (
                  <div key={finding.id} className="ec-card ec-card-active" style={{ opacity: 1 }}>
                    <div className="ec-card-q">{finding.label}</div>
                    <ExamFindingInput
                      finding={finding}
                      value={findings[finding.id]?.value}
                      onAnswer={onAnswer}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
