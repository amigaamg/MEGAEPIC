'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// AmexanClinicalMessaging.tsx — PRODUCTION VERSION v3
//
// NEW in v3:
//   - defaultDoctorId / defaultDoctorName props
//     → When provided, auto-opens that doctor's thread immediately
//     → Used by PatientOrdersCenter and PatientReferralPortal "Message Dr. X" buttons
//
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  useEffect, useState, useRef, useCallback, useMemo, Fragment,
} from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, getDocs,
  serverTimestamp, orderBy, limit, doc, setDoc, getDoc, arrayUnion,
} from 'firebase/firestore';
import { ref as sRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type MsgStatus = 'sending' | 'sent' | 'delivered' | 'read';
type MsgType = 'text' | 'image' | 'video' | 'audio' | 'voicenote' | 'document' | 'pdf' | 'call_log';
type ClinTag = 'lab_result' | 'radiology' | 'prescription' | 'clinical_note' | 'medical_advice' | 'followup' | 'patient_report' | 'none';
type CallType = 'voice' | 'video';

interface Reaction { emoji: string; uid: string; }

interface Msg {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: 'doctor' | 'patient';
  senderName?: string;
  text?: string;
  read: boolean;
  timestamp: any;
  type?: MsgType;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  waveform?: number[];
  duration?: number;
  clinTag?: ClinTag;
  reactions?: Reaction[];
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
  editedAt?: any;
  deletedAt?: any;
  status?: MsgStatus;
}

interface Thread {
  threadId: string;
  partnerUid: string;
  partnerName: string;
  partnerRole: 'doctor' | 'patient';
  partnerSpec?: string;
  open: boolean;
  lastText?: string;
  lastAt?: any;
  unread: number;
}

interface Call {
  id: string; threadId: string; callerId: string; callerName: string;
  receiverId: string; receiverName: string; type: CallType;
  status: 'ringing' | 'active' | 'ended' | 'declined'; duration?: number;
  offer?: any; answer?: any;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TAG: Record<ClinTag, { label: string; color: string; icon: string; bg: string }> = {
  lab_result:     { label: 'Lab Result',    color: '#3b82f6', icon: '🧪', bg: 'rgba(59,130,246,.18)' },
  radiology:      { label: 'Radiology',     color: '#8b5cf6', icon: '🩻', bg: 'rgba(139,92,246,.18)' },
  prescription:   { label: 'Prescription',  color: '#10b981', icon: '💊', bg: 'rgba(16,185,129,.18)' },
  clinical_note:  { label: 'Clinical Note', color: '#f59e0b', icon: '📋', bg: 'rgba(245,158,11,.18)' },
  medical_advice: { label: 'Med Advice',    color: '#06b6d4', icon: '👨‍⚕️', bg: 'rgba(6,182,212,.18)' },
  followup:       { label: 'Follow-Up',     color: '#f97316', icon: '📅', bg: 'rgba(249,115,22,.18)' },
  patient_report: { label: 'Patient Report',color: '#ec4899', icon: '📄', bg: 'rgba(236,72,153,.18)' },
  none:           { label: 'General',       color: '#64748b', icon: '💬', bg: 'transparent' },
};

const RX = ['👍', '❤️', '😂', '😮', '😢', '🙏', '✅', '⚠️', '💊', '🏥'];

const METERED_DOMAIN = 'videoamexan.metered.live';
const METERED_SECRET = '_R_tKrF3xSicInRntQvEGYkt6mM_Xj2uIKsA1Cc-FQqdrpfM';

async function getMeteredIceServers(): Promise<RTCIceServer[]> {
  try {
    const res = await fetch(`https://${METERED_DOMAIN}/api/v1/turn/credentials?apiKey=${METERED_SECRET}`);
    if (res.ok) return await res.json();
  } catch (e) { console.warn('Metered fetch failed, using fallback STUN:', e); }
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const mkTid = (a: string, b: string) => [a, b].sort().join('_');
const otherUid = (tid: string, me: string) => tid.split('_').find(p => p !== me) ?? '';
const fT = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
};
const fD = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const n = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 7) return d.toLocaleDateString('en-KE', { weekday: 'short' });
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
};
const fDur = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
const fSz = (b: number) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b / 1024).toFixed(1)}KB` : `${(b / 1048576).toFixed(1)}MB`;
const mType = (m: Msg): MsgType => m.type || 'text';
const mTag = (m: Msg): ClinTag => m.clinTag || 'none';
const mSt = (m: Msg): MsgStatus => m.status || (m.read ? 'read' : 'delivered');

function cleanPayload(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v;
  }
  return result;
}

// ─── AVATAR ────────────────────────────────────────────────────────────────────

function Av({ n, url, sz = 36, on }: { n: string; url?: string; sz?: number; on?: boolean }) {
  const ini = (n || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const h = (n || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: sz, height: sz, borderRadius: '50%',
        background: `hsl(${h},55%,28%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: sz * .37, fontWeight: 800, color: '#fff',
        border: '2.5px solid rgba(255,255,255,.1)',
        boxSizing: 'border-box', overflow: 'hidden',
      }}>
        {url ? <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={n} /> : ini}
      </div>
      {on && <div style={{
        position: 'absolute', bottom: 1, right: 1,
        width: sz * .27, height: sz * .27, borderRadius: '50%',
        background: '#22c55e', border: '2px solid #0d1117',
      }} />}
    </div>
  );
}

// ─── VOICE RECORDER ────────────────────────────────────────────────────────────

function useVR() {
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const [wave, setWave] = useState<number[]>([]);
  const mr = useRef<MediaRecorder | null>(null);
  const bls = useRef<Blob[]>([]);
  const ti = useRef<any>(null);
  const ai = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);

  const start = useCallback(async () => {
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: true });
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ctxRef.current = ctx;
        const an = ctx.createAnalyser(); an.fftSize = 256;
        ctx.createMediaStreamSource(st).connect(an);
        const b: number[] = [];
        const t = () => {
          const u = new Uint8Array(an.frequencyBinCount);
          an.getByteFrequencyData(u);
          const v = Array.from(u).slice(0, 32).reduce((a, x) => a + x, 0) / 32 / 255;
          b.push(+v.toFixed(3));
          if (b.length > 60) b.shift();
          setWave([...b]);
          ai.current = requestAnimationFrame(t);
        };
        t();
      } catch { }

      const mimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4', ''];
      const mime = mimes.find(m => !m || MediaRecorder.isTypeSupported(m)) || '';
      const opts: MediaRecorderOptions = mime ? { mimeType: mime } : {};
      const recorder = new MediaRecorder(st, opts);
      mr.current = recorder; bls.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) bls.current.push(e.data); };
      recorder.start(100);
      setRec(true); setSecs(0);
      ti.current = setInterval(() => setSecs(s => s + 1), 1000);
    } catch (e) {
      console.warn('Mic access denied:', e);
      alert('Microphone access is required to send voice notes.');
    }
  }, []);

  const stop = useCallback((): Promise<{ blob: Blob; dur: number; wave: number[] }> =>
    new Promise(res => {
      if (!mr.current) return res({ blob: new Blob(), dur: 0, wave: [] });
      const d = secs; const w = [...wave];
      mr.current.onstop = () => {
        const mimeType = mr.current?.mimeType || 'audio/webm';
        res({ blob: new Blob(bls.current, { type: mimeType }), dur: d, wave: w });
      };
      mr.current.stop();
      mr.current.stream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(ai.current);
      ctxRef.current?.close().catch(() => {});
      if (ti.current) clearInterval(ti.current);
      setRec(false); setSecs(0); setWave([]);
    }), [secs, wave]);

  const cancel = useCallback(() => {
    mr.current?.stop();
    mr.current?.stream.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(ai.current);
    ctxRef.current?.close().catch(() => {});
    if (ti.current) clearInterval(ti.current);
    setRec(false); setSecs(0); setWave([]);
  }, []);

  return { rec, secs, wave, start, stop, cancel };
}

// ─── WAVEFORM ─────────────────────────────────────────────────────────────────

