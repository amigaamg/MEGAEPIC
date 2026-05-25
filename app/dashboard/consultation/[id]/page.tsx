'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  doc, getDoc, collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, storage, auth } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Consultation {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  status: string;
  notes: string;
  prescriptions: any[];
  startedAt: any;
}

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  patientNotes: string;
  scheduledTime?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  fileName?: string;
  fileSize?: number;
  createdAt: any;
  type: 'text' | 'media' | 'system';
}

interface RemotePeer {
  id: string;
  name: string;
  stream: MediaStream | null;
  audioMuted: boolean;
  videoMuted: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METERED_DOMAIN = 'videoamexan.metered.live';
const METERED_SECRET = '_R_tKrF3xSicInRntQvEGYkt6mM_Xj2uIKsA1Cc-FQqdrpfM';
const SDK_URL = 'https://cdn.metered.ca/sdk/video/1.4.9/video.min.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(ts: any): string {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Load Metered SDK — safe to call multiple times
function loadMeteredSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Metered) { resolve(); return; }
    const existing = document.getElementById('metered-sdk') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Metered SDK load failed')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'metered-sdk';
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Metered SDK. Check your internet connection.'));
    document.head.appendChild(s);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConsultationRoom() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.id as string;

  // ── Auth ──
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    return onAuthStateChanged(auth, u => { setUser(u); setAuthReady(true); });
  }, []);

  // ── Data ──
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  // ── Video ──
  const meetingRef = useRef<any>(null);
  const [videoJoined, setVideoJoined] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [remotePeers, setRemotePeers] = useState<Record<string, RemotePeer>>({});
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Chat ──
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── UI ──
  const [sidePanel, setSidePanel] = useState<'chat' | 'info'>('chat');
  const [showSide, setShowSide] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'chat' | 'info'>('video');
  const [isMobile, setIsMobile] = useState(false);

  // ── Responsive ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Load consultation + appointment ──
  useEffect(() => {
    if (!authReady || !user || !consultationId) return;
    (async () => {
      try {
        const cSnap = await getDoc(doc(db, 'consultations', consultationId));
        if (!cSnap.exists()) { setDataError('Consultation not found.'); setDataLoading(false); return; }
        const c = { id: cSnap.id, ...cSnap.data() } as Consultation;
        setConsultation(c);
        setIsDoctor(c.doctorId === user.uid);
        const aSnap = await getDoc(doc(db, 'appointments', c.appointmentId));
        if (aSnap.exists()) setAppointment({ id: aSnap.id, ...aSnap.data() } as Appointment);
      } catch (e: any) { setDataError(e.message); }
      setDataLoading(false);
    })();
    return onSnapshot(doc(db, 'consultations', consultationId), snap => {
      if (snap.exists()) setConsultation({ id: snap.id, ...snap.data() } as Consultation);
    });
  }, [authReady, user, consultationId]);

  // ── Real-time messages ──
  useEffect(() => {
    if (!consultationId) return;
    const q = query(
      collection(db, 'consultations', consultationId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
      setMessages(msgs);
      setUnreadCount(msgs.filter(m => m.senderId !== user?.uid && m.type !== 'system').length);
    });
  }, [consultationId, user?.uid]);

  // ── Auto-scroll chat ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Call duration timer ──
  useEffect(() => {
    if (videoJoined) {
      durationTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (durationTimerRef.current) { clearInterval(durationTimerRef.current); durationTimerRef.current = null; }
      setCallDuration(0);
    }
    return () => { if (durationTimerRef.current) clearInterval(durationTimerRef.current); };
  }, [videoJoined]);

  // ─── Join call ───────────────────────────────────────────────────────────────

  const joinCall = useCallback(async () => {
    if (!user || !consultation) return;
    setVideoLoading(true);
    setVideoError('');

    try {
      // 1) Load the SDK
      await loadMeteredSDK();

      const MeteredMeeting = (window as any).Metered?.Meeting;
      if (!MeteredMeeting) throw new Error('Metered SDK unavailable after loading. Please refresh.');

      // 2) Create instance and attach events BEFORE joining
      const mtg = new MeteredMeeting();
      meetingRef.current = mtg;

      const displayName = user.displayName
        || (isDoctor ? `Dr. ${appointment?.doctorName || 'Doctor'}` : appointment?.patientName || 'Patient');

      mtg.on('localTrackStarted', (item: any) => {
        if (item.type === 'video' && localVideoRef.current) {
          const stream = new MediaStream([item.track]);
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
      });

      mtg.on('localTrackUpdated', (item: any) => {
        if (item.type === 'video' && localVideoRef.current) {
          const stream = new MediaStream([item.track]);
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
      });

      mtg.on('remoteTrackStarted', (item: any, participant: any) => {
        const pid = String(participant.id ?? participant.participantSessionId ?? Math.random());
        setRemotePeers(prev => {
          const existing = prev[pid];
          const stream = existing?.stream ?? new MediaStream();
          stream.addTrack(item.track);
          // Attach to video element on next tick
          setTimeout(() => {
            const el = remoteVideoRefs.current[pid];
            if (el) { el.srcObject = stream; el.play().catch(() => {}); }
          }, 50);
          return {
            ...prev,
            [pid]: { ...(existing || {}), id: pid, name: participant.name || 'Remote', stream, audioMuted: false, videoMuted: false },
          };
        });
      });

      mtg.on('remoteTrackStopped', (_item: any, participant: any) => {
        const pid = String(participant.id ?? participant.participantSessionId);
        setRemotePeers(prev => {
          if (!prev[pid]) return prev;
          return { ...prev, [pid]: { ...prev[pid], stream: new MediaStream() } };
        });
      });

      mtg.on('participantJoined', (participant: any) => {
        const pid = String(participant.id ?? participant.participantSessionId);
        setRemotePeers(prev => ({
          ...prev,
          [pid]: prev[pid] ?? { id: pid, name: participant.name || 'Participant', stream: null, audioMuted: false, videoMuted: false },
        }));
      });

      mtg.on('participantLeft', (participant: any) => {
        const pid = String(participant.id ?? participant.participantSessionId);
        setRemotePeers(prev => { const { [pid]: _, ...rest } = prev; return rest; });
      });

      mtg.on('activeSpeaker', (data: any) => {
        setActiveSpeakerId(String(data?.id ?? data?.participantSessionId ?? ''));
      });

      mtg.on('remoteAudioVideoStateUpdated', (data: any) => {
        const pid = String(data.participantSessionId);
        setRemotePeers(prev => {
          if (!prev[pid]) return prev;
          return { ...prev, [pid]: { ...prev[pid], audioMuted: !!data.audioMuted, videoMuted: !!data.videoMuted } };
        });
      });

      // 3) Room name is the same for both sides — keyed by consultationId
      const roomName = `consult-${consultationId}`;
      let roomURL = `https://${METERED_DOMAIN}/${roomName}`;

      // Try to create/get room (POST is idempotent — returns existing room if name taken)
      try {
        const res = await fetch(`https://${METERED_DOMAIN}/api/v2/room?secretKey=${METERED_SECRET}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName, privacy: 'private' }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.roomUrl) roomURL = data.roomUrl;
          else if (data.roomName) roomURL = `https://${METERED_DOMAIN}/${data.roomName}`;
        }
        // 409 = room already exists — roomURL fallback is fine
      } catch (_) { /* use constructed roomURL */ }

      // 4) Get per-session access token
      let accessToken = '';
      try {
        const res = await fetch(
          `https://${METERED_DOMAIN}/api/v2/room/${encodeURIComponent(roomName)}/token?secretKey=${METERED_SECRET}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName, ejectAfterElapsedMinutes: 90 }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          accessToken = data.token || '';
        }
      } catch (_) { /* join without token */ }

      // 5) Join the room
      await mtg.join({
        roomURL,
        name: displayName,
        audio: true,
        video: true,
        ...(accessToken ? { accessToken } : {}),
      });

      // 6) Request HD quality
      try { await mtg.setMaxResolution('hd'); } catch (_) {}

      setVideoJoined(true);

      // 7) Announce in chat
      await addDoc(collection(db, 'consultations', consultationId, 'messages'), {
        senderId: 'system', senderName: 'System', type: 'system', read: true,
        text: `${isDoctor ? '👨‍⚕️ Doctor' : '🧑 Patient'} joined the call`,
        createdAt: serverTimestamp(),
      });

    } catch (e: any) {
      console.error('Metered join error:', e);
      setVideoError(e.message || 'Could not join video call. Please refresh and try again.');
      meetingRef.current = null;
    }
    setVideoLoading(false);
  }, [user, consultation, consultationId, isDoctor, appointment]);

  // ─── Video controls ───────────────────────────────────────────────────────────

  const toggleAudio = async () => {
    if (!meetingRef.current) return;
    try {
      if (audioMuted) await meetingRef.current.unmuteAudio();
      else await meetingRef.current.muteAudio();
      setAudioMuted(v => !v);
    } catch (_) {}
  };

  const toggleVideo = async () => {
    if (!meetingRef.current) return;
    try {
      if (videoMuted) await meetingRef.current.resumeVideo();
      else await meetingRef.current.pauseVideo();
      setVideoMuted(v => !v);
    } catch (_) {}
  };

  const leaveCall = async () => {
    try { await meetingRef.current?.leaveMeeting(); } catch (_) {}
    meetingRef.current = null;
    setVideoJoined(false);
    setRemotePeers({});
    setAudioMuted(false);
    setVideoMuted(false);
    setActiveSpeakerId(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const endConsultation = async () => {
    if (!confirm('End this consultation for everyone?')) return;
    await leaveCall();
    if (consultation) {
      await updateDoc(doc(db, 'consultations', consultationId), { status: 'completed', endedAt: serverTimestamp() });
      await updateDoc(doc(db, 'appointments', consultation.appointmentId), { status: 'completed' });
    }
    router.push('/dashboard');
  };

  // ─── Chat ─────────────────────────────────────────────────────────────────────

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !user) return;
    setInputText('');
    await addDoc(collection(db, 'consultations', consultationId, 'messages'), {
      senderId: user.uid,
      senderName: user.displayName || (isDoctor ? 'Doctor' : 'Patient'),
      text, type: 'text', read: false,
      createdAt: serverTimestamp(),
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const sendFile = async (file: File) => {
    if (!user || !file) return;
    if (file.size > 50 * 1024 * 1024) { alert('Max file size is 50 MB'); return; }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mediaType: ChatMessage['mediaType'] =
      ['jpg','jpeg','png','gif','webp','heic','avif'].includes(ext) ? 'image' :
      ['mp4','mov','avi','webm','mkv'].includes(ext) ? 'video' :
      ['mp3','ogg','wav','m4a','aac'].includes(ext) ? 'audio' : 'file';
    const path = `consultations/${consultationId}/${Date.now()}_${file.name}`;
    const task = uploadBytesResumable(storageRef(storage, path), file);
    setUploadProgress(0);
    task.on('state_changed',
      snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      err => { setUploadProgress(null); alert('Upload failed: ' + err.message); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setUploadProgress(null);
        await addDoc(collection(db, 'consultations', consultationId, 'messages'), {
          senderId: user.uid,
          senderName: user.displayName || (isDoctor ? 'Doctor' : 'Patient'),
          mediaUrl: url, mediaType, fileName: file.name, fileSize: file.size,
          type: 'media', read: false, createdAt: serverTimestamp(),
        });
      }
    );
  };

  // ── Ref callback for remote videos ──
  const setRemoteRef = useCallback((pid: string, el: HTMLVideoElement | null) => {
    remoteVideoRefs.current[pid] = el;
    if (el && remotePeers[pid]?.stream) {
      el.srcObject = remotePeers[pid].stream;
      el.play().catch(() => {});
    }
  }, [remotePeers]);

  // ─── Screens ──────────────────────────────────────────────────────────────────

  if (!authReady || dataLoading) return (
    <div style={S.center}>
      <div style={S.spinner} />
      <p style={{ color: '#64748b', marginTop: 14, fontSize: 14 }}>Preparing consultation room…</p>
    </div>
  );

  if (dataError) return (
    <div style={S.center}>
      <span style={{ fontSize: 44 }}>⚠️</span>
      <p style={{ color: '#f87171', marginTop: 10, fontWeight: 600 }}>{dataError}</p>
      <button style={S.btnBlue} onClick={() => router.push('/dashboard')}>← Dashboard</button>
    </div>
  );

  const remotePeerIds = Object.keys(remotePeers);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={S.root}>

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════════ */}
      <header style={S.topBar}>
        <div style={S.topLeft}>
          <span style={{ fontSize: 24 }}>🏥</span>
          <div>
            <div style={S.topName}>
              {isDoctor
                ? (appointment?.patientName || 'Patient')
                : `Dr. ${appointment?.doctorName || 'Doctor'}`}
            </div>
            <div style={S.topMeta}>
              {appointment?.specialty}
              {videoJoined && (
                <span style={S.durationBadge}>
                  <span style={S.liveDot} />
                  {fmtDuration(callDuration)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={S.topCenter}>
          {consultation?.status === 'active' && (
            <div style={S.activePill}>
              <span style={S.liveDot} />Session Active
            </div>
          )}
        </div>

        <div style={S.topRight}>
          {isMobile ? (
            <div style={{ display: 'flex', gap: 4 }}>
              {(['video', 'chat', 'info'] as const).map(t => (
                <button key={t}
                  style={activeTab === t ? { ...S.tabBtn, ...S.tabBtnOn } : { ...S.tabBtn, ...S.tabBtnOff }}
                  onClick={() => setActiveTab(t)}>
                  {t === 'video' ? '📹' : t === 'chat' ? '💬' : '📋'}
                  {t === 'chat' && unreadCount > 0 && <span style={S.badge}>{unreadCount}</span>}
                </button>
              ))}
            </div>
          ) : (
            <button
              style={showSide ? { ...S.iconBtn, ...S.iconBtnOn } : { ...S.iconBtn, ...S.iconBtnOff }}
              onClick={() => setShowSide(v => !v)}>
              💬 {unreadCount > 0 && <span style={S.badge}>{unreadCount}</span>}
            </button>
          )}
          <button style={S.btnRed} onClick={endConsultation}>End</button>
        </div>
      </header>

      {/* ══ BODY ════════════════════════════════════════════════════════════════ */}
      <div style={S.body}>

        {/* ── VIDEO ── */}
        {(!isMobile || activeTab === 'video') && (
          <div style={S.videoArea}>
            {!videoJoined ? (
              /* Pre-join screen */
              <div style={S.preJoin}>
                <div style={S.preJoinCard}>
                  <div style={{ fontSize: 52, marginBottom: 10 }}>🎥</div>
                  <h2 style={S.preJoinTitle}>Ready to Join?</h2>
                  <p style={S.preJoinSub}>
                    {isDoctor
                      ? `Consultation with ${appointment?.patientName || 'your patient'}`
                      : `Joining Dr. ${appointment?.doctorName || 'your doctor'}`}
                  </p>
                  {appointment?.patientNotes && (
                    <div style={S.notesBox}>
                      <span style={S.notesLabel}>PATIENT CONCERN</span>
                      <p style={S.notesText}>"{appointment.patientNotes}"</p>
                    </div>
                  )}
                  {videoError && <div style={S.vidErr}>{videoError}</div>}
                  <button style={S.joinBtn} onClick={joinCall} disabled={videoLoading}>
                    {videoLoading
                      ? <><span style={S.btnSpinner} />Connecting…</>
                      : '📹 Join Video Call'}
                  </button>
                  <p style={S.preJoinNote}>HD Video · Encrypted · Metered.live</p>
                </div>
              </div>
            ) : (
              /* Active call */
              <div style={S.callWrap}>

                {/* Remote video(s) */}
                {remotePeerIds.length > 0 ? (
                  <div style={{ ...S.remoteGrid, ...(remotePeerIds.length > 1 ? { flexWrap: 'wrap' as const } : {}) }}>
                    {remotePeerIds.map(pid => {
                      const peer = remotePeers[pid];
                      const speaking = activeSpeakerId === pid;
                      return (
                        <div key={pid}
                          style={speaking
                            ? { ...S.remoteTile, ...S.remoteTileSpeaking }
                            : S.remoteTile}>
                          <video
                            ref={el => setRemoteRef(pid, el)}
                            autoPlay playsInline
                            style={S.remoteVideo}
                          />
                          {peer.videoMuted && (
                            <div style={S.videoOffBg}>
                              <div style={S.avatarCircle}>
                                {(peer.name || 'R')[0].toUpperCase()}
                              </div>
                            </div>
                          )}
                          <div style={S.peerLabel}>
                            {peer.name}
                            {peer.audioMuted && ' 🔇'}
                            {speaking && <span style={S.speakDot} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Waiting screen */
                  <div style={S.waitingArea}>
                    <div style={S.waitingAvatar}>{isDoctor ? '🧑' : '👨‍⚕️'}</div>
                    <p style={S.waitingText}>
                      {isDoctor ? 'Waiting for patient to join…' : 'Waiting for doctor to join…'}
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {[0, 0.3, 0.6].map((delay, i) => (
                        <span key={i} style={{ ...S.dot, animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Local PIP */}
                <div style={S.localPip}>
                  <video ref={localVideoRef} autoPlay muted playsInline style={S.localVideo} />
                  {videoMuted && <div style={S.localOff}>📵</div>}
                  <div style={S.localLabel}>You{audioMuted ? ' 🔇' : ''}</div>
                </div>

                {/* Controls bar */}
                <div style={S.controls}>
                  <button
                    style={audioMuted
                      ? { ...S.ctrl, ...S.ctrlRed }
                      : { ...S.ctrl, ...S.ctrlNorm }}
                    onClick={toggleAudio}
                    title={audioMuted ? 'Unmute' : 'Mute'}>
                    {audioMuted ? '🔇' : '🎤'}
                  </button>
                  <button
                    style={videoMuted
                      ? { ...S.ctrl, ...S.ctrlRed }
                      : { ...S.ctrl, ...S.ctrlNorm }}
                    onClick={toggleVideo}
                    title={videoMuted ? 'Start video' : 'Stop video'}>
                    {videoMuted ? '📵' : '📹'}
                  </button>
                  <button
                    style={{ ...S.ctrl, ...S.ctrlNorm, position: 'relative' }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Share file">
                    📎
                    {unreadCount > 0 && <span style={S.ctrlBadge}>{unreadCount}</span>}
                  </button>
                  {!isMobile && (
                    <button
                      style={{ ...S.ctrl, ...S.ctrlNorm }}
                      onClick={() => setShowSide(v => !v)}
                      title="Toggle chat">
                      💬
                    </button>
                  )}
                  <button style={{ ...S.ctrl, ...S.ctrlLeave }} onClick={leaveCall}>
                    📴 Leave
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SIDE PANEL ── */}
        {((!isMobile && showSide) || (isMobile && activeTab !== 'video')) && (
          <div style={isMobile ? { ...S.sidePanel, ...S.sidePanelFull } : S.sidePanel}>

            {/* Desktop tabs */}
            {!isMobile && (
              <div style={S.panelTabBar}>
                <button
                  style={sidePanel === 'chat'
                    ? { ...S.panelTab, ...S.panelTabActive }
                    : { ...S.panelTab, ...S.panelTabInactive }}
                  onClick={() => setSidePanel('chat')}>
                  💬 Chat{unreadCount > 0 && <span style={S.badge}>{unreadCount}</span>}
                </button>
                <button
                  style={sidePanel === 'info'
                    ? { ...S.panelTab, ...S.panelTabActive }
                    : { ...S.panelTab, ...S.panelTabInactive }}
                  onClick={() => setSidePanel('info')}>
                  📋 Info
                </button>
              </div>
            )}

            {/* ── CHAT PANEL ── */}
            {(sidePanel === 'chat' || (isMobile && activeTab === 'chat')) && (
              <div style={S.chatWrap}>
                <div style={S.msgList}>
                  {messages.map(msg => {
                    if (msg.type === 'system') return (
                      <div key={msg.id} style={S.systemMsg}>{msg.text}</div>
                    );
                    const mine = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} style={mine ? { ...S.msgRow, ...S.msgRowMine } : S.msgRow}>
                        {!mine && <div style={S.msgAvatar}>{(msg.senderName || '?')[0]}</div>}
                        <div style={{ maxWidth: '72%' }}>
                          {!mine && <div style={S.msgSender}>{msg.senderName}</div>}
                          <div style={mine ? { ...S.bubble, ...S.bubbleMine } : { ...S.bubble, ...S.bubbleTheirs }}>
                            {msg.type === 'text' && <p style={S.msgTxt}>{msg.text}</p>}
                            {msg.mediaType === 'image' && (
                              <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                                <img src={msg.mediaUrl} alt={msg.fileName} style={S.msgImg} />
                              </a>
                            )}
                            {msg.mediaType === 'video' && (
                              <video src={msg.mediaUrl} controls style={S.msgVid} />
                            )}
                            {msg.mediaType === 'audio' && (
                              <audio src={msg.mediaUrl} controls style={{ width: '100%', marginTop: 4 }} />
                            )}
                            {msg.mediaType === 'file' && (
                              <a href={msg.mediaUrl} target="_blank" rel="noreferrer" style={S.msgFile}>
                                <span style={{ fontSize: 26 }}>📄</span>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: mine ? '#fff' : '#e2e8f0' }}>
                                    {msg.fileName}
                                  </div>
                                  {msg.fileSize && (
                                    <div style={{ fontSize: 11, opacity: 0.65 }}>{fmtSize(msg.fileSize)}</div>
                                  )}
                                </div>
                              </a>
                            )}
                          </div>
                          <div style={mine ? { ...S.msgTime, textAlign: 'right' as const } : S.msgTime}>
                            {fmtTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {uploadProgress !== null && (
                    <div style={S.uploadWrap}>
                      <div style={{ ...S.uploadBar, width: `${uploadProgress}%` }} />
                      <span style={S.uploadTxt}>Uploading {uploadProgress}%</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div style={S.inputRow}>
                  <button style={S.attachBtn} onClick={() => fileInputRef.current?.click()}>📎</button>
                  <textarea
                    style={S.chatInput}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Message… (Enter to send)"
                    rows={1}
                  />
                  <button
                    style={inputText.trim() ? { ...S.sendBtn, ...S.sendBtnOn } : S.sendBtn}
                    onClick={sendMessage}
                    disabled={!inputText.trim()}>
                    ➤
                  </button>
                </div>
              </div>
            )}

            {/* ── INFO PANEL ── */}
            {(sidePanel === 'info' || (isMobile && activeTab === 'info')) && (
              <div style={S.infoWrap}>
                <div style={S.infoCard}>
                  <div style={S.infoCardTitle}>📋 APPOINTMENT</div>
                  <div style={S.infoRow}><span>Patient</span><strong>{appointment?.patientName}</strong></div>
                  <div style={S.infoRow}><span>Doctor</span><strong>Dr. {appointment?.doctorName}</strong></div>
                  <div style={S.infoRow}><span>Specialty</span><strong>{appointment?.specialty}</strong></div>
                  {appointment?.scheduledTime && (
                    <div style={S.infoRow}><span>Time</span><strong>{appointment.scheduledTime}</strong></div>
                  )}
                </div>
                {appointment?.patientNotes && (
                  <div style={S.infoCard}>
                    <div style={S.infoCardTitle}>💬 PATIENT CONCERN</div>
                    <p style={S.concernTxt}>"{appointment.patientNotes}"</p>
                  </div>
                )}
                {isDoctor && (
                  <div style={S.infoCard}>
                    <div style={S.infoCardTitle}>⚕️ CONTROLS</div>
                    <button style={S.actionBtn} onClick={endConsultation}>
                      ✅ End &amp; Complete Session
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        onChange={e => { if (e.target.files?.[0]) sendFile(e.target.files[0]); e.target.value = ''; }}
      />

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0f1e;overflow:hidden}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes blink{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        textarea:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px}
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// RULE: Never mix border shorthand with borderBottom/borderTop/etc.
// Every border uses explicit longhand: borderWidth + borderStyle + borderColor

const S: Record<string, React.CSSProperties> = {

  root: {
    display: 'flex', flexDirection: 'column',
    height: '100dvh', width: '100%',
    background: '#0a0f1e', color: '#e2e8f0',
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    overflow: 'hidden',
  },

  center: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', background: '#0a0f1e', gap: 10,
  },

  spinner: {
    width: 44, height: 44,
    borderWidth: 3, borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,.08)', borderTopColor: '#0ea5e9',
    borderRadius: '50%', animation: 'spin .8s linear infinite',
  },

  // Top bar
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px', minHeight: 60, flexShrink: 0,
    background: 'rgba(15,23,42,.97)',
    borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0,
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'rgba(255,255,255,.07)',
    backdropFilter: 'blur(12px)', zIndex: 50,
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  topName: { fontWeight: 700, fontSize: 16, color: '#f1f5f9' },
  topMeta: { fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 },
  topCenter: { display: 'flex', alignItems: 'center' },
  topRight: { display: 'flex', alignItems: 'center', gap: 10 },

  liveDot: {
    display: 'inline-block', width: 7, height: 7,
    borderRadius: '50%', background: '#10b981',
    animation: 'pulse 2s ease-in-out infinite', flexShrink: 0,
  },
  activePill: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(16,185,129,.12)', color: '#10b981',
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(16,185,129,.25)',
  },
  durationBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(16,185,129,.15)', color: '#10b981',
    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 18, height: 18, background: '#ef4444', color: '#fff',
    borderRadius: 9, fontSize: 10, fontWeight: 700, padding: '0 4px', marginLeft: 4,
  },
  tabBtn: {
    padding: '6px 11px', borderRadius: 8, fontSize: 17,
    cursor: 'pointer', position: 'relative',
    borderWidth: 1, borderStyle: 'solid',
  },
  tabBtnOn:  { background: 'rgba(14,165,233,.18)', borderColor: 'rgba(14,165,233,.35)', color: '#0ea5e9' },
  tabBtnOff: { background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.08)', color: '#64748b' },
  iconBtn: {
    padding: '8px 14px', borderRadius: 10, fontSize: 14, cursor: 'pointer',
    borderWidth: 1, borderStyle: 'solid', position: 'relative',
  },
  iconBtnOn:  { background: 'rgba(14,165,233,.15)', borderColor: 'rgba(14,165,233,.3)', color: '#38bdf8' },
  iconBtnOff: { background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.1)', color: '#94a3b8' },
  btnBlue: {
    marginTop: 14, padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700,
    background: '#0ea5e9', color: '#fff',
    borderWidth: 0, borderStyle: 'solid', borderColor: 'transparent', cursor: 'pointer',
  },
  btnRed: {
    padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
    background: 'rgba(239,68,68,.14)', color: '#ef4444',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(239,68,68,.3)', cursor: 'pointer',
  },

  // Body + video
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  videoArea: { flex: 1, position: 'relative', overflow: 'hidden', background: '#050a14' },

  // Pre-join
  preJoin: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24 },
  preJoinCard: {
    background: 'rgba(15,23,42,.9)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.08)',
    borderRadius: 24, padding: '38px 34px', maxWidth: 440, width: '100%',
    textAlign: 'center', backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 48px rgba(0,0,0,.5)',
  },
  preJoinTitle: { fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 },
  preJoinSub:   { fontSize: 14, color: '#94a3b8', marginBottom: 20, lineHeight: 1.6 },
  notesBox: {
    background: 'rgba(14,165,233,.07)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(14,165,233,.2)',
    borderRadius: 12, padding: '11px 14px', marginBottom: 20, textAlign: 'left',
  },
  notesLabel: { fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '.1em', display: 'block', marginBottom: 5 },
  notesText:  { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6, margin: 0 },
  vidErr: {
    background: 'rgba(239,68,68,.09)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(239,68,68,.3)',
    borderRadius: 10, padding: 12, fontSize: 13, color: '#f87171', marginBottom: 14,
  },
  joinBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 16, fontWeight: 700,
    background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff',
    borderWidth: 0, borderStyle: 'solid', borderColor: 'transparent',
    cursor: 'pointer', boxShadow: '0 8px 22px rgba(14,165,233,.3)',
  },
  btnSpinner: {
    display: 'inline-block', width: 15, height: 15,
    borderWidth: 2, borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'spin .8s linear infinite',
  },
  preJoinNote: { fontSize: 11, color: '#475569', marginTop: 12 },

  // Active call
  callWrap: { position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' },
  remoteGrid: { flex: 1, display: 'flex', overflow: 'hidden' },
  remoteTile: {
    flex: 1, position: 'relative', overflow: 'hidden', minWidth: 200,
    borderWidth: 2, borderStyle: 'solid', borderColor: 'transparent',
    transition: 'border-color .3s',
  },
  remoteTileSpeaking: { borderColor: '#10b981' },
  remoteVideo: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' },
  videoOffBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center,#0f172a,#050a14)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarCircle: {
    width: 76, height: 76, borderRadius: '50%',
    background: 'rgba(14,165,233,.14)',
    borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(14,165,233,.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 30, fontWeight: 700, color: '#38bdf8',
  },
  peerLabel: {
    position: 'absolute', bottom: 80, left: 14,
    background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)',
    padding: '4px 11px', borderRadius: 20,
    fontSize: 13, fontWeight: 600, color: '#e2e8f0',
    display: 'flex', alignItems: 'center', gap: 4,
  },
  speakDot: { display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#10b981', marginLeft: 4 },

  // Waiting
  waitingArea: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 14,
    background: 'radial-gradient(ellipse at center,#0f172a 0%,#050a14 100%)',
  },
  waitingAvatar: {
    width: 92, height: 92, borderRadius: '50%',
    background: 'rgba(14,165,233,.1)',
    borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(14,165,233,.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42,
  },
  waitingText: { fontSize: 15, color: '#64748b', fontWeight: 500 },
  dot: {
    display: 'inline-block', width: 8, height: 8,
    borderRadius: '50%', background: '#0ea5e9',
    animation: 'blink 1.4s ease-in-out infinite',
  },

  // Local PIP
  localPip: {
    position: 'absolute', bottom: 80, right: 16,
    width: 158, height: 98, borderRadius: 12, overflow: 'hidden',
    borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.1)',
    boxShadow: '0 8px 24px rgba(0,0,0,.5)', background: '#1e293b',
  },
  localVideo: { width: '100%', height: '100%', objectFit: 'cover' as const, transform: 'scaleX(-1)' },
  localOff: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(15,23,42,.9)', fontSize: 26,
  },
  localLabel: {
    position: 'absolute', bottom: 4, left: 8,
    fontSize: 11, color: '#cbd5e1', fontWeight: 600,
    textShadow: '0 1px 4px rgba(0,0,0,.8)',
  },

  // Controls
  controls: {
    position: 'absolute', bottom: 18, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(15,23,42,.85)', backdropFilter: 'blur(16px)',
    padding: '10px 20px', borderRadius: 50,
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,.5)',
  },
  ctrl: {
    width: 48, height: 48, borderRadius: '50%',
    fontSize: 18, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderStyle: 'solid',
    transition: 'background .2s',
  },
  ctrlNorm:  { background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.12)', color: '#fff' },
  ctrlRed:   { background: 'rgba(239,68,68,.28)', borderColor: 'rgba(239,68,68,.4)', color: '#fff' },
  ctrlLeave: {
    borderRadius: 24, width: 'auto', padding: '0 16px',
    background: 'rgba(239,68,68,.22)', borderColor: 'rgba(239,68,68,.4)',
    color: '#fff', fontSize: 14,
  },
  ctrlBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, background: '#ef4444',
    borderRadius: '50%', fontSize: 9, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderStyle: 'solid', borderColor: '#0a0f1e',
  },

  // Side panel
  sidePanel: {
    width: 360, display: 'flex', flexDirection: 'column',
    background: 'rgba(15,23,42,.97)',
    borderTopWidth: 0, borderBottomWidth: 0, borderRightWidth: 0,
    borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: 'rgba(255,255,255,.07)',
    overflow: 'hidden', flexShrink: 0,
  },
  sidePanelFull: { width: '100%', borderLeftWidth: 0 },

  // Panel tab bar — ONLY borderBottom, no shorthand
  panelTabBar: {
    display: 'flex',
    borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0,
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'rgba(255,255,255,.07)',
  },
  // Base tab: uses explicit 4-side borders, NO 'border' shorthand
  panelTab: {
    flex: 1, padding: '13px 0', fontSize: 13, fontWeight: 600,
    background: 'transparent', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderTopWidth: 0, borderTopStyle: 'solid', borderTopColor: 'transparent',
    borderLeftWidth: 0, borderLeftStyle: 'solid', borderLeftColor: 'transparent',
    borderRightWidth: 0, borderRightStyle: 'solid', borderRightColor: 'transparent',
    borderBottomWidth: 2, borderBottomStyle: 'solid',
    transition: 'color .2s',
  },
  panelTabActive:   { color: '#0ea5e9', borderBottomColor: '#0ea5e9' },
  panelTabInactive: { color: '#64748b', borderBottomColor: 'transparent' },

  // Chat
  chatWrap: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  msgList: {
    flex: 1, overflowY: 'auto', padding: '14px 12px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  systemMsg: {
    textAlign: 'center', fontSize: 11, color: '#475569',
    background: 'rgba(255,255,255,.04)', borderRadius: 20,
    padding: '4px 12px', alignSelf: 'center',
  },
  msgRow:     { display: 'flex', alignItems: 'flex-end', gap: 8 },
  msgRowMine: { flexDirection: 'row-reverse' as const },
  msgAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  msgSender: { fontSize: 11, color: '#64748b', marginBottom: 3, marginLeft: 4 },
  bubble: { borderRadius: 16, padding: '9px 13px', maxWidth: '100%' },
  bubbleMine: {
    background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    borderBottomRightRadius: 3, borderBottomLeftRadius: 16,
    boxShadow: '0 2px 8px rgba(14,165,233,.25)',
  },
  bubbleTheirs: {
    background: 'rgba(255,255,255,.07)', color: '#e2e8f0',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.06)',
    borderTopLeftRadius: 3, borderTopRightRadius: 16,
    borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
  },
  msgTxt:  { fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  msgImg:  { width: '100%', maxWidth: 220, borderRadius: 10, display: 'block', cursor: 'pointer' },
  msgVid:  { width: '100%', maxWidth: 220, borderRadius: 10 },
  msgFile: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  msgTime: { fontSize: 10, color: '#475569', marginTop: 4, paddingLeft: 4 },

  uploadWrap: {
    background: 'rgba(255,255,255,.05)', borderRadius: 8, height: 30,
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.07)',
  },
  uploadBar: { position: 'absolute', left: 0, top: 0, bottom: 0, background: '#0ea5e9', transition: 'width .3s' },
  uploadTxt: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#fff',
  },

  inputRow: {
    display: 'flex', alignItems: 'flex-end', gap: 8, padding: 12,
    borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'rgba(255,255,255,.07)',
    borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0,
    background: 'rgba(10,15,30,.98)',
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 10, fontSize: 18,
    background: 'rgba(255,255,255,.07)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.08)',
    color: '#94a3b8', cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  chatInput: {
    flex: 1, background: 'rgba(255,255,255,.07)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.1)',
    borderRadius: 12, padding: '10px 13px',
    color: '#e2e8f0', fontSize: 14, resize: 'none',
    minHeight: 40, maxHeight: 120, lineHeight: 1.5,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 10, fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, cursor: 'not-allowed', transition: 'all .2s',
    background: 'rgba(14,165,233,.1)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(14,165,233,.15)',
    color: '#475569',
  },
  sendBtnOn: {
    background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
    borderWidth: 0, borderStyle: 'solid', borderColor: 'transparent',
    color: '#fff', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(14,165,233,.3)',
  },

  // Info
  infoWrap: { flex: 1, overflowY: 'auto', padding: 14 },
  infoCard: {
    background: 'rgba(255,255,255,.04)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.06)',
    borderRadius: 14, padding: '12px 15px', marginBottom: 12,
  },
  infoCardTitle: { fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '.1em', marginBottom: 10 },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 13, color: '#94a3b8', padding: '5px 0',
    borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0,
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'rgba(255,255,255,.04)',
  },
  concernTxt: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6 },
  actionBtn: {
    width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
    background: 'rgba(14,165,233,.1)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(14,165,233,.22)',
    color: '#38bdf8', cursor: 'pointer',
  },
};