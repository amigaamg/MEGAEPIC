// AMEXAN Design Tokens - Breakpoints
// Constitutional Principle: Responsiveness is experience adaptation. Not CSS.
// Spec: 13 responsive profiles, from nano (240-319px) to wall display (2560+).

export const breakpoints = {
  nano: {
    name: 'Nano',
    min: 240,
    max: 319,
    label: 'Wearable / Micro Display',
    devices: ['Watches', 'Micro terminals', 'Pager-style devices'],
  },
  xs: {
    name: 'Extra Small',
    min: 320,
    max: 359,
    label: 'Mobile Small',
    devices: ['iPhone SE', 'Very small phones'],
  },
  sm: {
    name: 'Small',
    min: 360,
    max: 479,
    label: 'Mobile Standard',
    devices: ['Modern iPhones', 'Pixel', 'Samsung'],
  },
  md: {
    name: 'Medium',
    min: 480,
    max: 767,
    label: 'Mobile Large',
    devices: ['Plus phones', 'Folded foldables'],
  },
  lg: {
    name: 'Large',
    min: 768,
    max: 1023,
    label: 'Tablet',
    devices: ['iPad', 'Android tablets', 'Medical tablets'],
  },
  xl: {
    name: 'Extra Large',
    min: 1024,
    max: 1279,
    label: 'Laptop',
    devices: ['Hospital laptops'],
  },
  xl2: {
    name: 'XXL',
    min: 1280,
    max: 1599,
    label: 'Desktop',
    devices: ['Most desktops'],
  },
  xl3: {
    name: 'XXXL',
    min: 1600,
    max: 1919,
    label: 'Large Desktop',
    devices: ['Clinic workstations'],
  },
  xl4: {
    name: 'XXXXL',
    min: 1920,
    max: 2559,
    label: 'Ultrawide',
    devices: ['Radiology', 'ICU dashboards', 'Hospital workstations'],
  },
  xl5: {
    name: 'XXXXXL',
    min: 2560,
    max: 3199,
    label: 'Wall Display',
    devices: ['Command centers', 'Ward TVs', 'Operating theatre displays'],
  },
  xl6: {
    name: 'XXXXXXL',
    min: 3200,
    max: 3839,
    label: 'Large Wall Display',
    devices: ['4K wall panels', 'Surgical suites'],
  },
  xl7: {
    name: 'XXXXXXXL',
    min: 3840,
    max: 5119,
    label: '8K Display',
    devices: ['8K diagnostic panels', 'Medical simulation walls'],
  },
  xl8: {
    name: 'XXXXXXXXL',
    min: 5120,
    max: Infinity,
    label: 'Command Wall',
    devices: ['Command centers', 'Emergency operations centers'],
  },
} as const;

export type BreakpointName = keyof typeof breakpoints;

export const breakpointOrder: BreakpointName[] = [
  'nano',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'xl2',
  'xl3',
  'xl4',
  'xl5',
  'xl6',
  'xl7',
  'xl8',
];

export const getCurrentBreakpoint = (width: number): BreakpointName => {
  if (width < 240) return 'nano';
  if (width < 320) return 'nano';
  if (width < 360) return 'xs';
  if (width < 480) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  if (width < 1600) return 'xl2';
  if (width < 1920) return 'xl3';
  if (width < 2560) return 'xl4';
  if (width < 3200) return 'xl5';
  if (width < 3840) return 'xl6';
  if (width < 5120) return 'xl7';
  return 'xl8';
};

export const isBreakpointAtLeast = (current: BreakpointName, target: BreakpointName): boolean => {
  return breakpointOrder.indexOf(current) >= breakpointOrder.indexOf(target);
};

export const isBreakpointAtMost = (current: BreakpointName, target: BreakpointName): boolean => {
  return breakpointOrder.indexOf(current) <= breakpointOrder.indexOf(target);
};
