import {
  Box,
  Button,
  Icon,
  IconButton,
  Portal,
  SimpleGrid,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import {
  useDeleteOcResource,
  useMutateOcResource,
  useOcForm,
  useMutateAssignment,
  useHasAccess,
} from '@ordercloud/react-sdk'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { FormProvider } from 'react-hook-form'
import { TbTrash } from 'react-icons/tb'
import { useParams } from 'react-router'
import { getObjectDiff } from '../../utils/formSchemaGenerator.utils'
import DeleteModal from '../ResourceList/modals/DeleteModal'
import { SubmitButton } from './Controls'
import ErrorFeedbackDisplay from './ErrorFeedbackDisplay'
import RequestObject from './RequestObject'
import { OrderCloudError } from 'ordercloud-javascript-sdk'

export interface ApiError {
  ErrorCode: string
  Message: string
  Data: any
}
interface IOperationForm {
  /**
   * Example: "User.Save"
   */
  operationId: string

  /**
   * Initial values for react hook form
   */
  initialValues?: {
    parameters?: any
    body?: any
  }

  /**
   * When set to true, readOnly fields and subobjects will be displayed.
   */
  showReadOnlyFields?: boolean

  /**
   * Pass in a valid element reference retrieved from `React.useRef()` for where you would like form feedback to display.
   */
  formFeedbackRef?: any

  /**
   * Pass in a valid element reference retrieved from `React.useRef()` for where you would like submit button to display.
   */
  submitButtonRef?: any

  /**
   * Pass in a valid element reference retrieved from `React.useRef()` for where you would like the Action Menu to display.
   */
  deleteButtonRef?: any

  /**
   * Pass in a valid element reference retrieved from `React.useRef()` for where you would like discard button to display.
   */
  discardButtonRef?: any

  /**
   * Optional boolean for readonly mode on all form fields
   */
  readOnly?: boolean

  /**
   * Optional boolean for assignment operation form
   */
  isAssignment?: boolean

  /**
   * Optional string array for fields to be hidden in the operation form
   */
  bodyFieldsToHide?: string[]

  /**
   * Optional string to be included in the resource operation name. ex. List{Product}Assignments
   */
  operationInclusion?: string

  /**
   * Optional callback after submit
   */
  afterSubmit?: (itemID: any) => void

  /**
   * Optional callback after delete
   */
  afterDelete?: () => void

  /**
   * Optional callback if the OrderCloud call fails
   */
  onError?: (errors: ApiError[]) => void
}

const OperationForm: FC<IOperationForm> = ({
  operationId,
  initialValues,
  showReadOnlyFields,
  formFeedbackRef,
  submitButtonRef,
  discardButtonRef,
  deleteButtonRef,
  readOnly,
  isAssignment,
  bodyFieldsToHide,
  operationInclusion,
  afterSubmit,
  afterDelete
}) => {
  const deleteDisclosure = useDisclosure()

  // Infer the resourceId using the provided operationId
  const resourceId = useMemo(() => {
    return operationId.split('.')[0]
  }, [operationId])
  const { isAdmin } = useHasAccess(resourceId)

  const parameters = useParams() as { [key: string]: string }
  const { methods, resourceSchema } = useOcForm(
    resourceId,
    initialValues,
    isAssignment,
    operationInclusion
  )

  const values = methods.watch()
  const toast = useToast()

  const stripReadOnlyProps = useCallback(
    (value: any) => {
      Object.entries(resourceSchema).forEach(([propKey, propSchema]: [string, any]) => {
        if (propSchema.readOnly) {
          delete value[propKey]
        }
      })
    },
    [resourceSchema]
  )

  const hasDiff = useMemo(() => {
    if (!initialValues?.body || !Object.keys(initialValues?.body).length || !values?.body)
      return true
    const diff = getObjectDiff(initialValues.body, values.body)
    return Boolean(Object.keys(diff).length)
  }, [initialValues?.body, values])

  const isNew = useMemo(
    () =>
      !initialValues?.body || (!!initialValues?.body && !Object.keys(initialValues.body).length),
    [initialValues]
  )

  const { mutateAsync: saveAsync, error: saveError } = useMutateOcResource(
    resourceId,
    parameters,
    undefined,
    isNew
  )
  const { mutateAsync: deleteAsync, error: deleteError } = useDeleteOcResource(
    resourceId,
    parameters
  )

  const { mutateAsync: saveAssignmentAsync, error: saveAssignmentError } = useMutateAssignment(
    resourceId,
    operationInclusion,
    initialValues?.parameters || parameters,
    { disabled: !isAssignment }
  )

  useEffect(() => {
    const error = (saveError || deleteError || saveAssignmentError) as OrderCloudError
    if (error) {
      const ocError = error?.response?.data?.Errors?.[0] as ApiError
      if (ocError && !toast.isActive(ocError.ErrorCode)) {
        toast({
          id: ocError.ErrorCode,
          title: ocError.Message,
          status: 'error',
        })
      }
    }
  }, [deleteError, saveAssignmentError, saveError, toast])

  const onSubmit = useCallback(
    async (values: any) => {
      if (readOnly || !isAdmin) return
      stripReadOnlyProps(values.body)

      const response = isAssignment
        ? await saveAssignmentAsync(values.body)
        : ((await saveAsync(values.body)) as any)

      if (afterSubmit) {
        afterSubmit(response || values.body) // save assignment does not have response body
      }
    },
    [
      readOnly,
      isAdmin,
      stripReadOnlyProps,
      isAssignment,
      saveAssignmentAsync,
      saveAsync,
      afterSubmit,
    ]
  )

  const handleDelete = useCallback(async ()=> {
    await deleteAsync(undefined)

    if(afterDelete) afterDelete()
  },[afterDelete, deleteAsync])

  // Reset the form when the operation changes.
  useEffect(() => {
    methods.reset()
  }, [methods])

  const showBody = useMemo(() => {
    return Boolean(Object.keys(resourceSchema).length)
  }, [resourceSchema])

  const renderSubmitButton = useMemo(() => {
    if (readOnly || !isAdmin) return
    return (
      <SubmitButton
        isDisabled={!hasDiff}
        form="REQUEST_FORM"
        colorScheme="primary"
        control={methods.control}
      >
        Save {isAssignment && 'Assignment'}
      </SubmitButton>
    )
  }, [isAdmin, hasDiff, isAssignment, methods.control, readOnly])

  const renderDeleteButton = useMemo(() => {
    if (readOnly || !isAdmin || !initialValues) return
    return (
      <IconButton
        variant="outline"
        colorScheme="red"
        onClick={deleteDisclosure.onOpen}
        aria-label={`Delete ${initialValues?.body?.Name || initialValues?.body?.Username || ''}`}
      >
        <Icon as={TbTrash} />
      </IconButton>
    )
  }, [isAdmin, deleteDisclosure.onOpen, initialValues, readOnly])

  const renderDiscardButton = useMemo(() => {
    if (readOnly || !isAdmin || !initialValues) return
    return (
      <Button
        isDisabled={!hasDiff}
        variant="outline"
        onClick={() => methods.reset()}
      >
        Discard changes
      </Button>
    )
  }, [isAdmin, hasDiff, initialValues, methods, readOnly])

  return (
    <FormProvider {...methods}>
      <form
        id="REQUEST_FORM"
        autoComplete="off"
        noValidate
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {formFeedbackRef && (
          <Portal containerRef={formFeedbackRef}>
            <ErrorFeedbackDisplay control={methods.control} />
          </Portal>
        )}

        {submitButtonRef && <Portal containerRef={submitButtonRef}>{renderSubmitButton}</Portal>}
        {discardButtonRef && <Portal containerRef={discardButtonRef}>{renderDiscardButton}</Portal>}
        {deleteButtonRef && (
          <>
            <Portal containerRef={deleteButtonRef}>{renderDeleteButton}</Portal>
            <DeleteModal
              onComplete={handleDelete}
              resource={resourceId}
              item={initialValues?.body}
              disclosure={deleteDisclosure}
            />
          </>
        )}
        <SimpleGrid
          w="100%"
          gridTemplateColumns={{
            lg: showBody && !initialValues ? '1fr 1fr' : undefined,
          }}
          gap={6}
        >
          <VStack
            id="left"
            alignItems="flex-start"
            w="100%"
          >
            <Box
              w="full"
              mx={showBody ? '' : 'auto'}
              maxW={showBody ? '2xl' : ''}
              pr={2}
            >
              {parameters && !initialValues && (
                <RequestObject
                  unwrapped
                  path={'parameters'}
                  resourceId={resourceId}
                  schema={parameters.schema}
                  showReadOnlyFields={showReadOnlyFields}
                  formControl={methods.control}
                  readOnly={readOnly || !isAdmin}
                />
              )}
              {showBody && (
                <RequestObject
                  unwrapped
                  path={'body'}
                  resourceId={resourceId}
                  schema={resourceSchema}
                  showReadOnlyFields={showReadOnlyFields}
                  formControl={methods.control}
                  hasInitialValues={!!initialValues}
                  readOnly={readOnly || !isAdmin}
                  bodyFieldsToHide={bodyFieldsToHide}
                />
              )}
            </Box>
          </VStack>
          <VStack
            alignItems="flex-start"
            w="full"
            order={{ base: -1, lg: 'unset' }}
          ></VStack>
        </SimpleGrid>
      </form>
    </FormProvider>
  )
}

export default OperationForm
