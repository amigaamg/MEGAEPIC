// ─── AMEXAN — Investigation Rules ──────────────────────────────────────────
import { InvestigationRule, DiseaseProfile, SymptomWeight, DiseaseId, ConsultationContext, } from '@/src/types';

export const investigationRules: InvestigationRule[] = [
  {
    diseaseId: 'pneumonia',
    investigations: [
      { name: 'Pulse oximetry',  rationale: 'Assess hypoxia — guides oxygen need and severity',           priority: 'urgent'       },
      { name: 'Chest X-Ray',     rationale: 'Confirm consolidation, assess extent, rule out effusion',    priority: 'urgent'       },
      { name: 'CBC + differential', rationale: 'WBC elevation supports bacterial cause; anaemia in TB',  priority: 'urgent'       },
      { name: 'CRP',             rationale: 'Supports bacterial infection if elevated; guides antibiotics', priority: 'urgent'     },
      { name: 'Blood culture',   rationale: 'Identify organism — especially in severe or hospitalised',   priority: 'urgent'       },
      { name: 'Blood glucose',   rationale: 'Hypoglycaemia in sepsis; baseline metabolic status',         priority: 'routine'      },
      { name: 'Sputum culture',  rationale: 'If productive cough and able to produce sample',             priority: 'if_uncertain' },
      { name: 'Procalcitonin',   rationale: 'Differentiates bacterial vs viral if available',             priority: 'if_uncertain' },
    ],
  },
  {
    diseaseId: 'asthma',
    investigations: [
      { name: 'Pulse oximetry',         rationale: 'SpO2 < 92% = severe; guides oxygen therapy',        priority: 'urgent'       },
      { name: 'Peak flow (if able)',     rationale: '< 50% predicted = moderate–severe exacerbation',    priority: 'urgent'       },
      { name: 'CXR — first episode only', rationale: 'Exclude pneumothorax, consolidation, foreign body', priority: 'if_uncertain' },
      { name: 'Blood gas (ABG/VBG)',    rationale: 'If severe; rising CO2 = impending respiratory failure', priority: 'if_uncertain' },
    ],
  },
  {
    diseaseId: 'bronchiolitis',
    investigations: [
      { name: 'Pulse oximetry',     rationale: 'Primary severity marker — SpO2 < 92% needs admission',  priority: 'urgent'       },
      { name: 'Nasal swab (RSV/viral panel)', rationale: 'Confirm RSV; cohorting; parental counselling', priority: 'routine'     },
      { name: 'CXR',               rationale: 'Only if diagnosis uncertain or deteriorating',            priority: 'if_uncertain' },
      { name: 'FBC / CRP',         rationale: 'Only if secondary bacterial infection suspected',         priority: 'if_uncertain' },
    ],
  },
  {
    diseaseId: 'tb',
    investigations: [
      { name: 'Mantoux / IGRA',          rationale: 'Primary TB screen; positive in exposure/infection',    priority: 'urgent'  },
      { name: 'Chest X-Ray',             rationale: 'Hilar adenopathy, consolidation, cavitation, effusion', priority: 'urgent' },
      { name: 'Gene Xpert MTB/RIF',      rationale: 'Rapid molecular diagnosis; detects rifampicin resistance', priority: 'urgent' },
      { name: 'Gastric washings × 3',    rationale: 'Best sputum equivalent in children < 5 years',         priority: 'urgent'  },
      { name: 'HIV test',                rationale: 'TB/HIV co-infection changes management',                priority: 'urgent'  },
      { name: 'LFTs',                    rationale: 'Baseline before starting anti-TB therapy',              priority: 'routine' },
      { name: 'ESR / CRP',               rationale: 'Supports active infection; monitors treatment response', priority: 'routine' },
    ],
  },
  {
    diseaseId: 'croup',
    investigations: [
      { name: 'Clinical diagnosis',      rationale: 'Croup is clinical — barking cough + stridor + viral prodrome', priority: 'urgent' },
      { name: 'CXR (AP neck)',           rationale: 'Steeple sign if uncertain; exclude foreign body',     priority: 'if_uncertain' },
      { name: 'Pulse oximetry',          rationale: 'If SpO2 falling, reassess for severity',              priority: 'urgent'       },
    ],
  },
  {
    diseaseId: 'urti',
    investigations: [
      { name: 'Clinical diagnosis',      rationale: 'URTI is a clinical diagnosis — investigations rarely needed', priority: 'routine' },
      { name: 'Throat swab',             rationale: 'If exudate present — rule out GAS pharyngitis',       priority: 'if_uncertain' },
      { name: 'CRP / FBC',               rationale: 'Only if concern about bacterial superinfection',      priority: 'if_uncertain' },
    ],
  },
  {
    diseaseId: 'pleural_effusion',
    investigations: [
      { name: 'Chest X-Ray',             rationale: 'Confirms effusion; assess size and mediastinal shift', priority: 'urgent'  },
      { name: 'Ultrasound thorax',       rationale: 'Characterises effusion; guides diagnostic tap',       priority: 'urgent'       },
      { name: 'Diagnostic thoracocentesis', rationale: 'Fluid analysis — protein, LDH, glucose, culture, cytology', priority: 'urgent' },
      { name: 'CBC + CRP',               rationale: 'Assess inflammatory response',                        priority: 'urgent'       },
      { name: 'Mantoux / IGRA',          rationale: 'TB effusion is common in endemic areas',              priority: 'routine'      },
      { name: 'Blood culture',           rationale: 'Para-pneumonic effusion — identify organism',         priority: 'routine'      },
    ],
  },
  {
    diseaseId: 'pneumothorax',
    investigations: [
      { name: 'Chest X-Ray (erect, expiratory)', rationale: 'Confirms pneumothorax; assesses size',      priority: 'urgent'       },
      { name: 'Pulse oximetry',                  rationale: 'Severity marker; SpO2 drop = tension',       priority: 'urgent'       },
      { name: 'ABG',                             rationale: 'If significant hypoxia or haemodynamic compromise', priority: 'urgent' },
    ],
  },
];

// ─── Helper: get deduped investigations for top differentials ────────────────
export function getInvestigationsForDDx(
  topDiseaseIds: DiseaseId[],
  limit = 3
): { name: string; rationale: string; priority: string }[] {
  const seen = new Set<string>();
  const result: { name: string; rationale: string; priority: string }[] = [];

  topDiseaseIds.slice(0, limit).forEach(id => {
    const rule = investigationRules.find(r => r.diseaseId === id);
    if (!rule) return;
    rule.investigations.forEach(inv => {
      if (!seen.has(inv.name)) {
        seen.add(inv.name);
        result.push(inv);
      }
    });
  });

  // Sort: urgent first
  return result.sort((a, b) => {
    const order = { urgent: 0, routine: 1, if_uncertain: 2 };
    return (order[a.priority as keyof typeof order] ?? 2) -
           (order[b.priority as keyof typeof order] ?? 2);
  });
}