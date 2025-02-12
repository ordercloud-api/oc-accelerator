import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Alert as ChakraAlert,
  Checkbox,
  Container,
  HStack,
  Portal,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import {
  useColumns,
  useDeleteAssignment,
  useHasAccess,
  useListAssignments,
  useMutateAssignment,
} from '@ordercloud/react-sdk'
import { PaginationState, TableState, VisibilityState } from '@tanstack/react-table'
import Case from 'case'
import { cloneDeep, kebabCase, mapKeys } from 'lodash'
import { OrderCloudError } from 'ordercloud-javascript-sdk'
import pluralize from 'pluralize'
import { FC, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import SCHEMA_SORT_ORDER from '../../config/schemaSortOrder.config'
import { tableOverrides } from '../../config/tableOverrides'
import { ApiError } from '../OperationForm'
import { PrimaryActionRefContext } from '../ResourceDetail/ResourceDetail'
import ActionMenu from '../ResourceList/ActionMenu'
import ListView, { ServiceListOptions } from '../ResourceList/ListView'
import DeleteModal from '../ResourceList/modals/DeleteModal'
import { cellCallback } from '../ResourceList/ResourceList'
import NoAccessMessage from '../Shared/NoAccessMessage'
import ResourceAssignmentCreateEditModal from './modals/ResourceAssignmentCreateEditModal'
import ResourceSelector from './ResourceSelector'

export interface IResourceAssignment {
  /** The resource that is being assigned to*/
  fromResource: string
  /** The resource receiving the assignment */
  toResource: string
  hrefOverride?: string
  /** Optional. Will add a "Level" filter to the list request to filter by level (Company, Group, User). */
  level?: string
  /**Used for the hrefResolver to know where to send the user if they click an assignment item */
  // itemBaseHref?: string;
  // /**If the assignment only contains items in the route, then there is nothing to edit, therefore hide the action */
  hideEditAction?: boolean
  /**Hide the fields in this array, if they are pre-populated with an ID from a detail page */
  fieldsToHide?: string[]
  /**The plural name of the resource that the resource list depends on */
  switcherResourceName?: string
  /**The key to be used in the request to list resources with this dependency. Note: MUST be in parameter-case e.g. buyerID _not_ PascalCase */
  switcherIdKey?: string
  /**If the assignment id key is not equal to the from resource, then override it. Format like a body id key e.g. BuyerID */
  assignmentIdKeyOverride?: string
  /**If the assignment is direct to buyer company, pass true. Modifies the UI to accomodate */
  directCompanyLevelAssignment?: boolean
  /**Optional text used for alert at the top of the ResourceAssignment component */
  alertText?: string
  /**Optional ID properties to show in Assignment column */
  configOptions?: string[]
  /**Optional filters to always pass into listResourcesFromAssignmentBody call */
  filters?: {
    [filterKey: string]: string
  }
  additionalRequiredParams?: string[]
  reverseDirection?: boolean
  operationInclusion?: string
}

export const ToParameterKey = (s?: string): string => {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : ''
}

const normalizeResource = (resource: string): string => {
  switch (resource) {
    case 'AdminUsers':
    case 'SupplierUsers':
      return 'Users'
    case 'AdminUserGroups':
    case 'SupplierUserGroups':
      return 'UserGroups'
    default:
      return resource
  }
}

const ResourceAssignment: FC<IResourceAssignment> = ({
  fromResource,
  toResource,
  fieldsToHide = [],
  switcherResourceName,
  switcherIdKey,
  assignmentIdKeyOverride,
  directCompanyLevelAssignment,
  alertText,
  configOptions,
  reverseDirection,
  operationInclusion,
  hideEditAction,
  level,
  hrefOverride,
  filters
}) => {
  const primaryActionContainerRef = useContext(PrimaryActionRefContext)
  const deleteDisclosure = useDisclosure()
  const assignmentDisclosure = useDisclosure()
  const buyerAssignmentSubmitRef = useRef<HTMLDivElement>(null)
  const [assignedToBuyer, setAssignedToBuyer] = useState<boolean>(false)
  const [directBuyerAssignment, setDirectBuyerAssignment] = useState<any>(null)
  const toast = useToast()

  const params = useParams() as { [key: string]: string }
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { requiredParameters, dynamicColumns } = useColumns(
    fromResource,
    SCHEMA_SORT_ORDER,
    cellCallback
  )

  const { isAdmin, allowed } = useHasAccess(fromResource)

  const pagination = useMemo(() => {
    const pageValue = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')
    return {
      pageIndex: pageValue ? Number(pageValue) - 1 : 0,
      pageSize: pageSize ?? 20,
    } as PaginationState
  }, [searchParams])

  const getVisibility = useCallback(() => {
    // show/hide columns if table override exists for the "from" resource
    if (tableOverrides[fromResource]) {
      const overrideKeys = Object.keys(tableOverrides[fromResource])
      const headerVisibility = {} as any

      // eslint-disable-next-line no-inner-declarations
      function EvaluateVisibility(obj: any) {
        for (const prop in obj) {
          const value = obj[prop]
          if (!value?.columns) {
            headerVisibility[value.id] = !!overrideKeys.includes(value.id)
          } else {
            EvaluateVisibility(value.columns)
          }
        }
      }

      EvaluateVisibility(dynamicColumns)
      return headerVisibility
    }
  }, [fromResource, dynamicColumns])

  const sortedOverrideColumns = useMemo(() => {
    if (tableOverrides[fromResource]) {
      const overrides = Object.keys(tableOverrides[fromResource])
      return cloneDeep(dynamicColumns).sort(function (a: any, b: any) {
        return overrides.indexOf(a.header) - overrides.indexOf(b.header)
      })
    }
  }, [dynamicColumns, fromResource])

  const [columnVisibility, _setColumnVisibility] = useState<VisibilityState>(getVisibility)

  const tableState = useMemo(() => {
    return {
      columnVisibility,
      pagination,
    } as Partial<TableState>
  }, [columnVisibility, pagination])

  const normalizedFromResource = useMemo(() => normalizeResource(fromResource), [fromResource])
  const normalizedToResource = useMemo(() => normalizeResource(toResource), [toResource])

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
    [location.pathname, location.search, navigate]
  )

  /** Used to identify the property key in which to use for building a filter string
   * to fetch resources based on this key in an assignment body
   **/
  const assignmentIdKey = useMemo(
    () => `${pluralize.singular(normalizedFromResource)}ID`,
    [normalizedFromResource]
  )

  const fromResourceOverride = useMemo(
    () =>
      assignmentIdKeyOverride
        ? `${pluralize.plural(assignmentIdKeyOverride.replace('ID', ''))}`
        : null,
    [assignmentIdKeyOverride]
  )

  const [actionItem, setActionItem] = useState<any>()
  const [switcherResourceID, setSwitcherResourceID] = useState<string>('')

  const requiredParams = useMemo(() => {
    const paramsObj = {} as { [key: string]: string }
    requiredParameters.forEach((p: string) => {
      if (p === switcherIdKey && switcherResourceID) {
        paramsObj[p] = switcherResourceID
      } else {
        paramsObj[p] = (params[p] as string) || actionItem?.ID
      }
    })
    return paramsObj
  }, [requiredParameters, switcherIdKey, switcherResourceID, params, actionItem?.ID])

  const operationParams = useMemo(() => {
    const opParams = {
      ...params,
      [ToParameterKey(assignmentIdKey)]: actionItem?.ID,
      ...requiredParams,
    }
    return opParams
  }, [actionItem?.ID, assignmentIdKey, params, requiredParams])

  const { mutateAsync: deleteAsync, error: deleteError } = useDeleteAssignment(
    reverseDirection ? fromResource : toResource,
    operationInclusion,
    operationParams
  )

  const itemBaseHref = useMemo(
    () => hrefOverride || `/${kebabCase(fromResource).toLowerCase()}`,
    [fromResource, hrefOverride]
  )

  const resolveHref = useCallback(
    (rowData: any) => {
      let href = cloneDeep(itemBaseHref)
      Object.keys(params).forEach((p) => (href = href?.replace(`:${p}`, params[p]!)))
      if (switcherResourceName) href = href?.replace(`:${switcherIdKey}`, switcherResourceID)
      return `${href}/${rowData.ID}`
    },
    [params, itemBaseHref, switcherResourceName, switcherResourceID, switcherIdKey]
  )

  const toResourceID = useMemo(
    () => `${pluralize.singular(normalizedToResource)}ID`,
    [normalizedToResource]
  )
  const shouldDisplayListView = useMemo(
    () => !switcherResourceName || (switcherResourceName && switcherResourceID),
    [switcherResourceName, switcherResourceID]
  )
  const listFilterValue = useMemo(
    () => params[ToParameterKey(toResourceID)],
    [params, toResourceID]
  )

  const assignmentListOptions = useMemo(() => {
    const options = {
      [toResourceID]: listFilterValue,
      level,
      ...filters
    }
    if (switcherIdKey && switcherResourceID && !requiredParameters.includes(switcherIdKey)) {
      options[switcherIdKey] = switcherResourceID
    }
    return options as { [key: string]: string }
  }, [filters, level, listFilterValue, requiredParameters, switcherIdKey, switcherResourceID, toResourceID])

  const listParams = useMemo(() => {
    const paramsObj = {
      ...params,
    }
    if (switcherIdKey && switcherResourceID) {
      paramsObj[switcherIdKey] = switcherResourceID
    }
    return paramsObj
  }, [params, switcherIdKey, switcherResourceID])

  const dataQuery = useListAssignments(
    reverseDirection ? fromResource : toResource,
    operationInclusion,
    assignmentListOptions,
    listParams,
    {
      // staleTime: 300000, // 5 min
      disabled: switcherResourceName ? !switcherResourceID : !allowed,
    }
  )

  const { mutateAsync: saveAssignmentAsync, error: saveError } = useMutateAssignment(
    reverseDirection ? fromResource : toResource,
    operationInclusion,
    operationParams
  )

  useEffect(() => {
    const error = (saveError || deleteError) as OrderCloudError
    if (error) {
      const ocError = error?.response?.data?.Errors[0] as ApiError
      if (ocError && !toast.isActive(ocError.ErrorCode)) {
        toast({
          id: ocError.ErrorCode,
          title: ocError.Message,
          status: 'error',
        })
      }
    }
  }, [deleteError, saveError, toast])

  const assignmentBody = useMemo(() => {
    return { ...mapKeys(params, (_v, k) => Case.pascal(k)) }
  }, [params])

  const Ids = useMemo(() => {
    return dataQuery?.data?.Items?.length &&
      (!switcherResourceName || (!!switcherResourceName && switcherResourceID))
      ? dataQuery.data.Items.map((i: any) => i[assignmentIdKey]).join('|')
      : undefined
  }, [assignmentIdKey, dataQuery?.data?.Items, switcherResourceID, switcherResourceName])

  const listOptions = useMemo(() => {
    return {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      ID: Ids,
      ...filters
    } as ServiceListOptions
  }, [Ids, searchParams, filters])

  const renderDirectCompanyAssignmentUI = useMemo(() => {
    if (directCompanyLevelAssignment) {
      return (
        <>
          <Checkbox
            mb={5}
            size="md"
            isDisabled={!isAdmin}
            onChange={async (e) => {
              // if you UNCHECK the box and a direct buyer assignment exists, remove the assignment
              if (!e.target.checked && directBuyerAssignment) {
                await deleteAsync(undefined)
              } else {
                await saveAssignmentAsync(assignmentBody)
              }
            }}
            isChecked={assignedToBuyer}
          >
            Assigned to the buyer
          </Checkbox>
        </>
      )
    } else {
      return
    }
  }, [
    assignedToBuyer,
    assignmentBody,
    deleteAsync,
    directBuyerAssignment,
    directCompanyLevelAssignment,
    isAdmin,
    saveAssignmentAsync,
  ])

  /**If this is a direct company assignment, we don't render the list view, so the list assignments call will never trigger. Trigger it manually. */
  useEffect(() => {
    if (directCompanyLevelAssignment && !dataQuery.isLoading) {
      const result = dataQuery?.data?.Items?.at(0)
      setDirectBuyerAssignment(result)
      setAssignedToBuyer(!!result)
    }
  }, [directCompanyLevelAssignment, assignedToBuyer, dataQuery])

  const getExistingAssignmentBodyFromListItem = useMemo(
    () => (listItem: any) => {
      let body = {}
      if (listItem) {
        body = listItem
      }
      if (!actionItem) body = { ...{ [toResourceID]: listFilterValue } }
      // If we are on a user group detail page, we need to include the BuyerID in the request body.
      if (params['buyerID'] || params['userGroupID']) body = { ...body, BuyerID: params['buyerID'] }
      // If there is a switcherIdKey, we need to add it to the body
      if (switcherIdKey)
        body = {
          ...body,
          [Case.capital(switcherIdKey).split(' ').join('')]: switcherResourceID,
        }

      return Object.keys(body).length ? body : null
    },
    [actionItem, listFilterValue, params, toResourceID, switcherIdKey, switcherResourceID]
  )

  const renderResourceActionsMenu = useCallback(
    (item: any) => {
      return (
        <ActionMenu
          item={item}
          url={resolveHref(item)}
          onOpen={() => {
            setActionItem(item)
          }}
          onDelete={deleteDisclosure.onOpen}
          onEditAssignment={!hideEditAction ? assignmentDisclosure.onOpen : undefined}
          isAssignment={true}
        />
      )
    },
    [assignmentDisclosure.onOpen, deleteDisclosure.onOpen, hideEditAction, resolveHref]
  )

  return (
    <Container
      maxW="container.full"
      p={0}
      ml="0"
    >
      {!allowed && (
        <NoAccessMessage
          resourceName={fromResource}
          isAssignment={true}
        />
      )}
      {alertText && (
        <ChakraAlert
          mt={4}
          status="info"
          variant="subtle"
          py={2}
          cursor="pointer"
        >
          <AlertIcon />
          <AlertDescription fontSize="sm">{alertText}</AlertDescription>
        </ChakraAlert>
      )}
      <Box
        mt={switcherResourceName || !primaryActionContainerRef ? 4 : 2}
        mb={switcherResourceName || !primaryActionContainerRef ? 4 : 2}
      >
        <HStack
          flexWrap={{ base: 'wrap', md: 'nowrap' }}
          gap={3}
          w="full"
          justify="end"
        >
          {switcherResourceName && (
            <ResourceSelector
              leftAddon={`${pluralize.singular(Case.title(switcherResourceName))}`}
              resourceName={switcherResourceName}
              onChange={setSwitcherResourceID}
              value={switcherResourceID}
            />
          )}

          <Portal containerRef={primaryActionContainerRef}>
            {directCompanyLevelAssignment ? (
              <Box
                mb={6}
                ref={buyerAssignmentSubmitRef}
              />
            ) : (
              isAdmin && (
                <Button
                  minW="unset"
                  onClick={() => {
                    setActionItem(null)
                    assignmentDisclosure.onOpen()
                  }}
                >
                  {`${pluralize.singular(
                    (fromResourceOverride ?? fromResource).split(/(?=[A-Z])/).join(' ')
                  )} assignment`}
                </Button>
              )
            )}
          </Portal>
        </HStack>
      </Box>
      {!directCompanyLevelAssignment && (
        <ListView
          columnDef={tableOverrides[fromResource] ? sortedOverrideColumns : dynamicColumns}
          itemHrefResolver={resolveHref}
          parameters={listParams}
          listOptions={listOptions}
          tableState={tableState}
          onOptionChange={handleRoutingChange}
          resourceName={fromResource}
          itemActions={isAdmin ? renderResourceActionsMenu : undefined}
          preloadAssignments={true}
        >
          {({ renderContent }) => {
            const bodyFdsToHide = [toResourceID, assignmentIdKey, ...fieldsToHide]

            return (
              <Container
                maxW="full"
                p={0}
              >
                <ResourceAssignmentCreateEditModal
                  disclosure={assignmentDisclosure}
                  onComplete={() => {
                    setActionItem(null)
                  }}
                  onDiscard={() => {
                    setActionItem(null)
                    assignmentDisclosure.onClose()
                  }}
                  bodyFieldsToHide={bodyFdsToHide}
                  assignmentIdKey={assignmentIdKey}
                  existingAssignmentBody={getExistingAssignmentBodyFromListItem(
                    dataQuery?.data?.Items?.find((i: any) => i[assignmentIdKey] === actionItem?.ID)
                  )}
                  saveAssignmentOperationId={reverseDirection ? fromResource : toResource}
                  operationParams={listParams}
                  isCreatingNew={!actionItem}
                  configOptions={configOptions}
                  operationInclusion={operationInclusion}
                />
                <DeleteModal
                  onComplete={deleteAsync}
                  resource={fromResourceOverride ?? fromResource}
                  item={actionItem}
                  disclosure={deleteDisclosure}
                  isAssignment
                />
                {shouldDisplayListView && <Fragment>{renderContent}</Fragment>}
              </Container>
            )
          }}
        </ListView>
      )}
      {renderDirectCompanyAssignmentUI}
      {switcherResourceName && !switcherResourceID && (
        <Alert status="info">
          <AlertDescription>
            {`Select a 
            ${pluralize.singular(switcherResourceName.split(/(?=[A-Z])/).join(' '))}
            to view
            ${fromResourceOverride ?? fromResource.split(/(?=[A-Z])/).join(' ')}`}
          </AlertDescription>
        </Alert>
      )}
    </Container>
  )
}

export default ResourceAssignment
