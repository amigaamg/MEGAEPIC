import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ComplicationModal({ patientId, toolId, doctor, onClose }: { patientId: string; toolId: string; doctor: any; onClose: () => void }) {
  const [complicationName, setComplicationName] = useState('');
  const [notes, setNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const save = async () => {
    if (!complicationName) return;
    setSaving(true);
    await addDoc(collection(db, 'complications'), {
      patientId,
      toolId,
      complicationName,
      notes,
      actionTaken,
      date: serverTimestamp(),
    });
    setSaving(false);
    setDone(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, padding: 24 }} onClick={e => e.stopPropagation()}>
        <h3>{done ? 'Complication Logged' : 'Log Complication'}</h3>
        {done ? (
          <button onClick={onClose}>Close</button>
        ) : (
          <>
            <input placeholder="Complication name" value={complicationName} onChange={e => setComplicationName(e.target.value)} />
            <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
            <textarea placeholder="Action taken" value={actionTaken} onChange={e => setActionTaken(e.target.value)} />
            <button onClick={save} disabled={saving}>Save</button>
          </>
        )}
      </div>
    </div>
  );
}