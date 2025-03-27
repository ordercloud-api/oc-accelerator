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
import { useShopper } from "@ordercloud/react-sdk";
import {
  Address,
  OrderShipMethodSelection,
  ShipMethod
} from "ordercloud-javascript-sdk";
import React, { useState } from "react";

interface CartShippingPanelProps {
  shippingAddress: Address;
  handleNextTab: () => void;
  handlePrevTab: () => void;
}

const CartShippingPanel: React.FC<CartShippingPanelProps> = ({
  handleNextTab,
}) => {
  const { orderWorksheet, calculateOrder, selectShipMethods } = useShopper();
  const [shipMethodID, setShipMethodID] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSelectShipMethod = async () => {
    const orderID = orderWorksheet?.Order?.ID;
    const shipEstimateID =
      orderWorksheet?.ShipEstimateResponse?.ShipEstimates?.at(0)?.ID;

    if (!orderID || !shipEstimateID) {
      console.error("Missing required data for ship method selection.");
      return;
    }

    if (!shipMethodID) {
      console.error("Selected method not found.");
      return;
    }

    const shipMethodSelection: OrderShipMethodSelection = {
      ShipMethodSelections: [
        { ShipEstimateID: shipEstimateID, ShipMethodID: shipMethodID },
      ],
    };

    try {
      setLoading(true);
      await selectShipMethods(shipMethodSelection);
      await calculateOrder();
      handleNextTab();
    } catch (err) {
      console.error("Failed to select shipping method:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody display="flex" alignItems="center">
          <Spinner mr="3" />
          <Text display="inline">Loading...</Text>
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
            value={shipMethodID}
            onChange={setShipMethodID}
            as={VStack}
          >
            {orderWorksheet?.ShipEstimateResponse?.ShipEstimates?.at(
              0
            )?.ShipMethods?.map((method: ShipMethod) => (
              <Radio key={method.ID} value={method.ID} w="full" gap="3">
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
      <Button
        alignSelf="flex-end"
        mt={6}
        onClick={handleSelectShipMethod}
        isDisabled={!shipMethodID || loading}
      >
        {loading ? <Spinner size="sm" /> : "Continue to payment"}
      </Button>
    </VStack>
  );
};

export default CartShippingPanel;
