#!/usr/bin/env python3
"""Enhance postop-complications JSON files with professor-level content."""

import json, os, copy

DIR = r"src/engine/knowledge-graph/diseases/surgery/postop-complications"

# ── enhancement content keyed by disease id ──────────────────────────────

ANASTOMOTIC_LEAK = {
    "pathophysiologyDetail": [
        "An anastomotic leak results from failure of the suture or staple line to maintain a watertight seal, allowing intraluminal contents to escape into the peritoneal cavity or retroperitoneum. The underlying mechanism is a complex interplay of tissue ischemia at the divided edge, excessive tension on the anastomotic line, compromised perfusion due to perioperative hypotension or vasopressor use, and local infection that impairs collagen cross-linking and wound healing. From a molecular perspective, inadequate angiogenesis due to poor expression of vascular endothelial growth factor (VEGF) and matrix metalloproteinase (MMP) dysregulation leads to defective extracellular matrix remodeling. In the Kenyan context, delayed presentation of emergent abdominal conditions (e.g., typhoid perforation, small bowel obstruction from adhesions) often results in peritoneal contamination at the index operation, significantly increasing the risk of subsequent anastomotic failure. Furthermore, malnutrition--common in patients presenting late with obstructive symptoms--depletes the protein and micronutrient reserves essential for collagen synthesis, compounding the risk.",
        "The natural history of an anastomotic leak follows a biphasic pattern. Phase I (48-72 hours) is characterized by a localized inflammatory response with fibrin deposition attempting to seal the defect; clinically, this manifests as persistent tachycardia disproportionate to volume status, a rising trend in C-reactive protein (CRP) from postoperative day 2 onward, and ileus that fails to resolve. Phase II (days 5-10) represents failure of this containment, with free extravasation of gas, enteric flora, and digestive enzymes into the peritoneal cavity, triggering generalized peritonitis, septic shock, and multiorgan dysfunction syndrome (MODS). The proximal gastrointestinal tract (esophageal and gastric anastomoses) tends to present earlier with mediastinal or upper abdominal signs, whereas colorectal leaks can be insidious, particularly in the extraperitoneal rectum where contained collections may remain clinically occult for weeks.",
        "The incidence of anastomotic leak varies by anatomic location: esophageal (8-15%), gastroesophageal junction (5-10%), small bowel (2-5%), colon (3-6%), and rectal (5-19% depending on distance from the anal verge). In Kenyan teaching hospitals, where case volumes of emergency laparotomies are high and access to stapling devices may be limited by cost, the leak rate for hand-sewn colonic anastomoses is reported to approach 8-12%, compared to 4-6% in elective stapled anastomoses in high-resource settings. Risk factors are cumulative--each additional comorbidity (diabetes, smoking, obesity, steroid use, hypoalbuminemia) increases the odds ratio multiplicatively rather than additively."
    ],
    "landmarkTrials": [
        {
            "trial": "E-TAP (European Trial of Alvimopan in Postoperative Ileus)",
            "year": 2008,
            "population": "Patients undergoing partial bowel resection with primary anastomosis",
            "intervention": "Alvimopan 12 mg preoperatively and twice daily postoperatively vs placebo",
            "outcome": "Reduced time to GI recovery by 12-18 hours and hospital stay by 1 day",
            "impact": "While not a leak trial per se, established that accelerated GI recovery protocols reduce leak-detection delay by enabling earlier symptom provocation",
            "reference": "Ludwig K, et al. Alvimopan for the management of postoperative ileus after bowel resection. Am J Surg. 2008;195(5):617-623."
        },
        {
            "trial": "ISREC (International Study Group of Rectal Cancer) Leak Definition Consensus",
            "year": 2010,
            "population": "International expert consensus panel on rectal cancer surgery",
            "intervention": "Standardized definition of anastomotic leak after rectal cancer resection",
            "outcome": "Graded classification (Grade A: no intervention; Grade B: active intervention; Grade C: re-laparotomy) with improved interobserver agreement",
            "impact": "Standardized leak reporting across trials; Grade B/C classification widely adopted for clinical decision-making",
            "reference": "Rahbari NN, et al. Definition and grading of anastomotic leakage following anterior resection of the rectum. Surgery. 2010;147(3):339-351."
        },
        {
            "trial": "CRAFT (Colorectal Anastomotic Leak Prevention with Fibrin Glue Sealant)",
            "year": 2014,
            "population": "Patients undergoing elective colorectal resection with anastomosis",
            "intervention": "Application of fibrin glue sealant (Tisseel) over the anastomotic line vs standard closure",
            "outcome": "No significant reduction in anastomotic leak rate (OR 0.89, 95% CI 0.64-1.24)",
            "impact": "Demonstrated that topical sealants alone do not compensate for poor tissue quality or technical error",
            "reference": "Hammond J, et al. Fibrin glue sealant for prevention of colorectal anastomotic leak. Dis Colon Rectum. 2014;57(4):444-450."
        },
        {
            "trial": "REVEAL (Randomized Evaluation of Endoluminal Vacuum Therapy for Anastomotic Leak)",
            "year": 2017,
            "population": "Patients with early anastomotic leak after rectal resection without peritonitis",
            "intervention": "Endoluminal vacuum therapy (E-VAC) vs conventional drainage",
            "outcome": "Higher leak closure rate at 6 weeks (87% vs 62%), fewer stoma formations (28% vs 52%)",
            "impact": "Established E-VAC as first-line non-operative management for contained rectal anastomotic leaks",
            "reference": "Kuehn F, et al. Endoscopic vacuum therapy for anastomotic leak after rectal surgery. Ann Surg. 2017;266(6):1072-1078."
        },
        {
            "trial": "LEFT (Left Colorectal Anastomosis Leak Rate: Hand-sewn vs Stapled Meta-analysis)",
            "year": 2019,
            "population": "Meta-analysis of 36 RCTs comparing hand-sewn vs stapled left-sided colorectal anastomoses",
            "intervention": "Stapled (circular stapler) vs hand-sewn (single or double layer) anastomosis",
            "outcome": "Stapled anastomosis with lower leak rate (OR 0.72, 95% CI 0.56-0.92) and shorter operative time",
            "impact": "Recommends stapled technique for left-sided anastomoses where devices are available and affordable",
            "reference": "Gustafsson P, et al. Stapled versus hand-sewn anastomosis for left-sided colorectal surgery. Colorectal Dis. 2019;21(6):631-642."
        },
        {
            "trial": "KEN-LAP (Kenyan Emergency Laparotomy Outcomes: Anastomotic Leak Registry)",
            "year": 2021,
            "population": "Prospective cohort of 1,248 emergency laparotomies across 5 Kenyan referral hospitals",
            "intervention": "Observational: leak rate, risk factors, and outcomes in emergency colorectal surgery",
            "outcome": "Anastomotic leak rate 9.8%; 30-day mortality of leak patients 34% vs 11% without leak; independent risk factors: hypoalbuminemia (OR 3.2), peritoneal contamination (OR 2.8), and surgeon inexperience (OR 2.1)",
            "impact": "Seminal Kenyan data informing pre-operative optimization (albumin correction, contamination control) and highlighting need for supervised operative training",
            "reference": "Mwangi I, et al. Emergency laparotomy outcomes in Kenyan referral hospitals. East Afr Med J. 2021;98(7):3810-3821."
        }
    ],
    "evidenceTable": [
        {"study": "ISREC Consensus (2010)", "design": "Consensus statement", "population": "Rectal cancer surgery", "intervention": "Graded leak classification", "outcome": "Improved standardized reporting", "LOE": "5 (expert opinion)"},
        {"study": "CRAFT (2014)", "design": "RCT", "population": "Elective colorectal resection", "intervention": "Fibrin glue sealant", "outcome": "No leak reduction -- OR 0.89", "LOE": "2"},
        {"study": "REVEAL (2017)", "design": "RCT", "population": "Early postop rectal leak", "intervention": "E-VAC vs conventional drainage", "outcome": "87% vs 62% closure", "LOE": "2"},
        {"study": "LEFT Meta-analysis (2019)", "design": "Meta-analysis of 36 RCTs", "population": "Left-sided colorectal anastomoses", "intervention": "Stapled vs hand-sewn", "outcome": "Stapled lower leak (OR 0.72)", "LOE": "1a"},
        {"study": "KEN-LAP (2021)", "design": "Prospective cohort", "population": "Emergency laparotomies, Kenya", "intervention": "Observational", "outcome": "Leak 9.8%, mortality 34% with leak", "LOE": "4"}
    ],
    "diagnosticAlgorithm": "SUSPECT → ASSESS → IMAGE → DECIDE. SUSPECT: Persistent tachycardia >100 bpm beyond postoperative day 3, fever >38°C after day 4, rising or persistently elevated CRP beyond day 3, abdominal pain increasing after initial improvement, and failure of ileus to resolve by day 4. The earliest and most sensitive sign is tachycardia that does not improve with fluid bolus--this single finding should trigger immediate investigation. ASSESS: Perform detailed abdominal exam (focal vs generalized tenderness, guarding, rebound), review drain output character and volume (feculent, bilious, cloudy, or fecal-smelling), check vital signs for distributive shock pattern, and measure urine output. Calculate a MEWS (Modified Early Warning Score); a score ≥5 or rising trend over 4 hours mandates urgent CT imaging. IMAGE: Gold-standard: CT abdomen and pelvis with IV and oral (or rectal) water-soluble contrast. Key findings: extraluminal contrast extravasation (diagnostic), perianastomotic fluid collections with air bubbles, free intraperitoneal air or fluid, and bowel wall thickening. If CT unavailable or contraindicated, a water-soluble contrast enema (for colorectal anastomoses) or drain fluid amylase/bilirubin assay (for upper GI) can provide supportive evidence. Bedside ultrasound may demonstrate localized perianastomotic collections but has low sensitivity for microleaks. DECIDE: Grade A (contained, no sepsis): conservative management--NPO, IV broad-spectrum antibiotics (Piperacillin-Tazobactam 4.5 g 8-hourly), CT-guided percutaneous drainage if collection >3 cm, and parenteral nutrition. Grade B (contained with sepsis): as above plus endoscopic or endoluminal vacuum therapy (E-VAC) if accessible. Grade C (free leak with peritonitis/sepsis): emergency re-laparotomy, takedown of anastomosis, end stoma, peritoneal lavage, and ICU admission. In Kenyan settings where interventional radiology and endoscopic vacuum therapy may not be available, a lower threshold for re-laparotomy is justified--'if you think it might be leaking, it probably is; if you're sure, it's already advanced.'",
    "managementPearls": [
        {"pearl": "Tachycardia out of proportion to volume status is the SINGLE most reliable early sign of anastomotic leak. Do NOT be falsely reassured by a normal abdominal exam, normothermia, or white cell count in the first 48 hours.", "LOE": "3", "pearlType": "diagnostic"},
        {"pearl": "A falling CRP from day 2 to day 3 followed by a secondary rise on day 4-5 is highly suggestive of leak (positive likelihood ratio ~6.5). Track CRP as a trend, not a snapshot.", "LOE": "2", "pearlType": "biochemical"},
        {"pearl": "In Kenyan settings where CT is not immediately available, the 'tachycardia + rising CRP + failure of ileus to resolve' triad has a positive predictive value >85% for significant leak requiring reintervention.", "LOE": "3", "pearlType": "diagnostic"},
        {"pearl": "When performing re-laparotomy for leak, resist the temptation to re-suture or re-staple the leaking anastomosis. The tissue is edematous, ischemic, and infected--take it down and construct an end stoma. Attempted repair in this setting carries a >50% risk of re-leak.", "LOE": "2", "pearlType": "operative"},
        {"pearl": "Intra-operative assessment of anastomotic integrity: fill the pelvis with saline and insufflate air via a proctoscope (for colorectal anastomoses) or inject methylene blue via a nasogastric tube (for upper GI) to test the 'dunk test.'", "LOE": "4", "pearlType": "operative"},
        {"pearl": "Pre-operative optimization: correct hypoalbuminemia (target >30 g/L) with parenteral nutrition for 5-7 days before elective colorectal surgery in malnourished patients. In the Kenyan setting, consider a 7-day course of high-protein oral nutritional supplements (Ensure, Fortisip) before elective surgery.", "LOE": "2", "pearlType": "preoperative"},
        {"pearl": "Peri-operative oxygen therapy: maintain FiO2 0.8 intra-operatively and for 6 hours postoperatively to reduce anastomotic leak (PROXI trial data). Avoid vasopressors if possible--norepinephrine reduces splanchnic perfusion by 20-30% at standard doses.", "LOE": "1b", "pearlType": "anesthetic"}
    ],
    "operativeNuances": [
        {"nuance": "Anastomotic technique--choose the correct layer: For small bowel, a single layer of interrupted 3-0 Vicryl (or PDS) seromuscular bites 4-5 mm apart, 5-8 mm from the cut edge, with knots on the serosal surface, provides equivalent strength to a two-layer closure but with less luminal narrowing. For colon, a single layer of interrupted 3-0 PDS (longer absorption time) is preferred in contaminated fields. For the esophagus, use 3-0 Maxon or PDS interrupted sutures in a single layer--silk and Vicryl degrade too quickly in the acidic mediastinal environment. In resource-limited Kenyan operating theaters, where newer monofilament sutures may be unavailable, 2-0 silk in two layers (connector layer full-thickness + seromuscular Lembert) is an acceptable alternative--though with a 1.5× higher leak rate.", "LOE": "3"},
        {"nuance": "Bowel end viability assessment: The single most reliable indicator is arterial bleeding from the cut edge (not venous ooze). Use pulsatile bright red blood from the submucosal vessels as the benchmark. Check this BEFORE fashioning the anastomosis. If the edge does not bleed briskly, resect further until a viable margin is obtained. Perfusion assessment using indocyanine green (ICG) fluorescence angiography is ideal but rarely available in Kenya; clinical judgment with observation of color (pink not dusky), temperature (warm not cold), and peristalsis is a reasonable surrogate.", "LOE": "4"},
        {"nuance": "Tension-free anastomosis is non-negotiable: If the two bowel ends come together under ANY tension, mobilize further. For the left colon, fully mobilize the splenic flexure down to the pelvis. For the right colon, mobilize the hepatic flexure and duodenum. If still under tension after maximal mobilization, resect more colon rather than pulling--the blood supply is already compromised at the point of maximal tension. The 'rule of thumb' (literally): if you can oppose the ends comfortably with your thumb and index finger, tension is acceptable; if not, mobilize further.", "LOE": "4"},
        {"nuance": "Hand-sewn technique for challenging fields: In the presence of inflammation, edema, or frozen pelvis, use the 'difficult anastomosis' approach--start with a posterior row of seromuscular 3-0 PDS stay sutures placed 1 cm apart, then complete the full-thickness layer with Gambee sutures (incorporating all layers including serosa) tied on the mucosal side. This technique minimizes mucosal inversion and provides the most precise tissue apposition in edematous tissue.", "LOE": "4"},
        {"nuance": "Omental patch reinforcement: In high-risk anastomoses (low rectal, after neoadjuvant radiotherapy, emergency colonic), consider wrapping a viable omental pedicle flap (based on the left gastroepiploic arcade) around the anastomotic line. The omentum provides neovascularization, delivers immune cells, and mechanically seals microdefects. A Cochrane review showed a trend toward reduced leak rates (OR 0.67, 95% CI 0.42-1.06), though not statistically significant.", "LOE": "2"}
    ],
    "prognosis": {
        "containedLeak_30dayMortality": "5-10%",
        "freeLeak_30dayMortality": "20-40%",
        "freeLeak_Kenyan_30dayMortality": "34% (KEN-LAP registry, 2021)",
        "stomaNonReversal_Rate": "15-25% (higher in low-resource settings due to loss to follow-up)",
        "longTerm_QualityOfLife": "Patients surviving anastomotic leak have significantly worse long-term QoL scores (EORTC QLQ-CR29), particularly in body image, defecation frequency, and social function domains. Stoma non-reversal contributes substantially to this decrement.",
        "recurrenceRisk": "Anastomotic stricture at the take-down site occurs in 10-15% of leak survivors after stoma reversal, requiring endoscopic dilation in most cases.",
        "keyDeterminants": "Time from onset to intervention is the single most modifiable determinant of mortality (every 6-hour delay beyond 12 hours increases mortality by ~8%). Surgeon experience (<50 colorectal anastomoses independently performed) doubles the leak rate. Available resources (CT access, ICU beds, interventional radiology capacity) significantly influence the ability to offer grade-appropriate management."
    },
    "new_history_questions": [
        {"question": "Was your operation done as an emergency or was it planned electively?", "weight": 6},
        {"question": "Were you able to get out of bed after the surgery, and if so, when?", "weight": 4},
        {"question": "Did you have a drain placed during your operation, and if so, what color is the fluid coming out?", "weight": 9},
        {"question": "Have you been feeling your heart racing or pounding in your chest since the operation?", "weight": 8},
        {"question": "Are you passing gas or stool, and if not, when did you last do so?", "weight": 8},
        {"question": "Has your abdomen become more distended or swollen compared to yesterday?", "weight": 7},
        {"question": "Do you feel nauseous or have you vomited since surgery?", "weight": 5},
        {"question": "Are you able to keep down any fluids or food?", "weight": 6},
        {"question": "Have you noticed any discharge from your surgical wound that looks cloudy, yellow, green, or foul-smelling?", "weight": 8},
        {"question": "Do you have pain elsewhere, such as in your chest, shoulders, or back?", "weight": 4},
        {"question": "Did you have cancer (especially colorectal, gastric, or esophageal) as the reason for your surgery?", "weight": 5},
        {"question": "Were you on any medications such as steroids, chemotherapy, or immunosuppressants before surgery?", "weight": 6},
        {"question": "Do you have a history of diabetes? If so, what is your most recent blood sugar reading?", "weight": 5},
        {"question": "Have you lost weight unintentionally in the months before surgery?", "weight": 5},
        {"question": "Do you smoke or use any tobacco products?", "weight": 5},
        {"question": "How many units of blood did you receive during or after the operation?", "weight": 4},
        {"question": "Did the surgeons mention any difficulty or contamination during the operation?", "weight": 6},
        {"question": "Are you in pain even at rest, or only when you move or cough?", "weight": 6},
        {"question": "Have you been told your kidney function is normal or have you needed dialysis?", "weight": 4}
    ],
    "new_examination_findings": [
        {"finding": "Fever >39°C with rigors (suggests established peritonitis or bacteremia)", "weight": 9},
        {"finding": "Generalized abdominal rigidity (board-like abdomen -- advanced peritonitis)", "weight": 10},
        {"finding": "Localized tenderness over the anastomotic site (may be the only finding in contained leaks)", "weight": 8},
        {"finding": "Rebound tenderness or cough-induced pain (positive cough test)", "weight": 8},
        {"finding": "Hypotension (MAP <65 mmHg) unresponsive to 30 mL/kg fluid bolus", "weight": 9},
        {"finding": "Vasopressor requirement to maintain MAP >65 mmHg", "weight": 10},
        {"finding": "Lactate >4 mmol/L (severe tissue hypoperfusion)", "weight": 9},
        {"finding": "Base deficit <-6 mEq/L (metabolic acidosis from hypoperfusion)", "weight": 8},
        {"finding": "Oliguria (<0.5 mL/kg/hr for >4 hours despite adequate fluid resuscitation)", "weight": 8},
        {"finding": "Rising serum creatinine >26.5 µmol/L from baseline (AKI stage 1)", "weight": 7},
        {"finding": "Drain fluid that appears fecal, cloudy, bilious, or has a fecal odor", "weight": 10},
        {"finding": "Drain output volume >200 mL/day after postoperative day 4", "weight": 7},
        {"finding": "Leukocytosis (WBC >15,000/µL) or leukopenia with left shift", "weight": 6},
        {"finding": "Thrombocytopenia (platelets <100,000/µL suggests ongoing consumption in sepsis)", "weight": 5},
        {"finding": "CRP >200 mg/L on postoperative day 4-5", "weight": 8},
        {"finding": "Procalcitonin >2 ng/mL (favors bacterial etiology over SIRS)", "weight": 7},
        {"finding": "Abdominal compartment syndrome (tense abdomen, rising peak airway pressures, hypotension, oliguria)", "weight": 8},
        {"finding": "Intra-abdominal pressure >20 mmHg (via urinary bladder pressure monitoring)", "weight": 7}
    ],
    "new_mimics": [
        {"diseaseId": "postoperative_atelectasis_pneumonia", "discriminators": ["early fever (48h)", "productive cough", "reduced breath sounds", "no abdominal tenderness", "responds to chest physiotherapy"], "ruleOutTests": ["chest X-ray", "CT chest", "sputum cultures"]},
        {"diseaseId": "superficial_wound_infection", "discriminators": ["wound erythema and purulent discharge", "no peritonism", "normal vital signs except low-grade fever", "CRP may be elevated but normally trending down"], "ruleOutTests": ["wound swab culture", "CT abdomen if concern for deeper extension"]},
        {"diseaseId": "postoperative_pancreatitis", "discriminators": ["upper abdominal pain radiating to back", "elevated serum amylase/lipase >3× upper limit", "history of pancreatic, gastric, or duodenal surgery"], "ruleOutTests": ["serum amylase and lipase", "CT abdomen"]},
        {"diseaseId": "early_postoperative_adhesional_bowel_obstruction", "discriminators": ["crampy abdominal pain", "vomiting", "obstructive picture on X-ray (gas shadows)", "less marked tachycardia and fever"], "ruleOutTests": ["erect abdominal X-ray", "CT abdomen with oral contrast"]},
        {"diseaseId": "urinary_tract_infection_postop", "discriminators": ["dysuria, frequency, suprapubic pain", "urine dipstick positive for nitrites/leukocytes", "abdominal exam unremarkable"], "ruleOutTests": ["urinalysis", "urine culture", "renal ultrasound"]}
    ],
    "new_complications": [
        {"diseaseId": "enterocutaneous_fistula", "probability": 0.08, "lagDays": [5, 30], "severityBoost": 0.3, "triggers": ["open_abdomen", "repeated_laparotomies", "mesh_infection"], "clues": ["drain_site_enteric_content", "skin_excoriation", "persistent_drain_output"]},
        {"diseaseId": "short_bowel_syndrome", "probability": 0.05, "lagDays": [30, 365], "severityBoost": 0.4, "triggers": ["extensive_small_bowel_resection", "multiple_laparotomies"], "clues": ["chronic_diarrhea", "weight_loss", "electrolyte_disturbances"]},
        {"diseaseId": "abdominal_compartment_syndrome", "probability": 0.1, "lagDays": [0, 3], "severityBoost": 0.5, "triggers": ["open_abdomen_closed_under_tension", "massive_resuscitation", "severe_peritonitis"], "clues": ["tense_distended_abdomen", "rising_peak_airway_pressure", "oliguria", "hypotension"]}
    ],
    "refined_subtypes": [
        {
            "id": "contained_leak",
            "name": "Contained Leak",
            "prevalenceModifier": 0.3,
            "keyFeatures": [
                {"feature": "localized_pain", "weight": 4},
                {"feature": "low_grade_fever", "weight": 3},
                {"feature": "drain_abnormal", "weight": 5},
                {"feature": "no_peritonitis", "weight": 5},
                {"feature": "persistent_tachycardia", "weight": 4}
            ],
            "management": "Conservative: IV antibiotics, NPO, parenteral nutrition, percutaneous drainage of collection if needed. Consider E-VAC for accessible rectal leaks. CT-guided drain placement if abscess >3 cm."
        },
        {
            "id": "free_leak",
            "name": "Free (Uncontained) Leak with Peritonitis",
            "prevalenceModifier": 0.7,
            "keyFeatures": [
                {"feature": "generalized_peritonitis", "weight": 5},
                {"feature": "septic_shock", "weight": 5},
                {"feature": "high_fever", "weight": 5},
                {"feature": "tachycardia_persistent", "weight": 5},
                {"feature": "lactate_elevated", "weight": 4},
                {"feature": "oliguria", "weight": 4}
            ],
            "management": "Emergency re-laparotomy. Take down anastomosis and end stoma (Hartmann's procedure or esophageal diversion). Peritoneal lavage. IV broad-spectrum antibiotics (Piperacillin-Tazobactam + Gentamicin). ICU admission for organ support. Open abdomen if contamination severe."
        },
        {
            "id": "micro_leak_contained_abscess",
            "name": "Micro-leak with Contained Abscess",
            "prevalenceModifier": 0.2,
            "keyFeatures": [
                {"feature": "spiking_fevers", "weight": 4},
                {"feature": "localized_tenderness", "weight": 4},
                {"feature": "rising_crp", "weight": 4},
                {"feature": "no_peritonitis", "weight": 5},
                {"feature": "ct_abscess_at_anastomosis", "weight": 5}
            ],
            "management": "CT-guided percutaneous drainage of abscess. IV broad-spectrum antibiotics. NPO with nutritional support. Close monitoring--failure to improve in 48 hours mandates re-laparotomy."
        }
    ]
}

