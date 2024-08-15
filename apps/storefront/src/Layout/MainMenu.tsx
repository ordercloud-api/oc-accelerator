import {
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  useDisclosure,
  UseDisclosureProps,
} from "@chakra-ui/react";
import { FC } from "react";
import { TbShoppingCart } from "react-icons/tb";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { APP_NAME } from "../constants";
import { useCurrentUser } from "../hooks/currentUser";
import { useOrderCloudContext } from "@rwatt451/ordercloud-react";
import MegaMenu from "./MegaMenu"; // Import the MegaMenu component

interface HeaderProps {
  loginDisclosure: UseDisclosureProps;
}

const Header: FC<HeaderProps> = ({loginDisclosure}) => {
  const { data: user } = useCurrentUser();
  const location = useLocation();
  const { isLoggedIn, logout } = useOrderCloudContext();
  const megaMenuDisclosure = useDisclosure(); // Add this line

  return (
    <HStack
      h="12"
      as="header"
      position="sticky"
      w="full"
      top="0"
      zIndex={2}
      bgColor="whiteAlpha.300"
      borderBottom="1px solid"
      borderColor="whiteAlpha.300"
      px="8"
      backdropFilter="auto"
      backdropBlur="5px"
      py={2}
    >
      <Container h="100%" maxW="full">
        <HStack h="100%" justify="flex-start" alignItems="center">
          <Heading as={RouterLink} to="/" size="md">
            {APP_NAME}
          </Heading>
          <HStack as="nav" flexGrow="1" ml={3}>
            <Button
              isActive={megaMenuDisclosure.isOpen}
              size="sm"
              variant="ghost"
              onClick={megaMenuDisclosure.onToggle}
            >
              Categories
            </Button>
            <Button
              as={RouterLink}
              isActive={location.pathname === "/products"}
              to="/products"
              size="sm"
              variant="ghost"
            >
              Shop all products
            </Button>
          </HStack>
          <HStack>
            <Heading size="sm">
              {isLoggedIn
                ? `Welcome, ${user?.FirstName} ${user?.LastName}`
                : "Welcome"}
            </Heading>
            <Button
              as={RouterLink}
              to="/cart"
              variant="outline"
              size="sm"
              leftIcon={<Icon as={TbShoppingCart} />}
              aria-label={`Link to cart`}
            >
              Cart
            </Button>
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
        {megaMenuDisclosure.isOpen && (
          <MegaMenu
            isOpen={megaMenuDisclosure.isOpen}
            onClose={megaMenuDisclosure.onClose}
          />
        )}
      </Container>
    </HStack>
  );
};

export default Header;
