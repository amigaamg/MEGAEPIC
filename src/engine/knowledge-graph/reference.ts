export const AGE_BANDS = [
  { label:"Newborn (0-28d)", min:0, max:0.9, hrMin:100, hrMax:160, rrMin:30, rrMax:60, sbpMin:60, sbpMax:90 },
  { label:"Infant (1-12mo)", min:1, max:11.9, hrMin:100, hrMax:150, rrMin:30, rrMax:50, sbpMin:80, sbpMax:100 },
  { label:"Toddler (1-3yr)", min:12, max:35.9, hrMin:90, hrMax:140, rrMin:24, rrMax:40, sbpMin:90, sbpMax:105 },
  { label:"Preschool (3-5yr)", min:36, max:59.9, hrMin:80, hrMax:120, rrMin:22, rrMax:34, sbpMin:90, sbpMax:110 },
  { label:"School (6-12yr)", min:72, max:143.9, hrMin:70, hrMax:110, rrMin:18, rrMax:30, sbpMin:95, sbpMax:120 },
  { label:"Adolescent (13-18yr)", min:144, max:215.9, hrMin:60, hrMax:100, rrMin:12, rrMax:20, sbpMin:110, sbpMax:135 },
];

export function getAgeBand(mo: number) {
  return AGE_BANDS.find(b => mo <= b.max) || AGE_BANDS[AGE_BANDS.length-1];
}

export function formatAge(mo: number | string) {
  const m = parseInt(String(mo));
  if (isNaN(m)) return "Unknown age";
  if (m === 0) return "a newborn";
  if (m < 12) return `a ${m}-month-old`;
  const yr = Math.floor(m/12), rem = m%12;
  if (rem === 0) return `a ${yr}-year-old`;
  return `a ${yr}-year, ${rem}-month-old`;
}

export const DISEASES = [
  { id:"pneumonia", name:"Pneumonia", color:"#ef4444" },
  { id:"asthma", name:"Asthma", color:"#3b82f6" },
  { id:"bronchiolitis", name:"Bronchiolitis", color:"#10b981" },
  { id:"tuberculosis", name:"Tuberculosis", color:"#f59e0b" },
  { id:"urti", name:"Viral URTI", color:"#6b7280" },
  { id:"croup", name:"Croup", color:"#ec4899" },
  { id:"foreign_body", name:"Foreign Body Aspiration", color:"#8b5cf6" },
  { id:"pleural_effusion", name:"Pleural Effusion", color:"#14b8a6" },
  { id:"chf", name:"Cardiac / CHF", color:"#f97316" },
  { id:"epiglottitis", name:"Epiglottitis", color:"#dc2626" },
  { id:"bronchiectasis", name:"Bronchiectasis", color:"#84cc16" },
  { id:"empyema", name:"Empyema", color:"#a855f7" },
  { id:"anaphylaxis", name:"Anaphylaxis", color:"#e11d48" },
  { id:"pneumothorax", name:"Pneumothorax", color:"#0ea5e9" },
];

