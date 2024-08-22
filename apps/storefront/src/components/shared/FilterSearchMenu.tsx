import {
  Button,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useColorModeValue,
} from '@chakra-ui/react'
import { FC } from 'react'
import { TbSearch } from 'react-icons/tb'
import { DebouncedInput } from './DebouncedInput'

export type ServiceListOptions = { [key: string]: ServiceListOptions | string }

interface FilterSearchMenuProps {
  listOptions: ServiceListOptions
  handleRoutingChange: (
    queryKey: string,
    resetPage?: boolean,
    index?: number
  ) => (value?: string | boolean | number) => void
}

const FilterSearchMenu: FC<FilterSearchMenuProps> = ({
  listOptions,
  handleRoutingChange,
}) => {
  const subtleIcon = useColorModeValue('blackAlpha.500', 'whiteAlpha.500')

  return (
    <>
      <InputGroup
        w="400px"
        maxW="100%"
      >
        <InputLeftElement pointerEvents="none">
          <Icon
            as={TbSearch}
            color={subtleIcon}
          />
        </InputLeftElement>
        <DebouncedInput
          pl={10}
          placeholder={`Search Products...`}
          value={(listOptions['search'] as string) || ''}
          onChange={(v: string | number) => {
            handleRoutingChange('search', true)(v)
          }}
        />
        {(listOptions['search'] as string)?.length > 0 && (
          <InputRightElement width="4.5rem">
            <Button
              variant="outline"
              h="1.75rem"
              size="sm"
              onClick={() => handleRoutingChange('search', true)('')}
            >
              Clear
            </Button>
          </InputRightElement>
        )}
      </InputGroup>
    </>
  )
}

export default FilterSearchMenu
