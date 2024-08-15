import { DeleteIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'
import { ActionProps } from 'react-querybuilder'

export function CustomRemoveGroupAction({ handleOnClick, disabled, context }: ActionProps) {
  return (
    <Button
      ml={3}
      size="sm"
      variant="ghost"
      colorScheme="red"
      isDisabled={disabled || context?.isDisabled}
      onClick={handleOnClick}
      leftIcon={
        <DeleteIcon />
      }
    >
      Remove group
    </Button>
  )
}
