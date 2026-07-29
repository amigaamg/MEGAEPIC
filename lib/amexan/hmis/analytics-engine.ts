// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XXIV: Analytics Engine
// Reporting, dashboards, BI integration, data warehouse, predictive analytics.
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  type: ReportType;
  format: ReportFormat;
  schedule?: ReportSchedule;
  parameters: ReportParameter[];
  dataSource: string;
  query: string;
  visualization: VisualizationConfig;
  permissions: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export enum ReportCategory {
  Clinical = 'clinical',
  Operational = 'operational',
  Financial = 'financial',
  Administrative = 'administrative',
  Regulatory = 'regulatory',
  Quality = 'quality',
  Research = 'research',
  PublicHealth = 'public_health',
  Inventory = 'inventory',
  HR = 'hr',
  Custom = 'custom',
}

export enum ReportType {
  Tabular = 'tabular',
  Summary = 'summary',
  Trend = 'trend',
  Comparative = 'comparative',
  Detail = 'detail',
  Aggregate = 'aggregate',
  DrillDown = 'drill_down',
  Dashboard = 'dashboard',
  KPI = 'kpi',
  Export = 'export',
}

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  Excel = 'excel',
  HTML = 'html',
  JSON = 'json',
  Image = 'image',
  Interactive = 'interactive',
}

export interface ReportSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  lastRunAt?: number;
  nextRunAt?: number;
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'date' | 'date_range' | 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'department' | 'provider' | 'patient';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  source?: string;
}

export interface VisualizationConfig {
  type: VisualizationType;
  title: string;
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'percentage';
  filters?: Record<string, unknown>;
  colors?: string[];
  showLegend: boolean;
  showDataLabels: boolean;
  interactive: boolean;
  height: number;
}

export enum VisualizationType {
  Table = 'table',
  BarChart = 'bar_chart',
  LineChart = 'line_chart',
  PieChart = 'pie_chart',
  DonutChart = 'donut_chart',
  AreaChart = 'area_chart',
  ScatterPlot = 'scatter_plot',
  Heatmap = 'heatmap',
  Funnel = 'funnel',
  Gauge = 'gauge',
  MetricCard = 'metric_card',
  Timeline = 'timeline',
  Map = 'map',
  TreeMap = 'tree_map',
  StackedBar = 'stacked_bar',
  HorizontalBar = 'horizontal_bar',
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  owner: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  refreshInterval: number;
  isPublic: boolean;
  sharedWith: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DashboardWidget {
  id: string;
  reportId: string;
  title: string;
  visualization: VisualizationConfig;
  position: WidgetPosition;
  size: WidgetSize;
  parameters: Record<string, string>;
  refreshInterval: number;
}

export interface WidgetPosition {
  row: number;
  col: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  gap: number;
}

export interface DashboardFilter {
  field: string;
  label: string;
  type: ReportParameter['type'];
  defaultValue?: string;
  options?: string[];
}

export interface DataWarehouseQuery {
  id: string;
  name: string;
  query: string;
  parameters: string[];
  cacheTTL: number;
  lastExecutedAt?: number;
  executionCount: number;
  averageExecutionTime: number;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: PredictiveModelType;
  target: string;
  features: string[];
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrainedAt?: number;
  trainingDataSize: number;
  isActive: boolean;
}

export enum PredictiveModelType {
  ReadmissionRisk = 'readmission_risk',
  LengthOfStay = 'length_of_stay',
  MortalityRisk = 'mortality_risk',
  DeteriorationRisk = 'deterioration_risk',
  SepsisOnset = 'sepsis_onset',
  NoShowRisk = 'no_show_risk',
  DefaultRisk = 'default_risk',
  FraudDetection = 'fraud_detection',
  DrugInteractionRisk = 'drug_interaction_risk',
  DiseaseOutbreak = 'disease_outbreak',
}

export interface AnalyticsStats {
  totalReports: number;
  activeDashboards: number;
  totalQueries: number;
  weeklyReportRuns: number;
  averageLoadTime: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  mostUsedReports: { name: string; count: number }[];
}

export function createReport(params: {
  name: string; description: string; category: ReportCategory; type: ReportType;
  format: ReportFormat; dataSource: string; query: string; visualization: VisualizationConfig;
  parameters?: ReportParameter[]; permissions?: string[];
}): ReportDefinition {
  return {
    id: `RPT-${Date.now().toString(36).toUpperCase()}`,
    name: params.name, description: params.description,
    category: params.category, type: params.type, format: params.format,
    dataSource: params.dataSource, query: params.query,
    visualization: params.visualization,
    parameters: params.parameters || [],
    permissions: params.permissions || ['admin'],
    isActive: true, createdAt: Date.now(), updatedAt: Date.now(),
  };
}

export function getAnalyticsStats(reports: ReportDefinition[], dashboards: AnalyticsDashboard[]): AnalyticsStats {
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const r of reports) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    byType[r.type] = (byType[r.type] || 0) + 1;
  }
  return {
    totalReports: reports.length,
    activeDashboards: dashboards.length,
    totalQueries: 0,
    weeklyReportRuns: 0,
    averageLoadTime: 0,
    byCategory, byType,
    mostUsedReports: [],
  };
}
