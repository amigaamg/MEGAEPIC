import { describe, it, expect } from 'vitest';
import type { EncounterBrainState, InformationGap, DiseaseState } from '../../encounter-brain/types';

const makeMockState = (overrides?: Partial<EncounterBrainState>): EncounterBrainState => ({
  encounterId: 'enc-1',
  organizationId: 'org-1',
  version: 1,
  patient: {
    patientId: 'test-1', encounterId: 'enc-1', name: 'Test Patient',
    ageYears: 45, ageMonths: 540, ageCategory: 'adult',
    sex: 'male', pregnancyStatus: 'not_pregnant', hasUterus: false,
    isBreastfeeding: false, isPostpartum: false,
    informant: 'self', informantRelation: 'self', reliability: 'reliable',
    geographicRegion: 'urban', facilityId: 'fac-1',
    departmentSlug: 'medicine', unitSlug: 'general',
    requiresGuardian: false,
  },
  encounter: {
    encounterType: 'outpatient', department: 'medicine', specialty: 'general',
    acuity: 'routine', referralStatus: 'self',
    isPostoperative: false, isTrauma: false,
    emergencyLevel: 'green',
  },
  symptoms: {},
  primarySymptomId: '',
  timeline: [],
  symptomRelationships: [],
  diseaseStates: {},
  leadingDiseaseId: null,
  diseaseConvergenceState: 'exploring',
  healthSeekingJourney: null,
  chronicDiseases: {},
  previousSurgeries: [],
  postOperativeState: null,
  functionalStatus: null,
  frailtyAssessment: null,
  gaps: [],
  nextGap: null,
  questionsAsked: [],
  clinicalStory: null,
  workflow: { currentStep: 'registration', completedSteps: [], skippedSteps: [], startedAt: 0, updatedAt: 0, owner: 'encounter_brain' },
  activeQuestionGroups: [],
  documentationGraph: null,
  contradictions: [],
  redFlags: [],
  completeness: {},
  completenessScore: 0,
  createdAt: 0,
  updatedAt: 0,
  isComplete: false,
  ...overrides,
});

const mockActiveDiseaseStates: Record<string, DiseaseState> = {};

// ── Chest Pain ────────────────────────────────────────────

describe('chestPainReasoning', () => {
  it('should export getChestPainDdx', async () => {
    const mod = await import('../../clinical-reasoning/chestPainReasoning');
    expect(mod.getChestPainDdx).toBeDefined();
    const ddx = mod.getChestPainDdx();
    expect(ddx.length).toBe(15);
    expect(ddx[0].diseaseId).toBeDefined();
    expect(ddx[0].diseaseName).toBeDefined();
  });

  it('should export getChestPainPatterns', async () => {
    const mod = await import('../../clinical-reasoning/chestPainReasoning');
    const patterns = mod.getChestPainPatterns();
    expect(patterns.length).toBe(12);
  });

  it('should generate gaps for chest pain', async () => {
    const mod = await import('../../clinical-reasoning/chestPainReasoning');
    const state = makeMockState();
    const gaps = mod.getChestPainGaps(state, []);
    expect(Array.isArray(gaps)).toBe(true);
    expect(gaps.length).toBeGreaterThan(0);
    const sorted = [...gaps].sort((a, b) => b.priorityScore - a.priorityScore);
    expect(sorted[0].priorityScore).toBeGreaterThanOrEqual(sorted[sorted.length - 1].priorityScore);
  });

  it('should generate pattern gaps', async () => {
    const mod = await import('../../clinical-reasoning/chestPainReasoning');
    const state = makeMockState();
    const gaps = mod.getChestPainPatternGaps(state, [], mockActiveDiseaseStates);
    expect(Array.isArray(gaps)).toBe(true);
  });

  it('classifyChestPainCategory should return correct category', async () => {
    const mod = await import('../../clinical-reasoning/chestPainReasoning');
    const result = mod.classifyChestPainCategory('tearing', 'instantaneous', 'chest', false, false, false);
    expect(result.primary).toBe('vascular');
  });

  it('should return biodata prior shifts', async () => {
    const mod = await import('../../clinical-reasoning/chestPainReasoning');
    const priors = mod.getBiodataAdjustedChestPainPriors(makeMockState());
    expect(Object.keys(priors).length).toBe(15);
  });
});

