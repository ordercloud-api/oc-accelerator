import { Code, HStack, Text } from '@chakra-ui/react'
import { FC } from 'react'

interface IDefaultTemplate {
    result: any
}

export const UserTemplate: FC<IDefaultTemplate> = ({ result }) => {
    return (
        <HStack w="100%" justifyContent="space-between">
            <Text flexShrink={1} textOverflow="ellipsis" overflow="hidden">
                {result.FirstName} {result.LastName}
            </Text>
            <Code fontWeight="normal">{result.ID}</Code>
        </HStack>
    )
}
