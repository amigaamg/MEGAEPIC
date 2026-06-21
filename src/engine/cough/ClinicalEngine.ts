'use client';
import { runInference, type ConsultantDiagnosis } from '../inference/scorer';
import { ALL_DISEASES } from '../knowledge-graph/loadDiseases';
import { INIT_FORM, type PatientForm } from '../../types';

// ── Question Definition ─────────────────────────────────────────────────────
export interface ClinicalQuestion {
  id: string;
  text: string;
  type: 'boolean' | 'select' | 'multiselect' | 'number';
  options?: { label: string; value: string }[];
  symptomId: string;
  tier: 0 | 1 | 2 | 3;
  ageMinMonths?: number;
  ageMaxMonths?: number;
  gender?: 'M' | 'F';
  dependsOn?: { questionId: string; value: any }[];
  /** Section group for logical UI grouping */
  section?: string;
}

// ── Cough-relevant disease whitelist ───────────────────────────────────────
// Prevents non-respiratory diseases (Malaria, Typhoid, etc.) from appearing
// when the presenting complaint is cough.
const COUGH_DISEASE_IDS = new Set([
  'pneumonia', 'bronchitis', 'urti', 'asthma', 'copd', 'tuberculosis',
  'bronchiectasis', 'bronchiolitis', 'croup', 'epiglottitis',
  'foreign_body_aspiration', 'pleural_effusion', 'empyema', 'pneumothorax',
  'chf', 'congestive_heart_failure', 'heart_failure', 'lung_cancer',
  'influenza', 'covid_19', 'covid', 'interstitial_lung_disease',
  'post_nasal_drip', 'post-nasal-drip', 'uacs', 'allergic_rhinitis',
  'sinusitis', 'gerd', 'laryngitis', 'pertussis', 'anaphylaxis',
  'pulmonary_embolism', 'pe', 'aspiration_pneumonia',
  'acute_chest_syndrome', 'bronchopulmonary_dysplasia',
  'pulmonary_hypertension', 'sarcoidosis', 'cystic_fibrosis',
]);

// ── Clinical context store ──────────────────────────────────────────────────
export class ClinicalEngine {
  private answers: Map<string, any> = new Map();
  private askedQuestions: Set<string> = new Set();
  private patientAgeMonths: number;
  private patientGender: string;
  private patientName: string;
  private presentingComplaint: string;
  private complaintDuration: string;
  private ddxResults: ConsultantDiagnosis[] = [];
  private onChangeCallbacks: Array<() => void> = [];

  constructor(opts: {
    patientName?: string;
    patientAgeMonths?: number;
    patientGender?: string;
    presentingComplaint?: string;
    complaintDuration?: string;
  }) {
    this.patientName = opts.patientName || '';
    this.patientAgeMonths = opts.patientAgeMonths || 0;
    this.patientGender = opts.patientGender || '';
    this.presentingComplaint = opts.presentingComplaint || '';
    this.complaintDuration = opts.complaintDuration || '';
  }

  setBiodata(ageMonths: number, gender: string): void {
    this.patientAgeMonths = ageMonths;
    this.patientGender = gender;
  }

  getAgeMonths(): number { return this.patientAgeMonths; }
  getGender(): string { return this.patientGender; }
  getPatientName(): string { return this.patientName; }

  answer(questionId: string, value: any): void {
    this.answers.set(questionId, value);
    this.askedQuestions.add(questionId);
    this.recomputeDDX();
    this.notify();
  }

  hasAnswer(questionId: string): boolean {
    return this.answers.has(questionId);
  }

  getAnswer(questionId: string): any {
    return this.answers.get(questionId);
  }

  getAllAnswers(): Record<string, any> {
    const result: Record<string, any> = {};
    this.answers.forEach((v, k) => { result[k] = v; });
    return result;
  }

  onChange(cb: () => void): () => void {
    this.onChangeCallbacks.push(cb);
    return () => {
      this.onChangeCallbacks = this.onChangeCallbacks.filter(c => c !== cb);
    };
  }

  private notify(): void {
    for (const cb of this.onChangeCallbacks) cb();
  }

  getDDX(): ConsultantDiagnosis[] {
    return this.ddxResults;
  }

  getTopDDX(n: number = 5): ConsultantDiagnosis[] {
    return this.ddxResults.slice(0, n);
  }

  get askedCount(): number { return this.askedQuestions.size; }

