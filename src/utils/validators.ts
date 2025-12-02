// Lightweight runtime validators used across services

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^\d{10,11}$/.test(digits);
}

export function isValidAmount(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

export function isValidDate(dateStr: string): boolean {
  // expects YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !Number.isNaN(new Date(dateStr).getTime());
}

export function isValidTime(timeStr: string): boolean {
  // expects HH:MM
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr);
}

export function validateTransaction(tx: any): { valid: boolean; error?: string } {
  if (!tx) return { valid: false, error: 'Transaction missing' };
  if (typeof tx.amount !== 'number' || !isValidAmount(tx.amount)) return { valid: false, error: 'Invalid amount' };
  if (!tx.description || typeof tx.description !== 'string') return { valid: false, error: 'Invalid description' };
  return { valid: true };
}
