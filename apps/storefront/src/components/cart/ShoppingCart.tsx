/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Divider,
  HStack,
  Heading,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Cart, LineItem, Order, RequiredDeep } from "ordercloud-javascript-sdk";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import formatPrice from "../../utils/formatPrice";
import OcCurrentOrderLineItemList from "./OcCurrentOrderLineItemList";

export const ShoppingCart = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>();
  const [order, setOrder] = useState<RequiredDeep<Order>>();
  const navigate = useNavigate();

  const getOrder = useCallback(async () => {
    const result = await Cart.Get();
    setOrder(result);
  }, []);

  const getLineItems = useCallback(async () => {
    if (!order?.ID) return;
    const result = await Cart.ListLineItems();
    setLineItems(result.Items);
    setLoading(false)
  }, [order]);

  const deleteOrder = useCallback(async () => {
    if (!order?.ID) return;
    await Cart.Delete();

    setOrder(undefined);
    setLineItems(undefined);
  }, [order]);

  const submitOrder = useCallback(async () => {
    if (!order?.ID) return;
    try {
      await Cart.Submit();
      navigate("/order-summary");
    } catch (err) {
      console.log(err);
    }
  }, [navigate, order?.ID]);

  useEffect(() => {
    getOrder();
  }, [getOrder]);

  useEffect(() => {
    getLineItems();
  }, [order, getLineItems]);

  const handleLineItemChange = useCallback(
    (newLi: LineItem) => {
      setLineItems((items) => {
        return items?.map((li) => {
          if (li.ID === newLi.ID) {
            return newLi;
          }
          return li;
        });
      });
    },
    [setLineItems]
  );

  return loading ? (
    <Center h="100%">
    <Spinner size="xl" thickness="10px" />
  </Center>
  ) : (
    <Stack
      direction={{ base: "column", xl: "row" }}
      gap={12}
      mt={"-1rem"}
      h="calc(105% + 1rem)"
    >
      <VStack
        flexGrow="1"
        alignItems="flex-start"
        justifyContent="flex-start"
        maxW="container.xl"
        minW="container.md"
        boxSize="full"
        pt={14}
      >
        <Container
          maxW="container.lg"
          mx={0}
          ml="auto"
          as={VStack}
          alignItems="flex-start"
        >
          <Heading size="md" color="chakra-subtle-text">
            Shipping
          </Heading>
          <Card
            w="full"
            minH="200"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontFamily="monospace" textTransform="uppercase">
              shipping address form here
            </Text>
          </Card>
          <Heading size="md" color="chakra-subtle-text" mt={8}>
            Payment
          </Heading>
          <Card
            w="full"
            minH="200"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontFamily="monospace">IFRAME EMBED GOES HERE</Text>
          </Card>
        </Container>
      </VStack>
      <VStack
        p={12}
        alignItems="flex-start"
        bgColor="gray.100"
        h="100%"
        flexGrow="1"
        maxW="full"
        minW="container.md"
      >
        <Container w="full" mx={0} maxW="container.lg" pr={{ xl: "24" }}>
          <HStack
            w="full"
            justifyContent="space-between"
            borderBottom="1px solid"
            pb={4}
            mb={4}
            borderColor="chakra-border-color"
          >
            <Button variant="link" as={RouterLink} to="/products" size="xs">
              Continue shopping
            </Button>
            {lineItems?.length !== 0 && (
              <Button
                type="button"
                onClick={deleteOrder}
                variant="outline"
                size="xs"
              >
                Clear cart
              </Button>
            )}
          </HStack>
          {lineItems?.length !== 0 ? (
            <OcCurrentOrderLineItemList
              lineItems={lineItems}
              emptyMessage="Your cart is empty"
              onChange={handleLineItemChange}
              editable
            />
          ) : (
            <Spinner />
          )}
          <Divider my={4} />
          {/* Cart Summary  */}
          {lineItems && (
            <Card
              order={{ base: -1, lg: 1 }}
              variant="outline"
              borderColor="transparent"
              bgColor="transparent"
              w="full"
              p={0}
            >
              <CardBody
                as={Stack}
                direction={{ base: "row", lg: "column" }}
                gap={6}
                w="full"
                alignItems={{ base: "center", lg: "flex-start" }}
              >
                <>
                  {order?.Subtotal && (
                    <HStack w="full" justifyContent="space-between">
                      <Heading as="h3" size="md" fontWeight="normal">
                        Subtotal (
                        {lineItems
                          ?.map((li) => li?.Quantity || 0)
                          .reduce(
                            (accumulator, currentValue) =>
                              accumulator + currentValue,
                            0
                          )}{" "}
                        items):
                      </Heading>
                      <Text fontWeight={700} display="inline">
                        {formatPrice(order.Subtotal)}
                      </Text>
                    </HStack>
                  )}
                </>
                <Button
                  mt="auto"
                  onClick={submitOrder}
                  size={{ base: "sm", lg: "lg" }}
                  fontSize="lg"
                  colorScheme="primary"
                  w={{ lg: "full" }}
                  _hover={{ textDecoration: "none" }}
                >
                  Submit Order
                </Button>
              </CardBody>
            </Card>
          )}
        </Container>
      </VStack>
    </Stack>
  );
};
