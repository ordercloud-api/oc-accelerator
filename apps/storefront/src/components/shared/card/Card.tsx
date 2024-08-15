/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card as ChakraCard } from '@chakra-ui/react'

function Card(props: { [x: string]: any; variant?: any; children: any }) {
  const { variant, children, ...rest } = props

  return (
    <ChakraCard
      variant="outline"
      {...rest}
    >
      {children}
    </ChakraCard>
  )
}

export default Card
