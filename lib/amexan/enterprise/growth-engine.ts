// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN GROWTH & PARTNER CONSTITUTION
// Partner tiers, commissions, referrals, partner performance metrics.
// Pure business logic. No medical rules.
// ═══════════════════════════════════════════════════════════════════════════════

import { Organization, Subscription } from './business-constitution';

export type PartnerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Partner {
  id: string;
  organizationId: string;
  name: string;
  tier: PartnerTier;
  regions: string[];
  specialties: string[];
  joinedAt: string;
  contractEndDate?: string;
  status: 'active' | 'suspended' | 'terminated';
  contactEmail: string;
  contactPhone: string;
  website?: string;
  referralCode: string;
  commissionRate: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  leadCount: number;
  conversionCount: number;
  metadata: Record<string, unknown>;
}

export interface CommissionPlan {
  id: string;
  partnerTier: PartnerTier;
  commissionRate: number;
  onFirstYear: boolean;
  onRenewals: boolean;
  renewalRate: number;
  capPerDeal: number;
  minimumDealValue: number;
  paymentTerms: 'monthly' | 'quarterly' | 'annual';
}

export interface Referral {
  id: string;
  partnerId: string;
  referredOrganizationId: string;
  referredOrganizationName: string;
  status: 'lead' | 'qualified' | 'converted' | 'commission_paid' | 'lost';
  referredAt: string;
  convertedAt?: string;
  dealValue?: number;
  commissionAmount?: number;
  commissionPaidAt?: string;
  notes: string;
}

export interface PartnerMetrics {
  partnerId: string;
  periodStart: string;
  periodEnd: string;
  leadsGenerated: number;
  qualifiedLeads: number;
  conversions: number;
  conversionRate: number;
  totalDealValue: number;
  commissionEarned: number;
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
  rank: number;
}

export const COMMISSION_PLANS: Record<PartnerTier, CommissionPlan> = {
  bronze: { id: 'comm_bronze', partnerTier: 'bronze', commissionRate: 0.10, onFirstYear: true, onRenewals: false, renewalRate: 0, capPerDeal: 5000, minimumDealValue: 0, paymentTerms: 'quarterly' },
  silver: { id: 'comm_silver', partnerTier: 'silver', commissionRate: 0.15, onFirstYear: true, onRenewals: true, renewalRate: 0.05, capPerDeal: 10000, minimumDealValue: 1000, paymentTerms: 'quarterly' },
  gold: { id: 'comm_gold', partnerTier: 'gold', commissionRate: 0.20, onFirstYear: true, onRenewals: true, renewalRate: 0.08, capPerDeal: 20000, minimumDealValue: 5000, paymentTerms: 'monthly' },
  platinum: { id: 'comm_platinum', partnerTier: 'platinum', commissionRate: 0.25, onFirstYear: true, onRenewals: true, renewalRate: 0.10, capPerDeal: 50000, minimumDealValue: 10000, paymentTerms: 'monthly' },
};

export const TIER_REQUIREMENTS: Record<PartnerTier, { minQuarterlyLeads: number; minQuarterlyConversions: number; minDealValue: number; approvalRequired: boolean }> = {
  bronze: { minQuarterlyLeads: 1, minQuarterlyConversions: 0, minDealValue: 0, approvalRequired: false },
  silver: { minQuarterlyLeads: 5, minQuarterlyConversions: 2, minDealValue: 5000, approvalRequired: false },
  gold: { minQuarterlyLeads: 15, minQuarterlyConversions: 5, minDealValue: 25000, approvalRequired: true },
  platinum: { minQuarterlyLeads: 30, minQuarterlyConversions: 10, minDealValue: 100000, approvalRequired: true },
};

export class GrowthEngine {
  private partners: Map<string, Partner> = new Map();
  private referrals: Map<string, Referral> = new Map();

