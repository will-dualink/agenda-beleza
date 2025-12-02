/**
 * Formatting utilities for common data types
 */

export const masks = {
  /**
   * Format number as currency (Brazilian Real)
   */
  currency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  },

  /**
   * Format phone number (Brazilian)
   */
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      // (XX) 9XXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      // (XX) XXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return value;
  },

  /**
   * Format CPF (Brazilian ID)
   */
  cpf: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return value;
  },

  /**
   * Format CNPJ (Brazilian Business ID)
   */
  cnpj: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return value;
  },

  /**
   * Format date (YYYY-MM-DD to DD/MM/YYYY)
   */
  date: (value: string): string => {
    if (!value) return '';
    
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  },

  /**
   * Format date and time
   */
  dateTime: (value: string): string => {
    if (!value) return '';
    
    try {
      const date = new Date(value);
      return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return value;
    }
  },

  /**
   * Format time (HH:MM:SS to HH:MM)
   */
  time: (value: string): string => {
    if (!value) return '';
    
    const parts = value.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    
    return value;
  },

  /**
   * Format percentage
   */
  percentage: (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  },

  /**
   * Format number with thousands separator
   */
  number: (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  /**
   * Format text to title case
   */
  titleCase: (value: string): string => {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Truncate text with ellipsis
   */
  truncate: (value: string, length: number = 50): string => {
    if (value.length <= length) return value;
    return value.substring(0, length) + '...';
  },

  /**
   * Format file size
   */
  fileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },

  /**
   * Format duration in seconds to HH:MM:SS
   */
  duration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  relativeTime: (date: string | Date): string => {
    const now = new Date();
    const then = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - then.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return 'agora mesmo';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} minuto${Math.floor(diffSecs / 60) > 1 ? 's' : ''} atrás`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hora${Math.floor(diffSecs / 3600) > 1 ? 's' : ''} atrás`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)} dia${Math.floor(diffSecs / 86400) > 1 ? 's' : ''} atrás`;

    return masks.date(date instanceof Date ? date.toISOString().split('T')[0] : date);
  },

  /**
   * Extract number from formatted string
   */
  unformat: (value: string): number => {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
};
