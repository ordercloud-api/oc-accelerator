import {
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Select,
  SlideFade,
  Spinner,
  useOutsideClick,
} from "@chakra-ui/react";
import { Catalog, Category, ListPage, Me } from "ordercloud-javascript-sdk";
import { FC, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCatalog: string;
  setSelectedCatalog: (catalogID: string) => void;
}

const MegaMenu: FC<MegaMenuProps> = ({
  isOpen,
  onClose,
  selectedCatalog,
  setSelectedCatalog,
}) => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: menuRef,
    handler: () => {
      if (isOpen) {
        onClose();
      }
    },
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        const catalogResult: ListPage<Catalog> = await Me.ListCatalogs();
        setCatalogs(catalogResult.Items || []);
        if (catalogResult.Items && catalogResult.Items.length > 0) {
          setSelectedCatalog(catalogResult.Items[0].ID || "");
        }
      } catch (error) {
        console.error("Error fetching catalogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogs();
  }, [setSelectedCatalog]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedCatalog) return;
      try {
        setLoading(true);
        const categoryResult: ListPage<Category> = await Me.ListCategories({
          catalogID: selectedCatalog,
        });
        setCategories(categoryResult.Items || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [selectedCatalog]);

  const handleCategoryClick = (categoryId: string | undefined) => {
    if (!categoryId || !selectedCatalog) return;
    navigate(`/product-list/${selectedCatalog}/${categoryId}`);
    onClose();
  };

  return (
    <Container
      as={SlideFade}
      minH="20vh"
      maxH="45vh"
      display="flex"
      flexDirection="column"
      offsetY={-12}
      in={isOpen}
      position="absolute"
      top={14}
      maxW="container.4xl"
      py={4}
      bgColor="whiteAlpha.600"
      borderBottom="1px solid"
      borderColor="whiteAlpha.400"
      backdropFilter="auto"
      shadow="sm"
      backdropBlur="10px"
      mx="auto"
      left="0"
      right="0"
      ref={menuRef}
    >
      <>
        {loading ? (
          <Flex w="full" alignItems="center" justifyContent="center" flex="1">
            <Spinner size="xl" colorScheme="blackAlpha" thickness="10px" />
          </Flex>
        ) : (
          <Container
            flex="1"
            maxW="container.4xl"
            display="grid"
            alignContent="flex-start"
            gap={3}
            maxH="500px"
            overflowY="auto"
            gridTemplateColumns={
              !loading ? "repeat( auto-fit, minmax(300px, 1fr))" : "1fr"
            }
          >
            {categories.map((category) => (
              <Button
                key={category.ID}
                variant="ghost"
                w="full"
                justifyContent="start"
                onClick={() => handleCategoryClick(category.ID)}
              >
                {category.Name}
              </Button>
            ))}
          </Container>
        )}
      </>
      <FormControl ml="12">
        <FormLabel fontSize="xs" mb={1}>
          Switch catalogs
        </FormLabel>
        <Select
          size="sm"
          value={selectedCatalog}
          onChange={(e) => setSelectedCatalog(e.target.value)} // Update the selected catalog
          w="fit-content"
          variant="outline"
          bgColor="transparent"
          fontSize=".8rem"
        >
          {catalogs.map((catalog) => (
            <option key={catalog.ID} value={catalog.ID}>
              {catalog.Name}
            </option>
          ))}
        </Select>
      </FormControl>
    </Container>
  );
};

export default MegaMenu;
