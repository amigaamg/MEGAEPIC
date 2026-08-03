// AMEXAN Design System 4.1 - Bootstrap
// Constitutional Principle: Components are registered before they are rendered.
// Call once at app startup to register every universal component against the registry.

import { ComponentRegistry } from '@/lib/design/component-registry';
import { registerUiComponents, uiComponentIds } from '@/components/ui/registry';

export function bootstrapDesignSystem(): string[] {
  return registerUiComponents();
}

export function isDesignSystemBootstrapped(): boolean {
  const registry = ComponentRegistry.getInstance();
  return uiComponentIds.every((id) => registry.has(id));
}

export { uiComponentIds };
export default bootstrapDesignSystem;
