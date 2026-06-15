import { create } from 'zustand';
import type {
  HistoryState, Biodata, ChiefComplaint, FeatureEntry, FeatureRegistry,
  PastHistory, FamilySocial, RosFindings, ImpactOnLife, HpiEntry,
  Vitals, DifferentialWithReasoning, InvestigationPlan, TreatmentPlan,
  GeneralSign, LocalExaminations, LocalExaminationEntry, InvestigationInterpretation,
  MonitoringPlan, ClinicalReasoningArray, BirthHistory, ImmunizationHistory,
  GrowthDevelopment, NutritionHistory, ObstetricHistory, GynecologicHistory,
  ObstetricExamination, NewbornExamination, FollowUpEntry,
} from './types';
import { HistoryOrchestrator } from './historyOrchestrator';

interface HistoryStore extends HistoryState {
  orchestrator: HistoryOrchestrator;

  setBiodata: (b: Biodata) => void;
  addChiefComplaint: (symptomId: string, label: string, duration: string, durationDays: number) => void;
  removeChiefComplaint: (id: string) => void;
  setPrimaryComplaint: (id: string) => void;

  setFeature: (featureId: string, present: boolean | null) => void;

  setSocratesAnswer: (symptomId: string, questionId: string, question: string, answer: string | boolean | string[], weight: number, field?: string) => void;
  setGlobalAnswer: (key: string, value: string) => void;
  ensureHpiEntry: (symptomId: string, label: string, parentSymptomId?: string) => void;

  setPastHistory: (p: Partial<PastHistory>) => void;
  setFamilySocial: (f: Partial<FamilySocial>) => void;
  setRos: (r: RosFindings) => void;
  setRosSymptom: (systemId: string, symptomId: string, present: boolean | null, details: string) => void;
  setImpactOnLife: (i: Partial<ImpactOnLife>) => void;

