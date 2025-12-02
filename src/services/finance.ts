import { Transaction, ServicePackage, ClientPackage, LoyaltyReward, Promotion, Product, StockMovement, ServiceConsumption, Commission, PaymentMethod, PointsHistory, Service, Review, TransactionType, TransactionCategory, CommissionStatus, PointsHistoryType, StockMovementType } from '../types';
import { validateTransaction } from '../utils/validators';
import { get, set } from './persistence';
import { CatalogService } from './catalog';
import { AuthService } from './auth';
import { timeToMinutes } from './persistence';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// --- Local Helpers (Definidos antes para evitar erros) ---

const getTransactionsLocal = (): Transaction[] => get('transactions', []);

const addTransactionLocal = async (tx: Transaction) => {
    if (tx.type === 'INCOME' && tx.amount > 0) {
      const validation = validateTransaction(tx);
      if (!validation.valid) {
        console.error("Transação inválida:", validation.error);
        return;
      }
    }
    const txs = getTransactionsLocal();
    txs.push(tx);
    set('transactions', txs);

    if (isSupabaseConfigured()) {
        try {
            await supabase.from('transactions').insert({
                id: tx.id, date: tx.date, description: tx.description,
                amount: tx.amount, type: tx.type, category: tx.category,
                appointment_id: tx.appointmentId || null
            });
        } catch (e) { console.error(e); }
    }
};

const getPaymentMethodsLocal = (): PaymentMethod[] => get('payment_methods', [
    { id: 'pm1', name: 'Cartão de Crédito', active: true },
    { id: 'pm2', name: 'PIX', active: true },
    { id: 'pm3', name: 'Dinheiro', active: true },
]);
const savePaymentMethodsLocal = (methods: PaymentMethod[]) => set('payment_methods', methods);

// Inventory Helpers
const getProductsLocal = (): Product[] => get('products', []);
const saveProductsLocal = (products: Product[]) => set('products', products);
const getProductConsumptionLocal = (): ServiceConsumption[] => get('service_consumption', []);
const saveProductConsumptionLocal = (data: ServiceConsumption[]) => set('service_consumption', data);

const adjustStockLocal = (productId: string, quantity: number, type: StockMovement['type'], reason: string) => {
    const products = getProductsLocal();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex >= 0) {
      products[productIndex].currentStock += quantity;
      set('products', products);

      const movements = get<StockMovement[]>('stock_movements', []);
      movements.push({
        id: Math.random().toString(36).substr(2, 9),
        productId,
        date: new Date().toISOString(),
        quantity,
        type: StockMovementType.USAGE,
        reason
      });
      set('stock_movements', movements);
    }
};

const triggerServiceStockConsumptionLocal = (serviceId: string) => {
    const consumptions = getProductConsumptionLocal();
    const links = consumptions.filter(c => c.serviceId === serviceId);
     links.forEach(link => {
       adjustStockLocal(link.productId, -link.quantity, StockMovementType.USAGE, 'Serviço Realizado');
     });
};

const linkProductToServiceLocal = (serviceId: string, productId: string, quantity: number) => {
    const consumptions = getProductConsumptionLocal();
    const existingIndex = consumptions.findIndex(c => c.serviceId === serviceId && c.productId === productId);
    if (quantity <= 0) {
      if (existingIndex >= 0) consumptions.splice(existingIndex, 1);
    } else {
      if (existingIndex >= 0) consumptions[existingIndex].quantity = quantity;
      else consumptions.push({ serviceId, productId, quantity });
    }
    set('service_consumption', consumptions);
};

// Commissions Helpers
const getCommissionsLocal = (): Commission[] => get('commissions', []);
const recordCommissionLocal = (professionalId: string, transactionId: string, servicePrice: number, date: string) => {
     const pros = CatalogService.getProfessionals();
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
       status: CommissionStatus.PENDING
     });
     set('commissions', commissions);
};

// Packages Helpers
const getServicePackagesLocal = (): ServicePackage[] => get('service_packages', []);
const saveServicePackagesLocal = (pkgs: ServicePackage[]) => set('service_packages', pkgs);
const getClientPackagesLocal = (clientId: string): ClientPackage[] => {
    const all = get<ClientPackage[]>('client_packages', []);
    return all.filter(p => p.clientId === clientId && new Date(p.expirationDate) > new Date());
};
const buyPackageLocal = (clientId: string, packageTemplate: ServicePackage) => {
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
    addTransactionLocal({
      id: txId, date: new Date().toISOString().split('T')[0],
      description: `Compra Pacote: ${packageTemplate.name}`,
      amount: packageTemplate.price,
      type: TransactionType.INCOME, category: TransactionCategory.PACKAGE_SALE, paymentMethodId: 'pm1'
    });
};
const consumePackageItemLocal = (clientPackageId: string, serviceId: string) => {
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
};

