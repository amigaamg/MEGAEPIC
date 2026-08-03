import { LicenseType } from './types'

const licenses: LicenseType[] = Object.values(LicenseType)

export function getLicenses(): LicenseType[] {
  return [...licenses]
}

export function getLicenseByName(name: string): LicenseType | undefined {
  return licenses.find(l => l === name)
}

export function getLicenseInfo(license: LicenseType): {
  name: string
  description: string
  restrictions: string
  commercialAllowed: boolean
  attributionRequired: boolean
  shareAlike: boolean
  patentGrant: boolean
  sublicense: boolean
} {
  switch (license) {
    case LicenseType.Free:
      return {
        name: 'Free License',
        description: 'Free to use, modify, and distribute without any restrictions',
        restrictions: 'None',
        commercialAllowed: true,
        attributionRequired: false,
        shareAlike: false,
        patentGrant: false,
        sublicense: true,
      }
    case LicenseType.Trial:
      return {
        name: 'Trial License',
        description: 'Free for evaluation and testing for a limited time',
        restrictions: 'Time-limited use only',
        commercialAllowed: false,
        attributionRequired: false,
        shareAlike: false,
        patentGrant: false,
        sublicense: false,
      }
    case LicenseType.Commercial:
      return {
        name: 'Commercial License',
        description: 'Paid license for commercial use',
        restrictions: 'Payment required, usage limits may apply',
        commercialAllowed: true,
        attributionRequired: true,
        shareAlike: true,
        patentGrant: true,
        sublicense: true,
      }
    case LicenseType.Enterprise:
      return {
        name: 'Enterprise License',
        description: 'Full commercial license with enterprise support',
        restrictions: 'High fees, extensive usage rights',
        commercialAllowed: true,
        attributionRequired: false,
        shareAlike: false,
        patentGrant: true,
        sublicense: true,
      }
    case LicenseType.OpenSource:
      return {
        name: 'Open Source License',
        description: 'Open source license with specific requirements',
        restrictions: 'Must keep source code open',
        commercialAllowed: true,
        attributionRequired: true,
        shareAlike: true,
        patentGrant: false,
        sublicense: true,
      }
    case LicenseType.Custom:
      return {
        name: 'Custom License',
        description: 'Custom license negotiated between parties',
        restrictions: 'Defined by negotiation',
        commercialAllowed: true,
        attributionRequired: true,
        shareAlike: true,
        patentGrant: true,
        sublicense: true,
      }
    default:
      return {
        name: 'Unknown',
        description: 'Unknown license type',
        restrictions: 'Undefined',
        commercialAllowed: false,
        attributionRequired: false,
        shareAlike: false,
        patentGrant: false,
        sublicense: false,
      }
  }
}

export function getLicenseRestrictions(license: LicenseType): string[] {
  const info = getLicenseInfo(license)
  return [
    info.restrictions,
    info.commercialAllowed ? 'Commercial use allowed' : 'Commercial use not allowed',
    info.attributionRequired ? 'Attribution required' : 'Attribution not required',
    info.shareAlike ? 'Share-alike required' : 'No share-alike requirement',
    info.patentGrant ? 'Patent grant included' : 'No patent grant',
    info.sublicense ? 'Sublicense allowed' : 'No sublicensing',
  ]
}

export function isLicenseCompatible(license1: LicenseType, license2: LicenseType): boolean {
  if (license1 === LicenseType.Custom || license2 === LicenseType.Custom) {
    return true
  }
  if (license1 === LicenseType.OpenSource && license2 === LicenseType.OpenSource) {
    return true
  }
  if (license1 === LicenseType.Free || license2 === LicenseType.Free) {
    return true
  }
  if ((license1 === LicenseType.Commercial || license1 === LicenseType.Enterprise) &&
      (license2 === LicenseType.Commercial || license2 === LicenseType.Enterprise)) {
    return true
  }
  return false
}

export default {
  getLicenses,
  getLicenseByName,
  getLicenseInfo,
  getLicenseRestrictions,
  isLicenseCompatible,
}

export const LicenseEngine = {
  getLicenses,
  getLicenseByName,
  getLicenseInfo,
  getLicenseRestrictions,
  isLicenseCompatible,
}