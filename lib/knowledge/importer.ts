import {
  type KnowledgeGraph, type GraphNode, type GraphRelationship, type NodeType, type RelationshipType,
  createEmptyGraph, addNode, addRelationship,
} from './constitution';
import type { YamlKnowledgeDocument, YamlSymptom, YamlMechanism, YamlPhenotype, YamlDisease, YamlInvestigation, YamlDrug, YamlGuideline, YamlContext, YamlQuestion, YamlSign, YamlScore, YamlProtocol } from './yaml-schema';

let _idCounter = 0;
function uid(prefix: string): string {
  _idCounter++;
  return `${prefix}_${_idCounter}_${Date.now()}`;
}

function toNodeType(yamlType: string): NodeType {
  const map: Record<string, NodeType> = {
    symptom: 'symptom', mechanism: 'mechanism', phenotype: 'phenotype',
    disease: 'disease', investigation: 'investigation', drug: 'drug',
    guideline: 'guideline', context: 'context', question: 'question',
    sign: 'sign', score: 'score', protocol: 'protocol',
    risk_factor: 'risk_factor', etiology: 'etiology', complication: 'complication',
  };
  return map[yamlType] || 'symptom';
}

export function importYamlKnowledge(doc: YamlKnowledgeDocument): KnowledgeGraph {
  const graph = createEmptyGraph(doc.metadata.title || 'Imported Knowledge');
  _idCounter = 0;

  const nodeMap = new Map<string, string>();

  const makeNode = (id: string, type: NodeType, label: string, props: Record<string, unknown> = {}): GraphNode => ({
    id: uid(type),
    type,
    label,
    description: (props.description as string) || '',
    properties: props,
    version: doc.version || '1.0.0',
    source: 'constitutional',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: doc.metadata.tags || [],
  });

  const link = (sourceId: string, targetId: string, type: RelationshipType, strength = 1): GraphRelationship => ({
    id: uid('rel'),
    type,
    sourceId,
    targetId,
    strength,
    direction: 'directed',
    evidence: 'expert_opinion',
    metadata: {},
    version: doc.version || '1.0.0',
    active: true,
  });

  const getNodeId = (yamlId: string): string | undefined => nodeMap.get(yamlId);

  const register = (yamlId: string, nodeId: string) => {
    nodeMap.set(yamlId, nodeId);
  };

  // 1. Import Mechanisms
  if (doc.mechanisms) {
    for (const m of doc.mechanisms) {
      const node = makeNode(m.id, 'mechanism', m.name, {
        category: m.category, description: m.description,
      });
      register(m.id, node.id);
      addNode(graph, node);
    }
  }

  // 2. Import Symptoms
  if (doc.symptoms) {
    for (const s of doc.symptoms) {
      const node = makeNode(s.id, 'symptom', s.name, {
        aliases: s.aliases, bodySystem: s.bodySystem, urgency: s.urgency,
      });
      register(s.id, node.id);
      addNode(graph, node);

      if (s.mechanisms) {
        for (const mechId of s.mechanisms) {
          const targetId = getNodeId(mechId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'HAS_MECHANISM'));
        }
      }
    }
  }

  // 3. Import Phenotypes
  if (doc.phenotypes) {
    for (const p of doc.phenotypes) {
      const node = makeNode(p.id, 'phenotype', p.name, {
        features: p.features, urgency: p.urgency, prevalence: p.prevalence,
      });
      register(p.id, node.id);
      addNode(graph, node);

      if (p.suggests) {
        for (const diseaseId of p.suggests) {
          const targetId = getNodeId(diseaseId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'SUGGESTS'));
        }
      }
    }
  }

  // 4. Import Diseases
  if (doc.diseases) {
    for (const d of doc.diseases) {
      const node = makeNode(d.id, 'disease', d.name, {
        icd10: d.icd10, snomed: d.snomed, synonyms: d.synonyms,
        specialties: d.specialty, emergencyLevel: d.emergencyLevel,
      });
      register(d.id, node.id);
      addNode(graph, node);

      if (d.mechanisms) {
        for (const mechId of d.mechanisms) {
          const targetId = getNodeId(mechId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'HAS_MECHANISM'));
        }
      }
      if (d.phenotypes) {
        for (const phenId of d.phenotypes) {
          const targetId = getNodeId(phenId);
          if (targetId) addRelationship(graph, link(targetId, node.id, 'SUGGESTS'));
        }
      }
      if (d.investigations) {
        for (const inv of d.investigations) {
          const targetId = getNodeId(inv.investigationId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'HAS_INVESTIGATION'));
        }
      }
      if (d.treatments) {
        for (const tx of d.treatments) {
          const targetId = getNodeId(tx.treatmentId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'HAS_TREATMENT'));
        }
      }
      if (d.guidelines) {
        for (const gId of d.guidelines) {
          const targetId = getNodeId(gId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'HAS_GUIDELINE'));
        }
      }
      if (d.differentials) {
        for (const diffId of d.differentials) {
          const targetId = getNodeId(diffId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'DIFFERENTIATE'));
        }
      }
    }
  }

  // 5. Import Investigations
  if (doc.investigations) {
    for (const inv of doc.investigations) {
      const node = makeNode(inv.id, 'investigation', inv.name, {
        loinc: inv.loinc, category: inv.category, specimen: inv.specimen,
      });
      register(inv.id, node.id);
      addNode(graph, node);

      if (inv.confirmsDisease) {
        for (const dId of inv.confirmsDisease) {
          const targetId = getNodeId(dId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'CONFIRMED_BY'));
        }
      }
    }
  }

  // 6. Import Drugs
  if (doc.drugs) {
    for (const drug of doc.drugs) {
      const node = makeNode(drug.id, 'drug', drug.name, {
        genericName: drug.genericName, atcCode: drug.atcCode,
        category: drug.category, pregnancyCategory: drug.pregnancyCategory,
        renalAdjustment: drug.renalAdjustment, contraindications: drug.contraindications,
      });
      register(drug.id, node.id);
      addNode(graph, node);

      if (drug.treatsDisease) {
        for (const dId of drug.treatsDisease) {
          const targetId = getNodeId(dId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'TREATED_BY'));
        }
      }
    }
  }

  // 7. Import Guidelines
  if (doc.guidelines) {
    for (const g of doc.guidelines) {
      const node = makeNode(g.id, 'guideline', g.title, {
        issuingBody: g.issuingBody, year: g.year, level: g.level, country: g.country,
      });
      register(g.id, node.id);
      addNode(graph, node);

      if (g.appliesToDisease) {
        for (const dId of g.appliesToDisease) {
          const targetId = getNodeId(dId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'APPLIES_TO'));
        }
      }
      if (g.overrides) {
        for (const oId of g.overrides) {
          const targetId = getNodeId(oId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'OVERRIDES'));
        }
      }
    }
  }

  // 8. Import Contexts
  if (doc.contexts) {
    for (const c of doc.contexts) {
      const node = makeNode(c.id, 'context', c.name, {
        category: c.category, description: c.description,
      });
      register(c.id, node.id);
      addNode(graph, node);
    }
  }

  // 9. Import Questions
  if (doc.questions) {
    for (const q of doc.questions) {
      const node = makeNode(q.id, 'question', q.text, {
        dataType: q.dataType, options: q.options, order: q.order,
      });
      register(q.id, node.id);
      addNode(graph, node);
    }
  }

  // 10. Import Signs
  if (doc.signs) {
    for (const s of doc.signs) {
      const node = makeNode(s.id, 'sign', s.name, {
        examinationType: s.examinationType, bodySystem: s.bodySystem,
      });
      register(s.id, node.id);
      addNode(graph, node);

      if (s.supportsDisease) {
        for (const dId of s.supportsDisease) {
          const targetId = getNodeId(dId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'SUPPORTS'));
        }
      }
    }
  }

  // 11. Import Scores
  if (doc.scores) {
    for (const s of doc.scores) {
      const node = makeNode(s.id, 'score', s.name, {
        minScore: s.minScore, maxScore: s.maxScore, components: s.components, thresholds: s.thresholds,
      });
      register(s.id, node.id);
      addNode(graph, node);

      if (s.appliesToDisease) {
        for (const dId of s.appliesToDisease) {
          const targetId = getNodeId(dId);
          if (targetId) addRelationship(graph, link(node.id, targetId, 'HAS_SCORE'));
        }
      }
    }
  }

  // 12. Import Protocols
  if (doc.protocols) {
    for (const p of doc.protocols) {
      const node = makeNode(p.id, 'protocol', p.name, {
        type: p.type, steps: p.steps,
      });
      register(p.id, node.id);
      addNode(graph, node);
    }
  }

  return graph;
}

