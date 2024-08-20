import { ResponsiveValue } from '@chakra-ui/styled-system';

export default function formatChakraString(inputstring: string): ResponsiveValue<number> {
  //const range = { inputstring };
  //const styleObjects = inputstring.split(',');

  const baseInt = 1;
  const smInt = 1;
  const mdInt = 2;
  const lgInt = 4;
  const xlInt = 4;

  console.log(inputstring);
  // for (const currentStyles of styleObjects) {
  //   {
  //     {
  //       const seperatedStyle = currentStyles.split(':');
  //       for (const style of seperatedStyle) {
  //         {
  //           console.log(style);
  //         }
  //       }
  //     }
  //   }
  //   [];
  // }
  // {
  //   styleObjects.map((selectedItem: { Item: any }) => {
  //     baseInt = selectedItem.Item;
  //   });

  //   {
  //     styleObjects.map((selectedItem: StyleBaseObjects) => (
  //       <li key={selectedItem.id}>{selectedItem.name}</li>
  //     ));
  //   }
  // }
  // for (let i = 0; i < styleObjects.length; i++) {
  //   {styleObjects.map((person) => (
  //     baseInt = parseInt({base})
  //   ))}

  const range = { base: baseInt, sm: smInt, md: mdInt, lg: lgInt, xl: xlInt };
  return range;

  //base: 2
  //sm: 2
  //md: 4
  //lg: 4
  //xl: 4
}
// interface StyleBaseObjects {
//   base: string;
//   sm: string;
//   md: string;
//   lg: string;
//   xl: string;
// }
