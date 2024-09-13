import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LineItem, Order, RequiredDeep } from "ordercloud-javascript-sdk";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import OcCurrentOrderLineItemList from "./OcCurrentOrderLineItemList";

interface OrderSummaryProps {
  order: RequiredDeep<Order>;
  lineItems: LineItem[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order, lineItems }) => {
  const handleLineItemChange = (newLi: LineItem) => {
    // Implement the logic to update the line item
    console.log("Line item updated:", newLi);
  };
  return (
    <VStack align="stretch" spacing={6}>
      <ButtonGroup alignSelf="flex-end" alignItems="center" gap={3} mt={-3}>
        <Button
          size="xs"
          variant="outline"
          alignSelf="flex-end"
          as={RouterLink}
          to="/shop"
        >
          Continue shopping
        </Button>
      </ButtonGroup>
      <OcCurrentOrderLineItemList
        lineItems={lineItems}
        emptyMessage=""
        onChange={handleLineItemChange}
        editable={false}
      />
      <Divider />
      <Stack spacing={3}>
        <Flex justify="space-between">
          <Text>Subtotal</Text>
          <Text>${order.Subtotal?.toFixed(2)}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text>Promotion</Text>
          <Text>${order.PromotionDiscount}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text>
            {order.ShippingCost === 0
              ? "FREE SHIPPING"
              : "$" + order.ShippingCost}
          </Text>
        </Flex>
        <Flex justify="space-between" fontWeight="bold" fontSize="lg">
          <Text>Total</Text>
          <Text>${order.Total?.toFixed(2)}</Text>
        </Flex>
      </Stack>
    </VStack>
  );
};

export default OrderSummary;
