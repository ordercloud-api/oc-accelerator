import { Box, Button, Container, HStack, useDisclosure } from '@chakra-ui/react'
import pluralize from 'pluralize'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { ColumnDef, PaginationState, TableState, createColumnHelper } from '@tanstack/react-table'
import { RequiredDeep } from 'ordercloud-javascript-sdk'
import { useColumns, useDeleteAssignment, useHasAccess } from '@ordercloud/react-sdk'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ActionMenu from '../ResourceList/ActionMenu'
import ListView from '../ResourceList/ListView'
import ResourceSelector from '../ResourceAssignment/ResourceSelector'
import DeleteModal from '../ResourceList/modals/DeleteModal'
import { isNil, mapKeys, pickBy } from 'lodash'
import { ToParameterKey } from '../ResourceAssignment/ResourceAssignment'
import ResourceAssignmentCreateEditModal from '../ResourceAssignment/modals/ResourceAssignmentCreateEditModal'

interface AssignmentListProps {
  resourceName: string
  primaryAssignmentKey?: string
}

const AssignmentList: FC<AssignmentListProps> = ({
  resourceName,
  primaryAssignmentKey
}) => {
  const columnHelper = createColumnHelper<RequiredDeep<unknown>>()
  const assignmentModalDisclosure = useDisclosure()
  const deleteModalDisclosure = useDisclosure()
  const { isAdmin } = useHasAccess(resourceName)
  const { assignmentProperties } = useColumns(resourceName)

  const [actionItem, setActionItem] = useState<any>()
  const [buyerId, setBuyerId] = useState('')
  const [userGroupId, setUserGroupId] = useState('')
  const [supplierId, setSupplierId] = useState('')

  const [searchParams] = useSearchParams()
  const params = useParams() as { [key: string]: string }
  const navigate = useNavigate()

  const initialBody = useMemo(() => {
    const result: { [key: string]: string } = {}
    if (assignmentProperties) {
      Object.keys(assignmentProperties).forEach((key) => {
        const value = params[ToParameterKey(key)]
        if (value) result[key] = value
      })
    }
    return result
  }, [assignmentProperties, params])

  const assignmentKeyForResource = useMemo(
    () => primaryAssignmentKey || `${pluralize.singular(resourceName)}ID`,
    [resourceName, primaryAssignmentKey]
  )

  const columns = useMemo(() => {
    const properties = assignmentProperties ? Object.keys(assignmentProperties) : []
    return properties
      .filter((p) => p !== assignmentKeyForResource)
      .map((c) => {
        return columnHelper.accessor(c, {
          id: c,
          header: c,
          enableResizing: true,
          enableSorting: false,
          cell: (info) => {
            return info.getValue()
          },
        })
      }) as ColumnDef<unknown, unknown>[]
  }, [assignmentKeyForResource, assignmentProperties, columnHelper])

  const listFilterValue = useMemo(
    () => params[ToParameterKey(assignmentKeyForResource)],
    [assignmentKeyForResource, params]
  )

  useEffect(() => {
    setUserGroupId('')
  }, [buyerId, supplierId])


  const filterParams = useMemo(() => {
    return {
      BuyerID: buyerId,
      UserGroupID: userGroupId,
      SupplierID: supplierId,
      [assignmentKeyForResource]: listFilterValue || '' // price schedule, security profile, bundle ID
    }
  }, [assignmentKeyForResource, buyerId, listFilterValue, supplierId, userGroupId])

  const deleteParams = useMemo(() => {
    return pickBy(
      mapKeys(actionItem, (_val, key) => ToParameterKey(key)),
      (value, _key) => !isNil(value)
    )
  }, [actionItem])

  const { mutateAsync: deleteAsync } = useDeleteAssignment(resourceName, undefined, deleteParams)

  const renderActionsMenu = useCallback(
    (item: any) => {
      return (
        <ActionMenu
          item={item}
          isAssignment={true}
          onOpen={() => setActionItem(item)}
          onDelete={deleteModalDisclosure.onOpen}
        />
      )
    },
    [deleteModalDisclosure.onOpen]
  )

  const renderCreateButton = useMemo(() => {
    return (
      <Button
        variant="solid"
        onClick={() => {
          setActionItem(null)
          assignmentModalDisclosure.onOpen()
        }}
      >
        Create Assignment
      </Button>
    )
  }, [assignmentModalDisclosure])

  const pagination = useMemo(() => {
    const pageValue = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')
    return {
      pageIndex: pageValue ? Number(pageValue) - 1 : 0,
      pageSize: pageSize ?? 20,
    } as PaginationState
  }, [searchParams])

  const tableState = useMemo(() => {
    return {
      pagination,
    } as Partial<TableState>
  }, [pagination])

  const handleRoutingChange = useCallback(
    (queryKey: string, resetPage?: boolean) => (value?: string | boolean | number) => {
      const searchParams = new URLSearchParams(location.search)
      const hasPageParam = Boolean(searchParams.get('page'))
      const prevValue = searchParams.get(queryKey)
      if (!value && !prevValue) return
      if (value) {
        if (prevValue !== value) {
          searchParams.set(queryKey, value.toString())
          if (hasPageParam && resetPage) searchParams.delete('page') // reset page on filter change
        }
      } else if (prevValue) {
        searchParams.delete(queryKey)
      }

      navigate(
        { pathname: location.pathname, search: searchParams.toString() },
        { state: { shallow: true } }
      )
    },
    [navigate]
  )

  return (
    <ListView<any>
      itemActions={isAdmin ? renderActionsMenu : undefined}
      onOptionChange={handleRoutingChange}
      columnDef={columns}
      parameters={params}
      hasAccess={isAdmin}
      listOptions={filterParams}
      tableState={tableState}
      resourceName={resourceName}
      listAssignments={true}
    >
      {({ renderContent }) => (
        <Container
          maxW="full"
          p={0}
          maxH="calc(100% - 61px)"
          display="flex"
          flexFlow="column nowrap"
        >
          <HStack my={4}>
            <HStack flexGrow={1}>
              <ResourceSelector
                resourceName="Buyers"
                value={buyerId}
                onChange={setBuyerId}
                disabled={!!supplierId}
              />
              {resourceName === 'SecurityProfiles' ? (
                <>
                  <ResourceSelector
                    resourceName="Suppliers"
                    value={supplierId}
                    onChange={setSupplierId}
                    disabled={!!buyerId}
                  />
                  <ResourceSelector
                    isSecurityProfile
                    resourceName={'UserGroups'}
                    value={userGroupId}
                    dependencies={[null, buyerId, null, supplierId]}
                    onChange={setUserGroupId}
                  />
                </>
              ) : (
                <ResourceSelector
                  resourceName={'UserGroups'}
                  value={userGroupId}
                  dependencies={[buyerId]}
                  onChange={setUserGroupId}
                />
              )}
            </HStack>
            <Box
              flexShrink={0}
              ml="auto"
            >
              {isAdmin && renderCreateButton}
            </Box>
          </HStack>
          {renderContent}
          <ResourceAssignmentCreateEditModal
            disclosure={assignmentModalDisclosure}
            onComplete={() => {
              setActionItem(null)
            }}
            onDiscard={() => {
              setActionItem(null)
              assignmentModalDisclosure.onClose()
            }}
            bodyFieldsToHide={[assignmentKeyForResource]}
            existingAssignmentBody={initialBody}
            saveAssignmentOperationId={resourceName}
            isCreatingNew={!actionItem}
            operationParams={params}
          />
          <DeleteModal
            onComplete={deleteAsync}
            resource={resourceName}
            item={actionItem}
            disclosure={deleteModalDisclosure}
            isAssignment
          />
        </Container>
      )}
    </ListView>
  )
}

export default AssignmentList
