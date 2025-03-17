import {
  Button,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useShopper } from "@ordercloud/react-sdk";
import {
  Address,
  IntegrationEvents,
  Order,
  Orders,
  RequiredDeep,
} from "ordercloud-javascript-sdk";
import { useCallback, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { CartInformationPanel } from "./cart-panels/CartInformationPanel";
import { CartPaymentPanel } from "./cart-panels/CartPaymentPanel";
import CartSkeleton from "./ShoppingCartSkeleton";
import CartSummary from "./ShoppingCartSummary";
import CartShippingPanel from "./cart-panels/CartShippingPanel";

export const TABS = {
  INFORMATION: 0,
  SHIPPING: 1,
  PAYMENT: 2,
};

export const ShoppingCart = (): JSX.Element => {
  const [submitting, setSubmitting] = useState(false);
  const [tabIndex, setTabIndex] = useState(TABS.INFORMATION);

  const { orderWorksheet, worksheetLoading, deleteCart, submitCart } =
    useShopper();

  const [order, setOrder] = useState<RequiredDeep<Order>>();

  const [shippingAddress, setShippingAddress] = useState<Address>({
    FirstName: "",
    LastName: "",
    CompanyName: "",
    Street1: "",
    Street2: "",
    City: "",
    State: "",
    Zip: "",
    Country: "US",
    Phone: "",
  });

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

  const handleSaveShippingAddress = async () => {
    const orderID = orderWorksheet?.Order?.ID;
    if (!orderID) return;

    handleNextTab();

    try {
      await Orders.SetShippingAddress("Outgoing", orderID, shippingAddress);
      await IntegrationEvents.EstimateShipping("Outgoing", orderID);

      const updatedWorksheet = await IntegrationEvents.GetWorksheet(
        "Outgoing",
        orderID
      );
      console.log("Updated Worksheet:", updatedWorksheet);
    } catch (err) {
      console.error("Failed to save shipping address:", err);
    }
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
                        <TabPanel>
                          <CartInformationPanel
                            shippingAddress={shippingAddress}
                            setShippingAddress={setShippingAddress}
                            handleSaveShippingAddress={
                              handleSaveShippingAddress
                            }
                          />
                        </TabPanel>
                        <TabPanel>
                          <CartShippingPanel
                            orderWorksheet={orderWorksheet}
                            shippingAddress={shippingAddress}
                            handleNextTab={handleNextTab}
                            handlePrevTab={handlePrevTab}
                          />
                        </TabPanel>

                        <TabPanel display="flex" flexDirection="column">
                          <CartPaymentPanel
                            submitOrder={submitOrder}
                            submitting={submitting}
                          />
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
