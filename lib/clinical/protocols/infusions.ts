import type { InfusionProtocol } from '../types/protocols'

export const PNEUMONIA_INFUSIONS: InfusionProtocol[] = [
  {
    id: 'infusion_ns_bolus',
    indication: 'Hypotension / shock',
    solution: '0.9% Normal Saline',
    rate: '500 mL over 15-30 min',
    maxRate: '30 mL/kg total crystalloid before reassess',
    monitoring: ['BP q5min during bolus', 'HR', 'SpO2', 'Lung auscultation for crackles'],
    contraindications: ['Pulmonary edema', 'Severe heart failure', 'Anuria without dialysis'],
  },
  {
    id: 'infusion_ns_maintenance',
    indication: 'Maintenance fluids',
    solution: '0.9% Normal Saline',
    rate: '1 mL/kg/h (for 70 kg: ~80 mL/h)',
    monitoring: ['Electrolytes daily', 'Fluid balance q8h', 'Weight daily'],
    contraindications: ['Hyponatremia', 'Hyperchloremic acidosis risk'],
  },
  {
    id: 'infusion_norepinephrine',
    indication: 'Septic shock (MAP <65 after fluids)',
    solution: 'Norepinephrine (16 mg/50 mL D5W)',
    rate: 'Start 5 mcg/min (5 mL/h), titrate to MAP ≥65',
    maxRate: 'No absolute max — titrate to effect',
    additives: [],
    monitoring: ['Arterial BP continuous', 'CVP', 'Lactate q2h', 'Urine output hourly', 'Peripheral perfusion', 'ECG for arrhythmias'],
    contraindications: ['Hypovolemia (must correct volume first)', 'Ventricular arrhythmias'],
  },
  {
    id: 'infusion_ceftriaxone',
    indication: 'CAP empiric antibiotics',
    solution: 'Ceftriaxone 2 g in 100 mL NS',
    rate: 'Infuse over 30 min',
    monitoring: ['Observe for rash', 'Check renal function'],
    contraindications: ['Cephalosporin anaphylaxis'],
  },
  {
    id: 'infusion_abg_heparin',
    indication: 'Arterial line patency',
    solution: 'Heparinized saline (1 U/mL)',
    rate: '3 mL/h continuous flush',
    monitoring: ['Arterial line site q4h', 'Check for bleeding'],
    contraindications: ['Heparin-induced thrombocytopenia'],
  },
]
