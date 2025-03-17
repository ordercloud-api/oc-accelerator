import {
  Button,
  Card,
  CardBody,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Address, OrderWorksheet } from "ordercloud-javascript-sdk";
import React from "react";
import { useShippingMethods } from "../../../hooks/useShippingMethods";

interface CartShippingPanelProps {
  orderWorksheet: OrderWorksheet;
  shippingAddress: Address;
  handleNextTab: () => void;
  handlePrevTab: () => void;
}

const CartShippingPanel: React.FC<CartShippingPanelProps> = ({
  orderWorksheet,
  shippingAddress,
  handleNextTab,
}) => {
  const {
    availableMethods,
    selectedMethodIndex,
    selectShipMethod,
    error,
    loading,
  } = useShippingMethods({ orderWorksheet, shippingAddress });

  const handleShippingMethod = async () => {
    const orderID = orderWorksheet?.Order?.ID;
    const shipEstimateID =
      orderWorksheet?.ShipEstimateResponse?.ShipEstimates?.at(0)?.ID;

    if (!orderID || !selectedMethodIndex || !shipEstimateID) {
      console.error("Missing required data for ship method selection.");
      return;
    }

    const selectedMethod = availableMethods[parseInt(selectedMethodIndex)];

    if (!selectedMethod) {
      console.error("Selected method not found.");
      return;
    }
  };

  const handleChange = (value: string) => {
    selectShipMethod(value);
    const selected = availableMethods[parseInt(value)];
    console.log("Selected shipping method:", selected);
    handleNextTab();
  };

  if (loading) {
    return (
      <Card>
        <CardBody display="flex" alignItems="center">
          <Spinner mr="3" />
          <Text display="inline">Loading shipping options...</Text>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          Shipping service unavailable, please contact your site admin and try
          again later
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack alignItems="flex-start">
      <Card variant="flat" shadow="none" bgColor="whiteAlpha.800" w="full">
        <CardBody display="flex" flexDirection="column" gap="3">
          <RadioGroup
            sx={{
              ".chakra-radio__label": {
                display: "flex",
                alignItems: "center",
                width: "full",
                gap: "3",
              },
            }}
            value={selectedMethodIndex || undefined}
            onChange={handleChange}
            as={VStack}
          >
            {availableMethods.map((method, index) => (
              <Radio key={method.ID} value={index.toString()} w="full" gap="3">
                <VStack align="flex-start" gap="0" flexGrow="1">
                  <Text fontSize="lg" fontWeight="semibold">
                    {method.Name}
                  </Text>
                  <Text fontSize="sm" color="chakra-subtle-text">
                    {method.EstimatedTransitDays === 1
                      ? "1-day delivery"
                      : `${method.EstimatedTransitDays}-day delivery`}
                  </Text>
                </VStack>
                <Text
                  ml="auto"
                  fontWeight="bold"
                  color="gray.600"
                  fontSize="lg"
                >
                  ${method?.Cost?.toFixed(2)}
                </Text>
              </Radio>
            ))}
          </RadioGroup>
        </CardBody>
      </Card>
      <Button alignSelf="flex-end" mt={6} onClick={handleShippingMethod}>
        Continue to payment
      </Button>
    </VStack>
  );
};

export default CartShippingPanel;
