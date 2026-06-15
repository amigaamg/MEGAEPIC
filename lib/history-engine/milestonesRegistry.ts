// ── DEVELOPMENTAL MILESTONES REGISTRY ──
// Based on WHO/Denver Developmental Screening Test

export interface MilestoneDef {
  id: string;
  domain: 'gross_motor' | 'fine_motor' | 'language' | 'social';
  milestone: string;
  ageExpected: string; // age range when 90% of children achieve this
}

export const MILESTONES: MilestoneDef[] = [
  // ── Gross Motor ──
  { id: 'gm_1', domain: 'gross_motor', milestone: 'Lifts head when lying on stomach', ageExpected: '1-2 months' },
  { id: 'gm_2', domain: 'gross_motor', milestone: 'Rolls over (front to back)', ageExpected: '3-4 months' },
  { id: 'gm_3', domain: 'gross_motor', milestone: 'Rolls over (back to front)', ageExpected: '4-5 months' },
  { id: 'gm_4', domain: 'gross_motor', milestone: 'Sits without support', ageExpected: '6-8 months' },
  { id: 'gm_5', domain: 'gross_motor', milestone: 'Crawls', ageExpected: '7-10 months' },
  { id: 'gm_6', domain: 'gross_motor', milestone: 'Pulls to stand', ageExpected: '9-11 months' },
  { id: 'gm_7', domain: 'gross_motor', milestone: 'Stands alone briefly', ageExpected: '10-14 months' },
  { id: 'gm_8', domain: 'gross_motor', milestone: 'Walks alone', ageExpected: '12-15 months' },
  { id: 'gm_9', domain: 'gross_motor', milestone: 'Runs', ageExpected: '18-24 months' },
  { id: 'gm_10', domain: 'gross_motor', milestone: 'Climbs stairs with help', ageExpected: '18-24 months' },
  { id: 'gm_11', domain: 'gross_motor', milestone: 'Kicks a ball', ageExpected: '24-30 months' },
  { id: 'gm_12', domain: 'gross_motor', milestone: 'Stands on one foot briefly', ageExpected: '30-36 months' },
  { id: 'gm_13', domain: 'gross_motor', milestone: 'Hops on one foot', ageExpected: '4-5 years' },
  { id: 'gm_14', domain: 'gross_motor', milestone: 'Skips', ageExpected: '5-6 years' },

  // ── Fine Motor ──
  { id: 'fm_1', domain: 'fine_motor', milestone: 'Follows objects with eyes', ageExpected: '0-2 months' },
  { id: 'fm_2', domain: 'fine_motor', milestone: 'Reaches for objects', ageExpected: '3-4 months' },
  { id: 'fm_3', domain: 'fine_motor', milestone: 'Transfers objects hand to hand', ageExpected: '5-7 months' },
  { id: 'fm_4', domain: 'fine_motor', milestone: 'Pincer grasp', ageExpected: '9-12 months' },
  { id: 'fm_5', domain: 'fine_motor', milestone: 'Stacks blocks (tower of 2-3)', ageExpected: '12-15 months' },
  { id: 'fm_6', domain: 'fine_motor', milestone: 'Turns pages of book', ageExpected: '18-24 months' },
  { id: 'fm_7', domain: 'fine_motor', milestone: 'Draws a circle', ageExpected: '3 years' },
  { id: 'fm_8', domain: 'fine_motor', milestone: 'Draws a square', ageExpected: '4-5 years' },
  { id: 'fm_9', domain: 'fine_motor', milestone: 'Draws a triangle', ageExpected: '5-6 years' },
  { id: 'fm_10', domain: 'fine_motor', milestone: 'Writes own name', ageExpected: '5-6 years' },

  // ── Language ──
  { id: 'lang_1', domain: 'language', milestone: 'Startles to loud sounds', ageExpected: '0-1 month' },
  { id: 'lang_2', domain: 'language', milestone: 'Coos / makes vowel sounds', ageExpected: '2-3 months' },
  { id: 'lang_3', domain: 'language', milestone: 'Babbling (ba-ba, da-da)', ageExpected: '6-8 months' },
  { id: 'lang_4', domain: 'language', milestone: 'Says "mama"/"dada" (specific)', ageExpected: '9-12 months' },
  { id: 'lang_5', domain: 'language', milestone: 'First word (other than parents)', ageExpected: '12-15 months' },
  { id: 'lang_6', domain: 'language', milestone: 'Vocabulary of 10-20 words', ageExpected: '18 months' },
  { id: 'lang_7', domain: 'language', milestone: 'Two-word phrases', ageExpected: '18-24 months' },
  { id: 'lang_8', domain: 'language', milestone: 'Three-word sentences', ageExpected: '2-3 years' },
  { id: 'lang_9', domain: 'language', milestone: 'Knows name, age, gender', ageExpected: '3-4 years' },
  { id: 'lang_10', domain: 'language', milestone: 'Tells stories', ageExpected: '4-5 years' },
  { id: 'lang_11', domain: 'language', milestone: 'Uses past tense, plurals', ageExpected: '5-6 years' },

  // ── Social ──
  { id: 'soc_1', domain: 'social', milestone: 'Social smile', ageExpected: '1-2 months' },
  { id: 'soc_2', domain: 'social', milestone: 'Enjoys looking at faces', ageExpected: '2-3 months' },
  { id: 'soc_3', domain: 'social', milestone: 'Stranger anxiety', ageExpected: '6-9 months' },
  { id: 'soc_4', domain: 'social', milestone: 'Peek-a-boo / plays interactive games', ageExpected: '9-12 months' },
  { id: 'soc_5', domain: 'social', milestone: 'Imitates actions', ageExpected: '12-18 months' },
  { id: 'soc_6', domain: 'social', milestone: 'Parallel play', ageExpected: '2-3 years' },
  { id: 'soc_7', domain: 'social', milestone: 'Shares toys / cooperative play', ageExpected: '3-4 years' },
  { id: 'soc_8', domain: 'social', milestone: 'Understands rules', ageExpected: '5-6 years' },
  { id: 'soc_9', domain: 'social', milestone: 'Toilet training (daytime)', ageExpected: '2-4 years' },
  { id: 'soc_10', domain: 'social', milestone: 'Dresses self independently', ageExpected: '4-5 years' },
];

export function getMilestonesForAge(ageMonths: number): MilestoneDef[] {
  const ageMap: Record<string, number> = {
    '0-1 month': 0.5, '0-2 months': 1, '1-2 months': 1.5,
    '2-3 months': 2.5, '3-4 months': 3.5, '4-5 months': 4.5,
    '5-7 months': 6, '6-8 months': 7, '6-9 months': 7.5,
    '7-10 months': 8.5, '9-11 months': 10, '9-12 months': 10.5,
    '10-14 months': 12, '12-15 months': 13.5, '12-18 months': 15,
    '18-24 months': 21, '18 months': 18, '2-3 years': 30,
    '24-30 months': 27, '30-36 months': 33,
    '3-4 years': 42, '4-5 years': 54, '5-6 years': 66,
    '9-13 years': 132,
  };

  return MILESTONES.filter(m => {
    const expectedAge = ageMap[m.ageExpected];
    return expectedAge !== undefined && expectedAge <= ageMonths * 1.5; // show passed and upcoming
  });
}

export default MILESTONES;
