'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePresentationStore, PresentationStore } from './store';

const PresentationContext = createContext<PresentationStore | null>(null);

export function PresentationProvider({ children, actorId, patientId, facilityName }: {
  children: ReactNode;
  actorId: string;
  patientId: string;
  facilityName?: string;
}) {
  const store = usePresentationStore();

  useEffect(() => {
    store.initializeFromRequest({
      actorId: actorId as any,
      patientId,
      facility: { name: facilityName || 'Healthcare Facility' },
    });
  }, [actorId, patientId, facilityName]);

  return (
    <PresentationContext.Provider value={store}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation(): PresentationStore {
  const ctx = useContext(PresentationContext);
  if (!ctx) throw new Error('usePresentation must be used within PresentationProvider');
  return ctx;
}