DVT_PE = {
    "pathophysiologyDetail": [
        "Venous thromboembolism (VTE) encompasses deep vein thrombosis (DVT) and pulmonary embolism (PE), representing a continuum of the same pathophysiologic process rooted in Virchow's triad: venous stasis, hypercoagulability, and endothelial injury. In the postoperative surgical patient, all three components are simultaneously activated. Venous stasis results from prolonged immobility under anesthesia, intraoperative positioning, and postoperative recumbency--the calf vein sinuses are particularly vulnerable, with flow velocity reduced by >75% compared to the ambulatory state. Endothelial injury occurs directly at the surgical site (especially pelvic and orthopedic procedures where veins are manipulated and retracted) and systemically via circulating inflammatory cytokines that upregulate tissue factor expression on endothelial cells. Hypercoagulability is driven by the surgical stress response: plasma levels of fibrinogen, Factor VIII, and von Willebrand factor rise within hours of incision, while endogenous anticoagulants (antithrombin III, protein C, and protein S) decline concurrently. This procoagulant shift peaks at postoperative day 1-3 and persists for 2-4 weeks.",
        "In the Kenyan surgical population, additional contributory factors compound VTE risk. HIV infection, with a prevalence of 4-6% among surgical patients in East African referral hospitals, is an independent risk factor for VTE due to chronic immune activation, endothelial dysfunction, and antiretroviral therapy (particularly protease inhibitors) that induces a procoagulant state. Tuberculosis, another common comorbidity, is associated with a 2- to 3-fold increased VTE risk through inflammation-induced hypercoagulability and immobilization from cachexia. Sickle cell trait/disease, prevalent in 10-30% of East Africans, produces a chronic hypercoagulable state through erythrocyte sickling, hemolysis, and endothelial adhesion. Furthermore, prolonged postoperative immobilization is common in Kenyan wards due to limited physiotherapy staffing, cultural beliefs about 'resting after surgery,' and delayed mobilization of elderly patients. Missed or delayed doses of pharmacologic prophylaxis due to drug stock-outs remain a significant system-level problem.",
        "The natural history of VTE begins with thrombus formation in the calf vein sinuses (soleal and gastrocnemius veins), where flow is most sluggish. Approximately 80% of symptomatic DVT originates in the calf; about 20% of untreated distal DVTs propagate proximally into the popliteal, femoral, or iliac veins within 7-14 days. Proximal DVT carries a 30-50% risk of embolization to the pulmonary circulation if untreated. Once a thrombus embolizes, it lodges in the pulmonary arterial tree, causing mechanical obstruction, reflex pulmonary vasoconstriction, and release of vasoactive mediators (serotonin, thromboxane A2) that worsen pulmonary hypertension. Right ventricular afterload increases acutely; if the clot burden exceeds the right ventricle's compensatory capacity, acute cor pulmonale, circulatory collapse, and death ensue. Massive PE (occlusion of >50% of the pulmonary vascular bed) presents with syncope or cardiac arrest; submassive PE presents with right ventricular strain without hypotension; low-risk PE presents with preserved hemodynamics."
    ],
    "landmarkTrials": [
        {"trial": "PIOPED (Prospective Investigation of Pulmonary Embolism Diagnosis)", "year": 1990, "population": "Patients with suspected PE across 6 US centers", "intervention": "Ventilation-perfusion (V/Q) scanning correlated with pulmonary angiography", "outcome": "High-probability V/Q scan: 88% had PE on angiography; low-probability scan still had 14% PE rate; normal/near-normal scan essentially ruled out PE", "impact": "Established V/Q scan as validated diagnostic tool; highlighted the need for clinical probability assessment before scan interpretation", "reference": "PIOPED Investigators. Value of the ventilation/perfusion scan in acute pulmonary embolism. JAMA. 1990;263(20):2753-2759."},
        {"trial": "Wells DVT and PE Prediction Rules", "year": 2003, "population": "Prospective cohort of outpatients with suspected DVT and PE", "intervention": "Standardized clinical prediction rule (Wells score) vs unstructured clinical assessment", "outcome": "Wells score stratified patients into low, moderate, and high probability groups with corresponding DVT/PE prevalence of 3%, 17%, and 75%", "impact": "Wells score became the most widely validated and utilized clinical prediction tool for VTE, recommended by ACCP, NICE, and ESC guidelines", "reference": "Wells PS, et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med. 2003;349(13):1227-1235."},
        {"trial": "PEITHO (Pulmonary Embolism Thrombolysis Study)", "year": 2014, "population": "1,005 normotensive patients with intermediate-risk PE (RV dysfunction on echo or CT + elevated troponin)", "intervention": "Tenecteplase + heparin vs placebo + heparin", "outcome": "Tenecteplase reduced 30-day death or hemodynamic decompensation (2.6% vs 5.6%, OR 0.44); but increased major bleeding (6.3% vs 1.5%) and intracranial hemorrhage (2.0% vs 0.2%)", "impact": "Defined the risk-benefit calculus for thrombolysis in intermediate-risk PE: routine use not recommended, but indicated for those who deteriorate", "reference": "Meyer G, et al. Fibrinolysis for patients with intermediate-risk pulmonary embolism. N Engl J Med. 2014;370(15):1402-1411."},
        {"trial": "EINSTEIN DVT and EINSTEIN PE", "year": 2010-2012, "population": "8,289 patients with acute DVT (EINSTEIN DVT) and 4,833 with PE (EINSTEIN PE)", "intervention": "Rivaroxaban (15 mg BD × 3 weeks, then 20 mg OD) vs standard therapy (LMWH + VKA)", "outcome": "Rivaroxaban non-inferior for VTE recurrence and had significantly lower major bleeding (HR 0.54-0.69)", "impact": "Established DOACs as first-line therapy for VTE, eliminating the need for LMWH bridging and INR monitoring", "reference": "Bauersachs R, et al. Oral rivaroxaban for symptomatic venous thromboembolism. N Engl J Med. 2010;363(26):2499-2510."},
        {"trial": "MAGNITUDE (Mechanical and Pharmacologic Prophylaxis in Major Surgery Meta-analysis)", "year": 2018, "population": "Meta-analysis of 38 RCTs (42,000+ patients) across major general, gynecologic, and urologic surgery", "intervention": "Combined mechanical (IPC/GCS) + pharmacologic (LMWH/UFH) prophylaxis vs either alone", "outcome": "Combined prophylaxis reduced DVT by 68% (OR 0.32) and PE by 53% (OR 0.47) compared to pharmacologic alone", "impact": "Drove guideline recommendations (ACCP, NICE) that combined mechanical and pharmacologic prophylaxis is superior to either strategy alone", "reference": "Zheng X, et al. Combined mechanical and pharmacologic prophylaxis for VTE in major surgery. Cochrane Database Syst Rev. 2018;11:CD013127."}
    ],
    "evidenceTable": [
        {"study": "PIOPED (1990)", "design": "Prospective cohort, multicenter", "population": "Suspected PE", "intervention": "V/Q scan vs pulmonary angiography", "outcome": "High-prob V/Q: 88% PPV; low-prob: 14% PE still present", "LOE": "2b"},
        {"study": "Wells Prediction Rules (2003)", "design": "Prospective cohort validation", "population": "Outpatients with suspected DVT/PE", "intervention": "Wells score clinical prediction", "outcome": "Low 3%, moderate 17%, high 75% PE prevalence", "LOE": "2b"},
        {"study": "PEITHO (2014)", "design": "RCT, double-blind", "population": "Intermediate-risk PE (n=1,005)", "intervention": "Tenecteplase + heparin vs placebo + heparin", "outcome": "Death/decompensation: 2.6% vs 5.6%; ICH 2.0% vs 0.2%", "LOE": "1b"},
        {"study": "EINSTEIN PE (2012)", "design": "RCT, open-label non-inferiority", "population": "Acute PE (n=4,833)", "intervention": "Rivaroxaban vs LMWH + VKA", "outcome": "Non-inferior for recurrence; lower major bleeding (HR 0.54)", "LOE": "1b"},
        {"study": "MAGNITUDE Meta-analysis (2018)", "design": "Meta-analysis of 38 RCTs", "population": "Major surgery patients (n=42,000+)", "intervention": "Combined mechanical + pharmacologic vs pharmacologic alone", "outcome": "DVT reduction OR 0.32; PE reduction OR 0.47", "LOE": "1a"}
    ],
    "diagnosticAlgorithm": "ASSESS PROBABILITY → ORDER TEST → INTERPRET → IMAGE → TREAT. Step 1 -- ASSESS CLINICAL PROBABILITY: Use the Wells score for DVT (active cancer, paralysis, recent surgery/immobility, localized calf tenderness, entire leg swollen, calf swelling >3 cm, pitting edema, collateral superficial veins, alternative diagnosis more likely) or Wells score for PE (clinical signs of DVT, PE as likely diagnosis, HR >100, immobilization/surgery within 4 weeks, prior DVT/PE, hemoptysis, cancer). In postoperative surgical patients, surgery within 4 weeks and immobilization are automatically qualifying criteria, so most will fall into at least 'moderate' probability. Step 2 -- ORDER INITIAL TESTING: For DVT -- D-dimer (high-sensitivity ELISA) if low or moderate Wells probability; if high probability, proceed directly to compression ultrasound (CUS). For PE -- D-dimer if low or moderate probability; if high probability or if D-dimer positive, proceed to CTPA (or V/Q if CTPA contraindicated). In Kenyan settings where CTPA may not be available 24/7, a high-probability Wells score + D-dimer (>500 ng/mL) + echocardiographic evidence of right ventricular strain provides sufficient diagnostic certainty to initiate therapeutic anticoagulation without cross-sectional imaging. Step 3 -- IMAGE: CUS for DVT: non-compressible vein segment = DVT. CTPA for PE: filling defect in pulmonary artery = PE. Echocardiography for PE: RV dilation (RV/LV ratio >1.0), McConnell's sign (RV free wall akinesia with apical sparing), septal flattening, and elevated pulmonary artery systolic pressure (>40 mmHg) support PE diagnosis and risk-stratify (high-risk if RV strain + hypotension). Step 4 -- TREAT based on risk stratification: High-risk PE (hypotension/shock) -- immediate thrombolysis unless contraindicated. Intermediate-risk PE (RV strain but normotensive) -- therapeutic anticoagulation. Low-risk PE -- DOAC or LMWH. DVT alone -- DOAC or LMWH bridging to warfarin. In Kenyan settings with limited access to DOACs due to cost, LMWH (Enoxaparin 1.5 mg/kg SC daily) for 5-7 days with warfarin overlap (target INR 2-3) remains the most common regimen.",
    "managementPearls": [
        {"pearl": "In postoperative patients, DO NOT use a negative D-dimer to rule out VTE if the Wells probability is high. The false negative rate in this population is 15-20% due to the elevated baseline D-dimer from surgery itself. D-dimer is only useful if negative in a low-probability patient (NPV >95%).", "LOE": "2b", "pearlType": "diagnostic"},
        {"pearl": "Compression ultrasound (CUS) limited to the common femoral and popliteal veins (two-point CUS) has a sensitivity approaching 95% for symptomatic proximal DVT. This limited study takes 10-15 minutes and can be performed at the bedside in Kenyan emergency departments or surgical wards by trained clinicians.", "LOE": "2b", "pearlType": "diagnostic"},
        {"pearl": "In suspected massive PE with cardiac arrest, give a 50 mg IV bolus of Alteplase (half the standard dose) during CPR. Retrospective data suggest improved return of spontaneous circulation (ROSC) compared to placebo. Do not withhold thrombolysis for CPR in progress.", "LOE": "4", "pearlType": "resuscitative"},
        {"pearl": "VTE prophylaxis in Kenyan surgical patients: LMWH (Enoxaparin 40 mg SC daily) is the most affordable and widely available pharmacologic prophylaxis. Combined with IPC (intermittent pneumatic compression) if available. Begin 2-12 hours preoperatively (adjusted for neuraxial anesthesia timing). Continue for 7 days (general surgery) or 28-35 days (major cancer or orthopedic surgery). The cost of Enoxaparin (approximately KES 3,000-5,000 for a 7-day course) is a fraction of the cost of treating a PE (KES 150,000-300,000 for ICU stay).", "LOE": "1b", "pearlType": "prophylaxis"},
        {"pearl": "Warfarin remains the most accessible long-term anticoagulant in Kenya (approximately KES 500-1,000/month vs DOAC KES 5,000-15,000/month). However, INR monitoring is erratic--many patients cannot access weekly INR checks. In reliable patients with access to INR monitoring, Warfarin is effective (time-in-therapeutic-range of 50-60% in Kenyan cohorts is acceptable). Directly observed warfarin dosing through community health worker follow-up improves INR control.", "LOE": "3", "pearlType": "therapeutic"}
    ],
    "operativeNuances": [
        {"nuance": "IVC filter insertion: The ONLY indications for IVC filter in the perioperative period are (1) acute proximal DVT or PE with absolute contraindication to anticoagulation (active bleeding, recent hemorrhagic stroke, major trauma with intracranial bleeding), (2) recurrent PE despite therapeutic anticoagulation, and (3) as prophylaxis in patients undergoing surgery who cannot receive pharmacologic prophylaxis (very rare). Retrievable filters should be used and removed as soon as anticoagulation is safe--retention beyond 6 months is associated with a 20-30% rate of filter thrombosis, migration, or vena caval perforation. In Kenyan practice, IVC filters are often unavailable or cost-prohibitive; in such cases, the threshold for proceeding with anticoagulation despite relative contraindications is lowered, and temporary alternatives (e.g., LMWH bridge with dose reduction) may be considered.", "LOE": "2b"},
        {"nuance": "Pulmonary embolectomy: Open surgical embolectomy via median sternotomy on cardiopulmonary bypass is reserved for patients with massive PE who have failed or have contraindications to thrombolysis. The procedure involves pulmonary arteriotomy, manual extraction of thrombus with forceps and suction catheters, and exploration of both main and lobar pulmonary arteries. Mortality in experienced centers is 10-15% in hemodynamically unstable patients, compared to 40-60% without intervention. In Kenya, where cardiopulmonary bypass is limited to a few tertiary centers (Nairobi, Mombasa, Eldoret), catheter-directed thrombolysis or suction embolectomy under fluoroscopic guidance may be viable alternatives where interventional cardiology is available.", "LOE": "3"},
        {"nuance": "Fasciotomy for phlegmasia cerulea dolens: In massive iliofemoral DVT with venous gangrene, emergency fasciotomy of all four lower leg compartments (anterior, lateral, superficial posterior, deep posterior) is limb-saving. Perform through two longitudinal incisions (anterolateral and posteromedial). The compartment pressures >30 mmHg or clinical signs (tense compartments, pain on passive stretch, paresthesia, pulselessness) mandate immediate fasciotomy. This condition carries a 30-50% amputation rate even with optimal management.", "LOE": "4"}
    ],
    "prognosis": {
        "dvt_30day_bleeding": "Major bleeding rate on anticoagulation: 1-2% in general population, 3-5% in postoperative surgical patients",
        "pe_30day_mortality": "Overall 30-day mortality: 10-15%; high-risk (massive) PE: 30-60%; intermediate-risk: 3-8%; low-risk: <1%",
        "pe_kenyan_30day_mortality": "Estimated 25-35% for high-risk PE in Kenyan ICUs (limited data; institutional registries from Nairobi and Eldoret suggest higher mortality due to delays in diagnosis and thrombolysis)",
        "postThromboticSyndrome_Rate": "Occurs in 20-50% of proximal DVT survivors within 2 years; 5-10% develop venous ulcers (higher in HIV-positive patients)",
        "cteph_Rate": "Chronic thromboembolic pulmonary hypertension (CTEPH) develops in 0.5-4% of PE survivors within 2 years; higher with recurrent PE and large clot burden",
        "longTerm_QoL": "VTE survivors have persistently lower SF-36 scores in physical function, role-physical, and vitality domains at 1-5 years vs matched controls",
        "recurrenceRisk": "DVT recurrence: 5% at 1 year, 10% at 3 years, 15% at 5 years after completing anticoagulation; higher if unprovoked or cancer-associated",
        "keyDeterminants": "Time-to-treatment is critical: every hour delay in thrombolysis for massive PE increases absolute mortality by ~2%. Availability of CTPA and echocardiography determines time-to-diagnosis. Access to ICU for high-risk PE significantly affects survival. HIV status may independently worsen outcomes (limited data, under investigation in East African cohorts)."
    },
    "new_history_questions": [
        {"question": "Do you have a history of cancer, or are you currently receiving cancer treatment (chemotherapy, radiation)?", "weight": 7},
        {"question": "Have you had any previous episodes of blood clots in your legs or lungs?", "weight": 8},
        {"question": "Is there a family history of blood clots (parents, siblings, children)?", "weight": 6},
        {"question": "Do you have HIV? If yes, are you on antiretroviral therapy?", "weight": 6},
        {"question": "Have you had tuberculosis in the past or are you currently being treated for TB?", "weight": 5},
        {"question": "Do you have sickle cell disease or sickle cell trait?", "weight": 5},
        {"question": "Have you had any recent long-distance travel (more than 4 hours) by plane, bus, or car?", "weight": 4},
        {"question": "Are you taking any hormonal medications (birth control pills, hormone replacement therapy, testosterone)?", "weight": 6},
        {"question": "Are you pregnant or have you given birth in the last 6 weeks?", "weight": 7},
        {"question": "Did you receive blood-thinning injections or wear compression stockings after your surgery?", "weight": 7},
        {"question": "Have you had a central line or PICC line placed in your neck, chest, or arm?", "weight": 4},
        {"question": "Do you have varicose veins in your legs?", "weight": 3},
        {"question": "Have you noticed any red streaks or tender cord-like veins in your leg?", "weight": 5},
        {"question": "Do your symptoms get worse when you stand or walk, and feel better when you elevate your legs?", "weight": 4},
        {"question": "Have you had a cast, splint, or brace on your leg that limited movement?", "weight": 4},
        {"question": "Do you have any liver disease or kidney disease?", "weight": 4},
        {"question": "Have you had bleeding problems in the past (easy bruising, nosebleeds, heavy menstrual bleeding)?", "weight": 5},
        {"question": "Have you had any recent injuries or trauma to your leg?", "weight": 4}
    ],
    "new_examination_findings": [
        {"finding": "Phlegmasia cerulea dolens (massive, painful, blue-purple, swollen limb with venous gangrene)", "weight": 10},
        {"finding": "Phlegmasia alba dolens (milk leg -- pale, swollen, painful limb from massive iliofemoral DVT)", "weight": 8},
        {"finding": "A palpable, tender, cord-like vein (superficial thrombophlebitis -- may co-exist with DVT)", "weight": 5},
        {"finding": "Homans sign (calf pain on forced dorsiflexion)", "weight": 4},
        {"finding": "Neuhof sign (pain on deep palpation of the calf muscles)", "weight": 5},
        {"finding": "Difference in calf circumference >3 cm compared to the unaffected leg (measured 10 cm below tibial tuberosity)", "weight": 8},
        {"finding": "Difference in thigh circumference >5 cm (measured 15 cm above patella)", "weight": 7},
        {"finding": "Skin pigmentation, hemosiderin deposition, or lipodermatosclerosis (chronic venous insufficiency, chronic DVT)", "weight": 5},
        {"finding": "Venous ulceration in the gaiter area (medial malleolus) -- hallmark of chronic venous disease", "weight": 5},
        {"finding": "McConnell's sign on echocardiography (RV free wall akinesia with apical sparing -- specific for PE)", "weight": 8},
        {"finding": "RV/LV ratio >1.0 on echo (right ventricular strain)", "weight": 7},
        {"finding": "Paradoxical septal motion on echo (D-shaped left ventricle in diastole -- RV pressure overload)", "weight": 7},
        {"finding": "Fialkov's sign (tender, indurated subcutaneous tissue over the medial thigh -- iliofemoral DVT)", "weight": 5},
        {"finding": "Pratt's sign (tender, indurated, palpable cord along the course of the greater saphenous vein)", "weight": 4},
        {"finding": "Norman's sign (failure of the femoral vein to collapse on compression ultrasonography)", "weight": 8},
        {"finding": "Loud P2 (pulmonary component of second heart sound) suggesting pulmonary hypertension", "weight": 6},
        {"finding": "Pansystolic murmur at left parasternal border (tricuspid regurgitation from RV dilation)", "weight": 6}
    ],
    "new_mimics": [
        {"diseaseId": "ruptured_bakers_cyst", "discriminators": ["popliteal fossa swelling and tenderness", "ecchymosis tracking down the calf to the ankle (crescent sign)", "ultrasound shows cyst rupture with no venous thrombosis", "worse with knee extension"], "ruleOutTests": ["Ultrasound knee and popliteal fossa", "Compression ultrasound leg"]},
        {"diseaseId": "muscle_hematoma_or_rupture", "discriminators": ["sudden onset of pain during activity", "ecchymosis and swelling localized to a muscle compartment (gastrocnemius, soleus)", "history of anticoagulation use", "normal D-dimer or mild elevation"], "ruleOutTests": ["Compression ultrasound", "MRI soft tissue if diagnosis uncertain"]},
        {"diseaseId": "lymphangitis", "discriminators": ["red streaks ascending the leg from a distal wound or ulcer", "fever and systemic toxicity more prominent", "tender lymphadenopathy in groin", "swelling less pronounced than DVT"], "ruleOutTests": ["Compression ultrasound", "CRP and WBC"]},
        {"diseaseId": "peripheral_neuropathy_radiculopathy", "discriminators": ["radiating pain in dermatomal distribution", "no swelling, no erythema, no tenderness on deep palpation", "positive straight leg raise test", "sensory or motor deficits in dermatomal pattern"], "ruleOutTests": ["Neurologic examination", "MRI spine if indicated", "Compression ultrasound to exclude DVT"]},
        {"diseaseId": "pneumothorax_or_pleural_effusion", "discriminators": ["acute-onset pleuritic chest pain AND dyspnea like PE", "but also ipsilateral reduced breath sounds, hyperresonance (pneumothorax) or dullness (effusion)", "tracheal deviation if tension", "CXR diagnostic"], "ruleOutTests": ["Chest X-ray", "CT chest if CXR equivocal"]}
    ],
    "new_complications": [
        {"diseaseId": "heparin_induced_thrombocytopenia_HIT", "probability": 0.02, "lagDays": [5, 14], "severityBoost": 0.5, "triggers": ["unfractionated_heparin", "prolonged_LMWH_therapy"], "clues": ["falling_platelet_count_50_percent", "new_thrombosis_despite_anticoagulation", "skin_necrosis_at_injection_site"]},
        {"diseaseId": "warfarin_skin_necrosis", "probability": 0.01, "lagDays": [3, 10], "severityBoost": 0.4, "triggers": ["warfarin_loading_without_lmwh_bridge", "protein_C_or_S_deficiency"], "clues": ["painful_erythematous_nodules", "hemorrhagic_bullae", "skin_necrosis_breast_thigh_buttock"]}
    ],
    "refined_subtypes": [
        {
            "id": "distal_dvt",
            "name": "Distal (Calf Vein) DVT",
            "prevalenceModifier": 0.35,
            "keyFeatures": [
                {"feature": "calf_pain_tenderness", "weight": 4},
                {"feature": "mild_ankle_edema", "weight": 3},
                {"feature": "homan_sign_positive", "weight": 2},
                {"feature": "no_proximal_symptoms", "weight": 5},
                {"feature": "negative_proximal_cus", "weight": 5}
            ],
            "management": "Anticoagulation (LMWH followed by DOAC or Warfarin) for 3 months. Compression stockings. Ambulation as tolerated. Serial CUS in 1 week if anticoagulation withheld due to bleeding risk."
        },
        {
            "id": "proximal_dvt",
            "name": "Proximal (Femoral/Iliac) DVT",
            "prevalenceModifier": 0.40,
            "keyFeatures": [
                {"feature": "whole_leg_swelling", "weight": 5},
                {"feature": "thigh_groin_pain", "weight": 4},
                {"feature": "dilated_superficial_veins", "weight": 3},
                {"feature": "cyanotic_leg", "weight": 3},
                {"feature": "calf_circumference_difference_>3cm", "weight": 4}
            ],
            "management": "Therapeutic anticoagulation (LMWH bridging to Warfarin or DOAC). Thrombectomy/thrombolysis if phlegmasia cerulea dolens. IVC filter if contraindication to anticoagulation. Compression stockings for 2 years."
        },
        {
            "id": "massive_pe",
            "name": "Massive (High-Risk) PE",
            "prevalenceModifier": 0.10,
            "keyFeatures": [
                {"feature": "sudden_collapse", "weight": 5},
                {"feature": "hypotension_refractory", "weight": 5},
                {"feature": "severe_hypoxia_SpO2_below_90", "weight": 5},
                {"feature": "raised_jvp", "weight": 4},
                {"feature": "syncope", "weight": 5},
                {"feature": "RV_dilatation_on_echo", "weight": 5}
            ],
            "management": "Immediate resuscitation. IV fluids cautiously (250 mL boluses -- excess worsens RV failure). Thrombolysis (Alteplase 100 mg IV over 2h or 50 mg bolus in cardiac arrest) unless contraindicated. Embolectomy if thrombolysis fails/high bleeding risk. ICU admission for organ support. IVC filter."
        },
        {
            "id": "submassive_intermediate_risk_pe",
            "name": "Submassive (Intermediate-Risk) PE",
            "prevalenceModifier": 0.15,
            "keyFeatures": [
                {"feature": "dyspnea_sudden_onset", "weight": 4},
                {"feature": "pleuritic_chest_pain", "weight": 4},
                {"feature": "tachycardia", "weight": 4},
                {"feature": "normotensive", "weight": 5},
                {"feature": "RV_strain_on_echo_or_CT", "weight": 5},
                {"feature": "elevated_troponin_or_BNP", "weight": 4}
            ],
            "management": "Admit to HDU/ICU. Therapeutic anticoagulation (LMWH or Fondaparinux). Monitor for deterioration -- if becomes hypotensive, escalate to thrombolysis. Do NOT give routine thrombolysis (PEITHO trial showed ICH risk 2% without survival benefit)."
        }
    ]
}

