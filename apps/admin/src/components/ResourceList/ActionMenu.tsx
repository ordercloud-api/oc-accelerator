import { Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip } from '@chakra-ui/react'
import { FC, useCallback } from 'react'
import { NavButton } from '../Layout/Layout'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { MdMoreHoriz } from 'react-icons/md'

interface IActionMenu {
  item: any
  url?: string
  isAssignment?: boolean
  onEditAssignment?: () => void
  onOpen?: () => void
  onClose?: () => void
  onDelete: () => void
}

const ActionMenu: FC<IActionMenu> = ({
  item,
  url,
  isAssignment,
  onEditAssignment,
  onOpen,
  onClose,
  onDelete,
}) => {
  const multiAction = (isAssignment && onEditAssignment != null) || (!isAssignment && item?.ID)

  const handleDeleteClick = useCallback(() => {
    if (!onOpen) return
    onOpen(), onDelete()
  }, [onOpen, onDelete])

  return (
    <>
      {multiAction ? (
        <Menu
          computePositionOnMount
          isLazy
          onOpen={onOpen}
          onClose={onClose}
          strategy="absolute"
          placement="left-start"
          boundary="scrollParent"
        >
          <MenuButton
            as={IconButton} color="chakra-subtle-text"
            icon={<Icon fontSize="3xl" as={MdMoreHoriz}/>}
            aria-label={`Action menu for ${item.ID}`}
            variant="ghost"
            
          />
          <MenuList
            minW="150px"
            zIndex={11}
            position="relative"
            overflow={'hidden'}
          >
            {isAssignment && onEditAssignment != null && (
              <MenuItem
                as={NavButton}
                borderRadius={0}
                fontWeight="normal"
                icon={
                  <EditIcon />
                }
                onClick={onEditAssignment}
              >
                Edit Assignment
              </MenuItem>
            )}
            {!isAssignment && item?.ID && (
              <MenuItem
                as={NavButton}
                borderRadius={0}
                fontWeight="normal"
                to={url}
                icon={
                  <EditIcon />
                }
              >
                Edit
              </MenuItem>
            )}
            <MenuItem
              onClick={onDelete}
              color="danger"
              icon={
                <DeleteIcon />
              }
            >
              Delete {isAssignment && ' Assignment'}
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <Tooltip
          aria-label={`Delete ${isAssignment ? 'assignment' : item.ID ?? ''}`}
          label={`Delete ${isAssignment ? 'assignment' : item.ID ?? ''}`}
          placement="left"
        >
          <IconButton
            onClick={handleDeleteClick}
            variant="ghost"
            colorScheme="danger"
            icon={
              <DeleteIcon />
            }
            aria-label={`Delete ${item.ID}`}
          >
            Delete {isAssignment && ' Assignment'}
          </IconButton>
        </Tooltip>
      )}
    </>
  )
}

export default ActionMenu
