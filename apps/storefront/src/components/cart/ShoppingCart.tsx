import {
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack
} from "@chakra-ui/react";
import { Cart, LineItem, Order, RequiredDeep } from "ordercloud-javascript-sdk";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import CartSkeleton from "./ShoppingCartSkeleton";
import CartSummary from "./ShoppingCartSummary";

export const ShoppingCart = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>();
  const [order, setOrder] = useState<RequiredDeep<Order>>();
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();

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

  const submitOrder = useCallback(async () => {
    if (!order?.ID) return;
    try {
      await Cart.Submit();
      navigate("/order-summary");
    } catch (err) {
      console.log(err);
    }
  }, [navigate, order?.ID]);

  const deleteOrder = useCallback(async () => {
    if (!order?.ID) return;
    await Cart.Delete();

    setOrder(undefined);
    setLineItems(undefined);
  }, [order?.ID]);

  useEffect(() => {
    getOrder();
  }, [getOrder]);

  useEffect(() => {
    getLineItems();
  }, [order, getLineItems]);

  const handleNextTab = () => {
    setTabIndex((prevIndex) => Math.min(prevIndex + 1, 2));
  };
  const handlePrevTab = () => {
    setTabIndex((prevIndex) => Math.min(prevIndex - 1, 2));
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <>
      {loading ? (
        <CartSkeleton />
      ) : (
        <>
          {order && lineItems ? (
            <Grid
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
                  <Heading mb={6}>Checkout</Heading>
                  <Tabs
                    size="sm"
                    index={tabIndex}
                    onChange={handleTabChange}
                    variant="soft-rounded"
                  >
                    <TabList>
                      <Tab>Information</Tab>
                      <Tab>Shipping</Tab>
                      <Tab>Payment</Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel as={VStack} alignItems="stretch">
                        <Stack direction={["column", "row"]} spacing={6}>
                          <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input placeholder="Email" />
                          </FormControl>
                          <FormControl flexBasis="75%">
                            <FormLabel>Phone</FormLabel>
                            <Input placeholder="Phone" />
                          </FormControl>
                        </Stack>
                        <Heading size="md" my={6}>
                          Shipping address
                        </Heading>
                        <Stack direction={["column", "row"]} spacing={6}>
                          <FormControl>
                            <FormLabel>First Name</FormLabel>
                            <Input placeholder="Enter first name" />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Last Name</FormLabel>
                            <Input placeholder="Enter last name" />
                          </FormControl>
                        </Stack>
                        <FormControl>
                          <FormLabel>Company (optional)</FormLabel>
                          <Input placeholder="Enter company name" />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Address</FormLabel>
                          <Input placeholder="Enter address" />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Suburb</FormLabel>
                          <Input placeholder="Enter suburb" />
                        </FormControl>
                        <Stack direction={["column", "row"]} spacing={6}>
                          <FormControl>
                            <FormLabel>State/Territory</FormLabel>
                            <Select placeholder="Select state/territory">
                              <option value="mn">Minnesota</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Postcode</FormLabel>
                            <Input placeholder="Enter postcode" />
                          </FormControl>
                        </Stack>
                        <Button
                          alignSelf="flex-end"
                          onClick={handleNextTab}
                          mt={6}
                        >
                          Continue to shipping
                        </Button>
                      </TabPanel>

                      <TabPanel as={VStack} alignItems="stretch">
                        <Card
                          variant="flat"
                          shadow="none"
                          bgColor="whiteAlpha.800"
                        >
                          <CardBody
                            display="flex"
                            flexDirection="column"
                            gap={6}
                          >
                            <HStack>
                              <Text
                                color="chakra-subtle-text"
                                fontWeight="bold"
                              >
                                Contact
                              </Text>
                              <Text>[EMAIL]</Text>
                              <Button
                                onClick={handlePrevTab}
                                size="xs"
                                variant="outline"
                                ml="auto"
                              >
                                Edit
                              </Button>
                            </HStack>
                            <Divider />
                            <HStack>
                              <Text
                                color="chakra-subtle-text"
                                fontWeight="bold"
                              >
                                Ships to
                              </Text>
                              <Text>[SHIPPING_ADDRESS]</Text>
                              <Button
                                onClick={handlePrevTab}
                                size="xs"
                                variant="outline"
                                ml="auto"
                              >
                                Edit
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>
                        <Heading as="h3" size="sm" my={6}>
                          Shipping method
                        </Heading>
                        <Card
                          variant="flat"
                          shadow="none"
                          bgColor="whiteAlpha.800"
                        >
                          <CardBody
                            display="flex"
                            flexDirection="column"
                            gap="3"
                          >
                            <RadioGroup
                              defaultValue="2"
                              sx={{
                                "& .chakra-radio__label": {
                                  width: "full",
                                },
                              }}
                            >
                              <Stack
                                w="full"
                                gap={0}
                                sx={{
                                  "& .chakra-radio": {
                                    borderBottom: "1px solid",
                                    borderColor: "chakra-border-color",
                                    py: 6,
                                  },
                                  "& .chakra-radio:last-child": {
                                    borderBottom: "none",
                                  },
                                }}
                              >
                                <Radio value="1" display="flex" w="full">
                                  <HStack w="full">
                                    <Text>Pick up in store</Text>
                                    <Text
                                      ml="auto"
                                      fontWeight="bold"
                                      color="chakra-subtle-text"
                                    >
                                      [SHIPPING_COST]
                                    </Text>
                                  </HStack>
                                </Radio>
                                <Radio value="2">
                                  <HStack>
                                    <Text>Standard shipping</Text>
                                    <Text
                                      ml="auto"
                                      fontWeight="bold"
                                      color="chakra-subtle-text"
                                    >
                                      [SHIPPING_COST]
                                    </Text>
                                  </HStack>
                                </Radio>
                                <Radio value="3">
                                  <HStack>
                                    <Text>Express shipping</Text>
                                    <Text
                                      ml="auto"
                                      fontWeight="bold"
                                      color="chakra-subtle-text"
                                    >
                                      [SHIPPING_COST]
                                    </Text>
                                  </HStack>
                                </Radio>
                              </Stack>
                            </RadioGroup>
                          </CardBody>
                        </Card>
                        <Button
                          alignSelf="flex-end"
                          onClick={handleNextTab}
                          mt={6}
                        >
                          Continue to payment
                        </Button>
                      </TabPanel>

                      <TabPanel>
                        <Heading size="lg">Payment</Heading>
                        {/* Add payment form here */}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
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
                    <CartSummary
                      deleteOrder={deleteOrder}
                      order={order}
                      lineItems={lineItems}
                      onSubmitOrder={submitOrder}
                    />
                  )}
                </Container>
              </GridItem>
            </Grid>
          ) : (
            <Center flex="1">
              <VStack mt={-28}>
                <Heading>Cart is empty</Heading>
                <Button as={RouterLink} size="sm" to="/products">
                  Continue shopping
                </Button>
              </VStack>
            </Center>
          )}
        </>
      )}
    </>
  );
};

export default ShoppingCart;
