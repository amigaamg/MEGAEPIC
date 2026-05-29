'use client';
import { useState } from 'react';
import type { AIInsight } from '@/lib/encounterTypes';

const CSS = `
  .ip-panel{display:flex;flex-direction:column;height:100%}
  .ip-header{padding:16px;border-bottom:1px solid rgba(255,255,255,.04);flex-shrink:0}
  .ip-header-title{font-size:.75rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.08em}
  .ip-header-sub{font-size:.625rem;color:#334155;margin-top:2px}

  .ip-section{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.04)}
  .ip-section-title{font-size:.625rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;display:flex;align-items:center;gap:6px}

  .ip-alert{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:8px;margin-bottom:6px;font-size:.75rem;line-height:1.4}
  .ip-alert.critical{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#FCA5A5}
  .ip-alert.warning{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15);color:#FCD34D}
  .ip-alert.info{background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.15);color:#93C5FD}
  .ip-alert-icon{flex-shrink:0;font-size:.875rem}
  .ip-alert-title{font-weight:500;margin-bottom:2px}
  .ip-alert-desc{opacity:.7;font-size:.6875rem}

  .ip-diff{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;margin-bottom:4px;background:rgba(255,255,255,.02);font-size:.75rem}
  .ip-diff-name{flex:1;color:#94A3B8}
  .ip-diff-pct{font-weight:600;font-family:'JetBrains Mono',monospace;font-size:.6875rem}
  .ip-diff-bar{width:60px;height:3px;border-radius:2px;background:rgba(255,255,255,.06);overflow:hidden;flex-shrink:0}
  .ip-diff-bar-fill{height:100%;border-radius:2px;transition:width .5s}

  .ip-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:4px;font-size:.625rem;font-weight:500;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:#64748B;margin:0 3px 4px 0}

  .ip-empty{padding:24px 16px;text-align:center;font-size:.75rem;color:#475569;line-height:1.5}
`;

interface IntelligencePanelProps {
  insights: AIInsight[];
  departmentColor: string;
}

export function IntelligencePanel({ insights, departmentColor }: IntelligencePanelProps) {
  const critical = insights.filter(i => i.severity === 'critical');
  const warnings = insights.filter(i => i.severity === 'warning');
  const info = insights.filter(i => i.severity === 'info');
  const diffs = insights.filter(i => i.type === 'differential');
  const suggestions = insights.filter(i => i.type === 'suggestion');
  const protocols = insights.filter(i => i.type === 'protocol');

  return (
    <>
      <style>{CSS}</style>
      <div className="ip-panel">
        <div className="ip-header">
          <div className="ip-header-title" style={{ color: departmentColor }}>AI Clinical Assistant</div>
          <div className="ip-header-sub">Real-time intelligence</div>
        </div>

        {/* Alerts */}
        {(critical.length > 0 || warnings.length > 0) && (
          <div className="ip-section">
            <div className="ip-section-title">⚠ Alerts</div>
            {critical.map(a => (
              <div key={a.id} className="ip-alert critical">
                <span className="ip-alert-icon">🚨</span>
                <div><div className="ip-alert-title">{a.title}</div><div className="ip-alert-desc">{a.description}</div></div>
              </div>
            ))}
            {warnings.map(a => (
              <div key={a.id} className="ip-alert warning">
                <span className="ip-alert-icon">⚠️</span>
                <div><div className="ip-alert-title">{a.title}</div><div className="ip-alert-desc">{a.description}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Differentials */}
        {diffs.length > 0 && (
          <div className="ip-section">
            <div className="ip-section-title">🧠 Differentials</div>
            {diffs.map(d => {
              const pct = parseInt(d.description.match(/\d+/)?.[0] || '0');
              return (
                <div key={d.id} className="ip-diff">
                  <span className="ip-diff-name">{d.title}</span>
                  <div className="ip-diff-bar"><div className="ip-diff-bar-fill" style={{ width: `${pct}%`, background: departmentColor }} /></div>
                  <span className="ip-diff-pct" style={{ color: departmentColor }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Suggested Investigations */}
        {suggestions.length > 0 && (
          <div className="ip-section">
            <div className="ip-section-title">🧪 Suggested</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {suggestions.map(s => (
                <span key={s.id} className="ip-chip">{s.title}</span>
              ))}
            </div>
          </div>
        )}

        {/* Protocols */}
        {protocols.length > 0 && (
          <div className="ip-section">
            <div className="ip-section-title">📋 Clinical Protocols</div>
            {protocols.map(p => (
              <div key={p.id} className="ip-alert info">
                <span className="ip-alert-icon">📋</span>
                <div><div className="ip-alert-title">{p.title}</div><div className="ip-alert-desc">{p.description}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Info / Helpful suggestions */}
        {info.length > 0 && (
          <div className="ip-section">
            <div className="ip-section-title">💡 Insights</div>
            {info.map(i => (
              <div key={i.id} className="ip-alert info">
                <span className="ip-alert-icon">💡</span>
                <div><div className="ip-alert-title">{i.title}</div><div className="ip-alert-desc">{i.description}</div></div>
              </div>
            ))}
          </div>
        )}

        {insights.length === 0 && (
          <div className="ip-empty">
            No insights yet.<br />Complete clinical sections to activate AI analysis.
          </div>
        )}
      </div>
    </>
  );
}
