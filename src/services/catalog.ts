import { Service, Professional } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { get, set, INITIAL_SERVICES, INITIAL_PROFESSIONALS } from './persistence';

// --- Local Helpers (Defined first) ---

const getServicesLocal = (): Service[] => get('services', INITIAL_SERVICES);
const saveServicesLocal = (services: Service[]) => set('services', services);
const getProsLocal = (): Professional[] => get('professionals', INITIAL_PROFESSIONALS);
const saveProsLocal = (pros: Professional[]) => set('professionals', pros);

// --- Export ---

export const CatalogService = {
  getServices: getServicesLocal,
  saveServices: saveServicesLocal,
  getProfessionals: getProsLocal,
  saveProfessionals: saveProsLocal,

  api: {
    getServices: async (): Promise<Service[]> => {
      if (!isSupabaseConfigured()) return getServicesLocal();
      
      try {
        const { data, error } = await supabase.from('services').select('*');
        if (error) throw error;
        if (!data || data.length === 0) return getServicesLocal();

        return data.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: Number(s.price),
          durationMinutes: s.duration_minutes,
          bufferMinutes: s.buffer_minutes,
          imageUrl: s.image_url
        }));
      } catch (err) {
        console.warn('Supabase fetch error, using local data.', err);
        return getServicesLocal();
      }
    },

    upsertService: async (service: Service) => {
        // Helper interno para salvar local
        const saveToLocalCache = () => {
            const current = getServicesLocal();
            const index = current.findIndex(s => s.id === service.id);
            if (index >= 0) current[index] = service;
            else current.push(service);
            saveServicesLocal(current);
        };

        if (!isSupabaseConfigured()) { 
            saveToLocalCache(); 
            return { success: true, local: true }; 
        }

        try {
            const { error } = await supabase.from('services').upsert({
                id: service.id,
                name: service.name,
                description: service.description,
                price: service.price,
                duration_minutes: service.durationMinutes,
                buffer_minutes: service.bufferMinutes,
                image_url: service.imageUrl
            });

            if (error) throw error;
            
            saveToLocalCache();
            return { success: true };
        } catch (err) {
            console.error("Erro ao salvar serviço na nuvem:", err);
            saveToLocalCache();
            return { success: true, local: true, error: err };
        }
    },

    deleteService: async (id: string) => {
        if (isSupabaseConfigured()) {
            try {
                await supabase.from('services').delete().eq('id', id);
            } catch (e) {
                console.error("Erro ao excluir da nuvem", e);
            }
        }
        const current = getServicesLocal();
        saveServicesLocal(current.filter(s => s.id !== id));
        return { success: true };
    },

    getProfessionals: async (): Promise<Professional[]> => {
      if (!isSupabaseConfigured()) return getProsLocal();

      try {
        const { data, error } = await supabase.from('professionals').select('*');
        if (error) throw error;
        if (!data || data.length === 0) return getProsLocal();

        return data.map((p: any) => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatar_url,
          commissionPercentage: Number(p.commission_percentage),
          specialties: p.specialties || [],
          schedule: p.schedule
        }));
      } catch (err) {
        console.warn('Supabase fetch error, using local data.');
        return getProsLocal();
      }
    },

    upsertProfessional: async (pro: Professional) => {
        const saveToLocalCache = () => {
            const current = getProsLocal();
            const index = current.findIndex(p => p.id === pro.id);
            if (index >= 0) current[index] = pro;
            else current.push(pro);
            saveProsLocal(current);
        };

        if (!isSupabaseConfigured()) { 
            saveToLocalCache(); 
            return { success: true, local: true }; 
        }

        try {
            const { error } = await supabase.from('professionals').upsert({
                id: pro.id,
                name: pro.name,
                avatar_url: pro.avatarUrl,
                commission_percentage: pro.commissionPercentage,
                specialties: pro.specialties,
                schedule: pro.schedule // JSONB
            });

            if (error) throw error;

            saveToLocalCache();
            return { success: true };
        } catch (err) {
            console.error("Erro ao salvar profissional:", err);
            saveToLocalCache();
            return { success: true, local: true, error: err };
        }
    },

    deleteProfessional: async (id: string) => {
        if (isSupabaseConfigured()) {
            try {
                await supabase.from('professionals').delete().eq('id', id);
            } catch (e) { console.error(e); }
        }
        const current = getProsLocal();
        saveProsLocal(current.filter(p => p.id !== id));
        return { success: true };
    }
  }
};