// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ANALYTICS CONSTITUTION
// Cross-customer medical analytics (anonymized), disease trends,
// outbreak detection, benchmarking. No patient-identifiable data stored.
// ═══════════════════════════════════════════════════════════════════════════════

export interface DiseaseTrend {
  diseaseName: string;
  region: string;
  icdCode: string;
  period: string;
  totalCases: number;
  ageGroups: { group: string; count: number }[];
  genderDistribution: { male: number; female: number; other: number };
  regionalBreakdown: Record<string, number>;
  mortalityRate: number;
  averageLos: number;
  comparedToPrevious: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface OutbreakAlert {
  id: string;
  diseaseName: string;
  region: string;
  detectedAt: string;
  caseCount: number;
  expectedThreshold: number;
  severity: 'watch' | 'alert' | 'outbreak';
  affectedFacilities: string[];
  recommendation: string;
  status: 'active' | 'monitoring' | 'resolved';
}

export interface FacilityBenchmark {
  organizationId: string;
  facilityId: string;
  metric: string;
  value: number;
  percentile: number;
  peerAverage: number;
  peerMin: number;
  peerMax: number;
  rating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
}

export interface AggregateStat {
  metric: string;
  label: string;
  total: number;
  average: number;
  median: number;
  min: number;
  max: number;
  unit: string;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  period: { start: string; end: string };
  diseaseTrends: DiseaseTrend[];
  benchmarks: FacilityBenchmark[];
  aggregates: AggregateStat[];
  generatedAt: string;
}

export class AnalyticsEngine {
  private trendHistory: Map<string, DiseaseTrend[]> = new Map();
  private alerts: OutbreakAlert[] = [];
  private benchmarkData: Map<string, FacilityBenchmark[]> = new Map();

  recordDiseaseTrend(trend: DiseaseTrend): void {
    const key = `${trend.diseaseName}:${trend.region}`;
    const existing = this.trendHistory.get(key) || [];
    existing.push(trend);
    this.trendHistory.set(key, existing);
  }

  getDiseaseTrends(diseaseName?: string, region?: string, months?: number): DiseaseTrend[] {
    const results: DiseaseTrend[] = [];
    for (const [key, trends] of this.trendHistory) {
      const [d, r] = key.split(':');
      if (diseaseName && d !== diseaseName) continue;
      if (region && r !== region) continue;
      for (const trend of trends) {
        if (months) {
          const trendDate = new Date(trend.period);
          const cutoff = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
          if (trendDate < cutoff) continue;
        }
        results.push(trend);
      }
    }
    return results.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());
  }

  detectOutbreak(region: string, diseaseDeltas: Array<{ diseaseName: string; currentCases: number; expectedBaseline: number }>): OutbreakAlert[] {
    const newAlerts: OutbreakAlert[] = [];
    for (const delta of diseaseDeltas) {
      if (delta.currentCases <= delta.expectedBaseline) continue;
      const ratio = delta.currentCases / delta.expectedBaseline;
      let severity: OutbreakAlert['severity'];
      let recommendation: string;

      if (ratio >= 3) {
        severity = 'outbreak';
        recommendation = 'Immediate notification to ministry of health. Activate outbreak response protocol.';
      } else if (ratio >= 2) {
        severity = 'alert';
        recommendation = 'Increase surveillance. Prepare testing capacity. Notify public health authorities.';
      } else {
        severity = 'watch';
        recommendation = 'Monitor closely. Verify case counts. Ensure reporting accuracy.';
      }

      const alert: OutbreakAlert = {
        id: `alert_${region}_${delta.diseaseName}_${Date.now()}`,
        diseaseName: delta.diseaseName, region, detectedAt: new Date().toISOString(),
        caseCount: delta.currentCases, expectedThreshold: delta.expectedBaseline,
        severity, affectedFacilities: [], recommendation, status: 'active',
      };
      newAlerts.push(alert);
    }
    this.alerts.push(...newAlerts);
    return newAlerts;
  }

  getActiveAlerts(region?: string, severity?: OutbreakAlert['severity']): OutbreakAlert[] {
    return this.alerts.filter(a => {
      if (a.status !== 'active') return false;
      if (region && a.region !== region) return false;
      if (severity && a.severity !== severity) return false;
      return true;
    }).sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  resolveAlert(alertId: string): boolean {
    const idx = this.alerts.findIndex(a => a.id === alertId);
    if (idx === -1) return false;
    this.alerts[idx] = { ...this.alerts[idx], status: 'resolved' };
    return true;
  }

  recordBenchmarks(orgId: string, benchmarks: FacilityBenchmark[]): void {
    this.benchmarkData.set(orgId, benchmarks);
  }

  getPeerBenchmarks(metric: string, region?: string): FacilityBenchmark[] {
    const results: FacilityBenchmark[] = [];
    for (const benchmarks of this.benchmarkData.values()) {
      for (const b of benchmarks) {
        if (b.metric !== metric) continue;
        if (region) {
          const regionMatch = b.facilityId.startsWith(region) || b.organizationId.startsWith(region);
          if (!regionMatch) continue;
        }
        results.push(b);
      }
    }
    return results;
  }

  computeAggregates(data: number[]): { total: number; average: number; median: number; min: number; max: number } {
    const sorted = [...data].sort((a, b) => a - b);
    const total = data.reduce((s, v) => s + v, 0);
    const average = data.length > 0 ? Math.round(total / data.length * 100) / 100 : 0;
    const median = sorted.length > 0
      ? sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
      : 0;
    return { total: Math.round(total * 100) / 100, average, median, min: sorted[0] || 0, max: sorted[sorted.length - 1] || 0 };
  }

  generateReport(title: string, start: string, end: string, trends: DiseaseTrend[], benchmarks: FacilityBenchmark[], aggregates: AggregateStat[]): AnalyticsReport {
    return {
      id: `report_${Date.now()}`, title, period: { start, end },
      diseaseTrends: trends, benchmarks, aggregates, generatedAt: new Date().toISOString(),
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();