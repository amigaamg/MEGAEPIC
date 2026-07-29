import datetime
from typing import Dict, Any

class DocumentationEngine:
    def _get_nested(self, data, path):
        parts = path.split(".")
        cur = data
        for p in parts:
            if isinstance(cur, dict) and p in cur:
                cur = cur[p]
            else:
                return {}
        return cur if isinstance(cur, dict) else {}

    def _format_history(self, acet_state, section):
        data = self._get_nested(acet_state, section)
        lines = []
        if isinstance(data, dict):
            for mod, answers in data.items():
                if isinstance(answers, dict):
                    for qid, ans in answers.items():
                        if ans not in (None, "", False):
                            label = qid.replace("_", " ").title()
                            lines.append(f"  - {label}: {ans}")
                elif answers:
                    lines.append(f"  - {mod}: {answers}")
        return "\n".join(lines) if lines else "  None recorded"

    def generate_hp_note(self, acet_state: Dict[str, Any]) -> str:
        """History & Physical (Admission Note)"""
        idata = acet_state.get("identity", {})
        timeline = acet_state.get("timeline", [])
        exam = acet_state.get("examination", {})
        general = exam.get("general_exam", {})
        differentials = acet_state.get("differential", [])
        management = acet_state.get("management", {})
        pmh = self._format_history(acet_state, "history.core.past_medical")
        psh = self._format_history(acet_state, "history.core.past_surgical")
        drugs = self._format_history(acet_state, "history.core.drug_history")
        allergies = self._format_history(acet_state, "history.core.allergy_history")
        family_hx = self._format_history(acet_state, "history.core.family_history")
        social = self._format_history(acet_state, "history.core.social_history")
        occupational = self._format_history(acet_state, "history.core.occupational_history")
        sexual = self._format_history(acet_state, "history.core.sexual_history")
        profile = acet_state.get("profile", "adult")
        context = acet_state.get("crs", {}).get("active_context", "unknown")

        hpi_lines = []
        for ev in timeline:
            if ev.get("type") == "symptom":
                hpi_lines.append(f"- {ev['data'].get('name', '')}")
            elif ev.get("type") == "answer":
                ans = ev.get("data", {})
                qid = ans.get("question_id", "")
                answer = ans.get("answer", "")
                hpi_lines.append(f"  * {qid}: {answer}")
        hpi = "\n".join(hpi_lines) if hpi_lines else "No HPI recorded."

        bp_sys = general.get("bp_systolic", "?")
        bp_dia = general.get("bp_diastolic", "?")
        pulse = general.get("pulse_rate", "?")
        rr = general.get("respiratory_rate", "?")
        temp = general.get("temperature", "?")
        spo2 = general.get("spo2", "?")

        abdominal = exam.get("abdominal_exam", {})
        respiratory = exam.get("respiratory_exam", {})
        cardiovascular = exam.get("cardiovascular_exam", {})
        neuro = exam.get("neurological_exam", {})

        abdo_text = f"Distension: {abdominal.get('abdo_inspection_distension', '?')}, Tenderness: {abdominal.get('abdo_palpation_tenderness', '?')}, Guarding: {abdominal.get('abdo_palpation_guarding', '?')}, Bowel sounds: {abdominal.get('abdo_auscultation_bowel_sounds', '?')}"
        resp_text = f"Accessory muscles: {respiratory.get('resp_inspection_accessory_muscles', '?')}, Crackles: {respiratory.get('resp_auscultation_crackles', '?')}, Wheeze: {respiratory.get('resp_auscultation_wheeze', '?')}"
        cvs_text = f"JVP: {cardiovascular.get('jvp', '?')}, Murmur: {cardiovascular.get('heart_murmur', '?')}, Capillary refill: {cardiovascular.get('capillary_refill', '?')}s"
        neuro_text = f"Mental state: {neuro.get('mental_state', '?')}, Power: {neuro.get('motor_power', '?')}, Gait: {neuro.get('gait', '?')}"

        dd_list = "\n".join([f"{i+1}. {d['name']} (score {d.get('score', 0)})" for i, d in enumerate(differentials[:5])]) if differentials else "Not yet generated."

        mgmt_plan = ""
        if management:
            for key in ["immediate", "medical", "surgical", "monitoring"]:
                items = management.get(key, [])
                if items:
                    mgmt_plan += f"{key.upper()}: {', '.join(items)}\n"
            mgmt_plan += f"REFERRAL: {management.get('referral', 'None')}"

        note = f"""
HISTORY & PHYSICAL - ADMISSION NOTE
====================================
Patient: {idata.get('name', 'Unknown')}, {idata.get('age', '?')}y/{idata.get('sex', '?')}
MRN: {idata.get('patient_id', 'N/A')}
Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}
Profile: {profile} | Context: {context}

HISTORY OF PRESENT ILLNESS:
{hpi}

PAST MEDICAL HISTORY:
{pmh}

PAST SURGICAL HISTORY:
{psh}

MEDICATIONS:
{drugs}

ALLERGIES:
{allergies}

FAMILY HISTORY:
{family_hx}

SOCIAL HISTORY:
{social}

OCCUPATIONAL HISTORY:
{occupational}

SEXUAL HISTORY:
{sexual}

PHYSICAL EXAMINATION:
Vitals: BP {bp_sys}/{bp_dia}, P {pulse}, R {rr}, T {temp}C, SpO2 {spo2}%
General: {general.get('general_appearance', '?')} | Hydration: {general.get('hydration_status', '?')}
Abdomen: {abdo_text}
Respiratory: {resp_text}
CVS: {cvs_text}
Neurological: {neuro_text}

PROBLEM LIST:
1. {context} - suspected, pending further workup.

DIFFERENTIAL DIAGNOSIS:
{dd_list}

PLAN:
{mgmt_plan}

----------------------------------------
Electronically signed: AMEXAN Clinical OS
"""
        return note.strip()

    def generate_soap_note(self, acet_state: Dict[str, Any]) -> str:
        """SOAP note for ward round"""
        exam = acet_state.get("examination", {})
        gen = exam.get("general_exam", {})
        symptoms = acet_state.get("symptom_present", {})
        context = acet_state.get("crs", {}).get("active_context", "unknown")
        differentials = acet_state.get("differential", [])
        management = acet_state.get("management", {})

        symptom_names = [k for k, v in symptoms.items() if v]
        subjective = f"Patient reports: {', '.join(symptom_names) if symptom_names else 'no new complaints'}"
        objective = f"Vitals: BP {gen.get('bp_systolic', '?')}/{gen.get('bp_diastolic', '?')}, P {gen.get('pulse_rate', '?')}, R {gen.get('respiratory_rate', '?')}, T {gen.get('temperature', '?')}C, SpO2 {gen.get('spo2', '?')}%"
        assessment = f"Working context: {context}. Top differential: {differentials[0]['name'] if differentials else 'pending'}"
        plan_items = []
        for key in ["immediate", "medical", "surgical", "monitoring"]:
            items = management.get(key, [])
            if items:
                plan_items.extend(items)
        plan = f"Continue current plan. {' | '.join(plan_items[:3])}" if plan_items else "Awaiting plan."

        note = f"""
SOAP NOTE - WARD ROUND
=======================
Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}

S: {subjective}
O: {objective}
A: {assessment}
P: {plan}

Electronically signed: AMEXAN Clinical OS
"""
        return note.strip()

    def generate_discharge_summary(self, acet_state: Dict[str, Any]) -> str:
        """Discharge summary"""
        idata = acet_state.get("identity", {})
        final_dx = acet_state.get("diagnosis", {}).get("final", "Not specified")
        working_dx = acet_state.get("diagnosis", {}).get("working", "Unknown")
        management = acet_state.get("management", {})

        note = f"""
DISCHARGE SUMMARY
=================
Patient: {idata.get('name', 'Unknown')}, {idata.get('age', '?')}y, MRN: {idata.get('patient_id', 'N/A')}
Discharged: {datetime.datetime.now().strftime('%Y-%m-%d')}

ADMITTING DIAGNOSIS: {working_dx}
DISCHARGE DIAGNOSIS: {final_dx}

BRIEF HOSPITAL COURSE:
Patient admitted with symptoms as above. Responded to treatment as per plan. No complications.

DISCHARGE MEDICATIONS: {', '.join(management.get('medical', [])) if management.get('medical') else 'None documented'}
FOLLOW-UP: {management.get('referral', 'None scheduled')}
CONDITION ON DISCHARGE: Stable

----------------------------------------
Electronically signed: AMEXAN Clinical OS
"""
        return note.strip()

    def generate_referral_letter(self, acet_state: Dict[str, Any], referring_doctor: str = "Consultant", specialty: str = "General Surgery") -> str:
        """Referral letter"""
        idata = acet_state.get("identity", {})
        exam = acet_state.get("examination", {})
        context = acet_state.get("crs", {}).get("active_context", "unknown")
        diffs = acet_state.get("differential", [])

        summary = f"{idata.get('name', 'Patient')} is a {idata.get('age', '?')} year old with a surgical presentation. "
        if diffs:
            summary += f"Working diagnosis favours {diffs[0]['name']}."

        letter = f"""
REFERRAL LETTER
===============
To: Dr. {referring_doctor}, {specialty}
From: AMEXAN Clinical System
Date: {datetime.datetime.now().strftime('%Y-%m-%d')}

RE: {idata.get('name', 'Unknown')}, {idata.get('age', '?')}y, MRN {idata.get('patient_id', 'N/A')}

Dear Colleague,

I am referring this patient for further evaluation and management.

CLINICAL SUMMARY:
{summary}

EXAMINATION FINDINGS:
General: {exam.get('general_exam', {}).get('general_appearance', 'Not recorded')}
Abdomen: {exam.get('abdominal_exam', {}).get('abdo_palpation_tenderness', '?')}

CURRENT WORKING DIAGNOSIS:
{context} / {diffs[0]['name'] if diffs else 'Uncertain'}

REQUEST:
Please see and advise regarding further diagnostic workup and management.

Thank you for your collaboration.

Sincerely,
AMEXAN Clinical OS
"""
        return letter.strip()

    def generate_clinic_note(self, acet_state: Dict[str, Any]) -> str:
        """Outpatient clinic note"""
        return self.generate_hp_note(acet_state)
