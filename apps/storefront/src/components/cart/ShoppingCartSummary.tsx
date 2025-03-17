import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  Input,
  InputGroup,
  Stack,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useShopper } from "@ordercloud/react-sdk";
import {
  LineItem,
  Order,
  OrderPromotion,
  RequiredDeep,
} from "ordercloud-javascript-sdk";
import React, { FormEvent, useCallback, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import OcCurrentOrderLineItemList from "./OcCurrentOrderLineItemList";
import { TABS } from "./ShoppingCart";

interface CartSummaryProps {
  order: RequiredDeep<Order>;
  lineItems: LineItem[];
  promotions?: OrderPromotion[];
  onSubmitOrder: () => void;
  deleteOrder: () => void;
  tabIndex: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  order,
  lineItems,
  promotions,
  deleteOrder,
  tabIndex,
}) => {
  const { addCartPromo, removeCartPromo } = useShopper();
  const [promoCode, setPromoCode] = useState<string>("");
  const handleLineItemChange = (newLi: LineItem) => {
    // Implement the logic to update the line item
    console.log("Line item updated:", newLi);
  };
  const toast = useToast();
  // TODO: tax blocked by work on .NET functions
  // const [taxCost, setTaxCost] = useState(null);

  // useEffect(() => {
  //   const fetchTaxCost = async () => {
  //     const orderID = order?.ID;
  //     if (!orderID) return;

  //     try {
  //       const response = await fetch(`/api/ordercalculate?orderID=${orderID}`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch tax cost");
  //       }

  //       const data = await response.json();
  //       const taxCost = data?.TaxCost;

  //       if (taxCost !== undefined) {
  //         setTaxCost(taxCost);
  //       } else {
  //         console.warn("No tax cost found in response.");
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch tax cost:", err);
  //     }
  //   };

  //   fetchTaxCost();
  // }, [order]);

  const handleApplyPromotion = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!promoCode) return;
      try {
        addCartPromo(promoCode);
        toast({
          title: `Promotion '${promoCode}' applied to cart`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setPromoCode("");
      } catch (error) {
        console.error(error);
      }
    },
    [addCartPromo, promoCode, toast]
  );

  const handleRemovePromotion = useCallback(
    async (promoCode: string | undefined) => {
      if (!promoCode) return;
      try {
        await removeCartPromo(promoCode);
        toast({
          title: `Promotion '${promoCode}' removed from cart`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setPromoCode("");
      } catch (error) {
        console.error(error);
      }
    },
    [removeCartPromo, toast]
  );

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
      <form id="APPLY_PROMO" onSubmit={handleApplyPromotion}>
        <Flex justify="space-between">
          <FormControl isRequired mb={3}>
            <InputGroup>
              <Input
                aria-label="Gift card or discount code"
                placeholder="Gift card or discount code"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </InputGroup>
          </FormControl>
          <Button colorScheme="secondary" ml={2} type="submit">
            Apply
          </Button>
        </Flex>
      </form>
      {promotions?.map((p) => (
        <Flex justify="space-between">
          <Text alignContent="center">{p.Code?.toLocaleUpperCase()}</Text>
          <Button
            colorScheme="danger"
            onClick={() => handleRemovePromotion(p.Code)}
          >
            Remove
          </Button>
        </Flex>
      ))}
      <Divider />
      <Stack spacing={3}>
        <Flex justify="space-between">
          <Text>Subtotal</Text>
          <Text>${order.Subtotal?.toFixed(2)}</Text>
        </Flex>
        {order.PromotionDiscount && order.PromotionDiscount > 0 && (
          <Flex justify="space-between">
            <Text>Promotion Discount</Text>
            <Text>- ${order.PromotionDiscount?.toFixed(2)}</Text>
          </Flex>
        )}
        <Flex justify="space-between">
          <Text>Shipping</Text>
          {tabIndex !== TABS.SHIPPING ||
            (tabIndex !== TABS.INFORMATION && <Text></Text>)}
          <Text>
            {order.ShippingCost === 0
              ? "FREE SHIPPING"
              : "$" + order.ShippingCost}
          </Text>
        </Flex>
        {/* <Flex justify="space-between">
          <Text>Tax</Text>
          {tabIndex !== TABS.SHIPPING ||
            (tabIndex !== TABS.INFORMATION && <Text></Text>)}
          <Text>{taxCost}</Text>
        </Flex> */}
        <Flex justify="space-between" fontWeight="bold" fontSize="lg">
          <Text>Total</Text>
          <Text>${order.Total?.toFixed(2)}</Text>
        </Flex>
      </Stack>
    </VStack>
  );
};

export default CartSummary;