// ── Headache ──────────────────────────────────────────────

describe('headacheReasoning', () => {
  it('should export getHeadacheDdx with 15 diseases', async () => {
    const mod = await import('../../clinical-reasoning/headacheReasoning');
    const ddx = mod.getHeadacheDdx();
    expect(ddx.length).toBe(15);
  });

  it('should export classifyHeadacheType', async () => {
    const mod = await import('../../clinical-reasoning/headacheReasoning');
    const result = mod.classifyHeadacheType('thunderclap', 'unilateral', 'unilateral', true, true, false, 35);
    expect(result.primaryType).toBeDefined();
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/headacheReasoning');
    const gaps = mod.getHeadacheGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });
});

// ── Fever ─────────────────────────────────────────────────

describe('feverReasoning', () => {
  it('should export getFeverDdx with 18 diseases', async () => {
    const mod = await import('../../clinical-reasoning/feverReasoning');
    const ddx = mod.getFeverDdx();
    expect(ddx.length).toBe(18);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/feverReasoning');
    const gaps = mod.getFeverGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });
});

// ── Dyspnea ───────────────────────────────────────────────

describe('dyspneaReasoning', () => {
  it('should export getDyspneaDdx with 13 diseases', async () => {
    const mod = await import('../../clinical-reasoning/dyspneaReasoning');
    const ddx = mod.getDyspneaDdx();
    expect(ddx.length).toBe(13);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/dyspneaReasoning');
    const gaps = mod.getDyspneaGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });
});

// ── Diarrhea ──────────────────────────────────────────────

describe('diarrheaReasoning', () => {
  it('should export getDiarrheaDdx with 14 diseases', async () => {
    const mod = await import('../../clinical-reasoning/diarrheaReasoning');
    const ddx = mod.getDiarrheaDdx();
    expect(ddx.length).toBe(14);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/diarrheaReasoning');
    const gaps = mod.getDiarrheaGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });
});

// ── Vomiting ──────────────────────────────────────────────

describe('vomitingReasoning', () => {
  it('should export getVomitingDdx with 14 diseases', async () => {
    const mod = await import('../../clinical-reasoning/vomitingReasoning');
    const ddx = mod.getVomitingDdx();
    expect(ddx.length).toBe(14);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/vomitingReasoning');
    const gaps = mod.getVomitingGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });
});

// ── Back Pain ─────────────────────────────────────────────

describe('backPainReasoning', () => {
  it('should export getBackPainDdx with 12 diseases', async () => {
    const mod = await import('../../clinical-reasoning/backPainReasoning');
    const ddx = mod.getBackPainDdx();
    expect(ddx.length).toBe(12);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/backPainReasoning');
    const gaps = mod.getBackPainGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });
});

// ── Rash ─────────────────────────────────────────────────

describe('rashReasoning', () => {
  it('should export getRashDdx with 12 diseases', async () => {
    const mod = await import('../../clinical-reasoning/rashReasoning');
    const ddx = mod.getRashDdx();
    expect(ddx.length).toBe(12);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/rashReasoning');
    const gaps = mod.getRashGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });
});

// ── Joint Pain ───────────────────────────────────────────

describe('jointPainReasoning', () => {
  it('should export getJointPainDdx with 15 diseases', async () => {
    const mod = await import('../../clinical-reasoning/jointPainReasoning');
    const ddx = mod.getJointPainDdx();
    expect(ddx.length).toBe(15);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/jointPainReasoning');
    const gaps = mod.getJointPainGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });

  it('classifyJointPain should return correct category', async () => {
    const mod = await import('../../clinical-reasoning/jointPainReasoning');
    const result = mod.classifyJointPain('mono', false, true, 0, true);
    expect(result.primaryCategory).toBe('infectious');
  });
});

// ── Dizziness ───────────────────────────────────────────

