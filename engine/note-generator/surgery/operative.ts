export { generateOperativeNote } from '@/src/engine/note-generator/surgery/operative';

export interface OperativeInput {
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  procedure: string;
  surgeon: string;
  assistant: string;
  anaesthesia: string;
  findings: string;
  procedureDetails: string;
  bloodLoss: string;
  specimens: string[];
  complications: string[];
  disposition: string;
  templateDisease?: string;
}
