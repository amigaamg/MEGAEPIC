import { KnowledgePackage, CompilationResult, knowledgeCompiler } from '@/lib/amexan/constitution/books/book-VII-knowledge-compiler';
import { ObjectType } from '@/lib/amexan/constitution/books/book-I-objects';

export interface PackageIndex {
  byId: Map<string, KnowledgePackage>;
  byDisease: Map<string, string[]>;
  bySymptom: Map<string, string[]>;
  byObjectType: Map<ObjectType, string[]>;
  byObjectId: Map<string, string>;
}

export class KnowledgePackageRegistry {
  private packages: Map<string, KnowledgePackage> = new Map();
  private compilationResults: Map<string, CompilationResult> = new Map();
  private index: PackageIndex = {
    byId: new Map(),
    byDisease: new Map(),
    bySymptom: new Map(),
    byObjectType: new Map(),
    byObjectId: new Map(),
  };

  register(pkg: KnowledgePackage): CompilationResult {
    const result = knowledgeCompiler.compile(pkg);
    this.packages.set(pkg.id, pkg);
    this.compilationResults.set(pkg.id, result);

    if (result.success) {
      this.indexPackage(pkg);
    }

    return result;
  }

  registerBatch(packages: KnowledgePackage[]): { results: CompilationResult[]; failed: CompilationResult[] } {
    const results: CompilationResult[] = [];
    const failed: CompilationResult[] = [];

    for (const pkg of packages) {
      const result = this.register(pkg);
      results.push(result);
      if (!result.success) failed.push(result);
    }

    return { results, failed };
  }

  get(id: string): KnowledgePackage | undefined {
    return this.packages.get(id);
  }

  getResult(id: string): CompilationResult | undefined {
    return this.compilationResults.get(id);
  }

  getAll(): KnowledgePackage[] {
    return Array.from(this.packages.values());
  }

  getByDisease(disease: string): KnowledgePackage[] {
    return (this.index.byDisease.get(disease.toLowerCase()) || [])
      .map(id => this.packages.get(id)!)
      .filter(Boolean);
  }

  getBySymptom(symptom: string): KnowledgePackage[] {
    return (this.index.bySymptom.get(symptom.toLowerCase()) || [])
      .map(id => this.packages.get(id)!)
      .filter(Boolean);
  }

  getByObjectType(type: ObjectType): KnowledgePackage[] {
    return (this.index.byObjectType.get(type) || [])
      .map(id => this.packages.get(id)!)
      .filter(Boolean);
  }

  getByObjectId(objectId: string): KnowledgePackage | undefined {
    const pkgId = this.index.byObjectId.get(objectId);
    return pkgId ? this.packages.get(pkgId) : undefined;
  }

  search(query: string): KnowledgePackage[] {
    const q = query.toLowerCase();
    return this.getAll().filter(pkg =>
      pkg.name.toLowerCase().includes(q) ||
      pkg.id.toLowerCase().includes(q) ||
      pkg.objects.some(o => o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q))
    );
  }

  getCompilationStats(): { total: number; success: number; failed: number } {
    const total = this.compilationResults.size;
    const success = Array.from(this.compilationResults.values()).filter(r => r.success).length;
    return { total, success, failed: total - success };
  }

  clear(): void {
    this.packages.clear();
    this.compilationResults.clear();
    this.index = {
      byId: new Map(), byDisease: new Map(), bySymptom: new Map(),
      byObjectType: new Map(), byObjectId: new Map(),
    };
  }

  private indexPackage(pkg: KnowledgePackage): void {
    this.index.byId.set(pkg.id, pkg);

    if (pkg.disease) {
      const key = pkg.disease.toLowerCase();
      const existing = this.index.byDisease.get(key) || [];
      if (!existing.includes(pkg.id)) existing.push(pkg.id);
      this.index.byDisease.set(key, existing);
    }

    if (pkg.symptom) {
      const key = pkg.symptom.toLowerCase();
      const existing = this.index.bySymptom.get(key) || [];
      if (!existing.includes(pkg.id)) existing.push(pkg.id);
      this.index.bySymptom.set(key, existing);
    }

    for (const obj of pkg.objects) {
      const key = obj.type;
      const existing = this.index.byObjectType.get(key) || [];
      if (!existing.includes(pkg.id)) existing.push(pkg.id);
      this.index.byObjectType.set(key, existing);

      this.index.byObjectId.set(obj.id, pkg.id);
    }
  }
}

export const knowledgeRegistry = new KnowledgePackageRegistry();