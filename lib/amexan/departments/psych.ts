// ═══════════════════════════════════════════════════════════════════════════════
// lib/amexan/departments/psych.ts
// AMEXAN Psychiatry Disease Intelligence Library
// 3 subspecialties — 5 diseases with complete DiseaseIntelligence objects
// ═══════════════════════════════════════════════════════════════════════════════

import type { DiseaseIntelligence } from '../core';

export const PSYCH_DISEASES: DiseaseIntelligence[] = [

  // ─── Bipolar I Disorder ─────────────────────────────────────────────────────
  {
    id: 'bipolar-i-disorder',
    name: 'Bipolar I Disorder',
    specialtyId: 'PSYCH', subspecialtyId: 'general-psychiatry', icd10: 'F31.9',
    epidemiology: {
      incidence: '0.5-1.0% lifetime incidence; 10-15 per 100,000 person-years', prevalence: '1-2% lifetime prevalence',
      ageDistribution: 'Median onset 18-25 years; can present in childhood or late life', genderPredilection: 'Equal male:female (manic episodes more common in males, depressive in females)',
      geographicDistribution: 'Worldwide; rates consistent across cultures with slight variation', seasonality: 'Manic episodes more common in spring/summer; depressive episodes in autumn/winter'
    },
    symptomWeights: [
      { symptom: 'elevated/expansive mood', weight: 10, prevalence: 85, category: 'major' },
      { symptom: 'decreased need for sleep', weight: 9, prevalence: 80, category: 'major' },
      { symptom: 'grandiosity', weight: 8, prevalence: 65, category: 'major' },
      { symptom: 'pressured speech', weight: 9, prevalence: 85, category: 'major' },
      { symptom: 'flight of ideas', weight: 8, prevalence: 70, category: 'major' },
      { symptom: 'increased goal-directed activity', weight: 7, prevalence: 75, category: 'major' },
      { symptom: 'excessive involvement in risky behaviours', weight: 8, prevalence: 55, category: 'major' },
      { symptom: 'distractibility', weight: 7, prevalence: 80, category: 'minor' },
      { symptom: 'psychotic features (delusions/hallucinations)', weight: 8, prevalence: 45, category: 'red_flag' },
      { symptom: 'depressive episodes (low mood, anhedonia)', weight: 7, prevalence: 90, category: 'major' },
      { symptom: 'suicidal ideation', weight: 9, prevalence: 30, category: 'red_flag' },
    ],
    riskFactors: [
      { factor: 'Family history of bipolar disorder', weight: 7.0, prevalence: 15 },
      { factor: 'First-degree relative with mood disorder', weight: 4.5, prevalence: 25 },
      { factor: 'Stressful life events prior to first episode', weight: 3.0, prevalence: 60 },
      { factor: 'History of childhood maltreatment', weight: 2.5, prevalence: 30 },
      { factor: 'Postpartum period (puerperal psychosis risk)', weight: 5.0, prevalence: 5 },
      { factor: 'Substance use (stimulants, cannabis)', weight: 4.0, prevalence: 40 },
      { factor: 'Sleep deprivation', weight: 3.5, prevalence: 50 },
    ],
    differentials: [
      { disease: 'Bipolar II Disorder', likelihood: 20, distinguishingFeatures: ['Hypomania (not mania)', 'No psychotic features during hypomania', 'More prominent depressive episodes', 'Less functional impairment during highs'] },
      { disease: 'Schizoaffective Disorder', likelihood: 15, distinguishingFeatures: ['Psychotic symptoms present outside mood episodes', 'At least 2 weeks of psychosis without mood symptoms', 'Poorer inter-episode recovery'] },
      { disease: 'Major Depressive Disorder', likelihood: 15, distinguishingFeatures: ['No history of mania/hypomania', 'Unipolar depression only', 'May be indistinguishable during depressive episode'] },
      { disease: 'ADHD', likelihood: 10, distinguishingFeatures: ['Onset before age 12', 'No episodic course', 'No mood elevation or grandiosity', 'Chronic rather than episodic'] },
      { disease: 'Borderline Personality Disorder', likelihood: 10, distinguishingFeatures: ['Chronic instability not episodic', 'Fear of abandonment', 'Identity disturbance', 'Affective instability triggered by interpersonal stress', 'No discrete manic episodes'] },
      { disease: 'Substance-Induced Mood Disorder', likelihood: 10, distinguishingFeatures: ['Temporal relationship to substance use', 'Resolution with abstinence', 'Positive toxicology screen', 'No independent mood episodes'] },
    ],
    investigations: [
      { test: 'Mood Disorder Questionnaire (MDQ)', purpose: 'Screen for bipolar spectrum', timing: 'routine', sensitivity: 73, specificity: 90, positiveResult: 'Score >=7 positive screen', negativeResult: 'Score <7; does not exclude' },
      { test: 'Young Mania Rating Scale (YMRS)', purpose: 'Assess severity of manic symptoms', timing: 'routine', positiveResult: 'Score >20 indicates moderate-severe mania', negativeResult: 'Score <12 suggests remission' },
      { test: 'Hamilton Depression Rating Scale (HAM-D)', purpose: 'Assess depressive symptom severity', timing: 'routine', positiveResult: 'Score >23 severe depression', negativeResult: 'Score <7 no depression' },
      { test: 'Thyroid Function Tests (TSH, fT4)', purpose: 'Rule out thyroid disorder causing mood symptoms', timing: 'routine', positiveResult: 'Abnormal TSH suggests thyroid dysfunction mimicking mood episode', negativeResult: 'Normal thyroid function' },
      { test: 'Urine Toxicology Screen', purpose: 'Exclude substance-induced mood disturbance', timing: 'urgent', positiveResult: 'Positive for stimulants, cannabis, or other drugs', negativeResult: 'Negative screen reduces likelihood of substance-induced aetiology' },
      { test: 'Serum Lithium Level', purpose: 'Monitor therapeutic level during lithium therapy', timing: 'routine', positiveResult: 'Therapeutic: 0.6-1.2 mmol/L (acute); 0.4-1.0 mmol/L (maintenance)', negativeResult: 'Subtherapeutic level' },
      { test: 'CBC, Renal Function, ECG', purpose: 'Baseline before initiating mood stabilisers', timing: 'routine', positiveResult: 'Abnormal baseline may affect drug choice', negativeResult: 'Normal baseline' },
    ],
    imaging: [
      { modality: 'MRI Brain', indication: 'First episode of psychosis or atypical presentation (neurological signs, late onset)', findings: 'May show non-specific white matter hyperintensities. Typically normal. Used to exclude structural causes (tumour, MS, stroke).', sensitivity: 60, specificity: 85 },
    ],
    severityCriteria: [
      { criterion: 'Mood elevation', mild: 'Mild elevation, noticeable to others', moderate: 'Significant elevation, interferes with function', severe: 'Severe elevation with psychotic features', critical: 'Extreme agitation, dangerous behaviour, catatonia' },
      { criterion: 'Functioning', mild: 'Some impairment in social/occupational function', moderate: 'Marked impairment, unable to work', severe: 'Unable to care for self, requires supervision', critical: 'Danger to self/others, requires 1:1 supervision' },
      { criterion: 'Sleep', mild: 'Decreased need (6-7h, feels rested)', moderate: 'Decreased need (4-5h)', severe: 'Decreased need (2-3h)', critical: 'No sleep for 24h+ with no fatigue' },
      { criterion: 'Psychotic features', mild: 'None', moderate: 'None', severe: 'Mood-congruent delusions/hallucinations', critical: 'Mood-incongruent or bizarre delusions, command hallucinations' },
      { criterion: 'Suicidality', mild: 'Passive death wish', moderate: 'Suicidal ideation with plan', severe: 'Suicidal intent, preparations made', critical: 'Acute suicide attempt, requires emergency intervention' },
      { criterion: 'Insight', mild: 'Good insight', moderate: 'Partial insight', severe: 'Poor insight', critical: 'No insight, refuses treatment' },
    ],
    diagnosticCriteria: [
      { name: 'DSM-5-TR Manic Episode Criteria', type: 'required', description: 'At least 1 week (or any duration if hospitalisation needed) of abnormally and persistently elevated, expansive, or irritable mood AND increased goal-directed activity/energy, with 3+ additional symptoms (4+ if mood only irritable): grandiosity, decreased need for sleep, pressured speech, flight of ideas, distractibility, increased risk-taking. Causes marked impairment or requires hospitalisation. Not attributable to substance or medical condition.' },
      { name: 'DSM-5-TR Bipolar I Diagnosis', type: 'required', description: 'At least one manic episode meeting full criteria. The manic episode is not better explained by schizoaffective disorder and is not superimposed on schizophrenia, schizophreniform disorder, delusional disorder, or other specified/unspecified schizophrenia spectrum disorder.' },
    ],
    treatmentGuidelines: [
      {
        name: 'BAP/CANMAT Guidelines for Bipolar Disorder', source: 'British Association for Psychopharmacology / CANMAT', year: 2023,
        firstLine: [
          { drug: 'Lithium Carbonate', dose: '400-800 mg PO twice daily (titrate to serum level 0.6-1.2 mmol/L)', route: 'PO', frequency: 'Twice daily', duration: 'Indefinite maintenance', maxDose: '1600 mg/day', renalAdjustment: 'Reduce dose if CrCl <30; monitor levels', pregnancyCategory: 'D (avoid in first trimester, risk of Ebstein anomaly)', evidenceLevel: 'A' },
          { drug: 'Valproate Semisodium', dose: '500-1000 mg PO twice daily (target level 50-125 mcg/mL)', route: 'PO', frequency: 'Twice daily', duration: 'Indefinite maintenance', maxDose: '3000 mg/day', hepaticAdjustment: 'Contraindicated in active liver disease', pregnancyCategory: 'D (contraindicated, risk of neural tube defects)', evidenceLevel: 'A' },
        ],
        stepProtocol: [
          { step: 1, therapy: 'Acute mania (first-line)', details: 'Start lithium (titrate to 0.8-1.2 mmol/L) OR valproate (target 50-125 mcg/mL). Add antipsychotic (olanzapine 10-20 mg/day, risperidone 2-6 mg/day, or haloperidol 5-15 mg/day) for severe agitation or psychosis. Consider short-term benzodiazepine (lorazepam 1-2 mg PO/IM) for acute agitation.', duration: '2-4 weeks for acute episode resolution', monitoring: ['YMRS weekly', 'Serum lithium/valproate levels q5-7 days', 'LFTs, creatinine, TFTs baseline + q3 months', 'ECG if >40 or cardiac risk'] },
          { step: 2, therapy: 'Acute mania (alternative/combination)', details: 'If inadequate response at 2 weeks: combine lithium + valproate, or switch antipsychotic, or add second antipsychotic. Consider ECT for severe/refractory mania (6-12 sessions).', duration: '4-8 weeks', monitoring: ['As above', 'Weight, BMI, waist circumference', 'Fasting glucose, lipid profile'], alternatives: ['Carbamazepine 400-800 mg/day', 'Lamotrigine for maintenance (not acute)', 'Aripiprazole 15-30 mg/day'] },
          { step: 3, therapy: 'Bipolar depression', details: 'First-line: quetiapine 150-300 mg/day monotherapy OR lamotrigine 25-200 mg/day (slow titration). Avoid antidepressants as monotherapy (risk of switching). If antidepressant used: combine with mood stabiliser. Consider lurasidone or cariprazine.', duration: '8-12 weeks for depressive episode', monitoring: ['HAM-D or MADRS weekly', 'Monitor for switch to mania', 'Suicidality assessment each visit'], alternatives: ['Olanzapine + fluoxetine combination', 'ECT for severe/refractory depression', 'Transcranial magnetic stimulation (TMS)'] },
          { step: 4, therapy: 'Maintenance/relapse prevention', details: 'Continue first-line mood stabiliser at therapeutic levels indefinitely. Lithium is the gold standard for suicide prevention. Monitor levels q3-6 months. Psychotherapy: psychoeducation, CBT, interpersonal and social rhythm therapy (IPSRT).', duration: 'Indefinite', monitoring: ['Serum lithium/valproate q3-6 months', 'TSH, creatinine q6-12 months (lithium)', 'LFTs q6-12 months (valproate)', 'Weight, metabolic panel q6 months', 'Mood charting'], alternatives: ['Lamotrigine maintenance (especially for depressive episodes)', 'Antipsychotic long-acting injection if adherence concern'] },
        ],
        duration: 'Lifelong maintenance',
        monitoring: ['Mood episode recurrence', 'Serum drug levels', 'Renal function (lithium)', 'Thyroid function (lithium)', 'LFTs (valproate)', 'Metabolic parameters (weight, glucose, lipids)', 'Suicide risk assessment', 'Adherence'],
      },
    ],
    admissionCriteria: [
      { indications: ['Acute manic episode with dangerous behaviour or severe functional impairment', 'Suicidal ideation with intent or attempt', 'Psychotic features requiring stabilisation', 'Inability to care for self due to mood episode', 'First manic episode for diagnostic clarification and treatment initiation', 'Agitation requiring IM medication or restraint'], level: 'ward', parameters: [{ param: 'YMRS', threshold: '>25' }, { param: 'Suicidal ideation', threshold: 'With plan/intent' }, { param: 'Insight', threshold: 'Poor or absent' }] },
      { indications: ['Medical instability (lithium toxicity, neuroleptic malignant syndrome)', 'Catatonia requiring ECT', 'Refractory mania requiring intensive combination therapy', 'Acute suicide attempt requiring medical stabilisation'], level: 'HDU', parameters: [{ param: 'Lithium level', threshold: '>2.0 mmol/L' }, { param: 'Catatonia rating', threshold: 'Severe' }] },
    ],
    dischargeCriteria: {
      clinical: ['Mood episode resolved or significantly improved', 'No acute suicidal ideation or dangerous behaviour', 'Psychotic features resolved', 'Insight improving', 'Able to cooperate with outpatient follow-up', 'Stable on medication regimen for at least 48h'],
      lab: ['Serum lithium/valproate levels within therapeutic range', 'Normal renal function (lithium)', 'Normal LFTs (valproate)', 'Normal ECG'],
      social: ['Accommodation confirmed', 'Family/carer support available', 'Outpatient psychiatric follow-up arranged within 1 week', 'Crisis plan in place', 'Medication supply for at least 2 weeks', 'Registered with community mental health team'],
    },
    complications: [
      { name: 'Suicide', incidence: 15, timeCourse: 'Lifetime risk 15% (highest of any psychiatric disorder)', management: 'Hospitalisation, risk assessment, lithium (lowers suicide risk by 60%), psychological support, means restriction', redFlags: ['Previous suicide attempt', 'Hopelessness', 'Mixed episode', 'Recent discharge from hospital', 'Male gender', 'Family history of suicide'] },
      { name: 'Lithium Toxicity', incidence: 3, timeCourse: 'Acute within hours of overdose; chronic over weeks of accumulation', management: 'Stop lithium, IV fluids, haemodialysis if severe (level >2.5 mmol/L or neurological symptoms). Recheck levels 6-12 hourly.', redFlags: ['Tremor', 'Ataxia', 'Dysarthria', 'Nystagmus', 'Confusion', 'Seizures', 'Coma'] },
      { name: 'Valproate Hepatotoxicity', incidence: 1, timeCourse: 'Usually within first 6 months', management: 'Stop valproate, monitor LFTs, consider L-carnitine supplementation. Switch to alternative mood stabiliser.', redFlags: ['Rising transaminases', 'Jaundice', 'Abdominal pain', 'Oedema', 'Bleeding tendency'] },
      { name: 'Neuroleptic Malignant Syndrome', incidence: 0.5, timeCourse: 'Develops over 24-72h of antipsychotic use', management: 'Stop antipsychotic, supportive care (cooling, hydration), dantrolene or bromocriptine, consider ECT.', redFlags: ['Hyperthermia (>38°C)', 'Rigidity', 'Autonomic instability', 'Altered consciousness', 'Raised CK'] },
      { name: 'Rapid Cycling', incidence: 15, timeCourse: '4+ mood episodes in 12 months', management: 'Optimise mood stabiliser, avoid antidepressants, consider lamotrigine, address substance use and sleep hygiene', redFlags: ['Frequent mood switches', 'Substance use', 'Hypothyroidism', 'Antidepressant-induced'] },
    ],
    followUp: { interval: '1-2 weeks initially, then monthly to quarterly', duration: 'Lifelong', tests: ['Serum lithium/valproate q3-6 months', 'TSH, creatinine q6 months (lithium)', 'LFTs, FBC q6 months (valproate)', 'Weight, metabolic panel q6 months', 'Mood chart review'], specialistReview: true, specialistTiming: 'Community psychiatric team within 1 week of discharge. Consultant psychiatrist review every 3-6 months.' },
    prognosis: 'Bipolar I is a lifelong disorder with recurrent episodes. With optimal treatment: 60% achieve remission within 3 months, but 70% relapse within 5 years. Lithium reduces suicide risk by 60%. Poor prognostic factors: early onset, psychotic features, substance use, poor adherence, low social support. Good prognostic factors: good inter-episode recovery, later onset, strong support system, treatment adherence.',
    emergencyFlags: [
      { condition: 'Acute suicide attempt or imminent risk', action: 'Emergency admission under Mental Health Act. 1:1 nursing. Remove means. Consider urgent ECT if severe.', timeCritical: 'Immediate' },
      { condition: 'Acute manic episode with severe agitation or violence', action: 'Rapid tranquillisation (lorazepam IM + haloperidol IM). Consider seclusion if risk to others. Assess for organic causes.', timeCritical: '<30 minutes' },
      { condition: 'Lithium toxicity (level >2.0 mmol/L or any neurological symptom)', action: 'Stop lithium. Check level, creatinine, electrolytes. IV fluids. Haemodialysis if severe. Monitor cardiac and neurological status.', timeCritical: '<1 hour' },
      { condition: 'Neuroleptic Malignant Syndrome (hyperthermia, rigidity, autonomic instability)', action: 'Stop all antipsychotics. Urgent transfer to medical ward/ICU. Start dantrolene or bromocriptine. Supportive care.', timeCritical: '<1 hour' },
      { condition: 'Catatonia with autonomic instability (malignant catatonia)', action: 'High-dose lorazepam 2-4 mg IV/IM. Prepare for ECT. ICU monitoring.', timeCritical: '<30 minutes' },
    ],
    pediatricAdjustments: [
      { parameter: 'Diagnosis', adjustment: 'More frequent mixed episodes and rapid cycling. Irritability may be more prominent than euphoria. Lower threshold for paediatric consultation.', ageRange: '<18 years' },
      { parameter: 'Lithium dosing', adjustment: 'Start 15-20 mg/kg/day in divided doses. Target level 0.8-1.2 mEq/L (acute) and 0.6-1.0 mEq/L (maintenance). Monitor thyroid and renal function more frequently.', ageRange: '12-18 years' },
      { parameter: 'Valproate caution', adjustment: 'Avoid in females of childbearing potential unless absolutely necessary. Higher risk of hepatotoxicity in children <10 years.', ageRange: '<18 years' },
      { parameter: 'Antipsychotic dosing', adjustment: 'Lower starting doses with slower titration. Monitor metabolic parameters closely (weight gain more pronounced in adolescents).', ageRange: '<18 years' },
    ],
    pregnancyAdjustments: [
      { trimester: 'first', adjustment: 'Lithium: risk of Ebstein anomaly (0.05-0.1%). Valproate: contraindicated (neural tube defects 5-9%). Discuss risks vs benefits. Consider antipsychotic monotherapy (olanzapine, quetiapine, aripiprazole) as alternative.', safety: 'caution', alternative: 'Olanzapine or quetiapine as alternative to lithium' },
      { trimester: 'second', adjustment: 'Continue mood stabiliser if benefits outweigh risks. Monitor serum levels frequently (pregnancy alters pharmacokinetics). Lithium levels may drop; adjust dose.', safety: 'caution' },
      { trimester: 'third', adjustment: 'Lithium levels may fluctuate; monitor weekly. Aim for lower therapeutic range (0.4-0.8 mmol/L) near delivery to reduce neonatal toxicity. Antipsychotics may cause neonatal extrapyramidal symptoms.', safety: 'caution' },
      { trimester: 'all', adjustment: 'Postpartum period: highest risk for episode recurrence (especially bipolar). Discuss postpartum prophylaxis with lithium or antipsychotic. Breastfeeding: lithium compatible with monitoring; valproate safe; avoid carbamazepine.', safety: 'caution' },
    ],
    aiReasoning: {
      presentationPattern: ['Episode of elevated/irritable mood with decreased need for sleep and grandiose plans that developed over days', 'Patient brought in by family concerned about uncharacteristic behaviour, spending sprees, or reckless decisions', 'Patient may lack insight and deny being unwell, attributing elevated mood to personal success', 'Depressive episode in a patient with known or unknown history of manic episodes', 'Postpartum psychosis: rapid onset of mood elevation, confusion, and bizarre behaviour within weeks of delivery'],
      keyFeatures: ['Discrete episodes of mania (distinct period of abnormal mood + increased energy lasting >1 week)', 'Decreased need for sleep (not insomnia — patient feels rested after few hours)', 'Pressured speech that is difficult to interrupt', 'Grandiose delusions (special powers, mission, identity)', 'Cyclical course with inter-episode recovery', 'Strong family history of mood disorders'],
      discriminatingQuestions: ['Have you ever had a period where you needed much less sleep than usual but still felt full of energy?', 'Has anyone told you that you were talking too fast or jumping between topics?', 'Have you ever gone on spending sprees or made risky decisions during a "high" period?', 'Have you ever been hospitalised for mania or psychosis?', 'Is there a family history of bipolar disorder, suicide, or psychiatric hospitalisation?', 'Have antidepressants ever made you feel "wired" or extremely energetic?'],
      diagnosticAlgorithm: ['1. Assess current episode: manic, hypomanic, depressive, or mixed', '2. Screen for past manic/hypomanic episodes (MDQ, clinical interview)', '3. Confirm DSM-5-TR criteria for manic episode: >1 week duration, 3+ symptoms', '4. Rule out substances (toxicology, history)', '5. Rule out medical causes (TSH, B12, electrolytes, neuroimaging if indicated)', '6. Assess suicide risk', '7. Evaluate need for hospitalisation (safety, severity, insight)', '8. Classify episode type (manic, depressed, mixed, rapid cycling)', '9. Initiate or adjust mood stabiliser', '10. Arrange follow-up and psychoeducation'],
    },
    clinicalNoteTemplate: {
      sections: ['Patient identifiers', 'Informant & reliability', 'Presenting complaint', 'History of presenting episode (onset, duration, triggers)', 'Mood episode type (manic/depressed/mixed)', 'DSM-5-TR symptom checklist', 'Suicide risk assessment', 'Risk to others', 'Insight assessment', 'Past psychiatric history (episodes, hospitalisations, treatments)', 'Family history', 'Substance use history', 'Medication history (adherence, side effects)', 'Mental state examination (appearance, behaviour, speech, mood, affect, thought form/content, perception, cognition, insight)', 'Physical examination', 'Investigations', 'Differential diagnosis', 'Formulation (biological, psychological, social)', 'Risk management plan', 'Treatment plan', 'Follow-up arrangements'],
      consultantWording: 'This [age]-year-old [male/female] presents in an [manic/depressed/mixed] episode meeting DSM-5-TR criteria for Bipolar I Disorder. The current episode is characterised by [key features: elevated mood, decreased sleep, grandiosity, pressured speech, psychotic features]. There is [good/partial/poor] insight. Suicide risk is [low/moderate/high]. The treatment plan involves [acute stabilisation with mood stabiliser ± antipsychotic] followed by [maintenance therapy]. Admission is [required/not required] based on [severity, safety, social support].',
      exampleNote: 'A 28-year-old male presents with 10-day history of elevated mood, decreased need for sleep (2-3h/night, feels rested), grandiose beliefs (plans to start a billion-dollar company), pressured speech, and excessive spending (bought 3 cars). No psychotic features. First episode at age 22 (mania), two depressive episodes since. Family history: father with bipolar disorder. Insight: poor. Risk: impulsive spending but no suicide intent. YMRS score 32. Plan: start lithium 400 mg BD, olanzapine 10 mg nocte for agitation, lorazepam PRN. Urgent serum lithium level in 5 days. Admit to psychiatric ward for stabilisation.',
    },
  },

  // ─── Major Depressive Disorder ──────────────────────────────────────────────
  {
    id: 'major-depressive-disorder',
    name: 'Major Depressive Disorder',
    specialtyId: 'PSYCH', subspecialtyId: 'general-psychiatry', icd10: 'F32.9',
    epidemiology: {
      incidence: '10-15% lifetime incidence; 1-2% annual incidence in adults', prevalence: '5-10% point prevalence; 15-20% lifetime prevalence',
      ageDistribution: 'Peak 25-44 years; can occur at any age including childhood and elderly', genderPredilection: 'Female:Male 2:1 (female predominance most pronounced in reproductive years)',
      geographicDistribution: 'Worldwide; rates vary by methodology but present in all cultures', seasonality: 'Seasonal affective disorder subtype: depressive episodes in autumn/winter with remission in spring/summer'
    },
    symptomWeights: [
      { symptom: 'depressed mood', weight: 10, prevalence: 95, category: 'major' },
      { symptom: 'anhedonia (loss of interest/pleasure)', weight: 9, prevalence: 85, category: 'major' },
      { symptom: 'sleep disturbance (insomnia or hypersomnia)', weight: 8, prevalence: 80, category: 'major' },
      { symptom: 'fatigue or loss of energy', weight: 8, prevalence: 85, category: 'major' },
      { symptom: 'psychomotor agitation or retardation', weight: 7, prevalence: 60, category: 'major' },
      { symptom: 'feelings of worthlessness or excessive guilt', weight: 8, prevalence: 70, category: 'major' },
      { symptom: 'diminished concentration or indecisiveness', weight: 7, prevalence: 75, category: 'major' },
      { symptom: 'significant weight/appetite change', weight: 7, prevalence: 65, category: 'major' },
      { symptom: 'recurrent thoughts of death or suicide', weight: 9, prevalence: 40, category: 'red_flag' },
      { symptom: 'hopelessness', weight: 8, prevalence: 65, category: 'major' },
      { symptom: 'anxiety or excessive worry', weight: 6, prevalence: 60, category: 'minor' },
    ],
    riskFactors: [
      { factor: 'Family history of depression', weight: 3.0, prevalence: 25 },
      { factor: 'History of childhood adversity or trauma', weight: 3.5, prevalence: 30 },
      { factor: 'Chronic medical illness (cancer, diabetes, CVD)', weight: 3.0, prevalence: 40 },
      { factor: 'Recent stressful life events (bereavement, divorce, job loss)', weight: 4.0, prevalence: 50 },
      { factor: 'Female gender', weight: 2.5, prevalence: 60 },
      { factor: 'Previous depressive episode', weight: 5.0, prevalence: 40 },
      { factor: 'Postpartum period', weight: 4.0, prevalence: 10 },
    ],
    differentials: [
      { disease: 'Bipolar Disorder (depressive episode)', likelihood: 20, distinguishingFeatures: ['History of manic/hypomanic episodes', 'Early onset (<25 years)', 'Atypical depressive features (hypersomnia, hyperphagia)', 'Psychotic features', 'Family history of bipolar', 'Poor response to antidepressants'] },
      { disease: 'Adjustment Disorder with Depressed Mood', likelihood: 15, distinguishingFeatures: ['Clear identifiable stressor within 3 months', 'Symptoms do not meet full MDD criteria', 'Resolves when stressor removed', 'No suicidal ideation or psychotic features'] },
      { disease: 'Persistent Depressive Disorder (Dysthymia)', likelihood: 10, distinguishingFeatures: ['Chronic depression >2 years', 'Less severe than MDD', 'No discrete episodes', 'May have superimposed MDD (double depression)'] },
      { disease: 'Anxiety Disorder', likelihood: 10, distinguishingFeatures: ['Worry/anxiety predominant rather than mood', 'Autonomic symptoms (palpitations, sweating)', 'Panic attacks may mimic depression', 'Often comorbid with MDD'] },
      { disease: 'Hypothyroidism', likelihood: 8, distinguishingFeatures: ['Weight gain, cold intolerance, constipation', 'Dry skin, hair loss, bradycardia', 'Abnormal TSH/fT4', 'Fatigue predominant, mood less prominent'] },
      { disease: 'Substance-Induced Depressive Disorder', likelihood: 8, distinguishingFeatures: ['Temporal association with substance use or withdrawal', 'Toxicology positive', 'Resolves with abstinence over days-weeks'] },
    ],
    investigations: [
      { test: 'Patient Health Questionnaire-9 (PHQ-9)', purpose: 'Screen for depression and assess severity', timing: 'routine', sensitivity: 88, specificity: 88, positiveResult: 'Score >=10 indicates moderate depression; >=20 severe', negativeResult: 'Score <5; does not exclude subthreshold depression' },
      { test: 'Hamilton Depression Rating Scale (HAM-D 17-item)', purpose: 'Assess baseline severity and monitor treatment response', timing: 'routine', positiveResult: 'Score >23 = severe; 15-23 = moderate; 8-14 = mild', negativeResult: 'Score <8 suggests remission' },
      { test: 'Thyroid Function Tests (TSH, fT4)', purpose: 'Rule out hypothyroidism as a cause of depressive symptoms', timing: 'routine', positiveResult: 'Abnormal TSH suggests thyroid disorder mimicking depression', negativeResult: 'Normal thyroid function' },
      { test: 'Vitamin B12 and Folate Levels', purpose: 'Rule out deficiency causing depressive or cognitive symptoms', timing: 'routine', positiveResult: 'Low B12/folate levels require replacement', negativeResult: 'Normal levels' },
      { test: 'FBC and Iron Studies', purpose: 'Rule out anaemia causing fatigue and low mood', timing: 'routine', positiveResult: 'Anaemia found; may contribute to depressive symptoms', negativeResult: 'Normal' },
      { test: 'Urine Toxicology Screen', purpose: 'Exclude substance-induced mood disorder', timing: 'routine', positiveResult: 'Positive screen indicates possible substance-induced aetiology', negativeResult: 'Negative screen' },
      { test: 'ECG', purpose: 'Baseline before initiating antidepressants that may prolong QTc (citalopram, TCAs)', timing: 'routine', positiveResult: 'QTc >450 ms (male) or >470 ms (female) requires caution with certain antidepressants', negativeResult: 'Normal ECG' },
    ],
    imaging: [
      { modality: 'MRI Brain', indication: 'First-episode depression with atypical features (cognitive impairment, neurological signs, late onset >50 years)', findings: 'May show reduced hippocampal volume, increased amygdala activation. Typically normal. Used to exclude structural pathology.', sensitivity: 55, specificity: 80 },
    ],
    severityCriteria: [
      { criterion: 'Depressed mood', mild: 'Feels down most of the day', moderate: 'Marked mood disturbance daily', severe: 'Severe, pervasive low mood', critical: 'Unable to experience any positive emotion; mood often worse in morning' },
      { criterion: 'Functioning', mild: 'Some difficulty but manages daily tasks', moderate: 'Marked impairment in social/occupational function', severe: 'Unable to work or maintain social relationships', critical: 'Unable to care for self; needs hospitalisation' },
      { criterion: 'PHQ-9 Score', mild: '5-9', moderate: '10-14', severe: '15-19', critical: '>=20' },
      { criterion: 'Psychotic features', mild: 'None', moderate: 'None', severe: 'Mood-congruent psychotic features (guilt, nihilistic, somatic)', critical: 'Mood-incongruent or bizarre psychotic features' },
      { criterion: 'Suicidality', mild: 'Passive death wish ("I\'d be better off dead")', moderate: 'Suicidal ideation with plan but no intent', severe: 'Suicidal intent, preparations made, access to means', critical: 'Acute suicide attempt or definite plan with means, requires hospitalisation' },
      { criterion: 'Appetite/Weight', mild: 'Slight decrease/increase', moderate: 'Significant change (5% body weight in 1 month)', severe: 'Marked change with nutritional impact', critical: 'Refusal to eat/drink; requires nutritional support' },
    ],
    diagnosticCriteria: [
      { name: 'DSM-5-TR Major Depressive Episode Criteria', type: 'required', description: 'Five or more of the following symptoms present during the same 2-week period and represent a change from previous functioning: at least one symptom is either (1) depressed mood or (2) loss of interest/pleasure. (3) Significant weight loss/gain or appetite change, (4) insomnia or hypersomnia, (5) psychomotor agitation or retardation, (6) fatigue or loss of energy, (7) feelings of worthlessness or excessive/inappropriate guilt, (8) diminished concentration or indecisiveness, (9) recurrent thoughts of death or suicidal ideation. Symptoms cause clinically significant distress or impairment and are not attributable to substances or another medical condition.' },
    ],
    treatmentGuidelines: [
      {
        name: 'BAP/NICE Guidelines for Depression', source: 'British Association for Psychopharmacology / NICE', year: 2023,
        firstLine: [
          { drug: 'Sertraline', dose: '50 mg PO once daily, increase up to 200 mg if needed', route: 'PO', frequency: 'Once daily', duration: '6-12 months minimum', maxDose: '200 mg/day', renalAdjustment: 'No adjustment needed', pregnancyCategory: 'C (avoid in third trimester if possible; risk of PPHN)', evidenceLevel: 'A' },
          { drug: 'Escitalopram', dose: '10 mg PO once daily, increase to 20 mg if needed', route: 'PO', frequency: 'Once daily', duration: '6-12 months minimum', maxDose: '20 mg/day', renalAdjustment: 'Caution in severe renal impairment', pregnancyCategory: 'C', evidenceLevel: 'A' },
        ],
        stepProtocol: [
          { step: 1, therapy: 'Mild depression (PHQ-9 <10)', details: 'Watchful waiting 2 weeks. If persistent: low-intensity psychological interventions (CBT, behavioural activation, guided self-help) x 8-10 sessions. Consider antidepressants only if inadequate response to psychological therapy or moderate-severe.', duration: '6-8 weeks', monitoring: ['PHQ-9 q2-4 weeks', 'Suicide risk assessment', 'Side effect monitoring'] },
          { step: 2, therapy: 'Moderate depression (PHQ-9 10-19)', details: 'Antidepressant first-line: SSRI (sertraline 50 mg/day or escitalopram 10 mg/day). Combined with CBT/interpersonal therapy. Review at 2-4 weeks. If inadequate response at 4 weeks: increase dose or switch to alternative SSRI/SNRI.', duration: '6-12 weeks for acute phase', monitoring: ['PHQ-9 q2-4 weeks', 'Side effect monitoring (nausea, headache, agitation, sexual dysfunction)', 'Suicidality assessment (especially first 2 weeks of treatment)'] },
          { step: 3, therapy: 'Severe depression (PHQ-9 >=20) or treatment-resistant', details: 'Optimise SSRI dose (sertraline 200 mg, escitalopram 20 mg). If failed 1 SSRI: switch to alternative SSRI or SNRI (venlafaxine 75-225 mg/day, duloxetine 60-120 mg/day). If failed 2 antidepressants, consider: augmentation (aripiprazole 2-10 mg, quetiapine 150-300 mg, lithium augmentation), or switching to mirtazapine 30-45 mg/day, or TCA (amitriptyline 75-150 mg/day).', duration: '8-12 weeks per trial', monitoring: ['PHQ-9 or HAM-D weekly', 'BP monitoring (venlafaxine)', 'ECG (TCA or high-dose)', 'Weight, metabolic monitoring'], alternatives: ['Mirtazapine for insomnia/anorexia', 'Agomelatine for disrupted sleep', 'Vortioxetine for cognitive symptoms'] },
          { step: 4, therapy: 'Treatment-resistant depression (failed 3+ antidepressants)', details: 'STAR*D protocol approach: (1) Augmentation with lithium 600-1200 mg/day or second-generation antipsychotic. (2) MAOI (phenelzine/tranylcypromine) — requires dietary restrictions. (3) ECT — gold standard for severe, treatment-resistant, or psychotic depression: 8-12 sessions, 3x/week. (4) TMS — 20-30 sessions over 4-6 weeks. (5) Ketamine/esketamine — for acute suicidal depression under specialist supervision.', duration: 'Varies (6 weeks per augmentation trial; ECT course 4 weeks)', monitoring: ['Full psychiatric assessment', 'Medical workup prior to ECT', 'BP, HR, ECG for ECT', 'Cognitive assessment during ECT course'], alternatives: ['Transcranial magnetic stimulation (TMS)', 'Ketamine infusion/esketamine nasal spray', 'Vagus nerve stimulation (VNS)', 'Deep brain stimulation (DBS) — investigational'] },
        ],
        duration: 'Acute 6-12 weeks; continuation 6-12 months; maintenance indefinite if 3+ episodes',
        monitoring: ['PHQ-9 or HAM-D at each visit', 'Suicidal ideation and risk', 'Medication adherence', 'Side effect profile', 'Functional status', 'Sleep, appetite, energy levels', 'Substance use', 'Social support and stressors'],
      },
    ],
    admissionCriteria: [
      { indications: ['Acute suicide risk with intent/plan', 'Suicide attempt requiring medical stabilisation', 'Psychotic depression', 'Inability to care for self (severe weight loss, dehydration)', 'Catatonic features', 'Treatment-resistant depression requiring ECT or medication adjustment in monitored setting'], level: 'ward', parameters: [{ param: 'Suicidal ideation', threshold: 'With plan and intent' }, { param: 'PHQ-9', threshold: '>=20 with functional impairment' }, { param: 'Weight loss', threshold: '>10% body weight in 1 month' }] },
      { indications: ['Medical complications of severe depression (dehydration, electrolyte imbalance)', 'Catatonia requiring ECT and monitoring'], level: 'HDU', parameters: [{ param: 'Catatonia severity', threshold: 'Severe with autonomic instability' }] },
    ],
    dischargeCriteria: {
      clinical: ['Improvement in depressive symptoms (PHQ-9 <10 or 50% reduction)', 'No acute suicidal ideation', 'Psychotic features resolved', 'Able to eat, drink, and maintain personal hygiene', 'Engaging in basic social interaction', 'Medication regimen established and tolerated'],
      lab: ['Normal electrolytes, hydration status', 'If ECT: post-treatment cognitive assessment done'],
      social: ['Follow-up arranged within 1 week', 'Crisis team in place', 'Carer/family aware and supportive', 'Accommodation stable', 'Medication supply for 2 weeks', 'Return-to-work/school plan discussed'],
    },
    complications: [
      { name: 'Suicide', incidence: 10, timeCourse: 'Lifetime risk 10% in severe depression; highest during first 2 weeks of antidepressant treatment and after discharge', management: 'Hospitalisation, risk assessment, means restriction, crisis plan, lithium augmentation if bipolar diathesis. STAR*D: suicide attempt rate 1-2% across treatment levels.', redFlags: ['Previous attempt', 'Hopelessness', 'Severe anxiety/agitation', 'Male gender >45 years', 'Alcohol use', 'Social isolation', 'Recent loss', 'Access to means'] },
      { name: 'Treatment-Resistant Depression', incidence: 30, timeCourse: 'Defined as failure of 2+ adequate antidepressant trials in current episode', management: 'STAR*D protocol: sequenced treatment augmentation/switching. ECT, TMS, ketamine. Referral to specialist mood disorders clinic.', redFlags: ['Failed 3+ treatments', 'Chronic episode >2 years', 'Comorbid anxiety/OCD', 'Bipolar diathesis', 'Personality disorder comorbidity'] },
      { name: 'Antidepressant-Induced Mania or Rapid Cycling', incidence: 5, timeCourse: 'Within weeks of starting an antidepressant in bipolar diathesis', management: 'Stop antidepressant. Start mood stabiliser. Reclassify as bipolar disorder.', redFlags: ['Family history of bipolar', 'Early onset depression', 'Antidepressant "switch"', 'Psychotic features during depression'] },
      { name: 'Serotonin Syndrome', incidence: 1, timeCourse: 'Within hours to days of SSRI initiation or dose increase, especially with MAOI or linezolid combination', management: 'Stop serotonergic drugs. Supportive care (cooling, hydration). Cyproheptadine for moderate cases. ICU if severe.', redFlags: ['Hyperthermia', 'Clonus', 'Agitation', 'Hyperreflexia', 'Tremor', 'Diaphoresis', 'Myoclonus'] },
    ],
    followUp: { interval: 'Every 1-2 weeks during acute phase, then monthly for 6 months, then quarterly if stable', duration: '6-12 months after remission (indefinite if 3+ episodes or severe depression)', tests: ['PHQ-9 at each visit', 'HAM-D if available', 'Medication level monitoring (if TCA or lithium augmentation)', 'Metabolic monitoring q3-6 months if on antipsychotic augmentation'], specialistReview: true, specialistTiming: 'If not improved by 4 weeks despite adequate dose, or if 2+ antidepressants failed, refer to psychiatrist. For ECT/TMS: specialist referral.' },
    prognosis: 'Good with treatment: 60-70% respond to first antidepressant, 80-90% eventually respond with sequential trials. Relapse rate: 50% within 6 months without continuation; reduced to 10-20% with maintenance. Chronic/recurrent course in 15-20%. Poor prognostic factors: early onset, severe episodes, psychotic features, comorbid anxiety/substance use, personality disorder, poor social support. Good prognostic factors: good response to initial treatment, strong support system, later onset, no comorbidity.',
    emergencyFlags: [
      { condition: 'Acute suicide attempt or imminent risk', action: 'Emergency assessment, hospitalisation under Mental Health Act, 1:1 nursing, means restriction, remove all sharp objects/medication. Consider ketamine/esketamine for acute suicidal depression if available.', timeCritical: 'Immediate' },
      { condition: 'Psychotic depression with command hallucinations to harm self', action: 'Emergency admission, antipsychotic + ECT evaluation, close observation', timeCritical: 'Immediate' },
      { condition: 'Severe agitation/akathisia after starting antidepressant', action: 'Review medication, reduce dose or switch, start propranolol or benzodiazepine for akathisia. Assess for suicidality (known risk).', timeCritical: '<24 hours' },
      { condition: 'Serotonin Syndrome (hyperthermia, clonus, agitation, hyperreflexia)', action: 'Stop all serotonergic agents, supportive care, cooling, cyproheptadine, ICU if severe', timeCritical: '<1 hour' },
      { condition: 'Catatonic stupor with refusal to eat/drink', action: 'IV fluids, lorazepam 1-2 mg IV/IM trial, consider ECT, NG feeding if prolonged', timeCritical: '<12 hours' },
    ],
    pediatricAdjustments: [
      { parameter: 'Diagnosis', adjustment: 'Irritability may be more prominent than depressed mood. Consider developmental factors. Use age-appropriate screening tools (CDI, MFQ).', ageRange: '<18 years' },
      { parameter: 'Antidepressant prescribing', adjustment: 'Fluoxetine is first-line (age 8+). Escitalopram second-line (age 12+). Black box warning: increased risk of suicidal ideation in first weeks. Monitor weekly. Do NOT prescribe paroxetine.', ageRange: '<18 years' },
      { parameter: 'Psychological therapy', adjustment: 'CBT and interpersonal therapy are first-line. Family therapy often indicated. School liaison essential.', ageRange: '<18 years' },
      { parameter: 'ECT use', adjustment: 'Rarely used in <18 years; only in severe treatment-resistant cases with specialist approval.', ageRange: '<18 years' },
    ],
    pregnancyAdjustments: [
      { trimester: 'first', adjustment: 'Risk of SSRI cessation (relapse) vs teratogenicity (small increased risk of cardiac defects with paroxetine; avoid. Sertraline and fluoxetine considered safer SSRI options). Discuss risks and benefits. Non-pharmacological therapy preferred if mild-moderate.', safety: 'caution', alternative: 'CBT, interpersonal therapy as first-line for mild-moderate depression in pregnancy' },
      { trimester: 'second', adjustment: 'Continue antidepressant if clinically indicated. SSRIs are generally considered safe. Fluoxetine may be associated with slightly lower risk of PPHN compared to late-third-trimester exposure.', safety: 'caution' },
      { trimester: 'third', adjustment: 'Late-third-trimester SSRI use associated with persistent pulmonary hypertension of the newborn (PPHN, absolute risk 0.3% vs 0.1%) and neonatal adaptation syndrome (irritability, feeding difficulty, respiratory distress). Tapering before delivery may reduce neonatal syndrome but risks relapse.', safety: 'caution' },
      { trimester: 'all', adjustment: 'Postpartum depression: SSRIs are safe during breastfeeding (sertraline preferred). Screen at 2, 6, and 12 weeks postpartum. Edinburgh Postnatal Depression Scale (EPDS) for screening. Severe postpartum depression: ECT is safe and effective.', safety: 'safe' },
    ],
    aiReasoning: {
      presentationPattern: ['Patient presents with low mood, anhedonia, and sleep/appetite disturbance lasting >2 weeks with functional impairment', 'Symptoms often worse in the morning (diurnal variation)', 'May present with somatic complaints (pain, fatigue, GI symptoms) rather than mood complaints — especially in elderly and certain cultures', 'Patient may be brought by family concerned about withdrawal, irritability, or neglect of self-care', 'Often comorbid with anxiety — patient may present primarily with worry and physical symptoms'],
      keyFeatures: ['Core mood symptoms (low mood, anhedonia, hopelessness) must be present for >2 weeks', 'Neurovegetative symptoms (sleep, appetite, energy, concentration, psychomotor changes)', 'Guilt or worthlessness disproportionate to situation', 'Suicidal thoughts — always assess', 'Diurnal variation (worse in morning)', 'Functional impairment in social, occupational, or relational domains'],
      discriminatingQuestions: ['When did you last feel like yourself? What changed?', 'What is your mood like generally day to day? Do you still enjoy activities you used to?', 'How is your sleep – do you have trouble falling asleep, staying asleep, or waking early?', 'Have you had any thoughts that life is not worth living or that you would be better off dead?', 'Has there ever been a time when your mood was unusually elevated and you needed less sleep but felt full of energy?', 'Has any treatment been tried before? What helped? What did not?'],
      diagnosticAlgorithm: ['1. Screen with PHQ-9 or PHQ-2 (first 2 items: mood + anhedonia)', '2. If positive, confirm DSM-5-TR criteria: 5+ symptoms for >2 weeks including mood or anhedonia', '3. Assess severity (PHQ-9 score, functional impairment)', '4. Rule out bipolar disorder (screening for past manic/hypomanic episodes)', '5. Rule out medical causes (TSH, B12, folate, FBC, iron)', '6. Assess suicide risk (ideation, plan, intent, means, history)', '7. Determine episode type (first vs recurrent, single vs seasonal)', '8. Identify psychosocial stressors and supports', '9. Choose treatment level (watchful waiting, therapy, medication, combination)', '10. Plan follow-up and monitoring schedule'],
    },
    clinicalNoteTemplate: {
      sections: ['Patient identifiers', 'Presenting complaint', 'HPI (onset, duration, context, symptoms, functional impact)', 'PHQ-9 score', 'DSM-5-TR criteria checklist', 'Suicide risk assessment (ideation, plan, intent, means, protective factors)', 'Past psychiatric history (episodes, treatments, hospitalisations)', 'Family psychiatric history', 'Medical history (thyroid, anaemia, chronic illness)', 'Current medications', 'Substance use', 'Social history (relationships, work, accommodation, support)', 'Mental state examination', 'Differentials', 'Formulation', 'Risk management plan', 'Treatment plan', 'Follow-up'],
      consultantWording: 'This [age]-year-old [male/female] presents with a [first/recurrent] episode of major depression of [mild/moderate/severe] severity. The core features are [depressed mood, anhedonia, neurovegetative symptoms]. PHQ-9 score is [score]. Suicide risk is [low/moderate/high] based on [risk factors]. There is [no/partial/full] history of bipolar features. The formulation integrates [biological vulnerabilities, psychological factors, social stressors]. The recommended treatment is [antidepressant, psychological therapy, combined approach] with close monitoring of response and suicide risk.',
      exampleNote: 'A 35-year-old female presents with 6-week history of depressed mood, anhedonia, early morning wakening (4am), reduced appetite (lost 4kg), poor concentration, and excessive guilt about her children not doing well at school. PHQ-9 score 18. No suicidal ideation. Sleeps 4h/night with early wakening. No history of mania. Past: one episode of depression at age 28 treated with sertraline (responded well, stopped after 8 months). PMH: hypothyroidism (on levothyroxine). TSH normal. Start sertraline 50 mg PO daily for 1 week then increase to 100 mg. Continue levothyroxine. Refer for CBT. Safety plan agreed. Review in 2 weeks with PHQ-9.',
    },
  },

  // ─── Schizophrenia ──────────────────────────────────────────────────────────
  {
    id: 'schizophrenia',
    name: 'Schizophrenia',
    specialtyId: 'PSYCH', subspecialtyId: 'general-psychiatry', icd10: 'F20.9',
    epidemiology: {
      incidence: '15 per 100,000 person-years; 1.5 million new cases/year globally', prevalence: '0.3-0.7% lifetime prevalence (~50 million people worldwide)',
      ageDistribution: 'Peak onset: males 18-25 years, females 25-35 years; rare before 12 or after 50', genderPredilection: 'Males > Females (1.4:1); males have earlier onset and worse outcome',
      geographicDistribution: 'Worldwide; rates similar across populations; migrants have higher risk (social adversity hypothesis)', seasonality: 'Season of birth effect: winter/spring births slightly higher risk (maternal infection hypothesis)'
    },
    symptomWeights: [
      { symptom: 'delusions', weight: 9, prevalence: 80, category: 'major' },
      { symptom: 'hallucinations (auditory most common)', weight: 9, prevalence: 75, category: 'major' },
      { symptom: 'disorganised speech', weight: 8, prevalence: 65, category: 'major' },
      { symptom: 'grossly disorganised or catatonic behaviour', weight: 8, prevalence: 45, category: 'major' },
      { symptom: 'negative symptoms (alogia, avolition, asociality)', weight: 8, prevalence: 70, category: 'major' },
      { symptom: 'blunted or flat affect', weight: 7, prevalence: 65, category: 'major' },
      { symptom: 'social/occupational dysfunction', weight: 8, prevalence: 90, category: 'major' },
      { symptom: 'impaired insight', weight: 8, prevalence: 80, category: 'major' },
      { symptom: 'cognitive impairment (memory, attention, executive function)', weight: 7, prevalence: 85, category: 'minor' },
      { symptom: 'aggression or agitation', weight: 7, prevalence: 30, category: 'red_flag' },
      { symptom: 'suicidal ideation or behaviour', weight: 8, prevalence: 30, category: 'red_flag' },
    ],
    riskFactors: [
      { factor: 'Family history of schizophrenia (first-degree relative)', weight: 8.0, prevalence: 10 },
      { factor: 'Obstetric complications (hypoxia, prematurity, LBW)', weight: 3.0, prevalence: 25 },
      { factor: 'Advanced paternal age (>40 years)', weight: 2.5, prevalence: 10 },
      { factor: 'Cannabis use (especially during adolescence)', weight: 4.0, prevalence: 30 },
      { factor: 'Migration and ethnic minority status', weight: 3.5, prevalence: 15 },
      { factor: 'Childhood adversity or trauma', weight: 3.0, prevalence: 40 },
      { factor: 'Urban upbringing', weight: 2.5, prevalence: 60 },
      { factor: 'Maternal infection during pregnancy', weight: 2.0, prevalence: 10 },
    ],
    differentials: [
      { disease: 'Schizoaffective Disorder', likelihood: 20, distinguishingFeatures: ['Mood episodes (depression or mania) concurrent with psychotic symptoms', 'Psychosis present for >2 weeks without mood symptoms', 'Mood symptoms are a substantial part of the presentation'] },
      { disease: 'Bipolar I Disorder (manic phase with psychosis)', likelihood: 20, distinguishingFeatures: ['Mood episode is primary', 'Psychosis resolves with mood stabilisation', 'Grandiose delusions mood-congruent', 'Pressured speech instead of disorganised', 'Good inter-episode functioning'] },
      { disease: 'Substance-Induced Psychotic Disorder', likelihood: 15, distinguishingFeatures: ['Temporal relationship to substance use/withdrawal', 'Positive toxicology', 'Resolution within days-weeks of abstinence', 'Typically visual hallucinations (stimulants), paranoid delusions (cannabis)'] },
      { disease: 'Delusional Disorder', likelihood: 8, distinguishingFeatures: ['Non-bizarre delusions (realistic situations)', 'No hallucinations or negative symptoms', 'Minimal functional impairment outside delusional system', 'Better preserved social functioning'] },
      { disease: 'Major Depressive Disorder with Psychotic Features', likelihood: 10, distinguishingFeatures: ['Psychosis only during depressive episodes', 'Mood-congruent psychotic content (guilt, punishment)', 'Full remission between episodes', 'No negative symptoms'] },
      { disease: 'Post-Traumatic Stress Disorder with Dissociative Features', likelihood: 5, distinguishingFeatures: ['Trauma history', 'Flashbacks (not hallucinations)', 'Hyperarousal, avoidance, re-experiencing', 'Psychotic features are dissociative in nature', 'No formal thought disorder'] },
      { disease: 'Autism Spectrum Disorder', likelihood: 5, distinguishingFeatures: ['Lifelong pattern of social/communication deficits', 'No hallucinations/delusions', 'Restricted/repetitive behaviours', 'Onset in early childhood', 'No psychotic episodes'] },
    ],
    investigations: [
      { test: 'Positive and Negative Syndrome Scale (PANSS)', purpose: 'Assess symptom severity across positive, negative, and general psychopathology domains', timing: 'routine', positiveResult: 'Total score: mild 58-75, moderate 75-95, severe >95; positive subscale >21 indicates significant psychosis', negativeResult: 'Score <58 indicates minimal symptoms' },
      { test: 'Urine Toxicology Screen', purpose: 'Exclude substance-induced psychosis (especially cannabis, amphetamines, cocaine, PCP)', timing: 'emergency', positiveResult: 'Positive for psychoactive substances suggests substance-induced aetiology', negativeResult: 'Negative screen supports primary psychotic disorder' },
      { test: 'Thyroid Function Tests (TSH, fT4)', purpose: 'Rule out thyroid disorder causing psychotic symptoms', timing: 'routine', positiveResult: 'Abnormal TSH suggests metabolic cause', negativeResult: 'Normal thyroid function' },
      { test: 'FBC, U&E, LFT, Calcium', purpose: 'Screen for metabolic causes of psychosis and baseline for antipsychotic initiation', timing: 'routine', positiveResult: 'Electrolyte imbalance, liver disease, or hypercalcaemia may cause psychosis', negativeResult: 'Normal baseline' },
      { test: 'Serum Prolactin', purpose: 'Baseline before initiating prolactin-raising antipsychotics (risperidone, haloperidol, amisulpride)', timing: 'routine', positiveResult: 'Elevated prolactin may cause galactorrhoea, sexual dysfunction', negativeResult: 'Normal baseline' },
      { test: 'ECG', purpose: 'Baseline QTc assessment (antipsychotics prolong QTc; increased risk of TdP)', timing: 'urgent', positiveResult: 'QTc >450 ms (male) or >470 ms (female) increases risk of arrhythmia', negativeResult: 'Normal ECG' },
      { test: 'HIV Serology', purpose: 'Rule out HIV-associated neurocognitive disorder presenting with psychosis', timing: 'routine', positiveResult: 'HIV+; consider CNS infection as cause of psychosis', negativeResult: 'HIV-' },
    ],
    imaging: [
      { modality: 'CT Brain or MRI Brain', indication: 'First-episode psychosis, atypical presentation (neurological signs, late onset >40 years, cognitive decline)', findings: 'May show enlarged lateral ventricles, reduced grey matter volume (especially temporal and frontal lobes). Typically normal. Essential to exclude structural causes: tumour, stroke, MS, normal pressure hydrocephalus.', sensitivity: 70, specificity: 85, preparation: 'No contrast needed for CT; MRI with gadolinium if tumour suspected' },
    ],
    severityCriteria: [
      { criterion: 'Positive symptoms (delusions, hallucinations)', mild: 'Transient or mild delusions/hallucinations; patient doubts them', moderate: 'Frequent hallucinations/delusions, patient believes them, some insight', severe: 'Constant, pervasive delusions/hallucinations, poor insight, behaviour affected', critical: 'Bizarre/command hallucinations, dangerous behaviour driven by delusions' },
      { criterion: 'Negative symptoms', mild: 'Mild social withdrawal, reduced speech', moderate: 'Marked social withdrawal, limited self-care, minimal speech', severe: 'Unable to live independently, poor hygiene, no motivation', critical: 'Severe self-neglect, requires full care' },
      { criterion: 'Functioning', mild: 'Some impairment but can work/study with support', moderate: 'Unable to work, limited social contacts', severe: 'Requires supported accommodation, significant supervision', critical: 'Requires hospitalisation, unable to care for self' },
      { criterion: 'Insight', mild: 'Good insight, accepts diagnosis and treatment', moderate: 'Partial insight, ambivalent about treatment', severe: 'Poor insight, believes unwell due to external forces', critical: 'No insight, refuses all treatment, requires compulsory admission' },
      { criterion: 'Aggression/risk', mild: 'No aggression or risk', moderate: 'Mild agitation, verbal aggression only', severe: 'Physical aggression to objects or others, threat to others', critical: 'Serious violence, homicidal ideation, requires 1:1 or seclusion' },
      { criterion: 'Suicidality', mild: 'No suicidal thoughts', moderate: 'Passive suicidal ideation', severe: 'Active ideation with plan', critical: 'Suicide attempt or imminent risk' },
    ],
    diagnosticCriteria: [
      { name: 'DSM-5-TR Schizophrenia Diagnostic Criteria', type: 'required', description: 'Two or more of the following, each present for a significant portion of a 1-month period (or less if successfully treated): (1) delusions, (2) hallucinations, (3) disorganised speech, (4) grossly disorganised or catatonic behaviour, (5) negative symptoms. At least one must be (1), (2), or (3). Continuous signs persist for at least 6 months, with at least 1 month of active-phase symptoms (or less if successfully treated). Social/occupational dysfunction in work, interpersonal relations, or self-care. Schizoaffective disorder and mood disorder with psychotic features have been ruled out. Not attributed to substances or another medical condition.' },
    ],
    treatmentGuidelines: [
      {
        name: 'NICE Guidelines for Psychosis and Schizophrenia', source: 'National Institute for Health and Care Excellence (NICE)', year: 2023,
        firstLine: [
          { drug: 'Olanzapine', dose: '10-20 mg PO once daily (start 5-10 mg, titrate weekly)', route: 'PO', frequency: 'Once daily', duration: 'Indefinite maintenance', maxDose: '20 mg/day', hepaticAdjustment: 'Caution in hepatic impairment; reduce starting dose', pregnancyCategory: 'C', evidenceLevel: 'A' },
          { drug: 'Risperidone', dose: '4-6 mg PO once daily (start 1-2 mg, titrate slowly)', route: 'PO', frequency: 'Once daily (or divided)', duration: 'Indefinite maintenance', maxDose: '16 mg/day', renalAdjustment: 'Reduce dose in renal impairment (max 6 mg/day if CrCl <30)', pregnancyCategory: 'C', evidenceLevel: 'A' },
        ],
        stepProtocol: [
          { step: 1, therapy: 'First-episode psychosis (initial presentation)', details: 'Start oral second-generation antipsychotic at low dose: olanzapine 5-10 mg/day, risperidone 1-2 mg/day, or aripiprazole 10 mg/day. Titrate slowly. Monitor side effects closely. Offer CBT for psychosis alongside medication. Consider LAI only if adherence concern.', duration: '4-6 weeks trial at therapeutic dose', monitoring: ['PANSS or CGI-S q2-4 weeks', 'Side effect monitoring (EPS, sedation, weight gain, metabolic)', 'Prolactin (risperidone)', 'QTc (ECG)', 'Fasting glucose, lipids at baseline and 3 months', 'Weight weekly'], alternatives: ['Amisulpride 400-800 mg/day', 'Paliperidone 6-12 mg/day', 'Haloperidol 5-15 mg/day (higher EPS risk)'] },
          { step: 2, therapy: 'Acute exacerbation or first-line failure', details: 'If inadequate response at 4-6 weeks: increase to max tolerated dose or switch to another second-generation antipsychotic. If severe agitation: short-term benzodiazepine (lorazepam 1-2 mg PO/IM). Consider short-term antipsychotic IM if oral refused.', duration: '6-8 weeks', monitoring: ['PANSS at 6 weeks', 'Side effects monitoring', 'Metabolic parameters q3 months'] },
          { step: 3, therapy: 'Treatment-resistant schizophrenia (failed 2+ antipsychotics at adequate dose x 6 weeks each)', details: 'Start clozapine — gold standard for treatment-resistant schizophrenia. Start 12.5 mg once or twice daily, titrate slowly (25-50 mg/day increments) to target 300-450 mg/day (max 900 mg/day). Mandatory FBC monitoring: weekly x 18 weeks, then fortnightly x 52 weeks, then monthly. Clozapine registration required.', duration: 'Indefinite; trial for minimum 6 months at therapeutic dose', monitoring: ['FBC (WNL monitoring mandatory)', 'Clozapine level (target 350-600 ng/mL)', 'ECG (myocarditis risk first 4 weeks)', 'Temperature, pulse, BP (first 4 weeks)', 'Weight, glucose, lipids monthly x 3 then q3 months'], alternatives: ['Augmentation of clozapine with second antipsychotic (amisulpride, aripiprazole)', 'ECT augmentation for clozapine-resistant schizophrenia'] },
          { step: 4, therapy: 'Maintenance and relapse prevention', details: 'Continue antipsychotic at lowest effective dose indefinitely. LAI antipsychotic strongly recommended if history of non-adherence (risperidone LAI 25-50 mg IM q2 weeks, paliperidone palmitate 150 mg IM day 1 then 100 mg day 8 then 75-150 mg monthly, aripiprazole LAI 400 mg IM monthly). Psychosocial interventions: CBT, family therapy, social skills training, supported employment.', duration: 'Indefinite (minimum 2 years after first episode; lifelong after 2+ episodes)', monitoring: ['3-monthly psychiatric review', 'Metabolic monitoring (weight, glucose, lipids) q3-6 months', 'Prolactin annually (risperidone)', 'ECG annually', 'FBC (if on clozapine)', 'Adherence monitoring'], alternatives: ['Clozapine LAI not available; consider clozapine augmentation', 'Cognitive remediation therapy for cognitive symptoms'] },
        ],
        duration: 'First episode: minimum 2 years maintenance. 2+ episodes: lifelong.',
        monitoring: ['Psychotic symptom severity (PANSS, CGI-S)', 'Side effects (EPS, sedation, weight, metabolic, prolactin, QTc)', 'Adherence', 'Substance use', 'Social functioning', 'Cognitive function', 'Physical health (CV risk, metabolic syndrome)', 'Suicide risk', 'Clozapine FBC (if applicable)'],
      },
    ],
    admissionCriteria: [
      { indications: ['First presentation of acute psychosis for assessment and treatment initiation', 'Acute psychotic exacerbation with risk to self or others', 'Risk of self-harm or suicide', 'Inability to care for self (severe self-neglect)', 'Dangerous behaviour secondary to psychosis (command hallucinations, paranoia driven aggression)', 'Treatment refusal requiring compulsory admission under Mental Health Act', 'Clozapine initiation requiring monitoring'], level: 'ward', parameters: [{ param: 'PANSS positive subscale', threshold: '>21' }, { param: 'Aggression risk', threshold: 'Imminent risk' }, { param: 'Insight', threshold: 'Absent with treatment refusal' }, { param: 'Self-care', threshold: 'Unable to meet basic needs' }] },
      { indications: ['Clozapine-induced myocarditis (first 4 weeks)', 'Neuroleptic Malignant Syndrome', 'Catatonia requiring ECT and medical monitoring', 'Status epilepticus (rare, clozapine-induced seizures)'], level: 'HDU', parameters: [{ param: 'NMS criteria', threshold: '2+ major criteria present' }] },
    ],
    dischargeCriteria: {
      clinical: ['Psychotic symptoms significantly improved (PANSS reduction >30%)', 'No imminent risk of harm to self or others', 'Able to communicate basic needs', 'Accepting medication (or LAI in place)', 'Engaging with care team', 'No severe side effects requiring hospital monitoring', 'For first episode: 1-2 week observation with stability'],
      lab: ['Clozapine level therapeutic if applicable', 'FBC stable (clozapine)', 'Normal ECG or stable QTc <500 ms', 'Metabolic parameters stable'],
      social: ['Stable accommodation confirmed', 'Community mental health team follow-up arranged (within 72h)', 'Early intervention in psychosis (EIP) team referral for first episode', 'Medication supply for 2-4 weeks', 'Crisis plan and relapse prevention plan in place', 'Family/carer involved and aware', 'Benefits and housing sorted if applicable'],
    },
    complications: [
      { name: 'Suicide', incidence: 10, timeCourse: 'Lifetime risk 10%; highest in first year after diagnosis and after discharge from hospital', management: 'Clozapine (reduces suicide risk by 60-80%), risk monitoring, psychological support. InterSePT trial showed clozapine superior to olanzapine for suicide prevention.', redFlags: ['Previous suicide attempts', 'Male gender', 'High IQ', 'Early in illness course', 'Depressive symptoms', 'Post-psychotic depression', 'Hopelessness', 'Recent discharge'] },
      { name: 'Metabolic Syndrome', incidence: 40, timeCourse: 'Develops over first 3-6 months, especially with olanzapine and clozapine', management: 'Monitor weight, glucose, lipids at baseline and q3 months. Lifestyle interventions (diet, exercise). Consider metformin for antipsychotic-induced weight gain. Switch to lower-risk antipsychotic (aripiprazole, ziprasidone).', redFlags: ['Weight gain >7% in first month', 'New-onset diabetes', 'Severe hyperlipidaemia'] },
      { name: 'Tardive Dyskinesia', incidence: 20, timeCourse: 'Months to years after starting antipsychotic; risk increases with duration', management: 'Switch to clozapine (lowest TD risk). VMAT2 inhibitors: valbenazine 40-80 mg/day, deutetrabenazine 12-48 mg/day. Reduce or discontinue offending antipsychotic if possible.', redFlags: ['Oro-facial movements', 'Choreiform movements of trunk/extremities', 'Elderly', 'Female', 'Mood disorder', 'Prolonged antipsychotic use'] },
      { name: 'Neuroleptic Malignant Syndrome', incidence: 1, timeCourse: 'Develops over 24-72h of starting or increasing antipsychotic', management: 'Stop antipsychotic immediately. Supportive care (cooling, IV fluids). Dantrolene 2-3 mg/kg IV q6h or bromocriptine 2.5-10 mg PO q6h. Consider ECT for catatonic features. Transfer to ICU if severe.', redFlags: ['Hyperthermia (>38°C)', 'Rigidity', 'Autonomic instability (labile BP, tachycardia)', 'Altered consciousness', 'Raised CK (>1000 IU/L)', 'Leukocytosis'] },
      { name: 'Clozapine-Induced Myocarditis', incidence: 3, timeCourse: 'Highest risk in first 4 weeks of clozapine treatment', management: 'Stop clozapine immediately. Cardiology consultation. Echocardiogram, troponin, ECG. Supportive care.', redFlags: ['Chest pain', 'Dyspnoea', 'Fever', 'Tachycardia', 'Raised troponin', 'ECG changes', 'Pericardial effusion'] },
      { name: 'Clozapine-Induced Agranulocytosis', incidence: 1, timeCourse: 'Highest risk in first 18 weeks; risk continues throughout treatment', management: 'Stop clozapine immediately if neutrophils <1.5 x 10^9/L (or <1.0 x 10^9/L for benign ethnic neutropenia). Reverse barrier nursing. G-CSF if severe. Haematology referral. Cannot rechallenge.', redFlags: ['Sore throat, fever, malaise, mouth ulcers', 'Any sign of infection during clozapine therapy'] },
    ],
    followUp: { interval: 'First episode: weekly for 1 month, then fortnightly for 2 months, then monthly for 6 months, then quarterly. Established patients: monthly to quarterly.', duration: 'Lifelong', tests: ['PANSS/CGI q3-6 months', 'Weight, BMI, waist circumference q3 months', 'Fasting glucose, HbA1c, lipid profile q6-12 months', 'Prolactin annually (risperidone, haloperidol, amisulpride)', 'ECG annually', 'FBC (clozapine: weekly x18, fortnightly x52, then monthly)', 'Clozapine level if needed'], specialistReview: true, specialistTiming: 'Consultant psychiatrist review at least every 3 months. Clozapine clinic monitoring as per protocol. EIP team involvement for first 3 years.' },
    prognosis: 'Highly variable. First episode: 75% achieve remission with treatment, but 80% will relapse within 5 years without maintenance. With optimal treatment: 30% have good outcome (minimal symptoms, independent living), 30% moderate outcome (symptoms but functional), 30% poor outcome (chronic symptoms, disability). Clozapine response in 30-60% of treatment-resistant cases. Mortality 2-3x general population (suicide, metabolic disease, smoking). Poor prognostic factors: insidious onset, early age, male, cognitive deficits, negative symptoms, poor adherence, substance use, lack of family support. Good prognostic factors: acute onset, later onset, female, prominent positive symptoms, good pre-morbid function, adherence, family support.',
    emergencyFlags: [
      { condition: 'Acute psychosis with imminent violence risk (command hallucinations, severe paranoia)', action: 'Rapid tranquillisation (lorazepam 2 mg IM + haloperidol 5 mg IM). Consider seclusion if risk of harming others. Assess physical health. Mental Health Act assessment. 1:1 nursing.', timeCritical: '<30 minutes' },
      { condition: 'Neuroleptic Malignant Syndrome (hyperthermia, rigidity, autonomic instability, altered consciousness)', action: 'Stop all antipsychotics. Urgent transfer to medical/ICU setting. Cooling, IV fluids, dantrolene or bromocriptine.', timeCritical: '<1 hour' },
      { condition: 'Clozapine-induced myocarditis (first 4 weeks: chest pain, dyspnoea, fever, tachycardia)', action: 'Stop clozapine. Urgent ECG, troponin, echocardiogram. Cardiology review.', timeCritical: '<1 hour' },
      { condition: 'Clozapine-induced agranulocytosis (neutrophils <1.5 x 10^9/L)', action: 'Stop clozapine immediately. FBC confirmation. Reverse barrier nursing. Haematology review. G-CSF if severe. Notify clozapine monitoring service.', timeCritical: '<24 hours' },
      { condition: 'Acute dystonic reaction (oculogyric crisis, torticollis, laryngeal spasm)', action: 'Procyclidine 5-10 mg IM/IV or benztropine 1-2 mg IM/IV. Reassure patient. Laryngeal spasm is emergency (intubation may be needed). Reduce antipsychotic dose or switch.', timeCritical: '<15 minutes (laryngeal spasm: immediate)' },
    ],
    pediatricAdjustments: [
      { parameter: 'Diagnosis', adjustment: 'Schizophrenia in <18 years is rare (<1% of all cases). Must differentiate from developmental disorders, affective disorders, and substance use. Diagnosis requires specialist child and adolescent psychiatric assessment.', ageRange: '<18 years' },
      { parameter: 'Antipsychotic prescribing', adjustment: 'Only second-generation antipsychotics should be used in children/adolescents. Aripiprazole and risperidone are first-line. Lower starting doses and slower titration. More frequent metabolic monitoring.', ageRange: '<18 years' },
      { parameter: 'Clozapine use', adjustment: 'Clozapine is indicated for treatment-resistant schizophrenia in <18 years but requires specialist paediatric monitoring. Higher risk of myocarditis.', ageRange: '<18 years' },
      { parameter: 'Psychological interventions', adjustment: 'CBT adapted for developmental level. Family therapy essential. School liaison. Social skills training. Cognitive remediation.', ageRange: '<18 years' },
    ],
    pregnancyAdjustments: [
      { trimester: 'first', adjustment: 'Antipsychotics should generally be continued in pregnancy (risk of relapse > risk of medication). Fetal risk: small increased risk of congenital malformations (OR 1.2-1.5). Haloperidol and olanzapine have most safety data. Avoid polytherapy. Consider switching from high-risk agents (valproate, carbamazepine).', safety: 'caution', alternative: 'Olanzapine or haloperidol considered first-line in pregnancy' },
      { trimester: 'second', adjustment: 'Continue antipsychotic. Monitor gestational diabetes more frequently (olanzapine, clozapine, quetiapine increase risk). Consider dose adjustment as pregnancy progresses (volume of distribution increases).', safety: 'caution' },
      { trimester: 'third', adjustment: 'Antipsychotics may cause neonatal EPS and withdrawal (irritability, feeding difficulty, respiratory distress). Consider dose reduction nearer to term. Clozapine should be avoided in third trimester if possible (risk of neonatal agranulocytosis and seizures).', safety: 'caution' },
      { trimester: 'all', adjustment: 'Postpartum psychosis: highest risk in first 4 weeks postpartum (especially if bipolar diathesis). Prophylactic antipsychotic strongly recommended postpartum. Clozapine and breastfeeding: manufacturer advises avoid (accumulates in breast milk). Olanzapine: low levels in breast milk, compatible with monitoring. Breastfeeding: discuss risks/benefits.', safety: 'caution' },
    ],
    aiReasoning: {
      presentationPattern: ['First episode: insidious onset over months of social withdrawal, declining function, odd beliefs, and perceptual disturbances before frank psychosis emerges', 'Acute episode: florid delusions, hallucinations, disorganised behaviour leading to family/carer crisis', 'Patient may present via police or emergency services due to bizarre or aggressive behaviour in public', 'Negative symptoms may be the predominant presentation in chronic stages (social withdrawal, poverty of speech, lack of motivation)', 'Clozapine patient: regular monitoring for neutropenia, side effects (salivation, sedation, weight gain)'],
      keyFeatures: ['Positive symptoms: delusions (persecutory, referential, grandiose, bizarre) and hallucinations (auditory — commenting, conversing, command)', 'Negative symptom cluster: alogia, avolition, anhedonia, asociality, blunted affect — more impairing than positive symptoms', 'Disorganised speech: derailment, tangentiality, word salad, neologisms', 'Disorganised behaviour: unpredictable agitation, inappropriate affect, catatonia', 'Cognitive deficits: impaired attention, working memory, executive function, social cognition', 'Lack of illness awareness (insight) — a core barrier to treatment'],
      discriminatingQuestions: ['Are you hearing voices when no one is there? What do they say?', 'Do you believe there are people or forces trying to harm you or control your mind?', 'How long has this been happening? Did it start gradually or suddenly?', 'Have you used any drugs or alcohol recently?', 'Is there a family history of mental illness or psychosis?', 'Can you explain what you understand is happening and why your family brought you here today?', 'Have you ever felt depressed or had periods of unusually elevated mood?'],
      diagnosticAlgorithm: ['1. Establish presence of psychotic symptoms (delusions, hallucinations, disorganised speech/behaviour)', '2. Confirm DSM-5-TR criteria: 2+ symptoms for 1 month, 6 months total duration, functional decline', '3. Exclude substance-induced psychosis (toxicology, history)', '4. Exclude mood disorder with psychotic features (screen for mania and depression)', '5. Exclude medical/organic causes (TSH, FBC, U&E, LFT, HIV, neuroimaging)', '6. Assess risk (suicide, violence, self-neglect)', '7. Assess insight and capacity', '8. Determine episode type (first vs relapse, acute vs maintenance)', '9. Choose antipsychotic (consider side effect profile, adherence, patient preference)', '10. Establish monitoring schedule and psychosocial care plan'],
    },
    clinicalNoteTemplate: {
      sections: ['Patient identifiers', 'Informant & reliability', 'Chief complaint', 'HPI (onset, duration, progression, precipitants)', 'Positive symptom assessment (delusions, hallucinations)', 'Negative symptom assessment', 'Disorganisation assessment (speech, behaviour)', 'Insight and capacity assessment', 'Risk assessment (suicide, violence, self-neglect, exploitation)', 'Substance use history', 'Past psychiatric history (episodes, hospitalisations, treatments)', 'Family psychiatric history', 'Medical history', 'Medication history (current, past, responses, side effects)', 'Mental state examination (appearance, behaviour, speech, mood, affect, thought form/content, perception, cognition, insight)', 'Physical examination (including EPS, metabolic parameters)', 'Investigations (PANSS, labs, ECG, imaging)', 'DSM-5-TR criteria met', 'Differential diagnosis', 'Formulation (biopsychosocial)', 'Risk management plan', 'Treatment plan (medication, psychosocial, monitoring)', 'Follow-up and discharge planning'],
      consultantWording: 'This [age]-year-old [male/female] presents with a [first/recurrent] episode of psychosis. The clinical picture meets DSM-5-TR criteria for schizophrenia with [positive symptoms predominantly/negative symptoms predominantly/mixed]. The duration of untreated psychosis has been [weeks/months], which has prognostic implications. Insight is [good/partial/poor/absent]. The differential includes schizoaffective disorder, mood disorder with psychotic features, and substance-induced psychosis, which have been [excluded/are considered less likely]. The recommended treatment is [specific antipsychotic] with [dose and titration plan], alongside [CBT for psychosis/psychosocial interventions]. The patient requires [voluntary admission/compulsory admission under section/outpatient management].',
      exampleNote: 'A 22-year-old male presents with a 6-month history of gradual social withdrawal, declining grades, and increasingly bizarre beliefs (neighbours are monitoring him through the TV, government agents are following him). For past 3 weeks has been hearing commenting voices. No sleep, minimal food intake. PANSS positive score 28, negative 25, general 40. No manic or depressive symptoms. Insight: poor, believes paranoid beliefs are real. Risk: no suicide or violence. Urine toxicology negative. TSH, FBC, U&E, LFT normal. MRI brain normal. Diagnosis: first-episode schizophrenia. Plan: start olanzapine 5 mg nocte, titrate to 10 mg in 1 week. Offer CBT for psychosis. Refer to Early Intervention in Psychosis team. Admit informally for stabilisation. Baseline weight 72 kg, fasting glucose 5.0, lipids sent. ECG normal (QTc 420 ms). Weekly PANSS monitoring, weight, side effects.',
    },
  },

  // ─── Generalised Anxiety Disorder ───────────────────────────────────────────
  {
    id: 'generalised-anxiety-disorder',
    name: 'Generalised Anxiety Disorder',
    specialtyId: 'PSYCH', subspecialtyId: 'general-psychiatry', icd10: 'F41.1',
    epidemiology: {
      incidence: '1-2% annual incidence', prevalence: '2-5% 12-month prevalence; 5-10% lifetime prevalence',
      ageDistribution: 'Median onset 30 years; can present at any age; prevalence declines in elderly', genderPredilection: 'Female:Male 2:1',
      geographicDistribution: 'Worldwide; rates slightly higher in high-income countries', seasonality: 'No clear seasonal pattern; may worsen during winter (comorbid SAD)'
    },
    symptomWeights: [
      { symptom: 'excessive worry about multiple domains', weight: 10, prevalence: 95, category: 'major' },
      { symptom: 'difficulty controlling worry', weight: 9, prevalence: 90, category: 'major' },
      { symptom: 'muscle tension', weight: 7, prevalence: 75, category: 'major' },
      { symptom: 'restlessness or feeling on edge', weight: 8, prevalence: 80, category: 'major' },
      { symptom: 'fatigue', weight: 7, prevalence: 70, category: 'major' },
      { symptom: 'difficulty concentrating or mind going blank', weight: 7, prevalence: 70, category: 'major' },
      { symptom: 'irritability', weight: 6, prevalence: 65, category: 'major' },
      { symptom: 'sleep disturbance (difficulty falling/staying asleep)', weight: 8, prevalence: 75, category: 'major' },
      { symptom: 'autonomic arousal (palpitations, sweating, tremor)', weight: 6, prevalence: 55, category: 'minor' },
      { symptom: 'avoidance behaviour', weight: 6, prevalence: 50, category: 'minor' },
    ],
    riskFactors: [
      { factor: 'Family history of anxiety disorders', weight: 3.5, prevalence: 25 },
      { factor: 'History of childhood adversity or trauma', weight: 3.0, prevalence: 30 },
      { factor: 'Personality traits (neuroticism, harm avoidance)', weight: 3.5, prevalence: 40 },
      { factor: 'Chronic medical illness', weight: 2.5, prevalence: 35 },
      { factor: 'Stressful life events (financial, relationship, work)', weight: 3.0, prevalence: 60 },
      { factor: 'Female gender', weight: 2.5, prevalence: 65 },
      { factor: 'Comorbid depression or other anxiety disorders', weight: 4.0, prevalence: 50 },
    ],
    differentials: [
      { disease: 'Major Depressive Disorder with Anxiety', likelihood: 25, distinguishingFeatures: ['Depressed mood and anhedonia predominate', 'Worry is focused on negative self-evaluation', 'Neurovegetative symptoms (sleep, appetite, energy) more prominent', 'MDD should be treated first if present'] },
      { disease: 'Panic Disorder', likelihood: 15, distinguishingFeatures: ['Recurrent unexpected panic attacks', 'Fear of having more attacks', 'Acute episodic symptoms vs chronic worry', 'Less worry about general life domains'] },
      { disease: 'Social Anxiety Disorder', likelihood: 12, distinguishingFeatures: ['Fear/anxiety limited to social situations', 'Fear of negative evaluation', 'Avoidance of social/performance situations', 'Worry not generalised to multiple domains'] },
      { disease: 'Obsessive-Compulsive Disorder', likelihood: 8, distinguishingFeatures: ['Obsessions (recurrent intrusive thoughts) and compulsions (repetitive behaviours)', 'Worry is about specific obsessional themes', 'Recognition that thoughts are product of own mind', 'Ritualistic behaviours to neutralise anxiety'] },
      { disease: 'Health Anxiety / Illness Anxiety Disorder', likelihood: 8, distinguishingFeatures: ['Worry focused specifically on health and illness', 'Repeated medical consultations', 'Hypervigilance to body sensations', 'Not generalised to other domains'] },
      { disease: 'Hyperthyroidism', likelihood: 8, distinguishingFeatures: ['Weight loss despite increased appetite', 'Heat intolerance', 'Tachycardia, palpitations, tremor', 'Goitre on examination', 'Abnormal TSH/fT4'] },
      { disease: 'Post-Traumatic Stress Disorder', likelihood: 5, distinguishingFeatures: ['Link to traumatic event', 'Re-experiencing, avoidance, hyperarousal', 'Nightmares and flashbacks', 'Not present before trauma'] },
    ],
    investigations: [
      { test: 'Generalised Anxiety Disorder-7 (GAD-7)', purpose: 'Screen for GAD and assess severity', timing: 'routine', sensitivity: 89, specificity: 82, positiveResult: 'Score >=10 indicates probable GAD; >=15 moderately severe; >=20 severe', negativeResult: 'Score <5 makes GAD less likely' },
      { test: 'Thyroid Function Tests (TSH, fT4)', purpose: 'Rule out hyperthyroidism causing anxiety symptoms', timing: 'routine', positiveResult: 'Low TSH + high fT4 suggests hyperthyroidism', negativeResult: 'Normal thyroid function' },
      { test: 'ECG', purpose: 'Rule out arrhythmia and baseline before starting medication (SSRI/SNRI)', timing: 'routine', positiveResult: 'Arrhythmia, ischaemia, or prolonged QTc', negativeResult: 'Normal ECG' },
      { test: 'FBC, U&E, Calcium, Glucose', purpose: 'Screen for metabolic causes of anxiety', timing: 'routine', positiveResult: 'Abnormal finding suggests medical cause', negativeResult: 'Normal' },
      { test: 'Urine Toxicology', purpose: 'Exclude substance-induced anxiety (stimulants, caffeine, cannabis)', timing: 'routine', positiveResult: 'Positive for stimulants/other drugs suggests substance-induced aetiology', negativeResult: 'Negative screen' },
    ],
    imaging: [
      { modality: 'None routinely indicated', indication: 'Only if neurological signs/symptoms or atypical presentation (new onset in elderly, cognitive decline)', findings: 'Typically normal. May show non-specific white matter changes unrelated to GAD.', sensitivity: 0, specificity: 0 },
    ],
    severityCriteria: [
      { criterion: 'GAD-7 Score', mild: '5-9', moderate: '10-14', severe: '15-19', critical: '>=20' },
      { criterion: 'Worry frequency/control', mild: 'Worries some days, can control', moderate: 'Worries most days, difficulty controlling', severe: 'Worries daily, unable to control', critical: 'Constant worry, incapacitating' },
      { criterion: 'Functional impairment', mild: 'Some interference with daily life', moderate: 'Marked interference, avoids some activities', severe: 'Unable to work or maintain relationships', critical: 'Housebound, requires daily support' },
      { criterion: 'Physical symptoms', mild: 'Mild muscle tension, occasional restlessness', moderate: 'Moderate physical symptoms, autonomic arousal', severe: 'Severe muscle tension, headache, fatigue, poor sleep', critical: 'Debilitating physical symptoms, unable to relax' },
      { criterion: 'Comorbid depression', mild: 'None or mild depressive symptoms', moderate: 'Mild-moderate depression', severe: 'Moderate-severe depression', critical: 'Severe depression with risk concerns' },
      { criterion: 'Safety', mild: 'No risk', moderate: 'No risk', severe: 'Mild suicidal ideation', critical: 'Active suicidal ideation with plan/intent' },
    ],
    diagnosticCriteria: [
      { name: 'DSM-5-TR Generalised Anxiety Disorder Criteria', type: 'required', description: 'Excessive anxiety and worry (apprehensive expectation) occurring more days than not for at least 6 months, about a number of events or activities (such as work or school performance). The individual finds it difficult to control the worry. The anxiety and worry are associated with three or more of the following six symptoms (with at least some symptoms present for more days than not in the past 6 months): (1) restlessness or feeling keyed up/on edge, (2) being easily fatigued, (3) difficulty concentrating or mind going blank, (4) irritability, (5) muscle tension, (6) sleep disturbance. The anxiety/worry/associated physical symptoms cause clinically significant distress or impairment. Not attributable to a substance, medication, or another medical condition. Not better explained by another mental disorder.' },
    ],
    treatmentGuidelines: [
      {
        name: 'NICE Guidelines for Generalised Anxiety Disorder', source: 'National Institute for Health and Care Excellence (NICE)', year: 2023,
        firstLine: [
          { drug: 'Sertraline', dose: '50 mg PO once daily, increase up to 200 mg if needed', route: 'PO', frequency: 'Once daily', duration: '6-12 months minimum', maxDose: '200 mg/day', renalAdjustment: 'No adjustment needed', pregnancyCategory: 'C', evidenceLevel: 'A' },
          { drug: 'Escitalopram', dose: '10 mg PO once daily, increase to 20 mg if needed', route: 'PO', frequency: 'Once daily', duration: '6-12 months minimum', maxDose: '20 mg/day', renalAdjustment: 'Caution in severe renal impairment', pregnancyCategory: 'C', evidenceLevel: 'A' },
        ],
        stepProtocol: [
          { step: 1, therapy: 'Mild GAD (GAD-7 <10, minimal functional impairment)', details: 'Primary care: psychoeducation about GAD (link between worry and physical symptoms). Sleep hygiene. Problem-solving therapy. Signposting to low-intensity psychological interventions: online CBT (iworry, Beating the Blues), guided self-help x 6-8 sessions. Consider 1:1 CBT if no response.', duration: '4-8 weeks', monitoring: ['GAD-7 q2-4 weeks', 'Sleep diary', 'Worry diary'] },
          { step: 2, therapy: 'Moderate GAD (GAD-7 10-14, moderate functional impairment)', details: 'High-intensity psychological therapy: CBT for GAD (12-20 sessions). OR pharmacological: SSRI first-line (sertraline 50 mg/day or escitalopram 10 mg/day). Start at low dose (sertraline 25 mg) and titrate slowly to minimise initial anxiety. Review in 2 weeks. Warn about initial activation. Consider combination of CBT + SSRI for better outcomes.', duration: 'CBT: 12-20 sessions over 3-6 months. Medication: 6-12 weeks acute phase.', monitoring: ['GAD-7 q2-4 weeks', 'Side effect monitoring', 'Suicidality assessment (especially first 2 weeks of SSRI)', 'Medication adherence'], alternatives: ['Pregabalin 150-600 mg/day (NICE second-line)', 'CBT-based interventions'] },
          { step: 3, therapy: 'Severe GAD (GAD-7 >=15, marked impairment) or failed 1 SSRI', details: 'Optimise SSRI dose (sertraline 200 mg, escitalopram 20 mg). If failed or intolerant: SNRI-first line (duloxetine 60-120 mg/day, venlafaxine 75-225 mg/day). OR pregabalin 150-600 mg/day (caution: dependence potential, dizziness, sedation). CBT if not already tried. Augmentation options: CBT + medication combined.', duration: '6-8 weeks per adequate drug trial', monitoring: ['GAD-7 q2-4 weeks', 'BP (venlafaxine)', 'Weight', 'Side effects'], alternatives: ['Duloxetine 60-120 mg/day', 'Pregabalin 150-600 mg/day', 'Buspirone 15-60 mg/day (less effective but well tolerated)'] },
          { step: 4, therapy: 'Treatment-refractory GAD (failed 2+ pharmacological trials + CBT)', details: 'Augmentation strategies: add aripiprazole 2-10 mg/day or quetiapine XR 50-300 mg/day. Consider pregabalin augmentation. Specialist referral (psychiatry). Comorbidity screen (bipolar, OCD, PTSD). Consider TMS or psychiatric rehabilitation if severely disabled.', duration: '8-12 weeks', monitoring: ['Full psychiatric review', 'Metabolic monitoring if antipsychotic augmentation', 'ECG', 'Substance use screen'], alternatives: ['Quetiapine XR monotherapy 50-300 mg/day', 'Agomelatine 25-50 mg/day', 'Benzodiazepines: SHORT TERM ONLY (<4 weeks) for crisis management — high dependence risk'] },
        ],
        duration: 'Medication: 6-12 months after response (minimum). CBT: 12-20 sessions. Relapse risk 40% if medication stopped before 6 months.',
        monitoring: ['GAD-7 at each visit', 'Functional status (work, relationships, social)', 'Side effect monitoring', 'Suicide risk (comorbid depression common)', 'Substance use (alcohol, benzodiazepines — self-medication risk)', 'Sleep quality', 'Physical health (tension headache, IBS, fatigue)'],
      },
    ],
    admissionCriteria: [
      { indications: ['GAD with acute deterioration and inability to function', 'Suicidal ideation with plan (comorbid depression)', 'Complicated detox from benzodiazepine dependence', 'Severe comorbid physical health deterioration due to anxiety', 'Intensive CBT/residential treatment programme'], level: 'ward', parameters: [{ param: 'GAD-7', threshold: '>=20 with functional impairment' }, { param: 'Suicidality', threshold: 'Active with intent' }] },
    ],
    dischargeCriteria: {
      clinical: ['GAD-7 <10 or 50% reduction from admission', 'Able to manage daily activities with support', 'No acute suicidal ideation', 'CBT engagement established or in progress', 'Medication regimen optimised and tolerated', 'Coping strategies in place'],
      lab: ['Normal TSH (if abnormal contributed to presentation)', 'Normal ECG'],
      social: ['Community follow-up arranged (GP or psychiatrist)', 'CBT scheduled', 'Crisis plan in place', 'Medication supply for 2 weeks', 'Work/occupational plan', 'Carer/family aware if appropriate'],
    },
    complications: [
      { name: 'Comorbid Depression', incidence: 60, timeCourse: 'Lifetime comorbidity 60%; may develop at any point', management: 'Treat depression first if severe (antidepressant + CBT). GAD often improves with depression-specific treatment. Suicide risk assessment essential.', redFlags: ['Low mood', 'Anhedonia', 'Hopelessness', 'Suicidal thoughts', 'Poor sleep', 'Poor appetite'] },
      { name: 'Benzodiazepine Dependence', incidence: 30, timeCourse: 'Dependence develops within 4-8 weeks of regular benzodiazepine use', management: 'Avoid benzodiazepines except for short-term crisis (<4 weeks). For dependence: slow taper (5-10% reduction every 1-2 weeks over 6-12 months). Switch to long-acting benzodiazepine (diazepam equivalent). Specialist detox if complicated.', redFlags: ['Use >4 weeks', 'Escalating dose', 'Doctor shopping', 'Withdrawal symptoms between doses', 'Alcohol misuse'] },
      { name: 'Alcohol and Substance Misuse', incidence: 25, timeCourse: 'Often develops as self-medication for chronic anxiety', management: 'Screen all patients (AUDIT, DUDIT). Treat comorbid anxiety AND substance use. Integrated care. SSRI can be started during detox. Specialist dual diagnosis service.', redFlags: ['Regular alcohol use to manage anxiety', 'Increasing tolerance', 'Withdrawal symptoms', 'Failed detox attempts'] },
      { name: 'Impaired Quality of Life and Disability', incidence: 40, timeCourse: 'Chronic; develops over years', management: 'Vocational rehabilitation, CBT, graded exposure, occupational therapy. Address disability benefits and workplace accommodations.', redFlags: ['Long-term sick leave', 'Social withdrawal', 'Unable to leave house', 'Complete dependence on others'] },
    ],
    followUp: { interval: 'Medication: 2 weeks after initiation, then 4 weekly until stable, then 8-12 weekly. CBT: weekly sessions during active therapy.', duration: '6-12 months after remission (medication). CBT: follow-up sessions at 1, 3, and 6 months after completion.', tests: ['GAD-7 at each visit', 'PHQ-9 (screen for comorbid depression)', 'Medication monitoring as needed'], specialistReview: true, specialistTiming: 'Refer to psychiatrist if: failed 2+ antidepressants, severe or treatment-refractory, comorbid depression or substance use, atypical presentation, need for specialist CBT.' },
    prognosis: 'GAD is a chronic, fluctuating disorder with high comorbidity. With treatment: 50-60% respond to first-line treatment; 70-80% eventually respond. Relapse rate 40% within 1 year of stopping medication. Complete remission is less common than in MDD (30-40% achieve remission). Prognostic factors for good outcome: early treatment, good social support, no personality disorder comorbidity, engagement in CBT. Poor outcome: comorbid depression, substance use, long duration before treatment, severe functional impairment at baseline.',
    emergencyFlags: [
      { condition: 'Acute suicide attempt or imminent risk (comorbid depression)', action: 'Emergency psychiatric assessment, hospitalisation, 1:1 nursing', timeCritical: 'Immediate' },
      { condition: 'Severe benzodiazepine withdrawal (seizures, delirium, psychosis)', action: 'Urgent medical assessment, restart benzodiazepine, diazepam load. ICU if seizures. Monitor for cardiovascular instability.', timeCritical: '<1 hour' },
      { condition: 'Panic attack with severe autonomic symptoms (possible cardiac differential)', action: 'ECG, cardiac enzymes to rule out ACS. Reassure. Benzodiazepine (lorazepam 1 mg PO/SL) for acute panic. If first presentation, rule out medical causes.', timeCritical: '<30 minutes' },
      { condition: 'Serotonin Syndrome (if on SSRI/SNRI with overdose or interaction)', action: 'Stop serotonergic agent, supportive care, cyproheptadine, ICU if severe', timeCritical: '<1 hour' },
    ],
    pediatricAdjustments: [
      { parameter: 'Diagnosis', adjustment: 'GAD in children may present with excessive worry about school performance, friendships, and family. Somatic symptoms (headache, stomach ache) more common. Separation anxiety may be prominent.', ageRange: '<18 years' },
      { parameter: 'Psychological therapy', adjustment: 'CBT is first-line. Family-based CBT. School involvement. Parental training. No medication unless severe or CBT inadequate.', ageRange: '<18 years' },
      { parameter: 'Pharmacotherapy', adjustment: 'SSRI (fluoxetine or sertraline) only for moderate-severe after CBT trial. Lower starting doses. Black box warning: increased suicidal ideation in first weeks. Monitor weekly.', ageRange: '<18 years' },
    ],
    pregnancyAdjustments: [
      { trimester: 'first', adjustment: 'CBT is first-line for GAD in pregnancy (no medication exposure). SSRI risks (small increase in cardiac malformations, particularly paroxetine). Sertraline has best safety profile if medication needed.', safety: 'safe', alternative: 'CBT is first-line in pregnancy' },
      { trimester: 'second', adjustment: 'Continue SSRI if clinically indicated. Psychological therapy preferred. Sertraline, fluoxetine, citalopram have most safety data.', safety: 'safe' },
      { trimester: 'third', adjustment: 'SSRI continuation associated with PPHN (absolute risk 0.3% vs 0.1%) and neonatal adaptation syndrome. Tapering may be considered near term but relapse risk must be balanced.', safety: 'caution' },
      { trimester: 'all', adjustment: 'Postpartum anxiety: screen with EPDS (includes anxiety items). CBT first-line. Sertraline safe in breastfeeding. Pregabalin not recommended in pregnancy/breastfeeding.', safety: 'safe' },
    ],
    aiReasoning: {
      presentationPattern: ['Patient presents with chronic excessive worry about multiple domains (health, finances, relationships, work) occurring more days than not for >6 months', 'Worry is difficult to control — patient recognises it is excessive but cannot stop', 'Associated with physical tension, restlessness, fatigue, irritability, and poor sleep', 'May present with physical symptoms (headache, muscle pain, IBS-like symptoms) before psychological symptoms', 'Often comorbid with depression — patient may present primarily with low mood', 'Frequent healthcare utilisation (GP visits, emergency department) for physical symptoms of anxiety'],
      keyFeatures: ['Excessive worry about multiple everyday concerns for >6 months', 'Difficulty controlling the worry — feels driven by it', 'Muscle tension, restlessness, and sleep disturbance are hallmark physical symptoms', 'Fatigue secondary to constant state of hyperarousal', 'Worry content shifts from domain to domain (not fixed like OCD)', 'Onset typically gradual in adulthood (median 30 years) with chronic fluctuating course'],
      discriminatingQuestions: ['What do you find yourself worrying about most days? Can you control the worrying once it starts?', 'How long have you felt this way? Did it start gradually?', 'Do you also feel panicky with racing heart and shortness of breath? (suggests panic attacks)', 'Are you avoiding any situations because of anxiety?', 'How is your sleep — difficulty falling asleep because of racing mind?', 'Do you ever use alcohol, cannabis, or other drugs to calm down?', 'Have you seen a doctor for these physical symptoms — headaches, muscle pain, stomach problems?'],
      diagnosticAlgorithm: ['1. Screen with GAD-7 (if >=10 proceed)', '2. Confirm DSM-5-TR criteria: excessive worry >6 months, 3+ associated symptoms, difficult to control', '3. Rule out medical causes (TSH, FBC, U&E, glucose, ECG)', '4. Exclude substance-induced anxiety (caffeine, stimulants, alcohol withdrawal, cannabis)', '5. Assess for comorbid depression (PHQ-9)', '6. Distinguish from panic disorder, social anxiety, OCD, PTSD', '7. Assess functional impairment', '8. Assess risk (suicide, substance use, dependence on benzodiazepines)', '9. Determine treatment level (psychological vs pharmacological vs combined)', '10. Arrange monitoring and follow-up'],
    },
    clinicalNoteTemplate: {
      sections: ['Patient identifiers', 'Presenting complaint', 'HPI (onset, duration, triggers, worry domains, symptom progression)', 'GAD-7 score', 'DSM-5-TR criteria checklist', 'Comorbid depression screening (PHQ-9)', 'Suicide risk assessment', 'Physical symptom review (headache, IBS, muscle tension, fatigue, sleep)', 'Substance use (alcohol, caffeine, benzodiazepines, cannabis)', 'Past psychiatric history', 'Medical history (thyroid, cardiac, GI)', 'Mental state examination', 'Differentials', 'Formulation', 'Treatment plan (CBT, medication, combined)', 'Monitoring plan', 'Follow-up'],
      consultantWording: 'This [age]-year-old [male/female] presents with a [duration] history of excessive, difficult-to-control worry across multiple domains, meeting DSM-5-TR criteria for Generalised Anxiety Disorder. The GAD-7 score is [score], indicating [mild/moderate/severe] severity. There is [no/mild/moderate/severe] functional impairment and [no/comorbid] depressive symptoms. The physical symptoms of anxiety are [prominent/well controlled]. The patient has [good/partial/poor] understanding of the condition. The recommended approach is [CBT/SSRI/combined treatment] with close monitoring of response and any emerging depressive symptoms.',
      exampleNote: 'A 42-year-old female presents with a 2-year history of excessive worry about her children\'s health, her husband\'s job security, her own health (despite normal checkups), and household finances. She finds it impossible to stop worrying. She sleeps 5h/night (difficulty falling asleep due to racing thoughts), has daily tension headaches and neck pain, feels restless and irritable with her family. GAD-7 score 17. PHQ-9 score 8 (mild depressive symptoms). TSH normal. ECG normal. No suicidal ideation. No alcohol or substance use. No previous mental health treatment. Diagnosis: GAD, moderate-severe. Plan: (1) Start sertraline 25 mg PO daily for 1 week then increase to 50 mg — warn about initial activation. (2) Refer for CBT for GAD (15 sessions). (3) Sleep hygiene advice. (4) Review in 2 weeks with GAD-7 and PHQ-9. (5) Crisis plan discussed.',
    },
  },

  // ─── Alcohol Dependence / Withdrawal ─────────────────────────────────────────
  {
    id: 'alcohol-dependence-withdrawal',
    name: 'Alcohol Dependence / Withdrawal',
    specialtyId: 'PSYCH', subspecialtyId: 'addiction', icd10: 'F10.20',
    epidemiology: {
      incidence: '8 per 1,000 person-years (dependence); alcohol withdrawal affects 50% of dependent individuals', prevalence: '4-5% lifetime prevalence of alcohol dependence; 15-20% of hospitalised patients have alcohol use disorder',
      ageDistribution: 'Peak 20-40 years; withdrawal more common in middle-aged and elderly drinkers', genderPredilection: 'Male:Female 3:1 (but gap narrowing)',
      geographicDistribution: 'Worldwide; highest rates in Eastern Europe and Russia; lowest in Middle East and North Africa', seasonality: 'Increased consumption during holiday seasons; withdrawal presentations increase in January'
    },
    symptomWeights: [
      { symptom: 'craving (strong desire/urge to drink)', weight: 8, prevalence: 90, category: 'major' },
      { symptom: 'tremor', weight: 7, prevalence: 75, category: 'major' },
      { symptom: 'autonomic hyperactivity (sweating, tachycardia >100)', weight: 7, prevalence: 65, category: 'major' },
      { symptom: 'nausea or vomiting', weight: 6, prevalence: 55, category: 'minor' },
      { symptom: 'insomnia', weight: 6, prevalence: 70, category: 'major' },
      { symptom: 'anxiety', weight: 6, prevalence: 70, category: 'major' },
      { symptom: 'psychomotor agitation', weight: 7, prevalence: 50, category: 'major' },
      { symptom: 'transient visual/tactile/auditory hallucinations', weight: 8, prevalence: 25, category: 'red_flag' },
      { symptom: 'grand mal seizures', weight: 9, prevalence: 10, category: 'red_flag' },
      { symptom: 'delirium tremens (confusion, disorientation, severe autonomic instability)', weight: 10, prevalence: 5, category: 'red_flag' },
      { symptom: 'tolerance (need for markedly increased amounts)', weight: 7, prevalence: 85, category: 'major' },
    ],
    riskFactors: [
      { factor: 'Heavy daily alcohol consumption (>60 g/day ethanol)', weight: 5.0, prevalence: 20 },
      { factor: 'Long duration of drinking (>10 years)', weight: 4.0, prevalence: 50 },
      { factor: 'Previous episodes of withdrawal or detoxification', weight: 6.0, prevalence: 40 },
      { factor: 'Family history of alcohol dependence', weight: 3.0, prevalence: 30 },
      { factor: 'Male gender', weight: 2.5, prevalence: 75 },
      { factor: 'Comorbid psychiatric disorder (depression, anxiety, PTSD)', weight: 3.5, prevalence: 40 },
      { factor: 'Low socioeconomic status and unemployment', weight: 2.5, prevalence: 30 },
    ],
    differentials: [
      { disease: 'Alcohol Dependence', likelihood: 60, distinguishingFeatures: ['Loss of control over drinking', 'Tolerance', 'Withdrawal symptoms', 'Continued use despite harm', 'CAGE: 2+ positive = likely dependence'] },
      { disease: 'Sedative/Hypnotic (Benzodiazepine) Withdrawal', likelihood: 10, distinguishingFeatures: ['Benzodiazepine use history', 'Similar withdrawal syndrome', 'May be indistinguishable without history', 'Longer duration of withdrawal symptoms'] },
      { disease: 'Delirium (Other Cause)', likelihood: 8, distinguishingFeatures: ['No history of heavy alcohol use', 'Normal CDT/GGT', 'Other causes present (infection, metabolic, medication)', 'No autonomic features typical of withdrawal'] },
      { disease: 'Anxiety Disorder or Panic Disorder', likelihood: 5, distinguishingFeatures: ['Anxiety predates heavy drinking', 'No tolerance or withdrawal', 'Alcohol use may be self-medication', 'Not primarily about loss of control over drinking'] },
      { disease: 'Hepatic Encephalopathy', likelihood: 5, distinguishingFeatures: ['Jaundice, ascites, spider naevi', 'Flapping tremor (asterixis)', 'Abnormal LFTs, raised ammonia', 'No craving, tolerance, or withdrawal pattern', 'Confusion is persistent, not fluctuating'] },
      { disease: 'Wernicke Encephalopathy / Korsakoff Syndrome', likelihood: 5, distinguishingFeatures: ['Confusion, ataxia, ophthalmoplegia (classic triad)', 'Confabulation in Korsakoff', 'Responds to IV thiamine', 'May coexist with alcohol withdrawal'] },
    ],
    investigations: [
      { test: 'CIWA-Ar (Clinical Institute Withdrawal Assessment for Alcohol — revised)', purpose: 'Assess severity of alcohol withdrawal and guide benzodiazepine dosing', timing: 'emergency', positiveResult: 'Score <10: mild withdrawal. 10-19: moderate. >20: severe withdrawal. >25: risk of DTs.', negativeResult: 'Score <8: minimal withdrawal, may not require medication' },
      { test: 'AUDIT (Alcohol Use Disorders Identification Test)', purpose: 'Screen for alcohol use disorders and assess severity', timing: 'routine', sensitivity: 85, specificity: 90, positiveResult: 'Score 8-15: hazardous drinking. 16-19: harmful drinking. >=20: alcohol dependence.', negativeResult: 'Score <8: low-risk drinking' },
      { test: 'CAGE Questionnaire', purpose: 'Brief screen for alcohol dependence in clinical settings', timing: 'routine', sensitivity: 80, specificity: 90, positiveResult: '2+ "yes" answers = alcohol dependence likely', negativeResult: '0-1 "yes" = dependence unlikely but does not exclude hazardous drinking' },
      { test: 'LFTs (GGT, ALT, AST, MCV, CDT)', purpose: 'Detect alcohol-induced liver damage and heavy drinking biomarkers', timing: 'routine', positiveResult: 'Elevated GGT (most sensitive), AST:ALT >2:1, raised MCV, CDT >1.7% suggests heavy consumption', negativeResult: 'Normal LFTs do not exclude heavy drinking' },
      { test: 'FBC (including MCV)', purpose: 'Detect macrocytosis (chronic alcohol biomarker)', timing: 'routine', positiveResult: 'MCV >100 fL suggests chronic heavy alcohol use (also B12/folate deficiency)', negativeResult: 'Normal MCV does not exclude alcohol use disorder' },
      { test: 'Full Electrolytes, B12, Thiamine Level', purpose: 'Screen for electrolyte abnormalities and thiamine deficiency', timing: 'urgent', positiveResult: 'Low K+, Mg2+, PO4, or thiamine deficiency', negativeResult: 'Normal' },
      { test: 'Urine Toxicology', purpose: 'Exclude co-ingested substances', timing: 'urgent', positiveResult: 'Other substances detected', negativeResult: 'Negative' },
    ],
    imaging: [
      { modality: 'CT Head', indication: 'First seizure in known alcoholic, head injury, focal neurological signs, or delirium not resolving with benzodiazepines', findings: 'May show generalised atrophy, cerebellar atrophy (superior vermis). May reveal subdural haematoma (common in alcoholics due to falls). Wernicke encephalopathy may show MRI changes (periaqueductal, thalamic signal change).', sensitivity: 75, specificity: 90 },
    ],
    severityCriteria: [
      { criterion: 'CIWA-Ar Score', mild: '<10', moderate: '10-19', severe: '20-25', critical: '>25 (imminent DTs)' },
      { criterion: 'Autonomic symptoms (HR, BP, sweating)', mild: 'HR <100, mild diaphoresis', moderate: 'HR 100-120, BP elevated, moderate sweating', severe: 'HR >120, BP labile, profuse sweating', critical: 'HR >140, severe hypertension/hypotension, severe autonomic storm' },
      { criterion: 'Tremor', mild: 'Fine tremor', moderate: 'Coarse tremor, arms extended', severe: 'Severe tremor, interferes with function', critical: 'Generalised tremor with agitation' },
      { criterion: 'Hallucinations', mild: 'None', moderate: 'Transient visual/tactile', severe: 'Persistent hallucinations with insight', critical: 'Hallucinations without insight, command hallucinations' },
      { criterion: 'Seizures', mild: 'None', moderate: 'None', severe: 'Single seizure', critical: 'Multiple seizures or status epilepticus' },
      { criterion: 'Consciousness/orientation', mild: 'Fully alert and oriented', moderate: 'Alert but mildly disoriented', severe: 'Disoriented to time/place', critical: 'Delirium/confusion (delirium tremens)' },
    ],
    diagnosticCriteria: [
      { name: 'DSM-5-TR Alcohol Use Disorder Criteria', type: 'required', description: 'A problematic pattern of alcohol use leading to clinically significant impairment or distress, as manifested by at least 2 of the following occurring within a 12-month period: (1) alcohol taken in larger amounts or over longer period than intended, (2) persistent desire or unsuccessful efforts to cut down, (3) great deal of time spent obtaining/using/recovering, (4) craving, (5) recurrent use resulting in failure to fulfil major role obligations, (6) continued use despite persistent social/interpersonal problems, (7) important activities given up or reduced, (8) recurrent use in physically hazardous situations, (9) continued use despite knowledge of physical/psychological problem caused by alcohol, (10) tolerance, (11) withdrawal. Specifiers: mild (2-3), moderate (4-5), severe (6+).' },
      { name: 'ICD-10 Alcohol Withdrawal State Criteria', type: 'required', description: 'Three or more of the following developing within hours to days of cessation/reduction of alcohol after prolonged heavy use: (1) autonomic hyperactivity (sweating, tachycardia, BP >95th percentile), (2) increased hand tremor, (3) insomnia, (4) nausea/vomiting, (5) transient visual/tactile/auditory hallucinations or illusions, (6) psychomotor agitation, (7) anxiety, (8) grand mal convulsions. Symptoms cause clinically significant distress or impairment.' },
    ],
    treatmentGuidelines: [
      {
        name: 'NICE/BAP Guidelines for Alcohol Dependence and Withdrawal', source: 'National Institute for Health and Care Excellence / British Association for Psychopharmacology', year: 2023,
        firstLine: [
          { drug: 'Chlordiazepoxide', dose: '10-50 mg PO q6-8h (fixed-dose tapering regimen over 5-7 days)', route: 'PO', frequency: '6-8 hourly', duration: '5-7 days tapering', maxDose: '200 mg/day in severe withdrawal', hepaticAdjustment: 'Caution in severe liver disease; use shorter-acting agent (lorazepam)', evidenceLevel: 'A' },
          { drug: 'Thiamine (Pabrinex)', dose: 'IV: 2 pairs of Pabrinex IV q8h x 5 days; PO: thiamine 200 mg PO TDS', route: 'IV/PO', frequency: 'IV q8h or PO TDS', duration: '5 days IV then PO for duration of detox', evidenceLevel: 'A', pregnancyCategory: 'A' },
        ],
        stepProtocol: [
          { step: 1, therapy: 'Mild withdrawal (CIWA-Ar <10, no seizure history, no DTs risk)', details: 'Community detox possible: chlordiazepoxide 10-20 mg q8h tapering over 5-7 days. Thiamine 200 mg PO TDS. Monitor daily (CIWA-Ar, vitals). If in hospital: supportive care, reassurance, quiet environment, avoid overstimulation.', duration: '5-7 days', monitoring: ['CIWA-Ar q4-8h', 'Vitals (HR, BP, temp) q6h', 'Hydration status', 'Cravings'], alternatives: ['Diazepam 5-15 mg q8h tapering', 'No medication: supportive care only if CIWA-Ar consistently <10'] },
          { step: 2, therapy: 'Moderate withdrawal (CIWA-Ar 10-19, no complications)', details: 'Fixed-dose benzodiazepine regimen: chlordiazepoxide 20-40 mg q6-8h reducing over 5-7 days. OR symptom-triggered approach: chlordiazepoxide 20 mg q1-2h if CIWA-Ar >=10. IV thiamine (Pabrinex) 2 pairs IV q8h x 3-5 days then oral. Ensure adequate fluids, electrolytes (K+, Mg2+). Consider admission to medical/psychiatric unit for monitoring.', duration: '5-7 days', monitoring: ['CIWA-Ar q1-2h (symptom-triggered) or q4h (fixed-dose)', 'HR, BP, temp q4h', 'O2 saturations', 'Fluid balance', 'Electrolytes (K+, Mg2+, PO4) daily'], alternatives: ['Diazepam 10-20 mg q6h (longer half-life, smoother withdrawal)', 'Lorazepam 2-4 mg q6h (if severe hepatic impairment)'] },
          { step: 3, therapy: 'Severe withdrawal (CIWA-Ar 20-25) or history of seizures/DTs', details: 'Symptom-triggered high-dose benzodiazepine: chlordiazepoxide 40-80 mg or diazepam 10-20 mg q1h until CIWA-Ar <10. Fixed dose: chlordiazepoxide 40-80 mg q6h. Monitor in medical/ICU setting. IV thiamine (Pabrinex) 3 pairs IV q8h x 5 days. Correct electrolytes aggressively. Consider prophylaxis: phenobarbital or carbamazepine if seizure prone.', duration: '7-10 days', monitoring: ['CIWA-Ar q1h during acute phase', 'Continuous cardiac monitoring', 'HR/BP q15 min if unstable', 'SpO2 continuous', 'Electrolytes q6-12h', 'Fluid balance strict'], alternatives: ['Diazepam loading protocol: diazepam 10-20 mg IV q15 min until calm', 'Phenobarbital for refractory withdrawal'] },
          { step: 4, therapy: 'Delirium Tremens (CIWA-Ar >25, confusion, severe autonomic instability) OR Refractory Withdrawal', details: 'ICU admission. High-dose benzodiazepine IV (diazepam 10-20 mg IV q5-10 min until sedation). Add IV phenobarbital if refractory. IV thiamine (Pabrinex) 3 pairs IV q8h. Correct electrolytes. Manage autonomic instability (beta-blockers if needed). Treat any concurrent infection. Maintain hydration (may need central line).', duration: '5-10 days ICU', monitoring: ['Full ICU monitoring', 'Invasive BP', 'Continuous cardiac monitoring', 'ABGs', 'Electrolytes q6h', 'CIWA-Ar q30 min', 'Neurological observations'], alternatives: ['Propofol or dexmedetomidine if benzodiazepine-resistant', 'ETOH protocol if no ICU available (IV ethanol — controversial, not recommended in most guidelines)'] },
        ],
        duration: 'Detox: 5-10 days. Relapse prevention: 6-12 months (naltrexone/acamprosate). Long-term: psychosocial support ongoing.',
        monitoring: ['CIWA-Ar frequency as per severity', 'HR, BP, temperature, SpO2', 'Hydration and electrolyte status (K+, Mg2+, PO4)', 'Thiamine levels and clinical signs of Wernicke', 'LFTs, GGT, CDT', 'Mental state (anxiety, depression, suicidal ideation)', 'Craving levels', 'Adherence to acamprosate/naltrexone in maintenance phase'],
      },
    ],
    admissionCriteria: [
      { indications: ['CIWA-Ar >=15 (moderate-severe withdrawal)', 'History of alcohol withdrawal seizures or DTs', 'Current delirium tremens', 'Severe electrolyte disturbance (K+ <3.0, Mg2+ <0.7)', 'Suicidal ideation or self-harm risk', 'Medical complications (pancreatitis, GI bleed, liver failure)', 'Co-ingestion of other substances', 'Failed community detox', 'Poor social support or unsafe home environment'], level: 'ward', parameters: [{ param: 'CIWA-Ar', threshold: '>=15' }, { param: 'Seizure history', threshold: 'Any previous withdrawal seizure' }, { param: 'K+', threshold: '<3.0 mmol/L' }, { param: 'Mg2+', threshold: '<0.7 mmol/L' }] },
      { indications: ['Delirium tremens (CIWA-Ar >25 with confusion)', 'Status epilepticus', 'Severe autonomic instability (HR >140, BP >200/120 or <90/60)', 'Need for mechanical ventilation', 'Multiple organ dysfunction'], level: 'ICU', parameters: [{ param: 'CIWA-Ar', threshold: '>25 with confusion' }, { param: 'HR', threshold: '>140' }, { param: 'GCS', threshold: '<12' }] },
    ],
    dischargeCriteria: {
      clinical: ['CIWA-Ar <10 for 24h', 'No acute withdrawal symptoms', 'Oriented to time, place, person', 'No suicidal ideation', 'Engaging with relapse prevention plan', 'Able to self-care and manage ADLs'],
      lab: ['Normalising LFTs (trending down GGT)', 'Normalising MCV', 'Normal electrolytes (K+, Mg2+, PO4)', 'Thiamine replete', 'Normal coagulation (if abnormal on admission)'],
      social: ['Medication set up (thiamine, relapse prevention if appropriate)', 'Alcoholics Anonymous (AA) or SMART Recovery meetings arranged', 'Community addiction team follow-up within 1-2 weeks', 'Registered with GP and detox letter sent', 'Abstinence plan in place', 'Housing/financial support if needed', 'Family/social support aware', 'Relapse prevention plan including triggers and coping strategies'],
    },
    complications: [
      { name: 'Delirium Tremens (DTs)', incidence: 5, timeCourse: '48-96h after last drink; lasts 2-5 days', management: 'ICU admission, high-dose benzodiazepines (diazepam 10-20 mg IV q5-10 min), correction of electrolytes, treat concurrent infection, thiamine, hydration, manage autonomic instability. Mortality 5-10% if untreated.', redFlags: ['CIWA-Ar >25', 'Confusion/disorientation', 'Severe autonomic hyperactivity', 'Hyperthermia', 'Refractory to benzodiazepines'] },
      { name: 'Alcohol Withdrawal Seizures', incidence: 10, timeCourse: '6-48h after last drink (peak at 24h)', management: 'Benzodiazepine (lorazepam 4 mg IV or diazepam 10-20 mg IV). If status epilepticus: standard protocol. Correct electrolytes. Prophylaxis: carbamazepine or phenobarbital if recurrent. Thiamine to prevent Wernicke.', redFlags: ['First seizure at >48h suggests other cause (hyponatraemia, subdural)', 'Focal seizures', 'Prolonged seizure >5 min', 'Multiple seizures'] },
      { name: 'Wernicke Encephalopathy and Korsakoff Syndrome', incidence: 12, timeCourse: 'Wernicke: acute over days. Korsakoff: chronic, develops after repeated Wernicke episodes.', management: 'Immediate IV thiamine (Pabrinex 3 pairs IV q8h x 5 days) — give BEFORE any glucose (glucose precipitates Wernicke). MRI brain for diagnosis. Korsakoff: long-term thiamine, memory aids, institutional care may be needed.', redFlags: ['Confusion/ataxia/ophthalmoplegia (classic triad)', 'Only 30% have classic triad — any confusion in alcoholic is Wernicke until proven otherwise', 'Nystagmus, gaze palsy', 'Retrograde amnesia, confabulation (Korsakoff)'] },
      { name: 'Hepatic Decompensation (in cirrhosis)', incidence: 15, timeCourse: 'Within days of admission in patients with underlying cirrhosis', management: 'Avoid chlordiazepoxide if severe (use lorazepam or oxazepam). IV thiamine. Manage ascites, coagulopathy, encephalopathy. Child-Pugh score. Monitor bilirubin, INR, albumin.', redFlags: ['Jaundice', 'Ascites', 'Bleeding tendency (raised INR)', 'Confusion (hepatic encephalopathy vs DTs vs Wernicke)'] },
      { name: 'Aspiration Pneumonia', incidence: 8, timeCourse: 'During acute intoxication or DTs (seizure or vomiting)', management: 'Positioning, chest physiotherapy, antibiotics (cover anaerobes: co-amoxiclav or metronidazole), CXR', redFlags: ['Seizure or vomiting episode', 'Fever', 'Hypoxia', 'Cough, purulent sputum'] },
    ],
    followUp: { interval: 'Weekly for first month post-detox, then monthly for 6 months, then quarterly', duration: 'Minimum 12 months post-detox for relapse prevention', tests: ['LFTs, GGT, CDT monthly at initiation then q3 months', 'FBC including MCV', 'Liver fibrosis assessment (FibroScan) if ongoing liver disease', 'Alcohol breath/blood if required for monitoring', 'Medication levels if applicable'], specialistReview: true, specialistTiming: 'Addiction psychiatrist/community addiction team review within 1-2 weeks. Long-term follow-up in addiction clinic. Refer to hepatology if abnormal LFTs persist.' },
    prognosis: 'Alcohol dependence is a chronic relapsing condition. With comprehensive treatment: 50-60% achieve sustained abstinence at 12 months. Relapse rate: 70-80% without treatment, 50% with optimal treatment including pharmacological and psychosocial support. Detox alone without ongoing support: 80% relapse within 3 months. Naltrexone/acamprosate reduce relapse risk by 15-20%. AA/SMART Recovery participation improves outcomes. Mortality: 15-20% of alcoholics die from alcohol-related causes. Good prognostic factors: strong motivation, employment, stable relationships, engagement in aftercare, no polysubstance use. Poor prognostic factors: early onset, family history, polysubstance use, comorbid psychiatric disorder, poor social support, previous failed treatments.',
    emergencyFlags: [
      { condition: 'Delirium Tremens (confusion, agitation, severe autonomic instability, hyperthermia)', action: 'ICU admission. High-dose benzodiazepine IV (diazepam 10-20 mg IV q5-10 min). IV thiamine 3 pairs IV q8h. Correct electrolytes. Manage BP, HR. Treat underlying infection. Mortality 5-10% if untreated.', timeCritical: '<30 minutes' },
      { condition: 'Alcohol Withdrawal Seizure (generalised tonic-clonic)', action: 'Protect airway, lorazepam 4 mg IV or diazepam 10-20 mg IV. Check glucose. CT head if first seizure or focal features. Correct electrolytes (Mg2+, K+). Start benzodiazepine prophylaxis. Thiamine IV.', timeCritical: '<5 minutes (seizure), <30 minutes post-ictal' },
      { condition: 'Wernicke Encephalopathy (ANY confusion/ataxia/ophthalmoplegia in an alcoholic)', action: 'GIVE IV THIAMINE IMMEDIATELY — do NOT wait for MRI or confirmation. Pabrinex 2-3 pairs IV. Do NOT give glucose before thiamine (precipitates Wernicke). Urgent MRI brain.', timeCritical: '<1 hour' },
      { condition: 'Status Epilepticus (seizure >5 min or >1 seizure without recovery)', action: 'Standard status epilepticus protocol: lorazepam 0.1 mg/kg IV, then phenytoin/fosphenytoin, then ICU. Check glucose, electrolytes. Consider cerebral imaging.', timeCritical: 'Immediate' },
    ],
    pediatricAdjustments: [
      { parameter: 'Prevention and screening', adjustment: 'Screening (CRAFFT questionnaire for adolescents). Heavy episodic drinking (binge drinking) is the most common pattern in adolescents. Early intervention is critical.', ageRange: '12-18 years' },
      { parameter: 'Detoxification', adjustment: 'Adolescent detox should be in paediatric/adolescent unit. Use age-appropriate benzodiazepine dosing. Lower thresholds for medical admission. Family involvement is essential.', ageRange: '<18 years' },
      { parameter: 'Psychosocial treatment', adjustment: 'CBT and motivational enhancement therapy with family involvement. Brief interventions effective for hazardous drinking. Multidimensional family therapy (MDFT) has strongest evidence for adolescents.', ageRange: '<18 years' },
      { parameter: 'Pharmacotherapy', adjustment: 'Naltrexone and acamprosate are not licensed for <18 years in many countries. Specialist paediatric addiction service involvement necessary.', ageRange: '<18 years' },
    ],
    pregnancyAdjustments: [
      { trimester: 'first', adjustment: 'Detox is safest in first trimester if possible. Benzodiazepines (lorazepam) preferred over chlordiazepoxide (more pregnancy data). Thiamine IV essential. Fetal alcohol syndrome prevention: complete abstinence is goal. All alcohol is harmful in pregnancy.', safety: 'avoid', alternative: 'Lorazepam for detox (preferred in pregnancy)' },
      { trimester: 'second', adjustment: 'Continue detox if initiated. Monitor fetal growth (alcohol causes IUGR). Ultrasound screening for fetal alcohol spectrum disorder (FASD). Maintain thiamine supplementation. Naltrexone and acamprosate should be avoided in pregnancy (insufficient safety data).', safety: 'avoid', alternative: 'Psychosocial support (CBT, motivational interviewing) without medication if possible' },
      { trimester: 'third', adjustment: 'Benzodiazepine detox: lower doses to avoid neonatal withdrawal. Monitor for preterm labour (increased risk). Plan for neonatal withdrawal monitoring. Paediatric team involvement. Breastfeeding: alcohol passes into breast milk; should not breastfeed if drinking. Thiamine is safe.', safety: 'avoid' },
      { trimester: 'all', adjustment: 'Fetal alcohol spectrum disorder (FASD) is completely preventable. Every contact counts: brief intervention and referral for all pregnant women who drink. If dependent, medically supervised detox is safer than continued heavy drinking. Multidisciplinary care (obstetric, addiction, paediatric, social work).', safety: 'avoid' },
    ],
    aiReasoning: {
      presentationPattern: ['Patient presents with autonomic hyperactivity (tremor, sweating, tachycardia) and craving hours to days after stopping or reducing heavy alcohol consumption', 'May present after a seizure — especially if no prior epilepsy diagnosis', 'Confused, agitated patient with history of heavy drinking — delirium tremens until proven otherwise', 'Brought by family concerned about withdrawal symptoms when patient tried to stop drinking', 'May present with medical complications (pancreatitis, GI bleed, jaundice) with concurrent withdrawal', 'Screening during admission for other condition reveals at-risk drinking or dependence'],
      keyFeatures: ['Timing of symptoms: onset 6-12h after last drink, peak at 24-72h, DTs at 48-96h', 'Autonomic hyperactivity (sweating, tachycardia, hypertension, tremor) is hallmark of withdrawal', 'History of heavy daily alcohol consumption (typically >8 units/day for men, >6 for women for >6 months)', 'Previous episodes of withdrawal or detox — kindling effect (each subsequent withdrawal is more severe)', 'CAGE: 2+ positive responses is highly specific for alcohol dependence', 'Elevated GGT, MCV, CDT as biomarkers of chronic heavy consumption'],
      discriminatingQuestions: ['How much alcohol do you drink on a typical day? What type of alcohol?', 'When was your last drink?', 'Have you ever experienced shakes, sweating, or feeling shaky when you stop drinking?', 'Have you ever had a seizure or seen/heard things that weren\'t there when you stopped drinking?', 'Have you ever been hospitalised for alcohol withdrawal or detox before?', 'Have you ever felt you should cut down on your drinking? (CAGE)', 'Have people annoyed you by criticising your drinking? (CAGE)', 'Have you ever felt bad or guilty about your drinking? (CAGE)', 'Have you ever had a drink first thing in the morning to steady your nerves? (CAGE)', 'Do you take any other drugs or medications?'],
      diagnosticAlgorithm: ['1. Confirm alcohol dependence (AUDIT, CAGE, DSV-5-TR criteria)', '2. Assess timing of last drink (onset of withdrawal is 6-12h after cessation)', '3. Grade withdrawal severity with CIWA-Ar', '4. Check for high-risk features: prior seizures/DTs, medical comorbidities, severe electrolyte disturbance', '5. Initiate benzodiazepine (fixed-dose or symptom-triggered based on CIWA-Ar)', '6. Start IV thiamine (Pabrinex) — BEFORE glucose', '7. Correct electrolytes (K+, Mg2+, PO4)', '8. Determine setting (community/ward/ICU) based on severity and risk factors', '9. Screen for complications (seizures, DTs, Wernicke, hepatic decompensation)', '10. Plan for ongoing management: detox completion, relapse prevention (naltrexone/acamprosate), psychosocial support, follow-up'],
    },
    clinicalNoteTemplate: {
      sections: ['Patient identifiers', 'Presenting complaint', 'Alcohol history (type, quantity, frequency, pattern, duration)', 'AUDIT/CAGE scores', 'Time since last drink', 'Current withdrawal symptoms and CIWA-Ar score', 'Past withdrawal history (seizures, DTs, hospitalisations)', 'Substance use history (other drugs, tobacco)', 'Psychiatric history (depression, anxiety, PTSD, suicide attempts)', 'Medical history (liver disease, pancreatitis, GI bleed, head injury, epilepsy)', 'Current medications', 'Mental state examination', 'Physical examination (liver stigmata, tremor, vitals, neurological)', 'Investigations (CIWA-Ar, LFTs, FBC, MCV, CDT, electrolytes, thiamine, tox screen)', 'Severity classification', 'Detox plan (setting, benzodiazepine regimen, thiamine, electrolyte correction)', 'Relapse prevention plan', 'Social situation and support', 'Risk assessment', 'Follow-up plan'],
      consultantWording: 'This [age]-year-old [male/female] with a [number]-year history of alcohol dependence presents [hours/days] after last alcohol intake with [symptoms]. The CIWA-Ar score is [score], indicating [mild/moderate/severe] withdrawal. The AUDIT score is [score] indicating [hazardous/harmful/dependent] drinking. Withdrawal is complicated by [seizure history/DTs history/medical comorbidity]. The patient requires [level of care] for detoxification. Thiamine has been commenced to prevent Wernicke encephalopathy. The detox regimen will be [fixed-dose/symptom-triggered] chlordiazepoxide over [5-7/7-10] days. Following detox, relapse prevention with [naltrexone/acamprosate] and psychosocial support should be arranged.',
      exampleNote: 'A 55-year-old male with 30-year history of heavy daily alcohol consumption (1 litre of spirits/day, >30 units) presents 12 hours after his last drink with tremor, sweating, nausea, tachycardia (HR 115), BP 155/95, and anxiety. CIWA-Ar score 18. AUDIT score 28. CAGE: 4/4. Past: one withdrawal seizure 2 years ago, one DTs episode 5 years ago requiring ICU. K+: 3.1, Mg2+: 0.65. GGT 350, MCV 104. CDT 2.8%. Admitted to medical ward for detox. Plan: (1) Symptom-triggered chlordiazepoxide 40 mg q1-2h if CIWA-Ar >=10. (2) Pabrinex 2 pairs IV q8h x 5 days. (3) IV fluids with K+ and Mg2+ replacement. (4) ECG, continuous cardiac monitoring. (5) CIWA-Ar q1-2h. (6) Falls risk, seizure precautions. (7) Discuss naltrexone for relapse prevention after detox. (8) Refer to community addiction team and AA.',
    },
  },
];

export const PSYCH_DISEASE_MAP: Record<string, DiseaseIntelligence> = {};
PSYCH_DISEASES.forEach(d => { PSYCH_DISEASE_MAP[d.id] = d; });
