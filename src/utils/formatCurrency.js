export default function formatCurrency(amount, locale = undefined, currency = 'USD') {
  const n = Number(amount);
  if (Number.isNaN(n)) return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
}
