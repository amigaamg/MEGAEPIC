'use client';
import { useClinical } from '@/src/store/ClinicalContext';

const examFindings: Array<{
  key: keyof import('@/src/types/clinical').ExamFindings;
  label: string;
  category: string;
}> = [
  // Respiratory
  { key: 'chestIndrawing', label: 'Chest indrawing', category: 'respiratory' },
  { key: 'nasalFlaring', label: 'Nasal flaring', category: 'respiratory' },
  { key: 'grunting', label: 'Expiratory grunting', category: 'respiratory' },
  { key: 'headNodding', label: 'Head nodding', category: 'respiratory' },
  { key: 'wheeze', label: 'Audible wheeze', category: 'respiratory' },
  { key: 'crackles', label: 'Crackles on auscultation', category: 'respiratory' },
  { key: 'stridor', label: 'Stridor', category: 'respiratory' },
  { key: 'cyanosis', label: 'Central cyanosis', category: 'respiratory' },

  // Systemic
  { key: 'lymphadenopathy', label: 'Lymphadenopathy', category: 'systemic' },
  { key: 'abdominalDistension', label: 'Abdominal distension', category: 'systemic' },
  { key: 'hepatomegaly', label: 'Hepatomegaly', category: 'systemic' },
  { key: 'splenomegaly', label: 'Splenomegaly', category: 'systemic' },
  { key: 'pallor', label: 'Pallor', category: 'systemic' },
  { key: 'oedema', label: 'Pedal oedema', category: 'systemic' },
  { key: 'rash', label: 'Rash', category: 'systemic' },
  { key: 'meningism', label: 'Meningism / neck stiffness', category: 'systemic' },
];

export function ExamCards() {
  const { state, setExam } = useClinical();
  const { exam } = state;

  const categories = [...new Set(examFindings.map(f => f.category))];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Examination Findings</h4>

      {categories.map(cat => (
        <div key={cat} className="mb-3 last:mb-0">
          <p className="text-[9px] font-semibold text-gray-400 uppercase mb-1.5">{cat}</p>
          <div className="flex flex-wrap gap-1.5">
            {examFindings
              .filter(f => f.category === cat)
              .map(finding => {
                const isPresent = exam[finding.key];
                return (
                  <button
                    key={finding.key}
                    onClick={() => setExam({ [finding.key]: !isPresent })}
                    className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                      isPresent
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {finding.label}
                    {isPresent ? ' ✓' : ''}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
