
export enum Role {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  imageUrl?: string;
  bufferMinutes?: number; // Time for cleaning/prep
  serviceCategoryId?: string;
}

export interface WorkSchedule {
  workDays: number[]; // 0 = Sunday, 1 = Monday...
  workStart: string; // "09:00"
  workEnd: string;   // "18:00"
  breakStart?: string; // "12:00"
  breakEnd?: string;   // "13:00"
}

export interface Professional {
  id: string;
  name: string;
  specialties: string[]; // Service IDs
  avatarUrl?: string;
  commissionPercentage: number; // e.g., 50 for 50%
  schedule: WorkSchedule;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED' // For admin blocks
}

export interface Appointment {
  id: string;
  clientId: string; 
  clientName: string; // Snapshot (Legacy support), use clientId lookup where possible
  professionalId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  packageId?: string; // If booked via package
  discountApplied?: number; // If promo applied
  customDuration?: number; // Override service duration (for drag-to-resize)
}

export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  rating: number; // 1 to 5
  comment?: string;
  date: string;
}

export interface ClientProfile {
    id: string;
    role: Role;
    name: string;
    email: string;
    phone: string; // WhatsApp
    password?: string;
    birthDate?: string;
    gender?: 'Feminino' | 'Masculino' | 'Outro' | 'Prefiro não informar';
    profession?: string;
    internalNotes?: string; // Admin only
    loyaltyPoints: number;
}

export interface SalonConfig {
  cancellationWindowHours: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
}

export interface Transaction {
  id: string;
  appointmentId?: string;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: 'SERVICE' | 'PRODUCT' | 'COMMISSION' | 'OPERATIONAL' | 'PACKAGE_SALE' | 'PACKAGE_USAGE';
  paymentMethodId?: string; // FK to PaymentMethod
  clientPackageId?: string; // FK to ClientPackage (if used)
}

// --- Loyalty & Packages ---

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  validityMonths: number;
  items: { serviceId: string; count: number }[];
}

export interface ClientPackage {
  id: string;
  packageTemplateId: string;
  name: string;
  clientId: string;
  purchaseDate: string;
  expirationDate: string;
  remainingItems: { serviceId: string; count: number }[];
}

export interface LoyaltyReward {
  id: string;
  name: string;
  costPoints: number;
  active: boolean;
}

export interface PointsHistory {
  id: string;
  clientId: string;
  transactionId?: string; // Optional link to origin
  points: number;
  type: 'EARN' | 'REDEEM';
  date: string;
  description: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'HAPPY_HOUR' | 'BIRTHDAY';
  discountPercentage: number;
  active: boolean;
  rules?: {
    daysOfWeek?: number[]; // 1=Mon, 2=Tue...
    startHour?: string; // "10:00"
    endHour?: string;   // "14:00"
  };
}

// --- Inventory (Estoque) ---

export interface Product {
  id: string;
  name: string;
  type: 'RETAIL' | 'CONSUMABLE'; // Venda ou Consumo Interno
  costPrice: number;
  salePrice?: number; // Only for RETAIL
  currentStock: number;
  minStock: number; // For warnings
  unit: string; // ml, un, g
}

export interface ServiceConsumption {
  serviceId: string;
  productId: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  date: string;
  quantity: number; // Positive (Add) or Negative (Use)
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'USAGE';
  reason?: string;
}

export interface Commission {
  id: string;
  professionalId: string;
  transactionId: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'PAID';
}
