import { Box, Heading, Hide, HStack, Text, VStack, useToast } from '@chakra-ui/react'
import { useHasAccess, useOcResourceGet } from '@ordercloud/react-sdk'
import { createContext, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { matchPath, Outlet, useNavigate } from 'react-router'
import { NavButton } from '../Layout/Layout'
import { Params, useLocation, useParams } from 'react-router-dom'
import OperationForm, { ApiError } from '../OperationForm'

interface IResourceDetailNavItem {
  label: string
  path: string
}
interface IResourceDetail {
  resourceName: string
  isNew?: boolean
  isAssignment?: boolean
  hidePageHeader?: boolean
  navigationItems?: IResourceDetailNavItem[]
  bodyFieldsToHide?: string[]
  params?: Params<string>
  readOnly?: boolean
}

export const PrimaryActionRefContext = createContext<any>(null)

export const renderResourceDisplayName = (item: any) => {
  if (!item) return 'N/A'
  return (
    item.AppName ||
    item.AddressName ||
    (item.FirstName && item.LastName ? `${item.FirstName} ${item.LastName}` : false) ||
    item.Username ||
    item.Name ||
    item.ID
  )
}

const ResourceDetail: FC<IResourceDetail> = ({
  resourceName,
  hidePageHeader,
  navigationItems,
  params,
  readOnly,
  bodyFieldsToHide,
}) => {
  const [currentItem, setCurrentItem] = useState<any>()

  const primaryActionRef = useRef<HTMLDivElement>(null)
  const submitButtonRef = useRef<HTMLDivElement>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const discardButtonRef = useRef<HTMLDivElement>(null)

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  const { isAdmin } = useHasAccess(resourceName)

  const dataQuery = useOcResourceGet(
    resourceName,
    params as { [key: string]: string },
    { staleTime: 300000 } // 5 min
  )

  const showOperationForm = useMemo(() => {
    return Boolean(
      !navigationItems?.length ||
        (navigationItems?.length && pathname === navigationItems?.[0].path)
    )
  }, [pathname, navigationItems])

  useEffect(() => {
    if (dataQuery?.data) setCurrentItem(dataQuery?.data)
  }, [dataQuery])

  useEffect(() => {
    if (dataQuery.isError) {
      const ocError = dataQuery.error?.response?.data?.Errors[0] as ApiError
      if (ocError && !toast.isActive(ocError.ErrorCode)) {
        toast({
          id: ocError.ErrorCode,
          title: ocError.Message,
          status: 'error',
        })
      }
    }
  }, [dataQuery.error?.response?.data?.Errors, dataQuery.isError, toast])

  const resourceDetailNameDisplay = useMemo(() => {
    return renderResourceDisplayName(currentItem)
  }, [currentItem])

  const handleAfterSubmit = useCallback(
    (item: any) => {
      if (item?.ID) {
        const pathSegments = pathname.split('/')
        const lastSegment = pathSegments.pop()
        // if item was just created or ID changed, route to new resource detail
        if (lastSegment !== item.ID) {
          navigate(
            { pathname: `${pathSegments.join('/')}/${item.ID}` },
            { state: { shallow: true } }
          )
        } else {
          setCurrentItem(item)
        }
      }
    },
    [navigate, pathname]
  )

  const handleAfterDelete = useCallback(() => {
    const pathSegments = pathname.split('/')
    pathSegments.pop()
    navigate({ pathname: pathSegments.join('/') }, { state: { shallow: true } })
  }, [navigate, pathname])

  return currentItem ? (
    <>
      <VStack
        position="sticky"
        top="0"
        zIndex={1}
        background="chakra-body-bg"
        alignItems={navigationItems?.length ? 'start' : 'center'}
        mb={0}
        pt={navigationItems?.length ? 0 : 3}
        pb={3}
        mx={-1}
        px={4}
        borderBottomWidth={1}
        borderBottomColor="chakra-border-color"
      >
        <HStack
          alignItems="center"
          w="full"
          px={1}
        >
          {!hidePageHeader && currentItem.ID && (
            <Box
              py={navigationItems?.length ? 3 : 0}
              flexGrow="1"
            >
              <Heading
                size="md"
                as="h1"
              >
                {resourceDetailNameDisplay}
              </Heading>
              {currentItem.ID !== resourceDetailNameDisplay && (
                <Text
                  mt="2px"
                  fontSize="xs"
                  color="chakra-subtle-text"
                >
                  {currentItem.ID}
                </Text>
              )}
            </Box>
          )}
          <HStack
            ml="auto"
            mt={navigationItems?.length ? 3 : 0}
          >
            <Box ref={discardButtonRef}></Box>
            <Box ref={submitButtonRef}></Box>
            <Box ref={actionMenuRef}></Box>
            <Box
              ref={primaryActionRef}
              mr={0}
            ></Box>
          </HStack>
        </HStack>
        {navigationItems?.length && (
          <>
            <Hide below="lg">
              <HStack
                as="nav"
                id={`${currentItem.ID}-tabs`}
              >
                {navigationItems.map((ni, i) => {
                  return (
                    <NavButton
                      minW="auto"
                      size="sm"
                      rounded="full"
                      key={i}
                      to={ni.path}
                      isActive={matchPath(ni.path, pathname) !== null}
                    >
                      {ni.label}
                    </NavButton>
                  )
                })}
              </HStack>
            </Hide>
          </>
        )}
      </VStack>

      {showOperationForm && (
        <Box p={4}>
          <OperationForm
            operationId={`${resourceName}.Save`}
            initialValues={{ body: currentItem, parameters: params }}
            submitButtonRef={submitButtonRef}
            discardButtonRef={discardButtonRef}
            deleteButtonRef={actionMenuRef}
            afterSubmit={handleAfterSubmit}
            afterDelete={handleAfterDelete}
            showReadOnlyFields={true}
            readOnly={readOnly || !isAdmin}
            bodyFieldsToHide={bodyFieldsToHide}
          />
        </Box>
      )}
      <PrimaryActionRefContext.Provider value={primaryActionRef}>
        <Outlet />
      </PrimaryActionRefContext.Provider>
    </>
  ) : null
}

interface IResourceDetailWithParams extends Omit<IResourceDetail, 'params' | 'navigationItems'> {
  navigationItemsWithParams?: (params: any) => IResourceDetailNavItem[]
}

export const ResourceDetailWithParams: FC<IResourceDetailWithParams> = (props) => {
  const params = useParams()
  const navItems = props?.navigationItemsWithParams ? props.navigationItemsWithParams(params) : []

  return (
    <ResourceDetail
      {...props}
      navigationItems={navItems}
      params={params}
    />
  )
}

export default ResourceDetail
