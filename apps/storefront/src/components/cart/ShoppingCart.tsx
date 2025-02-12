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
  Skeleton,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import CartSkeleton from "./ShoppingCartSkeleton";
import CartSummary from "./ShoppingCartSummary";
import { useShopper } from "@ordercloud/react-sdk";

export const TABS = {
  INFORMATION: 0,
  SHIPPING: 1,
  PAYMENT: 2,
};

export const ShoppingCart = (): JSX.Element => {
  const [submitting, setSubmitting] = useState(false);
  const [tabIndex, setTabIndex] = useState(TABS.INFORMATION);

  const { orderWorksheet, worksheetLoading, deleteCart, submitCart } = useShopper();

  const navigate = useNavigate();
  const toast = useToast();

  const submitOrder = useCallback(async () => {
    setSubmitting(true);
    if (!orderWorksheet?.Order?.ID) return;
    try {
      await submitCart();
      setSubmitting(false);
      navigate(`/order-confirmation?orderID=${orderWorksheet.Order.ID}`);
    } catch (err) {
      console.error("Error submitting order:", err);
      setSubmitting(false);
      toast({
        title: "Error submitting order",
        description:
          "There was an issue submitting your order. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

  }, [navigate, orderWorksheet?.Order?.ID, submitCart, toast]);

  const deleteOrder = useCallback(async () => {
    if (!orderWorksheet?.Order?.ID) return;
    await deleteCart();
  }, [deleteCart, orderWorksheet?.Order?.ID]);

  const handleNextTab = () => {
    setTabIndex((prevIndex) =>
      Math.min(prevIndex + 1, Object.keys(TABS).length - 1)
    );
  };

  const handlePrevTab = () => {
    setTabIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <>
      {worksheetLoading ? (
        <CartSkeleton />
      ) : (
        <>
          {orderWorksheet?.Order &&
          orderWorksheet?.LineItems &&
          orderWorksheet?.LineItems?.length ? (
            <>
              {submitting && (
                <Center
                  boxSize="full"
                  h="100vh"
                  position="absolute"
                  zIndex={1234}
                  background="whiteAlpha.400"
                >
                  <VStack>
                    <Spinner
                      label="submitting order..."
                      thickness="10px"
                      speed=".5s"
                      color="gray.300"
                      opacity=".9"
                      size="xl"
                      zIndex={1235}
                    />
                    <Text color="gray.500">Submitting order...</Text>
                  </VStack>
                </Center>
              )}
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

                        <TabPanel display="flex" flexDirection="column">
                          <VStack
                            alignItems="stretch"
                            mt={3}
                            gap={5}
                            position="relative"
                          >
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
                              <Skeleton
                                rounded="0"
                                w="200px"
                                h="30px"
                                mr="auto"
                              />
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
                    {worksheetLoading ? (
                      <Spinner />
                    ) : (
                      <CartSummary
                        deleteOrder={deleteOrder}
                        order={orderWorksheet?.Order}
                        lineItems={orderWorksheet?.LineItems}
                        promotions={orderWorksheet?.OrderPromotions}
                        onSubmitOrder={submitOrder}
                        tabIndex={tabIndex}
                      />
                    )}
                  </Container>
                </GridItem>
              </Grid>
            </>
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
