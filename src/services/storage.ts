import { AuthService } from './auth';
import { CatalogService } from './catalog';
import { AppointmentService } from './appointments';
import { FinanceService } from './finance';
import { timeToMinutes, minutesToTime } from './persistence';

// Re-export helpers
export { timeToMinutes, minutesToTime };

/**
 * StorageService (Facade)
 * 
 * Este serviço agora atua como uma fachada centralizada, agregando
 * os módulos especializados (Auth, Catalog, Appointments, Finance).
 * 
 * Isso mantém a compatibilidade com o restante da aplicação que espera
 * importar tudo de 'StorageService', enquanto o código real está modularizado.
 */
export const StorageService = {
  // --- Auth Module ---
  ...AuthService,

  // --- Catalog Module (Services & Pros) ---
  ...CatalogService,

  // --- Appointments Module ---
  ...AppointmentService,

  // --- Finance, Inventory & Loyalty Module ---
  ...FinanceService,

  // --- API Wrapper (Bridge) ---
  api: {
    // Read
    getServices: CatalogService.api.getServices,
    getProfessionals: CatalogService.api.getProfessionals,
    
    // Write (Catalog)
    upsertService: CatalogService.api.upsertService,
    deleteService: CatalogService.api.deleteService,
    upsertProfessional: CatalogService.api.upsertProfessional,
    deleteProfessional: CatalogService.api.deleteProfessional,

    // Write (Appointment)
    createAppointment: AppointmentService.api.createAppointment
  }
};