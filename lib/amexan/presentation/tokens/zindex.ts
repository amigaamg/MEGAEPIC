// AMEXAN Presentation Tokens - Z-Index
// Constitutional Principle: Every layer has a fixed order. Never arbitrary z-index values.

export const zIndexValues = {
  base: 0,
  sticky: 100,
  header: 200,
  drawer: 300,
  dropdown: 400,
  stickyFooter: 500,
  modal: 600,
  toast: 700,
  popover: 800,
  overlay: 900,
  top: 1000,
} as const;

export type ZIndexLayer = keyof typeof zIndexValues;

export const zIndexOrder: ZIndexLayer[] = [
  'base',
  'sticky',
  'header',
  'drawer',
  'dropdown',
  'stickyFooter',
  'modal',
  'toast',
  'popover',
  'overlay',
  'top',
];

export const getZIndex = (layer: ZIndexLayer | string): number => {
  return zIndexValues[layer as ZIndexLayer] ?? zIndexValues.base;
};
