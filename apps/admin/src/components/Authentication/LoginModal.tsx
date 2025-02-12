import {
  Button,
  ButtonGroup,
  Card,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  UseDisclosureReturn,
  VStack,
} from '@chakra-ui/react'
import { useOrderCloudContext } from '@ordercloud/react-sdk'
import { FC, useRef, useState } from 'react'
import ForgotPasswordForm from './ForgotPasswordForm'
import LoginForm from './LoginForm'
import ForgotPasswordVerificationForm from './ForgotPasswordVerificationForm'
import ForgotUsernameForm from './ForgotUsernameForm'

interface ILoginModal {
  disclosure: UseDisclosureReturn
}

const LoginModal: FC<ILoginModal> = ({ disclosure: { onClose, isOpen } }) => {
  const { allowAnonymous } = useOrderCloudContext()
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showForgotUsername, setShowForgotUsername] = useState(false)
  const [passwordResetSuccessfully, setPasswordResetSuccessfully] = useState(false)
  const [usernameRetrievedSuccessfully, setUsernameRetrievedSuccessfully] = useState(false)
  const initialFocusRef = useRef<HTMLInputElement>(null)

  const getHeadingText = () => {
    if (showForgotPassword) {
      return passwordResetSuccessfully ? 'Forgot password email sent' : 'Forgot Password'
    }
    if (showForgotUsername) {
      return usernameRetrievedSuccessfully ? 'Forgot username email sent' : 'Forgot Username'
    }
    return allowAnonymous ? 'Login' : 'Login Required'
  }

  const getDescriptionText = () => {
    if (showForgotPassword) {
      return passwordResetSuccessfully
        ? 'Please check your email for the verification code to reset your password'
        : 'Please provide the email associated with your account'
    }
    if (showForgotUsername) {
      return usernameRetrievedSuccessfully
        ? 'Please check your email for further instructions to retrieve your username'
        : 'Please provide the email associated with your account'
    }
    return ''
  }

  const setForm = () => {
    if (showForgotPassword && !passwordResetSuccessfully) {
      return (
        <ForgotPasswordForm
          onSuccess={() => {
            setShowForgotPassword(true)
            setPasswordResetSuccessfully(true)
          }}
        />
      )
    }
    if (showForgotUsername && !usernameRetrievedSuccessfully) {
      return (
        <ForgotUsernameForm
          onSuccess={() => {
            setShowForgotUsername(true)
            setUsernameRetrievedSuccessfully(true)
          }}
        />
      )
    }
    if (passwordResetSuccessfully) {
      return (
        <ForgotPasswordVerificationForm
          onSuccess={function (): void {
            throw new Error('Function not implemented.')
          }}
        />
      )
    }
    return (
      <LoginForm
        initialFocusRef={initialFocusRef}
        onSuccess={onClose}
      />
    )
  }

  return (
    <Modal
      size={allowAnonymous ? 'lg' : 'full'}
      onClose={onClose}
      isOpen={isOpen}
      initialFocusRef={initialFocusRef}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        {allowAnonymous && <ModalCloseButton />}
        <ModalBody
          as={VStack}
          justifyContent="center"
        >
          <Card
            display="grid"
            gridTemplateColumns={
              passwordResetSuccessfully && !showForgotPassword ? { lg: '1fr' } : { lg: '1fr 1.5fr' }
            }
            variant="outline"
            p={10}
            maxW="container.md"
            minH="xs"
            w="full"
            gap={10}
          >
            <VStack alignItems="flex-start">
              <Image
                src="/oc-logo.svg"
                alt="accelerator"
                w="110px"
              />
              <Heading
                as="h2"
                size="md"
                mt={-1}
                mb={5}
                pb={2}
                fontWeight="normal"
                color="chakra-placeholder-color"
                borderBottom="1px solid"
                borderBottomColor="chakra-border-color"
                w="full"
              >
                Accelerator Admin
              </Heading>
              <Heading
                as="h1"
                size="lg"
                color="chakra-subtle-text"
              >
                {getHeadingText()}
              </Heading>
              <Text
                color="chakra-subtle-text"
                fontSize="sm"
              >
                {getDescriptionText()}
              </Text>
            </VStack>
            {setForm()}
          </Card>
          <ButtonGroup
            justifyContent="center"
            w="container.md"
            gap={1}
          >
            <Button
              variant="link"
              size="xs"
              mb={6}
              onClick={() => {
                setShowForgotPassword(showForgotUsername ? false : !showForgotPassword)
                setPasswordResetSuccessfully(false)
                setShowForgotUsername(false)
                setUsernameRetrievedSuccessfully(false)
              }}
            >
              {!showForgotPassword && !showForgotUsername ? 'Forgot password' : 'Back to log in'}
            </Button>
            {!showForgotPassword && !showForgotUsername && (
              <Button
                variant="link"
                size="xs"
                mb={6}
                onClick={() => {
                  setShowForgotUsername((prev) => !prev)
                  setUsernameRetrievedSuccessfully(false)
                  setShowForgotPassword(false)
                  setPasswordResetSuccessfully(false)
                }}
              >
                Forgot username
              </Button>
            )}
          </ButtonGroup>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