export const ESSENTIAL_DRUGS = [
  { drug:"Adrenaline 1:10,000 (cardiac arrest)", route:"IV/IO", dose:(w:number)=>`${(0.1*w).toFixed(1)} ml`, freq:"q3-5 min", note:"0.1 ml/kg; repeat every 3-5 min in cardiac arrest" },
  { drug:"Adrenaline 1:1,000 IM (anaphylaxis)", route:"IM", dose:(w:number,a:number)=>a<72?"0.15 ml (150 mcg)":"0.3 ml (300 mcg)", freq:"Stat; repeat at 5-15 min", note:"Anterolateral thigh; <6 yr: 150 mcg, >6 yr: 300 mcg" },
  { drug:"Adrenaline nebulised (croup)", route:"Neb", dose:()=>"2.0 ml", freq:"Stat; repeat if effective", note:"Use neat 1:1,000; monitor closely for rebound" },
  { drug:"Amikacin", route:"IV/IM", dose:(w:number)=>`${(15*w).toFixed(0)} mg`, freq:"Every 24 h", note:"Infuse over 30-60 min; monitor trough levels" },
  { drug:"Aminophylline (loading)", route:"IV", dose:(w:number)=>`${(6*w).toFixed(0)} mg`, freq:"Over 1 h", note:"Then maintenance 5 mg/kg/day; check theophylline levels" },
  { drug:"Amoxicillin (simple infection)", route:"PO", dose:(w:number)=>`${(25*w).toFixed(0)} mg`, freq:"Every 8 h", note:"Standard dose for non-severe infections" },
  { drug:"Amoxicillin (pneumonia)", route:"PO", dose:(w:number)=>`${Math.min(45*w,2000).toFixed(0)} mg`, freq:"Every 12 h", note:"40-45 mg/kg/dose; max 2 g/dose" },
  { drug:"Ampicillin (>1 month)", route:"IV/IM", dose:(w:number)=>`${Math.min(50*w,500).toFixed(0)} mg`, freq:"Every 6 h", note:"Max 500 mg/dose; for meningitis use 100 mg/kg/day" },
  { drug:"Artesunate IV (<=20 kg)", route:"IV/IM", dose:(w:number)=>`${(3*w).toFixed(0)} mg`, freq:"0 h, 12 h, 24 h, then daily", note:"Reconstitute with 5% NaHCO3; switch to oral ACT when possible" },
  { drug:"Artesunate IV (>20 kg)", route:"IV/IM", dose:(w:number)=>`${(2.4*w).toFixed(1)} mg`, freq:"0 h, 12 h, 24 h, then daily", note:"2.4 mg/kg/dose" },
  { drug:"Azithromycin", route:"PO", dose:(w:number)=>`${Math.min(10*w,500).toFixed(0)} mg`, freq:"Every 24 h x 3 days", note:"Max 500 mg/day; use for atypical pneumonia" },
  { drug:"Benzylpenicillin", route:"IV/IM", dose:(w:number)=>`${Math.min(50000*w,4000000).toFixed(0)} IU`, freq:"Every 6 h", note:"50,000 IU/kg/dose; max 4M IU/dose; for neonates <7 days, give every 12 h" },
  { drug:"Caffeine citrate (apnoea)", route:"PO/IV", dose:(w:number)=>`${(20*w).toFixed(0)} mg`, freq:"Loading; then 5-10 mg/kg daily", note:"Maintenance begins 12-24 h after loading dose" },
  { drug:"Calcium gluconate 10%", route:"IV", dose:(w:number)=>`${Math.min(0.5*w,20).toFixed(1)} ml`, freq:"Over 5-10 min", note:"0.5-2 ml/kg; max 20 ml; for symptomatic hypocalcaemia" },
  { drug:"Ceftriaxone", route:"IV/IM", dose:(w:number)=>`${Math.min(50*w,2000).toFixed(0)} mg`, freq:"Every 24 h", note:"50 mg/kg/dose; max 2 g/dose (4 g/day for meningitis); avoid if jaundiced or <7 days old" },
  { drug:"Ceftazidime", route:"IV/IM", dose:(w:number)=>`${Math.min(50*w,2000).toFixed(0)} mg`, freq:"Every 8 h", note:"50 mg/kg/dose; max 2 g/dose (6 g/day); for Pseudomonas and gram-negative infections" },
  { drug:"Ciprofloxacin", route:"PO", dose:(w:number)=>`${Math.min(15*w,500).toFixed(0)} mg`, freq:"Every 12 h x 3 days", note:"15 mg/kg/dose; max 500 mg/dose; for dysentery (Shigella); use with caution <18 yr" },
  { drug:"Co-trimoxazole (prophylaxis)", route:"PO", dose:(w:number,a:number)=>w<5?"2.5 ml":w<11?"5 ml":w<17?"10 ml or 1 tab":"2 tabs (480 mg)", freq:"Every 24 h", note:"PCP prophylaxis; start at 6 weeks in HIV-exposed infants" },
  { drug:"Dexamethasone (croup)", route:"PO/IM/IV", dose:(w:number)=>`${Math.min(0.6*w,16).toFixed(1)} mg`, freq:"Single dose", note:"0.15-0.6 mg/kg; max 16 mg; single dose sufficient for most presentations" },
  { drug:"Diazepam (IV/IO)", route:"IV", dose:(w:number)=>`${Math.min(0.3*w,10).toFixed(1)} mg`, freq:"Slow IV over 1-2 min", note:"0.3 mg/kg; max 10 mg; max 2 doses; do not repeat if phenobarbitone given" },
  { drug:"Diazepam (rectal)", route:"PR", dose:(w:number)=>`${Math.min(0.5*w,10).toFixed(1)} mg`, freq:"Stat", note:"0.5 mg/kg PR; max 10 mg; insert syringe 4-5 cm; first-line out-of-hospital" },
  { drug:"Dextrose 10% (hypoglycaemia)", route:"IV", dose:(w:number)=>`${(5*w).toFixed(0)} ml`, freq:"Over 2-3 min", note:"5 ml/kg; for neonates use 2 ml/kg; recheck BGL after 30 min" },
  { drug:"Flucloxacillin", route:"IV/IM", dose:(w:number)=>`${Math.min(50*w,2000).toFixed(0)} mg`, freq:"Every 6 h", note:"50 mg/kg/dose; max 2 g/dose; for staphylococcal infections including SSTI and bone/joint infection" },
  { drug:"Gentamicin", route:"IV/IM", dose:(w:number)=>`${Math.min(7.5*w,500).toFixed(1)} mg`, freq:"Every 24 h", note:"7.5 mg/kg/dose; max 500 mg; infuse over 30 min; trough level <2 mg/L; peak 5-10 mg/L" },
  { drug:"Hydroxyurea (sickle cell)", route:"PO", dose:(w:number)=>`${(20*w).toFixed(0)} mg`, freq:"Every 24 h", note:"Start at 20 mg/kg; titrate up by 2.5-5 mg/kg every 12 weeks; max 35 mg/kg" },
  { drug:"Ibuprofen", route:"PO", dose:(w:number)=>`${Math.min(10*w,400).toFixed(0)} mg`, freq:"Every 6-8 h PRN", note:"5-10 mg/kg/dose; max 400 mg/dose; use with food" },
  { drug:"Levetiracetam (loading)", route:"IV", dose:(w:number)=>`${(30*w).toFixed(0)} mg`, freq:"Over 15 min", note:"Then 30 mg/kg/day in two divided doses after 12 h" },
  { drug:"Lorazepam (IV)", route:"IV", dose:(w:number)=>`${Math.min(0.1*w,4).toFixed(1)} mg`, freq:"Over 30-60 sec", note:"Max 4 mg; preferred benzodiazepine for status epilepticus" },
  { drug:"Mannitol 20% (cerebral oedema)", route:"IV", dose:(w:number)=>`${(0.5*w).toFixed(0)} g = ${(2.5*w).toFixed(0)} ml`, freq:"Over 15-30 min", note:"0.5-1 g/kg; max 6 doses; monitor serum osmolality" },
  { drug:"Midazolam (buccal)", route:"Buccal", dose:(w:number,a:number)=>a<=2?"0.3 mg/kg (max 2.5 mg)":a<=11?"2.5 mg":a<=59?"5 mg":"10 mg", freq:"Stat; repeat once at 10 min", note:"Instil between lower gum and cheek; effective within 5-10 min" },
  { drug:"Morphine (oral)", route:"PO", dose:(w:number)=>`${(0.3*w).toFixed(1)} mg`, freq:"Every 4-6 h PRN", note:"0.2-0.5 mg/kg; IV/IM dose is 0.1 mg/kg; titrate to effect" },
  { drug:"Naloxone", route:"IV/IM", dose:(w:number)=>`${(0.1*w).toFixed(1)} mg`, freq:"Repeat every 2-3 min", note:"Max 2 mg/dose; shorter half-life than opioids -- observe for re-sedation" },
  { drug:"Nystatin (oral thrush)", route:"PO", dose:(w:number,a:number)=>a<=1?"0.5-1 ml":"2-3 ml", freq:"Every 6 h", note:"Apply directly to lesions; continue for 2 days after resolution; 2 weeks if HIV+" },
  { drug:"Omeprazole", route:"PO/IV", dose:(w:number)=>`${Math.min(1*w,20).toFixed(0)} mg`, freq:"Every 24 h", note:"1 mg/kg once daily; max 20 mg/day; use for GERD and stress ulcer prophylaxis" },
  { drug:"Paracetamol", route:"PO/IV/PR", dose:(w:number)=>`${(15*w).toFixed(0)} mg`, freq:"Every 6-8 h PRN", note:"10-15 mg/kg/dose; max 75 mg/kg/day; IV dose 7.5 mg/kg <10 kg" },
  { drug:"Phenobarbitone (loading)", route:"IV/IM", dose:(w:number)=>`${(15*w).toFixed(0)} mg`, freq:"Stat (neonates: 20 mg/kg)", note:"Do NOT give if already on maintenance phenobarbitone; rate <=1 mg/kg/min" },
  { drug:"Phenobarbitone (maintenance)", route:"PO", dose:(w:number)=>`${Math.min(5*w,60).toFixed(0)} mg`, freq:"Every 24 h", note:"2.5-5 mg/kg/day; monitor levels (therapeutic 15-40 mcg/ml)" },
  { drug:"Phenytoin (loading)", route:"IV", dose:(w:number)=>`${(15*w).toFixed(0)} mg`, freq:"Over 20-30 min", note:"Max rate 1 mg/kg/min; cardiac monitoring required; fosphenytoin preferred if available" },
  { drug:"Prednisolone (asthma)", route:"PO", dose:(w:number)=>`${Math.min(2*w,40).toFixed(0)} mg`, freq:"Every 24 h x 3-5 days", note:"1-2 mg/kg/day; max 40 mg; no taper needed for short courses <5 days" },
  { drug:"Salbutamol (nebulised)", route:"Neb", dose:()=>"2.5 mg", freq:"Every 20 min x 3, then PRN", note:"2.5 mg/dose <20 kg; 5 mg >=20 kg; use with O2 if available" },
  { drug:"Salbutamol MDI + spacer", route:"Inhaled", dose:()=>"4-8 puffs (100 mcg each)", freq:"Every 20 min x 3, then PRN", note:"Use spacer with mask for <6 yr; equivalent to 2.5 mg nebulised" },
  { drug:"Sodium valproate (status)", route:"IV", dose:(w:number)=>`${(30*w).toFixed(0)} mg`, freq:"Over 5 min", note:"30 mg/kg IV; then 30-40 mg/kg/day in 2 divided doses; check LFTs" },
  { drug:"3% Hypertonic saline", route:"IV", dose:(w:number)=>`${(3*w).toFixed(0)} ml`, freq:"Over 15 min; repeat once", note:"2.5-5 ml/kg for cerebral oedema in DKA or hyponatraemic seizures" },
  { drug:"Vitamin A (<6 months)", route:"PO", dose:()=>"50,000 IU", freq:"Stat (single dose)", note:"Do not repeat within 1 month; associated with reduced mortality in measles/malnutrition" },
  { drug:"Vitamin A (6-12 months)", route:"PO", dose:()=>"100,000 IU", freq:"Stat", note:"Repeat on day 2 and day 14 if malnutrition with eye disease" },
  { drug:"Vitamin A (>12 months)", route:"PO", dose:()=>"200,000 IU", freq:"Stat; repeat day 2 and day 14 if eye disease", note:"Standard dose for children >12 months with measles/VAD" },
  { drug:"Zinc (diarrhoea <=6 months)", route:"PO", dose:()=>"10 mg", freq:"Every 24 h x 10-14 days", note:"Reduces duration and severity of diarrhoeal episodes" },
  { drug:"Zinc (diarrhoea >6 months)", route:"PO", dose:()=>"20 mg", freq:"Every 24 h x 10-14 days", note:"WHO/UNICEF recommendation for acute diarrhoea management" },
  { drug:"Rifampicin (TB)", route:"PO", dose:(w:number)=>`${Math.min(15*w,600).toFixed(0)} mg`, freq:"Every 24 h", note:"Part of RHZE regimen; 15 mg/kg; max 600 mg/day; for TB meningitis 20 mg/kg" },
  { drug:"Isoniazid (INH, TB)", route:"PO", dose:(w:number)=>`${Math.min(10*w,300).toFixed(0)} mg`, freq:"Every 24 h", note:"Part of RHZE regimen; 10 mg/kg; max 300 mg/day; give with pyridoxine to prevent neuropathy" },
  { drug:"Pyrazinamide (TB)", route:"PO", dose:(w:number)=>`${Math.min(35*w,2000).toFixed(0)} mg`, freq:"Every 24 h", note:"Part of RHZE regimen; 35 mg/kg; max 2 g/day; hepatotoxic" },
  { drug:"Ethambutol (TB)", route:"PO", dose:(w:number)=>`${Math.min(20*w,1200).toFixed(0)} mg`, freq:"Every 24 h", note:"Part of RHZE regimen; 20 mg/kg; max 1.2 g/day; monitor visual acuity" },
  { drug:"Ipratropium bromide", route:"Neb", dose:()=>"0.25 mg", freq:"Every 20 min x 3 doses (with first 3 salbutamol doses only)", note:"Add to initial salbutamol in moderate-severe asthma exacerbation" },
  { drug:"Magnesium sulphate (severe asthma)", route:"IV", dose:(w:number)=>`${Math.min(40*w,2000).toFixed(0)} mg`, freq:"Single dose over 20 min", note:"40 mg/kg (max 2 g); single dose over 20 min for severe asthma not responding to initial therapy" },
  { drug:"Metronidazole", route:"IV/PO", dose:(w:number)=>`${Math.min(7.5*w,500).toFixed(1)} mg`, freq:"Every 8 h", note:"7.5 mg/kg/dose; max 500 mg/dose; for anaerobic infections; IV over 30 min" },
  { drug:"Urokinase (intrapleural)", route:"Intrapleural", dose:()=>"100,000 IU in 50 mL NS", freq:"Instill and clamp 4 h; repeat up to 3 doses", note:"For loculated empyema not resolving with chest tube alone" },
];

