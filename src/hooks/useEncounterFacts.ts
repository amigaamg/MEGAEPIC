'use client';
import { useState, useEffect, useCallback } from 'react';
import { listenSubcollection, addSubcollectionItem, updateSubcollectionItem } from '@/services/encounterService';

export function useEncounterFacts<T extends { id?: string }>(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  subcollection: string,
  orgId?: string,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = listenSubcollection<T>(
      encounterId, deptSlug, unitSlug, subcollection,
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      orgId,
    );
    return unsub;
  }, [encounterId, deptSlug, unitSlug, subcollection, orgId]);

  const addItem = useCallback(async (data: Omit<T, 'id'>): Promise<string | null> => {
    try {
      return await addSubcollectionItem<T>(encounterId, deptSlug, unitSlug, subcollection, data, orgId);
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [encounterId, deptSlug, unitSlug, subcollection, orgId]);

  const updateItem = useCallback(async (itemId: string, updates: Record<string, any>) => {
    try {
      await updateSubcollectionItem(encounterId, deptSlug, unitSlug, subcollection, itemId, updates, orgId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [encounterId, deptSlug, unitSlug, subcollection, orgId]);

  return { items, loading, error, addItem, updateItem };
}
