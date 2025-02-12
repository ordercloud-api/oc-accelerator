import { Flex, useToast } from '@chakra-ui/react'
import { useListAssignments, useOcResourceList } from '@ordercloud/react-sdk'
import { ColumnDef, TableState } from '@tanstack/react-table'
import { RequiredDeep } from 'ordercloud-javascript-sdk'
import { ReactElement, useEffect, useMemo } from 'react'
import { ApiError } from '../OperationForm'
import DataTable from './DataTable'

export interface IDefaultResource {
  ID?: string
  Name?: string
}

export type ListViewTemplate = ReactElement | ReactElement[] | string

export type ServiceListOptions = { [key: string]: ServiceListOptions | string }

interface IListView<TData = unknown, TColumn = unknown> {
  itemHrefResolver?: (item: unknown) => string
  children: (props: ListViewChildrenProps) => ReactElement
  columnDef: ColumnDef<RequiredDeep<TData>, TColumn>[]
  parameters?: { [key: string]: string }
  listOptions?: ServiceListOptions
  tableState: Partial<TableState>
  resourceName: string
  preloadAssignments?: boolean
  listAssignments?: boolean
  hasAccess?: boolean
  onOptionChange: (key: any, resetPage?: boolean) => (value: any) => void
  itemActions?: (item: unknown) => any
}

export interface ListViewChildrenProps {
  updateQuery?: (
    queryKey: string,
    resetPage?: boolean
  ) => (value: string | boolean | number) => void
  deleteQueryKey?: (queryKey: { [key: string]: string }) => void
  renderContent?: ListViewTemplate
}

const ListView = <T extends IDefaultResource>({
  columnDef,
  parameters,
  listOptions,
  tableState,
  resourceName,
  listAssignments,
  preloadAssignments,
  hasAccess,
  itemHrefResolver,
  children,
  onOptionChange,
  itemActions,
}: IListView<T>) => {
  
  const dataQuery = useOcResourceList(resourceName, listOptions, parameters, {
    staleTime: 300000, // 5 min
    disabled: !(!preloadAssignments && !listAssignments ? hasAccess : !!listOptions?.ID),
  })

  const assignmentDataQuery = useListAssignments(resourceName, undefined, listOptions, parameters, {
    staleTime: 300000, // 5 min
    disabled: !(!!listAssignments && hasAccess),
  })

  const toast = useToast()

  useEffect(() => {
    const ocError = dataQuery?.error?.response?.data?.Errors[0] as ApiError
    if (ocError && !toast.isActive(ocError.ErrorCode)) {
      toast({
        id: ocError.ErrorCode,
        title: ocError.Message,
        status: 'error',
      })
    }
  }, [dataQuery.error?.response?.data?.Errors, dataQuery.isError, toast])

  const renderContent = useMemo(() => {
    return (
      <Flex
        flexFlow="column nowrap"
        h="100%"
        id="tableView"
        overflow="hidden"
      >
        <DataTable
          query={listAssignments ? assignmentDataQuery : dataQuery}
          columns={columnDef}
          tableState={tableState}
          onOptionChange={onOptionChange}
          itemHrefResolver={itemHrefResolver}
          itemActions={itemActions}
          resource={resourceName}
          listAssignments={!!listAssignments}
        />
      </Flex>
    )
  }, [
    listAssignments,
    assignmentDataQuery,
    dataQuery,
    columnDef,
    tableState,
    onOptionChange,
    itemHrefResolver,
    itemActions,
    resourceName,
  ])

  const childrenProps = useMemo(() => {
    return {
      renderContent,
    }
  }, [renderContent])

  return children(childrenProps)
}

export default ListView
