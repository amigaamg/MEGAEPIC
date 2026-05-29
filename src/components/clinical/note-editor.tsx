'use client';
import { useState } from 'react';

interface NoteEditorProps {
  initialNote?: string;
  onSave?: (note: string) => void;
  onGenerate?: (data: { symptoms: string; findings: string; diagnosis: string }) => void;
  isLoading?: boolean;
}

export default function NoteEditor({ initialNote = '', onSave, onGenerate, isLoading }: NoteEditorProps) {
  const [note, setNote] = useState(initialNote);
  const [symptoms, setSymptoms] = useState('');
  const [findings, setFindings] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  return (
    <div className="frost-card p-4 flex flex-col gap-4">
      <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Clinical Note Editor</div>

      {onGenerate && (
        <div className="flex flex-col gap-3 p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI Note Generator</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Symptoms / HPI..." rows={3}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#E2E8F0', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif" }} />
            <textarea value={findings} onChange={e => setFindings(e.target.value)} placeholder="Exam findings..." rows={3}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#E2E8F0', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif" }} />
            <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Working diagnosis / plan..." rows={3}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#E2E8F0', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif" }} />
          </div>
          <button
            onClick={() => onGenerate({ symptoms, findings, diagnosis })}
            disabled={isLoading || (!symptoms && !findings)}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none', alignSelf: 'flex-start',
              background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
              color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              opacity: isLoading ? 0.6 : 1, fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {isLoading ? 'Generating...' : 'Generate Note'}
          </button>
        </div>
      )}

      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Write your clinical note here..."
        rows={10}
        style={{
          width: '100%', padding: 12, borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)', color: '#E2E8F0',
          fontSize: 13, outline: 'none', resize: 'vertical',
          fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7,
        }}
      />

      {onSave && (
        <button
          onClick={() => onSave(note)}
          style={{
            padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12,
            cursor: 'pointer', alignSelf: 'flex-start', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          Save Note
        </button>
      )}
    </div>
  );
}
