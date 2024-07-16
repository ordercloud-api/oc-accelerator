import { Button, ButtonProps, Hide, IconButton, theme, useMediaQuery } from '@chakra-ui/react'
import { FC } from 'react'
import { Control, UseFormReset, useFormState } from 'react-hook-form'

export type ResetButtonProps = ButtonProps & {
  control: Control<any, any>
  reset: UseFormReset<any>
}

export const ResetButton: FC<ResetButtonProps> = (props: ResetButtonProps) => {
  const { children, control, reset, ...rest } = props
  const { isSubmitting, isDirty } = useFormState({ control })

  const [belowSm] = useMediaQuery(`(max-width: ${theme.breakpoints['sm']})`, {
    ssr: true,
    fallback: false, // return false on the server, and re-evaluate on the client side
  })

  return (
    <>
      <Hide below="md">
        <Button
          variant="outline"
          onClick={() => reset()}
          isDisabled={isSubmitting || !isDirty}
        >
          {children}
        </Button>
      </Hide>

      <Hide above="md">
        {belowSm ? (
          <IconButton
            variant="outline"
            colorScheme="danger"
            aria-label="Discard changes"
            isDisabled={isSubmitting || !isDirty}
            {...rest}
            type="reset"
            onClick={() => reset()}
          />
        ) : (
          <Button
            isDisabled={isSubmitting || !isDirty}
            {...rest}
            type="reset"
            onClick={() => reset()}
            display="flex"
            justifyContent={'flex-start'}
            variant="unstyled"
            px={3}
            _hover={{ backgroundColor: 'gray.100' }}
            w="full"
            textAlign="left"
            borderRadius="0"
            fontWeight="normal"
          >
            {children}
          </Button>
        )}
      </Hide>
    </>
  )
}

export default ResetButton