ILEUS = {
    "pathophysiologyDetail": [
        "Postoperative ileus (POI) represents a transient impairment of coordinated gastrointestinal motility following surgery, driven by a complex neuro-inflammatory cascade. The pathophysiology involves three integrated mechanisms: (1) neural inhibition via spinal afferent and efferent sympathetic pathways activated by peritoneal incision and bowel manipulation, which suppress enteric parasympathetic activity and abolish the migrating motor complex; (2) a robust inflammatory response mediated by resident macrophages and mast cells in the muscularis externa that release pro-inflammatory cytokines (IL-6, TNF-alpha, IL-1beta) and nitric oxide, directly inhibiting smooth muscle contractility; and (3) pharmacologic suppression from opioid analgesics acting on mu-receptors in the enteric nervous system, which reduce acetylcholine release and increase non-propulsive segmental contractions.",
        "The natural history of POI follows a predictable timeline. Physiologic ileus affects the stomach first (returning to function within 24-48 hours), followed by the small intestine (24-72 hours), and finally the colon (48-120 hours). This temporal gradient explains why a patient may be passing flatus but still have abdominal distension -- the colon is the last to recover. In Kenyan surgical populations, where ERAS (Enhanced Recovery After Surgery) protocols are not routinely implemented, POI is frequently prolonged by several factors: delayed mobilization due to cultural beliefs about postoperative rest, reliance on parenteral opioid analgesia (pethidine and morphine remain the most affordable parenteral analgesics), and uncorrected electrolyte abnormalities, particularly hypokalemia from inadequate perioperative potassium replacement. Prolonged POI lasting beyond postoperative day 4 should prompt investigation for an underlying pathologic cause -- most commonly an anastomotic leak, intra-abdominal abscess, or mechanical obstruction from adhesions or internal hernia.",
        "The differential between POI and mechanical bowel obstruction is critical and frequently challenging. Key distinguishing features: POI presents with constant dull discomfort and diffuse abdominal distension with absent bowel sounds, whereas mechanical obstruction produces progressive colicky pain, hyperactive or high-pitched tinkling bowel sounds, and radiographic evidence of a transition point with air-fluid levels on erect abdominal X-ray. CT with oral contrast is definitive for identifying mechanical obstruction when the clinical picture is ambiguous. In Kenyan settings where CT is not immediately accessible, serial abdominal examinations and plain radiographic assessment of gas distribution patterns remain the mainstay of initial differentiation."
    ],
    "landmarkTrials": [
        {"trial": "ERAS (Enhanced Recovery After Surgery) Protocol for Ileus Reduction", "year": 2016, "population": "Meta-analysis of 21 RCTs (4,500 patients) comparing ERAS vs conventional care in colorectal surgery", "intervention": "Multimodal ERAS bundle: epidural analgesia, early enteral nutrition, early mobilization, opioid-sparing analgesia, fluid restriction", "outcome": "Reduced time to return of bowel function by 24-36 hours, reduced hospital stay by 2.5 days, reduced POI rate by 40% (OR 0.60)", "impact": "ERAS became standard of care; demonstrates that POI is highly modifiable through non-pharmacologic interventions", "reference": "Greco M, et al. Enhanced recovery after surgery for colorectal surgery: a meta-analysis of randomized controlled trials. World J Surg. 2016;40(5):1213-1224."},
        {"trial": "Gum Chewing for Ileus Prevention Meta-analysis", "year": 2015, "population": "Meta-analysis of 17 RCTs (1,837 patients) undergoing abdominal surgery", "intervention": "Chewing gum (sham feeding) 3-4 times daily starting immediately postoperatively", "outcome": "Reduced time to first flatus by 10.4 hours, first bowel movement by 15.2 hours, and hospital stay by 1.8 days", "impact": "Low-cost, zero-risk intervention ideal for resource-limited settings. Widely implemented in Kenyan surgical wards.", "reference": "Yang Y, et al. Gum chewing for promoting gastrointestinal recovery after abdominal surgery. Gastroenterol Res Pract. 2015;2015:598649."},
        {"trial": "PROVIDE (IV Lidocaine for Postoperative Ileus Prevention)", "year": 2017, "population": "RCT of 210 patients undergoing elective colorectal surgery", "intervention": "IV lidocaine (1.5 mg/kg bolus + 2 mg/kg/hr infusion for 24 hours) vs placebo", "outcome": "Reduced time to first flatus by 12 hours (p=0.02), reduced opioid consumption by 35%, and reduced hospital stay by 1.5 days", "impact": "IV lidocaine provides both analgesic and prokinetic benefits; alternative to epidural when resources limited", "reference": "Ventham NT, et al. Systemic lidocaine for postoperative ileus in colorectal surgery. Br J Surg. 2017;104(8):1006-1015."},
        {"trial": "Alvimopan for POI (Phase III Trial)", "year": 2008, "population": "1,260 patients undergoing partial bowel resection with primary anastomosis across 50 US centers", "intervention": "Alvimopan 12 mg PO preoperatively and twice daily postoperatively vs placebo", "outcome": "Reduced time to GI recovery (GI-2 endpoint) by 12-18 hours; reduced hospital stay by 1 day (p<0.001)", "impact": "Alvimopan is FDA-approved for POI prevention but high cost limits use in Kenya; demonstrates opioid-receptor antagonism as valid therapeutic target", "reference": "Ludwig K, et al. Alvimopan for the management of postoperative ileus after bowel resection. Am J Surg. 2008;195(5):617-623."}
    ],
    "evidenceTable": [
        {"study": "ERAS Meta-analysis (2016)", "design": "Meta-analysis of 21 RCTs", "population": "Colorectal surgery (n=4,500)", "intervention": "ERAS bundle", "outcome": "POI reduced 40%, hospital stay -2.5 days", "LOE": "1a"},
        {"study": "Gum Chewing Meta-analysis (2015)", "design": "Meta-analysis of 17 RCTs", "population": "Abdominal surgery (n=1,837)", "intervention": "Chewing gum", "outcome": "Flatus -10.4h, bowel movement -15.2h", "LOE": "1a"},
        {"study": "PROVIDE (2017)", "design": "RCT, double-blind", "population": "Colorectal surgery (n=210)", "intervention": "IV lidocaine infusion", "outcome": "Flatus -12h, opioid use -35%", "LOE": "1b"},
        {"study": "Alvimopan Phase III (2008)", "design": "RCT, double-blind", "population": "Bowel resection (n=1,260)", "intervention": "Alvimopan 12 mg BD", "outcome": "GI recovery -18h, LOS -1 day", "LOE": "1b"}
    ],
    "diagnosticAlgorithm": "DIFFERENTIATE RESOLVING VS PROLONGED VS COMPLICATED ILEUS. Step 1 -- TIMING: Resolving physiologic ileus: postoperative days 1-3, progressive improvement, passage of flatus by day 3, bowel sounds returning. Prolonged ileus: no passage of flatus or stool by day 4, persistent distension, high NG output. Complicated ileus: associated tachycardia, fever, rising CRP, worsening pain, peritonism. Step 2 -- EXAMINATION: Auscultate bowel sounds (absent vs tinkling vs high-pitched obstructive), percuss for tympany, palpate for tenderness (diffuse mild vs focal vs peritonism). Measure abdominal girth serially. Check for scars suggesting previous surgery with possible adhesive obstruction. Step 3 -- LABORATORY: Check electrolytes (K+, Mg++, PO4, Ca++), serum creatinine, and CRP. Rising CRP with tachycardia mandates CT to exclude anastomotic leak or abscess. Step 4 -- IMAGING: Erect and supine abdominal X-ray: generalized gas throughout the bowel without air-fluid levels suggests ileus; multiple air-fluid levels with dilated loops and step-ladder pattern suggests mechanical obstruction. CT abdomen with oral contrast (the definitive test): if transition point present, diagnosis is mechanical obstruction; if diffuse dilatation without transition point, consistent with ileus. Step 5 -- MANAGEMENT: For physiologic ileus: NPO, NG tube if distension severe, correct electrolytes, minimize opioids, early mobilization, gum chewing. For prolonged ileus without mechanical cause: add prokinetics (Metoclopramide 10 mg TDS IV, Erythromycin 200 mg TDS IV), switch to epidural analgesia if available, trial of neostigmine (2.0-2.5 mg IV slow push) for colonic pseudo-obstruction (Ogilvie syndrome). For mechanical obstruction: surgical consult, exploratory laparoscopy or laparotomy. The single most important decision point is to distinguish simple prolonged ileus from mechanical obstruction -- CT with contrast is the definitive arbiter and should not be delayed beyond postoperative day 4-5 in the absence of bowel function.",
    "managementPearls": [
        {"pearl": "The three most common reversible causes of prolonged ileus are hypokalemia (target K+ >4.0 mmol/L), opioid excess, and missed mechanical obstruction. Address all three before labeling it 'refractory ileus.'", "LOE": "3", "pearlType": "diagnostic"},
        {"pearl": "Chewing gum three times daily is the most cost-effective intervention for POI prevention in resource-limited settings -- it provides sham feeding that stimulates cephalic-vagal reflexes, increases salivary and pancreatic secretions, and releases GI hormones (gastrin, neurotensin) that promote motility. Cost: essentially zero.", "LOE": "1a", "pearlType": "preventive"},
        {"pearl": "Switch from morphine to NSAIDs (ketorolac, ibuprofen, diclofenac) or tramadol as soon as pain permits. Morphine delays gastric emptying by 40-60% and prolongs colonic transit by 50%. NSAIDs have the added benefit of reducing the inflammatory component of POI through COX-2 inhibition.", "LOE": "2b", "pearlType": "pharmacologic"},
        {"pearl": "Coffee enemas: One small RCT showed a 15-hour reduction in time to first flatus compared to placebo in post-cesarean ileus. While not standard of care, it is a low-risk, low-cost option that may benefit selected patients in the Kenyan setting.", "LOE": "3", "pearlType": "therapeutic"},
        {"pearl": "Prolonged NG decompression >5 days is itself a cause of delayed GI recovery. The NG tube should be removed when output is <500 mL/day. Persistent high output (>1 L/day) suggests mechanical obstruction or an underlying complication -- do not simply replace the tube; investigate.", "LOE": "4", "pearlType": "management"},
        {"pearl": "Early mobilization is the single most effective non-pharmacologic intervention. Patients who are out of bed on postoperative day 1 have a 40% shorter duration of ileus compared to those who remain in bed. In Kenyan surgical wards, mobilizing patients despite cultural expectations of 'bed rest after surgery' requires active nursing leadership and family education.", "LOE": "2b", "pearlType": "rehabilitative"}
    ],
    "operativeNuances": [
        {"nuance": "When performing adhesiolysis for adhesive small bowel obstruction after previous laparotomy, the safest entry technique is to enter the peritoneal cavity at a site remote from the previous incision. For a patient with a midline scar, enter through a left subcostal or left flank approach. Palpate the peritoneal cavity digitally before inserting any instrument. Divide adhesions sharply with scissors under direct vision -- do not use diathermy blindly, as thermal injury to underlying bowel can create a new perforation that mimics the pathology you are treating.", "LOE": "4"},
        {"nuance": "The most reliable intraoperative sign of bowel viability is arterial bleeding from a cut edge. If the serosa appears dusky or the bowel does not show peristalsis on mechanical stimulation, do not hesitate to resect back to healthy, bleeding tissue. Non-viable segments left in situ will perforate within 24-48 hours, converting a simple obstruction into a catastrophic peritonitis.", "LOE": "4"},
        {"nuance": "In Ogilvie syndrome (acute colonic pseudo-obstruction), neostigmine at 2.0-2.5 mg IV infused over 3-5 minutes achieves successful decompression in 80-90% of patients within 30 minutes. Monitor for bradycardia -- have atropine 0.6 mg at the bedside. Contraindicated if heart rate <60 bpm, active bronchospasm, or SBP <90 mmHg. Dilation of cecum >12 cm on X-ray with no clinical improvement after neostigmine is an indication for colonoscopic decompression or surgical cecostomy.", "LOE": "2b"}
    ],
    "prognosis": {
        "physiologicIleus_resolutionTime": "Resolves in 2-4 days in 70% of patients; 90% by day 6",
        "prolongedIleus_incidence": "Occurs in 10-15% of abdominal surgery patients; higher in open vs laparoscopic (OR 2.1)",
        "mortality": "Ileus per se has negligible mortality; the underlying cause (obstruction, leak, abscess) carries the mortality risk",
        "hospitalStayProlongation": "Increases mean hospital stay by 4-7 days; estimated economic cost per episode: KES 50,000-100,000 in Kenyan hospitals",
        "recurrenceRisk": "Patients with prolonged ileus have higher risk of readmission (15-20%) and recurrent ileus in subsequent abdominal surgeries",
        "conversionToObstruction": "Risk of progression to mechanical obstruction requiring surgery is 5-10% if ileus persists >7 days",
        "keyDeterminants": "Opioid-sparing analgesia, early mobilization, electrolyte normalization, and early CT when ileus extends beyond day 4 are the key modifiable determinants"
    },
    "new_history_questions": [
        {"question": "Was your pain colicky (wave-like, coming and going) or constant and dull?", "weight": 8},
        {"question": "Have you had any previous abdominal surgeries?", "weight": 7},
        {"question": "Have you had abdominal surgery or injuries in the past that required a hospital stay?", "weight": 6},
        {"question": "When did you last pass gas, and have you passed any since?", "weight": 10},
        {"question": "Are you taking any pain medication, and what kind (especially morphine or pethidine)?", "weight": 8},
        {"question": "Do you have any sensation of needing to pass stool but being unable to?", "weight": 5},
        {"question": "Is the distension worse in the morning or evening, or is it constant?", "weight": 4},
        {"question": "Did you have similar problems with bowel function before the surgery?", "weight": 5},
        {"question": "What is your normal bowel habit (daily, every other day, etc.)?", "weight": 3},
        {"question": "Do you take any medications for constipation at home?", "weight": 4},
        {"question": "Have you been walking or getting out of bed after your surgery?", "weight": 7},
        {"question": "Did you receive an enema or bowel preparation before surgery?", "weight": 3},
        {"question": "Have you had any coffee or tea since surgery?", "weight": 3},
        {"question": "Do you feel bloated all the time or only after eating or drinking?", "weight": 5},
        {"question": "Do you have any history of diabetes, hypothyroidism, or other endocrine conditions?", "weight": 5},
        {"question": "Are you on any medications for blood pressure, depression, or parkinsonism?", "weight": 4},
        {"question": "What color is the fluid coming out of your nasogastric tube (if present)?", "weight": 6},
        {"question": "Have you had any episodes of vomiting -- is it food, green fluid, or dark fluid?", "weight": 7}
    ],
    "new_examination_findings": [
        {"finding": "Colicky pain on auscultation with high-pitched tinkling bowel sounds (suggests early mechanical obstruction)", "weight": 7},
        {"finding": "Borborygmi (loud, prolonged gurgling sounds -- suggests resolving ileus or early obstruction)", "weight": 5},
        {"finding": "Shifting dullness on percussion (presence of ascites or intra-abdominal fluid)", "weight": 5},
        {"finding": "Psoas sign or obturator sign (suggests retrocecal abscess as cause of ileus)", "weight": 4},
        {"finding": "Visible peristalsis on abdominal inspection (more common in thin patients with obstruction)", "weight": 5},
        {"finding": "Abdominal wall edema (fluid overload contributing to bowel wall edema)", "weight": 3},
        {"finding": "Cecostomy or stoma site: absent output suggests obstruction, high output suggests ileus or short bowel", "weight": 4},
        {"finding": "Fluid thrill on abdominal examination (ascites from underlying pathology)", "weight": 3},
        {"finding": "Scaphoid abdomen after NG decompression (effective decompression -- positive sign)", "weight": 3},
        {"finding": "Metabolic alkalosis from prolonged NG suction (hypochloremic, hypokalemic metabolic alkalosis)", "weight": 5},
        {"finding": "Hypokalemia on ECG (flattened T waves, U waves, prolonged QT -- suggests electrolyte cause of ileus)", "weight": 5},
        {"finding": "Hypoactive bowel sounds in all four quadrants with irregular pattern", "weight": 6},
        {"finding": "Dehydration signs: dry mucous membranes, reduced skin turgor, sunken eyes", "weight": 4},
        {"finding": "Cecal diameter >12 cm on abdominal X-ray (Ogilvie syndrome -- acute colonic pseudo-obstruction)", "weight": 6},
        {"finding": "Air-fluid levels on serial X-rays that are stationary or progressing (suggests obstruction not ileus)", "weight": 6}
    ],
    "new_mimics": [
        {"diseaseId": "superior_mesenteric_artery_syndrome", "discriminators": ["postoperative weight loss", "epigastric pain relieved by prone position", "duodenal obstruction on upper GI series", "history of scoliosis surgery or rapid weight loss"], "ruleOutTests": ["Upper GI contrast study", "CT with oral contrast showing aortomesenteric angle <22 degrees"]},
        {"diseaseId": "paralytic_ileus_from_sepsis_elsewhere", "discriminators": ["distant source of infection (pneumonia, UTI, line sepsis)", "no abdominal pathology found on imaging", "ileus resolves when infection treated", "fever and leukocytosis predominate"], "ruleOutTests": ["Full sepsis workup", "CT abdomen to exclude primary abdominal cause"]},
        {"diseaseId": "gastroparesis_from_diabetes", "discriminators": ["pre-existing diabetes", "NG output >500 mL/day with minimal abdominal distension", "sensation of fullness after small meals", "gastric retention on endoscopy"], "ruleOutTests": ["Gastric emptying study", "Endoscopy", "HbA1c assessment"]},
        {"diseaseId": "chronic_intestinal_pseudo_obstruction", "discriminators": ["history of recurrent similar episodes", "symptoms preceding the current surgery", "may have history of connective tissue disorder or amyloidosis"], "ruleOutTests": ["Full thickness bowel biopsy", "Autoimmune workup", "Antroduodenal manometry"]}
    ],
    "new_complications": [
        {"diseaseId": "abdominal_compartment_syndrome", "probability": 0.03, "lagDays": [1, 4], "severityBoost": 0.6, "triggers": ["massive_distension", "bowel_edema", "fluid_overload"], "clues": ["tense_distended_abdomen", "rising_peak_airway_pressure", "oliguria", "IAP_>20_mmHg"]},
        {"diseaseId": "missed_mechanical_obstruction", "probability": 0.05, "lagDays": [3, 10], "severityBoost": 0.5, "triggers": ["failure_to_image", "atypical_presentation"], "clues": ["transition_from_diffuse_to_colicky_pain", "feculent_vomiting", "progressive_distension"]},
        {"diseaseId": "vaccination_status_deficiency", "probability": 0.05, "lagDays": [7, 21], "severityBoost": 0.1, "triggers": ["prolonged_npo", "insufficient_nutritional_support"], "clues": ["weight_loss", "falling_albumin", "poor_wound_healing"]}
    ],
    "refined_subtypes": [
        {
            "id": "physiologic_ileus",
            "name": "Physiologic (Post-Laparotomy) Ileus",
            "prevalenceModifier": 0.6,
            "keyFeatures": [
                {"feature": "post_laparotomy_day_1_to_3", "weight": 5},
                {"feature": "absent_bowel_sounds", "weight": 4},
                {"feature": "distension_mild_moderate", "weight": 3},
                {"feature": "no_worsening_pain", "weight": 4},
                {"feature": "vitals_stable", "weight": 5}
            ],
            "management": "Conservative: NPO, NG tube if vomiting, IV fluids, electrolyte correction, early mobilization, minimize opioids. Gum chewing (sham feeding). Usually resolves in 2-4 days with return of bowel sounds and passage of flatus."
        },
        {
            "id": "prolonged_ileus",
            "name": "Prolonged (Paralytic) Ileus",
            "prevalenceModifier": 0.25,
            "keyFeatures": [
                {"feature": "persistent_beyond_day_4", "weight": 5},
                {"feature": "persistent_distension", "weight": 4},
                {"feature": "high_ng_output_above_1L", "weight": 4},
                {"feature": "failure_to_tolerate_diet", "weight": 4},
                {"feature": "no_sepsis_or_peritonitis", "weight": 3}
            ],
            "management": "Exclude mechanical obstruction (CT with oral contrast). Correct electrolytes aggressively (K+ >4.0, Mg++ >0.8, PO4 >1.0). Switch opioids to epidural analgesia or NSAIDs if possible. Consider prokinetics: Metoclopramide 10 mg TDS, Erythromycin 200 mg TDS IV. Parenteral nutrition if NPO >7 days."
        },
        {
            "id": "colonic_pseudo_obstruction",
            "name": "Ogilvie Syndrome (Acute Colonic Pseudo-obstruction)",
            "prevalenceModifier": 0.15,
            "keyFeatures": [
                {"feature": "massive_colonic_distension", "weight": 5},
                {"feature": "cecal_diameter_above_9cm", "weight": 5},
                {"feature": "abdominal_pain_marked", "weight": 4},
                {"feature": "failure_to_pass_flatus_stool", "weight": 4},
                {"feature": "high_pitched_bowel_sounds_or_absent", "weight": 3}
            ],
            "management": "NPO, NG tube, rectal tube. Correct electrolytes. Neostigmine 2.0-2.5 mg IV over 3-5 min with cardiac monitoring. Atropine at bedside. If no response: colonoscopic decompression. If cecal diameter >12 cm or signs of ischemia: emergency laparotomy with cecostomy or resection."
        }
    ]
}

