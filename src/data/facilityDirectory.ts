export interface Facility {
  id: string;
  name: string;
  type: 'lab' | 'imaging' | 'both';
  location: string;
  phone?: string;
  email?: string;
  services: string[];
  available: boolean;
}

export const FACILITIES: Facility[] = [
  {
    id: 'lancet_central',
    name: 'Lancet Laboratories - Central',
    type: 'lab',
    location: 'Central Business District, Nairobi',
    phone: '+254 20 222 0001',
    email: 'central@lancet.co.ke',
    services: ['Chemistry', 'Hematology', 'Microbiology', 'Immunology', 'Histology'],
    available: true,
  },
  {
    id: 'lancet_west',
    name: 'Lancet Laboratories - West',
    type: 'lab',
    location: 'Westlands, Nairobi',
    phone: '+254 20 222 0002',
    services: ['Chemistry', 'Hematology', 'Microbiology', 'Immunology'],
    available: true,
  },
  {
    id: 'pathcare_east',
    name: 'PathCare Kenya - East',
    type: 'lab',
    location: 'Eastleigh, Nairobi',
    phone: '+254 20 333 0001',
    services: ['Chemistry', 'Hematology', 'Microbiology', 'Histology', 'Genetics'],
    available: true,
  },
  {
    id: 'pathcare_mombasa',
    name: 'PathCare Kenya - Mombasa',
    type: 'lab',
    location: 'Mombasa CBD',
    phone: '+254 41 222 0001',
    services: ['Chemistry', 'Hematology', 'Microbiology'],
    available: true,
  },
  {
    id: 'diagnostika_kisumu',
    name: 'Diagnostika - Kisumu',
    type: 'lab',
    location: 'Kisumu CBD',
    phone: '+254 57 202 0001',
    services: ['Chemistry', 'Hematology', 'Microbiology'],
    available: true,
  },
  {
    id: 'amref_imaging',
    name: 'AMREF Radiology Centre',
    type: 'imaging',
    location: 'Wilson Airport Area, Nairobi',
    phone: '+254 20 699 3000',
    services: ['X-Ray', 'Ultrasound', 'CT Scan', 'MRI', 'Mammography'],
    available: true,
  },
  {
    id: 'kenyatta_radiology',
    name: 'Kenyatta National Hospital Radiology',
    type: 'imaging',
    location: 'Hospital Road, Nairobi',
    phone: '+254 20 272 6300',
    services: ['X-Ray', 'Ultrasound', 'CT Scan', 'MRI', 'Interventional Radiology'],
    available: true,
  },
  {
    id: 'agakhan_imaging',
    name: 'Aga Khan University Hospital Imaging',
    type: 'imaging',
    location: 'Third Parklands Avenue, Nairobi',
    phone: '+254 20 366 2000',
    services: ['X-Ray', 'Ultrasound', 'CT Scan', 'MRI', 'PET-CT', 'Nuclear Medicine'],
    available: true,
  },
  {
    id: 'mombasa_imaging',
    name: 'Mombasa Imaging Centre',
    type: 'imaging',
    location: 'Mombasa CBD',
    phone: '+254 41 231 9000',
    services: ['X-Ray', 'Ultrasound', 'CT Scan', 'MRI'],
    available: true,
  },
  {
    id: 'eldoret_radiology',
    name: 'Eldoret Radiology & Diagnostics',
    type: 'both',
    location: 'Eldoret Town',
    phone: '+254 53 206 3000',
    services: ['Chemistry', 'Hematology', 'X-Ray', 'Ultrasound', 'CT Scan'],
    available: true,
  },
];

export const getFacilitiesByType = (type: 'lab' | 'imaging'): Facility[] =>
  FACILITIES.filter(f => f.type === type || f.type === 'both');
