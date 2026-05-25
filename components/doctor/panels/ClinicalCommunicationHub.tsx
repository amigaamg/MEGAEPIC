'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, orderBy, doc, getDoc, Timestamp,
} from 'firebase/firestore';
import { writeTimelineEvent } from '@/lib/firebaseTimeline';

type MessageType = 'clinical' | 'mdt_discussion' | 'referral' | 'patient_message' | 'nurse_update' | 'admin';

interface ClinicalMessage {
  id?: string;
  patientId: string; senderId: string; senderName: string;
  recipientId: string; recipientName: string;
  messageType: MessageType; subject: string;
  content: string; priority: 'normal' | 'urgent' | 'critical';
  status: 'sent' | 'read' | 'acted_upon';
  sentAt: Timestamp | any; readAt?: Timestamp | any;
  parentMessageId?: string; linkedDocId?: string;
  category?: string; isMDT: boolean;
}

interface Props {
  patientId: string; doctorId: string; doctorName: string;
  compact?: boolean;
}

const fmtDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ClinicalCommunicationHub({ patientId, doctorId, doctorName, compact }: Props) {
  const [messages, setMessages] = useState<ClinicalMessage[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [messageType, setMessageType] = useState<MessageType>('clinical');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [mdtMode, setMdtMode] = useState(false);
  const [colleagues, setColleagues] = useState<{ uid: string; name: string; role: string }[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'doctorMessages'), where('patientId', '==', patientId), orderBy('sentAt', 'desc')),
      snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClinicalMessage))),
    );
    return () => unsub();
  }, [patientId]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'users'), where('role', 'in', ['doctor', 'nurse', 'staff'])),
      snap => setColleagues(snap.docs.map(d => ({ uid: d.id, ...d.data() } as any))),
    );
    return () => unsub();
  }, []);

  const handleSend = useCallback(async () => {
    if (!subject.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'doctorMessages'), {
        patientId, senderId: doctorId, senderName: doctorName,
        recipientId: selectedRecipient || '', recipientName: colleagues.find(c => c.uid === selectedRecipient)?.name || 'All Team',
        messageType, subject, content, priority: 'normal',
        status: 'sent', sentAt: serverTimestamp(),
        isMDT: mdtMode, category: messageType,
      });
      await writeTimelineEvent({
        patientId, type: 'communication',
        title: mdtMode ? `💬 MDT Discussion: ${subject}` : `💬 Message Sent: ${subject}`,
        description: content.slice(0, 200),
        severity: 'info', createdBy: doctorId,
        linkedDocId: ref.id, linkedCollection: 'doctorMessages',
      });
      setSubject(''); setContent(''); setShowCompose(false);
    } catch (e) { console.error('Send message failed:', e); }
    setSaving(false);
  }, [subject, content, messageType, mdtMode, selectedRecipient, patientId, doctorId, doctorName, colleagues]);

  const mdtMessages = messages.filter(m => m.isMDT);
  const clinicalMessages = messages.filter(m => !m.isMDT);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-sm-accent" onClick={() => { setShowCompose(!showCompose); setMdtMode(false); }}>
          {showCompose && !mdtMode ? '✕ Close' : '💬 Send Clinical Message'}
        </button>
        <button className="btn-sm-accent" onClick={() => { setShowCompose(!showCompose); setMdtMode(true); }}
          style={{ background: '#8b5cf6' }}>
          {showCompose && mdtMode ? '✕ Close' : '👥 Start MDT Discussion'}
        </button>
      </div>

      {showCompose && (
        <div style={{
          padding: compact ? 10 : 14, borderRadius: 14,
          border: mdtMode ? '2px solid #8b5cf640' : '2px solid var(--accent-dim)',
          background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            {mdtMode ? '👥 New MDT Discussion' : '💬 New Clinical Message'}
          </div>
          {!mdtMode && (
            <div className="field-col">
              <span className="field-lbl">Recipient</span>
              <select className="field-inp" value={selectedRecipient}
                onChange={e => setSelectedRecipient(e.target.value)}>
                <option value="">Select colleague...</option>
                {colleagues.map(c => (
                  <option key={c.uid} value={c.uid}>{c.name} ({c.role})</option>
                ))}
              </select>
            </div>
          )}
          {mdtMode && (
            <div style={{ padding: '6px 10px', borderRadius: 8, background: '#8b5cf610', border: '1px solid #8b5cf630', fontSize: 11, color: '#6d28d9' }}>
              👥 This message will be visible to the entire care team.
            </div>
          )}
          <div className="form-grid-2">
            <div className="field-col">
              <span className="field-lbl">Message Type</span>
              <select className="field-inp" value={messageType} onChange={e => setMessageType(e.target.value as MessageType)}>
                <option value="clinical">Clinical</option>
                <option value="mdt_discussion">MDT Discussion</option>
                <option value="referral">Referral</option>
                <option value="nurse_update">Nurse Update</option>
                <option value="admin">Administrative</option>
              </select>
            </div>
            <div className="field-col">
              <span className="field-lbl">Subject *</span>
              <input className="field-inp" placeholder="e.g. Concern about BP control, query on medication..."
                value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
          </div>
          <div className="field-col">
            <span className="field-lbl">Message *</span>
            <textarea className="field-ta" rows={4} placeholder="Write your clinical message..."
              value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <button className="btn-accent" onClick={handleSend} disabled={saving || !subject.trim() || !content.trim()}>
            {saving ? 'Sending...' : (mdtMode ? '📤 Post to MDT' : '📤 Send Message')}
          </button>
        </div>
      )}

      {/* Messages display */}
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 12 }}>
          No clinical messages yet. Send a message or start an MDT discussion.
        </div>
      ) : (
        <>
          {mdtMessages.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12, marginBottom: 6, color: '#6d28d9' }}>
                👥 MDT Discussions ({mdtMessages.length})
              </div>
              {mdtMessages.map(msg => (
                <div key={msg.id} style={{
                  padding: compact ? 6 : 8, borderRadius: 8, marginBottom: 4,
                  background: '#8b5cf605', border: '1px solid #8b5cf620',
                  borderLeft: '3px solid #8b5cf6',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: compact ? 11 : 12 }}>{msg.subject}</div>
                    <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(msg.sentAt)}</span>
                  </div>
                  <div style={{ fontSize: compact ? 10 : 11, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.4 }}>{msg.content}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>From: {msg.senderName} · {msg.messageType}</div>
                </div>
              ))}
            </div>
          )}

          {clinicalMessages.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12, marginBottom: 6 }}>
                💬 Clinical Messages ({clinicalMessages.length})
              </div>
              {clinicalMessages.map(msg => (
                <div key={msg.id} style={{
                  padding: compact ? 6 : 8, borderRadius: 8, marginBottom: 4,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderLeft: msg.status === 'acted_upon' ? '3px solid #10b981' : msg.status === 'read' ? '3px solid #3b82f6' : '3px solid #f59e0b',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: compact ? 11 : 12 }}>{msg.subject}</div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 9, padding: '1px 5px', borderRadius: 99,
                        background: msg.status === 'acted_upon' ? '#10b98120' : msg.status === 'read' ? '#3b82f620' : '#f59e0b20',
                        color: msg.status === 'acted_upon' ? '#10b981' : msg.status === 'read' ? '#3b82f6' : '#f59e0b',
                        fontWeight: 700,
                      }}>{msg.status}</span>
                      <span style={{ fontSize: 9, color: 'var(--muted)' }}>{fmtDate(msg.sentAt)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: compact ? 10 : 11, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.4 }}>{msg.content}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                    From: {msg.senderName} → {msg.recipientName || 'Team'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
