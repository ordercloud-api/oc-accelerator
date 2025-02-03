import { Button, VStack } from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ForgottenCredentials } from 'ordercloud-javascript-sdk'
import { FC, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { InputControl } from '../OperationForm/Controls'
import { CLIENT_ID } from '../../constants/constants'

interface ILoginForm {
  onSuccess: () => void
}

interface FormInputs {
  email?: string
}

const ForgotUsernameForm: FC<ILoginForm> = ({ onSuccess }) => {
  const validationSchema = useMemo(() => {
    return yup.object().shape({
      email: yup
        .string()
        .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 'Invalid email format'),
    })
  }, [])

  const methods = useForm<FormInputs>({ resolver: yupResolver(validationSchema) })

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    await ForgottenCredentials.SendVerificationCode({
      ClientID: CLIENT_ID,
      Email: data.email,
    })
    onSuccess()
  }

  return (
    <FormProvider {...methods}>
      <VStack
        as="form"
        id="OC_FORGOT_PASSWORD_FORM"
        noValidate
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <InputControl
          name="email"
          isRequired={true}
          label="Email"
          inputProps={{ type: 'text', placeholder: 'Email' }}
          control={methods.control}
        />
        <Button
          alignSelf="flex-end"
          mt="auto"
          isDisabled={methods.formState.isLoading || !methods.formState.isValid}
          type="submit"
          variant="solid"
          colorScheme="teal"
        >
          Send Link
        </Button>
      </VStack>
    </FormProvider>
  )
}

export default ForgotUsernameForm
