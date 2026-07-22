import { PNEUMONIA_INVESTIGATION_BUNDLES } from './investigationBundles'
import { PNEUMONIA_LAB_PROTOCOLS } from './labProtocols'
import { PNEUMONIA_IMAGING_PROTOCOLS } from './imagingProtocols'
import { PNEUMONIA_MEDICATIONS } from './medications'
import { PNEUMONIA_SUPPORTIVE_CARE } from './supportiveCare'
import { PNEUMONIA_NURSING_PROTOCOLS } from './nursingProtocols'
import { PNEUMONIA_MONITORING } from './monitoringProtocols'
import { PNEUMONIA_INFUSIONS } from './infusions'
import { PNEUMONIA_ISOLATION } from './isolationProtocols'
import { PNEUMONIA_DISEASE_KNOWLEDGE } from './diseaseKnowledge'

import {
  HTN_DISEASE_KNOWLEDGE, HTN_INVESTIGATION_BUNDLES, HTN_MEDICATIONS, HTN_NURSING,
  HTN_MONITORING, HTN_SUPPORTIVE_CARE, HTN_INFUSIONS,
  DIABETES_INVESTIGATION_BUNDLES, DIABETES_MEDICATIONS,
  DIABETES_NURSING, DIABETES_MONITORING, DIABETES_SUPPORTIVE_CARE,
  ASTHMA_INVESTIGATION_BUNDLES, ASTHMA_MEDICATIONS,
  ASTHMA_NURSING, ASTHMA_MONITORING, ASTHMA_SUPPORTIVE_CARE,
  HIV_INVESTIGATION_BUNDLES, HIV_MEDICATIONS,
  HIV_NURSING, HIV_MONITORING, HIV_SUPPORTIVE_CARE,
  SICKLE_CELL_INVESTIGATION_BUNDLES, SICKLE_CELL_MEDICATIONS,
  SICKLE_CELL_NURSING, SICKLE_CELL_MONITORING, SICKLE_CELL_SUPPORTIVE_CARE,
  HEART_DISEASE_INVESTIGATION_BUNDLES,
  HEART_DISEASE_MEDICATIONS, HEART_DISEASE_NURSING, HEART_DISEASE_MONITORING,
  HEART_DISEASE_SUPPORTIVE_CARE,
  COMMON_DISEASE_KNOWLEDGE,
} from './conditionProtocols'
import {
  MALARIA_DISEASE_KNOWLEDGE, MALARIA_INVESTIGATION_BUNDLES, MALARIA_MEDICATIONS,
  MALARIA_NURSING, MALARIA_MONITORING, MALARIA_SUPPORTIVE_CARE, MALARIA_ISOLATION,
  MENINGITIS_INVESTIGATION_BUNDLES, MENINGITIS_MEDICATIONS,
  MENINGITIS_NURSING, MENINGITIS_MONITORING, MENINGITIS_SUPPORTIVE_CARE, MENINGITIS_ISOLATION,
  MENINGITIS_DISEASE_KNOWLEDGE,
  UTI_INVESTIGATION_BUNDLES, UTI_MEDICATIONS,
  UTI_NURSING, UTI_MONITORING, UTI_SUPPORTIVE_CARE, UTI_DISEASE_KNOWLEDGE,
  GASTROENTERITIS_INVESTIGATION_BUNDLES, GASTROENTERITIS_MEDICATIONS,
  GASTROENTERITIS_NURSING, GASTROENTERITIS_MONITORING, GASTROENTERITIS_SUPPORTIVE_CARE, GASTROENTERITIS_ISOLATION,
  GASTROENTERITIS_DISEASE_KNOWLEDGE,
  COPD_INVESTIGATION_BUNDLES, COPD_MEDICATIONS,
  COPD_NURSING, COPD_MONITORING, COPD_SUPPORTIVE_CARE,
  CKD_INVESTIGATION_BUNDLES, CKD_MEDICATIONS,
  CKD_NURSING, CKD_MONITORING, CKD_SUPPORTIVE_CARE,
  SEPSIS_DISEASE_KNOWLEDGE, SEPSIS_INVESTIGATION_BUNDLES, SEPSIS_MEDICATIONS,
  SEPSIS_NURSING, SEPSIS_MONITORING, SEPSIS_SUPPORTIVE_CARE, SEPSIS_ISOLATION,
  BRONCHITIS_INVESTIGATION_BUNDLES, BRONCHITIS_MEDICATIONS,
  BRONCHITIS_NURSING, BRONCHITIS_MONITORING, BRONCHITIS_SUPPORTIVE_CARE,
  DENGUE_INVESTIGATION_BUNDLES, DENGUE_MEDICATIONS,
  DENGUE_NURSING, DENGUE_MONITORING, DENGUE_SUPPORTIVE_CARE, DENGUE_ISOLATION,
  MIGRAINE_INVESTIGATION_BUNDLES, MIGRAINE_MEDICATIONS,
  MIGRAINE_NURSING, MIGRAINE_MONITORING, MIGRAINE_SUPPORTIVE_CARE,
  PERTUSSIS_INVESTIGATION_BUNDLES, PERTUSSIS_MEDICATIONS,
  PERTUSSIS_NURSING, PERTUSSIS_MONITORING, PERTUSSIS_SUPPORTIVE_CARE, PERTUSSIS_ISOLATION,
} from './acuteConditionProtocols'

