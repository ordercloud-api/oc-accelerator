import {
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
} from '@chakra-ui/react'
import { FC } from 'react'
import useDirection from '../../hooks/useDirection'

const DirectionMenu: FC = () => {
  const [direction, updateDirection] = useDirection()

  const handleDirectionChange = (value: string | string[]) => {
    const newDirection = Array.isArray(value) ? value[0] : value
    updateDirection(newDirection.charAt(0).toUpperCase() + newDirection.slice(1))
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
      >
        Direction{' '}
        <Text
          as="span"
          color="chakra-subtle-text"
        >
          ({direction})
        </Text>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup
          defaultValue={direction.toLowerCase()}
          type="radio"
          onChange={handleDirectionChange}
        >
          <MenuItemOption value="incoming">Incoming</MenuItemOption>
          <MenuItemOption value="outgoing">Outgoing</MenuItemOption>
          <MenuItemOption value="all">All</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

export default DirectionMenu
