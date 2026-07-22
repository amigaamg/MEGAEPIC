'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function InfectiousDiseaseIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 52, active: 38, critical: 8, followUp: 6, newThisWeek: 12, mortality: '3.5%' }
  const patients = [
    { name: 'Tom Omondi', age: 32, gender: 'M', diagnosis: 'TB meningitis', status: 'critical', bed: 'ICU-4' },
    { name: 'Lucy Chebet', age: 28, gender: 'F', diagnosis: 'Cerebral malaria', status: 'critical', bed: 'ICU-4' },
    { name: 'John Mwangi', age: 45, gender: 'M', diagnosis: 'Cryptococcal meningitis', status: 'active', bed: 'Isolation' },
    { name: 'Grace Wanjiru', age: 38, gender: 'F', diagnosis: 'Sepsis', status: 'active', bed: 'Ward 2A' },
    { name: 'Peter Kiplagat', age: 60, gender: 'M', diagnosis: 'Cellulitis', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Infectious Disease Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#6366F1" conditions={['TB', 'Malaria', 'HIV', 'Sepsis', 'Cryptococcosis', 'Meningitis', 'Pneumonia']} meds={['Rifampicin', 'Artemether-Lumefantrine', 'Fluconazole', 'Ceftriaxone', 'Vancomycin', 'Doxycycline']} indicators={['TB GeneXpert first-line', 'Malaria RDT', 'Blood culture before ABx', 'HIV test every admission', 'Infection control compliance']} />
}
