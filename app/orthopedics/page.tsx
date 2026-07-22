'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function OrthopedicsIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 46, active: 30, critical: 5, followUp: 11, newThisWeek: 8, mortality: '1.2%' }
  const patients = [
    { name: 'Joseph Mwangi', age: 45, gender: 'M', diagnosis: 'Multiple fractures (MVA)', status: 'critical', bed: 'Ward 14A' },
    { name: 'Grace Wanjiru', age: 72, gender: 'F', diagnosis: 'Neck of femur #', status: 'active', bed: 'Ward 14A' },
    { name: 'Samuel Kiplagat', age: 38, gender: 'M', diagnosis: 'Tibial plateau #', status: 'active', bed: 'Ward 14B' },
    { name: 'Peter Omondi', age: 55, gender: 'M', diagnosis: 'Lumbar spondylosis', status: 'active', bed: 'Ward 14B' },
    { name: 'Nancy Wambui', age: 60, gender: 'F', diagnosis: 'Osteomyelitis', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Orthopedics Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#059669" conditions={['Fractures', 'Osteoarthritis', 'Trauma', 'Osteomyelitis', 'Spondylosis', 'AVN', 'Prosthetic infection']} meds={['NSAIDs', 'Tramadol', 'Enoxaparin', 'Ceftriaxone', 'Gentamicin', 'Calcium + Vit D']} indicators={['Time to surgery <48hr', 'DVT prophylaxis', 'Early mobilization', 'Antibiotic timing', 'Implant registry']} />
}
