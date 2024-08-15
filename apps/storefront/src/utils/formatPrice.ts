export default function formatPrice(amount?: number): string {
  if (typeof amount !== 'number') return "";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
  }).format(amount);
}
