'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function OphthalmologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 40, active: 25, critical: 5, followUp: 10, newThisWeek: 7, mortality: '0.1%' }
  const patients = [
    { name: 'Esther Wanjiru', age: 68, gender: 'F', diagnosis: 'Acute glaucoma', status: 'critical', bed: 'ER Ophth' },
    { name: 'Samuel Kiprop', age: 55, gender: 'M', diagnosis: 'Diabetic retinopathy', status: 'active', bed: 'OPD' },
    { name: 'Martha Maina', age: 42, gender: 'F', diagnosis: 'Corneal ulcer', status: 'active', bed: 'Ward 11A' },
    { name: 'Joseph Mwangi', age: 70, gender: 'M', diagnosis: 'Cataract', status: 'follow_up', bed: 'OPD' },
    { name: 'Dorothy Chepkoech', age: 35, gender: 'F', diagnosis: 'Uveitis', status: 'active', bed: 'Ward 11A' },
  ]
  return <ICLayout title="Ophthalmology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#0EA5E9" conditions={['Cataract', 'Glaucoma', 'Diabetic retinopathy', 'Corneal disease', 'Uveitis', 'Macular degeneration', 'Trauma']} meds={['Timolol', 'Latanoprost', 'Prednisolone eye drops', 'Antibiotic drops', 'Anti-VEGF', 'Lubricants']} indicators={['Cataract surgical coverage', 'Diabetic eye screening', 'Glaucoma detection rate', 'Trachoma elimination', 'Childhood blindness prevention']} />
}
