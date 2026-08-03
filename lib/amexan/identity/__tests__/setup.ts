import { beforeEach } from 'vitest'
import { UniversalIdentityEngine } from '@/lib/amexan/identity/identity-engine'
import { UniversalProfileEngine } from '@/lib/amexan/identity/profile-engine'
import { UniversalMembershipEngine } from '@/lib/amexan/identity/membership-engine'
import { clearSessionStore } from '@/lib/amexan/identity/session'
import { clearVerificationStore } from '@/lib/amexan/identity/verification'
import { clearEvents } from '@/lib/amexan/identity/audit'
import { clearSignatures } from '@/lib/amexan/identity/digital-signature'
import { InvitationEngine } from '@/lib/amexan/identity/invitation'
import { OrganizationJoinEngine } from '@/lib/amexan/identity/join-organization'
import { clearUserStore } from '@/lib/amexan/identity/auth'

beforeEach(() => {
  UniversalIdentityEngine.clearStore()
  UniversalProfileEngine.clearStore()
  UniversalMembershipEngine.clearStore()
  clearSessionStore()
  clearVerificationStore()
  clearEvents(0)
  clearSignatures()
  InvitationEngine.clearStore()
  OrganizationJoinEngine.clearStore()
  clearUserStore()
})