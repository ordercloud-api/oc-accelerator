import { AtSignIcon, LockIcon } from "@chakra-ui/icons";
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
} from "@chakra-ui/react";
import { parseToken, useOrderCloudContext } from "@ordercloud/react-sdk";
import { AccessToken, OrderCloudError } from "ordercloud-javascript-sdk";
import { FC, FormEvent, useCallback, useState } from "react";

interface ILoginForm {
  initialFocusRef?: React.RefObject<HTMLInputElement>;
  onSuccess?: () => void;
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
  const { login, logout } = useOrderCloudContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<OrderCloudError | ILoginErrors | undefined>();
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      let authResponse
      try {
        authResponse = await login(username, password, rememberMe)
        setError(undefined);
        if (!isBuyerUser(authResponse)) {
          //The Sitecore Commerce team does not recommend using this application with non-seller users.
          logout()
          setError({
            errors: [{ Message: 'Seller users should not login to this application.' }],
          })
        } else if (onSuccess) {
          onSuccess()
        }
      } catch (ex) {
        setError(ex as OrderCloudError);
      } finally {
        setLoading(false);
      }
    },
    [login, username, password, rememberMe, onSuccess, logout]
  );

  return (
    <form id="OC_LOGIN_FORM" onSubmit={handleLogin}>
      <FormControl isDisabled={loading} isRequired mb={3}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <AtSignIcon />
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
      <FormControl isDisabled={loading} isRequired mb={3}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <LockIcon />
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
      <FormControl isDisabled={loading} mb={6}>
        <Checkbox
          isChecked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        >
          Keep me logged in
        </Checkbox>
      </FormControl>
      <Button
        isDisabled={loading || !username || !password}
        w="full"
        type="submit"
        variant="solid"
        colorScheme="blue"
        mb={5}
      >
        Login
      </Button>
      <Button w="full" variant="link" size="xs" mb={6}>
        Forgot username or password?
      </Button>
      {error?.errors?.map((e, i) => (
        <Alert status="error" key={i} mb={5}>
          <AlertIcon />
          <AlertDescription>{e.Message}</AlertDescription>
        </Alert>
      ))}
    </form>
  );
};

export default LoginForm;
