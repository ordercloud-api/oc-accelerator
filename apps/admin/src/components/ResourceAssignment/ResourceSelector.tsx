import { FormProvider, useForm } from 'react-hook-form'
import pluralize from 'pluralize'
import { FC, useEffect, useMemo } from 'react'
import { RelatedResourceControl } from '../OperationForm/Controls/related-resource-control'
import { relatedListOperationsByResource } from '../../config/related-resources'

interface ResourceSelectorProps {
  resourceName: string
  value?: string
  leftAddon?: string
  onChange?: (selectedId: string) => void
  dependencies?: Array<string | null>
  isSecurityProfile?: boolean
  disabled?: boolean
}

const ResourceSelector: FC<ResourceSelectorProps> = ({
  resourceName,
  value,
  leftAddon,
  isSecurityProfile,
  disabled,
  onChange,
  dependencies = [],
}) => {
  const relatedListResourceInfo = useMemo(() => {
    return relatedListOperationsByResource?.[
      isSecurityProfile ? 'SecurityProfiles' : 'Assignments'
    ]?.[`${pluralize.singular(resourceName)}ID`]
  }, [isSecurityProfile, resourceName])

  const operationInfo = useMemo(() => {
    return relatedListResourceInfo.operationInfo(dependencies)
  }, [relatedListResourceInfo, dependencies])

  const methods = useForm<{ selectedId: string; parameters?: { [key: string]: string } }>({
    defaultValues: { selectedId: value },
  })

  const watchSelectedId = methods.watch('selectedId')

  useEffect(() => {
    if (value !== methods.getValues('selectedId')) {
      methods.setValue('selectedId', value === undefined ? '' : value)
    }
  }, [value, methods])

  useEffect(() => {
    if (!onChange) return
    onChange(watchSelectedId)
  }, [onChange, watchSelectedId])

  return (
    <FormProvider {...methods}>
      <RelatedResourceControl
        zIndex={10}
        minW={300}
        leftAddon={leftAddon}
        w="full"
        name="selectedId"
        renderFn={relatedListResourceInfo.renderItem}
        operationInfo={operationInfo}
        isDisabled={disabled}
      />
    </FormProvider>
  )
}

export default ResourceSelector
