import type {
  SystemId, SystemExamState, SystemNarrativeInput, SystemNarrativeOutput,
  SystemExaminations, ExamPhase,
} from '../examination/systemExaminationTypes';
import { EXAM_PHASE_ORDER, SYSTEM_LABELS, SYSTEM_PHASE_MAP } from '../examination/systemExaminationTypes';
import { SYSTEM_FIELD_REGISTRY, getFieldDefinition, getSystemFields } from './systemExaminationEngine';
import type { SystemExamFieldDef, SystemFieldValue } from '../examination/systemExaminationTypes';

// ── Normal examination phrases per system ────────────────────────────────────

const SYSTEM_NORMAL_PHRASES: Record<SystemId, string> = {
  respiratory: 'Respiratory examination: Chest symmetrical with normal shape. Breathing pattern normal, no use of accessory muscles. Trachea central. Chest expansion equal and adequate. Percussion note resonant throughout all lung fields. Breath sounds vesicular with no added sounds. Vocal resonance normal.',
  cardiovascular: 'Cardiovascular examination: Hands warm with no stigmata of infective endocarditis. JVP not elevated. Apex beat not displaced, normal character. Heart sounds I and II normal, no murmurs, clicks, or added sounds. Peripheral pulses all palpable and symmetrical. No peripheral oedema. Blood pressure normal.',
  gastrointestinal: 'Abdominal examination: Hands show no stigmata of liver disease. Abdomen flat and symmetrical, no visible masses or scars. Superficial palpation: soft, non-tender. Deep palpation: no masses or organomegaly. Liver and spleen not palpable. Percussion: normal liver span, no shifting dullness. Bowel sounds normal. No bruits.',
  neurological: 'Neurological examination: Patient alert and oriented. Speech normal. Gait normal. Cranial nerves I-XII intact. Tone normal throughout. Power 5/5 in all limbs. Reflexes symmetrical (2+). Plantars flexor. Sensation intact to light touch, pinprick, vibration, and proprioception. Coordination intact (FNF, heel-shin, RAM normal). Romberg negative.',
  musculoskeletal: 'Musculoskeletal examination: Gait normal. Spine alignment normal with full range of motion. No joint swelling, deformity, or erythema. Full range of motion in all joints. No joint line tenderness, effusion, or crepitus. Stability tests negative. Muscle bulk normal with no wasting.',
  renal: 'Renal examination: No peripheral oedema. Flanks clear, kidneys not ballotable. No suprapubic tenderness. Urine dipstick normal.',
  endocrine: 'Endocrine examination: No goitre or thyroid nodule. No tremor or thyroid eye signs. Skin normal texture and pigmentation. No acanthosis nigricans.',
  breast: 'Breast examination: Breasts symmetrical with normal contour, skin, and nipples. No palpable masses or axillary lymphadenopathy.',
  ent: 'ENT examination: Ears normal with clear canals and intact tympanic membranes. Nasal cavity normal with patent airways. Oral cavity and oropharynx clear. Neck: no lymphadenopathy or masses.',
  eye: 'Eye examination: Visual acuity normal. Eyelids, conjunctiva, cornea, and lens normal. Pupils equal and reactive. Fundoscopy: normal optic discs, maculae, and vessels. Visual fields full to confrontation.',
  skin: 'Skin examination: Normal skin with no rash, lesions, or abnormal pigmentation. Nails and hair normal.',
  obstetric: 'Obstetric examination: Fundal height appropriate for dates. Longitudinal lie, cephalic presentation. Fetal heart rate normal (110-160 bpm). Uterus soft, no contractions.',
  neonatal: 'Neonatal examination: Well-appearing, pink, active. Normal tone. Skin clear. Red reflexes present. Hips stable. Femoral pulses palpable. Primitive reflexes present and symmetrical.',
};

// ── Build field-value narrative snippets ─────────────────────────────────────

