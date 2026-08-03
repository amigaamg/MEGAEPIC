// AMEXAN Design System 4.1 - UI Registry Integration Tests
// Verifies: every universal component registers, contracts are valid, layout kinds and
// workspace regions render through the LayoutEngine.

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry, universalStates, universalSizes } from '@/lib/design/component-registry';
import { registerUiComponents, uiComponentIds } from '@/components/ui/registry';
import { getTheme } from '@/lib/design/theme-engine';
import { createLayoutConfig, layoutKinds, workspaceRegions } from '@/lib/design/layout-engine';
import { motionLevels } from '@/lib/design/motion-engine';
import { accessibilityProfiles } from '@/lib/design/accessibility-engine';

describe('Universal Component Library registry (Sprint 1)', () => {
  beforeEach(() => {
    ComponentRegistry.reset();
  });

  it('registers every UI component', () => {
    const ids = registerUiComponents();
    expect(ids.length).toBeGreaterThanOrEqual(25);
    expect(uiComponentIds).toEqual(ids);
    for (const id of ids) {
      expect(ComponentRegistry.getInstance().has(id)).toBe(true);
    }
  });

  it('all component contracts use only universal states', () => {
    ComponentRegistry.reset();
    registerUiComponents();
    for (const comp of ComponentRegistry.getInstance().getAll()) {
      for (const state of comp.contract.states) {
        expect(universalStates).toContain(state);
      }
    }
  });

  it('all component contracts use only universal sizes', () => {
    ComponentRegistry.reset();
    registerUiComponents();
    for (const comp of ComponentRegistry.getInstance().getAll()) {
      for (const size of comp.contract.sizes) {
        expect(universalSizes).toContain(size);
      }
    }
  });

  it('every component declares an accessibility label', () => {
    ComponentRegistry.reset();
    registerUiComponents();
    for (const comp of ComponentRegistry.getInstance().getAll()) {
      expect(comp.contract.accessibility.label).toBe(true);
    }
  });

  it('every component is versioned', () => {
    ComponentRegistry.reset();
    registerUiComponents();
    for (const comp of ComponentRegistry.getInstance().getAll()) {
      expect(comp.contract.version.major).toBeGreaterThanOrEqual(1);
    }
  });

  it('required spec components are present', () => {
    ComponentRegistry.reset();
    registerUiComponents();
    const required = ['button', 'input', 'select', 'textarea', 'checkbox', 'radio', 'switch', 'badge', 'avatar', 'card', 'modal', 'drawer', 'tabs', 'accordion', 'tooltip', 'table', 'datagrid', 'timeline', 'calendar', 'breadcrumb', 'pagination', 'navbar', 'sidebar', 'command', 'notification', 'loader', 'skeleton', 'empty-state', 'error-state', 'form'];
    for (const id of required) {
      expect(ComponentRegistry.getInstance().has(id), `${id} should be registered`).toBe(true);
    }
  });
});

describe('Universal Layouts (7 kinds)', () => {
  const theme = getTheme('clinical');

  it('defines all 7 layout kinds', () => {
    expect(layoutKinds).toEqual(['shell', 'public', 'auth', 'dashboard', 'workspace', 'fullscreen', 'operations']);
  });

  it('workspace layout enables context bar and assistant panel', () => {
    const config = createLayoutConfig(theme, 'workspace');
    expect(config.regions.contextBar?.visible).toBe(true);
    expect(config.regions.assistantPanel?.visible).toBe(true);
    expect(config.regions.assistantPanel?.width).toBe(320);
  });

  it('all 6 workspace regions exist in order', () => {
    expect(workspaceRegions).toEqual(['header', 'contextBar', 'navigation', 'workspace', 'assistantPanel', 'statusBar']);
  });

  it('auth layout is centered, narrow, no navigation', () => {
    const config = createLayoutConfig(theme, 'auth');
    expect(config.content.alignment).toBe('center');
    expect(config.content.maxWidth).toBe('480px');
    expect(config.regions.navigation?.visible).toBe(false);
  });

  it('motion levels never exceed the 400ms hard limit', () => {
    for (const key of Object.keys(motionLevels)) {
      const spec = motionLevels[Number(key) as keyof typeof motionLevels];
      expect(Number(spec.duration)).toBeLessThanOrEqual(400);
    }
  });

  it('accessibility defines all 7 profiles', () => {
    expect(accessibilityProfiles).toHaveLength(7);
  });
});
