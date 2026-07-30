'use client'

import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import {
  type AmxpId,
  type PatientIdentity,
  type PatientVerificationLevel,
  generateAmxpId,
  isValidAmxpId,
} from './types'

export async function linkFirebaseUidToAmxpId(params: {
  amxpId: AmxpId
  firebaseUid: string
  email?: string
  phone?: string
}): Promise<void> {
  const uid = params.firebaseUid

  const identity: PatientIdentity = {
    amxpId: params.amxpId,
    human: {
      fullName: '', givenName: '', familyName: '',
      dateOfBirth: '', sex: 'undisclosed', nationality: '',
      nationalId: '', phone: params.phone || '', email: params.email || '',
      address: { country: 'Kenya', county: '' },
      preferredLanguage: 'en', interpreters: [],
    },
    authentication: {
      methods: ['email'], passwordEnabled: true,
      passkeyEnabled: false, biometricEnabled: false, mfaEnabled: false,
      sessions: [], devices: [],
    },
    verification: {
      level: 1, emailVerified: !!params.email, phoneVerified: !!params.phone,
      governmentVerified: false, facilityVerified: false,
      verificationDocuments: [],
    },
    clinical: [],
    trust: { score: 15, factors: [
      { name: 'basic_verified', weight: 10, score: 10 },
      { name: 'email_verified', weight: 5, score: params.email ? 5 : 0 },
    ], lastComputed: Date.now() },
    linkedAccounts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  await setDoc(doc(db, 'patient_identities', params.amxpId), identity)
  await updateDoc(doc(db, 'users', uid), {
    amxpId: params.amxpId,
    universalId: params.amxpId,
    verificationLevel: 1,
    updatedAt: serverTimestamp(),
  })
}

export async function getAmxpIdForFirebaseUid(firebaseUid: string): Promise<AmxpId | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUid))
    const data = userDoc.data()
    const amxpId = data?.amxpId || data?.universalId
    if (amxpId && isValidAmxpId(amxpId)) return amxpId as AmxpId

    const id = generateAmxpId('patient')
    await updateDoc(doc(db, 'users', firebaseUid), {
      amxpId: id,
      universalId: id,
      updatedAt: serverTimestamp(),
    })
    return id
  } catch {
    return generateAmxpId('patient')
  }
}

export async function ensureAmxpIdForCurrentUser(): Promise<AmxpId | null> {
  const user = auth.currentUser
  if (!user) return null
  return getAmxpIdForFirebaseUid(user.uid)
}