const FIELD_VALUE_NARRATIVE: Record<string, Record<string, string>> = {
  resp_insp_shape: {
    normal: 'Chest of normal shape and symmetry.',
    barrel: 'Barrel-shaped chest noted, suggesting hyperinflation.',
    pectus_carinatum: 'Pectus carinatum (pigeon chest) noted.',
    pectus_excavatum: 'Pectus excavatum (funnel chest) noted.',
    kyphoscoliotic: 'Kyphoscoliotic chest deformity present.',
  },
  resp_insp_trachea: {
    central: 'Trachea central.',
    deviated_left: 'Trachea deviated to the left.',
    deviated_right: 'Trachea deviated to the right.',
  },
  resp_palp_tactile_vocal_fremitus: {
    normal: 'Tactile vocal fremitus normal and symmetrical.',
    increased: 'Tactile vocal fremitus increased, suggesting consolidation.',
    decreased: 'Tactile vocal fremitus decreased, suggesting effusion or pneumothorax.',
    absent: 'Tactile vocal fremitus absent.',
  },
  resp_perc_note: {
    resonant: 'Percussion note resonant throughout all lung fields.',
    dull: 'Dull percussion note noted, suggesting consolidation or effusion.',
    stony_dull: 'Stony dull percussion note, consistent with pleural effusion.',
    hyperresonant: 'Hyperresonant percussion note, suggesting hyperinflation or pneumothorax.',
    tympanitic: 'Tympanitic percussion note, consistent with pneumothorax.',
  },
  resp_ausc_breath_sounds: {
    vesicular: 'Breath sounds vesicular with normal intensity.',
    bronchial: 'Bronchial breath sounds audible, suggesting consolidation.',
    bronchovesicular: 'Bronchovesicular breath sounds noted.',
    reduced: 'Breath sounds reduced.',
    absent: 'Breath sounds absent.',
  },
  cvs_insp_jvp: {
    normal: 'JVP not elevated.',
    elevated: 'JVP elevated at [X] cm above sternal angle.',
  },
  cvs_ausc_heart_sounds: {
    normal: 'Heart sounds I and II normal.',
    reduced: 'Heart sounds reduced.',
    accentuated: 'Heart sounds accentuated.',
    wide_split: 'Wide splitting of S2 noted.',
    fixed_split: 'Fixed splitting of S2, consistent with ASD.',
    paradoxical_split: 'Paradoxical splitting of S2 noted.',
    single_s2: 'Single S2 noted.',
  },
  gi_palp_superficial: {
    soft: 'Abdomen soft on superficial palpation.',
    guarding: 'Voluntary guarding noted.',
    rigidity: 'Abdominal rigidity present, suggesting peritonitis.',
    tenderness: 'Abdominal tenderness on superficial palpation.',
    distended: 'Abdomen distended.',
  },
  gi_palp_liver: {
    not_palpable: 'Liver not palpable.',
    palpable: 'Liver palpable [X] cm below costal margin.',
    enlarged: 'Liver enlarged [X] cm below costal margin.',
    pulsatile: 'Pulsatile liver edge, consistent with tricuspid regurgitation.',
    tender: 'Tender hepatomegaly noted.',
  },
  gi_ausc_bowel_sounds: {
    normal: 'Bowel sounds normal.',
    increased: 'Increased bowel sounds, consistent with early obstruction or gastroenteritis.',
    reduced: 'Reduced bowel sounds noted.',
    absent: 'Bowel sounds absent, suggesting ileus or peritonitis.',
    tinkling: 'Tinkling bowel sounds, consistent with mechanical obstruction.',
    rushing: 'Rushing bowel sounds audible.',
  },
  neuro_insp_gait: {
    normal: 'Gait normal.',
    hemiplegic: 'Hemiplegic gait noted, leg circumduction on affected side.',
    parkinsonian: 'Parkinsonian gait: shuffling with reduced arm swing and festination.',
    ataxic: 'Ataxic gait: broad-based with unsteady tandem walk.',
    steppage: 'Steppage gait, consistent with foot drop (common peroneal nerve or L5 lesion).',
    waddling: 'Waddling gait, consistent with proximal myopathy or bilateral hip pathology.',
  },
  neuro_spec_reflexes_plantar: {
    flexor: 'Plantar responses flexor bilaterally.',
    extensor: 'Extensor plantar response (Babinski sign) present, indicating upper motor neuron lesion.',
  },
};

// ── Generate narrative for a single system ───────────────────────────────────

