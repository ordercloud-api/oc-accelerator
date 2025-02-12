import {
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { Select } from 'chakra-react-select'
import { useHasAccess, useOcResourceList } from '@ordercloud/react-sdk'
import pluralize from 'pluralize'

interface SearchableInputProps {
  showInModal: boolean
  resource: string
  onUpdate: (value: string | undefined) => void
  value: string
  formatResourceOptions: (resource: any) => any
  params?: string[]
  parentResource?: string
  formatParentResourceOptions?: (parentResource: any) => any
  isDisabled?: boolean
}
export const SearchableInput = ({
  showInModal,
  onUpdate,
  parentResource,
  resource,
  // params,
  formatResourceOptions,
  formatParentResourceOptions,
  value,
  isDisabled,
}: SearchableInputProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // resource state methods
  const [resourceId, setResourceId] = useState<string>()
  const [resourceInputValue, setResourceInputValue] = useState('')

  // parent resource state methods
  const [parentResourceId, setParentResourceId] = useState<string>()
  const [parentResourceInputValue, setParentResourceInputValue] = useState('')

  const { allowed: hasAccess } = useHasAccess(resource)
  const { allowed: hasAccessToParent } = useHasAccess(parentResource)

  const handleAdd = () => {
    onUpdate(resourceId)
    onClose()
    setResourceId(undefined)
    setParentResourceId(undefined)
  }

  const parentResourceParam: string | null = useMemo(() => {
    if (!parentResource) return null
    return pluralize.singular(parentResource.toLocaleLowerCase()) + 'ID'
  }, [parentResource])

  const paramsObj = useMemo(() => {
    let paramsObj = {}
    if (parentResourceId && parentResourceParam) {
      paramsObj = { ...paramsObj, ...{ [parentResourceParam]: parentResourceId } }
    }
    if (resource === 'Orders' || resource === 'LineItems')
      paramsObj = { ...paramsObj, ...{ direction: 'All' } }
    return paramsObj
  }, [parentResourceId, parentResourceParam, resource])

  const parentParamsObj = useMemo(() => {
    let paramsObj = {}
    if (parentResource === 'Orders' || parentResource === 'LineItems')
      paramsObj = { ...paramsObj, ...{ direction: 'All' } }
    return paramsObj
  }, [parentResource])

  const dataQuery = useOcResourceList(
    resource,
    { search: resourceInputValue, pageSize: '5' },
    paramsObj,
    {
      staleTime: 300000, // 5 min
      disabled: !(!parentResource || (!!parentResource && !!parentResourceId)) || !hasAccess,
    }
  )

  const parentDataQuery = useOcResourceList(
    parentResource || resource, 
    { search: parentResourceInputValue, pageSize: '5' },
    parentParamsObj,
    {
      staleTime: 300000, // 5 min
      disabled: !parentResource || !hasAccessToParent,
    }
  )

  const resourceOptions = useMemo(() => {
    return dataQuery?.data?.Items?.map(formatResourceOptions)
  }, [dataQuery?.data?.Items, formatResourceOptions])

  const parentResourceOptions = useMemo(() => {
    if(!parentResource || !formatParentResourceOptions) return []
    return parentDataQuery?.data?.Items?.map(formatParentResourceOptions)
  }, [formatParentResourceOptions, parentDataQuery?.data?.Items, parentResource])

  const handleResourceSelect = (option: any) => {
    const updatedResourceId = option.value
    setResourceId(updatedResourceId)
    onUpdate(updatedResourceId)
    if (!parentResource) {
      setResourceId(undefined)
    }
  }

  const handleParentResourceSelect = (option: any) => {
    setParentResourceId(option.value)
  }

  const ResourceSelect = (
    <Select<any, false>
      isMulti={false}
      value={resourceOptions?.find((option: any) => option.value === value)}
      options={resourceOptions}
      isLoading={dataQuery.isLoading}
      isDisabled={parentDataQuery.isLoading || isDisabled}
      onInputChange={setResourceInputValue}
      onChange={handleResourceSelect}
      isClearable={false}
      filterOption={() => true}
      colorScheme="accent"
      placeholder={`Search ${resource}`}
      chakraStyles={{
        container: (baseStyles) => ({
          ...baseStyles,
          width: '100%',
        }),
        option: (baseStyles) => ({
          ...baseStyles,
          '.single-line': { display: 'none' },
          '.multi-line': { display: 'flex' },
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          '.single-line': { display: 'flex' },
          '.multi-line': { display: 'none' },
        }),
      }}
    />
  )
  const modalContent = (
    <VStack>
      <Select<any, false>
        isMulti={false}
        value={parentResourceOptions?.find((option) => option?.value === parentResourceId)}
        options={parentResourceOptions}
        isLoading={parentDataQuery.isLoading}
        onInputChange={setParentResourceInputValue}
        onChange={handleParentResourceSelect}
        isClearable={false}
        filterOption={() => true}
        colorScheme="accent"
        placeholder={`Search ${parentResource}`}
        chakraStyles={{
          container: (baseStyles) => ({
            ...baseStyles,
            width: '100%',
          }),
          option: (baseStyles) => ({
            ...baseStyles,
            '.single-line': { display: 'none' },
            '.multi-line': { display: 'flex' },
          }),
          singleValue: (baseStyles) => ({
            ...baseStyles,
            '.single-line': { display: 'flex' },
            '.multi-line': { display: 'none' },
          }),
        }}
      />
      {ResourceSelect}
    </VStack>
  )

  if (showInModal) {
    return parentResource ? modalContent : ResourceSelect
  }

  return (
    <>
      {parentResource ? (
        <Input
          type="text"
          value={(resourceOptions?.find((r) => r.value === value)?.label || value || '') as string}
          onClick={!isDisabled ? onOpen : undefined}
        />
      ) : (
        ResourceSelect
      )}
      <Modal
        isOpen={isOpen}
        size="md"
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="lg"
            fontWeight="bold"
          >
            Select {resource}
          </ModalHeader>

          <ModalBody>
            <VStack>
              <Select<any, false>
                isMulti={false}
                value={parentResourceOptions?.find((option) => option.value === parentResourceId)}
                options={parentResourceOptions}
                isLoading={parentDataQuery.isLoading}
                onInputChange={setParentResourceInputValue}
                onChange={handleParentResourceSelect}
                isClearable={false}
                filterOption={() => true}
                colorScheme="accent"
                placeholder={`Search ${parentResource}`}
                chakraStyles={{
                  container: (baseStyles) => ({
                    ...baseStyles,
                    width: '100%',
                  }),
                  option: (baseStyles) => ({
                    ...baseStyles,
                    '.single-line': { display: 'none' },
                    '.multi-line': { display: 'flex' },
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    '.single-line': { display: 'flex' },
                    '.multi-line': { display: 'none' },
                  }),
                }}
              />
              {ResourceSelect}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack
              justifyContent="space-between"
              width="full"
            >
              <Button onClick={onClose}>Cancel</Button>
              <Button
                colorScheme="primary"
                onClick={handleAdd}
                ml={3}
                isDisabled={!resourceId}
              >
                Submit
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
