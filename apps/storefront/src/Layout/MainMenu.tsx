import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
  UseDisclosureProps
} from "@chakra-ui/react";
import { useOcResourceList, useOrderCloudContext } from "@rwatt451/ordercloud-react";
import { Catalog, ListPage, RequiredDeep } from "ordercloud-javascript-sdk";
import { FC, useMemo, useState } from "react";
import { TbShoppingCart } from "react-icons/tb";
import { Link as RouterLink } from "react-router-dom";
import { useCurrentUser } from "../hooks/currentUser";
import MegaMenu from "./MegaMenu";
import { DEFAULT_BRAND } from "../assets/DEFAULT_BRAND";

interface MainMenuProps {
  loginDisclosure: UseDisclosureProps;
}

const MainMenu: FC<MainMenuProps> = ({ loginDisclosure }) => {
  const { data: user } = useCurrentUser();
  const { isLoggedIn, logout } = useOrderCloudContext();
  const megaMenuDisclosure = useDisclosure();
  const [selectedCatalog, setSelectedCatalog] = useState<string>("");

  const { data } = useOcResourceList(
    "Catalogs",
    { },
    {},
    {
      staleTime: 300000, // 5 min
    },
    true
  );

  const catalogs = useMemo(() => (data as RequiredDeep<ListPage<Catalog>>)?.Items, [data]);

  const renderCatalogMenu = () => {
    if (catalogs?.length > 1) {
      return (
        <Menu>
          <MenuButton
            as={Button}
            variant="outline"
            size="sm"
            rightIcon={<ChevronDownIcon />}
          >
            Shop by catalog
          </MenuButton>
          <MenuList>
            {catalogs?.map((catalog) => {
            return (
              <MenuItem
                key={catalog.ID}
                onClick={() => setSelectedCatalog(catalog.ID)}
                as={RouterLink}
                to={`/product-list/${catalog.ID}`}
              >
                {catalog.Name}
              </MenuItem>
            )
          })}
          </MenuList>
        </Menu>
      );
    } else if (catalogs?.length === 1) {
      return (
        <Button
          as={RouterLink}
          to={`/products/${catalogs[0].ID}`}
          variant="ghost"
        >
          Shop All Products
        </Button>
      );
    }
    return null;
  };

  return (
    <HStack
      h="12"
      as="header"
      position="sticky"
      w="full"
      top="0"
      zIndex={2}
      bgColor="whiteAlpha.600"
      borderBottom="1px solid"
      borderColor="whiteAlpha.900"
      px="8"
      backdropFilter="auto"
      backdropBlur="5px"
      py={2}
    >
      <Container h="100%" maxW="full">
        <HStack h="100%" justify="flex-start" alignItems="center">
          <RouterLink to="/">
            <DEFAULT_BRAND h="10" />
          </RouterLink>
          <HStack as="nav" flexGrow="1" ml={3}>
            <Button
              isActive={megaMenuDisclosure.isOpen}
              size="sm"
              variant="ghost"
              onClick={megaMenuDisclosure.onToggle}
            >
              Categories
            </Button>
            {renderCatalogMenu()}
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
            selectedCatalog={selectedCatalog}
            setSelectedCatalog={setSelectedCatalog}
          />
        )}
      </Container>
    </HStack>
  );
};

export default MainMenu;
