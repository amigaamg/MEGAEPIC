// AMEXAN Breadcrumb Navigation Component
// Constitutional Principle: Breadcrumbs are context, not history.
// Consumes the NavigationEngine's breadcrumb builder.

'use client';

import React from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import type { BreadcrumbItem } from '@/components/ui/breadcrumb';
import { navigationEngine } from '@/lib/design/navigation-engine';
import type { NavigationConfig } from '@/lib/design/navigation-engine';

export interface BreadcrumbNavigationProps {
  current: string;
  configs?: NavigationConfig[];
  homeLabel?: string;
}

export const BreadcrumbNavigation = ({ current, configs = [], homeLabel = 'Home' }: BreadcrumbNavigationProps) => {
  const crumbs = React.useMemo(() => {
    if (configs.length > 0) {
      return navigationEngine.buildBreadcrumbs(current, configs);
    }
    return [{ id: 'home', label: homeLabel, href: '/' }, { id: current, label: current, current: true }];
  }, [current, configs, homeLabel]);

  const items: BreadcrumbItem[] = crumbs.map((c) => ({ label: c.label, href: c.href }));

  return <Breadcrumb items={items} data-testid="breadcrumb-navigation" />;
};

export default BreadcrumbNavigation;
