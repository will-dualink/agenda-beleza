/**
 * Type definitions for AgendaBeleza
 */

// ============ ENUMS ============

export enum Role {
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
  CLIENT = 'CLIENT'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED',
  NO_SHOW = 'NO_SHOW'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum TransactionCategory {
  SERVICE = 'SERVICE',
  PACKAGE_SALE = 'PACKAGE_SALE',
  PACKAGE_USAGE = 'PACKAGE_USAGE',
  PRODUCT_SALE = 'PRODUCT_SALE',
  COMMISSION = 'COMMISSION',
  REFUND = 'REFUND',
  OTHER = 'OTHER'
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum PointsHistoryType {
  EARN = 'EARN',
  REDEEM = 'REDEEM'
}

export enum PromotionType {
  HAPPY_HOUR = 'HAPPY_HOUR',
  BIRTHDAY = 'BIRTHDAY',
  LOYALTY = 'LOYALTY',
  SEASONAL = 'SEASONAL',
  COUPON = 'COUPON'
}

export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  USAGE = 'USAGE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

// ============ CORE TYPES ============

export interface ClientProfile {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  password?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: Gender;
  profession?: string;
  internalNotes?: string;
  loyaltyPoints: number;
}

export interface Professional {
  id: string;
  name: string;
  avatarUrl: string;
  commissionPercentage: number;
  specialties: string[]; // Service IDs
  schedule: WorkSchedule;
}

export interface WorkSchedule {
  workDays: number[]; // 0-6 (Sunday-Saturday)
  workStart: string; // HH:MM
  workEnd: string; // HH:MM
  breakStart?: string; // HH:MM
  breakEnd?: string; // HH:MM
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  bufferMinutes?: number;
  imageUrl?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  professionalId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  notes?: string;
  customDuration?: number; // minutes
  reminderSent?: boolean;
}

export interface SalonConfig {
  cancellationWindowHours: number;
}

// ============ FINANCE TYPES ============

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  appointmentId?: string;
  paymentMethodId?: string;
  clientPackageId?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
}

export interface Commission {
  id: string;
  professionalId: string;
  transactionId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  status: CommissionStatus;
}

// ============ INVENTORY TYPES ============

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit: string; // mL, g, unidade, etc
  currentStock: number;
  minStock: number;
  cost: number;
  imageUrl?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  date: string; // ISO timestamp
  quantity: number;
  type: StockMovementType;
  reason: string;
}

export interface ServiceConsumption {
  serviceId: string;
  productId: string;
  quantity: number;
}

// ============ PACKAGE TYPES ============

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  validityMonths: number;
  items: PackageItem[];
}

export interface PackageItem {
  serviceId: string;
  count: number;
}

export interface ClientPackage {
  id: string;
  clientId: string;
  packageTemplateId: string;
  name: string;
  purchaseDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  remainingItems: PackageItem[];
}

// ============ LOYALTY TYPES ============

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsRequired: number;
  description?: string;
  discount?: number; // percentage
  active: boolean;
}

export interface PointsHistory {
  id: string;
  clientId: string;
  transactionId?: string;
  points: number;
  type: PointsHistoryType;
  date: string; // ISO timestamp
  description?: string;
}

// ============ PROMOTION TYPES ============

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  discountPercentage: number;
  active: boolean;
  rules?: PromotionRules;
}

export interface PromotionRules {
  startHour?: string; // HH:MM (for HAPPY_HOUR)
  endHour?: string; // HH:MM (for HAPPY_HOUR)
  daysOfWeek?: number[]; // 0-6 (for HAPPY_HOUR)
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  maxUsesPerClient?: number;
  minPurchaseAmount?: number;
}

// ============ REVIEW TYPES ============

export interface Review {
  id: string;
  clientId: string;
  professionalId?: string;
  serviceId?: string;
  rating: number; // 1-5
  comment?: string;
  date: string; // ISO timestamp
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  local?: boolean; // true if fallback to local storage
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============ FORM TYPES ============

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  birthDate?: string;
  gender?: Gender;
  profession?: string;
}

export interface AppointmentBookingData {
  clientId: string;
  clientName: string;
  serviceIds: string[];
  date: string;
  time: string;
  professionalId?: string;
  notes?: string;
  usePackageId?: string;
  paymentMethodId?: string;
}

// ============ UI TYPES ============

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // milliseconds
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  submenu?: MenuItem[];
  onClick?: () => void;
}

export interface LayoutProps {
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
  showBack?: boolean;
  children: React.ReactNode;
}

// ============ CONTEXT TYPES ============

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface AuthContextType {
  user: ClientProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}
