import { describe, it, expect } from 'vitest';
import {
  colorConstitution,
  semanticColorNames,
  colorRoles,
  baseColorTokens,
  getBrandColor,
} from '@/lib/amexan/presentation/constitution/colors.constitution';
import {
  typographyConstitution,
  typeScale,
  getTypeStyle,
} from '@/lib/amexan/presentation/constitution/typography.constitution';
import {
  spacingConstitution,
  spacingValues,
  getSpacing,
} from '@/lib/amexan/presentation/constitution/spacing.constitution';
import {
  layoutConstitution,
  workspaceZones,
  layoutTypes,
  layoutZones,
} from '@/lib/amexan/presentation/constitution/layout.constitution';
import {
  navigationConstitution,
  navigationTypes,
  getRoleNavigation,
} from '@/lib/amexan/presentation/constitution/navigation.constitution';
import {
  accessibilityConstitution,
  accessibilityStandards,
} from '@/lib/amexan/presentation/constitution/accessibility.constitution';
import {
  responsivenessConstitution,
  viewportClasses,
  resolveResponsiveContract,
} from '@/lib/amexan/presentation/constitution/responsiveness.constitution';
import {
  animationConstitution,
  allowedAnimations,
  forbiddenAnimations,
  isAllowedAnimation,
} from '@/lib/amexan/presentation/constitution/animation.constitution';
import {
  themesConstitution,
  customizationLevels,
  isThemeInheritanceValid,
} from '@/lib/amexan/presentation/constitution/themes.constitution';
import {
  shadowValues,
  shadowSemantics,
  getShadow,
  zIndexValues,
  getZIndex,
} from '@/lib/amexan/presentation/tokens';
import {
  getViewport,
  isViewportAtLeast,
  viewportEngine,
} from '@/lib/amexan/presentation/viewport-engine';
import {
  generatePage,
  composePage,
  pageEngine,
} from '@/lib/amexan/presentation/page-engine';

describe('Presentation Constitution — Volume I Foundation', () => {
  it('all ten constitutional volumes are frozen', () => {
    expect(colorConstitution.frozen).toBe(true);
    expect(typographyConstitution.frozen).toBe(true);
    expect(spacingConstitution.frozen).toBe(true);
    expect(layoutConstitution.frozen).toBe(true);
    expect(navigationConstitution.frozen).toBe(true);
    expect(accessibilityConstitution.frozen).toBe(true);
    expect(responsivenessConstitution.frozen).toBe(true);
    expect(animationConstitution.frozen).toBe(true);
    expect(themesConstitution.frozen).toBe(true);
  });

  it('colors: defines every semantic color name', () => {
    expect(semanticColorNames).toEqual([
      'info', 'normal', 'attention', 'warning', 'critical', 'education', 'inactive',
    ]);
  });

  it('colors: brand token set covers all roles', () => {
    for (const role of Object.keys(colorRoles)) {
      expect(baseColorTokens).toHaveProperty(role);
    }
  });

  it('colors: getBrandColor resolves light and dark', () => {
    expect(getBrandColor('primary', 'light')).toBe('#2563eb');
    expect(getBrandColor('danger', 'light')).toBe('#dc2626');
    expect(getBrandColor('primary', 'dark')).toBe('#60a5fa');
  });

  it('typography: type scale has no random sizes', () => {
    expect(Object.keys(typeScale)).toEqual([
      'display', 'headingXL', 'headingL', 'headingM', 'headingS',
      'bodyLarge', 'body', 'caption', 'micro', 'numeric', 'code',
    ]);
  });

  it('typography: getTypeStyle returns token values', () => {
    const heading = getTypeStyle('headingL');
    expect(heading.fontFamily).toContain('Inter');
    expect(heading.fontSize).toBeTruthy();
  });

  it('spacing: only the canonical scale', () => {
    expect(Object.keys(spacingValues).map(Number)).toEqual([2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96]);
    expect(getSpacing(24)).toBe('24px');
  });

  it('layout: there are no pages, only workspaces', () => {
    expect(layoutConstitution.principle).toContain('Workspaces');
    expect(workspaceZones).toContain('primary_workspace');
    expect(workspaceZones).toContain('supporting_panel');
  });

  it('layout: every layout type maps to valid zones', () => {
    for (const layout of layoutTypes) {
      expect(layoutZones[layout].length).toBeGreaterThan(0);
    }
  });

  it('navigation: role navigation defined for all core roles', () => {
    expect(getRoleNavigation('doctor')).toContain('patients');
    expect(getRoleNavigation('patient')).toContain('appointments');
    expect(getRoleNavigation('administrator')).toContain('users');
    expect(navigationTypes.length).toBeGreaterThanOrEqual(8);
  });

  it('accessibility: WCAG AA minimum is the standard', () => {
    expect(accessibilityStandards.wcag).toBe('AA');
    expect(accessibilityConstitution.principle).toContain('WCAG AA');
  });

  it('responsiveness: viewport classes match spec', () => {
    expect(viewportClasses).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'ultra']);
    const contract = resolveResponsiveContract({ minWidth: 320, preferredWidth: 600 });
    expect(contract.minWidth).toBe(320);
    expect(contract.stackAt).toBe('md');
  });

  it('animation: allowed set is explicit, forbidden set enforced', () => {
    expect(allowedAnimations).toContain('fade');
    expect(allowedAnimations).toContain('skeleton');
    expect(forbiddenAnimations).toContain('bounce');
    expect(isAllowedAnimation('fade')).toBe(true);
    expect(isAllowedAnimation('bounce')).toBe(false);
  });

  it('themes: customization inherits down levels, never up', () => {
    expect(customizationLevels[0]).toBe('AMEXAN default');
    expect(customizationLevels[5]).toBe('individual');
    expect(isThemeInheritanceValid({ id: 'h1', name: 'Hospital A', base: 'amexan-base-theme', sections: {} }, ['amexan-base-theme'])).toBe(true);
    expect(isThemeInheritanceValid({ id: 'h2', name: 'Hospital B', base: 'unknown-base', sections: {} }, ['amexan-base-theme'])).toBe(false);
  });
});

