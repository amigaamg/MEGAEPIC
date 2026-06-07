package reasoning

import (
	"fmt"
	"math"
	"strings"

	"github.com/amexan/lbo-engine/internal/models"
)

// ——— Constants ———

const (
	ROLE_FIRST       = "first"
	ROLE_DOMINANT    = "dominant"
	ROLE_PROGRESSIVE = "progressive"
	ROLE_SECONDARY   = "secondary"
	ROLE_LATE        = "late"
	ROLE_COMPLICATION = "complication"
)

var roleOrder = map[string]int{
	ROLE_FIRST: 0, ROLE_DOMINANT: 1, ROLE_PROGRESSIVE: 2,
	ROLE_SECONDARY: 3, ROLE_LATE: 4, ROLE_COMPLICATION: 5,
}

func sortStreamsByTimeline(streams []models.SymptomStream) []models.SymptomStream {
	out := make([]models.SymptomStream, len(streams))
	copy(out, streams)
	for i := 0; i < len(out); i++ {
		for j := i + 1; j < len(out); j++ {
			ai, bi := out[i], out[j]
			if ai.OnsetDay > bi.OnsetDay || (ai.OnsetDay == bi.OnsetDay && roleOrder[ai.Role] > roleOrder[bi.Role]) {
				out[i], out[j] = out[j], out[i]
			}
		}
	}
	return out
}

// ——— Gendered Pronoun ———

type gender struct {
	sub, obj, pos, title string
}

func g(sex string) gender {
	switch sex {
	case "female":
		return gender{"She", "her", "her", "lady"}
	case "male":
		return gender{"He", "him", "his", "gentleman"}
	default:
		return gender{"They", "them", "their", "patient"}
	}
}

// ——— 1. History Narrative (pure story, no interpretation) ———

