'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function PulmonologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 36, active: 22, critical: 4, followUp: 10, newThisWeek: 5, mortality: '4.1%' }
  const patients = [
    { name: 'Samuel Kioko', age: 58, gender: 'M', diagnosis: 'COPD exacerbation', status: 'active', bed: 'Ward 5A' },
    { name: 'Hannah Chebet', age: 42, gender: 'F', diagnosis: 'Asthma attack', status: 'active', bed: 'Ward 5A' },
    { name: 'Joseph Barasa', age: 65, gender: 'M', diagnosis: 'Pulmonary TB', status: 'active', bed: 'Isolation' },
    { name: 'Deborah Mutua', age: 55, gender: 'F', diagnosis: 'Bronchiectasis', status: 'critical', bed: 'HDU-2' },
    { name: 'Daniel Njenga', age: 70, gender: 'M', diagnosis: 'ILD', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Pulmonology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#14B8A6" conditions={['COPD', 'Asthma', 'Pneumonia', 'TB', 'ILD', 'Bronchiectasis', 'Pleural effusion']} meds={['Salbutamol', 'Fluticasone', 'Prednisolone', 'Theophylline', 'Rifampicin', 'N-acetylcysteine']} indicators={['Peak flow monitoring', 'Spirometry at diagnosis', 'Smoking cessation', 'LTOT assessment', 'Pulmonary rehab referral']} />
}
