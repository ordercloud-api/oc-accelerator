import { Heading, SimpleGrid, Spinner, Center, Box } from "@chakra-ui/react";
import {
  BuyerProduct,
  Me,
  ListPageWithFacets,
} from "ordercloud-javascript-sdk";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import ProductCard from "./ProductCard";
import FilterSearchMenu, {
  ServiceListOptions,
} from "../shared/FilterSearchMenu";
import { parse } from "querystring";
import Pagination from "../shared/pagination/Pagination";

export interface ProductListProps {
  renderItem?: (product: BuyerProduct) => JSX.Element;
}

const ProductList: FunctionComponent<ProductListProps> = ({ renderItem }) => {
  const { catalogId, categoryId } = useParams<{
    catalogId: string;
    categoryId: string;
  }>();
  const [productList, setProductList] =
    useState<ListPageWithFacets<BuyerProduct>>();
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = useMemo(() => {
    return Number(searchParams.get("page")) || 1;
  }, [searchParams]);

  const getProducts = useCallback(async () => {
    setLoading(true);
    const search = searchParams.get("search") || undefined;

    try {
      const result = await Me.ListProducts({
        catalogID: catalogId,
        categoryID: categoryId,
        filters: {}, // Add filters as needed
        pageSize: 20, // Adjust as needed
        page: currentPage, 
        search,
      });
      setProductList(result);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [catalogId, categoryId, currentPage, searchParams]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleRoutingChange = useCallback(
    (queryKey: string, resetPage?: boolean) =>
      (value?: string | boolean | number) => {
        const searchParams = new URLSearchParams(location.search);
        const hasPageParam = Boolean(searchParams.get("page"));
        const prevValue = searchParams.get(queryKey);
        if (!value && !prevValue) return;
        if (value) {
          if (prevValue !== value) {
            searchParams.set(queryKey, value.toString());
            if (hasPageParam && resetPage) searchParams.delete("page"); // reset page on filter change
          }
        } else if (prevValue) {
          searchParams.delete(queryKey);
        }

        navigate(
          { pathname: location.pathname, search: searchParams.toString() },
          { state: { shallow: true } }
        );
      },
    [location.pathname, location.search, navigate]
  );

  const listOptions = useMemo(() => {
    return parse(location.search.slice(1)) as ServiceListOptions;
  }, [location.search]);

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Box m={5}>
        <FilterSearchMenu
          listOptions={listOptions}
          handleRoutingChange={handleRoutingChange}
        />
      </Box>
      <SimpleGrid
        py={12}
        gridTemplateColumns="repeat(auto-fill, minmax(270px, 1fr))"
        spacing={4}
      >
        {productList?.Items?.map((p) => (
          <React.Fragment key={p.ID}>
            {renderItem ? renderItem(p) : <ProductCard product={p} />}
          </React.Fragment>
        ))}
      </SimpleGrid>
      {productList?.Items?.length === 0 && (
        <Center h="20vh">
          <Heading as="h2" size="md">
            No products found
          </Heading>
        </Center>
      )}
      {productList?.Meta?.TotalPages && productList.Meta.TotalPages > 1 && (
        <Center>
          <Pagination
            page={currentPage}
            totalPages={productList.Meta.TotalPages}
            onChange={handleRoutingChange("page")}
          />
        </Center>
      )}
    </>
  );
};

export default ProductList;
