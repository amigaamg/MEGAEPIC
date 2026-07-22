'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function PalliativeIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 22, active: 15, critical: 4, followUp: 3, newThisWeek: 5, mortality: '--' }
  const patients = [
    { name: 'Grace Muthoni', age: 62, gender: 'F', diagnosis: 'Metastatic breast cancer', status: 'active', bed: 'Hospice' },
    { name: 'John Mwangi', age: 70, gender: 'M', diagnosis: 'ESRD (refusing dialysis)', status: 'active', bed: 'Hospice' },
    { name: 'Esther Wanjiru', age: 58, gender: 'F', diagnosis: 'End-stage COPD', status: 'critical', bed: 'Hospice' },
    { name: 'Samuel Kioko', age: 65, gender: 'M', diagnosis: 'Motor neuron disease', status: 'active', bed: 'Home Care' },
    { name: 'Nancy Wambui', age: 55, gender: 'F', diagnosis: 'Advanced liver failure', status: 'follow_up', bed: 'Home Care' },
  ]
  return <ICLayout title="Palliative Care Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#6B7280" conditions={['Advanced cancer', 'End-stage organ failure', 'Neurodegenerative', 'HIV advanced', 'Pediatric palliative', 'Geriatric frailty']} meds={['Morphine', 'Oxycodone', 'Haloperidol', 'Midazolam', 'Hyoscine', 'Lactulose']} indicators={['Pain score documented', 'Advance care directive', 'Bereavement support', 'Symptom control plan', 'Family conference within 48hr']} />
}
