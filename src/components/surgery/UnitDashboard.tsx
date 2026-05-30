'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listenActiveEncounters } from '@/services/encounterService';
import { getDiseasesByUnit, getDiseaseCountByUnit } from '@/engine/knowledge-graph';
import type { DiseaseNode } from '@/engine/knowledge-graph/types';
import { UnitActionButtons } from './UnitActionButtons';
import { ActiveCaseCard, type ActiveCase } from './ActiveCaseCard';
import { DiseaseLibraryCard } from './DiseaseLibraryCard';

interface UnitDashboardProps {
  hospitalId: string;
  departmentSlug: string;
  unitSlug: string;
}

export function UnitDashboard({ hospitalId, departmentSlug, unitSlug }: UnitDashboardProps) {
  const router = useRouter();
  const [activeCases, setActiveCases] = useState<ActiveCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseNode | null>(null);
  const [showLibrary, setShowLibrary] = useState(true);

  const diseases = getDiseasesByUnit(unitSlug);
  const diseaseCount = diseases.length;

  useEffect(() => {
    const unsub = listenActiveEncounters(
      departmentSlug.toUpperCase(), unitSlug,
      (encounters) => {
        setActiveCases(encounters as ActiveCase[]);
        setLoading(false);
      },
      () => setLoading(false),
      undefined,
    );
    return unsub;
  }, [departmentSlug, unitSlug]);

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'new-encounter':
        router.push(`/clinical-workspace/${hospitalId}/departments/${departmentSlug}/${unitSlug}/encounter/new`);
        break;
      case 'admit':
        router.push(`/clinical-workspace/${hospitalId}/departments/${departmentSlug}/${unitSlug}/encounter/new?type=inpatient`);
        break;
      case 'operative-note':
        if (activeCases.length > 0) {
          router.push(`/clinical-workspace/${hospitalId}/departments/${departmentSlug}/${unitSlug}/encounter/${activeCases[0].id}?phase=operative_note`);
        }
        break;
      case 'trauma':
        router.push(`/clinical-workspace/${hospitalId}/departments/${departmentSlug}/${unitSlug}/encounter/new?type=emergency&priority=high`);
        break;
      case 'mdt':
        router.push(`/clinical-workspace/${hospitalId}/departments/${departmentSlug}/${unitSlug}/mdt`);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
        <UnitActionButtons onAction={handleAction} unitSlug={unitSlug} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Active Cases ({activeCases.length})
          </h2>
          {loading ? (
            <div className="text-sm text-gray-400 py-8 text-center">Loading active cases...</div>
          ) : activeCases.length === 0 ? (
            <div className="text-sm text-gray-400 py-8 text-center border rounded-lg">
              <p className="text-lg mb-1">No active cases</p>
              <p>Create a new encounter to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeCases.map((c) => (
                <ActiveCaseCard
                  key={c.id}
                  caseData={c}
                  onClick={() => router.push(
                    `/clinical-workspace/${hospitalId}/departments/${departmentSlug}/${unitSlug}/encounter/${c.id}`
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Disease Library
            </h2>
            <span className="text-xs text-gray-400">{diseaseCount} diseases</span>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {diseases.length === 0 ? (
              <div className="text-sm text-gray-400 py-4 text-center border rounded-lg">
                <p>No diseases loaded for this unit</p>
              </div>
            ) : (
              diseases.map((d) => (
                <DiseaseLibraryCard
                  key={d.id}
                  disease={d}
                  onClick={setSelectedDisease}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {selectedDisease && (
        <DiseaseDetailModal
          disease={selectedDisease}
          onClose={() => setSelectedDisease(null)}
          onStartEncounter={() => {
            router.push(`/clinical-workspace/${hospitalId}/departments/${departmentSlug}/${unitSlug}/encounter/new?disease=${selectedDisease.id}`);
          }}
        />
      )}
    </div>
  );
}

function DiseaseDetailModal({ disease, onClose, onStartEncounter }: {
  disease: DiseaseNode;
  onClose: () => void;
  onStartEncounter: () => void;
}) {
  const inv = (disease as any).investigations;
  const mgmt = disease.management;
  const subtypes = disease.subtypes;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{disease.name}</h3>
              <p className="text-sm text-gray-400 font-mono">{disease.id}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>

          {disease.emergencyPriority === 'high' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">HIGH PRIORITY — Must not miss</div>
          )}
          {disease.mustNotMiss && disease.emergencyPriority !== 'high' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 font-medium">Must Not Miss Diagnosis</div>
          )}

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Presenting Complaints</h4>
            <div className="flex flex-wrap gap-1">
              {((disease as any).presentingComplaints || disease.diagnosticClues || []).map((pc: string) => (
                <span key={pc} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{pc}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">History Questions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {(disease.historyFeatures || []).slice(0, 6).map((hf, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                    {hf.symptomId?.replace(/_/g, ' ') || ''} (w:{hf.weight})
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Exam Findings</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {(disease.examFeatures || []).slice(0, 6).map((ef, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                    {ef.signId?.replace(/_/g, ' ') || ''} (w:{ef.baseWeight})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {subtypes && subtypes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Subtypes ({subtypes.length})</h4>
              <div className="space-y-2">
                {subtypes.map((s) => (
                  <div key={s.id} className="p-2 border rounded text-sm">
                    <p className="font-medium text-gray-700">{s.name}</p>
                    <p className="text-xs text-gray-500">{typeof s.management === 'string' ? s.management : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(inv?.laboratory || inv?.imaging || inv?.lab || inv?.bedside) && (
            <div className="grid grid-cols-2 gap-4">
              {inv.laboratory && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Lab Tests</h4>
                  <div className="space-y-1">
                    {inv.laboratory.map((l: any) => (
                      <p key={l.name} className="text-xs text-gray-600">
                        • {l.name} ({l.priority})
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {inv.imaging && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Imaging</h4>
                  <div className="space-y-1">
                    {inv.imaging.map((i: any) => (
                      <p key={i.name} className="text-xs text-gray-600">
                        • {i.name} ({i.priority})
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mgmt?.pathways && mgmt.pathways.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Management Pathways</h4>
              <div className="space-y-2">
                {mgmt.pathways.map((p, i) => (
                  <div key={i} className="p-2 border rounded text-sm">
                    <p className="font-medium text-gray-700 capitalize">{p.severity}</p>
                    <p className="text-xs text-gray-500">{p.criteria}</p>
                    <p className="text-xs text-gray-600 mt-1">{typeof p.treatment === 'string' ? p.treatment.slice(0, 100) + '...' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Close
            </button>
            <button onClick={onStartEncounter}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Start Encounter for {disease.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
