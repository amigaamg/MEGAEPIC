import type { ComplaintEngineOutput } from './types';

export function generateChiefComplaintReportHTML(output: ComplaintEngineOutput, patientName: string, date: string): string {
  const { complaints, primary, chronologicalOrder, timeline, graph, consistencyChecks, completion, activatedSchemas, emergencyOverride, narrative } = output;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Chief Complaint Intake Report - ${escapeHtml(patientName)}</title>
<style>
  @page { margin: 20mm 15mm; size: A4; }
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a2e;
    background: white;
    padding: 0;
    margin: 0;
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #0d9488;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  .header h1 { font-size: 18pt; color: #0d9488; margin: 0; }
  .header p { font-size: 9pt; color: #666; margin: 4px 0 0 0; }
  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 9pt;
    color: #555;
    margin-bottom: 15px;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 4px;
  }
  .section-title {
    font-size: 13pt;
    font-weight: bold;
    color: #0d9488;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 18px;
    margin-bottom: 8px;
  }
  .subsection-title {
    font-size: 11pt;
    font-weight: 600;
    color: #334155;
    margin-top: 12px;
    margin-bottom: 4px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 10pt;
  }
  th, td {
    border: 1px solid #e2e8f0;
    padding: 6px 10px;
    text-align: left;
  }
  th {
    background: #f1f5f9;
    font-weight: 600;
    font-size: 9pt;
    color: #475569;
  }
  tr:nth-child(even) { background: #f8fafc; }
  .primary-row { background: #fefce8 !important; }
  .redflag-row { background: #fef2f2 !important; }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 8pt;
    font-weight: 600;
  }
  .badge-primary { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }
  .badge-redflag { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .badge-severe { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
  .timeline-item {
    display: flex;
    align-items: flex-start;
    margin: 4px 0;
  }
  .timeline-dot {
    width: 10px; height: 10px;
    background: #0d9488;
    border-radius: 50%;
    margin-right: 10px;
    margin-top: 5px;
    flex-shrink: 0;
  }
  .timeline-day { font-weight: 600; color: #0d9488; }
  .graph-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 12px 16px;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    line-height: 1.8;
  }
  .check-pass { color: #16a34a; }
  .check-fail { color: #dc2626; }
  .check-warning { color: #d97706; }
  .completion-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 16px;
  }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 8px 0; }
  .footer {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    font-size: 8pt;
    color: #999;
    text-align: center;
  }
  .highlight-box {
    background: #f0fdfa;
    border-left: 4px solid #0d9488;
    padding: 10px 14px;
    margin: 10px 0;
    border-radius: 4px;
  }
  .emergency-box {
    background: #fef2f2;
    border-left: 4px solid #dc2626;
    padding: 10px 14px;
    margin: 10px 0;
    border-radius: 4px;
    color: #991b1b;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>AMEXAN — Complaint Intake Report</h1>
    <p>Chief Complaint Engine — Structured Clinical Problem Documentation</p>
  </div>
  <div class="meta">
    <span>Patient: <strong>${escapeHtml(patientName)}</strong></span>
    <span>Date: ${date}</span>
    <span>Version: ACRS Complaint Engine v2.0</span>
  </div>`;

  // ── Emergency Override ──
  if (emergencyOverride) {
    html += `<div class="emergency-box">
      <strong>⚡ EMERGENCY OVERRIDE ACTIVE</strong><br/>
      Red flag complaint(s) detected. Emergency pathway activated immediately.<br/>
      <em>Complaints: ${complaints.filter(c => c.redFlagOverride).map(c => c.name).join(', ')}</em>
    </div>`;
  }

  // ── Primary Complaint ──
  html += `<div class="section-title">1. Presenting Complaint(s)</div>`;
  if (primary) {
    html += `<div class="highlight-box">
      <strong>PRIMARY COMPLAINT:</strong> ${escapeHtml(primary.name)} (${escapeHtml(primary.duration)})<br/>
      <span style="font-size: 9pt; color: #666;">
        Onset: ${primary.onset} | Severity: ${primary.severity} | Status: ${primary.status} | Certainty: ${primary.certainty} | Source: ${primary.source}
      </span>
    </div>`;
  }

  // ── All Complaints Table ──
  html += `<table>
    <tr>
      <th>Complaint</th>
      <th>Duration</th>
      <th>Onset</th>
      <th>Severity</th>
      <th>Status</th>
      <th>Relationship</th>
      <th>Category</th>
      <th>Schema</th>
    </tr>`;

  for (const c of complaints) {
    const rowClass = c.primary ? 'primary-row' : c.redFlagOverride ? 'redflag-row' : '';
    html += `<tr class="${rowClass}">
      <td>
        ${escapeHtml(c.name)}
        ${c.primary ? '<span class="badge badge-primary">PRIMARY</span>' : ''}
        ${c.redFlagOverride ? '<span class="badge badge-redflag">⚠</span>' : ''}
      </td>
      <td>${escapeHtml(c.duration)}<br/><span style="font-size:8pt;color:#999;">${c.durationHours}h</span></td>
      <td>${c.onset}</td>
      <td>${c.severity === 'Severe' ? `<span class="badge badge-severe">${c.severity}</span>` : c.severity}</td>
      <td>${c.status}</td>
      <td>${c.relationship}</td>
      <td>${c.category}</td>
      <td>${c.schemaActivated || '-'}</td>
    </tr>`;
  }
  html += `</table>`;

  // ── Chronological Timeline ──
  html += `<div class="section-title">2. Chronological Timeline</div>`;
  if (timeline.length === 0) {
    html += `<p>No timeline available.</p>`;
  } else {
    for (const entry of timeline) {
      html += `<div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <div class="timeline-day">${escapeHtml(entry.dayLabel)}</div>
          <div>${escapeHtml(entry.description)}</div>
          <div style="font-size: 8pt; color: #888; margin-top: 2px;">
            Complaints: ${entry.complaints.map(c => c.name + (c.primary ? ' (Primary)' : '')).join(', ')}
          </div>
        </div>
      </div>`;
    }
  }

  // ── Complaint Graph ──
  if (graph && narrative.graphText) {
    html += `<div class="section-title">3. Complaint Relationship Graph</div>
    <div class="graph-box">${escapeHtml(narrative.graphText)}</div>`;
  }

  // ── Activated Schemas ──
  html += `<div class="section-title">4. Activated Schemas</div>`;
  if (activatedSchemas.length === 0) {
    html += `<p>No schemas activated.</p>`;
  } else {
    html += `<ul>`;
    for (const schema of [...new Set(activatedSchemas)]) {
      html += `<li>${escapeHtml(schema)}</li>`;
    }
    html += `</ul>`;
  }

  // ── Consistency Checks ──
  if (consistencyChecks.length > 0) {
    html += `<div class="section-title">5. Clinical Consistency Checks</div>`;
    for (const check of consistencyChecks) {
      const icon = check.passed ? '✓' : '?';
      const color = check.passed ? 'check-pass' : check.severity === 'warning' ? 'check-warning' : 'check-fail';
      html += `<div class="${color}" style="margin: 4px 0;">
        <strong>${icon} ${escapeHtml(check.ruleId)}</strong> (${check.severity})<br/>
        <span style="font-size: 10pt;">${escapeHtml(check.message)}</span>
        ${check.clarification ? `<br/><em style="font-size: 9pt;">${escapeHtml(check.clarification)}</em>` : ''}
      </div>`;
    }
  }

  // ── Completion Criteria ──
  html += `<div class="section-title">6. Completion Criteria</div>
  <div style="margin-bottom: 8px;">
    <strong>Status:</strong> ${completion.met ? '<span class="check-pass">ALL CRITERIA MET</span>' : `<span class="check-fail">INCOMPLETE — ${completion.missing.length} issue(s)</span>`}
  </div>
  <div class="completion-grid">`;
  for (const [key, val] of Object.entries(completion.checks)) {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    html += `<div><span class="${val ? 'check-pass' : 'check-fail'}">${val ? '✓' : '✗'}</span> ${escapeHtml(label)}</div>`;
  }
  html += `</div>`;

  if (completion.missing.length > 0) {
    html += `<div style="margin-top: 8px; color: #dc2626; font-size: 10pt;">
      <strong>Missing:</strong> ${completion.missing.join('; ')}
    </div>`;
  }

  // ── Footer ──
  html += `
  <hr/>
  <div class="highlight-box">
    <strong>Narrative Summary</strong><br/>
    ${escapeHtml(narrative.chiefComplaintText)}
  </div>
  <div class="footer">
    <p>Generated by AMEXAN Clinical Engine | Complaint Intake Report | ${new Date().toLocaleString()}</p>
    <p>ACRS v2.0 — Chief Complaint Engine — All 23 Rules Enforced</p>
    <p>This document is for clinical purposes only.</p>
  </div>
</body>
</html>`;

  return html;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
