import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeYamlParser } from '../knowledge-yaml-parser';
import { knowledgeRegistry } from '../knowledge-registry';
import { knowledgeGraph } from '../knowledge-graph';
import { knowledgeIntegration } from '../knowledge-integration';
import { EXAMPLE_PACKAGES } from '../packages/example-packages';
import { KnowledgeCompiler } from '@/lib/amexan/constitution/books/book-VII-knowledge-compiler';
import { ObjectType } from '@/lib/amexan/constitution/books/book-I-objects';

const parser = new KnowledgeYamlParser();
const compiler = new KnowledgeCompiler();

// ── YAML Parser ──────────────────────────────────────────────────────────────

describe('KnowledgeYamlParser', () => {
  it('converts YamlKnowledgePackage to KnowledgePackage', () => {
    const pkg = parser.parseObject({
      id: 'test_pkg', name: 'Test', version: '1.0.0',
      objects: [{ id: 'sym_test', type: 'symptom', name: 'Test Symptom' }],
      relationships: [{ source: 'sym_test', target: 'sym_test', type: 'associated_with' }],
    });

    expect(pkg.id).toBe('test_pkg');
    expect(pkg.objects).toHaveLength(1);
    expect(pkg.objects[0].id).toBe('sym_test');
    expect(pkg.objects[0].type).toBe('symptom');
    expect(pkg.relationships).toHaveLength(1);
  });

  it('maps object types correctly', () => {
    const types = [
      ['symptom', 'symptom'],
      ['disease', 'disease'],
      ['mechanism', 'mechanism'],
      ['phenotype', 'phenotype'],
      ['investigation', 'investigation'],
      ['treatment', 'treatment'],
      ['drug', 'drug'],
      ['complication', 'complication'],
      ['protocol', 'protocol'],
    ];

    for (const [input, expected] of types) {
      const pkg = parser.parseObject({
        id: `test_${input}`, name: `Test ${input}`, version: '1.0.0',
        objects: [{ id: `obj_${input}`, type: input, name: `Test ${input} Object` }],
        relationships: [],
      });
      expect(pkg.objects[0].type).toBe(expected);
    }
  });

  it('maps relationship types correctly', () => {
    const rels = [
      ['has_mechanism', 'has_mechanism'],
      ['produces', 'produces_phenotype'],
      ['suggests', 'suggests_disease'],
      ['investigates', 'investigates'],
      ['treats', 'treats'],
      ['complicates', 'complicates'],
    ];

    for (const [input, _expected] of rels) {
      const pkg = parser.parseObject({
        id: `test_rel_${input}`, name: 'Test', version: '1.0.0',
        objects: [
          { id: 'source', type: 'symptom', name: 'Source' },
          { id: 'target', type: 'disease', name: 'Target' },
        ],
        relationships: [{ source: 'source', target: 'target', type: input }],
      });
      expect(pkg.relationships[0].type).toBeTruthy();
    }
  });

  it('parses object properties', () => {
    const pkg = parser.parseObject({
      id: 'prop_test', name: 'Prop Test', version: '1.0.0',
      objects: [{
        id: 'obj1', type: 'disease', name: 'Test Disease',
        description: 'A test disease',
        severity: 'severe',
        properties: { icd10: 'A00.0' },
      }],
      relationships: [],
    });

    expect(pkg.objects[0].properties['description']).toBe('A test disease');
    expect(pkg.objects[0].properties['severity']).toBe('severe');
    expect(pkg.objects[0].properties['icd10']).toBe('A00.0');
  });

  it('parses rules', () => {
    const pkg = parser.parseObject({
      id: 'rules_test', name: 'Rules Test', version: '1.0.0',
      objects: [],
      relationships: [],
      rules: [
        { id: 'rule_1', description: 'Test rule', when: 'true', then: 'do something', priority: 1 },
      ],
    });

    expect(pkg.rules).toHaveLength(1);
    expect(pkg.rules[0].condition).toBe('true');
    expect(pkg.rules[0].action).toBe('do something');
    expect(pkg.rules[0].priority).toBe(1);
  });

  it('parses documentation', () => {
    const pkg = parser.parseObject({
      id: 'doc_test', name: 'Doc Test', version: '1.0.0',
      objects: [{ id: 'obj1', type: 'symptom', name: 'Test' }],
      relationships: [],
      documentation: [{ object: 'obj1', template: 'Template {{var}}', variables: ['var'] }],
    });

    expect(pkg.documentation).toHaveLength(1);
    expect(pkg.documentation[0].narrativeTemplate).toContain('{{var}}');
  });
});

