import {
    Button,
    ButtonGroup,
    Divider,
    Flex,
    Input,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react";
import { LineItem, Order, RequiredDeep } from "ordercloud-javascript-sdk";
import React from "react";
import { Link as RouterLink } from 'react-router-dom';
import OcCurrentOrderLineItemList from "./OcCurrentOrderLineItemList";

interface CartSummaryProps {
  order: RequiredDeep<Order>;
  lineItems: LineItem[];
  onSubmitOrder: () => void;
  deleteOrder: () => void;
}


const CartSummary: React.FC<CartSummaryProps> = ({
  order,
  lineItems,
  deleteOrder
}) => {
  const handleLineItemChange = (newLi: LineItem) => {
    // Implement the logic to update the line item
    console.log("Line item updated:", newLi);
  };
  return (
    <VStack align="stretch" spacing={6}>
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
      <OcCurrentOrderLineItemList
        lineItems={lineItems}
        emptyMessage="Your cart is empty"
        onChange={handleLineItemChange}
        editable={false}
      />
      <Divider />
      <Flex>
        <Input placeholder="Gift card or discount code" />
        <Button ml={2} colorScheme="secondary">
          Apply
        </Button>
      </Flex>
      <Stack spacing={3}>
        <Flex justify="space-between">
          <Text>Subtotal</Text>
          <Text>${order.Subtotal?.toFixed(2)}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text>Shipping</Text>
          <Text>Calculated at next step</Text>
        </Flex>
        <Flex justify="space-between" fontWeight="bold" fontSize="lg">
          <Text>Total</Text>
          <Text>${order.Total?.toFixed(2)}</Text>
        </Flex>
        {/* <Text fontSize="sm" color="gray.600">
          Including ${(order.TaxTotal || 0).toFixed(2)} in taxes
        </Text> */}
      </Stack>
    </VStack>
  );
};

export default CartSummary;
