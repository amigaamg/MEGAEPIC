// ═══════════════════════════════════════════════════════════════════════════════
// Geographic / Regional Prior Weighting
// When a patient's geographicRegion matches a disease's geographicFlags,
// the prior probability is multiplied by the region-specific multiplier.
// ═══════════════════════════════════════════════════════════════════════════════

export type GeographicRegion =
  | 'east_africa'
  | 'west_africa'
  | 'southern_africa'
  | 'north_africa'
  | 'central_africa'
  | 'south_asia'
  | 'southeast_asia'
  | 'east_asia'
  | 'middle_east'
  | 'mediterranean'
  | 'latin_america'
  | 'tropical'
  | 'farming_regions'
  | 'industrial'
  | 'urban'
  | 'temperate'
  | 'remote'
  | '';

/**
 * Given a patient's geographic region, return a Map of disease geographicFlags
 * to their prior multipliers.
 *
 * For example, a patient from 'east_africa' gives:
 *   'east_africa' → ×2.0
 *   'tropical'    → ×1.5
 *   'endemic_tb'  → ×3.0
 *   'endemic_typhoid' → ×2.0
 */
const REGION_MULTIPLIERS: Record<GeographicRegion, Array<{ flag: string; multiplier: number }>> = {
  east_africa: [
    { flag: 'east_africa', multiplier: 2.0 },
    { flag: 'endemic_typhoid', multiplier: 2.0 },
    { flag: 'endemic_tb', multiplier: 3.0 },
    { flag: 'tropical', multiplier: 1.5 },
    { flag: 'endemic_malaria', multiplier: 2.0 },
    { flag: 'endemic_amoebic', multiplier: 2.0 },
  ],
  west_africa: [
    { flag: 'west_africa', multiplier: 2.0 },
    { flag: 'endemic_malaria', multiplier: 3.0 },
    { flag: 'endemic_typhoid', multiplier: 2.0 },
    { flag: 'endemic_amoebic', multiplier: 2.0 },
    { flag: 'tropical', multiplier: 1.5 },
  ],
  southern_africa: [
    { flag: 'southern_africa', multiplier: 2.0 },
    { flag: 'endemic_tb', multiplier: 3.0 },
    { flag: 'endemic_malaria', multiplier: 1.5 },
    { flag: 'endemic_typhoid', multiplier: 1.5 },
  ],
  north_africa: [
    { flag: 'north_africa', multiplier: 2.0 },
    { flag: 'mediterranean', multiplier: 2.0 },
    { flag: 'endemic_brucellosis', multiplier: 2.0 },
    { flag: 'endemic_typhoid', multiplier: 1.5 },
  ],
  central_africa: [
    { flag: 'central_africa', multiplier: 2.0 },
    { flag: 'endemic_malaria', multiplier: 3.0 },
    { flag: 'endemic_typhoid', multiplier: 2.0 },
    { flag: 'endemic_amoebic', multiplier: 2.0 },
    { flag: 'tropical', multiplier: 1.5 },
  ],
  south_asia: [
    { flag: 'south_asia', multiplier: 2.0 },
    { flag: 'endemic_typhoid', multiplier: 2.0 },
    { flag: 'endemic_tb', multiplier: 2.0 },
    { flag: 'endemic_malaria', multiplier: 2.0 },
    { flag: 'tropical', multiplier: 1.5 },
    { flag: 'endemic_dengue', multiplier: 2.0 },
    { flag: 'endemic_leptospirosis', multiplier: 2.0 },
  ],
  southeast_asia: [
    { flag: 'southeast_asia', multiplier: 2.0 },
    { flag: 'endemic_dengue', multiplier: 3.0 },
    { flag: 'endemic_malaria', multiplier: 2.0 },
    { flag: 'endemic_leptospirosis', multiplier: 2.0 },
    { flag: 'endemic_typhoid', multiplier: 2.0 },
    { flag: 'tropical', multiplier: 1.5 },
  ],
  east_asia: [
    { flag: 'east_asia', multiplier: 2.0 },
    { flag: 'hbv_endemic', multiplier: 3.0 },
    { flag: 'endemic_typhoid', multiplier: 1.5 },
  ],
  middle_east: [
    { flag: 'middle_east', multiplier: 2.0 },
    { flag: 'mediterranean', multiplier: 2.0 },
    { flag: 'endemic_brucellosis', multiplier: 2.0 },
    { flag: 'endemic_typhoid', multiplier: 1.5 },
  ],
  mediterranean: [
    { flag: 'mediterranean', multiplier: 2.0 },
    { flag: 'endemic_brucellosis', multiplier: 2.0 },
  ],
  latin_america: [
    { flag: 'latin_america', multiplier: 2.0 },
    { flag: 'tropical', multiplier: 1.5 },
    { flag: 'endemic_amoebic', multiplier: 2.0 },
    { flag: 'endemic_dengue', multiplier: 2.0 },
    { flag: 'endemic_malaria', multiplier: 2.0 },
  ],
  tropical: [
    { flag: 'tropical', multiplier: 2.0 },
    { flag: 'endemic_malaria', multiplier: 3.0 },
    { flag: 'endemic_dengue', multiplier: 2.0 },
    { flag: 'endemic_typhoid', multiplier: 2.0 },
    { flag: 'endemic_amoebic', multiplier: 2.0 },
    { flag: 'endemic_leptospirosis', multiplier: 2.0 },
  ],
  farming_regions: [
    { flag: 'farming_regions', multiplier: 5.0 },
    { flag: 'endemic_leptospirosis', multiplier: 2.0 },
  ],
  industrial: [
    { flag: 'industrial', multiplier: 2.0 },
  ],
  urban: [],
  temperate: [],
  remote: [
    { flag: 'remote', multiplier: 1.5 },
  ],
  '': [],
};

