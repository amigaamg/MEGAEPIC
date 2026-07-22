import { create } from 'zustand';
import {
  ConstitutionalState,
  DocumentationBlock,
  PatientContext,
  SectionDefinition,
  GateStatus,
  SymptomObject,
  FindingObject,
  Fact,
  DiseaseObject,
  MedicationObject,
  AllergyObject,
  AssessmentFormat,
  computeAgeFromMonths,
} from './types';
import { generateFormat, UCAEMFormatResult } from './ucaem/ucaemFormatGenerator';
import { activateSections, reEvaluateOnContextChange } from './cqae/cqaeEngine';
import { evaluateAllGates, completeGate, GateState } from './stage-gate/stageGateEngine';
import { generateDocumentation, DocumentationInput } from './documentation/documentationEngine';

interface ConstitutionalStore extends ConstitutionalState {
  formatResult: UCAEMFormatResult | null;
  patientContext: PatientContext | null;
  gateStates: GateState[];
  nextGate: GateState | null;
  progress: number;
  totalRequired: number;
  completedRequired: number;
  sectionVisible: Record<string, boolean>;
  sectionRequired: Record<string, boolean>;

  initializeFromPatient: (ageMonths: number, sex: string, department: string) => void;
  setPatientContext: (ctx: PatientContext) => void;
  updatePatientContext: (updates: Partial<PatientContext>) => void;
  setActiveSection: (sectionId: string | null) => void;
  completeSection: (sectionId: string) => void;
  addSymptom: (symptom: SymptomObject) => void;
  updateSymptom: (id: string, updates: Partial<SymptomObject>) => void;
  addFinding: (finding: FindingObject) => void;
  updateFinding: (id: string, updates: Partial<FindingObject>) => void;
  addDisease: (disease: DiseaseObject) => void;
  updateDisease: (id: string, updates: Partial<DiseaseObject>) => void;
  addMedication: (medication: MedicationObject) => void;
  addAllergy: (allergy: AllergyObject) => void;
  addFact: (fact: Fact) => void;
  setGateStatus: (sectionId: string, status: GateStatus) => void;
  getVisibleSections: () => SectionDefinition[];
  isSectionAccessible: (sectionId: string) => boolean;
  getGateForSection: (sectionId: string) => GateState | undefined;
  regenerateDocumentation: () => void;
  reEvaluate: () => void;
  regenerateFormat: () => void;
}

const buildGateDefs = (sections: SectionDefinition[]) =>
  sections.map(s => ({
    id: s.id,
    sectionType: s.type,
    label: s.label,
    icon: s.icon,
    description: s.description,
    position: s.position,
    prerequisites: s.prerequisites,
    required: s.required,
  }));

const computeVisibleRequired = (sections: SectionDefinition[], ctx: PatientContext) => {
  const { visible, required } = activateSections(sections, ctx);
  const visibleMap: Record<string, boolean> = {};
  const requiredMap: Record<string, boolean> = {};
  for (const s of visible) visibleMap[s.id] = true;
  for (const s of required) requiredMap[s.id] = true;
  return { visibleMap, requiredMap };
};

