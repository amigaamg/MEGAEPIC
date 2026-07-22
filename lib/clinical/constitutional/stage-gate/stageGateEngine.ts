import { GateDefinition, GateStatus, Fact, PatientContext } from '../types';
import { evaluateSection, activateSections } from '../cqae/cqaeEngine';
import { SectionDefinition } from '../types';

export interface StageGateResult {
  gates: GateState[];
  nextGate: GateState | null;
  progress: number;
  totalRequired: number;
  completedRequired: number;
  blockedGates: GateState[];
}

export interface GateState {
  gate: GateDefinition;
  status: GateStatus;
  reason?: string;
}

export function evaluateGateStatus(
  gate: GateDefinition,
  completedSectionIds: string[],
  facts: Fact[],
  ctx: PatientContext,
  allSectionDefs?: SectionDefinition[]
): GateState {
  const isCompleted = completedSectionIds.includes(gate.id);
  if (isCompleted) {
    return { gate, status: 'completed', reason: 'Section completed' };
  }

  const sectionDef = allSectionDefs?.find(s => s.id === gate.id);
  if (sectionDef) {
    const cqaeResult = evaluateSection(sectionDef, ctx);
    if (!cqaeResult.visible) {
      return { gate, status: 'pending', reason: 'Not applicable for this patient context' };
    }
  }

  const missingPrerequisites = gate.prerequisites.filter(
    prereqId => {
      if (allSectionDefs) {
        const prereqDef = allSectionDefs.find(s => s.id === prereqId);
        if (prereqDef) {
          const prereqCqae = evaluateSection(prereqDef, ctx);
          if (!prereqCqae.visible) return false;
        }
      }
      return !completedSectionIds.includes(prereqId);
    }
  );

  if (missingPrerequisites.length > 0) {
    return {
      gate,
      status: 'locked',
      reason: `Requires: ${missingPrerequisites.join(', ')}`,
    };
  }

  return { gate, status: 'active', reason: 'Ready for assessment' };
}

export function evaluateAllGates(
  gates: GateDefinition[],
  completedSectionIds: string[],
  facts: Fact[],
  ctx: PatientContext,
  allSectionDefs?: SectionDefinition[]
): StageGateResult {
  const gateStates = gates.map(g => evaluateGateStatus(g, completedSectionIds, facts, ctx, allSectionDefs));
  const activeGate = gateStates.find(g => g.status === 'active');
  const lockedGates = gateStates.filter(g => g.status === 'locked');
  const completedGates = gateStates.filter(g => g.status === 'completed');
  const pendingGates = gateStates.filter(g => g.status === 'pending');
  const totalRequired = gates.filter(g => g.required).length;
  const completedRequired = completedGates.filter(g => g.gate.required).length;
  const autoCompletedIds = pendingGates.map(g => g.gate.id);

  return {
    gates: gateStates,
    nextGate: activeGate || null,
    progress: totalRequired > 0 ? (completedRequired + autoCompletedIds.length) / gates.length : 0,
    totalRequired,
    completedRequired,
    blockedGates: lockedGates,
  };
}

export function canAccessGate(
  gateId: string,
  gates: GateDefinition[],
  completedSectionIds: string[],
  facts: Fact[],
  ctx: PatientContext,
  allSectionDefs?: SectionDefinition[]
): boolean {
  const gate = gates.find(g => g.id === gateId);
  if (!gate) return false;
  const { status } = evaluateGateStatus(gate, completedSectionIds, facts, ctx, allSectionDefs);
  return status === 'active' || status === 'completed';
}

export function completeGate(
  gateId: string,
  completedSectionIds: string[],
  gates: GateDefinition[],
  ctx?: PatientContext,
  allSectionDefs?: SectionDefinition[]
): string[] {
  let updated = completedSectionIds.includes(gateId)
    ? completedSectionIds
    : [...completedSectionIds, gateId];

  if (ctx && allSectionDefs) {
    for (const gate of gates) {
      if (!updated.includes(gate.id)) {
        const sectionDef = allSectionDefs.find(s => s.id === gate.id);
        if (sectionDef) {
          const cqaeResult = evaluateSection(sectionDef, ctx);
          if (!cqaeResult.visible && !updated.includes(gate.id)) {
            updated = [...updated, gate.id];
          }
        }
      }
    }
  }

  return updated;
}

export function getGatesForFormat(
  gates: GateDefinition[],
  ctx: PatientContext
): GateDefinition[] {
  return gates.sort((a, b) => a.position - b.position);
}

export function isAssessmentComplete(
  gates: GateDefinition[],
  completedSectionIds: string[]
): boolean {
  return gates.filter(g => g.required).every(g => completedSectionIds.includes(g.id));
}
