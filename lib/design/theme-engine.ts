// AMEXAN Theme Engine
// Constitutional Principle: Theme is never CSS. Theme is data.

import { colorTokens } from './tokens/colors';
import { typographyTokens } from './tokens/typography';
import { spacingTokens } from './tokens/spacing';
import { breakpoints } from './tokens/breakpoints';
import { elevationTokens } from './tokens/elevation';
import { iconSizes } from './tokens/icons';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: typeof colorTokens;
  typography: typeof typographyTokens;
  spacing: typeof spacingTokens;
  breakpoints: typeof breakpoints;
  radius: {
    small: string;
    medium: string;
    large: string;
    base: string;
    xl: string;
    pill: string;
    circle: string;
  };
  shadows: {
    flat: string;
    low: string;
    medium: string;
    high: string;
    floating: string;
    overlay: string;
  };
  elevation: typeof elevationTokens;
  icons: typeof iconSizes;
  animations: {
    duration: {
      micro: string;
      fast: string;
      normal: string;
      slow: string;
      slowest: string;
    };
    easing: {
      standard: string;
      decelerate: string;
      accelerate: string;
      sharp: string;
    };
  };
}

export const radiusTokens = {
  small: '4px',
  medium: '8px',
  large: '12px',
  base: '16px',
  xl: '24px',
  pill: '9999px',
  circle: '9999px',
};

export const shadowTokens = {
  flat: 'none',
  low: '0 1px 2px rgba(0, 0, 0, 0.05)',
  medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
  high: '0 10px 15px rgba(0, 0, 0, 0.1)',
  floating: '0 20px 25px rgba(0, 0, 0, 0.15)',
  overlay: '0 0 0 rgba(0, 0, 0, 0.5)',
};

export const animationTokens = {
  duration: {
    micro: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slowest: '500ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 0.6, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const baseTheme: Theme = {
  id: 'clinical',
  name: 'Clinical Blue',
  description: 'Default AMEXAN theme based on clinical blues',
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  breakpoints,
  radius: radiusTokens,
  shadows: shadowTokens,
  elevation: elevationTokens,
  icons: iconSizes,
  animations: {
    duration: animationTokens.duration,
    easing: animationTokens.easing,
  },
};

export const themes: Record<string, Theme> = {
  clinical: baseTheme,
  hospital: {
    ...baseTheme,
    id: 'hospital',
    name: 'Hospital Theme',
    description: 'Theme for hospital deployments',
  },
  university: {
    ...baseTheme,
    id: 'university',
    name: 'University Theme',
    description: 'Theme for academic institutions',
  },
  government: {
    ...baseTheme,
    id: 'government',
    name: 'Government Theme',
    description: 'Theme for government deployments',
  },
  ngo: {
    ...baseTheme,
    id: 'ngo',
    name: 'NGO Theme',
    description: 'Theme for non-governmental organizations',
  },
};

export const getTheme = (themeId: string): Theme => {
  return themes[themeId] || baseTheme;
};