export const useConstitutionalStore = create<ConstitutionalStore>((set, get) => ({
  format: 'adult_medical',
  sections: [],
  gateStatuses: {},
  activeSectionId: null,
  completedSectionIds: [],
  facts: [],
  symptoms: {},
  findings: {},
  diseases: {},
  medications: {},
  allergies: {},
  documentation: {},
  formatResult: null,
  patientContext: null,
  gateStates: [],
  nextGate: null,
  progress: 0,
  totalRequired: 0,
  completedRequired: 0,
  sectionVisible: {},
  sectionRequired: {},

  initializeFromPatient: (ageMonths: number, sex: string, department: string) => {
    const age = computeAgeFromMonths(ageMonths);
    const ctx: PatientContext = {
      age,
      sex: sex === 'Male' ? 'male' : sex === 'Female' ? 'female' : 'unknown',
      pregnancyStatus: 'unknown',
      department: department || '',
      specialty: '',
      encounterType: '',
      environment: {},
      activeComplaints: [],
      activeDiseaseIds: [],
      activeMedicationIds: [],
      activeAllergenIds: [],
      activeFindingIds: [],
      existingFacts: [],
    };

    const formatResult = generateFormat(ctx);
    const { visibleMap, requiredMap } = computeVisibleRequired(formatResult.sections, ctx);

    const gateDefs = buildGateDefs(formatResult.sections);
    const gateResult = evaluateAllGates(gateDefs, [], ctx.existingFacts, ctx, formatResult.sections);
    const gateStatuses: Record<string, GateStatus> = {};
    for (const g of gateResult.gates) {
      gateStatuses[g.gate.id] = g.status;
    }

    const completed = gateResult.gates
      .filter(g => g.status === 'pending')
      .map(g => g.gate.id);

    if (completed.length > 0) {
      const gateResult2 = evaluateAllGates(gateDefs, completed, ctx.existingFacts, ctx, formatResult.sections);
      for (const g of gateResult2.gates) {
        gateStatuses[g.gate.id] = g.status;
      }
      set({
        format: formatResult.format,
        sections: formatResult.sections,
        gateStatuses,
        patientContext: ctx,
        formatResult,
        gateStates: gateResult2.gates,
        nextGate: gateResult2.nextGate,
        progress: gateResult2.progress,
        totalRequired: gateResult2.totalRequired,
        completedRequired: gateResult2.completedRequired,
        sectionVisible: visibleMap,
        sectionRequired: requiredMap,
        completedSectionIds: completed,
        activeSectionId: gateResult2.nextGate?.gate.id || null,
      });
      return;
    }

    set({
      format: formatResult.format,
      sections: formatResult.sections,
      gateStatuses,
      patientContext: ctx,
      formatResult,
      gateStates: gateResult.gates,
      nextGate: gateResult.nextGate,
      progress: gateResult.progress,
      totalRequired: gateResult.totalRequired,
      completedRequired: gateResult.completedRequired,
      sectionVisible: visibleMap,
      sectionRequired: requiredMap,
      activeSectionId: gateResult.nextGate?.gate.id || null,
    });
  },

  setPatientContext: (ctx: PatientContext) => {
    set({ patientContext: ctx });
  },

  updatePatientContext: (updates: Partial<PatientContext>) => {
    const { patientContext, sections } = get();
    if (!patientContext) return;

    const ageChanged = updates.age !== undefined && updates.age.totalMonths !== patientContext.age.totalMonths;
    const sexChanged = updates.sex !== undefined && updates.sex !== patientContext.sex;
    const pregnancyChanged = updates.pregnancyStatus !== undefined && updates.pregnancyStatus !== patientContext.pregnancyStatus;
    const departmentChanged = updates.department !== undefined && updates.department !== patientContext.department;

    const previousCtx = { ...patientContext };
    const newCtx: PatientContext = { ...patientContext, ...updates };

    if (ageChanged || sexChanged || pregnancyChanged || departmentChanged) {
      get().setPatientContext(newCtx);
      get().regenerateFormat();
      return;
    }

    const { sectionsToActivate, sectionsToDeactivate } = reEvaluateOnContextChange(sections, previousCtx, newCtx);
    const { visibleMap, requiredMap } = computeVisibleRequired(sections, newCtx);

    const gateDefs = buildGateDefs(sections);
    const completedState = completeGate(
      '',
      get().completedSectionIds,
      gateDefs,
      newCtx,
      sections
    ).filter(id => id !== '');
    const deduped = [...new Set(completedState)];

    const gateResult = evaluateAllGates(gateDefs, deduped, newCtx.existingFacts, newCtx, sections);
    const gateStatuses: Record<string, GateStatus> = {};
    for (const g of gateResult.gates) {
      gateStatuses[g.gate.id] = g.status;
    }

    set({
      patientContext: newCtx,
      sectionVisible: visibleMap,
      sectionRequired: requiredMap,
      gateStatuses,
      gateStates: gateResult.gates,
      nextGate: gateResult.nextGate,
      progress: gateResult.progress,
      completedSectionIds: deduped,
      activeSectionId: gateResult.nextGate?.gate.id || get().activeSectionId,
    });
  },

  setActiveSection: (sectionId: string | null) => {
    const { sectionVisible } = get();
    if (sectionId && !sectionVisible[sectionId]) return;
    set({ activeSectionId: sectionId });
  },

  completeSection: (sectionId: string) => {
    const state = get();
    const { sections, patientContext, facts } = state;
    if (!patientContext) return;

    const input: DocumentationInput = {
      symptoms: Object.values(state.symptoms),
      findings: Object.values(state.findings),
      diseases: Object.values(state.diseases),
      medications: Object.values(state.medications),
      allergies: Object.values(state.allergies),
      facts: state.facts,
      ctx: patientContext,
    };

    const sectionDef = sections.find(s => s.id === sectionId);
    const docBlock = sectionDef
      ? generateDocumentation(sectionDef.type, input, state)
      : null;

    const gateDefs = buildGateDefs(sections);
    const completed = completeGate(sectionId, state.completedSectionIds, gateDefs, patientContext, sections);

    const gateResult = evaluateAllGates(gateDefs, completed, facts, patientContext, sections);
    const gateStatuses: Record<string, GateStatus> = {};
    for (const g of gateResult.gates) {
      gateStatuses[g.gate.id] = g.status;
    }

    const nextId = gateResult.nextGate?.gate.id || null;
    const docUpdate = docBlock
      ? { ...state.documentation, [sectionId]: docBlock }
      : state.documentation;

    set({
      completedSectionIds: completed,
      gateStatuses,
      gateStates: gateResult.gates,
      nextGate: gateResult.nextGate,
      progress: gateResult.progress,
      totalRequired: gateResult.totalRequired,
      completedRequired: gateResult.completedRequired,
      activeSectionId: nextId,
      documentation: docUpdate,
    });
  },

  addSymptom: (symptom: SymptomObject) => {
    set(state => ({
      symptoms: { ...state.symptoms, [symptom.id]: symptom },
    }));
  },

  updateSymptom: (id: string, updates: Partial<SymptomObject>) => {
    set(state => {
      const existing = state.symptoms[id];
      if (!existing) return state;
      return {
        symptoms: { ...state.symptoms, [id]: { ...existing, ...updates } },
      };
    });
  },

  addFinding: (finding: FindingObject) => {
    set(state => ({
      findings: { ...state.findings, [finding.id]: finding },
    }));
  },

  updateFinding: (id: string, updates: Partial<FindingObject>) => {
    set(state => {
      const existing = state.findings[id];
      if (!existing) return state;
      return {
        findings: { ...state.findings, [id]: { ...existing, ...updates } },
      };
    });
  },

  addDisease: (disease: DiseaseObject) => {
    set(state => ({
      diseases: { ...state.diseases, [disease.id]: disease },
    }));
  },

  updateDisease: (id: string, updates: Partial<DiseaseObject>) => {
    set(state => {
      const existing = state.diseases[id];
      if (!existing) return state;
      return {
        diseases: { ...state.diseases, [id]: { ...existing, ...updates } },
      };
    });
  },

  addMedication: (medication: MedicationObject) => {
    set(state => ({
      medications: { ...state.medications, [medication.id]: medication },
    }));
  },

  addAllergy: (allergy: AllergyObject) => {
    set(state => ({
      allergies: { ...state.allergies, [allergy.id]: allergy },
    }));
  },

  addFact: (fact: Fact) => {
    set(state => {
      const updatedFacts = [...state.facts, fact];
      if (state.patientContext) {
        const updatedCtx = { ...state.patientContext, existingFacts: updatedFacts };
        return { facts: updatedFacts, patientContext: updatedCtx };
      }
      return { facts: updatedFacts };
    });
  },

  setGateStatus: (sectionId: string, status: GateStatus) => {
    set(state => ({
      gateStatuses: { ...state.gateStatuses, [sectionId]: status },
    }));
  },

  getVisibleSections: () => {
    const { sections, sectionVisible } = get();
    return sections.filter(s => sectionVisible[s.id]);
  },

  isSectionAccessible: (sectionId: string) => {
    const { gateStatuses } = get();
    const status = gateStatuses[sectionId];
    return status === 'active' || status === 'completed';
  },

  getGateForSection: (sectionId: string) => {
    const { gateStates } = get();
    return gateStates.find(g => g.gate.id === sectionId);
  },

  regenerateDocumentation: () => {
    const { sections, completedSectionIds, patientContext } = get();
    if (!patientContext) return;

    const input: DocumentationInput = {
      symptoms: Object.values(get().symptoms),
      findings: Object.values(get().findings),
      diseases: Object.values(get().diseases),
      medications: Object.values(get().medications),
      allergies: Object.values(get().allergies),
      facts: get().facts,
      ctx: patientContext,
    };

    const docs: Record<string, DocumentationBlock> = {};
    for (const sectionId of completedSectionIds) {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        docs[sectionId] = generateDocumentation(section.type, input);
      }
    }

    set({ documentation: docs });
  },

  reEvaluate: () => {
    const { sections, patientContext, activeSectionId } = get();
    if (!patientContext) return;

    const { visibleMap, requiredMap } = computeVisibleRequired(sections, patientContext);

    // Auto-complete hidden (pending) sections
    const gateDefs = buildGateDefs(sections);
    const gateResult1 = evaluateAllGates(gateDefs, get().completedSectionIds, patientContext.existingFacts, patientContext, sections);
    const pendingCompleted = gateResult1.gates
      .filter(g => g.status === 'pending')
      .map(g => g.gate.id);
    const completedIds = [...new Set([...get().completedSectionIds, ...pendingCompleted])];

    const gateResult = pendingCompleted.length > 0
      ? evaluateAllGates(gateDefs, completedIds, patientContext.existingFacts, patientContext, sections)
      : gateResult1;

    const gateStatuses: Record<string, GateStatus> = {};
    for (const g of gateResult.gates) {
      gateStatuses[g.gate.id] = g.status;
    }

    // If current active section is locked or pending, jump to next available
    const currentGate = gateResult.gates.find(g => g.gate.id === activeSectionId);
    const activeIsValid = currentGate && (currentGate.status === 'active' || currentGate.status === 'completed');
    const newActiveId = activeIsValid ? activeSectionId : (gateResult.nextGate?.gate.id || null);

    set({
      sectionVisible: visibleMap,
      sectionRequired: requiredMap,
      gateStatuses,
      gateStates: gateResult.gates,
      nextGate: gateResult.nextGate,
      progress: gateResult.progress,
      completedSectionIds: completedIds,
      activeSectionId: newActiveId,
    });
  },

  regenerateFormat: () => {
    const { patientContext } = get();
    if (!patientContext) return;

    const formatResult = generateFormat(patientContext);
    const { visibleMap, requiredMap } = computeVisibleRequired(formatResult.sections, patientContext);

    const gateDefs = buildGateDefs(formatResult.sections);
    const gateResult1 = evaluateAllGates(gateDefs, [], patientContext.existingFacts, patientContext, formatResult.sections);

    // Auto-complete hidden (pending) sections
    const pendingCompleted = gateResult1.gates
      .filter(g => g.status === 'pending')
      .map(g => g.gate.id);

    const gateResult = pendingCompleted.length > 0
      ? evaluateAllGates(gateDefs, pendingCompleted, patientContext.existingFacts, patientContext, formatResult.sections)
      : gateResult1;

    const gateStatuses: Record<string, GateStatus> = {};
    for (const g of gateResult.gates) {
      gateStatuses[g.gate.id] = g.status;
    }

    set({
      format: formatResult.format,
      sections: formatResult.sections,
      formatResult,
      gateStatuses,
      gateStates: gateResult.gates,
      nextGate: gateResult.nextGate,
      progress: gateResult.progress,
      totalRequired: gateResult.totalRequired,
      completedRequired: gateResult.completedRequired,
      sectionVisible: visibleMap,
      sectionRequired: requiredMap,
      completedSectionIds: pendingCompleted,
      activeSectionId: gateResult.nextGate?.gate.id || null,
    });
  },
}));
