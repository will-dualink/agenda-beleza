
export const Masks = {
  phone: (value: string) => {
    if (!value) return '';
    const numeric = value.replace(/\D/g, '');
    const limit = numeric.slice(0, 11);
    
    if (limit.length <= 10) {
      // (11) 9999-9999
      return limit.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      // (11) 99999-9999
      return limit.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  },

  currency: (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
};
