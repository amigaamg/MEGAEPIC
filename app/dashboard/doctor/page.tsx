'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { initDoctorTheme } from '@/lib/doctor-theme';
import { DoctorCSS } from '@/components/doctor/DoctorCSS';
import DoctorShell, { DoctorProfile, TabDefinition } from '@/components/doctor/DoctorShell';
import {
  HomeWorkspace, ClinicWorkspace, PatientsWorkspace, HistoryWorkspace,
  CommunicationWorkspace, ReferralsWorkspace, HTNWorkspace, ToolsWorkspace,
  ServicesWorkspace, EarningsWorkspace, PortfolioWorkspace, SettingsWorkspace,
  InpatientWorkspace, CarePathwayWorkspace, TeamWorkspace,
  ClinicalMonitoringWorkspace, ClinicalDocsWorkspace, ClinicalOperationsWorkspace,
} from '@/components/doctor/workspaces';
import {
  collection, query, where, onSnapshot, doc, setDoc,
  addDoc, updateDoc, deleteDoc, getDoc, getDocs, serverTimestamp,
  orderBy, limit,
} from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

// ─── TYPES ────────────────────────────────────────────────────────────────
interface Appointment {
  id: string; patientId: string; patientName?: string; patientEmail?: string;
  patientPhone?: string; serviceId: string; specialty?: string;
  status: 'booked' | 'active' | 'completed' | 'cancelled';
  date: any; patientNotes?: string; notes?: string;
  prescriptions?: Prescription[]; consultationId?: string;
  doctorId: string; amount?: number; paymentStatus?: string;
}
interface Consultation {
  id: string; appointmentId: string; doctorId: string; patientId: string;
  status: 'active' | 'completed'; prescriptions: Prescription[];
  notes: string; startedAt: any; endedAt?: any;
}
interface Prescription { medication: string; dosage: string; frequency: string; duration: string; addedAt: string; instructions?: string; }
interface Service {
  id: string; specialty: string; clinic: string; price: number;
  description: string; doctorId: string; doctorName: string; duration: number;
  isAvailable: boolean; tags?: string[]; rating?: number;
  yearsExperience?: number; location?: string; createdAt: any;
}
interface DocketData {
  id: string; name: string; specialty: string; description?: string;
  tools: string[]; patientCount: number; createdBy: string;
  createdAt: any; isActive: boolean;
}

