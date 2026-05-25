'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, orderBy, doc, updateDoc, Timestamp,
} from 'firebase/firestore';
import { writeTimelineEvent } from '@/lib/firebaseTimeline';
import ARTICLES, { EducationArticle } from '@/src/data/education/content';
import { motivationalQuotes } from '@/src/data/education/motivationalQuotes';

interface EduLog {
  id?: string;
  patientId: string; doctorId: string; doctorName: string;
  resourceId: string; resourceTitle: string;
  status: 'sent' | 'viewed' | 'completed' | 'acknowledged';
  sentAt: Timestamp | any; viewedAt?: Timestamp | any;
}

interface PatientQuestion {
  id?: string;
  patientId: string; patientName: string;
  resourceId: string; resourceTitle: string;
  question: string; askedAt: Timestamp | any;
  answer?: string; answeredAt?: Timestamp | any; answeredBy?: string;
}

interface PatientStory {
  id?: string;
  patientId: string; patientName: string;
  story: string; sharedAt: Timestamp | any;
  doctorResponse?: string; respondedAt?: Timestamp | any;
}

const fmtDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDateTime = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const CONDITION_META: Record<string, { icon: string; label: string }> = {
  hypertension: { icon: '❤️', label: 'Hypertension & Heart Health' },
  diabetes: { icon: '🍬', label: 'Diabetes' },
  respiratory: { icon: '🫁', label: 'Respiratory (Asthma / COPD)' },
  cardiovascular: { icon: '💓', label: 'Cardiovascular Disease' },
  renal: { icon: '🫘', label: 'Chronic Kidney Disease' },
  hiv: { icon: '🔴', label: 'HIV & AIDS' },
  tb: { icon: '🫁', label: 'Tuberculosis' },
  'sickle-cell': { icon: '🩸', label: 'Sickle Cell Disease' },
  maternity: { icon: '🤰', label: 'Maternal & Child Health' },
  pediatric: { icon: '🧒', label: 'Pediatric Health' },
  'mental-health': { icon: '🧠', label: 'Mental Health' },
  oncology: { icon: '🩸', label: 'Cancer & Oncology' },
  'sexual-health': { icon: '🌍', label: 'Sexual Health & STIs' },
  immunization: { icon: '💉', label: 'Immunization & Vaccines' },
  general: { icon: '🏥', label: 'General Health & Wellness' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'Condition Basics': '📘', 'Lifestyle': '🌿', 'Nutrition': '🥗',
  'Self-Care': '🪞', 'Safety': '🛡️', 'Medications': '💊',
  'Treatment': '🏥', 'Prevention': '🛡️', 'Mental Health': '💙',
};

const CONDITION_ORDER = [
  'hypertension', 'diabetes', 'respiratory', 'cardiovascular', 'renal',
  'hiv', 'tb', 'sickle-cell', 'maternity', 'pediatric', 'mental-health',
  'oncology', 'sexual-health', 'immunization', 'general',
];

interface Props {
  patientId: string; doctorId: string; doctorName: string;
  compact?: boolean; patientName?: string;
}

export default function PatientEducation({ patientId, doctorId, doctorName, compact }: Props) {
  const [mode, setMode] = useState<'library' | 'sent' | 'questions' | 'stories'>('library');
  const [delivered, setDelivered] = useState<EduLog[]>([]);
  const [questions, setQuestions] = useState<PatientQuestion[]>([]);
  const [stories, setStories] = useState<PatientStory[]>([]);
  const [conditionFilter, setConditionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editArticle, setEditArticle] = useState<EducationArticle | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showQuote, setShowQuote] = useState(true);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [addingTopic, setAddingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicCondition, setNewTopicCondition] = useState('general');
  const [doctorNote, setDoctorNote] = useState('');

  const randomQuote = useMemo(() => {
    const qs = motivationalQuotes.filter(q => q.condition === conditionFilter || q.condition === 'general');
    return (qs.length > 0 ? qs : motivationalQuotes)[Math.floor(Math.random() * (qs.length || motivationalQuotes.length))];
  }, [conditionFilter]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'education_logs'), where('patientId', '==', patientId), orderBy('sentAt', 'desc')),
      snap => setDelivered(snap.docs.map(d => ({ id: d.id, ...d.data() } as EduLog))),
    );
    return () => unsub();
  }, [patientId]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'education_questions'), where('patientId', '==', patientId), orderBy('askedAt', 'desc')),
      snap => setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as PatientQuestion))),
    );
    return () => unsub();
  }, [patientId]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'education_stories'), where('patientId', '==', patientId), orderBy('sharedAt', 'desc')),
      snap => setStories(snap.docs.map(d => ({ id: d.id, ...d.data() } as PatientStory))),
    );
    return () => unsub();
  }, [patientId]);

  const sentMap = useMemo(() => {
    const map: Record<string, { count: number; lastSent: string; status: string }> = {};
    delivered.forEach(d => {
      if (d.resourceId) {
        if (!map[d.resourceId]) map[d.resourceId] = { count: 0, lastSent: '', status: d.status };
        map[d.resourceId].count++;
        map[d.resourceId].lastSent = fmtDate(d.sentAt);
        if (d.status === 'completed' || d.status === 'viewed') map[d.resourceId].status = d.status;
      }
    });
    return map;
  }, [delivered]);

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter(a => {
      if (conditionFilter !== 'all' && a.condition !== conditionFilter) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (levelFilter !== 'all' && a.literacyLevel !== levelFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [conditionFilter, categoryFilter, levelFilter, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, EducationArticle[]> = {};
    filteredArticles.forEach(a => {
      if (!groups[a.condition]) groups[a.condition] = [];
      groups[a.condition].push(a);
    });
    const ordered: [string, EducationArticle[]][] = [];
    CONDITION_ORDER.forEach(c => { if (groups[c]) ordered.push([c, groups[c]]); });
    Object.entries(groups).forEach(([k, v]) => { if (!CONDITION_ORDER.includes(k)) ordered.push([k, v]); });
    return ordered;
  }, [filteredArticles]);

  const allCategories = useMemo(() => [...new Set(ARTICLES.map(a => a.category))], []);
  const unreadQuestions = questions.filter(q => !q.answer).length;
  const unreadStories = stories.filter(s => !s.doctorResponse).length;

  const handleSend = useCallback(async (article: EducationArticle) => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        patientId, doctorId, doctorName,
        resourceId: article.id, resourceTitle: article.title,
        deliveryMethod: 'individual', status: 'sent',
        sentAt: serverTimestamp(),
        // Full content for patient to view
        title: article.title,
        content: article.content,
        summary: article.summary,
        keyPoints: article.keyPoints,
        category: article.category,
        condition: article.condition,
        literacyLevel: article.literacyLevel,
        readTimeMinutes: article.readTimeMinutes,
        icon: article.icon,
        tags: article.tags,
        references: article.references,
      };
      if (doctorNote.trim()) {
        payload.notes = doctorNote.trim();
        setDoctorNote('');
      }
      const ref = await addDoc(collection(db, 'education_logs'), payload);
      await writeTimelineEvent({
        patientId, type: 'education_delivered',
        title: `📖 Education Sent: ${article.title}`,
        description: article.summary,
        severity: 'success', createdBy: doctorId,
        linkedDocId: ref.id, linkedCollection: 'patient_education',
        metadata: { condition: article.condition, category: article.category },
      });
    } catch (e) { console.error('Send failed:', e); }
    setSaving(false);
  }, [patientId, doctorId, doctorName, doctorNote]);

  const handleEditSave = useCallback(async () => {
    if (!editArticle) return;
    const idx = ARTICLES.findIndex(a => a.id === editArticle.id);
    if (idx >= 0) {
      ARTICLES[idx] = { ...ARTICLES[idx], title: editTitle, content: editContent };
    }
    try {
      await addDoc(collection(db, 'education_logs'), {
        patientId, doctorId, doctorName,
        resourceId: editArticle.id,
        resourceTitle: editTitle,
        content: editContent,
        editedContent: true,
        sentAt: serverTimestamp(),
      });
    } catch (e) { console.error('Edit persist failed:', e); }
    setEditArticle(null);
  }, [editArticle, editTitle, editContent, patientId, doctorId, doctorName]);

  const handleAddTopic = useCallback(async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    const id = 'custom-' + Date.now();
    const article: EducationArticle = {
      id, title: newTopicTitle.trim(), summary: newTopicTitle.trim(),
      content: newTopicContent.trim(), keyPoints: [],
      category: 'Education', condition: newTopicCondition,
      literacyLevel: 'basic', readTimeMinutes: 5,
      tags: [newTopicCondition], icon: '📄',
    };
    ARTICLES.push(article);
    try {
      await addDoc(collection(db, 'education_logs'), {
        patientId, doctorId, doctorName,
        resourceId: id, resourceTitle: newTopicTitle.trim(),
        content: newTopicContent.trim(), customTopic: true,
        category: 'Education', condition: newTopicCondition,
        literacyLevel: 'basic', readTimeMinutes: 5,
        icon: '📄', tags: [newTopicCondition],
        sentAt: serverTimestamp(),
      });
    } catch (e) { console.error('Topic persist failed:', e); }
    setAddingTopic(false);
    setNewTopicTitle('');
    setNewTopicContent('');
    setPreviewId(id);
  }, [newTopicTitle, newTopicContent, newTopicCondition, patientId, doctorId, doctorName]);

  const handleAnswer = useCallback(async (q: PatientQuestion) => {
    if (!q.id || !answerText[q.id]?.trim()) return;
    try {
      await updateDoc(doc(db, 'education_questions', q.id), {
        answer: answerText[q.id], answeredAt: serverTimestamp(), answeredBy: doctorName,
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId: q.patientId, doctorId,
        title: '✍️ Your Question Answered',
        message: `Dr. ${doctorName} answered your question about "${q.resourceTitle}"`,
        type: 'education', read: false, createdAt: serverTimestamp(),
      });
      await writeTimelineEvent({
        patientId: q.patientId, type: 'education',
        title: `Answered patient question: ${q.resourceTitle}`,
        description: answerText[q.id],
        severity: 'success', createdBy: doctorId,
        linkedDocId: q.id, linkedCollection: 'education_questions',
        metadata: { resourceTitle: q.resourceTitle },
      });
      setAnswerText(prev => ({ ...prev, [q.id!]: '' }));
    } catch (e) { console.error('Answer failed:', e); }
  }, [answerText, doctorName, doctorId]);

  const handleRespond = useCallback(async (s: PatientStory) => {
    if (!s.id || !responseText[s.id]?.trim()) return;
    try {
      await updateDoc(doc(db, 'education_stories', s.id), {
        doctorResponse: responseText[s.id], respondedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId: s.patientId, doctorId,
        title: '💬 Doctor Responded to Your Story',
        message: `Dr. ${doctorName} responded to your health journey story`,
        type: 'education', read: false, createdAt: serverTimestamp(),
      });
      await writeTimelineEvent({
        patientId: s.patientId, type: 'education',
        title: 'Responded to patient story',
        description: responseText[s.id],
        severity: 'success', createdBy: doctorId,
        linkedDocId: s.id, linkedCollection: 'education_stories',
      });
      setResponseText(prev => ({ ...prev, [s.id!]: '' }));
    } catch (e) { console.error('Response failed:', e); }
  }, [responseText, doctorName, doctorId]);

  const totalArticles = ARTICLES.length;

  // ─── Styles ────────────────────────────────────────────────────────
  const styl = {
    tab: (active: boolean): React.CSSProperties => ({
      padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontSize: 12, fontWeight: 600, transition: 'all .12s',
      background: active ? 'var(--accent)' : 'var(--bg)',
      color: active ? '#fff' : 'var(--text-2)',
      position: 'relative' as const,
    }),
    chip: (active: boolean): React.CSSProperties => ({
      padding: '4px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
      fontSize: 11, fontWeight: 600, transition: 'all .12s',
      background: active ? 'var(--accent)' : 'var(--bg)',
      color: active ? '#fff' : 'var(--text-2)',
      whiteSpace: 'nowrap' as const,
    }),
    catChip: (active: boolean): React.CSSProperties => ({
      padding: '2px 10px', borderRadius: 99, border: '1px solid var(--border)',
      cursor: 'pointer', fontSize: 10, transition: 'all .12s',
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? '#fff' : 'var(--text-2)',
    }),
    input: {
      padding: '8px 12px', borderRadius: 10, border: '2px solid var(--border)',
      background: 'var(--bg)', fontSize: 13, outline: 'none',
    },
    card: (open: boolean): React.CSSProperties => ({
      borderRadius: 10, border: `1.5px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
      overflow: 'hidden', transition: 'all .15s', background: 'var(--card-bg, var(--surface))',
    }),
    previewBox: {
      padding: '0 14px 14px', animation: 'slideDown .2s ease',
    },
    previewInner: {
      borderRadius: 10, border: '2px solid var(--accent)', overflow: 'hidden',
      background: 'var(--surface)',
    },
    previewHeader: {
      padding: '10px 14px', background: 'var(--accent-dim)',
      borderBottom: '1px solid var(--accent)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    tag: {
      fontSize: 9, padding: '1px 8px', borderRadius: 99,
      background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)',
    },
    btnSm: {
      padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
      fontSize: 10, fontWeight: 600, border: 'none',
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12, fontFamily: 'system-ui, sans-serif' }}>
      {/* ═══ Mode Tabs ═══ */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
        <button style={styl.tab(mode === 'library')} onClick={() => setMode('library')}>
          📚 Library <span style={{ fontSize: 10, opacity: .7 }}>({totalArticles})</span>
        </button>
        <button style={styl.tab(mode === 'sent')} onClick={() => setMode('sent')}>
          📤 Sent ({delivered.length})
        </button>
        <button style={styl.tab(mode === 'questions')} onClick={() => setMode('questions')}>
          ❓ Questions {unreadQuestions > 0 &&
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: 99, padding: '0 6px', fontSize: 9, fontWeight: 700 }}>{unreadQuestions}</span>}
        </button>
        <button style={styl.tab(mode === 'stories')} onClick={() => setMode('stories')}>
          💬 Stories {unreadStories > 0 &&
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: 99, padding: '0 6px', fontSize: 9, fontWeight: 700 }}>{unreadStories}</span>}
        </button>
      </div>

      {/* ═══════════════════ LIBRARY MODE ═══════════════════ */}
      {mode === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Motivational Quote */}
          {showQuote && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'linear-gradient(135deg, #1e40af20, #3b82f610)',
              border: '1px solid #3b82f630', display: 'flex', gap: 10,
              alignItems: 'flex-start', position: 'relative',
            }}>
              <span style={{ fontSize: 20 }}>💪</span>
              <div style={{ flex: 1, fontSize: 12, fontStyle: 'italic', color: 'var(--text-1)', lineHeight: 1.5 }}>
                "{randomQuote.text}" <span style={{ fontSize: 10, color: 'var(--text-2)' }}>— {randomQuote.author}</span>
              </div>
              <button onClick={() => setShowQuote(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-2)', padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          )}

          {/* Search + Filters */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input placeholder="🔍 Search topics, keywords..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...styl.input, flex: 1 }} />
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
              style={{ ...styl.input, width: 120, cursor: 'pointer' }}>
              <option value="all">📋 All Levels</option>
              <option value="basic">📗 Basic</option>
              <option value="intermediate">📘 Intermediate</option>
              <option value="advanced">📙 Advanced</option>
            </select>
            <button onClick={() => setAddingTopic(true)}
              style={{ ...styl.btnSm, background: '#10b981', color: '#fff', padding: '8px 12px', whiteSpace: 'nowrap' }}>
              + New Topic
            </button>
          </div>

          {/* Condition filter chips */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button style={styl.chip(conditionFilter === 'all')} onClick={() => setConditionFilter('all')}>
              🏥 All
            </button>
            {CONDITION_ORDER.filter(c => ARTICLES.some(a => a.condition === c)).map(cond => (
              <button key={cond} style={styl.chip(conditionFilter === cond)} onClick={() => setConditionFilter(cond)}>
                {CONDITION_META[cond]?.icon || '📄'} {CONDITION_META[cond]?.label || cond}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600 }}>Category:</span>
            <button style={styl.catChip(categoryFilter === 'all')} onClick={() => setCategoryFilter('all')}>All</button>
            {allCategories.map(cat => (
              <button key={cat} style={styl.catChip(categoryFilter === cat)} onClick={() => setCategoryFilter(cat)}>
                {CATEGORY_ICONS[cat] || '📄'} {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
            Showing {filteredArticles.length} of {totalArticles} articles
            {search && ` matching "${search}"`}
            {conditionFilter !== 'all' && ` in ${CONDITION_META[conditionFilter]?.label || conditionFilter}`}
          </div>

          {/* ═══ Topic List ═══ */}
          <div style={{ maxHeight: compact ? 400 : 600, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
            {grouped.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-2)', fontSize: 13 }}>
                {search ? 'No topics match your search.' : 'No topics found.'}
              </div>
            ) : grouped.map(([condition, articles]) => (
              <div key={condition} style={styl.card(false)}>
                {/* Condition header */}
                <div style={{
                  padding: '8px 14px', background: 'var(--surface)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>{CONDITION_META[condition]?.icon || '📄'}</span>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{CONDITION_META[condition]?.label || condition}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-2)', background: 'var(--bg)', padding: '1px 8px', borderRadius: 99 }}>{articles.length}</span>
                </div>

                {/* Articles */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {articles.map((article, idx) => {
                    const open = previewId === article.id;
                    const sent = sentMap[article.id];
                    return (
                      <div key={article.id} style={{
                        borderBottom: '1px solid var(--border)',
                        background: open ? 'var(--accent-dim)' : 'transparent',
                      }}>
                        {/* Topic row */}
                        <div onClick={() => setPreviewId(open ? null : article.id)}
                          style={{
                            padding: '8px 14px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', gap: 10, transition: 'all .1s',
                            userSelect: 'none',
                          }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 6, background: 'var(--accent-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                          }}>{idx + 1}</div>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>{article.icon || '📄'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-1)' }}>{article.title}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {article.summary}
                            </div>
                            {/* Badge row */}
                            <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 }}>{article.category}</span>
                              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: '#f59e0b18', color: '#f59e0b', fontWeight: 600 }}>
                                {article.literacyLevel === 'basic' ? '📗 Basic' : article.literacyLevel === 'intermediate' ? '📘 Intermediate' : '📙 Advanced'}
                              </span>
                              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: 'var(--bg)', color: 'var(--text-2)' }}>⏱ {article.readTimeMinutes}m</span>
                              {/* Tags */}
                              {article.tags.slice(0, 2).map(t => (
                                <span key={t} style={{ fontSize: 8, color: 'var(--text-3)' }}>#{t}</span>
                              ))}
                              {/* Sent badge */}
                              {sent && (
                                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: '#10b98120', color: '#10b981', fontWeight: 600 }}>
                                  ✓ Sent {sent.count > 1 ? `(${sent.count})` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            {sent && (
                              <button onClick={e => { e.stopPropagation(); handleSend(article); }}
                                style={{ ...styl.btnSm, background: 'var(--accent)', color: '#fff', padding: '4px 10px' }}>
                                ↺ Resend
                              </button>
                            )}
                            <span style={{ fontSize: 11, color: 'var(--text-2)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : '' }}>▼</span>
                          </div>
                        </div>

                        {/* ═══ Preview Panel ═══ */}
                        {open && (
                          <div style={styl.previewBox}>
                            <div style={styl.previewInner}>
                              {/* Preview header */}
                              <div style={styl.previewHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 13 }}>👁️</span>
                                  <span style={{ fontWeight: 700, fontSize: 12 }}>Content Preview</span>
                                  {sent && (
                                    <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 99, background: '#10b98120', color: '#10b981', fontWeight: 600 }}>
                                      ✓ Previously sent {sent.lastSent}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={e => { e.stopPropagation(); setEditArticle(article); setEditTitle(article.title); setEditContent(article.content); }}
                                    style={{ ...styl.btnSm, border: '1px solid var(--accent)', background: '#fff', color: 'var(--accent)' }}>
                                    ✏️ Edit
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); handleSend(article); }} disabled={saving}
                                    style={{ ...styl.btnSm, background: 'var(--accent)', color: '#fff' }}>
                                    {saving ? '...' : sent ? '↺ Resend to Patient' : '📤 Send to Patient'}
                                  </button>
                                </div>
                              </div>

                              {/* Doctor's note input */}
                              <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                                <textarea
                                  value={doctorNote}
                                  onChange={e => setDoctorNote(e.target.value)}
                                  placeholder="✏️ Add a personal note to your patient (optional)..."
                                  rows={2}
                                  style={{
                                    width: '100%', padding: '6px 10px', borderRadius: 8,
                                    border: '1.5px solid var(--border)', fontSize: 11,
                                    fontFamily: 'inherit', background: 'var(--bg)',
                                    resize: 'vertical', lineHeight: 1.4,
                                  }}
                                />
                              </div>

                              {/* Content body */}
                              <div style={{ padding: '12px 14px', maxHeight: 400, overflowY: 'auto' }}>
                                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                                  {article.icon} {article.title}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8, lineHeight: 1.5 }}>
                                  {article.summary}
                                </div>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                                  {article.tags.map(t => (
                                    <span key={t} style={styl.tag}>#{t}</span>
                                  ))}
                                </div>
                                <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-1)', whiteSpace: 'pre-wrap' }}>
                                  {article.content}
                                </div>

                                {/* Key Points */}
                                {article.keyPoints?.length > 0 && (
                                  <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: '#10b98110', border: '1px solid #10b98130' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>📌 Key Points for Patient</div>
                                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>
                                      {article.keyPoints.map((kp, ki) => <li key={ki}>{kp}</li>)}
                                    </ul>
                                  </div>
                                )}

                                {/* References */}
                                {article.references && article.references.length > 0 && (
                                  <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-3)' }}>
                                    <span style={{ fontWeight: 600 }}>References:</span>
                                    {article.references.map((r, ri) => (
                                      <div key={ri} style={{ marginTop: 2 }}>{ri + 1}. {r}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════ SENT MODE ═══════════════════ */}
      {mode === 'sent' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {delivered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-2)', fontSize: 13 }}>
              No educational content has been sent to this patient yet.
            </div>
          ) : delivered.map((rec, i) => {
            const article = ARTICLES.find(a => a.id === rec.resourceId);
            return (
              <div key={rec.id} style={styl.card(false)}>
                <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', width: 20 }}>{i + 1}.</span>
                    <span style={{ fontSize: 16 }}>{article?.icon || '📄'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{rec.resourceTitle}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 99, fontWeight: 600,
                          background: rec.status === 'completed' ? '#10b98120' : rec.status === 'viewed' ? '#3b82f620' : '#f59e0b20',
                          color: rec.status === 'completed' ? '#10b981' : rec.status === 'viewed' ? '#3b82f6' : '#f59e0b',
                        }}>{rec.status}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{fmtDate(rec.sentAt)}</span>
                        {rec.viewedAt && <span style={{ fontSize: 10, color: 'var(--text-2)' }}>· Viewed {fmtDate(rec.viewedAt)}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {article && (
                      <>
                        <button onClick={() => setPreviewId(previewId === article.id ? null : article.id)}
                          style={{ ...styl.btnSm, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)' }}>
                          👁️ Preview
                        </button>
                        <button onClick={() => handleSend(article)} disabled={saving}
                          style={{ ...styl.btnSm, background: 'var(--accent)', color: '#fff' }}>
                          ↺ Resend
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {previewId === article?.id && article && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 250, overflowY: 'auto', color: 'var(--text-1)' }}>
                    {article.content.slice(0, 1000)}{article.content.length > 1000 ? '...' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════ QUESTIONS MODE ═══════════════════ */}
      {mode === 'questions' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-2)', fontSize: 13 }}>
              No questions from patient yet.
            </div>
          ) : questions.map((q, i) => (
            <div key={q.id} style={styl.card(false)}>
              <div style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{i + 1}.</span>
                    <span style={{ fontSize: 14 }}>❓</span>
                    <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-1)' }}>{q.patientName || 'Patient'}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{fmtDateTime(q.askedAt)}</span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>About: {q.resourceTitle}</span>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: 8, background: '#3b82f610', border: '1px solid #3b82f620', fontSize: 12, lineHeight: 1.5, color: 'var(--text-1)' }}>
                  "{q.question}"
                </div>
                {q.answer ? (
                  <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: '#10b98110', border: '1px solid #10b98130', fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>✅ Answered by {q.answeredBy}</div>
                    <div style={{ color: 'var(--text-1)' }}>{q.answer}</div>
                  </div>
                ) : (
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <input placeholder="Write your answer..." value={answerText[q.id!] || ''}
                      onChange={e => setAnswerText(prev => ({ ...prev, [q.id!]: e.target.value }))}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--accent)', fontSize: 12, background: 'var(--bg)' }} />
                    <button onClick={() => handleAnswer(q)}
                      style={{ ...styl.btnSm, background: 'var(--accent)', color: '#fff', padding: '6px 14px' }}>
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════ STORIES MODE ═══════════════════ */}
      {mode === 'stories' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-2)', fontSize: 13 }}>
              No stories shared by this patient yet.
            </div>
          ) : stories.map((story, i) => (
            <div key={story.id} style={{ ...styl.card(false), borderColor: '#8b5cf640' }}>
              <div style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{i + 1}.</span>
                    <span style={{ fontSize: 14 }}>💬</span>
                    <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-1)' }}>{story.patientName || 'Patient'}'s Story</span>
                    <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{fmtDateTime(story.sharedAt)}</span>
                  </div>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: 8, background: '#f59e0b10', border: '1px solid #f59e0b20', fontSize: 12, lineHeight: 1.5, color: 'var(--text-1)' }}>
                  "{story.story}"
                </div>
                {story.doctorResponse ? (
                  <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: '#8b5cf610', border: '1px solid #8b5cf620', fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: '#8b5cf6', marginBottom: 4 }}>💜 Your Response</div>
                    <div style={{ color: 'var(--text-1)' }}>{story.doctorResponse}</div>
                  </div>
                ) : (
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <input placeholder="Respond to your patient's story..." value={responseText[story.id!] || ''}
                      onChange={e => setResponseText(prev => ({ ...prev, [story.id!]: e.target.value }))}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1.5px solid #8b5cf6', fontSize: 12, background: 'var(--bg)' }} />
                    <button onClick={() => handleRespond(story)}
                      style={{ ...styl.btnSm, background: '#8b5cf6', color: '#fff', padding: '6px 14px' }}>
                      Respond 💜
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Edit Modal ═══ */}
      {editArticle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, maxWidth: 700, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>✏️ Edit Content — {editArticle.title}</span>
              <button onClick={() => setEditArticle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-2)' }}>✕</button>
            </div>
            <div style={{ padding: '14px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Title</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: 13, background: 'var(--bg)' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Content</label>
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                  style={{ width: '100%', minHeight: 300, padding: '10px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: 12, lineHeight: 1.7, fontFamily: 'monospace', background: 'var(--bg)', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEditArticle(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, background: 'transparent' }}>Cancel</button>
              <button onClick={handleEditSave}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: 'var(--accent)', color: '#fff' }}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Add Topic Modal ═══ */}
      {addingTopic && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>➕ Add New Educational Topic</span>
              <button onClick={() => setAddingTopic(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-2)' }}>✕</button>
            </div>
            <div style={{ padding: '14px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Condition</label>
                <select value={newTopicCondition} onChange={e => setNewTopicCondition(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: 13, background: 'var(--bg)', cursor: 'pointer' }}>
                  {CONDITION_ORDER.map(c => (
                    <option key={c} value={c}>{CONDITION_META[c]?.icon} {CONDITION_META[c]?.label || c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Title</label>
                <input value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)}
                  placeholder="e.g., Understanding Your Medication"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: 13, background: 'var(--bg)' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Content</label>
                <textarea value={newTopicContent} onChange={e => setNewTopicContent(e.target.value)}
                  placeholder="Write your educational content here..."
                  style={{ width: '100%', minHeight: 200, padding: '10px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: 12, lineHeight: 1.7, fontFamily: 'monospace', background: 'var(--bg)', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setAddingTopic(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, background: 'transparent' }}>Cancel</button>
              <button onClick={handleAddTopic} disabled={!newTopicTitle.trim() || !newTopicContent.trim()}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: '#10b981', color: '#fff', opacity: (!newTopicTitle.trim() || !newTopicContent.trim()) ? .5 : 1 }}>
                ➕ Add Topic
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 2000px; } }
      `}</style>
    </div>
  );
}
