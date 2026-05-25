'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import {
  collection, query, where, onSnapshot, doc,setDoc, addDoc, limit, updateDoc,
  getDoc, serverTimestamp, orderBy, getDocs, arrayUnion, Timestamp
} from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signOut, onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential, getAuth } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { initPatientTheme, applyPatientTheme, getStoredPatientTheme, PATIENT_THEME_LIST, type PatientTheme } from '@/lib/patient-theme';
import ARTICLES, { searchArticles } from '@/src/data/education';

import PatientHealthDashboard from '@/components/PatientHealthDashboard';
import ClinicalHistory from '@/components/ClinicalHistory';
import AmexanClinicalMessaging from '@/components/AmexanClinicalMessaging';

import PatientToolLogger from '@/components/PatientToolLogger';
import ClinicalMessenger from '@/components/ClinicalMessenger';
import PatientVisitSummary from '@/components/PatientVisitSummary';
import PatientOrdersCenter  from '@/components/PatientOrdersCenter';
import PatientRxCenter      from '@/components/PatientRxCenter';
import DiscoverTab from '@/components/DiscoverTab';
import PatientReferralPortal from '@/components/PatientReferralPortal';
import PatientEducationView from '@/components/PatientEducationView';

// ═══════════════════════════════════════════════════════════════════════════
// ADD THESE TWO HELPERS near the top of your page.tsx (after imports)
// They replace the raw fetch + res.json() calls and prevent the
// "Unexpected token '<'" crash when the route returns an HTML error page.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Safe JSON fetch — throws a readabltabe Error if:
 *  - The network fails
 *  - The server returns HTML instead of JSON (route not found / server crash)
 *  - The JSON body contains success: false
 */
async function safePost(url: string, payload: Record<string, any>): Promise<Record<string, any>> {
  let res: Response;

  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkErr: any) {
    throw new Error("Network error — please check your connection.");
  }

  // Check Content-Type before calling .json() to avoid the HTML parse crash
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    // Server returned HTML (404 page, 500 page, etc.)
    const htmlSnippet = await res.text().catch(() => "");
    console.error(`[safePost] ${url} returned non-JSON (${res.status}):`, htmlSnippet.slice(0, 200));
    throw new Error(
      res.status === 404
        ? `API route not found: ${url} — check the file is at app/api/payhero/initiate/route.ts`
        : `Server error ${res.status} — check server logs.`
    );
  }

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message ?? `Request failed with status ${res.status}`);
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// REPLACE handlePay inside BookModal with this:
// ═══════════════════════════════════════════════════════════════════════════

/*
  const handlePay = async (targetApptId?: string) => {
    const id = targetApptId || apptId;

    if (!phone.match(/^(07|01|\+2547|\+2541)\d{7,8}$/)) {
      setError('Enter a valid Safaricom number (e.g. 0712345678)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await safePost('/api/payhero/initiate', {
        phone,
        amount: svc.price,
        appointmentId: id,
        patientName: patient.name,
        specialty: svc.specialty,
      });

      // Optimistically update Firestore (callback will set the real status)
      await updateDoc(doc(db, 'appointments', id), {
        paymentRef: data.data?.reference || data.data?.CheckoutRequestID || '',
        paymentStatus: 'processing',
        phone,
      });

      setStep('done');
    } catch (e: any) {
      setError(e.message);
      setExistingApptId(id);
    }

    setLoading(false);
  };
*/

// ═══════════════════════════════════════════════════════════════════════════
// REPLACE retryPay inside PaymentsPanel with this:
// ═══════════════════════════════════════════════════════════════════════════