export {
  PNEUMONIA_INVESTIGATION_BUNDLES,
  PNEUMONIA_LAB_PROTOCOLS,
  PNEUMONIA_IMAGING_PROTOCOLS,
  PNEUMONIA_MEDICATIONS,
  PNEUMONIA_SUPPORTIVE_CARE,
  PNEUMONIA_NURSING_PROTOCOLS,
  PNEUMONIA_MONITORING,
  PNEUMONIA_INFUSIONS,
  PNEUMONIA_ISOLATION,
  PNEUMONIA_DISEASE_KNOWLEDGE,
  COMMON_DISEASE_KNOWLEDGE,
  HTN_MONITORING, HTN_SUPPORTIVE_CARE, HTN_INFUSIONS,
  DIABETES_NURSING, DIABETES_MONITORING, DIABETES_SUPPORTIVE_CARE,
  ASTHMA_NURSING, ASTHMA_MONITORING, ASTHMA_SUPPORTIVE_CARE,
  HIV_NURSING, HIV_MONITORING, HIV_SUPPORTIVE_CARE,
  SICKLE_CELL_NURSING, SICKLE_CELL_MONITORING, SICKLE_CELL_SUPPORTIVE_CARE,
  HEART_DISEASE_MEDICATIONS, HEART_DISEASE_NURSING, HEART_DISEASE_MONITORING,
  HEART_DISEASE_SUPPORTIVE_CARE,
  MALARIA_DISEASE_KNOWLEDGE, MALARIA_INVESTIGATION_BUNDLES, MALARIA_MEDICATIONS,
  MALARIA_NURSING, MALARIA_MONITORING, MALARIA_SUPPORTIVE_CARE, MALARIA_ISOLATION,
  MENINGITIS_INVESTIGATION_BUNDLES, MENINGITIS_MEDICATIONS,
  MENINGITIS_NURSING, MENINGITIS_MONITORING, MENINGITIS_SUPPORTIVE_CARE, MENINGITIS_ISOLATION,
  UTI_INVESTIGATION_BUNDLES, UTI_MEDICATIONS,
  UTI_NURSING, UTI_MONITORING, UTI_SUPPORTIVE_CARE,
  GASTROENTERITIS_INVESTIGATION_BUNDLES, GASTROENTERITIS_MEDICATIONS,
  GASTROENTERITIS_NURSING, GASTROENTERITIS_MONITORING, GASTROENTERITIS_SUPPORTIVE_CARE, GASTROENTERITIS_ISOLATION,
  COPD_INVESTIGATION_BUNDLES, COPD_MEDICATIONS,
  COPD_NURSING, COPD_MONITORING, COPD_SUPPORTIVE_CARE,
  CKD_INVESTIGATION_BUNDLES, CKD_MEDICATIONS,
  CKD_NURSING, CKD_MONITORING, CKD_SUPPORTIVE_CARE,
  MENINGITIS_DISEASE_KNOWLEDGE, UTI_DISEASE_KNOWLEDGE,
  GASTROENTERITIS_DISEASE_KNOWLEDGE,
  SEPSIS_DISEASE_KNOWLEDGE, SEPSIS_INVESTIGATION_BUNDLES, SEPSIS_MEDICATIONS,
  SEPSIS_NURSING, SEPSIS_MONITORING, SEPSIS_SUPPORTIVE_CARE, SEPSIS_ISOLATION,
  BRONCHITIS_INVESTIGATION_BUNDLES, BRONCHITIS_MEDICATIONS,
  BRONCHITIS_NURSING, BRONCHITIS_MONITORING, BRONCHITIS_SUPPORTIVE_CARE,
  DENGUE_INVESTIGATION_BUNDLES, DENGUE_MEDICATIONS,
  DENGUE_NURSING, DENGUE_MONITORING, DENGUE_SUPPORTIVE_CARE, DENGUE_ISOLATION,
  MIGRAINE_INVESTIGATION_BUNDLES, MIGRAINE_MEDICATIONS,
  MIGRAINE_NURSING, MIGRAINE_MONITORING, MIGRAINE_SUPPORTIVE_CARE,
  PERTUSSIS_INVESTIGATION_BUNDLES, PERTUSSIS_MEDICATIONS,
  PERTUSSIS_NURSING, PERTUSSIS_MONITORING, PERTUSSIS_SUPPORTIVE_CARE, PERTUSSIS_ISOLATION,
}

