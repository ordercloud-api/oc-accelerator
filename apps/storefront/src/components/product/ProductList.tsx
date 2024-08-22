import {
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  Box,
  Grid,
  GridItem,
} from "@chakra-ui/react";
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
import FilterSearchMenu, { ServiceListOptions } from "../shared/search/SearchMenu";
import { parse } from "querystring";
import Pagination from "../shared/pagination/Pagination";
import FacetList from "./facets/FacetList";

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

  const searchTerm = useMemo(() => {
    return searchParams.get("search") || undefined;
  }, [searchParams]);

  const currentPage = useMemo(() => {
    return Number(searchParams.get("page")) || 1;
  }, [searchParams]);

  const filters = useMemo(() => {
    const filtersObj = {} as { [key: string]: string | string[] };
    for (const key of searchParams.keys()) {
      if (!["search", "page", "pageSize"].includes(key)) {
        filtersObj[key] = searchParams.getAll(key);
      }
      searchParams.getAll(key);
    }
    return filtersObj;
  }, [searchParams]);

  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await Me.ListProducts({
        catalogID: catalogId,
        categoryID: categoryId,
        filters,
        pageSize: 20, // Adjust as needed
        page: currentPage,
        search: searchTerm,
      });
      setProductList(result);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [catalogId, categoryId, currentPage, filters, searchTerm]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleRoutingChange = useCallback(
    (queryKey: string, resetPage?: boolean, index?: number) =>
      (value?: string | boolean | number) => {
        const searchParams = new URLSearchParams(location.search);
        const hasPageParam = Boolean(searchParams.get("page"));
        const isFilterParam = !["search", "page", "pageSize"].includes(
          queryKey
        );

        // filters can have multiple values for one key i.e. SpecCount > 0 AND SpecCount < 2
        const prevValue = isFilterParam
          ? searchParams.getAll(queryKey)
          : searchParams.get(queryKey);
        if (!value && !prevValue) return;
        if (value) {
          if (!isFilterParam && prevValue !== value) {
            searchParams.set(queryKey, value.toString());
          } else if (isFilterParam) {
            prevValue?.includes(value.toString())
              ? searchParams.delete(queryKey, value.toString())
              : searchParams.append(queryKey, value.toString());
          }
          if (hasPageParam && resetPage) searchParams.delete("page"); // reset page on filter change
        } else if (prevValue) {
          searchParams.delete(
            queryKey,
            index !== undefined ? prevValue[index] : undefined
          );
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
      <Grid
        templateAreas={`"search search"
                  "facets main"`}
        gridTemplateRows={"75px 1fr 30px"}
        gridTemplateColumns="300px 1fr"
        gap="1"
        color="blackAlpha.700"
        fontWeight="bold"
      >
        <GridItem pl="2" area={"search"}>
          <Box m={5}>
            <FilterSearchMenu
              listOptions={listOptions}
              handleRoutingChange={handleRoutingChange}
            />
          </Box>
        </GridItem>
        <GridItem pl="2" area={"facets"}>
          <FacetList
            facets={productList?.Meta?.Facets}
            onChange={handleRoutingChange}
          />
        </GridItem>
        <GridItem pl="2" area={"main"}>
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
          {productList?.Items && productList.Items.length === 0 && (
            <Center h="20vh">
              <Heading as="h2" size="md">
                No products found
              </Heading>
            </Center>
          )}
        </GridItem>
      </Grid>
      {!!productList?.Meta?.TotalPages && productList.Meta.TotalPages > 1 && (
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
