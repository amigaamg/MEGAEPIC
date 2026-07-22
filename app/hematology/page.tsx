'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function HematologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 28, active: 18, critical: 4, followUp: 6, newThisWeek: 3, mortality: '4.2%' }
  const patients = [
    { name: 'Kevin Mwangi', age: 35, gender: 'M', diagnosis: 'Sickle cell crisis', status: 'critical', bed: 'Ward 9A' },
    { name: 'Faith Wairimu', age: 28, gender: 'F', diagnosis: 'Acute leukemia', status: 'active', bed: 'Oncology' },
    { name: 'Joseph Kamau', age: 62, gender: 'M', diagnosis: 'Multiple myeloma', status: 'active', bed: 'Ward 9A' },
    { name: 'Sarah Muthoni', age: 45, gender: 'F', diagnosis: 'ITP', status: 'active', bed: 'Ward 9B' },
    { name: 'Daniel Njoroge', age: 50, gender: 'M', diagnosis: 'Hemophilia A', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Hematology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#EF4444" conditions={['Anemia', 'Leukemia', 'Lymphoma', 'Multiple myeloma', 'Sickle cell', 'Hemophilia', 'ITP']} meds={['Hydroxycarbamide', 'Imatinib', 'Lenalidomide', 'Rituximab', 'Factor VIII', 'IVIG']} indicators={['New anemia evaluation', 'Sickle cell complication screening', 'Transfusion threshold 7', 'VTE prophylaxis', 'Iron studies panel']} />
}
