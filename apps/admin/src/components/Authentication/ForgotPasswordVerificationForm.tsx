import { Button, VStack } from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ForgottenCredentials } from 'ordercloud-javascript-sdk'
import { FC, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { InputControl } from '../OperationForm/Controls'
import { CLIENT_ID } from '../../constants/constants'

interface IForgotPasswordVerificationForm {
  onSuccess: () => void
}

interface FormInputs {
  verificationCode: string
  username: string
  password: string
}

const ForgotPasswordVerificationForm: FC<IForgotPasswordVerificationForm> = ({ onSuccess }) => {
  const validationSchema = useMemo(() => {
    return yup.object().shape({
      verificationCode: yup.string().required(),
      username: yup.string().required(),
      password: yup.string().required(),
    })
  }, [])

  const methods = useForm<FormInputs>({ resolver: yupResolver(validationSchema) })

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {

    await ForgottenCredentials.ResetPasswordByVerificationCode(data.verificationCode!, {
      ClientID: CLIENT_ID,
      Username: data.username,
      Password: data.password
    })
    
    onSuccess()
  }

  return (
    <FormProvider {...methods}>
      <VStack
        as="form"
        id="OC_FORGOT_PASSWORD_VERFICIATION_FORM"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <InputControl
          name="verificationCode"
          label="Verification Code"
          isRequired
          inputProps={{ type: 'text', placeholder: 'Verification Code' }}
        />
        <InputControl
          name="username"
          label="Username"
          isRequired
          inputProps={{ type: 'text', placeholder: 'Username' }}
        />
        <InputControl
          name="password"
          label="Password"
          isRequired
          inputProps={{ type: 'text', placeholder: 'New Password' }}
        />
        <Button
          alignSelf="flex-end"
          mt="auto"
          px={6}
          isDisabled={methods.formState.isLoading || !methods.formState.isValid}
          type="submit"
          variant="solid"
          colorScheme="teal"
        >
          Verify
        </Button>
      </VStack>
    </FormProvider>
  )
}

export default ForgotPasswordVerificationForm