func BuildHistoryNarrative(streams []models.SymptomStream, history models.HistoryData, sex string) string {
	var present []models.SymptomStream
	for _, s := range streams {
		if s.Present && s.Type != "previous_episodes" {
			present = append(present, s)
		}
	}
	if len(present) == 0 {
		return ""
	}

	sorted := sortStreamsByTimeline(present)
	p := g(sex)
	var blocks []string
	first := sorted[0]
	durationStr := fmt.Sprintf("%d days", first.OnsetDay)
	if first.OnsetDay <= 1 {
		durationStr = "one day"
	}

	// — C/C opening —
	var ccSymptoms []string
	seen := map[string]bool{}
	for _, s := range sorted {
		l := strings.ToLower(s.Label)
		if !seen[l] {
			ccSymptoms = append(ccSymptoms, l)
			seen[l] = true
		}
	}
	ccStr := strings.Join(ccSymptoms, ", ")
	blocks = append(blocks, fmt.Sprintf("%s presents with a %s history of %s.", p.sub, durationStr, ccStr))

	// — Context + first sensation —
	context := "otherwise in good health"
	if history.ContextAtOnset != "" {
		context = "while " + history.ContextAtOnset
	}
	if history.FirstSensation != "" {
		blocks = append(blocks, fmt.Sprintf("%s was in %s usual state of good health until %s prior to presentation when, %s, %s first experienced %s.",
			p.sub, p.pos, durationStr, context, strings.ToLower(p.sub), history.FirstSensation))
	} else {
		blocks = append(blocks, fmt.Sprintf("%s was in %s usual state of good health until %s prior to presentation when, %s, symptoms first developed.",
			p.sub, p.pos, durationStr, context, strings.ToLower(p.sub)))
	}

	// — First event description —
	painCharMap := map[string]string{
		"colicky": "colicky (cramping) in nature",
		"constant": "constant and unremitting in nature",
		"colicky_then_constant": "initially colicky but has since become constant",
		"sharp": "sharp and stabbing in nature",
		"burning": "burning in nature",
	}

	if first.Type == "pain" {
		char := painCharMap[first.Character]
		if char == "" {
			char = "abdominal discomfort"
		}
		loc := "in the abdomen"
		if first.Location != "" {
			loc = "localised to the " + first.Location
		}
		onset := "It began"
		if first.OnsetSpeed != "" {
			onset = "The onset was " + first.OnsetSpeed
		}
		blocks = append(blocks, fmt.Sprintf("%s — initially %s — and was %s. At this stage, it was not yet severe enough to interfere with %s routine activities.",
			onset, char, loc, p.pos))
	} else if first.Type == "distension" {
		speed := ""
		if first.OnsetSpeed != "" {
			speed = first.OnsetSpeed + " "
		}
		blocks = append(blocks, fmt.Sprintf("The initial manifestation was %sabdominal distension, which %s described as a feeling of fullness and tightness.",
			speed, strings.ToLower(p.sub)))
	} else {
		blocks = append(blocks, fmt.Sprintf("The first symptom was %s.", first.Label))
	}

	// — Subsequent events —
	for i := 1; i < len(sorted); i++ {
		s := sorted[i]
		prev := sorted[i-1]
		sameDay := s.OnsetDay == prev.OnsetDay
		gap := s.OnsetDay - prev.OnsetDay

		transition := "Subsequently,"
		if sameDay {
			transition = "Within the same period,"
		} else if gap == 1 {
			transition = "By the following day,"
		} else {
			transition = fmt.Sprintf("By Day %d,", s.OnsetDay)
		}

		var eventDesc string
		switch s.Type {
		case "pain":
			char := painCharMap[s.Character]
			loc := ""
			if s.Location != "" {
				loc = ", localised to the " + s.Location
			}
			prog := ""
			if s.Progression == "worsening" {
				prog = " and has been progressively intensifying"
			}
			eventDesc = fmt.Sprintf("the abdominal pain became more pronounced. %s%s%s", char, loc, prog)
			if s.Character != "" && s.Character != first.Character && s.Character == "colicky_then_constant" {
				eventDesc += " The patient reports the pain had changed — initially coming in waves but now constant."
			}
		case "distension":
			prog := ""
			if s.Progression == "worsening" {
				prog = ", progressive"
			}
			eventDesc = fmt.Sprintf("%s noticed%s abdominal distension, which became increasingly marked. The abdomen felt tense and swollen, interfering with breathing and movement.%s",
				strings.ToLower(p.sub), prog, "")
			eventDesc += fmt.Sprintf(" %s abdomen became visibly larger, and clothing no longer fit properly.", p.pos)
		case "vomiting":
			content := s.Content
			if content == "" {
				content = "gastric contents"
			}
			freq := s.Frequency
			if freq == "" {
				freq = "several"
			}
			eventDesc = fmt.Sprintf("%s episodes of vomiting developed, with vomitus consisting of %s", freq, content)
		case "constipation":
			days := ""
			if s.LastBowelDays > 0 {
				days = fmt.Sprintf(" for %d day(s)", s.LastBowelDays)
			}
			eventDesc = fmt.Sprintf("%s became constipated%s", strings.ToLower(p.sub), days)
		case "flatus_loss":
			eventDesc = fmt.Sprintf("flatus ceased — %s could no longer pass wind. Neither stool nor flatus was being passed", strings.ToLower(p.sub))
		case "fever":
			eventDesc = "fever developed"
		case "weight_loss":
			eventDesc = "unintentional weight loss was noted"
		case "bleeding":
			eventDesc = "rectal bleeding was reported"
		default:
			eventDesc = s.Label + " developed"
		}

		blocks = append(blocks, fmt.Sprintf("%s %s.", transition, eventDesc))
	}

	// — Functional impact —
	var funcParts []string
	if history.FunctionalImpact != "" {
		funcParts = append(funcParts, history.FunctionalImpact)
	}
	switch history.EatingImpact {
	case "stopped":
		funcParts = append(funcParts, fmt.Sprintf("%s has stopped eating", p.sub))
	case "reduced":
		funcParts = append(funcParts, "oral intake is reduced")
	}
	switch history.SleepImpact {
	case "unable":
		funcParts = append(funcParts, "and has been unable to sleep")
	case "disturbed":
		funcParts = append(funcParts, "sleep is disturbed")
	}
	switch history.WorkCapacity {
	case "stopped":
		funcParts = append(funcParts, fmt.Sprintf("%s has stopped all usual activities", p.sub))
	case "limited":
		funcParts = append(funcParts, "daily activities are limited")
	}
	if len(funcParts) > 0 {
		blocks = append(blocks, fmt.Sprintf("The impact on %s daily function has been marked. %s.", p.pos, strings.Join(funcParts, ". ")))
	}

	// — Negatives —
	var denied []string
	if history.DeniesNausea { denied = append(denied, "nausea") }
	if history.DeniesVomiting { denied = append(denied, "vomiting") }
	if history.DeniesFever { denied = append(denied, "fever") }
	if history.DeniesWeightLoss { denied = append(denied, "unintentional weight loss") }
	if history.DeniesRectalBleeding { denied = append(denied, "rectal bleeding") }
	if history.DeniesPreviousEpisodes { denied = append(denied, "previous similar episodes") }
	if history.DeniesChronicConstip { denied = append(denied, "chronic constipation") }
	if history.DeniesFamilyHistoryCRC { denied = append(denied, "family history of colorectal cancer") }
	if history.DeniesAbdominalSurgery { denied = append(denied, "previous abdominal surgery") }
	for _, s := range streams {
		if s.Denied {
			l := strings.ToLower(s.Label)
			found := false
			for _, d := range denied {
				if d == l { found = true; break }
			}
			if !found { denied = append(denied, l) }
		}
	}
	if len(denied) == 1 {
		blocks = append(blocks, fmt.Sprintf("There is no history of %s.", denied[0]))
	} else if len(denied) > 1 {
		last := denied[len(denied)-1]
		rest := strings.Join(denied[:len(denied)-1], ", ")
		blocks = append(blocks, fmt.Sprintf("There is no history of %s or %s.", rest, last))
	}

	return strings.Join(blocks, " ")
}

