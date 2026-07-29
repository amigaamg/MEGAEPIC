// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN SUPPORT CONSTITUTION — Ticket system, knowledge base, SLA.
// Pure business logic. No medical rules.
// ═══════════════════════════════════════════════════════════════════════════════

import { PlanId } from './business-constitution';

export type TicketCategory =
  | 'technical' | 'clinical' | 'training' | 'feature_request' | 'bug_report'
  | 'billing' | 'account' | 'implementation' | 'security' | 'integration';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'waiting_on_customer' | 'waiting_on_third_party' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  organizationId: string;
  userId: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  slaDeadline: string;
  slaBreached: boolean;
  tags: string[];
  attachments: string[];
  linkedTicketIds: string[];
  satisfactionRating?: number;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorRole: 'customer' | 'agent' | 'system';
  body: string;
  isInternal: boolean;
  createdAt: string;
  attachments: string[];
}

export interface SLADefinition {
  planId: PlanId;
  firstResponse: number;
  criticalResolution: number;
  highResolution: number;
  mediumResolution: number;
  lowResolution: number;
  supportHours: 'business' | 'extended' | '24_7';
  channels: ('email' | 'chat' | 'phone' | 'portal')[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: TicketCategory;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
}

export const SLA_DEFINITIONS: Record<PlanId, SLADefinition> = {
  starter: { planId: 'starter', firstResponse: 48, criticalResolution: 24, highResolution: 48, mediumResolution: 72, lowResolution: 120, supportHours: 'business', channels: ['portal'] },
  professional: { planId: 'professional', firstResponse: 8, criticalResolution: 12, highResolution: 24, mediumResolution: 48, lowResolution: 72, supportHours: 'extended', channels: ['email', 'chat', 'portal'] },
  enterprise: { planId: 'enterprise', firstResponse: 2, criticalResolution: 4, highResolution: 8, mediumResolution: 24, lowResolution: 48, supportHours: '24_7', channels: ['email', 'chat', 'phone', 'portal'] },
  education: { planId: 'education', firstResponse: 8, criticalResolution: 12, highResolution: 24, mediumResolution: 48, lowResolution: 72, supportHours: 'extended', channels: ['email', 'chat', 'portal'] },
  government: { planId: 'government', firstResponse: 1, criticalResolution: 2, highResolution: 4, mediumResolution: 12, lowResolution: 24, supportHours: '24_7', channels: ['email', 'chat', 'phone', 'portal'] },
};

export class SupportEngine {
  private tickets: Map<string, SupportTicket> = new Map();
  private comments: Map<string, TicketComment[]> = new Map();
  private articles: Map<string, KnowledgeArticle> = new Map();
  private ticketCounter = 0;

  createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'slaDeadline' | 'slaBreached'>): SupportTicket {
    this.ticketCounter++;
    const now = new Date();
    const slaDef = SLA_DEFINITIONS[ticket.organizationId.startsWith('gov') ? 'government' : 'enterprise'];
    const responseHours = slaDef?.firstResponse || 48;
    const slaDeadline = new Date(now.getTime() + responseHours * 60 * 60 * 1000);

    const created: SupportTicket = {
      ...ticket,
      id: `TKT-${String(this.ticketCounter).padStart(5, '0')}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline: slaDeadline.toISOString(),
      slaBreached: false,
    };
    this.tickets.set(created.id, created);
    return created;
  }

  getTicket(id: string): SupportTicket | undefined {
    return this.tickets.get(id);
  }

  updateTicket(id: string, updates: Partial<SupportTicket>): SupportTicket | null {
    const ticket = this.tickets.get(id);
    if (!ticket) return null;
    const updated = { ...ticket, ...updates, updatedAt: new Date().toISOString() };
    if (updates.status === 'resolved' && !updated.resolvedAt) updated.resolvedAt = new Date().toISOString();
    if (updates.status === 'closed' && !updated.closedAt) updated.closedAt = new Date().toISOString();
    this.tickets.set(id, updated);
    return updated;
  }

  searchTickets(query: { organizationId?: string; category?: TicketCategory; priority?: TicketPriority; status?: TicketStatus; assignedTo?: string; tag?: string }): SupportTicket[] {
    return Array.from(this.tickets.values()).filter(t => {
      if (query.organizationId && t.organizationId !== query.organizationId) return false;
      if (query.category && t.category !== query.category) return false;
      if (query.priority && t.priority !== query.priority) return false;
      if (query.status && t.status !== query.status) return false;
      if (query.assignedTo && t.assignedTo !== query.assignedTo) return false;
      if (query.tag && !t.tags.includes(query.tag)) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addComment(comment: Omit<TicketComment, 'id' | 'createdAt'>): TicketComment {
    const created: TicketComment = { ...comment, id: `cmt_${Date.now()}`, createdAt: new Date().toISOString() };
    const existing = this.comments.get(comment.ticketId) || [];
    existing.push(created);
    this.comments.set(comment.ticketId, existing);
    this.updateTicket(comment.ticketId, { updatedAt: created.createdAt });
    return created;
  }

  getComments(ticketId: string): TicketComment[] {
    return this.comments.get(ticketId) || [];
  }

  assignTicket(id: string, agentId: string): SupportTicket | null {
    return this.updateTicket(id, { assignedTo: agentId, status: 'assigned' });
  }

  checkSLABreaches(): SupportTicket[] {
    const now = new Date();
    const breached: SupportTicket[] = [];
    for (const ticket of this.tickets.values()) {
      if (ticket.status === 'resolved' || ticket.status === 'closed') continue;
      if (ticket.slaBreached) continue;
      if (new Date(ticket.slaDeadline) < now) {
        const updated = { ...ticket, slaBreached: true, updatedAt: now.toISOString() };
        this.tickets.set(ticket.id, updated);
        breached.push(updated);
      }
    }
    return breached;
  }

  getSLADefinition(planId: PlanId): SLADefinition {
    return SLA_DEFINITIONS[planId] || SLA_DEFINITIONS.starter;
  }

  // ── Knowledge Base ─────────────────────────────────────────────────────────

  createArticle(article: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'helpfulCount' | 'notHelpfulCount'>): KnowledgeArticle {
    const created: KnowledgeArticle = {
      ...article, id: `KB-${Date.now()}`,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      viewCount: 0, helpfulCount: 0, notHelpfulCount: 0,
    };
    this.articles.set(created.id, created);
    return created;
  }

  updateArticle(id: string, updates: Partial<KnowledgeArticle>): KnowledgeArticle | null {
    const article = this.articles.get(id);
    if (!article) return null;
    const updated = { ...article, ...updates, updatedAt: new Date().toISOString() };
    this.articles.set(id, updated);
    return updated;
  }

  searchArticles(query: { category?: TicketCategory; tag?: string; searchText?: string }): KnowledgeArticle[] {
    return Array.from(this.articles.values()).filter(a => {
      if (!a.published) return false;
      if (query.category && a.category !== query.category) return false;
      if (query.tag && !a.tags.includes(query.tag)) return false;
      if (query.searchText) {
        const text = query.searchText.toLowerCase();
        if (!a.title.toLowerCase().includes(text) && !a.summary.toLowerCase().includes(text) && !a.body.toLowerCase().includes(text)) return false;
      }
      return true;
    }).sort((a, b) => b.viewCount - a.viewCount);
  }

  recordArticleView(articleId: string): void {
    const article = this.articles.get(articleId);
    if (article) this.articles.set(articleId, { ...article, viewCount: article.viewCount + 1 });
  }

  recordArticleFeedback(articleId: string, helpful: boolean): void {
    const article = this.articles.get(articleId);
    if (!article) return;
    this.articles.set(articleId, {
      ...article,
      helpfulCount: article.helpfulCount + (helpful ? 1 : 0),
      notHelpfulCount: article.notHelpfulCount + (helpful ? 0 : 1),
    });
  }

  // ── Analytics ──────────────────────────────────────────────────────────────

  getSupportStats(organizationId?: string): { total: number; open: number; breached: number; avgResolutionHours: number; byCategory: Record<string, number>; byPriority: Record<string, number> } {
    const relevant = organizationId
      ? Array.from(this.tickets.values()).filter(t => t.organizationId === organizationId)
      : Array.from(this.tickets.values());

    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let open = 0, breached = 0, resolutionTimes: number[] = [];

    for (const ticket of relevant) {
      byCategory[ticket.category] = (byCategory[ticket.category] || 0) + 1;
      byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;
      if (ticket.status !== 'resolved' && ticket.status !== 'closed') open++;
      if (ticket.slaBreached) breached++;
      if (ticket.resolvedAt) {
        resolutionTimes.push((new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60));
      }
    }

    return {
      total: relevant.length, open, breached,
      avgResolutionHours: resolutionTimes.length > 0 ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length * 10) / 10 : 0,
      byCategory, byPriority,
    };
  }
}

export const supportEngine = new SupportEngine();