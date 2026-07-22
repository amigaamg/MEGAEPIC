'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Heart } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function CardiologyIC() {
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')
  const stats = { total: 48, active: 32, critical: 5, followUp: 11, newThisWeek: 7, mortality: '3.2%' }
  const patients = [
    { name: 'John Mwangi', age: 65, diagnosis: 'Acute MI', status: 'critical', bed: 'CCU-1' },
    { name: 'Grace Kamau', age: 58, diagnosis: 'Heart failure', status: 'active', bed: 'Ward 4A' },
    { name: 'Peter Ochieng', age: 72, diagnosis: 'Atrial fibrillation', status: 'active', bed: 'Ward 4B' },
    { name: 'Ann Wanjiku', age: 45, diagnosis: 'Hypertensive urgency', status: 'active', bed: 'Ward 4A' },
    { name: 'David Kiprop', age: 68, diagnosis: 'Stable angina', status: 'follow_up', bed: 'OPD' },
  ]
  const filtered = search ? patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : patients
  return <ICLayout title="Cardiology Intelligence Center" icon={<Heart size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={filtered} color="#EF4444" conditions={['ACS', 'Heart failure', 'Arrhythmia', 'Valvular disease', 'Hypertension', 'CAD']} meds={['Aspirin', 'Atorvastatin', 'Metoprolol', 'Lisinopril', 'Clopidogrel', 'Furosemide']} indicators={['Door-to-balloon <90min', 'ACEi/ARB in HF', 'Statin post-MI', 'Anticoag in AF', 'BP control <140/90']} />
}
