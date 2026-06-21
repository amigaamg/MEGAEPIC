import type { DiseaseNode } from '../../diseaseNode';
import { SURGICAL_NODES } from './surgical';
import { HEPATOBILIARY_NODES } from './hepatobiliary';
import { MEDICAL_GI_NODES } from './medicalGI';
import { GYNAECOLOGICAL_NODES } from './gynaecological';
import { UROLOGICAL_NODES } from './urological';
import { VASCULAR_CARDIAC_NODES } from './vascularCardiac';
import { METABOLIC_INFECTIOUS_NODES } from './metabolic';
import { OTHER_NODES } from './other';
import { REMAINING_NODES } from './remaining';
import { VOMITING_NODES } from './vomitingNodes';
import { MISSING2_NODES } from './missing2';
import { MISSING3_NODES } from './missing3';
import { DISTENSION_NODES } from './distensionNodes';
import { DIARRHOEA_NODES } from './diarrhoeaNodes';
import { CONSTIPATION_NODES } from './constipationNodes';
import { DYSPHAGIA_NODES } from './dysphagiaNodes';
import { GI_BLEEDING_NODES } from './giBleedingNodes';

export const EXTENDED_DISEASE_NODES: DiseaseNode[] = [
  ...SURGICAL_NODES,
  ...HEPATOBILIARY_NODES,
  ...MEDICAL_GI_NODES,
  ...GYNAECOLOGICAL_NODES,
  ...UROLOGICAL_NODES,
  ...VASCULAR_CARDIAC_NODES,
  ...METABOLIC_INFECTIOUS_NODES,
  ...OTHER_NODES,
  ...REMAINING_NODES,
  ...VOMITING_NODES,
  ...MISSING2_NODES,
  ...MISSING3_NODES,
  ...DISTENSION_NODES,
  ...DIARRHOEA_NODES,
  ...CONSTIPATION_NODES,
  ...DYSPHAGIA_NODES,
  ...GI_BLEEDING_NODES,
];

export const EXTENDED_DISEASE_MAP = new Map(EXTENDED_DISEASE_NODES.map(d => [d.id, d]));
