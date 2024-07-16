import { Code, HStack, Text } from '@chakra-ui/react'
import { FC } from 'react'

interface IDefaultTemplate {
  result: any
}

export const ClientIDTemplate: FC<IDefaultTemplate> = ({ result }) => {
  return (
    <HStack
      w="100%"
      justifyContent="space-between"
    >
      <Text
        flexShrink={0}
        overflow="hidden"
      >
        {result.AppName}
      </Text>
      <Code
        overflow="hidden"
        textOverflow="ellipsis"
        flexShrink={1}
        fontWeight="normal"
      >
        {result.ID}
      </Code>
    </HStack>
  )
}
