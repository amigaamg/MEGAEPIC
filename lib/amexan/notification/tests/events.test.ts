import { vi } from 'vitest'
import Events from '../events'
import { NotificationStatus } from '../types'

describe('Events', () => {
  beforeEach(() => {
    Events.clearEventHistory()
  })

  test('should emit and listen for events', () => {
    const listener = vi.fn()
    const unsubscribe = Events.on('test_event', listener)

    Events.emit('test_event', { id: '1', title: 'Test' } as any)

    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  test('should track event history', () => {
    Events.emit('history_event', { id: '1', title: 'Test' } as any)

    const history = Events.getEventHistory()
    expect(history.length).toBe(1)
    expect(history[0].type).toBe('history_event')
  })

  test('should filter event history by type', () => {
    Events.emit('type_a', { id: '1' } as any)
    Events.emit('type_b', { id: '2' } as any)
    Events.emit('type_a', { id: '3' } as any)

    const typeAEvents = Events.getEventHistoryByType('type_a')
    expect(typeAEvents.length).toBe(2)
  })

  test('should clear event history', () => {
    Events.emit('test_event', { id: '1' } as any)
    Events.clearEventHistory()

    const history = Events.getEventHistory()
    expect(history.length).toBe(0)
  })

  test('should return listener count', () => {
const listener1 = vi.fn()
    const listener2 = vi.fn()
    Events.on('test_event', listener1)
    Events.on('test_event', listener2)

    expect(Events.getListenerCount('test_event')).toBe(2)
  })
})
