import {
    Container,
    Divider,
    Grid,
    GridItem,
    HStack,
    Heading,
    Icon,
    Spinner,
    Text,
    VStack
} from "@chakra-ui/react";
import { Cart, LineItem, Order, RequiredDeep } from "ordercloud-javascript-sdk";
import { useCallback, useEffect, useState } from "react";
import { TbCheckbox } from "react-icons/tb";

const OrderConfirmation = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [, setLineItems] = useState<LineItem[]>();
  const [order, setOrder] = useState<RequiredDeep<Order>>();

  const getOrder = useCallback(async () => {
    const result = await Cart.Get();
    setOrder(result);
    setLoading(false);
  }, []);

  const getLineItems = useCallback(async () => {
    if (!order?.ID) return;
    const result = await Cart.ListLineItems();
    setLineItems(result.Items);
    setLoading(false);
  }, [order]);

  useEffect(() => {
    getOrder();
  }, [getOrder]);

  useEffect(() => {
    getLineItems();
  }, [order, getLineItems]);

  return (
    <>
      <Grid
        my={-8} mx={8} // need to override the margin from #outletWrapper
        gridTemplateColumns={{ md: "3fr 2fr" }}
        w="full"
        justifyItems="stretch"
        flex="1"
      >
        <GridItem alignSelf="flex-end" h="full">
          <Container
            maxW="container.lg"
            mx="0"
            ml="auto"
            p={{ base: 6, lg: 12 }}
          >
            <VStack alignItems="flex-start" flex="1" minH="500px">
              <HStack gap="3" alignItems="center">
                <Icon
                  layerStyle="icon.subtle"
                  boxSize="icon.2xl"
                  color="primary"
                  as={TbCheckbox}
                />
                <VStack alignItems="flex-start" gap="0">
                  <Heading size="xl">Order confirmed</Heading>
                  <Text color="chakra-subtle-text">Order #0001</Text>
                </VStack>
              </HStack>
              <Divider my="3" />
              <VStack justifyContent="flex-start" alignItems="flex-start">
                <HStack alignItems="flex-start">
                  <VStack alignItems="flex-start" gap="0">
                    <Text fontWeight="bold">[FIRSTNAME] [LASTNAME]</Text>
                    <Text>[ADDRESS1] [ADDRESS2]</Text>
                    <Text>[CITY] [STATE] [ZIP]</Text>
                    <Text mt="3">[PHONE] | [EMAIL]</Text>
                  </VStack>
                </HStack>
              </VStack>
              <Divider my="3" />
              <Text>[SHIPPING METHOD]</Text>
              <Text>[PAYMENT SUMMARY]</Text>
            </VStack>
            <Divider my="3" />
            <HStack mt="auto">
              <Text color="chakra-subtle-text">Need help with your order?</Text>
              <Text
                color="primary"
                fontWeight="bold"
                textDecoration="underline"
              >
                Contact us
              </Text>
            </HStack>
          </Container>
        </GridItem>

        <GridItem bgColor="blackAlpha.100" h="full">
          <Container
            maxW="container.sm"
            mx="0"
            mr="auto"
            p={{ base: 6, lg: 12 }}
          >
            {loading ? (
              <Spinner />
            ) : (
              <>{console.log(order)}</>
              //   <OrderSummary
              //     order={order}
              //   />
            )}
          </Container>
        </GridItem>
      </Grid>
    </>
  );
};

export default OrderConfirmation;
