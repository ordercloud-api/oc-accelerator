import { Heading, SimpleGrid } from "@chakra-ui/react";
import { Categories, Category } from "ordercloud-javascript-sdk";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import CategoryCard from "./CategoryCard";

export interface CategoryListProps {
  renderItem?: (category: Category) => JSX.Element;
  catalogId?: string;
}

const CategoryList: FunctionComponent<CategoryListProps> = ({
  renderItem,
  catalogId,
}) => {
  const [categories, setCategories] = useState<Category[]>();

  const getCategories = useCallback(async () => {
    if (!catalogId) return; // Ensure catalogId is defined
    const result = await Categories.List(catalogId);
    setCategories(result?.Items);
  }, [catalogId]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

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
        Browse Categories
      </Heading>
      <SimpleGrid
        gridTemplateColumns="repeat(auto-fit, minmax(270px, 1fr))"
        spacing={4}
      >
        {categories &&
          categories?.map((c) => (
            <React.Fragment key={c.ID}>
              {renderItem ? renderItem(c) : <CategoryCard category={c} />}
            </React.Fragment>
          ))}
      </SimpleGrid>
    </>
  );
};

export default CategoryList;