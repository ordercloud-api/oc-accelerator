import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Input,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LineItem, Order, RequiredDeep } from "ordercloud-javascript-sdk";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import OcCurrentOrderLineItemList from "./OcCurrentOrderLineItemList";
import { TABS } from "./ShoppingCart";

interface CartSummaryProps {
  order: RequiredDeep<Order>;
  lineItems: LineItem[];
  onSubmitOrder: () => void;
  deleteOrder: () => void;
  tabIndex: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  order,
  lineItems,
  deleteOrder,
  tabIndex
}) => {
  const handleLineItemChange = (newLi: LineItem) => {
    // Implement the logic to update the line item
    console.log("Line item updated:", newLi);
  };
  return (
    <VStack align="stretch" spacing={6}>
      {tabIndex !== TABS.CONFIRMATION && (
        <ButtonGroup alignSelf="flex-end" alignItems="center" gap={3} mt={-3}>
          <Button variant="link" size="xs" onClick={deleteOrder}>
            Clear cart
          </Button>
          <Button
            size="xs"
            variant="outline"
            alignSelf="flex-end"
            as={RouterLink}
            to="/products"
          >
            Continue shopping
          </Button>
        </ButtonGroup>
      )}
      <OcCurrentOrderLineItemList
        lineItems={lineItems}
        emptyMessage="Your cart is empty"
        onChange={handleLineItemChange}
        editable={false}
        tabIndex={tabIndex}
      />
      <Divider />
      {tabIndex !== TABS.CONFIRMATION && (
        <Flex>
          <Input placeholder="Gift card or discount code" />
          <Button ml={2} colorScheme="secondary">
            Apply
          </Button>
        </Flex>
      )}
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
          <Text>Shipping</Text>
          {tabIndex !== TABS.SHIPPING || tabIndex !== TABS.INFORMATION && <Text></Text>}
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

export default CartSummary;