  private recomputeDDX(): void {
    const form = this.buildPatientForm();
    if (form.complaints.length === 0) {
      this.ddxResults = [];
      return;
    }
    try {
      const raw = runInference(form);
      // Filter to cough-relevant diseases only
      this.ddxResults = raw.filter(d =>
        COUGH_DISEASE_IDS.has(d.diseaseId) ||
        COUGH_DISEASE_IDS.has(d.diseaseId.replace(/_/g, '-')) ||
        d.disease.system === 'respiratory'
      ).slice(0, 10);
    } catch (e) {
      console.error('DDX inference failed:', e);
      this.ddxResults = [];
    }
  }

  private buildPatientForm(): PatientForm {
    const form = JSON.parse(JSON.stringify(INIT_FORM)) as PatientForm;
    form.biodata.ageMonths = String(this.patientAgeMonths);
    form.biodata.sex = this.patientGender;
    form.biodata.patientName = this.patientName;

    const complaint = this.presentingComplaint || 'cough';
    form.complaints = [complaint.toLowerCase()];
    if (complaint) {
      form.complaintDurations = { [complaint.toLowerCase()]: this.complaintDuration };
    }

    for (const [qId, value] of this.answers) {
      this.mapAnswerToForm(form, qId, value);
    }

    return form;
  }

  private mapAnswerToForm(form: PatientForm, qId: string, value: any): void {
    if (value === null || value === undefined || value === '') return;

    switch (qId) {
      case 'difficulty_breathing':
        if (value === true) form.complaints.push('difficulty_breathing'); break;
      case 'stridor':
        if (value === true) form.complaints.push('stridor'); break;
      case 'cyanosis':
        if (value === true) form.complaints.push('cyanosis'); break;
      case 'hemoptysis':
        if (value === true) form.complaints.push('hemoptysis'); break;
      case 'chest_pain':
        if (value === true) form.complaints.push('chest_pain'); break;
      case 'lethargy':
        if (value === true) form.complaints.push('lethargy'); break;
      case 'high_fever':
        if (value === true) { form.hpi.highFever = true; form.hpi.feverPattern = 'high_grade'; }
        break;
      case 'cough_duration':
        form.hpi.coughDuration = value;
        if (value === 'over_2_weeks' || value === 'chronic') form.complaints.push('cough_duration_long');
        break;
      case 'cough_character':
        form.hpi.coughChar = value; break;
      case 'productive_cough':
        if (value === true) {
          form.complaints.push('productive_cough');
          if (!form.hpi.coughChar) form.hpi.coughChar = 'productive';
        } else if (value === false && !form.hpi.coughChar) {
          form.hpi.coughChar = 'dry';
        }
        break;
      case 'sputum_color':
        if (value === 'purulent') { form.hpi.sputumDetail = 'purulent sputum'; form.complaints.push('sputum_production'); }
        else if (value === 'rusty') { form.hpi.sputumDetail = 'rusty sputum'; }
        else if (value === 'blood_streaked') { form.hpi.sputumDetail = 'blood-streaked sputum'; form.complaints.push('hemoptysis'); }
        else if (value === 'frothy_pink') { form.hpi.sputumDetail = 'frothy pink sputum'; }
        else form.hpi.sputumDetail = value;
        break;
      case 'sputum_volume':
        if (value && value !== 'none') form.hpi.sputumDetail = (form.hpi.sputumDetail || '') + ` (${value} volume)`; break;
      case 'nocturnal_cough':
        form.hpi.nocturnalCough = value === true; break;
      case 'exercise_cough':
        form.hpi.exerciseTriggered = value === true; break;
      case 'barking_cough':
        if (value === true) form.hpi.coughChar = 'barking'; break;
      case 'paroxysmal_cough':
        if (value === true) { form.hpi.pertussisContact = true; } break;
      case 'post_tussive_vomiting':
        form.hpi.postTussiveVomiting = value === true; break;
      case 'choking_episode':
        if (value === true) { form.hpi.suddenOnset = true; form.complaints.push('choking_episode'); } break;
      case 'wheeze':
        if (value === true) { form.hpi.wheeze = true; form.complaints.push('wheeze'); } break;
      case 'fever':
        if (value === true) form.complaints.push('fever'); break;
      case 'fever_pattern':
        form.hpi.feverPattern = value; break;
      case 'rigors':
        if (value === true) form.hpi.highFever = true; break;
      case 'night_sweats':
        form.hpi.nightSweats = value === true; break;
      case 'weight_loss':
        form.hpi.weightLoss = value === true; break;
      case 'sore_throat':
        if (value === true) form.complaints.push('sore_throat'); break;
      case 'nasal_congestion':
        if (value === true) form.ros.nasalDischargeRos = true; break;
      case 'coryza':
        if (value === true) form.complaints.push('nasal_discharge'); break;
      case 'orthopnea':
        form.hpi.orthopnea = value === true; break;
      case 'pnd':
        form.hpi.pnd = value === true; break;
      case 'hoarseness':
        form.hpi.hoarseness = value === true; break;
      case 'dysphagia':
        if (value === true) { form.hpi.drooling = true; } break;
      case 'heartburn':
        form.hpi.heartburnRegurg = value === true; break;
      case 'pleuritic_pain':
        form.hpi.pleuriticPain = value === true; break;
      case 'leg_swelling':
        if (value === true) { form.ros.peripheralEdema = true; form.ros.fatigue = true; } break;
      case 'recent_urti':
        if (value === true) form.hpi.recentURTI = true; break;
      case 'sick_contact':
        form.hpi.sickContact = value === true; break;
      case 'smoking':
        form.family.smokingExposure = value === true; break;
      case 'tb_contact':
        form.hpi.tbContact = value === true; break;
      case 'tb_household':
        form.family.tbHousehold = value === true; break;
      case 'hiv_history':
        form.pmh.hiv = value === true; break;
      case 'asthma_history':
        form.pmh.asthmaDx = value === true; break;
      case 'sinusitis_history':
        if (value === true) (form as any).pmh.sinusitis = true; break;
      case 'recurrent_chest':
        form.pmh.recurrentChest = value === true; break;
      case 'cardiac_disease':
        form.pmh.cardiacDisease = value === true; break;
      case 'immunodeficiency':
        form.pmh.immunodeficiencyDx = value === true; break;
      case 'cystic_fibrosis':
        form.pmh.cysticFibrosisDx = value === true; break;
      case 'diabetes':
        form.pmh.diabetesDx = value === true; break;
      case 'allergies':
        form.pmh.allergies = value; break;
      case 'medications':
        form.pmh.medications = value; break;
      case 'overcrowding':
        form.family.housingConditions = value === true ? 'crowded' : ''; break;
      case 'malnutrition':
        if (value === true) form.nutrition.malnutritionSigns = ['reported']; break;
      case 'prematurity':
        if (value === true) form.birth.neonatalComplications = ['prematurity']; break;
      case 'vaccination_status':
        form.immunization.status = value; break;
      case 'cough_progression':
        form.hpi.progression = value; break;
      case 'severity_score':
        form.hpi.severity = String(value); break;
    }
  }

