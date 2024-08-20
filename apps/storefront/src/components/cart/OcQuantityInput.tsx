/* eslint-disable @typescript-eslint/no-unused-vars */

import { ChangeEvent, FunctionComponent, useCallback, useEffect, useState } from 'react'

import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  VStack,
} from '@chakra-ui/react'
import { Me, PriceSchedule } from 'ordercloud-javascript-sdk'

interface OcQuantityInputProps {
  controlId: string
  priceSchedule?: PriceSchedule
  productId?: string;
  label?: string
  disabled?: boolean
  quantity: number
  onChange: (quantity: number) => void
}

const OcQuantityInput: FunctionComponent<OcQuantityInputProps> = ({
  controlId,
  priceSchedule,
  productId,
  disabled,
  quantity,
  onChange,
}) => {

  const [ps, setPs] = useState(priceSchedule);
  const [psLoad, setPsLoad] = useState(!!ps);

  const retrievePriceSchedule = useCallback(async (pId:string) => {
    setPsLoad(true);
    const response = await Me.GetProduct(pId);
    setPs(response.PriceSchedule);
    setPsLoad(false);
  }, [])

  useEffect(() => {
    if (productId && !ps && !psLoad) {
      retrievePriceSchedule(productId)
    }
  }, [retrievePriceSchedule, productId, ps, psLoad])

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(e.target.value))
  }

  const handleNumberInputChange = (_valAsString: string, valAsNumber: number) => {
    if (typeof valAsNumber !== 'number') {
      return
    }
    onChange(valAsNumber)
  }

  return ps ? (
    <VStack
      alignItems="flex-start"
      gap={0}
    >
      {/* <FormLabel>{label}</FormLabel> */}
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
            <option
              key={pb.Quantity}
              value={pb.Quantity}
            >
              {pb.Quantity}
            </option>
          ))}
        </Select>
      ) : (
        <NumberInput
          maxW="100"
          size="sm"
          value={quantity || ''}
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
}

export default OcQuantityInput
