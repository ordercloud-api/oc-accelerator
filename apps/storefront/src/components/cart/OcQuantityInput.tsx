/* eslint-disable @typescript-eslint/no-unused-vars */

import { ChangeEvent, FunctionComponent, useMemo } from "react";

import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  VStack,
} from "@chakra-ui/react";
import { PriceSchedule, BuyerProduct } from "ordercloud-javascript-sdk";
import { useOcResourceGet } from "@rwatt451/ordercloud-react";

interface OcQuantityInputProps {
  controlId: string;
  priceSchedule?: PriceSchedule;
  productId?: string;
  label?: string;
  disabled?: boolean;
  quantity: number;
  onChange: (quantity: number) => void;
}

const OcQuantityInput: FunctionComponent<OcQuantityInputProps> = ({
  controlId,
  productId,
  priceSchedule,
  disabled,
  quantity,
  onChange,
}) => {
  const { data } = useOcResourceGet(
    "Products",
    { productID: productId! },
    {
      staleTime: 300000, // 5 min
      disabled: !productId || !!priceSchedule,
    },
    true
  );

  const ps = useMemo(
    () => priceSchedule ?? (data as BuyerProduct)?.PriceSchedule,
    [data, priceSchedule]
  );

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(e.target.value));
  };

  const handleNumberInputChange = (
    _valAsString: string,
    valAsNumber: number
  ) => {
    if (typeof valAsNumber !== "number") {
      return;
    }
    onChange(valAsNumber);
  };

  return ps ? (
    <VStack alignItems="flex-start" gap={0}>
      {ps?.RestrictedQuantity ? (
        <Select
          maxW="100"
          size="sm"
          id={controlId}
          isDisabled={disabled}
          value={quantity}
          onChange={handleSelectChange}
        >
          {ps.PriceBreaks?.map((pb) => (
            <option key={pb.Quantity} value={pb.Quantity}>
              {pb.Quantity}
            </option>
          ))}
        </Select>
      ) : (
        <NumberInput
          maxW="100"
          size="sm"
          value={quantity || ""}
          defaultValue={quantity}
          onChange={handleNumberInputChange}
          isDisabled={disabled}
          step={1}
          min={ps?.MinQuantity || 1}
          max={ps?.MaxQuantity || undefined}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      )}
    </VStack>
  ) : null;
};

export default OcQuantityInput;
