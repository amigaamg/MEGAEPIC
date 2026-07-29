class ManagementEngine:
    def __init__(self):
        self.context_management = {
            "acute_abdomen": {
                "immediate": ["NBM", "IV access", "Analgesia", "Surgical referral"],
                "medical": ["IV fluids", "Antiemetics"],
                "surgical": ["Assess for surgery"],
                "monitoring": ["Vitals", "Abdominal exam"],
                "referral": "General Surgery"
            },
            "bowel_obstruction": {
                "immediate": ["NBM", "NG tube", "IV fluids", "Urinary catheter"],
                "medical": ["Electrolyte correction"],
                "surgical": ["Laparotomy if failed conservative"],
                "monitoring": ["NG output", "Abdominal girth", "Urine output"],
                "referral": "General Surgery"
            },
            "respiratory_distress": {
                "immediate": ["O2 therapy", "Position patient upright", "IV access"],
                "medical": ["Nebulised bronchodilators", "Corticosteroids"],
                "surgical": ["Chest drain if pneumothorax"],
                "monitoring": ["SpO2", "Respiratory rate", "ABG"],
                "referral": "Respiratory Medicine / ICU"
            },
            "shock": {
                "immediate": ["IV fluids bolus", "O2 high flow", "Vasopressors if needed", "Identify source"],
                "medical": ["Broad-spectrum antibiotics if septic"],
                "surgical": ["Source control"],
                "monitoring": ["CVP", "Lactate", "Urine output"],
                "referral": "ICU / Anesthesia"
            },
            "sepsis": {
                "immediate": ["IV fluids", "Blood cultures", "Broad-spectrum antibiotics", "Lactate"],
                "medical": ["Vasopressors", "Corticosteroids"],
                "surgical": ["Source control (drainage/debridement)"],
                "monitoring": ["q1h vitals", "CRP", "Procalcitonin"],
                "referral": "ICU / Infectious Diseases"
            }
        }

    def get_management(self, acet_state, top_diagnoses):
        if top_diagnoses:
            best = top_diagnoses[0]
            if "management" in best:
                return best["management"]
        context = acet_state.get("crs", {}).get("active_context")
        if context and context in self.context_management:
            return self.context_management[context]
        return {
            "immediate": ["Stabilise patient", "Take full history", "Perform examination"],
            "medical": ["Symptomatic treatment"],
            "surgical": ["Refer if indicated"],
            "monitoring": ["Observe vitals"],
            "referral": "General Medicine"
        }
