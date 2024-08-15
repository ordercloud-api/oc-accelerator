export default function productTypes(productype: string): string {
  let result: string;

  switch (productype) {
    case 'ad':
      result = "<Icon as={HiOutlineHeart} fontSize='18px' />";
      break;
    case 'postcard':
      result = "<Icon as={HiOutlineHeart} fontSize='18px' />";
      break;
    case 'letter':
      result = "<Icon as={HiOutlineHeart} fontSize='18px' />";
      break;
    default:
      result = "<Icon as={HiOutlineHeart} fontSize='18px' />";
  }

  return result;
}
