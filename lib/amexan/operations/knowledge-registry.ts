// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN KNOWLEDGE REGISTRY (AGOC)
// Versioned knowledge package tracking — wraps the knowledge compiler registry
// and adds AGOC-specific versioning, provenance, and gate tracking.
// ═══════════════════════════════════════════════════════════════════════════════

export interface KnowledgePackageRecord {
  packageId: string;
  name: string;
  version: string;
  description: string;
  objectCount: number;
  edgeCount: number;
  diseases: string[];
  symptoms: string[];
  sourceAuthority: string;
  publishedAt: string;
  registeredAt: string;
  status: 'draft' | 'staging' | 'approved' | 'published' | 'superseded' | 'retracted';
  supersededBy?: string;
  supersedes?: string;
  approvalGateResults: ApprovalGateResult[];
  compilerOutput?: unknown;
}

export interface ApprovalGateResult {
  gateName: string;
  passed: boolean;
  details?: string;
  checkedAt: string;
}

export class KnowledgeRegistry {
  private packages: Map<string, KnowledgePackageRecord> = new Map();
  private versionHistory: Map<string, KnowledgePackageRecord[]> = new Map();

  register(pkg: Omit<KnowledgePackageRecord, 'registeredAt' | 'approvalGateResults'>): KnowledgePackageRecord {
    const created: KnowledgePackageRecord = {
      ...pkg,
      registeredAt: new Date().toISOString(),
      approvalGateResults: [],
    };
    this.packages.set(created.packageId, created);

    const history = this.versionHistory.get(created.name) || [];
    history.push(created);
    this.versionHistory.set(created.name, history);

    return created;
  }

  get(packageId: string): KnowledgePackageRecord | undefined {
    return this.packages.get(packageId);
  }

  getByName(name: string): KnowledgePackageRecord | undefined {
    const history = this.versionHistory.get(name);
    return history ? history[history.length - 1] : undefined;
  }

  getVersionHistory(name: string): KnowledgePackageRecord[] {
    return this.versionHistory.get(name) || [];
  }

  getAll(status?: KnowledgePackageRecord['status']): KnowledgePackageRecord[] {
    const all = Array.from(this.packages.values());
    return status ? all.filter(p => p.status === status) : all;
  }

  updateStatus(packageId: string, status: KnowledgePackageRecord['status'], supersededBy?: string): boolean {
    const pkg = this.packages.get(packageId);
    if (!pkg) return false;
    this.packages.set(packageId, { ...pkg, status, supersededBy });
    return true;
  }

  recordGateResult(packageId: string, gate: Omit<ApprovalGateResult, 'checkedAt'>): boolean {
    const pkg = this.packages.get(packageId);
    if (!pkg) return false;
    this.packages.set(packageId, {
      ...pkg,
      approvalGateResults: [...pkg.approvalGateResults, { ...gate, checkedAt: new Date().toISOString() }],
    });
    return true;
  }

  getLatestApproved(): KnowledgePackageRecord[] {
    return Array.from(this.packages.values()).filter(p => p.status === 'approved' || p.status === 'published');
  }

  getOutdatedPackages(): KnowledgePackageRecord[] {
    const outdated: KnowledgePackageRecord[] = [];
    for (const [name, history] of this.versionHistory) {
      if (history.length > 1 && history[history.length - 1].status === 'published') {
        for (let i = 0; i < history.length - 1; i++) {
          if (history[i].status === 'published' || history[i].status === 'approved') {
            outdated.push(history[i]);
          }
        }
      }
    }
    return outdated;
  }

  getGateFailureRate(): { total: number; passed: number; failed: number; rate: number } {
    let total = 0, passed = 0;
    for (const pkg of this.packages.values()) {
      for (const gate of pkg.approvalGateResults) {
        total++;
        if (gate.passed) passed++;
      }
    }
    return { total, passed, failed: total - passed, rate: total > 0 ? Math.round(passed / total * 100) : 100 };
  }

  search(query: string): KnowledgePackageRecord[] {
    const q = query.toLowerCase();
    return Array.from(this.packages.values()).filter(p =>
      p.packageId.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.diseases.some(d => d.toLowerCase().includes(q)) ||
      p.symptoms.some(s => s.toLowerCase().includes(q)),
    );
  }

  getStats(): { total: number; published: number; draft: number; superseded: number; retracted: number; avgObjectsPerPackage: number } {
    const all = Array.from(this.packages.values());
    const published = all.filter(p => p.status === 'published').length;
    const draft = all.filter(p => p.status === 'draft').length;
    const superseded = all.filter(p => p.status === 'superseded').length;
    const retracted = all.filter(p => p.status === 'retracted').length;
    const avgObjects = all.length > 0 ? Math.round(all.reduce((s, p) => s + p.objectCount, 0) / all.length) : 0;
    return { total: all.length, published, draft, superseded, retracted, avgObjectsPerPackage: avgObjects };
  }
}

export const knowledgeRegistry = new KnowledgeRegistry();