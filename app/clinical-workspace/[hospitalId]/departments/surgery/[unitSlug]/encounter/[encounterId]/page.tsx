'use client';
import React, { useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEncounter } from '@/src/hooks/useEncounter';
import { useEncounterFacts } from '@/src/hooks/useEncounterFacts';
import { useTimeline } from '@/src/hooks/useTimeline';
import { useDDX } from '@/src/hooks/useDDX';
import {
  RegistrationPhase,
  ComplaintPhase,
  HPIPhase,
  ExaminationPhase,
  BedsideScorePhase,
  DDXPhase,
  InvestigationsPhase,
  ImagingPhase,
  TreatmentPhase,
  OperativeNotePhase,
  WardRoundPhase,
  DispositionPhase,
  TimelineViewer,
} from '@/src/components/encounter';
import { Stepper } from '@/src/components/shared/Stepper';
import { getPresentingComplaintsForUnit } from '@/src/engine/knowledge-graph';
import { addSubcollectionItem } from '@/src/services/encounterService';
import type {
  RegistrationData,
  PresentingComplaintData,
  HPIEntry,
  ExamEntry,
  TreatmentEntry,
  OperativeNoteData,
  WardRoundEntry,
  DispositionData,
  ImagingEntry,
  InvestigationEntry,
} from '@/src/types/encounter';

const PHASES = [
  { id: 'registration', label: 'Registration', icon: '📋' },
  { id: 'presenting_complaint', label: 'Complaint', icon: '🗣️' },
  { id: 'hpi', label: 'History (HPI)', icon: '📝' },
  { id: 'examination', label: 'Examination', icon: '🩺' },
  { id: 'bedside_scores', label: 'Scores', icon: '📊' },
  { id: 'ddx', label: 'Differential DX', icon: '🧠' },
  { id: 'investigations', label: 'Investigations', icon: '🧪' },
  { id: 'imaging', label: 'Imaging', icon: '📡' },
  { id: 'treatment', label: 'Treatment', icon: '💉' },
  { id: 'operative_note', label: 'Operative Note', icon: '🔪' },
  { id: 'ward_rounds', label: 'Ward Rounds', icon: '👨‍⚕️' },
  { id: 'disposition', label: 'Disposition', icon: '🚪' },
];

