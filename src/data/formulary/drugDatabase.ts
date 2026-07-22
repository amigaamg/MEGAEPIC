export interface DrugDose {
  route: string;
  dose: string;
  frequency: string;
  maxDaily?: string;
  notes?: string;
}

export interface DrugInteraction {
  drug: string;
  severity: 'major' | 'moderate' | 'minor';
  effect: string;
  mechanism?: string;
}

export interface DrugEntry {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  therapeuticCategory: string;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  seriousSideEffects: string[];
  dosing: {
    adult: DrugDose[];
    pediatric?: DrugDose[];
    renalAdjustment?: string;
    hepaticAdjustment?: string;
    elderlyAdjustment?: string;
  };
  availableStrengths: string[];
  routes: string[];
  halfLife: string;
  pregnancyCategory: string;
  lactation: string;
  monitoring: string[];
  interactions: DrugInteraction[];
  onset: string;
  duration: string;
  maxDailyDose?: string;
  notes: string;
  mechanismOfAction: string;
  metabolism: string;
  excretion: string;
}

const DRUG_DATABASE: Record<string, DrugEntry> = {};

function reg(d: DrugEntry) {
  DRUG_DATABASE[d.id] = d;
}

reg({
  id: 'amlodipine', name: 'Amlodipine', genericName: 'Amlodipine besylate', brandNames: ['Norvasc', 'Amlip'],
  drugClass: 'Calcium Channel Blocker (Dihydropyridine)', therapeuticCategory: 'Cardiovascular',
  indications: ['Hypertension', 'Chronic stable angina', 'Vasospastic angina', 'Coronary artery disease'],
  contraindications: ['Hypotension (SBP <90 mmHg)', 'Severe aortic stenosis', 'Cardiogenic shock', 'Hypersensitivity'],
  sideEffects: ['Peripheral edema', 'Dizziness', 'Flushing', 'Palpitations', 'Fatigue', 'Nausea', 'Headache'],
  seriousSideEffects: ['Severe hypotension', 'Hepatotoxicity', 'Stevens-Johnson syndrome', 'Gingival hyperplasia'],
  dosing: {
    adult: [
      { route: 'oral', dose: '5 mg', frequency: 'Once daily', maxDaily: '10 mg/day', notes: 'Start 5 mg, increase after 1-2 weeks' },
    ],
    pediatric: [
      { route: 'oral', dose: '2.5-5 mg', frequency: 'Once daily', maxDaily: '10 mg/day', notes: 'For children ≥6 years' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'Start 2.5 mg daily in hepatic impairment',
    elderlyAdjustment: 'Start 2.5 mg daily',
  },
  availableStrengths: ['2.5 mg', '5 mg', '10 mg'],
  routes: ['oral'],
  halfLife: '30-50 hours',
  pregnancyCategory: 'Category C',
  lactation: 'Excreted in breast milk; use with caution',
  monitoring: ['Blood pressure', 'Heart rate', 'Peripheral edema assessment', 'Liver function tests'],
  interactions: [
    { drug: 'Simvastatin', severity: 'major', effect: 'Increased risk of myopathy/rhabdomyolysis with simvastatin >20 mg', mechanism: 'CYP3A4 inhibition' },
    { drug: 'Clarithromycin', severity: 'major', effect: 'Increased amlodipine concentration, risk of hypotension', mechanism: 'CYP3A4 inhibition' },
    { drug: 'Itraconazole', severity: 'moderate', effect: 'Increased amlodipine levels', mechanism: 'CYP3A4 inhibition' },
    { drug: 'Grapefruit juice', severity: 'moderate', effect: 'Increased amlodipine levels', mechanism: 'CYP3A4 inhibition' },
    { drug: 'Metoprolol', severity: 'moderate', effect: 'Increased risk of bradycardia and heart block', mechanism: 'Additive negative chronotropic effect' },
    { drug: 'Furosemide', severity: 'minor', effect: 'Additive hypotensive effect', mechanism: 'Additive vasodilation' },
  ],
  onset: '2-4 hours',
  duration: '24 hours',
  maxDailyDose: '10 mg',
  notes: 'May be used with ACE inhibitors or thiazide diuretics for additive BP control. Edema is dose-dependent.',
  mechanismOfAction: 'Selectively inhibits calcium ion influx across cardiac and vascular smooth muscle cell membranes, causing vasodilation and reduced peripheral vascular resistance.',
  metabolism: 'Extensively hepatic via CYP3A4',
  excretion: 'Renal (60% metabolites, 10% unchanged)',
});

reg({
  id: 'lisinopril', name: 'Lisinopril', genericName: 'Lisinopril', brandNames: ['Zestril', 'Prinivil'],
  drugClass: 'ACE Inhibitor', therapeuticCategory: 'Cardiovascular',
  indications: ['Hypertension', 'Heart failure', 'Acute myocardial infarction', 'Diabetic nephropathy'],
  contraindications: ['History of angioedema', 'Pregnancy', 'Bilateral renal artery stenosis', 'Hyperkalemia', 'Hypersensitivity'],
  sideEffects: ['Dry cough', 'Dizziness', 'Hyperkalemia', 'Renal impairment', 'Hypotension', 'Fatigue', 'Headache'],
  seriousSideEffects: ['Angioedema', 'Neutropenia/agranulocytosis', 'Acute renal failure', 'Fetal toxicity', 'Severe hypotension'],
  dosing: {
    adult: [
      { route: 'oral', dose: '10 mg', frequency: 'Once daily', maxDaily: '40 mg/day', notes: 'Start 10 mg, titrate up' },
      { route: 'oral', dose: '2.5-5 mg', frequency: 'Once daily', notes: 'For heart failure start' },
    ],
    renalAdjustment: 'CrCl 10-30: 5 mg daily max; CrCl <10: 2.5 mg daily',
    hepaticAdjustment: 'No adjustment needed',
    elderlyAdjustment: 'Start 2.5-5 mg daily',
  },
  availableStrengths: ['2.5 mg', '5 mg', '10 mg', '20 mg', '40 mg'],
  routes: ['oral'],
  halfLife: '12 hours',
  pregnancyCategory: 'Category D (2nd/3rd trimester)',
  lactation: 'Minimal excretion; considered compatible',
  monitoring: ['Blood pressure', 'Renal function (creatinine, eGFR)', 'Serum potassium', 'CBC periodically'],
  interactions: [
    { drug: 'Spironolactone', severity: 'major', effect: 'Life-threatening hyperkalemia', mechanism: 'Additive potassium-sparing effect' },
    { drug: 'Potassium supplements', severity: 'major', effect: 'Severe hyperkalemia', mechanism: 'Additive effect' },
    { drug: 'NSAIDs', severity: 'moderate', effect: 'Reduced antihypertensive effect, increased renal risk', mechanism: 'Prostaglandin inhibition' },
    { drug: 'Furosemide', severity: 'moderate', effect: 'Additive hypotensive effect, risk of renal impairment', mechanism: 'Additive hemodynamic effect' },
    { drug: 'Lithium', severity: 'moderate', effect: 'Increased lithium levels, toxicity risk', mechanism: 'Reduced renal lithium clearance' },
    { drug: 'Aliskiren', severity: 'major', effect: 'Increased risk of renal impairment in diabetes', mechanism: 'Dual RAAS blockade' },
  ],
  onset: '1 hour',
  duration: '24 hours',
  maxDailyDose: '40 mg',
  notes: 'First-line for hypertension in diabetes with albuminuria. Monitor K+ and creatinine 1-2 weeks after starting.',
  mechanismOfAction: 'Competitive inhibitor of angiotensin-converting enzyme (ACE), preventing conversion of angiotensin I to angiotensin II, reducing vasoconstriction and aldosterone secretion.',
  metabolism: 'None (excreted unchanged)',
  excretion: 'Renal (100% unchanged)',
});

reg({
  id: 'losartan', name: 'Losartan', genericName: 'Losartan potassium', brandNames: ['Cozaar', 'Lozap'],
  drugClass: 'Angiotensin II Receptor Blocker (ARB)', therapeuticCategory: 'Cardiovascular',
  indications: ['Hypertension', 'Diabetic nephropathy', 'Heart failure', 'Stroke prevention in hypertensive LVH'],
  contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'Severe hepatic impairment', 'Hypersensitivity'],
  sideEffects: ['Dizziness', 'Hyperkalemia', 'Renal impairment', 'Fatigue', 'Diarrhea', 'Back pain', 'Hypotension'],
  seriousSideEffects: ['Angioedema (rare)', 'Renal failure', 'Fetal toxicity', 'Hypotension'],
  dosing: {
    adult: [
      { route: 'oral', dose: '50 mg', frequency: 'Once daily', maxDaily: '100 mg/day', notes: 'May increase to 100 mg if needed' },
    ],
    pediatric: [
      { route: 'oral', dose: '0.7 mg/kg', frequency: 'Once daily', maxDaily: '50 mg/day', notes: 'For children ≥6 years' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'Start 25 mg daily in hepatic impairment',
    elderlyAdjustment: 'Start 25 mg daily',
  },
  availableStrengths: ['25 mg', '50 mg', '100 mg'],
  routes: ['oral'],
  halfLife: '6-9 hours (active metabolite: 9-12 hours)',
  pregnancyCategory: 'Category D (2nd/3rd trimester)',
  lactation: 'Excreted in breast milk; alternatives preferred',
  monitoring: ['Blood pressure', 'Renal function', 'Serum potassium'],
  interactions: [
    { drug: 'Spironolactone', severity: 'major', effect: 'Severe hyperkalemia', mechanism: 'Additive potassium-sparing effect' },
    { drug: 'Potassium supplements', severity: 'major', effect: 'Hyperkalemia', mechanism: 'Additive effect' },
    { drug: 'NSAIDs', severity: 'moderate', effect: 'Reduced antihypertensive effect', mechanism: 'Prostaglandin inhibition' },
    { drug: 'Rifampin', severity: 'moderate', effect: 'Reduced losartan efficacy', mechanism: 'CYP induction' },
    { drug: 'Fluconazole', severity: 'moderate', effect: 'Increased losartan levels', mechanism: 'CYP2C9 inhibition' },
  ],
  onset: '2-6 hours',
  duration: '24 hours',
  maxDailyDose: '100 mg',
  notes: 'Less cough than ACE inhibitors. Preferred in patients who develop cough with ACEi.',
  mechanismOfAction: 'Selectively blocks AT1 angiotensin II receptors, inhibiting vasoconstriction and aldosterone release.',
  metabolism: 'Hepatic (CYP2C9, CYP3A4) to active metabolite E-3174',
  excretion: 'Renal (35%) and biliary (60%)',
});

reg({
  id: 'metoprolol', name: 'Metoprolol', genericName: 'Metoprolol tartrate/succinate', brandNames: ['Lopressor', 'Toprol XL'],
  drugClass: 'Beta Blocker (Cardioselective)', therapeuticCategory: 'Cardiovascular',
  indications: ['Hypertension', 'Angina', 'Heart failure (succinate)', 'Post-MI', 'Atrial fibrillation rate control', 'Migraine prophylaxis'],
  contraindications: ['Severe bradycardia', 'Heart block (2nd/3rd degree)', 'Cardiogenic shock', 'Decompensated heart failure', 'Asthma (caution)', 'Untreated pheochromocytoma'],
  sideEffects: ['Fatigue', 'Bradycardia', 'Dizziness', 'Hypotension', 'Cold extremities', 'Depression', 'Insomnia', 'Nausea'],
  seriousSideEffects: ['Heart block', 'Severe bradycardia', 'Bronchospasm (in asthmatics)', 'Heart failure exacerbation'],
  dosing: {
    adult: [
      { route: 'oral', dose: '50 mg', frequency: 'Twice daily', maxDaily: '200 mg/day', notes: 'Regular release tartrate' },
      { route: 'oral', dose: '25-50 mg', frequency: 'Once daily', maxDaily: '200 mg/day', notes: 'Extended release succinate' },
      { route: 'iv', dose: '2.5-5 mg', frequency: 'Every 2-5 minutes', maxDaily: '15 mg total', notes: 'For acute rate control' },
    ],
    pediatric: [
      { route: 'oral', dose: '1-2 mg/kg/day', frequency: 'Divided twice daily', notes: 'Max 6 mg/kg/day' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'Reduce dose in severe impairment',
    elderlyAdjustment: 'Start 25 mg daily',
  },
  availableStrengths: ['25 mg', '50 mg', '100 mg', '200 mg'],
  routes: ['oral', 'iv'],
  halfLife: '3-7 hours',
  pregnancyCategory: 'Category C',
  lactation: 'Excreted in breast milk; monitor infant',
  monitoring: ['Heart rate', 'Blood pressure', 'ECG', 'Blood glucose in diabetics', 'Heart failure status'],
  interactions: [
    { drug: 'Amlodipine', severity: 'moderate', effect: 'Increased risk of bradycardia and heart block', mechanism: 'Additive AV node suppression' },
    { drug: 'Verapamil', severity: 'major', effect: 'Severe bradycardia, heart block, asystole', mechanism: 'Additive AV nodal suppression' },
    { drug: 'Digoxin', severity: 'moderate', effect: 'Increased risk of bradycardia', mechanism: 'Additive negative chronotropic effect' },
    { drug: 'Insulin', severity: 'moderate', effect: 'Masked hypoglycemia symptoms (tachycardia)', mechanism: 'Beta-adrenergic blockade' },
    { drug: 'NSAIDs', severity: 'moderate', effect: 'Reduced antihypertensive effect', mechanism: 'Prostaglandin inhibition' },
    { drug: 'Rifampin', severity: 'moderate', effect: 'Reduced metoprolol levels', mechanism: 'CYP2D6 induction' },
  ],
  onset: '1-2 hours (oral)',
  duration: '12-24 hours',
  maxDailyDose: '200 mg',
  notes: 'Tartrate is IR (BID), succinate is ER (daily). In heart failure, start low and titrate slowly every 2 weeks.',
  mechanismOfAction: 'Selectively blocks beta-1 adrenergic receptors in the heart, reducing heart rate, contractility, and BP.',
  metabolism: 'Hepatic (CYP2D6)',
  excretion: 'Renal (<5% unchanged)',
});

reg({
  id: 'bisoprolol', name: 'Bisoprolol', genericName: 'Bisoprolol fumarate', brandNames: ['Cardicor', 'Bisop'],
  drugClass: 'Beta Blocker (Cardioselective)', therapeuticCategory: 'Cardiovascular',
  indications: ['Hypertension', 'Heart failure', 'Angina'],
  contraindications: ['Severe bradycardia', 'Heart block', 'Cardiogenic shock', 'Decompensated heart failure', 'Asthma'],
  sideEffects: ['Fatigue', 'Bradycardia', 'Dizziness', 'Cold extremities', 'Nausea', 'Diarrhea', 'Headache'],
  seriousSideEffects: ['Heart block', 'Bronchospasm', 'Heart failure worsening'],
  dosing: {
    adult: [
      { route: 'oral', dose: '5 mg', frequency: 'Once daily', maxDaily: '20 mg/day', notes: 'Start 2.5 mg in heart failure' },
    ],
    renalAdjustment: 'CrCl <40: max 10 mg/day',
    hepaticAdjustment: 'Reduce dose in severe impairment',
    elderlyAdjustment: 'Start 2.5 mg daily',
  },
  availableStrengths: ['2.5 mg', '5 mg', '10 mg'],
  routes: ['oral'],
  halfLife: '9-12 hours',
  pregnancyCategory: 'Category C',
  lactation: 'Excreted in breast milk',
  monitoring: ['Heart rate', 'Blood pressure', 'ECG'],
  interactions: [
    { drug: 'Amlodipine', severity: 'moderate', effect: 'Bradycardia risk', mechanism: 'Additive' },
    { drug: 'Verapamil', severity: 'major', effect: 'Severe bradycardia/heart block', mechanism: 'Additive AV suppression' },
    { drug: 'Digoxin', severity: 'moderate', effect: 'Bradycardia', mechanism: 'Additive' },
    { drug: 'Insulin', severity: 'moderate', effect: 'Masked hypoglycemia symptoms', mechanism: 'Beta-blockade' },
  ],
  onset: '1-3 hours',
  duration: '24 hours',
  maxDailyDose: '20 mg',
  notes: 'Preferred beta-blocker in heart failure with proven mortality benefit. Less CNS side effects than metoprolol.',
  mechanismOfAction: 'Cardioselective beta-1 blocker, reduces heart rate, contractility, and renin release.',
  metabolism: 'Hepatic (50%, CYP3A4)',
  excretion: 'Renal (50% unchanged)',
});

reg({
  id: 'furosemide', name: 'Furosemide', genericName: 'Furosemide', brandNames: ['Lasix', 'Frumil'],
  drugClass: 'Loop Diuretic', therapeuticCategory: 'Cardiovascular/Renal',
  indications: ['Pulmonary edema', 'Heart failure', 'Hypertension (with renal impairment)', 'Cirrhosis with ascites', 'Nephrotic syndrome', 'Hypercalcemia'],
  contraindications: ['Anuria', 'Severe hypokalemia', 'Severe hyponatremia', 'Hypovolemia', 'Sulfonamide allergy'],
  sideEffects: ['Hypokalemia', 'Hypotension', 'Dehydration', 'Hyperuricemia', 'Hypomagnesemia', 'Dizziness', 'Blurred vision', 'Ototoxicity'],
  seriousSideEffects: ['Ototoxicity (high dose/rapid IV)', 'Acute renal failure', 'Severe hypokalemia (arrhythmia)', 'Pancreatitis', 'Stevens-Johnson syndrome'],
  dosing: {
    adult: [
      { route: 'oral', dose: '20-40 mg', frequency: 'Once daily to twice daily', maxDaily: '600 mg/day', notes: 'Start lowest effective dose' },
      { route: 'iv', dose: '20-40 mg', frequency: 'Every 6-12 hours', maxDaily: '600 mg/day', notes: 'Administer slowly over 1-2 minutes' },
    ],
    pediatric: [
      { route: 'oral', dose: '1-2 mg/kg/dose', frequency: 'Every 6-12 hours', maxDaily: '6 mg/kg/day' },
      { route: 'iv', dose: '0.5-1 mg/kg/dose', frequency: 'Every 6-12 hours', maxDaily: '6 mg/kg/day' },
    ],
    renalAdjustment: 'Higher doses may be needed in renal impairment',
    hepaticAdjustment: 'Caution in cirrhosis (hepatic encephalopathy risk)',
    elderlyAdjustment: 'Start 20 mg daily',
  },
  availableStrengths: ['20 mg', '40 mg', '500 mg (tablets)', '10 mg/mL (injection)'],
  routes: ['oral', 'iv', 'im'],
  halfLife: '2 hours (prolonged in renal failure)',
  pregnancyCategory: 'Category C',
  lactation: 'Excreted in breast milk; may suppress lactation',
  monitoring: ['Urine output', 'Serum electrolytes (K+, Na+, Mg2+)', 'Blood pressure', 'Renal function', 'Blood glucose', 'Uric acid'],
  interactions: [
    { drug: 'Lisinopril', severity: 'moderate', effect: 'Additive hypotension, renal impairment risk', mechanism: 'Additive hemodynamic effect' },
    { drug: 'Lithium', severity: 'moderate', effect: 'Increased lithium levels', mechanism: 'Reduced clearance' },
    { drug: 'Corticosteroids', severity: 'moderate', effect: 'Increased risk of hypokalemia', mechanism: 'Additive potassium wasting' },
    { drug: 'Gentamicin', severity: 'major', effect: 'Increased ototoxicity and nephrotoxicity', mechanism: 'Additive toxicity' },
    { drug: 'Digoxin', severity: 'moderate', effect: 'Increased digoxin toxicity (hypokalemia)', mechanism: 'Potassium depletion' },
    { drug: 'NSAIDs', severity: 'moderate', effect: 'Reduced diuretic effect', mechanism: 'Prostaglandin inhibition' },
  ],
  onset: '30-60 min (oral), 5 min (IV)',
  duration: '4-6 hours',
  maxDailyDose: '600 mg',
  notes: 'IV dose roughly equals oral dose (unlike other diuretics). Monitor K+ closely; replace aggressively.',
  mechanismOfAction: 'Inhibits Na-K-2Cl cotransporter in ascending loop of Henle, producing potent diuresis and vasodilation.',
  metabolism: 'Hepatic (10%)',
  excretion: 'Renal (60% unchanged, primarily tubular secretion)',
});

reg({
  id: 'spironolactone', name: 'Spironolactone', genericName: 'Spironolactone', brandNames: ['Aldactone', 'Spironol'],
  drugClass: 'Potassium-Sparing Diuretic / Aldosterone Antagonist', therapeuticCategory: 'Cardiovascular',
  indications: ['Heart failure (with reduced EF)', 'Hypertension (especially resistant)', 'Cirrhotic ascites', 'Primary hyperaldosteronism', 'Nephrotic syndrome', 'Acne/hirsutism (off-label)'],
  contraindications: ['Hyperkalemia (>5.0 mEq/L)', 'Severe renal failure (CrCl <30)', 'Anuria', 'Addison disease', 'Concurrent potassium supplements'],
  sideEffects: ['Hyperkalemia', 'Gynecomastia', 'Menstrual irregularities', 'Dizziness', 'Nausea', 'Gastric upset'],
  seriousSideEffects: ['Severe hyperkalemia (cardiac arrest)', 'Acute renal failure', 'Agranulocytosis (rare)'],
  dosing: {
    adult: [
      { route: 'oral', dose: '25 mg', frequency: 'Once daily', maxDaily: '100 mg/day', notes: 'Heart failure: start 12.5-25 mg' },
      { route: 'oral', dose: '50-100 mg', frequency: 'Once daily', notes: 'For ascites/hyperaldosteronism' },
    ],
    pediatric: [
      { route: 'oral', dose: '1-3 mg/kg/day', frequency: 'Divided every 6-24 hours', notes: 'For edema/ascites' },
    ],
    renalAdjustment: 'CrCl 30-50: 25 mg every 12-24h; CrCl <30: avoid',
    hepaticAdjustment: 'Use with caution',
    elderlyAdjustment: 'Start 12.5-25 mg daily',
  },
  availableStrengths: ['12.5 mg', '25 mg', '50 mg', '100 mg'],
  routes: ['oral'],
  halfLife: '1.4 hours (parent), 19 hours (active metabolites)',
  pregnancyCategory: 'Category C',
  lactation: 'Excreted in breast milk; avoid',
  monitoring: ['Serum potassium (1 week after start)', 'Blood pressure', 'Renal function', 'ECG if on high doses'],
  interactions: [
    { drug: 'ACE inhibitors', severity: 'major', effect: 'Life-threatening hyperkalemia', mechanism: 'Additive potassium-sparing' },
    { drug: 'ARBs (Losartan)', severity: 'major', effect: 'Severe hyperkalemia', mechanism: 'Additive effect' },
    { drug: 'Potassium supplements', severity: 'major', effect: 'Severe hyperkalemia', mechanism: 'Additive effect' },
    { drug: 'Digoxin', severity: 'moderate', effect: 'Altered digoxin levels', mechanism: 'Reduced renal clearance' },
    { drug: 'NSAIDs', severity: 'moderate', effect: 'Reduced diuretic effect, increased K+', mechanism: 'Multiple mechanisms' },
    { drug: 'Trimethoprim', severity: 'moderate', effect: 'Increased hyperkalemia risk', mechanism: 'Additive potassium-sparing effect' },
  ],
  onset: '24-48 hours',
  duration: '2-3 days',
  maxDailyDose: '400 mg (hyperaldosteronism), 100 mg (heart failure)',
  notes: 'Combine with loop diuretic for additive effect with K+ sparing. Gynecomastia is dose-related and often reversible.',
  mechanismOfAction: 'Competitive aldosterone receptor antagonist in distal convoluted tubule, promoting Na+ and water excretion while retaining K+.',
  metabolism: 'Hepatic to active metabolites (canrenone, 7-alpha-thiomethylspironolactone)',
  excretion: 'Renal and biliary',
});

reg({
  id: 'hydrochlorothiazide', name: 'Hydrochlorothiazide (HCTZ)', genericName: 'Hydrochlorothiazide', brandNames: ['HydroDiuril', 'Esidrix'],
  drugClass: 'Thiazide Diuretic', therapeuticCategory: 'Cardiovascular',
  indications: ['Hypertension', 'Edema (heart failure, cirrhosis)', 'Nephrogenic diabetes insipidus', 'Calcium nephrolithiasis prevention'],
  contraindications: ['Anuria', 'Severe renal failure (CrCl <30)', 'Sulfonamide allergy', 'Severe hypokalemia', 'Addison disease'],
  sideEffects: ['Hypokalemia', 'Hyperuricemia', 'Hyperglycemia', 'Hypercalcemia', 'Hypomagnesemia', 'Hyponatremia', 'Dizziness'],
  seriousSideEffects: ['Severe hypokalemia (arrhythmia)', 'Acute angle-closure glaucoma', 'Pancreatitis', 'Stevens-Johnson syndrome'],
  dosing: {
    adult: [
      { route: 'oral', dose: '12.5-25 mg', frequency: 'Once daily', maxDaily: '50 mg/day', notes: 'Start 12.5 mg' },
    ],
    pediatric: [
      { route: 'oral', dose: '1-2 mg/kg/day', frequency: 'Once daily', notes: 'Max 50 mg/day' },
    ],
    renalAdjustment: 'CrCl <30: not effective',
    hepaticAdjustment: 'Caution in severe hepatic disease',
    elderlyAdjustment: 'Start 12.5 mg daily',
  },
  availableStrengths: ['12.5 mg', '25 mg', '50 mg'],
  routes: ['oral'],
  halfLife: '6-15 hours',
  pregnancyCategory: 'Category B',
  lactation: 'Excreted in breast milk; use with caution',
  monitoring: ['Serum electrolytes', 'Blood glucose', 'Uric acid', 'Blood pressure'],
  interactions: [
    { drug: 'Lithium', severity: 'moderate', effect: 'Increased lithium levels', mechanism: 'Reduced clearance' },
    { drug: 'Digoxin', severity: 'moderate', effect: 'Increased digoxin toxicity (hypokalemia)', mechanism: 'Potassium depletion' },
    { drug: 'Corticosteroids', severity: 'moderate', effect: 'Increased hypokalemia risk', mechanism: 'Additive potassium wasting' },
    { drug: 'NSAIDs', severity: 'moderate', effect: 'Reduced efficacy', mechanism: 'Prostaglandin inhibition' },
    { drug: 'Insulin', severity: 'moderate', effect: 'Reduced hypoglycemic effect', mechanism: 'Hyperglycemia' },
  ],
  onset: '2 hours',
  duration: '6-12 hours',
  maxDailyDose: '50 mg',
  notes: 'Less effective when CrCl <30. First-line for hypertension. Can cause photosensitivity.',
  mechanismOfAction: 'Inhibits Na-Cl cotransporter in distal convoluted tubule, increasing Na, Cl, and water excretion.',
  metabolism: 'Minimal hepatic',
  excretion: 'Renal (95% unchanged)',
});

reg({
  id: 'atorvastatin', name: 'Atorvastatin', genericName: 'Atorvastatin calcium', brandNames: ['Lipitor', 'Atorva'],
  drugClass: 'HMG-CoA Reductase Inhibitor (Statin)', therapeuticCategory: 'Cardiovascular/Lipidology',
  indications: ['Hypercholesterolemia', 'Mixed dyslipidemia', 'Coronary artery disease prevention', 'Post-MI', 'Diabetes with CV risk'],
  contraindications: ['Active liver disease', 'Pregnancy', 'Breastfeeding', 'Hypersensitivity'],
  sideEffects: ['Myalgia', 'Diarrhea', 'Nausea', 'Headache', 'Nasopharyngitis', 'Arthralgia', 'Insomnia'],
  seriousSideEffects: ['Rhabdomyolysis', 'Hepatotoxicity', 'Myopathy', 'Interstitial lung disease (rare)'],
  dosing: {
    adult: [
      { route: 'oral', dose: '10-20 mg', frequency: 'Once daily', maxDaily: '80 mg/day', notes: 'Start 10-20 mg evening' },
    ],
    pediatric: [
      { route: 'oral', dose: '10 mg', frequency: 'Once daily', maxDaily: '20 mg/day', notes: 'For children ≥10 years' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'Avoid in active liver disease',
    elderlyAdjustment: 'Start 10 mg daily',
  },
  availableStrengths: ['10 mg', '20 mg', '40 mg', '80 mg'],
  routes: ['oral'],
  halfLife: '14 hours (parent), 20-30 hours (metabolites)',
  pregnancyCategory: 'Category X',
  lactation: 'Excreted in breast milk; contraindicated',
  monitoring: ['Lipid profile (fasting)', 'Liver enzymes (baseline, then as needed)', 'CK if muscle symptoms', 'Creatinine'],
  interactions: [
    { drug: 'Amlodipine', severity: 'major', effect: 'Increased statin levels, myopathy risk (atorva max 20 mg with amlodipine)', mechanism: 'CYP3A4 interaction' },
    { drug: 'Clarithromycin', severity: 'major', effect: 'Severe myopathy/rhabdomyolysis', mechanism: 'CYP3A4 inhibition' },
    { drug: 'Itraconazole', severity: 'major', effect: 'Rhabdomyolysis risk', mechanism: 'CYP3A4 inhibition' },
    { drug: 'Grapefruit juice', severity: 'moderate', effect: 'Increased atorvastatin levels', mechanism: 'CYP3A4 inhibition' },
    { drug: 'Warfarin', severity: 'moderate', effect: 'Increased INR, bleeding risk', mechanism: 'CYP inhibition' },
    { drug: 'Fibrates', severity: 'moderate', effect: 'Increased myopathy risk', mechanism: 'Additive effect' },
  ],
  onset: '2-4 weeks',
  duration: '24 hours',
  maxDailyDose: '80 mg',
  notes: 'Most potent statin for LDL reduction. Give at any time of day (unlike simvastatin which needs evening dosing).',
  mechanismOfAction: 'Competitive inhibitor of HMG-CoA reductase, reducing cholesterol biosynthesis in the liver and upregulating LDL receptors.',
  metabolism: 'Hepatic (CYP3A4)',
  excretion: 'Biliary (98%), renal (<2%)',
});

reg({
  id: 'aspirin', name: 'Aspirin', genericName: 'Acetylsalicylic acid', brandNames: ['Aspirin', 'Bayer', 'ASA'],
  drugClass: 'Antiplatelet / NSAID', therapeuticCategory: 'Cardiovascular/Pain',
  indications: ['Acute coronary syndrome', 'Post-MI', 'Stroke prevention (ischemic)', 'Stable angina', 'Peripheral artery disease', 'Pain/fever (low dose temporary)', 'Kawasaki disease'],
  contraindications: ['Active peptic ulcer', 'Hemophilia/bleeding disorders', 'Severe hepatic impairment', 'G6PD deficiency (hemolysis risk)', 'Children <16 (Reye syndrome)', 'NSAID-sensitive asthma', 'Pregnancy (3rd trimester)'],
  sideEffects: ['Dyspepsia', 'Nausea', 'Epigastric pain', 'Bruising', 'Prolonged bleeding'],
  seriousSideEffects: ['GI hemorrhage', 'Hemorrhagic stroke', 'Reye syndrome (children)', 'Anaphylaxis', 'Tinnitus (overdose)'],
  dosing: {
    adult: [
      { route: 'oral', dose: '75-100 mg', frequency: 'Once daily', notes: 'Cardiovascular prevention' },
      { route: 'oral', dose: '300-325 mg', frequency: 'Once daily', notes: 'Acute coronary syndrome load' },
      { route: 'oral', dose: '300-600 mg', frequency: 'Every 4-6 hours PRN', maxDaily: '4 g/day', notes: 'Pain/fever (short-term)' },
    ],
    pediatric: [
      { route: 'oral', dose: '10-15 mg/kg/dose', frequency: 'Every 4-6 hours', maxDaily: '4 g/day', notes: 'Only for Kawasaki disease; otherwise avoid' },
    ],
    renalAdjustment: 'Avoid if CrCl <10',
    hepaticAdjustment: 'Avoid in severe impairment',
    elderlyAdjustment: 'Use lowest effective dose',
  },
  availableStrengths: ['75 mg', '81 mg', '100 mg', '300 mg', '500 mg'],
  routes: ['oral', 'rectal'],
  halfLife: '15-20 minutes (parent), 3 hours (metabolite) — low doses: 3+ hours',
  pregnancyCategory: 'Category D (3rd trimester), C (1st/2nd)',
  lactation: 'Excreted in breast milk; caution',
  monitoring: ['Bleeding signs', 'Platelet function (if bleeding concerns)', 'INR if with warfarin', 'Serum salicylate levels in toxicity'],
  interactions: [
    { drug: 'Warfarin', severity: 'major', effect: 'Significantly increased bleeding risk', mechanism: 'Additive anticoagulation + platelet inhibition' },
    { drug: 'Clopidogrel', severity: 'moderate', effect: 'Increased bleeding risk (but often used together)', mechanism: 'Dual antiplatelet therapy' },
    { drug: 'Ibuprofen', severity: 'moderate', effect: 'Reduced cardioprotective effect of aspirin', mechanism: 'Competitive COX-1 inhibition' },
    { drug: 'Methotrexate', severity: 'major', effect: 'Increased methotrexate toxicity', mechanism: 'Reduced renal clearance' },
    { drug: 'ACE inhibitors', severity: 'moderate', effect: 'Reduced antihypertensive effect', mechanism: 'Prostaglandin inhibition' },
    { drug: 'Spironolactone', severity: 'moderate', effect: 'Reduced diuretic effect', mechanism: 'Prostaglandin inhibition' },
  ],
  onset: '5-30 minutes (oral), 1-2 hours (full antiplatelet)',
  duration: '7-10 days (platelet effect for life of platelet)',
  maxDailyDose: '4 g (pain), 100 mg (CV prevention)',
  notes: 'Irreversibly acetylates COX-1 for platelet lifespan. Enteric-coated reduces GI side effects.',
  mechanismOfAction: 'Irreversibly acetylates cyclooxygenase (COX-1 and COX-2), inhibiting thromboxane A2 synthesis and platelet aggregation.',
  metabolism: 'Hepatic (hydrolysis to salicylic acid)',
  excretion: 'Renal (dose-dependent, saturable)',
});

reg({
  id: 'clopidogrel', name: 'Clopidogrel', genericName: 'Clopidogrel bisulfate', brandNames: ['Plavix', 'Clopivas'],
  drugClass: 'P2Y12 Platelet Inhibitor', therapeuticCategory: 'Cardiovascular',
  indications: ['Acute coronary syndrome (with aspirin)', 'Post-PCI/stent', 'Recent MI/stroke', 'Peripheral artery disease', 'Aspirin allergy/intolerance'],
  contraindications: ['Active pathologic bleeding', 'Severe hepatic impairment', 'Hypersensitivity'],
  sideEffects: ['Bruising', 'Epistaxis', 'Dyspepsia', 'Diarrhea', 'Rash'],
  seriousSideEffects: ['Hemorrhage (GI, intracranial)', 'Thrombotic thrombocytopenic purpura (rare)', 'Neutropenia (rare)'],
  dosing: {
    adult: [
      { route: 'oral', dose: '75 mg', frequency: 'Once daily', notes: 'Maintenance' },
      { route: 'oral', dose: '300-600 mg', frequency: 'Single loading dose', notes: 'For ACS/PCI loading' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'Avoid in severe impairment',
    elderlyAdjustment: 'No adjustment needed',
  },
  availableStrengths: ['75 mg', '300 mg'],
  routes: ['oral'],
  halfLife: '6 hours (parent), 30 minutes (active metabolite)',
  pregnancyCategory: 'Category B',
  lactation: 'Excreted in breast milk; caution',
  monitoring: ['Signs of bleeding', 'Platelet function (if needed)', 'CBC periodically'],
  interactions: [
    { drug: 'Omeprazole', severity: 'moderate', effect: 'Reduced clopidogrel efficacy (prefer pantoprazole)', mechanism: 'CYP2C19 inhibition' },
    { drug: 'Warfarin', severity: 'major', effect: 'Significantly increased bleeding risk', mechanism: 'Additive anticoagulation' },
    { drug: 'Aspirin', severity: 'moderate', effect: 'Increased bleeding (therapeutic in ACS)', mechanism: 'Dual antiplatelet' },
    { drug: 'Rifampin', severity: 'moderate', effect: 'Increased clopidogrel effect', mechanism: 'CYP induction' },
    { drug: 'Fluoxetine', severity: 'moderate', effect: 'Reduced clopidogrel activation', mechanism: 'CYP2C19 inhibition' },
  ],
  onset: '2-4 hours (loading dose)',
  duration: '5-10 days',
  maxDailyDose: '75 mg (maintenance)',
  notes: 'Prodrug requires CYP2C19 activation. Consider genetic testing in poor metabolizers.',
  mechanismOfAction: 'Irreversibly blocks P2Y12 ADP receptors on platelets, inhibiting platelet aggregation for the platelet lifespan.',
  metabolism: 'Hepatic (CYP2C19, CYP3A4, CYP1A2) to active metabolite',
  excretion: 'Renal (50%), biliary (50%)',
});

reg({
  id: 'warfarin', name: 'Warfarin', genericName: 'Warfarin sodium', brandNames: ['Coumadin', 'Marevan'],
  drugClass: 'Vitamin K Antagonist (Anticoagulant)', therapeuticCategory: 'Cardiovascular',
  indications: ['Atrial fibrillation (thromboembolic prevention)', 'Venous thromboembolism (DVT/PE)', 'Mechanical heart valves', 'Antiphospholipid syndrome', 'Post-MI (with mural thrombus)'],
  contraindications: ['Active bleeding', 'Hemorrhagic stroke', 'Bleeding diathesis', 'Severe hepatic impairment', 'Pregnancy (Category X)', 'Uncontrolled hypertension', 'Recent spinal puncture'],
  sideEffects: ['Bruising', 'Epistaxis', 'Gingival bleeding', 'Hematuria', 'Alopecia', 'Rash'],
  seriousSideEffects: ['Major hemorrhage (GI, intracranial)', 'Calciphylaxis (rare)', 'Skin necrosis (protein C deficiency)', 'Purple toe syndrome'],
  dosing: {
    adult: [
      { route: 'oral', dose: '5 mg', frequency: 'Once daily', notes: 'Start 5 mg daily for 2 days, then adjust by INR' },
    ],
    pediatric: [
      { route: 'oral', dose: '0.2 mg/kg', frequency: 'Once daily', notes: 'Max 5 mg, adjust by INR' },
    ],
    renalAdjustment: 'No adjustment, but monitor closely in renal impairment',
    hepaticAdjustment: 'Reduce dose in severe impairment',
    elderlyAdjustment: 'Start 2.5 mg daily',
  },
  availableStrengths: ['1 mg', '2 mg', '2.5 mg', '3 mg', '4 mg', '5 mg', '7.5 mg', '10 mg'],
  routes: ['oral', 'iv'],
  halfLife: '20-60 hours (mean 40)',
  pregnancyCategory: 'Category X',
  lactation: 'Not excreted in breast milk; compatible',
  monitoring: ['INR (target 2-3, or 2.5-3.5 for mechanical valves)', 'Hemoglobin', 'Liver function', 'Renal function'],
  interactions: [
    { drug: 'Aspirin', severity: 'major', effect: 'Significantly increased bleeding risk', mechanism: 'Additive anticoagulation + platelet inhibition' },
    { drug: 'NSAIDs', severity: 'major', effect: 'Increased GI bleeding risk', mechanism: 'Additive effect' },
    { drug: 'Metronidazole', severity: 'major', effect: 'Increased INR, bleeding risk', mechanism: 'CYP inhibition + altered gut flora' },
    { drug: 'Ciprofloxacin', severity: 'major', effect: 'Increased INR', mechanism: 'CYP inhibition' },
    { drug: 'Amoxicillin', severity: 'moderate', effect: 'Increased INR', mechanism: 'Altered gut flora' },
    { drug: 'Statins', severity: 'moderate', effect: 'Increased INR', mechanism: 'CYP inhibition' },
    { drug: 'Vitamin K rich foods', severity: 'moderate', effect: 'Reduced warfarin effect', mechanism: 'Dietary antagonism' },
    { drug: 'Rifampin', severity: 'major', effect: 'Reduced warfarin effect', mechanism: 'CYP induction' },
  ],
  onset: '24-72 hours',
  duration: '3-5 days',
  notes: 'Narrow therapeutic index. Requires regular INR monitoring. Loading dose not needed if starting slowly.',
  mechanismOfAction: 'Inhibits vitamin K-dependent synthesis of clotting factors II, VII, IX, X and proteins C and S.',
  metabolism: 'Hepatic (CYP450, primarily CYP2C9)',
  excretion: 'Renal (92% as metabolites)',
});

reg({
  id: 'digoxin', name: 'Digoxin', genericName: 'Digoxin', brandNames: ['Lanoxin', 'Digox'],
  drugClass: 'Cardiac Glycoside', therapeuticCategory: 'Cardiovascular',
  indications: ['Atrial fibrillation (rate control)', 'Heart failure (with reduced EF)', 'Heart failure with concurrent AF'],
  contraindications: ['AV block (2nd/3rd degree)', 'WPW syndrome', 'Hypertrophic obstructive cardiomyopathy', 'Hypokalemia (toxicity risk)', 'Ventricular tachycardia', 'Hypersensitivity'],
  sideEffects: ['Nausea', 'Vomiting', 'Anorexia', 'Fatigue', 'Dizziness', 'Visual disturbances (yellow-green halos)', 'Arrhythmias (any type)'],
  seriousSideEffects: ['Digoxin toxicity (arrhythmias)', 'Heart block', 'Ventricular tachycardia/fibrillation', 'Complete AV dissociation'],
  dosing: {
    adult: [
      { route: 'oral', dose: '0.125-0.25 mg', frequency: 'Once daily', maxDaily: '0.5 mg/day', notes: 'Start 0.125 mg in elderly/renal impairment' },
      { route: 'iv', dose: '0.25-0.5 mg', frequency: 'Over 2-4 minutes', notes: 'Loading dose for acute AF (slow IV)' },
    ],
    pediatric: [
      { route: 'oral', dose: '5-10 mcg/kg/day', frequency: 'Divided every 12 hours', notes: 'Precise dosing based on age/weight' },
    ],
    renalAdjustment: 'CrCl 10-50: 0.125 mg daily; CrCl <10: 0.0625 mg daily',
    hepaticAdjustment: 'No adjustment needed',
    elderlyAdjustment: 'Start 0.0625-0.125 mg daily',
  },
  availableStrengths: ['0.0625 mg (62.5 mcg)', '0.125 mg', '0.25 mg'],
  routes: ['oral', 'iv'],
  halfLife: '36-48 hours (normal renal), 3.5-5 days (renal impairment)',
  pregnancyCategory: 'Category C',
  lactation: 'Excreted in breast milk; monitor infant',
  monitoring: ['Serum digoxin levels (0.5-1.0 ng/mL for HF, 0.8-2.0 for AF)', 'ECG', 'Serum K+, Mg2+, Ca2+', 'Renal function'],
  interactions: [
    { drug: 'Amiodarone', severity: 'major', effect: 'Doubled digoxin level, toxicity risk', mechanism: 'Reduced clearance, tissue displacement' },
    { drug: 'Verapamil', severity: 'major', effect: 'Increased digoxin level (50-70%)', mechanism: 'Reduced clearance' },
    { drug: 'Clarithromycin', severity: 'major', effect: 'Severe digoxin toxicity', mechanism: 'Reduced clearance (P-gp inhibition)' },
    { drug: 'Furosemide', severity: 'moderate', effect: 'Increased digoxin toxicity (hypokalemia)', mechanism: 'Potassium depletion' },
    { drug: 'Spironolactone', severity: 'moderate', effect: 'Increased digoxin levels', mechanism: 'Reduced tubular secretion' },
    { drug: 'Metoprolol', severity: 'moderate', effect: 'Additive bradycardia', mechanism: 'Additive AV node suppression' },
  ],
  onset: '30-120 min (oral), 5-30 min (IV)',
  duration: '2-3 days',
  maxDailyDose: '0.5 mg (maintenance 0.25 mg)',
  notes: 'Narrow therapeutic index. The higher the digoxin level, the worse the mortality in heart failure (Kaufman, 2001).',
  mechanismOfAction: 'Inhibits Na-K-ATPase pump, increasing intracellular Ca2+ → positive inotropy. Also increases vagal tone → decreased AV conduction.',
  metabolism: 'Hepatic (small amount), gut metabolism',
  excretion: 'Renal (60-80% unchanged, active tubular secretion)',
});

reg({
  id: 'metformin', name: 'Metformin', genericName: 'Metformin hydrochloride', brandNames: ['Glucophage', 'Metforal', 'Diaformin'],
  drugClass: 'Biguanide', therapeuticCategory: 'Endocrine/Diabetes',
  indications: ['Type 2 diabetes mellitus', 'Prediabetes (prevention)', 'PCOS (off-label)', 'Gestational diabetes (off-label)'],
  contraindications: ['Severe renal impairment (eGFR <30)', 'Acute/chronic metabolic acidosis', 'Lactic acidosis (history)', 'Severe hepatic impairment', 'Acute heart failure with hemodynamic instability', 'IV contrast (temporary hold)'],
  sideEffects: ['Nausea', 'Diarrhea', 'Abdominal discomfort', 'Metallic taste', 'Decreased appetite', 'Vitamin B12 deficiency'],
  seriousSideEffects: ['Lactic acidosis (rare, ~0.03 cases/1000)', 'Vitamin B12 deficiency (long-term)'],
  dosing: {
    adult: [
      { route: 'oral', dose: '500 mg', frequency: 'Twice daily', maxDaily: '2550 mg/day', notes: 'Start 500 mg daily, increase slowly' },
      { route: 'oral', dose: '500 mg XR', frequency: 'Once daily', maxDaily: '2000 mg/day', notes: 'Extended release, better GI tolerability' },
    ],
    pediatric: [
      { route: 'oral', dose: '500 mg', frequency: 'Twice daily', maxDaily: '2000 mg/day', notes: 'For children ≥10 years' },
    ],
    renalAdjustment: 'eGFR 30-45: max 1000 mg/day; eGFR <30: contraindicated',
    hepaticAdjustment: 'Avoid in severe impairment (lactic acidosis risk)',
    elderlyAdjustment: 'Start 500 mg daily; monitor renal function',
  },
  availableStrengths: ['500 mg', '850 mg', '1000 mg (immediate release)', '500 mg XR', '750 mg XR', '1000 mg XR'],
  routes: ['oral'],
  halfLife: '6.2 hours (plasma)',
  pregnancyCategory: 'Category B',
  lactation: 'Excreted in breast milk; considered compatible',
  monitoring: ['Blood glucose (fasting and postprandial)', 'HbA1c (every 3 months)', 'eGFR/creatinine (annually)', 'Vitamin B12 (annually after 4-5 years)'],
  interactions: [
    { drug: 'Furosemide', severity: 'moderate', effect: 'Increased metformin levels', mechanism: 'Renal clearance competition' },
    { drug: 'Contrast dye (IV)', severity: 'major', effect: 'Lactic acidosis risk — hold metformin 48h post-contrast', mechanism: 'Acute renal impairment' },
    { drug: 'Cimetidine', severity: 'moderate', effect: 'Increased metformin levels', mechanism: 'Reduced renal clearance' },
    { drug: 'Alcohol (excessive)', severity: 'major', effect: 'Increased lactic acidosis risk', mechanism: 'Hepatic metabolism interference' },
    { drug: 'Corticosteroids', severity: 'moderate', effect: 'Reduced hypoglycemic effect', mechanism: 'Counter-regulatory hormone' },
    { drug: 'Thiazide diuretics', severity: 'moderate', effect: 'Hyperglycemia, reduced metformin efficacy', mechanism: 'Potassium depletion' },
  ],
  onset: '5-7 days (full effect 2-4 weeks)',
  duration: '12-24 hours',
  maxDailyDose: '2550 mg (IR), 2000 mg (XR)',
  notes: 'First-line for T2DM. Weight neutral. Does not cause hypoglycemia alone. Hold 48h before/after IV contrast.',
  mechanismOfAction: 'Decreases hepatic gluconeogenesis, increases peripheral insulin sensitivity, decreases intestinal glucose absorption, activates AMPK.',
  metabolism: 'Not metabolized (excreted unchanged)',
  excretion: 'Renal (90% unchanged, via tubular secretion)',
});

reg({
  id: 'insulin_glargine', name: 'Insulin Glargine', genericName: 'Insulin glargine (rDNA)', brandNames: ['Lantus', 'Basaglar', 'Toujeo'],
  drugClass: 'Long-acting Insulin Analog', therapeuticCategory: 'Endocrine/Diabetes',
  indications: ['Type 1 diabetes mellitus', 'Type 2 diabetes mellitus (basal insulin)', 'Gestational diabetes (when indicated)'],
  contraindications: ['Hypoglycemia', 'Hypersensitivity'],
  sideEffects: ['Hypoglycemia', 'Weight gain', 'Injection site reactions', 'Lipodystrophy', 'Edema'],
  seriousSideEffects: ['Severe hypoglycemia (loss of consciousness, seizure)', 'Hypokalemia'],
  dosing: {
    adult: [
      { route: 'sc', dose: '10 units', frequency: 'Once daily at same time', notes: 'Start 10 units or 0.2 units/kg, titrate' },
    ],
    pediatric: [
      { route: 'sc', dose: '0.3-0.5 units/kg/day', frequency: 'Once daily', notes: 'Individualized' },
    ],
    renalAdjustment: 'Reduce dose in severe impairment',
    hepaticAdjustment: 'Reduce dose in severe impairment',
    elderlyAdjustment: 'Start 10 units daily (caution)',
  },
  availableStrengths: ['100 units/mL (Lantus)', '300 units/mL (Toujeo)'],
  routes: ['sc'],
  halfLife: '24 hours (peakless profile)',
  pregnancyCategory: 'Category C',
  lactation: 'Excreted in breast milk (safe)',
  monitoring: ['Blood glucose (at least 4x daily for T1DM)', 'HbA1c', 'Hypoglycemia awareness', 'Injection sites'],
  interactions: [
    { drug: 'Beta blockers', severity: 'moderate', effect: 'Masked hypoglycemia symptoms (tachycardia)', mechanism: 'Beta-adrenergic blockade' },
    { drug: 'Corticosteroids', severity: 'moderate', effect: 'Increased insulin requirements', mechanism: 'Counter-regulatory effect' },
    { drug: 'Alcohol', severity: 'moderate', effect: 'Increased hypoglycemia risk', mechanism: 'Reduced gluconeogenesis' },
    { drug: 'Thiazide diuretics', severity: 'moderate', effect: 'Increased insulin requirements', mechanism: 'Hyperglycemia' },
    { drug: 'MAO inhibitors', severity: 'moderate', effect: 'Increased hypoglycemia risk', mechanism: 'Unknown' },
  ],
  onset: '2-4 hours',
  duration: '24 hours',
  notes: 'Clear, not cloudy. Do not mix with other insulins in same syringe. Do not use in insulin pumps.',
  mechanismOfAction: 'Binds to insulin receptors, promoting cellular glucose uptake, glycogen synthesis, lipogenesis, and protein synthesis while inhibiting gluconeogenesis and lipolysis.',
  metabolism: 'Degraded at injection site to active metabolites',
  excretion: 'Renal (metabolites)',
});

// ── Antimicrobials ──────────────────────────────────────────────────────
reg({
  id: 'ceftriaxone', name: 'Ceftriaxone', genericName: 'Ceftriaxone sodium', brandNames: ['Rocephin', 'Ceftriaxone'],
  drugClass: 'Third-Generation Cephalosporin', therapeuticCategory: 'Anti-Infective',
  indications: ['Community-acquired pneumonia', 'Meningitis', 'Sepsis', 'Typhoid fever', 'Gonorrhea', 'UTI', 'Cellulitis', 'Lyme disease'],
  contraindications: ['Cephalosporin allergy', 'Neonates with hyperbilirubinemia (calcium precipitation risk)', 'Previous severe hypersensitivity'],
  sideEffects: ['Diarrhea', 'Rash', 'Nausea', 'Eosinophilia', 'Injection site pain', 'Headache'],
  seriousSideEffects: ['Anaphylaxis', 'C. difficile colitis', 'Biliary pseudolithiasis', 'Pancreatitis', 'Thrombocytopenia', 'Hemolytic anemia'],
  dosing: {
    adult: [
      { route: 'iv', dose: '1-2 g', frequency: 'Every 12-24 hours', maxDaily: '4 g/day', notes: '1g IV BD is standard for most infections' },
      { route: 'im', dose: '1 g', frequency: 'Every 24 hours', notes: 'Deep IM injection with lidocaine' },
    ],
    pediatric: [
      { route: 'iv', dose: '50-100 mg/kg/day', frequency: 'Divided every 12-24 hours', maxDaily: '4 g/day', notes: 'Dose varies by indication' },
      { route: 'im', dose: '50 mg/kg', frequency: 'Once daily', notes: 'Max 1g per injection site' },
    ],
    renalAdjustment: 'No adjustment needed (hepatic excretion)',
    hepaticAdjustment: 'No adjustment needed',
    elderlyAdjustment: 'Standard dosing',
  },
  availableStrengths: ['250 mg', '500 mg', '1 g', '2 g (per vial)'],
  routes: ['iv', 'im'],
  halfLife: '5.8-8.7 hours',
  pregnancyCategory: 'Category B',
  lactation: 'Excreted in breast milk (low levels, compatible)',
  monitoring: ['CBC with differential', 'Liver function tests', 'Renal function (if prolonged therapy)', 'C. difficile monitoring'],
  interactions: [
    { drug: 'Warfarin', severity: 'moderate', effect: 'Increased INR and bleeding risk', mechanism: 'Reduced vitamin K production by gut flora' },
    { drug: 'Calcium-containing IV solutions', severity: 'major', effect: 'Ceftriaxone-calcium precipitation risk in neonates', mechanism: 'Physicochemical incompatibility' },
    { drug: 'Alcohol', severity: 'moderate', effect: 'Possible disulfiram-like reaction', mechanism: 'Aldehyde dehydrogenase inhibition (rare)' },
    { drug: 'Probenecid', severity: 'minor', effect: 'Increased ceftriaxone levels', mechanism: 'Reduced renal clearance' },
  ],
  onset: 'IV: immediate, IM: 1-2 hours',
  duration: '12-24 hours (dose-dependent)',
  maxDailyDose: '4 g',
  notes: 'Ceftriaxone 1g IV BD is the most common adult dosing for moderate-severe infections. Can be given IM for gonorrhea (250mg stat). Avoid calcium-containing IV fluids in neonates.',
  mechanismOfAction: 'Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs), inhibiting transpeptidase activity and causing cell lysis.',
  metabolism: 'Not significantly metabolized',
  excretion: 'Hepatic (60%) and renal (40%)',
});

reg({
  id: 'paracetamol', name: 'Paracetamol (Acetaminophen)', genericName: 'Paracetamol', brandNames: ['Panadol', 'Calpol', 'Tylenol', 'PCM'],
  drugClass: 'Analgesic / Antipyretic (Non-opioid)', therapeuticCategory: 'Pain / Fever',
  indications: ['Mild-moderate pain', 'Fever', 'Headache', 'Arthralgia', 'Myalgia', 'Post-operative pain (adjunct)'],
  contraindications: ['Severe hepatic impairment', 'Hypersensitivity'],
  sideEffects: ['Nausea', 'Rash (rare)'],
  seriousSideEffects: ['Hepatotoxicity (overdose >4g/day)', 'Stevens-Johnson syndrome (rare)', 'Acute liver failure (overdose)'],
  dosing: {
    adult: [
      { route: 'oral', dose: '500-1000 mg', frequency: 'Every 4-6 hours', maxDaily: '4 g/day', notes: 'Max 4g in 24 hours; reduce in hepatic impairment' },
      { route: 'iv', dose: '1 g', frequency: 'Every 6 hours', maxDaily: '4 g/day', notes: 'IV infusion over 15 min' },
      { route: 'rectal', dose: '500-1000 mg', frequency: 'Every 4-6 hours', maxDaily: '4 g/day', notes: 'If unable to take oral/IV' },
    ],
    pediatric: [
      { route: 'oral', dose: '10-15 mg/kg/dose', frequency: 'Every 4-6 hours', maxDaily: '60 mg/kg/day', notes: 'Max 4 doses in 24h' },
      { route: 'rectal', dose: '15-20 mg/kg/dose', frequency: 'Every 4-6 hours', maxDaily: '60 mg/kg/day', notes: 'PR if vomiting' },
    ],
    renalAdjustment: 'Extended interval if severe impairment (CrCl <10: Q8H)',
    hepaticAdjustment: 'Avoid in severe impairment; max 2g/day if moderate',
    elderlyAdjustment: 'Standard dosing; caution in frail elderly',
  },
  availableStrengths: ['500 mg tab', '1 g tab', '120 mg/5mL syrup', '250 mg/5mL syrup', '500 mg suppository', '10 mg/mL IV'],
  routes: ['oral', 'iv', 'rectal'],
  halfLife: '2-3 hours',
  pregnancyCategory: 'Category A (safest analgesic in pregnancy)',
  lactation: 'Excreted in breast milk (safe)',
  monitoring: ['Liver function (if prolonged high-dose or overdose)', 'Pain score'],
  interactions: [
    { drug: 'Warfarin', severity: 'moderate', effect: 'Increased INR with chronic high-dose paracetamol', mechanism: 'Inhibition of vitamin K-dependent clotting factors' },
    { drug: 'Alcohol (chronic)', severity: 'major', effect: 'Increased hepatotoxicity at lower doses', mechanism: 'CYP2E1 induction, glutathione depletion' },
    { drug: 'Carbamazepine', severity: 'moderate', effect: 'Reduced paracetamol efficacy, increased toxicity', mechanism: 'CYP induction' },
    { drug: 'Rifampin', severity: 'moderate', effect: 'Reduced paracetamol levels, increased hepatotoxicity risk', mechanism: 'CYP induction' },
  ],
  onset: '30 min (oral), 5 min (IV)',
  duration: '4-6 hours',
  maxDailyDose: '4 g (adults), 60 mg/kg (children)',
  notes: 'First-line analgesic and antipyretic. Safe in pregnancy. Avoid exceeding 4g/day due to hepatotoxicity. IV form is significantly more expensive. Use weight-based dosing in children.',
  mechanismOfAction: 'Inhibits COX-1 and COX-2 in the CNS (centrally acting), reducing prostaglandin synthesis. Also activates TRPV1 channels and cannabinoid receptors. Antipyretic via hypothalamic heat-regulating center.',
  metabolism: 'Hepatic (CYP450, glucuronidation, sulfation)',
  excretion: 'Renal (metabolites, <5% unchanged)',
});

reg({
  id: 'amoxicillin', name: 'Amoxicillin', genericName: 'Amoxicillin trihydrate', brandNames: ['Amoxil', 'Moxilin', 'Amox'],
  drugClass: 'Penicillin Antibiotic', therapeuticCategory: 'Anti-Infective',
  indications: ['URTI (sinusitis, otitis media, pharyngitis)', 'Community-acquired pneumonia', 'UTI', 'Helicobacter pylori eradication', 'Lyme disease', 'Enterococcal infections'],
  contraindications: ['Penicillin allergy (anaphylaxis history)', 'Infectious mononucleosis (rash risk)'],
  sideEffects: ['Rash', 'Diarrhea', 'Nausea', 'Abdominal pain', 'Vomiting'],
  seriousSideEffects: ['Anaphylaxis', 'Stevens-Johnson syndrome', 'C. difficile colitis', 'Drug-induced hepatitis'],
  dosing: {
    adult: [
      { route: 'oral', dose: '500 mg-1 g', frequency: 'Every 8 hours', maxDaily: '6 g/day', notes: '500 mg TDS for most infections; 1g TDS for pneumonia' },
      { route: 'oral', dose: '3 g', frequency: 'Single dose', notes: 'For uncomplicated gonorrhea' },
    ],
    pediatric: [
      { route: 'oral', dose: '20-40 mg/kg/day', frequency: 'Divided every 8 hours', maxDaily: '3 g/day', notes: 'Standard dosing' },
      { route: 'oral', dose: '80-90 mg/kg/day', frequency: 'Divided every 8-12 hours', maxDaily: '3 g/day', notes: 'High-dose for resistant pneumococcus' },
    ],
    renalAdjustment: 'CrCl 10-30: Q12H; CrCl <10: Q24H',
    hepaticAdjustment: 'No adjustment needed',
    elderlyAdjustment: 'Standard dosing',
  },
  availableStrengths: ['250 mg', '500 mg', '1 g (capsules/tabs)', '125 mg/5mL syrup', '250 mg/5mL syrup'],
  routes: ['oral'],
  halfLife: '60-90 minutes',
  pregnancyCategory: 'Category B (safe)',
  lactation: 'Excreted in breast milk (safe)',
  monitoring: ['CBC (if prolonged therapy)', 'Renal function (if high-dose)', 'Signs of superinfection'],
  interactions: [
    { drug: 'Warfarin', severity: 'moderate', effect: 'Increased INR', mechanism: 'Reduced vitamin K production by gut flora' },
    { drug: 'Methotrexate', severity: 'major', effect: 'Increased methotrexate toxicity', mechanism: 'Reduced renal clearance' },
    { drug: 'Allopurinol', severity: 'moderate', effect: 'Increased rash risk', mechanism: 'Unknown' },
    { drug: 'Oral contraceptives', severity: 'minor', effect: 'Reduced contraceptive efficacy', mechanism: 'Gut flora alteration (clinically insignificant)' },
    { drug: 'Probenecid', severity: 'minor', effect: 'Increased amoxicillin levels', mechanism: 'Reduced tubular secretion' },
  ],
  onset: '1-2 hours',
  duration: '6-8 hours',
  maxDailyDose: '6 g',
  notes: 'One of the most commonly prescribed antibiotics. Well-absorbed orally. Often combined with clavulanic acid (co-amoxiclav) to overcome beta-lactamase resistance.',
  mechanismOfAction: 'Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs), inhibiting transpeptidase activity during peptidoglycan cross-linking.',
  metabolism: 'Hepatic (minor)',
  excretion: 'Renal (60% unchanged, via tubular secretion)',
});

reg({
  id: 'gentamicin', name: 'Gentamicin', genericName: 'Gentamicin sulfate', brandNames: ['Garamycin', 'Genticin', 'Gentamicin'],
  drugClass: 'Aminoglycoside Antibiotic', therapeuticCategory: 'Anti-Infective',
  indications: ['Severe sepsis (with other agents)', 'Gram-negative bacteremia', 'Pseudomonas aeruginosa infections', 'Enterococcal endocarditis (with penicillin)', 'Empiric therapy in neutropenic fever'],
  contraindications: ['Aminoglycoside allergy', 'Myasthenia gravis (neuromuscular blockade risk)'],
  sideEffects: ['Nephrotoxicity (reversible)', 'Ototoxicity (irreversible)', 'Vestibular toxicity', 'Nausea', 'Rash'],
  seriousSideEffects: ['Acute renal failure', 'Irreversible hearing loss', 'Vestibular damage (ataxia)', 'Neuromuscular blockade (respiratory depression)'],
  dosing: {
    adult: [
      { route: 'iv', dose: '5-7 mg/kg', frequency: 'Once daily', maxDaily: '7 mg/kg/day', notes: 'Extended-interval dosing (preferred); adjust by levels' },
      { route: 'iv', dose: '1.5-2.5 mg/kg', frequency: 'Every 8-12 hours', maxDaily: '7 mg/kg/day', notes: 'Traditional divided dosing' },
      { route: 'im', dose: '5-7 mg/kg', frequency: 'Once daily', notes: 'IM if no IV access' },
    ],
    pediatric: [
      { route: 'iv', dose: '2.5 mg/kg/dose', frequency: 'Every 8-12 hours', notes: 'For neonates: adjust based on gestational age' },
      { route: 'iv', dose: '5-7.5 mg/kg', frequency: 'Once daily', notes: 'Extended interval for older children' },
    ],
    renalAdjustment: 'CrCl 30-60: Q24-36H; CrCl 10-30: Q36-48H; CrCl <10: Q48H+',
    hepaticAdjustment: 'No adjustment needed',
    elderlyAdjustment: 'Reduce dose and monitor levels closely',
  },
  availableStrengths: ['10 mg/mL', '20 mg/mL', '40 mg/mL (injection)'],
  routes: ['iv', 'im', 'topical', 'intrathecal'],
  halfLife: '2-4 hours (increased in renal impairment)',
  pregnancyCategory: 'Category C (avoid unless life-threatening infection)',
  lactation: 'Excreted in breast milk (compatible with monitoring)',
  monitoring: ['Serum gentamicin levels (peak and trough)', 'Renal function (creatinine, eGFR)', 'Audiometry (if prolonged therapy)', 'Vestibular assessment'],
  interactions: [
    { drug: 'Furosemide', severity: 'major', effect: 'Increased ototoxicity and nephrotoxicity', mechanism: 'Additive toxicity' },
    { drug: 'Vancomycin', severity: 'moderate', effect: 'Increased nephrotoxicity', mechanism: 'Additive renal toxicity' },
    { drug: 'Cisplatin', severity: 'major', effect: 'Increased nephrotoxicity/ototoxicity', mechanism: 'Additive toxicity' },
    { drug: 'NSAIDs', severity: 'moderate', effect: 'Increased nephrotoxicity risk', mechanism: 'Reduced renal blood flow' },
    { drug: 'Neuromuscular blockers', severity: 'major', effect: 'Enhanced/residual neuromuscular blockade', mechanism: 'Presynaptic inhibition' },
  ],
  onset: 'IV: immediate; IM: 30-60 min',
  duration: '12-24 hours (dose-dependent)',
  maxDailyDose: '7 mg/kg (extended interval)',
  notes: 'Always check renal function BEFORE each dose. Extended-interval dosing (once daily) is as effective and less nephrotoxic than divided doses. Trough levels should be <1 mcg/mL for once-daily, <2 for traditional. Peak varies by indication.',
  mechanismOfAction: 'Irreversibly binds to 30S ribosomal subunit, inhibiting bacterial protein synthesis and causing misreading of mRNA codons.',
  metabolism: 'Not metabolized',
  excretion: 'Renal (95% unchanged, glomerular filtration)',
});

reg({
  id: 'salbutamol', name: 'Salbutamol (Albuterol)', genericName: 'Salbutamol sulfate', brandNames: ['Ventolin', 'Salbulin', 'Proventil'],
  drugClass: 'Short-Acting Beta-2 Agonist (SABA)', therapeuticCategory: 'Respiratory',
  indications: ['Acute asthma exacerbation', 'Exercise-induced bronchospasm', 'COPD exacerbation', 'Bronchospasm prophylaxis'],
  contraindications: ['Hypersensitivity', 'Tachyarrhythmias (caution)', 'Severe hypokalemia'],
  sideEffects: ['Tremor', 'Tachycardia', 'Palpitations', 'Headache', 'Muscle cramps', 'Nervousness'],
  seriousSideEffects: ['Hypokalemia (high doses)', 'Cardiac ischemia (rare)', 'Paradoxical bronchospasm (rare)'],
  dosing: {
    adult: [
      { route: 'inhaler', dose: '100-200 mcg (1-2 puffs)', frequency: 'Every 4-6 hours PRN', maxDaily: '8 puffs/day', notes: 'PRN for symptom relief' },
      { route: 'nebulised', dose: '2.5-5 mg', frequency: 'Every 4-6 hours', maxDaily: '15 mg/day', notes: 'Acute exacerbation: up to 5mg Q20min x 3' },
      { route: 'iv', dose: '250 mcg (4 mcg/min)', frequency: 'Slow IV/Infusion', notes: 'Only in ICU setting for severe status asthmaticus' },
    ],
    pediatric: [
      { route: 'inhaler', dose: '100 mcg (1 puff)', frequency: 'Every 4-6 hours PRN', notes: 'Use with spacer' },
      { route: 'nebulised', dose: '2.5 mg', frequency: 'Every 4-6 hours', notes: '<12 years: 2.5 mg; >12 years: 5 mg' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'No adjustment needed',
    elderlyAdjustment: 'Standard dosing; monitor cardiac status',
  },
  availableStrengths: ['100 mcg/puff (inhaler)', '2.5 mg/2.5mL nebules', '5 mg/2.5mL nebules', '500 mcg/mL IV'],
  routes: ['inhaler', 'nebulised', 'iv', 'oral'],
  halfLife: '3-6 hours',
  pregnancyCategory: 'Category C (safe in asthma management)',
  lactation: 'Excreted in breast milk (safe)',
  monitoring: ['Peak expiratory flow rate', 'Symptom frequency', 'Inhaler technique', 'Heart rate with high doses'],
  interactions: [
    { drug: 'Beta blockers', severity: 'major', effect: 'Antagonised bronchodilation, risk of bronchospasm', mechanism: 'Beta-receptor blockade' },
    { drug: 'Digoxin', severity: 'moderate', effect: 'Increased risk of arrhythmias/hypokalemia', mechanism: 'Beta-2 mediated hypokalemia' },
    { drug: 'Corticosteroids', severity: 'moderate', effect: 'Increased hypokalemia risk with high-dose salbutamol', mechanism: 'Additive effect' },
    { drug: 'Diuretics (loop)', severity: 'moderate', effect: 'Increased hypokalemia', mechanism: 'Additive potassium wasting' },
  ],
  onset: '5-15 min (inhaler), 5 min (nebulised)',
  duration: '3-6 hours',
  maxDailyDose: 'Varies by route; generally 8 puffs/day maintenance, up to 15mg nebulised/day',
  notes: 'Reliever (rescue) medication for asthma. Blue inhaler. If needed more than 3x/week, escalate controller therapy. Check inhaler technique at every visit.',
  mechanismOfAction: 'Selective beta-2 adrenergic receptor agonist, causing bronchodilation via relaxation of bronchial smooth muscle, also reduces mast cell mediator release.',
  metabolism: 'Hepatic (first-pass for oral; minimal for inhaled)',
  excretion: 'Renal (metabolites)',
});

reg({
  id: 'prednisolone', name: 'Prednisolone', genericName: 'Prednisolone', brandNames: ['Deltacortril', 'Predsol', 'Precortisyl'],
  drugClass: 'Corticosteroid (Systemic)', therapeuticCategory: 'Immunology / Inflammation',
  indications: ['Acute asthma exacerbation', 'COPD exacerbation', 'Autoimmune diseases (SLE, RA, IBD)', 'Allergic reactions', 'Organ transplantation', 'Inflammatory bowel disease'],
  contraindications: ['Systemic fungal infection', 'Hypersensitivity', 'Live vaccine administration'],
  sideEffects: ['Increased appetite', 'Weight gain', 'Insomnia', 'Mood changes', 'Fluid retention', 'Hypertension', 'Hyperglycemia', 'Osteoporosis'],
  seriousSideEffects: ['Adrenal suppression', 'Osteoporosis/fractures', 'Avascular necrosis', 'Peptic ulcer disease', 'Psychosis', 'Immunosuppression', 'Cushing syndrome'],
  dosing: {
    adult: [
      { route: 'oral', dose: '30-60 mg', frequency: 'Once daily', notes: 'Asthma/COPD: 40mg OD for 5-7 days, no taper needed' },
      { route: 'oral', dose: '5-20 mg', frequency: 'Once daily', notes: 'Chronic inflammatory conditions: lowest effective dose' },
      { route: 'oral', dose: '0.5-1 mg/kg', frequency: 'Once daily', notes: 'High-dose for severe autoimmune conditions' },
    ],
    pediatric: [
      { route: 'oral', dose: '1-2 mg/kg/day', frequency: 'Once daily', maxDaily: '60 mg/day', notes: 'For 5-7 days, no taper' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'No adjustment needed (prednisolone is active form)',
    elderlyAdjustment: 'Use lowest effective dose; monitor for osteoporosis',
  },
  availableStrengths: ['5 mg', '15 mg', '25 mg', '30 mg (tablets)', '5 mg/5mL oral solution', '25 mg/mL injection'],
  routes: ['oral', 'iv', 'im', 'rectal'],
  halfLife: '12-36 hours (biological)',
  pregnancyCategory: 'Category C (benefit likely outweighs risk)',
  lactation: 'Excreted in breast milk (safe at low doses)',
  monitoring: ['Blood glucose', 'Blood pressure', 'Bone density (if >3 months use)', 'Growth in children', 'Eye exam (if prolonged)'],
  interactions: [
    { drug: 'NSAIDs', severity: 'major', effect: 'Increased risk of GI ulceration and bleeding', mechanism: 'Additive mucosal injury' },
    { drug: 'Anticoagulants (Warfarin)', severity: 'moderate', effect: 'Altered INR (variable effect)', mechanism: 'Multiple mechanisms' },
    { drug: 'Insulin/Oral hypoglycemics', severity: 'moderate', effect: 'Increased blood glucose, need higher doses', mechanism: 'Counter-regulatory hormone effect' },
    { drug: 'Digoxin', severity: 'moderate', effect: 'Increased digoxin toxicity (hypokalemia)', mechanism: 'Mineralocorticoid effect' },
    { drug: 'Diuretics', severity: 'moderate', effect: 'Increased hypokalemia', mechanism: 'Additive potassium wasting' },
    { drug: 'Live vaccines', severity: 'major', effect: 'Risk of disseminated infection', mechanism: 'Immunosuppression' },
  ],
  onset: '1-2 hours (oral), immediate (IV)',
  duration: '12-36 hours',
  maxDailyDose: '60 mg (standard acute); up to 100 mg in severe disease',
  notes: 'Short courses (5-7 days) for acute exacerbations do NOT need tapering. Always use lowest effective dose for shortest duration. Calcium + Vitamin D supplementation if >3 months use.',
  mechanismOfAction: 'Binds to glucocorticoid receptors, modulating gene expression leading to anti-inflammatory and immunosuppressive effects via inhibition of NF-kB, AP-1, and reduction of cytokine production.',
  metabolism: 'Hepatic (prednisolone is active form; prednisone is pro-drug)',
  excretion: 'Renal (metabolites)',
});

reg({
  id: 'omeprazole', name: 'Omeprazole', genericName: 'Omeprazole magnesium', brandNames: ['Losec', 'Prilosec', 'Omecid'],
  drugClass: 'Proton Pump Inhibitor (PPI)', therapeuticCategory: 'Gastroenterology',
  indications: ['GERD', 'Peptic ulcer disease', 'HP eradication (triple therapy)', 'Stress ulcer prophylaxis', 'Zollinger-Ellison syndrome', 'NSAID-related ulcer prevention'],
  contraindications: ['Hypersensitivity', 'Concurrent atazanavir/rilpivirine', 'Long-term use without clear indication'],
  sideEffects: ['Headache', 'Nausea', 'Abdominal pain', 'Constipation', 'Flatulence', 'Diarrhea'],
  seriousSideEffects: ['C. difficile colitis', 'Osteoporosis-related fractures', 'Acute interstitial nephritis', 'Vitamin B12 deficiency', 'Hypomagnesemia', 'Fundic gland polyps'],
  dosing: {
    adult: [
      { route: 'oral', dose: '20 mg', frequency: 'Once daily', maxDaily: '40 mg/day', notes: 'Standard dose; take before breakfast' },
      { route: 'oral', dose: '40 mg', frequency: 'Once daily', notes: 'Erosive esophagitis, HP eradication' },
      { route: 'iv', dose: '20-40 mg', frequency: 'Once daily', notes: 'IV if unable to take oral' },
    ],
    pediatric: [
      { route: 'oral', dose: '0.7-3.3 mg/kg/day', frequency: 'Once daily', maxDaily: '40 mg/day', notes: 'Weight-based dosing' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'Max 20 mg/day in severe impairment',
    elderlyAdjustment: 'Standard dosing; consider shorter duration',
  },
  availableStrengths: ['10 mg', '20 mg', '40 mg (capsules)', '20 mg IV vial'],
  routes: ['oral', 'iv'],
  halfLife: '0.5-1 hour (effect lasts 24+ hours)',
  pregnancyCategory: 'Category B (most studied PPI in pregnancy)',
  lactation: 'Excreted in breast milk (considered compatible)',
  monitoring: ['Magnesium levels (if prolonged use)', 'Bone density (if >1 year use)', 'Vitamin B12 (if long-term)'],
  interactions: [
    { drug: 'Clopidogrel', severity: 'moderate', effect: 'Reduced clopidogrel efficacy (controversial)', mechanism: 'CYP2C19 inhibition' },
    { drug: 'Warfarin', severity: 'moderate', effect: 'Increased INR', mechanism: 'CYP450 inhibition' },
    { drug: 'Methotrexate', severity: 'major', effect: 'Increased methotrexate levels, toxicity', mechanism: 'Reduced renal clearance' },
    { drug: 'Citalopram/Escitalopram', severity: 'moderate', effect: 'Risk of QT prolongation with high-dose omeprazole', mechanism: 'CYP2C19 inhibition' },
    { drug: 'Iron supplements', severity: 'minor', effect: 'Reduced iron absorption', mechanism: 'Increased gastric pH' },
  ],
  onset: '1-4 hours (max effect at 3-5 days)',
  duration: '24-48 hours',
  maxDailyDose: '40 mg (up to 120 mg in Zollinger-Ellison)',
  notes: 'Most effective when taken 30-60 min before breakfast. Short-term (4-8 weeks) for most indications. Rebound acid hypersecretion upon withdrawal after >8 weeks.',
  mechanismOfAction: 'Irreversibly inhibits gastric H+/K+ ATPase (proton pump) in parietal cells, reducing gastric acid secretion by up to 99% at steady state.',
  metabolism: 'Hepatic (CYP2C19, CYP3A4)',
  excretion: 'Renal (80% metabolites)',
});

reg({
  id: 'diazepam', name: 'Diazepam', genericName: 'Diazepam', brandNames: ['Valium', 'Diazemuls', 'Stesolid'],
  drugClass: 'Benzodiazepine', therapeuticCategory: 'CNS / Psychiatry',
  indications: ['Status epilepticus (first-line)', 'Severe anxiety/panic', 'Alcohol withdrawal', 'Muscle spasm', 'Sedation (procedural)', 'Benzodiazepine withdrawal'],
  contraindications: ['Severe respiratory depression', 'Myasthenia gravis', 'Severe hepatic impairment', 'Sleep apnoea syndrome', 'Acute narrow-angle glaucoma', 'Benzodiazepine hypersensitivity'],
  sideEffects: ['Sedation', 'Drowsiness', 'Ataxia', 'Dizziness', 'Slurred speech', 'Confusion', 'Amnesia (anterograde)'],
  seriousSideEffects: ['Respiratory depression (with high doses/IV)', 'Paradoxical reaction (agitation)', 'Dependence (tolerance, withdrawal)', 'Falls (elderly)', 'Risk of abuse'],
  dosing: {
    adult: [
      { route: 'oral', dose: '5-10 mg', frequency: 'Every 6-8 hours PRN', maxDaily: '30 mg/day', notes: 'For anxiety/muscle spasm' },
      { route: 'iv', dose: '5-10 mg', frequency: 'Slow IV push (5 mg/min)', notes: 'For status epilepticus; may repeat after 10 min' },
      { route: 'rectal', dose: '5-10 mg', frequency: 'Single dose PR', notes: 'When IV not available; status epilepticus' },
      { route: 'oral', dose: '10-20 mg', frequency: 'Every 6-8 hours', notes: 'Alcohol withdrawal (reducing regimen)' },
    ],
    pediatric: [
      { route: 'iv', dose: '0.1-0.3 mg/kg/dose', frequency: 'Every 5-10 min PRN', maxDaily: '5 mg (children), 10 mg (adolescents)', notes: 'Status epilepticus' },
      { route: 'rectal', dose: '0.5 mg/kg', frequency: 'Single dose', notes: 'Max 10 mg; status epilepticus' },
    ],
    renalAdjustment: 'Caution; prolonged half-life in renal failure',
    hepaticAdjustment: 'Reduce dose by 50% in cirrhosis',
    elderlyAdjustment: 'Start 2-5 mg daily; avoid if possible (falls risk)',
  },
  availableStrengths: ['2 mg', '5 mg', '10 mg (tablets)', '5 mg/5mL oral solution', '5 mg/mL (injection)', '5 mg, 10 mg (rectal tubes)'],
  routes: ['oral', 'iv', 'rectal', 'im'],
  halfLife: '20-100 hours (active metabolite: 50-120 hours)',
  pregnancyCategory: 'Category D (avoid; risk of neonatal withdrawal)',
  lactation: 'Excreted in breast milk; avoid',
  monitoring: ['Respiratory rate (with IV)', 'Blood pressure', 'Level of sedation', 'Signs of dependence'],
  interactions: [
    { drug: 'Alcohol', severity: 'major', effect: 'Increased sedation, respiratory depression risk', mechanism: 'Additive CNS depression' },
    { drug: 'Opioids', severity: 'major', effect: 'Severe respiratory depression, coma', mechanism: 'Additive CNS depression' },
    { drug: 'Antipsychotics', severity: 'moderate', effect: 'Increased sedation', mechanism: 'Additive effect' },
    { drug: 'Phenytoin', severity: 'moderate', effect: 'Altered phenytoin levels', mechanism: 'CYP metabolism competition' },
    { drug: 'Omeprazole', severity: 'moderate', effect: 'Reduced diazepam clearance', mechanism: 'CYP2C19 inhibition' },
  ],
  onset: 'Oral: 30-60 min; IV: 1-3 min; Rectal: 5-10 min',
  duration: '6-24 hours (acute effects); 2-7 days (biological)',
  maxDailyDose: '30 mg (oral); up to 40 mg IV in status epilepticus',
  notes: 'First-line for status epilepticus (IV/rectal). Short-term use only (max 2-4 weeks) for anxiety due to dependence risk. For alcohol withdrawal, use a symptom-triggered or fixed-dose reducing regimen.',
  mechanismOfAction: 'Binds to GABA-A receptor at the benzodiazepine site, potentiating GABA-mediated chloride influx, leading to neuronal hyperpolarization and CNS depression.',
  metabolism: 'Hepatic (CYP2C19, CYP3A4) to active metabolite (desmethyldiazepam)',
  excretion: 'Renal (metabolites)',
});

reg({
  id: 'haloperidol', name: 'Haloperidol', genericName: 'Haloperidol', brandNames: ['Haldol', 'Serenace', 'Dozirol'],
  drugClass: 'Typical Antipsychotic (Butyrophenone)', therapeuticCategory: 'Psychiatry',
  indications: ['Acute psychosis', 'Schizophrenia (positive symptoms)', 'Delirium', 'Acute agitation', 'Tourette syndrome', 'Nausea/vomiting (off-label)'],
  contraindications: ['Parkinson disease (severe EPS risk)', 'Comatose states', 'CNS depression', 'QT prolongation (baseline)', 'Lewy body dementia'],
  sideEffects: ['Extrapyramidal symptoms (dystonia, akathisia, parkinsonism)', 'Sedation', 'Dry mouth', 'Constipation', 'Blurred vision'],
  seriousSideEffects: ['Tardive dyskinesia (long-term)', 'Neuroleptic malignant syndrome', 'QT prolongation / Torsades de pointes', 'Seizures', 'Agranulocytosis (rare)'],
  dosing: {
    adult: [
      { route: 'oral', dose: '1.5-5 mg', frequency: 'Every 8-12 hours', maxDaily: '20 mg/day', notes: 'Start low in elderly/naive' },
      { route: 'im', dose: '2.5-10 mg', frequency: 'Every 1-8 hours PRN', maxDaily: '20 mg/day', notes: 'For acute agitation' },
      { route: 'iv', dose: '2.5-5 mg', frequency: 'Slow IV', notes: 'For delirium/ICU agitation' },
      { route: 'oral', dose: '5-20 mg', frequency: 'Once daily', notes: 'Maintenance in chronic psychosis' },
    ],
    pediatric: [
      { route: 'oral', dose: '0.01-0.05 mg/kg/day', frequency: 'Divided BID', notes: 'Start low; very potent' },
    ],
    renalAdjustment: 'No adjustment needed',
    hepaticAdjustment: 'Reduce dose in severe impairment',
    elderlyAdjustment: 'Start 0.5-1 mg daily; extreme caution',
  },
  availableStrengths: ['0.5 mg', '1.5 mg', '5 mg', '10 mg (tablets)', '2 mg/mL (oral liquid)', '5 mg/mL (injection)'],
  routes: ['oral', 'im', 'iv'],
  halfLife: '12-36 hours (oral); 21 hours (IM depot)',
  pregnancyCategory: 'Category C',
  lactation: 'Excreted in breast milk; monitor infant for sedation',
  monitoring: ['ECG (QT interval at baseline and with dose increases)', 'Extrapyramidal symptom assessment', 'Liver function tests', 'CBC (agranulocytosis screen)'],
  interactions: [
    { drug: 'QT-prolonging drugs', severity: 'major', effect: 'Increased risk of fatal arrhythmias', mechanism: 'Additive QT prolongation' },
    { drug: 'CNS depressants (alcohol, opioids)', severity: 'major', effect: 'Increased sedation and respiratory depression', mechanism: 'Additive CNS depression' },
    { drug: 'Fluoxetine/Paroxetine', severity: 'moderate', effect: 'Increased haloperidol levels', mechanism: 'CYP2D6 inhibition' },
    { drug: 'Lithium', severity: 'moderate', effect: 'Encephalopathy risk (rare)', mechanism: 'Unknown' },
    { drug: 'Anticholinergics', severity: 'moderate', effect: 'May worsen EPS via central anticholinergic mechanisms', mechanism: 'Cholinergic-dopaminergic imbalance' },
  ],
  onset: 'Oral: 30-60 min; IM: 15-30 min; IV: 5-10 min',
  duration: '12-72 hours',
  maxDailyDose: '20 mg (oral), 20 mg (IM), 15 mg (IV)',
  notes: 'Gold-standard for acute agitation and delirium. High EPS risk, especially at high doses. Always use lowest effective dose. Monitor QTc at baseline and with each dose increase.',
  mechanismOfAction: 'Potent D2 dopamine receptor antagonist in mesolimbic and mesocortical pathways. Also has some sigma and alpha-1 receptor affinity.',
  metabolism: 'Hepatic (CYP3A4, CYP2D6)',
  excretion: 'Renal (60%), biliary (40%)',
});

reg({
  id: 'morphine', name: 'Morphine', genericName: 'Morphine sulfate', brandNames: ['Oramorph', 'MST Continus', 'Sevredol', 'Morphine'],
  drugClass: 'Opioid Analgesic', therapeuticCategory: 'Pain Management',
  indications: ['Moderate-severe acute pain', 'Post-operative pain', 'Myocardial infarction (chest pain)', 'Cancer pain', 'Pulmonary oedema (acute, reduces preload/afterload)', 'End-of-life care'],
  contraindications: ['Respiratory depression', 'Severe asthma/COPD', 'Paralytic ileus', 'Head injury (raised ICP)', 'Pheochromocytoma', 'Concurrent MAOIs', 'Hypersensitivity'],
  sideEffects: ['Nausea/vomiting', 'Constipation', 'Sedation', 'Dizziness', 'Pruritus', 'Urinary retention', 'Confusion'],
  seriousSideEffects: ['Respiratory depression', 'Hypotension', 'Bradycardia', 'Opioid dependence/tolerance', 'Adrenal insufficiency (prolonged use)'],
  dosing: {
    adult: [
      { route: 'oral', dose: '5-20 mg', frequency: 'Every 4 hours PRN', maxDaily: 'No absolute max; titrate to effect', notes: 'Immediate release (Oramorph, Sevredol)' },
      { route: 'oral', dose: '10-30 mg', frequency: 'Every 12 hours', notes: 'Modified release (MST Continus)' },
      { route: 'iv', dose: '2.5-10 mg', frequency: 'Slow IV over 4-5 min', notes: 'Titrate to effect; have naloxone ready' },
      { route: 'sc', dose: '5-10 mg', frequency: 'Every 4 hours', notes: 'SC if no IV access' },
      { route: 'sc', dose: '0.5-2 mg/hour', frequency: 'Continuous infusion', notes: 'Via syringe driver; for end-of-life care' },
    ],
    pediatric: [
      { route: 'oral', dose: '0.2-0.5 mg/kg/dose', frequency: 'Every 4-6 hours', notes: 'Max 15 mg/dose' },
      { route: 'iv', dose: '0.05-0.1 mg/kg/dose', frequency: 'Every 2-4 hours', notes: 'Titrate to effect with caution' },
    ],
    renalAdjustment: 'Reduce dose by 50% if CrCl <30; avoid in ESRD',
    hepaticAdjustment: 'Reduce dose; increased bioavailability',
    elderlyAdjustment: 'Start at 50% of adult dose; increase slowly',
  },
  availableStrengths: ['5 mg', '10 mg', '15 mg', '20 mg (tablets)', '10 mg/5mL oral solution', '10 mg/mL (injection)'],
  routes: ['oral', 'iv', 'sc', 'im', 'rectal', 'intrathecal'],
  halfLife: '2-4 hours (adults); increased in elderly/renal failure',
  pregnancyCategory: 'Category C (avoid in labour; neonatal respiratory depression)',
  lactation: 'Excreted in breast milk (safe at low doses)',
  monitoring: ['Pain score (regularly)', 'Respiratory rate (monitor hourly for 12h after initiation)', 'Oxygen saturation', 'Sedation score', 'Bowel function', 'Nausea/vomiting'],
  interactions: [
    { drug: 'Benzodiazepines (Diazepam)', severity: 'major', effect: 'Severe respiratory depression, coma, death', mechanism: 'Additive CNS depression' },
    { drug: 'Alcohol', severity: 'major', effect: 'Increased sedation and respiratory depression', mechanism: 'Additive CNS depression' },
    { drug: 'MAOIs', severity: 'major', effect: 'Life-threatening serotonin syndrome or CNS excitation', mechanism: 'Serotonin/noradrenaline interaction' },
    { drug: 'Gabapentin/Pregabalin', severity: 'major', effect: 'Increased risk of opioid-related death', mechanism: 'Additive CNS depression' },
    { drug: 'Metoclopramide', severity: 'moderate', effect: 'Increased risk of extrapyramidal side effects', mechanism: 'Additive dopaminergic blockade' },
  ],
  onset: 'Oral: 30 min; IV: 5-10 min; SC: 15-30 min',
  duration: 'Oral IR: 4-6h; Oral MR: 12-24h; IV: 2-4h',
  maxDailyDose: 'No absolute maximum; titrate to effect with appropriate monitoring',
  notes: 'Gold-standard opioid for moderate-severe pain. Always prescribe with anti-emetic and laxative (PRN). Naloxone should be available. Monitor respiratory rate closely. Morphine is pro-drug, partially metabolized to M6G (more potent).',
  mechanismOfAction: 'Agonist at mu-opioid receptors (primarily), also kappa and delta, in CNS and periphery, producing analgesia, sedation, euphoria and respiratory depression.',
  metabolism: 'Hepatic (glucuronidation to M3G, M6G)',
  excretion: 'Renal (90% metabolites)',
});

export function getDrug(id: string): DrugEntry | undefined {
  return DRUG_DATABASE[id];
}

export function searchDrugs(query: string): DrugEntry[] {
  const q = query.toLowerCase();
  return Object.values(DRUG_DATABASE).filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.genericName.toLowerCase().includes(q) ||
    d.brandNames.some(b => b.toLowerCase().includes(q)) ||
    d.drugClass.toLowerCase().includes(q) ||
    d.indications.some(i => i.toLowerCase().includes(q))
  );
}

export function getDrugsByCategory(category: string): DrugEntry[] {
  return Object.values(DRUG_DATABASE).filter(d =>
    d.therapeuticCategory.toLowerCase().includes(category.toLowerCase())
  );
}

export function getDrugsByClass(drugClass: string): DrugEntry[] {
  return Object.values(DRUG_DATABASE).filter(d =>
    d.drugClass.toLowerCase().includes(drugClass.toLowerCase())
  );
}

export function checkInteractions(drugIds: string[]): { drugA: string; drugB: string; severity: string; effect: string; mechanism?: string }[] {
  const results: { drugA: string; drugB: string; severity: string; effect: string; mechanism?: string }[] = [];
  for (let i = 0; i < drugIds.length; i++) {
    for (let j = i + 1; j < drugIds.length; j++) {
      const a = DRUG_DATABASE[drugIds[i]];
      const b = DRUG_DATABASE[drugIds[j]];
      if (!a || !b) continue;
      const aToB = a.interactions.find(int => int.drug.toLowerCase() === b.name.toLowerCase());
      const bToA = b.interactions.find(int => int.drug.toLowerCase() === a.name.toLowerCase());
      const interaction = aToB || bToA;
      if (interaction) {
        results.push({
          drugA: a.name,
          drugB: b.name,
          severity: interaction.severity,
          effect: interaction.effect,
          mechanism: interaction.mechanism,
        });
      }
    }
  }
  return results;
}

export function generateDosingSuggestion(drugId: string, age: number, weightKg: number, eGFR?: number, isElderly?: boolean, pregnancy?: boolean): DrugDose[] {
  const drug = DRUG_DATABASE[drugId];
  if (!drug) return [];

  let doses = [...drug.dosing.adult];

  if (age < 18 && drug.dosing.pediatric && drug.dosing.pediatric.length > 0) {
    doses = drug.dosing.pediatric;
  }

  if (isElderly && drug.dosing.elderlyAdjustment) {
    doses = doses.map(d => ({ ...d, notes: [d.notes, drug.dosing.elderlyAdjustment].filter(Boolean).join('; ') }));
  }

  if (eGFR !== undefined && drug.dosing.renalAdjustment) {
    doses = doses.map(d => ({ ...d, notes: [d.notes, drug.dosing.renalAdjustment].filter(Boolean).join('; ') }));
  }

  return doses;
}

export function checkContraindications(drugId: string, patient: { age?: number; weightKg?: number; eGFR?: number; pregnancy?: boolean; conditions?: string[]; allergies?: string[] }): string[] {
  const drug = DRUG_DATABASE[drugId];
  if (!drug) return ['Drug not found'];

  const warnings: string[] = [];

  for (const ci of drug.contraindications) {
    if (patient.conditions) {
      for (const condition of patient.conditions) {
        if (ci.toLowerCase().includes(condition.toLowerCase()) || condition.toLowerCase().includes(ci.toLowerCase())) {
          warnings.push(`Contraindication: ${ci}`);
        }
      }
    }
    if (patient.allergies) {
      for (const allergy of patient.allergies) {
        if (ci.toLowerCase().includes(allergy.toLowerCase())) {
          warnings.push(`Allergy caution: ${ci}`);
        }
      }
    }
    if (patient.pregnancy && ci.toLowerCase().includes('pregnancy')) {
      warnings.push(`Pregnancy contraindication: ${ci}`);
    }
    if (ci.toLowerCase().includes('severe renal') && patient.eGFR !== undefined && patient.eGFR < 30) {
      warnings.push(`Renal contraindication: ${ci}`);
    }
  }

  if (drug.pregnancyCategory === 'Category X' && patient.pregnancy) {
    warnings.push('ABSOLUTE CONTRAINDICATION: Category X drug in pregnancy');
  }

  return warnings;
}

export function calculateDoseByWeight(drugId: string, weightKg: number, isPediatric: boolean): string {
  const drug = DRUG_DATABASE[drugId];
  if (!drug) return 'Drug not found';

  if (isPediatric && drug.dosing.pediatric && drug.dosing.pediatric.length > 0) {
    const pedDose = drug.dosing.pediatric[0];
    if (pedDose.dose.includes('mg/kg')) {
      const mgPerKg = parseFloat(pedDose.dose.replace('mg/kg', '')) || 0;
      const calculatedDose = mgPerKg * weightKg;
      return `${calculatedDose.toFixed(1)} mg ${pedDose.frequency}`;
    }
  }

  return drug.dosing.adult[0]?.dose || '';
}

export function getCommonDrugs(): { id: string; name: string; category: string }[] {
  return Object.values(DRUG_DATABASE).map(d => ({
    id: d.id,
    name: d.name,
    category: d.therapeuticCategory,
  }));
}

export function searchDrugsBasic(query: string): DrugEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return Object.values(DRUG_DATABASE).filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.genericName.toLowerCase().includes(q) ||
    d.id.toLowerCase().includes(q) ||
    d.brandNames.some(b => b.toLowerCase().includes(q))
  );
}

export function getDosingSummary(drugId: string, route?: string): string {
  const drug = DRUG_DATABASE[drugId];
  if (!drug) return '';
  const doses = route
    ? drug.dosing.adult.filter(d => d.route.toLowerCase() === route.toLowerCase())
    : drug.dosing.adult;
  if (doses.length === 0) return drug.dosing.adult[0]?.dose || '';
  return doses.map(d => `${d.dose} ${d.frequency}${d.maxDaily ? ` (max ${d.maxDaily})` : ''}`).join('; ');
}

export { DRUG_DATABASE };