// ——— 2. DDX Engine ———

func ReasonHistory(history models.HistoryData, reg models.RegistrationData) []models.DdxEntry {

	volvInFavor := []string{}
	volvAgainst := []string{}

	if history.HPIPreviousEpisodes {
		volvInFavor = append(volvInFavor, "Previous similar episodes (classic for recurrent volvulus)")
	} else {
		volvAgainst = append(volvAgainst, "No previous similar episodes")
	}

	// Colicky pain pattern
	if history.HPIPainCharacter == "colicky" {
		volvInFavor = append(volvInFavor, "Colicky pain — consistent with mechanical obstruction")
	} else if history.HPIPainCharacter == "colicky_then_constant" {
		volvInFavor = append(volvInFavor, "Progression from colicky to constant pain — raises concern for ischaemia complicating volvulus")
	}

	// Absolute constipation
	if history.HPIFlatusStatus == "not_passing" && (history.HPIBowelStatus == "absolute_constipation" || history.HPIBowelStatus == "constipated") {
		volvInFavor = append(volvInFavor, "Absolute constipation (no stool nor flatus) — closed-loop obstruction")
	}

	if history.HPIWeightLoss {
		volvAgainst = append(volvAgainst, "Weight loss — not typical of simple volvulus, consider malignancy")
	}
	if history.HPIBleeding {
		volvAgainst = append(volvAgainst, "Rectal bleeding — not typical of volvulus, consider carcinoma")
	}

	volvScore := float64(len(volvInFavor)*10 - len(volvAgainst)*8)
	if volvScore < 0 {
		volvScore = 0
	}

	caInFavor := []string{}
	caAgainst := []string{}
	if history.HPIWeightLoss {
		caInFavor = append(caInFavor, "Unintentional weight loss — cardinal symptom of colorectal malignancy")
	}
	if history.HPIBleeding {
		caInFavor = append(caInFavor, "Rectal bleeding — presenting symptom in 30-50% of colorectal cancers")
	}
	if reg.Age > 60 {
		caInFavor = append(caInFavor, fmt.Sprintf("Age %d — colorectal cancer incidence rises after 50", reg.Age))
	} else if reg.Age < 40 {
		caAgainst = append(caAgainst, fmt.Sprintf("Age %d — colorectal cancer uncommon under 40 without hereditary predisposition", reg.Age))
	}
	if history.HPIPreviousEpisodes {
		caAgainst = append(caAgainst, "Previous similar episodes — more suggestive of volvulus")
	}
	if history.HPIBowelStatus == "constipated" || history.HPIBowelStatus == "absolute_constipation" {
		caInFavor = append(caInFavor, "Change in bowel habit — classic early symptom of left-sided CRC")
	}

	caScore := float64(len(caInFavor)*12 - len(caAgainst)*5)
	if caScore < 0 {
		caScore = 0
	}

	// Pseudo-obstruction
	pseudoInFavor := []string{}
	pseudoAgainst := []string{}
	if !history.HPIAssociatedVomiting {
		pseudoInFavor = append(pseudoInFavor, "No vomiting — less prominent in pseudo-obstruction")
	}
	if history.HPIFlatusStatus == "passing" {
		pseudoInFavor = append(pseudoInFavor, "Still passing flatus — incomplete blockage, favours pseudo-obstruction")
	}
	if history.HPIPreviousEpisodes {
		pseudoAgainst = append(pseudoAgainst, "Previous episodes — suggest recurrent volvulus, not pseudo-obstruction")
	}
	pseudoScore := float64(len(pseudoInFavor)*10 - len(pseudoAgainst)*5)
	if pseudoScore < 0 {
		pseudoScore = 0
	}

	var ddx []models.DdxEntry
	total := volvScore + caScore + pseudoScore
	if total == 0 {
		total = 1
	}

	ddx = append(ddx, models.DdxEntry{
		Diagnosis: "Sigmoid Volvulus",
		Score:     math.Round(volvScore/total*100),
		InFavor:   volvInFavor,
		Against:   volvAgainst,
	})
	ddx = append(ddx, models.DdxEntry{
		Diagnosis: "Obstructing Colorectal Carcinoma",
		Score:     math.Round(caScore/total*100),
		InFavor:   caInFavor,
		Against:   caAgainst,
	})
	ddx = append(ddx, models.DdxEntry{
		Diagnosis: "Pseudo-obstruction (Ogilvie's Syndrome)",
		Score:     math.Round(pseudoScore/total*100),
		InFavor:   pseudoInFavor,
		Against:   pseudoAgainst,
	})

	return ddx
}