  getRelevantRiskQuestions(): ClinicalQuestion[] {
    const topDiseases = this.getTopDDX(5);
    const diseaseIds = new Set(topDiseases.map(d => d.diseaseId));
    const riskQuestions = QUESTION_REGISTRY.filter(q => q.tier === 3);

    return riskQuestions.filter(q => {
      if (this.askedQuestions.has(q.id)) return false;
      if (this.isAgeFiltered(q)) return false;
      if (this.isGenderFiltered(q)) return false;
      if (this.hasUnmetDependency(q)) return false;
      const qDiseases = QUESTION_DISEASE_MAP[q.id] || [];
      return qDiseases.length === 0 || qDiseases.some(d => diseaseIds.has(d));
    });
  }

  // ── Section-based question grouping ──────────────────────────────────────
  getQuestionsBySection(): Record<string, ClinicalQuestion[]> {
    const groups: Record<string, ClinicalQuestion[]> = {};
    const unanswered = QUESTION_REGISTRY.filter(q => !this.askedQuestions.has(q.id));

    for (const q of unanswered) {
      if (this.isAgeFiltered(q) || this.isGenderFiltered(q) || this.hasUnmetDependency(q)) continue;
      const section = q.section || 'Other';
      if (!groups[section]) groups[section] = [];
      groups[section].push(q);
    }
    return groups;
  }

  /** Get the best next question (for one-at-a-time mode) */
  getNextQuestion(): ClinicalQuestion | null {
    const sections = this.getRemainingSections();
    if (sections.length === 0) return null;
    const firstQ = sections[0].questions.find(q => !this.askedQuestions.has(q.id));
    return firstQ || null;
  }

  /** Get remaining questions grouped by section for batch display */
  getRemainingSections(): { section: string; questions: ClinicalQuestion[] }[] {
    const groups = this.getQuestionsBySection();
    return Object.entries(groups).map(([section, questions]) => ({ section, questions }));
  }

