import Events from '../events'

describe('Events', () => {
  beforeEach(() => {
    Events.clearEventHistory()
  })

  test('should emit and listen for events', () => {
    const listener = jest.fn()
    const unsubscribe = Events.on('test_event', listener)

    Events.emit('test_event', { data: 'test' })

    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  test('should track event history', () => {
    Events.emit('history_event', { data: 'test' })

    const history = Events.getEventHistory()
    expect(history.length).toBe(1)
    expect(history[0].type).toBe('history_event')
  })

  test('should filter event history by type', () => {
    Events.emit('type_a', { data: 'a' })
    Events.emit('type_b', { data: 'b' })
    Events.emit('type_a', { data: 'a2' })

    const typeAEvents = Events.getEventHistoryByType('type_a')
    expect(typeAEvents.length).toBe(2)
  })

  test('should clear event history', () => {
    Events.emit('test_event', { data: 'test' })
    Events.clearEventHistory()

    const history = Events.getEventHistory()
    expect(history.length).toBe(0)
  })

  test('should return listener count', () => {
    const listener1 = jest.fn()
    const listener2 = jest.fn()
    Events.on('test_event', listener1)
    Events.on('test_event', listener2)

    expect(Events.getListenerCount('test_event')).toBe(2)
  })
})