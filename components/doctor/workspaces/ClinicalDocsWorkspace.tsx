'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, where, onSnapshot, orderBy, doc, getDoc,
} from 'firebase/firestore';
import ClinicalDocumentation from '../panels/ClinicalDocumentation';
import type { NoteType } from '../panels/ClinicalDocumentation';

interface Props {
  doctorId: string; doctorName: string; doctorSpecialty?: string;
}

export default function ClinicalDocsWorkspace({ doctorId, doctorName, doctorSpecialty }: Props) {
  const [patients, setPatients] = useState<{ uid: string; name: string }[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteType, setNoteType] = useState<NoteType | 'all'>('all');
  const [patientNotesCount, setPatientNotesCount] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'users'), where('createdBy', '==', doctorId)),
      snap => {
        const list = snap.docs.map(d => ({ uid: d.id, name: d.data().name || 'Unknown' }));
        setPatients(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [doctorId]);

  // Count notes per patient
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'clinicalNotes'), where('doctorId', '==', doctorId)),
      snap => {
        const counts: Record<string, number> = {};
        snap.docs.forEach(d => {
          const data = d.data();
          counts[data.patientId] = (counts[data.patientId] || 0) + 1;
        });
        setPatientNotesCount(counts);
      },
    );
    return () => unsub();
  }, [doctorId]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.uid.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (patientNotesCount[b.uid] || 0) - (patientNotesCount[a.uid] || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">📝 Clinical Documentation</div>
          <span className="count-badge">{patients.length} patients</span>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Patient search */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <input className="search-inp" placeholder="🔍 Search patient by name or ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Note type filter */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {([
              { id: 'all' as const, label: 'All Types' },
              { id: 'clerking' as const, label: '📋 Clerking' },
              { id: 'progress_note' as const, label: '📝 Progress' },
              { id: 'clinic_review' as const, label: '🔄 Review' },
              { id: 'procedure' as const, label: '🔧 Procedure' },
              { id: 'consultation_note' as const, label: '🩺 Consult' },
              { id: 'ward_round' as const, label: '🏥 Ward Round' },
            ]).map(nt => (
              <button key={nt.id} className={`filter-chip ${noteType === nt.id ? 'active' : ''}`}
                onClick={() => setNoteType(nt.id)} style={{ fontSize: 10, padding: '4px 10px' }}>
                {nt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="panel">
          <div className="empty-sm">
            {search ? 'No patients matching your search.' : 'No patients registered yet. Register a patient in the Patients tab first.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
          {filteredPatients.map(p => (
            <div key={p.uid}
              onClick={() => setSelectedPatient(selectedPatient === p.uid ? null : p.uid)}
              style={{
                padding: 14, borderRadius: 14, cursor: 'pointer',
                background: selectedPatient === p.uid ? 'var(--accent-dim)' : 'var(--surface)',
                border: selectedPatient === p.uid ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                transition: 'all .18s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="queue-ava" style={{ width: 40, height: 40, fontSize: 16 }}>{p.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                    ID: {p.uid.slice(0, 12)}...
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                    {patientNotesCount[p.uid] || 0}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>notes</div>
                </div>
              </div>

              {selectedPatient === p.uid && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', maxHeight: 500, overflowY: 'auto' }}>
                  <ClinicalDocumentation
                    patientId={p.uid}
                    doctorId={doctorId}
                    doctorName={doctorName}
                    doctorSpecialty={doctorSpecialty}
                    noteType={noteType === 'all' ? undefined : noteType}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
