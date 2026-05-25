import { create } from 'zustand';
import { PatientForm, INIT_FORM } from '../types';

interface PatientState {
  form: PatientForm;
  setField: (path: string, value: any) => void;
  toggleArrayItem: (path: string, item: string) => void;
  setForm: (form: PatientForm) => void;
  updateForm: (form: PatientForm) => void;
  reset: () => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  form: INIT_FORM,
  setField: (path, value) =>
    set((state) => {
      const newForm = JSON.parse(JSON.stringify(state.form)) as PatientForm;
      const keys = path.split('.');
      let obj: any = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return { form: newForm };
    }),
  toggleArrayItem: (path, item) =>
    set((state) => {
      const newForm = JSON.parse(JSON.stringify(state.form)) as PatientForm;
      const keys = path.split('.');
      let obj: any = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      const arr: string[] = obj[keys[keys.length - 1]] || [];
      const next = arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item];
      obj[keys[keys.length - 1]] = next;
      return { form: newForm };
    }),
  setForm: (form) => set({ form }),
  updateForm: (form) => set({ form }),
  reset: () => set({ form: INIT_FORM }),
}));
