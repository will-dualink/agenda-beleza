
import { Service, Professional, Appointment, AppointmentStatus, SalonConfig, ClientProfile, Role, Transaction, ServicePackage, ClientPackage, LoyaltyReward, Promotion, Product, StockMovement, ServiceConsumption, Commission, PaymentMethod, PointsHistory, Review } from '../types';

// Initial Seed Data
const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Corte Feminino', description: 'Corte, lavagem e finalização.', durationMinutes: 60, bufferMinutes: 15, price: 120, imageUrl: 'https://picsum.photos/200/200?random=1' },
  { id: '2', name: 'Coloração Completa', description: 'Tintura completa com produtos premium.', durationMinutes: 120, bufferMinutes: 30, price: 250, imageUrl: 'https://picsum.photos/200/200?random=2' },
  { id: '3', name: 'Manicure', description: 'Cutilagem e esmaltação.', durationMinutes: 45, bufferMinutes: 5, price: 40, imageUrl: 'https://picsum.photos/200/200?random=3' },
  { id: '4', name: 'Hidratação Profunda', description: 'Tratamento reconstrutor para fios danificados.', durationMinutes: 90, bufferMinutes: 15, price: 180, imageUrl: 'https://picsum.photos/200/200?random=4' },
];

const INITIAL_PROFESSIONALS: Professional[] = [
  { 
    id: 'p1', 
    name: 'Ana Silva', 
    specialties: ['1', '2', '4'], 
    avatarUrl: 'https://picsum.photos/100/100?random=5',
    commissionPercentage: 50,
    schedule: { workDays: [1, 2, 3, 4, 5, 6], workStart: '09:00', workEnd: '18:00', breakStart: '12:00', breakEnd: '13:00' }
  },
  { 
    id: 'p2', 
    name: 'Carlos Oliveira', 
    specialties: ['1', '3'], 
    avatarUrl: 'https://picsum.photos/100/100?random=6',
    commissionPercentage: 40,
    schedule: { workDays: [2, 3, 4, 5, 6], workStart: '10:00', workEnd: '19:00', breakStart: '14:00', breakEnd: '15:00' }
  },
  { 
    id: 'p3', 
    name: 'Mariana Costa', 
    specialties: ['3'], 
    avatarUrl: 'https://picsum.photos/100/100?random=7',
    commissionPercentage: 60,
    schedule: { workDays: [4, 5, 6], workStart: '08:00', workEnd: '16:00' }
  },
];

// Simple hash simulation for demo purposes (Base64 + Salt)
const hashPassword = (pwd: string) => btoa(`salt_${pwd}`);

const INITIAL_USERS: ClientProfile[] = [
  { 
    id: 'admin1', 
    role: Role.ADMIN, 
    name: 'Admin Master', 
    email: 'admin@salao.com', 
    phone: '+5511999999999', 
    password: hashPassword('admin'),
    loyaltyPoints: 0
  },
  { 
    id: 'guest', 
    role: Role.CLIENT, 
    name: 'Julia Roberts', 
    email: 'julia@email.com', 
    phone: '(11) 98888-8888', 
    password: hashPassword('123'),
    birthDate: '1990-01-01',
    internalNotes: 'Cliente VIP. Prefere café sem açúcar.',
    loyaltyPoints: 120
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev1',
    clientId: 'guest',
    professionalId: 'p1',
    appointmentId: 'a_past_1',
    serviceId: '1',
    rating: 5,
    comment: 'A Ana é maravilhosa! Meu cabelo ficou perfeito.',
    date: '2023-11-15'
  },
  {
    id: 'rev2',
    clientId: 'guest',
    professionalId: 'p3',
    appointmentId: 'a_past_2',
    serviceId: '3',
    rating: 4,
    comment: 'Ótimo serviço, mas demorou um pouquinho para começar.',
    date: '2023-12-02'
  }
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', name: 'Cartão de Crédito', active: true },
  { id: 'pm2', name: 'Cartão de Débito', active: true },
  { id: 'pm3', name: 'PIX', active: true },
  { id: 'pm4', name: 'Dinheiro', active: true },
];

const INITIAL_PACKAGES: ServicePackage[] = [
  { id: 'pkg1', name: 'Combo Manicure Mensal', price: 140, validityMonths: 2, items: [{ serviceId: '3', count: 4 }] },
  { id: 'pkg2', name: 'Tratamento Vip', price: 500, validityMonths: 3, items: [{ serviceId: '4', count: 2 }, { serviceId: '1', count: 2 }] }
];

