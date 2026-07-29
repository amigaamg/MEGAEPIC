// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CUSTOMER SUCCESS ENGINE
// Health scores, deployment tracking, feature adoption, churn prediction.
// ═══════════════════════════════════════════════════════════════════════════════

import { Organization, Subscription, Facility, DeploymentStatus } from './business-constitution';

export interface CustomerHealthScore {
  organizationId: string;
  overall: number;
  categories: {
    usage: number;
    adoption: number;
    support: number;
    engagement: number;
    deployment: number;
  };
  risk: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  lastComputed: string;
}

export interface FeatureAdoption {
  featureId: string;
  featureName: string;
  activeUsers: number;
  totalUsers: number;
  adoptionRate: number;
  trend: 'rising' | 'stable' | 'declining';
  daysSinceLastUse: number;
}

export interface DeploymentProgress {
  organizationId: string;
  facilityId: string;
  status: DeploymentStatus;
  phases: DeploymentPhase[];
  completion: number;
  estimatedGoLive: string;
  blockers: string[];
}

export interface DeploymentPhase {
  name: string;
  completion: number;
  dueDate: string;
  completedAt?: string;
}

export class CustomerSuccessEngine {
  computeHealthScore(org: Organization, subscription: Subscription, supportTickets: number, loginFrequency: number): CustomerHealthScore {
    const usage = this.scoreUsage(subscription);
    const adoption = this.scoreAdoption(subscription);
    const support = this.scoreSupport(supportTickets);
    const engagement = this.scoreEngagement(loginFrequency);
    const deployment = this.scoreDeployment(org);

    const overall = Math.round((usage + adoption + support + engagement + deployment) / 5);
    const flags: string[] = [];

    if (usage < 40) flags.push('Low platform usage');
    if (adoption < 30) flags.push('Low feature adoption');
    if (support < 30) flags.push('High support ticket volume');
    if (engagement < 40) flags.push('Low user engagement');
    if (deployment < 50) flags.push('Deployment incomplete');

    let risk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (overall < 30) risk = 'critical';
    else if (overall < 50) risk = 'high';
    else if (overall < 70) risk = 'medium';

    return {
      organizationId: org.id, overall,
      categories: { usage, adoption, support, engagement, deployment },
      risk, flags, lastComputed: new Date().toISOString(),
    };
  }

  computeFeatureAdoption(subscription: Subscription, org: Organization): FeatureAdoption[] {
    const allProducts = [...(subscription.addonProducts || []), subscription.planId];
    return allProducts.map(productId => {
      const users = org.users || [];
      const activeUsers = users.filter(u => u.modulesUsed?.includes(productId)).length;
      return {
        featureId: productId,
        featureName: productId,
        activeUsers, totalUsers: users.length,
        adoptionRate: users.length > 0 ? Math.round(activeUsers / users.length * 100) : 0,
        trend: 'stable',
        daysSinceLastUse: 0,
      };
    });
  }

  computeDeploymentProgress(org: Organization, facilityId: string): DeploymentProgress | null {
    const facility = (org.facilities || []).find(f => f.id === facilityId);
    if (!facility) return null;

    const phases: DeploymentPhase[] = [
      { name: 'Onboarding', completion: facility.deploymentStatus === 'onboarding' ? 30 : 100, dueDate: '' },
      { name: 'Migration', completion: facility.deploymentStatus === 'migration' ? 40 : facility.deploymentStatus === 'onboarding' ? 0 : 100, dueDate: '' },
      { name: 'Training', completion: facility.deploymentStatus === 'training' ? 40 : facility.deploymentStatus === 'testing' || facility.deploymentStatus === 'go_live' || facility.deploymentStatus === 'live' || facility.deploymentStatus === 'active' ? 100 : 0, dueDate: '' },
      { name: 'Testing', completion: facility.deploymentStatus === 'testing' ? 50 : facility.deploymentStatus === 'go_live' || facility.deploymentStatus === 'live' || facility.deploymentStatus === 'active' ? 100 : 0, dueDate: '' },
      { name: 'Go Live', completion: facility.deploymentStatus === 'go_live' ? 50 : facility.deploymentStatus === 'live' || facility.deploymentStatus === 'active' ? 100 : 0, dueDate: '' },
      { name: 'Hypercare', completion: facility.deploymentStatus === 'hypercare' ? 50 : facility.deploymentStatus === 'active' ? 100 : 0, dueDate: '' },
    ];

    const completion = Math.round(phases.reduce((s, p) => s + p.completion, 0) / phases.length);
    const statusOrder: DeploymentStatus[] = ['onboarding', 'migration', 'training', 'testing', 'go_live', 'hypercare', 'active'];
    const currentIdx = statusOrder.indexOf(facility.deploymentStatus);

    return {
      organizationId: org.id, facilityId,
      status: facility.deploymentStatus,
      phases, completion,
      estimatedGoLive: '',
      blockers: currentIdx < 3 ? ['Training not yet scheduled'] : [],
    };
  }

  predictChurnRisk(healthScores: CustomerHealthScore[]): Array<{ orgId: string; risk: string; daysToChurn: number }> {
    return healthScores.map(h => ({
      orgId: h.organizationId,
      risk: h.risk,
      daysToChurn: h.overall < 30 ? 30 : h.overall < 50 ? 60 : h.overall < 70 ? 90 : 365,
    }));
  }

  getEngagementTrend(loginsByDay: number[]): 'rising' | 'stable' | 'declining' {
    if (loginsByDay.length < 7) return 'stable';
    const recent = loginsByDay.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const previous = loginsByDay.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
    if (recent > previous * 1.1) return 'rising';
    if (recent < previous * 0.9) return 'declining';
    return 'stable';
  }

  private scoreUsage(subscription: Subscription): number {
    if (subscription.activeUsers === 0) return 0;
    const ratio = subscription.activeUsers / subscription.maxUsers;
    return Math.min(100, Math.round(ratio * 100));
  }

  private scoreAdoption(subscription: Subscription): number {
    const planAddons = subscription.addonProducts.length;
    const maxAddons = 10;
    return Math.min(100, Math.round((planAddons / maxAddons) * 100));
  }

  private scoreSupport(tickets: number): number {
    if (tickets === 0) return 100;
    if (tickets <= 5) return 80;
    if (tickets <= 15) return 50;
    return Math.max(0, 100 - tickets * 2);
  }

  private scoreEngagement(loginFrequency: number): number {
    return Math.min(100, Math.round(loginFrequency * 20));
  }

  private scoreDeployment(org: Organization): number {
    const facilities = org.facilities || [];
    if (facilities.length === 0) return 0;
    const activeCount = facilities.filter(f => f.deploymentStatus === 'active' || f.deploymentStatus === 'live').length;
    return Math.round(activeCount / facilities.length * 100);
  }
}

export const customerSuccessEngine = new CustomerSuccessEngine();