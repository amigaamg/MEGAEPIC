// AMEXAN Universal Accessibility Engine
// Constitutional Principle: Accessibility is not a feature. It is the default.
// Spec: WCAG 2.2 AA, ARIA, Section 508, EN 301549, ISO 9241.
// 7 user profiles (low vision / blind / color blind / motor / hearing / cognitive / general).
// Contrast >= 4.5:1. Zoom to 200-300%. RTL/LTR. Translation + unit/date/time/currency locale engines.

export type AccessibilityProfile =
  | 'general'
  | 'lowVision'
  | 'blind'
  | 'colorBlind'
  | 'motor'
  | 'hearing'
  | 'cognitive';

export const accessibilityProfiles: AccessibilityProfile[] = [
  'general',
  'lowVision',
  'blind',
  'colorBlind',
  'motor',
  'hearing',
  'cognitive',
];

export interface ProfileRequirements {
  contrastRatioMin: number;
  fontSizeMultiplier: number;
  zoomMin: number;
  zoomMax: number;
  reduceMotion: boolean;
  preferSkeleton: boolean;
  touchTargetMin: number;
  requireFocusVisible: boolean;
  requireAriaLive: boolean;
  screenReaderOptimized: boolean;
  captionsRequired: boolean;
  visualAlternatives: boolean;
}

export const profileRequirements: Record<AccessibilityProfile, ProfileRequirements> = {
  general: {
    contrastRatioMin: 4.5,
    fontSizeMultiplier: 1,
    zoomMin: 200,
    zoomMax: 300,
    reduceMotion: false,
    preferSkeleton: false,
    touchTargetMin: 44,
    requireFocusVisible: true,
    requireAriaLive: false,
    screenReaderOptimized: false,
    captionsRequired: false,
    visualAlternatives: false,
  },
  lowVision: {
    contrastRatioMin: 7,
    fontSizeMultiplier: 1.5,
    zoomMin: 200,
    zoomMax: 300,
    reduceMotion: false,
    preferSkeleton: false,
    touchTargetMin: 48,
    requireFocusVisible: true,
    requireAriaLive: false,
    screenReaderOptimized: false,
    captionsRequired: false,
    visualAlternatives: false,
  },
  blind: {
    contrastRatioMin: 4.5,
    fontSizeMultiplier: 1,
    zoomMin: 200,
    zoomMax: 300,
    reduceMotion: true,
    preferSkeleton: false,
    touchTargetMin: 44,
    requireFocusVisible: true,
    requireAriaLive: true,
    screenReaderOptimized: true,
    captionsRequired: false,
    visualAlternatives: true,
  },
  colorBlind: {
    contrastRatioMin: 4.5,
    fontSizeMultiplier: 1,
    zoomMin: 200,
    zoomMax: 300,
    reduceMotion: false,
    preferSkeleton: false,
    touchTargetMin: 44,
    requireFocusVisible: true,
    requireAriaLive: false,
    screenReaderOptimized: false,
    captionsRequired: false,
    visualAlternatives: true,
  },
  motor: {
    contrastRatioMin: 4.5,
    fontSizeMultiplier: 1,
    zoomMin: 200,
    zoomMax: 300,
    reduceMotion: false,
    preferSkeleton: false,
    touchTargetMin: 64,
    requireFocusVisible: true,
    requireAriaLive: false,
    screenReaderOptimized: false,
    captionsRequired: false,
    visualAlternatives: false,
  },
  hearing: {
    contrastRatioMin: 4.5,
    fontSizeMultiplier: 1,
    zoomMin: 200,
    zoomMax: 300,
    reduceMotion: false,
    preferSkeleton: false,
    touchTargetMin: 44,
    requireFocusVisible: true,
    requireAriaLive: false,
    screenReaderOptimized: false,
    captionsRequired: true,
    visualAlternatives: false,
  },
  cognitive: {
    contrastRatioMin: 4.5,
    fontSizeMultiplier: 1.25,
    zoomMin: 200,
    zoomMax: 300,
    reduceMotion: true,
    preferSkeleton: true,
    touchTargetMin: 48,
    requireFocusVisible: true,
    requireAriaLive: true,
    screenReaderOptimized: false,
    captionsRequired: true,
    visualAlternatives: true,
  },
};

