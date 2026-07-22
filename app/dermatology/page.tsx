'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function DermatologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 32, active: 20, critical: 2, followUp: 10, newThisWeek: 6, mortality: '0.3%' }
  const patients = [
    { name: 'Grace Wanjiku', age: 35, gender: 'F', diagnosis: 'Steven-Johnson syndrome', status: 'critical', bed: 'ICU-5' },
    { name: 'James Mutua', age: 55, gender: 'M', diagnosis: 'Psoriasis flare', status: 'active', bed: 'Ward 10A' },
    { name: 'Nancy Wambui', age: 28, gender: 'F', diagnosis: 'Eczema severe', status: 'active', bed: 'Ward 10A' },
    { name: 'Sammy Kioko', age: 48, gender: 'M', diagnosis: 'Bullous pemphigoid', status: 'active', bed: 'Ward 10B' },
    { name: 'Hannah Chebet', age: 62, gender: 'F', diagnosis: 'Skin cancer', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Dermatology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#EC4899" conditions={['Psoriasis', 'Eczema', 'Acne', 'Skin infections', 'Bullous disease', 'Melanoma', 'Urticaria']} meds={['Topical steroids', 'Methotrexate', 'Biologics', 'Antihistamines', 'Isotretinoin', 'Flucloxacillin']} indicators={['Skin cancer screening', 'Biopsy for suspicious lesions', 'PUVA/UVB access', 'Patch testing', 'Wound care protocol']} />
}
