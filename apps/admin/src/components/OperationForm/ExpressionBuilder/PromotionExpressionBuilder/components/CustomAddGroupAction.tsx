import { Button } from '@chakra-ui/react'
import { ActionWithRulesAndAddersProps } from 'react-querybuilder'
import { AddIcon } from '@chakra-ui/icons'

export function CustomAddGroupAction({ handleOnClick, context }: ActionWithRulesAndAddersProps) {
  return (
    <Button
      my={3}
      size="sm"
      leftIcon={
        <AddIcon />
      }
      onClick={handleOnClick}
      isDisabled={context?.isDisabled}
    >
      Add group
    </Button>
  )
}
