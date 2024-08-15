export default function productTypesLabel(productype: string): string {
  let result: string;

  switch (productype) {
    case 'ad':
      result = ' per assembled ad';
      break;
    case 'postcard':
      result = ' per recipient mailed';
      break;
    case 'letter':
      result = ' per recipient mailed';
      break;
    default:
      result = ' per recipient mailed';
  }

  return result;
}
