// utils/formatters.js

/**
 * Converte qualquer número para moeda brasileira com vírgula:
 * Exemplo: 1250.5 -> "R$ 1.250,50"
 */
export function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Converte data técnica (YYYY-MM-DD) para padrão brasileiro (DD/MM/AAAA):
 * Exemplo: "2026-11-06" -> "06/11/2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  // Se já estiver com barra (ex: 06/11/2026)
  if (String(dateString).includes('/')) return dateString;

  const parts = String(dateString).split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  return dateString;
}