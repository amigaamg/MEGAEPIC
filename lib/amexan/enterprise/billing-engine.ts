// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN BILLING & SUBSCRIPTION ENGINE
// Subscription lifecycle, invoicing, metering, dunning.
// ═══════════════════════════════════════════════════════════════════════════════

import { Subscription, PlanId, ProductId, SubscriptionStatus, calculatePrice } from './business-constitution';

export interface Invoice {
  id: string;
  subscriptionId: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SubscriptionEvent {
  type: 'created' | 'renewed' | 'upgraded' | 'downgraded' | 'suspended' | 'reactivated' | 'cancelled' | 'expired';
  subscriptionId: string;
  timestamp: string;
  previousPlan?: PlanId;
  newPlan?: PlanId;
  reason?: string;
}

export class BillingEngine {
  createInvoice(subscription: Subscription, periodStart: Date, periodEnd: Date): Invoice {
    const price = calculatePrice(subscription.planId, subscription.addonProducts, subscription.activeUsers, subscription.activeFacilities, subscription.billingCycle);

    const lineItems: InvoiceLineItem[] = [
      { description: `${subscription.planId} plan`, quantity: 1, unitPrice: price.basePrice, total: price.basePrice },
    ];

    for (const addon of price.addonProducts) {
      lineItems.push({ description: `Addon: ${addon.productId}`, quantity: 1, unitPrice: addon.price, total: addon.price });
    }

    if (price.userOverages > 0) {
      lineItems.push({ description: 'User overage', quantity: 1, unitPrice: price.userOverages, total: price.userOverages });
    }

    if (price.facilityOverages > 0) {
      lineItems.push({ description: 'Facility overage', quantity: 1, unitPrice: price.facilityOverages, total: price.facilityOverages });
    }

    const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
    const total = subtotal - price.discountTotal;

    return {
      id: `inv_${subscription.id}_${periodStart.toISOString().slice(0, 10)}`,
      subscriptionId: subscription.id,
      organizationId: subscription.organizationId,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      lineItems,
      subtotal,
      discount: price.discountTotal,
      total,
      currency: price.currency,
      status: 'draft',
      dueDate: new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  processLifecycleEvent(subscription: Subscription, event: SubscriptionEvent): Subscription {
    switch (event.type) {
      case 'created':
        return { ...subscription, status: 'trial', startDate: event.timestamp, trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() };
      case 'renewed':
        return { ...subscription, status: 'active', renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() };
      case 'upgraded':
        return { ...subscription, planId: event.newPlan || subscription.planId, status: 'active' };
      case 'downgraded':
        return { ...subscription, planId: event.newPlan || subscription.planId };
      case 'suspended':
        return { ...subscription, status: 'suspended' };
      case 'reactivated':
        return { ...subscription, status: 'active' };
      case 'cancelled':
        return { ...subscription, status: 'cancelled', autoRenew: false };
      case 'expired':
        return { ...subscription, status: 'expired' };
      default: return subscription;
    }
  }

  getRenewalDate(subscription: Subscription): string {
    const base = new Date(subscription.renewalDate);
    const next = new Date(base);
    if (subscription.billingCycle === 'monthly') next.setMonth(next.getMonth() + 1);
    else next.setFullYear(next.getFullYear() + 1);
    return next.toISOString();
  }

  daysUntilRenewal(subscription: Subscription): number {
    return Math.round((new Date(subscription.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  canUpgrade(currentPlan: PlanId, targetPlan: PlanId): boolean {
    const tier: Record<PlanId, number> = { starter: 0, professional: 1, enterprise: 2, education: 1, government: 3 };
    return (tier[targetPlan] || 0) >= (tier[currentPlan] || 0);
  }

  estimateMonthlyRevenue(subscriptions: Subscription[]): number {
    return subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' || sub.status === 'trial' ? sub.pricePerMonth : 0), 0);
  }

  estimateARR(subscriptions: Subscription[]): number {
    return this.estimateMonthlyRevenue(subscriptions) * 12;
  }

  getAtRiskSubscriptions(subscriptions: Subscription[]): Subscription[] {
    return subscriptions.filter(sub => {
      if (sub.status === 'past_due') return true;
      if (sub.status === 'trial' && sub.trialEndDate && new Date(sub.trialEndDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) return true;
      return false;
    });
  }
}

export const billingEngine = new BillingEngine();