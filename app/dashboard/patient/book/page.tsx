"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc
} from "firebase/firestore";

export default function BookAppointment() {
  const [services, setServices] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      const snap = await getDocs(collection(db, "services"));
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    loadServices();
  }, []);

  const book = async (service: any) => {
    const patient = auth.currentUser;

    if (!patient) return;

    await addDoc(collection(db, "appointments"), {
      patientId: patient.uid,
      doctorId: service.doctorId,
      serviceId: service.id,
      status: "booked",
      date: new Date()
    });

    setMsg('Appointment booked successfully! 🚀');
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Available Doctors
      </h1>

      <div className="grid grid-cols-3 gap-4">

        {services.map(service => (
          <div
            key={service.id}
            className="border p-4 rounded shadow"
          >
            <h2 className="font-bold text-xl">
              {service.specialty}
            </h2>

            <p>Clinic: {service.clinic}</p>
            <p>Doctor: {service.doctorName}</p>
            <p>Fee: {service.price}</p>

            <button
              onClick={() => book(service)}
              className="bg-black text-white px-3 py-1 mt-2"
            >
              Book
            </button>
          </div>
        ))}

      </div>
      {msg && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 12, zIndex: 10000, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>{msg}</div>}
    </div>
  );
}