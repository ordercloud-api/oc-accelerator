import {
  NumberInputProps as ChakraNumberInputProps,
  InputGroup,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react'
import { isNil } from 'lodash'
import { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import { get, useController, useFormContext } from 'react-hook-form'
import { BaseProps, FormControl } from '../form-control'

export interface NumberInputControlProps extends BaseProps {
  /**
   * Chakra's NumberInputProps
   */
  numberInputProps?: ChakraNumberInputProps

  /**
   * Whether or not the stopper should be shownF
   */
  showStepper?: boolean

  /**
   * Optional children
   */
  children?: ReactNode
}

export const NumberInputControl: FC<NumberInputControlProps> = (props: NumberInputControlProps) => {
  const { name, control, label, showStepper = true, children, numberInputProps, ...rest } = props
  const {
    field,
    fieldState: { isTouched },
    formState: { isSubmitting, errors, defaultValues },
  } = useController({
    name,
    control,
  })

  const error = get(errors, name, '')
  const { ref, onChange, ...restField } = field

  // Track focus state so that users can enter in decimals
  const [hasFocus, setHasFocus] = useState(false)

  const [stringValue, setStringValue] = useState(
    isNil(restField.value) ? restField.value : String(restField.value)
  )

  const initialValue = get(defaultValues, name)

  useEffect(() => {
    // Do not setStringValue when the user is still focused on the input
    // This allows users to enter in decimal values
    if (!hasFocus && !isNil(restField.value) && String(restField.value) !== stringValue) {
      setStringValue(String(restField.value))
    }
  }, [restField, stringValue, hasFocus, field?.name])

  const { resetField, setValue } = useFormContext()

  const handleInputChange = useCallback(
    (valAsString: string, valAsNumber: number) => {
      if (valAsString === '') {
        setStringValue(valAsString)
        if (!isNil(initialValue)) {
          setValue(field.name, '')
        } else {
          resetField(field.name)
        }
        return
      }
      setStringValue(valAsString)
      onChange(isNaN(valAsNumber) ? valAsString : valAsNumber)
    },
    [onChange, initialValue, setValue, field.name, resetField]
  )

  return (
    <>
      <FormControl
        name={name}
        control={control}
        label={label}
        {...rest}
      >
        <InputGroup>
          <NumberInput
            {...restField}
            value={stringValue || ''}
            onChange={handleInputChange}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            id={name}
            isInvalid={!!error && isTouched}
            isDisabled={isSubmitting || rest.isDisabled}
            {...numberInputProps}
          >
            <NumberInputField
              name={name}
              data-lpignore="true"
              ref={ref}
            />
            {showStepper && (
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            )}
            {children}
          </NumberInput>
        </InputGroup>
      </FormControl>
    </>
  )
}

NumberInputControl.displayName = 'NumberInputControl'

export default NumberInputControl
