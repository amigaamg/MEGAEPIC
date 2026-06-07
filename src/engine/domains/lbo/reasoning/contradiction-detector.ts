export interface ClinicalFinding {
  type: 'history' | 'exam' | 'lab' | 'imaging';
  name: string;
  value: string | number | boolean;
  confidence: 'low' | 'medium' | 'high';
}

export interface Contradiction {
  findingA: string;
  findingB: string;
  type: 'direct_conflict' | 'clinical_improbable' | 'anatomy_impossible';
  severity: 'warning' | 'error';
  explanation: string;
  resolution: string;
}

export interface ContradictionResult {
  contradictions: Contradiction[];
  hasCriticalContradiction: boolean;
  criticalCount: number;
  summary: string;
}

const CONTRADICTION_RULES: ((findings: ClinicalFinding[]) => Contradiction | null)[] = [
  (f) => {
    const painColicky = f.find(x => x.name === 'pain_character' && x.value === 'colicky');
    const painConstant = f.find(x => x.name === 'pain_character' && x.value === 'constant since onset');
    if (painColicky && painConstant) {
      return {
        findingA: 'pain_character: colicky',
        findingB: 'pain_character: constant since onset',
        type: 'direct_conflict',
        severity: 'warning',
        explanation: 'Pain cannot be simultaneously colicky (intermittent/cramping) and constant since onset. Colicky pain that becomes constant is a known progression pattern (suggests ischemia).',
        resolution: 'Ask: "Was the pain colicky initially and then became constant?" Record both the initial character and the progression.',
      };
    }
    return null;
  },

  (f) => {
    const emptyRectum = f.find(x => x.name === 'dre_finding' && x.value === 'empty_rectum');
    const stoolInRectum = f.find(x => x.name === 'dre_finding' && x.value === 'stool_in_rectum');
    if (emptyRectum && stoolInRectum) {
      return {
        findingA: 'DRE: empty rectum',
        findingB: 'DRE: stool in rectum',
        type: 'direct_conflict',
        severity: 'error',
        explanation: 'DRE finding cannot be both "empty rectum" and "stool in rectum". These are mutually exclusive findings.',
        resolution: 'Re-examine and clarify the rectal vault status. Empty rectum with no stool suggests complete large bowel obstruction. Stool in rectum may suggest pseudo-obstruction or incomplete obstruction.',
      };
    }
    return null;
  },

  (f) => {
    const flatus = f.find(x => x.name === 'flatus_status' && x.value === 'passing_flatus');
    const absoluteConstipation = f.find(x => x.name === 'bowel_movement_status' && x.value === 'no_stool_3_days');
    if (flatus && absoluteConstipation) {
      return {
        findingA: 'flatus_status: passing flatus',
        findingB: 'history: absolute constipation (no stool 3 days)',
        type: 'clinical_improbable',
        severity: 'warning',
        explanation: 'Passing flatus suggests incomplete obstruction or pseudo-obstruction, which is unusual in the context of absolute constipation for 3 days. A patient who is passing flatus may have a partial rather than complete large bowel obstruction.',
        resolution: 'Clarify: distinguish between "no stool but passing gas" (partial obstruction) vs "no stool and no gas" (complete obstruction). This distinction changes urgency.',
      };
    }
    return null;
  },

  (f) => {
    const freeAir = f.find(x => x.name === 'axr_free_air' && x.value === true);
    const noPeritonism = f.find(x => x.name === 'peritonism' && x.value === false);
    if (freeAir && noPeritonism) {
      return {
        findingA: 'AXR: free air present',
        findingB: 'Exam: no peritonism',
        type: 'clinical_improbable',
        severity: 'warning',
        explanation: 'Free air (pneumoperitoneum) from perforation typically causes peritonitis. Absence of peritonism with free air suggests a contained perforation, post-procedural air, or very early perforation.',
        resolution: 'Correlate clinically. CT is recommended to characterise the free air. A contained perforation may still require surgical intervention.',
      };
    }
    return null;
  },

  (f) => {
    const lactateNormal = f.find(x => x.name === 'lactate' && typeof x.value === 'number' && x.value < 2);
    const pneumatosis = f.find(x => x.name === 'ct_pneumatosis' && x.value === true);
    if (lactateNormal && pneumatosis) {
      return {
        findingA: 'Lactate: normal (<2 mmol/L)',
        findingB: 'CT: pneumatosis intestinalis',
        type: 'clinical_improbable',
        severity: 'warning',
        explanation: 'Pneumatosis intestinalis typically indicates transmural ischaemia/infarction, which almost always elevates lactate. Normal lactate with pneumatosis is rare and suggests benign pneumatosis or very early ischaemia.',
        resolution: 'Repeat lactate in 2 hours. Correlate with clinical status. Consider CT findings of other ischaemia signs (portal venous gas, lack of bowel wall enhancement).',
      };
    }
    return null;
  },

  (f) => {
    const distalCollapsed = f.find(x => x.name === 'ct_transition_point' && x.value === 'present');
    const pancolonicDilation = f.find(x => x.name === 'ct_colonic_dilation_pattern' && x.value === 'pancolonic');
    if (distalCollapsed && pancolonicDilation) {
      return {
        findingA: 'CT: transition point present (distal collapsed)',
        findingB: 'CT: pancolonic dilation (no transition)',
        type: 'direct_conflict',
        severity: 'error',
        explanation: 'A transition point with collapsed distal colon and pancolonic dilation are mutually exclusive. A transition point defines mechanical obstruction; pancolonic dilation suggests pseudo-obstruction.',
        resolution: 'Review CT images. If a transition point exists, the dilation pattern cannot be pan-colonic (it should spare the distal colon).',
      };
    }
    return null;
  },

  (f) => {
    const bowelSoundsPresent = f.find(x => x.name === 'bowel_sounds' && x.value === 'present_normal');
    const peritonism = f.find(x => x.name === 'peritonism' && x.value === true);
    if (bowelSoundsPresent && peritonism) {
      return {
        findingA: 'Bowel sounds: present/normal',
        findingB: 'Exam: peritonism',
        type: 'clinical_improbable',
        severity: 'warning',
        explanation: 'Generalised peritonitis typically causes paralytic ileus with absent bowel sounds. Present bowel sounds with peritonism is atypical and suggests localised rather than generalised peritonitis.',
        resolution: 'Assess the extent of peritonism. If localised (e.g., LLQ only), present bowel sounds may be expected. If generalised, re-examine bowel sounds.',
      };
    }
    return null;
  },

  (f) => {
    const weightLoss = f.find(x => x.name === 'weight_loss' && x.value === true);
    const suddenOnset = f.find(x => x.name === 'symptom_onset' && x.value === 'sudden');
    if (weightLoss && suddenOnset) {
      return {
        findingA: 'History: unintentional weight loss',
        findingB: 'History: sudden onset of distension',
        type: 'clinical_improbable',
        severity: 'warning',
        explanation: 'Sudden onset distension is classic for sigmoid volvulus. Weight loss over weeks suggests underlying malignancy. These two features together should prompt investigation for a volvulus occurring in a patient with underlying cancer (possible but less common).',
        resolution: 'CT is essential to differentiate. Consider whether the weight loss is from a separate process (e.g., malignancy with superimposed volvulus).',
      };
    }
    return null;
  },
];

export function detectContradictions(findings: ClinicalFinding[]): ContradictionResult {
  const contradictions: Contradiction[] = [];

  for (const rule of CONTRADICTION_RULES) {
    const result = rule(findings);
    if (result) {
      contradictions.push(result);
    }
  }

  const criticalCount = contradictions.filter(c => c.severity === 'error').length;

  return {
    contradictions,
    hasCriticalContradiction: criticalCount > 0,
    criticalCount,
    summary: contradictions.length === 0
      ? 'No contradictions detected in clinical data'
      : `${contradictions.length} contradiction(s) found (${criticalCount} critical). ` +
        contradictions.map(c => `[${c.severity.toUpperCase()}] ${c.explanation}`).join(' | '),
  };
}