const INITIAL_REWARDS: LoyaltyReward[] = [
  { id: 'r1', name: 'Desconto de R$ 20,00', costPoints: 200, active: true },
  { id: 'r2', name: 'Hidratação Grátis', costPoints: 1000, active: true },
];

const INITIAL_PROMOTIONS: Promotion[] = [
  { 
    id: 'promo1', 
    name: 'Happy Hour Terça-Feira', 
    type: 'HAPPY_HOUR', 
    discountPercentage: 20, 
    active: true,
    rules: { daysOfWeek: [2], startHour: '09:00', endHour: '14:00' } // 2 = Tuesday
  },
  {
    id: 'promo2',
    name: 'Aniversariante da Semana',
    type: 'BIRTHDAY',
    discountPercentage: 15,
    active: true
  }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod1', name: 'Shampoo Premium', type: 'CONSUMABLE', costPrice: 50, currentStock: 20, minStock: 5, unit: 'L' },
  { id: 'prod2', name: 'Kit Coloração #5', type: 'CONSUMABLE', costPrice: 30, currentStock: 8, minStock: 10, unit: 'un' },
  { id: 'prod3', name: 'Óleo Reparador', type: 'RETAIL', costPrice: 40, salePrice: 90, currentStock: 15, minStock: 3, unit: 'un' },
];

const INITIAL_SERVICE_CONSUMPTION: ServiceConsumption[] = [
  { serviceId: '2', productId: 'prod2', quantity: 1 }, // Coloration uses 1 Kit
  { serviceId: '1', productId: 'prod1', quantity: 0.05 }, // Cut (wash) uses 0.05L of Shampoo
];

const INITIAL_APPOINTMENTS: Appointment[] = [
    {
        id: 'a1',
        clientId: 'guest',
        clientName: 'Julia Roberts',
        professionalId: 'p1',
        serviceId: '1',
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        status: AppointmentStatus.CONFIRMED
    }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: new Date().toISOString().split('T')[0], description: 'Corte Feminino - Julia R.', amount: 120, type: 'INCOME', category: 'SERVICE', appointmentId: 'a1', paymentMethodId: 'pm1' },
  { id: 't2', date: new Date().toISOString().split('T')[0], description: 'Conta de Luz', amount: 350, type: 'EXPENSE', category: 'OPERATIONAL' },
];

const INITIAL_CONFIG: SalonConfig = {
  cancellationWindowHours: 12
};