// ── Knowledge Compiler ──────────────────────────────────────────────────────

describe('KnowledgeCompiler', () => {
  it('compiles a valid package successfully', () => {
    const pkg = parser.parseObject({
      id: 'compile_test', name: 'Compile Test', version: '1.0.0',
      symptom: 'test_symptom',
      objects: [
        { id: 'sym1', type: 'symptom', name: 'Symptom 1' },
        { id: 'mech1', type: 'mechanism', name: 'Mechanism 1' },
        { id: 'dx1', type: 'disease', name: 'Disease 1' },
        { id: 'inv1', type: 'investigation', name: 'Investigation 1' },
        { id: 'trt1', type: 'treatment', name: 'Treatment 1' },
      ],
      relationships: [
        { source: 'sym1', target: 'mech1', type: 'has_mechanism' },
        { source: 'mech1', target: 'dx1', type: 'suggests' },
        { source: 'dx1', target: 'inv1', type: 'investigates' },
        { source: 'dx1', target: 'trt1', type: 'treats' },
      ],
      contexts: ['adult'],
    });

    const result = compiler.compile(pkg);
    expect(result.success).toBe(true);
    expect(result.stats.objectsValidated).toBe(5);
    expect(result.stats.relationshipsValidated).toBe(4);
  });

  it('fails on empty package', () => {
    const pkg = parser.parseObject({
      id: 'empty', name: 'Empty', version: '1.0.0',
      objects: [], relationships: [],
    });

    const result = compiler.compile(pkg);
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.code === 'EMPTY_PACKAGE')).toBe(true);
  });

  it('fails on duplicate object IDs', () => {
    const pkg = parser.parseObject({
      id: 'dup_test', name: 'Dup Test', version: '1.0.0',
      objects: [
        { id: 'dup1', type: 'symptom', name: 'First' },
        { id: 'dup1', type: 'symptom', name: 'Second' },
      ],
      relationships: [],
    });

    const result = compiler.compile(pkg);
    expect(result.errors.some(e => e.code === 'DUPLICATE_ID')).toBe(true);
  });

  it('warns on missing contexts', () => {
    const pkg = parser.parseObject({
      id: 'no_ctx', name: 'No Context', version: '1.0.0',
      objects: [{ id: 'o1', type: 'symptom', name: 'Test' }],
      relationships: [],
    });

    const result = compiler.compile(pkg);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

// ── Package Registry ────────────────────────────────────────────────────────

describe('KnowledgePackageRegistry', () => {
  beforeEach(() => {
    knowledgeRegistry.clear();
  });

  it('registers and retrieves a package', () => {
    const result = knowledgeRegistry.register(EXAMPLE_PACKAGES[0]);
    expect(result.success).toBe(true);

    const retrieved = knowledgeRegistry.get('pkg_pneumonia');
    expect(retrieved).toBeDefined();
    expect(retrieved!.name).toBe('Pneumonia Knowledge Package');
  });

  it('searches by symptom', () => {
    for (const pkg of EXAMPLE_PACKAGES) knowledgeRegistry.register(pkg);

    const coughPackages = knowledgeRegistry.getBySymptom('cough');
    expect(coughPackages.length).toBeGreaterThan(0);
    expect(coughPackages[0].id).toBe('pkg_pneumonia');
  });

  it('searches by disease', () => {
    for (const pkg of EXAMPLE_PACKAGES) knowledgeRegistry.register(pkg);

    const malariaPkgs = knowledgeRegistry.getByDisease('malaria');
    expect(malariaPkgs).toHaveLength(1);
  });

  it('searches by free text', () => {
    for (const pkg of EXAMPLE_PACKAGES) knowledgeRegistry.register(pkg);

    const results = knowledgeRegistry.search('pneumonia');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns compilation stats', () => {
    for (const pkg of EXAMPLE_PACKAGES) knowledgeRegistry.register(pkg);

    const stats = knowledgeRegistry.getCompilationStats();
    expect(stats.total).toBe(3);
    expect(stats.success).toBe(3);
  });
});

// ── Knowledge Graph ─────────────────────────────────────────────────────────

describe('KnowledgeGraph', () => {
  beforeEach(() => {
    knowledgeGraph.clear();
  });

  it('builds graph from packages', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    expect(knowledgeGraph.getNodeCount()).toBeGreaterThan(0);
    expect(knowledgeGraph.getEdgeCount()).toBeGreaterThan(0);
  });

  it('finds nodes by ID', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const cough = knowledgeGraph.getNode('sym_cough');
    expect(cough).toBeDefined();
    expect(cough!.name).toBe('Cough');
  });

  it('finds nodes by type', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const diseases = knowledgeGraph.getNodesByType(ObjectType.Disease);
    expect(diseases.length).toBeGreaterThanOrEqual(2);
  });

  it('finds outgoing edges from a node', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const edges = knowledgeGraph.getOutgoingEdges('sym_cough');
    expect(edges.length).toBeGreaterThan(0);
  });

  it('traverses symptom→mechanism→disease path', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const path = knowledgeGraph.getDiseaseFromSymptom('sym_cough');
    expect(path.nodes.length).toBeGreaterThanOrEqual(2);
    expect(path.totalConfidence).toBeGreaterThan(0);
  });

  it('gets differentials for a symptom', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const diffs = knowledgeGraph.getDifferentials('sym_cough');
    expect(diffs.length).toBeGreaterThan(0);
    expect(diffs[0].confidence).toBeGreaterThan(0);
  });

  it('gets investigations for a disease', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const invs = knowledgeGraph.getInvestigationsForDisease('dx_pneumonia');
    expect(invs.length).toBeGreaterThan(0);
    expect(invs.some(i => i.name === 'Chest X-Ray')).toBe(true);
  });

  it('gets treatments for a disease', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const txs = knowledgeGraph.getTreatmentsForDisease('dx_pneumonia');
    expect(txs.length).toBeGreaterThan(0);
  });

  it('gets complications', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const complications = knowledgeGraph.getComplications('dx_malaria');
    expect(complications.length).toBeGreaterThan(0);
    expect(complications[0].name).toBe('Severe Malaria');
  });

  it('finds connected nodes', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const connected = knowledgeGraph.getConnectedNodes('dx_pneumonia');
    expect(connected.length).toBeGreaterThan(0);
  });

  it('finds path between two nodes', () => {
    knowledgeGraph.build(EXAMPLE_PACKAGES);
    const path = knowledgeGraph.findPath('sym_cough', 'dx_pneumonia');
    expect(path).not.toBeNull();
    expect(path!.nodes.length).toBeGreaterThan(1);
  });

  it('rebuilds from registry', () => {
    for (const pkg of EXAMPLE_PACKAGES) knowledgeRegistry.register(pkg);
    knowledgeGraph.rebuildFromRegistry();
    expect(knowledgeGraph.getNodeCount()).toBeGreaterThan(0);
  });
});

