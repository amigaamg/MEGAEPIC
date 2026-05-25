'use client';

import { useState, useMemo } from 'react';
import ARTICLES, { getArticlesByCondition, searchArticles, getArticle } from '@/src/data/education';

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const LEVEL_COLORS: Record<string, string> = {
  basic: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#6366f1',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Condition Basics': '📖',
  'Lifestyle': '🏃',
  'Nutrition': '🥗',
  'Medications': '💊',
  'Self-Care': '🧘',
  'Safety': '🛡️',
  'Mental Health': '💙',
};

export default function EducationPanel({
  patientId,
  condition,
  educationLogs,
}: {
  patientId: string;
  condition?: string;
  educationLogs?: any[];
}) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('All');
  const [showLibrary, setShowLibrary] = useState(true);

  const libraryArticles = useMemo(() => {
    let articles = condition
      ? getArticlesByCondition(condition)
      : ARTICLES;
    if (filterCat !== 'All') {
      articles = articles.filter(a => a.category === filterCat);
    }
    if (search.trim()) {
      articles = searchArticles(search.trim());
    }
    return articles;
  }, [condition, filterCat, search]);

  const categories = useMemo(() => {
    const cats = new Set(ARTICLES.map(a => a.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const doctorSent = useMemo(() => {
    return (educationLogs || []).filter((e: any) => e.topic || e.title || e.resourceTitle);
  }, [educationLogs]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev === id ? null : id);
  };

  const renderArticle = (article: typeof ARTICLES[0], source: 'library' | 'doctor' = 'library', logEntry?: any) => {
    const isOpen = expanded === article.id;
    const levelColor = LEVEL_COLORS[article.literacyLevel] || '#64748b';
    return (
      <div key={article.id} className="edu-card" style={{
        background: isOpen ? 'var(--bg)' : 'var(--surface)',
        border: isOpen ? '2px solid var(--accent)' : '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s',
      }}>
        <div
          onClick={() => toggleExpand(article.id)}
          style={{ padding: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{article.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>
                  {source === 'doctor' && logEntry ? (logEntry.topic || logEntry.title || logEntry.resourceTitle) : article.title}
                </div>
                {source === 'library' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: '#f0f9ff', color: '#0369a1' }}>
                      {CATEGORY_ICONS[article.category] || '📌'} {article.category}
                    </span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: levelColor + '18', color: levelColor }}>
                      {article.readTimeMinutes} min read
                    </span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: '#f8fafc', color: '#64748b' }}>
                      {article.literacyLevel}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
              ▼
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.4 }}>
            {source === 'doctor' && logEntry ? (
              <>
                Sent by Dr. {logEntry.doctorName || logEntry.sentByName || 'Your Doctor'}
                {logEntry.sentAt && <> · {fmtDate(logEntry.sentAt)}</>}
                {logEntry.notes && <><br />📝 {logEntry.notes}</>}
              </>
            ) : (
              article.summary
            )}
          </p>
        </div>
        {isOpen && source === 'library' && (
          <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {article.content.split('\n').map((line, i) => {
                if (line.startsWith('WHAT') || line.startsWith('WHY') || line.startsWith('HOW') || line.startsWith('THE ') || line.startsWith('TARGET') || line.startsWith('SAMPLE') || line.startsWith('START') || line.startsWith('CREATE') || line.startsWith('WIND') || line.startsWith('DO NOT') || line.startsWith('GO TO') || line.startsWith('KNOW') || line.startsWith('KEEP') || line.startsWith('BEFORE') || line.startsWith('DURING') || line.startsWith('CORRECT') || line.startsWith('COMMON') || line.startsWith('TIPS') || line.startsWith('WARNING') || line.startsWith('YOUR') || line.startsWith('EAT') || line.startsWith('REDUCE') || line.startsWith('COOK') || line.startsWith('FOOD') || line.startsWith('SLEEP') || line.startsWith('IF YOU') || line.startsWith('MORNING') || line.startsWith('AFTER') || line.startsWith('HOW MUCH') || line.startsWith('HOW OFTEN') || line.startsWith('QUICK') || line.startsWith('HOW LONG') || line.startsWith('WHEN TO') || line.startsWith('ATTEND') || line.startsWith('VACCINATION') || line.startsWith('NUTRITION') || line.startsWith('DISCLOSURE') || line.startsWith('TREATMENT') || line.startsWith('HIV IS NOT') || line.startsWith('STAGES') || line.startsWith('DIET') || line.startsWith('MEDICATIONS') || line.startsWith('SUPPORTING') || line.startsWith('CRISIS') || line.startsWith('THE 5') || line.startsWith('MISSED') || line.startsWith('STORING') || line.startsWith('WITHDRAWAL') || line.startsWith('CRAVINGS') || line.startsWith('SUPPORT') || line.startsWith('METHOD') || line.startsWith('HEALTH') || line.startsWith('THE BASICS') || line.startsWith('SMART') || line.startsWith('WATER')) {
                  return <div key={i} style={{ fontWeight: 700, fontSize: 14, marginTop: 14, marginBottom: 6, color: 'var(--accent)' }}>{line}</div>;
                }
                if (line.startsWith('•') || line.startsWith('-')) {
                  return <div key={i} style={{ paddingLeft: 16, marginBottom: 2, fontSize: 13 }}>{line}</div>;
                }
                if (line.startsWith('✓') || line.startsWith('☐')) {
                  return <div key={i} style={{ paddingLeft: 16, marginBottom: 2, fontSize: 13, color: '#10b981' }}>{line}</div>;
                }
                if (line.startsWith('✗')) {
                  return <div key={i} style={{ paddingLeft: 16, marginBottom: 2, fontSize: 13, color: '#ef4444' }}>{line}</div>;
                }
                if (line.match(/^\d+\./)) {
                  return <div key={i} style={{ paddingLeft: 16, marginBottom: 4, fontSize: 13, fontWeight: 600 }}>{line}</div>;
                }
                if (line.trim() === '') {
                  return <div key={i} style={{ height: 6 }} />;
                }
                return <div key={i} style={{ marginBottom: 2, fontSize: 13 }}>{line}</div>;
              })}
            </div>
            {article.keyPoints.length > 0 && (
              <div style={{ marginTop: 14, padding: 12, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#166534', marginBottom: 8 }}>✅ KEY TAKEAWAYS</div>
                {article.keyPoints.map((kp, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#166534', marginBottom: 4 }}>
                    <span>•</span>
                    <span>{kp}</span>
                  </div>
                ))}
              </div>
            )}
            {article.references && article.references.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 10, color: '#94a3b8' }}>
                References: {article.references.join(', ')}
              </div>
            )}
          </div>
        )}
        {isOpen && source === 'doctor' && logEntry && (
          <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              {logEntry.content || logEntry.topic || logEntry.title || logEntry.resourceTitle}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {doctorSent.length > 0 && (
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-title">📨 Sent by Your Doctor</div>
            <span className="count-badge">{doctorSent.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doctorSent.map((log: any, i: number) => {
              const topic = log.topic || log.title || log.resourceTitle;
              const matchedArticle = topic ? ARTICLES.find(a =>
                a.title.toLowerCase().includes(topic.toLowerCase()) ||
                topic.toLowerCase().includes(a.title.toLowerCase()) ||
                a.tags.some(t => topic.toLowerCase().includes(t.toLowerCase()))
              ) : undefined;
              const article = matchedArticle || {
                id: log.id || `log-${i}`,
                title: topic || 'Health Education',
                summary: log.notes || `Sent by Dr. ${log.doctorName || log.sentByName || 'Your Doctor'}`,
                content: log.content || log.topic || log.title || log.resourceTitle || '',
                keyPoints: [],
                category: 'Doctor-Sent',
                condition: condition || 'general',
                literacyLevel: 'basic' as const,
                readTimeMinutes: 3,
                tags: [],
                icon: '📚',
              };
              return renderArticle(article, 'doctor', log);
            })}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">
            📚 Health Education Library
            {condition && <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.7 }}>— {condition}</span>}
          </div>
          {condition && <span className="count-badge">{libraryArticles.length}</span>}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            className="field-inp"
            style={{ flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
            placeholder="🔍 Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}
              style={{ fontSize: 11, padding: '4px 10px' }}
            >
              {cat === 'All' ? '📋 All' : `${CATEGORY_ICONS[cat] || '📌'} ${cat}`}
            </button>
          ))}
        </div>

        {libraryArticles.length === 0 ? (
          <div className="empty-sm">
            <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
            <p style={{ fontWeight: 600, fontSize: 14 }}>No articles found</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              {search ? 'Try a different search term.' : `Personalized articles for ${condition || 'your health'} will appear here.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {libraryArticles.map(article => renderArticle(article, 'library'))}
          </div>
        )}
      </div>
    </div>
  );
}
