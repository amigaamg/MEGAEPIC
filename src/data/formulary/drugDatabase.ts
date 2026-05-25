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

export { DRUG_DATABASE };
