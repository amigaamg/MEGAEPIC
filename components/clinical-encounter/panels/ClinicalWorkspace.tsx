'use client';
import React from 'react';
import { Differential, ClinicalObjective, ManagementItem } from '@/lib/amexan/encounter-engine/types/ces';

interface Props {
  problemList: string[];
  differentials: Differential[];
  redFlags: string[];
  missingInfo: string[];
  objectives: ClinicalObjective[];
  managementPlan: ManagementItem[];
}

const DANGER_COLORS: Record<string, string> = {
  critical: '#D93025',
  high: '#E37400',
  moderate: '#F9AB00',
  low: '#1E8E3E',
};

export function ClinicalWorkspace({ problemList, differentials, redFlags, missingInfo, objectives, managementPlan }: Props) {
  return (
    <div className="ce-workspace-panel">
      {/* Header */}
      <div className="ce-workspace-header">
        <span className="ce-workspace-title">Clinical Reasoning</span>
      </div>

      <div className="ce-workspace-scroll ce-scrollbar">
        {/* Problem List */}
        <div className="ce-ws-section">
          <div className="ce-ws-section-header">
            <span className="ce-ws-section-icon">△</span>
            <span className="ce-ws-section-label">Problems</span>
            <span className="ce-ws-section-count">{problemList.length}</span>
          </div>
          {problemList.length === 0 ? (
            <div className="ce-ws-empty">Questions answered will appear here</div>
          ) : (
            <div className="ce-ws-list">
              {problemList.map((p, i) => (
                <div key={i} className="ce-ws-list-item">{p}</div>
              ))}
            </div>
          )}
        </div>

        {/* Differentials */}
        <div className="ce-ws-section">
          <div className="ce-ws-section-header">
            <span className="ce-ws-section-icon">◈</span>
            <span className="ce-ws-section-label">Differentials</span>
            <span className="ce-ws-section-count">{differentials.length}</span>
          </div>
          {differentials.length === 0 ? (
            <div className="ce-ws-empty">Complete HPI to generate differentials</div>
          ) : (
            <div className="ce-ws-list">
              {differentials.map(d => (
                <div key={d.diseaseId || d.rank} className="ce-ws-dd-item">
                  <div className="ce-ws-dd-top">
                    <span className="ce-ws-dd-name">{d.rank}. {d.diseaseName}</span>
                    <span className="ce-ws-dd-prob">{d.probability}%</span>
                  </div>
                  {d.supporting.length > 0 && (
                    <div className="ce-ws-dd-detail">
                      <span className="ce-ws-dd-label">For: </span>
                      <span className="ce-ws-dd-text">{d.supporting.slice(0, 3).join(', ')}{d.supporting.length > 3 ? '…' : ''}</span>
                    </div>
                  )}
                  {d.against.length > 0 && (
                    <div className="ce-ws-dd-detail">
                      <span className="ce-ws-dd-label ce-ws-dd-against">Against: </span>
                      <span className="ce-ws-dd-text">{d.against.slice(0, 2).join(', ')}{d.against.length > 2 ? '…' : ''}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <div className="ce-ws-section">
            <div className="ce-ws-section-header">
              <span className="ce-ws-section-icon" style={{ color: 'var(--ce-danger)' }}>⚠</span>
              <span className="ce-ws-section-label" style={{ color: 'var(--ce-danger)' }}>Red Flags</span>
              <span className="ce-ws-section-count" style={{ color: 'var(--ce-danger)' }}>{redFlags.length}</span>
            </div>
            <div className="ce-ws-list">
              {redFlags.map((rf, i) => (
                <div key={i} className="ce-ws-rf-item">{rf}</div>
              ))}
            </div>
          </div>
        )}

        {/* Management Plan */}
        {managementPlan.length > 0 && (
          <div className="ce-ws-section">
            <div className="ce-ws-section-header">
              <span className="ce-ws-section-icon">★</span>
              <span className="ce-ws-section-label">Management Plan</span>
              <span className="ce-ws-section-count">{managementPlan.length}</span>
            </div>
            <div className="ce-ws-list">
              {managementPlan.map((item, i) => (
                <div key={item.id || i} className="ce-ws-list-item">
                  <div style={{ fontSize: 11, fontWeight: 600, color: item.category === 'emergency' ? 'var(--ce-danger)' : 'var(--ce-text)', marginBottom: 2 }}>
                    {item.category === 'emergency' ? '⚡ ' : item.category === 'definitive' ? '◆ ' : item.category === 'supportive' ? '○ ' : '▹ '}
                    {item.action}
                  </div>
                  {item.details && <div style={{ fontSize: 10, color: 'var(--ce-text-secondary)', lineHeight: 1.4 }}>{item.details}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Information */}
        <div className="ce-ws-section">
          <div className="ce-ws-section-header">
            <span className="ce-ws-section-icon">○</span>
            <span className="ce-ws-section-label">Missing</span>
            <span className="ce-ws-section-count">{missingInfo.length}</span>
          </div>
          {missingInfo.length === 0 ? (
            <div className="ce-ws-empty">No missing information</div>
          ) : (
            <div className="ce-ws-list">
              {missingInfo.map((mi, i) => (
                <div key={i} className="ce-ws-mi-item">{mi}</div>
              ))}
            </div>
          )}
        </div>

        {/* Objectives / Progress */}
        {objectives.length > 0 && (
          <div className="ce-ws-section">
            <div className="ce-ws-section-header">
              <span className="ce-ws-section-icon">◷</span>
              <span className="ce-ws-section-label">Progress</span>
            </div>
            <div className="ce-ws-objectives">
              {objectives.map(obj => {
                const pct = obj.required > 0 ? Math.round((obj.completed / obj.required) * 100) : 0;
                return (
                  <div key={obj.id} className="ce-ws-obj-item">
                    <div className="ce-ws-obj-label">{obj.label}</div>
                    <div className="ce-ws-obj-bar">
                      <div className="ce-ws-obj-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="ce-ws-obj-pct">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{wsStyles}</style>
    </div>
  );
}

const wsStyles = `
  .ce-workspace-panel {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
    background: var(--ce-workspace-bg);
    border-right: 1px solid var(--ce-workspace-border);
  }
  .ce-workspace-header {
    padding: var(--ce-space-lg) var(--ce-space-xl);
    border-bottom: 1px solid var(--ce-border-light);
    flex-shrink: 0;
  }
  .ce-workspace-title {
    font-size: 13px; font-weight: 600; color: var(--ce-text-secondary);
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .ce-workspace-scroll {
    flex: 1; overflow-y: auto;
    padding: var(--ce-space-sm) var(--ce-space-xl) var(--ce-space-2xl);
  }
  .ce-ws-section {
    margin-bottom: var(--ce-space-lg);
  }
  .ce-ws-section-header {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 6px;
  }
  .ce-ws-section-icon {
    font-size: 12px; color: var(--ce-text-muted);
  }
  .ce-ws-section-label {
    font-size: 11px; font-weight: 600; color: var(--ce-text-secondary);
    text-transform: uppercase; letter-spacing: 0.04em;
    flex: 1;
  }
  .ce-ws-section-count {
    font-size: 10px; font-weight: 600; color: var(--ce-text-muted);
    background: var(--ce-surface-alt); padding: 1px 6px;
    border-radius: 999px;
  }
  .ce-ws-empty {
    font-size: 11px; color: var(--ce-text-muted); font-style: italic;
    padding: 4px 0;
  }
  .ce-ws-list {
    display: flex; flex-direction: column; gap: 2px;
  }
  .ce-ws-list-item {
    font-size: 12px; color: var(--ce-text);
    padding: 3px 8px; border-radius: var(--ce-radius-sm);
    background: var(--ce-surface-alt);
  }
  .ce-ws-dd-item {
    padding: 6px 8px; border-radius: var(--ce-radius-sm);
    background: var(--ce-surface-alt);
    margin-bottom: 3px;
  }
  .ce-ws-dd-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 2px;
  }
  .ce-ws-dd-name {
    font-size: 12px; font-weight: 500; color: var(--ce-text);
  }
  .ce-ws-dd-prob {
    font-size: 11px; font-weight: 600; color: var(--ce-sky-600);
  }
  .ce-ws-dd-detail {
    font-size: 11px; line-height: 1.4;
  }
  .ce-ws-dd-label {
    color: var(--ce-success); font-weight: 500;
  }
  .ce-ws-dd-against {
    color: var(--ce-danger);
  }
  .ce-ws-dd-text { color: var(--ce-text-secondary); }
  .ce-ws-rf-item {
    font-size: 12px; color: var(--ce-danger);
    padding: 4px 8px; border-radius: var(--ce-radius-sm);
    background: #FFEBEE; margin-bottom: 2px;
  }
  .ce-ws-mi-item {
    font-size: 12px; color: var(--ce-text-secondary);
    padding: 3px 8px; border-radius: var(--ce-radius-sm);
    background: var(--ce-surface-alt);
    margin-bottom: 2px;
  }
  .ce-ws-mi-item::before {
    content: '○ '; color: var(--ce-warning);
  }
  .ce-ws-objectives {
    display: flex; flex-direction: column; gap: 4px;
  }
  .ce-ws-obj-item {
    display: flex; align-items: center; gap: 6px;
  }
  .ce-ws-obj-label {
    font-size: 11px; color: var(--ce-text-secondary);
    min-width: 90px; flex-shrink: 0;
  }
  .ce-ws-obj-bar {
    flex: 1; height: 4px;
    background: var(--ce-border-light);
    border-radius: 2px; overflow: hidden;
  }
  .ce-ws-obj-fill {
    height: 100%; background: var(--ce-sky-400);
    border-radius: 2px; transition: width 300ms ease;
  }
  .ce-ws-obj-pct {
    font-size: 10px; color: var(--ce-text-muted);
    min-width: 28px; text-align: right;
  }
`;
