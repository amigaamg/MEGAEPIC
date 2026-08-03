// AMEXAN Presentation Constitution - Animation
// Version 1.0 (Frozen)
// Constitutional Principle: Motion exists only to explain. Never decorate.
// Allowed: Fade, Slide, Expand, Collapse, Grow, Progress, Skeleton, Highlight, Transition.
// Forbidden: Random bouncing, rotations, distracting motion, unnecessary parallax.

import { motionDurationsSemantics, motionMaxDurations, forbiddenMotions, isForbiddenMotion } from '../tokens';

export const animationConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Motion exists only to explain. Never decorate.',
};

export const allowedAnimations = [
  'fade',
  'slide',
  'expand',
  'collapse',
  'grow',
  'progress',
  'skeleton',
  'highlight',
  'transition',
  'pulse_alerts_only',
  'floating_notification',
  'drawer',
  'modal',
  'loading',
] as const;

export type AllowedAnimation = (typeof allowedAnimations)[number];

export const forbiddenAnimations = forbiddenMotions;

export const animationDurations = {
  micro: motionDurationsSemantics.micro,
  fast: motionDurationsSemantics.fast,
  normal: motionDurationsSemantics.normal,
  slow: motionDurationsSemantics.slow,
  slowest: motionDurationsSemantics.slowest,
} as const;

export const animationMaxDurations = motionMaxDurations;

export const animationEasing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

export const motionJustifications: Record<AllowedAnimation, string> = {
  fade: 'Emphasize appearance/disappearance of states',
  slide: 'Directional movement of panels and drawers',
  expand: 'Reveal additional detail in place',
  collapse: 'Conceal detail to reduce cognitive load',
  grow: 'Scale emphasis for primary actions',
  progress: 'Communicate task progress and loading',
  skeleton: 'Loading state placeholder',
  highlight: 'Draw attention to a change (e.g. new lab result)',
  transition: 'Smooth state/layout transitions',
  pulse_alerts_only: 'Critical alerts only',
  floating_notification: 'Toast/notification presentation',
  drawer: 'Panel slide-in navigation',
  modal: 'Modal focus acquisition',
  loading: 'Indeterminate progress',
};

export function isAllowedAnimation(animation: string): boolean {
  return (allowedAnimations as readonly string[]).includes(animation) && !isForbiddenMotion(animation);
}

export function getAnimationDuration(interaction: keyof typeof motionMaxDurations): number {
  return motionMaxDurations[interaction];
}
