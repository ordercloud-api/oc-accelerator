import { Code, HStack, Text } from '@chakra-ui/react'
import { FC } from 'react'

interface IDefaultTemplate {
    result: any
}

export const SpecOptionTemplate: FC<IDefaultTemplate> = ({ result }) => {
    return (
        <HStack w="100%" justifyContent="space-between">
            <Text>{result.Value}</Text>
            <Code fontWeight="normal">{result.ID}</Code>
        </HStack>
    )
}
