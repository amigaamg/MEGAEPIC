'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateAmxpId } from '@/lib/amexan/patient-constitution/types'
import {
  type AmxpId,
  type JourneyObject,
  type PatientDashboardConfig,
} from '@/lib/amexan/patient-constitution/types'
import {
  generateWelcomeJourneys,
  buildPatientDashboard,
} from '@/lib/amexan/patient-constitution/journey'
import { getAmxpIdForFirebaseUid } from '@/lib/amexan/patient-constitution/amxp-bridge'

export function usePatientJourneys(params: {
  name: string
  sex?: string
  dateOfBirth?: string
  conditions?: string[]
}): {
  journeys: JourneyObject[]
  dashboardConfig: PatientDashboardConfig | null
  loading: boolean
} {
  const [journeys, setJourneys] = useState<JourneyObject[]>([])
  const [dashboardConfig, setDashboardConfig] = useState<PatientDashboardConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const user = auth.currentUser
      if (!user) { setLoading(false); return }

      const amxpId = (await getAmxpIdForFirebaseUid(user.uid)) || generateAmxpId('patient')
      const welcomeJourneys = generateWelcomeJourneys({
        sex: params.sex || 'undisclosed',
        dateOfBirth: params.dateOfBirth || '',
        conditions: params.conditions || [],
      })

      setJourneys(welcomeJourneys)

      const config = buildPatientDashboard({
        amxpId,
        fullName: params.name,
        journeys: welcomeJourneys,
        verificationLevel: 1,
      })
      setDashboardConfig(config)
      setLoading(false)
    }
    init()
  }, [params.name, params.sex, params.dateOfBirth, params.conditions])

  return { journeys, dashboardConfig, loading }
}
