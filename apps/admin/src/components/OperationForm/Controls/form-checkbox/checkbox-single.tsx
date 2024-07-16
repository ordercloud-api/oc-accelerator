import {
  CheckboxProps as ChakraCheckboxProps,
  Checkbox,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { isNil } from 'lodash'
import { FC, ReactNode, useCallback, useMemo } from 'react'
import { get, useController, useFormContext } from 'react-hook-form'
import { BaseProps, FormControl } from '../form-control'

export interface CheckboxSingleProps extends BaseProps {
  /**
   * Chakra CheckboxProps
   */
  checkBoxProps?: ChakraCheckboxProps
  children?: ReactNode
}

export const CheckboxSingleControl: FC<CheckboxSingleProps> = (props: CheckboxSingleProps) => {
  const {
    name,
    control,
    label,
    children,
    checkBoxProps,
    isDisabled,
    isReadOnly,
    isRequired,
    ...rest
  } = props
  const {
    field,
    fieldState: { isTouched },
    formState: { errors, isSubmitting, defaultValues },
  } = useController({ name, control })
  const error = get(errors, name, '')
  const initialValue = get(defaultValues, name)
  const isChecked = useMemo(() => field.value, [field.value])

  const { setValue } = useFormContext()
  const requiredColor = useColorModeValue('red.500', 'red.300')
  const handleFieldChange = useCallback(
    (e: any) => {
      // checkbox flow: indeterminate state > true > false
      if (field.value === false && !isRequired && isNil(initialValue)) {
        setValue(field.name, undefined, { shouldDirty: true, shouldTouch: true })
        return
      } else if (field.value === true) {
        e.target.checked = false
      } else {
        e.target.checked = true
      }
      field.onChange(e)
    },
    [field, isRequired, setValue, initialValue]
  )

  return (
    <FormControl
      name={name}
      control={control}
      {...rest}
    >
      <Checkbox
        {...field}
        id={name}
        size="md"
        isRequired={isRequired}
        isReadOnly={isReadOnly}
        isIndeterminate={typeof field.value !== 'boolean'}
        isInvalid={!!error && isTouched}
        isChecked={isChecked}
        isDisabled={isSubmitting || isDisabled}
        onChange={handleFieldChange}
        {...checkBoxProps}
      >
        {label}
        <Text
          as="span"
          fontWeight={isRequired ? 'medium' : 'normal'}
          fontStyle={!isRequired ? 'italic' : 'normal'}
          fontSize="sm"
          color={isRequired ? requiredColor : 'chakra-subtle-text'}
          ml={isRequired ? 1 : 3}
        >
          {isRequired ? '*' : `(${isReadOnly ? 'read-only' : 'optional'})`}
        </Text>
        {children}
      </Checkbox>
    </FormControl>
  )
}

CheckboxSingleControl.displayName = 'CheckboxSingleControl'