// ——— 3. Complication Screening ———

func ScreenComplications(history models.HistoryData, exam models.ExamData, age int) []models.ComplicationScreen {
	var screens []models.ComplicationScreen

	// Ischaemia
	var ischTriggers []string
	if history.HPIPainCharacter == "constant" || history.HPIPainCharacter == "colicky_then_constant" {
		ischTriggers = append(ischTriggers, "Progression from colicky to constant pain")
	}
	if history.DeniesFever == false && false { // placeholder for actual fever check
	}
	if len(ischTriggers) == 0 {
		ischTriggers = append(ischTriggers, "No ischaemic features detected from history")
	}
	ischSuspicion := "low"
	if len(ischTriggers) >= 2 {
		ischSuspicion = "high"
	} else if len(ischTriggers) == 1 {
		ischSuspicion = "moderate"
	}
	screens = append(screens, models.ComplicationScreen{
		Complication: "Bowel Ischaemia / Gangrene",
		Suspicion:    ischSuspicion,
		Triggers:     ischTriggers,
	})

	// Malignancy
	var malTriggers []string
	if history.HPIWeightLoss {
		malTriggers = append(malTriggers, "Unintentional weight loss")
	}
	if history.HPIBleeding {
		malTriggers = append(malTriggers, "Rectal bleeding")
	}
	if age > 60 {
		malTriggers = append(malTriggers, "Age > 60 years")
	}
	if len(malTriggers) == 0 {
		malTriggers = append(malTriggers, "No malignancy features detected from history")
	}
	malSuspicion := "low"
	if len(malTriggers) >= 2 {
		malSuspicion = "high"
	} else if len(malTriggers) == 1 {
		malSuspicion = "moderate"
	}
	screens = append(screens, models.ComplicationScreen{
		Complication: "Underlying Malignancy",
		Suspicion:    malSuspicion,
		Triggers:     malTriggers,
	})

	// Dehydration
	var dehydTriggers []string
	if history.HPIAssociatedVomiting {
		dehydTriggers = append(dehydTriggers, "Vomiting leading to fluid loss")
	}
	if len(dehydTriggers) == 0 {
		dehydTriggers = append(dehydTriggers, "No dehydration features detected from history")
	}
	dehydSuspicion := "low"
	if len(dehydTriggers) >= 1 {
		dehydSuspicion = "moderate"
	}
	screens = append(screens, models.ComplicationScreen{
		Complication: "AKI / Dehydration",
		Suspicion:    dehydSuspicion,
		Triggers:     dehydTriggers,
	})

	return screens
}