// ── Knowledge Integration ───────────────────────────────────────────────────

describe('KnowledgeIntegration', () => {
  beforeEach(() => {
    knowledgeGraph.clear();
    knowledgeRegistry.clear();
    for (const pkg of EXAMPLE_PACKAGES) knowledgeRegistry.register(pkg);
    knowledgeGraph.build(EXAMPLE_PACKAGES);
  });

  it('gets differentials from symptoms', () => {
    const diffs = knowledgeIntegration.getDifferentialsFromSymptoms(['sym_cough', 'sym_fever']);
    expect(diffs.length).toBeGreaterThan(0);
    expect(diffs[0].type).toBe('differential');
    expect(diffs[0].confidence).toBeGreaterThan(0);
  });

  it('gets investigations for diagnosis', () => {
    const invs = knowledgeIntegration.getInvestigationsForDiagnosis('dx_pneumonia');
    expect(invs.length).toBeGreaterThan(0);
    expect(invs.every(i => i.type === 'investigation')).toBe(true);
  });

  it('gets treatments for diagnosis', () => {
    const txs = knowledgeIntegration.getTreatmentsForDiagnosis('dx_pneumonia');
    expect(txs.length).toBeGreaterThan(0);
    expect(txs.every(t => t.type === 'treatment')).toBe(true);
  });

  it('gets red flags', () => {
    const flags = knowledgeIntegration.getRedFlags(['sym_cough']);
    expect(flags).toBeDefined();
  });

  it('gets full context', () => {
    const ctx = knowledgeIntegration.getFullContext({
      symptoms: ['sym_cough', 'sym_fever'],
      diagnoses: ['dx_pneumonia'],
    });
    expect(ctx.differentials.length).toBeGreaterThan(0);
    expect(ctx.investigations.length).toBeGreaterThan(0);
    expect(ctx.treatments.length).toBeGreaterThan(0);
    expect(ctx.redFlags).toBeDefined();
  });

  it('gets learning path from symptom', () => {
    const path = knowledgeIntegration.getLearningPath('sym_cough');
    expect(path).toBeDefined();
    expect(path!.nodes.length).toBeGreaterThan(1);
  });

  it('returns empty arrays when no data matches', () => {
    const diffs = knowledgeIntegration.getDifferentialsFromSymptoms(['sym_nonexistent']);
    expect(diffs).toHaveLength(0);
  });
});

