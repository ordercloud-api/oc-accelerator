import { Code, HStack, Text } from '@chakra-ui/react'
import { FC } from 'react'

interface IDefaultTemplate {
  result: any
}

export const LocaleTemplate: FC<IDefaultTemplate> = ({ result }) => {
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
        {`${result.Currency} (${result.Language})`}
      </Text>
      <Code fontWeight="normal">{result.ID}</Code>
    </HStack>
  )
}
