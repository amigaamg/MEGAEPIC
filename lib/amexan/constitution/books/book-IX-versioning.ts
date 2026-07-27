export interface VersionedPackage {
  id: string;
  name: string;
  type: 'symptom' | 'disease' | 'guideline' | 'protocol' | 'workflow' | 'documentation';
  version: string;
  previousVersion: string | null;
  changelog: VersionChange[];
  status: 'draft' | 'published' | 'deprecated' | 'superseded';
  publishedAt: number | null;
  author: string;
  checksum: string;
}

export interface VersionChange {
  type: 'added' | 'modified' | 'removed' | 'deprecated' | 'fixed';
  description: string;
  component: string;
  author: string;
  timestamp: number;
}

export class VersionConstitution {
  private packages: Map<string, VersionedPackage> = new Map();

  register(pkg: Omit<VersionedPackage, 'checksum'>): VersionedPackage {
    const checksum = this.computeChecksum(pkg);
    const registered: VersionedPackage = { ...pkg, checksum };
    this.packages.set(pkg.id, registered);
    return registered;
  }

  createNewVersion(
    packageId: string,
    changes: VersionChange[],
    newVersion: string,
    author: string,
  ): VersionedPackage | null {
    const existing = this.packages.get(packageId);
    if (!existing) return null;

    if (existing.status === 'published') {
      this.packages.set(packageId, { ...existing, status: 'superseded' });
    }

    const newPkg: Omit<VersionedPackage, 'checksum'> = {
      ...existing,
      version: newVersion,
      previousVersion: existing.version,
      changelog: changes,
      status: 'draft',
      publishedAt: null,
      author,
    };
    return this.register(newPkg);
  }

  publish(packageId: string): VersionedPackage | null {
    const pkg = this.packages.get(packageId);
    if (!pkg) return null;
    const updated = { ...pkg, status: 'published' as const, publishedAt: Date.now() };
    this.packages.set(packageId, updated);
    return updated;
  }

  deprecate(packageId: string, reason: string): VersionedPackage | null {
    const pkg = this.packages.get(packageId);
    if (!pkg) return null;
    const change: VersionChange = {
      type: 'deprecated', description: reason, component: pkg.name, author: 'system', timestamp: Date.now(),
    };
    const updated: VersionedPackage = {
      ...pkg, status: 'deprecated',
      changelog: [...pkg.changelog, change],
    };
    this.packages.set(packageId, updated);
    return updated;
  }

  getLatest(name: string, type: string): VersionedPackage | null {
    const candidates = Array.from(this.packages.values())
      .filter(p => p.name === name && p.type === type);
    if (candidates.length === 0) return null;
    return candidates.reduce((a, b) => this.compareVersions(a.version, b.version) > 0 ? a : b);
  }

  getHistory(name: string, type: string): VersionedPackage[] {
    return Array.from(this.packages.values())
      .filter(p => p.name === name && p.type === type)
      .sort((a, b) => this.compareVersions(b.version, a.version));
  }

  private compareVersions(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const va = pa[i] || 0;
      const vb = pb[i] || 0;
      if (va !== vb) return va - vb;
    }
    return 0;
  }

  private computeChecksum(pkg: Record<string, unknown>): string {
    const str = JSON.stringify(pkg, Object.keys(pkg).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString(16);
  }
}

export const versionConstitution = new VersionConstitution();
