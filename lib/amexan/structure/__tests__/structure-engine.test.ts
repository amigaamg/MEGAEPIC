import { describe, it, expect } from 'vitest';
import { StructureEngine, genNodeId } from '../StructureEngine';
import { isAllowedChild, getNodeType, registerNodeType, typeLabel } from '../nodeTypes';
import type { StructureNode } from '../types';

const ORG = 'org-1';

function seed(): StructureNode[] {
  const org = StructureEngine.create(ORG, { type: 'organization', name: 'KUTRH', parentId: null });
  const dept = StructureEngine.createNode([org], ORG, org.id, { type: 'department', name: 'Medicine' });
  return [org, dept];
}

describe('StructureEngine', () => {
  it('creates a root organization node only at root', () => {
    const root = StructureEngine.create(ORG, { type: 'organization', name: 'KUTRH', parentId: null });
    expect(root.type).toBe('organization');
    expect(root.parentId).toBeNull();
    expect(root.id).toMatch(/^AMX-STR-/);
    expect(() => StructureEngine.create(ORG, { type: 'department', name: 'x', parentId: null })).toThrow();
  });

  it('creates children under a valid parent with order + code', () => {
    let nodes = [StructureEngine.create(ORG, { type: 'organization', name: 'H', parentId: null })];
    const root = nodes[0];
    nodes = [...nodes, StructureEngine.createNode(nodes, ORG, root.id, { type: 'department', name: 'Medicine' })];
    nodes = [...nodes, StructureEngine.createNode(nodes, ORG, root.id, { type: 'department', name: 'Surgery' })];
    const [dept1, dept2] = nodes.slice(1);
    expect(dept1.order).toBe(0);
    expect(dept2.order).toBe(1);
    expect(dept1.code).toContain('DEPT-MEDICINE');
  });

  it('rejects an invalid child under a parent type', () => {
    const dept = StructureEngine.createNode(
      [StructureEngine.create(ORG, { type: 'organization', name: 'H', parentId: null })],
      ORG, null as unknown as string, { type: 'department', name: 'Med' }
    );
    // department cannot contain an organization
    expect(isAllowedChild('department', 'organization')).toBe(false);
    expect(() =>
      StructureEngine.createNode([dept], ORG, dept.id, { type: 'organization', name: 'x' })
    ).toThrow();
  });

  it('allows a ward to contain beds', () => {
    expect(isAllowedChild('ward', 'bed')).toBe(true);
    expect(isAllowedChild('ward', 'bedroom')).toBe(false);
  });

  it('rename updates code', () => {
    const [org, dept] = seed();
    const next = StructureEngine.rename([org, dept], dept.id, 'Surgery');
    const renamed = next.find((n) => n.id === dept.id)!;
    expect(renamed.name).toBe('Surgery');
    expect(renamed.code).toContain('SURGERY');
  });

  it('setStatus updates status', () => {
    const [org, dept] = seed();
    const next = StructureEngine.setStatus([org, dept], dept.id, 'active');
    expect(next.find((n) => n.id === dept.id)!.status).toBe('active');
  });

  it('remove cascades descendants', () => {
    let nodes = seed();
    const dept = nodes[nodes.length - 1];
    const ward = StructureEngine.createNode(nodes, ORG, dept.id, { type: 'ward', name: 'Ward 3B' });
    const bed = StructureEngine.createNode([...nodes, ward], ORG, ward.id, { type: 'bed', name: 'Bed 12' });
    const full = [...nodes, ward, bed];
    const after = StructureEngine.remove(full, dept.id);
    expect(after).toHaveLength(1); // only root survives
  });

  it('move re-parents and blocks cycles + type violations', () => {
    const org = StructureEngine.create(ORG, { type: 'organization', name: 'H', parentId: null });
    const dept = StructureEngine.createNode([org], ORG, org.id, { type: 'department', name: 'Med' });
    const ward = StructureEngine.createNode([org, dept], ORG, dept.id, { type: 'ward', name: 'W1' });
    const nodes = [org, dept, ward];

    // move ward under org (valid) — org can contain ward? Our registry: no. Use facility.
    // move ward directly under org is rejected
    let moved;
    try {
      StructureEngine.move(nodes, ward.id, org.id);
      moved = 'allowed';
    } catch {
      moved = 'rejected';
    }
    expect(moved).toBe('rejected');

    // cycle: move org under ward → blocked returning same array.
    const cycled = StructureEngine.move(nodes, org.id, ward.id);
    expect(cycled.map((n) => n.id)).toEqual(nodes.map((n) => n.id));
  });

  it('materialize produces a sorted tree', () => {
    const org = StructureEngine.create(ORG, { type: 'organization', name: 'H', parentId: null });
    const depA = StructureEngine.createNode([org], ORG, org.id, { type: 'department', name: 'A' });
    const depB = StructureEngine.createNode([org, depA], ORG, org.id, { type: 'department', name: 'B' });
    const tree = StructureEngine.materialize([depA, org, depB]);
    expect(tree.length).toBe(1);
    expect(tree[0].children.map((c) => c.name)).toEqual(['A', 'B']);
  });

  it('finds breadcrumb paths', () => {
    const org = StructureEngine.create(ORG, { type: 'organization', name: 'H', parentId: null });
    const dept = StructureEngine.createNode([org], ORG, org.id, { type: 'department', name: 'Med' });
    const ward = StructureEngine.createNode([org, dept], ORG, dept.id, { type: 'ward', name: 'W1' });
    const path = StructureEngine.path([org, dept, ward], ward.id);
    expect(path).toEqual(['H', 'Med', 'W1']);
  });

  it('supports runtime registration of a new constitutional type', () => {
    expect(getNodeType('stroke_center')).toBeUndefined();
    registerNodeType({
      id: 'stroke_center', label: 'Stroke Center', plural: 'Stroke Centers',
      icon: '🧠', color: '#8b5cf6', kind: 'container', children: ['room', 'bed'],
      parentTypes: ['department'],
      codePrefix: 'STROKE', description: 'A stroke center.',
    });
    expect(getNodeType('stroke_center')!.label).toBe('Stroke Center');
    expect(isAllowedChild('department', 'stroke_center')).toBe(true);
    expect(typeLabel('stroke_center')).toBe('Stroke Center');
  });
});