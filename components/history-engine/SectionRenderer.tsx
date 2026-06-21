'use client';
import type { PatientProfile } from '@/lib/history-engine/types';
import BiodataSection from './BiodataSection';
import ChiefComplaintSection from './ChiefComplaintSection';
import AmexanHpiSection from './AmexanHpiSection';
import PastHistorySection from './PastHistorySection';
import FamilySocialSection from './FamilySocialSection';
import RosSection from './RosSection';
import ImpactSection from './ImpactSection';
import SummaryPanel from './SummaryPanel';
import BirthHistorySection from './BirthHistorySection';
import ImmunizationSection from './ImmunizationSection';
import GrowthDevelopmentSection from './GrowthDevelopmentSection';
import NutritionSection from './NutritionSection';
import ObstetricHistorySection from './ObstetricHistorySection';
import GynecologyHistorySection from './GynecologyHistorySection';
import GeneralExaminationSection from './GeneralExaminationSection';
import SystemicExaminationSection from './SystemicExaminationSection';
import LocalExaminationSection from './LocalExaminationSection';
import ClinicalReasoningSection from './ClinicalReasoningSection';
import NewbornExaminationSection from './NewbornExaminationSection';
import ObstetricExaminationSection from './ObstetricExaminationSection';
import InvestigationInterpretationSection from './InvestigationInterpretationSection';
import MonitoringSection from './MonitoringSection';

interface Props {
  sectionId: string;
  profile: PatientProfile;
}

export function SectionRenderer({ sectionId, profile }: Props) {
  switch (sectionId) {
    case 'biodata':
      return <BiodataSection />;
    case 'chief_complaints':
      return <ChiefComplaintSection />;
    case 'hpi':
      return <AmexanHpiSection />;
    case 'past_history':
      return <PastHistorySection />;
    case 'family_social':
      return <FamilySocialSection />;
    case 'ros':
      return <RosSection />;
    case 'impact':
      return <ImpactSection />;
    case 'history_summary':
    case 'summary':
      return <SummaryPanel />;

    case 'birth_history':
      return <BirthHistorySection />;
    case 'immunization':
      return <ImmunizationSection />;
    case 'growth_dev':
      return <GrowthDevelopmentSection />;
    case 'nutrition':
      return <NutritionSection />;
    case 'newborn_feeding':
      return <NutritionSection />;
    case 'obstetric_history':
      return <ObstetricHistorySection />;
    case 'gynecology_history':
      return <GynecologyHistorySection />;

    case 'general_exam':
      return <GeneralExaminationSection />;
    case 'systemic_exam':
      return <SystemicExaminationSection />;
    case 'newborn_exam':
      return <NewbornExaminationSection />;
    case 'obstetric_exam':
      return <ObstetricExaminationSection />;
    case 'local_exam':
      return <LocalExaminationSection />;

    case 'clinical_reasoning':
    case 'diagnosis':
    case 'differentials':
      return <ClinicalReasoningSection />;

    case 'investigations':
    case 'interpretation':
      return <InvestigationInterpretationSection />;

    case 'treatment':
    case 'monitoring':
      return <MonitoringSection />;

    default:
      return <ClinicalReasoningSection />;
  }
}
