import {
  Input,
  InputProps,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightAddon,
  InputRightElement,
} from '@chakra-ui/react'
import { FC, ReactNode, useCallback, useMemo } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { BaseProps, FormControl } from '../form-control'
import { get, isNil } from 'lodash'

export interface InputControlProps extends BaseProps {
  /**
   * Chakra InputProps
   */
  inputProps?: InputProps

  /**
   * The Chakra InputLeftAddon
   * https://chakra-ui.com/docs/components/input#left-and-right-addons
   */
  leftAddon?: ReactNode

  /**
   * The Chakra InputRightAddon
   * https://chakra-ui.com/docs/components/input#left-and-right-addons
   */
  rightAddon?: ReactNode

  /**
   * The Chakra InputLeftElement
   * https://chakra-ui.com/docs/components/input#add-elements-inside-input
   */
  leftElement?: ReactNode

  /**
   * The Chakra InputRightElement
   * https://chakra-ui.com/docs/components/input#add-elements-inside-input
   */
  rightElement?: ReactNode
}

export const InputControl: FC<InputControlProps> = (props: InputControlProps) => {
  const {
    name,
    control,
    label,
    inputProps,
    leftAddon,
    rightAddon,
    leftElement,
    rightElement,
    ...rest
  } = props
  const {
    field,
    formState: { isSubmitting, defaultValues },
  } = useController({
    name,
    control,
  })
  const { resetField, setValue } = useFormContext()
  const initialValue = get(defaultValues, name)

  const handleFieldChange = useCallback(
    (e: any) => {
      if (e.target.value === '') {
        if (!isNil(initialValue)) {
          setValue(field.name, '')
        } else {
          resetField(field.name)
        }
        return
      }
      field.onChange(e)
    },
    [field, initialValue, setValue, resetField]
  )

  const interprettedValue = useMemo(() => {
    if (inputProps?.type === 'datetime-local') {
      return field.value?.split('+')[0]
    }
    return field.value
  }, [inputProps?.type, field.value])

  return (
    <FormControl
      name={name}
      control={control}
      label={label}
      {...rest}
    >
      <InputGroup>
        {typeof leftAddon === 'string' ? <InputLeftAddon>{leftAddon}</InputLeftAddon> : leftAddon}
        {typeof leftElement === 'string' ? (
          <InputLeftElement>{leftElement}</InputLeftElement>
        ) : (
          leftElement
        )}
        <Input
          {...field}
          onChange={handleFieldChange}
          value={interprettedValue ?? ''}
          id={name}
          isDisabled={isSubmitting || rest.isDisabled}
          {...inputProps}
        />
        {typeof rightElement === 'string' ? (
          <InputRightElement>{rightElement}</InputRightElement>
        ) : (
          rightElement
        )}
        {typeof rightAddon === 'string' ? (
          <InputRightAddon>{rightAddon}</InputRightAddon>
        ) : (
          rightAddon
        )}
      </InputGroup>
    </FormControl>
  )
}

InputControl.displayName = 'InputControl'

export default InputControl
