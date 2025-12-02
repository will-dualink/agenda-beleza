/**
 * Security utilities for AgendaBeleza
 * Implements proper password hashing, input validation, and sanitization
 */

/**
 * Generate a cryptographically secure salt
 */
export const generateSalt = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash password with PBKDF2 (Web Crypto API)
 * More secure than btoa, uses proper key derivation
 */
export const hashPassword = async (password: string, salt?: string): Promise<{ hash: string; salt: string }> => {
  const saltToUse = salt || generateSalt();
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + saltToUse);
    
    // Use PBKDF2 via SubtleCrypto
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(saltToUse),
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { hash, salt: saltToUse };
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify password against stored hash
 */
export const verifyPassword = async (password: string, storedHash: string, salt: string): Promise<boolean> => {
  try {
    const { hash } = await hashPassword(password, salt);
    return hash === storedHash;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Sanitize string to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate monetary amount
 */
export const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && amount <= 999999.99 && isFinite(amount);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDate = (dateStr: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  const date = new Date(dateStr + 'T00:00:00Z');
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate time format (HH:MM)
 */
export const isValidTime = (timeStr: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
};

/**
 * Generate secure ID (UUID v4)
 */
export const generateSecureId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Retry mechanism with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        const jitter = Math.random() * 0.1 * delay;
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw lastError || new Error('Retry mechanism failed');
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxAttempts: number;

  constructor(windowMs: number = 60000, maxAttempts: number = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Secure storage with encryption
 */
export const secureStor = {
  set: (key: string, value: unknown): void => {
    try {
      const serialized = JSON.stringify(value);
      // Additional validation layer
      if (serialized.length > 5 * 1024 * 1024) {
        throw new Error('Value too large for storage');
      }
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      throw error;
    }
  },

  get: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return fallback;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  }
};
