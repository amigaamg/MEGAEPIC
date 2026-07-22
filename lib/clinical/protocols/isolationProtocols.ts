import type { IsolationProtocol } from '../types/protocols'

export const PNEUMONIA_ISOLATION: IsolationProtocol[] = [
  {
    id: 'isolation_pneumonia_standard',
    diseaseId: 'community_acquired_pneumonia',
    type: 'standard',
    ppe: ['Gloves', 'Gown for contact with body fluids'],
    roomType: 'Standard bed — no special ventilation required',
    patientTransport: 'No restrictions',
    duration: 'Duration of hospitalization',
    disinfection: ['Standard cleaning per hospital protocol', 'Hand hygiene before and after contact'],
  },
  {
    id: 'isolation_tb_airborne',
    diseaseId: 'tuberculosis',
    type: 'airborne',
    ppe: ['N95 respirator (fit-tested)', 'Gloves', 'Gown', 'Eye protection if splash risk'],
    roomType: 'Negative pressure room (ACH ≥12). Door closed at all times.',
    patientTransport: 'Minimize transport. Patient must wear surgical mask. Notify receiving area.',
    duration: 'Minimum 2 weeks of effective therapy OR 3 consecutive negative sputum AFB smears',
    disinfection: ['N95 for all entering room', 'UV disinfection if available', 'Standard cleaning with EPA-registered disinfectant'],
  },
  {
    id: 'isolation_covid_droplet_contact',
    diseaseId: 'covid_pneumonia',
    type: 'droplet',
    ppe: ['Surgical mask', 'Gloves', 'Gown', 'Eye protection'],
    roomType: 'Single room with good ventilation. Negative pressure preferred.',
    patientTransport: 'Patient must wear surgical mask. Limit transport to essential only.',
    duration: 'Duration of symptoms + 3 days afebrile without antipyretics',
    disinfection: ['Contact and droplet precautions', 'Enhanced cleaning of high-touch surfaces'],
  },
]
