'use client';

interface Investigation {
  name: string;
  category: 'bedside' | 'lab' | 'imaging';
  priority: 'urgent' | 'routine' | 'if_uncertain';
  rationale?: string;
}

interface InvestigationOrderProps {
  investigations: Investigation[];
  orderedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
}

const CATEGORY_ICONS = { bedside: '🩺', lab: '🧪', imaging: '📡' };
const PRIORITY_COLORS = { urgent: '#FF4560', routine: '#06B6D4', if_uncertain: '#FFB020' };

export default function InvestigationOrder({ investigations, orderedIds, onToggle, className = '' }: InvestigationOrderProps) {
  const categories = ['bedside', 'lab', 'imaging'] as const;

  return (
    <div className={`frost-card p-4 flex flex-col gap-4 ${className}`}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Investigations</div>

      {categories.map(cat => {
        const items = investigations.filter(i => i.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat === 'bedside' ? 'Bedside' : cat === 'lab' ? 'Laboratory' : 'Imaging'}
            </div>
            <div className="flex flex-col gap-1">
              {items.map((inv, i) => {
                const ordered = orderedIds.includes(inv.name);
                return (
                  <label
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 6,
                      background: ordered ? 'rgba(0,214,143,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${ordered ? 'rgba(0,214,143,0.15)' : 'rgba(255,255,255,0.04)'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={ordered}
                      onChange={() => onToggle(inv.name)}
                      style={{ accentColor: '#00D68F' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#E2E8F0' }}>{inv.name}</div>
                      {inv.rationale && (
                        <div style={{ fontSize: 10, color: '#64748B', lineHeight: 1.4 }}>{inv.rationale}</div>
                      )}
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                      background: `${PRIORITY_COLORS[inv.priority]}15`,
                      color: PRIORITY_COLORS[inv.priority],
                      whiteSpace: 'nowrap',
                    }}>
                      {inv.priority === 'if_uncertain' ? 'IF UNCERTAIN' : inv.priority.toUpperCase()}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
