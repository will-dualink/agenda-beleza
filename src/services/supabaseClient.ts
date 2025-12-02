/**
 * Supabase client configuration and initialization
 */

import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

/**
 * Initialize Supabase client
 */
export const initSupabase = (url?: string, key?: string) => {
  if (!url || !key) {
    console.warn('Supabase not configured. Using local storage only.');
    return null;
  }

  try {
    // Create real Supabase client
    supabaseInstance = createClient(url, key);
    console.log('✅ Supabase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    supabaseInstance = null;
  }

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
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  
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
 * Initialize on module load
 */
if (typeof window !== 'undefined') {
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  
  if (url && key) {
    initSupabase(url, key);
  }
}

/**
 * Actual Supabase export (use this in your app)
 */
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const instance = getSupabase();
    if (!instance) {
      console.error('Supabase not initialized');
      return undefined;
    }
    return instance[prop];
  }
});
