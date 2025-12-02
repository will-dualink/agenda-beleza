// Global ambient declarations to reduce initial tsc noise before installing @types

declare module 'lucide-react';
declare module '@supabase/supabase-js';

declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_RESEND_API_KEY?: string;
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_KEY?: string;
    VITE_GEMINI_API_KEY?: string;
  }
}

// Minimal JSX declarations so tsc won't error if @types/react not installed yet
declare namespace JSX {
  interface Element {}
  interface IntrinsicElements { [elemName: string]: any }
}
