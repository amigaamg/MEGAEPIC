import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DoctorAvailability {
  availableDays: string[];
  slots: string[];
  bufferMinutes: number;
  maxAppointmentsPerDay: number;
  timezone: string;
  availableFrom: string;
  availableTo: string;
  slotDuration: number;
  updatedAt?: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const AVAILABILITY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AVAILABILITY_TIMEZONES = [
  'Africa/Nairobi',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Africa/Cairo',
  'Africa/Accra',
  'Europe/London',
  'America/New_York',
  'Asia/Dubai',
];

export const DEFAULT_AVAILABILITY: DoctorAvailability = {
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  slots: [],
  bufferMinutes: 10,
  maxAppointmentsPerDay: 10,
  timezone: 'Africa/Nairobi',
  availableFrom: '09:00',
  availableTo: '17:00',
  slotDuration: 30,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAvailability(doctorId: string) {
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    const unsub = onSnapshot(doc(db, 'availability', doctorId), (snap) => {
      setAvailability(snap.exists() ? (snap.data() as DoctorAvailability) : DEFAULT_AVAILABILITY);
      setLoading(false);
    });
    return () => unsub();
  }, [doctorId]);

  const save = async (data: DoctorAvailability) => {
    await setDoc(doc(db, 'availability', doctorId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  return { availability, loading, save };
}

// ─── Slot generator ───────────────────────────────────────────────────────────

export function generateSlots(
  from: string,
  to: string,
  durationMins: number,
  bufferMins: number,
): string[] {
  const slots: string[] = [];
  const [fH, fM] = from.split(':').map(Number);
  const [tH, tM] = to.split(':').map(Number);
  let current = fH * 60 + fM;
  const end = tH * 60 + tM;
  const step = durationMins + bufferMins;

  while (current + durationMins <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += step;
  }
  return slots;
}