export type LocaleDirection = 'ltr' | 'rtl';

export interface LocaleEngine {
  direction: LocaleDirection;
  language: string;
  region: string;
  formatDate: (date: Date | string | number) => string;
  formatTime: (date: Date | string | number) => string;
  formatDateTime: (date: Date | string | number) => string;
  formatCurrency: (amount: number, currency: string) => string;
  formatNumber: (value: number) => string;
  translate: (key: string) => string;
}

export interface AccessibilityEngineOptions {
  profile?: AccessibilityProfile;
  direction?: LocaleDirection;
  onViolation?: (message: string) => void;
}

const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'yi'];

export const isRtlLanguage = (lang: string): boolean => {
  const base = lang.split('-')[0].toLowerCase();
  return rtlLanguages.includes(base);
};

export class AccessibilityEngine {
  private static instance: AccessibilityEngine;
  private options: AccessibilityEngineOptions;
  private translations: Map<string, string> = new Map();

  constructor(options: AccessibilityEngineOptions = {}) {
    if (AccessibilityEngine.instance) {
      return AccessibilityEngine.instance;
    }
    this.options = options;
    AccessibilityEngine.instance = this;
  }

  public setOptions = (options: AccessibilityEngineOptions): void => {
    this.options = { ...this.options, ...options };
  };

  public getProfile = (): AccessibilityProfile => {
    return this.options.profile || 'general';
  };

  public getRequirements = (): ProfileRequirements => {
    return profileRequirements[this.getProfile()];
  };

  public assertContrast = (foreground: string, background: string): boolean => {
    const ratio = this.contrastRatio(foreground, background);
    if (ratio < this.getRequirements().contrastRatioMin) {
      this.options.onViolation?.(
        `[Accessibility] Contrast ${ratio.toFixed(2)}:1 below minimum ${this.getRequirements().contrastRatioMin}:1`,
      );
      return false;
    }
    return true;
  };

  public contrastRatio = (foreground: string, background: string): number => {
    const lum1 = this.relativeLuminance(foreground);
    const lum2 = this.relativeLuminance(background);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  private relativeLuminance = (hex: string): number => {
    const { r, g, b } = this.parseHex(hex);
    const [lr, lg, lb] = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };

  private parseHex = (hex: string): { r: number; g: number; b: number } => {
    let h = hex.replace('#', '').trim();
    if (h.length === 3) {
      h = h.split('').map((c) => c + c).join('');
    }
    if (h.length === 4) {
      h = h.split('').map((c) => c + c).join('');
      h = h.slice(0, 6);
    }
    const int = parseInt(h.slice(0, 6), 16);
    if (Number.isNaN(int)) return { r: 255, g: 255, b: 255 };
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255,
    };
  };

  public getDirection = (): LocaleDirection => {
    return this.options.direction || 'ltr';
  };

  public getTouchTargetMin = (): number => {
    return this.getRequirements().touchTargetMin;
  };

  public registerTranslation = (key: string, value: string): void => {
    this.translations.set(key, value);
  };

  public translate = (key: string): string => {
    return this.translations.get(key) || key;
  };

  public static getInstance(options?: AccessibilityEngineOptions): AccessibilityEngine {
    if (!AccessibilityEngine.instance && options) {
      return new AccessibilityEngine(options);
    }
    return AccessibilityEngine.instance;
  }

  public static reset(): void {
    AccessibilityEngine.instance = undefined as unknown as AccessibilityEngine;
  }
}

export const accessibilityEngine = AccessibilityEngine.getInstance();
export default accessibilityEngine;
