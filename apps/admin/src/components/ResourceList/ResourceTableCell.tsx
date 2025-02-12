import { Badge, Box, SimpleGrid, Tag, Text, Tooltip } from '@chakra-ui/react'
import { FC, useCallback, useMemo } from 'react'
import { getType } from '../../utils/spec.utils'
import { currencyFormats } from '@ordercloud/react-sdk'
import { useParams } from 'react-router'

interface ResourceTableCellProps {
  properties: any
  value: any
  accessor: string
  row: string
  resource: string
}

function stripHTML(myString: string) {
  const regex = /(&nbsp;|<([^>]+)>)/gi
  const strippedHTML = myString.replace(regex, '')
  return strippedHTML
}

const ResourceTableCell: FC<ResourceTableCellProps> = ({
  value,
  properties,
  accessor,
  row,
  resource,
}) => {
  const type = useMemo(() => getType(properties, value), [properties, value])
  const routeParams = useParams() as { [key: string]: string }

  const renderCellValue = useCallback(
    (_header: string, value: any, properties: any) => {
      switch (type) {
        case 'undefined':
          return <></>
        case 'string':
          if (properties?.maxLength && properties?.maxLength > 200) {
            return (
              <Box
                mx={-6}
                px={6}
                my={-4}
                py={2}
              >
                <Text
                  w="prose"
                  whiteSpace="break-spaces"
                  noOfLines={2}
                  fontSize="xs"
                  title={value?.toString()}
                >
                  {value?.toString() ? stripHTML(value?.toString()) : ''}
                </Text>
              </Box>
            )
          } else {
            return <Text whiteSpace="nowrap">{value?.toString()}</Text>
          }
        case 'date-time':
          if (!value) {
            return <></>
          }
          // eslint-disable-next-line no-case-declarations
          const date = new Date(value)
          return (
            <Text>
              <Text
                as="span"
                whiteSpace="nowrap"
              >
                {date.toLocaleDateString('en-US', {
                  timeZone: 'UTC',
                })}
              </Text>
              <Text
                ml={2}
                as="span"
                whiteSpace="nowrap"
              >
                {`${date.toLocaleTimeString('en-US', {
                  timeZone: 'UTC',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })} (UTC)`}
              </Text>
            </Text>
          )
        case 'array':
          return typeof value?.at(0) === 'string' ? (
            <SimpleGrid
              gridTemplateColumns="repeat(3, auto) auto"
              gap={1}
            >
              {value?.slice(0, 3).map((v: any) => (
                <Badge
                  key={v}
                  textTransform="none"
                  fontWeight="normal"
                  variant="outline"
                >
                  {typeof v === 'string' ? v : JSON.stringify(v)}
                </Badge>
              ))}
              {value?.slice(4, -1).length > 0 &&
                (value?.slice(4, -1).length === 1 ? (
                  <Badge
                    textTransform="none"
                    fontWeight="normal"
                    variant="outline"
                  >{`${value?.slice(4, -1)[0]}`}</Badge>
                ) : (
                  <Tooltip
                    fontSize="xs"
                    label={value?.slice(4, -1).join(', ')}
                  >
                    <Badge
                      textTransform="none"
                      fontWeight="normal"
                      variant="outline"
                    >{`${value?.slice(4, -1).length} more items...`}</Badge>
                  </Tooltip>
                ))}
            </SimpleGrid>
          ) : (
            <>{!!value && JSON.stringify(value)}</>
          )
        case 'boolean':
          return typeof value === 'boolean' ? (
            <Tag
              size="sm"
              colorScheme={value ? 'green' : 'red'}
            >
              {value?.toString()}
            </Tag>
          ) : (
            <></>
          )
        case 'enum':
          return (
            <Tag
              size="sm"
              colorScheme="yellow"
            >
              {value?.toString()}
            </Tag>
          )
        case 'number':
          if (value && currencyFormats[resource]?.currencyProperties.includes(accessor)) {
            const paramsObj = currencyFormats[resource]?.dependencies?.map((d) => routeParams[d])
            const currencyFormat = currencyFormats[resource].renderCurrencyInputs(row, paramsObj!)

            return (
              <Text>
                {Intl.NumberFormat(currencyFormat.languageType, {
                  style: 'currency',
                  currencyDisplay: 'narrowSymbol',
                  currency: currencyFormat.currencyType,
                })
                  .format(value?.toString())
                  .concat(` (${currencyFormat.currencyType})`)}
              </Text>
            )
          }
          return <Text>{value?.toString()}</Text>
        default:
          return <Text>{value?.toString()}</Text>
      }
    },
    [type, resource, accessor, row, routeParams]
  )

  return <>{renderCellValue(type, value, properties)}</>
}

export default ResourceTableCell
