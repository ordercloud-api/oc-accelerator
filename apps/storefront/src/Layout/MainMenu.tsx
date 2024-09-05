import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  UseDisclosureProps,
} from "@chakra-ui/react";
import { useOrderCloudContext } from "@rwatt451/ordercloud-react";
import {
  Cart,
  Catalog,
  LineItem,
  ListPage,
  Me,
} from "ordercloud-javascript-sdk";
import { FC, useCallback, useEffect, useState } from "react";
import { TbShoppingCartFilled } from "react-icons/tb";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { DEFAULT_BRAND } from "../assets/DEFAULT_BRAND";
import { useCurrentUser } from "../hooks/currentUser";
import MegaMenu from "./MegaMenu";

interface MainMenuProps {
  loginDisclosure: UseDisclosureProps;
}

const MainMenu: FC<MainMenuProps> = ({ loginDisclosure }) => {
  const { data: user } = useCurrentUser();
  const { isLoggedIn, logout } = useOrderCloudContext();
  const megaMenuDisclosure = useDisclosure();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>();
  const [totalQuantity, setTotalQuantity] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const catalogResult: ListPage<Catalog> = await Me.ListCatalogs();
        setCatalogs(catalogResult.Items || []);
        if (catalogResult.Items && catalogResult.Items.length > 0) {
          setSelectedCatalog(catalogResult.Items[0].ID || "");
        }
      } catch (error) {
        console.error("Error fetching catalogs:", error);
      }
    };

    fetchCatalogs();
  }, []);

  const getTotalLineItemQuantity = useCallback(async () => {
    const result = await Cart.ListLineItems();
    const totalQuantity = result.Items.reduce(
      (sum, item) => sum + item.Quantity,
      0
    );
    setLineItems(result.Items);
    setTotalQuantity(totalQuantity);
  }, []);

  useEffect(() => {
    getTotalLineItemQuantity();
  }, [getTotalLineItemQuantity, navigate]);

  const renderCatalogMenu = () => {
    if (catalogs.length > 1) {
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
            {catalogs.map((catalog) => (
              <MenuItem
                key={catalog.ID}
                onClick={() => setSelectedCatalog(catalog.ID || "")}
                as={RouterLink}
                to={`/product-list/${selectedCatalog}`}
              >
                {catalog.Name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      );
    } else if (catalogs.length === 1) {
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
            {isLoggedIn && (
              <Heading size="sm">
                `Welcome, ${user?.FirstName} ${user?.LastName}`
              </Heading>
            )}
            <Button
              as={RouterLink}
              to="/cart"
              variant="outline"
              size="sm"
              leftIcon={totalQuantity !== 0 ?
                    <Box position="relative" mt="2px" mr="2px" lineHeight="1">
                      <Box
                        id="cartCountFrame"
                        top="5px"
                        left="6px"
                        position="absolute"
                        height="9px"
                        width="15px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize=".5rem"
                          color="white"
                          fontWeight="bold"
                          letterSpacing="-.5px"
                        >
                          {totalQuantity}
                        </Text>
                      </Box>

                      <Icon
                        fontSize="lg"
                        as={TbShoppingCartFilled}
                        color="gray.500"
                      />
                    </Box>: undefined
              }
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
