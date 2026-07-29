import { create } from 'zustand';
import { ActorId, JourneyId } from '@/lib/amexan/constitution/books/book-II-experience';
import { routeExperience, ExperienceRequest, ExperienceOutput } from '@/lib/amexan/presentation/experience-engine';
import type { PresentationOutput } from '@/lib/amexan/presentation/presentation-engine';
import { buildThemeContext, getBrand, type ThemeContext } from '@/lib/amexan/presentation/theme-engine';
import { getDeviceInfo } from '@/lib/amexan/presentation/device-constitution';

export interface PresentationStore {
  actorId: ActorId;
  journeyId: JourneyId;
  phaseId: string;
  patientId: string;
  encounterId: string;
  facilityName: string;
  completionMap: Record<string, number>;
  alerts: Array<{ id: string; type: 'info' | 'warning' | 'critical' | 'success'; message: string }>;
  clinicalSummary: Record<string, unknown>;

  presentation: PresentationOutput | null;
  theme: ThemeContext | null;
  experience: ExperienceOutput | null;
  loading: boolean;
  error: string | null;

  setActor: (actorId: ActorId) => void;
  setPatient: (patientId: string) => void;
  setEncounter: (encounterId: string) => void;
  setJourney: (journeyId: JourneyId) => void;
  setPhase: (phaseId: string) => void;
  updateCompletion: (phaseId: string, value: number) => void;
  addAlert: (alert: { id: string; type: 'info' | 'warning' | 'critical' | 'success'; message: string }) => void;
  dismissAlert: (id: string) => void;
  setClinicalSummary: (summary: Record<string, unknown>) => void;

  navigateToPhase: (phaseId: string) => void;
  refreshScreen: () => void;
  initializeFromRequest: (req: Partial<ExperienceRequest> & { actorId: ActorId; patientId: string }) => void;
}

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  actorId: 'doctor' as ActorId,
  journeyId: 'clinical_care' as JourneyId,
  phaseId: 'registration',
  patientId: '',
  encounterId: '',
  facilityName: 'Healthcare Facility',
  completionMap: {},
  alerts: [],
  clinicalSummary: {},
  presentation: null,
  theme: null,
  experience: null,
  loading: false,
  error: null,

  setActor: (actorId) => {
    set({ actorId });
    get().refreshScreen();
  },

  setPatient: (patientId) => {
    set({ patientId });
    get().refreshScreen();
  },

  setEncounter: (encounterId) => {
    set({ encounterId });
    get().refreshScreen();
  },

  setJourney: (journeyId) => {
    set({ journeyId, phaseId: '' });
    get().refreshScreen();
  },

  setPhase: (phaseId) => {
    set({ phaseId });
    get().refreshScreen();
  },

  updateCompletion: (phaseId, value) => {
    set((s) => ({
      completionMap: { ...s.completionMap, [phaseId]: value },
    }));
    get().refreshScreen();
  },

  addAlert: (alert) => {
    set((s) => ({ alerts: [...s.alerts, alert] }));
    get().refreshScreen();
  },

  dismissAlert: (id) => {
    set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) }));
    get().refreshScreen();
  },

  setClinicalSummary: (summary) => {
    set({ clinicalSummary: summary });
    get().refreshScreen();
  },

  navigateToPhase: (phaseId) => {
    set({ phaseId });
    get().refreshScreen();
  },

  refreshScreen: () => {
    const state = get();
    if (!state.patientId) return;

    set({ loading: true, error: null });

    try {
      const experience = routeExperience({
        actorId: state.actorId,
        patientId: state.patientId,
        encounterId: state.encounterId || undefined,
        requestedJourney: state.journeyId,
        context: {
          phaseId: state.phaseId || undefined,
          completionMap: state.completionMap,
          clinicalSummary: state.clinicalSummary,
          alerts: state.alerts,
        },
        facility: { name: state.facilityName },
      });

      const brand = getBrand();
      const device = getDeviceInfo();
      const theme = buildThemeContext({ role: state.actorId, brand, device });

      set({ presentation: experience.presentation, theme, experience, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  initializeFromRequest: (req) => {
    set({
      actorId: req.actorId,
      patientId: req.patientId,
      encounterId: req.encounterId || '',
      journeyId: req.requestedJourney || 'clinical_care' as JourneyId,
      facilityName: req.facility?.name || 'Healthcare Facility',
      phaseId: '',
      completionMap: {},
      alerts: [],
      clinicalSummary: {},
    });

    setTimeout(() => get().refreshScreen(), 0);
  },
}));
