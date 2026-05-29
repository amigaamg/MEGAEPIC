import * as surgery from './surgery';
import * as pediatrics from './pediatrics';
import * as cardiology from './cardiology';
import * as obstetrics from './obstetrics';
import * as psychiatry from './psychiatry';

export interface SpecialtyTemplate {
  id: string;
  name: string;
  getTemplate: () => Record<string, Function>;
}

export const SPECIALTY_TEMPLATES: SpecialtyTemplate[] = [
  { id: 'surgery', name: 'Surgery', getTemplate: surgery.getSurgicalTemplate },
  { id: 'pediatrics', name: 'Pediatrics', getTemplate: pediatrics.getPediatricTemplate },
  { id: 'cardiology', name: 'Cardiology', getTemplate: cardiology.getCardiologyTemplate },
  { id: 'obstetrics', name: 'Obstetrics', getTemplate: obstetrics.getObstetricTemplate },
  { id: 'psychiatry', name: 'Psychiatry', getTemplate: psychiatry.getPsychiatricTemplate },
];

export function getTemplateBySpecialty(specialtyId: string): Record<string, Function> | undefined {
  const entry = SPECIALTY_TEMPLATES.find(t => t.id === specialtyId);
  return entry?.getTemplate();
}
