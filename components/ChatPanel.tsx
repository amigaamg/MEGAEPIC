import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function ChatPanel({ patientId, doctorId, doctorName }: { patientId: string; doctorId: string; doctorName: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'chatMessages'), where('patientId', '==', patientId), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs.reverse()); // oldest first
    });
  }, [patientId]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    await addDoc(collection(db, 'chatMessages'), {
      patientId,
      doctorId,
      doctorName,
      text: newMsg,
      sender: 'doctor',
      timestamp: serverTimestamp(),
    });
    setNewMsg('');
  };

  return (
    <div style={{ marginTop: 24, background: '#fff', border: '1px solid #e2e9f3', borderRadius: 16, padding: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 12 }}>💬 Messages</div>
      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column' }}>
        {messages.map(m => (
          <div key={m.id} style={{ marginBottom: 8, textAlign: m.sender === 'doctor' ? 'right' : 'left' }}>
            <div style={{ background: m.sender === 'doctor' ? '#0aaa76' : '#e8eef5', padding: '6px 12px', borderRadius: 12, display: 'inline-block', maxWidth: '80%', fontSize: 12 }}>
              {m.text}
            </div>
            <div style={{ fontSize: 9, marginTop: 2, color: '#8fa3bd' }}>{m.timestamp?.toDate().toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e2e9f3', marginRight: 8 }}
        />
        <button onClick={sendMessage} style={{ padding: '6px 12px', background: '#0aaa76', color: '#fff', border: 'none', borderRadius: 8 }}>
          Send
        </button>
      </div>
    </div>
  );
}