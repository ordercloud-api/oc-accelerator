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
import { useEffect, useMemo, useState } from 'react'
import { Select } from 'chakra-react-select'
import { debounce } from 'lodash'
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
  params,
  formatResourceOptions,
  formatParentResourceOptions,
  value,
  isDisabled,
}: SearchableInputProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // resource state methods
  const [resourceId, setResourceId] = useState<string>()
  const [resourceInputValue, setResourceInputValue] = useState('')
  const [resourceOptions, setResourceOptions] = useState<any[]>([])
  const [resourceLoading, setResourceLoading] = useState(false)

  // parent resource state methods
  const [parentResourceId, setParentResourceId] = useState<string>()
  const [parentResourceInputValue, setParentResourceInputValue] = useState('')
  const [parentResourceOptions, setParentResourceOptions] = useState<any[]>([])
  const [parentResourceLoading, setParentResourceLoading] = useState(false)

  const handleAdd = () => {
    onUpdate(resourceId)
    onClose()
    setResourceId(undefined)
    setParentResourceId(undefined)
  }

  // const operation = useMemo(() => {
  //   return operationsById[`${resource}.List`]
  // }, [operationsById, resource])

  // const parentOperation = useMemo(() => {
  //   return operationsById[`${parentResource}.List`]
  // }, [operationsById, parentResource])

  // const parentResourceParam: string | null = useMemo(() => {
  //   if (!parentResource) return null
  //   return pluralize.singular(parentResource.toLocaleLowerCase()) + 'ID'
  // }, [parentResource])

  // const loadResources = useMemo(
  //   () =>
  //     debounce(async (search: string) => {
  //       try {
  //         if (parentResource && !parentResourceId) return
  //         setResourceLoading(true)

  //         // Make api calls
  //         let paramsObj = { pageSize: 5, search }
  //         if (parentResourceId && parentResourceParam) {
  //           paramsObj = { ...paramsObj, ...{ [parentResourceParam]: parentResourceId } }
  //         }
  //         if (
  //           operation.operationId === 'Orders.List' ||
  //           operation.operationId === 'LineItems.List'
  //         ) {
  //           paramsObj = { ...paramsObj, ...{ direction: 'All' } }
  //         }

  //         const listResourceRequest = new BizUserRequest(
  //           developerToken!,
  //           {
  //             body: {} as FieldValues,
  //             params: paramsObj,
  //             locked: {},
  //           },
  //           operation,
  //           marketplace?.CoreApiUrl
  //         )
  //         const requests = [listResourceRequest.send()]

  //         if (value) {
  //           const listResourceRequest = new BizUserRequest(
  //             developerToken!,
  //             {
  //               body: {} as FieldValues,
  //               params: { ...paramsObj, ID: value },
  //               locked: {},
  //             },
  //             operation,
  //             marketplace?.CoreApiUrl
  //           )
  //           requests.push(listResourceRequest.send())
  //         }

  //         // Map options
  //         const responses = await Promise.all(requests)
  //         setResourceOptions(
  //           responses
  //             .map((r) => r.data.Items)
  //             .flat()
  //             .map(formatResourceOptions)
  //         )
  //       } finally {
  //         setResourceLoading(false)
  //       }
  //     }, 500),
  //   [
  //     parentResource,
  //     parentResourceId,
  //     operation,
  //     developerToken,
  //     marketplace?.CoreApiUrl,
  //     value,
  //     formatResourceOptions,
  //     parentResourceParam,
  //   ]
  // )

  // useEffect(() => {
  //   loadResources(resourceInputValue)
  // }, [resourceInputValue, parentResourceId, loadResources])

  // const loadParentResources = useMemo(
  //   () =>
  //     debounce(async (search: string) => {
  //       try {
  //         if (!parentResource) return
  //         setParentResourceLoading(true)

  //         var paramsObj = { pageSize: 5, search }
  //         if (
  //           operation.operationId === 'Orders.List' ||
  //           operation.operationId === 'LineItems.List'
  //         ) {
  //           paramsObj = { ...paramsObj, ...{ direction: 'All' } }
  //         }

  //         // Make api call
  //         const listParentResourceRequest = new BizUserRequest(
  //           developerToken!,
  //           {
  //             body: {} as FieldValues,
  //             params: paramsObj,
  //             locked: {},
  //           },
  //           parentOperation,
  //           marketplace?.CoreApiUrl
  //         )

  //         const parentResources = await listParentResourceRequest.send()

  //         // Set options
  //         if (parentResources?.data?.Items) {
  //           setParentResourceOptions(parentResources.data.Items.map(formatParentResourceOptions))
  //         }
  //       } finally {
  //         setParentResourceLoading(false)
  //       }
  //     }, 500),
  //   [
  //     parentResource,
  //     operation.operationId,
  //     developerToken,
  //     parentOperation,
  //     marketplace?.CoreApiUrl,
  //     formatParentResourceOptions,
  //   ]
  // )

  // useEffect(() => {
  //   loadParentResources(parentResourceInputValue)
  // }, [loadParentResources, parentResourceInputValue])

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
      value={resourceOptions.find((option) => option.value === value)}
      options={resourceOptions}
      isLoading={resourceLoading}
      isDisabled={parentResourceLoading || isDisabled}
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
        value={parentResourceOptions.find((option) => option.value === parentResourceId)}
        options={parentResourceOptions}
        isLoading={parentResourceLoading}
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
          value={(resourceOptions.find((r) => r.value === value)?.label || value || '') as string}
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
                value={parentResourceOptions.find((option) => option.value === parentResourceId)}
                options={parentResourceOptions}
                isLoading={parentResourceLoading}
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