export function getPneumoniaProtocols() {
  return {
    investigationBundles: PNEUMONIA_INVESTIGATION_BUNDLES,
    labProtocols: PNEUMONIA_LAB_PROTOCOLS,
    imagingProtocols: PNEUMONIA_IMAGING_PROTOCOLS,
    medications: PNEUMONIA_MEDICATIONS,
    supportiveCare: PNEUMONIA_SUPPORTIVE_CARE,
    nursing: PNEUMONIA_NURSING_PROTOCOLS,
    monitoring: PNEUMONIA_MONITORING,
    infusions: PNEUMONIA_INFUSIONS,
    isolation: PNEUMONIA_ISOLATION,
    diseaseKnowledge: PNEUMONIA_DISEASE_KNOWLEDGE,
  }
}

export function getCommonConditionProtocols(conditionId: string) {
  const map: Record<string, any> = {
    hypertension: {
      investigationBundles: HTN_INVESTIGATION_BUNDLES,
      medications: HTN_MEDICATIONS,
      nursing: HTN_NURSING,
      imagingProtocols: [],
      monitoring: HTN_MONITORING,
      supportiveCare: HTN_SUPPORTIVE_CARE,
      infusions: HTN_INFUSIONS,
      isolation: [],
      diseaseKnowledge: HTN_DISEASE_KNOWLEDGE,
      labProtocols: [],
    },
    diabetes: {
      investigationBundles: DIABETES_INVESTIGATION_BUNDLES,
      medications: DIABETES_MEDICATIONS,
      nursing: DIABETES_NURSING,
      imagingProtocols: [],
      monitoring: DIABETES_MONITORING,
      supportiveCare: DIABETES_SUPPORTIVE_CARE,
      infusions: [],
      isolation: [],
      diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'diabetes'),
      labProtocols: [],
    },
    asthma: {
      investigationBundles: ASTHMA_INVESTIGATION_BUNDLES,
      medications: ASTHMA_MEDICATIONS,
      nursing: ASTHMA_NURSING,
      imagingProtocols: [],
      monitoring: ASTHMA_MONITORING,
      supportiveCare: ASTHMA_SUPPORTIVE_CARE,
      infusions: [],
      isolation: [],
      diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'asthma'),
      labProtocols: [],
    },
    hiv: {
      investigationBundles: HIV_INVESTIGATION_BUNDLES,
      medications: HIV_MEDICATIONS,
      nursing: HIV_NURSING,
      imagingProtocols: [],
      monitoring: HIV_MONITORING,
      supportiveCare: HIV_SUPPORTIVE_CARE,
      infusions: [],
      isolation: [],
      diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'hiv'),
      labProtocols: [],
    },
    sickle_cell: {
      investigationBundles: SICKLE_CELL_INVESTIGATION_BUNDLES,
      medications: SICKLE_CELL_MEDICATIONS,
      nursing: SICKLE_CELL_NURSING,
      imagingProtocols: [],
      monitoring: SICKLE_CELL_MONITORING,
      supportiveCare: SICKLE_CELL_SUPPORTIVE_CARE,
      infusions: [],
      isolation: [],
      diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'sickle_cell'),
      labProtocols: [],
    },
    heart_disease: {
      investigationBundles: HEART_DISEASE_INVESTIGATION_BUNDLES,
      medications: HEART_DISEASE_MEDICATIONS,
      nursing: HEART_DISEASE_NURSING,
      imagingProtocols: [],
      monitoring: HEART_DISEASE_MONITORING,
      supportiveCare: HEART_DISEASE_SUPPORTIVE_CARE,
      infusions: [],
      isolation: [],
      diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'heart_disease'),
      labProtocols: [],
    },
    copd: {
      investigationBundles: COPD_INVESTIGATION_BUNDLES,
      medications: COPD_MEDICATIONS,
      nursing: COPD_NURSING,
      imagingProtocols: [],
      monitoring: COPD_MONITORING,
      supportiveCare: COPD_SUPPORTIVE_CARE,
      infusions: [],
      isolation: [],
      diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'copd'),
      labProtocols: [],
    },
    ckd: {
      investigationBundles: CKD_INVESTIGATION_BUNDLES,
      medications: CKD_MEDICATIONS,
      nursing: CKD_NURSING,
      imagingProtocols: [],
      monitoring: CKD_MONITORING,
      supportiveCare: CKD_SUPPORTIVE_CARE,
      infusions: [],
      isolation: [],
      diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'ckd'),
      labProtocols: [],
    },
  }
  return map[conditionId as string] || null
}

