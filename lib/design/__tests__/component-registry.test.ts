// AMEXAN Design System 4.1 - Component Registry Tests
// Verifies: universal contract, 9 universal states, 5 universal sizes, registry behavior.

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry, universalStates, universalSizes } from '@/lib/design/component-registry';
import type { ComponentContract } from '@/lib/design/component-registry';

const validContract: ComponentContract = {
  id: 'button',
  variants: ['primary', 'secondary', 'ghost'],
  sizes: ['sm', 'md', 'lg'],
  states: ['default', 'hover', 'focus', 'pressed', 'disabled', 'loading'],
  accessibility: { label: true, keyboardOperable: true, focusVisible: true },
  animation: true,
  themeable: true,
  telemetry: { enabled: true, events: ['click'] },
  version: { major: 1, minor: 0, patch: 0 },
};

describe('Universal states & sizes', () => {
  it('defines the 9 universal states', () => {
    expect(universalStates).toEqual([
      'default',
      'hover',
      'focus',
      'pressed',
      'disabled',
      'loading',
      'error',
      'success',
      'offline',
    ]);
  });

  it('defines the 5 universal sizes', () => {
    expect(universalSizes).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  });
});

describe('ComponentRegistry', () => {
  beforeEach(() => {
    ComponentRegistry.reset();
  });

  it('registers and retrieves components', () => {
    const reg = new ComponentRegistry();
    reg.register(validContract);
    expect(reg.has('button')).toBe(true);
    expect(reg.get('button')?.contract.id).toBe('button');
  });

  it('rejects contracts without an ID', () => {
    const reg = new ComponentRegistry();
    expect(() => reg.register({ ...validContract, id: '' })).toThrow(/ID is required/);
  });

  it('rejects contracts missing accessibility.label', () => {
    const reg = new ComponentRegistry();
    expect(() =>
      reg.register({
        ...validContract,
        accessibility: { label: false, keyboardOperable: true, focusVisible: true },
      }),
    ).toThrow(/accessibility\.label/);
  });

  it('rejects contracts with unknown states', () => {
    const reg = new ComponentRegistry();
    expect(() => reg.register({ ...validContract, states: ['mystery'] as never })).toThrow(/unknown state/);
  });

  it('rejects contracts without variants', () => {
    const reg = new ComponentRegistry();
    expect(() => reg.register({ ...validContract, variants: [] })).toThrow(/at least one variant/);
  });

  it('emits telemetry on register and upgrade', () => {
    const events: string[] = [];
    const reg = new ComponentRegistry({ telemetry: (id, evt) => events.push(`${id}:${evt}`) });
    reg.register(validContract);
    reg.upgrade('button', { major: 1, minor: 1, patch: 0 });
    expect(events).toContain('button:registered');
    expect(events).toContain('button:upgraded');
  });

  it('returns all registered components', () => {
    const reg = new ComponentRegistry();
    reg.register(validContract);
    reg.register({ ...validContract, id: 'card' });
    expect(reg.getAll()).toHaveLength(2);
  });
});
