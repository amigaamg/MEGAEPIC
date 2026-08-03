// AMEXAN Navigation Provider
// Constitutional Principle: The same intelligence. The appropriate interface.
// Unifies global / org / workspace / context / action / command / suggestions layers
// behind one context. Navigation is state, never hardcoded markup.

'use client';

import React from 'react';
import { navigationEngine } from '@/lib/design/navigation-engine';
import type { NavigationItem } from '@/lib/design/navigation-engine';

export interface NavigationContextValue {
  globalItems: NavigationItem[];
  workspaceItems: NavigationItem[];
  orgItems: NavigationItem[];
  contextItems: NavigationItem[];
  actionItems: NavigationItem[];
  commandItems: NavigationItem[];
  favoriteIds: string[];
  toggleFavorite: (item: NavigationItem) => void;
  pushHistory: (item: NavigationItem) => void;
  smartBack: () => NavigationItem | undefined;
}

const NavigationContext = React.createContext<NavigationContextValue | undefined>(undefined);

export interface NavigationProviderProps {
  globalItems?: NavigationItem[];
  orgItems?: NavigationItem[];
  workspaceItems?: NavigationItem[];
  contextItems?: NavigationItem[];
  actionItems?: NavigationItem[];
  commandItems?: NavigationItem[];
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  globalItems = [],
  orgItems = [],
  workspaceItems = [],
  contextItems = [],
  actionItems = [],
  commandItems = [],
  children,
}) => {
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);

  const value = React.useMemo<NavigationContextValue>(() => {
    const all = [...globalItems, ...orgItems, ...workspaceItems, ...contextItems, ...actionItems, ...commandItems];

    const toggleFavorite = (item: NavigationItem) => {
      setFavoriteIds((prev) => {
        const next = prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id];
        return next;
      });
    };

    const pushHistory = (item: NavigationItem) => {
      navigationEngine.pushHistory({ id: item.id, label: item.label, href: item.href, timestamp: Date.now() });
    };

    const smartBack = (): NavigationItem | undefined => {
      const target = navigationEngine.smartBack();
      if (!target) return undefined;
      return all.find((i) => i.id === target.id);
    };

    return {
      globalItems,
      workspaceItems,
      orgItems,
      contextItems,
      actionItems,
      commandItems,
      favoriteIds,
      toggleFavorite,
      pushHistory,
      smartBack,
    };
  }, [globalItems, orgItems, workspaceItems, contextItems, actionItems, commandItems, favoriteIds]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigation = (): NavigationContextValue => {
  const ctx = React.useContext(NavigationContext);
  if (!ctx) {
    throw new Error('[NavigationProvider] useNavigation must be used within a NavigationProvider');
  }
  return ctx;
};

export default NavigationProvider;
