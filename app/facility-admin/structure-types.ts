// Shared types for the Facility Administration command center structure module.
// Re-exports the persisted settings types so the COO UI and the Firestore lane
// stay in sync without a second copy.

export type { StructureEntry, StructureEntryKind, FacilityAdminSettings } from '@/lib/firebase/facilityAdminSettings';