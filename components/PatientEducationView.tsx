'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { motivationalQuotes } from '@/src/data/education/motivationalQuotes';

interface Props {
  patient: any;
  educationLogs: any[];
  fullLogs: any[];
  searchArticles: (query: string) => any[];
}

export default function PatientEducationView({ patient, educationLogs, fullLogs, searchArticles }: Props) {
  const [expandedEdu, setExpandedEdu] = useState<string | null>(null);
  const [eduTab, setEduTab] = useState<'received' | 'questions' | 'stories'>('received');
  const [questionInput, setQuestionInput] = useState<Record<string, string>>({});
  const [storyInput, setStoryInput] = useState('');
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [sendingQ, setSendingQ] = useState(false);
  const [sendingStory, setSendingStory] = useState(false);
  const [eduQuestions, setEduQuestions] = useState<any[]>([]);
  const [eduStories, setEduStories] = useState<any[]>([]);
  const [showMotivation, setShowMotivation] = useState(true);

  const randomQuote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);

  useEffect(() => {
    if (!patient) return;
    const unsub = onSnapshot(
      query(collection(db, 'education_questions'), where('patientId', '==', patient.uid), orderBy('askedAt', 'desc')),
      snap => setEduQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    );
    return () => unsub();
  }, [patient]);

  useEffect(() => {
    if (!patient) return;
    const unsub = onSnapshot(
      query(collection(db, 'education_stories'), where('patientId', '==', patient.uid), orderBy('sharedAt', 'desc')),
      snap => setEduStories(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    );
    return () => unsub();
  }, [patient]);

  const handleAskQuestion = async (log: any) => {
    const q = questionInput[log.id]?.trim();
    if (!q) return;
    setSendingQ(true);
    try {
      await addDoc(collection(db, 'education_questions'), {
        patientId: patient.uid,
        patientName: patient.name || 'Patient',
        resourceId: log.resourceId || log.id,
        resourceTitle: log.topic || log.title || log.resourceTitle || 'Educational Content',
        question: q,
        askedAt: serverTimestamp(),
        doctorId: log.doctorId || '',
        doctorName: log.doctorName || log.sentByName || 'Doctor',
      });
      setQuestionInput((prev: any) => ({ ...prev, [log.id]: '' }));
    } catch (e) { console.error('Failed to send question:', e); }
    setSendingQ(false);
  };

  const handleShareStory = async () => {
    if (!storyInput.trim()) return;
    setSendingStory(true);
    try {
      await addDoc(collection(db, 'education_stories'), {
        patientId: patient.uid,
        patientName: patient.name || 'Patient',
        story: storyInput.trim(),
        sharedAt: serverTimestamp(),
        doctorId: '',
        doctorName: '',
        isPublic: false,
      });
      setStoryInput('');
      setShowStoryForm(false);
    } catch (e) { console.error('Failed to share story:', e); }
    setSendingStory(false);
  };

  const unreadCount = fullLogs.filter((e: any) => !e.read).length;

  return (
    <div className="panel" style={{ maxWidth: 'none', width: '100%' }}>
      {/* Header with tabs */}
      <div className="panel-hd" style={{ borderBottom: 'none', paddingBottom: 4 }}>
        <span className="panel-title">📚 Education & Engagement</span>
        <span className="count-badge">{educationLogs.length}</span>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setEduTab('received')}
          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: eduTab === 'received' ? 'var(--accent)' : 'var(--bg)', color: eduTab === 'received' ? '#fff' : 'var(--text-2)', transition: 'all .12s' }}>
          📖 Received ({educationLogs.length}) {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '0 6px', fontSize: 9, marginLeft: 4 }}>{unreadCount} new</span>}
        </button>
        <button onClick={() => setEduTab('questions')}
          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: eduTab === 'questions' ? 'var(--accent)' : 'var(--bg)', color: eduTab === 'questions' ? '#fff' : 'var(--text-2)', transition: 'all .12s' }}>
          ❓ My Questions ({eduQuestions.length})
        </button>
        <button onClick={() => setEduTab('stories')}
          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: eduTab === 'stories' ? 'var(--accent)' : 'var(--bg)', color: eduTab === 'stories' ? '#fff' : 'var(--text-2)', transition: 'all .12s' }}>
          💬 My Journey ({eduStories.length})
        </button>
      </div>

      {/* Motivational quote */}
      {showMotivation && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf620, #6366f110)', border: '1px solid #8b5cf630', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10, position: 'relative' }}>
          <span style={{ fontSize: 24 }}>💪</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-1)', lineHeight: 1.5 }}>"{randomQuote.text}"</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>— {randomQuote.author}</div>
          </div>
          <button onClick={() => setShowMotivation(false)} style={{ position: 'absolute', top: 6, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-2)' }}>✕</button>
        </div>
      )}

      {/* ═════════════════════ RECEIVED CONTENT ═════════════════════ */}
      {eduTab === 'received' && (
        <>
          {educationLogs.length === 0 ? (
            <div className="empty-sm" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>No education materials yet</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Your doctor will send health education tailored to your condition.</p>
            </div>
          ) : (
            <div className="rxh-grid" style={{ background: 'transparent', gap: 8 }}>
              {educationLogs.map((log: any) => {
                const isOpen = expandedEdu === log.id;
                const topic = log.topic || log.title || log.resourceTitle || '';
                const date = log.sentAt?.toDate ? log.sentAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                const matched = topic ? searchArticles(topic) : [];
                const article = log.content ? null : matched[0];
                const fullContent = log.content || article?.content || '';
                const keyPoints = log.keyPoints || article?.keyPoints || [];
                const icon = log.icon || article?.icon || '📚';
                const literacyLevel = log.literacyLevel || article?.literacyLevel || 'basic';
                const readTime = log.readTimeMinutes || article?.readTimeMinutes || 0;
                const category = log.category || article?.category || '';
                const levelColor = literacyLevel === 'basic' ? '#10b981' : literacyLevel === 'intermediate' ? '#f59e0b' : '#6366f1';

                const hasQuestion = eduQuestions.find((q: any) => q.resourceId === (log.resourceId || log.id));

                return (
                  <div key={log.id}
                    style={{
                      borderRadius: 12, border: `2px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
                      overflow: 'hidden', transition: 'all .2s', background: 'var(--card-bg)',
                    }}>
                    {/* Card header */}
                    <div onClick={() => setExpandedEdu(isOpen ? null : log.id)}
                      style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{topic}</div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                            {category && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: '#f0f9ff', color: '#0369a1' }}>{category}</span>}
                            {readTime > 0 && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: levelColor + '18', color: levelColor }}>{readTime} min</span>}
                            {!log.read && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: 'rgba(255,69,96,.12)', color: '#ff4560', fontWeight: 700 }}>NEW</span>}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--accent3)', fontWeight: 600, marginTop: 2 }}>
                            👨‍⚕️ Dr. {log.doctorName || log.sentByName || 'Your Doctor'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{date}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>▼</span>
                      </div>
                    </div>

                    {/* Doctor's note */}
                    {log.notes && (
                      <div style={{ padding: '0 14px 8px' }}>
                        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>📝 {log.notes}</p>
                      </div>
                    )}

                    {/* Expanded content */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        <div style={{ padding: '12px 14px' }}>
                          {fullContent ? (
                            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                              {fullContent.split('\n').map((line: string, li: number) => {
                                if (line.trim() === '') return <div key={li} style={{ height: 5 }} />;
                                if (line.startsWith('WHAT') || line.startsWith('WHY') || line.startsWith('HOW') || line.startsWith('THE') || line.startsWith('TARGET') || line.startsWith('SAMPLE') || line.startsWith('START') || line.startsWith('CREATE') || line.startsWith('WIND') || line.startsWith('DO NOT') || line.startsWith('WARNING') || line.startsWith('REMEMBER') || line.startsWith('TIPS') || line.startsWith('KEY POINTS') || line.startsWith('STEPS') || line.startsWith('WHEN') || line.startsWith('WHERE') || line.startsWith('WHO'))
                                  return <div key={li} style={{ fontWeight: 700, fontSize: 13, marginTop: 12, marginBottom: 4, color: 'var(--accent)' }}>{line}</div>;
                                if (line.startsWith('•') || line.startsWith('-') || line.startsWith('✓') || line.startsWith('☐'))
                                  return <div key={li} style={{ paddingLeft: 14, marginBottom: 2, fontSize: 12.5 }}>{line}</div>;
                                if (line.match(/^\d+\./))
                                  return <div key={li} style={{ paddingLeft: 14, marginBottom: 3, fontSize: 12.5, fontWeight: 600 }}>{line}</div>;
                                return <div key={li} style={{ marginBottom: 2, fontSize: 12.5 }}>{line}</div>;
                              })}
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 12 }}>
                              Select a topic above to view its content.
                            </div>
                          )}

                          {/* Key points */}
                          {keyPoints.length > 0 && (
                            <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,214,143,.08)', borderRadius: 10, border: '1px solid rgba(0,214,143,.2)' }}>
                              <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--green)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>✅ Key Takeaways</div>
                              {keyPoints.map((kp: string, ki: number) => (
                                <div key={ki} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 3, display: 'flex', gap: 5 }}>
                                  <span style={{ color: 'var(--green)' }}>•</span><span>{kp}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Ask a question about this content */}
                          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#3b82f608', border: '1px solid #3b82f620' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', marginBottom: 6 }}>❓ Have a question about this topic?</div>
                            {hasQuestion && hasQuestion.answer ? (
                              <div style={{ padding: '8px 10px', borderRadius: 8, background: '#10b98110', border: '1px solid #10b98130', fontSize: 12 }}>
                                <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>✅ Your doctor answered:</div>
                                <div style={{ color: 'var(--text-1)' }}>{hasQuestion.answer}</div>
                              </div>
                            ) : hasQuestion && !hasQuestion.answer ? (
                              <div style={{ fontSize: 12, color: '#f59e0b', fontStyle: 'italic' }}>⏳ You asked a question — waiting for doctor's response.</div>
                            ) : (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <input value={questionInput[log.id] || ''}
                                  onChange={e => setQuestionInput((prev: any) => ({ ...prev, [log.id]: e.target.value }))}
                                  placeholder="Type your question here..."
                                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #3b82f640', fontSize: 12, background: 'var(--bg)' }} />
                                <button onClick={() => handleAskQuestion(log)} disabled={sendingQ || !questionInput[log.id]?.trim()}
                                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, opacity: sendingQ || !questionInput[log.id]?.trim() ? .5 : 1 }}>
                                  {sendingQ ? '...' : 'Ask'}
                                </button>
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
          )}
        </>
      )}

      {/* ═════════════════════ MY QUESTIONS ═════════════════════ */}
      {eduTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {eduQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>❓</div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>No questions yet</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Open an education topic and ask your doctor a question.</p>
            </div>
          ) : (
            eduQuestions.map((q: any, i: number) => {
              const date = q.askedAt?.toDate ? q.askedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={q.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--accent3)' }}>📄 About: {q.resourceTitle || 'Education Content'}</div>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{date}</span>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: 8, background: '#3b82f610', border: '1px solid #3b82f620', fontSize: 12, lineHeight: 1.5, color: 'var(--text-1)' }}>
                    "{q.question}"
                  </div>
                  {q.answer ? (
                    <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: '#10b98110', border: '1px solid #10b98130', fontSize: 12, lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>✅ Dr. {q.answeredBy || q.doctorName || 'Your Doctor'} replied:</div>
                      <div style={{ color: 'var(--text-1)' }}>{q.answer}</div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#f59e0b', fontStyle: 'italic' }}>
                      ⏳ Waiting for your doctor to respond...
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═════════════════════ MY JOURNEY ═════════════════════ */}
      {eduTab === 'stories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Share story button */}
          {!showStoryForm && (
            <button onClick={() => setShowStoryForm(true)}
              style={{ padding: '10px 16px', borderRadius: 10, border: '2px dashed #8b5cf6', background: '#8b5cf608', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#8b5cf6', transition: 'all .12s', width: '100%' }}>
              💜 Share Your Health Journey
            </button>
          )}

          {/* Story form */}
          {showStoryForm && (
            <div style={{ padding: 14, borderRadius: 10, border: '2px solid #8b5cf6', background: '#8b5cf608' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#8b5cf6', marginBottom: 8 }}>💜 Your Story Can Inspire Others</div>
              <textarea value={storyInput} onChange={e => setStoryInput(e.target.value)}
                placeholder="Share your health journey — your challenges, your victories, what keeps you going..."
                style={{ width: '100%', minHeight: 100, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #8b5cf640', fontSize: 12, lineHeight: 1.6, fontFamily: 'inherit', background: 'var(--bg)', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button onClick={handleShareStory} disabled={sendingStory || !storyInput.trim()}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: sendingStory || !storyInput.trim() ? .5 : 1 }}>
                  {sendingStory ? 'Sharing...' : 'Share My Story 💜'}
                </button>
                <button onClick={() => { setShowStoryForm(false); setStoryInput(''); }}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, background: 'transparent', color: 'var(--text-2)' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Previous stories */}
          {eduStories.length === 0 && !showStoryForm ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Share your story to inspire yourself and others on this journey.</p>
            </div>
          ) : (
            eduStories.map((s: any, i: number) => {
              const date = s.sharedAt?.toDate ? s.sharedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={s.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--card-bg)', border: '1px solid #8b5cf630' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#8b5cf6' }}>💜 My Journey — #{i + 1}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{date}</span>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-1)', padding: '6px 10px', borderRadius: 8, background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                    "{s.story}"
                  </div>
                  {s.doctorResponse && (
                    <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12, lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>👨‍⚕️ Your Doctor's Response:</div>
                      <div style={{ color: 'var(--text-1)' }}>{s.doctorResponse}</div>
                    </div>
                  )}
                  {!s.doctorResponse && (
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
                      💫 Thank you for sharing your story. Your doctor will see this.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
