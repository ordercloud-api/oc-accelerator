import { startCase } from 'lodash'
import { FC, useMemo, useState } from 'react'
import { BaseProps } from '../form-control'
import { SelectControl } from '../select-control'
import { Text } from '@chakra-ui/react'
import { IRelatedOpData } from '../../../../config/related-resources'
import { useOcResourceList, useHasAccess } from '@ordercloud/react-sdk'
import InputControl from '../input-control'

interface IRelatedResourceControl extends BaseProps {
  operationInfo?: ReturnType<IRelatedOpData['operationInfo']>
  assignedItems?: string[]
  renderFn: any
  isMulti?: boolean
  nested?: boolean
  leftAddon?: string
  enableImpersonation?: boolean
}

export const RelatedResourceControl: FC<IRelatedResourceControl> = ({
  operationInfo,
  renderFn,
  assignedItems,
  control,
  isMulti,
  nested,
  leftAddon,
  enableImpersonation,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState<string>()

  const relatedResourceName = useMemo(() => {
    return startCase(operationInfo?.operationId.split('.')[0])
  }, [operationInfo?.operationId])

  const placeholder = useMemo(() => {
    return `Search ${relatedResourceName?.toLocaleLowerCase()}...`
  }, [relatedResourceName])

  const { allowed: hasAccess } = useHasAccess(operationInfo?.operationId?.split('.')[0])

  const dataQuery = useOcResourceList(
    operationInfo?.operationId?.split('.')[0] || '',
    { search: inputValue, ...operationInfo?.filters },
    operationInfo?.parameters,
    {
      staleTime: 300000, // 5 min
      disabled: operationInfo?.pauseOperation || !hasAccess,
    }
  )

  const options = useMemo(() => {
    return dataQuery?.data
      ? dataQuery?.data?.Items.map((o: any) => {
          return {
            value: o.ID,
            label: renderFn(o),
          }
        })
      : []
  }, [dataQuery?.data, renderFn])

  const selectProps = useMemo(() => {
    return {
      placeholder,
      setInput: setInputValue,
      relatedResourceOptions: options,
      isClearable: true,
      isMulti,
      chakraStyles: {
        container: (provided: any) => ({
          ...provided,
          minWidth: '300px',
        }),
      },
      closeMenuOnSelect: !isMulti,
      noOptionsMessage: operationInfo?.pauseOperation
        ? () => <Text aria-label="Missing required parameters.">Missing required parameters.</Text>
        : undefined,
      filterOption: () => true,
    }
  }, [placeholder, options, isMulti, operationInfo?.pauseOperation])

  return hasAccess ? (
    <SelectControl
      {...rest}
      leftAddon={leftAddon}
      nested={nested}
      control={control}
      selectProps={selectProps}
    />
  ) : (
    <>
      <InputControl {...rest} />
    </>
  )
}