function WF({ b = [], p = 1, c = '#00c9a7', h = 30 }: { b?: number[]; p?: number; c?: string; h?: number }) {
  const d = b.length > 0 ? b : Array.from({ length: 28 }, () => Math.random() * .55 + .15);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1.5, height: h, overflow: 'hidden', width: '100%', maxWidth: 180 }}>
      {d.map((v, i) => (
        <div key={i} style={{
          flex: '0 0 3px', borderRadius: 9,
          height: `${Math.max(4, v * h)}px`,
          background: i / d.length <= p ? c : `${c}44`,
          transition: 'height .07s',
        }} />
      ))}
    </div>
  );
}

// ─── VOICE NOTE PLAYER ────────────────────────────────────────────────────────

function VNP({ url, wave = [], dur = 0, mine }: { url: string; wave?: number[]; dur?: number; mine: boolean }) {
  const [pl, setPl] = useState(false);
  const [pr, setPr] = useState(0);
  const [cu, setCu] = useState(0);
  const [sp, setSp] = useState(1);
  const [err, setErr] = useState(false);
  const ar = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.crossOrigin = 'anonymous';
    a.preload = 'metadata';
    a.src = url;
    ar.current = a;
    a.ontimeupdate = () => { setCu(a.currentTime); setPr(a.currentTime / (a.duration || 1)); };
    a.onended = () => { setPl(false); setPr(0); setCu(0); };
    a.onerror = () => setErr(true);
    return () => { a.pause(); a.src = ''; };
  }, [url]);

  const tog = () => {
    const a = ar.current;
    if (!a || err) return;
    if (pl) { a.pause(); setPl(false); }
    else { a.playbackRate = sp; a.play().then(() => setPl(true)).catch(e => { console.warn(e); setErr(true); }); }
  };

  const cyc = () => {
    const r = [1, 1.5, 2];
    const n = r[(r.indexOf(sp) + 1) % r.length];
    setSp(n);
    if (ar.current) ar.current.playbackRate = n;
  };

  const co = mine ? '#fff' : '#00c9a7';
  if (err) return <div style={{ fontSize: 11, color: mine ? 'rgba(255,255,255,.5)' : '#64748b', padding: '2px 0' }}>⚠️ Audio unavailable</div>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200, maxWidth: 260 }}>
      <button onClick={tog} style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: mine ? 'rgba(255,255,255,.2)' : 'rgba(0,201,167,.18)',
        border: 'none', cursor: 'pointer', color: co, fontSize: 15,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .1s',
      }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >{pl ? '⏸' : '▶'}</button>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <WF b={wave} p={pr} c={co} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: mine ? 'rgba(255,255,255,.6)' : '#64748b', fontFamily: 'monospace' }}>
            {fDur(Math.round(cu))} / {fDur(dur)}
          </span>
          <button onClick={cyc} style={{ fontSize: 9, fontWeight: 800, color: co, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{sp}×</button>
        </div>
      </div>
    </div>
  );
}

// ─── CALL OVERLAY ─────────────────────────────────────────────────────────────

