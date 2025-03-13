import { HStack, Link, Skeleton, Text, VStack } from "@chakra-ui/react";

export const Stripe = () => {
  return (
    <VStack alignItems="stretch" mt={3} gap={5} position="relative">
      <Text
        zIndex={2}
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        fontSize="5xl"
        color="blackAlpha.300"
        backgroundColor="whiteAlpha.400"
        backdropFilter="auto"
        backdropBlur="2px"
        px="6"
        whiteSpace="nowrap"
        textAlign="center"
      >
        <Text display="block" as="span">Embed your Stripe payment service</Text>
        <Link fontSize="xl" color="primary.500" isExternal href="https://docs.stripe.com/payments/payment-element">
          View docs
        </Link>
      </Text>
      <HStack justifyContent="space-between" gap={5}>
        <Skeleton rounded="0" w="200px" h="30px" mr="auto" />
        <Skeleton rounded="0" w="100px" h="30px" />
        <Skeleton rounded="0" w="100px" h="30px" />
        <Skeleton rounded="0" w="100px" h="30px" />
        <Skeleton rounded="0" w="100px" h="30px" />
      </HStack>

      <Skeleton rounded="0" w="full" h="40px" />
      <Skeleton rounded="0" w="full" h="40px" />

      <HStack justifyContent="space-between" gap={5}>
        <Skeleton rounded="0" w="full" h="40px" />
        <Skeleton rounded="0" w="full" h="40px" />
      </HStack>
    </VStack>
  );
};
