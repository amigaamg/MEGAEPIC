// AMEXAN Homepage Types
// Constitutional: types are shared across all homepage sections

import type { NavItem } from '@/lib/navigation/navigation.config'

export type { NavItem }

export interface HeroButton {
  id: string
  label: string
  description: string
  route: string
  variant: 'primary' | 'secondary' | 'ghost'
  icon?: string
}

export interface LiveModule {
  id: string
  label: string
  status: 'online' | 'active' | 'syncing'
}

export interface HeroContent {
  eyebrow: string
  headline: string
  subheadline: string
  buttons: HeroButton[]
  status: {
    label: string
    value: string
    ok: boolean
  }
  version: string
  countries: string
  modules: LiveModule[]
  flow: string[]
}

export interface EcosystemNode {
  id: string
  label: string
  description?: string
}

export interface SectionHeader {
  tag?: string
  title: string
  subtitle?: string
  dark?: boolean
}
