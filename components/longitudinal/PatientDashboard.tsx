'use client';

import React, { useMemo, useState } from 'react';
import type {
  PatientJourney, HospitalDay, ClinicalSnapshot,
  ToDoTask, TimelineEvent, PatientStatus,
} from '@/lib/amexan/longitudinal/types';
import { EVENT_TYPE_LABELS } from '@/lib/amexan/longitudinal/timelineEngine';
import { buildClinicalSnapshot, determinePatientStatus } from '@/lib/amexan/longitudinal/dailyEvolutionEngine';
import type { EncounterState } from '@/lib/amexan/encounter/encounterState';
import ClinicalSnapshotCard from './ClinicalSnapshot';
import ToDoExtractionPanel from './ToDoExtraction';

interface Props {
  journey: PatientJourney;
  encounter: EncounterState;
  onNavigate?: (day: number) => void;
  onNewWardRound?: () => void;
}

const STATUS_COLORS: Record<PatientStatus, string> = {
  stable: 'bg-emerald-500',
  improving: 'bg-blue-500',
  deteriorating: 'bg-amber-500',
  critical: 'bg-red-500',
  transfer: 'bg-purple-500',
  discharge_ready: 'bg-teal-500',
};

const STATUS_LABELS: Record<PatientStatus, string> = {
  stable: 'Stable',
  improving: 'Improving',
  deteriorating: 'Deteriorating',
  critical: 'Critical',
  transfer: 'Transfer',
  discharge_ready: 'Ready for Discharge',
};

export default function PatientDashboard({ journey, encounter, onNavigate, onNewWardRound }: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(journey.currentHospitalDay);
  const today = journey.hospitalDays.find(d => d.dayNumber === selectedDay) ?? journey.hospitalDays[journey.hospitalDays.length - 1];

  const snapshot: ClinicalSnapshot | null = useMemo(() => {
    if (!today || !encounter) return null;
    return buildClinicalSnapshot(encounter, today);
  }, [today, encounter]);

  const activeProblems = today?.problems.filter(p => p.status === 'active' || p.status === 'worsening') ?? [];
  const improvingProblems = today?.problems.filter(p => p.status === 'improving') ?? [];
  const pendingTasks = today?.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress') ?? [];
  const recentEvents = journey.timeline.slice(-5).reverse();

  return (
    <div className="flex h-full bg-gray-50">
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient Journey</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {[
            { label: 'Overview', icon: '⊞', active: true },
            { label: 'Ward Rounds', icon: '◉', active: false },
            { label: 'Notes', icon: '📄', active: false },
            { label: 'Investigations', icon: '🔬', active: false },
            { label: 'Imaging', icon: '📷', active: false },
            { label: 'Treatment', icon: '💊', active: false },
            { label: 'Monitoring', icon: '📈', active: false },
            { label: 'Operations', icon: '🔧', active: false },
            { label: 'Consults', icon: '👥', active: false },
            { label: 'Timeline', icon: '⏱', active: false },
            { label: 'Documents', icon: '📋', active: false },
            { label: 'Discharge', icon: '🚪', active: false },
          ].map(item => (
            <button
              key={item.label}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors
                ${item.active ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── TOP BAR ─────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{encounter.demographics.name || 'Patient Name'}</h1>
              <p className="text-sm text-gray-500">
                {encounter.demographics.ageYears > 0 ? `${encounter.demographics.ageYears}y` : `${encounter.demographics.ageMonths}m`} / {encounter.demographics.sex}
                {' · '}MRN: {encounter.demographics.mrn || 'N/A'}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-sm">
              <p className="text-gray-500">Ward</p>
              <p className="font-medium text-gray-800">{encounter.demographics.departmentSlug || 'Medical Ward'}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-500">Bed</p>
              <p className="font-medium text-gray-800">{encounter.disposition?.destination || '—'}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-500">Hospital Day</p>
              <p className="font-medium text-gray-800">Day {journey.currentHospitalDay}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[journey.status]}`} />
              <span className="text-sm font-medium text-gray-800">{STATUS_LABELS[journey.status]}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewWardRound}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              Start Ward Round
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Present Patient
            </button>
          </div>
        </div>

        {/* ── HOSPITAL DAY TIMELINE (clickable bar) ────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto">
            {journey.hospitalDays.map(day => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${selectedDay === day.dayNumber
                    ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-300'
                    : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <span className="block text-xs text-gray-400">Day {day.dayNumber}</span>
                <span className="block text-xs">{new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </button>
            ))}
            <div className="px-4 py-2 text-gray-400 text-sm italic">Expected discharge</div>
          </div>
        </div>

        {/* ── CLINICAL SNAPSHOT CARDS ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          {snapshot && <ClinicalSnapshotCard snapshot={snapshot} />}

          {/* ── TODAY'S SOAP NOTE ──────────────────────────────────────── */}
          {today?.soap && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Today's SOAP Note</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'S — Subjective', content: today.soap.subjective },
                  { label: 'O — Objective', content: today.soap.objective },
                  { label: 'A — Assessment', content: today.soap.assessment },
                  { label: 'P — Plan', content: today.soap.plan },
                ].map(section => (
                  <div key={section.label}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{section.label}</p>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {section.content || 'Not yet documented.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RECENT EVENTS ──────────────────────────────────────────── */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Recent Events</h3>
            </div>
            <div className="p-6">
              {recentEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No recent events.</p>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        event.severity === 'critical' ? 'bg-red-500'
                        : event.severity === 'warning' ? 'bg-amber-500'
                        : event.severity === 'success' ? 'bg-emerald-500'
                        : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {EVENT_TYPE_LABELS[event.type] || event.type}
                        </p>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(event.timestamp).toLocaleString('en-GB', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR — To-Do Extraction ───────────────────────────── */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto shrink-0">
        <ToDoExtractionPanel tasks={pendingTasks} />
      </div>
    </div>
  );
}