  getProgress(): { answered: number; total: number; percent: number } {
    const all = QUESTION_REGISTRY.filter(q =>
      !this.isAgeFiltered(q) && !this.isGenderFiltered(q) && !this.hasUnmetDependency(q)
    );
    return {
      answered: this.askedQuestions.size,
      total: all.length,
      percent: all.length > 0 ? Math.round((this.askedQuestions.size / all.length) * 100) : 0,
    };
  }

  getQuestionCount(): { answered: number; total: number } {
    const all = QUESTION_REGISTRY.filter(q =>
      !this.isAgeFiltered(q) && !this.isGenderFiltered(q) && !this.hasUnmetDependency(q)
    );
    return { answered: this.askedQuestions.size, total: all.length };
  }

  isComplete(): boolean {
    return this.getDDX().length > 0 && this.getRemainingSections().length === 0;
  }

  private isAgeFiltered(q: ClinicalQuestion): boolean {
    if (q.ageMinMonths !== undefined && this.patientAgeMonths < q.ageMinMonths) return true;
    if (q.ageMaxMonths !== undefined && this.patientAgeMonths > q.ageMaxMonths) return true;
    return false;
  }

  private isGenderFiltered(q: ClinicalQuestion): boolean {
    if (q.gender && this.patientGender.toUpperCase() !== q.gender) return true;
    return false;
  }

  private hasUnmetDependency(q: ClinicalQuestion): boolean {
    if (!q.dependsOn) return false;
    for (const dep of q.dependsOn) {
      if (this.answers.get(dep.questionId) !== dep.value) return true;
    }
    return false;
  }

