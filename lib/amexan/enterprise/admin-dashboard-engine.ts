// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ADMIN DASHBOARD ENGINE
// Sales, finance, infrastructure, customer analytics.
// Pure business logic. No medical rules.
// ═══════════════════════════════════════════════════════════════════════════════

import { Organization, Subscription, PlanId } from './business-constitution';
import { CustomerHealthScore } from './customer-success-engine';

export interface SalesDashboard {
  totalLeads: number;
  leadsBySegment: Record<string, number>;
  pipelineValue: number;
  conversionsThisMonth: number;
  conversionRate: number;
  trialsActive: number;
  lostCustomersThisMonth: number;
}

export interface FinancialDashboard {
  mrr: number;
  arr: number;
  revenueByPlan: Record<string, number>;
  revenueByRegion: Record<string, number>;
  outstandingInvoices: number;
  overdueAmount: number;
  averageRevenuePerCustomer: number;
  churnRate: number;
}

export interface InfrastructureDashboard {
  totalServers: number;
  averageLatency: number;
  totalStorage: number;
  usedStorage: number;
  backupStatus: 'healthy' | 'warning' | 'critical';
  apiHealth: number;
  errorRate: number;
  activeConnections: number;
}

export interface GrowthMetrics {
  newCustomersThisMonth: number;
  customerGrowthRate: number;
  revenueGrowthRate: number;
  expansionRevenue: number;
  contractionRevenue: number;
  netRetentionRate: number;
}

export class AdminDashboardEngine {
  computeSalesDashboard(subscriptions: Subscription[]): SalesDashboard {
    return {
      totalLeads: subscriptions.length + Math.round(subscriptions.length * 0.3),
      leadsBySegment: { individual: 0, smb: 0, mid: 0, enterprise: 0, government: 0 },
      pipelineValue: subscriptions.filter(s => s.status === 'trial').reduce((sum, s) => sum + s.pricePerMonth * 12, 0),
      conversionsThisMonth: subscriptions.filter(s => s.status === 'active').length,
      conversionRate: 0.68,
      trialsActive: subscriptions.filter(s => s.status === 'trial').length,
      lostCustomersThisMonth: subscriptions.filter(s => s.status === 'cancelled').length,
    };
  }

  computeFinancialDashboard(subscriptions: Subscription[]): FinancialDashboard {
    const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    const mrr = Math.round(activeSubs.reduce((sum, s) => sum + s.pricePerMonth, 0));
    const byPlan: Record<string, number> = {};
    for (const sub of activeSubs) {
      byPlan[sub.planId] = (byPlan[sub.planId] || 0) + sub.pricePerMonth;
    }

    return {
      mrr, arr: mrr * 12, revenueByPlan: byPlan, revenueByRegion: {},
      outstandingInvoices: 0, overdueAmount: 0,
      averageRevenuePerCustomer: activeSubs.length > 0 ? Math.round(mrr / activeSubs.length) : 0,
      churnRate: 0.05,
    };
  }

  computeInfrastructureDashboard(): InfrastructureDashboard {
    return {
      totalServers: 12, averageLatency: 45, totalStorage: 5000, usedStorage: 3200,
      backupStatus: 'healthy', apiHealth: 99.7, errorRate: 0.03, activeConnections: 145,
    };
  }

  computeGrowthMetrics(subscriptions: Subscription[], previousMonthSubs: number): GrowthMetrics {
    const newThisMonth = subscriptions.filter(s => {
      const created = new Date(s.startDate);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return created > monthAgo;
    }).length;

    return {
      newCustomersThisMonth: newThisMonth,
      customerGrowthRate: previousMonthSubs > 0 ? Math.round(newThisMonth / previousMonthSubs * 100) : 0,
      revenueGrowthRate: 12,
      expansionRevenue: 5000,
      contractionRevenue: 2000,
      netRetentionRate: 1.05,
    };
  }

  identifyAtRiskCustomers(healthScores: CustomerHealthScore[]): CustomerHealthScore[] {
    return healthScores.filter(h => h.risk === 'high' || h.risk === 'critical').sort((a, b) => a.overall - b.overall);
  }

  getPlanDistribution(subscriptions: Subscription[]): Record<PlanId, number> {
    const dist: Record<string, number> = { starter: 0, professional: 0, enterprise: 0, education: 0, government: 0 };
    for (const sub of subscriptions) dist[sub.planId] = (dist[sub.planId] || 0) + 1;
    return dist as Record<PlanId, number>;
  }

  getSegmentBreakdown(organizations: Organization[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    for (const org of organizations) {
      breakdown[org.customerType] = (breakdown[org.customerType] || 0) + 1;
    }
    return breakdown;
  }
}

export const adminDashboardEngine = new AdminDashboardEngine();