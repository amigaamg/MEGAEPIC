'use client';
import React, { useState } from 'react';
import type { SystemicModuleDef, ExamFindingGroupDef } from '@/lib/clinical/constitutional/examination-knowledge';
import { ExamFindingInput } from './ExamFindingInput';

interface Props {
  modules: SystemicModuleDef[];
  findings: Record<string, { value: unknown }>;
  onAnswer: (findingId: string, value: unknown) => void;
  activeModuleId?: string;
  onModuleSelect?: (moduleId: string) => void;
}

export function SystemicExamPanel({ modules, findings, onAnswer, activeModuleId, onModuleSelect }: Props) {
  const [localActiveModule, setLocalActiveModule] = useState<string>(
    activeModuleId || (modules.length > 0 ? modules[0].id : ''),
  );

  const activeId = activeModuleId || localActiveModule;
  const activeModule = modules.find(m => m.id === activeId);

  const handleModuleSelect = (id: string) => {
    setLocalActiveModule(id);
    onModuleSelect?.(id);
  };

  if (modules.length === 0) return null;

  return (
    <div className="ec-exam-section">
      <div className="ec-exam-section-title">Systemic Examination</div>

      <div className="ec-exam-module-tabs">
        {modules.map(mod => (
          <button key={mod.id}
            className={`ec-exam-module-tab ${mod.id === activeId ? 'ec-exam-module-tab-active' : ''}`}
            onClick={() => handleModuleSelect(mod.id)}>
            {mod.label}
          </button>
        ))}
      </div>

      {activeModule && (
        <div className="ec-exam-module-content">
          <div className="ec-exam-module-header">
            {activeModule.label}
            <span className="ec-exam-module-sequence">
              {activeModule.sequence.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' → ')}
            </span>
          </div>

          {activeModule.findingGroups.map(group => (
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
      )}
    </div>
  );
}
