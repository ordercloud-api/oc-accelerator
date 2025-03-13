import { Button, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";

type CartPaymentPanelProps = {
  submitOrder: () => void;
  submitting: boolean;
};

export const CartPaymentPanel = ({
  submitOrder,
  submitting,
}: CartPaymentPanelProps) => {
  return (
    <>
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
        >
          Embed your payment service iframe
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

      <Button
        alignSelf="flex-end"
        onClick={submitOrder}
        mt={6}
        isDisabled={submitting}
      >
        {submitting ? "Submitting" : "Submit Order"}
      </Button>
    </>
  );
};
