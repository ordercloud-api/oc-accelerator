/* eslint-disable @typescript-eslint/no-explicit-any */

import { CardBody as ChakraCardBody } from '@chakra-ui/react'

function CardBody(props: { [x: string]: any; variant: any; children?: any }) {
  const { variant, children, ...rest } = props
  return <ChakraCardBody {...rest}>{children}</ChakraCardBody>
}

export default CardBody
