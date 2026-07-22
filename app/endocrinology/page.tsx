'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function EndocrinologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 54, active: 35, critical: 3, followUp: 16, newThisWeek: 6, mortality: '1.5%' }
  const patients = [
    { name: 'Grace Kamau', age: 42, gender: 'F', diagnosis: 'DKA (T1DM)', status: 'critical', bed: 'ICU-2' },
    { name: 'John Mwangi', age: 58, gender: 'M', diagnosis: 'T2DM uncontrolled', status: 'active', bed: 'Ward 7A' },
    { name: 'Sarah Chebet', age: 35, gender: 'F', diagnosis: 'Hyperthyroidism', status: 'active', bed: 'Ward 7A' },
    { name: 'Samuel Kioko', age: 65, gender: 'M', diagnosis: 'Cushing syndrome', status: 'active', bed: 'Ward 7B' },
    { name: 'Hannah Jerono', age: 50, gender: 'F', diagnosis: 'Hypothyroidism', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Endocrinology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#F97316" conditions={['T1DM', 'T2DM', 'Hyperthyroidism', 'Hypothyroidism', 'Cushing', 'Addison', 'Pituitary tumors']} meds={['Insulin', 'Metformin', 'Methimazole', 'Levothyroxine', 'Ketoconazole', 'Octreotide']} indicators={['HbA1c <7%', 'Annual eye exam', 'Foot screening', 'TSH monitoring', 'BMD screening']} />
}
