import { Alert, AlertDescription, AlertIcon, AlertTitle, Box } from '@chakra-ui/react'
import Case from 'case'
import pluralize from 'pluralize'
import { FC } from 'react'

export interface NoAccessMessageProps {
  resourceName: string
  isAssignment?: boolean
}

const NoAccessMessage: FC<NoAccessMessageProps> = ({ resourceName, isAssignment }) => {
  return (
    <Alert status="warning">
      <AlertIcon />
      <Box>
        <AlertTitle>No Access</AlertTitle>
        <AlertDescription>
          User does not have the correct permissions to view a list of{' '}
          {isAssignment
            ? `${pluralize.singular(Case.title(resourceName))} assignments`
            : resourceName}
          .
        </AlertDescription>
      </Box>
    </Alert>
  )
}

export default NoAccessMessage
