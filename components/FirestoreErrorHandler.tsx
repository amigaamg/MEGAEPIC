'use client'
import { useEffect } from 'react'

export default function FirestoreErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      if (event.message?.includes('permission-denied') || event.message?.includes('Missing or insufficient permissions')) {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || event.reason?.code || ''
      if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  return <>{children}</>
}
