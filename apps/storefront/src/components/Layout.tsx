import {
  Button,
  Center,
  Container,
  Grid,
  GridItem,
  HStack,
  Heading,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useOrderCloudContext } from "@rwatt451/ordercloud-react";
import { FC, useEffect } from "react";
import { Outlet } from "react-router-dom";
import LoginModal from "./LoginModal";
import { APP_NAME } from "../constants";
import { useCurrentUser } from "../hooks/currentUser";

const Layout: FC = () => {
  const {data:user} = useCurrentUser();

  const { allowAnonymous, isAuthenticated, isLoggedIn, logout } =
    useOrderCloudContext();

  const loginDisclosure = useDisclosure();

  useEffect(() => {
    if (!allowAnonymous && !isAuthenticated) {
      loginDisclosure.onOpen();
    } else if (loginDisclosure.isOpen && isLoggedIn) {
      loginDisclosure.onClose();
    }
  }, [loginDisclosure, allowAnonymous, isAuthenticated, isLoggedIn]);

  return (
    <>
      <LoginModal disclosure={loginDisclosure} />
      <Grid
        templateAreas={`"header header"
            "nav main"
            "nav footer"`}
        gridTemplateRows={"50px 1fr 50px"}
        gridTemplateColumns={"300px 1fr"}
        h="100vh"
        color="blackAlpha.700"
        fontWeight="bold"
      >
        <GridItem area={"header"} zIndex={2} shadow="md">
          <Container h="100%" maxW="full">
            <HStack h="100%" justify="space-between" alignItems="center">
              <Heading size="md">{APP_NAME}</Heading>
              <HStack>
                <Heading size="sm">
                  {isLoggedIn
                    ? `Welcome, ${user?.FirstName} ${user?.LastName}`
                    : "Welcome"}
                </Heading>
                {isLoggedIn ? (
                  <Button size="sm" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <Button size="sm" onClick={loginDisclosure.onOpen}>
                    Login
                  </Button>
                )}
              </HStack>
            </HStack>
          </Container>
        </GridItem>
        <GridItem area={"nav"} zIndex={1} shadow="lg" bg="blackAlpha.100">
          <Center h="100%">
            <Text>Navigation</Text>
          </Center>
        </GridItem>
        <GridItem area={"main"} overflowY="scroll" overflowX="hidden">
          <Outlet />
        </GridItem>
        <GridItem as={Center} area={"footer"} bg="blackAlpha.50">
          <Text fontWeight="normal" fontSize="sm">
            © Sitcore Inc. 2024
          </Text>
        </GridItem>
      </Grid>
    </>
  );
};

export default Layout;
