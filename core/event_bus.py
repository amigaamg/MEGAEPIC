class EventBus:
    """Simple publish-subscribe bus"""
    def __init__(self):
        self._subscribers = {}

    def subscribe(self, event_type, callback):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)

    def publish(self, event_type, data=None):
        if event_type in self._subscribers:
            for cb in self._subscribers[event_type]:
                cb(event_type, data)
