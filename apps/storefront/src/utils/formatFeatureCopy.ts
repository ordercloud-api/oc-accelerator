export default function formatFeatureCopy(productcopy: string): string {
  return productcopy.split(',').join('<br />');
}