describe('dizzinessReasoning', () => {
  it('should export getDizzinessDdx with 14 diseases', async () => {
    const mod = await import('../../clinical-reasoning/dizzinessReasoning');
    const ddx = mod.getDizzinessDdx();
    expect(ddx.length).toBe(14);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/dizzinessReasoning');
    const gaps = mod.getDizzinessGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });

  it('classifyDizzinessType should return correct category', async () => {
    const mod = await import('../../clinical-reasoning/dizzinessReasoning');
    const result = mod.classifyDizzinessType('vertigo_spinning', 'seconds', ['head_movement'], false);
    expect(result.primaryCategory).toBe('vestibular_peripheral');
  });
});

// ── Trauma ──────────────────────────────────────────────

describe('traumaReasoning', () => {
  it('should export getTraumaDdx with 12 diseases', async () => {
    const mod = await import('../../clinical-reasoning/traumaReasoning');
    const ddx = mod.getTraumaDdx();
    expect(ddx.length).toBe(12);
  });

  it('should generate gaps', async () => {
    const mod = await import('../../clinical-reasoning/traumaReasoning');
    const gaps = mod.getTraumaGaps(makeMockState(), []);
    expect(gaps.length).toBeGreaterThan(0);
  });

  it('assessTraumaSeverity should return correct severity', async () => {
    const mod = await import('../../clinical-reasoning/traumaReasoning');
    const result = mod.assessTraumaSeverity('mva_high_speed', 14, 120, 20);
    expect(result.severity).toBe('severe');
    const critical = mod.assessTraumaSeverity('mva', 6, 70, 8);
    expect(critical.severity).toBe('critical');
    expect(critical.traumaTeamActivation).toBe(true);
  });

  it('classifyTraumaMechanism should return correct categories', async () => {
    const mod = await import('../../clinical-reasoning/traumaReasoning');
    const result = mod.classifyTraumaMechanism('blunt', 'high');
    expect(result).toContain('head_tbi');
    expect(result).toContain('polytrauma');
  });
});

// ── Orchestrator ──────────────────────────────────────────

describe('clinicalReasoningOrchestrator', () => {
  it('should export getClinicalReasoningGaps', async () => {
    const mod = await import('../../clinical-reasoning/clinicalReasoningOrchestrator');
    expect(mod.getClinicalReasoningGaps).toBeDefined();
    expect(mod.getActiveClinicalDomains).toBeDefined();
    expect(mod.getPrimaryClinicalDomain).toBeDefined();
    expect(mod.getBiodataPriorsForAll).toBeDefined();
    expect(mod.getClinicalReasoningSummary).toBeDefined();
  });

  it('should detect no domains for empty state', async () => {
    const mod = await import('../../clinical-reasoning/clinicalReasoningOrchestrator');
    const state = makeMockState();
    const domains = mod.getActiveClinicalDomains(state);
    expect(domains).toContain('other');
  });

  it('should return summary for empty state', async () => {
    const mod = await import('../../clinical-reasoning/clinicalReasoningOrchestrator');
    const state = makeMockState();
    const summary = mod.getClinicalReasoningSummary(state, [], mockActiveDiseaseStates);
    expect(summary.domains).toContain('other');
    expect(summary.totalGaps).toBe(0);
  });
});

// ── Legacy engines (should still work) ─────────────────────

describe('abdominalPainReasoning', () => {
  it('should export getSocratesGaps', async () => {
    const mod = await import('../../clinical-reasoning/abdominalPainReasoning');
    const gaps = mod.getSocratesGaps(makeMockState(), []);
    expect(Array.isArray(gaps)).toBe(true);
  });
});

describe('giBleedingReasoning', () => {
  it('should export getGiBleedingGaps', async () => {
    const mod = await import('../../clinical-reasoning/giBleedingReasoning');
    const gaps = mod.getGiBleedingGaps(makeMockState(), []);
    expect(Array.isArray(gaps)).toBe(true);
  });
});

describe('constipationReasoning', () => {
  it('should export getConstipationGaps', async () => {
    const mod = await import('../../clinical-reasoning/constipationReasoning');
    const gaps = mod.getConstipationGaps(makeMockState(), []);
    expect(Array.isArray(gaps)).toBe(true);
  });
});

describe('coughReasoning', () => {
  it('should export getCoughMechanismGaps', async () => {
    const mod = await import('../../clinical-reasoning/coughReasoning');
    const gaps = mod.getCoughMechanismGaps(makeMockState());
    expect(Array.isArray(gaps)).toBe(true);
  });
});
