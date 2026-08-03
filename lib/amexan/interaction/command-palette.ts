// AMEXAN Interaction Engine - Command Palette
// Constitutional Principle: The command palette is the universal surface.
// Any action is reachable by keyboard. The engine resolves commands from the registry.

import { defaultCommands } from '../presentation/constitution/navigation.constitution';
import { shortcutConventions } from './constitution';
import type { DeviceInfo } from '../presentation/types';

export interface Command {
  id: string;
  title: string;
  shortcut?: string;
  keywords: string[];
  context: string;
  permission?: string;
  action: string;
  destructive?: boolean;
}

export interface CommandRegistration {
  command: Command;
  matches: (query: string, permissions: string[]) => boolean;
}

const COMMANDS: Command[] = [
  { id: 'patient_search', title: 'Search Patient', shortcut: defaultCommands.patientSearch, keywords: ['patient', 'search', 'find', 'pid'], context: 'global', permission: 'read:patient', action: 'open:patient-search' },
  { id: 'new_order', title: 'New Order', shortcut: defaultCommands.orders, keywords: ['order', 'prescribe', 'medication'], context: 'clinical', permission: 'write:order', action: 'open:order' },
  { id: 'documentation', title: 'Documentation', shortcut: defaultCommands.documentation, keywords: ['note', 'document', 'chart'], context: 'clinical', permission: 'write:encounter', action: 'open:documentation' },
  { id: 'new_encounter', title: 'New Encounter', shortcut: defaultCommands.newEncounter, keywords: ['encounter', 'visit', 'consult'], context: 'clinical', permission: 'write:encounter', action: 'open:encounter' },
  { id: 'command_palette', title: 'Command Palette', shortcut: shortcutConventions.commandPalette, keywords: ['command', 'palette', 'shortcut'], context: 'global', action: 'toggle:command-palette' },
  { id: 'search', title: 'Search', shortcut: shortcutConventions.search, keywords: ['search', 'global'], context: 'global', action: 'open:search' },
  { id: 'save', title: 'Save', shortcut: shortcutConventions.save, keywords: ['save', 'store'], context: 'document', action: 'save:current' },
  { id: 'undo', title: 'Undo', shortcut: shortcutConventions.undo, keywords: ['undo', 'revert'], context: 'global', action: 'undo:last' },
  { id: 'redo', title: 'Redo', shortcut: shortcutConventions.redo, keywords: ['redo', 'repeat'], context: 'global', action: 'redo:last' },
  { id: 'quick_switch', title: 'Quick Switch Workspace', keywords: ['workspace', 'switch', 'morph'], context: 'global', action: 'open:quick-switch' },
  { id: 'notifications', title: 'Notifications', keywords: ['notification', 'alert', 'bell'], context: 'global', action: 'open:notifications' },
  { id: 'profile', title: 'Profile & Settings', keywords: ['profile', 'settings', 'account'], context: 'global', action: 'open:profile' },
];

export function registerCommand(command: Command): void {
  COMMANDS.push(command);
}

export function searchCommands(query: string, permissions: string[], context?: string): Command[] {
  const q = query.trim().toLowerCase();
  return COMMANDS.filter((cmd) => {
    if (context && cmd.context !== 'global' && cmd.context !== context) return false;
    if (cmd.permission && !permissions.includes(cmd.permission)) return false;
    if (!q) return true;
    return cmd.title.toLowerCase().includes(q) || cmd.keywords.some((k) => k.includes(q));
  });
}

export function resolveShortcut(keyboardEvent: { key: string; ctrlKey: boolean; shiftKey: boolean }, device: DeviceInfo): Command | null {
  const isMac = false;
  const mod = keyboardEvent.ctrlKey || (isMac && keyboardEvent.key === 'Meta');
  if (!mod && !(device.hasKeyboard && keyboardEvent.key === 'Escape')) return null;

  if (keyboardEvent.key.toLowerCase() === 'k' && keyboardEvent.ctrlKey) return COMMANDS[4]!; // command palette
  if (keyboardEvent.key.toLowerCase() === 'p' && keyboardEvent.ctrlKey) return COMMANDS[5]!; // search
  if (keyboardEvent.key.toLowerCase() === 'z' && keyboardEvent.ctrlKey && !keyboardEvent.shiftKey) return COMMANDS[7]!; // undo
  if (keyboardEvent.key.toLowerCase() === 'z' && keyboardEvent.ctrlKey && keyboardEvent.shiftKey) return COMMANDS[8]!; // redo
  if (keyboardEvent.key.toLowerCase() === 'o' && keyboardEvent.ctrlKey) return COMMANDS[1]!; // orders
  if (keyboardEvent.key.toLowerCase() === 'd' && keyboardEvent.ctrlKey) return COMMANDS[2]!; // documentation
  return null;
}

export const commandPalette = {
  register: registerCommand,
  search: searchCommands,
  shortcut: resolveShortcut,
  list: () => COMMANDS,
};

export type CommandPalette = typeof commandPalette;
