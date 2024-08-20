import { Box, Card, CardBody, LinkBox, LinkOverlay, Text, TextProps } from '@chakra-ui/react'
import { Address } from 'ordercloud-javascript-sdk'
import { Link } from 'react-router-dom'

export interface AddressCardProps {
  address: Address
  fontSize?: TextProps['size']
  addressCard?: boolean
}
const AddressCard = ({ address, addressCard, fontSize = '16px' }: AddressCardProps) => {
  if (!address) {
    return (
      <Box
        as="address"
        fontStyle="normal"
      >
        <Text fontSize={fontSize}>John Smith</Text>
        <Text fontSize={fontSize}>123 Sunrise Pointe</Text>
        <Text fontSize={fontSize}>Pleasant Hill, MN 55604</Text>
      </Box>
    )
  }
  if (address && addressCard) {
    return (
      <Card
        as={LinkBox}
        aspectRatio="1.5/1"
      >
        <LinkOverlay
          as={Link}
          href={`my-profile/my-addresses/address-details?addressid=${address.ID}`}
        >
          <CardBody
            w="full"
            width="100%"
            alignItems="flex-start"
            p={4}
          >
            {address.AddressName && (
              <Text
                fontSize="xl"
                mb={4}
                variant="section"
              >
                {address.AddressName}
              </Text>
            )}
            {(address.FirstName || address.LastName) && (
              <Text>{`${address.FirstName} ${address.LastName}`}</Text>
            )}
            <Text>{address.Street1}</Text>
            {address.Street2 && <Text>{address.Street2}</Text>}
            <Text>
              {address.City}, {address.State} {address.Zip}
            </Text>
          </CardBody>
          {/* <CardFooter
            justifyContent="flex-end"
            gap={2}
            px="3"
          >
            <Button
              size="xs"
              variant="ghost"
            >
              Remove
            </Button>
          </CardFooter> */}
        </LinkOverlay>
      </Card>
    )
  }
  return (
    <Box
      as="address"
      fontStyle="normal"
    >
      <Text fontSize={fontSize}>
        {address.FirstName && address.FirstName + ' ' + address.LastName && address.LastName}
      </Text>
      <Text fontSize={fontSize}>{address.Street1}</Text>
      {address.Street2 && <Text fontSize={fontSize}>{address.Street2}</Text>}
      <Text fontSize={fontSize}>
        {address.City}, {address.State} {address.Zip}
      </Text>
    </Box>
  )
}

export default AddressCard
