import { Code, HStack, Text } from '@chakra-ui/react'
import { FC } from 'react'

interface IDefaultTemplate {
  result: any
}

export const DefaultTemplate: FC<IDefaultTemplate> = ({ result }) => {
  return (
    <HStack
      w="100%"
      justifyContent="space-between"
    >
      <Text
        flexShrink={1}
        textOverflow="ellipsis"
        overflow="hidden"
      >
        {result.Name}
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