describe('Presentation Tokens', () => {
  it('shadows: flat through overlay', () => {
    expect(Object.keys(shadowValues)).toEqual(['flat', 'low', 'medium', 'high', 'floating', 'overlay']);
    expect(getShadow('flat')).toBe('none');
    expect(shadowSemantics.modal).toBe('floating');
  });

  it('z-index: fixed layer order', () => {
    expect(zIndexValues.modal).toBe(600);
    expect(zIndexValues.overlay).toBe(900);
    expect(getZIndex('toast')).toBe(700);
    expect(getZIndex('unknown')).toBe(0);
  });
});

describe('Viewport Engine', () => {
  it('Components never know screen size. The engine decides.', () => {
    const mobile = getViewport(400, 800);
    expect(mobile.viewportClass).toBe('sm');
    expect(mobile.isMobile).toBe(true);

    const desktop = getViewport(1440, 900);
    expect(desktop.viewportClass).toBe('xxl');
    expect(desktop.isDesktop).toBe(true);
  });

  it('isViewportAtLeast compares classes', () => {
    expect(isViewportAtLeast('xxl', 'md')).toBe(true);
    expect(isViewportAtLeast('sm', 'lg')).toBe(false);
  });

  it('viewportEngine exposes current()', () => {
    const current = viewportEngine.current();
    expect(current.width).toBeGreaterThan(0);
    expect(current.columns).toBeGreaterThanOrEqual(1);
  });
});

describe('Page Engine', () => {
  const viewport = getViewport(1440, 900);

  it('generates a page from a constitutional request', () => {
    const blueprint = generatePage({
      id: 'home',
      title: 'Home',
      layout: 'LandingLayout',
      role: 'visitor',
      sections: [
        { id: 's1', component: 'Hero', order: 0, priority: 'high', zone: 'primary_workspace' },
        { id: 's2', component: 'Ecosystem', order: 1, priority: 'medium', zone: 'primary_workspace' },
      ],
    }, viewport);

    expect(blueprint.id).toBe('home');
    expect(blueprint.sections).toHaveLength(2);
    expect(blueprint.zones).toContain('global_header');
    expect(blueprint.columns).toBe(3);
  });

  it('composePage builds sections from a component map', () => {
    const blueprint = composePage(
      'dashboard',
      'Doctor Dashboard',
      'WorkspaceLayout',
      'doctor',
      {
        vitals: { order: 0, priority: 'critical' },
        tasks: { order: 1, priority: 'high' },
        notes: { order: 2, priority: 'medium' },
      },
      viewport,
    );

    expect(blueprint.sections.map(s => s.component)).toEqual(['vitals', 'tasks', 'notes']);
    expect(blueprint.navigation.some(n => n.type === 'workspace_navigation' && n.items.includes('patients'))).toBe(true);
  });

  it('hiddenWhen filters sections by viewport', () => {
    const mobile = getViewport(360, 640);
    const blueprint = generatePage({
      id: 'x',
      title: 'X',
      layout: 'LandingLayout',
      role: 'visitor',
      sections: [
        { id: 'a', component: 'A', order: 0, priority: 'medium', zone: 'primary_workspace', hiddenWhen: ['sm'] },
        { id: 'b', component: 'B', order: 1, priority: 'medium', zone: 'primary_workspace' },
      ],
    }, mobile);

    expect(blueprint.sections.map(s => s.component)).toEqual(['B']);
  });

  it('pageEngine exposes both generators', () => {
    expect(pageEngine.generate).toBe(generatePage);
    expect(pageEngine.compose).toBe(composePage);
  });
});
