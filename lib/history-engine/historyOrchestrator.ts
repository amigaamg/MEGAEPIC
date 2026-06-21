import type {
  HistoryState, Biodata, ChiefComplaint, FeatureEntry, FeatureRegistry,
  HpiEntry, PastHistory, FamilySocial, RosFindings, ImpactOnLife,
  RedFlag, DdxResult, GeneratedDocuments, TimelineEvent, DdxSnapshot,
  SocratesAnswer, GeneralExamination, SystemExamination, SystemExaminations,
  SystemExaminationFinding, ProvisionalDiagnosis, DifferentialWithReasoning,
  InvestigationPlan, InvestigationItem, TreatmentPlan, TreatmentItem, Vitals,
  LocalExaminations, ClinicalReasoningArray, InvestigationInterpretation,
  MonitoringPlan, GeneralSign, BirthHistory, ImmunizationHistory,
  GrowthDevelopment, NutritionHistory, ObstetricHistory, GynecologicHistory,
  ObstetricExamination, NewbornExamination, PatientProfile,
} from './types';
import { evaluateRedFlags } from './redFlagEngine';
import { assessRiskFactors } from './riskFactorEngine';
import { computeDdx } from './ddxBridge';
import { buildTimeline } from './timelineEngine';
import { generateDocuments } from './documentGenerator';
import { calculateRosPriority } from './rosPriorityEngine';
import HISTORY_FEATURE_REGISTRY from './historyFeatureRegistry';
import { getSymptom, aggregateDifferentials } from './symptomLibrary';
import { computeClinicalReasoning } from './clinicalReasoningEngine';
import { detectProfile, detectProfileWithComplaints, calculateEDD, calculateGestationalAge, getSectionsForProfile } from './patientProfileEngine';
import { getInvestigationsForDiseases } from './investigations/investigationRegistry';
import { getTreatmentsForDiseases } from './treatment/treatmentRegistry';

