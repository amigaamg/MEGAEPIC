// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Investigations Engine — clinically organized investigation ordering
// ═══════════════════════════════════════════════════════════════════════════════
// Investigations are NOT a flat list.
// They are organized by CLINICAL QUESTION:
//   1. Baseline / screening
//   2. Confirm the leading diagnosis
//   3. Exclude dangerous differentials
//   4. Assess severity and complications
//   5. Monitor treatment and progress
// ═══════════════════════════════════════════════════════════════════════════════

// ── Investigation categories ───────────────────────────────────────────────────

export type InvestigationCategory =
  | 'baseline'
  | 'confirm_diagnosis'
  | 'exclude_differential'
  | 'assess_severity'
  | 'monitor_treatment';

export type InvestigationDepartment =
  | 'haematology'
  | 'biochemistry'
  | 'microbiology'
  | 'histopathology'
  | 'immunology'
  | 'radiology'
  | 'ultrasound'
  | 'cardiology'
  | 'bedside'
  | 'other';

export type InvestigationPriority = 'routine' | 'urgent' | 'stat' | 'as_clinically_indicated';

// ── Investigation card ─────────────────────────────────────────────────────────

export interface InvestigationCard {
  id: string;
  testName: string;
  category: InvestigationCategory;
  department: InvestigationDepartment;
  priority: InvestigationPriority;
  clinicalQuestion: string;
  differentialTarget?: string;
  specimen?: string;
  turnaroundHours?: number;
  costEstimate?: number;
  referenceRange?: string;
  isSelected: boolean;
  isResulted: boolean;
  result?: InvestigationResult;
}

export interface InvestigationResult {
  value: string | number;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'abnormal' | 'critical' | 'not_done';
  interpretation: string;
  resultedAt: number;
  resultedBy?: string;
  comment?: string;
}

// ── Investigation panel — organized by clinical question ───────────────────────

export interface InvestigationPanel {
  id: string;
  label: string;
  category: InvestigationCategory;
  priority: InvestigationPriority;
  clinicalQuestion: string;
  investigations: InvestigationCard[];
}

// ── Common investigation panels ────────────────────────────────────────────────

export function getBaselinePanel(): InvestigationPanel {
  return {
    id: 'baseline',
    label: 'Baseline Investigations',
    category: 'baseline',
    priority: 'routine',
    clinicalQuestion: 'What is the patient\'s baseline status?',
    investigations: [
      createCard('fbc', 'Full blood count', 'baseline', 'haematology', 'Screen for anaemia, infection, thrombocytopenia', '10'),
      createCard('uem', 'Urea & electrolytes', 'baseline', 'biochemistry', 'Assess renal function and electrolyte balance', '10'),
      createCard('crp', 'C-reactive protein', 'baseline', 'biochemistry', 'Screen for inflammation/infection', '24'),
      createCard('glucose', 'Blood glucose', 'baseline', 'biochemistry', 'Screen for hypo/hyperglycaemia', '1'),
      createCard('malaria_rdt', 'Malaria RDT', 'baseline', 'microbiology', 'Malaria screening in endemic areas', '1'),
      createCard('urinalysis', 'Urinalysis', 'baseline', 'bedside', 'Screen for UTI, proteinuria, ketones, glucose', '0.5'),
      createCard('blood_cultures', 'Blood cultures', 'baseline', 'microbiology', 'Identify bacteraemia if febrile', '48'),
    ],
  };
}

export function getAbdominalPainPanel(): InvestigationPanel[] {
  return [
    {
      id: 'abdo_confirm',
      label: 'Confirm leading diagnosis',
      category: 'confirm_diagnosis',
      priority: 'urgent',
      clinicalQuestion: 'What is causing the abdominal pain?',
      investigations: [
        createCard('lipase', 'Serum lipase', 'confirm_diagnosis', 'biochemistry', 'Pancreatitis', '24'),
        createCard('abdominal_xr', 'Abdominal X-ray', 'confirm_diagnosis', 'radiology', 'Bowel obstruction, perforation', '2'),
        createCard('abdominal_us', 'Abdominal ultrasound', 'confirm_diagnosis', 'ultrasound', 'Gallstones, liver abscess, appendicitis', '4'),
        createCard('ct_abdomen', 'CT abdomen (with contrast)', 'confirm_diagnosis', 'radiology', 'Detailed evaluation of acute abdomen', '4'),
      ],
    },
    {
      id: 'abdo_exclude',
      label: 'Exclude dangerous differentials',
      category: 'exclude_differential',
      priority: 'urgent',
      clinicalQuestion: 'What dangerous conditions must be excluded?',
      investigations: [
        createCard('ecg', 'ECG', 'exclude_differential', 'cardiology', 'MI presenting as epigastric pain', '0.5'),
        createCard('troponin', 'Troponin', 'exclude_differential', 'biochemistry', 'ACS', '2'),
        createCard('bhcg', 'BhCG', 'exclude_differential', 'biochemistry', 'Ectopic pregnancy (all women of reproductive age)', '2'),
        createCard('lfts', 'Liver function tests', 'exclude_differential', 'biochemistry', 'Hepatobiliary pathology', '10'),
      ],
    },
    {
      id: 'abdo_severity',
      label: 'Assess severity',
      category: 'assess_severity',
      priority: 'urgent',
      clinicalQuestion: 'How severe is the condition?',
      investigations: [
        createCard('abg', 'Arterial blood gas', 'assess_severity', 'biochemistry', 'Acid-base status, lactate for sepsis', '0.5'),
        createCard('lactate', 'Serum lactate', 'assess_severity', 'biochemistry', 'Tissue hypoperfusion, sepsis severity', '2'),
        createCard('cross_match', 'Group & save / cross-match', 'assess_severity', 'haematology', 'If haemorrhage suspected', '4'),
      ],
    },
  ];
}

