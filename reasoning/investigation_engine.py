class InvestigationEngine:
    def __init__(self):
        self.context_investigations = {
            "acute_abdomen": [
                {"type": "laboratory", "name": "Full blood count", "reason": "Infection or bleeding"},
                {"type": "laboratory", "name": "Urea and electrolytes", "reason": "Dehydration or renal impairment"},
                {"type": "laboratory", "name": "CRP", "reason": "Inflammatory marker"},
                {"type": "imaging", "name": "Abdominal X-ray", "reason": "Obstruction or perforation"},
                {"type": "imaging", "name": "CT abdomen (if severe)", "reason": "Detailed anatomy"}
            ],
            "bowel_obstruction": [
                {"type": "laboratory", "name": "FBC, U&E, CRP"},
                {"type": "imaging", "name": "Abdominal X-ray (erect and supine)", "reason": "Dilated loops, air-fluid levels"},
                {"type": "imaging", "name": "CT abdomen with contrast", "reason": "Level and cause of obstruction"}
            ],
            "respiratory_distress": [
                {"type": "bedside", "name": "Oxygen saturation", "reason": "Hypoxia"},
                {"type": "laboratory", "name": "ABG/VBG", "reason": "Gas exchange"},
                {"type": "laboratory", "name": "CBC, CRP", "reason": "Infection"},
                {"type": "imaging", "name": "Chest X-ray", "reason": "Pneumonia, effusion, pneumothorax"},
                {"type": "microbiology", "name": "Sputum culture", "reason": "Pathogen identification"}
            ],
            "shock": [
                {"type": "bedside", "name": "Vital signs q15min", "reason": "Monitoring"},
                {"type": "laboratory", "name": "Lactate", "reason": "Tissue hypoperfusion"},
                {"type": "laboratory", "name": "FBC, U&E, CRP, LFTs"},
                {"type": "imaging", "name": "ECHO", "reason": "Cardiac function"},
                {"type": "hemodynamics", "name": "CVP/arterial line", "reason": "Invasive monitoring"}
            ],
            "sepsis": [
                {"type": "laboratory", "name": "Blood cultures x2", "reason": "Bacteremia"},
                {"type": "laboratory", "name": "Lactate", "reason": "Severity assessment"},
                {"type": "laboratory", "name": "Procalcitonin", "reason": "Bacterial infection"},
                {"type": "imaging", "name": "Source imaging (CT/US)", "reason": "Identify focus"}
            ],
            "acute_neuro": [
                {"type": "laboratory", "name": "Glucose, electrolytes", "reason": "Metabolic causes"},
                {"type": "imaging", "name": "CT head", "reason": "Bleed, mass, stroke"},
                {"type": "imaging", "name": "MRI brain", "reason": "Detailed structure"},
                {"type": "special", "name": "Lumbar puncture", "reason": "Meningitis"}
            ]
        }

        self.symptom_investigations = {
            "fever": [
                {"type": "laboratory", "name": "Blood cultures", "reason": "Bacteremia"},
                {"type": "laboratory", "name": "Malaria smear (if endemic)", "reason": "Fever in tropics"}
            ],
            "vomiting": [
                {"type": "laboratory", "name": "U&E, bicarbonate", "reason": "Metabolic alkalosis/dehydration"}
            ],
            "bleeding": [
                {"type": "laboratory", "name": "Coagulation screen, platelets", "reason": "Coagulopathy"},
                {"type": "laboratory", "name": "Crossmatch", "reason": "Transfusion readiness"}
            ]
        }

    def get_suggestions(self, acet_state, active_context):
        suggestions = []
        if active_context in self.context_investigations:
            suggestions.extend(self.context_investigations[active_context])
        symptoms = acet_state.get("symptoms", {})
        for sym, inv_list in self.symptom_investigations.items():
            if symptoms.get(sym):
                suggestions.extend(inv_list)
        seen = set()
        unique = []
        for s in suggestions:
            name = s["name"] if isinstance(s, dict) else s
            if name not in seen:
                seen.add(name)
                unique.append(s if isinstance(s, dict) else {"type": "laboratory", "name": name, "reason": ""})
        return unique
