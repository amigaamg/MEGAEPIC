import { type AmxUid } from '@/lib/amexan/identity/types'

export interface Organization {
  uid: AmxUid
  name: string
  legalName: string
  type: 'hospital' | 'clinic' | 'lab' | 'pharmacy' | 'insurance' | 'training' | 'ministry' | 'ngo'
  taxId: string
  country: string
  licenseNumber: string
  status: 'active' | 'suspended' | 'closed'
  createdAt: number
}

export interface Branch {
  id: string
  orgId: AmxUid
  name: string
  address: string
  phone: string
  type: 'main' | 'satellite' | 'mobile'
}

export interface Campus { id: string; branchId: string; name: string; address: string }
export interface Building { id: string; campusId: string; name: string; floors: number }
export interface Floor { id: string; buildingId: string; level: number; name: string }

export interface Department {
  id: string
  orgId: AmxUid
  branchId: string
  name: string
  type: 'medical' | 'surgical' | 'diagnostic' | 'support' | 'admin'
  headId?: string
  parentDeptId?: string
  active: boolean
}

export interface Unit {
  id: string
  deptId: string
  name: string
  leadId?: string
  type: 'ward' | 'icu' | 'theatre' | 'clinic' | 'lab_unit' | 'pharmacy_unit'
}

export interface PhysicalResource {
  id: string
  type: 'bed' | 'room' | 'theatre' | 'machine' | 'ventilator'
  location: string
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning'
  label: string
}

export interface Bed extends PhysicalResource {
  type: 'bed'
  wardId: string
  roomId: string
  bedNumber: string
  currentPatientId?: string
  isolationType?: 'none' | 'contact' | 'droplet' | 'airborne'
  cleaningStatus: 'clean' | 'dirty' | 'in_progress'
}
