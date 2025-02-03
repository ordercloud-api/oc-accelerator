import {
  Box,
  ButtonGroup,
  Center,
  Flex,
  HStack,
  Icon,
  IconButton,
  Select,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  VStack,
} from '@chakra-ui/react'
import { BiConfused } from 'react-icons/bi'
import { UseQueryResult } from '@tanstack/react-query'
import {
  ColumnDef,
  Header,
  HeaderGroup,
  Row,
  TableState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ListPage, RequiredDeep } from 'ordercloud-javascript-sdk'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  TbChevronDown,
  TbChevronLeft,
  TbChevronRight,
  TbChevronUp,
  TbChevronsLeft,
  TbChevronsRight,
  TbLink,
} from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { getHeaderNameOverride, getPropertyLabel } from '../../utils/spec.utils'
import { IDefaultResource } from './ListView'

export interface IDataTable<TData = unknown, TColumn = unknown> {
  resource: string
  columns: ColumnDef<RequiredDeep<TData>, TColumn>[]
  query: UseQueryResult<any>
  listAssignments?: boolean
  itemHrefResolver?: (item: unknown) => string
  tableState: Partial<TableState>
  onOptionChange: (key: any, resetPage?: boolean) => (value: any) => void
  itemActions?: (item: unknown) => any
}

export interface DataTableOptions<TData = unknown, TColumn = unknown> {
  data: RequiredDeep<ListPage<TData>>
  columns: ColumnDef<RequiredDeep<TData>, TColumn>[]
  state: Partial<TableState>
}

function useDataTable<TData = unknown, TColumn = unknown>(
  options: DataTableOptions<TData, TColumn>
) {
  const { data, columns, state } = options

  const table = useReactTable<RequiredDeep<TData>>({
    data: data?.Items || [],
    columns,
    pageCount: data?.Meta?.TotalPages,
    state,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    debugTable: true,
  })

  return table
}

const defaultData = {
  Items: [],
  Meta: {
    TotalPages: 0,
    TotalCount: 0,
    Page: 1,
    PageSize: 20,
    ItemRange: [0, 21],
    NextPageKey: '',
  },
}

