'use client';

import React from 'react';
import { PresentationCard, CardAction } from '@/lib/amexan/constitution/books/book-II-experience';

interface CardComponentProps {
  card: PresentationCard;
  onAction?: (action: CardAction) => void;
}

function CardWrapper({ card, children }: { card: PresentationCard; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-card transition-all ${!card.visible ? 'hidden' : ''} ${!card.enabled ? 'opacity-50 pointer-events-none' : ''} ${card.highlight ? 'ring-2 ring-primary/40' : ''} ${card.minWidth === 'full' ? 'col-span-full' : card.minWidth === 'half' ? 'col-span-1' : card.minWidth === 'third' ? 'col-span-1' : ''}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{card.label}</span>
          {card.required && <span className="text-[10px] uppercase tracking-wider text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded">Required</span>}
          {card.completed && <span className="text-green-500 text-sm">&#10003;</span>}
          {card.badge && (
            <span className="text-[11px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">{card.badge}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {card.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {}}
              className="text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center gap-1"
              title={action.label}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

function VitalSignsCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="grid grid-cols-3 gap-3">
        {['BP', 'HR', 'RR', 'Temp', 'SpO2', 'Pain'].map((vital) => (
          <div key={vital} className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{vital}</div>
            <div className="text-lg font-bold text-gray-800 mt-1">--</div>
            <div className="text-[10px] text-gray-400">Tap to enter</div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

function QuestionGroupCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="space-y-3">
        {['Question 1', 'Question 2', 'Question 3'].slice(0, card.data?.questionCount as number || 3).map((q, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">{q}</span>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 bg-white border rounded-md hover:bg-gray-50">Yes</button>
              <button className="text-xs px-3 py-1 bg-white border rounded-md hover:bg-gray-50">No</button>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

function InfoDisplayCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="text-sm text-gray-600">
        <p className="text-gray-400 italic">No information recorded yet.</p>
      </div>
    </CardWrapper>
  );
}

function DifferentialListCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="space-y-2">
        {['Malaria', 'Pneumonia', 'UTI', 'Typhoid'].map((dx, i) => (
          <div key={dx} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">{(90 - i * 20)}%</span>
              <span className="text-sm font-medium text-gray-800">{dx}</span>
            </div>
            <button className="text-xs px-2 py-1 bg-white border rounded-md hover:bg-gray-50">Select</button>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

function MedicationListCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="space-y-2">
        {['Amoxicillin 500mg', 'Paracetamol 1g', 'Artemether/Lumefantrine'].map((med) => (
          <div key={med} className="flex items-center justify-between p-2 bg-white border rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">{med}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Active</span>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

function InvestigationOrderCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="space-y-2">
        {['CBC', 'Blood Culture', 'Chest X-ray', 'Malaria RDT'].map((test) => (
          <label key={test} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/30" />
            <span className="text-sm text-gray-700">{test}</span>
          </label>
        ))}
      </div>
    </CardWrapper>
  );
}

function RiskScoreCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-600">--</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Score</div>
        </div>
        <div className="text-sm text-gray-500">Complete assessment to calculate risk score</div>
      </div>
    </CardWrapper>
  );
}

function NarrativeCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="min-h-[100px] bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-400 italic">Click to start dictation or type clinical note...</p>
      </div>
    </CardWrapper>
  );
}

function TimelineCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="space-y-2">
        {[
          { time: '09:00', event: 'Patient registered' },
          { time: '09:15', event: 'Vitals recorded' },
          { time: '09:30', event: 'History taking' },
        ].map((item) => (
          <div key={item.time} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
              <div className="w-px h-full bg-gray-200"></div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-mono">{item.time}</div>
              <div className="text-sm text-gray-700">{item.event}</div>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

function AlertCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">!</div>
        <div className="text-sm text-red-800">Critical: Action required</div>
      </div>
    </CardWrapper>
  );
}

function PatientHeaderCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg">
          {card.data?.initials || 'PT'}
        </div>
        <div>
          <div className="text-lg font-bold text-gray-800">{card.data?.name || 'Patient Name'}</div>
          <div className="text-sm text-gray-500">
            {card.data?.age || '--'}y &middot; {card.data?.gender || '--'} &middot; MRN: {card.data?.mrn || '--'}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}

function AISuggestionCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="space-y-2">
        <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">AI</div>
          <p className="text-sm text-indigo-800">Based on the presentation, consider adding respiratory rate and oxygen saturation to your assessment.</p>
        </div>
      </div>
    </CardWrapper>
  );
}

function ChartCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="h-32 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-sm text-gray-400">Chart visualization</span>
      </div>
    </CardWrapper>
  );
}

function HandoverReportCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded"><span className="text-gray-400">Bed: </span>12A</div>
          <div className="bg-gray-50 p-2 rounded"><span className="text-gray-400">Doctor: </span>Dr. Smith</div>
          <div className="bg-gray-50 p-2 rounded"><span className="text-gray-400">Code: </span>Blue</div>
          <div className="bg-gray-50 p-2 rounded"><span className="text-gray-400">ISBAR: </span>Complete</div>
        </div>
      </div>
    </CardWrapper>
  );
}

function FluidChartCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-[10px] text-blue-600 uppercase">Input</div>
          <div className="text-lg font-bold text-blue-700">-- mL</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg text-center">
          <div className="text-[10px] text-amber-600 uppercase">Output</div>
          <div className="text-lg font-bold text-amber-700">-- mL</div>
        </div>
      </div>
    </CardWrapper>
  );
}

function ActionButtonCard({ card }: CardComponentProps) {
  return (
    <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-all text-center text-sm text-gray-500 hover:text-primary font-medium">
      + {card.label || 'Add Action'}
    </button>
  );
}

function DefaultCard({ card }: CardComponentProps) {
  return (
    <CardWrapper card={card}>
      <div className="text-sm text-gray-400 italic">Card type: {card.type}</div>
    </CardWrapper>
  );
}

export const CARD_RENDERERS: Record<string, React.ComponentType<CardComponentProps>> = {
  vital_signs: VitalSignsCard,
  question_group: QuestionGroupCard,
  info_display: InfoDisplayCard,
  differential_list: DifferentialListCard,
  medication_list: MedicationListCard,
  investigation_order: InvestigationOrderCard,
  risk_score: RiskScoreCard,
  narrative: NarrativeCard,
  timeline: TimelineCard,
  alert: AlertCard,
  patient_header: PatientHeaderCard,
  ai_suggestion: AISuggestionCard,
  chart: ChartCard,
  handover_report: HandoverReportCard,
  fluid_chart: FluidChartCard,
  action_button: ActionButtonCard,
};

export function CardRenderer({ card, onAction }: CardComponentProps) {
  const Renderer = CARD_RENDERERS[card.type];
  if (!Renderer) return <DefaultCard card={card} onAction={onAction} />;
  return <Renderer card={card} onAction={onAction} />;
}