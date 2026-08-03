// AMEXAN Presentation Engine - Widget Engine
// Constitutional Principle: The UI never reasons. The Widget Engine decides what renders.
// Widgets declare purpose, inputs, outputs, permissions, states, responsive behavior.

import type { VisibilityState } from '../types';
import type { ComponentState } from '../constitution/presentation.states';
import { getStateContract, canTransition } from '../constitution/presentation.states';
import { getWidget, findWidgets, widgetWorksIn } from '../registry/widget-registry';
import type { WidgetDefinition, WidgetCategory } from '../registry/widget-registry';
import { resolveVisibility } from '../visibility-constitution';
import type { DeviceInfo } from '../types';

export interface WidgetRuntime {
  widget: WidgetDefinition;
  state: ComponentState;
  visibility: VisibilityState;
  data: unknown;
  actions: string[];
  version: string;
}

export interface WidgetRenderRequest {
  widgetId: string;
  device: DeviceInfo;
  role: string;
  workspaceId?: string;
  data?: unknown;
  initialState?: ComponentState;
  permissions?: string[];
}

export function renderWidget(request: WidgetRenderRequest): WidgetRuntime | null {
  const widget = getWidget(request.widgetId);
  if (!widget) return null;

  if (request.workspaceId && !widgetWorksIn(widget.id, request.workspaceId)) return null;

  if (request.permissions && widget.permissions) {
    const hasPermission = widget.permissions.some((p) => request.permissions!.includes(p));
    if (widget.permissions.length > 0 && !hasPermission) return null;
  }

  const state = request.initialState ?? 'ready';
  const visibility = resolveVisibility({
    priority: widget.priority,
    device: request.device,
    role: request.role,
    hasData: request.data !== null && request.data !== undefined,
    isPinned: false,
    isReadonly: false,
    isDisabled: false,
    isLoaded: true,
    conditionMet: true,
  }).state;

  return {
    widget,
    state,
    visibility,
    data: request.data,
    actions: widget.outputs,
    version: widget.version,
  };
}

export function renderWidgetsForWorkspace(
  workspaceId: string,
  device: DeviceInfo,
  role: string
): WidgetRuntime[] {
  return findWidgets()
    .filter((w) => widgetWorksIn(w.id, workspaceId))
    .map((widget) => renderWidget({ widgetId: widget.id, device, role, workspaceId }))
    .filter((r): r is WidgetRuntime => r !== null);
}

export function transitionWidgetState(runtime: WidgetRuntime, to: ComponentState): WidgetRuntime {
  if (!canTransition(runtime.state, to)) return runtime;
  return { ...runtime, state: to };
}

export function assertStateContract(runtime: WidgetRuntime): boolean {
  const contract = getStateContract(runtime.state);
  if (contract.requiresAttention && runtime.visibility === 'hidden') return false;
  return true;
}

export function isWidgetOfflineSafe(widgetId: string): boolean {
  const widget = getWidget(widgetId);
  if (!widget) return false;
  return widget.states.includes('offline');
}

export const widgetEngine = {
  render: renderWidget,
  renderForWorkspace: renderWidgetsForWorkspace,
  transition: transitionWidgetState,
  assertState: assertStateContract,
  offlineSafe: isWidgetOfflineSafe,
  byCategory: (category?: WidgetCategory) => findWidgets(category),
};

export type WidgetEngine = typeof widgetEngine;
