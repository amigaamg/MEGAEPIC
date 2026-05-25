'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, orderBy, doc, updateDoc, deleteDoc, Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { writeTimelineEvent } from '@/lib/firebaseTimeline';

export type NoteType = 'clerking' | 'progress_note' | 'clinic_review' | 'procedure' | 'consultation_note' | 'ward_round' | 'nursing_note';

export interface ClinicalNote {
  id?: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  noteType: NoteType;
  title: string;
  content: string;
  specialty?: string;
  diagnosis?: string;
  plan?: string;
  medications?: string[];
  investigations?: string[];
  createdBy: string;
  createdAt: Timestamp | any;
  updatedAt?: Timestamp | any;
  linkedDocketId?: string;
  linkedAppointmentId?: string;
  isSigned?: boolean;
  signedAt?: Timestamp | any;
}

const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; icon: string; placeholder: string; shortLabel: string }> = {
  clerking: { label: 'Clinical Clerking', icon: '📋', placeholder: 'History of presenting complaint, past medical history, drug history, family history, social history, systems review...', shortLabel: 'Clerking' },
  progress_note: { label: 'Progress Note', icon: '📝', placeholder: 'Subjective, Objective, Assessment, Plan (SOAP)...', shortLabel: 'Progress' },
  clinic_review: { label: 'Clinic Review', icon: '🔄', placeholder: 'Interval history, symptom progression, medication changes, adherence, outcome measures...', shortLabel: 'Review' },
  procedure: { label: 'Procedure Note', icon: '🔧', placeholder: 'Procedure name, indication, consent, findings, complications, specimens...', shortLabel: 'Procedure' },
  consultation_note: { label: 'Consultation Note', icon: '🩺', placeholder: 'Consultation findings, recommendations, plan...', shortLabel: 'Consult' },
  ward_round: { label: 'Ward Round Note', icon: '🏥', placeholder: 'Overnight events, review of systems, examination findings, plan for the day...', shortLabel: 'Ward Round' },
  nursing_note: { label: 'Nursing Note', icon: '👩‍⚕️', placeholder: 'Observations, interventions, patient response, handover notes...', shortLabel: 'Nursing' },
};

interface Props {
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  noteType?: NoteType;
  compact?: boolean;
  docketId?: string;
}

