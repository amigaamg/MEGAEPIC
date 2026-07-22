'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function PediatricsIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 56, active: 40, critical: 6, followUp: 10, newThisWeek: 14, mortality: '1.8%' }
  const patients = [
    { name: 'Baby A. Mwangi', age: '2d', gender: 'M', diagnosis: 'Neonatal sepsis', status: 'critical', bed: 'NICU-1' },
    { name: 'Baby B. Kamau', age: '5d', gender: 'F', diagnosis: 'Neonatal jaundice', status: 'active', bed: 'NICU-2' },
    { name: 'Kevin Omondi', age: '3yr', gender: 'M', diagnosis: 'Severe pneumonia', status: 'active', bed: 'Peds Ward' },
    { name: 'Grace Wanjiru', age: '6yr', gender: 'F', diagnosis: 'Cerebral malaria', status: 'critical', bed: 'Peds ICU' },
    { name: 'Samuel Kiprop', age: '10yr', gender: 'M', diagnosis: 'Acute asthma', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Pediatrics Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#F43F5E" conditions={['Neonatal sepsis', 'Pneumonia', 'Malaria', 'Malnutrition', 'Congenital heart disease', 'Asthma', 'Leukemia']} meds={['Ampicillin Gentamicin', 'Amoxicillin', 'Artemether-Lumefantrine', 'ORS', 'IVIG', 'Salbutamol']} indicators={['Immunization coverage', 'IMCI compliance', 'Growth monitoring', 'Exclusive breastfeeding rate', 'Under-5 mortality audit']} />
}
