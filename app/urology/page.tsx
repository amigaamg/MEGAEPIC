'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function UrologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 34, active: 22, critical: 4, followUp: 8, newThisWeek: 5, mortality: '1.8%' }
  const patients = [
    { name: 'James Karanja', age: 68, gender: 'M', diagnosis: 'Benign prostatic hyperplasia', status: 'active', bed: 'Ward 13A' },
    { name: 'Peter Kamau', age: 55, gender: 'M', diagnosis: 'Urolithiasis', status: 'active', bed: 'Ward 13A' },
    { name: 'Samuel Njoroge', age: 60, gender: 'M', diagnosis: 'Bladder cancer', status: 'critical', bed: 'Ward 13B' },
    { name: 'Francis Omondi', age: 70, gender: 'M', diagnosis: 'Prostate cancer', status: 'active', bed: 'Ward 13B' },
    { name: 'Daniel Kiprop', age: 42, gender: 'M', diagnosis: 'UTI complicated', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Urology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#A855F7" conditions={['BPH', 'Urolithiasis', 'UTI', 'Bladder cancer', 'Prostate cancer', 'Incontinence', 'Stricture']} meds={['Tamsulosin', 'Finasteride', 'Antibiotics', 'Antimuscarinics', 'GnRH agonists', '5-alpha reductase']} indicators={['PSA screening protocol', 'Stone composition analysis', 'Urosepsis prevention', 'TURP outcomes', 'Catheter-associated UTI rate']} />
}
