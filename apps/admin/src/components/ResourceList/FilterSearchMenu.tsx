import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  useColorModeValue,
} from '@chakra-ui/react'
import { title } from 'case'
import { get } from 'lodash'
import pluralize from 'pluralize'
import { FC, useCallback, useState } from 'react'
import { TbPlus, TbSearch } from 'react-icons/tb'
import { DebouncedInput } from '../Shared/DebouncedInput'
import { ColumnFiltersState } from '@tanstack/react-table'
import { ServiceListOptions } from './ListView'
import { OpenAPIV3 } from 'openapi-types'
import { getHeaderNameOverride } from '../../utils/spec.utils'

interface FilterSearchMenuProps {
  resourceName: string
  columnHeaders: string[] | undefined
  columnFilters: ColumnFiltersState
  listOptions: ServiceListOptions
  properties: { [name: string]: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject } | undefined
  handleRoutingChange: (
    queryKey: string,
    resetPage?: boolean,
    index?: number
  ) => (value?: string | boolean | number) => void
}

const FilterSearchMenu: FC<FilterSearchMenuProps> = ({
  resourceName,
  columnHeaders,
  columnFilters,
  listOptions,
  properties,
  handleRoutingChange,
}) => {
  const subtleIcon = useColorModeValue('blackAlpha.500', 'whiteAlpha.500')
  const [newFilterAccessor, setNewFilterAccessor] = useState<string>('ID')
  const [newFilterValue, setNewFilterValue] = useState<string | number | undefined>('')

  const getLabel = useCallback(
    (id: string) => {
      let override = getHeaderNameOverride(id, resourceName)
      if (!override) return id

      const segments = id.split('.')
      if (segments.length > 1) {
        segments.pop()
        override = `${segments}.${override}`
      }

      return override
    },
    [resourceName]
  )

  const getFilterTags = useCallback(() => {
    return (
      <Box mb={1}>
        {columnFilters.map((cf: any, idx) => (
          <Tag
            key={idx}
            mr={1}
            mb={1}
            borderRadius="full"
            colorScheme="primary"
          >
            <TagLabel>{`${getLabel(cf.id)}=${cf.value}`}</TagLabel>
            <TagCloseButton
              onClick={() => {
                const index = columnFilters.filter((c) => c.id === cf.id).indexOf(cf)
                handleRoutingChange(cf.id, true, index)(undefined)
              }}
            />
          </Tag>
        ))}
      </Box>
    )
  }, [columnFilters, getLabel, handleRoutingChange])

  return (
    <>
      <InputGroup
        w="400px"
        maxW="100%"
      >
        <InputLeftElement pointerEvents="none">
          <Icon
            as={TbSearch}
            color={subtleIcon}
          />
        </InputLeftElement>
        <DebouncedInput
          pl={10}
          placeholder={`Search ${title(resourceName).toLocaleLowerCase()}...`}
          value={(listOptions['search'] as string) || ''}
          onChange={(v) => {
            handleRoutingChange('search', true)(v)
          }}
        />
        {(listOptions['search'] as string)?.length > 0 && (
          <InputRightElement width="4.5rem">
            <Button
              variant="outline"
              h="1.75rem"
              size="sm"
              onClick={() => handleRoutingChange('search', true)('')}
            >
              Clear
            </Button>
          </InputRightElement>
        )}
      </InputGroup>

      <Popover size="xl">
        <PopoverTrigger>
          <Button position="relative">
            Filter
            {columnFilters.length > 0 && (
              <Tag
                position="absolute"
                right="-1"
                top="-1"
                size="sm"
                borderRadius="full"
                variant="solid"
                colorScheme="primary"
              >
                <TagLabel>{columnFilters.length}</TagLabel>
              </Tag>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent w="500px">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {columnFilters.length
              ? `${columnFilters.length} active filter${columnFilters.length === 1 ? '' : 's'}`
              : `Filter by ${pluralize.singular(title(resourceName))} properties`}
          </PopoverHeader>
          <PopoverBody>
            {columnFilters.length > 0 && getFilterTags()}
            <HStack>
              <Select
                value={newFilterAccessor}
                onChange={(e) => setNewFilterAccessor(e.target.value)}
              >
                {columnHeaders?.filter(k => k !== 'xp').map((h: string) => {
                  const schema = get(properties, h) as any
                  if (schema?.allOf || schema.properties) {
                    const properties = schema?.allOf
                      ? schema.allOf[0].properties
                      : schema?.properties
                    return Object.keys(properties).filter(k => k !== 'Password' && k !== 'xp').map((k) => {
                      const tid = `${h}.${k}`
                      return (
                        <option
                          key={tid}
                          value={tid}
                        >
                          {getLabel(tid)}
                        </option>
                      )
                    })
                  }
                  return (
                    <option
                      key={h}
                      value={h}
                    >
                      {getLabel(h)}
                    </option>
                  )
                })}
              </Select>
              <Input
                placeholder="Filter value..."
                value={newFilterValue}
                onChange={(e) => setNewFilterValue(e.target.value)}
              />
              <IconButton
                aria-label="Add Filter"
                onClick={() => {
                  handleRoutingChange(newFilterAccessor, true)(newFilterValue)
                  setNewFilterValue('')
                }}
              >
                <Icon as={TbPlus} />
              </IconButton>
            </HStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  )
}

export default FilterSearchMenu
