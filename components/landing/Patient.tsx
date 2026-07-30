'use client'
import { motion } from 'framer-motion'
import { S } from '@/components/landing/config'
import { C } from '@/lib/colors'
import { Heart, FileText, Calendar, FlaskConical, Pill, Users, BookOpen, Activity, UserCheck, Smartphone, Watch, Syringe, CreditCard, MessageSquare } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const FEATURES = [
  { icon: <FileText size={20} />, title: 'My Health Record', desc: 'Complete longitudinal health record — visits, diagnoses, medications, and procedures at your fingertips.' },
  { icon: <Calendar size={20} />, title: 'Appointments', desc: 'Book, reschedule, and manage appointments with your care providers across all facilities.' },
  { icon: <FlaskConical size={20} />, title: 'Lab Results', desc: 'View lab reports as soon as they are ready with clear reference ranges and trend charts.' },
  { icon: <Pill size={20} />, title: 'Medications', desc: 'Active medication list, dosage schedules, refill requests, and drug interaction alerts.' },
  { icon: <Users size={20} />, title: 'Care Team', desc: 'See your entire care team — doctors, nurses, specialists — and communicate directly.' },
  { icon: <BookOpen size={20} />, title: 'Health Education', desc: 'Personalized educational resources, condition guides, and preventive care recommendations.' },
  { icon: <Activity size={20} />, title: 'Remote Monitoring', desc: 'Share vitals from home — blood pressure, glucose, weight — with automatic provider alerts.' },
  { icon: <UserCheck size={20} />, title: 'Family Access', desc: 'Authorize family members to view records, manage appointments, and communicate on your behalf.' },
  { icon: <Smartphone size={20} />, title: 'Telemedicine', desc: 'Video consultations with your providers, e-prescriptions, and virtual follow-up care.' },
  { icon: <Watch size={20} />, title: 'Wearables', desc: 'Sync health data from Apple Watch, Fitbit, and other wearable devices to your record.' },
  { icon: <Syringe size={20} />, title: 'Vaccinations', desc: 'Immunization records, scheduled vaccines, and automated reminders for upcoming doses.' },
  { icon: <CreditCard size={20} />, title: 'Insurance & Payments', desc: 'View insurance coverage, claim status, pay bills, and access digital receipts.' },
  { icon: <MessageSquare size={20} />, title: 'Secure Messaging', desc: 'HIPAA-compliant messaging with your care team — no more phone tag or voicemails.' },
]

const PHONE_MENU = ['Home', 'Records', 'Appts', 'Labs', 'Messages', 'More']

export default function Patient() {
  return (
    <section style={{ background: C.white }}>
      <div style={S.section}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTag}>
            <Heart size={14} /> For Patients
          </span>
          <h2 style={S.secH2}>Your Health, In Your Hands</h2>
          <p style={S.secP}>
            Empower patients with full access to their health information, seamless communication
            with their care team, and tools to manage their wellness journey.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
            }}
          >
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={itemAnim} style={{ ...S.card, padding: 20 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: C.skyLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.sky,
                  marginBottom: 10,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div style={{
            width: 280,
            margin: '0 auto',
            position: 'sticky' as const,
            top: 100,
          }}>
            <div style={{
              background: C.navy,
              borderRadius: 32,
              padding: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                background: C.white,
                borderRadius: 24,
                overflow: 'hidden',
              }}>
                <div style={{
                  background: C.sky,
                  padding: '16px 16px 12px',
                  color: C.white,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>9:41</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span style={{ fontSize: 12 }}>{'📶'}</span>
                      <span style={{ fontSize: 12 }}>{'🔋'}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Good morning</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Welcome back</div>
                </div>

                <div style={{ padding: 14 }}>
                  <div style={{
                    background: C.skyLight,
                    borderRadius: 10,
                    padding: '10px 12px',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <Heart size={16} style={{ color: C.sky }} />
                    <span style={{ fontSize: 12, color: C.navy, fontWeight: 500 }}>Your vitals look great!</span>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming</div>
                    <div style={{
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: 10,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Check-up</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>Tomorrow, 10:00 AM</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Results</div>
                    <div style={{ fontSize: 12, color: C.navy }}>Complete Blood Count</div>
                    <div style={{ fontSize: 11, color: C.green, fontWeight: 500 }}>Normal — 2 days ago</div>
                  </div>

                  <div style={{
                    background: C.skyLight,
                    borderRadius: 10,
                    padding: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 14,
                  }}>
                    <MessageSquare size={16} style={{ color: C.sky }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Dr. Kamau</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>Your lab results are ready</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  borderTop: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '8px 0',
                }}>
                  {PHONE_MENU.map((item) => (
                    <div key={item} style={{
                      fontSize: 10,
                      color: item === 'Home' ? C.sky : C.textLight,
                      fontWeight: item === 'Home' ? 600 : 400,
                      padding: '4px 6px',
                    }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