// ——— 4. Red Flag Detector ———

func DetectRedFlags(history models.HistoryData, exam models.ExamData, labs models.LabData) []string {
	var flags []string

	if history.HPIPainCharacter == "constant" || history.HPIPainCharacter == "colicky_then_constant" {
		flags = append(flags, "Pain progression from colicky to constant — consider ischaemia")
	}
	if exam.Peritonism || exam.Guarding || exam.Rigidity {
		flags = append(flags, "Peritoneal signs on examination")
	}
	if labs.Lactate != nil && *labs.Lactate > 2.0 {
		flags = append(flags, fmt.Sprintf("Elevated lactate (%.1f) — consider bowel ischaemia", *labs.Lactate))
	}
	if exam.Vitals.Temperature > 38.0 {
		flags = append(flags, fmt.Sprintf("Fever (%.1f°C) — consider perforation or sepsis", exam.Vitals.Temperature))
	}
	if exam.Vitals.SystolicBP < 90 {
		flags = append(flags, "Hypotension — consider septic or hypovolaemic shock")
	}
	if history.HPIWeightLoss {
		flags = append(flags, "Unintentional weight loss — consider underlying malignancy")
	}
	if history.HPIBleeding {
		flags = append(flags, "Rectal bleeding — exclude colorectal carcinoma")
	}
	if history.HPIPreviousEpisodes {
		flags = append(flags, "Previous similar episodes — recurrent volvulus")
	}

	if len(flags) == 0 {
		flags = append(flags, "No red flags detected from available data")
	}
	return flags
}

// ——— 5. Management Plan ———

func GenerateManagement(input models.LboEngineInput) models.ManagementPlan {
	plan := models.ManagementPlan{}

	if input.PatientStable {
		plan.Admission = "Admit under surgical team for monitoring and resuscitation"
		plan.Conservative = []string{
			"Nil by mouth (NBM)",
			"IV fluids — 0.9% sodium chloride at maintenance + replacement",
			"Nasogastric tube on free drainage",
			"Strict input-output chart",
			"Serial abdominal examinations 4-hourly",
			"Pain control (avoid opioids if possible — may mask peritonism)",
		}
		plan.Surgical = []string{
			"Urgent surgical review if signs of peritonism or deterioration",
			"Prepare for emergency laparotomy if suspected ischaemia/perforation",
		}
	} else {
		plan.Admission = "Emergency admission — resuscitate and prepare for urgent surgery"
		plan.Conservative = []string{
			"Nil by mouth (NBM)",
			"IV fluids — bolus 0.9% sodium chloride 500 ml stat, then maintenance + replacement",
			"Nasogastric tube on free drainage",
			"Broad-spectrum IV antibiotics (e.g. piperacillin-tazobactam)",
			"Strict input-output chart ± urinary catheter",
			"ICU/HDU monitoring if haemodynamically unstable",
		}
		plan.Surgical = []string{
			"Emergency laparotomy — proceed once resuscitated",
			"Consent for possible bowel resection and/or stoma formation",
		}
	}

	return plan
}

// ——— 6. Operative Decision ———

func DecideOperativeApproach(input models.LboEngineInput) *models.OperativeOption {
	if !input.PatientStable || input.Exam.Peritonism || input.Exam.Rigidity {
		op := &models.OperativeOption{
			Procedure:     "Emergency laparotomy, sigmoid colectomy ± end colostomy (Hartmann's procedure)",
			Approach:      "open_laparotomy",
			StomaRequired: true,
			Urgency:       "emergency",
			Indications:   []string{"Peritonism/rigidity", "Haemodynamic instability", "High suspicion of ischaemia"},
		}
		return op
	}

	op := &models.OperativeOption{
		Procedure:       "Sigmoid colectomy with primary anastomosis",
		Approach:        "open_laparotomy",
		StomaRequired:   false,
		Urgency:         "urgent (within 24-48 hours of resuscitation)",
		Indications:     []string{"Confirmed sigmoid volvulus with viable bowel", "Failed non-operative management"},
		Contraindications: []string{"Bowel ischaemia", "Perforation", "Haemodynamic instability"},
	}
	return op
}