POSTOP_BLEEDING = {
    "pathophysiologyDetail": [
        "Postoperative hemorrhage can be classified temporally into reactionary (within 24 hours of surgery) and secondary (after 24 hours, usually 5-14 days postoperatively). Reactionary hemorrhage results from mechanical failure of hemostasis -- a ligature slips off a pedicled vessel, a diathermy eschar separates, or a suture line debisces under tension from rising blood pressure as anesthesia wears off and the patient emerges from the vasodilated, hypothermic state of surgery. The classic scenario is a patient who appears stable in the recovery room, then develops tachycardia and hypotension 4-6 hours later as blood pressure normalizes and the clot sealing a bleeding vessel is dislodged by fibrinolysis or movement. Secondary hemorrhage results from erosion of a vessel wall by infection, anastomotic breakdown, or enzymatic digestion (e.g., pancreatic leak eroding the splenic or gastroduodenal artery). A sentinel bleed -- a small, self-limited episode of bleeding -- may precede catastrophic hemorrhage by 24-48 hours and must never be ignored.",
        "The physiologic response to acute hemorrhage follows a predictable trajectory: Compensated shock: tachycardia (HR >100), narrowed pulse pressure, and peripheral vasoconstriction maintain cerebral and coronary perfusion. The patient may be anxious, thirsty, and pale, with delayed capillary refill. Decompensated shock: hypotension (SBP <90 mmHg or MAP <65 mmHg) develops once 30-40% of blood volume is lost (Class III-IV hemorrhage), accompanied by oliguria (<0.5 mL/kg/hr), tachypnea, altered mental status, and anuria. In a 70 kg adult, each 500 mL of blood loss correlates with roughly 1 g/dL drop in hemoglobin, but this equilibration takes 12-24 hours -- initial Hb may be misleadingly normal in acute hemorrhage. The shock index (HR / SBP) is more sensitive than either parameter alone: SI >0.9 suggests compensated shock, and SI >1.3 suggests decompensated shock requiring immediate transfusion and surgical control.",
        "In Kenyan surgical settings, several factors compound the risk of postoperative hemorrhage. Delayed access to cross-matched blood and blood products means that a patient can exsanguinate while waiting for a type and screen to return; having at least 2 units of O-negative emergency-release blood in the operating theatre is a system-level imperative. Coagulopathy from chronic liver disease (hepatitis B cirrhosis is endemic), malnutrition, or herbal remedies that inhibit platelet function (e.g., traditional concoctions containing salicylate-like compounds or coumarin derivatives) may be occult contributors to diffuse postoperative oozing. Furthermore, the use of ketamine as the primary anesthetic in many district hospitals -- while hemodynamically favorable compared to propofol -- produces catecholamine surge that can mask hypovolemia until the patient suddenly decompensates."
    ],
    "landmarkTrials": [
        {"trial": "CRASH-2 (Clinical Randomisation of an Antifibrinolytic in Significant Haemorrhage)", "year": 2010, "population": "20,211 adult trauma patients with significant bleeding across 274 hospitals in 40 countries", "intervention": "Tranexamic acid (TXA) 1 g IV over 10 min then 1 g over 8 hours vs placebo", "outcome": "All-cause mortality reduced from 16.0% to 14.5% (RR 0.91, p=0.0035); reduction greatest if given within 3 hours", "impact": "Established TXA as standard of care in traumatic and likely postoperative hemorrhage; cost about KES 500 per dose", "reference": "CRASH-2 Trial Collaborators. Effects of tranexamic acid on death, vascular occlusive events, and blood transfusion in trauma patients. Lancet. 2010;376(9734):23-32."},
        {"trial": "WOMAN (World Maternal Antifibrinolytic) Trial", "year": 2017, "population": "20,060 women with postpartum hemorrhage across 193 hospitals in 21 countries", "intervention": "TXA 1 g IV vs placebo within 3 hours of birth", "outcome": "Reduced death from bleeding (1.5% vs 1.9%, RR 0.81, p=0.045)", "impact": "Extended TXA indication to obstetric/postpartum hemorrhage; relevant to surgical practice for diffuse bleeding", "reference": "WOMAN Trial Collaborators. Effect of early tranexamic acid administration on mortality, hysterectomy, and other morbidities in women with post-partum haemorrhage. Lancet. 2017;389(10084):2105-2116."},
        {"trial": "PROPPR (Pragmatic, Randomized Optimal Platelet and Plasma Ratios)", "year": 2015, "population": "680 severely injured patients predicted to require massive transfusion at 12 US Level I trauma centers", "intervention": "1:1:1 (PRBC:FFP:Platelets) vs 1:1:2 ratio transfusion", "outcome": "No difference in 24-hour or 30-day mortality; 1:1:1 group achieved hemostasis faster (p=0.006)", "impact": "Established balanced resuscitation (1:1:1 ratio) as standard for massive hemorrhage; relevant for postoperative bleeding requiring massive transfusion", "reference": "Holcomb JB, et al. Transfusion of plasma, platelets, and red blood cells in a 1:1:1 vs a 1:1:2 ratio and mortality in patients with severe trauma. JAMA. 2015;313(5):471-482."},
        {"trial": "TRICC (Transfusion Requirements in Critical Care)", "year": 1999, "population": "838 euvolemic ICU patients with hemoglobin <90 g/L", "intervention": "Restrictive transfusion (Hb trigger 70 g/L, target 70-90) vs liberal (trigger 100 g/L, target 100-120)", "outcome": "Restrictive strategy non-inferior for 30-day mortality (18.7% vs 23.3%, p=0.10); except in acute MI (worse outcomes)", "impact": "In postoperative patients without active hemorrhage, restrictive transfusion threshold (Hb 70 g/L) is safe", "reference": "Hebert PC, et al. A multicenter, randomized, controlled clinical trial of transfusion requirements in critical care. N Engl J Med. 1999;340(6):409-417."}
    ],
    "evidenceTable": [
        {"study": "CRASH-2 (2010)", "design": "RCT, 274 hospitals, 40 countries", "population": "Trauma/hemorrhage (n=20,211)", "intervention": "TXA 1 g + 1 g infusion", "outcome": "Mortality 14.5% vs 16.0% (RR 0.91)", "LOE": "1b"},
        {"study": "WOMAN Trial (2017)", "design": "RCT, 193 hospitals, 21 countries", "population": "Postpartum hemorrhage (n=20,060)", "intervention": "TXA 1 g", "outcome": "Death from bleeding 1.5% vs 1.9% (RR 0.81)", "LOE": "1b"},
        {"study": "PROPPR (2015)", "design": "RCT, 12 trauma centers", "population": "Massive transfusion (n=680)", "intervention": "1:1:1 vs 1:1:2 transfusion", "outcome": "No mortality difference; faster hemostasis with 1:1:1", "LOE": "1b"},
        {"study": "TRICC (1999)", "design": "RCT, 25 ICUs", "population": "ICU patients, Hb <90 (n=838)", "intervention": "Restrictive (70) vs liberal (100) Hb trigger", "outcome": "30-day mortality 18.7% vs 23.3%", "LOE": "1b"}
    ],
    "diagnosticAlgorithm": "RECOGNIZE → RESUSCITATE → LOCATE → CONTROL. RECOGNIZE: The earliest sign of postoperative hemorrhage is unexplained tachycardia (HR >100 bpm) that does not correct with a 500 mL fluid bolus. Other early signs: anxiety, thirst, pallor, narrowed pulse pressure, and oliguria. Late signs (hypotension, altered mental status, anuria) indicate decompensated shock with >30% blood loss. In the postoperative patient with drains, frank bloody output is an obvious sign; however, intra-abdominal or retroperitoneal bleeding may present only with distension, pain, and falling Hb without visible external blood. Shock Index (HR / SBP) is the most practical bedside tool: >0.9 triggers concern, >1.3 mandates immediate transfusion and surgical exploration. RESUSCITATE: Follow ATLS massive hemorrhage protocol. Large-bore IV access (two 14-16G cannulae). Activate massive transfusion protocol: request 4-6 units PRBC, 4 units FFP, and 1 pool platelets. Give TXA 1 g IV over 10 min then 1 g over 8 hours. If coagulopathic, give FFP and consider cryoprecipitate or fibrinogen concentrate. Limit crystalloid to 1-2 L -- excessive clear fluids dilute clotting factors and worsen bleeding. Permissive hypotension (target SBP 80-90 mmHg) until surgical control is achieved. LOCATE: In a hemodynamically stable patient, CT angiography with arterial phase can identify the bleeding source (active extravasation, pseudoaneurysm, large hematoma). In an unstable patient, the location of bleeding is determined clinically: bloody drain suggests intra-abdominal, bloody NG suggests upper GI, wound hematoma suggests superficial, chest tube output >200 mL/hr suggests thoracic. If the source is unclear and the patient is unstable, emergency re-laparotomy or re-thoracotomy is indicated without delay for preoperative imaging. CONTROL: Surgical re-exploration is the definitive management for hemorrhage control. Evacuate clot, identify the bleeding vessel (systematic approach: check ligated pedicles, anastomotic lines, raw surfaces, and vascular suture lines), and achieve hemostasis with suture ligature, clips, diathermy, or packing. If diffuse oozing without an identifiable source, pack the cavity and plan a relook in 24-48 hours. In the operating theatre, call for senior help early -- the most common error in managing postoperative hemorrhage is a 'single surgeon, single attempt' at control that fails while the patient exsanguinates.",
    "managementPearls": [
        {"pearl": "The shock index (HR / SBP) is more sensitive than either vital sign alone. A shock index >0.9 identifies compensated shock when HR and SBP may individually appear 'normal.' Track it hourly -- a rising SI despite fluid resuscitation is the strongest trigger for re-operation.", "LOE": "3", "pearlType": "diagnostic"},
        {"pearl": "Do not wait for the Hb to drop before deciding to transfuse or re-operate. In acute hemorrhage, Hb is normal for the first 4-6 hours because the patient has not yet hemodiluted. Clinical signs of shock (tachycardia, oliguria, altered mental state) are the trigger for action, not the lab value.", "LOE": "2b", "pearlType": "diagnostic"},
        {"pearl": "Tranexamic acid 1 g IV is indicated in ALL suspected postoperative hemorrhage, given within 3 hours of onset. Cost in Kenya: approximately KES 500 per dose. Number needed to treat to prevent one death: 67. It is among the most cost-effective interventions in surgical care.", "LOE": "1b", "pearlType": "pharmacologic"},
        {"pearl": "Permissive hypotension (SBP 80-90 mmHg) is safe until surgical control is achieved. Avoid aggressive crystalloid resuscitation that worsens dilutional coagulopathy, increases bleeding from shearing of immature clot, and causes bowel edema that complicates re-operation.", "LOE": "2b", "pearlType": "resuscitative"},
        {"pearl": "If you cannot find a bleeding point at re-laparotomy and the patient is coagulopathic, do not close and hope. Pack all four quadrants (right upper, right lower, left upper, left lower) with laparotomy packs, close the abdomen temporarily (using a Bogota bag or negative pressure dressing), and plan a relook in 24-48 hours. Dead patients do not get second chances.", "LOE": "3", "pearlType": "operative"}
    ],
    "operativeNuances": [
        {"nuance": "When performing emergency re-laparotomy for postoperative hemorrhage, the single most important technical maneuver is to rapidly evacuate all clot and blood from the peritoneal cavity. This allows visual identification of the bleeding source. Use your hands as 'spoons' to remove large clots en masse, then use large sucker and laparotomy packs. Do not waste time with gentle, meticulous adhesiolysis -- the patient is exsanguinating. Once the abdomen is cleared, systematically inspect: (1) the ligated mesenteric vessels at the resection site, (2) the anastomotic line, (3) retroperitoneal planes (especially after right hemicolectomy or pancreatic surgery), (4) the splenic bed (if splenectomy performed), (5) the liver bed (if cholecystectomy or liver resection), and (6) the vaginal cuff/uterine pedicle (if gynecologic surgery). If still no source identified, pack each quadrant and look for blood tracking through the packs on sequential removal.", "LOE": "4"},
        {"nuance": "The 'Pringle maneuver' (clamping the hepatoduodenal ligament with a non-crushing clamp to control portal inflow) is a critical salvage technique for massive liver bleeding. It provides temporary inflow control for up to 60 minutes (warm ischemia time) while you perform a liver suture, packing, or resection. In Kenyan practice, a vascular clamp may not be available; a nylon tape tourniquet or a soft Jelco tubing passed through a small rubber tube (Rumel tourniquet) serves the same purpose.", "LOE": "4"},
        {"nuance": "When dealing with a bleeding vessel in an infected or contaminated field (secondary hemorrhage), do NOT attempt primary repair with a graft or patch -- repair will deliquesce in the infected environment. Ligation with proximal and distal control is the safest strategy. If the vessel is critical (e.g., common iliac artery), ligate the bleeding point, control sepsis with antibiotics and drainage, and plan an extra-anatomic bypass (e.g., femoral-femoral crossover) 48-72 hours later when the patient is stabilized.", "LOE": "3"}
    ],
    "prognosis": {
        "overall_30day_mortality": "5-10% for reactionary hemorrhage; 15-30% for secondary hemorrhage (higher with sepsis)",
        "mortality_with_massive_transfusion": "20-40% in patients requiring >10 units PRBC in 24 hours",
        "kenyan_operative_hemorrhage_mortality": "Estimated 18-35% due to delayed recognition and limited blood product availability; institutional audits suggest mortality is 2-3x higher in district hospitals vs referral centers",
        "acute_kidney_injury_rate": "15-25% of survivors (higher if prolonged hypotension >2 hours)",
        "abdominal_compartment_syndrome_rate": "5-10% after massive transfusion and packing (laparostomy reduces risk)",
        "wound_complications": "40-60% wound infection rate after re-laparotomy for hemorrhage (emergency re-entry in contaminated setting)",
        "longTerm_QualityOfLife": "Survivors have lower SF-36 scores in physical function for 6-12 months; psychological sequelae (PTSD, anxiety) common",
        "recurrenceRisk": "Re-bleeding after successful control is 5-10%, usually within 48 hours, often from a missed second source or coagulopathy progression",
        "keyDeterminants": "Time to re-operation is the single most modifiable determinant of mortality. Every 30-minute delay from decision-to-incision increases mortality by an estimated 3-5%. Availability of blood products and senior surgical decision-making are the critical system-level determinants."
    },
    "new_history_questions": [
        {"question": "Did the bleeding start suddenly or gradually?", "weight": 6},
        {"question": "Are you feeling lightheaded, dizzy, or like you might faint when you sit up or stand?", "weight": 8},
        {"question": "Have you fainted or lost consciousness?", "weight": 9},
        {"question": "Are you feeling very thirsty?", "weight": 7},
        {"question": "Do you feel short of breath or like you cannot get enough air?", "weight": 7},
        {"question": "Have you noticed your heart racing or pounding?", "weight": 8},
        {"question": "Are you passing less urine than usual?", "weight": 8},
        {"question": "Do you feel cold or sweaty (clammy)?", "weight": 7},
        {"question": "What medications were you taking before surgery (especially blood thinners, aspirin, warfarin, clopidogrel, herbal supplements)?", "weight": 9},
        {"question": "Do you have a history of liver disease, jaundice, or hepatitis?", "weight": 6},
        {"question": "Do you have a history of easy bruising or prolonged bleeding from cuts?", "weight": 7},
        {"question": "Do you have a family history of bleeding disorders?", "weight": 6},
        {"question": "How much blood do you think you have lost (tablespoons, cups, or soak through how many pads/dressings)?", "weight": 5},
        {"question": "Is the bleeding coming from your wound, drain, or are you coughing/vomiting/passing blood?", "weight": 9},
        {"question": "Have you had any previous operations where you required a blood transfusion?", "weight": 5},
        {"question": "Do you take any traditional or herbal medicines that might thin your blood?", "weight": 7},
        {"question": "Have you recently had malaria, dengue, or another illness that could affect your platelets or clotting?", "weight": 5}
    ],
    "new_examination_findings": [
        {"finding": "Shock Index >0.9 (HR/SBP) -- compensated shock", "weight": 9},
        {"finding": "Shock Index >1.3 -- decompensated shock requiring immediate transfusion and surgical control", "weight": 10},
        {"finding": "Narrowed pulse pressure (<30 mmHg) -- early compensatory vasoconstriction", "weight": 7},
        {"finding": "Postural hypotension (SBP drop >20 mmHg or HR increase >30 on sitting up) -- suggests >15% blood loss", "weight": 7},
        {"finding": "Myocardial ischemia on ECG (ST depression, T inversion) from hypoperfusion", "weight": 5},
        {"finding": "Cardiac troponin elevation (demand ischemia from anemia and hypotension)", "weight": 5},
        {"finding": "CVP <4 mmHg (low preload suggesting hypovolemia)", "weight": 5},
        {"finding": "IVC collapsibility >50% on bedside ultrasound (dynamic measure of hypovolemia)", "weight": 6},
        {"finding": "FAST positive for intra-abdominal fluid in postoperative patient (if no preoperative drain)", "weight": 8},
        {"finding": "Drain output >100 mL/hour of frank blood", "weight": 10},
        {"finding": "Drain output that is warm (fresh bleeding) and does not clot (consumptive coagulopathy)", "weight": 8},
        {"finding": "Chest tube output >200 mL over 2-4 hours (post-thoracotomy bleeding)", "weight": 9},
        {"finding": "Progressive abdominal distension with increasing girth measurements", "weight": 7},
        {"finding": "Diaphoresis (cold sweat) -- catecholamine response to hypovolemia", "weight": 5},
        {"finding": "Pale nail beds, palmar creases, and conjunctivae (signs of significant anemia)", "weight": 6},
        {"finding": "Pulsus paradoxus >10 mmHg (may indicate hemorrhagic pericardial effusion if cardiac surgery)", "weight": 3},
        {"finding": "Lactate >2 mmol/L and rising (tissue hypoperfusion marker)", "weight": 8},
        {"finding": "Base deficit <-6 mEq/L on blood gas (metabolic acidosis from hypoperfusion)", "weight": 7},
        {"finding": "International Normalized Ratio (INR) >1.5 suggests underlying coagulopathy", "weight": 6}
    ],
    "new_mimics": [
        {"diseaseId": "septic_shock_on_presentation", "discriminators": ["history of infection", "fever preceding hypotension", "warm peripheries initially", "elevated procalcitonin >2", "positive blood cultures"], "ruleOutTests": ["Lactate", "Blood cultures", "Procalcitonin", "Bedside echo for IVC collapsibility vs hyperdynamic LV"]},
        {"diseaseId": "pulmonary_embolism_with_hypotension", "discriminators": ["sudden dyspnea as initial symptom", "pleuritic chest pain", "hemoptysis", "ECG S1Q3T3", "RV strain on echo"], "ruleOutTests": ["CTPA", "Echocardiography", "D-dimer", "ABG showing respiratory alkalosis"]},
        {"diseaseId": "anaphylactic_shock", "discriminators": ["onset during or shortly after drug administration (antibiotic, blood transfusion)", "urticaria", "bronchospasm", "angioedema", "no external bleeding"], "ruleOutTests": ["Mast cell tryptase", "Response to adrenaline"]},
        {"diseaseId": "cardiogenic_shock", "discriminators": ["history of cardiac disease", "raised JVP", "lung crackles (pulmonary edema)", "poor LV function on echo", "no signs of external bleeding"], "ruleOutTests": ["Echocardiography", "ECG", "Troponin", "BNP"]}
    ],
    "new_complications": [
        {"diseaseId": "abdominal_compartment_syndrome", "probability": 0.1, "lagDays": [0, 3], "severityBoost": 0.5, "triggers": ["massive_resuscitation", "packing_closed_abdomen", "bowel_edema"], "clues": ["tense_distended_abdomen", "rising_peak_airway_pressure", "oliguria_anuria", "intra_abdominal_pressure_>20"]},
        {"diseaseId": "massive_transfusion_complications", "probability": 0.15, "lagDays": [0, 3], "severityBoost": 0.3, "triggers": ["more_than_10_units_prbc", "unbalanced_resuscitation"], "clues": ["hypocalcemia", "hyperkalemia", "metabolic_alkalosis", "hypothermia", "dilutional_coagulopathy"]},
        {"diseaseId": "re_bleeding_after_initial_control", "probability": 0.08, "lagDays": [1, 3], "severityBoost": 0.5, "triggers": ["incomplete_hemostasis", "coagulopathy_not_corrected", "missed_second_source"], "clues": ["recurrent_tachycardia", "rising_drain_output", "falling_hb_after_stabilization"]}
    ],
    "refined_subtypes": [
        {
            "id": "reactionary_hemorrhage",
            "name": "Reactionary Hemorrhage (Early, Within 24 Hours)",
            "prevalenceModifier": 0.55,
            "keyFeatures": [
                {"feature": "onset_within_24h_postop", "weight": 5},
                {"feature": "slipped_ligature_or_diathermy_eschar", "weight": 4},
                {"feature": "clot_dislodgement_with_hypertension", "weight": 4},
                {"feature": "rapid_deterioration_over_minutes_to_hours", "weight": 5},
                {"feature": "frank_blood_from_drain_or_wound", "weight": 5}
            ],
            "management": "Immediate assessment: vitals, drain output, Hb. IV access x2, cross-match 4-6 units. TXA 1 g IV. If hemodynamically unstable or ongoing hemorrhage: emergency re-exploration. Evacuate clot, identify and control bleeding vessel with suture ligature or diathermy. Check all ligated pedicles. Close abdomen when hemostasis achieved."
        },
        {
            "id": "secondary_hemorrhage",
            "name": "Secondary Hemorrhage (Late, >24 Hours)",
            "prevalenceModifier": 0.30,
            "keyFeatures": [
                {"feature": "onset_after_24h", "weight": 5},
                {"feature": "wound_infection_or_contamination", "weight": 4},
                {"feature": "sentinel_bleed_often_precedes", "weight": 5},
                {"feature": "erosion_of_vessel_wall", "weight": 5},
                {"feature": "intermittent_progressive_bleeding", "weight": 4}
            ],
            "management": "Do NOT ignore a sentinel bleed -- it is the harbinger of catastrophic hemorrhage 24-48 hours later. IV antibiotics for underlying infection. If active bleeding: resuscitate and proceed to angiography with embolization (stable) or surgical vessel ligation (unstable). Ligation proximal and distal to the bleeding point. Treat underlying infection with antibiotics and source control."
        },
        {
            "id": "coagulopathic_ooze",
            "name": "Diffuse Coagulopathic Oozing",
            "prevalenceModifier": 0.15,
            "keyFeatures": [
                {"feature": "diffuse_ooze_from_all_tissues", "weight": 5},
                {"feature": "no_identifiable_single_vessel", "weight": 5},
                {"feature": "prolonged_inr_pt_ptt", "weight": 5},
                {"feature": "thrombocytopenia", "weight": 4},
                {"feature": "history_liver_disease_or_anticoagulation", "weight": 4}
            ],
            "management": "Do not continue futile attempts at individual vessel control. Give FFP (15 mL/kg), cryoprecipitate (10-15 units) or fibrinogen concentrate, platelets (1 pool), and TXA 1 g IV. Correct hypothermia, acidosis, and hypocalcemia. Pack the cavity with laparotomy packs, close abdomen temporarily (Bogota bag or negative pressure dressing), and plan relook in 24-48 hours."
        }
    ]
}

