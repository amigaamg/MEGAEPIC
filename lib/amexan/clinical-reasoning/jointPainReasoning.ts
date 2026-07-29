import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type JointPainCategory = 'degenerative' | 'inflammatory' | 'crystal' | 'infectious' | 'autoimmune' | 'seronegative' | 'overuse' | 'hemorrhagic' | 'systemic' | 'other';

interface JointPainDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: JointPainCategory;
  typicalOnset: 'acute_hours' | 'acute_days' | 'subacute_days' | 'subacute_weeks' | 'chronic_months' | 'chronic_years';
  jointDistribution: 'monoarticular' | 'oligoarticular' | 'polyarticular_symmetric' | 'polyarticular_asymmetric' | 'axial';
  jointsAffected: string[];
  inflammatory: boolean;
  morningStiffness: 'yes_gt_30min' | 'yes_lt_30min' | 'no' | 'variable';
  extraArticular: string[];
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface JointPainPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const JOINT_PAIN_DDX: JointPainDisease[] = [
  {
    diseaseId: 'osteoarthritis', diseaseName: 'Osteoarthritis', icdCode: 'M17.9',
    category: 'degenerative', typicalOnset: 'chronic_years',
    jointDistribution: 'polyarticular_asymmetric',
    jointsAffected: ['Knee', 'Hip', 'Hand DIP', 'Hand PIP', 'CMC', 'Cervical spine', 'Lumbar spine'],
    inflammatory: false, morningStiffness: 'yes_lt_30min',
    extraArticular: ['Heberden nodes', 'Bouchard nodes'],
    ageRange: [40, 95], agePeak: [60, 85],
    sexPredilection: 'female', backgroundPrevalence: 0.12,
    riskFactors: ['age', 'obesity', 'female_sex', 'previous_joint_injury', 'occupational_overuse', 'family_history'],
    redFlags: ['acute_on_chronic_pain', 'effusion', 'instability'],
    associatedSymptoms: ['joint_pain_worse_with_activity', 'joint_stiffness_after_rest', 'crepitus', 'bony_enlargement', 'limited_range'],
    typicalDescription: 'Chronic asymmetric joint pain in weight-bearing joints and hands. Pain worsens with activity, stiffness after rest (<30min). Bony enlargement and crepitus.',
  },
  {
    diseaseId: 'rheumatoid_arthritis', diseaseName: 'Rheumatoid Arthritis', icdCode: 'M05.9',
    category: 'inflammatory', typicalOnset: 'subacute_weeks',
    jointDistribution: 'polyarticular_symmetric',
    jointsAffected: ['Hand MCP', 'Hand PIP', 'Wrist', 'MTP', 'Elbow', 'Ankle', 'Knee', 'Cervical spine'],
    inflammatory: true, morningStiffness: 'yes_gt_30min',
    extraArticular: ['Rheumatoid nodules', 'Vasculitis', 'Pleural effusion', 'Pericarditis', 'Sicca', 'Carpal tunnel'],
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.01,
    riskFactors: ['female_sex', 'smoking', 'family_history', 'hla_dr4'],
    redFlags: ['cervical_subluxation', 'vasculitic_ulcers', 'scleritis', 'amyloidosis'],
    associatedSymptoms: ['morning_stiffness_gt_1hr', 'fatigue', 'fever_low_grade', 'weight_loss', 'symmetrical_swelling'],
    typicalDescription: 'Symmetric inflammatory polyarthritis of small joints (MCP, PIP, wrists, MTP) with prolonged morning stiffness >1 hour. Rheumatoid factor and anti-CCP positive.',
  },
  {
    diseaseId: 'gout', diseaseName: 'Gout (Acute Crystal Arthritis)', icdCode: 'M10.0',
    category: 'crystal', typicalOnset: 'acute_hours',
    jointDistribution: 'monoarticular',
    jointsAffected: ['First MTP', 'Ankle', 'Midfoot', 'Knee', 'Wrist', 'Elbow', 'Hand'],
    inflammatory: true, morningStiffness: 'no',
    extraArticular: ['Tophi', 'Urolithiasis', 'Renal disease'],
    ageRange: [20, 90], agePeak: [40, 70],
    sexPredilection: 'male', backgroundPrevalence: 0.03,
    riskFactors: ['male_sex', 'hyperuricemia', 'alcohol', 'red_meat', 'seafood', 'obesity', 'diuretics', 'renal_failure', 'post_menopause_female'],
    redFlags: ['tofus_rupture', 'septic_arthritis_rule_out'],
    associatedSymptoms: ['severe_pain', 'redness', 'swelling', 'warmth', 'fever'],
    typicalDescription: 'Acute severe monoarticular pain with redness, swelling, and warmth. First MTP is classic. Onset over hours, often at night. Self-limited over 3-10 days.',
  },
  {
    diseaseId: 'pseudogout', diseaseName: 'Pseudogout (CPPD Deposition Disease)', icdCode: 'M11.2',
    category: 'crystal', typicalOnset: 'acute_days',
    jointDistribution: 'monoarticular',
    jointsAffected: ['Knee', 'Wrist', 'Ankle', 'Elbow', 'Shoulder', 'Hip'],
    inflammatory: true, morningStiffness: 'yes_lt_30min',
    extraArticular: ['Chondrocalcinosis', 'Carpal tunnel syndrome'],
    ageRange: [50, 95], agePeak: [60, 85],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['age', 'hemochromatosis', 'hyperparathyroidism', 'hypothyroidism', 'hypomagnesemia', 'osteoarthritis'],
    redFlags: ['septic_arthritis_rule_out'],
    associatedSymptoms: ['pain', 'swelling', 'warmth', 'effusion'],
    typicalDescription: 'Acute monoarticular arthritis of knee or wrist in elderly. Less severe than gout. Chondrocalcinosis on X-ray. CPP crystals in joint fluid.',
  },
  {
    diseaseId: 'septic_arthritis', diseaseName: 'Septic Arthritis (Bacterial)', icdCode: 'M00.9',
    category: 'infectious', typicalOnset: 'acute_hours',
    jointDistribution: 'monoarticular',
    jointsAffected: ['Knee', 'Hip', 'Shoulder', 'Ankle', 'Wrist', 'Elbow'],
    inflammatory: true, morningStiffness: 'no',
    extraArticular: ['Bacteremia', 'Endocarditis', 'Systemic sepsis'],
    ageRange: [0, 90], agePeak: [1, 10],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    riskFactors: ['joint_prosthesis', 'rheumatoid_arthritis', 'immunosuppression', 'diabetes', 'iv_drug_use', 'skin_infection', 'recent_joint_surgery'],
    redFlags: ['sepsis', 'joint_destruction', 'prosthetic_joint_infection'],
    associatedSymptoms: ['severe_pain', 'fever_high', 'chills', 'refusal_to_move_joint', 'effusion', 'erythema'],
    typicalDescription: 'Medical emergency. Acute monoarticular arthritis with fever, exquisite pain, and refusal to move joint. Joint aspiration and IV antibiotics urgently.',
  },
  {
    diseaseId: 'psoriatic_arthritis', diseaseName: 'Psoriatic Arthritis', icdCode: 'L40.5',
    category: 'seronegative', typicalOnset: 'subacute_weeks',
    jointDistribution: 'oligoarticular',
    jointsAffected: ['Hand DIP', 'PIP', 'Knee', 'Ankle', 'Wrist', 'Sacrum', 'Spine'],
    inflammatory: true, morningStiffness: 'yes_gt_30min',
    extraArticular: ['Psoriasis', 'Nail pitting', 'Onycholysis', 'Dactylitis', 'Enthesitis', 'Uveitis'],
    ageRange: [20, 70], agePeak: [30, 55],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['psoriasis', 'nail_changes', 'family_history', 'hla_b27'],
    redFlags: ['arthritis_mutilans', 'severe_enthesitis', 'sacrolitis'],
    associatedSymptoms: ['skin_rash', 'nail_pitting', 'dactylitis_sausage_digit', 'enthesitis', 'back_pain_inflammatory'],
    typicalDescription: 'Oligoarticular arthritis with DIP involvement, dactylitis (sausage digit), enthesitis, and psoriatic skin/nail changes. Can present before skin lesions.',
  },
  {
    diseaseId: 'ankylosing_spondylitis', diseaseName: 'Ankylosing Spondylitis', icdCode: 'M45',
    category: 'seronegative', typicalOnset: 'chronic_months',
    jointDistribution: 'axial',
    jointsAffected: ['Sacrum', 'Lumbar spine', 'Thoracic spine', 'Cervical spine', 'Hip', 'Shoulder'],
    inflammatory: true, morningStiffness: 'yes_gt_30min',
    extraArticular: ['Uveitis', 'Enthesitis', 'Aortitis', 'Cardiac conduction defects', 'Apical lung fibrosis'],
    ageRange: [15, 50], agePeak: [20, 40],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['male_sex', 'hla_b27', 'family_history'],
    redFlags: ['spinal_fracture', 'atlantoaxial_subluxation', 'cauda_equina'],
    associatedSymptoms: ['inflammatory_back_pain', 'morning_stiffness', 'pain_improves_with_exercise', 'nocturnal_pain', 'alternating_buttock_pain', 'fatigue'],
    typicalDescription: 'Chronic inflammatory back pain with morning stiffness improving with exercise. Progressive spinal fusion. HLAB27 positive. Sacroiliitis on MRI.',
  },
  {
    diseaseId: 'reactive_arthritis', diseaseName: 'Reactive Arthritis (Reiter Syndrome)', icdCode: 'M02.3',
    category: 'seronegative', typicalOnset: 'subacute_days',
    jointDistribution: 'oligoarticular',
    jointsAffected: ['Knee', 'Ankle', 'MTP', 'Sacrum', 'Spine'],
    inflammatory: true, morningStiffness: 'yes_gt_30min',
    extraArticular: ['Urethritis', 'Conjunctivitis', 'Uveitis', 'Enthesitis', 'Circinate balanitis', 'Keratoderma blennorrhagicum'],
    ageRange: [15, 60], agePeak: [20, 45],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['recent_infection', 'sexually_transmitted', 'chlamydia', 'campylobacter', 'salmonella', 'shigella', 'yersinia', 'hla_b27'],
    redFlags: ['severe_uveitis', 'carditis', 'aortic_regurgitation'],
    associatedSymptoms: ['recent_diarrhea', 'recent_urethritis', 'conjunctivitis', 'enthesitis', 'dactylitis', 'low_back_pain'],
    typicalDescription: 'Oligoarthritis developing 1-4 weeks after genitourinary or enteric infection. Classic triad: conjunctivitis, urethritis, arthritis. Associated with HLAB27.',
  },
  {
    diseaseId: 'juvenile_idiopathic_arthritis', diseaseName: 'Juvenile Idiopathic Arthritis', icdCode: 'M08.0',
    category: 'inflammatory', typicalOnset: 'chronic_months',
    jointDistribution: 'oligoarticular',
    jointsAffected: ['Knee', 'Ankle', 'Wrist', 'Hand', 'Cervical spine', 'TMJ'],
    inflammatory: true, morningStiffness: 'yes_gt_30min',
    extraArticular: ['Uveitis', 'Fever', 'Rash', 'Growth retardation', 'Macrophage activation syndrome'],
    ageRange: [0.5, 16], agePeak: [2, 10],
    sexPredilection: 'female', backgroundPrevalence: 0.001,
    riskFactors: ['female_sex', 'family_history_autoimmune'],
    redFlags: ['macrophage_activation_syndrome', 'uveitis', 'severe_growth_retardation'],
    associatedSymptoms: ['joint_swelling', 'morning_stiffness', 'limping', 'fever', 'rheumatoid_rash', 'iridocyclitis'],
    typicalDescription: 'Chronic arthritis in a child <16 years with joint swelling, morning stiffness, and limping. Oligoarticular is most common. Uveitis screening essential.',
  },
  {
    diseaseId: 'sle_arthritis', diseaseName: 'Systemic Lupus Erythematosus (Arthritis)', icdCode: 'M32.1',
    category: 'autoimmune', typicalOnset: 'chronic_months',
    jointDistribution: 'polyarticular_symmetric',
    jointsAffected: ['Hand MCP', 'PIP', 'Wrist', 'Knee', 'Ankle', 'Elbow'],
    inflammatory: true, morningStiffness: 'yes_gt_30min',
    extraArticular: ['Malar rash', 'Discoid rash', 'Photosensitivity', 'Nephritis', 'Serositis', 'Cytopenia', 'Oral ulcers'],
    ageRange: [15, 65], agePeak: [20, 45],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    riskFactors: ['female_sex', 'african_caribbean', 'asian', 'family_history'],
    redFlags: ['lupus_nephritis', 'cns_lupus', 'severe_thrombocytopenia', 'pulmonary_hemorrhage'],
    associatedSymptoms: ['malar_rash', 'photosensitivity', 'oral_ulcers', 'fever', 'fatigue', 'serositis', 'alopecia'],
    typicalDescription: 'Symmetric non-erosive arthritis with morning stiffness. Part of multisystem autoimmune disease. Positive ANA, anti-dsDNA. Arthritis is typically non-deforming.',
  },
  {
    diseaseId: 'hemarthrosis_joint', diseaseName: 'Hemarthrosis (Bleeding into Joint)', icdCode: 'M25.0',
    category: 'hemorrhagic', typicalOnset: 'acute_hours',
    jointDistribution: 'monoarticular',
    jointsAffected: ['Knee', 'Ankle', 'Elbow', 'Shoulder', 'Hip'],
    inflammatory: true, morningStiffness: 'no',
    extraArticular: ['Bruising', 'Bleeding at other sites'],
    ageRange: [0, 80], agePeak: [1, 30],
    sexPredilection: 'male', backgroundPrevalence: 0.0005,
    riskFactors: ['hemophilia', 'von_willebrand', 'anticoagulant_therapy', 'trauma', 'joint_prosthesis'],
    redFlags: ['compartment_syndrome', 'neurovascular_compromise'],
    associatedSymptoms: ['severe_pain', 'swelling_rapid', 'warmth', 'bruising', 'bleeding_history'],
    typicalDescription: 'Rapid onset of painful joint swelling in a patient with bleeding diathesis or on anticoagulation. Tense effusion. Joint aspiration shows blood.',
  },
  {
    diseaseId: 'fibromyalgia_joint', diseaseName: 'Fibromyalgia', icdCode: 'M79.7',
    category: 'other', typicalOnset: 'chronic_years',
    jointDistribution: 'polyarticular_symmetric',
    jointsAffected: ['Generalized widespread pain'],
    inflammatory: false, morningStiffness: 'variable',
    extraArticular: ['Tender points', 'Fatigue', 'Sleep disturbance', 'Cognitive fog', 'Irritable bowel'],
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    riskFactors: ['female_sex', 'stress', 'trauma', 'infection', 'autoimmune_disease', 'sleep_disorder'],
    redFlags: ['worsening_neurological_symptoms'],
    associatedSymptoms: ['widespread_pain', 'fatigue', 'non_restorative_sleep', 'cognitive_difficulty', 'tender_points', 'ibs', 'headache'],
    typicalDescription: 'Chronic widespread pain with fatigue, sleep disturbance, and cognitive symptoms. No objective joint swelling or inflammation. Tender points on exam.',
  },
  {
    diseaseId: 'polymyalgia_rheumatica', diseaseName: 'Polymyalgia Rheumatica', icdCode: 'M35.3',
    category: 'inflammatory', typicalOnset: 'subacute_weeks',
    jointDistribution: 'polyarticular_symmetric',
    jointsAffected: ['Shoulder girdle', 'Hip girdle', 'Neck'],
    inflammatory: true, morningStiffness: 'yes_gt_30min',
    extraArticular: ['Temporal arteritis', 'Constitutional symptoms'],
    ageRange: [50, 95], agePeak: [60, 85],
    sexPredilection: 'female', backgroundPrevalence: 0.002,
    riskFactors: ['age', 'female_sex', 'northern_european'],
    redFlags: ['temporal_arteritis_vision_loss', 'aortic_dissection'],
    associatedSymptoms: ['shoulder_hip_stiffness', 'morning_stiffness_gt_1hr', 'fatigue', 'weight_loss', 'fever', 'depression', 'anemia'],
    typicalDescription: 'Severe morning stiffness in shoulder and hip girdles in patient >50. Marked elevation of ESR and CRP. Dramatic response to corticosteroids.',
  },
  {
    diseaseId: 'hemochromatosis_arthropathy', diseaseName: 'Hemochromatosis Arthropathy', icdCode: 'E83.1',
    category: 'crystal', typicalOnset: 'chronic_months',
    jointDistribution: 'oligoarticular',
    jointsAffected: ['Hand MCP especially 2nd_3rd', 'Wrist', 'Knee', 'Ankle'],
    inflammatory: true, morningStiffness: 'yes_lt_30min',
    extraArticular: ['Chondrocalcinosis', 'Bronze skin', 'Cirrhosis', 'Diabetes', 'Cardiomyopathy', 'Hypogonadism'],
    ageRange: [30, 80], agePeak: [40, 70],
    sexPredilection: 'male', backgroundPrevalence: 0.0005,
    riskFactors: ['northern_european_ancestry', 'family_history', 'male_sex', 'HFE_mutation'],
    redFlags: ['cirrhosis', 'hepatocellular_carcinoma', 'cardiomyopathy'],
    associatedSymptoms: ['mcp_arthritis', 'pseudogout_attacks', 'fatigue', 'skin_bronzing', 'diabetes', 'impotence'],
    typicalDescription: 'Arthritis of 2nd and 3rd MCP joints is characteristic. Associated with pseudogout, bronze diabetes, and cirrhosis. Ferritin and transferrin saturation elevated.',
  },
  {
    diseaseId: 'tuberculous_arthritis', diseaseName: 'Tuberculous Arthritis', icdCode: 'M01.1',
    category: 'infectious', typicalOnset: 'chronic_months',
    jointDistribution: 'monoarticular',
    jointsAffected: ['Hip', 'Knee', 'Ankle', 'Elbow', 'Wrist', 'Spine Pott disease'],
    inflammatory: true, morningStiffness: 'no',
    extraArticular: ['Pulmonary TB', 'Lymphadenopathy', 'Constitutional symptoms'],
    ageRange: [1, 80], agePeak: [20, 50],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    riskFactors: ['hiv', 'immunosuppression', 'endemic_TB', 'close_contact_TB', 'malnutrition'],
    redFlags: ['pott_paraplegia', 'spinal_cord_compression', 'joint_destruction'],
    associatedSymptoms: ['chronic_monoarthritis', 'night_sweats', 'weight_loss', 'fever', 'fatigue', 'cough'],
    typicalDescription: 'Chronic indolent monoarthritis with constitutional symptoms. Pott disease of spine. Joint destruction over months. Diagnosis by AFB culture and PCR.',
  },
];

