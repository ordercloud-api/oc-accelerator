import { AtSignIcon, LockIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Checkbox,
  FormControl,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from '@chakra-ui/react'
import { parseToken, useOrderCloudContext } from '@ordercloud/react-sdk'
import { AccessToken, OrderCloudError } from 'ordercloud-javascript-sdk'
import { FC, FormEvent, useCallback, useState } from 'react'

interface ILoginForm {
  initialFocusRef?: React.RefObject<HTMLInputElement>
  onSuccess?: () => void
}

//Placeholder interface for creating custom login error messages
interface ILoginError {
  Message: string
}

//Placeholder interface for creating custom login error messages
interface ILoginErrors {
  errors: ILoginError[]
}

const isBuyerUser = (token: AccessToken) => {
  if (!token || !token.access_token) return false;
  const parsedToken = parseToken(token.access_token);
  return parsedToken.usrtype === 'buyer';
}

const LoginForm: FC<ILoginForm> = ({ initialFocusRef, onSuccess }) => {
  const { login, logout } = useOrderCloudContext()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<OrderCloudError | ILoginErrors | undefined>()
  const [loading, setLoading] = useState(false)

  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      let authResponse
      try {
        authResponse = await login(username, password, rememberMe)
        setError(undefined)

        if (isBuyerUser(authResponse)) {
          //The Sitecore Commerce team does not recommend using this application with non-seller users.
          logout()
          setError({
            errors: [{ Message: 'Buyer users should not login to this application.' }],
          })
        } else if (onSuccess) {
          onSuccess()
        }
        
      } catch (ex) {
        setError(ex as OrderCloudError)
      } finally {
        setLoading(false)
      }
    },
    [login, username, password, rememberMe, onSuccess, logout]
  )

  return (
    <VStack
      as="form"
      id="OC_LOGIN_FORM"
      onSubmit={handleLogin}
      gap={6}
    >
      <FormControl
        isDisabled={loading}
        isRequired
      >
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <AtSignIcon color="chakra-placeholder-color" />
          </InputLeftElement>
          <Input
            ref={initialFocusRef}
            aria-label="Username"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputGroup>
      </FormControl>
      <FormControl
        isDisabled={loading}
        isRequired
      >
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <LockIcon color="chakra-placeholder-color" />
          </InputLeftElement>
          <Input
            aria-label="Password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>
      </FormControl>
      <FormControl
        isDisabled={loading}
        mt={-1}
      >
        <Checkbox
          isChecked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        >
          Keep me logged in
        </Checkbox>
      </FormControl>

      <Button
        isDisabled={loading || !username || !password}
        px={6}
        type="submit"
        variant="solid"
        colorScheme="teal"
        alignSelf="flex-end"
        mt="auto"
      >
        Login
      </Button>
      {error?.errors?.map((e, i) => (
        <Alert
          status="error"
          key={i}
          mb={5}
        >
          <AlertIcon />
          <AlertDescription>{e.Message}</AlertDescription>
        </Alert>
      ))}
    </VStack>
  )
}

export default LoginForm
