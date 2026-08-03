// AMEXAN Homepage Icon Registry
// Constitutional: config stores icon names as strings; this maps them to Lucide.
// Icons: Lucide only. One stroke width. One size family.

'use client'

import {
  Activity, BarChart3, Blocks, BookMarked, BookOpen, Bot, Boxes, Braces, Brain,
  Building, Building2, CalendarDays, ClipboardList, Clock, Cloud, Code, Code2,
  Component, CreditCard, Cpu, Database, Eye, FileCheck2, FileText, Fingerprint,
  FlaskConical, GitBranch, Globe, GraduationCap, Grid, HeartHandshake, HeartPulse,
  Home, Info, Landmark, Layers, Library, LifeBuoy, Lock, LogIn, MapPin,
  Microscope, MonitorSmartphone, Network, Palette, Pill, Play, Plug, Radio,
  Rocket, Scan, Scale, ScrollText, Search, Settings, ShieldCheck, Siren, Smartphone,
  Stethoscope, Store, Target, Terminal, UserCircle, UserPlus, Users, Video, Watch,
  Webhook, WifiOff, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Activity,
  BarChart3,
  Blocks,
  BookMarked,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  Brain,
  Building,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock,
  Cloud,
  Code,
  Code2,
  Component,
  CreditCard,
  Cpu,
  Database,
  Eye,
  FileCheck2,
  FileText,
  Fingerprint,
  FlaskConical,
  GitBranch,
  Globe,
  GraduationCap,
  Grid,
  HeartHandshake,
  HeartPulse,
  Home,
  Info,
  Landmark,
  Layers,
  Library,
  LifeBuoy,
  Lock,
  LogIn,
  MapPin,
  Microscope,
  MonitorSmartphone,
  Network,
  Palette,
  Pill,
  Play,
  Plug,
  Radio,
  Rocket,
  Scan,
  Scale,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  Smartphone,
  Stethoscope,
  Store,
  Target,
  Terminal,
  UserCircle,
  UserPlus,
  Users,
  Video,
  Watch,
  Webhook,
  WifiOff,
  Zap,
}

export function getIcon(name?: string): LucideIcon | null {
  if (!name) return null
  return ICONS[name] ?? null
}

export { ICONS }
export type { LucideIcon }
