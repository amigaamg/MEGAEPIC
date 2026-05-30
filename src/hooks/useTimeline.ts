'use client';
import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface TimelineEntry {
  timestamp: number;
  event: string;
  details: string;
  userId: string;
  userName: string;
  phase?: string;
}

export function useTimeline(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  orgId?: string,
) {
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, `organizations/${orgId || 'telemed-a98cf'}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}`);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setEvents((data.timeline || []).sort((a: TimelineEntry, b: TimelineEntry) => a.timestamp - b.timestamp));
      }
      setLoading(false);
    });
    return unsub;
  }, [encounterId, deptSlug, unitSlug, orgId]);

  return { events, loading };
}
