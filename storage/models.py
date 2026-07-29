from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass
class Patient:
    patient_id: str
    name: str
    age: int
    sex: str
    created_at: Optional[str] = None

@dataclass
class Encounter:
    encounter_id: str
    patient_id: str
    start_time: str
    end_time: Optional[str] = None
    profile: Optional[str] = None
    context: Optional[str] = None
    is_complete: bool = False

@dataclass
class Event:
    encounter_id: str
    event_type: str
    event_data: Dict[str, Any]
    timestamp: Optional[str] = None

@dataclass
class ACETSnapshot:
    encounter_id: str
    snapshot_json: Dict[str, Any]
    snapshot_time: Optional[str] = None