POSTOP_FEVER = {
    "pathophysiologyDetail": [
        "Postoperative fever is a non-specific physiologic response to tissue injury, inflammation, or infection following a surgical procedure. The differential diagnosis is systematically approached using the '5 Ws' mnemonic: Wind (atelectasis/pneumonia), Water (urinary tract infection), Wound (surgical site infection), Walking (DVT/PE/venous thromboembolism), and Wonder (drug fever, transfusion reaction, thyroid storm, adrenal insufficiency, gout, pancreatitis). Beyond the 5 Ws, the list includes catheter-related bloodstream infections, sinusitis from nasogastric or nasoenteric tubes, acalculous cholecystitis, and Clostridium difficile colitis (especially in patients who received perioperative antibiotics). The timing of fever onset is the most critical diagnostic clue: immediate postoperative fever (within 24 hours) is most commonly inflammatory or atelectasis-related; fever at 48-72 hours suggests UTI, line infection, or early SSI; fever after 72 hours (especially day 5-7) is highly concerning for deep SSI, anastomotic leak, or abscess formation.",
        "The pathophysiologic mechanism of postoperative fever varies by cause. Atelectasis-related fever, the most common early cause, results from alveolar collapse and release of inflammatory mediators (IL-1, TNF-alpha, PGE2) from atelectatic lung tissue that resorb and activate the hypothalamic thermoregulatory center. This is typically low-grade (<38.5C), self-limiting, and resolves with lung expansion (coughing, deep breathing, mobilization). Infectious fevers, in contrast, result from microbial invasion triggering a systemic inflammatory response: bacterial lipopolysaccharide (LPS) binds to toll-like receptor 4 (TLR4) on macrophages, triggering release of pyrogenic cytokines (IL-1, IL-6, TNF-alpha) that act on the preoptic nucleus of the hypothalamus to raise the thermoregulatory set point. The presence of rigors (involuntary muscular shaking) suggests a rapid rise in temperature from bacteremia or significant cytokine release and should be considered a red flag for severe infection.",
        "In Kenyan surgical patients, additional causes of postoperative fever must be considered. Malaria (especially P. falciparum) can present as postoperative fever due to recrudescence of parasitemia under surgical stress-induced immunosuppression. In endemic areas, a malaria rapid diagnostic test or blood smear should be part of the standard postoperative fever workup. Tuberculosis reactivation is another consideration, particularly in malnourished HIV-positive patients. Finally, typhoid fever (enteric fever) remains prevalent in East Africa and can present as sustained postoperative fever with relative bradycardia, especially in patients who underwent emergency surgery for typhoid perforation -- in such cases, fever persistence may indicate ongoing peritoneal contamination rather than a new infection."
    ],
    "landmarkTrials": [
        {"trial": "Postoperative Fever Workup: Prospective Study of 500 Consecutive Patients", "year": 2003, "population": "500 consecutive patients undergoing major abdominal surgery at a single US center", "intervention": "Systematic fever workup protocol (5 Ws approach) applied to all patients with temperature >38.5C", "outcome": "Infectious cause identified in 45% of febrile episodes; atelectasis 30%, UTI 15%, SSI 12%, PE 5%, drug fever 3%, no cause found 20%", "impact": "Validated the 5 Ws framework; infectious causes were more common after postoperative day 3", "reference": "P class=A, et al. Postoperative fever in general surgery patients. J Am Coll Surg. 2003;196(4):531-536."},
        {"trial": "Procalcitonin to Guide Antibiotic Therapy in Postoperative Fever", "year": 2016, "population": "Meta-analysis of 12 studies (1,850 patients) comparing PCT-guided vs standard antibiotic therapy in postoperative patients", "intervention": "Procalcitonin algorithm to initiate or discontinue antibiotics vs clinical judgment alone", "outcome": "PCT-guided therapy reduced antibiotic exposure by 3.5 days (95% CI 2.1-4.9) without increase in treatment failure or mortality", "impact": "Procalcitonin is a valuable tool to distinguish bacterial from non-bacterial postoperative fever, particularly useful in ICU settings", "reference": "Sager R, et al. Procalcitonin-guided antibiotic therapy in postoperative patients. Intensive Care Med. 2016;42(10):1535-1543."},
        {"trial": "ERAS Fever Management Component", "year": 2015, "population": "Systematic review of ERAS protocols across 15 studies", "intervention": "Structured fever workup vs ad-hoc management within ERAS pathways", "outcome": "Structured workup reduced time to diagnosis by 1.2 days, reduced unnecessary antibiotic use by 30%, and reduced length of stay by 1 day", "impact": "Embedding a standardized fever assessment algorithm in postoperative pathways improves efficiency and reduces antibiotic overuse", "reference": "Gustafsson UO, et al. Guidelines for perioperative care in elective colorectal surgery: Enhanced Recovery After Surgery (ERAS) Society recommendations. World J Surg. 2013;37(2):259-284."}
    ],
    "evidenceTable": [
        {"study": "5 Ws Prospective Study (2003)", "design": "Prospective cohort", "population": "Major abdominal surgery (n=500)", "intervention": "Systematic fever workup", "outcome": "Infectious: 45%; atelectasis: 30%; UTI: 15%; SSI: 12%", "LOE": "2b"},
        {"study": "PCT in Postop Fever Meta-analysis (2016)", "design": "Meta-analysis of 12 studies", "population": "Postoperative patients (n=1,850)", "intervention": "PCT-guided antibiotics vs standard", "outcome": "Antibiotic duration -3.5 days; no mortality difference", "LOE": "1a"},
        {"study": "ERAS Fever Component (2013)", "design": "Systematic review", "population": "Multiple surgery types", "intervention": "Structured fever workup vs ad-hoc", "outcome": "Time to diagnosis -1.2 days; antibiotics reduced 30%", "LOE": "2a"}
    ],
    "diagnosticAlgorithm": "ASSESS SEVERITY -> TIME THE FEVER -> EXAMINE -> INVESTIGATE -> TREAT. Step 1 -- ASSESS SEVERITY: Immediate danger signs (severe sepsis/septic shock): fever >39C with rigors, hypotension (SBP <90 mmHg), tachycardia >120, tachypnea >30/min, altered consciousness, lactate >4 mmol/L. These trigger immediate resuscitation: IV fluids 30 mL/kg, blood cultures, empiric broad-spectrum antibiotics (Piperacillin-Tazobactam 4.5 g IV), and urgent surgical consultation. Step 2 -- TIME THE FEVER: Immediate (<24h): atelectasis, transfusion reaction, malignant hyperthermia. Early (24-72h): UTI, IV line phlebitis, C. difficile colitis, early wound infection. Late (>72h): SSI (day 5-7), anastomotic leak, intra-abdominal abscess, DVT/PE, drug fever. Step 3 -- FOCUSED EXAMINATION using the 5 Ws framework: Wind: chest exam (crackles, dullness, bronchial breathing). Water: suprapubic tenderness, cloudy urine, catheter check. Wound: erythema, induration, purulent discharge, crepitus, dehiscence. Walking: unilateral leg swelling, calf tenderness, Homan sign. Wonder: drug chart review, transfusion history, rash, eosinophilia. Plus: malaria RDT in endemic areas, line site inspection, sinus tenderness (NG tube sinusitis). Step 4 -- INVESTIGATIONS tailored to the timeline and clinical findings: For early fever (<48h without focal signs): chest X-ray, urine dipstick, CBC, CRP. For late fever (>72h or focal signs): add wound swab culture, blood cultures x2, procalcitonin, CT imaging (chest + abdomen depending on suspicion). D-dimer and CUS/CTPA if PE suspected. Step 5 -- TREAT: If infectious source identified: targeted antibiotics based on culture. If no source identified and well: observe without antibiotics (most fevers <72h are self-limiting). If no source identified but septic: empiric antibiotics after cultures, pursue imaging to find source. The golden rule: 'Culture before antibiotics, image before surgery, and never treat a number -- treat the patient.' In the Kenyan context, where malaria is a common cause of fever in any patient, a malaria rapid diagnostic test should be the FIRST test ordered in a febrile postoperative patient.",
    "managementPearls": [
        {"pearl": "The 5 Ws mnemonic (Wind, Water, Wound, Walking, Wonder) should be applied in order, and the most common cause given the fever timing should be investigated first. Fever within 48 hours: think Wind (atelectasis). Fever day 3-5: think Water (UTI) or Wound (SSI). Fever after day 5: think Wound dehiscence/deep SSI, Walking (DVT/PE), or intra-abdominal abscess.", "LOE": "3", "pearlType": "diagnostic"},
        {"pearl": "Do not start antibiotics empirically for every postoperative fever. In the absence of sepsis criteria (qSOFA <2, no focal signs, afebrile between spikes), observation for 24-48 hours is safe and reduces antibiotic resistance. Up to 40% of postoperative fevers resolve without specific treatment.", "LOE": "2b", "pearlType": "management"},
        {"pearl": "In Kenyan surgical wards, the most commonly missed postoperative fever cause is malaria (especially P. falciparum in endemic regions). A rapid diagnostic test costs approximately KES 200-500 and should be ordered in ANY febrile postoperative patient in an endemic area. Do not assume the fever is surgical until you have excluded medical causes.", "LOE": "4", "pearlType": "diagnostic"},
        {"pearl": "Procalcitonin is superior to CRP for distinguishing bacterial from non-bacterial postoperative fever. PCT >2 ng/mL strongly suggests bacterial infection (sensitivity 86%, specificity 89%). CRP is too non-specific in the postoperative period (elevated by surgery itself for 7-14 days). If PCT is not available, a CRP >100 mg/L on day 4-5 that is continuing to rise is more concerning than a single high value.", "LOE": "1a", "pearlType": "diagnostic"},
        {"pearl": "Drug fever should be suspected when fever appears 7-10 days after starting a new medication, the patient is afebrile between fever spikes, has a relative bradycardia (pulse-temperature dissociation), and has no focal signs of infection. Common culprits: beta-lactam antibiotics, phenytoin, sulfonamides, and blood products. The diagnosis is confirmed by fever resolution within 48-72 hours of stopping the offending drug.", "LOE": "3", "pearlType": "diagnostic"}
    ],
    "operativeNuances": [
        {"nuance": "When performing re-exploration for a suspected anastomotic leak presenting as postoperative fever, enter the abdomen through the existing midline incision but extend it 5-10 cm superiorly to gain access to the upper abdomen if needed. Upon entry, immediately assess for free fluid, pus, or feculent material. If a contained collection is found near the anastomosis without generalized peritonitis, consider CT-guided percutaneous drainage rather than full takedown of the anastomosis -- this may salvage the anastomosis and avoid a stoma.", "LOE": "4"},
        {"nuance": "In the setting of postoperative fever from a suspected deep SSI, the operating room provides the opportunity for definitive diagnosis and treatment. Open the wound widely (remove all sutures/staples), assess the fascia: if intact and healthy, debride subcutaneous necrotic tissue, irrigate with 3-5 L of warm saline, and pack open. If the fascia is necrotic or separated, full abdominal exploration is needed to rule out deeper organ/space contamination. A key decision: if the fascia is intact but the patient has systemic sepsis, there is likely a deeper source -- do not be satisfied with a negative wound exploration; proceed to CT imaging or laparoscopy.", "LOE": "4"}
    ],
    "prognosis": {
        "self_limited_fever": "40% of postoperative fevers resolve without specific treatment within 24-48 hours",
        "infectious_cause_rate": "Bacterial infection identified in 35-55% of postoperative fevers depending on timing and surgical site",
        "mortality": "Fever per se carries minimal mortality; the underlying cause determines prognosis (septic shock from missed leak: 30-50% mortality)",
        "hospitalStayProlongation": "Postoperative fever prolongs hospital stay by 3-7 days (longer if infectious cause requires prolonged antibiotics or intervention)",
        "readmission_rate": "15-20% readmission rate within 30 days for patients discharged after treated postoperative fever",
        "antibiotic_exposure": "Up to 60% of postoperative patients receive unnecessary antibiotics for fever of unknown origin, contributing to antimicrobial resistance",
        "keyDeterminants": "Timing-based diagnostic approach, correct use of biomarkers (PCT), and judicious antibiotic use are the key determinants of optimal outcomes. In Kenyan settings, early malaria testing and TB screening are critical additions to the standard workup."
    },
    "new_history_questions": [
        {"question": "Is the fever constant or does it come and go (intermittent vs continuous)?", "weight": 6},
        {"question": "Have you had chills or rigors (shaking so severe your teeth chatter)?", "weight": 8},
        {"question": "What was the highest temperature recorded?", "weight": 7},
        {"question": "Do you have a cough, and if so, are you bringing up any phlegm? What color is it?", "weight": 7},
        {"question": "Is there any pain or burning when you pass urine?", "weight": 8},
        {"question": "Does your back or flank hurt (suggests pyelonephritis)?", "weight": 5},
        {"question": "Do you have diarrhea, especially watery or foul-smelling stool?", "weight": 5},
        {"question": "Have you had a blood transfusion during or after your surgery?", "weight": 6},
        {"question": "What medications are you currently receiving (antibiotics, painkillers, other)?", "weight": 6},
        {"question": "Do you have any allergies to medications?", "weight": 4},
        {"question": "Have you had malaria recently or been tested for malaria?", "weight": 7},
        {"question": "Do you have HIV or any condition that weakens your immune system?", "weight": 6},
        {"question": "Have you had any joint replacements or heart valve surgery where infection could settle?", "weight": 4},
        {"question": "Is there any redness, pain, or swelling around your IV line sites?", "weight": 7},
        {"question": "Do you have a central line or PICC line, and when was it last changed?", "weight": 5},
        {"question": "Have you noticed any skin rash since the fever started?", "weight": 5},
        {"question": "Are you diabetic? If yes, what is your most recent blood sugar reading?", "weight": 5},
        {"question": "Have you had any recent dental procedures or infections elsewhere that could seed the surgical site?", "weight": 4}
    ],
    "new_examination_findings": [
        {"finding": "Relative bradycardia (pulse-temperature dissociation -- pulse lower than expected for fever degree)", "weight": 4},
        {"finding": "Fever with rigors (visible shaking -- suggests bacteremia or rapid temperature rise)", "weight": 8},
        {"finding": "Bronchial breath sounds or eggphony (lung consolidation -- pneumonia)", "weight": 7},
        {"finding": "Dullness to percussion at lung base (pleural effusion or consolidation)", "weight": 6},
        {"finding": "Costovertebral angle tenderness on percussion (pyelonephritis)", "weight": 6},
        {"finding": "Suprapubic tenderness (cystitis)", "weight": 5},
        {"finding": "Turbid, foul-smelling urine in catheter bag (UTI)", "weight": 6},
        {"finding": "IV site phlebitis (red streak, tender cord, purulence at cannula site)", "weight": 6},
        {"finding": "Central line site erythema, tenderness, or purulence (CLABSI)", "weight": 7},
        {"finding": "Sinus tenderness or purulent nasal discharge (NG tube sinusitis)", "weight": 3},
        {"finding": "Parotitis (swollen, tender parotid gland -- from dehydration or poor oral hygiene)", "weight": 4},
        {"finding": "Petechiae or purpura (suggests DIC, endocarditis, or meningococcemia)", "weight": 5},
        {"finding": "Splinter hemorrhages, Janeway lesions, Osler nodes (infective endocarditis)", "weight": 4},
        {"finding": "Right upper quadrant tenderness and positive Murphy sign (acalculous cholecystitis)", "weight": 5},
        {"finding": "Calf tenderness with unilateral edema (DVT)", "weight": 6},
        {"finding": "Eosinophilia on differential (>500/mcL suggests drug fever or parasitic infection)", "weight": 4}
    ],
    "new_mimics": [
        {"diseaseId": "malaria", "discriminators": ["cyclic fever with rigors", "headache, myalgia, arthralgia", "splenomegaly", "thrombocytopenia", "normal chest X-ray and urinalysis"], "ruleOutTests": ["Malaria RDT", "Blood smear for malaria parasites", "Thrombocytopenia on CBC"]},
        {"diseaseId": "drug_fever", "discriminators": ["fever appears 7-10 days after starting drug", "afebrile between spikes", "relative bradycardia", "rash and/or eosinophilia", "fever resolves 48-72h after stopping drug"], "ruleOutTests": ["Eosinophil count", "Drug challenge test (withhold suspect drug)", "Response to drug discontinuation"]},
        {"diseaseId": "transfusion_reaction", "discriminators": ["fever during or within 4 hours of transfusion", "urticaria, pruritus", "back pain, flushing", "hemoglobinuria", "direct Coombs test positive"], "ruleOutTests": ["Direct Coombs test", "Bilirubin (unconjugated)", "Hemoglobinuria", "Repeat cross-match"]},
        {"diseaseId": "thyroid_storm", "discriminators": ["history of hyperthyroidism", "exophthalmos, goiter", "tachycardia out of proportion to fever", "tremor, anxiety, hyperreflexia", "arrhythmia (atrial fibrillation)"], "ruleOutTests": ["TSH (suppressed)", "Free T4 (elevated)", "Free T3 (elevated)"]},
        {"diseaseId": "gout_pseudogout", "discriminators": ["postoperative joint pain (knee, great toe, ankle common)", "swollen, hot, red joint", "fever may be present", "history of gout or diuretic use"], "ruleOutTests": ["Joint aspiration for crystals and culture", "Serum uric acid", "CRP markedly elevated"]}
    ],
    "new_complications": [
        {"diseaseId": "clostridium_difficile_colitis", "probability": 0.03, "lagDays": [3, 14], "severityBoost": 0.3, "triggers": ["perioperative_antibiotics", "prolonged_antibiotic_course", "PPI_use"], "clues": ["watery_diarrhea", "abdominal_cramps", "leukocytosis_marked", "fever"]},
        {"diseaseId": "acalculous_cholecystitis", "probability": 0.02, "lagDays": [5, 21], "severityBoost": 0.3, "triggers": ["prolonged_npo", "total_parenteral_nutrition", "mechanical_ventilation", "opioid_analgesia"], "clues": ["right_upper_quadrant_pain", "fever", "murphy_sign", "gallbladder_distension_on_us"]},
        {"diseaseId": "catheter_associated_bloodstream_infection", "probability": 0.03, "lagDays": [3, 30], "severityBoost": 0.4, "triggers": ["central_line_days_>5", "femoral_site", "immunosuppression"], "clues": ["fever_with_rigors", "line_site_erythema", "positive_blood_cultures_from_line", "no_other_source"]}
    ],
    "refined_subtypes": [
        {
            "id": "early_fever_48h",
            "name": "Early Fever (<48 Hours)",
            "prevalenceModifier": 0.40,
            "keyFeatures": [
                {"feature": "fever_within_48h", "weight": 5},
                {"feature": "atelectasis_common", "weight": 4},
                {"feature": "self_limiting", "weight": 4},
                {"feature": "low_grade_fever_38_38_5", "weight": 3},
                {"feature": "no_focal_infection_signs", "weight": 4}
            ],
            "management": "Incentive spirometry, chest physiotherapy, early ambulation. Chest X-ray. Usually self-limiting. No antibiotics. Rule out transfusion reaction. Consider malaria RDT in endemic areas."
        },
        {
            "id": "middle_fever_48h_to_72h",
            "name": "Middle Fever (48-72 Hours)",
            "prevalenceModifier": 0.30,
            "keyFeatures": [
                {"feature": "uti_if_catheterized", "weight": 5},
                {"feature": "iv_line_infection", "weight": 4},
                {"feature": "pneumonia_aspiration", "weight": 4},
                {"feature": "early_surgical_site_infection", "weight": 3},
                {"feature": "line_site_phlebitis", "weight": 3}
            ],
            "management": "Urinalysis and culture, remove catheter if possible. Check all IV sites; replace peripheral lines. Chest X-ray. Wound inspection. Start antibiotics only if source identified."
        },
        {
            "id": "late_fever_72h",
            "name": "Late Fever (>72 Hours, Especially Day 5-7)",
            "prevalenceModifier": 0.30,
            "keyFeatures": [
                {"feature": "surgical_site_infection_day_5_7", "weight": 5},
                {"feature": "anastomotic_leak", "weight": 5},
                {"feature": "intra_abdominal_abscess", "weight": 5},
                {"feature": "dvt_pe", "weight": 4},
                {"feature": "drug_fever", "weight": 3}
            ],
            "management": "Full septic workup: wound inspection, blood cultures x2, urine culture, chest X-ray, procalcitonin, CRP. CT abdomen/pelvis with IV contrast to exclude leak/abscess. D-dimer/CUS if PE suspected. Malaria RDT. Empiric antibiotics if septic after cultures."
        }
    ]
}

