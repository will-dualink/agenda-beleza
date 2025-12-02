import { Service, Professional, ClientProfile, Role } from '../types';

// --- INITIAL DATA (SEED) ---

export const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Women\'s Haircut', description: 'Cut, wash, and style.', durationMinutes: 60, bufferMinutes: 15, price: 65, imageUrl: 'https://picsum.photos/200/200?random=1' },
  { id: '2', name: 'Full Coloring', description: 'Complete hair coloring with premium products.', durationMinutes: 120, bufferMinutes: 30, price: 150, imageUrl: 'https://picsum.photos/200/200?random=2' },
  { id: '3', name: 'Manicure', description: 'Cuticle care and polish application.', durationMinutes: 45, bufferMinutes: 5, price: 30, imageUrl: 'https://picsum.photos/200/200?random=3' },
  { id: '4', name: 'Deep Hydration', description: 'Reconstructive treatment for damaged hair.', durationMinutes: 90, bufferMinutes: 15, price: 80, imageUrl: 'https://picsum.photos/200/200?random=4' },
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  { 
    id: 'p1', 
    name: 'Anna Smith', 
    specialties: ['1', '2', '4'], 
    avatarUrl: 'https://picsum.photos/100/100?random=5',
    commissionPercentage: 50,
    schedule: { workDays: [1, 2, 3, 4, 5, 6], workStart: '09:00', workEnd: '18:00', breakStart: '12:00', breakEnd: '13:00' }
  },
  { 
    id: 'p2', 
    name: 'Charles Oliver', 
    specialties: ['1', '3'], 
    avatarUrl: 'https://picsum.photos/100/100?random=6',
    commissionPercentage: 40,
    schedule: { workDays: [2, 3, 4, 5, 6], workStart: '10:00', workEnd: '19:00', breakStart: '14:00', breakEnd: '15:00' }
  },
  { 
    id: 'p3', 
    name: 'Mary Costa', 
    specialties: ['3'], 
    avatarUrl: 'https://picsum.photos/100/100?random=7',
    commissionPercentage: 60,
    schedule: { workDays: [4, 5, 6], workStart: '08:00', workEnd: '16:00' }
  },
];

export const INITIAL_USERS: ClientProfile[] = [
  { 
    id: 'admin1', 
    role: Role.ADMIN, 
    name: 'Master Admin', 
    email: 'admin@salon.com', 
    phone: '+15550000000', 
    password: 'c2FsdF9hZG1pbg==', // admin
    loyaltyPoints: 0
  },
  { 
    id: 'guest', 
    role: Role.CLIENT, 
    name: 'Julia Roberts', 
    email: 'julia@email.com', 
    phone: '(555) 555-5555', 
    password: 'c2FsdF8xMjM=', // 123
    birthDate: '1990-01-01',
    internalNotes: 'VIP Client. Prefers coffee without sugar.',
    loyaltyPoints: 120
  }
];

// --- HELPERS ---

export const get = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const set = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};