export class HistoryOrchestrator {
  private state: HistoryState;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): HistoryState {
    return {
      encounterId: '',
      biodata: {
        name: '', age: 0, sex: 'unknown', occupation: '', residence: '',
        informant: '', reliability: '',
        profile: 'adult',
      },
      chiefComplaints: [],
      timeline: [],
      hpi: {},
      featureRegistry: {},
      pastHistory: {
        admissions: [], surgeries: [], transfusions: [],
        chronicDiseases: [], allergies: [], longTermMeds: [],
        tbHistory: '', foodAllergies: [], drugAllergies: [],
      },
      familySocial: {
        maritalStatus: '', education: '', incomeLevel: '',
        housing: '', water: '', sanitation: '',
        smoking: '', alcohol: '', substanceUse: [],
        familyHistory: [], familyDiseases: [], occupationExposure: [],
        travelHistory: [], transportAccess: '', healthInsurance: null,
      },
      birthHistory: {
        antenatal: {
          antenatalCare: '', ancVisits: 0, placeOfDelivery: '',
          maternalIllness: [], medications: [], ultrasounds: '',
          complications: [], tetanusToxoid: false, hivStatus: '',
          syphilisScreen: false, malariaProphylaxis: false,
        },
        natal: {
          placeOfDelivery: '', deliveryType: '', presentation: '',
          cordProlapse: false, birthWeight: 0, gestationalAgeWeeks: 0,
          resuscitation: '', cry: '', color: '',
        },
        postnatal: {
          immediateFeeding: '', vitaminK: false, bcgGiven: false,
          opvGiven: false, neonatalJaundice: false, phototherapy: false,
          neonatalSepsis: false, nicuAdmission: false, nicuDays: 0,
          meconiumPassed: '', urinePassed: '',
        },
      },
      immunizationHistory: {
        bcg: { vaccine: 'BCG', dose: 'BCG', ageGiven: '', dateGiven: '', given: false, notes: '' },
        opv0: { vaccine: 'OPV', dose: 'OPV-0', ageGiven: '', dateGiven: '', given: false, notes: '' },
        opv1: { vaccine: 'OPV', dose: 'OPV-1', ageGiven: '', dateGiven: '', given: false, notes: '' },
        opv2: { vaccine: 'OPV', dose: 'OPV-2', ageGiven: '', dateGiven: '', given: false, notes: '' },
        opv3: { vaccine: 'OPV', dose: 'OPV-3', ageGiven: '', dateGiven: '', given: false, notes: '' },
        ipv: { vaccine: 'IPV', dose: 'IPV', ageGiven: '', dateGiven: '', given: false, notes: '' },
        penta1: { vaccine: 'Pentavalent', dose: 'Penta-1', ageGiven: '', dateGiven: '', given: false, notes: '' },
        penta2: { vaccine: 'Pentavalent', dose: 'Penta-2', ageGiven: '', dateGiven: '', given: false, notes: '' },
        penta3: { vaccine: 'Pentavalent', dose: 'Penta-3', ageGiven: '', dateGiven: '', given: false, notes: '' },
        pcv1: { vaccine: 'PCV', dose: 'PCV-1', ageGiven: '', dateGiven: '', given: false, notes: '' },
        pcv2: { vaccine: 'PCV', dose: 'PCV-2', ageGiven: '', dateGiven: '', given: false, notes: '' },
        pcv3: { vaccine: 'PCV', dose: 'PCV-3', ageGiven: '', dateGiven: '', given: false, notes: '' },
        rota1: { vaccine: 'Rotavirus', dose: 'Rota-1', ageGiven: '', dateGiven: '', given: false, notes: '' },
        rota2: { vaccine: 'Rotavirus', dose: 'Rota-2', ageGiven: '', dateGiven: '', given: false, notes: '' },
        measles1: { vaccine: 'Measles-Rubella', dose: 'MR-1', ageGiven: '', dateGiven: '', given: false, notes: '' },
        measles2: { vaccine: 'Measles-Rubella', dose: 'MR-2', ageGiven: '', dateGiven: '', given: false, notes: '' },
        yellowFever: { vaccine: 'Yellow Fever', dose: 'YF', ageGiven: '', dateGiven: '', given: false, notes: '' },
        hpv: { vaccine: 'HPV', dose: 'HPV-1', ageGiven: '', dateGiven: '', given: false, notes: '' },
        tetanus: { vaccine: 'Tetanus Toxoid', dose: 'TT-1', ageGiven: '', dateGiven: '', given: false, notes: '' },
        covid: { vaccine: 'COVID-19', dose: 'COVID-1', ageGiven: '', dateGiven: '', given: false, notes: '' },
        other: [],
        upToDate: false,
      },
      growthDevelopment: {
        growthParams: [],
        milestones: {
          socialSmile: 'unknown', headControl: 'unknown', sitting: 'unknown',
          crawling: 'unknown', standing: 'unknown', walking: 'unknown',
          firstWords: 'unknown', sentences: 'unknown', toiletTraining: 'unknown',
          concerns: '',
        },
        concerns: '',
      },
      nutritionHistory: {
        currentFeeding: '', breastfeedingDuration: '', formulaType: '',
        complementaryFoodsStarted: '', mealsPerDay: 0, foodGroups: [],
        supplements: [], appetite: '', feedingDifficulty: '', pica: false,
      },
      obstetricHistory: {
        totalPregnancies: 0, totalDeliveries: 0, liveChildren: 0,
        stillbirths: 0, miscarriages: 0, ectopics: 0, cesareanSections: 0,
        pregnancies: [],
        currentPregnancy: { trimester: '', weeksGestation: 0, antenatalCare: '', fetalMovements: '', complications: [] },
      },
      gynecologicHistory: {
        menstrual: { menarche: 0, cycleLength: 0, duration: 0, regularity: '', flow: '', dysmenorrhea: '', intermenstrualBleeding: false, postcoitalBleeding: false, postmenopausalBleeding: false, menopauseAge: null, lmp: '' },
        contraception: { currentMethod: '', previousMethods: [], duration: '', compliance: '', sideEffects: '' },
        papSmears: '', stdHistory: [], gynecologicSurgery: [], fertilityConcerns: '', breastSymptoms: '',
      },
      ros: [],
      impactOnLife: { work: '', walking: '', eating: '', sleeping: '', adl: '', description: '' },
      redFlags: [],
      ddx: { probabilities: [], snapshots: [], traces: [] },
      generalExamination: {
        vitals: {
          temperature: null, heartRate: null, bloodPressureSystolic: null, bloodPressureDiastolic: null,
          respiratoryRate: null, oxygenSaturation: null, bloodSugar: null, weight: null, height: null, bmi: null, painScore: null,
        },
        appearance: { appearance: '' },
        hydration: { status: '', dryMucosa: false, sunkenEyes: false, reducedSkinTurgor: false },
        nutrition: { status: '' },
        consciousness: { level: '', gcs: null },
        distress: { pain: false, respiratory: false, cardiovascular: false, neurological: false, painScore: null },
        generalSigns: [],
        notes: '',
      },
      obstetricExamination: null,
      newbornExamination: null,
      systemExaminations: [],
      localExaminations: [],
      clinicalReasoning: [],
      provisionalDiagnosis: null,
      differentialWithReasoning: [],
      investigationPlan: { investigations: [], notes: '' },
      investigationInterpretation: { items: [], overallInterpretation: '' },
      treatmentPlan: { items: [], followUp: '', disposition: '', dispositionRationale: '' },
      monitoringPlan: { vitalMonitoring: [], labMonitoring: [], complicationPrevention: [], escalationCriteria: '', reviewPlan: '' },
      documents: {
        chiefComplaintText: '', hpiNarrative: '', pastHistoryNarrative: '',
        birthHistoryNarrative: '', immunizationNarrative: '', growthDevNarrative: '',
        nutritionNarrative: '', obstetricHistoryNarrative: '', gynecologyHistoryNarrative: '',
        familySocialNarrative: '', rosNarrative: '', impactOnLifeNarrative: '',
        generalExaminationNarrative: '', systemExaminationNarrative: '',
        localExaminationNarrative: '', obstetricExamNarrative: '', newbornExamNarrative: '',
        clinicalReasoningNarrative: '',
        clinicalImpressionNarrative: '', differentialNarrative: '',
        investigationPlanNarrative: '', investigationInterpretationNarrative: '',
        treatmentPlanNarrative: '', monitoringPlanNarrative: '',
        summaryNarrative: '', fullDocumentation: '',
      },
      activeSection: 'biodata',
      completedSections: [],
      confirmedSymptoms: [],
      globalAnswers: {},
    };
  }

  getState(): HistoryState {
    return {
      ...this.state,
      hpi: { ...this.state.hpi },
      featureRegistry: { ...this.state.featureRegistry },
      chiefComplaints: [...this.state.chiefComplaints],
      timeline: [...this.state.timeline],
      redFlags: [...this.state.redFlags],
      ddx: { ...this.state.ddx, probabilities: [...this.state.ddx.probabilities] },
      documents: { ...this.state.documents },
      confirmedSymptoms: [...this.state.confirmedSymptoms],
      globalAnswers: { ...this.state.globalAnswers },
      birthHistory: { ...this.state.birthHistory, antenatal: { ...this.state.birthHistory.antenatal }, natal: { ...this.state.birthHistory.natal }, postnatal: { ...this.state.birthHistory.postnatal } },
      immunizationHistory: { ...this.state.immunizationHistory },
      growthDevelopment: { ...this.state.growthDevelopment },
      nutritionHistory: { ...this.state.nutritionHistory },
      obstetricHistory: { ...this.state.obstetricHistory, pregnancies: [...this.state.obstetricHistory.pregnancies] },
      gynecologicHistory: { ...this.state.gynecologicHistory },
      obstetricExamination: this.state.obstetricExamination ? { ...this.state.obstetricExamination } : null,
      newbornExamination: this.state.newbornExamination ? { ...this.state.newbornExamination, headToToe: { ...this.state.newbornExamination.headToToe } } : null,
      systemExaminations: [...this.state.systemExaminations],
      localExaminations: [...this.state.localExaminations],
      clinicalReasoning: [...this.state.clinicalReasoning],
      investigationInterpretation: { ...this.state.investigationInterpretation, items: [...this.state.investigationInterpretation.items] },
      monitoringPlan: { ...this.state.monitoringPlan },
      differentialWithReasoning: [...this.state.differentialWithReasoning],
      investigationPlan: {
        ...this.state.investigationPlan,
        investigations: [...this.state.investigationPlan.investigations],
      },
      treatmentPlan: {
        ...this.state.treatmentPlan,
        items: [...this.state.treatmentPlan.items],
      },
    };
  }

  // ── BIODATA ──
  setBiodata(biodata: Biodata): void {
    const profile = detectProfile(biodata);

    const updatedObstetric = biodata.obstetric ? { ...biodata.obstetric } : undefined;
    if (updatedObstetric?.lnmp) {
      updatedObstetric.edd = calculateEDD(updatedObstetric.lnmp);
      const ga = calculateGestationalAge(updatedObstetric.lnmp);
      updatedObstetric.gestationalAgeWeeks = ga.weeks;
      updatedObstetric.gestationalAgeDays = ga.days;
    }

    const prevProfile = this.state.biodata.profile;
    this.state.biodata = { ...biodata, profile, obstetric: updatedObstetric };

    if (prevProfile && prevProfile !== profile) {
      this.state.activeSection = 'biodata';
      this.state.completedSections = [];
    }

    this.recomputeAll();
  }

  // ── CHIEF COMPLAINTS ──
  addChiefComplaint(symptomId: string, label: string, duration: string, durationDays: number): void {
    const id = `cc_${symptomId}_${Date.now()}`;
    const isPrimary = this.state.chiefComplaints.length === 0;
    const complaint: ChiefComplaint = { id, symptomId, label, duration, durationDays, isPrimary };

    this.state.chiefComplaints = [...this.state.chiefComplaints, complaint];

    // Add to feature registry
    this.state.featureRegistry = { ...this.state.featureRegistry, [symptomId]: { id: symptomId, present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} } };

    // Rebuild timeline
    this.state.timeline = buildTimeline(this.state.chiefComplaints).events;

    // Create HPI entry
    if (!this.state.hpi[symptomId]) {
      this.state.hpi = { ...this.state.hpi, [symptomId]: { symptomId, label, socrates: [], positives: [], negatives: [] } };
    }

    // Register in confirmed symptoms
    if (!this.state.confirmedSymptoms.includes(symptomId)) {
      this.state.confirmedSymptoms = [...this.state.confirmedSymptoms, symptomId];
    }

    this.recomputeAll();
  }

  removeChiefComplaint(id: string): void {
    const removed = this.state.chiefComplaints.find(c => c.id === id);
    if (!removed) return;

    const remaining = this.state.chiefComplaints.filter(c => c.id !== id).map((c, i) => ({
      ...c,
      isPrimary: (removed.isPrimary && i === 0) ? true : false
    }));
    this.state.chiefComplaints = remaining;

    const { [removed.symptomId]: _, ...restHpi } = this.state.hpi;
    this.state.hpi = restHpi;

    this.state.timeline = buildTimeline(this.state.chiefComplaints).events;
    this.recomputeAll();
  }

  setPrimaryComplaint(id: string): void {
    this.state.chiefComplaints = this.state.chiefComplaints.map(c => ({
      ...c, isPrimary: c.id === id
    }));
    this.recomputeAll();
  }

  // ── FEATURE REGISTRY ──
  setFeature(featureId: string, present: boolean | null, source?: 'history' | 'exam' | 'vital' | 'lab' | 'imaging' | 'score'): void {
    const featureDef = HISTORY_FEATURE_REGISTRY[featureId];
    const existing = this.state.featureRegistry[featureId];
    const diseaseWeights = featureDef?.diseaseWeights || existing?.diseaseWeights || {};

    // Convert negativePredictorFor array to Record<string, number>
    const negativeDiseaseWeights: Record<string, number> = {};
    if (featureDef?.negativePredictorFor) {
      for (const np of featureDef.negativePredictorFor) {
        negativeDiseaseWeights[np.diseaseId] = np.reduction;
      }
    }

    this.state.featureRegistry = {
      ...this.state.featureRegistry,
      [featureId]: {
        id: featureId,
        present,
        weight: present ? (featureDef ? Math.max(...Object.values(featureDef.diseaseWeights), 0) : 1) : 0,
        diseaseWeights,
        negativeDiseaseWeights,
        source: source || (featureDef?.category === 'exam_finding' ? 'exam' : 'history'),
      },
    };

    this.recomputeAll();
  }

  setFeatureWithModifier(featureId: string, present: boolean | null, modifier: { key: string; value: string | number | boolean; weightBoost?: number }): void {
    this.setFeature(featureId, present);
    const entry = this.state.featureRegistry[featureId];
    if (entry) {
      this.state.featureRegistry = {
        ...this.state.featureRegistry,
        [featureId]: { ...entry, modifier },
      };
      this.recomputeAll();
    }
  }

  setFeatureValue(featureId: string, value: string | boolean): void {
    this.setFeature(featureId, value === true || value === 'true' || value === 'yes');
  }

  // ── HPI ENTRY (for associated symptoms) ──
  ensureHpiEntry(symptomId: string, label: string, parentSymptomId?: string): void {
    if (!this.state.hpi[symptomId]) {
      this.state.hpi = {
        ...this.state.hpi,
        [symptomId]: { symptomId, label, socrates: [], positives: [], negatives: [], parentSymptomId }
      };
      this.state.featureRegistry = { ...this.state.featureRegistry, [symptomId]: { id: symptomId, present: true, weight: 1, diseaseWeights: {}, negativeDiseaseWeights: {} } };
      if (!this.state.confirmedSymptoms.includes(symptomId)) {
        this.state.confirmedSymptoms = [...this.state.confirmedSymptoms, symptomId];
      }
      this.recomputeAll();
    }
  }

  // ── GLOBAL ANSWERS (shared questions) ──
  setGlobalAnswer(key: string, value: string): void {
    this.state.globalAnswers = { ...this.state.globalAnswers, [key]: value };
    this.recomputeAll();
  }

  // ── SOCRATES ──
  setSocratesAnswer(symptomId: string, questionId: string, question: string, answer: string | boolean | string[], weight: number, field?: string): void {
    if (!this.state.hpi[symptomId]) return;
    const hpiEntry = this.state.hpi[symptomId];
    const existingIdx = hpiEntry.socrates.findIndex(s => s.questionId === questionId);
    const entry: SocratesAnswer = {
      questionId, question,
      answer: typeof answer === 'boolean' ? String(answer) : answer,
      field: field || questionId.replace(`${symptomId}_`, ''),
      weight,
    };

    let newSocrates: SocratesAnswer[];
    if (existingIdx >= 0) {
      newSocrates = hpiEntry.socrates.map((s, i) => i === existingIdx ? entry : s);
    } else {
      newSocrates = [...hpiEntry.socrates, entry];
    }

    let newPositives = [...hpiEntry.positives];
    let newNegatives = [...hpiEntry.negatives];
    if (answer === true || answer === 'true' || answer === 'yes') {
      if (!newPositives.includes(question)) { newPositives.push(question); }
    } else if (answer === false || answer === 'false' || answer === 'no') {
      if (!newNegatives.includes(question)) { newNegatives.push(question); }
    }

    const updatedEntry = {
      ...hpiEntry,
      socrates: newSocrates,
      positives: newPositives,
      negatives: newNegatives,
      ...(entry.field === 'flow' ? { flow: answer as 'worsening' | 'improving' | 'static' | 'fluctuating' } : {}),
    };

    this.state.hpi = { ...this.state.hpi, [symptomId]: updatedEntry };
    this.recomputeAll();
  }

  // ── PAST HISTORY ──
  setPastHistory(pastHistory: Partial<PastHistory>): void {
    this.state.pastHistory = { ...this.state.pastHistory, ...pastHistory };
    this.recomputeAll();
  }

  // ── FAMILY SOCIAL ──
  setFamilySocial(familySocial: Partial<FamilySocial>): void {
    this.state.familySocial = { ...this.state.familySocial, ...familySocial };
    this.recomputeAll();
  }

  // ── ROS ──
  setRos(ros: RosFindings): void {
    this.state.ros = ros;
  }

  setRosSymptom(systemId: string, symptomId: string, present: boolean | null, details: string): void {
    const system = this.state.ros.find(s => s.id === systemId);
    if (!system) return;
    const symptom = system.symptoms.find(s => s.id === symptomId);
    if (!symptom) return;
    symptom.present = present;
    symptom.details = details;
  }

  setRosPrioritized(topDiseaseIds: string[]): void {
    const result = calculateRosPriority(topDiseaseIds);
    this.state.ros = result.systems;
  }

  // ── IMPACT ON LIFE ──
  setImpactOnLife(impact: Partial<ImpactOnLife>): void {
    this.state.impactOnLife = { ...this.state.impactOnLife, ...impact };
    this.recomputeAll();
  }

  // ── Count total user-answered Socrates questions across all HPI entries ──
  private totalSocratesAnswered(): number {
    let count = 0;
    for (const entry of Object.values(this.state.hpi)) {
      count += entry.socrates.length;
    }
    return count;
  }

  // ── CORE: Recompute everything ──
  recomputeAll(): void {
    const { biodata, chiefComplaints, featureRegistry } = this.state;

    // Re-detect profile with chief complaints (only gyn/obstetric when complaints warrant it)
    const updatedProfile = detectProfileWithComplaints(biodata, chiefComplaints);
    if (updatedProfile !== biodata.profile) {
      this.state.biodata = { ...biodata, profile: updatedProfile };
    }

    // Risk factor contribution (used internally)
    assessRiskFactors(biodata, featureRegistry);

    // DDX
    this.state.ddx = computeDdx({
      complaints: chiefComplaints,
      featureRegistry,
      age: biodata.age,
      sex: biodata.sex,
    });

    // Red flags
    this.state.redFlags = evaluateRedFlags(featureRegistry, chiefComplaints, biodata).redFlags;

    // ROS priority
    const topDiseaseIds = this.state.ddx.probabilities.slice(0, 5).map(p => p.diseaseId);
    if (this.state.ros.length === 0) {
      this.setRosPrioritized(topDiseaseIds);
    }

    // ── Data threshold: only generate reasoning/investigations after ≥3 answers ──
    const enoughData = this.totalSocratesAnswered() >= 3;

    // Clinical reasoning (history + exam)
    this.state.clinicalReasoning = enoughData
      ? computeClinicalReasoning({
          complaints: chiefComplaints,
          featureRegistry,
          ddx: this.state.ddx,
          generalExamination: this.state.generalExamination,
          systemExaminations: this.state.systemExaminations,
        })
      : [];

    // Auto-populate investigation & treatment plans only when enough data collected
    if (enoughData && topDiseaseIds.length > 0) {
      const invRecs = getInvestigationsForDiseases(topDiseaseIds);
      this.state.investigationPlan = {
        investigations: invRecs.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          rationale: r.rationale,
          expectedFinding: r.expectedFinding,
          priority: r.priority,
          recommendedFor: r.recommendedFor,
        })),
        notes: `Investigations suggested based on differential: ${topDiseaseIds.join(', ')}`,
      };

      const txRecs = getTreatmentsForDiseases(topDiseaseIds);
      this.state.treatmentPlan = {
        items: txRecs.map(r => ({
          intervention: r.intervention,
          category: r.category,
          forCondition: r.forCondition[0] || '',
          dosage: r.dosage,
          duration: r.duration,
          rationale: r.rationale,
        })),
        followUp: 'Follow up as per clinical response and investigation results.',
        disposition: 'home',
        dispositionRationale: 'Disposition depends on severity and response to initial management.',
      };
    } else {
      // Clear plans when insufficient data
      this.state.investigationPlan = { investigations: [], notes: '' };
      this.state.treatmentPlan = { items: [], followUp: '', disposition: 'home', dispositionRationale: '' };
    }

    // Documents
    this.state.documents = generateDocuments({
      completedSections: this.state.completedSections,
      biodata,
      chiefComplaints,
      hpi: this.state.hpi,
      pastHistory: this.state.pastHistory,
      birthHistory: this.state.birthHistory,
      immunizationHistory: this.state.immunizationHistory,
      growthDevelopment: this.state.growthDevelopment,
      nutritionHistory: this.state.nutritionHistory,
      familySocial: this.state.familySocial,
      obstetricHistory: this.state.obstetricHistory,
      gynecologicHistory: this.state.gynecologicHistory,
      ros: this.state.ros,
      impactOnLife: this.state.impactOnLife,
      ddx: this.state.ddx,
      timeline: this.state.timeline,
      redFlags: this.state.redFlags,
      featureRegistry,
      globalAnswers: this.state.globalAnswers,
      generalExamination: this.state.generalExamination,
      obstetricExamination: this.state.obstetricExamination,
      newbornExamination: this.state.newbornExamination,
      systemExaminations: this.state.systemExaminations,
      localExaminations: this.state.localExaminations,
      clinicalReasoning: this.state.clinicalReasoning,
      provisionalDiagnosis: this.state.provisionalDiagnosis,
      differentialWithReasoning: this.state.differentialWithReasoning,
      investigationPlan: this.state.investigationPlan,
      investigationInterpretation: this.state.investigationInterpretation,
      treatmentPlan: this.state.treatmentPlan,
      monitoringPlan: this.state.monitoringPlan,
    });
  }

  // ── DIAGNOSIS-DRIVEN CARD SUGGESTIONS ──
  getSuggestedCards(): { diseaseId: string; diseaseName: string; probability: number; questions: { featureId: string; label: string }[] }[] {
    const topDiseases = this.state.ddx.probabilities.slice(0, 4);
    return topDiseases.map(d => {
      const questions: { featureId: string; label: string }[] = [];
      for (const [fid, fdef] of Object.entries(HISTORY_FEATURE_REGISTRY)) {
        if (fdef.diseaseWeights[d.diseaseId] && fdef.diseaseWeights[d.diseaseId] > 0) {
          const alreadyAnswered = this.state.featureRegistry[fid] !== undefined;
          if (!alreadyAnswered) {
            questions.push({ featureId: fid, label: fdef.label });
          }
        }
      }
      return {
        diseaseId: d.diseaseId,
        diseaseName: d.diseaseName,
        probability: d.probability,
        questions: questions.slice(0, 5),
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // VITALS & GENERAL EXAMINATION
  // ═══════════════════════════════════════════════════════════════
  setVital(key: keyof Vitals, value: number): void {
    this.state.generalExamination = {
      ...this.state.generalExamination,
      vitals: { ...this.state.generalExamination.vitals, [key]: value },
    };
  }

  setGeneralExamNotes(notes: string): void {
    this.state.generalExamination = { ...this.state.generalExamination, notes };
  }

  // ═══════════════════════════════════════════════════════════════
  // SYSTEMIC EXAMINATION
  // ═══════════════════════════════════════════════════════════════
  setSystemExamFinding(systemId: string, findingId: string, label: string, finding: 'normal' | 'abnormal' | 'not_examined', description: string): void {
    let system = this.state.systemExaminations.find(s => s.systemId === systemId);
    if (!system) {
      const systemNames: Record<string, string> = {
        respiratory: 'Respiratory System', cardiovascular: 'Cardiovascular System',
        gastrointestinal: 'Gastrointestinal System', neurological: 'Neurological System',
        musculoskeletal: 'Musculoskeletal System', genitourinary: 'Genitourinary System',
        endocrine: 'Endocrine System', skin_msk: 'Skin, Hair & Nails',
      };
      const newSystem: SystemExamination = {
        systemId, systemName: systemNames[systemId] || systemId, findings: [], summary: '',
      };
      this.state.systemExaminations = [...this.state.systemExaminations, newSystem];
      system = this.state.systemExaminations.find(s => s.systemId === systemId)!;
    }
    const existingIdx = system.findings.findIndex(f => f.id === findingId);
    const sf: SystemExaminationFinding = { id: findingId, label, finding, description };
    const updatedFindings = existingIdx >= 0
      ? system.findings.map((f, i) => i === existingIdx ? sf : f)
      : [...system.findings, sf];
    const updatedSystem = { ...system, findings: updatedFindings };
    this.state.systemExaminations = this.state.systemExaminations.map(s => s.systemId === systemId ? updatedSystem : s);
  }

  setSystemExamSummary(systemId: string, summary: string): void {
    this.state.systemExaminations = this.state.systemExaminations.map(s =>
      s.systemId === systemId ? { ...s, summary } : s
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // EXAM → FEATURE REGISTRY BRIDGE
  // ═══════════════════════════════════════════════════════════════
  bridgeExamToFeatureRegistry(systemId: string, findingId: string, finding: 'normal' | 'abnormal' | 'not_examined'): void {
    const featureId = `exam_${systemId}_${findingId}`;
    this.setFeature(
      featureId,
      finding === 'abnormal' ? true : finding === 'normal' ? false : null,
      'exam'
    );
  }

  bridgeAllExamFindingsToRegistry(): void {
    for (const system of this.state.systemExaminations) {
      for (const finding of system.findings) {
        this.bridgeExamToFeatureRegistry(system.systemId, finding.id, finding.finding);
      }
    }
  }

  bridgeGeneralSignToRegistry(signId: string, label: string, present: boolean): void {
    const featureId = `gen_sign_${signId}`;
    const featureDef = HISTORY_FEATURE_REGISTRY[featureId] || HISTORY_FEATURE_REGISTRY[signId];
    this.setFeature(featureId, present, 'exam');
    if (!featureDef) {
      // Register ephemeral entry with label-based disease mapping
      const entry = this.state.featureRegistry[featureId];
      if (entry) {
        this.state.featureRegistry = {
          ...this.state.featureRegistry,
          [featureId]: { ...entry, diseaseWeights: {} },
        };
      }
    }
  }

  bridgeLocalExamToRegistry(examId: string, findings: Record<string, string>): void {
    for (const [findingKey, findingValue] of Object.entries(findings)) {
      const featureId = `local_exam_${examId}_${findingKey}`;
      const present = findingValue !== 'normal' && findingValue !== 'absent' && findingValue !== '';
      this.setFeature(featureId, present || null, 'exam');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DIAGNOSIS
  // ═══════════════════════════════════════════════════════════════
  setProvisionalDiagnosis(diagnosis: string, diagnosisId: string, probability: number, fromHistory: string[], fromExamination: string[]): void {
    this.state.provisionalDiagnosis = { diagnosis, diagnosisId, probability, reasoning: { fromHistory, fromExamination } };
  }

  setDifferentialReasoning(differentials: DifferentialWithReasoning[]): void {
    this.state.differentialWithReasoning = differentials;
  }

  // ═══════════════════════════════════════════════════════════════
  // INVESTIGATIONS
  // ═══════════════════════════════════════════════════════════════
  setInvestigationPlan(plan: InvestigationPlan): void {
    this.state.investigationPlan = plan;
  }

  // ═══════════════════════════════════════════════════════════════
  // TREATMENT
  // ═══════════════════════════════════════════════════════════════
  setTreatmentPlan(plan: TreatmentPlan): void {
    this.state.treatmentPlan = plan;
  }

  // ═══════════════════════════════════════════════════════════════
  // GENERAL EXAMINATION — 8-step framework
  // ═══════════════════════════════════════════════════════════════
  setAppearance(appearance: string): void {
    this.state.generalExamination = {
      ...this.state.generalExamination,
      appearance: { ...this.state.generalExamination.appearance, appearance },
    };
  }

  setHydrationStatus(status: '' | 'normal' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration',
    dryMucosa: boolean, sunkenEyes: boolean, reducedSkinTurgor: boolean): void {
    this.state.generalExamination = {
      ...this.state.generalExamination,
      hydration: { status, dryMucosa, sunkenEyes, reducedSkinTurgor },
    };
  }

  setNutritionalStatus(status: '' | 'normal' | 'underweight' | 'wasted' | 'obese'): void {
    this.state.generalExamination = {
      ...this.state.generalExamination,
      nutrition: { status },
    };
  }

  setConsciousness(level: '' | 'alert' | 'drowsy' | 'confused' | 'unresponsive', gcs: number | null): void {
    this.state.generalExamination = {
      ...this.state.generalExamination,
      consciousness: { level, gcs },
    };
  }

  setDistress(pain: boolean, respiratory: boolean, cardiovascular: boolean, neurological: boolean): void {
    this.state.generalExamination = {
      ...this.state.generalExamination,
      distress: { ...this.state.generalExamination.distress, pain, respiratory, cardiovascular, neurological },
    };
  }

  setGeneralSign(signId: string, label: string, present: boolean, details: string): void {
    const existingIdx = this.state.generalExamination.generalSigns.findIndex(s => s.id === signId);
    const sign: GeneralSign = { id: signId, label, present, details };
    const updatedSigns = existingIdx >= 0
      ? this.state.generalExamination.generalSigns.map((s, i) => i === existingIdx ? sign : s)
      : [...this.state.generalExamination.generalSigns, sign];
    this.state.generalExamination = { ...this.state.generalExamination, generalSigns: updatedSigns };
    this.bridgeGeneralSignToRegistry(signId, label, present);
  }

  setExamNotes(notes: string): void {
    this.state.generalExamination = { ...this.state.generalExamination, notes };
  }

  // ═══════════════════════════════════════════════════════════════
  // LOCAL EXAMINATION (surgical/orthopedic)
  // ═══════════════════════════════════════════════════════════════
  addLocalExamination(entry: LocalExaminations[0]): void {
    this.state.localExaminations = [...this.state.localExaminations, entry];
  }

  updateLocalExamination(id: string, findings: Record<string, string>, description: string, interpretation: string): void {
    this.state.localExaminations = this.state.localExaminations.map(e =>
      e.id === id ? { ...e, findings, description, interpretation } : e
    );
  }

  removeLocalExamination(id: string): void {
    this.state.localExaminations = this.state.localExaminations.filter(e => e.id !== id);
  }

  // ═══════════════════════════════════════════════════════════════
  // CLINICAL REASONING (history + exam combined)
  // ═══════════════════════════════════════════════════════════════
  recomputeClinicalReasoning(): void {
    this.state.clinicalReasoning = computeClinicalReasoning({
      complaints: this.state.chiefComplaints,
      featureRegistry: this.state.featureRegistry,
      ddx: this.state.ddx,
      generalExamination: this.state.generalExamination,
      systemExaminations: this.state.systemExaminations,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // INVESTIGATION INTERPRETATION
  // ═══════════════════════════════════════════════════════════════
  setInvestigationInterpretation(interpretation: InvestigationInterpretation): void {
    this.state.investigationInterpretation = interpretation;
  }

  // ═══════════════════════════════════════════════════════════════
  // MONITORING PLAN
  // ═══════════════════════════════════════════════════════════════
  setMonitoringPlan(plan: MonitoringPlan): void {
    this.state.monitoringPlan = plan;
  }

  // ═══════════════════════════════════════════════════════════════
  // BIRTH HISTORY
  // ═══════════════════════════════════════════════════════════════
  setAntenatalHistory(data: Partial<BirthHistory['antenatal']>): void {
    this.state.birthHistory = {
      ...this.state.birthHistory,
      antenatal: { ...this.state.birthHistory.antenatal, ...data },
    };
  }

  setNatalHistory(data: Partial<BirthHistory['natal']>): void {
    this.state.birthHistory = {
      ...this.state.birthHistory,
      natal: { ...this.state.birthHistory.natal, ...data },
    };
  }

  setPostnatalHistory(data: Partial<BirthHistory['postnatal']>): void {
    this.state.birthHistory = {
      ...this.state.birthHistory,
      postnatal: { ...this.state.birthHistory.postnatal, ...data },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // IMMUNIZATION HISTORY
  // ═══════════════════════════════════════════════════════════════
  setVaccineStatus(vaccineKey: string, dose: Partial<{ given: boolean; ageGiven: string; dateGiven: string; notes: string }>): void {
    const key = vaccineKey as keyof ImmunizationHistory;
    const existing = this.state.immunizationHistory[key];
    if (existing && typeof existing === 'object' && 'vaccine' in existing) {
      this.state.immunizationHistory = {
        ...this.state.immunizationHistory,
        [key]: { ...existing, ...dose },
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GROWTH & DEVELOPMENT
  // ═══════════════════════════════════════════════════════════════
  setDevelopmentalMilestone(key: string, value: string): void {
    this.state.growthDevelopment = {
      ...this.state.growthDevelopment,
      milestones: { ...this.state.growthDevelopment.milestones, [key]: value },
    };
  }

  setGrowthConcerns(concerns: string): void {
    this.state.growthDevelopment = { ...this.state.growthDevelopment, concerns };
  }

  // ═══════════════════════════════════════════════════════════════
  // NUTRITION HISTORY
  // ═══════════════════════════════════════════════════════════════
  setNutritionHistory(data: Partial<NutritionHistory>): void {
    this.state.nutritionHistory = { ...this.state.nutritionHistory, ...data };
  }

  // ═══════════════════════════════════════════════════════════════
  // OBSTETRIC HISTORY
  // ═══════════════════════════════════════════════════════════════
  setObstetricHistory(data: Partial<ObstetricHistory>): void {
    this.state.obstetricHistory = { ...this.state.obstetricHistory, ...data };
  }

  addObstetricPregnancy(entry: ObstetricHistory['pregnancies'][0]): void {
    this.state.obstetricHistory = {
      ...this.state.obstetricHistory,
      pregnancies: [...this.state.obstetricHistory.pregnancies, entry],
    };
  }

  setCurrentPregnancy(data: Partial<ObstetricHistory['currentPregnancy']>): void {
    this.state.obstetricHistory = {
      ...this.state.obstetricHistory,
      currentPregnancy: { ...this.state.obstetricHistory.currentPregnancy, ...data },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // GYNECOLOGY HISTORY
  // ═══════════════════════════════════════════════════════════════
  setMenstrualHistory(data: Partial<GynecologicHistory['menstrual']>): void {
    this.state.gynecologicHistory = {
      ...this.state.gynecologicHistory,
      menstrual: { ...this.state.gynecologicHistory.menstrual, ...data },
    };
  }

  setContraceptionHistory(data: Partial<GynecologicHistory['contraception']>): void {
    this.state.gynecologicHistory = {
      ...this.state.gynecologicHistory,
      contraception: { ...this.state.gynecologicHistory.contraception, ...data },
    };
  }

  setGynecologicHistory(data: Partial<GynecologicHistory>): void {
    this.state.gynecologicHistory = { ...this.state.gynecologicHistory, ...data };
  }

  // ═══════════════════════════════════════════════════════════════
  // OBSTETRIC EXAMINATION (Leopold's Maneuvers)
  // ═══════════════════════════════════════════════════════════════
  setObstetricExamination(exam: ObstetricExamination): void {
    this.state.obstetricExamination = exam;
  }

  setLeopoldManeuver(key: keyof ObstetricExamination['leopold'], value: string | number): void {
    if (!this.state.obstetricExamination) {
      this.state.obstetricExamination = {
        leopold: { firstManeuver: '', secondManeuver: '', thirdManeuver: '', fourthManeuver: '',
          fetalLie: 'longitudinal', presentation: 'cephalic', position: '', engagement: 'not_engaged',
          fetalHeartRate: 0, contractions: '', amnioticFluid: '' },
        fundalHeight: 0, abdominalGirth: 0, scarInspection: '', uterineActivity: '', pelvicExamination: '',
      };
    }
    this.state.obstetricExamination = {
      ...this.state.obstetricExamination,
      leopold: { ...this.state.obstetricExamination.leopold, [key]: String(value) },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // NEWBORN EXAMINATION
  // ═══════════════════════════════════════════════════════════════
  setNewbornExamination(exam: NewbornExamination): void {
    this.state.newbornExamination = exam;
  }

  setNewbornVital(key: string, value: number): void {
    if (!this.state.newbornExamination) {
      this.state.newbornExamination = {
        vitals: { temperature: null, heartRate: null, respiratoryRate: null, oxygenSaturation: null, bloodSugar: null },
        headToToe: {
          headCircumference: null, fontanelles: 'normal', sutures: 'normal', caput: false, cephalhematoma: false,
          eyes: '', ears: '', nose: '', mouth: '', palate: 'intact', neck: '',
          chestShape: '', breastEngorgement: false, chestAuscultation: '',
          abdomen: '', umbilicalCord: 'normal', liverPalpable: false, spleenPalpable: false, anus: 'normal',
          genitalia: '', testesDescended: true, labia: '',
          spine: '', hips: 'normal', limbs: '', digits: '', palmarCreases: '',
          skinColor: 'pink', rash: '', birthMarks: '', vernix: true, lanugo: true,
          tone: 'normal', reflexes: { moro: 'present', rooting: 'present', sucking: 'present', grasping: 'present', stepping: 'present', babinski: 'present' },
          cry: 'normal', activity: 'active',
        },
        gestationalAgeAssessment: '', overallAssessment: '',
      };
    }
    this.state.newbornExamination = {
      ...this.state.newbornExamination,
      vitals: { ...this.state.newbornExamination!.vitals, [key]: value },
    };
  }

  setNewbornHeadToToe(key: string, value: string | boolean): void {
    if (!this.state.newbornExamination) {
      this.setNewbornVital('temperature', 0); // initialize
    }
    this.state.newbornExamination = {
      ...this.state.newbornExamination!,
      headToToe: { ...this.state.newbornExamination!.headToToe, [key]: value },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION MANAGEMENT — with adaptive pipeline
  // ═══════════════════════════════════════════════════════════════
  getProfileSections(): string[] {
    return getSectionsForProfile(this.state.biodata.profile, this.state.biodata.sex, this.state.biodata.age).map(s => s.id);
  }

  completeSection(section: string): void {
    if (!this.state.completedSections.includes(section)) {
      this.state.completedSections = [...this.state.completedSections, section];
    }
    const sections = this.getProfileSections();
    const currentIdx = sections.indexOf(section);
    if (currentIdx >= 0 && currentIdx < sections.length - 1) {
      this.state.activeSection = sections[currentIdx + 1];
    }
  }

  // Override original to use adaptive pipeline
  setActiveSection(section: string): void {
    this.state.activeSection = section;
  }

  uncompleteSection(section: string): void {
    this.state.completedSections = this.state.completedSections.filter(s => s !== section);
    this.state.activeSection = section;
  }

  // ═══════════════════════════════════════════════════════════════
  // LOAD / RESET
  // ═══════════════════════════════════════════════════════════════
  loadState(state: HistoryState): void {
    this.state = state;
    this.recomputeAll();
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