/** All known geographic region labels for UI display */
export const GEOGRAPHIC_REGION_OPTIONS: { value: GeographicRegion; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: 'east_africa', label: 'East Africa (e.g. Kenya, Tanzania, Uganda)' },
  { value: 'west_africa', label: 'West Africa (e.g. Nigeria, Ghana)' },
  { value: 'southern_africa', label: 'Southern Africa (e.g. South Africa, Zimbabwe)' },
  { value: 'north_africa', label: 'North Africa (e.g. Egypt, Morocco)' },
  { value: 'central_africa', label: 'Central Africa (e.g. DRC, Cameroon)' },
  { value: 'south_asia', label: 'South Asia (e.g. India, Pakistan, Bangladesh)' },
  { value: 'southeast_asia', label: 'Southeast Asia (e.g. Thailand, Vietnam, Indonesia)' },
  { value: 'east_asia', label: 'East Asia (e.g. China, Japan, Korea)' },
  { value: 'middle_east', label: 'Middle East (e.g. Saudi Arabia, Iran)' },
  { value: 'mediterranean', label: 'Mediterranean (e.g. Italy, Greece, Turkey)' },
  { value: 'latin_america', label: 'Latin America (e.g. Brazil, Mexico)' },
  { value: 'tropical', label: 'General tropical region' },
  { value: 'farming_regions', label: 'Farming / agricultural region' },
  { value: 'industrial', label: 'Industrial / urban centre' },
  { value: 'urban', label: 'Urban setting (no specific geographic priors)' },
  { value: 'temperate', label: 'Temperate climate' },
  { value: 'remote', label: 'Remote / rural (limited access)' },
];

/**
 * Apply geographic prior multiplier to a disease's prior probability.
 * Returns the modified prior (multiplied by the highest applicable multiplier).
 */
export function applyGeographicPrior(
  prior: number,
  diseaseGeographicFlags: string[] | undefined,
  geographicRegion: GeographicRegion,
): number {
  if (!diseaseGeographicFlags || diseaseGeographicFlags.length === 0) return prior;
  if (!geographicRegion) return prior;

  const regionMultipliers = REGION_MULTIPLIERS[geographicRegion];
  if (!regionMultipliers || regionMultipliers.length === 0) return prior;

  let maxMultiplier = 1;
  for (const flag of diseaseGeographicFlags) {
    const match = regionMultipliers.find(m => m.flag === flag);
    if (match && match.multiplier > maxMultiplier) {
      maxMultiplier = match.multiplier;
    }
  }

  return maxMultiplier > 1 ? prior * maxMultiplier : prior;
}
