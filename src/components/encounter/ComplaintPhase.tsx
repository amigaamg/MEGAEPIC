'use client';
import React, { useState } from 'react';
import type { PresentingComplaintData } from '@/types/encounter';

interface ComplaintPhaseProps {
  onSave: (data: PresentingComplaintData) => Promise<void>;
  onComplete: () => void;
  initialData?: Partial<PresentingComplaintData>;
  suggestedComplaints?: string[];
}

export function ComplaintPhase({ onSave, onComplete, initialData, suggestedComplaints = [] }: ComplaintPhaseProps) {
  const [form, setForm] = useState<PresentingComplaintData>({
    complaint: initialData?.complaint || '',
    duration: initialData?.duration || '',
    severity: initialData?.severity || 5,
    priority: initialData?.priority || 'medium',
  });
  const [saving, setSaving] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  const handleSave = async () => {
    if (!form.complaint.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Presenting Complaint</label>
          <button
            onClick={() => setCustomMode(!customMode)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {customMode ? 'Pick from list' : 'Enter custom complaint'}
          </button>
        </div>

        {customMode ? (
          <input
            type="text"
            value={form.complaint}
            onChange={(e) => setForm((prev) => ({ ...prev, complaint: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Enter the presenting complaint..."
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {suggestedComplaints.map((complaint) => (
              <button
                key={complaint}
                onClick={() => setForm((prev) => ({ ...prev, complaint }))}
                className={`px-3 py-2 text-sm rounded-lg border text-left transition-colors ${
                  form.complaint === complaint
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {complaint}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <input
            type="text"
            value={form.duration}
            onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="e.g., 3 days, 6 hours"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity ({form.severity}/10)
          </label>
          <input
            type="range"
            min={1} max={10}
            value={form.severity}
            onChange={(e) => setForm((prev) => ({ ...prev, severity: parseInt(e.target.value) }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Mild</span>
            <span>Severe</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as any }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving || !form.complaint.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}