const DataTable = <T extends IDefaultResource>({
  query,
  columns,
  tableState,
  resource,
  listAssignments,
  onOptionChange,
  itemHrefResolver,
  itemActions,
}: IDataTable<T>) => {
  const [queryData, setQueryData] = useState(defaultData)
  const { colorMode } = useColorMode()

  const noResults = useMemo(() => {
    return (
      (!query.data && !query.isLoading && query.isPending) || // query paused because there are no assignment IDs to filter on
      (query.data?.Items && query.data.Items.length === 0)
    )
  }, [query])

  useEffect(() => {
    setQueryData((qd) => {
      const isSame = JSON.stringify(qd) === JSON.stringify(query.data)
      if (isSame) {
        return qd
      }
      return query.data
    })
  }, [query])

  const dataTableOptions = useMemo(() => {
    return {
      data: queryData,
      columns,
      state: tableState,
    }
  }, [queryData, columns, tableState])

  const table = useDataTable(dataTableOptions)

  const getAssignmentCellHref = useCallback((cell: any, item: any) => {
    const buyerID = item['BuyerID']
    const header = cell.column.columnDef.header
    const resourceID = item[header]
    if (!resourceID) return ''

    switch (header) {
      case 'BuyerID':
        return `/buyers/${resourceID}`
      case 'PriceScheduleID':
        return `/price-schedules/${resourceID}`
      case 'ProductID':
        return `/products/${resourceID}`
      case 'UserGroupID':
        return `/buyers/${buyerID}/user-groups/${resourceID}`
      default:
        return ''
    }
  }, [])

  const tableHeaderRowHeader = useCallback(
    (header: Header<unknown, unknown>) => {
      return (
        <Th
          key={header.id}
          borderInline="1px"
          py="0"
          background="chakra-body-bg"
          _last={{ borderRightWidth: '0px !important' }}
          borderTop="0px"
          borderBottomWidth={header.isPlaceholder ? '0px !important' : undefined}
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
          colSpan={header.colSpan}
          verticalAlign="baseline"
          position="relative"
        >
          {header.isPlaceholder ? null : (
            <Text
              h="55"
              display="flex"
              alignItems="center"
              gap="1"
              cursor={header.column.getCanSort() ? 'pointer' : 'unset'}
              {...{
                onClick: () => {
                  const sortDirection = header.column.getIsSorted()
                  if (header.column.getCanSort())
                    onOptionChange('sortBy')(
                      !sortDirection
                        ? header.column.id
                        : sortDirection === 'asc'
                        ? `!${header.column.id}`
                        : undefined
                    )
                },
              }}
            >
              {flexRender(
                getHeaderNameOverride(
                  (header.column.columnDef?.id as string) ??
                    (header.column.columnDef.header as string),
                  resource
                ) ?? getPropertyLabel(header.column.columnDef.header as string),
                header.getContext()
              )}
              {{
                asc: (
                  <Icon
                    size="md"
                    as={TbChevronUp}
                  />
                ),
                desc: (
                  <Icon
                    size="md"
                    as={TbChevronDown}
                  />
                ),
              }[header.column.getIsSorted() as string] ?? null}
            </Text>
          )}
        </Th>
      )
    },
    [colorMode, onOptionChange, resource]
  )

  const tableHeaderRow = useCallback(
    (headerGroup: HeaderGroup<RequiredDeep<T>>) => (
      <Tr
        _notLast={{ zIndex: -1 }}
        key={headerGroup.id}
        position="sticky"
        top="-1px"
        paddingTop="1px"
        boxShadow={`0 1px 0 ${
          colorMode === 'dark' ? 'var(--chakra-colors-gray-700)' : 'var(--chakra-colors-gray-100)'
        }`}
      >
        {itemActions && (
          <Th
            key={headerGroup.id}
            borderBottomWidth="0px !important"
          ></Th>
        )}

        {headerGroup.headers?.map((h: any) => tableHeaderRowHeader(h))}
      </Tr>
    ),
    [colorMode, itemActions, tableHeaderRowHeader]
  )

  const tableCell = useCallback((row: any, cell: any, hrefValue: any) => {
    const assignmentLink = listAssignments ? getAssignmentCellHref(cell, row?.original) : undefined

    return (
      <Td
        borderInline="1px"
        _last={{ borderRightWidth: '0px !important' }}
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
        fontWeight="normal"
        h="1px"
        p={0}
        textAlign={cell.align}
        w={cell.width}
        minW={cell.minWidth ? cell.minWidth : 150}
        verticalAlign="middle"
        key={cell.id}
      >
        <Box
          display="flex"
          alignItems="center"
          boxSize="full"
          minH="55"
          as={hrefValue ? Link : undefined}
          to={hrefValue}
          py="3"
          px="6"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
          {assignmentLink && (
            <Box ml={2}>
              <IconButton
                icon={<Icon as={TbLink} />}
                variant="unstyled"
                aria-label={`Link to ${cell.column.columnDef.header}`}
                as={Link}
                to={assignmentLink}
              />
            </Box>
          )}
        </Box>
      </Td>
    )
  }, [])

  const tableRow = useCallback(
    (row: Row<unknown>) => {
      const hrefValue = itemHrefResolver ? itemHrefResolver(row?.original) : ''
      return (
        <Tr
          key={row.id}
          _hover={{
            outline: '1px solid',
            outlineColor: 'chakra-border-color',
            '& > td': {
              background: 'chakra-subtle-bg',
              borderColor: 'chakra-border-color',
              borderBottomColor: colorMode === 'dark' ? 'gray.700' : 'gray.100',
            },
          }}
        >
          {itemActions && (
            <Td
              shadow="sm"
              marginBlock="-2px"
              backgroundColor={`${colorMode === 'dark' ? 'gray.800' : 'white'} !important`}
              position="sticky"
              left="0px"
            >
              {itemActions(row?.original)}
            </Td>
          )}
          {row.getVisibleCells().map((cell: any) => tableCell(row, cell, hrefValue))}
        </Tr>
      )
    },
    [colorMode, getAssignmentCellHref, itemActions, itemHrefResolver, listAssignments]
  )

  return !query.data && query.isLoading ? null : (
    <>
      {noResults ? (
        <Center minH="75vh">
          <VStack
            gap={0}
            color="chakra-subtle-text"
          >
            <Icon
              as={BiConfused}
              boxSize="2rem"
            />
            <Text
              as="td"
              p={3}
              fontSize="2xl"
            >
              No results
            </Text>
          </VStack>
        </Center>
      ) : (
        <>
          <TableContainer
            as={OverlayScrollbarsComponent}
            overflowY="auto"
            sx={{
              '& div[data-overlayscrollbars-contents]': {
                maxHeight: 'calc(100vh - 224px)',
              },
            }}
          >
            <Table>
              <Thead>{table.getHeaderGroups()?.map(tableHeaderRow)}</Thead>
              <Tbody>{table.getRowModel().rows?.map(tableRow)}</Tbody>
            </Table>
          </TableContainer>
          <HStack
            id="pagination-nav"
            fontSize="sm"
            fontWeight="normal"
            p={3}
            justifyContent="center"
            position="sticky"
            bottom={0}
            left={0}
            h="60px !important"
            borderTop="1px solid"
            borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            alignItems="center"
            ml={{ xl: '215px' }}
          >
            <ButtonGroup
              alignItems="center"
              justifyContent={{ base: 'flex-start', xl: 'center' }}
              flexGrow="1"
            >
              <IconButton
                size="sm"
                isDisabled={!table.getCanPreviousPage()}
                onClick={() => onOptionChange('page')('1')}
                aria-label="Paginate from the start"
                icon={<Icon as={TbChevronsLeft} />}
              />
              <IconButton
                size="sm"
                icon={<Icon as={TbChevronLeft} />}
                aria-label="Paginate to previous page"
                isDisabled={!table.getCanPreviousPage()}
                onClick={() => onOptionChange('page')(table.getState().pagination.pageIndex)}
              />
              <Flex
                width="120px"
                h="25px"
                alignItems="center"
                justifyContent="center"
              >
                {table.getPageCount() === 0 && !noResults ? (
                  <Skeleton
                    h="21px"
                    w="12ch"
                    opacity=".5"
                  />
                ) : (
                  <Text whiteSpace="nowrap">
                    {table.getPageCount() === 0
                      ? 'Page 0 of 0'
                      : `Page ${table.getState().pagination.pageIndex + 1} of ${table
                          .getPageCount()
                          .toLocaleString()}`}
                  </Text>
                )}
              </Flex>
              <IconButton
                size="sm"
                icon={<Icon as={TbChevronRight} />}
                aria-label="Paginate to next page"
                isDisabled={!table.getCanNextPage()}
                onClick={() => onOptionChange('page')(table.getState().pagination.pageIndex + 2)}
              />
              <IconButton
                size="sm"
                icon={<Icon as={TbChevronsRight} />}
                aria-label="Paginate to last page"
                isDisabled={!table.getCanNextPage()}
                onClick={() => onOptionChange('page')(table.getPageCount())}
              />
            </ButtonGroup>
            <HStack>
              <Text whiteSpace="nowrap">Show: </Text>
              <Select
                size="sm"
                value={table.getState().pagination.pageSize || 20}
                onChange={(e) => onOptionChange('pageSize')(e.target.value)}
              >
                {[5, 10, 20, 30, 50].map((size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                ))}
              </Select>
              <Box whiteSpace="nowrap"> items per page</Box>
            </HStack>
          </HStack>
        </>
      )}
    </>
  )
}

export default DataTable
