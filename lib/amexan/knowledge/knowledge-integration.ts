import { KnowledgePackage } from '@/lib/amexan/constitution/books/book-VII-knowledge-compiler';
import { ObjectType } from '@/lib/amexan/constitution/books/book-I-objects';
import { RelationshipType } from '@/lib/amexan/constitution/books/book-II-relationships';
import { knowledgeRegistry } from './knowledge-registry';
import { knowledgeGraph, KnowledgePath, GraphNode } from './knowledge-graph';

export interface KnowledgeSuggestion {
  type: 'differential' | 'investigation' | 'treatment' | 'red_flag' | 'teaching' | 'protocol';
  label: string;
  description: string;
  confidence: number;
  sourcePackage: string;
  evidence?: string;
  priority: number;
}

export interface KnowledgeContext {
  symptoms: string[];
  diagnoses: string[];
  patientAge?: number;
  patientGender?: string;
  pregnancy?: boolean;
  region?: string;
}

export class KnowledgeIntegration {
  getDifferentialsFromSymptoms(symptoms: string[], topN: number = 10): KnowledgeSuggestion[] {
    const suggestions: KnowledgeSuggestion[] = [];
    const seen = new Set<string>();

    for (const symptomId of symptoms) {
      const diffs = knowledgeGraph.getDifferentials(symptomId);
      for (const diff of diffs) {
        if (seen.has(diff.disease.id)) continue;
        seen.add(diff.disease.id);

        const pkg = knowledgeRegistry.getByObjectId(diff.disease.id);
        suggestions.push({
          type: 'differential',
          label: diff.disease.name,
          description: (diff.disease.properties['description'] as string) || '',
          confidence: diff.confidence,
          sourcePackage: diff.disease.packageId,
          evidence: diff.path[0]?.evidence,
          priority: Math.round((1 - diff.confidence) * 100),
        });
      }
    }

    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, topN);
  }

  getInvestigationsForDiagnosis(diagnosisId: string): KnowledgeSuggestion[] {
    const investigations = knowledgeGraph.getInvestigationsForDisease(diagnosisId);
    return investigations.map(inv => ({
      type: 'investigation' as const,
      label: inv.name,
      description: (inv.properties['description'] as string) || '',
      confidence: 0.9,
      sourcePackage: inv.packageId,
      priority: (inv.properties['priority'] as number) || 5,
    }));
  }

  getTreatmentsForDiagnosis(diagnosisId: string): KnowledgeSuggestion[] {
    const treatments = knowledgeGraph.getTreatmentsForDisease(diagnosisId);
    return treatments.map(tx => ({
      type: 'treatment' as const,
      label: tx.name,
      description: (tx.properties['description'] as string) || '',
      confidence: 0.85,
      sourcePackage: tx.packageId,
      priority: 5,
    }));
  }

  getRedFlags(symptoms: string[]): KnowledgeSuggestion[] {
    const flags: KnowledgeSuggestion[] = [];
    for (const symptomId of symptoms) {
      const node = knowledgeGraph.getNode(symptomId);
      if (!node) continue;

      const redFlags = node.properties['red_flags'] as string[];
      if (redFlags) {
        for (const flag of redFlags) {
          flags.push({
            type: 'red_flag',
            label: `Red Flag: ${flag}`,
            description: `Critical finding associated with ${node.name}`,
            confidence: 0.95,
            sourcePackage: node.packageId,
            priority: 1,
          });
        }
      }
    }
    return flags;
  }

  getTeachingContent(diagnosisId: string): KnowledgeSuggestion[] {
    const points = knowledgeGraph.getTeachingPoints(diagnosisId);
    return points.map((p: Record<string, unknown>, i: number) => ({
      type: 'teaching' as const,
      label: (p.title as string) || `Teaching Point ${i + 1}`,
      description: (p.content as string) || '',
      confidence: 1,
      sourcePackage: '',
      priority: 5,
    }));
  }

  getLearningPath(symptom: string): KnowledgePath | null {
    return knowledgeGraph.getDiseaseFromSymptom(symptom);
  }

  getFullContext(ctx: KnowledgeContext): {
    differentials: KnowledgeSuggestion[];
    redFlags: KnowledgeSuggestion[];
    investigations: KnowledgeSuggestion[];
    treatments: KnowledgeSuggestion[];
    teaching: KnowledgeSuggestion[];
  } {
    const diffs = this.getDifferentialsFromSymptoms(ctx.symptoms);
    const redFlags = this.getRedFlags(ctx.symptoms);

    const allInvestigations: KnowledgeSuggestion[] = [];
    const allTreatments: KnowledgeSuggestion[] = [];
    const allTeaching: KnowledgeSuggestion[] = [];
    const seenInv = new Set<string>();
    const seenTx = new Set<string>();

    for (const dx of ctx.diagnoses) {
      for (const inv of this.getInvestigationsForDiagnosis(dx)) {
        if (!seenInv.has(inv.label)) { seenInv.add(inv.label); allInvestigations.push(inv); }
      }
      for (const tx of this.getTreatmentsForDiagnosis(dx)) {
        if (!seenTx.has(tx.label)) { seenTx.add(tx.label); allTreatments.push(tx); }
      }
      allTeaching.push(...this.getTeachingContent(dx));
    }

    return {
      differentials: diffs,
      redFlags,
      investigations: allInvestigations,
      treatments: allTreatments,
      teaching: allTeaching,
    };
  }
}

export const knowledgeIntegration = new KnowledgeIntegration();