function getMalariaProtocols() {
  return {
    investigationBundles: MALARIA_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: MALARIA_MEDICATIONS,
    supportiveCare: MALARIA_SUPPORTIVE_CARE,
    nursing: MALARIA_NURSING,
    monitoring: MALARIA_MONITORING,
    infusions: [],
    isolation: MALARIA_ISOLATION,
    diseaseKnowledge: MALARIA_DISEASE_KNOWLEDGE,
  }
}

function getMeningitisProtocols() {
  return {
    investigationBundles: MENINGITIS_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: MENINGITIS_MEDICATIONS,
    supportiveCare: MENINGITIS_SUPPORTIVE_CARE,
    nursing: MENINGITIS_NURSING,
    monitoring: MENINGITIS_MONITORING,
    infusions: [],
    isolation: MENINGITIS_ISOLATION,
    diseaseKnowledge: MENINGITIS_DISEASE_KNOWLEDGE,
  }
}

function getUTIProtocols() {
  return {
    investigationBundles: UTI_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: UTI_MEDICATIONS,
    supportiveCare: UTI_SUPPORTIVE_CARE,
    nursing: UTI_NURSING,
    monitoring: UTI_MONITORING,
    infusions: [],
    isolation: [],
    diseaseKnowledge: UTI_DISEASE_KNOWLEDGE,
  }
}

function getGastroenteritisProtocols() {
  return {
    investigationBundles: GASTROENTERITIS_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: GASTROENTERITIS_MEDICATIONS,
    supportiveCare: GASTROENTERITIS_SUPPORTIVE_CARE,
    nursing: GASTROENTERITIS_NURSING,
    monitoring: GASTROENTERITIS_MONITORING,
    infusions: [],
    isolation: GASTROENTERITIS_ISOLATION,
    diseaseKnowledge: GASTROENTERITIS_DISEASE_KNOWLEDGE,
  }
}

function getCOPDProtocols() {
  return {
    investigationBundles: COPD_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: COPD_MEDICATIONS,
    supportiveCare: COPD_SUPPORTIVE_CARE,
    nursing: COPD_NURSING,
    monitoring: COPD_MONITORING,
    infusions: [],
    isolation: [],
    diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'copd'),
  }
}

