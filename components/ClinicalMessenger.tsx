'use client';
import { useState } from 'react';

export default function ClinicalMessenger() {
  const [message, setMessage] = useState('');
  const handleSend = () => { setMessage(''); };
  return (
    <div style={{ padding: 16, borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)' }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Clinical Messenger</div>
      <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..."
        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '0.5px solid var(--color-border-secondary)' }} />
      <button onClick={handleSend} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 6, background: '#0d9488', color: 'white', border: 'none', cursor: 'pointer' }}>Send</button>
    </div>
  );
}
