import {
  Button,
  Card,
  CardBody,
  Divider,
  HStack,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { OrderWorksheet, Address } from "ordercloud-javascript-sdk";

type CartShippingPanelProps = {
  orderWorksheet: OrderWorksheet;
  shippingAddress: Address;
  handleNextTab: () => void;
  handlePrevTab: () => void;
};

export const CartShippingPanel = ({
  orderWorksheet,
  shippingAddress,
  handleNextTab,
  handlePrevTab,
}: CartShippingPanelProps) => {
  return (
    <VStack alignItems="stretch">
      <Card variant="flat" shadow="none" bgColor="whiteAlpha.800">
        <CardBody display="flex" flexDirection="column" gap={6}>
          <HStack>
            <Text color="chakra-subtle-text" fontWeight="bold">
              Contact
            </Text>
            <Text>
              {orderWorksheet?.Order?.FromUser?.Email}
              {orderWorksheet?.Order?.FromUser?.Phone
                ? `, ${orderWorksheet.Order.FromUser.Phone}`
                : ""}
            </Text>
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
            <Text color="chakra-subtle-text" fontWeight="bold">
              Ships to
            </Text>
            <Text whiteSpace="pre-line">
              {`${shippingAddress.FirstName} ${shippingAddress.LastName}${
                shippingAddress?.CompanyName
                  ? ` (${shippingAddress.CompanyName})`
                  : ""
              }
${shippingAddress.Street1}${
                shippingAddress.Street2 ? `, ${shippingAddress.Street2}` : ""
              }
${shippingAddress.City}, ${shippingAddress.State} ${shippingAddress.Zip}`}
            </Text>
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

      <Card variant="flat" shadow="none" bgColor="whiteAlpha.800">
        <CardBody display="flex" flexDirection="column" gap="3">
          <RadioGroup
            defaultValue="2"
            sx={{
              "& .chakra-radio__label": { width: "full" },
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
                  <VStack alignItems="flex-start">
                    <Text>Pick up in store</Text>
                    <Text fontSize="xs">{/* Add pickup location here */}</Text>
                  </VStack>
                  <Text ml="auto" fontWeight="bold" color="chakra-subtle-text">
                    [SHIPPING_COST]
                  </Text>
                </HStack>
              </Radio>
              <Radio value="2">
                <HStack>
                  <Text>Standard shipping</Text>
                  <Text ml="auto" fontWeight="bold" color="chakra-subtle-text">
                    [SHIPPING_COST]
                  </Text>
                </HStack>
              </Radio>
              <Radio value="3">
                <HStack>
                  <Text>Express shipping</Text>
                  <Text ml="auto" fontWeight="bold" color="chakra-subtle-text">
                    [SHIPPING_COST]
                  </Text>
                </HStack>
              </Radio>
            </Stack>
          </RadioGroup>
        </CardBody>
      </Card>

      <Button alignSelf="flex-end" onClick={handleNextTab} mt={6}>
        Continue to payment
      </Button>
    </VStack>
  );
};