/*
  const retryPay = async (appt: Appointment) => {
    if (!phone.match(/^(07|01|\+2547|\+2541)\d{7,8}$/)) {
      setPayMsg('Enter valid Safaricom number');
      return;
    }

    setPaying(appt.id);
    setPayMsg('');

    try {
      const data = await safePost('/api/payhero/initiate', {
        phone,
        amount: appt.amount || 0,
        appointmentId: appt.id,
        patientName: patient.name,
        specialty: appt.specialty || 'Consultation',
      });

      await updateDoc(doc(db, 'appointments', appt.id), {
        paymentRef: data.data?.reference || data.data?.CheckoutRequestID || '',
        paymentStatus: 'processing',
        phone,
      });

      setPayMsg('✅ STK push sent! Check your phone for the M-Pesa prompt.');
    } catch (e: any) {
      setPayMsg('❌ ' + e.message);
    }

    setPaying(null);
  };
*/
// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
interface Patient {
  uid: string; name: string; email: string; phone?: string; age?: number;
  gender?: string; bloodGroup?: string; condition?: string; universalId?: string;
  allergies?: string[]; emergencyContact?: string; photoUrl?: string;
  address?: string; dateOfBirth?: string; occupation?: string;
  nextOfKin?: string; insuranceProvider?: string; insuranceNumber?: string;
}
interface Doctor {
  id: string; name: string; specialty: string; clinic: string; photo?: string;
  bio?: string; qualifications?: string[]; yearsExperience?: number;
  languages?: string[]; rating?: number; reviewCount?: number;
  physicalAddress?: string; consultationHours?: string; tags?: string[];
  dedication?: string; price?: number; duration?: number;
  availableDays?: string[]; availableSlots?: string[];
  acceptsInsurance?: boolean; location?: string;
}
interface Service {
  id: string; specialty: string; clinic: string; price: number;
  description: string; doctorId: string; doctorName: string;
  duration: number; isAvailable: boolean; tags?: string[];
  rating?: number; yearsExperience?: number; location?: string;
  nextSlot?: any; bio?: string; languages?: string[];
  photo?: string; qualifications?: string[]; dedication?: string;
  physicalAddress?: string; consultationHours?: string;
  availableDays?: string[]; availableSlots?: string[];
  acceptsInsurance?: boolean; reviewCount?: number;
}
interface Appointment {
  id: string; doctorId: string; doctorName?: string; specialty?: string;
  serviceId: string; status: 'booked'|'active'|'completed'|'cancelled';
  date: any; scheduledDate?: any; scheduledTime?: string;
  consultationId?: string; prescriptions?: Prescription[]; notes?: string;
  patientNotes?: string; amount?: number; paymentStatus?: string;
  paymentRef?: string; paymentReceipt?: string; phone?: string;
  type?: 'telemedicine'|'in-person'; paidAt?: any; firstVisit?: boolean;
  paymentFailReason?: string;
}
interface Prescription {
  id?: string; medication: string; dosage: string; frequency: string;
  duration: string; addedAt: string; doctorName?: string;
  instructions?: string; refills?: number; taken?: Record<string, boolean>;
}
interface VitalReading {
  id: string; type: 'bp'|'glucose'|'weight'|'temp'|'pulse';
  value: string; systolic?: number; diastolic?: number; unit: string;
  recordedAt: any; note?: string;
}
interface Alert {
  id: string; title: string; body: string; severity: 'high'|'medium'|'low';
  read: boolean; createdAt: any; type?: string; actionUrl?: string;
}
interface LabResult {
  id: string; testName: string; result: string; unit?: string; referenceRange?: string;
  status: 'normal'|'abnormal'|'critical'; date: any; orderedBy?: string;
  reportUrl?: string; notes?: string;
}
interface HistoryEntry {
  id: string; section: string; content: string; date: any;
  authorName?: string; version?: number; signatureHash?: string;
  type: 'medical'|'social'|'family'|'allergy'|'surgery'|'encounter'|'lab'|'note';
}
interface DiseaseTarget {
  id: string; label: string; current?: string; target: string;
  status: 'on-target'|'off-target'|'warning'; unit?: string; icon: string;
}
// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const fmtShort = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
};
const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const bpCat = (s: number, d: number) => {
  if (s < 120 && d < 80) return { label: 'Normal', color: '#00d68f' };
  if (s < 130 && d < 80) return { label: 'Elevated', color: '#ffb020' };
  if (s < 140 || d < 90) return { label: 'High Stage 1', color: '#ff8c42' };
  return { label: 'High Stage 2', color: '#ff4560' };
};
const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
  booked: { label: 'Upcoming', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  active: { label: '● Live', color: '#00d68f', bg: 'rgba(0,214,143,0.12)' },
  completed: { label: 'Completed', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  cancelled: { label: 'Cancelled', color: '#ff4560', bg: 'rgba(255,69,96,0.12)' },
};


const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function getDaysSince(ts: any): number {
  if (!ts) return 999;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// ═══════════════════════════════════════════════════════════════════════════
// COUNTDOWN HOOK
// ═══════════════════════════════════════════════════════════════════════════
function useCountdown(target: any) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!target) return;
    const d = target?.toDate ? target.toDate() : new Date(target);
    const tick = () => {
      const diff = d.getTime() - Date.now();
      if (diff <= 0) { setLabel('Now'); return; }
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) setLabel(`${days}d ${hrs}h`);
      else if (hrs > 0) setLabel(`${hrs}h ${mins}m`);
      else setLabel(`${mins}m`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [target]);
  return label;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYHERO STK PUSH
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// PRESCRIPTION ADHERENCE CALENDAR
// ═══════════════════════════════════════════════════════════════════════════
function PrescriptionCalendar({ rx, patientId, apptId }: { rx: Prescription & { apptId: string }; patientId: string; apptId: string }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 6 + i);
    return d;
  });

  const toggleDay = async (dateKey: string) => {
    const current = rx.taken?.[dateKey] ?? false;
    // Update in the appointments/prescriptions sub-collection
    const apptRef = doc(db, 'appointments', apptId);
    const apptSnap = await getDoc(apptRef);
    const prescriptions = apptSnap.data()?.prescriptions || [];
    const updated = prescriptions.map((p: any) =>
      p.medication === rx.medication ? { ...p, taken: { ...(p.taken || {}), [dateKey]: !current } } : p
    );
    await updateDoc(apptRef, { prescriptions: updated });
    // Also update in consultations if linked
    const consultSnap = await getDocs(query(collection(db, 'consultations'), where('appointmentId', '==', apptId)));
    if (!consultSnap.empty) {
      await updateDoc(doc(db, 'consultations', consultSnap.docs[0].id), { prescriptions: updated });
    }
  };

  return (
    <div className="cal-row">
      {days.map(d => {
        const key = d.toISOString().slice(0, 10);
        const taken = rx.taken?.[key];
        const isToday = d.toDateString() === today.toDateString();
        return (
          <button
            key={key}
            className={`cal-day ${taken ? 'cal-taken' : ''} ${isToday ? 'cal-today' : ''}`}
            onClick={() => toggleDay(key)}
            title={`${dayNames[d.getDay()]} ${d.getDate()} — ${taken ? 'Taken ✓' : 'Not taken'}`}
          >
            <span className="cal-dn">{dayNames[d.getDay()][0]}</span>
            <span className="cal-dd">{d.getDate()}</span>
            {taken && <span className="cal-check">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCTOR PROFILE DRAWER
// ═══════════════════════════════════════════════════════════════════════════
function DoctorProfileDrawer({ svc, onClose, onBook }: { svc: Service; onClose: () => void; onBook: () => void }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <button className="drawer-close" onClick={onClose}>✕</button>
        <div className="dr-profile-hero" style={{
          background: `linear-gradient(135deg, #0f172a 0%, #1e2a4a 100%)`,
        }}>
          <div className="dr-profile-ava">
            {svc.photo
              ? <img src={svc.photo} alt={svc.doctorName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ fontSize: 36, fontWeight: 800 }}>{svc.doctorName[0]}</span>
            }
          </div>
          <div className="dr-profile-info">
            <h2 className="dr-profile-name">Dr. {svc.doctorName}</h2>
            <p className="dr-profile-spec">{svc.specialty} · {svc.clinic}</p>
            <div className="dr-profile-chips">
              {svc.rating && <span className="dr-chip">⭐ {svc.rating}/5 ({svc.reviewCount || 0} reviews)</span>}
              {svc.yearsExperience && <span className="dr-chip">🏆 {svc.yearsExperience} yrs exp</span>}
              {svc.acceptsInsurance && <span className="dr-chip">🏥 Accepts Insurance</span>}
            </div>
          </div>
        </div>

        <div className="drawer-body">
          {/* Price & Duration */}
          <div className="dr-price-row">
            <div className="dr-price-box">
              <span className="dr-price-label">Consultation Fee</span>
              <span className="dr-price-val">KES {svc.price?.toLocaleString()}</span>
            </div>
            <div className="dr-price-box">
              <span className="dr-price-label">Duration</span>
              <span className="dr-price-val">⏱ {svc.duration} min</span>
            </div>
            <div className="dr-price-box">
              <span className="dr-price-label">Type</span>
              <span className="dr-price-val">💻 Video</span>
            </div>
          </div>

          {/* Bio */}
          {svc.bio && (
            <div className="dr-section">
              <div className="dr-section-title">About</div>
              <p className="dr-section-body">{svc.bio}</p>
            </div>
          )}

          {/* Dedication message */}
          {svc.dedication && (
            <div className="dr-dedication">
              <span className="dr-quote">❝</span>
              <p>{svc.dedication}</p>
            </div>
          )}

          {/* Qualifications */}
          {svc.qualifications?.length ? (
            <div className="dr-section">
              <div className="dr-section-title">Qualifications</div>
              <div className="dr-qual-list">
                {svc.qualifications.map((q, i) => (
                  <div key={i} className="dr-qual-item">🎓 {q}</div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Tags/Specialties */}
          {svc.tags?.length ? (
            <div className="dr-section">
              <div className="dr-section-title">Areas of Focus</div>
              <div className="dr-tags">
                {svc.tags.map((t, i) => <span key={i} className="dr-tag">{t}</span>)}
              </div>
            </div>
          ) : null}

          {/* Languages */}
          {svc.languages?.length ? (
            <div className="dr-section">
              <div className="dr-section-title">Languages</div>
              <div className="dr-tags">
                {svc.languages.map((l, i) => <span key={i} className="dr-tag">🌐 {l}</span>)}
              </div>
            </div>
          ) : null}

          {/* Location & Hours */}
          <div className="dr-section">
            <div className="dr-section-title">Clinic Details</div>
            <div className="dr-info-grid">
              {svc.physicalAddress && (
                <div className="dr-info-item">
                  <span className="dr-info-icon">📍</span>
                  <div>
                    <span className="dr-info-label">Physical Location</span>
                    <span className="dr-info-val">{svc.physicalAddress}</span>
                  </div>
                </div>
              )}
              {svc.consultationHours && (
                <div className="dr-info-item">
                  <span className="dr-info-icon">🕐</span>
                  <div>
                    <span className="dr-info-label">Consultation Hours</span>
                    <span className="dr-info-val">{svc.consultationHours}</span>
                  </div>
                </div>
              )}
              {svc.availableDays?.length ? (
                <div className="dr-info-item">
                  <span className="dr-info-icon">📅</span>
                  <div>
                    <span className="dr-info-label">Available Days</span>
                    <span className="dr-info-val">{svc.availableDays.join(', ')}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Description */}
          {svc.description && (
            <div className="dr-section">
              <div className="dr-section-title">Service Description</div>
              <p className="dr-section-body">{svc.description}</p>
            </div>
          )}

          <button className="btn-book-full" onClick={onBook}>
            📅 Book Consultation — KES {svc.price?.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK APPOINTMENT MODAL
// ═══════════════════════════════════════════════════════════════════════════
function BookModal({ svc, patient, onClose }: { svc: Service; patient: Patient; onClose: () => void }) {
  const [step, setStep] = useState<'slot'|'details'|'pay'|'waiting'|'done'|'failed'>('slot');
  const [concern, setConcern] = useState('');
  const [phone, setPhone] = useState(patient.phone || '');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apptId, setApptId] = useState('');
  const [existingApptId, setExistingApptId] = useState('');
  const [pollSecs, setPollSecs] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
// ── Real-time availability from Firestore ──────────────────────────────────
  const [availability, setAvailability] = useState<{
    availableDays: string[];
    slots: string[];
    timezone: string;
    slotDuration: number;
  } | null>(null);
  const [availLoading, setAvailLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'availability', svc.doctorId), (snap) => {
      setAvailability(snap.exists() ? snap.data() as any : null);
      setAvailLoading(false);
    });
    return () => unsub();
  }, [svc.doctorId]);

  // ── Derived: use doctor's real data, fallback to service data ─────────────
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const availableDays = availability?.availableDays?.length
    ? availability.availableDays
    : (svc.availableDays ?? []);

  const slots = availability?.slots?.length
    ? availability.slots
    : (svc.availableSlots || ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00']);

  const timezone = availability?.timezone || 'Africa/Nairobi';

  // Next 14 days filtered to doctor's real available days
  const next14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + 1 + i);
    const dayName = DAY_NAMES[d.getDay()];
    return {
      key: d.toISOString().slice(0, 10),
      label: `${dayName} ${d.getDate()}`,
      month: d.toLocaleString('default', { month: 'short' }),
      available: !availableDays.length || availableDays.includes(dayName),
    };
  }).filter(d => d.available);

  // ── Polling refs ───────────────────────────────────────────────────────────
  const unsubRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const stopPolling = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
  };

  const startPolling = (id: string) => {
    let secs = 0;
    timerRef.current = setInterval(() => {
      secs += 1; setPollSecs(secs);
      if (secs >= 120) {
        stopPolling(); setStep('failed');
        setError('Payment timed out after 2 minutes. Your booking is saved — tap Retry to try again.');
      }
    }, 1000);
    unsubRef.current = onSnapshot(doc(db, 'appointments', id), (snap) => {
      const status = snap.data()?.paymentStatus;
      if (status === 'paid') { stopPolling(); setStep('done'); }
      else if (status === 'failed') { stopPolling(); setStep('failed'); setError('M-Pesa payment was declined. Tap Retry to try again.'); }
    });
  };

  // ── Book ───────────────────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!concern.trim()) { setError('Please describe your concern.'); return; }
    if (!selectedSlot || !selectedDate) { setError('Please select a date and time.'); return; }
    setLoading(true); setError('');
    try {
      const prevVisits = await getDocs(query(
        collection(db, 'appointments'),
        where('patientId', '==', patient.uid),
        where('doctorId', '==', svc.doctorId),
        where('status', 'in', ['completed', 'booked'])
      ));
      const firstVisit = prevVisits.empty;
      setIsFirstVisit(firstVisit);
      const scheduledDateTime = new Date(`${selectedDate}T${selectedSlot}:00`);
      const ref = await addDoc(collection(db, 'appointments'), {
        patientId: patient.uid, patientName: patient.name, patientEmail: patient.email,
        doctorId: svc.doctorId, doctorName: svc.doctorName, serviceId: svc.id,
        specialty: svc.specialty, status: 'booked',
        date: serverTimestamp(),
        scheduledDate: Timestamp.fromDate(scheduledDateTime),
        scheduledTime: selectedSlot,
        scheduledTimezone: timezone,
        patientNotes: concern, prescriptions: [], notes: '',
        paymentStatus: 'pending', amount: svc.price, type: 'telemedicine',
        firstVisit,
      });
      setApptId(ref.id);
      setStep('pay');
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  // ── Pay ────────────────────────────────────────────────────────────────────
  const handlePay = async (targetApptId?: string) => {
    const id = targetApptId || apptId;
    if (!id) { setError('No appointment found. Please start over.'); return; }
    if (loading) return;

    if (!/^(?:254|0)?(7|1)\d{8}$/.test(phone.replace(/\D/g, ""))) {
      setError("Enter a valid Safaricom number (e.g. 0712345678)");
      return;
    }

    setLoading(true); setError(''); setPollSecs(0);
    try {
      const data = await safePost("/api/payhero/initiate", {
        phone, amount: svc.price, appointmentId: id,
        patientName: patient.name, specialty: svc.specialty,
      });
      if (data?.success === false) throw new Error(data?.message || "Payment initiation failed");
      await updateDoc(doc(db, "appointments", id), {
        paymentStatus: "processing",
        paymentInitiatedAt: new Date().toISOString(),
        phone,
        payheroReference: data.data?.reference || data.data?.CheckoutRequestID || data.data?.checkout_request_id || "",
      });
      setExistingApptId(id);
      setStep("waiting");
      startPolling(id);
    } catch (e: any) {
      setError(e?.message || "Could not initiate payment. Check network or try again.");
      setExistingApptId(id);
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = step === 'slot' ? 0 : step === 'details' ? 1 : step === 'pay' || step === 'waiting' ? 2 : step === 'done' ? 3 : 2;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-hd">
          <div>
            <h3 className="modal-ht">{svc.specialty}</h3>
            <p className="modal-hs">Dr. {svc.doctorName} · {svc.clinic}</p>
            {!availLoading && availability?.timezone && (
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#0aaa76', fontWeight: 600 }}>
                🌍 {timezone}{availability.slotDuration ? ` · ${availability.slotDuration}min slots` : ''}
              </p>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Progress bar */}
        {step !== 'done' && step !== 'failed' && (
          <div className="steps-bar">
            {['Date & Time','Details','Payment','Confirmed'].map((s, i) => (
              <div key={s} className="step-wrap">
                <div className={`step-num ${i <= stepIdx ? 'step-on' : ''}`}>{i < stepIdx ? '✓' : i + 1}</div>
                <span className="step-text">{s}</span>
                {i < 3 && <div className={`step-line ${i < stepIdx ? 'step-line-on' : ''}`} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP: Date & Time */}
        {step === 'slot' && (
          <div className="modal-body">
            {availLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <p style={{ fontSize: 14 }}>Loading Dr. {svc.doctorName}'s availability...</p>
              </div>
            ) : (
              <>
                <div className="field-col">
                  <label className="field-lbl">
                    Select Date
                    {availability && (
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#0aaa76', background: '#ecfdf5', padding: '2px 6px', borderRadius: 6 }}>
                        🟢 LIVE
                      </span>
                    )}
                  </label>
                  {next14Days.length === 0 ? (
                    <div style={{ padding: 14, background: '#fff7ed', borderRadius: 10, color: '#92400e', fontSize: 13, border: '1px solid #fed7aa' }}>
                      ⚠️ No available days in the next 2 weeks. Please check back later.
                    </div>
                  ) : (
                    <div className="slot-days">
                      {next14Days.map(d => (
                        <button key={d.key} className={`slot-day ${selectedDate === d.key ? 'slot-on' : ''}`}
                          onClick={() => { setSelectedDate(d.key); setSelectedSlot(''); }}>
                          <span style={{ fontSize: 9, display: 'block', opacity: 0.65 }}>{d.month}</span>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedDate && (
                  <div className="field-col">
                    <label className="field-lbl">
                      Select Time
                      <span style={{ marginLeft: 8, fontSize: 11, color: '#0aaa76', fontWeight: 400 }}>({timezone})</span>
                    </label>
                    <div className="slot-times">
                      {slots.map(s => (
                        <button key={s} className={`slot-time ${selectedSlot === s ? 'slot-on' : ''}`}
                          onClick={() => setSelectedSlot(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {error && <div className="err-box">{error}</div>}
            <button className="btn-cta" disabled={availLoading} onClick={() => {
              if (!selectedDate || !selectedSlot) { setError('Please pick a date and time.'); return; }
              setError(''); setStep('details');
            }}>
              Continue →
            </button>
          </div>
        )}

        {/* STEP: Details */}
        {step === 'details' && (
          <div className="modal-body">
            <div className="booking-summary">
              <span>📅 {new Date(selectedDate).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span>⏰ {selectedSlot} <span style={{ fontSize: 11, opacity: 0.7 }}>({timezone})</span></span>
              <span>💰 KES {svc.price?.toLocaleString() ?? '0'}</span>
            </div>
            <div className="field-col">
              <label className="field-lbl">Describe your concern *</label>
              <textarea className="field-ta" rows={4} value={concern}
                onChange={e => setConcern(e.target.value)}
                placeholder="What symptoms are you experiencing? How long? Any previous treatments?" />
            </div>
            {error && <div className="err-box">{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setStep('slot')}>← Back</button>
              <button className="btn-cta" onClick={handleBook} disabled={loading}>
                {loading ? 'Booking…' : 'Continue to Payment →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: Payment */}
        {step === 'pay' && (
          <div className="modal-body">
            <div className="pay-center">
              <div className="pay-amt">KES {svc.price?.toLocaleString() ?? '0'}</div>
              <p className="pay-sub">M-Pesa STK Push</p>
            </div>
            <div className="mpesa-pill">
              <span style={{ fontSize: 24 }}>📱</span>
              <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 17 }}>M-PESA</span>
            </div>
            <div className="field-col">
              <label className="field-lbl">Safaricom Number *</label>
              <input className="field-inp" type="tel" value={phone}
                onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" />
            </div>
            <p className="pay-note">📌 You'll receive an STK push on your phone. Enter your M-Pesa PIN to complete payment.</p>
            {error && (
              <div className="err-box">
                {error}
                {existingApptId && (
                  <button className="retry-btn" onClick={() => handlePay(existingApptId)}>🔄 Retry Payment</button>
                )}
              </div>
            )}
            <button className="btn-cta" onClick={() => handlePay()} disabled={loading}>
              {loading ? 'Sending prompt…' : `💳 Pay KES ${svc.price?.toLocaleString() ?? '0'}`}
            </button>
          </div>
        )}

        {/* STEP: Waiting */}
        {step === 'waiting' && (
          <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ position: 'relative', width: 70, height: 70, margin: '0 auto 16px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #e2e8f0' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#0aaa76', borderRightColor: '#0aaa76', animation: 'spin 0.9s linear infinite' }} />
              <div style={{ position: 'absolute', inset: 10, background: '#0aaa76', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📱</div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <h4 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Check your phone</h4>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              We sent an M-Pesa prompt to <strong>{phone}</strong>.<br />Enter your PIN to confirm payment.
            </p>
            <div style={{ background: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155', marginBottom: 6 }}>
                <span>Waiting time</span>
                <span>{Math.floor(pollSecs / 60)}:{String(pollSecs % 60).padStart(2,'0')} / 2:00</span>
              </div>
              <div style={{ height: 6, background: '#cbd5e1', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(pollSecs / 120) * 100}%`, height: '100%', background: '#0aaa76', transition: 'width 1s linear' }} />
              </div>
            </div>
            <button className="btn-secondary" onClick={() => { stopPolling(); setStep('pay'); setError(''); }}>
              ← Didn't get the prompt?
            </button>
          </div>
        )}

        {/* STEP: Done */}
        {step === 'done' && (
          <div className="modal-body" style={{ textAlign: 'center', padding: '32px 22px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h4 style={{ fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 10 }}>Appointment Booked!</h4>
            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8, marginBottom: 8 }}>
              Payment confirmed. Dr. {svc.doctorName} will be available on<br />
              <strong>{new Date(selectedDate).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })} at {selectedSlot}</strong>
              <br /><span style={{ fontSize: 12, color: '#0aaa76' }}>({timezone})</span>
            </p>
            {isFirstVisit && (
              <span style={{ display: 'inline-block', background: '#fef9c3', color: '#854d0e', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>⭐ First Visit</span>
            )}
            <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 28 }}>
              You'll receive a notification when the doctor starts the session.
            </p>
            <button className="btn-cta" onClick={onClose}>Done ✓</button>
          </div>
        )}

        {/* STEP: Failed */}
        {step === 'failed' && (
          <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
            <h4 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Payment Unsuccessful</h4>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              {error || 'Your M-Pesa payment could not be completed.'}
            </p>
            <div style={{ background: '#fef9c3', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#854d0e' }}>
              ⏳ Your appointment slot is still reserved. You can retry without losing your date and time.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-cta" onClick={() => { stopPolling(); setStep('pay'); setError(''); }} style={{ flex: 2 }}>
                🔄 Retry Payment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOG VITAL MODAL
// ═══════════════════════════════════════════════════════════════════════════
function LogVitalModal({ patient, onClose, onSaved }: { patient: Patient; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<'bp'|'glucose'|'weight'|'temp'|'pulse'>('bp');
  const [sys, setSys] = useState(''); const [dia, setDia] = useState('');
  const [value, setValue] = useState(''); const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const types = [
    { id: 'bp', label: 'Blood Pressure', icon: '❤️', unit: 'mmHg' },
    { id: 'glucose', label: 'Blood Glucose', icon: '🩸', unit: 'mmol/L' },
    { id: 'weight', label: 'Weight', icon: '⚖️', unit: 'kg' },
    { id: 'temp', label: 'Temperature', icon: '🌡️', unit: '°C' },
    { id: 'pulse', label: 'Pulse Rate', icon: '💓', unit: 'bpm' },
  ];
  const save = async () => {
    setSaving(true);
    try {
      const unit = types.find(v => v.id === type)?.unit || '';
      const data: any = { patientId: patient.uid, type, unit, recordedAt: serverTimestamp(), note };
      if (type === 'bp') { data.systolic = Number(sys); data.diastolic = Number(dia); data.value = `${sys}/${dia}`; }
      else { data.value = value; }
      await addDoc(collection(db, 'vitals'), data);
      onSaved(); onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-hd"><h3 className="modal-ht">📊 Log Vital Sign</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {types.map(v => (
              <button key={v.id} onClick={() => setType(v.id as any)} className={`vital-chip ${type === v.id ? 'vital-chip-on' : ''}`}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          {type === 'bp' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field-col"><label className="field-lbl">Systolic</label><input className="field-inp" type="number" value={sys} onChange={e => setSys(e.target.value)} placeholder="120" /></div>
              <div className="field-col"><label className="field-lbl">Diastolic</label><input className="field-inp" type="number" value={dia} onChange={e => setDia(e.target.value)} placeholder="80" /></div>
            </div>
          ) : (
            <div className="field-col">
              <label className="field-lbl">Value ({types.find(v => v.id === type)?.unit})</label>
              <input className="field-inp" type="number" value={value} onChange={e => setValue(e.target.value)} />
            </div>
          )}
          <div className="field-col"><label className="field-lbl">Note (optional)</label><input className="field-inp" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. After morning walk" /></div>
          <button className="btn-cta" onClick={save} disabled={saving}>{saving ? 'Saving…' : '💾 Save Reading'}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SMARTCARD MODAL
// ═══════════════════════════════════════════════════════════════════════════
function SmartcardModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const uid = patient.universalId || `AMX-${patient.uid.slice(0, 8).toUpperCase()}`;
  const qrValue = typeof window !== 'undefined' ? `${window.location.origin}/patient/${uid}` : uid;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div className="modal-hd"><h3 className="modal-ht">🪪 Patient Smartcard</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="smartcard">
            <div className="sc-top">
              <div className="sc-avatar">{patient.photoUrl ? <img src={patient.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (patient.name || '?')[0]}</div>
              <div style={{ flex: 1 }}>
                <div className="sc-name">{patient.name}</div>
                <div className="sc-id">ID: {uid}</div>
              </div>
              <div style={{ fontSize: 24 }}>⚕️</div>
            </div>
            <div className="sc-grid">
              {[['Blood Group', patient.bloodGroup || '—'], ['Age', patient.age ? `${patient.age} yrs` : '—'], ['Gender', patient.gender || '—'], ['Condition', patient.condition || '—']].map(([k, v]) => (
                <div key={k} className="sc-item"><span className="sc-key">{k}</span><span className="sc-val">{v}</span></div>
              ))}
            </div>
            {patient.allergies?.length ? <div className="sc-allergy">⚠️ Allergies: {patient.allergies.join(', ')}</div> : null}
            {patient.emergencyContact && <div className="sc-emergency">🆘 Emergency: {patient.emergencyContact}</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 6px', background: 'white', padding: 12, borderRadius: 12 }}>
            <QRCodeSVG value={qrValue} size={160} bgColor="#fff" fgColor="#0f172a" level="H" />
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>Scan to instantly share medical info with any doctor</p>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIAGE MODAL
// ═══════════════════════════════════════════════════════════════════════════
function TriageModal({ onClose, onDone }: { onClose: () => void; onDone: (sp: string) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const questions = [
    { q: "What's your main concern today?", opts: ['Heart / Chest pain','Blood sugar / Diabetes','Breathing problems','Mental health','Skin condition','Bone / Joint pain',"Child's health",'Eye / Vision','Ear / Nose / Throat','Reproductive / Gynae','Dental / Oral','General check-up','Other'] },
    { q: 'How long have you had this?', opts: ['Started today','A few days','A few weeks','Over a month','Chronic condition (years)'] },
    { q: 'How severe is it right now?', opts: ['Mild — manageable','Moderate — affecting daily life','Severe — need urgent help','🚨 Emergency — life-threatening'] },
    { q: 'Have you seen a doctor for this before?', opts: ['No — first time','Yes — follow-up visit','Yes — but different hospital','Currently on medication for it'] },
  ];
  const specialtyMap: Record<string, string> = {
    'Heart / Chest pain':'Cardiology','Blood sugar / Diabetes':'Endocrinology','Breathing problems':'Pulmonology',
    'Mental health':'Mental Health','Skin condition':'Dermatology','Bone / Joint pain':'Orthopedics',
    "Child's health":'Pediatrics','Eye / Vision':'Ophthalmology','Ear / Nose / Throat':'ENT',
    'Reproductive / Gynae':'Gynecology','Dental / Oral':'Dental','General check-up':'General',Other:'General',
  };
  const select = (ans: string) => {
    if (ans === '🚨 Emergency — life-threatening') { alert('🚨 EMERGENCY: Call 999 or 112 immediately!'); onClose(); return; }
    const next = [...answers, ans];
    if (step === questions.length - 1) { onDone(specialtyMap[next[0]] || 'General'); }
    else { setAnswers(next); setStep(s => s + 1); }
  };
  const q = questions[step];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-hd"><h3 className="modal-ht">🔍 Smart Triage</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="triage-bar"><div className="triage-prog" style={{ width: `${(step / questions.length) * 100}%` }} /></div>
          <p className="triage-step">Question {step + 1} of {questions.length}</p>
          <h4 className="triage-q">{q.q}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {q.opts.map(opt => (
              <button key={opt} className={`triage-opt ${opt.includes('🚨') ? 'triage-emergency' : ''}`} onClick={() => select(opt)}>{opt}</button>
            ))}
          </div>
          {step > 0 && <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMERGENCY MODAL
// ═══════════════════════════════════════════════════════════════════════════
function EmergencyModal({ onClose, patientId }: { onClose: () => void; patientId: string }) {
  const alert911 = async () => {
    await addDoc(collection(db, 'alerts'), {
      recipientId: 'all-doctors',
      patientId, type: 'emergency',
      title: '🚨 Patient Emergency Alert',
      body: 'Patient has triggered an emergency alert and may need immediate assistance.',
      severity: 'high', read: false, createdAt: serverTimestamp(),
    });
    window.alert('Emergency alert sent to your care team!');
    onClose();
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ padding: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🚨</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#ff4560', marginBottom: 12 }}>Emergency</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 24, lineHeight: 1.7 }}>
            For life-threatening emergencies, call emergency services immediately.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="tel:999" className="btn-cta" style={{ background: '#ff4560', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>📞 Call 999</a>
            <a href="tel:112" className="btn-cta" style={{ background: '#ef4444', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>📞 Call 112</a>
            <button className="btn-secondary" onClick={alert911}>🔔 Alert My Care Team</button>
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PANEL (Editable, uploads to Firestore + Storage)
// ═══════════════════════════════════════════════════════════════════════════
function SettingsPanel({ patient, onUpdate }: { patient: Patient; onUpdate: (p: Partial<Patient>) => void }) {
  const [form, setForm] = useState({ ...patient });
  const [pwd, setPwd] = useState(''); const [oldPwd, setOldPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState(''); const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoUploading(true);
    const sRef = storageRef(storage, `patients/${patient.uid}/profile/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(sRef, file);
    task.on('state_changed', null, err => { console.error(err); setPhotoUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await updateDoc(doc(db, 'users', patient.uid), { photoUrl: url });
        setForm(f => ({ ...f, photoUrl: url }));
        onUpdate({ photoUrl: url });
        setPhotoUploading(false);
        setMsg('Profile photo updated!');
      });
  };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const updates = {
        name: form.name, phone: form.phone, age: form.age,
        gender: form.gender, bloodGroup: form.bloodGroup,
        address: form.address, occupation: form.occupation,
        nextOfKin: form.nextOfKin, emergencyContact: form.emergencyContact,
        insuranceProvider: form.insuranceProvider, insuranceNumber: form.insuranceNumber,
        allergies: typeof form.allergies === 'string' ? (form.allergies as any).split(',').map((s: string) => s.trim()).filter(Boolean) : form.allergies,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, 'users', patient.uid), updates);
      onUpdate(updates);
      setMsg('Profile saved successfully!');
    } catch (e: any) { setMsg('Error: ' + e.message); }
    setSaving(false);
  };

  const handlePwdChange = async () => {
    if (!oldPwd || !pwd || pwd.length < 8) { setPwdMsg('Password must be at least 8 characters.'); return; }
    try {
      const user = auth.currentUser!;
      const cred = EmailAuthProvider.credential(user.email!, oldPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwd);
      setPwdMsg('Password updated!'); setPwd(''); setOldPwd('');
    } catch (e: any) { setPwdMsg('Error: ' + e.message); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Profile Photo */}
      <div className="settings-card">
        <div className="settings-card-title">🖼️ Profile Photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="settings-avatar">
            {form.photoUrl ? <img src={form.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (form.name || '?')[0]}
          </div>
          <div>
            <button className="btn-sm-accent" onClick={() => fileRef.current?.click()} disabled={photoUploading}>
              {photoUploading ? 'Uploading…' : '📸 Change Photo'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>JPG, PNG. Max 5MB.</p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="settings-card">
        <div className="settings-card-title">👤 Personal Information</div>
        <div className="settings-grid">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Phone Number', key: 'phone', type: 'tel' },
            { label: 'Age', key: 'age', type: 'number' },
            { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
            { label: 'Occupation', key: 'occupation', type: 'text' },
            { label: 'Address', key: 'address', type: 'text' },
          ].map(f => (
            <div key={f.key} className="field-col">
              <label className="field-lbl">{f.label}</label>
              <input className="field-inp" type={f.type} value={(form as any)[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div className="field-col">
            <label className="field-lbl">Gender</label>
            <select className="field-inp" value={form.gender || ''} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div className="field-col">
            <label className="field-lbl">Blood Group</label>
            <select className="field-inp" value={form.bloodGroup || ''} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))}>
              <option value="">Select</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Medical Info */}
      <div className="settings-card">
        <div className="settings-card-title">🏥 Medical & Emergency</div>
        <div className="settings-grid">
          <div className="field-col">
            <label className="field-lbl">Known Allergies (comma-separated)</label>
            <input className="field-inp" value={Array.isArray(form.allergies) ? form.allergies.join(', ') : form.allergies || ''}
              onChange={e => setForm(p => ({ ...p, allergies: e.target.value as any }))} placeholder="e.g. Penicillin, Peanuts" />
          </div>
          <div className="field-col">
            <label className="field-lbl">Emergency Contact</label>
            <input className="field-inp" value={form.emergencyContact || ''}
              onChange={e => setForm(p => ({ ...p, emergencyContact: e.target.value }))} placeholder="Name & Phone" />
          </div>
          <div className="field-col">
            <label className="field-lbl">Next of Kin</label>
            <input className="field-inp" value={form.nextOfKin || ''}
              onChange={e => setForm(p => ({ ...p, nextOfKin: e.target.value }))} />
          </div>
          <div className="field-col">
            <label className="field-lbl">Insurance Provider</label>
            <input className="field-inp" value={form.insuranceProvider || ''}
              onChange={e => setForm(p => ({ ...p, insuranceProvider: e.target.value }))} />
          </div>
          <div className="field-col">
            <label className="field-lbl">Insurance Number</label>
            <input className="field-inp" value={form.insuranceNumber || ''}
              onChange={e => setForm(p => ({ ...p, insuranceNumber: e.target.value }))} />
          </div>
        </div>
      </div>

      {msg && <div className={`msg-banner ${msg.includes('Error') ? 'msg-err' : 'msg-ok'}`}>{msg}</div>}
      <button className="btn-cta" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : '💾 Save All Changes'}
      </button>

      {/* Password Change */}
      <div className="settings-card">
        <div className="settings-card-title">🔒 Change Password</div>
        <div className="settings-grid">
          <div className="field-col">
            <label className="field-lbl">Current Password</label>
            <input className="field-inp" type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
          </div>
          <div className="field-col">
            <label className="field-lbl">New Password (min 8 chars)</label>
            <input className="field-inp" type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
          </div>
        </div>
        {pwdMsg && <div className={`msg-banner ${pwdMsg.includes('Error') ? 'msg-err' : 'msg-ok'}`} style={{ marginTop: 8 }}>{pwdMsg}</div>}
        <button className="btn-secondary" onClick={handlePwdChange} style={{ marginTop: 12, width: 'auto', padding: '10px 20px' }}>
          🔑 Update Password
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENTS PANEL
// ═══════════════════════════════════════════════════════════════════════════
function PaymentsPanel({ appointments, patient }: { appointments: Appointment[]; patient: Patient }) {
  const [phone, setPhone] = useState(patient.phone || '');
  const [paying, setPaying] = useState<string | null>(null);
  const [payMsg, setPayMsg] = useState('');

  const pending = appointments.filter(a => a.paymentStatus === 'pending' || a.paymentStatus === 'failed');
  const paid = appointments.filter(a => a.paymentStatus === 'paid');

 const retryPay = async (appt: Appointment) => {
    if (!phone.match(/^(07|01|\+2547|\+2541)\d{7,8}$/)) {
      setPayMsg('Enter valid Safaricom number');
      return;
    }

    setPaying(appt.id);
    setPayMsg('');

    try {
      const data = await safePost('/api/payhero/initiate', {
        phone,
        amount: appt.amount || 0,
        appointmentId: appt.id,
        patientName: patient.name,
        specialty: appt.specialty || 'Consultation',
      });

      await updateDoc(doc(db, 'appointments', appt.id), {
        paymentRef: data.data?.reference || data.data?.CheckoutRequestID || '',
        paymentStatus: 'processing',
        phone,
      });

      setPayMsg('✅ STK push sent! Check your phone for the M-Pesa prompt.');
    } catch (e: any) {
      setPayMsg('❌ ' + e.message);
    }

    setPaying(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {pending.length > 0 && (
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-title">⚠️ Outstanding Payments</div>
            <span className="count-badge" style={{ background: 'rgba(255,176,32,.15)', color: 'var(--amber)' }}>{pending.length}</span>
          </div>
          <div className="field-col" style={{ marginBottom: 12 }}>
            <label className="field-lbl">M-Pesa Number</label>
            <input className="field-inp" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" style={{ maxWidth: 240 }} />
          </div>
          {payMsg && <div className="msg-banner msg-ok" style={{ marginBottom: 10 }}>{payMsg}</div>}
          {pending.map(a => (
            <div key={a.id} className="pay-pending-card">
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.specialty || 'Consultation'} — Dr. {a.doctorName}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{fmtDate(a.scheduledDate || a.date)}</div>
                {a.paymentFailReason && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>Failed: {a.paymentFailReason}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--accent)', fontFamily: 'monospace' }}>KES {(a.amount || 0).toLocaleString()}</div>
                <button className="btn-sm-accent" onClick={() => retryPay(a)} disabled={paying === a.id} style={{ marginTop: 6 }}>
                  {paying === a.id ? 'Sending…' : '💳 Pay Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">✅ Payment History</div>
          <span className="count-badge">{paid.length}</span>
        </div>
        {paid.length === 0 ? (
          <div className="empty-sm"><div style={{ fontSize: 32 }}>🧾</div><p>No payment history yet.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paid.map(a => (
              <div key={a.id} className="pay-history-card">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{a.specialty} — Dr. {a.doctorName}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', marginTop: 2 }}>
                    Ref: {a.paymentRef || '—'} · {fmtDate(a.paidAt || a.date)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--green)', fontFamily: 'monospace' }}>KES {(a.amount || 0).toLocaleString()}</div>
                  <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700 }}>✓ PAID</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// CLINICAL HISTORY PANEL
// ═══════════════════════════════════════════════════════════════════════════
function ClinicalHistoryPanel({ patientId, patient }: { patientId: string; patient: Patient }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [filter, setFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'clinical_history'), where('patientId', '==', patientId), orderBy('date', 'desc')),
      snap => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryEntry)))
    );
    return () => unsub();
  }, [patientId]);

  const saveEdit = async (id: string) => {
    setSaving(true);
    await updateDoc(doc(db, 'clinical_history', id), {
      content: editContent,
      patientEdited: true,
      patientEditedAt: serverTimestamp(),
      version: (history.find(h => h.id === id)?.version || 1) + 0.1,
    });
    setEditingId(null); setSaving(false);
  };

  const types = ['all', 'encounter', 'lab', 'medical', 'allergy', 'surgery', 'family', 'social', 'note'];
  const filtered = filter === 'all' ? history : history.filter(h => h.type === filter);

  const typeIcon: Record<string, string> = {
    encounter: '🩺', lab: '🔬', medical: '📋', allergy: '⚠️',
    surgery: '🔪', family: '👨‍👩‍👦', social: '🌍', note: '📝', default: '📄',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">📋 Clinical History Timeline</div>
          <span className="count-badge">{history.length} entries</span>
        </div>
        <div className="filter-bar">
          {types.map(t => (
            <button key={t} className={`filter-pill ${filter === t ? 'filter-on' : ''}`} onClick={() => setFilter(t)}>
              {t === 'all' ? '🗂️ All' : `${typeIcon[t] || '📄'} ${t[0].toUpperCase() + t.slice(1)}`}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="empty-sm"><div style={{ fontSize: 32 }}>📭</div><p>No history entries yet. They'll appear after doctor consultations.</p></div>
        ) : (
          <div className="timeline">
            {filtered.map(h => (
              <div key={h.id} className="timeline-entry">
                <div className="timeline-dot">{typeIcon[h.type] || '📄'}</div>
                <div className="timeline-content" onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
                  <div className="timeline-hd">
                    <div>
                      <div className="timeline-section">{h.section}</div>
                      <div className="timeline-meta">
                        {fmtDate(h.date)} · {h.authorName ? `By Dr. ${h.authorName}` : 'System'} · v{(h.version || 1).toFixed(1)}
                      </div>
                    </div>
                    <span className="timeline-type-badge">{h.type}</span>
                  </div>
                  {expanded === h.id && (
                    <div className="timeline-body">
                      {editingId === h.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <textarea className="field-ta" value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-sm-accent" onClick={() => saveEdit(h.id)} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                            <button className="btn-secondary" style={{ width: 'auto', padding: '6px 12px' }} onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{h.content}</p>
                          {h.signatureHash && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8, fontFamily: 'monospace' }}>Signature: {h.signatureHash.slice(0, 24)}…</div>}
                          <button className="btn-secondary" style={{ marginTop: 10, width: 'auto', padding: '6px 14px', fontSize: 12 }}
                            onClick={(e) => { e.stopPropagation(); setEditingId(h.id); setEditContent(h.content); }}>
                            ✏️ Request edit
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DISEASE TOOLS PANEL (Real-time, from doctor)
// ═══════════════════════════════════════════════════════════════════════════
function DiseaseToolsPanel({ patientId, condition, vitals, onLogVital }: {
  patientId: string; condition?: string; vitals: VitalReading[]; onLogVital: () => void;
}) {
  const [targets, setTargets] = useState<DiseaseTarget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeReferralCount, setActiveReferralCount] = useState(0);
  useEffect(() => {
    if (!patientId) return;
    const u = onSnapshot(
      query(
        collection(db, 'referrals'),
        where('patientId', '==', patientId),
        where('status', 'in', ['pending', 'accepted', 'scheduled']),
      ),
      snap => setActiveReferralCount(snap.size),
      () => setActiveReferralCount(0),   // fallback on index error
    );
    return () => u();
  }, [patientId]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'disease_targets'), where('patientId', '==', patientId)),
      snap => setTargets(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiseaseTarget)))
    );
    return () => unsub();
  }, [patientId]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'alerts'), where('patientId', '==', patientId), where('read', '==', false), orderBy('createdAt', 'desc')),
      snap => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert)))
    );
    return () => unsub();
  }, [patientId]);

  const dismissAlert = async (id: string) => {
    await updateDoc(doc(db, 'alerts', id), { read: true });
  };

  const latestBP = vitals.find(v => v.type === 'bp');
  const latestGlucose = vitals.find(v => v.type === 'glucose');
  const conditionTargets = targets.length ? targets : condition === 'Hypertension' ? [
    { id: 'bp', label: 'Blood Pressure', target: '<130/80 mmHg', icon: '❤️', status: (latestBP && (latestBP.systolic ?? 120) < 130) ? 'on-target' as const : 'off-target' as const, current: latestBP ? `${latestBP.systolic ?? '—'}/${latestBP.diastolic ?? '—'}` : undefined, unit: 'mmHg' },
  ] : condition === 'Diabetes' ? [
    { id: 'glc', label: 'Blood Glucose', target: '4.0–7.0 mmol/L', icon: '🩸', status: (latestGlucose && parseFloat(latestGlucose.value) <= 7) ? 'on-target' as const : 'off-target' as const, current: latestGlucose?.value, unit: 'mmol/L' },
  ] : [];

  if (!condition) return null;

  return (
    <div className="disease-panel">
      <div className="disease-panel-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="disease-icon">🎯</div>
          <div>
            <div className="disease-title">{condition} Management</div>
            <div className="disease-sub">Real-time monitoring · Updated by your doctor</div>
          </div>
        </div>
        <button className="btn-sm-accent" onClick={onLogVital}>+ Log Reading</button>
      </div>

      {/* Alerts */}
      {alerts.filter(a => a.severity === 'high').length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {alerts.filter(a => a.severity === 'high').slice(0, 3).map(a => (
            <div key={a.id} className="disease-alert">
              <span>🚨 <strong>{a.title}</strong> — {a.body}</span>
              <button className="dismiss-btn" onClick={() => dismissAlert(a.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Targets */}
      <div className="targets-grid">
        {conditionTargets.map(t => (
          <div key={t.id} className={`target-card target-${t.status}`}>
            <div className="target-icon">{t.icon}</div>
            <div className="target-info">
              <div className="target-label">{t.label}</div>
              <div className="target-current">{t.current || '—'} <span className="target-unit">{t.unit}</span></div>
              <div className="target-goal">Target: {t.target}</div>
            </div>
            <div className={`target-status-badge ${t.status}`}>
              {t.status === 'on-target' ? '✓ On Target' : t.status === 'warning' ? '⚠️ Monitor' : '× Off Target'}
            </div>
          </div>
        ))}
      </div>

      {/* BP Trend */}
      {condition === 'Hypertension' && vitals.filter(v => v.type === 'bp').length > 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>7-Day BP Trend</div>
          <div className="bp-sparkline-row">
              {vitals.filter(v => v.type === 'bp').slice(0, 7).reverse().map((v, i) => {
              const pct = Math.min(100, Math.max(5, (((v.systolic ?? 120) - 80) / 80) * 100));
              const cat = bpCat(v.systolic ?? 120, v.diastolic ?? 80);
              return (
                <div key={i} className="spark-col" title={`${v.systolic}/${v.diastolic} — ${cat.label}\n${fmtShort(v.recordedAt)}`}>
                  <div className="spark-bar-outer">
                    <div className="spark-bar-inner" style={{ height: `${pct}%`, background: cat.color }} />
                  </div>
                  <div className="spark-date">{fmtShort(v.recordedAt)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LABS & IMAGING PANEL
// ═══════════════════════════════════════════════════════════════════════════
function LabsPanel({ patientId }: { patientId: string }) {
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [filter, setFilter] = useState<'all'|'abnormal'|'critical'>('all');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'lab_results'), where('patientId', '==', patientId), orderBy('date', 'desc')),
      snap => setLabs(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabResult)))
    );
    return () => unsub();
  }, [patientId]);

  const statusColor = { normal: 'var(--green)', abnormal: 'var(--amber)', critical: 'var(--red)' };
  const filtered = filter === 'all' ? labs : labs.filter(l => l.status === filter);

  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-title">🔬 Lab Results</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all','abnormal','critical'] as const).map(f => (
            <button key={f} className={`filter-pill ${filter === f ? 'filter-on' : ''}`} onClick={() => setFilter(f)} style={{ padding: '4px 10px', fontSize: 11 }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-sm"><div style={{ fontSize: 28 }}>🔬</div><p>No lab results yet. They'll appear when ordered by your doctor.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(lab => (
            <div key={lab.id} className="lab-card" style={{ borderLeft: `3px solid ${statusColor[lab.status]}` }}>
              <div className="lab-card-hd">
                <div>
                  <div className="lab-name">{lab.testName}</div>
                  <div className="lab-meta">{fmtShort(lab.date)} · {lab.orderedBy ? `Dr. ${lab.orderedBy}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="lab-result" style={{ color: statusColor[lab.status] }}>{lab.result} {lab.unit}</div>
                  <div className="lab-ref">{lab.referenceRange && `Ref: ${lab.referenceRange}`}</div>
                  <span className="lab-status" style={{ background: `${statusColor[lab.status]}20`, color: statusColor[lab.status] }}>{lab.status}</span>
                </div>
              </div>
              {lab.notes && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, fontStyle: 'italic' }}>{lab.notes}</p>}
              {lab.reportUrl && <a href={lab.reportUrl} target="_blank" rel="noreferrer" className="lab-download">📄 Download Report</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGES PANEL (with doctor)
// ═══════════════════════════════════════════════════════════════════════════
function MessagesPanel({ patient, appointments }: { patient: Patient; appointments: Appointment[] }) {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);

  // Get unique doctors from completed appointments
  const myDoctors = Array.from(new Map(
    appointments.filter(a => a.status === 'completed' || a.status === 'active')
      .map(a => [a.doctorId, { id: a.doctorId, name: a.doctorName }])
  ).values());

  useEffect(() => {
    if (!activeThread) return;
    const threadId = [patient.uid, activeThread].sort().join('_');
    const unsub = onSnapshot(
      query(collection(db, 'messages'), where('threadId', '==', threadId), orderBy('timestamp', 'asc')),
      snap => {
        setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        // Mark as read
        snap.docs.forEach(d => { if (!d.data().read && d.data().senderId !== patient.uid) updateDoc(d.ref, { read: true }); });
      }
    );
    return () => unsub();
  }, [activeThread, patient.uid]);

  const sendMsg = async (text?: string, fileUrl?: string, fileType?: string, fileName?: string) => {
    if (!activeThread) return;
    const threadId = [patient.uid, activeThread].sort().join('_');
    await addDoc(collection(db, 'messages'), {
      threadId, text: text || '', fileUrl, fileType, fileName,
      senderId: patient.uid, senderName: patient.name, senderRole: 'patient',
      timestamp: serverTimestamp(), read: false,
      type: fileUrl ? (fileType?.startsWith('image/') ? 'image' : 'file') : 'text',
    });
    setInput('');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const sRef = storageRef(storage, `messages/${patient.uid}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(sRef, file);
    task.on('state_changed', null, console.error, async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      await sendMsg('', url, file.type, file.name);
      setUploading(false);
    });
  };

  const doctorName = myDoctors.find(d => d.id === activeThread)?.name;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, height: 520 }}>
      {/* Thread list */}
      <div className="panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-title" style={{ marginBottom: 12 }}>💬 Conversations</div>
        {myDoctors.length === 0 ? (
          <div className="empty-sm" style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 24 }}>💬</div>
            <p style={{ fontSize: 12 }}>Messages appear after consultations</p>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {myDoctors.map(d => (
              <button key={d.id} className={`msg-thread-btn ${activeThread === d.id ? 'msg-thread-on' : ''}`} onClick={() => setActiveThread(d.id)}>
                <div className="msg-thread-ava">{(d.name || 'D')[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Dr. {d.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeThread ? (
          <div className="empty-sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '0 0 12px', borderBottom: '1px solid var(--border)', marginBottom: 12, fontWeight: 700, fontSize: 14 }}>
              Dr. {doctorName}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {msgs.map(m => (
                <div key={m.id} className={`msg-b ${m.senderId === patient.uid ? 'msg-b-mine' : 'msg-b-theirs'}`}>
                  <div className="msg-who">{m.senderRole === 'doctor' ? `🩺 Dr. ${m.senderName}` : 'You'}</div>
                  {m.type === 'text' && <span>{m.text}</span>}
                  {m.type === 'image' && <img src={m.fileUrl} alt={m.fileName} style={{ maxWidth: '100%', borderRadius: 8, marginTop: 4 }} />}
                  {m.type === 'file' && <a href={m.fileUrl} target="_blank" rel="noreferrer" className="msg-file-link">📎 {m.fileName}</a>}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="attach-btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading} title="Attach file">
                {uploading ? '⏳' : '📎'}
              </button>
              <input className="msg-inp" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg(input)}
                placeholder="Type a message…" style={{ flex: 1 }} />
              <button className="msg-send-btn" onClick={() => sendMsg(input)}>↑</button>
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile} accept="image/*,.pdf,.doc,.docx" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EDUCATION PANEL
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export default function PatientDashboard() {
  const router = useRouter();
  const [authDone, setAuthDone] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [patientNotifications, setPatientNotifications] = useState<any[]>([]);
  const [educationLogs, setEducationLogs] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
  const [standalonePrescriptions, setStandalonePrescriptions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [bookSvc, setBookSvc] = useState<Service | null>(null);
  const [profileSvc, setProfileSvc] = useState<Service | null>(null);
  const [showLogVital, setShowLogVital] = useState(false);
  const [showTriage, setShowTriage] = useState(false);
  const [showSmartcard, setShowSmartcard] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [triageDone, setTriageDone] = useState(false);
  const [triageSpecialty, setTriageSpecialty] = useState('All');
  const [joining, setJoining] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatDoctor, setChatDoctor] = useState<{ doctorId: string; doctorName: string } | null>(null);
  const [patientTheme, setPatientTheme] = useState<PatientTheme>('teal');
  const [expandedEdu, setExpandedEdu] = useState<string | null>(null);
  const [eduQuestions, setEduQuestions] = useState<any[]>([]);
  const [eduStories, setEduStories] = useState<any[]>([]);
  const eduReadRef = useRef(false);

  // ── Close sidebar on mobile resize ──
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth <= 768) setSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.replace('/login'); return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.data() || {};
      if (data.role === 'doctor') { router.replace('/dashboard/doctor'); return; }
      setPatient({
        uid: user.uid, name: data.name || user.displayName || 'Patient',
        email: data.email || user.email || '', phone: data.phone, age: data.age,
        gender: data.gender, bloodGroup: data.bloodGroup, condition: data.condition,
        universalId: data.universalId || `AMX-${user.uid.slice(0, 8).toUpperCase()}`,
        allergies: data.allergies || [], emergencyContact: data.emergencyContact,
        photoUrl: data.photoUrl, address: data.address, dateOfBirth: data.dateOfBirth,
        occupation: data.occupation, nextOfKin: data.nextOfKin,
        insuranceProvider: data.insuranceProvider, insuranceNumber: data.insuranceNumber,
      });
      setAuthDone(true);
    });
    return () => unsub();
  }, [router]);

 // ─── Firestore listeners ──────────────────────────────────────────────────────

// Services — publicly readable (rule: allow read: if true) ✅ no change needed
// but add limit to avoid loading all docs unnecessarily
useEffect(() => {
  const unsub = onSnapshot(
    query(
      collection(db, 'services'),
      where('isAvailable', '==', true),
      limit(50)
    ),
    snap => setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)))
  );
  return () => unsub();
}, []);


// Appointments — ✅ already correct (patientId filter present)
// Added: handle missing orderBy index gracefully
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(
      collection(db, 'appointments'),
      where('patientId', '==', patient.uid),   // ← matches rule check
      orderBy('date', 'desc')
    ),
    async snap => {
      const appts = await Promise.all(
        snap.docs.map(async d => {
          const appt = { id: d.id, ...d.data() } as Appointment;
          if (appt.consultationId) {
            try {
              const cs = await getDoc(doc(db, 'consultations', appt.consultationId));
              if (cs.exists()) {
                const cdata = cs.data();
                appt.prescriptions = cdata.prescriptions || [];
                appt.notes         = cdata.notes         || '';
              }
            } catch {}  // consultation may not exist yet — silent
          }
          return appt;
        })
      );
      setAppointments(appts);
    },
    err => console.error('appointments listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);


// Vitals — ✅ already correct (patientId filter present)
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(
      collection(db, 'vitals'),
      where('patientId', '==', patient.uid),   // ← matches rule check
      orderBy('recordedAt', 'desc'),
      limit(50)
    ),
    snap => setVitals(snap.docs.map(d => ({ id: d.id, ...d.data() } as VitalReading))),
    err => console.error('vitals listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);


// Alerts — ✅ already correct (patientId filter present)
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(
      collection(db, 'alerts'),
      where('patientId', '==', patient.uid),   // ← matches rule check
      orderBy('createdAt', 'desc'),
      limit(30)
    ),
    snap => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert))),
    err => console.error('alerts listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);

// PatientNotifications — doctor-sent alerts (education, labs, referrals, pathway, clinical)
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(
      collection(db, 'patientNotifications'),
      where('patientId', '==', patient.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    ),
    snap => setPatientNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error('patientNotifications listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);

// EducationLogs — doctor-sent education materials
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(
      collection(db, 'education_logs'),
      where('patientId', '==', patient.uid),
      orderBy('sentAt', 'desc'),
      limit(50)
    ),
    snap => setEducationLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error('education_logs listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);

// ── Education Questions ──
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(collection(db, 'education_questions'), where('patientId', '==', patient.uid), orderBy('askedAt', 'desc')),
    snap => setEduQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error('education_questions listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);

// ── Education Stories ──
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(collection(db, 'education_stories'), where('patientId', '==', patient.uid), orderBy('sharedAt', 'desc')),
    snap => setEduStories(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error('education_stories listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);

// ── Mark education as read when tab is visited ──
useEffect(() => {
  if (activeTab !== 'education' || !patient || eduReadRef.current) return;
  const unread = educationLogs.filter((e: any) => !e.read && e.id);
  if (unread.length === 0) { eduReadRef.current = true; return; }
  eduReadRef.current = true;
  unread.forEach((e: any) => {
    updateDoc(doc(db, 'education_logs', e.id), { read: true }).catch(() => {});
  });
}, [activeTab, educationLogs, patient]);

// ── Deduplicated education logs (by topic, keep latest) ──
const dedupedEducation = useMemo(() => {
  const seen = new Map<string, any>();
  for (const log of educationLogs) {
    const key = (log.topic || log.title || log.resourceTitle || log.id || '');
    if (!seen.has(key) || (log.sentAt?.toDate?.()?.getTime() || 0) > (seen.get(key)?.sentAt?.toDate?.()?.getTime() || 0)) {
      seen.set(key, log);
    }
  }
  return Array.from(seen.values());
}, [educationLogs]);

// LabOrders — pending / active lab orders from doctor
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(
      collection(db, 'labOrders'),
      where('patientId', '==', patient.uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    ),
    snap => setLabOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error('labOrders listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);

// ClinicalNotes — doctor's clinical notes for this patient
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(
      collection(db, 'clinicalNotes'),
      where('patientId', '==', patient.uid),
      orderBy('createdAt', 'desc'),
      limit(100)
    ),
    snap => setClinicalNotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error('clinicalNotes listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);

// Prescriptions — standalone (not attached to an appointment)
useEffect(() => {
  if (!patient) return;
  const unsub = onSnapshot(
    query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patient.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    ),
    snap => setStandalonePrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error('prescriptions listener:', err.code, err.message)
  );
  return () => unsub();
}, [patient]);

// ── Init theme on mount ──
useEffect(() => { initPatientTheme(); setPatientTheme(getStoredPatientTheme()); }, []);

  // ── Derived data ──────────────────────────────────────────────────────
  const activeAppts = appointments.filter(a => a.status === 'active');
  const upcomingAppts = appointments.filter(a => a.status === 'booked');
  const nextAppt = upcomingAppts[0];
  const countdown = useCountdown(nextAppt?.scheduledDate || nextAppt?.date);
  const unreadNotifications = patientNotifications.filter((n: any) => !n.read).length;
  const unreadAlerts = alerts.filter(a => !a.read).length + unreadNotifications;
  const allNotifications = [
    ...alerts.map(a => ({ ...a, _source: 'alerts' as const })),
    ...patientNotifications.map((n: any) => ({ ...n, _source: 'patientNotifications' as const })),
  ].sort((a, b) => {
    const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return tb - ta;
  });
  const unreadEducationLogs = educationLogs.filter((e: any) => !e.read).length;
  const pendingLabOrders = labOrders.filter((o: any) => o.status === 'ordered' || o.status === 'pending').length;
  const allPrescriptions = [
    ...appointments.flatMap(a => (a.prescriptions || []).map(rx => ({ ...rx, apptId: a.id, doctorName: a.doctorName }))),
    ...standalonePrescriptions.map(rx => ({ ...rx, doctorName: rx.doctorName || rx.prescriberName })),
  ].filter((rx, i, arr) => arr.findIndex(r => r.id === rx.id) === i);
  const specialties = ['All', ...Array.from(new Set(services.map(s => s.specialty)))];
  const clinics = ['All', ...Array.from(new Set(services.map(s => s.clinic)))];
  const [clinicFilter, setClinicFilter] = useState('All');
// Add this near the top of your component, after appointments state is set
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (!patient?.uid) return;
    const u = onSnapshot(
      query(
        collection(db, 'referrals'),
        where('patientId', '==', patient.uid),
        where('status', 'in', ['pending', 'accepted', 'scheduled'])
      ),
      snap => setReferralCount(snap.size),
      () => setReferralCount(0)
    );
    return () => u();
  }, [patient?.uid]);
  const filteredSvcs = services.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || `${s.specialty} ${s.doctorName} ${s.clinic} ${s.location || ''}`.toLowerCase().includes(q);
    const matchSp = specialtyFilter === 'All' || s.specialty === specialtyFilter;
    const matchCl = clinicFilter === 'All' || s.clinic === clinicFilter;
    const matchTriage = !triageDone || triageSpecialty === 'All' || s.specialty.toLowerCase().includes(triageSpecialty.toLowerCase());
    return matchQ && matchSp && matchCl && matchTriage;
  });

  // ── Join consultation ──────────────────────────────────────────────────
 const joinConsultation = async (appt: Appointment) => {
  setJoining(appt.id);
  try {
    // Fast path — consultationId already stored on appointment
    if (appt.consultationId) {
      router.push(`/dashboard/consultation/${appt.consultationId}`);
      setJoining(null);
      return;
    }

    // ✅ FIXED: add patientId filter so Firestore rule can verify access
    const q = query(
      collection(db, 'consultations'),
      where('appointmentId', '==', appt.id),
      where('patientId', '==', patient!.uid)   // ← required by security rule
    );
    const qs = await getDocs(q);

    if (!qs.empty) {
      router.push(`/dashboard/consultation/${qs.docs[0].id}`);
    } else {
      alert('Consultation room not ready yet. Please wait for your doctor to open the session.');
    }
  } catch (e) {
    console.error('joinConsultation error:', e);
    alert('Could not join. Please try again.');
  }
  setJoining(null);
};
  const tabs = [
  { id: 'overview',      icon: '🏠', label: 'Overview' },
  { id: 'record',        icon: '📋', label: 'Medical Record' },
  { id: 'prescriptions', icon: '💊', label: 'Prescriptions' },
  { id: 'vitals',        icon: '📊', label: 'Vitals' },
  { id: 'labs',          icon: '🔬', label: 'Labs' },
  { id: 'health',        icon: '🩺', label: 'My Health' },
  { id: 'appointments',  icon: '📅', label: 'Appointments' },
  { id: 'visits',        icon: '🩺', label: 'Visit Notes' },
  { id: 'tools',         icon: '🔧', label: 'My Tools' },
  { id: 'referrals',     icon: '📋', label: 'Referrals' },
  { id: 'messages',      icon: '💬', label: 'Messages', badge: allNotifications.filter((n: any) => !n.read && (n.type === 'message' || n.type === 'clinical')).length },
  { id: 'education',     icon: '📚', label: 'Education', badge: educationLogs.filter((e: any) => !e.read).length },
  { id: 'discover',      icon: '🔍', label: 'Find Doctors' },
  { id: 'payments',      icon: '💳', label: 'Payments' },
  { id: 'settings',      icon: '⚙️', label: 'Settings' },
];
// Mobile nav — keep 5 items, swap Education for Health since Health is used daily
[
  { id: 'overview',     icon: '🏠', label: 'Home' },
  { id: 'record',       icon: '📋', label: 'Record' },
  { id: 'health',       icon: '🩺', label: 'Health' },     // ← My Health visible on mobile
  { id: 'appointments', icon: '📅', label: 'Visits' },
  { id: 'messages',     icon: '💬', label: 'Messages' },
]
  // ── Loading state ──────────────────────────────────────────────────────
  if (!authDone || !patient) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f1a', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #1e2535', borderTopColor: '#00e5cc', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Loading your health profile…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  const latestBP = vitals.find(v => v.type === 'bp');
  const bpInfo = latestBP ? bpCat(latestBP.systolic ?? 120, latestBP.diastolic ?? 80) : null;

  // ══════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0b0f1a;
          --surface: #111827;
          --surface2: #1a2338;
          --surface3: #1e2a3d;
          --border: #243047;
          --border2: #2d3f58;
          --text: #e8edf5;
          --text2: #8b9bbf;
          --muted: #546382;
          --accent: #00e5cc;
          --accent2: #7c5af5;
          --accent3: #3b82f6;
          --green: #00d68f;
          --amber: #ffb020;
          --red: #ff4560;
          --font: 'DM Sans', sans-serif;
          --font-display: 'Syne', sans-serif;
          --mono: 'JetBrains Mono', monospace;
          --r: 14px;
          --r-sm: 9px;
          --r-lg: 20px;
          --shadow: 0 1px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
          --shadow-md: 0 4px 20px rgba(0,0,0,0.4);
          --shadow-lg: 0 16px 48px rgba(0,0,0,0.5);
        }

        html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); -webkit-font-smoothing: antialiased; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d3f58; border-radius: 99px; }

        /* ── LAYOUT ──────────────────────────────────────────────────────── */
        .shell { display: flex; min-height: 100vh; }
        .sidebar {
          width: 228px; background: var(--surface); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh;
          flex-shrink: 0; z-index: 30; overflow: hidden; transition: width 0.3s ease;
        }
        .main { flex: 1; overflow-y: auto; min-height: 100vh; display: flex; flex-direction: column; }
        .hamburger-btn { background: none; border: none; color: var(--text); font-size: 20px; cursor: pointer; padding: 6px 10px; border-radius: 6px; transition: background 0.15s; line-height: 1; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
        .hamburger-btn:hover { background: var(--surface2); }
        .sidebar-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; }
        .sidebar-backdrop.visible { display: block; }
        @media (min-width: 769px) { .sidebar-backdrop { display: none !important; } }

        /* ── SIDEBAR ─────────────────────────────────────────────────────── */
        .sb-brand { padding: 20px 18px 14px; border-bottom: 1px solid var(--border); }
        .sb-logo { display: flex; align-items: center; gap: 9px; }
        .sb-logo-glyph {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg, #00e5cc, #7c5af5);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; box-shadow: 0 4px 14px rgba(0,229,204,0.3);
        }
        .sb-logo-name { font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }
        .sb-logo-sub { font-size: 9px; color: var(--accent); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }

        .sb-profile { padding: 14px 18px; border-bottom: 1px solid var(--border); }
        .sb-ava {
          width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg, #7c5af5, #00e5cc);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 16px; color: white; overflow: hidden;
        }
        .sb-pname { font-weight: 700; font-size: 13px; margin-top: 8px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sb-pid { font-size: 10px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }
        .sb-cond { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 99px; background: rgba(0,229,204,.1); color: var(--accent); }

        .sb-nav { flex: 1; overflow-y: auto; padding: 10px 8px; display: flex; flex-direction: column; gap: 1px; }
        .sb-item {
          display: flex; align-items: center; gap: 9px; padding: 9px 11px; border-radius: var(--r-sm);
          border: none; background: transparent; color: var(--text2); font-size: 12.5px; font-weight: 500;
          cursor: pointer; font-family: var(--font); width: 100%; text-align: left; transition: all 0.15s;
          white-space: nowrap;
        }
        .sb-item:hover { background: var(--surface2); color: var(--text); }
        .sb-item.active { background: rgba(0,229,204,.1); color: var(--accent); font-weight: 700; }
        .sb-item-icon { font-size: 15px; flex-shrink: 0; width: 20px; text-align: center; }
        .sb-badge { margin-left: auto; background: var(--red); color: white; border-radius: 99px; min-width: 18px; height: 18px; font-size: 9px; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; }

        .sb-footer { padding: 10px 8px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px; }
        .sb-signout { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 11px; background: transparent; border: 1px solid var(--border); border-radius: var(--r-sm); color: var(--muted); font-size: 12.5px; font-weight: 500; cursor: pointer; font-family: var(--font); transition: all 0.15s; flex-shrink: 0; }
        .sb-signout:hover { border-color: var(--red); color: var(--red); background: rgba(255,69,96,.08); }
        .sb-themes { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; padding: 4px 0; }
        .sb-theme-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; background: var(--dot-color, var(--accent)); transition: all 0.2s; padding: 0; flex-shrink: 0; }
        .sb-theme-dot:hover { transform: scale(1.2); }
        .sb-theme-dot.active { border-color: var(--text); box-shadow: 0 0 0 2px var(--dot-color, var(--accent)); }

        /* ── TOP HEADER ──────────────────────────────────────────────────── */
        .top-hd {
          background: var(--surface); border-bottom: 1px solid var(--border);
          padding: 12px 24px; display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 20; backdrop-filter: blur(12px);
        }
        .th-left { display: flex; flex-direction: column; }
        .th-greeting { font-size: 11px; color: var(--muted); font-weight: 500; }
        .th-name { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.3px; }
        .th-actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .th-btn {
          display: flex; align-items: center; gap: 5px; padding: 7px 13px; border-radius: var(--r-sm);
          border: 1px solid var(--border2); background: var(--surface2); color: var(--text2);
          font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all 0.15s;
        }
        .th-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,229,204,.06); }
        .th-btn-accent { background: linear-gradient(135deg, #7c5af5, #00e5cc); color: #000; border: none; font-weight: 700; box-shadow: 0 4px 14px rgba(124,90,245,0.35); }
        .th-btn-accent:hover { opacity: 0.9; color: #000; }

        /* ── CONTENT ─────────────────────────────────────────────────────── */
        .content { padding: 22px 24px; flex: 1; animation: fadeUp 0.25s ease; }

        /* ── LIVE BANNER ─────────────────────────────────────────────────── */
        .live-banner {
          background: linear-gradient(90deg, rgba(0,214,143,.08), rgba(0,214,143,.04));
          border: 1px solid rgba(0,214,143,.25); border-radius: var(--r); padding: 13px 18px;
          margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px;
        }
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 1.5s infinite; }
        .btn-join-live { background: var(--green); color: #000; border: none; border-radius: 10px; padding: 9px 18px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: var(--font); }
        .btn-join-live:hover { background: #00f0a4; }
        .btn-join-live:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── HERO ────────────────────────────────────────────────────────── */
        .hero-row { display: grid; grid-template-columns: 1fr auto; gap: 14px; margin-bottom: 18px; }
        .hero-card {
          background: linear-gradient(135deg, #0d1f3c 0%, #162848 40%, #0f2034 100%);
          border: 1px solid var(--border2); border-radius: var(--r-lg); padding: 24px 26px;
          position: relative; overflow: hidden;
        }
        .hero-card::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(0,229,204,.12) 0%, transparent 70%); pointer-events: none; }
        .hero-card::after { content: ''; position: absolute; bottom: -80px; left: 20px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, rgba(124,90,245,.1) 0%, transparent 70%); pointer-events: none; }
        .hero-greet { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.8px; color: var(--accent); margin-bottom: 4px; }
        .hero-name { font-family: var(--font-display); font-size: 22px; font-weight: 900; letter-spacing: -0.3px; color: var(--text); }
        .hero-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .hero-chip { background: rgba(255,255,255,.07); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.1); border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: var(--text2); }
        .hero-tip { margin-top: 14px; padding: 10px 14px; background: rgba(0,229,204,.08); border: 1px solid rgba(0,229,204,.15); border-radius: 10px; font-size: 12.5px; color: var(--text2); line-height: 1.6; }

        .next-appt-card {
          background: var(--surface); border: 1px solid var(--border2); border-radius: var(--r-lg);
          padding: 18px; min-width: 190px; display: flex; flex-direction: column; gap: 5px;
        }
        .na-label { font-size: 9px; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; }
        .na-count { font-family: var(--mono); font-size: 26px; font-weight: 700; color: var(--text); }
        .na-badge { display: inline-flex; background: rgba(0,229,204,.12); color: var(--accent); border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 700; width: fit-content; }
        .na-doctor { font-size: 12px; color: var(--text2); font-weight: 600; }
        .na-date { font-size: 10px; color: var(--muted); font-family: var(--mono); }

        /* ── STATS GRID ──────────────────────────────────────────────────── */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 16px; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
        .stat-card:hover { border-color: var(--accent); }
        .stat-icon { font-size: 26px; flex-shrink: 0; }
        .stat-val { font-family: var(--mono); font-size: 20px; font-weight: 700; }
        .stat-lbl { font-size: 10px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        /* ── PANELS ──────────────────────────────────────────────────────── */
        .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 18px 20px; }
        .panel-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .panel-title { font-size: 13.5px; font-weight: 700; color: var(--text); }
        .count-badge { background: rgba(0,229,204,.1); color: var(--accent); border-radius: 99px; font-size: 10px; font-weight: 700; padding: 2px 8px; }
        .empty-sm { text-align: center; padding: 28px 0; color: var(--muted); font-size: 13px; }
        .btn-sm-accent { background: rgba(0,229,204,.12); color: var(--accent); border: 1px solid rgba(0,229,204,.2); border-radius: 7px; padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: all 0.15s; }
        .btn-sm-accent:hover { background: rgba(0,229,204,.2); }

        /* ── PRESCRIPTION HISTORY ─────────────────────────────────────────── */
        .rx-history-section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
        .rxh-hd { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--border); }
        .rxh-title { font-size: 14px; font-weight: 700; color: var(--text); }
        .rxh-count { font-size: 10px; color: var(--muted); font-weight: 600; }
        .rxh-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--border); padding: 0; }
        .rxh-card { background: var(--surface); padding: 14px 18px; display: flex; flex-direction: column; gap: 6px; transition: background 0.15s; }
        .rxh-card:hover { background: var(--surface2); }
        .rxh-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .rxh-drug { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rxh-drug-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .rxh-status-badge { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px; }
        .rxh-status-badge.active { background: rgba(0,214,143,.12); color: var(--green); }
        .rxh-status-badge.completed { background: rgba(59,130,246,.12); color: var(--accent3); }
        .rxh-status-badge.stopped { background: rgba(255,69,96,.1); color: var(--red); }
        .rxh-date { font-size: 10px; color: var(--muted); font-family: var(--mono); white-space: nowrap; flex-shrink: 0; }
        .rxh-meta { display: flex; flex-wrap: wrap; gap: 4px; }
        .rxh-chip { font-size: 10.5px; color: var(--text2); background: var(--surface3); padding: 3px 9px; border-radius: 6px; font-weight: 500; }
        .rxh-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px; }
        .rxh-doctor { font-size: 11px; color: var(--accent3); font-weight: 600; }
        .rxh-condition { font-size: 10px; color: var(--muted); }
        @media (min-width: 640px) { .rxh-grid { grid-template-columns: repeat(2, 1fr); background: transparent; gap: 8px; padding: 12px; } .rxh-card { border: 1px solid var(--border); border-radius: var(--r-sm); } }
        @media (min-width: 1024px) { .rxh-grid { grid-template-columns: repeat(3, 1fr); } }

        /* ── OVERVIEW GRIDS ──────────────────────────────────────────────── */
        .overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .full-width { grid-column: 1 / -1; }

        /* ── VITALS ──────────────────────────────────────────────────────── */
        .vital-main { border: 1.5px solid var(--border2); border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        .vital-main-val { font-family: var(--mono); font-size: 26px; font-weight: 700; }
        .vital-badge { display: inline-flex; padding: 2px 9px; border-radius: 99px; font-size: 11px; font-weight: 700; margin-top: 4px; }
        .vitals-mini { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .vital-mini { background: var(--surface2); border-radius: 10px; padding: 10px 8px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .vital-mini-val { font-family: var(--mono); font-size: 15px; font-weight: 700; }

        /* ── BP SPARKLINE ─────────────────────────────────────────────────── */
        .bp-sparkline-row { display: flex; gap: 8px; align-items: flex-end; height: 56px; }
        .spark-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
        .spark-bar-outer { flex: 1; width: 100%; background: var(--surface3); border-radius: 4px; display: flex; align-items: flex-end; overflow: hidden; }
        .spark-bar-inner { width: 100%; border-radius: 4px; transition: height 0.5s ease; }
        .spark-date { font-size: 8px; color: var(--muted); font-family: var(--mono); }

        /* ── DISEASE PANEL ───────────────────────────────────────────────── */
        .disease-panel {
          background: linear-gradient(135deg, #0d1a2e, #0f2035);
          border: 1px solid rgba(0,229,204,.2); border-radius: var(--r-lg);
          padding: 20px 22px; margin-bottom: 18px;
        }
        .disease-panel-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
        .disease-icon { font-size: 24px; }
        .disease-title { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text); }
        .disease-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .disease-alert { background: rgba(255,69,96,.1); border: 1px solid rgba(255,69,96,.25); border-radius: 9px; padding: 10px 14px; font-size: 12px; color: var(--text2); display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .dismiss-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 12px; flex-shrink: 0; }
        .targets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .target-card { background: var(--surface2); border: 1.5px solid var(--border2); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
        .target-card.target-on-target { border-color: rgba(0,214,143,.3); background: rgba(0,214,143,.05); }
        .target-card.target-off-target { border-color: rgba(255,69,96,.3); background: rgba(255,69,96,.05); }
        .target-card.target-warning { border-color: rgba(255,176,32,.3); background: rgba(255,176,32,.05); }
        .target-icon { font-size: 24px; flex-shrink: 0; }
        .target-label { font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .target-current { font-family: var(--mono); font-size: 20px; font-weight: 700; color: var(--text); }
        .target-unit { font-size: 11px; color: var(--muted); font-weight: 400; }
        .target-goal { font-size: 11px; color: var(--text2); margin-top: 2px; }
        .target-status-badge { margin-left: auto; flex-shrink: 0; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 99px; }
        .target-status-badge.on-target { background: rgba(0,214,143,.15); color: var(--green); }
        .target-status-badge.off-target { background: rgba(255,69,96,.15); color: var(--red); }
        .target-status-badge.warning { background: rgba(255,176,32,.15); color: var(--amber); }

        /* ── PRESCRIPTIONS ───────────────────────────────────────────────── */
        .rx-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
        .rx-card-hd { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .rx-card-name { font-weight: 700; font-size: 14px; color: var(--text); }
        .rx-card-doc { font-size: 11px; color: var(--muted); }
        .rx-card-meta { display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px; color: var(--text2); }
        .rx-card-instructions { font-size: 12px; color: var(--text2); margin-top: 6px; font-style: italic; border-top: 1px solid var(--border); padding-top: 6px; }
        .cal-row { display: flex; gap: 4px; margin-top: 10px; }
        .cal-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 5px 2px; border-radius: 8px; background: var(--surface3); border: 1px solid var(--border); cursor: pointer; transition: all .2s; }
        .cal-day:hover { border-color: var(--accent); }
        .cal-day.cal-taken { background: rgba(0,214,143,.15); border-color: rgba(0,214,143,.4); }
        .cal-day.cal-today { border-color: var(--accent); }
        .cal-dn { font-size: 9px; color: var(--muted); font-weight: 700; text-transform: uppercase; }
        .cal-dd { font-size: 12px; font-weight: 700; color: var(--text); font-family: var(--mono); }
        .cal-check { font-size: 10px; color: var(--green); }

        /* ── DISCOVER ────────────────────────────────────────────────────── */
        .triage-prompt { background: linear-gradient(135deg, rgba(124,90,245,.08), rgba(0,229,204,.04)); border: 1px solid rgba(124,90,245,.2); border-radius: var(--r); padding: 16px 20px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .triage-done { background: rgba(0,214,143,.06); border: 1px solid rgba(0,214,143,.2); border-radius: var(--r); padding: 10px 16px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
        .discover-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
        .search-wrap { position: relative; flex: 1 1 220px; }
        .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; }
        .discover-search { width: 100%; padding: 9px 13px 9px 36px; background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--r-sm); color: var(--text); font-size: 13px; font-family: var(--font); outline: none; transition: border-color .15s; }
        .discover-search:focus { border-color: var(--accent); }
        .pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
        .pill { padding: 5px 12px; border-radius: 99px; border: 1px solid var(--border2); background: var(--surface2); color: var(--text2); font-size: 11px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
        .pill.on { background: rgba(0,229,204,.12); border-color: rgba(0,229,204,.3); color: var(--accent); }
        .pill:not(.on):hover { border-color: var(--accent); color: var(--accent); }
        .svc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .svc-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 0; overflow: hidden; display: flex; flex-direction: column; transition: all .2s; cursor: pointer; }
        .svc-card:hover { border-color: rgba(0,229,204,.3); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,.4); }
        .svc-card-banner { height: 4px; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
        .svc-card-body { padding: 18px; display: flex; flex-direction: column; gap: 11px; flex: 1; }
        .svc-card-hd { display: flex; justify-content: space-between; align-items: flex-start; }
        .svc-spec { font-family: var(--font-display); font-weight: 800; font-size: 15px; color: var(--text); }
        .svc-price { font-family: var(--mono); font-size: 16px; font-weight: 700; color: var(--accent); }
        .svc-doc-row { display: flex; align-items: center; gap: 9px; }
        .svc-doc-ava { width: 36px; height: 36px; border-radius: 9px; overflow: hidden; background: linear-gradient(135deg, #7c5af5, #00e5cc); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: white; flex-shrink: 0; }
        .svc-doc-name { font-weight: 700; font-size: 13px; color: var(--text); }
        .svc-doc-clinic { font-size: 11px; color: var(--muted); }
        .svc-chips { display: flex; gap: 5px; flex-wrap: wrap; }
        .svc-chip { background: var(--surface2); color: var(--text2); border-radius: 99px; padding: 2px 9px; font-size: 10px; font-weight: 600; border: 1px solid var(--border2); }
        .svc-desc { font-size: 12px; color: var(--text2); line-height: 1.6; flex: 1; }
        .svc-card-footer { padding: 0 18px 18px; display: flex; gap: 8px; }
        .btn-view-profile { flex: 1; background: var(--surface2); border: 1px solid var(--border2); color: var(--text2); border-radius: 9px; padding: 9px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: all .15s; }
        .btn-view-profile:hover { border-color: var(--accent); color: var(--accent); }
        .btn-book { flex: 1; background: linear-gradient(135deg, #7c5af5, #00e5cc); color: #000; border: none; border-radius: 9px; padding: 9px; font-size: 12px; font-weight: 800; cursor: pointer; font-family: var(--font); transition: all .15s; }
        .btn-book:hover { opacity: .9; }

        /* ── DOCTOR DRAWER ───────────────────────────────────────────────── */
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 90; display: flex; justify-content: flex-end; backdrop-filter: blur(4px); }
        .drawer { background: var(--surface); width: min(520px, 100vw); height: 100vh; overflow-y: auto; display: flex; flex-direction: column; animation: slideIn .2s ease; position: relative; }
        .drawer-close { position: absolute; top: 14px; right: 14px; background: var(--surface2); border: none; color: var(--text2); width: 30px; height: 30px; border-radius: 8px; cursor: pointer; font-size: 13px; z-index: 2; transition: all .15s; }
        .drawer-close:hover { background: rgba(255,69,96,.12); color: var(--red); }
        .dr-profile-hero { padding: 28px 22px 22px; display: flex; flex-direction: column; gap: 14px; }
        .dr-profile-ava { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #7c5af5, #00e5cc); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: white; overflow: hidden; border: 3px solid rgba(0,229,204,.3); }
        .dr-profile-name { font-family: var(--font-display); font-size: 22px; font-weight: 900; color: var(--text); }
        .dr-profile-spec { font-size: 13px; color: var(--text2); margin-top: 3px; }
        .dr-profile-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .dr-chip { background: rgba(0,229,204,.1); color: var(--accent); border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 700; border: 1px solid rgba(0,229,204,.2); }
        .drawer-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 18px; }
        .dr-price-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .dr-price-box { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 12px; text-align: center; }
        .dr-price-label { font-size: 9px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; display: block; }
        .dr-price-val { font-family: var(--mono); font-size: 15px; font-weight: 700; color: var(--text); display: block; margin-top: 4px; }
        .dr-section { display: flex; flex-direction: column; gap: 8px; }
        .dr-section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); }
        .dr-section-body { font-size: 13px; color: var(--text2); line-height: 1.7; }
        .dr-dedication { background: rgba(124,90,245,.08); border: 1px solid rgba(124,90,245,.2); border-radius: 12px; padding: 14px; font-size: 13px; color: var(--text2); font-style: italic; line-height: 1.7; position: relative; }
        .dr-quote { font-size: 32px; color: var(--accent2); opacity: 0.4; position: absolute; top: 6px; left: 12px; font-family: Georgia, serif; line-height: 1; }
        .dr-qual-list { display: flex; flex-direction: column; gap: 5px; }
        .dr-qual-item { font-size: 12.5px; color: var(--text2); }
        .dr-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .dr-tag { background: var(--surface2); border: 1px solid var(--border2); color: var(--text2); border-radius: 99px; padding: 3px 10px; font-size: 11px; }
        .dr-info-grid { display: flex; flex-direction: column; gap: 10px; }
        .dr-info-item { display: flex; align-items: flex-start; gap: 10px; }
        .dr-info-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .dr-info-label { font-size: 9px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; }
        .dr-info-val { font-size: 13px; color: var(--text); display: block; margin-top: 2px; }
        .btn-book-full { background: linear-gradient(135deg, #7c5af5, #00e5cc); color: #000; border: none; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: var(--font); width: 100%; transition: all .15s; box-shadow: 0 4px 20px rgba(124,90,245,.35); }
        .btn-book-full:hover { opacity: .9; }

        /* ── APPOINTMENTS ────────────────────────────────────────────────── */
        .appt-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: border-color .15s; }
        .appt-card:hover { border-color: var(--border2); }
        .appt-icon { width: 42px; height: 42px; border-radius: 11px; background: rgba(0,229,204,.1); display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0; }
        .appt-spec { font-weight: 700; font-size: 13.5px; color: var(--text); }
        .appt-dr { font-size: 12px; color: var(--text2); margin-top: 2px; }
        .appt-date { font-size: 11px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }
        .appt-first-visit { display: inline-flex; background: rgba(255,176,32,.12); color: var(--amber); border-radius: 99px; padding: 1px 7px; font-size: 9px; font-weight: 700; margin-left: 6px; }
        .status-pill { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 99px; font-size: 10px; font-weight: 700; }
        .btn-join-sm { background: var(--green); color: #000; border: none; border-radius: 7px; padding: 7px 13px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: var(--font); }
        .btn-records { background: transparent; border: 1px solid var(--border2); color: var(--text2); border-radius: 7px; padding: 6px 11px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
        .btn-records:hover { border-color: var(--accent); color: var(--accent); }

        /* ── LABS ────────────────────────────────────────────────────────── */
        .lab-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 11px; padding: 13px 15px; }
        .lab-card-hd { display: flex; justify-content: space-between; align-items: flex-start; }
        .lab-name { font-weight: 700; font-size: 13px; color: var(--text); }
        .lab-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .lab-result { font-family: var(--mono); font-size: 15px; font-weight: 700; }
        .lab-ref { font-size: 10px; color: var(--muted); }
        .lab-status { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 99px; margin-top: 3px; }
        .lab-download { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--accent); text-decoration: none; margin-top: 8px; }

        /* ── TIMELINE ────────────────────────────────────────────────────── */
        .filter-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; overflow-x: auto; padding-bottom: 4px; }
        .filter-pill { padding: 4px 11px; border-radius: 99px; border: 1px solid var(--border2); background: var(--surface2); color: var(--text2); font-size: 11px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; white-space: nowrap; }
        .filter-pill.filter-on { background: rgba(0,229,204,.1); border-color: rgba(0,229,204,.25); color: var(--accent); }
        .timeline { display: flex; flex-direction: column; gap: 0; }
        .timeline-entry { display: flex; gap: 14px; }
        .timeline-dot { width: 30px; height: 30px; border-radius: 50%; background: var(--surface2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; margin-top: 4px; position: relative; z-index: 1; }
        .timeline-entry:not(:last-child) .timeline-dot::after { content: ''; position: absolute; top: 30px; left: 50%; transform: translateX(-50%); width: 1px; height: calc(100% + 14px); background: var(--border); }
        .timeline-content { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; margin-bottom: 10px; cursor: pointer; transition: border-color .15s; }
        .timeline-content:hover { border-color: var(--border2); }
        .timeline-hd { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .timeline-section { font-weight: 700; font-size: 13px; color: var(--text); }
        .timeline-meta { font-size: 10px; color: var(--muted); margin-top: 2px; font-family: var(--mono); }
        .timeline-type-badge { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 99px; background: var(--surface3); color: var(--text2); text-transform: uppercase; flex-shrink: 0; }
        .timeline-body { margin-top: 10px; border-top: 1px solid var(--border); padding-top: 10px; }

        /* ── MESSAGES ────────────────────────────────────────────────────── */
        .msg-thread-btn { display: flex; align-items: center; gap: 9px; width: 100%; padding: 10px 8px; background: transparent; border: none; border-radius: 9px; cursor: pointer; font-family: var(--font); transition: all .15s; }
        .msg-thread-btn:hover { background: var(--surface2); }
        .msg-thread-btn.msg-thread-on { background: rgba(0,229,204,.08); }
        .msg-thread-ava { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, #7c5af5, #00e5cc); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: white; flex-shrink: 0; }
        .msg-b { padding: 8px 12px; border-radius: 11px; max-width: 88%; font-size: 13px; line-height: 1.5; }
        .msg-b-mine { background: #7c5af5; color: white; align-self: flex-end; border-bottom-right-radius: 3px; }
        .msg-b-theirs { background: var(--surface2); color: var(--text); align-self: flex-start; border: 1px solid var(--border); border-bottom-left-radius: 3px; }
        .msg-who { font-size: 9px; opacity: .7; margin-bottom: 3px; font-weight: 700; }
        .msg-file-link { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--accent); text-decoration: none; margin-top: 4px; }
        .msg-inp { background: var(--surface2); border: 1px solid var(--border2); border-radius: 9px; padding: 9px 12px; color: var(--text); font-size: 13px; font-family: var(--font); outline: none; }
        .msg-inp:focus { border-color: var(--accent); }
        .msg-send-btn { background: var(--accent); border: none; color: #000; padding: 9px 14px; border-radius: 9px; font-weight: 800; cursor: pointer; font-size: 14px; }
        .attach-btn-sm { background: var(--surface2); border: 1px solid var(--border2); color: var(--text2); padding: 9px 12px; border-radius: 9px; cursor: pointer; transition: all .15s; }
        .attach-btn-sm:hover { border-color: var(--accent); color: var(--accent); }

        /* ── PAYMENTS ────────────────────────────────────────────────────── */
        .pay-pending-card { background: rgba(255,176,32,.05); border: 1px solid rgba(255,176,32,.2); border-radius: 11px; padding: 13px 15px; display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; }
        .pay-history-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .retry-btn { display: block; margin-top: 6px; background: none; border: 1px solid var(--amber); color: var(--amber); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: var(--font); }

        /* ── EDUCATION ───────────────────────────────────────────────────── */
        .edu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
        .edu-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: all .2s; }
        .edu-card:hover { border-color: var(--border2); transform: translateY(-2px); }
        .edu-img { width: 100%; height: 120px; object-fit: cover; }
        .edu-body { padding: 13px; display: flex; flex-direction: column; gap: 5px; }
        .edu-type { font-size: 10px; color: var(--muted); font-weight: 700; text-transform: uppercase; }
        .edu-title { font-weight: 700; font-size: 13px; color: var(--text); line-height: 1.4; }
        .edu-summary { font-size: 12px; color: var(--text2); line-height: 1.6; }
        .edu-time { font-size: 10px; color: var(--muted); }

        /* ── SETTINGS ────────────────────────────────────────────────────── */
        .settings-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 20px; }
        .settings-card-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 16px; }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .settings-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #7c5af5, #00e5cc); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: white; flex-shrink: 0; overflow: hidden; }
        .msg-banner { padding: 10px 14px; border-radius: 9px; font-size: 12px; font-weight: 600; }
        .msg-ok { background: rgba(0,214,143,.1); color: var(--green); border: 1px solid rgba(0,214,143,.2); }
        .msg-err { background: rgba(255,69,96,.1); color: var(--red); border: 1px solid rgba(255,69,96,.2); }

        /* ── SMARTCARD ───────────────────────────────────────────────────── */
        .smartcard { background: linear-gradient(135deg, #0d1a2e, #162848); border: 1px solid var(--border2); border-radius: 16px; padding: 20px; }
        .sc-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .sc-avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #7c5af5, #00e5cc); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: white; overflow: hidden; }
        .sc-name { font-weight: 800; font-size: 15px; color: var(--text); }
        .sc-id { font-size: 10px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }
        .sc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-bottom: 10px; }
        .sc-item { background: rgba(255,255,255,.04); border-radius: 7px; padding: 7px 9px; }
        .sc-key { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; display: block; }
        .sc-val { font-size: 13px; font-weight: 700; color: var(--text); display: block; margin-top: 2px; }
        .sc-allergy { background: rgba(255,69,96,.12); border: 1px solid rgba(255,69,96,.3); border-radius: 8px; padding: 7px 10px; font-size: 11px; font-weight: 700; color: #fca5a5; margin-top: 5px; }
        .sc-emergency { background: rgba(255,176,32,.12); border: 1px solid rgba(255,176,32,.3); border-radius: 8px; padding: 7px 10px; font-size: 11px; font-weight: 700; color: #fcd34d; margin-top: 5px; }

        /* ── MODALS ──────────────────────────────────────────────────────── */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.75); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(8px); }
        .modal-box { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: fadeUp .2s ease; }
        .modal-hd { padding: 20px 20px 0; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .modal-ht { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text); }
        .modal-hs { font-size: 12px; color: var(--muted); margin-top: 3px; }
        .modal-close { background: var(--surface2); border: none; color: var(--text2); width: 28px; height: 28px; border-radius: 7px; cursor: pointer; font-size: 13px; flex-shrink: 0; transition: all .15s; }
        .modal-close:hover { background: rgba(255,69,96,.12); color: var(--red); }
        .modal-body { padding: 0 20px 20px; display: flex; flex-direction: column; gap: 14px; }
        .steps-bar { padding: 0 20px 14px; display: flex; align-items: center; gap: 2px; }
        .step-wrap { display: flex; align-items: center; gap: 4px; }
        .step-num { width: 22px; height: 22px; border-radius: 50%; background: var(--surface2); border: 1.5px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: var(--muted); flex-shrink: 0; transition: all .2s; }
        .step-on { background: var(--accent); border-color: var(--accent); color: #000; }
        .step-text { font-size: 10px; color: var(--muted); font-weight: 600; white-space: nowrap; }
        .step-line { width: 18px; height: 1px; background: var(--border); margin: 0 2px; }
        .step-line-on { background: var(--accent); }
        .field-col { display: flex; flex-direction: column; gap: 5px; }
        .field-lbl { font-size: 9px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
        .field-inp { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--r-sm); padding: 10px 12px; color: var(--text); font-size: 13px; font-family: var(--font); outline: none; transition: border-color .15s; width: 100%; }
        .field-inp:focus { border-color: var(--accent); }
        select.field-inp option { background: var(--surface2); }
        .field-ta { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--r-sm); padding: 10px 12px; color: var(--text); font-size: 13px; font-family: var(--font); outline: none; transition: border-color .15s; width: 100%; resize: vertical; }
        .field-ta:focus { border-color: var(--accent); }
        .err-box { background: rgba(255,69,96,.08); border: 1px solid rgba(255,69,96,.25); border-radius: var(--r-sm); padding: 8px 12px; font-size: 12px; color: var(--red); border-left: 3px solid var(--red); }
        .btn-cta { background: linear-gradient(135deg, #7c5af5, #00e5cc); color: #000; border: none; border-radius: 11px; padding: 13px; font-size: 13px; font-weight: 800; cursor: pointer; font-family: var(--font); width: 100%; transition: all .15s; }
        .btn-cta:hover { opacity: .9; }
        .btn-cta:disabled { opacity: .5; cursor: not-allowed; }
        .btn-secondary { background: transparent; border: 1px solid var(--border2); color: var(--text2); border-radius: 11px; padding: 11px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font); width: 100%; transition: all .15s; }
        .btn-secondary:hover { border-color: var(--text2); color: var(--text); }
        .slot-days { display: flex; gap: 6px; flex-wrap: wrap; }
        .slot-day { padding: 7px 12px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 8px; color: var(--text2); font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
        .slot-day.slot-on { background: rgba(0,229,204,.12); border-color: var(--accent); color: var(--accent); }
        .slot-times { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .slot-time { padding: 7px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 7px; color: var(--text2); font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--mono); transition: all .15s; }
        .slot-time.slot-on { background: rgba(0,229,204,.12); border-color: var(--accent); color: var(--accent); }
        .booking-summary { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 12px; display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: var(--text2); }
        .pay-center { text-align: center; }
        .pay-amt { font-family: var(--mono); font-size: 36px; font-weight: 700; color: var(--accent); }
        .pay-sub { font-size: 12px; color: var(--muted); margin-top: 3px; }
        .mpesa-pill { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: rgba(22,163,74,.06); border: 1px solid rgba(22,163,74,.2); border-radius: 11px; }
        .pay-note { font-size: 12px; color: var(--text2); line-height: 1.6; background: rgba(0,229,204,.06); border-radius: 9px; padding: 10px 13px; border-left: 3px solid var(--accent); }
        .vital-chip { padding: 5px 11px; border-radius: 99px; border: 1px solid var(--border2); background: var(--surface2); color: var(--text2); font-size: 11px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
        .vital-chip-on { background: rgba(0,229,204,.12); border-color: var(--accent); color: var(--accent); }
        .triage-bar { height: 3px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .triage-prog { height: 100%; background: linear-gradient(90deg, var(--accent2), var(--accent)); transition: width .35s ease; }
        .triage-step { font-size: 10px; color: var(--muted); margin-bottom: 6px; }
        .triage-q { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 14px; }
        .triage-opt { padding: 11px 15px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 11px; font-size: 13px; color: var(--text); cursor: pointer; text-align: left; font-weight: 500; font-family: var(--font); transition: all .15s; width: 100%; }
        .triage-opt:hover { border-color: var(--accent); background: rgba(0,229,204,.06); color: var(--accent); }
        .triage-emergency { border-color: rgba(255,69,96,.3) !important; color: var(--red) !important; background: rgba(255,69,96,.05) !important; }
        .triage-emergency:hover { background: rgba(255,69,96,.12) !important; }

        /* ── MOBILE NAV ──────────────────────────────────────────────────── */
        .mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); padding: 6px 0; z-index: 40; }
        .mob-nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 5px 4px; background: transparent; border: none; color: var(--muted); font-size: 9px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
        .mob-nav-btn.active { color: var(--accent); }
        .mob-icon { font-size: 19px; }

        /* ── FAB ─────────────────────────────────────────────────────────── */
        .fab-wrap { position: fixed; bottom: 80px; right: 18px; z-index: 45; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .fab-item { background: var(--red); color: white; border: none; border-radius: 40px; padding: 10px 18px; font-weight: 700; font-size: 12px; cursor: pointer; font-family: var(--font); box-shadow: 0 4px 16px rgba(255,69,96,.4); white-space: nowrap; }
        .fab-main { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #7c5af5, #00e5cc); color: #000; border: none; font-size: 22px; cursor: pointer; box-shadow: 0 4px 20px rgba(124,90,245,.5); }

        /* ── RESPONSIVE ──────────────────────────────────────────────────── */
        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 860px) {
          .overview-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .sidebar { display: flex; position: fixed; top: 0; left: 0; height: 100vh; z-index: 50; }
          .hamburger-btn { position: fixed; top: 12px; left: 12px; z-index: 100; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow); padding: 8px 12px; border-radius: 8px; }
          .th-left { padding-left: 44px; }
          .content { padding: 14px 14px 80px; }
          .top-hd { padding: 10px 14px; }
          .th-name { font-size: 15px; }
          .hero-row { grid-template-columns: 1fr; }
          .next-appt-card { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .mobile-nav { display: flex; }
          .vitals-mini { grid-template-columns: repeat(2, 1fr); }
          .svc-grid { grid-template-columns: 1fr; }
          .settings-grid { grid-template-columns: 1fr; }
          .slot-times { grid-template-columns: repeat(3, 1fr); }
          .drawer { width: 100vw; }
          .stat-icon { font-size: 20px; }
          .stat-val { font-size: 16px; }
          .stat-lbl { font-size: 8.5px; }
        }
        @media (max-width: 500px) {
          .th-actions { gap: 4px; }
          .th-btn { padding: 7px 9px; font-size: 10px; }
          .th-btn span { display: none; }
          .stat-card { padding: 10px 12px; gap: 8px; }
          .panel { padding: 14px; }
          .content { padding: 10px 10px 80px; }
          .stat-icon { font-size: 16px; }
          .stat-val { font-size: 14px; }
          .mob-nav-btn { font-size: 7px; padding: 3px 2px; }
          .mob-icon { font-size: 16px; }
          .mobile-nav { padding: 4px 0; }
        }
      `}</style>

      <div className="shell">
        {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="sidebar" style={{ width: sidebarOpen ? 228 : 0, borderRight: sidebarOpen ? '1px solid var(--border)' : 'none' }}>
          <div className="sb-brand">
            <div className="sb-logo">
              <div className="sb-logo-glyph">⚕️</div>
              <div>
                <div className="sb-logo-name">AMEXAN</div>
                <div className="sb-logo-sub">Patient Portal</div>
              </div>
            </div>
          </div>
          <div className="sb-profile">
            <div className="sb-ava">
              {patient.photoUrl ? <img src={patient.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : (patient.name || '?')[0]}
            </div>
            <div className="sb-pname">{patient.name}</div>
            <div className="sb-pid">{patient.universalId}</div>
            {patient.condition && <div className="sb-cond">🎯 {patient.condition}</div>}
          </div>
          <nav className="sb-nav">
            {tabs.map(t => (
              <button key={t.id} className={`sb-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <span className="sb-item-icon">{t.icon}</span>
                {t.label}
                {t.badge ? <span className="sb-badge">{t.badge}</span> : null}
              </button>
            ))}
          </nav>
          <div className="sb-footer">
            <div className="sb-themes">
              {PATIENT_THEME_LIST.map(t => (
                <button key={t.id} className={`sb-theme-dot ${patientTheme === t.id ? 'active' : ''}`}
                  style={{ '--dot-color': t.css.match(/--accent:([^;]+)/)?.[1] || '#00e5cc' } as React.CSSProperties}
                  onClick={() => { applyPatientTheme(t.id); setPatientTheme(t.id); }}
                  title={t.label}
                />
              ))}
            </div>
            <button className="sb-signout" onClick={() => { signOut(auth); router.replace('/login'); }}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        </aside>

        {/* Sidebar backdrop overlay for mobile */}
        <div className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
        <div className="main">
          {/* Top Header */}
          <div className="top-hd">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
                {sidebarOpen ? '✕' : '☰'}
              </button>
              <div className="th-left">
                <span className="th-greeting">{getGreeting()},</span>
                <span className="th-name">{patient.name.split(' ')[0]} 👋</span>
              </div>
            </div>
            <div className="th-actions">
              <button className="th-btn" onClick={() => setShowTriage(true)}>🔍 <span>Find Doctor</span></button>
              <button className="th-btn" onClick={() => setShowLogVital(true)}>📊 <span>Log Vital</span></button>
              <button className="th-btn" onClick={() => setActiveTab('overview')} style={{
                borderColor: unreadAlerts > 0 ? 'rgba(255,69,96,.3)' : 'var(--border2)',
                color: unreadAlerts > 0 ? 'var(--red)' : 'var(--text2)',
                position: 'relative',
              }}>
                {unreadAlerts > 0 ? `🔔 ${unreadAlerts}` : '🔔'} {unreadNotifications > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: '#ff4560', animation: 'pulse 1.5s infinite' }} />}
              </button>
              <button className="th-btn th-btn-accent" onClick={() => setShowSmartcard(true)}>🪪 <span>Smartcard</span></button>
            </div>
          </div>

          <div className="content" key={activeTab}>
            {/* Live consultation banner */}
            {activeAppts.map(a => (
              <div key={a.id} className="live-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="live-dot" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--green)' }}>Live — Dr. {a.doctorName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>Session active · Rejoin now</div>
                  </div>
                </div>
                <button className="btn-join-live" onClick={() => joinConsultation(a)} disabled={joining === a.id}>
                  {joining === a.id ? 'Joining…' : '🎥 Rejoin'}
                </button>
              </div>
            ))}
   
            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (() => {

  /* ─── INJECT EPIC STYLES (once, useEffect-safe) ──────────────────────── */
  if (typeof document !== 'undefined' && !document.getElementById('ov-epic')) {
    const s = document.createElement('style');
    s.id = 'ov-epic';
    s.textContent = `
      /* ── KEYFRAMES ── */
      @keyframes ov-float   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-6px)} }
      @keyframes ov-glow-p  { 0%,100%{opacity:.45} 50%{opacity:.9} }
      @keyframes ov-glow-t  { 0%,100%{opacity:.3}  50%{opacity:.7} }
      @keyframes ov-ring    { to{stroke-dashoffset:0} }
      @keyframes ov-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
      @keyframes ov-pulse-g { 0%,100%{box-shadow:0 0 0 0 rgba(0,229,204,.5)} 70%{box-shadow:0 0 0 8px rgba(0,229,204,0)} }
      @keyframes ov-slide-up{ from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
      @keyframes ov-count   { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }

      /* ── ROOT ── */
      .ov-epic-root { display:flex;flex-direction:column;gap:16px;animation:ov-slide-up .35s ease both; }

      /* ── COMMAND HERO ── */
      .ov-cmd-hero {
        position:relative; border-radius:24px; overflow:hidden;
        background:linear-gradient(135deg,#060d1f 0%,#0a1628 35%,#091922 65%,#050e1a 100%);
        border:1px solid rgba(0,229,204,.15);
        box-shadow:0 24px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(0,229,204,.1);
        min-height:220px;
      }
      /* mesh blobs */
      .ov-blob-1 { position:absolute;top:-80px;right:-60px;width:400px;height:400px;border-radius:50%;
        background:radial-gradient(circle,rgba(124,90,245,.18) 0%,transparent 65%);pointer-events:none; }
      .ov-blob-2 { position:absolute;bottom:-120px;left:-40px;width:360px;height:360px;border-radius:50%;
        background:radial-gradient(circle,rgba(0,229,204,.12) 0%,transparent 65%);pointer-events:none; }
      .ov-blob-3 { position:absolute;top:30%;right:30%;width:200px;height:200px;border-radius:50%;
        background:radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 70%);pointer-events:none; }
      /* top shimmer line */
      .ov-hero-line { position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent 0%,rgba(0,229,204,.6) 40%,rgba(124,90,245,.6) 60%,transparent 100%); }

      .ov-hero-inner { position:relative;z-index:2;padding:28px 32px 0;display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start; }

      /* avatar + identity */
      .ov-hero-id { display:flex;gap:16px;align-items:center;flex:1;min-width:260px; }
      .ov-avatar-wrap { position:relative;flex-shrink:0; }
      .ov-avatar-ring {
        width:70px;height:70px;border-radius:50%;
        background:linear-gradient(135deg,#7c5af5,#00e5cc);
        padding:2.5px;box-shadow:0 0 28px rgba(0,229,204,.3);
        animation:ov-pulse-g 3s infinite;
      }
      .ov-avatar-inner {
        width:100%;height:100%;border-radius:50%;
        background:linear-gradient(135deg,#0f1f3d,#1a2e50);
        display:flex;align-items:center;justify-content:center;
        font-size:26px;font-weight:900;color:#fff;overflow:hidden;
      }
      .ov-avatar-status {
        position:absolute;bottom:2px;right:2px;width:14px;height:14px;
        background:#00d68f;border-radius:50%;border:2px solid #060d1f;
      }
      .ov-hero-text { min-width:0; }
      .ov-hero-greeting { font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;
        background:linear-gradient(90deg,#00e5cc,#7c5af5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;
        background-clip:text;margin-bottom:5px; }
      .ov-hero-name { font-family:'Syne',sans-serif;font-size:clamp(20px,3.5vw,28px);font-weight:900;
        color:#fff;letter-spacing:-.5px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
      .ov-hero-chips { display:flex;flex-wrap:wrap;gap:5px;margin-top:10px; }
      .ov-hero-chip {
        display:inline-flex;align-items:center;gap:4px;
        background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
        backdrop-filter:blur(12px);border-radius:99px;padding:3px 10px;
        font-size:11px;font-weight:600;color:rgba(255,255,255,.75);
      }
      .ov-hero-chip--hl { background:rgba(0,229,204,.1);border-color:rgba(0,229,204,.25);color:#00e5cc; }

      /* health score ring */
      .ov-score-wrap { display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0; }
      .ov-score-ring { position:relative;width:90px;height:90px; }
      .ov-score-ring svg { transform:rotate(-90deg); }
      .ov-score-track { fill:none;stroke:rgba(255,255,255,.06);stroke-width:6; }
      .ov-score-fill  { fill:none;stroke-width:6;stroke-linecap:round;
        stroke:url(#scoreGrad);transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1); }
      .ov-score-center { position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center; }
      .ov-score-num { font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:#fff;line-height:1; }
      .ov-score-lbl { font-size:8px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-top:1px; }
      .ov-score-tag { font-size:10px;font-weight:700;color:#00e5cc; }

      /* bp tip */
      .ov-bp-tip {
        margin:14px 32px 0;position:relative;z-index:2;
        background:rgba(0,229,204,.06);border:1px solid rgba(0,229,204,.15);
        border-radius:10px;padding:9px 14px;font-size:12px;color:rgba(255,255,255,.6);
        line-height:1.5;display:flex;align-items:center;gap:10px;
      }

      /* hero stat strip */
      .ov-hero-strip {
        position:relative;z-index:2;
        display:grid;grid-template-columns:repeat(4,1fr);
        border-top:1px solid rgba(255,255,255,.06);margin-top:20px;
      }
      .ov-hero-strip-cell {
        padding:16px 20px;text-align:center;cursor:pointer;
        border-right:1px solid rgba(255,255,255,.05);
        transition:background .15s;
      }
      .ov-hero-strip-cell:last-child { border-right:none; }
      .ov-hero-strip-cell:hover { background:rgba(255,255,255,.03); }
      .ov-strip-icon { font-size:18px;margin-bottom:4px; }
      .ov-strip-val { font-family:'JetBrains Mono',monospace;font-size:clamp(18px,2.5vw,26px);font-weight:800;line-height:1; }
      .ov-strip-lbl { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;opacity:.4;margin-top:4px; }

      /* ── NEXT APPT CARD ── */
      .ov-next-card {
        background:linear-gradient(135deg,rgba(124,90,245,.12),rgba(0,229,204,.06));
        border:1px solid rgba(124,90,245,.25);border-radius:18px;
        padding:18px 22px;display:flex;align-items:center;justify-content:space-between;
        gap:16px;flex-wrap:wrap;
        box-shadow:0 4px 24px rgba(124,90,245,.12);
      }
      .ov-next-left { display:flex;align-items:center;gap:14px;min-width:0;flex:1; }
      .ov-next-icon {
        width:48px;height:48px;border-radius:14px;flex-shrink:0;
        background:linear-gradient(135deg,#7c5af5,#00e5cc);
        display:flex;align-items:center;justify-content:center;font-size:22px;
        box-shadow:0 6px 20px rgba(124,90,245,.35);
      }
      .ov-next-lbl { font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(124,90,245,.9);margin-bottom:3px; }
      .ov-next-name { font-weight:800;font-size:15px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
      .ov-next-date { font-size:11px;color:var(--text2);margin-top:2px; }
      .ov-next-right { display:flex;align-items:center;gap:14px;flex-shrink:0; }
      .ov-next-countdown {
        text-align:center;background:rgba(0,0,0,.3);border-radius:12px;
        padding:10px 16px;border:1px solid rgba(255,255,255,.07);
      }
      .ov-next-time { font-family:'JetBrains Mono',monospace;font-size:clamp(18px,2vw,24px);font-weight:700;color:#fff;line-height:1; }
      .ov-next-sub { font-size:9px;color:var(--muted);margin-top:3px;font-weight:600;text-transform:uppercase;letter-spacing:.8px; }
      .ov-next-btn {
        background:linear-gradient(135deg,#7c5af5,#5a3fd4);color:#fff;border:none;
        border-radius:12px;padding:11px 20px;font-size:13px;font-weight:800;
        cursor:pointer;font-family:var(--font);white-space:nowrap;
        box-shadow:0 4px 16px rgba(124,90,245,.4);transition:all .15s;
      }
      .ov-next-btn:hover { transform:translateY(-1px);box-shadow:0 8px 24px rgba(124,90,245,.5); }

      /* ── STAT CARDS ── */
      .ov-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:12px; }
      .ov-stat {
        position:relative;border-radius:16px;padding:16px 18px;overflow:hidden;
        background:var(--surface);border:1px solid var(--border);
        transition:all .2s;cursor:default;
      }
      .ov-stat::before {
        content:'';position:absolute;top:0;left:0;right:0;height:2px;
        background:var(--_accent,linear-gradient(90deg,#00e5cc,#7c5af5));
      }
      .ov-stat:hover { border-color:rgba(0,229,204,.3);transform:translateY(-2px);
        box-shadow:0 8px 32px rgba(0,0,0,.35); }
      .ov-stat-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px; }
      .ov-stat-icon-wrap { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0; }
      .ov-stat-trend { font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px; }
      .ov-stat-val { font-family:'JetBrains Mono',monospace;font-size:clamp(16px,2vw,22px);font-weight:800;line-height:1;margin-bottom:4px; }
      .ov-stat-lbl { font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--muted); }

      /* ── SECTION HEADER ── */
      .ov-sec-hd { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px; }
      .ov-sec-title { font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--text); }
      .ov-sec-eyebrow { font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:4px; }

      /* ── VITALS ── */
      .ov-vitals-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
      .ov-vital-card {
        background:var(--surface2);border:1px solid var(--border);border-radius:14px;
        padding:14px 16px;transition:border-color .15s;
      }
      .ov-vital-card:hover { border-color:rgba(0,229,204,.25); }
      .ov-vital-card--hero {
        grid-column:1/-1;
        background:linear-gradient(135deg,rgba(0,229,204,.05),rgba(0,0,0,0));
        border-color:rgba(0,229,204,.2);
      }
      .ov-vital-top { display:flex;align-items:center;gap:10px;margin-bottom:10px; }
      .ov-vital-ico { font-size:22px; }
      .ov-vital-label { font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted); }
      .ov-vital-reading { font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;line-height:1; }
      .ov-vital-unit { font-size:12px;color:var(--muted);font-weight:400;margin-left:3px; }
      .ov-vital-badge { display:inline-flex;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;margin-top:6px; }
      .ov-vital-mini { display:flex;align-items:center;justify-content:space-between; }
      .ov-vital-mini-val { font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:var(--text); }
      .ov-vital-mini-lbl { font-size:9px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.7px;margin-top:2px; }

      /* progress bar */
      .ov-progress-bar { height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin-top:8px; }
      .ov-progress-fill { height:100%;border-radius:99px;transition:width 1s ease; }

      /* ── ALERTS ── */
      .ov-alert-card {
        border-radius:12px;padding:12px 14px;
        display:flex;justify-content:space-between;align-items:flex-start;gap:12px;
        border-left:3px solid;margin-bottom:8px;
      }
      .ov-alert-card--high { background:rgba(255,69,96,.07);border-left-color:#ff4560;border:1px solid rgba(255,69,96,.2);border-left-width:3px; }
      .ov-alert-card--med  { background:rgba(255,176,32,.05);border-left-color:#ffb020;border:1px solid rgba(255,176,32,.18);border-left-width:3px; }

      /* ── RX CARDS ── */
      .ov-rx {
        background:var(--surface2);border:1px solid var(--border);border-radius:13px;
        padding:13px 15px;margin-bottom:8px;transition:border-color .15s;
      }
      .ov-rx:hover { border-color:rgba(124,90,245,.3); }
      .ov-rx:last-child { margin-bottom:0; }
      .ov-rx-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px; }
      .ov-rx-name { font-weight:800;font-size:14px;color:var(--text); }
      .ov-rx-dr { font-size:11px;color:var(--muted); }
      .ov-rx-meta { display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--text2); }
      .ov-rx-pill { background:rgba(124,90,245,.1);color:#9f87fa;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700; }

      /* ── APPT CARDS ── */
      .ov-appt {
        display:flex;justify-content:space-between;align-items:center;gap:12px;
        background:var(--surface2);border:1px solid var(--border);border-radius:13px;
        padding:13px 16px;margin-bottom:8px;cursor:pointer;transition:all .15s;
      }
      .ov-appt:hover { border-color:rgba(0,229,204,.3);transform:translateX(3px); }
      .ov-appt:last-child { margin-bottom:0; }
      .ov-appt-left { display:flex;align-items:center;gap:12px;min-width:0;flex:1; }
      .ov-appt-ico { width:40px;height:40px;border-radius:11px;background:rgba(0,229,204,.08);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
      .ov-appt-spec { font-weight:700;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
      .ov-appt-dr   { font-size:11.5px;color:var(--text2);margin-top:2px; }
      .ov-appt-date { font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-top:2px; }
      .ov-appt-right { display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0; }
      .ov-status-pill { display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;white-space:nowrap; }
      .ov-join-btn { background:var(--green);color:#000;border:none;border-radius:7px;padding:6px 12px;font-size:11px;font-weight:800;cursor:pointer;font-family:var(--font); }

      /* ── 2-COL GRID ── */
      .ov-2col { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
      .ov-panel { background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:20px 22px;box-sizing:border-box;overflow:hidden; }
      .ov-full { grid-column:1/-1; }

      /* ── DISEASE PANEL ── */
      .ov-disease {
        background:linear-gradient(135deg,#080f1e 0%,#0c1a2e 50%,#080f1e 100%);
        border:1px solid rgba(0,229,204,.2);border-radius:18px;padding:20px 24px;
        box-shadow:0 4px 24px rgba(0,229,204,.06);
      }
      .ov-disease-hd { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px; }
      .ov-disease-title { font-family:'Syne',sans-serif;font-size:15px;font-weight:900;color:#fff; }
      .ov-disease-sub { font-size:11px;color:rgba(0,229,204,.6);margin-top:3px; }
      .ov-targets { display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px; }
      .ov-target {
        border-radius:13px;padding:14px 16px;
        display:flex;align-items:center;gap:12px;
        border:1.5px solid;
      }
      .ov-target--on  { background:rgba(0,214,143,.05);border-color:rgba(0,214,143,.25); }
      .ov-target--off { background:rgba(255,69,96,.05);border-color:rgba(255,69,96,.25); }
      .ov-target--warn{ background:rgba(255,176,32,.05);border-color:rgba(255,176,32,.2); }
      .ov-target-val { font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:#fff; }
      .ov-target-goal { font-size:11px;color:rgba(255,255,255,.35);margin-top:2px; }
      .ov-target-badge { margin-left:auto;flex-shrink:0;font-size:10px;font-weight:700;padding:3px 9px;border-radius:99px; }
      .ov-target-badge--on  { background:rgba(0,214,143,.15);color:#00d68f; }
      .ov-target-badge--off { background:rgba(255,69,96,.15);color:#ff4560; }
      .ov-target-badge--warn{ background:rgba(255,176,32,.15);color:#ffb020; }

      /* ── EMPTY STATE ── */
      .ov-empty { text-align:center;padding:32px 0;color:var(--muted);font-size:13px; }

      /* ── RESPONSIVE ── */
      @media(max-width:1024px) { .ov-stats{grid-template-columns:repeat(2,1fr)} }
      @media(max-width:860px)  {
        .ov-2col{grid-template-columns:1fr}
        .ov-hero-strip{grid-template-columns:repeat(2,1fr)}
        .ov-hero-strip-cell:nth-child(2){border-right:none}
        .ov-hero-strip-cell:nth-child(3){border-top:1px solid rgba(255,255,255,.05)}
        .ov-hero-strip-cell:nth-child(4){border-top:1px solid rgba(255,255,255,.05);border-right:none}
      }
      @media(max-width:640px)  {
        .ov-cmd-hero { min-height:auto }
        .ov-hero-inner { padding:20px 18px 0;flex-direction:column;gap:16px }
        .ov-score-wrap { flex-direction:row;gap:12px;align-items:center }
        .ov-stats { grid-template-columns:repeat(2,1fr);gap:8px }
        .ov-hero-strip { grid-template-columns:repeat(2,1fr) }
        .ov-vitals-grid { grid-template-columns:1fr }
        .ov-vital-card--hero { grid-column:1 }
        .ov-next-card { flex-direction:column;align-items:flex-start }
        .ov-next-right { width:100%;justify-content:space-between }
        .ov-appt-date { display:none }
        .ov-hero-name { font-size:20px }
      }
      @media(max-width:420px)  {
        .ov-stats { grid-template-columns:1fr 1fr }
        .ov-next-right { flex-direction:column;gap:8px;align-items:flex-start }
        .ov-next-btn { width:100% }
      }
    `;
    document.head.appendChild(s);
  }

  /* ─── DERIVED VALUES ─────────────────────────────────────────────────── */
  const sortedUpcoming = [...upcomingAppts].sort((a, b) => {
    const da = a.scheduledDate?.toDate ? a.scheduledDate.toDate() : new Date(a.scheduledDate || a.date || 0);
    const db2 = b.scheduledDate?.toDate ? b.scheduledDate.toDate() : new Date(b.scheduledDate || b.date || 0);
    return da - db2;
  });
  const nextApptSorted = sortedUpcoming[0] || nextAppt;
  const pendingAlerts = alerts.filter(a => !a.read);
  const pendingNotifications = patientNotifications.filter((n: any) => !n.read);
  const allPendingAlerts = [
    ...pendingAlerts.map(a => ({ ...a, _source: 'alerts' as const })),
    ...pendingNotifications.map((n: any) => ({ ...n, _source: 'patientNotifications' as const })),
  ].sort((a, b) => {
    const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return tb - ta;
  });
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const healthScore = Math.min(100, Math.max(40,
    70
    + (latestBP && bpInfo?.label === 'Normal' ? 10 : latestBP && bpInfo?.label === 'Elevated' ? 5 : 0)
    + (allPrescriptions.length > 0 ? 5 : 0)
    + (completedCount > 0 ? 8 : 0)
    + (vitals.length > 2 ? 7 : vitals.length > 0 ? 3 : 0)
    - (allPendingAlerts.filter((a: any) => a.severity === 'high' || a.severity === 'urgent').length * 5)
  ));
  const scoreColor = healthScore >= 80 ? '#00d68f' : healthScore >= 60 ? '#ffb020' : '#ff4560';
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (healthScore / 100) * circumference;

  /* micro helper */
  const mini = (bg: string, color: string) => ({ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: bg, color } as React.CSSProperties);

  return (
    <div className="ov-epic-root">

      {/* ══════════════════════════════════════════════════════════════════
          COMMAND HERO
      ══════════════════════════════════════════════════════════════════ */}
      <div className="ov-cmd-hero">
        <div className="ov-blob-1" />
        <div className="ov-blob-2" />
        <div className="ov-blob-3" />
        <div className="ov-hero-line" />

        <div className="ov-hero-inner">

          {/* Identity */}
          <div className="ov-hero-id" style={{ flex: 1 }}>
            <div className="ov-avatar-wrap">
              <div className="ov-avatar-ring">
                <div className="ov-avatar-inner">
                  {patient.photoUrl
                    ? <img src={patient.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (patient.name || '?')[0]}
                </div>
              </div>
              <div className="ov-avatar-status" />
            </div>
            <div className="ov-hero-text" style={{ minWidth: 0 }}>
              <div className="ov-hero-greeting">{getGreeting()} ·  {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              <div className="ov-hero-name">{patient.name}</div>
              <div className="ov-hero-chips">
                {patient.bloodGroup && <span className="ov-hero-chip ov-hero-chip--hl">🩸 {patient.bloodGroup}</span>}
                {patient.age        && <span className="ov-hero-chip">{patient.age} yrs</span>}
                {patient.gender     && <span className="ov-hero-chip">{patient.gender}</span>}
                {patient.condition  && <span className="ov-hero-chip ov-hero-chip--hl">🎯 {patient.condition}</span>}
                {patient.insuranceProvider && <span className="ov-hero-chip">🏥 {patient.insuranceProvider}</span>}
                <span className="ov-hero-chip ov-hero-chip--hl">🟢 Active Patient</span>
              </div>
            </div>
          </div>

          {/* Health Score Ring */}
          <div className="ov-score-wrap">
            <div className="ov-score-ring">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c5af5" />
                    <stop offset="100%" stopColor="#00e5cc" />
                  </linearGradient>
                </defs>
                <circle className="ov-score-track" cx="45" cy="45" r="36" />
                <circle
                  className="ov-score-fill"
                  cx="45" cy="45" r="36"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="ov-score-center">
                <div className="ov-score-num" style={{ color: scoreColor }}>{healthScore}</div>
                <div className="ov-score-lbl">Score</div>
              </div>
            </div>
            <div className="ov-score-tag">
              {healthScore >= 85 ? '✦ Excellent' : healthScore >= 70 ? '◈ Good' : '△ Needs Care'}
            </div>
          </div>

        </div>

        {/* BP tip */}
        {latestBP && bpInfo && (
          <div className="ov-bp-tip">
            <span style={{ fontSize: 18 }}>❤️</span>
            <span>
              Latest Blood Pressure:&nbsp;
              <strong style={{ color: bpInfo.color, fontFamily: 'JetBrains Mono,monospace' }}>
                {latestBP.systolic}/{latestBP.diastolic} mmHg
              </strong>
              &nbsp;·&nbsp;
              <span style={{ color: bpInfo.color, fontWeight: 700 }}>{bpInfo.label}</span>
              &nbsp;·&nbsp;{fmtShort(latestBP.recordedAt)}
            </span>
          </div>
        )}

        {/* Bottom stat strip */}
        <div className="ov-hero-strip">
          {([
            { icon: '📅', val: upcomingAppts.length,     label: 'Upcoming',    color: '#7c5af5', tab: 'appointments' },
            { icon: '✅', val: completedCount,            label: 'Completed',   color: '#00d68f', tab: 'appointments' },
            { icon: '💊', val: allPrescriptions.length,  label: 'Medications', color: '#00e5cc', tab: 'prescriptions' },
            { icon: '🔔', val: allPendingAlerts.length,     label: 'Alerts & Updates',      color: allPendingAlerts.length > 0 ? '#ff4560' : '#00d68f', tab: 'overview' },
          ] as any[]).map((s: any) => (
            <div key={s.label} className="ov-hero-strip-cell" onClick={() => setActiveTab(s.tab)}>
              <div className="ov-strip-icon">{s.icon}</div>
              <div className="ov-strip-val" style={{ color: s.color }}>{s.val}</div>
              <div className="ov-strip-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          NEXT APPOINTMENT BANNER
      ══════════════════════════════════════════════════════════════════ */}
      {nextApptSorted && countdown && (
        <div className="ov-next-card">
          <div className="ov-next-left">
            <div className="ov-next-icon">📅</div>
            <div style={{ minWidth: 0 }}>
              <div className="ov-next-lbl">Next Appointment</div>
              <div className="ov-next-name">
                Dr. {nextApptSorted.doctorName} · {nextApptSorted.specialty || 'Consultation'}
              </div>
              <div className="ov-next-date">{fmtDate(nextApptSorted.scheduledDate || nextApptSorted.date)}</div>
            </div>
          </div>
          <div className="ov-next-right">
            <div className="ov-next-countdown">
              <div className="ov-next-time">{countdown}</div>
              <div className="ov-next-sub">Until Session</div>
            </div>
            {nextApptSorted.status === 'active'
              ? <button className="ov-next-btn" style={{ background: 'linear-gradient(135deg,#00d68f,#00b377)' }}
                  onClick={() => joinConsultation(nextApptSorted)} disabled={joining === nextApptSorted.id}>
                  {joining === nextApptSorted.id ? '…' : '🎥 Join Now'}
                </button>
              : <button className="ov-next-btn" onClick={() => setActiveTab('appointments')}>View Details →</button>
            }
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SMART STAT CARDS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="ov-stats">
        {([
          {
            icon: '❤️', iconBg: 'rgba(255,69,96,.12)',
            val: latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '—',
            lbl: 'Blood Pressure', color: bpInfo?.color || 'var(--muted)',
            accent: bpInfo?.color ? `linear-gradient(90deg,${bpInfo.color},${bpInfo.color}99)` : 'linear-gradient(90deg,#ff4560,#ff456099)',
            trend: bpInfo?.label || 'No data', trendOk: bpInfo?.label === 'Normal',
          },
          {
            icon: '📅', iconBg: 'rgba(124,90,245,.12)',
            val: String(upcomingAppts.length), lbl: 'Upcoming Visits', color: '#7c5af5',
            accent: 'linear-gradient(90deg,#7c5af5,#00e5cc)',
            trend: upcomingAppts.length > 0 ? 'Scheduled' : 'None', trendOk: upcomingAppts.length > 0,
          },
          {
            icon: '💊', iconBg: 'rgba(0,229,204,.12)',
            val: String(allPrescriptions.length), lbl: 'Active Medications', color: '#00e5cc',
            accent: 'linear-gradient(90deg,#00e5cc,#7c5af5)',
            trend: allPrescriptions.length > 0 ? 'On Track' : 'None', trendOk: true,
          },
          {
            icon: allPendingAlerts.length > 0 ? '🔴' : '✅', iconBg: allPendingAlerts.length > 0 ? 'rgba(255,69,96,.12)' : 'rgba(0,214,143,.12)',
            val: String(allPendingAlerts.length), lbl: allPendingAlerts.length > 0 ? 'Unread' : 'All Clear',
            color: allPendingAlerts.length > 0 ? '#ff4560' : '#00d68f',
            accent: allPendingAlerts.length > 0 ? 'linear-gradient(90deg,#ff4560,#ff456099)' : 'linear-gradient(90deg,#00d68f,#00d68f99)',
            trend: allPendingAlerts.length > 0 ? 'Needs Action' : 'Healthy', trendOk: allPendingAlerts.length === 0,
          },
        ] as any[]).map((s: any) => (
          <div key={s.lbl} className="ov-stat" style={{ ['--_accent' as any]: s.accent }}>
            <div className="ov-stat-top">
              <div className="ov-stat-icon-wrap" style={{ background: s.iconBg }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <span className="ov-stat-trend" style={{
                background: s.trendOk ? 'rgba(0,214,143,.12)' : 'rgba(255,176,32,.1)',
                color: s.trendOk ? '#00d68f' : '#ffb020',
              }}>{s.trend}</span>
            </div>
            <div className="ov-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="ov-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DISEASE MANAGEMENT (if condition)
      ══════════════════════════════════════════════════════════════════ */}
      {patient.condition && (
        <DiseaseToolsPanel
          patientId={patient.uid}
          condition={patient.condition}
          vitals={vitals}
          onLogVital={() => setShowLogVital(true)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ACTIVE CONSULTATION BANNER
      ══════════════════════════════════════════════════════════════════ */}
      {activeAppts.map(a => (
        <div key={a.id} style={{
          background: 'linear-gradient(135deg,rgba(0,214,143,.08),rgba(0,214,143,.03))',
          border: '1px solid rgba(0,214,143,.25)', borderRadius: 14,
          padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00d68f', animation: 'ov-pulse-g 1.5s infinite', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#00d68f' }}>Live Session · Dr. {a.doctorName}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{a.specialty || 'Consultation'} · In Progress</div>
            </div>
          </div>
          <button style={{ background: '#00d68f', color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}
            onClick={() => joinConsultation(a)} disabled={joining === a.id}>
            {joining === a.id ? 'Joining…' : '🎥 Rejoin Session'}
          </button>
        </div>
      ))}

      {/* ══════════════════════════════════════════════════════════════════
          ACTIVE ALERTS & NOTIFICATIONS
      ══════════════════════════════════════════════════════════════════ */}
      {allPendingAlerts.length > 0 && (
        <div className="ov-panel">
          <div className="ov-sec-hd">
            <div>
              <div className="ov-sec-eyebrow">Action Required</div>
              <div className="ov-sec-title">🔔 Alerts & Notifications</div>
            </div>
            <span style={mini('rgba(255,69,96,.12)', '#ff4560')}>{allPendingAlerts.length} unread</span>
          </div>
          {allPendingAlerts.slice(0, 6).map((al: any) => {
            const severity = al.severity || (al.type === 'pathway' || al.type === 'education' ? 'low' : 'medium');
            const severityClass = severity === 'high' || severity === 'urgent' ? 'high' : severity === 'medium' || severity === 'referral_created' ? 'med' : 'med';
            const typeIcon = al.type === 'pathway' ? '🛤️' : al.type === 'education' || al._source === 'patientNotifications' && al.title?.includes('Education') ? '📚' : al.type === 'lab' ? '🧪' : al.type === 'referral_created' || al.title?.includes('referral') ? '📋' : al.type === 'message' || al.type === 'clinical' ? '💬' : al.type === 'emergency' ? '🚨' : '🔔';
            const dismissFn = al._source === 'patientNotifications'
              ? () => updateDoc(doc(db, 'patientNotifications', al.id), { read: true })
              : () => updateDoc(doc(db, 'alerts', al.id), { read: true });
            return (
              <div key={al.id + (al._source || '')} className={`ov-alert-card ov-alert-card--${severityClass}`}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>
                    {typeIcon} {al.title || al.message?.slice(0, 60)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{al.body || al.message}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, fontFamily: 'JetBrains Mono,monospace' }}>
                    {fmtDate(al.createdAt)}
                    {al.doctorName && ` · by Dr. ${al.doctorName}`}
                  </div>
                </div>
                <button className="btn-sm-accent" style={{ flexShrink: 0 }} onClick={dismissFn}>
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* Doctor notifications from patientNotifications — only if not already shown above */}
      {allPendingAlerts.length === 0 && pendingNotifications.length > 0 && (
        <div className="ov-panel">
          <div className="ov-sec-hd">
            <div>
              <div className="ov-sec-eyebrow">From Your Doctor</div>
              <div className="ov-sec-title">📨 Recent Updates</div>
            </div>
          </div>
          {pendingNotifications.slice(0, 4).map((n: any) => (
            <div key={n.id} className="ov-alert-card ov-alert-card--med">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>
                  {n.type === 'pathway' ? '🛤️' : n.type === 'education' ? '📚' : n.type === 'lab' ? '🧪' : n.type === 'referral_created' ? '📋' : '📨'} {n.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{n.message}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, fontFamily: 'JetBrains Mono,monospace' }}>
                  {fmtDate(n.createdAt)} · Dr. {n.doctorName || 'Doctor'}
                </div>
              </div>
              <button className="btn-sm-accent" style={{ flexShrink: 0 }}
                onClick={() => updateDoc(doc(db, 'patientNotifications', n.id), { read: true })}>
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MAIN 2-COL: VITALS + PRESCRIPTIONS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="ov-2col">

        {/* VITALS */}
        <div className="ov-panel">
          <div className="ov-sec-hd">
            <div>
              <div className="ov-sec-eyebrow">Real-time Health</div>
              <div className="ov-sec-title">📊 Vital Signs</div>
            </div>
            <button className="btn-sm-accent" onClick={() => setShowLogVital(true)}>+ Log Reading</button>
          </div>

          {vitals.length === 0 ? (
            <div className="ov-empty">
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No readings yet</div>
              <button className="btn-sm-accent" onClick={() => setShowLogVital(true)}>Start Tracking</button>
            </div>
          ) : (
            <div className="ov-vitals-grid">
              {/* BP hero card */}
              {latestBP && bpInfo && (
                <div className="ov-vital-card ov-vital-card--hero">
                  <div className="ov-vital-top">
                    <span className="ov-vital-ico">❤️</span>
                    <div>
                      <div className="ov-vital-label">Blood Pressure</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono,monospace' }}>
                        {fmtShort(latestBP.recordedAt)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="ov-vital-reading" style={{ color: bpInfo.color }}>
                      {latestBP.systolic}/{latestBP.diastolic}
                    </span>
                    <span className="ov-vital-unit">mmHg</span>
                  </div>
                  <span className="ov-vital-badge" style={{ background: bpInfo.color + '20', color: bpInfo.color }}>
                    {bpInfo.label}
                  </span>
                  <div className="ov-progress-bar" style={{ marginTop: 10 }}>
                    <div className="ov-progress-fill" style={{
                      width: `${Math.min(100, ((latestBP.systolic ?? 120) / 180) * 100)}%`,
                      background: bpInfo.color,
                    }} />
                  </div>
                </div>
              )}

              {/* Mini vitals */}
              {([
                { type: 'glucose', icon: '🩸', label: 'Glucose',     unit: 'mmol/L', color: '#f59e0b' },
                { type: 'pulse',   icon: '💓', label: 'Pulse Rate',  unit: 'bpm',    color: '#ec4899' },
                { type: 'weight',  icon: '⚖️', label: 'Weight',      unit: 'kg',     color: '#60a5fa' },
                { type: 'temp',    icon: '🌡️', label: 'Temperature', unit: '°C',     color: '#f97316' },
              ] as any[]).map((v: any) => {
                const reading = vitals.find(vi => vi.type === v.type);
                return (
                  <div key={v.type} className="ov-vital-card">
                    <div className="ov-vital-top">
                      <span className="ov-vital-ico">{v.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ov-vital-label">{v.label}</div>
                        {reading && <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'JetBrains Mono,monospace' }}>{fmtShort(reading.recordedAt)}</div>}
                      </div>
                    </div>
                    <div className="ov-vital-mini">
                      <div>
                        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 22, fontWeight: 700, color: reading ? v.color : 'var(--muted)', lineHeight: 1 }}>
                          {reading ? reading.value : '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{v.unit}</div>
                      </div>
                      {reading && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, boxShadow: `0 0 8px ${v.color}88` }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PRESCRIPTIONS */}
        <div className="ov-panel">
          <div className="ov-sec-hd">
            <div>
              <div className="ov-sec-eyebrow">Current Medications</div>
              <div className="ov-sec-title">💊 Prescriptions</div>
            </div>
            <button className="btn-sm-accent" onClick={() => setActiveTab('prescriptions')}>View All</button>
          </div>

          {allPrescriptions.length === 0 ? (
            <div className="ov-empty">
              <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No prescriptions yet</div>
              <div>Medications will appear after consultations.</div>
            </div>
          ) : allPrescriptions.slice(0, 4).map((rx: any, i: number) => (
            <div key={i} className="ov-rx">
              <div className="ov-rx-top">
                <div>
                  <div className="ov-rx-name">{rx.medication}</div>
                  <div className="ov-rx-dr">Prescribed by Dr. {rx.doctorName}</div>
                </div>
                <span className="ov-rx-pill">Active</span>
              </div>
              <div className="ov-rx-meta">
                <span>💉 {rx.dosage}</span>
                <span>·</span>
                <span>🕐 {rx.frequency}</span>
                <span>·</span>
                <span>📆 {rx.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT APPOINTMENTS — full width */}
        <div className="ov-panel ov-full">
          <div className="ov-sec-hd">
            <div>
              <div className="ov-sec-eyebrow">Care History</div>
              <div className="ov-sec-title">📅 Recent Appointments</div>
            </div>
            <button className="btn-sm-accent" onClick={() => setActiveTab('appointments')}>View All</button>
          </div>

          {appointments.length === 0 ? (
            <div className="ov-empty">
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No appointments yet</div>
              <button className="btn-sm-accent" onClick={() => setActiveTab('discover')}>Find a Doctor →</button>
            </div>
          ) : (
            <div>
              {appointments.slice(0, 5).map(appt => {
                const sc = statusCfg[appt.status] || statusCfg.booked;
                return (
                  <div key={appt.id} className="ov-appt" onClick={() => setActiveTab('appointments')}>
                    <div className="ov-appt-left">
                      <div className="ov-appt-ico">
                        {appt.status === 'active' ? '🟢' : appt.status === 'completed' ? '✅' : appt.status === 'cancelled' ? '❌' : '📅'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="ov-appt-spec">
                          {appt.specialty || 'Consultation'}
                          {appt.firstVisit && <span style={{ marginLeft: 8, fontSize: 9, background: 'rgba(255,176,32,.12)', color: '#ffb020', borderRadius: 99, padding: '2px 7px', fontWeight: 700 }}>1st Visit</span>}
                        </div>
                        <div className="ov-appt-dr">Dr. {appt.doctorName}</div>
                        <div className="ov-appt-date">{fmtDate(appt.scheduledDate || appt.date)}</div>
                      </div>
                    </div>
                    <div className="ov-appt-right">
                      <span className="ov-status-pill" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      {appt.status === 'active' && (
                        <button className="ov-join-btn"
                          onClick={e => { e.stopPropagation(); joinConsultation(appt); }}
                          disabled={joining === appt.id}>
                          {joining === appt.id ? '…' : '🎥 Join'}
                        </button>
                      )}
                      {appt.paymentStatus === 'failed' && (
                        <span style={mini('rgba(255,69,96,.1)', '#ff4560')}>Pay Now →</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PENDING LAB ORDERS
      ══════════════════════════════════════════════════════════════════ */}
      {pendingLabOrders > 0 && (
        <div className="ov-panel">
          <div className="ov-sec-hd">
            <div>
              <div className="ov-sec-eyebrow">Doctor-Ordered Tests</div>
              <div className="ov-sec-title">🧪 Pending Lab Orders</div>
            </div>
            <span style={mini('rgba(255,176,32,.12)', '#ffb020')}>{pendingLabOrders} pending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {labOrders.filter((o: any) => o.status === 'ordered' || o.status === 'pending').slice(0, 4).map((o: any) => (
              <div key={o.id} className="lab-card" style={{ borderLeft: '3px solid #ffb020' }}>
                <div className="lab-card-hd">
                  <div>
                    <div className="lab-name">{o.tests?.join(', ') || o.testName || 'Lab Test'}</div>
                    <div className="lab-meta">
                      Ordered by Dr. {o.doctorName || o.doctorId?.slice(0, 6)} · {fmtDate(o.createdAt)}
                    </div>
                  </div>
                  <span style={{ background: 'rgba(255,176,32,.12)', color: '#ffb020', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                    {o.status || 'Ordered'}
                  </span>
                </div>
                {o.instructions && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, fontStyle: 'italic' }}>{o.instructions}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          RECENT EDUCATION FROM DOCTOR
      ══════════════════════════════════════════════════════════════════ */}
      {educationLogs.filter((e: any) => e.topic || e.title).length > 0 && (
        <div className="ov-panel ov-full">
          <div className="ov-sec-hd">
            <div>
              <div className="ov-sec-eyebrow">Assigned Learning</div>
              <div className="ov-sec-title">📚 Education from Your Doctor</div>
            </div>
            <button className="btn-sm-accent" onClick={() => setActiveTab('education')}>View All →</button>
          </div>
          <div className="edu-grid">
            {educationLogs.filter((e: any) => e.topic || e.title).slice(0, 3).map((e: any, i: number) => (
              <div key={e.id || i} className="edu-card" style={{ cursor: 'default' }}>
                <div className="edu-body">
                  <span className="edu-type">👨‍⚕️ Dr. {e.doctorName || 'Your Doctor'}</span>
                  <div className="edu-title">📚 {e.topic || e.title}</div>
                  <p className="edu-summary">{e.notes || `Educational material sent on ${fmtDate(e.sentAt)}`}</p>
                  <div className="edu-time">📅 {fmtDate(e.sentAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '4px 0 2px', fontSize: 10, color: 'var(--muted)', letterSpacing: 3.5, textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
        AMEXAN HealthOS · Your Lifelong Care Companion
      </div>

    </div>
  );
})()}

        
        {/* ── DISCOVER TAB ── */}
            {activeTab === 'discover' && <DiscoverTab />}

            {/* ── VITALS TAB ── */}
            {activeTab === 'vitals' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="panel">
                  <div className="panel-hd">
                    <div className="panel-title">📊 Vital Signs History</div>
                    <button className="btn-sm-accent" onClick={() => setShowLogVital(true)}>+ Log Reading</button>
                  </div>
                  {latestBP && bpInfo && (
                    <div className="vital-main" style={{ borderColor: bpInfo.color + '40', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: 28 }}>❤️</span>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Blood Pressure (Latest)</div>
                          <div className="vital-main-val" style={{ color: bpInfo.color }}>{latestBP.systolic}/{latestBP.diastolic} <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>mmHg</span></div>
                          <span className="vital-badge" style={{ background: bpInfo.color + '20', color: bpInfo.color }}>{bpInfo.label}</span>
                        </div>
                      </div>
                      {vitals.filter(v => v.type === 'bp').length > 1 && (
                        <>
                          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>7-Day Trend</div>
                          <div className="bp-sparkline-row">
                            {vitals.filter(v => v.type === 'bp').slice(0, 7).reverse().map((v, i) => {
                              const pct = Math.min(100, Math.max(5, (((v.systolic ?? 120) - 80) / 80) * 100));
                              const cat = bpCat(v.systolic ?? 120, v.diastolic ?? 80);
                              return (
                                <div key={i} className="spark-col" title={`${v.systolic}/${v.diastolic} — ${fmtShort(v.recordedAt)}`}>
                                  <div className="spark-bar-outer"><div className="spark-bar-inner" style={{ height: `${pct}%`, background: cat.color }} /></div>
                                  <div className="spark-date">{fmtShort(v.recordedAt)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div className="vitals-mini" style={{ marginBottom: 16 }}>
                    {[
                      { type: 'glucose', icon: '🩸', label: 'Glucose', unit: 'mmol/L' },
                      { type: 'pulse', icon: '💓', label: 'Pulse', unit: 'bpm' },
                      { type: 'weight', icon: '⚖️', label: 'Weight', unit: 'kg' },
                      { type: 'temp', icon: '🌡️', label: 'Temp', unit: '°C' },
                    ].map(v => {
                      const r = vitals.find(vi => vi.type === v.type);
                      return (
                        <div key={v.type} className="vital-mini">
                          <span style={{ fontSize: 22 }}>{v.icon}</span>
                          <span className="vital-mini-val" style={{ color: 'var(--text)' }}>{r ? r.value : '—'}</span>
                          <span style={{ fontSize: 9, color: 'var(--muted)' }}>{v.unit}</span>
                          <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 600 }}>{v.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {vitals.length === 0 ? (
                    <div className="empty-sm"><div style={{ fontSize: 36 }}>📊</div><p>No readings yet. Log your first vital sign to start tracking.</p></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>All Readings</div>
                      {vitals.slice(0, 20).map(v => (
                        <div key={v.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 16 }}>{v.type === 'bp' ? '❤️' : v.type === 'glucose' ? '🩸' : v.type === 'weight' ? '⚖️' : v.type === 'temp' ? '🌡️' : '💓'}</span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--mono)' }}>{v.value} {v.unit}</div>
                              {v.note && <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>{v.note}</div>}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(v.recordedAt)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── APPOINTMENTS TAB ── */}
            {activeTab === 'appointments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'All', count: appointments.length },
                    { label: 'Upcoming', count: upcomingAppts.length },
                    { label: 'Active', count: activeAppts.length },
                    { label: 'Completed', count: appointments.filter(a => a.status === 'completed').length },
                    { label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length },
                  ].map(f => (
                    <div key={f.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 700 }}>
                      {f.label} <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{f.count}</span>
                    </div>
                  ))}
                </div>
                {appointments.length === 0 ? (
                  <div className="panel"><div className="empty-sm"><div style={{ fontSize: 40 }}>📭</div><p>No appointments yet.</p><button className="btn-sm-accent" style={{ marginTop: 12 }} onClick={() => setActiveTab('discover')}>Find Doctors →</button></div></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {appointments.map(appt => {
                      const sc = statusCfg[appt.status] || statusCfg.booked;
                      return (
                        <div key={appt.id} className="appt-card">
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div className="appt-icon">{appt.status === 'active' ? '🟢' : appt.status === 'completed' ? '✅' : appt.status === 'cancelled' ? '❌' : '📅'}</div>
                            <div>
                              <div className="appt-spec">
                                {appt.specialty || 'Consultation'}
                                {appt.firstVisit && <span className="appt-first-visit">1st Visit</span>}
                                {appt.type === 'telemedicine' && <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700, marginLeft: 6 }}>💻 VIDEO</span>}
                              </div>
                              <div className="appt-dr">Dr. {appt.doctorName}</div>
                              <div className="appt-date">{fmtDate(appt.scheduledDate || appt.date)}</div>
                              {appt.scheduledTime && <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', marginTop: 1 }}>⏰ {appt.scheduledTime}</div>}
                              {appt.patientNotes && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, fontStyle: 'italic' }}>"{appt.patientNotes.slice(0, 60)}…"</div>}
                              {appt.paymentStatus && (
                                <div style={{ fontSize: 10, marginTop: 3, color: appt.paymentStatus === 'paid' ? 'var(--green)' : appt.paymentStatus === 'failed' ? 'var(--red)' : 'var(--amber)', fontWeight: 700 }}>
                                  💳 {appt.paymentStatus === 'paid' ? `Paid · Ref: ${appt.paymentRef}` : appt.paymentStatus === 'processing' ? 'Payment processing…' : appt.paymentStatus === 'failed' ? 'Payment failed — ' : 'Pending payment'}
                                  {appt.paymentStatus === 'failed' && <button style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontWeight: 700, fontSize: 10 }} onClick={() => setActiveTab('payments')}>Pay Now →</button>}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                            {appt.status === 'active' && (
                              <button className="btn-join-sm" onClick={() => joinConsultation(appt)} disabled={joining === appt.id}>
                                {joining === appt.id ? '…' : '🎥 Join'}
                              </button>
                            )}
                            {appt.status === 'completed' && (
                              <button className="btn-records" onClick={() => setActiveTab('history')}>📄 History</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── PRESCRIPTIONS TAB ── */}
            {activeTab === 'prescriptions' && (
  <PatientRxCenter
    patientId={patient.uid}
    patientName={patient.name}
  />
)}

            {/* ── LABS TAB ── */}
            {activeTab === 'labs' && (
  <PatientOrdersCenter
    patientId={patient.uid}
    patientName={patient.name}
    patient={patient}
    onOpenChat={(doctorId, doctorName) => {
      setActiveTab('messages');
    }}
  />
)}

            {/* Medical Record — the ONE tab for all clinical history */}
{activeTab === 'record' && (
  <div className="space-y-6">
    <ClinicalHistory
      patientId={patient.uid}
      patientName={patient.name}
      viewerRole="patient"
      viewerId={patient.uid}
      viewerName={patient.name}
    />

    {/* ── Prescription History ── */}
    {allPrescriptions.length > 0 && (
      <div className="rx-history-section">
        <div className="rxh-hd">
          <span className="rxh-title">💊 Prescription History</span>
          <span className="rxh-count">{allPrescriptions.length} total</span>
        </div>
        <div className="rxh-grid">
          {allPrescriptions.map((rx: any, i: number) => {
            const rxDate = rx.createdAt?.toDate
              ? rx.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : rx.date || '';
            return (
              <div key={rx.id || i} className="rxh-card">
                <div className="rxh-top">
                  <div className="rxh-drug">
                    <span className="rxh-drug-name">{rx.medication || rx.medicationName}</span>
                    <span className="rxh-status-badge active">Active</span>
                  </div>
                  <span className="rxh-date">{rxDate}</span>
                </div>
                <div className="rxh-meta">
                  {rx.dosage && <span className="rxh-chip">💉 {rx.dosage}</span>}
                  {rx.frequency && <span className="rxh-chip">🕐 {rx.frequency}</span>}
                  {rx.duration && <span className="rxh-chip">📆 {rx.duration}</span>}
                  {rx.route && <span className="rxh-chip">🩸 {rx.route}</span>}
                </div>
                <div className="rxh-footer">
                  <span className="rxh-doctor">Dr. {rx.doctorName || rx.prescriberName || 'Unknown'}</span>
                  {rx.condition && <span className="rxh-condition">For: {rx.condition}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* Doctor's clinical notes */}
    {clinicalNotes.length > 0 && (
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-title">📝 Doctor's Clinical Notes</span>
          <span className="count-badge">{clinicalNotes.length}</span>
        </div>
        <div className="rxh-grid">
          {clinicalNotes.map(note => {
            const date = note.createdAt?.toDate
              ? note.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : note.visitDate || new Date(note.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={note.id} className="rxh-card">
                <div className="rxh-top">
                  <span className="rxh-drug-name" style={{ fontSize: 14, color: 'var(--accent3)' }}>{note.doctorName || 'Doctor'}</span>
                  <span className="rxh-date">{date}</span>
                </div>
                {note.type && <span className="rxh-chip" style={{ background: 'var(--surface2)' }}>{note.type}</span>}
                <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, marginTop: 8, whiteSpace: 'pre-wrap' }}>{note.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
)}
{activeTab === 'visits' && (
  <PatientVisitSummary patientId={patient.uid} />
)}

{/* ── MY HEALTH ─────────────────────────────────────────────────── */}
{activeTab === 'health' && (
  <PatientHealthDashboard
    patientId={patient.uid}
    patientName={patient.name}
    isDoctor={false}
    appointments={appointments}
  />
)}
{activeTab === 'referrals' && patient && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text, #1e293b)', marginBottom: 4 }}>
        🏥 My Referrals
      </div>
      <div style={{ fontSize: 13, color: 'var(--muted, #94a3b8)' }}>
        Referrals issued by your doctors · Download letters · Track status
      </div>
    </div>
    <PatientReferralPortal
      patientId={patient.uid}
      patientName={patient.name || 'Patient'}
      patient={patient}
      onOpenChat={(doctorId, doctorName) => {
        setChatDoctor({ doctorId, doctorName });
        setActiveTab('messages');
      }}
    />
  </div>
)}
{/* ── MY TOOLS ──────────────────────────────────────────────────── */}
{activeTab === 'tools' && (
  <PatientToolLogger
    patientId={patient.uid}
    doctorId={appointments?.[0]?.doctorId || ''}
  />
)}
            {/* ── MESSAGES TAB ── */}
           {activeTab === 'messages' && patient?.uid && patient?.name && (
  <AmexanClinicalMessaging
    myId={patient.uid}
    myName={patient.name}
    myRole="patient"
    defaultDoctorId={chatDoctor?.doctorId}
    defaultDoctorName={chatDoctor?.doctorName}
  />
)}
           {/* ── EDUCATION TAB ── */}
            {activeTab === 'education' && (
              <PatientEducationView
                patient={patient}
                educationLogs={dedupedEducation}
                fullLogs={educationLogs}
                searchArticles={searchArticles}
              />
            )}

            {/* ── PAYMENTS TAB ── */}
            {activeTab === 'payments' && <PaymentsPanel appointments={appointments} patient={patient} />}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
              <SettingsPanel patient={patient} onUpdate={updates => setPatient(p => p ? { ...p, ...updates } : p)} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {[
          
  { id: 'overview',     icon: '🏠', label: 'Home' },
  { id: 'record',       icon: '📋', label: 'Record' },
  { id: 'discover',     icon: '🔍', label: 'Doctors' },
  { id: 'appointments', icon: '📅', label: 'Visits' },
  { id: 'messages',     icon: '💬', label: 'Messages' },

        ].map(t => (
          <button key={t.id} className={`mob-nav-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span className="mob-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* FAB */}
      <div className="fab-wrap">
        <button className="fab-item" onClick={() => setShowEmergency(true)}>🚨 Emergency</button>
        <button className="fab-main" onClick={() => setShowLogVital(true)}>+</button>
      </div>

      {/* ─── MODALS & DRAWERS ─────────────────────────────────────────── */}
      {profileSvc && (
        <DoctorProfileDrawer
          svc={profileSvc}
          onClose={() => setProfileSvc(null)}
          onBook={() => { setBookSvc(profileSvc); setProfileSvc(null); }}
        />
      )}
      {bookSvc && <BookModal svc={bookSvc} patient={patient} onClose={() => setBookSvc(null)} />}
      {showLogVital && <LogVitalModal patient={patient} onClose={() => setShowLogVital(false)} onSaved={() => {}} />}
      {showTriage && <TriageModal onClose={() => setShowTriage(false)} onDone={sp => { setTriageSpecialty(sp); setTriageDone(true); setShowTriage(false); setActiveTab('discover'); }} />}
      {showSmartcard && <SmartcardModal patient={patient} onClose={() => setShowSmartcard(false)} />}
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} patientId={patient.uid} />}
    </>
  );
}
