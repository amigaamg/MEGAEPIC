export function getDefaultOrgId(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  }
  return 'telemed-a98cf'
}
