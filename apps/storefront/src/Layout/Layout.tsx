import {
  Container,
  HStack,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useOrderCloudContext } from "@ordercloud/react-sdk";
import { FC, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LoginModal from "../components/login/LoginModal";
import MainMenu from "./MainMenu";

const Layout: FC = () => {
  const { pathname } = useLocation();
  const { allowAnonymous, isAuthenticated, isLoggedIn } =
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
      <MainMenu loginDisclosure={loginDisclosure} />
      <VStack
        alignItems="flex-start"
        w="full"
        minH="100dvh"
        gap={0}
        sx={{ "&>*": { width: "full" } }}
        bgColor="chakra-subtle-bg"
      >
        <Container id="outletWrapper"
          display="flex"
          flexFlow="column nowrap"
          maxW={
            pathname === "/" || pathname === "/cart" ? "full" : "container.4xl"
          }
          mx="auto"
          my={pathname === "/" || pathname === "/cart" ? 0 : 8}
          flex="1"
        >
          <Outlet />
        </Container>
        <HStack
          alignItems="center"
          justifyContent="center"
          as="footer"
          py={3}
          zIndex="12"
          bg="gray.400"
        >
          <Text fontWeight="normal" fontSize="sm" color="whiteAlpha.800">
            © Sitcore Inc. 2024
          </Text>
        </HStack>
      </VStack>
    </>
  );
};

export default Layout;