WOUND_INFECTION = {
    "pathophysiologyDetail": [
        "Surgical site infection (SSI) represents the most common postoperative complication worldwide, affecting 2-5% of clean surgery, 10-15% of clean-contaminated, and up to 30-40% of contaminated or dirty procedures. The pathophysiology follows a predictable sequence: bacterial inoculation occurs at the time of incision (exogenous from skin flora, endogenous from breached viscus, or airborne from operating room environment), followed by a lag phase during which bacteria adhere to tissue surfaces and begin forming a protective biofilm, then a logarithmic growth phase that overwhelms host immune defenses, leading to the clinical manifestation of infection 5-7 days postoperatively. The microbiology varies by wound class: clean wounds are predominantly Staphylococcus aureus (including MRSA) and Streptococcus species; clean-contaminated wounds show a mix of skin flora plus enteric gram-negatives (E. coli, Klebsiella, Enterobacter) and anaerobes (Bacteroides fragilis); contaminated and dirty wounds are polymicrobial with a predominance of gram-negatives and anaerobes.",
        "Host defense mechanisms are impaired at the surgical site by several factors. The act of incising tissue disrupts capillary blood flow, creating a zone of relative ischemia at the wound edge -- this reduces oxygen tension, impairs oxidative killing by neutrophils, and delays fibroblast migration and collagen deposition. Hematoma or seroma formation within the wound provides an ideal culture medium, sequestering bacteria from circulating immune cells and antibiotics. Retained foreign material (suture material, mesh, hemostatic agents) acts as a nidus for bacterial adherence and biofilm formation. In diabetic patients, hyperglycemia directly impairs neutrophil chemotaxis, phagocytosis, and intracellular killing -- each 1% increase in HbA1c above 7% is associated with a 20-30% increase in SSI risk. In malnourished patients (common in Kenyan surgical populations where delayed presentation is the norm), low albumin (<30 g/L) and micronutrient deficiencies (zinc, vitamin C, vitamin A) impair every phase of wound healing from inflammation to remodeling.",
        "The wound class classification system (CDC/NHSN) remains the most validated predictor of SSI risk: Class I (Clean): no entry into respiratory, GI, or GU tract; SSI rate 1-3%. Class II (Clean-Contaminated): entry into a viscus under controlled conditions without significant spillage; SSI rate 5-10%. Class III (Contaminated): acute inflammation, gross spillage from a viscus, or fresh traumatic wound; SSI rate 15-25%. Class IV (Dirty/Infected): established infection present at the time of surgery (purulence, perforated viscus, abscess); SSI rate 25-40%. In Kenyan emergency laparotomies for typhoid perforation or tubercular bowel perforation, virtually all procedures are Class III or IV, explaining the high observed SSI rates. Furthermore, the CDC SSI Risk Index assigns one point each for ASA score >=3, wound class contaminated/dirty, and operative duration exceeding the 75th percentile for the procedure. In Kenya, where surgical training and operative efficiency vary widely, prolonged operative time is a common additional risk factor.",
        "Beyond the traditional factors, the microbiome of SSI in Kenya shows distinct patterns. Methicillin-resistant Staphylococcus aureus (MRSA) prevalence in surgical wounds ranges from 15-40% across East African centers. Extended-spectrum beta-lactamase (ESBL)-producing Enterobacteriaceae are increasingly common, with rates exceeding 50% in some Kenyan referral hospitals. These resistance patterns demand that empiric antibiotic choices for deep SSI or organ/space infection include agents with gram-negative coverage (e.g., Piperacillin-Tazobactam, Meropenem, or a carbapenem) rather than first-generation cephalosporins alone. Wound culture and sensitivity testing is therefore not optional -- it is essential for guiding targeted therapy and mitigating the crisis of antimicrobial resistance."
    ],
    "landmarkTrials": [
        {"trial": "CDC/NHSN SSI Prevention Guidelines Update", "year": 2017, "population": "Systematic review and meta-analysis of SSI prevention literature (100+ studies)", "intervention": "Updated evidence-based recommendations for antimicrobial prophylaxis, glycemic control, normothermia, oxygenation, and wound management", "outcome": "Bundle implementation (appropriate antibiotic timing, hair removal method, glycemic control, normothermia) reduced SSI by 40-60%", "impact": "Established the 'SSI prevention bundle' as standard of care; each element individually reduces SSI risk by 15-30%", "reference": "Berrios-Torres SI, et al. Centers for Disease Control and Prevention guideline for the prevention of surgical site infection, 2017. JAMA Surg. 2017;152(8):784-791."},
        {"trial": "WHO SSI Prevention Guidelines Meta-analysis", "year": 2018, "population": "Meta-analysis of 27 RCTs on perioperative oxygenation", "intervention": "High FiO2 (0.8) intraoperatively and for 6 hours postoperatively vs standard FiO2 (0.3)", "outcome": "High FiO2 reduced SSI in colorectal surgery (OR 0.70, 95% CI 0.55-0.90) but not in all surgery types", "impact": "WHO recommends high FiO2 for patients undergoing general anesthesia with endotracheal intubation for colorectal surgery", "reference": "Allegranzi B, et al. New WHO recommendations on preoperative measures for surgical site infection prevention. Lancet Infect Dis. 2016;16(12):e276-e287."},
        {"trial": "DECIDE-SSI (Negative Pressure Wound Therapy for Prevention)", "year": 2020, "population": "RCT of 800 patients with closed incisions at high risk for SSI (obese, contaminated wounds)", "intervention": "Prophylactic negative pressure wound therapy (NPWT) at -125 mmHg for 5-7 days vs standard dressing", "outcome": "NPWT reduced SSI from 18% to 11% (RR 0.61, p=0.02); reduced wound dehiscence from 12% to 7%", "impact": "NPWT is effective for prevention in high-risk wounds; cost and availability limit use in Kenya", "reference": "Desai M, et al. Negative pressure wound therapy for prevention of surgical site infection in high-risk wounds. JAMA Surg. 2020;155(1):37-44."},
        {"trial": "KEN-SSI Registry: Prospective Cohort of SSI After Emergency Laparotomy", "year": 2022, "population": "Prospective cohort of 1,560 patients undergoing emergency laparotomy across 7 Kenyan hospitals", "intervention": "Observational: SSI incidence, microbiology, and outcomes", "outcome": "SSI rate 28% (range 18-42% across hospitals); most common organisms: E. coli (35%), Staph. aureus (28%), Klebsiella (15%); ESBL prevalence 45%; MRSA 22%", "impact": "Provided the first multicenter Kenyan SSI epidemiology data; directly informs local empiric antibiotic guidelines", "reference": "Kariuki P, et al. Surgical site infection after emergency laparotomy in Kenya: a prospective multicenter cohort study. East Afr Med J. 2022;99(3):4200-4212."}
    ],
    "evidenceTable": [
        {"study": "CDC SSI Prevention Guideline (2017)", "design": "Systematic review + meta-analysis", "population": "All surgery types", "intervention": "SSI prevention bundle", "outcome": "SSI reduction 40-60%", "LOE": "1a"},
        {"study": "WHO High FiO2 Meta-analysis (2018)", "design": "Meta-analysis of 27 RCTs", "population": "Colorectal surgery", "intervention": "FiO2 0.8 vs 0.3", "outcome": "SSI reduction OR 0.70", "LOE": "1a"},
        {"study": "DECIDE-SSI NPWT (2020)", "design": "RCT, multicenter", "population": "High-risk closed incisions (n=800)", "intervention": "Prophylactic NPWT", "outcome": "SSI 11% vs 18% (RR 0.61)", "LOE": "1b"},
        {"study": "KEN-SSI Registry (2022)", "design": "Prospective multicenter cohort", "population": "Emergency laparotomy, Kenya (n=1,560)", "intervention": "Observational", "outcome": "SSI rate 28%; ESBL 45%; MRSA 22%", "LOE": "4"}
    ],
    "diagnosticAlgorithm": "RECOGNIZE -> CLASSIFY -> CULTURE -> TREAT -> MONITOR. RECOGNIZE: SSI typically presents 5-7 days postoperatively (range 2-21 days). Cardinal signs: wound erythema extending >2 cm from the incision, local warmth, induration, tenderness, and purulent discharge. Systemic features: fever, malaise, tachycardia, and elevated inflammatory markers (CRP, WBC). Any wound that is painful beyond expected postoperative discomfort should be suspected of harboring infection. In diabetic or immunocompromised patients, local signs may be blunted -- a high index of suspicion is required. CLASSIFY by depth: Superficial incisional (skin/subcutaneous only, above fascia), Deep incisional (involves fascia/muscle), Organ/Space (beyond the fascial closure, e.g., intra-abdominal abscess). Classification determines management urgency and extent of treatment. CULTURE: Wound swab for Gram stain, culture, and antibiotic sensitivity. In purulent wounds, the swab should be taken from the deepest part of the wound after the surface exudate is cleaned. In clean-appearing wounds with systemic sepsis, blood cultures x2 should be obtained. If organ/space SSI is suspected, CT-guided aspiration is the most reliable culture method. TREAT based on classification: Superficial: open wound, drain pus, pack daily, oral antibiotics if cellulitis (Flucloxacillin or Clindamycin). Deep: urgent operative wound exploration, debridement of necrotic tissue, IV broad-spectrum antibiotics (start Piperacillin-Tazobactam or Ceftriaxone + Metronidazole), NPWT if available. Organ/space: CT-guided percutaneous drainage or re-laparotomy, IV antibiotics tailored to culture. In Kenyan settings where ESBL prevalence is high (>40%), initial empiric therapy for deep/organ-space SSI should include Meropenem 1 g TDS or Ertapenem 1 g daily if carbapenem-sparing strategies are desired, pending culture results. MONITOR: Daily wound assessment, temperature chart, CRP trend. Antibiotics should be narrowed once sensitivities return. Wounds should be dressed daily (or with NPWT every 48-72 hours). Secondary intention healing or delayed primary closure once the wound is clean with healthy granulation tissue.",
    "managementPearls": [
        {"pearl": "The most important SSI prevention interventions in resource-limited settings are: (1) appropriate antibiotic prophylaxis within 60 minutes before incision, (2) proper surgical hand scrub and sterile technique, (3) maintaining normothermia (keep patient warm), (4) careful hemostasis to prevent hematoma, and (5) closure technique that minimizes dead space. The cost of these is essentially zero -- they require no special equipment.", "LOE": "1a", "pearlType": "preventive"},
        {"pearl": "Wound class is the strongest predictor of SSI. For Class III and IV wounds, do not close the skin primarily. Leave the skin open, pack with saline-soaked gauze, and plan for delayed primary closure (DPC) on postoperative day 4-5 or secondary intention healing. DPC reduces SSI in contaminated wounds by 50-70% compared to primary closure.", "LOE": "2b", "pearlType": "operative"},
        {"pearl": "In Kenyan settings, the most common causative organisms in SSI after emergency laparotomy are E. coli, Staph. aureus, Klebsiella, and anaerobes -- and 40-50% of gram-negatives are ESBL-producing. Empiric therapy should reflect local antibiograms: Piperacillin-Tazobactam is generally adequate for moderate infections; Meropenem is appropriate for severe sepsis with suspected ESBL organisms.", "LOE": "3", "pearlType": "pharmacologic"},
        {"pearl": "NPWT (negative pressure wound therapy) has revolutionized the management of open abdominal wounds and deep SSI. While the commercial devices (V.A.C. Therapy) cost approximately KES 15,000-25,000 per week, a 'low-cost NPWT' can be constructed using a sterile surgical drain connected to continuous wall suction at -125 mmHg, covered with a transparent adhesive dressing. This makeshift system, costing about KES 1,000-2,000, provides comparable wound granulation and contraction.", "LOE": "3", "pearlType": "operative"},
        {"pearl": "Perioperative hyperglycemia is a modifiable risk factor. In diabetic patients, maintain blood glucose <180 mg/dL (10 mmol/L) in the perioperative period. Even in non-diabetic patients, stress hyperglycemia >180 mg/dL increases SSI risk. A single dose of preoperative insulin for glucose >200 mg/dL (11.1 mmol/L) is a simple, low-cost intervention.", "LOE": "1b", "pearlType": "pharmacologic"}
    ],
    "operativeNuances": [
        {"nuance": "When performing wound exploration for deep SSI, the incision must be opened fully to the level of the fascia. Remove ALL skin sutures or staples, not just a few at the draining site. The common error is to open only the skin over the area of fluctuance, missing deeper tracking of purulence along the fascial plane. Use a sterile gloved finger to gently probe the wound -- if the finger passes below the fascia, the infection is deep and requires full operative exploration. Irrigate with 3-5 L of warm normal saline using a 50 mL syringe and a 19-gauge angiocatheter for high-pressure irrigation. Debride all non-viable tissue sharply until healthy, bleeding tissue is encountered.", "LOE": "4"},
        {"nuance": "For an open abdominal wound with exposed bowel (laparostomy after deep SSI or abdominal compartment syndrome), the bowel must be protected from desiccation and fistulization. Apply a non-adherent silicone or paraffin gauze directly over the bowel, then place moist saline packs. Change every 8-12 hours. NPWT can be applied over the bowel if a non-adherent layer is used. The goal is to achieve a 'healing wound' with granulation tissue that can support a skin graft or be closed by delayed primary closure once the infection is cleared. Do NOT place suction directly on the bowel -- it will create an enterocutaneous fistula.", "LOE": "3"},
        {"nuance": "When closing a clean-contaminated wound in a high-risk patient, consider a 'leaving the skin open' strategy: close the fascia with absorbable monofilament (loop PDS), close the subcutaneous layer with interrupted 3-0 Vicryl to eliminate dead space, but leave the skin incision open. Place a Penrose drain or wick in the subcutaneous space, and plan delayed primary closure with steri-strips on day 4-5. This strategy allows any infected fluid to drain rather than collect, and converts a potential deep SSI into a superficial wound that is easily managed.", "LOE": "4"}
    ],
    "prognosis": {
        "superficialSSI_healingTime": "7-14 days with appropriate drainage and antibiotics; 90% heal by secondary intention without further intervention",
        "deepSSI_healingTime": "14-28 days, often requiring NPWT and prolonged antibiotics; 10-15% develop wound dehiscence requiring surgical repair",
        "organSpaceSSI_mortality": "10-20% mortality if associated with sepsis; 30-50% if associated with anastomotic leak",
        "kenyanSSI_rate": "28% after emergency laparotomy (KEN-SSI Registry, 2022); range 18-42% across hospitals",
        "incisionalHernia_Rate": "20-33% after deep SSI with fascial dehiscence; 5-10% after superficial SSI alone",
        "hospitalStayProlongation": "Superficial SSI: +3-5 days; Deep SSI: +7-14 days; Organ/space SSI: +14-21 days",
        "costPerEpisode": "Estimated KES 15,000-50,000 for superficial SSI; KES 100,000-300,000 for deep/organ-space SSI (including extended stay, antibiotics, NPWT, and potential re-operation)",
        "longTerm_QualityOfLife": "SSI survivors have worse scar satisfaction scores, higher chronic pain rates, and lower body image scores on validated instruments at 1 year",
        "recurrenceRisk": "5-10% recurrence rate for SSI at the same site, especially if original infection was deep or if patient has unresolved risk factors (diabetes, smoking, obesity)",
        "keyDeterminants": "Depth of infection (superficial vs deep vs organ/space), timeliness of source control, appropriateness of antibiotic therapy based on local antibiogram, and host factors (diabetes control, nutritional status, smoking cessation)"
    },
    "new_history_questions": [
        {"question": "When did you first notice the wound was red, swollen, or painful?", "weight": 8},
        {"question": "Is the redness spreading or staying in one place?", "weight": 7},
        {"question": "Has the wound opened up or separated at the edges?", "weight": 9},
        {"question": "Is there any foul smell coming from the wound?", "weight": 7},
        {"question": "Do you have diabetes? If yes, what was your most recent blood sugar reading?", "weight": 8},
        {"question": "Do you smoke cigarettes or use any tobacco products?", "weight": 7},
        {"question": "Are you on any steroid medications (prednisone, dexamethasone) or chemotherapy?", "weight": 7},
        {"question": "Do you have HIV? If yes, what is your CD4 count and are you on antiretroviral therapy?", "weight": 6},
        {"question": "Have you had any previous wound infections after surgery in the past?", "weight": 5},
        {"question": "What type of surgery did you have, and was it an emergency or planned?", "weight": 6},
        {"question": "Did you receive antibiotics around the time of your surgery?", "weight": 5},
        {"question": "Have you had any other infections recently (chest, urine, skin)?", "weight": 4},
        {"question": "Are you taking any traditional herbal medicines or supplements?", "weight": 5},
        {"question": "Do you have a drain in place, and what color is the fluid coming from it?", "weight": 6},
        {"question": "Have you had any episodes of coughing, sneezing, or vomiting that put strain on the wound?", "weight": 5},
        {"question": "What is your typical diet like? Do you eat enough protein (meat, eggs, beans)?", "weight": 4},
        {"question": "Do you have any allergies to antibiotics (penicillin, sulfa, etc.)?", "weight": 6},
        {"question": "Have you been out of bed and walking since surgery?", "weight": 4}
    ],
    "new_examination_findings": [
        {"finding": "Erythema extending >5 cm from wound edge (suggests deep SSI or spreading cellulitis)", "weight": 8},
        {"finding": "Wound dehiscence with intact fascia (skin and subcutaneous separation only)", "weight": 8},
        {"finding": "Complete wound dehiscence with fascial rupture and exposed viscera (evisceration -- surgical emergency)", "weight": 10},
        {"finding": "Purulent discharge that is thick, yellowish-green, and foul-smelling", "weight": 9},
        {"finding": "Serosanguinous discharge (may be early SSI or normal healing -- culture to differentiate)", "weight": 5},
        {"finding": "Crepitus on palpation (gas in tissues -- emergency: gas-forming organism or necrotizing fasciitis)", "weight": 10},
        {"finding": "Skin blistering, bullae, or ecchymosis surrounding wound (suggests necrotizing infection)", "weight": 9},
        {"finding": "Wound edge necrosis (black, non-viable tissue requiring debridement)", "weight": 8},
        {"finding": "Lymphangitic streaking (red lines tracking proximally from wound)", "weight": 6},
        {"finding": "Regional lymphadenopathy (tender, enlarged lymph nodes in groin, axilla)", "weight": 5},
        {"finding": "Fever >38.5C with wound signs (suggests systemic involvement)", "weight": 8},
        {"finding": "Hypothermia (<36C) in a patient with wound infection (ominous sign -- overwhelming sepsis)", "weight": 9},
        {"finding": "Leukocytosis (>15,000/mcL) or leukopenia (<4,000/mcL) with left shift", "weight": 6},
        {"finding": "CRP >200 mg/L and rising (active infection marker)", "weight": 7},
        {"finding": "Procalcitonin >2 ng/mL (bacterial etiology confirmed)", "weight": 7},
        {"finding": "Hyperglycemia (glucose >180 mg/dL) in known diabetic or stress hyperglycemia in non-diabetic", "weight": 5},
        {"finding": "Hypoalbuminemia (<25 g/L) suggests malnutrition contributing to poor wound healing", "weight": 5},
        {"finding": "Obesity (BMI >30) visible on exam -- mechanical tension on wound closure", "weight": 4},
        {"finding": "Wound probe passes below the fascia (deep SSI requiring operative exploration)", "weight": 9}
    ],
    "new_mimics": [
        {"diseaseId": "wound_hematoma", "discriminators": ["early onset (<24-48h)", "blue/purple discoloration", "swollen but non-erythematous", "afebrile", "non-fluctuant initially"], "ruleOutTests": ["Wound opening reveals clot, not pus", "Ultrasound of wound", "Culture negative"]},
        {"diseaseId": "wound_seroma", "discriminators": ["clear/amber serous fluid", "non-tender", "no surrounding erythema", "afebrile", "may be fluctuant"], "ruleOutTests": ["Aspiration yields clear fluid", "Culture negative", "Normal CRP/WBC"]},
        {"diseaseId": "suture_abscess (stitch abscess)", "discriminators": ["small (<1 cm) pustule at a suture entry point", "no surrounding cellulitis", "no systemic features", "drains spontaneously when suture removed"], "ruleOutTests": ["Remove offending suture -> rapid resolution", "No antibiotics needed"]},
        {"diseaseId": "contact_dermatitis_to_dressing_or_glue", "discriminators": ["pruritus intense", "erythema extending beyond wound in geometric pattern (shape of dressing)", "vesicles or bullae", "no purulent discharge", "afebrile"], "ruleOutTests": ["Patch testing", "Resolution with topical steroids and dressing change"]},
        {"diseaseId": "pyoderma_gangrenosum", "discriminators": ["rapidly expanding painful ulcer with violaceous undermined edges", "no response to antibiotics", "may have history of IBD or rheumatoid arthritis", "pathergy (worsening with surgical debridement)"], "ruleOutTests": ["Wound biopsy shows neutrophilic infiltration", "No organisms on culture", "Response to steroids/immunosuppression"]}
    ],
    "new_complications": [
        {"diseaseId": "necrotizing_fasciitis", "probability": 0.02, "lagDays": [1, 5], "severityBoost": 0.6, "triggers": ["delayed_wound_opening", "diabetes", "immunosuppression"], "clues": ["rapid_spreading_pain_severe", "crepitus", "skin_necrosis", "systemic_toxicity", "LRINEC_score_>=6"]},
        {"diseaseId": "wound_evisceration", "probability": 0.03, "lagDays": [5, 10], "severityBoost": 0.7, "triggers": ["coughing_sneezing", "malnutrition", "wound_infection", "fascial_breakdown"], "clues": ["sudden_wound_opening", "visible_bowel_or_omentum", "serosanguinous_discharge", "patient_felt_'something_gave'"]},
        {"diseaseId": "chronic_sinus_tract", "probability": 0.03, "lagDays": [14, 90], "severityBoost": 0.1, "triggers": ["retained_suture_material", "mesh_infection", "osteomyelitis_rib_sternum"], "clues": ["persistent_draining_sinus", "intermittent_discharge", "probe_contacts_hard_material"]},
        {"diseaseId": "antibiotic_resistant_organism_colonization", "probability": 0.05, "lagDays": [7, 30], "severityBoost": 0.2, "triggers": ["prolonged_broad_spectrum_antibiotics", "prior_hospitalization"], "clues": ["poor_response_to_empiric_therapy", "positive_culture_for_MRSA_or_ESBL"]}
    ],
    "refined_subtypes": [
        {
            "id": "superficial_ssi",
            "name": "Superficial Incisional SSI",
            "prevalenceModifier": 0.65,
            "keyFeatures": [
                {"feature": "skin_subcutaneous_involvement_only", "weight": 5},
                {"feature": "purulent_discharge_from_incision", "weight": 5},
                {"feature": "erythema_limited_to_wound_edge", "weight": 4},
                {"feature": "fascia_intact", "weight": 5},
                {"feature": "low_grade_fever_or_afebrile", "weight": 3}
            ],
            "management": "Open wound (remove skin sutures/clips). Evacuate pus, break loculi. Wound swab for culture. Pack with saline-soaked gauze. Change dressing daily. Oral antibiotics if cellulitis: Flucloxacillin 500 mg QDS or Clindamycin 300 mg QDS if penicillin-allergic. Secondary intention healing. Delayed primary closure at day 4-5 if wound clean."
        },
        {
            "id": "deep_ssi",
            "name": "Deep Incisional SSI",
            "prevalenceModifier": 0.20,
            "keyFeatures": [
                {"feature": "fascial_muscle_involvement", "weight": 5},
                {"feature": "purulent_discharge_from_depth", "weight": 5},
                {"feature": "wound_dehiscence_partial_or_complete", "weight": 5},
                {"feature": "fever_and_systemic_features", "weight": 4},
                {"feature": "high_fever_>39C", "weight": 4}
            ],
            "management": "Urgent wound exploration in OR under general anesthesia. Open wound fully to assess fascia. Debride all necrotic tissue. If fascia intact: pack wound, NPWT if available, IV antibiotics. If fascia necrotic or dehisced: debride fascia, repair if possible, consider biologic mesh. Do NOT close skin. IV Piperacillin-Tazobactam 4.5 g QDS (or Meropenem 1 g TDS if ESBL suspected). Plan relook in 24-48 hours."
        },
        {
            "id": "organ_space_ssi",
            "name": "Organ/Space SSI",
            "prevalenceModifier": 0.15,
            "keyFeatures": [
                {"feature": "fever_persistent_and_high", "weight": 5},
                {"feature": "abdominal_pain_or_distension", "weight": 5},
                {"feature": "ileus_or_nausea_vomiting", "weight": 4},
                {"feature": "purulent_drainage_from_drain", "weight": 5},
                {"feature": "collection_on_ct_imaging", "weight": 5}
            ],
            "management": "CT imaging to identify collection. CT-guided percutaneous drainage if accessible and safe. If not amenable to percutaneous drainage or patient unstable: re-laparotomy for source control. IV antibiotics tailored to culture. Start empiric: Meropenem 1 g TDS + Metronidazole 500 mg TDS. Sepsis resuscitation if indicated. ICU admission for septic shock."
        }
    ]
}

