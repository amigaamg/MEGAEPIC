export enum AnalyticsMetric {
  Counter = 'counter',
  Gauge = 'gauge',
  Histogram = 'histogram',
  Summary = 'summary',
  Duration = 'duration',
  Rate = 'rate',
  Percentage = 'percentage',
  Ratio = 'ratio',
  ErrorRate = 'errorRate',
  Throughput = 'throughput',
}

export enum AnalyticsDimension {
  User = 'user',
  System = 'system',
  Application = 'application',
  Service = 'service',
  Database = 'database',
  Network = 'network',
  Resource = 'resource',
  Performance = 'performance',
  Business = 'business',
  Clinical = 'clinical',
}

export enum AnalyticsAggregationType {
  Sum = 'sum',
  Average = 'average',
  Min = 'min',
  Max = 'max',
  Count = 'count',
  Median = 'median',
  Percentile = 'percentile',
  StandardDeviation = 'stddev',
  Variance = 'variance',
  Rate = 'rate',
  Percentage = 'percentage',
}

export enum AnalyticsTimeframe {
  Second = 'second',
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
  All = 'all',
}

export enum AnalyticsAlertCondition {
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
  EqualTo = 'equalTo',
  NotEqualTo = 'notEqualTo',
  GreaterThanOrEqualTo = 'greaterThanOrEqualTo',
  LessThanOrEqualTo = 'lessThanOrEqualTo',
  Contains = 'contains',
  NotContains = 'notContains',
  Between = 'between',
  NotBetween = 'notBetween',
  IsNull = 'isNull',
  IsNotNull = 'isNotNull',
  IsTrue = 'isTrue',
  IsFalse = 'isFalse',
}

export interface AnalyticsMetricData {
  id: string
  metric: AnalyticsMetric
  dimension: AnalyticsDimension
  value: number
  unit?: string
  timestamp: number
  labels: Record<string, string>
  metadata?: Record<string, unknown>
}

export interface AnalyticsAggregation {
  id: string
  metric: AnalyticsMetric
  dimension: AnalyticsDimension
  aggregation: AnalyticsAggregationType
  value: number
  timeframe: AnalyticsTimeframe
  granularity: number
  groupBy: string[]
  filters?: Record<string, unknown>
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface AnalyticsDashboard {
  id: string
  name: string
  description?: string
  organizationId: string
  layout: {
    id: string
    x: number
    y: number
    w: number
    h: number
  }[]
  panels: {
    id: string
    title: string
    type: 'metric' | 'chart' | 'table' | 'heatmap'
    metric?: AnalyticsMetric
    dimension?: AnalyticsDimension
    aggregation?: AnalyticsAggregationType
    visualizationType?: 'line' | 'bar' | 'pie' | 'heatmap' | 'table'
    filters?: Record<string, unknown>
    refreshInterval?: number
  }[]
  isPublic: boolean
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface AnalyticsAlert {
  id: string
  name: string
  description?: string
  organizationId: string
  condition: {
    metric: AnalyticsMetric
    dimension: AnalyticsDimension
    aggregation: AnalyticsAggregationType
    operator: AnalyticsAlertCondition
    threshold: number
    timeframe: AnalyticsTimeframe
  }
  severity: 'critical' | 'high' | 'medium' | 'low'
  isActive: boolean
  notificationChannels: string[]
  createdBy: string
  createdAt: number
  lastTriggeredAt?: number
  triggeredCount: number
}

export interface AnalyticsReport {
  id: string
  name: string
  type: 'adhoc' | 'scheduled' | 'custom'
  format: 'pdf' | 'excel' | 'csv' | 'json'
  organizationId: string
  timeframe: {
    start: number
    end: number
    type: AnalyticsTimeframe
  }
  metrics: {
    metric: AnalyticsMetric
    dimension: AnalyticsDimension
    aggregation: AnalyticsAggregationType
    filters?: Record<string, unknown>
  }[]
  filters?: Record<string, unknown>
  createdBy: string
  createdAt: number
  status: 'pending' | 'generating' | 'completed' | 'failed'
  filePath?: string
  error?: string
}

export interface AnalyticsMetricDefinition {
  id: string
  name: string
  metric: AnalyticsMetric
  dimension: AnalyticsDimension
  description?: string
  unit?: string
  category: string
  isSystem: boolean
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface AnalyticsDataSource {
  id: string
  name: string
  type: 'database' | 'stream' | 'file' | 'api' | 'internal'
  connectionString: string
  configuration: Record<string, unknown>
  isActive: boolean
  lastSyncedAt?: number
  createdBy: string
  createdAt: number
}

export interface AnalyticsFilter {
  id: string
  name: string
  field: string
  operator: string
  value: unknown
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum'
  isActive: boolean
  createdBy: string
  createdAt: number
}

export interface AnalyticsMetricsSnapshot {
  id: string
  metricId: string
  dimension: AnalyticsDimension
  value: number
  timestamp: number
  timeframe: AnalyticsTimeframe
  groupBy: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface AnalyticsInsight {
  id: string
  title: string
  description: string
  type: 'trend' | 'pattern' | 'anomaly' | 'correlation' | 'prediction' | 'regression'
  severity: 'critical' | 'high' | 'medium' | 'low'
  confidence: number
  organizationId: string
  dataSource: string
  timestamp: number
  metadata?: Record<string, unknown>
  actionable?: boolean
  recommendedAction?: string
}

export interface AnalyticsConfig {
  enableRealTimeAnalytics: boolean
  analyticsRetentionDays: number
  enableAlerts: boolean
  enableDashboards: boolean
  enableReports: boolean
  enableMetricDefinitions: boolean
  enableDataSources: boolean
  metricDefinition: {
    autoDiscover: boolean
    discoveryIntervalMinutes: number
  }
  alerting: {
    enableEmailAlerts: boolean
    enableInAppAlerts: boolean
    enableWebhookAlerts: boolean
    quietHoursEnabled: boolean
    quietHoursStart: string
    quietHoursEnd: string
  }
  dashboard: {
    refreshInterval: number
    autoRefresh: boolean
  }
  report: {
    enableScheduledReports: boolean
    reportGenerationTimeoutMs: number
  }
}