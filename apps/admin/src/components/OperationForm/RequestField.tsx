import {
  Box,
  Button,
  Code,
  FormControl,
  FormLabel,
  HStack,
  Text,
  UseDisclosureProps,
} from '@chakra-ui/react'
import { FC, useMemo } from 'react'
import {
  CheckboxSingleControl,
  InputControl,
  NumberInputControl,
  SelectControl,
  TextareaControl,
} from './Controls'
import { getLabelOverride, getPropertyLabel } from '../../utils/spec.utils'
import { relatedListOperationsByResource } from '../../config/related-resources'
import { useFormContext, useWatch } from 'react-hook-form'
import { RelatedResourceControl } from './Controls/related-resource-control'

interface IRequestField {
  resourceId: string
  schema: any
  path: string
  propKey: string
  hideLabel?: boolean
  removeCallback?: any
  hasInitialValues?: boolean
  editExpressionDisclosure?: UseDisclosureProps
}

const RequestField: FC<IRequestField> = ({
  path,
  propKey,
  schema,
  hideLabel,
  removeCallback,
  hasInitialValues,
  editExpressionDisclosure,
  resourceId,
}) => {
  const labelOverride = useMemo(() => {
    return getLabelOverride(path!, resourceId)
  }, [path, resourceId])

  const label = useMemo(() => {
    return labelOverride ?? getPropertyLabel(propKey)
  }, [labelOverride, propKey])

  const { control } = useFormContext()

  const relatedProperty = useMemo(
    () =>
      relatedListOperationsByResource[resourceId]?.[propKey] ||
      relatedListOperationsByResource['Assignments'][propKey],
    [resourceId, propKey]
  )
  const values = useWatch({ control, name: (relatedProperty?.dependencies || []) as string[] })

  const relatedOperationInfo = useMemo(() => {
    return relatedProperty?.operationInfo(values)
  }, [relatedProperty, values])

  const interprettedSchema = useMemo(() => {
    switch (schema.type) {
      case 'object':
        return <></>

      case 'integer':
        return (
          <NumberInputControl
            name={path}
            label={!hideLabel && label}
            isRequired={schema.required}
            isReadOnly={schema.readOnly}
            numberInputProps={{
              width: 'full',
              step: 1,
              precision: 0,
              min: schema.minimum,
              max: schema.maximum,
              inputMode: 'numeric',
            }}
            helperText={schema.description}
          />
        )
      case 'number':
        return (
          <NumberInputControl
            name={path}
            label={!hideLabel && label}
            isReadOnly={schema.readOnly}
            isRequired={schema.required}
            numberInputProps={{
              width: 'full',
              min: schema.minimum,
              max: schema.maximum,
            }}
            helperText={schema.description}
          />
        )
      case 'boolean':
        return (
          <CheckboxSingleControl
            name={path}
            label={!hideLabel && label}
            isRequired={schema.required}
            isReadOnly={schema.readOnly}
            helperText={schema.description}
          />
        )
      case 'string':
        if (relatedOperationInfo) {
          return (
            <RelatedResourceControl
              name={path}
              isRequired={schema.required}
              isReadOnly={schema.readOnly}
              operationInfo={relatedOperationInfo}
              renderFn={relatedProperty?.renderItem}
              label={!hideLabel && label}
              helperText={schema.description}
            />
          )
        }
        if (schema.enum) {
          return (
            <SelectControl
              mb={hideLabel ? 0 : 5}
              name={path}
              isRequired={schema.required}
              isReadOnly={schema.readOnly}
              selectProps={{
                options: schema.enum.map((o: any) => ({
                  label: o,
                  value: o,
                })),
              }}
              label={!hideLabel && label}
            />
          )
        }
        if (schema.format === 'date-time') {
          return (
            <InputControl
              mb={hideLabel ? 0 : 5}
              name={path}
              label={!hideLabel && `${label} (UTC)`}
              isReadOnly={schema.readOnly}
              isRequired={schema.required}
              inputProps={{
                type: 'datetime-local',
                minLength: schema.minLength ? schema.minLength : schema.required ? 1 : undefined,
                maxLength: schema.maxLength,
              }}
              helperText={schema.description}
            />
          )
        }
        if (label === 'Email') {
          return (
            <InputControl
              mb={hideLabel ? 0 : 5}
              name={path}
              label={!hideLabel && label}
              isRequired={schema.required}
              isReadOnly={schema.readOnly}
              inputProps={{
                type: 'email',
                minLength: schema.minLength ? schema.minLength : schema.required ? 1 : undefined,
                maxLength: schema.maxLength,
              }}
              helperText={schema.description}
            />
          )
        }
        if (label?.includes('Password') && hasInitialValues) {
          return (
            <InputControl
              mb={hideLabel ? 0 : 5}
              name={path}
              label={!hideLabel && label}
              isRequired={schema.required}
              isReadOnly={schema.readOnly}
              inputProps={{
                type: 'password',
                minLength: schema.minLength ? schema.minLength : schema.required ? 1 : undefined,
                maxLength: schema.maxLength,
              }}
              helperText={schema.description}
            />
          )
        }
        return schema.maxLength > 200 ? (
          <TextareaControl
            editExpressionDisclosure={editExpressionDisclosure}
            mb={hideLabel ? 0 : 5}
            name={path}
            label={!hideLabel && label}
            textareaProps={{
              minLength: schema.minLength ? schema.minLength : schema.required ? 1 : undefined,
              maxLength: schema.maxLength,
            }}
            isRequired={schema.required}
            isReadOnly={schema.readOnly}
            helperText={schema.description}
          />
        ) : (
          <>
            <InputControl
              mb={hideLabel ? 0 : 5}
              name={path}
              inputProps={{
                minLength: schema.minLength ? schema.minLength : schema.required ? 1 : undefined,
                maxLength: schema.maxLength,
              }}
              label={!hideLabel && label}
              isRequired={schema.required}
              isReadOnly={schema.readOnly}
              helperText={schema.description}
            />
          </>
        )
      default:
        return (
          <FormControl mb={5}>
            <FormLabel>{label}</FormLabel>
            <Text>
              UNHANDLED INPUT TYPE
              <Code>{`${schema.type} | ${schema.format} | ${schema.enum}`}</Code>
            </Text>
          </FormControl>
        )
    }
  }, [
    schema,
    path,
    hideLabel,
    label,
    relatedOperationInfo,
    hasInitialValues,
    editExpressionDisclosure,
    relatedProperty,
  ])

  return removeCallback && !schema.readOnly ? (
    <HStack mb={5}>
      <Box
        flexGrow={1}
        flexShrink={1}
      >
        {interprettedSchema}
      </Box>
      <Button
        flexShrink={0}
        colorScheme={'red'}
        size="sm"
        variant="ghost"
        onClick={removeCallback}
      >
        Remove
      </Button>
    </HStack>
  ) : (
    interprettedSchema
  )
}

export default RequestField
