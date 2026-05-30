'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateDDX, type EncounterFacts, type DDXResult } from '@/engine/ddx-engine';
import { addSubcollectionItem } from '@/services/encounterService';

interface UseDDXOptions {
  encounterId: string;
  deptSlug: string;
  unitSlug: string;
  orgId?: string;
  debounceMs?: number;
}

export function useDDX({
  encounterId,
  deptSlug,
  unitSlug,
  orgId,
  debounceMs = 1000,
}: UseDDXOptions) {
  const [ddxResults, setDdxResults] = useState<DDXResult[]>([]);
  const [factCount, setFactCount] = useState(0);
  const [isComputing, setIsComputing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotRef = useRef<string>('');

  const computeDDX = useCallback((facts: EncounterFacts) => {
    setIsComputing(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const results = calculateDDX(facts);
      setDdxResults(results);
      const count = facts.hpi.length + facts.exam.length + facts.investigations.length + facts.imaging.length;
      setFactCount(count);
      setIsComputing(false);

      const snapshotKey = results.map((r) => `${r.diseaseId}:${r.probability}`).join('|');
      if (snapshotKey !== lastSnapshotRef.current && results.length > 0) {
        lastSnapshotRef.current = snapshotKey;
        try {
          await addSubcollectionItem(
            encounterId, deptSlug, unitSlug, 'ddx',
            {
              timestamp: Date.now(),
              diseases: results.map((r) => ({
                diseaseId: r.diseaseId,
                diseaseName: r.diseaseName,
                probability: r.probability,
                keyFactors: r.keyFactors,
              })),
              basedOnFactCount: count,
            } as any,
            orgId,
          );
        } catch {}
      }
    }, debounceMs);
  }, [encounterId, deptSlug, unitSlug, orgId, debounceMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { ddxResults, factCount, isComputing, computeDDX };
}
