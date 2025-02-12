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
import { useOcResourceList } from "@ordercloud/react-sdk";
import { Catalog, Category } from "ordercloud-javascript-sdk";
import { FC, useEffect, useMemo, useRef } from "react";
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

  const { data: catalogResult, isLoading: loading } =
    useOcResourceList<Catalog>(
      "Me.Catalogs",
      undefined,
      undefined,
      {
        staleTime: 300000,
      }
    );

  const { data: categoryResult } = useOcResourceList<Category>(
    "Me.Categories",
    { catalogID: selectedCatalog },
    undefined,
    {
      staleTime: 300000,
      disabled: !selectedCatalog,
    }
  );

  const catalogs = useMemo(() => catalogResult?.Items, [catalogResult]);
  const categories = useMemo(() => categoryResult?.Items, [categoryResult]);

  const handleCategoryClick = (categoryId: string | undefined) => {
    if (!categoryId || !selectedCatalog) return;
    navigate(`/shop/${selectedCatalog}/categories/${categoryId}`);
    onClose();
  };

  const handleViewAllCategoryClick = (categoryId: string | undefined) => {
    if (!categoryId || !selectedCatalog) return;
    navigate(`/shop/${selectedCatalog}/categories`);
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
            {categories?.map((category) => (
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
      {!loading && (
        <Container
          maxW="container.4xl"
          display="flex"
          alignItems="flex-end"
          justifyContent="flex-end"
          gap={6}
          mt={6}
        >
          <Button
            onClick={() => handleViewAllCategoryClick(selectedCatalog)}
            size="xs"
            variant="ghost"
            colorScheme="primary"
          >
            View all categories
          </Button>
          {catalogs?.length && catalogs.length > 1 && (
            <FormControl w="auto">
              <FormLabel fontSize=".7rem" color="chakra-subtle-text" mb={0}>
                Switch catalogs
              </FormLabel>
              <Select
                size="sm"
                h="24px"
                value={selectedCatalog}
                onChange={(e) => setSelectedCatalog(e.target.value)}
                w="fit-content"
                variant="outline"
                bgColor="transparent"
                fontSize=".7rem"
              >
                {catalogs?.map((catalog) => (
                  <option key={catalog.ID} value={catalog.ID}>
                    {catalog.Name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
        </Container>
      )}
    </Container>
  );
};

export default MegaMenu;
