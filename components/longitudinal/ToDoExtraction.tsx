'use client';

import React from 'react';
import type { ToDoTask, TaskCategory } from '@/lib/amexan/longitudinal/types';
import { groupTasksByCategory, getUrgentTasks } from '@/lib/amexan/longitudinal/taskExtractionEngine';

interface Props {
  tasks: ToDoTask[];
  onCompleteTask?: (taskId: string) => void;
  onDeferTask?: (taskId: string) => void;
}

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  lab: 'Laboratory',
  radiology: 'Radiology',
  nursing: 'Nursing',
  pharmacy: 'Pharmacy',
  physiotherapy: 'Physiotherapy',
  doctor: 'Doctor',
  consult: 'Consults',
  admin: 'Administration',
};

const CATEGORY_ICONS: Record<TaskCategory, string> = {
  lab: '🔬',
  radiology: '📷',
  nursing: '👩‍⚕️',
  pharmacy: '💊',
  physiotherapy: '🏃',
  doctor: '👨‍⚕️',
  consult: '👥',
  admin: '📋',
};

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  lab: 'border-l-purple-400 bg-purple-50',
  radiology: 'border-l-blue-400 bg-blue-50',
  nursing: 'border-l-emerald-400 bg-emerald-50',
  pharmacy: 'border-l-amber-400 bg-amber-50',
  physiotherapy: 'border-l-cyan-400 bg-cyan-50',
  doctor: 'border-l-sky-400 bg-sky-50',
  consult: 'border-l-violet-400 bg-violet-50',
  admin: 'border-l-gray-400 bg-gray-50',
};

const PRIORITY_BADGES: Record<string, string> = {
  stat: 'bg-red-100 text-red-700',
  urgent: 'bg-amber-100 text-amber-700',
  today: 'bg-blue-100 text-blue-700',
  routine: 'bg-gray-100 text-gray-600',
};

export default function ToDoExtractionPanel({ tasks, onCompleteTask, onDeferTask }: Props) {
  const urgentTasks = getUrgentTasks(tasks);
  const grouped = groupTasksByCategory(tasks);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Tasks</h2>

      {/* ── Urgent Tasks ───────────────────────────────────────────────── */}
      {urgentTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Urgent ({urgentTasks.length})
          </h3>
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <TaskCard key={task.id} task={task} onComplete={onCompleteTask} onDefer={onDeferTask} />
            ))}
          </div>
        </div>
      )}

      {/* ── Grouped Tasks ───────────────────────────────────────────────── */}
      {Object.entries(grouped).map(([category, categoryTasks]) => {
        const cat = category as TaskCategory;
        const pendingTasks = categoryTasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
        if (pendingTasks.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <span>{CATEGORY_ICONS[cat]}</span>
              {CATEGORY_LABELS[cat]} ({pendingTasks.length})
            </h3>
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <TaskCard key={task.id} task={task} onComplete={onCompleteTask} onDefer={onDeferTask} />
              ))}
            </div>
          </div>
        );
      })}

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No tasks for today.</p>
          <p className="text-xs text-gray-300 mt-1">Tasks are automatically extracted from the clinical plan.</p>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onComplete, onDefer }: {
  task: ToDoTask;
  onComplete?: (id: string) => void;
  onDefer?: (id: string) => void;
}) {
  return (
    <div className={`border-l-4 rounded-lg p-3 text-sm ${CATEGORY_COLORS[task.category]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm">{task.description}</p>
          {task.detail && task.detail !== task.description && (
            <p className="text-xs text-gray-500 mt-0.5">{task.detail}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_BADGES[task.priority] || 'bg-gray-100'}`}>
              {task.priority.toUpperCase()}
            </span>
            {task.assignedRole && (
              <span className="text-xs text-gray-400">for {task.assignedRole}</span>
            )}
            {task.dueBy && (
              <span className="text-xs text-gray-400">
                Due {new Date(task.dueBy).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        {task.status === 'pending' && (
          <div className="flex items-center gap-1 shrink-0">
            {onComplete && (
              <button
                onClick={() => onComplete(task.id)}
                className="w-6 h-6 rounded-full border-2 border-emerald-400 hover:bg-emerald-50 flex items-center justify-center text-emerald-500 text-xs"
                title="Complete"
              >
                ✓
              </button>
            )}
            {onDefer && (
              <button
                onClick={() => onDefer(task.id)}
                className="w-6 h-6 rounded-full border-2 border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-400 text-xs"
                title="Defer"
              >
                ↻
              </button>
            )}
          </div>
        )}
        {task.status === 'in_progress' && (
          <span className="text-xs text-amber-600 font-medium shrink-0">In progress...</span>
        )}
        {task.status === 'completed' && (
          <span className="text-xs text-emerald-600 font-medium shrink-0">Done ✓</span>
        )}
      </div>
    </div>
  );
}
