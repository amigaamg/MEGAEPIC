'use client';
import React from 'react';

interface ActionButton {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

interface UnitActionButtonsProps {
  onAction: (actionId: string) => void;
  unitSlug: string;
}

const ACTIONS: ActionButton[] = [
  { id: 'new-encounter', label: '+ New Encounter', icon: '📋', color: 'bg-blue-600 hover:bg-blue-700', description: 'Create a new clinical encounter' },
  { id: 'admit', label: '📋 Admit Patient', icon: '📋', color: 'bg-green-600 hover:bg-green-700', description: 'Direct inpatient admission' },
  { id: 'operative-note', label: '📄 Operative Note', icon: '📄', color: 'bg-purple-600 hover:bg-purple-700', description: 'Write an operative note for an active case' },
  { id: 'trauma', label: '🚨 Trauma Activation', icon: '🚨', color: 'bg-red-600 hover:bg-red-700', description: 'Activate trauma team response' },
  { id: 'mdt', label: '👥 MDT Review', icon: '👥', color: 'bg-amber-600 hover:bg-amber-700', description: 'Multi-disciplinary team review' },
];

export function UnitActionButtons({ onAction, unitSlug }: UnitActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className={`p-3 rounded-lg text-white text-sm font-medium transition-all ${action.color} shadow-sm hover:shadow-md active:scale-95`}
          title={action.description}
        >
          <div className="text-2xl mb-1">{action.icon}</div>
          <div className="text-xs">{action.label}</div>
        </button>
      ))}
    </div>
  );
}