export default function SurgeryEncounterPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hospitalId = params?.hospitalId as string;
  const unitSlug = params?.unitSlug as string;
  const encounterId = params?.encounterId as string;
  const deptSlug = 'SURG';

  const { encounter, loading, update, addEvent, completePhase } = useEncounter(encounterId, deptSlug, unitSlug);
  const { items: hpiItems } = useEncounterFacts<HPIEntry>(encounterId, deptSlug, unitSlug, 'hpi');
  const { items: examItems } = useEncounterFacts<ExamEntry>(encounterId, deptSlug, unitSlug, 'examination');
  const { items: investigationItems } = useEncounterFacts<InvestigationEntry>(encounterId, deptSlug, unitSlug, 'investigations');
  const { items: imagingItems } = useEncounterFacts<ImagingEntry>(encounterId, deptSlug, unitSlug, 'imaging');
  const { items: treatmentItems } = useEncounterFacts<TreatmentEntry>(encounterId, deptSlug, unitSlug, 'treatment');
  const { items: wardRoundItems } = useEncounterFacts<WardRoundEntry>(encounterId, deptSlug, unitSlug, 'wardRounds');

  const { ddxResults, factCount, isComputing, computeDDX } = useDDX({
    encounterId, deptSlug, unitSlug, debounceMs: 800,
  });

  const [activePhase, setActivePhase] = useState<string>('registration');
  const phaseEncounter = encounter?.activePhase || 'registration';
  const completedPhases: string[] = encounter?.completedPhases || [];
  const unitComplaints = getPresentingComplaintsForUnit(unitSlug);

  const topDiseaseIds = ddxResults.slice(0, 3).map((d) => d.diseaseId);
  const topDiseaseNames = ddxResults.slice(0, 5).map((d) => d.diseaseName);

  const triggerDDX = useCallback(() => {
    if (!encounter) return;
    computeDDX({
      unitSlug,
      presentingComplaint: encounter.presentingComplaint?.complaint,
      hpi: hpiItems.map((h) => ({ questionId: h.questionId, answer: h.answer })),
      exam: examItems.map((e) => ({ findingId: e.findingId, present: e.present === true, value: e.value })),
      investigations: investigationItems
        .filter((i) => i.status === 'resulted')
        .map((i) => ({ testId: i.testId, result: i.result, flag: i.flag })),
      imaging: imagingItems
        .filter((i) => i.status === 'completed')
        .map((i) => ({ studyId: i.studyId, finding: i.finding, positive: i.ddxImpact > 0 })),
      scores: [],
    });
  }, [encounter, unitSlug, hpiItems, examItems, investigationItems, imagingItems, computeDDX]);

  const handleCompletePhase = async (phaseId: string) => {
    await completePhase(phaseId, 'dr_current', 'Dr. Current');
    if (phaseId === 'presenting_complaint' || phaseId === 'hpi' || phaseId === 'examination') {
      triggerDDX();
    }
    setActivePhase(phaseId);
  };

  const handleRegistrationSave = async (data: RegistrationData) => {
    await update({ registration: data });
    await addEvent('Phase completed: Registration', 'Encounter registered', 'dr_current', 'Dr. Current');
  };

  const handleComplaintSave = async (data: PresentingComplaintData) => {
    await update({ presentingComplaint: data });
    triggerDDX();
    await addEvent('Presenting complaint recorded', data.complaint, 'dr_current', 'Dr. Current');
  };

  const handleHPIAnswer = async (questionId: string, question: string, answer: string | boolean) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'hpi', {
      questionId, question, answer, timestamp: Date.now(),
    } as any);
    triggerDDX();
  };

  const handleExamChange = async (findingId: string, findingText: string, present: boolean | null, value?: number, comment?: string) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'examination', {
      findingId, findingText, present, value, comment, timestamp: Date.now(),
    } as any);
    triggerDDX();
  };

  const handleBedsideScoreSave = async (scoreName: string, totalPoints: number, maxPoints: number, riskCategory: string, components: any[]) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'bedsideScores', {
      scoreName, totalPoints, maxPoints, riskCategory, components, timestamp: Date.now(),
    } as any);
  };

  const handleInvestigationOrder = async (testName: string) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'investigations', {
      testId: testName.toLowerCase().replace(/\s+/g, '_'),
      testName,
      status: 'ordered',
      result: null,
      interpretation: '',
      flag: 'normal',
      timestamp: Date.now(),
    } as any);
    await addEvent('Investigation ordered', testName, 'dr_current', 'Dr. Current');
  };

  const handleInvestigationResult = async (testId: string, testName: string, value: number, unit: string, refLow: number, refHigh: number) => {
    const flag = value > refHigh ? 'abnormal' : value < refLow ? 'abnormal' : 'normal';
    const items = investigationItems.filter((i) => i.testName === testName);
    for (const item of items) {
      await updateEncounterSub(item.id!, { status: 'resulted', result: value, flag, interpretation: `${testName}: ${value} ${unit} (${flag})` });
    }
    triggerDDX();
  };
  const updateEncounterSub = async (itemId: string, updates: any) => {
    const { updateSubcollectionItem } = await import('@/src/services/encounterService');
    await updateSubcollectionItem(encounterId, deptSlug, unitSlug, 'investigations', itemId, updates);
  };

  const handleImagingOrder = async (studyName: string) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'imaging', {
      studyId: studyName.toLowerCase().replace(/\s+/g, '_'),
      studyName, status: 'ordered', finding: '', impression: '', ddxImpact: 0, timestamp: Date.now(),
    } as any);
  };

  const handleImagingResult = async (studyName: string, finding: string, impression: string, positive: boolean) => {
    const items = imagingItems.filter((i) => i.studyName === studyName);
    const ddxImpact = positive ? 15 : -5;
    for (const item of items) {
      await updateEncounterSubImg(item.id!, { status: 'completed', finding, impression, ddxImpact });
    }
    triggerDDX();
  };
  const updateEncounterSubImg = async (itemId: string, updates: any) => {
    const { updateSubcollectionItem } = await import('@/src/services/encounterService');
    await updateSubcollectionItem(encounterId, deptSlug, unitSlug, 'imaging', itemId, updates);
  };

  const handleTreatmentSave = async (planType: string, items: string[], definitiveProcedure?: string) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'treatment', {
      planType, items, definitiveProcedure, timestamp: Date.now(),
    } as any);
  };

  const handleOperativeNoteSave = async (data: any) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'operativeNote', {
      ...data, timestamp: Date.now(),
    } as any);
    await update({ status: 'post-op' });
  };

  const handleWardRoundSave = async (data: Omit<WardRoundEntry, 'id' | 'version'>) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'wardRounds', {
      ...data, version: wardRoundItems.length + 1, timestamp: Date.now(),
    } as any);
  };

  const handleDispositionSave = async (data: DispositionData) => {
    await addSubcollectionItem(encounterId, deptSlug, unitSlug, 'disposition', data as any);
    await update({ status: data.decision === 'discharge' ? 'discharged' : data.decision === 'admit' ? 'admitted' : data.decision });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading encounter...</div>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">Encounter not found</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  const renderPhase = () => {
    switch (activePhase) {
      case 'registration':
        return (
          <RegistrationPhase
            onSave={handleRegistrationSave}
            onComplete={() => handleCompletePhase('registration')}
            initialData={encounter.registration}
          />
        );
      case 'presenting_complaint':
        return (
          <ComplaintPhase
            onSave={handleComplaintSave}
            onComplete={() => handleCompletePhase('presenting_complaint')}
            initialData={encounter.presentingComplaint}
            suggestedComplaints={unitComplaints}
          />
        );
      case 'hpi':
        return (
          <HPIPhase
            topDiseaseIds={topDiseaseIds}
            existingAnswers={hpiItems}
            onAnswer={handleHPIAnswer}
            onComplete={() => handleCompletePhase('hpi')}
            unitSlug={unitSlug}
          />
        );
      case 'examination':
        return (
          <ExaminationPhase
            topDiseaseIds={topDiseaseIds}
            existingFindings={examItems}
            onFindingChange={handleExamChange}
            onComplete={() => handleCompletePhase('examination')}
          />
        );
      case 'bedside_scores':
        return (
          <BedsideScorePhase
            onSave={handleBedsideScoreSave}
            onComplete={() => handleCompletePhase('bedside_scores')}
            existingHpi={{}}
            existingExam={{}}
          />
        );
      case 'ddx':
        return (
          <DDXPhase
            ddxResults={ddxResults}
            factCount={factCount}
            isComputing={isComputing}
            onAccept={async () => {
              await addEvent('DDX accepted', `Top: ${topDiseaseNames[0] || 'N/A'}`, 'dr_current', 'Dr. Current');
            }}
            onComplete={() => handleCompletePhase('ddx')}
          />
        );
      case 'investigations':
        return (
          <InvestigationsPhase
            topDiseaseIds={topDiseaseIds}
            existingInvestigations={investigationItems}
            onOrder={handleInvestigationOrder}
            onResult={handleInvestigationResult}
            onComplete={() => handleCompletePhase('investigations')}
          />
        );
      case 'imaging':
        return (
          <ImagingPhase
            topDiseaseIds={topDiseaseIds}
            existingImages={imagingItems}
            onOrder={handleImagingOrder}
            onResult={handleImagingResult}
            onComplete={() => handleCompletePhase('imaging')}
          />
        );
      case 'treatment':
        return (
          <TreatmentPhase
            topDiseaseIds={topDiseaseIds}
            existingTreatments={treatmentItems}
            onSave={handleTreatmentSave}
            onComplete={() => handleCompletePhase('treatment')}
          />
        );
      case 'operative_note':
        return (
          <OperativeNotePhase
            topDiseaseIds={topDiseaseIds}
            onSave={handleOperativeNoteSave}
            onComplete={() => handleCompletePhase('operative_note')}
          />
        );
      case 'ward_rounds':
        return (
          <WardRoundPhase
            existingRounds={wardRoundItems}
            onSave={handleWardRoundSave}
            onComplete={() => handleCompletePhase('ward_rounds')}
            patientName={encounter.patientName}
            patientId={encounter.patientId}
            unitSlug={unitSlug}
          />
        );
      case 'disposition':
        return (
          <DispositionPhase
            topDiseaseNames={topDiseaseNames}
            proceduresPerformed={treatmentItems.filter((t) => t.planType === 'definitive').flatMap((t) => t.definitiveProcedure ? [t.definitiveProcedure] : [])}
            onSave={handleDispositionSave}
            onComplete={() => handleCompletePhase('disposition')}
            patientName={encounter.patientName}
            patientId={encounter.patientId}
            unitSlug={unitSlug}
          />
        );
      default:
        return <div className="text-gray-400 text-center py-8">Select a phase</div>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-56 border-r bg-gray-50 flex flex-col overflow-y-auto">
        <div className="p-3 border-b">
          <h2 className="text-sm font-semibold text-gray-800 truncate">{encounter.patientName}</h2>
          <p className="text-xs text-gray-400 font-mono truncate">{encounterId}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
            encounter.status === 'active' ? 'bg-green-100 text-green-700'
            : encounter.status === 'admitted' ? 'bg-blue-100 text-blue-700'
            : encounter.status === 'post-op' ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-500'
          }`}>
            {encounter.status}
          </span>
        </div>
        <Stepper
          steps={PHASES}
          activeStep={activePhase}
          completedSteps={completedPhases}
          onStepClick={(id) => setActivePhase(id)}
        />
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {PHASES.find((p) => p.id === activePhase)?.label || activePhase}
            </h2>
            <p className="text-xs text-gray-400">{unitSlug.replace(/-/g, ' ')} · SURG</p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            {renderPhase()}
          </div>
        </div>
      </main>

      <aside className="w-72 border-l bg-gray-50 overflow-y-auto">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">Timeline</h3>
        </div>
        <div className="p-3">
          <TimelineViewer encounterId={encounterId} deptSlug={deptSlug} unitSlug={unitSlug} />
        </div>

        {ddxResults.length > 0 && (
          <>
            <div className="p-3 border-t border-b">
              <h3 className="text-sm font-semibold text-gray-700">Top Diagnoses</h3>
            </div>
            <div className="p-3 space-y-2">
              {ddxResults.slice(0, 5).map((d) => (
                <div key={d.diseaseId}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-700 truncate">{d.diseaseName}</span>
                    <span className="text-blue-600 font-medium">{d.probability}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.probability}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