export function graphToJson(graph: KnowledgeGraph): string {
  const nodes = Array.from(graph.nodes.values());
  const relationships = Array.from(graph.relationships.values());
  return JSON.stringify({
    id: graph.id,
    name: graph.name,
    version: graph.version,
    nodeCount: nodes.length,
    relationshipCount: relationships.length,
    nodes: nodes.map(n => ({
      id: n.id, type: n.type, label: n.label, description: n.description,
      properties: n.properties, tags: n.tags,
    })),
    relationships: relationships.map(r => ({
      id: r.id, type: r.type, sourceId: r.sourceId, targetId: r.targetId, strength: r.strength,
    })),
    createdAt: graph.createdAt,
    updatedAt: graph.updatedAt,
  }, null, 2);
}

export interface GraphStats {
  nodeCount: number;
  relationshipCount: number;
  nodeTypeCounts: Record<string, number>;
  relationshipTypeCounts: Record<string, number>;
  averageConnectivity: number;
}

export function computeGraphStats(graph: KnowledgeGraph): GraphStats {
  const nodes = Array.from(graph.nodes.values());
  const relationships = Array.from(graph.relationships.values());

  const nodeTypeCounts: Record<string, number> = {};
  for (const n of nodes) {
    nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1;
  }

  const relationshipTypeCounts: Record<string, number> = {};
  for (const r of relationships) {
    relationshipTypeCounts[r.type] = (relationshipTypeCounts[r.type] || 0) + 1;
  }

  const connectivity = nodes.length > 0 ? (relationships.length * 2) / nodes.length : 0;

  return {
    nodeCount: nodes.length,
    relationshipCount: relationships.length,
    nodeTypeCounts,
    relationshipTypeCounts,
    averageConnectivity: Math.round(connectivity * 100) / 100,
  };
}
