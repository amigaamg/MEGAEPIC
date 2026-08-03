// AMEXAN Presentation Constitution - Constraints
// Version 1.0 (Frozen)
// Constitutional Principle: Constraints protect consistency. Nothing exceeds them.

export interface ConstraintSpec {
  key: string;
  max?: number;
  min?: number;
  allowed?: readonly (string | number)[];
  forbidden?: readonly string[];
  description: string;
}

export const presentationConstraints: ConstraintSpec[] = [
  {
    key: 'touch_target_min',
    min: 48,
    description: 'Every clickable target is at least 48x48px. Critical actions 64px.',
  },
  {
    key: 'touch_target_critical',
    min: 64,
    description: 'Critical actions (medication, discharge) use 64px minimum.',
  },
  {
    key: 'motion_duration_ms',
    allowed: [100, 150, 200, 300, 500] as readonly number[],
    description: 'Animation durations are exactly 100/150/200/300/500ms. Nothing else.',
  },
  {
    key: 'color_roles',
    allowed: ['info', 'normal', 'attention', 'warning', 'critical', 'education', 'inactive'] as const,
    description: 'Only constitutional semantic colors may appear.',
  },
  {
    key: 'forbidden_motion',
    forbidden: ['bounce', 'spin', 'shake', 'flash', 'confetti'] as const,
    description: 'Distracting clinical motions are forbidden.',
  },
  {
    key: 'max_card_nesting',
    max: 2,
    description: 'Never card inside card inside card. Max depth is 2.',
  },
  {
    key: 'max_fabs_visible',
    max: 5,
    description: 'Floating action buttons never exceed 5 visible.',
  },
  {
    key: 'widget_purpose',
    min: 1,
    description: 'Every widget declares exactly one purpose.',
  },
  {
    key: 'spacing_scale',
    allowed: [2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128] as readonly number[],
    description: 'Only the constitutional spacing scale may be used.',
  },
  {
    key: 'icon_size',
    allowed: [16, 20, 24, 32] as const,
    description: 'Icon sizes come from one family: 16/20/24/32.',
  },
  {
    key: 'grid_columns',
    allowed: [4, 8, 12, 16] as const,
    description: 'Grids are 4 (phone), 8 (tablet), 12 (desktop), 16 (large).',
  },
];

export function getConstraint(key: string): ConstraintSpec | undefined {
  return presentationConstraints.find((c) => c.key === key);
}

export function violatesConstraints(
  key: string,
  value: unknown
): { violated: boolean; reason?: string } {
  const constraint = getConstraint(key);
  if (!constraint) return { violated: false };

  if (constraint.allowed && Array.isArray(constraint.allowed)) {
    const allowed = constraint.allowed;
    if (Array.isArray(value)) {
      const bad = (value as unknown[]).filter((v) => !allowed.includes(v as never));
      if (bad.length > 0) {
        return { violated: true, reason: `'${bad.join(', ')}' not in allowed set for ${key}` };
      }
    } else if (!allowed.includes(value as never)) {
      return { violated: true, reason: `'${String(value)}' not in allowed set for ${key}` };
    }
  }

  if (constraint.forbidden && constraint.forbidden.includes(value as never)) {
    return { violated: true, reason: `'${String(value)}' is forbidden for ${key}` };
  }

  if (typeof value === 'number') {
    if (constraint.min !== undefined && value < constraint.min) {
      return { violated: true, reason: `${value} is below min ${constraint.min} for ${key}` };
    }
    if (constraint.max !== undefined && value > constraint.max) {
      return { violated: true, reason: `${value} is above max ${constraint.max} for ${key}` };
    }
  }

  return { violated: false };
}

export function validateAllConstraints(violations: Record<string, unknown>): string[] {
  return Object.entries(violations)
    .map(([key, value]) => {
      const result = violatesConstraints(key, value);
      return result.violated ? result.reason : null;
    })
    .filter((r): r is string => r !== null);
}