  setVital: (key: keyof Vitals, value: number) => void;
  setAppearance: (appearance: string) => void;
  setHydrationStatus: (status: 'normal' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration', dryMucosa: boolean, sunkenEyes: boolean, reducedSkinTurgor: boolean) => void;
  setNutritionalStatus: (status: 'normal' | 'underweight' | 'wasted' | 'obese') => void;
  setConsciousness: (level: 'alert' | 'drowsy' | 'confused' | 'unresponsive', gcs: number | null) => void;
  setDistress: (pain: boolean, respiratory: boolean, cardiovascular: boolean, neurological: boolean) => void;
  setGeneralSign: (signId: string, label: string, present: boolean, details: string) => void;
  setGeneralExamNotes: (notes: string) => void;
  setSystemExamFinding: (systemId: string, findingId: string, label: string, finding: 'normal' | 'abnormal' | 'not_examined', description: string) => void;
  setSystemExamSummary: (systemId: string, summary: string) => void;

  addLocalExamination: (entry: LocalExaminationEntry) => void;
  updateLocalExamination: (id: string, findings: Record<string, string>, description: string, interpretation: string) => void;
  removeLocalExamination: (id: string) => void;

  setProvisionalDiagnosis: (diagnosis: string, diagnosisId: string, probability: number, fromHistory: string[], fromExamination: string[]) => void;
  setDifferentialReasoning: (differentials: DifferentialWithReasoning[]) => void;
  setInvestigationPlan: (plan: InvestigationPlan) => void;
  setInvestigationInterpretation: (interpretation: InvestigationInterpretation) => void;
  setTreatmentPlan: (plan: TreatmentPlan) => void;
  setMonitoringPlan: (plan: MonitoringPlan) => void;

  // ── Specialty history ──
  setAntenatalHistory: (data: Partial<BirthHistory['antenatal']>) => void;
  setNatalHistory: (data: Partial<BirthHistory['natal']>) => void;
  setPostnatalHistory: (data: Partial<BirthHistory['postnatal']>) => void;
  setVaccineStatus: (vaccineKey: string, dose: Partial<{ given: boolean; ageGiven: string; dateGiven: string; notes: string }>) => void;
  setDevelopmentalMilestone: (key: string, value: string) => void;
  setGrowthConcerns: (concerns: string) => void;
  setNutritionHistory: (data: Partial<NutritionHistory>) => void;
  setObstetricHistory: (data: Partial<ObstetricHistory>) => void;
  addObstetricPregnancy: (entry: ObstetricHistory['pregnancies'][0]) => void;
  setCurrentPregnancy: (data: Partial<ObstetricHistory['currentPregnancy']>) => void;
  setMenstrualHistory: (data: Partial<GynecologicHistory['menstrual']>) => void;
  setContraceptionHistory: (data: Partial<GynecologicHistory['contraception']>) => void;
  setGynecologicHistory: (data: Partial<GynecologicHistory>) => void;

  // ── Obstetric/Newborn exam ──
  setObstetricExamination: (exam: ObstetricExamination) => void;
  setLeopoldManeuver: (key: keyof ObstetricExamination['leopold'], value: string | number) => void;
  setNewbornExamination: (exam: NewbornExamination) => void;
  setNewbornVital: (key: string, value: number) => void;
  setNewbornHeadToToe: (key: string, value: string | boolean) => void;

  // ── Section management ──
  setActiveSection: (section: string) => void;
  completeSection: (section: string) => void;
  uncompleteSection: (section: string) => void;
  suggestNextSection: () => string;

  getSuggestedCards: () => { diseaseId: string; diseaseName: string; probability: number; questions: { featureId: string; label: string }[] }[];

  reset: () => void;
}

export const useHistoryStore = create<HistoryStore>((set) => {
  const orchestrator = new HistoryOrchestrator();
  const initialState = orchestrator.getState();

  function sync() {
    set(orchestrator.getState());
  }

  return {
    ...initialState,
    orchestrator,

    setBiodata: (b: Biodata) => {
      orchestrator.setBiodata(b);
      sync();
    },

    addChiefComplaint: (symptomId, label, duration, durationDays) => {
      orchestrator.addChiefComplaint(symptomId, label, duration, durationDays);
      sync();
    },

    removeChiefComplaint: (id) => {
      orchestrator.removeChiefComplaint(id);
      sync();
    },

    setPrimaryComplaint: (id) => {
      orchestrator.setPrimaryComplaint(id);
      sync();
    },

    setFeature: (featureId, present) => {
      orchestrator.setFeature(featureId, present);
      sync();
    },

    setSocratesAnswer: (symptomId, questionId, question, answer, weight, field) => {
      orchestrator.setSocratesAnswer(symptomId, questionId, question, answer, weight, field);
      sync();
    },

    ensureHpiEntry: (symptomId, label, parentSymptomId) => {
      orchestrator.ensureHpiEntry(symptomId, label, parentSymptomId);
      sync();
    },

    setGlobalAnswer: (key, value) => {
      orchestrator.setGlobalAnswer(key, value);
      sync();
    },

    setPastHistory: (p) => {
      orchestrator.setPastHistory(p);
      sync();
    },

    setFamilySocial: (f) => {
      orchestrator.setFamilySocial(f);
      sync();
    },

    setRos: (r) => {
      orchestrator.setRos(r);
      sync();
    },

    setRosSymptom: (systemId, symptomId, present, details) => {
      orchestrator.setRosSymptom(systemId, symptomId, present, details);
      sync();
    },

    setImpactOnLife: (i) => {
      orchestrator.setImpactOnLife(i);
      sync();
    },

    setVital: (key, value) => {
      orchestrator.setVital(key, value);
      sync();
    },

    setGeneralExamNotes: (notes) => {
      orchestrator.setGeneralExamNotes(notes);
      sync();
    },

    setAppearance: (appearance) => {
      orchestrator.setAppearance(appearance);
      sync();
    },

    setHydrationStatus: (status, dryMucosa, sunkenEyes, reducedSkinTurgor) => {
      orchestrator.setHydrationStatus(status, dryMucosa, sunkenEyes, reducedSkinTurgor);
      sync();
    },

    setNutritionalStatus: (status) => {
      orchestrator.setNutritionalStatus(status);
      sync();
    },

    setConsciousness: (level, gcs) => {
      orchestrator.setConsciousness(level, gcs);
      sync();
    },

    setDistress: (pain, respiratory, cardiovascular, neurological) => {
      orchestrator.setDistress(pain, respiratory, cardiovascular, neurological);
      sync();
    },

    setGeneralSign: (signId, label, present, details) => {
      orchestrator.setGeneralSign(signId, label, present, details);
      sync();
    },

    setSystemExamFinding: (systemId, findingId, label, finding, description) => {
      orchestrator.setSystemExamFinding(systemId, findingId, label, finding, description);
      sync();
    },

    setSystemExamSummary: (systemId, summary) => {
      orchestrator.setSystemExamSummary(systemId, summary);
      sync();
    },

    setProvisionalDiagnosis: (diagnosis, diagnosisId, probability, fromHistory, fromExamination) => {
      orchestrator.setProvisionalDiagnosis(diagnosis, diagnosisId, probability, fromHistory, fromExamination);
      sync();
    },

    setDifferentialReasoning: (differentials) => {
      orchestrator.setDifferentialReasoning(differentials);
      sync();
    },

    setInvestigationPlan: (plan) => {
      orchestrator.setInvestigationPlan(plan);
      sync();
    },

    setTreatmentPlan: (plan) => {
      orchestrator.setTreatmentPlan(plan);
      sync();
    },

    addLocalExamination: (entry) => {
      orchestrator.addLocalExamination(entry);
      sync();
    },

    updateLocalExamination: (id, findings, description, interpretation) => {
      orchestrator.updateLocalExamination(id, findings, description, interpretation);
      sync();
    },

    removeLocalExamination: (id) => {
      orchestrator.removeLocalExamination(id);
      sync();
    },

    setInvestigationInterpretation: (interpretation) => {
      orchestrator.setInvestigationInterpretation(interpretation);
      sync();
    },

    setMonitoringPlan: (plan) => {
      orchestrator.setMonitoringPlan(plan);
      sync();
    },

    // ── Specialty history ──
    setAntenatalHistory: (data) => {
      orchestrator.setAntenatalHistory(data);
      sync();
    },
    setNatalHistory: (data) => {
      orchestrator.setNatalHistory(data);
      sync();
    },
    setPostnatalHistory: (data) => {
      orchestrator.setPostnatalHistory(data);
      sync();
    },
    setVaccineStatus: (vaccineKey, dose) => {
      orchestrator.setVaccineStatus(vaccineKey, dose);
      sync();
    },
    setDevelopmentalMilestone: (key, value) => {
      orchestrator.setDevelopmentalMilestone(key, value);
      sync();
    },
    setGrowthConcerns: (concerns) => {
      orchestrator.setGrowthConcerns(concerns);
      sync();
    },
    setNutritionHistory: (data) => {
      orchestrator.setNutritionHistory(data);
      sync();
    },
    setObstetricHistory: (data) => {
      orchestrator.setObstetricHistory(data);
      sync();
    },
    addObstetricPregnancy: (entry) => {
      orchestrator.addObstetricPregnancy(entry);
      sync();
    },
    setCurrentPregnancy: (data) => {
      orchestrator.setCurrentPregnancy(data);
      sync();
    },
    setMenstrualHistory: (data) => {
      orchestrator.setMenstrualHistory(data);
      sync();
    },
    setContraceptionHistory: (data) => {
      orchestrator.setContraceptionHistory(data);
      sync();
    },
    setGynecologicHistory: (data) => {
      orchestrator.setGynecologicHistory(data);
      sync();
    },

    // ── Obstetric/Newborn exam ──
    setObstetricExamination: (exam) => {
      orchestrator.setObstetricExamination(exam);
      sync();
    },
    setLeopoldManeuver: (key, value) => {
      orchestrator.setLeopoldManeuver(key, value);
      sync();
    },
    setNewbornExamination: (exam) => {
      orchestrator.setNewbornExamination(exam);
      sync();
    },
    setNewbornVital: (key, value) => {
      orchestrator.setNewbornVital(key, value);
      sync();
    },
    setNewbornHeadToToe: (key, value) => {
      orchestrator.setNewbornHeadToToe(key, value);
      sync();
    },

    // ── Section management (adaptive) ──
    setActiveSection: (section) => {
      orchestrator.setActiveSection(section);
      sync();
    },

    completeSection: (section) => {
      orchestrator.completeSection(section);
      sync();
    },

    uncompleteSection: (section) => {
      orchestrator.uncompleteSection(section);
      sync();
    },

    suggestNextSection: () => {
      const state = orchestrator.getState();
      const profileSections = orchestrator.getProfileSections();
      for (const sec of profileSections) {
        if (!state.completedSections.includes(sec)) return sec;
      }
      return 'summary';
    },

    getSuggestedCards: () => orchestrator.getSuggestedCards(),

    reset: () => {
      orchestrator.reset();
      sync();
    },
  };
});
