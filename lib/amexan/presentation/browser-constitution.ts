import type { BrowserEngine, DeviceInfo } from './types'

export interface BrowserSupport {
  engine: BrowserEngine
  supported: boolean
  minVersion: string
  features: Record<string, boolean>
}

export const BROWSER_ENGINES: Record<BrowserEngine, { label: string; examples: string[]; minVersion: string }> = {
  chromium: {
    label: 'Chromium',
    examples: ['Chrome', 'Edge', 'Brave', 'Opera', 'Arc', 'Samsung Internet', 'Vivaldi'],
    minVersion: '100',
  },
  webkit: {
    label: 'WebKit',
    examples: ['Safari (macOS)', 'Safari (iOS)', 'WebView'],
    minVersion: '15.0',
  },
  gecko: {
    label: 'Gecko',
    examples: ['Firefox', 'Firefox for Android'],
    minVersion: '100',
  },
  unknown: {
    label: 'Unknown',
    examples: [],
    minVersion: '0',
  },
}

export const FEATURE_SUPPORT: Record<string, (device: DeviceInfo) => boolean> = {
  webRTC: () => typeof navigator !== 'undefined' && 'RTCPeerConnection' in window,
  webGPU: () => typeof navigator !== 'undefined' && 'gpu' in navigator,
  fileSystemAccess: () => typeof navigator !== 'undefined' && 'showDirectoryPicker' in window,
  webWorker: () => typeof Worker !== 'undefined',
  webSocket: () => typeof WebSocket !== 'undefined',
  localStorage: () => typeof localStorage !== 'undefined',
  serviceWorker: () => typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  cssGrid: () => typeof CSS !== 'undefined' && CSS.supports('display', 'grid'),
  cssCustomProperties: () => typeof CSS !== 'undefined' && CSS.supports('(--custom: value)'),
  cssContainerQueries: () => typeof CSS !== 'undefined' && CSS.supports('container-type', 'inline-size'),
  webAuthn: () => typeof navigator !== 'undefined' && 'credentials' in navigator,
  mediaSession: () => typeof navigator !== 'undefined' && 'mediaSession' in navigator,
  bluetooth: () => typeof navigator !== 'undefined' && 'bluetooth' in navigator,
  usb: () => typeof navigator !== 'undefined' && 'usb' in navigator,
  webSerial: () => typeof navigator !== 'undefined' && 'serial' in navigator,
  webNFC: () => typeof navigator !== 'undefined' && 'nfc' in navigator,
  pointerLock: () => typeof document !== 'undefined' && 'pointerLockElement' in document,
  fullscreen: () => typeof document !== 'undefined' && 'fullscreenEnabled' in document,
  orientation: () => typeof screen !== 'undefined' && 'orientation' in screen,
  vibration: () => typeof navigator !== 'undefined' && 'vibrate' in navigator,
  wakeLock: () => typeof navigator !== 'undefined' && 'wakeLock' in navigator,
  webShare: () => typeof navigator !== 'undefined' && 'share' in navigator,
  speechRecognition: () => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  speechSynthesis: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
}

export function getSupportedFeatures(device: DeviceInfo): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  for (const [name, check] of Object.entries(FEATURE_SUPPORT)) {
    result[name] = check(device)
  }
  return result
}

export function getBrowserInfo(device: DeviceInfo): BrowserSupport {
  return {
    engine: device.browser,
    supported: device.browser !== 'unknown',
    minVersion: BROWSER_ENGINES[device.browser]?.minVersion || '0',
    features: getSupportedFeatures(device),
  }
}

export function getProgressiveEnhancement(device: DeviceInfo): {
  required: string[]
  enhanced: string[]
  unavailable: string[]
} {
  const features = getSupportedFeatures(device)
  const required = ['webWorker', 'localStorage', 'cssGrid', 'cssCustomProperties']
  const enhanced: string[] = []
  const unavailable: string[] = []

  for (const [feature, supported] of Object.entries(features)) {
    if (required.includes(feature)) continue
    if (supported) enhanced.push(feature)
    else unavailable.push(feature)
  }

  return { required: required.filter(f => features[f]), enhanced, unavailable }
}