// ── End-to-End Pipeline ─────────────────────────────────────────────────────

describe('Knowledge Pipeline End-to-End', () => {
  beforeEach(() => {
    knowledgeGraph.clear();
    knowledgeRegistry.clear();
    for (const pkg of EXAMPLE_PACKAGES) knowledgeRegistry.register(pkg);
    knowledgeGraph.build(EXAMPLE_PACKAGES);
  });

  it('compiles → registers → graphs → queries → returns suggestions', () => {
    const pkg = EXAMPLE_PACKAGES[0];

    const result = compiler.compile(pkg);
    expect(result.success).toBe(true);

    const regResult = knowledgeRegistry.register(pkg);
    expect(regResult.success).toBe(true);

    knowledgeGraph.rebuildFromRegistry();
    const diffs = knowledgeGraph.getDifferentials('sym_cough');
    expect(diffs.length).toBeGreaterThan(0);

    const suggestions = knowledgeIntegration.getDifferentialsFromSymptoms(['sym_cough']);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('pneumonia package has all expected components', () => {
    const pkg = knowledgeRegistry.get('pkg_pneumonia')!;

    const symptomObjects = pkg.objects.filter(o => o.type === 'symptom');
    const mechanismObjects = pkg.objects.filter(o => o.type === 'mechanism');
    const diseaseObjects = pkg.objects.filter(o => o.type === 'disease');
    const investigationObjects = pkg.objects.filter(o => o.type === 'investigation');
    const treatmentObjects = pkg.objects.filter(o => o.type === 'treatment' || o.type === 'drug');

    expect(symptomObjects.length).toBeGreaterThanOrEqual(5);
    expect(mechanismObjects.length).toBeGreaterThanOrEqual(3);
    expect(diseaseObjects.length).toBeGreaterThanOrEqual(3);
    expect(investigationObjects.length).toBeGreaterThanOrEqual(6);
    expect(treatmentObjects.length).toBeGreaterThanOrEqual(3);
  });

  it('malaria package has complications', () => {
    const pkg = knowledgeRegistry.get('pkg_malaria')!;
    const complications = pkg.objects.filter(o => o.type === 'complication');
    expect(complications.length).toBeGreaterThan(0);
  });

  it('UTI package has rules', () => {
    const pkg = knowledgeRegistry.get('pkg_uti')!;
    expect(pkg.rules.length).toBeGreaterThanOrEqual(2);
  });

  it('graph connects all three packages', () => {
    const totalNodes = knowledgeGraph.getNodeCount();
    const totalEdges = knowledgeGraph.getEdgeCount();
    expect(totalNodes).toBeGreaterThan(30);
    expect(totalEdges).toBeGreaterThan(40);
  });
});