const JOINT_PAIN_PATTERNS: JointPainPatternRule[] = [
  {
    id: 'acute_monoarticular_red', label: 'Acute Red Hot Swollen Joint',
    description: 'Acute monoarticular arthritis with redness and fever = septic arthritis until proven. Emergency.',
    pattern: ['joint_pain', 'fever'],
    suggests: ['septic_arthritis', 'gout', 'pseudogout', 'hemarthrosis_joint'],
    rulesOut: ['osteoarthritis', 'fibromyalgia_joint', 'rheumatoid_arthritis'],
    priorityBoost: 40,
  },
  {
    id: 'first_mtp_gout', label: 'First MTP Podagra Pattern',
    description: 'Acute severe first MTP pain with redness = gout until proven.',
    pattern: ['joint_pain'],
    suggests: ['gout'],
    rulesOut: ['osteoarthritis', 'rheumatoid_arthritis', 'pseudogout'],
    priorityBoost: 25,
  },
  {
    id: 'symmetric_small_joint', label: 'Symmetric Small Joint + Morning Stiffness',
    description: 'Symmetric MCP, PIP, wrist arthritis with prolonged morning stiffness = RA.',
    pattern: ['joint_pain', 'morning_stiffness'],
    suggests: ['rheumatoid_arthritis', 'sle_arthritis'],
    rulesOut: ['osteoarthritis', 'gout', 'fibromyalgia_joint'],
    priorityBoost: 25,
  },
  {
    id: 'dip_dactylitis_skin', label: 'DIP Arthritis + Nail Changes + Skin Rash',
    description: 'DIP involvement with dactylitis and psoriasis = psoriatic arthritis.',
    pattern: ['joint_pain', 'skin_rash'],
    suggests: ['psoriatic_arthritis'],
    rulesOut: ['osteoarthritis', 'rheumatoid_arthritis', 'gout'],
    priorityBoost: 20,
  },
  {
    id: 'inflammatory_back_pain', label: 'Inflammatory Back Pain + Morning Stiffness',
    description: 'Chronic back pain with morning stiffness improving with exercise = ankylosing spondylitis.',
    pattern: ['joint_pain', 'back_pain'],
    suggests: ['ankylosing_spondylitis'],
    rulesOut: ['osteoarthritis', 'fibromyalgia_joint'],
    priorityBoost: 20,
  },
  {
    id: 'post_infectious_oligo', label: 'Post-Infectious Oligoarthritis',
    description: 'Oligoarthritis after diarrhea or urethritis = reactive arthritis.',
    pattern: ['joint_pain', 'fever'],
    suggests: ['reactive_arthritis'],
    rulesOut: ['rheumatoid_arthritis', 'gout'],
    priorityBoost: 15,
  },
  {
    id: 'elderly_shoulder_hip', label: 'Elderly Shoulder/Hip Stiffness + High ESR',
    description: 'Bilateral shoulder/hip morning stiffness in elderly = polymyalgia rheumatica.',
    pattern: ['joint_pain', 'morning_stiffness'],
    suggests: ['polymyalgia_rheumatica'],
    rulesOut: ['rheumatoid_arthritis', 'osteoarthritis', 'fibromyalgia_joint'],
    priorityBoost: 20,
  },
  {
    id: 'weight_bearing_joint_crack', label: 'Weight-Bearing Joint Pain + Crepitus',
    description: 'Knee/hip pain worse with activity, better with rest, with crepitus = osteoarthritis.',
    pattern: ['joint_pain'],
    suggests: ['osteoarthritis'],
    rulesOut: ['gout', 'septic_arthritis', 'rheumatoid_arthritis'],
    priorityBoost: 10,
  },
  {
    id: 'widespread_pain_fatigue', label: 'Widespread Pain + Fatigue + Sleep Disturbance',
    description: 'Chronic widespread pain with fatigue and non-restorative sleep = fibromyalgia.',
    pattern: ['joint_pain', 'fatigue'],
    suggests: ['fibromyalgia_joint'],
    rulesOut: ['rheumatoid_arthritis', 'sle_arthritis', 'polymyalgia_rheumatica'],
    priorityBoost: 10,
  },
  {
    id: 'second_mcp_hemochromatosis', label: '2nd/3rd MCP Arthritis + Pseudogout',
    description: 'Arthritis of 2nd and 3rd MCP with pseudogout attacks = hemochromatosis.',
    pattern: ['joint_pain'],
    suggests: ['hemochromatosis_arthropathy', 'pseudogout'],
    rulesOut: ['rheumatoid_arthritis', 'osteoarthritis'],
    priorityBoost: 15,
  },
  {
    id: 'child_limping_swollen_joint', label: 'Child with Limping + Swollen Joint',
    description: 'Child with chronic monoarticular swelling and limping = JIA until proven.',
    pattern: ['joint_pain'],
    suggests: ['juvenile_idiopathic_arthritis', 'septic_arthritis', 'tuberculous_arthritis'],
    rulesOut: ['osteoarthritis', 'gout', 'rheumatoid_arthritis'],
    priorityBoost: 20,
  },
  {
    id: 'bleeding_diathesis_hemarthrosis', label: 'Acute Monoarthritis + Bleeding History',
    description: 'Acute painful joint swelling in patient with bleeding disorder or anticoagulant = hemarthrosis.',
    pattern: ['joint_pain'],
    suggests: ['hemarthrosis_joint'],
    rulesOut: ['septic_arthritis', 'gout', 'osteoarthritis'],
    priorityBoost: 20,
  },
  {
    id: 'chronic_mono_tb', label: 'Chronic Monoarthritis + Constitutional',
    description: 'Chronic monoarthritis with night sweats and weight loss = tuberculous arthritis.',
    pattern: ['joint_pain', 'fever'],
    suggests: ['tuberculous_arthritis', 'septic_arthritis'],
    rulesOut: ['osteoarthritis', 'gout', 'rheumatoid_arthritis'],
    priorityBoost: 15,
  },
];

