'use client';
import React from 'react';
import type { ExamFindingGroupDef, ExamFindingDef } from '@/lib/clinical/constitutional/examination-knowledge';
import { ExamFindingInput } from './ExamFindingInput';

interface Props {
  groups: ExamFindingGroupDef[];
  findings: Record<string, { value: unknown }>;
  onAnswer: (findingId: string, value: unknown) => void;
}

export function VitalsPanel({ groups, findings, onAnswer }: Props) {
  if (groups.length === 0) return null;

  return (
    <div className="ec-exam-section">
      <div className="ec-exam-section-title">Vital Signs</div>
      {groups.map(group => (
        <div key={group.id} className="ec-exam-group">
          <div className="ec-exam-group-label">{group.label}</div>
          <div className="ec-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {group.findings.map(finding => (
              <div key={finding.id} className="ec-card ec-card-active" style={{ opacity: 1 }}>
                <div className="ec-card-q">
                  {finding.label}
                  {finding.unit && <span className="ec-exam-unit"> ({finding.unit})</span>}
                </div>
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
  );
}
