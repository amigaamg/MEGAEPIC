'use client';
import React from 'react';
import { EncounterPhase } from '@/lib/amexan/encounter-engine/types/ces';

interface Props {
  currentPhase: EncounterPhase;
  completedPhases: EncounterPhase[];
  onPhaseSelect: (phase: EncounterPhase) => void;
}

const ALL_PHASES: { id: EncounterPhase; label: string }[] = [
  { id: 'registration', label: 'Reg' },
  { id: 'patient_context', label: 'Context' },
  { id: 'chief_complaint', label: 'CC' },
  { id: 'hpi', label: 'HPI' },
  { id: 'past_medical', label: 'PMH' },
  { id: 'past_surgical', label: 'PSH' },
  { id: 'drug_history', label: 'Drugs' },
  { id: 'allergies', label: 'Allergies' },
  { id: 'family_history', label: 'Family' },
  { id: 'social_history', label: 'Social' },
  { id: 'review_of_systems', label: 'ROS' },
  { id: 'functional_assessment', label: 'Function' },
  { id: 'general_exam', label: 'Gen Exam' },
  { id: 'systemic_exam', label: 'Sys Exam' },
  { id: 'clinical_reasoning', label: 'DDx' },
  { id: 'differentials', label: 'Diffs' },
  { id: 'investigations', label: 'Tests' },
  { id: 'diagnosis', label: 'Dx' },
  { id: 'management', label: 'Mgt' },
  { id: 'disposition', label: 'D/C' },
  { id: 'discharge_admission_referral', label: 'Refer' },
  { id: 'follow_up', label: 'F/U' },
  { id: 'analytics', label: 'Stats' },
];

export function PhaseNavigator({ currentPhase, completedPhases, onPhaseSelect }: Props) {
  return (
    <div className="ce-phase-bar">
      <div className="ce-phase-scroll">
        {ALL_PHASES.map(({ id, label }) => {
          const isActive = id === currentPhase;
          const isComplete = completedPhases.includes(id);
          const isLocked = false; // Allow revisiting

          return (
            <button
              key={id}
              className={`ce-phase-btn ${isActive ? 'ce-phase-active' : ''} ${isComplete ? 'ce-phase-complete' : ''}`}
              onClick={() => onPhaseSelect(id)}
              title={label}
            >
              {isComplete ? '✓' : isActive ? '●' : '○'}
              <span className="ce-phase-label">{label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .ce-phase-bar {
          background: var(--ce-phase-bg);
          border-top: 1px solid var(--ce-phase-border);
          padding: 8px 16px;
          flex-shrink: 0;
          overflow-x: auto;
        }
        .ce-phase-scroll {
          display: flex;
          gap: 2px;
          min-width: max-content;
        }
        .ce-phase-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px;
          border: none; border-radius: var(--ce-radius-md);
          background: transparent;
          color: var(--ce-text-muted);
          font-size: 11px; font-weight: 500;
          cursor: pointer; transition: all var(--ce-transition);
          white-space: nowrap;
          line-height: 1.2;
        }
        .ce-phase-btn:hover {
          background: var(--ce-sky-50);
          color: var(--ce-text);
        }
        .ce-phase-active {
          background: var(--ce-phase-active) !important;
          color: var(--ce-phase-active-text) !important;
          font-weight: 600;
        }
        .ce-phase-complete {
          color: var(--ce-phase-complete);
        }
        .ce-phase-label {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
