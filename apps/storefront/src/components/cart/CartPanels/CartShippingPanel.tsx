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
import {
  Address,
  IntegrationEvents,
  OrderWorksheet,
  ShipMethod,
} from "ordercloud-javascript-sdk";
import React, { useEffect, useState } from "react";

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
  const [shippingMethods, setShippingMethods] = useState<ShipMethod[]>([]);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShippingEstimates = async () => {
      const orderID = orderWorksheet?.Order?.ID;
      if (!orderID || !shippingAddress) return;

      setLoading(true);
      try {
        const worksheet = await IntegrationEvents.GetWorksheet(
          "Outgoing",
          orderID
        );
        const methods =
          worksheet?.ShipEstimateResponse?.ShipEstimates?.[0]?.ShipMethods ||
          [];
        setShippingMethods(methods);

        if (methods.length > 0) {
          setSelectedMethodIndex("0");
        }
      } catch (err) {
        console.error("Failed to fetch shipping estimates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingEstimates();
  }, [orderWorksheet, shippingAddress]);

  const handleChange = (value: string) => {
    setSelectedMethodIndex(value);
    const selected = shippingMethods[parseInt(value)];
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

  if (!shippingMethods.length) {
    return (
      <Card>
        <CardBody>No shipping options available</CardBody>
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
            value={selectedMethodIndex}
            onChange={handleChange}
            as={VStack}
          >
            {shippingMethods.map((method, index) => (
              <Radio key={index} value={index.toString()} w="full" gap="3">
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
      <Button alignSelf="flex-end" mt={6}>
        Continue to payment
      </Button>
    </VStack>
  );
};

export default CartShippingPanel;
