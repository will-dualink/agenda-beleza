/**
 * Supabase client configuration and initialization
 */

// Mock Supabase client for local development
// Replace with actual Supabase client in production

let supabaseInstance: any = null;

/**
 * Initialize Supabase client (mock version for development)
 */
export const initSupabase = (url?: string, key?: string) => {
  // In production, use:
  // import { createClient } from '@supabase/supabase-js';
  // supabaseInstance = createClient(url!, key!);
  
  if (!url || !key) {
    console.warn('Supabase not configured. Using local storage only.');
    return null;
  }

  // Mock client for development
  supabaseInstance = {
    from: (table: string) => ({
      select: (columns?: string) => mockQuery(table, 'select', columns),
      insert: (data: any) => mockQuery(table, 'insert', data),
      update: (data: any) => mockQuery(table, 'update', data),
      delete: () => mockQuery(table, 'delete'),
      upsert: (data: any, options?: any) => mockQuery(table, 'upsert', data)
    }),
    auth: {
      signInWithPassword: (creds: any) => mockAuth('signIn', creds),
      signUp: (creds: any) => mockAuth('signUp', creds),
      signOut: () => mockAuth('signOut')
    }
  };

  return supabaseInstance;
};

/**
 * Get Supabase instance
 */
export const getSupabase = () => {
  if (!supabaseInstance) {
    console.warn('Supabase not initialized');
  }
  return supabaseInstance;
};

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  const key = (import.meta as any).env?.VITE_SUPABASE_KEY;
  
  if (!url || !key) {
    return false;
  }

  // If we have credentials, try to initialize
  if (!supabaseInstance) {
    initSupabase(url, key);
  }

  return supabaseInstance !== null;
};

/**
 * Mock query for development
 */
const mockQuery = (table: string, operation: string, data?: any) => {
  return {
    eq: (column: string, value: any) => ({
      single: async () => ({ data: null, error: null }),
      async: async () => ({ data: null, error: null })
    }),
    select: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    upsert: async () => ({ data: null, error: null })
  };
};

/**
 * Mock auth operations for development
 */
const mockAuth = (operation: string, creds?: any) => {
  return {
    async: async () => ({
      data: {
        user: {
          id: 'mock-user-id',
          email: creds?.email,
          user_metadata: creds?.options?.data
        }
      },
      error: null
    })
  };
};

/**
 * Actual Supabase export (use this in your app)
 */
export const supabase = getSupabase() || {};

/**
 * Initialize on module load
 */
if (typeof window !== 'undefined') {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  const key = (import.meta as any).env?.VITE_SUPABASE_KEY;
  
  if (url && key) {
    try {
      // Try to use real Supabase
      // import { createClient } from '@supabase/supabase-js';
      // supabaseInstance = createClient(url, key);
      
      // For now, initialize mock
      initSupabase(url, key);
    } catch (error) {
      console.warn('Failed to initialize Supabase:', error);
    }
  }
}