// ─── HELPER ───────────────────────────────────────────────────────────────
const isToday = (ts: any) => {
  if (!ts) return false;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toDateString() === new Date().toDateString();
};

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const router = useRouter();
  const [authDone, setAuthDone] = useState(false);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [consultations, setConsultations] = useState<Record<string, Consultation>>({});
  const [dockets, setDockets] = useState<DocketData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [focusedThreadId, setFocusedThreadId] = useState<string | null>(null);
  const [focusedReferralPatient, setFocusedReferralPatient] = useState<{ id: string; name: string } | null>(null);
  const themeInited = useRef(false);

  // Init theme
  useEffect(() => {
    if (!themeInited.current) {
      initDoctorTheme();
      themeInited.current = true;
    }
  }, []);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.replace('/login'); return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.data() || {};
      if (data.role !== 'doctor') { router.replace('/dashboard/patient'); return; }
      setDoctor({
        uid: user.uid, name: data.name || user.displayName || 'Doctor',
        email: data.email || user.email || '', specialty: data.specialty || '',
        clinic: data.clinic, licenseNumber: data.licenseNumber, phone: data.phone,
        bio: data.bio, yearsExperience: data.yearsExperience, languages: data.languages,
        location: data.location, photoURL: data.photoURL, rating: data.rating,
      });
      setAuthDone(true);
    });
    return () => unsub();
  }, [router]);

  // Appointments
  useEffect(() => {
    if (!doctor) return;
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        query(collection(db, 'appointments'), where('doctorId', '==', doctor.uid)),
        async snap => {
          const appts = await Promise.all(snap.docs.map(async d => {
            const a = { id: d.id, ...d.data() } as Appointment;
            if (a.patientId && !a.patientName) {
              try {
                const ps = await getDoc(doc(db, 'users', a.patientId));
                if (ps.exists()) {
                  a.patientName = ps.data().name;
                  a.patientEmail = ps.data().email;
                  a.patientPhone = ps.data().phone;
                }
              } catch {}
            }
            return a;
          }));
          setAppointments(appts.sort((a, b) => {
            const da = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
            const db2 = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
            return db2.getTime() - da.getTime();
          }));
        }
      );
    } catch (e) { console.error('Appointments error:', e); }
    return () => unsub?.();
  }, [doctor?.uid]);

  // Services
  useEffect(() => {
    if (!doctor) return;
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        query(collection(db, 'services'), where('doctorId', '==', doctor.uid)),
        snap => setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)))
      );
    } catch (e) { console.error('Services error:', e); }
    return () => unsub?.();
  }, [doctor?.uid]);

  // Active consultations
  useEffect(() => {
    if (!doctor) return;
    const unsub = onSnapshot(
      query(collection(db, 'consultations'), where('doctorId', '==', doctor.uid), where('status', '==', 'active')),
      snap => {
        const map: Record<string, Consultation> = {};
        snap.docs.forEach(d => { map[d.data().appointmentId] = { id: d.id, ...d.data() } as Consultation; });
        setConsultations(map);
      }
    );
    return () => unsub();
  }, [doctor?.uid]);

  // Dockets — real‑time from Firestore
  useEffect(() => {
    if (!doctor) return;
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        query(collection(db, 'dockets'), where('createdBy', '==', doctor.uid)),
        snap => setDockets(snap.docs.map(d => ({ id: d.id, ...d.data() } as DocketData)))
      );
    } catch (e) { console.error('Dockets error:', e); }
    return () => unsub?.();
  }, [doctor?.uid]);

  // Derived data
  const todayAppts = appointments.filter(a => isToday(a.date));
  const activeAppts = appointments.filter(a => a.status === 'active');
  const upcomingAppts = appointments.filter(a => a.status === 'booked');
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const totalEarned = appointments.filter(a => a.paymentStatus === 'paid').reduce((s, a) => s + (a.amount || 0), 0);
  const patientIds = [...new Set(appointments.map(a => a.patientId))];

  // ─── CALLBACKS ─────────────────────────────────────────────────────────
  const openConversation = useCallback((threadId: string) => {
    setFocusedThreadId(threadId);
    setActiveTab('messages');
    setTimeout(() => setFocusedThreadId(null), 500);
  }, []);

  const openReferralsForPatient = useCallback((patientId: string, patientName: string) => {
    setFocusedReferralPatient({ id: patientId, name: patientName });
    setActiveTab('referrals');
    setTimeout(() => setFocusedReferralPatient(null), 500);
  }, []);

  const startConsultation = useCallback(async (appt: Appointment) => {
    try {
      const consultationId = uuidv4();
      await setDoc(doc(db, 'consultations', consultationId), {
        appointmentId: appt.id, doctorId: appt.doctorId, patientId: appt.patientId,
        status: 'active', prescriptions: [], notes: '', startedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'appointments', appt.id), { status: 'active', consultationId });
      await addDoc(collection(db, 'alerts'), {
        patientId: appt.patientId, doctorId: doctor?.uid, type: 'general',
        title: '🟢 Your Consultation Has Started',
        message: `Dr. ${doctor?.name} has started your consultation. Please join now.`,
        read: false, createdAt: serverTimestamp(),
      });
      router.push(`/dashboard/consultation/${consultationId}`);
    } catch (e) { console.error(e); alert('Failed to start session.'); }
  }, [doctor, router]);

  const endConsultation = useCallback(async (appt: Appointment) => {
    if (!confirm('End this consultation?')) return;
    const c = consultations[appt.id];
    if (!c) return;
    await updateDoc(doc(db, 'consultations', c.id), { status: 'completed', endedAt: serverTimestamp() });
    await updateDoc(doc(db, 'appointments', appt.id), { status: 'completed' });
    await addDoc(collection(db, 'alerts'), {
      patientId: appt.patientId, doctorId: doctor?.uid, type: 'general',
      title: '✅ Consultation Complete',
      message: `Your consultation with Dr. ${doctor?.name} is complete. View your notes and prescriptions in your dashboard.`,
      read: false, createdAt: serverTimestamp(),
    });
  }, [consultations, doctor]);

  const cancelAppointment = useCallback(async (appt: Appointment) => {
    if (!confirm(`Cancel appointment for ${appt.patientName}?`)) return;
    await updateDoc(doc(db, 'appointments', appt.id), { status: 'cancelled' });
    await addDoc(collection(db, 'alerts'), {
      patientId: appt.patientId, doctorId: doctor?.uid, type: 'general',
      title: '❌ Appointment Cancelled',
      message: `Your appointment with Dr. ${doctor?.name} has been cancelled. Please rebook at your convenience.`,
      read: false, createdAt: serverTimestamp(),
    });
  }, [doctor]);

  const handleCreatePatient = useCallback(async (data: any) => {
    try {
      const patientUid = data.email || `pat_${Date.now()}`;
      await setDoc(doc(db, 'users', patientUid), {
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName, lastName: data.lastName,
        email: data.email || '', phone: data.phone,
        gender: data.gender, dateOfBirth: data.dateOfBirth || null,
        age: data.age || null, ageUnit: data.ageUnit || null,
        emergencyContact: data.emergencyContact || '',
        allergies: data.allergies || [], chronicConditions: data.chronicConditions || [],
        currentMedications: data.currentMedications || [],
        bloodType: data.bloodType || '', genotype: data.genotype || '',
        nokName: data.nokName || '', nokPhone: data.nokPhone || '', nokRelation: data.nokRelation || '',
        insuranceProvider: data.insuranceProvider || '', insuranceNumber: data.insuranceNumber || '',
        clinicId: data.clinicId || '', pathwayId: data.pathwayId || '', wardId: data.wardId || '',
        notes: data.notes || '', source: data.source || 'walkin',
        role: 'patient', createdBy: doctor?.uid || '',
        createdAt: serverTimestamp(),
      });
      if (data.pathwayId) {
        await addDoc(collection(db, 'care_pathways'), {
          patientId: patientUid, pathwayId: data.pathwayId,
          milestones: [], currentMilestone: 0, status: 'active',
          enrolledAt: serverTimestamp(), doctorId: doctor?.uid,
        });
      }
      return { uid: patientUid };
    } catch (e) { console.error('Create patient failed:', e); return null; }
  }, [doctor]);

  const handleCreateDocket = useCallback(async (data: { name: string; specialty: string; description: string; tools: string[] }) => {
    if (!doctor) return null;
    const ref = doc(collection(db, 'dockets'));
    await setDoc(ref, { ...data, patientCount: 0, createdBy: doctor.uid, createdAt: serverTimestamp(), isActive: true });
    return { id: ref.id, ...data, patientCount: 0, createdBy: doctor.uid, createdAt: new Date(), isActive: true };
  }, [doctor]);

  const handleActivateDocket = useCallback(async (docketId: string, active: boolean) => {
    await updateDoc(doc(db, 'dockets', docketId), { isActive: active });
  }, []);

  const handleSettingsUpdate = useCallback(async () => {
    if (!doctor) return;
    const snap = await getDoc(doc(db, 'users', doctor.uid));
    const data = snap.data() || {};
    setDoctor(prev => prev ? { ...prev, ...data } : prev);
  }, [doctor]);

  // Derived patients list
  const patients = useMemo(() => {
    const map = new Map<string, { uid: string; name: string; condition?: string }>();
    appointments.forEach(a => {
      if (a.patientId && !map.has(a.patientId)) {
        map.set(a.patientId, { uid: a.patientId, name: a.patientName || 'Unknown', condition: a.specialty });
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  // ─── TABS ──────────────────────────────────────────────────────────────
  const tabs: TabDefinition[] = [
    { id: 'overview',   icon: '🏠', label: 'Overview' },
    { id: 'queue',      icon: '📋', label: 'Queue', badge: upcomingAppts.length + activeAppts.length },
    { id: 'patients',   icon: '👥', label: 'Patients' },
    { id: 'history',    icon: '🗂️', label: 'History' },
    { id: 'clinical_docs', icon: '📝', label: 'Clinical Notes' },
    { id: 'messages',   icon: '💬', label: 'Messages' },
    { id: 'referrals',  icon: '📋', label: 'Referrals' },
    { id: 'htn',        icon: '🩺', label: 'HTN' },
    { id: 'monitoring', icon: '📊', label: 'Monitoring' },
    { id: 'operations', icon: '⚙️', label: 'Operations' },
    { id: 'tools',      icon: '🛠️', label: 'Tools' },
    { id: 'services',   icon: '🏥', label: 'Services' },
    { id: 'earnings',   icon: '💰', label: 'Earnings' },
    { id: 'portfolio',  icon: '🌐', label: 'My Portfolio' },
    { id: 'inpatient',  icon: '🛏️', label: 'Inpatient' },
    { id: 'pathways',   icon: '🛤️', label: 'Care Pathways' },
    { id: 'team',       icon: '👥', label: 'Care Team', badge: 2 },
    { id: 'settings',   icon: '⚙️', label: 'Settings' },
  ];

  // ─── LOADING ────────────────────────────────────────────────────────────
  if (!authDone || !doctor) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg, #f4f6fb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, border: '3px solid var(--border, #e2e8f0)', borderTopColor: 'var(--accent, #10b981)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--muted, #64748b)', fontWeight: 600 }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <>
      <DoctorCSS />
      <DoctorShell
        doctor={doctor}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        appointments={appointments}
        activeAppts={activeAppts}
        upcomingAppts={upcomingAppts}
      >
        {activeTab === 'overview' && (
          <HomeWorkspace
            doctor={doctor}
            appointments={appointments}
            services={services}
            activeAppts={activeAppts}
            upcomingAppts={upcomingAppts}
            completedAppts={completedAppts}
            patientIds={patientIds}
            totalEarned={totalEarned}
            onTabChange={setActiveTab}
            dockets={dockets}
          />
        )}

        {activeTab === 'queue' && (
          <ClinicWorkspace
            doctor={doctor}
            appointments={appointments}
            consultations={consultations}
            activeAppts={activeAppts}
            upcomingAppts={upcomingAppts}
            onStartConsultation={startConsultation}
            onEndConsultation={endConsultation}
            onCancelAppointment={cancelAppointment}
            onRejoin={(id) => router.push(`/dashboard/consultation/${id}`)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            dockets={dockets}
            onCreateDocket={handleCreateDocket}
            onActivateDocket={handleActivateDocket}
          />
        )}

        {activeTab === 'patients' && (
          <PatientsWorkspace
            doctorId={doctor.uid}
            doctorName={doctor.name}
            appointments={appointments}
            doctorSpecialty={doctor.specialty}
            onCreatePatient={handleCreatePatient}
            dockets={dockets.map(d => ({ id: d.id, name: d.name }))}
          />
        )}

        {activeTab === 'history' && (
          <HistoryWorkspace appointments={appointments} doctor={doctor} />
        )}

        {activeTab === 'clinical_docs' && (
          <ClinicalDocsWorkspace
            doctorId={doctor.uid}
            doctorName={doctor.name}
            doctorSpecialty={doctor.specialty}
          />
        )}

        {activeTab === 'messages' && (
          <CommunicationWorkspace
            doctorId={doctor.uid}
            doctorName={doctor.name}
            initialThreadId={focusedThreadId}
          />
        )}

        {activeTab === 'referrals' && (
          <ReferralsWorkspace
            doctorId={doctor.uid}
            doctorName={doctor.name}
            doctorSpecialty={doctor.specialty}
            doctorFacility={doctor.clinic}
            doctorPhone={doctor.phone}
            patientId={focusedReferralPatient?.id}
            patientName={focusedReferralPatient?.name}
          />
        )}

        {activeTab === 'htn' && (
          <HTNWorkspace
            doctorId={doctor.uid}
            onOpenConversation={openConversation}
            onOpenReferrals={openReferralsForPatient}
          />
        )}

        {activeTab === 'monitoring' && (
          <ClinicalMonitoringWorkspace
            doctorId={doctor.uid}
            doctorName={doctor.name}
          />
        )}

        {activeTab === 'operations' && (
          <ClinicalOperationsWorkspace
            doctorId={doctor.uid}
            doctorName={doctor.name}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsWorkspace doctorId={doctor.uid} doctorSpecialty={doctor.specialty} appointments={appointments} />
        )}

        {activeTab === 'services' && (
          <ServicesWorkspace doctor={doctor} services={services} />
        )}

        {activeTab === 'earnings' && (
          <EarningsWorkspace appointments={appointments} />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioWorkspace doctorId={doctor.uid} />
        )}

        {activeTab === 'inpatient' && (
          <InpatientWorkspace doctorId={doctor.uid} doctorName={doctor.name} />
        )}

        {activeTab === 'pathways' && (
          <CarePathwayWorkspace patients={patients as any} doctorId={doctor.uid} doctorName={doctor.name} />
        )}

        {activeTab === 'team' && (
          <TeamWorkspace doctorId={doctor.uid} doctorName={doctor.name} />
        )}

        {activeTab === 'settings' && (
          <SettingsWorkspace doctor={doctor} onUpdated={handleSettingsUpdate} />
        )}
      </DoctorShell>
    </>
  );
}