  /** Generate clinical narrative — proper medical English, no repetition */
  generateNarrative(): string {
    const parts: string[] = [];
    const top = this.getTopDDX(3);
    const a = this.getAllAnswers();

    // Age/gender descriptor
    const ageYears = Math.round(this.patientAgeMonths / 12);
    const ageDesc = this.patientAgeMonths < 12
      ? `${Math.round(this.patientAgeMonths)}-month-old`
      : `${ageYears}-year-old`;
    const genderDesc = this.patientGender === 'M' ? 'man' : this.patientGender === 'F' ? 'woman' : 'patient';

    // ── 1. Presenting complaint ────────────────────────────────────────────
    const durationLabel = this.complaintDuration || 'acute';
    parts.push(`${ageDesc} ${genderDesc} presents with ${this.presentingComplaint || 'cough'} of ${durationLabel} onset.`);

    // ── 2. Cough character (ONCE) ──────────────────────────────────────────
    const char = a['cough_character'] || '';
    const isProductive = a['productive_cough'] === true || char === 'productive';
    if (isProductive) {
      const sputum = a['sputum_color'] || '';
      const volume = a['sputum_volume'] || '';
      const sputumDesc = [sputum.replace(/_/g, ' '), volume].filter(Boolean).join(', ');
      parts.push(`The cough is productive${sputumDesc ? ` with ${sputumDesc} sputum` : ''}.`);
    } else if (char && char !== 'productive') {
      parts.push(`The cough is ${char} and non-productive.`);
    } else {
      parts.push('The cough is productive.');
    }

    if (a['hemoptysis'] === true) {
      parts.push('There is frank haemoptysis — urgent investigation required.');
    }

    // ── 3. Associated symptoms ──────────────────────────────────────────────
    const assoc: string[] = [];
    if (a['fever'] === true) {
      const fp = a['fever_pattern'] || '';
      assoc.push(fp ? `${fp} fever` : 'fever');
      if (a['high_fever'] === true || a['rigors'] === true) assoc.push('rigors');
    }
    if (a['wheeze'] === true) assoc.push('wheeze');
    if (a['difficulty_breathing'] === true || a['dyspnea'] === true) assoc.push('dyspnoea');
    if (a['chest_pain'] === true) assoc.push(a['pleuritic_pain'] === true ? 'pleuritic chest pain' : 'chest discomfort');
    if (a['nocturnal_cough'] === true) assoc.push('nocturnal cough');
    if (a['exercise_cough'] === true) assoc.push('exercise-induced cough');
    if (a['night_sweats'] === true) assoc.push('drenching night sweats');
    if (a['weight_loss'] === true) assoc.push('unintentional weight loss');
    if (a['orthopnea'] === true) assoc.push('orthopnoea');
    if (a['pnd'] === true) assoc.push('paroxysmal nocturnal dyspnoea');
    if (a['hoarseness'] === true) assoc.push('hoarseness');
    if (a['dysphagia'] === true) assoc.push('dysphagia');
    if (a['sore_throat'] === true) assoc.push('sore throat');
    if (a['coryza'] === true) assoc.push('coryzal symptoms');
    if (a['post_tussive_vomiting'] === true) assoc.push('post-tussive vomiting');
    if (a['leg_swelling'] === true) assoc.push('bilateral lower limb oedema');

    if (assoc.length > 0) {
      parts.push(`Associated features include ${assoc.join(', ')}.`);
    }

    // ── 4. Duration + temporal pattern ──────────────────────────────────────
    const dur = a['cough_duration'] || '';
    if (dur) {
      const durLabels: Record<string, string> = {
        acute: 'acute (<3 weeks)',
        subacute: 'subacute (1-3 weeks)',
        over_2_weeks: 'persistent (>2 weeks)',
        chronic: 'chronic (>8 weeks)',
      };
      parts.push(`The cough is ${durLabels[dur] || dur} in duration, consistent with an ${dur === 'acute' ? 'acute' : dur === 'subacute' ? 'subacute' : 'insidious'} process.`);
    }

    // ── 5. Past medical history ────────────────────────────────────────────
    const pmh: string[] = [];
    if (a['asthma_history'] === true) pmh.push('asthma');
    if (a['copd_history'] === true) pmh.push('COPD');
    if (a['diabetes'] === true) pmh.push('diabetes mellitus');
    if (a['hiv_history'] === true) pmh.push('HIV');
    if (a['cardiac_disease'] === true) pmh.push('cardiac disease');
    if (a['recurrent_chest'] === true) pmh.push('recurrent chest infections');
    if (a['immunodeficiency'] === true) pmh.push('immunodeficiency');
    if (a['cystic_fibrosis'] === true) pmh.push('cystic fibrosis');
    if (a['tuberculosis_history'] === true) pmh.push('previous tuberculosis');

    if (pmh.length > 0) {
      parts.push(`Past medical history: ${pmh.join(', ')}.`);
    }

    // ── 6. Relevant risk factors ───────────────────────────────────────────
    const rf: string[] = [];
    if (a['smoking'] === true) rf.push('active smoking');
    if (a['tb_contact'] === true) rf.push('TB contact');
    if (a['tb_household'] === true) rf.push('household TB exposure');
    if (a['sick_contact'] === true) rf.push('sick contact');
    if (a['overcrowding'] === true) rf.push('overcrowded housing');
    if (a['malnutrition'] === true) rf.push('malnutrition');
    if (a['prematurity'] === true) rf.push('prematurity');

    if (rf.length > 0) {
      parts.push(`Risk factors: ${rf.join(', ')}.`);
    }

    // ── 7. Clinical synthesis ─────────────────────────────────────────────
    if (top.length > 0) {
      const dxLine = top.map((d, i) => {
        const pct = (d.probability * 100).toFixed(0);
        if (i === 0) return `${d.diseaseName} (${pct}% — leading diagnosis)`;
        return `${d.diseaseName} (${pct}%)`;
      }).join(', ');

      parts.push(`\nDifferential diagnosis: ${dxLine}.`);

      // Clinical reasoning
      const primary = top[0];
      const reasonParts: string[] = [];
      if (isProductive && primary.diseaseId === 'pneumonia') {
        reasonParts.push('productive cough with fever and chest signs');
      }
      if (a['night_sweats'] === true && primary.diseaseId === 'tuberculosis') {
        reasonParts.push('night sweats and weight loss with cough >2 weeks');
      }
      if (a['wheeze'] === true && (primary.diseaseId === 'asthma' || primary.diseaseId === 'copd')) {
        reasonParts.push('wheeze and nocturnal symptoms');
      }
      if (a['orthopnea'] === true && a['leg_swelling'] === true) {
        reasonParts.push('orthopnoea with peripheral oedema — consider cardiac');
      }
      if (a['choking_episode'] === true) {
        reasonParts.push('acute onset following choking episode');
      }

      if (reasonParts.length > 0) {
        parts.push(`Key discriminators: ${reasonParts.join('; ')}.`);
      }
    }

    return parts.join(' ');
  }
}

