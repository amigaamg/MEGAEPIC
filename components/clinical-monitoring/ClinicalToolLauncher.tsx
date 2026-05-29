'use client';

import React from 'react';
import { getToolDef } from '../clinical-tools/types';
import BPTrendChartTool from '../clinical-tools/BP Trend Chart';
import CVRiskFramingham from '../clinical-tools/CV Risk Framingham';
import CHA2DS2VASc from '../clinical-tools/CHA2DS2-VASc';
import AntihypertensiveProtocol from '../clinical-tools/Antihypertensive Protocol';
import BPTargetAchievement from '../clinical-tools/BP Target Achievement';
import MedicationAdherenceTool from '../clinical-tools/Medication Adherence';
import RenalFunctionPanel from '../clinical-tools/Renal Function Panel';
import ECGEchoRequest from '../clinical-tools/ECG Echo Request';
import HomeBPGuide from '../clinical-tools/Home BP Guide';
import HTNSeverityStaging from '../clinical-tools/HTN Severity Staging';
import HbA1cTrendTool from '../clinical-tools/HbA1c Trend';
import GlucoseLogTool from '../clinical-tools/Glucose Log';
import InsulinDoseTracker from '../clinical-tools/Insulin Dose Tracker';
import FootExaminationTool from '../clinical-tools/Foot Examination Score';
import RetinopathyStatus from '../clinical-tools/Retinopathy Status';

interface Props {
  toolId: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  onClose?: () => void;
}

export default function ClinicalToolLauncher({ toolId, patientId, patientName, onClose }: Props) {
  const def = getToolDef(toolId);
  if (!def) return <div style={{ padding: 24, textAlign: 'center', color: '#8fa3bd' }}>Tool not found: {toolId}</div>;

  const commonProps = { patientId, patientName, onClose };

  switch (toolId) {
    case 'bp_trend': return <BPTrendChartTool {...commonProps} />;
    case 'cv_risk_framingham': return <CVRiskFramingham {...commonProps} />;
    case 'cha2ds2_vasc': return <CHA2DS2VASc {...commonProps} />;
    case 'antihypertensive_protocol': return <AntihypertensiveProtocol {...commonProps} />;
    case 'bp_target': return <BPTargetAchievement {...commonProps} />;
    case 'med_adherence': return <MedicationAdherenceTool {...commonProps} />;
    case 'renal_panel': return <RenalFunctionPanel {...commonProps} />;
    case 'ecg_echo': return <ECGEchoRequest {...commonProps} />;
    case 'home_bp_guide': return <HomeBPGuide {...commonProps} />;
    case 'htn_staging': return <HTNSeverityStaging {...commonProps} />;
    case 'hba1c_trend': return <HbA1cTrendTool {...commonProps} />;
    case 'glucose_log': return <GlucoseLogTool {...commonProps} />;
    case 'insulin_dose': return <InsulinDoseTracker {...commonProps} />;
    case 'foot_exam': return <FootExaminationTool {...commonProps} />;
    case 'retinopathy': return <RetinopathyStatus {...commonProps} />;
    default: return <div style={{ padding: 24, textAlign: 'center', color: '#8fa3bd' }}>Tool component not implemented: {toolId}</div>;
  }
}
