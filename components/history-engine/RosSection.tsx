'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

export default function RosSection() {
  const ros = useHistoryStore(s => s.ros);
  const ddx = useHistoryStore(s => s.ddx);
  const setRosSymptom = useHistoryStore(s => s.setRosSymptom);
  const completeSection = useHistoryStore(s => s.completeSection);
  const completedSections = useHistoryStore(s => s.completedSections);

  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
  const [rosCompleted, setRosCompleted] = useState(completedSections.includes('ros'));

  const prioritySystemIds = ddx.probabilities.slice(0, 3).flatMap(p => {
    const map: Record<string, string[]> = {
      tb_pulm: ['constitutional', 'respiratory'],
      pneumonia_pulm: ['respiratory', 'constitutional'],
      asthma_pulm: ['respiratory'],
      heart_failure_card: ['cardiovascular', 'respiratory'],
      chest_pain: ['cardiovascular'],
    };
    return map[p.diseaseId] || [];
  });

  const priorityOrder = [...new Set(['constitutional', 'respiratory', 'cardiovascular', ...prioritySystemIds])];

  const sortedSystems = [...ros].sort((a, b) => {
    const aIdx = priorityOrder.indexOf(a.id);
    const bIdx = priorityOrder.indexOf(b.id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.priority - b.priority;
  });

  const handleComplete = () => {
    setRosCompleted(true);
    completeSection('ros');
  };

  if (ros.length === 0) {
    return <div className="text-gray-500 text-xs p-4">ROS will appear once complaints and HPI are done.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Review of Systems</h2>
        <span className="text-[10px] text-gray-500">(Priority-ordered by differentials)</span>
      </div>

      {sortedSystems.map(system => {
        const isExpanded = expandedSystem === system.id;
        const answeredCount = system.symptoms.filter(s => s.present !== null).length;
        const totalCount = system.symptoms.length;
        const hasPriority = priorityOrder.includes(system.id);

        return (
          <div key={system.id} className="rounded-lg border border-gray-700/50 overflow-hidden">
            <button onClick={() => setExpandedSystem(isExpanded ? null : system.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${hasPriority ? 'bg-teal-500/10' : 'bg-[#12193a]'} hover:bg-gray-800`}>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${hasPriority ? 'text-teal-400' : 'text-gray-300'}`}>{system.label}</span>
                {hasPriority && <span className="text-[9px] text-teal-500 bg-teal-500/10 px-1 rounded">Priority</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{answeredCount}/{totalCount}</span>
                <span className="text-gray-600">{isExpanded ? '▾' : '▸'}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 space-y-2 bg-[#0b1230]">
                {system.symptoms.map(s => {
                  const isYes = s.present === true;
                  const isNo = s.present === false;
                  return (
                    <div key={s.id} className="flex items-center justify-between py-0.5">
                      <span className="text-xs text-gray-400">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setRosSymptom(system.id, s.id, true, s.details)}
                          className={`text-[10px] px-2 py-0.5 rounded transition-colors ${isYes ? 'bg-teal-500/20 text-teal-400' : 'text-gray-500 hover:text-teal-400'}`}>
                          Yes
                        </button>
                        <button onClick={() => setRosSymptom(system.id, s.id, false, s.details)}
                          className={`text-[10px] px-2 py-0.5 rounded transition-colors ${isNo ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
                          No
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button onClick={handleComplete}
        className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
        Complete ROS
      </button>
    </div>
  );
}
