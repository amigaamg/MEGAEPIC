// ── IMMUNIZATION SCHEDULE (EPI / WHO Standard) ──
// Standard Expanded Programme on Immunization schedule

export interface VaccineDef {
  id: string;
  name: string;
  doses: { dose: string; ageDue: string }[];
  route: string;
  site: string;
}

export const EPI_SCHEDULE: VaccineDef[] = [
  {
    id: 'bcg', name: 'BCG (Bacille Calmette-Guérin)',
    doses: [{ dose: 'BCG', ageDue: 'At birth' }],
    route: 'Intradermal', site: 'Left upper arm (deltoid)',
  },
  {
    id: 'opv', name: 'OPV (Oral Polio Vaccine)',
    doses: [
      { dose: 'OPV-0', ageDue: 'At birth' },
      { dose: 'OPV-1', ageDue: '6 weeks' },
      { dose: 'OPV-2', ageDue: '10 weeks' },
      { dose: 'OPV-3', ageDue: '14 weeks' },
    ],
    route: 'Oral', site: 'Oral',
  },
  {
    id: 'ipv', name: 'IPV (Inactivated Polio Vaccine)',
    doses: [{ dose: 'IPV', ageDue: '14 weeks' }],
    route: 'Intramuscular', site: 'Right thigh (vastus lateralis)',
  },
  {
    id: 'penta', name: 'Pentavalent (DPT-HepB-Hib)',
    doses: [
      { dose: 'Penta-1', ageDue: '6 weeks' },
      { dose: 'Penta-2', ageDue: '10 weeks' },
      { dose: 'Penta-3', ageDue: '14 weeks' },
      { dose: 'Penta-Booster', ageDue: '15-18 months' },
    ],
    route: 'Intramuscular', site: 'Left thigh (vastus lateralis)',
  },
  {
    id: 'pcv', name: 'PCV (Pneumococcal Conjugate Vaccine)',
    doses: [
      { dose: 'PCV-1', ageDue: '6 weeks' },
      { dose: 'PCV-2', ageDue: '10 weeks' },
      { dose: 'PCV-3', ageDue: '14 weeks' },
      { dose: 'PCV-Booster', ageDue: '9-12 months' },
    ],
    route: 'Intramuscular', site: 'Right thigh (vastus lateralis)',
  },
  {
    id: 'rota', name: 'Rotavirus Vaccine',
    doses: [
      { dose: 'Rota-1', ageDue: '6 weeks' },
      { dose: 'Rota-2', ageDue: '10 weeks' },
      { dose: 'Rota-3', ageDue: '14 weeks' },
    ],
    route: 'Oral', site: 'Oral',
  },
  {
    id: 'measles', name: 'Measles-Rubella (MR)',
    doses: [
      { dose: 'MR-1', ageDue: '9 months' },
      { dose: 'MR-2', ageDue: '15-18 months' },
    ],
    route: 'Subcutaneous', site: 'Left upper arm',
  },
  {
    id: 'yellow_fever', name: 'Yellow Fever',
    doses: [{ dose: 'YF', ageDue: '9 months' }],
    route: 'Subcutaneous', site: 'Right upper arm',
  },
  {
    id: 'hpv', name: 'HPV (Human Papillomavirus)',
    doses: [
      { dose: 'HPV-1', ageDue: '9-13 years' },
      { dose: 'HPV-2', ageDue: '6-12 months after 1st' },
    ],
    route: 'Intramuscular', site: 'Deltoid',
  },
  {
    id: 'tetanus', name: 'Tetanus Toxoid (TT) / Tdap',
    doses: [
      { dose: 'TT-1', ageDue: 'As early as possible in pregnancy or at 15 years' },
      { dose: 'TT-2', ageDue: '4 weeks after TT-1' },
      { dose: 'TT-3', ageDue: '6 months after TT-2' },
      { dose: 'TT-4', ageDue: '1 year after TT-3' },
      { dose: 'TT-5', ageDue: '1 year after TT-4' },
    ],
    route: 'Intramuscular', site: 'Deltoid',
  },
  {
    id: 'covid', name: 'COVID-19 Vaccine',
    doses: [
      { dose: 'COVID-1', ageDue: '12+ years (per national guidelines)' },
      { dose: 'COVID-2', ageDue: '4-12 weeks after 1st' },
      { dose: 'COVID-Booster', ageDue: 'Per national guidelines' },
    ],
    route: 'Intramuscular', site: 'Deltoid',
  },
];

export default EPI_SCHEDULE;
