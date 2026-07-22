'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function ENTIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 30, active: 18, critical: 3, followUp: 9, newThisWeek: 5, mortality: '0.5%' }
  const patients = [
    { name: 'Charles Njoroge', age: 45, gender: 'M', diagnosis: 'Epistaxis (anterior)', status: 'active', bed: 'Ward 12A' },
    { name: 'Faith Wambugu', age: 38, gender: 'F', diagnosis: 'Peritonsillar abscess', status: 'active', bed: 'Ward 12A' },
    { name: 'Samuel Maina', age: 60, gender: 'M', diagnosis: 'Laryngeal tumor', status: 'critical', bed: 'Ward 12B' },
    { name: 'Grace Njoki', age: 28, gender: 'F', diagnosis: 'CSOM safe', status: 'follow_up', bed: 'OPD' },
    { name: 'Peter Kipyegon', age: 50, gender: 'M', diagnosis: 'Sleep apnea', status: 'active', bed: 'Ward 12B' },
  ]
  return <ICLayout title="ENT Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#8B5CF6" conditions={['CSOM', 'Hearing loss', 'Sinusitis', 'Tonsillitis', 'Epistaxis', 'Laryngeal cancer', 'Vertigo']} meds={['Amoxicillin', 'Fluticasone nasal', 'Antihistamines', 'Betahistine', 'Ciprofloxacin eardrop', 'Prednisolone']} indicators={['Hearing screening neonates', 'CSOM complication rate', 'Nasal packing protocol', 'Sudden hearing loss protocol', 'Tracheostomy care bundle']} />
}
