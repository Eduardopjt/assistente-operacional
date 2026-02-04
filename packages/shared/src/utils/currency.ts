/**
 * Currency utilities (values stored in cents)
 */

export const formatCurrency = (cents: number): string => {
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and convert to cents
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  const reais = parseFloat(cleaned);
  return Math.round(reais * 100);
};

export const centsToBRL = (cents: number): number => {
  return cents / 100;
};

export const BRLToCents = (reais: number): number => {
  return Math.round(reais * 100);
};