export const MILESTONES = [
  { age:"6 wk", text:"Social smile; follows moving face to midline" },
  { age:"4 mo", text:"Head control; laughs aloud; reaches for objects" },
  { age:"6 mo", text:"Sits with support; transfers objects; first teeth erupting" },
  { age:"7-9 mo", text:"Sits without support; crawls; babbles with consonants; stranger anxiety" },
  { age:"10-12 mo", text:"Pulls to stand; pincer grasp; 'mama/dada' specific; waves bye-bye" },
  { age:"13-15 mo", text:"Walks independently; 3-6 words; scribbles" },
  { age:"18 mo", text:"Runs stiffly; 10-20 words; points to show interest; follows 2-step command" },
  { age:"2 yr", text:"2-3 word phrases; climbs stairs; parallel play; toilet training begins" },
  { age:"3 yr", text:"3-4 word sentences; rides tricycle; draws a circle; knows name and age" },
  { age:"4 yr", text:"Hops on one foot; draws a person with 4 parts; cooperative play" },
  { age:"5 yr", text:"Copies a triangle; counts to 10; dresses independently; speech fully intelligible" },
];

export const ALL_SYMPTOMS = [
  { id:"cough", label:"Cough" },
  { id:"fever", label:"Fever" },
  { id:"difficulty_breathing", label:"Difficulty Breathing" },
  { id:"wheeze", label:"Wheeze" },
  { id:"stridor", label:"Stridor" },
  { id:"chest_pain", label:"Chest Pain" },
  { id:"hemoptysis", label:"Haemoptysis" },
  { id:"noisy_breathing", label:"Noisy Breathing" },
  { id:"reduced_feeding", label:"Reduced Feeding" },
  { id:"lethargy", label:"Lethargy" },
  { id:"cyanosis", label:"Cyanosis", warn:true },
  { id:"night_sweats", label:"Night Sweats" },
  { id:"weight_loss", label:"Weight Loss" },
  { id:"nasal_discharge", label:"Nasal Discharge" },
  { id:"sore_throat", label:"Sore Throat" },
  { id:"chest_tightness", label:"Chest Tightness" },
  { id:"rash", label:"Rash" },
  { id:"ear_pain", label:"Ear Pain" },
  { id:"abdominal_pain", label:"Abdominal Pain" },
];