export function generateSystemNarrative(input: SystemNarrativeInput): SystemNarrativeOutput {
  const { systemId, state, ageYears, context } = input;

  if (!state.examined) {
    return {
      narrative: '',
      summary: '',
      abnormalFindings: [],
      normalSystems: [SYSTEM_LABELS[systemId]],
    };
  }

  if (state.normal) {
    const narrative = SYSTEM_NORMAL_PHRASES[systemId] || `${SYSTEM_LABELS[systemId]}: Normal examination.`;
    return {
      narrative,
      summary: `Normal ${SYSTEM_LABELS[systemId].toLowerCase()}.`,
      abnormalFindings: [],
      normalSystems: [SYSTEM_LABELS[systemId]],
    };
  }

  const abnormalFindings: string[] = [];
  const normalParts: string[] = [];
  const phases = SYSTEM_PHASE_MAP[systemId];

  // If state.normal is false but state.narrative is pre-written, use it
  if (state.narrative) {
    // Extract abnormal findings from fields
    for (const phase of phases) {
      const phaseState = state.phases[phase];
      if (!phaseState) continue;
      for (const [fieldId, value] of Object.entries(phaseState.fields)) {
        if (value !== undefined && value !== '' && value !== false && value !== 'normal' && value !== 'absent') {
          const fieldDef = getFieldDefinition(systemId, fieldId);
          if (fieldDef) {
            const valStr = Array.isArray(value) ? value.join(', ') : String(value);
            abnormalFindings.push(`${fieldDef.label}: ${valStr}`);
          }
        }
      }
    }
    return {
      narrative: state.narrative,
      summary: state.summary || `${SYSTEM_LABELS[systemId]}: Abnormal findings — see narrative.`,
      abnormalFindings,
      normalSystems: [],
    };
  }

  // Generate narrative from field values
  const parts: string[] = [];

  for (const phase of phases) {
    const phaseState = state.phases[phase];
    if (!phaseState) continue;

    const phaseFields = getSystemFields(systemId, phase);
    const phaseAbnormal: string[] = [];

    for (const field of phaseFields) {
      const value = phaseState.fields[field.id];
      if (value === undefined || value === '' || value === false) continue;

      // Check if this is a normal value
      const isNormal = value === 'normal' || value === 'absent' ||
        (typeof value === 'string' && value.startsWith('normal')) ||
        (typeof value === 'string' && value.startsWith('not_')) ||
        value === 'none' || value === 'negative' || value === 'not_palpable';

      if (isNormal) {
        const narrative = FIELD_VALUE_NARRATIVE[field.id]?.[String(value)];
        if (narrative) normalParts.push(narrative);
        continue;
      }

      // Abnormal value
      const narrative = FIELD_VALUE_NARRATIVE[field.id]?.[String(value)];
      const valStr = Array.isArray(value) ? value.join(', ') : String(value);

      if (narrative) {
        phaseAbnormal.push(narrative);
        abnormalFindings.push(`${field.label}: ${valStr} — ${narrative}`);
      } else {
        field.interpretation && phaseAbnormal.push(`${field.label}: ${valStr}. ${field.interpretation}`);
        abnormalFindings.push(`${field.label}: ${valStr}`);
      }
    }

    if (phaseAbnormal.length > 0) {
      parts.push(String(phaseAbnormal.join(' ')));
    }
  }

  const narrative = parts.length > 0
    ? `${SYSTEM_LABELS[systemId]} examination: ${parts.join(' ')}`
    : '';

  const summary = abnormalFindings.length > 0
    ? `${SYSTEM_LABELS[systemId]}: ${abnormalFindings.length} abnormal finding(s) (${abnormalFindings.slice(0, 3).join('; ')}${abnormalFindings.length > 3 ? '; ...' : ''})`
    : `${SYSTEM_LABELS[systemId]}: Abnormal findings present.`;

  return {
    narrative,
    summary,
    abnormalFindings,
    normalSystems: [],
  };
}

// ── Generate full physical examination section of the clinical note ──────────

export function generateFullPhysicalExamination(
  state: SystemExaminations,
  context: { ageYears: number; ageMonths: number; sex: string },
): string {
  const activeSystems = Object.keys(state) as SystemId[];
  if (activeSystems.length === 0) return 'No system examinations documented.';

  const sections: string[] = [];
  const normalSystems: string[] = [];

  for (const systemId of activeSystems) {
    const sysState = state[systemId];
    if (!sysState || !sysState.examined) continue;

    const result = generateSystemNarrative({
      systemId,
      state: sysState,
      ageYears: context.ageYears,
    });

    if (result.narrative) {
      sections.push(result.narrative);
    }
    if (result.narrative && result.normalSystems.length > 0) {
      normalSystems.push(...result.normalSystems);
    }
  }

  if (normalSystems.length > 0) {
    sections.push(`The remaining systems are normal: ${normalSystems.join(', ')}.`);
  }

  return sections.join('\n\n');
}

// ── Generate a concise "Examination" section for the patient note ─────────────

export function generateExamSectionForNote(
  state: SystemExaminations,
  generalExamNarrative: string,
  context: { ageYears: number; ageMonths: number; sex: string },
): string {
  const parts: string[] = [];

  if (generalExamNarrative) {
    parts.push(`General Examination: ${generalExamNarrative}`);
  }

  const systemNarrative = generateFullPhysicalExamination(state, context);
  if (systemNarrative) {
    parts.push(systemNarrative);
  }

  return parts.join('\n\n');
}
