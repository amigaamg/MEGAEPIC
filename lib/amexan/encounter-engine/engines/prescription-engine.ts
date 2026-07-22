import type { PrescriptionOrder, PrescriptionStatus, EncounterPhase } from '../types/ces';
import type { AutoExecutionPlan } from './protocol-auto-executor';

export interface DrugKnowledge {
  drugName: string;
  genericName: string;
  drugClass: string;
  dose: string;
  doseUnit: string;
  route: string;
  frequency: string;
  duration: string;
  durationUnit: string;
  indication: string;
  category: 'definitive' | 'supportive' | 'preventive';
  allergies: string[];
  contraindications: string[];
  interactions: string[];
  warnings: string[];
  patientInstructions: string;
  alternatives: string[];
  requiresRenalAdjustment: boolean;
  requiresHepaticAdjustment: boolean;
  pregnancyRisk: 'safe' | 'caution' | 'contraindicated' | 'not_assessed';
}

const DRUG_KNOWLEDGE_BASE: Record<string, DrugKnowledge> = {
  'artemether-lumefantrine': {
    drugName: 'Artemether-Lumefantrine', genericName: 'Artemether 20mg + Lumefantrine 120mg', drugClass: 'Antimalarial',
    dose: '4 tablets', doseUnit: 'mg', route: 'PO', frequency: '0, 8, 24, 36, 48, 60h',
    duration: '3', durationUnit: 'days',
    indication: 'Uncomplicated falciparum malaria', category: 'definitive',
    allergies: ['artemisinin derivatives'], contraindications: ['severe malaria (monotherapy)', 'first trimester (caution)'],
    interactions: ['CYP3A4 inducers/substrates', 'grapefruit juice'], warnings: ['Correct hypoglycemia before use', 'Take with fatty meal'],
    patientInstructions: 'Take tablets with water or milk. Repeat dose if vomiting within 1 hour.', alternatives: ['Dihydroartemisinin-Piperaquine', 'Quinine + Clindamycin', 'Artesunate + Amodiaquine'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'caution',
  },
  'quinine': {
    drugName: 'Quinine', genericName: 'Quinine sulfate', drugClass: 'Antimalarial',
    dose: '600 mg', doseUnit: 'mg', route: 'PO', frequency: 'Q8H',
    duration: '7', durationUnit: 'days',
    indication: 'Severe malaria (after IV artesunate) or uncomplicated malaria', category: 'definitive',
    allergies: ['quinine', 'quinidine'], contraindications: ['G6PD deficiency', 'optic neuritis', 'tinnitus'],
    interactions: ['Warfarin (increased INR)', 'digoxin', 'mefloquine'], warnings: ['Cinconism risk (tinnitus, headache, visual disturbance)', 'QT prolongation', 'Hypoglycemia'],
    patientInstructions: 'Take with food. Report ringing in ears, vision changes, or rash immediately.', alternatives: ['Artemether-Lumefantrine', 'Dihydroartemisinin-Piperaquine'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'artesunate': {
    drugName: 'Artesunate', genericName: 'Artesunate', drugClass: 'Antimalarial',
    dose: '2.4 mg/kg', doseUnit: 'mg/kg', route: 'IV/IM', frequency: '0, 12, 24h then daily',
    duration: 'minimum 24', durationUnit: 'hours',
    indication: 'Severe malaria — first-line', category: 'definitive',
    allergies: ['artemisinin derivatives'], contraindications: ['None for severe malaria'],
    interactions: [], warnings: ['Monitor for post-malaria neurological syndrome (rare)', 'Correct hypoglycemia'],
    patientInstructions: 'IV infusion over 1-2 minutes. Follow with oral ACT when tolerating.', alternatives: ['Quinine IV (if artesunate unavailable)'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'amoxicillin': {
    drugName: 'Amoxicillin', genericName: 'Amoxicillin', drugClass: 'Penicillin antibiotic',
    dose: '1 g', doseUnit: 'g', route: 'PO', frequency: 'Q8H',
    duration: '7', durationUnit: 'days',
    indication: 'Community-acquired pneumonia, URTI, UTI', category: 'definitive',
    allergies: ['penicillins', 'cephalosporins (cross-reactivity)'], contraindications: ['Penicillin allergy (anaphylaxis history)'],
    interactions: ['Methotrexate', 'warfarin', 'oral contraceptives (reduced efficacy)'], warnings: ['Assess for penicillin allergy before prescribing', 'Monitor for rash, diarrhea'],
    patientInstructions: 'Take with or without food. Complete full course even if feeling better.', alternatives: ['Cefuroxime', 'Clarithromycin', 'Doxycycline'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'amoxicillin-clavulanate': {
    drugName: 'Amoxicillin-Clavulanate', genericName: 'Amoxicillin 875mg + Clavulanic acid 125mg', drugClass: 'Penicillin antibiotic + beta-lactamase inhibitor',
    dose: '875/125 mg', doseUnit: 'mg', route: 'PO', frequency: 'Q12H',
    duration: '7', durationUnit: 'days',
    indication: 'CAP, sinusitis, UTI, animal bite prophylaxis', category: 'definitive',
    allergies: ['penicillins', 'cephalosporins (cross-reactivity)'], contraindications: ['Penicillin allergy', 'Hepatic impairment (previous clavulanate-induced)'],
    interactions: ['Methotrexate', 'warfarin', 'allopurinol (rash risk)'], warnings: ['Hepatotoxicity risk (especially elderly, prolonged use)', 'Monitor LFTs if >7 days'],
    patientInstructions: 'Take with food to reduce GI upset. Watch for jaundice, dark urine.', alternatives: ['Cefpodoxime', 'Ceftriaxone IV', 'Levofloxacin'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: true, pregnancyRisk: 'safe',
  },
  'ceftriaxone': {
    drugName: 'Ceftriaxone', genericName: 'Ceftriaxone sodium', drugClass: 'Third-generation cephalosporin',
    dose: '2 g', doseUnit: 'g', route: 'IV/IM', frequency: 'Q24H',
    duration: '7', durationUnit: 'days',
    indication: 'Severe CAP, meningitis, sepsis, typhoid fever', category: 'definitive',
    allergies: ['cephalosporins', 'penicillins (cross-reactivity ~10%)'], contraindications: ['Neonates with hyperbilirubinemia (Ca- ceftriaxone precipitates)'],
    interactions: ['Warfarin (increased INR)', 'calcium-containing IV solutions'], warnings: ['Biliary pseudolithiasis (reversible)', 'Monitor for C. diff diarrhea'],
    patientInstructions: 'IV infusion over 30 min. IM with lidocaine for deep injection.', alternatives: ['Cefotaxime', 'Ceftazidime', 'Piperacillin-Tazobactam'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'cefuroxime': {
    drugName: 'Cefuroxime', genericName: 'Cefuroxime axetil', drugClass: 'Second-generation cephalosporin',
    dose: '500 mg', doseUnit: 'mg', route: 'PO', frequency: 'Q12H',
    duration: '7', durationUnit: 'days',
    indication: 'Mild-moderate CAP, sinusitis, UTI', category: 'definitive',
    allergies: ['cephalosporins', 'penicillins (caution)'], contraindications: ['Known cephalosporin allergy'],
    interactions: ['Warfarin', 'probenecid'], warnings: ['Crush tablet if swallowing difficult (bitter taste)'],
    patientInstructions: 'Take with food. Complete full course.', alternatives: ['Amoxicillin-Clavulanate', 'Cefpodoxime', 'Levofloxacin'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'azithromycin': {
    drugName: 'Azithromycin', genericName: 'Azithromycin', drugClass: 'Macrolide antibiotic',
    dose: '500 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: '3-5', durationUnit: 'days',
    indication: 'CAP (atypical coverage), enteric fever, STI', category: 'definitive',
    allergies: ['macrolides'], contraindications: ['QT prolongation', 'history of cholestatic jaundice with macrolides'],
    interactions: ['Warfarin', 'statins (increased myopathy risk)', 'antiarrhythmics (QT prolongation)'], warnings: ['QT prolongation risk (especially elderly, electrolyte abnormalities)', 'Hepatotoxicity'],
    patientInstructions: 'Take 1 hour before or 2 hours after food. Avoid if history of heart rhythm problems.', alternatives: ['Clarithromycin', 'Doxycycline', 'Levofloxacin'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'safe',
  },
  'doxycycline': {
    drugName: 'Doxycycline', genericName: 'Doxycycline hyclate', drugClass: 'Tetracycline antibiotic',
    dose: '100 mg', doseUnit: 'mg', route: 'PO', frequency: 'Q12H',
    duration: '10', durationUnit: 'days',
    indication: 'CAP, malaria prophylaxis, acne, rickettsial infections', category: 'definitive',
    allergies: ['tetracyclines'], contraindications: ['Children <8 years', 'pregnancy (2nd/3rd trimester)', 'breastfeeding'],
    interactions: ['Antacids (Ca, Mg, Al)', 'iron, bismuth', 'warfarin', 'oral contraceptives'], warnings: ['Photosensitivity (avoid sun/UV)', 'Esophageal ulceration (take with full glass of water, sit upright)'],
    patientInstructions: 'Take with full glass of water. Avoid lying down for 30 min. Use sunscreen.', alternatives: ['Azithromycin', 'Cefuroxime', 'Levofloxacin'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'contraindicated',
  },
  'ciprofloxacin': {
    drugName: 'Ciprofloxacin', genericName: 'Ciprofloxacin', drugClass: 'Fluoroquinolone antibiotic',
    dose: '500 mg', doseUnit: 'mg', route: 'PO', frequency: 'Q12H',
    duration: '7', durationUnit: 'days',
    indication: 'UTI, pyelonephritis, GI infections, typhoid', category: 'definitive',
    allergies: ['fluoroquinolones'], contraindications: ['Children <18 years (cartilage damage)', 'QT prolongation', 'epilepsy', 'tendon disease'],
    interactions: ['Antacids, iron, zinc (2h separation)', 'warfarin', 'theophylline', 'NSAIDs (seizure risk)'], warnings: ['Tendonitis/tendon rupture (especially elderly on steroids)', 'QT prolongation', 'CNS effects (dizziness, confusion)'],
    patientInstructions: 'Take with water. Avoid antacids 2h before/after. Stop if tendon pain or swelling.', alternatives: ['Ceftriaxone', 'Azithromycin', 'TMP-SMX'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'contraindicated',
  },
  'levofloxacin': {
    drugName: 'Levofloxacin', genericName: 'Levofloxacin', drugClass: 'Fluoroquinolone antibiotic',
    dose: '750 mg', doseUnit: 'mg', route: 'PO/IV', frequency: 'QD',
    duration: '7', durationUnit: 'days',
    indication: 'CAP, HAP, complicated UTI, prostatitis', category: 'definitive',
    allergies: ['fluoroquinolones'], contraindications: ['Epilepsy', 'QT prolongation', 'tendon disease', 'children'],
    interactions: ['NSAIDs (CNS toxicity)', 'warfarin', 'antidiabetics (dysglycemia)', 'theophylline'], warnings: ['Tendon rupture (black box)', 'QT prolongation', 'CNS effects', 'Aortic aneurysm risk'],
    patientInstructions: 'Take same time daily. Stay hydrated. Report tendon pain, palpitations, confusion.', alternatives: ['Ceftriaxone', 'Azithromycin', 'Cefpodoxime'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'contraindicated',
  },
  'metronidazole': {
    drugName: 'Metronidazole', genericName: 'Metronidazole', drugClass: 'Nitroimidazole antibiotic',
    dose: '500 mg', doseUnit: 'mg', route: 'PO/IV', frequency: 'Q8H',
    duration: '7', durationUnit: 'days',
    indication: 'Anaerobic infections, diverticulitis, PID, C. diff', category: 'definitive',
    allergies: ['nitroimidazoles'], contraindications: ['First trimester pregnancy', 'active neurological disease'],
    interactions: ['Warfarin (increased INR)', 'alcohol (disulfiram-like reaction)', 'lithium'], warnings: ['Metallic taste (common)', 'Peripheral neuropathy (long-term)', 'Candidiasis overgrowth'],
    patientInstructions: 'Avoid alcohol during treatment and 48h after. Metallic taste is normal.', alternatives: ['Clindamycin', 'Vancomycin (for C. diff)'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'caution',
  },
  'clindamycin': {
    drugName: 'Clindamycin', genericName: 'Clindamycin', drugClass: 'Lincosamide antibiotic',
    dose: '600 mg', doseUnit: 'mg', route: 'IV/PO', frequency: 'Q8H',
    duration: '7', durationUnit: 'days',
    indication: 'Anaerobic infections, aspiration pneumonia, bone/joint infections', category: 'definitive',
    allergies: ['clindamycin'], contraindications: ['IBD (may exacerbate colitis)', 'Myasthenia gravis'],
    interactions: ['Neuromuscular blockers (enhanced blockade)', 'erythromycin (antagonism)'], warnings: ['C. diff diarrhea (common — monitor)', 'Hypersensitivity reactions'],
    patientInstructions: 'Take with food to reduce GI upset. Report watery/bloody diarrhea immediately.', alternatives: ['Metronidazole', 'Vancomycin', 'Linezolid'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'safe',
  },
  'prednisolone': {
    drugName: 'Prednisolone', genericName: 'Prednisolone', drugClass: 'Corticosteroid',
    dose: '40 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: '5-7', durationUnit: 'days',
    indication: 'Severe CAP (adjunctive), COPD exacerbation, asthma', category: 'supportive',
    allergies: ['corticosteroids'], contraindications: ['Systemic fungal infection', 'live vaccine', 'uncontrolled diabetes (caution)'],
    interactions: ['NSAIDs (GI bleed risk)', 'warfarin', 'antidiabetics (hyperglycemia)', 'CYP3A4 inducers/inhibitors'], warnings: ['Hyperglycemia', 'immunosuppression', 'osteoporosis (long-term)', 'adrenal suppression (taper if >3 weeks)'],
    patientInstructions: 'Take with food in AM. Do not stop abruptly. Monitor blood glucose if diabetic.', alternatives: ['Dexamethasone', 'Hydrocortisone', 'Methylprednisolone'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'dexamethasone': {
    drugName: 'Dexamethasone', genericName: 'Dexamethasone', drugClass: 'Corticosteroid',
    dose: '6 mg', doseUnit: 'mg', route: 'PO/IV', frequency: 'QD',
    duration: '5-10', durationUnit: 'days',
    indication: 'COVID-19 (severe), meningitis (adjunctive), cerebral malaria', category: 'supportive',
    allergies: ['corticosteroids'], contraindications: ['Systemic fungal infection', 'uncontrolled hypertension'],
    interactions: ['NSAIDs', 'warfarin', 'antidiabetics'], warnings: ['Hyperglycemia common', 'psychiatric reactions', 'immunosuppression'],
    patientInstructions: 'Take with food in AM. Monitor blood glucose.', alternatives: ['Prednisolone', 'Methylprednisolone', 'Hydrocortisone'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'paracetamol': {
    drugName: 'Paracetamol', genericName: 'Acetaminophen', drugClass: 'Analgesic/Antipyretic',
    dose: '1 g', doseUnit: 'g', route: 'PO/IV', frequency: 'Q4-6H PRN',
    duration: '3-5', durationUnit: 'days',
    indication: 'Fever, mild-moderate pain', category: 'supportive',
    allergies: ['paracetamol'], contraindications: ['Severe hepatic impairment'],
    interactions: ['Warfarin (increased INR with chronic high-dose)'], warnings: ['Maximum 4 g/day (adults) — hepatotoxicity above', 'Liver toxicity risk in malnutrition/alcoholism'],
    patientInstructions: 'Do not exceed 8 tablets (4g) in 24 hours. Avoid alcohol.', alternatives: ['Ibuprofen', 'Aspirin (adults only)'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'safe',
  },
  'ibuprofen': {
    drugName: 'Ibuprofen', genericName: 'Ibuprofen', drugClass: 'NSAID',
    dose: '400 mg', doseUnit: 'mg', route: 'PO', frequency: 'TID PRN',
    duration: '3-5', durationUnit: 'days',
    indication: 'Fever, mild-moderate pain, inflammation', category: 'supportive',
    allergies: ['NSAIDs', 'aspirin (cross-reactivity)'], contraindications: ['Active peptic ulcer', 'severe renal impairment', 'aspirin-sensitive asthma', 'third trimester pregnancy'],
    interactions: ['Warfarin (bleeding risk)', 'ACE inhibitors/ARBs (renal impairment)', 'aspirin', 'methotrexate', 'lithium'], warnings: ['GI bleeding risk (especially elderly, steroids, anticoagulants)', 'Renal impairment', 'Cardiovascular risk (high-dose/long-term)'],
    patientInstructions: 'Take with food to reduce GI upset. Shortest duration needed.', alternatives: ['Paracetamol', 'Diclofenac', 'Naproxen'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'contraindicated',
  },
  'furosemide': {
    drugName: 'Furosemide', genericName: 'Furosemide', drugClass: 'Loop diuretic',
    dose: '40 mg', doseUnit: 'mg', route: 'PO/IV', frequency: 'QD-BID',
    duration: '7', durationUnit: 'days',
    indication: 'Hypertension, heart failure, edema, renal impairment', category: 'definitive',
    allergies: ['sulfonamides (caution)'], contraindications: ['Anuria', 'severe hypokalemia', 'hypovolemia', 'hepatic coma'],
    interactions: ['Digoxin (hypokalemia → toxicity)', 'ACE inhibitors (hypotension)', 'NSAIDs (reduced efficacy)', 'aminoglycosides (ototoxicity)'], warnings: ['Monitor potassium, sodium, magnesium, renal function', 'hypotension', 'ototoxicity (high-dose IV)'],
    patientInstructions: 'Take in AM to avoid nocturia. Report muscle cramps, dizziness, hearing changes.', alternatives: ['Hydrochlorothiazide', 'Spironolactone', 'Torsemide'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'caution',
  },
  'lisinopril': {
    drugName: 'Lisinopril', genericName: 'Lisinopril', drugClass: 'ACE inhibitor',
    dose: '10 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: 'ongoing', durationUnit: 'days',
    indication: 'Hypertension, heart failure, diabetic nephropathy', category: 'definitive',
    allergies: ['ACE inhibitors'], contraindications: ['Pregnancy', 'angioedema history', 'bilateral renal artery stenosis'],
    interactions: ['Potassium-sparing diuretics (hyperkalemia)', 'NSAIDs (reduced efficacy)', 'lithium'], warnings: ['Monitor potassium and creatinine', 'angiodeema risk', 'dry cough (common)', 'first-dose hypotension'],
    patientInstructions: 'Report swelling of face/lips/tongue immediately. Avoid salt substitutes with potassium.', alternatives: ['Losartan (ARB)', 'Amlodipine', 'Hydrochlorothiazide'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'contraindicated',
  },
  'amlodipine': {
    drugName: 'Amlodipine', genericName: 'Amlodipine besylate', drugClass: 'Calcium channel blocker',
    dose: '5 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: 'ongoing', durationUnit: 'days',
    indication: 'Hypertension, angina', category: 'definitive',
    allergies: ['dihydropyridine CCBs'], contraindications: ['Severe hypotension', 'cardiogenic shock', 'unstable angina (caution)'],
    interactions: ['CYP3A4 inhibitors (verapamil, diltiazem — bradycardia)', 'grapefruit juice'], warnings: ['Peripheral edema (common)', 'headache', 'dizziness', 'gingival hyperplasia'],
    patientInstructions: 'Take same time daily. Ankle swelling is common — elevate legs. Report palpitations.', alternatives: ['Lisinopril', 'Losartan', 'Hydrochlorothiazide'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'caution',
  },
  'metformin': {
    drugName: 'Metformin', genericName: 'Metformin hydrochloride', drugClass: 'Biguanide — antidiabetic',
    dose: '500 mg', doseUnit: 'mg', route: 'PO', frequency: 'BID',
    duration: 'ongoing', durationUnit: 'days',
    indication: 'Type 2 diabetes mellitus', category: 'definitive',
    allergies: ['metformin'], contraindications: ['eGFR <30 mL/min', 'acute/chronic metabolic acidosis', 'severe hepatic impairment', 'acute illness with dehydration'],
    interactions: ['Contrast dye (hold metformin 48h before/after)', 'alcohol (lactic acidosis risk)', 'cimetidine'], warnings: ['Lactic acidosis (rare but serious)', 'monitor renal function', 'hold during acute illness/surgery', 'Vitamin B12 deficiency (long-term)'],
    patientInstructions: 'Take with meals. Report unusual muscle pain, extreme fatigue, difficulty breathing.', alternatives: ['Glimepiride', 'Empagliflozin', 'Pioglitazone'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: true, pregnancyRisk: 'safe',
  },
  'insulin': {
    drugName: 'Insulin (soluble/regular)', genericName: 'Soluble insulin', drugClass: 'Insulin',
    dose: '0.1 U/kg', doseUnit: 'U/kg', route: 'IV', frequency: 'Continuous infusion',
    duration: 'as needed', durationUnit: 'hours',
    indication: 'Hyperglycemia, DKA, HHS, severe illness', category: 'definitive',
    allergies: ['insulin (allergy — rare)'], contraindications: ['Hypoglycemia'],
    interactions: ['Beta-blockers (mask hypoglycemia symptoms)', 'corticosteroids (↑ requirement)'], warnings: ['Monitor blood glucose hourly', 'hypoglycemia risk', 'potassium shifts (monitor K+)'],
    patientInstructions: 'Do NOT skip meals after insulin. Always carry glucose source.', alternatives: ['Insulin analogues (rapid-acting, long-acting)'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'warfarin': {
    drugName: 'Warfarin', genericName: 'Warfarin sodium', drugClass: 'Vitamin K antagonist — anticoagulant',
    dose: '5 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: 'ongoing', durationUnit: 'days',
    indication: 'DVT/PE treatment, AFib stroke prevention, mechanical valve', category: 'definitive',
    allergies: ['warfarin'], contraindications: ['Active bleeding', 'severe uncontrolled hypertension', 'pregnancy (first trimester)', 'recent CNS/eye surgery'],
    interactions: ['Many! NSAIDs, antibiotics, antifungals, amiodarone, statins, alcohol, vitamin K-rich foods'], warnings: ['Regular INR monitoring (target 2.0-3.0)', 'bleeding risk', 'drug-drug interactions (many)', 'purple toes syndrome'],
    patientInstructions: 'Take at same time daily (evening). Avoid drastic diet changes. Report bruising/blood in urine immediately.', alternatives: ['Rivaroxaban', 'Apixaban', 'Enoxaparin'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'contraindicated',
  },
  'enoxaparin': {
    drugName: 'Enoxaparin', genericName: 'Enoxaparin sodium', drugClass: 'Low molecular weight heparin — anticoagulant',
    dose: '1 mg/kg', doseUnit: 'mg/kg', route: 'SC', frequency: 'Q12H',
    duration: '5-7', durationUnit: 'days',
    indication: 'DVT/PE treatment, ACS, VTE prophylaxis', category: 'definitive',
    allergies: ['heparins', 'sulfites'], contraindications: ['Active bleeding', 'thrombocytopenia (HIT history)', 'epidural catheter'],
    interactions: ['NSAIDs (bleeding)', 'antiplatelets', 'oral anticoagulants'], warnings: ['HIT (monitor platelets)', 'bleeding', 'spinal hematoma (neuraxial anesthesia)'],
    patientInstructions: 'Inject SC into abdomen (alternate sides). Do not rub injection site.', alternatives: ['Heparin IV', 'Fondaparinux', 'Rivaroxaban'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'salbutamol': {
    drugName: 'Salbutamol', genericName: 'Albuterol', drugClass: 'Short-acting beta-2 agonist',
    dose: '2 puffs', doseUnit: 'puffs', route: 'Inhalation', frequency: 'Q4H PRN',
    duration: 'as needed', durationUnit: 'days',
    indication: 'Asthma exacerbation, COPD, wheeze', category: 'definitive',
    allergies: ['salbutamol'], contraindications: ['Tachyarrhythmia (caution)'],
    interactions: ['Beta-blockers (antagonism)', 'theophylline', 'diuretics (hypokalemia)'], warnings: ['Tremor, tachycardia, hypokalemia (high-dose)', 'paradoxical bronchospasm (rare)'],
    patientInstructions: 'Shake inhaler. Use spacer if available. Rinse mouth after use.', alternatives: ['Ipratropium bromide', 'Terbutaline', 'Fenoterol'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'ipratropium': {
    drugName: 'Ipratropium bromide', genericName: 'Ipratropium bromide', drugClass: 'Short-acting muscarinic antagonist',
    dose: '500 mcg', doseUnit: 'mcg', route: 'Nebulized', frequency: 'Q6H',
    duration: '5-7', durationUnit: 'days',
    indication: 'COPD exacerbation, asthma (severe) adjunct', category: 'definitive',
    allergies: ['ipratropium', 'atropine'], contraindications: ['Narrow-angle glaucoma (caution with nebulizer mask)'],
    interactions: ['Other anticholinergics (additive)'], warnings: ['Dry mouth, blurred vision (if contact with eyes)', 'urinary retention (elderly males)'],
    patientInstructions: 'Use with nebulizer or inhaler. Avoid contact with eyes.', alternatives: ['Tiotropium (long-acting)', 'Salbutamol'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'prednisone': {
    drugName: 'Prednisone', genericName: 'Prednisone', drugClass: 'Corticosteroid',
    dose: '50 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: '5', durationUnit: 'days',
    indication: 'Acute asthma exacerbation, COPD exacerbation', category: 'definitive',
    allergies: ['corticosteroids'], contraindications: ['Systemic fungal infection', 'live vaccines'],
    interactions: ['NSAIDs (GI bleed)', 'warfarin', 'antidiabetics'], warnings: ['Hyperglycemia', 'psychiatric reactions', 'adrenal suppression (taper if prolonged)'],
    patientInstructions: 'Take with breakfast. Do not stop abruptly. Monitor blood glucose.', alternatives: ['Prednisolone', 'Dexamethasone', 'Methylprednisolone'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'ceftazidime': {
    drugName: 'Ceftazidime', genericName: 'Ceftazidime', drugClass: 'Third-generation cephalosporin',
    dose: '2 g', doseUnit: 'g', route: 'IV', frequency: 'Q8H',
    duration: '7-14', durationUnit: 'days',
    indication: 'Gram-negative coverage including Pseudomonas', category: 'definitive',
    allergies: ['cephalosporins', 'penicillins (cross-reactivity)'], contraindications: ['Severe cephalosporin allergy'],
    interactions: ['Warfarin', 'loop diuretics (nephrotoxicity?)'], warnings: ['C. diff diarrhea', 'CNS toxicity (high-dose in renal impairment)'],
    patientInstructions: 'IV infusion over 30 min. Report watery diarrhea.', alternatives: ['Cefepime', 'Piperacillin-Tazobactam', 'Meropenem'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'vancomycin': {
    drugName: 'Vancomycin', genericName: 'Vancomycin hydrochloride', drugClass: 'Glycopeptide antibiotic',
    dose: '15 mg/kg', doseUnit: 'mg/kg', route: 'IV', frequency: 'Q12H',
    duration: '7-14', durationUnit: 'days',
    indication: 'MRSA infections, severe CAP/HAP, osteomyelitis', category: 'definitive',
    allergies: ['vancomycin'], contraindications: ['Previous neutropenia with vancomycin'],
    interactions: ['Aminoglycosides (nephrotoxicity)', 'other nephrotoxins'], warnings: ['Monitor trough levels (target 15-20 mcg/mL)', 'Nephrotoxicity', 'Ototoxicity', 'Red man syndrome (infusion rate-related)'],
    patientInstructions: 'Infuse over ≥60 min. Report hearing changes, rash, or decreased urine output.', alternatives: ['Linezolid', 'Daptomycin', 'Teicoplanin'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'piperacillin-tazobactam': {
    drugName: 'Piperacillin-Tazobactam', genericName: 'Piperacillin 4g + Tazobactam 0.5g', drugClass: 'Extended-spectrum penicillin + beta-lactamase inhibitor',
    dose: '4.5 g', doseUnit: 'g', route: 'IV', frequency: 'Q6-8H',
    duration: '7-14', durationUnit: 'days',
    indication: 'HAP, VAP, intra-abdominal infection, febrile neutropenia', category: 'definitive',
    allergies: ['penicillins', 'cephalosporins (caution)'], contraindications: ['Penicillin allergy (anaphylaxis history)'],
    interactions: ['Methotrexate', 'warfarin', 'vecuronium (neuromuscular blockade)'], warnings: ['C. diff diarrhea', 'leukopenia (prolonged use)', 'sodium load (contains Na+)'],
    patientInstructions: 'IV infusion over 30 min. Report rash, diarrhea, unusual bleeding.', alternatives: ['Meropenem', 'Cefepime', 'Ceftazidime + Metronidazole'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'meropenem': {
    drugName: 'Meropenem', genericName: 'Meropenem', drugClass: 'Carbapenem antibiotic',
    dose: '1 g', doseUnit: 'g', route: 'IV', frequency: 'Q8H',
    duration: '7-14', durationUnit: 'days',
    indication: 'Severe sepsis, HAP, intra-abdominal infection, meningitis', category: 'definitive',
    allergies: ['carbapenems', 'penicillins (cross-reactivity ~50%)'], contraindications: ['Severe beta-lactam allergy'],
    interactions: ['Valproic acid (decreased levels — seizure risk)', 'probenecid'], warnings: ['Seizure risk (especially elderly, renal impairment)', 'C. diff diarrhea', 'hypersensitivity'],
    patientInstructions: 'IV infusion over 15-30 min. Report seizure activity or rash.', alternatives: ['Piperacillin-Tazobactam', 'Cefepime + Metronidazole', 'Ertapenem'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'gentamicin': {
    drugName: 'Gentamicin', genericName: 'Gentamicin sulfate', drugClass: 'Aminoglycoside antibiotic',
    dose: '5 mg/kg', doseUnit: 'mg/kg', route: 'IV', frequency: 'Q24H',
    duration: '5-7', durationUnit: 'days',
    indication: 'Severe Gram-negative infection, neonatal sepsis', category: 'definitive',
    allergies: ['aminoglycosides'], contraindications: ['Myasthenia gravis (may exacerbate)', 'previous ototoxicity'],
    interactions: ['Loop diuretics (ototoxicity)', 'vancomycin (nephrotoxicity)', 'neuromuscular blockers'], warnings: ['Nephrotoxicity (monitor creatinine)', 'Ototoxicity (irreversible!)', 'Monitor trough levels'],
    patientInstructions: 'Report hearing changes, dizziness, or decreased urine output.', alternatives: ['Ceftazidime', 'Ciprofloxacin', 'Amikacin'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'caution',
  },
  'cefpodoxime': {
    drugName: 'Cefpodoxime', genericName: 'Cefpodoxime proxetil', drugClass: 'Third-generation cephalosporin',
    dose: '200 mg', doseUnit: 'mg', route: 'PO', frequency: 'Q12H',
    duration: '7', durationUnit: 'days',
    indication: 'CAP, sinusitis, pharyngitis, UTI', category: 'definitive',
    allergies: ['cephalosporins', 'penicillins (caution)'], contraindications: ['Known cephalosporin allergy'],
    interactions: ['Antacids (reduced absorption)', 'warfarin'], warnings: ['C. diff diarrhea'],
    patientInstructions: 'Take with food. Complete full course.', alternatives: ['Cefuroxime', 'Amoxicillin-Clavulanate', 'Levofloxacin'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'sodium_chloride_infusion': {
    drugName: '0.9% Sodium Chloride', genericName: 'Sodium chloride 0.9%', drugClass: 'Isotonic crystalloid',
    dose: '30 mL/kg', doseUnit: 'mL/kg', route: 'IV', frequency: 'Bolus then maintenance',
    duration: 'as needed', durationUnit: 'hours',
    indication: 'Hypovolemia, resuscitation, maintenance fluids', category: 'supportive',
    allergies: [], contraindications: ['Severe hypernatremia', 'severe fluid overload'],
    interactions: [], warnings: ['Monitor for fluid overload (especially heart failure, renal impairment)', 'hyperchloremic metabolic acidosis (large volumes)'],
    patientInstructions: 'IV infusion as ordered. Report difficulty breathing or swelling.', alternatives: ['Ringer\'s Lactate', 'Plasmalyte'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'ringers_lactate': {
    drugName: 'Ringer\'s Lactate', genericName: 'Compound sodium lactate', drugClass: 'Balanced crystalloid',
    dose: '30 mL/kg', doseUnit: 'mL/kg', route: 'IV', frequency: 'Bolus then maintenance',
    duration: 'as needed', durationUnit: 'hours',
    indication: 'Hypovolemia, resuscitation, burn resuscitation', category: 'supportive',
    allergies: [], contraindications: ['Lactic acidosis', 'severe hepatic impairment (lactate metabolism)'],
    interactions: ['Mannitol', 'blood transfusions (co-administration caution)'], warnings: ['Monitor for fluid overload'],
    patientInstructions: 'IV infusion as ordered.', alternatives: ['0.9% Sodium Chloride', 'Plasmalyte', 'Dextrose 5%'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: true, pregnancyRisk: 'safe',
  },
  'ct_iv_contrast': {
    drugName: 'IV Contrast (Iohexol)', genericName: 'Iohexol', drugClass: 'Radiocontrast agent',
    dose: '1-2 mL/kg', doseUnit: 'mL/kg', route: 'IV', frequency: 'Single dose pre-scan',
    duration: '1', durationUnit: 'dose',
    indication: 'Contrast-enhanced CT', category: 'supportive',
    allergies: ['iodinated contrast'], contraindications: ['Severe iodine allergy', 'eGFR <30 without prophylaxis', 'prior anaphylaxis to contrast'],
    interactions: ['Metformin (hold 48h)', 'NSAIDs (nephrotoxicity)'], warnings: ['Contrast-induced nephropathy (CIN) risk', 'Anaphylaxis risk', 'Monitor renal function'],
    patientInstructions: 'Hydrate well before and after. Report itching, hives, or breathing difficulty during injection.', alternatives: ['MRI with gadolinium', 'Non-contrast CT (limited)'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
  'spironolactone': {
    drugName: 'Spironolactone', genericName: 'Spironolactone', drugClass: 'Potassium-sparing diuretic',
    dose: '25 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: 'ongoing', durationUnit: 'days',
    indication: 'Heart failure, resistant hypertension, cirrhosis with ascites', category: 'definitive',
    allergies: ['spironolactone'], contraindications: ['Hyperkalemia', 'Addison disease', 'severe renal impairment (eGFR <30)', 'anuria'],
    interactions: ['ACE inhibitors/ARBs (hyperkalemia)', 'potassium supplements', 'NSAIDs (reduced efficacy)'], warnings: ['Monitor potassium (especially with ACEi/ARB)', 'gynecomastia (dose-related, reversible)', 'drowsiness'],
    patientInstructions: 'Take in AM. Avoid potassium-rich foods and salt substitutes.', alternatives: ['Eplerenone', 'Amiloride', 'Hydrochlorothiazide'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'caution',
  },
  'enalapril': {
    drugName: 'Enalapril', genericName: 'Enalapril maleate', drugClass: 'ACE inhibitor',
    dose: '5 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD-BID',
    duration: 'ongoing', durationUnit: 'days',
    indication: 'Hypertension, heart failure, diabetic nephropathy', category: 'definitive',
    allergies: ['ACE inhibitors'], contraindications: ['Pregnancy', 'angioedema history', 'bilateral renal artery stenosis'],
    interactions: ['Potassium-sparing diuretics', 'NSAIDs', 'lithium'], warnings: ['Monitor renal function and potassium', 'angiodeema', 'dry cough', 'first-dose hypotension'],
    patientInstructions: 'Report swelling of face/lips/tongue immediately.', alternatives: ['Lisinopril', 'Losartan', 'Amlodipine'],
    requiresRenalAdjustment: true, requiresHepaticAdjustment: false, pregnancyRisk: 'contraindicated',
  },
  'losartan': {
    drugName: 'Losartan', genericName: 'Losartan potassium', drugClass: 'Angiotensin II receptor blocker',
    dose: '50 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: 'ongoing', durationUnit: 'days',
    indication: 'Hypertension, diabetic nephropathy, heart failure (alternative)', category: 'definitive',
    allergies: ['ARBs'], contraindications: ['Pregnancy', 'bilateral renal artery stenosis', 'severe hepatic impairment'],
    interactions: ['Potassium-sparing diuretics', 'NSAIDs', 'lithium', 'rifampin'], warnings: ['Monitor renal function and potassium', 'angiodeema (rare)', 'first-dose hypotension'],
    patientInstructions: 'Report swelling, dizziness. Avoid potassium supplements.', alternatives: ['Lisinopril', 'Enalapril', 'Amlodipine'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'contraindicated',
  },
  'atorvastatin': {
    drugName: 'Atorvastatin', genericName: 'Atorvastatin calcium', drugClass: 'HMG-CoA reductase inhibitor (statin)',
    dose: '20 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: 'ongoing', durationUnit: 'days',
    indication: 'Hypercholesterolemia, ASCVD prevention', category: 'preventive',
    allergies: ['statins'], contraindications: ['Active liver disease', 'pregnancy', 'breastfeeding'],
    interactions: ['CYP3A4 inhibitors (↑ levels, myopathy risk)', 'warfarin', 'digoxin', 'grapefruit juice'], warnings: ['Myopathy/rhabdomyolysis risk (especially with interacting drugs)', 'monitor LFTs', 'new-onset diabetes (minor risk)'],
    patientInstructions: 'Take in evening. Report unexplained muscle pain, weakness, or dark urine.', alternatives: ['Rosuvastatin', 'Simvastatin', 'Pravastatin'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'contraindicated',
  },
  'omeprazole': {
    drugName: 'Omeprazole', genericName: 'Omeprazole', drugClass: 'Proton pump inhibitor',
    dose: '20 mg', doseUnit: 'mg', route: 'PO', frequency: 'QD',
    duration: '7-14', durationUnit: 'days',
    indication: 'GERD, peptic ulcer disease, stress ulcer prophylaxis', category: 'supportive',
    allergies: ['PPIs'], contraindications: ['Long-term use without reassessment', 'C. difficile (may increase risk)'],
    interactions: ['Clopidogrel (reduced efficacy)', 'methotrexate', 'warfarin', 'citalopram (QT prolongation)'], warnings: ['C. diff diarrhea (prolonged use)', 'hypomagnesemia (long-term)', 'B12 deficiency (long-term)', 'osteoporosis/fracture risk'],
    patientInstructions: 'Take 30-60 min before breakfast. Short-term use only unless specified.', alternatives: ['Pantoprazole', 'Esomeprazole', 'Famotidine', 'Ranitidine'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'safe',
  },
  'ondansetron': {
    drugName: 'Ondansetron', genericName: 'Ondansetron hydrochloride', drugClass: 'Serotonin 5-HT3 antagonist',
    dose: '8 mg', doseUnit: 'mg', route: 'PO/IV', frequency: 'Q8H PRN',
    duration: '3', durationUnit: 'days',
    indication: 'Nausea and vomiting (chemotherapy, postoperative, gastroenteritis)', category: 'supportive',
    allergies: ['ondansetron'], contraindications: ['QT prolongation (congenital or acquired)', 'severe hepatic impairment'],
    interactions: ['QT-prolonging drugs (additive)', 'tramadol (reduced efficacy)', 'apomorphine (severe hypotension)'], warnings: ['QT prolongation (dose-dependent)', 'serotonin syndrome (rare, with other serotonergic drugs)', 'constipation'],
    patientInstructions: 'Take as needed for nausea. May cause constipation. Report palpitations.', alternatives: ['Metoclopramide', 'Prochlorperazine', 'Domperidone'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: true, pregnancyRisk: 'safe',
  },
  'heparin': {
    drugName: 'Heparin', genericName: 'Heparin sodium', drugClass: 'Unfractionated heparin',
    dose: '5000 U', doseUnit: 'U', route: 'IV', frequency: 'Bolus then infusion',
    duration: 'as needed', durationUnit: 'days',
    indication: 'ACS, DVT/PE, acute anticoagulation', category: 'definitive',
    allergies: ['heparin'], contraindications: ['Active bleeding', 'HIT history', 'recent CNS/eye/spinal surgery', 'hemophilia'],
    interactions: ['Antiplatelets (bleeding)', 'NSAIDs', 'thrombolytics'], warnings: ['HIT (monitor platelets)', 'bleeding', 'osteoporosis (long-term)', 'monitor aPTT'],
    patientInstructions: 'Report unusual bleeding, bruising, dark stools immediately.', alternatives: ['Enoxaparin', 'Fondaparinux', 'Bivalirudin'],
    requiresRenalAdjustment: false, requiresHepaticAdjustment: false, pregnancyRisk: 'safe',
  },
};

export function getDrugKnowledge(drugName: string): DrugKnowledge | null {
  const key = drugName.toLowerCase().trim();
  return DRUG_KNOWLEDGE_BASE[key] || null;
}

export function getDrugNameVariants(drugName: string): string[] {
  return Object.keys(DRUG_KNOWLEDGE_BASE).filter(k =>
    k.includes(drugName.toLowerCase()) || drugName.toLowerCase().includes(k)
  );
}

export function inferDrugKeyFromSuggestion(drug: string): string {
  const lower = drug.toLowerCase().trim();
  if (DRUG_KNOWLEDGE_BASE[lower]) return lower;

  for (const [key, val] of Object.entries(DRUG_KNOWLEDGE_BASE)) {
    if (lower.includes(key) || key.includes(lower)) return key;
    const genericLower = val.genericName.toLowerCase();
    if (lower.includes(genericLower) || genericLower.includes(lower)) return key;
    const drugLower = val.drugName.toLowerCase();
    if (lower.includes(drugLower) || drugLower.includes(lower)) return key;
  }
  return lower;
}

export function extractPrescriptionOrders(plan: AutoExecutionPlan | null): PrescriptionOrder[] {
  if (!plan) return [];

  const seen = new Set<string>();
  const orders: PrescriptionOrder[] = [];
  const now = Date.now();

  const allMeds = plan.suggestedMeds || [];
  for (const med of allMeds) {
    const key = med.drug.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);

    const drugKey = inferDrugKeyFromSuggestion(med.drug);
    const knowledge = DRUG_KNOWLEDGE_BASE[drugKey];

    orders.push({
      id: `rx_${key.replace(/[^a-z0-9]/g, '_')}_${now}`,
      drugName: knowledge?.drugName || med.drug,
      genericName: knowledge?.genericName || med.drug,
      dose: med.dose || knowledge?.dose || '',
      doseUnit: knowledge?.doseUnit || 'mg',
      route: med.route || knowledge?.route || 'PO',
      frequency: med.frequency || knowledge?.frequency || '',
      duration: med.duration || knowledge?.duration || '',
      durationUnit: knowledge?.durationUnit || 'days',
      category: knowledge?.category || 'definitive',
      indication: med.notes || knowledge?.indication || plan.diagnosisName || '',
      reason: knowledge?.indication || `Recommended for ${plan.diagnosisName}`,
      priority: plan.severity === 'severe' ? 'stat' : plan.severity === 'moderate' ? 'urgent' : 'routine',
      status: 'suggested',
      allergies: knowledge?.allergies || [],
      contraindications: knowledge?.contraindications || [],
      interactions: knowledge?.interactions || [],
      warnings: knowledge?.warnings || [],
      patientInstructions: knowledge?.patientInstructions || 'Take as prescribed by your clinician.',
      alternativeMeds: knowledge?.alternatives || [],
      requiresRenalAdjustment: knowledge?.requiresRenalAdjustment || false,
      requiresHepaticAdjustment: knowledge?.requiresHepaticAdjustment || false,
      pregnancyRisk: knowledge?.pregnancyRisk || 'not_assessed',
    });
  }

  return orders;
}

export function mergePrescriptionOrders(
  existingOrders: PrescriptionOrder[],
  plan: AutoExecutionPlan | null,
): PrescriptionOrder[] {
  const newOrders = extractPrescriptionOrders(plan);
  const existingKeys = new Set(existingOrders.map(o => o.drugName.toLowerCase().trim()));
  return [
    ...existingOrders,
    ...newOrders.filter(o => !existingKeys.has(o.drugName.toLowerCase().trim())),
  ];
}
