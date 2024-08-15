export default function formatPoints(amount: number): string {
  const roundednumber = Math.round(amount);
  return roundednumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
