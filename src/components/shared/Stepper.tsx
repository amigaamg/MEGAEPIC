'use client';
import React from 'react';

interface Step {
  id: string;
  label: string;
  icon: string;
}

interface StepperProps {
  steps: Step[];
  activeStep: string;
  completedSteps: string[];
  onStepClick?: (stepId: string) => void;
}

export function Stepper({ steps, activeStep, completedSteps, onStepClick }: StepperProps) {
  return (
    <nav className="flex flex-col gap-1 p-2" aria-label="Encounter phases">
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        const isCompleted = completedSteps.includes(step.id);
        const isClickable = !!onStepClick && (isCompleted || isActive);

        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepClick?.(step.id)}
            disabled={!isClickable}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all
              ${isActive ? 'bg-blue-50 border border-blue-200 text-blue-700 font-medium' : ''}
              ${isCompleted ? 'text-green-700' : ''}
              ${!isActive && !isCompleted ? 'text-gray-500' : ''}
              ${isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
            `}
          >
            <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
              ${isActive ? 'bg-blue-600 text-white' : ''}
              ${isCompleted ? 'bg-green-500 text-white' : ''}
              ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
            ">
              {isCompleted ? '✓' : step.icon}
            </span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
