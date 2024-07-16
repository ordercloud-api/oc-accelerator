import {
    Alert,
    AlertIcon,
    AlertTitle,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text,
} from '@chakra-ui/react'
import pluralize from 'pluralize'
import { FC } from 'react'
import { useFormState } from 'react-hook-form'

const ErrorFeedbackDisplay: FC<any> = ({ control }) => {
    const { errors } = useFormState({ control })

    let flatErrors = {}
    if (errors['parameters']) {
        flatErrors = { ...flatErrors, ...errors['parameters'] }
    }
    if (errors['body']) {
        flatErrors = { ...flatErrors, ...errors['body'] }
    }

    return Object.keys(flatErrors).length ? (
        <Popover placement="bottom">
            <PopoverTrigger>
                <Alert status="error" variant="subtle" py={2} cursor="pointer">
                    <AlertIcon />
                    <AlertTitle fontSize="sm">
                        {Object.keys(flatErrors).length > 1
                            ? `${pluralize(
                                  'error',
                                  Object.keys(flatErrors).length,
                                  true
                              )} need${
                                  Object.keys(flatErrors).length === 1
                                      ? 's'
                                      : ''
                              } to be resolved.`
                            : ((Object.values(flatErrors)[0] as any)
                                  .message as string)}
                    </AlertTitle>
                </Alert>
            </PopoverTrigger>

            <PopoverContent>
                <PopoverBody>
                    {Object.values(flatErrors).map((e: any) => (
                        <Text>{e.message}</Text>
                    ))}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    ) : null
}

export default ErrorFeedbackDisplay