  registerPartner(partner: Omit<Partner, 'id' | 'referralCode' | 'totalCommissionEarned' | 'totalCommissionPaid' | 'leadCount' | 'conversionCount'>): Partner {
    const code = `AMX-${partner.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const created: Partner = {
      ...partner, id: `partner_${Date.now()}`,
      referralCode: code, totalCommissionEarned: 0, totalCommissionPaid: 0,
      leadCount: 0, conversionCount: 0,
    };
    this.partners.set(created.id, created);
    return created;
  }

  getPartner(id: string): Partner | undefined {
    return this.partners.get(id);
  }

  getPartnerByReferralCode(code: string): Partner | undefined {
    for (const partner of this.partners.values()) {
      if (partner.referralCode === code) return partner;
    }
    return undefined;
  }

  updatePartnerTier(partnerId: string, tier: PartnerTier): Partner | null {
    const partner = this.partners.get(partnerId);
    if (!partner) return null;
    const updated = { ...partner, tier };
    this.partners.set(partnerId, updated);
    return updated;
  }

  recordReferral(partnerId: string, orgName: string, orgId: string): Referral | null {
    const partner = this.partners.get(partnerId);
    if (!partner) return null;
    const referral: Referral = {
      id: `ref_${Date.now()}`, partnerId,
      referredOrganizationId: orgId, referredOrganizationName: orgName,
      status: 'lead', referredAt: new Date().toISOString(), notes: '',
    };
    this.referrals.set(referral.id, referral);
    this.partners.set(partnerId, { ...partner, leadCount: partner.leadCount + 1 });
    return referral;
  }

  qualifyReferral(referralId: string): boolean {
    const ref = this.referrals.get(referralId);
    if (!ref || ref.status !== 'lead') return false;
    this.referrals.set(referralId, { ...ref, status: 'qualified' });
    return true;
  }

  convertReferral(referralId: string, dealValue: number): { referral: Referral; commission: number } | null {
    const ref = this.referrals.get(referralId);
    if (!ref || (ref.status !== 'qualified' && ref.status !== 'lead')) return null;
    const partner = this.partners.get(ref.partnerId);
    if (!partner) return null;

    const plan = COMMISSION_PLANS[partner.tier];
    const commission = Math.min(dealValue * plan.commissionRate, plan.capPerDeal);

    const updatedRef: Referral = {
      ...ref, status: 'commission_paid', convertedAt: new Date().toISOString(),
      dealValue, commissionAmount: commission, commissionPaidAt: new Date().toISOString(),
    };
    this.referrals.set(referralId, updatedRef);
    this.partners.set(ref.partnerId, {
      ...partner, conversionCount: partner.conversionCount + 1,
      totalCommissionEarned: partner.totalCommissionEarned + commission,
    });

    return { referral: updatedRef, commission };
  }

  getPartnerReferrals(partnerId: string): Referral[] {
    return Array.from(this.referrals.values())
      .filter(r => r.partnerId === partnerId)
      .sort((a, b) => new Date(b.referredAt).getTime() - new Date(a.referredAt).getTime());
  }

  getReferralsByStatus(status: Referral['status']): Referral[] {
    return Array.from(this.referrals.values())
      .filter(r => r.status === status)
      .sort((a, b) => new Date(b.referredAt).getTime() - new Date(a.referredAt).getTime());
  }

  computePartnerMetrics(partnerId: string, periodStart: string, periodEnd: string): PartnerMetrics {
    const partner = this.partners.get(partnerId);
    if (!partner) throw new Error(`Partner ${partnerId} not found`);

    const allReferrals = this.getPartnerReferrals(partnerId);
    const periodLeads = allReferrals.filter(r => r.referredAt >= periodStart && r.referredAt <= periodEnd);
    const qualified = periodLeads.filter(r => r.status === 'qualified' || r.status === 'converted' || r.status === 'commission_paid').length;
    const converted = periodLeads.filter(r => r.status === 'converted' || r.status === 'commission_paid').length;
    const totalDealValue = periodLeads.reduce((s, r) => s + (r.dealValue || 0), 0);
    const totalCommission = periodLeads.reduce((s, r) => s + (r.commissionAmount || 0), 0);
    const conversionRate = qualified > 0 ? Math.round(converted / qualified * 100) : 0;

    const allPartners = Array.from(this.partners.values())
      .map(p => ({ id: p.id, count: this.getPartnerReferrals(p.id).filter(r => r.status === 'commission_paid').length }))
      .sort((a, b) => b.count - a.count);
    const rank = allPartners.findIndex(p => p.id === partnerId) + 1;

    let performanceRating: PartnerMetrics['performanceRating'] = 'average';
    if (conversionRate >= 50 && totalDealValue > 50000) performanceRating = 'excellent';
    else if (conversionRate >= 30 && totalDealValue > 10000) performanceRating = 'good';
    else if (conversionRate < 10) performanceRating = 'poor';

    return {
      partnerId, periodStart, periodEnd,
      leadsGenerated: periodLeads.length, qualifiedLeads: qualified,
      conversions: converted, conversionRate,
      totalDealValue, commissionEarned: totalCommission,
      performanceRating, rank,
    };
  }

  getAllPartners(status?: Partner['status']): Partner[] {
    const all = Array.from(this.partners.values());
    return status ? all.filter(p => p.status === status) : all;
  }

  getPartnerTierBenefits(tier: PartnerTier): { commissionRate: number; monthlyLeadTarget: number; dedicatedSupport: boolean; apiAccess: boolean; coMarketing: boolean; earlyAccess: boolean } {
    const benefits = {
      bronze: { commissionRate: 0.10, monthlyLeadTarget: 2, dedicatedSupport: false, apiAccess: false, coMarketing: false, earlyAccess: false },
      silver: { commissionRate: 0.15, monthlyLeadTarget: 5, dedicatedSupport: true, apiAccess: true, coMarketing: false, earlyAccess: false },
      gold: { commissionRate: 0.20, monthlyLeadTarget: 10, dedicatedSupport: true, apiAccess: true, coMarketing: true, earlyAccess: true },
      platinum: { commissionRate: 0.25, monthlyLeadTarget: 20, dedicatedSupport: true, apiAccess: true, coMarketing: true, earlyAccess: true },
    };
    return benefits[tier];
  }

  getPartnerDashboard(): { totalPartners: number; activePartners: number; totalReferrals: number; conversions: number; totalCommissionPaid: number; byTier: Record<string, number>; topPartners: Partner[] } {
    const all = Array.from(this.partners.values());
    const active = all.filter(p => p.status === 'active');
    const byTier: Record<string, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    for (const p of all) byTier[p.tier] = (byTier[p.tier] || 0) + 1;

    return {
      totalPartners: all.length, activePartners: active.length,
      totalReferrals: this.referrals.size,
      conversions: Array.from(this.referrals.values()).filter(r => r.status === 'commission_paid').length,
      totalCommissionPaid: all.reduce((s, p) => s + p.totalCommissionPaid, 0),
      byTier,
      topPartners: all.sort((a, b) => b.totalCommissionEarned - a.totalCommissionEarned).slice(0, 10),
    };
  }
}

export const growthEngine = new GrowthEngine();