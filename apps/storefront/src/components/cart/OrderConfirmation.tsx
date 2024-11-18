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
  VStack,
} from "@chakra-ui/react";
import {
  Address,
  LineItem,
  LineItems,
  Me,
  Order,
  Orders,
  RequiredDeep,
} from "ordercloud-javascript-sdk";
import { useCallback, useEffect, useState } from "react";
import { TbCheckbox } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import OrderSummary from "./OrderSummary";

const OrderConfirmation = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [order, setOrder] = useState<RequiredDeep<Order>>();
  const [shippingAddress, setShippingAddress] = useState<Address>();
  const location = useLocation();

  const getOrder = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get("orderID");

    if (!orderId) {
      console.error("Order ID not found in URL");
      setLoading(false);
      return;
    }

    const result = await Orders.Get("Outgoing", orderId);
    setOrder(result);
    setLoading(false);
  }, [location.search]);

  const getLineItems = useCallback(async () => {
    if (!order?.ID) return;
    const result = await LineItems.List("Outgoing", order.ID);
    setLineItems(result.Items);
  }, [order]);

  const getShippingAddress = useCallback(async () => {
    if (!order?.ShippingAddressID) return;
    const addressResult = await Me.GetAddress(order.ShippingAddressID);
    setShippingAddress(addressResult);
  }, [order]);

  useEffect(() => {
    getOrder();
  }, [getOrder]);

  useEffect(() => {
    getLineItems();
    getShippingAddress();
  }, [order, getLineItems, getShippingAddress]);

  if (loading) {
    return (
      <Container maxW="container.lg" centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxW="container.lg" centerContent>
        <Heading>Order not found</Heading>
        <Text>
          We couldn't find the order information. Please check the URL and try
          again.
        </Text>
      </Container>
    );
  }

  return (
    <Grid
      gridTemplateColumns={{ md: "3fr 2fr" }}
      w="full"
      h="100vh"
      justifyItems="stretch"
      flex="1"
    >
      <GridItem alignSelf="flex-end" h="full">
        <Container maxW="container.lg" mx="0" ml="auto" p={{ base: 6, lg: 12 }}>
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
                <Text color="chakra-subtle-text">Order ID: {order.ID}</Text>
              </VStack>
            </HStack>
            <Divider my="3" />
            <VStack justifyContent="flex-start" alignItems="flex-start">
              <HStack alignItems="flex-start">
                <VStack alignItems="flex-start" gap="0">
                  <Text fontWeight="bold">
                    {order.FromUser?.FirstName} {order.FromUser?.LastName}
                  </Text>
                  {shippingAddress && (
                    <>
                      <Text>
                        {shippingAddress.Street1} {shippingAddress.Street2}
                      </Text>
                      <Text>
                        {shippingAddress.City}, {shippingAddress.State}{" "}
                        {shippingAddress.Zip}
                      </Text>
                    </>
                  )}
                  <Text mt="3">
                    {order.FromUser?.Phone}
                    {order.FromUser?.Phone && "|"} {order.FromUser?.Email}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
            <Divider my="3" />
            <Text>
              Shipping Method:{" "}
              {order.ShippingCost > 0 ? "Standard Shipping" : "Free Shipping"}
            </Text>
            <Text>
              Payment Method: {order.xp?.PaymentMethod || "Not specified"}
            </Text>
          </VStack>
        </Container>
      </GridItem>
      <GridItem bgColor="blackAlpha.100" h="full">
        <Container maxW="container.sm" mx="0" mr="auto" p={{ base: 6, lg: 12 }}>
          <OrderSummary order={order} lineItems={lineItems} />
        </Container>
      </GridItem>
    </Grid>
  );
};

export default OrderConfirmation;
