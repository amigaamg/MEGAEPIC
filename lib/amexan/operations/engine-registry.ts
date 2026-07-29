// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ENGINE REGISTRY
// Constitutional catalog of every engine: versions, inputs, outputs,
// dependencies, constitutional obligations.
// ═══════════════════════════════════════════════════════════════════════════════

import { EngineCategory, EngineRegistration, getEngineCategoryLabel } from './operations-constitution';

export class EngineRegistry {
  private engines: Map<string, EngineRegistration> = new Map();

  register(reg: Omit<EngineRegistration, 'registeredAt' | 'lastEventAt'> & { engineId: string }): EngineRegistration {
    const created: EngineRegistration = {
      ...reg,
      registeredAt: new Date().toISOString(),
      lastEventAt: undefined,
    };
    this.engines.set(created.engineId, created);
    return created;
  }

  registerBatch(regs: Array<Omit<EngineRegistration, 'registeredAt' | 'lastEventAt'> & { engineId: string }>): EngineRegistration[] {
    return regs.map(r => this.register(r));
  }

  get(engineId: string): EngineRegistration | undefined {
    return this.engines.get(engineId);
  }

  getAll(status?: EngineRegistration['status']): EngineRegistration[] {
    const all = Array.from(this.engines.values());
    return status ? all.filter(e => e.status === status) : all;
  }

  getByCategory(category: EngineCategory): EngineRegistration[] {
    return Array.from(this.engines.values()).filter(e => e.category === category);
  }

  updateLastEvent(engineId: string, timestamp: string): void {
    const engine = this.engines.get(engineId);
    if (engine) this.engines.set(engineId, { ...engine, lastEventAt: timestamp });
  }

  deprecate(engineId: string): boolean {
    const engine = this.engines.get(engineId);
    if (!engine) return false;
    this.engines.set(engineId, { ...engine, status: 'deprecated' });
    return true;
  }

  retire(engineId: string): boolean {
    const engine = this.engines.get(engineId);
    if (!engine) return false;
    this.engines.set(engineId, { ...engine, status: 'retired' });
    return true;
  }

  getCount(): number {
    return this.engines.size;
  }

  getByStatus(): Record<string, number> {
    const counts: Record<string, number> = { active: 0, deprecated: 0, retired: 0 };
    for (const engine of this.engines.values()) counts[engine.status]++;
    return counts;
  }

  getByCategoryBreakdown(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const engine of this.engines.values()) {
      const label = getEngineCategoryLabel(engine.category);
      counts[label] = (counts[label] || 0) + 1;
    }
    return counts;
  }

  findDependents(engineId: string): EngineRegistration[] {
    return Array.from(this.engines.values()).filter(e => e.dependencies.includes(engineId));
  }

  getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    for (const engine of this.engines.values()) {
      graph[engine.engineId] = engine.dependencies;
    }
    return graph;
  }

  hasCircularDependency(): string[] {
    const graph = this.getDependencyGraph();
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const circular: string[] = [];

    function dfs(node: string): boolean {
      visited.add(node);
      recStack.add(node);
      for (const dep of graph[node] || []) {
        if (!visited.has(dep)) { if (dfs(dep)) return true; }
        else if (recStack.has(dep)) { circular.push(node); return true; }
      }
      recStack.delete(node);
      return false;
    }

    for (const node of Object.keys(graph)) {
      if (!visited.has(node)) dfs(node);
    }
    return circular;
  }

  search(query: string): EngineRegistration[] {
    const q = query.toLowerCase();
    return Array.from(this.engines.values()).filter(e =>
      e.engineId.toLowerCase().includes(q) ||
      e.engineName.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.inputs.some(i => i.toLowerCase().includes(q)) ||
      e.outputs.some(o => o.toLowerCase().includes(q)),
    );
  }
}

export const engineRegistry = new EngineRegistry();