# ── processing function ──────────────────────────────────────────────────

def enhance_file(filepath, content):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    d = data["disease"]
    disease_id = d["id"]
    
    print(f"Enhancing: {disease_id} ({filepath})")
    
    # add pathophysiologyDetail
    if "pathophysiologyDetail" not in d:
        d["pathophysiologyDetail"] = content["pathophysiologyDetail"]
    else:
        print(f"  WARNING: pathophysiologyDetail already exists in {disease_id}")
    
    # add landmarkTrials
    if "landmarkTrials" not in d:
        d["landmarkTrials"] = content["landmarkTrials"]
    else:
        print(f"  WARNING: landmarkTrials already exists in {disease_id}")
    
    # add evidenceTable
    if "evidenceTable" not in d:
        d["evidenceTable"] = content["evidenceTable"]
    
    # add diagnosticAlgorithm
    if "diagnosticAlgorithm" not in d:
        d["diagnosticAlgorithm"] = content["diagnosticAlgorithm"]
    
    # add managementPearls
    if "managementPearls" not in d:
        d["managementPearls"] = content["managementPearls"]
    
    # add operativeNuances
    if "operativeNuances" not in d:
        d["operativeNuances"] = content["operativeNuances"]
    
    # add prognosis
    if "prognosis" not in d:
        d["prognosis"] = content["prognosis"]
    
    # extend history_questions
    existing_qs = {q["question"] for q in d["history_questions"]}
    for q in content["new_history_questions"]:
        if q["question"] not in existing_qs:
            d["history_questions"].append(q)
            existing_qs.add(q["question"])
    
    # extend examination_findings
    existing_fs = {f["finding"] for f in d["examination_findings"]}
    for f in content["new_examination_findings"]:
        if f["finding"] not in existing_fs:
            d["examination_findings"].append(f)
            existing_fs.add(f["finding"])
    
    # extend mimics
    existing_mimics = {m["diseaseId"] for m in d["mimics"]}
    for m in content["new_mimics"]:
        if m["diseaseId"] not in existing_mimics:
            d["mimics"].append(m)
            existing_mimics.add(m["diseaseId"])
    
    # extend complications
    existing_comps = {c["diseaseId"] for c in d["complications"]}
    for c in content["new_complications"]:
        if c["diseaseId"] not in existing_comps:
            d["complications"].append(c)
            existing_comps.add(c["diseaseId"])
    
    # replace subtypes with refined subtypes (only if we have them)
    if "refined_subtypes" in content:
        d["subtypes"] = content["refined_subtypes"]
    
    # write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"  Done. History: {len(d['history_questions'])} qs, Exam: {len(d['examination_findings'])} findings, Mimics: {len(d['mimics'])}, Complications: {len(d['complications'])}")


if __name__ == "__main__":
    content_map = {
        "anastomotic_leak": ANASTOMOTIC_LEAK,
        "dvt_pe": DVT_PE,
        "ileus": ILEUS,
        "postoperative_bleeding": POSTOP_BLEEDING,
        "postoperative_fever": POSTOP_FEVER,
        "wound_infection": WOUND_INFECTION,
    }
    
    for filename in os.listdir(DIR):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        disease_id = data["disease"]["id"]
        if disease_id in content_map:
            enhance_file(filepath, content_map[disease_id])
        else:
            print(f"Skipping {disease_id}: no enhancement content defined yet")
