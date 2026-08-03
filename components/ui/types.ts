// AMEXAN Universal Component Props
// Constitutional Principle: Every component shares one universal prop contract.
// Universal: id / theme / variant / size / loading / disabled / className / testId / telemetry / permissions.

import type { UniversalSize } from '@/lib/design/component-registry';

export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral';

export interface UniversalComponentProps {
  id?: string;
  theme?: string;
  variant?: ComponentVariant;
  size?: UniversalSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  testId?: string;
  telemetry?: (event: string, payload?: Record<string, unknown>) => void;
  permissions?: string[];
}

export const componentDataAttr = (props: UniversalComponentProps, componentId: string): Record<string, unknown> => ({
  'data-component': componentId,
  'data-testid': props.testId || (props.id ? `${componentId}-${props.id}` : undefined),
  'data-loading': props.loading || undefined,
  'data-disabled': props.disabled || undefined,
});

export const emitTelemetry = (props: UniversalComponentProps, componentId: string, event: string, payload?: Record<string, unknown>): void => {
  props.telemetry?.(`${componentId}:${event}`, payload);
};