// Loyalty Helpers
const getLoyaltyRewardsLocal = (): LoyaltyReward[] => get('loyalty_rewards', []);
const saveLoyaltyRewardsLocal = (rewards: LoyaltyReward[]) => set('loyalty_rewards', rewards);
const addLoyaltyPointsLocal = (clientId: string, points: number, txId?: string, description?: string) => {
    const users = AuthService.getUsers();
    const userIndex = users.findIndex(u => u.id === clientId);
    if (userIndex >= 0) {
      users[userIndex].loyaltyPoints = (users[userIndex].loyaltyPoints || 0) + points;
      set('users', users);
      
      const current = AuthService.getCurrentUser();
      if (current && current.id === clientId) {
        current.loyaltyPoints = users[userIndex].loyaltyPoints;
        localStorage.setItem('current_user', JSON.stringify(current));
      }

      const history = get<PointsHistory[]>('points_history', []);
      history.push({
        id: Math.random().toString(36).substr(2, 9),
        clientId, transactionId: txId,
        points, type: points > 0 ? PointsHistoryType.EARN : PointsHistoryType.REDEEM,
        date: new Date().toISOString(), description: description || 'Ajuste de pontos'
      });
      set('points_history', history);
    }
};
const getPointsHistoryLocal = (clientId: string): PointsHistory[] => {
      const history = get<PointsHistory[]>('points_history', []);
      return history.filter(h => h.clientId === clientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Promotions Helpers
const getPromotionsLocal = (): Promotion[] => get('promotions', []);
const savePromotionsLocal = (promos: Promotion[]) => set('promotions', promos);
const calculatePriceLocal = (service: Service, dateStr: string, timeStr: string, clientId?: string): { finalPrice: number, discountReason?: string } => {
    let finalPrice = service.price;
    let discountReason = undefined;

    const promos = getPromotionsLocal().filter(p => p.active);
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
      const user = AuthService.getUsers().find(u => u.id === clientId);
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
};

const getReviewsLocal = (): Review[] => get('reviews', []);
const saveReviewsLocal = (reviews: Review[]) => set('reviews', reviews);
const getClientReviewsLocal = (clientId: string): Review[] => {
      const all = get<Review[]>('reviews', []);
      return all.filter(r => r.clientId === clientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// --- Export (Fachada) ---

export const FinanceService = {
  getTransactions: getTransactionsLocal,
  addTransaction: addTransactionLocal,
  
  getPaymentMethods: getPaymentMethodsLocal,
  savePaymentMethods: savePaymentMethodsLocal,

  getProducts: getProductsLocal,
  saveProducts: saveProductsLocal,
  getProductConsumption: getProductConsumptionLocal,
  saveProductConsumption: saveProductConsumptionLocal,
  adjustStock: adjustStockLocal,
  triggerServiceStockConsumption: triggerServiceStockConsumptionLocal,
  linkProductToService: linkProductToServiceLocal,

  getCommissions: getCommissionsLocal,
  recordCommission: recordCommissionLocal,

  getServicePackages: getServicePackagesLocal,
  saveServicePackages: saveServicePackagesLocal,
  getClientPackages: getClientPackagesLocal,
  buyPackage: buyPackageLocal,
  consumePackageItem: consumePackageItemLocal,

  getLoyaltyRewards: getLoyaltyRewardsLocal,
  saveLoyaltyRewards: saveLoyaltyRewardsLocal,
  addLoyaltyPoints: addLoyaltyPointsLocal,
  getPointsHistory: getPointsHistoryLocal,

  getPromotions: getPromotionsLocal,
  savePromotions: savePromotionsLocal,
  calculatePrice: calculatePriceLocal,

  getReviews: getReviewsLocal,
  saveReviews: saveReviewsLocal,
  getClientReviews: getClientReviewsLocal,

  api: {
      getTransactions: async (): Promise<Transaction[]> => {
          if (!isSupabaseConfigured()) return getTransactionsLocal();
          try {
              const { data, error } = await supabase.from('transactions').select('*');
              if (error) throw error;
              if (!data) return [];

              return data.map((t: any) => ({
                  id: t.id,
                  date: t.date,
                  description: t.description,
                  amount: Number(t.amount),
                  type: t.type,
                  category: t.category,
                  appointmentId: t.appointment_id
              }));
          } catch (e) {
              console.warn("Erro ao buscar transações (Cloud):", e);
              return getTransactionsLocal();
          }
      }
  }
};