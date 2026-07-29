// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN WHITE-LABEL ENGINE
// Tenant-level branding, domain, customization — no medical changes.
// ═══════════════════════════════════════════════════════════════════════════════

import { Organization, TenantSettings } from './business-constitution';

export interface BrandingPackage {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: number;
  layout: 'sidebar' | 'topbar' | 'combined';
}

export interface LanguagePack {
  code: string;
  label: string;
  translations: Record<string, string>;
  isRTL: boolean;
}

export interface DomainConfig {
  domain: string;
  sslStatus: 'active' | 'pending' | 'expired';
  customLoginPage: boolean;
  allowedEmailDomains: string[];
}

export class WhiteLabelEngine {
  getBranding(settings: TenantSettings): BrandingPackage {
    return {
      logoUrl: settings.logoUrl,
      primaryColor: settings.primaryColor || '#2563eb',
      secondaryColor: settings.secondaryColor || '#4f46e5',
      accentColor: '#06b6d4',
      fontFamily: 'Inter',
      borderRadius: 8,
      layout: 'sidebar',
    };
  }

  getCSSVariables(branding: BrandingPackage): Record<string, string> {
    return {
      '--brand-primary': branding.primaryColor,
      '--brand-secondary': branding.secondaryColor,
      '--brand-accent': branding.accentColor,
      '--brand-font': branding.fontFamily,
      '--brand-radius': `${branding.borderRadius}px`,
    };
  }

  getDomainConfig(org: Organization): DomainConfig {
    return {
      domain: org.settings.domain || `${org.id.toLowerCase().replace(/[^a-z0-9]/g, '')}.amexan.com`,
      sslStatus: 'active',
      customLoginPage: !!org.settings.domain,
      allowedEmailDomains: [],
    };
  }

  getLanguagePack(code: string): LanguagePack | null {
    return SUPPORTED_LANGUAGES[code] || null;
  }

  getSupportedLanguages(): LanguagePack[] {
    return Object.values(SUPPORTED_LANGUAGES);
  }

  applyTenantOverrides(org: Organization, baseComponent: string): Record<string, unknown> {
    const branding = this.getBranding(org.settings);
    return {
      component: baseComponent,
      ...branding,
      density: org.settings.dateFormat === 'EU' ? 'compact' : 'comfortable',
      timezone: org.settings.timezone,
    };
  }

  getDateFormat(locale: string): string {
    const formats: Record<string, string> = {
      en: 'MM/DD/YYYY', en_KE: 'DD/MM/YYYY', fr: 'DD/MM/YYYY', sw: 'DD/MM/YYYY',
    };
    return formats[locale] || 'YYYY-MM-DD';
  }

  getCurrency(locale: string): string {
    const currencies: Record<string, string> = {
      en_KE: 'KES', en_US: 'USD', en_GB: 'GBP', en_NG: 'NGN', en_TZ: 'TZS', en_UG: 'UGX',
    };
    return currencies[locale] || 'USD';
  }
}

const SUPPORTED_LANGUAGES: Record<string, LanguagePack> = {
  en: { code: 'en', label: 'English', translations: {}, isRTL: false },
  sw: { code: 'sw', label: 'Kiswahili', translations: {}, isRTL: false },
  fr: { code: 'fr', label: 'Français', translations: {}, isRTL: false },
  es: { code: 'es', label: 'Español', translations: {}, isRTL: false },
  ar: { code: 'ar', label: 'العربية', translations: {}, isRTL: true },
  pt: { code: 'pt', label: 'Português', translations: {}, isRTL: false },
};

export const whiteLabelEngine = new WhiteLabelEngine();