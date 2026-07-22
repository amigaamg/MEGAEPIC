'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function NephrologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 42, active: 28, critical: 6, followUp: 8, newThisWeek: 4, mortality: '5.8%' }
  const patients = [
    { name: 'John Mwangi', age: 60, gender: 'M', diagnosis: 'CKD Stage 5', status: 'active', bed: 'Dialysis' },
    { name: 'Grace Kamau', age: 45, gender: 'F', diagnosis: 'AKI (sepsis)', status: 'critical', bed: 'ICU-3' },
    { name: 'Peter Ochieng', age: 68, gender: 'M', diagnosis: 'ESRD on HD', status: 'active', bed: 'Dialysis' },
    { name: 'Ann Wanjiku', age: 52, gender: 'F', diagnosis: 'Glomerulonephritis', status: 'active', bed: 'Ward 6A' },
    { name: 'David Kiprop', age: 72, gender: 'M', diagnosis: 'CKD Stage 4', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Nephrology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#8B5CF6" conditions={['CKD', 'AKI', 'Glomerulonephritis', 'ESRD', 'UTI', 'Nephrotic syndrome']} meds={['ACEi/ARB', 'Furosemide', 'ESA', 'Calcimimetics', 'Phosphate binders', 'Sodium bicarbonate']} indicators={['eGFR monitoring', 'Proteinuria screening', 'BP <130/80', 'AVF creation before HD', 'Transplant referral']} />
}