function CallUI({ call, myId, isCaller, other, onEnd }: {
  call: Call; myId: string; isCaller: boolean; other: string; onEnd: () => void;
}) {
  const [dur, setDur] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [iceState, setIceState] = useState<string>('new');
  const tr = useRef<any>(null);
  const lv = useRef<HTMLVideoElement>(null);
  const rv = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const isV = call.type === 'video';
  const isA = call.status === 'active';

  useEffect(() => {
    if (isA) { tr.current = setInterval(() => setDur(d => d + 1), 1000); }
    return () => { if (tr.current) clearInterval(tr.current); };
  }, [isA]);

  useEffect(() => {
    if (call.status === 'ended' || call.status === 'declined') return;
    let cancelled = false;
    (async () => {
      const iceServers = await getMeteredIceServers();
      if (cancelled) return;
      const p = new RTCPeerConnection({ iceServers });
      pc.current = p;
      p.oniceconnectionstatechange = () => setIceState(p.iceConnectionState);
      try {
        const constraints = { audio: true, video: isV ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        localStream.current = s;
        s.getTracks().forEach(t => p.addTrack(t, s));
        if (lv.current && isV) { lv.current.srcObject = s; lv.current.muted = true; }
      } catch (e) { console.warn('Media access error:', e); }
      p.ontrack = e => { if (rv.current) rv.current.srcObject = e.streams[0]; };
      p.onicecandidate = async e => {
        if (e.candidate) {
          try { await updateDoc(doc(db, 'calls', call.id), { iceCandidates: arrayUnion(e.candidate.toJSON()) }); } catch { }
        }
      };
      if (isCaller && call.status === 'ringing') {
        try {
          const o = await p.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: isV });
          await p.setLocalDescription(o);
          await updateDoc(doc(db, 'calls', call.id), { offer: o });
        } catch (e) { console.error('Offer error:', e); }
      }
      const unsub = onSnapshot(doc(db, 'calls', call.id), async snap => {
        const data = snap.data();
        if (!data || cancelled) return;
        if (!isCaller && data.offer && !p.currentRemoteDescription) {
          try {
            await p.setRemoteDescription(new RTCSessionDescription(data.offer));
            const a = await p.createAnswer();
            await p.setLocalDescription(a);
            await updateDoc(doc(db, 'calls', call.id), { answer: a });
          } catch (e) { console.error('Answer error:', e); }
        }
        if (isCaller && data.answer && !p.currentRemoteDescription) {
          try { await p.setRemoteDescription(new RTCSessionDescription(data.answer)); } catch (e) { console.error('Set answer error:', e); }
        }
        if (data.iceCandidates) {
          const existing = (p as any)._addedCandidates || new Set();
          for (const c of data.iceCandidates) {
            const key = JSON.stringify(c);
            if (!existing.has(key)) {
              existing.add(key); (p as any)._addedCandidates = existing;
              try { await p.addIceCandidate(new RTCIceCandidate(c)); } catch { }
            }
          }
        }
      });
      return () => unsub();
    })();
    return () => { cancelled = true; pc.current?.close(); localStream.current?.getTracks().forEach(t => t.stop()); };
  }, [call.id, call.status]);

  const end = async () => {
    localStream.current?.getTracks().forEach(t => t.stop());
    await updateDoc(doc(db, 'calls', call.id), { status: 'ended', endedAt: serverTimestamp(), duration: dur });
    onEnd();
  };

  const lbl = call.status === 'ringing' ? (isCaller ? 'Ringing…' : 'Incoming call…') : call.status === 'active' ? fDur(dur) : call.status === 'declined' ? 'Declined' : 'Ended';
  const connColor = iceState === 'connected' || iceState === 'completed' ? '#22c55e' : iceState === 'failed' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: isV && isA ? '#000' : 'linear-gradient(160deg,#0a1628 0%,#0d2e1e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {isV && <video ref={rv} autoPlay playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isA ? 1 : 0, transition: 'opacity .5s' }} />}
      {isV && isA && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.45) 0%,transparent 40%,transparent 60%,rgba(0,0,0,.65) 100%)' }} />}
      {isV && <video ref={lv} autoPlay playsInline muted style={{ position: 'absolute', top: 20, right: 16, width: 'clamp(80px,22vw,110px)', height: 'clamp(112px,30vw,154px)', objectFit: 'cover', borderRadius: 14, border: '2px solid rgba(255,255,255,.25)', zIndex: 10, display: camOff ? 'none' : 'block' }} />}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', padding: '0 24px' }}>
        {(!isV || !isA) && (
          <>
            <div style={{ fontSize: 72, marginBottom: 4 }}>{isV ? '📹' : '📞'}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -.3 }}>{other}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', fontFamily: 'monospace' }}>{lbl}</div>
            <div style={{ fontSize: 11, color: connColor, fontWeight: 700 }}>
              {iceState === 'connected' ? '● Connected' : iceState === 'connecting' ? '◌ Connecting…' : iceState === 'failed' ? '✕ Connection failed' : ''}
            </div>
          </>
        )}
        {call.status === 'ringing' && !isCaller && (
          <div style={{ display: 'flex', gap: 28, marginTop: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button onClick={async () => { localStream.current?.getTracks().forEach(t => t.stop()); await updateDoc(doc(db, 'calls', call.id), { status: 'declined' }); onEnd(); }} style={{ width: 64, height: 64, borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', fontSize: 28, color: '#fff', boxShadow: '0 4px 20px rgba(239,68,68,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📵</button>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Decline</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button onClick={async () => { await updateDoc(doc(db, 'calls', call.id), { status: 'active', startedAt: serverTimestamp() }); }} style={{ width: 64, height: 64, borderRadius: '50%', background: '#22c55e', border: 'none', cursor: 'pointer', fontSize: 28, color: '#fff', boxShadow: '0 4px 20px rgba(34,197,94,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isV ? '📹' : '📞'}</button>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Accept</span>
            </div>
          </div>
        )}
      </div>
      {isA && (
        <div style={{ position: 'absolute', bottom: 48, display: 'flex', gap: 18, zIndex: 10, flexWrap: 'wrap', justifyContent: 'center', padding: '0 24px' }}>
          {[
            { i: muted ? '🔇' : '🎙', l: muted ? 'Unmute' : 'Mute', a: () => { setMuted(m => !m); localStream.current?.getAudioTracks().forEach(t => { t.enabled = muted; }); }, w: muted },
            ...(isV ? [{ i: camOff ? '🚫📷' : '📷', l: camOff ? 'Cam On' : 'Cam Off', a: () => { setCamOff(c => !c); localStream.current?.getVideoTracks().forEach(t => { t.enabled = camOff; }); }, w: camOff }] : []),
            { i: '📵', l: 'End', a: end, e: true },
          ].map((b: any, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button onClick={b.a} style={{ width: b.e ? 64 : 52, height: b.e ? 64 : 52, borderRadius: '50%', background: b.e ? '#ef4444' : b.w ? 'rgba(239,68,68,.25)' : 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', fontSize: b.e ? 26 : 20, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: b.e ? '0 6px 24px rgba(239,68,68,.45)' : 'none', transition: 'transform .1s' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(.92)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >{b.i}</button>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>{b.l}</span>
            </div>
          ))}
        </div>
      )}
      {isA && (
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(0,0,0,.4)', borderRadius: 99, padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'amx-rec 1s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{fDur(dur)}</span>
        </div>
      )}
    </div>
  );
}

// ─── TAG MODAL ─────────────────────────────────────────────────────────────────

function TagModal({ msgId, cur, onClose }: { msgId: string; cur: ClinTag; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const apply = async (tag: ClinTag) => {
    setSaving(true);
    await updateDoc(doc(db, 'messages', msgId), { clinTag: tag, taggedAt: serverTimestamp() });
    if (tag !== 'none') await addDoc(collection(db, 'medicalRecords'), { messageId: msgId, tag, createdAt: serverTimestamp() });
    setSaving(false); onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ background: '#131e2e', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 520, paddingBottom: 36, boxShadow: '0 -20px 60px rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.07)', borderBottom: 'none' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.18)', margin: '18px auto' }} />
        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, padding: '0 20px 12px' }}>Label as Medical Record</div>
        {(Object.entries(TAG) as [ClinTag, typeof TAG[ClinTag]][]).map(([tag, m]) => (
          <button key={tag} onClick={() => apply(tag)} disabled={saving} style={{ width: '100%', padding: '13px 20px', background: cur === tag ? m.bg : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'inherit', borderBottom: '1px solid rgba(255,255,255,.05)', transition: 'background .15s' }}
            onMouseEnter={e => { if (cur !== tag) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
            onMouseLeave={e => { if (cur !== tag) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 22 }}>{m.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: cur === tag ? m.color : '#e2e8f0' }}>{m.label}</span>
            {cur === tag && <span style={{ marginLeft: 'auto', color: m.color, fontSize: 16 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── EMOJI PICKER ─────────────────────────────────────────────────────────────

const EG = [
  { label: 'Smileys',   emojis: ['😀','😂','🥰','😍','😎','🤔','😢','😡','🥺','😏','🤗','😴','🤒','🤕','🥴','😤','🙄','😬','🤫','🤭'] },
  { label: 'Reactions', emojis: ['👍','👎','❤️','🔥','💯','✅','⚠️','🚨','💪','🙏','👏','🤝','👌','✌️','🫂','💔','💥','⭐','🎯','📌'] },
  { label: 'Medical',   emojis: ['💊','🩺','🏥','🧪','💉','🩻','🩸','🫀','🫁','🧠','👁️','🦷','🦴','🔬','🧬','⚕️','🩹','🧫','📋','📊'] },
];

function EPick({ onP, onC }: { onP: (e: string) => void; onC: () => void }) {
  const [tab, setTab] = useState(0);
  return (
    <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: '#131e2e', borderRadius: 16, width: 300, border: '1px solid rgba(255,255,255,.1)', zIndex: 400, boxShadow: '0 16px 48px rgba(0,0,0,.7)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)', background: '#0f1923' }}>
        {EG.map((g, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '9px 4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: tab === i ? '#00c9a7' : '#475569', borderBottom: `2px solid ${tab === i ? '#00c9a7' : 'transparent'}`, transition: 'all .15s', fontFamily: 'inherit' }}>{g.label}</button>
        ))}
        <button onClick={onC} style={{ padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 14, borderBottom: '2px solid transparent' }}>⌨</button>
      </div>
      <div style={{ padding: 10, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {EG[tab].emojis.map(e => (
          <button key={e} onClick={() => onP(e)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', borderRadius: 8, lineHeight: 1, transition: 'transform .1s, background .1s' }}
            onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,.1)'; ev.currentTarget.style.transform = 'scale(1.25)'; }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'none'; ev.currentTarget.style.transform = 'scale(1)'; }}
          >{e}</button>
        ))}
      </div>
      <div style={{ padding: '6px 10px 10px', borderTop: '1px solid rgba(255,255,255,.05)', textAlign: 'center' }}>
        <button onClick={onC} style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 99, padding: '4px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>⌨ Back to keyboard</button>
      </div>
    </div>
  );
}

// ─── MESSAGE BUBBLE ────────────────────────────────────────────────────────────

function Bub({ m, mine, isDoc, ps, onRx, onRep, onTag, onEd, onDel }: {
  m: Msg; mine: boolean; isDoc: boolean; ps?: boolean;
  onRx: (id: string, e: string) => void; onRep: (m: Msg) => void;
  onTag: (m: Msg) => void; onEd: (m: Msg) => void; onDel: (id: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const [menu, setMenu] = useState(false);
  const [rx, setRx] = useState(false);
  const tg = TAG[mTag(m)]; const del = !!m.deletedAt;
  const tick: Record<MsgStatus, string> = { sending: '○', sent: '✓', delivered: '✓✓', read: '✓✓' };
  const st = mSt(m); const isMedia = ['image', 'video'].includes(mType(m));

  useEffect(() => {
    if (!menu && !rx) return;
    const close = () => { setMenu(false); setRx(false); };
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [menu, rx]);

  const body = () => {
    if (del) return <span style={{ fontStyle: 'italic', opacity: .5, fontSize: 13 }}>This message was deleted</span>;
    switch (mType(m)) {
      case 'text': return <div style={{ fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.text}</div>;
      case 'image': return (
        <div style={{ borderRadius: 12, overflow: 'hidden', maxWidth: 248 }}>
          <img src={m.mediaUrl} alt="" style={{ width: '100%', display: 'block', cursor: 'pointer', minHeight: 80, objectFit: 'cover' }} onClick={() => window.open(m.mediaUrl, '_blank')} />
          {m.text && <div style={{ padding: '6px 12px 4px', fontSize: 13 }}>{m.text}</div>}
        </div>
      );
      case 'video': return <video src={m.mediaUrl} controls playsInline style={{ maxWidth: 248, borderRadius: 12, display: 'block' }} />;
      case 'voicenote': return <VNP url={m.mediaUrl || ''} wave={m.waveform || []} dur={m.duration || 0} mine={mine} />;
      case 'audio': return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 22 }}>🎵</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{m.mediaName}</div>
            <div style={{ fontSize: 10, opacity: .6 }}>{fSz(m.mediaSize || 0)}</div>
          </div>
        </div>
      );
      case 'document': case 'pdf': return (
        <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '2px 0' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{mType(m) === 'pdf' ? '📄' : '📎'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.mediaName || 'File'}</div>
            <div style={{ fontSize: 10, opacity: .6 }}>{fSz(m.mediaSize || 0)} · Tap to open</div>
          </div>
          <span style={{ fontSize: 16, opacity: .7 }}>⬇</span>
        </a>
      );
      case 'call_log': return <div style={{ display: 'flex', gap: 8, fontSize: 13, fontStyle: 'italic', opacity: .8 }}><span>{m.text?.includes('Video') ? '📹' : '📞'}</span><span>{m.text}</span></div>;
      default: return <div style={{ fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.text}</div>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: ps ? 2 : 10, paddingLeft: mine ? 40 : 0, paddingRight: mine ? 0 : 40, position: 'relative' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {!ps && !mine && m.senderName && (
        <div style={{ fontSize: 11, fontWeight: 800, color: m.senderRole === 'doctor' ? '#00c9a7' : '#60a5fa', marginBottom: 4 }}>
          {m.senderRole === 'doctor' ? '👨‍⚕️ ' : ''}{m.senderName}
        </div>
      )}
      {m.replyToId && (
        <div style={{ background: mine ? 'rgba(255,255,255,.08)' : 'rgba(0,201,167,.09)', borderLeft: `3px solid ${mine ? 'rgba(255,255,255,.35)' : '#00c9a7'}`, borderRadius: '0 9px 9px 0', padding: '5px 11px', marginBottom: 4, maxWidth: 240, fontSize: 11, opacity: .9 }}>
          <div style={{ fontWeight: 700, marginBottom: 1, fontSize: 11 }}>{m.replyToSender}</div>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: .75 }}>{m.replyToText}</div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: mine ? 'row-reverse' : 'row' }}>
        <div style={{
          maxWidth: isMedia ? 268 : 'min(300px,72vw)',
          background: mine ? 'linear-gradient(135deg,#00c9a7 0%,#0891b2 100%)' : '#1e2d42',
          borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: isMedia ? 0 : '10px 14px', color: '#fff',
          boxShadow: mine ? '0 3px 14px rgba(0,201,167,.28)' : '0 2px 8px rgba(0,0,0,.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          {mTag(m) !== 'none' && !del && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', marginBottom: isMedia ? 0 : 7, background: tg.bg, borderBottom: `1px solid ${tg.color}33` }}>
              <span style={{ fontSize: 13 }}>{tg.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: tg.color, textTransform: 'uppercase', letterSpacing: .7 }}>{tg.label}</span>
            </div>
          )}
          <div style={{ padding: isMedia ? 0 : undefined }}>{body()}</div>
          {!del && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 4, marginTop: isMedia ? 0 : 5, padding: isMedia ? '4px 10px' : undefined }}>
              {m.editedAt && <span style={{ fontSize: 9, opacity: .5 }}>edited</span>}
              <span style={{ fontSize: 10, opacity: .55, fontFamily: 'monospace' }}>{fT(m.timestamp)}</span>
              {mine && <span style={{ fontSize: 11, color: st === 'read' || m.read ? '#34d399' : 'rgba(255,255,255,.45)', fontWeight: 700 }}>{tick[st]}</span>}
            </div>
          )}
        </div>
        {hov && !del && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <button onClick={e => { e.stopPropagation(); setRx(r => !r); setMenu(false); }} style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a2332', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>😊</button>
            <button onClick={e => { e.stopPropagation(); onRep(m); }} style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a2332', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↩</button>
            <button onClick={e => { e.stopPropagation(); setMenu(v => !v); setRx(false); }} style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a2332', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', color: '#94a3b8', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋯</button>
          </div>
        )}
      </div>
      {(m.reactions || []).length > 0 && (
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
          {Object.entries((m.reactions || []).reduce((a: Record<string, number>, r) => ({ ...a, [r.emoji]: (a[r.emoji] || 0) + 1 }), {})).map(([e, c]) => (
            <span key={e} onClick={() => onRx(m.id, e)} style={{ fontSize: 12, background: '#1e2d42', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,.08)' }}>{e}{c > 1 ? ` ${c}` : ''}</span>
          ))}
        </div>
      )}
      {rx && (
        <div style={{ display: 'flex', gap: 3, background: '#1a2332', borderRadius: 99, padding: '6px 12px', border: '1px solid rgba(255,255,255,.09)', boxShadow: '0 10px 32px rgba(0,0,0,.55)', marginTop: 4, zIndex: 100 }}>
          {RX.map(e => (
            <button key={e} onClick={() => { onRx(m.id, e); setRx(false); }} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px', transition: 'transform .1s' }}
              onMouseEnter={ev => ev.currentTarget.style.transform = 'scale(1.35)'}
              onMouseLeave={ev => ev.currentTarget.style.transform = 'scale(1)'}
            >{e}</button>
          ))}
        </div>
      )}
      {menu && (
        <div style={{ position: 'absolute', [mine ? 'right' : 'left']: 38, top: 0, background: '#131e2e', borderRadius: 13, border: '1px solid rgba(255,255,255,.1)', overflow: 'hidden', zIndex: 200, minWidth: 152, boxShadow: '0 14px 44px rgba(0,0,0,.6)' }} onClick={e => e.stopPropagation()}>
          {[
            { l: '↩ Reply', a: () => { onRep(m); setMenu(false); } },
            ...(isDoc ? [{ l: '🏷 Tag as…', a: () => { onTag(m); setMenu(false); } }] : []),
            ...(mine && mType(m) === 'text' ? [{ l: '✏️ Edit', a: () => { onEd(m); setMenu(false); } }] : []),
            ...(mine ? [{ l: '🗑 Delete', a: () => { onDel(m.id); setMenu(false); }, d: true }] : []),
          ].map((x: any, i) => (
            <button key={i} onClick={x.a} style={{ width: '100%', padding: '11px 15px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 13, color: x.d ? '#f87171' : '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,.04)', display: 'block', transition: 'background .1s' }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,.06)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'none'}
            >{x.l}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── THREAD ROW ────────────────────────────────────────────────────────────────

function TR({ t, ac, onClick }: { t: Thread; ac: boolean; onClick: () => void }) {
  const nm = t.partnerRole === 'doctor' ? `Dr. ${t.partnerName}` : t.partnerName;
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px 14px',
      background: ac ? 'rgba(0,201,167,.1)' : 'transparent',
      border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'inherit',
      borderLeft: `3px solid ${ac ? '#00c9a7' : 'transparent'}`,
      transition: 'all .12s', textAlign: 'left',
    }}
      onMouseEnter={e => { if (!ac) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
      onMouseLeave={e => { if (!ac) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Av n={nm} sz={46} on={t.open} />
        {!t.open && (
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: 15, height: 15, borderRadius: '50%', background: '#1e2d42', border: '2px solid #0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>🔒</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: ac ? '#00c9a7' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{nm}</div>
          <div style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 4 }}>{fD(t.lastAt)}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 155, fontStyle: !t.open ? 'italic' : undefined }}>
            {!t.open ? 'Chat inactive 🔒' : (t.lastText || t.partnerSpec || 'Tap to chat')}
          </div>
          {t.unread > 0 && (
            <div style={{ minWidth: 19, height: 19, borderRadius: 99, background: '#00c9a7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#0d1117', padding: '0 5px', flexShrink: 0 }}>{t.unread}</div>
          )}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  myId: string;
  myName: string;
  myRole: 'doctor' | 'patient';
  myAvatar?: string;
  mySpecialty?: string;
  defaultDoctorId?: string;
  defaultDoctorName?: string;
  initialThreadId?: string;   // ← ADD THIS LINE
}

export default function AmexanClinicalMessaging({
  myId, myName, myRole, myAvatar, mySpecialty,
  defaultDoctorId, defaultDoctorName, initialThreadId,
}: Props) {
  const isDoc = myRole === 'doctor';

  const [tidSet, setTidSet] = useState<Set<string>>(new Set());
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [specMap, setSpecMap] = useState<Record<string, string>>({});
  const [metaMap, setMetaMap] = useState<Record<string, { last: string; at: any; unread: number }>>({});
  const [sessMap, setSessMap] = useState<Record<string, { docId?: string; status: 'active' | 'inactive' }>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [editMsg, setEditMsg] = useState<Msg | null>(null);
  const [tagMsg, setTagMsg] = useState<Msg | null>(null);
  const [emoji, setEmoji] = useState(false);
  const [callMenu, setCallMenu] = useState(false);
  const [call, setCall] = useState<Call | null>(null);
  const [ptyping, setPtyping] = useState(false);
  const [loadMsgs, setLoadMsgs] = useState(false);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Track whether we've already auto-opened the default thread
  const defaultApplied = useRef(false);

  const vr = useVR();
  const botRef = useRef<HTMLDivElement>(null);
  const inpRef = useRef<HTMLTextAreaElement>(null);
  const tTmr = useRef<any>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── AUTO-OPEN DEFAULT DOCTOR THREAD ─────────────────────────────────────────
  // Called as soon as we have myId and defaultDoctorId.
  // Computes the deterministic threadId (sorted join), registers it in tidSet
  // so it appears in the sidebar, stores the partner name, and sets it active.
  useEffect(() => {
    if (!defaultDoctorId || !myId || defaultApplied.current) return;
    defaultApplied.current = true;

    const tid = mkTid(myId, defaultDoctorId);
    const partnerName = defaultDoctorName || 'Doctor';

    // Register thread immediately — even before any messages exist
    setTidSet(prev => {
      const next = new Set(prev);
      next.add(tid);
      return next;
    });

    // Store the partner's name so the sidebar renders correctly
    setNameMap(prev => ({
      ...prev,
      [defaultDoctorId]: partnerName,
    }));

    // Open the thread straight away
    setActiveId(tid);

    // Also look up the real name from Firestore in the background
    // (this will update the name map once resolved)
    ;(async () => {
      for (const col of ['users', 'patients', 'patientProfiles', 'services', 'doctors']) {
        try {
          const sn = await getDoc(doc(db, col, defaultDoctorId));
          if (sn.exists()) {
            const d = sn.data() as any;
            const nm = d.name || d.displayName || d.fullName || d.doctorName || d.patientName || d.email || partnerName;
            const sp = d.specialty || d.doctorSpecialty || d.specialization || '';
            setNameMap(p => ({ ...p, [defaultDoctorId]: nm }));
            if (sp) setSpecMap(p => ({ ...p, [defaultDoctorId]: sp }));
            return;
          }
        } catch { }
      }
    })();
  }, [defaultDoctorId, defaultDoctorName, myId]);

useEffect(() => {
  if (!initialThreadId || !ready) return;
  if (tidSet.has(initialThreadId)) {
    setActiveId(initialThreadId);
  } else {
    const timer = setTimeout(() => {
      if (tidSet.has(initialThreadId)) setActiveId(initialThreadId);
    }, 500);
    return () => clearTimeout(timer);
  }
}, [initialThreadId, ready, tidSet]);// ── When defaultDoctorId changes (e.g. user taps a different doctor) ─────────
  // Reset the guard and re-apply
  useEffect(() => {
    defaultApplied.current = false;
  }, [defaultDoctorId]);

  const threads = useMemo<Thread[]>(() => {
    const arr: Thread[] = [];
    tidSet.forEach(tid => {
      const pid = otherUid(tid, myId);
      if (!pid || pid === myId) return;
      const sess = sessMap[tid];
      const meta = metaMap[tid];
      arr.push({
        threadId: tid, partnerUid: pid,
        partnerName: nameMap[pid] || pid.slice(0, 8) + '…',
        partnerRole: isDoc ? 'patient' : 'doctor',
        partnerSpec: specMap[pid],
        open: sess?.status !== 'inactive',
        lastText: meta?.last, lastAt: meta?.at, unread: meta?.unread || 0,
      });
    });
    return arr.sort((a, b) => (b.lastAt?.toMillis?.() ?? 0) - (a.lastAt?.toMillis?.() ?? 0));
  }, [tidSet, myId, nameMap, specMap, metaMap, sessMap, isDoc]);

  const active = useMemo(() => threads.find(t => t.threadId === activeId) || null, [threads, activeId]);
  const partnerUid = activeId ? otherUid(activeId, myId) : null;

  const lookupPartner = useCallback(async (uid: string) => {
    if (!uid || nameMap[uid]) return;
    for (const col of ['users', 'patients', 'patientProfiles', 'services', 'doctors']) {
      try {
        const sn = await getDoc(doc(db, col, uid));
        if (sn.exists()) {
          const d = sn.data() as any;
          const nm = d.name || d.displayName || d.fullName || d.doctorName || d.patientName || d.email || uid.slice(0, 8) + '…';
          const sp = d.specialty || d.doctorSpecialty || d.specialization || '';
          setNameMap(p => ({ ...p, [uid]: nm }));
          if (sp) setSpecMap(p => ({ ...p, [uid]: sp }));
          return;
        }
      } catch { }
    }
    setNameMap(p => ({ ...p, [uid]: uid.slice(0, 8) + '…' }));
  }, [nameMap]);

  // Thread discovery from existing messages
  useEffect(() => {
    if (!myId) return;
    const merge = (newIds: string[]) => {
      setTidSet(prev => {
        const next = new Set(prev);
        newIds.forEach(id => next.add(id));
        if (next.size === prev.size && [...next].every(id => prev.has(id))) return prev;
        next.forEach(tid => { const pid = otherUid(tid, myId); if (pid && pid !== myId) lookupPartner(pid); });
        return next;
      });
      setReady(true);
    };
    const u1 = onSnapshot(
      query(collection(db, 'messages'), where('senderId', '==', myId), limit(500)),
      snap => { merge(snap.docs.map(d => d.data().threadId).filter(Boolean)); },
      () => setReady(true)
    );
    const u2 = onSnapshot(
      query(collection(db, 'messages'), where('threadId', '>=', myId + '_'), where('threadId', '<', myId + '`'), limit(500)),
      snap => { merge(snap.docs.map(d => d.data().threadId).filter(Boolean)); },
      () => setReady(true)
    );
    return () => { u1(); u2(); };
  }, [myId]);

  // Last message + unread
  useEffect(() => {
    if (!tidSet.size) return;
    const uns: (() => void)[] = [];
    tidSet.forEach(tid => {
      const u = onSnapshot(
        query(collection(db, 'messages'), where('threadId', '==', tid), orderBy('timestamp', 'desc'), limit(1)),
        snap => {
          if (snap.empty) return;
          const last = snap.docs[0].data();
          getDocs(query(collection(db, 'messages'), where('threadId', '==', tid), where('read', '==', false), where('senderId', '!=', myId)))
            .then(u2 => setMetaMap(p => ({ ...p, [tid]: { last: last.text || (last.type ? `[${last.type}]` : '[Media]'), at: last.timestamp, unread: u2.size } })))
            .catch(() => setMetaMap(p => ({ ...p, [tid]: { last: last.text || '…', at: last.timestamp, unread: 0 } })));
        }
      );
      uns.push(u);
    });
    return () => uns.forEach(u => u());
  }, [Array.from(tidSet).join(','), myId]);

  // Chat sessions
  useEffect(() => {
    if (!myId) return;
    const field = isDoc ? 'doctorId' : 'patientId';
    const u = onSnapshot(
      query(collection(db, 'chatSessions'), where(field, '==', myId)),
      snap => { const m: typeof sessMap = {}; snap.docs.forEach(d => { const s = d.data() as any; if (s.threadId) m[s.threadId] = { docId: d.id, status: s.status }; }); setSessMap(m); },
      () => {}
    );
    return () => u();
  }, [myId, isDoc]);

  // Load messages for active thread
  useEffect(() => {
    if (!activeId) { setMsgs([]); return; }
    setLoadMsgs(true);
    const u = onSnapshot(
      query(collection(db, 'messages'), where('threadId', '==', activeId), orderBy('timestamp', 'asc'), limit(200)),
      snap => {
        setMsgs(snap.docs.map(d => {
          const v = d.data();
          return {
            id: d.id, threadId: v.threadId, senderId: v.senderId, senderRole: v.senderRole,
            senderName: v.senderName, text: v.text, read: v.read ?? false, timestamp: v.timestamp,
            type: v.type || 'text', mediaUrl: v.mediaUrl, mediaName: v.mediaName, mediaSize: v.mediaSize,
            waveform: v.waveform, duration: v.duration, clinTag: v.clinTag || 'none',
            reactions: v.reactions || [], replyToId: v.replyToId, replyToText: v.replyToText,
            replyToSender: v.replyToSender, editedAt: v.editedAt, deletedAt: v.deletedAt,
            status: (v.status as MsgStatus) || (v.read ? 'read' : 'delivered'),
          } as Msg;
        }));
        setLoadMsgs(false);
        snap.docs.filter(d => !d.data().read && d.data().senderId !== myId)
          .forEach(d => updateDoc(d.ref, { read: true, status: 'read' }));
      }
    );
    return () => u();
  }, [activeId, myId]);

  // Typing presence
  useEffect(() => {
    if (!activeId || !partnerUid) return;
    const u = onSnapshot(doc(db, 'typing', `${activeId}_${partnerUid}`), s => setPtyping(s.data()?.typing === true));
    return () => u();
  }, [activeId, partnerUid]);

  // Incoming calls
  useEffect(() => {
    if (!myId) return;
    const u = onSnapshot(
      query(collection(db, 'calls'), where('receiverId', '==', myId), where('status', '==', 'ringing')),
      s => { if (!s.empty) setCall({ id: s.docs[0].id, ...s.docs[0].data() } as Call); }
    );
    return () => u();
  }, [myId]);

  useEffect(() => { botRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const emitTyping = useCallback(() => {
    if (!activeId) return;
    const r = doc(db, 'typing', `${activeId}_${myId}`);
    setDoc(r, { typing: true, at: serverTimestamp() }, { merge: true });
    if (tTmr.current) clearTimeout(tTmr.current);
    tTmr.current = setTimeout(() => setDoc(r, { typing: false }, { merge: true }), 2000);
  }, [activeId, myId]);

  const send = useCallback(async (type: MsgType = 'text', extra: Partial<Msg> = {}) => {
    if (!activeId) return;
    if (sessMap[activeId]?.status === 'inactive') return;
    const txt = input.trim();
    if (type === 'text' && !txt) return;
    setSending(true);
    try {
      const basePayload: Record<string, any> = {
        threadId: activeId, senderId: myId, senderRole: myRole, senderName: myName,
        text: type === 'text' ? txt : (extra.text ?? null),
        type, clinTag: 'none', reactions: [], read: false, status: 'sending',
        timestamp: serverTimestamp(),
      };
      if (replyTo) {
        if (replyTo.id !== undefined) basePayload.replyToId = replyTo.id;
        if (replyTo.text !== undefined || replyTo.mediaName !== undefined) basePayload.replyToText = replyTo.text || replyTo.mediaName || '';
        if (replyTo.senderName !== undefined) basePayload.replyToSender = replyTo.senderName || 'Unknown';
      }
      for (const [k, v] of Object.entries(extra)) { if (v !== undefined) basePayload[k] = v; }
      const r = await addDoc(collection(db, 'messages'), cleanPayload(basePayload));
      await updateDoc(r, { status: 'sent' });
      setTimeout(() => updateDoc(r, { status: 'delivered' }), 600);
      setInput(''); setReplyTo(null); setEditMsg(null);
      setDoc(doc(db, 'typing', `${activeId}_${myId}`), { typing: false }, { merge: true });
    } catch (e) { console.error('Send message error:', e); }
    setSending(false);
  }, [activeId, sessMap, input, myId, myRole, myName, replyTo]);

  const upload = useCallback(async (file: File) => {
    if (!activeId) return;
    const ext = file.name.split('.').pop() || 'bin';
    const path = `chats/${activeId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const task = uploadBytesResumable(sRef(storage, path), file);
    setPct(0);
    task.on('state_changed',
      s => setPct(Math.round(s.bytesTransferred / s.totalBytes * 100)),
      e => { console.error(e); setPct(null); alert('Upload failed. Please try again.'); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        const m = file.type;
        let tp: MsgType = 'document';
        if (m.startsWith('image/')) tp = 'image';
        else if (m.startsWith('video/')) tp = 'video';
        else if (m.startsWith('audio/')) tp = 'audio';
        else if (m === 'application/pdf') tp = 'pdf';
        await send(tp, { mediaUrl: url, mediaName: file.name, mediaSize: file.size });
        setPct(null);
      }
    );
  }, [activeId, send]);

  const sendVN = useCallback(async () => {
    const { blob, dur, wave } = await vr.stop();
    if (!activeId || blob.size < 200) return;
    const path = `chats/${activeId}/vn_${Date.now()}.webm`;
    uploadBytesResumable(sRef(storage, path), blob).on('state_changed', null, err => console.error('VN upload error:', err),
      async () => {
        const url = await getDownloadURL(sRef(storage, path));
        await send('voicenote', { mediaUrl: url, duration: dur, waveform: wave });
      }
    );
  }, [vr, activeId, send]);

  const startCall = useCallback(async (type: CallType) => {
    if (!active || !partnerUid) return;
    const other = active.partnerRole === 'doctor' ? `Dr. ${active.partnerName}` : active.partnerName;
    const r = await addDoc(collection(db, 'calls'), cleanPayload({
      threadId: activeId, callerId: myId, callerName: myName,
      receiverId: partnerUid, receiverName: other,
      type, status: 'ringing', createdAt: serverTimestamp(),
    }));
    setCall({ id: r.id, threadId: activeId!, callerId: myId, callerName: myName, receiverId: partnerUid, receiverName: other, type, status: 'ringing' });
    setCallMenu(false);
  }, [active, activeId, partnerUid, myId, myName]);

  const reactTo = useCallback(async (id: string, e: string) => {
    const sn = await getDoc(doc(db, 'messages', id));
    const cur: Reaction[] = sn.data()?.reactions || [];
    const idx = cur.findIndex(r => r.uid === myId && r.emoji === e);
    await updateDoc(doc(db, 'messages', id), { reactions: idx >= 0 ? cur.filter((_, i) => i !== idx) : [...cur, { emoji: e, uid: myId }] });
  }, [myId]);

  const saveEdit = useCallback(async () => {
    if (!editMsg) return;
    await updateDoc(doc(db, 'messages', editMsg.id), { text: input, editedAt: serverTimestamp() });
    setInput(''); setEditMsg(null);
  }, [editMsg, input]);

  const delMsg = useCallback(async (id: string) => {
    await updateDoc(doc(db, 'messages', id), { deletedAt: serverTimestamp(), text: null, mediaUrl: null });
  }, []);

  const toggleSess = useCallback(async () => {
    if (!isDoc || !active) return;
    const cur = sessMap[active.threadId];
    const newSt = (cur?.status ?? 'active') === 'active' ? 'inactive' : 'active';
    const sr = cur?.docId ? doc(db, 'chatSessions', cur.docId) : doc(collection(db, 'chatSessions'));
    await setDoc(sr, cleanPayload({ threadId: active.threadId, doctorId: isDoc ? myId : active.partnerUid, patientId: isDoc ? active.partnerUid : myId, status: newSt, [newSt === 'active' ? 'activatedAt' : 'deactivatedAt']: serverTimestamp() }), { merge: true });
    if (newSt === 'active') {
      await addDoc(collection(db, 'alerts'), cleanPayload({
        patientId: active.partnerUid, doctorId: myId, type: 'chat',
        title: `💬 Dr. ${myName} opened the chat`,
        message: 'Your doctor has activated the messaging session.',
        read: false, createdAt: serverTimestamp(), urgency: 'routine',
      }));
    }
  }, [isDoc, active, sessMap, myId, myName]);

  const grouped = useMemo(() => {
    const g: { date: string; msgs: Msg[] }[] = []; let cur = '';
    msgs.forEach(m => {
      const d = fD(m.timestamp) || 'Today';
      if (d !== cur) { cur = d; g.push({ date: d, msgs: [] }); }
      if (g.length > 0) g[g.length - 1].msgs.push(m);
    });
    return g;
  }, [msgs]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editMsg ? saveEdit() : send(); }
  };

  if (!myId || !myName) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200, gap: 10, color: '#334155', fontSize: 13 }}>
        <div style={{ width: 20, height: 20, border: '2px solid #1e2d42', borderTopColor: '#00c9a7', borderRadius: '50%', animation: 'amx-spin .7s linear infinite' }} />
        <span>Connecting…</span>
        <style>{`@keyframes amx-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const pName = active ? (active.partnerRole === 'doctor' ? `Dr. ${active.partnerName}` : active.partnerName) : '';
  const sessIsOpen = active ? (sessMap[active.threadId]?.status !== 'inactive') : false;
  const showSidebar = !isMobile || !activeId;
  const showChat = !isMobile || !!activeId;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        .amx{font-family:'Sora',sans-serif;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        .amx *{box-sizing:border-box;}
        .amx-sc{scrollbar-width:thin;scrollbar-color:#1e2d42 transparent;}
        .amx-sc::-webkit-scrollbar{width:4px;}
        .amx-sc::-webkit-scrollbar-thumb{background:#1e2d42;border-radius:99px;}
        @keyframes amx-spin{to{transform:rotate(360deg)}}
        @keyframes amx-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @keyframes amx-rec{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes amx-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes amx-dots{0%,80%,100%{transform:scale(0);opacity:.5}40%{transform:scale(1);opacity:1}}
        .amx-bub{animation:amx-in .18s ease;}
        .amx-dot-1{animation:amx-dots 1.2s ease-in-out infinite .0s;}
        .amx-dot-2{animation:amx-dots 1.2s ease-in-out infinite .2s;}
        .amx-dot-3{animation:amx-dots 1.2s ease-in-out infinite .4s;}
        @media(max-width:767px){
          .amx-bubble-btn{min-width:44px;min-height:44px;}
          .amx-send-btn{width:48px!important;height:48px!important;}
          .amx-action-btn{width:32px!important;height:32px!important;}
        }
      `}</style>

      {call && call.status !== 'ended' && call.status !== 'declined' && (
        <CallUI
          call={call} myId={myId} isCaller={call.callerId === myId}
          other={call.callerId === myId ? call.receiverName : call.callerName}
          onEnd={async () => {
            await addDoc(collection(db, 'messages'), cleanPayload({
              threadId: call.threadId, senderId: myId, senderRole: myRole, senderName: myName,
              type: 'call_log',
              text: `${call.type === 'video' ? '📹 Video' : '📞 Voice'} call · ${fDur(call.duration || 0)}`,
              clinTag: 'none', reactions: [], read: false, status: 'sent', timestamp: serverTimestamp(),
            }));
            setCall(null);
          }}
        />
      )}

      {tagMsg && <TagModal msgId={tagMsg.id} cur={mTag(tagMsg)} onClose={() => setTagMsg(null)} />}

      <div className="amx" style={{ display: 'flex', height: '100%', minHeight: 0, background: '#0d1117', color: '#e2e8f0', overflow: 'hidden', borderRadius: isMobile ? 0 : 16 }}>

        {/* ══════ SIDEBAR ══════ */}
        {showSidebar && (
          <div style={{ width: isMobile ? '100%' : 300, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
            <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(13,17,23,.98)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#00c9a7,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 2px 12px rgba(0,201,167,.3)' }}>🏥</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', letterSpacing: -.3 }}>AMEXAN</div>
                  <div style={{ fontSize: 9, color: '#00c9a7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>Clinical Messaging</div>
                </div>
                <div style={{ marginLeft: 'auto' }}><Av n={myName} url={myAvatar} sz={32} on /></div>
              </div>
              <div style={{ background: '#161b22', borderRadius: 10, display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8, border: '1px solid rgba(255,255,255,.06)' }}>
                <span style={{ opacity: .35, fontSize: 13 }}>🔍</span>
                <input placeholder="Search conversations…" style={{ background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13, flex: 1, fontFamily: 'Sora,sans-serif' }} />
              </div>
            </div>

            <div className="amx-sc" style={{ flex: 1, overflowY: 'auto' }}>
              {!ready && !defaultDoctorId ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 8, color: '#334155', fontSize: 12 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #1e2d42', borderTopColor: '#00c9a7', borderRadius: '50%', animation: 'amx-spin .7s linear infinite' }} />
                  Loading…
                </div>
              ) : threads.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: '#334155' }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>💬</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>No conversations yet</div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: '#334155' }}>
                    {isDoc ? 'Conversations will appear here once you and a patient have exchanged messages.' : 'Your doctor will appear here once they message you.'}
                  </div>
                </div>
              ) : (
                threads.map(t => <TR key={t.threadId} t={t} ac={t.threadId === activeId} onClick={() => setActiveId(t.threadId)} />)
              )}
            </div>

            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(13,17,23,.98)' }}>
              <Av n={myName} url={myAvatar} sz={32} on />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{myName}</div>
                <div style={{ fontSize: 10, color: '#00c9a7', fontWeight: 600 }}>{isDoc ? `👨‍⚕️ ${mySpecialty || 'Doctor'}` : '🧑 Patient'}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            </div>
          </div>
        )}

        {/* ══════ CHAT AREA ══════ */}
        {showChat && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0d1117' }}>
            {active ? (
              <>
                <div style={{ padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(13,17,23,.98)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0, zIndex: 10 }}>
                  {isMobile && (
                    <button onClick={() => setActiveId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, padding: '0 8px 0 0', display: 'flex', alignItems: 'center', minWidth: 44, minHeight: 44, justifyContent: 'center' }}>←</button>
                  )}
                  <Av n={pName} sz={40} on={sessIsOpen} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {pName}
                      {active.partnerSpec && <span style={{ fontSize: 11, color: '#00c9a7', marginLeft: 6 }}>· {active.partnerSpec}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: sessIsOpen ? '#22c55e' : '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {ptyping ? (
                        <span style={{ color: '#00c9a7', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="amx-dot-1" style={{ width: 5, height: 5, borderRadius: '50%', background: '#00c9a7', display: 'inline-block' }} />
                          <span className="amx-dot-2" style={{ width: 5, height: 5, borderRadius: '50%', background: '#00c9a7', display: 'inline-block' }} />
                          <span className="amx-dot-3" style={{ width: 5, height: 5, borderRadius: '50%', background: '#00c9a7', display: 'inline-block' }} />
                          <span style={{ marginLeft: 3 }}>typing</span>
                        </span>
                      ) : sessIsOpen ? '● Active · 🔒 E2E Encrypted' : '○ Inactive · 🔒'}
                    </div>
                  </div>

                  {sessIsOpen && (
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setCallMenu(m => !m)} style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.09)', cursor: 'pointer', color: '#94a3b8', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,201,167,.15)'; e.currentTarget.style.color = '#00c9a7'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = '#94a3b8'; }}
                      >📞</button>
                      {callMenu && (
                        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#131e2e', borderRadius: 13, border: '1px solid rgba(255,255,255,.1)', overflow: 'hidden', zIndex: 200, minWidth: 160, boxShadow: '0 14px 44px rgba(0,0,0,.6)' }}>
                          <button onClick={() => startCall('voice')} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Sora,sans-serif', fontSize: 13, color: '#e2e8f0', display: 'flex', gap: 10, borderBottom: '1px solid rgba(255,255,255,.05)', alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >📞 Voice call</button>
                          <button onClick={() => startCall('video')} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Sora,sans-serif', fontSize: 13, color: '#e2e8f0', display: 'flex', gap: 10, alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >📹 Video call</button>
                        </div>
                      )}
                    </div>
                  )}

                  {isDoc && (
                    <button onClick={toggleSess} style={{ padding: '6px 12px', borderRadius: 8, background: sessIsOpen ? 'rgba(239,68,68,.1)' : 'rgba(0,201,167,.1)', border: `1px solid ${sessIsOpen ? 'rgba(239,68,68,.25)' : 'rgba(0,201,167,.25)'}`, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: sessIsOpen ? '#f87171' : '#00c9a7', fontFamily: 'Sora,sans-serif', whiteSpace: 'nowrap', transition: 'all .15s' }}>
                      {sessIsOpen ? '🔒 Deactivate' : '🔓 Activate'}
                    </button>
                  )}
                </div>

                {!sessIsOpen && (
                  <div style={{ padding: '9px 16px', background: 'rgba(245,158,11,.07)', borderBottom: '1px solid rgba(245,158,11,.12)', fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
                    🔒 {isDoc ? 'Session deactivated. Tap Activate to reopen.' : "Your doctor has closed this session. You'll be notified when it's reopened."}
                  </div>
                )}

                <div className="amx-sc" style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', background: '#0d1117', minHeight: 0 }}>
                  {loadMsgs && (
                    <div style={{ textAlign: 'center', padding: 36, color: '#334155', fontSize: 12 }}>
                      <div style={{ width: 22, height: 22, border: '2px solid #1e2d42', borderTopColor: '#00c9a7', borderRadius: '50%', animation: 'amx-spin .7s linear infinite', margin: '0 auto 8px' }} />
                      Loading messages…
                    </div>
                  )}
                  {!loadMsgs && msgs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '56px 28px', color: '#1e2d42' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No messages yet</div>
                      <div style={{ fontSize: 12, marginTop: 5, color: '#263346' }}>{sessIsOpen ? 'Say hello 👋' : 'Chat is currently inactive'}</div>
                    </div>
                  )}
                  {grouped.map(g => (
                    <Fragment key={g.date}>
                      <div style={{ textAlign: 'center', margin: '12px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', padding: '3px 12px', background: 'rgba(255,255,255,.025)', borderRadius: 99, border: '1px solid rgba(255,255,255,.05)', whiteSpace: 'nowrap' }}>{g.date}</div>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
                      </div>
                      {g.msgs.map((m, i) => (
                        <div key={m.id} className="amx-bub">
                          <Bub
                            m={m} mine={m.senderId === myId} isDoc={isDoc}
                            ps={i > 0 && g.msgs[i - 1].senderId === m.senderId}
                            onRx={reactTo} onRep={setReplyTo} onTag={setTagMsg}
                            onEd={m => { setEditMsg(m); setInput(m.text || ''); inpRef.current?.focus(); }}
                            onDel={delMsg}
                          />
                        </div>
                      ))}
                    </Fragment>
                  ))}
                  {ptyping && (
                    <div style={{ display: 'flex', gap: 4, padding: '4px 4px 8px', alignItems: 'center', marginLeft: 4 }}>
                      <div style={{ background: '#1e2d42', borderRadius: '18px 18px 18px 4px', padding: '10px 14px', display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span className="amx-dot-1" style={{ width: 7, height: 7, borderRadius: '50%', background: '#475569', display: 'inline-block' }} />
                        <span className="amx-dot-2" style={{ width: 7, height: 7, borderRadius: '50%', background: '#475569', display: 'inline-block' }} />
                        <span className="amx-dot-3" style={{ width: 7, height: 7, borderRadius: '50%', background: '#475569', display: 'inline-block' }} />
                      </div>
                    </div>
                  )}
                  <div ref={botRef} />
                </div>

                {sessIsOpen && (
                  <div style={{ padding: '8px 10px 10px', borderTop: '1px solid rgba(255,255,255,.06)', background: 'rgba(13,17,23,.98)', flexShrink: 0 }}>
                    {(replyTo || editMsg) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: 'rgba(0,201,167,.07)', borderRadius: 10, marginBottom: 8, borderLeft: '3px solid #00c9a7' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#00c9a7', marginBottom: 2 }}>{editMsg ? '✏️ Editing' : `↩ ${replyTo?.senderName}`}</div>
                          <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editMsg?.text || replyTo?.text || replyTo?.mediaName}</div>
                        </div>
                        <button onClick={() => { setReplyTo(null); setEditMsg(null); setInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 18, minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    )}

                    {vr.rec ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', flexShrink: 0, animation: 'amx-rec 1s infinite' }} />
                        <div style={{ flex: 1 }}>
                          <WF b={vr.wave} c="#ef4444" h={32} />
                          <div style={{ fontSize: 11, color: '#ef4444', fontFamily: 'monospace', marginTop: 3, fontWeight: 700 }}>{fDur(vr.secs)}</div>
                        </div>
                        <button onClick={vr.cancel} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.2)', cursor: 'pointer', color: '#ef4444', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Cancel">🗑</button>
                        <button onClick={sendVN} style={{ width: 48, height: 48, borderRadius: '50%', background: '#00c9a7', border: 'none', cursor: 'pointer', color: '#0d1117', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 16px rgba(0,201,167,.35)' }} title="Send">↑</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <button onClick={() => setEmoji(e => !e)} style={{ width: 40, height: 40, borderRadius: '50%', background: emoji ? 'rgba(0,201,167,.15)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 21, color: emoji ? '#00c9a7' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }} title="Emoji">😊</button>
                          {emoji && <EPick onP={e => { setInput(i => i + e); inpRef.current?.focus(); }} onC={() => setEmoji(false)} />}
                        </div>
                        <label style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#475569', cursor: 'pointer', flexShrink: 0, transition: 'color .15s' }}
                          onMouseEnter={e => (e.currentTarget as any).style.color = '#00c9a7'}
                          onMouseLeave={e => (e.currentTarget as any).style.color = '#475569'}
                          title="Attach file"
                        >
                          📎
                          <input type="file" accept="*/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
                        </label>
                        <div style={{ flex: 1, background: '#161b22', borderRadius: 20, border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'flex-end', padding: '0 8px' }}>
                          <textarea
                            ref={inpRef}
                            value={input}
                            onChange={e => { setInput(e.target.value); emitTyping(); }}
                            onKeyDown={handleKey}
                            placeholder={editMsg ? 'Edit message…' : replyTo ? `Reply to ${replyTo.senderName}…` : 'Message…'}
                            rows={1}
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 14, fontFamily: 'Sora,sans-serif', padding: '10px 6px', resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' }}
                            onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
                          />
                        </div>
                        {pct !== null && (
                          <div style={{ fontSize: 11, color: '#00c9a7', fontFamily: 'monospace', paddingBottom: 10, whiteSpace: 'nowrap', fontWeight: 700 }}>{pct}%</div>
                        )}
                        {input.trim() === '' && !editMsg ? (
                          <button
                            onTouchStart={async () => await vr.start()}
                            onMouseDown={async () => await vr.start()}
                            className="amx-send-btn"
                            style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#00c9a7,#0891b2)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 16px rgba(0,201,167,.3)', flexShrink: 0, transition: 'transform .1s' }}
                            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                            title="Hold to record"
                          >🎙</button>
                        ) : (
                          <button
                            onClick={editMsg ? saveEdit : () => send()}
                            disabled={sending || !input.trim()}
                            className="amx-send-btn"
                            style={{ width: 44, height: 44, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg,#00c9a7,#0891b2)' : '#1e2d42', border: 'none', cursor: input.trim() ? 'pointer' : 'default', color: input.trim() ? '#0d1117' : '#334155', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0, boxShadow: input.trim() ? '0 3px 16px rgba(0,201,167,.3)' : 'none' }}
                          >
                            {sending
                              ? <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,.2)', borderTopColor: '#0d1117', borderRadius: '50%', animation: 'amx-spin .6s linear infinite' }} />
                              : editMsg ? '✓' : '↑'
                            }
                          </button>
                        )}
                      </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: 5, fontSize: 9, color: '#1e2d42', fontWeight: 600, letterSpacing: .3 }}>
                      🔒 End-to-end encrypted · AMEXAN Health
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 36, textAlign: 'center' }}>
                <div style={{ fontSize: 64, filter: 'drop-shadow(0 4px 16px rgba(0,201,167,.2))' }}>🏥</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1e2d42', letterSpacing: -.3 }}>AMEXAN Clinical Messaging</div>
                <div style={{ fontSize: 13, color: '#263346', maxWidth: 280, lineHeight: 1.8 }}>
                  {isDoc ? 'Select a patient from the left to begin a clinical conversation.' : 'Select a conversation from the left to begin messaging your care team.'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  {['🔒 E2E Encrypted', '📋 Medical Tags', '📞 Voice & Video', '📁 All File Types', '🌐 WebRTC Powered'].map(f => (
                    <div key={f} style={{ padding: '5px 14px', borderRadius: 99, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', fontSize: 11, color: '#334155', fontWeight: 600 }}>{f}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}