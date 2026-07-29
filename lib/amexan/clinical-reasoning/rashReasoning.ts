import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type RashCategory = 'infectious_viral' | 'infectious_bacterial' | 'allergic_drug' | 'autoimmune' | 'eczematous' | 'papulosquamous' | 'vascular' | 'neoplastic' | 'other';

interface RashDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: RashCategory;
  typicalOnset?: 'acute_hours' | 'acute_days' | 'subacute_days' | 'chronic_months' | 'chronic_years';
  morphology: string[];
  distribution: string[];
  pruritic: boolean;
  fever: boolean;
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface RashPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const RASH_DDX: RashDisease[] = [
  {
    diseaseId: 'petechial_rash', diseaseName: 'Petechial / Purpuric Rash (Meningococcemia)', icdCode: 'A39.9',
    category: 'infectious_bacterial', typicalOnset: 'acute_hours',
    morphology: ['Petechiae', 'Purpura', 'Non_blanching'],
    distribution: ['Trunk', 'Lower extremities', 'Generalized'],
    pruritic: false, fever: true,
    ageRange: [0, 30], agePeak: [1, 5],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    riskFactors: ['crowding', 'asplenia', 'complement_deficiency'],
    redFlags: ['purpura_fulminans', 'hypotension', 'meningitis'],
    associatedSymptoms: ['fever', 'headache', 'neck_stiffness', 'vomiting', 'hypotension'],
    typicalDescription: 'Non-blanching petechial/purpuric rash with fever and meningeal signs. Can progress to purpura fulminans within hours.',
  },
  {
    diseaseId: 'urticaria', diseaseName: 'Urticaria (Hives) / Angioedema', icdCode: 'L50.9',
    category: 'allergic_drug', typicalOnset: 'acute_hours',
    morphology: ['Wheals', 'Erythematous', 'Raised', 'Migratory'],
    distribution: ['Generalized', 'Anywhere'],
    pruritic: true, fever: false,
    ageRange: [1, 80], agePeak: [10, 50],
    sexPredilection: 'none', backgroundPrevalence: 0.15,
    riskFactors: ['allergies', 'drug_exposure', 'food', 'infection', 'stress'],
    redFlags: ['angioedema', 'anaphylaxis', 'airway_compromise'],
    associatedSymptoms: ['itching', 'angioedema', 'wheezing'],
    typicalDescription: 'Pruritic raised wheals that come and go within hours. Individual lesions last <24h. May be allergic or idiopathic.',
  },
  {
    diseaseId: 'drug_exanthem', diseaseName: 'Drug-Induced Exanthem (Morbilliform)', icdCode: 'L27.0',
    category: 'allergic_drug', typicalOnset: 'subacute_days',
    morphology: ['Maculopapular', 'Erythematous', 'Confluent', 'Symmetric'],
    distribution: ['Trunk', 'Extremities', 'Spares_face'],
    pruritic: true, fever: true,
    ageRange: [1, 90], agePeak: [20, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['antibiotic_use', 'antiepileptic_use', 'allopurinol', 'nsaid'],
    redFlags: ['stevens_johnson', 'toxic_epidermal_necrolysis', 'dress'],
    associatedSymptoms: ['fever', 'eosinophilia', 'malaise'],
    typicalDescription: 'Symmetric maculopapular rash starting on trunk, spreading to extremities. Temporally related to new medication.',
  },
  {
    diseaseId: 'measles_rash', diseaseName: 'Measles (Rubeola)', icdCode: 'B05.9',
    category: 'infectious_viral', typicalOnset: 'subacute_days',
    morphology: ['Maculopapular', 'Erythematous', 'Confluent'],
    distribution: ['Face_first', 'Spreads_downward', 'Generalized'],
    pruritic: false, fever: true,
    ageRange: [0, 50], agePeak: [1, 15],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    riskFactors: ['no_vaccination', 'travel', 'exposure'],
    redFlags: ['pneumonia', 'encephalitis', 'otitis_media'],
    associatedSymptoms: ['fever_high', 'coryza', 'cough', 'conjunctivitis', 'k spots'],
    typicalDescription: 'High fever with 3 Cs (cough, coryza, conjunctivitis) followed by retroatricular rash spreading centrifugally.',
  },
  {
    diseaseId: 'chickenpox', diseaseName: 'Varicella (Chickenpox)', icdCode: 'B01.9',
    category: 'infectious_viral', typicalOnset: 'acute_hours',
    morphology: ['Macules', 'Papules', 'Vesicles', 'Crusts_all_stages'],
    distribution: ['Centripetal', 'Face', 'Trunk', 'Scalp', 'Oral_mucosa'],
    pruritic: true, fever: true,
    ageRange: [0, 60], agePeak: [1, 10],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['no_vaccination', 'exposure', 'immunosuppression'],
    redFlags: ['pneumonia', 'encephalitis', 'secondary_infection'],
    associatedSymptoms: ['fever', 'malaise', 'pruritus_severe'],
    typicalDescription: 'Pruritic vesicular rash in different stages on trunk and face. "Dewdrops on rose petals." Centripetal distribution.',
  },
  {
    diseaseId: 'herpes_zoster_rash', diseaseName: 'Herpes Zoster (Shingles)', icdCode: 'B02.9',
    category: 'infectious_viral', typicalOnset: 'acute_days',
    morphology: ['Vesicles', 'Pustules', 'Crusts', 'Dermatomal'],
    distribution: ['Dermatomal', 'Unilateral', 'Thoracic_most_common'],
    pruritic: false, fever: true,
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['age', 'immunosuppression', 'prior_chickenpox', 'stress'],
    redFlags: ['disseminated_zoster', 'ophthalmic', 'postherpetic_neuralgia'],
    associatedSymptoms: ['burning_pain', 'paresthesia', 'fever', 'malaise'],
    typicalDescription: 'Painful vesicular rash in unilateral dermatomal distribution. Preceded by burning pain and paresthesia.',
  },
  {
    diseaseId: 'cellulitis_rash', diseaseName: 'Cellulitis / Erysipelas', icdCode: 'L03.9',
    category: 'infectious_bacterial', typicalOnset: 'acute_hours',
    morphology: ['Erythema', 'Swelling', 'Warmth', 'Well_demarcated'],
    distribution: ['Lower_leg', 'Face', 'Upper_limb', 'Localized'],
    pruritic: false, fever: true,
    ageRange: [1, 90], agePeak: [20, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['skin_break', 'diabetes', 'pvd', 'lymphedema', 'immunosuppression'],
    redFlags: ['necrotizing_fasciitis', 'sepsis', 'compartment_syndrome'],
    associatedSymptoms: ['fever', 'pain', 'swelling', 'warmth'],
    typicalDescription: 'Localized erythema with warmth, swelling, and tenderness. Well-demarcated border in erysipelas.',
  },
  {
    diseaseId: 'eczema_atopic', diseaseName: 'Atopic Dermatitis (Eczema)', icdCode: 'L20.9',
    category: 'eczematous', typicalOnset: 'chronic_years',
    morphology: ['Erythema', 'Dryness', 'Scaling', 'Lichenification', 'Weeping'],
    distribution: ['Flexural', 'Face', 'Neck', 'Antecubital', 'Popliteal'],
    pruritic: true, fever: false,
    ageRange: [0, 50], agePeak: [0, 10],
    sexPredilection: 'none', backgroundPrevalence: 0.12,
    riskFactors: ['family_history_atopy', 'asthma', 'allergies'],
    redFlags: ['secondary_infection', 'eczema_herpeticum'],
    associatedSymptoms: ['pruritus', 'dry_skin', 'asthma', 'allergic_rhinitis'],
    typicalDescription: 'Chronic relapsing pruritic eczema with flexural distribution. Dry, lichenified skin. Associated with asthma and allergies.',
  },
  {
    diseaseId: 'psoriasis', diseaseName: 'Psoriasis Vulgaris', icdCode: 'L40.0',
    category: 'papulosquamous', typicalOnset: 'chronic_years',
    morphology: ['Plaques', 'Scales_silver', 'Well_demarcated'],
    distribution: ['Extensor_surfaces', 'Scalp', 'Lower_back', 'Nails'],
    pruritic: true, fever: false,
    ageRange: [5, 80], agePeak: [20, 50],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['family_history', 'streptococcal_infection', 'stress', 'drugs', 'hiv'],
    redFlags: ['psoriatic_arthritis', 'generalized_pustular_psoriasis'],
    associatedSymptoms: ['nail_pitting', 'onycholysis', 'arthralgia'],
    typicalDescription: 'Well-demarcated erythematous plaques with silvery scale on extensor surfaces. Nail pitting and onycholysis.',
  },
  {
    diseaseId: 'systemic_lupus_rash', diseaseName: 'Systemic Lupus Erythematosus (SLE)', icdCode: 'M32.9',
    category: 'autoimmune', typicalOnset: 'chronic_months',
    morphology: ['Malar_butterfly', 'Discoid', 'Photosensitive'],
    distribution: ['Facial_malar', 'Sun_exposed', 'Scalp'],
    pruritic: false, fever: true,
    ageRange: [15, 60], agePeak: [20, 45],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    riskFactors: ['female_sex', 'african_caribbean', 'family_history'],
    redFlags: ['nephritis', 'cns_lupus', 'severe_thrombocytopenia'],
    associatedSymptoms: ['fever', 'arthralgia', 'fatigue', 'malar_rash', 'oral_ulcers'],
    typicalDescription: 'Butterfly-shaped malar rash sparing nasolabial folds. Photosensitive. Discoid lesions. Multisystem involvement.',
  },
  {
    diseaseId: 'pityriasis_rosea', diseaseName: 'Pityriasis Rosea', icdCode: 'L42',
    category: 'papulosquamous', typicalOnset: 'subacute_days',
    morphology: ['Macules', 'Papules', 'Scales', 'Herald_patch'],
    distribution: ['Trunk', 'Christmas_tree_pattern', 'Proximal_extremities'],
    pruritic: true, fever: false,
    ageRange: [10, 60], agePeak: [15, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['viral_prodrome'],
    redFlags: [],
    associatedSymptoms: ['mild_fever', 'malaise', 'headache'],
    typicalDescription: 'Herald patch (solitary salmon-colored plaque) followed by diffuse "Christmas tree" pattern rash on trunk. Self-limited.',
  },
  {
    diseaseId: 'scabies', diseaseName: 'Scabies', icdCode: 'B86',
    category: 'infectious_viral', typicalOnset: 'subacute_days',
    morphology: ['Papules', 'Burrows', 'Vesicles', 'Excoriations'],
    distribution: ['Web_space_fingers', 'Wrist', 'Axillae', 'Groin', 'Periumbilical'],
    pruritic: true, fever: false,
    ageRange: [0, 80], agePeak: [5, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['crowding', 'close_contact', 'nursing_home'],
    redFlags: ['crusted_scabies', 'secondary_infection'],
    associatedSymptoms: ['nocturnal_pruritus', 'contact_also_itching'],
    typicalDescription: 'Intense nocturnal pruritus with papules and burrows in finger webs, wrists, and flexures. Close contacts also affected.',
  },
];

const RASH_PATTERNS: RashPatternRule[] = [
  {
    id: 'petechiae_fever', label: 'Petechiae/Purpura + Fever',
    description: 'Non-blanching rash with fever = meningococcemia until proven',
    pattern: ['skin_rash', 'fever', 'headache'],
    suggests: ['petechial_rash', 'cellulitis_rash'],
    rulesOut: ['urticaria', 'eczema_atopic', 'psoriasis'],
    priorityBoost: 40,
  },
  {
    id: 'pruritic_wheals', label: 'Pruritic Wheals (Hives)',
    description: 'Pruritic raised wheals lasting <24h = urticaria (allergic or idiopathic)',
    pattern: ['skin_rash', 'pruritus'],
    suggests: ['urticaria'],
    rulesOut: ['psoriasis', 'eczema_atopic', 'pityriasis_rosea'],
    priorityBoost: 15,
  },
  {
    id: 'drug_exposure_rash', label: 'Rash Following Drug Exposure',
    description: 'Maculopapular rash with fever after starting new drug = drug exanthem',
    pattern: ['skin_rash', 'fever', 'medication_list'],
    suggests: ['drug_exanthem'],
    rulesOut: ['psoriasis', 'eczema_atopic', 'pityriasis_rosea'],
    priorityBoost: 20,
  },
  {
    id: 'vesicular_dermatomal', label: 'Vesicular Dermatomal Rash',
    description: 'Painful unilateral vesicular rash in dermatome = herpes zoster',
    pattern: ['skin_rash', 'pain_character'],
    suggests: ['herpes_zoster_rash'],
    rulesOut: ['urticaria', 'eczema_atopic', 'psoriasis'],
    priorityBoost: 25,
  },
  {
    id: 'vesicular_centripetal', label: 'Centripetal Vesicular Rash in Stages',
    description: 'Pruritic vesicles in different stages on trunk/face = chickenpox',
    pattern: ['skin_rash', 'fever'],
    suggests: ['chickenpox'],
    rulesOut: ['herpes_zoster_rash', 'urticaria'],
    priorityBoost: 20,
  },
  {
    id: 'malar_butterfly', label: 'Malar Butterfly Rash',
    description: 'Butterfly-shaped rash across cheeks sparing nasolabial folds = SLE',
    pattern: ['skin_rash', 'joint_pain', 'fever'],
    suggests: ['systemic_lupus_rash'],
    rulesOut: ['cellulitis_rash', 'rosacea', 'seborrheic_dermatitis'],
    priorityBoost: 20,
  },
  {
    id: 'scaly_extensor', label: 'Scaly Plaques on Extensors',
    description: 'Well-demarcated silvery scaly plaques on extensor surfaces = psoriasis',
    pattern: ['skin_rash', 'joint_pain'],
    suggests: ['psoriasis'],
    rulesOut: ['eczema_atopic', 'pityriasis_rosea'],
    priorityBoost: 15,
  },
  {
    id: 'flexural_itchy', label: 'Flexural Pruritic Eczema',
    description: 'Pruritic flexural rash with dry skin and atopy history = atopic dermatitis',
    pattern: ['skin_rash', 'pruritus'],
    suggests: ['eczema_atopic'],
    rulesOut: ['psoriasis', 'pityriasis_rosea'],
    priorityBoost: 10,
  },
  {
    id: 'christmas_tree', label: 'Herald Patch + Christmas Tree Distribution',
    description: 'Herald patch followed by truncal rash in Christmas tree pattern = pityriasis rosea',
    pattern: ['skin_rash'],
    suggests: ['pityriasis_rosea'],
    rulesOut: ['psoriasis', 'eczema_atopic', 'drug_exanthem'],
    priorityBoost: 10,
  },
  {
    id: 'nocturnal_web_space', label: 'Nocturnal Pruritus + Web Space Lesions',
    description: 'Intense nocturnal itching with finger web burrows = scabies',
    pattern: ['skin_rash', 'pruritus'],
    suggests: ['scabies'],
    rulesOut: ['urticaria', 'eczema_atopic', 'psoriasis'],
    priorityBoost: 15,
  },
  {
    id: 'symmetric_lower_leg', label: 'Symmetric Lower Leg Erythema + Fever',
    description: 'Localized erythema with fever and systemic symptoms = cellulitis',
    pattern: ['skin_rash', 'fever'],
    suggests: ['cellulitis_rash'],
    rulesOut: ['urticaria', 'eczema_atopic', 'psoriasis'],
    priorityBoost: 20,
  },
];

export function getRashDdx(): RashDisease[] {
  return RASH_DDX;
}

export function getRashPatterns(): RashPatternRule[] {
  return RASH_PATTERNS;
}

export function describeRashMorphology(
  lesions: string[],
  distribution: string,
  pruritic: boolean,
): string {
  const nonBlanching = lesions.includes('Petechiae') || lesions.includes('Purpura');
  if (nonBlanching) return 'Non-blanching: urgent — meningococcemia, vasculitis, or ITP. Must rule out sepsis.';
  if (lesions.includes('Wheals') && pruritic) return 'Pruritic wheals: urticaria (allergic or idiopathic). Usually self-limited.';
  if (lesions.includes('Vesicles') && distribution.includes('dermatome')) return 'Dermatomal vesicles: herpes zoster. Start antivirals within 72h.';
  if (lesions.includes('Vesicles') && distribution.includes('Centripetal')) return 'Centripetal vesicles in various stages: chickenpox (varicella).';
  if (lesions.includes('Plaques') && (lesions.includes('Scale') || lesions.includes('Silver'))) return 'Plaques with silvery scale: psoriasis.';
  return 'Morphology not clearly classified. Consider drug reaction, eczema, or infection.';
}

export function getRashGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const RASH_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'rash_presence', label: 'Rash Confirmation', features: ['skin_rash'], priority: 80, rationale: 'Confirm rash presence, onset, and distribution.', category: 'documentation' },
    { id: 'rash_morphology', label: 'Rash Morphology', features: ['skin_rash'], priority: 85, rationale: 'Morphology is key: petechiae (non-blanching = EMERGENCY), vesicles (zoster/varicella), wheals (urticaria), plaques (psoriasis).', category: 'diagnostic' },
    { id: 'rash_distribution', label: 'Rash Distribution', features: ['skin_rash'], priority: 80, rationale: 'Distribution narrows DDx: dermatomal = zoster, flexural = eczema, extensor = psoriasis, centripetal = varicella.', category: 'diagnostic' },
    { id: 'rash_pruritus', label: 'Pruritus', features: ['pruritus'], priority: 70, rationale: 'Pruritic vs non-pruritic is a key discriminator. Nocturnal pruritus = scabies.', category: 'diagnostic' },
    { id: 'rash_fever', label: 'Fever with Rash', features: ['fever', 'fever_chills'], priority: 90, rationale: 'Fever + rash = infection (meningococcemia, measles, varicella) or drug reaction.', category: 'life_threatening' },
    { id: 'rash_drug_history', label: 'Medication History', features: ['medication_list'], priority: 75, rationale: 'Recent drug exposure = drug exanthem, SJS/TEN, or DRESS. Time relationship is critical.', category: 'diagnostic' },
    { id: 'rash_petechiae', label: 'Petechiae / Non-Blanching', features: ['skin_rash'], priority: 100, rationale: 'CRITICAL: Non-blanching rash with fever = meningococcemia. Immediate empiric antibiotics.', category: 'life_threatening' },
    { id: 'rash_pain', label: 'Pain with Rash', features: ['pain_character'], priority: 75, rationale: 'Pain preceding rash = herpes zoster (burning). Pain + erythema = cellulitis.', category: 'diagnostic' },
    { id: 'rash_joint', label: 'Joint Pain with Rash', features: ['joint_pain'], priority: 70, rationale: 'Rash + arthralgia = SLE, Still disease, or viral exanthem.', category: 'diagnostic' },
    { id: 'rash_mucosal', label: 'Mucosal Involvement', features: ['oral_ulcers'], priority: 85, rationale: 'Mucosal lesions + rash = SJS/TEN, SLE, or hand-foot-mouth. SJS = EMERGENCY.', category: 'life_threatening' },
    { id: 'rash_atopy', label: 'Atopy History', features: ['asthma', 'allergies'], priority: 55, rationale: 'Personal/family atopy history supports atopic dermatitis.', category: 'risk_factor' },
  ];

  for (const def of RASH_GAP_DEFS) {
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
          groupLabel: 'Rash Assessment',
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
            groupLabel: 'Rash Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getRashPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of RASH_PATTERNS) {
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
          reasonEssential: `Rash pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function getBiodataAdjustedRashPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of RASH_DDX) {
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
