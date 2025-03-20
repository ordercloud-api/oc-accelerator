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
  IntegrationEvents,
  ShipMethod,
} from "ordercloud-javascript-sdk";
import React from "react";
import { useShippingMethods } from "../../../hooks/useShippingMethods";

interface CartShippingPanelProps {
  shippingAddress: Address;
  handleNextTab: () => void;
  handlePrevTab: () => void;
}

const CartShippingPanel: React.FC<CartShippingPanelProps> = ({
  handleNextTab,
}) => {
  const { selectShipMethods, error, loading } = useShippingMethods();
  const { orderWorksheet, refreshWorksheet } = useShopper();

  const [shipMethodID, setShipMethodID] = React.useState<string>();

  const handleSelectShipMethod = async () => {
    const orderID = orderWorksheet?.Order?.ID;
    const shipEstimateID =
      orderWorksheet?.ShipEstimateResponse?.ShipEstimates?.at(0)?.ID;

    if (!orderID || !shipEstimateID) {
      console.error("Missing required data for ship method selection?");
      return;
    }

    if (!shipMethodID) {
      console.error("Selected method not found.");
      return;
    }

    await selectShipMethods(shipMethodID);
    await IntegrationEvents.Calculate("Outgoing", orderID);
    await refreshWorksheet();
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

  const handleChange = (shipMethodID: string) => {
    setShipMethodID(shipMethodID);
  };

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
            onChange={handleChange}
            as={VStack}
          >
            {orderWorksheet?.ShipEstimateResponse?.ShipEstimates?.at(
              0
            )?.ShipMethods?.map((method: ShipMethod) => (
              <Radio key={method.ID} value={method?.ID} w="full" gap="3">
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
      <Button alignSelf="flex-end" mt={6} onClick={handleSelectShipMethod}>
        Continue to payment
      </Button>
    </VStack>
  );
};

export default CartShippingPanel;