// Helper to simulate DB
const get = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const set = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Time Helpers ---
export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const StorageService = {
  // --- Basic Entities ---
  getServices: (): Service[] => get('services', INITIAL_SERVICES),
  saveServices: (services: Service[]) => set('services', services),
  
  getProfessionals: (): Professional[] => get('professionals', INITIAL_PROFESSIONALS),
  saveProfessionals: (pros: Professional[]) => set('professionals', pros),

  getAppointments: (): Appointment[] => get('appointments', INITIAL_APPOINTMENTS),
  saveAppointments: (apps: Appointment[]) => set('appointments', apps),
  
  getConfig: (): SalonConfig => get('salon_config', INITIAL_CONFIG),
  saveConfig: (config: SalonConfig) => set('salon_config', config),

  getPaymentMethods: (): PaymentMethod[] => get('payment_methods', INITIAL_PAYMENT_METHODS),
  savePaymentMethods: (methods: PaymentMethod[]) => set('payment_methods', methods),

  // --- Transactions ---
  getTransactions: (): Transaction[] => get('transactions', INITIAL_TRANSACTIONS),
  addTransaction: (tx: Transaction) => {
    const txs = get<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
    txs.push(tx);
    set('transactions', txs);
  },

  // --- Inventory & Stock Logic ---
  getProducts: (): Product[] => get('products', INITIAL_PRODUCTS),
  saveProducts: (products: Product[]) => set('products', products),
  
  getProductConsumption: (): ServiceConsumption[] => get('service_consumption', INITIAL_SERVICE_CONSUMPTION),
  saveProductConsumption: (data: ServiceConsumption[]) => set('service_consumption', data),

  adjustStock: (productId: string, quantity: number, type: StockMovement['type'], reason: string) => {
    const products = StorageService.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex >= 0) {
      // Update Stock
      products[productIndex].currentStock += quantity; // quantity can be negative
      set('products', products);

      // Log Movement
      const movements = get<StockMovement[]>('stock_movements', []);
      movements.push({
        id: Math.random().toString(36).substr(2, 9),
        productId,
        date: new Date().toISOString(),
        quantity,
        type,
        reason
      });
      set('stock_movements', movements);
    }
  },

  linkProductToService: (serviceId: string, productId: string, quantity: number) => {
    const consumptions = StorageService.getProductConsumption();
    const existingIndex = consumptions.findIndex(c => c.serviceId === serviceId && c.productId === productId);
    
    if (quantity <= 0) {
      // Remove link
      if (existingIndex >= 0) {
        consumptions.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex >= 0) {
        consumptions[existingIndex].quantity = quantity;
      } else {
        consumptions.push({ serviceId, productId, quantity });
      }
    }
    set('service_consumption', consumptions);
  },

  // --- Appointment Logic ---
  addAppointment: (app: Appointment, usePackageId?: string, paymentMethodId?: string, finalPrice?: number) => {
    const apps = get<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    apps.push(app);
    set('appointments', apps);

    const services = StorageService.getServices();
    const service = services.find(s => s.id === app.serviceId);
    if (!service) return;

    const txId = Math.random().toString(36).substr(2, 9);
    
    if (usePackageId) {
      // 1. Consume Package Item
      StorageService.consumePackageItem(usePackageId, app.serviceId);
      
      // 2. Create "Usage" Transaction (Zero Amount, but tracked)
      StorageService.addTransaction({
        id: txId,
        date: app.date,
        description: `Uso de Pacote: ${service.name}`,
        amount: 0, 
        type: 'INCOME',
        category: 'PACKAGE_USAGE',
        appointmentId: app.id,
        clientPackageId: usePackageId
      });

      // 3. Generate Commission based on SERVICE PRICE (Professional still gets paid)
      StorageService.recordCommission(app.professionalId, txId, service.price, app.date);

    } else {
      // 1. Loyalty Points
      const points = Math.floor(service.price / 10);
      StorageService.addLoyaltyPoints(app.clientId, points, txId, `Pontos por serviço: ${service.name}`);

      // 2. Financial Transaction
      StorageService.addTransaction({
        id: txId,
        date: app.date,
        description: `Serviço: ${service.name}`,
        amount: finalPrice !== undefined ? finalPrice : service.price, 
        type: 'INCOME',
        category: 'SERVICE',
        appointmentId: app.id,
        paymentMethodId: paymentMethodId
      });

      // 3. Commission
      StorageService.recordCommission(app.professionalId, txId, finalPrice !== undefined ? finalPrice : service.price, app.date);
    }
  },

  addBlock: (date: string, time: string, durationMinutes: number, professionalId: string, reason: string) => {
     const apps = get<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
     apps.push({
         id: Math.random().toString(36).substr(2, 9),
         clientId: 'ADMIN_BLOCK',
         clientName: reason, // Use clientName to store the Block Reason
         professionalId,
         serviceId: 'BLOCK',
         date,
         time,
         status: AppointmentStatus.BLOCKED,
         customDuration: durationMinutes
     });
     set('appointments', apps);
  },

  moveAppointment: (id: string, newDate: string, newTime: string, newProfessionalId: string) => {
      const apps = get<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
      const appIndex = apps.findIndex(a => a.id === id);
      if (appIndex === -1) return;

      apps[appIndex].date = newDate;
      apps[appIndex].time = newTime;
      apps[appIndex].professionalId = newProfessionalId;
      set('appointments', apps);
  },

  updateAppointmentStatus: (id: string, status: AppointmentStatus) => {
    const apps = get<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    const appIndex = apps.findIndex(a => a.id === id);
    if (appIndex === -1) return;

    const oldStatus = apps[appIndex].status;
    apps[appIndex].status = status;
    set('appointments', apps);

    // If status changed to COMPLETED, consume stock
    if (oldStatus !== AppointmentStatus.COMPLETED && status === AppointmentStatus.COMPLETED) {
       StorageService.triggerServiceStockConsumption(apps[appIndex].serviceId);
    }
  },

  updateAppointmentDuration: (id: string, newDurationMinutes: number) => {
    const apps = get<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    const appIndex = apps.findIndex(a => a.id === id);
    if (appIndex === -1) return;
    
    // Validate min duration
    if (newDurationMinutes < 15) newDurationMinutes = 15;

    apps[appIndex].customDuration = newDurationMinutes;
    set('appointments', apps);
  },

  triggerServiceStockConsumption: (serviceId: string) => {
    const consumptions = StorageService.getProductConsumption();
    const links = consumptions.filter(c => c.serviceId === serviceId);
    
    links.forEach(link => {
       // Deduct stock (negative quantity)
       StorageService.adjustStock(link.productId, -link.quantity, 'USAGE', 'Serviço Realizado');
    });
  },

  recordCommission: (professionalId: string, transactionId: string, servicePrice: number, date: string) => {
     const pros = StorageService.getProfessionals();
     const pro = pros.find(p => p.id === professionalId);
     if (!pro) return;

     const amount = (servicePrice * pro.commissionPercentage) / 100;
     const commissions = get<Commission[]>('commissions', []);
     
     commissions.push({
       id: Math.random().toString(36).substr(2, 9),
       professionalId,
       transactionId,
       amount,
       date,
       status: 'PENDING'
     });
     set('commissions', commissions);
  },

  getCommissions: (): Commission[] => get('commissions', []),

  canCancel: (appointment: Appointment): { allowed: boolean; reason?: string } => {
    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
      return { allowed: false, reason: 'Status inválido para cancelamento.' };
    }
    const config = get('salon_config', INITIAL_CONFIG);
    const appDate = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const diffMs = appDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < config.cancellationWindowHours) {
      return { 
        allowed: false, 
        reason: `Cancelamento permitido apenas com ${config.cancellationWindowHours}h de antecedência.` 
      };
    }
    return { allowed: true };
  },

  getAvailableSlots: (dateStr: string, serviceIds: string | string[], professionalId?: string, explicitDuration?: number): string[] => {
    const services = StorageService.getServices();
    const allPros = StorageService.getProfessionals();
    const allApps = StorageService.getAppointments();

    // Support single ID or array of IDs
    const serviceIdArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
    const primaryServiceId = serviceIdArray[0];

    // Calculate total duration needed
    let totalDuration = 0;
    if (explicitDuration) {
        totalDuration = explicitDuration;
    } else {
        serviceIdArray.forEach(sid => {
            const s = services.find(serv => serv.id === sid);
            if (s) totalDuration += s.durationMinutes + (s.bufferMinutes || 0);
        });
    }

    if (totalDuration === 0) return [];

    const dayOfWeek = new Date(dateStr).getDay(); // 0 = Sun

    // Find pros who can do the PRIMARY service (for now, assume same pro does all for multi-service in this version)
    // Or filter pros who can do ALL selected services? 
    // Simplified: Filter pros who can do the FIRST service.
    let eligiblePros = allPros.filter(p => p.specialties.includes(primaryServiceId));
    
    // Improve: Filter pros who can do ALL services if passing array
    if (Array.isArray(serviceIds) && serviceIds.length > 1) {
       eligiblePros = allPros.filter(p => serviceIds.every(sid => p.specialties.includes(sid)));
    }

    if (professionalId) {
      eligiblePros = eligiblePros.filter(p => p.id === professionalId);
    }
    eligiblePros = eligiblePros.filter(p => p.schedule.workDays.includes(dayOfWeek));

    if (eligiblePros.length === 0) return [];

    const possibleSlots: Set<string> = new Set();
    const SLOT_INTERVAL = 15; // minutes

    eligiblePros.forEach(pro => {
      const workStart = timeToMinutes(pro.schedule.workStart);
      const workEnd = timeToMinutes(pro.schedule.workEnd);
      const breakStart = pro.schedule.breakStart ? timeToMinutes(pro.schedule.breakStart) : -1;
      const breakEnd = pro.schedule.breakEnd ? timeToMinutes(pro.schedule.breakEnd) : -1;

      const proApps = allApps.filter(a => 
        a.professionalId === pro.id && 
        a.date === dateStr && 
        a.status !== AppointmentStatus.CANCELLED
      );

      for (let time = workStart; time + totalDuration <= workEnd; time += SLOT_INTERVAL) {
        const slotEnd = time + totalDuration;
        
        if (breakStart !== -1 && breakEnd !== -1) {
          if (time < breakEnd && slotEnd > breakStart) continue; 
        }

        let isBlocked = false;
        for (const app of proApps) {
          const appService = services.find(s => s.id === app.serviceId);
          // USE CUSTOM DURATION IF AVAILABLE, ELSE SERVICE DEFAULT. IF BLOCK, USE CUSTOM.
          const durationToUse = app.customDuration || ((appService?.durationMinutes || 60) + (appService?.bufferMinutes || 0));
          
          const appStart = timeToMinutes(app.time);
          const appEnd = appStart + durationToUse;

          if (time < appEnd && slotEnd > appStart) {
            isBlocked = true;
            break;
          }
        }

        if (!isBlocked) {
          possibleSlots.add(minutesToTime(time));
        }
      }
    });

    return Array.from(possibleSlots).sort();
  },

  // --- Loyalty & Packages Logic ---
  
  getServicePackages: (): ServicePackage[] => get('service_packages', INITIAL_PACKAGES),
  saveServicePackages: (pkgs: ServicePackage[]) => set('service_packages', pkgs),
  
  getClientPackages: (clientId: string): ClientPackage[] => {
    const all = get<ClientPackage[]>('client_packages', []);
    return all.filter(p => p.clientId === clientId && new Date(p.expirationDate) > new Date());
  },

  buyPackage: (clientId: string, packageTemplate: ServicePackage) => {
    const all = get<ClientPackage[]>('client_packages', []);
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + packageTemplate.validityMonths);

    const newPkg: ClientPackage = {
      id: Math.random().toString(36).substr(2, 9),
      clientId,
      packageTemplateId: packageTemplate.id,
      name: packageTemplate.name,
      purchaseDate: new Date().toISOString().split('T')[0],
      expirationDate: expDate.toISOString().split('T')[0],
      remainingItems: packageTemplate.items.map(i => ({...i}))
    };

    all.push(newPkg);
    set('client_packages', all);

    const txId = Math.random().toString(36).substr(2, 9);
    // Use default payment method (simulated as 'pm1' Credit Card for buying package)
    StorageService.addTransaction({
      id: txId,
      date: new Date().toISOString().split('T')[0],
      description: `Compra Pacote: ${packageTemplate.name}`,
      amount: packageTemplate.price,
      type: 'INCOME',
      category: 'PACKAGE_SALE',
      paymentMethodId: 'pm1' 
    });
    
    // Add Points for Package Purchase
    const points = Math.floor(packageTemplate.price / 10);
    StorageService.addLoyaltyPoints(clientId, points, txId, `Compra de pacote: ${packageTemplate.name}`);
  },

  consumePackageItem: (clientPackageId: string, serviceId: string) => {
    const all = get<ClientPackage[]>('client_packages', []);
    const index = all.findIndex(p => p.id === clientPackageId);
    if (index >= 0) {
      const pkg = all[index];
      const itemIndex = pkg.remainingItems.findIndex(i => i.serviceId === serviceId);
      if (itemIndex >= 0 && pkg.remainingItems[itemIndex].count > 0) {
        pkg.remainingItems[itemIndex].count--;
        set('client_packages', all);
      }
    }
  },

  getLoyaltyRewards: (): LoyaltyReward[] => get('loyalty_rewards', INITIAL_REWARDS),
  saveLoyaltyRewards: (rewards: LoyaltyReward[]) => set('loyalty_rewards', rewards),

  addLoyaltyPoints: (clientId: string, points: number, txId?: string, description?: string) => {
    const users = StorageService.getUsers();
    const userIndex = users.findIndex(u => u.id === clientId);
    if (userIndex >= 0) {
      users[userIndex].loyaltyPoints = (users[userIndex].loyaltyPoints || 0) + points;
      set('users', users);
      
      const current = StorageService.getCurrentUser();
      if (current && current.id === clientId) {
        current.loyaltyPoints = users[userIndex].loyaltyPoints;
        localStorage.setItem('current_user', JSON.stringify(current));
      }

      // Add to History
      const history = get<PointsHistory[]>('points_history', []);
      history.push({
        id: Math.random().toString(36).substr(2, 9),
        clientId,
        transactionId: txId,
        points: points,
        type: points > 0 ? 'EARN' : 'REDEEM',
        date: new Date().toISOString(),
        description: description || 'Ajuste de pontos'
      });
      set('points_history', history);
    }
  },

  getPointsHistory: (clientId: string): PointsHistory[] => {
      const history = get<PointsHistory[]>('points_history', []);
      return history.filter(h => h.clientId === clientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getPromotions: (): Promotion[] => get('promotions', INITIAL_PROMOTIONS),
  savePromotions: (promos: Promotion[]) => set('promotions', promos),

  calculatePrice: (service: Service, dateStr: string, timeStr: string, clientId?: string): { finalPrice: number, discountReason?: string } => {
    let finalPrice = service.price;
    let discountReason = undefined;

    const promos = StorageService.getPromotions().filter(p => p.active);
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); 
    
    const happyHour = promos.find(p => p.type === 'HAPPY_HOUR' && p.rules?.daysOfWeek?.includes(dayOfWeek));
    if (happyHour && happyHour.rules) {
      const timeNum = timeToMinutes(timeStr);
      const startNum = timeToMinutes(happyHour.rules.startHour || '00:00');
      const endNum = timeToMinutes(happyHour.rules.endHour || '23:59');

      if (timeNum >= startNum && timeNum <= endNum) {
        finalPrice = service.price * (1 - happyHour.discountPercentage / 100);
        discountReason = `${happyHour.name} (-${happyHour.discountPercentage}%)`;
      }
    }

    if (clientId) {
      const user = StorageService.getUsers().find(u => u.id === clientId);
      const birthdayPromo = promos.find(p => p.type === 'BIRTHDAY');
      
      if (user && user.birthDate && birthdayPromo) {
        const birth = new Date(user.birthDate);
        const currentMonth = date.getMonth();
        const birthMonth = birth.getMonth();
        if (currentMonth === birthMonth && !discountReason) { 
             finalPrice = service.price * (1 - birthdayPromo.discountPercentage / 100);
             discountReason = `${birthdayPromo.name} (-${birthdayPromo.discountPercentage}%)`;
        }
      }
    }

    return { finalPrice, discountReason };
  },

  // --- Reviews Logic ---
  getReviews: (): Review[] => get('reviews', INITIAL_REVIEWS),
  saveReviews: (reviews: Review[]) => set('reviews', reviews),
  
  getClientReviews: (clientId: string): Review[] => {
      const all = get<Review[]>('reviews', INITIAL_REVIEWS);
      return all.filter(r => r.clientId === clientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // --- User & Auth Logic ---
  getUsers: (): ClientProfile[] => get('users', INITIAL_USERS),
  
  saveUser: (user: ClientProfile) => {
    const users = get<ClientProfile[]>('users', INITIAL_USERS);
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    set('users', users);
    
    const current = StorageService.getCurrentUser();
    if (current && current.id === user.id) {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  },

  login: (loginInput: string, passwordInput: string): ClientProfile | null => {
    const users = get<ClientProfile[]>('users', INITIAL_USERS);
    const hashed = hashPassword(passwordInput);
    const user = users.find(u => 
      (u.email === loginInput || u.phone === loginInput) && u.password === hashed
    );
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem('current_user');
  },

  getCurrentUser: (): ClientProfile | null => {
    const stored = localStorage.getItem('current_user');
    return stored ? JSON.parse(stored) : null;
  },

  register: (data: Partial<ClientProfile>): { success: boolean, message?: string, user?: ClientProfile } => {
    const users = get<ClientProfile[]>('users', INITIAL_USERS);
    if (users.some(u => u.email === data.email)) return { success: false, message: 'E-mail já cadastrado.' };
    
    const newUser: ClientProfile = {
      id: Math.random().toString(36).substr(2, 9),
      role: Role.CLIENT,
      name: data.name!,
      email: data.email!,
      phone: data.phone!,
      password: hashPassword(data.password!),
      birthDate: data.birthDate,
      gender: data.gender,
      profession: data.profession,
      internalNotes: '',
      loyaltyPoints: 0
    };

    users.push(newUser);
    set('users', users);
    localStorage.setItem('current_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  createQuickClient: (name: string, phone: string): ClientProfile => {
    const users = get<ClientProfile[]>('users', INITIAL_USERS);
    const newUser: ClientProfile = {
      id: Math.random().toString(36).substr(2, 9),
      role: Role.CLIENT,
      name: name,
      email: `temp_${Date.now()}@salao.com`,
      phone: phone,
      password: hashPassword('123'),
      loyaltyPoints: 0
    };
    users.push(newUser);
    set('users', users);
    return newUser;
  }
};
