import time

class TimelineBuilder:
    """Maintains chronological list of clinical events"""
    def __init__(self):
        self.events = []

    def add_event(self, event_type, data, timestamp=None):
        if timestamp is None:
            timestamp = time.time()
        self.events.append({
            "type": event_type,
            "data": data,
            "timestamp": timestamp
        })

    def get_sequence(self):
        return self.events

    def get_progression(self):
        symptoms = [e["data"].get("name") or e["data"].get("question_id") for e in self.events if e["type"] == "symptom"]
        return " -> ".join(symptoms) if symptoms else ""
