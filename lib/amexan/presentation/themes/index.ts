// AMEXAN Themes - Barrel
// Constitutional Principle: The same intelligence. The appropriate interface.

export { amexanDefaultTheme } from './amexan-default';
export { hospitalTheme } from './hospital-theme';
export { universityTheme } from './university-theme';
export { researchTheme } from './research-theme';
export { governmentTheme } from './government-theme';

import { amexanDefaultTheme } from './amexan-default';
import { hospitalTheme } from './hospital-theme';
import { universityTheme } from './university-theme';
import { researchTheme } from './research-theme';
import { governmentTheme } from './government-theme';

export const themes = [
  amexanDefaultTheme,
  hospitalTheme,
  universityTheme,
  researchTheme,
  governmentTheme,
] as const;
