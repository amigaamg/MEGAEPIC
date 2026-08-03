// AMEXAN Responsive & Adaptive Computing Engine
// Constitutional Principle: Responsiveness is experience adaptation. Not CSS.
// Spec: 13 responsive profiles (nano 240-319 .. wall 2560+). No user-agent detection.
// Input detection: mouse / touch / stylus / keyboard / voice.

import { getCurrentBreakpoint, breakpointOrder } from './tokens/breakpoints';
import type { BreakpointName } from './tokens/breakpoints';

export type Breakpoint = BreakpointName;

export type InputMode = 'mouse' | 'touch' | 'stylus' | 'keyboard' | 'voice';

export type ResponsiveProfile = {
  name: string;
  label: string;
  min: number;
  max: number;
  devices: readonly string[];
};

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  profile: ResponsiveProfile;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  isHover: boolean;
  isCoarsePointer: boolean;
  inputMode: InputMode;
  orientation: 'portrait' | 'landscape';
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
  dpr: number;
  reducedMotion: boolean;
}

export interface ViewportEngineOptions {
  onBreakpointChange?: (breakpoint: Breakpoint) => void;
  onViewportChange?: (viewport: ViewportInfo) => void;
  onInputModeChange?: (inputMode: InputMode) => void;
}

export const responsiveProfiles: Record<Breakpoint, ResponsiveProfile> = {
  nano: { name: 'nano', label: 'Wearable / Micro Display', min: 240, max: 319, devices: ['Watches', 'Micro terminals'] },
  xs: { name: 'xs', label: 'Mobile Small', min: 320, max: 359, devices: ['iPhone SE', 'Very small phones'] },
  sm: { name: 'sm', label: 'Mobile Standard', min: 360, max: 479, devices: ['Modern iPhones', 'Pixel', 'Samsung'] },
  md: { name: 'md', label: 'Mobile Large', min: 480, max: 767, devices: ['Plus phones', 'Folded foldables'] },
  lg: { name: 'lg', label: 'Tablet', min: 768, max: 1023, devices: ['iPad', 'Android tablets', 'Medical tablets'] },
  xl: { name: 'xl', label: 'Laptop', min: 1024, max: 1279, devices: ['Hospital laptops'] },
  xl2: { name: 'xl2', label: 'Desktop', min: 1280, max: 1599, devices: ['Most desktops'] },
  xl3: { name: 'xl3', label: 'Large Desktop', min: 1600, max: 1919, devices: ['Clinic workstations'] },
  xl4: { name: 'xl4', label: 'Ultrawide', min: 1920, max: 2559, devices: ['Radiology', 'ICU dashboards', 'Hospital workstations'] },
  xl5: { name: 'xl5', label: 'Wall Display', min: 2560, max: 3199, devices: ['Command centers', 'Ward TVs'] },
  xl6: { name: 'xl6', label: 'Large Wall Display', min: 3200, max: 3839, devices: ['4K wall panels', 'Surgical suites'] },
  xl7: { name: 'xl7', label: '8K Display', min: 3840, max: 5119, devices: ['8K diagnostic panels'] },
  xl8: { name: 'xl8', label: 'Command Wall', min: 5120, max: Infinity, devices: ['Command centers'] },
};

const DEFAULT_VIEWPORT: ViewportInfo = {
  width: 1024,
  height: 768,
  breakpoint: 'xl',
  profile: responsiveProfiles.xl,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTouch: false,
  isHover: true,
  isCoarsePointer: false,
  inputMode: 'mouse',
  orientation: 'landscape',
  safeAreaTop: 0,
  safeAreaBottom: 0,
  safeAreaLeft: 0,
  safeAreaRight: 0,
  dpr: 1,
  reducedMotion: false,
};

export class ResponsiveEngine {
  private currentViewport: ViewportInfo;
  private listeners: ((viewport: ViewportInfo) => void)[] = [];
  private breakpointListeners: ((breakpoint: Breakpoint) => void)[] = [];
  private inputListeners: ((inputMode: InputMode) => void)[] = [];
  private options: ViewportEngineOptions;
  private inputMode: InputMode = 'mouse';

