import { Box, Code, HStack, Text } from '@chakra-ui/react'
import { sortBy } from 'lodash'
import { PriceBreak, PriceSchedule } from 'ordercloud-javascript-sdk'
import { FC } from 'react'

interface IDefaultTemplate<T = any> {
  result: T
}

const renderPrice = (price: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

const PriceRange: FC<{ priceBreaks: PriceBreak[]; currency?: string }> = ({
  priceBreaks
}) => {
  if (!priceBreaks.length)
    return (
      <Text
        width="150px"
        align="right"
      >
        N/A
      </Text>
    )
  const sortedPrices = sortBy(
    priceBreaks.map((pb) => pb.Price),
    (p) => p
  )
  const lowPrice = renderPrice(sortedPrices[0]!)
  const highPrice = renderPrice(sortedPrices[sortedPrices.length - 1]!)
  return (
    <Text
      fontWeight="bold"
      textColor="green"
      width="150px"
      align="right"
    >
      {lowPrice !== highPrice ? `${lowPrice} - ${highPrice}` : lowPrice}
    </Text>
  )
}

export const PriceScheduleTemplate: FC<IDefaultTemplate<PriceSchedule>> = ({ result }) => {
  return (
    <HStack
      fontStyle="normal"
      w="100%"
      justifyContent="space-between"
    >
      <Text
        width="150px"
        textOverflow="ellipsis"
        overflow="hidden"
      >
        {result.Name}
      </Text>

      <Box flexGrow={1}>
        <Code fontWeight="normal">{result.ID}</Code>
      </Box>
      <Text
        width="50px"
        textOverflow="ellipsis"
        overflow="hidden"
      >
        {result.Currency || 'USD'}
      </Text>
      <PriceRange priceBreaks={result.PriceBreaks!} />
    </HStack>
  )
}
