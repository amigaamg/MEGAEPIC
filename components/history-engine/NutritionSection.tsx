'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

const FOOD_GROUP_OPTIONS = [
  'grains', 'legumes', 'vegetables', 'fruits', 'dairy', 'meat', 'eggs', 'oils',
];

export default function NutritionSection() {
  const nutrition = useHistoryStore(s => s.nutritionHistory);
  const setNutritionHistory = useHistoryStore(s => s.setNutritionHistory);

  const toggleFoodGroup = (group: string) => {
    const updated = nutrition.foodGroups.includes(group)
      ? nutrition.foodGroups.filter(g => g !== group)
      : [...nutrition.foodGroups, group];
    setNutritionHistory({ foodGroups: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Nutrition History</h2>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Feeding Information</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Current Feeding</label>
            <select value={nutrition.currentFeeding} onChange={e => setNutritionHistory({ currentFeeding: e.target.value as any })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
              <option value="exclusive_breastfeeding">Exclusive Breastfeeding</option>
              <option value="mixed">Mixed</option>
              <option value="formula">Formula</option>
              <option value="complementary">Complementary</option>
              <option value="family_diet">Family Diet</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Breastfeeding Duration</label>
            <input type="text" placeholder="months or 'ongoing'" value={nutrition.breastfeedingDuration} onChange={e => setNutritionHistory({ breastfeedingDuration: e.target.value })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Formula Type</label>
            <input type="text" value={nutrition.formulaType} onChange={e => setNutritionHistory({ formulaType: e.target.value })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Complementary Foods Started (age in months)</label>
            <input type="text" value={nutrition.complementaryFoodsStarted} onChange={e => setNutritionHistory({ complementaryFoodsStarted: e.target.value })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Meals Per Day</label>
            <input type="number" value={nutrition.mealsPerDay || ''} onChange={e => setNutritionHistory({ mealsPerDay: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Appetite</label>
            <select value={nutrition.appetite} onChange={e => setNutritionHistory({ appetite: e.target.value as any })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Food Groups</span>
        <div className="flex flex-wrap gap-3">
          {FOOD_GROUP_OPTIONS.map(g => (
            <label key={g} className="flex items-center gap-1.5 text-xs text-[var(--text-primary)]">
              <input type="checkbox" checked={nutrition.foodGroups.includes(g)} onChange={() => toggleFoodGroup(g)}
                className="accent-teal-500" />
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Supplements & Concerns</span>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Supplements (comma separated)</label>
            <input type="text" value={nutrition.supplements.join(', ')} onChange={e => setNutritionHistory({ supplements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Feeding Difficulty</label>
            <textarea value={nutrition.feedingDifficulty} onChange={e => setNutritionHistory({ feedingDifficulty: e.target.value })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] min-h-[60px]" />
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
            <input type="checkbox" checked={nutrition.pica} onChange={e => setNutritionHistory({ pica: e.target.checked })}
              className="accent-teal-500" />
            Pica
          </label>
        </div>
      </div>
    </div>
  );
}
