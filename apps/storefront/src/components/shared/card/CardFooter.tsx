/* eslint-disable @typescript-eslint/no-explicit-any */

import { Box, useStyleConfig } from '@chakra-ui/react';

function CardFooter(props: { [x: string]: any; variant: any; children: any }) {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig('CardFooter', { variant });
  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  );
}

export default CardFooter;