export function getJointPainDdx(): JointPainDisease[] {
  return JOINT_PAIN_DDX;
}

export function getJointPainPatterns(): JointPainPatternRule[] {
  return JOINT_PAIN_PATTERNS;
}

export function classifyJointPain(
  jointCount: 'mono' | 'oligo' | 'poly',
  symmetric: boolean,
  inflammatoryMarkers: boolean,
  morningStiffMin: number,
  fever: boolean,
): { primaryCategory: JointPainCategory; rationale: string } {
  if (jointCount === 'mono' && fever) return { primaryCategory: 'infectious', rationale: 'Acute monoarthritis with fever = septic arthritis until proven. Immediate joint aspiration and empiric antibiotics.' };
  if (jointCount === 'mono' && !fever) return { primaryCategory: 'crystal', rationale: 'Monoarthritis without fever = crystal arthropathy (gout/pseudogout) or hemarthrosis. Aspiration for crystals and culture.' };
  if (jointCount === 'poly' && symmetric && morningStiffMin > 30) return { primaryCategory: 'inflammatory', rationale: 'Symmetric polyarthritis with prolonged morning stiffness = RA, SLE, or seronegative spondyloarthropathy.' };
  if (jointCount === 'poly' && symmetric && morningStiffMin <= 30) return { primaryCategory: 'degenerative', rationale: 'Symmetric polyarthritis with brief morning stiffness = osteoarthritis (hands, knees).' };
  if (jointCount === 'oligo' && inflammatoryMarkers) return { primaryCategory: 'seronegative', rationale: 'Oligoarthritis with inflammatory markers = seronegative spondyloarthropathy (psoriatic, reactive, axial).' };
  if (jointCount === 'poly' && !symmetric && !inflammatoryMarkers) return { primaryCategory: 'degenerative', rationale: 'Asymmetric polyarthritis without inflammation = osteoarthritis.' };
  return { primaryCategory: 'other', rationale: 'Pattern not clearly classified. Consider fibromyalgia, systemic disease, or referral to rheumatology.' };
}

