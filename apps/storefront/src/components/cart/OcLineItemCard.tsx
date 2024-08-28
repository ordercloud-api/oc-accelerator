import {
  Button,
  ButtonGroup,
  Center,
  HStack,
  Heading,
  Icon,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Cart, LineItem } from "ordercloud-javascript-sdk";
import React from "react";
import formatPrice from "../../utils/formatPrice";
import OcQuantityInput from "./OcQuantityInput";
import useDebounce from "../../hooks/useDebounce";
import { TbPhoto } from "react-icons/tb";

interface OcLineItemCardProps {
  lineItem: LineItem;
  editable?: boolean;
  onChange?: (newLi: LineItem) => void;
}

const OcLineItemCard: FunctionComponent<OcLineItemCardProps> = ({
  lineItem,
  editable,
  onChange,
}) => {
  const [quantity, _setQuantity] = useState(lineItem.Quantity);

  const debouncedQuantity: number = useDebounce(quantity, 300);

  const product = useMemo(() => lineItem.Product, [lineItem]);
  const [isDeliveryInstructionsModalOpen, setIsDeliveryInstructionsModalOpen] =
    useState(false);

  const updateLineItem = useCallback(
    async (quantity: number) => {
      if (lineItem.Quantity === quantity) return;
      const response = await Cart.PatchLineItem(lineItem.ID!, {
        Quantity: quantity,
      });
      if (onChange) {
        onChange(response);
      }
    },
    [lineItem, onChange]
  );

  useEffect(() => {
    updateLineItem(debouncedQuantity);
  }, [debouncedQuantity, updateLineItem]);

  const lineSubtotal = useMemo(() => {
    return formatPrice(lineItem.LineSubtotal);
  }, [lineItem]);

  const unitPrice = useMemo(() => {
    return formatPrice(lineItem.UnitPrice);
  }, [lineItem]);

  return (
    <>
      <HStack
        id="lineItemRow"
        flexWrap={{base:"wrap", lg: "nowrap"}}
        p={{ base: 3, md: "unset" }}
        gap={9}
        w="full"
      >
        <Center
          bgColor="chakra-subtle-bg"
          aspectRatio="1 / 1"
          objectFit="cover"
          boxSize="80px"
          rounded="md"
        >
          {lineItem?.Product?.xp?.Images ? (
            <Image
              rounded="md"
              boxSize="full"
              objectFit="cover"
              src={lineItem?.Product?.xp?.Images[0].Url}
              zIndex={1}
              onError={(e) => {
                e.currentTarget.src = ""; // Prevent the broken image from rendering
                e.currentTarget.style.display = "none"; // Hide the broken image
              }}
            />
          ) : (
            <Icon fontSize="2rem" color="gray.300" as={TbPhoto} />
          )}
          <Icon
            fontSize="2rem"
            color="gray.300"
            as={TbPhoto}
            position="absolute"
          />
        </Center>

        <VStack alignItems="flex-start" gap={3} flexGrow="1">
          <Link as={RouterLink} to={`/products/${lineItem?.Product?.ID}`}>
            <Text fontSize="md" display="inline-block" maxW="md">
              {lineItem.Product?.Name}
            </Text>
          </Link>
          <HStack alignItems="center" color="chakra-subtle-text" mt={-2}>
            <Text fontSize="xs">
              <Text fontWeight="600" display="inline">
                Item number:{" "}
              </Text>
              {lineItem.Product?.ID}
            </Text>
          </HStack>
          {lineItem?.Specs?.map((spec) => (
            <React.Fragment key={spec.SpecID}>
              <Text mt={-3} fontSize="xs" color="chakra-subtle-text">
                <Text fontWeight="600" display="inline">
                  {spec.Name}:
                </Text>{" "}
                {spec.Value}
              </Text>
            </React.Fragment>
          ))}

          <ButtonGroup spacing="3" alignItems="center"></ButtonGroup>
        </VStack>
        {editable ? (
          <VStack alignItems="flex-start">
            {product && (
              <OcQuantityInput
                controlId="addToCart"
                productId={lineItem.ProductID}
                quantity={Number(quantity)}
                onChange={_setQuantity}
              />
            )}
            <Button size="xs" fontSize=".75rem" variant="link">
              Remove
            </Button>
          </VStack>
        ) : (
          <Text ml="auto">Qty: {lineItem.Quantity}</Text>
        )}
        <VStack minW="85px" alignItems="flex-end">
          <Text fontWeight="600" fontSize="lg">
            {lineSubtotal}
          </Text>
          <Text fontSize=".7em" color="chakra-subtle-text">
            ({unitPrice} each)
          </Text>
        </VStack>
      </HStack>

      <Modal
        isOpen={isDeliveryInstructionsModalOpen}
        onClose={() => setIsDeliveryInstructionsModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent width="full" w="100%" maxWidth="800px">
          <ModalHeader>
            <Heading>Add Delivery Instructions</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Textarea placeholder="Delivery instructions" height="175px" />
              <HStack
                w="100%"
                width="full"
                justifyItems="space-between"
                justifyContent="space-between"
                mb={6}
              >
                <Button
                  type="button"
                  aria-describedby="ae-checkout-tip"
                  border="1px"
                  borderColor="gray.300"
                  variant="primaryButton"
                  height="50px"
                  onClick={() => setIsDeliveryInstructionsModalOpen(false)}
                >
                  <Text fontSize="18px">Add Delivery Instructions</Text>
                </Button>

                <Button
                  type="button"
                  aria-describedby="ae-checkout-tip"
                  border="1px"
                  borderColor="gray.300"
                  variant="secondaryButton"
                  height="50px"
                  onClick={() => setIsDeliveryInstructionsModalOpen(false)}
                >
                  <Text fontSize="18px">Cancel</Text>
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OcLineItemCard;
