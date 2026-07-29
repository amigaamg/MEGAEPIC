"""Structured physical examination modules inspired by Hutchison's Clinical Methods"""

class ExamModule:
    def __init__(self, name, findings_schema):
        self.name = name
        self.findings_schema = findings_schema
        self.findings = {}

    def get_unanswered_findings(self):
        return [f for f in self.findings_schema if f["id"] not in self.findings]

    def record_finding(self, finding_id, value):
        self.findings[finding_id] = value
        schema_item = next((f for f in self.findings_schema if f["id"] == finding_id), None)
        if schema_item and "alert_if" in schema_item:
            if self._matches_alert(value, schema_item["alert_if"]):
                return schema_item["alert_message"]
        return None

    def _matches_alert(self, value, condition):
        if isinstance(condition, dict):
            try:
                value = float(value)
            except (ValueError, TypeError):
                pass
            for op, threshold in condition.items():
                if op == "lt" and value < threshold:
                    return True
                if op == "gt" and value > threshold:
                    return True
                if op == "eq" and value == threshold:
                    return True
        return False

    def is_complete(self):
        return len(self.get_unanswered_findings()) == 0


class GeneralExam(ExamModule):
    def __init__(self):
        schema = [
            {"id": "bp_systolic", "text": "Systolic BP (mmHg)", "type": "number", "normal_range": [90, 140], "alert_if": {"lt": 90}, "alert_message": "Hypotension - consider shock"},
            {"id": "bp_diastolic", "text": "Diastolic BP (mmHg)", "type": "number", "normal_range": [60, 90]},
            {"id": "pulse_rate", "text": "Pulse rate (beats/min)", "type": "number", "normal_range": [60, 100], "alert_if": {"gt": 120}, "alert_message": "Tachycardia - possible sepsis or shock"},
            {"id": "pulse_rhythm", "text": "Pulse rhythm (regular/irregular)", "type": "choice", "options": ["regular", "irregular"]},
            {"id": "respiratory_rate", "text": "Respiratory rate (breaths/min)", "type": "number", "normal_range": [12, 20], "alert_if": {"gt": 24}, "alert_message": "Tachypnoea - respiratory distress"},
            {"id": "temperature", "text": "Temperature (C)", "type": "number", "normal_range": [36.0, 37.5], "alert_if": {"gt": 38.5}, "alert_message": "Fever - possible infection"},
            {"id": "spo2", "text": "Oxygen saturation (%)", "type": "number", "normal_range": [95, 100], "alert_if": {"lt": 94}, "alert_message": "Hypoxia - need oxygen"},
            {"id": "height_cm", "text": "Height (cm)", "type": "number"},
            {"id": "weight_kg", "text": "Weight (kg)", "type": "number"},
            {"id": "general_appearance", "text": "General appearance (well/unwell/ill-looking)", "type": "text"},
            {"id": "pallor", "text": "Pallor (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "jaundice", "text": "Jaundice (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "cyanosis", "text": "Cyanosis (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "clubbing", "text": "Clubbing (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "edema", "text": "Peripheral edema (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "hydration_status", "text": "Hydration status (normal/dry/severe dehydration)", "type": "choice", "options": ["normal", "dry", "severe dehydration"]},
            {"id": "nutritional_status", "text": "Nutritional status (normal/malnourished/obese)", "type": "choice", "options": ["normal", "malnourished", "obese"]},
            {"id": "distress_level", "text": "Level of distress (none/mild/moderate/severe)", "type": "choice", "options": ["none", "mild", "moderate", "severe"]}
        ]
        super().__init__("general_exam", schema)


class AbdominalExam(ExamModule):
    def __init__(self):
        schema = [
            {"id": "abdo_inspection_distension", "text": "Abdominal distension (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "abdo_inspection_scars", "text": "Scars (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "abdo_inspection_visible_peristalsis", "text": "Visible peristalsis (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "abdo_inspection_hernia", "text": "Hernia (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "abdo_palpation_tenderness", "text": "Tenderness (present/absent)", "type": "choice", "options": ["present", "absent"], "alert_if": {"eq": "present"}, "alert_message": "Peritoneal sign - consider surgical cause"},
            {"id": "abdo_palpation_tenderness_location", "text": "If tenderness, location (e.g., RLQ, epigastric)", "type": "text"},
            {"id": "abdo_palpation_guarding", "text": "Guarding (present/absent)", "type": "choice", "options": ["present", "absent"], "alert_if": {"eq": "present"}, "alert_message": "Guarding - likely peritonitis"},
            {"id": "abdo_palpation_rigidity", "text": "Rigidity (present/absent)", "type": "choice", "options": ["present", "absent"], "alert_if": {"eq": "present"}, "alert_message": "Rigidity - surgical emergency"},
            {"id": "abdo_palpation_masses", "text": "Palpable masses (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "abdo_palpation_mass_description", "text": "If mass, describe (size, consistency, mobility)", "type": "text"},
            {"id": "abdo_palpation_liver", "text": "Liver palpable (yes/no)", "type": "choice", "options": ["yes", "no"]},
            {"id": "abdo_palpation_spleen", "text": "Spleen palpable (yes/no)", "type": "choice", "options": ["yes", "no"]},
            {"id": "abdo_percussion_tympany", "text": "Tympanitic (yes/no)", "type": "choice", "options": ["yes", "no"]},
            {"id": "abdo_percussion_shifting_dullness", "text": "Shifting dullness (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "abdo_auscultation_bowel_sounds", "text": "Bowel sounds (normal/absent/hyperactive/tinkling)", "type": "choice", "options": ["normal", "absent", "hyperactive", "tinkling"]},
            {"id": "abdo_auscultation_bruits", "text": "Bruits (present/absent)", "type": "choice", "options": ["present", "absent"]}
        ]
        super().__init__("abdominal_exam", schema)


class RespiratoryExam(ExamModule):
    def __init__(self):
        schema = [
            {"id": "resp_inspection_shape", "text": "Chest shape (normal/barrel/flat/asymmetric)", "type": "choice", "options": ["normal", "barrel", "flat", "asymmetric"]},
            {"id": "resp_inspection_accessory_muscles", "text": "Use of accessory muscles (yes/no)", "type": "choice", "options": ["yes", "no"]},
            {"id": "resp_palpation_tactile_fremitus", "text": "Tactile fremitus (normal/reduced/increased)", "type": "choice", "options": ["normal", "reduced", "increased"]},
            {"id": "resp_percussion_note", "text": "Percussion note (resonant/hyperresonant/dull)", "type": "choice", "options": ["resonant", "hyperresonant", "dull"]},
            {"id": "resp_auscultation_breath_sounds", "text": "Breath sounds (vesicular/bronchial/vesicular with wheeze)", "type": "choice", "options": ["vesicular", "bronchial", "vesicular with wheeze"]},
            {"id": "resp_auscultation_crackles", "text": "Crackles (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "resp_auscultation_wheeze", "text": "Wheeze (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "resp_auscultation_rub", "text": "Pleural rub (present/absent)", "type": "choice", "options": ["present", "absent"]}
        ]
        super().__init__("respiratory_exam", schema)


class CardiovascularExam(ExamModule):
    def __init__(self):
        schema = [
            {"id": "jvp", "text": "JVP (raised/normal)", "type": "choice", "options": ["raised", "normal"]},
            {"id": "pulse_character", "text": "Pulse character (normal/bounding/small volume)", "type": "choice", "options": ["normal", "bounding", "small volume"]},
            {"id": "apex_beat", "text": "Apex beat (normal/displaced)", "type": "choice", "options": ["normal", "displaced"]},
            {"id": "heart_sounds_s1", "text": "S1 (normal/split/soft/loud)", "type": "choice", "options": ["normal", "split", "soft", "loud"]},
            {"id": "heart_sounds_s2", "text": "S2 (normal/split/soft/loud)", "type": "choice", "options": ["normal", "split", "soft", "loud"]},
            {"id": "heart_murmur", "text": "Murmur (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "heart_murmur_description", "text": "If murmur, describe (timing, location, radiation)", "type": "text"},
            {"id": "gallop", "text": "Gallop rhythm (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "peripheral_pulses", "text": "Peripheral pulses (all palpable/absent)", "type": "text"},
            {"id": "capillary_refill", "text": "Capillary refill time (seconds)", "type": "number", "alert_if": {"gt": 2}, "alert_message": "Prolonged CRT - possible shock"}
        ]
        super().__init__("cardiovascular_exam", schema)


class NeurologicalExam(ExamModule):
    def __init__(self):
        schema = [
            {"id": "mental_state", "text": "Mental state (alert/drowsy/confused/unresponsive)", "type": "choice", "options": ["alert", "drowsy", "confused", "unresponsive"]},
            {"id": "cranial_nerves_normal", "text": "Cranial nerves (normal/abnormal)", "type": "choice", "options": ["normal", "abnormal"]},
            {"id": "motor_tone", "text": "Muscle tone (normal/increased/decreased)", "type": "choice", "options": ["normal", "increased", "decreased"]},
            {"id": "motor_power", "text": "Motor power (normal/weak/paralysis)", "type": "choice", "options": ["normal", "weak", "paralysis"]},
            {"id": "reflexes", "text": "Reflexes (normal/brisk/absent)", "type": "choice", "options": ["normal", "brisk", "absent"]},
            {"id": "babinski", "text": "Babinski sign (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "coordination", "text": "Coordination (normal/ataxic)", "type": "choice", "options": ["normal", "ataxic"]},
            {"id": "sensation", "text": "Sensation (normal/reduced/loss)", "type": "choice", "options": ["normal", "reduced", "loss"]},
            {"id": "gait", "text": "Gait (normal/ataxic/hemiparetic/parkinsonian)", "type": "choice", "options": ["normal", "ataxic", "hemiparetic", "parkinsonian"]}
        ]
        super().__init__("neurological_exam", schema)


class MusculoskeletalExam(ExamModule):
    def __init__(self):
        schema = [
            {"id": "msk_deformity", "text": "Deformity (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "msk_swelling", "text": "Swelling (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "msk_tenderness", "text": "Tenderness (present/absent)", "type": "choice", "options": ["present", "absent"]},
            {"id": "msk_range_of_motion", "text": "Range of motion (normal/reduced)", "type": "choice", "options": ["normal", "reduced"]},
            {"id": "msk_stability", "text": "Joint stability (stable/unstable)", "type": "choice", "options": ["stable", "unstable"]}
        ]
        super().__init__("musculoskeletal_exam", schema)


class MentalStateExam(ExamModule):
    def __init__(self):
        schema = [
            {"id": "appearance_behavior", "text": "Appearance and behavior (normal/dishevelled/agitated/withdrawn)", "type": "choice", "options": ["normal", "dishevelled", "agitated", "withdrawn"]},
            {"id": "speech", "text": "Speech (normal/pressured/slurred/poverty)", "type": "choice", "options": ["normal", "pressured", "slurred", "poverty"]},
            {"id": "mood", "text": "Mood (euthymic/depressed/elevated/anxious)", "type": "choice", "options": ["euthymic", "depressed", "elevated", "anxious"]},
            {"id": "affect", "text": "Affect (normal/flat/labile)", "type": "choice", "options": ["normal", "flat", "labile"]},
            {"id": "thought_form", "text": "Thought form (logical/loose/blocking)", "type": "choice", "options": ["logical", "loose", "blocking"]},
            {"id": "thought_content", "text": "Thought content (normal/delusions/obsessions)", "type": "choice", "options": ["normal", "delusions", "obsessions"]},
            {"id": "perception", "text": "Perception (normal/hallucinations/illusions)", "type": "choice", "options": ["normal", "hallucinations", "illusions"]},
            {"id": "cognition", "text": "Cognition (normal/impaired)", "type": "choice", "options": ["normal", "impaired"]},
            {"id": "insight", "text": "Insight (intact/partial/absent)", "type": "choice", "options": ["intact", "partial", "absent"]},
            {"id": "judgement", "text": "Judgement (good/fair/poor)", "type": "choice", "options": ["good", "fair", "poor"]}
        ]
        super().__init__("mental_state_exam", schema)


EXAM_MODULES = {
    "general": GeneralExam,
    "abdominal": AbdominalExam,
    "respiratory": RespiratoryExam,
    "cardiovascular": CardiovascularExam,
    "neurological": NeurologicalExam,
    "musculoskeletal": MusculoskeletalExam,
    "mental_state": MentalStateExam,
}

CONTEXT_EXAM_MAP = {
    "acute_abdomen": ["general", "abdominal"],
    "bowel_obstruction": ["general", "abdominal"],
    "respiratory_distress": ["general", "respiratory", "cardiovascular"],
    "shock": ["general", "cardiovascular", "respiratory"],
    "sepsis": ["general", "cardiovascular", "respiratory", "neurological"],
    "trauma": ["general", "musculoskeletal", "neurological"],
    "acute_neuro": ["general", "neurological"],
    "psychosis": ["general", "mental_state"],
}
