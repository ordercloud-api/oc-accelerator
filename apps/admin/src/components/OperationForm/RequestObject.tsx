import { Box, HStack, Heading, useColorModeValue, Button, useDisclosure } from '@chakra-ui/react'
import { FC, Fragment, useCallback, useMemo } from 'react'
import RequestArray from './RequestArray'
import RequestField from './RequestField'
import { getLabelOverride, getPropertyLabel } from '../../utils/spec.utils'
import SCHEMA_SORT_ORDER from '../../config/schemaSortOrder.config'
import { formOverrides } from '../../config/formOverrides'
import ExpressionModal from './ExpressionBuilder/PromotionExpressionBuilder/ExpressionModal'

interface IRequestObject {
  unwrapped?: boolean
  resourceId: string
  formControl: any
  path?: string
  schema: any
  labelOverride?: string
  hideLabel?: boolean
  readOnly?: boolean
  showReadOnlyFields?: boolean
  removeCallback?: any
  bodyFieldsToHide?: string[]
  childOfArray?: boolean
  hasInitialValues?: boolean
}

const RequestObject: FC<IRequestObject> = ({
  unwrapped,
  resourceId,
  formControl,
  path,
  schema,
  labelOverride,
  readOnly,
  showReadOnlyFields,
  bodyFieldsToHide,
  hasInitialValues,
  removeCallback,
}) => {
  const boxBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')
  const boxBorder = useColorModeValue('blackAlpha.400', 'whiteAlpha.400')
  const label = useMemo(() => {
    return path && getPropertyLabel(path)
  }, [path])
  const editExpressionDisclosure = useDisclosure()

  const boxProps = useMemo(() => {
    return unwrapped
      ? {}
      : {
          padding: 5,
          mb: 10,
          border: '1px',
          background: boxBg,
          borderColor: boxBorder,
          rounded: 'md',
        }
  }, [unwrapped, boxBg, boxBorder])

  const sortedSchemaEntries = useMemo(() => {
    if (!schema) return []
    const hasOverrides = !!formOverrides?.[resourceId]
    const entries = Object.entries(schema).filter((e) => {
      const flattenedSchemaName =
        path === 'body' ? (e as any).at(0) : path?.replace('body.', '') + '.' + (e as any).at(0)
      return (
        (e as any).at(1)?.required ||
        (!bodyFieldsToHide?.includes((e as any).at(0)) &&
          (!hasOverrides || flattenedSchemaName.includes('xp') || 
            (hasOverrides && Object.keys(formOverrides[resourceId])?.includes(flattenedSchemaName))))
      )
    })
    const result = [] as any[]

    const arraySortOrder = hasOverrides ? Object.keys(formOverrides[resourceId]) : SCHEMA_SORT_ORDER

    arraySortOrder.forEach((propName) => {
      if (propName === 'xp') return
      if (schema[propName]) {
        result.push([propName, schema[propName]])
        return
      }
    })
    entries
      .filter((e) => !arraySortOrder.includes(e[0]))
      .forEach((e) => {
        result.push(e)
      })
    if (schema['xp'] && !hasOverrides) {
      result.push(['xp', { ...schema['xp'] }])
    } 

    return result
  }, [schema, resourceId, path, bodyFieldsToHide])

  const getArrayType: any = useCallback((items: any) => {
    if (items.type === 'array') {
      return `array<${getArrayType(items.items)}>`
    }
    return items.type
  }, [])

  const expressionType = useMemo(
    () => (resourceId === 'Promotions' ? 'Promotion' : 'Approval Rule'),
    [resourceId]
  )

  return !readOnly || showReadOnlyFields ? (
    <>
          <ExpressionModal
        disclosure={editExpressionDisclosure}
        type={expressionType}
      />
      <Box
        {...boxProps}
        mx="auto"
      >
        {!unwrapped && (!labelOverride || (labelOverride && !removeCallback)) && (
          <HStack
            w="full"
            alignItems="center"
            justifyContent="space-between"
            sx={{ '&:not(:has(+ *))': { marginBottom: 3 } }}
          >
            <Heading size="sm">{labelOverride || label || 'Request Body'}</Heading>
          </HStack>
        )}

        {removeCallback && (
          <HStack justifyContent="space-between">
            <Heading size="sm">{labelOverride}</Heading>
            {!readOnly && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme={'red'}
                aria-label={`Remove ${label}`}
                onClick={removeCallback}
              >
                Remove
              </Button>
            )}
          </HStack>
        )}

        {sortedSchemaEntries.map(([propKey, propSchema]: [string, any]) => {
          const propPath = path ? `${path}.${propKey}` : propKey
          if (!propSchema) return null
          if (readOnly) {
            propSchema.readOnly = true
          }
          if (propSchema.readOnly && !showReadOnlyFields) {
            return null
          }
          switch (propSchema.type) {
            case 'object':
              if (!propSchema.properties) {
                return (
                  <Fragment key={propKey}>
                    <RequestField
                      editExpressionDisclosure={editExpressionDisclosure}
                      resourceId={resourceId}
                      key={propPath}
                      path={propPath}
                      propKey={propKey}
                      schema={propSchema}
                      hasInitialValues={hasInitialValues}
                    />
                  </Fragment>
                )
              }
              return (
                <Fragment key={propKey}>
                  <RequestObject
                    resourceId={resourceId}
                    key={propPath}
                    path={propPath}
                    schema={propSchema.properties}
                    readOnly={propSchema.readOnly}
                    formControl={formControl}
                    showReadOnlyFields={showReadOnlyFields}
                    hasInitialValues={hasInitialValues}
                    labelOverride={getLabelOverride(propPath, resourceId)}
                  />
                </Fragment>
              )
            case 'array':
              return (
                <Fragment key={propKey}>
                  <RequestArray
                    resourceId={resourceId}
                    key={propPath}
                    propKey={propKey}
                    path={propPath}
                    formControl={formControl}
                    schema={propSchema}
                    showReadOnlyFields={showReadOnlyFields}
                    hasInitialValues={hasInitialValues}
                  />
                </Fragment>
              )
            default:
              return !propSchema.readOnly || showReadOnlyFields ? (
                <Fragment key={propKey}>
                  <RequestField
                    editExpressionDisclosure={editExpressionDisclosure}
                    resourceId={resourceId}
                    key={propPath}
                    path={propPath}
                    propKey={propKey}
                    schema={propSchema}
                    hasInitialValues={hasInitialValues}
                  />
                </Fragment>
              ) : null
          }
        })}
      </Box>
    </>
  ) : null
}

export default RequestObject