export function getRespiratoryPanel(): InvestigationPanel[] {
  return [
    {
      id: 'resp_confirm',
      label: 'Confirm leading diagnosis',
      category: 'confirm_diagnosis',
      priority: 'urgent',
      clinicalQuestion: 'What is the respiratory pathology?',
      investigations: [
        createCard('cxr', 'Chest X-ray', 'confirm_diagnosis', 'radiology', 'Pneumonia, effusion, pneumothorax, TB', '1'),
        createCard('sputum_culture', 'Sputum culture & microscopy', 'confirm_diagnosis', 'microbiology', 'Identify respiratory pathogen', '48'),
        createCard('gene_xpert', 'GeneXpert (TB)', 'confirm_diagnosis', 'microbiology', 'TB diagnosis and rifampicin resistance', '2'),
      ],
    },
    {
      id: 'resp_exclude',
      label: 'Exclude dangerous differentials',
      category: 'exclude_differential',
      priority: 'urgent',
      clinicalQuestion: 'What dangerous conditions must be excluded?',
      investigations: [
        createCard('ctpa', 'CT pulmonary angiogram', 'exclude_differential', 'radiology', 'Pulmonary embolism', '4'),
        createCard('d_dimer', 'D-dimer', 'exclude_differential', 'haematology', 'VTE risk assessment (low pre-test probability)', '2'),
        createCard('pro_bnp', 'NT-proBNP', 'exclude_differential', 'biochemistry', 'Heart failure', '4'),
      ],
    },
    {
      id: 'resp_severity',
      label: 'Assess severity',
      category: 'assess_severity',
      priority: 'urgent',
      clinicalQuestion: 'How severe is the respiratory compromise?',
      investigations: [
        createCard('abg', 'Arterial blood gas', 'assess_severity', 'biochemistry', 'PaO₂, PaCO₂, pH, bicarbonate', '0.5'),
        createCard('crp', 'CRP', 'assess_severity', 'biochemistry', 'Inflammatory response', '24'),
      ],
    },
  ];
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function createCard(
  id: string,
  testName: string,
  category: InvestigationCategory,
  department: InvestigationDepartment,
  clinicalQuestion: string,
  turnaroundHours: string,
): InvestigationCard {
  return {
    id,
    testName,
    category,
    department,
    priority: 'routine',
    clinicalQuestion,
    turnaroundHours: parseInt(turnaroundHours),
    isSelected: false,
    isResulted: false,
  };
}

// ── Result auto-fill ───────────────────────────────────────────────────────────
// When lab results come back, they auto-fill into the appropriate investigation card.

export interface LabResultPayload {
  testId: string;
  testName: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'abnormal' | 'critical';
  resultedAt: number;
  resultedBy?: string;
  comment?: string;
}

export function applyLabResult(
  panel: InvestigationPanel,
  result: LabResultPayload
): InvestigationPanel {
  return {
    ...panel,
    investigations: panel.investigations.map(inv => {
      if (inv.id === result.testId || inv.testName === result.testName) {
        return {
          ...inv,
          isResulted: true,
          result: {
            value: result.value,
            unit: result.unit,
            referenceRange: result.referenceRange,
            flag: result.flag,
            interpretation: generateInterpretation(result.value, result.unit, result.referenceRange, result.flag),
            resultedAt: result.resultedAt,
            resultedBy: result.resultedBy,
            comment: result.comment,
          },
        };
      }
      return inv;
    }),
  };
}

export function applyLabResultsToAll(
  panels: InvestigationPanel[],
  results: LabResultPayload[]
): InvestigationPanel[] {
  return panels.map(panel => {
    let updated = { ...panel };
    for (const result of results) {
      updated = applyLabResult(updated, result);
    }
    return updated;
  });
}

function generateInterpretation(value: string | number, unit: string, referenceRange: string, flag: string): string {
  if (flag === 'normal') return `Within normal range (${referenceRange})`;
  if (flag === 'abnormal') return `Abnormal: ${value} ${unit} (reference: ${referenceRange})`;
  if (flag === 'critical') return `Critical: ${value} ${unit} (reference: ${referenceRange}) — immediate attention required`;
  return `${value} ${unit}`;
}

// ── Investigation state management ─────────────────────────────────────────────

export function selectInvestigation(panelId: string, invId: string, panels: InvestigationPanel[]): InvestigationPanel[] {
  return panels.map(p => {
    if (p.id !== panelId) return p;
    return {
      ...p,
      investigations: p.investigations.map(inv =>
        inv.id === invId ? { ...inv, isSelected: !inv.isSelected } : inv
      ),
    };
  });
}

export function getSelectedInvestigations(panels: InvestigationPanel[]): InvestigationCard[] {
  const selected: InvestigationCard[] = [];
  for (const panel of panels) {
    for (const inv of panel.investigations) {
      if (inv.isSelected) selected.push(inv);
    }
  }
  return selected;
}

export function getPendingResults(panels: InvestigationPanel[]): InvestigationCard[] {
  const pending: InvestigationCard[] = [];
  for (const panel of panels) {
    for (const inv of panel.investigations) {
      if (inv.isSelected && !inv.isResulted) pending.push(inv);
    }
  }
  return pending;
}
