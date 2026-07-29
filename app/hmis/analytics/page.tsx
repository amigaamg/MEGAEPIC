'use client';
import { useState, useMemo } from 'react';
import { ReportCategory, ReportType, ReportFormat, VisualizationType, createReport, getAnalyticsStats } from '@/lib/amexan/hmis/analytics-engine';
import type { ReportDefinition, AnalyticsDashboard } from '@/lib/amexan/hmis/analytics-engine';

const MOCK_REPORTS: ReportDefinition[] = [
  createReport({ name: 'Daily Encounter Summary', description: 'Summary of all encounters for the current day', category: ReportCategory.Operational, type: ReportType.Summary, format: ReportFormat.HTML, dataSource: 'encounters', query: 'SELECT * FROM encounters WHERE DATE(createdAt) = CURRENT_DATE', visualization: { type: VisualizationType.BarChart, title: 'Encounters by Department', xAxis: 'department', yAxis: 'count', aggregation: 'count', showLegend: true, showDataLabels: true, interactive: true, height: 300 }, permissions: ['admin', 'manager'] }),
  createReport({ name: 'Revenue by Department', description: 'Monthly revenue breakdown by department', category: ReportCategory.Financial, type: ReportType.Aggregate, format: ReportFormat.Excel, dataSource: 'billing', query: 'SELECT department, SUM(amount) FROM invoices GROUP BY department', visualization: { type: VisualizationType.DonutChart, title: 'Revenue Distribution', groupBy: 'department', aggregation: 'sum', showLegend: true, showDataLabels: true, interactive: true, height: 350 }, parameters: [{ name: 'month', label: 'Month', type: 'date', required: true }], permissions: ['admin', 'finance'] }),
  createReport({ name: 'Bed Occupancy Rate', description: 'Current bed occupancy across all wards', category: ReportCategory.Operational, type: ReportType.KPI, format: ReportFormat.HTML, dataSource: 'hospital', query: 'SELECT ward, occupied, total FROM beds', visualization: { type: VisualizationType.Gauge, title: 'Occupancy Rate', aggregation: 'percentage', showLegend: false, showDataLabels: true, interactive: false, height: 200 }, permissions: ['admin', 'nurse_manager'] }),
  createReport({ name: 'Prescription Trends', description: 'Monthly prescription volume by drug class', category: ReportCategory.Clinical, type: ReportType.Trend, format: ReportFormat.PDF, dataSource: 'pharmacy', query: 'SELECT drugClass, COUNT(*) FROM prescriptions GROUP BY drugClass', visualization: { type: VisualizationType.LineChart, title: 'Prescription Trends', xAxis: 'month', yAxis: 'count', aggregation: 'count', showLegend: true, showDataLabels: true, interactive: true, height: 300 }, permissions: ['admin', 'pharmacist'] }),
  createReport({ name: 'No-Show Analysis', description: 'Patient no-show rates by department and time slot', category: ReportCategory.Quality, type: ReportType.Comparative, format: ReportFormat.CSV, dataSource: 'scheduling', query: 'SELECT department, timeSlot, COUNT(*) FROM appointments WHERE status = "no_show" GROUP BY department, timeSlot', visualization: { type: VisualizationType.Heatmap, title: 'No-Show Heatmap', xAxis: 'timeSlot', yAxis: 'department', aggregation: 'count', showLegend: true, showDataLabels: false, interactive: true, height: 400 }, parameters: [{ name: 'startDate', label: 'Start Date', type: 'date', required: true }, { name: 'endDate', label: 'End Date', type: 'date', required: true }], permissions: ['admin', 'manager'] }),
];

export default function AnalyticsPage() {
  const [reports] = useState(MOCK_REPORTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const stats = useMemo(() => getAnalyticsStats(reports, []), [reports]);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [reports, search, categoryFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Analytics Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XXIV — Reporting, dashboards, BI, data warehouse, predictive models</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#22C55E,#16A34A)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Create Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Reports', value: stats.totalReports, color: '#22C55E' }, { label: 'Dashboards', value: stats.activeDashboards, color: '#3B82F6' }, { label: 'Categories', value: Object.keys(stats.byCategory).length, color: '#8B5CF6' }, { label: 'Types', value: Object.keys(stats.byType).length, color: '#F59E0B' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as ReportCategory | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Categories</option>
          {Object.values(ReportCategory).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(r => {
          const isSelected = selectedReport === r.id;
          return (
            <div key={r.id} onClick={() => setSelectedReport(isSelected ? null : r.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{r.description} · {r.dataSource}</div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{r.category}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{r.type} · {r.format}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>Visualization: {r.visualization.type}</div>
                  <div style={{ fontSize: 11, color: '#E2E8F0' }}>{r.visualization.title} · {r.visualization.xAxis && `X: ${r.visualization.xAxis}`} · {r.visualization.yAxis && `Y: ${r.visualization.yAxis}`} · Agg: {r.visualization.aggregation}</div>
                  {r.parameters.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>Parameters ({r.parameters.length})</div>
                      {r.parameters.map((p, i) => <div key={i} style={{ fontSize: 11, color: '#94A3B8' }}>{p.label} ({p.type}){p.required ? ' *' : ''}</div>)}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}><span style={{ fontSize: 11, color: '#64748B' }}>Permissions: </span>{r.permissions.map(p => <span key={p} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8', marginRight: 4 }}>{p}</span>)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
