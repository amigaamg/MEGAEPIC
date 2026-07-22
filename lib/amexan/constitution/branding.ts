import type { Organization, DocumentHeaderConfig, BrandingConfig } from './types';

export interface BrandedDocument {
  header: string;
  footer: string;
  watermark?: string;
  logo?: string;
  colors: { primary: string; secondary: string; accent: string };
}

export function applyBranding(org: Organization): BrandedDocument {
  const config = org.config;
  return {
    header: renderHeader(config.documentHeader),
    footer: renderFooter(config.documentHeader),
    logo: config.documentHeader.logoUrl,
    colors: {
      primary: config.branding.primaryColor,
      secondary: config.branding.secondaryColor,
      accent: config.branding.accentColor,
    },
  };
}

function renderHeader(header: DocumentHeaderConfig): string {
  return [
    header.logoUrl ? `<img src="${header.logoUrl}" alt="${header.facilityName}" />` : '',
    `<div><strong>${header.facilityName}</strong></div>`,
    header.facilityAddress ? `<div>${header.facilityAddress}</div>` : '',
    header.facilityPhone ? `<div>Tel: ${header.facilityPhone}</div>` : '',
    header.facilityEmail ? `<div>Email: ${header.facilityEmail}</div>` : '',
    header.mpesaPaybill ? `<div>M-Pesa Paybill: ${header.mpesaPaybill}</div>` : '',
  ].filter(Boolean).join('\n');
}

function renderFooter(header: DocumentHeaderConfig): string {
  return [
    header.footerTemplate || '--- END OF DOCUMENT ---',
    header.insurancePanels?.length ? `Insurance Panels: ${header.insurancePanels.join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

export interface BrandingPreview {
  logoUrl: string;
  facilityName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function getBrandingPreview(config: {
  header: Partial<DocumentHeaderConfig>;
  branding: Partial<BrandingConfig>;
}): BrandingPreview {
  return {
    logoUrl: config.header.logoUrl ?? '',
    facilityName: config.header.facilityName ?? 'Your Facility Name',
    primaryColor: config.branding.primaryColor ?? '#2F80ED',
    secondaryColor: config.branding.secondaryColor ?? '#1E40AF',
    accentColor: config.branding.accentColor ?? '#60A5FA',
  };
}
