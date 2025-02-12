import { Center, Heading, SimpleGrid, Spinner } from "@chakra-ui/react";
import { Category } from "ordercloud-javascript-sdk";
import React, { FunctionComponent, useMemo } from "react";
import { useParams } from "react-router-dom";
import CategoryCard from "./CategoryCard";
import { useOcResourceList } from "@ordercloud/react-sdk";

export interface CategoryListProps {
  renderItem?: (category: Category) => JSX.Element;
}

const CategoryList: FunctionComponent<CategoryListProps> = ({ renderItem }) => {
  const { catalogId, categoryId } = useParams<{
    catalogId: string;
    categoryId?: string;
  }>();
  const { data, isLoading } = useOcResourceList<Category>(
    "Me.Categories",
    { catalogId, ParentID: categoryId },
    {},
    {
      staleTime: 300000,
      disabled: !catalogId,
    }
  );

  const categories = useMemo(() => data?.Items, [data]);

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" thickness="10px" />
      </Center>
    );
  }

  if (categories?.length === 0) {
    return (
      <Center h="50vh">
        <Heading color="chakra-subtle-color">No categories found</Heading>
      </Center>
    );
  }

  return (
    <SimpleGrid
      py={12}
      gridTemplateColumns="repeat(auto-fill, minmax(270px, 1fr))"
      spacing={4}
    >
      {categories?.map((category) => (
        <React.Fragment key={category.ID}>
          {renderItem ? (
            renderItem(category)
          ) : (
            <CategoryCard category={category} catalogId={catalogId} />
          )}
        </React.Fragment>
      ))}
    </SimpleGrid>
  );
};

export default CategoryList;
