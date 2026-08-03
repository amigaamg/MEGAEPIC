// AMEXAN Design System 4.1 - Navigation Engine Tests
// Verifies: 7 layers, breadcrumbs, favorites, smart back, search, telemetry.

import { describe, it, expect } from 'vitest';
import { NavigationEngine, navigationLayers } from '@/lib/design/navigation-engine';

const sampleItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'patients', label: 'Patients', href: '/patients', children: [{ id: 'patient-new', label: 'New Patient', href: '/patient/new' }] },
  { id: 'workspace', label: 'Clinical Workspace', href: '/workspace', keywords: ['clinical', 'consultation'] },
];

describe('NavigationEngine layers', () => {
  it('defines exactly 7 navigation layers', () => {
    expect(navigationLayers).toEqual([
      'global',
      'organization',
      'workspace',
      'context',
      'action',
      'command',
      'suggestions',
    ]);
  });

  it('registers and retrieves configs per layer', () => {
    const engine = new NavigationEngine();
    const theme = {} as never;
    engine.register('main', { type: 'global', variant: 'desktop', items: sampleItems, theme });
    expect(engine.getConfig('main')?.type).toBe('global');
    expect(engine.getAllConfigs()).toHaveLength(1);
  });

  it('generates navigation per layer type', () => {
    const engine = new NavigationEngine();
    const global = engine.generateGlobalNavigation(sampleItems);
    expect(global[0].variant).toBe('default');
    const workspace = engine.generateWorkspaceNavigation(sampleItems);
    expect(workspace[0].variant).toBe('ghost');
    const context = engine.generateContextNavigation(sampleItems);
    expect(context[0].variant).toBe('highlighted');
    const command = engine.generateCommandNavigation(sampleItems);
    expect(command[0].shortcut).toBe('');
    const suggestions = engine.generateSuggestionNavigation(sampleItems);
    expect(suggestions[0].variant).toBe('highlighted');
  });
});

describe('NavigationEngine breadcrumbs, favorites, back, search', () => {
  it('flattens nested items', () => {
    const engine = new NavigationEngine();
    const flat = engine.flatten(sampleItems);
    expect(flat).toHaveLength(4);
  });

  it('builds breadcrumbs from config items', () => {
    const engine = new NavigationEngine();
    const theme = {} as never;
    engine.register('main', { type: 'global', variant: 'desktop', items: sampleItems, theme });
    const crumbs = engine.buildBreadcrumbs('patients', [engine.getConfig('main')!]);
    expect(crumbs[crumbs.length - 1].current).toBe(true);
  });

  it('toggles favorites', () => {
    const engine = new NavigationEngine();
    expect(engine.toggleFavorite(sampleItems[0])).toBe(true);
    expect(engine.isFavorite('home')).toBe(true);
    expect(engine.getFavorites()).toHaveLength(1);
    expect(engine.toggleFavorite(sampleItems[0])).toBe(false);
    expect(engine.getFavorites()).toHaveLength(0);
  });

  it('pushes and pops smart back history', () => {
    const engine = new NavigationEngine();
    engine.pushHistory({ id: 'a', label: 'A', href: '/a', timestamp: 1 });
    engine.pushHistory({ id: 'b', label: 'B', href: '/b', timestamp: 2 });
    expect(engine.smartBack()?.id).toBe('b');
    expect(engine.smartBack()?.id).toBe('a');
    expect(engine.getHistory()).toHaveLength(0);
  });

  it('searches across registered configs by keyword', () => {
    const engine = new NavigationEngine();
    const theme = {} as never;
    engine.register('main', { type: 'global', variant: 'desktop', items: sampleItems, theme });
    const results = engine.search('clinical');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('workspace');
  });

  it('records telemetry', () => {
    const engine = new NavigationEngine();
    engine.emitTelemetry({ type: 'command', itemId: 'workspace', timestamp: 1 });
    expect(engine.getTelemetry()).toHaveLength(1);
  });
});