// ── Question Registry ───────────────────────────────────────────────────────
export const QUESTION_REGISTRY: ClinicalQuestion[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 1: Red Flags & Triage
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'difficulty_breathing', section: 'Red Flags & Triage', text: 'Short of breath at rest or on minimal exertion?', type: 'boolean', symptomId: 'difficulty_breathing', tier: 0 },
  { id: 'stridor', section: 'Red Flags & Triage', text: 'High-pitched noisy breathing (stridor)?', type: 'boolean', symptomId: 'stridor', tier: 0, ageMaxMonths: 216 },
  { id: 'hemoptysis', section: 'Red Flags & Triage', text: 'Blood in sputum (haemoptysis)?', type: 'boolean', symptomId: 'hemoptysis', tier: 0 },
  { id: 'cyanosis', section: 'Red Flags & Triage', text: 'Turned blue (cyanosis)?', type: 'boolean', symptomId: 'cyanosis', tier: 0 },
  { id: 'chest_pain', section: 'Red Flags & Triage', text: 'Chest pain?', type: 'boolean', symptomId: 'chest_pain', tier: 0 },
  { id: 'lethargy', section: 'Red Flags & Triage', text: 'Unusually lethargic or difficult to wake?', type: 'boolean', symptomId: 'lethargy', tier: 0 },
  { id: 'choking_episode', section: 'Red Flags & Triage', text: 'Cough started suddenly after choking?', type: 'boolean', symptomId: 'choking_episode', tier: 0, ageMaxMonths: 216 },
  { id: 'seizure', section: 'Red Flags & Triage', text: 'Any seizure or loss of consciousness?', type: 'boolean', symptomId: 'seizure', tier: 0 },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2: Cough Characterization (SOCRATES)
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'cough_duration', section: 'Cough Characterization', text: 'How long has the cough lasted?', type: 'select', symptomId: 'cough_duration', tier: 1,
    options: [
      { label: 'Acute (<1 week)', value: 'acute' },
      { label: 'Subacute (1-3 weeks)', value: 'subacute' },
      { label: 'Persistent (>2 weeks)', value: 'over_2_weeks' },
      { label: 'Chronic (>8 weeks)', value: 'chronic' },
    ] },
  { id: 'cough_character', section: 'Cough Characterization', text: 'What type of cough is it?', type: 'select', symptomId: 'cough_character', tier: 1,
    options: [
      { label: 'Productive (with phlegm)', value: 'productive' },
      { label: 'Dry / non-productive', value: 'dry' },
      { label: 'Barking (seal-like)', value: 'barking' },
      { label: 'Paroxysmal (coughing fits)', value: 'paroxysmal' },
    ] },
  { id: 'fever', section: 'Cough Characterization', text: 'Associated fever?', type: 'boolean', symptomId: 'fever', tier: 1 },
  { id: 'fever_pattern', section: 'Cough Characterization', text: 'Fever pattern?', type: 'select', symptomId: 'fever_pattern', tier: 1,
    options: [
      { label: 'Low-grade (≤38°C)', value: 'low_grade' },
      { label: 'High-grade (>38°C)', value: 'high_grade' },
      { label: 'Continuous', value: 'continuous' },
      { label: 'Intermittent', value: 'intermittent' },
    ], dependsOn: [{ questionId: 'fever', value: true }] },
  { id: 'wheeze', section: 'Cough Characterization', text: 'Associated wheezing?', type: 'boolean', symptomId: 'wheeze', tier: 1 },
  { id: 'nocturnal_cough', section: 'Cough Characterization', text: 'Cough worse at night?', type: 'boolean', symptomId: 'nocturnal_cough', tier: 1 },
  { id: 'exercise_cough', section: 'Cough Characterization', text: 'Cough triggered by exercise?', type: 'boolean', symptomId: 'exercise_cough', tier: 1 },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3: Sputum & Associated Symptoms
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'productive_cough', section: 'Sputum & Associated Symptoms', text: 'Productive?', type: 'boolean', symptomId: 'productive_cough', tier: 1,
    dependsOn: [{ questionId: 'cough_character', value: 'productive' }] },
  { id: 'sputum_color', section: 'Sputum & Associated Symptoms', text: 'Sputum colour?', type: 'select', symptomId: 'sputum_color', tier: 1,
    options: [
      { label: 'Clear / white', value: 'clear' },
      { label: 'Yellow / green (purulent)', value: 'purulent' },
      { label: 'Rusty / brown', value: 'rusty' },
      { label: 'Blood-streaked', value: 'blood_streaked' },
      { label: 'Frothy / pink', value: 'frothy_pink' },
    ], dependsOn: [{ questionId: 'productive_cough', value: true }] },
  { id: 'sputum_volume', section: 'Sputum & Associated Symptoms', text: 'Sputum volume?', type: 'select', symptomId: 'sputum_volume', tier: 1,
    options: [
      { label: 'Small (<20ml/day)', value: 'scant' },
      { label: 'Moderate (20-100ml/day)', value: 'moderate' },
      { label: 'Large (>100ml/day)', value: 'copious' },
    ], dependsOn: [{ questionId: 'productive_cough', value: true }] },
  { id: 'orthopnea', section: 'Sputum & Associated Symptoms', text: 'Difficulty breathing when lying flat (orthopnoea)?', type: 'boolean', symptomId: 'orthopnea', tier: 2 },
  { id: 'pnd', section: 'Sputum & Associated Symptoms', text: 'Paroxysmal nocturnal dyspnoea (waking up gasping)?', type: 'boolean', symptomId: 'pnd', tier: 2 },
  { id: 'leg_swelling', section: 'Sputum & Associated Symptoms', text: 'Bilateral leg/ankle swelling (oedema)?', type: 'boolean', symptomId: 'leg_swelling', tier: 2 },
  { id: 'pleuritic_pain', section: 'Sputum & Associated Symptoms', text: 'Sharp chest pain worse on breathing (pleuritic)?', type: 'boolean', symptomId: 'pleuritic_pain', tier: 2 },
  { id: 'post_tussive_vomiting', section: 'Sputum & Associated Symptoms', text: 'Cough triggers vomiting?', type: 'boolean', symptomId: 'post_tussive_vomiting', tier: 2 },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 4: Associated Symptoms (Upper Airway, GI, ENT)
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'sore_throat', section: 'Associated Symptoms', text: 'Sore throat?', type: 'boolean', symptomId: 'sore_throat', tier: 2 },
  { id: 'coryza', section: 'Associated Symptoms', text: 'Nasal congestion or runny nose?', type: 'boolean', symptomId: 'coryza', tier: 2 },
  { id: 'hoarseness', section: 'Associated Symptoms', text: 'Hoarseness or voice change?', type: 'boolean', symptomId: 'hoarseness', tier: 2 },
  { id: 'dysphagia', section: 'Associated Symptoms', text: 'Difficulty swallowing?', type: 'boolean', symptomId: 'dysphagia', tier: 2 },
  { id: 'heartburn', section: 'Associated Symptoms', text: 'Heartburn or acid reflux?', type: 'boolean', symptomId: 'heartburn', tier: 2 },
  { id: 'nasal_congestion', section: 'Associated Symptoms', text: 'Post-nasal drip sensation?', type: 'boolean', symptomId: 'nasal_congestion', tier: 2 },
  { id: 'sick_contact', section: 'Associated Symptoms', text: 'Contact with someone with similar symptoms?', type: 'boolean', symptomId: 'sick_contact', tier: 2 },
  { id: 'recent_urti', section: 'Associated Symptoms', text: 'Preceded by recent cold or flu-like illness?', type: 'boolean', symptomId: 'recent_urti', tier: 2 },
  { id: 'night_sweats', section: 'Associated Symptoms', text: 'Drenching night sweats?', type: 'boolean', symptomId: 'night_sweats', tier: 2 },
  { id: 'weight_loss', section: 'Associated Symptoms', text: 'Unintentional weight loss?', type: 'boolean', symptomId: 'weight_loss', tier: 2 },
  { id: 'barking_cough', section: 'Associated Symptoms', text: 'Barking cough (seal-like)?', type: 'boolean', symptomId: 'barking_cough', tier: 2, ageMaxMonths: 120 },
  { id: 'paroxysmal_cough', section: 'Associated Symptoms', text: 'Coughing fits ending in whoop?', type: 'boolean', symptomId: 'paroxysmal_cough', tier: 2, ageMaxMonths: 216 },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 5: Past History & Risk Factors
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'smoking', section: 'Past History & Risk Factors', text: 'Active smoker or second-hand smoke exposure?', type: 'boolean', symptomId: 'smoking', tier: 3, ageMinMonths: 144 },
  { id: 'asthma_history', section: 'Past History & Risk Factors', text: 'Known asthma?', type: 'boolean', symptomId: 'asthma_history', tier: 3 },
  { id: 'tb_contact', section: 'Past History & Risk Factors', text: 'Known TB contact?', type: 'boolean', symptomId: 'tb_contact', tier: 3 },
  { id: 'hiv_history', section: 'Past History & Risk Factors', text: 'Known HIV?', type: 'boolean', symptomId: 'hiv_history', tier: 3 },
  { id: 'diabetes', section: 'Past History & Risk Factors', text: 'Diabetes?', type: 'boolean', symptomId: 'diabetes', tier: 3 },
  { id: 'cardiac_disease', section: 'Past History & Risk Factors', text: 'Heart disease?', type: 'boolean', symptomId: 'cardiac_disease', tier: 3 },
  { id: 'recurrent_chest', section: 'Past History & Risk Factors', text: 'Recurrent chest infections?', type: 'boolean', symptomId: 'recurrent_chest', tier: 3 },
  { id: 'immunodeficiency', section: 'Past History & Risk Factors', text: 'Immunosuppressed (steroids, chemo, etc.)?', type: 'boolean', symptomId: 'immunodeficiency', tier: 3 },
  { id: 'cystic_fibrosis', section: 'Past History & Risk Factors', text: 'Cystic fibrosis?', type: 'boolean', symptomId: 'cystic_fibrosis', tier: 3, ageMaxMonths: 480 },
  { id: 'tuberculosis_history', section: 'Past History & Risk Factors', text: 'Previous TB?', type: 'boolean', symptomId: 'tb_contact', tier: 3 },
  { id: 'prematurity', section: 'Past History & Risk Factors', text: 'Born preterm (<37 weeks)?', type: 'boolean', symptomId: 'prematurity', tier: 3, ageMaxMonths: 60 },
  { id: 'malnutrition', section: 'Past History & Risk Factors', text: 'Malnourished or poor weight gain?', type: 'boolean', symptomId: 'malnutrition', tier: 3, ageMaxMonths: 180 },
  { id: 'vaccination_status', section: 'Past History & Risk Factors', text: 'Immunisations up to date?', type: 'select', symptomId: 'vaccination_status', tier: 3, ageMaxMonths: 216,
    options: [
      { label: 'Up to date', value: 'complete' },
      { label: 'Partial', value: 'incomplete' },
      { label: 'None', value: 'none' },
    ] },
  { id: 'overcrowding', section: 'Past History & Risk Factors', text: 'Lives in crowded conditions?', type: 'boolean', symptomId: 'overcrowding', tier: 3 },
  { id: 'allergies', section: 'Past History & Risk Factors', text: 'Known drug allergies?', type: 'boolean', symptomId: 'allergies', tier: 3 },
  { id: 'medications', section: 'Past History & Risk Factors', text: 'On ACE inhibitors?', type: 'boolean', symptomId: 'ace_inhibitor_use', tier: 3 },
  { id: 'atopy_family', section: 'Past History & Risk Factors', text: 'Family history of atopy/asthma?', type: 'boolean', symptomId: 'family_atopy', tier: 3 },
  { id: 'sinusitis_history', section: 'Past History & Risk Factors', text: 'History of sinusitis?', type: 'boolean', symptomId: 'sinusitis_history', tier: 3 },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 6: Severity & Impact
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'cough_progression', section: 'Severity & Impact', text: 'Overall progression?', type: 'select', symptomId: 'cough_progression', tier: 2,
    options: [
      { label: 'Worsening', value: 'worsening' },
      { label: 'Improving', value: 'improving' },
      { label: 'Static', value: 'static' },
      { label: 'Fluctuating', value: 'fluctuating' },
    ] },
  { id: 'severity_score', section: 'Severity & Impact', text: 'Severity (0-10)?', type: 'number', symptomId: 'severity_score', tier: 2 },
];