export const DDX_RULES: Record<string, {supports:string[];rulesOut:string[];investigations:string[]}> = {
  Pneumonia: {
    supports:["Fever with cough and tachypnoea","Chest indrawing or recession","Focal crackles on auscultation","Dullness to percussion","Consolidation, air bronchogram, or infiltrate on CXR"],
    rulesOut:["Wheeze without crackles (suggests asthma/bronchiolitis)","Normal chest X-ray and normal CRP","No fever in an immunocompetent child","Chronic cough >2 weeks from the outset"],
    investigations:["CXR (PA + lateral)","FBC + differential + CRP","Blood culture x2 (before antibiotics)","Procalcitonin","Blood gas if severe"],
  },
  Asthma: {
    supports:["Recurrent episodic wheeze","Nocturnal cough or exercise-triggered cough","Personal or family history of atopy","Response to inhaled bronchodilators","Age >12 months"],
    rulesOut:["First episode of wheeze under 12 months in RSV season (bronchiolitis)","Unilateral wheeze (foreign body)","Fever with focal signs (pneumonia)","Inspiratory stridor (upper airway)"],
    investigations:["Peak flow measurement (>5 years)","Spirometry with bronchodilator reversibility","Allergy panel (specific IgE, skin prick test)","CXR if atypical features"],
  },
  Bronchiolitis: {
    supports:["First episode of wheeze in an infant <12 months","Coryzal prodrome preceding wheeze and respiratory distress","RSV season (typically May-September in tropics)","Hyperinflation and peribronchial cuffing on CXR"],
    rulesOut:["Recurrent wheeze episodes (favour asthma)","High fever >39C with toxic appearance (pneumonia/sepsis)","Age >24 months","Unilateral wheeze (foreign body)"],
    investigations:["RSV antigen test or nasopharyngeal PCR","CXR only if severe, asymmetric, or uncertain diagnosis"],
  },
  Tuberculosis: {
    supports:["Cough persisting >2 weeks","Unexplained weight loss or failure to thrive","Drenching night sweats","Household TB contact","Positive Mantoux (>=10 mm, or >=5 mm if HIV+)","Hilar lymphadenopathy or miliary pattern on CXR","HIV infection"],
    rulesOut:["Negative Mantoux with normal CXR and no household contact","Complete resolution with broad-spectrum antibiotics","Acute onset <2 weeks with a clear viral cause"],
    investigations:["GeneXpert MTB/RIF on sputum, gastric aspirate x3, or NPA","CXR (PA view)","Mantoux test / TST","HIV test","IGRA if Mantoux indeterminate"],
  },
  Croup: {
    supports:["Barking, seal-like cough (very characteristic)","Inspiratory stridor that may be audible at rest","Hoarse or dysphonic voice","Age 6 months-3 years","Coryzal prodrome; symptoms worse at night"],
    rulesOut:["Sudden onset without prodrome (foreign body aspiration)","Drooling with high fever and toxic appearance (epiglottitis)","High fever with toxic child and no barking cough (bacterial tracheitis)"],
    investigations:["Clinical diagnosis in most cases","CXR (AP neck -- 'steeple sign' in <50%)","Lateral neck X-ray only if epiglottitis cannot be excluded clinically"],
  },
  Epiglottitis: {
    supports:["Abrupt onset high fever (>39C) in a toxic-looking child","Drooling and severe dysphagia","Tripod or sniffing position (child leans forward, reluctant to move)","Muffled, 'hot-potato' voice with NO barking cough","Age 2-6 years (though any age since Hib vaccination introduced)"],
    rulesOut:["Barking cough (croup)","Good response to nebulised adrenaline","Gradual onset with URTI prodrome"],
    investigations:["DO NOT examine the oropharynx outside the controlled setting of an operating theatre","Lateral neck X-ray (thumbprint sign of swollen epiglottis) -- only if stable and accompanied by senior clinician","Blood culture","FBC with differential"],
  },
  "Foreign Body Aspiration": {
    supports:["Sudden choking episode -- often a clear witness history","Unilateral wheeze or unilateral reduced air entry","Age 6 months-4 years; history of playing with nuts, seeds, coins, or small toys","Recurrent pneumonia localised to the same lobe","Persistent respiratory symptoms following the initial choking episode"],
    rulesOut:["Bilateral wheeze without choking history (asthma)","Fever present from the outset with bilateral signs (infection)","Gradual onset over days"],
    investigations:["CXR (inspiratory + expiratory, or lateral decubitus) -- air trapping, mediastinal shift, or opacity","Rigid bronchoscopy (gold standard for diagnosis and removal)","CT chest if CXR inconclusive and high clinical suspicion"],
  },
};
