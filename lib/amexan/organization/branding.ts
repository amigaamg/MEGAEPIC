export interface OrganizationBrand {
  orgId: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  headerTemplate: string
  footerTemplate: string
  watermark?: string
  legalDisclaimer: string
  signatureBlock: string
}

const brandStore = new Map<string, OrganizationBrand>()

export function saveBrand(orgId: string, brand: OrganizationBrand): void {
  brandStore.set(orgId, { ...brand, orgId })
}

export function getBrand(orgId: string): OrganizationBrand | undefined {
  return brandStore.get(orgId)
}

export function applyBranding(orgId: string, document: { type: string; content: string }): { header: string; footer: string; watermarked: string; signature: string } {
  const brand = brandStore.get(orgId)
  if (!brand) return { header: '', footer: '', watermarked: '', signature: '' }
  const header = brand.headerTemplate.replace('{logo}', brand.logo ?? '').replace('{orgId}', orgId)
  const footer = brand.footerTemplate + '\n' + brand.legalDisclaimer
  const watermarked = brand.watermark ? `${document.content}\n\n[Watermark: ${brand.watermark}]` : document.content
  return { header, footer, watermarked, signature: brand.signatureBlock }
}

export function defaultBrand(orgId: string, orgName: string): OrganizationBrand {
  return {
    orgId,
    primaryColor: '#2F80ED',
    secondaryColor: '#1A5CC7',
    headerTemplate: `--- ${orgName} ---`,
    footerTemplate: `--- End of Document --- ${orgName} | Confidential`,
    legalDisclaimer: 'This document contains confidential patient information.',
    signatureBlock: `Signed on behalf of ${orgName}`,
  }
}
