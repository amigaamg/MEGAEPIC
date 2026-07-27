'use client';
import { useState, useMemo } from 'react';
import { RuleEngine } from '@/lib/amexan/rules';
import type { RuleDefinition, RuleType, RuleContext, RuleEvaluationResult } from '@/lib/amexan/rules';
import { ALL_RULES } from '@/lib/amexan/rules';

const RULE_TYPE_COLORS: Record<RuleType, string> = {
  data: '#10B981',
  ui: '#3B82F6',
  clinical: '#8B5CF6',
  workflow: '#F59E0B',
  notification: '#EF4444',
  security: '#6366F1',
};

const RULE_TYPE_LABELS: Record<RuleType, string> = {
  data: 'Data Validation',
  ui: 'UI Visibility',
  clinical: 'Clinical Decision',
  workflow: 'Workflow',
  notification: 'Notification',
  security: 'Security',
};

const DEFAULT_CONTEXT: RuleContext = {
  patient: { age: 35, ageGroup: 'adult', gender: 'female', pregnant: false, weight: 70 },
  encounter: { type: 'outpatient', phase: 'history', department: 'general' },
  symptoms: { cough: { active: true, productive: true, duration_days: 5, fever: true, hemoptysis: false } },
  vitals: { pulse: 88, temperature: 38.2, systolicBP: 125, diastolicBP: 80, oxygenSaturation: 97, weight: 70, height: 165 },
  environment: { resourceLimited: false, icu: false },
};

export function RulesViewer() {
  const [typeFilter, setTypeFilter] = useState<RuleType | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [testContext, setTestContext] = useState<string>(JSON.stringify(DEFAULT_CONTEXT, null, 2));
  const [evalResults, setEvalResults] = useState<RuleEvaluationResult[] | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);

  const engine = useMemo(() => new RuleEngine(ALL_RULES), []);

  const domains = useMemo(() => {
    const d = new Set(ALL_RULES.map(r => r.domain).filter(Boolean));
    return Array.from(d) as string[];
  }, []);

  const filtered = useMemo(() => {
    return ALL_RULES.filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (domainFilter !== 'all' && r.domain !== domainFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [typeFilter, domainFilter, search]);

  const handleEvaluate = () => {
    try {
      setContextError(null);
      const context: RuleContext = JSON.parse(testContext);
      const results = engine.evaluate(context);
      setEvalResults(results);
    } catch {
      setContextError('Invalid JSON in context');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Rule Engine Test Console
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Context (JSON)</div>
            <textarea
              className="input font-mono"
              value={testContext}
              onChange={e => setTestContext(e.target.value)}
              rows={12}
              style={{ fontSize: 10, lineHeight: '1.5' }}
            />
            {contextError && (
              <div className="text-[10px]" style={{ color: 'var(--red)' }}>{contextError}</div>
            )}
            <button
              className="btn-primary self-start"
              onClick={handleEvaluate}
              style={{ fontSize: 11, padding: '6px 16px' }}
            >
              Evaluate Rules
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Results ({evalResults?.length || 0} rules evaluated)</div>
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 350 }}>
              {evalResults === null ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click "Evaluate Rules" to test</div>
                </div>
              ) : evalResults.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>No rules matched this context</div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {evalResults.map(r => (
                    <div
                      key={r.ruleId}
                      className="flex items-start gap-2 p-2 rounded"
                      style={{ background: r.matched ? 'var(--sky-50)' : 'transparent', borderLeft: r.matched ? '3px solid var(--primary)' : '3px solid transparent' }}
                    >
                      <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ background: RULE_TYPE_COLORS[r.ruleType] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{r.ruleName}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: r.matched ? 'var(--green-bg)' : 'var(--surface-elevated)', color: r.matched ? 'var(--green)' : 'var(--text-muted)' }}>
                            {r.matched ? 'MATCHED' : 'SKIPPED'}
                          </span>
                        </div>
                        <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          {r.ruleId} · {RULE_TYPE_LABELS[r.ruleType]} · priority {r.priority}
                        </div>
                        {r.matched && r.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.actions.map((a, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-elevated)', color: a.severity === 'critical' ? 'var(--red)' : a.severity === 'warning' ? 'var(--amber)' : 'var(--text-secondary)' }}>
                                {a.type}: {a.target}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="Search rules..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value as RuleType | 'all')}>
          <option value="all">All Types</option>
          {Object.entries(RULE_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select className="input w-auto" value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
          <option value="all">All Domains</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{filtered.length} rules</span>
      </div>

      <div className="flex flex-col gap-1">
        {filtered.map(rule => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-6 text-center">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No rules match your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

function RuleCard({ rule }: { rule: RuleDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const color = RULE_TYPE_COLORS[rule.type];

  return (
    <div
      className="card cursor-pointer transition-colors"
      onClick={() => setExpanded(!expanded)}
      style={{ opacity: rule.active ? 1 : 0.5 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{rule.name}</span>
            {rule.domain && (
              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>
                {rule.domain}
              </span>
            )}
            {!rule.active && (
              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
                INACTIVE
              </span>
            )}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {rule.id} · {RULE_TYPE_LABELS[rule.type]} · priority {rule.priority}
          </div>
          {expanded && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rule.description}</p>

              {rule.contexts.length > 0 && (
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Context</div>
                  <div className="flex flex-wrap gap-1">
                    {rule.contexts.map((c, i) => (
                      <ConditionBadge key={i} fact={c.fact} operator={c.operator} value={c.value} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Conditions</div>
                <div className="flex flex-wrap gap-1">
                  {rule.conditions.length === 0 ? (
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Always applies</span>
                  ) : (
                    rule.conditions.map((c, i) => (
                      <ConditionBadge key={i} fact={c.fact} operator={c.operator} value={c.value} />
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Actions</div>
                <div className="flex flex-wrap gap-1">
                  {rule.actions.map((a, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-elevated)', color: a.severity === 'critical' ? 'var(--red)' : a.severity === 'warning' ? 'var(--amber)' : 'var(--text-secondary)' }}>
                      {a.type}: {a.target}
                    </span>
                  ))}
                </div>
              </div>

              {rule.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {rule.tags.map(t => (
                    <span key={t} className="text-[9px]" style={{ color: 'var(--text-muted)' }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>
    </div>
  );
}

function ConditionBadge({ fact, operator, value }: { fact: string; operator: string; value?: unknown }) {
  const displayVal = value !== undefined ? (Array.isArray(value) ? `[${value.join(', ')}]` : String(value)) : '';
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--surface-elevated)', color: 'var(--sky-600)' }}>
      {fact} {operator} {displayVal}
    </span>
  );
}
