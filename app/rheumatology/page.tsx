'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function RheumatologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 26, active: 16, critical: 2, followUp: 8, newThisWeek: 4, mortality: '1.5%' }
  const patients = [
    { name: 'Ann Wanjiku', age: 38, gender: 'F', diagnosis: 'SLE flare', status: 'critical', bed: 'Ward 15A' },
    { name: 'John Kiprop', age: 50, gender: 'M', diagnosis: 'Rheumatoid arthritis', status: 'active', bed: 'Ward 15A' },
    { name: 'Grace Kamau', age: 45, gender: 'F', diagnosis: 'Systemic sclerosis', status: 'active', bed: 'Ward 15B' },
    { name: 'Samuel Mutua', age: 55, gender: 'M', diagnosis: 'Gout tophaceous', status: 'follow_up', bed: 'OPD' },
    { name: 'Nancy Chebet', age: 32, gender: 'F', diagnosis: 'Ankylosing spondylitis', status: 'active', bed: 'Ward 15B' },
  ]
  return <ICLayout title="Rheumatology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#E11D48" conditions={['Rheumatoid arthritis', 'SLE', 'Gout', 'Osteoarthritis', 'Spondyloarthritis', 'Scleroderma', 'Vasculitis']} meds={['Methotrexate', 'Prednisolone', 'Hydroxychloroquine', 'Biologics', 'Allopurinol', 'Colchicine']} indicators={['DAS28 scoring', 'ANA/EULAR screening', 'Biologic access', 'Steroid sparing', 'Joint preservation protocol']} />
}
