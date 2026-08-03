// AMEXAN Universal Component System - Registry
// Constitutional Principle: Every component is registered, versioned, and contract-checked.
// Spec: Universal contract = ID / Variant / Size / State / Accessibility / Animation / Theme / Telemetry / Version.
// Spec: Universal states = default / hover / focus / pressed / disabled / loading / error / success / offline.
// Spec: Universal sizes = XS / SM / MD / LG / XL.

export const universalStates = [
  'default',
  'hover',
  'focus',
  'pressed',
  'disabled',
  'loading',
  'error',
  'success',
  'offline',
] as const;

export type UniversalState = (typeof universalStates)[number];

export const universalSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export type UniversalSize = (typeof universalSizes)[number];

export interface ComponentVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface AccessibilityContract {
  role?: string;
  label: boolean;
  keyboardOperable: boolean;
  focusVisible: boolean;
  ariaLive?: 'polite' | 'assertive' | 'off';
}

export interface TelemetryContract {
  enabled: boolean;
  events: string[];
}

export interface ComponentContract {
  id: string;
  variants: readonly string[];
  sizes: readonly UniversalSize[];
  states: readonly UniversalState[];
  accessibility: AccessibilityContract;
  animation: boolean;
  themeable: boolean;
  telemetry: TelemetryContract;
  version: ComponentVersion;
  minHeight?: number;
  maxLines?: number;
}

export interface RegisteredComponent {
  contract: ComponentContract;
  source?: string;
  description?: string;
  registeredAt: string;
}

export interface ComponentRegistryOptions {
  telemetry?: (componentId: string, event: string, payload?: Record<string, unknown>) => void;
}

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, RegisteredComponent> = new Map();
  private options: ComponentRegistryOptions;

  constructor(options: ComponentRegistryOptions = {}) {
    if (ComponentRegistry.instance) {
      return ComponentRegistry.instance;
    }
    this.options = options;
    ComponentRegistry.instance = this;
  }

  public register = (contract: ComponentContract, extra?: Partial<RegisteredComponent>): void => {
    this.assertContract(contract);
    this.components.set(contract.id, {
      contract,
      source: extra?.source,
      description: extra?.description,
      registeredAt: extra?.registeredAt || new Date().toISOString(),
    });
    this.emit(contract.id, 'registered');
  };

  public get = (id: string): RegisteredComponent | undefined => {
    return this.components.get(id);
  };

  public getAll = (): RegisteredComponent[] => {
    return Array.from(this.components.values());
  };

  public has = (id: string): boolean => {
    return this.components.has(id);
  };

  public assertContract = (contract: ComponentContract): void => {
    if (!contract.id || contract.id.length === 0) {
      throw new Error('[ComponentRegistry] Component ID is required');
    }
    if (!contract.variants || contract.variants.length === 0) {
      throw new Error(`[ComponentRegistry] ${contract.id}: at least one variant is required`);
    }
    if (!contract.states || contract.states.length === 0) {
      throw new Error(`[ComponentRegistry] ${contract.id}: at least one state is required`);
    }
    if (!contract.accessibility?.label) {
      throw new Error(`[ComponentRegistry] ${contract.id}: accessibility.label must be true`);
    }
    if (!contract.accessibility?.keyboardOperable) {
      throw new Error(`[ComponentRegistry] ${contract.id}: accessibility.keyboardOperable must be true`);
    }
    if (!contract.version) {
      throw new Error(`[ComponentRegistry] ${contract.id}: version is required`);
    }
    for (const state of contract.states) {
      if (!universalStates.includes(state)) {
        throw new Error(`[ComponentRegistry] ${contract.id}: unknown state "${state}"`);
      }
    }
  };

  public upgrade = (id: string, version: ComponentVersion): boolean => {
    const existing = this.components.get(id);
    if (!existing) return false;
    existing.contract = { ...existing.contract, version };
    this.emit(id, 'upgraded');
    return true;
  };

  public emit = (componentId: string, event: string, payload?: Record<string, unknown>): void => {
    this.options.telemetry?.(componentId, event, payload);
  };

  public static getInstance(options?: ComponentRegistryOptions): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry(options);
    }
    return ComponentRegistry.instance;
  }

  public static reset(): void {
    ComponentRegistry.instance = undefined as unknown as ComponentRegistry;
  }
}

export const componentRegistry = ComponentRegistry.getInstance();
export default componentRegistry;