function getCKDProtocols() {
  return {
    investigationBundles: CKD_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: CKD_MEDICATIONS,
    supportiveCare: CKD_SUPPORTIVE_CARE,
    nursing: CKD_NURSING,
    monitoring: CKD_MONITORING,
    infusions: [],
    isolation: [],
    diseaseKnowledge: COMMON_DISEASE_KNOWLEDGE.filter(d => d.id === 'ckd'),
  }
}

function getSepsisProtocols() {
  return {
    investigationBundles: SEPSIS_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: SEPSIS_MEDICATIONS,
    supportiveCare: SEPSIS_SUPPORTIVE_CARE,
    nursing: SEPSIS_NURSING,
    monitoring: SEPSIS_MONITORING,
    infusions: [],
    isolation: SEPSIS_ISOLATION,
    diseaseKnowledge: SEPSIS_DISEASE_KNOWLEDGE,
  }
}

function getBronchitisProtocols() {
  return {
    investigationBundles: BRONCHITIS_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: BRONCHITIS_MEDICATIONS,
    supportiveCare: BRONCHITIS_SUPPORTIVE_CARE,
    nursing: BRONCHITIS_NURSING,
    monitoring: BRONCHITIS_MONITORING,
    infusions: [],
    isolation: [],
    diseaseKnowledge: [],
  }
}

function getDengueProtocols() {
  return {
    investigationBundles: DENGUE_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: DENGUE_MEDICATIONS,
    supportiveCare: DENGUE_SUPPORTIVE_CARE,
    nursing: DENGUE_NURSING,
    monitoring: DENGUE_MONITORING,
    infusions: [],
    isolation: DENGUE_ISOLATION,
    diseaseKnowledge: [],
  }
}

function getMigraineProtocols() {
  return {
    investigationBundles: MIGRAINE_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: MIGRAINE_MEDICATIONS,
    supportiveCare: MIGRAINE_SUPPORTIVE_CARE,
    nursing: MIGRAINE_NURSING,
    monitoring: MIGRAINE_MONITORING,
    infusions: [],
    isolation: [],
    diseaseKnowledge: [],
  }
}

function getPertussisProtocols() {
  return {
    investigationBundles: PERTUSSIS_INVESTIGATION_BUNDLES,
    labProtocols: [],
    imagingProtocols: [],
    medications: PERTUSSIS_MEDICATIONS,
    supportiveCare: PERTUSSIS_SUPPORTIVE_CARE,
    nursing: PERTUSSIS_NURSING,
    monitoring: PERTUSSIS_MONITORING,
    infusions: [],
    isolation: PERTUSSIS_ISOLATION,
    diseaseKnowledge: [],
  }
}

type ProtocolGetter = () => ReturnType<typeof getPneumoniaProtocols>

const protocolRegistry: Record<string, ProtocolGetter | (() => ReturnType<typeof getCommonConditionProtocols>)> = {
  community_acquired_pneumonia: getPneumoniaProtocols,
  aspiration_pneumonia: getPneumoniaProtocols,
  hospital_acquired_pneumonia: getPneumoniaProtocols,
  covid_pneumonia: getPneumoniaProtocols,
  tuberculosis: getPneumoniaProtocols,
  malaria: getMalariaProtocols,
  meningitis: getMeningitisProtocols,
  uti: getUTIProtocols,
  gastroenteritis: getGastroenteritisProtocols,
  copd: getCOPDProtocols,
  ckd: getCKDProtocols,
  sepsis: getSepsisProtocols,
  septic_shock: getSepsisProtocols,
  bronchitis: getBronchitisProtocols,
  acute_bronchitis: getBronchitisProtocols,
  dengue: getDengueProtocols,
  dengue_fever: getDengueProtocols,
  dengue_hemorrhagic: getDengueProtocols,
  migraine: getMigraineProtocols,
  headache: getMigraineProtocols,
  pertussis: getPertussisProtocols,
  whooping_cough: getPertussisProtocols,
}

export function getProtocolsByDiseaseId(diseaseId: string) {
  const getter = protocolRegistry[diseaseId]
  if (!getter) {
    const condition = getCommonConditionProtocols(diseaseId)
    if (condition) return condition
    return null
  }
  return getter()
}

export function registerDiseaseProtocols(diseaseId: string, getter: ProtocolGetter) {
  protocolRegistry[diseaseId] = getter
}