export const QUESTION_DISEASE_MAP: Record<string, string[]> = {
  smoking: ['copd', 'bronchitis', 'lung_cancer', 'pneumonia'],
  tb_contact: ['tuberculosis'],
  tb_household: ['tuberculosis'],
  hiv_history: ['tuberculosis', 'pcp_pneumonia', 'pneumonia'],
  asthma_history: ['asthma', 'copd'],
  recurrent_chest: ['bronchiectasis', 'cystic_fibrosis', 'immunodeficiency'],
  cardiac_disease: ['chf', 'cardiac_cough'],
  diabetes: ['pneumonia', 'tuberculosis'],
  immunodeficiency: ['pcp_pneumonia', 'tuberculosis', 'pneumonia', 'fungal_pneumonia'],
  cystic_fibrosis: ['cystic_fibrosis', 'bronchiectasis'],
  overcrowding: ['tuberculosis', 'pneumonia', 'urti'],
  malnutrition: ['pneumonia', 'tuberculosis'],
  prematurity: ['bronchiolitis', 'bronchopulmonary_dysplasia', 'pneumonia'],
  atopy_family: ['asthma', 'allergic_rhinitis'],
  asthma_family: ['asthma'],
  vaccination_status: ['pertussis', 'pneumonia', 'influenza'],
};