export default function ClinicalDocumentation({
  patientId, doctorId, doctorName, doctorSpecialty,
  noteType, compact, docketId,
}: Props) {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeNoteType, setActiveNoteType] = useState<NoteType>(noteType || 'progress_note');
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', diagnosis: '', plan: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<NoteType | 'all'>('all');

  useEffect(() => {
    const col = collection(db, 'clinicalNotes');
    const filters: QueryConstraint[] = [
      where('patientId', '==', patientId),
    ];
    if (noteType) filters.push(where('noteType', '==', noteType));
    filters.push(orderBy('createdAt', 'desc'));
    const q = query(col, ...filters);
    const unsub = onSnapshot(q,
      snap => { setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClinicalNote))); setLoading(false); },
      () => setLoading(false),
    );
    return () => unsub();
  }, [patientId, noteType]);

  const displayNotes = filter === 'all' ? notes : notes.filter(n => n.noteType === filter);
  const noteTypes = Object.keys(NOTE_TYPE_CONFIG).filter(k => !noteType || k === noteType) as NoteType[];

  const handleSave = useCallback(async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSaving(true);
    try {
      if (editingNote?.id) {
        await updateDoc(doc(db, 'clinicalNotes', editingNote.id), {
          ...formData, noteType: activeNoteType, specialty: doctorSpecialty || '',
          linkedDocketId: docketId || null, updatedAt: serverTimestamp(),
        });
        await writeTimelineEvent({
          patientId, type: 'clinical_note',
          title: `✏️ ${NOTE_TYPE_CONFIG[activeNoteType].label} Updated: ${formData.title}`,
          description: formData.content.slice(0, 200),
          severity: 'info', createdBy: doctorId,
          linkedDocId: editingNote.id, linkedCollection: 'clinicalNotes',
          metadata: { noteType: activeNoteType },
        });
      } else {
        const ref = await addDoc(collection(db, 'clinicalNotes'), {
          patientId, doctorId, doctorName,
          noteType: activeNoteType,
          title: formData.title, content: formData.content,
          diagnosis: formData.diagnosis || '', plan: formData.plan || '',
          specialty: doctorSpecialty || '',
          linkedDocketId: docketId || null,
          createdBy: doctorId, createdAt: serverTimestamp(),
          isSigned: false,
        });
        await writeTimelineEvent({
          patientId, type: 'clinical_note',
          title: `${NOTE_TYPE_CONFIG[activeNoteType].icon} ${NOTE_TYPE_CONFIG[activeNoteType].label}: ${formData.title}`,
          description: formData.content.slice(0, 200),
          severity: 'info', createdBy: doctorId,
          linkedDocId: ref.id, linkedCollection: 'clinicalNotes',
          metadata: { noteType: activeNoteType },
        });
      }
      setFormData({ title: '', content: '', diagnosis: '', plan: '' });
      setEditingNote(null);
      setShowForm(false);
    } catch (e) { console.error('Save note failed:', e); }
    setSaving(false);
  }, [formData, activeNoteType, patientId, doctorId, doctorName, doctorSpecialty, docketId, editingNote]);

  const handleEdit = (note: ClinicalNote) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content, diagnosis: note.diagnosis || '', plan: note.plan || '' });
    setActiveNoteType(note.noteType);
    setShowForm(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    await deleteDoc(doc(db, 'clinicalNotes', noteId));
  };

  const handleSign = async (noteId: string) => {
    await updateDoc(doc(db, 'clinicalNotes', noteId), {
      isSigned: true, signedAt: serverTimestamp(),
    });
  };

  const fmtDate = (ts: any) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      {/* Note type tabs */}
      {!noteType && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({notes.length})
          </button>
          {noteTypes.map(nt => {
            const cfg = NOTE_TYPE_CONFIG[nt];
            const count = notes.filter(n => n.noteType === nt).length;
            return (
              <button key={nt} className={`filter-chip ${filter === nt ? 'active' : ''}`} onClick={() => setFilter(nt)}>
                {cfg.icon} {cfg.shortLabel} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* New note button */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn-sm-accent" onClick={() => { setShowForm(!showForm); setEditingNote(null); setFormData({ title: '', content: '', diagnosis: '', plan: '' }); }}>
          {showForm ? '✕ Close' : `➕ New ${NOTE_TYPE_CONFIG[activeNoteType].shortLabel}`}
        </button>
        {noteType && (
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
            {NOTE_TYPE_CONFIG[noteType].icon} {NOTE_TYPE_CONFIG[noteType].label}
          </span>
        )}
      </div>

      {/* Note form */}
      {showForm && (
        <div style={{
          padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)',
          background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {!noteType && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {noteTypes.map(nt => (
                <button key={nt}
                  className={`filter-chip ${activeNoteType === nt ? 'active' : ''}`}
                  onClick={() => { setActiveNoteType(nt); setFormData(prev => ({ ...prev, title: '' })); }}>
                  {NOTE_TYPE_CONFIG[nt].icon} {NOTE_TYPE_CONFIG[nt].label}
                </button>
              ))}
            </div>
          )}
          <div className="field-col">
            <span className="field-lbl">Title</span>
            <input className="field-inp" placeholder={`${NOTE_TYPE_CONFIG[activeNoteType].label} title...`}
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} />
          </div>
          <div className="field-col">
            <span className="field-lbl">Content</span>
            <textarea className="field-ta" rows={5}
              placeholder={NOTE_TYPE_CONFIG[activeNoteType].placeholder}
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))} />
          </div>
          {activeNoteType !== 'procedure' && (
            <div className="form-grid-2">
              <div className="field-col">
                <span className="field-lbl">Diagnosis / Assessment</span>
                <input className="field-inp" placeholder="e.g. Community-acquired pneumonia"
                  value={formData.diagnosis}
                  onChange={e => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))} />
              </div>
              <div className="field-col">
                <span className="field-lbl">Plan</span>
                <input className="field-inp" placeholder="e.g. IV antibiotics, chest physio"
                  value={formData.plan}
                  onChange={e => setFormData(prev => ({ ...prev, plan: e.target.value }))} />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {editingNote && (
              <button className="btn-end" onClick={() => { setShowForm(false); setEditingNote(null); setFormData({ title: '', content: '', diagnosis: '', plan: '' }); }}>
                Cancel
              </button>
            )}
            <button className="btn-accent" onClick={handleSave} disabled={saving || !formData.title.trim() || !formData.content.trim()} style={{ padding: '8px 16px', fontSize: 12 }}>
              {saving ? 'Saving...' : editingNote ? '✏️ Update Note' : `💾 Save ${NOTE_TYPE_CONFIG[activeNoteType].shortLabel}`}
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
        </div>
      ) : displayNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
          No clinical notes found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayNotes.map(note => {
            const cfg = NOTE_TYPE_CONFIG[note.noteType];
            return (
              <div key={note.id} style={{
                padding: compact ? 10 : 12, borderRadius: 12,
                background: 'var(--bg)', border: '1px solid var(--border)',
                transition: 'border-color .18s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{cfg.icon}</span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: compact ? 12 : 13 }}>{note.title}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: 'var(--muted)',
                        marginLeft: 6, padding: '1px 6px', borderRadius: 99,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                      }}>
                        {cfg.shortLabel}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {note.isSigned && <span style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>✓ Signed</span>}
                    <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(note.createdAt)}</span>
                  </div>
                </div>
                <div style={{
                  fontSize: compact ? 11 : 12, color: 'var(--text-2)',
                  lineHeight: 1.5, marginBottom: 6,
                  display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {note.content}
                </div>
                {(note.diagnosis || note.plan) && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, marginBottom: 6 }}>
                    {note.diagnosis && <span style={{ padding: '2px 8px', borderRadius: 99, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 }}>🔍 {note.diagnosis}</span>}
                    {note.plan && <span style={{ padding: '2px 8px', borderRadius: 99, background: 'var(--indigo-dim)', color: 'var(--indigo)', fontWeight: 600 }}>📋 {note.plan}</span>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button className="btn-action" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => handleEdit(note)}>Edit</button>
                  {!note.isSigned && (
                    <button className="btn-action" style={{ fontSize: 10, padding: '3px 8px', color: '#10b981' }} onClick={() => note.id && handleSign(note.id)}>Sign</button>
                  )}
                  <button className="btn-end" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => note.id && handleDelete(note.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
