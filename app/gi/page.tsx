'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function GastroenterologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 38, active: 24, critical: 3, followUp: 11, newThisWeek: 5, mortality: '2.8%' }
  const patients = [
    { name: 'Patrick Mwangi', age: 45, gender: 'M', diagnosis: 'Upper GI bleed', status: 'critical', bed: 'ICU-1' },
    { name: 'Catherine Nyambura', age: 38, gender: 'F', diagnosis: 'Crohn disease flare', status: 'active', bed: 'Ward 3A' },
    { name: 'George Kamau', age: 60, gender: 'M', diagnosis: 'Acute pancreatitis', status: 'active', bed: 'Ward 3B' },
    { name: 'Mary Wanjiru', age: 55, gender: 'F', diagnosis: 'Colorectal cancer', status: 'active', bed: 'Ward 3A' },
    { name: 'Isaac Kiprop', age: 48, gender: 'M', diagnosis: 'GERD/Barrett', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Gastroenterology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#10B981" conditions={['GERD', 'Peptic ulcer', 'IBD', 'Pancreatitis', 'GI bleed', 'Colorectal cancer', 'Hepatitis']} meds={['PPI', '5-ASA', 'Azathioprine', 'Infliximab', 'Octreotide', 'Terlipressin']} indicators={['Colonoscopy screening >50', 'H pylori test & treat', 'IBD biologic access', 'Variceal bleed prophylaxis', 'Nutritional screening']} />
}
