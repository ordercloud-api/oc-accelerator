/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildStylesObj(styles: string) {
  return (
    styles
      .replace(/\s+/g, '') // remove all whitespace
      // .replace(/||+/g, '|') // ensure no duplicate pipes
      .split('|')
      .reduce((stylesObj: any, current) => {
        // build up styles object from constituent part
        if (current.includes('=')) {
          const [key, val] = current.split('=');
          stylesObj[key] = val;
        }
        return stylesObj;
      }, {})
  );
}
