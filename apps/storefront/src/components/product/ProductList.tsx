import { Heading, SimpleGrid, Spinner, Center } from "@chakra-ui/react";
import { BuyerProduct, Me, Category } from "ordercloud-javascript-sdk";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import ProductCard from "./ProductCard";

export interface ProductListProps {
  renderItem?: (product: BuyerProduct) => JSX.Element;
}

const ProductList: FunctionComponent<ProductListProps> = ({ renderItem }) => {
  const { catalogId, categoryId } = useParams<{
    catalogId: string;
    categoryId: string;
  }>();
  const [products, setProducts] = useState<BuyerProduct[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const getProducts = useCallback(async () => {
    if (!catalogId) return;

    setLoading(true);
    try {
      const result = await Me.ListProducts({
        catalogID: catalogId,
        categoryID: categoryId,
        filters: { "xp.Images": "*" },
        pageSize: 100, // Adjust as needed
      });
      setProducts(result?.Items || []);

      if (categoryId) {
        const categoryResult = await Me.GetCategory(categoryId);
        setCategory(categoryResult);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [catalogId, categoryId]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Heading
        as="h1"
        size="xl"
        flexGrow="1"
        color="chakra-placeholder-color"
        textTransform="uppercase"
        fontWeight="300"
        mb={8}
        pb={2}
        borderBottom="1px solid"
        borderColor="chakra-border-color"
      >
        {category ? `Shop ${category.Name}` : "Shop all products"}
      </Heading>
      <SimpleGrid
        gridTemplateColumns="repeat(auto-fill, minmax(270px, 1fr))"
        spacing={4}
      >
        {products.map((p) => (
          <React.Fragment key={p.ID}>
            {renderItem ? renderItem(p) : <ProductCard product={p} />}
          </React.Fragment>
        ))}
      </SimpleGrid>
      {products.length === 0 && (
        <Center h="20vh">
          <Heading as="h2" size="md">
            No products found
          </Heading>
        </Center>
      )}
    </>
  );
};

export default ProductList;
