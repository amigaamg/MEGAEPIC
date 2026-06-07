package models

// ——— Patient Data ———

type RegistrationData struct {
	Age              int    `json:"age"`
	Sex              string `json:"sex"`
	PatientName      string `json:"patientName"`
	MRN              string `json:"mrn"`
	EncounterDate    string `json:"encounterDate"`
	EncounterType    string `json:"encounterType"`
	ReferringFacility string `json:"referringFacility"`
	Consultant       string `json:"consultant"`
	Ward             string `json:"ward"`
	Bed              string `json:"bed"`
}

type VitalsData struct {
	HeartRate      int     `json:"heartRate"`
	SystolicBP     int     `json:"systolicBP"`
	DiastolicBP    int     `json:"diastolicBP"`
	Temperature    float64 `json:"temperature"`
	RespiratoryRate int    `json:"respiratoryRate"`
	SpO2           int     `json:"spO2"`
	GCS            int     `json:"gcs"`
}

type ExamData struct {
	Vitals             VitalsData `json:"vitals"`
	DistensionSeverity string     `json:"distensionSeverity"`
	Peritonism         bool       `json:"peritonism"`
	Guarding           bool       `json:"guarding"`
	Rigidity           bool       `json:"rigidity"`
	AbdominalMass      bool       `json:"abdominalMass"`
	BowelSounds        string     `json:"bowelSounds"`
	Tenderness         string     `json:"abdominalTenderness"`
}

type LabData struct {
	WBC        *float64 `json:"wbc,omitempty"`
	Lactate    *float64 `json:"lactate,omitempty"`
	CRP        *float64 `json:"crp,omitempty"`
	Creatinine *float64 `json:"creatinine,omitempty"`
	Sodium     *float64 `json:"sodium,omitempty"`
	Potassium  *float64 `json:"potassium,omitempty"`
}

type ImagingData struct {
	CoffeeBeanSign    bool    `json:"coffeeBeanSign"`
	BentInnerTubeSign bool    `json:"bentInnerTubeSign"`
	FreeAir           bool    `json:"freeAir"`
	ColonicDilationCm float64 `json:"colonicDilationCm"`
	AirFluidLevels    bool    `json:"airFluidLevels"`

	TransitionPoint  bool   `json:"ctTransitionPoint"`
	TransitionLevel  string `json:"ctTransitionLevel"`
	MesentericSwirl  bool   `json:"ctMesentericSwirl"`
	BirdBeakSign     bool   `json:"ctBirdBeakSign"`
	AppleCoreLesion  bool   `json:"ctAppleCoreLesion"`
	ColonicWallThick bool   `json:"ctColonicWallThickening"`
	Pneumatosis      bool   `json:"ctPneumatosis"`
	PortalVenousGas  bool   `json:"ctPortalVenousGas"`
	FreeFluid        bool   `json:"ctFreeFluid"`
	FreeAirCT        bool   `json:"ctFreeAir"`
	TargetLesion     bool   `json:"ctTargetLesion"`
}

type SymptomStream struct {
	Type          string `json:"type"`
	Label         string `json:"label"`
	Present       bool   `json:"present"`
	Denied        bool   `json:"denied,omitempty"`
	OnsetDay      int    `json:"onset_day"`
	Role          string `json:"role"`
	OnsetSpeed    string `json:"onset_speed,omitempty"`
	Character     string `json:"character,omitempty"`
	Location      string `json:"location,omitempty"`
	Radiation     string `json:"radiation,omitempty"`
	Progression   string `json:"progression,omitempty"`
	Severity      int    `json:"severity,omitempty"`
	Frequency     string `json:"frequency,omitempty"`
	Content       string `json:"content,omitempty"`
	LastBowelDays int    `json:"lastBowelDays,omitempty"`
	FlatusStatus  string `json:"flatusStatus,omitempty"`
}