  constructor(options: ViewportEngineOptions = {}) {
    this.options = options;
    this.currentViewport = this.detectViewport();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('orientationchange', this.handleResize);
      window.addEventListener('pointerdown', this.handlePointer);
      window.addEventListener('keydown', this.handleKey);
      window.addEventListener('touchstart', this.handleTouch);
    }
  }

  private detectInputMode = (): InputMode => {
    if (typeof window === 'undefined') return 'mouse';
    const pointerType = window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';
    if (pointerType === 'coarse') {
      if (window.matchMedia('(any-pointer: coarse)').matches) return 'touch';
    }
    return 'mouse';
  };

  private handlePointer = (e: PointerEvent): void => {
    let mode: InputMode | null = null;
    if (e.pointerType === 'touch') mode = 'touch';
    else if (e.pointerType === 'pen') mode = 'stylus';
    else if (e.pointerType === 'mouse') mode = 'mouse';
    this.updateInputMode(mode);
  };

  private handleTouch = (): void => {
    this.updateInputMode('touch');
  };

  private handleKey = (e: KeyboardEvent): void => {
    this.updateInputMode('keyboard');
    void e;
  };

  private updateInputMode(mode: InputMode | null): void {
    if (!mode || mode === this.inputMode) return;
    this.inputMode = mode;
    this.currentViewport = { ...this.currentViewport, inputMode: mode };
    this.inputListeners.forEach((listener) => listener(mode));
    this.options.onInputModeChange?.(mode);
    this.listeners.forEach((listener) => listener(this.currentViewport));
  }

  private detectViewport = (): ViewportInfo => {
    if (typeof window === 'undefined') {
      return DEFAULT_VIEWPORT;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getCurrentBreakpoint(width);
    const profile = responsiveProfiles[breakpoint];
    const mqTouch = window.matchMedia('(hover: none)');
    const mqHover = window.matchMedia('(hover: hover)');
    const isTouch = mqTouch.matches;
    const isHover = mqHover.matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = ['nano', 'xs', 'sm', 'md'].includes(breakpoint);
    const isTablet = breakpoint === 'lg' || breakpoint === 'xl';
    const isDesktop = ['xl2', 'xl3', 'xl4', 'xl5', 'xl6', 'xl7', 'xl8'].includes(breakpoint);
    const orientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';

    return {
      width,
      height,
      breakpoint,
      profile,
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      isHover,
      isCoarsePointer,
      inputMode: this.inputMode,
      orientation,
      safeAreaTop: 0,
      safeAreaBottom: 0,
      safeAreaLeft: 0,
      safeAreaRight: 0,
      dpr: window.devicePixelRatio || 1,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  };

  private handleResize = (): void => {
    const newViewport = this.detectViewport();

    if (newViewport.breakpoint !== this.currentViewport.breakpoint) {
      this.breakpointListeners.forEach((listener) => listener(newViewport.breakpoint));
      this.options.onBreakpointChange?.(newViewport.breakpoint);
    }

    this.currentViewport = newViewport;
    this.listeners.forEach((listener) => listener(newViewport));
    this.options.onViewportChange?.(newViewport);
  };

  public getViewport = (): ViewportInfo => {
    return this.currentViewport;
  };

  public getBreakpoint = (): Breakpoint => {
    return this.currentViewport.breakpoint;
  };

  public getProfile = (): ResponsiveProfile => {
    return this.currentViewport.profile;
  };

  public getInputMode = (): InputMode => {
    return this.currentViewport.inputMode;
  };

  public isMobile = (): boolean => {
    return this.currentViewport.isMobile;
  };

  public isTablet = (): boolean => {
    return this.currentViewport.isTablet;
  };

  public isDesktop = (): boolean => {
    return this.currentViewport.isDesktop;
  };

  public isTouch = (): boolean => {
    return this.currentViewport.isTouch;
  };

  public isHover = (): boolean => {
    return this.currentViewport.isHover;
  };

  public atLeast = (bp: Breakpoint): boolean => {
    const currentIndex = breakpointOrder.indexOf(this.currentViewport.breakpoint);
    const targetIndex = breakpointOrder.indexOf(bp);
    return currentIndex >= targetIndex;
  };

  public atMost = (bp: Breakpoint): boolean => {
    const currentIndex = breakpointOrder.indexOf(this.currentViewport.breakpoint);
    const targetIndex = breakpointOrder.indexOf(bp);
    return currentIndex <= targetIndex;
  };

  public subscribe = (callback: (viewport: ViewportInfo) => void): (() => void) => {
    this.listeners.push(callback);
    callback(this.currentViewport);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  };

  public subscribeBreakpoint = (callback: (breakpoint: Breakpoint) => void): (() => void) => {
    this.breakpointListeners.push(callback);
    callback(this.currentViewport.breakpoint);
    return () => {
      this.breakpointListeners = this.breakpointListeners.filter((l) => l !== callback);
    };
  };

  public subscribeInputMode = (callback: (inputMode: InputMode) => void): (() => void) => {
    this.inputListeners.push(callback);
    callback(this.currentViewport.inputMode);
    return () => {
      this.inputListeners = this.inputListeners.filter((l) => l !== callback);
    };
  };

  public destroy = (): void => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('orientationchange', this.handleResize);
      window.removeEventListener('pointerdown', this.handlePointer);
      window.removeEventListener('keydown', this.handleKey);
      window.removeEventListener('touchstart', this.handleTouch);
    }
  };
}

export const responsiveEngine = new ResponsiveEngine({
  onBreakpointChange: (bp) => console.log('[ResponsiveEngine] Breakpoint changed:', bp),
});

export default responsiveEngine;
