const fs = require('fs');
const p = 'C:\\Users\\Administrator\\Desktop\\client\\lib\\amexan\\departments\\neuro.ts';
const l = [];
const addl = a => a.forEach(x => l.push(x));

// D2: imaging, severityCriteria, diagnosticCriteria
addl([
  '    imaging: [',
  "      { modality: 'Non-Contrast CT Brain (NCCT)', indication: 'First-line imaging for all suspected haemorrhagic stroke. Rapid, accessible, high sensitivity for acute haemorrhage. Perform within 20 min of arrival.', findings: 'Hyperdense intraparenchymal haematoma (60-80 HU) with surrounding oedema. Common sites: basal ganglia (putamen 40%, thalamus 15%), lobar (30%), cerebellum (10%), pons (5%). Haematoma volume = A x B x C / 2 (ABC/2 method). Intraventricular extension (IVH): poor prognostic sign. Hydrocephalus (especially IVH). Midline shift. Subarachnoid extension: blood in adjacent sulci/cisterns.', sensitivity: 95, specificity: 100, preparation: 'None (emergency)' },",
  "      { modality: 'CT Angiography (CTA) Head', indication: 'Identify vascular lesion (AVM, aneurysm) and spot sign (active extravasation predicts haematoma expansion). Perform emergently if suspicion of underlying lesion (young, lobar, no hypertension, SAH component).', findings: 'Spot sign: focal contrast pooling within haematoma (active bleeding) - present in 30% of ICH within 6h, strongly predicts expansion (OR 10-30). AVM: tangle of abnormal vessels (nidus), enlarged feeding arteries, early draining vein. Aneurysm: saccular outpouching (berry aneurysm) at circle of Willis or MCA bifurcation. Vasculitis: irregular beaded vessels.', sensitivity: 95, specificity: 98, preparation: 'IV contrast; assess renal function if possible (do not delay if critical)' },",
  "      { modality: 'MRI Brain (GRE/SWI, T1/T2, DWI, MRA)', indication: 'Problem-solving: clarify haemorrhage age, detect underlying structural lesion, diagnose CAA (Boston criteria), assess chronic microbleeds. Not first-line (time, availability) but superior for CAA, underlying masses.', findings: 'GRE/SWI: blooming hypointensity (haemorrhage). Haematoma evolution: hyperacute (<6h): T1 isointense, T2 hyperintense. Acute (6h-3d): T1 isointense/hypointense, T2 hypointense. Early subacute (3-7d): T1 hyperintense, T2 hypointense. Late subacute (7-14d): T1 hyperintense, T2 hyperintense. Chronic (>14d): T1 hypointense, T2 hypointense (haemosiderin rim). CAA: multiple corticosubcortical microbleeds (strictly lobar pattern - Boston criteria 2.0). Underlying lesion: tumour, cavernoma, AVM.', sensitivity: 95, specificity: 98, preparation: 'Screen for MRI contraindications' },",
  "      { modality: 'Digital Subtraction Angiography (DSA)', indication: 'Gold standard for detecting/characterising AVMs, aneurysms, dural fistulas. Use if CTA negative/equivocal but young age, lobar haemorrhage, or suspicion of vascular malformation.', findings: 'AVM: nidus size, eloquence of adjacent brain, venous drainage pattern (Spetzler-Martin grade). Aneurysm: size, neck, dome-to-neck ratio, branch involvement. Dural AV fistula: cortical venous reflux (high-risk feature). Vasculitis: alternating stenosis/dilatation.', sensitivity: 99, specificity: 100, preparation: 'NBM 4h, check renal function, consent, anaesthetic support if needed' },",
  '    ],',
  '    severityCriteria: [',
  "      { criterion: 'ICH Score (Intracerebral Haemorrhage Score)', mild: '0 (30-day mortality 0%)', moderate: '1-2 (13-26% mortality)', severe: '3-4 (72-97% mortality)', critical: '5-6 (100% mortality)' },",
  "      { criterion: 'GCS at Presentation', mild: '13-15 (minor ICH)', moderate: '9-12 (moderate ICH)', severe: '5-8 (severe ICH)', critical: '3-4 (critical ICH)' },",
  "      { criterion: 'Haematoma Volume (ABC/2 method)', mild: '<10 mL', moderate: '10-30 mL', severe: '30-60 mL', critical: '>60 mL (or >50% of hemisphere)' },",
  "      { criterion: 'Intraventricular Extension', mild: 'None', moderate: 'Trace (sediment in occipital horns)', severe: 'Cast of one ventricle', critical: 'Multiple ventricular casts / acute hydrocephalus' },",
  "      { criterion: 'Midline Shift', mild: '<3 mm', moderate: '3-5 mm', severe: '5-10 mm', critical: '>10 mm (or >15mm: herniation imminent)' },",
  "      { criterion: 'Systolic BP at Presentation', mild: '<140 mmHg', moderate: '140-180 mmHg', severe: '180-220 mmHg', critical: '>220 mmHg (high risk of expansion/rebleed)' },",
  "      { criterion: 'Infratentorial Location (Brainstem/Cerebellum)', mild: 'Not infratentorial', moderate: 'Cerebellar <3 cm', severe: 'Cerebellar >3 cm (compressive)', critical: 'Brainstem haemorrhage any size (poor outcome)' },",
  '    ],',
  '    diagnosticCriteria: [',
  "      { name: 'Radiological Diagnosis of ICH', type: 'required', description: 'Non-contrast CT brain: hyperdense (60-80 HU) discrete intraparenchymal lesion. MRI: GRE/SWI blooming consistent with acute blood products. Location: basal ganglia, thalamus, lobar, cerebellum, pons, brainstem.' },",
  "      { name: 'SMASH-U Classification (Aetiological Classification)', type: 'required', description: 'S: Structural lesion (AVM, aneurysm, cavernoma, tumour, dural fistula). M: Medication-related (anticoagulants, antiplatelets, thrombolytics). A: Amyloid angiopathy (CAA - lobar, multiple microbleeds, age >55). S: Systemic disease (liver disease, haematological, vasculitis, HIV). H: Hypertensive (basal ganglia/thalamus, history of HTN). U: Undetermined (no aetiology identified after complete workup).' },",
  "      { name: 'Boston Criteria v2.0 for Cerebral Amyloid Angiopathy (CAA)', type: 'minor', description: 'Probable CAA: age >=55, spontaneous lobar ICH (no other cause), MRI shows corticosubcortical microbleeds (not in deep grey matter) or superficial siderosis. Definite CAA: full autopsy/pathology confirmation.' },",
  '    ],',
]);

fs.appendFileSync(p, l.join('\n') + '\n', 'utf8');
console.log('D2 part B written. Size:', fs.statSync(p).size);
