'use client';
import React, { useState } from 'react';
import { TimelineEntry, ManagementItem } from '@/lib/amexan/encounter-engine/types/ces';

interface Props {
  narrative: string;
  deterministicNarrative: string;
  isAiEnhanced: boolean;
  isAiLoading: boolean;
  timeline: TimelineEntry[];
  clinicalNotes: Record<string, string>;
  managementPlan?: ManagementItem[];
}

export function DocumentationPanel({
  narrative,
  deterministicNarrative,
  isAiEnhanced,
  isAiLoading,
  timeline,
  clinicalNotes,
  managementPlan,
}: Props) {
  const [showDeterministic, setShowDeterministic] = useState(false);

  const displayNarrative = showDeterministic ? deterministicNarrative : narrative;

  return (
    <div className="ce-doc-panel">
      {/* Header */}
      <div className="ce-doc-header">
        <div className="ce-doc-title">Documentation</div>
        {isAiLoading && (
          <span className="ce-doc-badge ce-pulse">AI writing…</span>
        )}
        {isAiEnhanced && !isAiLoading && (
          <span className="ce-doc-badge ce-doc-badge-ai">AI-enhanced</span>
        )}
      </div>

      {/* Narrative */}
      <div className="ce-doc-scroll ce-scrollbar">
        <div className="ce-doc-section">
          <div className="ce-doc-section-label">HISTORY OF PRESENTING ILLNESS</div>
          {displayNarrative ? (
            <p className="ce-doc-paragraph">{displayNarrative}</p>
          ) : (
            <p className="ce-doc-placeholder">Answer questions to generate the HPI narrative…</p>
          )}
        </div>

        {/* AI toggle */}
        {isAiEnhanced && (
          <button className="ce-doc-toggle" onClick={() => setShowDeterministic(v => !v)}>
            {showDeterministic ? 'Show AI version' : 'Show deterministic version'}
          </button>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="ce-doc-section">
            <div className="ce-doc-section-label">TIMELINE</div>
            <div className="ce-doc-timeline">
              {timeline.map((entry, i) => (
                <div key={entry.id || i} className="ce-doc-timeline-item">
                  <div className="ce-doc-timeline-dot" />
                  <div className="ce-doc-timeline-content">
                    <div className="ce-doc-timeline-date">{entry.date || entry.relative}</div>
                    <div className="ce-doc-timeline-events">
                      {entry.events.map((ev, j) => (
                        <span key={j} className="ce-doc-timeline-event">{ev}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Notes (problem list, differentials) — compact */}
        {clinicalNotes.problem_list && (
          <div className="ce-doc-section">
            <div className="ce-doc-section-label">PROBLEM LIST</div>
            <div className="ce-doc-compact-list">{clinicalNotes.problem_list}</div>
          </div>
        )}

        {clinicalNotes.differentials && (
          <div className="ce-doc-section">
            <div className="ce-doc-section-label">DIFFERENTIALS</div>
            <div className="ce-doc-compact-list">{clinicalNotes.differentials}</div>
          </div>
        )}

        {clinicalNotes.red_flags && (
          <div className="ce-doc-section">
            <div className="ce-doc-section-label">RED FLAGS</div>
            <div className="ce-doc-compact-list">{clinicalNotes.red_flags}</div>
          </div>
        )}

        {/* Management Plan */}
        {managementPlan && managementPlan.length > 0 && (
          <div className="ce-doc-section">
            <div className="ce-doc-section-label">MANAGEMENT PLAN</div>
            <div className="ce-doc-compact-list">
              {managementPlan.map((item, i) => (
                <div key={item.id || i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{item.action}</div>
                  {item.details && <div style={{ fontSize: 10, color: '#5F6368' }}>{item.details}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{docStyles}</style>
    </div>
  );
}

const docStyles = `
  .ce-doc-panel {
    width: 25%; min-width: 280px;
    display: flex; flex-direction: column;
    background: var(--ce-doc-bg);
    border-left: 1px solid var(--ce-doc-border);
  }
  .ce-doc-header {
    display: flex; align-items: center; gap: 8px;
    padding: var(--ce-space-lg) var(--ce-space-xl);
    border-bottom: 1px solid var(--ce-border-light);
    flex-shrink: 0;
  }
  .ce-doc-title {
    font-size: 13px; font-weight: 600; color: var(--ce-text-secondary);
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .ce-doc-badge {
    font-size: 10px; font-weight: 600; padding: 2px 8px;
    border-radius: 999px; text-transform: uppercase;
    background: #FFF8E1; color: #F9AB00;
  }
  .ce-doc-badge-ai {
    background: #E8F5E9; color: #1E8E3E;
  }
  .ce-doc-scroll {
    flex: 1; overflow-y: auto;
    padding: var(--ce-space-md) var(--ce-space-xl) var(--ce-space-2xl);
  }
  .ce-doc-section {
    margin-bottom: var(--ce-space-lg);
  }
  .ce-doc-section-label {
    font-size: 10px; font-weight: 700; color: var(--ce-text-muted);
    letter-spacing: 0.06em; margin-bottom: 6px;
  }
  .ce-doc-paragraph {
    font-size: 12px; line-height: 1.65; color: var(--ce-doc-text);
    white-space: pre-wrap;
  }
  .ce-doc-placeholder {
    font-size: 12px; color: var(--ce-text-muted); font-style: italic;
  }
  .ce-doc-toggle {
    font-size: 11px; color: var(--ce-sky-600);
    background: none; border: none; cursor: pointer;
    padding: 4px 0; margin-bottom: var(--ce-space-lg);
    text-decoration: underline; text-underline-offset: 2px;
  }
  .ce-doc-timeline {
    display: flex; flex-direction: column; gap: 6px;
  }
  .ce-doc-timeline-item {
    display: flex; gap: 8px;
  }
  .ce-doc-timeline-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--ce-sky-300);
    margin-top: 5px; flex-shrink: 0;
  }
  .ce-doc-timeline-content {
    flex: 1; min-width: 0;
  }
  .ce-doc-timeline-date {
    font-size: 10px; color: var(--ce-text-muted); font-weight: 600;
  }
  .ce-doc-timeline-events {
    display: flex; flex-direction: column; gap: 1px;
  }
  .ce-doc-timeline-event {
    font-size: 11px; color: var(--ce-doc-text);
  }
  .ce-doc-compact-list {
    font-size: 11px; line-height: 1.5; color: var(--ce-doc-text);
    white-space: pre-wrap;
  }
`;
