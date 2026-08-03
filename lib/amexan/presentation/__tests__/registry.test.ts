import { describe, it, expect } from 'vitest';
import {
  widgetRegistry,
  getWidget,
  findWidgets,
  listWidgetsByPriority,
  widgetWorksIn,
} from '@/lib/amexan/presentation/registry/widget-registry';
import {
  layoutRegistry,
  getLayout,
  listLayouts,
  getLayoutForWorkspace,
} from '@/lib/amexan/presentation/registry/layout-registry';
import {
  themeRegistry,
  getTheme,
  getThemeTokens,
  themeIsWhiteLabelSafe,
  generateThemeCssVariables,
} from '@/lib/amexan/presentation/registry/theme-registry';

describe('Widget Registry', () => {
  it('registers all 15 constitutional widgets', () => {
    expect(widgetRegistry.count()).toBe(15);
  });

  it('every widget declares exactly one purpose', () => {
    const widgets = findWidgets();
    for (const w of widgets) {
      expect(w.purpose.trim().length).toBeGreaterThan(0);
    }
  });

  it('workspace membership gates widgets', () => {
    expect(widgetWorksIn('patient_card', 'ward_round')).toBe(true);
    expect(widgetWorksIn('billing_summary', 'icu')).toBe(false);
    expect(widgetWorksIn('clinical_alert', 'any_workspace')).toBe(true); // '*' = all
  });

  it('partitions by priority without gaps', () => {
    const byPriority = listWidgetsByPriority();
    const total = ['critical', 'high', 'medium', 'low'].reduce((n, p) => n + byPriority[p as 'critical'].length, 0);
    expect(total).toBe(widgetRegistry.count());
  });
});

describe('Layout Registry', () => {
  it('defines all 15 layout kinds', () => {
    expect(listLayouts().length).toBe(15);
  });

  it('every layout defines columns for every viewport class', () => {
    const vcs = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'ultra'] as const;
    for (const layout of listLayouts()) {
      for (const vc of vcs) {
        expect(layout.defaultColumns[vc]).toBeDefined();
      }
    }
  });

  it('maps workspaces to constitutional layouts', () => {
    expect(getLayoutForWorkspace('ward_round')).toBe('workspace');
    expect(getLayoutForWorkspace('admission')).toBe('wizard');
    expect(getLayoutForWorkspace('executive')).toBe('dashboard');
  });
});

describe('Theme Registry', () => {
  it('provides all 5 themes', () => {
    expect(themeRegistry.list().length).toBe(5);
  });

  it('every theme has light and dark token sets', () => {
    for (const id of ['amexan-default', 'hospital', 'university', 'research', 'government'] as const) {
      expect(getTheme(id).light.colors.primary).toBeDefined();
      expect(getTheme(id).dark.colors.primary).toBeDefined();
    }
  });

  it('white-label guarantee: themes never change radius, spacing, or motion', () => {
    for (const id of ['hospital', 'university', 'research', 'government'] as const) {
      expect(themeIsWhiteLabelSafe(id)).toBe(true);
    }
  });

  it('generates CSS variables from tokens', () => {
    const vars = generateThemeCssVariables('hospital', 'light');
    expect(vars['--brand-primary']).toBe(getThemeTokens('hospital', 'light').colors.primary);
    expect(vars['--radius-card']).toBeDefined();
  });
});
