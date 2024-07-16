import { Code, HStack, Text } from '@chakra-ui/react'
import { FC } from 'react'

interface IDefaultTemplate {
    result: any
}

export const AddressTemplate: FC<IDefaultTemplate> = ({ result }) => {
    return (
        <HStack
            as="address"
            fontStyle="normal"
            w="100%"
            justifyContent="space-between"
        >
            <Text flexShrink={1} textOverflow="ellipsis" overflow="hidden">
                {result.AddressName && (
                    <>
                        {result.AddressName}
                        <br />
                    </>
                )}
                {`${result.Street1}${
                    result.Street2 ? ` ${result.Street2}` : ''
                }`}
                <br />
                {`${result.City}, ${result.State} ${result.Zip}`}
                {result.Phone && (
                    <>
                        <br />
                        {result.Phone}
                    </>
                )}
            </Text>
            <Code fontWeight="normal">{result.ID}</Code>
        </HStack>
    )
}