type HistoryData struct {
	SymptomStreams      []SymptomStream `json:"symptomStreams,omitempty"`
	PresentingComplaint string          `json:"presentingComplaint"`
	ComplaintDuration   string          `json:"complaintDuration"`
	ContextAtOnset      string          `json:"contextAtOnset"`
	FirstSensation      string          `json:"firstSensation"`
	FunctionalImpact    string          `json:"functionalImpact"`
	EatingImpact        string          `json:"eatingImpact"`
	SleepImpact         string          `json:"sleepImpact"`
	WorkCapacity        string          `json:"workCapacity"`

	HPIPainCharacter string `json:"hpiPainCharacter"`
	HPIPainLocation  string `json:"hpiPainLocation"`
	HPIPainRadiation string `json:"hpiPainRadiation"`
	HPIAssociatedVomiting bool `json:"hpiAssociatedVomiting"`
	HPIVomitingFrequency  string `json:"hpiVomitingFrequency"`
	HPIVomitContent       string `json:"hpiVomitContent"`
	HPIFlatusStatus       string `json:"hpiFlatusStatus"`
	HPIBowelStatus        string `json:"hpiBowelStatus"`
	HPILastBowelDays      int    `json:"hpiLastBowelDays"`
	HPIWeightLoss         bool   `json:"hpiWeightLoss"`
	HPIWeightLossAmount   string `json:"hpiWeightLossAmount"`
	HPIBleeding           bool   `json:"hpiBleeding"`
	HPIBleedingType       string `json:"hpiBleedingType"`
	HPIPreviousEpisodes   bool   `json:"hpiPreviousEpisodes"`

	DeniesNausea           bool `json:"deniesNausea"`
	DeniesVomiting         bool `json:"deniesVomiting"`
	DeniesFever            bool `json:"deniesFever"`
	DeniesWeightLoss       bool `json:"deniesWeightLoss"`
	DeniesRectalBleeding   bool `json:"deniesRectalBleeding"`
	DeniesPreviousEpisodes bool `json:"deniesPreviousEpisodes"`
	DeniesChronicConstip   bool `json:"deniesChronicConstipation"`
	DeniesFamilyHistoryCRC bool `json:"deniesFamilyHistoryCRC"`
	DeniesAbdominalSurgery bool `json:"deniesAbdominalSurgery"`
}

// ——— Engine Input ———

type LboEngineInput struct {
	Age          int           `json:"age"`
	Comorbidities []string      `json:"comorbidities"`
	PatientStable bool          `json:"patientStable"`
	Vitals       VitalsData     `json:"vitals"`
	Labs         LabData        `json:"labs"`
	Exam         ExamData       `json:"exam"`
	AXRFindings  ImagingData    `json:"axrFindings"`
	CTFindings   ImagingData    `json:"ctFindings"`
	History      HistoryData    `json:"history"`
}

// ——— Output Types ———

type DdxEntry struct {
	Diagnosis string  `json:"diagnosis"`
	Score     float64 `json:"score"`
	InFavor   []string `json:"inFavor"`
	Against   []string `json:"against"`
}

type ComplicationScreen struct {
	Complication string `json:"complication"`
	Suspicion    string `json:"suspicion"`
	Triggers     []string `json:"triggerFindings"`
}

type OperativeOption struct {
	Procedure       string   `json:"procedure"`
	Approach        string   `json:"approach"`
	StomaRequired   bool     `json:"stomaRequired"`
	Urgency         string   `json:"urgency"`
	Indications     []string `json:"indications"`
	Contraindications []string `json:"contraindications"`
}

type ManagementPlan struct {
	Admission   string   `json:"admission"`
	Conservative []string `json:"conservative"`
	Surgical     []string `json:"surgical"`
}

type LboEngineOutput struct {
	Ddx                []DdxEntry          `json:"ddx"`
	ComplicationScreen []ComplicationScreen `json:"complicationScreening"`
	RedFlags           []string            `json:"redFlags"`
	ManagementPlan     ManagementPlan      `json:"managementPlan"`
	OperativeDecision  *OperativeOption    `json:"operativeDecision,omitempty"`
	Narrative          string              `json:"narrative"`
}
