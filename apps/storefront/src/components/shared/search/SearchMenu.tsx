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
import { DebouncedInput } from '../DebouncedInput'

export type ServiceListOptions = { [key: string]: ServiceListOptions | string }

interface SearchMenuProps {
  listOptions: ServiceListOptions
  handleRoutingChange: (
    queryKey: string,
    resetPage?: boolean,
    index?: number
  ) => (value?: string | boolean | number) => void
}

const SearchMenu: FC<SearchMenuProps> = ({
  listOptions,
  handleRoutingChange,
}) => {
  const subtleIcon = useColorModeValue('gray.300', 'whiteAlpha.500')

  return (
      <InputGroup w="100%" size="sm">
        <InputLeftElement pointerEvents="none">
          <Icon boxSize="60%" as={TbSearch} color={subtleIcon} />
        </InputLeftElement>
        <DebouncedInput
          pl={10}
          placeholder={`Search by keyword`}
          value={(listOptions["search"] as string) || ""}
          onChange={(v: string | number) => {
            handleRoutingChange("search", true)(v);
          }}
        />
        {(listOptions["search"] as string)?.length > 0 && (
          <InputRightElement width="3.75rem">
            <Button
              variant="ghost"
              colorScheme="secondary"
              h="70%"
              fontSize="x-small"
              px="2"
              size="sm"
              onClick={() => handleRoutingChange("search", true)("")}
            >
              Clear
            </Button>
          </InputRightElement>
        )}
      </InputGroup>
  );
}

export default SearchMenu
