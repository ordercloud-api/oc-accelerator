import { IconButton } from '@chakra-ui/react'
import { ActionProps } from 'react-querybuilder'
import { DeleteIcon } from '@chakra-ui/icons'

export function CustomRemoveRuleAction({ handleOnClick, disabled, context }: ActionProps) {
  return (
    <IconButton
      aria-label="Delete"
      colorScheme="danger"
      variant="outline"
      fontSize="1em"
      title="Delete"
      isDisabled={disabled || context?.isDisabled}
      onClick={handleOnClick}
      icon={<DeleteIcon />}
    />
  )
}