export function getJointPainGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const JOINT_PAIN_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'joint_pain_presence', label: 'Joint Pain Confirmation', features: ['joint_pain'], priority: 80, rationale: 'Confirm joint pain, location, and number of joints involved.', category: 'documentation' },
    { id: 'joint_pain_onset', label: 'Joint Pain Onset and Duration', features: ['pain_duration', 'pain_onset'], priority: 80, rationale: 'Acute hours = gout/septic, subacute weeks = RA, chronic years = OA.', category: 'diagnostic' },
    { id: 'joint_distribution', label: 'Number and Distribution of Joints', features: ['joint_pain'], priority: 85, rationale: 'Mono vs oligo vs poly, symmetric vs asymmetric, small vs large joints — key classifier.', category: 'diagnostic' },
    { id: 'joint_inflammatory_signs', label: 'Inflammatory Signs (Redness, Swelling, Warmth)', features: ['joint_pain'], priority: 90, rationale: 'Red hot swollen joint = septic or crystal arthropathy. EMERGENCY if with fever.', category: 'life_threatening' },
    { id: 'morning_stiffness', label: 'Morning Stiffness Duration', features: ['morning_stiffness'], priority: 75, rationale: '>30 minutes = inflammatory (RA, PMR, spondyloarthropathy), <30 min = degenerative (OA).', category: 'diagnostic' },
    { id: 'joint_fever', label: 'Fever with Joint Pain', features: ['fever', 'fever_chills'], priority: 95, rationale: 'Fever + acute monoarthritis = septic arthritis. EMERGENCY aspiration and antibiotics.', category: 'life_threatening' },
    { id: 'joint_skin_rash', label: 'Skin Rash with Joint Pain', features: ['skin_rash'], priority: 70, rationale: 'Rash + arthritis = psoriatic, SLE, reactive, or viral arthropathy.', category: 'diagnostic' },
    { id: 'joint_extra_articular', label: 'Extra-Articular Symptoms', features: ['fatigue', 'weight_loss', 'fever', 'skin_rash', 'oral_ulcers'], priority: 65, rationale: 'Constitutional symptoms + arthritis = systemic inflammatory disease.', category: 'diagnostic' },
    { id: 'joint_bleeding_history', label: 'Bleeding History / Anticoagulation', features: ['bleeding_history'], priority: 80, rationale: 'Spontaneous hemarthrosis in a patient on anticoagulants or with hemophilia.', category: 'life_threatening' },
    { id: 'joint_recent_infection', label: 'Recent Infection History', features: ['recent_infection'], priority: 65, rationale: 'Post-infectious arthritis suggests reactive arthritis or viral arthropathy.', category: 'diagnostic' },
    { id: 'joint_back_pain', label: 'Back Pain with Joint Pain', features: ['back_pain'], priority: 60, rationale: 'Inflammatory back pain + peripheral arthritis = spondyloarthropathy.', category: 'diagnostic' },
    { id: 'joint_trauma_history', label: 'Trauma History', features: ['trauma_history'], priority: 55, rationale: 'Previous joint injury predisposes to osteoarthritis or hemarthrosis.', category: 'risk_factor' },
  ];

  for (const def of JOINT_PAIN_GAP_DEFS) {
    const answeredCount = def.features.filter(f => answered.has(f)).length;
    if (answeredCount === 0) {
      const firstFeature = def.features[0];
      const feature = FEATURES[firstFeature];
      if (feature) {
        gaps.push({
          featureId: firstFeature,
          label: feature.label,
          category: def.category,
          priorityScore: def.priority,
          reasonEssential: def.rationale,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: 'Joint Pain Assessment',
        });
      }
    } else if (answeredCount < def.features.length && def.features.length > 1) {
      const unanswered = def.features.find(f => !answered.has(f));
      if (unanswered) {
        const feature = FEATURES[unanswered];
        if (feature) {
          gaps.push({
            featureId: unanswered,
            label: feature.label,
            category: def.category,
            priorityScore: def.priority - 10,
            reasonEssential: def.rationale,
            type: feature.type,
            options: feature.options,
            clinicalGuide: feature.clinicalGuide,
            groupLabel: 'Joint Pain Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getJointPainPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of JOINT_PAIN_PATTERNS) {
    const patternAnswered = pattern.pattern.filter(f => answered.has(f));
    const patternUnanswered = pattern.pattern.filter(f => !answered.has(f));

    if (patternAnswered.length >= 2 && patternUnanswered.length > 0) {
      for (const featureId of patternUnanswered) {
        const feature = FEATURES[featureId];
        if (!feature) continue;

        const matchingDiseases = pattern.suggests.filter(d => activeDiseaseStates[d]?.currentProb > 0.01).length;
        const boost = matchingDiseases > 0 ? pattern.priorityBoost + 10 : pattern.priorityBoost;

        gaps.push({
          featureId,
          label: feature.label,
          category: 'diagnostic',
          priorityScore: Math.min(100, 60 + boost),
          reasonEssential: `Joint pain pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: `Pattern: ${pattern.label}`,
        });
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getBiodataAdjustedJointPainPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of JOINT_PAIN_DDX) {
    let shift = 0;
    const reasons: string[] = [];

    if (age >= ddx.ageRange[0] && age <= ddx.ageRange[1]) {
      shift += 0.02;
      if (age >= ddx.agePeak[0] && age <= ddx.agePeak[1]) {
        shift += 0.05;
        reasons.push(`peak age ${ddx.agePeak[0]}-${ddx.agePeak[1]}`);
      }
    } else {
      shift -= 0.03;
    }

    if (ddx.sexPredilection === 'male' && sex === 'male') {
      shift += 0.03;
      reasons.push('male predominance');
    } else if (ddx.sexPredilection === 'female' && sex === 'female') {
      shift += 0.03;
      reasons.push('female predominance');
    }

    result[ddx.diseaseId] = {
      diseaseId: ddx.diseaseId,
      diseaseName: ddx.diseaseName,
      priorShift: Math.max(-0.03, Math.min(0.15, shift)),
      rationale: reasons.length > 0 ? reasons.join('; ') : 'no specific biodata adjustment',
    };
  }

  return result;
}
