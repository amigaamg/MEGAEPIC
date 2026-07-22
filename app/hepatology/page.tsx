'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity } from 'lucide-react'
import { ICLayout } from '@/components/ICLayout'

export default function HepatologyIC() {
  const [tab, setTab] = useState('overview'); const [search, setSearch] = useState('')
  const stats = { total: 44, active: 30, critical: 7, followUp: 7, newThisWeek: 8, mortality: '6.5%' }
  const patients = [
    { name: 'James Kilonzo', age: 48, gender: 'M', diagnosis: 'Cirrhosis decompensated', status: 'critical', bed: 'Ward 8A' },
    { name: 'Nancy Munyi', age: 42, gender: 'F', diagnosis: 'Hepatitis B flare', status: 'active', bed: 'Ward 8A' },
    { name: 'Samuel Mutua', age: 55, gender: 'M', diagnosis: 'Alcoholic hepatitis', status: 'active', bed: 'Ward 8B' },
    { name: 'Grace Wambui', age: 60, gender: 'F', diagnosis: 'HCC', status: 'critical', bed: 'Ward 8B' },
    { name: 'Patrick Omondi', age: 38, gender: 'M', diagnosis: 'NAFLD', status: 'follow_up', bed: 'OPD' },
  ]
  return <ICLayout title="Hepatology Intelligence Center" icon={<Activity size={20} color={C.sky} />} stats={stats} tab={tab} setTab={setTab} search={search} setSearch={setSearch} patients={patients} color="#F59E0B" conditions={['Hepatitis B', 'Hepatitis C', 'Cirrhosis', 'HCC', 'NAFLD', 'Alcoholic hepatitis', 'Acute liver failure']} meds={['Tenofovir', 'Entecavir', 'NS5A inhibitors', 'Diuretics', 'Lactulose', 'Rifaximin']} indicators={['HBV screening high-risk', 'Cirrhosis surveillance US', 'HCC screening 6-monthly', 'Alcohol cessation', 'MELD scoring']} />
}
